/* ==================================================================
 * КОНТАКТНЫЙ РЕЗЕРВУАР (ХЛОРИРОВАНИЕ) — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Нужен только при обеззараживании хлором (гипохлоритом): при УФ
 * контакт не требуется. Включается флагом overrides.enabled (по
 * умолчанию выключен — базовая схема с УФ), см. contactRequired().
 *
 * По ҚМҚ 2.04.03-19:
 *   п. 6.235 — продолжительность контакта 30 мин при максимальном
 *              часовом расходе;
 *   п. 6.236 — резервуары как первичные отстойники без скребков,
 *              не менее двух; барботаж 0,5 м³/(м²·ч);
 *   п. 6.238 — осадок 0,5 л/м³ (после биологической очистки) при 98 %;
 *   п. 6.230 — доза активного хлора 3 г/м³ после полной биологической
 *              очистки; хлорное хозяйство на 1,5-кратную дозу;
 *   п. 6.69  — борт над водой не менее 0,3 м; п. 6.68 — иловая труба ≥ 200.
 * Конструктив — всегда монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026). Рабочая глубина берётся оттуда, но
 * ограничена сверху 4,0 м — верхней границей табл. 31 для горизонтальных
 * отстойников (резервуар конструируется как отстойник, п. 6.236).
 * По практике: продольная перегородка (два коридора, змеевик) против
 * проскока, реагент — гипохлорит натрия 12 % с дозирующими насосами.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { DISINFECTION, PRIMARY_SETTLING, kmkRef } from "../../norms/kmk-2-04-03-19";
import { dnFor } from "./mbr";
import { dnForAir } from "./equal";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type ContactParams = {
  /** контактный резервуар нужен (хлорирование); по умолчанию нет — УФ */
  enabled: boolean;
  /** время контакта, мин (п. 6.235) */
  contactMin: number;
  /** число секций (п. 6.236: не менее двух) */
  sections: number;
  /** глубина воды, м — практика в пределах табл. 31 */
  waterDepthM: number;
  /** борт, м (п. 6.69: ≥ 0,3) */
  freeboardM: number;
  /** коридоров в секции (продольная перегородка) — практика */
  channels: number;
  /** соотношение длины коридора к его ширине — практика */
  ratio: number;
  /** барботаж, м³/(м²·ч) (п. 6.236) */
  aerationM3M2H: number;
  /** доза активного хлора, г/м³ (п. 6.230) */
  doseGm3: number;
  /** запас производительности хлорного хозяйства (п. 6.230: ×1,5) */
  storageFactor: number;
  /** концентрация гипохлорита, % акт. хлора; запас реагента, сут — практика */
  naoclPct: number;
  reagentDays: number;
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  topAboveGroundM: number;
};

export function contactDefaults(input: DrawingInput): ContactParams {
  const c = construction();
  void input;
  return {
    enabled: false,
    contactMin: DISINFECTION.contactMinutes.value,
    sections: DISINFECTION.contactTanksMin.value,
    /* глубина из construction(), но не выше 4,0 м — верх диапазона табл. 31 */
    waterDepthM: Math.min(c.waterDepthM, PRIMARY_SETTLING.table31.horizontal.hSetM[1]),
    freeboardM: Math.max(c.freeboardM, PRIMARY_SETTLING.freeboardM.value),
    channels: 2,
    ratio: 4,
    aerationM3M2H: DISINFECTION.contactAeration.value,
    doseGm3: DISINFECTION.chlorineDose.afterBio,
    storageFactor: DISINFECTION.chlorineDose.storageFactor,
    naoclPct: 12,
    reagentDays: 30,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    topAboveGroundM: c.topAboveGroundM,
  };
}

/** нужен ли контактный резервуар: только при хлорировании (флаг) и наличии обеззараживания в цепочке */
export function contactRequired(input: DrawingInput, overrides: Partial<ContactParams> = {}): boolean {
  return input.chain.includes("disinfect") && (overrides.enabled ?? contactDefaults(input).enabled);
}

export type ContactGeometry = {
  required: boolean;
  n: number;
  channels: number;
  /** мм: коридор в свету b×L, секция B, глубина, высота стен, стена, лоток */
  b: number;
  L: number;
  B: number;
  Hw: number;
  Htot: number;
  wall: number;
  chan: number;
  W: number;
  Lout: number;
  /** приямок осадка на входе: длина, глубина, мм */
  hopperL: number;
  hopperH: number;
  /** расчёт */
  vRequired: number;
  vActual: number;
  areaM2: number;
  airM3H: number;
  sludgeM3Day: number;
  clKgDay: number;
  clKgDayDesign: number;
  naoclLDay: number;
  reagentTankM3: number;
  /** отметки */
  bottom: number;
  water: number;
  top: number;
  hopperBottom: number;
  inlet: number;
  outlet: number;
};

export function contactGeometry(input: DrawingInput, p: ContactParams): ContactGeometry {
  const n = Math.max(DISINFECTION.contactTanksMin.value, Math.round(p.sections));
  const vRequired = (input.qMaxH * p.contactMin) / 60;
  const vSection = vRequired / n;
  const area = vSection / p.waterDepthM; // м² секции
  const channels = Math.max(1, Math.round(p.channels));
  /* коридор b × L, L = ratio·b; площадь секции = channels·b·L */
  const b = Math.max(600, roundTo(Math.sqrt(area / (channels * p.ratio)) * 1000, 100));
  const L = roundTo((area * 1e6) / (channels * b), 100);
  const wall = p.wallMm;
  const B = channels * b + (channels - 1) * wall;
  const Hw = p.waterDepthM * 1000;
  const Htot = Hw + p.freeboardM * 1000;
  const chan = Math.max(500, roundTo(Math.sqrt(input.qMaxH / 3600 / 0.4) * 1000, 100));
  const W = n * B + (n + 1) * wall;
  const Lout = L + chan + 3 * wall;
  const hopperL = Math.min(1500, roundTo(L / 5, 100));
  const hopperH = 500;
  const areaM2 = (n * channels * b * L) / 1e6;
  const airM3H = areaM2 * p.aerationM3M2H;
  const sludgeM3Day = (input.q * DISINFECTION.contactSludgeLPerM3.afterBio) / 1000;
  const clKgDay = (input.q * p.doseGm3) / 1000;
  const clKgDayDesign = clKgDay * p.storageFactor;
  const naoclLDay = clKgDay / (p.naoclPct / 100) / 1.2; // л/сут товарного NaOCl (ρ ≈ 1,2 кг/л)
  const reagentTankM3 = [0.5, 1, 2, 3, 5, 10, 20].find((v) => v >= (naoclLDay * p.reagentDays) / 1000) ?? 20;
  const top = p.topAboveGroundM;
  const water = top - p.freeboardM;
  const bottom = water - p.waterDepthM;
  return {
    required: contactRequired(input, { enabled: p.enabled }),
    n, channels, b, L, B, Hw, Htot, wall, chan, W, Lout, hopperL, hopperH,
    vRequired, vActual: (n * channels * b * L * Hw) / 1e9, areaM2, airM3H, sludgeM3Day, clKgDay, clKgDayDesign, naoclLDay, reagentTankM3,
    bottom, water, top, hopperBottom: bottom - hopperH / 1000,
    inlet: water + 0.15,
    outlet: water - 0.15,
  };
}

function crossBeside(g: ContactGeometry, s: number): boolean {
  return (g.Lout + g.W) / s + 75 <= 600;
}

function fitScale(g: ContactGeometry, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return (
    row.find((s) => g.Lout / s <= 300 && (crossBeside(g, s) ? (g.W + sectH) / s <= 450 : (g.W + 2 * sectH) / s + 90 <= 520)) ??
    pickScale(g.Lout, sectH)
  );
}

export function contactScale(input: DrawingInput, overrides: Partial<ContactParams> = {}): number {
  const g = contactGeometry(input, { ...contactDefaults(input), ...overrides });
  return fitScale(g, g.Htot + g.hopperH + 1000);
}

export function contactModel(input: DrawingInput, overrides: Partial<ContactParams> = {}): StructureModel {
  const p = { ...contactDefaults(input), ...overrides };
  const g = contactGeometry(input, p);
  const c = construction();
  const cv = concreteVolume(c, { shape: "rect", w: g.W, l: g.Lout }, g.Htot);
  /* внутренние стены: поперечные между секциями + продольные перегородки коридоров */
  const vInner =
    ((g.Lout * g.wall * g.Htot) / 1e9) * (g.n - 1) +
    ((g.L * g.wall * g.Htot) / 1e9) * g.n * (g.channels - 1);
  const dn = dnFor(input.qMaxH);
  const dnAir = Math.max(50, dnForAir(g.airM3H));
  const model: StructureModel = {
    id: "contact",
    kind: "contact",
    name: g.required ? "Контактный резервуар" : "Контактный резервуар (не требуется — обеззараживание УФ)",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.W, l: g.Lout },
    bottom: g.bottom,
    water: g.water,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "in", dn, side: "W", pos: g.W / 2, elev: g.inlet },
      { role: "out", dn, side: "E", pos: g.W / 2, elev: g.outlet },
      { role: "air", dn: dnAir, side: "N", pos: g.Lout / 2, elev: g.top + 0.3 },
      { role: "sludge", dn: PRIMARY_SETTLING.sludgePipeMinMm.value, side: "S", pos: g.wall + g.chan + g.wall + g.hopperL / 2, elev: g.hopperBottom },
    ],
    volumes: [
      { name: `Требуемый объём (${p.contactMin} мин при qMaxH)`, m3: g.vRequired },
      { name: `Рабочий объём, ${g.n} секции`, m3: g.vActual },
      { name: "Осадок 98 %, м³/сут", m3: g.sludgeM3Day },
      { name: `Гипохлорит натрия ${p.naoclPct} %, л/сут`, m3: g.naoclLDay / 1000 },
      { name: "Бетон стен наружных", m3: cv.walls },
      { name: "Бетон стен внутренних (перегородки секций и коридоров)", m3: vInner },
      { name: "Бетон днища", m3: cv.slab },
      { name: "Бетонная подготовка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total + vInner },
      { name: "Арматура, кг", m3: (cv.total + vInner) * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Станция дозирования гипохлорита натрия (бак + насосы-дозаторы 1+1)", qty: "1 компл.", spec: `${g.clKgDay.toFixed(2)} кг акт. Cl/сут (расчётная производительность ×${p.storageFactor} — ${g.clKgDayDesign.toFixed(2)} кг/сут); бак ${g.reagentTankM3} м³ на ${p.reagentDays} сут`, supply: "supply" },
      { name: "Смеситель ввода реагента (в подводящий трубопровод)", qty: "1", spec: `DN${dn}`, supply: "own" },
      { name: "Барботёры перфорированные по дну коридоров", qty: `${g.n * g.channels} нити × ${(g.L / 1000).toFixed(1)} м`, spec: `${g.airM3H.toFixed(0)} м³/ч, DN${dnAir}`, supply: "own" },
      { name: "Опорожнение приямков осадка (эрлифт / погружной насос)", qty: `${g.n} шт.`, spec: `иловая труба DN${PRIMARY_SETTLING.sludgePipeMinMm.value}`, supply: "supply" },
      { name: "Водосливы выпускные, шиберы на входе секций", qty: `${g.n} компл.`, supply: "own" },
      { name: "Анализатор остаточного хлора на выходе", qty: "1", spec: `не менее ${DISINFECTION.chlorineDose.residualMin} мг/л`, supply: "supply" },
      { name: "Резервуар железобетонный монолитный с перегородками коридоров", qty: "1", spec: `${g.Lout}×${g.W}×${g.Htot} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Площадки обслуживания, лотки и трубопроводная обвязка", qty: "комплект", spec: "металлоконструкции", supply: "own" },
    ],
    basis: [
      constructionNote(c),
      g.required
        ? `Контактный резервуар предусмотрен: обеззараживание хлором (гипохлоритом), в цепочке «disinfect».`
        : `Контактный резервуар в базовой схеме не требуется — обеззараживание УФ (${DISINFECTION.uvAllowed.ref}); модель рассчитана на случай перехода на хлорирование (overrides.enabled).`,
      `Объём ${g.vRequired.toFixed(1)} м³ = ${input.qMaxH.toFixed(1)} м³/ч × ${p.contactMin} мин (${DISINFECTION.contactMinutes.ref}); секций ${g.n}, обе рабочие (${DISINFECTION.contactTanksMin.ref}) — по ${g.channels} коридора ${g.b}×${g.L} мм, глубина ${p.waterDepthM} м (в пределах ${PRIMARY_SETTLING.table31.ref}: 1,5–4 м; из construction() принято ${construction().waterDepthM} м и ограничено верхом диапазона), фактический объём ${g.vActual.toFixed(1)} м³.`,
      `Конструкция — как первичный отстойник без скребков (${DISINFECTION.contactTanksMin.ref}); барботаж ${p.aerationM3M2H} м³/(м²·ч) × ${g.areaM2.toFixed(1)} м² = ${g.airM3H.toFixed(0)} м³/ч (${DISINFECTION.contactAeration.ref}); борт ${p.freeboardM} м (${PRIMARY_SETTLING.freeboardM.ref}: ≥ 0,3).`,
      `Осадок ${DISINFECTION.contactSludgeLPerM3.afterBio} л/м³ при 98 % (${DISINFECTION.contactSludgeLPerM3.ref}) — ${g.sludgeM3Day.toFixed(2)} м³/сут; приямки на входе ${g.hopperL} мм глубиной ${g.hopperH} мм, иловая труба DN${PRIMARY_SETTLING.sludgePipeMinMm.value} (${PRIMARY_SETTLING.sludgePipeMinMm.ref}); удаление периодическое эрлифтом (практика).`,
      `Доза активного хлора ${p.doseGm3} г/м³ после полной биологической очистки (${DISINFECTION.chlorineDose.ref}) — ${g.clKgDay.toFixed(2)} кг/сут; хлорное хозяйство на ×${p.storageFactor} — ${g.clKgDayDesign.toFixed(2)} кг/сут (${DISINFECTION.chlorineDose.ref}); гипохлорит ${p.naoclPct} % — ${g.naoclLDay.toFixed(0)} л/сут, бак ${g.reagentTankM3} м³ на ${p.reagentDays} сут (реагент и запас — практика). Остаточный хлор ≥ ${DISINFECTION.chlorineDose.residualMin} мг/л.`,
      `Отметки: верх ${fmtE(g.top)}, вода ${fmtE(g.water)}, дно ${fmtE(g.bottom)}; потери 0,15 м — водослив и перегородки (практика).`,
    ],
    headLoss: 0.15,
    draw: (sheet) => drawContact(sheet, input, p, g),
  };
  return model;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawContact(sheet: Sheet, input: DrawingInput, p: ContactParams, g: ContactGeometry) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const dn = dnFor(input.qMaxH);
  const dnAir = Math.max(50, dnForAir(g.airM3H));
  const wall = g.wall;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.W;
  sheet.viewTitle(px, py + g.W + sheet.p(16), "ПЛАН");
  d.rect(px, py, g.Lout, g.W, "CONTOUR");
  const xc = px + wall, x0 = xc + g.chan + wall, xe = x0 + g.L;
  d.rect(xc, py + wall, g.chan, g.W - 2 * wall, "CONTOUR");
  d.text(xc + g.chan / 2, py + g.W / 2, ts * 0.8, "РАСПРЕДЕЛИТЕЛЬНЫЙ ЛОТОК", { align: "center", rot: 90 });
  const secY = (i: number) => py + wall + i * (g.B + wall);
  for (let i = 0; i < g.n; i++) {
    const y0 = secY(i);
    d.rect(x0, y0, g.L, g.B, "CONTOUR");
    /* продольная перегородка (змеевик): не доходит до выходного торца */
    for (let c = 1; c < g.channels; c++) {
      const yp = y0 + c * g.b + (c - 1) * wall;
      d.rect(x0, yp, g.L - Math.max(600, g.b), wall, "CONTOUR");
    }
    /* шибер входа в первый коридор */
    d.line(x0 - wall, y0 + g.b * 0.25, x0 - wall, y0 + g.b * 0.75, "HIDDEN");
    d.arrow(x0 - wall - 100, y0 + g.b / 2, x0 + 600, y0 + g.b / 2, "FLOW", 120);
    /* приямок осадка в начале первого коридора */
    d.rect(x0, y0, g.hopperL, g.b, "HIDDEN");
    d.line(x0, y0, x0 + g.hopperL, y0 + g.b, "HIDDEN");
    d.text(x0 + g.hopperL / 2, y0 + g.b + ts * 0.3, ts * 0.7, "ПРИЯМОК", { align: "center" });
    /* барботёры по коридорам */
    for (let c = 0; c < g.channels; c++) {
      const y = y0 + c * (g.b + wall) + g.b / 2;
      d.line(x0 + 300, y, xe - 300, y, "EQUIP");
      for (let x = x0 + 800; x < xe - 300; x += 1000) d.circle(x, y, 50, "EQUIP");
      d.line(xe - 300, y, xe - 300, y0 + g.B + (i === g.n - 1 ? wall + 200 : 0), "PIPE");
    }
    /* водослив на выходе последнего коридора */
    const yl = y0 + (g.channels - 1) * (g.b + wall);
    d.line(xe - 400, yl + 100, xe - 400, yl + g.b - 100, "EQUIP");
    d.line(xe - 350, yl + 100, xe - 350, yl + g.b - 100, "EQUIP");
    d.text(xe - 500, yl + g.b / 2, ts * 0.7, "ВОДОСЛИВ", { align: "center", rot: 90 });
    d.text(x0 + g.L / 2, y0 + g.B / 2 - ts * 0.4, ts * 0.85, `СЕКЦИЯ ${i + 1}`, { align: "center" });
    /* отвод из водослива в общий лоток на восточном торце */
    d.line(xe + wall, yl + g.b / 2, xe + wall + 300, yl + g.b / 2, "PIPE");
  }
  /* выходной коллектор и вход */
  const yOut = py + g.W / 2;
  const xk = xe + wall + 300;
  d.line(xk, secY(0) + (g.channels - 1) * (g.b + wall) + g.b / 2, xk, secY(g.n - 1) + (g.channels - 1) * (g.b + wall) + g.b / 2, "PIPE");
  d.line(xk, yOut, px + g.Lout + sheet.p(12), yOut, "PIPE");
  d.arrow(px + g.Lout + sheet.p(12), yOut, px + g.Lout + sheet.p(18), yOut, "FLOW", sheet.p(2));
  d.text(px + g.Lout + sheet.p(2), yOut - th * 1.2, ts, `НА ВЫПУСК DN${dn}`, { align: "left" });
  d.line(px - sheet.p(12), py + g.W / 2, xc + g.chan / 2, py + g.W / 2, "PIPE");
  d.arrow(px - sheet.p(18), py + g.W / 2, px - sheet.p(12), py + g.W / 2, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), py + g.W / 2 + th * 0.6, ts, `ОТ ДООЧИСТКИ DN${dn}`, { align: "right" });
  /* ввод реагента — смеситель на подводящей трубе */
  d.circle(px - sheet.p(9), py + g.W / 2, sheet.p(1.5), "EQUIP");
  d.line(px - sheet.p(9), py + g.W / 2 - sheet.p(1.5), px - sheet.p(9), py + g.W / 2 - sheet.p(6), "PIPE");
  d.text(px - sheet.p(9), py + g.W / 2 - sheet.p(8.5), ts * 0.75, "NaOCl", { align: "center" });
  /* воздушный коллектор */
  const ya = py + g.W + 200;
  d.line(xe - 300, ya, px + g.Lout + sheet.p(12), ya, "PIPE");
  d.text(px + g.Lout + sheet.p(2), ya + th * 0.6, ts * 0.85, `ВОЗДУХ DN${dnAir}`, { align: "left" });
  for (let i = 0; i < g.n - 1; i++) d.line(xe - 300, secY(i) + g.B, xe - 300, secY(i + 1), "HIDDEN");
  d.concrete([[px, py], [px + g.Lout, py], [px + g.Lout, py + wall], [px, py + wall]], sheet.p(1.5));
  d.concrete([[px, py + g.W - wall], [px + g.Lout, py + g.W - wall], [px + g.Lout, py + g.W], [px, py + g.W]], sheet.p(1.5));
  /* размеры и марки */
  const yd = py - sheet.p(10);
  d.dimChainH([px, xc, x0 - wall, x0, x0 + g.hopperL, xe, px + g.Lout], yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(10), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(45);
  const ys: number[] = [py];
  for (let i = 0; i < g.n; i++) for (let c = 0; c < g.channels; c++) ys.push(secY(i) + c * (g.b + wall), secY(i) + c * (g.b + wall) + g.b);
  ys.push(py + g.W);
  d.dimChainV(xd, Array.from(new Set(ys)).sort((a, b) => a - b), th);
  d.dimV(xd + sheet.p(10), py, py + g.W, `${g.W}`, th);
  const y11 = secY(0) + g.b / 2;
  d.sectionMark(px - sheet.p(6), y11, px + g.Lout + sheet.p(6), y11, "1", th, -1);
  const x22 = x0 + g.L * 0.6;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.W + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗЫ ---------------- */
  const slab = p.slabMm;
  const Hview = g.Htot + slab + g.hopperH + 700;
  const sy = yd - sheet.p(40) - Hview;
  sheet.viewTitle(px, sy + Hview + sheet.p(14), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, g, dn, p.slabMm);
  const beside = crossBeside(g, sheet.s);
  const cx = beside ? px + g.Lout + sheet.p(75) : px;
  const cy = beside ? sy : sy - sheet.p(50) - Hview;
  sheet.viewTitle(cx, cy + Hview + sheet.p(14), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, cy, g, dnAir, p.slabMm);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lout + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(8) - isoLeft;
  const k = Math.min(0.5, avail / ((g.Lout + g.W) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.W * k * Math.cos(Math.PI / 6);
  const isoH = (g.Lout + g.W) * k * 0.5 + (g.Htot + slab) * k;
  const iy = f.y0 + f.h - sheet.p(34) - isoH;
  sheet.viewTitle(isoLeft, f.y0 + f.h - sheet.p(24), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k, p.slabMm);

  sheet.note(`Контактный резервуар: ${g.n} секции по ${g.channels} коридора ${g.b}×${g.L} мм, глубина ${p.waterDepthM} м, борт ${p.freeboardM} м; объём ${g.vActual.toFixed(1)} м³ при требуемых ${g.vRequired.toFixed(1)} м³ (${p.contactMin} мин при qMaxH ${input.qMaxH.toFixed(1)} м³/ч, п. 6.235; секций ≥ 2 — п. 6.236).`);
  sheet.note(`Барботаж ${p.aerationM3M2H} м³/(м²·ч) (п. 6.236) — ${g.airM3H.toFixed(0)} м³/ч; осадок ${DISINFECTION.contactSludgeLPerM3.afterBio} л/м³ (п. 6.238) — ${g.sludgeM3Day.toFixed(2)} м³/сут, приямки на входе, иловая труба DN200 (п. 6.68).`);
  sheet.note(`Доза активного хлора ${p.doseGm3} г/м³ (п. 6.230) — ${g.clKgDay.toFixed(2)} кг/сут, хлорное хозяйство на ×${p.storageFactor}; гипохлорит ${p.naoclPct} % ${g.naoclLDay.toFixed(0)} л/сут, бак ${g.reagentTankM3} м³ (${p.reagentDays} сут — практика); ввод в подводящий трубопровод через смеситель.`);
  sheet.note(`Отметки: верх ${fmtE(g.top)}, вода ${fmtE(g.water)}, дно ${fmtE(g.bottom)}; резервуар железобетонный монолитный: стены ${g.wall} мм, днище ${p.slabMm} мм, бетон ${construction().concreteGrade}. ${g.required ? "" : "В базовой схеме с УФ резервуар не требуется — лист справочный."}`);
  sheet.legend([
    { layer: "CONTOUR", text: "стены и перегородки" },
    { layer: "HATCH", text: "железобетон" },
    { layer: "WATER", text: "расчётный уровень воды" },
    { layer: "EQUIP", text: "барботёры, водосливы, реагент" },
    { layer: "PIPE", text: "трубопроводы, воздуховоды" },
  ]);
}

function sectionLong(sheet: Sheet, x: number, y: number, g: ContactGeometry, dn: number, slabMm: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const wall = g.wall;
  const slab = slabMm;
  const y0 = y + g.hopperH;
  const yb = y0 + slab, yw = yb + g.Hw, yt = yb + g.Htot;
  const groundY = yb - g.bottom * 1000;
  const xc = x + wall, x0 = xc + g.chan + wall, xe = x0 + g.L;
  const hx = x0 + g.hopperL;
  const poly: Pt[] = [
    [x, y0], [x0 - wall, y0], [x0 - wall, y0 - g.hopperH], [hx + wall, y0 - g.hopperH], [hx + wall, y0], [x + g.Lout, y0],
    [x + g.Lout, yt], [xe + wall, yt], [xe + wall, yb], [hx, yb], [hx, yb - g.hopperH], [x0, yb - g.hopperH], [x0, yb + 0],
    [x0, yt], [x0 - wall, yt], [x0 - wall, yb + 300], [xc, yb + 300], [xc, yt], [x, yt],
  ];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* лоток и вход */
  d.line(xc, yw + 50, x0 - wall, yw + 50, "WATER");
  d.text(xc + g.chan / 2, yt + th * 0.5, ts * 0.8, "ЛОТОК", { align: "center" });
  d.line(x - sheet.p(12), yw + 150, xc + g.chan / 2, yw + 150, "PIPE");
  d.text(x - sheet.p(1), yw + 150 + th * 0.6, ts * 0.85, `ОТ ДООЧИСТКИ DN${dn}`, { align: "right" });
  /* шибер входа в коридор */
  d.rect(x0 - wall - 60, yb + 300, wall + 120, g.Hw * 0.5, "EQUIP");
  /* вода, барботёры, приямок */
  d.line(x0, yw, xe, yw, "WATER");
  d.waterLevel(x0 + g.L * 0.4, yw, undefined, th);
  d.line(hx + 200, yb + 150, xe - 300, yb + 150, "EQUIP");
  for (let xx = hx + 700; xx < xe - 300; xx += 1000) d.circle(xx, yb + 150, 50, "EQUIP");
  d.line(xe - 300, yb + 150, xe - 300, yt + 500, "PIPE");
  d.text(x0 + g.L / 2, yb + 150 + ts * 0.6, ts * 0.75, "БАРБОТЁРЫ", { align: "center" });
  d.text((x0 + hx) / 2, yb - g.hopperH - ts * 1.6, ts * 0.75, "ПРИЯМОК ОСАДКА", { align: "center" });
  /* иловая труба (эрлифт) из приямка */
  d.line((x0 + hx) / 2, yb - g.hopperH + 100, (x0 + hx) / 2, yt + 300, "PIPE");
  d.line((x0 + hx) / 2, yt + 300, x - sheet.p(6), yt + 300, "PIPE");
  d.text(x - sheet.p(5), yt + 300 + th * 0.5, ts * 0.75, "ОСАДОК DN200", { align: "right" });
  /* водослив на выходе и отвод */
  d.line(xe - 400, yb + 300, xe - 400, yw + 50, "EQUIP");
  d.line(xe + wall, yw - 150, x + g.Lout + sheet.p(12), yw - 150, "PIPE");
  d.text(x + g.Lout + sheet.p(1), yw - 150 - th * 1.2, ts * 0.85, `НА ВЫПУСК DN${dn}`, { align: "left" });
  /* грунт, отметки, размеры */
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(10), groundY, "0.000", th, -1);
  d.elevMark(x + g.Lout + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + g.Lout + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yt, fmtE(g.top), th, 1);
  d.dimChainV(x - sheet.p(20), [y0, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
  d.dimChainH([x, xc, x0 - wall, x0, hx, xe, x + g.Lout], y - sheet.p(10), th);
}

function sectionCross(sheet: Sheet, x: number, y: number, g: ContactGeometry, dnAir: number, slabMm: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const wall = g.wall;
  const slab = slabMm;
  const y0 = y + g.hopperH;
  const yb = y0 + slab, yw = yb + g.Hw, yt = yb + g.Htot;
  const groundY = yb - g.bottom * 1000;
  const W = g.W;
  const poly: Pt[] = [[x, y0], [x + W, y0], [x + W, yt], [x + W - wall, yt], [x + W - wall, yb], [x + wall, yb], [x + wall, yt], [x, yt]];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  for (let i = 0; i < g.n; i++) {
    const xs = x + wall + i * (g.B + wall);
    if (i > 0) {
      d.rect(xs - wall, yb, wall, g.Htot, "CONTOUR");
      d.concrete([[xs - wall, yb], [xs, yb], [xs, yt], [xs - wall, yt]], sheet.p(1.5));
    }
    for (let c = 0; c < g.channels; c++) {
      const xcc = xs + c * (g.b + wall);
      if (c > 0) d.rect(xcc - wall, yb, wall, g.Hw + 100, "CONTOUR");
      d.line(xcc, yw, xcc + g.b, yw, "WATER");
      d.circle(xcc + g.b / 2, yb + 150, 80, "EQUIP");
      d.line(xcc + g.b / 2, yb + 230, xcc + g.b / 2, yt + 500, "THIN");
      d.text(xcc + g.b / 2, yb + g.Hw * 0.5, ts * 0.75, `К${c + 1}`, { align: "center" });
    }
    d.text(xs + g.B / 2, yt + th * 0.5, ts * 0.8, `СЕКЦИЯ ${i + 1}`, { align: "center" });
  }
  d.line(x - sheet.p(6), yt + 500, x + W + sheet.p(6), yt + 500, "PIPE");
  d.text(x + W / 2, yt + 500 + th * 0.5, ts * 0.85, `ВОЗДУШНЫЙ КОЛЛЕКТОР DN${dnAir}`, { align: "center" });
  d.waterLevel(x + wall + g.b * 0.3, yw, undefined, th);
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(10), groundY, "0.000", th, -1);
  d.elevMark(x + W + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + W + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.elevMark(x + W + sheet.p(8), yt, fmtE(g.top), th, 1);
  const xs: number[] = [x];
  for (let i = 0; i < g.n; i++) for (let c = 0; c < g.channels; c++) {
    const xcc = x + wall + i * (g.B + wall) + c * (g.b + wall);
    xs.push(xcc, xcc + g.b);
  }
  xs.push(x + W);
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), y - sheet.p(10), th);
  d.dimChainV(x - sheet.p(20), [y0, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
}

function isoView(sheet: Sheet, ox: number, oy: number, g: ContactGeometry, k: number, slabMm: number) {
  const d = sheet.d;
  const slab = slabMm;
  const L = g.Lout * k, W = g.W * k, H = (g.Htot + slab) * k;
  d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
  const wall = g.wall * k;
  const x0 = (2 * g.wall + g.chan) * k, xe = x0 + g.L * k;
  d.isoLine([x0 - wall, wall, H], [x0 - wall, W - wall, H], ox, oy, "CONTOUR");
  d.isoLine([x0, wall, H], [x0, W - wall, H], ox, oy, "CONTOUR");
  for (let i = 0; i < g.n; i++) {
    const ys = (g.wall + i * (g.B + g.wall)) * k;
    if (i > 0) {
      d.isoLine([x0, ys - wall, H], [xe, ys - wall, H], ox, oy, "CONTOUR");
      d.isoLine([x0, ys, H], [xe, ys, H], ox, oy, "CONTOUR");
    }
    for (let c = 1; c < g.channels; c++) {
      const yp = ys + (c * g.b + (c - 1) * g.wall) * k;
      const lp = (g.L - Math.max(600, g.b)) * k;
      d.isoLine([x0, yp, H], [x0 + lp, yp, H], ox, oy, "CONTOUR");
      d.isoLine([x0, yp + wall, H], [x0 + lp, yp + wall, H], ox, oy, "CONTOUR");
      d.isoLine([x0 + lp, yp, H], [x0 + lp, yp + wall, H], ox, oy, "CONTOUR");
    }
  }
  d.isoLine([wall, wall, H], [L - wall, wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, wall, H], [L - wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, W - wall, H], [wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([wall, W - wall, H], [wall, wall, H], ox, oy, "THIN");
  /* вход, выход, воздух */
  d.isoLine([-sheet.p(8), W / 2, H - 200 * k], [(g.wall + g.chan / 2) * k, W / 2, H - 200 * k], ox, oy, "PIPE");
  d.isoLine([L + 300 * k, W / 2, H - 400 * k], [L + sheet.p(8), W / 2, H - 400 * k], ox, oy, "PIPE");
  d.isoLine([xe - 300 * k, W + 200 * k, H + 500 * k], [L + sheet.p(8), W + 200 * k, H + 500 * k], ox, oy, "PIPE");
}
