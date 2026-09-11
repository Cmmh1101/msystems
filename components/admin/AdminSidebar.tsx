"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/case-studies", label: "Case Studies" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <a href="/" className="wordmark">
        MONTANO <span>SYSTEMS</span>
      </a>
      {NAV_ITEMS.map((item) => (
        <a key={item.href} href={item.href} className={`admin-nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}>
          {item.label}
        </a>
      ))}
      <div className="admin-sidebar-footer">
        <a href="/" className="admin-back-link">
          ← Back to site
        </a>
        <button type="button" className="admin-signout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
