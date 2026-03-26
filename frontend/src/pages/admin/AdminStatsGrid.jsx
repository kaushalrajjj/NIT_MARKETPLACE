import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function AdminStatsGrid({ stats }) {
  const { theme } = useTheme();
  const statTotal = [
    { val: stats.totalUsers || 0,    label: 'Total Users',      icon: 'profile',   color: theme.pri },
    { val: stats.liveListings || 0,  label: 'Live Listings',    icon: 'check',     color: '#10b981' },
    { val: stats.pendingListings || 0, label: 'Pending Approval', icon: 'dashboard', color: stats.pendingListings > 0 ? '#ef4444' : '#9ca3af' },
    { val: `₹${(stats.totalVolume || 0).toLocaleString('en-IN')}`, label: 'Total Volume', icon: 'sell', color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statTotal.map((s, i) => (
        <div key={i} className="border rounded-2xl p-5 text-center flex flex-col items-center transition-all hover:shadow-lg"
          style={{ backgroundColor: theme.isDark ? `${s.color}20` : `${s.color}08`, borderColor: `${s.color}30` }}>
          <ThemedIcon name={s.icon} size={28} color={s.color} className="mb-2 opacity-90" fill />
          <div className="text-2xl font-extrabold text-ink">{s.val}</div>
          <div className="text-xs text-ink-3 mt-1 font-medium italic opacity-80">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
