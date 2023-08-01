import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "tsconfig-paths/register";

import "@atixlabs/hardhat-time-n-mine";

import { HardhatUserConfig } from "hardhat/config";

import networks from "./hardhat.networks";
import { EthGasReporterConfig } from "hardhat-gas-reporter/dist/src/types";

const config: HardhatUserConfig & { gasReporter: EthGasReporterConfig } = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
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
