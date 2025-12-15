import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCurrency, formatPrice } from '../utils/useCurrency';
// use existing named import below; remove duplicate default import to avoid redeclaration

export default function InfluencerProfile(){
  const { slug } = useParams();
  const currency = useCurrency();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.request('/influencers/me');
        if (!mounted) return;
        const p = {
          name: res.handle?.replace('@','') || 'Creator',
          handle: res.handle || '@creator',
          photo: res.profilePicUrl || 'https://images.unsplash.com/photo-1520975922215-c4f2a42b4a97?q=80&w=800&auto=format&fit=crop',
          header: 'https://images.unsplash.com/photo-1520975922215-c4f2a42b4a97?q=80&w=1600&auto=format&fit=crop',
          location: res.states?.[0] || 'India',
          bio: res.bio || '—',
          stats: { reach: (res.followers?.instagram ? `${(res.followers.instagram).toLocaleString('en-IN')}` : '—'), engagement: '—', platforms: ['Instagram'] },
          media: res.posts?.length ? res.posts.map(x => x.thumbnail || x.url).slice(0,8) : [
            'https://images.unsplash.com/photo-1541354329998-f4d727b38aac?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1514653045307-977c1e8f68bd?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549480017-d76466a4b7b5?q=80&w=600&auto=format&fit=crop'
          ],
          raw: res,
        };
        setProfile(p);
      } catch (e) {
        console.error('Load profile error:', e);
        setError(e?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const [form, setForm] = useState({
    handle: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    stateIds: [],
    districtId: '',
    languages: [],
    socialLinks: { instagram: '', youtube: '' },
    adPricing: {
      instagramPost: 0,
      instagramStory: 0,
      instagramReel: 0,
      youtubeShort: 0,
      youtubeIntegration: 0,
      bundleInstagramReelStory: 0,
      exclusiveCategory: 0,
      travelAllowancePerDay: 0,
      negotiable: true,
      currency: 'INR'
    },
  });

  useEffect(() => {
    if (profile?.raw) {
      const r = profile.raw;
      setForm({
        handle: r.handle || '',
        addressLine1: r.addressLine1 || '',
        addressLine2: r.addressLine2 || '',
        postalCode: r.postalCode || '',
        stateIds: r.stateIds || [],
        districtId: r.districtId || '',
        languages: r.languages || [],
        socialLinks: {
          instagram: r.socialLinks?.instagram || '',
          youtube: r.socialLinks?.youtube || '',
        },
        adPricing: {
          instagramPost: r.adPricing?.instagramPost || 0,
          instagramStory: r.adPricing?.instagramStory || 0,
          instagramReel: r.adPricing?.instagramReel || 0,
          youtubeShort: r.adPricing?.youtubeShort || 0,
          youtubeIntegration: r.adPricing?.youtubeIntegration || 0,
          bundleInstagramReelStory: r.adPricing?.bundleInstagramReelStory || 0,
          exclusiveCategory: r.adPricing?.exclusiveCategory || 0,
          travelAllowancePerDay: r.adPricing?.travelAllowancePerDay || 0,
          negotiable: r.adPricing?.negotiable ?? true,
          currency: 'INR',
        },
      });
    }
  }, [profile]);

  async function saveProfile(e){
    e?.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, countryId: profile?.raw?.countryId || 101 };
      if (avatarUrl) {
        await apiClient.request('/influencers/me/profile-pic', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: avatarUrl }),
        });
      }
      const res = await apiClient.request('/influencers/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      // reflect saved values
      setProfile(p => p ? { ...p, raw: { ...p.raw, ...res }, photo: avatarUrl || res.profilePicUrl || p.photo } : p);
      if (avatarUrl) { setShowAvatarEdit(false); setAvatarUrl(''); }
    } catch (e) {
      console.error('Save profile error:', e);
      setError(e?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <section className="py-10">
      <div className="animate-pulse">
        <div className="h-56 w-full bg-gray-200 rounded-2xl" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="mt-6 h-4 w-48 bg-gray-200 rounded" />
        <div className="mt-2 h-3 w-96 bg-gray-200 rounded" />
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-[1px] bg-gray-200/60">
              <div className="rounded-2xl bg-white p-5 h-28" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  if (error) return (<section className="py-10"><div className="text-red-600 text-sm">{error}</div></section>);

  if (!profile) return (<section className="py-10"><div className="text-gray-600">No profile data.</div></section>);

  return (
    <section className="py-10">
      <div className="relative overflow-hidden rounded-2xl">
        <img src={profile.header} alt="header" className="h-56 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setShowAvatarEdit(true)} className="relative">
              <img src={profile.photo} alt="avatar" className="h-16 w-16 rounded-full ring-2 ring-white object-cover" />
              <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded bg-white/90 ring-1 ring-gray-300 text-gray-700">Edit</span>
            </button>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{profile.name}</span>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded bg-white/20 ring-1 ring-white/30">Verified</span>
              </div>
              <div className="text-xs opacity-90">{profile.handle} • {profile.location}</div>
              <div className="mt-1 flex items-center gap-2">
                {profile.stats.platforms.map(p => (
                  <span key={p} className="text-[11px] px-2 py-0.5 rounded bg-white/15 ring-1 ring-white/30">{p}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link to={`/login?next=/dashboard/advertiser`} className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">Start Collaboration</Link>
            <Link to={`/login?next=/dashboard/advertiser`} className="px-3 py-1.5 rounded-md text-xs font-medium text-white/90 bg-white/20 ring-1 ring-white/40">Request Media Kit</Link>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-700 max-w-3xl">{profile.bio}</p>

      {/* Quick edit form */}
      <div className="mt-8 rounded-2xl p-[1px] bg-gray-200/60">
        <div className="rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <form className="mt-4 grid md:grid-cols-2 gap-4" onSubmit={saveProfile}>
            <label className="text-sm text-gray-700">Handle
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.handle} onChange={e=>setForm({ ...form, handle: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">Postal Code
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.postalCode} onChange={e=>setForm({ ...form, postalCode: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">Address Line 1
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.addressLine1} onChange={e=>setForm({ ...form, addressLine1: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">Address Line 2
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.addressLine2} onChange={e=>setForm({ ...form, addressLine2: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">Instagram
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.socialLinks.instagram} onChange={e=>setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} />
            </label>
            <label className="text-sm text-gray-700">YouTube
              <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.socialLinks.youtube} onChange={e=>setForm({ ...form, socialLinks: { ...form.socialLinks, youtube: e.target.value } })} />
            </label>
            <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
              <label className="text-sm text-gray-700">Instagram Reel (₹)
                <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.adPricing.instagramReel} onChange={e=>setForm({ ...form, adPricing: { ...form.adPricing, instagramReel: Number(e.target.value)||0 } })} />
              </label>
              <label className="text-sm text-gray-700">Instagram Story (₹)
                <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.adPricing.instagramStory} onChange={e=>setForm({ ...form, adPricing: { ...form.adPricing, instagramStory: Number(e.target.value)||0 } })} />
              </label>
              <label className="text-sm text-gray-700">Instagram Post (₹)
                <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.adPricing.instagramPost} onChange={e=>setForm({ ...form, adPricing: { ...form.adPricing, instagramPost: Number(e.target.value)||0 } })} />
              </label>
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
