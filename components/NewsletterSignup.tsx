"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n/dictionary";
import { dictionaries } from "@/lib/i18n/dictionary";

export default function NewsletterSignup({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].newsletter;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setStatus("error");
        return;
      }

      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="newsletter-signup-success">{t.success}</p>;
  }

  return (
    <form className="newsletter-signup" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="newsletter-signup-label">
        {t.heading}
      </label>
      <div className="newsletter-signup-row">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder={t.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost" disabled={status === "submitting"}>
          {status === "submitting" ? "…" : t.button}
        </button>
      </div>
      {status === "error" && <p className="newsletter-signup-error">{t.error}</p>}
    </form>
  );
}
