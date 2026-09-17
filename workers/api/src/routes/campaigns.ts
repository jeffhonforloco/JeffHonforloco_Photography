import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

export const campaigns = new Hono<AppEnv>();
export const resendWebhook = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Schema (D1)                                                         */
/* ------------------------------------------------------------------ */

export async function ensureCampaignSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS email_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      audience TEXT NOT NULL DEFAULT 'all',
      recipient_count INTEGER NOT NULL DEFAULT 0,
      sent_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_for TEXT,
      sent_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS email_campaign_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      resend_id TEXT,
      error TEXT,
      sent_at TEXT,
      UNIQUE(campaign_id, email)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS email_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      resend_id TEXT,
      email TEXT,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS email_suppression (
      email TEXT PRIMARY KEY,
      reason TEXT NOT NULL DEFAULT 'unsubscribe',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS social_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      theme TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      posts_per_week INTEGER NOT NULL DEFAULT 2,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS social_campaign_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES social_campaigns(id) ON DELETE CASCADE,
      scheduled_date TEXT NOT NULL,
      pillar TEXT NOT NULL,
      caption_prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      publish_queue_ref TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS ad_campaign_drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      name TEXT NOT NULL,
      objective TEXT NOT NULL,
      budget_amount REAL,
      budget_type TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      start_date TEXT,
      end_date TEXT,
      targeting_json TEXT,
      creative_json TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_ecr_campaign ON email_campaign_recipients(campaign_id, status)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_ecr_resend ON email_campaign_recipients(resend_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_ee_campaign ON email_events(campaign_id, event_type)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_scp_campaign ON social_campaign_posts(campaign_id, scheduled_date)`),
  ]);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FROM = 'Jeff Honforloco Photography <info@jeffhonforlocophotos.com>';

type Recipient = { email: string; name: string | null; source: string };

function sbHeaders(env: AppEnv['Bindings']) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

async function resendSend(apiKey: string, to: string, subject: string, html: string): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return data.id || '';
}

function unsubscribeFooter(origin: string, email: string): string {
  const url = `${origin}/api/v1/email/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">` +
    `<p>You're receiving this because you contacted Jeff Honforloco Photography.</p>` +
    `<p><a href="${url}" style="color:#9ca3af;">Unsubscribe</a></p></div>`;
}

function personalize(html: string, name: string | null): string {
  const first = (name || '').trim().split(/\s+/)[0] || 'there';
  return html.split('{name}').join(escapeHtml(first));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));
}

/** Resolve the recipient list for an audience, deduped and suppression-filtered. */
async function resolveRecipients(
  db: D1Database,
  env: AppEnv['Bindings'],
  audience: string,
  customEmails: string[] = [],
): Promise<Recipient[]> {
  const seen = new Map<string, Recipient>();

  const add = (email: string, name: string | null, source: string) => {
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e) || seen.has(e)) return;
    seen.set(e, { email: e, name: name?.trim() || null, source });
  };

  // Suppression list (create defensively; the table is managed by leadAutomation too)
  let suppressed = new Set<string>();
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS email_suppression (email TEXT PRIMARY KEY, reason TEXT NOT NULL DEFAULT 'unsubscribe', created_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
    const rows = await db.prepare('SELECT email FROM email_suppression').all<{ email: string }>();
    suppressed = new Set((rows.results || []).map((r) => r.email.toLowerCase()));
  } catch { /* no suppression list yet */ }

  const wantContacts = audience === 'all' || audience === 'contacts';
  const wantLeads = audience === 'all' || audience === 'leads';

  if (wantContacts) {
    try {
      const rows = await db.prepare(
        `SELECT full_name, email FROM contacts WHERE email IS NOT NULL AND TRIM(email) != '' LIMIT 5000`
      ).all<{ full_name: string | null; email: string }>();
      for (const r of rows.results || []) add(r.email, r.full_name, 'contacts');
    } catch { /* contacts table unavailable */ }
  }

  if (wantLeads && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(
        `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/leads?select=*&limit=2000`,
        { headers: sbHeaders(env) },
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        for (const r of rows) {
          const email = String(r.email || r.contact_email || '').trim();
          const name = String(r.name || r.full_name || r.contact_name || '').trim() || null;
          if (email) add(email, name, 'leads');
        }
      }
    } catch { /* supabase leads unavailable */ }
  }

  if (audience === 'custom') {
    for (const e of customEmails) add(e, null, 'custom');
  }

  return [...seen.values()].filter((r) => !suppressed.has(r.email));
}

/** Background sender — runs under waitUntil so the HTTP request returns fast. */
async function sendCampaignNow(env: AppEnv['Bindings'], campaignId: number): Promise<void> {
  const db = env.DB;
  const camp = await db.prepare('SELECT * FROM email_campaigns WHERE id = ?').bind(campaignId)
    .first<{ id: number; subject: string; body_html: string; status: string }>();
  if (!camp || (camp.status !== 'sending' && camp.status !== 'scheduled' && camp.status !== 'draft')) return;

  await db.prepare(`UPDATE email_campaigns SET status = 'sending' WHERE id = ?`).bind(campaignId).run();

  const apiKey = env.RESEND_API_KEY;
  const origin = env.PUBLIC_API_BASE_URL || 'https://jeffhonforlocophotos.com';
  const recips = await db.prepare(
    `SELECT id, email, name FROM email_campaign_recipients WHERE campaign_id = ? AND status = 'pending' ORDER BY id`
  ).bind(campaignId).all<{ id: number; email: string; name: string | null }>();

  let sent = 0;
  let failed = 0;
  const CONCURRENCY = 5;
  const list = recips.results || [];
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (r) => {
      try {
        if (!apiKey) throw new Error('RESEND_API_KEY not configured');
        const html = personalize(camp.body_html, r.name) + unsubscribeFooter(origin, r.email);
        const resendId = await resendSend(apiKey, r.email, camp.subject, html);
        await db.prepare(
          `UPDATE email_campaign_recipients SET status = 'sent', resend_id = ?, sent_at = datetime('now') WHERE id = ?`
        ).bind(resendId, r.id).run();
        await db.prepare(
          `INSERT INTO email_events (campaign_id, resend_id, email, event_type) VALUES (?, ?, ?, 'sent')`
        ).bind(campaignId, resendId, r.email).run();
        sent++;
      } catch (err) {
        failed++;
        await db.prepare(
          `UPDATE email_campaign_recipients SET status = 'failed', error = ? WHERE id = ?`
        ).bind(err instanceof Error ? err.message.slice(0, 500) : 'send failed', r.id).run();
      }
    }));
  }

  await db.prepare(
    `UPDATE email_campaigns
     SET sent_count = sent_count + ?, failed_count = failed_count + ?,
         status = 'sent', sent_at = COALESCE(sent_at, datetime('now'))
     WHERE id = ?`
  ).bind(sent, failed, campaignId).run();
}

/** Fires scheduled campaigns whose time has come. Called from the worker cron. */
export async function processDueEmailCampaigns(env: AppEnv['Bindings']): Promise<number> {
  const db = env.DB;
  await ensureCampaignSchema(db);
  const due = await db.prepare(
    `SELECT id FROM email_campaigns WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= datetime('now') LIMIT 10`
  ).all<{ id: number }>();
  let n = 0;
  for (const row of due.results || []) {
    try {
      await sendCampaignNow(env, row.id);
      n++;
    } catch (err) {
      console.error('[campaigns] scheduled send failed:', row.id, err);
    }
  }
  return n;
}

/* ------------------------------------------------------------------ */
/* EMAIL campaigns                                                     */
/* ------------------------------------------------------------------ */

campaigns.get('/email/audience-count', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const audience = c.req.query('audience') || 'all';
  const recips = await resolveRecipients(c.env.DB, c.env, audience, []);
  return c.json({ success: true, data: { audience, count: recips.length } });
});

campaigns.get('/email', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const rows = await c.env.DB.prepare(
    `SELECT ec.*,
      (SELECT COUNT(*) FROM email_events e WHERE e.campaign_id = ec.id AND e.event_type = 'opened') AS opens,
      (SELECT COUNT(*) FROM email_events e WHERE e.campaign_id = ec.id AND e.event_type = 'clicked') AS clicks,
      (SELECT COUNT(DISTINCT email) FROM email_events e WHERE e.campaign_id = ec.id AND e.event_type = 'opened') AS unique_opens,
      (SELECT COUNT(DISTINCT email) FROM email_events e WHERE e.campaign_id = ec.id AND e.event_type = 'clicked') AS unique_clicks
     FROM email_campaigns ec ORDER BY ec.created_at DESC LIMIT 100`
  ).all();
  return c.json({ success: true, data: { campaigns: rows.results || [] } });
});

campaigns.get('/email/:id', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const camp = await c.env.DB.prepare('SELECT * FROM email_campaigns WHERE id = ?').bind(id).first();
  if (!camp) return c.json({ error: 'Campaign not found' }, 404);
  const recips = await c.env.DB.prepare(
    `SELECT email, name, source, status, error, sent_at FROM email_campaign_recipients WHERE campaign_id = ? ORDER BY id LIMIT 500`
  ).bind(id).all();
  const events = await c.env.DB.prepare(
    `SELECT event_type, COUNT(*) AS n, COUNT(DISTINCT email) AS unique_n FROM email_events WHERE campaign_id = ? GROUP BY event_type`
  ).bind(id).all();
  return c.json({ success: true, data: { campaign: camp, recipients: recips.results || [], events: events.results || [] } });
});

campaigns.post('/email', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const body = await c.req.json<{
    subject?: string; body_html?: string; audience?: string;
    custom_emails?: string[]; schedule_for?: string | null;
  }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  const subject = (body.subject || '').trim();
  const bodyHtml = (body.body_html || '').trim();
  if (!subject || !bodyHtml) return c.json({ error: 'subject and body_html are required' }, 400);
  const audience = body.audience || 'all';
  if (!['all', 'leads', 'contacts', 'custom'].includes(audience)) {
    return c.json({ error: 'audience must be all|leads|contacts|custom' }, 400);
  }

  const recips = await resolveRecipients(c.env.DB, c.env, audience, body.custom_emails || []);
  if (recips.length === 0) {
    return c.json({ error: 'No recipients found for this audience (check contacts/leads or add custom emails)' }, 400);
  }
  if (recips.length > 2000) {
    return c.json({ error: `Too many recipients (${recips.length}). Campaigns are capped at 2000 per send.` }, 400);
  }

  const scheduledFor = body.schedule_for ? new Date(body.schedule_for) : null;
  const isFuture = scheduledFor && !isNaN(scheduledFor.getTime()) && scheduledFor.getTime() > Date.now() + 60_000;
  const status = isFuture ? 'scheduled' : 'sending';

  const result = await c.env.DB.prepare(
    `INSERT INTO email_campaigns (subject, body_html, audience, recipient_count, status, scheduled_for, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    subject, bodyHtml, audience, recips.length, status,
    isFuture ? scheduledFor!.toISOString().slice(0, 19).replace('T', ' ') : null,
    (c.get('username') as string) || 'admin',
  ).run();
  const campaignId = Number(result.meta.last_row_id);

  // Insert recipients in chunks
  for (let i = 0; i < recips.length; i += 100) {
    const chunk = recips.slice(i, i + 100);
    await c.env.DB.batch(chunk.map((r) =>
      c.env.DB.prepare(
        `INSERT OR IGNORE INTO email_campaign_recipients (campaign_id, email, name, source) VALUES (?, ?, ?, ?)`
      ).bind(campaignId, r.email, r.name, r.source)
    ));
  }

  if (!c.env.RESEND_API_KEY) {
    await c.env.DB.prepare(`UPDATE email_campaigns SET status = 'draft' WHERE id = ?`).bind(campaignId).run();
    return c.json({
      success: false,
      needsResend: true,
      campaign_id: campaignId,
      message: 'Campaign saved as draft — add RESEND_API_KEY to worker secrets to send.',
    });
  }

  if (isFuture) {
    return c.json({ success: true, data: { campaign_id: campaignId, status: 'scheduled', recipient_count: recips.length } });
  }

  c.executionCtx.waitUntil(sendCampaignNow(c.env, campaignId).catch((err) => console.error('[campaigns] send failed:', err)));
  return c.json({ success: true, data: { campaign_id: campaignId, status: 'sending', recipient_count: recips.length } });
});

campaigns.post('/email/:id/send-now', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  if (!c.env.RESEND_API_KEY) {
    return c.json({ success: false, needsResend: true, message: 'Add RESEND_API_KEY to worker secrets to send.' });
  }
  const camp = await c.env.DB.prepare('SELECT id, status FROM email_campaigns WHERE id = ?').bind(id).first<{ id: number; status: string }>();
  if (!camp) return c.json({ error: 'Campaign not found' }, 404);
  if (!['draft', 'scheduled'].includes(camp.status)) {
    return c.json({ error: `Campaign is already ${camp.status}` }, 400);
  }
  await c.env.DB.prepare(`UPDATE email_campaign_recipients SET status = 'pending', error = NULL WHERE campaign_id = ? AND status = 'failed'`).bind(id).run();
  c.executionCtx.waitUntil(sendCampaignNow(c.env, id).catch((err) => console.error('[campaigns] send failed:', err)));
  return c.json({ success: true, data: { campaign_id: id, status: 'sending' } });
});

/** Send a one-off test email to a single address. */
campaigns.post('/email/test', requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json<{ to?: string; subject?: string; body_html?: string }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  if (!body.to || !EMAIL_RE.test(body.to)) return c.json({ error: 'Valid "to" email required' }, 400);
  if (!c.env.RESEND_API_KEY) {
    return c.json({ success: false, needsResend: true, message: 'Add RESEND_API_KEY to worker secrets to send.' });
  }
  try {
    const id = await resendSend(c.env.RESEND_API_KEY, body.to, body.subject || 'Test email', body.body_html || '<p>Test</p>');
    return c.json({ success: true, data: { resend_id: id } });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Send failed' }, 502);
  }
});

/* ------------------------------------------------------------------ */
/* Resend webhook (public) — open/click/bounce tracking                */
/* ------------------------------------------------------------------ */

const RESEND_EVENT_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
};

resendWebhook.post('/resend', async (c) => {
  await ensureCampaignSchema(c.env.DB);
  try {
    const body = (await c.req.json()) as { type?: string; data?: { email_id?: string; to?: string[] | string } };
    const eventType = RESEND_EVENT_MAP[body.type || ''];
    if (!eventType || !body.data?.email_id) return c.json({ ok: true });
    const resendId = body.data.email_id;
    const toAddr = Array.isArray(body.data.to) ? body.data.to[0] : body.data.to;
    const recip = await c.env.DB.prepare(
      `SELECT campaign_id, email FROM email_campaign_recipients WHERE resend_id = ? LIMIT 1`
    ).bind(resendId).first<{ campaign_id: number; email: string }>();
    await c.env.DB.prepare(
      `INSERT INTO email_events (campaign_id, resend_id, email, event_type) VALUES (?, ?, ?, ?)`
    ).bind(recip?.campaign_id ?? null, resendId, toAddr || recip?.email || null, eventType).run();
  } catch (err) {
    console.error('[campaigns] webhook error:', err);
  }
  return c.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* SOCIAL campaigns — planner UI over the existing IG publisher        */
/* ------------------------------------------------------------------ */

const PILLARS = [
  { key: 'portfolio', label: 'Portfolio Drop', prompt: 'Showcase a striking {theme} image. Hook line + 1-sentence story + booking CTA.' },
  { key: 'behind-scenes', label: 'Behind the Scenes', prompt: 'Pull back the curtain on a {theme} shoot — setup, lighting, or candid moment.' },
  { key: 'client-story', label: 'Client Story', prompt: 'Feature a {theme} client transformation or testimonial moment.' },
  { key: 'booking-cta', label: 'Booking CTA', prompt: 'Direct call-to-action for {theme} bookings: offer, urgency, link to /book.' },
  { key: 'education', label: 'Tip / Education', prompt: 'Share one practical {theme} tip (posing, light, prep). End with soft CTA.' },
];

function planCalendar(startDate: string, endDate: string, postsPerWeek: number, theme: string) {
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const weeks = days / 7;
  const total = Math.max(1, Math.min(200, Math.round(postsPerWeek * weeks)));
  const step = days / total;
  const slots: Array<{ scheduled_date: string; pillar: string; caption_prompt: string }> = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(start.getTime() + Math.round(i * step) * 86_400_000);
    if (d > end) break;
    const pillar = PILLARS[i % PILLARS.length];
    slots.push({
      scheduled_date: d.toISOString().slice(0, 10),
      pillar: pillar.key,
      caption_prompt: pillar.prompt.split('{theme}').join(theme || 'photography'),
    });
  }
  return slots;
}

campaigns.get('/social', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const rows = await c.env.DB.prepare(
    `SELECT sc.*,
      (SELECT COUNT(*) FROM social_campaign_posts p WHERE p.campaign_id = sc.id) AS post_count,
      (SELECT COUNT(*) FROM social_campaign_posts p WHERE p.campaign_id = sc.id AND p.status != 'planned') AS done_count
     FROM social_campaigns sc ORDER BY sc.created_at DESC LIMIT 100`
  ).all();
  return c.json({ success: true, data: { campaigns: rows.results || [] } });
});

campaigns.get('/social/:id', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const camp = await c.env.DB.prepare('SELECT * FROM social_campaigns WHERE id = ?').bind(id).first();
  if (!camp) return c.json({ error: 'Campaign not found' }, 404);
  const posts = await c.env.DB.prepare(
    `SELECT * FROM social_campaign_posts WHERE campaign_id = ? ORDER BY scheduled_date`
  ).bind(id).all();
  return c.json({ success: true, data: { campaign: camp, posts: posts.results || [], pillars: PILLARS } });
});

campaigns.post('/social', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const body = await c.req.json<{
    name?: string; theme?: string; start_date?: string; end_date?: string;
    posts_per_week?: number; notes?: string;
  }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  const name = (body.name || '').trim();
  const theme = (body.theme || '').trim();
  if (!name || !theme || !body.start_date || !body.end_date) {
    return c.json({ error: 'name, theme, start_date, end_date are required' }, 400);
  }
  const ppw = Math.min(7, Math.max(1, Number(body.posts_per_week) || 2));
  const slots = planCalendar(body.start_date, body.end_date, ppw, theme);
  if (!slots) return c.json({ error: 'Invalid date range' }, 400);

  const result = await c.env.DB.prepare(
    `INSERT INTO social_campaigns (name, theme, start_date, end_date, posts_per_week, notes) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(name, theme, body.start_date, body.end_date, ppw, body.notes || null).run();
  const campaignId = Number(result.meta.last_row_id);

  await c.env.DB.batch(slots.map((s) =>
    c.env.DB.prepare(
      `INSERT INTO social_campaign_posts (campaign_id, scheduled_date, pillar, caption_prompt) VALUES (?, ?, ?, ?)`
    ).bind(campaignId, s.scheduled_date, s.pillar, s.caption_prompt)
  ));

  return c.json({ success: true, data: { campaign_id: campaignId, post_count: slots.length } });
});

campaigns.patch('/social/posts/:postId', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const postId = Number(c.req.param('postId'));
  const body = await c.req.json<{ status?: string; publish_queue_ref?: string }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  if (body.status && !['planned', 'queued', 'published', 'skipped'].includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.status) { sets.push('status = ?'); vals.push(body.status); }
  if (body.publish_queue_ref !== undefined) { sets.push('publish_queue_ref = ?'); vals.push(body.publish_queue_ref); }
  if (!sets.length) return c.json({ error: 'Nothing to update' }, 400);
  await c.env.DB.prepare(`UPDATE social_campaign_posts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, postId).run();
  return c.json({ success: true });
});

/* ------------------------------------------------------------------ */
/* AD campaign drafts — stubbed until Meta/Google OAuth is wired       */
/* ------------------------------------------------------------------ */

const AD_PLATFORMS = ['meta', 'google'];
const AD_OBJECTIVES = ['traffic', 'leads', 'bookings', 'awareness', 'engagement'];

campaigns.get('/ads/drafts', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const rows = await c.env.DB.prepare(`SELECT * FROM ad_campaign_drafts ORDER BY created_at DESC LIMIT 100`).all();
  const drafts = (rows.results || []).map((d: Record<string, unknown>) => ({
    ...d,
    targeting: safeJson(d.targeting_json as string),
    creative: safeJson(d.creative_json as string),
  }));
  return c.json({ success: true, data: { drafts } });
});

campaigns.post('/ads/draft', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  const body = await c.req.json<{
    platform?: string; name?: string; objective?: string;
    budget_amount?: number; budget_type?: string; currency?: string;
    start_date?: string; end_date?: string;
    targeting?: { locations?: string; age_min?: number; age_max?: number; genders?: string; interests?: string };
    creative?: { headline?: string; primary_text?: string; image_url?: string; cta_url?: string };
  }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  if (!body.platform || !AD_PLATFORMS.includes(body.platform)) {
    return c.json({ error: 'platform must be meta or google' }, 400);
  }
  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400);
  if (!body.objective || !AD_OBJECTIVES.includes(body.objective)) {
    return c.json({ error: `objective must be one of ${AD_OBJECTIVES.join(', ')}` }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO ad_campaign_drafts (platform, name, objective, budget_amount, budget_type, currency, start_date, end_date, targeting_json, creative_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.platform, body.name.trim(), body.objective,
    body.budget_amount ?? null, body.budget_type || 'daily', (body.currency || 'USD').toUpperCase(),
    body.start_date || null, body.end_date || null,
    JSON.stringify(body.targeting || {}), JSON.stringify(body.creative || {}),
  ).run();
  const draftId = Number(result.meta.last_row_id);

  return c.json({
    success: true,
    needsConnection: true,
    data: {
      draft_id: draftId,
      platform: body.platform,
      message: 'Draft saved. Connect your ad account to launch — see the Ads tab for setup steps.',
    },
  });
});

campaigns.delete('/ads/draft/:id', requireAuth, requireAdmin, async (c) => {
  await ensureCampaignSchema(c.env.DB);
  await c.env.DB.prepare('DELETE FROM ad_campaign_drafts WHERE id = ?').bind(Number(c.req.param('id'))).run();
  return c.json({ success: true });
});

function safeJson(s: string | null | undefined): Record<string, unknown> {
  try { return s ? JSON.parse(s) : {}; } catch { return {}; }
}
