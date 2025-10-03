'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MessagesListProps {
  messages: Message[]
  onDelete: (id: string) => void
  onEdit: (message: Message) => void
}

export function MessagesList({ messages, onDelete, onEdit }: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No messages yet. Add one below!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{message.author}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(message.created_at).toLocaleDateString()}
                  </Badge>
                  {message.original_content && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✨ Enhanced
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(message)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{message.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
