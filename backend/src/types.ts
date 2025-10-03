/**
 * Application Types
 * Centralized type definitions for the Battle Semantic backend
 */

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  content: string;
  enhanced_content?: string;
  user_id: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageRequest {
  content: string;
  enhance?: boolean;
}

export interface UpdateMessageRequest {
  content?: string;
  enhanced_content?: string;
}

export interface MessageEnhancementOptions {
  style: string;
  tone: string;
  length: string;
  language: string;
}

export interface EnhancementResponse {
  enhanced_content: string;
  enhancement_type: string;
  confidence: number;
}

// ============================================================================
// LLM Types
// ============================================================================

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

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  wallet?: {
    address: string;
    chainType: string;
  };
}

export interface AuthTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

// ============================================================================
// Database Types
// ============================================================================

export interface DatabaseMessage {
  id: string;
  content: string;
  enhanced_content?: string;
  user_id: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  content: string;
  enhanced_content?: string;
  user_id: string;
  wallet_address?: string;
}

export interface UpdateMessageData {
  content?: string;
  enhanced_content?: string;
  updated_at: string;
}

// ============================================================================
// Service Types
// ============================================================================

export interface FalServiceConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface MessageEnhancementServiceConfig {
  defaultModel: string;
  maxRetries: number;
  timeout: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
  code?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Environment = 'development' | 'production' | 'test';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// ============================================================================
// Express Extensions
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
      startTime?: number;
    }
  }
}

// ============================================================================
// Configuration Types (re-exported from config)
// ============================================================================

export type {
  DatabaseConfig,
  AuthConfig,
  ServerConfig,
  ExternalConfig,
  AppConfig,
} from './config/config.js';
