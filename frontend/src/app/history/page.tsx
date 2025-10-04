'use client'

import { useState, useEffect } from 'react'
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
import { BattleHistory } from '@/components/BattleHistory'

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

export default function BattleHistoryPage() {
  const { ready, authenticated } = usePrivy()
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all battles
  useEffect(() => {
    if (ready && authenticated) {
      fetchBattles()
    }
  }, [ready, authenticated])

  const fetchBattles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await api.getBattles()
      
      if (result.success) {
        setBattles(result.data || [])
      } else {
        setError('Failed to fetch battles')
      }
    } catch (err) {
      console.error('Error fetching battles:', err)
      setError('Failed to fetch battles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewBattle = (battleId: string) => {
    // Navigate to the appropriate page based on battle status
    window.location.href = `/results/${battleId}`
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
          <p className="text-muted-foreground">Loading battle history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-4">
                  <p>{error}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchBattles}
                    >
                      Retry
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
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
            🏆 Battle History
          </h1>
          <p className="text-xl text-muted-foreground">
            View all battles and their results
          </p>
        </div>

        {/* Battle History */}
        <BattleHistory 
          battles={battles}
          onViewBattle={handleViewBattle}
        />

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
          <Button 
            onClick={fetchBattles}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </div>
            ) : (
              'Refresh History'
            )}
          </Button>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
