import React, { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  wateringShort, wateringMedium, wateringLong,
} from '../logic/membershipFunctions.js';
import { getDefuzzificationDetails } from '../logic/defuzzification.js';

const OUTPUT_COLORS = {
  Short:  '#38bdf8',
  Medium: '#a78bfa',
  Long:   '#fb923c',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
      color: '#e2e8f0',
      minWidth: '160px',
    }}>
      <div style={{ marginBottom: 6, color: '#94a3b8', fontWeight: 600 }}>
        x = {Number(label).toFixed(2)} min
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color || p.stroke, marginBottom: 2, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: 'monospace' }}>{Number(p.value).toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AggregationChart({
  outputPoints = [],
  clippedCurves = [],
  centroid = 0,
  ruleStrengths = [],
  numerator: propNumerator,
  denominator: propDenominator,
}) {
  // Background MF data: original unclipped curves
  const bgData = useMemo(() => {
    const arr = [];
    for (let x = 0; x <= 30; x += 0.1) {
      const xr = Math.round(x * 10) / 10;
      arr.push({
        x: xr,
        bgShort: wateringShort(xr),
        bgMedium: wateringMedium(xr),
        bgLong: wateringLong(xr),
      });
    }
    return arr;
  }, []);

  // Merge all series into one data array keyed by x
  const chartData = useMemo(() => {
    const map = new Map();

    // Start with background data
    bgData.forEach((d) => {
      map.set(d.x, { x: d.x, bgShort: d.bgShort, bgMedium: d.bgMedium, bgLong: d.bgLong });
    });

    // Add clipped curves
    clippedCurves.forEach((curve) => {
      curve.points.forEach((pt) => {
        const key = Math.round(pt.x * 10) / 10;
        const entry = map.get(key) || { x: key };
        entry[`clip${curve.label}`] = pt.y;
        map.set(key, entry);
      });
    });

    // Add aggregated output
    outputPoints.forEach((pt) => {
      const key = Math.round(pt.x * 10) / 10;
      const entry = map.get(key) || { x: key };
      entry.aggregate = pt.y;
      map.set(key, entry);
    });

    return Array.from(map.values()).sort((a, b) => a.x - b.x);
  }, [bgData, clippedCurves, outputPoints]);

  // Compute or use defuzzification numerics from outputPoints
  const { numerator, denominator } = useMemo(() => {
    if (typeof propNumerator === 'number' && typeof propDenominator === 'number') {
      return { numerator: propNumerator, denominator: propDenominator };
    }
    return getDefuzzificationDetails(outputPoints);
  }, [propNumerator, propDenominator, outputPoints]);

  const catColor = {
    Short: '#38bdf8',
    Medium: '#a78bfa',
    Long: '#fb923c',
  };

  const centroidCategory = centroid < 10 ? 'Short' : centroid < 20 ? 'Medium' : 'Long';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #1e3a5f',
      borderRadius: '14px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #10b981, #ffd700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>∫</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
            Fuzzy Aggregation &amp; Defuzzification
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Clipped output MFs → aggregated area → centroid
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id="gradAggregate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradClipShort" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradClipMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradClipLong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 30]}
            tickCount={7}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: 'Watering Duration (min)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 1]}
            tickCount={6}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: '\u03bc(x)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />

          {/* Background: original unclipped MFs as dashed lines */}
          <Line
            type="monotone"
            dataKey="bgShort"
            name="Short (original)"
            stroke={OUTPUT_COLORS.Short}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            opacity={0.4}
            isAnimationActive={false}
            legendType="line"
          />
          <Line
            type="monotone"
            dataKey="bgMedium"
            name="Medium (original)"
            stroke={OUTPUT_COLORS.Medium}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            opacity={0.4}
            isAnimationActive={false}
            legendType="line"
          />
          <Line
            type="monotone"
            dataKey="bgLong"
            name="Long (original)"
            stroke={OUTPUT_COLORS.Long}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            opacity={0.4}
            isAnimationActive={false}
            legendType="line"
          />

          {/* Clipped areas */}
          <Area
            type="monotone"
            dataKey="clipShort"
            name="Short (clipped)"
            stroke={OUTPUT_COLORS.Short}
            strokeWidth={1.5}
            fill="url(#gradClipShort)"
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="clipMedium"
            name="Medium (clipped)"
            stroke={OUTPUT_COLORS.Medium}
            strokeWidth={1.5}
            fill="url(#gradClipMedium)"
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="clipLong"
            name="Long (clipped)"
            stroke={OUTPUT_COLORS.Long}
            strokeWidth={1.5}
            fill="url(#gradClipLong)"
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Aggregated output */}
          <Area
            type="monotone"
            dataKey="aggregate"
            name="Aggregated Output"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#gradAggregate)"
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Centroid line */}
          <ReferenceLine
            x={centroid}
            stroke="#ffd700"
            strokeWidth={2}
            strokeDasharray="5 3"
            label={{
              value: `\u25bc ${centroid.toFixed(2)} min`,
              position: 'top',
              fill: '#ffd700',
              fontSize: 11,
              fontWeight: 700,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Defuzzification formula */}
      <div style={{
        marginTop: '16px',
        background: '#0a0f1e',
        border: '1px solid #1e3a5f',
        borderRadius: '10px',
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
          Defuzzification — Centroid Method
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.8' }}>
          <span style={{ color: '#ffd700' }}>Centroid</span>
          {' = '}
          <span style={{ color: '#94a3b8' }}>\u222b[x\u00b7\u03bc(x)dx]</span>
          {' / '}
          <span style={{ color: '#94a3b8' }}>\u222b[\u03bc(x)dx]</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.8' }}>
          {'= '}
          <span style={{ color: '#38bdf8' }}>{numerator.toFixed(4)}</span>
          {' / '}
          <span style={{ color: '#38bdf8' }}>{denominator.toFixed(4)}</span>
          {' = '}
          <span style={{ color: '#ffd700', fontWeight: 700 }}>
            {centroid.toFixed(4)} min
          </span>
        </div>

        {/* Clipped curve strengths */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
          {clippedCurves.map((curve) => (
            <div key={curve.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: curve.color + '22',
              border: `1px solid ${curve.color}55`,
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '11px',
            }}>
              <span style={{ color: curve.color, fontWeight: 700 }}>{curve.label}</span>
              <span style={{ color: '#94a3b8' }}>strength:</span>
              <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{curve.strength.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Centroid result badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <div style={{
          background: `${catColor[centroidCategory]}22`,
          border: `2px solid ${catColor[centroidCategory]}`,
          borderRadius: '999px',
          padding: '6px 20px',
          fontSize: '13px',
          fontWeight: 700,
          color: catColor[centroidCategory],
        }}>
          Output: {centroid.toFixed(2)} min — {centroidCategory} watering
        </div>
      </div>
    </div>
  );
}
