/**
 * Public site-settings helper — reads the studio location that Jeff
 * manages in the admin panel (Settings → Studio Location).
 *
 * Falls back to baked-in defaults when the worker/Supabase is unreachable,
 * so the site never renders without a location.
 */

export interface StudioLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  region: string;
  serviceAreas: string[];
  phone: string;
  email: string;
}

export const DEFAULT_LOCATION: StudioLocation = {
  city: 'Providence',
  state: 'Rhode Island',
  stateCode: 'RI',
  country: 'USA',
  region: 'New England',
  serviceAreas: ['Providence', 'Boston', 'Rhode Island', 'New York City', 'Miami'],
  phone: '+1-646-379-4237',
  email: 'info@jeffhonforlocophotos.com',
};

const API_BASE: string =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

let cached: StudioLocation | null = null;
let inFlight: Promise<StudioLocation> | null = null;

export function fetchStudioLocation(): Promise<StudioLocation> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;
  inFlight = fetch(`${API_BASE}/api/v1/settings/public`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const loc = d?.success && d.data?.location
        ? { ...DEFAULT_LOCATION, ...d.data.location }
        : DEFAULT_LOCATION;
      cached = loc;
      return loc;
    })
    .catch(() => DEFAULT_LOCATION)
    .finally(() => { inFlight = null; });
  return inFlight;
}

/** "Providence, RI" */
export function cityStateAbbr(loc: StudioLocation): string {
  return loc.stateCode ? `${loc.city}, ${loc.stateCode}` : `${loc.city}, ${loc.state}`;
}

/** "Providence, Rhode Island, USA" */
export function cityStateCountry(loc: StudioLocation): string {
  return `${loc.city}, ${loc.state}, ${loc.country}`;
}
