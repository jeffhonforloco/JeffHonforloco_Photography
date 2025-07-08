import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminHero from '../components/admin/AdminHero';
import AdminPortfolio from '../components/admin/AdminPortfolio';
import AdminMotion from '../components/admin/AdminMotion';
import AdminBlog from '../components/admin/AdminBlog';
import AdminNavigation from '../components/admin/AdminNavigation';
import AdminSEO from '../components/admin/AdminSEO';
import AdminContacts from '../components/admin/AdminContacts';
import AdminSettings from '../components/admin/AdminSettings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminLogin from '../components/admin/AdminLogin';
import { authSecurity } from '../lib/auth-security';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authSecurity.isAuthenticated();
  });

  // Check authentication status periodically
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authSecurity.isAuthenticated();
      if (authStatus !== isAuthenticated) {
        setIsAuthenticated(authStatus);
      }
    };

    // Check authentication every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    
    // Check on focus/visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    authSecurity.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/hero" element={<AdminHero />} />
        <Route path="/portfolio" element={<AdminPortfolio />} />
        <Route path="/motion" element={<AdminMotion />} />
        <Route path="/blog" element={<AdminBlog />} />
        <Route path="/navigation" element={<AdminNavigation />} />
        <Route path="/seo" element={<AdminSEO />} />
        <Route path="/contacts" element={<AdminContacts />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;