import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function AboutSection() {
  const { theme } = useTheme();

  const STATS = [
    { emoji: <ThemedIcon name="college" size={28} color={theme.pri} />,     num: '2026',  label: 'Founded',            color: theme.pri },
    { emoji: <ThemedIcon name="user-laptop" size={28} color="#9333ea" />,   num: '5',     label: 'Core Team Members', color: '#9333ea',
      title: '1. Kaushal Raj\n2. Nitin Punetha\n3. Sahil Razvi\n4. Akshit Goyal\n5. Omprakash' },
    { emoji: <ThemedIcon name="school" size={28} color="#0891b2" />,         num: '10',    label: 'Departments Covered', color: '#0891b2' },
    { emoji: <ThemedIcon name="tick-trick" size={28} color="#10b981" />,     num: '100%',  label: 'Student Approved',   color: '#10b981' },
  ];

  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rv opacity-0 translate-y-6 transition-all duration-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full mb-3">
              <ThemedIcon name="people" size={12} color="currentColor" /> About Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">
              Built by students,<br />just like you
            </h2>
            <p className="mt-4 text-ink-3 leading-relaxed text-sm max-w-lg">
              We were tired of the chaos in WhatsApp groups and lost money on overpriced items. So we built this — a dedicated space for the NIT KKR fam.
            </p>
            <p className="text-ink-3 text-[13px] leading-relaxed mt-3">
              Whether you're a fresher furnishing your hostel room or a final-year student clearing out before placements — this is for you.
            </p>
            <a href="mailto:marketplacenit@gmail.com" className="inline-block mt-6 px-5 py-2.5 bg-pri hover:bg-pri-dark text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm">
              ✉️ Get in Touch
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 rv opacity-0 translate-y-6 transition-all duration-700">
            {STATS.map((box, i) => (
              <div key={i} className="border rounded-2xl p-6 text-center hover:shadow-md transition-all"
                title={box.title || ''}
                style={{ backgroundColor: theme.isDark ? `${box.color}15` : `${box.color}05`, borderColor: `${box.color}25` }}>
                <div className="flex justify-center mb-2 text-3xl">{box.emoji}</div>
                <div className="text-2xl font-extrabold text-ink">{box.num}</div>
                <div className="text-[11px] text-ink-3 mt-1 font-medium">{box.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
