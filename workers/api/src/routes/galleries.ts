import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { hashPassword, verifyPassword } from '../lib/crypto';
import type { AppEnv } from '../types';

const galleries = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Schema (D1)                                                         */
/* ------------------------------------------------------------------ */

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS galleries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      client_name TEXT,
      client_email TEXT,
      password_hash TEXT,
      password_salt TEXT,
      expires_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
      r2_key TEXT NOT NULL,
      r2_thumb_key TEXT,
      title TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS gallery_selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
      photo_id INTEGER NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
      client_name TEXT,
      client_email TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(gallery_id, photo_id, client_email)
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery ON gallery_photos(gallery_id, sort_order)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_gallery_selections_gallery ON gallery_selections(gallery_id)`),
  ]);
  // Migration: thumbnail key for photos uploaded before WebP/thumbnail support.
  await db.prepare(`ALTER TABLE gallery_photos ADD COLUMN r2_thumb_key TEXT`).run().catch(() => {});
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,60}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeSlug(title: string): string {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'gallery';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

function isExpired(g: { expires_at?: string | null; is_active?: number }): boolean {
  if (g.is_active === 0) return true;
  if (g.expires_at && new Date(g.expires_at).getTime() < Date.now()) return true;
  return false;
}

function photoUrl(c: { req: { url: string } }, key: string) {
  const url = new URL(c.req.url);
  return `${url.origin}/api/v1/admin/media/file/${encodeURIComponent(key)}`;
}

type GalleryRow = {
  id: number; slug: string; title: string; client_name: string | null;
  client_email: string | null; password_hash: string | null; password_salt: string | null;
  expires_at: string | null; is_active: number; created_at: string; updated_at: string;
};

async function getGallery(db: D1Database, slug: string): Promise<GalleryRow | null> {
  if (!SLUG_RE.test(slug)) return null;
  return db.prepare('SELECT * FROM galleries WHERE slug = ?').bind(slug).first<GalleryRow>();
}

async function checkPassword(g: GalleryRow, password: string | null): Promise<boolean> {
  if (!g.password_hash) return true; // no password set
  if (!password) return false;
  return verifyPassword(password, g.password_hash, g.password_salt || '');
}

/* ------------------------------------------------------------------ */
/* ADMIN routes                                                        */
/* ------------------------------------------------------------------ */

galleries.get('/', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const rows = await c.env.DB.prepare(
    `SELECT g.*, 
      (SELECT COUNT(*) FROM gallery_photos p WHERE p.gallery_id = g.id) AS photo_count,
      (SELECT COUNT(*) FROM gallery_selections s WHERE s.gallery_id = g.id) AS selection_count
     FROM galleries g ORDER BY g.created_at DESC LIMIT 200`
  ).all();
  const items = (rows.results as Array<GalleryRow & { photo_count: number; selection_count: number }>).map((g) => ({
    id: g.id, slug: g.slug, title: g.title,
    client_name: g.client_name, client_email: g.client_email,
    has_password: Boolean(g.password_hash),
    expires_at: g.expires_at, is_active: g.is_active,
    photo_count: g.photo_count, selection_count: g.selection_count,
    share_url: `/proof/${g.slug}`,
    created_at: g.created_at,
  }));
  return c.json({ success: true, data: { galleries: items } });
});

galleries.post('/', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const body = await c.req.json<{
    title?: string; client_name?: string; client_email?: string;
    password?: string; expires_at?: string;
  }>().catch(() => ({}));

  const title = (body.title || '').trim();
  if (!title) return c.json({ error: 'Title is required' }, 400);
  if (body.client_email && !EMAIL_RE.test(body.client_email)) {
    return c.json({ error: 'Invalid client email' }, 400);
  }

  let password_hash: string | null = null;
  let password_salt: string | null = null;
  if (body.password) {
    const { hash, salt } = await hashPassword(body.password);
    password_hash = hash;
    password_salt = salt;
  }

  const slug = makeSlug(title);
  const result = await c.env.DB.prepare(
    `INSERT INTO galleries (slug, title, client_name, client_email, password_hash, password_salt, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    slug, title,
    (body.client_name || '').trim() || null,
    (body.client_email || '').trim() || null,
    password_hash, password_salt,
    body.expires_at || null,
  ).run();

  return c.json({
    success: true,
    data: { id: result.meta.last_row_id, slug, title, share_url: `/proof/${slug}` },
  });
});

galleries.get('/:id', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const g = await c.env.DB.prepare('SELECT * FROM galleries WHERE id = ?').bind(id).first<GalleryRow>();
  if (!g) return c.json({ error: 'Gallery not found' }, 404);
  const photos = await c.env.DB.prepare(
    'SELECT id, r2_key, r2_thumb_key, title, sort_order, created_at FROM gallery_photos WHERE gallery_id = ? ORDER BY sort_order, id'
  ).bind(id).all();
  return c.json({
    success: true,
    data: {
      gallery: {
        id: g.id, slug: g.slug, title: g.title,
        client_name: g.client_name, client_email: g.client_email,
        has_password: Boolean(g.password_hash),
        expires_at: g.expires_at, is_active: g.is_active,
        share_url: `/proof/${g.slug}`, created_at: g.created_at,
      },
      photos: (photos.results as Array<{ id: number; r2_key: string; r2_thumb_key: string | null; title: string | null; sort_order: number; created_at: string }>)
        .map((p) => ({ ...p, url: photoUrl(c, p.r2_key), thumbnail_url: p.r2_thumb_key ? photoUrl(c, p.r2_thumb_key) : null })),
    },
  });
});

galleries.put('/:id', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{
    title?: string; client_name?: string; client_email?: string;
    password?: string | null; expires_at?: string | null; is_active?: boolean;
  }>().catch(() => ({}));

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.title !== undefined) { sets.push('title = ?'); vals.push(body.title.trim()); }
  if (body.client_name !== undefined) { sets.push('client_name = ?'); vals.push(body.client_name.trim() || null); }
  if (body.client_email !== undefined) {
    if (body.client_email && !EMAIL_RE.test(body.client_email)) return c.json({ error: 'Invalid client email' }, 400);
    sets.push('client_email = ?'); vals.push(body.client_email.trim() || null);
  }
  if (body.password !== undefined) {
    if (body.password) {
      const { hash, salt } = await hashPassword(body.password);
      sets.push('password_hash = ?', 'password_salt = ?'); vals.push(hash, salt);
    } else {
      sets.push('password_hash = NULL', 'password_salt = NULL');
    }
  }
  if (body.expires_at !== undefined) { sets.push('expires_at = ?'); vals.push(body.expires_at || null); }
  if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
  if (sets.length === 0) return c.json({ error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  await c.env.DB.prepare(`UPDATE galleries SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
  return c.json({ success: true });
});

galleries.delete('/:id', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const id = Number(c.req.param('id'));

  // Delete R2 objects first (best effort)
  if (c.env.MEDIA_BUCKET) {
    const photos = await c.env.DB.prepare('SELECT r2_key, r2_thumb_key FROM gallery_photos WHERE gallery_id = ?').bind(id).all();
    for (const p of (photos.results as Array<{ r2_key: string; r2_thumb_key: string | null }>)) {
      await c.env.MEDIA_BUCKET.delete(p.r2_key).catch(() => {});
      if (p.r2_thumb_key) await c.env.MEDIA_BUCKET.delete(p.r2_thumb_key).catch(() => {});
    }
  }
  await c.env.DB.prepare('DELETE FROM gallery_selections WHERE gallery_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM gallery_photos WHERE gallery_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM galleries WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

/* Upload shoot photos to a gallery (multipart → R2) */
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_BYTES = 15 * 1024 * 1024;

galleries.post('/:id/photos', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  if (!c.env.MEDIA_BUCKET) return c.json({ error: 'Media storage (R2) is not configured' }, 500);
  const id = Number(c.req.param('id'));
  const g = await c.env.DB.prepare('SELECT id FROM galleries WHERE id = ?').bind(id).first();
  if (!g) return c.json({ error: 'Gallery not found' }, 404);

  const form = await c.req.formData().catch(() => null);
  const files = form ? form.getAll('images').concat(form.getAll('image')) : [];
  const thumbs = form ? form.getAll('thumbnails') : []; // paired with `images` by index
  const valid = (files as unknown[]).filter((f): f is File => f instanceof File && ALLOWED_TYPES.has(f.type) && f.size <= MAX_BYTES);
  if (valid.length === 0) return c.json({ error: 'No valid image files provided' }, 400);
  if (valid.length > 20) return c.json({ error: 'Max 20 photos per upload' }, 400);

  const maxOrder = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery_photos WHERE gallery_id = ?').bind(id).first<{ m: number }>();
  let order = (maxOrder?.m ?? -1) + 1;
  const added: Array<{ id: number; url: string; thumbnail_url: string | null }> = [];

  for (let i = 0; i < valid.length; i++) {
    const file = valid[i];
    const thumbRaw = thumbs[i];
    const thumb = thumbRaw instanceof File && ALLOWED_TYPES.has(thumbRaw.type) && thumbRaw.size <= MAX_BYTES ? thumbRaw : null;

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const base = `galleries/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const key = `${base}.${ext}`;
    await c.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { galleryId: String(id) },
    });

    let thumbKey: string | null = null;
    if (thumb) {
      const text = (thumb.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
      thumbKey = `${base}-thumb.${text}`;
      await c.env.MEDIA_BUCKET.put(thumbKey, await thumb.arrayBuffer(), {
        httpMetadata: { contentType: thumb.type },
        customMetadata: { galleryId: String(id), parent: key },
      });
    }

    const r = await c.env.DB.prepare(
      'INSERT INTO gallery_photos (gallery_id, r2_key, r2_thumb_key, title, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, key, thumbKey, file.name.replace(/\.[^.]+$/, '').slice(0, 120), order++).run();
    added.push({ id: Number(r.meta.last_row_id), url: photoUrl(c, key), thumbnail_url: thumbKey ? photoUrl(c, thumbKey) : null });
  }

  return c.json({ success: true, data: { added, count: added.length } });
});

galleries.delete('/:id/photos/:photoId', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const photoId = Number(c.req.param('photoId'));
  const p = await c.env.DB.prepare('SELECT r2_key, r2_thumb_key FROM gallery_photos WHERE id = ? AND gallery_id = ?').bind(photoId, id).first<{ r2_key: string; r2_thumb_key: string | null }>();
  if (!p) return c.json({ error: 'Photo not found' }, 404);
  if (c.env.MEDIA_BUCKET) {
    await c.env.MEDIA_BUCKET.delete(p.r2_key).catch(() => {});
    if (p.r2_thumb_key) await c.env.MEDIA_BUCKET.delete(p.r2_thumb_key).catch(() => {});
  }
  await c.env.DB.prepare('DELETE FROM gallery_selections WHERE photo_id = ?').bind(photoId).run();
  await c.env.DB.prepare('DELETE FROM gallery_photos WHERE id = ?').bind(photoId).run();
  return c.json({ success: true });
});

/* Jeff views what the client selected */
galleries.get('/:id/selections', requireAuth, requireAdmin, async (c) => {
  await ensureSchema(c.env.DB);
  const id = Number(c.req.param('id'));
  const rows = await c.env.DB.prepare(
    `SELECT s.id, s.photo_id, s.client_name, s.client_email, s.note, s.created_at,
            p.r2_key, p.title AS photo_title
     FROM gallery_selections s
     JOIN gallery_photos p ON p.id = s.photo_id
     WHERE s.gallery_id = ? ORDER BY s.created_at DESC`
  ).bind(id).all();
  const items = (rows.results as Array<Record<string, unknown>>).map((s) => ({
    ...s, photo_url: photoUrl(c, String(s.r2_key)),
  }));
  return c.json({ success: true, data: { selections: items, count: items.length } });
});

/* ------------------------------------------------------------------ */
/* PUBLIC proofing routes (no auth — slug + optional password)         */
/* ------------------------------------------------------------------ */

const proof = new Hono<AppEnv>();

proof.get('/:slug', async (c) => {
  await ensureSchema(c.env.DB);
  const g = await getGallery(c.env.DB, c.req.param('slug'));
  if (!g || isExpired(g)) return c.json({ error: 'Gallery not found or expired' }, 404);

  const password = c.req.query('password') || null;
  if (!(await checkPassword(g, password))) {
    return c.json({ success: true, data: { passwordRequired: true, title: g.title } });
  }

  const photos = await c.env.DB.prepare(
    'SELECT id, r2_key, r2_thumb_key, title FROM gallery_photos WHERE gallery_id = ? ORDER BY sort_order, id'
  ).bind(g.id).all();
  const selections = await c.env.DB.prepare(
    'SELECT photo_id FROM gallery_selections WHERE gallery_id = ?'
  ).bind(g.id).all();

  return c.json({
    success: true,
    data: {
      title: g.title,
      client_name: g.client_name,
      photos: (photos.results as Array<{ id: number; r2_key: string; r2_thumb_key: string | null; title: string | null }>)
        .map((p) => ({
          id: p.id,
          title: p.title,
          url: photoUrl(c, p.r2_key),
          thumbnail_url: p.r2_thumb_key ? photoUrl(c, p.r2_thumb_key) : null,
        })),
      selected_photo_ids: (selections.results as Array<{ photo_id: number }>).map((s) => s.photo_id),
    },
  });
});

/* Client marks a favorite */
proof.post('/:slug/select', async (c) => {
  await ensureSchema(c.env.DB);
  const g = await getGallery(c.env.DB, c.req.param('slug'));
  if (!g || isExpired(g)) return c.json({ error: 'Gallery not found or expired' }, 404);

  const body = await c.req.json<{
    photo_id?: number; client_name?: string; client_email?: string; note?: string; password?: string;
  }>().catch(() => ({}));
  if (!(await checkPassword(g, body.password || c.req.query('password') || null))) {
    return c.json({ error: 'Password required' }, 401);
  }

  const photoId = Number(body.photo_id);
  if (!photoId) return c.json({ error: 'photo_id is required' }, 400);
  const photo = await c.env.DB.prepare('SELECT id FROM gallery_photos WHERE id = ? AND gallery_id = ?').bind(photoId, g.id).first();
  if (!photo) return c.json({ error: 'Photo not found in this gallery' }, 404);

  const email = (body.client_email || '').trim() || null;
  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO gallery_selections (gallery_id, photo_id, client_name, client_email, note)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(g.id, photoId, (body.client_name || '').trim() || null, email, (body.note || '').trim() || null).run();

  return c.json({ success: true });
});

/* Client un-marks a favorite */
proof.delete('/:slug/select/:photoId', async (c) => {
  await ensureSchema(c.env.DB);
  const g = await getGallery(c.env.DB, c.req.param('slug'));
  if (!g || isExpired(g)) return c.json({ error: 'Gallery not found or expired' }, 404);

  const password = c.req.query('password') || null;
  if (!(await checkPassword(g, password))) return c.json({ error: 'Password required' }, 401);

  const photoId = Number(c.req.param('photoId'));
  const email = c.req.query('email') || null;
  if (email) {
    await c.env.DB.prepare('DELETE FROM gallery_selections WHERE gallery_id = ? AND photo_id = ? AND client_email = ?')
      .bind(g.id, photoId, email).run();
  } else {
    await c.env.DB.prepare('DELETE FROM gallery_selections WHERE gallery_id = ? AND photo_id = ?')
      .bind(g.id, photoId).run();
  }
  return c.json({ success: true });
});

export { galleries, proof };
