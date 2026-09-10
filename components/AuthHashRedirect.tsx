"use client";

import { useEffect } from "react";

// Supabase's admin-generated magic links always carry the session in a URL
// hash fragment (#access_token=...), and fall back to redirecting to the
// project's bare Site URL whenever the exact requested redirect path isn't on
// the Supabase Redirect URLs allowlist — landing anywhere on the site, not
// necessarily /portal/auth/callback. This catches that fragment wherever it
// lands and forwards it to the page that actually knows how to consume it.
export default function AuthHashRedirect() {
  useEffect(() => {
    if (window.location.pathname === "/portal/auth/callback") return;
    if (window.location.hash.includes("access_token=")) {
      window.location.replace(`/portal/auth/callback${window.location.hash}`);
    }
  }, []);

  return null;
}
