import React from 'react';
import ThemedIcon from '../ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function SubmitButton({ loading, loadingLabel, icon, label, disabled }) {
  const { theme } = useTheme();
  const isDisabled = loading || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full py-3.5 text-white font-extrabold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[14px] tracking-wide uppercase hover:opacity-90"
      style={{
        backgroundColor: isDisabled ? '#9ca3af' : theme.pri,
        boxShadow: isDisabled ? 'none' : `0 8px 25px ${theme.pri}55`,
      }}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <ThemedIcon name={icon} size={18} color="#ffffff" />}
          {label}
        </>
      )}
    </button>
  );
}
