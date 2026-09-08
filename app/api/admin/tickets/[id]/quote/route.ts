import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { amount?: unknown; description?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const amount = typeof body.amount === "number" ? body.amount : NaN;
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: ticket, error: fetchError } = await admin
    .from("tickets")
    .select("id,project_id,title")
    .eq("id", params.id)
    .single();

  if (fetchError || !ticket) {
    return NextResponse.json({ ok: false, error: "Ticket not found." }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: description || ticket.title },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/portal/projects/${ticket.project_id}?payment=success`,
      cancel_url: `${siteUrl}/portal/projects/${ticket.project_id}?payment=cancelled`,
      metadata: { ticket_id: ticket.id },
    });

    const { error: updateError } = await admin
      .from("tickets")
      .update({
        billing_status: "quoted",
        stripe_payment_link: session.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    if (updateError) {
      console.error("admin tickets quote: failed to save payment link", updateError);
      return NextResponse.json({ ok: false, error: "Quote created but failed to save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("admin tickets quote: stripe error", err);
    return NextResponse.json({ ok: false, error: "Failed to create the Stripe payment link." }, { status: 500 });
  }
}
