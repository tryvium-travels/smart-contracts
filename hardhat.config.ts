import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "tsconfig-paths/register";

import "@atixlabs/hardhat-time-n-mine";

import { HardhatUserConfig } from "hardhat/config";

import networks from "./hardhat.networks";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS || false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  networks,
};

export default config;
