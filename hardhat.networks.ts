

import { NetworksUserConfig } from "hardhat/types";

const networks : NetworksUserConfig = {
    hardhat: {
        forking: {
            url: process.env.ETH_INFURA_RPC_URL! || "",
        },
    },
};

if (process.env.ETH_INFURA_RPC_URL && process.env.MAINNET_PRIVATE_KEY) {
    networks.mainnet = {
        url: process.env.ETH_INFURA_RPC_URL,
        chainId: 1,
        gasPrice: 30000000000,
        accounts: [process.env.MAINNET_PRIVATE_KEY],
    };
}

if (process.env.BSC_RPC_URL && process.env.BSC_PRIVATE_KEY) {
    networks.bsc = {
        url: process.env.BSC_RPC_URL,
        chainId: 56,
        gasPrice: 10000000000,
        accounts: [process.env.BSC_PRIVATE_KEY],
    };
}

if (process.env.KOVAN_RPC_URL && process.env.KOVAN_PRIVATE_KEY) {
    networks.kovan = {
        url: process.env.KOVAN_RPC_URL,
        chainId: 42,
        gasPrice: 1000000000,
        accounts: [process.env.KOVAN_PRIVATE_KEY],
    };
}

if (process.env.MATIC_RPC_URL && process.env.MATIC_PRIVATE_KEY) {
    networks.matic = {
        url: process.env.MATIC_RPC_URL,
        chainId: 137,
        gasPrice: 1000000000,
        accounts: [process.env.MATIC_PRIVATE_KEY],
    };
}

if (process.env.KOVAN_OPTIMISTIC_RPC_URL && process.env.KOVAN_OPTIMISTIC_PRIVATE_KEY) {
    networks['kovan-optimistic'] = {
        url: process.env.KOVAN_OPTIMISTIC_RPC_URL,
        chainId: 69,
        gasPrice: 15000000,
        accounts: [process.env.KOVAN_OPTIMISTIC_PRIVATE_KEY],
        ovm: true,
    };
}

if (process.env.OPTIMISTIC_RPC_URL && process.env.OPTIMISTIC_PRIVATE_KEY) {
    networks.optimistic = {
        url: process.env.OPTIMISTIC_RPC_URL,
        chainId: 10,
        gasPrice: 15000000,
        accounts: [process.env.OPTIMISTIC_PRIVATE_KEY],
        ovm: true,
    };
}

export default networks;
