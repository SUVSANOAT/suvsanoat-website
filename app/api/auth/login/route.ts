export const dynamic = "force-dynamic";

/**
 * Вход: POST { login, password } → cookie сессии.
 * Встроенный администратор — из ADMIN_LOGIN / ADMIN_PASSWORD;
 * остальные — из таблицы users (Neon).
 */

import { dbUrl, findUserForLogin, normalizeLogin, touchLogin, verifyPassword } from "../../../../lib/auth";
import { sessionCookie, signSession } from "../../../../lib/session";

const hits = new Map<string, number[]>();
function allowed(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= 10) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) return Response.json({ ok: false, error: "Слишком много попыток. Подождите минуту." }, { status: 429 });

  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const login = normalizeLogin(body.login ?? "");
  const password = body.password ?? "";
  if (!login || !password) return Response.json({ ok: false, error: "Введите логин и пароль." }, { status: 400 });

  /* встроенный администратор */
  const adminLogin = process.env.ADMIN_LOGIN ? normalizeLogin(process.env.ADMIN_LOGIN) : "";
  if (adminLogin && login === adminLogin && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    const token = await signSession({ u: login, r: "admin", n: "Администратор" });
    return Response.json({ ok: true, role: "admin" }, { headers: { "set-cookie": sessionCookie(token) } });
  }

  if (!dbUrl()) {
    return Response.json({ ok: false, error: "База пользователей не подключена." }, { status: 500 });
  }

  try {
    const user = await findUserForLogin(login);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ ok: false, error: "Неверный логин или пароль." }, { status: 401 });
    }
    if (!user.active) {
      return Response.json({ ok: false, error: "Доступ приостановлен. Свяжитесь с SUVSANOAT." }, { status: 403 });
    }
    await touchLogin(user.id);
    const token = await signSession({ u: user.login, r: "user", n: user.name || user.login });
    return Response.json({ ok: true, role: "user" }, { headers: { "set-cookie": sessionCookie(token) } });
  } catch (e) {
    console.error("login:", e);
    return Response.json({ ok: false, error: "Ошибка базы данных." }, { status: 500 });
  }
}
