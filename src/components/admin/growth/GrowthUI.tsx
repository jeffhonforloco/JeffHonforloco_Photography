import type { ReactNode } from 'react';
import { AlertTriangle, DatabaseZap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PageHeader = ({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p></div>
    {action}
  </div>
);

export const MetricCard = ({ label, value, detail }: { label: string; value: string | number | null; detail?: string }) => (
  <Card className="border-slate-200 shadow-sm"><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value ?? 'No data yet'}</CardTitle></CardHeader>{detail && <CardContent><p className="text-xs text-slate-500">{detail}</p></CardContent>}</Card>
);

export const EmptyState = ({ title = 'No data yet', text = 'The data model is ready. Add a verified observation or connect the named source to begin history.' }: { title?: string; text?: string }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"><DatabaseZap className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 font-semibold">{title}</p><p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">{text}</p></div>
);

export const SourceBadge = ({ source, status }: { source?: string | null; status?: string | null }) => (
  <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">Source: {source || 'Not connected'}</Badge><Badge className={status === 'connected' || status === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>{status || 'No data'}</Badge></div>
);

export const ErrorNotice = ({ message }: { message: string }) => <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>;
