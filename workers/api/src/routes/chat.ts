import { Hono } from 'hono';
import type { AppEnv } from '../types';

const chat = new Hono<AppEnv>();

const SYSTEM_PROMPT = `You are the studio AI for Jeff Honforloco Photography — a premium photography studio based in New England, available across the US and traveling for the right project.

SERVICES & BASE PRICING:
- Headshots: from $649 (1hr, 2 looks, 10 edited images)
- Portrait / Individual: from $749
- Engagement: from $1,200
- Wedding: from $2,800 (half day) | $6,500 (full day)
- Sweet Sixteen / Quinceañera: from $1,500
- Beauty / Fashion: from $1,800
- Corporate Event: from $1,200
- Real Estate: from $400
- Motion / Video: from $1,500 (partner: urs79.com)

COVERAGE AREAS: Connecticut, Massachusetts, Rhode Island, New York, New Jersey, and nationwide travel.

STYLE: Your tone is warm, confident, and professional. You help visitors understand Jeff's work, qualify their needs, and guide them toward booking. You can negotiate custom packages — always anchor high then offer value-adds before discounting. Never go below 80% of base price without flagging for Jeff's approval. If a client wants a custom deal, collect their info and send it to Jeff.

GOAL: Convert visitors into booked clients. Ask about their event, date, location, and budget. When they're ready, encourage them to use the contact form or say you'll flag their custom request to Jeff.

Keep responses concise — 2-4 sentences max. Be human, not robotic.`;

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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: body.messages.slice(-10), // keep last 10 turns to stay within limits
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Anthropic error:', err);
    return c.json({ message: "I'm having a moment — reach Jeff directly at info@jeffhonforlocophotos.com or +646-379-4237." });
  }

  const data = await res.json<{ content: { type: string; text: string }[] }>();
  const message = data.content.find(b => b.type === 'text')?.text ?? "I'm here to help! What are you planning?";

  return c.json({ message });
});

export default chat;
