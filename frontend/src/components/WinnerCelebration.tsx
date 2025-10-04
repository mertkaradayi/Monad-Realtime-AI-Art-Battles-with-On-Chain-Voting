'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type WinnerInfo } from '@/lib/contracts'

interface WinnerCelebrationProps {
  winnerInfo: WinnerInfo
  battleConcept: string
  participant1Address: string
  participant2Address: string
  participant1ImageUrl: string
  participant2ImageUrl: string
  contractAddress: string
  battleId: string
  onClose?: () => void
}

export function WinnerCelebration({
  winnerInfo,
  battleConcept,
  participant1Address,
  participant2Address,
  participant1ImageUrl,
  participant2ImageUrl,
  contractAddress,
  battleId,
  onClose
}: WinnerCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true)
    
    // Animation phases
    const phases = [
      () => setAnimationPhase(1), // Initial reveal
      () => setAnimationPhase(2), // Winner highlight
      () => setAnimationPhase(3), // Final celebration
    ]

    phases.forEach((phase, index) => {
      setTimeout(phase, index * 1000)
    })
  }, [])

  const isParticipant1Winner = winnerInfo.winner === participant1Address
  const isParticipant2Winner = winnerInfo.winner === participant2Address

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="border-4 border-gold-500 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">
              🏆 WINNER ANNOUNCED! 🏆
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Battle Concept */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Battle Concept</h3>
              <p className="text-xl text-muted-foreground italic">
                &ldquo;{battleConcept}&rdquo;
              </p>
            </div>

            {/* Winner Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Participant 1 */}
              <div className={`relative transition-all duration-1000 ${
                isParticipant1Winner 
                  ? 'scale-105 ring-4 ring-yellow-400 ring-opacity-75' 
                  : 'opacity-70'
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
                  <CardContent>
                    <div className="relative">
                      <img
                        src={participant1ImageUrl}
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
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        {participant1Address.slice(0, 6)}...{participant1Address.slice(-4)}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {winnerInfo.participant1Votes} votes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participant 2 */}
              <div className={`relative transition-all duration-1000 ${
                isParticipant2Winner 
                  ? 'scale-105 ring-4 ring-yellow-400 ring-opacity-75' 
                  : 'opacity-70'
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
                  <CardContent>
                    <div className="relative">
                      <img
                        src={participant2ImageUrl}
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
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        {participant2Address.slice(0, 6)}...{participant2Address.slice(-4)}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {winnerInfo.participant2Votes} votes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="text-center space-y-4">
              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="text-3xl">⛓️</div>
                    <h3 className="text-xl font-bold text-green-600">On-Chain Verification</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <strong>Contract:</strong> {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Battle ID:</strong> {battleId}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Network:</strong> Monad Testnet (Chain ID: 10143)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`https://testnet.monadexplorer.com/address/${contractAddress}`, '_blank')}
                      className="mt-2"
                    >
                      View on Monad Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Final Results */}
            <div className="text-center">
              <Card className="border-2 border-blue-500 bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">Final Results</h3>
                  <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                      <p className="font-semibold">Participant 1</p>
                      <p className="text-3xl font-bold text-blue-600">{winnerInfo.participant1Votes}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Participant 2</p>
                      <p className="text-3xl font-bold text-blue-600">{winnerInfo.participant2Votes}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ✅ Winner determined by smart contract on Monad testnet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All results are publicly verifiable on the blockchain
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Close Button */}
            {onClose && (
              <div className="text-center">
                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg px-8 py-3"
                >
                  Close Celebration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
