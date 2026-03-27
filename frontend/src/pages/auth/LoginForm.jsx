import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../services/ThemeContext';
import ThemedIcon from '../../components/ThemedIcon';
import Field, { inputCls } from './Field';

export default function LoginForm({ onSwitchMode }) {
  const [email, setEmail]       = useState(() => sessionStorage.getItem('loginEmail') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const { loginUser }           = useAuth();
  const { showToast }           = useToast();
  const { theme }               = useTheme();
  const navigate                = useNavigate();

  const validateEmail = (v) => setEmailErr(v.length > 0 && !v.endsWith('@nitkkr.ac.in'));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please enter both email and password', 'error'); return; }
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.token) {
        loginUser(data);
        sessionStorage.removeItem('loginEmail');
        showToast('Login success!', 'success');
        setTimeout(() => navigate(data.role === 'admin' ? '/admin' : '/'), 600);
      } else {
        showToast(data.message || 'Some error occurred', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Some error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 flex-1">
      <Field label="NIT Email Address" icon="email" error={emailErr ? 'Please login with institute ID' : ''}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); sessionStorage.setItem('loginEmail', e.target.value); validateEmail(e.target.value); }}
          placeholder="yourname@nitkkr.ac.in"
          className={inputCls('email', emailErr)}
        />
      </Field>

      <Field label="Password" icon="lock">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className={inputCls('lock', false)}
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 text-white font-extrabold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[14px] tracking-wide uppercase hover:opacity-90"
        style={{ backgroundColor: loading ? '#9ca3af' : theme.pri, boxShadow: loading ? 'none' : `0 8px 25px ${theme.pri}55` }}
      >
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><ThemedIcon name="login" size={18} color="#ffffff" /> Sign In</>}
      </button>

      <p className="text-center text-xs text-ink-3 pt-1">
        New to campus marketplace?{' '}
        <button type="button" onClick={onSwitchMode} className="font-semibold hover:underline" style={{ color: theme.pri }}>
          Create an account
        </button>
      </p>
    </form>
  );
}
