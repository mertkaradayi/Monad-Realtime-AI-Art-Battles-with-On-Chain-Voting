// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BattleVoting.sol";

/**
 * @title DeployBattleVoting
 * @dev Deployment script for BattleVoting contract on Monad testnet
 */
contract DeployBattleVoting is Script {
    function run() external {
        // Retrieve private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the BattleVoting contract
        BattleVoting battleVoting = new BattleVoting();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log the deployed contract address
        console.log("BattleVoting deployed to:", address(battleVoting));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Network: Monad Testnet (Chain ID: 10143)");
        
        // Save deployment info to file for backend integration
        string memory deploymentInfo = string(abi.encodePacked(
            "BATTLE_VOTING_CONTRACT_ADDRESS=",
            vm.toString(address(battleVoting)),
            "\nDEPLOYER_ADDRESS=",
            vm.toString(vm.addr(deployerPrivateKey)),
            "\nDEPLOYMENT_BLOCK=",
            vm.toString(block.number),
            "\nDEPLOYMENT_TIMESTAMP=",
            vm.toString(block.timestamp),
            "\nNETWORK=monad_testnet",
            "\nCHAIN_ID=10143"
        ));
        
        vm.writeFile("deployment.env", deploymentInfo);
        console.log("Deployment info saved to deployment.env");
    }
}
