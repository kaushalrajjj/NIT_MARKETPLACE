import React, { useState, createContext, useContext, useCallback } from 'react';
import ThemedIcon from './ThemedIcon';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-slide-in
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : ''}
          ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
          ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
        `}>
          {toast.type === 'success' && <ThemedIcon name="tick-trick" size={18} color="#ffffff" />}
          {toast.type === 'error' && <ThemedIcon name="close" size={18} color="#ffffff" />}
          {toast.type === 'info' && <ThemedIcon name="help" size={18} color="#ffffff" />}
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
