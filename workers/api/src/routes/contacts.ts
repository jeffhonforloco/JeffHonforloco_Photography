import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const contacts = new Hono<AppEnv>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_STATUSES = new Set(['new', 'contacted', 'booked', 'closed']);

// GET /api/v1/contacts — paginated, filterable (auth required)
contacts.get('/', requireAuth, async (c) => {
  const page   = Math.max(1, Number(c.req.query('page') ?? 1));
  const limit  = Math.min(50, Number(c.req.query('limit') ?? 20));
  const offset = (page - 1) * limit;
  const status = c.req.query('status');
  const search = c.req.query('search');

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) { where += ' AND (full_name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows, total] = await Promise.all([
    c.env.DB.prepare(`SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...params, limit, offset).all(),
    c.env.DB.prepare(`SELECT COUNT(*) as n FROM contacts ${where}`)
      .bind(...params).first<{ n: number }>(),
  ]);

  return c.json({ contacts: rows.results, total: total?.n ?? 0, page, limit });
});

// GET /api/v1/contacts/stats — overview stats (auth required)
contacts.get('/stats', requireAuth, async (c) => {
  const [total, byStatus, recent] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as n FROM contacts').first<{ n: number }>(),
    c.env.DB.prepare('SELECT status, COUNT(*) as n FROM contacts GROUP BY status').all(),
    c.env.DB.prepare('SELECT COUNT(*) as n FROM contacts WHERE created_at >= datetime("now", "-7 days")').first<{ n: number }>(),
  ]);
  return c.json({ total: total?.n ?? 0, byStatus: byStatus.results, recentWeek: recent?.n ?? 0 });
});

// POST /api/v1/contacts — create contact (public)
contacts.post('/', async (c) => {
  const body = await c.req.json<{
    full_name: string; email: string; phone?: string; message: string;
    service_type?: string; budget_range?: string; event_date?: string; location?: string;
  }>();

  if (!body.full_name || !body.email || !body.message) {
    return c.json({ error: 'full_name, email, message are required' }, 400);
  }
  if (!EMAIL_RE.test(body.email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO contacts (full_name, email, phone, message, service_type, budget_range, event_date, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(body.full_name, body.email, body.phone ?? null, body.message,
         body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null, body.location ?? null).run();

  return c.json({ ok: true, id: result.meta.last_row_id }, 201);
});

// GET /api/v1/contacts/:id (auth required)
contacts.get('/:id', requireAuth, async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// PUT /api/v1/contacts/:id (auth required)
contacts.put('/:id', requireAuth, async (c) => {
  const { status, notes } = await c.req.json<{ status?: string; notes?: string }>();
  if (status !== undefined && !ALLOWED_STATUSES.has(status)) {
    return c.json({ error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}` }, 400);
  }
  await c.env.DB.prepare(
    `UPDATE contacts SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?`
  ).bind(status ?? null, notes ?? null, c.req.param('id')).run();
  return c.json({ ok: true });
});

// DELETE /api/v1/contacts/:id (auth required)
contacts.delete('/:id', requireAuth, async (c) => {
  await c.env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

export default contacts;
