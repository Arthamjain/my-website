import { NextResponse, type NextRequest } from "next/server";

const base = () => `/${(process.env.ADMIN_PATH || "studio").replace(/^\/+|\/+$/g, "")}`;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const admin = base();

  // The admin panel only exists at its private address; /admin itself is hidden.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/__not-found", req.url));
  }

  if (pathname === admin || pathname.startsWith(`${admin}/`)) {
    const rest = pathname.slice(admin.length) || "";
    // Optimistic check only; every admin page and action verifies the signed session itself.
    if (rest !== "/login" && !req.cookies.has("kaya_admin")) {
      return NextResponse.redirect(new URL(`${admin}/login`, req.url));
    }
    const url = req.nextUrl.clone();
    url.pathname = `/admin${rest}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Anonymous visit id for store analytics (no personal data).
  const res = NextResponse.next();
  if (!req.cookies.has("kaya_sid")) {
    res.cookies.set("kaya_sid", crypto.randomUUID(), { path: "/", maxAge: 60 * 30, sameSite: "lax", httpOnly: true });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon|icon|api/media).*)"],
};
