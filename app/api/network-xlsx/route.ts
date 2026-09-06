/**
 * ВЕДОМОСТЬ ГИДРАВЛИЧЕСКОГО РАСЧЁТА СЕТИ (.XLSX).
 *
 *   POST → { input: NetworkInput }
 *          Требуется вход в раздел «Инжиниринг».
 *          Ответ — книга Excel из трёх листов.
 *
 * Расчёт повторяется здесь, на сервере, а не принимается из браузера:
 * в книгу должны попасть числа, посчитанные тем же кодом, что и на
 * странице, и никакая правка в консоли браузера не должна оказаться в
 * документе, который уйдёт в экспертизу.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { calculateNetwork, type NetworkInput, type NetworkNode, type NetworkLink } from "../../../calculations/network";
import { buildNetworkWorkbook } from "../../../calculations/network-xlsx";
import { sessionFromRequest } from "../../../lib/session";

/** предел размера тела: сеть на тысячу колодцев — это уже не онлайн-расчёт */
const MAX_BODY_BYTES = 512 * 1024;
const MAX_NODES = 500;

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseNodes(raw: unknown): NetworkNode[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_NODES)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const id = String(o.id ?? "").slice(0, 40).trim();
      const groundElev = num(o.groundElev);
      if (!id || groundElev === undefined) return null;
      return {
        id,
        groundElev,
        x: num(o.x),
        y: num(o.y),
        people: num(o.people),
        qConcentratedM3Day: num(o.qConcentratedM3Day),
      } as NetworkNode;
    })
    .filter((n): n is NetworkNode => n !== null);
}

function parseLinks(raw: unknown): NetworkLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_NODES)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const from = String(o.from ?? "").slice(0, 40).trim();
      const to = String(o.to ?? "").slice(0, 40).trim();
      if (!from || !to) return null;
      return { from, to, lengthM: num(o.lengthM) } as NetworkLink;
    })
    .filter((l): l is NetworkLink => l !== null);
}

const CATEGORIES = ["city-over-100k", "city-under-100k", "town-under-50k"] as const;
const SOURCES = ["survey", "google", "assumed"] as const;

export async function POST(request: Request) {
  if (!(await sessionFromRequest(request))) {
    return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "Слишком большой запрос." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) throw new Error("too big");
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Неверный формат запроса." }, { status: 400 });
  }

  const raw = (body.input ?? {}) as Record<string, unknown>;
  const nodes = parseNodes(raw.nodes);
  const links = parseLinks(raw.links);
  const outfallId = String(raw.outfallId ?? "").slice(0, 40).trim();

  if (nodes.length < 2) return Response.json({ ok: false, error: "В сети меньше двух узлов." }, { status: 400 });
  if (!links.length) return Response.json({ ok: false, error: "Не задан ни один участок." }, { status: 400 });
  if (!outfallId || !nodes.some((n) => n.id === outfallId)) {
    return Response.json({ ok: false, error: "Не указана конечная точка сети." }, { status: 400 });
  }

  const category = CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number])
    ? (raw.category as NetworkInput["category"])
    : undefined;
  const elevSource = SOURCES.includes(raw.elevSource as (typeof SOURCES)[number])
    ? (raw.elevSource as NetworkInput["elevSource"])
    : "assumed";

  const input: NetworkInput = {
    nodes,
    links,
    outfallId,
    category,
    elevSource,
    lpcd: num(raw.lpcd),
    startDepthM: num(raw.startDepthM),
    minDnMm: num(raw.minDnMm),
  };

  try {
    const res = calculateNetwork(input);
    const xlsx = buildNetworkWorkbook(input, res);
    const buffer = new ArrayBuffer(xlsx.byteLength);
    new Uint8Array(buffer).set(xlsx);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="SUVSANOAT_vedomost_seti_${nodes.length}uzlov.xlsx"`,
        "Content-Length": String(xlsx.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("network-xlsx POST:", e);
    return Response.json({ ok: false, error: "Не удалось собрать ведомость." }, { status: 500 });
  }
}
