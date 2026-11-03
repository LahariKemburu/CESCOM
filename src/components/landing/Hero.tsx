import { Link } from 'react-router-dom'

function DashboardMockup() {
  const stats = [
    { label: 'Open Work Orders', value: '128' },
    { label: 'Items in Stock', value: '4,562' },
    { label: 'Transfers Today', value: '37' },
  ]
  const rows = [
    { id: 'WO-1042', site: 'Tower Site A', status: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { id: 'WO-1043', site: 'Tower Site B', status: 'Completed', color: 'bg-green-100 text-green-700' },
    { id: 'WO-1044', site: 'Tower Site C', status: 'Pending', color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      </div>
      <div className="flex">
        <div className="hidden w-40 space-y-2 border-r border-slate-200 bg-navy-900 p-4 sm:block">
          <div className="h-2.5 w-20 rounded bg-white/80" />
          <div className="h-2 w-24 rounded bg-white/30" />
          <div className="h-2 w-16 rounded bg-white/30" />
          <div className="h-2 w-20 rounded bg-white/30" />
          <div className="h-2 w-24 rounded bg-white/30" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] text-slate-500 sm:text-xs">{s.label}</p>
                <p className="mt-1 text-lg font-semibold text-navy-800 sm:text-xl">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 text-xs last:border-0"
              >
                <span className="font-medium text-slate-700">{r.id}</span>
                <span className="hidden text-slate-500 sm:block">{r.site}</span>
                <span className={`rounded-full px-2 py-0.5 ${r.color}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="product" className="scroll-mt-16 bg-gradient-to-b from-navy-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
          Manage Telecom Infrastructure Operations Smarter.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          A unified platform to streamline warehouse operations, inventory tracking and telecom
          infrastructure workflows.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="rounded-lg bg-navy-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-800"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>
        <div className="mx-auto mt-14 max-w-4xl text-left">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}