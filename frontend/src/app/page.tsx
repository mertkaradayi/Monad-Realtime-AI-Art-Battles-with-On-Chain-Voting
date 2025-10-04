'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { useBattlePolling } from '@/hooks/useBattlePolling'

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
  image_generation_status: string | null
  joining_qr_data: string | null
  joiningQR?: string
}

export default function Home() {
  const { ready, authenticated, user } = usePrivy()
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myBattles, setMyBattles] = useState<Battle[]>([])
  const [, setIsLoadingMyBattles] = useState(false)
  
  // Track which battle notifications we've already shown to prevent spam
  const shownNotifications = useRef<Set<string>>(new Set())

  // Check if current user is the battle creator
  const isBattleCreator = () => {
    return battle && user?.wallet?.address && battle.creator_wallet === user.wallet.address
  }

  // Fetch user's battles to check for active ones
  const fetchMyBattles = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return

    try {
      setIsLoadingMyBattles(true)
      const result = await api.getMyBattles()
      
      if (result.success) {
        const battles = result.data || []
        setMyBattles(battles)
        
        // Check for active battles (waiting, active, or prompts_submitted)
        const activeBattles = battles.filter((b: Battle) => 
          b.status === 'waiting' || b.status === 'active' || b.status === 'prompts_submitted'
        )
        
        if (activeBattles.length > 0 && !battle) {
          // If there's an active battle and no current battle loaded, show reconnection option
          const mostRecentActive = activeBattles[0]
          
          // Only show notification if we haven't shown it for this battle yet
          if (!shownNotifications.current.has(mostRecentActive.id)) {
            shownNotifications.current.add(mostRecentActive.id)
            
            toast.info('🎯 Active battle found!', {
              description: `You have an active battle: "${mostRecentActive.concept}"`,
              duration: 8000,
              action: {
                label: 'Reconnect',
                onClick: () => reconnectToBattle(mostRecentActive)
              }
            })
          }
        }
      }
    } catch (err) {
      console.error('Error fetching my battles:', err)
    } finally {
      setIsLoadingMyBattles(false)
    }
  }, [authenticated, user?.wallet?.address, battle])

  // Reconnect to an existing battle
  const reconnectToBattle = async (battleToReconnect: Battle) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Remove this battle from shown notifications since we're reconnecting
      shownNotifications.current.delete(battleToReconnect.id)
      
      // Fetch the latest battle data
      const result = await api.getBattle(battleToReconnect.id)
      
      if (result.success) {
        const latestBattle = result.data
        
        // Ensure we have the QR code data
        const battleWithQR = {
          ...latestBattle,
          joiningQR: latestBattle.joining_qr_data || battleToReconnect.joining_qr_data
        }
        
        setBattle(battleWithQR)
        toast.success('🎯 Reconnected to battle!', {
          description: `Resumed hosting: "${latestBattle.concept}"`,
          duration: 5000
        })
      } else {
        setError('Failed to reconnect to battle')
        toast.error('Failed to reconnect to battle')
      }
    } catch (err) {
      console.error('Error reconnecting to battle:', err)
      setError('Failed to reconnect to battle')
      toast.error('Failed to reconnect to battle')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's battles when authenticated
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      fetchMyBattles()
    }
  }, [ready, authenticated, user?.wallet?.address, fetchMyBattles])

  // Use coordinated polling hook
  const { isPolling } = useBattlePolling({
    battleId: battle?.id || null,
    enabled: Boolean(battle && isBattleCreator() && authenticated && (battle.status === 'waiting' || battle.status === 'active' || battle.status === 'prompts_submitted')),
    interval: 3000,
    onUpdate: () => fetchBattleStatus(true)
  })

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
            joiningQR: prev.joiningQR || newBattle.joining_qr_data || prev.joining_qr_data
          }
        })
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required') || error.message.includes('reconnect your wallet')) {
        // Authentication error - stop polling and clear battle state
        setError('Authentication expired - please reconnect your wallet')
        setBattle(null)
        if (!silent) {
          toast.error('Authentication expired - please reconnect your wallet')
        }
        return
      } else {
        console.error('Error fetching battle status:', err)
        if (!silent) {
          setError('Failed to fetch battle status')
          toast.error('Failed to fetch battle status, please try again')
        }
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  // Create a new battle
  const handleCreateBattle = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Clear shown notifications when creating a new battle
      shownNotifications.current.clear()
      
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

  const handleRetryImageGeneration = async (participant: 'participant1' | 'participant2') => {
    if (!battle) return

    try {
      setIsLoading(true)
      toast.info(`Retrying image generation for ${participant}...`)

      const result = await api.retryImageGeneration(battle.id, participant)
      
      if (result.success) {
        toast.success(`Image generation retry successful for ${participant}!`)
        // Refresh battle data to show updated status
        await fetchBattleStatus()
      } else {
        toast.error(`Failed to retry image generation for ${participant}`)
      }
    } catch (err) {
      console.error('Error retrying image generation:', err)
      toast.error('Failed to retry image generation, please try again')
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
            <div className="space-y-6">
              {/* Active Battles Section */}
              {myBattles.length > 0 && (
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">🎯 Your Active Battles</CardTitle>
                    <p className="text-muted-foreground text-center">
                      Reconnect to your ongoing battles
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myBattles
                        .filter((b: Battle) => b.status === 'waiting' || b.status === 'active' || b.status === 'prompts_submitted')
                        .map((activeBattle) => (
                          <Card key={activeBattle.id} className="border-2 border-orange-500">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={activeBattle.status === 'waiting' ? 'default' : 'secondary'}>
                                      {activeBattle.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(activeBattle.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold">Battle Concept:</h3>
                                  <p className="text-foreground font-medium">
                                    &ldquo;{activeBattle.concept}&rdquo;
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>
                                      👥 {[activeBattle.participant1_wallet, activeBattle.participant2_wallet].filter(Boolean).length}/2 participants
                                    </span>
                                    <span>ID: {activeBattle.id.slice(0, 8)}...</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => reconnectToBattle(activeBattle)}
                                  disabled={isLoading}
                                  size="lg"
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  {isLoading ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Reconnecting...
                                    </div>
                                  ) : (
                                    '🎯 Reconnect'
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      
                      {myBattles.filter((b: Battle) => b.status === 'waiting' || b.status === 'active' || b.status === 'prompts_submitted').length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No active battles found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Battle Creation Interface */}
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
            </div>
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
                        &ldquo;{battle.concept}&rdquo;
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
                            
                            {/* Join Status */}
                            {battle.participant1_wallet && (
                              <Badge variant="default" className="bg-green-600">
                                ✅ Joined
                              </Badge>
                            )}

                            {/* Prompt Status */}
                            {battle.participant1_wallet && (
                              <div className="mt-2">
                                <Badge variant={battle.participant1_prompt ? "default" : "outline"} 
                                       className={battle.participant1_prompt ? "bg-blue-600" : ""}>
                                  {battle.participant1_prompt ? "📝 Prompt Submitted" : "⏳ Waiting for Prompt"}
                                </Badge>
                              </div>
                            )}

                            {/* Image Generation Status */}
                            {battle.participant1_prompt && (
                              <div className="mt-2">
                                {battle.participant1_generation_status === 'pending' && (
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                    ⏳ Queued
                                  </Badge>
                                )}
                                {battle.participant1_generation_status === 'generating' && (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                                      🎨 Generating
                                    </Badge>
                                  </div>
                                )}
                                {battle.participant1_generation_status === 'completed' && (
                                  <Badge variant="default" className="bg-green-600">
                                    ✅ Complete
                                  </Badge>
                                )}
                                {battle.participant1_generation_status === 'failed' && (
                                  <div className="space-y-2">
                                    <Badge variant="destructive">
                                      ❌ Failed
                                    </Badge>
                                    {battle.participant1_generation_error && (
                                      <p className="text-xs text-red-600">
                                        {battle.participant1_generation_error}
                                      </p>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => handleRetryImageGeneration('participant1')}
                                    >
                                      🔄 Retry
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Timestamps */}
                            {battle.participant1_generation_started_at && (
                              <div className="text-xs text-muted-foreground">
                                Started: {new Date(battle.participant1_generation_started_at).toLocaleTimeString()}
                              </div>
                            )}
                            {battle.participant1_generation_completed_at && (
                              <div className="text-xs text-muted-foreground">
                                Completed: {new Date(battle.participant1_generation_completed_at).toLocaleTimeString()}
                              </div>
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
                            
                            {/* Join Status */}
                            {battle.participant2_wallet && (
                              <Badge variant="default" className="bg-green-600">
                                ✅ Joined
                              </Badge>
                            )}

                            {/* Prompt Status */}
                            {battle.participant2_wallet && (
                              <div className="mt-2">
                                <Badge variant={battle.participant2_prompt ? "default" : "outline"} 
                                       className={battle.participant2_prompt ? "bg-blue-600" : ""}>
                                  {battle.participant2_prompt ? "📝 Prompt Submitted" : "⏳ Waiting for Prompt"}
                                </Badge>
                              </div>
                            )}

                            {/* Image Generation Status */}
                            {battle.participant2_prompt && (
                              <div className="mt-2">
                                {battle.participant2_generation_status === 'pending' && (
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                    ⏳ Queued
                                  </Badge>
                                )}
                                {battle.participant2_generation_status === 'generating' && (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                                      🎨 Generating
                                    </Badge>
                                  </div>
                                )}
                                {battle.participant2_generation_status === 'completed' && (
                                  <Badge variant="default" className="bg-green-600">
                                    ✅ Complete
                                  </Badge>
                                )}
                                {battle.participant2_generation_status === 'failed' && (
                                  <div className="space-y-2">
                                    <Badge variant="destructive">
                                      ❌ Failed
                                    </Badge>
                                    {battle.participant2_generation_error && (
                                      <p className="text-xs text-red-600">
                                        {battle.participant2_generation_error}
                                      </p>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => handleRetryImageGeneration('participant2')}
                                    >
                                      🔄 Retry
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Timestamps */}
                            {battle.participant2_generation_started_at && (
                              <div className="text-xs text-muted-foreground">
                                Started: {new Date(battle.participant2_generation_started_at).toLocaleTimeString()}
                              </div>
                            )}
                            {battle.participant2_generation_completed_at && (
                              <div className="text-xs text-muted-foreground">
                                Completed: {new Date(battle.participant2_generation_completed_at).toLocaleTimeString()}
                              </div>
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
                        &ldquo;{battle.concept}&rdquo;
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
                  onClick={() => {
                    // Clear shown notifications when dismissing current battle
                    shownNotifications.current.clear()
                    setBattle(null)
                  }}
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
                <li>• Winner&apos;s artwork is minted as an NFT on Monad</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        
        <Toaster />
      </div>
    </div>
  )
}