import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

/* ==================================================================
 * ЗАЩИТА РАЗДЕЛА «ИНЖИНИРИНГ»
 *
 * Раздел продан по доступу и закрыт целиком: все расчётные страницы и
 * все маршруты выдачи документов требуют входа. Логины и пароли
 * выдаёт владелец вручную — самостоятельной регистрации нет.
 *
 * ЧТО ОСТАЁТСЯ ОТКРЫТЫМ И ПОЧЕМУ
 *
 * Витрина /engineering и страница входа. Через витрину приходят
 * заявки на доступ; закрыв и её, раздел перестанет продаваться —
 * человек не увидит, за что платит, и не оставит заявку.
 *
 * Админка — только роль admin.
 * ================================================================== */

export const config = {
  matcher: [
    /* весь расчётный раздел */
    "/engineering/analysis/:path*",
    "/engineering/admin/:path*",
    /* маршруты выдачи документов и хранения расчётов */
    "/api/engineering-note",
    "/api/admin/:path*",
    "/api/water-report",
    "/api/main-report",
    "/api/vedomost-xlsx",
    "/api/water-dxf",
    "/api/water-projects",
    "/api/network-dxf",
    "/api/network-xlsx",
    "/api/spec-xlsx",
    "/api/drawings",
    "/api/brand",
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
