import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import { ThemeProvider } from './services/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import BrowsePage from './pages/BrowsePage';
import SellPage from './pages/SellPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

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
  const hideNavFooter = ['/auth', '/admin'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      {!hideNavFooter && <Footer />}
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
