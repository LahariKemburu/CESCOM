import { Warehouse, Boxes, ArrowLeftRight, ClipboardList } from 'lucide-react'

const features = [
  {
    icon: Warehouse,
    title: 'Warehouse Management',
    text: 'Organize warehouses and storage locations in one place.',
  },
  {
    icon: Boxes,
    title: 'Inventory Tracking',
    text: 'Keep accurate, real-time visibility of your stock levels.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Stock Movement',
    text: 'Record and follow every transfer between locations.',
  },
  {
    icon: ClipboardList,
    title: 'Work Order Management',
    text: 'Plan and track telecom tower work orders end to end.',
  },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy-900">Everything your operations need</h2>
          <p className="mt-3 text-slate-600">Built for telecom infrastructure teams.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 p-6 transition hover:border-navy-100 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-navy-800">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}