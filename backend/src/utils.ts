import { Request, Response } from 'express';
import { ApiResponse, AppError, ValidationError, LogLevel } from './types.js';

/**
 * Utility Functions
 * Common helper functions for the Battle Semantic backend
 */

// ============================================================================
// Response Utilities
// ============================================================================

/**
 * Send a successful API response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error API response
 */
export function sendError(
  res: Response,
  error: string,
  message?: string,
  statusCode: number = 500,
  details?: ValidationError[]
): void {
  const response: ApiResponse = {
    success: false,
    error,
    ...(message && { message }),
    ...(details && { details }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response,
  errors: ValidationError[],
  message: string = 'Validation failed'
): void {
  sendError(res, 'Validation Error', message, 400, errors);
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Create a custom application error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  if (code) error.code = code;
  return error;
}

export type { AppError };

/**
 * Check if error is operational (expected)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof Error && 'isOperational' in error) {
    return (error as AppError).isOperational;
  }
  return false;
}

/**
 * Handle async errors in route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: Function) => Promise<any>
) {
  return (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        value: data[field],
      });
    }
  });
  
  return errors;
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (value.length < min) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters long`,
      value,
    });
  }
  
  if (value.length > max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be no more than ${max} characters long`,
      value,
    });
  }
  
  return errors;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate wallet address format (basic Ethereum address)
 */
export function validateWalletAddress(address: string): boolean {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${generateRandomString(8)}`;
}

/**
 * Truncate string to specified length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): string {
  return formatDate(new Date());
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// ============================================================================
// Logging Utilities
// ============================================================================

/**
 * Log with timestamp and level
 */
export function log(level: LogLevel, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case 'warn':
      console.warn(logMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case 'info':
      console.info(logMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case 'debug':
      console.debug(logMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
  }
}

/**
 * Log error with stack trace
 */
export function logError(error: Error, context?: string): void {
  const message = context ? `${context}: ${error.message}` : error.message;
  log('error', message, {
    stack: error.stack,
    name: error.name,
  });
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Measure execution time
 */
export function measureTime<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  log('debug', `${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Measure async execution time
 */
export async function measureTimeAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  log('debug', `${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

// ============================================================================
// Environment Utilities
// ============================================================================

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

// ============================================================================
// Request Utilities
// ============================================================================

/**
 * Get client IP address
 */
export function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Get user agent
 */
export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Sanitize request data for logging
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'authorization'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
