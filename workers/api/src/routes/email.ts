import { Hono } from 'hono';
import { sendEmail, contactNotificationHtml, contactConfirmationHtml, newsletterWelcomeHtml } from '../lib/email';
import type { AppEnv } from '../types';

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

  // Save to contacts table
  await c.env.DB.prepare(
    `INSERT INTO contacts (full_name, email, phone, message, service_type, budget_range, event_date, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(body.full_name, body.email, body.phone ?? null, body.message,
         body.service_type ?? null, body.budget_range ?? null, body.event_date ?? null, body.location ?? null).run();

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
      subject: 'We received your inquiry — Jeff Honforloco Photography',
      html: contactConfirmationHtml(body.full_name),
    }),
  ]);

  return c.json({ success: true });
});

// POST /api/v1/email/newsletter
email.post('/newsletter', async (c) => {
  const { email: emailAddr } = await c.req.json<{ email: string }>();
  if (!emailAddr) return c.json({ error: 'email required' }, 400);

  // Upsert subscriber
  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)`
  ).bind(emailAddr).run();

  const adminEmail = c.env.ADMIN_EMAIL || 'info@jeffhonforlocophotos.com';
  await Promise.allSettled([
    sendEmail(c.env.RESEND_API_KEY, {
      to: adminEmail,
      subject: `New Newsletter Subscriber: ${emailAddr}`,
      html: `<p>New subscriber: <strong>${emailAddr}</strong></p>`,
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
