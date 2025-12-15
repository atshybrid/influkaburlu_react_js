import React, { useEffect, useState } from 'react';

export default function Brands(){
  const [data,setData] = useState({ logos: [] });
  useEffect(()=>{
    fetch('/files/trusted.json')
      .then(r=>r.json())
      .then(setData)
      .catch(()=>setData({ logos: [] }));
  },[]);

  return (
    <section className="py-10">
      <h1 className="text-2xl md:text-3xl font-bold">Partner brands</h1>
      <p className="text-gray-600 mt-1">Explore brands that run creator ads with Kaburlu.</p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(data.logos||[]).map((b,idx)=> (
          <div key={idx} className="rounded-xl border border-gray-200 p-4 bg-white flex items-center justify-center">
            <img src={b.logo||'/assets/brand-logo.png'} alt={b.name||'Brand'} className="h-10 object-contain" onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}}/>
          </div>
        ))}
      </div>
    </section>
  )
}
