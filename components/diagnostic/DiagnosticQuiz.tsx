"use client";

import { FormEvent, useState } from "react";
import { DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_TIERS, MAX_SCORE, DiagnosticTier } from "@/lib/diagnostic";

type Stage = "intro" | "question" | "email" | "submitting" | "result" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DiagnosticQuiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(DIAGNOSTIC_QUESTIONS.length).fill(-1));
  const [result, setResult] = useState<{ score: number; tier: DiagnosticTier } | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function selectAnswer(optionIndex: number) {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);

    if (step < DIAGNOSTIC_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStage("email");
    }
  }

  function goBack() {
    if (step === 0) {
      setStage("intro");
      return;
    }
    setStep(step - 1);
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const submittedEmail = String(data.get("email") || "").trim();
    const name = String(data.get("name") || "").trim();
    const company = String(data.get("company") || "").trim();
    const newsletterOptIn = data.get("newsletterOptIn") === "on";

    if (!submittedEmail || !EMAIL_RE.test(submittedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setEmail(submittedEmail);
    setStage("submitting");

    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: submittedEmail,
          company,
          newsletterOptIn,
          answers,
        }),
      });

      if (!res.ok) throw new Error("request-failed");
      const json = await res.json();

      const tier = DIAGNOSTIC_TIERS.find((t) => t.id === json.tierId) ?? DIAGNOSTIC_TIERS[0];
      setResult({ score: json.score, tier });
      setStage("result");
    } catch {
      setSubmitError("Something went wrong on our end — please try again.");
      setStage("error");
    }
  }

  function retrySubmit() {
    setSubmitError(null);
    setStage("email");
  }

  if (stage === "intro") {
    return (
      <div className="diagnostic-card">
        <p className="eyebrow" style={{ color: "var(--ink)" }}>
          Free systems check
        </p>
        <h2>Where is your business losing time to tool sprawl?</h2>
        <p className="diagnostic-lede">
          Six quick questions. At the end, you&apos;ll get a personalized score and a plain-English read on
          what to fix first — sent to your inbox too.
        </p>
        <button className="btn btn-primary" onClick={() => setStage("question")}>
          Start the check →
        </button>
      </div>
    );
  }

  if (stage === "question") {
    const question = DIAGNOSTIC_QUESTIONS[step];
    return (
      <div className="diagnostic-card">
        <div className="diagnostic-progress">
          <div className="diagnostic-progress-bar">
            <div
              className="diagnostic-progress-fill"
              style={{ width: `${((step + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="diagnostic-progress-label">
            Question {step + 1} of {DIAGNOSTIC_QUESTIONS.length}
          </span>
        </div>

        <h3 className="diagnostic-prompt">{question.prompt}</h3>

        <div className="diagnostic-options">
          {question.options.map((option, i) => (
            <button
              key={option.label}
              type="button"
              className={`diagnostic-option ${answers[step] === i ? "selected" : ""}`}
              onClick={() => selectAnswer(i)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button type="button" className="diagnostic-back" onClick={goBack}>
          ← Back
        </button>
      </div>
    );
  }

  if (stage === "email" || stage === "submitting" || stage === "error") {
    return (
      <div className="diagnostic-card">
        <p className="eyebrow" style={{ color: "var(--ink)" }}>
          Almost there
        </p>
        <h3 className="diagnostic-prompt">Where should we send your results?</h3>
        <form onSubmit={handleEmailSubmit} noValidate>
          <div className="form-row form-row-light">
            <label htmlFor="d-name">Name</label>
            <input id="d-name" name="name" type="text" autoComplete="name" placeholder="Your name" />
          </div>
          <div className="form-row form-row-light">
            <label htmlFor="d-email">Email</label>
            <input
              id="d-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "d-email-error" : undefined}
            />
            {emailError && (
              <p className="form-error" id="d-email-error">
                {emailError}
              </p>
            )}
          </div>
          <div className="form-row form-row-light">
            <label htmlFor="d-company">Company (optional)</label>
            <input id="d-company" name="company" type="text" autoComplete="organization" placeholder="Your company" />
          </div>
          <label className="diagnostic-checkbox">
            <input type="checkbox" name="newsletterOptIn" defaultChecked />
            Send me occasional tips on systems and automation. Unsubscribe anytime.
          </label>

          <button type="submit" className="btn btn-primary" disabled={stage === "submitting"}>
            {stage === "submitting" ? "Scoring…" : "See my results"}
          </button>

          {stage === "error" && (
            <p className="form-status error" role="alert">
              {submitError}{" "}
              <button type="button" className="diagnostic-retry" onClick={retrySubmit}>
                Try again
              </button>
            </p>
          )}
        </form>
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <div className="diagnostic-card diagnostic-result" id="diagnostic-result-print">
        <p className="eyebrow" style={{ color: "var(--brass)" }}>
          Your results
        </p>
        <div className="diagnostic-score">
          <span className="diagnostic-score-num">{result.score}</span>
          <span className="diagnostic-score-max">/ {MAX_SCORE}</span>
        </div>
        <h3 className="diagnostic-tier">{result.tier.label}</h3>
        <p className="diagnostic-lede">{result.tier.summary}</p>
        <p className="diagnostic-lede">{result.tier.recommendation}</p>

        <div className="diagnostic-result-actions">
          <a href="/#cta" className="btn btn-primary">
            Book a systems audit
          </a>
          <button type="button" className="btn btn-ghost on-light" onClick={() => window.print()}>
            Download report
          </button>
        </div>
        <p className="diagnostic-sent-note">We&apos;ve also emailed a copy of this to {email}.</p>
      </div>
    );
  }

  return null;
}
