import React, { useEffect, useRef } from 'react';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import HowItWorksSection from './HowItWorksSection';
import TrustSafetySection from './TrustSafetySection';
import AboutSection from './AboutSection';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
          } else {
            // Re-hide when scrolling away to support "either direction"
            entry.target.classList.remove('opacity-100', 'translate-y-0');
            entry.target.classList.add('opacity-0', 'translate-y-6');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.rv').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function HomePage() {
  useScrollReveal();
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <TrustSafetySection />
      <AboutSection />
    </div>
  );
}
