import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiUrl } from '@/lib/api-base';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
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

interface FunnelStage { name: string; value: number; fill: string }

/* ------------------------------------------------------------------ */
/* Brand palette (matches rose accent in admin sidebar)                */
/* ------------------------------------------------------------------ */

const ROSE = '#f43f5e';
const ROSE_DARK = '#be123c';
const SLATE = '#64748b';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';
const VIOLET = '#8b5cf6';
const SKY = '#0ea5e9';

const PIE_COLORS = [ROSE, VIOLET, SKY, EMERALD, AMBER, SLATE];

/* ------------------------------------------------------------------ */
/* Sample data — used only when the backend has no real data yet.      */
/* Clearly labeled in the UI as "Sample".                              */
/* ------------------------------------------------------------------ */

const SAMPLE_BOOKINGS = [
  { month: 'Apr', bookings: 4, leads: 18 },
  { month: 'May', bookings: 6, leads: 24 },
  { month: 'Jun', bookings: 5, leads: 21 },
  { month: 'Jul', bookings: 8, leads: 32 },
  { month: 'Aug', bookings: 11, leads: 41 },
  { month: 'Sep', bookings: 9, leads: 36 },
];

const SAMPLE_SOURCES = [
  { name: 'Website', value: 42 },
  { name: 'Instagram', value: 31 },
  { name: 'Referral', value: 15 },
  { name: 'Google', value: 12 },
];

const SAMPLE_REVENUE = [
  { service: 'Fashion', revenue: 4200 },
  { service: 'Beauty', revenue: 2600 },
  { service: 'Editorial', revenue: 3100 },
  { service: 'Events', revenue: 1800 },
  { service: 'Headshots', revenue: 900 },
];

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

/** Build last-6-months bookings/leads series from contact rows. */
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

function buildFunnel(stats: DashboardStats | null): FunnelStage[] {
  const c = stats?.contacts;
  if (!c) return [];
  return [
    { name: 'Leads', value: c.total, fill: SKY },
    { name: 'Contacted', value: c.contacted, fill: VIOLET },
    { name: 'Qualified', value: c.qualified, fill: AMBER },
    { name: 'Booked', value: c.booked, fill: ROSE },
    { name: 'Completed', value: c.completed, fill: EMERALD },
  ];
}

function pctChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

function KpiCard({ title, value, delta, icon: Icon, accent, sub }: {
  title: string; value: string | number; delta?: number; icon: React.ElementType; accent: string; sub?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden border-slate-200/80 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-medium text-muted-foreground">{title}</CardTitle>
        <span className="rounded-lg p-2" style={{ backgroundColor: `${accent}14`, color: accent }}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-[28px] font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, badge, children, className }: {
  title: string; description?: string; badge?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={`border-slate-200/80 shadow-sm ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-[15px] font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>}
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
} as const;

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [pageViews, setPageViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, contactsRes, analyticsRes] = await Promise.all([
        fetch(apiUrl('/api/v1/admin/dashboard'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/contacts?limit=500'), { headers: authHeaders() }),
        fetch(apiUrl('/api/v1/admin/analytics?period=30d'), { headers: authHeaders() }),
      ]);

      let loadedStats: DashboardStats | null = null;
      let loadedContacts: ContactRow[] = [];
      let views: number | null = null;

      if (statsRes.ok) {
        const d = await statsRes.json();
        loadedStats = d.data?.overview ?? d.data ?? null;
      }
      if (contactsRes.ok) {
        const d = await contactsRes.json();
        const rows: ContactRow[] = d.data?.contacts ?? d.data ?? [];
        if (Array.isArray(rows)) loadedContacts = rows;
      }
      if (analyticsRes.ok) {
        const d = await analyticsRes.json();
        views = d.data?.pageViews ?? null;
      }

      const hasReal = (loadedContacts.length > 0) || (loadedStats?.contacts.total ?? 0) > 0;
      setUsingSample(!hasReal);
      setStats(loadedStats);
      setContacts(loadedContacts);
      setPageViews(views);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-56" /><Skeleton className="mt-2 h-4 w-72" /></div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error && !stats && contacts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-rose-600">Error: {error}</p>
        <Button onClick={fetchAll}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
      </div>
    );
  }

  const c = stats?.contacts;
  const totalLeads = c?.total ?? contacts.length;
  const booked = c?.booked ?? 0;
  const conversion = totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 0;

  const trend = contacts.length > 0 ? buildTrend(contacts) : SAMPLE_BOOKINGS;
  const sources = contacts.length > 0 ? buildSources(contacts) : SAMPLE_SOURCES;
  const funnel = buildFunnel(stats);

  const lastMonth = trend[trend.length - 2];
  const thisMonth = trend[trend.length - 1];
  const bookingsDelta = pctChange(thisMonth?.bookings ?? 0, lastMonth?.bookings ?? 0);
  const leadsDelta = pctChange(thisMonth?.leads ?? 0, lastMonth?.leads ?? 0);

  const sampleBadge = usingSample
    ? <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px]">Sample data</Badge>
    : <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px]">Live</Badge>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground">Bookings, leads and revenue at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAll} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
          <Button onClick={() => exportData('contacts')} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />Export
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Leads" value={totalLeads} delta={leadsDelta} icon={Users} accent={SKY} sub="vs last month" />
        <KpiCard title="Bookings" value={booked} delta={bookingsDelta} icon={CalendarCheck} accent={ROSE} sub="vs last month" />
        <KpiCard title="Conversion Rate" value={`${conversion}%`} icon={TrendingUp} accent={EMERALD} sub="leads → bookings" />
        <KpiCard title="Page Views" value={pageViews ?? '—'} icon={Eye} accent={VIOLET} sub="last 30 days" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Bookings & Leads"
          description="Last 6 months"
          badge={sampleBadge}
          className="xl:col-span-2"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ROSE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ROSE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SKY} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SKY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={SLATE} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke={SLATE} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke={SKY} strokeWidth={2} fill="url(#gLeads)" />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke={ROSE} strokeWidth={2.5} fill="url(#gBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Lead Sources" description="Where inquiries come from" badge={sampleBadge}>
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
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Revenue by Service"
          description="Estimated booking value"
          badge={<Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px]">Sample data</Badge>}
          className="xl:col-span-2"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SAMPLE_REVENUE} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} stroke={SLATE} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke={SLATE} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                  {SAMPLE_REVENUE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Connect booking values to replace sample figures with live revenue.</p>
        </ChartCard>

        <ChartCard title="Conversion Funnel" description="Lead → booked pipeline" badge={usingSample ? sampleBadge : undefined}>
          <div className="space-y-3 pt-2">
            {funnel.length > 0 ? (
              funnel.map((stage) => {
                const max = funnel[0]?.value || 1;
                const width = Math.max(8, Math.round((stage.value / max) * 100));
                const prev = funnel[funnel.indexOf(stage) - 1];
                const stageConv = prev && prev.value > 0 ? Math.round((stage.value / prev.value) * 100) : 100;
                return (
                  <div key={stage.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{stage.name}</span>
                      <span className="text-muted-foreground">{stage.value} · {stageConv}%</span>
                    </div>
                    <div className="h-9 overflow-hidden rounded-lg bg-slate-100">
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
              <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Filter className="mb-2 h-6 w-6 opacity-40" />
                <p>No pipeline data yet.</p>
                <p className="text-xs">New inquiries will appear here automatically.</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Portfolio / content strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Portfolio Images</p>
              <p className="text-2xl font-bold">{stats?.portfolioImages.total ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{stats?.portfolioImages.featured ?? 0} featured</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportData('portfolio')}>Manage</Button>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Journal Posts</p>
              <p className="text-2xl font-bold">{stats?.blogPosts.total ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{stats?.blogPosts.published ?? 0} published</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportData('blog')}>Manage</Button>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">New This Month</p>
              <p className="text-2xl font-bold">{c?.new ?? '—'}</p>
              <p className="text-xs text-muted-foreground">fresh inquiries</p>
            </div>
            <Badge className="bg-rose-600">{conversion}% convert</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
