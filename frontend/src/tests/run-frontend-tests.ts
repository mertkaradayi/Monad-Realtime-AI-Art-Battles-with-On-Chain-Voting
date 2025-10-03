#!/usr/bin/env tsx

/**
 * Frontend Test Runner
 * 
 * Runs frontend battle flow tests
 */

import { runBattleFlowTests } from './battle-flow.test.js';

async function runFrontendTests() {
  console.log('🧪 Starting Frontend Battle Flow Tests...\n');

  try {
    const success = await runBattleFlowTests();
    
    if (success) {
      console.log('\n✅ All Frontend Tests Passed!');
      console.log('\n📖 Next Steps:');
      console.log('   1. Start frontend: npm run dev');
      console.log('   2. Test the complete user flow manually');
      console.log('   3. Follow TESTING_GUIDE.md for comprehensive testing');
      return true;
    } else {
      console.log('\n❌ Some frontend tests failed.');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Frontend Test Runner Failed!');
    console.error('Error:', error);
    return false;
  }
}

// Run the tests
runFrontendTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Frontend test execution failed:', error);
  process.exit(1);
});
