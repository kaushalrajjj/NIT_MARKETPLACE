import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

/**
 * EmptyState — "Nothing Here Yet" Placeholder
 * ─────────────────────────────────────────────
 * A reusable empty state UI displayed when a list or section has no items.
 * Shows a big icon, a heading, and optionally a call-to-action link button.
 *
 * Used in:
 *   - Browse page: "No products match your filters"
 *   - Dashboard tabs: "You haven't listed anything yet"
 *   - Wishlist tab: "You haven't saved any items"
 *
 * Props:
 *   icon     {string}  — ThemedIcon name to display (e.g. 'browse', 'heart')
 *   heading  {string}  — Main descriptive text (e.g. "No listings yet")
 *   ctaLabel {string?} — Button text (optional, e.g. "Start Selling")
 *   ctaTo    {string?} — React Router path the button links to (e.g. "/sell")
 *   ctaIcon  {string?} — Icon to show inside the button (optional)
 */
export default function EmptyState({ icon, heading, ctaLabel, ctaTo, ctaIcon }) {
  const { theme } = useTheme(); // Get the current accent color for the icon

  return (
    <div className="text-center py-20 bg-surface rounded-2xl border border-border">
      {/* Large faded icon — uses theme accent color at 40% opacity */}
      <ThemedIcon name={icon} size={64} color={theme.pri} className="opacity-40 mb-4" fill />

      {/* Main heading */}
      <h3 className="font-bold text-ink-2 text-lg">{heading}</h3>

      {/* Optional CTA button — only renders if both ctaLabel and ctaTo are provided */}
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark"
        >
          {/* Optional icon inside the button */}
          {ctaIcon && <ThemedIcon name={ctaIcon} size={18} color="#ffffff" fill />}
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
