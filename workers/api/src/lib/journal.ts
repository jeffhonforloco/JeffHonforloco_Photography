import type { Env } from '../types';

const CATEGORIES = [
  { name: 'Photography Tips & Techniques',             keywords: 'professional photography tips, portrait lighting, camera settings, studio setup, photography techniques' },
  { name: 'Client Preparation & Session Insights',     keywords: 'how to prepare for a photoshoot, what to wear photoshoot, luxury photoshoot preparation, model prep guide' },
  { name: 'Equipment Reviews & Recommendations',       keywords: 'best camera fashion photography, photography lighting equipment, mirrorless camera review, photography gear' },
  { name: 'Industry Trends & News',                    keywords: 'fashion photography trends 2026, luxury brand photography, editorial photography trends, beauty photography' },
  { name: 'Personal Projects & Artistic Explorations', keywords: 'luxury fashion photographer NYC, editorial photography inspiration, high-end photography portfolio NYC LA Miami' },
  { name: 'Business & Marketing Advice',               keywords: 'photography business tips, attract luxury photography clients, photography pricing guide, grow photography business' },
] as const;

// Fallback Unsplash images per category (used when no portfolio images exist in D1)
const FALLBACK_IMAGES: Record<string, string> = {
  'Photography Tips & Techniques':             'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&q=80',
  'Client Preparation & Session Insights':     'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'Equipment Reviews & Recommendations':       'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  'Industry Trends & News':                    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&q=80',
  'Personal Projects & Artistic Explorations': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'Business & Marketing Advice':               'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
};

// Maps each blog category to portfolio image category keywords for D1 lookups
const PORTFOLIO_KEYWORD_MAP: Record<string, string[]> = {
  'Photography Tips & Techniques':             ['portrait', 'studio', 'headshot'],
  'Client Preparation & Session Insights':     ['beauty', 'fashion', 'lifestyle'],
  'Equipment Reviews & Recommendations':       ['studio', 'portrait', 'headshot'],
  'Industry Trends & News':                    ['fashion', 'editorial', 'beauty'],
  'Personal Projects & Artistic Explorations': ['editorial', 'fashion', 'glamour'],
  'Business & Marketing Advice':               ['corporate', 'headshot', 'event'],
};

// Rotates daily (0=Sun … 6=Sat) so each category never repeats the same article angle
const TOPIC_ANGLES = [
  'a comprehensive step-by-step guide with actionable takeaways',
  'pro insider techniques and little-known secrets',
  'a behind-the-scenes breakdown of my creative workflow',
  'a spotlight on shooting in New York City, Los Angeles, and Miami',
  'the biggest mistakes photographers and clients make — and how to avoid them',
  '2026 trends shaping the industry right now',
  'a real portfolio breakdown with full creative context',
] as const;

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function todayAngle(): string {
  return TOPIC_ANGLES[new Date().getDay()];
}

async function fetchPortfolioImage(db: D1Database, categoryName: string): Promise<string | null> {
  const keywords = PORTFOLIO_KEYWORD_MAP[categoryName] ?? [];
  for (const kw of keywords) {
    const row = await db
      .prepare(`SELECT image_url FROM portfolio_images WHERE category LIKE ? AND image_url IS NOT NULL ORDER BY is_featured DESC LIMIT 1`)
      .bind(`%${kw}%`)
      .first<{ image_url: string }>();
    if (row?.image_url) return row.image_url;
  }
  // Fall back to any featured portfolio image
  const featured = await db
    .prepare(`SELECT image_url FROM portfolio_images WHERE is_featured = 1 AND image_url IS NOT NULL LIMIT 1`)
    .first<{ image_url: string }>();
  return featured?.image_url ?? null;
}

interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  tags?: string;
}

async function generatePost(
  apiKey: string,
  category: typeof CATEGORIES[number],
  date: string,
  angle: string,
): Promise<GeneratedPost> {
  const prompt = `You are a content strategist and writer for Jeff Honforloco Photography (jeffhonforlocophotos.com). Jeff is a luxury fashion, beauty, and portrait photographer based in Providence, RI, serving clients in New York City, Los Angeles, Miami, and worldwide.

Write a high-quality, SEO-optimised blog article for the category: "${category.name}"
Today's topic angle: ${angle}
Target keywords: ${category.keywords}
Date context: ${date}

STRICT REQUIREMENTS:

Title: 55–70 characters, keyword-rich, naturally reflects the topic angle
Excerpt: ≤160 characters — compelling meta description, no filler
Tags: 5–8 comma-separated SEO tags relevant to the article
readTime: "X min read"

Content: 1,400–1,600 words of clean HTML using only: <h2> <h3> <p> <ul> <li> <strong> <em>
- Written first-person as Jeff, warm and authoritative tone throughout
- Mention NYC, Los Angeles, and Miami at least 3 times total across the article
- Mention Providence, RI at least once as home base
- 4–5 H2 sections with specific, descriptive headings (never use generic labels like "Introduction" or "Conclusion")
- At least 2 H3 subsections nested under one H2
- One numbered or bulleted practical tips block inside the article body
- One internal link exactly: <a href="/contact">Book a Session with Jeff</a>
- One internal link exactly: <a href="/portfolios">View Jeff's Portfolio</a>
- Strong, specific call-to-action paragraph as the second-to-last content block (before the FAQ)

Mandatory final section — MUST be present and MUST be the very last thing in the content:
<h2>Frequently Asked Questions</h2>
Exactly 5 Q&As. Each question as <h3>, each answer as <p>. Write answers that directly target Google featured snippets and voice search — clear, 2–3 sentence answers that restate the question keyword in the answer.

Return ONLY valid JSON with no markdown fences and no trailing commas:
{"title":"...","slug":"url-slug-here","excerpt":"...","tags":"tag1, tag2, tag3","content":"...","readTime":"X min read"}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 3200, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  const text = (data.choices[0]?.message?.content ?? '').replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(text) as GeneratedPost;
}

export async function generateDailyPosts(env: Env): Promise<void> {
  const date = todayLabel();
  const angle = todayAngle();

  for (const cat of CATEGORIES) {
    try {
      const [post, portfolioImage] = await Promise.all([
        generatePost(env.OPENAI_API_KEY, cat, date, angle),
        fetchPortfolioImage(env.DB, cat.name),
      ]);

      const featuredImage = portfolioImage ?? FALLBACK_IMAGES[cat.name] ?? '';
      const baseSlug = post.slug || slug(post.title);
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      await env.DB.prepare(
        `INSERT OR IGNORE INTO blog_posts (title, slug, content, excerpt, featured_image_url, category, status, read_time, tags, published_at)
         VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, datetime('now'))`
      ).bind(post.title, uniqueSlug, post.content, post.excerpt, featuredImage, cat.name, post.readTime, post.tags ?? null).run();

      // Rolling 126-post window (6 categories × 21 days of variety)
      await env.DB.prepare(
        `DELETE FROM blog_posts WHERE id NOT IN (SELECT id FROM blog_posts ORDER BY created_at DESC LIMIT 126)`
      ).run();
    } catch {
      // continue with other categories on individual failure
    }
  }
}
