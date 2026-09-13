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
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, accent, contact, host, active_until, note
    FROM brands ORDER BY created_at`) as Brand[];
  return [HOME_BRAND, ...rows.filter((b) => b.slug !== HOME_BRAND.slug)];
}

export async function getBrand(slug: string | null | undefined): Promise<Brand> {
  if (!slug || slug === HOME_BRAND.slug) return HOME_BRAND;
  await ensureBrandsSchema();
  const sql = db();
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, accent, contact, host, active_until, note
    FROM brands WHERE slug = ${slug} LIMIT 1`) as Brand[];
  return rows[0] ?? HOME_BRAND;
}

export async function saveBrand(b: Brand): Promise<Brand> {
  await ensureBrandsSchema();
  const sql = db();
  const slug = b.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  if (!slug || slug === HOME_BRAND.slug) throw new Error("Недопустимый идентификатор бренда.");
  const rows = (await sql`INSERT INTO brands (slug, title, subtitle, logo_url, accent, contact, host, active_until, note)
    VALUES (${slug}, ${b.title.slice(0, 120)}, ${b.subtitle.slice(0, 200)}, ${b.logo_url.slice(0, 300)},
            ${b.accent.slice(0, 16)}, ${b.contact.slice(0, 200)}, ${normalizeHost(b.host)}, ${b.active_until}, ${b.note.slice(0, 400)})
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, logo_url = EXCLUDED.logo_url,
      accent = EXCLUDED.accent, contact = EXCLUDED.contact, host = EXCLUDED.host, active_until = EXCLUDED.active_until,
      note = EXCLUDED.note
    RETURNING slug, title, subtitle, logo_url, accent, contact, host, active_until, note`) as Brand[];
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
  const rows = (await sql`SELECT slug, title, subtitle, logo_url, accent, contact, host, active_until, note
    FROM brands WHERE host = ${h} LIMIT 1`) as Brand[];
  return rows[0] ?? null;
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

