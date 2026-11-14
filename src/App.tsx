import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login/Login'
import Signup from './pages/Auth/Signup/Signup'
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword'
import Unauthorized from './pages/Unauthorized/Unauthorized'
import Dashboard from './pages/Dashboard/Dashboard'
import PendingUsers from './pages/Admin/PendingUsers'
import UsersList from './pages/Admin/UsersList'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Dashboard />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<Navigate to="/admin/requests" replace />} />
                <Route path="/admin/requests" element={<PendingUsers />} />
                <Route path="/admin/users" element={<UsersList />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}