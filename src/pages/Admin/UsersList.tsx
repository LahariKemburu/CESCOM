import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types/auth'
import { getUsers, setUserActive, updateUserRole } from '../../services/admin/adminService'
import type { AdminUser, UserStatus } from '../../services/admin/adminService'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  EMPLOYEE: 'Employee',
}

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-slate-200 text-slate-600',
}

const STATUS_FILTERS: ('ALL' | UserStatus)[] = ['ALL', 'ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']

export default function UsersList() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL')

  const load = useCallback(async () => {
    try {
      setUsers(await getUsers())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeId ?? '').toLowerCase().includes(q)
      )
    })
  }, [users, search, statusFilter])

  const replaceUser = (updated: AdminUser) =>
    setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))

  const handleRefresh = () => {
    setLoading(true)
    setNotice('')
    void load()
  }

  const handleRoleChange = async (u: AdminUser, role: Role) => {
    if (role === u.role) return
    if (!window.confirm(`Change ${u.fullName}'s role to ${ROLE_LABELS[role]}?`)) return
    setBusyId(u.id)
    setError('')
    setNotice('')
    try {
      replaceUser(await updateUserRole(u.id, role))
      setNotice(`${u.fullName} is now ${ROLE_LABELS[role]}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change role')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (u: AdminUser) => {
    const activate = u.status === 'INACTIVE'
    const question = activate
      ? `Reactivate ${u.fullName}'s account?`
      : `Deactivate ${u.fullName}'s account? They will not be able to log in.`
    if (!window.confirm(question)) return
    setBusyId(u.id)
    setError('')
    setNotice('')
    try {
      replaceUser(await setUserActive(u.id, activate))
      setNotice(`${u.fullName} was ${activate ? 'reactivated' : 'deactivated'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the account')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy-800">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} of {users.length} users
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or employee ID"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Employee ID</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === me?.id
                const busy = busyId === u.id
                return (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {u.fullName}
                      {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{u.employeeId ?? '-'}</td>
                    <td className="py-3 pr-4">
                      {u.status === 'ACTIVE' && !isSelf ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                          disabled={busy}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        >
                          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-600">{ROLE_LABELS[u.role]}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[u.status]}`}>
                        {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        {isSelf || (u.status !== 'ACTIVE' && u.status !== 'INACTIVE') ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={busy}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            {u.status === 'INACTIVE' ? 'Reactivate' : 'Deactivate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}