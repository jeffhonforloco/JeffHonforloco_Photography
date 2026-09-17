import React, { useCallback, useEffect, useState } from 'react';
import {
  BadgeDollarSign, Plus, Search, X, Loader2, ExternalLink,
  CircleCheck, RotateCcw, Settings2, Copy, Check,
} from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

interface Payment {
  id: number; service_id: string; service_name: string; tier_name: string;
  payment_type: string; amount_cents: number; total_agreed_cents: number;
  currency: string; status: string; paypal_order_id: string | null;
  paypal_capture_id: string | null; booking_id: number | null;
  customer_name: string | null; email: string; phone: string | null;
  notes: string | null; linked_payment_id: number | null;
  paid_at: string | null; created_at: string; updated_at: string;
}

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const dollarsToCents = (s: string) => Math.round((parseFloat(s) || 0) * 100);

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  refunded: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  partially_refunded: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  expired: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const AdminServicePayments: React.FC = () => {
  const [tab, setTab] = useState<'payments' | 'invoice' | 'settings'>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [services, setServices] = useState<any[]>([]);
  const [invoice, setInvoice] = useState({
    service_id: '', tier_name: '', payment_type: 'full',
    amount: '', customer_name: '', email: '', phone: '', notes: '',
  });
  const [invoiceResult, setInvoiceResult] = useState<{ payment_id: number; payment_url: string; amount_cents: number } | null>(null);
  const [depositPct, setDepositPct] = useState('75');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadPayments = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search.trim()) params.set('q', search.trim());
    const res = await fetch(apiUrl(`/api/v1/admin/services/payments?${params}`), { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load payments');
    setPayments(data.data.payments);
  }, [statusFilter, search]);

  const loadMeta = useCallback(async () => {
    const [svcRes, setRes] = await Promise.all([
      fetch(apiUrl('/api/v1/services/pricing')),
      fetch(apiUrl('/api/v1/admin/services/settings'), { headers: authHeaders() }),
    ]);
    const svcData = await svcRes.json().catch(() => null);
    if (svcRes.ok && svcData?.success) setServices(svcData.data.services || []);
    const setData = await setRes.json().catch(() => null);
    if (setRes.ok && setData?.success) setDepositPct(String(setData.data.deposit_percent));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadPayments(), loadMeta()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadPayments, loadMeta]);

  const refresh = async () => {
    try { await loadPayments(); } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
  };

  const doRefund = async (p: Payment) => {
    if (!window.confirm(`Refund ${fmt(p.amount_cents)} to ${p.email} via PayPal?`)) return;
    setActionBusy(true);
    setActionMsg('');
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/services/payments/${p.id}/refund`), {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Refund failed');
      setActionMsg(`Refunded ${fmt(p.amount_cents)} — status is now ${data.data.status}.`);
      setSelected({ ...p, status: data.data.status });
      await refresh();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setActionBusy(false);
    }
  };

  const createInvoice = async () => {
    setActionMsg('');
    setInvoiceResult(null);
    const cents = dollarsToCents(invoice.amount);
    if (!invoice.service_id || !invoice.tier_name) { setActionMsg('Choose a service and package.'); return; }
    if (cents < 100) { setActionMsg('Amount must be at least $1.00.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(invoice.email.trim())) { setActionMsg('A valid client email is required.'); return; }
    setActionBusy(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/services/payments'), {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          service_id: invoice.service_id,
          tier_name: invoice.tier_name,
          payment_type: invoice.payment_type,
          amount_cents: cents,
          customer_name: invoice.customer_name.trim() || undefined,
          email: invoice.email.trim(),
          phone: invoice.phone.trim() || undefined,
          notes: invoice.notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Invoice failed');
      setInvoiceResult(data.data);
      await refresh();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Invoice failed');
    } finally {
      setActionBusy(false);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setActionMsg('');
    try {
      const res = await fetch(apiUrl('/api/v1/admin/services/settings'), {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ deposit_percent: parseInt(depositPct, 10) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      setActionMsg(`Deposit default updated to ${data.data.deposit_percent}%.`);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSettingsSaving(false);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const invoiceService = services.find((s: any) => s.id === invoice.service_id);

  return (
    <div className="admin-dark min-h-screen bg-black p-4 text-neutral-200 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <BadgeDollarSign className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Service Payments</h1>
            <p className="text-sm text-neutral-400">Deposits, balances, and full payments for photography services — PayPal only.</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {(['payments', 'invoice', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setActionMsg(''); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-white text-black' : 'border border-white/20 text-neutral-300 hover:border-white/50'}`}
            >
              {t === 'invoice' ? 'New invoice' : t}
            </button>
          ))}
        </div>

        {actionMsg && (
          <div className="mb-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-neutral-200">{actionMsg}</div>
        )}

        {tab === 'payments' && (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refresh()}
                  placeholder="Search name, email, service…"
                  className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially refunded</option>
                <option value="failed">Failed</option>
              </select>
              <Button onClick={refresh} variant="outline" size="sm">Refresh</Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-neutral-400"><Loader2 className="h-5 w-5 animate-spin" /> Loading payments…</div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            ) : payments.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-12 text-center text-sm text-neutral-500">
                No service payments yet. Create an invoice or share the <span className="text-neutral-300">/pay</span> page with clients.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-neutral-500">
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} onClick={() => setSelected(p)} className="cursor-pointer border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{p.customer_name || '—'}</div>
                          <div className="text-xs text-neutral-500">{p.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-neutral-200">{p.service_name}</div>
                          <div className="text-xs text-neutral-500">{p.tier_name}</div>
                        </td>
                        <td className="px-4 py-3 capitalize text-neutral-300">{p.payment_type}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white">{fmt(p.amount_cents)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={STATUS_STYLES[p.status] || ''}>{p.status.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'invoice' && (
          <div className="max-w-xl rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-lg font-bold text-white">Create a payment invoice</h2>
            <p className="mb-4 text-xs text-neutral-500">Generates a PayPal payment link you can send the client (email, text, DM).</p>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Service</label>
                  <select value={invoice.service_id} onChange={(e) => setInvoice({ ...invoice, service_id: e.target.value, tier_name: '' })} className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white">
                    <option value="">Choose…</option>
                    {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Package</label>
                  <select value={invoice.tier_name} onChange={(e) => setInvoice({ ...invoice, tier_name: e.target.value })} className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white">
                    <option value="">Choose…</option>
                    {(invoiceService?.tiers || []).map((t: any) => <option key={t.name} value={t.name}>{t.name} — {t.price}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Payment type</label>
                  <select value={invoice.payment_type} onChange={(e) => setInvoice({ ...invoice, payment_type: e.target.value })} className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white">
                    <option value="full">Full payment</option>
                    <option value="deposit">Deposit</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Amount (USD)</label>
                  <input value={invoice.amount} onChange={(e) => setInvoice({ ...invoice, amount: e.target.value })} placeholder="250.00" inputMode="decimal" className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Client name</label>
                  <input value={invoice.customer_name} onChange={(e) => setInvoice({ ...invoice, customer_name: e.target.value })} placeholder="Jane Doe" className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">Client email</label>
                  <input type="email" value={invoice.email} onChange={(e) => setInvoice({ ...invoice, email: e.target.value })} placeholder="client@email.com" className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">Notes (optional)</label>
                <input value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} placeholder="Session date, location…" className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
              </div>
              <Button onClick={createInvoice} disabled={actionBusy} className="w-full">
                {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Generate PayPal payment link
              </Button>
            </div>
            {invoiceResult && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><CircleCheck className="h-4 w-4" /> Invoice ready — {fmt(invoiceResult.amount_cents)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-black/40 px-2 py-1 text-xs text-neutral-300">{invoiceResult.payment_url}</code>
                  <Button size="sm" variant="outline" onClick={() => copyLink(invoiceResult.payment_url)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <a href={invoiceResult.payment_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-300 hover:underline">
                  Open payment link <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-xl rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Settings2 className="h-5 w-5" /> Payment settings</h2>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Default deposit (% of package price)</label>
            <p className="mb-2 text-xs text-neutral-500">Used when a client chooses “Deposit” on the /pay page.</p>
            <div className="flex gap-2">
              <input value={depositPct} onChange={(e) => setDepositPct(e.target.value)} inputMode="numeric" className="w-24 rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white" />
              <Button onClick={saveSettings} disabled={settingsSaving}>{settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}</Button>
            </div>
          </div>
        )}

        {/* Detail drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-lg rounded-xl border border-white/15 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.service_name}</h3>
                  <p className="text-sm text-neutral-400">{selected.tier_name} — <span className="capitalize">{selected.payment_type}</span></p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 text-neutral-500 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{fmt(selected.amount_cents)}</span>
                <Badge variant="outline" className={STATUS_STYLES[selected.status] || ''}>{selected.status.replace(/_/g, ' ')}</Badge>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Client</dt><dd className="text-neutral-200">{selected.customer_name || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd className="text-neutral-200">{selected.email}</dd></div>
                {selected.phone && <div className="flex justify-between"><dt className="text-neutral-500">Phone</dt><dd className="text-neutral-200">{selected.phone}</dd></div>}
                <div className="flex justify-between"><dt className="text-neutral-500">Agreed total</dt><dd className="text-neutral-200">{fmt(selected.total_agreed_cents)}</dd></div>
                {selected.booking_id && <div className="flex justify-between"><dt className="text-neutral-500">Booking</dt><dd className="text-neutral-200">#{selected.booking_id}</dd></div>}
                {selected.paypal_capture_id && <div className="flex justify-between gap-4"><dt className="text-neutral-500">PayPal capture</dt><dd className="truncate text-neutral-200">{selected.paypal_capture_id}</dd></div>}
                {selected.notes && <div className="flex justify-between gap-4"><dt className="text-neutral-500">Notes</dt><dd className="text-right text-neutral-200">{selected.notes}</dd></div>}
                <div className="flex justify-between"><dt className="text-neutral-500">Created</dt><dd className="text-neutral-200">{new Date(selected.created_at).toLocaleString()}</dd></div>
                {selected.paid_at && <div className="flex justify-between"><dt className="text-neutral-500">Paid</dt><dd className="text-neutral-200">{new Date(selected.paid_at).toLocaleString()}</dd></div>}
              </dl>
              <div className="mt-5 flex gap-2">
                {selected.status === 'paid' && (
                  <Button onClick={() => doRefund(selected)} disabled={actionBusy} variant="outline" size="sm">
                    <RotateCcw className="h-3.5 w-3.5" /> Refund via PayPal
                  </Button>
                )}
                <Button onClick={() => setSelected(null)} variant="outline" size="sm">Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServicePayments;
