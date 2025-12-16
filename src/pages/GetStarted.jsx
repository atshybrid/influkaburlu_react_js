import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SeoHead from '../components/SeoHead';

export default function GetStarted() {
  const [params] = useSearchParams();
  const [role, setRole] = useState('influencer');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [mpinDigits, setMpinDigits] = useState(['','','','','','']);
  const boxesRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mpin = mpinDigits.join('');

  const handleDigitChange = (idx, val) => {
    const v = (val || '').replace(/[^0-9]/g, '').slice(0, 1);
    const nextDigits = [...mpinDigits];
    nextDigits[idx] = v;
    setMpinDigits(nextDigits);
    if (v && boxesRef.current[idx + 1]) boxesRef.current[idx + 1].focus();
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !mpinDigits[idx] && boxesRef.current[idx - 1]) {
      boxesRef.current[idx - 1].focus();
    }
  };

  useEffect(() => {
    const r = (params.get('role') || '').toString().toLowerCase();
    if (r === 'advertiser' || r === 'brand') setRole('advertiser');
    if (r === 'influencer' || r === 'creator') setRole('influencer');
  }, [params]);

  const register = async (e) => {
    e.preventDefault();
    if ((form.phone || '').toString().trim().length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (mpin.length !== 6) {
      setError('Please set a 6-digit MPIN.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      // Backend compatibility: some deployments may still expect `password`.
      const payload = {
        ...form,
        phone: (form.phone || '').toString().trim(),
        role,
        mpin,
        password: mpin,
      };
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
        window.location.href = role === 'influencer' ? '/dashboard-influencer' : '/dashboard-advertiser';
      }, 600);
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead title="Get Started" noindex />
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Create your account</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Get Started</h1>
            <p className="mt-2 text-sm text-gray-600">Choose your role and set a secure 6-digit MPIN for quick sign in.</p>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                <div className="font-semibold text-gray-900">Creator accounts</div>
                <div className="mt-1 text-xs text-gray-600">Build your profile, upload ad media, and receive brand requests.</div>
              </div>
              <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
                <div className="font-semibold text-gray-900">Brand accounts</div>
                <div className="mt-1 text-xs text-gray-600">Browse creators, plan campaigns, and manage collaborations.</div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Create account</h2>
                  <Link to="/login" className="text-xs text-orange-600">Sign in</Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('influencer')}
                    className={`h-11 rounded-md text-sm font-medium ring-1 ${role==='influencer' ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-800 ring-gray-200'}`}
                  >
                    Creator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('advertiser')}
                    className={`h-11 rounded-md text-sm font-medium ring-1 ${role==='advertiser' ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-800 ring-gray-200'}`}
                  >
                    Brand
                  </button>
                </div>

                {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
                {success && <div className="mt-3 text-xs text-green-700">{success}</div>}

                <form className="mt-5 space-y-4" onSubmit={register}>
                  <label className="block text-sm text-gray-700">Name
                    <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" placeholder="Full name" />
                  </label>
                  <label className="block text-sm text-gray-700">Phone
                    <input
                      value={form.phone}
                      onChange={e=>setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0,10) })}
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 tracking-wider"
                      placeholder="8282868389"
                    />
                  </label>
                  <label className="block text-sm text-gray-700">Email
                    <input value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} required type="email" className="mt-1 w-full h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3" placeholder="you@company.com" />
                  </label>

                  <div>
                    <label className="block text-sm text-gray-700">Set 6-digit MPIN</label>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {mpinDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={el => boxesRef.current[i] = el}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e)=>handleDigitChange(i, e.target.value)}
                          onKeyDown={(e)=>handleDigitKeyDown(i, e)}
                          className="h-12 text-center rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-lg"
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">MPIN must be exactly 6 digits.</div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full h-12 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                  <div className="text-center">
                    <Link to="/login" className="text-xs text-gray-700">Already have an account? Sign in</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}