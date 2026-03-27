import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import AvatarCard from './AvatarCard';
import UserInfoCard from './UserInfoCard';
import ContactInfoCard from './ContactInfoCard';
import ChangePasswordCard from './ChangePasswordCard';

const OTP_LENGTH = 6;
const OTP_EXPIRE_SEC = 10 * 60; // 10 minutes (matches backend)
const RESEND_COOLDOWN_SEC = 60;  // 1 minute resend cooldown

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  // ── Profile data ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [secEmail, setSecEmail] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // ── Password change — step 1 ──────────────────────────────────────────────
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // ── Password change — step 2 (OTP) ───────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState(null);
  const [expirySec, setExpirySec] = useState(0);
  const [resendCd, setResendCd] = useState(0);

  // Refs for OTP input boxes (single ref holding an array to respect rules of hooks)
  const otpRefsArr = useRef([]);
  if (otpRefsArr.current.length !== OTP_LENGTH) {
    otpRefsArr.current = Array.from({ length: OTP_LENGTH }, () => React.createRef());
  }

  // Countdown timer for OTP expiry
  const expiryTimerRef = useRef(null);
  const resendTimerRef = useRef(null);

  function startExpiryCountdown() {
    clearInterval(expiryTimerRef.current);
    setExpirySec(OTP_EXPIRE_SEC);
    expiryTimerRef.current = setInterval(() => {
      setExpirySec(s => {
        if (s <= 1) { clearInterval(expiryTimerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function startResendCooldown() {
    clearInterval(resendTimerRef.current);
    setResendCd(RESEND_COOLDOWN_SEC);
    resendTimerRef.current = setInterval(() => {
      setResendCd(s => {
        if (s <= 1) { clearInterval(resendTimerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(expiryTimerRef.current);
      clearInterval(resendTimerRef.current);
    };
  }, []);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [userData, actData] = await Promise.all([api.fetchMe(user.token), api.fetchActivity(user.token)]);
      setProfile(userData);
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

  // ── Contact save ──────────────────────────────────────────────────────────
  const saveContact = async () => {
    setSavingContact(true);
    try {
      await api.updateMe({ mobileNo: phone.trim(), whatsappNo: whatsapp.trim(), secondaryEmail: secEmail.trim() }, user.token);
      showToast('Contact info saved', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSavingContact(false); }
  };

  // ── Password change step 1: send OTP ─────────────────────────────────────
  const handleSendOtp = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showToast('Please fill all password fields.', 'error'); return;
    }
    if (newPass === currentPass) {
      showToast('New password must be different from your current password.', 'error'); return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error'); return;
    }
    if (newPass.length < 6 || newPass.length > 12) {
      showToast('Password must be 6–12 characters.', 'error'); return;
    }
    setSavingPass(true);
    try {
      await api.sendPasswordChangeOtp(currentPass, user.token);
      setOtpSent(true);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      startExpiryCountdown();
      startResendCooldown();
      showToast('OTP sent to your registered email!', 'success');
      setTimeout(() => otpRefsArr.current[0]?.current?.focus(), 100);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP.', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    setOtpError(null);
    if (digit && idx < OTP_LENGTH - 1) otpRefsArr.current[idx + 1]?.current?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefsArr.current[idx - 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    [...text].forEach((c, i) => { next[i] = c; });
    setOtpDigits(next);
    setOtpError(null);
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    otpRefsArr.current[focusIdx]?.current?.focus();
  };

  // ── Password change step 2: verify OTP ───────────────────────────────────
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      setOtpError('Please enter all 6 digits.'); return;
    }
    setSavingPass(true);
    try {
      await api.verifyOtpAndChangePassword(otp, newPass, user.token);
      showToast('Password changed successfully!', 'success');
      // Reset everything
      setOtpSent(false);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      clearInterval(expiryTimerRef.current);
      clearInterval(resendTimerRef.current);
      setExpirySec(0); setResendCd(0);
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed.');
    } finally {
      setSavingPass(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setSavingPass(true);
    try {
      await api.sendPasswordChangeOtp(currentPass, user.token);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      startExpiryCountdown();
      startResendCooldown();
      showToast('OTP resent!', 'success');
      setTimeout(() => otpRefsArr.current[0]?.current?.focus(), 100);
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP.', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  // ── Back to step 1 ────────────────────────────────────────────────────────
  const handleBack = () => {
    setOtpSent(false);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpError(null);
    clearInterval(expiryTimerRef.current);
    clearInterval(resendTimerRef.current);
    setExpirySec(0); setResendCd(0);
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
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
              otpRefs={otpRefsArr.current}
              otpSent={otpSent}
              otpDigits={otpDigits}
              otpError={otpError}
              expirySec={expirySec}
              resendCd={resendCd}
              onCurrent={setCurrentPass} onNew={setNewPass} onConfirm={setConfirmPass}
              onSendOtp={handleSendOtp}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onOtpPaste={handleOtpPaste}
              onVerifyOtp={handleVerifyOtp}
              onResend={handleResend}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
