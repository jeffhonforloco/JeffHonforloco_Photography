/**
 * Absolute base URL of the Cloudflare Worker backend
 * (api-jeffhonforloco-photography). Same env var the email/chat
 * calls already use — VITE_API_BASE_URL must be set in Cloudflare Pages.
 */
export const API_BASE: string =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(
    /\/$/,
    '',
  );

/** Build an absolute backend URL, e.g. apiUrl('/api/v1/leads'). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
