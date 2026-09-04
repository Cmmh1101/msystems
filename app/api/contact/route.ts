import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/resend";
import type { Locale } from "@/lib/i18n/dictionary";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  locale?: unknown;
}

const REPLY_STRINGS: Record<Locale, { subject: string; body: (name: string) => string }> = {
  en: {
    subject: "Got your message — Montano Systems",
    body: (name) => `Hi ${name},\n\nThanks for reaching out — got it. I'll be in touch within one business day with next steps.\n\nTalk soon,\nCarla`,
  },
  es: {
    subject: "Recibimos tu mensaje — Montano Systems",
    body: (name) => `Hola ${name},\n\nGracias por escribirnos — lo recibimos. Te contactaré dentro de un día hábil con los próximos pasos.\n\nHablamos pronto,\nCarla`,
  },
};

function sanitize(value: unknown, maxLength = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitize(body.name, 200);
  const email = sanitize(body.email, 320);
  const company = sanitize(body.company, 200);
  const message = sanitize(body.message, 5000);
  const locale: Locale = body.locale === "es" ? "es" : "en";

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please fill in your name, a valid email, and a message." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error: insertError } = await supabase.from("contacts").insert({
      name,
      email,
      company: company || null,
      message,
      source: "website",
      status: "new",
    });

    if (insertError) {
      console.error("contact form: supabase insert failed", insertError);
      return NextResponse.json({ ok: false, error: "We couldn't save your message. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("contact form: supabase client error", err);
    return NextResponse.json({ ok: false, error: "We couldn't save your message. Please try again." }, { status: 500 });
  }

  try {
    const resend = getResend();
    const fromEmail = process.env.FROM_EMAIL!;
    const notifyEmail = process.env.NOTIFY_EMAIL!;

    const notifyResult = await resend.emails.send({
      from: fromEmail,
      to: notifyEmail,
      subject: `New lead: ${name}`,
      text: `New website lead\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "—"}\n\nMessage:\n${message}`,
    });
    if (notifyResult.error) {
      console.error("contact form: resend notify send failed", notifyResult.error);
    }

    const replyStrings = REPLY_STRINGS[locale];
    const replyResult = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: replyStrings.subject,
      text: replyStrings.body(name),
    });
    if (replyResult.error) {
      console.error("contact form: resend auto-reply send failed", replyResult.error);
    }
  } catch (err) {
    console.error("contact form: resend client error", err);
    // The lead is already saved in Supabase, so treat this as a soft failure.
  }

  return NextResponse.json({ ok: true });
}
