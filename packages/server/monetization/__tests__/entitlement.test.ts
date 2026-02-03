/**
 * Entitlement System Tests
 *
 * Tests for the entitlement resolver and tier logic.
 * Run with: npx tsx server/monetization/__tests__/entitlement.test.ts
 */

import assert from 'assert';

// Import types and utilities
import { compareTiers, tierHasAccess, type ReportTier } from '../types';

// Simple test runner
const tests: { name: string; fn: () => void }[] = [];
const test = (name: string, fn: () => void) => tests.push({ name, fn });

let passed = 0;
let failed = 0;

// === TIER COMPARISON TESTS ===

test('compareTiers: FREE < PRO', () => {
  assert.strictEqual(compareTiers('FREE', 'PRO'), -1);
});

test('compareTiers: PRO < PREMIUM', () => {
  assert.strictEqual(compareTiers('PRO', 'PREMIUM'), -1);
});

test('compareTiers: FREE < PREMIUM', () => {
  assert.strictEqual(compareTiers('FREE', 'PREMIUM'), -2);
});

test('compareTiers: PRO > FREE', () => {
  assert.strictEqual(compareTiers('PRO', 'FREE'), 1);
});

test('compareTiers: PREMIUM > FREE', () => {
  assert.strictEqual(compareTiers('PREMIUM', 'FREE'), 2);
});

test('compareTiers: same tier returns 0', () => {
  assert.strictEqual(compareTiers('FREE', 'FREE'), 0);
  assert.strictEqual(compareTiers('PRO', 'PRO'), 0);
  assert.strictEqual(compareTiers('PREMIUM', 'PREMIUM'), 0);
});

// === TIER ACCESS TESTS ===

test('tierHasAccess: FREE has access to FREE', () => {
  assert.strictEqual(tierHasAccess('FREE', 'FREE'), true);
});

test('tierHasAccess: PRO has access to FREE', () => {
  assert.strictEqual(tierHasAccess('PRO', 'FREE'), true);
});

test('tierHasAccess: PRO has access to PRO', () => {
  assert.strictEqual(tierHasAccess('PRO', 'PRO'), true);
});

test('tierHasAccess: PREMIUM has access to all', () => {
  assert.strictEqual(tierHasAccess('PREMIUM', 'FREE'), true);
  assert.strictEqual(tierHasAccess('PREMIUM', 'PRO'), true);
  assert.strictEqual(tierHasAccess('PREMIUM', 'PREMIUM'), true);
});

test('tierHasAccess: FREE does NOT have access to PRO', () => {
  assert.strictEqual(tierHasAccess('FREE', 'PRO'), false);
});

test('tierHasAccess: FREE does NOT have access to PREMIUM', () => {
  assert.strictEqual(tierHasAccess('FREE', 'PREMIUM'), false);
});

test('tierHasAccess: PRO does NOT have access to PREMIUM', () => {
  assert.strictEqual(tierHasAccess('PRO', 'PREMIUM'), false);
});

// === RUN TESTS ===

console.log('\n=== Entitlement System Tests ===\n');

for (const t of tests) {
  try {
    t.fn();
    console.log(`✅ ${t.name}`);
    passed++;
  } catch (err: any) {
    console.log(`❌ ${t.name}`);
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
