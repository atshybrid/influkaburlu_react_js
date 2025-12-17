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

export default function InfluencerProfile() {
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

  if (loading) {
    return (
      <main className="py-10">
        <SeoHead
          title={seo?.title || 'Creator profile'}
          description={seo?.description || ''}
          keywords={seo?.keywords || ''}
          canonical={seo?.canonical || ''}
          ogImage={seo?.ogImage || ''}
          schema={seo?.schema || null}
          noindex={seo?.indexed === false}
        />
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
        <SeoHead
          title={seo?.title || 'Creator profile'}
          description={seo?.description || ''}
          keywords={seo?.keywords || ''}
          canonical={seo?.canonical || ''}
          ogImage={seo?.ogImage || ''}
          schema={seo?.schema || null}
          noindex={seo?.indexed === false}
        />
        <div className="text-red-600 text-sm">{error}</div>
        <div className="mt-4">
          <Link to="/creators" className="text-sm text-orange-700 hover:underline">Back to creators</Link>
        </div>
      </main>
    );
  }

  if (!influencer) {
    return (
      <main className="py-10">
        <SeoHead
          title={seo?.title || 'Creator profile'}
          description={seo?.description || ''}
          keywords={seo?.keywords || ''}
          canonical={seo?.canonical || ''}
          ogImage={seo?.ogImage || ''}
          schema={seo?.schema || null}
          noindex={seo?.indexed === false}
        />
        <div className="text-gray-600">No profile data.</div>
      </main>
    );
  }

  const avatarSrc = influencer.profilePicUrl || '/assets/brand-logo.png';

  return (
    <main className="py-10">
      <SeoHead
        title={seo?.title || influencer.name}
        description={seo?.description || influencer.bio || ''}
        keywords={seo?.keywords || ''}
        canonical={seo?.canonical || ''}
        ogImage={seo?.ogImage || avatarSrc}
        schema={seo?.schema || null}
        noindex={seo?.indexed === false}
        ogType="profile"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/creators" className="text-sm text-orange-700 hover:underline">Back to creators</Link>
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
          {influencer.videos?.length > 1 && (
            <div className="mt-4 text-xs text-gray-500">More videos are available in the creators list.</div>
          )}
        </div>
      </div>
    </main>
  );
}

/*
Legacy code (old editable profile page) was accidentally appended here during refactor.
It is intentionally disabled to keep /influencer/:slug a public, SEO-friendly page.

            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3">
        <Stat label="Reach" value={profile.stats.reach} />
        <Stat label="Engagement" value={profile.stats.engagement} />
        <Stat label="Platforms" value={profile.stats.platforms.join(' · ')} className="col-span-2" />
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent ads</h2>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        {profile.media.map((m, i) => (
          <div key={i} className="group rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white transition transform hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative">
              <img src={m} alt="ad" className="object-cover h-40 w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="p-2 text-xs text-gray-600 flex items-center justify-between">
              <span>UGC • Reel</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 ring-1 ring-gray-200">❤ 1.2k</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rate cards */}
      <h2 className="mt-8 text-lg font-semibold">Rates</h2>
      <p className="mt-1 text-sm text-gray-600">Transparent pricing for common deliverables. Bundle for savings.</p>
      <div className="mt-3 grid md:grid-cols-3 gap-4">
        <RateCard title="Instagram Reel" price={formatPrice(450, currency)} desc="30–45s short video, organic feel, brand-safe hooks." tag="Popular"/>
        <RateCard title="TikTok Shoot" price={formatPrice(520, currency)} desc="Native vertical short video tailored for TikTok."/>
        <RateCard title="Static Poster" price={formatPrice(220, currency)} desc="High-quality image post with caption and tags."/>
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <RateCard title="Story Set (3)" price={formatPrice(260, currency)} desc="Sequence of 3 stories with swipe-up link."/>
        <RateCard title="UGC Pack" price={formatPrice(750, currency)} desc="2 videos + 1 poster for paid usage (30 days)."/>
        <RateCard title="Full Ad Shoot" price={formatPrice(1300, currency)} desc="Scripted brand shoot: lighting, b-roll, multiple cuts." highlight tag="Best Value"/>
      </div>

      <div id="budget" className="mt-10 rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
        <div className="rounded-2xl bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Create collaboration</h3>
          <p className="text-sm text-gray-600">Pick a deliverable and propose your budget. We’ll route you to your advertiser dashboard to confirm.</p>
          <form className="mt-4 grid md:grid-cols-4 gap-4">
            <label className="text-sm text-gray-700">Deliverable
              <select className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                <option>Instagram Reel</option>
                <option>TikTok Shoot</option>
                <option>Static Poster</option>
                <option>Story Set (3)</option>
                <option>UGC Pack</option>
                <option>Full Ad Shoot</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">Budget (USD)
              <input type="number" min="0" placeholder="$800" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
            </label>
            <label className="text-sm text-gray-700">Usage rights
              <select className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                <option>Organic only</option>
                <option>Paid 30 days</option>
                <option>Paid 90 days</option>
              </select>
            </label>
            <div className="flex items-end">
              <Link to={`/login?next=/dashboard/advertiser`} className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">Start Collaboration</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, className='' }){
  return (
    <div className={`rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 ${className}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base font-semibold text-gray-900">{value}</div>
    </div>
  )
      {/* Avatar edit modal */}
      {showAvatarEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowAvatarEdit(false)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Update Profile Image</h3>
              <button className="text-gray-500" onClick={()=>setShowAvatarEdit(false)}>✕</button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">Image URL</label>
                  <input type="url" placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2" />
                  <button className="w-full mt-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900" onClick={saveProfile} disabled={saving || !avatarUrl}>Save URL</button>
                  <p className="text-[11px] text-gray-500">Paste a direct image link to save.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">Upload File</label>
                  <input id="avatarFile" type="file" accept="image/*" onChange={handleFileSelect} className="block w-full text-sm" />
                  <button className="w-full mt-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-600" onClick={uploadAndSave} disabled={saving || !selectedFile}>Upload & Save</button>
                  <p className="text-[11px] text-gray-500">Pick a JPG/PNG under 2MB.</p>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={previewUrl} alt="preview" className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200" />
                  <span className="text-xs text-gray-600">Preview</span>
                </div>
              )}
              {errorMsg && <div className="text-xs text-red-600">{errorMsg}</div>}
              <div className="flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={()=>setShowAvatarEdit(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

}

function RateCard({ title, price, desc, tag, highlight }){
  return (
    <div className={`rounded-2xl p-[1px] ${highlight? 'bg-gradient-to-br from-orange-200 to-pink-200':'bg-gray-200/60'}`}>
      <div className="rounded-2xl bg-white p-5 h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-xs text-gray-600">{desc}</div>
          </div>
          {tag && <span className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-700 ring-1 ring-gray-200">{tag}</span>}
        </div>
        <div className="mt-3 text-lg font-bold text-gray-900">{price}</div>
      </div>
    </div>
  );
}

// Local component state and handlers for upload
function useAvatarUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File too large. Max 2MB.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return { selectedFile, previewUrl, errorMsg, handleFileSelect, setErrorMsg };
}

async function uploadProfileImage(file) {
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await apiClient.request('/media/upload', {
      method: 'POST',
      body: form,
      headers: { },
    });
    // Expecting { url: 'https://...' }
    if (res?.url) return res.url;
    throw new Error('Upload succeeded but no URL returned');
  } catch (err) {
    throw err;
  }
}

async function uploadAndSave() {
  if (!selectedFile) return;
  setSaving(true);
  try {
    const url = await uploadProfileImage(selectedFile);
    setAvatarUrl(url);
    await saveProfile();
    setShowAvatarEdit(false);
  } catch (e) {
    setErrorMsg(e?.message || 'Upload failed');
  } finally {
    setSaving(false);
  }
}

*/
