import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../services/ThemeContext';
import AuthLeftPanel from './AuthLeftPanel';
import AuthModeTabs from './AuthModeTabs';
import AuthHeading from './AuthHeading';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export default function AuthPage() {
  const [mode, setMode] = useState(
    () => localStorage.getItem('authTab') || 'login'
  );
  const { user }        = useAuth();
  const { theme }       = useTheme();
  const navigate        = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/');
  }, [user, navigate]);

  return (
    <div className="h-full overflow-hidden flex">
      <AuthLeftPanel mode={mode} />

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex-1 h-full overflow-y-auto bg-bg">
        <div className="flex flex-col min-h-full items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-[420px] py-4">
            <div className="bg-surface rounded-2xl shadow-xl border border-border p-7 sm:p-8 flex flex-col">

              <AuthModeTabs mode={mode} onModeChange={m => { setMode(m); localStorage.setItem('authTab', m); }} />
              <AuthHeading mode={mode} />

              {mode === 'login'
                ? <LoginForm  onSwitchMode={() => { setMode('signup'); localStorage.setItem('authTab', 'signup'); }} />
                : <SignUpForm onSwitchMode={() => { setMode('login');  localStorage.setItem('authTab', 'login');  }} />
              }

              <div className="mt-5 pt-4 border-t border-border text-center text-[10px] text-ink-3">
                © 2026 NIT KKR Marketplace — Campus Exclusive
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
