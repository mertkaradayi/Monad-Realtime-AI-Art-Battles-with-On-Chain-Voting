import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import { config } from '../config/config.js';

// Initialize Privy client with centralized configuration
const privy = new PrivyClient(
  config.auth.privy.appId,
  config.auth.privy.appSecret
);

// Extend Express Request type to include user
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

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify the access token with Privy
    const verifiedClaims = await privy.verifyAuthToken(token);
    
    if (!verifiedClaims || !verifiedClaims.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Get user details to access wallet information
    const user = await privy.getUser(verifiedClaims.userId);
    
    // Attach user info to request
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
      error: 'Authentication failed',
      message: 'Unable to verify authentication token'
    });
  }
};

// Optional: Middleware to check if user has a wallet connected
export const requireWallet = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.wallet?.address) {
    return res.status(403).json({
      success: false,
      error: 'Wallet required',
      message: 'A connected wallet is required for this operation'
    });
  }
  next();
};
