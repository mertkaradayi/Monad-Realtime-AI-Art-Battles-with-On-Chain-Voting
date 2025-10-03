'use client'

import { useState, useEffect, useRef } from 'react'
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
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const autoJoinAttemptedRef = useRef<string | null>(null)

  // Fetch battle details and auto-join if possible
  useEffect(() => {
    if (battleId && ready && authenticated) {
      fetchBattle()
    }
  }, [battleId, ready, authenticated])

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

  // Auto-join when authenticated, battle loaded, and eligible
  useEffect(() => {
    if (!battle || !authenticated || !user?.wallet?.address) return
    if (!canJoin() || isParticipant() || isJoining) return

    const key = `${battle.id}:${user.wallet.address}`
    if (autoJoinAttemptedRef.current === key) return
    autoJoinAttemptedRef.current = key

    handleJoinBattle()
  }, [battle?.id, battle?.status, battle?.participant1_wallet, battle?.participant2_wallet, authenticated, user?.wallet?.address, isJoining])

  // Poll for battle updates when battle is in waiting state
  useEffect(() => {
    const shouldPoll = Boolean(battle && battle.status === 'waiting' && isParticipant())

    if (shouldPoll && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchBattle(true)
      }, 3000)
      setIsPolling(true)
    }

    if (!shouldPoll && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
      setIsPolling(false)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
        setIsPolling(false)
      }
    }
  }, [battle?.status, isParticipant()])

  // Cleanup polling on unmount (safety)
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  const fetchBattle = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true)
      setError(null)
      
      const result = await api.getBattle(battleId)
      
      if (result.success) {
        const newBattle = result.data

        setBattle(prev => {
          if (!prev) return newBattle

          const statusChanged = prev.status === 'waiting' && newBattle.status === 'active'
          const anyChanged = (
            prev.status !== newBattle.status ||
            prev.participant1_wallet !== newBattle.participant1_wallet ||
            prev.participant2_wallet !== newBattle.participant2_wallet ||
            prev.concept !== newBattle.concept
          )

          if (statusChanged) {
            toast.success('🎉 Battle is now active!', {
              description: 'Both participants have joined. The battle begins!',
              duration: 5000
            })
          }

          return anyChanged ? newBattle : prev
        })
      } else {
        setError(result.error || 'Battle not found')
      }
    } catch (err) {
      console.error('Error fetching battle:', err)
      setError('Failed to load battle details')
    } finally {
      if (!silent) setIsLoading(false)
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
        // Update battle state immediately
        setBattle(result.data)
        
        // Show success message based on participant role
        const isParticipant1 = result.data.participant1_wallet === user?.wallet?.address
        const isParticipant2 = result.data.participant2_wallet === user?.wallet?.address
        
        if (isParticipant1) {
          toast.success('🎯 You are Participant 1!', {
            description: 'Waiting for Participant 2 to join...',
            duration: 4000
          })
        } else if (isParticipant2) {
          toast.success('🎯 You are Participant 2!', {
            description: 'Battle is now active! Both participants have joined.',
            duration: 4000
          })
        } else {
          toast.success('Successfully joined the battle!', {
            description: 'You are now a participant'
          })
        }
      } else {
        // Fallback: verify current state – user might have joined despite error
        try {
          const state = await api.getBattle(battleId)
          if (state.success) {
            const updated = state.data
            const isP1 = updated.participant1_wallet === user?.wallet?.address
            const isP2 = updated.participant2_wallet === user?.wallet?.address
            if (isP1 || isP2) {
              setBattle(updated)
              toast.success(isP1 ? '🎯 You are Participant 1!' : '🎯 You are Participant 2!', {
                description: isP1 ? 'Waiting for Participant 2 to join...' : 'Battle is now active! Both participants have joined.',
                duration: 4000
              })
              setError(null)
              return
            }
          }
        } catch (_) {
          // ignore secondary fetch errors
        }
        setError(result.error || 'Failed to join battle')
        toast.error('Failed to join battle')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to join battles')
        toast.error('Authentication required')
      } else {
        // Fallback: verify current state – user might have joined despite error
        try {
          const state = await api.getBattle(battleId)
          if (state.success) {
            const updated = state.data
            const isP1 = updated.participant1_wallet === user?.wallet?.address
            const isP2 = updated.participant2_wallet === user?.wallet?.address
            if (isP1 || isP2) {
              setBattle(updated)
              toast.success(isP1 ? '🎯 You are Participant 1!' : '🎯 You are Participant 2!', {
                description: isP1 ? 'Waiting for Participant 2 to join...' : 'Battle is now active! Both participants have joined.',
                duration: 4000
              })
              setError(null)
              return
            }
          }
        } catch (_) {
          // ignore secondary fetch errors
        }
        setError('Failed to join battle')
        console.error('Error joining battle:', err)
        toast.error('Failed to join battle, please try again')
      }
    } finally {
      setIsJoining(false)
    }
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

            {/* Waiting Status - Large Demo UI */}
            {isParticipant() && battle.status === 'waiting' && (
              <Card className="border-2 border-primary">
                <CardContent className="text-center py-16">
                  <div className="space-y-8">
                    <div className="text-6xl">⏳</div>
                    <div>
                      <h2 className="text-4xl font-bold text-primary mb-4">
                        WAITING FOR PARTICIPANT 2
                      </h2>
                      <p className="text-xl text-muted-foreground mb-6">
                        You are Participant {battle.participant1_wallet === user?.wallet?.address ? '1' : '2'}
                      </p>
                    </div>
                    
                    <div className="bg-muted p-6 rounded-lg max-w-2xl mx-auto">
                      <h3 className="text-2xl font-semibold mb-4">Battle Concept:</h3>
                      <p className="text-xl text-foreground font-medium">
                        "{battle.concept}"
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 text-lg">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        1/2 Participants Joined
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">
                        Share the QR code with another participant to start the battle!
                      </p>
                      {isPolling && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">
                            Waiting for second participant...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {isParticipant() && battle.status !== 'waiting' && (
              <Alert>
                <AlertDescription>
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">🎉 You're in this battle!</h3>
                    <p>You are a participant in this battle. The battle will begin once both participants have joined.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Active Battle - Split Screen Demo UI */}
            {battle.status === 'active' && (
              <Card className="border-2 border-green-500">
                <CardContent className="py-16">
                  <div className="space-y-8">
                    {/* Battle Status Header */}
                    <div className="text-center">
                      <div className="text-6xl mb-4">⚔️</div>
                      <h2 className="text-4xl font-bold text-green-600 mb-2">
                        BATTLE IS ACTIVE!
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Both participants have joined. The battle is now in progress.
                      </p>
                    </div>

                    {/* Battle Concept */}
                    <div className="bg-muted p-6 rounded-lg max-w-4xl mx-auto">
                      <h3 className="text-2xl font-semibold mb-4 text-center">Battle Concept:</h3>
                      <p className="text-xl text-foreground font-medium text-center">
                        "{battle.concept}"
                      </p>
                    </div>

                    {/* Split Screen Participants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                      {/* Participant 1 */}
                      <Card className="border-2 border-blue-500">
                        <CardContent className="text-center py-8">
                          <div className="space-y-4">
                            <div className="text-4xl">👤</div>
                            <h3 className="text-2xl font-bold text-blue-600">Participant 1</h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="font-mono text-lg">
                                {battle.participant1_wallet ? 
                                  `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                                  'Unknown'
                                }
                              </p>
                            </div>
                            {battle.participant1_wallet === user?.wallet?.address && (
                              <Badge variant="default" className="text-lg px-4 py-2">
                                🎯 That's You!
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Participant 2 */}
                      <Card className="border-2 border-purple-500">
                        <CardContent className="text-center py-8">
                          <div className="space-y-4">
                            <div className="text-4xl">👤</div>
                            <h3 className="text-2xl font-bold text-purple-600">Participant 2</h3>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="font-mono text-lg">
                                {battle.participant2_wallet ? 
                                  `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                                  'Unknown'
                                }
                              </p>
                            </div>
                            {battle.participant2_wallet === user?.wallet?.address && (
                              <Badge variant="default" className="text-lg px-4 py-2">
                                🎯 That's You!
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                      <Badge variant="default" className="text-xl px-6 py-3 bg-green-600">
                        2/2 Participants Joined - Battle Active
                      </Badge>
                    </div>

                    {/* Next Phase Info */}
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">
                        🎨 Ready for prompt submission phase!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                onClick={() => fetchBattle()}
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
