import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/resend";
import { isNewsletterSegment, resolveSegmentRecipients, type Recipient } from "@/lib/newsletter";
import { wrapNewsletterHtml, htmlToPlainText } from "@/lib/newsletterEmail";

const CHUNK_SIZE = 10;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { subject?: unknown; content?: unknown; segment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const segment = typeof body.segment === "string" ? body.segment : "";

  if (!subject || !content) {
    return NextResponse.json({ ok: false, error: "Subject and body are required." }, { status: 400 });
  }
  if (!isNewsletterSegment(segment)) {
    return NextResponse.json({ ok: false, error: "Invalid segment." }, { status: 400 });
  }

  const recipients = await resolveSegmentRecipients(segment);
  if (recipients.length === 0) {
    return NextResponse.json({ ok: false, error: "No subscribed recipients in that list." }, { status: 400 });
  }

  const siteUrl = new URL("/", req.url).toString().replace(/\/$/, "");
  const resend = getResend();
  const fromEmail = process.env.FROM_EMAIL!;
  const plainText = htmlToPlainText(content);

  let sentCount = 0;
  for (const batch of chunk(recipients, CHUNK_SIZE)) {
    const results = await Promise.allSettled(
      batch.map((r: Recipient) => {
        const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(r.email)}`;
        return resend.emails.send({
          from: fromEmail,
          to: r.email,
          subject,
          html: wrapNewsletterHtml(content, unsubscribeUrl),
          text: `${plainText}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
        });
      })
    );
    sentCount += results.filter((r) => r.status === "fulfilled" && !r.value.error).length;
  }

  const admin = getSupabaseAdmin();
  const { error: insertError } = await admin.from("newsletters").insert({
    subject,
    body: content,
    segment,
    sent_at: new Date().toISOString(),
    recipient_count: sentCount,
  });

  if (insertError) {
    console.error("newsletter send: failed to record history", insertError);
  }

  return NextResponse.json({ ok: true, sentCount, totalRecipients: recipients.length });
}
