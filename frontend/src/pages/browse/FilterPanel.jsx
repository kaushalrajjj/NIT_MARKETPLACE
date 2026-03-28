import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';
import { CATEGORIES } from './CategorySidebar';

export default function FilterPanel({ panelStyle = {}, isMobile, category, onCategory, minPrice, maxPrice, conditions, sellerYear, onMinPrice, onMaxPrice, onToggleCondition, onSellerYear, onReset, onApply, onClose }) {
  const { theme } = useTheme();

  return (
    <div
      className="w-72 bg-surface rounded-2xl border border-border shadow-2xl p-5 z-[1050] max-h-[85vh] overflow-y-auto"
      style={panelStyle}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-ink text-sm">Advanced Filters</h4>
        <button onClick={onClose} className="text-ink-3 hover:text-ink">✕</button>
      </div>

      {/* ── Category (mobile only) ── */}
      {isMobile && (
        <div className="mb-5">
          <div className="text-xs font-semibold text-ink-2 mb-2">Category</div>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { onCategory(cat.value); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  category === cat.value ? 'bg-pri-light text-pri font-semibold' : 'text-ink-2 hover:bg-bg'
                }`}
              >
                <ThemedIcon
                  name={cat.icon}
                  size={16}
                  color={category === cat.value ? theme.pri : '#9ca3af'}
                  fill={category === cat.value}
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
          <div className="my-4 border-t border-border/60" />
        </div>
      )}

      {/* Price Range */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-ink-2 mb-2">Price Range</div>
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs">₹</span>
            <input type="number" value={minPrice} onChange={e => onMinPrice(e.target.value)} placeholder="Min"
              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-bg text-ink focus:ring-1 focus:ring-pri/30 outline-none" />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs">₹</span>
            <input type="number" value={maxPrice} onChange={e => onMaxPrice(e.target.value)} placeholder="Max"
              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-bg text-ink focus:ring-1 focus:ring-pri/30 outline-none" />
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-ink-2 mb-2">Condition</div>
        <div className="space-y-2">
          {['New', 'Lightly Used', 'Used', 'Damaged'].map(c => (
            <label key={c} className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
              <input type="checkbox" checked={conditions.includes(c)} onChange={() => onToggleCondition(c)} className="rounded border-border text-pri focus:ring-pri/40" />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Seller Year */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-ink-2 mb-2">Seller Year</div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(y => (
            <button
              key={y}
              onClick={() => onSellerYear(sellerYear === String(y) ? '' : String(y))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sellerYear === String(y)
                ? 'bg-pri text-white border-pri'
                : 'bg-bg text-ink-3 border-border hover:border-pri/50'
              }`}
            >
              Year {y}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border/50">
        <button onClick={onReset} className="flex-1 py-2 text-sm text-ink-2 border border-border rounded-lg hover:bg-bg">Reset</button>
        <button onClick={onApply} className="flex-1 py-2 text-sm text-white bg-pri rounded-lg hover:bg-pri-dark font-semibold">Apply</button>
      </div>
    </div>
  );
}

