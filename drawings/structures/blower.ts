/* ==================================================================
 * ВОЗДУХОДУВНАЯ СТАНЦИЯ — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Ряд воздуходувных агрегатов на фундаментных блоках, всасывающие
 * фильтры, общий напорный коллектор вдоль стены, отводы к сооружениям.
 * При MBR — две группы: технологический воздух (аэротенк + барботаж
 * усреднителя) и продувка мембран (расход по паспорту модулей).
 *
 * Что нормирует ҚМҚ 2.04.03-19: категория надёжности I (п. 5.1,
 * табл. 20); рабочих агрегатов ≥ 2 при подаче станции > 5000 м³/ч,
 * резерв — до 3 рабочих 1, при 4 и более 2 (п. 5.29); фильтры воздуха
 * с резервом (п. 5.32); скорость в воздуховодах до 40 м/с (п. 5.33);
 * потери в мелкопузырчатых аэраторах ≤ 7 кПа (п. 5.34).
 * Что не нормирует (помечено «практика/паспорт»): типоразмеры
 * агрегатов, скорость в коллекторе 12 м/с, потери в воздуховодах,
 * удельный расход воздуха на продувку мембран, КПД, габариты укрытия.
 *
 * Исполнение: compact/modular — навес (контейнер) на собственной раме
 * SUVSANOAT; concrete — здание (каркас, сэндвич-панели), поставка.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { EQUALIZATION, PUMP_STATIONS, kmkRef } from "../../norms/kmk-2-04-03-19";
import { mbrDefaults } from "./mbr";
import { equalDefaults, equalGeometry, dnForAir } from "./equal";

export type BlowerParams = {
  /** глубина погружения аэраторов, м (= рабочая глубина биореактора) */
  diffuserDepthM: number;
  /** потери в аэраторах, кПа (п. 5.34: мелкопузырчатые ≤ 7) */
  diffuserLossKPa: number;
  /** потери в воздуховодах и арматуре, кПа — практика */
  pipingLossKPa: number;
  /** скорость в коллекторе, м/с — практика 10–15 (п. 5.33: до 40) */
  ductVelocity: number;
  /** КПД агрегата — практика */
  efficiency: number;
  /** удельный расход воздуха на продувку мембран, м³/(м²·ч) — паспорт (принято) */
  scourM3PerM2H: number;
  /** учитывать барботаж усреднителя в технологической группе */
  includeEqualization: boolean;
  /** минимум рабочих агрегатов в группе — практика (норма: ≥ 2 при > 5000 м³/ч) */
  minWorking: number;
  /** проход между агрегатами и вдоль стен, мм (задание: ≥ 1 м) */
  aisleMm: number;
  /** толщина стен, мм (здание — сэндвич 200; навес — 0) */
  wallMm: number;
  /** отметка пола над планировкой, м */
  floorM: number;
  /** высота помещения в свету, м — практика */
  clearHeightM: number;
};

/** Здание (а не навес/контейнер) — по производительности станции, а не по
 *  исполнению ёмкостей: граница 1500 м³/ч принята по практике (шум, отопление,
 *  обслуживание крупных агрегатов); ҚМҚ 2.04.03-19 тип здания не нормирует. */
function blowerBuilding(input: DrawingInput): boolean {
  return input.air > 1500;
}

export function blowerDefaults(input: DrawingInput): BlowerParams {
  const building = blowerBuilding(input);
  return {
    diffuserDepthM: mbrDefaults(input).waterDepthM,
    diffuserLossKPa: PUMP_STATIONS.diffuserLossKPa.fine,
    pipingLossKPa: 5,
    ductVelocity: 12,
    efficiency: 0.65,
    scourM3PerM2H: 0.2,
    includeEqualization: input.chain.includes("avg"),
    minWorking: 1,
    aisleMm: 1000,
    wallMm: building ? 200 : 0,
    floorM: 0.15,
    clearHeightM: building ? 4.0 : 3.0,
  };
}

/** типоразмеры роторных/винтовых воздуходувок: подача м³/ч и габарит с кожухом, мм — паспортные, практика */
const BLOWER_SIZES = [
  { q: 100, L: 1000, W: 700, H: 1100 },
  { q: 200, L: 1200, W: 800, H: 1200 },
  { q: 400, L: 1500, W: 900, H: 1400 },
  { q: 700, L: 1800, W: 1000, H: 1500 },
  { q: 1200, L: 2200, W: 1200, H: 1700 },
  { q: 2000, L: 2600, W: 1400, H: 1900 },
  { q: 3000, L: 3000, W: 1600, H: 2100 },
  { q: 5000, L: 3500, W: 1800, H: 2300 },
];

export type BlowerGroup = {
  name: string;
  qM3H: number;
  pressureKPa: number;
  work: number;
  reserve: number;
  unit: { q: number; L: number; W: number; H: number };
  unitKw: number;
  dn: number;
  velocity: number;
};

export type BlowerGeometry = {
  groups: BlowerGroup[];
  housing: "container" | "canopy" | "building";
  units: { x: number; group: number; idx: number; reserve: boolean }[];
  /** здание/навес, мм: в свету и наружный габарит */
  L: number;
  W: number;
  Lout: number;
  Wout: number;
  wall: number;
  Hclear: number;
  Hroof: number;
  /** зоны по Y: фундаменты агрегатов, коллектор */
  yUnit: number;
  unitL: number;
  yHeader: number;
  gate: { x: number; w: number; h: number };
  headerDn: number;
  filtersTotal: number;
  totalKw: number;
  floor: number;
  bottom: number;
  top: number;
};

function reserveFor(work: number): number {
  return work <= 3 ? 1 : 2;
}

function sizeGroup(name: string, q: number, pKPa: number, p: BlowerParams, stationQ: number): BlowerGroup {
  /* рабочих: минимум по норме (≥ 2 при подаче станции > 5000 м³/ч, п. 5.29), иначе — по типоразмеру */
  let work = Math.max(p.minWorking, stationQ > 5000 ? 2 : 1);
  let unit = BLOWER_SIZES.find((s) => s.q >= q / work);
  while (!unit) {
    work += 1;
    unit = BLOWER_SIZES.find((s) => s.q >= q / work);
  }
  const reserve = reserveFor(work);
  const unitQ = q / work;
  const unitKw = Math.ceil(((unitQ / 3600) * pKPa) / p.efficiency * 10) / 10; // кВт: м³/с × кПа = кВт
  const dn = dnForAir(q, p.ductVelocity);
  const velocity = (q / 3600) / (Math.PI * Math.pow(dn / 2000, 2));
  return { name, qM3H: q, pressureKPa: pKPa, work, reserve, unit, unitKw, dn, velocity };
}

export function blowerGeometry(input: DrawingInput, p: BlowerParams): BlowerGeometry {
  const mbr = /mbr|мембран/i.test(input.tech);
  const eq = p.includeEqualization ? equalGeometry(input, equalDefaults(input)) : null;
  const qTech = input.air + (eq?.airM3H ?? 0);
  const pTech = roundTo(9.81 * p.diffuserDepthM + p.diffuserLossKPa + p.pipingLossKPa, 5);
  const qScour = mbr ? Math.ceil(mbrDefaults(input).membraneAreaM2 * p.scourM3PerM2H) : 0;
  const stationQ = qTech + qScour;
  const groups: BlowerGroup[] = [sizeGroup("Технологический воздух", qTech, pTech, p, stationQ)];
  if (mbr) {
    const pScour = roundTo(9.81 * p.diffuserDepthM + PUMP_STATIONS.diffuserLossKPa.medium + p.pipingLossKPa, 5);
    groups.push(sizeGroup("Продувка мембран", qScour, pScour, p, stationQ));
  }
  /* компоновка: агрегаты в ряд вдоль X (W агрегата — по X, L — по Y), проходы aisle */
  const units: BlowerGeometry["units"] = [];
  let x = p.aisleMm;
  let unitL = 0;
  groups.forEach((gr, gi) => {
    for (let i = 0; i < gr.work + gr.reserve; i++) {
      units.push({ x, group: gi, idx: i, reserve: i >= gr.work });
      x += gr.unit.W + p.aisleMm;
    }
    unitL = Math.max(unitL, gr.unit.L);
    if (gi < groups.length - 1) x += p.aisleMm; // разрыв между группами
  });
  const filtersTotal = units.length + 1; // по фильтру на агрегат + 1 резервный (п. 5.32)
  const cabinetL = 1200; // шкаф управления в торце — практика
  const L = roundTo(x + cabinetL + p.aisleMm, 100);
  const yUnit = p.aisleMm + 800; // коллектор (800) вдоль южной стены, затем агрегаты
  const yHeader = 400;
  const W = roundTo(yUnit + unitL + p.aisleMm, 100);
  const wall = p.wallMm;
  const housing: BlowerGeometry["housing"] = blowerBuilding(input) ? "building" : L <= 5900 && W <= 2300 ? "container" : "canopy";
  const Hclear = p.clearHeightM * 1000;
  const Hroof = Hclear + 500;
  const qTot = groups.reduce((s, g) => s + g.qM3H, 0);
  const headerDn = dnForAir(qTot, p.ductVelocity);
  const totalKw = groups.reduce((s, g) => s + g.work * g.unitKw, 0);
  return {
    groups, housing, units,
    L, W, Lout: L + 2 * wall, Wout: W + 2 * wall, wall, Hclear, Hroof,
    yUnit, unitL, yHeader,
    gate: { x: p.aisleMm, w: 2400, h: 2400 }, // ворота на восточном торце, y от южной стены
    headerDn, filtersTotal, totalKw,
    floor: p.floorM,
    bottom: p.floorM - 0.5,
    top: p.floorM + Hroof / 1000,
  };
}

function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function blowerScale(input: DrawingInput, overrides: Partial<BlowerParams> = {}): number {
  const g = blowerGeometry(input, { ...blowerDefaults(input), ...overrides });
  return fitScale(g.Lout, g.Wout, g.Hroof + 1500);
}

export function blowerModel(input: DrawingInput, overrides: Partial<BlowerParams> = {}): StructureModel {
  const p = { ...blowerDefaults(input), ...overrides };
  const g = blowerGeometry(input, p);
  const own = g.housing !== "building";
  const housingName = g.housing === "building" ? "Здание воздуходувной станции" : g.housing === "container" ? "Контейнер воздуходувной станции" : "Навес воздуходувной станции";
  const model: StructureModel = {
    id: "blower",
    kind: "blower",
    name: housingName,
    supply: own ? "own" : "supply",
    material: g.housing === "building" ? "building" : "steel",
    footprint: { shape: "rect", w: g.Wout, l: g.Lout },
    bottom: g.bottom,
    water: g.floor,
    top: g.top,
    ground: 0,
    nozzles: g.groups.map((gr, i) => ({ role: "air" as const, dn: gr.dn, side: "S" as const, pos: g.wall + 800 + i * 1200, elev: g.floor + 0.6 })),
    volumes: [
      ...g.groups.map((gr) => ({ name: `${gr.name}, м³/ч`, m3: gr.qM3H })),
      { name: "Всего воздуха, м³/ч", m3: g.groups.reduce((s, gr) => s + gr.qM3H, 0) },
    ],
    equipment: [
      ...g.groups.map((gr) => ({
        name: `Воздуходувка (${gr.name.toLowerCase()}) с ЧРП и шумозащитным кожухом`,
        qty: `${gr.work}+${gr.reserve}`,
        spec: `${Math.ceil(gr.qM3H / gr.work)} м³/ч, ${gr.pressureKPa} кПа, ~${gr.unitKw} кВт каждая`,
        supply: "supply" as const,
      })),
      { name: "Фильтры всасывающие с глушителями", qty: `${g.filtersTotal} шт. (по одному на агрегат + 1 резервный)`, supply: "supply" },
      { name: "Коллектор напорный стальной с обратными клапанами и компенсаторами", qty: `DN${g.headerDn}`, spec: g.groups.map((gr) => `${gr.name}: DN${gr.dn}`).join("; "), supply: "own" },
      { name: "Шкаф управления с ЧРП, датчики давления/расхода", qty: "1", spec: `Σ ${g.totalKw.toFixed(1)} кВт рабочих, электроснабжение I категории`, supply: "supply" },
      { name: "Вентиляция приточно-вытяжная (отвод тепла агрегатов)", qty: "комплект", supply: "supply" },
      ...(g.housing === "building"
        ? [{ name: "Здание каркасное с сэндвич-панелями, ворота 2,4×2,4 м", qty: "1", spec: `${g.Lout}×${g.Wout} мм, h=${p.clearHeightM} м`, supply: "supply" as const }]
        : [{ name: g.housing === "container" ? "Контейнер утеплённый на раме" : "Навес на стальной раме с ограждением", qty: "1", spec: `${g.Lout}×${g.Wout} мм`, supply: "own" as const }]),
      { name: "Фундаментные блоки агрегатов с виброопорами", qty: `${g.units.length} шт.`, supply: "supply" },
    ],
    basis: [
      ...g.groups.map(
        (gr) =>
          `${gr.name}: ${gr.qM3H.toFixed(0)} м³/ч${gr.name.startsWith("Техно") ? ` (аэрация ${input.air.toFixed(0)} м³/ч по ${kmkRef("6.156", "ф. (70)")}${p.includeEqualization ? " + барботаж усреднителя по п. 6.46" : ""})` : ` — ${p.scourM3PerM2H} м³/(м²·ч) на ${Math.ceil(mbrDefaults(input).membraneAreaM2)} м² мембран (паспорт производителя; при циклической продувке меньше — принято по верхней границе)`}; рабочих ${gr.work}, резервных ${gr.reserve} (${PUMP_STATIONS.blowerReserve.ref}: ${PUMP_STATIONS.blowerReserve.rule}; рабочих не менее 2 при подаче станции > 5000 м³/ч${g.groups.reduce((s, x) => s + x.qM3H, 0) > 5000 ? " — станция " + g.groups.reduce((s, x) => s + x.qM3H, 0).toFixed(0) + " м³/ч, выполнено" : " — не требуется"}).`,
      ),
      `Давление: ${p.diffuserDepthM} м погружения (${(9.81 * p.diffuserDepthM).toFixed(1)} кПа) + потери в аэраторах ${p.diffuserLossKPa} кПа (${PUMP_STATIONS.diffuserLossKPa.ref}: мелкопузырчатые ≤ 7; продувка мембран — ${PUMP_STATIONS.diffuserLossKPa.medium} кПа как среднепузырчатые) + воздуховоды ${p.pipingLossKPa} кПа (практика) → ${g.groups.map((gr) => `${gr.pressureKPa} кПа`).join(" / ")}. Мощность при КПД ${p.efficiency} (практика): Σ ${g.totalKw.toFixed(1)} кВт рабочих агрегатов.`,
      `Коллектор DN${g.headerDn} при ${p.ductVelocity} м/с (практика 10–15 м/с); скорость в отводах ${g.groups.map((gr) => `${gr.velocity.toFixed(1)} м/с (DN${gr.dn})`).join(", ")} — не более 40 м/с (${kmkRef("5.33")}).`,
      `Фильтры всасывающие: ${g.filtersTotal} шт. — по одному на агрегат и 1 резервный (${kmkRef("5.32")}). Электроснабжение I категории — перерыв подачи воздуха не допускается (${PUMP_STATIONS.blowerStationCategory.ref}).`,
      `Компоновка: проходы между агрегатами и вдоль стен ${p.aisleMm} мм (задание ≥ 1 м; практика), ${g.housing === "building" ? `здание ${g.Lout}×${g.Wout} мм, h ${p.clearHeightM} м, ворота 2,4×2,4 м под вынос агрегата` : `${g.housing === "container" ? "утеплённый контейнер" : "навес"} ${g.Lout}×${g.Wout} мм на раме SUVSANOAT`}; агрегаты на фундаментных блоках 300 мм с виброопорами (паспорт). Типоразмеры агрегатов — по каталогам производителей (практика).`,
    ],
    calc: blowerCalc(input, p, g),
    headLoss: 0,
    draw: (sheet) => drawBlower(sheet, input, p, g, model),
  };
  return model;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

function blowerCalc(input: DrawingInput, p: BlowerParams, g: BlowerGeometry): CalcStep[] {
  const mbr = /mbr|мембран/i.test(input.tech);
  const eq = p.includeEqualization ? equalGeometry(input, equalDefaults(input)) : null;
  const qTech = input.air + (eq?.airM3H ?? 0);
  const techGroup = g.groups[0];
  const scourGroup = g.groups[1];
  const qTotal = g.groups.reduce((s, gr) => s + gr.qM3H, 0);
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Расход технологического воздуха на аэрацию", symbol: "q air", value: f0(input.air), unit: "м³/ч", ref: kmkRef("6.156", "ф. (70)") },
    ...(eq
      ? ([
          { kind: "input", what: "Расход воздуха на барботаж усреднителя", symbol: "q барб", value: f0(eq.airM3H), unit: "м³/ч", ref: EQUALIZATION.bubblerIntensity.ref } as CalcStep,
        ])
      : []),
    { kind: "input", what: "Глубина погружения аэраторов (= рабочая глубина биореактора)", symbol: "H", value: f1(p.diffuserDepthM), unit: "м", ref: "ҚМҚ 2.04.03-19 не нормирует, принято по расчёту биологической ступени" },
    { kind: "input", what: "Потери давления в аэраторах", symbol: "Δp аэр", value: f1(p.diffuserLossKPa), unit: "кПа", ref: `${PUMP_STATIONS.diffuserLossKPa.ref}: мелкопузырчатые ≤ 7` },
    { kind: "input", what: "Потери давления в воздуховодах и арматуре", symbol: "Δp тр", value: f1(p.pipingLossKPa), unit: "кПа", ref: "ҚМҚ 2.04.03-19 не нормирует, принято по практике" },
    { kind: "input", what: "Скорость воздуха в коллекторе", symbol: "v", value: f1(p.ductVelocity), unit: "м/с", ref: `${kmkRef("5.33")}: не более 40 м/с (принято 10–15, практика)` },
    { kind: "input", what: "КПД воздуходувного агрегата", symbol: "η", value: p.efficiency.toFixed(2), unit: "", ref: "ҚМҚ 2.04.03-19 не нормирует, принято по практике" },
    ...(mbr
      ? ([
          { kind: "input", what: "Площадь мембран", symbol: "F мем", value: f0(mbrDefaults(input).membraneAreaM2), unit: "м²", ref: "расчёт MBR (см. лист «Мембранный биореактор»)" },
          { kind: "input", what: "Удельный расход воздуха на продувку мембран", symbol: "q уд", value: p.scourM3PerM2H.toFixed(2), unit: "м³/(м²·ч)", ref: "паспорт производителя мембран, ҚМҚ 2.04.03-19 не нормирует" },
        ] as CalcStep[])
      : []),

    /* ---------- расчёт ---------- */
    {
      kind: "calc",
      what: "Расход технологического воздуха (аэрация + барботаж усреднителя)",
      symbol: "q тех",
      formula: eq ? "q тех = q air + q барб" : "q тех = q air",
      substitution: eq ? `q тех = ${f0(input.air)} + ${f0(eq.airM3H)}` : `q тех = ${f0(input.air)}`,
      value: f0(qTech),
      unit: "м³/ч",
      ref: "",
    },
    {
      kind: "calc",
      what: "Давление технологической группы",
      symbol: "p тех",
      formula: "p тех = 9,81 · H + Δp аэр + Δp тр",
      substitution: `p тех = 9,81 · ${f1(p.diffuserDepthM)} + ${f1(p.diffuserLossKPa)} + ${f1(p.pipingLossKPa)}`,
      value: f1(techGroup.pressureKPa),
      unit: "кПа",
      ref: "",
    },
    ...(mbr && scourGroup
      ? ([
          {
            kind: "calc",
            what: "Расход воздуха на продувку мембран",
            symbol: "q скор",
            formula: "q скор = ⌈F мем · q уд⌉",
            substitution: `q скор = ⌈${f0(mbrDefaults(input).membraneAreaM2)} · ${p.scourM3PerM2H}⌉`,
            value: f0(scourGroup.qM3H),
            unit: "м³/ч",
            ref: "",
          },
          {
            kind: "calc",
            what: "Давление группы продувки мембран",
            symbol: "p скор",
            formula: "p скор = 9,81 · H + Δp аэр(средн.) + Δp тр",
            substitution: `p скор = 9,81 · ${f1(p.diffuserDepthM)} + ${PUMP_STATIONS.diffuserLossKPa.medium} + ${f1(p.pipingLossKPa)}`,
            value: f1(scourGroup.pressureKPa),
            unit: "кПа",
            ref: `${PUMP_STATIONS.diffuserLossKPa.ref} — среднепузырчатые аэраторы продувки`,
          },
        ] as CalcStep[])
      : []),
    {
      kind: "calc",
      what: "Суммарная подача станции",
      symbol: "Q ст",
      formula: mbr ? "Q ст = q тех + q скор" : "Q ст = q тех",
      substitution: mbr && scourGroup ? `Q ст = ${f0(qTech)} + ${f0(scourGroup.qM3H)}` : `Q ст = ${f0(qTech)}`,
      value: f0(qTotal),
      unit: "м³/ч",
      ref: "",
    },
    {
      kind: "check",
      what: "Число рабочих агрегатов в группе не менее 2 при подаче станции > 5000 м³/ч",
      formula: "n раб ≥ 2 при Q ст > 5000 м³/ч",
      substitution: `Q ст = ${f0(qTotal)} м³/ч`,
      value: qTotal > 5000 && techGroup.work < 2 ? `НЕ выполняется (n раб = ${techGroup.work})` : `выполняется (n раб = ${techGroup.work}${qTotal > 5000 ? "" : ", требование не наступает"})`,
      ref: kmkRef("5.29"),
    },
    ...g.groups.map(
      (gr): CalcStep => ({
        kind: "calc",
        what: `Резерв агрегатов группы «${gr.name}»`,
        symbol: "n рез",
        formula: "n рез = 1 при n раб ≤ 3, иначе 2",
        substitution: `n раб = ${gr.work}`,
        value: String(gr.reserve),
        unit: "шт.",
        ref: `${PUMP_STATIONS.blowerReserve.ref}: ${PUMP_STATIONS.blowerReserve.rule}`,
      }),
    ),
    ...g.groups.map(
      (gr): CalcStep => ({
        kind: "calc",
        what: `Подача одного агрегата группы «${gr.name}»`,
        symbol: "q аг",
        formula: "q аг = q группы / n раб",
        substitution: `q аг = ${f0(gr.qM3H)} / ${gr.work}`,
        value: f0(gr.qM3H / gr.work),
        unit: "м³/ч",
        ref: "типоразмер — по каталогу производителя, практика",
      }),
    ),
    ...g.groups.map(
      (gr): CalcStep => ({
        kind: "calc",
        what: `Потребляемая мощность агрегата группы «${gr.name}»`,
        symbol: "N",
        formula: "N = (q аг / 3600) · p / η",
        substitution: `N = (${f0(gr.qM3H / gr.work)} / 3600) · ${f1(gr.pressureKPa)} / ${p.efficiency.toFixed(2)}`,
        value: gr.unitKw.toFixed(1),
        unit: "кВт",
        ref: "",
      }),
    ),
    {
      kind: "calc",
      what: "Диаметр общего напорного коллектора",
      symbol: "DN",
      formula: "DN по Q ст при скорости v",
      substitution: `d = √(4 · ${f0(qTotal)} / 3600 / ${p.ductVelocity} / π) · 1000`,
      value: `DN${g.headerDn}`,
      unit: "мм",
      ref: `ряд DN по ГОСТ; скорость ${p.ductVelocity} м/с — практика`,
    },
    ...g.groups.map(
      (gr): CalcStep => ({
        kind: "check",
        what: `Скорость в отводе группы «${gr.name}» не более 40 м/с`,
        formula: "v = q / (3600 · π · (DN/2000)²) ≤ 40 м/с",
        substitution: `v = ${f0(gr.qM3H)} / (3600 · π · (${gr.dn}/2000)²) = ${gr.velocity.toFixed(1)} м/с`,
        value: gr.velocity <= 40 ? "выполняется" : "НЕ выполняется",
        ref: kmkRef("5.33"),
      }),
    ),
    {
      kind: "calc",
      what: "Число фильтров всасывающих",
      symbol: "n ф",
      formula: "n ф = n агрегатов + 1 резервный",
      substitution: `n ф = ${g.units.length} + 1`,
      value: String(g.filtersTotal),
      unit: "шт.",
      ref: kmkRef("5.32"),
    },
    {
      kind: "calc",
      what: "Суммарная мощность рабочих агрегатов",
      symbol: "ΣN",
      formula: "ΣN = Σ (n раб · N агрегата)",
      substitution: g.groups.map((gr) => `${gr.work}·${gr.unitKw.toFixed(1)}`).join(" + "),
      value: g.totalKw.toFixed(1),
      unit: "кВт",
      ref: `электроснабжение категории ${PUMP_STATIONS.blowerStationCategory.value} — ${PUMP_STATIONS.blowerStationCategory.ref}`,
    },
  ];
  return steps;
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawBlower(sheet: Sheet, input: DrawingInput, p: BlowerParams, g: BlowerGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const wall = g.wall;
  const building = g.housing === "building";

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.Wout;
  sheet.viewTitle(px, py + g.Wout + sheet.p(16), `ПЛАН НА ОТМ. ${fmtE(g.floor + 1)}`);
  const ix0 = px + wall, iy0 = py + wall;
  d.rect(px, py, g.Lout, g.Wout, "CONTOUR");
  if (building) {
    d.rect(ix0, iy0, g.L, g.W, "CONTOUR");
    for (const poly of [
      [[px, py], [px + g.Lout, py], [px + g.Lout, py + wall], [px, py + wall]],
      [[px, py + g.Wout - wall], [px + g.Lout, py + g.Wout - wall], [px + g.Lout, py + g.Wout], [px, py + g.Wout]],
      [[px, py], [px + wall, py], [px + wall, py + g.Wout], [px, py + g.Wout]],
      [[px + g.Lout - wall, py], [px + g.Lout, py], [px + g.Lout, py + g.Wout], [px + g.Lout - wall, py + g.Wout]],
    ] as Pt[][]) d.hatch(poly, sheet.p(1), 45);
    /* ворота на восточном торце */
    const gy = iy0 + g.gate.x, gxw = px + g.Lout - wall;
    d.line(gxw, gy, px + g.Lout, gy, "CONTOUR");
    d.line(gxw, gy + g.gate.w, px + g.Lout, gy + g.gate.w, "CONTOUR");
    d.line(gxw + wall / 2, gy, gxw + wall / 2, gy + g.gate.w, "THIN");
    d.arc(gxw, gy, g.gate.w / 2, 90, 180, "THIN");
    d.text(gxw - ts * 0.8, gy + g.gate.w / 2, ts, `ВОРОТА ${g.gate.w}×${g.gate.h}`, { align: "center", rot: 90 });
  } else {
    /* навес/контейнер: колонны рамы по периметру */
    const nx = Math.max(2, Math.ceil(g.L / 3000) + 1);
    for (let i = 0; i < nx; i++) {
      const x = px + 100 + ((g.Lout - 200 - 150) * i) / (nx - 1);
      for (const y of [py + 100, py + g.Wout - 250]) d.rect(x, y, 150, 150, "CONTOUR");
    }
    d.rect(px + 60, py + 60, g.Lout - 120, g.Wout - 120, "THIN");
  }
  /* коллектор вдоль южной стены */
  const yh = iy0 + g.yHeader;
  d.line(ix0 + 400, yh, ix0 + g.L - 400, yh, "PIPE");
  d.line(ix0 + 400, yh + 120, ix0 + g.L - 400, yh + 120, "PIPE");
  d.text(ix0 + g.L / 2, yh - ts * 1.5, ts * 0.85, `НАПОРНЫЙ КОЛЛЕКТОР DN${g.headerDn}`, { align: "center" });
  /* агрегаты */
  for (const u of g.units) {
    const gr = g.groups[u.group];
    const ux = ix0 + u.x, uy = iy0 + g.yUnit;
    d.rect(ux - 150, uy - 150, gr.unit.W + 300, gr.unit.L + 300, "THIN"); // фундаментный блок
    d.rect(ux, uy, gr.unit.W, gr.unit.L, "EQUIP");
    d.circle(ux + gr.unit.W / 2, uy + gr.unit.L * 0.35, gr.unit.W * 0.3, "EQUIP"); // ротор/кожух
    d.rect(ux + gr.unit.W * 0.2, uy + gr.unit.L * 0.65, gr.unit.W * 0.6, gr.unit.L * 0.3, "EQUIP"); // двигатель
    /* фильтр на всасе (сверху) */
    d.circle(ux + gr.unit.W / 2, uy + gr.unit.L + 350, 200, "EQUIP");
    /* напорный патрубок к коллектору с обратным клапаном */
    d.line(ux + gr.unit.W / 2, uy, ux + gr.unit.W / 2, yh + 120, "PIPE");
    d.rect(ux + gr.unit.W / 2 - 100, uy - 500, 200, 250, "EQUIP");
    d.text(ux + gr.unit.W / 2, uy + gr.unit.L + 700, ts * 0.8, `${u.group === 0 ? "В" : "М"}${u.idx + 1} ${u.reserve ? "РЕЗ." : "РАБ."}`, { align: "center" });
  }
  /* подписи групп */
  g.groups.forEach((gr, gi) => {
    const us = g.units.filter((u) => u.group === gi);
    const xa = ix0 + us[0].x, xb = ix0 + us[us.length - 1].x + gr.unit.W;
    d.text((xa + xb) / 2, py + g.Wout + sheet.p(3), ts * 0.85, `${gr.name.toUpperCase()} ${gr.qM3H.toFixed(0)} м³/ч`, { align: "center" });
    /* отвод группы через южную стену */
    const xo = xa + 600 + gi * 0;
    const xs = gi === 0 ? ix0 + 400 : ix0 + g.L - 400;
    d.line(xs, yh, xs, py - sheet.p(10), "PIPE");
    d.arrow(xs, py - sheet.p(10), xs, py - sheet.p(16), "FLOW", sheet.p(2));
    d.text(xs + th * 0.5, py - sheet.p(14), ts * 0.85, `${gi === 0 ? "К БИОРЕАКТОРУ / УСРЕДНИТЕЛЮ" : "К МЕМБРАНАМ"} DN${gr.dn}`, { align: "left" });
    void xo;
  });
  /* разделение коллектора на две группы — заглушка/задвижка посередине */
  if (g.groups.length > 1) {
    const uLast = g.units.filter((u) => u.group === 0).slice(-1)[0];
    const xsplit = ix0 + uLast.x + g.groups[0].unit.W + p.aisleMm;
    d.rect(xsplit - 100, yh - 100, 200, 320, "EQUIP");
    d.text(xsplit, yh + 500, ts * 0.75, "ЗАДВИЖКА", { align: "center" });
  }
  /* шкаф управления в торце */
  const cx0 = ix0 + g.L - p.aisleMm - 1200;
  d.rect(cx0, iy0 + g.yUnit + 200, 1200, 600, "EQUIP");
  d.text(cx0 + 600, iy0 + g.yUnit + 1000, ts * 0.8, "ШКАФ ЧРП", { align: "center" });
  /* размеры */
  const yd = py - sheet.p(22);
  const xs = [px, ix0, ...g.units.map((u) => ix0 + u.x), ...g.units.map((u) => ix0 + u.x + g.groups[u.group].unit.W), cx0, ix0 + g.L, px + g.Lout];
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(9), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(20);
  d.dimChainV(xd, Array.from(new Set([py, iy0, iy0 + g.yUnit, iy0 + g.yUnit + g.unitL, iy0 + g.W, py + g.Wout])).sort((a, b) => a - b), th);
  d.dimV(xd + sheet.p(9), py, py + g.Wout, `${g.Wout}`, th);
  const y11 = iy0 + g.yUnit + g.unitL * 0.35;
  d.sectionMark(px - sheet.p(6), y11, px + g.Lout + sheet.p(6), y11, "1", th, -1);
  const x22 = ix0 + g.units[0].x + g.groups[0].unit.W / 2;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.Wout + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 (вдоль ряда) ---------------- */
  const slab = 400;
  const Hview = g.Hroof + slab + 300;
  const sy = yd - sheet.p(40) - Hview;
  sheet.viewTitle(px, sy + Hview + sheet.p(12), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, p, g);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const beside = (g.Lout + g.Wout) / sheet.s + 75 <= 600;
  const cx = beside ? px + g.Lout + sheet.p(75) : px;
  const cy = beside ? sy : sy - sheet.p(45) - Hview;
  sheet.viewTitle(cx, cy + Hview + sheet.p(12), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, cy, p, g);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lout + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(8) - isoLeft;
  const k = Math.min(0.5, avail / ((g.Lout + g.Wout) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.Wout * k * Math.cos(Math.PI / 6);
  const isoH = (g.Lout + g.Wout) * k * 0.5 + g.Hroof * k;
  const iy = f.y0 + f.h - sheet.p(34) - isoH;
  sheet.viewTitle(isoLeft, f.y0 + f.h - sheet.p(24), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k);

  sheet.note(`Воздуходувная станция: ${g.groups.map((gr) => `${gr.name.toLowerCase()} ${gr.qM3H.toFixed(0)} м³/ч, ${gr.pressureKPa} кПа — ${gr.work}+${gr.reserve} агрегата по ${Math.ceil(gr.qM3H / gr.work)} м³/ч`).join("; ")} (п. 5.29).`);
  sheet.note(`Коллектор DN${g.headerDn}, скорость ${p.ductVelocity} м/с (п. 5.33 — до 40 м/с); фильтры всасывающие ${g.filtersTotal} шт. с резервом (п. 5.32); потери в аэраторах ${p.diffuserLossKPa} кПа (п. 5.34).`);
  sheet.note(`${building ? `Здание ${g.Lout}×${g.Wout} мм, h ${p.clearHeightM} м, каркас, сэндвич-панели, ворота ${g.gate.w}×${g.gate.h}` : `${g.housing === "container" ? "Контейнер" : "Навес"} ${g.Lout}×${g.Wout} мм на раме SUVSANOAT`}; проходы ≥ ${p.aisleMm} мм; агрегаты на фундаментных блоках с виброопорами. Электроснабжение I категории (табл. 20).`);
  sheet.note(`Агрегаты, фильтры, шкаф ЧРП, вентиляция — поставка; коллектор и ${building ? "" : "рама/навес, "}обвязка — изготовление SUVSANOAT. Типоразмеры — по каталогу производителя (практика).`);
  /* ведомость расчёта — в свободном поле под разрезами */
  const calcY = Math.min(sy, cy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: building ? "стены, колонны, фундаменты" : "рама, колонны навеса" },
    { layer: "EQUIP", text: "воздуходувки, фильтры, арматура" },
    { layer: "PIPE", text: "воздуховоды" },
    { layer: "WATER", text: "отметка пола" },
  ]);
  void input;
}

function sectionLong(sheet: Sheet, x: number, y: number, p: BlowerParams, g: BlowerGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const slab = 400;
  const yf = y + slab;
  const yc = yf + g.Hclear;
  const yr = yf + g.Hroof;
  const groundY = yf - g.floor * 1000;
  const building = g.housing === "building";
  d.rect(x - 300, y, g.Lout + 600, slab, "CONTOUR");
  d.concrete([[x - 300, y], [x + g.Lout + 300, y], [x + g.Lout + 300, y + slab], [x - 300, y + slab]], sheet.p(1.5));
  if (building) {
    d.rect(x, yf, g.wall, yr - yf, "CONTOUR");
    d.rect(x + g.Lout - g.wall, yf, g.wall, yr - yf, "CONTOUR");
    d.hatch([[x, yf], [x + g.wall, yf], [x + g.wall, yr], [x, yr]], sheet.p(1), 45);
    d.hatch([[x + g.Lout - g.wall, yf], [x + g.Lout, yf], [x + g.Lout, yr], [x + g.Lout - g.wall, yr]], sheet.p(1), 45);
  } else {
    const nx = Math.max(2, Math.ceil(g.L / 3000) + 1);
    for (let i = 0; i < nx; i++) {
      const cx = x + 100 + ((g.Lout - 200 - 150) * i) / (nx - 1);
      d.rect(cx, yf, 150, yc - yf, "CONTOUR");
    }
  }
  d.line(x - 200, yc, x + g.Lout + 200, yc, "CONTOUR");
  d.line(x - 200, yr, x + g.Lout + 200, yr, "CONTOUR");
  d.text(x + g.Lout / 2, yr + th * 0.5, ts, building ? "ПОКРЫТИЕ ПО СТАЛЬНЫМ БАЛКАМ" : "НАВЕС — ПРОФЛИСТ ПО СТАЛЬНОЙ РАМЕ", { align: "center" });
  /* агрегаты на блоках, фильтры, коллектор за ними (скрытый) */
  const yh = yf + 600;
  d.line(x + g.wall + 400, yh, x + g.wall + g.L - 400, yh, "HIDDEN");
  d.text(x + g.wall + g.L / 2, yh - th * 1.2, ts * 0.8, `КОЛЛЕКТОР DN${g.headerDn} (ЗА АГРЕГАТАМИ)`, { align: "center" });
  for (const u of g.units) {
    const gr = g.groups[u.group];
    const ux = x + g.wall + u.x;
    d.rect(ux - 150, yf, gr.unit.W + 300, 300, "CONTOUR");
    d.concrete([[ux - 150, yf], [ux + gr.unit.W + 150, yf], [ux + gr.unit.W + 150, yf + 300], [ux - 150, yf + 300]], sheet.p(1.5));
    d.rect(ux, yf + 300, gr.unit.W, gr.unit.H, "EQUIP");
    d.rect(ux + gr.unit.W * 0.15, yf + 300 + gr.unit.H * 0.15, gr.unit.W * 0.7, gr.unit.H * 0.5, "THIN");
    /* фильтр на всасе сверху */
    d.line(ux + gr.unit.W / 2, yf + 300 + gr.unit.H, ux + gr.unit.W / 2, yf + 300 + gr.unit.H + 500, "PIPE");
    d.rect(ux + gr.unit.W / 2 - 200, yf + 300 + gr.unit.H + 500, 400, 350, "EQUIP");
    d.text(ux + gr.unit.W / 2, yf + 300 + gr.unit.H + 1000, ts * 0.8, `${u.group === 0 ? "В" : "М"}${u.idx + 1}`, { align: "center" });
  }
  /* шкаф */
  const cx0 = x + g.wall + g.L - p.aisleMm - 1200;
  d.rect(cx0, yf, 1200, 2000, "EQUIP");
  d.text(cx0 + 600, yf + 2000 + th * 0.5, ts * 0.8, "ШКАФ ЧРП", { align: "center" });
  /* земля, отметки, размеры */
  d.groundLine(x - sheet.p(15), x - 300, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout + 300, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.line(x + g.wall, yf, x + g.Lout - g.wall, yf, "WATER");
  d.elevMark(x + g.Lout + sheet.p(14), groundY, "0.000", th, -1);
  d.elevMark(x - sheet.p(8), yf, fmtE(g.floor), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yc, fmtE(g.floor + g.Hclear / 1000), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yr, fmtE(g.top), th, 1);
  d.dimChainV(x - sheet.p(22), [y, yf, yf + 300, yc, yr], th, [`${slab}`, "300", `${g.Hclear - 300}`, `${g.Hroof - g.Hclear}`]);
  const xs = [x, x + g.wall, ...g.units.map((u) => x + g.wall + u.x), ...g.units.map((u) => x + g.wall + u.x + g.groups[u.group].unit.W), x + g.Lout - g.wall, x + g.Lout];
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), y - sheet.p(10), th);
}

function sectionCross(sheet: Sheet, x: number, y: number, p: BlowerParams, g: BlowerGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const slab = 400;
  const yf = y + slab, yc = yf + g.Hclear, yr = yf + g.Hroof;
  const groundY = yf - g.floor * 1000;
  const W = g.Wout;
  const building = g.housing === "building";
  d.rect(x - 300, y, W + 600, slab, "CONTOUR");
  d.concrete([[x - 300, y], [x + W + 300, y], [x + W + 300, y + slab], [x - 300, y + slab]], sheet.p(1.5));
  if (building) {
    d.rect(x, yf, g.wall, yc - yf, "CONTOUR");
    d.rect(x + W - g.wall, yf, g.wall, yc - yf, "CONTOUR");
    d.hatch([[x, yf], [x + g.wall, yf], [x + g.wall, yc], [x, yc]], sheet.p(1), 45);
    d.hatch([[x + W - g.wall, yf], [x + W, yf], [x + W, yc], [x + W - g.wall, yc]], sheet.p(1), 45);
  } else {
    d.rect(x + 100, yf, 150, yc - yf, "CONTOUR");
    d.rect(x + W - 250, yf, 150, yc - yf, "CONTOUR");
  }
  /* односкатное покрытие */
  d.poly([[x - 200, yc], [x + W + 200, yc + (g.Hroof - g.Hclear) * 0.6], [x + W + 200, yr], [x - 200, yc + (g.Hroof - g.Hclear) * 0.4]], "CONTOUR", true);
  /* коллектор у южной стены */
  const gr = g.groups[0];
  const yh = yf + 600;
  const xh = x + g.wall + g.yHeader;
  d.circle(xh, yh, g.headerDn / 2, "PIPE");
  d.text(xh, yh + g.headerDn / 2 + th * 0.5, ts * 0.8, `DN${g.headerDn}`, { align: "center" });
  /* агрегат на блоке */
  const ux = x + g.wall + g.yUnit;
  d.rect(ux - 150, yf, gr.unit.L + 300, 300, "CONTOUR");
  d.concrete([[ux - 150, yf], [ux + gr.unit.L + 150, yf], [ux + gr.unit.L + 150, yf + 300], [ux - 150, yf + 300]], sheet.p(1.5));
  d.rect(ux, yf + 300, gr.unit.L, gr.unit.H, "EQUIP");
  d.circle(ux + gr.unit.L * 0.35, yf + 300 + gr.unit.H * 0.5, gr.unit.H * 0.3, "EQUIP");
  d.rect(ux + gr.unit.L * 0.65, yf + 300 + gr.unit.H * 0.2, gr.unit.L * 0.3, gr.unit.H * 0.5, "THIN");
  d.text(ux + gr.unit.L / 2, yf + 300 + gr.unit.H + th * 0.6, ts * 0.85, "ВОЗДУХОДУВКА", { align: "center" });
  /* напорный патрубок к коллектору */
  d.line(ux, yh, xh + g.headerDn / 2, yh, "PIPE");
  d.rect(ux - 350, yh - 100, 250, 200, "EQUIP");
  /* фильтр всасывания */
  d.line(ux + gr.unit.L + 100, yf + 300 + gr.unit.H * 0.6, ux + gr.unit.L + 350, yf + 300 + gr.unit.H * 0.6, "PIPE");
  d.rect(ux + gr.unit.L + 350, yf + 300 + gr.unit.H * 0.6 - 200, 350, 400, "EQUIP");
  d.text(ux + gr.unit.L + 520, yf + 300 + gr.unit.H * 0.6 + 350, ts * 0.75, "ФИЛЬТР", { align: "center" });
  /* проходы */
  d.text(x + g.wall + p.aisleMm / 2, yf + 300, ts * 0.75, `ПРОХОД ${p.aisleMm}`, { align: "center", rot: 90 });
  d.text(x + W - g.wall - p.aisleMm / 2, yf + 300, ts * 0.75, `ПРОХОД ${p.aisleMm}`, { align: "center", rot: 90 });
  /* земля, отметки, размеры */
  d.groundLine(x - sheet.p(15), x - 300, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W + 300, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.line(x + g.wall, yf, x + W - g.wall, yf, "WATER");
  d.elevMark(x + W + sheet.p(14), groundY, "0.000", th, -1);
  d.elevMark(x - sheet.p(8), yf, fmtE(g.floor), th, 1);
  d.elevMark(x + W + sheet.p(8), yr, fmtE(g.top), th, 1);
  d.dimChainV(x - sheet.p(22), [y, yf, yf + 300, yc, yr], th, [`${slab}`, "300", `${g.Hclear - 300}`, `${g.Hroof - g.Hclear}`]);
  d.dimChainH(Array.from(new Set([x, x + g.wall, ux, ux + gr.unit.L, x + W - g.wall, x + W])).sort((a, b) => a - b), y - sheet.p(10), th);
}

function isoView(sheet: Sheet, ox: number, oy: number, g: BlowerGeometry, k: number) {
  const d = sheet.d;
  const L = g.Lout * k, W = g.Wout * k, H = g.Hclear * k, Hr = g.Hroof * k;
  const building = g.housing === "building";
  if (building) {
    d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
    /* односкатная крыша: выше у северной стены */
    d.isoLine([0, 0, H], [0, W, Hr], ox, oy, "CONTOUR");
    d.isoLine([L, 0, H], [L, W, Hr], ox, oy, "CONTOUR");
    d.isoLine([0, W, Hr], [L, W, Hr], ox, oy, "CONTOUR");
    const gy = (g.wall + g.gate.x) * k, gw = g.gate.w * k, gh = g.gate.h * k;
    d.isoLine([L, gy, 0], [L, gy, gh], ox, oy, "THIN");
    d.isoLine([L, gy + gw, 0], [L, gy + gw, gh], ox, oy, "THIN");
    d.isoLine([L, gy, gh], [L, gy + gw, gh], ox, oy, "THIN");
  } else {
    /* навес: плита, колонны, кровля; агрегаты видны */
    d.isoBox(0, 0, -300 * k, L, W, 300 * k, ox, oy, "CONTOUR");
    const nx = Math.max(2, Math.ceil(g.L / 3000) + 1);
    for (let i = 0; i < nx; i++) {
      const cx = (100 + ((g.Lout - 350) * i) / (nx - 1)) * k;
      for (const cy of [100 * k, W - 250 * k]) d.isoLine([cx, cy, 0], [cx, cy, H], ox, oy, "CONTOUR");
    }
    d.isoBox(-200 * k, -200 * k, H, L + 400 * k, W + 400 * k, 150 * k, ox, oy, "CONTOUR");
    for (const u of g.units) {
      const gr = g.groups[u.group];
      d.isoBox((g.wall + u.x) * k, (g.wall + g.yUnit) * k, 300 * k, gr.unit.W * k, gr.unit.L * k, gr.unit.H * k, ox, oy, "EQUIP");
    }
    /* коллектор */
    d.isoLine([(g.wall + 400) * k, (g.wall + g.yHeader) * k, 600 * k], [(g.wall + g.L - 400) * k, (g.wall + g.yHeader) * k, 600 * k], ox, oy, "PIPE");
  }
  /* отводы воздуха через южную стену */
  g.groups.forEach((gr, gi) => {
    const xs = gi === 0 ? (g.wall + 400) * k : (g.wall + g.L - 400) * k;
    d.isoLine([xs, 0, 600 * k], [xs, -sheet.p(8), 600 * k], ox, oy, "PIPE");
    void gr;
  });
}
