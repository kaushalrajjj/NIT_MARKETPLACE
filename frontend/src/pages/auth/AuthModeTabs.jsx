import React from 'react';
import { useTheme } from '../../services/ThemeContext';

export default function AuthModeTabs({ mode, onModeChange }) {
  const { theme } = useTheme();
  return (
    <div className="flex rounded-xl overflow-hidden border border-border mb-6 text-sm font-semibold">
      {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
        <button
          key={m}
          type="button"
          onClick={() => onModeChange(m)}
          className="flex-1 py-2.5 transition-all"
          style={{
            backgroundColor: mode === m ? theme.pri : 'transparent',
            color: mode === m ? '#fff' : theme.pri,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
