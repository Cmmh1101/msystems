"use client";

import { FormEvent, useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].contactForm;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(data: FormData): FieldErrors {
    const next: FieldErrors = {};
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name) next.name = t.errors.name;
    if (!email) next.email = t.errors.email;
    else if (!EMAIL_RE.test(email)) next.email = t.errors.emailInvalid;
    if (!message) next.message = t.errors.message;

    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          locale,
        }),
      });

      if (!res.ok) throw new Error("request-failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form">
        <div className="form-status success" role="status">
          {t.successMessage}
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="name">{t.nameLabel}</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t.namePlaceholder}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p className="form-error" id="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="email">{t.emailLabel}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p className="form-error" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="company">{t.companyLabel}</label>
        <input id="company" name="company" type="text" autoComplete="organization" placeholder={t.companyPlaceholder} />
      </div>

      <div className="form-row">
        <label htmlFor="message">{t.messageLabel}</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={t.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p className="form-error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? t.sending : t.submit}
      </button>

      {status === "error" && (
        <p className="form-status error" role="alert">
          {t.errorMessage}
        </p>
      )}
    </form>
  );
}
