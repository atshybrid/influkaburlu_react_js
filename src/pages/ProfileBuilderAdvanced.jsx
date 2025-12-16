import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import SeoHead from '../components/SeoHead';

export default function ProfileBuilderAdvanced(){
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [me, setMe] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [locLoading, setLocLoading] = useState({ countries: false, states: false, districts: false, languages: false });

  const [form, setForm] = useState({
    handle: '',
    bio: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    countryId: '',
    stateId: '',
    districtId: '',
    languageCodes: [],
    socialLinks: { instagram: '', youtube: '' },
  });

  const loadCountries = async () => {
    setLocLoading((p)=>({ ...p, countries: true }));
    try {
      const res = await apiClient.request('/locations/countries', { method: 'GET', skipAuth: true });
      setCountries(Array.isArray(res) ? res : []);
    } finally {
      setLocLoading((p)=>({ ...p, countries: false }));
    }
  };

  const loadStates = async (countryId) => {
    if (!countryId) { setStates([]); return; }
    setLocLoading((p)=>({ ...p, states: true }));
    try {
      const res = await apiClient.request(`/locations/states?countryId=${encodeURIComponent(countryId)}`, { method: 'GET', skipAuth: true });
      setStates(Array.isArray(res) ? res : []);
    } finally {
      setLocLoading((p)=>({ ...p, states: false }));
    }
  };

  const loadDistricts = async (stateId) => {
    if (!stateId) { setDistricts([]); return; }
    setLocLoading((p)=>({ ...p, districts: true }));
    try {
      const res = await apiClient.request(`/locations/districts?stateId=${encodeURIComponent(stateId)}`, { method: 'GET', skipAuth: true });
      setDistricts(Array.isArray(res) ? res : []);
    } finally {
      setLocLoading((p)=>({ ...p, districts: false }));
    }
  };

  const loadLanguages = async () => {
    setLocLoading((p)=>({ ...p, languages: true }));
    try {
      const res = await apiClient.request('/locations/languages', { method: 'GET', skipAuth: true });
      setLanguages(Array.isArray(res) ? res : []);
    } finally {
      setLocLoading((p)=>({ ...p, languages: false }));
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        await Promise.all([loadCountries(), loadLanguages()]);
        const profile = await apiClient.request('/influencers/me');
        if (!mounted) return;
        setMe(profile);

        const countryId = profile?.countryId || profile?.country?.id || '';
        const stateId = (Array.isArray(profile?.stateIds) ? profile.stateIds[0] : (profile?.stateId || '')) || '';
        const districtId = profile?.districtId || '';

        setForm({
          handle: profile?.handle || '',
          bio: profile?.bio || '',
          addressLine1: profile?.addressLine1 || '',
          addressLine2: profile?.addressLine2 || '',
          postalCode: profile?.postalCode || '',
          countryId: countryId ? String(countryId) : '',
          stateId: stateId ? String(stateId) : '',
          districtId: districtId ? String(districtId) : '',
          languageCodes: Array.isArray(profile?.languages) ? profile.languages : [],
          socialLinks: {
            instagram: profile?.socialLinks?.instagram || '',
            youtube: profile?.socialLinks?.youtube || '',
          },
        });

        if (countryId) await loadStates(countryId);
        if (stateId) await loadDistricts(stateId);
      } catch (e) {
        setError(e?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const toggleLanguage = (code) => {
    setForm((p) => {
      const exists = (p.languageCodes || []).includes(code);
      const next = exists ? p.languageCodes.filter((c)=>c!==code) : [...p.languageCodes, code];
      return { ...p, languageCodes: next };
    });
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        handle: form.handle,
        bio: form.bio,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        postalCode: form.postalCode,
        countryId: form.countryId ? Number(form.countryId) : undefined,
        stateIds: form.stateId ? [Number(form.stateId)] : [],
        districtId: form.districtId ? Number(form.districtId) : undefined,
        languages: form.languageCodes,
        socialLinks: {
          instagram: form.socialLinks.instagram,
          youtube: form.socialLinks.youtube,
        },
      };

      const res = await apiClient.request('/influencers/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setMe(res || me);
      setMessage('Profile updated successfully. Redirecting…');
      window.location.href = '/dashboard-influencer';
    } catch (e2) {
      setError(e2?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <SeoHead title="Edit Profile" noindex />
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Edit profile</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Profile Builder</h1>
            <p className="mt-2 text-sm text-gray-600">Update your location and languages using the latest lists.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">Country → State → District</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">Languages</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                    <div className="mt-1 text-xs text-gray-600">Changes save to your account (JWT required).</div>
                  </div>
                  <button type="button" onClick={()=>window.location.href='/dashboard-influencer'} className="px-3 py-2 rounded-md text-xs font-medium bg-gray-100 ring-1 ring-gray-200 text-gray-800">Back</button>
                </div>

                {loading && <div className="mt-4 text-sm text-gray-600">Loading…</div>}
                {error && <div className="mt-4 text-xs text-red-600">{error}</div>}
                {message && <div className="mt-4 text-xs text-emerald-700">{message}</div>}

                {!loading && (
                  <form className="mt-5 space-y-6" onSubmit={save}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="block text-sm text-gray-700">Handle
                        <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" placeholder="@yourhandle" value={form.handle} onChange={(e)=>setForm((p)=>({ ...p, handle: e.target.value }))} />
                      </label>
                      <label className="block text-sm text-gray-700">Postal code
                        <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" placeholder="500001" value={form.postalCode} onChange={(e)=>setForm((p)=>({ ...p, postalCode: e.target.value.replace(/[^0-9]/g,'').slice(0,10) }))} />
                      </label>
                      <label className="block text-sm text-gray-700 md:col-span-2">Bio
                        <textarea className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2" rows={3} value={form.bio} onChange={(e)=>setForm((p)=>({ ...p, bio: e.target.value }))} placeholder="Tell brands what you create…" />
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="block text-sm text-gray-700">Address line 1
                        <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" value={form.addressLine1} onChange={(e)=>setForm((p)=>({ ...p, addressLine1: e.target.value }))} />
                      </label>
                      <label className="block text-sm text-gray-700">Address line 2
                        <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" value={form.addressLine2} onChange={(e)=>setForm((p)=>({ ...p, addressLine2: e.target.value }))} />
                      </label>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900">Location</div>
                      <div className="mt-3 grid md:grid-cols-3 gap-4">
                        <label className="block text-sm text-gray-700">Country
                          <select
                            className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3"
                            value={form.countryId}
                            disabled={locLoading.countries}
                            onChange={async (e)=>{
                              const v = e.target.value;
                              setForm((p)=>({ ...p, countryId: v, stateId: '', districtId: '' }));
                              setDistricts([]);
                              await loadStates(v);
                            }}
                          >
                            <option value="">Select</option>
                            {countries.map((c)=> (
                              <option key={c.id} value={String(c.id)}>{c.name}</option>
                            ))}
                          </select>
                        </label>

                        <label className="block text-sm text-gray-700">State
                          <select
                            className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3"
                            value={form.stateId}
                            disabled={!form.countryId || locLoading.states}
                            onChange={async (e)=>{
                              const v = e.target.value;
                              setForm((p)=>({ ...p, stateId: v, districtId: '' }));
                              await loadDistricts(v);
                            }}
                          >
                            <option value="">Select</option>
                            {states.map((s)=> (
                              <option key={s.id} value={String(s.id)}>{s.name}</option>
                            ))}
                          </select>
                        </label>

                        <label className="block text-sm text-gray-700">District
                          <select
                            className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3"
                            value={form.districtId}
                            disabled={!form.stateId || locLoading.districts}
                            onChange={(e)=>setForm((p)=>({ ...p, districtId: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {districts.map((d)=> (
                              <option key={d.id} value={String(d.id)}>{d.name}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900">Languages</div>
                      <div className="mt-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                        {locLoading.languages ? (
                          <div className="text-sm text-gray-600">Loading…</div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {languages.map((l) => (
                              <label key={l.code} className="flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={(form.languageCodes || []).includes(l.code)} onChange={()=>toggleLanguage(l.code)} />
                                <span>{l.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900">Social links</div>
                      <div className="mt-3 grid md:grid-cols-2 gap-4">
                        <label className="block text-sm text-gray-700">Instagram
                          <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" value={form.socialLinks.instagram} onChange={(e)=>setForm((p)=>({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))} placeholder="https://instagram.com/…" />
                        </label>
                        <label className="block text-sm text-gray-700">YouTube
                          <input className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" value={form.socialLinks.youtube} onChange={(e)=>setForm((p)=>({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))} placeholder="https://youtube.com/…" />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={()=>window.location.reload()} className="px-3 py-2 rounded-md text-sm bg-gray-100" disabled={saving}>Reset</button>
                      <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}