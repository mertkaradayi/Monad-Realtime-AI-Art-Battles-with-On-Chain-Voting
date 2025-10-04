import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/config.js';
import { Battle } from '../database/types/database.js';

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
      const contractsDir = process.cwd() + '/contracts';
      const deployCommand = `cd ${contractsDir} && forge script script/DeployBattleVoting.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast`;

      console.log('📝 Executing deployment command...');
      const { stdout, stderr } = await execAsync(deployCommand, {
        env: {
          ...process.env,
          PRIVATE_KEY: process.env.PRIVATE_KEY,
          MONAD_TESTNET_RPC: process.env.MONAD_TESTNET_RPC,
        },
      });

      if (stderr && !stderr.includes('note')) {
        console.error('Deployment stderr:', stderr);
      }

      console.log('📋 Deployment output:', stdout);

      // Parse deployment info from the generated deployment.env file
      const deploymentInfo = await this.parseDeploymentInfo(contractsDir);
      
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
   * Parse deployment information from the generated deployment.env file
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
      votingDuration: 24 * 60 * 60, // 24 hours in seconds
    };

    // For now, we'll return the contract address and parameters
    // In a full implementation, this would interact with the contract via web3
    console.log('📝 Battle parameters prepared for contract:', battleParams);
    console.log('📍 Contract Address:', this.contractAddress);
    
    return this.contractAddress;
  }

  /**
   * Generate QR code data for voting
   */
  static generateVotingQRData(battle: Battle): string {
    if (!this.contractAddress) {
      throw new Error('Contract not deployed. Please deploy the contract first.');
    }

    const votingData = {
      contractAddress: this.contractAddress,
      battleId: battle.id,
      concept: battle.concept,
      participant1: battle.participant1_wallet,
      participant2: battle.participant2_wallet,
      participant1ImageUrl: battle.participant1_image_url,
      participant2ImageUrl: battle.participant2_image_url,
      network: 'monad_testnet',
      chainId: 10143,
      explorerUrl: `https://testnet.monadexplorer.com/address/${this.contractAddress}`,
      votingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vote/${battle.id}`,
    };

    return JSON.stringify(votingData);
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
- Duration: 24 hours
- One vote per address per battle
- Winner determined by most votes
    `.trim();
  }
}
