export default async function handler(req, res) {
  const backendSitemapUrl = 'https://influapi.kaburlumedia.com/sitemap.xml';

  const frontendBase = (() => {
    const env = (process.env.VITE_FRONTEND_URL || '').toString().trim();
    if (env) return env.replace(/\/+$/, '');
    const host = (req?.headers?.host || '').toString().trim();
    if (host) return `https://${host}`;
    return 'https://influ.kaburlumedia.com';
  })();

  const apiBase = (() => {
    const env = (process.env.VITE_API_URL || '').toString().trim();
    if (env) return env.replace(/\/+$/, '');
    // Fallback: guess API base from backend host
    return 'https://influapi.kaburlumedia.com/api';
  })();

  const staticRoutes = ['/', '/creators', '/about', '/contact', '/privacy-policy', '/terms', '/brands', '/ads', '/get-started'];

  const now = new Date().toISOString();

  const xmlEscape = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const toFrontendLoc = (loc) => {
    const raw = String(loc || '').trim();
    if (!raw) return '';
    try {
      const u = new URL(raw);
      return `${frontendBase}${u.pathname}${u.search}`;
    } catch {
      if (raw.startsWith('/')) return `${frontendBase}${raw}`;
      return raw;
    }
  };

  const extractSlug = (inf) => {
    const s = (inf?.slug || '').toString().trim();
    if (s) return s;
    const h = (inf?.handle || inf?.handleDisplay || '').toString().trim();
    if (!h) return '';
    return h.replace(/^@/, '');
  };

  async function fetchAllPublicInfluencerSlugs() {
    const slugs = [];
    const seen = new Set();
    const limit = 200;
    const maxPages = 30; // 200 * 30 = 6000 max

    for (let page = 0; page < maxPages; page++) {
      const offset = page * limit;
      const url = `${apiBase}/public/influencers?limit=${limit}&offset=${offset}`;

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      let data;
      try {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'kaburlu-frontend-vercel-sitemap/2.0',
            'Accept': 'application/json,*/*',
          },
          signal: controller.signal,
        });
        if (!r.ok) break;
        data = await r.json();
      } finally {
        clearTimeout(t);
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      if (items.length === 0) break;

      for (const inf of items) {
        const slug = extractSlug(inf);
        if (!slug) continue;
        const key = slug.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        slugs.push(slug);
      }

      // stop early if backend indicates total and we reached it
      if (typeof data?.total === 'number' && offset + items.length >= data.total) break;
    }
    return slugs;
  }

  function buildUrlset(urls) {
    const urlBlocks = urls.map((u) => {
      const loc = xmlEscape(u.loc);
      const lastmod = u.lastmod ? xmlEscape(u.lastmod) : xmlEscape(now);
      const changefreq = u.changefreq ? xmlEscape(u.changefreq) : '';
      const priority = typeof u.priority === 'number' ? String(u.priority) : '';
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
        priority ? `    <priority>${priority}</priority>` : '',
        '  </url>',
      ].filter(Boolean).join('\n');
    }).join('\n');

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${urlBlocks}\n` +
      `</urlset>\n`
    );
  }

  function ensureStylesheet(xmlText) {
    const text = String(xmlText || '');
    if (!text) return text;
    if (text.includes('<?xml-stylesheet')) return text;

    if (text.startsWith('<?xml')) {
      const end = text.indexOf('?>');
      if (end !== -1) {
        const before = text.slice(0, end + 2);
        const after = text.slice(end + 2);
        return `${before}\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>${after.startsWith('\n') ? '' : '\n'}${after}`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n${text}`;
  }

  try {
    // Best: generate a complete sitemap from known static routes + public influencer slugs.
    // This prevents relying on backend sitemap content/host.
    try {
      const slugs = await fetchAllPublicInfluencerSlugs();
      const urls = [];

      for (const r of staticRoutes) {
        urls.push({
          loc: `${frontendBase}${r}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: r === '/' ? 1.0 : 0.8,
        });
      }

      for (const slug of slugs) {
        urls.push({
          loc: `${frontendBase}/creators/${encodeURIComponent(slug)}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: 0.9,
        });
      }

      if (urls.length > staticRoutes.length) {
        const out = buildUrlset(urls);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.end(out);
        return;
      }
    } catch {
      // fall through to backend sitemap fetch
    }

    const r = await fetch(backendSitemapUrl, {
      headers: {
        'User-Agent': 'kaburlu-frontend-vercel-sitemap/1.0',
        'Accept': 'application/xml,text/xml,*/*',
      },
    });

    if (!r.ok) {
      res.statusCode = r.status;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Failed to fetch backend sitemap: ${r.status}`);
      return;
    }

    const xml = await r.text();

    // Fallback: rewrite backend sitemap locs to frontend domain.
    const rewritten = ensureStylesheet(xml).replace(/<loc>([^<]+)<\/loc>/gi, (full, rawLoc) => {
      const next = toFrontendLoc(rawLoc);
      if (!next || next === rawLoc) return full;
      return `<loc>${xmlEscape(next)}</loc>`;
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.end(rewritten);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Sitemap error: ${e?.message || 'unknown error'}`);
  }
}
