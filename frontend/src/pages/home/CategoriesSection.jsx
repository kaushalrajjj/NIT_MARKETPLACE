import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

const CATEGORIES = [
  { icon: 'cat-books',       name: 'Exam Essentials', hot: true },
  { icon: 'cat-electronics', name: 'Gadgets & Gear' },
  { icon: 'cat-hostel',      name: 'Hostel Hacks' },
  { icon: 'cat-other',       name: 'Fest Outfits' },
  { icon: 'cat-cycle',       name: 'M-Gate Runs' },
  { icon: 'cat-academic',    name: 'Lab Tools' },
  { icon: 'cat-other',       name: 'Random Stuff' },
];

export default function CategoriesSection() {
  const { theme } = useTheme();
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 rv opacity-0 translate-y-6 transition-all duration-700">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pri-light text-pri text-xs font-bold rounded-full mb-3">
            <ThemedIcon name="browse" size={12} /> Campus Basics
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">What do you need today?</h2>
          <p className="mt-3 text-ink-3 max-w-md mx-auto text-sm">Everything from Exam Essentials to Hostel Hacks.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 rv opacity-0 translate-y-6 transition-all duration-700">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to="/browse"
              className={`group relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg
                ${cat.hot
                  ? (theme.isDark ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50')
                  : 'border-border bg-bg hover:border-pri-mid hover:bg-pri-light'}`}
            >
              <ThemedIcon name={cat.icon} size={36} color={cat.hot ? '#d97706' : theme.pri} />
              <span className="text-xs font-semibold text-ink-2 text-center">{cat.name}</span>
              {cat.hot && <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-acc-red text-white text-[10px] font-bold rounded-full">HOT</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
