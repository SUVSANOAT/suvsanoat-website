/* ==================================================================
 * КОНСТРУКТИВНОЕ ИСПОЛНЕНИЕ ЁМКОСТНЫХ СООРУЖЕНИЙ
 *
 * Решение SUVSANOAT (06.09.2026): все ёмкостные сооружения комплекта —
 * монолитный железобетон. Стеклопластиковые корпуса в чертёжном
 * комплекте не применяются: комплект выдаётся проектировщику как
 * предпроектная проработка капитальных сооружений, и заказчик ожидает
 * железобетон независимо от расхода.
 *
 * Единственная точка, где задаются толщины стен, глубины и материал.
 * Ни одно сооружение библиотеки не должно решать это самостоятельно.
 *
 * Толщины и глубины — из коэффициентов расчёта (lib/assumptions.ts,
 * страница «Допущения»), где главный инженер может их изменить;
 * значения по умолчанию: стены 300 мм, днище 350 мм, перекрытие 200 мм,
 * подготовка 100 мм, борт 500 мм, рабочая глубина 4,5 м.
 * Рабочая глубина аэрационных сооружений ограничена ҚМҚ 2.04.03-19
 * п. 6.150 (3–6 м).
 * ================================================================== */

import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../lib/assumptions";
import { AEROTANK } from "../../norms/kmk-2-04-03-19";

export type Construction = {
  /** толщина стен, мм */
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  /** толщина перекрытия, мм (0 — открытое сооружение) */
  coverMm: number;
  /** бетонная подготовка под днище, мм */
  leanMm: number;
  /** борт над расчётным уровнем воды, м */
  freeboardM: number;
  /** рабочая глубина воды по умолчанию, м */
  waterDepthM: number;
  /** превышение верха борта над планировочной отметкой, м */
  topAboveGroundM: number;
  /** класс бетона для примечаний */
  concreteGrade: string;
  /** расход арматуры, кг/м³ — для ведомости объёмов */
  rebarKgM3: number;
};

/**
 * Конструктив ёмкостного сооружения. Материал всегда железобетон.
 * @param a утверждённые коэффициенты расчёта (со страницы «Допущения»)
 * @param aerated сооружение с аэрацией — глубина ограничивается п. 6.150
 */
export function construction(a: Assumptions = DEFAULT_ASSUMPTIONS, aerated = false): Construction {
  const depth = a.basinDepth ?? 4.5;
  const [dMin, dMax] = AEROTANK.depthM.value;
  return {
    wallMm: a.wallThickness ?? 300,
    slabMm: a.slabThickness ?? 350,
    coverMm: a.coverThickness ?? 200,
    leanMm: a.leanConcrete ?? 100,
    freeboardM: a.basinFreeboard ?? 0.5,
    waterDepthM: aerated ? Math.min(Math.max(depth, dMin), dMax) : depth,
    topAboveGroundM: 0.5,
    concreteGrade: `B${a.concreteGrade ?? 25}, W6, F150`,
    rebarKgM3: a.rebarRate ?? 100,
  };
}

/**
 * Ёмкостные сооружения всегда железобетонные, поэтому в спецификации
 * они идут разделом B (строительные работы подрядчика), а не A.
 * Оборудование внутри (аэрация, насосы, мешалки, скребки, щиты) —
 * по своей принадлежности; металлоконструкции, площадки, лотки,
 * распределительные устройства и обвязку изготавливает SUVSANOAT.
 */
export const TANK_MATERIAL = "concrete" as const;
export const TANK_SUPPLY = "supply" as const;

/** Примечание к листу о конструктиве — единый текст для всех сооружений. */
export function constructionNote(c: Construction): string {
  return (
    `Сооружение железобетонное монолитное: стены ${c.wallMm} мм, днище ${c.slabMm} мм ` +
    `по бетонной подготовке ${c.leanMm} мм, бетон ${c.concreteGrade}. ` +
    `Армирование, фундаменты и гидроизоляция — по расчёту конструкций на стадии рабочего проектирования.`
  );
}

/** Объёмы бетона ёмкости, м³ — для ведомости и сметы. */
export function concreteVolume(
  c: Construction,
  footprint: { shape: "rect"; w: number; l: number } | { shape: "circle"; d: number },
  heightMm: number,
  covered = false,
): { walls: number; slab: number; cover: number; lean: number; total: number; rebarKg: number } {
  const m = (v: number) => v / 1000;
  let wallArea: number; // м² развёртки стен по средней линии
  let plan: number; // м² по наружным граням
  if (footprint.shape === "rect") {
    const w = m(footprint.w), l = m(footprint.l), t = m(c.wallMm);
    wallArea = 2 * (w - t + l - t) * m(heightMm);
    plan = w * l;
  } else {
    const d = m(footprint.d), t = m(c.wallMm);
    wallArea = Math.PI * (d - t) * m(heightMm);
    plan = (Math.PI * d * d) / 4;
  }
  const walls = wallArea * m(c.wallMm);
  const slab = plan * m(c.slabMm);
  const cover = covered ? plan * m(c.coverMm) : 0;
  const lean = plan * m(c.leanMm);
  const total = walls + slab + cover;
  return { walls, slab, cover, lean, total, rebarKg: total * c.rebarKgM3 };
}
