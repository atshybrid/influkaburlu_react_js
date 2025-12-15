export function WhyCreators(){
  const items = [
    { title:'Fair, on-time payouts', desc:'Transparent rates and automated invoicing so you can focus on creating.', icon:'💸', color:'from-orange-500 to-pink-600' },
    { title:'Briefs that respect your voice', desc:'Flexible guidelines with brand-aligned prompts — not rigid scripts.', icon:'📝', color:'from-indigo-500 to-blue-600' },
    { title:'Long-term partnerships', desc:'We match you with brands that renew, not one-off drops.', icon:'🤝', color:'from-emerald-500 to-teal-600' },
  ];
  return (
    <section id="why-creators" className="bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-medium text-orange-700 bg-orange-50 inline-flex px-3 py-1 rounded-full ring-1 ring-orange-200">FOR CREATORS</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Why creators choose Kaburlu</h2>
          <p className="mt-2 text-gray-600">Built for your craft, not just the campaign.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i.title} className="group rounded-2xl p-[1px] bg-gradient-to-br from-gray-200/60 to-gray-100 hover:from-orange-200 hover:to-pink-200 transition-colors">
              <div className="rounded-2xl bg-white p-6 h-full">
                <div className={`h-10 w-10 rounded-md bg-gradient-to-br ${i.color} text-white grid place-items-center text-lg`}>{i.icon}</div>
                <h3 className="mt-4 font-semibold text-gray-900">{i.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyBrands(){
  const items = [
    { title:'Data-backed discovery', desc:'Audience quality, brand safety, and performance history out of the box.' },
    { title:'Workflow that scales', desc:'Briefs, approvals, UGC asset delivery, and rights management — unified.' },
    { title:'Proven performance', desc:'ROAS reporting with link tracking and multi-touch attribution.' },
  ];
  return (
    <section id="why-brands">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Why brands choose Kaburlu</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i.title} className="p-6 rounded-xl ring-1 ring-gray-200 bg-white">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white grid place-items-center font-bold">★</div>
              <h3 className="mt-4 font-semibold text-gray-900">{i.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
