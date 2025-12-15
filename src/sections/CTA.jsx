export default function CTA(){
  return (
    <section className="bg-gradient-to-r from-orange-600 to-pink-600">
      <div className="max-w-6xl mx-auto px-6 py-14 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold">Ready to meet your next top creator?</h3>
        <p className="mt-2 opacity-90">Start free today — build a shortlist in minutes.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/profile-builder" className="px-5 py-3 rounded-md font-medium bg-white text-gray-900">Build a profile</a>
          <a href="/ads" className="px-5 py-3 rounded-md font-medium ring-1 ring-white/50 hover:bg-white/10">Browse campaigns</a>
        </div>
      </div>
    </section>
  );
}
