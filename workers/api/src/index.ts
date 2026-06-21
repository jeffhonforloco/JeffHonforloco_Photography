import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, AppEnv } from './types';
import { generateDailyPosts } from './lib/journal';
import authRoutes      from './routes/auth';
import contactsRoutes  from './routes/contacts';
import emailRoutes     from './routes/email';
import blogRoutes      from './routes/blog';
import portfolioRoutes from './routes/portfolio';
import adminRoutes     from './routes/admin';
import chatRoutes      from './routes/chat';

const app = new Hono<AppEnv>();

// CORS — use ALLOWED_ORIGIN when set in Worker secrets; fall back to * until it is configured
app.use('*', async (c, next) => {
  const origin = c.env.ALLOWED_ORIGIN || '*';
  return cors({ origin, allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] })(c, next);
});

// Health check
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// Routes
app.route('/api/v1/auth',      authRoutes);
app.route('/api/v1/admin-auth', authRoutes);
app.route('/api/v1/contacts',  contactsRoutes);
app.route('/api/v1/email',     emailRoutes);
app.route('/api/v1/blog',      blogRoutes);
app.route('/api/v1/portfolio', portfolioRoutes);
app.route('/api/v1/admin',     adminRoutes);
app.route('/api/v1/chat',      chatRoutes);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default {
  fetch: app.fetch,

  // Runs daily at 08:00 UTC — generates one AI blog post per category
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await generateDailyPosts(env);
  },
};
