"use client";

import { FormEvent, useState } from "react";

export default function PortalLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email") }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-login-page">
      <div className="portal-login-card">
        <h1>Client portal</h1>
        {sent ? (
          <p className="portal-success">
            If that email has portal access, we&rsquo;ve sent a login link — check your inbox.
          </p>
        ) : (
          <>
            <p className="portal-sub">Enter your email and we&rsquo;ll send you a link to sign in.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row form-row-light">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Sending…" : "Send me a login link"}
              </button>
              {error && (
                <p className="form-status error" role="alert">
                  {error}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
