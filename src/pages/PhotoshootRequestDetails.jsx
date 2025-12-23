import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

function Panel({ children, gradient }) {
  return (
    <div className={`rounded-2xl p-[1px] ${gradient ? 'bg-gradient-to-br from-orange-200 to-pink-200' : 'bg-gray-200/60'}`}>
      <div className="rounded-2xl bg-white p-6">{children}</div>
    </div>
  );
}

function getStatusUi(statusRaw) {
  const status = (statusRaw || '').toString().toLowerCase();
  if (status === 'scheduled') {
    return { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', border: 'border-l-4 border-emerald-400', title: 'Scheduled' };
  }
  if (status === 'pending') {
    return { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', border: 'border-l-4 border-amber-400', title: 'Pending' };
  }
  if (status === 'rejected') {
    return { badge: 'bg-red-50 text-red-700 ring-1 ring-red-200', border: 'border-l-4 border-red-400', title: 'Rejected' };
  }
  return { badge: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200', border: 'border-l-4 border-gray-200', title: statusRaw || '—' };
}

function formatDateTime(iso, timeZone) {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    }).format(d);
  } catch {
    return String(iso || '');
  }
}

function formatRange(startIso, endIso, timeZone) {
  const a = formatDateTime(startIso, timeZone);
  const b = formatDateTime(endIso, timeZone);
  if (a && b) return `${a} → ${b}`;
  return a || b || '';
}

function locationLabel(loc) {
  const city = (loc?.city || '').toString().trim();
  const area = (loc?.area || '').toString().trim();
  const address = (loc?.address || '').toString().trim();
  if (city && area) return `${area}, ${city}`;
  if (city && address) return `${address}, ${city}`;
  if (city) return city;
  return area || address || '';
}

export default function PhotoshootRequestDetails() {
  const navigate = useNavigate();
  const { ulid } = useParams();
  const loc = useLocation();

  const [item, setItem] = useState(loc?.state?.item || null);
  const [latestDetails, setLatestDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const merged = useMemo(() => {
    if (!item) return null;
    const latest = latestDetails?.request;
    if (latest && latest.ulid === item.ulid) {
      return { ...item, ...latest, __fullDetails: latest };
    }
    return { ...item, __fullDetails: null };
  }, [item, latestDetails]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // If user refreshed this page, we may not have navigation state.
        if (!item && ulid) {
          const qs = new URLSearchParams({ limit: '50', offset: '0' });
          const res = await apiClient.request(`/influencers/me/photoshoots/requests?${qs.toString()}`, { method: 'GET' });
          const found = (Array.isArray(res?.items) ? res.items : []).find((x) => x?.ulid === ulid);
          if (mounted) setItem(found || null);
        }

        const latest = await apiClient.request('/influencers/me/photoshoots/requests/latest', { method: 'GET' });
        if (mounted) setLatestDetails(latest || null);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load request details.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ulid]);

  if (!merged) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Photoshoot Request</h1>
            <div className="mt-1 text-sm text-gray-600">Request details</div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard-influencer?tab=photoshoot')}
            className="px-3 py-2 rounded-md text-sm bg-gray-100 ring-1 ring-gray-200"
          >
            Back
          </button>
        </div>
        <div className="mt-6">
          <Panel>
            {loading ? (
              <div className="text-sm text-gray-600">Loading…</div>
            ) : (
              <div className="text-sm text-gray-600">Request not found.</div>
            )}
            {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
          </Panel>
        </div>
      </div>
    );
  }

  const ui = getStatusUi(merged.status);
  const tz = merged.scheduledTimezone || merged.requestedTimezone || 'Asia/Kolkata';
  const statusLower = (merged.status || '').toString().toLowerCase();
  const isScheduled = statusLower === 'scheduled';

  const when = isScheduled
    ? (formatRange(merged.scheduledStartAt, merged.scheduledEndAt, tz) || formatRange(merged.requestedStartAt, merged.requestedEndAt, tz))
    : (formatRange(merged.requestedStartAt, merged.requestedEndAt, tz) || formatRange(merged.scheduledStartAt, merged.scheduledEndAt, tz));

  const where = locationLabel(merged.location);
  const full = merged.__fullDetails;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Photoshoot Request</h1>
          <div className="mt-1 text-sm text-gray-600">ULID: {merged.ulid}</div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard-influencer?tab=photoshoot')}
          className="px-3 py-2 rounded-md text-sm bg-gray-100 ring-1 ring-gray-200"
        >
          Back
        </button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <Panel gradient>
          <div className={`rounded-xl bg-white ring-1 ring-gray-200 px-4 py-4 ${ui.border}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ui.badge}`}>{ui.title}</span>
                  <div className="text-xs text-gray-500">Timezone: {tz}</div>
                </div>
                {when && <div className="mt-3 text-sm font-semibold text-gray-900">{when}</div>}
                {where && <div className="mt-1 text-sm text-gray-700">{where}</div>}
              </div>
            </div>

            {(merged.adminNotes || merged.rejectReason) && (
              <div className="mt-3 text-xs">
                {merged.adminNotes && <div className="text-gray-600">Admin: {merged.adminNotes}</div>}
                {merged.rejectReason && <div className="text-red-700">Reject: {merged.rejectReason}</div>}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <div>Created: {(merged.createdAt || '').toString().slice(0, 10) || '—'}</div>
              <div>Updated: {(merged.updatedAt || '').toString().slice(0, 10) || '—'}</div>
            </div>
          </div>

          {loading && <div className="mt-3 text-xs text-gray-600">Refreshing…</div>}
          {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
        </Panel>

        <div className="lg:col-span-2 space-y-6">
          <Panel>
            <h2 className="font-semibold">Full Details</h2>
            <div className="mt-2 text-xs text-gray-600">
              {full ? 'Showing full request details (from latest endpoint).' : 'Full details are only available for the latest request; showing summary for this ULID.'}
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4 overflow-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                {JSON.stringify(full || merged, null, 2)}
              </pre>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">New Request</h2>
                <div className="mt-1 text-xs text-gray-600">Submit another slot request.</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/photoshoot/new')}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
              >
                New Request
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
