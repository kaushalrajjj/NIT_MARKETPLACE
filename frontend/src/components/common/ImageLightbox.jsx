import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * ImageLightbox — Full-Screen Image Viewer
 * ──────────────────────────────────────────
 * Opens an image full-screen over everything else on the page.
 * Used when the user clicks on a product image or a profile avatar.
 *
 * Features:
 *   - Full-screen dark overlay (rgba black, 92% opacity)
 *   - Scroll-wheel zoom: 1x → 5x (minimum 1x, can't shrink below original)
 *   - Close by: clicking the backdrop, or pressing Escape
 *   - Prevents background scroll while open (document.body.style.overflow = 'hidden')
 *   - Rendered via React Portal — injected directly into document.body
 *     so it's above ALL stacking contexts (Navbar, modals, sidebars, etc.)
 *
 * Props:
 *   src     {string}   — The image URL to display (should be full-resolution from getOriginalImageUrl)
 *   alt     {string}   — Alt text for accessibility
 *   onClose {function} — Called when the user closes the lightbox
 */
export default function ImageLightbox({ src, alt = 'Image', onClose }) {
  // Current zoom level: 1.0 = 100% (original size), 5.0 = 500%
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Close on Escape key press
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);

    // Lock background scroll so the page doesn't scroll while the lightbox is open
    document.body.style.overflow = 'hidden';

    // Cleanup on unmount:
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = ''; // Restore normal scrolling
    };
  }, [onClose]);

  /**
   * onWheel — Handle mouse scroll to zoom in/out.
   * deltaY is negative when scrolling up (zoom in), positive when down (zoom out).
   * Clamped between 1x (min, can't zoom out past original) and 5x (max).
   * useCallback keeps the function reference stable — avoids re-registering event listeners.
   */
  const onWheel = useCallback((e) => {
    e.preventDefault(); // Prevent the page from scrolling while zooming
    setScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.001)));
  }, []);

  // If no image src is provided, render nothing
  if (!src) return null;

  // createPortal renders the lightbox directly into document.body (outside the React tree).
  // This ensures it appears above everything — Navbar, Sidebar, modals, z-index stacking contexts.
  return createPortal(
    <div
      onClick={onClose} // Clicking the dark backdrop closes the lightbox
      style={{
        position: 'fixed', inset: 0, zIndex: 99999, // Highest z-index in the app
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: scale > 1 ? 'zoom-out' : 'default', // Cursor changes based on zoom state
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}                             // Prevent accidental drag
        onClick={(e) => e.stopPropagation()}          // Don't close when clicking the image itself
        onWheelCapture={onWheel}                      // Capture scroll for zoom
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',                       // Never stretch or crop
          borderRadius: 12,
          cursor: scale > 1 ? 'zoom-out' : 'zoom-in',// Visual hint about what scroll will do
          transform: `scale(${scale})`,               // Apply the zoom
          transformOrigin: 'center center',            // Zoom from the center
          transition: 'transform 0.08s ease-out',     // Smooth zoom animation
          userSelect: 'none',                         // Prevent text selection on drag
        }}
      />
    </div>,
    document.body // <= This is the portal target — mounts outside the React tree
  );
}
