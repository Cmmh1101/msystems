import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = getSupabaseServer();
  await supabase.auth.signOut();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";
  return NextResponse.redirect(`${siteUrl}/portal/login`, { status: 303 });
}
