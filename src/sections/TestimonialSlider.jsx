import React, { useState } from 'react';
import { motion } from 'framer-motion';

function ImgWithFallback({ src, alt, className, fallback }) {
  const [current, setCurrent] = useState(src);
  const [tried, setTried] = useState(false);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (!tried && fallback && current !== fallback) {
          setCurrent(fallback);
          setTried(true);
        }
      }}
    />
  );
}

const testimonials = [
  {
    q: 'Kaburlu helped us find perfect creators in days, not weeks.',
    a: 'Growth Lead',
    company: 'Orbit',
    avatar: '/assets/people/orbit.jpg',
    logo: '/assets/logos/orbit.svg',
  },
  {
    q: 'Analytics gave us confidence to scale our spend.',
    a: 'CMO',
    company: 'Acme',
    avatar: '/assets/people/acme.jpg',
    logo: '/assets/logos/acme.svg',
  },
  {
    q: 'Smooth workflow from brief to payment. Love it.',
    a: 'Agency Partner',
    company: 'North',
    avatar: '/assets/people/agency.jpg',
    logo: '/assets/logos/north.svg',
  },
  {
    q: 'Creator fits are consistently on point.',
    a: 'Brand Manager',
    company: 'Pulse',
    avatar: '/assets/people/pulse.jpg',
    logo: '/assets/logos/pulse.svg',
  },
];

const fallbacks = {
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  logo: '/assets/brand-logo.png',
};

function Card({ t }) {
  return (
    <figure className="shrink-0 w-96 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 p-[1px]">
      <div className="rounded-2xl bg-white h-full">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImgWithFallback src={t.avatar} fallback={fallbacks.avatar} alt={t.company} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{t.a}</div>
                <div className="text-xs text-gray-500">{t.company}</div>
              </div>
            </div>
            <ImgWithFallback src={t.logo} fallback={fallbacks.logo} alt={t.company + ' logo'} className="h-6 w-6 object-contain opacity-80" />
          </div>
          <blockquote className="mt-4 text-gray-900 leading-relaxed">“{t.q}”</blockquote>
          <div className="mt-4 flex items-center gap-1 text-orange-600">
            {Array.from({length:5}).map((_,i)=>(
              <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current"><path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z"/></svg>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

export default function TestimonialSlider(){
  const first = testimonials.slice(0, Math.ceil(testimonials.length/2));
  const second = testimonials.slice(Math.ceil(testimonials.length/2));
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">What teams say</h2>
        <p className="mt-2 text-gray-600">Real feedback from brands and partners.</p>
      </div>
      <div className="mt-8 space-y-6">
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div className="flex gap-6" animate={{ x: ['0%','-50%'] }} transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
            {[...first, ...first].map((t, i) => <Card key={t.company + '-row1-' + i} t={t} />)}
          </motion.div>
        </div>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div className="flex gap-6" animate={{ x: ['-50%','0%'] }} transition={{ duration: 32, ease: 'linear', repeat: Infinity }}>
            {[...second, ...second].map((t, i) => <Card key={t.company + '-row2-' + i} t={t} />)}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
