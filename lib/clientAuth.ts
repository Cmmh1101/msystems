import { getSupabaseServer } from "./supabaseServer";
import { getSupabaseAdmin } from "./supabaseAdmin";

export interface PortalClient {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export async function requireClient(): Promise<PortalClient | null> {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data: client } = await admin
    .from("clients")
    .select("id,name,email,company")
    .eq("auth_user_id", user.id)
    .single();

  return client ?? null;
}
