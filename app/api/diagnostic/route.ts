import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/resend";
import { DIAGNOSTIC_QUESTIONS, MAX_SCORE, scoreDiagnostic } from "@/lib/diagnostic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DiagnosticPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  newsletterOptIn?: unknown;
  answers?: unknown;
}

function sanitize(value: unknown, maxLength = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(req: NextRequest) {
  let body: DiagnosticPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitize(body.name, 200);
  const email = sanitize(body.email, 320);
  const company = sanitize(body.company, 200);
  const newsletterOptIn = body.newsletterOptIn !== false;

  const rawAnswers = Array.isArray(body.answers) ? body.answers : [];
  const answers = DIAGNOSTIC_QUESTIONS.map((_, i) => {
    const val = rawAnswers[i];
    return typeof val === "number" && Number.isInteger(val) ? val : -1;
  });

  const allAnswered = answers.every((a, i) => a >= 0 && a < DIAGNOSTIC_QUESTIONS[i].options.length);

  if (!email || !EMAIL_RE.test(email) || !allAnswered) {
    return NextResponse.json({ ok: false, error: "Please answer every question and enter a valid email." }, { status: 400 });
  }

  const { score, tier } = scoreDiagnostic(answers);

  let contactId: string | null = null;

  try {
    const supabase = getSupabaseAdmin();

    const { data: contactRow, error: contactError } = await supabase
      .from("contacts")
      .insert({
        name: name || "Systems check lead",
        email,
        company: company || null,
        message: `Completed the free systems check. Score: ${score}/${MAX_SCORE} (${tier.label}).`,
        source: "diagnostic",
        status: "new",
        tags: ["diagnostic-lead"],
        newsletter_opt_in: newsletterOptIn,
      })
      .select("id")
      .single();

    if (contactError) {
      console.error("diagnostic: contacts insert failed", contactError);
    } else {
      contactId = contactRow.id;
    }

    const { error: resultError } = await supabase.from("diagnostic_results").insert({
      contact_id: contactId,
      email,
      name: name || null,
      company: company || null,
      answers,
      score,
      tier: tier.id,
    });

    if (resultError) {
      console.error("diagnostic: diagnostic_results insert failed", resultError);
      return NextResponse.json({ ok: false, error: "We couldn't save your results. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("diagnostic: supabase client error", err);
    return NextResponse.json({ ok: false, error: "We couldn't save your results. Please try again." }, { status: 500 });
  }

  try {
    const resend = getResend();
    const fromEmail = process.env.FROM_EMAIL!;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your systems check results: ${tier.label} (${score}/${MAX_SCORE})`,
      text: `Hi ${name || "there"},

Here's your free systems check report.

SCORE: ${score} / ${MAX_SCORE} — ${tier.label}

${tier.summary}

${tier.recommendation}

Want a hand fixing it? Book a systems audit: ${siteUrl}/#cta

Talk soon,
Carla

—
Don't want these emails? Unsubscribe: ${unsubscribeUrl}`,
    });

    if (emailResult.error) {
      console.error("diagnostic: resend send failed", emailResult.error);
    }
  } catch (err) {
    console.error("diagnostic: resend client error", err);
    // The result is already saved, so treat this as a soft failure.
  }

  return NextResponse.json({ ok: true, score, tierId: tier.id });
}
