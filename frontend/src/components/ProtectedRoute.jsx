import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import NavBar from './NavBar'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="text-center text-muted mt-16 text-sm">Loading…</p>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <div className="min-h-screen">
      <NavBar />
      <Outlet />
    </div>
  )
}
