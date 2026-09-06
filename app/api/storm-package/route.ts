/**
 * КОМПЛЕКТ ПО ДОЖДЕВОЙ СЕТИ (.ZIP).
 *
 *   POST → { input: StormNetworkInput, object?: string }
 *          Требуется вход в раздел «Инжиниринг».
 *          Ответ — архив: ведомость расчёта (.xlsx), план сети и
 *          продольные профили (.dxf).
 *
 * Одна кнопка вместо трёх: проектировщику нужен комплект, а не
 * россыпь файлов. Расчёт повторяется здесь же, на сервере, — в
 * документы должны попасть числа, посчитанные тем же кодом.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { calculateStormNetwork, stormAsNetworkResult, type StormNetworkInput } from "../../../calculations/storm-network";
import { buildNetworkWorkbook } from "../../../calculations/network-xlsx";
import { networkProfileSheets } from "../../../drawings/network/profile";
import { networkPlanSheet } from "../../../drawings/network/plan";
import { makeZip, type ZipEntry } from "../../../drawings/core/zip";
import { sessionFromRequest } from "../../../lib/session";
import type { NetworkInput, NetworkLink, NetworkNode } from "../../../calculations/network";

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
      return { id, groundElev, x: num(o.x), y: num(o.y), areaHa: num(o.areaHa) } as NetworkNode;
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
  const q20 = num(raw.q20) ?? 0;

  if (nodes.length < 2 || !links.length || !outfallId) {
    return Response.json({ ok: false, error: "Недостаточно данных: нужны узлы, участки и конечная точка." }, { status: 400 });
  }
  if (!(q20 > 0)) {
    return Response.json(
      { ok: false, error: "Не задана интенсивность дождя q20 — её берут с карты изолиний (рис. 1) для площадки объекта." },
      { status: 400 },
    );
  }

  const input: StormNetworkInput = {
    nodes,
    links,
    outfallId,
    q20,
    zone: raw.zone === "mountains" ? "mountains" : "plains",
    periodYears: num(raw.periodYears) ?? 1,
    tConMin: num(raw.tConMin),
    designFill: num(raw.designFill),
    minDnMm: num(raw.minDnMm),
    startDepthM: num(raw.startDepthM),
    surfaces: Array.isArray(raw.surfaces)
      ? (raw.surfaces as unknown[]).slice(0, 10).map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          return {
            share: num(o.share) ?? 0,
            z: o.z === null ? null : num(o.z) ?? null,
            label: String(o.label ?? "поверхность").slice(0, 80),
          };
        })
      : undefined,
  };

  const object = String(body.object ?? "Дождевая канализация").slice(0, 120);

  try {
    const res = calculateStormNetwork(input);
    const asNet = stormAsNetworkResult(res);

    /* план и профиль рисуются тем же кодом, что и бытовая сеть:
       геометрия та же, отличается только смысл расхода */
    const netInput: NetworkInput = { nodes, links, outfallId, elevSource: "survey" };
    const plan = networkPlanSheet(netInput, asNet, { object, branch: "Дождевой коллектор", index: 1 });
    const profiles = networkProfileSheets(asNet, { object, branch: "Дождевой коллектор", index: 2 });
    const xlsx = buildNetworkWorkbook(netInput, asNet);

    const entries: ZipEntry[] = [
      { name: "vedomost_livnevoy_seti.xlsx", data: xlsx },
      { name: "01_plan_seti.dxf", data: plan.d.toBytes() },
      ...profiles.map((s, i) => ({ name: `${String(i + 2).padStart(2, "0")}_profil_${i + 1}.dxf`, data: s.d.toBytes() })),
    ];

    const zip = makeZip(entries);
    const buffer = new ArrayBuffer(zip.byteLength);
    new Uint8Array(buffer).set(zip);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="SUVSANOAT_livnevaya_set.zip"`,
        "Content-Length": String(zip.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("storm-package POST:", e);
    return Response.json({ ok: false, error: "Не удалось собрать комплект по дождевой сети." }, { status: 500 });
  }
}
