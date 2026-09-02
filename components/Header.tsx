"use client";

import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav">
        <a href="#" className="wordmark">
          MONTANO <span>SYSTEMS</span>
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
          <button
            className="menu-toggle"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "×" : "≡"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <a href="#modules" onClick={() => setIsMenuOpen(false)}>
            Services
          </a>
          <a href="#about" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="#cta" onClick={() => setIsMenuOpen(false)}>
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}
