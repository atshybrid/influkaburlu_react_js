let API_BASE = import.meta.env.VITE_API_URL || 'https://influapi.kaburlumedia.com/api';
// Normalize API base to ensure it ends with /api (tolerate trailing slashes)
if (API_BASE) {
  const trimmed = String(API_BASE).trim().replace(/\/+$/, '');
  API_BASE = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

// Simple API client with token refresh support
export const apiClient = {
  async request(path, options = {}) {
    const base = (API_BASE || '').trim();
    const p = (path || '').startsWith('/') ? path : `/${path}`;
    const url = base ? `${base}${p}` : p; // if base missing, falls back to relative
    // Debug info to help diagnose base URL issues
    if (typeof window !== 'undefined') {
      console.debug('[apiClient] Request URL:', url);
    }
    const isFormData = options && options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const tokens = getTokens();
    if (tokens?.token && !options.skipAuth) {
      headers.Authorization = `Bearer ${tokens.token}`;
    }

    let res = await fetch(url, { ...options, headers });

    // If unauthorized and we have a refresh token, try to refresh
    if (res.status === 401 && tokens?.refreshToken && !options.skipRefresh) {
      const refreshed = await refreshToken(tokens.refreshToken);
      if (refreshed?.token) {
        saveTokens(refreshed);
        headers.Authorization = `Bearer ${refreshed.token}`;
        res = await fetch(url, { ...options, headers, skipRefresh: true });
      } else {
        // Refresh failed; redirect to login preserving current path
        safeRedirectToLogin();
        throw new Error('Unauthorized: please sign in again.');
      }
    }

    // If still unauthorized, redirect to login
    if (res.status === 401) {
      safeRedirectToLogin();
      throw new Error('Unauthorized: please sign in again.');
    }

    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json().catch(() => null);
        const msg = j?.message || j?.error || `Request failed: ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = j;
        throw err;
      } else {
        // Avoid throwing raw HTML into the UI; use concise status text
        const statusText = res.statusText || 'Server Error';
        const err = new Error(`${statusText} (${res.status})`);
        err.status = res.status;
        throw err;
      }
    }

    // Some endpoints (notably DELETE) may return 204 No Content
    if (res.status === 204) return null;

    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return res.json();
    }
    // If server responds with empty body, avoid parsing errors
    const text = await res.text().catch(() => '');
    return text || null;
  },
};

export function normalizeRole(role) {
  const r = (role || '').toString().trim().toLowerCase();
  if (!r) return '';
  // Keep frontend route roles consistent
  if (r === 'brand') return 'advertiser';
  if (r === 'business') return 'advertiser';
  if (r === 'creator') return 'influencer';
  return r;
}

export function parseJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  const payload = parseJwtPayload(token);
  const direct = payload?.role || payload?.user?.role || payload?.claims?.role || payload?.profile?.role;
  return normalizeRole(direct);
}

export function clearSession() {
  // Auth keys
  localStorage.removeItem('auth.token');
  localStorage.removeItem('auth.refreshToken');
  localStorage.removeItem('auth.expiresAt');
  localStorage.removeItem('auth.refreshExpiresAt');
  localStorage.removeItem('auth.user');
  // Legacy key used by older flows
  localStorage.removeItem('kab_token');
}

export function saveTokens({ token, refreshToken, expiresAt, refreshExpiresAt, user }) {
  // Start from a clean slate to avoid cross-session leakage
  clearSession();

  if (token) localStorage.setItem('auth.token', token);
  if (refreshToken) localStorage.setItem('auth.refreshToken', refreshToken);
  if (expiresAt) localStorage.setItem('auth.expiresAt', expiresAt);
  if (refreshExpiresAt) localStorage.setItem('auth.refreshExpiresAt', refreshExpiresAt);

  const normalizedRole = normalizeRole(user?.role) || getRoleFromToken(token);
  if (user && typeof user === 'object') {
    const normalizedUser = { ...user, role: normalizedRole || user.role };
    localStorage.setItem('auth.user', JSON.stringify(normalizedUser));
  } else if (normalizedRole) {
    // Store minimal user so role-gated routes work even if backend omits user
    localStorage.setItem('auth.user', JSON.stringify({ role: normalizedRole }));
  }
}

export function getTokens() {
  const token = localStorage.getItem('auth.token') || '';
  const refreshToken = localStorage.getItem('auth.refreshToken') || '';
  const expiresAt = localStorage.getItem('auth.expiresAt') || '';
  const refreshExpiresAt = localStorage.getItem('auth.refreshExpiresAt') || '';
  const user = safeParse(localStorage.getItem('auth.user'));
  if (!token && !refreshToken) return null;
  return { token, refreshToken, expiresAt, refreshExpiresAt, user };
}

export async function refreshToken(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  const tokens = getTokens();
  // Clear immediately so UI never shows stale data
  clearSession();
  try {
    if (tokens?.refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    }
  } finally {}
}

function safeParse(str) {
  try { return str ? JSON.parse(str) : null; } catch { return null; }
}

function safeRedirectToLogin() {
  if (typeof window === 'undefined') return;
  try {
    const next = window.location.pathname + window.location.search;
    window.location.replace(`/login?next=${encodeURIComponent(next)}`);
  } catch {}
}
