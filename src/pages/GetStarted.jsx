import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function GetStarted() {
  const [role, setRole] = useState('influencer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const register = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = { ...form, role };
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const r = await axios.post(apiUrl + '/auth/register', payload);
        if (r.data?.token) {
          localStorage.setItem('kab_token', r.data.token);
        }
      }
      // Fallback: if no API URL configured, still proceed to app
      setSuccess('Account created successfully. Redirecting…');
      window.setTimeout(() => {
        window.location.href = role === 'influencer' ? '/dashboard/influencer' : '/dashboard/advertiser';
      }, 600);
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Create your account</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Get Started</h1>
            <p className="mt-2 text-sm text-gray-600">Choose how you’ll use Influ Kaburlu: as an Influencer or as an Advertiser.</p>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <button onClick={()=>setRole('influencer')} className={`rounded-2xl p-[1px] ${role==='influencer'?'bg-gradient-to-br from-orange-200 to-pink-200':'bg-gray-200/60'}`}>
              <div className="rounded-2xl bg-white p-5 text-left">
                <div className="text-sm font-semibold text-gray-900">Influencer</div>
                <div className="mt-1 text-xs text-gray-600">Grow collaborations, monetize content, and manage deliverables.</div>
              </div>
            </button>
            <button onClick={()=>setRole('advertiser')} className={`rounded-2xl p-[1px] ${role==='advertiser'?'bg-gradient-to-br from-orange-200 to-pink-200':'bg-gray-200/60'}`}>
              <div className="rounded-2xl bg-white p-5 text-left">
                <div className="text-sm font-semibold text-gray-900">Advertiser / Business</div>
                <div className="mt-1 text-xs text-gray-600">Find creators, launch campaigns, and track performance.</div>
              </div>
            </button>
          </div>

          {error && <div className="mt-4 text-xs text-red-600">{error}</div>}
          {success && <div className="mt-4 text-xs text-green-700">{success}</div>}
          <form className="mt-6 grid md:grid-cols-2 gap-4" onSubmit={register}>
            <label className="text-sm text-gray-700">Name
              <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="Full name" />
            </label>
            <label className="text-sm text-gray-700">Email
              <input value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} required type="email" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="you@company.com" />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">Password
              <input value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} required type="password" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="••••••••" />
            </label>
            <div className="md:col-span-2 flex items-center justify-between">
              <Link to="/login" className="text-xs text-gray-700">Already have an account? Sign in</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">{loading ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
              <label className="text-sm text-gray-700">Phone
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="8282868389" />
              </label>
}