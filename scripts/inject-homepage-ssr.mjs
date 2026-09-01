import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const distIndex = path.join(projectRoot, 'dist', 'index.html');
const serverBundle = path.join(projectRoot, '.ssr-dist', 'entry-server.js');
const { renderHomepage } = await import(pathToFileURL(serverBundle).href);

const html = await readFile(distIndex, 'utf8');
const homepage = renderHomepage();

const rendered = html.replace('<div id="root"></div>', `<div id="root">${homepage}</div>`);

if (rendered === html) {
  throw new Error('Could not find the root element while injecting homepage HTML.');
}

await writeFile(distIndex, rendered);
await rm(path.join(projectRoot, '.ssr-dist'), { recursive: true, force: true });
console.log('Injected the complete build-time homepage HTML.');
