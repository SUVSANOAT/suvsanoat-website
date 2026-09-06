/**
 * КОМПЛЕКТ ЧЕРТЕЖЕЙ (DXF в ZIP).
 *
 *   POST → { input: DrawingInput, opts?: PackageOptions }
 *          Требуется вход в раздел «Инжиниринг».
 *          Заказ оплачен → ZIP (Content-Type: application/zip);
 *          не оплачен     → 402 и счёт-оферта в JSON.
 *   GET  → { ok, orders } — список заказов (только admin).
 *   PATCH→ { id, status } — отметить оплаченным (только admin).
 *
 * Маршрут серверный: генератор чертежей собирает бинарный ZIP
 * (Uint8Array), поэтому рантайм — Node.js, а не edge; ответ не
 * кэшируется. Значения сегментной конфигурации те же, что в соседних
 * маршрутах (dynamic, maxDuration), плюс runtime = "nodejs".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { buildPackage, type PackageOptions } from "../../../drawings/package/build";
import type { DrawingInput, SiteInput } from "../../../drawings/core/types";
import { dbUrl } from "../../../lib/auth";
import {
  invoiceFor,
  isPaid,
  listOrders,
  markIssued,
  orderFor,
  setOrderStatus,
  type OrderStatus,
} from "../../../lib/orders";
import { sessionFromRequest } from "../../../lib/session";

/** предел размера тела запроса: контур участка длинным не бывает */
const MAX_BODY_BYTES = 256 * 1024;
/** предел расхода, м³/сут — защита от заведомо неподъёмной раскладки */
const MAX_Q = 200_000;
/** предел числа ступеней цепочки */
const MAX_CHAIN = 30;

const SIDES = ["N", "S", "E", "W"] as const;
type Side = (typeof SIDES)[number];

function side(v: unknown): Side | undefined {
  return typeof v === "string" && (SIDES as readonly string[]).includes(v) ? (v as Side) : undefined;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function optNum(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseSite(raw: unknown): SiteInput | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const s = raw as Record<string, unknown>;
  const poly = Array.isArray(s.polygon)
    ? s.polygon
        .filter((p): p is unknown[] => Array.isArray(p) && p.length >= 2)
        .map((p) => [num(p[0]), num(p[1])] as [number, number])
        .slice(0, 500)
    : [];
  const unlimited = s.unlimited === true || poly.length < 3;
  return {
    polygon: poly,
    unlimited,
    groundElev: optNum(s.groundElev),
    inletSide: side(s.inletSide),
    inletInvert: optNum(s.inletInvert),
    outletSide: side(s.outletSide),
    outletElev: optNum(s.outletElev),
    housingSide: side(s.housingSide),
  };
}

const LANGS = ["ru", "uz", "en", "zh"] as const;

/** приведение тела запроса к DrawingInput; ошибка — строкой */
function parseInput(raw: unknown): { input: DrawingInput } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "нет исходных данных расчёта" };
  const r = raw as Record<string, unknown>;

  const q = num(r.q);
  if (!(q > 0)) return { error: "расход не задан" };
  if (q > MAX_Q) return { error: `расход больше ${MAX_Q} м³/сут — комплект по такому расходу онлайн не собирается` };

  const chain = Array.isArray(r.chain) ? r.chain.filter((x): x is string => typeof x === "string").slice(0, MAX_CHAIN) : [];
  if (!chain.length) return { error: "цепочка очистки пуста" };

  const lang = typeof r.lang === "string" && (LANGS as readonly string[]).includes(r.lang) ? (r.lang as DrawingInput["lang"]) : "ru";
  const scaleRaw = String(r.scale ?? "modular");
  const scale: DrawingInput["scale"] =
    scaleRaw === "compact" || scaleRaw === "modular" || scaleRaw === "concrete" ? scaleRaw : "modular";

  return {
    input: {
      object: String(r.object ?? "").slice(0, 200) || "Объект",
      industryId: String(r.industryId ?? "").slice(0, 60),
      q,
      hours: Math.min(24, Math.max(1, num(r.hours, 24))),
      qMaxH: num(r.qMaxH, q / 24),
      bod: num(r.bod),
      cod: num(r.cod),
      ss: num(r.ss),
      fats: num(r.fats),
      tn: num(r.tn),
      chain,
      tech: String(r.tech ?? "").slice(0, 120),
      vAvg: num(r.vAvg),
      vBio: num(r.vBio),
      air: num(r.air),
      dryKg: num(r.dryKg),
      scale,
      szz: optNum(r.szz),
      site: parseSite(r.site),
      lang,
    },
  };
}

function parseOpts(raw: unknown): PackageOptions {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    housingDistM: optNum(o.housingDistM),
    chlorine: o.chlorine === true,
    rev: typeof o.rev === "string" ? o.rev.slice(0, 8) : undefined,
  };
}

/** латиница для имени файла: заголовок Content-Disposition ASCII-only */
function fileSlug(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ў: "u", қ: "q", ғ: "g", ҳ: "h",
  };
  return s.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("").replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function readBody(request: Request): Promise<{ body: Record<string, unknown> } | { error: string }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { error: "слишком большой запрос" };
  }
  const text = await request.text().catch(() => "");
  if (text.length > MAX_BODY_BYTES) return { error: "слишком большой запрос" };
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") return { error: "неверный формат запроса" };
    return { body: parsed as Record<string, unknown> };
  } catch {
    return { error: "неверный формат запроса" };
  }
}

/* ------------------------------------------------------------------
 * ВЫДАЧА КОМПЛЕКТА
 * ------------------------------------------------------------------ */

function zipResponse(input: DrawingInput, opts: PackageOptions): Response {
  const pkg = buildPackage(input, opts);
  const zip = pkg.zip();
  /* копия в собственный ArrayBuffer — корректное тело ответа */
  const buffer = new ArrayBuffer(zip.byteLength);
  new Uint8Array(buffer).set(zip);
  const name = `SUVSANOAT_chertezhi_${fileSlug(pkg.objectCode) || "obj"}_${Math.round(input.q)}m3.zip`;
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": String(zip.byteLength),
      "X-Sheets": String(pkg.sheets.length),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });

  const read = await readBody(request);
  if ("error" in read) return Response.json({ ok: false, error: read.error }, { status: 400 });

  const parsed = parseInput(read.body.input);
  if ("error" in parsed) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const input = parsed.input;
  const opts = parseOpts(read.body.opts);

  /* Администратор SUVSANOAT скачивает комплект без счёта: выставлять
     счёт самому себе незачем, а проверять выдачу на своих объектах нужно
     постоянно. Заказ при этом не создаётся. */
  if (session.r === "admin") {
    try {
      return zipResponse(input, opts);
    } catch (e) {
      console.error("drawings build (admin):", e);
      return Response.json({ ok: false, error: "Не удалось собрать комплект чертежей." }, { status: 500 });
    }
  }

  /* база не подключена — режим без оплаты: комплект отдаётся сразу */
  if (!dbUrl()) {
    console.warn("drawings: база не подключена (DATABASE_URL / POSTGRES_URL) — комплект выдан без оплаты");
    try {
      return zipResponse(input, opts);
    } catch (e) {
      console.error("drawings build:", e);
      return Response.json({ ok: false, error: "Не удалось собрать комплект чертежей." }, { status: 500 });
    }
  }

  try {
    const order = await orderFor(session.u, input.object, input.q);
    if (!isPaid(order)) {
      return Response.json({ ok: false, status: order.status, invoice: invoiceFor(order) }, { status: 402 });
    }
    const response = zipResponse(input, opts);
    await markIssued(order.id).catch((e) => console.error("drawings markIssued:", e));
    return response;
  } catch (e) {
    console.error("drawings POST:", e);
    return Response.json({ ok: false, error: "Не удалось собрать комплект чертежей." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------
 * АДМИНИСТРИРОВАНИЕ ЗАКАЗОВ
 * ------------------------------------------------------------------ */

async function admin(request: Request): Promise<Response | null> {
  const s = await sessionFromRequest(request);
  if (!s || s.r !== "admin") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  if (!dbUrl()) return Response.json({ ok: true, orders: [], noDb: true });
  try {
    return Response.json({ ok: true, orders: await listOrders() });
  } catch (e) {
    console.error("drawings GET:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  if (!dbUrl()) return Response.json({ ok: false, error: "База не подключена — отмечать нечего." }, { status: 500 });
  const b = (await request.json().catch(() => ({}))) as { id?: number; status?: string };
  const status = b.status as OrderStatus | undefined;
  if (!b.id || !status || !["pending", "paid", "issued"].includes(status)) {
    return Response.json({ ok: false, error: "id, status" }, { status: 400 });
  }
  try {
    await setOrderStatus(b.id, status);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("drawings PATCH:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
