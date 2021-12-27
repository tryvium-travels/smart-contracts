import { expect, use } from "chai";
import { ethers, waffle } from "hardhat";

import { TokenVault, BountyVault, TryviumToken } from "@/typechain-types";
import { Signer } from "ethers";

const { utils } = ethers;
const { solidity } = waffle;

use(solidity);

describe("TryviumToken tests", () => {
    const max_supply = utils.parseEther("1800000000");

    let external_wallet : Signer;
    let another_external_wallet : Signer;

    let team_vault: TokenVault;
    let bounty_vault: BountyVault;
    let sales_vault: TokenVault;
    let reserved_funds_vault: TokenVault;

    let token: TryviumToken;

    before(async () => {
        [ external_wallet, another_external_wallet ] = await ethers.getSigners();
    });

    beforeEach(async () => {
        const tryvium_token_factory = await ethers.getContractFactory("TryviumToken");
        const token_vault_factory = await ethers.getContractFactory("TokenVault");
        const bounty_vault_factory = await ethers.getContractFactory("BountyVault");

        team_vault = await token_vault_factory.deploy();
        bounty_vault = await bounty_vault_factory.deploy();
        sales_vault = await token_vault_factory.deploy();
        reserved_funds_vault = await token_vault_factory.deploy();

        token = await tryvium_token_factory.deploy(
            max_supply,
            team_vault.address,
            bounty_vault.address,
            sales_vault.address,
            reserved_funds_vault.address,
        );
    });

    it("Assigns correctly the vault addresses on deploy", async () => {
        expect(await token.TEAM_VAULT()).to.equal(team_vault.address, "Should assign the correct team vault address");
        expect(await token.BOUNTY_VAULT()).to.equal(bounty_vault.address, "Should assign the correct bounty vault address");
        expect(await token.SALES_VAULT()).to.equal(sales_vault.address, "Should assign the correct token sales vault address");
        expect(await token.RESERVED_FUNDS_VAULT()).to.equal(reserved_funds_vault.address, "Should assign the correct future developments vault address");
    });

    it("Assigns the correct token max supply on deploy", async () => {
        expect(await token.totalSupply()).to.equal(max_supply, "Should have the correct token supply");
    });

    it("Cannot mint over the max supply", async () => {
        await expect(token.mint(team_vault.address, 1)).to.be.revertedWith("ERC20Capped: cap exceeded");
    });

    it("Can mint under the max supply", async () => {
        const tx = await team_vault.transferTokens(token.address, 1000, await external_wallet.getAddress(), "Testing");
        await tx.wait();

        const token_from_external_wallet = token.connect(external_wallet);
        await expect(token_from_external_wallet.burn(1)).not.to.be.reverted;

        await token.mint(await external_wallet.getAddress(), 1);
    });

    it("Assigns the correct initial balances for all vaults on deploy", async () => {
        expect(await token.balanceOf(team_vault.address)).to.equal(max_supply.div(10));
        expect(await token.balanceOf(bounty_vault.address)).to.equal(max_supply.div(10));
        expect(await token.balanceOf(sales_vault.address)).to.equal(max_supply.div(10).mul(6));
        expect(await token.balanceOf(reserved_funds_vault.address)).to.equal(max_supply.div(10).mul(2));
    });

    it("Transfer adds amount to destination account", async () => {
        let tx = await team_vault.transferTokens(token.address, 1000, await external_wallet.getAddress(), "Testing");
        await tx.wait();

        const token_from_external_wallet = token.connect(external_wallet);

        const balance_before_transfer = await token.balanceOf(await external_wallet.getAddress());
        
        tx = await token_from_external_wallet.transfer(await another_external_wallet.getAddress(), 10);
        await tx.wait();

        const balance_after_transfer = await token.balanceOf(await external_wallet.getAddress());

        expect(balance_after_transfer.add(10)).to.equal(balance_before_transfer);
    });

    it("Transfer emits event", async () => {
        let tx = await team_vault.transferTokens(token.address, 1000, await external_wallet.getAddress(), "Testing");
        await tx.wait();
        
        const token_from_external_wallet = token.connect(external_wallet);
        await expect(token_from_external_wallet.transfer(await another_external_wallet.getAddress(), 7))
            .to.emit(token_from_external_wallet, "Transfer")
            .withArgs(await external_wallet.getAddress(), await another_external_wallet.getAddress(), 7);
    });

    it("Can not transfer above the amount", async () => {
        let tx = await team_vault.transferTokens(token.address, 1000, await external_wallet.getAddress(), "Testing");
        await tx.wait();

        const token_from_external_wallet = token.connect(external_wallet);
        await expect(token_from_external_wallet.transfer(reserved_funds_vault.address, max_supply)).to.be.reverted;
    });

    it("Can not transfer from empty account", async () => {
        const token_from_external_wallet = token.connect(external_wallet);
        await expect(token_from_external_wallet.transfer(reserved_funds_vault.address, 1))
            .to.be.reverted;
    });

    it("Should be able to burn own tokens", async () => {
        let tx = await team_vault.transferTokens(token.address, 1000, await external_wallet.getAddress(), "Testing");
        await tx.wait();

        const token_from_external_wallet = token.connect(external_wallet);
        const balance_before_burn = await token.balanceOf(await external_wallet.getAddress());
        
        tx = await token_from_external_wallet.burn(10);
        await tx.wait();

        const balance_after_burn = await token.balanceOf(await external_wallet.getAddress());

        expect(balance_after_burn.add(10)).to.equal(balance_before_burn);
    });

    it("Should be able to burn tokens from allowance", async () => {
        let tx = await team_vault.transferTokens(token.address, 1000, await another_external_wallet.getAddress(), "Testing");
        await tx.wait();

        const token_from_external_wallet = token.connect(external_wallet);
        const token_from_another_external_wallet = token.connect(another_external_wallet);
        
        await expect(token_from_external_wallet.burnFrom(await another_external_wallet.getAddress(), 10), "Should not be able to burn without allowance").to.be.reverted;

        tx = await token_from_another_external_wallet.approve(await external_wallet.getAddress(), 10);
        await tx.wait();

        const balance_before_burn = await token.balanceOf(await another_external_wallet.getAddress());

        tx = await token_from_external_wallet.burnFrom(await another_external_wallet.getAddress(), 10);
        await tx.wait();
        
        const balance_after_burn = await token.balanceOf(await another_external_wallet.getAddress());

        expect(balance_after_burn.add(10)).to.equal(balance_before_burn);
    });
});