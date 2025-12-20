import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { apiClient } from '../utils/apiClient';

function normalizeCode(code) {
  return (code || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
}

export default function Referral() {
  const [params] = useSearchParams();
  const code = normalizeCode(params.get('code'));
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('auth.token');
    if (!code) return;

    // If not logged in, stash the code and send the user to login.
    if (!token) {
      try {
        localStorage.setItem('pending_referral_code', code);
      } catch {}
      const next = `/referral?code=${encodeURIComponent(code)}`;
      window.location.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Logged in: apply immediately.
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        await apiClient.request('/influencers/me/referral/apply', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        if (!mounted) return;
        setMessage('Referral code applied successfully.');
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to apply referral code.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [code]);

  return (
    <main className="py-10">
      <SeoHead title="Referral" noindex />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Referral</h1>
      {!code && (
        <div className="mt-4 text-sm text-gray-700">Missing referral code.</div>
      )}
      {code && (
        <div className="mt-4 rounded-2xl ring-1 ring-gray-200 bg-white p-6">
          <div className="text-sm text-gray-700">Code</div>
          <div className="mt-1 font-mono text-lg text-gray-900">{code}</div>
          {loading && <div className="mt-3 text-sm text-gray-600">Applying…</div>}
          {message && <div className="mt-3 text-sm text-emerald-700">{message}</div>}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          <div className="mt-4 text-xs text-gray-600">You can view referral status in your dashboard → Referral tab.</div>
        </div>
      )}
    </main>
  );
}
