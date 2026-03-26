import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export function inputCls(icon, err) {
  return `w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-pri/20 focus:border-pri'
  }`;
}

export default function Field({ label, icon, error, children }) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <ThemedIcon
            name={icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            color={theme.pri}
          />
        )}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
