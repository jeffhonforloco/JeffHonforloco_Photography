/**
 * SPA fallback for the Admin app (admin.jeffhonforlocophotos.com).
 *
 * Serves index.html with HTTP 200 (a rewrite, NOT a redirect) for any
 * navigation path that isn't a static asset or API route. This makes deep
 * links like /email, /contracts, /leads, /settings load the React app
 * instead of returning Cloudflare's 404 page.
 *
 * Why this exists: the `public/_redirects` rule `/* /index.html 200` is
 * rejected by Cloudflare Pages' validator as a false-positive "infinite
 * loop" (0 valid redirect rules parsed), so it has never been active.
 *
 * Safety:
 * - Static files (/_assets/*, /favicon.ico, etc.) are served by Pages
 *   BEFORE this function runs, so they are never intercepted.
 * - /api/* routes pass through untouched.
 * - Only GET/HEAD requests are rewritten; other methods pass through.
 * - This returns content with 200 — it never issues a redirect, so a
 *   redirect loop is impossible.
 */
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // API routes: leave alone
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Only page navigations get the SPA shell
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  // Serve index.html content with 200; the URL stays as-is so the
  // React router renders the correct page.
  const indexResponse = await env.ASSETS.fetch(new URL('/index.html', url.origin));

  return new Response(indexResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
