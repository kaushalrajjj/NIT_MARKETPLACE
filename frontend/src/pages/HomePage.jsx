import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import ThemedIcon from '../components/ThemedIcon';

const CATEGORIES = [
  { icon: 'cat-books', name: 'Exam Essentials', hot: true },
  { icon: 'cat-electronics', name: 'Gadgets & Gear' },
  { icon: 'cat-hostel', name: 'Hostel Hacks' },
  { icon: 'cat-other', name: 'Fest Outfits' },
  { icon: 'cat-cycle', name: 'M-Gate Runs' },
  { icon: 'cat-academic', name: 'Lab Tools' },
  { icon: 'cat-other', name: 'Random Stuff' },
];

const STEPS = [
  { num: '01', icon: 'login', title: 'Login', desc: 'Access with your whitelisted college credentials.' },
  { num: '02', icon: 'camera', title: 'Post Your Item', desc: 'Add photos & price. Our AI even suggests what to charge.' },
  { num: '03', icon: 'message', title: 'Contact Seller', desc: 'Get direct phone and WhatsApp links for the seller.' },
  { num: '04', icon: 'deal', title: 'Safe Meetups', desc: 'Meet at the OAT, Jubilee Hall, or your hostel lounge. No city travel needed.' },
  { num: '05', icon: 'check', title: 'Pay & Collect', desc: 'UPI or cash. Get your item. Help the community.', color: 'text-emerald-500' },
];

const TRUST = [
  { icon: 'login', title: 'NITians Only', desc: 'Only verified college accounts can access. No outsiders, ever.', color: 'text-emerald-400' },
  { icon: 'profile', title: 'Verified Student Profiles', desc: 'Every account is tied to a real student roll number and department.', color: 'text-amber-400' },
  { icon: 'map-pin', title: 'Inside Campus', desc: 'All trades happen within NIT KKR. Meet at the library or your favorite canteen.', color: 'text-blue-400' },
];

function useScrollReveal() {
  const ref = useRef([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${i * 0.05}s`;
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.rv').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function HomePage() {
  useScrollReveal();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-br from-pri-deep via-pri-dark to-pri-deep text-white overflow-hidden">
        {/* Decorative grain/dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,71,230,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,166,35,0.08),transparent_50%)]" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rv opacity-0 translate-y-6 transition-all duration-700">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight">
                Skip the hassle. <span className="text-acc">right here.</span>
              </h1>
              <p className="mt-5 text-[17px] text-white/70 leading-relaxed max-w-lg">
                Grab old textbooks or sell your cycle before placement — Everything in one trusted place — just for NIT KKR students.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/browse" className="flex items-center gap-2 px-6 py-3 bg-acc hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-sm">
                  <ThemedIcon name="search" size={16} /> See what's new
                </Link>
                <Link to="/sell" className="flex items-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-white/40 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 text-sm">
                  <ThemedIcon name="sell" size={16} /> Sell an item
                </Link>
              </div>
            </div>

            {/* Hero Cards */}
            <div className="grid grid-cols-2 gap-3 rv opacity-0 translate-y-6 transition-all duration-700 delay-100">
              {[
                { icon: 'cat-books', title: 'Textbooks', sub: 'Semester 1–8 books' },
                { icon: 'cat-electronics', title: 'Laptops & Gadgets', sub: 'Verified sellers only' },
                { icon: 'cat-cycle', title: 'Cycles', sub: 'Buy or sell cycles' },
                { icon: 'cat-hostel', title: 'Hostel Hacks', sub: 'Essential gear for your room' },
              ].map((card, i) => (
                <div key={i} className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.1] transition-all hover:-translate-y-1 cursor-default">
                  <ThemedIcon name={card.icon} size={40} color="rgba(255,255,255,0.9)" className="mb-3" />
                  <div className="font-bold text-sm">{card.title}</div>
                  <div className="text-[11px] text-white/50 mt-1">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 md:py-20 bg-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 rv opacity-0 translate-y-6 transition-all duration-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pri-light text-pri text-xs font-bold rounded-full mb-3">
              <ThemedIcon name="help" size={12} /> How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink">Simple as 1-2-3 (mostly)</h2>
            <p className="mt-3 text-ink-3 text-sm">No chaos, no sketchy WhatsApp groups. Just this.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 rv opacity-0 translate-y-6 transition-all duration-700">
            {STEPS.map((step, i) => (
                <div key={i} className="bg-surface rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="text-xs font-bold text-pri/60 mb-2">{step.num}</div>
                  <div className={`mb-3 ${step.color || 'text-pri'}`}><ThemedIcon name={step.icon} size={32} /></div>
                  <div className="font-bold text-ink text-sm mb-1">{step.title}</div>
                  <div className="text-[13px] text-ink-3 leading-relaxed">{step.desc}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST & SAFETY ─── */}
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

      {/* ─── ABOUT ─── */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rv opacity-0 translate-y-6 transition-all duration-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full mb-3"><ThemedIcon name="people" size={12} color="currentColor" /> About Us</span>
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
              {[
                { emoji: <ThemedIcon name="college" size={28} color={theme.pri} />, num: '2026', label: 'Founded', color: theme.pri },
                { emoji: <ThemedIcon name="user-laptop" size={28} color="#9333ea" />, num: '5', label: 'Core Team Members', color: '#9333ea',
                  title: '1. Kaushal Raj\n2. Nitin Punetha\n3. Sahil Razvi\n4. Akshit Goyal\n5. Omprakash' },
                { emoji: <ThemedIcon name="school" size={28} color="#0891b2" />, num: '10', label: 'Departments Covered', color: '#0891b2' },
                { emoji: <ThemedIcon name="tick-trick" size={28} color="#10b981" />, num: '100%', label: 'Student Approved', color: '#10b981' },
              ].map((box, i) => (
                <div key={i} className="border rounded-2xl p-6 text-center hover:shadow-md transition-all" 
                     title={box.title || ''}
                     style={{ 
                       backgroundColor: theme.isDark ? `${box.color}15` : `${box.color}05`,
                       borderColor: `${box.color}25` 
                     }}>
                  <div className="flex justify-center mb-2 text-3xl">{box.emoji}</div>
                  <div className="text-2xl font-extrabold text-ink">{box.num}</div>
                  <div className="text-[11px] text-ink-3 mt-1 font-medium">{box.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
