import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import { adminPath, isAdminHostname } from '@/lib/admin-routing';

const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const AdminContacts = lazy(() => import('@/components/admin/AdminContacts'));
const AdminBlog = lazy(() => import('@/components/admin/AdminBlog'));
const AdminPortfolio = lazy(() => import('@/components/admin/AdminPortfolio'));
const AdminGalleries = lazy(() => import('@/components/admin/AdminGalleries'));
const AdminCampaigns = lazy(() => import('@/components/admin/AdminCampaigns'));
const AdminShop = lazy(() => import('@/components/admin/AdminShop'));
const AdminContracts = lazy(() => import('@/components/admin/AdminContracts'));
const AdminPages = lazy(() => import('@/components/admin/AdminPages'));
const AdminAnalytics = lazy(() => import('@/components/admin/AdminAnalytics'));
const AdminEmail = lazy(() => import('@/components/admin/AdminEmail'));
const AdminDatabase = lazy(() => import('@/components/admin/AdminDatabase'));
const AdminSecurity = lazy(() => import('@/components/admin/AdminSecurity'));
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings'));
const GrowthOverview = lazy(() => import('@/components/admin/growth/GrowthOverview'));
const FunnelDashboard = lazy(() => import('@/components/admin/growth/FunnelDashboard'));
const BookingsDashboard = lazy(() => import('@/components/admin/growth/BookingsDashboard'));
const GrowthWorkspace = lazy(() => import('@/components/admin/growth/GrowthWorkspace'));
const AdminSEO = lazy(() => import('@/components/admin/AdminSEO'));
const AdminHero = lazy(() => import('@/components/admin/AdminHero'));

const AdminLoading = () => (
  <div className="flex min-h-64 items-center justify-center text-sm text-slate-500" role="status">
    Loading command center…
  </div>
);

const Admin: React.FC = () => {
  const base = isAdminHostname() ? '' : '/admin';
  const route = (path: string) => `${base}/${path}`.replace(/\/+/g, '/');

  return (
    <Suspense fallback={<AdminLoading />}>
      <Routes>
      <Route path={route('login')} element={<AdminLogin />} />
      <Route path={route('')} element={<AdminLayout />}>
        <Route index element={<Navigate to={adminPath('overview')} replace />} />
        <Route path="overview" element={<GrowthOverview />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="leads" element={<AdminContacts />} />
        <Route path="contacts" element={<Navigate to={adminPath('leads')} replace />} />
        <Route path="bookings" element={<BookingsDashboard />} />
        <Route path="funnels" element={<FunnelDashboard />} />
        <Route path="search" element={<><AdminSEO /><div className="mt-8"><GrowthWorkspace kind="search" /></div></>} />
        <Route path="ai-visibility" element={<GrowthWorkspace kind="ai" />} />
        <Route path="competitors" element={<GrowthWorkspace kind="competitors" />} />
        <Route path="recommendations" element={<GrowthWorkspace kind="recommendations" />} />
        <Route path="local-authority" element={<GrowthWorkspace kind="authority" />} />
        <Route path="content-opportunities" element={<GrowthWorkspace kind="content" />} />
        <Route path="webmcp" element={<GrowthWorkspace kind="webmcp" />} />
        <Route path="performance" element={<GrowthWorkspace kind="performance" />} />
        <Route path="site-health" element={<GrowthWorkspace kind="site-health" />} />
        <Route path="portfolio-content" element={<AdminPortfolio />} />
        <Route path="galleries" element={<AdminGalleries />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="shop" element={<AdminShop />} />
        <Route path="contracts" element={<AdminContracts />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="portfolio" element={<Navigate to={adminPath('portfolio-content')} replace />} />
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
        <Route path="hero" element={<AdminHero />} />
      </Route>
      <Route path="*" element={<Navigate to={adminPath('overview')} replace />} />
      </Routes>
    </Suspense>
  );
};

export default Admin;
