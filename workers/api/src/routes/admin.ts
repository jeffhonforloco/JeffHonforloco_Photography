import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const admin = new Hono<AppEnv>();

const EVENT_TYPE_RE = /^[a-zA-Z0-9_.:-]{1,100}$/;

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return '***';
  const local = email.slice(0, at);
  return local.slice(0, Math.min(3, local.length)) + '***' + email.slice(at);
}

// POST /api/v1/analytics — track event (public, validated)
admin.post('/analytics', async (c) => {
  const body = await c.req.json<{ event_type: string; event_data?: string }>();
  if (!body.event_type) return c.json({ error: 'event_type required' }, 400);
  if (!EVENT_TYPE_RE.test(body.event_type)) return c.json({ error: 'Invalid event_type' }, 400);

  const eventData = body.event_data ? body.event_data.slice(0, 1000) : null;

  await c.env.DB.prepare(
    `INSERT INTO analytics (event_type, event_data, user_agent, ip_address, referrer) VALUES (?, ?, ?, ?, ?)`
  ).bind(
    body.event_type, eventData,
    c.req.header('User-Agent') ?? null,
    c.req.header('CF-Connecting-IP') ?? null,
    c.req.header('Referer') ?? null,
  ).run();
  return c.json({ ok: true });
});

// GET /api/v1/admin/dashboard (auth required)
admin.get('/dashboard', requireAuth, async (c) => {
  const [contacts, posts, portfolio, subs, recentContacts] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = "contacted" THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = "qualified" THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = "booked" THEN 1 ELSE 0 END) as booked,
        SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed
      FROM contacts
    `).first(),
    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft
      FROM blog_posts
    `).first(),
    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured
      FROM portfolio_images
    `).first(),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM newsletter_subscribers').first(),
    c.env.DB.prepare('SELECT full_name, email, service_type, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 5').all(),
  ]);

  const contactCounts = contacts as {
    total?: number; new_count?: number; contacted?: number; qualified?: number; booked?: number; completed?: number;
  } | null;
  const postCounts = posts as { total?: number; published?: number; draft?: number } | null;
  const portfolioCounts = portfolio as { total?: number; featured?: number } | null;

  const overview = {
    contacts: {
      total: contactCounts?.total ?? 0,
      new: contactCounts?.new_count ?? 0,
      contacted: contactCounts?.contacted ?? 0,
      qualified: contactCounts?.qualified ?? 0,
      booked: contactCounts?.booked ?? 0,
      completed: contactCounts?.completed ?? 0,
    },
    blogPosts: {
      total: postCounts?.total ?? 0,
      published: postCounts?.published ?? 0,
      draft: postCounts?.draft ?? 0,
    },
    portfolioImages: {
      total: portfolioCounts?.total ?? 0,
      featured: portfolioCounts?.featured ?? 0,
    },
    subscribers: subs ?? { total: 0 },
    recentActivity: (recentContacts.results ?? []).map((contact) => ({
      type: 'contact',
      title: `New inquiry from ${(contact as { full_name?: string }).full_name ?? 'Unknown'}`,
      created_at: (contact as { created_at?: string }).created_at ?? new Date().toISOString(),
      status: (contact as { status?: string }).status ?? 'new',
    })),
  };

  return c.json({
    success: true,
    contacts,
    posts,
    portfolio,
    subscribers: subs,
    recentContacts: recentContacts.results,
    data: { overview },
  });
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

  const eventCounts = Object.fromEntries(
    (byType.results ?? []).map((row) => {
      const event = row as { event_type: string; count: number };
      return [event.event_type, event.count];
    })
  );
  const dailyData = Object.fromEntries(
    (daily.results ?? []).map((row) => {
      const item = row as { date: string; count: number };
      return [item.date, { pageViews: item.count }];
    })
  );

  const data = {
    pageViews: eventCounts.page_view ?? eventCounts.pageview ?? 0,
    contactForms: eventCounts.contact_form_submit ?? eventCounts.contact ?? 0,
    newsletterSignups: eventCounts.email_signup ?? eventCounts.newsletter_signup ?? 0,
    portfolioViews: eventCounts.portfolio_view ?? 0,
    blogViews: eventCounts.blog_view ?? 0,
    dailyData,
    byType: byType.results,
    daily: daily.results,
  };

  return c.json({ success: true, period, byType: byType.results, daily: daily.results, data });
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
    success: true,
    secrets: {
      OPENAI_API_KEY: hasOpenAIKey  ? openaiStatus    : 'not_set',
      RESEND_API_KEY: hasResendKey  ? 'set'           : 'not_set',
      JWT_SECRET:     hasJwtSecret  ? 'set'           : 'not_set',
      ADMIN_EMAIL:    hasAdminEmail ? maskEmail(c.env.ADMIN_EMAIL) : 'not_set',
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

  return c.json({ success: true, data: rows.results, total: rows.results.length });
});

export default admin;
