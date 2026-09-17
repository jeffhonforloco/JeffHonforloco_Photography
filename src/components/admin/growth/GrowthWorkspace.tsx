import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CircleCheck, ExternalLink, GitPullRequest, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { growthGet, growthPatch, growthPost, type GrowthRecord, displayValue } from './api';
import { EmptyState, ErrorNotice, PageHeader, SourceBadge } from './GrowthUI';

export type WorkspaceKind = 'search' | 'ai' | 'competitors' | 'recommendations' | 'authority' | 'content' | 'webmcp' | 'performance' | 'site-health';
type Field = { name: string; label: string; type?: 'text' | 'number' | 'date' | 'textarea' | 'select'; options?: string[]; required?: boolean };
type Config = { eyebrow: string; title: string; description: string; endpoint: string; columns: Array<{ key: string; label: string }>; fields?: Field[]; source?: string; connection?: string };

const configs: Record<WorkspaceKind, Config> = {
  search: { eyebrow: 'Discovery', title: 'Search & SEO', description: 'Localized, timestamped query observations. Positions are observations—not universal ranking claims.', endpoint: 'search', source: 'Manual observation / Search Console', connection: 'not_connected', columns: [{ key: 'query', label: 'Query' }, { key: 'observed_position', label: 'Observed position / range' }, { key: 'landing_page', label: 'Landing page' }, { key: 'source', label: 'Source' }, { key: 'confidence', label: 'Confidence' }, { key: 'observed_at', label: 'Observed' }], fields: [{ name: 'query', label: 'Query', required: true }, { name: 'observed_position', label: 'Position or range' }, { name: 'landing_page', label: 'Landing page' }, { name: 'source', label: 'Measurement source', required: true }, { name: 'confidence', label: 'Confidence', type: 'select', options: ['low', 'medium', 'high'] }, { name: 'notes', label: 'Context / location / notes', type: 'textarea' }] },
  ai: { eyebrow: 'AI discovery', title: 'AI visibility', description: 'Structured, manual observations until provider-specific measurement is connected. No provider output is inferred.', endpoint: 'ai-visibility', source: 'Manual provider checks', connection: 'not_connected', columns: [{ key: 'provider', label: 'Provider' }, { key: 'test_prompt', label: 'Prompt' }, { key: 'jeff_surfaced', label: 'Jeff surfaced?' }, { key: 'citation_url', label: 'Citation' }, { key: 'competitors_surfaced', label: 'Competitors' }, { key: 'observed_at', label: 'Observed' }], fields: [{ name: 'provider', label: 'Provider', type: 'select', options: ['ChatGPT', 'Gemini', 'Claude', 'Grok', 'Perplexity', 'Copilot / Bing AI'], required: true }, { name: 'test_prompt', label: 'Test prompt', required: true }, { name: 'jeff_surfaced', label: 'Jeff surfaced?', type: 'select', options: ['yes', 'no', 'unclear'], required: true }, { name: 'citation_url', label: 'Cited URL' }, { name: 'competitors_surfaced', label: 'Competitors surfaced' }, { name: 'notes', label: 'Notes and confidence', type: 'textarea' }] },
  competitors: { eyebrow: 'Market intelligence', title: 'Competitors', description: 'The Phase 4 competitor universe and conservative historical change records. Monitoring must respect robots and low request frequency.', endpoint: 'competitors', source: 'Phase 4 research', connection: 'connected', columns: [{ key: 'name', label: 'Competitor' }, { key: 'domain', label: 'Domain' }, { key: 'category', label: 'Class' }, { key: 'market', label: 'Market' }, { key: 'priority', label: 'Priority' }, { key: 'active', label: 'Active' }] },
  recommendations: { eyebrow: 'Decision system', title: 'Recommendations', description: 'Evidence, impact, effort, and risk in one human-reviewed queue. Code fixes stop at a prepared proposal and never merge or deploy.', endpoint: 'recommendations', source: 'Evidence review', connection: 'connected', columns: [{ key: 'priority', label: 'Priority' }, { key: 'title', label: 'Recommendation' }, { key: 'action_type', label: 'Action type' }, { key: 'service', label: 'Service' }, { key: 'impact', label: 'Impact' }, { key: 'risk', label: 'Risk' }, { key: 'status', label: 'Status' }], fields: [{ name: 'title', label: 'Title', required: true }, { name: 'problem', label: 'What happened?', type: 'textarea', required: true }, { name: 'evidence', label: 'Evidence / source', type: 'textarea', required: true }, { name: 'next_action', label: 'What should Jeff do?', type: 'textarea', required: true }, { name: 'service', label: 'Affected service' }, { name: 'query', label: 'Affected query' }, { name: 'priority', label: 'Priority', type: 'select', options: ['P0', 'P1', 'P2', 'P3'], required: true }, { name: 'impact', label: 'Impact', type: 'select', options: ['high', 'medium', 'low'], required: true }, { name: 'effort', label: 'Effort', type: 'select', options: ['high', 'medium', 'low'], required: true }, { name: 'risk', label: 'Risk', type: 'select', options: ['high', 'medium', 'low'], required: true }, { name: 'action_type', label: 'Action type', type: 'select', options: ['CODE FIX', 'CONTENT FIX', 'SEO METADATA', 'INTERNAL LINKING', 'SCHEMA', 'PERFORMANCE', 'IMAGE SEO', 'LOCAL AUTHORITY', 'GOOGLE BUSINESS', 'REVIEW ACTION', 'BACKLINK ACTION', 'CITATION ACTION', 'PARTNERSHIP', 'CONTENT OPPORTUNITY', 'WEBMCP', 'CONVERSION', 'MANUAL TASK'], required: true }] },
  authority: { eyebrow: 'Local trust', title: 'Local authority', description: 'Founder-owned tasks for entity cleanup, citations, profiles, venues, vendors, publications, and legitimate review follow-up.', endpoint: 'authority', source: 'Founder evidence', connection: 'connected', columns: [{ key: 'priority', label: 'Priority' }, { key: 'task', label: 'Task' }, { key: 'category', label: 'Category' }, { key: 'owner', label: 'Owner' }, { key: 'due_date', label: 'Due' }, { key: 'status', label: 'Status' }, { key: 'verification', label: 'Verification' }], fields: [{ name: 'task', label: 'Task', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['Google Business', 'Citation', 'Identity cleanup', 'Venue relationship', 'Vendor relationship', 'Publication', 'Association', 'Social profile', 'Review workflow'], required: true }, { name: 'priority', label: 'Priority', type: 'select', options: ['P0', 'P1', 'P2', 'P3'], required: true }, { name: 'why', label: 'Why it matters', type: 'textarea', required: true }, { name: 'owner', label: 'Owner' }, { name: 'due_date', label: 'Due date', type: 'date' }, { name: 'evidence', label: 'Evidence', type: 'textarea' }] },
  content: { eyebrow: 'Owned advantage', title: 'Content opportunities', description: 'Real-work stories and firsthand expertise—not mass-generated location pages. Review volume remains tracked but deferred.', endpoint: 'content-opportunities', source: 'Recommendations', connection: 'connected', columns: [{ key: 'priority', label: 'Priority' }, { key: 'title', label: 'Opportunity' }, { key: 'service', label: 'Service' }, { key: 'evidence', label: 'Required evidence' }, { key: 'status', label: 'Status' }] },
  webmcp: { eyebrow: 'Agent discovery', title: 'WebMCP health', description: 'Registration and safety history for the four public tools. “Not tested” remains explicit until a timestamped test is stored.', endpoint: 'webmcp', source: 'Recorded browser verification', connection: 'connected', columns: [{ key: 'check_name', label: 'Tool' }, { key: 'status', label: 'Status' }, { key: 'latency_ms', label: 'Latency ms' }, { key: 'requires_human_submission', label: 'Human submission' }, { key: 'checked_at', label: 'Last tested' }] },
  performance: { eyebrow: 'Experience', title: 'Performance history', description: 'Timestamped mobile and desktop Lighthouse snapshots. The current baseline is a target, not a fabricated current reading.', endpoint: 'performance', source: 'Lighthouse', connection: 'connected', columns: [{ key: 'device', label: 'Device' }, { key: 'performance_score', label: 'Performance' }, { key: 'accessibility_score', label: 'Accessibility' }, { key: 'best_practices_score', label: 'Best practices' }, { key: 'seo_score', label: 'SEO' }, { key: 'lcp_ms', label: 'LCP ms' }, { key: 'tbt_ms', label: 'TBT ms' }, { key: 'cls', label: 'CLS' }, { key: 'measured_at', label: 'Measured' }], fields: [{ name: 'device', label: 'Device', type: 'select', options: ['mobile', 'desktop'], required: true }, { name: 'performance_score', label: 'Performance score', type: 'number', required: true }, { name: 'accessibility_score', label: 'Accessibility score', type: 'number' }, { name: 'best_practices_score', label: 'Best Practices score', type: 'number' }, { name: 'seo_score', label: 'SEO score', type: 'number' }, { name: 'lcp_ms', label: 'LCP (ms)', type: 'number' }, { name: 'tbt_ms', label: 'TBT (ms)', type: 'number' }, { name: 'cls', label: 'CLS', type: 'number' }, { name: 'source_url', label: 'Report URL / source' }] },
  'site-health': { eyebrow: 'Technical integrity', title: 'Site health', description: 'Recorded checks for crawlability, canonicals, images, booking, service worker, schema, and agent health.', endpoint: 'site-health', source: 'Recorded verification', connection: 'connected', columns: [{ key: 'check_name', label: 'Check' }, { key: 'scope', label: 'Scope' }, { key: 'status', label: 'Status' }, { key: 'evidence', label: 'Evidence' }, { key: 'checked_at', label: 'Checked' }] },
};

const GrowthWorkspace = ({ kind }: { kind: WorkspaceKind }) => {
  const config = configs[kind];
  const [rows, setRows] = useState<GrowthRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GrowthRecord>({});
  const [prepared, setPrepared] = useState<string | null>(null);
  const [liveConnection, setLiveConnection] = useState<string | null>(null);
  const [autoRuns, setAutoRuns] = useState<{ run_type: string; target: string; analysis: string; created_at: string }[]>([]);

  const load = () => { setError(null); growthGet<GrowthRecord[]>(config.endpoint).then(setRows).catch((reason: Error) => setError(reason.message)); };
  useEffect(load, [config.endpoint]);

  // Reflect the real configured provider instead of the static config fallback.
  useEffect(() => {
    if (kind !== 'ai' && kind !== 'search') return;
    (async () => {
      try {
        const status = await growthGet<Record<string, { status?: string }>>('integration-status');
        const key = kind === 'ai' ? 'seoAgentPro' : 'searchConsole';
        if (status?.[key]?.status) setLiveConnection(status[key].status as string);
      } catch { /* keep static fallback */ }
      if (kind === 'ai') {
        try {
          const runs = await growthGet<{ run_type: string; target: string; analysis: string; created_at: string }[]>('seo-auto-runs');
          setAutoRuns((runs || []).filter((r) => r.run_type === 'ai-visibility').slice(0, 5));
        } catch { /* table may not exist yet */ }
      }
    })();
  }, [kind]);
  const fields = useMemo(() => config.fields ?? [], [config.fields]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null);
    try { await growthPost(config.endpoint, form); setForm({}); setShowForm(false); load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save'); }
    finally { setSaving(false); }
  };

  const updateRecommendation = async (row: GrowthRecord, status: string) => {
    setError(null);
    try { await growthPatch(`recommendations/${row.id}`, { status }); load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update'); }
  };

  const prepareFix = async (row: GrowthRecord) => {
    setError(null);
    try { const proposal = await growthPost<GrowthRecord>(`recommendations/${row.id}/prepare-fix`, {}); setPrepared(`Proposal #${proposal.id} prepared. Human review and an explicit PR action are still required.`); load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to prepare fix'); }
  };

  // Real provider state overrides the static config fallback.
  const effectiveConnection = liveConnection ?? config.connection;
  const effectiveSource = kind === 'ai' && effectiveConnection === 'connected'
    ? 'SEOAgentPro (Hugging Face)'
    : config.source;
  const effectiveDescription = kind === 'ai' && effectiveConnection === 'connected'
    ? 'Automated predictive AI-visibility analysis (SEOAgentPro) runs every Monday at 7:30 AM ET, plus on-demand checks and recorded manual observations. Results are predictive, not verified citations.'
    : config.description;

  return <div><PageHeader eyebrow={config.eyebrow} title={config.title} description={effectiveDescription} action={fields.length ? <Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-2 h-4 w-4" />Add verified record</Button> : undefined} /><SourceBadge source={effectiveSource} status={effectiveConnection} />{error && <div className="mt-4"><ErrorNotice message={error} /></div>}{prepared && <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><ShieldCheck className="h-4 w-4 shrink-0" />{prepared}</div>}
    {kind === 'search' && <Card className={`mt-5 ${effectiveConnection === 'connected' ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}><CardContent className="p-4"><p className="text-sm font-medium">Google Search Console: {effectiveConnection === 'connected' ? 'CONNECTED' : 'NOT CONNECTED'}</p><p className="mt-1 text-xs text-neutral-400">Credentials stay server-side. Manual observations can be recorded now with source, context, and confidence.</p></CardContent></Card>}
    {kind === 'ai' && <Card className="mt-5"><CardHeader><CardTitle className="text-base">Reusable query library</CardTitle><CardDescription>Run manually in a clean provider session and record only what was actually observed.</CardDescription></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">{['Find a photographer in Providence Rhode Island.', 'Find a wedding photographer in Providence.', 'Find an engagement photographer in Rhode Island.', 'Find a Sweet 16 photographer in Providence.', 'Find a headshot photographer near Providence.', 'Find an editorial photographer in New England.'].map((prompt) => <button key={prompt} className="rounded-lg border p-3 text-left text-sm hover:bg-neutral-900" onClick={() => { setForm((current) => ({ ...current, test_prompt: prompt })); setShowForm(true); }}>{prompt}</button>)}</CardContent></Card>}
    {kind === 'ai' && <Card className="mt-5"><CardHeader><CardTitle className="text-base">Latest automated analyses</CardTitle><CardDescription>Stored weekly SEOAgentPro predictive checks — not live provider output.</CardDescription></CardHeader><CardContent>{autoRuns.length ? autoRuns.map((run, i) => <div key={i} className="mb-3 rounded-md border p-4"><div className="mb-2 flex items-center gap-2"><span className="text-sm font-medium">{run.target}</span><span className="ml-auto text-xs text-neutral-400">{new Date(run.created_at).toLocaleDateString()}</span></div><p className="whitespace-pre-wrap text-sm">{run.analysis}</p></div>) : <p className="text-sm text-neutral-400">No automated runs stored yet. The first weekly run lands Monday at 7:30 AM ET.</p>}</CardContent></Card>}
    {showForm && <Card className="mt-5"><CardHeader><CardTitle className="text-base">Add verified evidence</CardTitle><CardDescription>Every external observation needs a source and timestamp. Empty values remain empty.</CardDescription></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>{fields.map((field) => <div className={field.type === 'textarea' ? 'md:col-span-2' : ''} key={field.name}><Label htmlFor={field.name}>{field.label}</Label>{field.type === 'select' ? <Select value={String(form[field.name] ?? '')} onValueChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}><SelectTrigger className="mt-1 bg-neutral-950"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{field.options?.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select> : field.type === 'textarea' ? <Textarea id={field.name} className="mt-1" required={field.required} value={String(form[field.name] ?? '')} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} /> : <Input id={field.name} className="mt-1" type={field.type ?? 'text'} required={field.required} value={String(form[field.name] ?? '')} onChange={(event) => setForm((current) => ({ ...current, [field.name]: field.type === 'number' ? Number(event.target.value) : event.target.value }))} />}</div>)}<div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save verified record'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div></form></CardContent></Card>}
    <Card className="mt-5"><CardContent className="p-0">{rows?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left text-sm"><thead className="border-b bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400"><tr>{config.columns.map((column) => <th className="p-4" key={column.key}>{column.label}</th>)}{kind === 'recommendations' && <th className="p-4">Review</th>}</tr></thead><tbody className="divide-y">{rows.map((row, index) => <tr key={String(row.id ?? index)}>{config.columns.map((column) => <td className="max-w-[260px] p-4 align-top" key={column.key}>{column.key === 'domain' && row[column.key] ? <a className="inline-flex items-center gap-1 text-rose-700 hover:underline" href={`https://${row[column.key]}`} target="_blank" rel="noreferrer">{displayValue(row[column.key])}<ExternalLink className="h-3 w-3" /></a> : ['status', 'priority', 'action_type'].includes(column.key) ? <Badge variant="outline">{displayValue(row[column.key])}</Badge> : <span className="line-clamp-3">{displayValue(row[column.key])}</span>}</td>)}{kind === 'recommendations' && <td className="p-4"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => updateRecommendation(row, 'Reviewed')}><CircleCheck className="mr-1 h-3.5 w-3.5" />Review</Button>{row.action_type === 'CODE FIX' && <Button size="sm" onClick={() => prepareFix(row)} disabled={!['Reviewed', 'Approved'].includes(String(row.status))}><GitPullRequest className="mr-1 h-3.5 w-3.5" />Prepare fix</Button>}</div></td>}</tr>)}</tbody></table></div> : rows ? <div className="p-6"><EmptyState /></div> : <div className="flex h-40 items-center justify-center text-sm text-neutral-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading records…</div>}</CardContent></Card>
  </div>;
};

export default GrowthWorkspace;
