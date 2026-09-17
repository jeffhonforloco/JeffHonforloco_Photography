import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Camera, Loader2, Lock, Search } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';

interface Tier { name: string; price: string; starting: number }
interface Service { id: string; name: string; tagline: string; starting: number; tiers: Tier[] }

type PayKind = 'full' | 'deposit' | 'balance';

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 === 0 ? 0 : 2 });

const ServicePay: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [depositPct, setDepositPct] = useState(75);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [serviceId, setServiceId] = useState('');
  const [tierName, setTierName] = useState('');
  const [payKind, setPayKind] = useState<PayKind>('full');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Balance lookup
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [priorPayments, setPriorPayments] = useState<any[]>([]);
  const [linkedPaymentId, setLinkedPaymentId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canceled = new URLSearchParams(window.location.search).get('canceled') === '1';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/v1/services/pricing'));
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setServices(data.data.services || []);
          setDepositPct(data.data.deposit_percent || 75);
        } else {
          setLoadError('Could not load services — please try again.');
        }
      } catch {
        setLoadError('Could not load services — please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const service = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);
  const tier = useMemo(() => service?.tiers.find((t) => t.name === tierName) || null, [service, tierName]);
  const isCustom = tier?.price === 'Custom';

  const amountCents = useMemo(() => {
    if (!tier || isCustom) return 0;
    const base = Math.round(tier.starting * 100);
    if (payKind === 'deposit') return Math.round((base * depositPct) / 100);
    if (payKind === 'balance') {
      const linked = priorPayments.find((p) => p.id === linkedPaymentId);
      if (!linked) return 0;
      const paidSoFar = priorPayments
        .filter((p) => p.status === 'paid' && (p.id === linked.id || p.linked_payment_id === linked.id))
        .reduce((s, p) => s + p.amount_cents, 0);
      return Math.max(0, linked.total_agreed_cents - paidSoFar);
    }
    return base;
  }, [tier, isCustom, payKind, depositPct, priorPayments, linkedPaymentId]);

  const lookupPayments = async () => {
    setLookupError('');
    setLookupLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/services/my-payments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookupEmail.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const paid = (data.data.payments || []).filter((p: any) => p.status === 'paid');
        setPriorPayments(paid);
        if (paid.length === 0) setLookupError('No paid deposits found for that email.');
        else {
          const first = paid[0];
          setLinkedPaymentId(first.id);
          setServiceId(first.service_id);
          setTierName(first.tier_name);
          setEmail(lookupEmail.trim());
        }
      } else {
        setLookupError(data?.error || 'Lookup failed — please try again.');
      }
    } catch {
      setLookupError('Lookup failed — please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const startCheckout = async () => {
    setSubmitError('');
    if (!service || !tier || isCustom || amountCents <= 0) {
      setSubmitError('Please choose a service, package, and payment option.');
      return;
    }
    if (!name.trim()) { setSubmitError('Your name is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setSubmitError('A valid email is required for the receipt.'); return; }
    if (payKind === 'balance' && !linkedPaymentId) { setSubmitError('Select the deposit this balance settles.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/v1/services/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          tier_name: tier.name,
          payment_type: payKind,
          linked_payment_id: payKind === 'balance' ? linkedPaymentId : undefined,
          customer_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.data?.url) {
        window.location.href = data.data.url;
      } else {
        setSubmitError(data?.error || 'Could not start checkout — please try again.');
      }
    } catch {
      setSubmitError('Could not start checkout — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <Camera className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-3xl font-bold">Pay for your session</h1>
            <p className="mt-1 text-sm text-zinc-400">Secure payment through PayPal — deposit, balance, or full amount.</p>
          </div>
        </div>

        {canceled && (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            The PayPal checkout was canceled — no charge was made. You can start again below.
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading services…
          </div>
        ) : loadError ? (
          <div className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{loadError}</div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Payment type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">What are you paying?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['full', 'deposit', 'balance'] as PayKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { setPayKind(k); setSubmitError(''); }}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                      payKind === k ? 'border-white bg-white text-black' : 'border-white/20 text-zinc-300 hover:border-white/50'
                    }`}
                  >
                    {k === 'deposit' ? `Deposit (${depositPct}%)` : k}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance lookup */}
            {payKind === 'balance' && (
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <label className="mb-2 block text-sm font-semibold text-zinc-300">Find your deposit</label>
                <p className="mb-3 text-xs text-zinc-500">Enter the email you used for your deposit to see what you still owe.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={lookupPayments}
                    disabled={lookupLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                  >
                    {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find
                  </button>
                </div>
                {lookupError && <p className="mt-2 text-xs text-red-300">{lookupError}</p>}
                {priorPayments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {priorPayments.map((p) => {
                      const remaining = p.total_agreed_cents - p.amount_cents;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setLinkedPaymentId(p.id); setServiceId(p.service_id); setTierName(p.tier_name); }}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                            linkedPaymentId === p.id ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <span>
                            <span className="font-semibold">{p.service_name} — {p.tier_name}</span>
                            <span className="block text-xs text-zinc-500">Paid {money(p.amount_cents)} deposit</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-zinc-400">
                            {linkedPaymentId === p.id && <BadgeCheck className="h-4 w-4 text-emerald-400" />}
                            Owes {money(Math.max(0, remaining))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Service + tier */}
            {payKind !== 'balance' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">Service</label>
                  <select
                    value={serviceId}
                    onChange={(e) => { setServiceId(e.target.value); setTierName(''); }}
                    className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white focus:border-white/60 focus:outline-none"
                  >
                    <option value="">Choose a service…</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {service && <p className="mt-1 text-xs text-zinc-500">{service.tagline}</p>}
                </div>
                {service && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">Package</label>
                    <div className="grid gap-2">
                      {service.tiers.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => setTierName(t.name)}
                          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left ${
                            tierName === t.name ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <span className="text-sm font-semibold">{t.name}</span>
                          <span className="text-sm text-zinc-400">{t.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {tier && !isCustom && (
              <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">
                    {payKind === 'deposit' ? `Deposit (${depositPct}% of ${money(Math.round(tier.starting * 100))})` : payKind === 'balance' ? 'Remaining balance' : 'Full payment'}
                  </span>
                  <span className="text-xl font-bold">{money(amountCents)}</span>
                </div>
                {payKind === 'deposit' && (
                  <p className="mt-1 text-xs text-zinc-500">The remaining balance can be paid here later, or the studio can send you an invoice.</p>
                )}
              </div>
            )}
            {isCustom && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                This package is custom-priced — please contact the studio for a personal invoice instead of paying here.
              </div>
            )}

            {/* Customer details */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Email (for receipt)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred date, location…"
                  className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                />
              </div>
            </div>

            {submitError && <p className="text-sm text-red-300">{submitError}</p>}

            <button
              type="button"
              onClick={startCheckout}
              disabled={submitting || !tier || isCustom || amountCents <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {submitting ? 'Starting secure checkout…' : amountCents > 0 ? `Pay ${money(amountCents)} with PayPal` : 'Continue to PayPal'}
            </button>
            <p className="text-center text-xs text-zinc-600">You’ll approve the payment on PayPal’s secure site. No charge until you confirm there.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePay;
