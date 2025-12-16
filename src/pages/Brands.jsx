import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import useSeoPage from '../hooks/useSeoPage';

export default function Brands(){
  const { seo } = useSeoPage('brands');
  const [data,setData] = useState({ logos: [] });
  useEffect(()=>{
    fetch('/files/trusted.json')
      .then(r=>r.json())
      .then(setData)
      .catch(()=>setData({ logos: [] }));
  },[]);

  return (
    <main className="py-10">
      <SeoHead
        title={seo?.title || 'Partner brands'}
        description={seo?.description || ''}
        keywords={seo?.keywords || ''}
        canonical={seo?.canonical || ''}
        ogImage={seo?.ogImage || ''}
        schema={seo?.schema || null}
        noindex={seo?.indexed === false}
      />
    <section>
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
    </main>
  )
}
