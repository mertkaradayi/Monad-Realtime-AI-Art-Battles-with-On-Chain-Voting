/**
 * Test script to verify fal.ai integration
 * Run with: npm run test:fal
 */

import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

interface TestResult {
  success: boolean;
  model: string;
  response?: string;
  error?: string;
}

async function testFalAI(): Promise<void> {
  console.log('🧪 Testing fal.ai any-llm integration...\n');

  // Check if FAL_KEY is set
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable is not set!');
    console.log('Please set your fal.ai API key:');
    console.log('export FAL_KEY=your_fal_ai_api_key');
    process.exit(1);
  }

  console.log('✅ FAL_KEY is configured');

  const testModels = [
    {
      name: 'anthropic/claude-3.5-sonnet',
      prompt: 'Hello! Can you tell me a short joke?',
      temperature: 0.7,
      maxTokens: 100
    },
    {
      name: 'google/gemini-2.5-pro',
      prompt: 'What is 2+2?',
      temperature: 0.1,
      maxTokens: 50
    },
    {
      name: 'openai/gpt-5-nano',
      prompt: 'What is 3+3?',
      temperature: 0.1,
      maxTokens: 50
    }
  ];

  const results: TestResult[] = [];

  for (const test of testModels) {
    console.log(`\n🚀 Testing ${test.name}...`);
    
    try {
      const response = await fal.run('fal-ai/any-llm', {
        input: {
          model: test.name,
          prompt: test.prompt,
          temperature: test.temperature,
          max_tokens: test.maxTokens
        }
      });

      console.log(`✅ ${test.name} response:`, response.data.output);
      results.push({
        success: true,
        model: test.name,
        response: response.data.output
      });

    } catch (error: any) {
      console.log(`⚠️  ${test.name} test failed:`, error.message);
      results.push({
        success: false,
        model: test.name,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n📊 Test Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n🎉 fal.ai integration is working!');
  } else {
    console.log('\n💡 This might be an authentication issue. Please check:');
    console.log('1. Your FAL_KEY is correct');
    console.log('2. You have credits available in your fal.ai account');
    console.log('3. Your API key has the necessary permissions');
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testFalAI().catch(console.error);
}

export { testFalAI };
