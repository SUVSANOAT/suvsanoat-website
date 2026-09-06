/* ==================================================================
 * ЛИСТ 2 КОМПЛЕКТА: ГИДРАВЛИЧЕСКИЙ ПРОФИЛЬ ОЧИСТНЫХ СООРУЖЕНИЙ
 *
 * Профиль показывает, что вода проходит станцию самотёком: сооружения
 * ряда воды в разрезе по оси потока, отметки воды и дна, планировочная
 * отметка 0.000, трубопроводы между сооружениями с DN, длиной, уклоном
 * и расходом, точка сброса со сбросным каналом.
 *
 * КАК СЧИТАЕТСЯ ПРОФИЛЬ (computeProfile)
 * --------------------------------------
 * 1. Цепочка — сооружения ряда «вода» из компоновки в порядке потока
 *    (LayoutResult.placed, ряд water, по координате u вдоль потока).
 * 2. Потери на сооружении — StructureModel.headLoss, м (перепад между
 *    входным и выходным патрубком, задан моделью сооружения).
 * 3. Потери в трубопроводе — по длине участка: Δ = i·L.
 *    Уклон i принят наибольшим из двух:
 *      (а) i = v²·n²/R^(4/3) (формула Шези–Маннинга) при наименьшей
 *          расчётной скорости v и наполнении H/D по табл. 16
 *          ҚМҚ 2.04.03-19 (п. 2.34) и n = 0,013 (бетон, железобетон —
 *          практика; ҚМҚ шероховатость в этой таблице не даёт);
 *      (б) i = 1/DN(мм) — практическое правило наименьшего уклона.
 *    Обоснование выбора: (а) — нормативное условие незаиливания
 *    (скорость не ниже табличной), (б) — практический предел, при
 *    котором уклон остаётся строительно исполнимым; наибольшее из двух
 *    гарантирует и самоочищение, и обычную практику раскладки.
 *    Длина участка — расстояние между габаритами соседних сооружений
 *    из компоновки плюс 2 м на обвязку внутри габарита (практика),
 *    но не менее 3 м.
 * 4. Расчётный расход трубопроводов — Q_max.час × 1,4 (п. 6.14).
 * 5. Направление счёта:
 *      — задана отметка лотка подводящего коллектора (site.inletInvert)
 *        → идём ВПЕРЁД от входа, вычитая потери;
 *      — иначе идём НАЗАД от точки сброса: отметка сброса из
 *        site.outletElev, а если не задана — принимается 0.000 − 1,5 м
 *        с пометкой в примечаниях листа.
 * 6. Проверка: если потребная отметка лотка подводящего коллектора на
 *    границе площадки выше фактической (или выше предельной глубины
 *    заложения 0,7 м от планировки) — самотёк невозможен, требуется
 *    КНС; выводится потребный напор.
 *
 * Масштабы: вертикальный крупнее горизонтального (обычно В 1:100 при
 * Г 1:500); оба подписываются на листе. Лист рисуется в масштабе Г,
 * отметки растягиваются коэффициентом Г/В.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { DrawingInput, StructureModel } from "../core/types";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../lib/assumptions";
import { PIPE_LOTOK_FACTOR, TABLE_16_MIN_VELOCITY, kmkRef } from "../../norms/kmk-2-04-03-19";
import type { LayoutResult, PlacedStructure } from "./layout";
import { fmtElev, wrapText, type SheetBuildMeta } from "./siteplan";

/** коэффициент шероховатости для бетонных и железобетонных труб и лотков (практика; ҚМҚ 2.04.03-19 в табл. 16 не приводит) */
export const MANNING_N = 0.013;
/** минимальная длина участка между сооружениями, м (практика: обвязка, колодец, компенсатор) */
export const MIN_RUN_M = 3;
/** обвязка внутри габарита сооружения с каждой стороны, м (практика) */
export const TIE_IN_M = 1;
/** предельная отметка лотка подводящего коллектора от планировки, м (практика: минимальная глубина заложения 0,7 м до верха трубы) */
export const MIN_COVER_M = 0.7;
/** отметка точки сброса, принимаемая при отсутствии данных, м от 0.000 */
export const ASSUMED_OUTLET_M = -1.5;

/* ==================================================================
 * ГИДРАВЛИКА ТРУБОПРОВОДА
 * ================================================================== */

/** строка табл. 16 (п. 2.34) для диаметра: наименьшая скорость и наполнение */
export function minVelocityRow(dnMm: number): { vMin: number; fill: number; range: [number, number]; belowTable: boolean } {
  const hit = TABLE_16_MIN_VELOCITY.find((r) => dnMm >= r.dMm[0] && dnMm <= r.dMm[1]);
  const row = hit ?? TABLE_16_MIN_VELOCITY[0];
  return { vMin: row.vMin, fill: row.fill, range: [row.dMm[0], row.dMm[1]], belowTable: !hit };
}

/** гидравлический радиус круглой трубы при наполнении fill = H/D, м */
export function hydraulicRadius(dnMm: number, fill: number): number {
  const D = dnMm / 1000;
  const theta = 2 * Math.acos(1 - 2 * Math.min(Math.max(fill, 0.05), 0.999));
  const area = ((D * D) / 8) * (theta - Math.sin(theta));
  const wetted = (D * theta) / 2;
  return area / wetted;
}

export type SlopeResult = {
  /** принятый уклон, доля */
  i: number;
  /** уклон по условию незаиливания (Шези–Маннинг при v_min) */
  iVelocity: number;
  /** практический уклон 1/DN */
  iPractice: number;
  vMin: number;
  fill: number;
  basis: string;
};

/** уклон самотёчного трубопровода DN, доля (см. шапку файла, п. 3) */
export function pipeSlope(dnMm: number): SlopeResult {
  const { vMin, fill, belowTable } = minVelocityRow(dnMm);
  const R = hydraulicRadius(dnMm, fill);
  const iVelocity = (vMin * vMin * MANNING_N * MANNING_N) / Math.pow(R, 4 / 3);
  const iPractice = 1 / dnMm;
  const raw = Math.max(iVelocity, iPractice);
  const i = Math.ceil(raw * 2000) / 2000; // округление вверх до 0,0005
  return {
    i,
    iVelocity,
    iPractice,
    vMin,
    fill,
    basis:
      `v ≥ ${vMin} м/с при H/D = ${fill} (${kmkRef("2.34", "табл. 16")}${belowTable ? ", для DN < 150 таблица величин не даёт — принята её нижняя строка" : ""}), ` +
      `n = ${MANNING_N} (практика); i = max(${iVelocity.toFixed(4)}; 1/${dnMm} = ${iPractice.toFixed(4)}) = ${i.toFixed(4)}`,
  };
}

/** диаметр самотёчного трубопровода по расходу при 1,0 м/с, мм (ряд DN) */
export function dnByFlow(qM3H: number): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / 1.0 / Math.PI) * 1000;
  const row = [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
  return row.find((x) => x >= d) ?? 1000;
}

/* ==================================================================
 * РАСЧЁТ ПРОФИЛЯ
 * ================================================================== */

export type PipeRun = {
  /** откуда/куда: «вход» / поз. сооружения / «выпуск» */
  from: string;
  to: string;
  dn: number;
  lengthM: number;
  slope: number;
  dropM: number;
  qM3H: number;
  fill: number;
  basis: string;
};

export type ProfileNode = {
  model: StructureModel;
  no: string;
  /** координаты вдоль потока, м (из компоновки) */
  u0: number;
  u1: number;
  /** отметка уровня воды на входе и выходе, м от 0.000 */
  waterIn: number;
  waterOut: number;
  headLoss: number;
  /** отметки сооружения после привязки к профилю, м */
  bottom: number;
  water: number;
  top: number;
  /** вертикальный сдвиг модели относительно её собственных отметок, м */
  shift: number;
};

export type ProfileResult = {
  nodes: ProfileNode[];
  /** участки между сооружениями: pipes[i] — от nodes[i] к nodes[i+1] */
  pipes: PipeRun[];
  inletPipe: PipeRun;
  outletPipe: PipeRun;
  direction: "forward" | "backward";
  /** потребная отметка лотка подводящего коллектора на границе площадки, м от 0.000 */
  requiredInletInvert: number;
  /** фактическая отметка лотка коллектора, если задана */
  actualInletInvert: number | null;
  /** отметка воды в точке сброса, м от 0.000 */
  dischargeElev: number;
  dischargeAssumed: boolean;
  needsPumping: boolean;
  pumpHeadM: number;
  hasPumpStation: boolean;
  minBottom: number;
  maxTop: number;
  totalLossM: number;
  notes: string[];
  warnings: string[];
};

/** сооружения ряда воды в порядке потока */
export function waterChain(layout: LayoutResult): PlacedStructure[] {
  return layout.placed.filter((p) => p.row === "water").sort((a, b) => a.u0 - b.u0);
}

export function computeProfile(
  input: DrawingInput,
  models: StructureModel[],
  layout: LayoutResult,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): ProfileResult {
  const notes: string[] = [];
  const warnings: string[] = [];
  const chain = waterChain(layout);
  const freeHead = a.freeHead ?? 0.2;
  const qDesign = input.qMaxH * PIPE_LOTOK_FACTOR.value;

  /* --- привязка заданных абсолютных отметок к 0.000 площадки --- */
  const site = input.site;
  const gElev = site?.groundElev;
  const toRel = (abs: number) => (gElev !== undefined ? abs - gElev : abs);
  if (gElev === undefined && (site?.inletInvert !== undefined || site?.outletElev !== undefined)) {
    warnings.push(
      "Отметка планировки площадки (site.groundElev) не задана: отметки коллектора и точки сброса приняты относительно 0.000 площадки.",
    );
  }

  /* --- участки трубопроводов --- */
  const mkPipe = (from: string, to: string, lengthM: number, dn: number): PipeRun => {
    const s = pipeSlope(dn);
    const L = Math.max(MIN_RUN_M, lengthM);
    return { from, to, dn, lengthM: Math.round(L * 10) / 10, slope: s.i, dropM: s.i * L, qM3H: qDesign, fill: s.fill, basis: s.basis };
  };
  const outDn = (m: StructureModel, role: "in" | "out") => m.nozzles.find((z) => z.role === role)?.dn ?? dnByFlow(qDesign);

  if (!chain.length) {
    const p = mkPipe("вход", "выпуск", MIN_RUN_M, dnByFlow(qDesign));
    return {
      nodes: [], pipes: [], inletPipe: p, outletPipe: p, direction: "backward",
      requiredInletInvert: ASSUMED_OUTLET_M, actualInletInvert: null, dischargeElev: ASSUMED_OUTLET_M, dischargeAssumed: true,
      needsPumping: false, pumpHeadM: 0, hasPumpStation: false, minBottom: ASSUMED_OUTLET_M, maxTop: 0,
      totalLossM: 0,
      notes, warnings: [...warnings, "В компоновке нет сооружений ряда воды — профиль не строится."],
    };
  }

  const first = chain[0];
  const last = chain[chain.length - 1];
  const inletPipe = mkPipe("вход", `поз. ${first.no}`, first.u0 + TIE_IN_M, outDn(first.model, "in"));
  const outDist = Math.max(layout.U - last.u1, 0) + TIE_IN_M;
  const outletPipe = mkPipe(`поз. ${last.no}`, "выпуск", outDist, outDn(last.model, "out"));
  const pipes: PipeRun[] = [];
  for (let i = 0; i + 1 < chain.length; i++) {
    pipes.push(
      mkPipe(
        `поз. ${chain[i].no}`,
        `поз. ${chain[i + 1].no}`,
        chain[i + 1].u0 - chain[i].u1 + 2 * TIE_IN_M,
        outDn(chain[i].model, "out"),
      ),
    );
  }

  /* --- отметки воды по цепочке --- */
  const waterIn = new Array<number>(chain.length).fill(0);
  const waterOut = new Array<number>(chain.length).fill(0);
  const forward = site?.inletInvert !== undefined;
  /* КНС в цепочке разрывает самотёк: выше неё отметки задаёт подводящий
     коллектор, ниже — напор насосов, поэтому обратный ход на ней прерывается */
  const ipump = chain.findIndex((p) => p.model.kind === "pump-station");
  /** уровень воды в приёмном резервуаре КНС — из её собственной модели */
  const wetWell = ipump >= 0 ? chain[ipump].model.water : 0;
  let dischargeElev: number;
  let dischargeAssumed = false;

  if (forward) {
    const invertAtBoundary = toRel(site!.inletInvert!);
    const invertAtFirst = invertAtBoundary - inletPipe.dropM;
    waterIn[0] = invertAtFirst + (inletPipe.fill * inletPipe.dn) / 1000;
    for (let i = 0; i < chain.length; i++) {
      waterOut[i] = waterIn[i] - chain[i].model.headLoss;
      if (i + 1 < chain.length) waterIn[i + 1] = waterOut[i] - pipes[i].dropM;
    }
    dischargeElev = waterOut[chain.length - 1] - outletPipe.dropM - freeHead;
    notes.push(
      `Счёт вперёд от подводящего коллектора: отметка лотка на границе площадки ${fmtElev(invertAtBoundary)}, наполнение H/D = ${inletPipe.fill} (${kmkRef("2.34", "табл. 16")}).`,
    );
  } else {
    dischargeElev = site?.outletElev !== undefined ? toRel(site.outletElev) : ASSUMED_OUTLET_M;
    dischargeAssumed = site?.outletElev === undefined;
    const waterAtDischarge = dischargeElev + freeHead;
    waterOut[chain.length - 1] = waterAtDischarge + outletPipe.dropM;
    for (let i = chain.length - 1; i >= 0; i--) {
      /* на КНС уровень входа задаёт её приёмный резервуар, а не потери ниже по потоку */
      waterIn[i] = i === ipump ? wetWell : waterOut[i] + chain[i].model.headLoss;
      if (i > 0) waterOut[i - 1] = waterIn[i] + pipes[i - 1].dropM;
    }
    notes.push(
      dischargeAssumed
        ? `Счёт назад от точки сброса. Отметка точки сброса не задана — ПРИНЯТА ${fmtElev(ASSUMED_OUTLET_M)} (0.000 − 1,5 м); подлежит уточнению по съёмке.`
        : `Счёт назад от точки сброса с отметкой ${fmtElev(dischargeElev)}; запас напора в точке сброса ${freeHead} м (практика).`,
    );
  }

  /* --- узлы профиля: привязка собственных отметок модели к расчётному уровню --- */
  const nodes: ProfileNode[] = chain.map((p, i) => {
    /* КНС остаётся на своих отметках (её глубина задана моделью), остальные
       сооружения сдвигаются так, чтобы расчётный уровень воды на выходе
       совпал с собственным уровнем модели */
    const shift = i === ipump ? 0 : waterOut[i] - p.model.water;
    return {
      model: p.model,
      no: p.no,
      u0: p.u0,
      u1: p.u1,
      waterIn: waterIn[i],
      waterOut: waterOut[i],
      headLoss: p.model.headLoss,
      bottom: p.model.bottom + shift,
      water: p.model.water + shift,
      top: p.model.top + shift,
      shift,
    };
  });

  /* --- потребная отметка коллектора и проверка на КНС --- */
  const requiredInletInvert = waterIn[0] - (inletPipe.fill * inletPipe.dn) / 1000 + inletPipe.dropM;
  const actualInletInvert = site?.inletInvert !== undefined ? toRel(site.inletInvert) : null;
  const hasPumpStation = ipump >= 0;
  let needsPumping = false;
  let pumpHeadM = 0;

  if (hasPumpStation) {
    /* КНС в комплекте: потребный напор — от уровня в приёмном резервуаре до
       уровня воды на входе следующего сооружения плюс запас */
    const lift = waterOut[ipump] - wetWell + freeHead;
    pumpHeadM = Math.round(lift * 100) / 100;
    notes.push(
      `Подъём воды выполняет КНС поз. ${chain[ipump].no}: уровень в приёмном резервуаре ${fmtElev(wetWell)}, требуемый уровень на напорной стороне ${fmtElev(waterOut[ipump])}; геометрический напор с запасом ${pumpHeadM} м (потери в напорном трубопроводе и арматуре — при подборе насосов).`,
    );
  }

  if (forward) {
    if (site?.outletElev !== undefined) {
      const need = toRel(site.outletElev) + freeHead;
      const have = waterOut[chain.length - 1] - outletPipe.dropM;
      if (have < need) {
        needsPumping = true;
        pumpHeadM = Math.round((need - have + freeHead) * 100) / 100;
        warnings.push(
          `Самотёчный сброс невозможен: уровень воды после последнего сооружения ${fmtElev(have)}, требуется ${fmtElev(need)}. Необходима насосная станция очищенной воды, потребный напор ${pumpHeadM} м.`,
        );
      }
    }
  } else {
    const limit = actualInletInvert !== null ? actualInletInvert : -MIN_COVER_M;
    if (requiredInletInvert > limit + 1e-9) {
      const deficit = Math.round((requiredInletInvert - limit + freeHead) * 100) / 100;
      if (hasPumpStation) {
        warnings.push(
          `Приёмный резервуар КНС поз. ${chain[ipump].no} заглублён недостаточно: потребная отметка лотка подводящего коллектора ${fmtElev(requiredInletInvert)} выше располагаемой ${fmtElev(limit)} на ${deficit.toFixed(2)} м — приёмный резервуар КНС углубить на эту величину.`,
        );
      } else {
        needsPumping = true;
        pumpHeadM = deficit;
        warnings.push(
          actualInletInvert !== null
            ? `Требуемая отметка лотка подводящего коллектора ${fmtElev(requiredInletInvert)} выше фактической ${fmtElev(actualInletInvert)}: самотёк невозможен, необходима КНС на входе, потребный напор ${pumpHeadM} м.`
            : `Требуемая отметка лотка подводящего коллектора ${fmtElev(requiredInletInvert)} выше предельной ${fmtElev(-MIN_COVER_M)} (минимальная глубина заложения 0,7 м, практика): необходима КНС на входе, потребный напор ${pumpHeadM} м.`,
        );
      }
    }
  }

  const minBottom = Math.min(...nodes.map((n) => n.bottom), dischargeElev);
  const maxTop = Math.max(...nodes.map((n) => n.top), 0);
  if (minBottom < -6) {
    warnings.push(
      `Наибольшее заглубление дна ${fmtElev(minBottom)} — свыше 6 м от планировки: требуется проверка водопонижения и устойчивости на всплытие на стадии рабочего проектирования.`,
    );
  }
  const totalLossM =
    nodes.reduce((s, n) => s + n.headLoss, 0) + pipes.reduce((s, p) => s + p.dropM, 0) + inletPipe.dropM + outletPipe.dropM;

  notes.push(
    `Потери по станции ${totalLossM.toFixed(2)} м: на сооружениях ${nodes.reduce((s, n) => s + n.headLoss, 0).toFixed(2)} м (по моделям сооружений), в трубопроводах ${(totalLossM - nodes.reduce((s, n) => s + n.headLoss, 0)).toFixed(2)} м (i·L).`,
  );
  notes.push(`Расчётный расход технологических трубопроводов ${qDesign.toFixed(1)} м³/ч — Q max.час × ${PIPE_LOTOK_FACTOR.value} (${PIPE_LOTOK_FACTOR.ref}).`);
  void models;
  return {
    nodes, pipes, inletPipe, outletPipe, direction: forward ? "forward" : "backward",
    requiredInletInvert, actualInletInvert, dischargeElev, dischargeAssumed,
    needsPumping, pumpHeadM, hasPumpStation, minBottom, maxTop, totalLossM, notes, warnings,
  };
}

/* ==================================================================
 * ПОСТРОЕНИЕ ЛИСТА
 * ================================================================== */

const SCALE_ROW = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
/** предельное растяжение вертикали относительно горизонтали (практика профилей: Г 1:500 / В 1:100) */
const MAX_EXAG = 5;
function pickFrom(mm: number, paperMm: number): number {
  return SCALE_ROW.find((s) => s >= mm / paperMm) ?? 1000;
}

export function buildProfileSheet(
  input: DrawingInput,
  models: StructureModel[],
  layout: LayoutResult,
  meta: SheetBuildMeta = {},
): Sheet {
  const prof = computeProfile(input, models, layout);
  /* длина профиля: участок либо фактический конец цепочки (при fits:false
     сооружения выходят за габарит участка) */
  const lenM = Math.max(layout.U, prof.nodes.length ? prof.nodes[prof.nodes.length - 1].u1 + 6 : 0, 10);
  const hScale = meta.scale ?? pickFrom(lenM * 1000, 540);
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(input.object), "M", meta.index ?? 1),
    title: "Гидравлический профиль очистных сооружений",
    object: input.object,
    scale: hScale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  drawProfile(sheet, input, layout, prof, hScale);
  sheet.revisionRow();
  return sheet;
}

function drawProfile(sheet: Sheet, input: DrawingInput, layout: LayoutResult, prof: ProfileResult, hScale: number) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const th = sheet.th;

  /* --- система координат: таблица внизу листа, профиль над ней --- */
  const px = f.x0 + P(30);
  const datum = Math.floor(prof.minBottom - 1); // условный горизонт, м
  const tableH = 26 + 7.5 * (prof.nodes.length + 2); // высота блока таблицы, мм бумаги
  const avail = 574 - 40 - tableH - 16; // высота под профиль, мм бумаги

  /* --- вертикальный масштаб: крупнее горизонтального, профиль занимает
         всю высоту над таблицей; растяжение ограничено 5-кратным (как
         в паре Г 1:500 / В 1:100) --- */
  const range = Math.max(prof.maxTop - prof.minBottom, 2) + 1.5;
  let vScale = pickFrom(range * 1000, avail);
  if (vScale * MAX_EXAG < hScale) vScale = SCALE_ROW.find((sc) => sc >= hScale / MAX_EXAG) ?? hScale;
  if (vScale > hScale) vScale = hScale;
  const vk = hScale / vScale; // растяжение по вертикали
  const profH = ((prof.maxTop - datum) * 1000) / vScale; // высота профиля, мм бумаги
  const baseY = f.y0 + P(tableH + 16 + Math.max(0, (avail - profH) * 0.35)); // линия условного горизонта
  const X = (uM: number) => px + uM * 1000;
  const Y = (elevM: number) => baseY + (elevM - datum) * 1000 * vk;

  sheet.viewTitle(px, Y(prof.maxTop) + P(30), "ГИДРАВЛИЧЕСКИЙ ПРОФИЛЬ", "none");
  d.text(px, Y(prof.maxTop) + P(23), ts, `ГОРИЗОНТАЛЬНЫЙ М 1:${hScale}   ВЕРТИКАЛЬНЫЙ М 1:${vScale}`, { align: "left" });

  /* --- условный горизонт и шкала отметок --- */
  const uMax = Math.max(layout.U, prof.nodes.length ? prof.nodes[prof.nodes.length - 1].u1 + 4 : 10);
  d.line(px - P(16), baseY, X(uMax) + P(10), baseY, "THIN");
  d.text(px - P(16), baseY - ts * 1.6, ts, `УСЛОВНЫЙ ГОРИЗОНТ ${fmtElev(datum)}`, { align: "left", layer: "THIN" });
  for (let e = datum; e <= Math.ceil(prof.maxTop) + 1; e += 1) {
    d.line(px - P(16), Y(e), px - P(13), Y(e), "THIN");
    d.text(px - P(17), Y(e) - ts * 0.4, ts * 0.8, fmtElev(e), { align: "right", layer: "THIN" });
  }

  /* --- планировочная отметка 0.000: линия земли прерывается на сооружениях --- */
  {
    let xg = px - P(10);
    for (const n of prof.nodes) {
      if (X(n.u0) > xg) d.groundLine(xg, X(n.u0), Y(0), P(3), P(6));
      xg = Math.max(xg, X(n.u1));
    }
    if (X(uMax) + P(6) > xg) d.groundLine(xg, X(uMax) + P(6), Y(0), P(3), P(6));
  }
  d.elevMark(px - P(6), Y(0), "0.000 (ПЛАНИРОВКА)", th, -1);

  /* --- сооружения --- */
  for (const n of prof.nodes) {
    const x0 = X(n.u0), x1 = X(n.u1);
    const yb = Y(n.bottom), yt = Y(n.top), yw = Y(n.water);
    const wall = Math.max(P(1.2), (x1 - x0) * 0.03);
    /* корпус: днище и стены */
    d.poly([[x0, yb - P(2)], [x1, yb - P(2)], [x1, yt], [x1 - wall, yt], [x1 - wall, yb], [x0 + wall, yb], [x0 + wall, yt], [x0, yt]], "CONTOUR", true);
    /* вода */
    d.line(x0 + wall, yw, x1 - wall, yw, "WATER");
    d.waterLevel((x0 + x1) / 2, yw, undefined, th * 0.9);
    /* отметки воды и дна */
    d.elevMark(x0 + wall + P(1), yw, fmtElev(n.water), th * 0.85, 1);
    d.elevMark(x0 + wall + P(1), yb, fmtElev(n.bottom), th * 0.85, -1);
    /* номер позиции в кружке над сооружением */
    const cxp = (x0 + x1) / 2;
    const cyp = Y(prof.maxTop) + P(9);
    d.line(cxp, yt, cxp, cyp - P(3.4), "THIN");
    d.circle(cxp, cyp, P(3.4), "CONTOUR");
    d.text(cxp, cyp - ts * 0.4, ts, n.no, { align: "center" });
  }

  /* --- трубопроводы между сооружениями --- */
  const runs: { pipe: PipeRun; x0: number; y0: number; x1: number; y1: number }[] = [];
  if (prof.nodes.length) {
    const n0 = prof.nodes[0];
    runs.push({ pipe: prof.inletPipe, x0: px - P(14), y0: Y(prof.requiredInletInvert), x1: X(n0.u0), y1: Y(n0.waterIn) });
    for (let i = 0; i + 1 < prof.nodes.length; i++) {
      runs.push({
        pipe: prof.pipes[i],
        x0: X(prof.nodes[i].u1),
        y0: Y(prof.nodes[i].waterOut),
        x1: X(prof.nodes[i + 1].u0),
        y1: Y(prof.nodes[i + 1].waterIn),
      });
    }
    const nl = prof.nodes[prof.nodes.length - 1];
    runs.push({ pipe: prof.outletPipe, x0: X(nl.u1), y0: Y(nl.waterOut), x1: X(uMax) + P(4), y1: Y(prof.dischargeElev + 0.2) });
  }
  runs.forEach((r, idx) => {
    d.arrow(r.x0, r.y0, r.x1, r.y1, "PIPE", P(1.6));
    if (idx === 0) return; // подводящий коллектор подписан отдельно
    const mx = (r.x0 + r.x1) / 2, my = (r.y0 + r.y1) / 2;
    const up = idx % 2 === 0 ? 1 : -1;
    d.text(mx, my + up * ts * 1.5, ts * 0.85, `DN${r.pipe.dn}  L=${r.pipe.lengthM} м`, { align: "center", layer: "PIPE" });
    d.text(mx, my + up * ts * 1.5 - ts * 1.1, ts * 0.85, `i=${r.pipe.slope.toFixed(4)}  Q=${r.pipe.qM3H.toFixed(1)} м³/ч`, { align: "center", layer: "PIPE" });
  });

  /* --- подводящий коллектор --- */
  const yInv = Y(prof.requiredInletInvert);
  d.text(px - P(15), yInv + ts * 3.0, ts, "ПОДВОДЯЩИЙ КОЛЛЕКТОР", { align: "left", layer: "PIPE" });
  d.text(px - P(15), yInv + ts * 1.7, ts, `DN${prof.inletPipe.dn}, i = ${prof.inletPipe.slope.toFixed(4)}, L = ${prof.inletPipe.lengthM} м`, { align: "left", layer: "PIPE" });
  d.text(px - P(15), yInv + ts * 0.4, ts, `лоток ${fmtElev(prof.requiredInletInvert)}`, { align: "left", layer: "PIPE" });

  /* --- сбросной канал --- */
  drawOutfall(sheet, X(uMax) + P(4), Y, prof);

  /* --- таблица профиля --- */
  profileTable(sheet, prof, f.x0 + P(2), f.y0 + P(tableH), f.w - P(4));

  /* --- примечания --- */
  sheet.note(
    `Гидравлический профиль: горизонтальный масштаб 1:${hScale}, вертикальный 1:${vScale} (вертикаль растянута в ${(hScale / vScale).toFixed(0)} раз${hScale / vScale === 1 ? "" : "а"}).`,
  );
  sheet.note(
    `Уклоны участков: i = max(v²n²/R^(4/3); 1/DN). Наименьшая скорость и наполнение — ${kmkRef("2.34", "табл. 16")}; n = ${MANNING_N} (бетон, практика); 1/DN — практическое правило наименьшего уклона.`,
  );
  sheet.note(`Потери на сооружениях приняты по моделям сооружений комплекта (перепад вход-выход), суммарно ${prof.nodes.reduce((s, n) => s + n.headLoss, 0).toFixed(2)} м.`);
  if ([prof.inletPipe, ...prof.pipes, prof.outletPipe].some((p) => p.dn < 150)) {
    sheet.note(
      `Для трубопроводов DN < 150 мм табл. 16 (${kmkRef("2.34")}) наименьшую скорость не нормирует — принята нижняя строка таблицы: 0,7 м/с при H/D = 0,6.`,
    );
  }
  for (const n of prof.notes) sheet.note(n);
  for (const w of prof.warnings) sheet.note(`ВНИМАНИЕ. ${w}`);
  if (prof.hasPumpStation) sheet.note(`Подъём воды в голове станции — КНС в составе комплекта, потребный напор ${prof.pumpHeadM} м; далее по станции вода проходит самотёком.`);
  else if (!prof.needsPumping) sheet.note("Самотёчное прохождение станции обеспечивается: потребная отметка входа не выше располагаемой.");
  sheet.legend([
    { layer: "CONTOUR", text: "сооружения в разрезе" },
    { layer: "WATER", text: "уровень воды" },
    { layer: "PIPE", text: "трубопроводы, DN и уклон" },
    { layer: "HATCH", text: "планировочная отметка 0.000" },
  ]);
  void input;
}

/* ---------------- сбросной канал ---------------- */

function drawOutfall(sheet: Sheet, x: number, Y: (e: number) => number, prof: ProfileResult) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const th = sheet.th;
  const bottom = prof.dischargeElev;
  const top = bottom + 1.2;
  const w = P(22);
  const slope = P(6);
  /* трапецеидальный канал в разрезе */
  d.poly([[x, Y(top)], [x + slope, Y(bottom)], [x + slope + w, Y(bottom)], [x + slope * 2 + w, Y(top)]], "CONTOUR", false);
  const yw = Y(bottom + 0.2);
  d.line(x + slope * 0.85, yw, x + slope * 1.15 + w, yw, "WATER");
  d.waterLevel(x + slope + w / 2, yw, undefined, th * 0.85);
  d.elevMark(x + slope + w / 2, Y(bottom), fmtElev(bottom), th * 0.85, -1);
  d.text(x + slope + w / 2, Y(top) + ts * 1.4, ts, "СБРОСНОЙ КАНАЛ", { align: "center" });
  d.text(x + slope + w / 2, Y(top) + ts * 0.2, ts * 0.85, prof.dischargeAssumed ? "отметка принята, уточнить" : "отметка по заданию", { align: "center" });
}

/* ---------------- таблица профиля ---------------- */

function profileTable(sheet: Sheet, prof: ProfileResult, x: number, yTop: number, w: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const heads = [
    "Сооружение",
    "Отм. воды вход",
    "Отм. воды выход",
    "Потери, м",
    "Отм. дна",
    "Труба до следующего: DN",
    "длина, м",
    "уклон i",
    "расход, м³/ч",
  ];
  const wid = [P(120), P(38), P(38), P(26), P(38), P(30), P(26), P(28), P(32)];
  const total = wid.reduce((s, v) => s + v, 0);
  const k = Math.min(1, w / total);
  const cw = wid.map((v) => v * k);
  const xs: number[] = [x];
  for (const c of cw) xs.push(xs[xs.length - 1] + c);

  const headH = P(12);
  const rowH = P(7.5);
  let y = yTop;
  d.text(x, y + P(3), ts * 1.15, "ТАБЛИЦА ГИДРАВЛИЧЕСКОГО ПРОФИЛЯ", { align: "left" });
  y -= P(2);

  d.rect(x, y - headH, xs[xs.length - 1] - x, headH, "CONTOUR");
  heads.forEach((h, i) => {
    const lines = wrapText(h, Math.max(5, Math.floor(cw[i] / (ts * 0.62))), 2);
    lines.forEach((ln, j) =>
      d.text((xs[i] + xs[i + 1]) / 2, y - headH / 2 - ts * 0.4 + (lines.length > 1 ? (j === 0 ? ts * 0.8 : -ts * 0.6) : 0), ts * 0.85, ln, { align: "center" }),
    );
    if (i) d.line(xs[i], y - headH, xs[i], y, "CONTOUR");
  });
  y -= headH;

  type Row = string[];
  const rows: Row[] = [];
  const pIn = prof.inletPipe;
  rows.push([
    "Подводящий коллектор (граница площадки)",
    "—",
    fmtElev(prof.requiredInletInvert + (pIn.fill * pIn.dn) / 1000),
    "—",
    fmtElev(prof.requiredInletInvert),
    `${pIn.dn}`,
    `${pIn.lengthM}`,
    pIn.slope.toFixed(4),
    pIn.qM3H.toFixed(1),
  ]);
  prof.nodes.forEach((n, i) => {
    const pipe = i + 1 < prof.nodes.length ? prof.pipes[i] : prof.outletPipe;
    rows.push([
      `${n.no}. ${n.model.name}`,
      fmtElev(n.waterIn),
      fmtElev(n.waterOut),
      n.headLoss.toFixed(2),
      fmtElev(n.bottom),
      `${pipe.dn}`,
      `${pipe.lengthM}`,
      pipe.slope.toFixed(4),
      pipe.qM3H.toFixed(1),
    ]);
  });
  rows.push([
    "Точка сброса (сбросной канал)",
    fmtElev(prof.dischargeElev + 0.2),
    fmtElev(prof.dischargeElev),
    "—",
    fmtElev(prof.dischargeElev),
    "—",
    "—",
    "—",
    "—",
  ]);

  for (const r of rows) {
    d.rect(x, y - rowH, xs[xs.length - 1] - x, rowH, "CONTOUR");
    for (let i = 1; i < xs.length - 1; i++) d.line(xs[i], y - rowH, xs[i], y, "CONTOUR");
    const yc = y - rowH / 2 - ts * 0.4;
    const name = wrapText(r[0], Math.max(8, Math.floor((cw[0] - P(3)) / (ts * 0.6))), 1)[0];
    d.text(x + P(1.5), yc, ts * 0.9, name, { align: "left" });
    for (let i = 1; i < r.length; i++) d.text((xs[i] + xs[i + 1]) / 2, yc, ts * 0.9, r[i], { align: "center" });
    y -= rowH;
  }

  /* итоговая строка */
  d.text(x + P(1.5), y - ts * 1.4, ts, `Суммарные потери по станции ${prof.totalLossM.toFixed(2)} м; отметка воды в точке сброса ${fmtElev(prof.dischargeElev + 0.2)}.`, { align: "left" });
  if (prof.needsPumping) {
    d.text(x + P(1.5), y - ts * 3.1, sheet.th, `ТРЕБУЕТСЯ НАСОСНАЯ СТАНЦИЯ, ПОТРЕБНЫЙ НАПОР ${prof.pumpHeadM} м`, { align: "left", layer: "SITE" });
  } else if (prof.hasPumpStation) {
    d.text(x + P(1.5), y - ts * 3.1, sheet.th, `ПОДЪЁМ ВОДЫ — КНС В СОСТАВЕ КОМПЛЕКТА, ПОТРЕБНЫЙ НАПОР ${prof.pumpHeadM} м`, { align: "left" });
  }
}
