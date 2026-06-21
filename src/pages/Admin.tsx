import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminContacts from '@/components/admin/AdminContacts';
import AdminBlog from '@/components/admin/AdminBlog';
import AdminPortfolio from '@/components/admin/AdminPortfolio';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminEmail from '@/components/admin/AdminEmail';
import AdminDatabase from '@/components/admin/AdminDatabase';
import AdminSecurity from '@/components/admin/AdminSecurity';
import AdminSettings from '@/components/admin/AdminSettings';

const Admin: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route
          path="motion"
          element={
            <AdminPortfolio
              initialCategory="motion"
              title="Motion Management"
              description="Manage motion, video, and YouTube portfolio entries"
            />
          }
        />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="email" element={<AdminEmail />} />
        <Route path="database" element={<AdminDatabase />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default Admin;
