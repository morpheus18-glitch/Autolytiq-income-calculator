/**
 * Monetization Config Tests
 *
 * Tests for feature flags and pricing validation.
 * Run with: npx tsx server/monetization/__tests__/config.test.ts
 */

import assert from 'assert';

// Import config functions
import { getMonetizationFlags, validatePricing, isFeatureEnabled } from '../config';

// Simple test runner
const tests: { name: string; fn: () => void }[] = [];
const test = (name: string, fn: () => void) => tests.push({ name, fn });

let passed = 0;
let failed = 0;

// Save original env
const originalEnv = { ...process.env };

// Helper to set env vars
function setEnv(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

// Helper to reset env
function resetEnv() {
  // Clear all monetization env vars
  delete process.env.MONETIZATION_ENABLED;
  delete process.env.PRO_REPORT_ENABLED;
  delete process.env.PREMIUM_TOOLKIT_ENABLED;
  delete process.env.AFFILIATE_BLOCK_ENABLED;
  delete process.env.REFERRAL_UNLOCK_ENABLED;
  delete process.env.B2B_INQUIRY_ENABLED;
  delete process.env.PRO_REPORT_PRICE_CENTS;
  delete process.env.PRO_REPORT_CURRENCY;
}

// === FEATURE FLAGS TESTS ===

test('getMonetizationFlags: defaults to all false when no env vars', () => {
  resetEnv();
  const flags = getMonetizationFlags();

  assert.strictEqual(flags.monetizationEnabled, false);
  assert.strictEqual(flags.proReportEnabled, false);
  assert.strictEqual(flags.premiumToolkitEnabled, false);
  assert.strictEqual(flags.affiliateBlockEnabled, false);
  assert.strictEqual(flags.referralUnlockEnabled, false);
  assert.strictEqual(flags.b2bInquiryEnabled, false);
});

test('getMonetizationFlags: reads MONETIZATION_ENABLED=true', () => {
  resetEnv();
  process.env.MONETIZATION_ENABLED = 'true';
  const flags = getMonetizationFlags();

  assert.strictEqual(flags.monetizationEnabled, true);
  assert.strictEqual(flags.proReportEnabled, false); // Others still false
});

test('getMonetizationFlags: only "true" string enables flags', () => {
  resetEnv();
  process.env.MONETIZATION_ENABLED = '1'; // Not "true"
  const flags1 = getMonetizationFlags();
  assert.strictEqual(flags1.monetizationEnabled, false);

  process.env.MONETIZATION_ENABLED = 'yes'; // Not "true"
  const flags2 = getMonetizationFlags();
  assert.strictEqual(flags2.monetizationEnabled, false);

  process.env.MONETIZATION_ENABLED = 'true'; // Exact match
  const flags3 = getMonetizationFlags();
  assert.strictEqual(flags3.monetizationEnabled, true);
});

test('getMonetizationFlags: all flags can be enabled', () => {
  resetEnv();
  process.env.MONETIZATION_ENABLED = 'true';
  process.env.PRO_REPORT_ENABLED = 'true';
  process.env.PREMIUM_TOOLKIT_ENABLED = 'true';
  process.env.AFFILIATE_BLOCK_ENABLED = 'true';
  process.env.REFERRAL_UNLOCK_ENABLED = 'true';
  process.env.B2B_INQUIRY_ENABLED = 'true';

  const flags = getMonetizationFlags();

  assert.strictEqual(flags.monetizationEnabled, true);
  assert.strictEqual(flags.proReportEnabled, true);
  assert.strictEqual(flags.premiumToolkitEnabled, true);
  assert.strictEqual(flags.affiliateBlockEnabled, true);
  assert.strictEqual(flags.referralUnlockEnabled, true);
  assert.strictEqual(flags.b2bInquiryEnabled, true);
});

// === IS FEATURE ENABLED TESTS ===

test('isFeatureEnabled: returns false when master flag off', () => {
  resetEnv();
  process.env.PRO_REPORT_ENABLED = 'true'; // Sub-flag enabled
  // But MONETIZATION_ENABLED is not set (false)

  assert.strictEqual(isFeatureEnabled('proReportEnabled'), false);
});

test('isFeatureEnabled: returns true when both master and sub-flag on', () => {
  resetEnv();
  process.env.MONETIZATION_ENABLED = 'true';
  process.env.PRO_REPORT_ENABLED = 'true';

  assert.strictEqual(isFeatureEnabled('proReportEnabled'), true);
});

test('isFeatureEnabled: returns false when master on but sub-flag off', () => {
  resetEnv();
  process.env.MONETIZATION_ENABLED = 'true';
  // PRO_REPORT_ENABLED not set

  assert.strictEqual(isFeatureEnabled('proReportEnabled'), false);
});

// === PRICING VALIDATION TESTS ===

test('validatePricing: default pricing is valid', () => {
  resetEnv();
  const result = validatePricing();

  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validatePricing: price too low returns error', () => {
  resetEnv();
  process.env.PRO_REPORT_PRICE_CENTS = '50'; // Below min of 99

  const result = validatePricing();

  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('too low')));
});

test('validatePricing: price too high returns error', () => {
  resetEnv();
  process.env.PRO_REPORT_PRICE_CENTS = '10000'; // Above max of 9999

  const result = validatePricing();

  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('too high')));
});

test('validatePricing: invalid currency returns error', () => {
  resetEnv();
  process.env.PRO_REPORT_CURRENCY = 'xyz'; // Invalid currency

  const result = validatePricing();

  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Invalid currency')));
});

test('validatePricing: valid custom pricing passes', () => {
  resetEnv();
  process.env.PRO_REPORT_PRICE_CENTS = '1999'; // $19.99
  process.env.PRO_REPORT_CURRENCY = 'eur';

  const result = validatePricing();

  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

// === RUN TESTS ===

console.log('\n=== Monetization Config Tests ===\n');

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

// Restore original env
Object.keys(process.env).forEach((key) => {
  if (key.startsWith('MONETIZATION') || key.startsWith('PRO_') || key.startsWith('PREMIUM_') || key.startsWith('AFFILIATE_') || key.startsWith('REFERRAL_') || key.startsWith('B2B_')) {
    delete process.env[key];
  }
});
Object.assign(process.env, originalEnv);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
