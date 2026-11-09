import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="auth-page" aria-live="polite">
        <p className="auth-loading" role="status">Checking your account…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="auth-page" aria-live="polite">
        <p className="auth-loading" role="status">Checking your account…</p>
      </main>
    )
  }

  return user ? <Navigate to="/account" replace /> : <Outlet />
}
