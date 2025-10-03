import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { envValidation } from './config/env.js';
import { supabase } from './config/supabase.js';
import { authenticateToken, requireWallet } from './middleware/auth.js';
import { 
  getSecurityConfig, 
  securityValidator 
} from './middleware/security.js';
import { 
  errorHandler, 
  notFoundHandler, 
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdown 
} from './middleware/errorHandler.js';
import llmRoutes from './routes/llmRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Validate configuration on startup
if (!envValidation.isValid) {
  console.error('❌ Configuration validation failed. Exiting...');
  process.exit(1);
}

const app = express();
const PORT = config.server.port;

// Get security configuration
const security = getSecurityConfig();

// Security middleware (order matters!)
app.use(security.headers);
app.use(security.helmet);
app.use(security.compression);
app.use(security.logging);
app.use(securityValidator);

// CORS and body parsing
app.use(cors(config.server.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(security.rateLimits.general);

// LLM API routes (with LLM-specific rate limiting)
app.use('/api/llm', authenticateToken, security.rateLimits.llm, llmRoutes);

// Message API routes
app.use('/api/messages', authenticateToken, messageRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Test Supabase connection
app.get('/test-supabase', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test (expected error for non-existent table):', error.message);
      res.json({ 
        status: 'Supabase client initialized successfully',
        message: 'Connection test completed (table does not exist, which is expected)',
        supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured'
      });
    } else {
      res.json({ 
        status: 'Supabase connected successfully',
        data 
      });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ 
      error: 'Failed to test Supabase connection',
      message: error.message 
    });
  }
});


// Basic API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Battle Semantic Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /test-supabase - Test Supabase connection',
      'GET /api/messages - Get all messages (🔒 Auth required)',
      'POST /api/messages - Create a new message (🔒 Auth + Wallet required)',
      'POST /api/messages/enhance - Enhance a message using AI (🔒 Auth required)',
      'POST /api/messages/enhanced - Create message with auto-enhancement (🔒 Auth + Wallet required)',
      'GET /api/messages/enhancement-options - Get enhancement options (🔒 Auth required)',
      'PUT /api/messages/:id - Update a message (🔒 Auth + Wallet required)',
      'DELETE /api/messages/:id - Delete a message (🔒 Auth + Wallet required)',
      'POST /api/llm/generate - Generate text using fal.ai (🔒 Auth required)',
      'POST /api/llm/stream - Generate text with streaming (🔒 Auth required)',
      'GET /api/llm/models - Get available models (🔒 Auth required)',
      'GET /api - This endpoint'
    ],
    authentication: {
      required: 'Bearer token from Privy authentication',
      wallet_required: 'Connected wallet required for write operations'
    },
    features: {
      message_enhancement: 'AI-powered message enhancement using fal.ai',
      llm_integration: 'Direct access to multiple LLM models via fal.ai any-llm',
      real_time_streaming: 'Real-time text generation with streaming support'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Supabase test: http://localhost:${PORT}/test-supabase`);
  console.log(`📋 API info: http://localhost:${PORT}/api`);
  console.log(`🔒 Security: ${security.isProduction ? 'Production mode' : 'Development mode'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', unhandledRejectionHandler);

// Handle uncaught exceptions
process.on('uncaughtException', uncaughtExceptionHandler);

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
process.on('SIGINT', () => gracefulShutdown('SIGINT', server));

