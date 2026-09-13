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

import { brandDaysLeft, brandExpired, getBrand, getBrandByHost, userBrandSlug, type Brand } from "../../../lib/brands";
import { dbUrl } from "../../../lib/auth";
import { sessionFromRequest } from "../../../lib/session";

/* Открытый маршрут вызывается с витрины, то есть любым посетителем.
   Ходить за этим в базу на каждый просмотр незачем и небезопасно:
   бренд домена меняется раз в месяцы. Держим ответ в памяти минуту —
   этого хватает, чтобы поток посетителей не доходил до базы, и
   правка бренда в админке становится видна почти сразу. */
const HOST_CACHE_MS = 60_000;
const hostCache = new Map<string, { at: number; brand: Brand }>();

async function hostBrandCached(host: string | null): Promise<Brand> {
  const key = (host ?? "").trim().toLowerCase();
  const hit = hostCache.get(key);
  if (hit && Date.now() - hit.at < HOST_CACHE_MS) return hit.brand;
  const brand = (dbUrl() ? await getBrandByHost(key) : null) ?? (await getBrand(null));
  hostCache.set(key, { at: Date.now(), brand });
  return brand;
}

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
      const brand = await hostBrandCached(request.headers.get("host"));
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
      return Response.json({
        ok: true,
        brand: { ...brand, active_until: null, daysLeft: null, expired: false },
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
