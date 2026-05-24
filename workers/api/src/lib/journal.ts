import type { Env } from '../types';

const CATEGORIES = [
  { name: 'Photography Tips & Techniques',          keywords: 'professional photography tips, portrait lighting, camera settings, studio setup, photography techniques' },
  { name: 'Client Preparation & Session Insights',  keywords: 'how to prepare for a photoshoot, what to wear photoshoot, luxury photoshoot preparation, model prep guide' },
  { name: 'Equipment Reviews & Recommendations',    keywords: 'best camera fashion photography, photography lighting equipment, mirrorless camera review, photography gear' },
  { name: 'Industry Trends & News',                 keywords: 'fashion photography trends 2026, luxury brand photography, editorial photography trends, beauty photography' },
  { name: 'Personal Projects & Artistic Explorations', keywords: 'luxury fashion photographer NYC, editorial photography inspiration, high-end photography portfolio NYC LA Miami' },
  { name: 'Business & Marketing Advice',            keywords: 'photography business tips, attract luxury photography clients, photography pricing guide, grow photography business' },
] as const;

const IMAGES: Record<string, string> = {
  'Photography Tips & Techniques':           'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&q=80',
  'Client Preparation & Session Insights':   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'Equipment Reviews & Recommendations':     'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  'Industry Trends & News':                  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&q=80',
  'Personal Projects & Artistic Explorations': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'Business & Marketing Advice':             'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
};

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface GeneratedPost {
  title: string; slug: string; excerpt: string; content: string; readTime: string;
}

async function generatePost(apiKey: string, category: typeof CATEGORIES[number], date: string): Promise<GeneratedPost> {
  const prompt = `You are a content writer for Jeff Honforloco Photography (jeffhonforlocophotos.com), a luxury fashion and beauty photographer serving NYC, Los Angeles, Miami, and worldwide.

Write an SEO-optimised blog post for category: "${category.name}"
Target keywords: ${category.keywords}

Requirements:
- Title: 55-70 chars, keyword-rich
- Excerpt: ≤160 chars, reads as a meta description
- Content: 900-1100 words, HTML only (<h2> <h3> <p> <ul> <li>), first-person as Jeff
- Mention NYC, LA, or Miami at least twice
- One internal link: <a href="/contact">Book a Session</a>
- One internal link: <a href="/portfolios">View Portfolio</a>
- readTime: "X min read"
- Date context: ${date}

Return ONLY valid JSON, no markdown fences:
{"title":"...","slug":"url-slug","excerpt":"...","content":"...","readTime":"X min read"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json() as { content: Array<{ text: string }> };
  const text = (data.content[0]?.text ?? '').replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(text) as GeneratedPost;
}

export async function generateDailyPosts(env: Env): Promise<void> {
  const date = todayLabel();

  for (const cat of CATEGORIES) {
    try {
      const post = await generatePost(env.ANTHROPIC_API_KEY, cat, date);
      const baseSlug = post.slug || slug(post.title);
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      await env.DB.prepare(
        `INSERT OR IGNORE INTO blog_posts (title, slug, content, excerpt, featured_image_url, category, status, read_time, published_at)
         VALUES (?, ?, ?, ?, ?, ?, 'published', ?, datetime('now'))`
      ).bind(post.title, uniqueSlug, post.content, post.excerpt, IMAGES[cat.name] ?? '', cat.name, post.readTime).run();

      // Rolling 90-post window
      await env.DB.prepare(
        `DELETE FROM blog_posts WHERE id NOT IN (SELECT id FROM blog_posts ORDER BY created_at DESC LIMIT 90)`
      ).run();
    } catch {
      // continue with other categories on individual failure
    }
  }
}
