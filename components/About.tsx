export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-portrait">
          PORTRAIT
          <br />
          PLACEHOLDER
        </div>
        <div>
          <p className="eyebrow" style={{ color: "var(--brass)" }}>
            Who&apos;s building this
          </p>
          <h2>Built by Carla Montaño</h2>
          <p>
            Carla is a self-taught software engineer who built her own technical career from the ground up —
            and now brings that same systems thinking to the businesses she works with. Montaño Systems is
            where that experience becomes practical: fewer tools, clearer operations, more of your time back.
          </p>
          <a href="https://carlamontano.io" className="about-link">
            More about Carla →
          </a>

          <div className="collab-note">
            <b>A right-sized team, every time.</b> For specialized builds, Carla brings in a small network of
            vetted developers, designers, and automation engineers — sized to the project, never more than it
            needs.
          </div>
        </div>
      </div>
    </section>
  );
}
