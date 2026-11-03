import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-navy-800">Access denied</h1>
      <p className="mt-2 text-sm text-slate-500">You do not have permission to view this page.</p>
      <Link to="/home" className="mt-4 text-sm font-medium text-navy-600 hover:underline">
        Go back
      </Link>
    </div>
  )
}