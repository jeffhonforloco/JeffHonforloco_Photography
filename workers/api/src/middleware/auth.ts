import { createMiddleware } from 'hono/factory';
import { verifyJWT } from '../lib/jwt';
import type { AppEnv } from '../types';

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJWT(header.slice(7), c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401);
  if (payload.jti) {
    await ensureRevocationSchema(c.env.DB);
    const revoked = await c.env.DB.prepare('SELECT 1 revoked FROM admin_revoked_tokens WHERE jti = ? LIMIT 1').bind(payload.jti).first();
    if (revoked) return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('userId', payload.id);
  c.set('userRole', payload.role);
  c.set('username', payload.username);
  c.set('sessionId', payload.jti ?? 'legacy-session');
  c.set('sessionExpiresAt', payload.exp);
  await next();
});

export async function ensureRevocationSchema(db: D1Database): Promise<void> {
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_revoked_tokens (
    jti TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    revoked_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
}

export async function revokeCurrentSession(db: D1Database, jti: string, expiresAt: number): Promise<void> {
  if (jti === 'legacy-session') return;
  await ensureRevocationSchema(db);
  await db.batch([
    db.prepare('INSERT OR REPLACE INTO admin_revoked_tokens (jti, expires_at) VALUES (?, ?)').bind(jti, expiresAt),
    db.prepare(`DELETE FROM admin_revoked_tokens WHERE expires_at < unixepoch('now')`),
  ]);
}

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});
