import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Global state providers — these wrap everything so any component can access them
import { AuthProvider } from './services/AuthContext';   // Who is logged in?
import { ThemeProvider } from './services/ThemeContext'; // Light/dark mode + accent color
import { ToastProvider } from './components/Toast';      // Pop-up notification system

// Shared UI components shown on every page
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import Footer from './components/Footer';

// One import per page/route
import HomePage from './pages/home/HomePage';
import AuthPage from './pages/auth/AuthPage';
import BrowsePage from './pages/browse/BrowsePage';
import SellPage from './pages/sell/SellPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminPage from './pages/admin/AdminPage';

// CSS animation for when a new page slides into view
// Defined as a string so we can inject it via a <style> tag inside JSX
const pageTransitionStyle = `
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-enter {
    animation: pageEnter 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
`;

/**
 * Layout — The actual page shell
 * ───────────────────────────────
 * Renders the Navbar, the current page, and the Footer.
 * Also handles:
 *   - Scroll-to-top on every route change
 *   - Special full-screen layout for /auth
 *   - Hiding Navbar + Footer on /admin (admin has its own header)
 */
function Layout() {
  const location = useLocation(); // current URL path
  const isAuth = location.pathname === '/auth';

  // Admin page has its own full-screen header, so hide the shared Navbar and Footer
  const hideNavFooter = ['/admin'].includes(location.pathname);

  // Scroll to top of page whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // The auth page has a special layout: full viewport height, no footer, overflow hidden
  // (so the login card doesn't scroll weirdly on mobile)
  if (isAuth) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <style>{pageTransitionStyle}</style>
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Standard layout: Navbar on top, page content in the middle, Footer at bottom
  return (
    <div className="flex flex-col min-h-screen">
      <style>{pageTransitionStyle}</style>

      {/* Hide Navbar on admin page (admin has its own header) */}
      {!hideNavFooter && <Navbar />}

      <main className="flex-1">
        {/* key={location.pathname} forces re-mount on route change → triggers page enter animation */}
        <div key={location.pathname} className="page-enter">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </main>

      {/* Hide footer on admin page and on auth page */}
      {(!hideNavFooter && !['/auth'].includes(location.pathname)) && <Footer />}

      {/* Floating scroll-to-top button — appears after scrolling down */}
      <ScrollToTopButton />
    </div>
  );
}

/**
 * App — The root component
 * ─────────────────────────
 * Wraps everything in providers (context + router) so every child
 * component can access auth, theme, toasts, and routing.
 *
 * Provider order matters:
 *   BrowserRouter must be outermost (routing)
 *   AuthProvider next (other providers may need auth state)
 *   ThemeProvider + ToastProvider are independent, order doesn't matter
 */
function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>       {/* Global: who is logged in */}
        <ThemeProvider>    {/* Global: light/dark + accent color */}
          <ToastProvider>  {/* Global: pop-up notifications */}
            <Layout />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
