'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface BattleResultsProps {
  battle: {
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
  }
  winnerInfo?: {
    winner: string
    participant1Votes: number
    participant2Votes: number
    isCompleted: boolean
  }
  contractAddress?: string
  onClose?: () => void
  showFullScreen?: boolean
}

export function BattleResults({
  battle,
  winnerInfo,
  contractAddress,
  onClose,
  showFullScreen = false
}: BattleResultsProps) {
  const isParticipant1Winner = winnerInfo?.winner === battle.participant1_wallet
  const isParticipant2Winner = winnerInfo?.winner === battle.participant2_wallet
  const hasWinner = battle.winner_wallet || winnerInfo?.winner

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const durationMs = end.getTime() - start.getTime()
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const content = (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">
          BATTLE RESULTS
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete battle summary and winner announcement
        </p>
      </div>

      {/* Battle Overview */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">
            🎯 Battle Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Battle ID</p>
              <p className="font-mono text-sm">{battle.id.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Status</p>
              <Badge variant={battle.status === 'completed' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                {battle.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Total Votes</p>
              <p className="text-2xl font-bold text-primary">{battle.total_votes || (winnerInfo?.participant1Votes || 0) + (winnerInfo?.participant2Votes || 0) || 0}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(battle.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Duration</p>
              <p className="text-sm">{formatDuration(battle.created_at, battle.completed_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Concept */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-600">
            🎨 Battle Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-xl font-medium text-blue-800 italic">
              &ldquo;{battle.concept}&rdquo;
            </p>
            <p className="text-sm text-blue-600 mt-2">
              The creative prompt that inspired both participants
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Final Results */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-600">
            🏁 Final Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Participant 1 */}
            <div className={`relative transition-all duration-1000 ${
              isParticipant1Winner 
                ? 'scale-105 ring-4 ring-yellow-400 ring-opacity-75' 
                : 'opacity-80'
            }`}>
              <Card className={`border-2 ${
                isParticipant1Winner 
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' 
                  : 'border-gray-300'
              }`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl ${
                    isParticipant1Winner ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    Participant 1
                  </CardTitle>
                  {isParticipant1Winner && (
                    <Badge className="bg-yellow-500 text-white text-lg px-4 py-2 mx-auto">
                      🏆 WINNER
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <img
                      src={battle.participant1_image_url || ''}
                      alt="Participant 1"
                      className="w-full h-[300px] object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    {isParticipant1Winner && (
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Wallet Address</p>
                      <p className="font-mono text-sm">
                        {battle.participant1_wallet ? 
                          `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                          'Not joined'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Final Votes</p>
                      <p className="text-3xl font-bold text-foreground">
                        {winnerInfo?.participant1Votes || 0}
                      </p>
                    </div>
                    
                    {battle.participant1_prompt && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Full Prompt:</p>
                        <p className="text-sm italic">
                          &ldquo;{battle.participant1_prompt}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Participant 2 */}
            <div className={`relative transition-all duration-1000 ${
              isParticipant2Winner 
                ? 'scale-105 ring-4 ring-yellow-400 ring-opacity-75' 
                : 'opacity-80'
            }`}>
              <Card className={`border-2 ${
                isParticipant2Winner 
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' 
                  : 'border-gray-300'
              }`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl ${
                    isParticipant2Winner ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    Participant 2
                  </CardTitle>
                  {isParticipant2Winner && (
                    <Badge className="bg-yellow-500 text-white text-lg px-4 py-2 mx-auto">
                      🏆 WINNER
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <img
                      src={battle.participant2_image_url || ''}
                      alt="Participant 2"
                      className="w-full h-[300px] object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    {isParticipant2Winner && (
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Wallet Address</p>
                      <p className="font-mono text-sm">
                        {battle.participant2_wallet ? 
                          `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                          'Not joined'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Final Votes</p>
                      <p className="text-3xl font-bold text-foreground">
                        {winnerInfo?.participant2Votes || 0}
                      </p>
                    </div>
                    
                    {battle.participant2_prompt && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Full Prompt:</p>
                        <p className="text-sm italic">
                          &ldquo;{battle.participant2_prompt}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Verification */}
      {contractAddress && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">
              ⛓️ Blockchain Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-6 rounded-lg space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-green-600 mb-4">On-Chain Results</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Contract:</strong> {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Battle ID:</strong> {battle.id}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Network:</strong> Monad Testnet (Chain ID: 10143)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://testnet.monadexplorer.com/address/${contractAddress}`, '_blank')}
                  className="mt-4"
                >
                  View on Monad Explorer
                </Button>
              </div>
              
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ✅ All results are publicly verifiable on the blockchain
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Winner determined by smart contract on Monad testnet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battle Statistics */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-purple-600">
            📊 Battle Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {battle.total_votes || (winnerInfo?.participant1Votes || 0) + (winnerInfo?.participant2Votes || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {battle.participant1_wallet && battle.participant2_wallet ? '2' : '1'}
              </p>
              <p className="text-sm text-muted-foreground">Participants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {formatDuration(battle.created_at, battle.completed_at).split('m')[0]}m
              </p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {hasWinner ? '1' : '0'}
              </p>
              <p className="text-sm text-muted-foreground">Winner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg px-8 py-3"
          >
            Close Results
          </Button>
        </div>
      )}
    </div>
  )

  if (showFullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-6xl">
          <Card className="border-4 border-gold-500 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
            <CardContent className="pt-6">
              {content}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-primary">
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  )
}
