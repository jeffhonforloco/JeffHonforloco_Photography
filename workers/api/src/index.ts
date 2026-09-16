import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, AppEnv } from './types';
import { generateDailyPosts } from './lib/journal';
import { processDueEmailSequences } from './lib/leadAutomation';
import { queueGrowthMonitoring, type MonitoringCadence } from './lib/growthMonitoring';
import { runAutoSeoChecks } from './lib/autoSeo';
import authRoutes      from './routes/auth';
import contactsRoutes  from './routes/contacts';
import emailRoutes     from './routes/email';
import blogRoutes      from './routes/blog';
import portfolioRoutes from './routes/portfolio';
import adminRoutes     from './routes/admin';
import chatRoutes      from './routes/chat';
import settingsRoutes   from './routes/settings';
import mediaRoutes, { mediaPublic } from './routes/media';
import { galleries, proof } from './routes/galleries';
import { pages, publicPages } from './routes/pages';
import { campaigns, resendWebhook, processDueEmailCampaigns } from './routes/campaigns';
import { shopPublic, shopAdmin, stripeWebhook } from './routes/shop';
import { contracts, contractSign } from './routes/contracts';
import growthRoutes    from './routes/growth';

const app = new Hono<AppEnv>();

// CORS — use ALLOWED_ORIGIN when set in Worker secrets; fall back to * until it is configured
app.use('*', async (c, next) => {
  const configured = c.env.ALLOWED_ORIGINS || c.env.ALLOWED_ORIGIN || 'https://jeffhonforlocophotos.com,https://admin.jeffhonforlocophotos.com';
  const origins = configured.split(',').map((origin) => origin.trim()).filter(Boolean);
  return cors({ origin: origins, allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Authorization', 'Content-Type'] })(c, next);
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
app.route('/api/v1/admin/growth', growthRoutes);
app.route('/api/v1/admin',     adminRoutes);
app.route('/api/v1/chat',      chatRoutes);
app.route('/api/v1/settings',  settingsRoutes);
app.route('/api/v1/admin/media', mediaRoutes);
app.route('/api/v1/media', mediaPublic);
app.route('/api/v1/admin/galleries', galleries);
app.route('/api/v1/proof', proof);
app.route('/api/v1/admin/pages', pages);
app.route('/api/v1/pages', publicPages);
app.route('/api/v1/admin/campaigns', campaigns);
app.route('/api/v1/webhooks', resendWebhook);
app.route('/api/v1/shop', shopPublic);
app.route('/api/v1/admin/shop', shopAdmin);
app.route('/api/v1/webhooks', stripeWebhook);
app.route('/api/v1/admin/contracts', contracts);
app.route('/api/v1/contracts', contractSign);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default {
  fetch: app.fetch,

  // Process email automation often; keep journal generation on its daily cron.
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const tasks: Promise<unknown>[] = [processDueEmailSequences(env), processDueEmailCampaigns(env)];
    if (event.cron === '0 8 * * *') {
      tasks.push(generateDailyPosts(env));
    }
    const growthCadence: Record<string, MonitoringCadence> = {
      '15 7 * * *': 'daily',
      '30 7 * * 1': 'weekly',
      '0 8 1 * *': 'monthly',
    };
    if (growthCadence[event.cron]) tasks.push(queueGrowthMonitoring(env, growthCadence[event.cron]));
    if (event.cron === '30 7 * * 1') tasks.push(runAutoSeoChecks(env));

    const results = await Promise.allSettled(tasks);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[scheduled] Task failed:', result.reason);
      }
    }
  },
};
