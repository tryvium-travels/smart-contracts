<p align="center">
  <img src="https://i.imgur.com/Fq80eXT.png" height=250 style="margin-left:30px;margin-right:30px;"/> 
</p>

![GitHub](https://img.shields.io/github/license/tryvium-travels/smart-contracts-development-template?style=flat-square)
![Twitter Follow](https://img.shields.io/twitter/follow/tryviumtravels?style=social)

# Tryvium Token Vaults

In here you can find the code describing how our token vaults work.

| Smart Contract(s) | Link      | Description              |
|-------------------|-----------|--------------------------|
| TokenVault        | [TokenVault.sol](./TokenVault.sol) | The code of the Tryvium Token generic vault |
| Token Vaults      | [BountyVault.sol](./BountyVault.sol) | The code of the Tryvium Token bounty vault, which adds airdrop capability |

## Why use a contract to handle the tokens?

There is a simple reason in that, traceability.

Every transfer out of a vault requires a reason, which must be sent and will be registered.

In this way, by simply scanning for the Vault events, you will find at every moment how we
spent the TRYVIUM TOKENS inside each vault.

## Testnet deploys

| Smart Contract(s)               | Blockchain                    | Address + Explorer link  |
|---------------------------------|-------------------------------|--------------------------|
| TeamVault (TokenVault)          | Binance Smart Chain (Testnet) | [0x4E8b22Ad29DBD59279402fCe02C74803f1Ac7B51](https://testnet.bscscan.com/address/0x4e8b22ad29dbd59279402fce02c74803f1ac7b51) |
| BountyVault (BountyVault)       | Binance Smart Chain (Testnet) | [0x0B1F4C3A8Ef65dC745e2d104fB7c451696a5B4F1](https://testnet.bscscan.com/address/0x0b1f4c3a8ef65dc745e2d104fb7c451696a5b4f1) |
| SalesVault (TokenVault)         | Binance Smart Chain (Testnet) | [0xdb72dad450a4ca3d02eddee7c9d16363b82aa07e](https://testnet.bscscan.com/address/0xdb72dad450a4ca3d02eddee7c9d16363b82aa07e) |
| ReservedFundsVault (TokenVault) | Binance Smart Chain (Testnet) | [0xd35c88975e1223E7666F8Bf49495223a42012EF6](https://testnet.bscscan.com/address/0xd35c88975e1223e7666f8bf49495223a42012ef6) |

## Mainnet deploys

| Smart Contract(s)               | Blockchain          | Address + Explorer link  |
|---------------------------------|---------------------|--------------------------|
| TeamVault (TokenVault)          | Binance Smart Chain | [0x027f1e1a1D4C36b383e490DA919c7f895AFe3c89](https://bscscan.com/address/0x027f1e1a1D4C36b383e490DA919c7f895AFe3c89) |
| BountyVault (BountyVault)       | Binance Smart Chain | [0xc48B0868DF84436C6624De4859aeec6A87f805A3](https://bscscan.com/address/0xc48B0868DF84436C6624De4859aeec6A87f805A3) |
| SalesVault (TokenVault)         | Binance Smart Chain | [0x74157B38ec19e823Ea4501b0d169533B33418392](https://bscscan.com/address/0x74157B38ec19e823Ea4501b0d169533B33418392) |
| ReservedFundsVault (TokenVault) | Binance Smart Chain | [0x741523F00B1a2575D670d367F587c7C027f29762](https://bscscan.com/address/0x741523F00B1a2575D670d367F587c7C027f29762) |
