import React from 'react';
import {
  soilDrynessLow,
  soilDrynessMedium,
  soilDrynessHigh,
  sunlightLow,
  sunlightMedium,
  sunlightHigh,
} from '../logic/membershipFunctions.js';

const COLOR_BRAND = '#4f46e5';
const COLOR_BLUE  = '#0284c7';
const COLOR_AMBER = '#f59e0b';
const COLOR_RED   = '#ef4444';

/**
 * Membership Function SVG graph
 * Visualizes 3 fuzzy sets with distinct colors:
 * - Low:  Blue  (#0284c7)
 * - Med:  Amber (#f59e0b)
 * - High: Red   (#ef4444)
 */
function MembershipGraph({ label, value, memberships, mfs, domain = [0, 100], unit = '%' }) {
  const W = 460, H = 96;
  const padLeft = 24, padRight = 16, padTop = 14, padBottom = 18;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const toSvgX = (x) => padLeft + ((x - domain[0]) / (domain[1] - domain[0])) * plotW;
  const toSvgY = (y) => H - padBottom - y * plotH;

  const lowPts  = [];
  const medPts  = [];
  const highPts = [];

  for (let x = domain[0]; x <= domain[1]; x += 1) {
    const sx = toSvgX(x).toFixed(1);
    lowPts.push(`${sx},${toSvgY(mfs.low(x)).toFixed(1)}`);
    medPts.push(`${sx},${toSvgY(mfs.med(x)).toFixed(1)}`);
    highPts.push(`${sx},${toSvgY(mfs.high(x)).toFixed(1)}`);
  }

  const cursorX  = toSvgX(value);
  const dotLowY  = toSvgY(memberships.Low);
  const dotMedY  = toSvgY(memberships.Medium);
  const dotHighY = toSvgY(memberships.High);

  const lowPoly = [
    `${toSvgX(0).toFixed(1)},${toSvgY(0).toFixed(1)}`,
    ...lowPts.filter((_, i) => i <= 40),
    `${toSvgX(40).toFixed(1)},${toSvgY(0).toFixed(1)}`,
  ];

  const medPoly = [
    `${toSvgX(20).toFixed(1)},${toSvgY(0).toFixed(1)}`,
    ...medPts.filter((_, i) => i >= 20 && i <= 80),
    `${toSvgX(80).toFixed(1)},${toSvgY(0).toFixed(1)}`,
  ];

  const highPoly = [
    `${toSvgX(60).toFixed(1)},${toSvgY(0).toFixed(1)}`,
    ...highPts.filter((_, i) => i >= 60),
    `${toSvgX(100).toFixed(1)},${toSvgY(0).toFixed(1)}`,
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: '8px',
      padding: '12px 14px 10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#101828' }}>
          {label} ({unit})
        </span>

        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700 }}>
          <span style={{ color: COLOR_BLUE }}>Low {memberships.Low.toFixed(2)}</span>
          <span style={{ color: COLOR_AMBER }}>Med {memberships.Medium.toFixed(2)}</span>
          <span style={{ color: COLOR_RED }}>High {memberships.High.toFixed(2)}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <line x1={padLeft} y1={toSvgY(1.0)} x2={W - padRight} y2={toSvgY(1.0)} stroke="#f2f4f7" strokeDasharray="3 3" strokeWidth="1" />
        <line x1={padLeft} y1={toSvgY(0.5)} x2={W - padRight} y2={toSvgY(0.5)} stroke="#f2f4f7" strokeDasharray="3 3" strokeWidth="1" />

        <text x={padLeft - 6} y={toSvgY(1.0) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">1.0</text>
        <text x={padLeft - 6} y={toSvgY(0.5) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">0.5</text>
        <text x={padLeft - 6} y={toSvgY(0) + 3} textAnchor="end" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">0</text>

        <line x1={padLeft} y1={H - padBottom} x2={W - padRight} y2={H - padBottom} stroke="#eaecf0" strokeWidth="1" />

        <polygon points={lowPoly.join(' ')} fill="rgba(2, 132, 199, 0.08)" />
        <polygon points={medPoly.join(' ')} fill="rgba(245, 158, 11, 0.08)" />
        <polygon points={highPoly.join(' ')} fill="rgba(239, 68, 68, 0.08)" />

        <polyline points={lowPts.join(' ')} fill="none" stroke={COLOR_BLUE} strokeWidth="2" strokeLinejoin="round" />
        <polyline points={medPts.join(' ')} fill="none" stroke={COLOR_AMBER} strokeWidth="2" strokeLinejoin="round" />
        <polyline points={highPts.join(' ')} fill="none" stroke={COLOR_RED} strokeWidth="2" strokeLinejoin="round" />

        <line
          x1={cursorX}
          y1={padTop - 4}
          x2={cursorX}
          y2={H - padBottom}
          stroke="#344054"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />

        {memberships.Low > 0.005 && (
          <circle cx={cursorX} cy={dotLowY} r="4" fill={COLOR_BLUE} stroke="#ffffff" strokeWidth="1.5" />
        )}
        {memberships.Medium > 0.005 && (
          <circle cx={cursorX} cy={dotMedY} r="4" fill={COLOR_AMBER} stroke="#ffffff" strokeWidth="1.5" />
        )}
        {memberships.High > 0.005 && (
          <circle cx={cursorX} cy={dotHighY} r="4" fill={COLOR_RED} stroke="#ffffff" strokeWidth="1.5" />
        )}

        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={toSvgX(t)} y1={H - padBottom} x2={toSvgX(t)} y2={H - padBottom + 3} stroke="#d0d5dd" strokeWidth="1" />
            <text x={toSvgX(t)} y={H - 3} textAnchor="middle" fontSize="8.5" fill="#98a2b3" fontFamily="monospace">
              {t}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Card 1: Input Controls with Sliders, Presets, Donut Gauge, and Breakdown Bars
 */
export function InputControlsCard({
  soilDryness,
  sunlightIntensity,
  onSoilChange,
  onSunlightChange,
  centroid = 15,
  wateringCategory = 'Medium',
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships  = { Low: 0, Medium: 0, High: 0 },
}) {
  const R = 36;
  const C = 2 * Math.PI * R;
  const progressRatio = Math.min(1, Math.max(0, centroid / 30));
  const strokeDashoffset = C * (1 - progressRatio);

  const catColor = {
    Short:  COLOR_BLUE,
    Medium: COLOR_BRAND,
    Long:   COLOR_RED,
  }[wateringCategory] || COLOR_BRAND;

  const progressBars = [
    { label: 'Soil: Low',    value: soilMemberships.Low,    color: COLOR_BLUE },
    { label: 'Soil: Medium', value: soilMemberships.Medium, color: COLOR_AMBER },
    { label: 'Soil: High',   value: soilMemberships.High,   color: COLOR_RED },
    { label: 'Sun: Low',     value: sunMemberships.Low,     color: COLOR_BLUE },
    { label: 'Sun: Medium',  value: sunMemberships.Medium,  color: COLOR_AMBER },
    { label: 'Sun: High',    value: sunMemberships.High,    color: COLOR_RED },
  ];

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
      gap: '14px',
    }}>
      {/* Header & Presets */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828' }}>
          Input Controls
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[
            { label: 'Wet (15%)', soil: 15, sun: 20 },
            { label: 'Moderate (50%)', soil: 50, sun: 50 },
            { label: 'Dry (85%)', soil: 85, sun: 90 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onSoilChange(preset.soil);
                onSunlightChange(preset.sun);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #eaecf0',
                borderRadius: '6px',
                color: '#344054',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#eff2fe';
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#344054';
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Soil */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eaecf0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#344054' }}>Soil Dryness</span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#101828', fontFamily: 'monospace' }}>
              {soilDryness}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={soilDryness}
            onChange={(e) => onSoilChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4f46e5', cursor: 'pointer' }}
          />
        </div>

        {/* Sun */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eaecf0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#344054' }}>Sunlight Intensity</span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#101828', fontFamily: 'monospace' }}>
              {sunlightIntensity}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sunlightIntensity}
            onChange={(e) => onSunlightChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4f46e5', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Donut & Stacked Bars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '4px' }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={R}
              stroke="#eaecf0"
              strokeWidth="11"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r={R}
              stroke={catColor}
              strokeWidth="11"
              fill="none"
              strokeDasharray={C}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dashoffset 0.25s ease' }}
            />
          </svg>

          <div style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#101828', lineHeight: 1.1 }}>
              {centroid.toFixed(1)}m
            </span>
            <span style={{ fontSize: '10px', color: catColor, fontWeight: 700 }}>
              {wateringCategory}
            </span>
          </div>
        </div>

        {/* Progress Bars */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {progressBars.map((pb, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '75px', fontSize: '10.5px', fontWeight: 600, color: '#475467', whiteSpace: 'nowrap' }}>
                {pb.label}
              </span>
              <div style={{ flex: 1, background: '#eaecf0', height: '5px', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pb.value * 100}%`,
                  height: '100%',
                  background: pb.color,
                  borderRadius: '999px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
              <span style={{ width: '28px', textAlign: 'right', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: '#101828' }}>
                {Math.round(pb.value * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Card 2: Full-Width Membership Functions Card (Soil & Sunlight Side-by-Side)
 */
export function MembershipFunctionsCard({
  soilDryness,
  sunlightIntensity,
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships  = { Low: 0, Medium: 0, High: 0 },
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: '12px',
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828' }}>
            Membership Functions
          </div>
          <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '1px' }}>
            Input fuzzification curves with real-time probe indicators
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '12px',
      }}>
        <MembershipGraph
          label="Soil Dryness"
          value={soilDryness}
          memberships={soilMemberships}
          mfs={{
            low: soilDrynessLow,
            med: soilDrynessMedium,
            high: soilDrynessHigh,
          }}
          domain={[0, 100]}
          unit="%"
        />

        <MembershipGraph
          label="Sunlight Intensity"
          value={sunlightIntensity}
          memberships={sunMemberships}
          mfs={{
            low: sunlightLow,
            med: sunlightMedium,
            high: sunlightHigh,
          }}
          domain={[0, 100]}
          unit="%"
        />
      </div>
    </div>
  );
}

/**
 * Default Combined Export (Backwards-compatibility)
 */
export default function InputMembershipPanel(props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      <InputControlsCard {...props} />
      <MembershipFunctionsCard {...props} />
    </div>
  );
}
