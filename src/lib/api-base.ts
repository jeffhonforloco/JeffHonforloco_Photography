/**
 * Base-URL helper for worker API calls.
 *
 * Reads VITE_API_BASE_URL (e.g. https://api-jeffhonforloco-photography.<...>.workers.dev)
 * and prefixes API paths with it. When unset (same-origin deploys), calls are
 * relative to the current origin.
 */
const API_BASE: string =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export default apiUrl;
