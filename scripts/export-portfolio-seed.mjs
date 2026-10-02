// One-time export: static portfolio-data.ts -> seed JSON for D1 import.
// Usage: node scripts/export-portfolio-seed.mjs > workers/api/seed/portfolio-seed.json
import { readFileSync } from 'node:fs';

const src = readFileSync('src/data/portfolio-data.ts', 'utf8');

// Split into category blocks: `  <name>: [ ... ],`
const blocks = [...src.matchAll(/^  (\w+): \[/gm)];
const out = [];

for (let i = 0; i < blocks.length; i++) {
  const category = blocks[i][1];
  const start = blocks[i].index + blocks[i][0].length;
  const end = i + 1 < blocks.length ? blocks[i + 1].index : src.length;
  const body = src.slice(start, end);
  // Match each {...} entry (non-greedy up to the closing brace on its own line or `},`)
  const entries = [...body.matchAll(/\{([^{}]*)\}/g)];
  let order = 0;
  for (const m of entries) {
    const e = m[1];
    const srcM = e.match(/src:\s*'([^']+)'/);
    if (!srcM) continue;
    const alts = [...e.matchAll(/alt:\s*'([^']*)'/g)];
    const capM = e.match(/caption:\s*'([^']*)'/);
    out.push({
      title: alts.length ? alts[alts.length - 1][1] : category,
      description: capM ? capM[1] : '',
      image_url: srcM[1],
      thumbnail_url: null,
      category,
      is_featured: false,
      sort_order: order++,
      tags: null,
    });
  }
}

const counts = {};
for (const r of out) counts[r.category] = (counts[r.category] || 0) + 1;
console.error(`Exported ${out.length} images: ${JSON.stringify(counts)}`);
console.log(JSON.stringify(out, null, 1));
