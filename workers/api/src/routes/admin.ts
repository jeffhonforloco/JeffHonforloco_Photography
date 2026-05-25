import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const admin = new Hono<AppEnv>();

// POST /api/v1/analytics — track event (public)
admin.post('/analytics', async (c) => {
  const body = await c.req.json<{ event_type: string; event_data?: string }>();
  if (!body.event_type) return c.json({ error: 'event_type required' }, 400);
  await c.env.DB.prepare(
    `INSERT INTO analytics (event_type, event_data, user_agent, ip_address, referrer) VALUES (?, ?, ?, ?, ?)`
  ).bind(
    body.event_type, body.event_data ?? null,
    c.req.header('User-Agent') ?? null,
    c.req.header('CF-Connecting-IP') ?? null,
    c.req.header('Referer') ?? null,
  ).run();
  return c.json({ ok: true });
});

// GET /api/v1/admin/dashboard (auth required)
admin.get('/dashboard', requireAuth, async (c) => {
  const [contacts, posts, portfolio, subs, recentContacts] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status="new" THEN 1 ELSE 0 END) as new_count FROM contacts').first(),
    c.env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status="published" THEN 1 ELSE 0 END) as published FROM blog_posts').first(),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM portfolio_images').first(),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM newsletter_subscribers').first(),
    c.env.DB.prepare('SELECT full_name, email, service_type, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 5').all(),
  ]);
  return c.json({ contacts, posts, portfolio, subscribers: subs, recentContacts: recentContacts.results });
});

// GET /api/v1/admin/analytics (auth required)
admin.get('/analytics', requireAuth, async (c) => {
  const period = c.req.query('period') ?? '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;

  const [byType, daily] = await Promise.all([
    c.env.DB.prepare(
      `SELECT event_type, COUNT(*) as count FROM analytics
       WHERE created_at >= datetime('now', ? || ' days') GROUP BY event_type ORDER BY count DESC`
    ).bind(`-${days}`).all(),
    c.env.DB.prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM analytics
       WHERE created_at >= datetime('now', ? || ' days') GROUP BY DATE(created_at) ORDER BY date ASC`
    ).bind(`-${days}`).all(),
  ]);

  return c.json({ period, byType: byType.results, daily: daily.results });
});

// GET /api/v1/admin/config-check (auth required) — verify Worker secrets are configured
admin.get('/config-check', requireAuth, async (c) => {
  const hasOpenAIKey  = Boolean(c.env.OPENAI_API_KEY);
  const hasResendKey  = Boolean(c.env.RESEND_API_KEY);
  const hasJwtSecret  = Boolean(c.env.JWT_SECRET);
  const hasAdminEmail = Boolean(c.env.ADMIN_EMAIL);

  let openaiStatus = 'not_set';
  if (hasOpenAIKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      openaiStatus = res.ok ? 'ok' : `error_${res.status}`;
    } catch {
      openaiStatus = 'unreachable';
    }
  }

  return c.json({
    secrets: {
      OPENAI_API_KEY: hasOpenAIKey  ? openaiStatus    : 'not_set',
      RESEND_API_KEY: hasResendKey  ? 'set'           : 'not_set',
      JWT_SECRET:     hasJwtSecret  ? 'set'           : 'not_set',
      ADMIN_EMAIL:    hasAdminEmail ? c.env.ADMIN_EMAIL : 'not_set',
    },
    note: 'Set missing secrets via: wrangler secret put SECRET_NAME — or Cloudflare Dashboard → Worker → Settings → Variables',
  });
});

// GET /api/v1/admin/export/:type (auth required)
admin.get('/export/:type', requireAuth, async (c) => {
  const type = c.req.param('type');
  const table = { contacts: 'contacts', blog: 'blog_posts', portfolio: 'portfolio_images', analytics: 'analytics' }[type];
  if (!table) return c.json({ error: 'Unknown export type' }, 400);

  const rows = await c.env.DB.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 1000`).all();
  const fmt  = c.req.query('format') ?? 'json';

  if (fmt === 'csv' && rows.results.length > 0) {
    const keys   = Object.keys(rows.results[0] as object);
    const header = keys.join(',');
    const body   = rows.results.map(r => keys.map(k => JSON.stringify((r as Record<string, unknown>)[k] ?? '')).join(',')).join('\n');
    return new Response(`${header}\n${body}`, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${type}.csv"` },
    });
  }

  return c.json({ data: rows.results, total: rows.results.length });
});

export default admin;
