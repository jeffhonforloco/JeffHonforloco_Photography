import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Camera, Check, Loader2, Lock, Search } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { PRICING_CATEGORIES } from '@/data/pricing-data';

interface Tier { name: string; price: string; starting: number }
interface Service { id: string; name: string; tagline: string; starting: number; tiers: Tier[] }

type PayKind = 'full' | 'deposit' | 'balance';
type Step = 1 | 2 | 3;

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 === 0 ? 0 : 2 });

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'Service' },
  { n: 2, label: 'Package & Payment' },
  { n: 3, label: 'Pay' },
];

const ServicePay: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [depositPct, setDepositPct] = useState(75);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState('');
  const [tierName, setTierName] = useState('');
  const [payKind, setPayKind] = useState<PayKind>('deposit');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [shootDate, setShootDate] = useState('');

  // Balance lookup (returning customers)
  const [showBalance, setShowBalance] = useState(false);
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
          const svcList: Service[] = data.data.services || [];
          setServices(svcList);
          setDepositPct(data.data.deposit_percent || 75);

          // Preselect from query params (Pricing page / Booking handoff)
          // Validates against API data — never trusts client prices.
          try {
            const qs = new URLSearchParams(window.location.search);
            const qService = qs.get('service')?.trim() || '';
            const qTier = qs.get('tier')?.trim() || '';
            const qPayRaw = (qs.get('pay') || qs.get('payment_type') || qs.get('type') || '').toLowerCase().trim();
            const qName = qs.get('name')?.trim() || '';
            const qEmail = qs.get('email')?.trim() || '';
            const qPhone = qs.get('phone')?.trim() || '';

            let advanced = false;
            if (qService) {
              const matchedService = svcList.find((s) => s.id === qService);
              if (matchedService) {
                setServiceId(matchedService.id);
                setStep(2);
                advanced = true;
                if (qTier) {
                  let matchedTier = matchedService.tiers.find(
                    (t) => t.name.toLowerCase() === qTier.toLowerCase()
                  );
                  if (!matchedTier) {
                    const cat = PRICING_CATEGORIES.find((c) => c.id === matchedService.id);
                    const tierById = cat?.tiers.find((t) => t.id === qTier);
                    if (tierById) {
                      matchedTier = matchedService.tiers.find((t) => t.name === tierById.name);
                    }
                  }
                  if (matchedTier) {
                    setTierName(matchedTier.name);
                    if (matchedTier.price !== 'Custom') setStep(3);
                  }
                }
              }
            }
            if (qPayRaw === 'deposit' || qPayRaw === 'full') {
              setPayKind(qPayRaw as PayKind);
            } else if (qPayRaw === 'balance') {
              setPayKind('balance');
              setShowBalance(true);
            }
            if (qName) setName(qName);
            if (qEmail) setEmail(qEmail);
            if (qPhone) setPhone(qPhone);
            void advanced;
          } catch {
            // ignore malformed query params — user can still choose manually
          }
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

  const depositCents = useMemo(() => {
    if (!tier || isCustom) return 0;
    return Math.round((Math.round(tier.starting * 100) * depositPct) / 100);
  }, [tier, isCustom, depositPct]);

  const fullCents = useMemo(() => {
    if (!tier || isCustom) return 0;
    return Math.round(tier.starting * 100);
  }, [tier, isCustom]);

  const amountCents = useMemo(() => {
    if (payKind === 'balance') {
      const linked = priorPayments.find((p) => p.id === linkedPaymentId);
      if (!linked) return 0;
      const paidSoFar = priorPayments
        .filter((p) => p.status === 'paid' && (p.id === linked.id || p.linked_payment_id === linked.id))
        .reduce((s, p) => s + p.amount_cents, 0);
      return Math.max(0, linked.total_agreed_cents - paidSoFar);
    }
    return payKind === 'deposit' ? depositCents : fullCents;
  }, [payKind, depositCents, fullCents, priorPayments, linkedPaymentId]);

  const selectService = (id: string) => {
    setServiceId(id);
    setTierName('');
    setSubmitError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectTier = (name: string) => {
    setTierName(name);
    setSubmitError('');
  };

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
    if (payKind !== 'balance' && (!service || !tier || isCustom || amountCents <= 0)) {
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
          service_id: service?.id,
          tier_name: tier?.name,
          payment_type: payKind,
          linked_payment_id: payKind === 'balance' ? linkedPaymentId : undefined,
          customer_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          shoot_date: shootDate || undefined,
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
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <Camera className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-3xl font-bold">Book &amp; Pay</h1>
            <p className="mt-1 text-sm text-zinc-400">Pick your session, pay the deposit or full amount — your date is secured after payment.</p>
          </div>
        </div>

        {canceled && (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            The PayPal checkout was canceled — no charge was made. You can start again below.
          </div>
        )}

        {/* Progress */}
        {!loading && !loadError && !showBalance && (
          <div className="mt-8 flex items-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <button
                  type="button"
                  onClick={() => { if (s.n < step || (s.n === 2 && serviceId) || (s.n === 3 && tierName && !isCustom)) setStep(s.n); }}
                  className="flex items-center gap-2"
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                    step === s.n ? 'bg-white text-black' : step > s.n ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-400'
                  }`}>
                    {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span className={`hidden text-sm font-medium sm:block ${step === s.n ? 'text-white' : 'text-zinc-500'}`}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`mx-3 h-0.5 flex-1 rounded ${step > s.n ? 'bg-emerald-500' : 'bg-white/10'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading services…
          </div>
        ) : loadError ? (
          <div className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{loadError}</div>
        ) : showBalance ? (
          /* ── Balance lookup (returning customers) ── */
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Pay your remaining balance</h2>
            <p className="mb-4 mt-1 text-sm text-zinc-400">Enter the email you used for your deposit to see what you still owe.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={lookupPayments}
                disabled={lookupLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find
              </button>
            </div>
            {lookupError && <p className="mt-2 text-sm text-red-300">{lookupError}</p>}
            {priorPayments.length > 0 && (
              <div className="mt-4 space-y-2">
                {priorPayments.map((p) => {
                  const remaining = Math.max(0, p.total_agreed_cents - p.amount_cents);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setLinkedPaymentId(p.id); setServiceId(p.service_id); setTierName(p.tier_name); setPayKind('balance'); }}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${
                        linkedPaymentId === p.id ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/40'
                      }`}
                    >
                      <span>
                        <span className="font-semibold">{p.service_name} — {p.tier_name}</span>
                        <span className="block text-xs text-zinc-500">Paid {money(p.amount_cents)} deposit</span>
                      </span>
                      <span className="flex items-center gap-2 text-sm">
                        {linkedPaymentId === p.id && <BadgeCheck className="h-4 w-4 text-emerald-400" />}
                        <span className="font-bold">Owes {money(remaining)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {linkedPaymentId && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black hover:bg-zinc-200"
              >
                Continue to payment <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => setShowBalance(false)} className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to new booking
            </button>
          </div>
        ) : (
          <>
            {/* ── STEP 1: Service ── */}
            {step === 1 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">What kind of shoot?</h2>
                <p className="mb-4 mt-1 text-sm text-zinc-400">Tap a service to see packages.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectService(s.id)}
                      className="group rounded-2xl border border-white/15 bg-white/5 p-5 text-left transition hover:border-white/50 hover:bg-white/10 active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-white">{s.name}</div>
                          <div className="mt-1 text-sm text-zinc-400">{s.tagline}</div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-white" />
                      </div>
                      <div className="mt-3 text-sm text-zinc-300">From {money(Math.round(s.starting * 100))}</div>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => { setShowBalance(true); setPayKind('balance'); }} className="mt-6 w-full text-center text-sm text-zinc-500 hover:text-zinc-300">
                  Paying a remaining balance on a previous deposit? <span className="underline">Find it here</span>
                </button>
              </div>
            )}

            {/* ── STEP 2: Package & payment type ── */}
            {step === 2 && service && (
              <div className="mt-8">
                <button type="button" onClick={() => setStep(1)} className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> {service.name}
                </button>
                <h2 className="text-xl font-bold">Choose your package</h2>
                <p className="mb-4 mt-1 text-sm text-zinc-400">Then pick deposit ({depositPct}%) or full payment.</p>
                <div className="space-y-3">
                  {service.tiers.map((t) => {
                    const custom = t.price === 'Custom';
                    const selected = tierName === t.name;
                    const dep = Math.round((Math.round(t.starting * 100) * depositPct) / 100);
                    const full = Math.round(t.starting * 100);
                    return (
                      <div key={t.name} className={`rounded-2xl border p-5 transition ${selected ? 'border-white bg-white/10' : 'border-white/15 bg-white/5'}`}>
                        <button type="button" onClick={() => selectTier(t.name)} className="flex w-full items-center justify-between text-left">
                          <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="mt-0.5 text-sm text-zinc-400">{t.price}</div>
                          </div>
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-white bg-white' : 'border-white/30'}`}>
                            {selected && <Check className="h-4 w-4 text-black" />}
                          </span>
                        </button>
                        {selected && !custom && (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => { setPayKind('deposit'); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${payKind === 'deposit' ? 'border-white bg-white text-black' : 'border-white/25 hover:border-white/60'}`}
                            >
                              <div className="text-sm font-bold">Pay {depositPct}% Deposit</div>
                              <div className={`mt-0.5 text-lg font-bold ${payKind === 'deposit' ? 'text-black' : 'text-white'}`}>{money(dep)}</div>
                              <div className={`text-xs ${payKind === 'deposit' ? 'text-zinc-700' : 'text-zinc-500'}`}>Secures your date · rest due on shoot day</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setPayKind('full'); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${payKind === 'full' ? 'border-white bg-white text-black' : 'border-white/25 hover:border-white/60'}`}
                            >
                              <div className="text-sm font-bold">Pay in Full</div>
                              <div className={`mt-0.5 text-lg font-bold ${payKind === 'full' ? 'text-black' : 'text-white'}`}>{money(full)}</div>
                              <div className={`text-xs ${payKind === 'full' ? 'text-zinc-700' : 'text-zinc-500'}`}>One payment · nothing due later</div>
                            </button>
                          </div>
                        )}
                        {selected && custom && (
                          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            This package is custom-priced — please contact the studio for a personal invoice.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 3: Details & pay ── */}
            {step === 3 && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => { setShowBalance(false); setStep(payKind === 'balance' ? 1 : 2); }}
                  className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h2 className="text-xl font-bold">Your details</h2>
                <p className="mb-4 mt-1 text-sm text-zinc-400">We’ll send your receipt and booking confirmation here.</p>

                {/* Order summary */}
                <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5">
                  <div className="text-sm text-zinc-400">
                    {service?.name} · {tier?.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold">
                      {payKind === 'deposit' ? `${depositPct}% Deposit` : payKind === 'balance' ? 'Remaining balance' : 'Full payment'}
                    </span>
                    <span className="text-2xl font-bold">{money(amountCents)}</span>
                  </div>
                  {payKind === 'deposit' && (
                    <p className="mt-1 text-xs text-zinc-500">{money(Math.max(0, fullCents - depositCents))} remaining balance due on shoot day.</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Full name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      autoComplete="name"
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
                      autoComplete="email"
                      className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Phone (for SMS confirmation)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      autoComplete="tel"
                      className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Preferred shoot date (for reminders)</label>
                    <input
                      type="date"
                      value={shootDate}
                      onChange={(e) => setShootDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-300">Notes (optional)</label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Location, time preference…"
                      className="w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/60 focus:outline-none"
                    />
                  </div>
                </div>

                {submitError && <p className="mt-4 text-sm text-red-300">{submitError}</p>}

                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={submitting || amountCents <= 0}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-bold text-black hover:bg-zinc-200 disabled:opacity-40 active:scale-[0.99]"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                  {submitting ? 'Starting secure checkout…' : amountCents > 0 ? `Pay ${money(amountCents)} with PayPal` : 'Continue to PayPal'}
                </button>
                <p className="mt-3 text-center text-xs text-zinc-600">You’ll approve the payment on PayPal’s secure site. No charge until you confirm there.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicePay;
