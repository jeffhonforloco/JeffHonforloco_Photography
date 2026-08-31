import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://jeffhonforlocophotos.com';
const distDir = path.resolve('dist');
const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');

const routes = [
  ['/', 'Jeff Honforloco Photography | Fashion, Beauty & Editorial Photographer', 'Fashion, beauty, editorial, headshot, event and commercial photography by Jeff Honforloco. Based in Providence, Rhode Island and available for travel.'],
  ['/portfolios', 'Photography Portfolios | Jeff Honforloco Photography', 'Explore fashion, beauty, editorial, glamour, headshot and lifestyle photography portfolios by Jeff Honforloco.'],
  ['/services', 'Photography Services | Jeff Honforloco Photography', 'Photography services for fashion, beauty, editorial, headshots, weddings, events, real estate and commercial projects.'],
  ['/about', 'About Jeff Honforloco | Photographer in Providence, RI', 'Meet photographer Jeff Honforloco and learn about his approach to fashion, beauty, editorial and commercial photography.'],
  ['/contact', 'Contact Jeff Honforloco Photography', 'Tell Jeff about your photography project, preferred date, location and creative goals. Responses are typically sent within 24 hours.'],
  ['/book', 'Book a Photography Session | Jeff Honforloco Photography', 'Choose a photography service and package, request a date and send your project details to Jeff Honforloco Photography.'],
  ['/pricing', 'Photography Packages & Pricing | Jeff Honforloco Photography', 'Compare photography packages for portraits, fashion, beauty, editorial, weddings, events, real estate and motion projects.'],
  ['/journal', 'Photography Journal | Jeff Honforloco Photography', 'Practical guidance about preparing for portrait, fashion, beauty and editorial photography sessions.'],
  ['/motion', 'Motion & Video Portfolio | Jeff Honforloco Photography', 'View motion, campaign and short-form video work from Jeff Honforloco Photography.'],
  ['/prep-guide', 'Photography Session Prep Guide | Jeff Honforloco Photography', 'Prepare wardrobe, styling and creative details for your upcoming photography session.'],
  ...['beauty', 'fashion', 'editorial', 'glamour', 'headshots', 'lifestyle'].map((category) => [
    `/portfolios/${category}`,
    `${category[0].toUpperCase()}${category.slice(1)} Photography Portfolio | Jeff Honforloco Photography`,
    `View ${category} photography by Jeff Honforloco.`,
  ]),
  ...['nyc', 'los-angeles', 'miami', 'paris', 'london', 'italy', 'lagos', 'switzerland', 'malta', 'monaco', 'rhode-island', 'massachusetts', 'maine', 'connecticut'].map((slug) => {
    const location = slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
    return [
      `/${slug}`,
      `Photographer Available in ${location} | Jeff Honforloco Photography`,
      `Book fashion, beauty, portrait, event and commercial photography in ${location}, subject to project availability and travel.`,
    ];
  }),
];

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const setMeta = (html, attribute, key, value) => html.replace(
  new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i'),
  `<meta ${attribute}="${key}" content="${escapeHtml(value)}" data-react-helmet="true" data-static-meta="true" />`,
);

for (const [route, title, description] of routes) {
  if (route === '/') continue;

  const canonical = `${SITE_URL}${route}`;
  let html = baseHtml
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" data-react-helmet="true" data-static-meta="true" />`);

  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);

  const outputDir = path.join(distDir, route.slice(1));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), html);
}

console.log(`Generated ${routes.length - 1} route-specific HTML entry points.`);
