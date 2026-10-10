/**
 * After `vite build` (client) and `vite build --ssr` (server bundle), fill each built HTML page
 * with its server-rendered markup, head tags and initial data.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const { renderAll } = (await import(pathToFileURL(resolve(root, 'dist-ssr/ssr.js')).href)) as typeof import('../src/ssr');

const t0 = Date.now();
for (const page of renderAll()) {
  const path = resolve(root, 'dist', page.file);
  let html = readFileSync(path, 'utf8');
  if (!html.includes('<!--app-->')) throw new Error(`${page.file}: missing <!--app--> placeholder`);
  html = html.replace('<!--head-->', page.head).replace('<!--app-->', page.html);
  if (page.data) html = html.replace('<!--data-->', page.data);
  writeFileSync(path, html);
  console.log(`prerendered ${page.file} (${(html.length / 1024).toFixed(0)} kB)`);
}
console.log(`prerender done in ${Date.now() - t0} ms`);
