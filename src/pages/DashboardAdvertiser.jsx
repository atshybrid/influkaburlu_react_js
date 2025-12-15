export default function DashboardAdvertiser(){
  return (
    <section className="py-10">
      <h1 className="text-2xl md:text-3xl font-bold">Advertiser Dashboard</h1>
      <p className="text-gray-600 mt-1">Plan budgets, create briefs, and review results.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card title="Active campaigns" value="4"/>
        <Card title="Creators engaged" value="18"/>
        <Card title="Spend this month" value="$7,950"/>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-semibold">Ads prompt builder</h2>
            <p className="text-sm text-gray-600">Describe your product and goals. We’ll structure creator briefs.</p>
            <textarea className="mt-3 w-full h-28 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="Product, audience, key hooks, mandatory points..."/>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">Generate brief</button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-[1px] bg-gray-200/60">
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-semibold">Budget planner</h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="text-sm text-gray-700">Per‑influencer
                <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="$500"/>
              </label>
              <label className="text-sm text-gray-700">Total budget
                <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="$5,000"/>
              </label>
            </div>
            <div className="mt-3 text-sm text-gray-600">Estimated creators: <span className="font-medium text-gray-900">~10</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Card({ title, value }){
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
      <div className="rounded-2xl bg-white p-5">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}
