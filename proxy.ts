import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

/* ==================================================================
 * ДВЕ ЗАДАЧИ ОДНОГО ПОСРЕДНИКА
 *
 * 1. ЗАЩИТА РАЗДЕЛА «ИНЖИНИРИНГ». Раздел продан по доступу и закрыт
 *    целиком: расчётные страницы и маршруты выдачи документов требуют
 *    входа. Логины выдаёт владелец вручную — самостоятельной
 *    регистрации нет. Открытыми остаются витрина /engineering и
 *    страница входа: через них приходят заявки, и закрыв их, раздел
 *    перестанет продаваться.
 *
 * 2. РЕЖИМ «ТОЛЬКО ИНЖИНИРИНГ». Включается двумя способами:
 *    SITE_MODE=engineering — для всей сборки (отдельный проект), либо
 *    ENGINEERING_HOSTS=адрес1,адрес2 — для перечисленных доменов той
 *    же сборки. Второй способ проще: один проект, один домен, одна
 *    переменная — и на этом домене корень и все посторонние страницы
 *    уводятся на /engineering. Каталог, производство и маркетинг туда
 *    не попадают.
 *
 *    Это ОДИН код и ОДИН репозиторий, просто две сборки с разными
 *    переменными. Копировать раздел во второй проект нельзя: копии
 *    расходятся, и через месяц исправленная ошибка расчёта живёт
 *    только в одной из них.
 *
 *    Такая сборка закрыта и от поисковиков: приватный инструмент в
 *    выдаче не нужен.
 * ================================================================== */

/** пути, требующие входа (в любом режиме) */
const PROTECTED = [
  "/engineering/analysis",
  "/engineering/admin",
  "/api/engineering-note",
  "/api/admin",
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
];

/** что в режиме «только инжиниринг» остаётся доступным как есть */
const ENGINEERING_ALLOWED = ["/engineering", "/api", "/brands", "/logo", "/robots.txt", "/favicon"];

export const config = {
  /* всё, кроме статики сборки и файлов с расширением: посредник должен
     видеть и корень сайта, иначе в режиме одного раздела его нечем
     перехватить */
  matcher: ["/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]{2,5}$).*)"],
};

/** домен запроса без порта и регистра */
function hostOf(request: NextRequest): string {
  return (request.headers.get("host") ?? "").trim().toLowerCase().split(":")[0];
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hosts = (process.env.ENGINEERING_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  const engineeringOnly = process.env.SITE_MODE === "engineering" || hosts.includes(hostOf(request));

  /* ---------------- режим одного раздела ---------------- */
  if (engineeringOnly && !ENGINEERING_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/engineering", request.url));
  }

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) {
    const pass = NextResponse.next();
    if (engineeringOnly) pass.headers.set("X-Robots-Tag", "noindex, nofollow");
    return pass;
  }

  /* ---------------- вход ---------------- */
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
  if (engineeringOnly) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
