/**
 * Test script for message enhancement functionality
 * Run with: node test-message-enhancement.js
 * Make sure to set FAL_KEY environment variable first
 */

import { MessageEnhancementService } from './dist/services/messageEnhancementService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMessageEnhancement() {
  console.log('🧪 Testing Message Enhancement Service...\n');

  // Check if FAL_KEY is set
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable is not set!');
    console.log('Please set your fal.ai API key:');
    console.log('export FAL_KEY=your_fal_ai_api_key');
    process.exit(1);
  }

  console.log('✅ FAL_KEY is configured\n');

  const testMessages = [
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

  try {
    for (let i = 0; i < testMessages.length; i++) {
      const test = testMessages[i];
      console.log(`📝 Test ${i + 1}: ${test.type} enhancement for ${test.audience} audience`);
      console.log(`Original: "${test.message}"`);
      
      const result = await MessageEnhancementService.enhanceMessage({
        originalMessage: test.message,
        enhancementType: test.type,
        targetAudience: test.audience
      });

      console.log(`Enhanced: "${result.enhancedMessage}"`);
      console.log(`Improvements: ${result.improvements.join(', ')}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log('---\n');
    }

    // Test enhancement options
    console.log('🔧 Available Enhancement Types:');
    const types = MessageEnhancementService.getEnhancementTypes();
    types.forEach(type => console.log(`  - ${type}`));
    
    console.log('\n🎯 Available Target Audiences:');
    const audiences = MessageEnhancementService.getTargetAudiences();
    audiences.forEach(audience => console.log(`  - ${audience}`));

    console.log('\n🎉 Message enhancement testing completed successfully!');

  } catch (error) {
    console.error('❌ Error testing message enhancement:');
    console.error(error.message);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('\n💡 This might be an authentication issue. Please check:');
      console.log('1. Your FAL_KEY is correct');
      console.log('2. You have credits available in your fal.ai account');
      console.log('3. Your API key has the necessary permissions');
    }
    
    process.exit(1);
  }
}

// Run the test
testMessageEnhancement();
