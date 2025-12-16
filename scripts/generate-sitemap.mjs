import fs from 'node:fs';
import path from 'node:path';

// Minimal static sitemap generator for SPA routes.
// NOTE: For dynamic routes like /influencer/:slug, prefer backend-generated sitemap.

const root = process.cwd();
const publicDir = path.join(root, 'public');

const baseUrl = (process.env.VITE_FRONTEND_URL || '').replace(/\/+$/, '');
if (!baseUrl) {
  console.error('Missing VITE_FRONTEND_URL. Set it in .env (no trailing slash).');
  process.exit(1);
}

const routes = [
  '/',
  '/influencers',
  '/brands',
  '/ads',
];

const now = new Date().toISOString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((r) => {
    const loc = `${baseUrl}${r}`;
    return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod></url>`;
  }).join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
console.log(`Wrote public/sitemap.xml with ${routes.length} routes for ${baseUrl}`);
