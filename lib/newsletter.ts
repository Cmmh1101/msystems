import { getSupabaseAdmin } from "./supabaseAdmin";

export const NEWSLETTER_SEGMENTS = ["all", "clients", "newsletter", "diagnostic"] as const;
export type NewsletterSegment = (typeof NEWSLETTER_SEGMENTS)[number];

export const NEWSLETTER_SEGMENT_LABELS: Record<NewsletterSegment, string> = {
  all: "All lists",
  clients: "Clients",
  newsletter: "Newsletter",
  diagnostic: "Diagnostic",
};

export interface Newsletter {
  id: string;
  created_at: string;
  subject: string;
  body: string;
  segment: string;
  sent_at: string | null;
  recipient_count: number;
}

export interface Recipient {
  email: string;
  name: string;
}

export function isNewsletterSegment(value: string): value is NewsletterSegment {
  return (NEWSLETTER_SEGMENTS as readonly string[]).includes(value);
}

export async function resolveSegmentRecipients(segment: NewsletterSegment): Promise<Recipient[]> {
  const admin = getSupabaseAdmin();

  if (segment === "clients") {
    const { data } = await admin.from("clients").select("email,name").eq("subscribed", true);
    return (data as Recipient[]) ?? [];
  }

  if (segment === "newsletter") {
    const { data } = await admin.from("contacts").select("email,name").eq("source", "newsletter").eq("subscribed", true);
    return (data as Recipient[]) ?? [];
  }

  if (segment === "diagnostic") {
    const { data } = await admin.from("contacts").select("email,name").eq("source", "diagnostic").eq("subscribed", true);
    return (data as Recipient[]) ?? [];
  }

  // "all": union of every client and every contact, subscribed only, de-duplicated by email.
  const [{ data: clients }, { data: contacts }] = await Promise.all([
    admin.from("clients").select("email,name").eq("subscribed", true),
    admin.from("contacts").select("email,name").eq("subscribed", true),
  ]);

  const byEmail = new Map<string, Recipient>();
  for (const c of (clients as Recipient[]) ?? []) byEmail.set(c.email, c);
  for (const c of (contacts as Recipient[]) ?? []) if (!byEmail.has(c.email)) byEmail.set(c.email, c);
  return [...byEmail.values()];
}
