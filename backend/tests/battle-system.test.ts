#!/usr/bin/env tsx

/**
 * Battle System Integration Tests
 * 
 * Simple test runner without Jest dependencies
 */

import { supabaseAdmin } from '../src/config/config.js';
import { BattleConceptService } from '../src/services/battle-concept.js';
import { QRGeneratorService } from '../src/services/qr-generator.js';

// Mock wallet addresses for testing
const TEST_WALLET_1 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_2 = '0x0987654321098765432109876543210987654321';
const TEST_WALLET_3 = '0x1111111111111111111111111111111111111111';

// Simple test framework
class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<boolean> }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => Promise<boolean>) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running Battle System Integration Tests...\n');
    
    for (const test of this.tests) {
      try {
        const result = await test.fn();
        if (result) {
          console.log(`✅ ${test.name}`);
          this.passed++;
        } else {
          console.log(`❌ ${test.name}`);
          this.failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name} - Error: ${error instanceof Error ? error.message : String(error)}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

async function runBattleSystemTests() {
  const runner = new TestRunner();
  let testBattleId: string | undefined;

  // Clean up any existing test data
  await supabaseAdmin.from('battles').delete().like('concept', '%TEST%');
  console.log('🧹 Cleaned up test data\n');

  // Feature 1: Battle Creation & QR Code
  runner.test('Battle Creation with Concept', async () => {
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

  runner.test('QR Code Generation', async () => {
    if (!testBattleId) return false;
    
    const qrData = await QRGeneratorService.generateJoiningQR(testBattleId);
    if (!qrData || !qrData.includes('join/') || !qrData.includes(testBattleId)) return false;

    // Update battle with QR data
    const { error: updateError } = await supabaseAdmin
      .from('battles')
      .update({ joining_qr_data: qrData })
      .eq('id', testBattleId);

    return !updateError;
  });

  runner.test('Unique Concepts Generation', async () => {
    const concept1 = await BattleConceptService.generateBattleConcept();
    const concept2 = await BattleConceptService.generateBattleConcept();
    
    return concept1 !== concept2 && concept1.endsWith('...') && concept2.endsWith('...');
  });

  // Feature 2: First Participant Joining
  runner.test('First Participant Joining', async () => {
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

  runner.test('Prevent Duplicate Participants', async () => {
    if (!testBattleId) return false;

    // Same user tries to join again as participant 2
    const { data, error } = await supabaseAdmin
      .from('battles')
      .update({
        participant2_wallet: TEST_WALLET_1,
        status: 'active'
      })
      .eq('id', testBattleId)
      .eq('status', 'waiting')
      .not('participant1_wallet', 'is', null)
      .is('participant2_wallet', null)
      .neq('participant1_wallet', TEST_WALLET_1)
      .select()
      .single();

    // Should fail because same wallet can't be in both slots
    return !data && !!error;
  });

  // Feature 3: Second Participant Joining
  runner.test('Second Participant Joining & Battle Activation', async () => {
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

  runner.test('Prevent Third User from Joining', async () => {
    if (!testBattleId) return false;

    // Third user tries to join
    const { data, error } = await supabaseAdmin
      .from('battles')
      .update({
        participant1_wallet: TEST_WALLET_3,
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

  // Race Condition Tests
  runner.test('Race Condition Protection', async () => {
    // Create fresh battle for race condition test
    const concept = await BattleConceptService.generateBattleConcept();
    const { data: battle } = await supabaseAdmin
      .from('battles')
      .insert([{
        concept: concept,
        status: 'waiting',
        creator_wallet: TEST_WALLET_1
      }])
      .select()
      .single();
    
    const raceTestBattleId = battle.id;

    // Simulate two users trying to join simultaneously
    const promises = [
      supabaseAdmin
        .from('battles')
        .update({
          participant1_wallet: TEST_WALLET_1,
          status: 'waiting'
        })
        .eq('id', raceTestBattleId)
        .eq('status', 'waiting')
        .is('participant1_wallet', null)
        .select()
        .single(),
      
      supabaseAdmin
        .from('battles')
        .update({
          participant1_wallet: TEST_WALLET_2,
          status: 'waiting'
        })
        .eq('id', raceTestBattleId)
        .eq('status', 'waiting')
        .is('participant1_wallet', null)
        .select()
        .single()
    ];

    const results = await Promise.allSettled(promises);
    
    // One should succeed, one should fail
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.data);
    const failed = results.filter(r => r.status === 'rejected' || !r.value.data);
    
    // Clean up race test battle
    await supabaseAdmin.from('battles').delete().eq('id', raceTestBattleId);
    
    return successful.length === 1 && failed.length === 1;
  });

  // Database Constraints
  runner.test('Database Constraints', async () => {
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

  // Battle State Transitions
  runner.test('Battle State Transitions', async () => {
    // Create fresh battle for state transition test
    const concept = await BattleConceptService.generateBattleConcept();
    const { data: battle } = await supabaseAdmin
      .from('battles')
      .insert([{
        concept: concept,
        status: 'waiting',
        creator_wallet: TEST_WALLET_1
      }])
      .select()
      .single();
    
    const stateTestBattleId = battle.id;

    // Initial state: waiting
    let { data: battleData } = await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('id', stateTestBattleId)
      .single();
    
    if (battleData.status !== 'waiting') {
      await supabaseAdmin.from('battles').delete().eq('id', stateTestBattleId);
      return false;
    }

    // First participant joins
    await supabaseAdmin
      .from('battles')
      .update({ participant1_wallet: TEST_WALLET_1 })
      .eq('id', stateTestBattleId);

    // Still waiting
    battleData = (await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('id', stateTestBattleId)
      .single()).data;
    
    if (battleData.status !== 'waiting') {
      await supabaseAdmin.from('battles').delete().eq('id', stateTestBattleId);
      return false;
    }

    // Second participant joins
    await supabaseAdmin
      .from('battles')
      .update({
        participant2_wallet: TEST_WALLET_2,
        status: 'active'
      })
      .eq('id', stateTestBattleId);

    // Now active
    battleData = (await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('id', stateTestBattleId)
      .single()).data;
    
    // Clean up state test battle
    await supabaseAdmin.from('battles').delete().eq('id', stateTestBattleId);
    
    return battleData.status === 'active' &&
           battleData.participant1_wallet === TEST_WALLET_1 &&
           battleData.participant2_wallet === TEST_WALLET_2;
  });

  // Run all tests
  const success = await runner.run();

  // Clean up main test battle
  if (testBattleId) {
    await supabaseAdmin.from('battles').delete().eq('id', testBattleId);
    console.log('🧹 Cleaned up test battle');
  }

  if (success) {
    console.log('\n🎉 All Battle System Tests Passed!');
    console.log('\n📋 Test Coverage:');
    console.log('   ✅ Feature 1: Battle Creation & QR Code');
    console.log('   ✅ Feature 2: First Participant Auto-Joining');
    console.log('   ✅ Feature 3: Second Participant Joining');
    console.log('   ✅ Race Condition Protection');
    console.log('   ✅ Database Constraints');
    console.log('   ✅ Battle State Transitions');
    console.log('\n🚀 System is ready for manual testing!');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
  }

  return success;
}

// Run the tests
runBattleSystemTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});