import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { getResend } from "@/lib/resend";
import type { Locale } from "@/lib/i18n/dictionary";

const INVITE_STRINGS: Record<Locale, { subject: string; body: (name: string, link: string) => string }> = {
  en: {
    subject: "Your Montano Systems client portal is ready",
    body: (name, link) => `Hi ${name},

You now have access to your client portal, where you can track project status.

Log in here: ${link}

This link will log you in directly — no password needed. If it expires, just head to the portal and request a new one with your email.

Talk soon,
Carla`,
  },
  es: {
    subject: "Tu portal de clientes de Montano Systems está listo",
    body: (name, link) => `Hola ${name},

Ya tienes acceso a tu portal de clientes, donde puedes ver el estado de tus proyectos.

Inicia sesión aquí: ${link}

Este enlace te iniciará sesión directamente — no necesitas contraseña. Si expira, solo ve al portal y solicita uno nuevo con tu correo.

Hablamos pronto,
Carla`,
  },
};

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const { data: client, error: fetchError } = await admin
    .from("clients")
    .select("id,name,email,locale,auth_user_id")
    .eq("id", params.id)
    .single();

  if (fetchError || !client) {
    return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });
  }

  let authUserId = client.auth_user_id as string | null;

  if (!authUserId) {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: client.email,
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      console.error("client invite: createUser failed", createError);
      return NextResponse.json({ ok: false, error: "Failed to create the portal account." }, { status: 500 });
    }

    authUserId = newUser.user.id;

    const { error: linkUserError } = await admin.from("clients").update({ auth_user_id: authUserId }).eq("id", client.id);
    if (linkUserError) {
      console.error("client invite: failed to link auth_user_id", linkUserError);
      return NextResponse.json({ ok: false, error: "Failed to link the portal account." }, { status: 500 });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: client.email,
    options: { redirectTo: `${siteUrl}/portal/auth/callback` },
  });

  if (linkError || !linkData) {
    console.error("client invite: generateLink failed", linkError);
    return NextResponse.json({ ok: false, error: "Failed to generate the portal login link." }, { status: 500 });
  }

  const locale: Locale = client.locale === "es" ? "es" : "en";
  const strings = INVITE_STRINGS[locale];

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: client.email,
      subject: strings.subject,
      text: strings.body(client.name, linkData.properties.action_link),
    });

    if (result.error) {
      console.error("client invite: resend send failed", result.error);
      return NextResponse.json(
        { ok: false, error: "Portal account is set up, but the invite email failed to send." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("client invite: resend client error", err);
    return NextResponse.json(
      { ok: false, error: "Portal account is set up, but the invite email failed to send." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
