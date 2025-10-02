'use client'

import { useState } from 'react'
import { Message } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface MessageFormProps {
  onSubmit: (content: string, author: string) => void
  onUpdate?: (id: string, content: string, author: string) => void
  editingMessage?: Message | null
  onCancel?: () => void
  isLoading?: boolean
}

export function MessageForm({ 
  onSubmit, 
  onUpdate, 
  editingMessage, 
  onCancel, 
  isLoading = false 
}: MessageFormProps) {
  const [content, setContent] = useState(editingMessage?.content || '')
  const [author, setAuthor] = useState(editingMessage?.author || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    if (editingMessage && onUpdate) {
      onUpdate(editingMessage.id, content.trim(), author.trim() || 'Anonymous')
    } else {
      onSubmit(content.trim(), author.trim() || 'Anonymous')
    }
    
    if (!editingMessage) {
      setContent('')
      setAuthor('')
    }
  }

  const handleCancel = () => {
    setContent('')
    setAuthor('')
    onCancel?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingMessage ? 'Edit Message' : 'Add New Message'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author">
              Author (optional)
            </Label>
            <Input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">
              Message *
            </Label>
            <Input
              id="content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={!content.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : (editingMessage ? 'Update' : 'Add')}
            </Button>
            
            {editingMessage && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
