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
  phoneMode, // 'before' | undefined
  extraPayload,
  onSuccess,
  onError,
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const initializedRef = useRef(false);
  const renderedWidthRef = useRef(0);

  const closePhone = () => {
    setPhoneOpen(false);
    setPendingIdToken('');
    setPhone('');
    setPhoneError('');
  };

  const submitToBackend = async ({ idToken, phoneNumber }) => {
    setLoading(true);
    setPhoneError('');
    try {
      const extras = typeof extraPayload === 'function' ? extraPayload() : (extraPayload || {});
      const payload = {
        // Some backends use `idToken`, others use `signupToken`.
        idToken,
        signupToken: idToken,
        ...(role ? { role } : {}),
        ...(phoneNumber ? { phone: phoneNumber } : {}),
        ...extras,
      };

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
      return normalized;
    } catch (e) {
      // If we're in the phone step, keep the modal open and show the error.
      if (phoneOpen) {
        setPhoneError(e?.message || 'Failed to complete signup.');
      }
      onError?.(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleButton = (pxWidth) => {
    const google = window?.google;
    if (!google?.accounts?.id) return;
    if (!buttonRef.current) return;
    if (!initializedRef.current) return;

    const w = Math.max(180, Math.min(Math.floor(pxWidth || 0), 520));
    if (!w) return;
    if (Math.abs(w - renderedWidthRef.current) < 4) return;
    renderedWidthRef.current = w;
    // Re-render at the new size.
    buttonRef.current.innerHTML = '';
    google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: w,
      text: 'continue_with',
      shape: 'rectangular',
    });
  };

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

          // For signup flows that require collecting a phone number after Google.
          if (phoneMode === 'before') {
            setPendingIdToken(idToken);
            setPhoneOpen(true);
            return;
          }

          await submitToBackend({ idToken });
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // Helps on some browsers where One Tap is gated behind FedCM.
        use_fedcm_for_prompt: true,
      });

      initializedRef.current = true;

      if (buttonRef.current) {
        // Render at container width to avoid overflow in tight layouts.
        const w = buttonRef.current.getBoundingClientRect?.().width || buttonRef.current.clientWidth;
        renderGoogleButton(w);
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

  useEffect(() => {
    if (!clientId) return;
    if (!buttonRef.current) return;

    // Keep the button sized to its container.
    const el = buttonRef.current;
    const measure = () => {
      const w = el.getBoundingClientRect?.().width || el.clientWidth;
      renderGoogleButton(w);
    };

    measure();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, [clientId, ready]);

  return (
    <div className="w-full">
      {label && <div className="mb-2 text-xs text-gray-700">{label}</div>}
      <div
        ref={buttonRef}
        className={className || 'w-full overflow-hidden'}
      />
      {phoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closePhone}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add mobile number</h3>
              <button className="text-gray-500" onClick={closePhone}>✕</button>
            </div>
            <p className="mt-1 text-xs text-gray-600">Enter your 10-digit phone number to complete signup.</p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-gray-700">Phone number</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="8282868389"
                value={phone}
                className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              />
              {(phoneError) && <div className="text-xs text-red-600">{phoneError}</div>}
              <div className="flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={closePhone} disabled={loading}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
                  disabled={loading || phone.length !== 10 || !pendingIdToken}
                  onClick={async () => {
                    if (phone.length !== 10) {
                      setPhoneError('Please enter a valid 10-digit phone number.');
                      return;
                    }
                    const ok = await submitToBackend({ idToken: pendingIdToken, phoneNumber: phone });
                    if (ok) closePhone();
                  }}
                >
                  {loading ? 'Submitting…' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
