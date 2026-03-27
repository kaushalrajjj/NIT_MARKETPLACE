import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function ImageLightbox({ src, alt = 'Image', onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Scroll zooms in/out but minimum is 1 (original size — cannot go smaller)
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.001)));
  }, []);

  if (!src) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: scale > 1 ? 'zoom-out' : 'default',
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onWheelCapture={onWheel}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: 12,
          cursor: scale > 1 ? 'zoom-out' : 'zoom-in',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.08s ease-out',
          userSelect: 'none',
        }}
      />
    </div>,
    document.body
  );
}
