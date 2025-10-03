/**
 * Essential Types for Battle Semantic Backend
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Message Types
export interface Message {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  original_content?: string;
  enhancement_data?: any;
}

export interface CreateMessageRequest {
  content: string;
  author?: string;
  enhancementType?: string;
  targetAudience?: string;
  autoEnhance?: boolean;
}

export interface UpdateMessageRequest {
  content: string;
}

// LLM Types
export interface LLMRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMResponse {
  data: {
    output: string;
    reasoning?: string | null;
    partial: boolean;
    error?: string | null;
  };
  requestId: string;
}

// Enhancement Types
export interface EnhancementRequest {
  originalMessage: string;
  enhancementType?: 'grammar' | 'clarity' | 'professional' | 'creative' | 'concise';
  targetAudience?: 'general' | 'professional' | 'academic' | 'casual';
}

export interface EnhancementResponse {
  originalMessage: string;
  enhancedMessage: string;
  enhancementType: string;
  improvements: string[];
  confidence: number;
}

// User Types
export interface AuthenticatedUser {
  id: string;
  wallet?: {
    address: string;
    chainType: string;
  };
}

// Express Extensions
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}