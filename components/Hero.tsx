import HeroDiagram from "./HeroDiagram";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">Systems architecture for growing businesses</p>
            <h1>Your business runs on twelve tools that don&apos;t talk to each other.</h1>
            <p className="lede">
              We design the systems, automation, and AI that let it run on{" "}
              <em style={{ fontStyle: "normal", color: "var(--line)" }}>one</em>, instead.
            </p>
            <div className="hero-ctas">
              <a href="#cta" className="btn btn-primary">
                Book a systems audit
              </a>
              <a href="#modules" className="btn btn-ghost">
                See how it works
              </a>
            </div>
          </div>

          <div className="diagram-wrap">
            <HeroDiagram />
          </div>
        </div>

        <div className="stepbar">
          <div className="container">
            <span className="step">
              <b>01</b>&nbsp;Audit
            </span>
            <span className="step">
              <b>02</b>&nbsp;Build
            </span>
            <span className="step">
              <b>03</b>&nbsp;Develop
            </span>
            <span className="step">
              <b>04</b>&nbsp;Automate
            </span>
            <span className="step">
              <b>05</b>&nbsp;Partner
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
