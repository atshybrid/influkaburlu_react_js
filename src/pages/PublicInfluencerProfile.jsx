import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import SeoHead from '../components/SeoHead';

function normalizeInfluencerSeoResponse(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    title: data.title || data.seoTitle || '',
    description: data.description || data.seoDescription || '',
    keywords: data.keywords || data.seoKeywords || '',
    canonical: data.canonical || data.canonicalUrl || '',
    ogImage: data.ogImage || data.og_image || data.og || '',
    schema: data.schema || data.schemaJson || null,
    indexed: typeof data.indexed === 'boolean' ? data.indexed : true,
  };
}

function buildPlaybackUrl(url, { autoplay = true, muted = true } = {}) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (autoplay) u.searchParams.set('autoplay', 'true');
    if (muted) u.searchParams.set('muted', 'true');
    return u.toString();
  } catch {
    const hasQuery = String(url).includes('?');
    const params = [];
    if (autoplay) params.push('autoplay=true');
    if (muted) params.push('muted=true');
    if (params.length === 0) return url;
    return `${url}${hasQuery ? '&' : '?'}${params.join('&')}`;
  }
}

function normalizePublicInfluencer(inf) {
  if (!inf || typeof inf !== 'object') return null;
  const rawHandle = inf.handle || inf.handleDisplay || '';
  const handleText = rawHandle ? (String(rawHandle).startsWith('@') ? String(rawHandle) : `@${rawHandle}`) : '';
  const nameText = inf.name || inf.displayName || handleText?.replace('@', '') || 'Creator';
  const badge = inf.badgeName || (Array.isArray(inf.badges) ? inf.badges[0] : '') || '';
  const videos = Array.isArray(inf.videos) ? inf.videos : [];

  return {
    name: nameText,
    handle: handleText,
    profilePicUrl: inf.profilePicUrl || '',
    verificationStatus: inf.verificationStatus,
    badge,
    location: inf.location || inf.city || inf.state || inf.country || '',
    bio: inf.bio || inf.about || '',
    videos,
    bestVideo: inf.bestVideo || videos[0] || null,
  };
}

export default function PublicInfluencerProfile() {
  const { slug } = useParams();
  const [seo, setSeo] = React.useState(null);
  const [influencer, setInfluencer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!slug) return;
        const data = await apiClient.request(`/seo/influencer/${encodeURIComponent(slug)}`, {
          method: 'GET',
          skipAuth: true,
        });
        if (mounted) setSeo(normalizeInfluencerSeoResponse(data));
      } catch {
        if (mounted) setSeo(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        if (!slug) return;

        // Preferred: direct public profile endpoint
        try {
          const res = await apiClient.request(`/public/influencers/${encodeURIComponent(slug)}`, {
            method: 'GET',
            skipAuth: true,
          });
          const normalized = normalizePublicInfluencer(res);
          if (mounted) setInfluencer(normalized);
          return;
        } catch {
          // Fallback: fetch a page and match by slug/handle
        }

        const listRes = await apiClient.request('/public/influencers?limit=60&offset=0', {
          method: 'GET',
          skipAuth: true,
        });
        const items = Array.isArray(listRes?.items) ? listRes.items : [];
        const found = items.find((x) => {
          const candidateSlug = (x?.slug || '').toString().toLowerCase();
          const handle = (x?.handle || x?.handleDisplay || '').toString().replace('@', '').toLowerCase();
          const target = String(slug).toLowerCase();
          return candidateSlug === target || handle === target;
        });

        const normalized = normalizePublicInfluencer(found);
        if (mounted) {
          if (!normalized) setError('Creator not found');
          setInfluencer(normalized);
        }
      } catch (e) {
        if (mounted) setError(typeof e?.message === 'string' ? e.message : 'Failed to load creator');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const videoSrc = React.useMemo(() => {
    const raw = influencer?.bestVideo?.playbackUrl || '';
    return buildPlaybackUrl(raw, { autoplay: true, muted: true });
  }, [influencer?.bestVideo?.playbackUrl]);

  const head = (
    <SeoHead
      title={seo?.title || influencer?.name || 'Creator profile'}
      description={seo?.description || influencer?.bio || ''}
      keywords={seo?.keywords || ''}
      canonical={seo?.canonical || ''}
      ogImage={seo?.ogImage || influencer?.profilePicUrl || ''}
      schema={seo?.schema || null}
      noindex={seo?.indexed === false}
      ogType="profile"
    />
  );

  if (loading) {
    return (
      <main className="py-10">
        {head}
        <div className="animate-pulse">
          <div className="h-56 w-full bg-gray-200 rounded-2xl" />
          <div className="mt-6 h-6 w-56 bg-gray-200 rounded" />
          <div className="mt-2 h-4 w-72 bg-gray-200 rounded" />
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="h-[420px] bg-gray-200 rounded-2xl" />
            <div className="h-[420px] bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-10">
        {head}
        <div className="text-red-600 text-sm">{error}</div>
        <div className="mt-4">
          <Link to="/influencers" className="text-sm text-orange-700 hover:underline">Back to creators</Link>
        </div>
      </main>
    );
  }

  if (!influencer) {
    return (
      <main className="py-10">
        {head}
        <div className="text-gray-600">No profile data.</div>
      </main>
    );
  }

  const avatarSrc = influencer.profilePicUrl || '/assets/brand-logo.png';

  return (
    <main className="py-10">
      {head}

      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/influencers" className="text-sm text-orange-700 hover:underline">Back to creators</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-14 w-14 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-50">
              <img
                src={avatarSrc}
                alt={influencer.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/brand-logo.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{influencer.name}</h1>
                {influencer.badge && (
                  <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                    {influencer.badge}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">{influencer.handle}{influencer.location ? ` • ${influencer.location}` : ''}</div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/get-started?role=brand"
            className="px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600"
          >
            Start collaboration
          </Link>
          <Link
            to="/login?next=/dashboard-advertiser"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50"
          >
            I already have an account
          </Link>
        </div>
      </div>

      {influencer.bio && <p className="mt-5 text-gray-700 max-w-3xl">{influencer.bio}</p>}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white">
          <div className="p-4">
            <h2 className="font-semibold">Latest ad video</h2>
            <p className="text-sm text-gray-600 mt-1">Preview creator content.</p>
          </div>
          <div className="bg-gray-50">
            <div className="w-full" style={{ aspectRatio: '9/16' }}>
              {videoSrc ? (
                <iframe
                  src={videoSrc}
                  title={`${influencer.name}-video`}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-sm text-gray-600">No videos</div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6">
          <h2 className="font-semibold">Work with this creator</h2>
          <p className="text-sm text-gray-600 mt-1">Sign in as a brand to request a collaboration.</p>
          <div className="mt-4 grid gap-2">
            <Link to="/get-started?role=brand" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-600">
              Create a brand account
            </Link>
            <Link to="/login?next=/dashboard-advertiser" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50">
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
