import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/config.js';
import { Battle } from '../database/types/database.js';
import { QRGeneratorService } from './qr-generator.js';

const execAsync = promisify(exec);

export interface ContractDeploymentResult {
  contractAddress: string;
  deployerAddress: string;
  deploymentBlock: number;
  deploymentTimestamp: number;
  network: string;
  chainId: number;
}

export interface BattleVotingParams {
  battleId: string;
  concept: string;
  participant1: string;
  participant2: string;
  participant1Prompt: string;
  participant2Prompt: string;
  participant1ImageUrl: string;
  participant2ImageUrl: string;
  votingDuration: number; // in seconds
}

export class ContractDeploymentService {
  private static contractAddress: string | null = null;
  private static deploymentInfo: ContractDeploymentResult | null = null;

  /**
   * Deploy the BattleVoting contract to Monad testnet
   */
  static async deployContract(): Promise<ContractDeploymentResult> {
    try {
      console.log('🚀 Starting BattleVoting contract deployment to Monad testnet...');

      // Check if we have the required environment variables
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is required for contract deployment');
      }

      if (!process.env.MONAD_TESTNET_RPC) {
        throw new Error('MONAD_TESTNET_RPC environment variable is required for contract deployment');
      }

      // Change to contracts directory and deploy
      // The contracts directory is at the root level, not in backend
      const contractsDir = process.cwd().replace('/backend', '') + '/contracts';
      const forgePath = '/Users/imertkaradayi/.foundry/bin/forge';
      
      console.log('📝 Executing deployment command...');
      
      // Ensure PRIVATE_KEY is in the correct format (with 0x prefix for forge)
      let privateKey = process.env.PRIVATE_KEY;
      if (privateKey && !privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      
      const deployCommand = `cd ${contractsDir} && PRIVATE_KEY="${privateKey}" MONAD_TESTNET_RPC="${process.env.MONAD_TESTNET_RPC}" ${forgePath} script script/DeployBattleVoting.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast`;
      
      const { stdout, stderr } = await execAsync(deployCommand, {
        env: {
          ...process.env,
          PRIVATE_KEY: privateKey,
          MONAD_TESTNET_RPC: process.env.MONAD_TESTNET_RPC,
        },
      });

      if (stderr && !stderr.includes('note')) {
        console.error('Deployment stderr:', stderr);
      }

      console.log('📋 Deployment output:', stdout);

      // Parse deployment info from the console output
      const deploymentInfo = this.parseDeploymentInfoFromOutput(stdout);
      
      this.contractAddress = deploymentInfo.contractAddress;
      this.deploymentInfo = deploymentInfo;

      console.log('✅ Contract deployed successfully!');
      console.log('📍 Contract Address:', deploymentInfo.contractAddress);
      console.log('🔗 Network: Monad Testnet (Chain ID: 10143)');
      console.log('🌐 Explorer: https://testnet.monadexplorer.com/address/' + deploymentInfo.contractAddress);

      return deploymentInfo;
    } catch (error) {
      console.error('❌ Contract deployment failed:', error);
      throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse deployment information from the console output
   */
  private static parseDeploymentInfoFromOutput(output: string): ContractDeploymentResult {
    try {
      
      // Try to extract contract address from the console.log output
      const contractAddressMatch = output.match(/BattleVoting deployed to:\s*(0x[a-fA-F0-9]{40})/);
      const deployerAddressMatch = output.match(/Deployer address:\s*(0x[a-fA-F0-9]{40})/);
      
      if (!contractAddressMatch || !deployerAddressMatch) {
        console.error('❌ Could not find contract address or deployer address in output');
        console.error('📋 Available output:', output);
        throw new Error('Contract address or deployer address not found in output');
      }
      
      const contractAddress = contractAddressMatch[1];
      const deployerAddress = deployerAddressMatch[1];
      
      // Try to extract deployment info from the structured output
      const deploymentInfoMatch = output.match(/=== DEPLOYMENT INFO ===\n([\s\S]*?)\n=== END DEPLOYMENT INFO ===/);
      
      const deploymentInfo: Partial<ContractDeploymentResult> = {
        contractAddress,
        deployerAddress,
        network: 'monad_testnet',
        chainId: 10143
      };
      
      if (deploymentInfoMatch) {
        const deploymentInfoText = deploymentInfoMatch[1];
        const lines = deploymentInfoText.split('\n');
        
        for (const line of lines) {
          const [key, value] = line.split('=');
          if (key && value) {
            switch (key) {
              case 'DEPLOYMENT_BLOCK':
                deploymentInfo.deploymentBlock = parseInt(value);
                break;
              case 'DEPLOYMENT_TIMESTAMP':
                deploymentInfo.deploymentTimestamp = parseInt(value);
                break;
            }
          }
        }
      }

      // Set default values if not found
      if (!deploymentInfo.deploymentBlock) {
        deploymentInfo.deploymentBlock = 0; // Will be updated when we can get the actual block
      }
      if (!deploymentInfo.deploymentTimestamp) {
        deploymentInfo.deploymentTimestamp = Math.floor(Date.now() / 1000);
      }

      return deploymentInfo as ContractDeploymentResult;
    } catch (error) {
      console.error('❌ Failed to parse deployment info from output:', error);
      throw new Error(`Failed to parse deployment info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse deployment information from the generated deployment.env file (legacy method)
   */
  private static async parseDeploymentInfo(contractsDir: string): Promise<ContractDeploymentResult> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const deploymentEnvPath = path.join(contractsDir, 'deployment.env');
      
      if (!fs.existsSync(deploymentEnvPath)) {
        throw new Error('Deployment info file not found. Contract deployment may have failed.');
      }

      const deploymentEnvContent = fs.readFileSync(deploymentEnvPath, 'utf-8');
      const lines = deploymentEnvContent.split('\n');
      
      const deploymentInfo: Partial<ContractDeploymentResult> = {};
      
      for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
          switch (key) {
            case 'BATTLE_VOTING_CONTRACT_ADDRESS':
              deploymentInfo.contractAddress = value;
              break;
            case 'DEPLOYER_ADDRESS':
              deploymentInfo.deployerAddress = value;
              break;
            case 'DEPLOYMENT_BLOCK':
              deploymentInfo.deploymentBlock = parseInt(value);
              break;
            case 'DEPLOYMENT_TIMESTAMP':
              deploymentInfo.deploymentTimestamp = parseInt(value);
              break;
            case 'NETWORK':
              deploymentInfo.network = value;
              break;
            case 'CHAIN_ID':
              deploymentInfo.chainId = parseInt(value);
              break;
          }
        }
      }

      // Validate required fields
      if (!deploymentInfo.contractAddress || !deploymentInfo.deployerAddress) {
        throw new Error('Invalid deployment info: missing required fields');
      }

      return deploymentInfo as ContractDeploymentResult;
    } catch (error) {
      console.error('❌ Failed to parse deployment info:', error);
      throw new Error(`Failed to parse deployment info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the deployed contract address
   */
  static getContractAddress(): string | null {
    return this.contractAddress;
  }

  /**
   * Get deployment information
   */
  static getDeploymentInfo(): ContractDeploymentResult | null {
    return this.deploymentInfo;
  }

  /**
   * Check if contract is deployed
   */
  static isDeployed(): boolean {
    return this.contractAddress !== null;
  }

  /**
   * Create a battle on the deployed contract
   */
  static async createBattleOnContract(battle: Battle): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract not deployed. Please deploy the contract first.');
    }

    if (!battle.participant1_wallet || !battle.participant2_wallet) {
      throw new Error('Battle must have both participants to create on contract');
    }

    if (!battle.participant1_prompt || !battle.participant2_prompt) {
      throw new Error('Battle must have both prompts to create on contract');
    }

    if (!battle.participant1_image_url || !battle.participant2_image_url) {
      throw new Error('Battle must have both images to create on contract');
    }

    // Prepare contract parameters
    const battleParams: BattleVotingParams = {
      battleId: battle.id,
      concept: battle.concept,
      participant1: battle.participant1_wallet,
      participant2: battle.participant2_wallet,
      participant1Prompt: battle.participant1_prompt,
      participant2Prompt: battle.participant2_prompt,
      participant1ImageUrl: battle.participant1_image_url,
      participant2ImageUrl: battle.participant2_image_url,
      votingDuration: 2 * 60, // 2 minutes in seconds
    };

    console.log('📝 Creating battle on contract with parameters:', battleParams);
    console.log('📍 Contract Address:', this.contractAddress);

    try {
      // Import ethers for contract interaction
      const { ethers } = await import('ethers');
      
      // Create provider and wallet
      if (!process.env.PRIVATE_KEY || !process.env.MONAD_TESTNET_RPC) {
        throw new Error('Missing required environment variables: PRIVATE_KEY or MONAD_TESTNET_RPC');
      }

      const provider = new ethers.JsonRpcProvider(process.env.MONAD_TESTNET_RPC);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      
      // Contract ABI for createBattle function
      const contractABI = [
        "function createBattle(string memory battleId, string memory concept, address participant1, address participant2, string memory participant1Prompt, string memory participant2Prompt, string memory participant1ImageUrl, string memory participant2ImageUrl, uint256 votingDuration) external"
      ];
      
      // Create contract instance
      const contract = new ethers.Contract(this.contractAddress, contractABI, wallet);
      
      // Call createBattle function
      console.log('🚀 Calling createBattle on contract...');
      const tx = await contract.createBattle(
        battleParams.battleId,
        battleParams.concept,
        battleParams.participant1,
        battleParams.participant2,
        battleParams.participant1Prompt,
        battleParams.participant2Prompt,
        battleParams.participant1ImageUrl,
        battleParams.participant2ImageUrl,
        battleParams.votingDuration
      );
      
      console.log('📋 Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Battle created on contract!');
      console.log('📊 Transaction receipt:', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      
      return this.contractAddress;
      
    } catch (error) {
      console.error('❌ Failed to create battle on contract:', error);
      throw new Error(`Failed to create battle on contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate QR code data for voting
   */
  static async generateVotingQRData(battle: Battle): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract not deployed. Please deploy the contract first.');
    }

    if (!battle.participant1_wallet || !battle.participant2_wallet) {
      throw new Error('Battle must have both participants to generate voting QR');
    }

    // Generate QR code with monad:// payload including contract address and participant info
    return await QRGeneratorService.generateVotingQR(
      battle.id,
      this.contractAddress,
      battle.participant1_wallet,
      battle.participant2_wallet
    );
  }

  /**
   * Get contract interaction instructions
   */
  static getContractInteractionInstructions(battle: Battle): string {
    if (!this.contractAddress) {
      throw new Error('Contract not deployed. Please deploy the contract first.');
    }

    return `
# BattleVoting Contract Interaction

## Contract Information
- **Address**: ${this.contractAddress}
- **Network**: Monad Testnet
- **Chain ID**: 10143
- **Explorer**: https://testnet.monadexplorer.com/address/${this.contractAddress}

## Battle Information
- **Battle ID**: ${battle.id}
- **Concept**: ${battle.concept}
- **Participant 1**: ${battle.participant1_wallet}
- **Participant 2**: ${battle.participant2_wallet}

## How to Vote
1. Connect your wallet to Monad testnet
2. Visit the contract on the explorer
3. Call the \`castVote\` function with:
   - \`battleId\`: "${battle.id}"
   - \`participant\`: Choose either ${battle.participant1_wallet} or ${battle.participant2_wallet}

## Contract Functions
- \`createBattle\`: Create a new battle (only battle creator)
- \`castVote\`: Cast a vote for a participant
- \`getBattle\`: Get battle information
- \`getBattleVotes\`: Get all votes for a battle
- \`completeBattle\`: Complete the battle and determine winner (only battle creator)

## Voting Period
- Duration: 2 minutes
- One vote per address per battle
- Winner determined by most votes
    `.trim();
  }
}
