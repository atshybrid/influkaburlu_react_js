import React from 'react';
import { Helmet } from 'react-helmet-async';

function getBaseUrl() {
  const envUrl = import.meta.env.VITE_FRONTEND_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function normalizeTitle(title) {
  const siteName = import.meta.env.VITE_APP_NAME || 'Influ Kaburlu';
  const defaultTitle = import.meta.env.VITE_DEFAULT_META_TITLE || siteName;
  const t = (title || '').toString().trim();
  if (!t) return defaultTitle;
  // Avoid duplicating site name if backend already includes it.
  if (t.toLowerCase().includes(siteName.toLowerCase())) return t;
  return `${t} | ${siteName}`;
}

function toAbsoluteUrl(url, baseUrl) {
  const u = (url || '').toString().trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (!baseUrl) return u;
  if (u.startsWith('/')) return `${baseUrl}${u}`;
  return `${baseUrl}/${u}`;
}

export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex,
  schema,
}) {
  const baseUrl = getBaseUrl();
  const resolvedTitle = normalizeTitle(title);
  const resolvedDescription = (description || import.meta.env.VITE_DEFAULT_META_DESCRIPTION || '').toString().trim();
  const resolvedKeywords = (keywords || import.meta.env.VITE_DEFAULT_META_KEYWORDS || '').toString().trim();

  const resolvedCanonical = (() => {
    const c = (canonical || '').toString().trim();
    if (c) return c;
    if (typeof window === 'undefined') return baseUrl;
    if (!baseUrl) return '';
    return `${baseUrl}${window.location.pathname}${window.location.search}`;
  })();

  const resolvedOgImage = (() => {
    const img = (ogImage || '').toString().trim();
    if (img) return toAbsoluteUrl(img, baseUrl);
    // Prefer a stable absolute URL when possible.
    if (!baseUrl) return '/assets/brand-logo.png';
    return `${baseUrl}/assets/brand-logo.png`;
  })();

  const resolvedOgUrl = resolvedCanonical || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  const robots = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      {resolvedDescription && <meta name="description" content={resolvedDescription} />}
      {resolvedKeywords && <meta name="keywords" content={resolvedKeywords} />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
      <meta name="robots" content={robots} />

      {/* OpenGraph */}
      <meta property="og:title" content={resolvedTitle} />
      {resolvedDescription && <meta property="og:description" content={resolvedDescription} />}
      <meta property="og:type" content={ogType} />
      {resolvedOgUrl && <meta property="og:url" content={resolvedOgUrl} />}
      {resolvedOgImage && <meta property="og:image" content={resolvedOgImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      {resolvedDescription && <meta name="twitter:description" content={resolvedDescription} />}
      {resolvedOgImage && <meta name="twitter:image" content={resolvedOgImage} />}

      {/* JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
