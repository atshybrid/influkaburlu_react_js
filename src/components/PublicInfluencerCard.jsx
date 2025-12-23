import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function buildPlaybackUrl(url, { autoplay = false, muted = false } = {}) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (autoplay) u.searchParams.set('autoplay', 'true');
    if (muted) u.searchParams.set('muted', 'true');
    return u.toString();
  } catch {
    // If URL parsing fails, best-effort append
    const hasQuery = String(url).includes('?');
    const params = [];
    if (autoplay) params.push('autoplay=true');
    if (muted) params.push('muted=true');
    if (params.length === 0) return url;
    return `${url}${hasQuery ? '&' : '?'}${params.join('&')}`;
  }
}

export default function PublicInfluencerCard({
  influencer,
  rotateVideos = true,
  autoplay = true,
  muted = true,
  showFooterNote = true,
  hideIfNoVideo = false,
  isActive = false,
  onActivate,
  onDeactivate,
  activateOnHover = true,
  activateOnFocus = true,
}) {
  const videos = useMemo(() => {
    const list = Array.isArray(influencer?.videos) ? influencer.videos : [];
    return list.filter((v) => (v?.playbackUrl || '').toString().trim());
  }, [influencer?.videos]);
  const [videoIndex, setVideoIndex] = useState(0);

  const bestVideo = useMemo(() => {
    const raw = influencer?.bestVideo;
    const playbackUrl = (raw?.playbackUrl || '').toString().trim();
    return playbackUrl ? raw : null;
  }, [influencer?.bestVideo]);

  const currentVideo = videos[videoIndex] || bestVideo || null;
  const hasPlayableVideo = Boolean((currentVideo?.playbackUrl || '').toString().trim());
  const effectiveMuted = isActive ? false : muted;

  const videoSrc = useMemo(() => {
    const raw = (currentVideo?.playbackUrl || '').toString().trim();
    return buildPlaybackUrl(raw, { autoplay, muted: effectiveMuted });
  }, [currentVideo?.playbackUrl, autoplay, effectiveMuted]);

  const [isEmbedLoaded, setIsEmbedLoaded] = useState(false);

  useEffect(() => {
    // Reset loading state when a new video URL is shown.
    setIsEmbedLoaded(false);
  }, [videoSrc]);

  useEffect(() => {
    setVideoIndex(0);
  }, [influencer?.idUlid]);

  useEffect(() => {
    if (!rotateVideos) return;
    if (!videos || videos.length <= 1) return;
    const id = window.setInterval(() => {
      setVideoIndex((i) => (i + 1) % videos.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [videos?.length, rotateVideos]);

  const rawHandle = influencer?.handle || influencer?.handleDisplay || '';
  const handleText = rawHandle ? (String(rawHandle).startsWith('@') ? String(rawHandle) : `@${rawHandle}`) : '@myhandle';
  const nameText = influencer?.name || 'Demo Influencer';
  const slug = (influencer?.slug || String(rawHandle || '').replace(/^@/, '')).toString();
  const profileTo = slug ? `/creators/${encodeURIComponent(slug)}` : null;
  const profilePicUrl = influencer?.profilePicUrl || '';
  const avatarSrc = profilePicUrl || '/assets/brand-logo.png';
  const verificationStatus = influencer?.verificationStatus;
  const badge = influencer?.badgeName || (Array.isArray(influencer?.badges) ? influencer.badges[0] : '');

  if (hideIfNoVideo && !hasPlayableVideo) return null;

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-50 shrink-0">
            <img
              src={avatarSrc}
              alt={nameText}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/brand-logo.png';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {profileTo ? (
                <Link to={profileTo} className="font-semibold text-gray-900 whitespace-normal break-words hover:underline">
                  {nameText}
                </Link>
              ) : (
                <div className="font-semibold text-gray-900 whitespace-normal break-words">{nameText}</div>
              )}
              {verificationStatus && (
                <span className="shrink-0 text-emerald-600" title="Verified">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm3.03 5.72a.75.75 0 0 1 0 1.06l-3.78 3.78a.75.75 0 0 1-1.06 0L6.97 11.84a.75.75 0 1 1 1.06-1.06l.69.69 3.25-3.25a.75.75 0 0 1 1.06 0Z"
                    />
                  </svg>
                </span>
              )}
            </div>
            {profileTo ? (
              <Link to={profileTo} className="text-xs text-gray-600 truncate hover:underline">
                {handleText}
              </Link>
            ) : (
              <div className="text-xs text-gray-600 truncate">{handleText}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(badge || 'Top creator') && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 ring-1 ring-orange-200">
              {badge || 'Top creator'}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="w-full" style={{ aspectRatio: '9/16' }}>
          {videoSrc ? (
            <div
              className="relative w-full h-full"
              onPointerEnter={(e) => {
                if (!activateOnHover) return;
                if (isActive) return;
                if (e?.pointerType !== 'mouse') return;
                if (typeof onActivate === 'function') onActivate();
              }}
              onPointerLeave={(e) => {
                if (!activateOnHover) return;
                if (!isActive) return;
                if (e?.pointerType !== 'mouse') return;
                if (typeof onDeactivate === 'function') onDeactivate();
              }}
              onFocusCapture={() => {
                if (!activateOnFocus) return;
                if (isActive) return;
                if (typeof onActivate === 'function') onActivate();
              }}
            >
              {!isEmbedLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse pointer-events-none" aria-hidden="true" />
              )}
              <iframe
                key={videoSrc}
                src={videoSrc}
                title={`${nameText}-video-${currentVideo?.guid || videoIndex}`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
                onLoad={() => setIsEmbedLoaded(true)}
                onError={() => setIsEmbedLoaded(true)}
              />

              {!isActive && typeof onActivate === 'function' && (
                <button
                  type="button"
                  aria-label="Activate video"
                  className="absolute inset-0"
                  onClick={onActivate}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-gray-600">No videos</div>
          )}
        </div>
      </div>

      {showFooterNote && (
        <div className="p-4">
          <div className="text-xs text-gray-600">Videos rotate automatically.</div>
        </div>
      )}
    </div>
  );
}
