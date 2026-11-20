/**
 * Exact Centroid defuzzification using trapezoidal and linear segment integration
 *
 * For each interval [x0, x1] with step dx = x1 - x0 and linearly varying y:
 * Area (denominator contribution) = 0.5 * (y0 + y1) * dx
 * First Moment (numerator contribution) = (dx / 6) * ((2*x0 + x1)*y0 + (x0 + 2*x1)*y1)
 *
 * Crisp Centroid = Numerator / Denominator
 */

/**
 * Compute centroid and integration details
 * @param {{ x: number, y: number }[]} outputPoints - array of {x, y} pairs
 * @returns {{ centroid: number, numerator: number, denominator: number }}
 */
export function getDefuzzificationDetails(outputPoints) {
  if (!outputPoints || outputPoints.length < 2) {
    return { centroid: 0, numerator: 0, denominator: 0 };
  }

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < outputPoints.length - 1; i++) {
    const x0 = outputPoints[i].x;
    const y0 = outputPoints[i].y;
    const x1 = outputPoints[i + 1].x;
    const y1 = outputPoints[i + 1].y;
    const dx = x1 - x0;

    const segmentArea = 0.5 * (y0 + y1) * dx;
    const segmentMoment = (dx / 6) * ((2 * x0 + x1) * y0 + (x0 + 2 * x1) * y1);

    denominator += segmentArea;
    numerator += segmentMoment;
  }

  const centroid = denominator <= 1e-9 ? 0 : numerator / denominator;
  return { centroid, numerator, denominator };
}

/**
 * Centroid defuzzification
 * @param {{ x: number, y: number }[]} outputPoints - array of {x, y} pairs
 * @returns {number} centroid value, or 0 if denominator is 0
 */
export function centroid(outputPoints) {
  return getDefuzzificationDetails(outputPoints).centroid;
}
