import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function DashboardTabs({ tabs, activeTab, onSwitch }) {
  return (
    <div className="flex gap-1 bg-surface rounded-2xl p-1.5 border border-border mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSwitch(tab.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
            ${activeTab === tab.id ? 'bg-pri text-white shadow-md' : 'text-ink-3 hover:text-ink-2 hover:bg-bg'}`}
        >
          <ThemedIcon
            name={tab.icon}
            size={18}
            color={activeTab === tab.id ? '#ffffff' : '#9ca3af'}
            fill={activeTab === tab.id}
          />
          {tab.label}
          {tab.count > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'theme-badge'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
