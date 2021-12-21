// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @notice This registry allows to register contributions to a crowdsale.
 * @dev In case of Tryvium Travels is made to work in conjunction with the UTS.
 */
contract CrowdsaleRegistry is Ownable, Pausable {
    using SafeMath for uint256;

    /**
     * @notice The mapping of all registered reservedTokens, calculated from
     * contributions and referrals.
     */
    mapping(address => uint256) private reservedTokens;

    /**
     * @notice The list of all contributors to the sale.
     */
    address[] private contributorAddresses;

    /**
     * @notice The mapping between an address and its referred addresses.
     */
    mapping(address => address[]) private referred;

    /**
     * @notice The fixed amount of tokens that will be distributed at a later stage
     * per BUSD contributed.
     */
    uint256 immutable TOKENS_PER_BUSD_BASE;

    /**
     * @notice The fixed amount of tokens that will be distributed as bonus, in a 
     * later stage, per BUSD contributed.
     */
    uint256 immutable TOKENS_PER_BUSD_REFERRAL;

    /**
     * @notice The minimum amount accepted for a contribution.
     */
    uint256 immutable MINIMUM_BUSD_AMOUNT; 

    /**
     * @notice The maximum amount accepted for a contribution.
     */
    uint256 immutable MAXIMUM_BUSD_AMOUNT; 

    /**
     * @notice Deploys a new Crowdsale Registry contract.
     * @dev The specified owner will be the owner of the contract, not the deployer.
     * @param owner The owner of the registry.
     * @param tokensPerBUSDbase The amount of tokens per BUSD that will be registered as "to-be-sent".
     * @param tokensPerBUSDreferral The amount of tokens per BUSD that will be registered as "to-be-sent referral bonus".
     * @param minimumBUSDAmount The minimum amount of BUSD accepted for a contribution.
     * @param maximumBUSDAmount The maximum amount of BUSD accepted for a contribution.
     */
    constructor(
        address owner,
        uint256 tokensPerBUSDbase,
        uint256 tokensPerBUSDreferral,
        uint256 minimumBUSDAmount,
        uint256 maximumBUSDAmount
    ) Ownable() {
        transferOwnership(owner);
        TOKENS_PER_BUSD_BASE = tokensPerBUSDbase;
        TOKENS_PER_BUSD_REFERRAL = tokensPerBUSDreferral;
        MINIMUM_BUSD_AMOUNT = minimumBUSDAmount;
        MAXIMUM_BUSD_AMOUNT = maximumBUSDAmount;
    }

    /**
     * @notice Registers a new contribution in the system.
     */
    function registerContribution(
        address _contributor,
        address _referralAddress,
        uint256 _amount
    ) external onlyOwner whenNotPaused {
        require(_contributor != address(0x0), "CrowdsaleRegistry: contributor cannot be the zero address");
        require(_amount >= MINIMUM_BUSD_AMOUNT, "CrowdsaleRegistry: amount must be greater than the minimum amount accepted");
        require(_amount <= MAXIMUM_BUSD_AMOUNT, "CrowdsaleRegistry: amount must be less than the maximum amount accepted");

        uint256 tokenAmount = _amount.mul(TOKENS_PER_BUSD_BASE);
        bool isReturningContributor = reservedTokens[_contributor] > 0;

        reservedTokens[_contributor] = reservedTokens[_contributor].add(tokenAmount);

        if (_referralAddress != address(0x0)) {
            uint256 referralBonus = _amount.mul(TOKENS_PER_BUSD_REFERRAL);
            if (reservedTokens[_referralAddress] > 0) {
                reservedTokens[_referralAddress] = reservedTokens[_referralAddress].add(referralBonus);
                referred[_referralAddress].push(_contributor);
            }
        }

        if (!isReturningContributor) {
            contributorAddresses.push(_contributor);
        }
    }

    /**
     * @notice Returns the total amount of tokens that will be sent at a later stage
     * of the sale to the sender.
     * @return The total amount of tokens that will be distributed.
     */
    function getReservedTokenAmount() external view returns (uint256) {
        return _getReservedTokenAmountOf(msg.sender);
    }

    /**
     * @notice Returns the total amount of tokens that will be sent at a later stage
     * of the sale to a specified address.
     * @return The total amount of tokens that will be distributed.
     */
    function getReservedTokenAmountOf(address contributor) external view onlyOwner returns (uint256) {
        return _getReservedTokenAmountOf(contributor);
    }

    /**
     * @notice Returns the total amount of tokens that will be sent at a later stage
     * of the sale to a specified address.
     * @dev Function for internal usage.
     * @return The total amount of tokens that will be distributed.
     */
    function _getReservedTokenAmountOf(address contributor) internal view returns (uint256) {
        return reservedTokens[contributor];
    }

    /**
     * @notice Gets the full list of all contributors of the sale.
     * @return The full list of all contributors of the sale.
     */
    function getContributors() external view onlyOwner returns (address[] memory) {
        return contributorAddresses;
    }
}