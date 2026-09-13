/* ==================================================================
 * БРЕНДЫ РАЗДЕЛА «ИНЖИНИРИНГ» — база Neon (Postgres)
 *
 * Раздел продаётся по доступу одному проектировщику, и он должен
 * видеть его под своим логотипом. Это НЕ копия раздела.
 *
 * ПОЧЕМУ НЕ КОПИЯ
 *
 * Скопировать страницы под второй логотип — самый быстрый способ и
 * самая дорогая ошибка. Через месяц в одной копии исправлена ошибка
 * расчёта, в другой нет; через три — это два разных продукта, и
 * каждая правка делается дважды. Поэтому код один, а меняется только
 * оформление: логотип, название, цвет, подпись в штампе чертежей и в
 * шапке отчётов. Берётся всё это отсюда, по бренду пользователя.
 *
 * СРОК ДОСТУПА
 *
 * У бренда есть дата окончания. Истёк срок — вход перестаёт пускать
 * сам, без ручного вмешательства. Продление — правка одной даты.
 * Доступ, который нельзя отозвать, проданным доступом не является.
 *
 * Только для серверных маршрутов.
 * ================================================================== */

import { neon } from "@neondatabase/serverless";

import { dbUrl } from "./auth";

/** бренд по умолчанию — свой; существует всегда, из базы не удаляется */
export const HOME_BRAND: Brand = {
  slug: "suvsanoat",
  host: "",
  title: "SUVSANOAT",
  subtitle: "Проектирование и производство очистного оборудования",
  logo_url: "/logo.png",
  og_image: "/og-image.jpg",
  accent: "#5fb6c9",
  contact: "Ташкент, suvsanoat.uz",
  active_until: null,
  note: "",
};

export type Brand = {
  slug: string;
  /**
   * Домен, на котором этот бренд показывается всем — ещё до входа.
   * Нужен для отдельной сборки «только инжиниринг» на своём адресе:
   * человек открывает kl.suvsanoat.uz и сразу видит свой знак, а не
   * чужой. Пусто — бренд определяется только по вошедшему.
   */
  host: string;
  /** название в шапке страницы, в штампе чертежа и в шапке отчёта */
  title: string;
  subtitle: string;
  /** адрес файла логотипа в /public или полный URL */
  logo_url: string;
  /**
   * Картинка для предпросмотра ссылки в мессенджерах, 1200×630.
   * Логотип для неё не годится: мессенджер ждёт широкое изображение и
   * узкий знак либо обрежет, либо положит на своё поле. Пусто —
   * предпросмотр берётся наш, и на чужом адресе в Telegram появится
   * наша картинка вместо его.
   */
  og_image: string;
  accent: string;
  contact: string;
  /** дата окончания доступа; null — бессрочно (свой бренд) */
  active_until: string | null;
  note: string;
};

function db() {
  const url = dbUrl();
  if (!url) throw new Error("Строка подключения к базе не найдена (DATABASE_URL / POSTGRES_URL)");
  return neon(url);
}

let ready: Promise<void> | null = null;

export function ensureBrandsSchema(): Promise<void> {
  if (!ready) {
    const sql = db();
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS brands (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        subtitle TEXT NOT NULL DEFAULT '',
        logo_url TEXT NOT NULL DEFAULT '',
        og_image TEXT NOT NULL DEFAULT '',
        accent TEXT NOT NULL DEFAULT '#5fb6c9',
        contact TEXT NOT NULL DEFAULT '',
        host TEXT NOT NULL DEFAULT '',
        active_until DATE,
        note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      /* Привязка пользователя к бренду. Колонка добавляется к готовой
         таблице users: она уже живёт в рабочей базе, и пересоздавать её
         нельзя. */
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_slug TEXT`;
      /* колонка домена добавляется отдельно: таблица брендов могла быть
         создана раньше, до появления второго сайта */
      await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS host TEXT NOT NULL DEFAULT ''`;
      /* Столбец появился позже таблицы: на работающей базе CREATE TABLE
         уже не выполнится, а колонку добавить надо. */
      await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS og_image TEXT NOT NULL DEFAULT ''`;
      await sql`CREATE INDEX IF NOT EXISTS brands_host_idx ON brands (host)`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}


export async function listBrands(): Promise<Brand[]> {
  await ensureBrandsSchema();
  const sql = db();
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, og_image, accent, contact, host, active_until, note
    FROM brands ORDER BY created_at`) as Brand[];
  return [HOME_BRAND, ...rows.filter((b) => b.slug !== HOME_BRAND.slug)];
}

export async function getBrand(slug: string | null | undefined): Promise<Brand> {
  if (!slug || slug === HOME_BRAND.slug) return HOME_BRAND;
  await ensureBrandsSchema();
  const sql = db();
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, og_image, accent, contact, host, active_until, note
    FROM brands WHERE slug = ${slug} LIMIT 1`) as Brand[];
  return rows[0] ?? HOME_BRAND;
}

export async function saveBrand(b: Brand): Promise<Brand> {
  await ensureBrandsSchema();
  const sql = db();
  const slug = b.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  if (!slug || slug === HOME_BRAND.slug) throw new Error("Недопустимый идентификатор бренда.");
  const rows = (await sql`INSERT INTO brands (slug, title, subtitle, logo_url, og_image, accent, contact, host, active_until, note)
    VALUES (${slug}, ${b.title.slice(0, 120)}, ${b.subtitle.slice(0, 200)}, ${b.logo_url.slice(0, 300)}, ${(b.og_image ?? "").slice(0, 300)},
            ${b.accent.slice(0, 16)}, ${b.contact.slice(0, 200)}, ${normalizeHost(b.host)}, ${b.active_until}, ${b.note.slice(0, 400)})
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, logo_url = EXCLUDED.logo_url, og_image = EXCLUDED.og_image,
      accent = EXCLUDED.accent, contact = EXCLUDED.contact, host = EXCLUDED.host, active_until = EXCLUDED.active_until,
      note = EXCLUDED.note
    RETURNING slug, title, subtitle, logo_url, og_image, accent, contact, host, active_until, note`) as Brand[];
  return rows[0];
}

/** Домен без порта, регистра и «www.» — сравнивать надо одинаково. */
export function normalizeHost(host: string | null | undefined): string {
  return String(host ?? "").trim().toLowerCase().split(":")[0].replace(/^www\./, "");
}

/**
 * Бренд по домену запроса. Нужен до входа: на отдельном сайте
 * проектировщика его знак должен стоять и на странице входа.
 */
export async function getBrandByHost(host: string | null | undefined): Promise<Brand | null> {
  const h = normalizeHost(host);
  if (!h) return null;
  await ensureBrandsSchema();
  const sql = db();
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, og_image, accent, contact, host, active_until, note
    FROM brands WHERE host = ${h} LIMIT 1`) as Brand[];
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------
 * ТОТ ЖЕ ЗАПРОС, НО БЕЗ ПОХОДА В БАЗУ НА КАЖДЫЙ ЗАХОД
 *
 * Бренд домена спрашивают на открытых страницах — на витрине и на
 * входе, то есть любым посетителем. Меняется он раз в месяцы, а
 * заходов много, и база одна на весь сайт. Держим ответ в памяти
 * минуту: посетители до базы не доходят, а правка в админке видна
 * почти сразу.
 *
 * Память своя у каждого работающего экземпляра — это не общий кэш и
 * не замена ему; задача здесь только одна: не превращать просмотр
 * страницы в запрос к базе.
 * ------------------------------------------------------------------ */
const HOST_CACHE_MS = 60_000;
const hostCache = new Map<string, { at: number; brand: Brand | null }>();

export async function getBrandByHostCached(host: string | null | undefined): Promise<Brand | null> {
  const key = normalizeHost(host);
  if (!key) return null;
  const hit = hostCache.get(key);
  if (hit && Date.now() - hit.at < HOST_CACHE_MS) return hit.brand;
  const brand = await getBrandByHost(key);
  hostCache.set(key, { at: Date.now(), brand });
  return brand;
}

export async function setUserBrand(login: string, slug: string | null): Promise<void> {
  await ensureBrandsSchema();
  const sql = db();
  await sql`UPDATE users SET brand_slug = ${slug} WHERE login = ${login}`;
}

export async function userBrandSlug(login: string): Promise<string | null> {
  await ensureBrandsSchema();
  const sql = db();
  const rows = (await sql`SELECT brand_slug FROM users WHERE login = ${login} LIMIT 1`) as { brand_slug: string | null }[];
  return rows[0]?.brand_slug ?? null;
}

/**
 * Срок доступа. Проверяется при входе и при каждом обращении к
 * защищённым маршрутам: истёкший бренд не пускает сам, без ручного
 * отключения пользователя.
 */
export function brandExpired(b: Brand, now = new Date()): boolean {
  if (!b.active_until) return false;
  const until = new Date(b.active_until + "T23:59:59Z");
  return until.getTime() < now.getTime();
}

export function brandDaysLeft(b: Brand, now = new Date()): number | null {
  if (!b.active_until) return null;
  const until = new Date(b.active_until + "T23:59:59Z");
  return Math.ceil((until.getTime() - now.getTime()) / 86400000);
}

