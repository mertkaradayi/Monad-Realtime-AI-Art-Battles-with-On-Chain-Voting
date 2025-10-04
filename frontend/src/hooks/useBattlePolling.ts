import { useEffect, useRef, useState } from 'react'

interface UseBattlePollingOptions {
  battleId: string | null
  enabled: boolean
  interval?: number
  onUpdate: () => void
}

// Global polling manager to prevent multiple simultaneous polls
class PollingManager {
  private static instance: PollingManager
  private activePolls: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): PollingManager {
    if (!PollingManager.instance) {
      PollingManager.instance = new PollingManager()
    }
    return PollingManager.instance
  }

  startPolling(key: string, callback: () => void, interval: number): void {
    // Stop existing poll for this key if it exists
    this.stopPolling(key)
    
    const intervalId = setInterval(callback, interval)
    this.activePolls.set(key, intervalId)
  }

  stopPolling(key: string): void {
    const intervalId = this.activePolls.get(key)
    if (intervalId) {
      clearInterval(intervalId)
      this.activePolls.delete(key)
    }
  }

  stopAllPolling(): void {
    this.activePolls.forEach((intervalId) => {
      clearInterval(intervalId)
    })
    this.activePolls.clear()
  }
}

export function useBattlePolling({ 
  battleId, 
  enabled, 
  interval = 3000, 
  onUpdate 
}: UseBattlePollingOptions) {
  const [isPolling, setIsPolling] = useState(false)
  const pollingManager = PollingManager.getInstance()
  const pollKey = `battle-${battleId}`

  useEffect(() => {
    if (!enabled || !battleId) {
      pollingManager.stopPolling(pollKey)
      setIsPolling(false)
      return
    }

    const startPolling = () => {
      pollingManager.startPolling(pollKey, onUpdate, interval)
      setIsPolling(true)
    }

    startPolling()

    return () => {
      pollingManager.stopPolling(pollKey)
      setIsPolling(false)
    }
  }, [battleId, enabled, interval, onUpdate, pollKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingManager.stopPolling(pollKey)
    }
  }, [pollKey])

  return { isPolling }
}
