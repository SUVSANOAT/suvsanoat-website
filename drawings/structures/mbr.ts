/* ==================================================================
 * МЕМБРАННЫЙ БИОРЕАКТОР (MBR) — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Прямоугольный резервуар из двух параллельных линий (п. 6.150
 * ҚМҚ 2.04.03-19 — секций не менее двух). Каждая линия вдоль потока:
 *   [аноксидная зона] → [аэробная зона] → [мембранный отсек]
 * Вторичного отстойника нет — разделение иловой смеси на мембране.
 *
 * Что задаёт расчёт: общий объём биологии vBio (м³), максимальный
 * часовой расход, площадь мембран, расход воздуха, азот (нужна ли
 * аноксидная зона).
 *
 * Конструктив — всегда монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026): толщины стен и днища, борт и рабочая
 * глубина берутся только оттуда, по расходу не ветвятся.
 *
 * Что задаёт модель: ширину и длину линий (ширина коридора к глубине
 * 1:1…2:1 — п. 6.150), объём мембранного отсека по плотности упаковки
 * модулей, отметки дна, воды и борта, патрубки.
 *
 * Величины, не нормируемые ҚМҚ 2.04.03-19 (плотность упаковки мембран),
 * помечены в basis как принятые.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { AEROTANK, KMK_2_04_03_19_DOC, kmkRef } from "../../norms/kmk-2-04-03-19";

const KMK_TABLE2 = `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2`;
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type MbrParams = {
  /** доля аноксидной зоны, 0…0,5 (0 — без денитрификации) */
  anoxicShare: number;
  /** площадь мембран, м² (по максимальному часовому расходу) */
  membraneAreaM2: number;
  /** плотность упаковки мембранных модулей, м² мембраны на м³ отсека — паспортная величина, принято */
  packingM2PerM3: number;
  /** рабочая глубина воды, м */
  waterDepthM: number;
  /** борт над водой, м */
  freeboardM: number;
  /** толщина стен, мм */
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  /** превышение верха борта над планировкой, м */
  topAboveGroundM: number;
};

export function mbrDefaults(input: DrawingInput): MbrParams {
  const c = construction(undefined, true); // аэрируемое сооружение — глубина по п. 6.150
  return {
    anoxicShare: input.tn > 40 ? 0.3 : 0.2,
    membraneAreaM2: (input.qMaxH * 1000) / 15, // 15 л/(м²·ч) — паспортный поток, как в расчёте технологии
    packingM2PerM3: 150,
    waterDepthM: c.waterDepthM,
    freeboardM: c.freeboardM,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    topAboveGroundM: c.topAboveGroundM,
  };
}

export type MbrGeometry = {
  lines: number;
  /** мм */
  B: number; // ширина одной линии в свету
  L: number; // общая длина линии в свету
  Lanox: number;
  Laer: number;
  Lmem: number;
  Hw: number; // глубина воды, мм
  Htot: number; // полная высота стен, мм
  wall: number;
  /** габарит по наружным граням */
  W: number;
  Lout: number;
  /** отметки, м */
  bottom: number;
  water: number;
  top: number;
};

export function mbrGeometry(input: DrawingInput, p: MbrParams): MbrGeometry {
  const lines = 2;
  const vMem = Math.max(p.membraneAreaM2 / p.packingM2PerM3, input.vBio * 0.1); // м³ на все линии
  const vLine = (input.vBio + vMem) / lines;
  const area = vLine / p.waterDepthM; // м² в плане на линию
  /* Ширина коридора: цель L:B = 3:1, но п. 6.150 требует ширины коридора
     к рабочей глубине 1:1…2:1 — при глубине 4,5 м это 4500…9000 мм. */
  const Hw = p.waterDepthM * 1000;
  const B = roundTo(Math.min(Math.max(Math.sqrt(area / 3) * 1000, Hw), 2 * Hw), 100);
  const L = roundTo((area * 1e6) / B, 100);
  const Lmem = roundTo(((vMem / lines) * 1e6) / (B * p.waterDepthM), 100);
  const Lanox = roundTo((L - Lmem) * p.anoxicShare, 100);
  const Laer = L - Lmem - Lanox;
  const Htot = Hw + p.freeboardM * 1000;
  const wall = p.wallMm;
  const top = p.topAboveGroundM;
  const water = top - p.freeboardM;
  const bottom = water - p.waterDepthM;
  return {
    lines, B, L, Lanox, Laer, Lmem, Hw, Htot, wall,
    W: lines * B + (lines + 1) * wall,
    Lout: L + 2 * wall,
    bottom, water, top,
  };
}

export function mbrModel(input: DrawingInput, overrides: Partial<MbrParams> = {}): StructureModel {
  const p = { ...mbrDefaults(input), ...overrides };
  const g = mbrGeometry(input, p);
  const c = construction(undefined, true);
  const cv = concreteVolume(c, { shape: "rect", w: g.W, l: g.Lout }, g.Htot);
  const vAnox = (g.lines * g.B * g.Lanox * g.Hw) / 1e9;
  const vAer = (g.lines * g.B * g.Laer * g.Hw) / 1e9;
  const vMem = (g.lines * g.B * g.Lmem * g.Hw) / 1e9;
  /* внутренние стены: одна продольная средняя + перегородки зон в каждой линии */
  const vInner =
    ((g.L * g.wall * g.Htot) / 1e9) * (g.lines - 1) +
    ((g.B * g.wall * g.Htot) / 1e9) * g.lines * (g.Lanox > 0 ? 2 : 1);

  const model: StructureModel = {
    id: "mbr",
    kind: "mbr",
    name: "Мембранный биореактор (MBR)",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.W, l: g.Lout },
    bottom: g.bottom,
    water: g.water,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "in", dn: dnFor(input.qMaxH), side: "W", pos: g.W / 2, elev: g.water + 0.1 },
      { role: "out", dn: dnFor(input.qMaxH), side: "E", pos: g.W / 2, elev: g.water - 0.3 },
      { role: "recirc", dn: dnFor(input.qMaxH * 3), side: "S", pos: g.wall + g.Lanox / 2, elev: g.bottom + 0.5 },
      { role: "air", dn: 150, side: "N", pos: g.wall + g.Lanox + g.Laer / 2, elev: g.top + 0.3 },
      { role: "drain", dn: 100, side: "S", pos: g.Lout - 1000, elev: g.bottom },
    ],
    volumes: [
      ...(g.Lanox > 0 ? [{ name: "Аноксидная зона", m3: vAnox }] : []),
      { name: "Аэробная зона", m3: vAer },
      { name: "Мембранный отсек", m3: vMem },
      { name: "Итого рабочий объём", m3: vAnox + vAer + vMem },
      { name: "Бетон стен наружных", m3: cv.walls },
      { name: "Бетон стен внутренних (средняя и перегородки зон)", m3: vInner },
      { name: "Бетон днища", m3: cv.slab },
      { name: "Бетонная подготовка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total + vInner },
      { name: "Арматура, кг", m3: (cv.total + vInner) * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Мембранные модули (половолоконные)", qty: `${Math.ceil(p.membraneAreaM2)} м²`, spec: `поток 15 л/(м²·ч) при Qmax ${input.qMaxH.toFixed(0)} м³/ч`, supply: "supply" },
      { name: "Аэрационная система мелкопузырчатая", qty: "комплект", spec: `${input.air.toFixed(0)} м³/ч технологического воздуха`, supply: "supply" },
      { name: "Аэрация продувки мембран", qty: "комплект", spec: "по паспорту производителя модулей", supply: "supply" },
      ...(g.Lanox > 0 ? [{ name: "Мешалки погружные аноксидной зоны", qty: `${g.lines} шт.`, supply: "supply" as const }] : []),
      { name: "Насосы рециркуляции иловой смеси", qty: `${g.lines}+1`, spec: "300 % от Qср", supply: "supply" },
      { name: "Пермеатные насосы (самовсасывающие)", qty: `${g.lines}+1`, supply: "supply" },
      { name: "Станция химической промывки (CIP)", qty: "1 компл.", spec: "NaOCl, лимонная кислота", supply: "supply" },
      { name: "Резервуар железобетонный монолитный с перегородками зон", qty: "1", spec: `${g.Lout}×${g.W}×${g.Htot} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Площадки обслуживания, ограждения, лотки и трубопроводная обвязка", qty: "комплект", spec: "металлоконструкции", supply: "own" },
    ],
    basis: [
      constructionNote(c),
      `Число линий — ${g.lines} (${AEROTANK.minSections.ref}); рабочая глубина ${p.waterDepthM} м (${AEROTANK.depthM.ref}: 3–6 м), ширина коридора ${g.B} мм — отношение ширины к глубине ${(g.B / g.Hw).toFixed(2)}:1 в пределах 1:1…2:1 (${AEROTANK.depthM.ref}).`,
      ...(g.L < g.B
        ? [
            `При объёме биологии ${input.vBio.toFixed(0)} м³ и глубине ${p.waterDepthM} м длина секции ${g.L} мм меньше её ширины ${g.B} мм: секция работает как ёмкость с перемешиванием, а не как коридор; ограничение ширины коридора к глубине (${AEROTANK.depthM.ref}) выдержано по нижней границе 1:1. Для коридорной компоновки глубину следует снизить в пределах 3–6 м на странице «Допущения».`,
          ]
        : []),
      `Объём биологии ${input.vBio.toFixed(0)} м³ — из расчёта; мембранный отсек ${vMem.toFixed(1)} м³ при плотности упаковки ${p.packingM2PerM3} м²/м³ (паспортная величина, ҚМҚ 2.04.03-19 не нормирует).`,
      `Площадь мембран ${Math.ceil(p.membraneAreaM2)} м² по максимальному часовому расходу ${input.qMaxH.toFixed(0)} м³/ч (табл. 2 ҚМҚ 2.04.03-19, п. 2.7) при потоке 15 л/(м²·ч).`,
      `Вторичный отстойник не предусмотрен: разделение иловой смеси на мембране. Требование обязательной мембранной очистки — см. записку.`,
      `Расход воздуха ${input.air.toFixed(0)} м³/ч — ${kmkRef("6.156", "ф. (70)")}.`,
    ],
    calc: mbrCalc(input, p, g, c, vAnox, vAer, vMem),
    headLoss: 0.4,
    draw: (sheet) => drawMbr(sheet, input, p, g, model),
  };
  return model;
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

function mbrCalc(
  input: DrawingInput,
  p: MbrParams,
  g: MbrGeometry,
  c: ReturnType<typeof construction>,
  vAnox: number,
  vAer: number,
  vMem: number,
): CalcStep[] {
  const qAvgH = input.q / 24;
  const areaLine = ((input.vBio + vMem) / g.lines) / p.waterDepthM;
  const ratio = g.B / g.Hw;
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Расчётный расход сточных вод", symbol: "Q", value: f0(input.q), unit: "м³/сут", ref: "анкета объекта" },
    { kind: "input", what: "Средний часовой расход", symbol: "q ср", formula: "q ср = Q / 24", substitution: `q ср = ${f0(input.q)} / 24`, value: f1(qAvgH), unit: "м³/ч", ref: "" },
    { kind: "input", what: "Максимальный часовой расход", symbol: "q max", value: f1(input.qMaxH), unit: "м³/ч", ref: `${KMK_TABLE2}` },
    { kind: "input", what: "БПК₅ на входе", symbol: "L en", value: f0(input.bod), unit: "мг/л", ref: "анкета / табл. 25 п. 6.4" },
    { kind: "input", what: "Азот общий на входе", symbol: "N", value: f0(input.tn), unit: "мг/л", ref: "анкета / табл. 25 п. 6.4" },
    { kind: "input", what: "Объём биологической ступени из расчёта технологии", symbol: "W био", value: f0(input.vBio), unit: "м³", ref: "расчёт MBR; больший из объёма по времени пребывания и по органической нагрузке" },
    { kind: "input", what: "Рабочая глубина воды", symbol: "H", value: f1(p.waterDepthM), unit: "м", ref: `${AEROTANK.depthM.ref}: 3–6 м` },

    /* ---------- расчёт ---------- */
    {
      kind: "calc",
      what: "Число технологических линий",
      symbol: "n",
      formula: "n ≥ 2",
      substitution: "принято n = 2",
      value: String(g.lines),
      unit: "шт.",
      ref: AEROTANK.minSections.ref,
    },
    {
      kind: "calc",
      what: "Объём мембранного отсека",
      symbol: "W мем",
      formula: "W мем = F мем / k упак",
      substitution: `W мем = ${f0(p.membraneAreaM2)} / ${p.packingM2PerM3}`,
      value: f1(vMem),
      unit: "м³",
      ref: `плотность упаковки ${p.packingM2PerM3} м²/м³ — паспорт производителя, ҚМҚ 2.04.03-19 не нормирует`,
    },
    {
      kind: "calc",
      what: "Площадь линии в плане",
      symbol: "A",
      formula: "A = (W био + W мем) / (n · H)",
      substitution: `A = (${f0(input.vBio)} + ${f1(vMem)}) / (${g.lines} · ${f1(p.waterDepthM)})`,
      value: f1(areaLine),
      unit: "м²",
      ref: "",
    },
    {
      kind: "calc",
      what: "Ширина коридора в свету",
      symbol: "B",
      formula: "B = √(A / 3), но H ≤ B ≤ 2H",
      substitution: `B = √(${f1(areaLine)} / 3) = ${f1(Math.sqrt(areaLine / 3))} м; ограничение ${f1(p.waterDepthM)}…${f1(2 * p.waterDepthM)} м`,
      value: f0(g.B),
      unit: "мм",
      ref: `${AEROTANK.depthM.ref} — ширина коридора к рабочей глубине 1:1…2:1`,
    },
    {
      kind: "check",
      what: "Проверка отношения ширины коридора к глубине",
      formula: "1 ≤ B / H ≤ 2",
      substitution: `${f0(g.B)} / ${f0(g.Hw)} = ${ratio.toFixed(2)}`,
      value: ratio >= 1 && ratio <= 2 ? "выполняется" : "НЕ выполняется",
      ref: AEROTANK.depthM.ref,
    },
    {
      kind: "calc",
      what: "Длина линии в свету",
      symbol: "L",
      formula: "L = A / B",
      substitution: `L = ${f1(areaLine)} · 10⁶ / ${f0(g.B)}`,
      value: f0(g.L),
      unit: "мм",
      ref: "",
    },
    {
      kind: "calc",
      what: "Длина аноксидной зоны",
      symbol: "L анокс",
      formula: "L анокс = (L − L мем) · α",
      substitution: `L анокс = (${f0(g.L)} − ${f0(g.Lmem)}) · ${p.anoxicShare}`,
      value: f0(g.Lanox),
      unit: "мм",
      ref: `доля аноксидной зоны ${(p.anoxicShare * 100).toFixed(0)} % при азоте ${f0(input.tn)} мг/л — DWA-A 131, ҚМҚ 2.04.03-19 не нормирует`,
    },
    { kind: "calc", what: "Объём аноксидной зоны", symbol: "W анокс", formula: "W = n · B · L анокс · H", substitution: `W = ${g.lines} · ${f0(g.B)} · ${f0(g.Lanox)} · ${f0(g.Hw)}`, value: f1(vAnox), unit: "м³", ref: "" },
    { kind: "calc", what: "Объём аэробной зоны", symbol: "W аэр", formula: "W = n · B · L аэр · H", substitution: `W = ${g.lines} · ${f0(g.B)} · ${f0(g.Laer)} · ${f0(g.Hw)}`, value: f1(vAer), unit: "м³", ref: "" },
    {
      kind: "calc",
      what: "Площадь мембранных модулей",
      symbol: "F мем",
      formula: "F мем = q max / J",
      substitution: `F мем = ${f1(input.qMaxH)} · 1000 / 15`,
      value: f0(p.membraneAreaM2),
      unit: "м²",
      ref: "подбор по максимальному часовому расходу; поток J = 15 л/(м²·ч) — паспорт модулей",
    },
    {
      kind: "calc",
      what: "Расход технологического воздуха",
      symbol: "q air",
      formula: "q air = q O · (L en − L ex) / (K₁K₂K_T K₃ (C a − C O))",
      substitution: "по расчёту технологии",
      value: f0(input.air),
      unit: "м³/ч",
      ref: kmkRef("6.156", "ф. (70)"),
    },
    {
      kind: "calc",
      what: "Полная высота стен",
      symbol: "H ст",
      formula: "H ст = H + h борт",
      substitution: `H ст = ${f0(g.Hw)} + ${f0(c.freeboardM * 1000)}`,
      value: f0(g.Htot),
      unit: "мм",
      ref: `борт ${f1(c.freeboardM)} м — коэффициенты расчёта SUVSANOAT`,
    },
    {
      kind: "calc",
      what: "Габарит сооружения по наружным граням",
      formula: "W = n·B + (n+1)·δ;  L габ = L + 2δ",
      substitution: `W = ${g.lines}·${f0(g.B)} + ${g.lines + 1}·${f0(g.wall)};  L = ${f0(g.L)} + 2·${f0(g.wall)}`,
      value: `${f0(g.W)} × ${f0(g.Lout)}`,
      unit: "мм",
      ref: `толщина стен ${f0(g.wall)} мм — ${c.concreteGrade}`,
    },
    {
      kind: "calc",
      what: "Отметки: дно / вода / верх борта",
      formula: "дно = верх − H ст;  вода = верх − h борт",
      substitution: `верх +${f1(g.top * 1000) === "0" ? "0" : (g.top).toFixed(3)}`,
      value: `${g.bottom.toFixed(3)} / ${g.water.toFixed(3)} / +${g.top.toFixed(3)}`,
      unit: "м",
      ref: "0.000 — планировочная отметка площадки",
    },
  ];
  return steps;
}

/** диаметр патрубка по расходу при 1,0–1,2 м/с, мм, ряд DN */
export function dnFor(qM3H: number): number {
  const v = 1.0;
  const d = Math.sqrt((4 * qM3H) / 3600 / v / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

/* ==================================================================
 * ЧЕРТЁЖ: план, разрез 1-1 (продольный), разрез 2-2 (поперечный), изометрия
 * ================================================================== */

function drawMbr(sheet: Sheet, input: DrawingInput, p: MbrParams, g: MbrGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th;
  const ts = sheet.ts;
  const f = sheet.field;
  const gap = sheet.p(25);

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(30);
  const py = f.y0 + f.h - sheet.p(40) - g.W; // план сверху слева
  sheet.viewTitle(px, py + g.W + sheet.p(16), "ПЛАН");

  /* наружный контур и стены */
  d.rect(px, py, g.Lout, g.W, "CONTOUR");
  d.rect(px + g.wall, py + g.wall, g.L, g.W - 2 * g.wall, "CONTOUR");
  d.concrete([[px, py], [px + g.Lout, py], [px + g.Lout, py + g.wall], [px, py + g.wall]], sheet.p(1.5));
  d.concrete([[px, py + g.W - g.wall], [px + g.Lout, py + g.W - g.wall], [px + g.Lout, py + g.W], [px, py + g.W]], sheet.p(1.5));
  /* средняя стена */
  const ym = py + g.wall + g.B;
  d.rect(px + g.wall, ym, g.L, g.wall, "CONTOUR");
  /* перегородки зон в каждой линии */
  for (let i = 0; i < g.lines; i++) {
    const y0 = py + g.wall + i * (g.B + g.wall);
    const xa = px + g.wall + g.Lanox;
    const xm = px + g.wall + g.Lanox + g.Laer;
    if (g.Lanox > 0) d.line(xa, y0, xa, y0 + g.B, "CONTOUR");
    d.line(xm, y0, xm, y0 + g.B, "CONTOUR");
    /* перелив через перегородки — окно в стене */
    if (g.Lanox > 0) d.line(xa, y0 + g.B * 0.35, xa, y0 + g.B * 0.65, "HIDDEN");
    d.line(xm, y0 + g.B * 0.35, xm, y0 + g.B * 0.65, "HIDDEN");
    /* мешалка в аноксидной зоне */
    if (g.Lanox > 0) {
      const mx = px + g.wall + g.Lanox / 2, my = y0 + g.B / 2;
      d.circle(mx, my, sheet.p(4), "EQUIP");
      d.line(mx - sheet.p(6), my, mx + sheet.p(6), my, "EQUIP");
      d.text(mx, my - sheet.p(9), ts, "М", { align: "center", layer: "EQUIP" });
    }
    /* диффузоры в аэробной зоне: ряды поперёк потока */
    const rows = Math.max(3, Math.floor(g.Laer / 1500));
    const cols = Math.max(2, Math.floor(g.B / 800));
    for (let r = 0; r < rows; r++) {
      const x = xa + ((r + 0.5) * g.Laer) / rows;
      d.line(x, y0 + 300, x, y0 + g.B - 300, "EQUIP");
      for (let c = 0; c < cols; c++) {
        const y = y0 + ((c + 0.5) * g.B) / cols;
        d.circle(x, y, 120, "EQUIP");
      }
    }
    /* мембранные кассеты в отсеке */
    const cas = Math.max(1, Math.floor(g.Lmem / 1400));
    for (let c = 0; c < cas; c++) {
      const x = xm + 300 + c * ((g.Lmem - 600) / cas);
      const wCas = (g.Lmem - 600) / cas - 200;
      d.rect(x, y0 + 300, wCas, g.B - 600, "EQUIP");
      for (let k = 1; k < 4; k++) d.line(x, y0 + 300 + ((g.B - 600) * k) / 4, x + wCas, y0 + 300 + ((g.B - 600) * k) / 4, "EQUIP");
    }
  }
  /* подписи зон */
  const yl = py + g.wall + g.B / 2;
  if (g.Lanox > 0) d.text(px + g.wall + g.Lanox / 2, yl + g.B * 0.3, ts, "АНОКСИДНАЯ", { align: "center" });
  d.text(px + g.wall + g.Lanox + g.Laer / 2, yl + g.B * 0.3, ts, "АЭРОБНАЯ ЗОНА", { align: "center" });
  d.text(px + g.wall + g.Lanox + g.Laer + g.Lmem / 2, yl + g.B * 0.3, ts, "МЕМБРАНЫ", { align: "center" });
  d.text(px + g.Lout / 2, py + g.wall + g.B / 2 - th * 1.6, ts, "ЛИНИЯ 1", { align: "center" });
  d.text(px + g.Lout / 2, py + g.wall * 2 + g.B * 1.5 - th * 1.6, ts, "ЛИНИЯ 2", { align: "center" });

  /* патрубки и поток */
  const inN = g.wall + 0;
  d.arrow(px - sheet.p(18), py + g.W / 2, px, py + g.W / 2, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), py + g.W / 2 + th * 0.6, ts, `ОТ МЕХАНИЧЕСКОЙ ОЧИСТКИ DN${dnFor(input.qMaxH)}`, { align: "right" });
  d.arrow(px + g.Lout, py + g.W / 2, px + g.Lout + sheet.p(18), py + g.W / 2, "FLOW", sheet.p(2));
  d.text(px + g.Lout + sheet.p(2), py + g.W / 2 + th * 0.6, ts, `ПЕРМЕАТ НА ОБЕЗЗАРАЖИВАНИЕ DN${dnFor(input.qMaxH)}`, { align: "left" });
  void inN;

  /* размеры плана */
  const yd = py - sheet.p(10);
  const xs = [px, px + g.wall];
  if (g.Lanox > 0) xs.push(px + g.wall + g.Lanox);
  xs.push(px + g.wall + g.Lanox + g.Laer, px + g.wall + g.L, px + g.Lout);
  d.dimChainH(xs, yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(10), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(30);
  d.dimChainV(xd, [py, py + g.wall, py + g.wall + g.B, py + 2 * g.wall + g.B, py + 2 * g.wall + 2 * g.B, py + g.W], th);
  d.dimV(xd + sheet.p(10), py, py + g.W, `${g.W}`, th);

  /* марки разрезов */
  d.sectionMark(px - sheet.p(6), py + g.wall + g.B / 2, px + g.Lout + sheet.p(6), py + g.wall + g.B / 2, "1", th, -1);
  const x22 = px + g.wall + g.Lanox + g.Laer / 2;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.W + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 (продольный, по линии 1) ---------------- */
  const sx = px;
  const sy = py - sheet.p(45) - g.Htot - 400;
  sheet.viewTitle(sx, sy + g.Htot + sheet.p(20), "РАЗРЕЗ 1-1");
  sectionLong(sheet, sx, sy, g, p);

  /* ---------------- РАЗРЕЗ 2-2 (поперечный) ---------------- */
  const cx = px + g.Lout + sheet.p(70);
  const cy = sy;
  sheet.viewTitle(cx, cy + g.Htot + sheet.p(20), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, cy, g, p);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const ix = px + g.Lout + sheet.p(60) + g.W;
  const iy = py + sheet.p(10);
  sheet.viewTitle(ix - sheet.p(10), py + g.W + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g);

  /* примечания листа */
  sheet.note(`Мембранный биореактор: ${g.lines} линии ${g.B}×${g.L} мм в свету, рабочая глубина ${p.waterDepthM} м, борт ${p.freeboardM} м.`);
  sheet.note(`Отметки: дно ${fmtE(g.bottom)}, вода ${fmtE(g.water)}, верх борта ${fmtE(g.top)} (0.000 — планировочная отметка площадки).`);
  sheet.note(`Резервуар железобетонный монолитный: стены ${g.wall} мм, днище ${p.slabMm} мм, бетон ${construction(undefined, true).concreteGrade}. Мембранные модули, аэрация, насосы и CIP — покупное оборудование по паспорту производителя; площадки обслуживания, лотки и обвязка — изготовление SUVSANOAT.`);
  /* ведомость расчёта — в свободном поле под разрезами */
  const calcY = Math.min(sy, cy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: "стены и перегородки" },
    { layer: "HATCH", text: "железобетон" },
    { layer: "WATER", text: "расчётный уровень воды" },
    { layer: "EQUIP", text: "оборудование" },
    { layer: "PIPE", text: "трубопроводы" },
  ]);
  void gap;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

function sectionLong(sheet: Sheet, x: number, y: number, g: MbrGeometry, p: MbrParams) {
  const d = sheet.d;
  const th = sheet.th;
  const ts = sheet.ts;
  const slab = p.slabMm;
  const groundY = y + (0 - g.bottom) * 1000 + slab; // y дна = y + slab; отметка 0.000 выше дна на -bottom м
  /* дно и стены */
  const yb = y + slab; // внутренняя поверхность дна
  const yt = yb + g.Htot;
  const poly: Pt[] = [
    [x, y], [x + g.Lout, y], [x + g.Lout, yt], [x + g.Lout - g.wall, yt], [x + g.Lout - g.wall, yb],
    [x + g.wall, yb], [x + g.wall, yt], [x, yt],
  ];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* перегородки зон */
  const xa = x + g.wall + g.Lanox;
  const xm = x + g.wall + g.Lanox + g.Laer;
  const hPart = g.Hw + 100;
  if (g.Lanox > 0) d.rect(xa - g.wall / 2, yb, g.wall, hPart, "CONTOUR");
  d.rect(xm - g.wall / 2, yb, g.wall, hPart, "CONTOUR");
  /* вода */
  const yw = yb + g.Hw;
  d.line(x + g.wall, yw, x + g.Lout - g.wall, yw, "WATER");
  d.waterLevel(x + g.wall + g.Lanox / 2 + sheet.p(15), yw, undefined, th);
  /* диффузоры на дне аэробной зоны */
  const rows = Math.max(3, Math.floor(g.Laer / 1500));
  for (let r = 0; r < rows; r++) {
    const xx = xa + ((r + 0.5) * g.Laer) / rows;
    d.rect(xx - 150, yb, 300, 120, "EQUIP");
    d.line(xx, yb + 120, xx, yt - 200, "PIPE");
  }
  /* мешалка */
  if (g.Lanox > 0) {
    const mx = x + g.wall + g.Lanox / 2;
    d.line(mx, yt - 100, mx, yb + 900, "EQUIP");
    d.circle(mx, yb + 900, 250, "EQUIP");
  }
  /* мембранные кассеты в отсеке — от дна на 300 до воды −300 */
  const cas = Math.max(1, Math.floor(g.Lmem / 1400));
  for (let c = 0; c < cas; c++) {
    const xx = xm + 300 + c * ((g.Lmem - 600) / cas);
    const wCas = (g.Lmem - 600) / cas - 200;
    d.rect(xx, yb + 300, wCas, g.Hw - 600, "EQUIP");
    for (let k = 1; k < 6; k++) d.line(xx + (wCas * k) / 6, yb + 300, xx + (wCas * k) / 6, yb + g.Hw - 300, "EQUIP");
  }
  /* грунт и планировка */
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  /* отметки */
  d.elevMark(x - sheet.p(8), groundY, "0.000", th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + g.Lout + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yt, fmtE(g.top), th, 1);
  /* размеры */
  d.dimChainV(x - sheet.p(20), [y, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
  const xs = [x, x + g.wall];
  if (g.Lanox > 0) xs.push(xa);
  xs.push(xm, x + g.Lout - g.wall, x + g.Lout);
  d.dimChainH(xs, y - sheet.p(10), th);
  /* подписи зон */
  if (g.Lanox > 0) d.text(x + g.wall + g.Lanox / 2, yb + g.Hw * 0.45, ts, "АНОКСИДНАЯ", { align: "center" });
  d.text(xa + g.Laer / 2, yb + g.Hw * 0.45, ts, "АЭРОБНАЯ ЗОНА", { align: "center" });
  d.text(xm + g.Lmem / 2, yt + th, ts, "МЕМБРАННЫЙ ОТСЕК", { align: "center" });
  void p;
}

function sectionCross(sheet: Sheet, x: number, y: number, g: MbrGeometry, p: MbrParams) {
  const d = sheet.d;
  const th = sheet.th;
  const slab = p.slabMm;
  const yb = y + slab;
  const yt = yb + g.Htot;
  const groundY = y + (0 - g.bottom) * 1000 + slab;
  const W = g.W;
  const poly: Pt[] = [[x, y], [x + W, y], [x + W, yt], [x + W - g.wall, yt], [x + W - g.wall, yb], [x + g.wall, yb], [x + g.wall, yt], [x, yt]];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* средняя стена во всю высоту */
  d.rect(x + g.wall + g.B, yb, g.wall, g.Htot, "CONTOUR");
  d.concrete([[x + g.wall + g.B, yb], [x + 2 * g.wall + g.B, yb], [x + 2 * g.wall + g.B, yt], [x + g.wall + g.B, yt]], sheet.p(1.5));
  const yw = yb + g.Hw;
  for (let i = 0; i < g.lines; i++) {
    const x0 = x + g.wall + i * (g.B + g.wall);
    d.line(x0, yw, x0 + g.B, yw, "WATER");
    /* диффузоры поперёк */
    const cols = Math.max(2, Math.floor(g.B / 800));
    for (let c = 0; c < cols; c++) {
      const xx = x0 + ((c + 0.5) * g.B) / cols;
      d.circle(xx, yb + 100, 100, "EQUIP");
    }
    d.line(x0 + 200, yb + 100, x0 + g.B - 200, yb + 100, "PIPE");
    d.line(x0 + g.B - 200, yb + 100, x0 + g.B - 200, yt + 300, "PIPE");
  }
  /* воздуховод над резервуаром */
  d.line(x - sheet.p(6), yt + 300, x + W + sheet.p(6), yt + 300, "PIPE");
  d.text(x + W / 2, yt + 300 + th * 0.5, sheet.ts, "ВОЗДУХОВОД DN150", { align: "center" });
  d.waterLevel(x + g.wall + g.B * 0.3, yw, undefined, th);
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(8), groundY, "0.000", th, 1);
  d.elevMark(x + W + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + W + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.dimChainH([x, x + g.wall, x + g.wall + g.B, x + 2 * g.wall + g.B, x + 2 * g.wall + 2 * g.B, x + W], y - sheet.p(10), th);
  d.dimChainV(x - sheet.p(20), [y, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
  void p;
}

function isoView(sheet: Sheet, ox: number, oy: number, g: MbrGeometry) {
  const d = sheet.d;
  /* коробка резервуара: X — длина, Y — ширина, Z — высота; масштаб 1:2 от натуры, чтобы поместиться */
  const k = 0.5;
  const L = g.Lout * k, W = g.W * k, H = (g.Htot + 350) * k;
  d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
  /* внутренние стены — верхние рёбра */
  const wall = g.wall * k;
  const xa = (g.wall + g.Lanox) * k, xm = (g.wall + g.Lanox + g.Laer) * k;
  const ym = (g.wall + g.B) * k;
  d.isoLine([wall, ym, H], [L - wall, ym, H], ox, oy, "CONTOUR");
  d.isoLine([wall, ym + wall, H], [L - wall, ym + wall, H], ox, oy, "CONTOUR");
  for (const xx of g.Lanox > 0 ? [xa, xm] : [xm]) {
    d.isoLine([xx, wall, H], [xx, W - wall, H], ox, oy, "CONTOUR");
  }
  /* внутренний контур верха */
  d.isoLine([wall, wall, H], [L - wall, wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, wall, H], [L - wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, W - wall, H], [wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([wall, W - wall, H], [wall, wall, H], ox, oy, "THIN");
  /* мембранные кассеты как коробки в отсеке */
  const cas = Math.max(1, Math.floor(g.Lmem / 1400));
  for (let i = 0; i < g.lines; i++) {
    const y0 = (g.wall + i * (g.B + g.wall) + 300) * k;
    for (let c = 0; c < cas; c++) {
      const xx = xm + (300 + c * ((g.Lmem - 600) / cas)) * k;
      const wCas = ((g.Lmem - 600) / cas - 200) * k;
      d.isoBox(xx, y0, 300 * k, wCas, (g.B - 600) * k, (g.Hw - 600) * k, ox, oy, "EQUIP");
    }
  }
  /* стрелка потока */
  const a = d;
  const p1 = [ -sheet.p(10), W / 2, H + 200 * k ] as [number, number, number];
  const p2 = [ 0, W / 2, H + 200 * k ] as [number, number, number];
  a.isoLine(p1, p2, ox, oy, "FLOW");
}
