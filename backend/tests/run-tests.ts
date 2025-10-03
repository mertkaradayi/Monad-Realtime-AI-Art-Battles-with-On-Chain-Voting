/**
 * Test runner for all backend tests
 * Run with: npm run test
 */

import { testFalAI } from './fal-ai.test.js';
import { testMessageEnhancement } from './message-enhancement.test.js';
import { runMessageDemo } from './message-demo.test.js';

interface TestSuite {
  name: string;
  run: () => Promise<void>;
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Running all backend tests...\n');

  const testSuites: TestSuite[] = [
    {
      name: 'Message Enhancement Demo',
      run: async () => {
        console.log('='.repeat(50));
        console.log('DEMO: Message Enhancement Examples');
        console.log('='.repeat(50));
        runMessageDemo();
      }
    },
    {
      name: 'Fal.ai Integration',
      run: testFalAI
    },
    {
      name: 'Message Enhancement Service',
      run: testMessageEnhancement
    }
  ];

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const suite of testSuites) {
    try {
      console.log(`\n🧪 Running ${suite.name}...`);
      console.log('-'.repeat(50));
      await suite.run();
      results.push({ name: suite.name, success: true });
      console.log(`✅ ${suite.name} completed successfully`);
    } catch (error: any) {
      console.log(`❌ ${suite.name} failed:`, error.message);
      results.push({ name: suite.name, success: false, error: error.message });
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\nTotal: ${results.length} | Successful: ${successful} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
