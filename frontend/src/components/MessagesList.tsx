'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
          <p className="text-center text-gray-500">No messages yet. Add one below!</p>
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
                <CardTitle className="text-lg">{message.author}</CardTitle>
                <p className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
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
            <p className="text-gray-700">{message.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
