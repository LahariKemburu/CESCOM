import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, RefreshCw, X } from 'lucide-react'
import type { Role } from '../../types/auth'
import { approveUser, getPendingUsers, rejectUser } from '../../services/admin/adminService'
import type { PendingUser } from '../../services/admin/adminService'

const ASSIGNABLE_ROLES: { value: Role; label: string }[] = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager' },
]

export default function PendingUsers() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [roles, setRoles] = useState<Record<string, Role>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setUsers(await getPendingUsers())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = () => {
    setLoading(true)
    setNotice('')
    void load()
  }

  const handleApprove = async (u: PendingUser) => {
    setBusyId(u.id)
    setError('')
    setNotice('')
    try {
      const result = await approveUser(u.id, roles[u.id] ?? 'EMPLOYEE')
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
      setNotice(`${u.fullName} approved. Employee ID: ${result.employeeId ?? '-'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (u: PendingUser) => {
    if (!window.confirm(`Reject the request from ${u.fullName}?`)) return
    setBusyId(u.id)
    setError('')
    setNotice('')
    try {
      await rejectUser(u.id)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
      setNotice(`${u.fullName}'s request was rejected.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/home"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-navy-800">Registration requests</h1>
              <p className="mt-1 text-sm text-slate-500">Approve or reject new users.</p>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
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
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No pending requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{u.fullName}</td>
                      <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={roles[u.id] ?? 'EMPLOYEE'}
                          onChange={(e) => setRoles({ ...roles, [u.id]: e.target.value as Role })}
                          disabled={busyId === u.id}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(u)}
                            disabled={busyId === u.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-navy-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(u)}
                            disabled={busyId === u.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}