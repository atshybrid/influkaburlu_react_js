import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, saveTokens } from '../utils/apiClient';

// Google Identity Services attaches itself to window.google
// eslint-disable-next-line no-unused-vars
const _googleGlobalHint = typeof window !== 'undefined' ? window.google : undefined;

function normalizeAuthResponse(data) {
  if (!data || typeof data !== 'object') return null;
  const token = data.token || data.accessToken || data.access_token;
  const refreshToken = data.refreshToken || data.refresh_token;
  const user = data.user || data.profile || data.me;
  const expiresAt = data.expiresAt || data.expires_at;
  const refreshExpiresAt = data.refreshExpiresAt || data.refresh_expires_at;
  if (!token) return null;
  return { token, refreshToken, user, expiresAt, refreshExpiresAt };
}

export default function GoogleAuthButton({
  role, // 'influencer' | 'brand'
  label,
  className,
  extraPayload,
  onSuccess,
  onError,
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const initIfPossible = () => {
    if (!clientId) return false;
    const google = window?.google;
    if (!google?.accounts?.id) return false;
    if (ready) return true;

    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          const idToken = resp?.credential;
          if (!idToken) {
            const err = new Error('Google sign-in did not return an ID token.');
            onError?.(err);
            return;
          }

          setLoading(true);
          try {
            const extras = typeof extraPayload === 'function' ? extraPayload() : (extraPayload || {});
            const payload = role ? { idToken, role, ...extras } : { idToken, ...extras };
            const data = await apiClient.request('/auth/google', {
              method: 'POST',
              body: JSON.stringify(payload),
              skipAuth: true,
            });

            const normalized = normalizeAuthResponse(data);
            if (!normalized) {
              throw new Error('Google login succeeded but no access token was returned.');
            }

            saveTokens(normalized);
            onSuccess?.(normalized);
          } catch (e) {
            onError?.(e);
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // Helps on some browsers where One Tap is gated behind FedCM.
        use_fedcm_for_prompt: true,
      });

      if (buttonRef.current) {
        // Render the official Google button. This works even when One Tap is skipped.
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }

      setReady(true);
      return true;
    } catch (e) {
      onError?.(e);
      return false;
    }
  };

  const buttonText = useMemo(() => {
    if (label) return label;
    if (role === 'brand') return 'Continue with Google (Brand)';
    if (role === 'influencer') return 'Continue with Google (Influencer)';
    return 'Continue with Google';
  }, [label, role]);

  useEffect(() => {
    if (!clientId) return;

    // GIS loads asynchronously; poll briefly.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (initIfPossible()) {
        window.clearInterval(timer);
      } else if (tries > 25) {
        window.clearInterval(timer);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [clientId, role, onError, onSuccess]);

  return (
    <div className="w-full">
      {label && <div className="mb-2 text-xs text-gray-700">{label}</div>}
      <div
        ref={buttonRef}
        className={className || 'w-full [&_div]:w-full'}
      />
      {!clientId && (
        <div className="mt-2 text-xs text-gray-500">
          Google login is not configured (missing VITE_GOOGLE_CLIENT_ID).
        </div>
      )}
      {clientId && !ready && (
        <div className="mt-2 text-xs text-gray-500">
          Loading Google login…
        </div>
      )}
      {loading && (
        <div className="mt-2 text-xs text-gray-500">
          Connecting…
        </div>
      )}
    </div>
  );
}
