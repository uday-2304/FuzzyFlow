import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Color interpolation utility
function lerpColor(hexA, hexB, t) {
  const parse = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = parse(hexA);
  const b = parse(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

export default function IrrigationAnimation({
  centroid = 15,
  wateringCategory = 'Medium',
  soilDryness = 50,
  sunlightIntensity = 50,
}) {
  const cat = wateringCategory || 'Medium';
  const cent = typeof centroid === 'number' ? centroid : 15;
  const soilDry = typeof soilDryness === 'number' ? soilDryness : 50;
  const sunInt = typeof sunlightIntensity === 'number' ? sunlightIntensity : 50;

  // Category themes
  const THEMES = {
    Short: {
      color: '#0284c7',
      bg: '#e0f2fe',
      border: '#bae6fd',
      label: 'Short Duration',
      flowRate: '1.2 L/min',
      valveAperture: 35,
    },
    Medium: {
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a',
      label: 'Medium Duration',
      flowRate: '2.8 L/min',
      valveAperture: 65,
    },
    Long: {
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fecaca',
      label: 'Long Duration',
      flowRate: '4.5 L/min',
      valveAperture: 100,
    },
  };

  const currentTheme = THEMES[cat] || THEMES.Medium;

  // Sky colors depending on sunlight
  const skyTop = sunInt > 70 ? '#7dd3fc' : sunInt > 30 ? '#bae6fd' : '#cbd5e1';
  const skyBottom = sunInt > 65 ? '#fef08a' : sunInt > 35 ? '#e0f2fe' : '#f1f5f9';

  // Dynamic soil color
  const soilColor = useMemo(() => {
    if (soilDry <= 30) return '#2e1503'; // Deep rich wet loam
    if (soilDry <= 70) return lerpColor('#2e1503', '#6c300c', (soilDry - 30) / 40);
    return lerpColor('#6c300c', '#9a4714', (soilDry - 70) / 30); // Parched dry soil
  }, [soilDry]);

  // Sun properties
  const sunRadius = 32 + (sunInt / 100) * 8;
  const sunPulseDuration = 2.5 + (1 - sunInt / 100) * 1.5;

  // Droplets configuration
  const dropletCount = cat === 'Short' ? 14 : cat === 'Medium' ? 24 : 36;
  const dropletSpeed = cat === 'Short' ? 1.6 : cat === 'Medium' ? 1.2 : 0.85;

  // Generate deterministic droplet trajectory data
  const droplets = useMemo(() => {
    const list = [];
    for (let i = 0; i < dropletCount; i++) {
      const spread = (i % 6) * 18 - 45;
      const targetX = 390 + (i * 14) % 190 + spread;
      const peakY = 130 - (i % 4) * 16;
      const landY = 270 + (i % 3) * 6;
      const delay = (i / dropletCount) * dropletSpeed;
      const size = 2.2 + (i % 3) * 0.7;
      list.push({ id: i, targetX, peakY, landY, delay, size });
    }
    return list;
  }, [dropletCount, dropletSpeed]);

  // Gauge calculations for the HUD
  const gaugeR = 34;
  const gaugeC = 2 * Math.PI * gaugeR;
  const gaugePct = Math.min(1, Math.max(0, cent / 30));
  const gaugeOffset = gaugeC * (1 - gaugePct);

  // Plant health & reaction
  const isParched = soilDry > 75 && cat === 'Short';
  const plantSwayDuration = isParched ? 4.5 : 2.8;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      userSelect: 'none',
    }}>
      {/* Top Telemetry Header Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        width: '100%',
      }}>
        {/* Card 1: Valve State */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #eaecf0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sprinkler Valve
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentTheme.color,
                boxShadow: `0 0 8px ${currentTheme.color}`,
                display: 'inline-block',
              }} />
              {cat.toUpperCase()} ({cent.toFixed(2)}m)
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: currentTheme.bg,
            color: currentTheme.color,
            border: `1px solid ${currentTheme.border}`,
          }}>
            {currentTheme.flowRate}
          </span>
        </div>

        {/* Card 2: Soil Moisture Status */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #eaecf0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Soil Hydration
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828', marginTop: '2px' }}>
              {100 - soilDry}% Moisture
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: soilDry < 40 ? '#ecfdf5' : soilDry < 75 ? '#eff2fe' : '#fef3c7',
            color: soilDry < 40 ? '#059669' : soilDry < 75 ? '#4f46e5' : '#b45309',
            border: '1px solid #eaecf0',
          }}>
            {soilDry < 40 ? 'Well Hydrated' : soilDry < 75 ? 'Moderate' : 'Parched'}
          </span>
        </div>

        {/* Card 3: Sunlight & Environment */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #eaecf0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Solar Radiation
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#101828', marginTop: '2px' }}>
              {sunInt}% Intensity
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: sunInt > 70 ? '#fef3c7' : sunInt > 35 ? '#e0f2fe' : '#f1f5f9',
            color: sunInt > 70 ? '#b45309' : sunInt > 35 ? '#0284c7' : '#475467',
            border: '1px solid #eaecf0',
          }}>
            {sunInt > 70 ? 'High Noon' : sunInt > 35 ? 'Clear Daylight' : 'Overcast'}
          </span>
        </div>
      </div>

      {/* Main Animated Scene Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #eaecf0',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.04)',
        background: '#f8fafc',
      }}>
        <svg
          viewBox="0 0 840 430"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dynamic Sky Gradient */}
            <linearGradient id="sceneSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyTop} />
              <stop offset="70%" stopColor={skyBottom} />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>

            {/* Sun Glow Filter */}
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#facc15" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Rich Soil Gradient */}
            <linearGradient id="sceneSoilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={soilColor} />
              <stop offset="35%" stopColor="#251205" />
              <stop offset="100%" stopColor="#140902" />
            </linearGradient>

            {/* Water Spray Stream Gradient */}
            <linearGradient id="waterStreamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            {/* Sprinkler Metal Finish */}
            <linearGradient id="metalPipeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Soft Ambient Cloud Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. SKY BACKGROUND */}
          <rect x="0" y="0" width="840" height="270" fill="url(#sceneSkyGrad)" />

          {/* 2. DRIFTING CLOUDS */}
          <motion.g
            animate={{ x: [-80, 900] }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
            opacity={sunInt > 60 ? 0.45 : 0.75}
          >
            <path
              d="M 60 75 Q 80 50 110 55 Q 135 40 165 52 Q 195 50 205 75 Q 215 90 195 100 L 70 100 Q 50 90 60 75 Z"
              fill="#ffffff"
            />
          </motion.g>

          <motion.g
            animate={{ x: [-120, 880] }}
            transition={{ duration: 75, repeat: Infinity, ease: 'linear', delay: 18 }}
            opacity={sunInt > 60 ? 0.35 : 0.65}
          >
            <path
              d="M 280 105 Q 295 85 320 90 Q 340 75 365 85 Q 390 85 400 105 L 290 105 Z"
              fill="#ffffff"
            />
          </motion.g>

          {/* 3. ROTATING / PULSING SUN */}
          <g transform="translate(710, 75)">
            {/* Sun Corona Glow */}
            <circle cx="0" cy="0" r={sunRadius * 1.8} fill="url(#sunCorona)" />

            {/* Rotating Solar Rays */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const r1 = sunRadius + 6;
                const r2 = sunRadius + 18 + (sunInt / 100) * 10;
                return (
                  <line
                    key={deg}
                    x1={Math.cos(rad) * r1}
                    y1={Math.sin(rad) * r1}
                    x2={Math.cos(rad) * r2}
                    y2={Math.sin(rad) * r2}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity={0.5 + (sunInt / 100) * 0.45}
                  />
                );
              })}
            </motion.g>

            {/* Sun Core Disc */}
            <motion.circle
              cx="0"
              cy="0"
              r={sunRadius}
              fill="#f59e0b"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: sunPulseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="0" cy="0" r={sunRadius * 0.8} fill="#fde047" />
          </g>

          {/* 4. SOIL CROSS-SECTION & ROLLING TERRAIN */}
          <path
            d="M 0 265 Q 210 258 420 263 T 840 260 L 840 430 L 0 430 Z"
            fill="url(#sceneSoilGrad)"
          />

          {/* Lush Grass Surface Fringe */}
          <path
            d="M 0 265 Q 210 258 420 263 T 840 260 L 840 274 Q 630 276 420 271 T 0 273 Z"
            fill="#15803d"
          />
          <path
            d="M 0 265 Q 210 258 420 263 T 840 260 L 840 269 Q 630 272 420 267 T 0 268 Z"
            fill="#22c55e"
            opacity="0.85"
          />

          {/* Grass Tufts along the crest */}
          {[60, 140, 230, 310, 370, 520, 600, 680, 770].map((gx, idx) => (
            <motion.path
              key={idx}
              d={`M ${gx} 263 Q ${gx - 4} 248 ${gx - 7} 245 Q ${gx - 2} 255 ${gx} 263 Q ${gx + 3} 247 ${gx + 6} 244 Q ${gx + 2} 254 ${gx} 263 Z`}
              fill="#16a34a"
              animate={{ rotate: [-2, 3, -2] }}
              transition={{ duration: 2.2 + (idx % 3), repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${gx}px 263px` }}
            />
          ))}

          {/* 5. SUBTERRANEAN ROOT SYSTEM & MOISTURE ABSORPTION */}
          <g transform="translate(480, 268)">
            {/* Primary Taproot */}
            <path
              d="M 0 0 Q -4 45 2 95 Q 6 125 0 145"
              fill="none"
              stroke="#d4d4d8"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Lateral Root Branches */}
            <path
              d="M -2 30 Q -35 45 -65 60 M 1 45 Q 35 60 70 75 M -1 75 Q -40 95 -60 120 M 3 85 Q 40 105 65 130 M -1 110 Q -25 125 -40 140"
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Glowing Moisture Seepage Particles in Soil */}
            {[
              { cx: -45, cy: 50, delay: 0 },
              { cx: 50, cy: 65, delay: 0.8 },
              { cx: -30, cy: 90, delay: 1.4 },
              { cx: 40, cy: 110, delay: 0.4 },
              { cx: 0, cy: 130, delay: 1.9 },
            ].map((p, i) => (
              <motion.circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="3"
                fill="#38bdf8"
                animate={{
                  scale: [0.6, 1.3, 0.6],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 2.4,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </g>

          {/* Secondary Crop / Sprout Roots at x=340 */}
          <g transform="translate(340, 268)">
            <path
              d="M 0 0 Q -2 30 0 60 M 0 20 Q -20 35 -35 45 M 0 32 Q 22 45 35 55"
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>

          {/* 6. PRIMARY CROP (Vibrant Flowering Plant at x=480) */}
          <motion.g
            transform="translate(480, 266)"
            animate={{ rotate: isParched ? [3, 6, 3] : [-1.5, 2, -1.5] }}
            transition={{ duration: plantSwayDuration, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Main Plant Stem */}
            <path
              d="M 0 0 Q -5 -60 2 -115 Q 6 -140 0 -165"
              fill="none"
              stroke="#15803d"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Lower-left Leaf */}
            <motion.g
              transform="translate(-2, -50)"
              animate={{ rotate: [-2, 3, -2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                d="M 0 0 C -35 -15 -60 -5 -75 10 C -50 25 -25 15 0 0 Z"
                fill="#16a34a"
              />
              <path
                d="M 0 0 C -25 -2 -45 5 -70 9"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
            </motion.g>

            {/* Lower-right Leaf */}
            <motion.g
              transform="translate(1, -75)"
              animate={{ rotate: [2, -3, 2] }}
              transition={{ duration: 2.7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                d="M 0 0 C 35 -20 65 -10 80 8 C 55 22 25 15 0 0 Z"
                fill="#22c55e"
              />
              <path
                d="M 0 0 C 25 -3 45 4 75 7"
                fill="none"
                stroke="#4ade80"
                strokeWidth="1.5"
              />
            </motion.g>

            {/* Mid-left Leaf */}
            <motion.g
              transform="translate(0, -110)"
              animate={{ rotate: [-3, 2, -3] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                d="M 0 0 C -30 -15 -50 -5 -60 8 C -40 18 -20 10 0 0 Z"
                fill="#16a34a"
              />
              <path
                d="M 0 0 C -20 -2 -38 4 -56 7"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.4"
              />
            </motion.g>

            {/* Flower Blossom on top */}
            <g transform="translate(0, -165)">
              {/* Petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="0"
                  rx="9"
                  ry="20"
                  fill="#f43f5e"
                  transform={`rotate(${deg}) translate(0, -16)`}
                  opacity="0.95"
                />
              ))}
              {/* Inner Petal Ring */}
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="0"
                  rx="6.5"
                  ry="14"
                  fill="#fb7185"
                  transform={`rotate(${deg}) translate(0, -12)`}
                  opacity="0.9"
                />
              ))}
              {/* Center Seed Disk */}
              <circle cx="0" cy="0" r="11" fill="#facc15" stroke="#eab308" strokeWidth="2" />
              <circle cx="0" cy="0" r="6" fill="#ca8a04" opacity="0.8" />
            </g>
          </motion.g>

          {/* 7. SECONDARY SPROUT / SEEDLING (x=340) */}
          <motion.g
            transform="translate(340, 266)"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '0px 0px' }}
          >
            <path d="M 0 0 Q -2 -25 0 -45" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 0 -35 C -18 -45 -28 -35 -32 -25 C -20 -20 -10 -25 0 -35 Z" fill="#22c55e" />
            <path d="M 0 -42 C 18 -52 28 -42 32 -32 C 20 -27 10 -32 0 -42 Z" fill="#4ade80" />
          </motion.g>

          {/* 8. SPRINKLER STATION & RISER ASSEMBLY (x=160, y=200) */}
          <g transform="translate(150, 185)">
            {/* Underground main supply pipe */}
            <rect x="-130" y="80" width="135" height="12" rx="4" fill="url(#metalPipeGrad)" />
            <rect x="-2" y="80" width="10" height="12" rx="2" fill="#1e293b" />

            {/* Vertical riser pipe */}
            <rect x="0" y="22" width="10" height="65" rx="3" fill="url(#metalPipeGrad)" />
            <rect x="-3" y="60" width="16" height="8" rx="2" fill="#334155" />

            {/* Solenoid Control Box */}
            <rect x="-24" y="32" width="24" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Blinking Status LED */}
            <motion.circle
              cx="-12"
              cy="44"
              r="3.5"
              fill={currentTheme.color}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Brass / Rotary Sprinkler Head */}
            <rect x="-2" y="10" width="14" height="14" rx="3" fill="#d97706" />
            <path d="M 5 10 L 18 2 L 20 6 L 8 13 Z" fill="#b45309" />
            <motion.path
              d="M 5 10 L 22 -2 L 26 2 L 9 14 Z"
              fill="#f59e0b"
              animate={{ rotate: [-6, 12, -6] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '5px 10px' }}
            />

            {/* Sprinkler Nozzle Origin Point at (22, 0) */}
          </g>

          {/* 9. CONTINUOUS PARABOLIC WATER SPRAY ARCS */}
          <g>
            {/* Main Upper Arc */}
            <motion.path
              d="M 172 185 Q 310 80 540 266"
              fill="none"
              stroke="url(#waterStreamGrad)"
              strokeWidth={cat === 'Long' ? '5' : cat === 'Medium' ? '3.5' : '2.2'}
              strokeLinecap="round"
              strokeDasharray="12 6"
              animate={{ strokeDashoffset: [-72, 0] }}
              transition={{ duration: dropletSpeed * 0.8, repeat: Infinity, ease: 'linear' }}
              opacity={cat === 'Short' ? 0.65 : 0.9}
            />

            {/* Mid Arc to secondary sprout */}
            <motion.path
              d="M 172 185 Q 260 120 380 266"
              fill="none"
              stroke="url(#waterStreamGrad)"
              strokeWidth={cat === 'Long' ? '4' : '2.5'}
              strokeLinecap="round"
              strokeDasharray="8 5"
              animate={{ strokeDashoffset: [-52, 0] }}
              transition={{ duration: dropletSpeed * 0.7, repeat: Infinity, ease: 'linear' }}
              opacity={cat === 'Short' ? 0.5 : 0.85}
            />

            {/* Fine Mist Stream for Long Duration */}
            {cat === 'Long' && (
              <motion.path
                d="M 172 185 Q 340 70 600 266"
                fill="none"
                stroke="url(#waterStreamGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                animate={{ strokeDashoffset: [-80, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                opacity="0.75"
              />
            )}
          </g>

          {/* 10. PHYSICS WATER DROPLETS & IMPACT SPLASHES */}
          {droplets.map((d) => (
            <React.Fragment key={d.id}>
              {/* Flying Ballistic Droplet */}
              <motion.circle
                r={d.size}
                fill="#38bdf8"
                initial={{ cx: 172, cy: 185, opacity: 0 }}
                animate={{
                  cx: [172, (172 + d.targetX) / 2, d.targetX],
                  cy: [185, d.peakY, d.landY],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: dropletSpeed,
                  delay: d.delay,
                  repeat: Infinity,
                  ease: 'easeIn',
                }}
              />

              {/* Surface Impact Splash Ripples */}
              <motion.ellipse
                cx={d.targetX}
                cy={d.landY}
                rx="0"
                ry="0"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                initial={{ rx: 0, ry: 0, opacity: 0 }}
                animate={{
                  rx: [0, 12 + d.size * 2],
                  ry: [0, 4 + d.size],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 0.55,
                  delay: d.delay + dropletSpeed * 0.88,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </React.Fragment>
          ))}

          {/* 11. HUD GLASS OVERLAYS ON CANVAS */}

          {/* Bottom-Left: Live Centroid & Valve Gauge HUD Card */}
          <g transform="translate(24, 290)">
            {/* Glass Background */}
            <rect
              x="0"
              y="0"
              width="170"
              height="115"
              rx="12"
              fill="#ffffff"
              fillOpacity="0.94"
              stroke="#eaecf0"
              strokeWidth="1.2"
              filter="url(#softGlow)"
            />

            {/* Circular Gauge Ring */}
            <g transform="translate(52, 58)">
              <circle
                cx="0"
                cy="0"
                r={gaugeR}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="7"
              />
              <circle
                cx="0"
                cy="0"
                r={gaugeR}
                fill="none"
                stroke={currentTheme.color}
                strokeWidth="7"
                strokeDasharray={gaugeC}
                strokeDashoffset={gaugeOffset}
                strokeLinecap="round"
                transform="rotate(-90)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
              <text
                x="0"
                y="1"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="800"
                fill="#101828"
                fontFamily="monospace"
              >
                {cent.toFixed(1)}m
              </text>
              <text
                x="0"
                y="13"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="700"
                fill={currentTheme.color}
              >
                {cat}
              </text>
            </g>

            {/* Label & Details */}
            <text x="100" y="38" fontSize="10" fontWeight="700" fill="#64748b">
              DURATION
            </text>
            <text x="100" y="55" fontSize="14" fontWeight="800" fill="#101828" fontFamily="monospace">
              {cent.toFixed(2)}
            </text>
            <text x="148" y="55" fontSize="10.5" fontWeight="600" fill="#64748b">
              min
            </text>

            <text x="100" y="80" fontSize="10" fontWeight="700" fill="#64748b">
              APERTURE
            </text>
            <text x="100" y="96" fontSize="13" fontWeight="800" fill={currentTheme.color} fontFamily="monospace">
              {currentTheme.valveAperture}%
            </text>
          </g>

          {/* Bottom-Right: Soil Moisture Sensor Probe Card */}
          <g transform="translate(646, 290)">
            <rect
              x="0"
              y="0"
              width="170"
              height="115"
              rx="12"
              fill="#ffffff"
              fillOpacity="0.94"
              stroke="#eaecf0"
              strokeWidth="1.2"
              filter="url(#softGlow)"
            />

            {/* Vertical Capillary Fluid Tube */}
            <g transform="translate(32, 22)">
              <rect x="0" y="0" width="16" height="70" rx="8" fill="#f1f5f9" stroke="#e2e8f0" />
              {/* Dynamic Fill Level */}
              <motion.rect
                x="0"
                y={70 - ((100 - soilDry) / 100) * 70}
                width="16"
                height={((100 - soilDry) / 100) * 70}
                rx="8"
                fill="url(#waterStreamGrad)"
                style={{ transition: 'height 0.4s ease, y 0.4s ease' }}
              />
            </g>

            {/* Probe Readouts */}
            <text x="64" y="38" fontSize="10" fontWeight="700" fill="#64748b">
              SOIL SENSOR
            </text>
            <text x="64" y="58" fontSize="16" fontWeight="800" fill="#101828" fontFamily="monospace">
              {100 - soilDry}%
            </text>
            <text x="64" y="78" fontSize="10" fontWeight="700" fill="#64748b">
              STATUS
            </text>
            <text
              x="64"
              y="95"
              fontSize="12"
              fontWeight="800"
              fill={soilDry < 40 ? '#059669' : soilDry < 75 ? '#4f46e5' : '#b45309'}
            >
              {soilDry < 40 ? 'Saturated' : soilDry < 75 ? 'Optimal' : 'Parched'}
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Summary Caption */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: '10px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '12.5px',
      }}>
        <div style={{ color: '#475467' }}>
          Real-time physical simulation responding to <strong style={{ color: '#101828' }}>Mamdani Defuzzified Centroid</strong>.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#667085' }}>Sprinkler Duty Cycle:</span>
          <strong style={{ color: currentTheme.color, fontFamily: 'monospace' }}>
            {((cent / 30) * 100).toFixed(1)}% of 30 min maximum
          </strong>
        </div>
      </div>
    </div>
  );
}
