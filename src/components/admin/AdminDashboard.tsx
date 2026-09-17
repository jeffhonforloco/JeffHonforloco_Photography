import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiUrl } from '@/lib/api-base';
import { adminPath } from '@/lib/admin-routing';
import { CRIMSON } from './AdminLayout';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Eye,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  BarChart3,
  Filter,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ContactRow {
  id: number;
  name?: string;
  email?: string;
  status?: string;
  source?: string;
  service?: string;
  created_at?: string;
  value?: number;
}

interface DashboardStats {
  contacts: { total: number; new: number; contacted: number; qualified: number; booked: number; completed: number };
  blogPosts: { total: number; published: number; draft: number };
  portfolioImages: { total: number; featured: number };
}

interface PortfolioImage {
  id: number;
  title?: string;
  image_url?: string;
  thumbnail_url?: string;
  category?: string;
  is_featured?: number | boolean;
}

interface TopView { image_key?: string; image_url?: string; views: number }
interface RevenueRow { name: string; revenue_cents: number; orders: number }
interface FunnelStage { name: string; value: number; fill: string }

/* ------------------------------------------------------------------ */
/* Brand palette — matches jeffhonforlocophotos.com                    */
/* ------------------------------------------------------------------ */

const CRIMSON_LIGHT = '#e5384f';
const CRIMSON_DEEP = '#8f0b20';
const CRIMSON_DARK = '#5c0715';
const WHITE = '#ffffff';
const GRAY_400 = '#a3a3a3';
const GRAY_600 = '#525252';
const GRID = '#1f1f1f';

const PIE_COLORS = [CRIMSON, CRIMSON_LIGHT, WHITE, GRAY_400, CRIMSON_DEEP, GRAY_600];
const BAR_COLORS = [CRIMSON, CRIMSON_LIGHT, '#f0667e', CRIMSON_DEEP, '#d4d4d4', GRAY_400];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

/** Build last-6-months bookings/leads series from contact rows. Real data only. */
function buildTrend(contacts: ContactRow[]) {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  const byMonth: Record<string, { bookings: number; leads: number }> = {};
  months.forEach((m) => { byMonth[m] = { bookings: 0, leads: 0 }; });
  contacts.forEach((c) => {
    if (!c.created_at) return;
    const k = monthKey(new Date(c.created_at));
    if (!byMonth[k]) return;
    byMonth[k].leads += 1;
    const s = (c.status || '').toLowerCase();
    if (s === 'booked' || s === 'completed') byMonth[k].bookings += 1;
  });
  return months.map((m) => ({ month: monthLabel(m), bookings: byMonth[m].bookings, leads: byMonth[m].leads }));
}

function buildSources(contacts: ContactRow[]) {
  const counts: Record<string, number> = {};
  contacts.forEach((c) => {
    const s = (c.source || 'Website').trim() || 'Website';
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

/** Bookings grouped by service — real data from booked/completed contacts. */
function buildByService(contacts: ContactRow[]) {
  const counts: Record<string, number> = {};
  contacts.forEach((c) => {
    const s = (c.status || '').toLowerCase();
    if (s !== 'booked' && s !== 'completed') return;
    const svc = (c.service || 'Other').trim() || 'Other';
    counts[svc] = (counts[svc] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([service, bookings]) => ({ service, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);
}

function buildFunnel(stats: DashboardStats | null): FunnelStage[] {
  const c = stats?.contacts;
  if (!c) return [];
  return [
    { name: 'Leads', value: c.total, fill: GRAY_400 },
    { name: 'Contacted', value: c.contacted, fill: '#d4d4d4' },
    { name: 'Qualified', value: c.qualified, fill: CRIMSON_LIGHT },
    { name: 'Booked', value: c.booked, fill: CRIMSON },
    { name: 'Completed', value: c.completed, fill: CRIMSON_DEEP },
  ];
}

function pctChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/* ------------------------------------------------------------------ */
/* Small presentational components (dark)                              */
/* ------------------------------------------------------------------ */

function KpiCard({ title, value, delta, icon: Icon, accent, sub }: {
  title: string; value: string | number; delta?: number; icon: React.ElementType; accent: string; sub?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden border-neutral-800 bg-neutral-950 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-medium text-neutral-400">{title}</CardTitle>
        <span className="rounded-lg p-2" style={{ backgroundColor: `${accent}1f`, color: accent }}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-[28px] font-bold tracking-tight text-white">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="text-neutral-500">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, badge, children, className, action }: {
  title: string; description?: string; badge?: React.ReactNode; children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
  return (
    <Card className={`border-neutral-800 bg-neutral-950 shadow-sm ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-[15px] font-semibold tracking-tight text-white">{title}</CardTitle>
            {description && <CardDescription className="mt-0.5 text-xs text-neutral-500">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">{badge}{action}</div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyChart({ icon: Icon, title, hint, linkText, linkTo }: {
  icon: React.ElementType; title: string; hint: string; linkText?: string; linkTo?: string;
}) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center text-center">
      <span className="mb-3 rounded-full bg-neutral-900 p-3"><Icon className="h-6 w-6 text-neutral-500" /></span>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs text-neutral-500">{hint}</p>
      {linkText && linkTo && (
        <Link to={linkTo} className="mt-3 text-xs font-semibold" style={{ color: CRIMSON }}>{linkText} →</Link>
      )}
    </div>
  );
}

const chartTooltipStyle = {
  backgroundColor: '#0a0a0a',
  border: '1px solid #262626',
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
} as const;

const LiveBadge = () => (
  <Badge variant="outline" className="border-neutral-800 bg-neutral-900 text-[10px] text-emerald-400">Live</Badge>
);

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [pageViews, setPageViews] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [topViews, setTopViews] = useState<TopView[]>([]);
  const [shopRevenue, setShopRevenue] = useState<{ paid_revenue_cents: number; paid_count: number } | null>(null);
  const [revenueByProduct, setRevenueByProduct] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);
      const [statsRes, contactsRes, analyticsRes, portfolioRes, topRes, shopRes, revRes] = await Promise.all([
        fetch(apiUrl('/api/v1/admin/dashboard'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/contacts?limit=500'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/admin/analytics?period=30d'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/portfolio'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/admin/media/top?limit=8'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/admin/shop/orders'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/admin/shop/revenue-by-product'), { headers: authHeaders() }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json().catch(() => null);
        setStats(d?.data?.overview ?? d?.data ?? null);
      }
      if (contactsRes.ok) {
        const d = await contactsRes.json().catch(() => null);
        const rows: ContactRow[] = d?.data?.contacts ?? d?.data ?? [];
        if (Array.isArray(rows)) setContacts(rows);
      }
      if (analyticsRes.ok) {
        const d = await analyticsRes.json().catch(() => null);
        setPageViews(d?.data?.pageViews ?? null);
      }
      if (portfolioRes.ok) {
        const d = await portfolioRes.json().catch(() => null);
        const imgs: PortfolioImage[] = d?.data?.images ?? [];
        if (Array.isArray(imgs)) setPortfolio(imgs);
      }
      if (topRes.ok) {
        const d = await topRes.json().catch(() => null);
        const rows: TopView[] = d?.data ?? [];
        if (Array.isArray(rows)) setTopViews(rows);
      }
      if (shopRes.ok) {
        const d = await shopRes.json().catch(() => null);
        setShopRevenue(d?.data?.stats ?? null);
      }
      if (revRes.ok) {
        const d = await revRes.json().catch(() => null);
        const rows: RevenueRow[] = d?.data ?? [];
        if (Array.isArray(rows)) setRevenueByProduct(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const exportData = async (type: string) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/export/${type}?format=csv`), { headers: authHeaders() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setNotice(`Downloaded ${type}_export.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="skeleton-dark h-8 w-56" /><Skeleton className="skeleton-dark mt-2 h-4 w-72" /></div>
          <Skeleton className="skeleton-dark h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="skeleton-dark h-32" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="skeleton-dark h-80" /><Skeleton className="skeleton-dark h-80" />
        </div>
      </div>
    );
  }

  if (error && !stats && contacts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-red-400">Couldn't load the dashboard: {error}</p>
        <Button onClick={fetchAll} style={{ backgroundColor: CRIMSON }} className="text-white hover:opacity-90">
          <RefreshCw className="mr-2 h-4 w-4" />Retry
        </Button>
      </div>
    );
  }

  const c = stats?.contacts;
  const totalLeads = c?.total ?? contacts.length;
  const booked = c?.booked ?? 0;
  const conversion = totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 0;

  const trend = buildTrend(contacts);
  const hasTrend = trend.some((t) => t.leads > 0 || t.bookings > 0);
  const sources = buildSources(contacts);
  const byService = buildByService(contacts);
  const funnel = buildFunnel(stats);

  const lastMonth = trend[trend.length - 2];
  const thisMonth = trend[trend.length - 1];
  const bookingsDelta = pctChange(thisMonth?.bookings ?? 0, lastMonth?.bookings ?? 0);
  const leadsDelta = pctChange(thisMonth?.leads ?? 0, lastMonth?.leads ?? 0);

  /* "What People Loved" — portfolio images joined with tracked views */
  const viewMap = new Map<string, number>();
  topViews.forEach((v) => {
    if (v.image_url) viewMap.set(v.image_url, v.views);
    if (v.image_key) viewMap.set(v.image_key, v.views);
  });
  const loved = portfolio
    .map((img) => ({ ...img, views: viewMap.get(img.image_url || '') ?? viewMap.get(img.thumbnail_url || '') ?? 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
  const hasAnyViews = loved.some((l) => l.views > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white">Command Center</h1>
          <p className="text-sm text-neutral-500">Bookings, leads and revenue at a glance</p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-neutral-600">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAll} variant="outline" size="sm" className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white">
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
          <Button onClick={() => exportData('contacts')} variant="outline" size="sm" className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white">
            <Download className="mr-2 h-4 w-4" />Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-red-400">
          Some data couldn't refresh: {error}{' '}
          <button onClick={fetchAll} className="font-semibold underline">Retry</button>
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-emerald-900 bg-emerald-950 p-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      {/* KPI cards — real data only */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Leads" value={totalLeads} delta={leadsDelta} icon={Users} accent={WHITE} sub="vs last month" />
        <KpiCard title="Bookings" value={booked} delta={bookingsDelta} icon={CalendarCheck} accent={CRIMSON} sub="vs last month" />
        <KpiCard title="Conversion Rate" value={`${conversion}%`} icon={TrendingUp} accent={CRIMSON_LIGHT} sub="leads → bookings" />
        <KpiCard
          title="Shop Revenue"
          value={shopRevenue ? fmtMoney(shopRevenue.paid_revenue_cents) : '—'}
          icon={DollarSign}
          accent={GRAY_400}
          sub={shopRevenue ? `${shopRevenue.paid_count} paid orders` : 'no paid orders yet'}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Bookings & Leads"
          description="Last 6 months"
          badge={<LiveBadge />}
          className="xl:col-span-2"
        >
          {hasTrend ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CRIMSON} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={CRIMSON} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={WHITE} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={WHITE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={GRAY_400} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke={GRAY_400} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke={WHITE} strokeWidth={2} fill="url(#gLeads)" />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke={CRIMSON} strokeWidth={2.5} fill="url(#gBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart icon={BarChart3} title="No booking activity yet" hint="New inquiries and bookings will chart here automatically over the last 6 months." linkText="View leads" linkTo={adminPath('leads')} />
          )}
        </ChartCard>

        <ChartCard title="Lead Sources" description="Where inquiries come from" badge={<LiveBadge />}>
          {sources.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sources} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3} strokeWidth={0}>
                    {sources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart icon={Filter} title="No lead sources yet" hint="Sources are counted from each inquiry's origin — website, Instagram, referral, and more." linkText="View leads" linkTo={adminPath('leads')} />
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Bookings by Service"
          description="What clients book most"
          badge={<LiveBadge />}
          className="xl:col-span-2"
        >
          {byService.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byService} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="service" tick={{ fontSize: 11 }} stroke={GRAY_400} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke={GRAY_400} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="bookings" name="Bookings" radius={[6, 6, 0, 0]}>
                    {byService.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart icon={BarChart3} title="No service breakdown yet" hint="Once bookings are marked booked or completed, they'll group by service here." linkText="View bookings" linkTo={adminPath('bookings')} />
          )}
          {revenueByProduct.length > 0 && (
            <div className="mt-4 border-t border-neutral-900 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Shop revenue by product</p>
              <div className="space-y-2">
                {revenueByProduct.slice(0, 4).map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <span className="truncate text-neutral-300">{r.name}</span>
                    <span className="ml-3 font-semibold text-white">{fmtMoney(r.revenue_cents)} <span className="font-normal text-neutral-500">· {r.orders} sold</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Conversion Funnel" description="Lead → booked pipeline" badge={<LiveBadge />}>
          <div className="space-y-3 pt-2">
            {funnel.length > 0 && funnel[0].value > 0 ? (
              funnel.map((stage, idx) => {
                const max = funnel[0]?.value || 1;
                const width = Math.max(8, Math.round((stage.value / max) * 100));
                const prev = funnel[idx - 1];
                const stageConv = prev && prev.value > 0 ? Math.round((stage.value / prev.value) * 100) : 100;
                return (
                  <div key={stage.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-200">{stage.name}</span>
                      <span className="text-neutral-500">{stage.value} · {stageConv}%</span>
                    </div>
                    <div className="h-9 overflow-hidden rounded-lg bg-neutral-900">
                      <div
                        className="flex h-full items-center justify-end rounded-lg pr-2 text-[11px] font-semibold text-white transition-all"
                        style={{ width: `${width}%`, background: `linear-gradient(90deg, ${stage.fill}cc, ${stage.fill})` }}
                      >
                        {width > 22 && stage.value}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyChart icon={Filter} title="No pipeline data yet" hint="New inquiries will appear here automatically as they move through your pipeline." linkText="View leads" linkTo={adminPath('leads')} />
            )}
          </div>
        </ChartCard>
      </div>

      {/* What People Loved */}
      <ChartCard
        title="What People Loved"
        description="Your most-viewed portfolio images"
        badge={<LiveBadge />}
        action={<Link to={adminPath('portfolio-content')} className="text-xs font-semibold" style={{ color: CRIMSON }}>Manage portfolio →</Link>}
      >
        {loved.length > 0 ? (
          <>
            {!hasAnyViews && (
              <p className="mb-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-400">
                <Eye className="mr-1 inline h-3.5 w-3.5" />
                View tracking is active — view counts will appear here as visitors browse your portfolio.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {loved.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-black">
                  {img.thumbnail_url || img.image_url ? (
                    <img
                      src={img.thumbnail_url || img.image_url}
                      alt={img.title || 'Portfolio image'}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-neutral-900">
                      <ImageIcon className="h-8 w-8 text-neutral-700" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-6">
                    <p className="truncate text-xs font-medium text-white">{img.title || 'Untitled'}</p>
                    <p className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Eye className="h-3 w-3" />
                      {img.views > 0 ? `${img.views.toLocaleString()} views` : '—'}
                      {img.category && <span className="ml-1 truncate">· {img.category}</span>}
                    </p>
                  </div>
                  {img.views > 0 && (
                    <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: CRIMSON }}>
                      <Heart className="mr-0.5 inline h-3 w-3" />{img.views}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyChart icon={ImageIcon} title="No portfolio images yet" hint="Upload images to your portfolio and they'll show up here ranked by views." linkText="Open portfolio" linkTo={adminPath('portfolio-content')} />
        )}
      </ChartCard>

      {/* Portfolio / content strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-neutral-800 bg-neutral-950 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-neutral-500">Portfolio Images</p>
              <p className="text-2xl font-bold text-white">{stats?.portfolioImages.total ?? '—'}</p>
              <p className="text-xs text-neutral-500">{stats?.portfolioImages.featured ?? 0} featured</p>
            </div>
            <Link to={adminPath('portfolio-content')}>
              <Button variant="outline" size="sm" className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white">Manage</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-950 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-neutral-500">Page Views</p>
              <p className="text-2xl font-bold text-white">{pageViews?.toLocaleString() ?? '—'}</p>
              <p className="text-xs text-neutral-500">last 30 days</p>
            </div>
            <Link to={adminPath('analytics')}>
              <Button variant="outline" size="sm" className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white">Details</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-950 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-neutral-500">New This Month</p>
              <p className="text-2xl font-bold text-white">{c?.new ?? '—'}</p>
              <p className="text-xs text-neutral-500">fresh inquiries</p>
            </div>
            <Badge className="text-white" style={{ backgroundColor: CRIMSON }}>{conversion}% convert</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
