/**
 * БРЕНД ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ.
 *
 *   GET → { ok, brand: { slug, title, subtitle, logo_url, accent,
 *                        contact, active_until, daysLeft, login } }
 *
 * Шапка раздела спрашивает у сервера, под чьим знаком показывать
 * страницу. Бренд определяется по вошедшему, а не по адресу: адрес
 * можно переслать, cookie — подписан.
 *
 * Если бренд просрочен, раздел отдавать нельзя: маршрут говорит об
 * этом прямо, а закрывает доступ proxy.ts.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { brandDaysLeft, brandExpired, getBrand, getBrandByHost, userBrandSlug } from "../../../lib/brands";
import { dbUrl } from "../../../lib/auth";
import { sessionFromRequest } from "../../../lib/session";

export async function GET(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход." }, { status: 401 });

  try {
    /* Сначала бренд вошедшего: он главнее домена. Человек может зайти
       под своим логином и на общий адрес — и должен увидеть своё.
       Если у пользователя бренда нет, берётся бренд домена: на
       отдельном сайте это его знак. */
    const slug = dbUrl() ? await userBrandSlug(session.u) : null;
    const byHost = slug ? null : await getBrandByHost(request.headers.get("host"));
    const brand = byHost ?? (await getBrand(slug));
    return Response.json({
      ok: true,
      brand: {
        ...brand,
        daysLeft: brandDaysLeft(brand),
        expired: brandExpired(brand),
        login: session.u,
      },
    });
  } catch (e) {
    console.error("brand GET:", e);
    /* Бренд — оформление, а не расчёт: если база недоступна, раздел
       обязан работать, просто под своим знаком. */
    const brand = await getBrand(null);
    return Response.json({ ok: true, brand: { ...brand, daysLeft: null, expired: false, login: session.u } });
  }
}
