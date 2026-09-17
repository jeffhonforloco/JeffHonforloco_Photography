import { Hono } from 'hono';
import { requireAdmin, requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const growth = new Hono<AppEnv>();
growth.use('*', requireAuth);
growth.use('*', requireAdmin);

const RECOMMENDATION_STATUSES = new Set(['New', 'Reviewed', 'Approved', 'In Progress', 'PR Ready', 'Completed', 'Dismissed', 'Monitor']);
const ACTION_TYPES = new Set(['CODE FIX', 'CONTENT FIX', 'SEO METADATA', 'INTERNAL LINKING', 'SCHEMA', 'PERFORMANCE', 'IMAGE SEO', 'LOCAL AUTHORITY', 'GOOGLE BUSINESS', 'REVIEW ACTION', 'BACKLINK ACTION', 'CITATION ACTION', 'PARTNERSHIP', 'CONTENT OPPORTUNITY', 'WEBMCP', 'CONVERSION', 'MANUAL TASK']);
const LEVELS = new Set(['high', 'medium', 'low']);
const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

type Input = Record<string, unknown>;
const text = (value: unknown, max = 2000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const optionalText = (value: unknown, max = 2000) => text(value, max) || null;
const numberOrNull = (value: unknown) => value === '' || value === null || value === undefined ? null : Number(value);
const daysFromQuery = (value?: string) => value === '7' ? 7 : value === '90' ? 90 : 30;
const ratio = (numerator: number, denominator: number) => denominator > 0 ? (numerator / denominator) * 100 : null;

const rows = async (statement: D1PreparedStatement) => (await statement.all<Record<string, unknown>>()).results ?? [];
const count = async (db: D1Database, sql: string, ...bindings: unknown[]) => {
  const result = await db.prepare(sql).bind(...bindings).first<{ value: number }>();
  return result?.value ?? 0;
};

const eventBreakdown = async (db: D1Database, days: number, jsonPath: string) => rows(db.prepare(
  `SELECT COALESCE(NULLIF(json_extract(event_data, ?), ''), 'unknown') label, COUNT(*) count
   FROM analytics WHERE created_at >= datetime('now', ?) AND event_type IN ('ViewService','ViewPortfolio','StartBooking','Lead','BookingConfirmed')
   GROUP BY label ORDER BY count DESC LIMIT 10`,
).bind(jsonPath, `-${days} days`));

growth.get('/overview', async (c) => {
  const days = daysFromQuery(c.req.query('days'));
  const since = `-${days} days`;
  const [eventRows, qualifiedLeads, bookedClients, recentLeads, recentRecommendations, topServices, topSources, topLandingPages, openP0, failedChecks, lastPerformance] = await Promise.all([
    rows(c.env.DB.prepare(`SELECT event_type, COUNT(*) count FROM analytics WHERE created_at >= datetime('now', ?) GROUP BY event_type`).bind(since)),
    count(c.env.DB, `SELECT COUNT(*) value FROM contacts WHERE created_at >= datetime('now', ?) AND status IN ('qualified','consultation','proposal','quote_sent','deposit_paid','booked','completed')`, since),
    count(c.env.DB, `SELECT COUNT(*) value FROM contacts WHERE created_at >= datetime('now', ?) AND status IN ('booked','completed')`, since),
    rows(c.env.DB.prepare(`SELECT id, full_name, service_type, status, created_at FROM contacts WHERE created_at >= datetime('now', ?) ORDER BY created_at DESC LIMIT 8`).bind(since)),
    rows(c.env.DB.prepare(`SELECT id, title, priority, status FROM growth_recommendations ORDER BY created_at DESC LIMIT 5`)),
    eventBreakdown(c.env.DB, days, '$.service'),
    eventBreakdown(c.env.DB, days, '$.attribution.source'),
    eventBreakdown(c.env.DB, days, '$.attribution.landingPage'),
    count(c.env.DB, `SELECT COUNT(*) value FROM growth_recommendations WHERE priority = 'P0' AND status NOT IN ('Completed','Dismissed')`),
    count(c.env.DB, `SELECT COUNT(*) value FROM site_health_snapshots s WHERE status = 'fail' AND checked_at = (SELECT MAX(checked_at) FROM site_health_snapshots WHERE check_name = s.check_name)`),
    c.env.DB.prepare(`SELECT measured_at FROM performance_snapshots ORDER BY measured_at DESC LIMIT 1`).first<{ measured_at: string }>(),
  ]);
  const events = Object.fromEntries(eventRows.map((row) => [String(row.event_type), Number(row.count)]));
  const serviceViews = events.ViewService ?? 0;
  const bookingStarts = events.StartBooking ?? 0;
  const leads = events.Lead ?? 0;
  const confirmed = events.BookingConfirmed ?? 0;
  return c.json({ success: true, data: {
    periodDays: days,
    metrics: { visitors: null, serviceViews, portfolioViews: events.ViewPortfolio ?? 0, bookingStarts, leads, qualifiedLeads, bookedClients },
    conversion: { serviceToBooking: ratio(bookingStarts, serviceViews), bookingToLead: ratio(leads, bookingStarts), leadToBooked: ratio(confirmed, leads) },
    topServices, topSources, topLandingPages, recentLeads, recentRecommendations,
    integrations: {
      google_search_console: c.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && c.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ? 'connected' : 'not_connected',
      google_business_profile: c.env.GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID ? 'connected' : 'not_connected',
      github_prepare_fix: c.env.GITHUB_APP_ID ? 'connected' : 'not_connected',
      email_notifications: c.env.RESEND_API_KEY ? 'connected' : 'not_connected',
    },
    health: { openP0, failedChecks, lastPerformance: lastPerformance?.measured_at ?? null },
  } });
});

growth.get('/funnel', async (c) => {
  const days = daysFromQuery(c.req.query('days'));
  const since = `-${days} days`;
  const [eventRows, service, source, landingPage, campaign] = await Promise.all([
    rows(c.env.DB.prepare(`SELECT event_type, COUNT(*) count FROM analytics WHERE created_at >= datetime('now', ?) AND event_type IN ('ViewService','ViewPortfolio','StartBooking','Lead','BookingConfirmed') GROUP BY event_type`).bind(since)),
    eventBreakdown(c.env.DB, days, '$.service'), eventBreakdown(c.env.DB, days, '$.attribution.source'),
    eventBreakdown(c.env.DB, days, '$.attribution.landingPage'), eventBreakdown(c.env.DB, days, '$.attribution.campaign'),
  ]);
  const events = Object.fromEntries(eventRows.map((row) => [String(row.event_type), Number(row.count)]));
  const stages = [
    { event: 'ViewService', label: 'Service views', count: events.ViewService ?? 0 },
    { event: 'ViewPortfolio', label: 'Portfolio views', count: events.ViewPortfolio ?? 0 },
    { event: 'StartBooking', label: 'Booking starts', count: events.StartBooking ?? 0 },
    { event: 'Lead', label: 'Leads', count: events.Lead ?? 0 },
    { event: 'BookingConfirmed', label: 'Bookings', count: events.BookingConfirmed ?? 0 },
  ];
  const conversions = [
    { label: 'ViewService → StartBooking', value: ratio(stages[2].count, stages[0].count) },
    { label: 'StartBooking → Lead', value: ratio(stages[3].count, stages[2].count) },
    { label: 'Lead → BookingConfirmed', value: ratio(stages[4].count, stages[3].count) },
  ];
  const measured = conversions.filter((item) => item.value !== null);
  const biggestDropOff = measured.length ? measured.reduce((lowest, item) => (item.value ?? 100) < (lowest.value ?? 100) ? item : lowest).label : null;
  return c.json({ success: true, data: { stages, conversions, biggestDropOff, breakdowns: { service, source, landingPage, campaign } } });
});

growth.get('/bookings', async (c) => {
  const result = await rows(c.env.DB.prepare(
    `SELECT id, full_name, service_type, event_date, location, COALESCE(json_extract(attribution, '$.source'), 'unknown') source, created_at, status
     FROM contacts WHERE status IN ('booked','completed') ORDER BY COALESCE(event_date, created_at) DESC LIMIT 200`,
  ));
  return c.json({ success: true, data: result });
});

growth.get('/search', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT * FROM search_query_snapshots ORDER BY observed_at DESC LIMIT 250`)) }));
growth.post('/search', async (c) => {
  const body = await c.req.json<Input>();
  const query = text(body.query, 240); const source = text(body.source, 120);
  if (!query || !source) return c.json({ error: 'Query and measurement source are required' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO search_query_snapshots (query, source, observed_position, landing_page, notes, confidence, location_context, device_context) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(query, source, optionalText(body.observed_position, 80), optionalText(body.landing_page, 500), optionalText(body.notes), optionalText(body.confidence, 20), optionalText(body.location_context, 200), optionalText(body.device_context, 80)).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
});

growth.get('/ai-visibility', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT * FROM ai_visibility_tests ORDER BY observed_at DESC LIMIT 250`)) }));
growth.post('/ai-visibility', async (c) => {
  const body = await c.req.json<Input>();
  const provider = text(body.provider, 80); const prompt = text(body.test_prompt, 500); const surfaced = text(body.jeff_surfaced, 20);
  if (!provider || !prompt || !['yes', 'no', 'unclear'].includes(surfaced)) return c.json({ error: 'Provider, prompt, and a valid observed result are required' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO ai_visibility_tests (provider, test_prompt, jeff_surfaced, citation_url, competitors_surfaced, notes, confidence) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(provider, prompt, surfaced, optionalText(body.citation_url, 500), optionalText(body.competitors_surfaced), optionalText(body.notes), optionalText(body.confidence, 80)).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
});

growth.get('/competitors', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT id, domain, name, category, market, services, priority, active, source, updated_at FROM competitors ORDER BY priority, name`)) }));

growth.get('/recommendations', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT r.*, c.name competitor_name FROM growth_recommendations r LEFT JOIN competitors c ON c.id = r.competitor_id ORDER BY CASE r.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END, r.created_at DESC LIMIT 250`)) }));
growth.post('/recommendations', async (c) => {
  const body = await c.req.json<Input>();
  const required = ['title', 'problem', 'evidence', 'next_action', 'priority', 'impact', 'effort', 'risk', 'action_type'] as const;
  if (required.some((key) => !text(body[key]))) return c.json({ error: 'Complete every required recommendation field' }, 400);
  if (!PRIORITIES.has(text(body.priority)) || !LEVELS.has(text(body.impact)) || !LEVELS.has(text(body.effort)) || !LEVELS.has(text(body.risk)) || !ACTION_TYPES.has(text(body.action_type))) return c.json({ error: 'Invalid recommendation classification' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO growth_recommendations (title, problem, evidence, next_action, service, query, priority, impact, effort, risk, action_type, source, source_timestamp, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(text(body.title, 300), text(body.problem), text(body.evidence), text(body.next_action), optionalText(body.service, 120), optionalText(body.query, 240), text(body.priority), text(body.impact), text(body.effort), text(body.risk), text(body.action_type), 'manual admin review', new Date().toISOString(), optionalText(body.confidence, 40)).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
});
growth.patch('/recommendations/:id', async (c) => {
  const id = Number(c.req.param('id')); const body = await c.req.json<Input>(); const status = text(body.status, 40);
  if (!Number.isInteger(id) || !RECOMMENDATION_STATUSES.has(status)) return c.json({ error: 'Invalid recommendation update' }, 400);
  await c.env.DB.prepare(`UPDATE growth_recommendations SET status = ?, updated_at = datetime('now') WHERE id = ?`).bind(status, id).run();
  return c.json({ success: true, data: { id, status } });
});
growth.post('/recommendations/:id/prepare-fix', async (c) => {
  const id = Number(c.req.param('id'));
  const recommendation = await c.env.DB.prepare(`SELECT id, title, problem, evidence, next_action, action_type, status FROM growth_recommendations WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  if (!recommendation) return c.json({ error: 'Recommendation not found' }, 404);
  if (recommendation.action_type !== 'CODE FIX') return c.json({ error: 'Only CODE FIX recommendations can prepare code proposals' }, 400);
  if (!['Reviewed', 'Approved'].includes(String(recommendation.status))) return c.json({ error: 'Review the recommendation before preparing a fix' }, 409);
  const proposedChanges = JSON.stringify({ objective: recommendation.title, problem: recommendation.problem, evidence: recommendation.evidence, proposedAction: recommendation.next_action, constraints: ['No direct main write', 'No automatic merge', 'No deployment'] });
  const testPlan = JSON.stringify(['npm run build', 'npx tsc --noEmit', 'npm run lint', 'npm run verify:seo-phase2', 'git diff --check', 'targeted UI and API tests']);
  const branchPlan = `growth/recommendation-${id}`;
  const result = await c.env.DB.prepare(`INSERT INTO growth_fix_proposals (recommendation_id, proposed_changes, test_plan, branch_plan, prepared_by) VALUES (?, ?, ?, ?, ?)`)
    .bind(id, proposedChanges, testPlan, branchPlan, c.get('userId')).run();
  await c.env.DB.prepare(`UPDATE growth_recommendations SET status = 'In Progress', updated_at = datetime('now') WHERE id = ?`).bind(id).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id, recommendationId: id, proposedChanges: JSON.parse(proposedChanges), testPlan: JSON.parse(testPlan), branchPlan, status: 'Prepared', requiresHumanApproval: true, autoMerge: false, autoDeploy: false } }, 201);
});

growth.get('/authority', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT * FROM authority_tasks ORDER BY CASE priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END, created_at DESC`)) }));
growth.post('/authority', async (c) => {
  const body = await c.req.json<Input>(); const task = text(body.task, 500); const category = text(body.category, 120); const priority = text(body.priority); const why = text(body.why);
  if (!task || !category || !why || !PRIORITIES.has(priority)) return c.json({ error: 'Task, category, priority, and rationale are required' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO authority_tasks (task, category, priority, why, owner, due_date, evidence) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(task, category, priority, why, optionalText(body.owner, 120), optionalText(body.due_date, 20), optionalText(body.evidence)).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
});

growth.get('/content-opportunities', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT id, priority, title, service, evidence, status FROM growth_recommendations WHERE action_type IN ('CONTENT OPPORTUNITY','CONTENT FIX') ORDER BY CASE priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END, created_at DESC`)) }));
growth.get('/webmcp', async (c) => {
  const names = ['ask_site', 'find_service', 'explore_portfolio', 'prepare_booking'];
  const result = await Promise.all(names.map(async (name) => (await c.env.DB.prepare(`SELECT check_name, status, latency_ms, requires_human_submission, checked_at FROM site_health_snapshots WHERE check_name = ? ORDER BY checked_at DESC LIMIT 1`).bind(`webmcp:${name}`).first()) ?? { check_name: name, status: 'not_tested', latency_ms: null, requires_human_submission: name === 'prepare_booking' ? 1 : null, checked_at: null }));
  return c.json({ success: true, data: result.map((item) => ({ ...item, check_name: String(item.check_name).replace('webmcp:', '') })) });
});
growth.get('/performance', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT * FROM performance_snapshots ORDER BY measured_at DESC LIMIT 100`)) }));
growth.post('/performance', async (c) => {
  const body = await c.req.json<Input>(); const device = text(body.device); const performance = numberOrNull(body.performance_score);
  if (!['mobile', 'desktop'].includes(device) || performance === null || !Number.isFinite(performance) || performance < 0 || performance > 100) return c.json({ error: 'A valid device and performance score from 0–100 are required' }, 400);
  const scores = ['accessibility_score', 'best_practices_score', 'seo_score'].map((key) => numberOrNull(body[key]));
  if (scores.some((score) => score !== null && (!Number.isFinite(score) || score < 0 || score > 100))) return c.json({ error: 'Lighthouse scores must be 0–100' }, 400);
  const result = await c.env.DB.prepare(`INSERT INTO performance_snapshots (device, performance_score, accessibility_score, best_practices_score, seo_score, lcp_ms, tbt_ms, cls, source_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(device, performance, scores[0], scores[1], scores[2], numberOrNull(body.lcp_ms), numberOrNull(body.tbt_ms), numberOrNull(body.cls), optionalText(body.source_url, 500)).run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
});
growth.get('/site-health', async (c) => c.json({ success: true, data: await rows(c.env.DB.prepare(`SELECT * FROM site_health_snapshots ORDER BY checked_at DESC LIMIT 250`)) }));

growth.get('/integration-status', (c) => c.json({ success: true, data: {
  searchConsole: { status: c.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && c.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ? 'connected' : 'not_connected' },
  googleBusiness: { status: c.env.GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID ? 'connected' : 'not_connected' },
  github: { status: c.env.GITHUB_APP_ID ? 'connected' : 'not_connected', prepareOnly: true, autoMerge: false },
  seoAgentPro: { status: c.env.SEOAGENTPRO_HF_TOKEN ? 'connected' : 'not_connected', provider: 'SEOAgentPro (Hugging Face)' },
} }));


// AI-powered SEO analysis via SEOAgentPro (Hugging Face)
growth.post('/seo-analyze', async (c) => {
  const token = c.env.SEOAGENTPRO_HF_TOKEN;
  if (!token) return c.json({ error: 'SEOAgentPro not configured' }, 503);
  const body = await c.req.json<{ query?: string; url?: string; content?: string }>();
  const target = body.query || body.url || body.content;
  if (!target) return c.json({ error: 'query, url, or content is required' }, 400);

  const systemPrompt = `You are SEOAgentPro, an expert SEO analyst for Jeff Honforloco Photography, a Providence RI-based photography studio specializing in fashion, beauty, editorial, headshots, and weddings. Provide actionable SEO analysis. Be specific, practical, and focused on ranking improvements.`;
  const userPrompt = body.query
    ? `Analyze this search query for SEO opportunity: "${body.query}". Provide: 1) Search intent, 2) Competition level, 3) Content recommendations, 4) Keyword variations to target.`
    : body.url
    ? `Analyze this page URL for SEO: ${body.url}. Provide: 1) Title/meta recommendations, 2) Content gaps, 3) Technical SEO issues to check, 4) Local SEO opportunities for Providence RI.`
    : `Analyze this content for SEO: "${body.content?.slice(0, 2000)}". Provide: 1) Keyword optimization suggestions, 2) Readability improvements, 3) Missing SEO elements.`;

  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[seo-analyze] HF rejected:', res.status, errText.slice(0, 300));
      return c.json({ error: 'AI analysis temporarily unavailable' }, 502);
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const analysis = data.choices?.[0]?.message?.content || 'No analysis returned';
    return c.json({ success: true, data: { analysis, target } });
  } catch (err) {
    console.error('[seo-analyze] Error:', err);
    return c.json({ error: 'AI analysis failed' }, 500);
  }
});

// AI Visibility check via SEOAgentPro
growth.post('/ai-visibility-check', async (c) => {
  const token = c.env.SEOAGENTPRO_HF_TOKEN;
  if (!token) return c.json({ error: 'SEOAgentPro not configured' }, 503);
  const body = await c.req.json<{ prompt?: string }>();
  if (!body.prompt) return c.json({ error: 'prompt is required' }, 400);

  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          { role: 'system', content: `You are SEOAgentPro analyzing AI search visibility for Jeff Honforloco Photography (Providence RI photographer). Given a user prompt, predict whether this business would likely surface in AI-generated answers, and suggest improvements.` },
          { role: 'user', content: `User prompt: "${body.prompt}"

Would Jeff Honforloco Photography likely appear in an AI answer to this? Provide: 1) Likelihood (High/Medium/Low), 2) Why, 3) 3 specific actions to improve AI visibility for this query.` },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return c.json({ error: 'AI analysis temporarily unavailable' }, 502);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const analysis = data.choices?.[0]?.message?.content || 'No analysis returned';
    return c.json({ success: true, data: { analysis, prompt: body.prompt } });
  } catch (err) {
    console.error('[ai-visibility-check] Error:', err);
    return c.json({ error: 'AI analysis failed' }, 500);
  }
});

growth.get('/seo-auto-runs', async (c) => {
  try {
    const rows = await c.env.DB.prepare(
      `SELECT run_type, target, analysis, created_at FROM seo_auto_runs ORDER BY created_at DESC LIMIT 100`
    ).all();
    return c.json({ success: true, data: rows.results || [] });
  } catch {
    return c.json({ success: true, data: [] });
  }
});

export default growth;
