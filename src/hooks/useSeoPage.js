import { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';

export function normalizePageSeoResponse(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    title: data.metaTitle || data.title || data.seoTitle || '',
    description: data.metaDescription || data.description || data.seoDescription || '',
    keywords: data.metaKeywords || data.keywords || data.seoKeywords || '',
    ogImage: data.ogImage || data.og_image || data.og || '',
    canonical: data.canonicalUrl || data.canonical || '',
    schema: data.schemaJson || data.schema || null,
    indexed: typeof data.indexed === 'boolean' ? data.indexed : true,
  };
}

export default function useSeoPage(slug) {
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!slug) {
      setSeo(null);
      return () => { mounted = false; };
    }

    (async () => {
      try {
        setLoading(true);
        const data = await apiClient.request(`/seo/page/${encodeURIComponent(slug)}`, {
          method: 'GET',
          skipAuth: true,
        });
        const normalized = normalizePageSeoResponse(data);
        if (mounted) setSeo(normalized);
      } catch {
        if (mounted) setSeo(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [slug]);

  return { seo, loading };
}
