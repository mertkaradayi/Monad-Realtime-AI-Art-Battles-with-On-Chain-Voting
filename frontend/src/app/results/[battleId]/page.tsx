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
import { BattleResults } from '@/components/BattleResults'
import { 
  useWinnerInfo,
  useVoteCounts
} from '@/hooks/useContract'

// Note: dynamic route is handled at runtime; no static params exported in client page

interface Battle {
  id: string
  concept: string
  status: string
  created_at: string
  completed_at?: string
  creator_wallet: string
  participant1_wallet: string | null
  participant2_wallet: string | null
  participant1_prompt: string | null
  participant2_prompt: string | null
  participant1_image_url: string | null
  participant2_image_url: string | null
  total_votes: number
  winner_wallet: string | null
  voting_qr_data: string | null
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

export default function BattleResultsPage() {
  const { ready, authenticated } = usePrivy()
  const params = useParams()
  const battleId = params.battleId as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Contract hooks
  const contractAddress = contractInfo?.contractAddress
  const { data: winnerInfo } = useWinnerInfo(contractAddress || '', battleId)
  const { 
    participant1Votes, 
    participant2Votes, 
    totalVotes, 
    isLoading: isVoteCountsLoading
  } = useVoteCounts(contractAddress || '', battleId)

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
      }
    } catch (err) {
      console.error('Error fetching contract info:', err)
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
          <p className="text-muted-foreground">Loading battle results...</p>
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
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if battle is completed or has results
  const hasResults = battle.status === 'completed' || battle.winner_wallet || winnerInfo?.isCompleted

  if (!hasResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-lg font-semibold mb-2">Battle Not Completed Yet</h3>
                    <p className="text-muted-foreground">
                      This battle is still in progress. Current status: <strong>{battle.status}</strong>
                    </p>
                  </div>
                  
                  {battle.status === 'voting' && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        The battle is currently in the voting phase. Results will be available once voting is complete.
                      </p>
                      <Button 
                        onClick={() => window.location.href = `/vote/${battleId}`}
                        className="w-full"
                      >
                        View Voting Page
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/'}
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
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
            🏆 Battle Results
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete battle summary and winner announcement
          </p>
        </div>

        {/* Battle Results */}
        <BattleResults
          battle={battle}
          winnerInfo={winnerInfo ? {
            winner: winnerInfo.winner,
            participant1Votes: winnerInfo.participant1Votes,
            participant2Votes: winnerInfo.participant2Votes,
            isCompleted: winnerInfo.isCompleted
          } : undefined}
          contractAddress={contractInfo?.contractAddress}
        />

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
          {battle.status === 'voting' && (
            <Button 
              onClick={() => window.location.href = `/vote/${battleId}`}
            >
              View Voting Page
            </Button>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
