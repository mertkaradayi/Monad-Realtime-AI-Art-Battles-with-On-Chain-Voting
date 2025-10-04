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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useBattlePolling } from '@/hooks/useBattlePolling'
import { ImageGenerationLoading } from '@/components/ImageGenerationLoading'

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
  image_generation_status: 'pending' | 'generating' | 'completed' | 'failed' | null
}

export default function JoinBattlePage() {
  const { ready, authenticated, user } = usePrivy()
  const params = useParams()
  const battleId = params.battleId as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoJoinAttemptedRef = useRef<string | null>(null)
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false)
  const [promptCompletion, setPromptCompletion] = useState('')
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false)
  const [promptSubmitted, setPromptSubmitted] = useState(false)
  const [showPromptPreviews, setShowPromptPreviews] = useState(false)
  const [submissionTimer, setSubmissionTimer] = useState<number | null>(null)
  const submissionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0)
  const [showImageGenerationLoading, setShowImageGenerationLoading] = useState(false)

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

  const hasSubmittedPrompt = () => {
    if (!battle || !user?.wallet?.address) return false
    const isParticipant1 = battle.participant1_wallet === user.wallet.address
    return isParticipant1 ? !!battle.participant1_prompt : !!battle.participant2_prompt
  }

  const canSubmitPrompt = () => {
    if (!battle || !user?.wallet?.address) return false
    if (battle.status !== 'active') return false
    if (!isParticipant()) return false
    if (hasSubmittedPrompt()) return false
    return true
  }

  const isHost = () => {
    if (!battle || !user?.wallet?.address) return false
    return battle.creator_wallet === user.wallet.address
  }

  const getParticipantStatus = (participantNumber: 1 | 2) => {
    if (!battle) return 'Unknown'
    const prompt = participantNumber === 1 ? battle.participant1_prompt : battle.participant2_prompt
    return prompt ? 'Submitted' : 'Pending'
  }

  const getParticipantPrompt = (participantNumber: 1 | 2) => {
    if (!battle) return null
    return participantNumber === 1 ? battle.participant1_prompt : battle.participant2_prompt
  }

  const truncatePrompt = (prompt: string, maxLength: number = 100) => {
    if (prompt.length <= maxLength) return prompt
    return prompt.substring(0, maxLength) + '...'
  }

  const canStartImageGeneration = () => {
    if (!battle) return false
    return battle.participant1_prompt && battle.participant2_prompt
  }

  // Auto-join when authenticated, battle loaded, and eligible
  useEffect(() => {
    if (!battle || !authenticated || !user?.wallet?.address) return
    if (!canJoin() || isParticipant() || isJoining || autoJoinInProgress) return

    const key = `${battle.id}:${user.wallet.address}`
    if (autoJoinAttemptedRef.current === key) return
    autoJoinAttemptedRef.current = key

    // Set auto-join in progress to prevent multiple simultaneous attempts
    setAutoJoinInProgress(true)
    handleJoinBattle().finally(() => {
      setAutoJoinInProgress(false)
    })
  }, [battle?.id, battle?.status, battle?.participant1_wallet, battle?.participant2_wallet, authenticated, user?.wallet?.address, isJoining, autoJoinInProgress])

  // Use coordinated polling hook
  const { isPolling } = useBattlePolling({
    battleId: battle?.id || null,
    enabled: Boolean(battle && (battle.status === 'waiting' || battle.status === 'active' || battle.status === 'prompts_submitted')),
    interval: 3000,
    onUpdate: () => fetchBattle(true)
  })

  // Handle image generation status changes
  useEffect(() => {
    if (battle?.image_generation_status === 'generating') {
      setShowImageGenerationLoading(true)
      setImageGenerationProgress(0)
      
      // Simulate progress updates (in real implementation, this would come from WebSocket or polling)
      const progressInterval = setInterval(() => {
        setImageGenerationProgress(prev => {
          if (prev >= 90) return prev // Don't go to 100% until actually completed
          return prev + Math.random() * 10
        })
      }, 1000)

      return () => clearInterval(progressInterval)
    } else if (battle?.image_generation_status === 'completed' || battle?.image_generation_status === 'failed') {
      setImageGenerationProgress(100)
      // Hide loading after a delay to show completion state
      setTimeout(() => {
        setShowImageGenerationLoading(false)
      }, 3000)
    }
  }, [battle?.image_generation_status])

  // Timer effect for submission countdown
  useEffect(() => {
    const isActive = battle?.status === 'active'
    const bothPromptsSubmitted = Boolean(battle?.participant1_prompt && battle?.participant2_prompt)

    if (!isActive || bothPromptsSubmitted) {
      setSubmissionTimer(null)
      if (submissionTimerRef.current) {
        clearInterval(submissionTimerRef.current)
        submissionTimerRef.current = null
      }
      return
    }

    const startTime = Date.now()
    const duration = 50 * 1000 // 50 seconds in milliseconds

    if (submissionTimerRef.current) {
      clearInterval(submissionTimerRef.current)
      submissionTimerRef.current = null
    }

    setSubmissionTimer(duration)

    submissionTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setSubmissionTimer(remaining)

      if (remaining === 0) {
        if (submissionTimerRef.current) {
          clearInterval(submissionTimerRef.current)
          submissionTimerRef.current = null
        }
        toast.warning('⏰ Time&apos;s up!', {
          description: 'Prompt submission time has expired',
          duration: 5000
        })
      }
    }, 1000)

    return () => {
      if (submissionTimerRef.current) {
        clearInterval(submissionTimerRef.current)
        submissionTimerRef.current = null
      }
    }
  }, [battle?.status, battle?.participant1_prompt, battle?.participant2_prompt])

  // Format timer display
  const formatTimer = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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
          const promptsSubmitted = prev.status === 'active' && newBattle.status === 'prompts_submitted'
          const participant1PromptSubmitted = !prev.participant1_prompt && newBattle.participant1_prompt
          const participant2PromptSubmitted = !prev.participant2_prompt && newBattle.participant2_prompt
          const anyChanged = (
            prev.status !== newBattle.status ||
            prev.participant1_wallet !== newBattle.participant1_wallet ||
            prev.participant2_wallet !== newBattle.participant2_wallet ||
            prev.concept !== newBattle.concept ||
            prev.participant1_prompt !== newBattle.participant1_prompt ||
            prev.participant2_prompt !== newBattle.participant2_prompt ||
            prev.image_generation_status !== newBattle.image_generation_status ||
            prev.participant1_image_url !== newBattle.participant1_image_url ||
            prev.participant2_image_url !== newBattle.participant2_image_url
          )

          if (statusChanged) {
            toast.success('🎉 Battle is now active!', {
              description: 'Both participants have joined. The battle begins!',
              duration: 5000
            })
          }

          if (participant1PromptSubmitted) {
            toast.success('🎨 Participant 1 submitted their prompt!', {
              description: 'One prompt down, one to go!',
              duration: 4000
            })
          }

          if (participant2PromptSubmitted) {
            toast.success('🎨 Participant 2 submitted their prompt!', {
              description: 'Both prompts are now submitted!',
              duration: 4000
            })
          }

          if (promptsSubmitted) {
            toast.success('🎨 All prompts submitted!', {
              description: 'Both participants have submitted their prompts. Ready for the next phase!',
              duration: 5000
            })
          }

          // Image generation status changes
          const imageGenerationStarted = prev.image_generation_status !== 'generating' && newBattle.image_generation_status === 'generating'
          const imageGenerationCompleted = prev.image_generation_status !== 'completed' && newBattle.image_generation_status === 'completed'
          const imageGenerationFailed = prev.image_generation_status !== 'failed' && newBattle.image_generation_status === 'failed'

          if (imageGenerationStarted) {
            toast.info('🎨 Image generation started!', {
              description: 'AI is creating images from your prompts...',
              duration: 5000
            })
          }

          if (imageGenerationCompleted) {
            toast.success('🎉 Images generated successfully!', {
              description: 'Your AI art battle images are ready!',
              duration: 5000
            })
          }

          if (imageGenerationFailed) {
            toast.error('❌ Image generation failed', {
              description: 'There was an error generating the images. Please try again.',
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
        
        // If we get here, the join actually failed
        setError(result.error || 'Failed to join battle')
        toast.error(result.error || 'Failed to join battle')
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
        
        // If we get here, the join actually failed
        setError('Failed to join battle')
        console.error('Error joining battle:', err)
        toast.error('Failed to join battle, please try again')
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleSubmitPrompt = async () => {
    if (!authenticated || !promptCompletion.trim()) {
      toast.error('Please enter a prompt completion')
      return
    }

    try {
      setIsSubmittingPrompt(true)
      setError(null)
      
      toast.info('Submitting prompt...')
      
      const result = await api.submitPrompt(battleId, promptCompletion.trim())
      
      if (result.success) {
        // Update battle state immediately
        setBattle(result.data.battle)
        setPromptSubmitted(true)
        
        toast.success('🎨 PROMPT SUBMITTED!', {
          description: 'Your prompt has been submitted successfully!',
          duration: 5000
        })
      } else {
        setError(result.error || 'Failed to submit prompt')
        toast.error(result.error || 'Failed to submit prompt')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to submit prompts')
        toast.error('Authentication required')
      } else {
        setError('Failed to submit prompt')
        console.error('Error submitting prompt:', err)
        toast.error('Failed to submit prompt, please try again')
      }
    } finally {
      setIsSubmittingPrompt(false)
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
              You&apos;ve scanned a battle QR code!
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
                  <p className="text-foreground">&ldquo;{battle.concept}&rdquo;</p>
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

            {/* Host Dashboard */}
            {isHost() && battle.status === 'active' && (
              <Card className="border-2 border-orange-500">
                <CardHeader>
                  <CardTitle className="text-xl text-orange-600 flex items-center gap-2">
                    🎯 Host Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Submission Timer - More Prominent */}
                  {submissionTimer !== null && (
                    <div className="text-center bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                      <div className="text-5xl font-bold text-orange-600 mb-2">
                        ⏰ {formatTimer(submissionTimer)}
                      </div>
                      <p className="text-lg text-orange-700 font-semibold">
                        Time remaining for prompt submission
                      </p>
                      {submissionTimer < 10000 && (
                        <p className="text-red-600 font-bold mt-2">
                          ⚠️ HURRY UP! Time is running out!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Participant Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Participant 1 Status */}
                    <Card className={`border-2 ${getParticipantStatus(1) === 'Submitted' ? 'border-green-500 bg-green-50' : 'border-blue-500'}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-blue-600">Participant 1</h3>
                            <Badge 
                              variant={getParticipantStatus(1) === 'Submitted' ? 'default' : 'outline'}
                              className={getParticipantStatus(1) === 'Submitted' ? 'bg-green-600 text-white text-lg px-4 py-2' : 'text-lg px-4 py-2'}
                            >
                              {getParticipantStatus(1) === 'Submitted' ? '✅ SUBMITTED' : '⏳ PENDING'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {battle.participant1_wallet ? 
                              `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                              'Not joined'
                            }
                          </div>
                          {getParticipantPrompt(1) && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-700">✅ Prompt Submitted:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPromptPreviews(!showPromptPreviews)}
                                >
                                  {showPromptPreviews ? 'Hide' : 'Show'}
                                </Button>
                              </div>
                              {showPromptPreviews ? (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <p className="text-sm text-foreground">
                                    &ldquo;{getParticipantPrompt(1)}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <p className="text-sm text-foreground">
                                    &ldquo;{truncatePrompt(getParticipantPrompt(1)!, 80)}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Participant 2 Status */}
                    <Card className={`border-2 ${getParticipantStatus(2) === 'Submitted' ? 'border-green-500 bg-green-50' : 'border-purple-500'}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-purple-600">Participant 2</h3>
                            <Badge 
                              variant={getParticipantStatus(2) === 'Submitted' ? 'default' : 'outline'}
                              className={getParticipantStatus(2) === 'Submitted' ? 'bg-green-600 text-white text-lg px-4 py-2' : 'text-lg px-4 py-2'}
                            >
                              {getParticipantStatus(2) === 'Submitted' ? '✅ SUBMITTED' : '⏳ PENDING'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {battle.participant2_wallet ? 
                              `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                              'Not joined'
                            }
                          </div>
                          {getParticipantPrompt(2) && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-700">✅ Prompt Submitted:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPromptPreviews(!showPromptPreviews)}
                                >
                                  {showPromptPreviews ? 'Hide' : 'Show'}
                                </Button>
                              </div>
                              {showPromptPreviews ? (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <p className="text-sm text-foreground">
                                    &ldquo;{getParticipantPrompt(2)}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <p className="text-sm text-foreground">
                                    &ldquo;{truncatePrompt(getParticipantPrompt(2)!, 80)}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Start Image Generation Button */}
                  {canStartImageGeneration() && (
                    <div className="text-center">
                      <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-lg font-semibold px-8 py-3"
                        onClick={() => {
                          toast.success('🎨 Starting Image Generation!', {
                            description: 'Both prompts are ready for AI image generation',
                            duration: 5000
                          })
                        }}
                      >
                        🎨 Start Image Generation
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Both participants have submitted their prompts
                      </p>
                    </div>
                  )}

                  {/* Progress Status */}
                  <div className="text-center">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {getParticipantStatus(1) === 'Submitted' && getParticipantStatus(2) === 'Submitted' 
                        ? "2/2 Prompts Submitted - Ready for Image Generation!" 
                        : `${(getParticipantStatus(1) === 'Submitted' ? 1 : 0) + (getParticipantStatus(2) === 'Submitted' ? 1 : 0)}/2 Prompts Submitted`
                      }
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    You&apos;ll become a participant and help complete the battle concept
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
                        &ldquo;{battle.concept}&rdquo;
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
                    <h3 className="font-semibold mb-2">🎉 You&apos;re in this battle!</h3>
                    <p>You are a participant in this battle. The battle will begin once both participants have joined.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Active Battle - Prompt Submission UI */}
            {battle.status === 'active' && (
              <Card className="border-2 border-green-500">
                <CardContent className="py-16">
                  <div className="space-y-8">
                    {/* Battle Status Header */}
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <h2 className="text-4xl font-bold text-green-600 mb-2">
                        PROMPT SUBMISSION PHASE
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Complete the battle concept with your creative prompt!
                      </p>
                      
                      {/* Submission Timer for Audience */}
                      {submissionTimer !== null && !isHost() && (
                        <div className="mt-6 bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                          <div className="text-4xl font-bold text-orange-600 mb-2">
                            ⏰ {formatTimer(submissionTimer)}
                          </div>
                          <p className="text-lg text-orange-700 font-semibold">
                            Time remaining for prompt submission
                          </p>
                          {submissionTimer < 10000 && (
                            <p className="text-red-600 font-bold mt-2">
                              ⚠️ HURRY UP! Time is running out!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Battle Concept - Fixed Starter */}
                    <div className="bg-muted p-6 rounded-lg max-w-4xl mx-auto">
                      <h3 className="text-2xl font-semibold mb-4 text-center">Battle Concept (Fixed):</h3>
                      <p className="text-xl text-foreground font-medium text-center">
                        &ldquo;{battle.concept}&rdquo;
                      </p>
                    </div>

                    {/* Prompt Submission Form */}
                    {isParticipant() && (
                      <div className="max-w-4xl mx-auto">
                        {canSubmitPrompt() ? (
                          <Card className="border-2 border-blue-500">
                            <CardHeader>
                              <CardTitle className="text-2xl text-center text-blue-600">
                                Complete Your Prompt
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="prompt-completion" className="text-lg font-semibold">
                                  Your Prompt Completion:
                                </Label>
                                <Textarea
                                  id="prompt-completion"
                                  placeholder="Complete the battle concept with your creative ideas..."
                                  value={promptCompletion}
                                  onChange={(e) => setPromptCompletion(e.target.value)}
                                  className="min-h-32 text-lg"
                                  disabled={isSubmittingPrompt}
                                />
                                <p className="text-sm text-muted-foreground">
                                  The battle concept above will be combined with your completion to create the full prompt.
                                </p>
                              </div>
                              
                              <Button
                                onClick={handleSubmitPrompt}
                                disabled={isSubmittingPrompt || !promptCompletion.trim()}
                                size="lg"
                                className="w-full h-16 text-lg font-semibold"
                              >
                                {isSubmittingPrompt ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting Prompt...
                                  </div>
                                ) : (
                                  '🎨 Submit My Prompt'
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        ) : hasSubmittedPrompt() ? (
                          <Card className="border-2 border-green-500">
                            <CardContent className="text-center py-12">
                              <div className="space-y-6">
                                <div className="text-6xl">✅</div>
                                <h3 className="text-3xl font-bold text-green-600">
                                  PROMPT SUBMITTED!
                                </h3>
                                <p className="text-xl text-muted-foreground">
                                  Your prompt has been submitted successfully. Waiting for the other participant...
                                </p>
                                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
                                  ✅ Prompt Submitted
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="border-2 border-yellow-500">
                            <CardContent className="text-center py-12">
                              <div className="space-y-6">
                                <div className="text-6xl">⏳</div>
                                <h3 className="text-3xl font-bold text-yellow-600">
                                  WAITING FOR PROMPT SUBMISSION
                                </h3>
                                <p className="text-xl text-muted-foreground">
                                  Only battle participants can submit prompts.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Split Screen Participants Status */}
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
                                🎯 That&apos;s You!
                              </Badge>
                            )}
                            <div className="mt-4">
                              {battle.participant1_prompt ? (
                                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
                                  ✅ Prompt Submitted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                  ⏳ Waiting for Prompt
                                </Badge>
                              )}
                            </div>
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
                                🎯 That&apos;s You!
                              </Badge>
                            )}
                            <div className="mt-4">
                              {battle.participant2_prompt ? (
                                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
                                  ✅ Prompt Submitted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                  ⏳ Waiting for Prompt
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                      <Badge variant="default" className="text-xl px-6 py-3 bg-green-600">
                        {battle.participant1_prompt && battle.participant2_prompt 
                          ? "2/2 Prompts Submitted - Ready for Next Phase!" 
                          : `${(battle.participant1_prompt ? 1 : 0) + (battle.participant2_prompt ? 1 : 0)}/2 Prompts Submitted`
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompts Submitted Status */}
            {battle.status === 'prompts_submitted' && (
              <Card className="border-2 border-purple-500">
                <CardContent className="py-16">
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-4xl font-bold text-purple-600 mb-2">
                        PROMPTS SUBMITTED!
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Both participants have submitted their prompts. Ready for the next phase!
                      </p>
                    </div>

                    {/* Submitted Prompts Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                      {/* Participant 1 Prompt */}
                      <Card className="border-2 border-blue-500">
                        <CardHeader>
                          <CardTitle className="text-xl text-blue-600">Participant 1 Prompt</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              {battle.participant1_wallet ? 
                                `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                                'Unknown'
                              }
                            </p>
                            <p className="text-foreground font-medium">
                              &ldquo;{battle.participant1_prompt}&rdquo;
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Participant 2 Prompt */}
                      <Card className="border-2 border-purple-500">
                        <CardHeader>
                          <CardTitle className="text-xl text-purple-600">Participant 2 Prompt</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              {battle.participant2_wallet ? 
                                `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                                'Unknown'
                              }
                            </p>
                            <p className="text-foreground font-medium">
                              &ldquo;{battle.participant2_prompt}&rdquo;
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex items-center justify-center">
                      <Badge variant="default" className="text-xl px-6 py-3 bg-purple-600">
                        2/2 Prompts Submitted - Ready for Image Generation!
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images Generated - Display Phase */}
            {battle.image_generation_status === 'completed' && battle.participant1_image_url && battle.participant2_image_url && (
              <Card className="border-2 border-green-500">
                <CardContent className="py-16">
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <h2 className="text-4xl font-bold text-green-600 mb-2">
                        IMAGES GENERATED!
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Your AI art battle images are ready! Vote for your favorite.
                      </p>
                    </div>

                    {/* Battle Concept Display */}
                    <div className="bg-muted p-6 rounded-lg max-w-4xl mx-auto">
                      <h3 className="text-2xl font-semibold mb-4 text-center">Battle Concept:</h3>
                      <p className="text-xl text-foreground font-medium text-center">
                        &ldquo;{battle.concept}&rdquo;
                      </p>
                    </div>

                    {/* Generated Images Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                      {/* Participant 1 Image */}
                      <Card className="border-2 border-blue-500">
                        <CardHeader>
                          <CardTitle className="text-xl text-blue-600 text-center">
                            Participant 1
                          </CardTitle>
                          <div className="text-center">
                            <Badge variant="outline" className="text-sm">
                              {battle.participant1_wallet ? 
                                `${battle.participant1_wallet.slice(0, 6)}...${battle.participant1_wallet.slice(-4)}` : 
                                'Unknown'
                              }
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={battle.participant1_image_url}
                                alt="Participant 1 Generated Image"
                                className="w-full h-96 object-cover rounded-lg border-2 border-blue-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-600 text-white">Participant 1</Badge>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
                              <p className="text-sm text-foreground">
                                &ldquo;{battle.participant1_prompt}&rdquo;
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Participant 2 Image */}
                      <Card className="border-2 border-purple-500">
                        <CardHeader>
                          <CardTitle className="text-xl text-purple-600 text-center">
                            Participant 2
                          </CardTitle>
                          <div className="text-center">
                            <Badge variant="outline" className="text-sm">
                              {battle.participant2_wallet ? 
                                `${battle.participant2_wallet.slice(0, 6)}...${battle.participant2_wallet.slice(-4)}` : 
                                'Unknown'
                              }
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={battle.participant2_image_url}
                                alt="Participant 2 Generated Image"
                                className="w-full h-96 object-cover rounded-lg border-2 border-purple-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-purple-600 text-white">Participant 2</Badge>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
                              <p className="text-sm text-foreground">
                                &ldquo;{battle.participant2_prompt}&rdquo;
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Voting Phase Status */}
                    <div className="text-center">
                      <Badge variant="default" className="text-xl px-6 py-3 bg-green-600">
                        🗳️ Ready for Voting Phase
                      </Badge>
                      <p className="text-lg text-muted-foreground mt-4">
                        The voting QR code will be generated soon for audience participation.
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
                The battle you&apos;re trying to join doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Image Generation Loading Overlay */}
        {showImageGenerationLoading && battle && (
          <ImageGenerationLoading
            battleConcept={battle.concept}
            participant1Prompt={battle.participant1_prompt || undefined}
            participant2Prompt={battle.participant2_prompt || undefined}
            progress={imageGenerationProgress}
            status={battle.image_generation_status === 'pending' ? 'generating' : (battle.image_generation_status as 'generating' | 'completed' | 'failed') || 'generating'}
          />
        )}
        
        <Toaster />
      </div>
    </div>
  )
}
