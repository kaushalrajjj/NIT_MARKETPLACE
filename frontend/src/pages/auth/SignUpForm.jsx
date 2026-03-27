import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../services/ThemeContext';
import ThemedIcon from '../../components/ThemedIcon';
import Field, { inputCls } from './Field';
import SelectField from './SelectField';
import OtpStep from './OtpStep';

const BRANCHES      = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'SET', 'ADS', 'MNC', 'AIML', 'PIE', 'VLSI', 'RA', 'IIOT', 'BArch'];
const BOYS_HOSTELS  = ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11'];
const GIRLS_HOSTELS = ['KALPANA CHAWLA','BHAGIRATHI','CAUVERY','ALAKNANDA'];
const YEARS         = [1, 2, 3, 4, 5];

export default function SignUpForm({ onSwitchMode }) {
  const STORAGE_KEY = 'signupFormDraft';

  const loadDraft = () => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  };

  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState(() => {
    const draft = loadDraft();
    return {
      name: draft.name || '', email: draft.email || '', rollNo: draft.rollNo || '',
      branch: draft.branch || '', year: draft.year || '', hostel: draft.hostel || '',
      mobileNo: draft.mobileNo || '', password: '', confirmPassword: ''
    };
  });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]   = useState('');
  const [resendCd, setResendCd]   = useState(0);
  const [expirySec, setExpirySec] = useState(600); // 10 min — matches backend
  const { loginUser }             = useAuth();
  const { showToast }             = useToast();
  const { theme }                 = useTheme();
  const navigate                  = useNavigate();
  const otpRefs                   = Array.from({ length: 6 }, () => React.useRef(null));

  const set = (key) => (e) => setForm((f) => {
    const updated = { ...f, [key]: e.target.value };

    // Auto-fill roll number from email (format: rollno@nitkkr.ac.in)
    if (key === 'email') {
      const local = e.target.value.split('@')[0];
      if (/^\d{5,9}$/.test(local)) {
        updated.rollNo = local;
      }
    }

    // Persist non-sensitive fields only
    const { password: _p, confirmPassword: _c, ...safe } = updated;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    return updated;
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                                   errs.name            = 'Full name is required';
    if (!form.email.endsWith('@nitkkr.ac.in'))               errs.email           = 'Must be a @nitkkr.ac.in email';
    if (!/^[0-9]{5,9}$/.test(form.rollNo))                  errs.rollNo          = 'Roll number must be 5-9 digits';
    if (!form.branch)                                        errs.branch          = 'Please select a branch';
    if (!form.year)                                          errs.year            = 'Please select your year';
    if (!form.hostel)                                        errs.hostel          = 'Please select a hostel';
    if (!/^[0-9]{10}$/.test(form.mobileNo))                 errs.mobileNo        = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 6 || form.password.length > 12) errs.password     = 'Password must be 6–12 characters';
    if (form.password !== form.confirmPassword)              errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.sendOtp(form.email);
      showToast(`OTP sent to ${form.email}`, 'success');
      setStep(2);
      setResendCd(60);
      setExpirySec(600);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend cooldown & expiry countdown ── */
  React.useEffect(() => {
    if (step !== 2) return;
    const id = setInterval(() => {
      setResendCd((c) => Math.max(0, c - 1));
      setExpirySec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  /* ── OTP digit handlers ── */
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    setOtpError('');
    if (val && idx < 5) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  /* ── Step 2: Verify OTP & register ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) { setOtpError('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      payload.year       = Number(payload.year);
      payload.whatsappNo = payload.mobileNo;
      const data = await api.verifyOtpAndRegister(payload, otp);
      if (data.token) {
        loginUser(data);
        sessionStorage.removeItem(STORAGE_KEY);
        showToast('Account created! Welcome 🎉', 'success');
        setTimeout(() => navigate('/'), 800);
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCd > 0) return;
    setLoading(true);
    try {
      await api.sendOtp(form.email);
      showToast('New OTP sent!', 'success');
      setResendCd(60);
      setExpirySec(600);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      otpRefs[0].current?.focus();
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2 UI ── */
  if (step === 2) {
    return (
      <OtpStep
        email={form.email}
        otpDigits={otpDigits}
        otpRefs={otpRefs}
        otpError={otpError}
        expirySec={expirySec}
        resendCd={resendCd}
        loading={loading}
        onOtpChange={handleOtpChange}
        onOtpKeyDown={handleOtpKeyDown}
        onOtpPaste={handleOtpPaste}
        onVerify={handleVerify}
        onBack={() => setStep(1)}
        onResend={handleResend}
      />
    );
  }

  /* ── Step 1 UI ── */
  return (
    <form onSubmit={handleSendOtp} className="space-y-3 flex-1">
      <Field label="Full Name" icon="profile" error={errors.name}>
        <input type="text" value={form.name} onChange={set('name')} placeholder="Enter Your Name" className={inputCls('profile', errors.name)} />
      </Field>

      <Field label="NIT Email Address" icon="email" error={errors.email}>
        <input type="email" value={form.email} onChange={set('email')} placeholder="roll@nitkkr.ac.in" className={inputCls('email', errors.email)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Roll Number" error={errors.rollNo}>
          <input type="text" value={form.rollNo} onChange={set('rollNo')} placeholder="e.g. 124102066" className={inputCls('', errors.rollNo)} />
        </Field>
        <SelectField label="Branch" error={errors.branch} value={form.branch} onChange={set('branch')}>
          <option value="">Select Branch</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </SelectField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Year" error={errors.year} value={form.year} onChange={set('year')}>
          <option value="">Select Year</option>
          {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
        </SelectField>
        <SelectField label="Hostel" error={errors.hostel} value={form.hostel} onChange={set('hostel')}>
          <option value="">Select Hostel</option>
          <optgroup label="── Boys Hostels">
            {BOYS_HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
          </optgroup>
          <optgroup label="── Girls Hostels">
            {GIRLS_HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
          </optgroup>
        </SelectField>
      </div>

      <Field label="Mobile Number" icon="phone" error={errors.mobileNo}>
        <input type="tel" value={form.mobileNo} onChange={set('mobileNo')} placeholder="Enter Phone Number" className={inputCls('phone', errors.mobileNo)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Password" icon="lock" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} placeholder="6–12 chars" className={inputCls('lock', errors.password)} />
        </Field>
        <Field label="Confirm Password" icon="lock" error={errors.confirmPassword}>
          <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Confirm Password" className={inputCls('lock', errors.confirmPassword)} />
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 text-white font-extrabold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[14px] tracking-wide uppercase hover:opacity-90"
        style={{ backgroundColor: loading ? '#9ca3af' : theme.pri, boxShadow: loading ? 'none' : `0 8px 25px ${theme.pri}55` }}
      >
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><ThemedIcon name="email" size={18} color="#ffffff" /> Send OTP to Email</>}
      </button>

      <p className="text-center text-xs text-ink-3 pt-1">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchMode} className="font-semibold hover:underline" style={{ color: theme.pri }}>
          Sign in
        </button>
      </p>
    </form>
  );
}
