/* ==================================================================
 * КОМПОНОВКА СООРУЖЕНИЙ НА УЧАСТКЕ (ГЕНПЛАН)
 *
 * Детерминированный алгоритм без «впихивания»:
 *   (а) потребная площадь = Σ footprint × areaFactor + проезд по
 *       периметру + резерв на расширение;
 *   (б) участок не задан → прямоугольник по потребной площади 1,5:1,
 *       вход с запада, выпуск на восток;
 *   (в) размещение: два ряда вдоль оси потока — ряд «вода»
 *       (мех → усреднитель → биология → УФ) и ряд «осадок»
 *       (уплотнитель → стабилизатор → обезвоживание → площадки);
 *       проезд ROAD_W между рядами, GAP между сооружениями; здания
 *       (воздуходувная, ТП, АБК) — у въезда;
 *   (г) проверка: всё внутри контура с отступом MARGIN от границы
 *       (ограждение + проезд), без пересечений;
 *   (д) не помещается → fits:false с дефицитом и подсказками.
 *
 * Принципы размещения — по ҚМҚ 2.04.03-19 пп. 6.11–6.12 (общие
 * указания к площадке очистных сооружений): самотёчное прохождение
 * потока от входа к выпуску с понижением отметок; сооружения
 * механической очистки и обработки осадка — с подветренной стороны по
 * отношению к жилой застройке (дальше от жилья); возможность
 * расширения — резервная полоса. СЗЗ (п. 1.10, табл. 1) — расстояние
 * до жилой застройки; на самом участке не откладывается, проверяется,
 * если задано расстояние до жилья (options.housingDistM).
 *
 * Локальная система осей компоновки: u — вдоль потока (от входа к
 * выпуску), v — поперёк. Перевод в координаты участка (x — восток,
 * y — север; начало — левый нижний угол bbox участка) зависит от
 * стороны входа (inletSide).
 * ================================================================== */

import type { SiteInput, StructureKind, StructureModel } from "../core/types";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../lib/assumptions";
import { kmkRef } from "../../norms/kmk-2-04-03-19";
import {
  bbox, boundsOf, insetBbox, oppositeSide, polygonArea, rectByArea, rectInsidePolygon, rectsIntersect,
  type P2, type Rect,
} from "./geometry";

export type Side = "N" | "S" | "E" | "W";

/** отступ сооружений от границы участка: ограждение + проезд/проход, м (практика) */
export const MARGIN = 3;
/** ширина проезда с твёрдым покрытием, м (практика: пожарный проезд ≥ 3,5 м; принято 4 м) */
export const ROAD_W = 4;
/** зазор между сооружениями в ряду, м (практика, проход для обслуживания) */
export const GAP = 1.5;
/** доля резерва на расширение от площади застройки (практика, п. 6.12 — возможность расширения) */
export const RESERVE_SHARE = 0.2;

export type PlacedStructure = {
  model: StructureModel;
  /** прямоугольник в координатах участка, м (для круга — описанный квадрат) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** поворот габарита: 0 — длина сооружения вдоль X, 90 — вдоль Y */
  rotDeg: 0 | 90;
  /** позиция по экспликации: 01, 02, … */
  no: string;
  /** ряд: вода / осадок / здания */
  row: "water" | "sludge" | "building";
  /** координаты вдоль оси потока, м (начало — граница участка со стороны входа) */
  u0: number;
  u1: number;
};

export type LayoutResult = {
  fits: boolean;
  placed: PlacedStructure[];
  /** проезды с твёрдым покрытием, координаты участка */
  roads: Rect[];
  /** ограждение — по контуру участка с отступом FENCE_INSET */
  fence: P2[];
  gate: P2;
  /** точка входа подводящего коллектора и точка выпуска на границе участка */
  inlet: P2;
  outlet: P2;
  /** полоса резерва расширения (если осталось место) */
  reserve: Rect | null;
  /** контур участка (заданный или сгенерированный), м, приведённый к началу в левом нижнем углу bbox */
  site: P2[];
  generated: boolean;
  needM2: number;
  haveM2: number;
  deficitM2: number;
  builtM2: number;
  hint: string[];
  notes: string[];
  /** исходный список моделей в порядке потока (для профиля при fits:false) */
  models: StructureModel[];
  inletSide: Side;
  outletSide: Side;
  housingSide?: Side;
  szzM?: number;
  housingDistM?: number;
  /** длина участка вдоль потока и поперёк, м */
  U: number;
  V: number;
  /** перевод локальных координат (u,v) → участок (x,y) */
  toSite: (u: number, v: number) => P2;
};

export type LayoutOptions = {
  assumptions?: Assumptions;
  /** расстояние от границы участка до жилой застройки, м — для проверки СЗЗ */
  housingDistM?: number;
  /** ширина проезда, м (по умолчанию ROAD_W) */
  roadW?: number;
};

/** ограждение — внутрь от границы участка, м (практика: полоса под ограждение и отмостку) */
export const FENCE_INSET = 0.5;

const WATER_KINDS: StructureKind[] = ["pump-station", "mech", "equal", "mbr", "aerotank", "ring-bio", "clarifier", "uv", "contact"];
const SLUDGE_KINDS: StructureKind[] = ["thickener", "stabilizer", "dewatering", "sludge-beds"];
const BUILDING_KINDS: StructureKind[] = ["blower", "reagent", "transformer", "admin"];

export function rowOf(kind: StructureKind): "water" | "sludge" | "building" {
  if (WATER_KINDS.includes(kind)) return "water";
  if (SLUDGE_KINDS.includes(kind)) return "sludge";
  if (BUILDING_KINDS.includes(kind)) return "building";
  return "water";
}

/** габарит сооружения в метрах: along — вдоль потока (l), across — поперёк (w) */
export function footprintM(m: StructureModel): { along: number; across: number; areaM2: number } {
  if (m.footprint.shape === "circle") {
    const d = m.footprint.d / 1000;
    return { along: d, across: d, areaM2: (Math.PI * d * d) / 4 };
  }
  const along = m.footprint.l / 1000, across = m.footprint.w / 1000;
  return { along, across, areaM2: along * across };
}

/** потребная площадь участка, м² — п. (а) */
export function requiredArea(models: StructureModel[], a: Assumptions = DEFAULT_ASSUMPTIONS, roadW = ROAD_W) {
  const fp = models.reduce((s, m) => s + footprintM(m).areaM2, 0);
  const builtM2 = fp * a.areaFactor; // проходы, площадки обслуживания
  const side = Math.sqrt(builtM2);
  const roadM2 = (side + 2 * roadW) ** 2 - builtM2; // проезд по периметру квадрата застройки
  const reserveM2 = builtM2 * RESERVE_SHARE;
  const needM2 = Math.ceil(builtM2 + roadM2 + reserveM2);
  return { fpM2: fp, builtM2, roadM2, reserveM2, needM2, siteFactorM2: Math.ceil(builtM2 * a.siteFactor) };
}

/* ---------------- размещение в локальных осях ---------------- */

type LocalItem = { model: StructureModel; row: "water" | "sludge" | "building"; u0: number; u1: number; v0: number; v1: number };

type LocalPlan = {
  items: LocalItem[];
  uNeed: number;
  vNeed: number;
  /** v-границы рядов */
  waterV: [number, number];
  sludgeV: [number, number];
  buildingsU: [number, number];
  rowsU: [number, number];
};

/**
 * Раскладка в осях (u, v) без привязки к участку: sludgeOnHighV — ряд
 * осадка на стороне больших v (дальше от жилья).
 */
function planLocal(models: StructureModel[], sludgeOnHighV: boolean, roadW: number): LocalPlan {
  const water = models.filter((m) => rowOf(m.kind) === "water");
  const sludge = models.filter((m) => rowOf(m.kind) === "sludge");
  const bld = models.filter((m) => rowOf(m.kind) === "building");

  const hWater = water.reduce((s, m) => Math.max(s, footprintM(m).across), 0);
  const hSludge = sludge.reduce((s, m) => Math.max(s, footprintM(m).across), 0);
  const bldDepth = bld.reduce((s, m) => Math.max(s, footprintM(m).along), 0);

  /* здания у въезда — колонна вдоль v */
  const uB0 = MARGIN;
  const uB1 = uB0 + bldDepth;
  const uRows = bld.length ? uB1 + roadW : MARGIN; // въездной проезд между зданиями и рядами
  const uRows0 = bld.length ? uRows : MARGIN;

  /* ряды поперёк: [MARGIN][ряд A][ROAD][ряд B][MARGIN] */
  const rowA = sludgeOnHighV ? { h: hWater, list: water, row: "water" as const } : { h: hSludge, list: sludge, row: "sludge" as const };
  const rowB = sludgeOnHighV ? { h: hSludge, list: sludge, row: "sludge" as const } : { h: hWater, list: water, row: "water" as const };
  const vA0 = MARGIN, vA1 = vA0 + rowA.h;
  const vB0 = (rowA.h > 0 ? vA1 + roadW : MARGIN), vB1 = vB0 + rowB.h;
  const vRowsEnd = rowB.h > 0 ? vB1 : vA1;

  const items: LocalItem[] = [];
  let uMax = uRows0;
  const layRow = (list: StructureModel[], row: "water" | "sludge", v0: number, h: number) => {
    let u = uRows0;
    for (const m of list) {
      const f = footprintM(m);
      /* сооружение центрируем по высоте ряда */
      const vc = v0 + h / 2;
      items.push({ model: m, row, u0: u, u1: u + f.along, v0: vc - f.across / 2, v1: vc + f.across / 2 });
      u += f.along + GAP;
    }
    uMax = Math.max(uMax, u - GAP);
  };
  layRow(rowA.list, rowA.row, vA0, rowA.h);
  layRow(rowB.list, rowB.row, vB0, rowB.h);

  /* здания: стек вдоль v, начиная от v = MARGIN */
  let vb = MARGIN;
  for (const m of bld) {
    const f = footprintM(m);
    items.push({ model: m, row: "building", u0: uB0, u1: uB0 + f.along, v0: vb, v1: vb + f.across });
    vb += f.across + GAP;
  }
  const vBld = bld.length ? vb - GAP : MARGIN;

  const uNeed = uMax + roadW + MARGIN; // концевой проезд (разворот) + отступ
  const vNeed = Math.max(vRowsEnd, vBld) + MARGIN;
  return {
    items, uNeed, vNeed,
    waterV: rowA.row === "water" ? [vA0, vA1] : [vB0, vB1],
    sludgeV: rowA.row === "sludge" ? [vA0, vA1] : [vB0, vB1],
    buildingsU: [uB0, uB1],
    rowsU: [uRows0, uMax],
  };
}

/* ---------------- перевод осей ---------------- */

function makeToSite(inletSide: Side, U: number, V: number): (u: number, v: number) => P2 {
  switch (inletSide) {
    case "W": return (u, v) => [u, v];
    case "E": return (u, v) => [U - u, v];
    case "S": return (u, v) => [v, u];
    case "N": return (u, v) => [v, U - u];
  }
}

function localRectToSite(toSite: (u: number, v: number) => P2, u0: number, u1: number, v0: number, v1: number): Rect {
  return boundsOf([toSite(u0, v0), toSite(u1, v1)]);
}

/* ---------------- главная функция ---------------- */

export function layoutSite(site: SiteInput | undefined, models: StructureModel[], opts: LayoutOptions = {}): LayoutResult {
  const a = opts.assumptions ?? DEFAULT_ASSUMPTIONS;
  const roadW = opts.roadW ?? ROAD_W;
  const notes: string[] = [];
  const hint: string[] = [];

  const inletSide: Side = site?.inletSide ?? "W";
  const outletSide: Side = site?.outletSide ?? oppositeSide(inletSide);
  const housingSide = site?.housingSide;
  const need = requiredArea(models, a, roadW);

  /* --- участок: заданный или генерируемый --- */
  const unlimited = !site || site.unlimited || !site.polygon || site.polygon.length < 3;
  const flowAlongX = inletSide === "W" || inletSide === "E";

  /* сторона осадка: дальше от жилья. В локальных осях выбираем, лежит ли ряд осадка на больших v */
  const sludgeOnHighV = (() => {
    if (!housingSide) return true;
    /* v растёт: для входа W/E — на север (+y); для N/S — на восток (+x) */
    const highVIsNorth = flowAlongX;
    if (highVIsNorth) return housingSide === "S" ? true : housingSide === "N" ? false : true;
    return housingSide === "W" ? true : housingSide === "E" ? false : true;
  })();

  const local = planLocal(models, sludgeOnHighV, roadW);

  let poly: P2[];
  let generated = false;
  if (unlimited) {
    /* (б): прямоугольник 1,5:1 по потребной площади, но не меньше раскладки */
    const gen = rectByArea(need.needM2, 1.5, local.uNeed, local.vNeed); // длинная сторона — вдоль потока
    poly = flowAlongX ? gen : gen.map(([u, v]) => [v, u] as P2);
    generated = true;
    notes.push(`Участок не ограничен: принят прямоугольник ${gen[1][0]}×${gen[2][1]} м (1,5:1, длинная сторона вдоль потока) по потребной площади ${need.needM2} м² (Σ габаритов ${need.fpM2.toFixed(0)} м² × ${a.areaFactor} + проезд ${roadW} м по периметру + резерв ${Math.round(RESERVE_SHARE * 100)} %).`);
  } else {
    const b = bbox(site.polygon);
    poly = site.polygon.map(([x, y]) => [x - b.minX, y - b.minY] as P2);
  }
  const b = bbox(poly);
  const U = flowAlongX ? b.w : b.h;
  const V = flowAlongX ? b.h : b.w;
  const toSite = makeToSite(inletSide, U, V);
  const haveM2 = polygonArea(poly);

  /* --- (в)+(г): перенос на участок и проверка --- */
  const placed: PlacedStructure[] = [];
  let fits = local.uNeed <= U + 1e-9 && local.vNeed <= V + 1e-9;
  const problems: string[] = [];
  if (!fits) {
    problems.push(`раскладка требует ${local.uNeed.toFixed(1)} м вдоль потока и ${local.vNeed.toFixed(1)} м поперёк, участок ${U.toFixed(1)}×${V.toFixed(1)} м`);
  }

  /* нумерация: ряд воды, затем осадок, затем здания — в порядке подачи */
  const order = [...local.items.filter((i) => i.row === "water"), ...local.items.filter((i) => i.row === "sludge"), ...local.items.filter((i) => i.row === "building")];
  order.forEach((it, idx) => {
    const r = localRectToSite(toSite, it.u0, it.u1, it.v0, it.v1);
    const no = String(idx + 1).padStart(2, "0");
    it.model.no = no;
    placed.push({ model: it.model, ...r, rotDeg: flowAlongX ? 0 : 90, no, row: it.row, u0: it.u0, u1: it.u1 });
  });

  if (fits) {
    for (const p of placed) {
      if (!rectInsidePolygon(p, poly, MARGIN)) {
        fits = false;
        problems.push(`поз. ${p.no} «${p.model.name}» выходит за контур участка или ближе ${MARGIN} м к границе`);
      }
    }
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        if (rectsIntersect(placed[i], placed[j])) {
          fits = false;
          problems.push(`пересечение поз. ${placed[i].no} и ${placed[j].no}`);
        }
      }
    }
  }

  const deficitM2 = Math.max(0, need.needM2 - haveM2);
  if (!fits) {
    hint.push(...problems);
    if (deficitM2 > 0) hint.push(`дефицит площади ${Math.ceil(deficitM2)} м² (потребно ${need.needM2}, имеется ${Math.round(haveM2)})`);
    else hint.push("площади достаточно, не подходит форма участка — сменить сторону входа или ориентацию рядов");
    hint.push("компактное исполнение: объединить усреднитель и биологию в один блок, иловые площадки заменить контейнерным вывозом кека");
    hint.push("здания (воздуходувная, АБК, обезвоживание) — в один блок, второй этаж под АБК");
    hint.push(`ужать проезд между рядами до 3,5 м (сейчас ${roadW} м)`);
  }

  /* --- проезды: въездной, между рядами, концевой (разворот) --- */
  const roads: Rect[] = [];
  const hasBld = local.buildingsU[1] > local.buildingsU[0];
  const vLow = MARGIN, vHigh = Math.max(local.vNeed - MARGIN, MARGIN);
  /* въездной проезд — поперёк потока между зданиями и рядами (или перед рядами); выходит к воротам на боковую границу */
  const uRoadIn0 = hasBld ? local.buildingsU[1] : Math.max(MARGIN, local.rowsU[0] - roadW);
  const uRoadIn1 = hasBld ? uRoadIn0 + roadW : local.rowsU[0];
  const uEnd0 = local.rowsU[1], uEnd1 = Math.min(uEnd0 + roadW, U - MARGIN);
  /* ворота — на боковой границе со стороны, противоположной ряду осадка (со стороны подъезда от жилья) */
  const gateAtLowV = sludgeOnHighV;
  if (fits) {
    roads.push(localRectToSite(toSite, uRoadIn0, uRoadIn1, gateAtLowV ? FENCE_INSET + 0.5 : vLow, gateAtLowV ? vHigh : V - FENCE_INSET - 0.5));
    /* проезд между рядами */
    const lo = Math.min(local.waterV[1], local.sludgeV[1]), hi = Math.max(local.waterV[0], local.sludgeV[0]);
    if (hi > lo) roads.push(localRectToSite(toSite, hasBld ? uRoadIn0 : local.rowsU[0], uEnd1, lo, hi));
    /* концевой проезд */
    if (uEnd1 > uEnd0) roads.push(localRectToSite(toSite, uEnd0 + GAP, uEnd1, vLow, vHigh));
  }

  /* --- резерв расширения: остаток вдоль потока за концевым проездом либо поперёк --- */
  let reserve: Rect | null = null;
  if (fits) {
    const uFree0 = uEnd1 + GAP, uFree1 = U - MARGIN;
    const vFree0 = local.vNeed - MARGIN + GAP, vFree1 = V - MARGIN;
    if (uFree1 - uFree0 >= 4) reserve = localRectToSite(toSite, uFree0, uFree1, vLow, Math.max(vHigh, vFree1));
    else if (vFree1 - vFree0 >= 4) reserve = localRectToSite(toSite, MARGIN, uFree1, vFree0, vFree1);
    if (reserve) notes.push(`Резерв расширения ${reserve.w.toFixed(0)}×${reserve.h.toFixed(0)} м (${(reserve.w * reserve.h).toFixed(0)} м²) — ${kmkRef("6.12")} (возможность расширения).`);
    else notes.push(`Резервной полосы для расширения не остаётся (${kmkRef("6.12")}); расширение — за счёт замены сооружений на более производительные.`);
  }

  /* --- ограждение, ворота, вход/выпуск --- */
  const fence = insetPolygon(poly, FENCE_INSET);
  const gate = toSite((uRoadIn0 + uRoadIn1) / 2, gateAtLowV ? 0 : V);
  const wv = (local.waterV[0] + local.waterV[1]) / 2;
  const inlet = toSite(0, wv);
  const outlet = outletSide === oppositeSide(inletSide)
    ? toSite(U, wv)
    : sidePoint(poly, outletSide, toSite(local.rowsU[1], wv));

  /* --- примечания по норме и СЗЗ --- */
  notes.push(`Сооружения размещены в порядке потока от входа (${sideName(inletSide)}) к выпуску (${sideName(outletSide)}) — самотёчное прохождение с понижением отметок (${kmkRef("6.11")}).`);
  if (housingSide) {
    notes.push(`Жилая застройка — с ${sideNameGen(housingSide)}; сооружения обработки осадка и механическая очистка отнесены на противоположную сторону участка (${kmkRef("6.11")}, подветренная сторона).`);
  } else notes.push("Сторона жилой застройки не задана: ряд осадка размещён у дальней границы участка условно.");
  if (opts.housingDistM !== undefined) notes.push(`Расстояние до жилой застройки ${opts.housingDistM} м (задано).`);

  return {
    fits, placed, roads, fence, gate, inlet, outlet, reserve, site: poly, generated,
    needM2: need.needM2, haveM2: Math.round(haveM2), deficitM2: Math.ceil(deficitM2), builtM2: Math.round(need.builtM2),
    hint, notes, models, inletSide, outletSide, housingSide, housingDistM: opts.housingDistM, U, V, toSite,
  };
}

/** проверка СЗЗ: задано расстояние до жилья — сравнить с нормативной зоной */
export function checkSzz(szzM: number | undefined, housingDistM: number | undefined): { ok: boolean | null; text: string } {
  if (!szzM) return { ok: null, text: "СЗЗ не задана" };
  if (housingDistM === undefined) return { ok: null, text: `СЗЗ ${szzM} м по табл. 1 ${kmkRef("1.10")}; расстояние до жилой застройки не задано — проверить на площадке` };
  if (housingDistM >= szzM) return { ok: true, text: `СЗЗ ${szzM} м обеспечена: до жилой застройки ${housingDistM} м (табл. 1 ${kmkRef("1.10")})` };
  return { ok: false, text: `СЗЗ ${szzM} м НЕ обеспечена: до жилой застройки ${housingDistM} м — требуется перенос площадки или обоснование по прим. 2 табл. 1 ${kmkRef("1.10")}` };
}

/* ---------------- вспомогательное ---------------- */

/** полигон, сжатый внутрь на d по bbox-принципу (для прямоугольника точно, для остальных — приближённо к центру) */
function insetPolygon(poly: P2[], d: number): P2[] {
  const b = bbox(poly);
  const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  return poly.map(([x, y]) => [x + (x < cx ? d : -d), y + (y < cy ? d : -d)] as P2);
}

/** точка на стороне участка, ближайшая по координате к p */
function sidePoint(poly: P2[], side: Side, p: P2): P2 {
  const b = bbox(poly);
  switch (side) {
    case "N": return [clamp(p[0], b.minX, b.maxX), b.maxY];
    case "S": return [clamp(p[0], b.minX, b.maxX), b.minY];
    case "E": return [b.maxX, clamp(p[1], b.minY, b.maxY)];
    case "W": return [b.minX, clamp(p[1], b.minY, b.maxY)];
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function sideName(s: Side): string {
  return s === "N" ? "север" : s === "S" ? "юг" : s === "E" ? "восток" : "запад";
}
function sideNameGen(s: Side): string {
  return s === "N" ? "севера" : s === "S" ? "юга" : s === "E" ? "востока" : "запада";
}

/** расположить bbox-габарит участка: сторона света — направление от центра */
export function siteBounds(layout: LayoutResult): Rect {
  return insetBbox(layout.site, 0);
}
