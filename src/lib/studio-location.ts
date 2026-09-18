/**
 * Studio location — the single source of truth for the business's
 * city/state/country used across SEO (titles, descriptions, schema).
 *
 * The value is editable in Admin → Settings → Studio Location and stored
 * server-side. If the studio moves to a new city/state/country, changing it
 * once there retargets the whole site's local SEO — no code or per-page
 * edits needed.
 */
import { apiUrl } from './api-base';

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

let cache: StudioLocation | null = null;
let inflight: Promise<StudioLocation> | null = null;

async function fetchLocation(): Promise<StudioLocation> {
  try {
    const res = await fetch(apiUrl('/api/v1/settings/public'));
    if (!res.ok) return DEFAULT_LOCATION;
    const json = (await res.json()) as {
      success?: boolean;
      data?: { location?: Partial<StudioLocation> };
    };
    const loc = json?.data?.location;
    if (!loc || !loc.city) return DEFAULT_LOCATION;
    return { ...DEFAULT_LOCATION, ...loc };
  } catch {
    return DEFAULT_LOCATION;
  }
}

/** Fetch the studio location once per page load; subsequent calls reuse it. */
export function getStudioLocation(): Promise<StudioLocation> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchLocation().then((loc) => {
      cache = loc;
      return loc;
    });
  }
  return inflight;
}

/** Synchronous read of whatever has loaded so far (defaults before load). */
export function getCachedLocation(): StudioLocation {
  return cache ?? DEFAULT_LOCATION;
}
