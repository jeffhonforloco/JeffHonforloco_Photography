export type AcquisitionSource = 'google' | 'facebook' | 'instagram' | 'chatgpt' | 'organic' | 'webmcp' | 'direct' | 'referral';

export type Attribution = {
  source: AcquisitionSource;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  landingPage: string;
  referrer: string;
};

export type FunnelEvent = 'ViewService' | 'ViewPortfolio' | 'StartBooking' | 'Lead' | 'BookingConfirmed';

const STORAGE_KEY = 'jeff_acquisition_attribution_v1';

const clean = (value: string | null, max = 180) => (value ?? '').trim().slice(0, max);

const inferSource = (referrer: string): AcquisitionSource => {
  const value = referrer.toLowerCase();
  if (!value) return 'direct';
  if (value.includes('google.')) return 'organic';
  if (value.includes('facebook.') || value.includes('fb.')) return 'facebook';
  if (value.includes('instagram.')) return 'instagram';
  if (value.includes('chatgpt.') || value.includes('openai.')) return 'chatgpt';
  return 'referral';
};

export const getAttribution = (): Attribution => {
  if (typeof window === 'undefined') {
    return { source: 'direct', medium: '', campaign: '', content: '', term: '', landingPage: '/', referrer: '' };
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch { /* use current visit */ }

  const params = new URLSearchParams(window.location.search);
  const requestedSource = clean(params.get('utm_source')).toLowerCase();
  const recognized = new Set<AcquisitionSource>(['google', 'facebook', 'instagram', 'chatgpt', 'organic', 'webmcp', 'direct', 'referral']);
  const source = recognized.has(requestedSource as AcquisitionSource)
    ? requestedSource as AcquisitionSource
    : inferSource(document.referrer);
  const attribution: Attribution = {
    source,
    medium: clean(params.get('utm_medium')),
    campaign: clean(params.get('utm_campaign')),
    content: clean(params.get('utm_content')),
    term: clean(params.get('utm_term')),
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: clean(document.referrer, 300),
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
};

export const markWebmcpAttribution = () => {
  if (typeof window === 'undefined') return;
  const current = getAttribution();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...current,
    source: 'webmcp',
    medium: 'agent',
  } satisfies Attribution));
};

export const trackFunnelEvent = (event: FunnelEvent, details: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  const payload = { ...details, attribution: getAttribution(), path: window.location.pathname };
  void fetch('/api/v1/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: event, event_data: JSON.stringify(payload) }),
    keepalive: true,
  }).catch(() => {});
};
