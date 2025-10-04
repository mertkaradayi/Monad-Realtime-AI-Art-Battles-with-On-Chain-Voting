'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AnimatedVoteCounterProps {
  participant: 1 | 2
  voteCount: number
  previousVoteCount: number
  isActive: boolean
  participantAddress?: string
  color: 'blue' | 'purple'
  className?: string
}

export function AnimatedVoteCounter({
  participant,
  voteCount,
  previousVoteCount,
  isActive,
  participantAddress,
  color,
  className
}: AnimatedVoteCounterProps) {
  const [displayCount, setDisplayCount] = useState(voteCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Animate vote count changes
  useEffect(() => {
    if (voteCount !== previousVoteCount) {
      setIsAnimating(true)
      setPulseAnimation(true)
      
      // Animate the count change
      const startCount = previousVoteCount
      const endCount = voteCount
      const duration = 1000 // 1 second animation
      const steps = 20
      const stepDuration = duration / steps
      const stepSize = (endCount - startCount) / steps
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const currentCount = Math.round(startCount + (stepSize * currentStep))
        setDisplayCount(currentCount)
        
        if (currentStep >= steps) {
          clearInterval(interval)
          setDisplayCount(endCount)
          setIsAnimating(false)
          
          // Stop pulse animation after a delay
          setTimeout(() => setPulseAnimation(false), 500)
        }
      }, stepDuration)
      
      return () => clearInterval(interval)
    }
  }, [voteCount, previousVoteCount])

  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      badge: 'bg-blue-600',
      pulse: 'bg-blue-200'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      badge: 'bg-purple-600',
      pulse: 'bg-purple-200'
    }
  }

  const currentColor = colorClasses[color]

  return (
    <Card className={cn(
      'border-2 transition-all duration-500',
      currentColor.border,
      isActive && 'shadow-lg scale-105',
      pulseAnimation && 'animate-pulse',
      className
    )}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Participant Badge */}
          <div className="flex justify-center">
            <Badge className={cn(
              'text-white text-lg px-4 py-2',
              currentColor.badge
            )}>
              Participant {participant}
            </Badge>
          </div>

          {/* Vote Count Display */}
          <div className="relative">
            <div className={cn(
              'text-6xl font-bold transition-all duration-300',
              currentColor.text,
              isAnimating && 'scale-110',
              pulseAnimation && 'animate-bounce'
            )}>
              {displayCount}
            </div>
            
            {/* Vote count label */}
            <div className="text-sm text-muted-foreground mt-2">
              {displayCount === 1 ? 'vote' : 'votes'}
            </div>
            
            {/* Live indicator */}
            {isActive && (
              <div className="absolute -top-2 -right-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Participant Address */}
          {participantAddress && (
            <div className="text-xs text-muted-foreground font-mono">
              {participantAddress.slice(0, 6)}...{participantAddress.slice(-4)}
            </div>
          )}

          {/* Blockchain indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live from Monad testnet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface VoteCountersProps {
  participant1Votes: number
  participant2Votes: number
  previousParticipant1Votes: number
  previousParticipant2Votes: number
  isVotingActive: boolean
  participant1Address?: string
  participant2Address?: string
  className?: string
}

export function VoteCounters({
  participant1Votes,
  participant2Votes,
  previousParticipant1Votes,
  previousParticipant2Votes,
  isVotingActive,
  participant1Address,
  participant2Address,
  className
}: VoteCountersProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8', className)}>
      <AnimatedVoteCounter
        participant={1}
        voteCount={participant1Votes}
        previousVoteCount={previousParticipant1Votes}
        isActive={isVotingActive}
        participantAddress={participant1Address}
        color="blue"
      />
      
      <AnimatedVoteCounter
        participant={2}
        voteCount={participant2Votes}
        previousVoteCount={previousParticipant2Votes}
        isActive={isVotingActive}
        participantAddress={participant2Address}
        color="purple"
      />
    </div>
  )
}
