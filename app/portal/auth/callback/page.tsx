"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import "../../portal.css";

export default function PortalAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function run() {
      // Supabase's admin-generated magic links redirect with the session in the
      // URL hash fragment (#access_token=...), never as query params — fragments
      // are never sent to the server, so this exchange has to happen client-side.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError(true);
        return;
      }

      const supabase = getSupabaseBrowser();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError(true);
        return;
      }

      router.replace("/portal");
    }

    run();
  }, [router]);

  return (
    <div className="portal-login-page">
      <div className="portal-login-card">
        {error ? (
          <>
            <h1>Login link expired</h1>
            <p className="portal-sub">
              That link is no longer valid. <a href="/portal/login">Request a new one</a>.
            </p>
          </>
        ) : (
          <p className="portal-sub">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
