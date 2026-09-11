import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/resend";
import type { Locale } from "@/lib/i18n/dictionary";

const LOGIN_STRINGS: Record<Locale, { subject: string; body: (link: string) => string }> = {
  en: {
    subject: "Your Montano Systems portal login link",
    body: (link) => `Here's your login link: ${link}\n\nThis link will log you in directly — no password needed. It expires shortly, so use it soon.`,
  },
  es: {
    subject: "Tu enlace de inicio de sesión del portal de Montano Systems",
    body: (link) => `Aquí tienes tu enlace de inicio de sesión: ${link}\n\nEste enlace te iniciará sesión directamente — no necesitas contraseña. Expira pronto, así que úsalo pronto.`,
  },
};

// Always returns the same generic response regardless of whether the email
// matches an invited client, to avoid leaking which emails have portal access.
export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: client } = await admin
    .from("clients")
    .select("id,auth_user_id,locale")
    .eq("email", email)
    .maybeSingle();

  if (client && client.auth_user_id) {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: new URL("/portal/auth/callback", req.url).toString() },
    });

    if (!linkError && linkData) {
      const locale: Locale = client.locale === "es" ? "es" : "en";
      const strings = LOGIN_STRINGS[locale];
      try {
        const resend = getResend();
        await resend.emails.send({
          from: process.env.FROM_EMAIL!,
          to: email,
          subject: strings.subject,
          text: strings.body(linkData.properties.action_link),
        });
      } catch (err) {
        console.error("portal login: resend send failed", err);
      }
    } else {
      console.error("portal login: generateLink failed", linkError);
    }
  }

  return NextResponse.json({ ok: true });
}
