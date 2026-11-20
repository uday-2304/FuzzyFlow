import {
  soilDrynessLow, soilDrynessMedium, soilDrynessHigh,
  sunlightLow, sunlightMedium, sunlightHigh,
  wateringShort, wateringMedium, wateringLong,
} from './membershipFunctions.js';
import { RULES, evaluateRules } from './fuzzyRules.js';
import { getDefuzzificationDetails } from './defuzzification.js';

// Map output label -> MF function
const OUTPUT_MFS = {
  Short:  wateringShort,
  Medium: wateringMedium,
  Long:   wateringLong,
};

// Colors for clipped curves
const OUTPUT_COLORS = {
  Short:  '#38bdf8', // sky-400
  Medium: '#a78bfa', // violet-400
  Long:   '#fb923c', // orange-400
};

/**
 * Run the complete Mamdani fuzzy inference system.
 * @param {number} soilDryness       - 0..100
 * @param {number} sunlightIntensity - 0..100
 */
export function computeFuzzySystem(soilDryness, sunlightIntensity) {
  // Clamp inputs to universe [0, 100]
  const soil = Math.max(0, Math.min(100, Number(soilDryness) || 0));
  const sun  = Math.max(0, Math.min(100, Number(sunlightIntensity) || 0));

  // ── 1. Fuzzification ────────────────────────────────────────────────────────
  const soilMemberships = {
    Low:    soilDrynessLow(soil),
    Medium: soilDrynessMedium(soil),
    High:   soilDrynessHigh(soil),
  };

  const sunMemberships = {
    Low:    sunlightLow(sun),
    Medium: sunlightMedium(sun),
    High:   sunlightHigh(sun),
  };

  // ── 2. Rule Evaluation (MIN-AND Firing) ───────────────────────────────────
  const ruleStrengths = evaluateRules(soilMemberships, sunMemberships);

  // ── 3. Implication (MIN Clipping) & Aggregation (MAX) ───────────────────
  // Domain x = 0 .. 30 minutes with step 0.1 (301 points)
  const X_MIN = 0, X_MAX = 30, STEP = 0.1;
  const numPoints = Math.round((X_MAX - X_MIN) / STEP) + 1;

  // Track max clipped degree for each category across all points
  const clippedData = {
    Short:  new Float64Array(numPoints),
    Medium: new Float64Array(numPoints),
    Long:   new Float64Array(numPoints),
  };

  // Aggregated curve across all 9 rules
  const aggregateY = new Float64Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    const x = parseFloat((X_MIN + i * STEP).toFixed(2));

    for (let r = 0; r < RULES.length; r++) {
      const strength = ruleStrengths[r];
      if (strength <= 0) continue;

      const label   = RULES[r].output;
      const mfVal   = OUTPUT_MFS[label](x);
      const clipped = Math.min(strength, mfVal);

      if (clipped > clippedData[label][i]) {
        clippedData[label][i] = clipped;
      }
      if (clipped > aggregateY[i]) {
        aggregateY[i] = clipped;
      }
    }
  }

  // Build outputPoints array for chart and defuzzification
  const outputPoints = [];
  for (let i = 0; i < numPoints; i++) {
    outputPoints.push({
      x: parseFloat((X_MIN + i * STEP).toFixed(2)),
      y: aggregateY[i],
    });
  }

  // Build clippedCurves array for visualization
  const clippedCurves = ['Short', 'Medium', 'Long'].map((label) => {
    const points = [];
    let maxStrength = 0;
    for (let r = 0; r < RULES.length; r++) {
      if (RULES[r].output === label && ruleStrengths[r] > maxStrength) {
        maxStrength = ruleStrengths[r];
      }
    }
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: parseFloat((X_MIN + i * STEP).toFixed(2)),
        y: clippedData[label][i],
      });
    }
    return {
      label,
      color: OUTPUT_COLORS[label],
      points,
      strength: maxStrength,
    };
  });

  // ── 4. Defuzzification (Centroid) ─────────────────────────────────────────
  const { centroid: centroidVal, numerator, denominator } = getDefuzzificationDetails(outputPoints);

  // ── 5. Derived Metadata ──────────────────────────────────────────────────
  const activeRulesCount = ruleStrengths.filter((s) => s > 0.0001).length;

  let wateringCategory = 'Short';
  if (centroidVal >= 20) {
    wateringCategory = 'Long';
  } else if (centroidVal >= 10) {
    wateringCategory = 'Medium';
  }

  return {
    soilMemberships,
    sunMemberships,
    ruleStrengths,
    outputPoints,
    clippedCurves,
    centroid: centroidVal,
    numerator,
    denominator,
    activeRulesCount,
    wateringCategory,
  };
}
