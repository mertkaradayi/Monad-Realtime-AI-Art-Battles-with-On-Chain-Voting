import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, supabase } from './config/config.js';
import { envValidation } from './config/env.js';
import { 
  auth, 
  requireWallet, 
  security, 
  compressionMiddleware, 
  rateLimiter, 
  llmRateLimiter, 
  errorHandler, 
  notFoundHandler 
} from './middleware/middleware.js';
import llmRoutes from './routes/llm.js';
import battleRoutes from './routes/battles.js';

// Validate configuration on startup
if (!envValidation.isValid) {
  console.error('❌ Configuration validation failed. Exiting...');
  process.exit(1);
}

const app = express();
const PORT = config.server.port;

// Security middleware (order matters!)
app.use(security);
app.use(compressionMiddleware);

// CORS and body parsing
app.use(cors(config.server.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// LLM API routes (with LLM-specific rate limiting)
app.use('/api/llm', auth, llmRateLimiter, llmRoutes);

// Battle API routes
app.use('/api/battles', auth, battleRoutes);

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
    message: 'AI Art Battles Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /test-supabase - Test Supabase connection',
      'POST /api/llm/generate - Generate text using fal.ai (🔒 Auth required)',
      'POST /api/llm/stream - Generate text with streaming (🔒 Auth required)',
      'GET /api/llm/models - Get available models (🔒 Auth required)',
      'POST /api/battles - Create a new battle (🔒 Auth + Wallet required)',
      'GET /api/battles - Get all battles (🔒 Auth required)',
      'GET /api/battles/:id - Get battle by ID (🔒 Auth required)',
      'POST /api/battles/:id/join - Join battle (🔒 Auth + Wallet required)',
      'GET /api - This endpoint'
    ],
    authentication: {
      required: 'Bearer token from Privy authentication',
      wallet_required: 'Connected wallet required for write operations'
    },
    features: {
      llm_integration: 'Direct access to multiple LLM models via fal.ai any-llm',
      real_time_streaming: 'Real-time text generation with streaming support',
      battle_system: 'AI art battles with concept generation and QR code joining',
      qr_codes: 'QR code generation for battle joining and voting'
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
  console.log(`🔒 Security: ${config.server.nodeEnv === 'production' ? 'Production mode' : 'Development mode'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

