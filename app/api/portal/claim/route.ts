import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Runs right after any successful portal login (magic link or Google) to decide
// whether the now-authenticated identity is actually allowed in: the portal has
// no self-signup, so access is granted only when the signed-in email matches an
// existing clients row — regardless of which auth method was used to get here,
// and regardless of whether that row was ever formally "invited."
export async function POST() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: client } = await admin.from("clients").select("id,auth_user_id").eq("email", user.email).maybeSingle();

  if (!client) {
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false, error: "This email isn't associated with a client account." }, { status: 403 });
  }

  if (client.auth_user_id !== user.id) {
    const { error } = await admin.from("clients").update({ auth_user_id: user.id }).eq("id", client.id);
    if (error) {
      console.error("portal claim: failed to link auth_user_id", error);
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, error: "Failed to complete sign-in." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
