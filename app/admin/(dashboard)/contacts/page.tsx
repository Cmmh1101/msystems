import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ContactsTable, { type Contact } from "@/components/admin/ContactsTable";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminContactsPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contacts")
    .select("id,created_at,name,email,company,message,source,status,notes,subscribed,newsletter_opt_in,tags")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin contacts fetch failed", error);
  }

  return (
    <>
      <h1>Contacts</h1>
      <p className="admin-page-sub">
        Every lead from the contact form and the free systems check, most recent first.
      </p>
      <ContactsTable initialContacts={(data as Contact[]) ?? []} />
    </>
  );
}
