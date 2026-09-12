/**
 * ОТЧЁТ ПО НАПОРНОМУ ВОДОВОДУ И ПО ОТДЕЛЬНОМУ УЧАСТКУ (.DOCX).
 *
 *   POST → { mode: "main" | "segment", ... }
 *          Требуется вход в раздел «Инжиниринг».
 *
 * Расчёт повторяется на сервере тем же кодом, что и на странице.
 * Принимаются только исходные данные — профиль, расход, труба,
 * ограничения; результаты от клиента не принимаются вовсе: документ,
 * собранный из присланных чисел, перестаёт быть расчётом.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { buildDocxFile } from "../../engineering/analysis/pro-result/docx";
import {
  calculateWaterMain,
  type Lining,
  type ProfilePoint,
  type WaterPipeKind,
} from "../../../calculations/water-main";
import { calculateSegment } from "../../../calculations/surge-protection";
import { buildMainSpecification, stageProtection } from "../../../calculations/main-spec";
import {
  buildMainReportBlocks,
  buildSegmentReportBlocks,
  mainReportDocxMeta,
  segmentReportDocxMeta,
} from "../../../calculations/main-report";
import { sessionFromRequest } from "../../../lib/session";

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_POINTS = 5000;

const MATERIALS = ["steel", "castIron", "pe", "grp"] as const;
const LININGS = ["none", "cement", "epoxy"] as const;

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

function docxResponse(bytes: Uint8Array, filename: string) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
    /* ---------------- один участок ---------------- */
    if (body.mode === "segment") {
      const qM3H = num(body.qM3H);
      const geoLiftM = num(body.geoLiftM);
      const pipeLengthM = num(body.pipeLengthM);
      if (!qM3H || geoLiftM === undefined || !pipeLengthM) {
        return Response.json({ ok: false, error: "Недостаточно данных: нужны расход, перепад и длина." }, { status: 400 });
      }
      const seg = calculateSegment({
        qM3H,
        geoLiftM,
        pipeLengthM,
        planLengthM: num(body.planLengthM),
        startElevM: num(body.startElevM),
        material,
        lining,
        outerMm: num(body.outerMm),
        wallMm: num(body.wallMm),
        freeHeadM: num(body.freeHeadM),
        valveCount: num(body.valveCount),
        airValveDnMm: num(body.airValveDnMm),
        drainDnMm: num(body.drainDnMm),
        pnBar: num(body.pnBar),
        pumpEff: num(body.pumpEff),
        motorEff: num(body.motorEff),
      });
      const input = { object, material, lining, qM3H, geoLiftM, pipeLengthM, startElevM: num(body.startElevM), seg };
      const docx = buildDocxFile(buildSegmentReportBlocks(input), segmentReportDocxMeta(input));
      return docxResponse(docx, "SUVSANOAT_raschet_uchastka_vodovoda.docx");
    }

    /* ---------------- весь водовод ---------------- */
    const profile = parsePoints(body.profile);
    const qM3Day = num(body.qM3Day);
    if (profile.length < 2 || !qM3Day) {
      return Response.json({ ok: false, error: "Недостаточно данных: нужны профиль (не менее двух точек) и расход." }, { status: 400 });
    }

    const hoursPerDay = num(body.hoursPerDay) || 24;
    const lines = num(body.lines) || 1;
    const res = calculateWaterMain({
      profile,
      qM3Day,
      hoursPerDay,
      daysPerYear: num(body.daysPerYear),
      lines,
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

    const input = { object, material, lining, qM3Day, hoursPerDay, lines, res, stages, spec, tariffPerKWh: num(body.tariffPerKWh) };
    const docx = buildDocxFile(buildMainReportBlocks(input), mainReportDocxMeta(input));
    return docxResponse(docx, "SUVSANOAT_raschet_napornogo_vodovoda.docx");
  } catch (e) {
    console.error("main-report POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось собрать отчёт.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
