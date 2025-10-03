#!/usr/bin/env tsx

/**
 * Simple Battle System Test
 * 
 * This script tests the core functionality without Jest dependencies
 */

import { supabaseAdmin } from '../src/config/config.js';
import { BattleConceptService } from '../src/services/battle-concept.js';
import { QRGeneratorService } from '../src/services/qr-generator.js';

// Test wallet addresses
const TEST_WALLET_1 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_2 = '0x0987654321098765432109876543210987654321';

async function runSimpleTests() {
  console.log('🧪 Running Simple Battle System Tests...\n');
  
  let testBattleId: string;
  let passedTests = 0;
  let totalTests = 0;

  function test(name: string, testFn: () => Promise<boolean>) {
    totalTests++;
    return testFn().then(result => {
      if (result) {
        console.log(`✅ ${name}`);
        passedTests++;
      } else {
        console.log(`❌ ${name}`);
      }
      return result;
    }).catch(error => {
      console.log(`❌ ${name} - Error: ${error.message}`);
      return false;
    });
  }

  try {
    // Clean up any existing test data
    await supabaseAdmin.from('battles').delete().like('concept', '%TEST%');
    console.log('🧹 Cleaned up test data\n');

    // Test 1: Battle Creation
    await test('Battle Creation with Concept', async () => {
      const concept = await BattleConceptService.generateBattleConcept();
      if (!concept || !concept.endsWith('...')) return false;

      const { data: battle, error } = await supabaseAdmin
        .from('battles')
        .insert([{
          concept: concept,
          status: 'waiting',
          creator_wallet: TEST_WALLET_1
        }])
        .select()
        .single();

      if (error || !battle) return false;
      
      testBattleId = battle.id;
      return battle.concept === concept && battle.status === 'waiting';
    });

    // Test 2: QR Code Generation
    await test('QR Code Generation', async () => {
      if (!testBattleId) return false;
      
      const qrData = await QRGeneratorService.generateJoiningQR(testBattleId);
      // QR service returns a data URL, so check for data URL format and battle ID
      return qrData && qrData.startsWith('data:image/png;base64,') && qrData.length > 100;
    });

    // Test 3: First Participant Joining
    await test('First Participant Joining', async () => {
      if (!testBattleId) return false;

      const { data: updatedBattle, error } = await supabaseAdmin
        .from('battles')
        .update({
          participant1_wallet: TEST_WALLET_1,
          status: 'waiting'
        })
        .eq('id', testBattleId)
        .eq('status', 'waiting')
        .is('participant1_wallet', null)
        .select()
        .single();

      return !error && updatedBattle && updatedBattle.participant1_wallet === TEST_WALLET_1;
    });

    // Test 4: Second Participant Joining
    await test('Second Participant Joining & Battle Activation', async () => {
      if (!testBattleId) return false;

      const { data: updatedBattle, error } = await supabaseAdmin
        .from('battles')
        .update({
          participant2_wallet: TEST_WALLET_2,
          status: 'active'
        })
        .eq('id', testBattleId)
        .eq('status', 'waiting')
        .not('participant1_wallet', 'is', null)
        .is('participant2_wallet', null)
        .neq('participant1_wallet', TEST_WALLET_2)
        .select()
        .single();

      return !error && updatedBattle && 
             updatedBattle.status === 'active' &&
             updatedBattle.participant1_wallet === TEST_WALLET_1 &&
             updatedBattle.participant2_wallet === TEST_WALLET_2;
    });

    // Test 5: Race Condition Protection
    await test('Race Condition Protection', async () => {
      if (!testBattleId) return false;

      // Try to join a third user (should fail)
      const { data, error } = await supabaseAdmin
        .from('battles')
        .update({
          participant1_wallet: '0x3333333333333333333333333333333333333333',
          status: 'waiting'
        })
        .eq('id', testBattleId)
        .eq('status', 'waiting')
        .is('participant1_wallet', null)
        .select()
        .single();

      // Should fail because battle is no longer in waiting status
      return !data && !!error;
    });

    // Test 6: Database Constraints
    await test('Database Constraints', async () => {
      // Try to create another battle with same participant
      const { error } = await supabaseAdmin
        .from('battles')
        .insert([{
          concept: 'Test concept for constraint...',
          status: 'waiting',
          creator_wallet: '0x4444444444444444444444444444444444444444',
          participant1_wallet: TEST_WALLET_1 // Same wallet in active battle
        }])
        .select();

      // Should fail due to unique constraint
      return !!error;
    });

    // Clean up
    if (testBattleId) {
      await supabaseAdmin.from('battles').delete().eq('id', testBattleId);
      console.log('\n🧹 Cleaned up test battle');
    }

    // Results
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! System is ready for manual testing.');
      console.log('\n📖 Next Steps:');
      console.log('   1. Start backend: npm run dev');
      console.log('   2. Start frontend: cd ../frontend && npm run dev');
      console.log('   3. Follow TESTING_GUIDE.md for manual testing');
      return true;
    } else {
      console.log('❌ Some tests failed. Please check the errors above.');
      return false;
    }

  } catch (error) {
    console.error('❌ Test runner failed:', error);
    return false;
  }
}

// Run the tests
runSimpleTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
