import { Hono } from 'hono';
import { signJWT } from '../lib/jwt';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const auth = new Hono<AppEnv>();

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

  return c.json({ ok: true, message: 'Admin account created' });
});

// POST /api/v1/auth/login
auth.post('/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  if (!username || !password) return c.json({ error: 'username and password required' }, 400);

  const user = await c.env.DB.prepare(
    `SELECT id, username, email, password_hash, password_salt, role, is_active FROM users WHERE username = ?`
  ).bind(username).first<{ id: number; username: string; email: string; password_hash: string; password_salt: string; role: string; is_active: number }>();

  if (!user || !user.is_active) return c.json({ error: 'Invalid credentials' }, 401);

  const ok = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!ok) return c.json({ error: 'Invalid credentials' }, 401);

  const payload = { id: user.id, username: user.username, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signJWT(payload, c.env.JWT_SECRET, 86400),       // 24h
    signJWT(payload, c.env.JWT_SECRET, 7 * 86400),   // 7d
  ]);

  return c.json({ accessToken, refreshToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// POST /api/v1/auth/refresh
auth.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  if (!refreshToken) return c.json({ error: 'refreshToken required' }, 400);

  const { verifyJWT } = await import('../lib/jwt');
  const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired refresh token' }, 401);

  const newToken = await signJWT({ id: payload.id, username: payload.username, role: payload.role }, c.env.JWT_SECRET, 86400);
  return c.json({ accessToken: newToken });
});

// GET /api/v1/auth/me
auth.get('/me', requireAuth, async (c) => {
  const user = await c.env.DB.prepare(
    `SELECT id, username, email, role, created_at FROM users WHERE id = ?`
  ).bind(c.get('userId')).first();
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json(user);
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

  return c.json({ ok: true });
});

// POST /api/v1/auth/logout
auth.post('/logout', requireAuth, (c) => c.json({ ok: true }));

export default auth;
