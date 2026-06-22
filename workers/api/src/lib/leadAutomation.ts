import type { Env } from '../types';
import { escapeHtml, sendEmail } from './email';

export const LEAD_PIPELINE_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'quote_sent',
  'deposit_paid',
  'booked',
  'lost',
  'completed',
  'closed',
] as const;

export const PAUSE_FOLLOWUP_STATUSES = new Set(['deposit_paid', 'booked', 'lost', 'completed', 'closed']);

const DEFAULT_BUSINESS_ADDRESS = 'Jeff Honforloco Photography, Providence, RI';
const SITE_BASE_URL = 'https://jeffhonforlocophotos.com';

const DEFAULT_EMAIL_TEMPLATES = [
  {
    name: 'inquiry_next_steps',
    subject: 'Next steps for your photography session',
    content: `
      <h2>Hi {{first_name}}, your request is in.</h2>
      <p>Thanks for reaching out about {{service_type}}. Jeff reviews each inquiry personally so the session fits your goals, timeline, and location.</p>
      <p>The next move is simple: reply with anything you want Jeff to know, or continue the booking flow here:</p>
      <p><a href="{{booking_url}}" style="background:#dc2626;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;">Continue booking</a></p>
    `,
  },
  {
    name: 'inquiry_followup_24h',
    subject: 'Should Jeff hold a spot for you?',
    content: `
      <h2>Still thinking through the session?</h2>
      <p>Hi {{first_name}}, Jeff's calendar can move quickly, especially for weekends and brand shoots. If you already have a rough date, location, or package in mind, reply here and Jeff can help narrow it down.</p>
      <p><a href="{{booking_url}}" style="color:#dc2626;">Pick a session package</a></p>
    `,
  },
  {
    name: 'inquiry_social_proof',
    subject: 'A few Jeff Honforloco sessions to review',
    content: `
      <h2>Here is a quick portfolio shortcut.</h2>
      <p>Hi {{first_name}}, if you are still choosing the direction for {{service_type}}, browse Jeff's latest work and save any images that feel close to your vision.</p>
      <p><a href="{{portfolio_url}}" style="color:#dc2626;">View the portfolio</a></p>
    `,
  },
  {
    name: 'inquiry_final_checkin',
    subject: 'Final check-in on your photography inquiry',
    content: `
      <h2>Want Jeff to keep this inquiry open?</h2>
      <p>Hi {{first_name}}, quick final check-in. If you still want help planning {{service_type}}, reply with your preferred date, city, and the look you want to create.</p>
      <p>You can also restart here: <a href="{{booking_url}}" style="color:#dc2626;">book a consultation</a>.</p>
    `,
  },
];

type SequenceRow = {
  id: number;
  contact_id: number;
  sequence_type: string;
  step_number: number;
  email_template: string;
  full_name: string;
  email: string;
  service_type?: string | null;
  budget_range?: string | null;
  event_date?: string | null;
  location?: string | null;
  subject?: string | null;
  content?: string | null;
};

let schemaReady = false;

function toSqlDate(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

function addMs(ms: number): string {
  return toSqlDate(new Date(Date.now() + ms));
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'there';
}

function apiBaseUrl(env: Env): string {
  const configured = env.PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;
  return `${SITE_BASE_URL}/api/v1`;
}

function unsubscribeUrl(env: Env, email: string): string {
  return `${apiBaseUrl(env)}/email/unsubscribe?email=${encodeURIComponent(email)}`;
}

function businessAddress(env: Env): string {
  return env.BUSINESS_POSTAL_ADDRESS || DEFAULT_BUSINESS_ADDRESS;
}

function renderTemplate(input: string, row: SequenceRow, env: Env): string {
  const values: Record<string, string> = {
    name: row.full_name || 'there',
    first_name: firstName(row.full_name || ''),
    email: row.email,
    service_type: row.service_type || 'your session',
    budget_range: row.budget_range || 'not specified yet',
    event_date: row.event_date || 'not selected yet',
    location: row.location || 'not selected yet',
    booking_url: `${SITE_BASE_URL}/book`,
    portfolio_url: `${SITE_BASE_URL}/portfolio`,
    pricing_url: `${SITE_BASE_URL}/pricing`,
    contact_url: `${SITE_BASE_URL}/contact`,
    unsubscribe_url: unsubscribeUrl(env, row.email),
    business_address: businessAddress(env),
  };

  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = values[key] ?? '';
    return escapeHtml(value);
  });
}

function wrapMarketingEmail(html: string, row: SequenceRow, env: Env): string {
  const footer = `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
    <p style="font-size:12px;color:#6b7280;line-height:1.6;">
      Jeff Honforloco Photography<br>
      ${escapeHtml(businessAddress(env))}<br>
      You are receiving this because you requested information about a photography session.
      <a href="${escapeHtml(unsubscribeUrl(env, row.email))}" style="color:#dc2626;">Unsubscribe</a>
    </p>
  `;

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111;line-height:1.6;">
      ${html}
      ${footer}
    </div>
  `;
}

export async function ensureLeadAutomationSchema(env: Env): Promise<void> {
  if (schemaReady) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL,
      sequence_type TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      email_template TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      sent_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(contact_id, sequence_type, step_number)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_email_sequences_due ON email_sequences (status, scheduled_for)`,
    `CREATE INDEX IF NOT EXISTS idx_email_sequences_contact ON email_sequences (contact_id)`,
    `CREATE TABLE IF NOT EXISTS email_suppression (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_email_suppression_email ON email_suppression (email)`,
  ];

  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }

  for (const template of DEFAULT_EMAIL_TEMPLATES) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO email_templates (name, subject, content, is_active)
       VALUES (?, ?, ?, 1)`
    ).bind(template.name, template.subject, template.content.trim()).run();
  }

  schemaReady = true;
}

export async function suppressEmail(env: Env, email: string, reason = 'unsubscribe'): Promise<void> {
  await ensureLeadAutomationSchema(env);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO email_suppression (email, reason) VALUES (?, ?)`
  ).bind(email.toLowerCase(), reason).run();
  await env.DB.prepare(
    `UPDATE email_sequences
     SET status = 'cancelled', updated_at = datetime('now')
     WHERE status = 'pending'
       AND contact_id IN (SELECT id FROM contacts WHERE lower(email) = ?)`
  ).bind(email.toLowerCase()).run();
}

export async function scheduleLeadFollowups(env: Env, contactId: number): Promise<void> {
  await ensureLeadAutomationSchema(env);

  const contact = await env.DB.prepare(
    `SELECT id, email, status FROM contacts WHERE id = ?`
  ).bind(contactId).first<{ id: number; email: string; status: string }>();
  if (!contact || PAUSE_FOLLOWUP_STATUSES.has(contact.status)) return;

  const suppressed = await env.DB.prepare(
    `SELECT id FROM email_suppression WHERE lower(email) = ?`
  ).bind(contact.email.toLowerCase()).first();
  if (suppressed) return;

  const sequence = [
    ['lead_nurture', 1, 'inquiry_next_steps', addMs(15 * 60 * 1000)],
    ['lead_nurture', 2, 'inquiry_followup_24h', addMs(24 * 60 * 60 * 1000)],
    ['lead_nurture', 3, 'inquiry_social_proof', addMs(3 * 24 * 60 * 60 * 1000)],
    ['lead_nurture', 4, 'inquiry_final_checkin', addMs(7 * 24 * 60 * 60 * 1000)],
  ] as const;

  for (const [sequenceType, stepNumber, templateName, scheduledFor] of sequence) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO email_sequences
       (contact_id, sequence_type, step_number, email_template, scheduled_for, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    ).bind(contactId, sequenceType, stepNumber, templateName, scheduledFor).run();
  }
}

export async function cancelPendingFollowups(env: Env, contactId: number): Promise<void> {
  await ensureLeadAutomationSchema(env);
  await env.DB.prepare(
    `UPDATE email_sequences
     SET status = 'cancelled', updated_at = datetime('now')
     WHERE contact_id = ? AND status = 'pending'`
  ).bind(contactId).run();
}

export async function processDueEmailSequences(env: Env, limit = 25): Promise<{ sent: number; failed: number; cancelled: number }> {
  await ensureLeadAutomationSchema(env);

  const due = await env.DB.prepare(
    `SELECT
       s.id, s.contact_id, s.sequence_type, s.step_number, s.email_template,
       c.full_name, c.email, c.service_type, c.budget_range, c.event_date, c.location,
       t.subject, t.content
     FROM email_sequences s
     JOIN contacts c ON c.id = s.contact_id
     LEFT JOIN email_templates t ON t.name = s.email_template AND t.is_active = 1
     LEFT JOIN email_suppression x ON lower(x.email) = lower(c.email)
     WHERE s.status = 'pending'
       AND s.scheduled_for <= datetime('now')
       AND x.email IS NULL
     ORDER BY s.scheduled_for ASC
     LIMIT ?`
  ).bind(limit).all<SequenceRow>();

  let sent = 0;
  let failed = 0;
  let cancelled = 0;

  for (const row of due.results ?? []) {
    const contact = await env.DB.prepare(
      `SELECT status FROM contacts WHERE id = ?`
    ).bind(row.contact_id).first<{ status: string }>();
    if (!contact || PAUSE_FOLLOWUP_STATUSES.has(contact.status)) {
      await env.DB.prepare(
        `UPDATE email_sequences
         SET status = 'cancelled', updated_at = datetime('now')
         WHERE id = ?`
      ).bind(row.id).run();
      cancelled += 1;
      continue;
    }

    if (!row.subject || !row.content) {
      await env.DB.prepare(
        `UPDATE email_sequences
         SET status = 'failed', last_error = 'template_not_found_or_inactive', updated_at = datetime('now')
         WHERE id = ?`
      ).bind(row.id).run();
      failed += 1;
      continue;
    }

    const subject = renderTemplate(row.subject, row, env);
    const html = wrapMarketingEmail(renderTemplate(row.content, row, env), row, env);
    const ok = await sendEmail(env.RESEND_API_KEY, { to: row.email, subject, html });

    await env.DB.prepare(
      `UPDATE email_sequences
       SET status = ?, sent_at = CASE WHEN ? THEN datetime('now') ELSE sent_at END,
           last_error = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(ok ? 'sent' : 'failed', ok ? 1 : 0, ok ? null : 'resend_send_failed', row.id).run();

    if (ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed, cancelled };
}
