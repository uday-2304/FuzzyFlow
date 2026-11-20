import React from 'react';

const NAV_ITEMS = [
  { id: 'simulation', label: 'Dashboard' },
  { id: 'rules',      label: 'Rule Engine' },
  { id: 'overview',   label: 'Step Pipeline' },
  { id: 'irrigation', label: 'Irrigation Scene' },
  { id: 'learn',      label: 'Algorithm Guide' },
];

export default function Sidebar({ activePage, onNavigate, isOpen = true, onToggle }) {
  const NavContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* Brand Header with Logo and 3-bars close button */}
      <div style={{
        padding: '20px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #eaecf0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.png"
            alt="FuzzyFlow Logo"
            style={{
              width: '30px',
              height: '30px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#101828',
            letterSpacing: '-0.02em',
          }}>
            Fuzzy<span style={{ color: '#4f46e5' }}>Flow</span>
          </div>
        </div>

        {/* Three Bars button to close sidebar */}
        <button
          onClick={() => onToggle && onToggle(false)}
          title="Close sidebar"
          aria-label="Close sidebar"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475467',
            transition: 'background 0.15s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f2f4f7'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation List - Clean, no search bar, no NAVIGATION text */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => {
                onNavigate && onNavigate(id);
                if (window.innerWidth < 1024 && onToggle) onToggle(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: isActive ? '#eff2fe' : 'transparent',
                color: isActive ? '#4f46e5' : '#344054',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13.5px',
                textAlign: 'left',
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#101828';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#344054';
                }
              }}
            >
              <span>{label}</span>
              {isActive && (
                <span style={{
                  color: '#4f46e5',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                  ›
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card at Bottom */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid #eaecf0',
        background: '#ffffff',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #eaecf0',
        }}>
          {/* Avatar with initials 'UT' */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#4f46e5',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12.5px',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}>
            UT
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#101828',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}>
              Uday Tejan
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#667085',
              fontFamily: 'monospace',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              LIT2024057
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {isOpen && (
        <aside
          style={{
            width: '230px',
            minWidth: '230px',
            background: '#ffffff',
            borderRight: '1px solid #eaecf0',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 30,
          }}
          className="hidden lg:flex"
        >
          <NavContent />
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden">
          <div
            className="sidebar-overlay"
            onClick={() => onToggle && onToggle(false)}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '250px',
              background: '#ffffff',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
              overflowY: 'auto',
            }}
          >
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
