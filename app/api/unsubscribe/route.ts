import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { markUnsubscribedInAudience } from "@/lib/resendAudience";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function page(title: string, message: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:system-ui,sans-serif;background:#F5F3EE;color:#1C2530;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;text-align:center;}
  .card{max-width:420px;}
  h1{font-size:22px;margin-bottom:12px;}
  p{color:#4A5568;line-height:1.6;}
  a{color:#B8935A;}
</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim() || "";

  if (!email || !EMAIL_RE.test(email)) {
    return new NextResponse(page("Invalid request", "That unsubscribe link is missing a valid email address."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contacts").update({ subscribed: false }).eq("email", email);

    if (error) {
      console.error("unsubscribe: update failed", error);
      return new NextResponse(page("Something went wrong", "Please try again in a moment, or email us directly."), {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    await markUnsubscribedInAudience(email);
  } catch (err) {
    console.error("unsubscribe: supabase client error", err);
    return new NextResponse(page("Something went wrong", "Please try again in a moment, or email us directly."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new NextResponse(
    page("You're unsubscribed", `${email} won't receive any more emails from us. Sorry to see you go.`),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
