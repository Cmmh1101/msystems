import type { Config } from "@netlify/functions";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";
import { getResend } from "../../lib/resend";

type Locale = "en" | "es";

const NUDGE_STRINGS: Record<Locale, { subject: string; body: (name: string, ctaUrl: string, unsubscribeUrl: string) => string }> = {
  en: {
    subject: "Still thinking it over?",
    body: (name, ctaUrl, unsubscribeUrl) => `Hi ${name || "there"},

Just following up — a few days ago you reached out to Montano Systems. No pressure, just wanted to make sure this didn't slip through the cracks.

If you're ready, here's the link to book a systems audit: ${ctaUrl}

If now's not the right time, no worries at all — feel free to reply anytime with questions.

Talk soon,
Carla

—
Don't want these emails? Unsubscribe: ${unsubscribeUrl}`,
  },
  es: {
    subject: "¿Sigues pensándolo?",
    body: (name, ctaUrl, unsubscribeUrl) => `Hola ${name || ""},

Solo quería hacer seguimiento — hace unos días te comunicaste con Montano Systems. Sin presión, solo quería asegurarme de que esto no se perdiera.

Si estás listo, aquí está el enlace para agendar una auditoría de sistemas: ${ctaUrl}

Si este no es el momento adecuado, no hay problema — puedes responder cuando quieras si tienes preguntas.

Hablamos pronto,
Carla

—
¿No quieres recibir estos correos? Date de baja aquí: ${unsubscribeUrl}`,
  },
};

interface NudgeContact {
  id: string;
  name: string | null;
  email: string;
  locale: string | null;
}

export default async (): Promise<Response> => {
  const supabase = getSupabaseAdmin();
  const resend = getResend();
  const fromEmail = process.env.FROM_EMAIL!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: leads, error } = await supabase
    .from("contacts")
    .select("id,name,email,locale")
    .eq("status", "new")
    .eq("subscribed", true)
    .is("nudge_sent_at", null)
    .lte("created_at", threeDaysAgo);

  if (error) {
    console.error("nurture-nudge: fetch failed", error);
    return new Response(JSON.stringify({ ok: false, error: "fetch failed" }), { status: 500 });
  }

  const contacts = (leads ?? []) as NudgeContact[];
  let sent = 0;

  for (const contact of contacts) {
    const locale: Locale = contact.locale === "es" ? "es" : "en";
    const strings = NUDGE_STRINGS[locale];
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(contact.email)}`;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: contact.email,
        subject: strings.subject,
        text: strings.body(contact.name ?? "", `${siteUrl}/#cta`, unsubscribeUrl),
      });

      if (result.error) {
        console.error("nurture-nudge: send failed for", contact.email, result.error);
        continue;
      }

      const { error: updateError } = await supabase
        .from("contacts")
        .update({ nudge_sent_at: new Date().toISOString() })
        .eq("id", contact.id);

      if (updateError) {
        console.error("nurture-nudge: failed to mark nudge_sent_at for", contact.email, updateError);
      } else {
        sent++;
      }
    } catch (err) {
      console.error("nurture-nudge: unexpected error for", contact.email, err);
    }
  }

  return new Response(JSON.stringify({ ok: true, candidates: contacts.length, sent }), { status: 200 });
};

export const config: Config = {
  schedule: "0 14 * * *",
};
