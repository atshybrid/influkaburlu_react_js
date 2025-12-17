import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicInfluencerCard from '../components/PublicInfluencerCard';
import { apiClient } from '../utils/apiClient';
import SeoHead from '../components/SeoHead';
import useSeoPage from '../hooks/useSeoPage';

export default function InfluencersList() {
  const { seo } = useSeoPage('influencers');
  const location = useLocation();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const limit = 30;

  const baseUrl = (import.meta.env.VITE_FRONTEND_URL || '').toString().replace(/\/+$/, '');
  const canonicalCreators = baseUrl ? `${baseUrl}/creators` : '';

  const schema = React.useMemo(() => {
    if (!baseUrl) return null;
    const breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Creators', item: `${baseUrl}/creators` },
      ],
    };

    const listItems = (Array.isArray(items) ? items : []).slice(0, 30).map((inf, idx) => {
      const rawHandle = (inf?.slug || inf?.handle || inf?.handleDisplay || '').toString().replace(/^@/, '');
      const slug = rawHandle;
      const url = slug ? `${baseUrl}/creators/${encodeURIComponent(slug)}` : '';
      const name = (inf?.name || inf?.displayName || 'Creator').toString();
      const image = (inf?.profilePicUrl || '').toString().trim();
      return {
        '@type': 'ListItem',
        position: idx + 1,
        url,
        name,
        image: image || undefined,
      };
    }).filter((x) => x.url);

    const itemList = {
      '@type': 'ItemList',
      name: 'Creators',
      itemListElement: listItems,
    };

    return {
      '@context': 'https://schema.org',
      '@graph': [breadcrumb, itemList],
    };
  }, [baseUrl, items]);

  const loadPage = React.useCallback(async (nextOffset, { append } = { append: false }) => {
    const res = await apiClient.request(`/public/influencers?limit=${limit}&offset=${nextOffset}`, {
      method: 'GET',
      skipAuth: true,
    });
    const list = Array.isArray(res?.items) ? res.items : [];
    setItems((prev) => (append ? [...prev, ...list] : list));
    setOffset(nextOffset);
    return list.length;
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const count = await loadPage(0, { append: false });
        if (!mounted) return;
        if (count === 0) setError('No creators found');
      } catch (e) {
        if (!mounted) return;
        setError(typeof e?.message === 'string' ? e.message : 'Failed to load creators');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadPage]);

  const onLoadMore = async () => {
    try {
      setLoadingMore(true);
      setError('');
      const nextOffset = offset + limit;
      const count = await loadPage(nextOffset, { append: true });
      if (count === 0) setError('No more creators');
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to load more creators');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <SeoHead
        title={seo?.title || 'All creators'}
        description={seo?.description || ''}
        keywords={seo?.keywords || ''}
        canonical={seo?.canonical || canonicalCreators || ''}
        ogImage={seo?.ogImage || ''}
        schema={seo?.schema || schema || null}
        noindex={seo?.indexed === false}
      />
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">CREATORS</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">All creators</h1>
          <p className="mt-2 text-gray-600">Browse creators and open their public profiles.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
          Back to home
        </Link>
      </div>

      <div className="mt-4 text-sm text-gray-600">{loading ? 'Loading creators…' : `${items.length} loaded`}</div>
      {error && !loading && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && items.map((inf) => (
          <PublicInfluencerCard
            key={inf.idUlid}
            influencer={inf}
            rotateVideos={false}
            autoplay={false}
            muted={false}
            showFooterNote={false}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading || loadingMore}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-600 disabled:opacity-50"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      </div>
    </main>
  );
}
