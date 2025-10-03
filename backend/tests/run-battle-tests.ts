#!/usr/bin/env tsx

/**
 * Battle System Test Runner
 * 
 * This script runs comprehensive tests for Features 1-3:
 * - Battle Creation & QR Code Generation
 * - First Participant Auto-Joining
 * - Second Participant Joining & Battle Activation
 * - Race Condition Protection
 * - Database Constraints
 */

import { execSync } from 'child_process';
import { config } from '../src/config/config.js';

async function runTests() {
  console.log('🧪 Starting Battle System Tests...\n');

  // Check environment
  console.log('📋 Environment Check:');
  console.log(`   - Supabase URL: ${config.supabase.url ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - Service Role Key: ${config.supabase.serviceRoleKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - Privy App ID: ${config.privy.appId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - FAL Key: ${config.fal.key ? '✅ Set' : '❌ Missing'}\n`);

  try {
    // Run the battle system tests
    console.log('🚀 Running Battle System Integration Tests...\n');
    
    execSync('npx jest tests/battle-system.test.ts --verbose --detectOpenHandles', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ All Battle System Tests Passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Feature 1: Battle Creation & QR Code');
    console.log('   ✅ Feature 2: First Participant Auto-Joining');
    console.log('   ✅ Feature 3: Second Participant Joining');
    console.log('   ✅ Race Condition Protection');
    console.log('   ✅ Database Constraints');
    console.log('   ✅ Battle State Transitions');
    
    console.log('\n🎉 System is ready for manual testing!');
    console.log('\n📖 Next Steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: cd ../frontend && npm run dev');
    console.log('   3. Follow TESTING_GUIDE.md for manual testing');
    console.log('   4. Test the complete user flow with real devices');

  } catch (error) {
    console.error('\n❌ Tests Failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
