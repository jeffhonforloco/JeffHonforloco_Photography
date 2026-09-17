import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

const pages = new Hono<AppEnv>();
const publicPages = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Schema (D1)                                                         */
/* ------------------------------------------------------------------ */

export async function ensurePagesSchema(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL DEFAULT '[]',
    meta_description TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`).run();
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;
const BLOCK_TYPES = new Set(['hero', 'text', 'image', 'gallery', 'cta']);

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'page';
}

function validateBlocks(input: unknown): { ok: true; blocks: unknown[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: 'content must be an array of blocks' };
  if (input.length > 50) return { ok: false, error: 'Too many blocks (max 50)' };
  for (let i = 0; i < input.length; i++) {
    const b = input[i] as Record<string, unknown>;
    if (!b || typeof b !== 'object' || !BLOCK_TYPES.has(String(b.type))) {
      return { ok: false, error: `Block ${i}: unknown type` };
    }
    const str = (v: unknown) => (typeof v === 'string' ? v.slice(0, 5000) : '');
    if (b.type === 'hero' && !str(b.heading)) return { ok: false, error: `Block ${i}: hero needs a heading` };
    if (b.type === 'text' && !str(b.body)) return { ok: false, error: `Block ${i}: text needs a body` };
    if (b.type === 'image' && !str(b.imageUrl)) return { ok: false, error: `Block ${i}: image needs an imageUrl` };
    if (b.type === 'gallery') {
      if (!Array.isArray(b.imageUrls) || b.imageUrls.length === 0) return { ok: false, error: `Block ${i}: gallery needs imageUrls` };
      if (b.imageUrls.length > 30) return { ok: false, error: `Block ${i}: gallery max 30 images` };
    }
    if (b.type === 'cta' && (!str(b.buttonText) || !str(b.buttonUrl))) {
      return { ok: false, error: `Block ${i}: cta needs buttonText and buttonUrl` };
    }
  }
  return { ok: true, blocks: input };
}

/* Reserved slugs that collide with app routes */
const RESERVED = new Set([
  'admin', 'api', 'book', 'contact', 'pricing', 'about', 'services',
  'journal', 'portfolios', 'portfolio', 'motion', 'privacy', 'dashboard',
  'proof', 'login', 'prep-guide',
]);

/* ------------------------------------------------------------------ */
/* ADMIN routes                                                        */
/* ------------------------------------------------------------------ */

pages.get('/', requireAuth, requireAdmin, async (c) => {
  await ensurePagesSchema(c.env.DB);
  const rows = await c.env.DB.prepare(
    'SELECT id, slug, title, is_published, updated_at, created_at FROM pages ORDER BY updated_at DESC LIMIT 200'
  ).all();
  return c.json({ success: true, data: { pages: rows.results } });
});

pages.post('/', requireAuth, requireAdmin, async (c) => {
  await ensurePagesSchema(c.env.DB);
  const body = await c.req.json<{
    title?: string; slug?: string; content?: unknown[];
    meta_description?: string; is_published?: boolean;
  }>().catch(() => ({}));

  const title = (body.title || '').trim();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  const slug = (body.slug || '').trim() ? (body.slug as string).trim().toLowerCase() : slugify(title);
  if (!SLUG_RE.test(slug)) return c.json({ error: 'Slug must be lowercase letters, numbers, dashes' }, 400);
  if (RESERVED.has(slug)) return c.json({ error: `"${slug}" is reserved — pick another slug` }, 400);

  const v = validateBlocks(body.content ?? []);
  if (!v.ok) return c.json({ error: v.error }, 400);

  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO pages (slug, title, content_json, meta_description, is_published)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(slug, title, JSON.stringify(v.blocks), (body.meta_description || '').slice(0, 300) || null, body.is_published ? 1 : 0).run();
    return c.json({ success: true, data: { id: r.meta.last_row_id, slug, url: `/${slug}` } });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'That slug is already taken' }, 409);
    throw e;
  }
});

pages.get('/:id', requireAuth, requireAdmin, async (c) => {
  await ensurePagesSchema(c.env.DB);
  const row = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(Number(c.req.param('id'))).first();
  if (!row) return c.json({ error: 'Page not found' }, 404);
  const r = row as Record<string, unknown>;
  return c.json({
    success: true,
    data: { ...r, content: JSON.parse(String(r.content_json || '[]')), url: `/${r.slug}` },
  });
});

pages.put('/:id', requireAuth, requireAdmin, async (c) => {
  await ensurePagesSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{
    title?: string; slug?: string; content?: unknown[];
    meta_description?: string; is_published?: boolean;
  }>().catch(() => ({}));

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.title !== undefined) {
    if (!body.title.trim()) return c.json({ error: 'Title cannot be empty' }, 400);
    sets.push('title = ?'); vals.push(body.title.trim());
  }
  if (body.slug !== undefined) {
    const slug = body.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug)) return c.json({ error: 'Invalid slug' }, 400);
    if (RESERVED.has(slug)) return c.json({ error: `"${slug}" is reserved` }, 400);
    sets.push('slug = ?'); vals.push(slug);
  }
  if (body.content !== undefined) {
    const v = validateBlocks(body.content);
    if (!v.ok) return c.json({ error: v.error }, 400);
    sets.push('content_json = ?'); vals.push(JSON.stringify(v.blocks));
  }
  if (body.meta_description !== undefined) { sets.push('meta_description = ?'); vals.push(body.meta_description.slice(0, 300) || null); }
  if (body.is_published !== undefined) { sets.push('is_published = ?'); vals.push(body.is_published ? 1 : 0); }
  if (sets.length === 0) return c.json({ error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  try {
    await c.env.DB.prepare(`UPDATE pages SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
  } catch (e) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'That slug is already taken' }, 409);
    throw e;
  }
  return c.json({ success: true });
});

pages.delete('/:id', requireAuth, requireAdmin, async (c) => {
  await ensurePagesSchema(c.env.DB);
  await c.env.DB.prepare('DELETE FROM pages WHERE id = ?').bind(Number(c.req.param('id'))).run();
  return c.json({ success: true });
});

/* ------------------------------------------------------------------ */
/* PUBLIC route                                                        */
/* ------------------------------------------------------------------ */

publicPages.get('/:slug', async (c) => {
  await ensurePagesSchema(c.env.DB);
  const slug = c.req.param('slug').toLowerCase();
  if (!SLUG_RE.test(slug)) return c.json({ error: 'Not found' }, 404);
  const row = await c.env.DB.prepare(
    'SELECT slug, title, content_json, meta_description, updated_at FROM pages WHERE slug = ? AND is_published = 1'
  ).bind(slug).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({
    success: true,
    data: {
      slug: row.slug, title: row.title,
      meta_description: row.meta_description,
      content: JSON.parse(String(row.content_json || '[]')),
      updated_at: row.updated_at,
    },
  });
});

export { pages, publicPages };
