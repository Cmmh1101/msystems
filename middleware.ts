import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // Batched getAll/setAll (not the older per-cookie get/set/remove trio) so every
  // cookie a single getUser() call touches lands on the SAME response object —
  // the per-cookie form previously reassigned `response` to a fresh NextResponse
  // on every individual set/remove call, silently discarding any earlier writes
  // from that same call (e.g. a chunked auth-token cookie, or a PKCE verifier
  // cookie a page's own client-side code had just set moments before).
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const isAdminUser = !!user && user.email === process.env.ADMIN_EMAIL;
    const isLoginPage = pathname === "/admin/login";

    if (!isAdminUser && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAdminUser && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/contacts", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/portal")) {
    const isLoginPage = pathname === "/portal/login";
    const isAuthCallback = pathname.startsWith("/portal/auth/callback");

    // The callback route is what establishes the session in the first place —
    // there's no user yet when middleware runs for that request.
    if (isAuthCallback) return response;

    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    if (user && isLoginPage) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
