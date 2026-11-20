import React, { useMemo } from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  soilDrynessLow, soilDrinessMedium, soilDrynessHigh,
  sunlightLow, sunlightMedium, sunlightHigh,
} from '../logic/membershipFunctions.js';

const MF_COLORS = {
  Low: '#38bdf8',
  Medium: '#a78bfa',
  High: '#f97316',
};

function MFBadge({ label, value, color }) {
  const active = value > 0.01;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background: active ? color + '33' : '#1e293b',
        border: `1.5px solid ${active ? color : '#334155'}`,
        color: active ? color : '#64748b',
        opacity: active ? 1 : 0.6,
        transition: 'all 0.3s',
      }}
    >
      <span
        style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: active ? color : '#475569',
          display: 'inline-block',
        }}
      />
      {label}: {value.toFixed(3)}
    </span>
  );
}

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
    }}>
      <div style={{ marginBottom: 4, color: '#94a3b8' }}>x = {Number(label).toFixed(1)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {'\u03bc'}({p.dataKey}) = {Number(p.value).toFixed(4)}
        </div>
      ))}
    </div>
  );
}

function MFChart({ data, currentValue, memberships, xLabel, title }) {
  const uid = xLabel.replace(/\s+/g, '');
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#94a3b8',
        marginBottom: '8px',
        textAlign: 'center',
        letterSpacing: '0.03em',
      }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id={`gradLow${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MF_COLORS.Low} stopOpacity={0.3} />
              <stop offset="95%" stopColor={MF_COLORS.Low} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id={`gradMed${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MF_COLORS.Medium} stopOpacity={0.3} />
              <stop offset="95%" stopColor={MF_COLORS.Medium} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id={`gradHigh${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MF_COLORS.High} stopOpacity={0.3} />
              <stop offset="95%" stopColor={MF_COLORS.High} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: xLabel, position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 1]}
            tickCount={6}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: '\u03bc(x)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94a3b8' }} />
          <Area
            type="monotone"
            dataKey="Low"
            stroke={MF_COLORS.Low}
            strokeWidth={2}
            fill={`url(#gradLow${uid})`}
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="Medium"
            stroke={MF_COLORS.Medium}
            strokeWidth={2}
            fill={`url(#gradMed${uid})`}
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="High"
            stroke={MF_COLORS.High}
            strokeWidth={2}
            fill={`url(#gradHigh${uid})`}
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <ReferenceLine
            x={currentValue}
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 2"
            label={{
              value: `\u25bc ${Number(currentValue).toFixed(1)}`,
              position: 'top',
              fill: '#10b981',
              fontSize: 11,
              fontWeight: 700,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Membership Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
        {['Low', 'Medium', 'High'].map((key) => (
          <MFBadge key={key} label={key} value={memberships[key]} color={MF_COLORS[key]} />
        ))}
      </div>

      {/* Active sets bar indicators */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Low', 'Medium', 'High'].filter((k) => memberships[k] > 0.01).map((k) => (
          <div key={k} style={{
            height: '4px',
            width: `${memberships[k] * 60 + 20}px`,
            borderRadius: '2px',
            background: MF_COLORS[k],
            opacity: 0.7,
            transition: 'width 0.3s',
          }} title={`${k}: ${memberships[k].toFixed(3)}`} />
        ))}
      </div>
    </div>
  );
}

export default function MembershipChart({
  soilDryness = 50,
  sunlightIntensity = 50,
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships = { Low: 0, Medium: 0, High: 0 },
}) {
  const soilData = useMemo(() => {
    const arr = [];
    for (let x = 0; x <= 100; x += 0.5) {
      arr.push({ x, Low: soilDrynessLow(x), Medium: soilDrinessMedium(x), High: soilDrynessHigh(x) });
    }
    return arr;
  }, []);

  const sunData = useMemo(() => {
    const arr = [];
    for (let x = 0; x <= 100; x += 0.5) {
      arr.push({ x, Low: sunlightLow(x), Medium: sunlightMedium(x), High: sunlightHigh(x) });
    }
    return arr;
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #1e3a5f',
      borderRadius: '14px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>〜</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
            Membership Functions
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Fuzzification — crisp inputs mapped to fuzzy degrees
          </div>
        </div>
      </div>

      {/* Two charts side by side */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <MFChart
          data={soilData}
          currentValue={soilDryness}
          memberships={soilMemberships}
          xLabel="Soil Dryness (%)"
          title="Soil Dryness Membership Functions"
        />
        <MFChart
          data={sunData}
          currentValue={sunlightIntensity}
          memberships={sunMemberships}
          xLabel="Sunlight Intensity (%)"
          title="Sunlight Intensity Membership Functions"
        />
      </div>
    </div>
  );
}
