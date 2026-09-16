/**
 * SPA fallback for the Admin app (admin.jeffhonforlocophotos.com).
 *
 * Serves index.html with HTTP 200 (a rewrite, NOT a redirect) for SPA
 * route paths like /email, /contracts, /leads. This enables deep links
 * and page refreshes to load the React app instead of 404ing.
 *
 * Why Functions instead of _redirects:
 * - Cloudflare Pages rejects `/* /index.html 200` as a false-positive
 *   "infinite loop" (0 valid rules parsed).
 * - `/* /app.html 200` parses but causes 308 normalization redirects.
 *
 * Safety (no redirect loop possible):
 * - /api/* passes through to API handlers.
 * - /assets/* and any path with a file extension passes through to
 *   static file serving.
 * - Only GET/HEAD requests are rewritten.
 * - Returns content with 200; never issues a redirect.
 */
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // API routes: pass through
  if (path.startsWith('/api/')) {
    return next();
  }

  // Static assets: pass through (let Pages serve the file)
  if (path.startsWith('/assets/')) {
    return next();
  }

  // Any path with a file extension is a static file: pass through
  if (/\.[a-zA-Z0-9]+$/.test(path)) {
    return next();
  }

  // Only page navigations get the SPA shell
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  // Serve index.html content with 200; URL stays as-is for the router.
  const indexResponse = await env.ASSETS.fetch(new URL('/index.html', url.origin));
  return new Response(indexResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
