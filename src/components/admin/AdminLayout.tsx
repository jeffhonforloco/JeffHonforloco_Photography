import React, { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, BookOpenCheck, Bot, BriefcaseBusiness, CalendarCheck,
  ChartNoAxesCombined, ChevronRight, FileText, Gauge, Globe2, Image, Images, LayoutDashboard,
  Lightbulb, LogOut, Mail, MapPinned, Megaphone, Menu, Newspaper, Search, Settings, Shield, ShoppingBag, Users, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminPath } from '@/lib/admin-routing';
import { apiUrl } from '@/lib/api-base';
import './admin-theme.css';

interface AdminUser { id: number; username: string; role: string }

/** Brand crimson — matches jeffhonforlocophotos.com */
const CRIMSON = '#c8102e';
const CRIMSON_DARK = '#a50d26';

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
    { name: 'Client Galleries', path: 'galleries', icon: Images },
    { name: 'Pages', path: 'pages', icon: Newspaper },
    { name: 'Portfolio / Content', path: 'portfolio-content', icon: Image },
    { name: 'Journal', path: 'blog', icon: BookOpenCheck },
    { name: 'Analytics (legacy)', path: 'analytics', icon: BarChart3 },
    { name: 'Campaigns', path: 'campaigns', icon: Megaphone },
    { name: 'Shop', path: 'shop', icon: ShoppingBag },
    { name: 'Contracts', path: 'contracts', icon: FileText },
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
  const [authError, setAuthError] = useState<string | null>(null);
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
      const response = await fetch(apiUrl('/api/v1/admin-auth/verify'), { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) {
        // Token is invalid, expired, or revoked: this is a genuine logout.
        clearSession();
        navigate(adminPath('login'), { replace: true });
        return;
      }
      if (!response.ok) throw new Error(`verification request failed (HTTP ${response.status})`);
      const data = await response.json();
      if (!data.success || !data.data?.user || data.data.user.role !== 'admin') {
        // Server no longer recognizes this account as an admin: log out.
        clearSession();
        navigate(adminPath('login'), { replace: true });
        return;
      }
      setUser(data.data.user);
      setAuthError(null);
    } catch (err) {
      // Transient problem (network blip, rate limit, server hiccup): do NOT
      // wipe the saved session. Stay signed in and let the user retry.
      setAuthError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  }, [clearSession, navigate]);

  useEffect(() => { void checkAuth(); }, [checkAuth]);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      if (token) await fetch(apiUrl('/api/v1/admin-auth/logout'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } finally {
      clearSession();
      navigate(adminPath('login'), { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="admin-dark flex min-h-screen items-center justify-center bg-black text-neutral-300" role="status">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800" style={{ borderTopColor: CRIMSON }} />
          <p className="text-sm">Verifying secure session…</p>
        </div>
      </div>
    );
  }

  if (authError && !user) {
    return (
      <div className="admin-dark flex min-h-screen items-center justify-center bg-black px-6 text-neutral-300">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-white">Connection issue</p>
          <p className="text-sm text-neutral-400">
            Couldn&apos;t verify your session ({authError}). You&apos;re still signed in — check your connection and try again.
          </p>
          <Button
            variant="outline"
            className="border-neutral-800 bg-transparent text-neutral-200 hover:bg-neutral-900 hover:text-white"
            onClick={() => { setAuthError(null); setLoading(true); void checkAuth(); }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dark min-h-screen bg-black text-white">
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-neutral-900 bg-black text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-neutral-900 px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: CRIMSON }}>Jeff Honforloco</p>
            <p className="mt-1 text-base font-semibold text-white">Growth Command Center</p>
          </div>
          <button className="rounded-md p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          {navigation.map((group) => (
            <div className="mb-5" key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const href = adminPath(item.path);
                  const active = location.pathname === href || location.pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={item.path}
                      to={href}
                      className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active ? 'text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                      style={active ? { backgroundColor: CRIMSON } : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-neutral-500">Authenticated operator</p>
            </div>
            <Badge className="border-neutral-800 bg-neutral-900 text-neutral-300">Private</Badge>
          </div>
          <Button
            variant="outline"
            className="w-full border-neutral-800 bg-transparent text-neutral-200 hover:bg-neutral-900 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />Log out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[18rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-900 bg-black/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-neutral-800 p-2 text-neutral-300 hover:bg-neutral-900 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Private operations</p>
              <p className="hidden text-xs text-neutral-500 sm:block">Evidence-led growth, human-approved changes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-neutral-800 text-neutral-400 sm:inline-flex">{user?.role}</Badge>
            <Link
              to={adminPath('recommendations')}
              className="rounded-lg border border-neutral-800 p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              aria-label="Review alerts and recommendations"
            >
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
export { CRIMSON, CRIMSON_DARK };
