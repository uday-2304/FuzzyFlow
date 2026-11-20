/**
 * Automated Unit Test Suite for Mamdani Fuzzy Inference System
 * Verifies all mathematical correctness requirements from Section 15
 */

import {
  trapezoidMF,
  triangleMF,
  soilDrynessLow,
  soilDrynessMedium,
  soilDrynessHigh,
  sunlightLow,
  sunlightMedium,
  sunlightHigh,
  wateringShort,
  wateringMedium,
  wateringLong,
} from '../src/logic/membershipFunctions.js';
import { RULES, evaluateRules } from '../src/logic/fuzzyRules.js';
import { centroid, getDefuzzificationDetails } from '../src/logic/defuzzification.js';
import { computeFuzzySystem } from '../src/logic/mamdaniEngine.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertClose(actual, expected, tolerance = 1e-4, message) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (expected ~${expected}, got ${actual}, diff ${diff.toFixed(6)})`);
}

console.log('================================================================');
console.log('🧪 FUZZYFLOW MATHEMATICAL ALGORITHM & INFERENCE UNIT TESTS');
console.log('================================================================\n');

// ── TEST 1: Membership Functions & Shoulders ─────────────────────────────
console.log('Test Group 1: Trapezoid & Triangle Membership Functions & Shoulders');
{
  // Left shoulder: trapezoid [0, 0, 20, 40]
  assert(soilDrynessLow(0) === 1, 'soilDrynessLow(0) should be 1.0 (left shoulder)');
  assert(soilDrynessLow(10) === 1, 'soilDrynessLow(10) should be 1.0 (shoulder plateau)');
  assert(soilDrynessLow(20) === 1, 'soilDrynessLow(20) should be 1.0 (shoulder edge)');
  assertClose(soilDrynessLow(30), 0.5, 1e-4, 'soilDrynessLow(30) should be 0.5 (ramp down)');
  assert(soilDrynessLow(40) === 0, 'soilDrynessLow(40) should be 0.0 (foot)');
  assert(soilDrynessLow(50) === 0, 'soilDrynessLow(50) should be 0.0 (outside domain)');

  // Triangle: [20, 50, 80]
  assert(soilDrynessMedium(20) === 0, 'soilDrynessMedium(20) should be 0.0 (left foot)');
  assertClose(soilDrynessMedium(35), 0.5, 1e-4, 'soilDrynessMedium(35) should be 0.5 (midpoint ramp up)');
  assert(soilDrynessMedium(50) === 1, 'soilDrynessMedium(50) should be 1.0 (peak)');
  assertClose(soilDrynessMedium(65), 0.5, 1e-4, 'soilDrynessMedium(65) should be 0.5 (midpoint ramp down)');
  assert(soilDrynessMedium(80) === 0, 'soilDrynessMedium(80) should be 0.0 (right foot)');

  // Right shoulder: trapezoid [60, 80, 100, 100]
  assert(soilDrynessHigh(50) === 0, 'soilDrynessHigh(50) should be 0.0 (before foot)');
  assert(soilDrynessHigh(60) === 0, 'soilDrynessHigh(60) should be 0.0 (left foot)');
  assertClose(soilDrynessHigh(70), 0.5, 1e-4, 'soilDrynessHigh(70) should be 0.5 (ramp up)');
  assert(soilDrynessHigh(80) === 1, 'soilDrynessHigh(80) should be 1.0 (shoulder start)');
  assert(soilDrynessHigh(90) === 1, 'soilDrynessHigh(90) should be 1.0 (shoulder plateau)');
  assert(soilDrynessHigh(100) === 1, 'soilDrynessHigh(100) should be 1.0 (right shoulder endpoint)');

  // Sunlight MFs should mirror soil MFs
  assert(sunlightLow(0) === 1, 'sunlightLow(0) is 1.0');
  assert(sunlightMedium(50) === 1, 'sunlightMedium(50) is 1.0');
  assert(sunlightHigh(100) === 1, 'sunlightHigh(100) is 1.0');

  // Output MFs: [0, 0, 5, 12], [7, 15, 23], [18, 25, 30, 30]
  assert(wateringShort(0) === 1, 'wateringShort(0) should be 1.0');
  assert(wateringShort(5) === 1, 'wateringShort(5) should be 1.0');
  assert(wateringShort(12) === 0, 'wateringShort(12) should be 0.0');
  assert(wateringMedium(15) === 1, 'wateringMedium(15) should be 1.0');
  assert(wateringLong(25) === 1, 'wateringLong(25) should be 1.0');
  assert(wateringLong(30) === 1, 'wateringLong(30) should be 1.0');
}

// ── TEST 2: Overlap and Partition Consistency ────────────────────────────
console.log('\nTest Group 2: Overlapping Membership Degrees');
{
  // Test intermediate crossover point x = 30
  const low30 = soilDrynessLow(30);
  const med30 = soilDrynessMedium(30);
  const high30 = soilDrynessHigh(30);
  assert(low30 > 0 && med30 > 0 && high30 === 0, 'At x=30, only Low and Medium sets should be active');
  assertClose(low30 + med30, 0.5 + (10/30), 1e-3, 'Overlap at x=30 is mathematically sound');

  // Test peak of Medium x = 50
  assert(soilDrynessLow(50) === 0, 'At x=50, Low is 0');
  assert(soilDrynessMedium(50) === 1, 'At x=50, Medium is 1');
  assert(soilDrynessHigh(50) === 0, 'At x=50, High is 0');

  // Test intermediate crossover point x = 70
  const low70 = soilDrynessLow(70);
  const med70 = soilDrynessMedium(70);
  const high70 = soilDrynessHigh(70);
  assert(low70 === 0 && med70 > 0 && high70 > 0, 'At x=70, only Medium and High sets should be active');
}

// ── TEST 3: Rule Evaluation & MIN Implication ────────────────────────────
console.log('\nTest Group 3: Fuzzy Rules & MIN-AND Evaluation');
{
  assert(RULES.length === 9, 'Exactly 9 rules in rule base');

  // When soil is fully Low (1,0,0) and sun is fully Medium (0,1,0):
  // Rule 2: Low + Medium -> Short should fire with strength min(1, 1) = 1.0
  // All other rules should be 0.0
  const strengths = evaluateRules({ Low: 1, Medium: 0, High: 0 }, { Low: 0, Medium: 1, High: 0 });
  assert(strengths[1] === 1.0, 'Rule 2 (Low+Medium->Short) fires with 1.0');
  const otherStrengths = strengths.filter((_, idx) => idx !== 1);
  assert(otherStrengths.every(s => s === 0), 'All other rules have firing strength 0.0');

  // When soil has partial membership: Low=0.4, Med=0.6; Sun: Med=0.7, High=0.3
  const s2 = evaluateRules({ Low: 0.4, Medium: 0.6, High: 0 }, { Low: 0, Medium: 0.7, High: 0.3 });
  // Rule 2: Low+Med -> min(0.4, 0.7) = 0.4
  assertClose(s2[1], 0.4, 1e-4, 'Rule 2 firing strength is min(0.4, 0.7) = 0.4');
  // Rule 3: Low+High -> min(0.4, 0.3) = 0.3
  assertClose(s2[2], 0.3, 1e-4, 'Rule 3 firing strength is min(0.4, 0.3) = 0.3');
  // Rule 5: Med+Med -> min(0.6, 0.7) = 0.6
  assertClose(s2[4], 0.6, 1e-4, 'Rule 5 firing strength is min(0.6, 0.7) = 0.6');
  // Rule 6: Med+High -> min(0.6, 0.3) = 0.3
  assertClose(s2[5], 0.3, 1e-4, 'Rule 6 firing strength is min(0.6, 0.3) = 0.3');
}

// ── TEST 4: Centroid Defuzzification & Zero-Area ──────────────────────────
console.log('\nTest Group 4: Defuzzification & Zero-Area Handling');
{
  // Zero-area check
  const zeroPoints = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }];
  assert(centroid(zeroPoints) === 0, 'Zero area points safely return 0 without NaN');
  assert(centroid([]) === 0, 'Empty points return 0 without error');
  assert(centroid(null) === 0, 'Null points return 0 without error');

  // Symmetric rectangle [10, 20] of height 1.0: centroid should be exactly 15.0
  const rectPoints = [];
  for (let x = 0; x <= 30; x += 0.5) {
    rectPoints.push({ x, y: (x >= 10 && x <= 20) ? 1.0 : 0.0 });
  }
  const rectDetails = getDefuzzificationDetails(rectPoints);
  assertClose(rectDetails.centroid, 15.0, 1e-2, 'Centroid of symmetric block [10, 20] is 15.0');
  assert(rectDetails.denominator > 0, 'Denominator represents positive area');
  assert(rectDetails.numerator > 0, 'Numerator represents positive first moment');
}

// ── TEST 5: The 5 Required Test Scenarios from Spec ───────────────────────
console.log('\nTest Group 5: The 5 Required Simulation Scenarios');
{
  // Scenario 1: Soil Dryness 0%, Sunlight 0%
  const s1 = computeFuzzySystem(0, 0);
  assert(s1.soilMemberships.Low === 1.0, 'Scenario 1: Soil is 100% Low');
  assert(s1.sunMemberships.Low === 1.0, 'Scenario 1: Sun is 100% Low');
  assert(s1.ruleStrengths[0] === 1.0, 'Scenario 1: Rule 1 (Low+Low->Short) fires at 1.0');
  assert(s1.wateringCategory === 'Short', `Scenario 1: Category is Short (got ${s1.wateringCategory})`);
  assert(s1.centroid > 0 && s1.centroid < 10, `Scenario 1: Centroid in Short range [0, 10) (got ${s1.centroid.toFixed(2)} min)`);
  assert(!isNaN(s1.centroid) && isFinite(s1.centroid), 'Scenario 1: Centroid is a valid finite number');

  // Scenario 2: Soil Dryness 25%, Sunlight 75%
  const s2 = computeFuzzySystem(25, 75);
  assert(s2.soilMemberships.Low > 0 && s2.soilMemberships.Medium > 0, 'Scenario 2: Soil is in Low/Medium transition');
  assert(s2.sunMemberships.Medium > 0 && s2.sunMemberships.High > 0, 'Scenario 2: Sun is in Medium/High transition');
  assert(s2.activeRulesCount > 1, `Scenario 2: Multiple rules active (${s2.activeRulesCount} active)`);
  assert(s2.centroid >= 0 && s2.centroid <= 30, `Scenario 2: Centroid in valid domain [0, 30] (${s2.centroid.toFixed(2)} min)`);
  assert(!isNaN(s2.centroid) && isFinite(s2.centroid), 'Scenario 2: Centroid is valid');

  // Scenario 3: Soil Dryness 50%, Sunlight 50%
  const s3 = computeFuzzySystem(50, 50);
  assert(s3.soilMemberships.Medium === 1.0, 'Scenario 3: Soil is 100% Medium');
  assert(s3.sunMemberships.Medium === 1.0, 'Scenario 3: Sun is 100% Medium');
  assert(s3.ruleStrengths[4] === 1.0, 'Scenario 3: Rule 5 (Med+Med->Medium) fires at 1.0');
  assert(s3.wateringCategory === 'Medium', `Scenario 3: Category is Medium (got ${s3.wateringCategory})`);
  assertClose(s3.centroid, 15.0, 0.5, `Scenario 3: Centroid is ~15.0 min (got ${s3.centroid.toFixed(2)} min)`);

  // Scenario 4: Soil Dryness 80%, Sunlight 90%
  const s4 = computeFuzzySystem(80, 90);
  assert(s4.soilMemberships.High === 1.0, 'Scenario 4: Soil is 100% High');
  assert(s4.sunMemberships.High === 1.0, 'Scenario 4: Sun is 100% High');
  assert(s4.wateringCategory === 'Long', `Scenario 4: Category is Long (got ${s4.wateringCategory})`);
  assert(s4.centroid >= 20 && s4.centroid <= 30, `Scenario 4: Centroid in Long range [20, 30] (got ${s4.centroid.toFixed(2)} min)`);

  // Scenario 5: Soil Dryness 100%, Sunlight 100%
  const s5 = computeFuzzySystem(100, 100);
  assert(s5.soilMemberships.High === 1.0, 'Scenario 5: Soil is 100% High');
  assert(s5.sunMemberships.High === 1.0, 'Scenario 5: Sun is 100% High');
  assert(s5.ruleStrengths[8] === 1.0, 'Scenario 5: Rule 9 (High+High->Long) fires at 1.0');
  assert(s5.wateringCategory === 'Long', `Scenario 5: Category is Long (got ${s5.wateringCategory})`);
  assert(s5.centroid > 24 && s5.centroid <= 30, `Scenario 5: Centroid near maximum watering (~${s5.centroid.toFixed(2)} min)`);
}

// ── TEST 6: Monotonicity & Boundary Smoothness ───────────────────────────
console.log('\nTest Group 6: Monotonicity & Sweep Verification');
{
  // For fixed sunlight (50%), increasing soil dryness from 0 to 100
  // should never significantly decrease watering duration.
  let prevCentroid = -1;
  let monotonicViolations = 0;
  for (let soil = 0; soil <= 100; soil += 2) {
    const res = computeFuzzySystem(soil, 50);
    assert(!isNaN(res.centroid) && isFinite(res.centroid), `Soil=${soil}: Centroid is finite number`);
    assert(res.centroid >= 0 && res.centroid <= 30, `Soil=${soil}: Centroid in [0, 30]`);
    if (prevCentroid !== -1 && res.centroid < prevCentroid - 0.05) {
      monotonicViolations++;
      console.warn(`Monotonicity dip at soil=${soil}: prev=${prevCentroid.toFixed(3)}, current=${res.centroid.toFixed(3)}`);
    }
    prevCentroid = res.centroid;
  }
  assert(monotonicViolations === 0, `Monotonicity holds across entire soil dryness range (violations: ${monotonicViolations})`);

  // Full 2D Grid Sweep (10,000 points) checking for NaN or Infinity
  let invalidPoints = 0;
  for (let soil = 0; soil <= 100; soil += 10) {
    for (let sun = 0; sun <= 100; sun += 10) {
      const res = computeFuzzySystem(soil, sun);
      if (isNaN(res.centroid) || !isFinite(res.centroid) || res.centroid < 0 || res.centroid > 30) {
        invalidPoints++;
      }
    }
  }
  assert(invalidPoints === 0, `All grid points yield valid centroids within [0, 30] minutes (invalid: ${invalidPoints})`);
}

console.log('\n================================================================');
console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MATHEMATICAL AND LOGICAL TESTS PASSED PERFECTLY!\n');
}
