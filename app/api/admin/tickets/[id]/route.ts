import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { COLUMN_STATUSES, BILLING_STATUSES } from "@/lib/tickets";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: {
    title?: unknown;
    description?: unknown;
    columnStatus?: unknown;
    billingStatus?: unknown;
    isMilestone?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim();
  if (typeof body.description === "string") update.description = body.description.trim() || null;

  if (typeof body.columnStatus === "string") {
    if (!COLUMN_STATUSES.includes(body.columnStatus as (typeof COLUMN_STATUSES)[number])) {
      return NextResponse.json({ ok: false, error: "Invalid column status." }, { status: 400 });
    }
    update.column_status = body.columnStatus;
  }

  if (typeof body.billingStatus === "string") {
    if (!BILLING_STATUSES.includes(body.billingStatus as (typeof BILLING_STATUSES)[number])) {
      return NextResponse.json({ ok: false, error: "Invalid billing status." }, { status: 400 });
    }
    update.billing_status = body.billingStatus;
  }

  if (typeof body.isMilestone === "boolean") {
    update.is_milestone = body.isMilestone;
    if (body.isMilestone) {
      const { data: existing } = await admin.from("tickets").select("published_at").eq("id", params.id).single();
      if (!existing?.published_at) {
        update.published_at = new Date().toISOString();
      }
    } else {
      update.published_at = null;
    }
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await admin.from("tickets").update(update).eq("id", params.id);

  if (error) {
    console.error("admin tickets update failed", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("tickets").delete().eq("id", params.id);

  if (error) {
    console.error("admin tickets delete failed", error);
    return NextResponse.json({ ok: false, error: "Failed to delete the ticket." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
