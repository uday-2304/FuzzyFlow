import React, { useState, useCallback } from 'react';

const CARD_STYLE = {
  background: '#111c35',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '24px',
};

const STAT_VAL_STYLE = {
  fontSize: '2rem',
  fontWeight: '800',
  lineHeight: 1,
  transition: 'color 0.3s ease',
};

function getValueColor(val) {
  if (val < 30) return '#38bdf8';
  if (val < 70) return '#a78bfa';
  return '#f97316';
}

function SliderRow({ icon, label, value, onChange, color }) {
  const [localVal, setLocalVal] = useState(String(value));

  // Keep local in sync when parent changes (preset buttons)
  React.useEffect(() => {
    setLocalVal(String(value));
  }, [value]);

  const handleSlider = (e) => {
    const v = Number(e.target.value);
    setLocalVal(String(v));
    onChange(v);
  };

  const handleNumberChange = (e) => {
    setLocalVal(e.target.value);
  };

  const handleNumberBlur = () => {
    let v = parseFloat(localVal);
    if (isNaN(v)) v = 0;
    v = Math.max(0, Math.min(100, Math.round(v)));
    setLocalVal(String(v));
    onChange(v);
  };

  const handleNumberKeyDown = (e) => {
    if (e.key === 'Enter') handleNumberBlur();
  };

  // Slider gradient fill
  const pct = `${value}%`;
  const trackBg = `linear-gradient(to right, #10b981 0%, #10b981 ${pct}, rgba(255,255,255,0.1) ${pct})`;

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px', letterSpacing: '0.03em' }}>{label}</span>
        </div>
        {/* Number input */}
        <input
          type="number"
          min={0}
          max={100}
          value={localVal}
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          onKeyDown={handleNumberKeyDown}
          style={{
            width: '64px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            color: color,
            fontSize: '15px',
            fontWeight: '700',
            padding: '4px 8px',
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>
      {/* Value display */}
      <div style={{ ...STAT_VAL_STYLE, color, marginBottom: '10px', fontSize: '1.5rem' }}>
        {value}
        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b', marginLeft: '4px' }}>/ 100</span>
      </div>
      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={handleSlider}
        style={{ background: trackBg, width: '100%' }}
      />
      {/* Tick marks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {[0, 25, 50, 75, 100].map(t => (
          <span key={t} style={{ color: '#475569', fontSize: '11px' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: '💧 Wet + Low Sun', soil: 10, sun: 10 },
  { label: '⚖️ Moderate',      soil: 50, sun: 50 },
  { label: '🔥 Dry + High Sun', soil: 85, sun: 90 },
];

export default function InputControls({ soilDryness, sunlightIntensity, onSoilChange, onSunlightChange }) {
  const setPreset = useCallback((soil, sun) => {
    onSoilChange(soil);
    onSunlightChange(sun);
  }, [onSoilChange, onSunlightChange]);

  const reset = useCallback(() => {
    onSoilChange(50);
    onSunlightChange(50);
  }, [onSoilChange, onSunlightChange]);

  const soilColor = getValueColor(soilDryness);
  const sunColor  = getValueColor(sunlightIntensity);

  return (
    <div style={CARD_STYLE} className="animate-fadein">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.04em' }}>
          🎛️ Input Controls
        </h2>
        <button
          onClick={reset}
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
        >
          ↺ Reset
        </button>
      </div>

      {/* Sliders */}
      <SliderRow
        icon="🌱"
        label="SOIL DRYNESS"
        value={soilDryness}
        onChange={onSoilChange}
        color={soilColor}
      />
      <SliderRow
        icon="☀️"
        label="SUNLIGHT INTENSITY"
        value={sunlightIntensity}
        onChange={onSunlightChange}
        color={sunColor}
      />

      {/* Preset buttons */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#475569', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
          QUICK PRESETS
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map(({ label, soil, sun }) => (
            <button
              key={label}
              onClick={() => setPreset(soil, sun)}
              style={{
                flex: 1,
                minWidth: '100px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                padding: '8px 6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                e.currentTarget.style.color = '#10b981';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Live summary */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>SOIL</div>
          <div style={{ color: soilColor, fontSize: '1.4rem', fontWeight: 800, transition: 'color 0.3s' }}>{soilDryness}%</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>SUN</div>
          <div style={{ color: sunColor, fontSize: '1.4rem', fontWeight: 800, transition: 'color 0.3s' }}>{sunlightIntensity}%</div>
        </div>
      </div>
    </div>
  );
}
