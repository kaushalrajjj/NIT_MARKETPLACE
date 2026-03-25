import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../services/ThemeContext';
import ThemedIcon from '../components/ThemedIcon';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const { loginUser, user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const validateEmail = (val) => {
    setEmailErr(val.length > 0 && !val.endsWith('@nitkkr.ac.in'));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please enter both email and password', 'error'); return; }
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.token) {
        loginUser(data);
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
    <div className="min-h-screen flex">
      {/* ═══ LEFT PANEL ═══ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden text-white" style={{ backgroundColor: theme.pri }}>
        {/* Animated blobs */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 -top-32 -left-32 animate-pulse bg-white/20 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 bottom-20 right-0 animate-pulse bg-white/10 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 top-1/2 left-1/3 animate-pulse bg-black/20 blur-3xl" style={{ animationDelay: '0.5s' }} />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 max-w-xl">
          <h2 className="text-[2.5rem] lg:text-[2.8rem] font-extrabold leading-[1.1]">
            The Smarter Way<br />to Trade <span className="text-acc">on Campus</span>
          </h2>
          <p className="mt-6 text-blue-200/80 text-base leading-relaxed">
            Join 1,800+ NIT Kurukshetra students buying, selling, and exchanging items safely within campus. Verified profiles. Zero commission.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <ThemedIcon name="check" size={24} className="text-emerald-400" />
              <span className="text-sm text-gray-200"><strong>Verified Users</strong> only with @nitkkr email</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemedIcon name="deal" size={24} className="text-amber-400" />
              <span className="text-sm text-gray-200"><strong>Face-to-Face</strong> deals in campus hostels</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemedIcon name="rupee" size={24} className="text-blue-300" />
              <span className="text-sm text-gray-200"><strong>Zero Commission</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-bg">
        <div className="w-full max-w-[420px]">
          <div className="bg-surface rounded-[20px] shadow-xl border border-border p-8 sm:p-10 flex flex-col">

            <div className="mb-7">
              <h1 className="text-[1.5rem] font-extrabold text-ink">Welcome</h1>
              <p className="text-sm text-pri/70 mt-1">Login to your campus marketplace account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 flex-1">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">NIT Email Address</label>
                <div className="relative">
                  <ThemedIcon name="email" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" color={theme.pri} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                    placeholder="yourname@nitkkr.ac.in"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 transition-all
                      ${emailErr ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-pri/20 focus:border-pri'}`}
                  />
                </div>
                {emailErr && <p className="text-xs text-acc-red mt-1.5 font-medium">Please login with institute ID</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">Password</label>
                <div className="relative">
                  <ThemedIcon name="lock" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" color={theme.pri} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 focus:border-pri transition-all"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rememberMe" className="rounded border-border text-pri focus:ring-pri/30" />
                <label htmlFor="rememberMe" className="text-sm text-ink-3 cursor-pointer">Remember me on this device</label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white font-extrabold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px] tracking-wide uppercase hover:opacity-90"
                style={{
                  backgroundColor: loading ? '#9ca3af' : theme.pri,
                  boxShadow: loading ? 'none' : `0 8px 25px ${theme.pri}55`,
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ThemedIcon name="login" size={20} color="#ffffff" /> Sign In</>
                )}
              </button>
            </form>

            <div className="mt-auto pt-8 text-center text-[11px] text-ink-3">
              © 2026 NIT KKR Marketplace — Campus Exclusive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
