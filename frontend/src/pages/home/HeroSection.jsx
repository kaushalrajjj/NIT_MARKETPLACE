import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../../components/ThemedIcon';

const HERO_CARDS = [
  { icon: 'cat-books',       title: 'Textbooks',         sub: 'Semester 1–8 books' },
  { icon: 'cat-electronics', title: 'Laptops & Gadgets',  sub: 'Verified sellers only' },
  { icon: 'cat-cycle',       title: 'Cycles',             sub: 'Buy or sell cycles' },
  { icon: 'cat-hostel',      title: 'Hostel Hacks',       sub: 'Essential gear for your room' },
];

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-pri-deep via-pri-dark to-pri-deep text-white overflow-hidden">
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
            {HERO_CARDS.map((card, i) => (
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
  );
}
