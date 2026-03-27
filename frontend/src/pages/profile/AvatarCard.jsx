import React, { useState } from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';
import ImageLightbox from '../../components/common/ImageLightbox';

// Edit pencil SVG (themed stroke color via prop)
function EditIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AvatarCard({ profile, activity, avatarUrl, avatarRef, onAvatarUpload }) {
  const { theme } = useTheme();
  const initial = (profile?.name || '?').charAt(0).toUpperCase();
  const [lightbox, setLightbox] = useState(false);

  const stats = [
    { val: activity?.listed?.length ?? 0,    label: 'Listings' },
    { val: activity?.sold?.length ?? 0,      label: 'Sold' },
    { val: activity?.wishlisted?.length ?? 0, label: 'Saved' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 text-center self-start sticky top-24">
      {/* Avatar — clickable to view full-screen */}
      <div
        onClick={() => avatarUrl && setLightbox(true)}
        className={`relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-pri to-purple-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden mb-2 ${avatarUrl ? 'cursor-pointer' : ''}`}
        title={avatarUrl ? 'View photo' : ''}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          : initial}
      </div>

      {/* Edit button below avatar */}
      <button
        onClick={() => avatarRef.current?.click()}
        title="Change profile photo"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors mb-4 hover:opacity-80"
        style={{ borderColor: theme.pri, color: theme.pri, background: `${theme.pri}15` }}
      >
        <EditIcon color={theme.pri} />
        Edit Photo
      </button>

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

      {lightbox && avatarUrl && (
        <ImageLightbox src={avatarUrl} alt="Profile photo" onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}
