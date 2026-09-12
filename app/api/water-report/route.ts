/**
 * ОТЧЁТ ПО РАСЧЁТУ ВОДОПРОВОДНОЙ СЕТИ (.DOCX).
 *
 *   POST → { object?, settlement, terrain, floors, sourceId, sourceHeadM,
 *            nodes, links, material, lining, horizon, kDayMax, alphaMax,
 *            unaccountedPct, lpcdOverride, unevennessMethod, hydrants,
 *            fireNodes? }
 *          Требуется вход в раздел «Инжиниринг».
 *
 * Расчёт повторяется на сервере тем же кодом, что и на странице: в
 * документ должны попасть числа, посчитанные один раз и одинаково.
 * Принимать готовые результаты от клиента нельзя — их можно подменить,
 * и документ перестанет быть расчётом.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { buildDocxFile } from "../../engineering/analysis/pro-result/docx";
import {
  calculateDemand,
  equipmentPlan,
  SETTLEMENT,
  TERRAIN,
  type SettlementKind,
  type Terrain,
} from "../../../calculations/water-demand";
import {
  calculateFireMode,
  calculateWaterNetwork,
  type NetLink,
  type NetNode,
} from "../../../calculations/water-network";
import { WATER_PIPE, type Lining, type WaterPipeKind } from "../../../calculations/water-main";
import { buildReportBlocks, reportDocxMeta } from "../../../calculations/water-report";
import { sessionFromRequest } from "../../../lib/session";

const MAX_BODY_BYTES = 512 * 1024;
const MAX_NODES = 500;

const SETTLEMENTS = ["city-large", "city", "town", "village"] as const;
const TERRAINS = ["flat", "hills", "mountain"] as const;
const MATERIALS = ["steel", "castIron", "pe", "grp"] as const;
const LININGS = ["none", "cement", "epoxy"] as const;

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseNodes(raw: unknown): (NetNode & { people?: number })[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_NODES)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const id = String(o.id ?? "").slice(0, 40).trim();
      const groundM = num(o.groundM);
      if (!id || groundM === undefined) return null;
      return { id, groundM, people: num(o.people), demandLps: num(o.demandLps), floors: num(o.floors) };
    })
    .filter((n): n is NetNode & { people?: number } => n !== null);
}

function parseLinks(raw: unknown): NetLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_NODES)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const from = String(o.from ?? "").slice(0, 40).trim();
      const to = String(o.to ?? "").slice(0, 40).trim();
      const lengthM = num(o.lengthM);
      if (!from || !to || lengthM === undefined) return null;
      return { from, to, lengthM, dnMm: num(o.dnMm) };
    })
    .filter((l): l is NetLink => l !== null);
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

  const nodes = parseNodes(body.nodes);
  const links = parseLinks(body.links);
  const sourceHeadM = num(body.sourceHeadM);
  if (nodes.length < 2 || !links.length || sourceHeadM === undefined) {
    return Response.json({ ok: false, error: "Недостаточно данных для отчёта." }, { status: 400 });
  }
  const sourceId = String(body.sourceId ?? "").slice(0, 40).trim() || nodes[0].id;
  if (!nodes.some((n) => n.id === sourceId)) {
    return Response.json({ ok: false, error: `Узел источника «${sourceId}» не найден.` }, { status: 400 });
  }

  const settlement: SettlementKind = SETTLEMENTS.includes(body.settlement as SettlementKind) ? (body.settlement as SettlementKind) : "town";
  const terrain: Terrain = TERRAINS.includes(body.terrain as Terrain) ? (body.terrain as Terrain) : "flat";
  const material: WaterPipeKind = MATERIALS.includes(body.material as WaterPipeKind) ? (body.material as WaterPipeKind) : "castIron";
  const lining: Lining = LININGS.includes(body.lining as Lining) ? (body.lining as Lining) : "cement";
  const floors = Math.max(1, Math.round(num(body.floors) ?? 1));
  const method = body.unevennessMethod === "kmk" ? ("kmk" as const) : ("shnk" as const);

  try {
    const demand = calculateDemand({
      nodes,
      settlement,
      horizon: num(body.horizon) === 2020 ? 2020 : 2035,
      floors,
      kDayMax: num(body.kDayMax),
      alphaMax: num(body.alphaMax),
      unaccountedPct: num(body.unaccountedPct),
      lpcdOverride: num(body.lpcdOverride),
      unevennessMethod: method,
      localIndustryShare: num(body.localIndustryShare),
    });

    const netInput = { nodes: demand.nodes, links, sourceId, sourceHeadM, material, lining, floors };
    const net = calculateWaterNetwork(netInput);

    const fireIds = Array.isArray(body.fireNodes) ? (body.fireNodes as unknown[]).map((x) => String(x).slice(0, 40)) : undefined;
    const fire = calculateFireMode(netInput, net, demand.fire, fireIds && fireIds.length ? fireIds : undefined);

    const equip = equipmentPlan(demand.nodes, links, net, {
      sourceId,
      terrain,
      withHydrants: body.hydrants !== false,
    });

    const peopleByNode: Record<string, number | undefined> = {};
    nodes.forEach((n) => (peopleByNode[n.id] = n.people));

    const report = {
      object: String(body.object ?? "").slice(0, 160) || undefined,
      settlement,
      terrain,
      floors,
      sourceId,
      sourceHeadM,
      materialLabel: WATER_PIPE[material].label,
      demand,
      net,
      fire,
      equip,
      peopleByNode,
    };

    const docx = buildDocxFile(buildReportBlocks(report), reportDocxMeta(report));
    const buffer = new ArrayBuffer(docx.byteLength);
    new Uint8Array(buffer).set(docx);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="SUVSANOAT_raschet_vodoprovodnoy_seti.docx"`,
        "Content-Length": String(docx.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("water-report POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось собрать отчёт.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

/* Ссылки на SETTLEMENT и TERRAIN нужны, чтобы проверка значений шла по
   тем же справочникам, что и на странице: расхождение словарей — тихая
   ошибка, которая всплывёт только в готовом документе. */
void SETTLEMENT;
void TERRAIN;
