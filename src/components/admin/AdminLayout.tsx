import React, { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, BookOpenCheck, Bot, BriefcaseBusiness, CalendarCheck,
  ChartNoAxesCombined, ChevronRight, FileText, Gauge, Globe2, Image, LayoutDashboard,
  Lightbulb, LogOut, Mail, MapPinned, Menu, Search, Settings, Shield, Users, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminPath } from '@/lib/admin-routing';

interface AdminUser { id: number; username: string; role: string }

const navigation = [
  { label: 'Command', items: [
    { name: 'Overview', path: 'overview', icon: LayoutDashboard },
    { name: 'Leads', path: 'leads', icon: Users },
    { name: 'Bookings', path: 'bookings', icon: CalendarCheck },
    { name: 'Funnels', path: 'funnels', icon: ChartNoAxesCombined },
  ] },
  { label: 'Discovery', items: [
    { name: 'Search & SEO', path: 'search', icon: Search },
    { name: 'AI Visibility', path: 'ai-visibility', icon: Bot },
    { name: 'Competitors', path: 'competitors', icon: Globe2 },
    { name: 'Recommendations', path: 'recommendations', icon: Lightbulb },
    { name: 'Local Authority', path: 'local-authority', icon: MapPinned },
    { name: 'Content Opportunities', path: 'content-opportunities', icon: FileText },
  ] },
  { label: 'Health', items: [
    { name: 'WebMCP', path: 'webmcp', icon: Bot },
    { name: 'Performance', path: 'performance', icon: Gauge },
    { name: 'Site Health', path: 'site-health', icon: Activity },
  ] },
  { label: 'Operations', items: [
    { name: 'Portfolio / Content', path: 'portfolio-content', icon: Image },
    { name: 'Journal', path: 'blog', icon: BookOpenCheck },
    { name: 'Analytics (legacy)', path: 'analytics', icon: BarChart3 },
    { name: 'Email / Follow-up', path: 'email', icon: Mail },
    { name: 'Database', path: 'database', icon: BriefcaseBusiness },
    { name: 'Security', path: 'security', icon: Shield },
    { name: 'Settings', path: 'settings', icon: Settings },
  ] },
] as const;

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const clearSession = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate(adminPath('login'), { replace: true });
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/v1/admin-auth/verify', { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Session expired');
      const data = await response.json();
      if (!data.success || !data.data?.user || data.data.user.role !== 'admin') throw new Error('Administrator access required');
      setUser(data.data.user);
    } catch {
      clearSession();
      navigate(adminPath('login'), { replace: true });
    } finally {
      setLoading(false);
    }
  }, [clearSession, navigate]);

  useEffect(() => { void checkAuth(); }, [checkAuth]);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      if (token) await fetch('/api/v1/admin-auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } finally {
      clearSession();
      navigate(adminPath('login'), { replace: true });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300" role="status">Verifying secure session…</div>;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-400">Jeff Honforloco</p><p className="mt-1 text-base font-semibold">Growth Command Center</p></div>
          <button className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          {navigation.map((group) => (
            <div className="mb-5" key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const href = adminPath(item.path);
                  const active = location.pathname === href || location.pathname.startsWith(`${href}/`);
                  return <Link key={item.path} to={href} className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}><item.icon className="h-4 w-4 shrink-0" /><span className="flex-1">{item.name}</span>{active && <ChevronRight className="h-3.5 w-3.5" />}</Link>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{user?.username}</p><p className="text-xs text-slate-500">Authenticated operator</p></div><Badge className="border-emerald-700 bg-emerald-950 text-emerald-300">Private</Badge></div>
          <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Log out</Button>
        </div>
      </aside>
      <div className="lg:pl-[18rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3"><button className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><p className="text-sm font-semibold">Private operations</p><p className="hidden text-xs text-slate-500 sm:block">Evidence-led growth, human-approved changes</p></div></div>
          <div className="flex items-center gap-2"><Badge variant="outline" className="hidden sm:inline-flex">{user?.role}</Badge><Link to={adminPath('recommendations')} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Review alerts and recommendations"><Bell className="h-4 w-4" /></Link></div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
