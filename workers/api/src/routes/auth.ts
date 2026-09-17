import { Hono } from 'hono';
import { signJWT } from '../lib/jwt';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { requireAuth, revokeCurrentSession } from '../middleware/auth';
import type { AppEnv } from '../types';

const auth = new Hono<AppEnv>();
const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_ATTEMPT_LIMIT = 8;

export async function ensureLoginRateLimitSchema(db: D1Database): Promise<void> {
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_key TEXT NOT NULL,
    succeeded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_key ON admin_login_attempts(attempt_key, created_at DESC)`).run();
}

const loginAttemptKey = async (c: { req: { header(name: string): string | undefined } }, username: string) => {
  const raw = `${c.req.header('CF-Connecting-IP') ?? 'unknown'}:${username.toLowerCase()}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// POST /api/v1/auth/setup — create first admin (only if users table is empty)
auth.post('/setup', async (c) => {
  const count = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>();
  if ((count?.n ?? 0) > 0) return c.json({ error: 'Setup already completed' }, 400);

  const { username, email, password } = await c.req.json<{ username: string; email: string; password: string }>();
  if (!username || !email || !password) return c.json({ error: 'username, email, password required' }, 400);

  const { hash, salt } = await hashPassword(password);
  await c.env.DB.prepare(
    `INSERT INTO users (username, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, 'admin')`
  ).bind(username, email, hash, salt).run();

  return c.json({ ok: true, success: true, message: 'Admin account created' });
});

// POST /api/v1/auth/login
auth.post('/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  if (!username || !password) return c.json({ error: 'username and password required' }, 400);
  await ensureLoginRateLimitSchema(c.env.DB);
  const attemptKey = await loginAttemptKey(c, username);
  const recentFailures = await c.env.DB.prepare(
    `SELECT COUNT(*) n FROM admin_login_attempts WHERE attempt_key = ? AND succeeded = 0 AND created_at >= datetime('now', ?)`
  ).bind(attemptKey, `-${LOGIN_WINDOW_MINUTES} minutes`).first<{ n: number }>();
  if ((recentFailures?.n ?? 0) >= LOGIN_ATTEMPT_LIMIT) return c.json({ error: 'Too many login attempts. Try again later.' }, 429);

  const user = await c.env.DB.prepare(
    `SELECT id, username, email, password_hash, password_salt, role, is_active FROM users WHERE username = ?`
  ).bind(username).first<{ id: number; username: string; email: string; password_hash: string; password_salt: string; role: string; is_active: number }>();

  if (!user || !user.is_active) {
    await c.env.DB.prepare(`INSERT INTO admin_login_attempts (attempt_key) VALUES (?)`).bind(attemptKey).run();
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const ok = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!ok) {
    await c.env.DB.prepare(`INSERT INTO admin_login_attempts (attempt_key) VALUES (?)`).bind(attemptKey).run();
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  await c.env.DB.prepare(`DELETE FROM admin_login_attempts WHERE attempt_key = ?`).bind(attemptKey).run();

  const payload = { id: user.id, username: user.username, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signJWT(payload, c.env.JWT_SECRET, 86400),       // 24h
    signJWT(payload, c.env.JWT_SECRET, 7 * 86400),   // 7d
  ]);

  const publicUser = { id: user.id, username: user.username, email: user.email, role: user.role };

  return c.json({
    success: true,
    accessToken,
    refreshToken,
    user: publicUser,
    data: {
      token: accessToken,
      accessToken,
      refreshToken,
      user: publicUser,
    },
  });
});

// POST /api/v1/auth/refresh
auth.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  if (!refreshToken) return c.json({ error: 'refreshToken required' }, 400);

  const { verifyJWT } = await import('../lib/jwt');
  const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired refresh token' }, 401);

  const newToken = await signJWT({ id: payload.id, username: payload.username, role: payload.role }, c.env.JWT_SECRET, 86400);
  return c.json({ success: true, accessToken: newToken, data: { token: newToken, accessToken: newToken } });
});

// GET /api/v1/auth/me
auth.get('/me', requireAuth, async (c) => {
  const user = await c.env.DB.prepare(
    `SELECT id, username, email, role, created_at FROM users WHERE id = ?`
  ).bind(c.get('userId')).first();
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, user, data: { user } });
});

// GET /api/v1/auth/verify — legacy admin-panel compatibility alias
auth.get('/verify', requireAuth, async (c) => {
  const user = await c.env.DB.prepare(
    `SELECT id, username, email, role, created_at FROM users WHERE id = ?`
  ).bind(c.get('userId')).first();
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, user, data: { user } });
});

// POST /api/v1/auth/change-password
auth.post('/change-password', requireAuth, async (c) => {
  const { currentPassword, newPassword } = await c.req.json<{ currentPassword: string; newPassword: string }>();
  if (!currentPassword || !newPassword) return c.json({ error: 'currentPassword and newPassword required' }, 400);

  const user = await c.env.DB.prepare(
    `SELECT password_hash, password_salt FROM users WHERE id = ?`
  ).bind(c.get('userId')).first<{ password_hash: string; password_salt: string }>();
  if (!user) return c.json({ error: 'Not found' }, 404);

  const ok = await verifyPassword(currentPassword, user.password_hash, user.password_salt);
  if (!ok) return c.json({ error: 'Current password incorrect' }, 401);

  const { hash, salt } = await hashPassword(newPassword);
  await c.env.DB.prepare(
    `UPDATE users SET password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(hash, salt, c.get('userId')).run();

  return c.json({ ok: true, success: true });
});

// POST /api/v1/auth/logout
auth.post('/logout', requireAuth, async (c) => {
  await revokeCurrentSession(c.env.DB, c.get('sessionId'), c.get('sessionExpiresAt'));
  return c.json({ ok: true, success: true });
});

export default auth;
