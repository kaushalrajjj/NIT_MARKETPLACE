import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
];

export { SORT_OPTIONS };

export default function SortDropdown({ sort, show, onToggle, onSelect }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="px-4 py-2 border border-border rounded-lg text-sm bg-surface text-ink hover:bg-bg flex items-center gap-2 transition-colors"
      >
        <ThemedIcon name="sell" size={14} className="text-pri opacity-70" />
        {SORT_OPTIONS.find(s => s.value === sort)?.label}
      </button>
      {show && (
        <div className="absolute right-0 top-12 w-48 bg-surface rounded-xl border border-border shadow-xl z-40 overflow-hidden">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt.value ? 'bg-pri-light text-pri font-semibold' : 'hover:bg-bg text-ink-2'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
