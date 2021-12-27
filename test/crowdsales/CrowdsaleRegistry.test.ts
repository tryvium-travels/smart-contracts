import { expect, use } from "chai";
import { ethers, waffle } from "hardhat";

import { CrowdsaleRegistry } from "@/typechain-types";
import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "ethers";

const { utils } = ethers;
const { solidity } = waffle;

use(solidity);

describe("crowdsales/CrowdsaleRegistry tests", () => {
  let owner: Signer;
  let contributing_wallet: Signer;
  let referring_wallet: Signer;

  const tokens_per_busd_base = 55;
  const tokens_per_busd_referral = 1;
  const minimum_busd_amount = utils.parseEther("5");
  const maximum_busd_amount = utils.parseEther("100");

  const test_amount = utils.parseEther("50");

  let crowdsale_registry: CrowdsaleRegistry;

  let error_message: string;

  before(async () => {
    [owner, contributing_wallet, referring_wallet] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const crowdsale_registry_factory = await ethers.getContractFactory(
      "CrowdsaleRegistry"
    );

    crowdsale_registry = await crowdsale_registry_factory.deploy(
      await owner.getAddress(),
      tokens_per_busd_base,
      tokens_per_busd_referral,
      minimum_busd_amount,
      maximum_busd_amount
    );
  });

  it("Should set correctly the owner", async () => {
    error_message = "Owner should be the one specified in the constructor";
    expect(await crowdsale_registry.owner(), error_message).to.equal(
      await owner.getAddress()
    );
  });

  it("Should not allow contributions from the zero address", async () => {
    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);

    error_message = "Should be reverted since the amount is below the minimum";
    await expect(
      crowdsale_registry_from_owner.registerContribution(
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        test_amount
      ),
      error_message
    ).to.be.revertedWith(
      "CrowdsaleRegistry: contributor cannot be the zero address"
    );
  });

  it("Should not allow contributions below the minimum", async () => {
    const invalid_amount = utils.parseEther("1");

    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);

    error_message = "Should be reverted since the amount is below the minimum";
    await expect(
      crowdsale_registry_from_owner.registerContribution(
        await contributing_wallet.getAddress(),
        "0x0000000000000000000000000000000000000000",
        invalid_amount
      ),
      error_message
    ).to.be.revertedWith(
      "CrowdsaleRegistry: amount must be greater than the minimum amount accepted"
    );
  });

  it("Should not allow contributions over the maximum", async () => {
    const invalid_amount = utils.parseEther("1000");

    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);

    error_message = "Should be reverted since the amount is over the maximum";
    await expect(
      crowdsale_registry_from_owner.registerContribution(
        await contributing_wallet.getAddress(),
        "0x0000000000000000000000000000000000000000",
        invalid_amount
      ),
      error_message
    ).to.be.revertedWith(
      "CrowdsaleRegistry: amount must be less than the maximum amount accepted"
    );
  });

  it("Should not allow other than the owner to register contributions", async () => {
    error_message = "Should not be reverted since this is the owner";
    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);
    await expect(
      crowdsale_registry_from_owner.registerContribution(
        await contributing_wallet.getAddress(),
        "0x0000000000000000000000000000000000000000",
        test_amount
      ),
      error_message
    ).not.to.be.reverted;

    const crowdsale_registry_from_external =
      crowdsale_registry.connect(contributing_wallet);

    error_message = "Should be reverted since this is not the owner";
    await expect(
      crowdsale_registry_from_external.registerContribution(
        await contributing_wallet.getAddress(),
        "0x0000000000000000000000000000000000000000",
        test_amount
      ),
      error_message
    ).to.be.reverted;
  });

  it("Should register the contributions correctly (no referral)", async () => {
    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);
    const tx = await crowdsale_registry_from_owner.registerContribution(
      await contributing_wallet.getAddress(),
      "0x0000000000000000000000000000000000000000",
      test_amount
    );
    await tx.wait();

    const expected_token_amount = test_amount.mul(tokens_per_busd_base);

    error_message = "Should have reserved the correct amount of tokens";
    expect(
      await crowdsale_registry_from_owner.getReservedTokenAmountOf(
        await contributing_wallet.getAddress()
      )
    ).to.equal(expected_token_amount);
  });

  it("Should register the contributions correctly (referral)", async () => {
    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);
    let tx = await crowdsale_registry_from_owner.registerContribution(
      await contributing_wallet.getAddress(),
      await referring_wallet.getAddress(),
      test_amount
    );
    await tx.wait();

    let expected_token_amount = BigNumber.from(0);

    error_message =
      "Should show 0 since the referring wallet did not contribute yet";
    expect(
      await crowdsale_registry_from_owner.getReservedTokenAmountOf(
        await referring_wallet.getAddress()
      ),
      error_message
    ).to.equal(expected_token_amount);

    tx = await crowdsale_registry_from_owner.registerContribution(
      await referring_wallet.getAddress(),
      "0x0000000000000000000000000000000000000000",
      test_amount
    );
    await tx.wait();

    tx = await crowdsale_registry_from_owner.registerContribution(
      await contributing_wallet.getAddress(),
      await referring_wallet.getAddress(),
      test_amount
    );
    await tx.wait();

    expected_token_amount = test_amount
      .mul(tokens_per_busd_base)
      .add(test_amount.mul(tokens_per_busd_referral));

    error_message =
      "Should show the correct amount after referrer contribution";
    expect(
      await crowdsale_registry_from_owner.getReservedTokenAmountOf(
        await referring_wallet.getAddress()
      ),
      error_message
    ).to.equal(expected_token_amount);

    const crowdsale_registry_from_referring =
      crowdsale_registry.connect(referring_wallet);
    error_message =
      "Should show the correct amount after referrer contribution";
    expect(
      await crowdsale_registry_from_referring.getReservedTokenAmount(),
      error_message
    ).to.equal(expected_token_amount);
  });

  it("Should give the correct list of contributors", async () => {
    const crowdsale_registry_from_owner = crowdsale_registry.connect(owner);
    const crowdsale_registry_from_external =
      crowdsale_registry.connect(contributing_wallet);

    let expected_contributors: string[] = [];

    error_message = "Should revert because a non-owner is asking";
    await expect(
      crowdsale_registry_from_external.getContributors(),
      error_message
    ).to.be.reverted;

    error_message =
      "Should not fail and show the correct list of contributors (empty)";
    expect(
      await crowdsale_registry_from_owner.getContributors(),
      error_message
    ).to.have.same.members(expected_contributors);

    let tx = await crowdsale_registry_from_owner.registerContribution(
      await contributing_wallet.getAddress(),
      await referring_wallet.getAddress(),
      test_amount
    );
    await tx.wait();

    expected_contributors.push(await contributing_wallet.getAddress());

    error_message =
      "Should not fail and show the correct list of contributors (one)";
    expect(
      await crowdsale_registry_from_owner.getContributors(),
      error_message
    ).to.have.same.members(expected_contributors);

    tx = await crowdsale_registry_from_owner.registerContribution(
      await contributing_wallet.getAddress(),
      await referring_wallet.getAddress(),
      test_amount
    );
    await tx.wait();

    error_message =
      "Should not fail and show the correct list of contributors (still one)";
    expect(
      await crowdsale_registry_from_owner.getContributors(),
      error_message
    ).to.have.same.members(expected_contributors);

    tx = await crowdsale_registry_from_owner.registerContribution(
      await owner.getAddress(),
      await referring_wallet.getAddress(),
      test_amount
    );
    await tx.wait();

    expected_contributors.push(await owner.getAddress());

    error_message =
      "Should not fail and show the correct list of contributors (two)";
    expect(
      await crowdsale_registry_from_owner.getContributors(),
      error_message
    ).to.have.same.members(expected_contributors);
  });
});
