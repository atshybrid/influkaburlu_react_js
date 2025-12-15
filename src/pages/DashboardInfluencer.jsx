import { useEffect, useRef, useState } from 'react';
import AvatarImage from '../components/AvatarImage';
import imageCompression from 'browser-image-compression';
import AvatarModal from '../components/AvatarModal';
import AdUploadModal from '../components/AdUploadModal';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import { useCurrency, formatPrice } from '../utils/useCurrency';

export default function DashboardInfluencer(){
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [media, setMedia] = useState([]);
  const [activeUnmute, setActiveUnmute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasToken = !!(localStorage.getItem('auth.token'));
  const currency = useCurrency();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [adThumbUploading, setAdThumbUploading] = useState(false);
  const [adThumbFileName, setAdThumbFileName] = useState('');
  const [showAdUpload, setShowAdUpload] = useState(false);
  const [adVideoFile, setAdVideoFile] = useState(null);
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adCaption, setAdCaption] = useState('');
  const [adThumbnailUrl, setAdThumbnailUrl] = useState('');
  const [adCategory, setAdCategory] = useState('');
  const [adCategoryCode, setAdCategoryCode] = useState('');
  const [adPosting, setAdPosting] = useState(false);
  const mediaRowRef = useRef(null);

  const scrollMediaRow = (dir) => {
    const el = mediaRowRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    // Redirect unauthenticated users to Login
    if (!hasToken) {
      setLoading(false);
      setError('You need to sign in to view your dashboard.');
      // preserve next
      const next = '/dashboard-influencer';
      setTimeout(() => { window.location.href = `/login?next=${encodeURIComponent(next)}`; }, 500);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [dash, profile, mediaList] = await Promise.all([
          apiClient.request('/influencers/dashboard'),
          apiClient.request('/influencers/me'),
          apiClient.request('/influencers/ads/media?page=1&limit=12')
        ]);
        if (mounted) {
          setData(dash);
          setMe(profile);
          const arr = Array.isArray(mediaList) ? mediaList : [];
          setMedia(arr);
        }
      } catch (e) {
        logger.error('Dashboard load error:', e);
        const msg = typeof e?.message === 'string' ? e.message : 'Failed to load dashboard.';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const metrics = data?.metrics;
  const briefs = data?.briefs?.items || [];
  const payouts = data?.payouts?.history || [];
  const nextPayout = data?.metrics?.nextPayout || data?.payouts?.nextPayout;
  const calendarDays = data?.calendar?.days || [];
  const photo = me?.profilePicUrl;
  const handle = me?.handle;
  const verified = me?.verificationStatus === 'green-tick';
  const badges = Array.isArray(me?.badges) ? me.badges : [];

  return (
    <section className="py-10">
      <h1 className="text-2xl md:text-3xl font-bold">Creator Dashboard</h1>
      <p className="text-gray-600 mt-1">Manage briefs, uploads, calendar, and payouts.</p>
      {loading && (
        <>
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <SkeletonPanel />
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
        </>
      )}
      {error && !loading && (
        <div className="mt-6 text-red-600 text-sm">
          {error}
          <div className="mt-2 text-xs text-gray-500">Ensure you are logged in and your token is valid.</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Profile header */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={()=>{ setUploadedAvatarUrl(''); setSelectedFile(null); setPreviewUrl(''); setUploadError(''); setShowAvatarEdit(true); }} className="relative">
                <AvatarImage src={uploadedAvatarUrl || photo} />
                <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded bg-white/90 ring-1 ring-gray-300 text-gray-700">Edit</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-900">{handle || 'Your profile'}</span>
                  {verified && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Verified</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 flex gap-2">
                  {badges.map((b, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-700 ring-1 ring-gray-200">{b}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/influencer/me" className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-800 bg-gray-100 ring-1 ring-gray-200">View Profile</a>
              <a href="/profile-builder" className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">Edit Profile</a>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gray-900" onClick={()=>{ setShowAdUpload(true); setAdPosting(false); setAdVideoFile(null); setAdTitle(''); setAdDescription(''); setAdCaption(''); setAdThumbnailUrl(''); setAdCategory(''); setAdCategoryCode(''); }}>Upload Ad</button>
            </div>
          </div>

          {/* Modals */}
          <AvatarModal
            isOpen={showAvatarEdit}
            previewUrl={previewUrl}
            selectedFile={selectedFile}
            uploadedUrl={uploadedAvatarUrl}
            saving={savingAvatar}
            errorText={uploadError}
            onFileChange={async (file)=>{
              if (!file) return;
              const maxBytes = 20 * 1024 * 1024;
              try {
                setUploadError('');
                let workingFile = file;
                if (file.size > maxBytes) {
                  const options = { maxSizeMB: 20, useWebWorker: true, maxWidthOrHeight: 4096, initialQuality: 0.9 };
                  const compressed = await imageCompression(file, options);
                  if (compressed && compressed.size < file.size) {
                    workingFile = new File([compressed], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: 'image/jpeg' });
                  }
                }
                setSelectedFile(workingFile);
                setPreviewUrl(URL.createObjectURL(workingFile));
              } catch (err) {
                setUploadError('Failed to process image. Try a smaller file.');
              }
            }}
            onUpload={async ()=>{
              if (!selectedFile) return; setSavingAvatar(true);
              try { const form=new FormData(); form.append('file', selectedFile); const res=await apiClient.request('/media/upload',{method:'POST', body:form}); const url=res?.url||res?.data?.url; if(!url) throw new Error('Upload succeeded but no URL returned'); setUploadedAvatarUrl(url); }
              catch(e){ logger.error('Upload failed', e); setUploadError(e?.message||'Upload failed'); }
              finally{ setSavingAvatar(false);} }}
            onSave={async ()=>{
              if (!uploadedAvatarUrl) return; setSavingAvatar(true);
              try {
                await apiClient.request('/influencers/me/profile-pic',{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: uploadedAvatarUrl })});
                // Refetch profile to ensure server state reflects immediately
                const refreshed = await apiClient.request('/influencers/me');
                setMe(refreshed || (prev=> prev ? { ...prev, profilePicUrl: uploadedAvatarUrl } : prev));
                setShowAvatarEdit(false);
              }
              catch(e){ logger.error('Save failed', e); setUploadError(e?.message||'Update failed'); }
              finally{ setSavingAvatar(false);} }}
            onClose={()=>setShowAvatarEdit(false)}
          />

          <AdUploadModal
            isOpen={showAdUpload}
            adVideoFile={adVideoFile}
            adTitle={adTitle}
            adDescription={adDescription}
            adCaption={adCaption}
            adThumbnailUrl={adThumbnailUrl}
            adThumbUploading={adThumbUploading}
            adThumbFileName={adThumbFileName}
            adCategory={adCategory}
            adCategoryCode={adCategoryCode}
            errorText={uploadError}
            posting={adPosting}
            onClose={()=>{ if (!adPosting && !adThumbUploading) setShowAdUpload(false); }}
            onVideoChange={(f)=>setAdVideoFile(f||null)}
            onTitleChange={(v)=>setAdTitle(v)}
            onDescChange={(v)=>setAdDescription(v)}
            onCaptionChange={(v)=>setAdCaption(v)}
            onThumbUrlChange={(v)=>setAdThumbnailUrl(v)}
            onThumbFileChange={async (img)=>{
              if (!img) return; setAdThumbFileName(img.name); if (img.size > 2 * 1024 * 1024) { setUploadError('Thumbnail too large (max 2MB)'); return; }
              const form = new FormData(); form.append('file', img); setAdThumbUploading(true);
              try { const res = await apiClient.request('/media/upload', { method:'POST', body: form }); const url = res?.url || res?.data?.url; if (url) setAdThumbnailUrl(url); setUploadError(''); }
              catch(err){ setUploadError('Failed to upload thumbnail'); }
              finally{ setAdThumbUploading(false);} }}
            onUploadAd={async (evt)=>{
              if (!adVideoFile) return; setAdPosting(true);
              try { const fd=new FormData(); fd.append('file', adVideoFile); if (adTitle) fd.append('title', adTitle); if (adDescription) fd.append('description', adDescription); if (adCaption) fd.append('caption', adCaption); if (adThumbnailUrl) fd.append('thumbnailUrl', adThumbnailUrl); if (evt?.categoryId) fd.append('category', String(evt.categoryId)); if (evt?.categoryCode) fd.append('categoryCode', evt.categoryCode); const res = await apiClient.request('/influencers/me/ads/video', { method: 'POST', body: fd }); const newItem = { playbackUrl: res?.playbackUrl, ulid: res?.guid, meta: { title: adTitle }, post: { caption: adCaption }, durationSec: 0 }; setMedia(prev => [newItem, ...(Array.isArray(prev)? prev : [])]); setShowAdUpload(false); }
              catch(e){ setError(typeof e?.message==='string'? e.message : 'Failed to upload ad'); }
              finally{ setAdPosting(false);} }}
          />
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            <Metric title="Active briefs" value={String(metrics?.activeBriefs ?? '-') } trend=""/>
            <Metric title="Pending approvals" value={String(metrics?.pendingApprovals ?? '-') } trend=""/>
            <Metric title="Earnings (month)" value={metrics?.earningsMonth != null ? formatPrice(metrics.earningsMonth, currency, { assumesUSD: false }) : '-'} trend=""/>
            <Metric title="Payout status" value={nextPayout ? `Next: ${formatDate(nextPayout)}` : '-'} trend=""/>
          </div>

          {/* Influencer Ads Media Showcase */}
          <div className="mt-8">
            <h2 className="font-semibold">Your Ad Media</h2>
            <p className="text-sm text-gray-600">Recent ad videos linked to your posts. Brands can quickly assess fit.</p>
            <div className="mt-3 relative">
              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-2 absolute -top-11 right-0">
                <button
                  type="button"
                  onClick={()=>scrollMediaRow('left')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 ring-1 ring-gray-200 text-gray-800"
                >Left</button>
                <button
                  type="button"
                  onClick={()=>scrollMediaRow('right')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 ring-1 ring-gray-200 text-gray-800"
                >Right</button>
              </div>

              {/* One-row, swipeable carousel (mobile swipe + desktop scroll) */}
              <div
                ref={mediaRowRef}
                className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth -mx-4 px-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {media.map((m, i) => (
                  <div
                    key={i}
                    className="snap-center shrink-0 w-[85vw] max-w-[360px] sm:w-[320px] rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white"
                  >
                  {/* Force portrait 9:16 viewport for short-form ads */}
                  <div className="aspect-[9/16]">
                    <iframe
                      src={buildPlaybackUrl(m.playbackUrl, { autoplay: true, muted: true })}
                      title={m.meta?.title || `Ad ${m.ulid}`}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3 text-xs text-gray-700 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{m.meta?.title || 'Ad video'}</div>
                      <div className="text-[11px] text-gray-600">{m.post?.caption || ''} • {m.post?.language || ''}</div>
                    </div>
                    <div className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 ring-1 ring-gray-200">{(m.durationSec||0)}s</div>
                  </div>
                  <div className="p-3 pt-0 flex items-center gap-2">
                    <span className="text-[11px] text-gray-600">Videos auto-play muted. Click player to unmute.</span>
                  </div>
                  </div>

                ))}
              </div>
            </div>
          </div>


          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Panel gradient>
              <h2 className="font-semibold">Content Calendar</h2>
              <div className="mt-3 grid grid-cols-7 gap-2 text-xs">
                {calendarDays.length === 0 && (
                  Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={`h-16 rounded-md border border-gray-200`}></div>
                  ))
                )}
                {calendarDays.map((d, i) => (
                  <div key={i} className={`h-16 rounded-md border ${d.hasTask? 'bg-orange-50 border-orange-200':'border-gray-200'}`}>
                    <div className="p-2 text-gray-700">
                      <div className="font-medium text-[10px]">{formatDate(d.date)}</div>
                      {d.hasTask && <div className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Task</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <h2 className="font-semibold">Briefs & Deliverables</h2>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-2">Campaign</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Due</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {briefs.map((b, i) => (
                    <Row key={i} c={b.campaign} t={b.type} d={formatDate(b.due)} s={b.status} />
                  ))}
                  {briefs.length === 0 && (
                    <tr><td className="py-4 text-sm text-gray-500" colSpan={4}>No briefs available.</td></tr>
                  )}
                </tbody>
              </table>
            </Panel>

            <Panel>
              <h2 className="font-semibold">Payouts</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {payouts.map((p, i) => (
                  <li key={i} className="flex justify-between"><span>{p.month} payout</span><span className="font-medium">{formatPrice(p.amount, currency, { assumesUSD: false })} • {p.status}</span></li>
                ))}
                {payouts.length === 0 && (
                  <li className="text-gray-500">No payout history.</li>
                )}
              </ul>
              <div className="mt-4 text-xs text-gray-600">{nextPayout ? `Next payout scheduled for ${formatDate(nextPayout)}.` : 'No upcoming payout date.'}</div>
            </Panel>
          </div>
        </>
      )}
    </section>
  )
}

function Metric({ title, value, trend }){
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
      <div className="rounded-2xl bg-white p-5">
        <div className="text-xs text-gray-600">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{trend}</div>
      </div>
    </div>
  )
}

function Panel({ children, gradient }){
  return (
    <div className={`rounded-2xl p-[1px] ${gradient?'bg-gradient-to-br from-orange-200 to-pink-200':'bg-gray-200/60'}`}>
      <div className="rounded-2xl bg-white p-6">
        {children}
      </div>
    </div>
  )
}

function Row({ c, t, d, s }){
  const style = statusStyle(s);
  return (
    <tr>
      <td className="py-2">{c}</td>
      <td className="py-2">{t}</td>
      <td className="py-2">{d}</td>
      <td className="py-2">
        <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.ring}`}>
          <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
          {s}
        </span>
      </td>
    </tr>
  )
}

function statusStyle(s) {
  const k = (s || '').toLowerCase();
  if (k.includes('progress')) {
    return {
      bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-1 ring-blue-200', dot: 'bg-blue-500'
    };
  }
  if (k.includes('approval') || k.includes('pending')) {
    return {
      bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-1 ring-amber-200', dot: 'bg-amber-500'
    };
  }
  if (k.includes('assigned')) {
    return {
      bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-1 ring-gray-300', dot: 'bg-gray-500'
    };
  }
  if (k.includes('completed') || k.includes('approved')) {
    return {
      bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-emerald-200', dot: 'bg-emerald-500'
    };
  }
  return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-1 ring-gray-300', dot: 'bg-gray-500' };
}
// Build embed URL with provider-friendly params when supported
function buildPlaybackUrl(url, { autoplay = false, muted = false } = {}) {
  try {
    if (!url) return '';
    const u = new URL(url);
    // Some providers accept true/false strings, not numeric flags
    if (autoplay) u.searchParams.set('autoplay', 'true');
    if (muted) u.searchParams.set('muted', 'true');
    return u.toString();
  } catch {
    return url;
  }
}
function SkeletonCard(){
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-5 animate-pulse">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="mt-2 h-6 w-32 bg-gray-200 rounded" />
        <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonPanel(){
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(str) {
  try {
    const d = new Date(str);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return str;
  }
}

// Note: Embedded players manage audio; we avoid custom query params
// that can trigger provider validation errors.
