"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import "../../portal.css";

export default function PortalAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const supabase = getSupabaseBrowser();

        // Supabase's admin-generated magic links redirect with the session as
        // #access_token=... in the URL hash fragment (never query params — and
        // fragments never reach the server, so this has to run client-side).
        // Google sign-in instead uses the PKCE flow, landing here with ?code=...
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = new URLSearchParams(window.location.search).get("code");

        let sessionError = null;

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          sessionError = error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          sessionError = error;
        } else {
          setError("That link is no longer valid.");
          return;
        }

        if (sessionError) {
          console.error("portal callback: session error", sessionError);
          setError("That link is no longer valid.");
          return;
        }

        // The portal has no self-signup: only an email that matches an existing
        // client record is allowed through, regardless of how they signed in.
        const claimRes = await fetch("/api/portal/claim", { method: "POST" });
        const claimJson = await claimRes.json().catch(() => null);

        if (!claimRes.ok || !claimJson?.ok) {
          setError(claimJson?.error || "This account isn't authorized for the client portal.");
          return;
        }

        router.replace("/portal");
      } catch (err) {
        console.error("portal callback: unexpected error", err);
        setError("Something went wrong. Please try again.");
      }
    }

    run();
  }, [router]);

  return (
    <div className="portal-login-page">
      <div className="portal-login-card">
        {error ? (
          <>
            <h1>Couldn&rsquo;t sign you in</h1>
            <p className="portal-sub">
              {error} <a href="/portal/login">Try again</a>.
            </p>
          </>
        ) : (
          <p className="portal-sub">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
