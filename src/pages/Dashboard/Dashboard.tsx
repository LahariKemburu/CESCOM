import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, Boxes, CheckCircle2, PackageX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types/auth'
import StockActivityList from '../../components/warehouse/StockActivityList'
import { getItemStats, getStockSummary } from '../../services/items/itemService'
import type { ItemStats, StockSummary } from '../../services/items/itemService'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  EMPLOYEE: 'Employee',
}

const DAY_OPTIONS = [3, 4, 7, 30]

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-navy-800">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
        <Icon size={20} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ItemStats | null>(null)
  const [days, setDays] = useState(4)
  const [result, setResult] = useState<{ days: number; summary: StockSummary } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getItemStats()
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load statistics')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getStockSummary(days)
      .then((summary) => {
        if (cancelled) return
        setResult({ days, summary })
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load stock activity')
      })
    return () => {
      cancelled = true
    }
  }, [days])

  const loading = !error && result?.days !== days
  const summary = result?.summary
  const firstName = user?.fullName.split(' ')[0] ?? ''

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy-800">Warehouse dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {firstName}
            {user ? ` · ${ROLE_LABELS[user.role]}` : ''}
          </p>
        </div>
        <Link
          to="/warehouse/items"
          className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800"
        >
          Manage items &amp; stock <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total items" value={stats ? stats.total : '-'} icon={Boxes} />
        <StatCard label="In stock" value={stats ? stats.inStock : '-'} icon={CheckCircle2} />
        <StatCard label="Out of stock" value={stats ? stats.outOfStock : '-'} icon={PackageX} />
        <StatCard
          label={`Stock changes (${days} days)`}
          value={summary ? summary.inCount + summary.outCount : '-'}
          icon={ArrowLeftRight}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy-800">Stock activity</h2>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  days === d
                    ? 'bg-navy-700 text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Last {d} days
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">Loading...</p>
        ) : (
          summary && <StockActivityList movements={summary.movements} perItem={false} />
        )}
      </section>
    </div>
  )
}