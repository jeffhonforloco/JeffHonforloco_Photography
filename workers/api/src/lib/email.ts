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

export function chatLeadNotificationHtml(data: {
  email: string;
  serviceType: string;
  needsApproval: boolean;
  conversation: string;
}): string {
  const badge = data.needsApproval
    ? `<div style="background:#dc2626;color:#fff;padding:10px 18px;border-radius:6px;display:inline-block;margin-bottom:20px;font-weight:bold;font-size:15px;">⚡ NEEDS YOUR APPROVAL — Reply within a few hours to close this booking</div>`
    : `<div style="background:#16a34a;color:#fff;padding:10px 18px;border-radius:6px;display:inline-block;margin-bottom:20px;font-weight:bold;font-size:15px;">📧 New Lead Captured via Studio Chatbot</div>`;

  const safeConversation = data.conversation
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      ${badge}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 0;font-weight:bold;width:140px;">Lead Email:</td><td><a href="mailto:${data.email}" style="color:#dc2626;">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;">Service:</td><td>${data.serviceType}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;">Status:</td><td>${data.needsApproval ? '⚡ Custom quote — awaiting your approval' : '✅ Lead captured — follow up to convert'}</td></tr>
      </table>
      ${data.needsApproval ? `<p style="color:#dc2626;font-weight:bold;font-size:14px;">The AI has negotiated to a point where Jeff's personal sign-off is needed. Reach out now to confirm the package and lock in the booking.</p>` : ''}
      <h3 style="border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Full Conversation Transcript</h3>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:13px;line-height:1.7;color:#374151;">${safeConversation}</div>
      <p style="margin-top:28px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;">
        Reply directly to this email to reach the client · <a href="tel:+16463794237" style="color:#dc2626;">+1-646-379-4237</a> · <a href="https://jeffhonforlocophotos.com/admin" style="color:#dc2626;">Admin Panel</a>
      </p>
    </div>
  `;
}
