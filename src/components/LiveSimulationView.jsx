import React from 'react';
import {
  wateringShort,
  wateringMedium,
  wateringLong,
} from '../logic/membershipFunctions.js';

const COLOR_BLUE  = '#0284c7';
const COLOR_AMBER = '#f59e0b';
const COLOR_RED   = '#ef4444';

/**
 * Defuzzification Graph Card
 * Visualizes the 3 output fuzzy sets with distinct colors:
 * - Short:  Blue  (#0284c7)
 * - Medium: Amber (#f59e0b)
 * - Long:   Red   (#ef4444)
 */
export function DefuzzificationGraphCard({
  outputPoints = [],
  clippedCurves = [],
  centroid = 15,
  wateringCategory = 'Medium',
  activeRulesCount = 2,
}) {
  const W = 480, H = 145;
  const padLeft = 26, padRight = 16, padTop = 16, padBottom = 22;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const toSvgX = (x) => padLeft + (x / 30) * plotW;
  const toSvgY = (y) => H - padBottom - y * plotH;

  // Unclipped reference curves
  const shortRefPts = [];
  const medRefPts   = [];
  const longRefPts  = [];

  for (let x = 0; x <= 30; x += 0.5) {
    const sx = toSvgX(x).toFixed(1);
    shortRefPts.push(`${sx},${toSvgY(wateringShort(x)).toFixed(1)}`);
    medRefPts.push(`${sx},${toSvgY(wateringMedium(x)).toFixed(1)}`);
    longRefPts.push(`${sx},${toSvgY(wateringLong(x)).toFixed(1)}`);
  }

  // Extract strengths for each output category
  const shortCurve = clippedCurves?.find((c) => c.label === 'Short');
  const medCurve   = clippedCurves?.find((c) => c.label === 'Medium');
  const longCurve  = clippedCurves?.find((c) => c.label === 'Long');

  const shortStrength = shortCurve?.strength ?? (
    outputPoints.length ? Math.max(...outputPoints.filter((p) => p.x <= 5).map((p) => p.y), 0) : 0
  );
  const medStrength = medCurve?.strength ?? (
    outputPoints.length ? Math.max(...outputPoints.filter((p) => p.x >= 14 && p.x <= 16).map((p) => p.y), 0) : 0
  );
  const longStrength = longCurve?.strength ?? (
    outputPoints.length ? Math.max(...outputPoints.filter((p) => p.x >= 25).map((p) => p.y), 0) : 0
  );

  // 1. Build distinct clipped polygon for SHORT (0 to 12 min) - Blue
  const shortPoly = [`${toSvgX(0).toFixed(1)},${toSvgY(0).toFixed(1)}`];
  const shortTopLine = [];
  for (let x = 0; x <= 12; x += 0.25) {
    const y = Math.min(shortStrength, wateringShort(x));
    const sx = toSvgX(x).toFixed(1);
    const sy = toSvgY(y).toFixed(1);
    shortPoly.push(`${sx},${sy}`);
    shortTopLine.push(`${sx},${sy}`);
  }
  shortPoly.push(`${toSvgX(12).toFixed(1)},${toSvgY(0).toFixed(1)}`);

  // 2. Build distinct clipped polygon for MEDIUM (8 to 22 min) - Amber Triangle
  const medPoly = [`${toSvgX(8).toFixed(1)},${toSvgY(0).toFixed(1)}`];
  const medTopLine = [];
  for (let x = 8; x <= 22; x += 0.25) {
    const y = Math.min(medStrength, wateringMedium(x));
    const sx = toSvgX(x).toFixed(1);
    const sy = toSvgY(y).toFixed(1);
    medPoly.push(`${sx},${sy}`);
    medTopLine.push(`${sx},${sy}`);
  }
  medPoly.push(`${toSvgX(22).toFixed(1)},${toSvgY(0).toFixed(1)}`);

  // 3. Build distinct clipped polygon for LONG (18 to 30 min) - Red
  const longPoly = [`${toSvgX(18).toFixed(1)},${toSvgY(0).toFixed(1)}`];
  const longTopLine = [];
  for (let x = 18; x <= 30; x += 0.25) {
    const y = Math.min(longStrength, wateringLong(x));
    const sx = toSvgX(x).toFixed(1);
    const sy = toSvgY(y).toFixed(1);
    longPoly.push(`${sx},${sy}`);
    longTopLine.push(`${sx},${sy}`);
  }
  longPoly.push(`${toSvgX(30).toFixed(1)},${toSvgY(0).toFixed(1)}`);

  const centroidX = toSvgX(centroid);

  const badgeStyle = {
    Short:  { bg: '#e0f2fe', color: '#0284c7' },
    Medium: { bg: '#fef3c7', color: '#b45309' },
    Long:   { bg: '#fee2e2', color: '#dc2626' },
  }[wateringCategory] || { bg: '#ecfdf5', color: '#059669' };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: '12px',
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828' }}>
            Defuzzification (Centroid)
          </div>
          {/* Distinct Color Legend Pills for each Triangle/Shape */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#0284c7',
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              padding: '2px 7px',
              borderRadius: '5px',
            }}>
              Short: {shortStrength.toFixed(2)}
            </span>

            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#b45309',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              padding: '2px 7px',
              borderRadius: '5px',
            }}>
              Medium: {medStrength.toFixed(2)}
            </span>

            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#dc2626',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              padding: '2px 7px',
              borderRadius: '5px',
            }}>
              Long: {longStrength.toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#101828',
            background: '#f8fafc',
            border: '1px solid #eaecf0',
            padding: '3px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace',
          }}>
            {centroid.toFixed(2)} min
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: badgeStyle.bg,
            color: badgeStyle.color,
          }}>
            {wateringCategory}
          </span>
        </div>
      </div>

      {/* SVG Canvas with Distinct Colors for each Triangle */}
      <div style={{ width: '100%' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Gridlines */}
          <line x1={padLeft} y1={toSvgY(1.0)} x2={W - padRight} y2={toSvgY(1.0)} stroke="#f2f4f7" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padLeft} y1={toSvgY(0.5)} x2={W - padRight} y2={toSvgY(0.5)} stroke="#f2f4f7" strokeDasharray="3 3" strokeWidth="1" />

          <text x={padLeft - 6} y={toSvgY(1.0) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">1.0</text>
          <text x={padLeft - 6} y={toSvgY(0.5) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">0.5</text>
          <text x={padLeft - 6} y={toSvgY(0) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">0</text>

          <line x1={padLeft} y1={H - padBottom} x2={W - padRight} y2={H - padBottom} stroke="#eaecf0" strokeWidth="1.5" />

          {/* 1. Reference MF Dashed Lines with distinct colors */}
          <polyline points={shortRefPts.join(' ')} fill="none" stroke={COLOR_BLUE} strokeWidth="1.4" opacity="0.45" strokeDasharray="3 2" />
          <polyline points={medRefPts.join(' ')} fill="none" stroke={COLOR_AMBER} strokeWidth="1.4" opacity="0.45" strokeDasharray="3 2" />
          <polyline points={longRefPts.join(' ')} fill="none" stroke={COLOR_RED} strokeWidth="1.4" opacity="0.45" strokeDasharray="3 2" />

          {/* 2. Distinct Colored Polygons & Borders for each Shape */}

          {/* SHORT SET (Blue) */}
          {shortStrength > 0.005 && (
            <g>
              <polygon points={shortPoly.join(' ')} fill="rgba(2, 132, 199, 0.22)" />
              <polyline points={shortTopLine.join(' ')} fill="none" stroke={COLOR_BLUE} strokeWidth="2.4" strokeLinejoin="round" />
            </g>
          )}

          {/* MEDIUM TRIANGLE (Amber) */}
          {medStrength > 0.005 && (
            <g>
              <polygon points={medPoly.join(' ')} fill="rgba(245, 158, 11, 0.25)" />
              <polyline points={medTopLine.join(' ')} fill="none" stroke={COLOR_AMBER} strokeWidth="2.4" strokeLinejoin="round" />
            </g>
          )}

          {/* LONG SET (Red) */}
          {longStrength > 0.005 && (
            <g>
              <polygon points={longPoly.join(' ')} fill="rgba(239, 68, 68, 0.22)" />
              <polyline points={longTopLine.join(' ')} fill="none" stroke={COLOR_RED} strokeWidth="2.4" strokeLinejoin="round" />
            </g>
          )}

          {/* 3. Outer Aggregated Envelope (Subtle union contour) */}
          {outputPoints.length > 0 && (
            <polyline
              points={outputPoints.map((pt) => `${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}

          {/* 4. Vertical Centroid Line with Black Marker */}
          <line
            x1={centroidX}
            y1={padTop - 4}
            x2={centroidX}
            y2={H - padBottom}
            stroke="#101828"
            strokeWidth="2.2"
          />

          {/* Centroid Badge */}
          <rect
            x={centroidX - 22}
            y={padTop - 14}
            width="44"
            height="14"
            rx="4"
            fill="#101828"
          />
          <text
            x={centroidX}
            y={padTop - 4}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill="#ffffff"
            fontFamily="monospace"
          >
            {centroid.toFixed(1)}m
          </text>

          {/* X-axis tick labels */}
          {[0, 5, 10, 15, 20, 25, 30].map((t) => (
            <g key={t}>
              <line x1={toSvgX(t)} y1={H - padBottom} x2={toSvgX(t)} y2={H - padBottom + 3} stroke="#d0d5dd" strokeWidth="1" />
              <text x={toSvgX(t)} y={H - 3} textAnchor="middle" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">
                {t}m
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom Info Strip */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #eaecf0',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <span style={{ color: '#475467' }}>
          Formula: <strong style={{ color: '#101828', fontFamily: 'monospace' }}>z* = ∫ z·μ(z)dz / ∫ μ(z)dz</strong>
        </span>
        <span style={{ color: badgeStyle.color, fontWeight: 700 }}>
          Valve: {wateringCategory.toUpperCase()} ({centroid.toFixed(2)} min)
        </span>
      </div>
    </div>
  );
}

/**
 * Dashboard Right Panel
 */
export default function LiveSimulationView({ fuzzyResult }) {
  const { outputPoints, clippedCurves, centroid, wateringCategory, activeRulesCount } = fuzzyResult;

  return (
    <div style={{ width: '100%' }}>
      <DefuzzificationGraphCard
        outputPoints={outputPoints}
        clippedCurves={clippedCurves}
        centroid={centroid}
        wateringCategory={wateringCategory}
        activeRulesCount={activeRulesCount}
      />
    </div>
  );
}
