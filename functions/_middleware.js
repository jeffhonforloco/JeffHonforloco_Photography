/**
 * Cloudflare Pages Function middleware for Admin SPA fallback.
 * Serves index.html for all non-API, non-asset routes so React Router
 * can handle client-side navigation on refresh/direct loads.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Let API routes, static assets, and files with extensions pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/functions/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return context.next();
  }

  // For all other routes, serve index.html (SPA fallback)
  // Use the 200 rewrite so the URL stays clean
  const indexUrl = new URL('/index.html', url.origin);
  const indexRequest = new Request(indexUrl.toString(), context.request);
  return context.env.ASSETS.fetch(indexRequest);
}
