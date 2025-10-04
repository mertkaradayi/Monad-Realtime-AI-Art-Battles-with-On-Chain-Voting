'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BattleResults } from './BattleResults'

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
}

interface BattleHistoryProps {
  battles: Battle[]
  onViewBattle?: (battleId: string) => void
}

export function BattleHistory({ battles, onViewBattle }: BattleHistoryProps) {
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null)
  const [showResults, setShowResults] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600'
      case 'voting':
        return 'bg-blue-600'
      case 'active':
        return 'bg-yellow-600'
      case 'waiting':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  const handleViewResults = (battle: Battle) => {
    setSelectedBattle(battle)
    setShowResults(true)
  }

  const handleCloseResults = () => {
    setShowResults(false)
    setSelectedBattle(null)
  }

  const completedBattles = battles.filter(battle => battle.status === 'completed')
  const activeBattles = battles.filter(battle => 
    battle.status === 'waiting' || battle.status === 'active' || battle.status === 'voting'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          🏆 Battle History
        </h1>
        <p className="text-xl text-muted-foreground">
          View all completed battles and their results
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-500">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{battles.length}</div>
            <p className="text-sm text-muted-foreground">Total Battles</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-500">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{completedBattles.length}</div>
            <p className="text-sm text-muted-foreground">Completed Battles</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-500">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{activeBattles.length}</div>
            <p className="text-sm text-muted-foreground">Active Battles</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Battles */}
      {activeBattles.length > 0 && (
        <Card className="border-2 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">
              🔥 Active Battles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBattles.map((battle) => (
                <Card key={battle.id} className="border border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(battle.status)}>
                            {battle.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(battle.created_at)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">Battle Concept:</h3>
                        <p className="text-foreground font-medium">
                          &ldquo;{battle.concept}&rdquo;
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            👥 {[battle.participant1_wallet, battle.participant2_wallet].filter(Boolean).length}/2 participants
                          </span>
                          <span>ID: {battle.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {onViewBattle && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewBattle(battle.id)}
                          >
                            View Battle
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Battles */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="text-2xl text-green-600">
            🏆 Completed Battles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedBattles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-lg text-muted-foreground">No completed battles yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create a battle and complete the full cycle to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedBattles.map((battle) => (
                <Card key={battle.id} className="border border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600">
                            COMPLETED
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(battle.created_at)}
                          </span>
                          {battle.completed_at && (
                            <span className="text-sm text-muted-foreground">
                              • Completed: {formatDate(battle.completed_at)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">Battle Concept:</h3>
                        <p className="text-foreground font-medium">
                          &ldquo;{battle.concept}&rdquo;
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            👥 {[battle.participant1_wallet, battle.participant2_wallet].filter(Boolean).length}/2 participants
                          </span>
                          <span>🗳️ {battle.total_votes || 0} votes</span>
                          <span>ID: {battle.id.slice(0, 8)}...</span>
                        </div>
                        {battle.winner_wallet && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-green-600">🏆 Winner:</span>
                            <span className="text-sm font-mono">
                              {battle.winner_wallet.slice(0, 6)}...{battle.winner_wallet.slice(-4)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(battle)}
                        >
                          View Results
                        </Button>
                        {onViewBattle && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewBattle(battle.id)}
                          >
                            View Battle
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battle Results Modal */}
      {showResults && selectedBattle && (
        <BattleResults
          battle={selectedBattle}
          showFullScreen={true}
          onClose={handleCloseResults}
        />
      )}
    </div>
  )
}
