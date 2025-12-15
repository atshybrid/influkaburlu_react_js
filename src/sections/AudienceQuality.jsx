export default function AudienceQuality() {
  const metrics = [
    { k: 'Fake followers', v: '2.1%', color: 'from-red-100 to-red-50', ring: 'ring-red-200' },
    { k: 'Engagement quality', v: 'A−', color: 'from-green-100 to-emerald-50', ring: 'ring-emerald-200' },
    { k: 'Top geo', v: 'IN • AE • SG', color: 'from-blue-100 to-sky-50', ring: 'ring-sky-200' },
    { k: 'Age / gender', v: '18–24 • 62% F', color: 'from-purple-100 to-fuchsia-50', ring: 'ring-fuchsia-200' },
  ];

  return (
    <section id="audience-quality" className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Audience quality that actually matters</h2>
        <p className="mt-2 text-gray-600">See what’s behind the numbers—authenticity, engagement, and where your buyers live.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(m => (
          <div key={m.k} className={`rounded-2xl p-[1px] bg-gradient-to-br ${m.color}`}>
            <div className={`rounded-2xl bg-white p-5 ring-1 ${m.ring}`}>
              <div className="text-sm text-gray-600">{m.k}</div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{m.v}</div>
              <div className="mt-4 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600" style={{width: m.k==='Fake followers'?'8%': m.k==='Engagement quality'?'72%':'56%'}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
