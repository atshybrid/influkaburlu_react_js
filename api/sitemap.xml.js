export default async function handler(req, res) {
  const backendSitemapUrl = 'https://influapi.kaburlumedia.com/sitemap.xml';

  const frontendBase = (() => {
    const env = (process.env.VITE_FRONTEND_URL || '').toString().trim();
    if (env) return env.replace(/\/+$/, '');
    const host = (req?.headers?.host || '').toString().trim();
    if (host) return `https://${host}`;
    return 'https://influ.kaburlumedia.com';
  })();

  try {
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

    // Rewrite <loc> URLs so Google indexes FRONTEND pages, not the API domain.
    // Keeps path/query, forces https base.
    const rewritten = xml.replace(/<loc>([^<]+)<\/loc>/gi, (full, rawLoc) => {
      const loc = String(rawLoc || '').trim();
      if (!loc) return full;
      try {
        // Absolute URL
        const u = new URL(loc);
        return `<loc>${frontendBase}${u.pathname}${u.search}</loc>`;
      } catch {
        // Relative URL
        if (loc.startsWith('/')) {
          return `<loc>${frontendBase}${loc}</loc>`;
        }
        return full;
      }
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
