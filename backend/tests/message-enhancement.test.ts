/**
 * Test script for message enhancement functionality
 * Run with: npm run test:message
 */

import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

// Import service after configuring fal.ai
import { MessageEnhancementService } from '../src/services/messageEnhancementService.js';

interface TestMessage {
  message: string;
  type: 'grammar' | 'clarity' | 'professional' | 'creative' | 'concise';
  audience: 'general' | 'professional' | 'academic' | 'casual';
}

interface TestResult {
  success: boolean;
  test: TestMessage;
  result?: any;
  error?: string;
}

async function testMessageEnhancement(): Promise<void> {
  console.log('🧪 Testing Message Enhancement Service...\n');

  // Check if FAL_KEY is set
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable is not set!');
    console.log('Please set your fal.ai API key:');
    console.log('export FAL_KEY=your_fal_ai_api_key');
    process.exit(1);
  }

  console.log('✅ FAL_KEY is configured\n');

  const testMessages: TestMessage[] = [
    {
      message: "hey can u help me with this thing its really confusing and i dont know what to do",
      type: 'grammar',
      audience: 'professional'
    },
    {
      message: "The project is going well but there are some issues that need to be addressed",
      type: 'clarity',
      audience: 'general'
    },
    {
      message: "I think we should probably maybe consider possibly looking into the potential opportunity",
      type: 'concise',
      audience: 'professional'
    },
    {
      message: "This is a very good product and I like it a lot",
      type: 'creative',
      audience: 'casual'
    }
  ];

  const results: TestResult[] = [];

  try {
    for (let i = 0; i < testMessages.length; i++) {
      const test = testMessages[i];
      console.log(`📝 Test ${i + 1}: ${test.type} enhancement for ${test.audience} audience`);
      console.log(`Original: "${test.message}"`);
      
      try {
        const result = await MessageEnhancementService.enhanceMessage({
          originalMessage: test.message,
          enhancementType: test.type,
          targetAudience: test.audience
        });

        console.log(`Enhanced: "${result.enhancedMessage}"`);
        console.log(`Improvements: ${result.improvements.join(', ')}`);
        console.log(`Confidence: ${result.confidence}%`);
        
        results.push({
          success: true,
          test,
          result
        });

      } catch (error: any) {
        console.log(`❌ Test ${i + 1} failed:`, error.message);
        results.push({
          success: false,
          test,
          error: error.message
        });
      }
      
      console.log('---\n');
    }

    // Test enhancement options
    console.log('🔧 Available Enhancement Types:');
    const types = MessageEnhancementService.getEnhancementTypes();
    types.forEach(type => console.log(`  - ${type}`));
    
    console.log('\n🎯 Available Target Audiences:');
    const audiences = MessageEnhancementService.getTargetAudiences();
    audiences.forEach(audience => console.log(`  - ${audience}`));

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 Test Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (successful > 0) {
      console.log('\n🎉 Message enhancement testing completed successfully!');
    } else {
      console.log('\n💡 This might be an authentication issue. Please check:');
      console.log('1. Your FAL_KEY is correct');
      console.log('2. You have credits available in your fal.ai account');
      console.log('3. Your API key has the necessary permissions');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Error testing message enhancement:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testMessageEnhancement().catch(console.error);
}

export { testMessageEnhancement };
