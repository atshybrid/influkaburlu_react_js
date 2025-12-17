import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');

function readEnvFile() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return {};
  const text = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

const envFile = readEnvFile();
const API_URL = (process.env.VITE_API_URL || envFile.VITE_API_URL || '').replace(/\/+$/, '');
const FRONTEND_URL = (process.env.VITE_FRONTEND_URL || envFile.VITE_FRONTEND_URL || '').replace(/\/+$/, '');

if (!fs.existsSync(distDir)) {
  console.error('Missing dist/. Run `npm run build` first.');
  process.exit(1);
}

const templateHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(templateHtmlPath)) {
  console.error('Missing dist/index.html.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(templateHtmlPath, 'utf8');

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toAbsolute(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (!FRONTEND_URL) return u;
  if (u.startsWith('/')) return `${FRONTEND_URL}${u}`;
  return `${FRONTEND_URL}/${u}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function injectIntoHead(html, headInsert) {
  const idx = html.indexOf('</head>');
  if (idx === -1) return html;
  return `${html.slice(0, idx)}\n${headInsert}\n${html.slice(idx)}`;
}

function upsertMetaByName(html, name, content) {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+[^>]*name=["']${safeName}["'][^>]*>`, 'i');
  const tag = `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return injectIntoHead(html, tag);
}

function upsertMetaByProperty(html, property, content) {
  const safeProp = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+[^>]*property=["']${safeProp}["'][^>]*>`, 'i');
  const tag = `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return injectIntoHead(html, tag);
}

function upsertCanonical(html, href) {
  const re = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return injectIntoHead(html, tag);
}

function replaceTitle(html, title) {
  const t = escapeHtml(title);
  if (html.includes('<title>')) {
    return html.replace(/<title>[^<]*<\/title>/i, `<title>${t}</title>`);
  }
  return injectIntoHead(html, `<title>${t}</title>`);
}

function replaceRoot(html, innerHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${innerHtml}</div>`);
}

function writePage(routePath, { title, description, canonical, ogImage, schema, bodyHtml, windowData } = {}) {
  const cleanRoute = routePath.replace(/^\//, '').replace(/\/+$/, '');
  const outDir = cleanRoute ? path.join(distDir, cleanRoute) : distDir;
  ensureDir(outDir);

  let html = templateHtml;

  if (title) html = replaceTitle(html, title);

  const resolvedCanonical = canonical || (FRONTEND_URL ? `${FRONTEND_URL}${routePath}` : routePath);
  const resolvedOgImage = ogImage ? toAbsolute(ogImage) : (FRONTEND_URL ? `${FRONTEND_URL}/assets/brand-logo.png` : '/assets/brand-logo.png');
  const resolvedDescription = (description || '').trim();

  if (resolvedDescription) html = upsertMetaByName(html, 'description', resolvedDescription);
  if (resolvedCanonical) html = upsertCanonical(html, resolvedCanonical);

  html = upsertMetaByProperty(html, 'og:title', title || '');
  if (resolvedDescription) html = upsertMetaByProperty(html, 'og:description', resolvedDescription);
  html = upsertMetaByProperty(html, 'og:type', 'profile');
  if (resolvedCanonical) html = upsertMetaByProperty(html, 'og:url', resolvedCanonical);
  html = upsertMetaByProperty(html, 'og:image', resolvedOgImage);

  html = upsertMetaByName(html, 'twitter:card', 'summary_large_image');
  html = upsertMetaByName(html, 'twitter:title', title || '');
  if (resolvedDescription) html = upsertMetaByName(html, 'twitter:description', resolvedDescription);
  html = upsertMetaByName(html, 'twitter:image', resolvedOgImage);

  if (schema) {
    html = injectIntoHead(html, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  if (windowData) {
    html = injectIntoHead(html, `<script>window.__PRERENDERED_INFLUENCER__=${JSON.stringify(windowData)};</script>`);
  }
  if (bodyHtml) html = replaceRoot(html, bodyHtml);

  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}

function normalizeSlug(item) {
  const rawHandle = (item?.handle || item?.handleDisplay || '').toString().replace(/^@/, '');
  const slug = (item?.slug || rawHandle).toString().trim();
  return slug;
}

function buildPersonSchema(data) {
  const name = data?.name || data?.displayName || data?.fullName || '';
  const image = data?.profilePicUrl || data?.profilePhotoUrl || '';
  const location = data?.location || data?.city || data?.state || data?.country || '';
  const sameAs = [data?.instagramUrl, data?.youtubeUrl].filter(Boolean);
  const canonicalUrl = data?.__canonicalUrl || '';

  const person = {
    '@type': 'Person',
    name,
    url: canonicalUrl || undefined,
    image: image || undefined,
    jobTitle: 'Social Media Influencer',
    address: location
      ? { '@type': 'Place', addressLocality: location, addressCountry: 'India' }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const breadcrumb = (FRONTEND_URL && canonicalUrl)
    ? {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${FRONTEND_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Creators', item: `${FRONTEND_URL}/creators` },
          { '@type': 'ListItem', position: 3, name, item: canonicalUrl },
        ],
      }
    : null;

  return {
    '@context': 'https://schema.org',
    '@graph': [person, ...(breadcrumb ? [breadcrumb] : [])],
  };
}

function buildCreatorsListSchema(items) {
  if (!FRONTEND_URL) return null;
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${FRONTEND_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Creators', item: `${FRONTEND_URL}/creators` },
    ],
  };

  const list = {
    '@type': 'ItemList',
    name: 'Creators',
    itemListElement: (Array.isArray(items) ? items : []).slice(0, 60).map((x, idx) => {
      const slug = normalizeSlug(x);
      if (!slug) return null;
      const url = `${FRONTEND_URL}/creators/${encodeURIComponent(slug)}`;
      const name = (x?.name || x?.displayName || x?.fullName || slug || 'Creator').toString();
      const image = (x?.profilePicUrl || x?.profilePhotoUrl || '').toString().trim();
      return {
        '@type': 'ListItem',
        position: idx + 1,
        url,
        name,
        image: image || undefined,
      };
    }).filter(Boolean),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumb, list],
  };
}

async function prerenderInfluencers() {
  if (!API_URL) {
    console.warn('prerender: missing VITE_API_URL, skipping influencer prerender.');
    return;
  }

  const listUrl = `${API_URL}/public/influencers?limit=200&offset=0`;
  const list = await fetchJson(listUrl);
  const items = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];

  if (!items.length) {
    console.warn('prerender: no influencers returned; skipping.');
    return;
  }

  // Also write a crawlable list page with direct links to creator profiles.
  try {
    const verifiedOnly = items.filter((x) => {
      const v = (x?.verificationStatus || x?.verifiedStatus || '').toString().toLowerCase();
      if (v) return v === 'verified' || v === 'approved';
      if (typeof x?.isVerified === 'boolean') return x.isVerified;
      if (typeof x?.verified === 'boolean') return x.verified;
      return false;
    });

    const chosen = (verifiedOnly.length ? verifiedOnly : items).slice(0, 60);
    const cards = chosen.map((x) => {
      const slug = normalizeSlug(x);
      const name = (x?.name || x?.displayName || x?.fullName || slug || 'Creator').toString();
      const image = (x?.profilePicUrl || x?.profilePhotoUrl || '').toString() || '/assets/brand-logo.png';
      if (!slug) return '';
      return `
        <a href="/creators/${escapeHtml(encodeURIComponent(slug))}" class="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white" style="text-decoration:none">
          <div style="padding:16px;display:flex;align-items:center;gap:12px">
            <div style="height:44px;width:44px;border-radius:9999px;overflow:hidden;background:#f3f4f6;flex:0 0 auto">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" width="44" height="44" loading="lazy" style="object-fit:cover;height:100%;width:100%" />
            </div>
            <div style="min-width:0">
              <div style="font-weight:700;color:#111827">${escapeHtml(name)}</div>
              <div style="font-size:12px;color:#6b7280">/creators/${escapeHtml(slug)}</div>
            </div>
          </div>
        </a>
      `.trim();
    }).filter(Boolean).join('\n');

    const bodyHtml = `
      <main class="py-10">
        <div class="max-w-6xl mx-auto px-6">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900">Creators</h1>
          <p class="mt-2 text-gray-700 max-w-3xl">Browse public creator profiles and view real photos, bios, and links.</p>
          <div class="mt-8" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px">
            ${cards}
          </div>
        </div>
      </main>
    `.trim();

    writePage('/creators', {
      title: 'Creators - Influ Kaburlu',
      description: 'Browse creators and open their public profiles on Influ Kaburlu.',
      canonical: FRONTEND_URL ? `${FRONTEND_URL}/creators` : '',
      ogImage: '/assets/brand-logo.png',
      schema: buildCreatorsListSchema(chosen),
      bodyHtml,
    });
  } catch {
    // Non-fatal: list page is helpful but not required.
  }

  for (const item of items) {
    const slug = normalizeSlug(item);
    if (!slug) continue;

    let detail = null;
    try {
      detail = await fetchJson(`${API_URL}/public/influencers/${encodeURIComponent(slug)}`);
    } catch {
      detail = item;
    }

    const name = (detail?.name || detail?.displayName || detail?.fullName || '').toString().trim() || slug;
    const bio = (detail?.bio || detail?.about || '').toString().trim();
    const image = detail?.profilePicUrl || detail?.profilePhotoUrl || '';

    const title = `${name} - Influencer on Influ Kaburlu`;
    const description = bio || `View ${name}'s public creator profile on Influ Kaburlu.`;

    const canonicalUrl = FRONTEND_URL ? `${FRONTEND_URL}/creators/${encodeURIComponent(slug)}` : '';

    const schema = buildPersonSchema({
      ...detail,
      name,
      profilePicUrl: image,
      __canonicalUrl: canonicalUrl,
    });

    const bodyHtml = `
      <main class="py-10">
        <div class="max-w-6xl mx-auto px-6">
          <a href="/creators" class="text-sm text-orange-700">Back to creators</a>
          <div class="mt-4 flex items-center gap-3">
            <div class="h-16 w-16 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-50">
              <img src="${escapeHtml(image || '/assets/brand-logo.png')}" alt="${escapeHtml(`${name} social media influencer`)}" width="64" height="64" loading="eager" style="object-fit:cover;height:100%;width:100%" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900">${escapeHtml(name)}</h1>
              ${bio ? `<p class="mt-2 text-gray-700 max-w-3xl">${escapeHtml(bio)}</p>` : ''}
            </div>
          </div>
          <div class="mt-6">
            <a class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white" style="background:#111827" href="/get-started?role=brand">Start collaboration</a>
          </div>
        </div>
      </main>
    `.trim();

    // Primary SEO route
    writePage(`/creators/${encodeURIComponent(slug)}`, {
      title,
      description,
      canonical: canonicalUrl,
      ogImage: image || '/assets/brand-logo.png',
      schema,
      bodyHtml,
      windowData: { slug, data: detail },
    });

    // Back-compat route (kept for existing links; canonical points to /creators)
    writePage(`/influencer/${encodeURIComponent(slug)}`, {
      title,
      description,
      canonical: canonicalUrl,
      ogImage: image || '/assets/brand-logo.png',
      schema,
      bodyHtml,
      windowData: { slug, data: detail },
    });
  }

  console.log(`prerender: wrote ${items.length} influencer pages under dist/creators/* (and back-compat dist/influencer/*)`);
}

function prerenderStaticSeoPages() {
  const pages = [
    {
      route: '/about',
      title: 'About - Influ Kaburlu',
      description: 'Learn about Influ Kaburlu, an influencer marketing and brand collaboration platform.',
      body: '<main class="py-10"><div class="max-w-6xl mx-auto px-6"><h1 class="text-3xl md:text-4xl font-bold text-gray-900">About</h1><p class="mt-4 text-gray-700 max-w-3xl">Influ Kaburlu helps brands and creators collaborate with trust and transparency.</p></div></main>',
    },
    {
      route: '/contact',
      title: 'Contact - Influ Kaburlu',
      description: 'Contact Influ Kaburlu support.',
      body: '<main class="py-10"><div class="max-w-6xl mx-auto px-6"><h1 class="text-3xl md:text-4xl font-bold text-gray-900">Contact</h1><p class="mt-4 text-gray-700 max-w-3xl">Email: <a class="text-orange-700" href="mailto:support@kaburlumedia.com">support@kaburlumedia.com</a></p></div></main>',
    },
    {
      route: '/privacy-policy',
      title: 'Privacy Policy - Influ Kaburlu',
      description: 'Privacy policy for Influ Kaburlu.',
      body: '<main class="py-10"><div class="max-w-6xl mx-auto px-6"><h1 class="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1><p class="mt-4 text-gray-700 max-w-3xl">We collect and process information needed to operate the platform. We do not sell personal data.</p></div></main>',
    },
    {
      route: '/terms',
      title: 'Terms - Influ Kaburlu',
      description: 'Terms of service for Influ Kaburlu.',
      body: '<main class="py-10"><div class="max-w-6xl mx-auto px-6"><h1 class="text-3xl md:text-4xl font-bold text-gray-900">Terms</h1><p class="mt-4 text-gray-700 max-w-3xl">By using Influ Kaburlu, you agree to use the platform lawfully and provide accurate information.</p></div></main>',
    },
  ];

  for (const p of pages) {
    writePage(p.route, {
      title: p.title,
      description: p.description,
      canonical: FRONTEND_URL ? `${FRONTEND_URL}${p.route}` : '',
      ogImage: '/assets/brand-logo.png',
      bodyHtml: p.body,
    });
  }

  console.log('prerender: wrote static SEO pages (about/contact/privacy/terms)');
}

(async () => {
  try {
    prerenderStaticSeoPages();
    await prerenderInfluencers();
  } catch (e) {
    console.error('prerender failed:', e);
    process.exit(1);
  }
})();
