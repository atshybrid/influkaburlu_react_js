let API_BASE = import.meta.env.VITE_API_URL || 'https://influapi.kaburlumedia.com/api';
// Normalize API base to ensure it ends with /api
if (API_BASE && !API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.replace(/\/$/, '') + '/api';
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
        throw new Error(msg);
      } else {
        // Avoid throwing raw HTML into the UI; use concise status text
        const statusText = res.statusText || 'Server Error';
        throw new Error(`${statusText} (${res.status})`);
      }
    }
    return res.json();
  },
};

export function saveTokens({ token, refreshToken, expiresAt, refreshExpiresAt, user }) {
  localStorage.setItem('auth.token', token || '');
  localStorage.setItem('auth.refreshToken', refreshToken || '');
  if (expiresAt) localStorage.setItem('auth.expiresAt', expiresAt);
  if (refreshExpiresAt) localStorage.setItem('auth.refreshExpiresAt', refreshExpiresAt);
  if (user) localStorage.setItem('auth.user', JSON.stringify(user));
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
  try {
    if (tokens?.refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    }
  } finally {
    localStorage.removeItem('auth.token');
    localStorage.removeItem('auth.refreshToken');
    localStorage.removeItem('auth.expiresAt');
    localStorage.removeItem('auth.refreshExpiresAt');
    localStorage.removeItem('auth.user');
  }
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
