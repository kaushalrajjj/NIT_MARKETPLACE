import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

const TRUST = [
  { icon: 'login',     title: 'NITians Only',               desc: 'Only verified college accounts can access. No outsiders, ever.',                                            color: 'text-emerald-400' },
  { icon: 'profile',   title: 'Verified Student Profiles',   desc: 'Every account is tied to a real student roll number and department.',                                      color: 'text-amber-400' },
  { icon: 'map-pin',   title: 'Inside Campus',               desc: 'All trades happen within NIT KKR. Meet at the library or your favorite canteen.',                         color: 'text-blue-400' },
];

export default function TrustSafetySection() {
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="rv opacity-0 translate-y-6 transition-all duration-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full mb-3">
              <ThemedIcon name="check" size={12} color="#10b981" /> Safety First
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">
              You're safe here.<br className="hidden sm:block" />We made sure of it.
            </h2>
            <p className="mt-4 text-ink-3 max-w-md leading-relaxed text-sm">
              Every feature is designed to keep transactions within the campus community — verified, transparent, and scam-free.
            </p>
            <div className="mt-8 space-y-5">
              {TRUST.map((t, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1"><ThemedIcon name={t.icon} size={28} className={t.color} /></div>
                  <div>
                    <div className="font-bold text-ink text-sm">{t.title}</div>
                    <div className="text-[13px] text-ink-3 mt-0.5 leading-relaxed">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
