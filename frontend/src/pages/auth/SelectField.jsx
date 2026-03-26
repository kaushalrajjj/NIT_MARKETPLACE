import React from 'react';
import Field from './Field';
import { useTheme } from '../../services/ThemeContext';

export default function SelectField({ label, error, value, onChange, children }) {
  const { theme } = useTheme();
  const hasValue = value !== '';
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm bg-bg focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
            error ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-pri/20 focus:border-pri'
          } ${hasValue ? 'text-ink font-medium' : 'text-ink-3'}`}
        >
          {children}
        </select>
        {/* Custom chevron */}
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={error ? '#f87171' : hasValue ? theme.pri : 'currentColor'}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </Field>
  );
}
