import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AdminAccessContext } from './adminAccessContext'
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

export function AdminRoute() {
  const { isAdmin, loading, error } = useContext(AdminAccessContext)

  if (loading) {
    return (
      <main className="auth-page" aria-live="polite">
        <p className="auth-loading" role="status">Checking administrator access…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="auth-page">
        <p className="auth-error" role="alert">
          Could not verify administrator access. {error}
        </p>
      </main>
    )
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
