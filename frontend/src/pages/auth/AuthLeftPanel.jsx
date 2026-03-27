import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

const FEATURES = [
  { icon: 'check',  color: 'text-emerald-300', text: <><strong>Verified Users</strong> only with @nitkkr email</> },
  { icon: 'deal',   color: 'text-amber-300',   text: <><strong>Face-to-Face</strong> deals in campus hostels</> },
  { icon: 'rupee',  color: 'text-blue-200',    text: <><strong>Zero Commission</strong> — keep everything you earn</> },
];

export default function AuthLeftPanel({ mode }) {
  const { theme } = useTheme();
  return (
    <div
      className="hidden lg:flex lg:w-[52%] h-full relative overflow-hidden text-white"
      style={{ backgroundColor: theme.pri }}
    >
      {/* Animated blobs */}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 -top-32 -left-32 animate-pulse bg-white/20 blur-3xl" />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 bottom-20 right-0 animate-pulse bg-white/10 blur-3xl" style={{ animationDelay: '1s' }} />
      <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 top-1/2 left-1/3 animate-pulse bg-black/20 blur-3xl" style={{ animationDelay: '0.5s' }} />

      <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 max-w-xl">
        <h2 className="text-[2.4rem] lg:text-[2.7rem] font-extrabold leading-[1.1]">
          {mode === 'login' ? (
            <>The Smarter Way<br />to Trade <span className="opacity-70">on Campus</span></>
          ) : (
            <>Join the Campus<br />Marketplace <span className="opacity-70">Today</span></>
          )}
        </h2>
        <p className="mt-5 text-white/70 text-sm leading-relaxed">
          {mode === 'login'
            ? 'Join 1,800+ NIT Kurukshetra students buying, selling, and exchanging items safely within campus. Verified profiles. Zero commission.'
            : 'Create your account with your official @nitkkr.ac.in email and start listing or buying items in minutes.'}
        </p>

        <div className="mt-9 space-y-3.5">
          {FEATURES.map(({ icon, color, text }) => (
            <div key={icon} className="flex items-center gap-3">
              <ThemedIcon name={icon} size={22} className={color} />
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
