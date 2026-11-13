import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-navy-800">Welcome, {user?.fullName}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Role: <span className="font-medium text-navy-700">{user?.role}</span>
        </p>
        {user?.employeeId && (
          <p className="mt-1 text-sm text-slate-500">
            Employee ID: <span className="font-medium text-navy-700">{user.employeeId}</span>
          </p>
        )}
        <p className="mt-4 text-sm text-slate-500">Dashboard coming in a later phase.</p>

        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="mt-4 block text-sm font-medium text-navy-600 hover:underline">
            Manage registration requests
          </Link>
        )}

        <Button variant="outline" onClick={handleLogout} className="mt-6 w-full gap-2">
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </div>
  )
}