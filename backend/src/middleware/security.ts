import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config.js';
import { getClientIP, log } from '../utils.js';

/**
 * Security Middleware
 * Comprehensive security middleware for the Battle Semantic backend
 */

// ============================================================================
// Helmet Configuration
// ============================================================================

/**
 * Configure Helmet for security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const ip = getClientIP(req);
    log('warn', `Rate limit exceeded for IP: ${ip}`, {
      ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const ip = getClientIP(req);
    log('warn', `Auth rate limit exceeded for IP: ${ip}`, {
      ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts, please try again later.',
    });
  },
});

/**
 * LLM API rate limiter (more restrictive)
 */
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 LLM requests per minute
  message: {
    success: false,
    error: 'LLM Rate Limit Exceeded',
    message: 'Too many LLM requests, please wait before making another request.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const ip = getClientIP(req);
    log('warn', `LLM rate limit exceeded for IP: ${ip}`, {
      ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: 'LLM Rate Limit Exceeded',
      message: 'Too many LLM requests, please wait before making another request.',
    });
  },
});

// ============================================================================
// Compression Middleware
// ============================================================================

/**
 * Configure compression for response optimization
 */
export const compressionConfig = compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: Request, res: Response) => {
    // Don't compress if the request includes a no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use the default filter function
    return compression.filter(req, res);
  },
});

// ============================================================================
// Security Headers Middleware
// ============================================================================

/**
 * Additional security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add server information (can be customized)
  res.setHeader('Server', 'Battle-Semantic-API/1.0.0');
  
  next();
};

// ============================================================================
// Request Logging Middleware
// ============================================================================

/**
 * Log all incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Generate request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  req.startTime = startTime;
  
  // Log request
  log('info', `Incoming request`, {
    requestId,
    method: req.method,
    path: req.path,
    ip,
    userAgent: userAgent.substring(0, 100), // Truncate user agent
    timestamp: new Date().toISOString(),
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    log('info', `Request completed`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      ip,
    });
  });
  
  next();
};

// ============================================================================
// Environment-based Security
// ============================================================================

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const isProduction = config.server.nodeEnv === 'production';
  
  return {
    helmet: helmetConfig,
    compression: compressionConfig,
    rateLimits: {
      general: generalLimiter,
      auth: authLimiter,
      llm: llmLimiter,
    },
    headers: securityHeaders,
    logging: requestLogger,
    isProduction,
  };
}

// ============================================================================
// Security Validation
// ============================================================================

/**
 * Validate request for security issues
 */
export const securityValidator = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
  ];
  
  const url = req.url.toLowerCase();
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (hasSuspiciousPattern) {
    const ip = getClientIP(req);
    log('warn', `Suspicious request detected`, {
      ip,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
    
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid request format.',
    });
  }
  
  next();
};
