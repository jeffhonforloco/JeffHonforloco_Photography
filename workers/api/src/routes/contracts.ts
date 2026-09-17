import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

export const contracts = new Hono<AppEnv>();       // admin: /api/v1/admin/contracts
export const contractSign = new Hono<AppEnv>();    // public: /api/v1/contracts/sign/:token

/* ------------------------------------------------------------------ */
/* Schema (D1) — auto-created on first hit                             */
/* ------------------------------------------------------------------ */

const PAID_TEMPLATE = `PHOTOGRAPHY & VIDEOGRAPHY SERVICES AGREEMENT (PAID COMMISSION)

This Photography & Videography Services Agreement ("Agreement") is entered into as of {sign_date} ("Effective Date") by and between:

Photographer/Videographer: {photographer_name} ("Photographer")
Email: {photographer_email} | Phone: {photographer_phone}

Client: {client_name} ("Client")
Email: {client_email} | Phone: {client_phone}

RECITALS
Client wishes to engage Photographer to provide professional photography and/or videography services, and Photographer agrees to provide such services, on the terms set forth herein.

1. SERVICES
Photographer agrees to provide the following creative services ("Services"):
{services_description}
Shoot date(s): {shoot_date}
Location(s): {location}
Services include photography and, where specified, video production, including all pre-production planning, on-set direction, capture, and post-production editing.

2. FEES & PAYMENT
Total fee: {total_fee}
(a) A non-refundable deposit/retainer of {deposit_amount} is due by {deposit_due_date} to reserve the shoot date(s). The shoot date is not confirmed until the deposit is received.
(b) The remaining balance of {total_fee} less deposit is due by {balance_due_date}.
(c) No final images, video files, or deliverables of any kind will be released until the full balance is paid.
(d) Late payments accrue interest at 1.5% per month (18% per annum) on the outstanding balance.
(e) Additional services, overtime, reshoots, or revisions beyond the agreed scope will be billed at Photographer's standard rates.

3. DELIVERABLES
{deliverables}
Delivery timeline: {delivery_timeline}
(a) All deliverables are provided in Photographer's standard edited format (high-resolution JPEG for stills; H.264/H.265 for video unless otherwise agreed).
(b) RAW files, unedited footage, project files, and working files are NOT included and remain the exclusive property of Photographer.
(c) Photographer retains sole creative discretion over image selection, editing style, color grading, and final presentation.

4. COPYRIGHT OWNERSHIP — PHOTOGRAPHER RETAINS ALL RIGHTS
(a) OWNERSHIP: Under the United States Copyright Act (17 U.S.C.), the Photographer is the sole author and exclusive owner of all copyrights in every photograph, video clip, audio recording, and all other creative works produced during the Services ("Works"), including all RAW files, negatives, edits, and derivatives — whether or not delivered to Client.
(b) NO TRANSFER: No copyright, title, or ownership interest in the Works transfers to Client under this Agreement. Payment of fees grants Client only the limited license described in Section 5.
(c) NOT WORK FOR HIRE: The Services are expressly NOT a "work made for hire" under 17 U.S.C. § 101. Photographer is an independent contractor, not Client's employee.
(d) PHOTOGRAPHER'S PORTFOLIO RIGHTS: Photographer retains the irrevocable right to display, publish, and use the Works (including behind-the-scenes content) in Photographer's portfolio, website, social media, marketing materials, competitions, publications, and exhibitions, worldwide and in perpetuity.

5. LIMITED LICENSE TO CLIENT
Subject to full payment, Photographer grants Client a non-exclusive, non-transferable, non-sublicensable license to use the delivered final Works as follows:
{usage_rights}
(a) Unless otherwise specified above, the license is limited to personal, non-commercial use.
(b) Client shall NOT: sell, license, or redistribute the Works to third parties; use the Works in paid advertising or commercial campaigns; submit the Works to contests; alter, crop, filter, or edit the Works; remove watermarks or metadata; or use the Works to train AI/machine-learning models — without Photographer's prior WRITTEN consent.
(c) Any use beyond the granted license requires a separate written agreement and additional fees.

(d) THIRD-PARTY USE: Client shall not authorize, permit, or enable any third party — including but not limited to advertising agencies, brands, publications, media outlets, vendors, venues, planners, makeup artists, stylists, or any other person or entity — to use, reproduce, publish, or distribute the Works without Photographer's prior WRITTEN consent. Any third party desiring to use the Works must obtain a separate license directly from Photographer at Photographer's standard licensing rates. Client is responsible for informing all third parties of this restriction.
(e) VENDOR/SOCIAL SHARING: If Client wishes to allow vendors (e.g., venue, planner, florist) to share images on social media, Client must request Photographer's written permission identifying each vendor. Approved vendors must credit "Photo by {photographer_name}" and link to Photographer's website/social profile on every post. Vendors may not use the Works for paid advertising, print marketing, or website hero images without a separate commercial license.
(f) PUBLICATION SUBMISSIONS: Client shall not submit the Works to any publication, blog, magazine, contest, or award program without Photographer's prior WRITTEN consent. Photographer retains the exclusive right to submit the Works for publication and shall receive sole photo credit.
(g) NO AI TRAINING: Client and all third parties are expressly prohibited from using the Works to train, fine-tune, or develop artificial intelligence or machine-learning models.

6. FULL BUYOUT OPTION (COPYRIGHT TRANSFER)
Client may purchase full and exclusive ownership of the copyrights in the delivered Works ("Buyout") for an additional fee to be mutually agreed in writing. Upon (i) execution of a written Copyright Assignment and (ii) receipt of the full buyout fee, all copyrights in the specified Works transfer to Client. Until both conditions are met, Section 4 remains in full force. Buyout does not include RAW files or working files unless expressly stated.

7. MODEL RELEASE
Client (and any subjects appearing in the Works arranged by Client) grants Photographer the right to photograph/film and to use the resulting Works as described in Section 4(d). Client confirms all subjects are 18+ or that a parent/guardian has consented in writing.

8. CANCELLATION & RESCHEDULING
{cancellation_policy}
(a) If Client cancels: the deposit/retainer is forfeited. Cancellations within 72 hours of the shoot forfeit 50% of the total fee.
(b) If Photographer must cancel due to emergency, illness, or force majeure: all payments are refunded in full or the shoot is rescheduled at no additional charge, at Client's election.
(c) Rescheduling requests made 7+ days in advance incur no fee; requests within 7 days may incur a rescheduling fee of up to 25% of the total.

9. CREATIVE CONTROL
Photographer retains full creative control over all artistic decisions including but not limited to shooting style, lighting, posing direction, image selection, editing, color grading, and final delivery format.

10. LIMITATION OF LIABILITY
(a) In the unlikely event of equipment failure, data loss, or inability to deliver, Photographer's total liability shall not exceed the total fees paid by Client under this Agreement.
(b) Photographer shall not be liable for indirect, incidental, or consequential damages.
(c) Client is advised to arrange backup coverage for irreplaceable events (e.g., weddings).

11. INDEMNIFICATION
Client agrees to indemnify and hold harmless Photographer from any claims arising from Client's use of the Works beyond the granted license, or from Client's breach of this Agreement.

12. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Rhode Island, without regard to conflict-of-law principles. Any disputes shall be resolved in the state or federal courts located in Providence County, Rhode Island.

13. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations, representations, and agreements. Amendments must be in writing and signed by both parties.

By signing below, both parties acknowledge they have read, understood, and agree to all terms above.

Photographer: {photographer_name}                    Date: {sign_date}

Client: ___________________________________          Date: _______________`;

const COLLAB_TEMPLATE = `COLLABORATION AGREEMENT (TRADE FOR PORTFOLIO — TFP/TFCD)

This Collaboration Agreement ("Agreement") is entered into as of {sign_date} ("Effective Date") by and between:

Photographer/Videographer: {photographer_name} ("Photographer") — {photographer_handle}
Email: {photographer_email} | Phone: {photographer_phone}

Collaborator: {collaborator_name} ("Collaborator") — {collaborator_handle}
Email: {collaborator_email} | Phone: {collaborator_phone}

RECITALS
The parties wish to collaborate on a creative photography/videography project on a trade-for-portfolio basis. No monetary compensation shall be exchanged.

1. NATURE OF COLLABORATION
This is a trade-for-portfolio (TFP/TFCD) collaboration. No money changes hands. Each party contributes their time, talent, and creative resources to produce content for mutual portfolio use, subject to the ownership terms in Section 3.
Shoot date(s): {shoot_date}
Location(s): {location}
Concept/Creative Direction: {services_description}

2. DELIVERABLES
{deliverables}
Delivery timeline: {delivery_timeline}
(a) Photographer will deliver retouched final images and/or edited video in Photographer's standard format.
(b) RAW files, unedited footage, and working files are NOT included and remain Photographer's exclusive property.
(c) Photographer has sole discretion over selection and editing of all deliverables.

3. COPYRIGHT OWNERSHIP — PHOTOGRAPHER OWNS ALL RIGHTS
(a) SOLE OWNERSHIP: Under the United States Copyright Act (17 U.S.C.), the Photographer is the sole author and exclusive owner of all copyrights in every photograph, video clip, audio recording, and all other creative works produced during this collaboration ("Works") — including all RAW files, outtakes, behind-the-scenes content, edits, and derivatives.
(b) NO TRANSFER: No copyright or ownership interest transfers to Collaborator under any circumstances pursuant to this Agreement.
(c) NOT WORK FOR HIRE: This collaboration is expressly NOT a "work made for hire." Photographer is an independent creator, not Collaborator's employee or agent.
(d) PHOTOGRAPHER'S UNRESTRICTED USE: Photographer may use, publish, license, sell, and exploit the Works in any manner whatsoever — including commercial licensing, advertising, stock, publications, and exhibitions — worldwide, in perpetuity, without notice, consent, or compensation to Collaborator.

4. LIMITED LICENSE TO COLLABORATOR
Photographer grants Collaborator a non-exclusive, non-transferable, revocable license to use the delivered final Works SOLELY for:
  • Personal portfolio (print and digital)
  • Personal website and social media profiles
Collaborator shall:
(a) Credit Photographer on every use: "Photo/Video by {photographer_handle}".
(b) NOT use the Works for any commercial, advertising, or paid promotional purpose.
(c) NOT sell, license, or redistribute the Works to any third party (including agencies, brands, or publications).
(d) NOT alter, crop, filter, re-edit, or remove watermarks/metadata from the Works.
(e) NOT submit the Works to contests or publications without Photographer's prior WRITTEN consent.
(f) NOT use the Works to train AI/machine-learning models.
Any commercial use requires a separate written license and payment of Photographer's standard commercial rates. Violation of this Section terminates the license immediately.

(g) THIRD-PARTY RESTRICTIONS: Collaborator shall not authorize any third party — including agencies, brands, magazines, or publications — to use the Works. Any agency or brand wishing to use images of Collaborator from this shoot must license them directly from Photographer. Collaborator shall direct all third-party inquiries to Photographer.

5. MODEL RELEASE
Collaborator irrevocably grants Photographer (and Photographer's licensees, successors, and assigns) the right to photograph/film Collaborator and to use the Collaborator's name, likeness, image, and voice in the Works for any lawful purpose described in Section 3(d), worldwide and in perpetuity, without further consent or compensation. Collaborator confirms they are 18 years of age or older (or a parent/guardian co-signs below). Collaborator waives any right to inspect or approve the finished Works.

6. NO COMMERCIAL OBLIGATION
Neither party is obligated to secure paid work for the other as a result of this collaboration.

7. CANCELLATION
If either party must cancel, they shall notify the other at least 48 hours before the shoot. Two or more late cancellations or no-shows by Collaborator void any obligation to deliver images.

8. IMAGE/VIDEO SELECTION & EDITING
Photographer retains absolute final authority over all creative decisions including image/video selection, editing style, color grading, and retouching.

9. INDEMNIFICATION
Collaborator agrees to indemnify Photographer against claims arising from Collaborator's breach of this Agreement or misuse of the Works.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Rhode Island. Disputes shall be resolved in Providence County, Rhode Island.

11. ENTIRE AGREEMENT
This Agreement is the entire understanding between the parties. Amendments must be in writing and signed by both parties.

By signing below, both parties acknowledge they have read, understood, and agree to all terms above — including Photographer's sole ownership of all copyrights.

Photographer: {photographer_name}                    Date: {sign_date}

Collaborator: ________________________________       Date: _______________

Parent/Guardian (if Collaborator under 18): _____    Date: _______________`;

export async function ensureContractSchema(db: D1Database) {
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
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS contract_templates (
      type TEXT PRIMARY KEY,
      body_text TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
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

async function twilioSendSms(accountSid: string, authToken: string, from: string, to: string, body: string): Promise<string> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = btoa(`${accountSid}:${authToken}`);
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${credentials}` },
    body: params.toString(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Twilio ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json().catch(() => ({}))) as { sid?: string };
  return data.sid || '';
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

contracts.use('*', async (c, next) => { await ensureContractSchema(c.env.DB); return next(); });

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
    id: number; type: string; title: string; client_name: string; client_email: string; client_phone: string | null; status: string;
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

  // Sign links must always point at the public site, never the caller's origin:
  // an admin-domain link forces clients onto the admin login page.
  const signUrl = `https://jeffhonforlocophotos.com/sign/${token}`;
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
  let smsSent = false;
  let smsError: string | null = null;
  const twilioSid = (c.env as Record<string, string | undefined>).TWILIO_ACCOUNT_SID;
  const twilioToken = (c.env as Record<string, string | undefined>).TWILIO_AUTH_TOKEN;
  const twilioFrom = (c.env as Record<string, string | undefined>).TWILIO_FROM_NUMBER;
  if (twilioSid && twilioToken && twilioFrom && row.client_phone) {
    try {
      const smsBody =
        `Hi ${row.client_name}, Jeff Honforloco Photography sent you a ${row.type === 'paid' ? 'photography services agreement' : 'collaboration agreement'}${row.title ? ` — ${row.title}` : ''} to review and sign: ${signUrl} (expires in 30 days)`;
      await twilioSendSms(twilioSid, twilioToken, twilioFrom, row.client_phone, smsBody);
      smsSent = true;
    } catch (e) {
      smsError = e instanceof Error ? e.message : 'sms send failed';
    }
  }
  let whatsappSent = false;
  let whatsappError: string | null = null;
  if (twilioSid && twilioToken && twilioFrom && row.client_phone) {
    try {
      const waBody =
        `Hi ${row.client_name}, Jeff Honforloco Photography sent you a ${row.type === 'paid' ? 'photography services agreement' : 'collaboration agreement'}${row.title ? ` — ${row.title}` : ''} to review and sign: ${signUrl} (expires in 30 days)`;
      const whatsappFrom = (c.env as Record<string, string | undefined>).TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      await twilioSendSms(twilioSid, twilioToken, whatsappFrom, `whatsapp:${row.client_phone}`, waBody);
      whatsappSent = true;
    } catch (e) {
      whatsappError = e instanceof Error ? e.message : 'whatsapp send failed';
    }
  }
  return c.json({ success: true, data: { token, signUrl, emailed, emailError, needsResend: !c.env.RESEND_API_KEY, smsSent, smsError, smsConfigured: !!(twilioSid && twilioToken && twilioFrom), whatsappSent, whatsappError } });
});

/* ------------------------------------------------------------------ */
/* Public signing routes (token-gated, no login)                       */
/* ------------------------------------------------------------------ */

contractSign.use('*', async (c, next) => { await ensureContractSchema(c.env.DB); return next(); });

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
