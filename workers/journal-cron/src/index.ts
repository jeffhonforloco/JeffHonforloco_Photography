export interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: Array<{ name: string; keywords: string; image: string }> = [
  {
    name: 'Photography Tips & Techniques',
    keywords: 'professional photography tips, portrait lighting techniques, camera settings for fashion photography, beauty photography setup, studio lighting tutorial',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&q=80',
  },
  {
    name: 'Client Preparation & Session Insights',
    keywords: 'how to prepare for a photoshoot, what to wear to a photoshoot, photoshoot preparation guide, luxury photography session tips, model prep checklist',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  },
  {
    name: 'Equipment Reviews & Recommendations',
    keywords: 'best camera for fashion photography 2026, professional photography lighting equipment, mirrorless camera review, photography lens guide, studio gear recommendations',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  },
  {
    name: 'Industry Trends & News',
    keywords: 'fashion photography trends 2026, luxury brand photography, editorial photography trends, beauty photography industry, high-end photography market',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&q=80',
  },
  {
    name: 'Personal Projects & Artistic Explorations',
    keywords: 'luxury fashion photographer NYC, editorial photography inspiration, behind the scenes luxury photoshoot, high-end photography portfolio, artistic photography projects',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  },
  {
    name: 'Business & Marketing Advice',
    keywords: 'photography business tips, how to attract luxury photography clients, photography pricing guide, grow photography business, photography marketing strategies NYC',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function today(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function cors(origin = '*'): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ─── Anthropic API call ───────────────────────────────────────────────────────

interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
}

async function generatePost(
  apiKey: string,
  category: { name: string; keywords: string },
  date: string
): Promise<GeneratedPost> {
  const prompt = `You are a content writer for Jeff Honforloco Photography (jeffhonforlocophotos.com), a luxury fashion, beauty, and editorial photographer based in NYC serving clients in NYC, Los Angeles, Miami, Chicago, and worldwide.

Write a high-quality, SEO-optimized blog post for the category: "${category.name}"

Target these high-ranking keywords naturally: ${category.keywords}

Requirements:
- Title: compelling, keyword-rich, 55-70 characters
- Excerpt: 160 characters max, includes the primary keyword, reads as a meta description
- Content: 900-1100 words, written in HTML using <h2>, <h3>, <p>, <ul>, <li> tags only
- Mention NYC, Los Angeles, or Miami at least twice for local SEO
- Include exactly one internal link to /contact with text "Book a Session" and one to /portfolios with text "View Portfolio"
- Written in first person as Jeff Honforloco — authoritative, luxury, professional tone
- readTime: estimate as "X min read"
- Today's date: ${date}

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "...",
  "slug": "url-friendly-slug-here",
  "excerpt": "...",
  "content": "...",
  "readTime": "X min read"
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = await res.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content[0]?.text ?? '';
  // Strip any accidental markdown code fences
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(clean) as GeneratedPost;
}

// ─── Cron: generate one post per category ────────────────────────────────────

async function runDailyGeneration(env: Env): Promise<void> {
  const date = today();

  for (const category of CATEGORIES) {
    try {
      const post = await generatePost(env.ANTHROPIC_API_KEY, category, date);

      // Ensure unique slug
      const baseSlug = post.slug || toSlug(post.title);
      const slug = `${baseSlug}-${Date.now()}`;
      const id = slug;

      await env.DB.prepare(
        `INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, category, image, date, read_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, post.title, slug, post.excerpt, post.content, category.name, category.image, date, post.readTime)
        .run();

      // Keep only the 90 most recent posts (rolling window)
      await env.DB.prepare(
        `DELETE FROM posts WHERE id NOT IN (
           SELECT id FROM posts ORDER BY created_at DESC LIMIT 90
         )`
      ).run();
    } catch {
      // Log failure for this category but continue with others
    }
  }
}

// ─── Request handler ──────────────────────────────────────────────────────────

export default {
  // Called by the cron trigger at 08:00 UTC daily
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await runDailyGeneration(env);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = { ...cors(), 'Content-Type': 'application/json' };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // GET /api/journal/posts?category=X&limit=N&offset=N
    if (request.method === 'GET' && url.pathname === '/api/journal/posts') {
      const category = url.searchParams.get('category');
      const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50);
      const offset = Number(url.searchParams.get('offset') ?? '0');

      const where = category ? 'WHERE category = ?' : '';
      const params: (string | number)[] = category
        ? [category, limit, offset]
        : [limit, offset];

      const [postsResult, categoriesResult] = await Promise.all([
        env.DB.prepare(
          `SELECT id, title, slug, excerpt, category, image, date, read_time as readTime
           FROM posts ${where}
           ORDER BY created_at DESC LIMIT ? OFFSET ?`
        )
          .bind(...params)
          .all(),
        env.DB.prepare('SELECT DISTINCT category FROM posts ORDER BY category')
          .all(),
      ]);

      const posts = postsResult.results ?? [];
      const categories = (categoriesResult.results ?? []).map(
        (r) => (r as { category: string }).category
      );

      return new Response(JSON.stringify({ posts, categories }), { headers });
    }

    // GET /api/journal/posts/:id
    if (request.method === 'GET' && url.pathname.startsWith('/api/journal/posts/')) {
      const id = url.pathname.replace('/api/journal/posts/', '');
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers });

      const result = await env.DB.prepare(
        'SELECT * FROM posts WHERE id = ? OR slug = ?'
      )
        .bind(id, id)
        .first();

      if (!result) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
      }

      return new Response(JSON.stringify(result), { headers });
    }

    // POST /api/journal/generate — manual trigger (protected)
    if (request.method === 'POST' && url.pathname === '/api/journal/generate') {
      const authHeader = request.headers.get('Authorization');
      if (authHeader !== `Bearer ${env.ANTHROPIC_API_KEY}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
      }
      await runDailyGeneration(env);
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  },
};
