// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// Minimal interface for ENS Name Wrapper (L1 subnames).
/// Docs: https://docs.ens.domains/wrapper/creating-subname-registrar/
interface INameWrapper {
    /**
     * Creates a subname and sets resolver in one tx.
     * Caller must be approved by the parent owner (setApprovalForAll).
     */
    function setSubnodeRecord(
        bytes32 parentNode,
        string calldata label,
        address owner,
        address resolver,
        uint64 ttl,
        uint32 fuses,
        uint64 expiry
    ) external returns (bytes32 node);

    /**
     * Returns the expiry timestamp of a wrapped name.
     * Used to cap subname expiry to parent expiry.
     */
    function expiryOf(bytes32 node) external view returns (uint64);
}
