import { NavLink, Outlet } from 'react-router-dom'
import './SiteLayout.css'

function SiteLayout() {

    // React Router passes isActive so Bootstrap can style the current page link.
    const navLinkClass = ({ isActive }) =>
        `nav-link${isActive ? ' active' : ''}`

    return (
        <div className="site-layout">
            {/* This header and footer wrap every page rendered by the router. */}
            <header className="site-header">
                <nav className="navbar navbar-expand-md"
                     aria-label="Primary navigation">
                    {/* This uses the bootstrap navbar element and uses navbar-expand-md element which will resize and change the navbar for smaller screens. */}

                    <div className="site-header-inner d-flex justify-content-between align-items-center w-100">
                        <NavLink className="site-brand navbar-brand me-3" to="/" aria-label="Pinboard Studio home">
                         <span className="brand-mark" aria-hidden="true">
                             p
                            </span>

                            <span> pinboard<span className="brand-light"> studio</span> </span>
                        </NavLink>
                        {/* This is the logo for the website. */}

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                data-bs-target="#primaryNavigation" aria-controls="primaryNavigation" aria-expanded="false"
                                aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        {/* This is the button that allows the menu to collapse and reappear on smaller screens, goes away when the screen size is larger. */}

                        <div className="collapse navbar-collapse justify-content-end ms-auto" id="primaryNavigation">
                            <ul id="navBar" className="navbar-nav site-nav ms-auto">
                                <li>
                                    <NavLink className={navLinkClass} to="/login">
                                        Login
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                        {/* This is the list that collapses when the menu button is pressed and links to the login page. */}
                    </div>
                </nav>
            </header>

            {/* Outlet is replaced by the selected route, such as AboutPage or LoginPage. */}
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
