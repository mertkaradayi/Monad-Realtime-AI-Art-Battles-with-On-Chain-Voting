'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AuthButton } from '@/components/AuthButton'
import { LoginPage } from '@/components/LoginPage'
import ThemeToggle from '@/components/ThemeToggle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface Battle {
  id: string
  concept: string
  status: 'waiting' | 'active' | 'voting' | 'completed' | 'cancelled'
  created_at: string
  joining_qr_data: string | null
  joiningQR?: string
}

export default function Home() {
  const { ready, authenticated } = usePrivy()
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
              {/* Battle Concept */}
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

              {/* QR Code Display */}
              {battle.joiningQR && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Scan to Join Battle</CardTitle>
                    <p className="text-center text-muted-foreground">
                      First 2 users to scan will become participants
                    </p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={battle.joiningQR} 
                        alt="Battle Join QR Code"
                        className="w-80 h-80 border rounded-lg"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Battle ID: {battle.id}</p>
                      <p>Status: {battle.status}</p>
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
                  onClick={() => window.location.reload()}
                  disabled={isLoading}
                >
                  Refresh Status
                </Button>
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