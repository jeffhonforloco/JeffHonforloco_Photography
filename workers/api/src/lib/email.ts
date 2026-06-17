interface SendOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FROM = 'Jeff Honforloco <info@jeffhonforlocophotos.com>';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
    <h2>New Inquiry from ${escapeHtml(data.full_name)}</h2>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
    ${data.service_type ? `<p><strong>Service:</strong> ${escapeHtml(data.service_type)}</p>` : ''}
    ${data.budget_range ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget_range)}</p>` : ''}
    ${data.event_date ? `<p><strong>Date:</strong> ${escapeHtml(data.event_date)}</p>` : ''}
    ${data.location ? `<p><strong>Location:</strong> ${escapeHtml(data.location)}</p>` : ''}
    <p><strong>Message:</strong></p><p>${escapeHtml(data.message)}</p>
  `;
}

export function contactConfirmationHtml(data: {
  name: string;
  service_type?: string;
  event_date?: string;
  location?: string;
  budget_range?: string;
}): string {
  const { name, service_type, event_date, location, budget_range } = data;
  const safeName = escapeHtml(name);

  const detailRows = [
    service_type ? `<tr><td style="padding:6px 0;color:#9ca3af;width:120px;">Service</td><td style="padding:6px 0;color:#f9fafb;">${escapeHtml(service_type)}</td></tr>` : '',
    event_date   ? `<tr><td style="padding:6px 0;color:#9ca3af;">Requested Date</td><td style="padding:6px 0;color:#f9fafb;">${escapeHtml(event_date)}</td></tr>` : '',
    location     ? `<tr><td style="padding:6px 0;color:#9ca3af;">Location</td><td style="padding:6px 0;color:#f9fafb;">${escapeHtml(location)}</td></tr>` : '',
    budget_range ? `<tr><td style="padding:6px 0;color:#9ca3af;">Budget</td><td style="padding:6px 0;color:#f9fafb;">${escapeHtml(budget_range)}</td></tr>` : '',
  ].filter(Boolean).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f9fafb;padding:0;">

      <div style="background:#111;padding:32px 40px;text-align:center;border-bottom:2px solid #dc2626;">
        <p style="font-size:11px;letter-spacing:0.3em;color:#dc2626;text-transform:uppercase;margin:0 0 8px;">Jeff Honforloco Photography</p>
        <h1 style="font-size:28px;font-weight:300;color:#fff;margin:0;">Your Request Is In</h1>
      </div>

      <div style="padding:40px;">
        <p style="font-size:16px;color:#d1d5db;line-height:1.6;margin:0 0 24px;">
          Hi ${safeName},<br><br>
          Thank you for reaching out. I've received your booking request and will personally review it within <strong style="color:#fff;">24 hours</strong>.
        </p>

        ${detailRows ? `
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;margin-bottom:32px;">
          <p style="font-size:11px;letter-spacing:0.25em;color:#dc2626;text-transform:uppercase;margin:0 0 12px;">Your Session Summary</p>
          <table style="width:100%;border-collapse:collapse;">${detailRows}</table>
        </div>` : ''}

        <div style="margin-bottom:32px;">
          <p style="font-size:11px;letter-spacing:0.25em;color:#dc2626;text-transform:uppercase;margin:0 0 16px;">What Happens Next</p>
          <div style="display:flex;flex-direction:column;gap:0;">
            <div style="display:flex;gap:16px;margin-bottom:20px;">
              <div style="width:28px;height:28px;border-radius:50%;background:#dc2626;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:28px;">1</div>
              <div>
                <p style="margin:0;color:#fff;font-size:14px;font-weight:600;">Jeff Reviews Your Request (within 24 hrs)</p>
                <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">I personally look over every inquiry to understand your vision and goals.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:20px;">
              <div style="width:28px;height:28px;border-radius:50%;background:#dc2626;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:28px;">2</div>
              <div>
                <p style="margin:0;color:#fff;font-size:14px;font-weight:600;">Creative Consult Scheduled</p>
                <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">We'll connect to align on concept, location, wardrobe, and creative direction before the shoot.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;">
              <div style="width:28px;height:28px;border-radius:50%;background:#dc2626;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:28px;">3</div>
              <div>
                <p style="margin:0;color:#fff;font-size:14px;font-weight:600;">Shoot Day Confirmed</p>
                <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Once everything is aligned, your session date is locked in and we're ready to create.</p>
              </div>
            </div>
          </div>
        </div>

        <p style="color:#6b7280;font-size:13px;line-height:1.6;border-top:1px solid #222;padding-top:24px;margin:0;">
          Questions in the meantime? Reply directly to this email or visit
          <a href="https://jeffhonforlocophotos.com" style="color:#dc2626;">jeffhonforlocophotos.com</a><br><br>
          — Jeff Honforloco
        </p>
      </div>
    </div>
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

  const safeConversation = escapeHtml(data.conversation);
  const safeEmail = escapeHtml(data.email);
  const safeServiceType = escapeHtml(data.serviceType);

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      ${badge}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 0;font-weight:bold;width:140px;">Lead Email:</td><td><a href="mailto:${safeEmail}" style="color:#dc2626;">${safeEmail}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;">Service:</td><td>${safeServiceType}</td></tr>
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
