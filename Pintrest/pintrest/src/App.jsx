import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ArtworkForm from './components/ArtworkForm'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'

function App() {
  // BrowserRouter reads the URL; Routes selects the matching page component.
  return (
    <BrowserRouter>
      <Routes>
        {/* SiteLayout is shared by every route; its Outlet displays each child page. */}
        <Route element={<SiteLayout />}>
          <Route index element={<ArtworkForm />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          {/* Unknown URLs return to Home; replace avoids adding the bad URL to history. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
