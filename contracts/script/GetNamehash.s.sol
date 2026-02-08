// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * Namehash of "cashbackid.eth" for CashbackIdRegistrar constructor.
 * Run in Remix: deploy this contract and call getParentNode().
 *
 * In Node (viem): namehash('cashbackid.eth')
 */
contract GetNamehash {
    function getParentNode() external pure returns (bytes32) {
        // namehash("eth") = keccak256(0x00..00 || keccak256("eth"))
        bytes32 namehashEth = keccak256(abi.encodePacked(bytes32(0), keccak256(bytes("eth"))));
        // namehash("cashbackid.eth") = keccak256(namehashEth || keccak256("cashbackid"))
        return keccak256(abi.encodePacked(namehashEth, keccak256(bytes("cashbackid"))));
    }
}
