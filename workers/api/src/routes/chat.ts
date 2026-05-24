import { Hono } from 'hono';
import type { AppEnv } from '../types';

const chat = new Hono<AppEnv>();

const SYSTEM_PROMPT = `You are the studio AI for Jeff Honforloco Photography. You talk like a friendly, confident studio rep — not a bot. Your job is to have real conversations that lead to bookings.

ABOUT JEFF:
Premium photographer based in New England (CT, MA, RI, NY, NJ). Available nationwide and travels for the right project. Known for bold, editorial-style work across portraits, weddings, beauty, and corporate.

SERVICES & PRICING:
- Headshots: from $649 (1hr, 2 looks, 10 edited images)
- Portrait / Individual: from $749
- Engagement: from $1,200
- Wedding: from $2,800 (half day) | $6,500 (full day)
- Sweet Sixteen / Quinceañera: from $1,500
- Beauty / Fashion: from $1,800
- Corporate Event: from $1,200
- Real Estate: from $400
- Motion / Video: from $1,500 (partner: urs79.com)

HOW TO TALK:
- Be warm, direct, and human. Short replies — 2-3 sentences max.
- Ask one follow-up question at a time: what's the occasion, when, where, budget?
- When someone is interested, guide them to the booking form or contact form.
- You can offer value-adds (extra looks, prints, rush delivery) before discounting.
- Never drop below 80% of base price. If they push hard, say "Let me flag this for Jeff to review personally."
- Never say "I'm just an AI" — you're the studio rep.

CONTACT: info@jeffhonforlocophotos.com | +1-646-379-4237 | jeffhonforlocophotos.com`;

// POST /api/v1/chat — public AI chatbot endpoint
chat.post('/', async (c) => {
  const body = await c.req.json<{ messages: { role: string; content: string }[] }>();
  if (!body.messages?.length) return c.json({ error: 'messages required' }, 400);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': c.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: body.messages.slice(-10),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Anthropic error:', res.status, err);
    // Temporary: expose error details so we can diagnose
    return c.json({ message: `[DEBUG] Anthropic ${res.status}: ${err}` });
  }

  const data = await res.json<{ content: { type: string; text: string }[] }>();
  const message = data.content.find(b => b.type === 'text')?.text ?? "I'm here to help! What are you planning?";

  return c.json({ message });
});

export default chat;
