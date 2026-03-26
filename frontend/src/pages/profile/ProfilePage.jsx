import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import AvatarCard from './AvatarCard';
import UserInfoCard from './UserInfoCard';
import ContactInfoCard from './ContactInfoCard';
import ChangePasswordCard from './ChangePasswordCard';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
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
      const [userData, actData] = await Promise.all([api.fetchMe(user.token), api.fetchActivity(user.token)]);
      setProfile(userData);
      
      // Pre-populate contact fields for non-admins (or just always for state consistency)
      setPhone(userData.mobileNo || '');
      setWhatsapp(userData.whatsappNo || '');
      setSecEmail(userData.secondaryEmail || '');

      const freshImg = actData?.img || null;
      setAvatarUrl(freshImg);
      if (freshImg !== user.profileImage) updateUser({ profileImage: freshImg });
    } catch (err) {
      showToast('Failed to load profile data.', 'error');
    }
  }

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await api.updateMe({ mobileNo: phone.trim(), whatsappNo: whatsapp.trim(), secondaryEmail: secEmail.trim() }, user.token);
      showToast('Contact info saved', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSavingContact(false); }
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
    } catch (err) { showToast(err.message || 'Failed to update password.', 'error'); }
    finally { setSavingPass(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
    try {
      const result = await api.uploadAvatar(file, user.token);
      showToast('Profile photo updated', 'success');
      updateUser({ profileImage: result.img });
      setAvatarUrl(result.img);
    } catch (err) { showToast(err.message, 'error'); }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <AvatarCard profile={profile} activity={activity} avatarUrl={avatarUrl} avatarRef={avatarRef} onAvatarUpload={handleAvatarUpload} />

          <div className="space-y-6">
            <UserInfoCard profile={profile} />
            {user?.role !== 'admin' && (
              <ContactInfoCard
                phone={phone} whatsapp={whatsapp} secEmail={secEmail}
                saving={savingContact}
                onPhone={setPhone} onWhatsapp={setWhatsapp} onSecEmail={setSecEmail}
                onSave={saveContact}
              />
            )}
            <ChangePasswordCard
              currentPass={currentPass} newPass={newPass} confirmPass={confirmPass}
              saving={savingPass}
              onCurrent={setCurrentPass} onNew={setNewPass} onConfirm={setConfirmPass}
              onSave={changePassword}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
