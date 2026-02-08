// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../CashbackIdRegistrar.sol";

/**
 * Deploy CashbackIdRegistrar to Ethereum Mainnet.
 *
 * Prerequisites:
 *   - forge install foundry-rs/forge-std
 *   - Pass deployer key via: --private-key $PRIVATE_KEY (EOA with ETH for gas)
 *
 * Dry-run (estimate gas, no broadcast):
 *   forge script script/DeployCashbackIdRegistrar.s.sol:DeployCashbackIdRegistrarScript \
 *     --rpc-url https://eth.llamarpc.com -vvvv
 *
 * Deploy to mainnet (key from env):
 *   export PRIVATE_KEY=$(grep '^PRIVATE_KEY=' ../.env | cut -d= -f2-)
 *   forge script script/DeployCashbackIdRegistrar.s.sol:DeployCashbackIdRegistrarScript \
 *     --rpc-url <MAINNET_RPC> --broadcast --private-key $PRIVATE_KEY
 *
 * Gas: typical deploy ~350k–450k gas. At 30 gwei, ~0.013–0.017 ETH (~$27–35 @ $2000/ETH).
 */
contract DeployCashbackIdRegistrarScript is Script {
    address constant NAME_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
    address constant PUBLIC_RESOLVER = 0xF29100983E058B709F3D539b0c765937B804AC15;
    bytes32 constant PARENT_NODE = 0xBC246139204AAAA7457FF8281BBEC8CC5A5B09011B9E095572F979AFEBFABAEA;
    uint64 constant DEFAULT_EXPIRY = 1809846971; // parent expiry from wrap tx; subnames capped to this

    function run() external {
        // Key from CLI: forge script ... --broadcast --private-key $PRIVATE_KEY
        vm.startBroadcast();

        CashbackIdRegistrar registrar = new CashbackIdRegistrar(
            NAME_WRAPPER,
            PUBLIC_RESOLVER,
            PARENT_NODE,
            DEFAULT_EXPIRY
        );

        vm.stopBroadcast();

        console.log("CashbackIdRegistrar deployed at:", address(registrar));
        console.log("Next: from 0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217 call");
        console.log("  NameWrapper(0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401).setApprovalForAll(address(registrar), true)");
    }
}
