export default function LogosMarquee(){
  const logos = ['Acme', 'Orbit', 'Pulse', 'Layer', 'Quark', 'Nimbus', 'North', 'Vertex'];
  const items = [...logos, ...logos, ...logos];
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-center text-sm text-gray-500">Trusted by growth teams</p>
        <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {items.map((n, i) => (
              <div key={n + '-' + i} className="h-10 w-32 shrink-0 rounded bg-gray-100 grid place-items-center text-gray-400 text-sm">
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
