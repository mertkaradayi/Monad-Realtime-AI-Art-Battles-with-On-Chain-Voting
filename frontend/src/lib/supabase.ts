// Types for our messages table
export interface Message {
  id: string
  content: string
  author: string
  created_at: string
  updated_at: string
  original_content?: string | null
  enhancement_data?: Record<string, unknown> | null
}
