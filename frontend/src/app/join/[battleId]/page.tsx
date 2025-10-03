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

interface Battle {
  id: string
  concept: string
  status: 'waiting' | 'active' | 'voting' | 'completed' | 'cancelled'
  created_at: string
  creator_wallet: string
  participant1_wallet: string | null
  participant2_wallet: string | null
}

export default function JoinBattlePage() {
  const { ready, authenticated, user } = usePrivy()
  const params = useParams()
  const battleId = params.battleId as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch battle details
  useEffect(() => {
    if (battleId && ready && authenticated) {
      fetchBattle()
    }
  }, [battleId, ready, authenticated])

  const fetchBattle = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await api.getBattle(battleId)
      
      if (result.success) {
        setBattle(result.data)
      } else {
        setError(result.error || 'Battle not found')
      }
    } catch (err) {
      console.error('Error fetching battle:', err)
      setError('Failed to load battle details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinBattle = async () => {
    if (!authenticated) {
      toast.error('Please connect your wallet to join the battle')
      return
    }

    try {
      setIsJoining(true)
      setError(null)
      
      toast.info('Joining battle...')
      
      const result = await api.joinBattle(battleId)
      
      if (result.success) {
        setBattle(result.data)
        toast.success('Successfully joined the battle!', {
          description: 'You are now a participant'
        })
      } else {
        setError(result.error || 'Failed to join battle')
        toast.error('Failed to join battle')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to join battles')
        toast.error('Authentication required')
      } else {
        setError('Failed to join battle')
        console.error('Error joining battle:', err)
        toast.error('Failed to join battle, please try again')
      }
    } finally {
      setIsJoining(false)
    }
  }

  const canJoin = () => {
    if (!battle || !authenticated || !user?.wallet?.address) return false
    if (battle.status !== 'waiting') return false
    if (battle.participant1_wallet === user.wallet.address || 
        battle.participant2_wallet === user.wallet.address) return false
    if (battle.participant1_wallet && battle.participant2_wallet) return false
    return true
  }

  const isParticipant = () => {
    if (!battle || !user?.wallet?.address) return false
    return battle.participant1_wallet === user.wallet.address || 
           battle.participant2_wallet === user.wallet.address
  }

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!authenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              ⚔️ Join Battle
            </h1>
            <p className="text-muted-foreground text-lg">
              You've scanned a battle QR code!
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <AuthButton />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <div className="space-y-2">
                <p>{error}</p>
                <Button 
                  variant="link"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading battle details...</p>
            </CardContent>
          </Card>
        ) : battle ? (
          <div className="space-y-6">
            {/* Battle Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Battle Details</CardTitle>
                  <Badge variant={battle.status === 'waiting' ? 'default' : 'secondary'}>
                    {battle.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Battle Concept:</h3>
                  <p className="text-foreground">"{battle.concept}"</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Battle ID:</p>
                    <p className="font-mono text-xs">{battle.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created:</p>
                    <p>{new Date(battle.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Participant 1</p>
                      <p className="text-sm text-muted-foreground">
                        {battle.participant1_wallet ? 
                          `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                          'Waiting for participant'
                        }
                      </p>
                    </div>
                    {battle.participant1_wallet && (
                      <Badge variant="default">Joined</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Participant 2</p>
                      <p className="text-sm text-muted-foreground">
                        {battle.participant2_wallet ? 
                          `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                          'Waiting for participant'
                        }
                      </p>
                    </div>
                    {battle.participant2_wallet && (
                      <Badge variant="default">Joined</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Join Button */}
            {canJoin() && (
              <Card>
                <CardContent className="text-center py-8">
                  <Button 
                    onClick={handleJoinBattle}
                    disabled={isJoining}
                    size="lg"
                    className="w-full h-16 text-lg font-semibold"
                  >
                    {isJoining ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Joining Battle...
                      </div>
                    ) : (
                      '🎯 Join This Battle'
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    You'll become a participant and help complete the battle concept
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {isParticipant() && (
              <Alert>
                <AlertDescription>
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">🎉 You're in this battle!</h3>
                    <p>You are a participant in this battle. The battle will begin once both participants have joined.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {battle.status === 'active' && (
              <Alert>
                <AlertDescription>
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">⚔️ Battle is Active!</h3>
                    <p>Both participants have joined. The battle is now in progress.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {battle.status !== 'waiting' && !isParticipant() && (
              <Alert>
                <AlertDescription>
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Battle Full</h3>
                    <p>This battle already has 2 participants and is no longer accepting new joiners.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
              <Button 
                onClick={fetchBattle}
                disabled={isLoading}
              >
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Battle Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The battle you're trying to join doesn't exist or has been removed.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Toaster />
      </div>
    </div>
  )
}
