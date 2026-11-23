// Runs after `vite build`. Writes a static HTML file for every route so that:
//  - each calculator has its own <title>, description and readable content for search engines
//  - deep links like /mortgage work on any static host (no server rewrites needed)
// Set SITE_URL (e.g. SITE_URL=https://richcalc.example npm run build) to also emit canonical URLs and sitemap.xml.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CALCULATORS, CATEGORIES, SITE } from '../src/calculators/meta.js';
import { FAQS } from '../src/pages/faqs.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (href, text) => `<a href="${href}">${esc(text)}</a>`;

function render({ path, title, description, body, jsonLd }) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace('<!--prerender-->', body);
  const head = [];
  if (siteUrl) {
    head.push(`<link rel="canonical" href="${siteUrl}${path}" />`);
    head.push(`<meta property="og:url" content="${siteUrl}${path}" />`);
  }
  if (jsonLd) head.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  return html.replace('</head>', `${head.join('\n    ')}\n  </head>`);
}

function write(file, html) {
  const out = join(dist, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const pages = [];

pages.push({
  path: '/',
  file: 'index.html',
  title: `${SITE.name} – ${SITE.tagline}`,
  description: SITE.description,
  body: `<h1>${esc(SITE.tagline)}</h1><p>${esc(SITE.description)}</p>${CATEGORIES.map(
    (cat) =>
      `<h2>${esc(cat.name)}</h2><ul>${CALCULATORS.filter((c) => c.category === cat.id)
        .map((c) => `<li>${link(`/${c.slug}`, c.title)}: ${esc(c.short)}</li>`)
        .join('')}</ul>`,
  ).join('')}`,
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, description: SITE.description },
});

for (const cat of CATEGORIES) {
  const calcs = CALCULATORS.filter((c) => c.category === cat.id);
  pages.push({
    path: `/${cat.id}`,
    file: `${cat.id}/index.html`,
    title: `${cat.name} Calculators – ${SITE.name}`,
    description: cat.description,
    body: `<h1>${esc(cat.name)} calculators</h1><p>${esc(cat.description)}</p><ul>${calcs
      .map((c) => `<li>${link(`/${c.slug}`, c.title)}: ${esc(c.short)}</li>`)
      .join('')}</ul>`,
  });
}

for (const c of CALCULATORS) {
  const cat = CATEGORIES.find((x) => x.id === c.category);
  pages.push({
    path: `/${c.slug}`,
    file: `${c.slug}/index.html`,
    title: `${c.title} – ${SITE.name}`,
    description: c.description,
    body: `<h1>${esc(c.title)}</h1><p>${esc(c.description)}</p><p>${link(`/${cat.id}`, `More ${cat.name.toLowerCase()} calculators`)}</p>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: c.title,
      description: c.description,
      applicationCategory: c.category === 'money' ? 'FinanceApplication' : c.category === 'health' ? 'HealthApplication' : 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0' },
    },
  });
}

const faqPage = {
  path: '/faq',
  file: 'faq/index.html',
  title: `FAQ & Privacy – ${SITE.name}`,
  description: 'Frequently asked questions about RichCalc: currencies, units, accuracy and privacy.',
  body: `<h1>Frequently asked questions</h1>${FAQS.map(([q, a]) => `<h2>${esc(q)}</h2><p>${esc(a)}</p>`).join('')}`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
};
pages.push(faqPage);

for (const p of pages) write(p.file, render(p));

// Keep the old /faq.html URL working (previous site linked to it).
write('faq.html', render(faqPage));

// Fallback for unknown URLs on hosts that serve 404.html (GitHub Pages, Netlify, Cloudflare Pages...).
write(
  '404.html',
  render({ path: '/404', title: `Page not found – ${SITE.name}`, description: 'This page could not be found.', body: '' }),
);

if (siteUrl) {
  const urls = pages.map((p) => `  <url><loc>${siteUrl}${p.path}</loc></url>`).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`prerendered ${pages.length} pages${siteUrl ? ` + sitemap for ${siteUrl}` : ' (set SITE_URL to add canonical URLs and a sitemap)'}`);
