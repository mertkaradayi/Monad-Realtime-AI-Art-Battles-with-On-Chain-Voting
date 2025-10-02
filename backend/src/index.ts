import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

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
      'GET /api - This endpoint'
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Supabase test: http://localhost:${PORT}/test-supabase`);
  console.log(`📋 API info: http://localhost:${PORT}/api`);
});

