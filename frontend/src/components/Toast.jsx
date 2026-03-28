import React, { useState, createContext, useContext, useCallback } from 'react';
import ThemedIcon from './ThemedIcon';

/**
 * Toast — Global Pop-up Notification System
 * ───────────────────────────────────────────
 * Shows small timed notifications in the top-right corner of the screen.
 * Three types: success (green), error (red), info (blue).
 *
 * Architecture:
 *   - ToastProvider wraps the whole app (in App.jsx)
 *   - It holds ONE toast in state at a time
 *   - The toast auto-dismisses after 3 seconds
 *   - Any component calls showToast() via the useToast() hook
 *
 * HOW TO USE in any component:
 *   const { showToast } = useToast();
 *   showToast('Saved successfully!', 'success');
 *   showToast('Something went wrong', 'error');
 *   showToast('Check your email', 'info');
 */

// Context object — starts as null, filled by ToastProvider
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  // Current toast to display. null = nothing showing.
  // Shape: { message: string, type: 'success' | 'error' | 'info' }
  const [toast, setToast] = useState(null);

  /**
   * showToast — Trigger a notification popup.
   *
   * useCallback prevents unnecessary re-renders in child components that
   * receive this as a prop — the function reference stays stable between renders.
   *
   * @param {string} message - Text to display
   * @param {string} type - 'success' | 'error' | 'info' (default: 'info')
   */
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    // Auto-hide after 3 seconds — no need for user to dismiss it
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* Render all child components as normal */}
      {children}

      {/* The actual toast popup — only rendered when there's an active toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-slide-in
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : ''}
          ${toast.type === 'error'   ? 'bg-red-500 text-white'     : ''}
          ${toast.type === 'info'    ? 'bg-blue-500 text-white'    : ''}
        `}>
          {/* Icon changes based on toast type */}
          {toast.type === 'success' && <ThemedIcon name="tick-trick" size={18} color="#ffffff" />}
          {toast.type === 'error'   && <ThemedIcon name="close"      size={18} color="#ffffff" />}
          {toast.type === 'info'    && <ThemedIcon name="help"       size={18} color="#ffffff" />}
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Custom hook — shortcut so components write useToast() instead of useContext(ToastContext)
export function useToast() {
  return useContext(ToastContext);
}
