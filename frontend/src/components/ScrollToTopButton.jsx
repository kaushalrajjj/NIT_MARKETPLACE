import React, { useState, useEffect } from 'react';

// CSS animation for the button popping into view
const btnStyles = `
  @keyframes scrollBtnIn {
    from { opacity: 0; transform: scale(0.6) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

/**
 * ScrollToTopButton — Floating "Back to Top" Button
 * ───────────────────────────────────────────────────
 * A fixed-position circular button that appears in the bottom-right corner
 * after the user scrolls down more than 300px.
 *
 * Features:
 *   - Invisible and non-interactive until 300px of scroll (opacity: 0, pointerEvents: none)
 *   - Animates in with a pop/bounce effect when it becomes visible
 *   - Smooth-scrolls back to top on click
 *   - Scale hover effect for feedback
 *   - Uses the theme's primary color (--t-pri CSS variable)
 *   - Uses a passive scroll event listener (doesn't block scroll performance)
 */
export default function ScrollToTopButton() {
  // Whether the button should be visible (user has scrolled down enough)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen to scroll events to show/hide the button
    const onScroll = () => setVisible(window.scrollY > 300);

    // { passive: true } tells the browser this handler won't call preventDefault(),
    // so the browser can scroll without waiting for JavaScript to finish
    window.addEventListener('scroll', onScroll, { passive: true });

    // Cleanup: remove listener when component unmounts to prevent memory leaks
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Inject the button animation keyframes into the page */}
      <style>{btnStyles}</style>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top" // Accessibility: screen readers announce this button
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 999,            // Above most content, below modals
          width: '44px',
          height: '44px',
          borderRadius: '50%',   // Circular
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--t-pri)', // Uses the theme's accent color CSS variable
          boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          // Hidden when not scrolled far enough — opacity+pointerEvents instead of display:none
          // so the transition animates smoothly rather than snapping in
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none', // Disable clicks when invisible
          animation: visible ? 'scrollBtnIn 0.28s cubic-bezier(0.22,1,0.36,1) both' : 'none',
          transition: 'opacity 0.22s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
        // Hover effects applied inline since we can't use CSS at this scope
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.22)';
        }}
      >
        {/* Up chevron arrow SVG icon */}
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
