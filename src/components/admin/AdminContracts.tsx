import React, { useCallback, useEffect, useState } from 'react';
import {
  FileText, Plus, Search, X, Loader2, Send, Trash2, Copy, Check,
  ExternalLink, Printer, PenLine, Users, DollarSign, AlertTriangle,
} from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

interface ContractSummary {
  id: number; type: 'paid' | 'collab'; title: string; client_name: string; client_email: string;
  status: 'draft' | 'sent' | 'signed' | 'completed'; token: string | null; token_expires_at: string | null;
  signer_name: string | null; signed_at: string | null; sent_at: string | null; created_at: string;
}
interface ContractDetail extends ContractSummary {
  client_phone: string | null; body_text: string; data_json: string;
  signer_ip: string | null; signer_ua: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  signed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-purple-100 text-purple-700',
};

const PAID_FIELDS: { key: string; label: string; type?: string; rows?: number; placeholder?: string }[] = [
  { key: 'client_name', label: 'Client full name', placeholder: 'Jane Doe' },
  { key: 'client_email', label: 'Client email', type: 'email', placeholder: 'jane@email.com' },
  { key: 'client_phone', label: 'Client phone', placeholder: '+1-...' },
  { key: 'shoot_date', label: 'Shoot date', type: 'date' },
  { key: 'location', label: 'Location', placeholder: 'Providence, RI' },
  { key: 'services_description', label: 'Services description', rows: 3, placeholder: '2-hour fashion editorial shoot, 3 looks, studio + outdoor…' },
  { key: 'total_fee', label: 'Total fee', placeholder: '$499' },
  { key: 'deposit_amount', label: 'Deposit amount', placeholder: '$150' },
  { key: 'deposit_due_date', label: 'Deposit due date', type: 'date' },
  { key: 'balance_due_date', label: 'Balance due date', type: 'date' },
  { key: 'deliverables', label: 'Deliverables', rows: 2, placeholder: '25 retouched high-resolution images…' },
  { key: 'delivery_timeline', label: 'Delivery timeline', placeholder: '2–3 weeks after the shoot' },
  { key: 'usage_rights', label: 'Usage rights', rows: 2 },
  { key: 'cancellation_policy', label: 'Cancellation / reschedule policy', rows: 2 },
];

const COLLAB_FIELDS: { key: string; label: string; type?: string; rows?: number; placeholder?: string }[] = [
  { key: 'collaborator_name', label: 'Collaborator full name', placeholder: 'Alex Model' },
  { key: 'collaborator_handle', label: 'Collaborator handle', placeholder: '@alexmodel' },
  { key: 'collaborator_email', label: 'Collaborator email', type: 'email', placeholder: 'alex@email.com' },
  { key: 'collaborator_phone', label: 'Collaborator phone', placeholder: '+1-...' },
  { key: 'shoot_date', label: 'Shoot date', type: 'date' },
  { key: 'location', label: 'Location', placeholder: 'Providence, RI' },
  { key: 'services_description', label: 'Shoot concept', rows: 3, placeholder: 'Moody street-style editorial, 2 looks…' },
  { key: 'deliverables', label: 'Deliverables (each party)', rows: 2, placeholder: '10 retouched high-resolution images each…' },
  { key: 'delivery_timeline', label: 'Delivery timeline', placeholder: '2–3 weeks after the shoot' },
];

const PLACEHOLDERS = [
  'client_name', 'client_email', 'client_phone', 'collaborator_name', 'collaborator_handle',
  'collaborator_email', 'collaborator_phone', 'shoot_date', 'location', 'services_description',
  'total_fee', 'deposit_amount', 'deposit_due_date', 'balance_due_date', 'deliverables',
  'delivery_timeline', 'usage_rights', 'cancellation_policy', 'photographer_name',
  'photographer_email', 'photographer_phone', 'photographer_handle', 'sign_date',
];

const emptyForm = (): Record<string, string> => Object.fromEntries(
  [...PAID_FIELDS, ...COLLAB_FIELDS].map((f) => [f.key, ''])
);

const AdminContracts: React.FC = () => {
  const [tab, setTab] = useState<'contracts' | 'templates'>('contracts');
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<'paid' | 'collab'>('paid');
  const [form, setForm] = useState<Record<string, string>>(emptyForm());
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [detail, setDetail] = useState<ContractDetail | null>(null);
  const [sendResult, setSendResult] = useState<{ signUrl: string; emailed: boolean; emailError: string | null; needsResend: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [templates, setTemplates] = useState<{ type: string; body_text: string }[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(apiUrl(`/api/v1/admin/contracts?${params}`), { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load contracts');
      setContracts(data.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Load failed'); }
    setLoading(false);
  }, [typeFilter, statusFilter, search]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/admin/contracts/templates'), { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTemplates(data.data);
      else setError(data.error || 'Failed to load templates');
    } catch { setError('Failed to load templates'); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'templates' && templates.length === 0) loadTemplates(); }, [tab, loadTemplates, templates.length]);

  const openCreate = () => { setForm(emptyForm()); setTitle(''); setCreateType('paid'); setSendResult(null); setCreateError(null); setShowCreate(true); };

  const create = async () => {
    // The worker rejects contracts without a client name + email (400) —
    // catch it here so the user sees a clear inline message.
    const nameKey = createType === 'paid' ? 'client_name' : 'collaborator_name';
    const emailKey = createType === 'paid' ? 'client_email' : 'collaborator_email';
    if (!form[nameKey]?.trim()) { setCreateError('Client / collaborator name is required.'); return; }
    if (!form[emailKey]?.trim() || !form[emailKey].includes('@')) { setCreateError('A valid client / collaborator email is required.'); return; }
    setSaving(true); setCreateError(null);
    try {
      const fields = createType === 'paid' ? PAID_FIELDS : COLLAB_FIELDS;
      const data: Record<string, string> = {};
      fields.forEach((f) => { data[f.key] = form[f.key] || ''; });
      const res = await fetch(apiUrl('/api/v1/admin/contracts'), {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ type: createType, title: title.trim(), data }),
      });
      const out = await res.json();
      if (!out.success) throw new Error(out.error || 'Create failed');
      setShowCreate(false); load();
    } catch (e) { setCreateError(e instanceof Error ? e.message : 'Create failed'); }
    setSaving(false);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/contracts/${id}`), { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setDetail(data.data); setSendResult(null); setCopied(false); }
      else setError(data.error || 'Failed to load contract');
    } catch { setError('Failed to load contract'); }
  };

  const send = async (id: number) => {
    setSending(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/contracts/${id}/send`), { method: 'POST', headers: authHeaders() });
      const out = await res.json();
      if (!out.success) throw new Error(out.error || 'Send failed');
      setSendResult(out.data);
      load(); openDetail(id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Send failed'); }
    setSending(false);
  };

  const markCompleted = async (id: number) => {
    const res = await fetch(apiUrl(`/api/v1/admin/contracts/${id}`), {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'completed' }),
    });
    const out = await res.json();
    if (out.success) { setConfirmCompleteId(null); load(); openDetail(id); } else setError(out.error || 'Failed');
  };

  const del = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/contracts/${id}`), { method: 'DELETE', headers: authHeaders() });
      const out = await res.json();
      if (out.success) { setDetail(null); setConfirmDeleteId(null); load(); } else setError(out.error || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const openTemplateEditor = (type: string, body: string) => { setEditingTemplate(type); setTemplateText(body); };
  const saveTemplate = async () => {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/contracts/templates/${editingTemplate}`), {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ body_text: templateText }),
      });
      const out = await res.json();
      if (!out.success) throw new Error(out.error || 'Save failed');
      setEditingTemplate(null); loadTemplates();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    setSavingTemplate(false);
  };

  const printContract = () => {
    if (!detail) return;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.write(`<html><head><title>Contract — ${detail.title}</title><style>
      body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6;white-space:pre-wrap}
      h1{font-size:20px;margin-bottom:24px}
      .meta{font-size:13px;color:#555;margin-bottom:24px;border-bottom:1px solid #ddd;padding-bottom:12px}
      @media print{body{margin:0}}</style></head><body>
      <h1>${detail.title}</h1>
      <div class="meta">Status: ${detail.status.toUpperCase()}${detail.signer_name ? ` · Signed by ${detail.signer_name} on ${detail.signed_at}` : ''}</div>
      ${detail.body_text.replace(/</g, '&lt;')}
      <script>window.onload=()=>window.print()</scr` + `ipt></body></html>`);
    w.document.close();
  };

  const fields = createType === 'paid' ? PAID_FIELDS : COLLAB_FIELDS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><FileText className="h-6 w-6" /> Contracts</h1>
          <p className="text-sm text-neutral-400">Paid gigs and collaboration (TFP) agreements — create, send, and collect e-signatures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'contracts' ? 'default' : 'outline'} onClick={() => setTab('contracts')}>Contracts</Button>
          <Button variant={tab === 'templates' ? 'default' : 'outline'} onClick={() => setTab('templates')}>Templates</Button>
          {tab === 'contracts' && <Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New contract</Button>}
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#f2a3b1]">
          <span>{error}</span>
          <button onClick={() => { setError(null); load(); }} className="shrink-0 font-semibold text-[#c8102e] underline-offset-2 hover:underline">Retry</button>
        </div>
      )}

      {tab === 'contracts' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contracts…"
                className="w-56 rounded-lg border border-neutral-800 py-2 pl-9 pr-3 text-sm focus:border-neutral-500 focus:outline-none" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <option value="all">All types</option><option value="paid">Paid gigs</option><option value="collab">Collaborations</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <option value="all">All statuses</option><option value="draft">Draft</option><option value="sent">Sent</option>
              <option value="signed">Signed</option><option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-neutral-500" /></div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 py-16 text-center text-neutral-400">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p>No contracts yet. Create one for your next paid gig or collab.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contracts.map((ct) => (
                <button key={ct.id} onClick={() => openDetail(ct.id)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-neutral-800 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                      {ct.type === 'paid' ? <DollarSign className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                      {ct.type === 'paid' ? 'Paid gig' : 'Collab'}
                    </span>
                    <Badge className={STATUS_COLORS[ct.status] || ''}>{ct.status}</Badge>
                  </div>
                  <p className="mt-2 font-semibold text-white">{ct.title}</p>
                  <p className="text-sm text-neutral-400">{ct.client_name} · {ct.client_email}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {ct.status === 'signed' && ct.signer_name ? `Signed by ${ct.signer_name} · ${ct.signed_at}` : `Created ${ct.created_at?.slice(0, 10)}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Template editor</p>
            <p className="mt-1">Edit the default contract text for each type. Use <code className="rounded bg-blue-100 px-1">{`{placeholders}`}</code> like:</p>
            <p className="mt-2 flex flex-wrap gap-1">{PLACEHOLDERS.map((p) => (
              <code key={p} className="rounded bg-neutral-950 px-1.5 py-0.5 text-xs text-blue-700">{`{${p}}`}</code>
            ))}</p>
            <p className="mt-2 text-xs">New contracts render from these templates. Already-created contracts keep their original text.</p>
          </div>
          {templates.map((t) => (
            <div key={t.type} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t.type === 'paid' ? 'Paid Gig Contract' : 'Collaboration (TFP) Contract'}</p>
                {editingTemplate === t.type ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                    <Button size="sm" onClick={saveTemplate} disabled={savingTemplate}>
                      {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save template'}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => openTemplateEditor(t.type, t.body_text)}><PenLine className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                )}
              </div>
              {editingTemplate === t.type ? (
                <textarea value={templateText} onChange={(e) => setTemplateText(e.target.value)} rows={22}
                  className="mt-3 w-full rounded-lg border border-neutral-800 p-3 font-mono text-xs leading-relaxed focus:border-neutral-500 focus:outline-none" />
              ) : (
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-3 text-xs text-neutral-400">{t.body_text.slice(0, 1200)}{t.body_text.length > 1200 ? '…' : ''}</pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------- Create modal ---------- */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setShowCreate(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-neutral-950 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New contract</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close"><X className="h-5 w-5 text-neutral-500" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setCreateType('paid')}
                className={`rounded-xl border p-4 text-left ${createType === 'paid' ? 'border-slate-900 bg-slate-900 text-white' : 'border-neutral-800'}`}>
                <DollarSign className="h-5 w-5" /><p className="mt-1 font-semibold">Paid gig</p>
                <p className={`text-xs ${createType === 'paid' ? 'text-slate-300' : 'text-neutral-400'}`}>Client pays for the shoot</p>
              </button>
              <button onClick={() => setCreateType('collab')}
                className={`rounded-xl border p-4 text-left ${createType === 'collab' ? 'border-slate-900 bg-slate-900 text-white' : 'border-neutral-800'}`}>
                <Users className="h-5 w-5" /><p className="mt-1 font-semibold">Collaboration (TFP)</p>
                <p className={`text-xs ${createType === 'collab' ? 'text-slate-300' : 'text-neutral-400'}`}>Trade time & talent, no money</p>
              </button>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Contract title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fashion editorial — Jane Doe — Sept 2026"
                className="mt-1 w-full rounded-lg border border-neutral-800 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.rows ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{f.label}</label>
                  {f.rows ? (
                    <textarea value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={f.rows} placeholder={f.placeholder}
                      className="mt-1 w-full rounded-lg border border-neutral-800 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none" />
                  ) : (
                    <input value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      type={f.type || 'text'} placeholder={f.placeholder}
                      className="mt-1 w-full rounded-lg border border-neutral-800 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create contract'}</Button>
            </div>
            {createError && (
              <p className="mt-3 rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-3 py-2 text-sm text-[#f2a3b1]">{createError}</p>
            )}
          </div>
        </div>
      )}

      {/* ---------- Detail modal ---------- */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-neutral-950 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[detail.status] || ''}>{detail.status}</Badge>
                  <Badge variant="outline">{detail.type === 'paid' ? 'Paid gig' : 'Collab (TFP)'}</Badge>
                </div>
                <h2 className="mt-2 text-lg font-bold">{detail.title}</h2>
                <p className="text-sm text-neutral-400">{detail.client_name} · {detail.client_email}{detail.client_phone ? ` · ${detail.client_phone}` : ''}</p>
                {detail.signer_name && (
                  <p className="mt-1 text-sm text-emerald-700">Signed by {detail.signer_name} on {detail.signed_at}</p>
                )}
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close"><X className="h-5 w-5 text-neutral-500" /></button>
            </div>

            {sendResult && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="flex items-center gap-1 text-sm font-semibold text-emerald-800">
                  <Check className="h-4 w-4" /> {sendResult.emailed ? 'Signing link emailed to the client.' : 'Signing link ready.'}
                </p>
                {!sendResult.emailed && (
                  <p className="mt-1 text-xs text-emerald-700">
                    {sendResult.needsResend ? 'Email not configured (RESEND_API_KEY) — copy the link and send it manually.' : `Email failed: ${sendResult.emailError || 'unknown'} — copy the link instead.`}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-neutral-950 px-2 py-1 text-xs">{sendResult.signUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => copyLink(sendResult.signUrl)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <a href={sendResult.signUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><ExternalLink className="h-3.5 w-3.5" /></Button></a>
                </div>
              </div>
            )}

            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-900 p-4 font-serif text-sm leading-relaxed text-neutral-100">{detail.body_text}</pre>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={printContract}><Printer className="mr-1 h-4 w-4" /> Print / PDF</Button>
              {(detail.status === 'draft' || detail.status === 'sent') && (
                <>
                  <Button onClick={() => send(detail.id)} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                    {detail.status === 'sent' ? 'Re-send signing link' : 'Send for signature'}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmDeleteId(detail.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </>
              )}
              {detail.status === 'signed' && (
                <Button onClick={() => setConfirmCompleteId(detail.id)}><Check className="mr-1 h-4 w-4" /> Mark completed</Button>
              )}
            </div>
            {(detail.status === 'signed' || detail.status === 'completed') && (
              <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                <AlertTriangle className="h-3.5 w-3.5" /> Signed contracts are locked — they can't be edited or deleted.
              </p>
            )}
          </div>
        </div>
      )}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true" aria-label="Confirm contract deletion">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold text-neutral-900">Delete contract?</h3>
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-700">This cannot be undone. The contract will be permanently removed.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>Cancel</Button>
              <Button onClick={() => del(confirmDeleteId)} disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">
                {deleting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {confirmCompleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true" aria-label="Confirm contract completion">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Mark as completed?</h3>
            <p className="mt-2 text-sm font-medium text-neutral-700">This will mark the contract as completed.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmCompleteId(null)}>Cancel</Button>
              <Button onClick={() => markCompleted(confirmCompleteId)} className="bg-green-600 text-white hover:bg-green-700">
                Mark completed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContracts;
