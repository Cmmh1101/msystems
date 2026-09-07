import type { Metadata } from "next";
import PortalLoginForm from "@/components/portal/PortalLoginForm";
import "../portal.css";

export const metadata: Metadata = {
  title: "Client portal sign in — Montano Systems",
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return <PortalLoginForm />;
}
