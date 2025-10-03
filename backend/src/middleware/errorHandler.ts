import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError, logError, getClientIP } from '../utils.js';
import { config } from '../config/config.js';

/**
 * Global Error Handling Middleware
 * Comprehensive error handling for the Battle Semantic backend
 */

// ============================================================================
// Error Handler
// ============================================================================

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle different types of errors
  if (error instanceof Error && 'statusCode' in error) {
    // Custom application error
    const appError = error as AppError;
    statusCode = appError.statusCode;
    message = appError.message;
    isOperational = appError.isOperational;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error (if using MongoDB)
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    // Mongoose cast error
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing error
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Log error details
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    statusCode,
    isOperational,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  };

  // Log operational errors as warnings, others as errors
  if (isOperational) {
    logError(error, `Operational Error: ${req.method} ${req.path}`);
  } else {
    logError(error, `System Error: ${req.method} ${req.path}`);
  }

  // Send error response
  const response: any = {
    success: false,
    error: message,
    message: isOperational ? message : 'Something went wrong!',
  };

  // Include error code if available
  if ('code' in error && error.code) {
    response.code = error.code;
  }

  // Include request ID for tracking
  if (req.requestId) {
    response.requestId = req.requestId;
  }

  // Include validation details if available
  if ('details' in error && error.details) {
    response.details = error.details;
  }

  // In development, include stack trace
  if (config.server.nodeEnv === 'development') {
    response.stack = error.stack;
    response.details = errorDetails;
  }

  res.status(statusCode).json(response);
};

// ============================================================================
// Async Error Handler
// ============================================================================

/**
 * Wrapper for async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// 404 Handler
// ============================================================================

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`) as AppError;
  error.statusCode = 404;
  error.isOperational = true;

  logError(error, `404 Not Found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.requestId,
  });
};

// ============================================================================
// Unhandled Promise Rejection Handler
// ============================================================================

/**
 * Handle unhandled promise rejections
 */
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  const error = new Error(`Unhandled Promise Rejection: ${reason}`) as AppError;
  error.statusCode = 500;
  error.isOperational = false;

  logError(error, 'Unhandled Promise Rejection');

  // In production, exit the process
  if (config.server.nodeEnv === 'production') {
    console.error('Unhandled Promise Rejection. Exiting...');
    process.exit(1);
  }
};

// ============================================================================
// Uncaught Exception Handler
// ============================================================================

/**
 * Handle uncaught exceptions
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  const appError = error as AppError;
  appError.statusCode = 500;
  appError.isOperational = false;

  logError(appError, 'Uncaught Exception');

  // Always exit on uncaught exceptions
  console.error('Uncaught Exception. Exiting...');
  process.exit(1);
};

// ============================================================================
// Graceful Shutdown Handler
// ============================================================================

/**
 * Handle graceful shutdown
 */
export const gracefulShutdown = (signal: string, server: any): void => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close((err: any) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// ============================================================================
// Error Types
// ============================================================================

/**
 * Common error types for the application
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Create validation error
 */
export const createValidationError = (message: string, details?: any): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.isOperational = true;
  error.code = ErrorTypes.VALIDATION_ERROR;
  if (details) error.details = details;
  return error;
};

/**
 * Create authentication error
 */
export const createAuthError = (message: string = 'Authentication failed'): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = 401;
  error.isOperational = true;
  error.code = ErrorTypes.AUTHENTICATION_ERROR;
  return error;
};

/**
 * Create authorization error
 */
export const createAuthorizationError = (message: string = 'Access denied'): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = 403;
  error.isOperational = true;
  error.code = ErrorTypes.AUTHORIZATION_ERROR;
  return error;
};

/**
 * Create not found error
 */
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  const error = new Error(`${resource} not found`) as AppError;
  error.statusCode = 404;
  error.isOperational = true;
  error.code = ErrorTypes.NOT_FOUND_ERROR;
  return error;
};

/**
 * Create conflict error
 */
export const createConflictError = (message: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = 409;
  error.isOperational = true;
  error.code = ErrorTypes.CONFLICT_ERROR;
  return error;
};

/**
 * Create external service error
 */
export const createExternalServiceError = (service: string, message: string): AppError => {
  const error = new Error(`${service} service error: ${message}`) as AppError;
  error.statusCode = 502;
  error.isOperational = true;
  error.code = ErrorTypes.EXTERNAL_SERVICE_ERROR;
  return error;
};
