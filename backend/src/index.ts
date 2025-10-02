import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import { authenticateToken, requireWallet } from './middleware/auth.js';

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

// Messages API routes
// Get all messages
app.get('/api/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      success: true,
      data: data || []
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch messages',
      message: error.message 
    });
  }
});

// Create a new message
app.post('/api/messages', authenticateToken, requireWallet, async (req: Request, res: Response) => {
  try {
    const { content, author } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          content: content.trim(),
          author: req.user?.wallet?.address || 'Anonymous'
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({ 
      success: true,
      data 
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error creating message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create message',
      message: error.message 
    });
  }
});

// Update a message
app.put('/api/messages/:id', authenticateToken, requireWallet, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        content: content.trim(),
        author: req.user?.wallet?.address || 'Anonymous'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    res.json({ 
      success: true,
      data 
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error updating message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update message',
      message: error.message 
    });
  }
});

// Delete a message
app.delete('/api/messages/:id', authenticateToken, requireWallet, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    res.json({ 
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete message',
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
      'PUT /api/messages/:id - Update a message (🔒 Auth + Wallet required)',
      'DELETE /api/messages/:id - Delete a message (🔒 Auth + Wallet required)',
      'GET /api - This endpoint'
    ],
    authentication: {
      required: 'Bearer token from Privy authentication',
      wallet_required: 'Connected wallet required for write operations'
    }
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

