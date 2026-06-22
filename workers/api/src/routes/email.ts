import { Hono } from 'hono';
import { sendEmail, contactNotificationHtml, contactConfirmationHtml, newsletterWelcomeHtml, escapeHtml } from '../lib/email';
import { scheduleLeadFollowups, suppressEmail } from '../lib/leadAutomation';
import type { AppEnv } from '../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const email = new Hono<AppEnv>();

// POST /api/v1/email/contact — contact / booking inquiry
email.post('/contact', async (c) => {
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

  // Save to contacts table
  let contactId: number | null = null;
  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO contacts (full_name, email, phone, message, service_type, budget_range, event_date, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(body.full_name, body.email, body.phone ?? null, body.message,
           body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null, body.location ?? null).run();
    contactId = Number(result.meta.last_row_id);
  } catch (err) {
    console.error('[email/contact] DB insert failed:', err);
    return c.json({ error: 'Failed to save inquiry' }, 500);
  }

  if (contactId) {
    try {
      await scheduleLeadFollowups(c.env, contactId);
    } catch (err) {
      console.error('[email/contact] Follow-up scheduling failed:', err);
    }
  }

  // Send both emails concurrently
  const adminEmail = c.env.ADMIN_EMAIL || 'info@jeffhonforlocophotos.com';
  await Promise.allSettled([
    sendEmail(c.env.RESEND_API_KEY, {
      to: adminEmail,
      subject: `New Inquiry from ${body.full_name}`,
      html: contactNotificationHtml(body),
      replyTo: body.email,
    }),
    sendEmail(c.env.RESEND_API_KEY, {
      to: body.email,
      subject: 'We received your request — Jeff Honforloco Photography',
      html: contactConfirmationHtml({
        name: body.full_name,
        service_type: body.service_type,
        event_date: body.event_date,
        location: body.location,
        budget_range: body.budget_range,
      }),
    }),
  ]);

  return c.json({ success: true });
});

// GET /api/v1/email/unsubscribe — public one-click suppression link
email.get('/unsubscribe', async (c) => {
  const emailAddr = (c.req.query('email') ?? '').trim().toLowerCase();

  if (!EMAIL_RE.test(emailAddr)) {
    return c.html(`
      <main style="font-family:Arial,sans-serif;max-width:560px;margin:48px auto;padding:24px;line-height:1.6;">
        <h1>We could not unsubscribe that address</h1>
        <p>The unsubscribe link is missing a valid email address. Please email info@jeffhonforlocophotos.com and Jeff will remove it manually.</p>
      </main>
    `, 400);
  }

  await suppressEmail(c.env, emailAddr);

  return c.html(`
    <main style="font-family:Arial,sans-serif;max-width:560px;margin:48px auto;padding:24px;line-height:1.6;">
      <h1>You are unsubscribed</h1>
      <p>${escapeHtml(emailAddr)} will no longer receive automated follow-up emails from Jeff Honforloco Photography.</p>
      <p>You can still reach Jeff directly at <a href="mailto:info@jeffhonforlocophotos.com">info@jeffhonforlocophotos.com</a>.</p>
    </main>
  `);
});

// POST /api/v1/email/unsubscribe — public JSON suppression endpoint
email.post('/unsubscribe', async (c) => {
  const { email: emailAddr } = await c.req.json<{ email?: string }>();
  const normalizedEmail = (emailAddr ?? '').trim().toLowerCase();

  if (!EMAIL_RE.test(normalizedEmail)) {
    return c.json({ error: 'Valid email required' }, 400);
  }

  await suppressEmail(c.env, normalizedEmail);
  return c.json({ success: true });
});

// POST /api/v1/email/newsletter
email.post('/newsletter', async (c) => {
  const { email: emailAddr } = await c.req.json<{ email: string }>();
  if (!emailAddr) return c.json({ error: 'email required' }, 400);
  if (!EMAIL_RE.test(emailAddr)) return c.json({ error: 'Invalid email address' }, 400);

  // Upsert subscriber
  try {
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)`
    ).bind(emailAddr).run();
  } catch (err) {
    console.error('[email/newsletter] DB insert failed:', err);
    return c.json({ error: 'Failed to subscribe' }, 500);
  }

  const adminEmail = c.env.ADMIN_EMAIL || 'info@jeffhonforlocophotos.com';
  await Promise.allSettled([
    sendEmail(c.env.RESEND_API_KEY, {
      to: adminEmail,
      subject: `New Newsletter Subscriber: ${emailAddr}`,
      html: `<p>New subscriber: <strong>${escapeHtml(emailAddr)}</strong></p>`,
    }),
    sendEmail(c.env.RESEND_API_KEY, {
      to: emailAddr,
      subject: 'Welcome to Jeff Honforloco Photography',
      html: newsletterWelcomeHtml(),
    }),
  ]);

  return c.json({ success: true });
});

export default email;
