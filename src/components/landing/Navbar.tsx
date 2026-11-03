import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-white">
            C
          </div>
          <span className="font-semibold text-navy-800">CESCOM</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-slate-600 transition hover:text-navy-700">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-navy-700">
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-800"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-slate-700"
            >
              {l.label}
            </a>
          ))}
          <Link to="/login" className="block text-sm font-medium text-slate-700">
            Login
          </Link>
          <Link
            to="/signup"
            className="block rounded-lg bg-navy-700 px-4 py-2 text-center text-sm font-medium text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}