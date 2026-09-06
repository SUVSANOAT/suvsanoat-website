/* ==================================================================
 * АЭРОБНЫЙ СТАБИЛИЗАТОР ИЛА — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Коридорный аэротенк, секционированный поперечными перегородками с
 * водосливами (п. 6.373 ҚМҚ 2.04.03-19), не менее двух секций (линий).
 * Ячейки — по табл. 68: 4–8 ячеек с убывающими объёмами и долями
 * воздуха; фильтросы (диффузоры) двумя группами пристенно, при большой
 * ширине — тремя (2 пристенно + 1 посредине).
 *
 * Что задаёт расчёт: уплотнённый ил из илоуплотнителя (Q_up, м³/сут,
 * влажность 98,2 / 97,3 % — не более 98,2 % по п. 6.372); время
 * стабилизации 5,5 сут при 18 °C (п. 6.373, строка «смесь первичного
 * осадка и уплотнённого активного ила» — принята для уплотнённого
 * избыточного ила как ближайшая); воздух 1–2 м³/ч на 1 м³ (п. 6.375)
 * при интенсивности не менее 6 м³/(м²·ч) (п. 6.373).
 *
 * Конструктив — всегда монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026): толщины стен и днища, борт и рабочая
 * глубина берутся только оттуда, по расходу не ветвятся.
 *
 * Величины, не нормируемые ҚМҚ 2.04.03-19 (минимальная длина ячейки,
 * борт), помечены как принятые.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { AEROTANK, SLUDGE, kmkRef } from "../../norms/kmk-2-04-03-19";
import { thickenerDefaults, thickenerGeometry } from "./thickener";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type StabilizerParams = {
  /** продолжительность стабилизации при 18 °C, сут (п. 6.373) */
  days: number;
  /** число секций (линий), ≥ 2 (п. 6.373) */
  sections: number;
  /** число ячеек в секции, 0 — по объёму (4–8, табл. 68) */
  cells: number;
  /** рабочая глубина, м — из construction() (п. 6.150: 3–6 м) */
  waterDepthM: number;
  /** ширина коридора в свету, мм — 1:1 к глубине, нижняя граница п. 6.150 */
  corridorMm: number;
  /** минимальная длина ячейки, мм — принято по практике (ряд диффузоров + доступ) */
  minCellMm: number;
  /** удельный расход воздуха, м³/ч на м³ (1–2 по п. 6.375) */
  airPerM3: number;
  /** борт над водой, м */
  freeboardM: number;
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  topAboveGroundM: number;
};

export function stabilizerDefaults(input: DrawingInput): StabilizerParams {
  const c = construction(undefined, true); // аэрируемое сооружение — глубина по п. 6.150
  void input;
  return {
    days: SLUDGE.aerobicStabilization.daysAt18C.primaryPlusThickenedExcess,
    sections: SLUDGE.aerobicStabilization.minUnits,
    cells: 0,
    waterDepthM: c.waterDepthM,
    /* ширина коридора равна глубине — нижняя граница 1:1…2:1 по п. 6.150 */
    corridorMm: c.waterDepthM * 1000,
    minCellMm: 1200,
    airPerM3: 1.5,
    freeboardM: c.freeboardM,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    topAboveGroundM: c.topAboveGroundM,
  };
}

/** табл. 68 — середины диапазонов объёмов и воздуха по ячейкам (%), нормируются на фактическое число ячеек */
const TABLE_68_VOL = [30, 16, 11, 11, 9, 9, 9, 9];
const TABLE_68_AIR = [37.5, 27.5, 12.5, 8, 5, 5, 5, 5];

export type StabilizerGeometry = {
  qIn: number; // м³/сут уплотнённого ила
  moistureIn: number;
  vNeed: number; // м³ всего
  sections: number;
  cells: number;
  B: number;
  L: number; // длина секции в свету
  cellL: number[]; // длины ячеек
  volShare: number[];
  airShare: number[];
  Hw: number;
  Htot: number;
  wall: number;
  W: number; // габарит поперёк
  Lout: number;
  vUnit: number; // фактический объём секции
  air: number; // м³/ч всего
  airIntensity: number; // м³/(м²·ч)
  diffuserRows: number;
  bottom: number;
  water: number;
  top: number;
};

export function stabilizerGeometry(input: DrawingInput, p: StabilizerParams): StabilizerGeometry {
  const tg = thickenerGeometry(input, thickenerDefaults(input));
  const qIn = tg.qUp;
  const moistureIn = tg.moistureOut;
  const vNeed = qIn * p.days;
  const sections = Math.max(SLUDGE.aerobicStabilization.minUnits, Math.round(p.sections));
  const vSec = vNeed / sections;
  const Hw = p.waterDepthM * 1000;
  const B = roundTo(p.corridorMm, 100);
  /* число ячеек 4–8 (табл. 68): по длине секции, чтобы ячейка была не короче ~1,8 м (практика) */
  const lByVol = (vSec * 1e9) / (B * Hw);
  const cells = p.cells > 0 ? Math.min(8, Math.max(4, p.cells)) : Math.min(8, Math.max(4, Math.floor(lByVol / 1800)));
  const volRaw = TABLE_68_VOL.slice(0, cells);
  const volSum = volRaw.reduce((a, b) => a + b, 0);
  const volShare = volRaw.map((v) => v / volSum);
  const airRaw = TABLE_68_AIR.slice(0, cells);
  const airSum = airRaw.reduce((a, b) => a + b, 0);
  const airShare = airRaw.map((v) => v / airSum);
  /* длина секции: по объёму, но каждая ячейка не короче minCell */
  const Lvol = roundTo((vSec * 1e9) / (B * Hw), 100);
  const Ltarget = Math.max(Lvol, cells * p.minCellMm);
  const cellL = volShare.map((s) => Math.max(p.minCellMm, roundTo(Ltarget * s, 100)));
  /* короткие ячейки добраны до минимума — ужимаем самые длинные, чтобы не раздувать объём */
  for (let guard = 0; guard < 200 && cellL.reduce((a, b) => a + b, 0) > Ltarget; guard++) {
    let iMax = 0;
    for (let i = 1; i < cells; i++) if (cellL[i] > cellL[iMax]) iMax = i;
    if (cellL[iMax] - 100 < p.minCellMm) break;
    cellL[iMax] -= 100;
  }
  const L = cellL.reduce((a, b) => a + b, 0);
  const vUnit = (B * L * Hw) / 1e9;
  const area = (B * L) / 1e6;
  const airByVol = p.airPerM3 * vUnit;
  const airByInt = SLUDGE.aerobicStabilization.aerationIntensityMin * area;
  const airSec = Math.max(airByVol, airByInt);
  const wall = p.wallMm;
  const top = p.topAboveGroundM;
  const water = top - p.freeboardM;
  return {
    qIn, moistureIn, vNeed, sections, cells, B, L, cellL, volShare, airShare,
    Hw, Htot: Hw + p.freeboardM * 1000, wall,
    W: sections * B + (sections + 1) * wall,
    Lout: L + 2 * wall,
    vUnit,
    air: airSec * sections,
    airIntensity: airSec / area,
    diffuserRows: B >= 5000 ? 3 : 2,
    bottom: water - p.waterDepthM, water, top,
  };
}

function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function stabilizerScale(input: DrawingInput, overrides: Partial<StabilizerParams> = {}): number {
  const g = stabilizerGeometry(input, { ...stabilizerDefaults(input), ...overrides });
  return fitScale(g.Lout, g.W, g.Htot + 400);
}

export function stabilizerModel(input: DrawingInput, overrides: Partial<StabilizerParams> = {}): StructureModel {
  const p = { ...stabilizerDefaults(input), ...overrides };
  const g = stabilizerGeometry(input, p);
  const c = construction(undefined, true);
  const cv = concreteVolume(c, { shape: "rect", w: g.W, l: g.Lout }, g.Htot);
  /* внутренние стены: продольные между секциями + поперечные перегородки ячеек */
  const vInner =
    ((g.L * g.wall * g.Htot) / 1e9) * (g.sections - 1) +
    ((g.B * g.wall * g.Htot) / 1e9) * g.sections * (g.cells - 1);
  const a = SLUDGE.aerobicStabilization;
  const qInH = g.qIn / 24;
  const dnSl = Math.max(100, dnFor(qInH * 4)); // подача ила периодически насосом — 4-кратный среднечасовой (практика)
  const dnAir = dnForAir(g.air);
  const model: StructureModel = {
    id: "stabilizer",
    kind: "stabilizer",
    name: "Аэробный стабилизатор ила",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.W, l: g.Lout },
    bottom: g.bottom,
    water: g.water,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "sludge", dn: dnSl, side: "W", pos: g.W / 2, elev: g.water + 0.1 },
      { role: "sludge", dn: dnSl, side: "E", pos: g.W / 2, elev: g.bottom + 0.3 },
      { role: "out", dn: Math.max(100, dnFor(qInH * 4)), side: "E", pos: g.wall + g.B / 2, elev: g.water - 0.5 },
      { role: "air", dn: dnAir, side: "N", pos: g.wall + g.cellL[0] / 2, elev: g.top + 0.3 },
      { role: "drain", dn: 100, side: "S", pos: g.Lout - 1000, elev: g.bottom },
    ],
    volumes: [
      ...g.cellL.map((l, i) => ({ name: `Ячейка ${i + 1} (1 секция), ${((l / g.L) * 100).toFixed(0)} % (табл. 68: ${(g.volShare[i] * 100).toFixed(0)} %)`, m3: (g.B * l * g.Hw) / 1e9 })),
      { name: `Итого ${g.sections} секции`, m3: g.vUnit * g.sections },
      { name: `Требуемый объём (${g.qIn.toFixed(1)} м³/сут × ${p.days} сут)`, m3: g.vNeed },
      { name: "Бетон стен наружных", m3: cv.walls },
      { name: "Бетон стен внутренних (перегородки секций и ячеек)", m3: vInner },
      { name: "Бетон днища", m3: cv.slab },
      { name: "Бетонная подготовка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total + vInner },
      { name: "Арматура, кг", m3: (cv.total + vInner) * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Резервуар железобетонный монолитный с перегородками ячеек", qty: `${g.sections} секции`, spec: `${g.B}×${g.L}×${g.Htot} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Аэрационная система (диффузоры пристенно)", qty: `${g.sections * g.diffuserRows} ряда`, spec: `${g.air.toFixed(0)} м³/ч, ${g.airIntensity.toFixed(1)} м³/(м²·ч)`, supply: "supply" },
      { name: "Регулирующие заслонки воздуха по ячейкам", qty: `${g.sections * g.cells} шт.`, supply: "supply" },
      { name: "Декантер иловой воды (поворотный патрубок)", qty: `${g.sections} шт.`, supply: "own" },
      { name: "Площадки обслуживания, лотки и трубопроводная обвязка", qty: "комплект", spec: "металлоконструкции", supply: "own" },
      { name: "Насосы подачи стабилизированного ила на обезвоживание", qty: "1+1", spec: `${(qInH * 4).toFixed(1)} м³/ч`, supply: "supply" },
    ],
    basis: [
      constructionNote(c),
      `Уплотнённый ил ${g.qIn.toFixed(1)} м³/сут влажностью ${g.moistureIn} % (≤ ${a.inletMoistureMax} % по ${kmkRef("6.372")}); продолжительность стабилизации ${p.days} сут при 18 °C (${a.ref}; строка «смесь первичного осадка и уплотнённого ила» принята как ближайшая, температурная поправка не применена).`,
      `Объём ${g.vNeed.toFixed(1)} м³; ${g.sections} секции (не менее двух — ${kmkRef("6.373")}) по ${g.cells} ячеек, объёмы ячеек по табл. 68 (${g.volShare.map((s) => (s * 100).toFixed(0)).join("/")} %); принято ${g.sections}×${g.vUnit.toFixed(1)} м³${g.vUnit * g.sections > g.vNeed * 1.15 ? " (запас из-за минимальной длины ячейки)" : ""}.`,
      ...(g.vUnit * g.sections > g.vNeed * 1.3
        ? [
            `Строительный объём ${(g.vUnit * g.sections).toFixed(1)} м³ превышает требуемый ${g.vNeed.toFixed(1)} м³ в ${((g.vUnit * g.sections) / g.vNeed).toFixed(1)} раза: при глубине ${p.waterDepthM} м ширина коридора не может быть меньше ${g.B} мм (нижняя граница 1:1 по ${AEROTANK.depthM.ref}), а длина секции — меньше ${g.cells}×${p.minCellMm} мм (минимальная длина ячейки, практика). Уменьшить объём можно только снижением глубины в пределах 3–6 м на странице «Допущения»; технологически запас не вреден (увеличивается возраст ила).`,
          ]
        : []),
      `Воздух ${g.air.toFixed(0)} м³/ч: ${p.airPerM3} м³/ч на м³ (${kmkRef("6.375")}: 1–2) и не менее ${a.aerationIntensityMin} м³/(м²·ч) (${kmkRef("6.373")}) — принята большая величина, ${g.airIntensity.toFixed(1)} м³/(м²·ч); распределение по ячейкам ${g.airShare.map((s) => (s * 100).toFixed(0)).join("/")} % (табл. 68).`,
      `Диффузоры ${g.diffuserRows === 2 ? "двумя группами пристенно" : "тремя группами: две пристенно, одна посредине"} (${kmkRef("6.373")}); индивидуальное регулирование воздуха по ячейкам.`,
      `Глубина ${p.waterDepthM} м (${AEROTANK.depthM.ref}: 3–6 м), коридор ${g.B} мм — отношение ширины к глубине ${(g.B / g.Hw).toFixed(2)}:1 в пределах 1:1…2:1 (${AEROTANK.depthM.ref}); минимальная длина ячейки ${p.minCellMm} мм и борт ${p.freeboardM} м — принято по практике.`,
    ],
    headLoss: Math.round(g.cells * 0.05 * 100) / 100,
    draw: (sheet) => drawStabilizer(sheet, input, p, g),
  };
  return model;
}

function dnFor(qM3H: number): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / 1.0 / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

/** воздуховод при 12 м/с (практика; п. 5.33 — до 40 м/с в трубопроводах) */
function dnForAir(qM3H: number): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / 12 / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500];
  return row.find((x) => x >= d) ?? 500;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawStabilizer(sheet: Sheet, input: DrawingInput, p: StabilizerParams, g: StabilizerGeometry) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.W;
  sheet.viewTitle(px, py + g.W + sheet.p(16), "ПЛАН");
  d.rect(px, py, g.Lout, g.W, "CONTOUR");
  const hatchW = (x: number, y: number, w: number, h: number) => {
    d.concrete([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], sheet.p(1.5));
  };
  hatchW(px, py, g.Lout, g.wall);
  hatchW(px, py + g.W - g.wall, g.Lout, g.wall);
  hatchW(px, py, g.wall, g.W);
  hatchW(px + g.Lout - g.wall, py, g.wall, g.W);
  for (let i = 0; i < g.sections; i++) {
    const y0 = py + g.wall + i * (g.B + g.wall);
    d.rect(px + g.wall, y0, g.L, g.B, "CONTOUR");
    if (i > 0) hatchW(px, y0 - g.wall, g.Lout, g.wall);
    /* перегородки ячеек с водосливами */
    let x = px + g.wall;
    for (let c = 0; c < g.cells; c++) {
      const x1 = x + g.cellL[c];
      if (c < g.cells - 1) {
        d.line(x1, y0, x1, y0 + g.B, "CONTOUR");
        /* водослив — окно в верхней части перегородки, чередуем сторону */
        const ya = c % 2 === 0 ? y0 + g.B - 600 : y0 + 200;
        d.line(x1 - 60, ya, x1 - 60, ya + 400, "HIDDEN");
        d.line(x1 + 60, ya, x1 + 60, ya + 400, "HIDDEN");
      }
      /* диффузоры пристенно: ряды вдоль длинных стен */
      const rows = g.diffuserRows;
      for (let r = 0; r < rows; r++) {
        const yr = rows === 2 ? (r === 0 ? y0 + 400 : y0 + g.B - 400) : y0 + 400 + (r * (g.B - 800)) / 2;
        d.line(x + 200, yr, x1 - 200, yr, "PIPE");
        const n = Math.max(2, Math.floor((g.cellL[c] - 400) / 600));
        for (let k = 0; k < n; k++) d.circle(x + 200 + ((k + 0.5) * (g.cellL[c] - 400)) / n, yr, 90, "EQUIP");
      }
      /* подпись ячейки */
      d.text((x + x1) / 2, y0 + g.B / 2 + ts * 0.3, ts, `ЯЧ.${c + 1}`, { align: "center" });
      d.text((x + x1) / 2, y0 + g.B / 2 - ts * 1.2, ts * 0.8, `V ${((g.cellL[c] / g.L) * 100).toFixed(0)}% / ВОЗД. ${(g.airShare[c] * 100).toFixed(0)}%`, { align: "center" });
      x = x1;
    }
    d.text(px - sheet.p(2), y0 + g.B / 2, ts, `СЕКЦИЯ ${i + 1}`, { align: "right" });
  }
  /* воздуховод вдоль северной стены с отводами в ячейки */
  const yAir = py + g.W + sheet.p(6);
  d.line(px, yAir, px + g.Lout, yAir, "PIPE");
  {
    let x = px + g.wall;
    for (let c = 0; c < g.cells; c++) {
      const xm = x + g.cellL[c] / 2;
      d.line(xm, yAir, xm, py + g.W, "PIPE");
      d.rect(xm - 120, yAir - 250, 240, 250, "EQUIP");
      x += g.cellL[c];
    }
  }
  d.text(px + g.Lout / 2, yAir + th * 0.5, ts, `ВОЗДУХОВОД DN${dnForAir(g.air)} — ${g.air.toFixed(0)} м³/ч, ЗАСЛОНКИ ПО ЯЧЕЙКАМ`, { align: "center" });
  /* потоки */
  d.arrow(px - sheet.p(16), py + g.W / 2 + th, px, py + g.W / 2 + th, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), py + g.W / 2 + th * 1.9, ts, "УПЛОТНЁННЫЙ ИЛ", { align: "right" });
  d.arrow(px + g.Lout, py + g.W / 2, px + g.Lout + sheet.p(16), py + g.W / 2, "FLOW", sheet.p(2));
  d.text(px + g.Lout + sheet.p(2), py + g.W / 2 + th * 0.8, ts, "СТАБИЛИЗИРОВАННЫЙ ИЛ НА ОБЕЗВОЖИВАНИЕ", { align: "left" });
  d.text(px + g.Lout + sheet.p(2), py + g.W / 2 - th * 1.2, ts * 0.9, "ИЛОВАЯ ВОДА (ДЕКАНТ) В ГОЛОВУ БИООЧИСТКИ", { align: "left" });

  /* размеры плана */
  const yd = py - sheet.p(22);
  const xs = [px, px + g.wall];
  let xx = px + g.wall;
  for (const l of g.cellL) { xx += l; xs.push(xx); }
  xs.push(px + g.Lout);
  d.dimChainH(xs, yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(9), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(60);
  const ys = [py];
  for (let i = 0; i < g.sections; i++) { ys.push(py + g.wall + i * (g.B + g.wall), py + g.wall + i * (g.B + g.wall) + g.B); }
  ys.push(py + g.W);
  d.dimChainV(xd, Array.from(new Set(ys)).sort((a, b) => a - b), th);
  d.dimV(xd + sheet.p(9), py, py + g.W, `${g.W}`, th);
  /* марки разрезов */
  d.sectionMark(px - sheet.p(6), py + g.wall + g.B / 2 - th * 1.5, px + g.Lout + sheet.p(6), py + g.wall + g.B / 2 - th * 1.5, "1", th, -1);
  const x22 = px + g.wall + g.cellL[0] / 2 + th * 3;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.W + sheet.p(12), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const slab = p.slabMm;
  const sy = py - sheet.p(45) - g.Htot - slab - 500;
  sheet.viewTitle(px, sy + g.Htot + slab + 500 + sheet.p(10), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, g, slab);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const cx = px + g.Lout + sheet.p(85);
  sheet.viewTitle(cx, sy + g.Htot + slab + 500 + sheet.p(10), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, sy, g, slab);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lout + sheet.p(85);
  const avail = f.x0 + f.w - sheet.p(10) - isoLeft;
  const k = Math.min(0.5, avail / ((g.Lout + g.W) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.W * k * Math.cos(Math.PI / 6);
  const isoH = (g.Htot + slab) * k + (g.Lout + g.W) * k * 0.5;
  const iy = py + g.W - isoH;
  sheet.viewTitle(isoLeft, py + g.W + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k);

  sheet.note(`Аэробный стабилизатор: ${g.sections} секции ${g.B}×${g.L} мм в свету по ${g.cells} ячеек (табл. 68), глубина ${p.waterDepthM} м; объём ${g.sections}×${g.vUnit.toFixed(1)} м³ при требуемых ${g.vNeed.toFixed(1)} м³ (${g.qIn.toFixed(1)} м³/сут × ${p.days} сут, п. 6.373).`);
  sheet.note(`Воздух ${g.air.toFixed(0)} м³/ч (интенсивность ${g.airIntensity.toFixed(1)} м³/(м²·ч) ≥ 6 по п. 6.373; ${(g.air / (g.vUnit * g.sections)).toFixed(1)} м³/ч на м³ по п. 6.375) от общей воздуходувной станции; распределение по ячейкам ${g.airShare.map((s) => (s * 100).toFixed(0)).join("/")} %.`);
  sheet.note(`Отметки: дно ${fmtE(g.bottom)}, вода ${fmtE(g.water)}, верх борта ${fmtE(g.top)}. Иловая вода отводится декантером после остановки аэрации в голову биологической очистки.`);
  sheet.note(`Резервуар железобетонный монолитный: стены ${g.wall} мм, днище ${p.slabMm} мм, бетон ${construction(undefined, true).concreteGrade}; диффузоры, заслонки и насосы — покупное оборудование; декантеры, площадки и обвязка — изготовление SUVSANOAT.`);
  sheet.legend([
    { layer: "CONTOUR", text: "стены и перегородки" },
    { layer: "HATCH", text: "железобетон" },
    { layer: "WATER", text: "расчётный уровень воды" },
    { layer: "PIPE", text: "воздуховоды, трубопроводы" },
    { layer: "EQUIP", text: "диффузоры, заслонки" },
  ]);
  void input;
}

function sectionLong(sheet: Sheet, x: number, y: number, g: StabilizerGeometry, slab: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const yb = y + slab, yt = yb + g.Htot, yw = yb + g.Hw;
  const groundY = yb - g.bottom * 1000;
  const poly: Pt[] = [[x, y], [x + g.Lout, y], [x + g.Lout, yt], [x + g.Lout - g.wall, yt], [x + g.Lout - g.wall, yb], [x + g.wall, yb], [x + g.wall, yt], [x, yt]];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* перегородки с водосливами: перегородка до верха, окно у уровня воды */
  let xx = x + g.wall;
  for (let c = 0; c < g.cells; c++) {
    const x1 = xx + g.cellL[c];
    if (c < g.cells - 1) {
      d.rect(x1 - g.wall / 2, yb, g.wall, g.Htot, "CONTOUR");
      d.rect(x1 - g.wall / 2 - 40, yw - 250, g.wall + 80, 400, "HIDDEN");
      d.arrow(x1 - 300, yw + 60, x1 + 300, yw + 60, "FLOW", 100);
    }
    /* диффузоры и стояк */
    const n = Math.max(2, Math.floor((g.cellL[c] - 400) / 600));
    for (let k = 0; k < n; k++) d.rect(xx + 200 + ((k + 0.5) * (g.cellL[c] - 400)) / n - 90, yb, 180, 100, "EQUIP");
    d.line(xx + 200, yb + 100, x1 - 200, yb + 100, "PIPE");
    d.line(x1 - 200, yb + 100, x1 - 200, yt + 300, "PIPE");
    d.rect(x1 - 300, yt + 300, 200, 200, "EQUIP");
    d.text((xx + x1) / 2, yb + g.Hw * 0.5, ts, `ЯЧ.${c + 1}`, { align: "center" });
    xx = x1;
  }
  d.line(x - sheet.p(4), yt + 500, x + g.Lout, yt + 500, "PIPE");
  d.text(x + g.Lout / 2, yt + 500 + th * 0.4, ts, `ВОЗДУХОВОД DN${dnForAir(g.air)}`, { align: "center" });
  d.line(x + g.wall, yw, x + g.Lout - g.wall, yw, "WATER");
  d.waterLevel(x + g.wall + 600, yw, undefined, th);
  /* подача ила слева, выпуск справа */
  d.line(x - sheet.p(12), yw + 100, x + g.wall, yw + 100, "PIPE");
  d.arrow(x - sheet.p(18), yw + 100, x - sheet.p(12), yw + 100, "FLOW", sheet.p(2));
  d.text(x - sheet.p(2), yw + 100 - th * 1.6, ts, "ПОДАЧА ИЛА", { align: "right" });
  d.line(x + g.Lout - g.wall, yb + 300, x + g.Lout + sheet.p(10), yb + 300, "PIPE");
  d.arrow(x + g.Lout + sheet.p(10), yb + 300, x + g.Lout + sheet.p(16), yb + 300, "FLOW", sheet.p(2));
  d.text(x + g.Lout + sheet.p(2), yb + 300 + th * 0.8, ts, "ИЛ НА ОБЕЗВОЖИВАНИЕ", { align: "left" });
  /* декантер: поворотный патрубок у уровня воды */
  d.line(x + g.Lout - g.wall - 600, yw - 500, x + g.Lout + sheet.p(10), yw - 500, "PIPE");
  d.line(x + g.Lout - g.wall - 600, yw - 500, x + g.Lout - g.wall - 600, yw - 150, "PIPE");
  d.text(x + g.Lout + sheet.p(2), yw - 500 + th * 0.8, ts, "ИЛОВАЯ ВОДА (ДЕКАНТ)", { align: "left" });
  /* земля, отметки, размеры */
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(14), groundY, "0.000", th, 1);
  d.elevMark(x + g.Lout + sheet.p(20), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + g.Lout + sheet.p(20), yw, fmtE(g.water), th, 1);
  d.elevMark(x + g.Lout + sheet.p(20), yt, fmtE(g.top), th, 1);
  d.dimChainV(x - sheet.p(22), [y, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
  const xs = [x, x + g.wall];
  let cx = x + g.wall;
  for (const l of g.cellL) { cx += l; xs.push(cx); }
  xs.push(x + g.Lout);
  d.dimChainH(xs, y - sheet.p(10), th);
}

function sectionCross(sheet: Sheet, x: number, y: number, g: StabilizerGeometry, slab: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const yb = y + slab, yt = yb + g.Htot, yw = yb + g.Hw;
  const groundY = yb - g.bottom * 1000;
  const W = g.W;
  const poly: Pt[] = [[x, y], [x + W, y], [x + W, yt], [x + W - g.wall, yt], [x + W - g.wall, yb], [x + g.wall, yb], [x + g.wall, yt], [x, yt]];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  for (let i = 1; i < g.sections; i++) {
    const xm = x + g.wall + i * (g.B + g.wall) - g.wall;
    d.rect(xm, yb, g.wall, g.Htot, "CONTOUR");
    d.concrete([[xm, yb], [xm + g.wall, yb], [xm + g.wall, yt], [xm, yt]], sheet.p(1.5));
  }
  for (let i = 0; i < g.sections; i++) {
    const x0 = x + g.wall + i * (g.B + g.wall);
    d.line(x0, yw, x0 + g.B, yw, "WATER");
    const rows = g.diffuserRows;
    for (let r = 0; r < rows; r++) {
      const xr = rows === 2 ? (r === 0 ? x0 + 400 : x0 + g.B - 400) : x0 + 400 + (r * (g.B - 800)) / 2;
      d.circle(xr, yb + 100, 90, "EQUIP");
      d.line(xr, yb + 100, xr, yt + 300, "PIPE");
    }
    d.line(x0 + 400, yt + 300, x0 + g.B - 400, yt + 300, "PIPE");
    d.text(x0 + g.B / 2, yb + g.Hw * 0.5, ts, `СЕКЦИЯ ${i + 1}`, { align: "center" });
  }
  d.line(x - sheet.p(6), yt + 500, x + W + sheet.p(6), yt + 500, "PIPE");
  d.text(x + W / 2, yt + 500 + th * 0.4, ts, `ВОЗДУХОВОД DN${dnForAir(g.air)}`, { align: "center" });
  d.waterLevel(x + g.wall + g.B * 0.3, yw, undefined, th);
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(14), groundY, "0.000", th, -1);
  d.elevMark(x + W + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + W + sheet.p(8), yw, fmtE(g.water), th, 1);
  const xs = [x];
  for (let i = 0; i < g.sections; i++) xs.push(x + g.wall + i * (g.B + g.wall), x + g.wall + i * (g.B + g.wall) + g.B);
  xs.push(x + W);
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), y - sheet.p(10), th);
  d.dimChainV(x - sheet.p(22), [y, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
}

function isoView(sheet: Sheet, ox: number, oy: number, g: StabilizerGeometry, k: number) {
  const d = sheet.d;
  const L = g.Lout * k, W = g.W * k, H = (g.Htot + 350) * k;
  d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
  const wall = g.wall * k;
  for (let i = 1; i < g.sections; i++) {
    const ym = (g.wall + i * (g.B + g.wall) - g.wall) * k;
    d.isoLine([wall, ym, H], [L - wall, ym, H], ox, oy, "CONTOUR");
    d.isoLine([wall, ym + wall, H], [L - wall, ym + wall, H], ox, oy, "CONTOUR");
  }
  let xx = g.wall;
  for (let c = 0; c < g.cells - 1; c++) {
    xx += g.cellL[c];
    d.isoLine([xx * k, wall, H], [xx * k, W - wall, H], ox, oy, "CONTOUR");
  }
  d.isoLine([wall, wall, H], [L - wall, wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, wall, H], [L - wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, W - wall, H], [wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([wall, W - wall, H], [wall, wall, H], ox, oy, "THIN");
  /* воздуховод вдоль дальней стены */
  d.isoLine([0, W + 300 * k, H + 200 * k], [L, W + 300 * k, H + 200 * k], ox, oy, "PIPE");
  d.isoLine([-sheet.p(8), W / 2, H + 100 * k], [0, W / 2, H + 100 * k], ox, oy, "FLOW");
}
