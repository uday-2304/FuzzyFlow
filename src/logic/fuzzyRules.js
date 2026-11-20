/**
 * Fuzzy Rules for Smart Irrigation System
 * 3x3 grid: Soil Dryness x Sunlight Intensity -> Watering Duration
 *
 * Low+Low=Short,    Low+Medium=Short,    Low+High=Short
 * Medium+Low=Short, Medium+Medium=Medium, Medium+High=Medium
 * High+Low=Medium,  High+Medium=Long,    High+High=Long
 */

export const RULES = [
  // { soil, sun, output }
  { soil: 'Low',    sun: 'Low',    output: 'Short'  }, // Rule 1
  { soil: 'Low',    sun: 'Medium', output: 'Short'  }, // Rule 2
  { soil: 'Low',    sun: 'High',   output: 'Short'  }, // Rule 3
  { soil: 'Medium', sun: 'Low',    output: 'Short'  }, // Rule 4
  { soil: 'Medium', sun: 'Medium', output: 'Medium' }, // Rule 5
  { soil: 'Medium', sun: 'High',   output: 'Medium' }, // Rule 6
  { soil: 'High',   sun: 'Low',    output: 'Medium' }, // Rule 7
  { soil: 'High',   sun: 'Medium', output: 'Long'   }, // Rule 8
  { soil: 'High',   sun: 'High',   output: 'Long'   }, // Rule 9
];

/**
 * Evaluate all 9 rules and return firing strengths
 * @param {{ Low: number, Medium: number, High: number }} soilMemberships
 * @param {{ Low: number, Medium: number, High: number }} sunlightMemberships
 * @returns {number[]} array of 9 firing strengths (min(soilMF, sunMF) for each rule)
 */
export function evaluateRules(soilMemberships, sunlightMemberships) {
  return RULES.map((rule) => {
    const soilDeg = soilMemberships[rule.soil] ?? 0;
    const sunDeg  = sunlightMemberships[rule.sun] ?? 0;
    return Math.min(soilDeg, sunDeg);
  });
}
