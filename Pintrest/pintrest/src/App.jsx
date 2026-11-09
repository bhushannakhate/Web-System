import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ArtworkForm from './components/ArtworkForm'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import CustomersPage from './pages/CustomersPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The evolved ArtworkForm is the home screen and has its own navigation. */}
        <Route path="/" element={<ArtworkForm />} />

        {/* Preserve the original shared layout for the existing content pages. */}
        <Route element={<SiteLayout />}>
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
