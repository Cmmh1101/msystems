import NewClientForm from "@/components/admin/NewClientForm";

export default function NewClientPage({
  searchParams,
}: {
  searchParams: { contactId?: string; name?: string; email?: string; company?: string };
}) {
  return (
    <>
      <h1>New client</h1>
      <p className="admin-page-sub">
        {searchParams.contactId
          ? "Converting a contact into a client. This marks the original contact as “won”."
          : "Add a client directly, without an existing contact record."}
      </p>
      <NewClientForm
        contactId={searchParams.contactId}
        initialName={searchParams.name}
        initialEmail={searchParams.email}
        initialCompany={searchParams.company}
      />
    </>
  );
}
