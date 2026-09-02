const modules = [
  {
    num: "01 — Diagnose",
    title: "Audit & Roadmap",
    description:
      "We map every tool, workflow, and manual step in your business, then hand you a prioritized plan for what to fix first.",
    spec: "2 weeks · Fixed fee",
  },
  {
    num: "02 — Connect",
    title: "Systems Build",
    description:
      "We connect your CRM, scheduling, invoicing, and lead flow into one system that runs without you chasing it.",
    spec: "4–8 weeks · Project",
  },
  {
    num: "03 — Build",
    title: "Custom Development",
    description:
      "When the system needs something that doesn't exist yet — a client portal, an internal tool, a real web app — we build it, not just connect it.",
    spec: "6–12 weeks · Project",
  },
  {
    num: "04 — Elevate",
    title: "AI & Intelligence",
    description:
      "Automations and AI agents for follow-up, routing, and reporting — the parts of the business that shouldn't need a human every time.",
    spec: "Ongoing · Add-on",
  },
  {
    num: "05 — Sustain",
    title: "Ongoing Partner",
    description: "Monthly iteration as your business grows — new automations, new integrations, one point of contact.",
    spec: "Monthly · Retainer",
  },
];

export default function Modules() {
  return (
    <section className="modules section" id="modules">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">The engagement</p>
          <h2>How we work</h2>
        </div>
        <div className="module-grid">
          {modules.map((m) => (
            <div className="module" key={m.num}>
              <span className="num">{m.num}</span>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
              <span className="spec">{m.spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
