import React from 'react';

export default function FilterPanel({ minPrice, maxPrice, conditions, sellerYear, onMinPrice, onMaxPrice, onToggleCondition, onSellerYear, onReset, onApply, onClose }) {
  return (
    <div className="absolute right-0 top-12 w-72 bg-surface rounded-2xl border border-border shadow-2xl p-5 z-40">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-ink text-sm">Advanced Filters</h4>
        <button onClick={onClose} className="text-ink-3 hover:text-ink">✕</button>
      </div>

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
