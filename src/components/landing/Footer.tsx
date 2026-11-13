export default function Footer() {
  return (
    <footer id="about" className="scroll-mt-16 bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="max-w-sm">
            <p className="text-lg font-semibold text-white">CESCOM</p>
            <p className="mt-2 text-sm text-slate-400">
              A unified platform for telecom infrastructure operations, warehouse management and
              work orders.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms and Conditions</a>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} CESCOM. All rights reserved.
        </p>
      </div>
    </footer>
  )
}