/**
 * ПОЯСНИТЕЛЬНАЯ ЗАПИСКА К РАСЧЁТУ СЕТИ (.DOCX).
 *
 *   POST → { input: NetworkInput, object?, branch?, pump?: {...} }
 *          Требуется вход в раздел «Инжиниринг».
 *
 * Расчёт повторяется на сервере: в записку, как и в ведомость, должны
 * попасть числа, посчитанные тем же кодом.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { calculateNetwork, type NetworkInput, type NetworkLink, type NetworkNode } from "../../../calculations/network";
import { buildNetworkNoteDocx } from "../../../calculations/network-docx";
import { calculatePumpMain, type PipeKind } from "../../../calculations/pump-main";
import { sessionFromRequest } from "../../../lib/session";

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
        areaHa: num(o.areaHa),
        qConcentratedM3Day: num(o.qConcentratedM3Day),
        qTransitLps: num(o.qTransitLps),
        fixedInvert: num(o.fixedInvert),
        startDepthM: num(o.startDepthM),
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
      return { from, to, lengthM: num(o.lengthM), dnMm: num(o.dnMm), slope: num(o.slope) } as NetworkLink;
    })
    .filter((l): l is NetworkLink => l !== null);
}

const CATEGORIES = ["city-over-100k", "city-under-100k", "town-under-50k"] as const;
const SOURCES = ["survey", "google", "assumed"] as const;
const KINDS = ["steel", "plastic", "castIron"] as const;

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
  if (nodes.length < 2 || !links.length || !outfallId) {
    return Response.json({ ok: false, error: "Недостаточно данных для записки." }, { status: 400 });
  }

  const input: NetworkInput = {
    nodes,
    links,
    outfallId,
    category: CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number]) ? (raw.category as NetworkInput["category"]) : undefined,
    elevSource: SOURCES.includes(raw.elevSource as (typeof SOURCES)[number]) ? (raw.elevSource as NetworkInput["elevSource"]) : "assumed",
    lpcd: num(raw.lpcd),
    startDepthM: num(raw.startDepthM),
    minDnMm: num(raw.minDnMm),
    material: raw.material === "plastic" || raw.material === "ceramic" || raw.material === "steel" ? raw.material : undefined,
    densityPerHa: num(raw.densityPerHa),
    localIndustryShare: num(raw.localIndustryShare),
    unaccountedShare: num(raw.unaccountedShare),
    maxDailyRainMm: num(raw.maxDailyRainMm),
  };

  try {
    const res = calculateNetwork(input);

    /* напорный участок включается в записку, только если он посчитан:
       раздела «насосная станция» в проекте самотёчной сети быть не должно,
       если никакой станции нет */
    const p = (body.pump ?? null) as Record<string, unknown> | null;
    const pumpCtx =
      p && num(p.geoLiftM) !== undefined && num(p.lengthM) !== undefined
        ? {
            geoLiftM: num(p.geoLiftM) as number,
            lengthM: num(p.lengthM) as number,
            lines: Math.max(1, Math.round(num(p.lines) ?? 2)),
          }
        : null;
    const pump = pumpCtx
      ? calculatePumpMain({
          qLps: num(p?.qLps) ?? res.totalCalcLps,
          geoLiftM: pumpCtx.geoLiftM,
          lengthM: pumpCtx.lengthM,
          lines: pumpCtx.lines,
          kind: KINDS.includes(p?.kind as (typeof KINDS)[number]) ? (p?.kind as PipeKind) : "steel",
          dnMm: num(p?.dnMm),
        })
      : null;

    const docx = buildNetworkNoteDocx(input, res, {
      object: String(body.object ?? "Канализационная сеть").slice(0, 120),
      branch: body.branch ? String(body.branch).slice(0, 120) : undefined,
      pump,
      pumpContext: pumpCtx ?? undefined,
    });

    const buffer = new ArrayBuffer(docx.byteLength);
    new Uint8Array(buffer).set(docx);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="SUVSANOAT_zapiska_set.docx"`,
        "Content-Length": String(docx.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("network-docx POST:", e);
    return Response.json({ ok: false, error: "Не удалось собрать записку." }, { status: 500 });
  }
}
