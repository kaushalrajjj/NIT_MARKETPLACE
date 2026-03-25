import React from 'react';
import ThemedIcon from './ThemedIcon';
import { useTheme } from '../services/ThemeContext';
import { getOptimizedImageUrl } from '../services/helpers';

export default function ProfileModal({ user, onClose, onFilterBySeller }) {
  const { theme } = useTheme();
  
  if (!user) return null;

  const initial = (user.name || 'S').charAt(0).toUpperCase();

  const infoFields = [
    { label: 'Email', value: user.email, iconName: 'email' },
    { label: 'Branch', value: user.branch || 'N/A', iconName: 'cat-academic' },
    { label: 'Year', value: user.year || 'N/A', iconName: 'cat-all' },
    { label: 'Hostel', value: user.hostel || 'N/A', iconName: 'home' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="relative p-8 text-center bg-gradient-to-br from-pri to-pri-dark text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ThemedIcon name="help" size={16} color="white" className="rotate-45" />
          </button>
          
          <div className="mx-auto w-24 h-24 rounded-full bg-white p-1 shadow-xl mb-4">
            <div className="w-full h-full rounded-full bg-pri-light flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img 
                  src={getOptimizedImageUrl(user.profileImage, 200)} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-pri">{initial}</span>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-black mb-1">{user.name}</h2>
          <div className="text-white/80 font-medium text-sm">Roll No: {user.rollNo || 'N/A'}</div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {infoFields.map((f, i) => (
              <div key={i} className="bg-bg p-3 rounded-2xl border border-border flex items-start gap-3">
                <div className="mt-0.5"><ThemedIcon name={f.iconName} size={16} color={theme.pri} /></div>
                <div className="min-w-0">
                  <div className="text-[10px] text-ink-3 font-bold uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-sm font-bold text-ink truncate">{f.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {user.mobileNo && (
              <a 
                href={`tel:${user.mobileNo}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-bg border border-border rounded-xl font-bold text-ink hover:bg-surface-2 transition-colors"
              >
                <ThemedIcon name="help" size={18} color={theme.pri} /> Call {user.mobileNo}
              </a>
            )}
            
            <button 
              onClick={() => onFilterBySeller?.(user._id, user.name)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-pri text-white rounded-2xl font-bold hover:bg-pri-dark transition-all shadow-lg shadow-pri/20"
            >
              <ThemedIcon name="browse" size={20} color="white" fill /> View All Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
