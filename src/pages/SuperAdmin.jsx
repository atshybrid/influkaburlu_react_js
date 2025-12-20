import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../utils/apiClient';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'creators', label: 'Creators' },
  { key: 'brands', label: 'Brands' },
  { key: 'ads', label: 'Ads' },
  { key: 'settings', label: 'Settings' },
];

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [lastUpdatedIso, setLastUpdatedIso] = useState('');

  const loadSummary = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiClient.request('/admin/summary', { method: 'GET' });
      setSummary(data || null);
      setLastUpdatedIso(new Date().toISOString());
    } catch (e) {
      setSummary(null);
      setLastUpdatedIso('');
      setError(
        e?.message ||
          'Could not load admin summary. Ensure the backend exposes GET /admin/summary for super admins.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const metrics = useMemo(() => {
    const s = summary && typeof summary === 'object' ? summary : {};
    return [
      { title: 'Total users', value: numberOrDash(s.totalUsers) },
      { title: 'Creators', value: numberOrDash(s.totalCreators) },
      { title: 'Brands', value: numberOrDash(s.totalBrands) },
      { title: 'Active campaigns', value: numberOrDash(s.activeCampaigns) },
      { title: 'Pending approvals', value: numberOrDash(s.pendingApprovals) },
      { title: 'Platform revenue', value: s.platformRevenue ?? '—' },
    ];
  }, [summary]);

  const queues = useMemo(() => {
    const s = summary && typeof summary === 'object' ? summary : {};
    return [
      {
        title: 'Creator verifications',
        value: numberOrDash(s.pendingCreatorVerifications ?? s.pendingCreatorApprovals),
        hint: 'Verify creators before they appear as trusted.',
        tab: 'creators',
      },
      {
        title: 'Brand verifications',
        value: numberOrDash(s.pendingBrandVerifications ?? s.pendingBrandApprovals),
        hint: 'Confirm brand legitimacy and billing readiness.',
        tab: 'brands',
      },
      {
        title: 'Campaign approvals',
        value: numberOrDash(s.pendingCampaignApprovals ?? s.pendingCampaigns),
        hint: 'Approve briefs, budgets, and compliance.',
        tab: 'ads',
      },
    ];
  }, [summary]);

  return (
    <section className="py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-gray-500">Admin / Super Admin</div>
          <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Internal controls for platform operations. Restricted access.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={
              activeTab === t.key
                ? 'px-3 py-2 rounded-md text-sm bg-gray-900 text-white'
                : 'px-3 py-2 rounded-md text-sm border border-gray-300 bg-white hover:bg-gray-50'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl p-[1px] bg-red-200/60">
          <div className="rounded-2xl bg-white p-5">
            <div className="font-semibold text-red-700">Couldn’t load data</div>
            <div className="mt-1 text-sm text-gray-700">{error}</div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.title} title={m.title} value={m.value} />
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {queues.map((q) => (
              <QueueCard
                key={q.title}
                title={q.title}
                value={q.value}
                hint={q.hint}
                onOpen={() => setActiveTab(q.tab)}
              />
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Panel title="Operational checklist" subtitle={lastUpdatedIso ? `Last refreshed: ${formatIso(lastUpdatedIso)}` : ''}>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>Review pending approvals and verifications</li>
                <li>Monitor failed payments / payout queue</li>
                <li>Audit role changes and admin actions</li>
                <li>Check system health and API error rate</li>
              </ul>
            </Panel>

            <Panel title="System status" subtitle="Best practice: keep this server-driven">
              <div className="text-sm text-gray-700">
                {summary ? (
                  <div className="space-y-2">
                    <Row label="API" value={summary.apiStatus ?? '—'} />
                    <Row label="Queue" value={summary.queueStatus ?? '—'} />
                    <Row label="Last deploy" value={summary.lastDeployAt ?? '—'} />
                  </div>
                ) : (
                  <EmptyState text="Connect GET /admin/summary to show live status." />
                )}
              </div>
            </Panel>
          </div>
        </>
      )}

      {activeTab !== 'overview' && (
        <div className="mt-6">
          <div className="rounded-2xl p-[1px] bg-gray-200/60">
            <div className="rounded-2xl bg-white p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">{tabTitle(activeTab)}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    UI-first shell. Next step is wiring to backend list + action endpoints.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50"
                >
                  Back to overview
                </button>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <PlaceholderPanel title="Recommended endpoints" items={recommendedEndpoints(activeTab)} />
                <PlaceholderPanel
                  title="Best-practice safeguards"
                  items={[
                    'Require super-admin role server-side (not just in UI)',
                    'Log every action (who/what/when) for audits',
                    'Use pagination + rate limits on list endpoints',
                    'Avoid exposing PII unless necessary',
                  ]}
                />
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900">Workspace</div>
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                  <Panel title="Primary list" subtitle="Table view goes here">
                    <EmptyState text="Connect a list endpoint and render rows." />
                  </Panel>
                  <Panel title="Action queue" subtitle="Approvals / moderation">
                    <EmptyState text="Connect a queue endpoint and render tasks." />
                  </Panel>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
      <div className="rounded-2xl bg-white p-5">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-xl font-semibold text-gray-900">{String(value ?? '—')}</div>
      </div>
    </div>
  );
}

function QueueCard({ title, value, hint, onOpen }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-5 h-full flex flex-col">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{String(value ?? '—')}</div>
        <div className="mt-2 text-sm text-gray-600 flex-1">{hint}</div>
        <div className="mt-4">
          <button
            onClick={onOpen}
            className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-6 h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900">{String(value ?? '—')}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      {text}
    </div>
  );
}

function PlaceholderPanel({ title, items }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-5">
        <div className="font-semibold">{title}</div>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function numberOrDash(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString();
  if (typeof v === 'string' && v.trim()) return v;
  return '—';
}

function formatIso(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function tabTitle(key) {
  const t = TABS.find((x) => x.key === key);
  return t ? t.label : 'Section';
}

function recommendedEndpoints(tabKey) {
  switch (tabKey) {
    case 'users':
      return ['GET /admin/users?query=&limit=&offset=', 'PATCH /admin/users/:id/role', 'POST /admin/users/:id/disable'];
    case 'creators':
      return ['GET /admin/creators?query=&status=', 'POST /admin/creators/:id/verify', 'POST /admin/creators/:id/reject'];
    case 'brands':
      return ['GET /admin/brands?query=&status=', 'POST /admin/brands/:id/verify', 'POST /admin/brands/:id/reject'];
    case 'ads':
      return ['GET /admin/campaigns?status=', 'POST /admin/campaigns/:id/approve', 'POST /admin/campaigns/:id/reject'];
    case 'settings':
      return ['GET /admin/settings', 'PATCH /admin/settings', 'GET /admin/audit-log?limit=&offset='];
    default:
      return ['GET /admin/summary'];
  }
}
