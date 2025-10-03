/**
 * Essential Types for AI Art Battles Backend
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// Battle Concept Types
export interface BattleConceptRequest {
  prompt: string;
  temperature?: number;
}

export interface BattleConceptResponse {
  concept: string;
  reasoning?: string;
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