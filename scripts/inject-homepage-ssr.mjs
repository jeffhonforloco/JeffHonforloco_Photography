import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const distIndex = path.join(projectRoot, 'dist', 'index.html');
const serverBundle = path.join(projectRoot, '.ssr-dist', 'entry-server.js');
const { renderHomepage, renderServiceRoute } = await import(pathToFileURL(serverBundle).href);

const html = await readFile(distIndex, 'utf8');
const { body: homepage, structuredData: homepageStructuredData } = renderHomepage();

const renderedBody = html.replace('<div id="root"></div>', `<div id="root">${homepage}</div>`);
const rendered = renderedBody.replace('</head>', `    ${homepageStructuredData}\n  </head>`);

if (rendered === html) {
  throw new Error('Could not find the root element while injecting homepage HTML.');
}

await writeFile(distIndex, rendered);

const serviceAuthorityMeta = JSON.parse(
  await readFile(path.join(projectRoot, 'src', 'data', 'service-authority-meta.json'), 'utf8'),
);

for (const { path: route } of serviceAuthorityMeta) {
  const routeIndex = path.join(projectRoot, 'dist', route.slice(1), 'index.html');
  const routeHtml = await readFile(routeIndex, 'utf8');
  const { body, structuredData } = renderServiceRoute(route);
  const withBody = routeHtml.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const withStructuredData = withBody.replace('</head>', `    ${structuredData}\n  </head>`);

  if (withStructuredData === routeHtml) {
    throw new Error(`Could not inject prerendered content for ${route}.`);
  }
  await writeFile(routeIndex, withStructuredData);
}

await rm(path.join(projectRoot, '.ssr-dist'), { recursive: true, force: true });
console.log(`Injected the homepage and ${serviceAuthorityMeta.length} service authority pages.`);
