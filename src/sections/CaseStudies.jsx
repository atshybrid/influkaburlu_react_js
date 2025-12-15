import { caseStudies } from '../data/influencers';

export default function CaseStudies(){
  return (
    <section id="case-studies" className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium text-orange-700 bg-orange-50 inline-flex px-3 py-1 rounded-full ring-1 ring-orange-200">RESULTS</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">Results brands can repeat</h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Heart‑touching stories, measurable outcomes. Test fast, scale with confidence, then run always‑on.</p>
      </div>
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        {caseStudies.map(cs => (
          <article key={cs.brand} className="group rounded-2xl p-[1px] bg-gradient-to-br from-gray-200/60 to-gray-100 hover:from-orange-200 hover:to-pink-200 transition-colors">
            <div className="rounded-2xl bg-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cs.logo && <img src={cs.logo} alt={cs.brand} className="h-8 w-8 rounded object-contain" onError={(e)=>{e.currentTarget.style.display='none'}}/>}
                    <h3 className="font-semibold text-gray-900">{cs.brand}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{cs.goal}</span>
                </div>
                <p className="mt-3 text-sm text-gray-700">{cs.summary}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {cs.result.slice(0,3).map(r => (
                    <Metric key={r} label={r} />
                  ))}
                </div>
              </div>
              {cs.image && (
                <div className="h-36 w-full overflow-hidden">
                  <img src={cs.image} alt="case" className="w-full h-full object-cover"/>
                </div>
              )}
              <div className="p-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">Playbook: <span className="text-gray-900 font-medium">{cs.playbook || 'UGC + creators + landing optimization'}</span></div>
                <a href="/brands" className="text-sm font-medium text-gray-700 ring-1 ring-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50">See brand</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label }){
  return (
    <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200 text-center">
      <div className="text-xs text-gray-600">Outcome</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 truncate" title={label}>{label}</div>
    </div>
  );
}
