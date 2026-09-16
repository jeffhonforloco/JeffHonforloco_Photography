import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

const settings = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Supabase helpers (service-role, server-side only)                   */
/* ------------------------------------------------------------------ */

function sbHeaders(env: AppEnv['Bindings'], extra: Record<string, string> = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function sbBase(env: AppEnv['Bindings']) {
  return `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/site_settings`;
}

async function sbGet(env: AppEnv['Bindings'], key: string): Promise<string | null> {
  const res = await fetch(`${sbBase(env)}?key=eq.${encodeURIComponent(key)}&select=value`, {
    headers: sbHeaders(env),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ value: string }>;
  return rows.length > 0 ? rows[0].value : null;
}

async function sbSet(env: AppEnv['Bindings'], key: string, value: string): Promise<boolean> {
  const res = await fetch(sbBase(env), {
    method: 'POST',
    headers: sbHeaders(env, { Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
  return res.ok;
}

async function sbAll(env: AppEnv['Bindings']): Promise<Record<string, string>> {
  const res = await fetch(`${sbBase(env)}?select=key,value`, { headers: sbHeaders(env) });
  if (!res.ok) return {};
  const rows = (await res.json()) as Array<{ key: string; value: string }>;
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

function supabaseConfigured(env: AppEnv['Bindings']) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ------------------------------------------------------------------ */
/* Public: studio location for the website                             */
/* ------------------------------------------------------------------ */

const DEFAULT_LOCATION = {
  city: 'Providence',
  state: 'Rhode Island',
  stateCode: 'RI',
  country: 'USA',
  region: 'New England',
  serviceAreas: ['Providence', 'Boston', 'Rhode Island', 'New York City', 'Miami'],
  phone: '+1-646-379-4237',
  email: 'info@jeffhonforlocophotos.com',
};

settings.get('/public', async (c) => {
  if (!supabaseConfigured(c.env)) {
    return c.json({ success: true, data: { location: DEFAULT_LOCATION, source: 'default' } });
  }
  try {
    const raw = await sbGet(c.env, 'studio_location');
    const location = raw ? { ...DEFAULT_LOCATION, ...JSON.parse(raw) } : DEFAULT_LOCATION;
    return c.json({ success: true, data: { location, source: raw ? 'supabase' : 'default' } });
  } catch {
    return c.json({ success: true, data: { location: DEFAULT_LOCATION, source: 'default' } });
  }
});

/* ------------------------------------------------------------------ */
/* Admin: read/write all site settings (auth required)                 */
/* ------------------------------------------------------------------ */

settings.get('/', requireAuth, requireAdmin, async (c) => {
  if (!supabaseConfigured(c.env)) {
    return c.json({ error: 'Supabase is not configured on the worker' }, 500);
  }
  const all = await sbAll(c.env);
  return c.json({ success: true, data: all });
});

const ALLOWED_KEYS = new Set([
  'studio_location',
  'site_name',
  'site_description',
  'contact_phone',
  'contact_email',
  'social_instagram',
  'social_facebook',
  'booking_cta_url',
]);

settings.put('/', requireAuth, requireAdmin, async (c) => {
  if (!supabaseConfigured(c.env)) {
    return c.json({ error: 'Supabase is not configured on the worker' }, 500);
  }
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));

  const writes: Array<[string, string]> = [];
  for (const [key, val] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    const value = typeof val === 'string' ? val : JSON.stringify(val);
    if (value.length > 20000) return c.json({ error: `Value for ${key} is too long` }, 400);
    writes.push([key, value]);
  }
  if (writes.length === 0) return c.json({ error: 'No valid settings provided' }, 400);

  // Validate studio_location shape when present
  const locWrite = writes.find(([k]) => k === 'studio_location');
  if (locWrite) {
    try {
      const loc = JSON.parse(locWrite[1]) as Record<string, unknown>;
      if (!loc.city || !loc.state) {
        return c.json({ error: 'Studio location requires at least city and state' }, 400);
      }
    } catch {
      return c.json({ error: 'studio_location must be valid JSON' }, 400);
    }
  }

  for (const [key, value] of writes) {
    const ok = await sbSet(c.env, key, value);
    if (!ok) return c.json({ error: `Failed to save ${key}` }, 500);
  }

  return c.json({ success: true, data: { updated: writes.map(([k]) => k) } });
});

export default settings;
