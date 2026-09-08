import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook: signature verification failed", err);
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketId = session.metadata?.ticket_id;

    if (ticketId) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from("tickets")
        .update({
          billing_status: "paid",
          column_status: "to_do",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) {
        console.error("stripe webhook: failed to update ticket", ticketId, error);
        return NextResponse.json({ ok: false, error: "Failed to update ticket." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
