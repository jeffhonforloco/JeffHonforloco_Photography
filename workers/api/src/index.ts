import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, AppEnv } from './types';
import { generateDailyPosts } from './lib/journal';
import { processDueEmailSequences } from './lib/leadAutomation';
import { queueGrowthMonitoring, type MonitoringCadence } from './lib/growthMonitoring';
import { runAutoSeoChecks } from './lib/autoSeo';
import { securityHeaders, rateLimit } from './lib/security';
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
import mcpRoutes       from './routes/mcp';

const app = new Hono<AppEnv>();

// SOC 2 Security: Apply security headers to all responses
app.use('*', securityHeaders);

// CORS — use ALLOWED_ORIGIN when set in Worker secrets; fall back to * until it is configured
app.use('*', async (c, next) => {
  const configured = c.env.ALLOWED_ORIGINS || c.env.ALLOWED_ORIGIN || 'https://jeffhonforlocophotos.com,https://admin.jeffhonforlocophotos.com';
  const origins = configured.split(',').map((origin) => origin.trim()).filter(Boolean);
  return cors({ origin: origins, allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Authorization', 'Content-Type'] })(c, next);
});

// Rate limiting: protect against abuse
// Public endpoints: 100 requests per minute
app.use('/api/v1/email/*', rateLimit(100, 60000));
app.use('/api/v1/contacts/*', rateLimit(100, 60000));
app.use('/api/v1/chat/*', rateLimit(200, 60000));
// Auth endpoints: stricter - 20 attempts per 15 minutes
app.use('/api/v1/auth/*', rateLimit(20, 900000));
app.use('/api/v1/admin-auth/*', rateLimit(20, 900000));
// Admin endpoints: 500 per minute (authenticated users)
app.use('/api/v1/admin/*', rateLimit(500, 60000));
// MCP: 200 per minute
app.use('/api/v1/mcp/*', rateLimit(200, 60000));

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
app.route('/api/v1/mcp', mcpRoutes);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

/**
 * Check if current time is 7:30 AM in America/New_York timezone.
 * DST-safe: works correctly in both EST (UTC-5) and EDT (UTC-4).
 */
function isNewYork730AM(date: Date): boolean {
  // Get New York time components
  const nyTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(date);
  
  const [hour, minute] = nyTime.split(':').map(Number);
  // Allow 7:30-7:34 window to account for cron timing variance
  return hour === 7 && minute >= 30 && minute < 35;
}

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
      '30 11 * * 1': 'weekly',
      '0 8 1 * *': 'monthly',
    };
    if (growthCadence[event.cron]) tasks.push(queueGrowthMonitoring(env, growthCadence[event.cron]));
    
    // DST-safe SEO: run at 7:30 AM New York time on Mondays
    // Cron runs at both 11:30 UTC (EDT) and 12:30 UTC (EST), we gate by actual NY time
    if (event.cron === '30 11 * * 1' || event.cron === '30 12 * * 1') {
      const now = new Date();
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(now);
      if (dayOfWeek === 'Mon' && isNewYork730AM(now)) {
        tasks.push(runAutoSeoChecks(env));
      }
    }

    const results = await Promise.allSettled(tasks);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[scheduled] Task failed:', result.reason);
      }
    }
  },
};
