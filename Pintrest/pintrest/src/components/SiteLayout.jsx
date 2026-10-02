import { NavLink, Outlet } from 'react-router-dom'
import './SiteLayout.css'

function SiteLayout() {
  return (
    <div className="site-layout">

        <nav>

            <div>
                <ul id = "navBar">
                    <li>
                        <a href={"index.html"}> Home </a>
                    </li>
                    <li>
                        <NavLink to="/about">About</NavLink>
                    </li>
                    <li>
                        <NavLink to="/login">Login</NavLink>
                    </li>
                    <li>
                        <NavLink to="">Pinterest</NavLink>
                    </li>
                </ul>
            </div>
        </nav>

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
