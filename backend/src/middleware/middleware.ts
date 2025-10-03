import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from '../config/config.js';

// Initialize Privy client
const privy = new PrivyClient(
  config.auth.privy.appId,
  config.auth.privy.appSecret
);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        wallet?: {
          address: string;
          chainType: string;
        };
      };
    }
  }
}

/**
 * Authentication middleware
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const verifiedClaims = await privy.verifyAuthToken(token);
    
    if (!verifiedClaims || !verifiedClaims.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    const user = await privy.getUser(verifiedClaims.userId);
    
    req.user = {
      id: verifiedClaims.userId,
      wallet: user.wallet ? {
        address: user.wallet.address,
        chainType: user.wallet.chainType || 'ethereum'
      } : undefined
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Wallet requirement middleware
 */
export const requireWallet = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.wallet?.address) {
    return res.status(403).json({
      success: false,
      error: 'Wallet required'
    });
  }
  next();
};

/**
 * Security middleware
 */
export const security = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
});

/**
 * Compression middleware
 */
export const compressionMiddleware = compression();

/**
 * Rate limiting
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests'
  },
});

export const llmRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 LLM requests per minute
  message: {
    success: false,
    error: 'LLM Rate Limit Exceeded'
  },
});

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);
  
  const statusCode = 500;
  const message = 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    message: error.message
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
