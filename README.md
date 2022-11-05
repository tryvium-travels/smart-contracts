![smart-contracts logo](assets/logo.png)

![GitHub](https://img.shields.io/github/license/tryvium-travels/smart-contracts-development-template?style=flat-square)
![Twitter Follow](https://img.shields.io/twitter/follow/tryviumtravels?style=social)

# Tryvium Smart Contracts Repository

The Tryvium Smart Contracts repository, based on Waffle, Typescript and Hardhat used to create decentralized projects from a solid base.

# So, what can you find here?

You can find all contracts implemented by Tryvium Travels LTD. Here what we currently developed:

| Directory          | Link      | Description              |
|--------------------|-----------|--------------------------|
| `contracts` folder | [contracts](./contracts) | The code of the Tryvium Travels LTD contracts |
| `test` folder | [test](./test) | The code of the Tryvium Travels LTD contracts' tests |
| `scripts` folder | [scripts](./scripts) | The code of the Tryvium Travels LTD deploy scripts |

# Usage

First of all you need to install the dependencies

``` bash
yarn install
```

Then you can add your solidity smart contracts to the [`contracts`](./contracts) directory and the contract tests to the [`test`](./test) directory.

Finally, you can build your contracts using

``` bash
yarn build
```

and you can test them using [`hardhat`](https://hardhat.org/guides/waffle-testing.html).

``` bash
yarn hardhat test
```

Finally, you can create a flatten version of all the contracts using the command

``` bash 
yarn flatten
```

You can also run mythril security tests using the command:

``` bash
yarn run mythril-security-checks
# or simply
yarn mythril-security-checks
```

This project is powered by [`waffle`](https://getwaffle.io), [`Typescript`](https://www.typescriptlang.org) and [`hardhat`](https://hardhat.org).

Please, see the details of the scripts in [`package.json` file](package.json).

# Running tests in VSCode UI

> The content comes from [this page](https://hardhat.org/guides/vscode-tests.html).

You can run your tests from [Visual Studio Code](https://code.visualstudio.com) by using one of its Mocha integration extensions. We recommend using [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter).

### Making TypeScript tests work

Running tests written in TypeScript from [Visual Studio Code](https://code.visualstudio.com) requires you to set the vscode option `"mochaExplorer.files"` to `"test/**/*.{j,t}s"`.

Or simply use the `vscode/settings.json` file from this repository.
