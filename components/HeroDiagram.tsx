export default function HeroDiagram() {
  return (
    <svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing six disconnected business tools converging into one Montaño Systems node">
      <g stroke="#7FB8D9" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.55" fill="none">
        <line x1="65" y1="50" x2="440" y2="190" />
        <line x1="195" y1="30" x2="440" y2="190" />
        <line x1="80" y1="160" x2="440" y2="190" />
        <line x1="205" y1="180" x2="440" y2="190" />
        <line x1="65" y1="270" x2="440" y2="190" />
        <line x1="205" y1="300" x2="440" y2="190" />
      </g>

      <g fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#F5F3EE">
        <g transform="rotate(-5 65 50)">
          <rect x="20" y="30" width="90" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="65" y="54" textAnchor="middle">CRM</text>
        </g>
        <g transform="rotate(4 195 30)">
          <rect x="150" y="10" width="90" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="195" y="34" textAnchor="middle">FORMS</text>
        </g>
        <g transform="rotate(-3 80 160)">
          <rect x="30" y="140" width="100" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="80" y="164" textAnchor="middle">SCHEDULING</text>
        </g>
        <g transform="rotate(6 205 180)">
          <rect x="160" y="160" width="90" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="205" y="184" textAnchor="middle">INVOICING</text>
        </g>
        <g transform="rotate(3 65 270)">
          <rect x="20" y="250" width="90" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="65" y="274" textAnchor="middle">EMAIL</text>
        </g>
        <g transform="rotate(-4 205 300)">
          <rect x="150" y="280" width="110" height="40" rx="3" fill="#172A42" stroke="#7FB8D9" strokeWidth="1" opacity="0.9" />
          <text x="205" y="304" textAnchor="middle">SHEETS</text>
        </g>
      </g>

      <g>
        <rect x="440" y="150" width="170" height="80" rx="3" fill="#0F1B2D" stroke="#B8935A" strokeWidth="1.6" />
        <text x="525" y="184" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="14" fontWeight="600" fill="#F5F3EE">
          ONE SYSTEM
        </text>
        <text x="525" y="204" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#D4B483" letterSpacing="1">
          MONTAÑO SYSTEMS
        </text>
      </g>

      <g stroke="#7FB8D9" strokeWidth="1" opacity="0.5">
        <line x1="20" y1="345" x2="610" y2="345" />
        <line x1="20" y1="339" x2="20" y2="351" />
        <line x1="610" y1="339" x2="610" y2="351" />
      </g>
      <text x="315" y="368" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#7FB8D9" letterSpacing="0.5">
        6 TOOLS → 1 SYSTEM
      </text>
    </svg>
  );
}
