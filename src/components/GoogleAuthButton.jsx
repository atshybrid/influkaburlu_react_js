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

function cleanPhone10(value) {
  return (value || '').toString().replace(/[^0-9]/g, '').slice(0, 10);
}

function pickSessionFromGoogleStart(data) {
  // Backend may respond as either:
  // - { linkRequired:false, session:{ accessToken,..., user,... } }
  // - { accessToken,..., user,... }
  // We normalize both.
  if (!data || typeof data !== 'object') return null;
  if (data.session && typeof data.session === 'object') return data.session;
  return data;
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
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState('');
  const [otpRequestId, setOtpRequestId] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [googleLinkToken, setGoogleLinkToken] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null);
  const initializedRef = useRef(false);
  const renderedWidthRef = useRef(0);

  const closePhone = () => {
    setPhoneOpen(false);
    setPendingIdToken('');
    setPhone('');
    setPhoneError('');
    setOtpStep('phone');
    setOtp('');
    setOtpRequestId('');
    setOtpPhone('');
    setGoogleLinkToken('');
    setGoogleProfile(null);
  };

  const submitLegacyToBackend = async ({ idToken, phoneNumber }) => {
    setLoading(true);
    setPhoneError('');
    try {
      if (phoneMode === 'before') {
        const cleaned = cleanPhone10(phoneNumber);
        if (cleaned.length !== 10) {
          throw new Error('Phone number is required to complete signup.');
        }
        phoneNumber = cleaned;
      }

      const extras = typeof extraPayload === 'function' ? extraPayload() : (extraPayload || {});
      const payload = {
        // Some backends use `idToken`, others use `signupToken`.
        idToken,
        signupToken: idToken,
        ...(role ? { role } : {}),
        ...(phoneMode === 'before' ? { phone: phoneNumber } : (phoneNumber ? { phone: phoneNumber } : {})),
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

  const startGoogleFlow = async ({ idToken }) => {
    setLoading(true);
    setPhoneError('');
    try {
      const data = await apiClient.request('/auth/google/start', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
        skipAuth: true,
      });

      // If already linked, backend should return a session.
      const maybeSession = pickSessionFromGoogleStart(data);
      const normalized = normalizeAuthResponse(maybeSession);
      if (normalized) {
        saveTokens(normalized);
        onSuccess?.(normalized);
        return { kind: 'success', auth: normalized };
      }

      // If not linked, backend should ask to link.
      if (data?.linkRequired && data?.linkToken) {
        setGoogleLinkToken(data.linkToken);
        setGoogleProfile(data.profile || null);
        setOtpStep('phone');
        setPhoneOpen(true);
        return { kind: 'link_required' };
      }

      throw new Error('Google login failed: invalid response from server.');
    } catch (e) {
      // If server doesn't support new flow yet, fall back to legacy /auth/google.
      const msg = e?.message || '';
      const looksLikeNotFound = /404|not found/i.test(msg);
      if (looksLikeNotFound) {
        // Legacy behavior: optionally collect phone before hitting /auth/google.
        if (phoneMode === 'before') {
          setPendingIdToken(idToken);
          setPhoneOpen(true);
          return { kind: 'legacy_phone_required' };
        }
        const legacy = await submitLegacyToBackend({ idToken });
        if (legacy) return { kind: 'success', auth: legacy };
        return { kind: 'error' };
      }

      onError?.(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const requestLinkOtp = async () => {
    setLoading(true);
    setPhoneError('');
    try {
      const cleaned = cleanPhone10(phone);
      if (cleaned.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number.');
      }

      // Frontend rule: if user enters 10 digits, send as-is (backend will add default country code if needed).
      // Keep it digits-only and avoid spaces/dashes/"+".
      const otpPhoneDigits = cleaned;
      const payloadBase = {
        purpose: 'google_link',
        ...(googleProfile?.email ? { email: googleProfile.email } : {}),
      };

      const debugLog = (label, payload) => {
        if (!import.meta?.env?.DEV) return;
        try {
          const base = (import.meta?.env?.VITE_API_URL || '').toString();
          console.debug(`[GoogleAuthButton] ${label}`, {
            apiBase: base,
            endpoint: '/auth/otp/request',
            payload,
          });
        } catch {}
      };

      debugLog('OTP request (digits-only)', { ...payloadBase, phone: otpPhoneDigits });
      const r = await apiClient.request('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ ...payloadBase, phone: otpPhoneDigits }),
        skipAuth: true,
      });

      setOtpPhone(otpPhoneDigits);

      setOtpRequestId(r?.requestId || r?.request_id || '');
      setOtp('');
      setOtpStep('otp');
      return r;
    } catch (e) {
      const msg = e?.message || 'Failed to send OTP.';
      // Make the common backend misconfig more obvious.
      if (msg === 'otp_send_failed') {
        const status = e?.status ? `HTTP ${e.status}` : '';
        const detail = e?.data?.details || e?.data?.message || e?.data?.error_description || '';
        const suffix = [status, detail].filter(Boolean).join(' • ');
        setPhoneError(`otp_send_failed (server could not send OTP; check WhatsApp/SMS OTP settings on backend)${suffix ? ` — ${suffix}` : ''}`);
      } else if (/not configured|otp.*config|whatsapp|twilio/i.test(msg)) {
        setPhoneError(msg);
      } else {
        setPhoneError(msg);
      }
      onError?.(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndLink = async () => {
    setLoading(true);
    setPhoneError('');
    try {
      const cleaned = cleanPhone10(phone);
      if (cleaned.length !== 10) throw new Error('Please enter a valid 10-digit phone number.');
      const cleanedOtp = (otp || '').toString().replace(/[^0-9]/g, '').slice(0, 6);
      if (cleanedOtp.length !== 6) throw new Error('Please enter the 6-digit OTP.');
      if (!googleLinkToken) throw new Error('Link session expired. Please try Google login again.');

      // Use the exact phone format used when requesting OTP.
      const linkPhone = otpPhone || cleaned;

      const basePayload = {
        linkToken: googleLinkToken,
        phone: linkPhone,
        otp: cleanedOtp,
        ...(otpRequestId ? { requestId: otpRequestId } : {}),
      };

      let data;
      try {
        // For existing phone+MPIN users, backend expects role to be omitted.
        data = await apiClient.request('/auth/google/link', {
          method: 'POST',
          body: JSON.stringify(basePayload),
          skipAuth: true,
        });
      } catch (e) {
        // For brand-new users, backend may require role on first signup.
        const msg = (e?.message || '').toLowerCase();
        const roleRequired = msg.includes('role is required') || (msg.includes('role') && msg.includes('required'));
        if (!roleRequired || !role) throw e;

        data = await apiClient.request('/auth/google/link', {
          method: 'POST',
          body: JSON.stringify({ ...basePayload, role }),
          skipAuth: true,
        });
      }

      const normalized = normalizeAuthResponse(data);
      if (!normalized) throw new Error('Google linking succeeded but no access token was returned.');

      saveTokens(normalized);
      onSuccess?.(normalized);
      closePhone();
      return normalized;
    } catch (e) {
      setPhoneError(e?.message || 'Failed to link Google.');
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

          // New flow: try /auth/google/start first; if linking is required, a phone+OTP modal will open.
          await startGoogleFlow({ idToken });
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
              <h3 className="text-lg font-semibold">Verify mobile number</h3>
              <button className="text-gray-500" onClick={closePhone}>✕</button>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {googleLinkToken
                ? 'This account is not linked to Google yet. Verify your phone to link Google and sign in.'
                : 'Enter your 10-digit phone number to complete signup.'}
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-gray-700">Phone number</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="8282868389"
                value={phone}
                className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                onChange={(e) => setPhone(cleanPhone10(e.target.value))}
              />

              {googleLinkToken && otpStep === 'otp' && (
                <>
                  <label className="block text-sm text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                    onChange={(e) => setOtp((e.target.value || '').replace(/[^0-9]/g, '').slice(0, 6))}
                  />
                  <button
                    type="button"
                    className="text-xs text-orange-600"
                    disabled={loading || phone.length !== 10}
                    onClick={requestLinkOtp}
                  >
                    Resend OTP
                  </button>
                </>
              )}

              {(phoneError) && <div className="text-xs text-red-600">{phoneError}</div>}
              <div className="flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={closePhone} disabled={loading}>Cancel</button>
                {googleLinkToken ? (
                  otpStep === 'phone' ? (
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
                      disabled={loading || cleanPhone10(phone).length !== 10}
                      onClick={requestLinkOtp}
                    >
                      {loading ? 'Sending…' : 'Send OTP'}
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
                      disabled={loading || cleanPhone10(phone).length !== 10 || (otp || '').length !== 6}
                      onClick={verifyOtpAndLink}
                    >
                      {loading ? 'Verifying…' : 'Verify & Link'}
                    </button>
                  )
                ) : (
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
                    disabled={loading || phone.length !== 10 || !pendingIdToken}
                    onClick={async () => {
                      if (phone.length !== 10) {
                        setPhoneError('Please enter a valid 10-digit phone number.');
                        return;
                      }
                      const ok = await submitLegacyToBackend({ idToken: pendingIdToken, phoneNumber: phone });
                      if (ok) closePhone();
                    }}
                  >
                    {loading ? 'Submitting…' : 'Continue'}
                  </button>
                )}
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
