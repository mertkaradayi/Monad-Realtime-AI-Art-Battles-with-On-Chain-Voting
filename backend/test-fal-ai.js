/**
 * Simple test script to verify fal.ai integration
 * Run with: node test-fal-ai.js
 * Make sure to set FAL_KEY environment variable first
 */

import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

async function testFalAI() {
  console.log('🧪 Testing fal.ai any-llm integration...\n');

  // Check if FAL_KEY is set
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable is not set!');
    console.log('Please set your fal.ai API key:');
    console.log('export FAL_KEY=your_fal_ai_api_key');
    process.exit(1);
  }

  console.log('✅ FAL_KEY is configured');

  try {
    // Test with a simple prompt
    console.log('🚀 Sending test request to fal.ai any-llm...');
    
    const response = await fal.run('fal-ai/any-llm', {
      input: {
        model: 'anthropic/claude-3.5-sonnet',
        prompt: 'Hello! Can you tell me a short joke?',
        temperature: 0.7,
        max_tokens: 100
      }
    });

    console.log('✅ Success! Response received:');
    console.log('📝 Generated text:', response.data.output);
    console.log('🆔 Request ID:', response.requestId);
    console.log('\n🎉 fal.ai integration is working correctly!');

    // Test new models
    console.log('\n🧪 Testing new models...');
    
    // Test google/gemini-2.5-pro
    console.log('Testing google/gemini-2.5-pro...');
    try {
      const geminiResponse = await fal.run('fal-ai/any-llm', {
        input: {
          model: 'google/gemini-2.5-pro',
          prompt: 'What is 2+2?',
          temperature: 0.1,
          max_tokens: 50
        }
      });
      console.log('✅ Gemini 2.5 Pro response:', geminiResponse.data.output);
    } catch (error) {
      console.log('⚠️  Gemini 2.5 Pro test failed:', error.message);
    }

    // Test openai/gpt-5-nano
    console.log('Testing openai/gpt-5-nano...');
    try {
      const gpt5Response = await fal.run('fal-ai/any-llm', {
        input: {
          model: 'openai/gpt-5-nano',
          prompt: 'What is 3+3?',
          temperature: 0.1,
          max_tokens: 50
        }
      });
      console.log('✅ GPT-5 Nano response:', gpt5Response.data.output);
    } catch (error) {
      console.log('⚠️  GPT-5 Nano test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Error testing fal.ai integration:');
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
testFalAI();
