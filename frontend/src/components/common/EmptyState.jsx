import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function EmptyState({ icon, heading, ctaLabel, ctaTo, ctaIcon }) {
  const { theme } = useTheme();
  return (
    <div className="text-center py-20 bg-surface rounded-2xl border border-border">
      <ThemedIcon name={icon} size={64} color={theme.pri} className="opacity-40 mb-4" fill />
      <h3 className="font-bold text-ink-2 text-lg">{heading}</h3>
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark"
        >
          {ctaIcon && <ThemedIcon name={ctaIcon} size={18} color="#ffffff" fill />}
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
