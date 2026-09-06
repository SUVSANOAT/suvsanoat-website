/* ==================================================================
 * УСРЕДНИТЕЛЬ РАСХОДА И СОСТАВА — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Прямоугольный резервуар из ≥ 2 секций (п. 6.38 ҚМҚ 2.04.03-19, обе
 * рабочие), секции параллельны и делят продольную стенку. Вода из
 * механической очистки поступает самотёком в распределительный лоток
 * на входном торце, из приямков на выходном торце погружные насосы
 * (1 раб. + 1 рез., частотный привод) подают её на биологию — здесь
 * выравнивается расход, дальше по цепочке идёт постоянная подача.
 *
 * Перемешивание: барботаж при ВВ ≤ 500 мг/л (п. 6.40) с интенсивностью
 * по п. 6.46 на 1 м барботёра — пристенные 6, промежуточные
 * 12 м³/(ч·м); при ВВ > 500 мг/л — механические мешалки (п. 6.47).
 *
 * Что задаёт расчёт: объём vAvg (м³), расход, ВВ.
 * Конструктив — всегда монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026): толщины стен и днища, борт и рабочая
 * глубина берутся только оттуда, по расходу не ветвятся.
 * Что задаёт модель: соотношение сторон секции L:B = 2:1 (практика),
 * отметки, патрубки, барботёры/мешалки, насосы.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { EQUALIZATION, kmkRef } from "../../norms/kmk-2-04-03-19";
import { dnFor } from "./mbr";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type EqualParams = {
  /** число секций (п. 6.38: не менее двух) */
  sections: number;
  /** рабочая глубина воды, м — из construction() */
  waterDepthM: number;
  /** борт над максимальным уровнем, м */
  freeboardM: number;
  /** соотношение L:B секции — практика */
  ratio: number;
  /** толщина стен, мм */
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  /** превышение верха борта над планировкой, м */
  topAboveGroundM: number;
  /** перемешивание: авто по ВВ (п. 6.40/6.47) */
  mixing: "auto" | "bubbling" | "mixer";
  /** шаг барботёров в плане, м — практика (п. 6.46 задаёт только интенсивность на 1 м) */
  bubblerSpacingM: number;
  /** удельная мощность мешалок, Вт/м³ — практика */
  mixerWPerM3: number;
  /** запас подачи насосов к среднечасовому расходу — практика */
  pumpFactor: number;
  /** напор насосов подачи на биологию, м — практика (lib/assumptions pumpHead) */
  pumpHeadM: number;
  /** приямок насосов: размер в плане и глубина, мм — практика */
  sumpMm: { l: number; w: number; h: number };
};

export function equalDefaults(input: DrawingInput): EqualParams {
  const c = construction();
  void input;
  return {
    sections: EQUALIZATION.minSections.value,
    waterDepthM: c.waterDepthM,
    freeboardM: c.freeboardM,
    ratio: 2,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    topAboveGroundM: c.topAboveGroundM,
    mixing: "auto",
    bubblerSpacingM: 3.0,
    mixerWPerM3: 8,
    pumpFactor: 1.2,
    pumpHeadM: 15,
    sumpMm: { l: 1200, w: 1200, h: 500 },
  };
}

export type EqualGeometry = {
  n: number;
  mixing: "bubbling" | "mixer";
  /** мм: секция в свету B×L, глубина воды, полная высота стен, стена */
  B: number;
  L: number;
  Hw: number;
  Htot: number;
  wall: number;
  /** входной лоток (вдоль западной стены), мм */
  chan: number;
  /** наружный габарит: W — поперёк потока (сумма секций), Lout — вдоль */
  W: number;
  Lout: number;
  /** барботёры: число рядов в секции (пристенные 2 + промежуточные), воздух м³/ч всего */
  bubblerRows: number;
  bubblerMiddle: number;
  airM3H: number;
  /** мешалки: мощность одной, кВт */
  mixerKw: number;
  /** насосы: подача м³/ч (каждый), число рабочих */
  pumpQ: number;
  pumpsWork: number;
  /** объёмы, м³ */
  vSection: number;
  vTotal: number;
  /** отметки, м */
  bottom: number;
  water: number;
  top: number;
  sumpBottom: number;
  inlet: number;
  outlet: number;
};

export function equalGeometry(input: DrawingInput, p: EqualParams): EqualGeometry {
  const n = Math.max(EQUALIZATION.minSections.value, Math.round(p.sections));
  const mixing: "bubbling" | "mixer" = p.mixing === "auto" ? (input.ss <= EQUALIZATION.bubblingUpToSsMgL.value ? "bubbling" : "mixer") : p.mixing;
  const vSection = Math.max(input.vAvg, 1) / n;
  const area = vSection / p.waterDepthM; // м²
  const B = roundTo(Math.sqrt(area / p.ratio) * 1000, 100);
  const L = roundTo((area * 1e6) / B, 100);
  const Hw = p.waterDepthM * 1000;
  const Htot = Hw + p.freeboardM * 1000;
  const wall = p.wallMm;
  const chan = Math.max(600, roundTo(Math.sqrt(input.qMaxH / 3600 / 0.4) * 1000, 100)); // лоток при v ≈ 0,4 м/с, квадратное сечение — практика
  const W = n * B + (n + 1) * wall;
  const Lout = L + chan + 3 * wall;
  /* барботёры вдоль секции (по потоку): 2 пристенных + промежуточные с шагом ≤ spacing */
  const bubblerMiddle = Math.max(0, Math.ceil(B / (p.bubblerSpacingM * 1000)) - 1);
  const bubblerRows = 2 + bubblerMiddle;
  const airM3H = mixing === "bubbling" ? n * (L / 1000) * (2 * EQUALIZATION.bubblerIntensity.wall + bubblerMiddle * EQUALIZATION.bubblerIntensity.middle) : 0;
  const mixerKw = mixing === "mixer" ? Math.ceil((vSection * p.mixerWPerM3) / 100) / 10 : 0;
  /* насосы: подача среднечасового расхода с запасом; 1 раб. + 1 рез. (в каждом приямке по насосу, общий напорный коллектор) */
  const qAvgH = input.q / Math.max(1, input.hours);
  const pumpQ = Math.ceil(qAvgH * p.pumpFactor);
  const pumpsWork = 1;
  const top = p.topAboveGroundM;
  const water = top - p.freeboardM;
  const bottom = water - p.waterDepthM;
  return {
    n, mixing, B, L, Hw, Htot, wall, chan, W, Lout,
    bubblerRows, bubblerMiddle, airM3H, mixerKw, pumpQ, pumpsWork,
    vSection: (B * L * Hw) / 1e9, vTotal: (n * B * L * Hw) / 1e9,
    bottom, water, top,
    sumpBottom: bottom - p.sumpMm.h / 1000,
    inlet: water + 0.2,
    outlet: top + 0.3,
  };
}

/** разрез 2-2 справа от 1-1 помещается, если план + 75 мм + ширина сечения ≤ 600 мм бумаги */
function crossBeside(g: EqualGeometry, s: number): boolean {
  return (g.Lout + g.W) / s + 75 <= 600;
}

function fitScale(g: EqualGeometry, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return (
    row.find((s) => g.Lout / s <= 300 && (crossBeside(g, s) ? (g.W + sectH) / s <= 450 : (g.W + 2 * sectH) / s + 90 <= 520)) ??
    pickScale(g.Lout, sectH)
  );
}

export function equalScale(input: DrawingInput, overrides: Partial<EqualParams> = {}): number {
  const g = equalGeometry(input, { ...equalDefaults(input), ...overrides });
  return fitScale(g, g.Htot + 1200);
}

export function equalModel(input: DrawingInput, overrides: Partial<EqualParams> = {}): StructureModel {
  const p = { ...equalDefaults(input), ...overrides };
  const g = equalGeometry(input, p);
  const c = construction();
  const cv = concreteVolume(c, { shape: "rect", w: g.W, l: g.Lout }, g.Htot);
  /* внутренние стены: продольные перегородки между секциями + стенка лотка */
  const vInner = ((g.L * g.wall * g.Htot) / 1e9) * (g.n - 1) + (g.W * g.wall * g.Htot) / 1e9;
  const dnIn = dnFor(input.qMaxH);
  const dnOut = dnFor(g.pumpQ);
  const dnAir = g.mixing === "bubbling" ? Math.max(80, dnForAir(g.airM3H)) : 0;
  const model: StructureModel = {
    id: "equal",
    kind: "equal",
    name: "Усреднитель расхода",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.W, l: g.Lout },
    bottom: g.bottom,
    water: g.water,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "in", dn: dnIn, side: "W", pos: g.W / 2, elev: g.inlet },
      { role: "out", dn: dnOut, side: "E", pos: g.W / 2, elev: g.outlet },
      ...(g.mixing === "bubbling" ? [{ role: "air" as const, dn: dnAir, side: "N" as const, pos: g.Lout / 2, elev: g.top + 0.3 }] : []),
      { role: "drain", dn: 100, side: "E", pos: g.wall + g.B / 2, elev: g.sumpBottom },
    ],
    volumes: [
      { name: `Секция усреднителя, ${g.n} шт.`, m3: g.vSection },
      { name: "Итого рабочий объём", m3: g.vTotal },
      { name: "Объём по расчёту (vAvg)", m3: input.vAvg },
      { name: "Бетон стен наружных", m3: cv.walls },
      { name: "Бетон стен внутренних (перегородки секций, стенка лотка)", m3: vInner },
      { name: "Бетон днища", m3: cv.slab },
      { name: "Бетонная подготовка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total + vInner },
      { name: "Арматура, кг", m3: (cv.total + vInner) * c.rebarKgM3 },
    ],
    equipment: [
      ...(g.mixing === "bubbling"
        ? [
            { name: "Барботёры перфорированные (пристенные и промежуточные)", qty: `${g.n * g.bubblerRows} нитей × ${(g.L / 1000).toFixed(1)} м`, spec: `${g.airM3H.toFixed(0)} м³/ч воздуха, коллектор DN${dnAir}`, supply: "own" as const },
            { name: "Воздух на барботаж — от воздуходувной станции", qty: `${g.airM3H.toFixed(0)} м³/ч`, spec: "отдельная группа / отвод от технологического коллектора", supply: "supply" as const },
          ]
        : [{ name: "Мешалки погружные", qty: `${g.n} шт.`, spec: `${g.mixerKw} кВт (${p.mixerWPerM3} Вт/м³, практика)`, supply: "supply" as const }]),
      { name: "Насосы погружные подачи на биологию с частотным приводом", qty: `${g.pumpsWork}+1`, spec: `${g.pumpQ} м³/ч, H ${p.pumpHeadM} м, по одному в приямке каждой секции`, supply: "supply" },
      { name: "Датчики уровня (гидростатический + поплавковые)", qty: `${g.n} компл.`, supply: "supply" },
      { name: "Арматура напорного коллектора (обратные клапаны, задвижки)", qty: "комплект", spec: `DN${dnOut}`, supply: "supply" },
      { name: "Резервуар железобетонный монолитный с перегородками секций", qty: "1", spec: `${g.Lout}×${g.W}×${g.Htot} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Распределительный лоток, площадки обслуживания и трубопроводная обвязка", qty: "комплект", spec: "металлоконструкции", supply: "own" },
    ],
    basis: [
      constructionNote(c),
      `Объём ${input.vAvg.toFixed(0)} м³ — из расчёта (усреднение притока; ${EQUALIZATION.slugFormula.ref} — залповый сброс, при бытовом стоке не определяющий). Секций ${g.n}, обе рабочие (${EQUALIZATION.minSections.ref}); секция ${g.B}×${g.L} мм в свету при глубине ${p.waterDepthM} м — ${g.vSection.toFixed(1)} м³.`,
      `Глубина ${p.waterDepthM} м и соотношение сторон 1:${p.ratio} — ҚМҚ 2.04.03-19 не нормирует, приняты по практике (глубина по земляным работам, страница «Допущения»); борт ${p.freeboardM} м.`,
      g.mixing === "bubbling"
        ? `ВВ ${input.ss.toFixed(0)} мг/л ≤ ${EQUALIZATION.bubblingUpToSsMgL.value} — усреднитель барботажный (${EQUALIZATION.bubblingUpToSsMgL.ref}); интенсивность на 1 м барботёра: пристенные ${EQUALIZATION.bubblerIntensity.wall}, промежуточные ${EQUALIZATION.bubblerIntensity.middle} м³/(ч·м) (${EQUALIZATION.bubblerIntensity.ref}); в секции ${g.bubblerRows} нитей по ${(g.L / 1000).toFixed(1)} м (2 пристенных + ${g.bubblerMiddle} промежуточных с шагом ≤ ${p.bubblerSpacingM} м — практика) — воздух ${g.airM3H.toFixed(0)} м³/ч (для сравнения: по практике 0,65 м³/(м³·ч) — ${(g.vTotal * 0.65).toFixed(0)} м³/ч; принято по норме).`
        : `ВВ ${input.ss.toFixed(0)} мг/л > ${EQUALIZATION.bubblingUpToSsMgL.value} — механическое перемешивание (${kmkRef("6.47")}); мешалки ${g.mixerKw} кВт при ${p.mixerWPerM3} Вт/м³ (практика).`,
      `Насосы подачи на биологию ${g.pumpsWork}+1 с частотным приводом: подача ${g.pumpQ} м³/ч = ${(input.q / input.hours).toFixed(1)} м³/ч × ${p.pumpFactor} (запас — практика), напор ${p.pumpHeadM} м (практика). Усреднитель — точка выравнивания расхода: далее по цепочке расход постоянный.`,
      `Отметки: верх ${fmtE(g.top)}, вода (макс.) ${fmtE(g.water)}, дно ${fmtE(g.bottom)}, дно приямков ${fmtE(g.sumpBottom)}; вход самотёком выше уровня воды на 0,2 м — потери 0,3 м (свободное истечение, практика); выход — напорный.`,
    ],
    calc: equalCalc(input, p, g),
    headLoss: 0.3,
    draw: (sheet) => drawEqual(sheet, input, p, g, model),
  };
  return model;
}

/** диаметр воздуховода при 12 м/с (практика 10–15; ҚМҚ п. 5.33 — до 40 м/с) */
export function dnForAir(qM3H: number, v = 12): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / v / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
const f2 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

function equalCalc(input: DrawingInput, p: EqualParams, g: EqualGeometry): CalcStep[] {
  const qAvgH = input.q / Math.max(1, input.hours);
  const area = g.vSection / p.waterDepthM;
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Расчётный расход сточных вод", symbol: "Q", value: f0(input.q), unit: "м³/сут", ref: "анкета объекта" },
    { kind: "input", what: "Максимальный часовой расход", symbol: "q max", value: f1(input.qMaxH), unit: "м³/ч", ref: kmkRef("2.7", "табл. 2") },
    { kind: "input", what: "Взвешенные вещества на входе", symbol: "ВВ", value: f0(input.ss), unit: "мг/л", ref: "анкета / табл. 25 п. 6.4" },
    { kind: "input", what: "Объём усреднителя из расчёта технологии", symbol: "W ср", value: f0(input.vAvg), unit: "м³", ref: "расчёт усреднения притока" },
    { kind: "input", what: "Рабочая глубина воды", symbol: "H", value: f1(p.waterDepthM), unit: "м", ref: "коэффициенты расчёта SUVSANOAT (drawings/core/construction.ts)" },
    { kind: "input", what: "Соотношение сторон секции L:B", symbol: "k", value: f0(p.ratio), unit: "", ref: "ҚМҚ 2.04.03-19 не нормирует, принято по практике SUVSANOAT" },

    /* ---------- расчёт ---------- */
    {
      kind: "calc",
      what: "Число секций",
      symbol: "n",
      formula: "n ≥ 2, обе секции рабочие",
      substitution: "принято n = 2",
      value: String(g.n),
      unit: "шт.",
      ref: EQUALIZATION.minSections.ref,
    },
    {
      kind: "calc",
      what: "Объём одной секции",
      symbol: "W",
      formula: "W = W ср / n",
      substitution: `W = ${f0(input.vAvg)} / ${g.n}`,
      value: f1(g.vSection),
      unit: "м³",
      ref: "",
    },
    {
      kind: "calc",
      what: "Площадь секции в плане",
      symbol: "A",
      formula: "A = W / H",
      substitution: `A = ${f1(g.vSection)} / ${f1(p.waterDepthM)}`,
      value: f1(area),
      unit: "м²",
      ref: "",
    },
    {
      kind: "calc",
      what: "Ширина секции в свету",
      symbol: "B",
      formula: "B = √(A / k)",
      substitution: `B = √(${f1(area)} / ${p.ratio}) · 1000`,
      value: f0(g.B),
      unit: "мм",
      ref: "",
    },
    {
      kind: "calc",
      what: "Длина секции в свету",
      symbol: "L",
      formula: "L = A / B",
      substitution: `L = ${f1(area)} · 10⁶ / ${f0(g.B)}`,
      value: f0(g.L),
      unit: "мм",
      ref: "",
    },
    {
      kind: "calc",
      what: "Ширина распределительного лотка",
      symbol: "B лот",
      formula: "B лот = max(600; √(q max / 3600 / v)), v ≈ 0,4 м/с",
      substitution: `B лот = max(600; √(${f1(input.qMaxH)} / 3600 / 0,4) · 1000)`,
      value: f0(g.chan),
      unit: "мм",
      ref: "скорость в лотке 0,4 м/с — ҚМҚ 2.04.03-19 не нормирует, принято по практике",
    },
    {
      kind: "calc",
      what: "Способ перемешивания по концентрации ВВ",
      formula: `ВВ ≤ ${EQUALIZATION.bubblingUpToSsMgL.value} мг/л — барботаж; иначе — механические мешалки`,
      substitution: `ВВ = ${f0(input.ss)} мг/л`,
      value: g.mixing === "bubbling" ? "барботаж" : "механическое перемешивание",
      ref: g.mixing === "bubbling" ? EQUALIZATION.bubblingUpToSsMgL.ref : kmkRef("6.47"),
    },
    ...(g.mixing === "bubbling"
      ? ([
          {
            kind: "calc",
            what: "Число промежуточных нитей барботёра",
            symbol: "m",
            formula: "m = ⌈B / шаг⌉ − 1",
            substitution: `m = ⌈${f0(g.B)} / ${p.bubblerSpacingM * 1000}⌉ − 1`,
            value: String(g.bubblerMiddle),
            unit: "нити",
            ref: "шаг барботёров — ҚМҚ 2.04.03-19 не нормирует, принято по практике (норма задаёт только интенсивность на 1 м)",
          },
          {
            kind: "calc",
            what: "Расход воздуха на барботаж",
            symbol: "q air",
            formula: "q air = n · (L / 1000) · (2 · i прист + m · i пром)",
            substitution: `q air = ${g.n} · ${f1(g.L / 1000)} · (2 · ${EQUALIZATION.bubblerIntensity.wall} + ${g.bubblerMiddle} · ${EQUALIZATION.bubblerIntensity.middle})`,
            value: f0(g.airM3H),
            unit: "м³/ч",
            ref: EQUALIZATION.bubblerIntensity.ref,
          },
        ] as CalcStep[])
      : [
          {
            kind: "calc",
            what: "Мощность мешалки на секцию",
            symbol: "N",
            formula: "N = W · N уд / 100, округление до 0,1 кВт",
            substitution: `N = ${f1(g.vSection)} · ${p.mixerWPerM3} / 100`,
            value: f1(g.mixerKw),
            unit: "кВт",
            ref: `удельная мощность ${p.mixerWPerM3} Вт/м³ — ҚМҚ 2.04.03-19 не нормирует, принято по практике`,
          } as CalcStep,
        ]),
    {
      kind: "calc",
      what: "Среднечасовой расход",
      symbol: "q ср",
      formula: "q ср = Q / T",
      substitution: `q ср = ${f0(input.q)} / ${input.hours}`,
      value: f1(qAvgH),
      unit: "м³/ч",
      ref: "",
    },
    {
      kind: "calc",
      what: "Подача насосов подачи на биологию",
      symbol: "q нас",
      formula: "q нас = ⌈q ср · k зап⌉",
      substitution: `q нас = ⌈${f1(qAvgH)} · ${p.pumpFactor}⌉`,
      value: f0(g.pumpQ),
      unit: "м³/ч",
      ref: `запас ${p.pumpFactor} — ҚМҚ 2.04.03-19 не нормирует, принято по практике`,
    },
    {
      kind: "calc",
      what: "Полная высота стен",
      symbol: "H ст",
      formula: "H ст = H + h борт",
      substitution: `H ст = ${f0(g.Hw)} + ${f0(p.freeboardM * 1000)}`,
      value: f0(g.Htot),
      unit: "мм",
      ref: "борт — коэффициенты расчёта SUVSANOAT (drawings/core/construction.ts)",
    },
    {
      kind: "calc",
      what: "Габарит сооружения по наружным граням",
      formula: "W = n·B + (n+1)·δ;  L габ = L + B лот + 3·δ",
      substitution: `W = ${g.n}·${f0(g.B)} + ${g.n + 1}·${f0(g.wall)};  L = ${f0(g.L)} + ${f0(g.chan)} + 3·${f0(g.wall)}`,
      value: `${f0(g.W)} × ${f0(g.Lout)}`,
      unit: "мм",
      ref: `толщина стен ${f0(g.wall)} мм — коэффициенты расчёта SUVSANOAT`,
    },
    {
      kind: "calc",
      what: "Отметки: дно / вода (макс.) / верх борта",
      formula: "дно = верх − H ст;  вода = верх − h борт",
      substitution: `верх +${g.top.toFixed(3)}`,
      value: `${g.bottom.toFixed(3)} / ${g.water.toFixed(3)} / +${g.top.toFixed(3)}`,
      unit: "м",
      ref: "0.000 — планировочная отметка площадки",
    },
  ];
  return steps;
}

/* ==================================================================
 * ЧЕРТЁЖ: план, разрез 1-1 (продольный), разрез 2-2 (поперечный), изометрия
 * ================================================================== */

function drawEqual(sheet: Sheet, input: DrawingInput, p: EqualParams, g: EqualGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const dnIn = dnFor(input.qMaxH), dnOut = dnFor(g.pumpQ);
  const wall = g.wall;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.W;
  sheet.viewTitle(px, py + g.W + sheet.p(16), "ПЛАН");
  d.rect(px, py, g.Lout, g.W, "CONTOUR");
  const xc = px + wall; // лоток
  const x0 = xc + g.chan + wall; // начало секций
  /* лоток */
  d.rect(xc, py + wall, g.chan, g.W - 2 * wall, "CONTOUR");
  d.text(xc + g.chan / 2, py + g.W / 2, ts * 0.85, "ЛОТОК", { align: "center", rot: 90 });
  const secY = (i: number) => py + wall + i * (g.B + wall);
  for (let i = 0; i < g.n; i++) {
    const y0 = secY(i);
    d.rect(x0, y0, g.L, g.B, "CONTOUR");
    /* водослив из лотка в секцию — окно */
    d.line(x0 - wall, y0 + g.B * 0.3, x0 - wall, y0 + g.B * 0.7, "HIDDEN");
    d.arrow(x0 - wall - 100, y0 + g.B / 2, x0 + 600, y0 + g.B / 2, "FLOW", 120);
    /* приямок насоса у выходного торца */
    const sx = x0 + g.L - 300 - p.sumpMm.l, sy = y0 + g.B / 2 - p.sumpMm.w / 2;
    d.rect(sx, sy, p.sumpMm.l, p.sumpMm.w, "HIDDEN");
    d.circle(sx + p.sumpMm.l / 2, sy + p.sumpMm.w / 2, 250, "EQUIP");
    d.text(sx + p.sumpMm.l / 2, sy - ts * 1.4, ts * 0.8, `НАСОС ${i + 1} (${i === 0 ? "РАБ." : "РЕЗ."})`, { align: "center" });
    /* напорная труба насоса к общему коллектору на восточном торце */
    d.line(sx + p.sumpMm.l / 2, sy + p.sumpMm.w / 2, x0 + g.L + wall + 400, sy + p.sumpMm.w / 2, "PIPE");
    if (g.mixing === "bubbling") {
      /* барботёры вдоль секции: пристенные у стен, промежуточные равномерно */
      const xa = x0 + 300, xb = x0 + g.L - 300;
      for (let r = 0; r < g.bubblerRows; r++) {
        const y = y0 + 200 + ((g.B - 400) * r) / (g.bubblerRows - 1);
        d.line(xa, y, xb, y, "EQUIP");
        for (let x = xa + 500; x < xb; x += 1000) d.circle(x, y, 60, "EQUIP");
        d.line(xb, y, xb, y0 + g.B + (i === g.n - 1 ? wall + 200 : 0), "PIPE"); // стояк к воздушному коллектору
      }
      d.text(x0 + g.L / 2, y0 + g.B / 2 + ts * 0.4, ts * 0.85, `СЕКЦИЯ ${i + 1} — БАРБОТАЖ`, { align: "center" });
    } else {
      const mx = x0 + g.L * 0.45, my = y0 + g.B / 2;
      d.circle(mx, my, sheet.p(4), "EQUIP");
      d.line(mx - sheet.p(6), my, mx + sheet.p(6), my, "EQUIP");
      d.text(mx, my + sheet.p(6), ts, "М", { align: "center", layer: "EQUIP" });
      d.text(x0 + g.L / 2, y0 + g.B * 0.8, ts * 0.85, `СЕКЦИЯ ${i + 1} — МЕШАЛКА ${g.mixerKw} кВт`, { align: "center" });
    }
  }
  /* воздушный коллектор вдоль северной стены */
  if (g.mixing === "bubbling") {
    const ya = py + g.W + 200;
    d.line(x0 + g.L - 300, ya, px + g.Lout + sheet.p(12), ya, "PIPE");
    d.text(px + g.Lout + sheet.p(2), ya + th * 0.6, ts * 0.85, `ВОЗДУХ DN${Math.max(80, dnForAir(g.airM3H))} ОТ ВОЗДУХОДУВНОЙ`, { align: "left" });
    /* стояки от секций к коллектору — по восточной стене */
    for (let i = 0; i < g.n - 1; i++) d.line(x0 + g.L - 300, secY(i) + g.B, x0 + g.L - 300, secY(i + 1), "HIDDEN");
  }
  /* напорный коллектор к биологии */
  const yOut = py + g.W / 2;
  const xk = x0 + g.L + wall + 400;
  d.line(xk, secY(0) + g.B / 2, xk, secY(g.n - 1) + g.B / 2, "PIPE");
  d.line(xk, yOut, px + g.Lout + sheet.p(12), yOut, "PIPE");
  d.arrow(px + g.Lout + sheet.p(12), yOut, px + g.Lout + sheet.p(18), yOut, "FLOW", sheet.p(2));
  d.text(px + g.Lout + sheet.p(2), yOut - th * 1.2, ts, `НА БИОЛОГИЮ DN${dnOut} (НАПОРНЫЙ)`, { align: "left" });
  /* вход */
  d.line(px - sheet.p(12), py + g.W / 2, xc + g.chan / 2, py + g.W / 2, "PIPE");
  d.arrow(px - sheet.p(18), py + g.W / 2, px - sheet.p(12), py + g.W / 2, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), py + g.W / 2 + th * 0.6, ts, `ОТ МЕХ. ОЧИСТКИ DN${dnIn}`, { align: "right" });
  /* стены — штриховка бетона */
  d.concrete([[px, py], [px + g.Lout, py], [px + g.Lout, py + wall], [px, py + wall]], sheet.p(1.5));
  d.concrete([[px, py + g.W - wall], [px + g.Lout, py + g.W - wall], [px + g.Lout, py + g.W], [px, py + g.W]], sheet.p(1.5));
  /* размеры */
  const yd = py - sheet.p(10);
  d.dimChainH([px, xc, x0 - wall, x0, x0 + g.L, px + g.Lout], yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(10), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(45);
  const ys: number[] = [py];
  for (let i = 0; i < g.n; i++) ys.push(secY(i), secY(i) + g.B);
  ys.push(py + g.W);
  d.dimChainV(xd, Array.from(new Set(ys)).sort((a, b) => a - b), th);
  d.dimV(xd + sheet.p(10), py, py + g.W, `${g.W}`, th);
  /* марки разрезов */
  const y11 = secY(0) + g.B / 2;
  d.sectionMark(px - sheet.p(6), y11, px + g.Lout + sheet.p(6), y11, "1", th, -1);
  const x22 = x0 + g.L * 0.6;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.W + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const slab = p.slabMm;
  const Hview = g.Htot + slab + p.sumpMm.h + 800;
  const sy = yd - sheet.p(40) - Hview;
  sheet.viewTitle(px, sy + Hview + sheet.p(14), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, p, g, dnIn, dnOut);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const beside = crossBeside(g, sheet.s);
  const cx = beside ? px + g.Lout + sheet.p(75) : px;
  const cy = beside ? sy : sy - sheet.p(50) - Hview;
  sheet.viewTitle(cx, cy + Hview + sheet.p(14), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, cy, p, g);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lout + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(8) - isoLeft;
  const k = Math.min(0.5, avail / ((g.Lout + g.W) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.W * k * Math.cos(Math.PI / 6);
  const isoH = (g.Lout + g.W) * k * 0.5 + (g.Htot + slab) * k;
  const iy = f.y0 + f.h - sheet.p(34) - isoH;
  sheet.viewTitle(isoLeft, f.y0 + f.h - sheet.p(24), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, p, g, k);

  sheet.note(`Усреднитель: ${g.n} секции ${g.B}×${g.L} мм в свету (п. 6.38), глубина ${p.waterDepthM} м, борт ${p.freeboardM} м, объём ${g.vTotal.toFixed(0)} м³ (расчётный ${input.vAvg.toFixed(0)} м³).`);
  sheet.note(g.mixing === "bubbling"
    ? `Барботаж (ВВ ${input.ss.toFixed(0)} мг/л ≤ 500, п. 6.40): ${g.bubblerRows} нити на секцию, интенсивность 6/12 м³/(ч·м) (п. 6.46) — ${g.airM3H.toFixed(0)} м³/ч от воздуходувной станции.`
    : `Мешалки погружные ${g.n} шт. по ${g.mixerKw} кВт (ВВ ${input.ss.toFixed(0)} мг/л > 500, п. 6.47).`);
  sheet.note(`Насосы погружные 1+1 с ЧРП по ${g.pumpQ} м³/ч, H ${p.pumpHeadM} м — подача на биологию постоянным расходом; приямки ${p.sumpMm.l}×${p.sumpMm.w}×${p.sumpMm.h} мм.`);
  sheet.note(`Резервуар железобетонный монолитный: стены ${g.wall} мм, днище ${p.slabMm} мм, бетон ${construction().concreteGrade}. Отметки: верх ${fmtE(g.top)}, вода ${fmtE(g.water)}, дно ${fmtE(g.bottom)}; насосы, барботёры/мешалки, датчики — по спецификации; лоток, площадки и обвязка — изготовление SUVSANOAT.`);
  /* ведомость расчёта — в свободном поле под разрезами */
  const calcY = Math.min(sy, cy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: "стены и перегородки" },
    { layer: "HATCH", text: "железобетон" },
    { layer: "WATER", text: "максимальный уровень воды" },
    { layer: "EQUIP", text: g.mixing === "bubbling" ? "барботёры, насосы" : "мешалки, насосы" },
    { layer: "PIPE", text: "трубопроводы, воздуховоды" },
  ]);
}

function sectionLong(sheet: Sheet, x: number, y: number, p: EqualParams, g: EqualGeometry, dnIn: number, dnOut: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const wall = g.wall;
  const slab = p.slabMm;
  const y0 = y + p.sumpMm.h; // низ плиты основной части
  const yb = y0 + slab; // дно
  const yw = yb + g.Hw;
  const yt = yb + g.Htot;
  const groundY = yb - g.bottom * 1000;
  const xc = x + wall, x0 = xc + g.chan + wall, xe = x0 + g.L;
  const sx = xe - 300 - p.sumpMm.l;
  const poly: Pt[] = [
    [x, y0], [sx - wall, y0], [sx - wall, y0 - p.sumpMm.h], [sx + p.sumpMm.l + wall, y0 - p.sumpMm.h], [sx + p.sumpMm.l + wall, y0], [x + g.Lout, y0],
    [x + g.Lout, yt], [xe + wall, yt], [xe + wall, yb], [sx + p.sumpMm.l, yb], [sx + p.sumpMm.l, yb - p.sumpMm.h], [sx, yb - p.sumpMm.h], [sx, yb],
    [x0, yb], [x0, yt], [x0 - wall, yt], [x0 - wall, yb + 400], [xc, yb + 400], [xc, yt], [x, yt],
  ];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* лоток: дно на 400 выше дна секций, водослив в секцию */
  d.line(xc, yw + 100, x0 - wall, yw + 100, "WATER");
  d.text(xc + g.chan / 2, yt + th * 0.5, ts * 0.8, "ЛОТОК", { align: "center" });
  d.arrow(x0 - wall - 50, yw + 150, x0 + 500, yw + 150, "FLOW", 120);
  /* вода */
  d.line(x0, yw, xe, yw, "WATER");
  d.waterLevel(x0 + g.L * 0.3, yw, undefined, th);
  d.line(x0, yb + 600, xe, yb + 600, "HIDDEN"); // минимальный уровень (практика 0,6 м над дном)
  d.text(x0 + g.L * 0.5, yb + 600 + ts * 0.3, ts * 0.75, "МИН. УРОВЕНЬ (ОТКЛ. НАСОСОВ)", { align: "center" });
  /* насос в приямке с напорной трубой вверх и через стену */
  const pcx = sx + p.sumpMm.l / 2;
  d.rect(pcx - 250, yb - p.sumpMm.h + 50, 500, 700, "EQUIP");
  d.line(pcx, yb - p.sumpMm.h + 750, pcx, yt + 300, "PIPE");
  d.line(pcx, yt + 300, x + g.Lout + sheet.p(12), yt + 300, "PIPE");
  d.text(x + g.Lout + sheet.p(1), yt + 300 + th * 0.5, ts * 0.85, `НА БИОЛОГИЮ DN${dnOut}`, { align: "left" });
  d.text(pcx, yb - p.sumpMm.h - ts * 1.6, ts * 0.8, "ПРИЯМОК", { align: "center" });
  /* барботёры / мешалка */
  if (g.mixing === "bubbling") {
    d.line(x0 + 300, yb + 150, xe - 300, yb + 150, "EQUIP");
    for (let xx = x0 + 800; xx < xe - 300; xx += 1000) d.circle(xx, yb + 150, 60, "EQUIP");
    d.line(xe - 300, yb + 150, xe - 300, yt + 600, "PIPE");
    d.line(xe - 300, yt + 600, x + g.Lout + sheet.p(12), yt + 600, "PIPE");
    d.text(x + g.Lout + sheet.p(1), yt + 600 + th * 0.5, ts * 0.85, "ВОЗДУХ", { align: "left" });
    d.text(x0 + g.L / 2, yb + 150 + ts * 0.6, ts * 0.75, "БАРБОТЁРЫ", { align: "center" });
  } else {
    const mx = x0 + g.L * 0.45;
    d.line(mx, yt + 100, mx, yb + 900, "EQUIP");
    d.circle(mx, yb + 900, 250, "EQUIP");
    d.text(mx + 400, yb + 900, ts * 0.8, "МЕШАЛКА", { align: "left" });
  }
  /* вход */
  d.line(x - sheet.p(12), yw + 200, xc + g.chan / 2, yw + 200, "PIPE");
  d.text(x - sheet.p(1), yw + 200 + th * 0.6, ts * 0.85, `ОТ МЕХ. ОЧИСТКИ DN${dnIn}`, { align: "right" });
  /* грунт и отметки */
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(10), groundY, "0.000", th, -1);
  d.elevMark(x + g.Lout + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + g.Lout + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yt, fmtE(g.top), th, 1);
  d.elevMark(sx - 200, yb - p.sumpMm.h, fmtE(g.sumpBottom), th, -1);
  d.dimChainV(x - sheet.p(20), [y0, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
  d.dimChainH([x, xc, x0 - wall, x0, xe, x + g.Lout], y - sheet.p(10), th);
}

function sectionCross(sheet: Sheet, x: number, y: number, p: EqualParams, g: EqualGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const wall = g.wall;
  const slab = p.slabMm;
  const y0 = y + p.sumpMm.h;
  const yb = y0 + slab, yw = yb + g.Hw, yt = yb + g.Htot;
  const groundY = yb - g.bottom * 1000;
  const W = g.W;
  const poly: Pt[] = [[x, y0], [x + W, y0], [x + W, yt], [x + W - wall, yt], [x + W - wall, yb], [x + wall, yb], [x + wall, yt], [x, yt]];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  for (let i = 1; i < g.n; i++) {
    const xm = x + wall + i * (g.B + wall) - wall;
    d.rect(xm, yb, wall, g.Htot, "CONTOUR");
    d.concrete([[xm, yb], [xm + wall, yb], [xm + wall, yt], [xm, yt]], sheet.p(1.5));
  }
  for (let i = 0; i < g.n; i++) {
    const xs = x + wall + i * (g.B + wall);
    d.line(xs, yw, xs + g.B, yw, "WATER");
    if (g.mixing === "bubbling") {
      for (let r = 0; r < g.bubblerRows; r++) {
        const xx = xs + 200 + ((g.B - 400) * r) / (g.bubblerRows - 1);
        d.circle(xx, yb + 150, 100, "EQUIP");
        d.line(xx, yb + 250, xx, yb + 900, "THIN");
      }
      d.line(xs + 200, yb + 900, xs + g.B - 200, yb + 900, "PIPE");
      d.line(xs + g.B - 200, yb + 900, xs + g.B - 200, yt + 600, "PIPE");
    } else {
      const mx = xs + g.B / 2;
      d.line(mx, yt + 100, mx, yb + 900, "EQUIP");
      d.circle(mx, yb + 900, 250, "EQUIP");
    }
    d.text(xs + g.B / 2, yb + g.Hw * 0.5, ts * 0.85, `СЕКЦИЯ ${i + 1}`, { align: "center" });
  }
  if (g.mixing === "bubbling") {
    d.line(x - sheet.p(6), yt + 600, x + W + sheet.p(6), yt + 600, "PIPE");
    d.text(x + W / 2, yt + 600 + th * 0.5, ts * 0.85, `ВОЗДУШНЫЙ КОЛЛЕКТОР DN${Math.max(80, dnForAir(g.airM3H))}`, { align: "center" });
  }
  d.waterLevel(x + wall + g.B * 0.3, yw, undefined, th);
  d.groundLine(x - sheet.p(15), x, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(10), groundY, "0.000", th, -1);
  d.elevMark(x + W + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + W + sheet.p(8), yw, fmtE(g.water), th, 1);
  d.elevMark(x + W + sheet.p(8), yt, fmtE(g.top), th, 1);
  const xs: number[] = [x];
  for (let i = 0; i < g.n; i++) xs.push(x + wall + i * (g.B + wall), x + wall + i * (g.B + wall) + g.B);
  xs.push(x + W);
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), y - sheet.p(10), th);
  d.dimChainV(x - sheet.p(20), [y0, yb, yw, yt], th, [`${slab}`, `${g.Hw}`, `${g.Htot - g.Hw}`]);
}

function isoView(sheet: Sheet, ox: number, oy: number, p: EqualParams, g: EqualGeometry, k: number) {
  const d = sheet.d;
  const slab = p.slabMm;
  const L = g.Lout * k, W = g.W * k, H = (g.Htot + slab) * k;
  d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
  const wall = g.wall * k;
  const xc = wall, x0 = xc + g.chan * k + wall, xe = x0 + g.L * k;
  /* верхние рёбра лотка и перегородок */
  d.isoLine([x0 - wall, wall, H], [x0 - wall, W - wall, H], ox, oy, "CONTOUR");
  d.isoLine([x0, wall, H], [x0, W - wall, H], ox, oy, "CONTOUR");
  for (let i = 1; i < g.n; i++) {
    const ym = (g.wall + i * (g.B + g.wall)) * k;
    d.isoLine([x0, ym - wall, H], [xe, ym - wall, H], ox, oy, "CONTOUR");
    d.isoLine([x0, ym, H], [xe, ym, H], ox, oy, "CONTOUR");
  }
  d.isoLine([wall, wall, H], [L - wall, wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, wall, H], [L - wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([L - wall, W - wall, H], [wall, W - wall, H], ox, oy, "THIN");
  d.isoLine([wall, W - wall, H], [wall, wall, H], ox, oy, "THIN");
  /* насосы (напорные стояки) и коллектор */
  for (let i = 0; i < g.n; i++) {
    const yc = (g.wall + i * (g.B + g.wall) + g.B / 2) * k;
    const xp = xe - (300 + p.sumpMm.l / 2) * k;
    d.isoBox(xp - 250 * k, yc - 250 * k, H - g.Htot * k, 500 * k, 500 * k, 700 * k, ox, oy, "EQUIP");
    d.isoLine([xp, yc, H - g.Htot * k + 700 * k], [xp, yc, H + 300 * k], ox, oy, "PIPE");
    d.isoLine([xp, yc, H + 300 * k], [L + 400 * k, yc, H + 300 * k], ox, oy, "PIPE");
  }
  d.isoLine([L + 400 * k, (g.wall + g.B / 2) * k, H + 300 * k], [L + 400 * k, (g.W - g.wall - g.B / 2) * k, H + 300 * k], ox, oy, "PIPE");
  d.isoLine([L + 400 * k, (g.W / 2) * k, H + 300 * k], [L + sheet.p(8), (g.W / 2) * k, H + 300 * k], ox, oy, "PIPE");
  /* воздушный коллектор вдоль северной стены */
  if (g.mixing === "bubbling") d.isoLine([xe - 300 * k, W + 200 * k, H + 600 * k], [L + sheet.p(8), W + 200 * k, H + 600 * k], ox, oy, "PIPE");
  /* вход */
  d.isoLine([-sheet.p(8), W / 2, H - 200 * k], [xc + (g.chan / 2) * k, W / 2, H - 200 * k], ox, oy, "PIPE");
}
