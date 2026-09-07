import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/clientAuth";
import "../portal.css";

export const metadata: Metadata = {
  title: "Client portal — Montano Systems",
  robots: { index: false, follow: false },
};

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const client = await requireClient();
  if (!client) {
    redirect("/portal/login");
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <span className="portal-brand">Montano Systems</span>
        <form action="/api/portal/logout" method="post">
          <button type="submit" className="btn btn-ghost on-light">
            Sign out
          </button>
        </form>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
