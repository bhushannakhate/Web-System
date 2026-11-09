import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ArtworkForm from './components/ArtworkForm'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import CustomersPage from './pages/CustomersPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="studio" element={<ArtworkForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
