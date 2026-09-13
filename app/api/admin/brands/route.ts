/**
 * БРЕНДЫ РАЗДЕЛА — УПРАВЛЕНИЕ (только администратор).
 *
 *   GET    → список брендов
 *   POST   { slug, title, subtitle, logo_url, og_image, full_name, accent, contact, host,
 *            active_until, note, login? } → создать или изменить;
 *            если передан login — привязать этого пользователя к бренду
 *   DELETE ?login=...  → отвязать пользователя от бренда
 *
 * Доступ ограничивает proxy.ts: маршруты /api/admin/* требуют роли
 * admin. Здесь проверка повторяется — маршрут не должен зависеть от
 * того, что кто-то не забыл строку в матчере.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listBrands, saveBrand, setUserBrand, type Brand } from "../../../../lib/brands";
import { sessionFromRequest } from "../../../../lib/session";

function str(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function GET(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session || session.r !== "admin") {
    return Response.json({ ok: false, error: "Только для администратора." }, { status: 403 });
  }
  try {
    return Response.json({ ok: true, brands: await listBrands() });
  } catch (e) {
    console.error("admin/brands GET:", e);
    return Response.json({ ok: false, error: "База не отвечает." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session || session.r !== "admin") {
    return Response.json({ ok: false, error: "Только для администратора." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Неверный формат запроса." }, { status: 400 });
  }

  const slug = str(body.slug, 40);
  const title = str(body.title, 120);
  if (!slug || !title) {
    return Response.json({ ok: false, error: "Нужны идентификатор и название бренда." }, { status: 400 });
  }

  /* Дата срока — либо корректная, либо её нет. Строку «когда-нибудь»
     база принять не может, а молча превращать её в «бессрочно» нельзя:
     доступ без срока — это не то, что имел в виду человек. */
  const until = str(body.active_until, 10);
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) {
    return Response.json({ ok: false, error: "Дата окончания доступа — в виде ГГГГ-ММ-ДД." }, { status: 400 });
  }

  const brand: Brand = {
    slug,
    title,
    subtitle: str(body.subtitle, 200),
    logo_url: str(body.logo_url, 300),
    og_image: str(body.og_image, 300),
    full_name: str(body.full_name, 400),
    accent: str(body.accent, 16) || "#5fb6c9",
    contact: str(body.contact, 200),
    host: str(body.host, 200),
    active_until: until || null,
    note: str(body.note, 400),
  };

  try {
    const saved = await saveBrand(brand);
    const login = str(body.login, 40).toLowerCase();
    if (login) await setUserBrand(login, saved.slug);
    return Response.json({ ok: true, brand: saved, linked: login || null });
  } catch (e) {
    console.error("admin/brands POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось сохранить бренд.";
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session || session.r !== "admin") {
    return Response.json({ ok: false, error: "Только для администратора." }, { status: 403 });
  }
  const login = str(new URL(request.url).searchParams.get("login"), 40).toLowerCase();
  if (!login) return Response.json({ ok: false, error: "Не указан логин." }, { status: 400 });
  try {
    await setUserBrand(login, null);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("admin/brands DELETE:", e);
    return Response.json({ ok: false, error: "Не удалось отвязать." }, { status: 500 });
  }
}
