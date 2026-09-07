import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://jeffhonforlocophotos.com';
const projectRoot = process.cwd();
const metadata = JSON.parse(
  await readFile(path.join(projectRoot, 'src', 'data', 'service-authority-meta.json'), 'utf8'),
);
const sitemap = await readFile(path.join(projectRoot, 'public', 'sitemap.xml'), 'utf8');

const failures = [];
const count = (value, pattern) => value.match(pattern)?.length ?? 0;

for (const page of metadata) {
  const routeDir = page.path.slice(1);
  const htmlPath = path.join(projectRoot, 'dist', routeDir, 'index.html');
  const html = await readFile(htmlPath, 'utf8');
  const canonical = `${SITE_URL}${page.path}`;

  if (!html.includes(`<title>${page.title}</title>`)) failures.push(`${page.path}: title mismatch`);
  if (!html.includes(`name="description" content="${page.description}"`)) failures.push(`${page.path}: description mismatch`);
  if (!html.includes(`rel="canonical" href="${canonical}"`)) failures.push(`${page.path}: canonical mismatch`);
  if (/name="robots" content="noindex/i.test(html)) failures.push(`${page.path}: unexpectedly noindex`);
  if (count(html, /<h1[ >]/g) !== 1) failures.push(`${page.path}: expected exactly one H1`);
  for (const schemaType of ['WebPage', 'Service', 'BreadcrumbList', 'FAQPage']) {
    if (!html.includes(`"@type":"${schemaType}"`)) failures.push(`${page.path}: missing ${schemaType} schema`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`${page.path}: missing from sitemap`);
  if (!html.includes('href="/book?service=')) failures.push(`${page.path}: missing booking conversion link`);

  const imagePath = page.image.split('?')[0].replace(/^\//, 'public/');
  try {
    await access(path.join(projectRoot, imagePath));
  } catch {
    failures.push(`${page.path}: missing social/hero image ${imagePath}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${metadata.length} prerendered SEO Phase 2 routes.`);
}
