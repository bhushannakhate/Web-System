import { NavLink, Outlet } from 'react-router-dom'
import './SiteLayout.css'

function SiteLayout() {

    const navLinkClass = ({ isActive }) =>
        `nav-link${isActive ? ' active' : ''}`

    return (
        <div className="site-layout">
            <header className="site-header">
                <nav className="navbar navbar-expand-md"
                     aria-label="Primary navigation">

                    <div className="site-header-inner d-flex justify-content-between align-items-center w-100">
                        <NavLink className="site-brand navbar-brand me-3" to="/" aria-label="Pinboard Studio home">
                         <span className="brand-mark" aria-hidden="true">
                             p
                            </span>

                            <span> pinboard<span className="brand-light"> studio</span> </span>
                        </NavLink>

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                data-bs-target="#primaryNavigation" aria-controls="primaryNavigation" aria-expanded="false"
                                aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse justify-content-end ms-auto" id="primaryNavigation">
                            <ul id="navBar" className="navbar-nav site-nav ms-auto">
                                <li>
                                    <NavLink className={navLinkClass} to="/login">
                                        Login
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
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
