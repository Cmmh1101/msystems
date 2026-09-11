import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { addContactToAudience } from "@/lib/resendAudience";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const locale = body.locale === "es" ? "es" : "en";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("contacts").insert({
    name: email.split("@")[0],
    email,
    source: "newsletter",
    status: "new",
    tags: ["newsletter-signup"],
    newsletter_opt_in: true,
    subscribed: true,
    locale,
  });

  if (error) {
    console.error("newsletter signup: insert failed", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await addContactToAudience({ email });

  return NextResponse.json({ ok: true });
}
