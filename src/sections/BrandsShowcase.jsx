import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BrandsShowcase(){
  const [logos,setLogos] = useState([]);
  useEffect(()=>{
    fetch('/files/trusted.json')
      .then(r=>r.json())
      .then(d=> setLogos(d.logos||[]))
      .catch(()=> setLogos([]));
  },[]);

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-gray-50" />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <motion.p initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4}} className="text-sm font-medium text-orange-700 bg-orange-50 inline-flex px-3 py-1 rounded-full ring-1 ring-orange-200">FOR BRANDS</motion.p>
          <motion.h2 initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.05}} className="mt-3 text-3xl md:text-4xl font-bold">Discover creators by the thousands</motion.h2>
          <motion.p initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.1}} className="mt-2 text-gray-600">Find creators that match your niche, style, and audience — then launch collaborations fast.</motion.p>
        </div>

        {/* Premium tiles grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {logos.map((b, i) => (
            <motion.div key={i} initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.4, delay: i*0.03}} className="group rounded-2xl p-[2px] bg-gradient-to-br from-gray-200/70 to-gray-100 hover:from-orange-200 hover:to-pink-200 transition">
              <div className="rounded-2xl bg-white h-full p-6 flex flex-col items-center justify-center">
                <img
                  src={b.logo||'/assets/brand-logo.png'}
                  alt={b.name||'Brand'}
                  className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}}
                />
                {(b.name) && <div className="mt-3 text-xs text-gray-600">{b.name}</div>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle marquee row */}
        {logos.length > 6 && (
          <div className="mt-8 overflow-hidden">
            <motion.div aria-hidden="true" className="flex gap-8 items-center" animate={{x:['0%','-50%']}} transition={{duration:20, repeat:Infinity, ease:'linear'}}>
              {[...logos, ...logos].slice(0, 12).map((b, i) => (
                <img key={`mq-${i}`} src={b.logo||'/assets/brand-logo.png'} alt={b.name||'Brand'} className="h-8 opacity-70" onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}}/>
              ))}
            </motion.div>
          </div>
        )}

        {/* Call to action row */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <motion.a whileHover={{scale:1.03}} href="/creators" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Browse creators
            <svg viewBox="0 0 20 20" className="h-4 w-4"><path fill="currentColor" d="M7 5l5 5-5 5V5z"/></svg>
          </motion.a>
          <motion.a whileHover={{scale:1.03}} href="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500">Start Collaboration</motion.a>
        </div>
      </div>
    </section>
  );
}
