'use client'

import { useState, useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AuthButton } from '@/components/AuthButton'
import { LoginPage } from '@/components/LoginPage'
import ThemeToggle from '@/components/ThemeToggle'
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
  joining_qr_data: string | null
  joiningQR?: string
}

export default function Home() {
  const { ready, authenticated, user } = usePrivy()
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Check if current user is the battle creator
  const isBattleCreator = () => {
    return battle && user?.wallet?.address && battle.creator_wallet === user.wallet.address
  }

  // Poll for battle updates when user is the creator and battle is in waiting state
  useEffect(() => {
    const shouldPoll = Boolean(battle && isBattleCreator() && battle.status === 'waiting')

    if (shouldPoll && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchBattleStatus(true)
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
  }, [battle?.id, battle?.status, user?.wallet?.address])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  // Fetch battle status (for polling)
  const fetchBattleStatus = async (silent: boolean = false) => {
    if (!battle?.id) return

    try {
      if (!silent) setIsLoading(true)
      setError(null)
      
      const result = await api.getBattle(battle.id)
      
      if (result.success) {
        const newBattle = result.data

        setBattle(prev => {
          if (!prev) return newBattle

          const statusChanged = prev.status === 'waiting' && newBattle.status === 'active'
          const participantsChanged = (
            prev.participant1_wallet !== newBattle.participant1_wallet ||
            prev.participant2_wallet !== newBattle.participant2_wallet
          )

          if (statusChanged) {
            toast.success('🎉 Battle is now active!', {
              description: 'Both participants have joined. The battle begins!',
              duration: 5000
            })
          } else if (participantsChanged) {
            // Show notification when new participant joins
            if (!prev.participant1_wallet && newBattle.participant1_wallet) {
              toast.success('👤 Participant 1 joined!', {
                description: 'Waiting for Participant 2...',
                duration: 3000
              })
            } else if (!prev.participant2_wallet && newBattle.participant2_wallet) {
              toast.success('👤 Participant 2 joined!', {
                description: 'Battle is now active!',
                duration: 3000
              })
            }
          }

          // Preserve the joiningQR field from the previous battle state
          // This prevents the QR code from disappearing during polling
          return {
            ...newBattle,
            joiningQR: prev.joiningQR || newBattle.joining_qr_data
          }
        })
      }
    } catch (err) {
      console.error('Error fetching battle status:', err)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  // Create a new battle
  const handleCreateBattle = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      toast.info('Creating battle with AI concept...')
      
      const result = await api.createBattle()
      
      if (result.success) {
        setBattle(result.data)
        toast.success('Battle created successfully!', {
          description: `Concept: "${result.data.concept}"`
        })
      } else {
        setError(result.error || 'Failed to create battle')
        toast.error('Failed to create battle')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to create battles')
        toast.error('Authentication required')
      } else {
        setError('Failed to connect to the backend server')
        console.error('Error creating battle:', err)
        toast.error('Failed to create battle, please try again')
      }
    } finally {
      setIsLoading(false)
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              ⚔️ Realtime AI Art Battles
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered art duels. Two prompts, two images, instant on-chain votes — winner mints as NFT.
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <ThemeToggle />
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

        <div className="space-y-8">
          {!battle ? (
            // Battle Creation Interface
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create New Battle</CardTitle>
                <p className="text-muted-foreground">
                  Generate a unique AI art concept and create a battle for participants to join
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>🎨 AI will generate a unique art concept</p>
                    <p>📱 QR code will be created for participants to join</p>
                    <p>⚔️ First 2 users to scan become the battle participants</p>
                  </div>
                  
                  <Button 
                    onClick={handleCreateBattle}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-16 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Battle...
                      </div>
                    ) : (
                      '🎯 Create Battle'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Battle Display Interface
            <div className="space-y-6">
              {/* Battle Host Dashboard */}
              {isBattleCreator() && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-primary">🎯 Battle Host Dashboard</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={battle.status === 'waiting' ? 'default' : 'secondary'}>
                          {battle.status.toUpperCase()}
                        </Badge>
                        {isPolling && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Live Updates
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Battle Concept */}
                    <div className="bg-muted p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3 text-center">Battle Concept:</h3>
                      <p className="text-lg font-medium text-foreground text-center">
                        "{battle.concept}"
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Participants will complete this concept to create their art
                      </p>
                    </div>

                    {/* Participants Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Participant 1 */}
                      <Card className={battle.participant1_wallet ? "border-green-500" : "border-gray-300"}>
                        <CardContent className="text-center py-6">
                          <div className="space-y-3">
                            <div className="text-3xl">
                              {battle.participant1_wallet ? "👤" : "⏳"}
                            </div>
                            <h3 className="text-xl font-bold">
                              Participant 1
                            </h3>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="font-mono text-sm">
                                {battle.participant1_wallet ? 
                                  `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                                  'Waiting for participant'
                                }
                              </p>
                            </div>
                            {battle.participant1_wallet && (
                              <Badge variant="default" className="bg-green-600">
                                ✅ Joined
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Participant 2 */}
                      <Card className={battle.participant2_wallet ? "border-green-500" : "border-gray-300"}>
                        <CardContent className="text-center py-6">
                          <div className="space-y-3">
                            <div className="text-3xl">
                              {battle.participant2_wallet ? "👤" : "⏳"}
                            </div>
                            <h3 className="text-xl font-bold">
                              Participant 2
                            </h3>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="font-mono text-sm">
                                {battle.participant2_wallet ? 
                                  `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                                  'Waiting for participant'
                                }
                              </p>
                            </div>
                            {battle.participant2_wallet && (
                              <Badge variant="default" className="bg-green-600">
                                ✅ Joined
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Battle Status Summary */}
                    <div className="text-center">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Battle Status</h3>
                        <p className="text-sm text-muted-foreground">
                          {battle.status === 'waiting' && !battle.participant1_wallet && !battle.participant2_wallet && 
                            "Waiting for participants to scan QR code..."}
                          {battle.status === 'waiting' && battle.participant1_wallet && !battle.participant2_wallet && 
                            "1/2 participants joined - waiting for second participant..."}
                          {battle.status === 'active' && 
                            "🎉 Battle is active! Both participants have joined."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Battle Concept (for non-creators) */}
              {!isBattleCreator() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Battle Concept</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="bg-muted p-6 rounded-lg">
                      <p className="text-lg font-medium text-foreground">
                        "{battle.concept}"
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Participants will complete this concept to create their art
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* QR Code Display */}
              {battle.joiningQR && (
                <Card className={isBattleCreator() ? "border-2 border-blue-500" : ""}>
                  <CardHeader>
                    <CardTitle className="text-center text-xl">
                      {isBattleCreator() ? "📱 Share This QR Code" : "Scan to Join Battle"}
                    </CardTitle>
                    <p className="text-center text-muted-foreground">
                      {isBattleCreator() 
                        ? "Participants scan this QR code to join your battle" 
                        : "First 2 users to scan will become participants"
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={battle.joiningQR} 
                        alt="Battle Join QR Code"
                        className={`border rounded-lg ${isBattleCreator() ? "w-96 h-96" : "w-80 h-80"}`}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Battle ID: {battle.id}</p>
                      <p>Status: {battle.status}</p>
                      {isBattleCreator() && (
                        <p className="text-primary font-medium">
                          👥 {[battle.participant1_wallet, battle.participant2_wallet].filter(Boolean).length}/2 participants joined
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Battle Actions */}
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setBattle(null)}
                  disabled={isLoading}
                >
                  Create New Battle
                </Button>
                <Button 
                  onClick={() => fetchBattleStatus()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Refreshing...
                    </div>
                  ) : (
                    'Refresh Status'
                  )}
                </Button>
                {isBattleCreator() && (
                  <Button 
                    variant="secondary"
                    onClick={() => window.location.href = `/join/${battle.id}`}
                  >
                    View as Participant
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <Alert className="mt-12">
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-2">
                How this works:
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• AI generates a unique art concept for each battle</li>
                <li>• QR code allows participants to join the battle</li>
                <li>• First 2 users to scan become the battle participants</li>
                <li>• Participants complete the concept to create their art prompts</li>
                <li>• AI generates images from the completed prompts</li>
                <li>• Audience votes on the best artwork</li>
                <li>• Winner's artwork is minted as an NFT on Monad</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        
        <Toaster />
      </div>
    </div>
  )
}