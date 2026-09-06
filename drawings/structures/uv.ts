/* ==================================================================
 * ДООЧИСТКА И УФ-ОБЕЗЗАРАЖИВАНИЕ — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Площадка (плита) с двумя параллельными линиями поточных (закрытых)
 * УФ-установок 1 раб. + 1 рез., обвязкой с задвижками и байпасом,
 * мостиком обслуживания и лестницей — по образцу листа NOD C-01008.
 *
 * При MBR доочистка фильтрами не нужна: пермеат уже без взвеси —
 * только УФ. При других схемах биологии перед УФ ставятся дисковые
 * фильтры (ҚМҚ 2.04.03-19 табл. 58/59 описывает песчаные фильтры,
 * микрофильтры и барабанные сетки; дисковые фильтры — современный
 * аналог барабанных сеток, приняты по практике).
 *
 * Нормативная часть: п. 6.229 допускает УФ-обеззараживание, дозу не
 * нормирует — доза 30 мДж/см² принята по практике (lib/assumptions
 * uvDose). Резерв 1+1 — практика (норма не задаёт). Расчётный расход —
 * максимальный часовой qMaxH (п. 2.7, табл. 2).
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { DISINFECTION, TERTIARY_FILTERS, kmkRef } from "../../norms/kmk-2-04-03-19";
import { construction, constructionNote, TANK_SUPPLY } from "../core/construction";
import { dnFor } from "./mbr";

export type UvParams = {
  /** дисковые фильтры перед УФ: авто — нет при MBR */
  filters: "auto" | "yes" | "no";
  /** доза УФ, мДж/см² — практика (норма не задаёт) */
  doseMJcm2: number;
  /** резерв УФ-установок — практика */
  uvReserve: number;
  /** тонкость фильтрации дисковых фильтров, мкм — практика */
  filterMicron: number;
  /** потери напора, м: УФ-установка и фильтр — паспорт */
  uvLossM: number;
  filterLossM: number;
  /** отметка плиты над планировкой, м; ось трубопроводов над плитой, м — практика */
  slabM: number;
  pipeAxisM: number;
  /** мостик обслуживания: ширина, мм; ограждение 1100 — практика */
  walkwayMm: number;
};

export function uvDefaults(input: DrawingInput): UvParams {
  void input;
  return {
    filters: "auto",
    doseMJcm2: 30,
    uvReserve: 1,
    filterMicron: 10,
    uvLossM: 0.3,
    filterLossM: 0.5,
    slabM: 0.15,
    pipeAxisM: 0.75,
    walkwayMm: 800,
  };
}

/** типоразмеры поточных УФ-установок: расход м³/ч, длина камеры, DN, число ламп — паспортные, практика */
const UV_SIZES = [
  { q: 15, L: 1000, dn: 80, lamps: 2 },
  { q: 30, L: 1200, dn: 100, lamps: 3 },
  { q: 60, L: 1500, dn: 150, lamps: 4 },
  { q: 120, L: 1800, dn: 200, lamps: 6 },
  { q: 250, L: 2200, dn: 250, lamps: 10 },
  { q: 500, L: 2600, dn: 300, lamps: 16 },
  { q: 1000, L: 3000, dn: 400, lamps: 28 },
];
/** дисковые фильтры: расход м³/ч, габарит L×W×H — паспортные, практика */
const FILTER_SIZES = [
  { q: 30, L: 1200, W: 700, H: 900 },
  { q: 60, L: 1500, W: 800, H: 1000 },
  { q: 120, L: 2000, W: 1000, H: 1200 },
  { q: 250, L: 2500, W: 1200, H: 1400 },
  { q: 500, L: 3200, W: 1500, H: 1600 },
];

export type UvGeometry = {
  filters: boolean;
  lines: number;
  uv: { q: number; L: number; dn: number; lamps: number };
  filter: { q: number; L: number; W: number; H: number } | null;
  dn: number;
  /** плита, мм */
  L: number;
  W: number;
  slabMm: number;
  /** оси линий по Y от южной кромки плиты; X начала фильтра / УФ / байпаса */
  yLine: number[];
  yBypass: number;
  xIn: number;
  xFilter: number;
  xUv: number;
  xOut: number;
  /** мостик: Y низа, лестница */
  yWalk: number;
  walkH: number;
  /** отметки */
  slab: number;
  pipe: number;
  top: number;
  headLoss: number;
};

export function uvGeometry(input: DrawingInput, p: UvParams): UvGeometry {
  const mbr = /mbr|мембран/i.test(input.tech);
  const filters = p.filters === "auto" ? !mbr : p.filters === "yes";
  const q = input.qMaxH;
  const uv = UV_SIZES.find((s) => s.q >= q) ?? UV_SIZES[UV_SIZES.length - 1];
  const filter = filters ? FILTER_SIZES.find((s) => s.q >= q) ?? FILTER_SIZES[FILTER_SIZES.length - 1] : null;
  const dn = dnFor(q);
  const lines = 1 + p.uvReserve;
  /* компоновка вдоль X: вход 800 | задвижка 400 | [фильтр L + 600] | УФ L | 400 задвижка | выход 800 */
  const xIn = 800;
  const xFilter = xIn + 600;
  const xUv = filter ? xFilter + filter.L + 600 : xFilter;
  const xOut = xUv + uv.L + 600;
  const L = roundTo(xOut + 800, 100);
  /* по Y: байпас у южной кромки, линии с шагом по ширине оборудования, мостик у северной кромки */
  const pitch = Math.max(1200, (filter?.W ?? 0) + 600, uv.dn + 800);
  const yBypass = 500;
  const yLine = Array.from({ length: lines }, (_, i) => yBypass + 800 + i * pitch);
  const yWalk = yLine[lines - 1] + pitch / 2 + 200;
  const W = roundTo(yWalk + p.walkwayMm + 300, 100);
  const slab = p.slabM;
  const pipe = slab + p.pipeAxisM;
  const topEq = pipe + Math.max(uv.dn / 1000 / 2, filter ? filter.H / 1000 - p.pipeAxisM : 0) + 0.2;
  const headLoss = p.uvLossM + (filters ? p.filterLossM : 0) + 0.1; // + обвязка 0,1 м (практика)
  return {
    filters, lines, uv, filter, dn, L, W, slabMm: 200,
    yLine, yBypass, xIn, xFilter, xUv, xOut,
    yWalk, walkH: 1000,
    slab, pipe, top: Math.max(topEq, slab + 1.0 + 1.1), headLoss: +headLoss.toFixed(2),
  };
}

function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function uvScale(input: DrawingInput, overrides: Partial<UvParams> = {}): number {
  const g = uvGeometry(input, { ...uvDefaults(input), ...overrides });
  return fitScale(g.L + 600, g.W, 2600);
}

export function uvModel(input: DrawingInput, overrides: Partial<UvParams> = {}): StructureModel {
  const p = { ...uvDefaults(input), ...overrides };
  const g = uvGeometry(input, p);
  const mbr = /mbr|мембран/i.test(input.tech);
  const c = construction();
  const model: StructureModel = {
    id: "uv",
    kind: "uv",
    name: g.filters ? "Площадка доочистки и УФ-обеззараживания" : "Площадка УФ-обеззараживания",
    supply: "own",
    material: "steel",
    footprint: { shape: "rect", w: g.W, l: g.L },
    bottom: g.slab - 0.2,
    water: g.pipe,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "in", dn: g.dn, side: "W", pos: g.yLine[0], elev: g.pipe },
      { role: "out", dn: g.dn, side: "E", pos: g.yLine[0], elev: g.pipe },
      ...(g.filters ? [{ role: "drain" as const, dn: 100, side: "S" as const, pos: g.xFilter + g.filter!.L / 2, elev: g.slab }] : []),
    ],
    volumes: [
      { name: "Расчётный расход qMaxH, м³/ч", m3: input.qMaxH },
      ...(g.filters ? [{ name: "Промывная вода фильтров (1–1,5 % от расхода, табл. 59), м³/сут", m3: input.q * 0.015 }] : []),
      { name: "Бетон плиты площадки", m3: (g.L * g.W * g.slabMm) / 1e9 },
      { name: "Бетонная подготовка", m3: (g.L * g.W * c.leanMm) / 1e9 },
      { name: "Итого бетон, м³", m3: (g.L * g.W * g.slabMm) / 1e9 },
      { name: "Арматура, кг", m3: ((g.L * g.W * g.slabMm) / 1e9) * c.rebarKgM3 },
    ],
    equipment: [
      ...(g.filters
        ? [{ name: "Фильтр дисковый самопромывной", qty: `1+${p.uvReserve}`, spec: `${g.filter!.q} м³/ч, ${p.filterMicron} мкм, DN${g.dn}; промывка в голову сооружений`, supply: "supply" as const }]
        : []),
      { name: "УФ-установка поточная (закрытая камера, лампы низкого давления)", qty: `1+${p.uvReserve}`, spec: `${g.uv.q} м³/ч, ${g.uv.lamps} ламп, DN${g.uv.dn}, доза ≥ ${p.doseMJcm2} мДж/см²`, supply: "supply" },
      { name: "Шкаф управления УФ с датчиком интенсивности", qty: `${g.lines} шт.`, supply: "supply" },
      { name: "Задвижки (по 2 на линию + байпас), расходомер электромагнитный", qty: `${2 * g.lines + 1} + 1`, spec: `DN${g.dn}`, supply: "supply" },
      { name: "Обвязка стальная DN" + g.dn + " с байпасом, опоры", qty: "комплект", supply: "own" },
      { name: "Мостик обслуживания с ограждением и лестницей", qty: "1", spec: `${(g.L / 1000).toFixed(1)} м × ${p.walkwayMm} мм, отм. ${fmtE(g.slab + g.walkH / 1000)}`, supply: "own" },
      { name: "Плита площадки железобетонная монолитная", qty: "1", spec: `${g.L}×${g.W}×${g.slabMm} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
    ],
    basis: [
      constructionNote(c),
      `Обеззараживание УФ — допускается ${DISINFECTION.uvAllowed.ref}; доза в ҚМҚ 2.04.03-19 не нормируется — принято ≥ ${p.doseMJcm2} мДж/см² (практика, lib/assumptions uvDose). Расчётный расход ${input.qMaxH.toFixed(1)} м³/ч — максимальный часовой (${kmkRef("2.7", "табл. 2")}).`,
      `УФ-установки ${g.uv.q} м³/ч — 1 рабочая + ${p.uvReserve} резервная, поточные, параллельно с задвижками и общим байпасом (резерв и байпас — практика, норма не задаёт).`,
      g.filters
        ? `Доочистка: дисковые фильтры ${p.filterMicron} мкм 1+${p.uvReserve} по ${g.filter!.q} м³/ч перед УФ — аналог барабанных сеток ${TERTIARY_FILTERS.drumScreens.ref} (эффект по ВВ ${TERTIARY_FILTERS.drumScreens.drumSsEffect[0]}–${TERTIARY_FILTERS.drumScreens.drumSsEffect[1]} %, промывная вода ${TERTIARY_FILTERS.drumScreens.washShareDrum[0] * 100}–${TERTIARY_FILTERS.drumScreens.washShareDrum[1] * 100} %, ${kmkRef("6.257")}); песчаные фильтры ${TERTIARY_FILTERS.table58.ref} не требуются при БПК/ВВ после биологии в норме сброса (уточняется расчётом).`
        : `Доочистка фильтрами не предусмотрена: пермеат MBR не содержит взвеси (мембрана — физический барьер), ${mbr ? "табл. 58/59 не применяются" : "по заданию"}.`,
      `Потери напора ${g.headLoss.toFixed(2)} м: УФ ${p.uvLossM} м${g.filters ? `, фильтр ${p.filterLossM} м` : ""}, обвязка 0,1 м — по паспортам/практике. Ось трубопроводов ${fmtE(g.pipe)}, плита ${fmtE(g.slab)}, мостик ${fmtE(g.slab + g.walkH / 1000)} (практика, по образцу NOD C-01008).`,
    ],
    headLoss: g.headLoss,
    draw: (sheet) => drawUv(sheet, input, p, g),
  };
  return model;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function valvePlan(sheet: Sheet, x: number, y: number, dn: number) {
  const d = sheet.d;
  const s = Math.max(150, dn * 0.6);
  d.poly([[x - s, y - s / 2], [x, y], [x - s, y + s / 2]], "EQUIP", true);
  d.poly([[x + s, y - s / 2], [x, y], [x + s, y + s / 2]], "EQUIP", true);
  d.line(x, y, x, y + s * 1.2, "EQUIP");
  d.line(x - s * 0.5, y + s * 1.2, x + s * 0.5, y + s * 1.2, "EQUIP");
}

function drawUv(sheet: Sheet, input: DrawingInput, p: UvParams, g: UvGeometry) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const dn = g.dn;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(45) - g.W;
  sheet.viewTitle(px, py + g.W + sheet.p(16), "ПЛАН ОБВЯЗКИ");
  d.rect(px, py, g.L, g.W, "CONTOUR");
  d.text(px + g.L / 2, py + sheet.p(1.5), ts * 0.8, `ПЛИТА ${g.L}×${g.W}, ОТМ. ${fmtE(g.slab)}`, { align: "center" });
  /* мостик у северной кромки со стойками ограждения и лестницей */
  const yw = py + g.yWalk;
  const xw = px + 1300;
  d.rect(xw, yw, g.L - 200 - 1300, p.walkwayMm, "THIN");
  d.hatch([[xw, yw], [px + g.L - 200, yw], [px + g.L - 200, yw + p.walkwayMm], [xw, yw + p.walkwayMm]], sheet.p(2), 45, "THIN");
  d.text(px + g.L / 2, yw + p.walkwayMm + ts * 0.5, ts * 0.8, `МОСТИК ОБСЛУЖИВАНИЯ, ОТМ. ${fmtE(g.slab + g.walkH / 1000)}`, { align: "center" });
  /* лестница на западном торце мостика (на плите) */
  d.rect(xw - 1100, yw, 1100, p.walkwayMm, "THIN");
  for (let i = 1; i < 5; i++) d.line(xw - 1100 + (1100 * i) / 5, yw, xw - 1100 + (1100 * i) / 5, yw + p.walkwayMm, "THIN");
  d.text(xw - 550, yw - ts * 1.3, ts * 0.75, "ЛЕСТНИЦА", { align: "center" });
  /* коллекторы: входной (вертикальный у xIn) и выходной (у xOut) */
  const xi = px + g.xIn, xo = px + g.xOut;
  const yb = py + g.yBypass;
  const yTop = py + g.yLine[g.lines - 1];
  d.line(xi, yb, xi, yTop, "PIPE");
  d.line(xo, yb, xo, yTop, "PIPE");
  /* байпас вдоль южной кромки */
  d.line(xi, yb, xo, yb, "PIPE");
  valvePlan(sheet, (xi + xo) / 2, yb, dn);
  d.text((xi + xo) / 2, yb - Math.max(150, dn * 0.6) - ts * 1.2, ts * 0.8, `БАЙПАС DN${dn} (НОРМАЛЬНО ЗАКРЫТ)`, { align: "center" });
  /* линии */
  g.yLine.forEach((yl, i) => {
    const y = py + yl;
    d.line(xi, y, xo, y, "PIPE");
    valvePlan(sheet, xi + 400, y, dn);
    valvePlan(sheet, xo - 400, y, dn);
    if (g.filter) {
      const fx = px + g.xFilter;
      d.rect(fx, y - g.filter.W / 2, g.filter.L, g.filter.W, "EQUIP");
      d.circle(fx + g.filter.L * 0.4, y, g.filter.W * 0.35, "EQUIP");
      d.text(fx + g.filter.L / 2, y + g.filter.W / 2 + ts * 0.4, ts * 0.8, `ФИЛЬТР ${i + 1} (${i === 0 ? "РАБ." : "РЕЗ."})`, { align: "center" });
      d.line(fx + g.filter.L * 0.4, y, fx + g.filter.L * 0.4, py + 100, "HIDDEN"); // промывная вода вниз
    }
    const ux = px + g.xUv;
    d.rect(ux, y - g.uv.dn * 0.8, g.uv.L, g.uv.dn * 1.6, "EQUIP");
    d.line(ux + 200, y, ux + g.uv.L - 200, y, "EQUIP");
    d.rect(ux + g.uv.L * 0.35, y + g.uv.dn * 0.8, g.uv.L * 0.3, 300, "EQUIP"); // блок ламп
    d.text(ux + g.uv.L / 2, y + g.uv.dn * 0.8 + 300 + ts * 0.5, ts * 0.8, `УФ ${i + 1} (${i === 0 ? "РАБ." : "РЕЗ."}) ${g.uv.q} м³/ч`, { align: "center" });
    d.arrow(xi + 900, y + ts * 0.9, xi + 1500, y + ts * 0.9, "FLOW", 100);
  });
  /* расходомер на выходе */
  d.circle(xo + 400, py + g.yLine[0], 200, "EQUIP");
  d.text(xo + 400, py + g.yLine[0] - 200 - ts * 1.2, ts * 0.7, "Q", { align: "center" });
  /* вход/выход */
  const yIo = py + g.yLine[0];
  d.line(px - sheet.p(12), yIo, xi, yIo, "PIPE");
  d.arrow(px - sheet.p(18), yIo, px - sheet.p(12), yIo, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), yIo + th * 0.6, ts, `${g.filters ? "ОТ ВТОРИЧНОГО ОТСТОЙНИКА" : "ПЕРМЕАТ MBR"} DN${dn}`, { align: "right" });
  d.line(xo, yIo, px + g.L + sheet.p(12), yIo, "PIPE");
  d.arrow(px + g.L + sheet.p(12), yIo, px + g.L + sheet.p(18), yIo, "FLOW", sheet.p(2));
  d.text(px + g.L + sheet.p(2), yIo + th * 0.6, ts, `НА ВЫПУСК DN${dn}`, { align: "left" });
  /* шкафы управления у мостика */
  g.yLine.forEach((_, i) => {
    const cx = xo + 100, cy = yw - 600 - i * 500;
    d.rect(cx, cy, 600, 350, "EQUIP");
    d.text(cx + 300, cy + 350 - ts * 0.5 - 175 + ts * 0.3, ts * 0.6, `ШУ${i + 1}`, { align: "center" });
  });
  /* размеры */
  const yd = py - sheet.p(16);
  const xs = [px, xi, ...(g.filter ? [px + g.xFilter, px + g.xFilter + g.filter.L] : []), px + g.xUv, px + g.xUv + g.uv.L, xo, px + g.L];
  d.dimChainH(xs, yd, th);
  d.dimH(px, px + g.L, yd - sheet.p(9), `${g.L}`, th);
  const xd = px + g.L + sheet.p(35);
  d.dimChainV(xd, [py, yb, ...g.yLine.map((y) => py + y), yw, yw + p.walkwayMm, py + g.W], th);
  d.dimV(xd + sheet.p(9), py, py + g.W, `${g.W}`, th);
  const y11 = py + g.yLine[0];
  d.sectionMark(px - sheet.p(6), y11, px + g.L + sheet.p(6), y11, "1", th, -1);
  const x22 = px + g.xUv + g.uv.L * 0.6;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.W + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const Hview = (g.top - g.slab) * 1000 + g.slabMm + 300;
  const sy = yd - sheet.p(40) - Hview;
  sheet.viewTitle(px, sy + Hview + sheet.p(14), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, p, g);
  const cx = px + g.L + sheet.p(70);
  sheet.viewTitle(cx, sy + Hview + sheet.p(14), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, sy, p, g);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.L + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(8) - isoLeft;
  const k = Math.min(0.6, avail / ((g.L + g.W) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.W * k * Math.cos(Math.PI / 6);
  const isoH = (g.L + g.W) * k * 0.5 + (g.top - g.slab) * 1000 * k;
  const iy = f.y0 + f.h - sheet.p(34) - isoH;
  sheet.viewTitle(isoLeft, f.y0 + f.h - sheet.p(24), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, p, g, k);

  sheet.note(`УФ-обеззараживание: установки поточные 1+${p.uvReserve} по ${g.uv.q} м³/ч (qMaxH ${input.qMaxH.toFixed(1)} м³/ч), доза ≥ ${p.doseMJcm2} мДж/см² (п. 6.229 допускает УФ, дозу не нормирует — принято по практике); байпас нормально закрыт.`);
  sheet.note(g.filters
    ? `Доочистка: дисковые фильтры ${p.filterMicron} мкм 1+${p.uvReserve} по ${g.filter!.q} м³/ч (аналог барабанных сеток, табл. 59); промывная вода — в голову сооружений.`
    : `Доочистка фильтрами не требуется: на УФ поступает пермеат MBR без взвеси.`);
  sheet.note(`Обвязка DN${dn} на опорах, ось ${fmtE(g.pipe)}; плита ${g.L}×${g.W}×${g.slabMm} мм на отм. ${fmtE(g.slab)}; мостик ${p.walkwayMm} мм с ограждением 1100 и лестницей (по образцу NOD C-01008). Потери на площадке ${g.headLoss.toFixed(2)} м.`);
  sheet.note(`УФ-установки${g.filters ? ", фильтры" : ""}, арматура, расходомер, шкафы — поставка; обвязка, опоры, мостик — изготовление SUVSANOAT; плита — ж/б подрядчика.`);
  sheet.legend([
    { layer: "CONTOUR", text: "плита, опоры" },
    { layer: "EQUIP", text: g.filters ? "УФ-установки, фильтры, арматура" : "УФ-установки, арматура" },
    { layer: "PIPE", text: "трубопроводы" },
    { layer: "HATCH", text: "решётчатый настил мостика" },
  ]);
}

function sectionLong(sheet: Sheet, x: number, y: number, p: UvParams, g: UvGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const ys = y + 300; // верх плиты выше низа вида
  const groundY = ys - g.slab * 1000;
  const yp = ys + p.pipeAxisM * 1000;
  const dn = g.dn;
  d.rect(x, ys - g.slabMm, g.L, g.slabMm, "CONTOUR");
  d.concrete([[x, ys - g.slabMm], [x + g.L, ys - g.slabMm], [x + g.L, ys], [x, ys]], sheet.p(1.5));
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.L, x + g.L + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  /* труба линии 1 */
  const xi = x + g.xIn, xo = x + g.xOut;
  d.line(x - sheet.p(12), yp + dn / 2, xi + 400 - 200, yp + dn / 2, "PIPE");
  d.line(x - sheet.p(12), yp - dn / 2, xi + 400 - 200, yp - dn / 2, "PIPE");
  d.line(xo - 400 + 200, yp + dn / 2, x + g.L + sheet.p(12), yp + dn / 2, "PIPE");
  d.line(xo - 400 + 200, yp - dn / 2, x + g.L + sheet.p(12), yp - dn / 2, "PIPE");
  d.text(x - sheet.p(1), yp + dn / 2 + th * 0.5, ts * 0.85, "ВХОД", { align: "right" });
  d.text(x + g.L + sheet.p(1), yp + dn / 2 + th * 0.5, ts * 0.85, "ВЫХОД", { align: "left" });
  /* задвижки — как прямоугольники с маховиком */
  for (const vx of [xi + 400, xo - 400]) {
    d.rect(vx - 200, yp - dn / 2 - 100, 400, dn + 200, "EQUIP");
    d.line(vx, yp + dn / 2 + 100, vx, yp + dn / 2 + 500, "EQUIP");
    d.circle(vx, yp + dn / 2 + 500, 150, "EQUIP");
  }
  /* фильтр */
  let xa = xi + 600;
  if (g.filter) {
    const fx = x + g.xFilter;
    d.rect(fx, ys, g.filter.L, g.filter.H, "EQUIP");
    d.rect(fx + 200, ys, g.filter.L - 400, 300, "THIN");
    d.text(fx + g.filter.L / 2, ys + g.filter.H + th * 0.5, ts * 0.85, "ДИСКОВЫЙ ФИЛЬТР", { align: "center" });
    d.line(xa, yp + dn / 2, fx, yp + dn / 2, "PIPE");
    d.line(xa, yp - dn / 2, fx, yp - dn / 2, "PIPE");
    d.line(fx + g.filter.L, yp + dn / 2, x + g.xUv, yp + dn / 2, "PIPE");
    d.line(fx + g.filter.L, yp - dn / 2, x + g.xUv, yp - dn / 2, "PIPE");
    xa = x + g.xUv;
  } else {
    d.line(xa, yp + dn / 2, x + g.xUv, yp + dn / 2, "PIPE");
    d.line(xa, yp - dn / 2, x + g.xUv, yp - dn / 2, "PIPE");
  }
  /* УФ-камера на опорах */
  const ux = x + g.xUv;
  d.rect(ux, yp - g.uv.dn * 0.8, g.uv.L, g.uv.dn * 1.6, "EQUIP");
  d.rect(ux + g.uv.L * 0.35, yp + g.uv.dn * 0.8, g.uv.L * 0.3, 250, "EQUIP");
  d.text(ux + g.uv.L / 2, yp + g.uv.dn * 0.8 + 250 + th * 0.5, ts * 0.85, `УФ-УСТАНОВКА DN${g.uv.dn}, ${g.uv.lamps} ЛАМП`, { align: "center" });
  for (const sx of [ux + 300, ux + g.uv.L - 300]) d.rect(sx - 60, ys, 120, yp - g.uv.dn * 0.8 - ys, "CONTOUR");
  d.line(ux + g.uv.L, yp + dn / 2, xo - 600, yp + dn / 2, "PIPE");
  d.line(ux + g.uv.L, yp - dn / 2, xo - 600, yp - dn / 2, "PIPE");
  /* опоры трубопровода */
  for (const sx of [xi - 200, xo + 200]) d.rect(sx - 60, ys, 120, yp - dn / 2 - ys, "CONTOUR");
  /* мостик за линией (невидимый контур) и ограждение */
  const ywk = ys + g.walkH;
  d.line(x + 1300, ywk, x + g.L - 200, ywk, "HIDDEN");
  d.line(x + 1300, ywk + 1100, x + g.L - 200, ywk + 1100, "HIDDEN");
  d.poly([[x + 200, ys], [x + 1300, ys + g.walkH]], "HIDDEN", false);
  d.text(x + g.L - 200, ywk + 1100 + th * 0.4, ts * 0.75, "МОСТИК И ОГРАЖДЕНИЕ (ЗА ПЛОСКОСТЬЮ)", { align: "right" });
  /* отметки и размеры */
  d.elevMark(x - sheet.p(8), groundY, "0.000", th, -1);
  d.elevMark(x + g.L + sheet.p(12), ys, fmtE(g.slab), th, -1);
  d.elevMark(x + g.L + sheet.p(12), yp, fmtE(g.pipe), th, -1);
  d.elevMark(x + g.L + sheet.p(12), ywk, fmtE(g.slab + g.walkH / 1000), th, 1);
  d.dimChainV(x - sheet.p(18), [ys - g.slabMm, ys, yp, ywk], th, [`${g.slabMm}`, `${p.pipeAxisM * 1000}`, `${g.walkH - p.pipeAxisM * 1000}`]);
  const xs = [x, xi, ...(g.filter ? [x + g.xFilter, x + g.xFilter + g.filter.L] : []), ux, ux + g.uv.L, xo, x + g.L];
  d.dimChainH(xs, y - sheet.p(8), th);
}

function sectionCross(sheet: Sheet, x: number, y: number, p: UvParams, g: UvGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const ys = y + 300;
  const groundY = ys - g.slab * 1000;
  const yp = ys + p.pipeAxisM * 1000;
  const W = g.W;
  d.rect(x, ys - g.slabMm, W, g.slabMm, "CONTOUR");
  d.concrete([[x, ys - g.slabMm], [x + W, ys - g.slabMm], [x + W, ys], [x, ys]], sheet.p(1.5));
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  /* байпас и линии — сечения труб/УФ-камер */
  d.circle(x + g.yBypass, yp, g.dn / 2, "PIPE");
  d.text(x + g.yBypass, yp + g.dn / 2 + th * 0.4, ts * 0.75, "БАЙПАС", { align: "center" });
  d.rect(x + g.yBypass - 60, ys, 120, yp - g.dn / 2 - ys, "CONTOUR");
  g.yLine.forEach((yl, i) => {
    const cx = x + yl;
    d.circle(cx, yp, g.uv.dn * 0.8, "EQUIP");
    d.circle(cx, yp, g.uv.dn * 0.5, "THIN");
    d.rect(cx - 150, yp + g.uv.dn * 0.8, 300, 250, "EQUIP");
    d.rect(cx - 60, ys, 120, yp - g.uv.dn * 0.8 - ys, "CONTOUR");
    d.text(cx, yp + g.uv.dn * 0.8 + 250 + th * 0.5, ts * 0.8, `УФ ${i + 1}`, { align: "center" });
  });
  /* мостик: настил на стойках, ограждение, лестница */
  const ywk = ys + g.walkH;
  const wx = x + g.yWalk;
  d.rect(wx, ywk - 60, p.walkwayMm, 60, "CONTOUR");
  d.hatch([[wx, ywk - 60], [wx + p.walkwayMm, ywk - 60], [wx + p.walkwayMm, ywk], [wx, ywk]], sheet.p(1), 45);
  for (const sx of [wx + 100, wx + p.walkwayMm - 100]) d.rect(sx - 40, ys, 80, ywk - 60 - ys, "CONTOUR");
  for (const sx of [wx, wx + p.walkwayMm]) {
    d.line(sx, ywk, sx, ywk + 1100, "THIN");
    d.line(sx - 40, ywk + 1100, sx + 40, ywk + 1100, "THIN");
    d.line(sx - 40, ywk + 550, sx + 40, ywk + 550, "THIN");
  }
  d.text(wx + p.walkwayMm / 2, ywk + 1100 + th * 0.5, ts * 0.8, "МОСТИК", { align: "center" });
  /* отметки и размеры */
  d.elevMark(x - sheet.p(8), groundY, "0.000", th, -1);
  d.elevMark(x + W + sheet.p(8), ys, fmtE(g.slab), th, -1);
  d.elevMark(x + W + sheet.p(8), yp, fmtE(g.pipe), th, -1);
  d.elevMark(x + W + sheet.p(8), ywk, fmtE(g.slab + g.walkH / 1000), th, 1);
  d.dimChainH([x, x + g.yBypass, ...g.yLine.map((v) => x + v), wx, wx + p.walkwayMm, x + W], y - sheet.p(8), th);
  d.dimChainV(x - sheet.p(18), [ys - g.slabMm, ys, yp, ywk], th, [`${g.slabMm}`, `${p.pipeAxisM * 1000}`, `${g.walkH - p.pipeAxisM * 1000}`]);
}

function isoView(sheet: Sheet, ox: number, oy: number, p: UvParams, g: UvGeometry, k: number) {
  const d = sheet.d;
  const L = g.L * k, W = g.W * k;
  const zp = p.pipeAxisM * 1000 * k;
  d.isoBox(0, 0, -g.slabMm * k, L, W, g.slabMm * k, ox, oy, "CONTOUR");
  const xi = g.xIn * k, xo = g.xOut * k;
  /* байпас и коллекторы */
  d.isoLine([xi, g.yBypass * k, zp], [xo, g.yBypass * k, zp], ox, oy, "PIPE");
  d.isoLine([xi, g.yBypass * k, zp], [xi, g.yLine[g.lines - 1] * k, zp], ox, oy, "PIPE");
  d.isoLine([xo, g.yBypass * k, zp], [xo, g.yLine[g.lines - 1] * k, zp], ox, oy, "PIPE");
  d.isoLine([-sheet.p(6), g.yLine[0] * k, zp], [xi, g.yLine[0] * k, zp], ox, oy, "PIPE");
  d.isoLine([xo, g.yLine[0] * k, zp], [L + sheet.p(6), g.yLine[0] * k, zp], ox, oy, "PIPE");
  for (const yl of g.yLine) {
    const y = yl * k;
    d.isoLine([xi, y, zp], [xo, y, zp], ox, oy, "PIPE");
    if (g.filter) d.isoBox(g.xFilter * k, y - (g.filter.W / 2) * k, 0, g.filter.L * k, g.filter.W * k, g.filter.H * k, ox, oy, "EQUIP");
    /* УФ-камера — горизонтальный параллелепипед */
    d.isoBox(g.xUv * k, y - g.uv.dn * 0.8 * k, zp - g.uv.dn * 0.8 * k, g.uv.L * k, g.uv.dn * 1.6 * k, g.uv.dn * 1.6 * k, ox, oy, "EQUIP");
  }
  /* мостик с ограждением и лестницей */
  const zw = g.walkH * k;
  const xw = 1300 * k;
  d.isoBox(xw, g.yWalk * k, zw - 60 * k, L - 200 * k - xw, p.walkwayMm * k, 60 * k, ox, oy, "CONTOUR");
  for (const y of [g.yWalk * k, (g.yWalk + p.walkwayMm) * k]) {
    d.isoLine([xw, y, zw + 1100 * k], [L - 200 * k, y, zw + 1100 * k], ox, oy, "THIN");
    const n = Math.max(2, Math.round((g.L - 1500) / 1500));
    for (let i = 0; i <= n; i++) {
      const xx = xw + ((L - 200 * k - xw) * i) / n;
      d.isoLine([xx, y, zw], [xx, y, zw + 1100 * k], ox, oy, "THIN");
    }
  }
  for (let s = 1; s <= 5; s++) {
    const xx = xw - (1100 * k * s) / 5, z = zw - (zw * s) / 5;
    d.isoLine([xx, g.yWalk * k, z], [xx, (g.yWalk + p.walkwayMm) * k, z], ox, oy, "THIN");
  }
}
