import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

const media = new Hono<AppEnv>();

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,180}$/;

function r2Configured(env: AppEnv['Bindings']) {
  return Boolean(env.MEDIA_BUCKET);
}

function publicUrl(c: { req: { url: string } }, key: string) {
  // Served via the worker itself at /api/v1/admin/media/file/:key
  const url = new URL(c.req.url);
  return `${url.origin}/api/v1/admin/media/file/${encodeURIComponent(key)}`;
}

/* ------------------------------------------------------------------ */
/* media_views — image view tracking for the "What People Loved"      */
/* dashboard section. Auto-created on first hit of /track or /top.    */
/* ------------------------------------------------------------------ */

export async function ensureMediaViewsSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS media_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_key TEXT,
      image_url TEXT,
      ip_hash TEXT,
      viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_media_views_key_time ON media_views(image_key, viewed_at)`),
  ]);
}

function clientIp(c: { req: { header: (n: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') || (c.req.header('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

/** Non-reversible SHA-256 hash of the viewer IP — raw IPs are never stored. */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`media-view|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------------------------ */
/* PUBLIC router — view tracking (no auth; called by the website)     */
/* ------------------------------------------------------------------ */

const mediaPublic = new Hono<AppEnv>();

mediaPublic.post('/track', async (c) => {
  await ensureMediaViewsSchema(c.env.DB);
  const body = await c.req.json<{ key?: string; url?: string }>().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (key.length > 500 || url.length > 500) {
    return c.json({ error: 'key/url must be 500 characters or less' }, 400);
  }
  if (!key && !url) return c.json({ error: 'key or url is required' }, 400);

  const ipHash = await hashIp(clientIp(c));
  const db = c.env.DB;

  // Dedupe: one view per viewer per image per 60 minutes.
  const recent = await db.prepare(
    `SELECT 1 FROM media_views
     WHERE ip_hash = ? AND image_key = ? AND image_url = ? AND viewed_at >= datetime('now', '-60 minutes')
     LIMIT 1`
  ).bind(ipHash, key, url).first();
  if (recent) return c.json({ success: true, deduped: true });

  await db.prepare(
    `INSERT INTO media_views (image_key, image_url, ip_hash) VALUES (?, ?, ?)`
  ).bind(key, url, ipHash).run();

  return c.json({ success: true });
});

/* ------------------------------------------------------------------ */
/* POST /api/v1/admin/media/upload — multipart image → R2              */
/* Expects: `image` (WebP, 2048px) + optional `thumbnail` (WebP, 400px)*/
/* The admin converts to WebP in the browser; the worker stores both. */
/* ------------------------------------------------------------------ */

media.post('/upload', requireAuth, requireAdmin, async (c) => {
  if (!r2Configured(c.env)) {
    return c.json({ error: 'Media storage (R2) is not configured on the worker' }, 500);
  }

  const form = await c.req.formData().catch(() => null);
  const file = form?.get('image') ?? form?.get('file');
  if (!(file instanceof File)) {
    return c.json({ error: 'No image file provided (field: image)' }, 400);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, 400);
  }
  if (file.size > MAX_BYTES) {
    return c.json({ error: 'File is too large (max 15 MB)' }, 400);
  }

  const thumbRaw = form?.get('thumbnail');
  const thumb = thumbRaw instanceof File && ALLOWED_TYPES.has(thumbRaw.type) && thumbRaw.size <= MAX_BYTES
    ? thumbRaw
    : null;

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 10);
  // Optional category/folder from the admin upload UI (e.g. "headshots", "weddings", "homepage-hero").
  // Sanitized to prevent path traversal; defaults to the dated folder for backward compatibility.
  const rawCategory = typeof form?.get('category') === 'string' ? (form.get('category') as string) : '';
  const category = rawCategory.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const folder = category ? `portfolio/${category}/${stamp}` : `portfolio/${stamp}`;
  const key = `${folder}/${rand}.${ext}`;

  const buf = await file.arrayBuffer();
  await c.env.MEDIA_BUCKET.put(key, buf, {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name.slice(0, 200), uploadedBy: c.get('username') ?? 'admin' },
  });

  let thumbKey: string | null = null;
  if (thumb) {
    const text = (thumb.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
    thumbKey = `${folder}/${rand}-thumb.${text}`;
    await c.env.MEDIA_BUCKET.put(thumbKey, await thumb.arrayBuffer(), {
      httpMetadata: { contentType: thumb.type },
      customMetadata: { originalName: thumb.name.slice(0, 200), parent: key },
    });
  }

  return c.json({
    success: true,
    data: {
      key,
      url: publicUrl(c, key),
      thumbnail_key: thumbKey,
      thumbnail_url: thumbKey ? publicUrl(c, thumbKey) : null,
      contentType: file.type,
      size: file.size,
    },
  });
});

/* ------------------------------------------------------------------ */
/* GET /api/v1/admin/media — list uploaded images                       */
/* ------------------------------------------------------------------ */

media.get('/', requireAuth, requireAdmin, async (c) => {
  if (!r2Configured(c.env)) {
    return c.json({ error: 'Media storage (R2) is not configured on the worker' }, 500);
  }
  const prefix = c.req.query('prefix') || 'portfolio/';
  const limit = Math.min(Number(c.req.query('limit')) || 100, 500);
  const cursor = c.req.query('cursor') || undefined;

  const listed = await c.env.MEDIA_BUCKET.list({ prefix, limit, cursor });
  const keys = new Set(listed.objects.map((o) => o.key));
  const thumbKeyFor = (key: string) => key.replace(/(\.[^.]+)$/, '-thumb$1');
  const items = listed.objects
    .filter((o) => !/-thumb\.[^.]+$/.test(o.key)) // thumbnails ride along with their full image
    .map((o) => {
      const tk = thumbKeyFor(o.key);
      return {
        key: o.key,
        url: publicUrl(c, o.key),
        thumbnail_url: keys.has(tk) ? publicUrl(c, tk) : undefined,
        size: o.size,
        uploaded: o.uploaded.toISOString(),
        contentType: o.httpMetadata?.contentType,
      };
    });

  return c.json({
    success: true,
    data: { items, truncated: listed.truncated, cursor: listed.truncated ? listed.cursor : null },
  });
});

/* ------------------------------------------------------------------ */
/* GET /api/v1/admin/media/top — most-viewed images, last 90 days     */
/* Powers the "What People Loved" dashboard section.                  */
/* ------------------------------------------------------------------ */

media.get('/top', requireAuth, requireAdmin, async (c) => {
  await ensureMediaViewsSchema(c.env.DB);
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '12', 10) || 12, 1), 100);
  const rows = await c.env.DB.prepare(
    `SELECT image_key, image_url, COUNT(*) AS views
     FROM media_views
     WHERE viewed_at >= datetime('now', '-90 days')
     GROUP BY image_key, image_url
     ORDER BY views DESC
     LIMIT ?`
  ).bind(limit).all();
  const items = (rows.results ?? []).map((r: Record<string, unknown>) => ({
    image_key: r.image_key ?? '',
    image_url: r.image_url ?? '',
    views: Number(r.views) || 0,
  }));
  return c.json({ success: true, data: items });
});

/* ------------------------------------------------------------------ */
/* GET /api/v1/admin/media/file/:key — serve image (public, cached)    */
/* ------------------------------------------------------------------ */

media.get('/file/:key', async (c) => {
  if (!r2Configured(c.env)) return c.json({ error: 'Media storage not configured' }, 500);
  const raw = c.req.param('key');
  let key: string;
  try {
    key = decodeURIComponent(raw);
  } catch {
    return c.json({ error: 'Invalid key' }, 400);
  }
  if (!KEY_RE.test(key)) return c.json({ error: 'Invalid key' }, 400);

  const obj = await c.env.MEDIA_BUCKET.get(key);
  if (!obj) return c.json({ error: 'Not found' }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', obj.httpEtag);
  return new Response(obj.body, { headers });
});

/* ------------------------------------------------------------------ */
/* DELETE /api/v1/admin/media/:key — delete image (auth)               */
/* ------------------------------------------------------------------ */

media.delete('/:key', requireAuth, requireAdmin, async (c) => {
  if (!r2Configured(c.env)) {
    return c.json({ error: 'Media storage (R2) is not configured on the worker' }, 500);
  }
  const raw = c.req.param('key');
  let key: string;
  try {
    key = decodeURIComponent(raw);
  } catch {
    return c.json({ error: 'Invalid key' }, 400);
  }
  if (!KEY_RE.test(key)) return c.json({ error: 'Invalid key' }, 400);

  await c.env.MEDIA_BUCKET.delete(key);
  return c.json({ success: true, data: { deleted: key } });
});

/* ------------------------------------------------------------------ */
/* POST /api/v1/admin/media/video-upload — STUB                        */
/* Workers cannot transcode video (CPU/memory limits). The production  */
/* path is Cloudflare Stream: the worker will POST the file to the    */
/* Stream API (needs STREAM_API_TOKEN + STREAM_ACCOUNT_ID secrets),   */
/* store the Stream video UID, and the frontend will embed the Stream  */
/* player iframe (adaptive bitrate served automatically). Until Stream  */
/* credentials are configured, this stub returns needsStream: true.   */
/* ------------------------------------------------------------------ */

media.post('/video-upload', requireAuth, requireAdmin, async (c) => {
  const streamConfigured = Boolean(c.env.STREAM_API_TOKEN && c.env.STREAM_ACCOUNT_ID);
  if (!streamConfigured) {
    return c.json({
      success: false,
      needsStream: true,
      message: 'Video uploads need Cloudflare Stream. Add STREAM_API_TOKEN and STREAM_ACCOUNT_ID to the worker secrets, then redeploy.',
    }, 501);
  }
  // TODO: implement direct-creator-upload flow:
  // 1. POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/direct_upload
  //    with Authorization: Bearer {STREAM_API_TOKEN} to get an uploadURL.
  // 2. Return { success: true, uploadUrl } so the browser uploads straight to Stream.
  // 3. Frontend polls /stream/:uid until ready, then embeds
  //    https://iframe.videodelivery.net/{uid} (adaptive bitrate, no transcoding on our side).
  return c.json({
    success: false,
    needsStream: true,
    message: 'Stream credentials are set but the upload flow is not implemented yet.',
  }, 501);
});

export default media;
export { mediaPublic };
