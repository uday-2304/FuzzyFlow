import React from 'react';
import { RULES } from '../logic/fuzzyRules.js';

const OUTPUT_THEMES = {
  Short: {
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  Medium: {
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  Long: {
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fecaca',
  },
};

export default function RuleGrid({
  ruleStrengths = Array(9).fill(0),
  soilMemberships = { Low: 0, Medium: 0, High: 0 },
  sunMemberships  = { Low: 0, Medium: 0, High: 0 },
  soilDryness     = 0,
  sunlightIntensity = 0,
}) {
  const activeCount  = ruleStrengths.filter((s) => s > 0.005).length;
  const maxStrength  = Math.max(...ruleStrengths);
  const strongestIdx = ruleStrengths.indexOf(maxStrength);

  const soilLabels = ['Low', 'Medium', 'High'];
  const sunLabels  = ['Low', 'Medium', 'High'];

  function getRuleIndex(soil, sun) {
    return soilLabels.indexOf(soil) * 3 + sunLabels.indexOf(sun);
  }

  const activeRuleIdx = strongestIdx >= 0 && maxStrength > 0.005 ? strongestIdx : 0;
  const activeRule = RULES[activeRuleIdx];
  const activeRuleStrength = ruleStrengths[activeRuleIdx] ?? 0;
  const activeSoilDeg = soilMemberships[activeRule.soil] ?? 0;
  const activeSunDeg  = sunMemberships[activeRule.sun] ?? 0;
  const activeTheme   = OUTPUT_THEMES[activeRule.output];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: '12px',
      padding: '22px 24px',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
      userSelect: 'none',
    }}>
      {/* Title & Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#101828', letterSpacing: '-0.02em' }}>
            Rule Engine
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#667085' }}>
            3 × 3 Mamdani Knowledge Base Matrix
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
          <span style={{
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: 700,
          }}>
            Active: {activeCount} / 9
          </span>
          {maxStrength > 0.005 && (
            <span style={{
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: 700,
            }}>
              Dominant: Rule {strongestIdx + 1} ({maxStrength.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* 3x3 Table Grid */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px repeat(3, 1fr)',
          gap: '10px',
          minWidth: '540px',
        }}>
          {/* Top-left corner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            border: '1px solid #eaecf0',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#667085',
          }}>
            <span>Soil \ Sun</span>
          </div>

          {/* Sun Column Headers */}
          {sunLabels.map((sun) => (
            <div
              key={sun}
              style={{
                background: '#f8fafc',
                border: '1px solid #eaecf0',
                borderRadius: '8px',
                padding: '10px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#101828', fontWeight: 700, fontSize: '13px' }}>
                Sun: {sun}
              </div>
              <div style={{ color: '#0284c7', fontSize: '11.5px', marginTop: '3px', fontFamily: 'monospace', fontWeight: 700 }}>
                μ = {(sunMemberships[sun] ?? 0).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Table Rows (Soil Low, Medium, High) */}
          {soilLabels.map((soil) => (
            <React.Fragment key={soil}>
              {/* Row Header */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #eaecf0',
                borderRadius: '8px',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <div style={{ color: '#101828', fontWeight: 700, fontSize: '13px' }}>
                  Soil: {soil}
                </div>
                <div style={{ color: '#059669', fontSize: '11.5px', marginTop: '3px', fontFamily: 'monospace', fontWeight: 700 }}>
                  μ = {(soilMemberships[soil] ?? 0).toFixed(2)}
                </div>
              </div>

              {/* 3 Rule Cells */}
              {sunLabels.map((sun) => {
                const idx         = getRuleIndex(soil, sun);
                const rule        = RULES[idx];
                const strength    = ruleStrengths[idx] ?? 0;
                const isActive    = strength > 0.005;
                const isStrongest = idx === strongestIdx && maxStrength > 0.005;
                const theme       = OUTPUT_THEMES[rule.output];

                let bg = '#ffffff';
                let border = '1px solid #eaecf0';
                let shadow = 'none';

                if (isActive) {
                  if (isStrongest) {
                    bg = '#fffbeb';
                    border = '2px solid #f59e0b';
                    shadow = '0 2px 8px rgba(245, 158, 11, 0.14)';
                  } else {
                    bg = '#eff2fe';
                    border = '1.5px solid #6366f1';
                    shadow = '0 2px 6px rgba(99, 102, 241, 0.08)';
                  }
                }

                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '8px',
                      padding: '12px 14px',
                      border: border,
                      background: bg,
                      boxShadow: shadow,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '88px',
                      userSelect: 'none',
                    }}
                  >
                    {/* Top: Rule Index & Output Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', color: '#667085', fontWeight: 700 }}>
                        Rule {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: theme.color,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        padding: '2px 8px',
                        borderRadius: '5px',
                      }}>
                        {rule.output}
                      </span>
                    </div>

                    {/* Middle: Strength Value */}
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? (isStrongest ? '#92400e' : '#4f46e5') : '#98a2b3',
                      textAlign: 'center',
                      padding: '4px 0',
                    }}>
                      {strength.toFixed(2)}
                    </div>

                    {/* Bottom: Progress Bar */}
                    <div style={{
                      height: '4px',
                      background: '#eaecf0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${strength * 100}%`,
                        background: isStrongest ? '#f59e0b' : theme.color,
                        borderRadius: '2px',
                        transition: 'width 0.2s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dominant Rule Calculation Box */}
      <div style={{
        marginTop: '16px',
        background: '#f8fafc',
        border: '1px solid #eaecf0',
        borderLeft: `4px solid ${activeTheme.color}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        userSelect: 'none',
      }}>
        <div style={{ fontSize: '13px', color: '#344054', fontWeight: 600 }}>
          <strong style={{ color: '#101828' }}>Rule {activeRuleIdx + 1}:</strong>{' '}
          Soil is {activeRule.soil} ({activeSoilDeg.toFixed(2)}) AND Sunlight is {activeRule.sun} ({activeSunDeg.toFixed(2)}) → Watering: <strong style={{ color: activeTheme.color }}>{activeRule.output}</strong>
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: 800,
          color: activeRuleStrength > 0.005 ? '#4f46e5' : '#667085',
          fontFamily: 'monospace',
          background: '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #eaecf0',
        }}>
          min({activeSoilDeg.toFixed(2)}, {activeSunDeg.toFixed(2)}) = {activeRuleStrength.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
