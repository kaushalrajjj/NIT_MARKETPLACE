import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function AvatarCard({ profile, activity, avatarUrl, avatarRef, onAvatarUpload }) {
  const { theme } = useTheme();
  const initial = (profile?.name || '?').charAt(0).toUpperCase();

  const stats = [
    { val: activity?.listed?.length ?? 0,    label: 'Listings' },
    { val: activity?.sold?.length ?? 0,      label: 'Sold' },
    { val: activity?.wishlisted?.length ?? 0, label: 'Saved' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 text-center self-start sticky top-24">
      <div
        onClick={() => avatarRef.current?.click()}
        className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-pri to-purple-500 flex items-center justify-center text-3xl font-bold text-white cursor-pointer group overflow-hidden mb-4"
        title="Change profile photo"
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          : initial}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ThemedIcon name="edit" size={24} color="#ffffff" />
        </div>
      </div>
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />

      <div className="font-bold text-ink text-lg">{profile?.name || '—'}</div>
      <div className="text-sm text-ink-3">{profile?.rollNo || ''}</div>
      <div className="text-xs text-pri font-medium mt-1">
        {profile?.role === 'admin' ? 'Administrator' : `${profile?.branch || 'NIT KKR'} · Year ${profile?.year || '?'}`}
      </div>

      <div className="flex justify-center gap-4 mt-5 pt-5 border-t border-border">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-extrabold text-ink">{s.val}</div>
            <div className="text-xs text-ink-3">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
