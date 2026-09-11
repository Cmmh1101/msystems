"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWSLETTER_SEGMENTS, NEWSLETTER_SEGMENT_LABELS, type NewsletterSegment } from "@/lib/newsletter";
import NewsletterEditor from "./NewsletterEditor";

export default function NewsletterComposer() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [segment, setSegment] = useState<NewsletterSegment>("all");
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCountLoading(true);
    fetch(`/api/admin/newsletter/count?segment=${segment}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.ok) setCount(json.count);
      })
      .finally(() => {
        if (!cancelled) setCountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [segment]);

  async function handleTestSend(e: FormEvent) {
    e.preventDefault();
    setTestMessage(null);
    setTestSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, testEmail }),
      });
      const json = await res.json();
      setTestMessage(json.ok ? "Test email sent." : json.error || "Failed to send test email.");
    } catch {
      setTestMessage("Failed to send test email.");
    } finally {
      setTestSending(false);
    }
  }

  async function handleSend() {
    setSendMessage(null);
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, segment }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSendMessage(json.error || "Failed to send.");
      } else {
        setSendMessage(`Sent to ${json.sentCount} of ${json.totalRecipients} recipients.`);
        setSubject("");
        setContent("");
        router.refresh();
      }
    } catch {
      setSendMessage("Failed to send.");
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  const canSend = subject.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="admin-editor">
      <div className="form-row form-row-light">
        <label htmlFor="nl-subject">Subject</label>
        <input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>

      <div className="form-row form-row-light">
        <label>Body</label>
        <NewsletterEditor content={content} onChange={setContent} />
      </div>

      <div className="form-row form-row-light">
        <label htmlFor="nl-segment">Send to</label>
        <select
          id="nl-segment"
          className="admin-status-select"
          value={segment}
          onChange={(e) => setSegment(e.target.value as NewsletterSegment)}
        >
          {NEWSLETTER_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {NEWSLETTER_SEGMENT_LABELS[s]}
            </option>
          ))}
        </select>
        <p className="admin-save-hint">{countLoading ? "Counting…" : `${count ?? 0} subscribed recipient${count === 1 ? "" : "s"}`}</p>
      </div>

      <div className="admin-editor-actions" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
        <form onSubmit={handleTestSend} className="admin-inline-form">
          <input
            type="email"
            placeholder="Send a test to…"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-ghost on-light" disabled={!canSend || testSending}>
            {testSending ? "Sending…" : "Send test"}
          </button>
        </form>
        {testMessage && <p className="admin-save-hint">{testMessage}</p>}
      </div>

      <div className="admin-editor-actions">
        {!confirming ? (
          <button type="button" className="btn btn-primary" disabled={!canSend} onClick={() => setConfirming(true)}>
            Send to {NEWSLETTER_SEGMENT_LABELS[segment]}
          </button>
        ) : (
          <>
            <span className="admin-save-hint">
              Send &ldquo;{subject}&rdquo; to {count ?? 0} recipient{count === 1 ? "" : "s"}?
            </span>
            <button type="button" className="btn btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "Confirm send"}
            </button>
            <button type="button" className="admin-link-btn" onClick={() => setConfirming(false)} disabled={sending}>
              Cancel
            </button>
          </>
        )}
      </div>
      {sendMessage && (
        <p className="form-status" role="status">
          {sendMessage}
        </p>
      )}
    </div>
  );
}
