import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

export const contracts = new Hono<AppEnv>();       // admin: /api/v1/admin/contracts
export const contractSign = new Hono<AppEnv>();    // public: /api/v1/contracts/sign/:token

/* ------------------------------------------------------------------ */
/* Schema (D1) — auto-created on first hit                             */
/* ------------------------------------------------------------------ */

const PAID_TEMPLATE = `PHOTOGRAPHY SERVICES AGREEMENT (PAID GIG)

This Photography Services Agreement ("Agreement") is entered into as of {sign_date} by and between:

Photographer: {photographer_name} ("Photographer")
Email: {photographer_email} | Phone: {photographer_phone}

Client: {client_name} ("Client")
Email: {client_email} | Phone: {client_phone}

1. SERVICES
Photographer agrees to provide the following photography services:
{services_description}
Shoot date: {shoot_date}
Location: {location}

2. FEES & PAYMENT
Total fee: {total_fee}
Deposit of {deposit_amount} is due by {deposit_due_date} to reserve the shoot date. The deposit is non-refundable and applied toward the total fee.
Remaining balance is due by {balance_due_date}. No final images will be delivered until the balance is paid in full.
Late payments accrue a fee of 5% per month on the outstanding balance.

3. DELIVERABLES
{deliverables}
Delivery timeline: {delivery_timeline}

4. USAGE RIGHTS
{usage_rights}

5. CANCELLATION & RESCHEDULING
{cancellation_policy}
If the Client cancels, the deposit is forfeited. If the Photographer must cancel due to emergency, all payments will be refunded or the shoot rescheduled at no extra charge.

6. CREATIVE CONTROL
The Photographer retains creative control over the style, editing, and selection of final images.

7. LIMITATION OF LIABILITY
In the unlikely event of equipment failure, loss, or damage to images, the Photographer's liability is limited to a refund of fees paid.

8. ENTIRE AGREEMENT
This Agreement is the entire understanding between the parties and supersedes all prior discussions.

By signing below, both parties agree to these terms.

Photographer: {photographer_name}            Date: {sign_date}

Client: ___________________________________  Date: _______________`;

const COLLAB_TEMPLATE = `COLLABORATION (TFP) AGREEMENT

This Collaboration Agreement ("Agreement") is entered into as of {sign_date} by and between:

Photographer: {photographer_name} ("Photographer") — {photographer_handle}
Email: {photographer_email} | Phone: {photographer_phone}

Collaborator: {collaborator_name} ("Collaborator") — {collaborator_handle}
Email: {collaborator_email} | Phone: {collaborator_phone}

1. NATURE OF COLLABORATION
This is a trade-for-portfolio (TFP) collaboration. No money changes hands. Both parties contribute their time, talent, and creative input to produce images for mutual portfolio use.
Shoot date: {shoot_date}
Location: {location}
Concept: {services_description}

2. DELIVERABLES
{deliverables}
Delivery timeline: {delivery_timeline}

3. USAGE RIGHTS (BOTH PARTIES)
Both the Photographer and the Collaborator may use the final delivered images for portfolio, website, and social media purposes, provided the other party is credited.
Credit requirement: when posting, tag {photographer_handle}.
Neither party may use the images for paid commercial/advertising purposes without the prior WRITTEN permission of the other party.

4. MODEL RELEASE
The Collaborator agrees to be photographed and grants the Photographer the right to use the images as described in Section 3. The Collaborator confirms they are 18 years of age or older (or a parent/guardian co-signs below).

5. CANCELLATION
If either party must cancel, they will notify the other at least 48 hours before the shoot. Repeated no-shows void any obligation to deliver images.

6. IMAGE SELECTION & EDITING
The Photographer retains final say on image selection and editing style.

7. ENTIRE AGREEMENT
This Agreement is the entire understanding between the parties.

By signing below, both parties agree to these terms.

Photographer: {photographer_name}            Date: {sign_date}

Collaborator: ______________________________  Date: _______________

Parent/Guardian (if under 18): ______________  Date: _______________`;

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'paid',
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      token TEXT UNIQUE,
      token_expires_at TEXT,
      body_text TEXT NOT NULL,
      data_json TEXT NOT NULL DEFAULT '{}',
      signer_name TEXT,
      signed_at TEXT,
      signer_ip TEXT,
      signer_ua TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    `),
    db.prepare(`CREATE TABLE IF NOT EXISTS contract_templates (
      type TEXT PRIMARY KEY,
      body_text TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    `),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_contracts_token ON contracts(token)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status, type)`),
  ]);
  // Seed default templates
  const n = await db.prepare(`SELECT COUNT(*) AS n FROM contract_templates`).first<{ n: number }>();
  if (!n || n.n === 0) {
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO contract_templates (type, body_text) VALUES ('paid', ?)`).bind(PAID_TEMPLATE),
      db.prepare(`INSERT OR IGNORE INTO contract_templates (type, body_text) VALUES ('collab', ?)`).bind(COLLAB_TEMPLATE),
    ]);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FROM = 'Jeff Honforloco Photography <info@jeffhonforlocophotos.com>';
const JEFF_EMAIL = 'info@jeffhonforlocophotos.com';

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

function makeToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

/** Replace {placeholders} in template with values from data. Unknown keys stay as-is. */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{([a-z_]+)\}/g, (m, key: string) => {
    const v = data[key];
    if (v === undefined || v === null || v === '') return m;
    return String(v);
  });
}

function defaultData(type: string): Record<string, unknown> {
  const base = {
    photographer_name: 'Jeff Honforloco',
    photographer_email: JEFF_EMAIL,
    photographer_phone: '+1-646-379-4237',
    photographer_handle: '@jeffhonforlocophotos',
    sign_date: new Date().toISOString().slice(0, 10),
    client_name: '', client_email: '', client_phone: '',
    collaborator_name: '', collaborator_handle: '', collaborator_email: '', collaborator_phone: '',
    shoot_date: '', location: '', services_description: '',
    deliverables: '', delivery_timeline: '2–3 weeks after the shoot',
    usage_rights: '', cancellation_policy: '',
    total_fee: '', deposit_amount: '', deposit_due_date: '', balance_due_date: '',
  };
  if (type === 'paid') {
    return {
      ...base,
      usage_rights: 'The Client is granted a non-exclusive license to use the final delivered images for personal and portfolio purposes. Commercial use requires a separate written license.',
      cancellation_policy: 'The Client may reschedule once with at least 72 hours notice at no charge. Cancellations within 72 hours of the shoot forfeit the deposit.',
    };
  }
  return {
    ...base,
    deliverables: '10 retouched high-resolution images delivered to each party via online gallery.',
  };
}

function clientIp(c: { req: { header: (n: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') || (c.req.header('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

/* ------------------------------------------------------------------ */
/* Admin routes                                                        */
/* ------------------------------------------------------------------ */

contracts.use('*', async (c, next) => { await ensureSchema(c.env.DB); return next(); });

// List contracts
contracts.get('/', requireAuth, requireAdmin, async (c) => {
  const { type, status, q } = c.req.query();
  let sql = `SELECT id, type, title, client_name, client_email, status, token, token_expires_at, signer_name, signed_at, sent_at, created_at FROM contracts WHERE 1=1`;
  const params: unknown[] = [];
  if (type === 'paid' || type === 'collab') { sql += ` AND type = ?`; params.push(type); }
  if (status) { sql += ` AND status = ?`; params.push(status); }
  if (q) { sql += ` AND (client_name LIKE ? OR client_email LIKE ? OR title LIKE ?)`; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ` ORDER BY created_at DESC LIMIT 200`;
  const rows = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({ success: true, data: rows.results || [] });
});

// Get templates
contracts.get('/templates', requireAuth, requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare(`SELECT type, body_text, updated_at FROM contract_templates`).all();
  return c.json({ success: true, data: rows.results || [] });
});

// Update a template
contracts.put('/templates/:type', requireAuth, requireAdmin, async (c) => {
  const type = c.req.param('type');
  if (type !== 'paid' && type !== 'collab') return c.json({ success: false, error: 'Invalid template type' }, 400);
  const body = await c.req.json().catch(() => ({})) as { body_text?: string };
  if (!body.body_text || body.body_text.length < 50) {
    return c.json({ success: false, error: 'Template text is too short' }, 400);
  }
  await c.env.DB.prepare(
    `UPDATE contract_templates SET body_text = ?, updated_at = datetime('now') WHERE type = ?`
  ).bind(body.body_text, type).run();
  return c.json({ success: true });
});

// Create contract (renders body_text from template + supplied fields)
contracts.post('/', requireAuth, requireAdmin, async (c) => {
  const b = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const type = b.type === 'collab' ? 'collab' : 'paid';
  const tpl = await c.env.DB.prepare(`SELECT body_text FROM contract_templates WHERE type = ?`).bind(type).first<{ body_text: string }>();
  const data = { ...defaultData(type), ...(b.data || {}) } as Record<string, unknown>;
  // Convenience top-level fields
  const clientName = String(b.client_name || data.client_name || data.collaborator_name || '').trim();
  const clientEmail = String(b.client_email || data.client_email || data.collaborator_email || '').trim();
  const clientPhone = String(b.client_phone || data.client_phone || data.collaborator_phone || '');
  if (!clientName) return c.json({ success: false, error: 'Client / collaborator name is required' }, 400);
  if (!clientEmail) return c.json({ success: false, error: 'Client / collaborator email is required' }, 400);
  data.client_name = clientName; data.client_email = clientEmail; data.client_phone = clientPhone;
  if (type === 'collab' && !data.collaborator_name) {
    data.collaborator_name = clientName; data.collaborator_email = clientEmail; data.collaborator_phone = clientPhone;
  }
  const bodyText = renderTemplate(tpl?.body_text || (type === 'paid' ? PAID_TEMPLATE : COLLAB_TEMPLATE), data);
  const title = String(b.title || '').trim() || `${type === 'paid' ? 'Paid shoot' : 'Collaboration'} — ${clientName}`;
  const r = await c.env.DB.prepare(
    `INSERT INTO contracts (type, title, client_name, client_email, client_phone, status, body_text, data_json)
     VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`
  ).bind(type, title, clientName, clientEmail, clientPhone || null, bodyText, JSON.stringify(data)).run();
  const id = Number(r.meta.last_row_id);
  return c.json({ success: true, data: { id } });
});

// Get one contract (admin — full)
contracts.get('/:id', requireAuth, requireAdmin, async (c) => {
  const row = await c.env.DB.prepare(`SELECT * FROM contracts WHERE id = ?`).bind(c.req.param('id')).first();
  if (!row) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data: row });
});

// Update contract (draft/sent only — never after signing)
contracts.put('/:id', requireAuth, requireAdmin, async (c) => {
  const existing = await c.env.DB.prepare(`SELECT id, status FROM contracts WHERE id = ?`).bind(c.req.param('id')).first<{ id: number; status: string }>();
  if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
  if (existing.status === 'signed' || existing.status === 'completed') {
    return c.json({ success: false, error: 'Signed contracts are locked and cannot be edited' }, 400);
  }
  const b = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const sets: string[] = [];
  const params: unknown[] = [];
  if (typeof b.title === 'string') { sets.push('title = ?'); params.push(b.title); }
  if (typeof b.body_text === 'string') { sets.push('body_text = ?'); params.push(b.body_text); }
  if (typeof b.status === 'string' && ['draft', 'sent', 'completed'].includes(b.status)) { sets.push('status = ?'); params.push(b.status); }
  if (b.data && typeof b.data === 'object') {
    const d = b.data as Record<string, unknown>;
    sets.push('data_json = ?'); params.push(JSON.stringify(d));
    if (typeof d.client_name === 'string') { sets.push('client_name = ?'); params.push(d.client_name); }
    if (typeof d.client_email === 'string') { sets.push('client_email = ?'); params.push(d.client_email); }
  }
  if (!sets.length) return c.json({ success: false, error: 'Nothing to update' }, 400);
  sets.push(`updated_at = datetime('now')`);
  await c.env.DB.prepare(`UPDATE contracts SET ${sets.join(', ')} WHERE id = ?`).bind(...params, c.req.param('id')).run();
  return c.json({ success: true });
});

// Delete contract (not signed)
contracts.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const existing = await c.env.DB.prepare(`SELECT status FROM contracts WHERE id = ?`).bind(c.req.param('id')).first<{ status: string }>();
  if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
  if (existing.status === 'signed' || existing.status === 'completed') {
    return c.json({ success: false, error: 'Signed contracts cannot be deleted' }, 400);
  }
  await c.env.DB.prepare(`DELETE FROM contracts WHERE id = ?`).bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// Send contract → generate token, email the signing link (or return link to copy)
contracts.post('/:id/send', requireAuth, requireAdmin, async (c) => {
  const row = await c.env.DB.prepare(`SELECT * FROM contracts WHERE id = ?`).bind(c.req.param('id')).first<{
    id: number; type: string; title: string; client_name: string; client_email: string; status: string;
  }>();
  if (!row) return c.json({ success: false, error: 'Not found' }, 404);
  if (row.status === 'signed' || row.status === 'completed') {
    return c.json({ success: false, error: 'Contract is already signed' }, 400);
  }
  const token = makeToken();
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  await c.env.DB.prepare(
    `UPDATE contracts SET token = ?, token_expires_at = ?, status = 'sent', sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  ).bind(token, expires, row.id).run();

  const origin = c.req.header('origin') || 'https://jeffhonforlocophotos.com';
  const signUrl = `${origin}/sign/${token}`;
  let emailed = false;
  let emailError: string | null = null;
  if (c.env.RESEND_API_KEY) {
    try {
      const html =
        `<p>Hi ${escapeHtml(row.client_name)},</p>` +
        `<p>Jeff Honforloco Photography has prepared your ${row.type === 'paid' ? 'photography services agreement' : 'collaboration agreement'}${row.title ? ` — <strong>${escapeHtml(row.title)}</strong>` : ''}.</p>` +
        `<p>Please review and sign it here:</p>` +
        `<p><a href="${signUrl}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;">Review &amp; Sign Contract</a></p>` +
        `<p style="color:#64748b;font-size:13px;">Or copy this link: ${escapeHtml(signUrl)}<br/>This link expires in 30 days.</p>`;
      await resendSend(c.env.RESEND_API_KEY, row.client_email, `Contract to sign — Jeff Honforloco Photography`, html);
      emailed = true;
    } catch (e) {
      emailError = e instanceof Error ? e.message : 'send failed';
    }
  }
  return c.json({ success: true, data: { token, signUrl, emailed, emailError, needsResend: !c.env.RESEND_API_KEY } });
});

/* ------------------------------------------------------------------ */
/* Public signing routes (token-gated, no login)                       */
/* ------------------------------------------------------------------ */

contractSign.use('*', async (c, next) => { await ensureSchema(c.env.DB); return next(); });

async function findByToken(db: D1Database, token: string) {
  return db.prepare(`SELECT id, type, title, client_name, status, body_text, token_expires_at, signer_name, signed_at FROM contracts WHERE token = ?`).bind(token).first<{
    id: number; type: string; title: string; client_name: string; status: string; body_text: string;
    token_expires_at: string | null; signer_name: string | null; signed_at: string | null;
  }>();
}

function tokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt.replace(' ', 'T') + 'Z').getTime() < Date.now();
}

// Fetch contract for signing
contractSign.get('/sign/:token', async (c) => {
  const row = await findByToken(c.env.DB, c.req.param('token'));
  if (!row) return c.json({ success: false, error: 'This signing link is invalid.' }, 404);
  if (tokenExpired(row.token_expires_at)) return c.json({ success: false, error: 'This signing link has expired.', expired: true }, 410);
  return c.json({
    success: true,
    data: {
      type: row.type, title: row.title, client_name: row.client_name,
      body_text: row.body_text, status: row.status,
      signer_name: row.signer_name, signed_at: row.signed_at,
      alreadySigned: row.status === 'signed' || row.status === 'completed',
    },
  });
});

// Submit signature
contractSign.post('/sign/:token', async (c) => {
  const row = await findByToken(c.env.DB, c.req.param('token'));
  if (!row) return c.json({ success: false, error: 'This signing link is invalid.' }, 404);
  if (tokenExpired(row.token_expires_at)) return c.json({ success: false, error: 'This signing link has expired.', expired: true }, 410);
  if (row.status === 'signed' || row.status === 'completed') {
    return c.json({ success: false, error: 'This contract has already been signed.' }, 400);
  }
  const b = await c.req.json().catch(() => ({})) as { signer_name?: string; agree?: boolean };
  const signerName = String(b.signer_name || '').trim();
  if (!signerName) return c.json({ success: false, error: 'Please type your full name to sign.' }, 400);
  if (b.agree !== true) return c.json({ success: false, error: 'You must check "I agree" to sign.' }, 400);

  const ip = clientIp(c);
  const ua = (c.req.header('user-agent') || '').slice(0, 300);
  await c.env.DB.prepare(
    `UPDATE contracts SET status = 'signed', signer_name = ?, signed_at = datetime('now'), signer_ip = ?, signer_ua = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(signerName, ip, ua, row.id).run();

  // Notify Jeff (fire-and-forget — never fail the signing)
  if (c.env.RESEND_API_KEY) {
    const full = await c.env.DB.prepare(`SELECT client_email, title, type FROM contracts WHERE id = ?`).bind(row.id).first<{ client_email: string; title: string; type: string }>();
    c.executionCtx.waitUntil((async () => {
      try {
        await resendSend(
          c.env.RESEND_API_KEY,
          JEFF_EMAIL,
          `Contract signed — ${full?.title || row.title}`,
          `<p><strong>${escapeHtml(signerName)}</strong> just signed the ${full?.type === 'collab' ? 'collaboration' : 'paid gig'} contract <strong>${escapeHtml(full?.title || row.title)}</strong>.</p>` +
          `<p>Client: ${escapeHtml(row.client_name)} (${escapeHtml(full?.client_email || '')})</p>` +
          `<p>Signed at: ${new Date().toISOString()}</p>`
        );
      } catch { /* notification is best-effort */ }
    })());
  }
  return c.json({ success: true, data: { signer_name: signerName } });
});
