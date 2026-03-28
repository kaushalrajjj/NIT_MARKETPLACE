import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import { getOptimizedImageUrl } from '../services/helpers';
import ThemedIcon from './ThemedIcon';

const sidebarAnimStyles = `
  @keyframes navItemIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes themePanelIn {
    from { opacity: 0; transform: scale(0.92) translateX(-6px); }
    to   { opacity: 1; transform: scale(1) translateX(0); }
  }
  @keyframes sidebarAvatarIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

export default function Sidebar({ isOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const { theme, themeName, changeTheme, THEMES } = useTheme();
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [themePanelStyle, setThemePanelStyle] = useState({});
  const themeBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItemStyle = (index) => ({
    animation: isOpen ? `navItemIn 0.28s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.045}s both` : 'none',
  });

  React.useEffect(() => {
    if (!isOpen) setShowThemePanel(false);
  }, [isOpen]);

  const handleThemeToggle = (e) => {
    e.stopPropagation();
    if (!showThemePanel && themeBtnRef.current) {
      const btnRect = themeBtnRef.current.getBoundingClientRect();
      // Always pin to right edge of screen
      setThemePanelStyle({
        position: 'fixed',
        right: '12px',
        top: `${btnRect.bottom + 8}px`,
        left: 'auto',
      });
    }
    setShowThemePanel(prev => !prev);
  };
  const initial = user ? user.name?.charAt(0).toUpperCase() : '?';
  const name = user ? user.name : 'Guest User';
  const role = user ? 'NIT KKR Student' : 'Login to sell items';

  const avatarImg = (user?.profileImage || user?.img) ? getOptimizedImageUrl(user?.profileImage || user?.img, 120) : null;

  const handleLogout = () => {
    logoutUser();
    onClose();
    navigate('/auth');
  };

  const navLink = (href, iconName, label) => {
    const isInternal = href.startsWith('/');
    const targetUrl = isInternal ? new URL(href, window.location.origin) : null;
    
    let active = false;
    if (isInternal) {
      const isPathMatch = location.pathname === targetUrl.pathname;
      const targetTab = targetUrl.searchParams.get('tab');
      const currentTab = new URLSearchParams(location.search).get('tab');
      
      // If href has a tab, we need a hard match on the tab.
      if (targetTab) {
        active = isPathMatch && currentTab === targetTab;
      } else {
        // If href has NO tab (main dashboard), we only match if currentTab is ALSO null
        active = isPathMatch && !currentTab;
      }
    }

    return (
      <Link
        to={href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 text-[14px] font-medium rounded-xl transition-all mx-2`}
        style={active ? { background: theme.pri, color: '#ffffff' } : { color: theme.text2 }}
        onMouseEnter={!active ? e => { e.currentTarget.style.background = theme.priLight; e.currentTarget.style.color = theme.pri; } : undefined}
        onMouseLeave={!active ? e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.text2; } : undefined}
      >
        <ThemedIcon name={iconName} size={20} color={active ? '#ffffff' : theme.pri} fill={false} />
        {label}
      </Link>
    );
  };

  return (
    <>
      <style>{sidebarAnimStyles}</style>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] shadow-2xl z-[999] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: theme.surface,
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10">
              <img src="/assets/siteFavicon.png" alt="Logo" className="w-full h-full rounded-lg object-contain" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: theme.surface2, color: theme.text3, transition: 'transform 0.15s ease, background 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
              title="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3 py-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.pri}, ${theme.priDark})`,
                animation: isOpen ? 'sidebarAvatarIn 0.35s cubic-bezier(0.22,1,0.36,1) 0.06s both' : 'none',
              }}
            >
              {avatarImg ? (
                <img src={avatarImg} alt="Me" className="w-full h-full object-cover rounded-full" />
              ) : initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm truncate" style={{ color: theme.text }}>{name}</div>
                {/* Theme trigger dot */}
                <div className="relative">
                    <button
                      ref={themeBtnRef}
                      onClick={handleThemeToggle}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: theme.color }}
                      title="Change Theme"
                    />
                  {/* Theme sub-panel – smart positioned */}
                  {showThemePanel && (
                    <div
                      className="p-4 rounded-2xl shadow-2xl z-[1050] min-w-[220px]"
                      style={{
                        ...themePanelStyle,
                        position: themePanelStyle.position || 'absolute',
                        backgroundColor: theme.surface,
                        border: `1px solid ${theme.border}`,
                        animation: 'themePanelIn 0.22s cubic-bezier(0.22,1,0.36,1) both',
                      }}
                    >
                      <div className="font-bold text-sm mb-3" style={{ color: theme.text }}>Select Theme</div>
                      <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                        {Object.entries(THEMES).map(([key, t]) => (
                          <div key={key} className="flex justify-center">
                            <button
                              onClick={() => { changeTheme(key); }}
                              className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${themeName === key ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                              style={{
                                background: t.color,
                                ringColor: t.pri,
                              }}
                              title={t.name}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs" style={{ color: theme.text3 }}>{role}</div>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: theme.border }} className="my-2" />

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-1">
          {[['/', 'home', 'Home'], ['/browse', 'browse', 'Browse Items'], ['/sell', 'sell', 'Sell an Item']].map(([href, icon, label], i) => (
            <div key={href} style={navItemStyle(i)}>{navLink(href, icon, label)}</div>
          ))}
          {user && <div style={navItemStyle(3)}>{navLink('/dashboard', 'dashboard', 'Dashboard')}</div>}
          {user?.role === 'admin' && (
            <div style={navItemStyle(4)}>
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold rounded-xl transition-all mx-2"
                style={{ color: theme.pri }}
                onMouseEnter={e => e.currentTarget.style.background = theme.priLight}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ThemedIcon name="admin" size={20} color={theme.pri} fill={false} /> Admin Panel
              </Link>
            </div>
          )}
          {[...(user ? [['/dashboard?tab=wishlist', 'wishlist', 'Wishlist']] : []), ['/profile', 'profile', 'My Profile']].map(([href, icon, label], i) => (
            <div key={href} style={navItemStyle((user ? 5 : 3) + i)}>{navLink(href, icon, label)}</div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <ThemedIcon name="logout" size={18} color="#ef4444" /> Log Out
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: theme.pri }}
            >
              <ThemedIcon name="login" size={18} color="#ffffff" /> Account Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
