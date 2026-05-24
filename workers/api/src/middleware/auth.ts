import { createMiddleware } from 'hono/factory';
import { verifyJWT } from '../lib/jwt';
import type { AppEnv } from '../types';

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJWT(header.slice(7), c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401);
  c.set('userId', payload.id);
  c.set('userRole', payload.role);
  c.set('username', payload.username);
  await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});
