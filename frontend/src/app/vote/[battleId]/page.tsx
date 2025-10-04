'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { AuthButton } from '@/components/AuthButton'
import { LoginPage } from '@/components/LoginPage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { 
  useBattleInfo, 
  useHasVoted, 
  useVotingStatus, 
  useVoteCounts, 
  useCastVote,
  useContractEvents,
  useGasEstimation,
  useAutoCompleteBattle,
  useRealTimeVoteCounting,
  useHighFrequencyVoteCounting,
  useTransactionStatus
} from '@/hooks/useContract'
import { VoteCounters } from '@/components/AnimatedVoteCounter'
import { TransactionFeed, VotingMetrics } from '@/components/TransactionFeed'
import { parseContractError } from '@/lib/contracts'

interface Battle {
  id: string
  concept: string
  status: 'waiting' | 'active' | 'voting' | 'completed' | 'cancelled' | 'prompts_submitted'
  created_at: string
  creator_wallet: string
  participant1_wallet: string | null
  participant2_wallet: string | null
  participant1_prompt: string | null
  participant2_prompt: string | null
  participant1_image_url: string | null
  participant2_image_url: string | null
  participant1_generation_status: string | null
  participant2_generation_status: string | null
  participant1_generation_started_at: string | null
  participant2_generation_started_at: string | null
  participant1_generation_completed_at: string | null
  participant2_generation_completed_at: string | null
  participant1_generation_error: string | null
  participant2_generation_error: string | null
  image_generation_status: 'pending' | 'generating' | 'completed' | 'failed' | null
  voting_qr_data: string | null
  winner_wallet: string | null
}

interface ContractInfo {
  contractAddress: string
  deploymentInfo: any
  votingQRData: string
  instructions: string
  battle: {
    id: string
    concept: string
    participant1: string
    participant2: string
    participant1ImageUrl: string
    participant2ImageUrl: string
    status: string
    totalVotes: number
    winner: string | null
  }
}

export default function VotePage() {
  const { ready, authenticated, user } = usePrivy()
  const params = useParams()
  const battleId = params.battleId as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Contract hooks
  const contractAddress = contractInfo?.contractAddress
  const userAddress = user?.wallet?.address

  // Use contract hooks when contract address is available
  const { data: onChainBattleInfo, isLoading: isContractLoading } = useBattleInfo(
    contractAddress || '', 
    battleId
  )
  
  const { data: hasVotedOnChain } = useHasVoted(
    contractAddress || '', 
    battleId, 
    userAddress
  )
  
  const { data: votingStatus } = useVotingStatus(
    contractAddress || '', 
    battleId
  )
  
  const { 
    participant1Votes, 
    participant2Votes, 
    totalVotes, 
    isLoading: isVoteCountsLoading,
    votingEnded: voteCountsVotingEnded
  } = useVoteCounts(contractAddress || '', battleId)

  // Real-time vote counting after voting ends
  const { 
    data: realTimeVoteData,
    isLoading: isRealTimeLoading 
  } = useRealTimeVoteCounting(contractAddress || '', battleId)

  // High-frequency vote counting during active voting (Feature 8)
  const { 
    data: highFreqVoteData,
    isLoading: isHighFreqLoading 
  } = useHighFrequencyVoteCounting(contractAddress || '', battleId)

  // Transaction status tracking (Feature 8)
  const {
    pendingTransactions,
    confirmedTransactions,
    addPendingTransaction,
    confirmTransaction,
    getTransactionStatus
  } = useTransactionStatus()
  
  const castVoteMutation = useCastVote(contractAddress || '', battleId)
  
  const { setupEventListeners, cleanupEventListeners } = useContractEvents(
    contractAddress || '', 
    battleId
  )

  // Auto-complete battle when countdown ends
  const autoCompleteMutation = useAutoCompleteBattle(contractAddress || '', battleId)

  // Gas estimation for voting
  const { data: gasEstimate1 } = useGasEstimation(
    contractAddress || '', 
    battleId, 
    onChainBattleInfo?.participant1 || ''
  )
  
  const { data: gasEstimate2 } = useGasEstimation(
    contractAddress || '', 
    battleId, 
    onChainBattleInfo?.participant2 || ''
  )

  // Fetch battle details
  useEffect(() => {
    if (battleId && ready) {
      fetchBattle()
    }
  }, [battleId, ready])

  // Fetch contract info when battle is loaded
  useEffect(() => {
    if (battle && battle.status === 'voting') {
      fetchContractInfo()
    }
  }, [battle])

  // Setup contract event listeners when contract is available
  useEffect(() => {
    if (contractAddress) {
      setupEventListeners()
      return () => cleanupEventListeners()
    }
  }, [contractAddress, setupEventListeners, cleanupEventListeners])

  const fetchBattle = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await api.getBattle(battleId)
      
      if (result.success) {
        setBattle(result.data)
      } else {
        setError('Battle not found')
      }
    } catch (err) {
      console.error('Error fetching battle:', err)
      setError('Failed to fetch battle')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContractInfo = async () => {
    try {
      const result = await api.getContractInfo(battleId)
      
      if (result.success) {
        setContractInfo(result.data)
        // TODO: Fetch current vote counts from contract
        // setVoteCounts({ participant1: result.data.participant1Votes, participant2: result.data.participant2Votes })
      }
    } catch (err) {
      console.error('Error fetching contract info:', err)
    }
  }

  const handleVote = async (participant: 1 | 2) => {
    if (!authenticated || !user?.wallet?.address || !contractInfo) {
      toast.error('Please connect your wallet to vote')
      return
    }

    if (hasVotedOnChain) {
      toast.error('You have already voted in this battle')
      return
    }

    if (!votingStatus?.isActive || votingStatus?.votingEnded) {
      toast.error('Voting has ended for this battle')
      return
    }

    try {
      // Get participant address from contract info
      const participantAddress = participant === 1 
        ? onChainBattleInfo?.participant1 
        : onChainBattleInfo?.participant2

      if (!participantAddress) {
        toast.error('Invalid participant address')
        return
      }

      // Cast vote using contract
      const result = await castVoteMutation.mutateAsync(participantAddress)
      
      // Track transaction status (Feature 8)
      addPendingTransaction(result.transactionHash, {
        voter: user.wallet.address,
        participant,
        timestamp: Date.now()
      })
      
      // Confirm transaction when receipt is available
      confirmTransaction(result.transactionHash, {
        gasUsed: result.gasUsed,
        blockNumber: result.blockNumber
      })
      
      toast.success(`🎉 Vote cast for Participant ${participant}!`, {
        description: `Transaction: ${result.transactionHash.slice(0, 10)}...`,
        duration: 5000,
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(`https://testnet.monadexplorer.com/tx/${result.transactionHash}`, '_blank')
        }
      })
      
    } catch (err: any) {
      console.error('Error voting:', err)
      const errorMessage = parseContractError(err)
      toast.error(`Failed to cast vote: ${errorMessage}`)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginPage />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading battle...</p>
        </div>
      </div>
    )
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Battle not found'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (battle.status !== 'voting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                This battle is not in voting phase yet. Current status: {battle.status}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <AuthButton />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            🗳️ On-Chain Voting
          </h1>
          <p className="text-xl text-muted-foreground">
            Vote for your favorite AI-generated art on Monad testnet
          </p>
        </div>

        {/* Battle Concept */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              🎯 Battle Concept
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-center font-medium">
              &ldquo;{battle.concept}&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* Animated Vote Counters (Feature 8) */}
        {contractInfo && (
          <VoteCounters
            participant1Votes={highFreqVoteData?.participant1Votes || realTimeVoteData?.participant1Votes || participant1Votes}
            participant2Votes={highFreqVoteData?.participant2Votes || realTimeVoteData?.participant2Votes || participant2Votes}
            previousParticipant1Votes={participant1Votes}
            previousParticipant2Votes={participant2Votes}
            isVotingActive={votingStatus?.isActive || false}
            participant1Address={onChainBattleInfo?.participant1}
            participant2Address={onChainBattleInfo?.participant2}
            className="mb-8"
          />
        )}

        {/* Voting Interface */}
        {contractInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Participant 1 */}
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600 text-center">
                  Participant 1
                </CardTitle>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {battle.participant1_wallet ? 
                      `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                      'Unknown'
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <img
                    src={battle.participant1_image_url || ''}
                    alt="Participant 1 Generated Image"
                    className="w-full h-[400px] object-cover rounded-lg border-2 border-blue-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white text-lg px-4 py-2">Participant 1</Badge>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {isVoteCountsLoading || isRealTimeLoading ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      `${realTimeVoteData?.participant1Votes || participant1Votes} votes`
                    )}
                  </div>
                  {votingStatus?.votingEnded && (
                    <div className="text-sm text-muted-foreground">
                      📊 Real-time from Monad testnet
                    </div>
                  )}
                  <div className="space-y-2">
                    {gasEstimate1 && (
                      <div className="text-sm text-muted-foreground text-center">
                        Gas: {gasEstimate1.toString()} wei
                      </div>
                    )}
                    <Button
                      onClick={() => handleVote(1)}
                      disabled={castVoteMutation.isPending || hasVotedOnChain || !votingStatus?.isActive || votingStatus?.votingEnded}
                      className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {castVoteMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Voting...
                        </div>
                      ) : hasVotedOnChain ? (
                        'Vote Cast ✓'
                      ) : votingStatus?.votingEnded ? (
                        'Voting Closed'
                      ) : !votingStatus?.isActive ? (
                        'Voting Ended'
                      ) : (
                        'Vote for Participant 1'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participant 2 */}
            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-600 text-center">
                  Participant 2
                </CardTitle>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {battle.participant2_wallet ? 
                      `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                      'Unknown'
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <img
                    src={battle.participant2_image_url || ''}
                    alt="Participant 2 Generated Image"
                    className="w-full h-[400px] object-cover rounded-lg border-2 border-purple-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white text-lg px-4 py-2">Participant 2</Badge>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {isVoteCountsLoading || isRealTimeLoading ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      `${realTimeVoteData?.participant2Votes || participant2Votes} votes`
                    )}
                  </div>
                  {votingStatus?.votingEnded && (
                    <div className="text-sm text-muted-foreground">
                      📊 Real-time from Monad testnet
                    </div>
                  )}
                  <div className="space-y-2">
                    {gasEstimate2 && (
                      <div className="text-sm text-muted-foreground text-center">
                        Gas: {gasEstimate2.toString()} wei
                      </div>
                    )}
                    <Button
                      onClick={() => handleVote(2)}
                      disabled={castVoteMutation.isPending || hasVotedOnChain || !votingStatus?.isActive || votingStatus?.votingEnded}
                      className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {castVoteMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Voting...
                        </div>
                      ) : hasVotedOnChain ? (
                        'Vote Cast ✓'
                      ) : votingStatus?.votingEnded ? (
                        'Voting Closed'
                      ) : !votingStatus?.isActive ? (
                        'Voting Ended'
                      ) : (
                        'Vote for Participant 2'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contract Information */}
        {contractInfo && (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 text-center">
                ⛓️ On-Chain Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Contract Address:</p>
                  <p className="font-mono text-sm break-all">{contractInfo.contractAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Network:</p>
                  <p className="text-sm">Monad Testnet (Chain ID: 10143)</p>
                </div>
              </div>
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://testnet.monadexplorer.com/address/${contractInfo.contractAddress}`, '_blank')}
                >
                  View on Monad Explorer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voting Status with 2-Minute Countdown */}
        {votingStatus && (
          <Card className="border-2 border-orange-500">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-600 text-center">
                ⏰ Voting Status - 2 Minute Countdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Status</p>
                  <Badge variant={votingStatus.isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {votingStatus.isActive ? "Active" : "Ended"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Time Remaining</p>
                  <div className="text-3xl font-bold text-orange-600">
                    {votingStatus.timeRemaining > 0 
                      ? `${votingStatus.timeRemaining}s`
                      : "0s"
                    }
                  </div>
                  {votingStatus.timeRemaining > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(votingStatus.timeRemaining / votingStatus.votingDuration) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Total Votes</p>
                  <p className="text-lg font-bold">
                    {realTimeVoteData?.totalVotes || totalVotes}
                  </p>
                  {votingStatus?.votingEnded && (
                    <p className="text-xs text-green-600 font-semibold">
                      📊 Live from blockchain
                    </p>
                  )}
                </div>
              </div>
              
              {/* Auto-completion status */}
              {autoCompleteMutation.isPending && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Completing battle...</p>
                </div>
              )}
              
              {autoCompleteMutation.isSuccess && (
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-sm font-semibold text-green-600">Battle completed automatically!</p>
                </div>
              )}

              {/* Winner announcement */}
              {votingStatus?.votingEnded && realTimeVoteData?.winner && (
                <div className="text-center p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Winner Announced!</h3>
                  <p className="text-sm text-muted-foreground">
                    Winner: {realTimeVoteData.winner.slice(0, 6)}...{realTimeVoteData.winner.slice(-4)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Final Score: {realTimeVoteData.participant1Votes} - {realTimeVoteData.participant2Votes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction Feed and Metrics (Feature 8) */}
        {contractInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <TransactionFeed
              transactions={[
                ...Array.from(confirmedTransactions.values()).map(tx => ({
                  hash: tx.hash || '',
                  voter: tx.voter || '',
                  participant: tx.participant || 1,
                  status: 'confirmed' as const,
                  timestamp: tx.confirmedAt || Date.now(),
                  gasUsed: tx.gasUsed,
                  blockNumber: tx.blockNumber
                })),
                ...Array.from(pendingTransactions.values()).map(tx => ({
                  hash: tx.hash || '',
                  voter: tx.voter || '',
                  participant: tx.participant || 1,
                  status: 'pending' as const,
                  timestamp: tx.timestamp || Date.now(),
                  gasUsed: undefined,
                  blockNumber: undefined
                }))
              ]}
              maxTransactions={20}
            />
            
            <VotingMetrics
              totalVotes={realTimeVoteData?.totalVotes || totalVotes}
              participant1Votes={realTimeVoteData?.participant1Votes || participant1Votes}
              participant2Votes={realTimeVoteData?.participant2Votes || participant2Votes}
              pendingTransactions={pendingTransactions.size}
              confirmedTransactions={confirmedTransactions.size}
              averageGasUsed={Array.from(confirmedTransactions.values())
                .reduce((sum, tx) => sum + (tx.gasUsed || 0), 0) / Math.max(confirmedTransactions.size, 1)}
            />
          </div>
        )}

        {/* Vote Cast Success */}
        {hasVotedOnChain && (
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <h3 className="text-2xl font-bold text-green-600">Vote Cast Successfully!</h3>
                <p className="text-muted-foreground">
                  Your vote has been recorded on the Monad blockchain. Thank you for participating!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Toaster />
    </div>
  )
}
