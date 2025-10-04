import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import React from 'react';
import { 
  BattleVotingContract, 
  createProvider, 
  estimateGasForVote,
  waitForTransaction,
  parseContractError,
  type BattleInfo,
  type VoteInfo,
  type WinnerInfo,
  type AutoCompleteInfo
} from '@/lib/contracts';

// Hook for contract interactions
export const useContract = (contractAddress: string) => {
  const { user, getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  
  const provider = createProvider();
  
  // Only create contract if we have a valid address
  const contract = React.useMemo(() => {
    if (!contractAddress || contractAddress.trim() === '') {
      return null;
    }
    return new BattleVotingContract(contractAddress, provider);
  }, [contractAddress, provider]);

  // Set up signer if user is connected
  React.useEffect(() => {
    const setupSigner = async () => {
      if (user?.wallet?.address && contractAddress && contract) {
        try {
          // Get the Privy wallet signer
          const privyWallet = user.wallet;
          
          // Create a proper signer from Privy wallet
          if (privyWallet && (privyWallet as any).ethereum) {
            // Create signer from ethereum provider
            const ethersProvider = new ethers.BrowserProvider((privyWallet as any).ethereum);
            const signer = await ethersProvider.getSigner();
            contract.setSigner(signer);
          }
        } catch (error) {
          console.error('Failed to setup wallet signer:', error);
        }
      }
    };

    setupSigner();
  }, [user?.wallet?.address, contractAddress, contract]);

  return {
    contract,
    provider,
    isConnected: !!user?.wallet?.address,
    userAddress: user?.wallet?.address,
    isContractReady: !!contract
  };
};

// Hook for fetching battle information
export const useBattleInfo = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['battleInfo', contractAddress, battleId],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return contract.getBattle(battleId);
    },
    enabled: !!contractAddress && !!battleId && isContractReady,
    refetchInterval: 3000, // Poll every 3 seconds
    staleTime: 1000,
  });
};

// Hook for checking if user has voted
export const useHasVoted = (contractAddress: string, battleId: string, userAddress?: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['hasVoted', contractAddress, battleId, userAddress],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return contract.hasVoterVoted(battleId, userAddress!);
    },
    enabled: !!contractAddress && !!battleId && !!userAddress && isContractReady,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 2000,
  });
};

// Hook for checking voting status with 45-second countdown
export const useVotingStatus = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['votingStatus', contractAddress, battleId],
    queryFn: async () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      
      const [isActive, timeRemaining] = await Promise.all([
        contract.isVotingActive(battleId),
        contract.getVotingTimeRemaining(battleId)
      ]);
      
      // Use 2 minutes as the voting duration for demo purposes
      const votingDuration = 120; // 2 minutes (120 seconds)
      const countdownTime = Math.min(timeRemaining, votingDuration);
      
      // Voting is only active if contract says it's active AND countdown > 0
      const votingIsActive = isActive && countdownTime > 0;
      
      return { 
        isActive: votingIsActive, 
        timeRemaining: countdownTime,
        votingDuration,
        votingEnded: !votingIsActive && countdownTime === 0
      };
    },
    enabled: !!contractAddress && !!battleId && isContractReady,
    refetchInterval: 1000, // Poll every 1 second for countdown
    staleTime: 500,
  });
};

// Hook for fetching battle votes
export const useBattleVotes = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['battleVotes', contractAddress, battleId],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return contract.getBattleVotes(battleId);
    },
    enabled: !!contractAddress && !!battleId && isContractReady,
    refetchInterval: 3000, // Poll every 3 seconds
    staleTime: 1000,
  });
};

// Hook for casting votes
export const useCastVote = (contractAddress: string, battleId: string) => {
  const { contract, isConnected, userAddress, isContractReady } = useContract(contractAddress);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantAddress: string) => {
      if (!isConnected || !userAddress) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !isContractReady) {
        throw new Error('Contract not ready');
      }

      // Estimate gas first
      const gasEstimate = await estimateGasForVote(contract, battleId, participantAddress);
      
      // Cast the vote
      const tx = await contract.castVote(battleId, participantAddress);
      
      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx, 1);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['hasVoted', contractAddress, battleId, userAddress] });
      queryClient.invalidateQueries({ queryKey: ['battleVotes', contractAddress, battleId] });
    },
    onError: (error) => {
      console.error('Vote casting failed:', error);
    }
  });
};

// Hook for completing battles
export const useCompleteBattle = (contractAddress: string, battleId: string) => {
  const { contract, isConnected, isContractReady } = useContract(contractAddress);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !isContractReady) {
        throw new Error('Contract not ready');
      }

      const tx = await contract.completeBattle(battleId);
      const receipt = await waitForTransaction(tx, 1);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    },
    onSuccess: () => {
      // Invalidate and refetch battle info
      queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['votingStatus', contractAddress, battleId] });
    },
    onError: (error) => {
      console.error('Battle completion failed:', error);
    }
  });
};

// Hook for auto-completing battle when countdown ends
export const useAutoCompleteBattle = (contractAddress: string, battleId: string) => {
  const completeBattleMutation = useCompleteBattle(contractAddress, battleId);
  const { data: votingStatus } = useVotingStatus(contractAddress, battleId);

  // Auto-complete when countdown reaches 0
  React.useEffect(() => {
    if (votingStatus && !votingStatus.isActive && votingStatus.timeRemaining === 0) {
      // Only auto-complete if not already completed
      if (!completeBattleMutation.isPending && !completeBattleMutation.isSuccess) {
        console.log('Auto-completing battle after countdown ended');
        completeBattleMutation.mutate();
      }
    }
  }, [votingStatus, completeBattleMutation]);

  return completeBattleMutation;
};

// Hook for auto-completing battle using the new autoCompleteBattle function (Feature 9)
export const useAutoCompleteBattleV2 = (contractAddress: string, battleId: string) => {
  const { contract, isConnected, isContractReady } = useContract(contractAddress);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !isContractReady) {
        throw new Error('Contract not ready');
      }

      const tx = await contract.autoCompleteBattle(battleId);
      const receipt = await waitForTransaction(tx, 1);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    },
    onSuccess: () => {
      // Invalidate and refetch battle info
      queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['votingStatus', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['winnerInfo', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['canAutoComplete', contractAddress, battleId] });
    },
    onError: (error) => {
      console.error('Auto-complete battle failed:', error);
    }
  });
};

// Hook for getting winner information (Feature 9)
export const useWinnerInfo = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['winnerInfo', contractAddress, battleId],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return contract.getWinnerInfo(battleId);
    },
    enabled: !!contractAddress && !!battleId && isContractReady,
    refetchInterval: 3000, // Poll every 3 seconds
    staleTime: 1000,
  });
};

// Hook for checking if battle can be auto-completed (Feature 9)
export const useCanAutoComplete = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['canAutoComplete', contractAddress, battleId],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return contract.canAutoComplete(battleId);
    },
    enabled: !!contractAddress && !!battleId && isContractReady,
    refetchInterval: 1000, // Poll every 1 second for real-time updates
    staleTime: 500,
  });
};

// Hook for extending voting period
export const useExtendVoting = (contractAddress: string, battleId: string) => {
  const { contract, isConnected, isContractReady } = useContract(contractAddress);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (additionalTime: number) => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !isContractReady) {
        throw new Error('Contract not ready');
      }

      const tx = await contract.extendVoting(battleId, additionalTime);
      const receipt = await waitForTransaction(tx, 1);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    },
    onSuccess: () => {
      // Invalidate and refetch voting status
      queryClient.invalidateQueries({ queryKey: ['votingStatus', contractAddress, battleId] });
      queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
    },
    onError: (error) => {
      console.error('Voting extension failed:', error);
    }
  });
};

// Hook for real-time vote count updates
export const useVoteCounts = (contractAddress: string, battleId: string) => {
  const { data: battleInfo, isLoading, error } = useBattleInfo(contractAddress, battleId);
  const { data: votingStatus } = useVotingStatus(contractAddress, battleId);

  return {
    participant1Votes: battleInfo?.participant1Votes || 0,
    participant2Votes: battleInfo?.participant2Votes || 0,
    totalVotes: battleInfo?.totalVotes || 0,
    isLoading,
    error,
    votingEnded: votingStatus?.votingEnded || false
  };
};

// Hook for gas estimation
export const useGasEstimation = (contractAddress: string, battleId: string, participantAddress: string) => {
  const { contract, isContractReady } = useContract(contractAddress);

  return useQuery({
    queryKey: ['gasEstimation', contractAddress, battleId, participantAddress],
    queryFn: () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      return estimateGasForVote(contract, battleId, participantAddress);
    },
    enabled: !!contractAddress && !!battleId && !!participantAddress && isContractReady,
    staleTime: 30000, // Gas estimates are valid for 30 seconds
  });
};

// Hook for real-time vote counting after voting ends
export const useRealTimeVoteCounting = (contractAddress: string, battleId: string) => {
  const { data: votingStatus } = useVotingStatus(contractAddress, battleId);
  const { contract, isContractReady } = useContract(contractAddress);

  // Increase polling frequency after voting ends for real-time counting
  const shouldPollFrequently = votingStatus?.votingEnded || false;

  return useQuery({
    queryKey: ['realTimeVoteCounts', contractAddress, battleId],
    queryFn: async () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      
      // Actually call the contract to get fresh data
      const battleInfo = await contract.getBattle(battleId);
      return {
        participant1Votes: battleInfo.participant1Votes || 0,
        participant2Votes: battleInfo.participant2Votes || 0,
        totalVotes: battleInfo.totalVotes || 0,
        winner: battleInfo.winner,
        isActive: battleInfo.isActive,
        votingEnded: !battleInfo.isActive
      };
    },
    enabled: !!contractAddress && !!battleId && isContractReady && shouldPollFrequently,
    refetchInterval: shouldPollFrequently ? 2000 : false, // Poll every 2 seconds after voting ends
    staleTime: 1000,
  });
};

// Hook for high-frequency vote counting during active voting (Feature 8)
export const useHighFrequencyVoteCounting = (contractAddress: string, battleId: string) => {
  const { data: votingStatus } = useVotingStatus(contractAddress, battleId);
  const { contract, isContractReady } = useContract(contractAddress);

  // High-frequency polling during active voting for real-time updates
  const isVotingActive = votingStatus?.isActive && !votingStatus?.votingEnded;

  return useQuery({
    queryKey: ['highFrequencyVoteCounts', contractAddress, battleId],
    queryFn: async () => {
      if (!contract) {
        throw new Error('Contract not ready');
      }
      
      // Actually call the contract to get fresh data
      const battleInfo = await contract.getBattle(battleId);
      return {
        participant1Votes: battleInfo.participant1Votes || 0,
        participant2Votes: battleInfo.participant2Votes || 0,
        totalVotes: battleInfo.totalVotes || 0,
        isActive: battleInfo.isActive,
        lastUpdated: Date.now()
      };
    },
    enabled: !!contractAddress && !!battleId && isContractReady && isVotingActive,
    refetchInterval: isVotingActive ? 1000 : false, // Poll every 1 second during active voting
    staleTime: 500,
  });
};

// Enhanced event listening for real-time vote updates (Feature 8)
export const useContractEvents = (contractAddress: string, battleId: string) => {
  const { contract, isContractReady } = useContract(contractAddress);
  const queryClient = useQueryClient();

  const setupEventListeners = () => {
    if (!contract || !isContractReady) {
      return;
    }

    // Listen for vote cast events with enhanced real-time updates
    contract.onVoteCast((eventBattleId, voter, participant, timestamp) => {
      if (eventBattleId === battleId) {
        console.log('VoteCast event received:', { voter, participant, timestamp });
        
        // Invalidate all vote-related queries for immediate updates
        queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['battleVotes', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['highFrequencyVoteCounts', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['realTimeVoteCounts', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['voteCounts', contractAddress, battleId] });
        
        // Trigger immediate refetch for real-time updates
        queryClient.refetchQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
      }
    });

    // Listen for battle completion events
    contract.onBattleCompleted((eventBattleId, winner, participant1Votes, participant2Votes) => {
      if (eventBattleId === battleId) {
        console.log('BattleCompleted event received:', { winner, participant1Votes, participant2Votes });
        
        // Invalidate queries when battle is completed
        queryClient.invalidateQueries({ queryKey: ['battleInfo', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['votingStatus', contractAddress, battleId] });
        queryClient.invalidateQueries({ queryKey: ['realTimeVoteCounts', contractAddress, battleId] });
      }
    });
  };

  const cleanupEventListeners = () => {
    if (contract) {
      contract.removeAllListeners();
    }
  };

  return {
    setupEventListeners,
    cleanupEventListeners
  };
};

// Hook for transaction status tracking (Feature 8)
export const useTransactionStatus = () => {
  const [pendingTransactions, setPendingTransactions] = React.useState<Map<string, any>>(new Map());
  const [confirmedTransactions, setConfirmedTransactions] = React.useState<Map<string, any>>(new Map());

  const addPendingTransaction = (txHash: string, transaction: any) => {
    setPendingTransactions(prev => new Map(prev.set(txHash, {
      ...transaction,
      status: 'pending',
      timestamp: Date.now()
    })));
  };

  const confirmTransaction = (txHash: string, receipt: any) => {
    setPendingTransactions(prev => {
      const newPending = new Map(prev);
      newPending.delete(txHash);
      return newPending;
    });
    
    setConfirmedTransactions(prev => new Map(prev.set(txHash, {
      ...receipt,
      status: 'confirmed',
      confirmedAt: Date.now()
    })));
  };

  const getTransactionStatus = (txHash: string) => {
    if (pendingTransactions.has(txHash)) {
      return pendingTransactions.get(txHash);
    }
    if (confirmedTransactions.has(txHash)) {
      return confirmedTransactions.get(txHash);
    }
    return null;
  };

  return {
    pendingTransactions,
    confirmedTransactions,
    addPendingTransaction,
    confirmTransaction,
    getTransactionStatus
  };
};
