import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, PlugZap, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { growthGet } from './api';
import { EmptyState, ErrorNotice, MetricCard, PageHeader } from './GrowthUI';

type OverviewData = {
  periodDays: number;
  metrics: { visitors: number | null; serviceViews: number; portfolioViews: number; bookingStarts: number; leads: number; qualifiedLeads: number; bookedClients: number };
  conversion: { serviceToBooking: number | null; bookingToLead: number | null; leadToBooked: number | null };
  topServices: Array<{ label: string; count: number }>;
  topSources: Array<{ label: string; count: number }>;
  topLandingPages: Array<{ label: string; count: number }>;
  recentLeads: Array<{ id: number; full_name: string; service_type: string | null; status: string; created_at: string }>;
  recentRecommendations: Array<{ id: number; title: string; priority: string; status: string }>;
  integrations: Record<string, 'connected' | 'not_connected'>;
  health: { openP0: number; failedChecks: number; lastPerformance: string | null };
};

const percent = (value: number | null) => value === null ? 'No data yet' : `${value.toFixed(1)}%`;

const GrowthOverview = () => {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    growthGet<OverviewData>(`overview?days=${days}`)
      .then(setData)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [days]);

  const changeRange = (value: string) => {
    setLoading(true);
    setData(null);
    setError(null);
    setDays(value);
  };

  return (
    <div>
      <PageHeader eyebrow="Executive view" title="Growth Command Center" description="Discovery, demand, conversion, and operating priorities from the existing site funnel and CRM." action={<Select value={days} onValueChange={changeRange}><SelectTrigger className="w-32 bg-white text-neutral-900"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent></Select>} />
      {error && <ErrorNotice message={error} />}
      {loading && <div className="flex h-40 items-center justify-center text-sm text-slate-500"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading real business data…</div>}
      {data && !loading && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Visitors" value={data.metrics.visitors} detail="Unique visitors are shown only when a reliable visitor identifier exists." />
          <MetricCard label="Service views" value={data.metrics.serviceViews} />
          <MetricCard label="Booking starts" value={data.metrics.bookingStarts} />
          <MetricCard label="Leads" value={data.metrics.leads} />
          <MetricCard label="Qualified leads" value={data.metrics.qualifiedLeads} />
          <MetricCard label="Booked clients" value={data.metrics.bookedClients} />
          <MetricCard label="Service → booking" value={percent(data.conversion.serviceToBooking)} />
          <MetricCard label="Lead → booked" value={percent(data.conversion.leadToBooked)} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          {[['Top services', data.topServices], ['Top lead sources', data.topSources], ['Top landing pages', data.topLandingPages]].map(([title, rows]) => (
            <Card key={title as string}><CardHeader><CardTitle className="text-base">{title as string}</CardTitle><CardDescription>Verified events in this period</CardDescription></CardHeader><CardContent>{(rows as Array<{ label: string; count: number }>).length ? <div className="space-y-3">{(rows as Array<{ label: string; count: number }>).map((row) => <div key={row.label} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-slate-700">{row.label}</span><Badge variant="secondary">{row.count}</Badge></div>)}</div> : <EmptyState />}</CardContent></Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card><CardHeader><CardTitle className="text-base">Recent leads and bookings</CardTitle><CardDescription>Latest records from the existing contacts CRM</CardDescription></CardHeader><CardContent>{data.recentLeads.length ? <div className="divide-y">{data.recentLeads.map((lead) => <div className="flex items-center gap-3 py-3" key={lead.id}><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{lead.full_name}</p><p className="text-xs text-slate-500">{lead.service_type || 'Service not provided'} · {new Date(lead.created_at).toLocaleDateString()}</p></div><Badge variant="outline">{lead.status}</Badge></div>)}</div> : <EmptyState />}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Decision queue</CardTitle><CardDescription>Evidence-based actions awaiting review</CardDescription></CardHeader><CardContent>{data.recentRecommendations.length ? <div className="space-y-3">{data.recentRecommendations.map((item) => <div className="rounded-lg border p-3" key={item.id}><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium">{item.title}</p><Badge>{item.priority}</Badge></div><p className="mt-2 text-xs text-slate-500">{item.status}</p></div>)}</div> : <EmptyState text="Recommendations appear only after evidence is recorded and reviewed." />}</CardContent></Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Integration status</CardTitle><CardDescription>No connection is treated as a status, never as invented data.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{Object.entries(data.integrations).map(([name, status]) => <div className="flex items-center gap-2 rounded-lg border p-3 text-sm" key={name}>{status === 'connected' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <PlugZap className="h-4 w-4 text-amber-600" />}<span className="flex-1 capitalize">{name.replaceAll('_', ' ')}</span><Badge variant="outline">{status === 'connected' ? 'Connected' : 'Not connected'}</Badge></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Technical watch</CardTitle><CardDescription>Latest recorded health—not a live claim unless timestamped.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex justify-between text-sm"><span>Open P0 recommendations</span><strong>{data.health.openP0}</strong></div><div className="flex justify-between text-sm"><span>Failed health checks</span><strong>{data.health.failedChecks}</strong></div><div className="flex justify-between text-sm"><span>Latest performance snapshot</span><strong>{data.health.lastPerformance || 'No data yet'}</strong></div><Button variant="outline" className="mt-2 w-full" asChild><a href={data.health.failedChecks ? '#health-alerts' : '#technical-watch'}>Review technical health<ArrowRight className="ml-2 h-4 w-4" /></a></Button></CardContent></Card>
        </div>
      </>}
    </div>
  );
};

export default GrowthOverview;
