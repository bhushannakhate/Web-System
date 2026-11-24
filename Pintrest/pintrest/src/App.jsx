import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import LoginPage from './pages/LoginPage'
import CustomersPage from './pages/CustomersPage'
import AccountPage from './pages/AccountPage'
import CreationDetailPage from './pages/CreationDetailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import PhotoWorkflow from './components/PhotoWorkflow'
import SiteLayout from './components/SiteLayout'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute'
import { AdminAccessProvider } from './auth/AdminAccessProvider'
import { trackPageView } from './services/analytics'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))

function AnalyticsPageView() {
  const location = useLocation()
  const lastPath = useRef('')

  useEffect(() => {
    const path = location.pathname
    if (lastPath.current === path) return
    lastPath.current = path
    trackPageView(path)
  }, [location.pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsPageView />
      <AdminAccessProvider>
        <Routes>
          <Route path="/" element={<PhotoWorkflow />} />

          <Route element={<SiteLayout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/creations/:creationId" element={<CreationDetailPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/customers" element={<CustomersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/studio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAccessProvider>
    </BrowserRouter>
  )
}

export default App
