import React from 'react';
import { Link } from 'react-router-dom';
import PublicInfluencerCard from '../components/PublicInfluencerCard';
import { apiClient } from '../utils/apiClient';

export default function Influencers() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [limit, setLimit] = React.useState(6);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mqMd = window.matchMedia('(min-width: 768px)');
    const mqLg = window.matchMedia('(min-width: 1024px)');
    const compute = () => {
      setLimit(mqLg.matches ? 8 : mqMd.matches ? 6 : 4);
    };
    compute();

    if (typeof mqMd.addEventListener === 'function') {
      mqMd.addEventListener('change', compute);
      mqLg.addEventListener('change', compute);
      return () => {
        mqMd.removeEventListener('change', compute);
        mqLg.removeEventListener('change', compute);
      };
    }

    // Safari fallback
    mqMd.addListener(compute);
    mqLg.addListener(compute);
    return () => {
      mqMd.removeListener(compute);
      mqLg.removeListener(compute);
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.request('/public/influencers?limit=30&offset=0', { method: 'GET', skipAuth: true });
        const list = Array.isArray(res?.items) ? res.items : [];
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setError(typeof e?.message === 'string' ? e.message : 'Failed to load creators');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visibleItems = React.useMemo(() => items.slice(0, limit), [items, limit]);

  return (
    <section id="influencers" className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">CREATORS</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Featured creators</h2>
          <p className="mt-2 text-gray-600">Watch recent creator videos right in the card.</p>
        </div>
        <Link
          to="/influencers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
        >
          View all
          <svg viewBox="0 0 20 20" className="h-4 w-4"><path fill="currentColor" d="M7 5l5 5-5 5V5z"/></svg>
        </Link>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        {loading ? 'Loading creators…' : `Showing ${Math.min(visibleItems.length, items.length)} of ${items.length} creators`}
      </div>

      {error && !loading && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!loading && visibleItems.map((inf) => (
          <PublicInfluencerCard key={inf.idUlid} influencer={inf} />
        ))}
      </div>
    </section>
  );
}
