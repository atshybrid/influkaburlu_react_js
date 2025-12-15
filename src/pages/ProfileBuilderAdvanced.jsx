import React, { useState } from 'react';
import axios from 'axios';

export default function ProfileBuilderAdvanced(){
  const [form, setForm] = useState({ name: '', niche: '', city: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('kab_token') || '';
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const r = await axios.post(apiUrl + '/profile-builder/generate', form, { headers: { Authorization: 'Bearer ' + token } });
        setResult(r.data);
      } else {
        setResult({ shortBio: `${form.name} • ${form.niche} creator in ${form.city}. Authentic UGC with consistent engagement.`, jsonLd: { name: form.name, location: form.city, genre: form.niche } });
      }
    } catch (e) {
      setError('Error generating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Creator tools</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Profile Builder</h1>
            <p className="mt-2 text-sm text-gray-600">Generate a short bio and a clean JSON-LD for your public profile.</p>
            <div className="mt-6 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">Auto formats & best practices</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">One‑click copy</span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
              <div className="rounded-2xl bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900">Enter details</h2>
                {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
                <div className="mt-4 space-y-4">
                  <label className="block text-sm text-gray-700">Full name
                    <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="e.g., Aisha Verma" onChange={e=>setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label className="block text-sm text-gray-700">Niche
                    <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="e.g., Fashion, Beauty, Travel" onChange={e=>setForm({ ...form, niche: e.target.value })} />
                  </label>
                  <label className="block text-sm text-gray-700">City
                    <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="e.g., Mumbai, Maharashtra" onChange={e=>setForm({ ...form, city: e.target.value })} />
                  </label>
                  <button className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate Profile Pack'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {result && (
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
              <div className="rounded-2xl bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900">Generated short bio</h3>
                <p className="mt-2 text-sm text-gray-700">{result.shortBio}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100" onClick={()=>navigator.clipboard.writeText(result.shortBio)}>Copy bio</button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
              <div className="rounded-2xl bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900">JSON‑LD (preview)</h3>
                <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(result.jsonLd, null, 2)}</pre>
                <div className="mt-3 flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100" onClick={()=>navigator.clipboard.writeText(JSON.stringify(result.jsonLd, null, 2))}>Copy JSON‑LD</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}