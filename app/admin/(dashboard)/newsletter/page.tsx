import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import NewsletterComposer from "@/components/admin/NewsletterComposer";
import { NEWSLETTER_SEGMENT_LABELS, type Newsletter, type NewsletterSegment } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminNewsletterPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("newsletters")
    .select("id,created_at,subject,body,segment,sent_at,recipient_count")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("admin newsletter history fetch failed", error);
  }

  const history = (data as Newsletter[]) ?? [];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Newsletter</h1>
          <p className="admin-page-sub">Compose with images, links, and formatting, send a test to yourself, then send to a list.</p>
        </div>
      </div>

      <NewsletterComposer />

      <h2 className="admin-section-heading" style={{ marginTop: "32px" }}>
        Previously sent
      </h2>
      {history.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-empty">Nothing sent yet.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>List</th>
                <th>Recipients</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {history.map((n) => (
                <tr key={n.id}>
                  <td>{n.subject}</td>
                  <td className="muted">{NEWSLETTER_SEGMENT_LABELS[n.segment as NewsletterSegment] ?? n.segment}</td>
                  <td className="muted">{n.recipient_count}</td>
                  <td className="muted">{n.sent_at ? new Date(n.sent_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
