import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BRAVE_API_KEY = Deno.env.get("BRAVE_SEARCH_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the AI sales assistant for Jeff Honforloco Photography — a world-class photographer based in the Northeast US, available nationwide and internationally. Your sole mission: turn every website visitor into a booked client.

## JEFF'S COMPLETE SERVICE MENU

### Life Milestones
- **Wedding Photography**: Full-day coverage, getting-ready through reception, editorial storytelling. Jeff captures raw emotion and cinematic moments that couples treasure forever.
- **Engagement Shoots**: Romantic, fashion-forward sessions that tell your love story before the big day.
- **Sweet Sixteen / Quinceañera**: Glamorous, high-fashion portraits that honor this milestone in style.
- **School Graduation / Senior Portraits**: Cap-and-gown and lifestyle sessions celebrating academic achievement — yearbook-worthy and magazine-quality.

### Corporate & Professional
- **Corporate Branding**: Full brand identity campaigns — executive portraits, team photography, behind-the-scenes brand storytelling for websites, LinkedIn, and marketing collateral.
- **Office Headshots**: On-location or studio headshots for individuals, teams, C-suite executives. Consistent, polished, fast turnaround. Makes everyone look their best.
- **Corporate Events**: Conferences, galas, award ceremonies, product launches, networking events. High-end event documentation that elevates your brand.
- **Real Estate Branding**: Realtor headshots, luxury property lifestyle photography, personal brand campaigns for agents and brokers who want to stand out.

### Creative & Commercial
- **Fashion Photography**: Editorial lookbooks, runway coverage, brand campaigns.
- **Beauty & Cosmetics**: Campaign photography for skincare, cosmetics, wellness, lifestyle brands.
- **Celebrity & Talent**: Editorial, promotional, press materials for artists, athletes, and public figures.

## WHY CLIENTS CHOOSE JEFF OVER EVERY OTHER OPTION
- **Not a franchise studio**: JCPenney, Sears, and mall portrait studios offer cookie-cutter, assembly-line results. Jeff brings genuine creative vision to every shoot.
- **Not a Thumbtack gamble**: Budget photographers on platforms like Thumbtack, Fiverr, or Craigslist lack the experience for high-stakes events. Jeff has a professional track record you can verify.
- **Not an overpriced agency**: Large commercial agencies charge for overhead, account teams, and layers of markup. Jeff is boutique — you work directly with the photographer. Better result, better value.
- **Not your cousin with a camera**: You only get one wedding day, one graduation, one product launch. There are no do-overs. Jeff guarantees professional results.
- **Real creative direction**: Jeff doesn't just press the shutter — he directs, coaches, and creates an experience that draws out your best.
- **International reach**: Jeff travels for the right project — NYC, Providence, Boston, Miami, LA, Atlanta, Chicago, London, Paris, Lagos, Monaco. No location is out of reach.

## COMPETITIVE POSITIONING BY CATEGORY
- **vs. local studios**: "Jeff's work is published-quality — the difference is visible in the first frame."
- **vs. big agencies**: "Jeff is boutique. You get his personal creative attention, not a junior photographer."
- **vs. DIY / phone cameras**: "For something this important, the investment in professional photography pays back for years in how you're perceived."

## YOUR PROVEN SALES APPROACH
1. Greet warmly, be genuinely curious — ask what they're working on
2. Listen for: service type, timeline, location, occasion, scale
3. Reflect their need back with enthusiasm and connect it to Jeff's specific expertise
4. Create authentic urgency — Jeff's calendar books 4–8 weeks out; popular dates (June weddings, graduation season, Q4 corporate) go fast
5. Qualify: What's the event/project? When? Where? What's the vision?
6. When they're engaged and have described their project, ask for their name and email for a personal follow-up from Jeff
7. Move toward booking: capture their info OR direct to jeffhonforlocophotos.com/book

## PRICING GUIDANCE
Never quote specific prices. Always say: "Jeff provides custom quotes based on the scope, location, and creative vision — every project is unique, and he'll put together a detailed proposal after a quick conversation." Position photography as a brand investment with lasting ROI, not a line-item expense.

## BOOKING & CONTACT
- Book online: jeffhonforlocophotos.com/book
- Email: info@jeffhonforlocophotos.com
- Phone: +646-379-4237

## LEAD CAPTURE PROTOCOL
Once someone has described their project and shown genuine interest, ask for their name and email. When they provide both, immediately call the capture_lead tool. After capturing: "Perfect — Jeff will personally reach out within 24 hours. You can also grab a time directly at jeffhonforlocophotos.com/book — popular dates fill fast, especially for weddings and graduation season."

## OPPORTUNITY HUNTING
Always look for upsell opportunities:
- Wedding inquiry → mention engagement shoot, bridal portraits, anniversary sessions
- Corporate headshots → mention full team, brand campaign, event coverage
- Graduation → mention family portraits, senior lifestyle session
- Real estate → mention ongoing retainer for listings, personal brand campaign

## RESPONSE STYLE
- Keep replies tight: 2–4 sentences max per turn
- Warm, confident, premium tone — boutique creative agency energy
- Always end with a forward-moving question or clear CTA
- No walls of text. No generic filler. Make every word count.`;

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  event_date?: string;
  location?: string;
  budget_signal?: string;
  notes?: string;
}

function scoreLeadByService(service: string): number {
  const s = service.toLowerCase();
  if (s.includes("celebrity")) return 92;
  if (s.includes("wedding")) return 88;
  if (s.includes("corporate branding") || s.includes("brand campaign")) return 82;
  if (s.includes("fashion")) return 78;
  if (s.includes("corporate event")) return 74;
  if (s.includes("real estate")) return 72;
  if (s.includes("beauty") || s.includes("cosmetic")) return 70;
  if (s.includes("engagement")) return 68;
  if (s.includes("sweet sixteen") || s.includes("sweet 16") || s.includes("quinceañera")) return 62;
  if (s.includes("headshot")) return 60;
  if (s.includes("graduation") || s.includes("senior portrait")) return 52;
  return 60;
}

function getLeadStatus(score: number): { label: string; color: string; emoji: string } {
  if (score >= 75) return { label: "HOT", color: "#C8102E", emoji: "🔴" };
  if (score >= 55) return { label: "WARM", color: "#F59E0B", emoji: "🟡" };
  return { label: "COLD", color: "#6B7280", emoji: "🔵" };
}

function getEstimatedValue(service: string): string {
  const s = service.toLowerCase();
  if (s.includes("celebrity") || s.includes("fashion")) return "$5,000 – $20,000+";
  if (s.includes("wedding")) return "$3,500 – $10,000+";
  if (s.includes("corporate branding") || s.includes("brand campaign")) return "$2,500 – $8,000+";
  if (s.includes("corporate event")) return "$2,000 – $6,000+";
  if (s.includes("real estate")) return "$800 – $3,000+";
  if (s.includes("engagement")) return "$800 – $2,200+";
  if (s.includes("sweet sixteen") || s.includes("sweet 16")) return "$600 – $1,800+";
  if (s.includes("headshot")) return "$400 – $1,500+";
  if (s.includes("graduation") || s.includes("senior")) return "$350 – $900+";
  return "$500 – $5,000+";
}

async function sendLeadNotification(lead: LeadData): Promise<void> {
  if (!RESEND_API_KEY) return;

  const service = lead.service ?? "Photography Inquiry";
  const score = scoreLeadByService(service);
  const status = getLeadStatus(score);
  const estimatedValue = getEstimatedValue(service);
  const captureTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const emailTo = lead.email ? encodeURIComponent(lead.email) : "";
  const emailName = lead.name ? encodeURIComponent(lead.name) : "there";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Photography Website <noreply@resend.dev>",
      to: ["jeffhonforloco@gmail.com"],
      subject: `${status.emoji} ${status.label} Lead: ${lead.name} — ${service}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#111;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden;border:1px solid #222;">

    <div style="background:#C8102E;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Jeff Honforloco Photography</p>
        <h1 style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.5px;">New Lead — AI Sales Chatbot</h1>
      </div>
      <div style="background:${status.color};border:2px solid rgba(255,255,255,0.25);color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">
        ${status.emoji} ${status.label}
      </div>
    </div>

    <div style="padding:24px;">

      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:16px;border:1px solid #222;">
        <p style="margin:0 0 12px;color:#C8102E;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Contact Information</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Name:</strong> ${lead.name}</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Email:</strong> <a href="mailto:${lead.email}" style="color:#C8102E;text-decoration:none;">${lead.email}</a></p>
        ${lead.phone ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Phone:</strong> <a href="tel:${lead.phone}" style="color:#C8102E;text-decoration:none;">${lead.phone}</a></p>` : ""}
      </div>

      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:16px;border:1px solid #222;">
        <p style="margin:0 0 12px;color:#C8102E;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Project Details</p>
        <p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Service:</strong> ${service}</p>
        ${lead.event_date ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Event / Project Date:</strong> ${lead.event_date}</p>` : ""}
        ${lead.location ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Location:</strong> ${lead.location}</p>` : ""}
        ${lead.budget_signal ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Budget Signal:</strong> ${lead.budget_signal}</p>` : ""}
        ${lead.notes ? `<p style="margin:5px 0;color:#fff;font-size:15px;"><strong>Notes:</strong> ${lead.notes}</p>` : ""}
      </div>

      <div style="background:#161616;border-radius:8px;padding:18px;margin-bottom:24px;border:1px solid #222;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
          <div>
            <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Lead Score</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${status.color};">${score}<span style="font-size:14px;color:#666;">/100</span></p>
          </div>
          <div>
            <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Est. Project Value</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#22c55e;">${estimatedValue}</p>
          </div>
          <div>
            <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Captured</p>
            <p style="margin:4px 0 0;font-size:13px;color:#ccc;">${captureTime} ET</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;">
        <a href="mailto:${lead.email}?subject=Re%3A%20Your%20Photography%20Inquiry&body=Hi%20${emailName}%2C%0A%0AThank%20you%20for%20reaching%20out%20to%20Jeff%20Honforloco%20Photography.%20I%20love%20your%20project%20idea%20and%20would%20love%20to%20connect.%0A%0A"
           style="display:inline-block;background:#C8102E;color:#fff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
          Reply to ${lead.name}
        </a>
        <p style="margin:12px 0 0;color:#555;font-size:12px;">
          Or call <a href="tel:+16463794237" style="color:#C8102E;text-decoration:none;">+646-379-4237</a>
        </p>
      </div>

    </div>

    <div style="padding:16px 24px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0;color:#444;font-size:11px;">jeffhonforlocophotos.com — AI Sales Chatbot</p>
    </div>
  </div>
</body>
</html>`,
    }),
  });
}

async function braveSearch(query: string): Promise<string> {
  if (!BRAVE_API_KEY) return "Web search not configured.";

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&text_decorations=false&safesearch=moderate`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });

    if (!res.ok) return "Search temporarily unavailable.";

    const data = await res.json() as {
      web?: { results?: Array<{ title: string; description: string; url: string }> };
    };

    const results = data.web?.results ?? [];
    if (results.length === 0) return "No results found for that query.";

    return results
      .slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.title}\n${r.description}\n${r.url}`)
      .join("\n\n");
  } catch {
    return "Search unavailable.";
  }
}

const captureLeadTool: Anthropic.Tool = {
  name: "capture_lead",
  description:
    "Capture a qualified lead when the prospect has provided their name and email and described a real project. Call this immediately when both name and email are available.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Full name of the prospect" },
      email: { type: "string", description: "Email address" },
      phone: { type: "string", description: "Phone number if provided" },
      service: {
        type: "string",
        description:
          "Service type: wedding, engagement, corporate branding, office headshots, graduation, sweet sixteen, real estate, corporate event, fashion, celebrity, beauty, or other",
      },
      event_date: {
        type: "string",
        description: "Event or project date if mentioned",
      },
      location: {
        type: "string",
        description: "City, venue, or region if mentioned",
      },
      budget_signal: {
        type: "string",
        description: "Any budget or investment range mentioned by the prospect",
      },
      notes: {
        type: "string",
        description:
          "Key project details: scale, vision, special requirements, urgency signals",
      },
    },
    required: ["name", "email"],
  },
};

const webSearchTool: Anthropic.Tool = {
  name: "web_search",
  description:
    "Search the web for real-time competitor information, local photography market data, or industry pricing when a prospect asks about comparing photographers or market rates. Use sparingly and only when directly relevant.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "The search query. Be specific and targeted.",
      },
    },
    required: ["query"],
  },
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: ChatRequest = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const trimmedMessages = messages.slice(-20) as Anthropic.MessageParam[];
    const tools: Anthropic.Tool[] = BRAVE_API_KEY
      ? [captureLeadTool, webSearchTool]
      : [captureLeadTool];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools,
      messages: trimmedMessages,
    });

    let replyText = "";
    let leadCaptured = false;

    // Collect all tool calls in this response
    const toolResults: Array<{ tool_use_id: string; content: string }> = [];

    for (const block of response.content) {
      if (block.type === "text") {
        replyText += block.text;
      } else if (block.type === "tool_use") {
        if (block.name === "capture_lead") {
          const leadData = block.input as LeadData;
          await sendLeadNotification(leadData);
          leadCaptured = true;
          toolResults.push({
            tool_use_id: block.id,
            content: "Lead captured and saved. Jeff has been notified by email.",
          });
        } else if (block.name === "web_search") {
          const { query } = block.input as { query: string };
          const searchResults = await braveSearch(query);
          toolResults.push({ tool_use_id: block.id, content: searchResults });
        }
      }
    }

    // Run a single continuation if any tools were called
    if (toolResults.length > 0) {
      const continuationMessages: Anthropic.MessageParam[] = [
        ...trimmedMessages,
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: toolResults.map((r) => ({
            type: "tool_result" as const,
            tool_use_id: r.tool_use_id,
            content: r.content,
          })),
        },
      ];

      const continuation = await anthropic.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        tools,
        messages: continuationMessages,
      });

      for (const fb of continuation.content) {
        if (fb.type === "text") replyText += fb.text;
      }
    }

    return new Response(
      JSON.stringify({ message: replyText, leadCaptured }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({
        message:
          "I'm having trouble connecting right now. Reach Jeff directly at info@jeffhonforlocophotos.com or +646-379-4237.",
        leadCaptured: false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
