'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Message } from '@/lib/supabase'
import { MessagesList } from '@/components/MessagesList'
import { MessageForm } from '@/components/MessageForm'
import { AuthButton } from '@/components/AuthButton'
import { LoginPage } from '@/components/LoginPage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function Home() {
  const { ready, authenticated, user } = usePrivy()
  const [messages, setMessages] = useState<Message[]>([])
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await api.getMessages()
      
      if (result.success) {
        setMessages(result.data)
      } else {
        setError(result.error || 'Failed to fetch messages')
        toast.error('Failed to fetch messages')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to view messages')
        toast.error('Authentication required')
      } else {
        setError('Failed to connect to the backend server')
        console.error('Error fetching messages:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new message with automatic enhancement
  const handleCreateMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Show enhancement in progress
      toast.info('Enhancing your message...')
      
      const result = await api.createEnhancedMessage(content, 'clarity', 'general')
      
      if (result.success) {
        setMessages([result.data, ...messages])
        
        // Show success message with enhancement info
        if (result.data.enhancement) {
          toast.success('Message enhanced and created successfully!', {
            description: `Confidence: ${result.data.enhancement.confidence}%`
          })
        } else {
          toast.success('Message created successfully!')
        }
      } else {
        setError(result.error || 'Failed to create message')
        toast.error('Failed to create message')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to create messages')
        toast.error('Authentication required')
      } else {
        setError('Failed to connect to the backend server')
        console.error('Error creating message:', err)
        toast.error('Failed to enhance message, please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Update a message
  const handleUpdateMessage = async (id: string, content: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await api.updateMessage(id, content)
      
      if (result.success) {
        setMessages(messages.map(msg => msg.id === id ? result.data : msg))
        setEditingMessage(null)
        toast.success('Message updated successfully!')
      } else {
        setError(result.error || 'Failed to update message')
        toast.error('Failed to update message')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to update messages')
        toast.error('Authentication required')
      } else {
        setError('Failed to connect to the backend server')
        console.error('Error updating message:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const result = await api.deleteMessage(id)
      
      if (result.success) {
        setMessages(messages.filter(msg => msg.id !== id))
        toast.success('Message deleted successfully!')
      } else {
        setError(result.error || 'Failed to delete message')
        toast.error('Failed to delete message')
      }
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        setError('Please connect your wallet to delete messages')
        toast.error('Authentication required')
      } else {
        setError('Failed to connect to the backend server')
        console.error('Error deleting message:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load messages on component mount
  useEffect(() => {
    if (authenticated) {
      fetchMessages()
    }
  }, [authenticated])

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
              Battle Semantic
            </h1>
            <p className="text-muted-foreground">
              AI-powered message enhancement with Supabase storage
            </p>
          </div>
          <div className="ml-4">
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
                  onClick={fetchMessages}
                >
                  Try again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <MessageForm
            onSubmit={handleCreateMessage}
            onUpdate={handleUpdateMessage}
            editingMessage={editingMessage}
            onCancel={() => setEditingMessage(null)}
            isLoading={isLoading}
          />

          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
                <Badge variant="outline">{messages.length}</Badge>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={fetchMessages}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            <MessagesList
              messages={messages}
              onDelete={handleDeleteMessage}
              onEdit={setEditingMessage}
            />
          </div>
        </div>

        <Alert className="mt-12">
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-2">
                How this works:
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• Messages are automatically enhanced using AI (fal.ai)</li>
                <li>• Frontend sends HTTP requests to the backend API</li>
                <li>• Backend uses Supabase client to interact with the database</li>
                <li>• Enhanced messages are stored with original content preserved</li>
                <li>• Real-time updates could be added with Supabase subscriptions</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        
        <Toaster />
      </div>
    </div>
  )
}