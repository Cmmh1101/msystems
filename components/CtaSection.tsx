import ContactForm from "./ContactForm";

export default function CtaSection() {
  return (
    <section className="cta-section section" id="cta">
      <div className="container">
        <h2>Ready to see what&apos;s slowing you down?</h2>
        <p>A systems audit takes two weeks and gives you a clear, prioritized plan — even if you never hire us to build it.</p>
        <ContactForm />
      </div>
    </section>
  );
}
