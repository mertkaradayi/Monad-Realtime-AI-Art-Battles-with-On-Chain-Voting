import { ethers } from 'ethers';

// BattleVoting Contract ABI - extracted from the compiled contract
export const BATTLE_VOTING_ABI = [
  // Events
  "event BattleCreated(string indexed battleId, string concept, address indexed participant1, address indexed participant2, address creator, uint256 votingEndTime)",
  "event VoteCast(string indexed battleId, address indexed voter, address indexed participant, uint256 timestamp)",
  "event BattleCompleted(string indexed battleId, address indexed winner, uint256 participant1Votes, uint256 participant2Votes)",
  "event VotingExtended(string indexed battleId, uint256 newEndTime)",

  // Functions
  "function createBattle(string memory battleId, string memory concept, address participant1, address participant2, string memory participant1Prompt, string memory participant2Prompt, string memory participant1ImageUrl, string memory participant2ImageUrl, uint256 votingDuration) external",
  "function castVote(string memory battleId, address participant) external",
  "function completeBattle(string memory battleId) external",
  "function extendVoting(string memory battleId, uint256 additionalTime) external",
  "function getBattle(string memory battleId) external view returns (tuple(string battleId, string concept, address participant1, address participant2, string participant1Prompt, string participant2Prompt, string participant1ImageUrl, string participant2ImageUrl, uint256 totalVotes, uint256 participant1Votes, uint256 participant2Votes, address winner, bool isActive, uint256 votingEndTime, address creator))",
  "function getBattleVotes(string memory battleId) external view returns (tuple(address voter, address participant, uint256 timestamp)[])",
  "function hasVoterVoted(string memory battleId, address voter) external view returns (bool)",
  "function getVoterTotalVotes(address voter) external view returns (uint256)",
  "function isVotingActive(string memory battleId) external view returns (bool)",
  "function getVotingTimeRemaining(string memory battleId) external view returns (uint256)"
] as const;

// Monad Testnet configuration
export const MONAD_TESTNET = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  blockExplorer: 'https://testnet.monadexplorer.com'
};

// Contract interface types
export interface BattleInfo {
  battleId: string;
  concept: string;
  participant1: string;
  participant2: string;
  participant1Prompt: string;
  participant2Prompt: string;
  participant1ImageUrl: string;
  participant2ImageUrl: string;
  totalVotes: number;
  participant1Votes: number;
  participant2Votes: number;
  winner: string;
  isActive: boolean;
  votingEndTime: number;
  creator: string;
}

export interface VoteInfo {
  voter: string;
  participant: string;
  timestamp: number;
}

// Contract interaction utilities
export class BattleVotingContract {
  public contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(contractAddress: string, provider: ethers.Provider, signer?: ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, BATTLE_VOTING_ABI, provider);
    this.provider = provider;
    this.signer = signer || null;
  }

  // Set signer for write operations
  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = this.contract.connect(signer) as ethers.Contract;
  }

  // Read operations (no signer required)
  async getBattle(battleId: string): Promise<BattleInfo> {
    const battle = await this.contract.getBattle(battleId);
    return {
      battleId: battle.battleId,
      concept: battle.concept,
      participant1: battle.participant1,
      participant2: battle.participant2,
      participant1Prompt: battle.participant1Prompt,
      participant2Prompt: battle.participant2Prompt,
      participant1ImageUrl: battle.participant1ImageUrl,
      participant2ImageUrl: battle.participant2ImageUrl,
      totalVotes: Number(battle.totalVotes),
      participant1Votes: Number(battle.participant1Votes),
      participant2Votes: Number(battle.participant2Votes),
      winner: battle.winner,
      isActive: battle.isActive,
      votingEndTime: Number(battle.votingEndTime),
      creator: battle.creator
    };
  }

  async hasVoterVoted(battleId: string, voterAddress: string): Promise<boolean> {
    return await this.contract.hasVoterVoted(battleId, voterAddress);
  }

  async isVotingActive(battleId: string): Promise<boolean> {
    return await this.contract.isVotingActive(battleId);
  }

  async getVotingTimeRemaining(battleId: string): Promise<number> {
    const timeRemaining = await this.contract.getVotingTimeRemaining(battleId);
    return Number(timeRemaining);
  }

  async getBattleVotes(battleId: string): Promise<VoteInfo[]> {
    const votes = await this.contract.getBattleVotes(battleId);
    return votes.map((vote: any) => ({
      voter: vote.voter,
      participant: vote.participant,
      timestamp: Number(vote.timestamp)
    }));
  }

  // Write operations (require signer)
  async castVote(battleId: string, participantAddress: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for voting');
    }

    const contractWithSigner = this.contract.connect(this.signer);
    return await (contractWithSigner as any).castVote(battleId, participantAddress);
  }

  async completeBattle(battleId: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for completing battle');
    }

    const contractWithSigner = this.contract.connect(this.signer);
    return await (contractWithSigner as any).completeBattle(battleId);
  }

  async extendVoting(battleId: string, additionalTime: number): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for extending voting');
    }

    const contractWithSigner = this.contract.connect(this.signer);
    return await (contractWithSigner as any).extendVoting(battleId, additionalTime);
  }

  // Event listeners
  onVoteCast(callback: (battleId: string, voter: string, participant: string, timestamp: number) => void) {
    this.contract.on('VoteCast', (battleId, voter, participant, timestamp) => {
      callback(battleId, voter, participant, Number(timestamp));
    });
  }

  onBattleCompleted(callback: (battleId: string, winner: string, participant1Votes: number, participant2Votes: number) => void) {
    this.contract.on('BattleCompleted', (battleId, winner, participant1Votes, participant2Votes) => {
      callback(battleId, winner, Number(participant1Votes), Number(participant2Votes));
    });
  }

  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Provider utilities
export const createProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrl);
};

export const createWallet = (privateKey: string, provider: ethers.Provider): ethers.Wallet => {
  return new ethers.Wallet(privateKey, provider);
};

// Gas estimation utilities
export const estimateGasForVote = async (
  contract: BattleVotingContract,
  battleId: string,
  participantAddress: string
): Promise<bigint> => {
  try {
    const gasEstimate = await (contract.contract as any).estimateGas.castVote(battleId, participantAddress);
    // Add 20% buffer for gas estimation
    return gasEstimate * BigInt(120) / BigInt(100);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return a default gas limit if estimation fails
    return BigInt(200000);
  }
};

// Transaction utilities
export const waitForTransaction = async (
  tx: ethers.TransactionResponse,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> => {
  const receipt = await tx.wait(confirmations);
  if (!receipt) {
    throw new Error('Transaction receipt not found');
  }
  return receipt;
};

// Error handling utilities
export const parseContractError = (error: any): string => {
  if (error.code === 'CALL_EXCEPTION') {
    // Parse revert reason from contract
    const reason = error.reason || error.message;
    if (reason.includes('Address has already voted')) {
      return 'You have already voted in this battle';
    }
    if (reason.includes('Voting is not active')) {
      return 'Voting is not active for this battle';
    }
    if (reason.includes('Voting period has ended')) {
      return 'Voting period has ended';
    }
    if (reason.includes('Invalid participant address')) {
      return 'Invalid participant address';
    }
    if (reason.includes('Battle does not exist')) {
      return 'Battle does not exist';
    }
    return reason || 'Contract call failed';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for gas';
  }
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction would fail - check your inputs';
  }
  
  return error.message || 'Unknown error occurred';
};
