export default async function handler(req, res) {
  const backendRobotsUrl = 'https://influapi.kaburlumedia.com/robots.txt';
  const frontendBase = (() => {
    const env = (process.env.VITE_FRONTEND_URL || '').toString().trim();
    if (env) return env.replace(/\/+$/, '');
    const host = (req?.headers?.host || '').toString().trim();
    if (host) return `https://${host}`;
    return 'https://influ.kaburlumedia.com';
  })();

  try {
    const r = await fetch(backendRobotsUrl, {
      headers: {
        'User-Agent': 'kaburlu-frontend-vercel-robots/1.0',
        'Accept': 'text/plain,*/*',
      },
    });

    let body = '';
    if (r.ok) {
      body = await r.text();
    } else {
      // Fallback robots if backend is down.
      body = 'User-agent: *\nAllow: /\n';
    }

    // Ensure sitemap points to FRONTEND domain.
    // Remove any existing Sitemap lines and add our canonical one.
    body = body
      .split(/\r?\n/)
      .filter((line) => !/^\s*Sitemap\s*:/i.test(line))
      .join('\n')
      .replace(/\s*$/, '');
    body = body + `\n\nSitemap: ${frontendBase}/sitemap.xml\n`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.end(body);
  } catch (e) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`User-agent: *\nAllow: /\n\nSitemap: ${frontendBase}/sitemap.xml\n`);
  }
}
