// Membership Functions for Mamdani Fuzzy Logic Engine

/**
 * Trapezoid membership function with robust shoulder behavior
 * @param {number} x - input value
 * @param {number} a - left foot
 * @param {number} b - left shoulder
 * @param {number} c - right shoulder
 * @param {number} d - right foot
 * @returns {number} membership value clamped to [0,1]
 */
export function trapezoidMF(x, a, b, c, d) {
  // Left shoulder extension (e.g. [0, 0, 20, 40])
  if (x <= b) {
    if (a === b) return 1;
    if (x <= a) return 0;
    return (x - a) / (b - a);
  }

  // Plateau
  if (x <= c) {
    return 1;
  }

  // Right shoulder extension (e.g. [60, 80, 100, 100])
  if (x < d) {
    if (c === d) return 1;
    return (d - x) / (d - c);
  }

  return c === d ? 1 : 0;
}

/**
 * Triangle membership function
 * @param {number} x - input value
 * @param {number} a - left foot
 * @param {number} b - peak
 * @param {number} c - right foot
 * @returns {number} membership value clamped to [0,1]
 */
export function triangleMF(x, a, b, c) {
  if (x <= a || x >= c) {
    return 0;
  }
  if (x < b) {
    return (x - a) / (b - a);
  }
  if (x === b) {
    return 1;
  }
  return (c - x) / (c - b);
}

// ─── Soil Dryness MFs (domain 0–100) ────────────────────────────────────────
// Low:    trapezoid [0, 0, 20, 40]
// Medium: triangle  [20, 50, 80]
// High:   trapezoid [60, 80, 100, 100]
export const soilDrynessLow    = (x) => trapezoidMF(x, 0, 0, 20, 40);
export const soilDrynessMedium = (x) => triangleMF(x, 20, 50, 80);
export const soilDrinessMedium = soilDrynessMedium; // alias for backwards compatibility
export const soilDrynessHigh   = (x) => trapezoidMF(x, 60, 80, 100, 100);

// ─── Sunlight Intensity MFs (domain 0–100) ───────────────────────────────────
// Low:    trapezoid [0, 0, 20, 40]
// Medium: triangle  [20, 50, 80]
// High:   trapezoid [60, 80, 100, 100]
export const sunlightLow    = (x) => trapezoidMF(x, 0, 0, 20, 40);
export const sunlightMedium = (x) => triangleMF(x, 20, 50, 80);
export const sunlightHigh   = (x) => trapezoidMF(x, 60, 80, 100, 100);

// ─── Watering Duration MFs (domain 0–30 minutes) ─────────────────────────────
// Short:  trapezoid [0, 0, 5, 12]
// Medium: triangle  [7, 15, 23]
// Long:   trapezoid [18, 25, 30, 30]
export const wateringShort  = (x) => trapezoidMF(x, 0, 0, 5, 12);
export const wateringMedium = (x) => triangleMF(x, 7, 15, 23);
export const wateringLong   = (x) => trapezoidMF(x, 18, 25, 30, 30);
