import React, { useEffect, useRef, useState } from 'react';

function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const obs = new IntersectionObserver((entries) => {
      if (!started && entries[0].isIntersecting) {
        started = true;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          setValue(Math.floor(target * p));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

export default function AnimatedStats(){
  const s1 = useCounter(12000);
  const s2 = useCounter(84);
  const s3 = useCounter(47);
  return (
    <section className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        <div ref={s1.ref} className="p-8 rounded-2xl bg-white ring-1 ring-gray-200 text-center animate-float">
          <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600">{s1.value.toLocaleString()}+</div>
          <div className="mt-2 text-gray-600">Verified creators</div>
        </div>
        <div ref={s2.ref} className="p-8 rounded-2xl bg-white ring-1 ring-gray-200 text-center animate-float" style={{animationDelay:'-1s'}}>
          <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600">{s2.value}M</div>
          <div className="mt-2 text-gray-600">Total reach</div>
        </div>
        <div ref={s3.ref} className="p-8 rounded-2xl bg-white ring-1 ring-gray-200 text-center animate-float" style={{animationDelay:'-2s'}}>
          <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600">{(s3.value/10).toFixed(1)}x</div>
          <div className="mt-2 text-gray-600">Average ROAS</div>
        </div>
      </div>
    </section>
  );
}
