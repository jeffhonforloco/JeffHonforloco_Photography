import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const distIndex = path.join(projectRoot, 'dist', 'index.html');
const serverBundle = path.join(projectRoot, '.ssr-dist', 'entry-server.js');
const criticalStylesheetPath = path.join(projectRoot, '.critical-home.css');
const { renderHomepage } = await import(pathToFileURL(serverBundle).href);

const html = await readFile(distIndex, 'utf8');
const homepage = renderHomepage();
const stylesheetMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

if (!stylesheetMatch) {
  throw new Error('Could not find the generated stylesheet for homepage inlining.');
}

const criticalStylesheet = await readFile(criticalStylesheetPath, 'utf8');
const deferredStylesheet = `<meta name="homepage-stylesheet" content="${stylesheetMatch[1]}">`;
const noScriptStylesheet = `<noscript>${stylesheetMatch[0]}</noscript>`;

const rendered = html
  .replace(
    stylesheetMatch[0],
    `<style data-homepage-critical-styles>${criticalStylesheet}</style>${deferredStylesheet}${noScriptStylesheet}`,
  )
  .replace('<div id="root"></div>', `<div id="root">${homepage}</div>`);

if (rendered === html) {
  throw new Error('Could not find the root element while injecting homepage HTML.');
}

await writeFile(distIndex, rendered);
await Promise.all([
  rm(path.join(projectRoot, '.ssr-dist'), { recursive: true, force: true }),
  rm(criticalStylesheetPath, { force: true }),
]);
console.log('Injected build-time homepage HTML for immediate mobile rendering.');
