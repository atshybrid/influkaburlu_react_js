export default function HowItWorks() {
  const steps = [
    {
      title: 'Find the right creators',
      desc: 'Search by niche, audience quality, geography, and platform.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600"><path fill="currentColor" d="M10 2a8 8 0 105.293 14.293l4.207 4.207 1.414-1.414-4.207-4.207A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z"/></svg>
      )
    },
    {
      title: 'Send briefs in minutes',
      desc: 'Templates, deliverables, timelines, and usage terms—no back-and-forth.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm9 1.5V7h3.5L15 3.5zM8 9h8v2H8V9zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>
      )
    },
    {
      title: 'Approve and track posts',
      desc: 'Content approvals, versioning, and auto reminders across platforms.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600"><path fill="currentColor" d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2z"/></svg>
      )
    },
    {
      title: 'Measure real ROAS',
      desc: 'UTMs, coupon codes, and conversions—see what actually drives revenue.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600"><path fill="currentColor" d="M3 3h2v18H3V3zm16 18h2V9h-2v12zM11 21h2V13h-2v8zM7 21h2V7H7v14zM15 21h2V5h-2v16z"/></svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">How Kaburlu works</h2>
        <p className="mt-2 text-gray-600">From discovery to payments—everything in one smooth workflow.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(s => (
          <div key={s.title} className="rounded-2xl p-5 bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-orange-50 ring-1 ring-orange-200">
              {s.icon}
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
