import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import "../admin.css";

export const metadata: Metadata = {
  title: "Admin sign in — Montano Systems",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
