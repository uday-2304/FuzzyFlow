import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RULES } from '../logic/fuzzyRules.js';
import { getDefuzzificationDetails } from '../logic/defuzzification.js';

const STEPS = [
  { id: 0, num: '1', name: 'Crisp Inputs',           short: 'Inputs' },
  { id: 1, num: '2', name: 'Fuzzification',           short: 'Fuzzify' },
  { id: 2, num: '3', name: 'Rule Evaluation',         short: 'Rules' },
  { id: 3, num: '4', name: 'MIN Implication',         short: 'Clip' },
  { id: 4, num: '5', name: 'MAX Aggregation',         short: 'Aggregate' },
  { id: 5, num: '6', name: 'Centroid Defuzzification',short: 'Defuzzify' },
  { id: 6, num: '7', name: 'Crisp Output',            short: 'Output' },
];

const OUTPUT_COLORS = { Short: '#0284c7', Medium: '#d97706', Long: '#dc2626' };
const CATEGORY_LABELS = {
  Short:  { color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', label: 'Short (0-10 min)',  plant: 'Moist soil. Brief cycle to maintain root zone moisture.' },
  Medium: { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Medium (10-20 min)', plant: 'Moderate soil dryness. Balanced watering cycle.' },
  Long:   { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Long (20-30 min)',   plant: 'High dryness & intense sunlight. Deep cycle required.' },
};

function MiniBar({ label, value, color = '#4f46e5' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <div style={{ width: '50px', fontSize: '11.5px', fontWeight: 600, color: '#475467', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: '#eaecf0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', background: color, borderRadius: '4px' }}
        />
      </div>
      <div style={{ width: '42px', fontSize: '11.5px', color, fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>
        {value.toFixed(2)}
      </div>
    </div>
  );
}

function StepCard({ children }) {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #eaecf0',
      borderRadius: '8px',
      padding: '14px 16px',
    }}>
      {children}
    </div>
  );
}

function StepLabel({ text }) {
  return (
    <p style={{ fontSize: '13px', color: '#475467', lineHeight: 1.5, margin: '0 0 12px' }}>
      {text}
    </p>
  );
}

function Step0({ soilDryness, sunlightIntensity }) {
  return (
    <StepCard>
      <StepLabel text="Raw numeric sensor inputs collected from field probes." />
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, background: '#ffffff', border: '1px solid #eaecf0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11.5px', color: '#667085', fontWeight: 600, marginBottom: '2px' }}>Soil Dryness</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>{soilDryness}%</div>
        </div>
        <div style={{ flex: 1, background: '#ffffff', border: '1px solid #eaecf0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11.5px', color: '#667085', fontWeight: 600, marginBottom: '2px' }}>Sunlight Intensity</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>{sunlightIntensity}%</div>
        </div>
      </div>
    </StepCard>
  );
}

function Step1({ soilMemberships, sunMemberships }) {
  return (
    <StepCard>
      <StepLabel text="Fuzzification evaluates crisp inputs into membership degrees μ ∈ [0, 1]." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>Soil Dryness</div>
          <MiniBar label="Low" value={soilMemberships.Low ?? 0} color="#0284c7" />
          <MiniBar label="Medium" value={soilMemberships.Medium ?? 0} color="#f59e0b" />
          <MiniBar label="High"   value={soilMemberships.High   ?? 0} color="#ef4444" />
        </div>
        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', marginBottom: '8px' }}>Sunlight</div>
          <MiniBar label="Low" value={sunMemberships.Low ?? 0} color="#0284c7" />
          <MiniBar label="Medium" value={sunMemberships.Medium ?? 0} color="#f59e0b" />
          <MiniBar label="High"   value={sunMemberships.High   ?? 0} color="#ef4444" />
        </div>
      </div>
    </StepCard>
  );
}

function Step2({ ruleStrengths }) {
  return (
    <StepCard>
      <StepLabel text="Rule Evaluation uses min-AND: Firing Strength = min(μ_soil, μ_sun)." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
        {RULES.map((rule, i) => {
          const strength = ruleStrengths[i] ?? 0;
          const isActive = strength > 0.005;
          const color = OUTPUT_COLORS[rule.output];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', borderRadius: '6px',
              background: isActive ? '#eff2fe' : '#ffffff',
              border: isActive ? '1px solid #c7d2fe' : '1px solid #eaecf0',
              opacity: isActive ? 1 : 0.6,
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#667085', width: '24px' }}>R{i + 1}</span>
              <span style={{ fontSize: '12px', color: '#344054', flex: 1 }}>
                Soil={rule.soil} ∧ Sun={rule.sun} → <strong style={{ color }}>{rule.output}</strong>
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: isActive ? '#4f46e5' : '#98a2b3', fontFamily: 'monospace' }}>
                {strength.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </StepCard>
  );
}

function Step3({ ruleStrengths, clippedCurves }) {
  return (
    <StepCard>
      <StepLabel text="MIN Implication clips each consequent set at its rule firing strength." />
      {['Short', 'Medium', 'Long'].map((label) => {
        const curve = clippedCurves?.find((c) => c.label === label);
        const strength = curve?.strength ?? 0;
        const color = OUTPUT_COLORS[label];
        return (
          <div key={label} style={{ marginBottom: '8px', background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #eaecf0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color }}>{label}</span>
              <span style={{ fontSize: '11.5px', color: '#667085', fontFamily: 'monospace' }}>
                Clip: <strong style={{ color }}>{strength.toFixed(2)}</strong>
              </span>
            </div>
            <div style={{ background: '#eaecf0', borderRadius: '3px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${strength * 100}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </StepCard>
  );
}

function Step4({ clippedCurves }) {
  return (
    <StepCard>
      <StepLabel text="MAX Aggregation combines clipped curves: μ_agg(x) = max(μ_Short, μ_Medium, μ_Long)." />
      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #eaecf0' }}>
        {['Short', 'Medium', 'Long'].map((label) => {
          const curve = clippedCurves?.find((c) => c.label === label);
          const strength = curve?.strength ?? 0;
          const color = OUTPUT_COLORS[label];
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '60px', fontSize: '11.5px', fontWeight: 700, color }}>{label}</span>
              <div style={{ flex: 1, background: '#eaecf0', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${strength * 100}%`, height: '100%', background: color }} />
              </div>
              <span style={{ width: '38px', fontSize: '11.5px', color, fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>
                {strength.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </StepCard>
  );
}

function Step5({ outputPoints, centroid }) {
  const { numerator: num, denominator: den } = getDefuzzificationDetails(outputPoints);

  return (
    <StepCard>
      <StepLabel text="Centroid Defuzzification calculates center of gravity of the aggregated polygon." />
      <div style={{
        fontFamily: 'monospace',
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: '6px',
        padding: '12px 14px',
        fontSize: '12.5px',
        color: '#344054',
        lineHeight: 1.8,
      }}>
        <div style={{ color: '#4f46e5', fontWeight: 800 }}>
          Centroid = ∫ [x · μ_agg(x) dx] / ∫ [μ_agg(x) dx]
        </div>
        <div style={{ color: '#667085', fontSize: '11.5px' }}>Numerator (Moment) ≈ {num.toFixed(2)}</div>
        <div style={{ color: '#667085', fontSize: '11.5px' }}>Denominator (Area)  ≈ {den.toFixed(2)}</div>
        <div style={{ color: '#10b981', fontWeight: 800, fontSize: '14px', borderTop: '1px solid #eaecf0', paddingTop: '4px', marginTop: '4px' }}>
          Duration = {den > 0 ? (num / den).toFixed(2) : '0.00'} minutes
        </div>
      </div>
    </StepCard>
  );
}

function Step6({ centroid, wateringCategory }) {
  const meta = CATEGORY_LABELS[wateringCategory] ?? CATEGORY_LABELS.Short;
  return (
    <StepCard>
      <StepLabel text="Final crisp output ready for the irrigation valve." />
      <div style={{
        textAlign: 'center',
        background: meta.bg,
        border: `1.5px solid ${meta.border}`,
        borderRadius: '8px',
        padding: '18px 16px',
      }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: meta.color, marginBottom: '4px', fontFamily: 'monospace' }}>
          {(centroid ?? 0).toFixed(2)} min
        </div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: meta.color, marginBottom: '4px' }}>
          {wateringCategory} Duration ({meta.label})
        </div>
        <div style={{ fontSize: '12px', color: '#475467', maxWidth: '340px', margin: '0 auto' }}>
          {meta.plant}
        </div>
      </div>
    </StepCard>
  );
}

export default function StepVisualizer({
  soilDryness = 50,
  sunlightIntensity = 50,
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships = { Low: 0, Medium: 0, High: 0 },
  ruleStrengths = Array(9).fill(0),
  outputPoints = [],
  clippedCurves = [],
  centroid = 0,
  wateringCategory = 'Short',
  activeRulesCount = 0,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = STEPS.length;

  const goNext = useCallback(() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const goPrev = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), []);
  const reset = useCallback(() => { setCurrentStep(0); setIsPlaying(false); }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps - 1) { setIsPlaying(false); return; }
    const timer = setTimeout(goNext, 2500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, goNext, totalSteps]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <Step0 soilDryness={soilDryness} sunlightIntensity={sunlightIntensity} />;
      case 1: return <Step1 soilMemberships={soilMemberships} sunMemberships={sunMemberships} />;
      case 2: return <Step2 ruleStrengths={ruleStrengths} />;
      case 3: return <Step3 ruleStrengths={ruleStrengths} clippedCurves={clippedCurves} />;
      case 4: return <Step4 clippedCurves={clippedCurves} />;
      case 5: return <Step5 outputPoints={outputPoints} centroid={centroid} />;
      case 6: return <Step6 centroid={centroid} wateringCategory={wateringCategory} />;
      default: return null;
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: '12px',
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#101828' }}>
          Step Pipeline
        </h2>
        <span style={{ fontSize: '12px', color: '#667085', fontWeight: 600 }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Step Numbers Bar (No emojis) */}
      <div style={{ overflowX: 'auto', marginBottom: '14px', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 'max-content' }}>
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;
            const borderColor = isActive ? '#4f46e5' : isCompleted ? '#c7d2fe' : '#eaecf0';
            const bg          = isActive ? '#eff2fe' : isCompleted ? '#f8fafc' : '#ffffff';

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => setCurrentStep(i)}
                  style={{
                    cursor: 'pointer',
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    background: bg,
                    textAlign: 'center',
                    minWidth: '65px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isActive ? '#4f46e5' : '#475467',
                  }}>
                    Step {step.num}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: isActive ? '#4f46e5' : '#667085',
                    fontWeight: isActive ? 700 : 500,
                  }}>
                    {step.short}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ fontSize: '11px', color: i < currentStep ? '#4f46e5' : '#cbd5e1' }}>›</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Heading */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 700 }}>
          Step {currentStep + 1}: {STEPS[currentStep].name}
        </span>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Controls (No emojis) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={reset}
          style={btnStyle('#f8fafc', '#475467')}
        >Reset</button>
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={btnStyle('#f8fafc', currentStep === 0 ? '#98a2b3' : '#101828', currentStep === 0)}
        >Prev</button>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          style={{
            ...btnStyle(isPlaying ? '#fef3c7' : '#eff2fe', isPlaying ? '#b45309' : '#4f46e5'),
            fontWeight: 700,
          }}
        >{isPlaying ? 'Pause' : 'Play'}</button>
        <button
          onClick={goNext}
          disabled={currentStep === totalSteps - 1}
          style={btnStyle('#f8fafc', currentStep === totalSteps - 1 ? '#98a2b3' : '#101828', currentStep === totalSteps - 1)}
        >Next</button>
      </div>
    </div>
  );
}

function btnStyle(bg, color, disabled = false) {
  return {
    background: bg,
    color,
    border: '1px solid #eaecf0',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontWeight: 600,
    transition: 'all 0.15s ease',
  };
}
