import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
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
