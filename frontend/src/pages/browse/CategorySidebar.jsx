import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

const CATEGORIES = [
  { value: 'all', icon: 'category_nav', name: 'All Categories' },
  { value: 'Books', icon: 'cat-books', name: 'Books & Notes' },
  { value: 'Electronics', icon: 'cat-electronics', name: 'Electronics' },
  { value: 'Cycle', icon: 'cat-cycle', name: 'Cycles & Gear' },
  { value: 'Hostel Stuff', icon: 'cat-hostel', name: 'Hostel Essentials' },
  { value: 'Academic', icon: 'cat-academic', name: 'Lab & Academic' },
  { value: 'Other', icon: 'cat-other', name: 'Other' },
];

export { CATEGORIES };

export default function CategorySidebar({ category, onSelect }) {
  const { theme } = useTheme();
  return (
    <aside className="hidden lg:block w-56 flex-shrink-0">
      <div className="bg-surface rounded-2xl border border-border p-4 sticky top-24">
        <h3 className="font-bold text-ink text-sm mb-3">Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onSelect(cat.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                ${category === cat.value ? 'bg-pri-light text-pri font-semibold' : 'text-ink-2 hover:bg-bg'}`}
            >
              <ThemedIcon
                name={cat.icon}
                size={18}
                color={category === cat.value ? theme.pri : '#9ca3af'}
                fill={category === cat.value}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
