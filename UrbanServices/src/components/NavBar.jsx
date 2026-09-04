

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Urban Services</div>
      <ul className="navbar-links">
        <li><a href="/services">Services</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  );
}

export default NavBar;