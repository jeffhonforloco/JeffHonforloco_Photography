import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const portfolio = new Hono<AppEnv>();

// GET /api/v1/portfolio — public paginated images
portfolio.get('/', async (c) => {
  const page     = Math.max(1, Number(c.req.query('page') ?? 1));
  const limit    = Math.min(100, Number(c.req.query('limit') ?? 50));
  const offset   = (page - 1) * limit;
  const category = c.req.query('category');
  const featured = c.req.query('featured');

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (featured === 'true') { where += ' AND is_featured = 1'; }

  const [rows, total] = await Promise.all([
    c.env.DB.prepare(`SELECT * FROM portfolio_images ${where} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`)
      .bind(...params, limit, offset).all(),
    c.env.DB.prepare(`SELECT COUNT(*) as n FROM portfolio_images ${where}`).bind(...params).first<{ n: number }>(),
  ]);
  return c.json({
    success: true,
    images: rows.results,
    data: { images: rows.results, total: total?.n ?? 0, page, limit },
    total: total?.n ?? 0,
    page,
    limit,
  });
});

// GET /api/v1/portfolio/featured
portfolio.get('/featured', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM portfolio_images WHERE is_featured = 1 ORDER BY sort_order ASC LIMIT 20`
  ).all();
  return c.json({ success: true, images: rows.results, data: { images: rows.results } });
});

// GET /api/v1/portfolio/categories
portfolio.get('/categories', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT category, COUNT(*) as count FROM portfolio_images GROUP BY category ORDER BY category`
  ).all();
  return c.json({ success: true, categories: rows.results, data: { categories: rows.results } });
});

// GET /api/v1/portfolio/category/:category
portfolio.get('/category/:category', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM portfolio_images WHERE category = ? ORDER BY sort_order ASC, created_at DESC`
  ).bind(c.req.param('category')).all();
  return c.json({ success: true, images: rows.results, data: { images: rows.results } });
});

// POST /api/v1/portfolio — create (auth required)
portfolio.post('/', requireAuth, async (c) => {
  const body = await c.req.json<{
    title: string; image_url: string; category: string;
    description?: string; thumbnail_url?: string;
    is_featured?: boolean; sort_order?: number; tags?: string;
  }>();
  if (!body.title || !body.image_url || !body.category) return c.json({ error: 'title, image_url, category required' }, 400);

  const result = await c.env.DB.prepare(
    `INSERT INTO portfolio_images (title, description, image_url, thumbnail_url, category, is_featured, sort_order, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.title, body.description ?? null, body.image_url, body.thumbnail_url ?? null,
    body.category, body.is_featured ? 1 : 0, body.sort_order ?? 0, body.tags ?? null
  ).run();
  return c.json({ ok: true, success: true, id: result.meta.last_row_id, data: { id: result.meta.last_row_id } }, 201);
});

// PUT /api/v1/portfolio/:id (auth required)
portfolio.put('/:id', requireAuth, async (c) => {
  const body = await c.req.json<{
    title?: string; description?: string; image_url?: string; thumbnail_url?: string;
    category?: string; is_featured?: boolean; sort_order?: number; tags?: string;
  }>();
  await c.env.DB.prepare(
    `UPDATE portfolio_images SET
      title         = COALESCE(?, title),
      description   = COALESCE(?, description),
      image_url     = COALESCE(?, image_url),
      thumbnail_url = COALESCE(?, thumbnail_url),
      category      = COALESCE(?, category),
      is_featured   = COALESCE(?, is_featured),
      sort_order    = COALESCE(?, sort_order),
      tags          = COALESCE(?, tags),
      updated_at    = datetime('now')
     WHERE id = ?`
  ).bind(
    body.title ?? null, body.description ?? null, body.image_url ?? null, body.thumbnail_url ?? null,
    body.category ?? null, body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : null,
    body.sort_order ?? null, body.tags ?? null, c.req.param('id')
  ).run();
  return c.json({ ok: true, success: true });
});

// DELETE /api/v1/portfolio/:id (auth required)
portfolio.delete('/:id', requireAuth, async (c) => {
  await c.env.DB.prepare('DELETE FROM portfolio_images WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true, success: true });
});

// TEMPORARY ONE-TIME endpoint: bulk-remove recently added portfolio images.
// Protected by a one-time secret. REMOVE AFTER USE.
const ONE_TIME_CLEANUP_SECRET = '5c55b9e82c6720f9cc1e3d251d165ddc74515fc66b2cb870';
portfolio.post('/one-time-cleanup', async (c) => {
  const { secret, ids } = await c.req.json<{ secret: string; ids: number[] }>();
  if (secret !== ONE_TIME_CLEANUP_SECRET) return c.json({ error: 'Forbidden' }, 403);
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200) {
    return c.json({ error: 'ids must be a non-empty array (max 200)' }, 400);
  }
  const clean = ids.filter((n) => Number.isInteger(n) && n > 0);
  const stmt = c.env.DB.prepare('DELETE FROM portfolio_images WHERE id = ?');
  const batch = clean.map((id) => stmt.bind(id));
  await c.env.DB.batch(batch);
  const remaining = await c.env.DB.prepare(
    'SELECT COUNT(*) n FROM portfolio_images'
  ).first<{ n: number }>();
  return c.json({ ok: true, success: true, deleted: clean.length, remaining: remaining?.n ?? -1 });
});

export default portfolio;
