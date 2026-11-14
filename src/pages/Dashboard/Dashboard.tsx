import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  Boxes,
  ClipboardList,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types/auth'
import { getUsers } from '../../services/admin/adminService'
import type { AdminUser } from '../../services/admin/adminService'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  EMPLOYEE: 'Employee',
}

const UPCOMING: { icon: LucideIcon; title: string }[] = [
  { icon: Warehouse, title: 'Warehouse Management' },
  { icon: Boxes, title: 'Inventory Tracking' },
  { icon: ArrowLeftRight, title: 'Stock Movement' },
  { icon: ClipboardList, title: 'Work Orders' },
]

function StatCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  to?: string
}) {
  const body = (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-navy-100">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-navy-800">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
        <Icon size={20} />
      </div>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    getUsers()
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load statistics')
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const count = (status: AdminUser['status']) =>
    users ? users.filter((u) => u.status === status).length : '-'

  const firstName = user?.fullName.split(' ')[0] ?? ''

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-navy-800">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user ? ROLE_LABELS[user.role] : ''}
          {user?.employeeId ? ` · ${user.employeeId}` : ''}
        </p>
      </div>

      {isAdmin && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Users overview
          </h2>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={users ? users.length : '-'} icon={Users} to="/admin/users" />
            <StatCard label="Active" value={count('ACTIVE')} icon={UserCheck} to="/admin/users" />
            <StatCard label="Pending requests" value={count('PENDING')} icon={UserPlus} to="/admin/requests" />
            <StatCard label="Deactivated" value={count('INACTIVE')} icon={UserX} to="/admin/users" />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Coming soon
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UPCOMING.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon size={20} />
              </div>
              <p className="font-medium text-slate-700">{title}</p>
              <p className="mt-1 text-xs text-slate-400">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}