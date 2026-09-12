/**
 * ЧЕРТЕЖИ ВОДОВОДА И ВОДОПРОВОДНОЙ СЕТИ (.ZIP с .DXF).
 *
 *   POST → { mode: "main" | "network", ... }
 *          Требуется вход в раздел «Инжиниринг».
 *          Ответ — архив: продольный профиль водовода по листам либо
 *          план (схема) сети.
 *
 * Как отчёт и ведомость, чертёж строится из пересчитанного на сервере
 * результата. Чертёж, нарисованный по присланным числам, может
 * разойтись с таблицами — а именно это расхождение и губит проекты.
 *
 * DXF пишется тем же кодировщиком, что и остальные чертежи сайта
 * (R12/AC1009, CP1251): один формат на весь сайт.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { calculateWaterMain, type Lining, type ProfilePoint, type WaterPipeKind } from "../../../calculations/water-main";
import { calculateWaterNetwork, type NetLink, type NetNode } from "../../../calculations/water-network";
import { calculateDemand, equipmentPlan, type SettlementKind, type Terrain } from "../../../calculations/water-demand";
import { mainProfileSheets } from "../../../drawings/water/main-profile";
import { netPlanSheet } from "../../../drawings/water/net-plan";
import { makeZip, type ZipEntry } from "../../../drawings/core/zip";
import { sessionFromRequest } from "../../../lib/session";

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_POINTS = 5000;
const MAX_NODES = 500;

const MATERIALS = ["steel", "castIron", "pe", "grp"] as const;
const LININGS = ["none", "cement", "epoxy"] as const;
const SETTLEMENTS = ["city-large", "city", "town", "village"] as const;
const TERRAINS = ["flat", "hills", "mountain"] as const;

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function parsePoints(raw: unknown): ProfilePoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_POINTS)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const stationM = num(o.stationM);
      const groundM = num(o.groundM);
      if (stationM === undefined || groundM === undefined) return null;
      const label = typeof o.label === "string" ? o.label.slice(0, 40) : undefined;
      return { stationM, groundM, invertM: num(o.invertM), label };
    })
    .filter((p): p is ProfilePoint => p !== null);
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
      return {
        id,
        groundM,
        people: num(o.people),
        demandLps: num(o.demandLps),
        floors: num(o.floors),
        x: num(o.x),
        y: num(o.y),
      };
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

function zipResponse(entries: ZipEntry[], filename: string) {
  const zip = makeZip(entries);
  const buffer = new ArrayBuffer(zip.byteLength);
  new Uint8Array(buffer).set(zip);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.byteLength),
      "Cache-Control": "no-store",
    },
  });
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

  const material: WaterPipeKind = MATERIALS.includes(body.material as WaterPipeKind) ? (body.material as WaterPipeKind) : "steel";
  const lining: Lining = LININGS.includes(body.lining as Lining) ? (body.lining as Lining) : "cement";

  try {
    /* ---------------- водопроводная сеть ---------------- */
    if (body.mode === "network") {
      const object = String(body.object ?? "Водопроводная сеть").slice(0, 120);
      const nodes = parseNodes(body.nodes);
      const links = parseLinks(body.links);
      const sourceHeadM = num(body.sourceHeadM);
      if (nodes.length < 2 || !links.length || sourceHeadM === undefined) {
        return Response.json({ ok: false, error: "Недостаточно данных для чертежа." }, { status: 400 });
      }
      const sourceId = String(body.sourceId ?? "").slice(0, 40).trim() || nodes[0].id;
      if (!nodes.some((n) => n.id === sourceId)) {
        return Response.json({ ok: false, error: `Узел источника «${sourceId}» не найден.` }, { status: 400 });
      }
      const settlement: SettlementKind = SETTLEMENTS.includes(body.settlement as SettlementKind) ? (body.settlement as SettlementKind) : "town";
      const terrain: Terrain = TERRAINS.includes(body.terrain as Terrain) ? (body.terrain as Terrain) : "flat";
      const floors = Math.max(1, Math.round(num(body.floors) ?? 1));
      const netMaterial: WaterPipeKind = MATERIALS.includes(body.material as WaterPipeKind) ? (body.material as WaterPipeKind) : "castIron";

      const demand = calculateDemand({
        nodes,
        settlement,
        horizon: num(body.horizon) === 2020 ? 2020 : 2035,
        floors,
        kDayMax: num(body.kDayMax),
        alphaMax: num(body.alphaMax),
        unaccountedPct: num(body.unaccountedPct),
        lpcdOverride: num(body.lpcdOverride),
        unevennessMethod: body.unevennessMethod === "kmk" ? "kmk" : "shnk",
        localIndustryShare: num(body.localIndustryShare),
      });
      const net = calculateWaterNetwork({ nodes: demand.nodes, links, sourceId, sourceHeadM, material: netMaterial, lining, floors });
      const equip = equipmentPlan(demand.nodes, links, net, { sourceId, terrain, withHydrants: body.hydrants !== false });

      const plan = netPlanSheet(demand.nodes, net, { object, sourceId, equipment: equip.nodes, index: 1 });
      return zipResponse([{ name: "01_shema_seti.dxf", data: plan.d.toBytes() }], "SUVSANOAT_chertezhi_vodoprovodnoy_seti.zip");
    }

    /* ---------------- напорный водовод ---------------- */
    const object = String(body.object ?? "Напорный водовод").slice(0, 120);
    const profile = parsePoints(body.profile);
    const qM3Day = num(body.qM3Day);
    if (profile.length < 2 || !qM3Day) {
      return Response.json({ ok: false, error: "Недостаточно данных: нужны профиль и расход." }, { status: 400 });
    }
    const res = calculateWaterMain({
      profile,
      qM3Day,
      hoursPerDay: num(body.hoursPerDay) || 24,
      daysPerYear: num(body.daysPerYear),
      lines: num(body.lines) || 1,
      material,
      lining,
      outerMm: num(body.outerMm),
      wallMm: num(body.wallMm),
      sourceLevelM: num(body.sourceLevelM),
      freeHeadEndM: num(body.freeHeadEndM),
      minSuctionHeadM: num(body.minSuctionHeadM),
      minLineHeadM: num(body.minLineHeadM),
      maxStageHeadM: num(body.maxStageHeadM),
      buryDepthM: num(body.buryDepthM),
      pnBar: num(body.pnBar),
      maxStations: num(body.maxStations),
      pumpEff: num(body.pumpEff),
      motorEff: num(body.motorEff),
      tariffPerKWh: num(body.tariffPerKWh),
      pipePricePerTon: num(body.pipePricePerTon),
      horizonYears: num(body.horizonYears),
    });

    const sheets = mainProfileSheets(res, { object, index: 1 });
    const entries: ZipEntry[] = sheets.map((s, i) => ({
      name: `${String(i + 1).padStart(2, "0")}_profil_vodovoda_${i + 1}.dxf`,
      data: s.d.toBytes(),
    }));
    return zipResponse(entries, "SUVSANOAT_chertezhi_vodovoda.zip");
  } catch (e) {
    console.error("water-dxf POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось построить чертежи.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
