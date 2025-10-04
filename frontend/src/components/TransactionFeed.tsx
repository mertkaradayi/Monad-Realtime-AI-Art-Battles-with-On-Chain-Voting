'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Transaction {
  hash: string
  voter: string
  participant: number
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  gasUsed?: number
  blockNumber?: number
}

interface TransactionFeedProps {
  transactions: Transaction[]
  maxTransactions?: number
  className?: string
}

export function TransactionFeed({ 
  transactions, 
  maxTransactions = 50,
  className 
}: TransactionFeedProps) {
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Sort transactions by timestamp (newest first) and limit display
    const sortedTransactions = [...transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxTransactions)
    
    setDisplayedTransactions(sortedTransactions)
  }, [transactions, maxTransactions])

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Confirmed</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) {
      return `${seconds}s ago`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`
    } else {
      return new Date(timestamp).toLocaleTimeString()
    }
  }

  const getParticipantColor = (participant: number) => {
    return participant === 1 ? 'text-blue-600' : 'text-purple-600'
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-xl text-center">
          🔗 Real-time Transaction Feed
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Live voting transactions from Monad testnet
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-3">
            {displayedTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">⏳</div>
                <p>Waiting for transactions...</p>
              </div>
            ) : (
              displayedTransactions.map((tx, index) => (
                <div
                  key={tx.hash}
                  className={cn(
                    'p-3 rounded-lg border transition-all duration-300',
                    'hover:shadow-md',
                    index === 0 && 'bg-green-50 border-green-200',
                    tx.status === 'pending' && 'bg-yellow-50 border-yellow-200',
                    tx.status === 'failed' && 'bg-red-50 border-red-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Voter:</span>
                      <span className="text-sm font-mono">
                        {tx.voter.slice(0, 6)}...{tx.voter.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Voted for:</span>
                      <span className={cn(
                        'text-sm font-semibold',
                        getParticipantColor(tx.participant)
                      )}>
                        Participant {tx.participant}
                      </span>
                    </div>
                  </div>
                  
                  {tx.gasUsed && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Gas used: {tx.gasUsed.toString()} | Block: {tx.blockNumber}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates from Monad testnet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface VotingMetricsProps {
  totalVotes: number
  participant1Votes: number
  participant2Votes: number
  pendingTransactions: number
  confirmedTransactions: number
  averageGasUsed?: number
  className?: string
}

export function VotingMetrics({
  totalVotes,
  participant1Votes,
  participant2Votes,
  pendingTransactions,
  confirmedTransactions,
  averageGasUsed,
  className
}: VotingMetricsProps) {
  const participationRate = totalVotes > 0 ? ((participant1Votes + participant2Votes) / totalVotes) * 100 : 0

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-xl text-center">
          📊 Voting Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participant1Votes}</div>
            <div className="text-sm text-muted-foreground">Participant 1</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{participant2Votes}</div>
            <div className="text-sm text-muted-foreground">Participant 2</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{confirmedTransactions}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingTransactions}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
        
        {averageGasUsed && (
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              Average Gas Used: {averageGasUsed.toLocaleString()} wei
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
