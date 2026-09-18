/**
 * Dynamic sitemap.xml for jeffhonforlocophotos.com.
 *
 * Fixed site pages (mirrors public/sitemap.xml) + live published journal
 * articles from the Worker blog API, so admin-published posts appear in the
 * sitemap automatically without a code change. Falls back to the fixed page
 * list if the blog API is unreachable. Shadows public/sitemap.xml.
 */
const SITE = 'https://jeffhonforlocophotos.com';
const BLOG_API = 'https://api-jeffhonforloco-photography.ancient-sun-d712.workers.dev/api/v1/blog?limit=100';

// [path, changefreq, priority, lastmod]
const STATIC_PAGES = [
  ['/', 'weekly', '1.0', '2026-09-15'],
  ['/portfolios', 'weekly', '0.9', '2026-08-30'],
  ['/services', 'monthly', '0.9', '2026-09-11'],
  ['/pricing', 'monthly', '0.9', '2026-08-30'],
  ['/book', 'monthly', '0.9', '2026-08-30'],
  ['/contact', 'monthly', '0.8', '2026-08-30'],
  ['/about', 'monthly', '0.8', '2026-09-11'],
  ['/journal', 'weekly', '0.8', '2026-08-30'],
  ['/motion', 'monthly', '0.7', '2026-08-30'],
  ['/prep-guide', 'monthly', '0.6', '2026-08-30'],
  ['/privacy', 'yearly', '0.3', '2026-09-15'],
  ['/terms', 'yearly', '0.3', '2026-09-18'],
  ['/portfolios/beauty', 'monthly', '0.8', '2026-08-30'],
  ['/portfolios/fashion', 'monthly', '0.8', '2026-08-30'],
  ['/portfolios/editorial', 'monthly', '0.8', '2026-08-30'],
  ['/portfolios/glamour', 'monthly', '0.8', '2026-08-30'],
  ['/portfolios/headshots', 'monthly', '0.8', '2026-08-30'],
  ['/portfolios/lifestyle', 'monthly', '0.8', '2026-08-30'],
  ['/providence-headshot-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-fashion-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-beauty-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-commercial-photographer', 'monthly', '0.8', '2026-09-11'],
  ['/rhode-island-editorial-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-wedding-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-engagement-photographer', 'monthly', '0.9', '2026-09-11'],
  ['/providence-sweet-16-quinceanera-photographer', 'monthly', '0.8', '2026-09-11'],
  ['/providence-real-estate-photographer', 'monthly', '0.9', '2026-09-11'],
];

const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function onRequest() {
  const seen = new Set();
  const urls = [];
  for (const [path, changefreq, priority, lastmod] of STATIC_PAGES) {
    const loc = SITE + path;
    seen.add(loc);
    urls.push({ loc, changefreq, priority, lastmod });
  }

  try {
    const res = await fetch(BLOG_API, { headers: { accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      for (const p of data.posts ?? []) {
        const slug = p.slug ?? p.id;
        if (!slug) continue;
        const loc = `${SITE}/journal/${slug}`;
        if (seen.has(loc)) continue;
        seen.add(loc);
        const raw = String(p.updated_at ?? p.published_at ?? p.created_at ?? '');
        urls.push({ loc, changefreq: 'monthly', priority: '0.6', lastmod: raw ? raw.slice(0, 10) : '' });
      }
    }
  } catch (e) {
    // Blog API unreachable: serve the fixed page list.
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          '  <url>\n    <loc>' +
          escapeXml(u.loc) +
          '</loc>' +
          (u.lastmod ? '\n    <lastmod>' + escapeXml(u.lastmod) + '</lastmod>' : '') +
          '\n    <changefreq>' +
          u.changefreq +
          '</changefreq>\n    <priority>' +
          u.priority +
          '</priority>\n  </url>'
      )
      .join('\n') +
    '\n</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
