import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';
import { sendEmail, escapeHtml } from '../lib/email';

const outreach = new Hono<AppEnv>();
outreach.use('*', requireAuth, requireAdmin);
outreach.use('*', async (c, next) => {
  try {
    await ensureTables(c.env.DB);
  } catch (err) {
    console.error('[outreach] table init failed:', err);
  }
  await next();
});

const text = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SEND_BATCH = 20;
const MAX_IMPORT = 100;

// Self-initialize tables if the D1 migration hasn't been applied yet.
const OUTREACH_DDL = `
CREATE TABLE IF NOT EXISTS outreach_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  address TEXT, phone TEXT, website TEXT, email TEXT, category TEXT, location TEXT,
  unsubscribe_token TEXT UNIQUE NOT NULL,
  unsubscribed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_outreach_targets_unsub ON outreach_targets(unsubscribe_token);
CREATE TABLE IF NOT EXISTS outreach_sends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id INTEGER NOT NULL REFERENCES outreach_targets(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'sent'
);`;

let tablesEnsured = false;
async function ensureTables(db: D1Database): Promise<void> {
  if (tablesEnsured) return;
  for (const stmt of OUTREACH_DDL.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.prepare(stmt).run();
  }
  tablesEnsured = true;
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Email discovery: fetch the business website and extract a contact email ---

const MAILTO_RE = /mailto:([^\s"'<>?]+@[^\s"'<>?]+)/gi;

function pickBestEmail(candidates: string[]): string | null {
  const seen = new Set<string>();
  const clean = candidates
    .map((e) => e.toLowerCase().replace(/[.]+$/, ''))
    .filter((e) => EMAIL_RE.test(e) && !seen.has(e) && (seen.add(e), true));
  if (!clean.length) return null;
  const preferred = clean.find((e) => /^(info|contact|hello|bookings?|events?|sales)@/.test(e));
  return preferred ?? clean[0];
}

async function discoverEmail(website: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    let url = website;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('text/html')) return null;
    const html = await res.text();
    const matches = [...html.matchAll(MAILTO_RE)].map((m) => m[1]);
    return pickBestEmail(matches);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// --- Import targets (businesses found by research) ---

interface ImportTarget {
  business_name: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: string;
  location?: string;
}

outreach.post('/targets/import', async (c) => {
  const body = await c.req.json<{ targets?: ImportTarget[] }>();
  const list = Array.isArray(body.targets) ? body.targets.slice(0, MAX_IMPORT) : [];
  if (!list.length) return c.json({ error: 'targets array is required' }, 400);
  let imported = 0;
  let skipped = 0;
  for (const t of list) {
    const name = text(t.business_name, 200);
    if (!name) { skipped++; continue; }
    const email = text(t.email ?? '', 200);
    try {
      await c.env.DB.prepare(
        `INSERT INTO outreach_targets (business_name, address, phone, website, email, category, location, unsubscribe_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        name,
        text(t.address ?? '', 300) || null,
        text(t.phone ?? '', 60) || null,
        text(t.website ?? '', 300) || null,
        email && EMAIL_RE.test(email) ? email : null,
        text(t.category ?? '', 100) || null,
        text(t.location ?? '', 120) || null,
        randomToken(),
      ).run();
      imported++;
    } catch {
      skipped++;
    }
  }
  return c.json({ imported, skipped });
});

// --- List targets ---

outreach.get('/targets', async (c) => {
  const q = text(c.req.query('q') ?? '', 120);
  const rows = q
    ? (await c.env.DB.prepare(`SELECT * FROM outreach_targets WHERE business_name LIKE ? OR location LIKE ? OR category LIKE ? ORDER BY created_at DESC LIMIT 300`).bind(`%${q}%`, `%${q}%`, `%${q}%`).all<Record<string, unknown>>()).results ?? []
    : (await c.env.DB.prepare(`SELECT * FROM outreach_targets ORDER BY created_at DESC LIMIT 300`).all<Record<string, unknown>>()).results ?? [];
  return c.json({ targets: rows });
});

// --- Delete a target ---

outreach.delete('/targets/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!id) return c.json({ error: 'invalid id' }, 400);
  await c.env.DB.prepare(`DELETE FROM outreach_targets WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

// --- Discover email for a target ---

outreach.post('/discover-email', async (c) => {
  const body = await c.req.json<{ targetId?: number }>();
  const targetId = Number(body.targetId);
  if (!targetId) return c.json({ error: 'targetId is required' }, 400);
  const target = await c.env.DB.prepare(`SELECT id, website, email FROM outreach_targets WHERE id = ?`).bind(targetId).first<{ id: number; website: string | null; email: string | null }>();
  if (!target) return c.json({ error: 'Target not found' }, 404);
  if (target.email) return c.json({ email: target.email, cached: true });
  if (!target.website) return c.json({ error: 'No website on file for this business' }, 422);
  const email = await discoverEmail(target.website);
  if (email) {
    await c.env.DB.prepare(`UPDATE outreach_targets SET email = ? WHERE id = ?`).bind(email, targetId).run();
  }
  return c.json({ email });
});

// --- Send outreach emails ---

function outreachFooterHtml(target: { business_name: string; unsubscribe_token: string }, postalAddress: string, baseUrl: string): string {
  const unsub = `${baseUrl}/api/v1/outreach/unsubscribe?token=${target.unsubscribe_token}`;
  return `
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0 12px" />
    <p style="font-size:12px;color:#888">Jeff Honforloco Photography · ${escapeHtml(postalAddress)}<br/>
    You're receiving this because your business was listed publicly as a potential photography client.
    <a href="${unsub}" style="color:#888">Unsubscribe</a> from future outreach.</p>`;
}

outreach.post('/send', async (c) => {
  const body = await c.req.json<{ targetIds?: number[]; subject?: string; body?: string }>();
  const targetIds = Array.isArray(body.targetIds) ? body.targetIds.map(Number).filter(Boolean) : [];
  const subject = text(body.subject, 200);
  const rawBody = typeof body.body === 'string' ? body.body.slice(0, 10000) : '';
  if (!targetIds.length) return c.json({ error: 'targetIds is required' }, 400);
  if (targetIds.length > MAX_SEND_BATCH) return c.json({ error: `Max ${MAX_SEND_BATCH} recipients per batch` }, 400);
  if (!subject || !rawBody) return c.json({ error: 'subject and body are required' }, 400);

  const placeholders = rawBody.match(/{{\s*[\w]+\s*}}/g) ?? [];
  const postalAddress = c.env.BUSINESS_POSTAL_ADDRESS || 'Providence, RI';
  const baseUrl = c.env.PUBLIC_API_BASE_URL || 'https://jeffhonforlocophotos.com';

  let sent = 0;
  const failed: Array<{ id: number; error: string }> = [];
  for (const id of targetIds) {
    const target = await c.env.DB.prepare(
      `SELECT id, business_name, email, unsubscribed, unsubscribe_token FROM outreach_targets WHERE id = ?`,
    ).bind(id).first<{ id: number; business_name: string; email: string | null; unsubscribed: number; unsubscribe_token: string }>();
    if (!target) { failed.push({ id, error: 'not found' }); continue; }
    if (target.unsubscribed) { failed.push({ id, error: 'unsubscribed' }); continue; }
    if (!target.email || !EMAIL_RE.test(target.email)) { failed.push({ id, error: 'no email' }); continue; }

    let personalized = rawBody;
    for (const ph of new Set(placeholders)) {
      const key = ph.replace(/[{}]/g, '').trim();
      const value = key === 'business_name' ? target.business_name : '';
      personalized = personalized.split(ph).join(escapeHtml(value));
    }
    const html = `<div style="font-family:Georgia,serif;line-height:1.7;color:#222;max-width:600px">${personalized.replace(/\n/g, '<br/>')}${outreachFooterHtml(target, postalAddress, baseUrl)}</div>`;

    const ok = await sendEmail(c.env.RESEND_API_KEY, { to: target.email, subject, html });
    if (ok) {
      sent++;
      await c.env.DB.prepare(`INSERT INTO outreach_sends (target_id, subject) VALUES (?, ?)`).bind(id, subject).run();
    } else {
      failed.push({ id, error: 'send failed' });
    }
  }
  return c.json({ sent, failed });
});

// --- History ---

outreach.get('/history', async (c) => {
  const rows = (await c.env.DB.prepare(
    `SELECT s.id, s.subject, s.sent_at, s.status, t.business_name, t.email
     FROM outreach_sends s JOIN outreach_targets t ON t.id = s.target_id
     ORDER BY s.sent_at DESC LIMIT 200`,
  ).all<Record<string, unknown>>()).results ?? [];
  return c.json({ sends: rows });
});

export default outreach;

// --- Public one-click unsubscribe (mounted separately, no auth) ---

export const outreachPublic = new Hono<AppEnv>();
outreachPublic.get('/unsubscribe', async (c) => {
  const token = text(c.req.query('token') ?? '', 64);
  try {
    await ensureTables(c.env.DB);
    if (token) {
      await c.env.DB.prepare(`UPDATE outreach_targets SET unsubscribed = 1 WHERE unsubscribe_token = ?`).bind(token).run();
    }
  } catch (err) {
    console.error('[outreach] unsubscribe failed:', err);
  }
  return c.html(`<!doctype html><html><head><title>Unsubscribed</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:80vh;background:#111;color:#eee">
    <div style="text-align:center;max-width:420px;padding:24px">
    <h1 style="font-weight:normal">You're unsubscribed.</h1>
    <p style="color:#999">You won't receive further outreach emails from Jeff Honforloco Photography.</p>
    </div></body></html>`);
});
