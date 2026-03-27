import React from 'react';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="text-center py-20 text-ink-3">
      <div className="inline-block w-8 h-8 border-[3px] border-pri-mid border-t-pri rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
