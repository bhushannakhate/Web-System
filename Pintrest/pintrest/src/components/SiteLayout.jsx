import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './SiteLayout.css'

function SiteLayout() {
  const { user } = useAuth()
  const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined)

  return (
    <div className="site-layout workflow-shell">
      <div className="workflow-decoration" aria-hidden="true">
        <span className="workflow-orb workflow-orb-coral" />
        <span className="workflow-orb workflow-orb-blue" />
        <span className="workflow-orb workflow-orb-gold" />
        <span className="workflow-loop" />
      </div>

      <header className="workflow-header">
        <NavLink className="workflow-brand" to="/" aria-label="Pinboard Studio home">
          <span className="workflow-brand-mark" aria-hidden="true">p</span>
          <span>pinboard <small>studio</small></span>
        </NavLink>

        <nav className="workflow-nav" aria-label="Main navigation">
          <NavLink className={navLinkClass} to="/about">About</NavLink>
          <NavLink className={navLinkClass} to="/contact">Contact</NavLink>
          <NavLink className={navLinkClass} to="/privacy">Privacy</NavLink>
        </nav>

        <div className="workflow-account">
          {user ? (
            <>
              <NavLink className={({ isActive }) => `workflow-text-button${isActive ? ' active' : ''}`} to="/dashboard">Library</NavLink>
              <NavLink className={({ isActive }) => `workflow-text-button${isActive ? ' active' : ''}`} to="/account">Account</NavLink>
            </>
          ) : (
            <>
              <NavLink className="workflow-text-button" to="/login">Sign in</NavLink>
              <NavLink className="workflow-join-button" to="/register">Create account</NavLink>
            </>
          )}
        </div>
      </header>

      <div id="main-content"><Outlet /></div>

      <footer className="workflow-footer">
        <p className="footer-brand">A little space for big ideas.</p>
        <nav aria-label="Footer navigation">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
        </nav>
        <p className="footer-copyright">© {new Date().getFullYear()} Pinboard Studio</p>
      </footer>
    </div>
  )
}

export default SiteLayout
