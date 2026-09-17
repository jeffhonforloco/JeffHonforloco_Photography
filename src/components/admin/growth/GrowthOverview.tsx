import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, PlugZap, RefreshCw, X } from 'lucide-react';
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

const INTEGRATION_INFO: Record<string, { title: string; connected: string; setup: string[] }> = {
  google_search_console: {
    title: 'Google Search Console',
    connected: 'Search Console data is flowing. Rankings and impressions appear on the SEO page.',
    setup: [
      '1. Go to Google Cloud Console → create a service account',
      '2. Enable the Search Console API for your project',
      '3. Download the JSON key for the service account',
      '4. In Search Console, add the service account email as a user on your property',
      '5. In Cloudflare → Workers → api-jeffhonforloco-photography → Settings → Variables, add GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY as encrypted secrets',
    ],
  },
  google_business_profile: {
    title: 'Google Business Profile',
    connected: 'Business Profile is linked. Reviews and local insights are available.',
    setup: [
      '1. Get your Google Business Profile account ID from business.google.com',
      '2. In Cloudflare → Workers → api-jeffhonforloco-photography → Settings → Variables, add GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID as an encrypted secret',
    ],
  },
  github_prepare_fix: {
    title: 'GitHub Prepare Fix',
    connected: 'GitHub App is linked. Automated fix PRs can be prepared.',
    setup: [
      '1. Create a GitHub App with contents:write and pull_requests:write permissions',
      '2. Install it on the JeffHonforloco_Photography repository',
      '3. In Cloudflare → Workers → api-jeffhonforloco-photography → Settings → Variables, add GITHUB_APP_ID as an encrypted secret',
    ],
  },
  email_notifications: {
    title: 'Email Notifications',
    connected: 'Resend is configured. Contact confirmations, campaigns, and contract emails send from your domain.',
    setup: [
      '1. Get an API key from resend.com → API Keys',
      '2. In Cloudflare → Workers → api-jeffhonforloco-photography → Settings → Variables, add RESEND_API_KEY as an encrypted secret',
    ],
  },
};

const GrowthOverview = () => {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

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

  const selectedInfo = selectedIntegration ? INTEGRATION_INFO[selectedIntegration] : null;
  const selectedStatus = selectedIntegration && data ? data.integrations[selectedIntegration] : null;

  return (
    <div>
      <PageHeader eyebrow="Executive view" title="Growth Command Center" description="Discovery, demand, conversion, and operating priorities from the existing site funnel and CRM." action={<Select value={days} onValueChange={changeRange}><SelectTrigger className="w-32 border-neutral-700 bg-neutral-900 text-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent></Select>} />
      {error && <ErrorNotice message={error} />}
      {loading && <div className="flex h-40 items-center justify-center text-sm text-neutral-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading real business data…</div>}
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
            <Card key={title as string}><CardHeader><CardTitle className="text-base">{title as string}</CardTitle><CardDescription>Verified events in this period</CardDescription></CardHeader><CardContent>{(rows as Array<{ label: string; count: number }>).length ? <div className="space-y-3">{(rows as Array<{ label: string; count: number }>).map((row) => <div key={row.label} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-neutral-300">{row.label}</span><Badge variant="secondary">{row.count}</Badge></div>)}</div> : <EmptyState />}</CardContent></Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card><CardHeader><CardTitle className="text-base">Recent leads and bookings</CardTitle><CardDescription>Latest records from the existing contacts CRM</CardDescription></CardHeader><CardContent>{data.recentLeads.length ? <div className="divide-y">{data.recentLeads.map((lead) => <div className="flex items-center gap-3 py-3" key={lead.id}><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{lead.full_name}</p><p className="text-xs text-neutral-400">{lead.service_type || 'Service not provided'} · {new Date(lead.created_at).toLocaleDateString()}</p></div><Badge variant="outline">{lead.status}</Badge></div>)}</div> : <EmptyState />}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Decision queue</CardTitle><CardDescription>Evidence-based actions awaiting review</CardDescription></CardHeader><CardContent>{data.recentRecommendations.length ? <div className="space-y-3">{data.recentRecommendations.map((item) => <div className="rounded-lg border p-3" key={item.id}><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium">{item.title}</p><Badge>{item.priority}</Badge></div><p className="mt-2 text-xs text-neutral-400">{item.status}</p></div>)}</div> : <EmptyState text="Recommendations appear only after evidence is recorded and reviewed." />}</CardContent></Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Integration status</CardTitle><CardDescription>Tap an integration to connect or manage it. No connection is treated as a status, never as invented data.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{Object.entries(data.integrations).map(([name, status]) => <button type="button" onClick={() => setSelectedIntegration(name)} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50" key={name}>{status === 'connected' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <PlugZap className="h-4 w-4 shrink-0 text-amber-600" />}<span className="flex-1 capitalize">{name.replaceAll('_', ' ')}</span><Badge variant="outline">{status === 'connected' ? 'Connected' : 'Not connected'}</Badge></button>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Technical watch</CardTitle><CardDescription>Latest recorded health—not a live claim unless timestamped.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex justify-between text-sm"><span>Open P0 recommendations</span><strong>{data.health.openP0}</strong></div><div className="flex justify-between text-sm"><span>Failed health checks</span><strong>{data.health.failedChecks}</strong></div><div className="flex justify-between text-sm"><span>Latest performance snapshot</span><strong>{data.health.lastPerformance || 'No data yet'}</strong></div><Button variant="outline" className="mt-2 w-full" asChild><a href={data.health.failedChecks ? '#health-alerts' : '#technical-watch'}>Review technical health<ArrowRight className="ml-2 h-4 w-4" /></a></Button></CardContent></Card>
        </div>
      </>}

      {selectedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedIntegration(null)}>
          <div className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{selectedInfo.title}</h3>
              <button type="button" onClick={() => setSelectedIntegration(null)} className="rounded p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4">
              <Badge variant={selectedStatus === 'connected' ? 'default' : 'outline'}>{selectedStatus === 'connected' ? 'Connected' : 'Not connected'}</Badge>
            </div>
            {selectedStatus === 'connected' ? (
              <p className="text-sm text-neutral-700">{selectedInfo.connected}</p>
            ) : (
              <div>
                <p className="mb-3 text-sm font-medium text-neutral-900">To connect:</p>
                <ol className="space-y-2">
                  {selectedInfo.setup.map((step, i) => (
                    <li key={i} className="text-sm text-neutral-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            <Button className="mt-6 w-full" onClick={() => setSelectedIntegration(null)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthOverview;
