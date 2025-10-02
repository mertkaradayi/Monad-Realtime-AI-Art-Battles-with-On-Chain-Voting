'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/lib/supabase'
import { MessagesList } from '@/components/MessagesList'
import { MessageForm } from '@/components/MessageForm'

const API_BASE_URL = 'http://localhost:3001'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/messages`)
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data)
      } else {
        setError(result.error || 'Failed to fetch messages')
      }
    } catch (err) {
      setError('Failed to connect to the backend server')
      console.error('Error fetching messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new message
  const handleCreateMessage = async (content: string, author: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessages([result.data, ...messages])
      } else {
        setError(result.error || 'Failed to create message')
      }
    } catch (err) {
      setError('Failed to connect to the backend server')
      console.error('Error creating message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Update a message
  const handleUpdateMessage = async (id: string, content: string, author: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessages(messages.map(msg => msg.id === id ? result.data : msg))
        setEditingMessage(null)
      } else {
        setError(result.error || 'Failed to update message')
      }
    } catch (err) {
      setError('Failed to connect to the backend server')
      console.error('Error updating message:', err)
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
      const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessages(messages.filter(msg => msg.id !== id))
      } else {
        setError(result.error || 'Failed to delete message')
      }
    } catch (err) {
      setError('Failed to connect to the backend server')
      console.error('Error deleting message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load messages on component mount
  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Supabase Messages Demo
          </h1>
          <p className="text-gray-600">
            A simple example of storing and retrieving data with Supabase
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <button 
              onClick={fetchMessages}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
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
              <h2 className="text-2xl font-semibold text-gray-900">Messages</h2>
              <button
                onClick={fetchMessages}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            <MessagesList
              messages={messages}
              onDelete={handleDeleteMessage}
              onEdit={setEditingMessage}
            />
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How this works:
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Frontend sends HTTP requests to the backend API</li>
            <li>• Backend uses Supabase client to interact with the database</li>
            <li>• Data is stored in a PostgreSQL table called "messages"</li>
            <li>• Real-time updates could be added with Supabase subscriptions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}