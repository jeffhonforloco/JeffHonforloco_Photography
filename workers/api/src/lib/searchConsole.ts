import type { Env } from '../types';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SITE_URL = 'https://jeffhonforlocophotos.com/';

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem: string): Uint8Array {
  // Secret may carry literal \n sequences — normalize first, then strip armor/whitespace.
  const normalized = pem.replace(/\\n/g, '\n');
  const b64 = normalized.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  })));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  const assertion = `${header}.${payload}.${base64UrlEncode(signature)}`;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (HTTP ${res.status})`);
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) throw new Error(data.error_description || 'Google returned no access token');
  return data.access_token;
}

interface ScRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function searchAnalytics(accessToken: string, dimensions: string[], rowLimit: number): Promise<ScRow[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 28);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions, rowLimit }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search Console API error (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { rows?: ScRow[] };
  return data.rows ?? [];
}

export interface SearchConsoleMetrics {
  site: string;
  days: number;
  fetchedAt: string;
  totals: { clicks: number; impressions: number };
  topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

export async function getSearchConsoleMetrics(env: Env): Promise<SearchConsoleMetrics> {
  const clientEmail = env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) throw new Error('Search Console credentials are not configured');
  const accessToken = await getAccessToken(clientEmail, privateKey);
  const [queries, pages] = await Promise.all([
    searchAnalytics(accessToken, ['query'], 25),
    searchAnalytics(accessToken, ['page'], 25),
  ]);
  const totals = queries.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
    { clicks: 0, impressions: 0 },
  );
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    site: SITE_URL,
    days: 28,
    fetchedAt: new Date().toISOString(),
    totals,
    topQueries: queries.map((r) => ({
      query: r.keys[0] ?? '',
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: round1(r.ctr * 100),
      position: round1(r.position),
    })),
    topPages: pages.map((r) => ({
      page: r.keys[0] ?? '',
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: round1(r.ctr * 100),
      position: round1(r.position),
    })),
  };
}
