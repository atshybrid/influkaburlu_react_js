import React from 'react';
import { motion } from 'framer-motion';

function Row({ items, speed = 30, reverse = false }) {
  const content = [...items, ...items];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        className="flex gap-6 will-change-transform"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {content.map((b, idx) => (
          <div key={`${b.name || 'brand'}-${idx}`} className="relative shrink-0 w-56 sm:w-64">
            <div className="group rounded-2xl p-[2px] bg-gradient-to-br from-gray-200/70 to-gray-100 hover:from-orange-200 hover:to-pink-200 transition">
              <div className="rounded-2xl bg-white h-full p-6 flex flex-col items-center justify-center ring-1 ring-gray-200/60">
                <img
                  src={b.logo || '/assets/brand-logo.png'}
                  alt={b.name || 'Brand'}
                  className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/brand-logo.png';
                  }}
                />
                {b.name && <div className="mt-3 text-xs text-gray-600 text-center line-clamp-1">{b.name}</div>}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function InfluencerCarousel() {
  const [logos, setLogos] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    fetch('/files/trusted.json')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setLogos(Array.isArray(d?.logos) ? d.logos : []);
      })
      .catch(() => {
        if (!mounted) return;
        setLogos([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const first = logos.slice(0, Math.ceil(logos.length / 2));
  const second = logos.slice(Math.ceil(logos.length / 2));

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">BRANDS</div>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">Trusted by brands</h2>
        <p className="mt-2 text-gray-600">A fast-moving stream of teams launching creator campaigns.</p>
      </div>

      <div className="mt-8 space-y-6">
        <Row items={first.length ? first : logos} speed={35} />
        <Row items={second.length ? second : logos} speed={32} reverse />
      </div>
    </section>
  );
}
