/**
 * ЧЕРТЕЖИ САМОТЁЧНОЙ СЕТИ (.ZIP c .DXF).
 *
 *   POST → { input: NetworkInput, object?: string, branch?: string }
 *          Требуется вход в раздел «Инжиниринг».
 *          Ответ — архив: план сети и продольные профили по листам.
 *
 * Расчёт повторяется на сервере, как и в ведомости: чертёж и таблица
 * обязаны выходить из одних и тех же чисел.
 *
 * DXF пишется тем же кодировщиком, что и комплект чертежей очистных
 * сооружений (R12/AC1009, CP1251): один формат на весь сайт.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { calculateNetwork, type NetworkInput, type NetworkLink, type NetworkNode } from "../../../calculations/network";
import { networkProfileSheets } from "../../../drawings/network/profile";
import { networkPlanSheet } from "../../../drawings/network/plan";
import { makeZip, type ZipEntry } from "../../../drawings/core/zip";
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
      return { id, groundElev, x: num(o.x), y: num(o.y), people: num(o.people), qConcentratedM3Day: num(o.qConcentratedM3Day) } as NetworkNode;
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
  if (nodes.length < 2 || !links.length || !outfallId) {
    return Response.json({ ok: false, error: "Недостаточно данных для чертежей." }, { status: 400 });
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
  };

  const object = String(body.object ?? "Канализационная сеть").slice(0, 120);
  const branch = body.branch ? String(body.branch).slice(0, 120) : undefined;

  try {
    const res = calculateNetwork(input);
    const plan = networkPlanSheet(input, res, { object, branch, index: 1 });
    const profiles = networkProfileSheets(res, { object, branch, index: 2 });

    const entries: ZipEntry[] = [
      { name: "01_plan_seti.dxf", data: plan.d.toBytes() },
      ...profiles.map((s, i) => ({
        name: `${String(i + 2).padStart(2, "0")}_profil_${i + 1}.dxf`,
        data: s.d.toBytes(),
      })),
    ];

    const zip = makeZip(entries);
    const buffer = new ArrayBuffer(zip.byteLength);
    new Uint8Array(buffer).set(zip);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="SUVSANOAT_chertezhi_seti.zip"`,
        "Content-Length": String(zip.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("network-dxf POST:", e);
    return Response.json({ ok: false, error: "Не удалось построить чертежи сети." }, { status: 500 });
  }
}
