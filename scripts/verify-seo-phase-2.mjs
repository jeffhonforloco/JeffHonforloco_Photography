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
const legacyLocationPaths = [
  '/nyc', '/los-angeles', '/miami', '/paris', '/london', '/italy', '/lagos',
  '/switzerland', '/malta', '/monaco', '/rhode-island', '/massachusetts', '/maine', '/connecticut',
];

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
  for (const entityId of [`${SITE_URL}/#business`, `${SITE_URL}/#person`, `${SITE_URL}/#website`, `${canonical}#webpage`, `${canonical}#service`]) {
    if (!html.includes(`"@id":"${entityId}"`)) failures.push(`${page.path}: missing entity id ${entityId}`);
  }
  if (count(html, /"@type":"ProfessionalService"/g) !== 1) failures.push(`${page.path}: expected one ProfessionalService entity`);
  if (count(html, /"@type":"Person"/g) !== 1) failures.push(`${page.path}: expected one Person entity`);
  for (const unsupported of ['streetAddress', 'reviewCount', 'Wisdom Ave', 'Didit360', '555-PHOTOS']) {
    if (html.includes(unsupported)) failures.push(`${page.path}: contains unsupported identity field ${unsupported}`);
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

const homepageHtml = await readFile(path.join(projectRoot, 'dist', 'index.html'), 'utf8');
for (const [schemaType, expected] of [['WebPage', 1], ['WebSite', 1], ['Person', 1], ['ProfessionalService', 1]]) {
  if (count(homepageHtml, new RegExp(`"@type":"${schemaType}"`, 'g')) !== expected) {
    failures.push(`homepage: expected ${expected} ${schemaType} entity`);
  }
}
for (const entityId of [`${SITE_URL}/#business`, `${SITE_URL}/#person`, `${SITE_URL}/#website`, `${SITE_URL}/#webpage`]) {
  if (!homepageHtml.includes(`"@id":"${entityId}"`)) failures.push(`homepage: missing entity id ${entityId}`);
}

for (const legacyPath of legacyLocationPaths) {
  if (sitemap.includes(`<loc>${SITE_URL}${legacyPath}</loc>`)) failures.push(`${legacyPath}: retired location remains in sitemap`);
}

const robots = await readFile(path.join(projectRoot, 'public', 'robots.txt'), 'utf8');
for (const directive of [
  'User-agent: OAI-SearchBot\nAllow: /',
  'User-agent: GPTBot\nDisallow: /',
  'User-agent: ClaudeBot\nDisallow: /',
  'User-agent: Claude-SearchBot\nAllow: /',
  'User-agent: Claude-User\nAllow: /',
  'User-agent: PerplexityBot\nAllow: /',
  'User-agent: Perplexity-User\nAllow: /',
  'User-agent: Google-Extended\nAllow: /',
]) {
  if (!robots.includes(directive)) failures.push(`robots.txt: missing ${directive.replace('\n', ' / ')}`);
}

const llms = await readFile(path.join(projectRoot, 'public', 'llms.txt'), 'utf8');
for (const toolName of ['ask_site', 'find_service', 'explore_portfolio', 'prepare_booking']) {
  if (!llms.includes(`\`${toolName}\``)) failures.push(`llms.txt: missing ${toolName}`);
}

const redirects = await readFile(path.join(projectRoot, 'public', '_redirects'), 'utf8');
for (const legacyPath of legacyLocationPaths) {
  if (!redirects.includes(`${legacyPath} /services 301`)) failures.push(`${legacyPath}: missing permanent redirect`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${metadata.length} prerendered SEO Phase 2 routes.`);
}
