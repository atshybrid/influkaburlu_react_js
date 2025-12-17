import { Link } from 'react-router-dom';

export default function InfluencerCard({ p }) {
  const slug = (p.handle||p.name||'creator').replace(/^@/, '').toLowerCase();
  const platforms = (p.platforms||[]).map(pl => pl.toLowerCase());
  const primary = platforms[0] || 'instagram';
  const fame = p.fame || 'Rising';
  const followers = p.followers || p.reach || '';

  // If Instagram is primary, render a neat Instagram-style frame (clean, minimal)
  if (primary === 'instagram') {
    return (
      <div className="group rounded-3xl p-[2px] bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="rounded-3xl bg-white overflow-hidden">
          {/* IG header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={p.photo} alt={p.name} className="h-8 w-8 rounded-full object-cover" onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}}/>
              <div>
                <div className="text-sm font-semibold text-gray-900">{p.handle || p.name}</div>
                <div className="text-[11px] text-gray-500">{p.location || 'Global'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 ring-1 ring-gray-200">{fame}</span>
              <Link to={`/login?next=/dashboard/advertiser`} className="h-8 px-3 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white text-xs">Start Collaboration</Link>
            </div>
          </div>

          {/* IG media */}
          <div className="relative">
            <div className="aspect-square w-full bg-gray-100">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full grid place-items-center text-white text-3xl font-bold bg-gradient-to-br ${p.avatar?.bg || 'from-gray-400 to-gray-600'}`}>{p.avatar?.initials || 'CR'}</div>
              )}
            </div>
            {/* Clean frame: remove inner overlay actions for neat look */}
          </div>

          {/* IG footer */}
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">{followers} followers</div>
            {/* Minimal footer: remove niche line to avoid clutter */}
            <div className="mt-2 flex items-center justify-between">
              <Link to={`/creators/${slug}`} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Open</Link>
              <div className="flex items-center gap-2">
                {platforms.includes('instagram') && <IconInstagram/>}
                {platforms.includes('youtube') && <IconYouTube/>}
                {platforms.includes('tiktok') && <IconTikTok/>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If TikTok is primary: render a TikTok-style frame
  if (primary === 'tiktok') {
    return (
      <div className="group rounded-3xl p-[2px] bg-gradient-to-br from-gray-900 via-gray-700 to-black transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="rounded-3xl bg-black overflow-hidden text-white">
          {/* TikTok header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={p.photo} alt={p.name} className="h-8 w-8 rounded-full object-cover" onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}}/>
              <div>
                <div className="text-sm font-semibold">{p.handle || p.name}</div>
                <div className="text-[11px] text-white/60">{p.location || 'Global'}</div>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 ring-1 ring-white/20">{fame}</span>
          </div>
          {/* TikTok media vertical */}
          <div className="relative">
            <div className="w-full" style={{aspectRatio:'9/16'}}>
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full grid place-items-center text-white text-3xl font-bold bg-gradient-to-br ${p.avatar?.bg || 'from-gray-600 to-gray-800'}`}>{p.avatar?.initials || 'CR'}</div>
              )}
            </div>
          </div>
          {/* TikTok footer */}
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">{followers} followers</div>
            <div className="mt-2 flex items-center justify-between">
              <Link to={`/creators/${slug}`} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black ring-1 ring-white/20 hover:bg-white/90">Open</Link>
              <div className="flex items-center gap-2">
                {platforms.includes('instagram') && <IconInstagram/>}
                {platforms.includes('youtube') && <IconYouTube/>}
                {platforms.includes('tiktok') && <IconTikTok/>}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end">
              <Link to={`/login?next=/dashboard/advertiser`} className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-pink-600 to-blue-600">Start Collaboration</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If YouTube is primary: render a YouTube-style frame
  if (primary === 'youtube') {
    return (
      <div className="group rounded-3xl p-[2px] bg-gradient-to-br from-red-200 via-red-300 to-red-400 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="rounded-3xl bg-white overflow-hidden">
          {/* YouTube header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <IconYouTube/>
              <div>
                <div className="text-sm font-semibold text-gray-900">{p.handle || p.name}</div>
                <div className="text-[11px] text-gray-500">{p.location || 'Global'}</div>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 ring-1 ring-gray-200">{fame}</span>
          </div>
          {/* YouTube media 16:9 */}
          <div className="relative">
            <div className="w-full" style={{aspectRatio:'16/9'}}>
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full grid place-items-center text-white text-3xl font-bold bg-gradient-to-br ${p.avatar?.bg || 'from-gray-400 to-gray-600'}`}>{p.avatar?.initials || 'CR'}</div>
              )}
            </div>
          </div>
          {/* YouTube footer */}
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">{followers} subscribers</div>
            <div className="mt-2 flex items-center justify-between">
              <Link to={`/creators/${slug}`} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Open</Link>
              <Link to={`/login?next=/dashboard/advertiser`} className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-500">Start Collaboration</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-3xl p-[2px] bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="rounded-3xl bg-white overflow-hidden">
        {/* Header image */}
        <div className="relative h-52">
          {p.photo ? (
            <img src={p.photo} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className={`absolute inset-0 grid place-items-center text-white text-3xl font-bold bg-gradient-to-br ${p.avatar.bg}`}>{p.avatar.initials}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Overlaid avatar + reach */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="relative">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
              ) : (
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${p.avatar.bg} text-white grid place-items-center font-semibold ring-2 ring-white`}>{p.avatar.initials}</div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 ring-2 ring-white" />
            </div>
            <span className="px-2 py-1 rounded-md text-xs font-medium text-white/90 bg-white/10 ring-1 ring-white/30">Reach {p.reach}</span>
          </div>
          {/* Save button */}
          <Link to={`/login?next=/dashboard/advertiser`} className="absolute top-3 right-3 h-9 px-3 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur ring-1 ring-white hover:bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-900"><path fill="currentColor" d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm9 9a3 3 0 1 1-6 0a3 3 0 0 1 6 0z"/></svg>
            <span className="text-xs font-medium text-gray-900">Save</span>
          </Link>

          {/* Glass stats ribbon */}
          <div className="absolute -bottom-3 right-3 left-3 flex gap-3">
            <div className="flex-1 rounded-xl bg-white/20 backdrop-blur px-3 py-2 ring-1 ring-white/40 text-white">
              <div className="text-[10px] opacity-80">Engagement</div>
              <div className="text-sm font-semibold">{p.engagement}</div>
            </div>
            <div className="flex-1 rounded-xl bg-white/20 backdrop-blur px-3 py-2 ring-1 ring-white/40 text-white">
              <div className="text-[10px] opacity-80">Platforms</div>
              <div className="text-sm font-semibold truncate" title={p.platforms.join(' · ')}>{p.platforms.join(' · ')}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-900 leading-tight">{p.name}</div>
              <div className="text-xs text-gray-500">{p.handle} • {p.location}</div>
            </div>
            <Link to={`/creators/${slug}`} className="shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500">View</Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {p.niche.map(n => (
              <span key={n} className="px-2 py-1 text-[11px] rounded-md bg-gray-100 text-gray-700">{n}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-gray-600">Followers</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white ring-1 ring-gray-200">{fame}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{followers}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
              <div className="text-[11px] text-gray-600">Primary platforms</div>
              <div className="mt-1 flex items-center gap-2">
                {platforms.includes('instagram') && <IconInstagram/>}
                {platforms.includes('youtube') && <IconYouTube/>}
                {platforms.includes('tiktok') && <IconTikTok/>}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 ring-1 ring-gray-200"><svg viewBox="0 0 20 20" className="h-3 w-3"><path fill="currentColor" d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9V9h2v4zm0-6H9V5h2v2z"/></svg> Verified fit</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 ring-1 ring-gray-200"><svg viewBox="0 0 20 20" className="h-3 w-3"><path fill="currentColor" d="M10 3l6 4v6l-6 4-6-4V7l6-4z"/></svg> UGC Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/creators/${slug}`} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Open</Link>
              <Link to={`/login?next=/dashboard/advertiser`} className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500">Start Collaboration</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconInstagram(){
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white ring-1 ring-gray-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-pink-600"><path fill="currentColor" d="M12 2c2.7 0 3 .01 4.05.06c1.04.05 1.75.22 2.37.47c.64.25 1.18.59 1.71 1.12c.53.53.87 1.07 1.12 1.71c.25.62.42 1.33.47 2.37C21.99 8.99 22 9.3 22 12s-.01 3.01-.06 4.05c-.05 1.04-.22 1.75-.47 2.37c-.25.64-.59 1.18-1.12 1.71c-.53.53-1.07.87-1.71 1.12c-.62.25-1.33.42-2.37.47C15 21.99 14.7 22 12 22s-3-.01-4.05-.06c-1.04-.05-1.75-.22-2.37-.47a4.9 4.9 0 0 1-1.71-1.12a4.9 4.9 0 0 1-1.12-1.71c-.25-.62-.42-1.33-.47-2.37C2.01 15 2 14.7 2 12s.01-3 .06-4.05c.05-1.04.22-1.75.47-2.37c.25-.64.59-1.18 1.12-1.71s1.07-.87 1.71-1.12c.62-.25 1.33-.42 2.37-.47C9 2.01 9.3 2 12 2m0 1.8c-2.66 0-2.98.01-4.03.06c-.83.04-1.28.18-1.58.3c-.4.15-.68.33-1 .65c-.32.32-.5.6-.65 1c-.12.3-.26.75-.3 1.58C4.4 9.02 4.38 9.34 4.38 12s.02 2.98.06 4.03c.04.83.18 1.28.3 1.58c.15.4.33.68.65 1c.32.32.6.5 1 .65c.3.12.75.26 1.58.3c1.05.05 1.37.06 4.03.06s2.98-.01 4.03-.06c.83-.04 1.28-.18 1.58-.3c.4-.15.68-.33 1-.65c.32-.32.5-.6.65-1c.12-.3.26-.75.3-1.58c.05-1.05.06-1.37.06-4.03s-.01-2.98-.06-4.03c-.04-.83-.18-1.28-.3-1.58c-.15-.4-.33-.68-.65-1c-.32-.32-.6-.5-1-.65c-.3-.12-.75-.26-1.58-.3C14.98 3.81 14.66 3.8 12 3.8m0 3.6a4.6 4.6 0 1 1 0 9.2a4.6 4.6 0 0 1 0-9.2m6-2.3a1.08 1.08 0 1 1 0 2.16a1.08 1.08 0 0 1 0-2.16Z"/></svg>
      <span className="text-xs">Instagram</span>
    </span>
  );
}

function IconYouTube(){
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white ring-1 ring-gray-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-600"><path fill="currentColor" d="M23.5 6.2c-.3-1.1-1.2-2-2.3-2.3C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.2.4C1.7 4.2.8 5.1.5 6.2C.1 8 .1 12 .1 12s0 4 .4 5.8c.3 1.1 1.2 2 2.3 2.3c1.8.4 9.2.4 9.2.4s7.4 0 9.2-.4c1.1-.3 2-1.2 2.3-2.3c.4-1.8.4-5.8.4-5.8s0-4-.4-5.8ZM9.7 15.3V8.7l6.2 3.3l-6.2 3.3Z"/></svg>
      <span className="text-xs">YouTube</span>
    </span>
  );
}

function IconTikTok(){
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white ring-1 ring-gray-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-black"><path fill="currentColor" d="M17 3c1.1 1.3 2.6 2.1 4.3 2.2V8c-1.8-.1-3.4-.7-4.8-1.6v6.2c0 3.8-3.1 6.9-6.9 6.9S2.7 16.4 2.7 12.6S5.8 5.7 9.6 5.7c.6 0 1.2.1 1.8.3v3.3c-.6-.3-1.1-.4-1.8-.4c-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6s3.6-1.6 3.6-3.6V3h3.2Z"/></svg>
      <span className="text-xs">TikTok</span>
    </span>
  );
}

function IconHeart(){
  return <svg viewBox="0 0 24 24" className="h-6 w-6 text-white"><path fill="currentColor" d="M12 21s-6.7-4.6-9.3-7.2C1 12.1 1 9.3 2.7 7.6c1.5-1.5 3.9-1.8 5.7-.7c.7.4 1.3 1 1.6 1.7c.3-.7.9-1.3 1.6-1.7c1.8-1 4.2-.8 5.7.7c1.7 1.7 1.7 4.5 0 6.2C18.7 16.4 12 21 12 21Z"/></svg>;
}

function IconComment(){
  return <svg viewBox="0 0 24 24" className="h-6 w-6 text-white"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>;
}

function IconSend(){
  return <svg viewBox="0 0 24 24" className="h-6 w-6 text-white"><path fill="currentColor" d="M2 21L23 12L2 3l4 8l10 1l-10 1l-4 8Z"/></svg>;
}

function IconBookmark(){
  return <svg viewBox="0 0 24 24" className="h-6 w-6 text-white"><path fill="currentColor" d="M7 3h10a2 2 0 0 1 2 2v17l-7-4l-7 4V5a2 2 0 0 1 2-2Z"/></svg>;
}
