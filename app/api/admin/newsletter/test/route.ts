import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getResend } from "@/lib/resend";
import { wrapNewsletterHtml, htmlToPlainText } from "@/lib/newsletterEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { subject?: unknown; content?: unknown; testEmail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const testEmail = typeof body.testEmail === "string" ? body.testEmail.trim() : "";

  if (!subject || !content) {
    return NextResponse.json({ ok: false, error: "Subject and body are required." }, { status: 400 });
  }
  if (!testEmail || !EMAIL_RE.test(testEmail)) {
    return NextResponse.json({ ok: false, error: "Enter a valid test email address." }, { status: 400 });
  }

  try {
    const resend = getResend();
    const siteUrl = new URL("/", req.url).toString().replace(/\/$/, "");
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(testEmail)}`;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html: wrapNewsletterHtml(content, unsubscribeUrl),
      text: `${htmlToPlainText(content)}\n\n---\nThis is a test send — real recipients would also see an unsubscribe link here.`,
    });

    if (result.error) {
      console.error("newsletter test send failed", result.error);
      return NextResponse.json({ ok: false, error: "Failed to send the test email." }, { status: 500 });
    }
  } catch (err) {
    console.error("newsletter test send error", err);
    return NextResponse.json({ ok: false, error: "Failed to send the test email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
