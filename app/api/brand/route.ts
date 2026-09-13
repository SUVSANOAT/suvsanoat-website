/**
 * БРЕНД ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ИЛИ АДРЕСА.
 *
 *   GET → { ok, brand: { slug, title, subtitle, logo_url, accent,
 *                        contact, active_until, daysLeft, login } }
 *
 * Шапка раздела спрашивает у сервера, под чьим знаком показывать
 * страницу. У вошедшего бренд определяется по логину, а не по адресу:
 * адрес можно переслать, cookie — подписан.
 *
 * Без входа маршрут тоже отвечает — по адресу и только оформлением
 * (без логина и срока доступа): витрина и страница входа открываются
 * до входа, а знак на них должен стоять того, чей это адрес.
 *
 * Если бренд просрочен, раздел отдавать нельзя: маршрут говорит об
 * этом прямо, а закрывает доступ proxy.ts.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { brandDaysLeft, brandExpired, getBrand, getBrandByHost, getBrandByHostCached, userBrandSlug } from "../../../lib/brands";
import { dbUrl } from "../../../lib/auth";
import { sessionFromRequest } from "../../../lib/session";

export async function GET(request: Request) {
  const session = await sessionFromRequest(request);

  /* ---------------- без входа ----------------
     Витрина раздела и страница входа открываются до входа, и знак на
     них должен стоять того, чей это адрес. Поэтому маршрут отвечает и
     анонимно — но отдаёт только оформление: имя, подпись, логотип,
     цвет. Ни логина, ни срока доступа: это сведения о договоре, а не
     о бланке, и на открытой странице им делать нечего. */
  if (!session) {
    try {
      const brand = (dbUrl() ? await getBrandByHostCached(request.headers.get("host")) : null) ?? (await getBrand(null));
      return Response.json({
        ok: true,
        brand: {
          slug: brand.slug,
          title: brand.title,
          subtitle: brand.subtitle,
          logo_url: brand.logo_url,
          accent: brand.accent,
          contact: brand.contact,
          active_until: null,
          daysLeft: null,
          expired: false,
        },
      });
    } catch (e) {
      console.error("brand GET (anon):", e);
      const brand = await getBrand(null);
      const { note: _note, host: _host, ...open } = brand;
      return Response.json({
        ok: true,
        brand: { ...open, active_until: null, daysLeft: null, expired: false },
      });
    }
  }

  try {
    /* Сначала бренд вошедшего: он главнее домена. Человек может зайти
       под своим логином и на общий адрес — и должен увидеть своё.
       Если у пользователя бренда нет, берётся бренд домена: на
       отдельном сайте это его знак. */
    const slug = dbUrl() ? await userBrandSlug(session.u) : null;
    const byHost = slug ? null : await getBrandByHost(request.headers.get("host"));
    const brand = byHost ?? (await getBrand(slug));
    /* Поля перечислены поимённо, а не «всё, что есть». В записи о
       бренде лежит и служебная заметка о договоре — её видеть
       пользователю незачем, а при «...brand» она уезжала в браузер
       вместе с оформлением. */
    return Response.json({
      ok: true,
      brand: {
        slug: brand.slug,
        title: brand.title,
        subtitle: brand.subtitle,
        logo_url: brand.logo_url,
        accent: brand.accent,
        contact: brand.contact,
        active_until: brand.active_until,
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
    const { note: _note, host: _host, ...open } = brand;
    return Response.json({ ok: true, brand: { ...open, daysLeft: null, expired: false, login: session.u } });
  }
}
