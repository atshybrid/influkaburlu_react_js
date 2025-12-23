import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const isAuthed = typeof window !== 'undefined' && !!localStorage.getItem('auth.token');
  const brandCtaTo = isAuthed ? '/ads' : '/get-started?role=brand';
  const creatorCtaTo = isAuthed ? '/profile-builder' : '/get-started?role=influencer';
  const [isHeroVideoLoaded, setIsHeroVideoLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Real-world ad + influencer collage with motion */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-orange-50" />

      <div className="pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-widest">Kaburlu</div>
              <motion.h1
                className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Make your brand feel trusted — and irresistibly clickable
              </motion.h1>
              <motion.p
                className="mt-4 text-lg text-gray-700 max-w-xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                Find creators your audience already loves. Craft native stories, launch fast, and watch real conversions roll in — no fluff, just impact.
              </motion.p>
            <div className="mt-8 flex items-center gap-3">
                <Link to={brandCtaTo} className="px-5 py-3 rounded-md text-white font-medium bg-orange-600 hover:bg-orange-700">For Brands</Link>
                <Link to={creatorCtaTo} className="px-5 py-3 rounded-md font-medium text-orange-700 border border-orange-200 bg-white hover:bg-orange-50">For Creators</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-gray-600">
              {['IG Reels','YouTube Shorts','TikTok','X Posts','Stories'].map(t=> (
                <span key={t} className="px-2.5 py-1 rounded-md ring-1 ring-gray-200">{t}</span>
              ))}
            </div>
          </div>

          {/* Collage: device frames + influencer images */}
          <div className="w-full">
            <div className="relative max-w-md mx-auto sm:max-w-lg lg:ml-auto lg:mr-0 lg:max-w-[460px] xl:max-w-[520px]">
              <div className="relative h-[360px] sm:h-80 lg:h-[420px]">
              {/* phone frame */}
              <div className="absolute left-0 top-3 h-64 w-32 sm:top-2 sm:h-72 sm:w-40 lg:top-6 lg:h-80 lg:w-44 rounded-3xl bg-black shadow-2xl ring-1 ring-black/20 z-0">
                <div className="m-2 h-[calc(100%-16px)] rounded-2xl overflow-hidden">
                  <img
                    src="/assets/influencer-phone.jpg"
                    alt="Ad reel"
                    className="h-full w-full object-cover"
                    onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop';}}
                  />
                </div>
              </div>
              {/* vertical card (asset with fallback, clickable to profile) */}
              <Link to="/profile-builder" className="absolute left-28 top-20 h-56 w-36 sm:left-36 sm:top-20 sm:h-64 sm:w-44 lg:left-44 lg:top-32 lg:h-72 lg:w-52 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden animate-float z-10" style={{animationDelay:'0.2s'}}>
                <img
                  src="/assets/influencer-1.jpg"
                  alt="Creator"
                  className="h-full w-full object-cover"
                  onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop';}}
                />
              </Link>
              {/* wide video card */}
              <div className="absolute right-0 top-0 h-36 w-56 sm:h-40 sm:w-64 lg:top-2 lg:h-44 lg:w-80 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden animate-float z-20" style={{animationDelay:'0.4s'}}>
                {/* Drop a short hero video here later */}
                <div className="relative h-full w-full">
                  {!isHeroVideoLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
                  )}
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/assets/brand-logo.png"
                    onLoadedData={() => setIsHeroVideoLoaded(true)}
                    onError={() => setIsHeroVideoLoaded(true)}
                  >
                  <source src="/assets/hero-video.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
              {/* stacked story (asset with fallback, clickable to profile) */}
              <Link to="/profile-builder" className="absolute right-0 bottom-0 h-48 w-32 sm:right-4 sm:bottom-0 sm:h-56 sm:w-36 lg:right-6 lg:bottom-2 lg:h-64 lg:w-40 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden animate-float z-30" style={{animationDelay:'0.6s'}}>
                <img
                  src="/assets/influencer-2.jpg"
                  alt="Story"
                  className="h-full w-full object-cover"
                  onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop';}}
                />
              </Link>
              {/* central brand logo slot (optional) */}
              </div>
              {/* subtle caption chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Native ad', 'Creator post', 'Story', 'Shorts'].map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-md bg-white ring-1 ring-gray-200 text-xs text-gray-600">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section-sep" />
    </section>
  );
}
