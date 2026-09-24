/**
 * Edge routing for jeffhonforlocophotos.com (Cloudflare Pages Function).
 *
 * Responsibilities, in order:
 *  1. Canonical host: 301 www -> apex (sitemap + canonical tags use the apex).
 *  2. Trailing-slash normalization: 301 /about/ -> /about (except root).
 *  3. Retired routes: server-side 301s (previously client-side only).
 *  4. Prerendered pages: serve the static HTML shell with 200.
 *  5. SPA shell with 200 for real app routes (incl. dynamic prefixes and
 *     single-segment slugs, which the page builder may own).
 *  6. Real 404 status for unknown multi-segment paths (fixes Soft 404s).
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
 * - Only GET/HEAD requests are rewritten/redirected.
 * - 301 targets are always on the apex host, without trailing slash.
 */

const APEX = 'jeffhonforlocophotos.com';
const WWW = `www.${APEX}`;

// Exact single-segment legacy slugs retired to the services hub.
const RETIRED_SLUGS = new Set([
  'nyc',
  'los-angeles',
  'miami',
  'paris',
  'london',
  'italy',
  'lagos',
  'switzerland',
  'malta',
  'monaco',
  'rhode-island',
  'massachusetts',
  'maine',
  'connecticut',
]);

// Exact routes served by the app (prerendered or SPA shell), all 200.
const KNOWN_ROUTES = new Set([
  '/',
  '/portfolios',
  '/services',
  '/pricing',
  '/book',
  '/contact',
  '/about',
  '/journal',
  '/motion',
  '/prep-guide',
  '/privacy',
  '/terms',
  '/pay',
  '/dashboard',
  '/admin',
  '/providence-headshot-photographer',
  '/providence-fashion-photographer',
  '/providence-beauty-photographer',
  '/providence-commercial-photographer',
  '/rhode-island-editorial-photographer',
  '/providence-wedding-photographer',
  '/providence-engagement-photographer',
  '/providence-sweet-16-quinceanera-photographer',
  '/providence-real-estate-photographer',
]);

// Dynamic prefixes owned by the app router (validated client-side).
const DYNAMIC_PREFIXES = [
  '/journal/',
  '/portfolios/',
  '/proof/',
  '/sign/',
  '/shop/',
  '/pay/',
  '/admin/',
];

const apexRedirect = (url, targetPath) =>
  Response.redirect(`https://${APEX}${targetPath}${url.search}`, 301);

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Canonical host: www -> apex, preserving path + query.
  if (url.hostname === WWW) {
    return Response.redirect(`https://${APEX}${path}${url.search}`, 301);
  }

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

  // Only page navigations get routing treatment
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  // 2. Trailing-slash normalization (root excluded), preserving query.
  if (path !== '/' && path.endsWith('/')) {
    return apexRedirect(url, path.slice(0, -1));
  }

  // 3. Retired routes -> server-side 301s (Google best practice: server
  //    redirects instead of client-side-only navigation).
  if (path === '/portfolio') return apexRedirect(url, '/portfolios');
  if (path === '/portfolio/motion' || path === '/portfolios/motion') {
    return apexRedirect(url, '/motion');
  }
  if (path.startsWith('/portfolio/')) {
    return apexRedirect(url, `/portfolios/${path.slice('/portfolio/'.length)}`);
  }
  if (path.startsWith('/location/')) return apexRedirect(url, '/services');
  if (RETIRED_SLUGS.has(path.slice(1))) return apexRedirect(url, '/services');

  // 4/5. Known routes and dynamic app prefixes -> 200.
  const isKnown =
    KNOWN_ROUTES.has(path) ||
    DYNAMIC_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    // Single-segment slugs may be page-builder pages (validated client-side).
    (path !== '/' && !path.slice(1).includes('/'));

  if (isKnown) {
    // Prerendered pages: if a static HTML file exists for this path, serve it
    // instead of the SPA shell (service pages get their own content).
    // Skip for the homepage itself (path '/') — it IS index.html.
    if (path !== '/') {
      const prerenderedUrl = new URL(`${path}/index.html`, url.origin);
      const prerenderedResponse = await env.ASSETS.fetch(prerenderedUrl);
      if (prerenderedResponse.ok) {
        return new Response(prerenderedResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        });
      }
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

  // 6. Unknown multi-segment path -> real 404 (fixes Soft 404 reports).
  try {
    const notFoundRes = await env.ASSETS.fetch(new URL('/404.html', url.origin));
    if (notFoundRes.ok) {
      return new Response(notFoundRes.body, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  } catch {
    // fall through to plain-text 404
  }
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
