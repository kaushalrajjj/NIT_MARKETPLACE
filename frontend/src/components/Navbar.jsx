import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemedIcon from './ThemedIcon';
import { useAuth } from '../services/AuthContext';
import { getOptimizedImageUrl } from '../services/helpers';
import Sidebar from './Sidebar';

export default function Navbar() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const navClass = (path) => `px-3 py-1.5 rounded-lg transition-colors ${location.pathname === path ? 'bg-white/20 text-white font-bold shadow-sm' : 'hover:bg-white/10 hover:text-white'}`;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/browse?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  const avatarImg = (user?.profileImage || user?.img) ? getOptimizedImageUrl(user?.profileImage || user?.img, 100) : null;
  const initial = user ? user.name?.charAt(0).toUpperCase() : '?';

  return (
    <>
      <header className="sticky top-0 z-50 bg-pri-deep backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center h-[60px] gap-3">

          {/* Hamburger - 3 lines like original */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            title="Menu"
          >
            <span className="block w-[18px] h-[2px] bg-white/75 rounded-full" />
            <span className="block w-[18px] h-[2px] bg-white/75 rounded-full" />
            <span className="block w-[18px] h-[2px] bg-white/75 rounded-full" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 no-underline">
            <img src="/assets/siteFavicon.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-extrabold text-white tracking-tight">KKR MarketPlace</div>
              <div className="text-[10px] text-white/50 font-medium -mt-0.5">NIT Kurukshetra</div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-3 hidden md:flex items-center bg-white/10 border border-white/20 rounded-xl px-3 h-[38px] focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/10 transition-all">
            <ThemedIcon name="search" size={16} color="#ffffff" className="opacity-60 mr-2" />
            <input
              type="text"
              placeholder="Search books, electronics, cycles..."
              onKeyUp={handleSearch}
              className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-white/40"
            />
          </div>

          {/* Nav Links */}
          <ul className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-white/70 ml-auto">
            <li><Link to="/" className={navClass('/')}>Home</Link></li>
            <li><Link to="/browse" className={navClass('/browse')}>Browse</Link></li>
            {user?.role === 'admin' && (
              <li><Link to="/admin" className={`px-3 py-1.5 rounded-lg text-acc font-bold transition-colors ${location.pathname === '/admin' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}>Admin</Link></li>
            )}
            <li><Link to="/dashboard" className={navClass('/dashboard')}>Dashboard</Link></li>
            <li><Link to="/profile" className={navClass('/profile')}>Profile</Link></li>
            <li>
              <button
                onClick={() => document.getElementById('footer-root')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Right: Profile / Login */}
          <div className="flex items-center ml-auto lg:ml-3 flex-shrink-0">
            {user ? (
              <div className="relative group">
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer overflow-hidden border-2 border-white shadow-md"
                  title={user.name}
                >
                  {avatarImg ? (
                    <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : initial}
                </div>
                {/* Hover Card */}
                <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-surface rounded-xl shadow-xl border border-border px-4 py-3 min-w-[160px]">
                    <div className="font-bold text-sm text-ink">{user.name}</div>
                    <div className="text-xs text-ink-3">{user.rollNo || 'NIT KKR Student'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-[7px] bg-pri text-white text-xs font-bold rounded-[10px] hover:bg-pri-dark transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
