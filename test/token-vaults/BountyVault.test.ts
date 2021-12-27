import { expect, use } from "chai";
import { ethers, waffle } from "hardhat";

import { BountyVault, TestToken } from "@/typechain-types";
import { Signer } from "ethers";

const { utils } = ethers;
const { solidity } = waffle;

use(solidity);

describe("token-vaults/BountyVault tests", () => {
    const max_supply = utils.parseEther("1800000000");
    
    let owner_wallet : Signer;
    let external_wallet : Signer;

    let test_vault: BountyVault;
    let test_token: TestToken;

    before(async () => {
        [ owner_wallet, external_wallet ] = await ethers.getSigners(); 
    });

    beforeEach(async () => {
        const token_vault_factory = await ethers.getContractFactory("BountyVault", owner_wallet);
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

    it("Should airdrop correctly if called meeting pre-requisites (owner, reason)", async() => {
        const reason = "Testing if airdrop works";
        const destination_addresses = ["0x000000000000000000000000000000000000dEaD"];
        const amount = 1000;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        const tx = await test_vault_from_owner.airdropTokens(test_token.address, amount, destination_addresses, reason);
        await tx.wait();

        expect(await test_token.balanceOf(test_vault.address)).to.equal(max_supply.sub(amount), "Must have less tokens after the transfer");
    });

    it("Should revert when trying to airdrop from an external wallet", async() => {
        const reason = "Testing if airdrop works";
        const destination_addresses = ["0x000000000000000000000000000000000000dEaD"];
        const amount = 1000;

        const test_vault_from_external = test_vault.connect(external_wallet);
        await expect(test_vault_from_external.airdropTokens(test_token.address, amount, destination_addresses, reason)).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it("Should revert when trying to airdrop a zero amount", async() => {
        const reason = "Testing if airdrop works";
        const destination_addresses = ["0x000000000000000000000000000000000000dEaD"];
        const amount = 0;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        await expect(test_vault_from_owner.airdropTokens(test_token.address, amount, destination_addresses, reason)).to.be.revertedWith("TokenVault: token amount to transfer should be > 0")
    });

    it("Should revert when trying to airdrop without a reason", async() => {
        const reason = ""; // empty reason
        const destination_addresses = ["0x000000000000000000000000000000000000dEaD"];
        const amount = 0;

        const test_vault_from_owner = test_vault.connect(owner_wallet);
        await expect(test_vault_from_owner.airdropTokens(test_token.address, amount, destination_addresses, reason)).to.be.revertedWith("TokenVault: you must specify a reason for your token transfer out of the vault")
    });
});