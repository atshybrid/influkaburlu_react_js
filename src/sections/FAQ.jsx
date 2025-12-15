export default function FAQ(){
  const faqs = [
    { q:'How do you match brands and creators?', a:'We score fit using niche, audience quality, past performance, and brand safety signals, then recommend shortlists you can approve.' },
    { q:'Do you handle payments and invoices?', a:'Yes. We automate payouts, invoices, and TDS/GST compliant docs so both sides stay on schedule.' },
    { q:'Which platforms are supported?', a:'Instagram, YouTube, and more. We track links and conversions across channels for ROAS.' },
  ];
  return (
    <section id="faq" className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center">Frequently asked questions</h2>
      <div className="mt-8 divide-y divide-gray-200 rounded-2xl ring-1 ring-gray-200 bg-white">
        {faqs.map((f, i) => (
          <details key={f.q} className="p-5" open={i===0}>
            <summary className="cursor-pointer font-semibold text-gray-900 list-none">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
