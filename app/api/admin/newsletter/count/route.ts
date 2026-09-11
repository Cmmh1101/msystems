import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { isNewsletterSegment, resolveSegmentRecipients } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const segment = req.nextUrl.searchParams.get("segment") || "";
  if (!isNewsletterSegment(segment)) {
    return NextResponse.json({ ok: false, error: "Invalid segment." }, { status: 400 });
  }

  const recipients = await resolveSegmentRecipients(segment);
  return NextResponse.json({ ok: true, count: recipients.length });
}
