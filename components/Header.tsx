export default function Header() {
  return (
    <header className="site-header">
      <div className="container nav">
        <a href="#" className="wordmark">
          MONTAÑO <span>SYSTEMS</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#modules">Services</a>
          <a href="#about">About</a>
          <a href="#cta">Contact</a>
        </nav>
        <div className="nav-cta">
          <a href="#cta" className="btn btn-primary" style={{ padding: "10px 18px" }}>
            Book an audit
          </a>
          <button className="menu-toggle" aria-label="Menu">
            ≡
          </button>
        </div>
      </div>
    </header>
  );
}
