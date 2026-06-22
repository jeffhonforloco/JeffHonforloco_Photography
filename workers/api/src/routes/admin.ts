import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';
import { ensureLeadAutomationSchema, processDueEmailSequences } from '../lib/leadAutomation';

const admin = new Hono<AppEnv>();

const EVENT_TYPE_RE = /^[a-zA-Z0-9_.:-]{1,100}$/;
const TEMPLATE_NAME_RE = /^[a-zA-Z0-9_-]{2,80}$/;
const EXPORT_TABLES = [
  'users',
  'contacts',
  'blog_posts',
  'portfolio_images',
  'analytics',
  'newsletter_subscribers',
  'email_templates',
  'email_sequences',
  'email_suppression',
] as const;
const DATABASE_EXPORT_LIMIT = 10000;

type TemplateInput = {
  name?: string;
  subject?: string;
  content?: string;
  is_active?: boolean | number;
};

type TemplateRow = {
  id: number;
  name: string;
  subject: string;
  content: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return '***';
  const local = email.slice(0, at);
  return local.slice(0, Math.min(3, local.length)) + '***' + email.slice(at);
}

function cleanTemplateInput(body: TemplateInput, partial = false): { data?: TemplateInput; error?: string } {
  const data: TemplateInput = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!TEMPLATE_NAME_RE.test(name)) return { error: 'Template name must be 2-80 letters, numbers, dashes, or underscores' };
    data.name = name;
  } else if (!partial) {
    return { error: 'Template name is required' };
  }

  if (body.subject !== undefined) {
    const subject = String(body.subject).trim();
    if (!subject) return { error: 'Subject is required' };
    data.subject = subject;
  } else if (!partial) {
    return { error: 'Subject is required' };
  }

  if (body.content !== undefined) {
    const content = String(body.content).trim();
    if (!content) return { error: 'Content is required' };
    data.content = content;
  } else if (!partial) {
    return { error: 'Content is required' };
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active === 'boolean') {
      data.is_active = body.is_active;
    } else if (body.is_active === 0 || body.is_active === 1) {
      data.is_active = body.is_active;
    } else {
      return { error: 'is_active must be a boolean' };
    }
  } else if (!partial) {
    data.is_active = true;
  }

  return { data };
}

function normalizeTemplate(row: TemplateRow): Omit<TemplateRow, 'is_active'> & { is_active: boolean } {
  return { ...row, is_active: Boolean(row.is_active) };
}

function sqlIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function countRows(db: D1Database, table: string): Promise<number> {
  const row = await db.prepare(`SELECT COUNT(*) as count FROM ${table}`).first<{ count: number }>();
  return row?.count ?? 0;
}

async function buildDatabaseExport(db: D1Database): Promise<string> {
  const lines = [
    '-- Jeff Honforloco Photography D1 export',
    `-- Created at ${new Date().toISOString()}`,
    'PRAGMA foreign_keys=OFF;',
    'BEGIN TRANSACTION;',
  ];

  for (const table of EXPORT_TABLES) {
    const rows = await db.prepare(`SELECT * FROM ${table} LIMIT ?`).bind(DATABASE_EXPORT_LIMIT).all<Record<string, unknown>>();
    lines.push('', `-- ${table}`);

    for (const row of rows.results ?? []) {
      const columns = Object.keys(row);
      if (columns.length === 0) continue;
      const columnSql = columns.map(sqlIdentifier).join(', ');
      const valueSql = columns.map((column) => sqlValue(row[column])).join(', ');
      lines.push(`INSERT INTO ${sqlIdentifier(table)} (${columnSql}) VALUES (${valueSql});`);
    }
  }

  lines.push('', 'COMMIT;');
  return lines.join('\n');
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
        SUM(CASE WHEN status = "quote_sent" THEN 1 ELSE 0 END) as quote_sent,
        SUM(CASE WHEN status = "deposit_paid" THEN 1 ELSE 0 END) as deposit_paid,
        SUM(CASE WHEN status = "booked" THEN 1 ELSE 0 END) as booked,
        SUM(CASE WHEN status = "lost" THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = "closed" THEN 1 ELSE 0 END) as closed
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
    total?: number; new_count?: number; contacted?: number; qualified?: number; quote_sent?: number; deposit_paid?: number;
    booked?: number; lost?: number; completed?: number; closed?: number;
  } | null;
  const postCounts = posts as { total?: number; published?: number; draft?: number } | null;
  const portfolioCounts = portfolio as { total?: number; featured?: number } | null;

  const overview = {
    contacts: {
      total: contactCounts?.total ?? 0,
      new: contactCounts?.new_count ?? 0,
      contacted: contactCounts?.contacted ?? 0,
      qualified: contactCounts?.qualified ?? 0,
      quote_sent: contactCounts?.quote_sent ?? 0,
      deposit_paid: contactCounts?.deposit_paid ?? 0,
      booked: contactCounts?.booked ?? 0,
      lost: contactCounts?.lost ?? 0,
      completed: contactCounts?.completed ?? 0,
      closed: contactCounts?.closed ?? 0,
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
  const hasAnthropicKey = Boolean(c.env.ANTHROPIC_API_KEY);
  const hasSireIqKey  = Boolean(c.env.SIREIQ_HF_TOKEN);
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
      ANTHROPIC_API_KEY: hasAnthropicKey ? 'set'      : 'not_set',
      SIREIQ_HF_TOKEN: hasSireIqKey ? 'set'           : 'not_set',
      SIREIQ_HF_MODEL: c.env.SIREIQ_HF_MODEL || 'openai/gpt-oss-20b:fastest',
      RESEND_API_KEY: hasResendKey  ? 'set'           : 'not_set',
      JWT_SECRET:     hasJwtSecret  ? 'set'           : 'not_set',
      ADMIN_EMAIL:    hasAdminEmail ? maskEmail(c.env.ADMIN_EMAIL) : 'not_set',
      PUBLIC_API_BASE_URL: c.env.PUBLIC_API_BASE_URL || 'not_set',
      BUSINESS_POSTAL_ADDRESS: c.env.BUSINESS_POSTAL_ADDRESS || 'not_set',
    },
    note: 'Set missing secrets via: wrangler secret put SECRET_NAME — or Cloudflare Dashboard → Worker → Settings → Variables',
  });
});

// GET /api/v1/admin/email-templates (auth required)
admin.get('/email-templates', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const rows = await c.env.DB.prepare(
    `SELECT id, name, subject, content, is_active, created_at, updated_at
     FROM email_templates
     ORDER BY name ASC`
  ).all<TemplateRow>();

  return c.json({ success: true, data: (rows.results ?? []).map(normalizeTemplate) });
});

// POST /api/v1/admin/email-templates (auth required)
admin.post('/email-templates', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const parsed = cleanTemplateInput(await c.req.json<TemplateInput>());
  if (parsed.error || !parsed.data) return c.json({ error: parsed.error ?? 'Invalid template' }, 400);

  const isActive = parsed.data.is_active === false || parsed.data.is_active === 0 ? 0 : 1;

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO email_templates (name, subject, content, is_active)
       VALUES (?, ?, ?, ?)`
    ).bind(parsed.data.name, parsed.data.subject, parsed.data.content, isActive).run();

    const template = await c.env.DB.prepare(
      `SELECT id, name, subject, content, is_active, created_at, updated_at
       FROM email_templates
       WHERE id = ?`
    ).bind(result.meta.last_row_id).first<TemplateRow>();

    return c.json({ success: true, data: template ? normalizeTemplate(template) : null }, 201);
  } catch (error) {
    console.error('[admin/email-templates] Create failed:', error);
    return c.json({ error: 'Failed to create email template' }, 500);
  }
});

// PUT /api/v1/admin/email-templates/:id (auth required)
admin.put('/email-templates/:id', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid template id' }, 400);

  const parsed = cleanTemplateInput(await c.req.json<TemplateInput>(), true);
  if (parsed.error || !parsed.data) return c.json({ error: parsed.error ?? 'Invalid template' }, 400);

  const hasChanges = Object.keys(parsed.data).length > 0;
  if (!hasChanges) return c.json({ error: 'No updates provided' }, 400);

  const isActive = parsed.data.is_active === undefined
    ? null
    : parsed.data.is_active === false || parsed.data.is_active === 0 ? 0 : 1;

  try {
    await c.env.DB.prepare(
      `UPDATE email_templates
       SET name = COALESCE(?, name),
           subject = COALESCE(?, subject),
           content = COALESCE(?, content),
           is_active = COALESCE(?, is_active),
           updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      parsed.data.name ?? null,
      parsed.data.subject ?? null,
      parsed.data.content ?? null,
      isActive,
      id,
    ).run();

    const template = await c.env.DB.prepare(
      `SELECT id, name, subject, content, is_active, created_at, updated_at
       FROM email_templates
       WHERE id = ?`
    ).bind(id).first<TemplateRow>();

    if (!template) return c.json({ error: 'Template not found' }, 404);
    return c.json({ success: true, data: normalizeTemplate(template) });
  } catch (error) {
    console.error('[admin/email-templates] Update failed:', error);
    return c.json({ error: 'Failed to update email template' }, 500);
  }
});

// DELETE /api/v1/admin/email-templates/:id (auth required)
admin.delete('/email-templates/:id', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid template id' }, 400);

  await c.env.DB.prepare('DELETE FROM email_templates WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// GET /api/v1/admin/email-sequences (auth required)
admin.get('/email-sequences', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const status = c.req.query('status');
  const limit = Math.min(200, Math.max(1, Number(c.req.query('limit') ?? 100)));

  const params: (string | number)[] = [];
  let where = 'WHERE 1=1';
  if (status) {
    where += ' AND s.status = ?';
    params.push(status);
  }

  const rows = await c.env.DB.prepare(
    `SELECT
       s.id, s.contact_id, s.sequence_type, s.step_number, s.email_template,
       s.scheduled_for, s.sent_at, s.status, s.last_error, s.created_at,
       c.full_name, c.email
     FROM email_sequences s
     LEFT JOIN contacts c ON c.id = s.contact_id
     ${where}
     ORDER BY s.scheduled_for DESC
     LIMIT ?`
  ).bind(...params, limit).all();

  return c.json({ success: true, data: rows.results ?? [] });
});

// POST /api/v1/admin/email-sequences/process (auth required)
admin.post('/email-sequences/process', requireAuth, async (c) => {
  const result = await processDueEmailSequences(c.env);
  return c.json({ success: true, data: result });
});

// GET /api/v1/admin/database/stats (auth required)
admin.get('/database/stats', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  const [contacts, blogPosts, portfolioImages, emailTemplates, emailSequences, analytics] = await Promise.all([
    countRows(c.env.DB, 'contacts'),
    countRows(c.env.DB, 'blog_posts'),
    countRows(c.env.DB, 'portfolio_images'),
    countRows(c.env.DB, 'email_templates'),
    countRows(c.env.DB, 'email_sequences'),
    countRows(c.env.DB, 'analytics'),
  ]);

  return c.json({
    success: true,
    data: {
      contacts,
      blogPosts,
      portfolioImages,
      emailTemplates,
      emailSequences,
      analytics,
      totalSize: 0,
      lastBackup: null,
    },
  });
});

// GET /api/v1/admin/health (auth required)
admin.get('/health', requireAuth, async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({
      success: true,
      health: {
        status: 'healthy',
        message: 'D1 database is reachable',
        fileSize: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[admin/health] DB check failed:', error);
    return c.json({
      success: true,
      health: {
        status: 'error',
        message: 'D1 database check failed',
        fileSize: 0,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// POST /api/v1/admin/database/backup (auth required)
admin.post('/database/backup', requireAuth, async (c) => {
  await ensureLeadAutomationSchema(c.env);
  return c.json({
    success: true,
    data: {
      created_at: new Date().toISOString(),
      downloadUrl: '/api/v1/admin/export/database?format=sql',
      note: 'D1 backups are exported on demand from the database export endpoint.',
    },
  });
});

// GET /api/v1/admin/export/:type (auth required)
admin.get('/export/:type', requireAuth, async (c) => {
  const type = c.req.param('type');
  const fmt  = c.req.query('format') ?? 'json';

  if (type === 'database') {
    await ensureLeadAutomationSchema(c.env);
    const sql = await buildDatabaseExport(c.env.DB);
    return new Response(sql, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': 'attachment; filename="jeffhonforloco_database_export.sql"',
      },
    });
  }

  const table = { contacts: 'contacts', blog: 'blog_posts', portfolio: 'portfolio_images', analytics: 'analytics' }[type];
  if (!table) return c.json({ error: 'Unknown export type' }, 400);

  const rows = await c.env.DB.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 1000`).all();

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
