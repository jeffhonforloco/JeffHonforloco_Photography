import { Hono } from 'hono';
import type { AppEnv } from '../types';

// TEMPORARY one-time migration endpoint — DELETE THIS FILE after the
// static portfolio import has run. Guarded by a single-use secret that
// is rotated out with the file's removal.
const IMPORT_SECRET = 'IT-3DTCTzseG5p6ej6pBklgTLhHkwn0V2a0wkyz56pyeCI1YLt_jndKoCtuBNitj';

const importPortfolio = new Hono<AppEnv>();

importPortfolio.post('/import-portfolio', async (c) => {
  if (c.req.header('x-import-secret') !== IMPORT_SECRET) {
    return c.json({ error: 'forbidden' }, 403);
  }
  const items = await c.req.json<Array<{
    title: string; description?: string; image_url: string; thumbnail_url?: string | null;
    category: string; is_featured?: boolean; sort_order?: number; tags?: string | null;
  }>>();
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'expected a non-empty JSON array' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT image_url FROM portfolio_images').all();
  const seen = new Set((existing.results as Array<{ image_url: string }>).map((r) => r.image_url));

  let imported = 0;
  let skipped = 0;
  const batch: string[] = [];
  for (const it of items) {
    if (!it.title || !it.image_url || !it.category) { skipped++; continue; }
    if (seen.has(it.image_url)) { skipped++; continue; }
    seen.add(it.image_url);
    batch.push(it.image_url);
    await c.env.DB.prepare(
      `INSERT INTO portfolio_images (title, description, image_url, thumbnail_url, category, is_featured, sort_order, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      it.title,
      it.description ?? null,
      it.image_url,
      it.thumbnail_url ?? null,
      it.category,
      it.is_featured ? 1 : 0,
      it.sort_order ?? 0,
      it.tags ?? null
    ).run();
    imported++;
  }
  return c.json({ ok: true, success: true, imported, skipped });
});

export default importPortfolio;
