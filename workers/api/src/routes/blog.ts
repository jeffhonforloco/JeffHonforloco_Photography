import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const blog = new Hono<AppEnv>();

// GET /api/v1/blog — public paginated posts
blog.get('/', async (c) => {
  const page     = Math.max(1, Number(c.req.query('page') ?? 1));
  const limit    = Math.min(50, Number(c.req.query('limit') ?? 20));
  const offset   = (page - 1) * limit;
  const category = c.req.query('category');
  const search   = c.req.query('search');
  const status   = c.req.query('status') ?? 'published';

  let where = 'WHERE status = ?';
  const params: (string | number)[] = [status];
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (search)   { where += ' AND (title LIKE ? OR excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows, total, cats] = await Promise.all([
    c.env.DB.prepare(`SELECT id, title, slug, excerpt, featured_image_url, category, read_time, published_at, created_at
                      FROM blog_posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...params, limit, offset).all(),
    c.env.DB.prepare(`SELECT COUNT(*) as n FROM blog_posts ${where}`).bind(...params).first<{ n: number }>(),
    c.env.DB.prepare(`SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category`).all(),
  ]);

  const categories = (cats.results ?? []).map((r) => (r as { category: string }).category);
  return c.json({
    success: true,
    posts: rows.results,
    data: rows.results,
    categories,
    total: total?.n ?? 0,
    page,
    limit,
  });
});

// GET /api/v1/blog/slug/:slug — single post by slug (public)
blog.get('/slug/:slug', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'`
  ).bind(c.req.param('slug')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, post: row, data: row });
});

// GET /api/v1/blog/:id — single post by ID (auth required)
blog.get('/:id', requireAuth, async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, post: row, data: row });
});

// POST /api/v1/blog — create post (auth required)
blog.post('/', requireAuth, async (c) => {
  const body = await c.req.json<{
    title: string; slug: string; content: string; excerpt?: string;
    featured_image_url?: string; category?: string; status?: string;
    read_time?: string; tags?: string;
  }>();
  if (!body.title || !body.slug || !body.content) return c.json({ error: 'title, slug, content required' }, 400);

  const result = await c.env.DB.prepare(
    `INSERT INTO blog_posts (title, slug, content, excerpt, featured_image_url, category, status, read_time, tags, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END)`
  ).bind(
    body.title, body.slug, body.content, body.excerpt ?? null, body.featured_image_url ?? null,
    body.category ?? 'Photography Tips & Techniques', body.status ?? 'draft',
    body.read_time ?? '5 min read', body.tags ?? null, body.status ?? 'draft'
  ).run();

  return c.json({ ok: true, success: true, id: result.meta.last_row_id, data: { id: result.meta.last_row_id } }, 201);
});

// PUT /api/v1/blog/:id — update post (auth required)
blog.put('/:id', requireAuth, async (c) => {
  const body = await c.req.json<{
    title?: string; content?: string; excerpt?: string; featured_image_url?: string;
    category?: string; status?: string; read_time?: string; tags?: string;
  }>();
  await c.env.DB.prepare(
    `UPDATE blog_posts SET
      title              = COALESCE(?, title),
      content            = COALESCE(?, content),
      excerpt            = COALESCE(?, excerpt),
      featured_image_url = COALESCE(?, featured_image_url),
      category           = COALESCE(?, category),
      status             = COALESCE(?, status),
      read_time          = COALESCE(?, read_time),
      tags               = COALESCE(?, tags),
      published_at       = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END,
      updated_at         = datetime('now')
     WHERE id = ?`
  ).bind(
    body.title ?? null, body.content ?? null, body.excerpt ?? null, body.featured_image_url ?? null,
    body.category ?? null, body.status ?? null, body.read_time ?? null, body.tags ?? null,
    body.status ?? null, c.req.param('id')
  ).run();
  return c.json({ ok: true, success: true });
});

// DELETE /api/v1/blog/:id (auth required)
blog.delete('/:id', requireAuth, async (c) => {
  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true, success: true });
});

export default blog;
