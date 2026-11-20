import React from 'react';

// ── Shared style helpers (Light SaaS Mode) ──────────────────────────────────────────

const card = {
  background: '#ffffff',
  border: '1px solid #eaecf0',
  borderRadius: 12,
  padding: '24px 28px',
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
};

const sectionHeading = (color = '#101828') => ({
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
  color,
  letterSpacing: '-0.02em',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const codeBlock = {
  background: '#f8fafc',
  border: '1px solid #eaecf0',
  borderRadius: 8,
  padding: '14px 18px',
  fontFamily: 'monospace',
  fontSize: 13,
  color: '#0f172a',
  margin: '12px 0',
  overflowX: 'auto',
  whiteSpace: 'pre',
  lineHeight: 1.6,
};

const bodyText = {
  color: '#475467',
  lineHeight: 1.7,
  fontSize: 14,
};

const highlight = { color: '#0284c7', fontWeight: 700 };
const em = { color: '#d97706', fontWeight: 600 };

// Rule table data
const RULES_TABLE = [
  ['Low', 'Low', 'Short (0–10 min)', 'Moist soil & low sun; brief maintenance cycle.'],
  ['Low', 'Medium', 'Short (0–10 min)', 'Moist soil & moderate sun; minimal watering needed.'],
  ['Low', 'High', 'Short (0–10 min)', 'Moist soil despite intense sun; quick cooling mist.'],
  ['Medium', 'Low', 'Short (0–10 min)', 'Moderate soil with low evaporation; light replenishment.'],
  ['Medium', 'Medium', 'Medium (10–20 min)', 'Balanced moderate conditions; standard irrigation cycle.'],
  ['Medium', 'High', 'Medium (10–20 min)', 'Moderate soil under bright sun; sustained moisture upkeep.'],
  ['High', 'Low', 'Medium (10–20 min)', 'Dry soil under low sun; controlled absorption cycle.'],
  ['High', 'Medium', 'Long (20–30 min)', 'Dry soil & warm sun; deep root-zone soaking required.'],
  ['High', 'High', 'Long (20–30 min)', 'Severe dryness & high evaporation; maximum duration watering.'],
];

const MF_SAMPLE_TABLE = [
  ['0%', '1.000', '0.000', '0.000', 'Completely saturated soil / zero sunlight'],
  ['25%', '0.750', '0.167', '0.000', 'Predominantly low with slight moderate overlap'],
  ['50%', '0.000', '1.000', '0.000', 'Perfect midpoint of moderate condition'],
  ['75%', '0.000', '0.167', '0.750', 'Predominantly high with slight moderate overlap'],
  ['100%', '0.000', '0.000', '1.000', 'Severely dry soil / peak sunlight intensity'],
];

export default function Learn() {
  return (
    <div
      style={{
        padding: '8px 0 32px',
        color: '#101828',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Page Header ────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.02em', color: '#101828' }}>
            About the Project
          </h1>
          <p style={{ ...bodyText, color: '#667085', fontSize: 14.5 }}>
            FuzzyFlow — Automated Smart Irrigation System using Mamdani Fuzzy Logic (Soft Computing).
          </p>
        </div>

        {/* ── Section 1: Project Overview ─────────────────────────── */}
        <div style={{ ...card, borderLeft: '4px solid #4f46e5' }}>
          <h2 style={sectionHeading('#101828')}>1. Project Overview &amp; Objective</h2>
          <p style={bodyText}>
            <strong>FuzzyFlow</strong> is an academic soft computing application that models an intelligent, automated agricultural irrigation controller. Traditional irrigation systems rely on rigid timers or hard binary cutoffs (e.g., <em>"turn valve ON if moisture &lt; 40%"</em>), which frequently lead to either water wastage or crop dehydration under shifting weather conditions.
          </p>
          <p style={{ ...bodyText, marginTop: 10 }}>
            By implementing a <strong>Mamdani Fuzzy Inference System (FIS)</strong>, FuzzyFlow emulates expert agricultural reasoning. It processes two continuous environmental input signals and dynamically defuzzifies them into a precise, optimal watering duration (in minutes).
          </p>

          {/* Key Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#667085' }}>INPUT VARIABLE 1</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#059669', marginTop: 2 }}>Soil Dryness</div>
              <div style={{ fontSize: 12, color: '#475467', marginTop: 2 }}>Range: 0% to 100% (Low, Medium, High)</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#667085' }}>INPUT VARIABLE 2</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0284c7', marginTop: 2 }}>Sunlight Intensity</div>
              <div style={{ fontSize: 12, color: '#475467', marginTop: 2 }}>Range: 0% to 100% (Low, Medium, High)</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#667085' }}>OUTPUT VARIABLE</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#4f46e5', marginTop: 2 }}>Watering Duration</div>
              <div style={{ fontSize: 12, color: '#475467', marginTop: 2 }}>Range: 0 to 30 min (Short, Medium, Long)</div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Why Fuzzy Logic? ─────────────────────────── */}
        <div style={{ ...card, borderLeft: '4px solid #059669' }}>
          <h2 style={sectionHeading('#101828')}>2. Why Fuzzy Logic?</h2>
          <p style={bodyText}>
            Classical (Boolean) logic is binary: a condition is either strictly <span style={highlight}>true (1)</span> or <span style={highlight}>false (0)</span>. In nature, environmental variables exist on a continuous spectrum without abrupt mathematical cliffs.
          </p>
          <p style={{ ...bodyText, marginTop: 10 }}>
            Pioneered by <strong>Lotfi A. Zadeh in 1965</strong>, fuzzy logic models <span style={em}>partial truth</span> through membership degrees μ ∈ [0, 1]. Soil dryness at 45% is simultaneously <strong style={{ color: '#0284c7' }}>20% Low</strong> and <strong style={{ color: '#f59e0b' }}>83% Medium</strong>, allowing the controller to produce smooth, non-oscillating watering decisions.
          </p>
          <div style={codeBlock}>
{`Boolean Logic:  valve_state = (soil_dryness > 50) ? ON : OFF     // Sharp, brittle boundary
Fuzzy Logic:    μ_Low(45)    = 0.20                              // 20% membership in Low set
                μ_Medium(45) = 0.83                              // 83% membership in Medium set
                Both active simultaneously for smooth continuous control.`}
          </div>
        </div>

        {/* ── Section 3: The 4-Stage Mamdani Architecture ─────────── */}
        <div style={{ ...card, borderLeft: '4px solid #0284c7' }}>
          <h2 style={sectionHeading('#101828')}>3. The 4-Stage Mamdani Architecture</h2>
          <p style={bodyText}>
            Introduced by <strong>Ebrahim Mamdani in 1975</strong>, the Mamdani Fuzzy Inference System processes inputs through four well-defined mathematical stages:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, margin: '16px 0' }}>
            {[
              { step: '1', title: 'Fuzzification', desc: 'Crisp Inputs → Membership Degrees', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
              { step: '2', title: 'Rule Evaluation', desc: 'MIN Implication: min(μ_soil, μ_sun)', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' },
              { step: '3', title: 'Aggregation', desc: 'MAX Union: Combined Output Region', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
              { step: '4', title: 'Defuzzification', desc: 'Centroid Integration → Crisp Minutes', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  background: s.bg,
                  border: `1.5px solid ${s.border}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: s.color, fontWeight: 800, fontSize: 11.5 }}>Stage {s.step}</div>
                <div style={{ color: '#101828', fontWeight: 800, fontSize: 13.5, marginTop: 2 }}>{s.title}</div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <ul style={{ ...bodyText, paddingLeft: 20, marginTop: 10 }}>
            <li style={{ marginBottom: 6 }}><strong>Fuzzification:</strong> Numeric sensor values are projected onto triangular and trapezoidal membership curves.</li>
            <li style={{ marginBottom: 6 }}><strong>Rule Evaluation:</strong> The 9 IF-THEN rules evaluate conjunctive antecedents using Gödel's t-norm: α_i = min(μ_soil, μ_sun).</li>
            <li style={{ marginBottom: 6 }}><strong>Aggregation:</strong> All clipped output consequent sets are aggregated using the standard s-conorm: μ_agg(z) = max_i(μ_C'_i(z)).</li>
            <li><strong>Defuzzification:</strong> Calculates the center of gravity (Centroid) to yield a single real-world watering duration in minutes.</li>
          </ul>
        </div>

        {/* ── Section 4: Membership Functions ─────────────────────── */}
        <div style={{ ...card, borderLeft: '4px solid #f59e0b' }}>
          <h2 style={sectionHeading('#101828')}>4. Membership Function Formulas</h2>
          <p style={bodyText}>
            Every linguistic set is defined by mathematical trapezoidal and triangular piecewise functions spanning the normalized universe of discourse [0, 100%]:
          </p>

          <div style={codeBlock}>
{`Input Membership Functions (Domain 0–100%):
  μ_Low(x)    = Trapezoid [0, 0, 20, 40]      // Left shoulder plateau at 0–20%
  μ_Medium(x) = Triangle  [20, 50, 80]        // Symmetric peak at 50%
  μ_High(x)   = Trapezoid [60, 80, 100, 100]  // Right shoulder plateau at 80–100%

Output Membership Functions (Watering Duration 0–30 min):
  μ_Short(z)  = Trapezoid [0, 0, 5, 12]       // Left shoulder plateau at 0–5 min
  μ_Medium(z) = Triangle  [8, 15, 22]         // Symmetric peak at 15 min
  μ_Long(z)   = Trapezoid [18, 25, 30, 30]    // Right shoulder plateau at 25–30 min`}
          </div>

          <p style={{ ...bodyText, marginTop: 12, fontWeight: 700, color: '#101828' }}>
            Sample Membership Degrees across Soil Dryness / Sunlight:
          </p>
          <div style={{ overflowX: 'auto', border: '1px solid #eaecf0', borderRadius: 8, marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                  {['Input (x)', 'μ_Low(x)', 'μ_Medium(x)', 'μ_High(x)', 'Linguistic Interpretation'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', color: '#475467', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MF_SAMPLE_TABLE.map(([x, low, med, high, desc], i) => (
                  <tr key={x} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 800, fontFamily: 'monospace' }}>{x}</td>
                    <td style={{ padding: '8px 12px', color: '#0284c7', fontFamily: 'monospace', fontWeight: 700 }}>{low}</td>
                    <td style={{ padding: '8px 12px', color: '#d97706', fontFamily: 'monospace', fontWeight: 700 }}>{med}</td>
                    <td style={{ padding: '8px 12px', color: '#dc2626', fontFamily: 'monospace', fontWeight: 700 }}>{high}</td>
                    <td style={{ padding: '8px 12px', color: '#667085' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 5: The 3x3 Knowledge Base ────────────────────── */}
        <div style={{ ...card, borderLeft: '4px solid #8b5cf6' }}>
          <h2 style={sectionHeading('#101828')}>5. The 3×3 Fuzzy Knowledge Base</h2>
          <p style={bodyText}>
            The system contains 9 complete rules covering all pairwise combinations of input conditions ($3 \times 3 = 9$). Each rule reflects agricultural best practices:
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid #eaecf0', borderRadius: 8, marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                  {['Rule', 'IF Soil Dryness', 'AND Sunlight', 'THEN Watering Duration', 'Agricultural Rationale'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', color: '#475467', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RULES_TABLE.map(([soil, sun, output, note], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#667085' }}>R{i + 1}</td>
                    <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>{soil}</td>
                    <td style={{ padding: '8px 12px', color: '#0284c7', fontWeight: 700 }}>{sun}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        color: output.startsWith('Short') ? '#0284c7' : output.startsWith('Medium') ? '#d97706' : '#dc2626',
                        fontWeight: 800,
                      }}>
                        {output}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#667085' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 6: Centroid Defuzzification Formula ─────────── */}
        <div style={{ ...card, borderLeft: '4px solid #ef4444' }}>
          <h2 style={sectionHeading('#101828')}>6. Centroid Defuzzification Mathematics</h2>
          <p style={bodyText}>
            The final step converts the aggregated fuzzy set μ_agg(z) into a single crisp control output z* ∈ [0, 30] minutes using the continuous <strong>Centroid (Center of Gravity)</strong> formula:
          </p>

          <div style={codeBlock}>
{`Center of Gravity (Centroid) Formula:
             ∫₀³⁰ [ z · μ_agg(z) ] dz
   z* = ──────────────────────────────────
             ∫₀³⁰ [ μ_agg(z) ] dz

Where:
   • z is the watering duration in minutes (domain: 0 to 30 min).
   • μ_agg(z) is the aggregated membership degree at point z.
   • Numerator computes the first moment of the aggregated area.
   • Denominator computes the total area under the aggregated curve.`}
          </div>

          <p style={{ ...bodyText, marginTop: 10 }}>
            In software, the continuous integral is evaluated using high-precision numerical Riemann/trapezoidal integration over sampled points ($N = 300$, step $h = 0.1$ min). This ensures continuous, monotonic output across the entire operational space with zero discontinuity.
          </p>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', color: '#98a2b3', fontSize: 12.5, marginTop: 16 }}>
          FuzzyFlow Smart Irrigation System • Soft Computing / Mamdani Fuzzy Inference System
        </div>
      </div>
    </div>
  );
}
