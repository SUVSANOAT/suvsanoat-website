/**
 * ВЕДОМОСТЬ МАТЕРИАЛОВ И ОБОРУДОВАНИЯ (.XLSX).
 *
 *   POST → { mode: "main" | "network", ... }
 *          Требуется вход в раздел «Инжиниринг».
 *
 * Как и отчёты, книга собирается из пересчитанного на сервере
 * результата: принимаются только исходные данные. Цены в книгу не
 * подставляются — их вписывает человек, а стоимость и итог стоят
 * формулами Excel.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { buildXlsxFile } from "../../engineering/analysis/pro-result/xlsx";
import {
  calculateWaterMain,
  WATER_PIPE,
  type Lining,
  type ProfilePoint,
  type WaterPipeKind,
} from "../../../calculations/water-main";
import { buildMainSpecification, stageProtection } from "../../../calculations/main-spec";
import {
  calculateDemand,
  type SettlementKind,
} from "../../../calculations/water-demand";
import { calculateWaterNetwork, type NetLink, type NetNode } from "../../../calculations/water-network";
import { buildSpecification } from "../../../calculations/water-spec";
import { buildSpecSheets } from "../../../calculations/spec-xlsx";
import { sessionFromRequest } from "../../../lib/session";

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_POINTS = 5000;
const MAX_NODES = 500;

const MATERIALS = ["steel", "castIron", "pe", "grp"] as const;
const LININGS = ["none", "cement", "epoxy"] as const;
const SETTLEMENTS = ["city-large", "city", "town", "village"] as const;

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

function xlsxResponse(bytes: Uint8Array, filename: string) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.byteLength),
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
  const object = String(body.object ?? "").slice(0, 160) || undefined;

  try {
    /* ---------------- водопроводная сеть ---------------- */
    if (body.mode === "network") {
      const nodes = parseNodes(body.nodes);
      const links = parseLinks(body.links);
      const sourceHeadM = num(body.sourceHeadM);
      if (nodes.length < 2 || !links.length || sourceHeadM === undefined) {
        return Response.json({ ok: false, error: "Недостаточно данных для ведомости." }, { status: 400 });
      }
      const sourceId = String(body.sourceId ?? "").slice(0, 40).trim() || nodes[0].id;
      if (!nodes.some((n) => n.id === sourceId)) {
        return Response.json({ ok: false, error: `Узел источника «${sourceId}» не найден.` }, { status: 400 });
      }
      const settlement: SettlementKind = SETTLEMENTS.includes(body.settlement as SettlementKind) ? (body.settlement as SettlementKind) : "town";
      const floors = Math.max(1, Math.round(num(body.floors) ?? 1));
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
      const netMaterial: WaterPipeKind = MATERIALS.includes(body.material as WaterPipeKind) ? (body.material as WaterPipeKind) : "castIron";
      const net = calculateWaterNetwork({ nodes: demand.nodes, links, sourceId, sourceHeadM, material: netMaterial, lining, floors });
      const spec = buildSpecification(demand.nodes, links, net, {
        sourceId,
        materialLabel: WATER_PIPE[netMaterial].label,
        withHydrants: body.hydrants !== false,
        installReservePct: num(body.installReservePct),
      });
      const sheets = buildSpecSheets({
        heading: "Водопроводная сеть населённого пункта",
        object,
        spec,
        assumptions: [...demand.assumptions, ...net.assumptions],
        warnings: net.warnings,
      });
      const xlsx = buildXlsxFile(sheets, {
        title: `Ведомость водопроводной сети — ${object ?? "объект"}`,
        subject: "Ведомость материалов и оборудования",
        creator: "SUVSANOAT",
      });
      return xlsxResponse(xlsx, "SUVSANOAT_vedomost_vodoprovodnoy_seti.xlsx");
    }

    /* ---------------- напорный водовод ---------------- */
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
    const stages = stageProtection(res, {
      material,
      lining,
      minSuctionHeadM: num(body.minSuctionHeadM),
      freeHeadEndM: num(body.freeHeadEndM),
      pumpEff: num(body.pumpEff),
      motorEff: num(body.motorEff),
    });
    const spec = buildMainSpecification(res, {
      material,
      lining,
      stages,
      installReservePct: num(body.installReservePct),
      sectionSpacingM: num(body.sectionSpacingM),
    });
    const sheets = buildSpecSheets({
      heading: "Напорный водовод и каскад насосных станций",
      object,
      spec,
      assumptions: res.assumptions,
      warnings: res.warnings,
    });
    const xlsx = buildXlsxFile(sheets, {
      title: `Ведомость напорного водовода — ${object ?? "объект"}`,
      subject: "Ведомость материалов и оборудования",
      creator: "SUVSANOAT",
    });
    return xlsxResponse(xlsx, "SUVSANOAT_vedomost_napornogo_vodovoda.xlsx");
  } catch (e) {
    console.error("vedomost-xlsx POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось собрать ведомость.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
