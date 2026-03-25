import React, { useState, useEffect } from 'react';

const btnStyles = `
  @keyframes scrollBtnIn {
    from { opacity: 0; transform: scale(0.6) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{btnStyles}</style>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 999,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--t-pri)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          animation: visible ? 'scrollBtnIn 0.28s cubic-bezier(0.22,1,0.36,1) both' : 'none',
          transition: 'opacity 0.22s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.22)';
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20" height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}
