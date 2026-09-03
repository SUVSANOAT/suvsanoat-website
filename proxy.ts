import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

/* ==================================================================
 * ЗАЩИТА РАЗДЕЛА «ИНЖИНИРИНГ»
 *
 * Без входа: страницы результата (хозбыт и производственный) и
 * маршрут ИИ-записки. Ввод исходных данных открыт для всех — человек
 * видит, что получит, и только на результате встречает вход.
 * Админка — только роль admin.
 * ================================================================== */

export const config = {
  matcher: [
    "/engineering/analysis/result/:path*",
    "/engineering/analysis/complete/:path*",
    "/engineering/analysis/pro-result/:path*",
    "/engineering/admin/:path*",
    "/api/engineering-note",
    "/api/admin/:path*",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isApi = pathname.startsWith("/api/");
  const needAdmin = pathname.startsWith("/engineering/admin") || pathname.startsWith("/api/admin");

  if (!session || (needAdmin && session.r !== "admin")) {
    if (isApi) {
      return NextResponse.json({ ok: false, error: session ? "forbidden" : "unauthorized" }, { status: session ? 403 : 401 });
    }
    const login = new URL("/engineering/login", request.url);
    login.searchParams.set("next", pathname + search);
    if (session) login.searchParams.set("admin", "1");
    return NextResponse.redirect(login);
  }

  const res = NextResponse.next();
  res.headers.set("x-sv-user", encodeURIComponent(session.u));
  return res;
}
