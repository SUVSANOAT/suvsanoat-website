/**
 * СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ И ВЕДОМОСТЬ ОБЪЁМОВ РАБОТ (.XLSX).
 *
 *   POST → { input: DrawingInput, opts?: PackageOptions }
 *          Требуется вход в раздел «Инжиниринг».
 *          Ответ — книга Excel (Content-Type: …spreadsheetml.sheet).
 *
 * Зачем отдельный маршрут: комплект чертежей (/api/drawings) — платный
 * продукт со счётом, а спецификация и ведомость объёмов нужны
 * проектировщику и снабженцу для проверки решения ещё до заказа
 * чертежей. Поэтому книга выдаётся всем, кто вошёл в раздел, без заказа.
 *
 * Маршрут серверный: собирается бинарный ZIP (Uint8Array), значит
 * рантайм Node.js, а не edge; ответ не кэшируется.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import type { DrawingInput, SiteInput } from "../../../drawings/core/types";
import type { PackageOptions } from "../../../drawings/package/build";
import { buildSpecWorkbook } from "../../engineering/analysis/pro-result/xlsx";
import { mergeAssumptions } from "../../../lib/assumptions";
import { sessionFromRequest } from "../../../lib/session";

/** предел размера тела запроса: контур участка длинным не бывает */
const MAX_BODY_BYTES = 256 * 1024;
/** предел расхода, м³/сут — тот же, что у комплекта чертежей */
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
  if (q > MAX_Q) return { error: `расход больше ${MAX_Q} м³/сут — спецификация по такому расходу онлайн не собирается` };

  const chain = Array.isArray(r.chain)
    ? r.chain.filter((x): x is string => typeof x === "string").slice(0, MAX_CHAIN)
    : [];
  if (!chain.length) return { error: "цепочка очистки пуста" };

  const lang =
    typeof r.lang === "string" && (LANGS as readonly string[]).includes(r.lang)
      ? (r.lang as DrawingInput["lang"])
      : "ru";
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
  return s
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readBody(request: Request): Promise<{ body: Record<string, unknown> } | { error: string }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { error: "слишком большой запрос" };
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

export async function POST(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });

  const read = await readBody(request);
  if ("error" in read) return Response.json({ ok: false, error: read.error }, { status: 400 });

  const parsed = parseInput(read.body.input);
  if ("error" in parsed) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const input = parsed.input;
  const opts = parseOpts(read.body.opts);

  try {
    /* коэффициенты расчёта берутся утверждённые (значения по умолчанию
       плюс переопределения, если они переданы в теле запроса): книга
       обязана считать теми же числами, что и страница «Допущения» */
    const assumptions = mergeAssumptions(
      read.body.assumptions && typeof read.body.assumptions === "object"
        ? (read.body.assumptions as Record<string, unknown>)
        : null,
    );
    const xlsx = buildSpecWorkbook(input, { ...opts, assumptions });
    /* копия в собственный ArrayBuffer — корректное тело ответа */
    const buffer = new ArrayBuffer(xlsx.byteLength);
    new Uint8Array(buffer).set(xlsx);
    const name = `SUVSANOAT_specifikaciya_${fileSlug(input.object) || "obj"}_${Math.round(input.q)}m3.xlsx`;
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(xlsx.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("spec-xlsx POST:", e);
    return Response.json({ ok: false, error: "Не удалось собрать книгу спецификации." }, { status: 500 });
  }
}
