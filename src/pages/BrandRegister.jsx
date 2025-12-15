import React, { useState } from 'react';
import axios from 'axios';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function BrandRegister(){
  const [form, setForm] = useState({
    company: '',
    website: '',
    contactName: '',
    email: '',
    logoUrl: '',
    monthlyBudget: '',
    objective: 'Awareness',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const register = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        await axios.post(apiUrl + '/brands/register', form);
      }
      setSuccess('Brand registered successfully. Redirecting to dashboard…');
      setTimeout(()=>{ window.location.href = '/dashboard/advertiser'; }, 800);
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Advertiser onboarding</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Register Your Brand</h1>
          <p className="mt-2 text-sm text-gray-600">Create your advertiser account to find creators and launch campaigns.</p>
        </div>

        <div className="mt-8 mx-auto w-full max-w-2xl">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
            <form className="rounded-2xl bg-white p-6" onSubmit={register}>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                <GoogleAuthButton
                  role="brand"
                  label="Continue with Google"
                  onSuccess={() => {
                    window.location.href = '/dashboard-advertiser';
                  }}
                  onError={(e) => {
                    setError(e?.message || 'Google sign-in failed.');
                  }}
                />
                <a
                  href="/login"
                  className="w-full px-3 py-2 rounded-md text-sm font-medium text-gray-800 bg-gray-100 inline-flex items-center justify-center"
                >
                  Sign in with MPIN
                </a>
              </div>
              {error && <div className="mb-3 text-xs text-red-600">{error}</div>}
              {success && <div className="mb-3 text-xs text-green-700">{success}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">Company name
                  <input required className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="e.g., Kaburlu Foods Pvt Ltd" value={form.company} onChange={e=>setForm({ ...form, company: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700">Website
                  <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="https://example.com" value={form.website} onChange={e=>setForm({ ...form, website: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700">Contact name
                  <input required className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="Your name" value={form.contactName} onChange={e=>setForm({ ...form, contactName: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700">Email
                  <input required type="email" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="you@brand.com" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700">Logo URL
                  <input className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="https://…/logo.png" value={form.logoUrl} onChange={e=>setForm({ ...form, logoUrl: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700">Monthly budget (USD)
                  <input type="number" min="0" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="5000" value={form.monthlyBudget} onChange={e=>setForm({ ...form, monthlyBudget: e.target.value })} />
                </label>
                <label className="text-sm text-gray-700 md:col-span-2">Primary objective
                  <select className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" value={form.objective} onChange={e=>setForm({ ...form, objective: e.target.value })}>
                    <option>Awareness</option>
                    <option>Traffic</option>
                    <option>Conversions</option>
                    <option>UGC Assets</option>
                  </select>
                </label>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <a href="/login" className="text-xs text-gray-700">Already registered? Sign in</a>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">{loading ? 'Creating…' : 'Create advertiser account'}</button>
              </div>
            </form>
          </div>
          {form.logoUrl && (
            <div className="mt-6 flex items-center gap-3">
              <img src={form.logoUrl} alt="logo preview" className="h-12 w-12 rounded ring-1 ring-gray-200 object-contain bg-white" onError={(e)=>{e.currentTarget.style.display='none'}} />
              <span className="text-xs text-gray-600">Logo preview</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}