import { useEffect, useState } from "react";

function ImgWithFallback({ src, alt, className, fallback }) {
  const [current, setCurrent] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (!triedFallback && fallback && current !== fallback) {
          setCurrent(fallback);
          setTriedFallback(true);
        }
      }}
    />
  );
}

export default function Trusted() {
  const [data, setData] = useState({ logos: [], highlights: [], cases: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sample data from workspace files (acts like a local API)
    fetch("/files/trusted.json")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        // Fallback data if file not found
        setData({
          logos: [
            { src: "/assets/brand-logo.png", alt: "Alpha" },
            { src: "/assets/brand-logo.png", alt: "Beta" },
            { src: "/assets/brand-logo.png", alt: "Gamma" },
            { src: "/assets/brand-logo.png", alt: "Delta" },
            { src: "/assets/brand-logo.png", alt: "Epsilon" },
            { src: "/assets/brand-logo.png", alt: "Zeta" },
          ],
          highlights: [
            { k: "Avg ROAS lift", v: "+42%" },
            { k: "Briefs to posts", v: "2.3× faster" },
            { k: "Creator acceptance", v: "+28%" },
          ],
          cases: [
            { brand: "Alpha", title: "3.9x ROAS on Reels", metric: "+290% conv.", platform: "Instagram" },
            { brand: "Beta", title: "2.4x ROAS on Shorts", metric: "+180% CTR", platform: "YouTube" },
            { brand: "Gamma", title: "3.1x ROAS on Stories", metric: "+120% AOV", platform: "Instagram" },
          ],
        });
        setLoading(false);
      });
  }, []);

  return (
    <section className="relative py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 ring-1 ring-orange-200 text-xs text-orange-800">
            Trusted by growth teams
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900">
            Teams that ship native creator ads and measure real impact
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            From D2C brands to marketplaces, companies use Kaburlu to find high‑fit creators, streamline workflows, and prove ROAS.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {(data.logos || []).map(l => (
            <div key={l.alt} className="flex items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 h-20">
              <ImgWithFallback src={l.src} alt={l.alt} className="h-8 object-contain opacity-80" fallback="/assets/brand-logo.png" />
            </div>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {(data.highlights || []).map(s => (
            <div key={s.k} className="rounded-xl bg-orange-50 ring-1 ring-orange-200 p-4 text-center">
              <div className="text-sm text-orange-800">{s.k}</div>
              <div className="mt-1 text-lg font-semibold text-orange-900">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Case study cards */}
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {(data.cases || []).map(cs => (
            <div key={cs.brand+cs.title} className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex items-center gap-2">
                  <ImgWithFallback src="/assets/brand-logo.png" fallback="/assets/brand-logo.png" alt={cs.brand} className="h-5 w-5 object-contain" />
                  <span className="text-sm text-gray-600">{cs.brand}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{cs.title}</h3>
                <p className="mt-1 text-sm text-gray-600">Platform: {cs.platform}</p>
              </div>
              <div className="px-5 pb-5 mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-50 ring-1 ring-orange-200 text-sm text-orange-900">
                  {cs.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-sep" />
    </section>
  );
}