/**
 * Service payments — PayPal-only.
 *
 * Customers choose a photography service/package and pay a deposit, the
 * balance, or the full amount. These are NOT shop orders: no shipping,
 * no inventory. Payments can be linked to a booking (bookings table) or
 * stand alone, and Admin can create invoices and issue refunds.
 *
 * Public:  /api/v1/services/pricing, /checkout, /capture
 * Admin:   /api/v1/admin/services/payments, /settings
 */
import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { SERVICE_PRICING, findServicePricing } from '../lib/pricing';
import { getPayPalEnv, getPayPalAccessToken, paypalMoney, paypalNotConfigured } from '../lib/paypal';
import { sendEmail, escapeHtml } from '../lib/email';
import { sendSms } from '../lib/twilio';
import type { AppEnv } from '../types';

export const servicesPublic = new Hono<AppEnv>();
export const servicesAdmin = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Schema (D1) — auto-created on first hit                             */
/* ------------------------------------------------------------------ */

export async function ensureServicesSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS service_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      tier_name TEXT NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'full',
      amount_cents INTEGER NOT NULL,
      total_agreed_cents INTEGER NOT NULL,
      linked_payment_id INTEGER,
      currency TEXT NOT NULL DEFAULT 'usd',
      customer_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      booking_id INTEGER,
      shoot_date TEXT,
      notes TEXT,
      provider TEXT NOT NULL DEFAULT 'paypal',
      paypal_order_id TEXT UNIQUE,
      paypal_capture_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT,
      receipt_sent_at TEXT,
      sms_sent_at TEXT,
      reminder_7d_sent_at TEXT,
      reminder_1d_sent_at TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS service_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_svc_paypal ON service_payments(paypal_order_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_svc_status ON service_payments(status, created_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_svc_email ON service_payments(email)`),
  ]);
  // Migrate existing tables: add new columns if they don't exist
  const cols = await db.prepare(`PRAGMA table_info(service_payments)`).all<{ name: string }>();
  const colNames = new Set((cols.results ?? []).map((c) => c.name));
  const migrations: string[] = [];
  if (!colNames.has('shoot_date')) migrations.push(`ALTER TABLE service_payments ADD COLUMN shoot_date TEXT`);
  if (!colNames.has('sms_sent_at')) migrations.push(`ALTER TABLE service_payments ADD COLUMN sms_sent_at TEXT`);
  if (!colNames.has('reminder_7d_sent_at')) migrations.push(`ALTER TABLE service_payments ADD COLUMN reminder_7d_sent_at TEXT`);
  if (!colNames.has('reminder_1d_sent_at')) migrations.push(`ALTER TABLE service_payments ADD COLUMN reminder_1d_sent_at TEXT`);
  for (const sql of migrations) {
    await db.prepare(sql).run();
  }
  // Create index on shoot_date AFTER the column is guaranteed to exist
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_svc_shoot_date ON service_payments(shoot_date)`).run();
  const existing = await db.prepare(`SELECT COUNT(*) AS n FROM service_settings`).first<{ n: number }>();
  if (!existing || existing.n === 0) {
    await db.prepare(`INSERT OR IGNORE INTO service_settings (key, value) VALUES ('deposit_percent', '75')`).run();
  }
  // Migrate the previous 25% default to the new 75% default (admin-customized values are untouched).
  await db.prepare(`UPDATE service_settings SET value = '75' WHERE key = 'deposit_percent' AND value = '25'`).run();
}

async function getServiceSettings(db: D1Database): Promise<Record<string, string>> {
  const rows = await db.prepare(`SELECT key, value FROM service_settings`).all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const r of (rows.results ?? [])) out[r.key] = r.value;
  return out;
}

function depositPercent(s: Record<string, string>): number {
  const v = parseInt(s.deposit_percent ?? '75', 10);
  return Number.isFinite(v) && v > 0 && v < 100 ? v : 75;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PP_ORDER_RE = /^[A-Za-z0-9]{8,64}$/;

interface TierInfo { name: string; starting: number; custom: boolean }
interface ServiceInfo { id: string; name: string; tier: TierInfo }

function resolveServiceTier(serviceId: string, tierName: string): ServiceInfo | null {
  const svc = findServicePricing((serviceId || '').toLowerCase());
  if (!svc) return null;
  const tier = (svc.tiers || []).find((t: any) => t.name.toLowerCase() === (tierName || '').toLowerCase());
  if (!tier) return null;
  return {
    id: svc.id,
    name: svc.name,
    tier: { name: tier.name, starting: tier.starting, custom: tier.price === 'Custom' },
  };
}

function publicPayment(p: any) {
  return {
    id: p.id,
    service_id: p.service_id,
    service_name: p.service_name,
    tier_name: p.tier_name,
    payment_type: p.payment_type,
    amount_cents: p.amount_cents,
    total_agreed_cents: p.total_agreed_cents,
    currency: p.currency,
    status: p.status,
    paypal_order_id: p.paypal_order_id,
    paypal_capture_id: p.paypal_capture_id,
    booking_id: p.booking_id,
    paid_at: p.paid_at,
    created_at: p.created_at,
  };
}

function adminPayment(p: any) {
  return {
    ...publicPayment(p),
    customer_name: p.customer_name,
    email: p.email,
    phone: p.phone,
    notes: p.notes,
    linked_payment_id: p.linked_payment_id,
    updated_at: p.updated_at,
  };
}

/**
 * Idempotent: only transitions a payment from 'pending' to 'paid'.
 * Safe to call from both the capture endpoint and the PayPal webhook.
 */
export async function markServicePaid(
  db: D1Database,
  paymentId: number,
  patch: { paypal_capture_id?: string | null } = {},
): Promise<boolean> {
  const now = new Date().toISOString();
  const res = await db.prepare(
    `UPDATE service_payments SET status = 'paid', paypal_capture_id = COALESCE(?, paypal_capture_id), paid_at = COALESCE(paid_at, ?), updated_at = ?
     WHERE id = ? AND status = 'pending'`
  ).bind(patch.paypal_capture_id ?? null, now, now, paymentId).run();
  return (res.meta?.changes ?? 0) > 0;
}


/**
 * Sends a one-off Resend receipt to the customer the first time a service
 * payment transitions to 'paid'. Safe no-op when email is not configured,
 * the receipt was already sent, or the payment is not paid. Never throws —
 * email delivery must not break payment processing.
 */
export async function sendServiceReceipt(
  db: D1Database,
  env: { RESEND_API_KEY?: string },
  paymentId: number,
): Promise<void> {
  try {
    if (!env.RESEND_API_KEY) return;
    const p = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(paymentId).first<any>();
    if (!p || p.status !== 'paid' || p.receipt_sent_at || !p.email) return;
    const amount = `$${(p.amount_cents / 100).toFixed(2)}`;
    const name = escapeHtml(p.customer_name || 'there');
    const ok = await sendEmail(env.RESEND_API_KEY, {
      to: p.email,
      subject: `Payment received — ${p.service_name} (${p.payment_type})`,
      html: `<p>Hi ${name},</p>
<p>Thank you — we've received your <strong>${escapeHtml(p.payment_type)}</strong> payment of <strong>${amount} ${escapeHtml(p.currency || 'USD')}</strong> for <strong>${escapeHtml(p.service_name)} — ${escapeHtml(p.tier_name)}</strong>.</p>
<p>Payment reference: ${escapeHtml(p.paypal_capture_id || String(p.id))}</p>
<p>Jeff's studio will be in touch shortly to confirm the details of your session.</p>
<p style="color:#666">Jeff Honforloco Photography<br/>info@jeffhonforlocophotos.com · +1-646-379-4237</p>`,
    });
    if (ok) {
      await db.prepare(`UPDATE service_payments SET receipt_sent_at = ?, updated_at = ? WHERE id = ?`)
        .bind(new Date().toISOString(), new Date().toISOString(), paymentId).run();
    }
  } catch (e) {
    console.error('[services] receipt email failed:', e);
  }
}

/**
 * Sends a one-off Twilio SMS confirmation the first time a service payment
 * transitions to 'paid'. Safe no-op when Twilio is not configured, the SMS
 * was already sent, or the payment is not paid / has no phone. Never throws —
 * SMS delivery must not break payment processing.
 */
export async function sendServiceSms(
  db: D1Database,
  env: { TWILIO_ACCOUNT_SID?: string; TWILIO_AUTH_TOKEN?: string; TWILIO_FROM_NUMBER?: string },
  paymentId: number,
): Promise<void> {
  try {
    const p = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(paymentId).first<any>();
    if (!p || p.status !== 'paid' || p.sms_sent_at || !p.phone) return;
    const amount = `$${(p.amount_cents / 100).toFixed(2)}`;
    const name = (p.customer_name || 'there').split(' ')[0];
    const payLabel = p.payment_type === 'deposit' ? 'deposit' : p.payment_type === 'balance' ? 'balance' : 'full payment';
    const shootBit = p.shoot_date ? ` Shoot date: ${p.shoot_date}.` : '';
    const msg = `Hi ${name}! Jeff Honforloco Photography received your ${payLabel} of ${amount} for ${p.service_name} (${p.tier_name}).${shootBit} Receipt sent to ${p.email}. Questions? +1-646-379-4237`;
    const ok = await sendSms(env, p.phone, msg);
    if (ok) {
      const now = new Date().toISOString();
      await db.prepare(`UPDATE service_payments SET sms_sent_at = ?, updated_at = ? WHERE id = ?`)
        .bind(now, now, paymentId).run();
    }
  } catch (e) {
    console.error('[services] sms failed:', e);
  }
}

/**
 * Sends shoot reminders (7 days and 1 day before) for paid bookings with a
 * shoot_date. Called from the daily cron. Sends both email and SMS where
 * contact info exists. Never throws.
 */
export async function sendShootReminders(
  db: D1Database,
  env: { RESEND_API_KEY?: string; TWILIO_ACCOUNT_SID?: string; TWILIO_AUTH_TOKEN?: string; TWILIO_FROM_NUMBER?: string },
): Promise<void> {
  try {
    await ensureServicesSchema(db);
    const today = new Date().toISOString().split('T')[0];
    const in7 = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0];
    const in1 = new Date(Date.now() + 1 * 864e5).toISOString().split('T')[0];

    const targets = await db.prepare(
      `SELECT * FROM service_payments
       WHERE status = 'paid' AND shoot_date IN (?, ?)
         AND (reminder_7d_sent_at IS NULL OR reminder_1d_sent_at IS NULL)`
    ).bind(in7, in1).all<any>();

    for (const p of (targets.results ?? [])) {
      const is7d = p.shoot_date === in7;
      const flagCol = is7d ? 'reminder_7d_sent_at' : 'reminder_1d_sent_at';
      if (p[flagCol]) continue; // already reminded for this window

      const name = (p.customer_name || 'there').split(' ')[0];
      const when = is7d ? 'in 7 days' : 'tomorrow';
      const dateStr = p.shoot_date;

      // SMS
      if (p.phone) {
        const sms = `Hi ${name}! Reminder: your ${p.service_name} shoot (${p.tier_name}) is ${when} on ${dateStr}. Reply to confirm or reschedule. — Jeff Honforloco Photography, +1-646-379-4237`;
        await sendSms(env, p.phone, sms);
      }
      // Email
      if (p.email && env.RESEND_API_KEY) {
        const safeName = escapeHtml(p.customer_name || 'there');
        await sendEmail(env.RESEND_API_KEY, {
          to: p.email,
          subject: `Reminder: your shoot is ${when} — ${p.service_name}`,
          html: `<p>Hi ${safeName},</p>
<p>Just a friendly reminder — your <strong>${escapeHtml(p.service_name)} (${escapeHtml(p.tier_name)})</strong> shoot is <strong>${when}</strong> on <strong>${escapeHtml(dateStr)}</strong>.</p>
<p>Please reply to this email or text +1-646-379-4237 to confirm or reschedule.</p>
<p style="color:#666">Jeff Honforloco Photography<br/>info@jeffhonforlocophotos.com · +1-646-379-4237</p>`,
        }).catch((e) => console.error('[services] reminder email failed:', e));
      }

      const now = new Date().toISOString();
      await db.prepare(`UPDATE service_payments SET ${flagCol} = ?, updated_at = ? WHERE id = ?`)
        .bind(now, now, p.id).run();
    }
  } catch (e) {
    console.error('[services] shoot reminders failed:', e);
  }
}

/** Webhook fan-out for service payments (called from the PayPal webhook in shop.ts). */
export async function handleServicePaymentEvent(
  db: D1Database,
  env: { RESEND_API_KEY?: string },
  type: string,
  relatedOrderId: string,
  resource: any,
): Promise<void> {
  await ensureServicesSchema(db);
  const now = new Date().toISOString();
  const captureId = typeof resource?.id === 'string' ? resource.id : null;
  if (type === 'PAYMENT.CAPTURE.COMPLETED') {
    const p = await db.prepare(`SELECT id FROM service_payments WHERE paypal_order_id = ?`).bind(relatedOrderId).first<{ id: number }>();
    if (p && (await markServicePaid(db, p.id, { paypal_capture_id: captureId }))) {
      await sendServiceReceipt(db, env, p.id);
      await sendServiceSms(db, env, p.id);
    }
  } else if (type === 'PAYMENT.CAPTURE.DENIED') {
    await db.prepare(`UPDATE service_payments SET status = 'failed', updated_at = ? WHERE paypal_order_id = ? AND status = 'pending'`)
      .bind(now, relatedOrderId).run();
  } else if (type === 'PAYMENT.CAPTURE.REFUNDED') {
    await db.prepare(`UPDATE service_payments SET status = 'refunded', updated_at = ? WHERE paypal_order_id = ? AND status IN ('paid', 'partially_refunded')`)
      .bind(now, relatedOrderId).run();
  }
}

async function createPayPalOrder(
  c: any,
  db: D1Database,
  paymentId: number,
  info: { serviceName: string; tierName: string; paymentType: string },
  amountCents: number,
  currency: string,
): Promise<{ approveUrl: string; ppOrderId: string }> {
  const pp = getPayPalEnv(c)!;
  const accessToken = await getPayPalAccessToken(pp);
  const origin = (c.req.header('origin') || 'https://jeffhonforlocophotos.com').replace(/\/+$/, '');
  const label = info.paymentType === 'deposit' ? 'deposit' : info.paymentType === 'balance' ? 'balance' : 'full payment';
  const orderBody = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: `jh-svc-${paymentId}-${Date.now()}`,
      custom_id: `svc:${paymentId}`,
      description: `Jeff Honforloco Photography — ${info.serviceName} (${info.tierName}) — ${label}`.slice(0, 127),
      amount: {
        currency_code: currency.toUpperCase(),
        value: paypalMoney(amountCents),
      },
    }],
    application_context: {
      brand_name: 'Jeff Honforloco Photography',
      return_url: `${origin}/pay/success`,
      cancel_url: `${origin}/pay?canceled=1`,
      user_action: 'PAY_NOW',
    },
  };
  const pres = await fetch(`${pp.base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify(orderBody),
  });
  if (!pres.ok) {
    const txt = await pres.text().catch(() => '');
    console.error('[services] PayPal order create failed:', pres.status, txt.slice(0, 300));
    throw new Error('Could not start checkout — please try again');
  }
  const pOrder = (await pres.json()) as { id: string; links?: { href: string; rel: string }[] };
  const approveUrl = pOrder.links?.find((l) => l.rel === 'approve')?.href;
  if (!pOrder.id || !approveUrl) throw new Error('PayPal did not return an approval link');
  await db.prepare(`UPDATE service_payments SET paypal_order_id = ?, updated_at = ? WHERE id = ?`)
    .bind(pOrder.id, new Date().toISOString(), paymentId).run();
  return { approveUrl, ppOrderId: pOrder.id };
}

/* ------------------------------------------------------------------ */
/* PUBLIC — GET /api/v1/services/pricing                               */
/* ------------------------------------------------------------------ */

servicesPublic.get('/pricing', async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const settings = await getServiceSettings(db);
  return c.json({
    success: true,
    data: {
      deposit_percent: depositPercent(settings),
      services: SERVICE_PRICING.map((s) => ({
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        starting: s.starting,
        tiers: s.tiers.map((t) => ({ name: t.name, price: t.price, starting: t.starting })),
      })),
    },
  });
});

/* ------------------------------------------------------------------ */
/* PUBLIC — POST /api/v1/services/checkout (PayPal Orders v2)          */
/* ------------------------------------------------------------------ */

servicesPublic.post('/checkout', async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const pp = getPayPalEnv(c);
  if (!pp) return paypalNotConfigured(c);

  const body = await c.req.json().catch(() => null) as {
    service_id?: string; tier_name?: string; payment_type?: string;
    linked_payment_id?: number; customer_name?: string; email?: string;
    phone?: string; booking_id?: number; shoot_date?: string; notes?: string;
  } | null;

  const resolved = resolveServiceTier(body?.service_id || '', body?.tier_name || '');
  if (!resolved) return c.json({ error: 'Please choose a valid service and package' }, 400);
  if (resolved.tier.custom) {
    return c.json({ error: 'This package needs a custom quote — please contact the studio for an invoice' }, 400);
  }

  const paymentType = (body?.payment_type || 'full').toLowerCase();
  if (!['deposit', 'balance', 'full'].includes(paymentType)) return c.json({ error: 'Invalid payment type' }, 400);

  const email = (body?.email || '').trim();
  if (!EMAIL_RE.test(email)) return c.json({ error: 'A valid email is required for the receipt' }, 400);
  const customerName = (body?.customer_name || '').trim().slice(0, 120);
  if (!customerName) return c.json({ error: 'Your name is required' }, 400);

  const settings = await getServiceSettings(db);
  const tierCents = Math.round(resolved.tier.starting * 100);
  let amountCents: number;
  let totalAgreedCents = tierCents;
  let linkedPaymentId: number | null = null;

  if (paymentType === 'full') {
    amountCents = tierCents;
  } else if (paymentType === 'deposit') {
    amountCents = Math.round((tierCents * depositPercent(settings)) / 100);
  } else {
    // Balance: must reference a paid deposit/full payment; the remainder is computed server-side.
    const depId = parseInt(String(body?.linked_payment_id || ''), 10);
    if (!Number.isFinite(depId) || depId <= 0) return c.json({ error: 'A previous payment is required to pay a balance' }, 400);
    const dep = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(depId).first<any>();
    if (!dep || dep.status !== 'paid') return c.json({ error: 'The referenced payment was not found or is not paid' }, 400);
    if (dep.email.toLowerCase() !== email.toLowerCase()) return c.json({ error: 'The balance must be paid with the same email as the original payment' }, 400);
    totalAgreedCents = dep.total_agreed_cents;
    linkedPaymentId = dep.id;
    const paidRow = await db.prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS paid FROM service_payments WHERE (id = ? OR linked_payment_id = ?) AND status = 'paid'`
    ).bind(dep.id, dep.id).first<{ paid: number }>();
    const paidSoFar = paidRow?.paid ?? 0;
    amountCents = totalAgreedCents - paidSoFar;
    if (amountCents <= 0) return c.json({ error: 'This payment is already settled in full' }, 400);
  }

  const now = new Date().toISOString();
  // Validate shoot_date (YYYY-MM-DD, not in the past)
  let shootDate: string | null = null;
  const rawShootDate = (body?.shoot_date || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawShootDate)) {
    const today = new Date().toISOString().split('T')[0];
    if (rawShootDate >= today) shootDate = rawShootDate;
  }
  const ins = await db.prepare(
    `INSERT INTO service_payments
       (service_id, service_name, tier_name, payment_type, amount_cents, total_agreed_cents, linked_payment_id,
        currency, customer_name, email, phone, booking_id, shoot_date, notes, provider, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'usd', ?, ?, ?, ?, ?, ?, 'paypal', 'pending', ?, ?)`
  ).bind(
    resolved.id, resolved.name, resolved.tier.name, paymentType, amountCents, totalAgreedCents, linkedPaymentId,
    customerName, email, (body?.phone || '').trim().slice(0, 40) || null,
    Number.isFinite(parseInt(String(body?.booking_id), 10)) ? parseInt(String(body?.booking_id), 10) : null,
    shootDate,
    (body?.notes || '').trim().slice(0, 1000) || null, now, now
  ).run();
  const paymentId = Number(ins.meta.last_row_id);

  try {
    const { approveUrl, ppOrderId } = await createPayPalOrder(
      c, db, paymentId,
      { serviceName: resolved.name, tierName: resolved.tier.name, paymentType },
      amountCents, 'usd'
    );
    return c.json({ success: true, data: { url: approveUrl, paypal_order_id: ppOrderId, payment_id: paymentId, amount_cents: amountCents } });
  } catch (e) {
    await db.prepare(`UPDATE service_payments SET status = 'failed', updated_at = ? WHERE id = ?`).bind(now, paymentId).run();
    return c.json({ error: e instanceof Error ? e.message : 'Could not start checkout — please try again' }, 502);
  }
});

/* ------------------------------------------------------------------ */
/* PUBLIC — POST /api/v1/services/my-payments (lookup own payments)   */
/* ------------------------------------------------------------------ */

servicesPublic.post('/my-payments', async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const body = await c.req.json().catch(() => null) as { email?: string } | null;
  const email = (body?.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return c.json({ error: 'A valid email is required' }, 400);
  const rows = await db.prepare(
    `SELECT id, service_id, service_name, tier_name, payment_type, amount_cents, total_agreed_cents,
            linked_payment_id, currency, status, booking_id, paid_at, created_at
     FROM service_payments WHERE lower(email) = ? AND status IN ('paid', 'pending')
     ORDER BY created_at DESC LIMIT 20`
  ).bind(email).all();
  return c.json({ success: true, data: { payments: rows.results ?? [] } });
});

/* ------------------------------------------------------------------ */
/* PUBLIC — POST /api/v1/services/capture (after PayPal approval)      */
/* ------------------------------------------------------------------ */

servicesPublic.post('/capture', async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const pp = getPayPalEnv(c);
  if (!pp) return paypalNotConfigured(c);

  const body = await c.req.json().catch(() => null) as { paypal_order_id?: string } | null;
  const ppOrderId = (body?.paypal_order_id || '').trim();
  if (!PP_ORDER_RE.test(ppOrderId)) return c.json({ error: 'Invalid PayPal order id' }, 400);

  const payment = await db.prepare(`SELECT * FROM service_payments WHERE paypal_order_id = ?`).bind(ppOrderId).first<any>();
  if (!payment) return c.json({ error: 'Payment not found' }, 404);
  if (payment.status === 'paid') return c.json({ success: true, data: { payment_id: payment.id, status: 'paid' } });
  if (payment.status !== 'pending') return c.json({ error: `Payment is ${payment.status}` }, 409);

  let accessToken: string;
  try {
    accessToken = await getPayPalAccessToken(pp);
  } catch {
    return c.json({ error: 'Payment service unavailable — please try again' }, 502);
  }

  const cres = await fetch(`${pp.base}/v2/checkout/orders/${encodeURIComponent(ppOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
  });
  const cdata = (await cres.json().catch(() => null)) as any;
  if (!cres.ok) {
    const issue = JSON.stringify(cdata?.details ?? cdata ?? '').toUpperCase();
    console.error('[services] PayPal capture failed:', cres.status, JSON.stringify(cdata).slice(0, 300));
    const now = new Date().toISOString();
    const nextStatus = /EXPIRED/.test(issue) ? 'expired' : 'failed';
    await db.prepare(`UPDATE service_payments SET status = ?, updated_at = ? WHERE id = ? AND status = 'pending'`)
      .bind(nextStatus, now, payment.id).run();
    return c.json({ error: nextStatus === 'expired' ? 'This PayPal order expired — please start again' : 'Payment was not completed' }, 502);
  }

  const capture = cdata?.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId: string | null = typeof capture?.id === 'string' ? capture.id : null;
  if (await markServicePaid(db, payment.id, { paypal_capture_id: captureId })) {
    await sendServiceReceipt(db, c.env, payment.id);
    await sendServiceSms(db, c.env, payment.id);
  }
  return c.json({ success: true, data: { payment_id: payment.id, status: 'paid', capture_id: captureId } });
});

/* ------------------------------------------------------------------ */
/* ADMIN — /api/v1/admin/services                                       */
/* ------------------------------------------------------------------ */

servicesAdmin.get('/payments', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const status = (c.req.query('status') || '').trim();
  const q = (c.req.query('q') || '').trim();
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10) || 50, 200);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);
  let sql = `SELECT * FROM service_payments WHERE 1=1`;
  const params: unknown[] = [];
  if (status) { sql += ` AND status = ?`; params.push(status); }
  if (q) { sql += ` AND (email LIKE ? OR customer_name LIKE ? OR service_name LIKE ?)`; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const rows = await db.prepare(sql).bind(...params).all();
  const countRow = await db.prepare(`SELECT COUNT(*) AS n FROM service_payments`).first<{ n: number }>();
  return c.json({ success: true, data: { payments: (rows.results ?? []).map(adminPayment), total: countRow?.n ?? 0 } });
});

servicesAdmin.get('/payments/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const row = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(c.req.param('id')).first<any>();
  if (!row) return c.json({ error: 'Payment not found' }, 404);
  return c.json({ success: true, data: { payment: adminPayment(row) } });
});

/**
 * Admin invoice: creates a pending service payment for any amount (the admin
 * is trusted) and immediately starts a PayPal order so the approval link can
 * be shared with the client.
 */
servicesAdmin.post('/payments', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const pp = getPayPalEnv(c);
  if (!pp) return paypalNotConfigured(c);

  const body = await c.req.json().catch(() => null) as {
    service_id?: string; tier_name?: string; payment_type?: string;
    amount_cents?: number; total_agreed_cents?: number; linked_payment_id?: number;
    customer_name?: string; email?: string; phone?: string; booking_id?: number; notes?: string;
  } | null;

  const resolved = resolveServiceTier(body?.service_id || '', body?.tier_name || '');
  if (!resolved) return c.json({ error: 'Choose a valid service and package' }, 400);
  const amountCents = Math.floor(Number(body?.amount_cents) || 0);
  if (!Number.isFinite(amountCents) || amountCents < 100) return c.json({ error: 'Amount must be at least $1.00' }, 400);
  if (amountCents > 5000000) return c.json({ error: 'Amount exceeds the $50,000 invoice limit' }, 400);
  const email = (body?.email || '').trim();
  if (!EMAIL_RE.test(email)) return c.json({ error: 'A valid client email is required' }, 400);
  const paymentType = (body?.payment_type || 'full').toLowerCase();
  if (!['deposit', 'balance', 'full'].includes(paymentType)) return c.json({ error: 'Invalid payment type' }, 400);

  const now = new Date().toISOString();
  const ins = await db.prepare(
    `INSERT INTO service_payments
       (service_id, service_name, tier_name, payment_type, amount_cents, total_agreed_cents, linked_payment_id,
        currency, customer_name, email, phone, booking_id, notes, provider, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'usd', ?, ?, ?, ?, ?, 'paypal', 'pending', ?, ?)`
  ).bind(
    resolved.id, resolved.name, resolved.tier.name, paymentType, amountCents,
    Math.floor(Number(body?.total_agreed_cents) || amountCents),
    Number.isFinite(parseInt(String(body?.linked_payment_id), 10)) ? parseInt(String(body?.linked_payment_id), 10) : null,
    (body?.customer_name || '').trim().slice(0, 120) || null, email,
    (body?.phone || '').trim().slice(0, 40) || null,
    Number.isFinite(parseInt(String(body?.booking_id), 10)) ? parseInt(String(body?.booking_id), 10) : null,
    (body?.notes || '').trim().slice(0, 1000) || null, now, now
  ).run();
  const paymentId = Number(ins.meta.last_row_id);

  try {
    const { approveUrl, ppOrderId } = await createPayPalOrder(
      c, db, paymentId,
      { serviceName: resolved.name, tierName: resolved.tier.name, paymentType },
      amountCents, 'usd'
    );
    return c.json({ success: true, data: { payment_id: paymentId, paypal_order_id: ppOrderId, payment_url: approveUrl, amount_cents: amountCents } });
  } catch (e) {
    await db.prepare(`UPDATE service_payments SET status = 'failed', updated_at = ? WHERE id = ?`).bind(now, paymentId).run();
    return c.json({ error: e instanceof Error ? e.message : 'Could not create the PayPal invoice link' }, 502);
  }
});

servicesAdmin.post('/payments/:id/refund', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const pp = getPayPalEnv(c);
  if (!pp) return paypalNotConfigured(c);

  const payment = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(c.req.param('id')).first<any>();
  if (!payment) return c.json({ error: 'Payment not found' }, 404);
  if (payment.status !== 'paid' || !payment.paypal_capture_id) {
    return c.json({ error: 'Only paid payments with a PayPal capture can be refunded' }, 409);
  }

  const body = await c.req.json().catch(() => null) as { amount_cents?: number } | null;
  const amountCents = body?.amount_cents != null ? Math.floor(Number(body.amount_cents)) : payment.amount_cents;
  if (!Number.isFinite(amountCents) || amountCents <= 0 || amountCents > payment.amount_cents) {
    return c.json({ error: 'Refund amount must be between $0.01 and the amount paid' }, 400);
  }

  let accessToken: string;
  try {
    accessToken = await getPayPalAccessToken(pp);
  } catch {
    return c.json({ error: 'Payment service unavailable — please try again' }, 502);
  }

  const rres = await fetch(`${pp.base}/v2/payments/captures/${encodeURIComponent(payment.paypal_capture_id)}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify({ amount: { currency_code: 'USD', value: paypalMoney(amountCents) } }),
  });
  const rdata = (await rres.json().catch(() => null)) as any;
  if (!rres.ok) {
    console.error('[services] PayPal refund failed:', rres.status, JSON.stringify(rdata).slice(0, 300));
    return c.json({ error: 'PayPal declined the refund — check the capture in the PayPal dashboard' }, 502);
  }

  const now = new Date().toISOString();
  const nextStatus = amountCents >= payment.amount_cents ? 'refunded' : 'partially_refunded';
  await db.prepare(`UPDATE service_payments SET status = ?, updated_at = ? WHERE id = ?`)
    .bind(nextStatus, now, payment.id).run();
  return c.json({ success: true, data: { payment_id: payment.id, status: nextStatus, refund_id: rdata?.id ?? null } });
});

servicesAdmin.patch('/payments/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const payment = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(c.req.param('id')).first<any>();
  if (!payment) return c.json({ error: 'Payment not found' }, 404);
  const body = await c.req.json().catch(() => null) as { notes?: string; booking_id?: number | null } | null;
  const now = new Date().toISOString();
  await db.prepare(`UPDATE service_payments SET notes = ?, booking_id = ?, updated_at = ? WHERE id = ?`)
    .bind(
      body?.notes != null ? String(body.notes).slice(0, 1000) : payment.notes,
      body?.booking_id === null ? null : (Number.isFinite(parseInt(String(body?.booking_id), 10)) ? parseInt(String(body?.booking_id), 10) : payment.booking_id),
      now, payment.id
    ).run();
  const row = await db.prepare(`SELECT * FROM service_payments WHERE id = ?`).bind(payment.id).first<any>();
  return c.json({ success: true, data: { payment: adminPayment(row) } });
});

servicesAdmin.get('/settings', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const s = await getServiceSettings(db);
  return c.json({ success: true, data: { deposit_percent: depositPercent(s) } });
});

servicesAdmin.put('/settings', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureServicesSchema(db);
  const body = await c.req.json().catch(() => null) as { deposit_percent?: number } | null;
  const v = parseInt(String(body?.deposit_percent ?? ''), 10);
  if (!Number.isFinite(v) || v <= 0 || v >= 100) return c.json({ error: 'Deposit percent must be between 1 and 99' }, 400);
  await db.prepare(`INSERT INTO service_settings (key, value) VALUES ('deposit_percent', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .bind(String(v)).run();
  return c.json({ success: true, data: { deposit_percent: v } });
});
