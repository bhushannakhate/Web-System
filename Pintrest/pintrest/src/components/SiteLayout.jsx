import { NavLink, Outlet } from 'react-router-dom'
import './SiteLayout.css'

function SiteLayout() {
  return (
    <div className="site-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <div className="site-header-inner">
          <NavLink className="site-brand" to="/" aria-label="Pinboard Studio home">
            <span className="brand-mark" aria-hidden="true">p</span>
            <span>pinboard<span className="brand-light"> studio</span></span>
          </NavLink>

          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/" end>Studio</NavLink>
          </nav>

          <NavLink className="header-cta" to="/login">Sign in/Login</NavLink>
        </div>
      </header>

      <div id="main-content"><Outlet /></div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="footer-brand">A little space for big ideas.</p>
          <nav className="footer-nav" aria-label="Footer navigation">
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          <p className="footer-copyright">© {new Date().getFullYear()} Pinboard Studio</p>
        </div>
      </footer>
    </div>
  )
}

export default SiteLayout
