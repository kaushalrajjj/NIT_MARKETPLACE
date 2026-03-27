import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

const STEPS = [
  { num: '01', icon: 'login',   title: 'Login',        desc: 'Access with your whitelisted college credentials.' },
  { num: '02', icon: 'camera',  title: 'Post Your Item', desc: 'Add photos & price. Our AI even suggests what to charge.' },
  { num: '03', icon: 'message', title: 'Contact Seller', desc: 'Get direct phone and WhatsApp links for the seller.' },
  { num: '04', icon: 'deal',    title: 'Safe Meetups',  desc: 'Meet at the OAT, Jubilee Hall, or your hostel lounge. No city travel needed.' },
  { num: '05', icon: 'check',   title: 'Pay & Collect', desc: 'UPI or cash. Get your item. Help the community.', color: 'text-emerald-500' },
];

export default function HowItWorksSection() {
  return (
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
  );
}
