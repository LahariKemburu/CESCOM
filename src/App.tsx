import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login/Login'
import Signup from './pages/Auth/Signup/Signup'
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword'
import Home from './pages/Home/Home'
import Unauthorized from './pages/Unauthorized/Unauthorized'
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
            <Route path="/home" element={<Home />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin"
              element={<div className="p-10 text-xl text-navy-800">Admin only page</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}