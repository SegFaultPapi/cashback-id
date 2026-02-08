// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ens/INameWrapper.sol";

/**
 * Subname Registrar for cashbackid.eth.
 *
 * Prerequisites (see https://docs.ens.domains/web/subdomains and
 * https://docs.ens.domains/wrapper/creating-subname-registrar/):
 * 1. Parent "cashbackid.eth" must be WRAPPED in the ENS Name Wrapper.
 * 2. Owner of cashbackid.eth (0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217) must call
 *    nameWrapper.setApprovalForAll(address(this), true).
 *
 * Mainnet (https://docs.ens.domains/learn/deployments):
 *   Name Wrapper: 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401
 *   Public Resolver: 0xF29100983E058B709F3D539b0c765937B804AC15
 */
contract CashbackIdRegistrar {
    INameWrapper public immutable nameWrapper;
    address public immutable defaultResolver;

    /// namehash of "cashbackid.eth" (pass in constructor; e.g. from viem: namehash('cashbackid.eth'))
    bytes32 public immutable parentNode;

    address public owner;

    /// Default expiry for new subnames (e.g. 2 years). Name Wrapper will cap to parent expiry.
    uint64 public defaultExpiry;

    /// Fuses: 0 = no fuses. (65536 = CAN_EXTEND_EXPIRY requiere que el padre esté Locked/CANNOT_UNWRAP.)
    uint32 public constant SUBNAME_FUSES = 0;

    event SubnameRegistered(string label, string fullName, address indexed owner);
    event OwnerUpdated(address indexed previousOwner, address indexed newOwner);
    event DefaultExpiryUpdated(uint64 previousExpiry, uint64 newExpiry);

    error OnlyOwner();
    error LabelEmpty();
    error LabelInvalid();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(
        address _nameWrapper,
        address _defaultResolver,
        bytes32 _parentNode,
        uint64 _defaultExpiry
    ) {
        nameWrapper = INameWrapper(_nameWrapper);
        defaultResolver = _defaultResolver;
        parentNode = _parentNode;
        defaultExpiry = _defaultExpiry;
        owner = msg.sender;
    }

    /**
     * Register a subdomain for yourself. Anyone can call this (FIFS).
     * Full name: label.cashbackid.eth. You become the owner of the wrapped subname.
     */
    function register(string calldata label) external returns (bytes32 node) {
        if (bytes(label).length == 0) revert LabelEmpty();
        if (!_isValidLabel(label)) revert LabelInvalid();

        node = nameWrapper.setSubnodeRecord(
            parentNode,
            label,
            msg.sender,
            defaultResolver,
            0,
            SUBNAME_FUSES,
            defaultExpiry
        );

        emit SubnameRegistered(label, string(abi.encodePacked(label, ".cashbackid.eth")), msg.sender);
        return node;
    }

    /**
     * Register a subdomain and assign to a specific address (only contract owner).
     * Use from backend to assign on behalf of a user.
     */
    function registerFor(string calldata label, address registrant) external onlyOwner returns (bytes32 node) {
        if (bytes(label).length == 0) revert LabelEmpty();
        if (!_isValidLabel(label)) revert LabelInvalid();

        node = nameWrapper.setSubnodeRecord(
            parentNode,
            label,
            registrant,
            defaultResolver,
            0,
            SUBNAME_FUSES,
            defaultExpiry
        );

        emit SubnameRegistered(label, string(abi.encodePacked(label, ".cashbackid.eth")), registrant);
        return node;
    }

    function setOwner(address newOwner) external onlyOwner {
        address previous = owner;
        owner = newOwner;
        emit OwnerUpdated(previous, newOwner);
    }

    function setDefaultExpiry(uint64 newExpiry) external onlyOwner {
        uint64 previous = defaultExpiry;
        defaultExpiry = newExpiry;
        emit DefaultExpiryUpdated(previous, newExpiry);
    }

    /// Label: only lowercase alphanumeric and hyphen
    function _isValidLabel(string calldata label) internal pure returns (bool) {
        bytes memory b = bytes(label);
        if (b.length > 64) return false;
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            if (c >= 0x61 && c <= 0x7A) continue; // a-z
            if (c >= 0x30 && c <= 0x39) continue; // 0-9
            if (c == 0x2D) continue; // -
            return false;
        }
        return true;
    }
}
