import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  type: "contact" | "booking" | "newsletter";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  budget?: string;
  projectDate?: string;
  location?: string;
  leadScore?: number;
}

// Lead score for form submissions (complements chatbot scoring)
function calculateLeadScore(data: ContactEmailRequest): number {
  let score = 0;
  const service = (data.service ?? "").toLowerCase();
  const budget = (data.budget ?? "").toLowerCase();

  // Service type
  if (service.includes("wedding")) score += 40;
  else if (service.includes("celebrity") || service.includes("fashion")) score += 38;
  else if (service.includes("corporate branding") || service.includes("brand")) score += 35;
  else if (service.includes("corporate event") || service.includes("event")) score += 30;
  else if (service.includes("real estate")) score += 28;
  else if (service.includes("beauty") || service.includes("cosmetic")) score += 26;
  else if (service.includes("engagement")) score += 24;
  else if (service.includes("sweet sixteen") || service.includes("sweet 16") || service.includes("quinceañera")) score += 20;
  else if (service.includes("headshot")) score += 18;
  else if (service.includes("graduation") || service.includes("senior")) score += 15;

  // Budget signals
  if (budget.includes("50,000") || budget.includes("$50k")) score += 30;
  else if (budget.includes("25,000") || budget.includes("$25k")) score += 22;
  else if (budget.includes("10,000") || budget.includes("$10k")) score += 16;
  else if (budget.includes("5,000") || budget.includes("$5k")) score += 10;

  // Phone provided (higher intent)
  if (data.phone) score += 10;

  // Project date indicates real intent
  if (data.projectDate) {
    const diff =
      (new Date(data.projectDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24 * 30);
    if (diff <= 2) score += 18; // within 2 months — urgent
    else if (diff <= 6) score += 10;
  }

  // High-value markets
  const location = (data.location ?? "").toLowerCase();
  const highValueCities = ["new york", "nyc", "los angeles", "miami", "paris", "london", "monaco", "chicago", "boston"];
  if (highValueCities.some((c) => location.includes(c))) score += 8;

  return Math.min(score, 100);
}

function getLeadBadge(score: number): { label: string; color: string; emoji: string } {
  if (score >= 70) return { label: "HOT", color: "#C8102E", emoji: "🔴" };
  if (score >= 45) return { label: "WARM", color: "#F59E0B", emoji: "🟡" };
  return { label: "COOL", color: "#6B7280", emoji: "🔵" };
}

function getServiceConfirmationCopy(service: string, type: string): {
  headline: string;
  body: string;
} {
  const s = service.toLowerCase();

  if (s.includes("wedding")) {
    return {
      headline: "Let's capture your perfect day.",
      body: "Jeff approaches every wedding as a once-in-a-lifetime story — because it is. From the quiet moment before the ceremony to the last dance, he'll be there to capture it all. You're in great hands.",
    };
  }
  if (s.includes("engagement")) {
    return {
      headline: "Your love story, beautifully told.",
      body: "An engagement session with Jeff is relaxed, fun, and editorial-quality. These images will live on your walls, your invitations, and your social media for years. Can't wait to create something stunning with you.",
    };
  }
  if (s.includes("corporate branding") || s.includes("brand")) {
    return {
      headline: "Elevate your brand with world-class photography.",
      body: "Great branding photography is one of the highest-ROI investments a business can make. Jeff will work with you to understand your brand identity and create imagery that commands attention — on your website, LinkedIn, and beyond.",
    };
  }
  if (s.includes("headshot") || s.includes("office")) {
    return {
      headline: "Look your absolute best. Every time.",
      body: "Jeff's headshot sessions are fast, efficient, and produce polished results for individuals and teams. Whether it's your LinkedIn profile, company website, or press materials — he'll make sure you look like the professional you are.",
    };
  }
  if (s.includes("graduation") || s.includes("senior")) {
    return {
      headline: "Celebrate this milestone in style.",
      body: "Graduation is a huge deal — and the photos should match. Jeff creates graduation portraits that go far beyond cap-and-gown snapshots. These are editorial-quality images that honor everything you've worked for.",
    };
  }
  if (s.includes("sweet sixteen") || s.includes("sweet 16") || s.includes("quinceañera")) {
    return {
      headline: "A milestone worth celebrating beautifully.",
      body: "Jeff creates glamorous, high-fashion portraits for sweet sixteens and quinceañeras that feel like a magazine editorial — not a school photo. This is a day worth remembering in the best way possible.",
    };
  }
  if (s.includes("real estate")) {
    return {
      headline: "Stand out in a crowded market.",
      body: "In real estate, your personal brand is your most powerful listing tool. Jeff specializes in realtor headshots and luxury property lifestyle photography that makes you the obvious choice for discerning clients.",
    };
  }
  if (s.includes("corporate event") || s.includes("event")) {
    return {
      headline: "Your event deserves to be documented right.",
      body: "Jeff covers conferences, galas, product launches, and award ceremonies with the kind of high-end documentation that elevates your brand in every frame. Great event photography is content gold.",
    };
  }
  if (s.includes("fashion") || s.includes("beauty") || s.includes("cosmetic")) {
    return {
      headline: "Creative vision meets technical excellence.",
      body: "Jeff's editorial and commercial photography work has the quality of a top agency shoot with the personal attention of a boutique studio. Every image is crafted with intention, lighting, and creative direction.",
    };
  }

  // Generic fallback for contact vs booking
  if (type === "booking") {
    return {
      headline: "Your booking is on its way.",
      body: "Jeff personally reviews every booking request and will confirm your session details within 24 hours. In the meantime, check out his portfolio to get inspired.",
    };
  }
  return {
    headline: "Jeff will be in touch shortly.",
    body: "Jeff is hands-on with every client — you'll hear directly from him, not an assistant. He's looking forward to learning more about your project.",
  };
}

function generateJeffNotificationHtml(data: ContactEmailRequest, score: number): string {
  const badge = getLeadBadge(score);
  const service = data.service ?? "Not specified";
  const captureTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#111;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden;border:1px solid #222;">

    <div style="background:#1a1a1a;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #C8102E;">
      <div>
        <p style="margin:0;color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Jeff Honforloco Photography</p>
        <h1 style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;">
          New ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Inquiry
        </h1>
      </div>
      <div style="background:${badge.color};color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">
        ${badge.emoji} ${badge.label} · ${score}/100
      </div>
    </div>

    <div style="padding:24px;">

      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:16px;border:1px solid #222;">
        <p style="margin:0 0 10px;color:#C8102E;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Contact</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Name:</strong> ${data.name}</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:#C8102E;text-decoration:none;">${data.email}</a></p>
        ${data.phone ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Phone:</strong> <a href="tel:${data.phone}" style="color:#C8102E;text-decoration:none;">${data.phone}</a></p>` : ""}
      </div>

      ${data.service ? `
      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:16px;border:1px solid #222;">
        <p style="margin:0 0 10px;color:#C8102E;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Project Details</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Service:</strong> ${service}</p>
        ${data.budget ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Budget:</strong> ${data.budget}</p>` : ""}
        ${data.projectDate ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Date:</strong> ${data.projectDate}</p>` : ""}
        ${data.location ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Location:</strong> ${data.location}</p>` : ""}
      </div>
      ` : ""}

      ${data.message ? `
      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:16px;border:1px solid #222;">
        <p style="margin:0 0 10px;color:#C8102E;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Message</p>
        <p style="margin:0;color:#ddd;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
      </div>
      ` : ""}

      <div style="text-align:center;margin-top:24px;">
        <a href="mailto:${data.email}?subject=Re%3A%20Your%20${encodeURIComponent(service)}%20Inquiry"
           style="display:inline-block;background:#C8102E;color:#fff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
          Reply to ${data.name}
        </a>
      </div>

    </div>

    <div style="padding:12px 24px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0;color:#444;font-size:11px;">jeffhonforlocophotos.com · Received ${captureTime} ET</p>
    </div>
  </div>
</body>
</html>`;
}

function generateClientConfirmationHtml(data: ContactEmailRequest): string {
  const { headline, body } = getServiceConfirmationCopy(
    data.service ?? "",
    data.type
  );

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <div style="background:#0a0a0a;padding:28px 32px;text-align:center;">
      <p style="margin:0;color:#C8102E;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Jeff Honforloco Photography</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">${headline}</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#333;font-size:16px;">Hi ${data.name},</p>

      <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">${body}</p>

      <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
        Jeff will personally reach out within <strong>24 hours</strong>. If you'd like to move faster, you can book a time directly using the link below — his calendar fills up quickly, especially for weddings and graduation season.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="https://jeffhonforlocophotos.com/book"
           style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
          View Booking Calendar
        </a>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-top:24px;">
        <p style="margin:0 0 4px;color:#333;font-weight:700;font-size:14px;">Jeff Honforloco</p>
        <p style="margin:0 0 2px;color:#888;font-size:13px;">Photographer · Tarvico Inc.</p>
        <p style="margin:0 0 2px;color:#888;font-size:13px;">
          <a href="mailto:info@jeffhonforlocophotos.com" style="color:#C8102E;text-decoration:none;">info@jeffhonforlocophotos.com</a>
        </p>
        <p style="margin:0;color:#888;font-size:13px;">
          <a href="tel:+16463794237" style="color:#C8102E;text-decoration:none;">+646-379-4237</a>
        </p>
      </div>
    </div>

    <div style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#bbb;font-size:11px;">
        <a href="https://jeffhonforlocophotos.com" style="color:#999;text-decoration:none;">jeffhonforlocophotos.com</a>
        · Providence, RI · Available Nationwide & International
      </p>
    </div>
  </div>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ContactEmailRequest = await req.json();
    const { type, name, email, service } = requestData;

    const score = requestData.leadScore ?? calculateLeadScore(requestData);

    // Notification to Jeff — try primary domain, fall back to Gmail
    let jeffEmailId: string | undefined;
    try {
      const result = await resend.emails.send({
        from: "Photography Website <noreply@resend.dev>",
        to: ["info@jeffhonforlocophotos.com"],
        subject: `New ${service ?? type} inquiry from ${name}`,
        html: generateJeffNotificationHtml(requestData, score),
      });
      jeffEmailId = result.data?.id;
    } catch {
      const fallback = await resend.emails.send({
        from: "Photography Website <noreply@resend.dev>",
        to: ["jeffhonforloco@gmail.com"],
        subject: `[FB] New ${service ?? type} inquiry from ${name}`,
        html: generateJeffNotificationHtml(requestData, score),
      });
      jeffEmailId = fallback.data?.id;
    }

    // Confirmation to client (skip for newsletter signups)
    if (type !== "newsletter") {
      await resend.emails.send({
        from: "Jeff Honforloco Photography <noreply@resend.dev>",
        to: [email],
        subject: `Thank you, ${name} — we received your inquiry`,
        html: generateClientConfirmationHtml(requestData),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Emails sent successfully",
        jeffEmailId,
        confirmationSent: type !== "newsletter",
        leadScore: score,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
