import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { InputControlsCard, MembershipFunctionsCard } from '../components/InputMembershipPanel.jsx';
import { DefuzzificationGraphCard } from '../components/LiveSimulationView.jsx';
import RuleGrid from '../components/RuleGrid.jsx';
import StepVisualizer from '../components/StepVisualizer.jsx';
import IrrigationAnimation from '../components/IrrigationAnimation.jsx';
import Learn from './Learn.jsx';
import { computeFuzzySystem } from '../logic/mamdaniEngine.js';

const PAGE_TITLES = {
  simulation: 'Dashboard',
  rules:      'Rule Engine',
  overview:   'Step Pipeline',
  irrigation: 'Irrigation Scene',
  learn:      'Algorithm Guide',
};

function MetricKpiCards({ soilDryness, sunlightIntensity, activeRulesCount, centroid, wateringCategory }) {
  const soilState = soilDryness < 30 ? 'Wet' : soilDryness < 70 ? 'Moderate' : 'Dry';
  const sunState  = sunlightIntensity < 35 ? 'Low' : sunlightIntensity < 70 ? 'Moderate' : 'High';

  const cards = [
    {
      title: 'Soil Dryness',
      value: `${soilDryness}%`,
      badge: soilState,
      badgeBg: '#ecfdf5',
      badgeColor: '#059669',
    },
    {
      title: 'Sunlight Intensity',
      value: `${sunlightIntensity}%`,
      badge: sunState,
      badgeBg: '#eff2fe',
      badgeColor: '#4f46e5',
    },
    {
      title: 'Active Rules',
      value: `${activeRulesCount} / 9`,
      badge: `${activeRulesCount} Firing`,
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
    },
    {
      title: 'Watering Duration',
      value: `${centroid.toFixed(2)} min`,
      badge: wateringCategory,
      badgeBg: wateringCategory === 'Short' ? '#e0f2fe' : wateringCategory === 'Medium' ? '#eff2fe' : '#fee2e2',
      badgeColor: wateringCategory === 'Short' ? '#0284c7' : wateringCategory === 'Medium' ? '#4f46e5' : '#dc2626',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '18px',
      }}
      className="metric-kpi-grid"
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.02)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475467', marginBottom: '4px' }}>
            {c.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#101828', letterSpacing: '-0.02em' }}>
              {c.value}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '5px',
              background: c.badgeBg,
              color: c.badgeColor,
            }}>
              {c.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickInputBar({ soilDryness, sunlightIntensity, onSoilChange, onSunlightChange }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: '10px',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '300px' }}>
        {/* Soil Dryness Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#344054', whiteSpace: 'nowrap' }}>
            Soil Dryness:
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={soilDryness}
            onChange={(e) => onSoilChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#101828', fontFamily: 'monospace', width: '40px', textAlign: 'right' }}>
            {soilDryness}%
          </span>
        </div>

        {/* Sunlight Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#344054', whiteSpace: 'nowrap' }}>
            Sunlight:
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={sunlightIntensity}
            onChange={(e) => onSunlightChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#101828', fontFamily: 'monospace', width: '40px', textAlign: 'right' }}>
            {sunlightIntensity}%
          </span>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { label: 'Wet (15%)', soil: 15, sun: 20 },
          { label: 'Moderate (50%)', soil: 50, sun: 50 },
          { label: 'Dry (85%)', soil: 85, sun: 85 },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => {
              onSoilChange(p.soil);
              onSunlightChange(p.sun);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #eaecf0',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#475467',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#eff2fe';
              e.currentTarget.style.color = '#4f46e5';
              e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#475467';
              e.currentTarget.style.borderColor = '#eaecf0';
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [soilDryness, setSoilDryness] = useState(50);
  const [sunlightIntensity, setSunlightIntensity] = useState(50);
  const [activePage, setActivePage] = useState('simulation');
  const [autoSweep, setAutoSweep] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const sweepAngleRef = useRef(0);

  // Auto-sweep oscillation animation
  useEffect(() => {
    if (!autoSweep) return;

    let animId;
    const step = () => {
      sweepAngleRef.current += 0.02;
      const angle = sweepAngleRef.current;
      const newSoil = Math.round(50 + 38 * Math.sin(angle));
      const newSun  = Math.round(50 + 38 * Math.cos(angle * 0.75));
      setSoilDryness(Math.max(0, Math.min(100, newSoil)));
      setSunlightIntensity(Math.max(0, Math.min(100, newSun)));
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [autoSweep]);

  // Single Source of Truth for fuzzy calculations
  const fuzzyResult = useMemo(
    () => computeFuzzySystem(soilDryness, sunlightIntensity),
    [soilDryness, sunlightIntensity]
  );

  const {
    centroid,
    wateringCategory,
    activeRulesCount,
    soilMemberships,
    sunMemberships,
    ruleStrengths,
    outputPoints,
    clippedCurves,
  } = fuzzyResult;

  const currentTitle = PAGE_TITLES[activePage] || PAGE_TITLES.simulation;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fb' }}>
      {/* Sidebar Navigation with 3-bars close and open toggle */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {/* Left: 3-bars toggle button & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Desktop open button (shown when sidebar is closed on desktop) */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar"
                aria-label="Open sidebar"
                style={{
                  background: '#ffffff',
                  border: '1px solid #eaecf0',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#344054',
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.03)',
                  transition: 'all 0.15s ease',
                }}
                className="hidden lg:flex"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#d0d5dd';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#eaecf0';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}

            {/* Mobile toggle button (always available on mobile/tablet) */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
              style={{
                background: '#ffffff',
                border: '1px solid #eaecf0',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#344054',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.03)',
                transition: 'all 0.15s ease',
              }}
              className="flex lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <h1 style={{
              fontSize: '19px',
              fontWeight: 800,
              color: '#101828',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              {currentTitle}
            </h1>
          </div>

          {/* Action Items - Only shown for simulation pages, hidden on Algorithm Guide */}
          {activePage !== 'learn' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  setSoilDryness(50);
                  setSunlightIntensity(50);
                  setAutoSweep(false);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #eaecf0',
                  color: '#475467',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#101828';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#475467';
                }}
              >
                Reset
              </button>

              <button
                onClick={() => setAutoSweep((prev) => !prev)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  background: autoSweep ? '#4f46e5' : '#eff2fe',
                  border: `1px solid ${autoSweep ? '#4338ca' : '#dbeafe'}`,
                  color: autoSweep ? '#ffffff' : '#4f46e5',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {autoSweep ? 'Stop Sweep' : 'Auto Sweep'}
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {/* Top KPI Metrics on simulation pages, hidden on Algorithm Guide */}
          {activePage !== 'learn' && (
            <MetricKpiCards
              soilDryness={soilDryness}
              sunlightIntensity={sunlightIntensity}
              activeRulesCount={activeRulesCount}
              centroid={centroid}
              wateringCategory={wateringCategory}
            />
          )}

          {/* Conditional Layout:
              1. Dashboard: Balanced 2-column top row (InputControls left, Defuzzification right) + Full-width MembershipFunctions bottom
              2. Other pages: Full width clean layout with QuickInputBar on top */}
          {activePage === 'simulation' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {/* Row 1: Input Controls (Left) & Defuzzification (Right) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '16px',
                  alignItems: 'stretch',
                }}
                className="dashboard-two-col"
              >
                <InputControlsCard
                  soilDryness={soilDryness}
                  sunlightIntensity={sunlightIntensity}
                  onSoilChange={setSoilDryness}
                  onSunlightChange={setSunlightIntensity}
                  centroid={centroid}
                  wateringCategory={wateringCategory}
                  soilMemberships={soilMemberships}
                  sunMemberships={sunMemberships}
                />

                <DefuzzificationGraphCard
                  outputPoints={outputPoints}
                  clippedCurves={clippedCurves}
                  centroid={centroid}
                  wateringCategory={wateringCategory}
                  activeRulesCount={activeRulesCount}
                />
              </div>

              {/* Row 2: Full-Width Membership Functions (Soil Dryness & Sunlight Intensity side-by-side) */}
              <MembershipFunctionsCard
                soilDryness={soilDryness}
                sunlightIntensity={sunlightIntensity}
                soilMemberships={soilMemberships}
                sunMemberships={sunMemberships}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {/* QuickInputBar only for simulation-related pages (rules, overview, irrigation), hidden on Algorithm Guide */}
              {activePage !== 'learn' && (
                <QuickInputBar
                  soilDryness={soilDryness}
                  sunlightIntensity={sunlightIntensity}
                  onSoilChange={setSoilDryness}
                  onSunlightChange={setSunlightIntensity}
                />
              )}

              {/* 2. RULE ENGINE FEATURE */}
              {activePage === 'rules' && (
                <RuleGrid
                  ruleStrengths={ruleStrengths}
                  soilMemberships={soilMemberships}
                  sunMemberships={sunMemberships}
                  soilDryness={soilDryness}
                  sunlightIntensity={sunlightIntensity}
                />
              )}

              {/* 3. STEP PIPELINE FEATURE */}
              {activePage === 'overview' && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaecf0',
                  borderRadius: '12px',
                  padding: '22px',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
                }}>
                  <StepVisualizer
                    soilDryness={soilDryness}
                    sunlightIntensity={sunlightIntensity}
                    soilMemberships={soilMemberships}
                    sunMemberships={sunMemberships}
                    ruleStrengths={ruleStrengths}
                    outputPoints={outputPoints}
                    clippedCurves={clippedCurves}
                    centroid={centroid}
                    wateringCategory={wateringCategory}
                    activeRulesCount={activeRulesCount}
                  />
                </div>
              )}

              {/* 4. IRRIGATION SCENE FEATURE */}
              {activePage === 'irrigation' && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #eaecf0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <div style={{ width: '100%', fontSize: '16px', fontWeight: 800, color: '#101828', marginBottom: '16px' }}>
                    Irrigation Scene
                  </div>
                  <IrrigationAnimation
                    wateringCategory={wateringCategory}
                    centroid={centroid}
                    soilDryness={soilDryness}
                    sunlightIntensity={sunlightIntensity}
                  />
                </div>
              )}

              {/* 5. ALGORITHM GUIDE FEATURE */}
              {activePage === 'learn' && (
                <Learn />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
