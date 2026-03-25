import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../services/ThemeContext';
import ThemedIcon from '../components/ThemedIcon';

const COLLEGE_FIELDS = [
  { key: 'name', label: 'Full Name', iconName: 'profile' },
  { key: 'rollNo', label: 'Roll Number', iconName: 'admin' },
  { key: 'branch', label: 'Branch', iconName: 'cat-academic' },
  { key: 'year', label: 'Year', iconName: 'cat-all' },
  { key: 'hostel', label: 'Current Hostel', iconName: 'home' },
  { key: 'email', label: 'College Email', iconName: 'email' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [secEmail, setSecEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [userData, actData] = await Promise.all([
        api.fetchMe(user.token),
        api.fetchActivity(user.token),
      ]);
      setProfile(userData);
      const freshImg = actData?.img || null;
      setAvatarUrl(freshImg);
      // Sync with global context so navbar/sidebar update
      if (freshImg !== user.profileImage) {
        updateUser({ profileImage: freshImg });
      }
    } catch (err) {
      showToast('Failed to load profile data.', 'error');
    }
  }

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await api.updateMe({ mobileNo: phone.trim(), whatsappNo: whatsapp.trim(), secondaryEmail: secEmail.trim() }, user.token);
      showToast('Contact info saved', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingContact(false);
    }
  };

  const changePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { showToast('Please fill all password fields.', 'error'); return; }
    if (newPass !== confirmPass) { showToast('New passwords do not match.', 'error'); return; }
    if (newPass.length < 6 || newPass.length > 12) { showToast('Password must be 6-12 characters.', 'error'); return; }

    setSavingPass(true);
    try {
      await api.changePassword(currentPass, newPass, user.token);
      showToast('Password updated successfully ', 'success');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Instant preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
    try {
      const result = await api.uploadAvatar(file, user.token);
      showToast('Profile photo updated', 'success');
      updateUser({ profileImage: result.img });
      setAvatarUrl(result.img);
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const initial = (profile?.name || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Avatar Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 text-center self-start sticky top-24">
            <div
              onClick={() => avatarRef.current?.click()}
              className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-pri to-purple-500 flex items-center justify-center text-3xl font-bold text-white cursor-pointer group overflow-hidden mb-4"
              title="Change profile photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                initial
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ThemedIcon name="edit" size={24} color="#ffffff" />
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

            <div className="font-bold text-ink text-lg">{profile?.name || '—'}</div>
            <div className="text-sm text-ink-3">{profile?.rollNo || ''}</div>
            <div className="text-xs text-pri font-medium mt-1">
              {profile?.role === 'admin' ? 'Administrator' : `${profile?.branch || 'NIT KKR'} · Year ${profile?.year || '?'}`}
            </div>

            <div className="flex justify-center gap-4 mt-5 pt-5 border-t border-border">
              {[
                { val: activity?.listed?.length ?? 0, label: 'Listings' },
                { val: activity?.sold?.length ?? 0, label: 'Sold' },
                { val: activity?.wishlisted?.length ?? 0, label: 'Saved' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-extrabold text-ink">{s.val}</div>
                  <div className="text-xs text-ink-3">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* College Info */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center gap-2"><ThemedIcon name="profile" size={20} className="text-pri" /> College Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COLLEGE_FIELDS.map(f => (
                  <div key={f.key} className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                    <ThemedIcon name={f.iconName} size={20} color={theme.pri} className="opacity-90" />
                    <div>
                      <div className="text-xs text-ink-3 font-medium">{f.label}</div>
                      <div className="text-sm font-semibold text-ink-2">{profile?.[f.key] ?? '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center gap-2"><ThemedIcon name="phone" size={20} className="text-pri" fill /> Contact Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">WhatsApp Number</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="91XXXXXXXXXX (no +)"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">Secondary Email</label>
                  <input type="email" value={secEmail} onChange={e => setSecEmail(e.target.value)} placeholder="personal@gmail.com"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                </div>
              </div>
              <button onClick={saveContact} disabled={savingContact}
                className="px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark disabled:bg-pri/60 transition-colors">
                {savingContact ? 'Saving…' : 'Save Contact Info'}
              </button>
            </div>

            {/* Password */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-ink mb-1"> Change Password</h3>
              <p className="text-xs text-ink-3 mb-4">Enter current password to set a new one.</p>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">Current Password</label>
                  <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Enter current password"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-2 mb-1.5">New Password</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-2 mb-1.5">Confirm Password</label>
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password"
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                  </div>
                </div>
              </div>
              <button onClick={changePassword} disabled={savingPass}
                className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors">
                {savingPass ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
