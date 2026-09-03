import { getSupabaseServer } from "@/lib/supabaseServer";

export async function requireAdmin(): Promise<boolean> {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user && user.email === process.env.ADMIN_EMAIL;
}
