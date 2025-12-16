import SeoHead from '../components/SeoHead';

export default function Admin(){
  return (
    <>
    <SeoHead title="Admin" noindex />
    <section className="py-10">
      <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
      <p className="text-gray-600 mt-1">Internal tools for the backend team.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Panel title="User moderation" items={["Review creators","Verify brands","Manage roles"]}/>
        <Panel title="Campaign approvals" items={["Brief review","Content QA","Payout release"]}/>
        <Panel title="System" items={["Health checks","Logs","Feature flags"]}/>
      </div>
    </section>
    </>
  )
}

function Panel({ title, items }){
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-5">
        <div className="font-semibold">{title}</div>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {items.map(i=> <li key={i}>{i}</li>)}
        </ul>
      </div>
    </div>
  )
}
