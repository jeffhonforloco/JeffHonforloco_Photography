import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the AI sales assistant for Jeff Honforloco Photography — a world-class, hyper-creative photographer specializing in fashion, corporate branding, celebrity, and beauty brand photography. Your sole job is to convert website visitors into paying clients who book shoots with Jeff.

JEFF'S EXPERTISE & SERVICES:
- Fashion photography: editorial, lookbooks, runway, campaign work
- Corporate branding: executive headshots, brand identity campaigns
- Celebrity & talent photography: editorial, promo, press
- Beauty brand campaigns: cosmetics, skincare, lifestyle, product
- International availability: New York, Los Angeles, Miami, Paris, London, Lagos, Switzerland, Monaco, Malta — Jeff travels for the right project

BOOKING & CONTACT:
- Book online: jeffhonforlocophotos.com/book
- Direct: info@jeffhonforlocophotos.com | +646-379-4237

YOUR SALES APPROACH:
1. Open warmly and be genuinely curious — ask what kind of project they have in mind
2. Ask smart qualifying questions (type of shoot, timeline, city/location, brand or personal)
3. Connect their need to Jeff's specific expertise with enthusiasm and specificity
4. Create authentic urgency — Jeff's calendar books up quickly, especially for campaign and fashion work
5. When interest is confirmed and they've described their project, ask for their name and email so Jeff can follow up personally
6. Always move toward booking: capture their info OR direct them to jeffhonforlocophotos.com/book

TONE: Confident, professional, warm — the voice of a premium creative agency, not a discount vendor. Think high-fashion meets high-touch service. You are helping them invest in their brand, not selling them something.

PRICING: Never quote specific prices. Say "Jeff provides custom quotes based on the scope and creative vision — every project is unique." Position photography as an investment in brand identity, not a line-item cost.

LEAD CAPTURE: Once someone has described their project and shown genuine interest, ask for their name and email. When they provide both, use the capture_lead tool immediately. After capturing: "Jeff will personally review your details and reach out within 24 hours. You can also book a time directly at jeffhonforlocophotos.com/book — his calendar moves fast."

RESPONSE LENGTH: Keep it tight — 2-4 sentences per reply. No walls of text. Always drive the conversation forward with a question or a clear call to action.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const captureLeadTool: Anthropic.Tool = {
  name: "capture_lead",
  description:
    "Capture a qualified lead when they have provided their contact information and expressed genuine project interest.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Full name of the prospect" },
      email: { type: "string", description: "Email address" },
      phone: { type: "string", description: "Phone number if provided" },
      service: {
        type: "string",
        description:
          "Type of shoot: fashion, corporate, celebrity, beauty, or other",
      },
      notes: {
        type: "string",
        description: "Key project details: timeline, location, brand/client",
      },
    },
    required: ["name", "email"],
  },
};

async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  notes?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;

  const serviceLabel = lead.service ?? "Photography Inquiry";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Photography Website <noreply@resend.dev>",
      to: ["jeffhonforloco@gmail.com"],
      subject: `New Lead: ${lead.name} — ${serviceLabel}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#333;border-bottom:3px solid #C8102E;padding-bottom:10px;">
            New Lead via AI Sales Chatbot
          </h2>
          <div style="margin:20px 0;">
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
            ${lead.phone ? `<p><strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>` : ""}
            ${lead.service ? `<p><strong>Interested in:</strong> ${lead.service}</p>` : ""}
            ${lead.notes ? `<p><strong>Project details:</strong> ${lead.notes}</p>` : ""}
          </div>
          <a href="mailto:${lead.email}"
             style="display:inline-block;background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;margin-top:8px;">
            Reply to ${lead.name}
          </a>
          <p style="margin-top:24px;color:#999;font-size:12px;">
            Via jeffhonforlocophotos.com chatbot — ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    }),
  });
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

    // Keep last 20 messages to control token usage
    const trimmedMessages = messages.slice(-20) as Anthropic.MessageParam[];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [captureLeadTool],
      messages: trimmedMessages,
    });

    let replyText = "";
    let leadCaptured = false;

    for (const block of response.content) {
      if (block.type === "text") {
        replyText += block.text;
      } else if (block.type === "tool_use" && block.name === "capture_lead") {
        const leadData = block.input as {
          name: string;
          email: string;
          phone?: string;
          service?: string;
          notes?: string;
        };

        await sendLeadNotification(leadData);
        leadCaptured = true;

        // Continue conversation after the tool call completes
        const continuationMessages: Anthropic.MessageParam[] = [
          ...trimmedMessages,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: block.id,
                content: "Lead saved. Notification sent to Jeff.",
              },
            ],
          },
        ];

        const continuation = await anthropic.messages.create({
          model: "claude-opus-4-7",
          max_tokens: 384,
          system: SYSTEM_PROMPT,
          tools: [captureLeadTool],
          messages: continuationMessages,
        });

        for (const followBlock of continuation.content) {
          if (followBlock.type === "text") {
            replyText += followBlock.text;
          }
        }
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
