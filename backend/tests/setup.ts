import { config } from '../src/config/config.js';

// Test setup
beforeAll(async () => {
  // Verify environment is configured
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase configuration missing. Please check your .env file.');
  }
  
  if (!config.privy.appId || !config.privy.appSecret) {
    throw new Error('Privy configuration missing. Please check your .env file.');
  }
  
  if (!config.fal.key) {
    throw new Error('FAL.ai configuration missing. Please check your .env file.');
  }
  
  console.log('✅ Test environment configured successfully');
});

// Global test timeout
jest.setTimeout(30000);

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});
