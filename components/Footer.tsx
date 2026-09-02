export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a href="#" className="wordmark" style={{ fontSize: "15px" }}>
          MONTANO <span>SYSTEMS</span>
        </a>
        <nav className="footer-links" aria-label="Footer">
          <a href="#modules">Services</a>
          <a href="#about">About</a>
          <a href="#cta">Contact</a>
        </nav>
        <span className="footer-fine">
          © {year} In Motion Web Solutions, LLC — dba Montano Systems
        </span>
      </div>
      <div className="container footer-legal">
        Montano Systems is a dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee.
      </div>
    </footer>
  );
}
