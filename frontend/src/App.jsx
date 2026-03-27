import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import { ThemeProvider } from './services/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import Footer from './components/Footer';
import HomePage from './pages/home/HomePage';
import AuthPage from './pages/auth/AuthPage';
import BrowsePage from './pages/browse/BrowsePage';
import SellPage from './pages/sell/SellPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminPage from './pages/admin/AdminPage';

const pageTransitionStyle = `
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-enter {
    animation: pageEnter 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
`;

function Layout() {
  const location = useLocation();
  const isAuth = location.pathname === '/auth';
  const hideNavFooter = ['/admin'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auth page needs its own full-screen layout (with Navbar but no footer wrapper)
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

  return (
    <div className="flex flex-col min-h-screen">
      <style>{pageTransitionStyle}</style>
      {!hideNavFooter && <Navbar />}
      <main className="flex-1">
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
      {(!hideNavFooter && !['/auth'].includes(location.pathname)) && <Footer />}
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Layout />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
