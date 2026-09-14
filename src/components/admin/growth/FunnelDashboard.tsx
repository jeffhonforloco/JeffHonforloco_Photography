import { useEffect, useState } from 'react';
import { ArrowDown, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { growthGet } from './api';
import { EmptyState, ErrorNotice, PageHeader } from './GrowthUI';

type FunnelData = { stages: Array<{ event: string; label: string; count: number }>; conversions: Array<{ label: string; value: number | null }>; biggestDropOff: string | null; breakdowns: { service: Array<{ label: string; count: number }>; source: Array<{ label: string; count: number }>; landingPage: Array<{ label: string; count: number }>; campaign: Array<{ label: string; count: number }> } };

const FunnelDashboard = () => {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<FunnelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { growthGet<FunnelData>(`funnel?days=${days}`).then(setData).catch((reason: Error) => setError(reason.message)); }, [days]);

  return <div><PageHeader eyebrow="Conversion" title="Acquisition funnel" description="One source of truth using the existing ViewService, ViewPortfolio, StartBooking, Lead, and BookingConfirmed events." action={<Select value={days} onValueChange={setDays}><SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent></Select>} />{error && <ErrorNotice message={error} />}{!data && !error && <div className="flex h-40 items-center justify-center text-sm text-slate-500"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading funnel…</div>}{data && <><div className="grid gap-3 lg:grid-cols-5">{data.stages.map((stage, index) => <div className="contents" key={stage.event}><Card className="relative"><CardHeader><p className="text-xs text-slate-500">{stage.event}</p><CardTitle className="text-3xl">{stage.count}</CardTitle><p className="text-sm font-medium">{stage.label}</p></CardHeader></Card>{index < data.stages.length - 1 && <ArrowDown className="mx-auto h-4 w-4 text-slate-400 lg:hidden" />}</div>)}</div><Card className="mt-6"><CardHeader><CardTitle className="text-base">Conversion checkpoints</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3">{data.conversions.map((item) => <div className="rounded-lg bg-slate-50 p-4" key={item.label}><p className="text-xs text-slate-500">{item.label}</p><p className="mt-1 text-xl font-semibold">{item.value === null ? 'No data yet' : `${item.value.toFixed(1)}%`}</p></div>)}</div><div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600"><span>Biggest measured drop-off:</span><Badge variant="outline">{data.biggestDropOff || 'No data yet'}</Badge></div></CardContent></Card><div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{Object.entries(data.breakdowns).map(([name, rows]) => <Card key={name}><CardHeader><CardTitle className="text-base capitalize">By {name.replace(/([A-Z])/g, ' $1')}</CardTitle></CardHeader><CardContent>{rows.length ? <div className="space-y-2">{rows.slice(0, 8).map((row) => <div className="flex justify-between gap-2 text-sm" key={row.label}><span className="truncate">{row.label}</span><strong>{row.count}</strong></div>)}</div> : <EmptyState />}</CardContent></Card>)}</div></>}</div>;
};

export default FunnelDashboard;
