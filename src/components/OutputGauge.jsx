import React, { useMemo } from 'react';

const CAT_COLORS = {
  Short:  '#38bdf8',
  Medium: '#a78bfa',
  Long:   '#fb923c',
};

const MF_COLORS = {
  Low:    '#38bdf8',
  Medium: '#a78bfa',
  High:   '#f97316',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end   = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function MiniBar({ label, value, color }) {
  const pct = Math.round(value * 100);
  const active = value > 0.01;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: active ? color : '#475569', fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{value.toFixed(3)}</span>
      </div>
      <div style={{
        height: '5px',
        borderRadius: '3px',
        background: '#1e293b',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '3px',
          background: active ? color : '#334155',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

export default function OutputGauge({
  centroid = 0,
  wateringCategory = 'Short',
  activeRulesCount = 0,
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships  = { Low: 0, Medium: 0, High: 0 },
}) {
  // SVG gauge parameters
  const CX = 150, CY = 140, R = 100;
  const START_ANGLE = 180; // left = 180°
  const END_ANGLE   = 0;   // right = 0°

  // Map centroid (0–30) to angle (180° → 0°), so 0min=180°, 30min=0°
  const valueAngle = START_ANGLE - (centroid / 30) * 180;

  // Track arc: color coded zones
  // Short: 180°→120° (0–10 min), Medium: 120°→60° (10–20 min), Long: 60°→0° (20–30 min)
  const zones = [
    { startA: 180, endA: 120, color: '#38bdf8', label: 'Short' },
    { startA: 120, endA: 60,  color: '#a78bfa', label: 'Medium' },
    { startA: 60,  endA: 0,   color: '#fb923c', label: 'Long' },
  ];

  // Needle tip
  const needle = polarToCartesian(CX, CY, R - 10, valueAngle);
  const needleBase1 = polarToCartesian(CX, CY, 10, valueAngle + 90);
  const needleBase2 = polarToCartesian(CX, CY, 10, valueAngle - 90);

  // Value fill arc (from 180° down to valueAngle)
  const fillColor = centroid < 10 ? '#38bdf8' : centroid < 20 ? '#a78bfa' : '#fb923c';

  // Category color
  const catColor = CAT_COLORS[wateringCategory] || '#94a3b8';

  // Tick marks
  const ticks = useMemo(() => {
    const t = [];
    for (let m = 0; m <= 30; m += 5) {
      const angle = 180 - (m / 30) * 180;
      const inner = polarToCartesian(CX, CY, R - 12, angle);
      const outer = polarToCartesian(CX, CY, R + 2, angle);
      const lbl   = polarToCartesian(CX, CY, R - 24, angle);
      t.push({ m, angle, inner, outer, lbl });
    }
    return t;
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #1e3a5f',
      borderRadius: '14px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: `linear-gradient(135deg, ${catColor}, #0f172a)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>💧</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
            Output Dashboard
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Defuzzified watering duration
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '999px',
            background: activeRulesCount > 0 ? '#10b98133' : '#1e293b',
            border: `1px solid ${activeRulesCount > 0 ? '#10b981' : '#334155'}`,
            color: activeRulesCount > 0 ? '#10b981' : '#64748b',
          }}>
            {activeRulesCount}/9 rules active
          </span>
        </div>
      </div>

      {/* SVG Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="175" viewBox="0 0 300 175">
          {/* Outer track background */}
          <path
            d={arcPath(CX, CY, R, 180, 0)}
            fill="none"
            stroke="#1e293b"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Zone colored arcs */}
          {zones.map((z) => (
            <path
              key={z.label}
              d={arcPath(CX, CY, R, z.endA, z.startA)}
              fill="none"
              stroke={z.color}
              strokeWidth="18"
              strokeLinecap="butt"
              opacity={0.25}
            />
          ))}

          {/* Value fill arc (from 180° to valueAngle, counter-clockwise sweep) */}
          {centroid > 0 && (
            <path
              d={arcPath(CX, CY, R, valueAngle, 180)}
              fill="none"
              stroke={fillColor}
              strokeWidth="18"
              strokeLinecap="round"
              opacity={0.9}
              style={{ transition: 'all 0.5s ease' }}
            />
          )}

          {/* Tick marks and labels */}
          {ticks.map((t) => (
            <g key={t.m}>
              <line
                x1={t.inner.x} y1={t.inner.y}
                x2={t.outer.x} y2={t.outer.y}
                stroke="#334155"
                strokeWidth={t.m % 10 === 0 ? 2 : 1}
              />
              {t.m % 10 === 0 && (
                <text
                  x={t.lbl.x}
                  y={t.lbl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#64748b"
                >
                  {t.m}
                </text>
              )}
            </g>
          ))}

          {/* Zone labels at arc midpoints */}
          {zones.map((z) => {
            const midAngle = (z.startA + z.endA) / 2;
            const lp = polarToCartesian(CX, CY, R + 16, midAngle);
            return (
              <text
                key={z.label}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill={z.color}
                opacity={0.7}
                fontWeight="600"
              >
                {z.label}
              </text>
            );
          })}

          {/* Needle */}
          <polygon
            points={`${needle.x},${needle.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={fillColor}
            opacity={0.9}
            style={{ transition: 'all 0.5s ease' }}
          />
          {/* Needle hub */}
          <circle cx={CX} cy={CY} r={8} fill="#0f172a" stroke={fillColor} strokeWidth={2} />
          <circle cx={CX} cy={CY} r={3} fill={fillColor} />

          {/* Center value text */}
          <text
            x={CX}
            y={CY + 32}
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill="#f1f5f9"
            style={{ transition: 'all 0.5s ease' }}
          >
            {centroid.toFixed(2)}
          </text>
          <text x={CX} y={CY + 50} textAnchor="middle" fontSize="11" fill="#64748b">
            minutes
          </text>
        </svg>
      </div>

      {/* Category badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', marginBottom: '16px' }}>
        <span style={{
          padding: '5px 20px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          background: catColor + '33',
          border: `2px solid ${catColor}`,
          color: catColor,
          letterSpacing: '0.08em',
          transition: 'all 0.3s',
        }}>
          {wateringCategory} Irrigation
        </span>
      </div>

      {/* Membership degree indicators — 2 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        background: '#0a0f1e',
        border: '1px solid #1e3a5f',
        borderRadius: '10px',
        padding: '14px',
      }}>
        {/* Soil */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🌱 Soil
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Low', 'Medium', 'High'].map((k) => (
              <MiniBar key={k} label={k} value={soilMemberships[k] ?? 0} color={MF_COLORS[k]} />
            ))}
          </div>
        </div>

        {/* Sun */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ☀️ Sun
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Low', 'Medium', 'High'].map((k) => (
              <MiniBar key={k} label={k} value={sunMemberships[k] ?? 0} color={MF_COLORS[k]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
