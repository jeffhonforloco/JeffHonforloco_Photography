import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';
import { cancelPendingFollowups, LEAD_PIPELINE_STATUSES, PAUSE_FOLLOWUP_STATUSES, scheduleLeadFollowups } from '../lib/leadAutomation';

const contacts = new Hono<AppEnv>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_STATUSES = new Set<string>(LEAD_PIPELINE_STATUSES);

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

  return c.json({
    success: true,
    contacts: rows.results,
    data: rows.results,
    total: total?.n ?? 0,
    page,
    limit,
  });
});

// GET /api/v1/contacts/stats — overview stats (auth required)
contacts.get('/stats', requireAuth, async (c) => {
  const [total, byStatus, recent] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as n FROM contacts').first<{ n: number }>(),
    c.env.DB.prepare('SELECT status, COUNT(*) as n FROM contacts GROUP BY status').all(),
    c.env.DB.prepare('SELECT COUNT(*) as n FROM contacts WHERE created_at >= datetime("now", "-7 days")').first<{ n: number }>(),
  ]);
  return c.json({
    success: true,
    total: total?.n ?? 0,
    byStatus: byStatus.results,
    recentWeek: recent?.n ?? 0,
    data: { total: total?.n ?? 0, byStatus: byStatus.results, recentWeek: recent?.n ?? 0 },
  });
});

// POST /api/v1/contacts — create contact (public)
contacts.post('/', async (c) => {
  const body = await c.req.json<{
    full_name: string; email: string; phone?: string; message: string;
    service_type?: string; budget_range?: string; event_date?: string; location?: string;
    attribution?: string; qualification?: string;
  }>();

  if (!body.full_name || !body.email || !body.message) {
    return c.json({ error: 'full_name, email, message are required' }, 400);
  }
  if (!EMAIL_RE.test(body.email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  // Repeat inquiry from an existing email: update/reopen instead of failing on UNIQUE(email)
  const existingContact = await c.env.DB.prepare(
    'SELECT id FROM contacts WHERE email = ?'
  ).bind(body.email).first<{ id: number }>();

  if (existingContact) {
    await c.env.DB.prepare(
      `UPDATE contacts SET full_name = ?, phone = COALESCE(?, phone), message = ?,
       service_type = COALESCE(?, service_type), budget_range = COALESCE(?, budget_range),
       event_date = COALESCE(?, event_date), location = COALESCE(?, location),
       status = 'new', updated_at = datetime('now') WHERE id = ?`
    ).bind(body.full_name, body.phone ?? null, body.message,
           body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null,
           body.location ?? null, existingContact.id).run();

    const reopenedId = existingContact.id;
    let attribution: unknown = null;
    try { attribution = body.attribution ? JSON.parse(body.attribution) : null; } catch { attribution = null; }
    await c.env.DB.prepare(
      `INSERT INTO analytics (event_type, event_data) VALUES ('Lead', ?)`
    ).bind(JSON.stringify({ contactId: reopenedId, service: body.service_type ?? null, attribution, reopened: true })).run();
    try {
      await cancelPendingFollowups(c.env, reopenedId);
      await scheduleLeadFollowups(c.env, reopenedId);
    } catch (error) {
      console.error('[contacts] Failed to reschedule follow-ups for reopened contact:', error);
    }

    return c.json({ ok: true, success: true, id: reopenedId, data: { id: reopenedId }, reopened: true }, 200);
  }

  let result;
  try {
    result = await c.env.DB.prepare(
      `INSERT INTO contacts (full_name, email, phone, message, service_type, budget_range, event_date, location, attribution, qualification)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(body.full_name, body.email, body.phone ?? null, body.message,
           body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null, body.location ?? null,
           body.attribution?.slice(0, 2000) ?? null, body.qualification?.slice(0, 2000) ?? null).run();
  } catch (colErr) {
    // Fallback: attribution/qualification columns may not exist in D1 yet — insert without them
    console.warn('[contacts] Full INSERT failed, retrying without attribution/qualification:', colErr);
    result = await c.env.DB.prepare(
      `INSERT INTO contacts (full_name, email, phone, message, service_type, budget_range, event_date, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(body.full_name, body.email, body.phone ?? null, body.message,
           body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null, body.location ?? null).run();
  }

  const contactId = Number(result.meta.last_row_id);
  if (contactId) {
    let attribution: unknown = null;
    try { attribution = body.attribution ? JSON.parse(body.attribution) : null; } catch { attribution = null; }
    await c.env.DB.prepare(
      `INSERT INTO analytics (event_type, event_data) VALUES ('Lead', ?)`
    ).bind(JSON.stringify({ contactId, service: body.service_type ?? null, attribution })).run();
    try {
      await scheduleLeadFollowups(c.env, contactId);
    } catch (error) {
      console.error('[contacts] Failed to schedule follow-ups:', error);
    }
  }

  return c.json({ ok: true, success: true, id: result.meta.last_row_id, data: { id: result.meta.last_row_id } }, 201);
});

// GET /api/v1/contacts/:id (auth required)
contacts.get('/:id', requireAuth, async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, contact: row, data: row });
});

// PUT /api/v1/contacts/:id (auth required)
contacts.put('/:id', requireAuth, async (c) => {
  const { status, notes } = await c.req.json<{ status?: string; notes?: string }>();
  if (status !== undefined && !ALLOWED_STATUSES.has(status)) {
    return c.json({ error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}` }, 400);
  }
  const existing = await c.env.DB.prepare(
    'SELECT status, service_type, attribution FROM contacts WHERE id = ?'
  ).bind(c.req.param('id')).first<{ status: string; service_type?: string; attribution?: string }>();

  await c.env.DB.prepare(
    `UPDATE contacts SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?`
  ).bind(status ?? null, notes ?? null, c.req.param('id')).run();

  if (status && PAUSE_FOLLOWUP_STATUSES.has(status)) {
    await cancelPendingFollowups(c.env, Number(c.req.param('id')));
  }

  if (status === 'booked' && existing?.status !== 'booked') {
    let attribution: unknown = null;
    try { attribution = existing?.attribution ? JSON.parse(existing.attribution) : null; } catch { attribution = null; }
    await c.env.DB.prepare(
      `INSERT INTO analytics (event_type, event_data) VALUES ('BookingConfirmed', ?)`
    ).bind(JSON.stringify({ contactId: Number(c.req.param('id')), service: existing?.service_type ?? null, attribution })).run();
  }

  return c.json({ ok: true, success: true });
});

// DELETE /api/v1/contacts/:id (auth required)
contacts.delete('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id)) return c.json({ error: 'Invalid id' }, 400);
  await c.env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
  // Keep tracking consistent: drop this contact's lead events and sequences
  // so deleted (e.g. test) contacts can't leave orphaned dashboard counts.
  await c.env.DB.prepare(
    `DELETE FROM analytics WHERE event_type IN ('Lead', 'BookingConfirmed')
     AND CAST(json_extract(event_data, '$.contactId') AS INTEGER) = ?`
  ).bind(id).run();
  await c.env.DB.prepare('DELETE FROM email_sequences WHERE contact_id = ?').bind(id).run();
  return c.json({ ok: true, success: true });
});

export default contacts;
