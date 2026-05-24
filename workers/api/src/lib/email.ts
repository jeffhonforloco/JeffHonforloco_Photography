interface SendOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FROM = 'Jeff Honforloco <info@jeffhonforlocophotos.com>';

export async function sendEmail(apiKey: string, opts: SendOptions): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html, reply_to: opts.replyTo }),
  });
  return res.ok;
}

export function contactNotificationHtml(data: {
  full_name: string; email: string; phone?: string; message: string;
  service_type?: string; budget_range?: string; event_date?: string; location?: string;
}): string {
  return `
    <h2>New Inquiry from ${data.full_name}</h2>
    <p><strong>Email:</strong> ${data.email}</p>
    ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
    ${data.service_type ? `<p><strong>Service:</strong> ${data.service_type}</p>` : ''}
    ${data.budget_range ? `<p><strong>Budget:</strong> ${data.budget_range}</p>` : ''}
    ${data.event_date ? `<p><strong>Date:</strong> ${data.event_date}</p>` : ''}
    ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
    <p><strong>Message:</strong></p><p>${data.message}</p>
  `;
}

export function contactConfirmationHtml(name: string): string {
  return `
    <h2>Thank you, ${name}!</h2>
    <p>Your inquiry has been received. I personally respond to all messages within 24 hours.</p>
    <p>— Jeff Honforloco</p>
    <p><a href="https://jeffhonforlocophotos.com">jeffhonforlocophotos.com</a></p>
  `;
}

export function newsletterWelcomeHtml(): string {
  return `
    <h2>Welcome to Jeff's Community!</h2>
    <p>You're now subscribed to exclusive photography tips, behind-the-scenes content, and industry insights.</p>
    <p>— Jeff Honforloco</p>
    <p><a href="https://jeffhonforlocophotos.com">jeffhonforlocophotos.com</a></p>
  `;
}
