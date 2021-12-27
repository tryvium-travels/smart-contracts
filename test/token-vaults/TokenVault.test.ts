import { expect, use } from "chai";
import { ethers, waffle } from "hardhat";

import { TokenVault, TestToken } from "@/typechain-types";
import { Signer } from "ethers";

const { utils } = ethers;
const { solidity } = waffle;

use(solidity);

describe("token-vaults/TokenVault tests", () => {
    const max_supply = utils.parseEther("1800000000");

    let owner_wallet : Signer;
    let external_wallet : Signer;

    let test_vault: TokenVault;
    let test_token: TestToken;

    const dead_address = "0x000000000000000000000000000000000000dEaD";

    before(async () => {
        [ owner_wallet, external_wallet ] = await ethers.getSigners();
    })

    beforeEach(async () => {
        const token_vault_factory = await ethers.getContractFactory("TokenVault", owner_wallet);
        test_vault = await token_vault_factory.deploy();

        const test_token_factory = await ethers.getContractFactory("TestToken", owner_wallet);
        test_token = await test_token_factory.deploy(
            "Test Token",
            "TST",
            max_supply,
            test_vault.address,
        );
    });

    it("Should set owner correctly", async () => {
        expect(await test_vault.owner()).to.equal(await owner_wallet.getAddress(), "Should have correct owner");
    });

    it("Should have balance correctly assigned", async () => {
        expect(await test_token.balanceOf(test_vault.address)).to.equal(max_supply, "Should have correct balance (max_supply)");
    });

    it("Should transfer correctly if called meeting pre-requisites (owner, reason)", async() => {
        const reason = "Testing if transfer works";
        const amount = 1000;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        const tx = await test_vault_from_owner.transferTokens(test_token.address, amount, dead_address, reason);
        await tx.wait();

        expect(await test_token.balanceOf(test_vault.address)).to.equal(max_supply.sub(amount), "Must have less tokens after the transfer");
    });

    it("Should revert when trying to transfer from an external wallet", async() => {
        const reason = "Testing if transfer works";
        const amount = 1000;

        const test_vault_from_external = test_vault.connect(external_wallet);
        await expect(test_vault_from_external.transferTokens(test_token.address, amount, dead_address, reason)).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it("Should revert when trying to transfer a zero amount", async() => {
        const reason = "Testing if transfer works";
        const amount = 0;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        await expect(test_vault_from_owner.transferTokens(test_token.address, amount, dead_address, reason)).to.be.revertedWith("TokenVault: token amount to transfer should be > 0")
    });

    it("Should revert when trying to transfer without a reason", async() => {
        const reason = ""; // empty reason
        const amount = 0;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        await expect(test_vault_from_owner.transferTokens(test_token.address, amount, dead_address, reason)).to.be.revertedWith("TokenVault: you must specify a reason for your token transfer out of the vault")
    });

    it("Should reject all incoming value transfers", async() => {
        const reverting_tx = {
            to: test_vault.address,
            value: 5,
        };

        await expect(owner_wallet.sendTransaction(reverting_tx), "Should refuse all pure transfers").to.be.revertedWith("TokenVault: Cannot accept pure value incoming transfers");
    });
});