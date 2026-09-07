import { getResend } from "./resend";

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export async function addContactToAudience({ email, name }: { email: string; name?: string }) {
  if (!AUDIENCE_ID) return;

  const resend = getResend();
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || undefined;

  try {
    const result = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      firstName,
      lastName,
      unsubscribed: false,
    });
    if (result.error) {
      console.error("resend audience add failed", result.error);
    }
  } catch (err) {
    console.error("resend audience add error", err);
  }
}

export async function markUnsubscribedInAudience(email: string) {
  if (!AUDIENCE_ID) return;

  const resend = getResend();
  try {
    const result = await resend.contacts.update({ audienceId: AUDIENCE_ID, email, unsubscribed: true });
    if (result.error) {
      console.error("resend audience unsubscribe failed", result.error);
    }
  } catch (err) {
    console.error("resend audience unsubscribe error", err);
  }
}
