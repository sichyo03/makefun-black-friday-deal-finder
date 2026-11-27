// DoorBuster Board — a black-friday-deal-finder-01 entry (Node 22, standard library only).
//
// The site itself is the app/ folder next to this file: plain static files (HTML, ES modules,
// CSS) that a browser opens at app/index.html. Every deal, price and check time is baked into
// app/data.js, so the board renders with no network at all; the only links that leave the page
// are the "see it at the store" links on each deal.
//
// This program hands the entry in. It copies app/ and screenshots/ into the output directory
// (/output in the grader's container, or MAKEFUN_OUTPUT_DIR when run locally) and writes
// dossier.json there with the vendored make.fun library — the summary of screenshots, first-load
// files and source that the judge reads. vendor/makefun-frontend.ts is left exactly as shipped:
// the scorer requires dossier.json to be byte for byte what its own copy of the library writes.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the site:  node serve.ts   (then open http://localhost:8080)
// The program is deterministic: two runs over the same entry write identical bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(entryDir, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(entryDir, 'screenshots'))) {
  cpSync(join(entryDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate: at most 4 screenshots of at most 256 KiB each, at most 993
// files/directories in app/, at most 16 MiB of app files, and dossier text truncated at
// 163,840 bytes. Passing them here makes an over-cap entry fail loudly at build time instead
// of silently at scoring time.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
