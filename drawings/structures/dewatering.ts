/* ==================================================================
 * ЗДАНИЕ МЕХАНИЧЕСКОГО ОБЕЗВОЖИВАНИЯ ОСАДКА — МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Отапливаемое здание (каркас, сэндвич-панели) с обезвоживающими
 * агрегатами, узлом приготовления флокулянта, насосами подачи ила и
 * отсеком контейнеров кека с воротами под автомобиль.
 *
 * Агрегат: шнековый дегидратор (корпус и рама — SUVSANOAT, шнек-барабан
 * — покупной) при dryKg ≤ 800 кг СВ/сут; декантерная центрифуга при
 * большем (производительность по ф. (136) п. 6.388 с учётом снижения в
 * 2 раза при флокулянте). Резерв по п. 6.392: центрифуги — при рабочих
 * до 2 одна резервная; для шнековых дегидраторов норма резерв не задаёт
 * — принят 1 по аналогии.
 *
 * Флокулянт катионный 2–7 кг/т СВ (п. 6.391; для активного ила —
 * верхняя часть диапазона, принято 6). Кек 18 % СВ (табл. 69 / п. 6.391:
 * уплотнённый активный ил 17–20 % на фильтр-прессе; шнековый дегидратор
 * нормой не описан — принято по паспорту). Контейнер кека на 3–4 суток
 * (принято 3,5 — практика; склад на 3–4 мес по п. 6.417 — вне здания).
 * Фугат/фильтрат — в голову сооружений (п. 6.390–6.391).
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { SLUDGE, kmkRef } from "../../norms/kmk-2-04-03-19";
import { stabilizerDefaults, stabilizerGeometry } from "./stabilizer";

export type DewateringParams = {
  /** агрегат: авто — шнековый ≤ 800 кг СВ/сут, иначе центрифуга */
  machine: "auto" | "screw" | "centrifuge";
  /** часов работы в сутки: 8 (одна смена) при ≤ 300 кг СВ/сут, иначе 16 — практика */
  hoursPerDay: number;
  /** доза флокулянта, кг/т СВ (2–7, п. 6.391) */
  flocKgPerT: number;
  /** концентрация рабочего раствора флокулянта, % — практика */
  flocSolutionPct: number;
  /** сухое вещество кека, % */
  cakeDsPct: number;
  /** запас контейнеров кека, сут (3–4 — задание) */
  cakeDays: number;
  /** высота помещения до низа несущих конструкций, м — практика */
  clearHeightM: number;
  /** толщина стен (сэндвич-панели по каркасу), мм */
  wallMm: number;
  /** отметка пола над планировкой, м */
  floorM: number;
};

export function dewateringDefaults(input: DrawingInput): DewateringParams {
  return {
    machine: "auto",
    hoursPerDay: input.dryKg <= 300 ? 8 : 16,
    flocKgPerT: 6,
    flocSolutionPct: 0.2,
    cakeDsPct: 18,
    cakeDays: 3.5,
    clearHeightM: input.dryKg > 800 ? 5.0 : 4.5,
    wallMm: 200,
    floorM: 0.15,
  };
}

/** типоразмеры шнековых дегидраторов (паспортные, практика SUVSANOAT): кг СВ/ч, габарит L×W×H, мм */
const SCREW_SIZES = [
  { kgH: 15, L: 2600, W: 900, H: 1500 },
  { kgH: 30, L: 3200, W: 1000, H: 1600 },
  { kgH: 60, L: 3800, W: 1100, H: 1700 },
  { kgH: 120, L: 4600, W: 1300, H: 1900 },
  { kgH: 200, L: 5500, W: 1600, H: 2100 },
  { kgH: 300, L: 6500, W: 1900, H: 2300 },
];
/** роторы центрифуг: d и l, м (l/d = 3 — в пределах 2,5–4 по п. 6.391); габарит с приводом — практика */
const CENTRIFUGE_SIZES = [
  { d: 0.35, l: 1.05, L: 3600, W: 1400, H: 1500 },
  { d: 0.45, l: 1.35, L: 4200, W: 1600, H: 1700 },
  { d: 0.55, l: 1.65, L: 4800, W: 1800, H: 1900 },
  { d: 0.65, l: 2.0, L: 5600, W: 2000, H: 2100 },
];
/** контейнеры кека (мультилифт), м³ и габарит, мм — практика */
const CONTAINERS = [
  { m3: 8, L: 3700, W: 2400, H: 1400 },
  { m3: 12, L: 4500, W: 2400, H: 1600 },
  { m3: 20, L: 6000, W: 2400, H: 2000 },
];

export type DewateringGeometry = {
  machine: "screw" | "centrifuge";
  qSludge: number; // м³/сут на обезвоживание
  moistureIn: number;
  qFeedH: number; // м³/ч подача
  dsKgH: number; // кг СВ/ч
  unitCap: number; // кг СВ/ч или м³/ч (центрифуга)
  unitLabel: string;
  unitsWork: number;
  unitsReserve: number;
  unit: { L: number; W: number; H: number };
  frameH: number; // высота рамы под агрегатом
  flocKgDay: number;
  flocSolM3Day: number;
  flocStationM3: number;
  flocStation: { L: number; W: number };
  cakeKgDay: number;
  cakeM3Day: number;
  container: { m3: number; L: number; W: number; H: number };
  containers: number;
  filtrateM3Day: number;
  /* здание, мм */
  L: number; // в свету
  W: number;
  Lout: number;
  Wout: number;
  wall: number;
  Hclear: number;
  Hroof: number; // конёк над полом
  gate: { x: number; w: number; h: number }; // ворота на южной стене
  /* зоны по Y от южной стены */
  yCont: number; // низ отсека контейнеров
  yMach: number; // низ ряда агрегатов
  yMachTop: number;
  xMach: number[]; // левые кромки агрегатов
  xCont: number[];
  xFloc: number; // левая кромка узла флокулянта
  xPumps: number;
  /* отметки */
  floor: number;
  bottom: number;
  top: number;
};

export function dewateringGeometry(input: DrawingInput, p: DewateringParams): DewateringGeometry {
  const sg = stabilizerGeometry(input, stabilizerDefaults(input));
  const qSludge = sg.qIn; // стабилизированный ил ≈ уплотнённый по объёму (практика; убыль беззольного вещества в запас)
  const moistureIn = sg.moistureIn;
  const machine: "screw" | "centrifuge" = p.machine === "auto" ? (input.dryKg > 800 ? "centrifuge" : "screw") : p.machine;
  const dsKgH = input.dryKg / p.hoursPerDay;
  const qFeedH = qSludge / p.hoursPerDay;
  let unit: { L: number; W: number; H: number }, unitCap: number, unitLabel: string, unitsWork: number;
  if (machine === "screw") {
    const s = SCREW_SIZES.find((x) => x.kgH >= dsKgH) ?? SCREW_SIZES[SCREW_SIZES.length - 1];
    unitsWork = Math.max(1, Math.ceil(dsKgH / s.kgH));
    unit = s; unitCap = s.kgH; unitLabel = `${s.kgH} кг СВ/ч`;
  } else {
    /* ф. (136): q = (15–20)·l·d м³/ч, при флокулянте — в 2 раза меньше; принято 17,5 */
    const cap = (c: { d: number; l: number }) => (17.5 * c.l * c.d) / 2;
    const c = CENTRIFUGE_SIZES.find((x) => cap(x) >= qFeedH) ?? CENTRIFUGE_SIZES[CENTRIFUGE_SIZES.length - 1];
    unitsWork = Math.max(1, Math.ceil(qFeedH / cap(c)));
    unit = c; unitCap = cap(c); unitLabel = `ротор d${c.d}×l${c.l} м, ${cap(c).toFixed(1)} м³/ч`;
  }
  const unitsReserve = machine === "centrifuge" ? (unitsWork <= 2 ? 1 : 2) : 1;
  const units = unitsWork + unitsReserve;
  const flocKgDay = (input.dryKg / 1000) * p.flocKgPerT;
  const flocSolM3Day = flocKgDay / (p.flocSolutionPct * 10); // 0,2 % = 2 кг/м³
  const flocStationM3 = [0.5, 1, 2, 4].find((v) => v >= (flocSolM3Day / p.hoursPerDay) * 3) ?? 4; // запас на 3 ч работы
  const flocStation = flocStationM3 <= 1 ? { L: 2500, W: 1500 } : { L: 3500, W: 2000 };
  const cakeKgDay = input.dryKg / (p.cakeDsPct / 100);
  const cakeM3Day = cakeKgDay / 1050;
  const cakeNeed = cakeM3Day * p.cakeDays;
  const container = CONTAINERS.find((c) => c.m3 >= cakeNeed) ?? CONTAINERS[CONTAINERS.length - 1];
  const containers = Math.max(1, Math.ceil(cakeNeed / container.m3));
  const washM3Day = machine === "screw" ? 0.5 * p.hoursPerDay : 0.2 * p.hoursPerDay; // промывка, практика
  const filtrateM3Day = qSludge - cakeM3Day + washM3Day + flocSolM3Day;

  /* компоновка: Y от южной стены (ворота): проход 1200 | отсек контейнеров 2400+600 | проход 1500 | ряд агрегатов | проход 1200 */
  const yCont = 1200;
  const contDepth = container.W + 600;
  const yMach = yCont + contDepth + 1500;
  const yMachTop = yMach + unit.W;
  const W = roundTo(yMachTop + 1200, 100);
  /* X: агрегаты в ряд с шагом L+1200; контейнеры вдоль ворот; узел флокулянта и насосы — справа */
  const xMach: number[] = [];
  for (let i = 0; i < units; i++) xMach.push(1200 + i * (unit.L + 1200));
  const machRowL = 1200 + units * (unit.L + 1200);
  const xCont: number[] = [];
  for (let i = 0; i < containers; i++) xCont.push(1200 + i * (container.L + 800));
  const contRowL = 1200 + containers * (container.L + 800);
  const xFloc = Math.max(machRowL, contRowL) + 600;
  const pumpsL = 2 * 1000 + 600;
  const xPumps = xFloc;
  const L = roundTo(xFloc + Math.max(flocStation.L, pumpsL) + 1200, 100);
  const wall = p.wallMm;
  const Hclear = p.clearHeightM * 1000;
  const frameH = machine === "screw" ? 2500 : 1200;
  const gateW = 3600;
  return {
    machine, qSludge, moistureIn, qFeedH, dsKgH, unitCap, unitLabel, unitsWork, unitsReserve, unit, frameH,
    flocKgDay, flocSolM3Day, flocStationM3, flocStation,
    cakeKgDay, cakeM3Day, container, containers, filtrateM3Day,
    L, W, Lout: L + 2 * wall, Wout: W + 2 * wall, wall, Hclear, Hroof: Hclear + 600 + roundTo(W * 0.1, 100),
    gate: { x: xCont[0] + container.L / 2 - gateW / 2, w: gateW, h: 3600 },
    yCont, yMach, yMachTop, xMach, xCont, xFloc, xPumps,
    floor: p.floorM,
    bottom: p.floorM - 0.5, // низ фундаментной плиты — условно
    top: p.floorM + (Hclear + 600 + roundTo(W * 0.1, 100)) / 1000,
  };
}

function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function dewateringScale(input: DrawingInput, overrides: Partial<DewateringParams> = {}): number {
  const g = dewateringGeometry(input, { ...dewateringDefaults(input), ...overrides });
  return fitScale(g.Lout, g.Wout, g.Hroof + 800);
}

export function dewateringModel(input: DrawingInput, overrides: Partial<DewateringParams> = {}): StructureModel {
  const p = { ...dewateringDefaults(input), ...overrides };
  const g = dewateringGeometry(input, p);
  const dw = SLUDGE.dewatering;
  const machName = g.machine === "screw" ? "Дегидратор шнековый" : "Центрифуга декантерная";
  const dnFeed = Math.max(80, dnFor(g.qFeedH));
  const dnFiltr = Math.max(100, dnFor((g.filtrateM3Day / p.hoursPerDay) * 1.5));
  const model: StructureModel = {
    id: "dewatering",
    kind: "dewatering",
    name: "Здание механического обезвоживания осадка",
    supply: "supply",
    material: "building",
    footprint: { shape: "rect", w: g.Wout, l: g.Lout },
    bottom: g.bottom,
    water: g.floor,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "sludge", dn: dnFeed, side: "E", pos: g.Wout - 1500, elev: g.floor + 0.5 },
      { role: "out", dn: dnFiltr, side: "N", pos: g.xMach[0] + g.unit.L / 2, elev: g.floor - 0.8 },
      { role: "in", dn: 50, side: "E", pos: g.Wout - 2500, elev: g.floor + 0.5 },
      { role: "drain", dn: 100, side: "N", pos: g.Lout / 2, elev: g.floor - 0.6 },
    ],
    volumes: [
      { name: "Ил на обезвоживание, м³/сут", m3: g.qSludge },
      { name: `Кек ${p.cakeDsPct} % СВ, м³/сут`, m3: g.cakeM3Day },
      { name: `Контейнеры кека, ${g.containers}×${g.container.m3} м³`, m3: g.containers * g.container.m3 },
      { name: "Фугат/фильтрат в голову сооружений, м³/сут", m3: g.filtrateM3Day },
      { name: "Раствор флокулянта, м³/сут", m3: g.flocSolM3Day },
    ],
    equipment: [
      ...(g.machine === "screw"
        ? [
            { name: "Дегидратор шнековый — корпус, рама, бак флокуляции", qty: `${g.unitsWork}+${g.unitsReserve}`, spec: g.unitLabel, supply: "own" as const },
            { name: "Шнек-барабан дегидратора с приводом", qty: `${g.unitsWork + g.unitsReserve} компл.`, spec: "по паспорту производителя", supply: "supply" as const },
          ]
        : [{ name: "Центрифуга декантерная с приводом и ЧРП", qty: `${g.unitsWork}+${g.unitsReserve}`, spec: g.unitLabel, supply: "supply" as const }]),
      { name: "Станция приготовления флокулянта (автоматическая, 2-камерная)", qty: "1", spec: `${g.flocStationM3} м³, ${g.flocKgDay.toFixed(1)} кг/сут сухого полимера`, supply: "supply" },
      { name: "Насосы-дозаторы раствора флокулянта", qty: "1+1", spec: `${((g.flocSolM3Day / p.hoursPerDay) * 1000).toFixed(0)} л/ч`, supply: "supply" },
      { name: "Насосы подачи ила (винтовые)", qty: "1+1", spec: `${g.qFeedH.toFixed(1)} м³/ч`, supply: "supply" },
      { name: "Контейнер кека мультилифт", qty: `${g.containers} шт.`, spec: `${g.container.m3} м³`, supply: "supply" },
      { name: "Здание каркасное с сэндвич-панелями, ворота 3,6×3,6 м", qty: "1", spec: `${g.Lout}×${g.Wout} мм, h=${p.clearHeightM} м`, supply: "supply" },
      { name: "Вентиляция приточно-вытяжная, отопление", qty: "комплект", supply: "supply" },
    ],
    basis: [
      `Ил на обезвоживание ${g.qSludge.toFixed(1)} м³/сут (${input.dryKg.toFixed(0)} кг СВ/сут, ${g.moistureIn} %) после аэробной стабилизации; работа ${p.hoursPerDay} ч/сут — ${g.dsKgH.toFixed(1)} кг СВ/ч, ${g.qFeedH.toFixed(1)} м³/ч (продолжительность — практика).`,
      g.machine === "screw"
        ? `${machName} ${g.unitLabel}: ${g.unitsWork} раб. + ${g.unitsReserve} рез. (граница 800 кг СВ/сут и резерв — по аналогии с ${kmkRef("6.392")}, норма шнековые дегидраторы не описывает).`
        : `${machName} ${g.unitLabel} по ф. (136) ${kmkRef("6.388")} с уменьшением производительности в 2 раза при флокулянте; ${g.unitsWork} раб. + ${g.unitsReserve} рез. (${kmkRef("6.392")}: центрифуги — до 2 рабочих 1 резервная).`,
      `Флокулянт катионный ${p.flocKgPerT} кг/т СВ (${kmkRef("6.391")}: ${dw.flocculantKgPerT[0]}–${dw.flocculantKgPerT[1]}, для активного ила — больше) — ${g.flocKgDay.toFixed(1)} кг/сут; раствор ${p.flocSolutionPct} % — ${g.flocSolM3Day.toFixed(1)} м³/сут (концентрация — практика).`,
      `Кек ${p.cakeDsPct} % СВ (${dw.ref}: уплотнённый активный ил на фильтр-прессе 80–83 % влажности; для шнекового дегидратора принято по паспорту) — ${g.cakeM3Day.toFixed(1)} м³/сут; контейнеры ${g.containers}×${g.container.m3} м³ на ${p.cakeDays} сут. Склад обезвоженного осадка на 3–4 мес (${SLUDGE.storageMonths.ref}) — на площадке, вне здания.`,
      `Фугат/фильтрат ${g.filtrateM3Day.toFixed(1)} м³/сут — в голову сооружений без обработки (${kmkRef("6.391")}); нагрузка +1 мг БПКполн на 1 мг остаточного СВ (${kmkRef("6.390")}). Аварийные иловые площадки на 20 % годового осадка (${kmkRef("6.393")}) — отдельный лист.`,
      `Габариты здания — по компоновке оборудования с проходами 1,2–1,5 м (практика; ${kmkRef("5.16")} для решёток — аналогия), высота ${p.clearHeightM} м, ворота 3,6×3,6 м под автомобиль-мультилифт.`,
    ],
    calc: dewateringCalc(input, p, g),
    headLoss: 0,
    draw: (sheet) => drawDewatering(sheet, input, p, g, model),
  };
  return model;
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

function dewateringCalc(input: DrawingInput, p: DewateringParams, g: DewateringGeometry): CalcStep[] {
  const dw = SLUDGE.dewatering;
  const cakeNeed = g.cakeM3Day * p.cakeDays;
  const washM3Day = g.machine === "screw" ? 0.5 * p.hoursPerDay : 0.2 * p.hoursPerDay;
  const flocOk = p.flocKgPerT >= dw.flocculantKgPerT[0] && p.flocKgPerT <= dw.flocculantKgPerT[1];
  const reserveOk = g.machine === "centrifuge" ? (g.unitsWork <= 2 ? g.unitsReserve === 1 : g.unitsReserve === 2) : true;
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Ил после аэробной стабилизации", symbol: "Q ил", value: f1(g.qSludge), unit: "м³/сут", ref: "расчёт аэробного стабилизатора (stabilizerGeometry)" },
    { kind: "input", what: "Влажность стабилизированного ила", symbol: "P1", value: f1(g.moistureIn), unit: "%", ref: "расчёт илоуплотнителя, ф. (127) — принято без изменения по стабилизации" },
    { kind: "input", what: "Избыточный ил (сухое вещество)", symbol: "P ил", value: f0(input.dryKg), unit: "кг СВ/сут", ref: "расчёт биологической очистки (анкета объекта)" },
    { kind: "input", what: "Продолжительность работы в сутки", symbol: "T", value: f0(p.hoursPerDay), unit: "ч/сут", ref: "принято по практике: 8 ч при ≤ 300 кг СВ/сут, иначе 16 ч" },
    { kind: "input", what: "Доза катионного флокулянта", symbol: "d фл", value: f1(p.flocKgPerT), unit: "кг/т СВ", ref: `${kmkRef("6.391")}: ${dw.flocculantKgPerT[0]}–${dw.flocculantKgPerT[1]}` },
    { kind: "input", what: "Сухое вещество кека", symbol: "P кек", value: f1(p.cakeDsPct), unit: "%", ref: `${dw.ref} (уплотнённый активный ил на фильтр-прессе 80–83 % влажности; для шнекового дегидратора принято по паспорту)` },
    { kind: "input", what: "Запас контейнеров кека", symbol: "t конт", value: f1(p.cakeDays), unit: "сут", ref: "задание (3–4 сут по практике)" },

    /* ---------- расчёт ---------- */
    {
      kind: "check", what: "Проверка дозы флокулянта",
      formula: `${dw.flocculantKgPerT[0]} ≤ d фл ≤ ${dw.flocculantKgPerT[1]} кг/т СВ`,
      substitution: `d фл = ${f1(p.flocKgPerT)} кг/т СВ`,
      value: flocOk ? "выполняется" : "НЕ выполняется",
      ref: kmkRef("6.391"),
    },
    {
      kind: "calc", what: "Часовая нагрузка по сухому веществу", symbol: "m ч",
      formula: "m ч = P ил / T",
      substitution: `m ч = ${f0(input.dryKg)} / ${f0(p.hoursPerDay)}`,
      value: f1(g.dsKgH), unit: "кг СВ/ч", ref: "",
    },
    {
      kind: "calc", what: "Часовая подача ила", symbol: "Q ч",
      formula: "Q ч = Q ил / T",
      substitution: `Q ч = ${f1(g.qSludge)} / ${f0(p.hoursPerDay)}`,
      value: f1(g.qFeedH), unit: "м³/ч", ref: "",
    },
    {
      kind: "calc", what: "Тип обезвоживающего агрегата",
      formula: "шнековый дегидратор при P ил ≤ 800 кг СВ/сут, иначе центрифуга",
      substitution: `P ил = ${f0(input.dryKg)} кг СВ/сут`,
      value: g.machine === "screw" ? "шнековый дегидратор" : "центрифуга декантерная",
      ref: `граница 800 кг СВ/сут — принято по аналогии с ${kmkRef("6.392")}, норма шнековые дегидраторы не описывает`,
    },
    g.machine === "screw"
      ? {
          kind: "calc", what: "Типоразмер и число агрегатов", symbol: "n раб",
          formula: "ближайший типоразмер с производительностью ≥ m ч; n раб = ⌈m ч / kгН⌉",
          substitution: `подобран типоразмер ${g.unitCap} кг СВ/ч (паспортный ряд SUVSANOAT); n раб = ⌈${f1(g.dsKgH)} / ${g.unitCap}⌉`,
          value: `${g.unitLabel}, ${g.unitsWork} раб.`, ref: "паспортный ряд шнековых дегидраторов SUVSANOAT",
        }
      : {
          kind: "calc", what: "Производительность ротора и число агрегатов", symbol: "q max",
          formula: "q max = (15…20)·l·d / 2 (в 2 раза меньше при флокулянте); n раб = ⌈Q ч / q max⌉",
          substitution: `q max = 17,5 · l · d / 2 = ${g.unitCap.toFixed(1)} м³/ч; n раб = ⌈${f1(g.qFeedH)} / ${g.unitCap.toFixed(1)}⌉`,
          value: `${g.unitLabel}, ${g.unitsWork} раб.`, ref: `${kmkRef("6.388")}, ф. (136)`,
        },
    {
      kind: "check", what: "Проверка числа резервных агрегатов",
      formula: g.machine === "centrifuge" ? "до 2 рабочих — 1 резервная, 3 и более — 2" : "принято 1 резервный по аналогии",
      substitution: `n раб = ${g.unitsWork}, n рез = ${g.unitsReserve}`,
      value: reserveOk ? "выполняется" : "НЕ выполняется",
      ref: g.machine === "centrifuge" ? kmkRef("6.392") : `по аналогии с ${kmkRef("6.392")}, норма шнековые дегидраторы не описывает`,
    },
    {
      kind: "calc", what: "Расход товарного флокулянта", symbol: "G фл",
      formula: "G фл = (P ил / 1000) · d фл",
      substitution: `G фл = (${f0(input.dryKg)} / 1000) · ${f1(p.flocKgPerT)}`,
      value: f1(g.flocKgDay), unit: "кг/сут", ref: kmkRef("6.391"),
    },
    {
      kind: "calc", what: "Расход раствора флокулянта", symbol: "Q фл",
      formula: "Q фл = G фл / (C фл · 10)",
      substitution: `Q фл = ${f1(g.flocKgDay)} / (${p.flocSolutionPct} · 10)`,
      value: f1(g.flocSolM3Day), unit: "м³/сут", ref: "концентрация рабочего раствора — принято по практике",
    },
    {
      kind: "calc", what: "Ёмкость станции приготовления флокулянта", symbol: "V ст",
      formula: "ближайшая типовая ёмкость ≥ (Q фл / T) · 3 ч запаса",
      substitution: `(${f1(g.flocSolM3Day)} / ${f0(p.hoursPerDay)}) · 3 = ${((g.flocSolM3Day / p.hoursPerDay) * 3).toFixed(2)} м³`,
      value: f1(g.flocStationM3), unit: "м³", ref: "типовой ряд станций — паспорт производителя",
    },
    {
      kind: "calc", what: "Масса кека", symbol: "G кек",
      formula: "G кек = P ил / (P кек / 100)",
      substitution: `G кек = ${f0(input.dryKg)} / (${f1(p.cakeDsPct)} / 100)`,
      value: f0(g.cakeKgDay), unit: "кг/сут", ref: "",
    },
    {
      kind: "calc", what: "Объём кека", symbol: "V кек",
      formula: "V кек = G кек / ρ",
      substitution: `V кек = ${f0(g.cakeKgDay)} / 1050`,
      value: f1(g.cakeM3Day), unit: "м³/сут", ref: "плотность кека ρ = 1050 кг/м³ — принято по практике",
    },
    {
      kind: "calc", what: "Требуемая вместимость контейнеров", symbol: "V конт треб",
      formula: "V конт треб = V кек · t конт",
      substitution: `V конт треб = ${f1(g.cakeM3Day)} · ${f1(p.cakeDays)}`,
      value: f1(cakeNeed), unit: "м³", ref: "",
    },
    {
      kind: "calc", what: "Типоразмер и число контейнеров", symbol: "n конт",
      formula: "ближайший типовой контейнер ≥ V конт треб / n конт; n конт = ⌈V конт треб / V конт⌉",
      substitution: `подобран контейнер ${g.container.m3} м³; n конт = ⌈${f1(cakeNeed)} / ${g.container.m3}⌉`,
      value: `${g.containers}×${g.container.m3} м³`, unit: "", ref: "типовой ряд контейнеров-мультилифтов — практика",
    },
    {
      kind: "calc", what: "Расход фугата/фильтрата в голову сооружений", symbol: "Q фильтр",
      formula: "Q фильтр = Q ил − V кек + Q промывки + Q фл",
      substitution: `Q фильтр = ${f1(g.qSludge)} − ${f1(g.cakeM3Day)} + ${f1(washM3Day)} + ${f1(g.flocSolM3Day)}`,
      value: f1(g.filtrateM3Day), unit: "м³/сут", ref: `${kmkRef("6.391")}; промывка — принято по практике`,
    },
    {
      kind: "calc", what: "Ширина здания", symbol: "W",
      formula: "W = (проезд + отсек контейнеров + проход + ряд агрегатов + проход), округление до 100 мм",
      substitution: `1200 + (${g.container.W}+600) + 1500 + ${g.unit.W} + 1200`,
      value: f0(g.W), unit: "мм", ref: "проходы и компоновка — практика SUVSANOAT",
    },
    {
      kind: "calc", what: "Длина здания", symbol: "L",
      formula: "L = (ряд агрегатов или ряд контейнеров, что длиннее) + узел флокулянта/насосы + проходы, округление до 100 мм",
      substitution: `по числу агрегатов (${g.unitsWork + g.unitsReserve}), контейнеров (${g.containers}) и узла флокулянта ${g.flocStation.L}×${g.flocStation.W} мм`,
      value: f0(g.L), unit: "мм", ref: "компоновка оборудования с проходами — практика SUVSANOAT",
    },
    {
      kind: "calc", what: "Наружный габарит здания",
      formula: "Lout = L + 2·δ; Wout = W + 2·δ",
      substitution: `Lout = ${f0(g.L)} + 2·${g.wall}; Wout = ${f0(g.W)} + 2·${g.wall}`,
      value: `${f0(g.Lout)} × ${f0(g.Wout)}`, unit: "мм", ref: "толщина сэндвич-панелей по каркасу — принято",
    },
    {
      kind: "calc", what: "Высота конька кровли", symbol: "H конёк",
      formula: "H конёк = H пом + 600 + уклон кровли (≈ 0,1·W)",
      substitution: `H конёк = ${p.clearHeightM * 1000} + 600 + ${roundTo(g.W * 0.1, 100)}`,
      value: f0(g.Hroof), unit: "мм", ref: "высота помещения и уклон кровли — принято по практике",
    },
    {
      kind: "calc", what: "Отметка пола / верха здания",
      formula: "верх = пол + H конёк",
      substitution: `пол = +${g.floor.toFixed(3)} м`,
      value: `${g.floor.toFixed(3)} / +${g.top.toFixed(3)}`,
      unit: "м", ref: "0.000 — планировочная отметка площадки",
    },
  ];
  return steps;
}

function dnFor(qM3H: number): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / 1.0 / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawDewatering(sheet: Sheet, input: DrawingInput, p: DewateringParams, g: DewateringGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const units = g.unitsWork + g.unitsReserve;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.Wout;
  sheet.viewTitle(px, py + g.Wout + sheet.p(16), "ПЛАН НА ОТМ. +1.000");
  const ix0 = px + g.wall, iy0 = py + g.wall; // внутренний угол (юго-западный)
  d.rect(px, py, g.Lout, g.Wout, "CONTOUR");
  d.rect(ix0, iy0, g.L, g.W, "CONTOUR");
  d.hatch([[px, py], [px + g.Lout, py], [px + g.Lout, py + g.wall], [px, py + g.wall]], sheet.p(1), 45);
  d.hatch([[px, py + g.Wout - g.wall], [px + g.Lout, py + g.Wout - g.wall], [px + g.Lout, py + g.Wout], [px, py + g.Wout]], sheet.p(1), 45);
  d.hatch([[px, py], [px + g.wall, py], [px + g.wall, py + g.Wout], [px, py + g.Wout]], sheet.p(1), 45);
  d.hatch([[px + g.Lout - g.wall, py], [px + g.Lout, py], [px + g.Lout, py + g.Wout], [px + g.Lout - g.wall, py + g.Wout]], sheet.p(1), 45);
  /* колонны каркаса по периметру с шагом ≤ 6 м */
  const colStepX = Math.ceil(g.L / 6000);
  for (let i = 0; i <= colStepX; i++) {
    const x = ix0 + (i * g.L) / colStepX;
    for (const y of [iy0, iy0 + g.W - 300]) d.rect(Math.min(x, ix0 + g.L - 300), y, 300, 300, "CONTOUR");
  }
  /* ворота на южной стене */
  d.line(ix0 + g.gate.x, py, ix0 + g.gate.x, py + g.wall, "CONTOUR");
  d.line(ix0 + g.gate.x + g.gate.w, py, ix0 + g.gate.x + g.gate.w, py + g.wall, "CONTOUR");
  d.line(ix0 + g.gate.x, py + g.wall / 2, ix0 + g.gate.x + g.gate.w, py + g.wall / 2, "THIN");
  d.arc(ix0 + g.gate.x, py + g.wall, g.gate.w / 2, 0, 90, "THIN");
  d.arc(ix0 + g.gate.x + g.gate.w, py + g.wall, g.gate.w / 2, 90, 180, "THIN");
  d.text(ix0 + g.gate.x + g.gate.w / 2, py + g.wall + ts * 0.6, ts, `ВОРОТА ${g.gate.w}×${g.gate.h}`, { align: "center" });
  /* дверь на восточной стене */
  d.line(px + g.Lout - g.wall, iy0 + 600, px + g.Lout, iy0 + 600, "CONTOUR");
  d.line(px + g.Lout - g.wall, iy0 + 1600, px + g.Lout, iy0 + 1600, "CONTOUR");
  d.arc(px + g.Lout - g.wall, iy0 + 600, 1000, 90, 180, "THIN");
  /* контейнеры кека */
  g.xCont.forEach((x, i) => {
    const cy = iy0 + g.yCont + 300;
    d.rect(ix0 + x, cy, g.container.L, g.container.W, "EQUIP");
    d.line(ix0 + x, cy, ix0 + x + g.container.L, cy + g.container.W, "THIN");
    d.line(ix0 + x, cy + g.container.W, ix0 + x + g.container.L, cy, "THIN");
    d.text(ix0 + x + g.container.L / 2, cy + g.container.W / 2 + ts * 0.3, ts, `КОНТЕЙНЕР КЕКА ${i + 1} — ${g.container.m3} м³`, { align: "center" });
  });
  d.text(ix0 + g.L / 2, iy0 + g.yCont / 2, ts * 0.9, "ПРОЕЗД / ОТСЕК КОНТЕЙНЕРОВ", { align: "center" });
  /* агрегаты на раме, транспортёр/течка к контейнеру */
  g.xMach.forEach((x, i) => {
    const mx = ix0 + x, my = iy0 + g.yMach;
    d.rect(mx, my, g.unit.L, g.unit.W, "EQUIP");
    if (g.machine === "screw") {
      /* барабан — цилиндр вдоль X */
      d.rect(mx + 300, my + g.unit.W * 0.25, g.unit.L - 900, g.unit.W * 0.5, "EQUIP");
      for (let k = 1; k < 8; k++) d.line(mx + 300 + ((g.unit.L - 900) * k) / 8, my + g.unit.W * 0.25, mx + 300 + ((g.unit.L - 900) * k) / 8, my + g.unit.W * 0.75, "THIN");
      d.rect(mx + g.unit.L - 600, my + 100, 500, g.unit.W - 200, "EQUIP"); // бак флокуляции
    } else {
      d.rect(mx + 600, my + 200, g.unit.L - 1800, g.unit.W - 400, "EQUIP");
      d.ellipse(mx + 600 + (g.unit.L - 1800) / 2, my + g.unit.W / 2, (g.unit.L - 1800) / 2, (g.unit.W - 400) / 2, "THIN");
      d.rect(mx + g.unit.L - 1100, my + 300, 900, g.unit.W - 600, "EQUIP"); // привод
    }
    const lbl = i < g.unitsWork ? "РАБ." : "РЕЗ.";
    d.text(mx + g.unit.L / 2, my + g.unit.W + ts * 0.8, ts, `${g.machine === "screw" ? "ДЕГИДРАТОР" : "ЦЕНТРИФУГА"} ${i + 1} (${lbl})`, { align: "center" });
    /* течка кека к контейнеру (шнековый транспортёр) */
    const cx = ix0 + x + 300;
    const yc = iy0 + g.yCont + 300 + g.container.W;
    d.line(cx, my, cx, yc, "PIPE");
    d.line(cx - 150, my, cx - 150, yc, "PIPE");
    d.arrow(cx - 75, my - 100, cx - 75, yc + 100, "FLOW", 200);
  });
  /* узел флокулянта и насосы */
  const fx = ix0 + g.xFloc, fy = iy0 + g.yMach;
  d.rect(fx, fy, g.flocStation.L, g.flocStation.W, "EQUIP");
  d.line(fx + g.flocStation.L / 2, fy, fx + g.flocStation.L / 2, fy + g.flocStation.W, "THIN");
  d.text(fx + g.flocStation.L / 2, fy + g.flocStation.W + ts * 0.8, ts, `СТАНЦИЯ ФЛОКУЛЯНТА ${g.flocStationM3} м³`, { align: "center" });
  for (let i = 0; i < 2; i++) {
    const pxp = ix0 + g.xPumps + i * 1300, pyp = iy0 + g.yCont + 300;
    d.rect(pxp, pyp, 1000, 600, "EQUIP");
    d.circle(pxp + 300, pyp + 300, 200, "EQUIP");
  }
  d.text(ix0 + g.xPumps + 1150, iy0 + g.yCont + 300 + 600 + ts * 0.8, ts, "НАСОСЫ ИЛА 1+1", { align: "center" });
  d.text(ix0 + g.xPumps + 1150, iy0 + g.yCont + 300 + 600 + ts * 2.2, ts * 0.85, "ДОЗАТОРЫ 1+1", { align: "center" });
  /* трубопроводы: подача ила с востока к агрегатам, фильтрат на север */
  const yFeed = iy0 + g.yMachTop + 500;
  d.line(px + g.Lout + sheet.p(12), yFeed, ix0 + g.xMach[0] + g.unit.L, yFeed, "PIPE");
  d.arrow(px + g.Lout + sheet.p(18), yFeed, px + g.Lout + sheet.p(12), yFeed, "FLOW", sheet.p(2));
  d.text(px + g.Lout + sheet.p(2), yFeed + th * 0.8, ts, `ИЛ ОТ СТАБИЛИЗАТОРА DN${Math.max(80, dnFor(g.qFeedH))}`, { align: "left" });
  g.xMach.forEach((x) => d.line(ix0 + x + g.unit.L, yFeed, ix0 + x + g.unit.L, iy0 + g.yMachTop, "PIPE"));
  const xFil = ix0 + g.xMach[0] + g.unit.L / 2;
  d.line(xFil, iy0 + g.yMach, xFil, py + g.Wout + sheet.p(10), "HIDDEN");
  d.arrow(xFil, py + g.Wout + sheet.p(10), xFil, py + g.Wout + sheet.p(16), "FLOW", sheet.p(2));
  d.text(xFil + th * 0.5, py + g.Wout + sheet.p(12), ts, "ФИЛЬТРАТ В ГОЛОВУ СООРУЖЕНИЙ", { align: "left" });
  /* размеры */
  const yd = py - sheet.p(12);
  const xs = [px, px + g.wall, ...g.xMach.map((x) => ix0 + x), ...g.xMach.map((x) => ix0 + x + g.unit.L), ix0 + g.xFloc, px + g.Lout - g.wall, px + g.Lout];
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), yd, th);
  d.dimH(px, px + g.Lout, yd - sheet.p(9), `${g.Lout}`, th);
  const xd = px + g.Lout + sheet.p(45);
  d.dimChainV(xd, [py, iy0, iy0 + g.yCont, iy0 + g.yCont + g.container.W + 600, iy0 + g.yMach, iy0 + g.yMachTop, iy0 + g.W, py + g.Wout], th);
  d.dimV(xd + sheet.p(9), py, py + g.Wout, `${g.Wout}`, th);
  /* марки разрезов */
  const y11 = iy0 + g.yMach + g.unit.W / 2;
  d.sectionMark(px - sheet.p(6), y11, px + g.Lout + sheet.p(6), y11, "1", th, -1);
  const x22 = ix0 + g.xMach[0] + g.unit.L * 0.6;
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.Wout + sheet.p(6), "2", th, 1);
  d.northArrow(px + g.Lout - sheet.p(6), py + g.Wout + sheet.p(20), sheet.p(8));

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const sy = py - sheet.p(50) - g.Hroof - 500;
  sheet.viewTitle(px, sy + g.Hroof + 500 + sheet.p(12), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, g);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const cx = px + g.Lout + sheet.p(70);
  sheet.viewTitle(cx, sy + g.Hroof + 500 + sheet.p(12), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, sy, g);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lout + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(10) - isoLeft;
  const k = Math.min(0.5, avail / ((g.Lout + g.Wout) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.Wout * k * Math.cos(Math.PI / 6);
  const isoH = g.Hroof * k + (g.Lout + g.Wout) * k * 0.5;
  const iy = py + g.Wout - isoH;
  sheet.viewTitle(isoLeft, py + g.Wout + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k);

  sheet.note(`Здание обезвоживания ${g.Lout}×${g.Wout} мм, высота до низа конструкций ${p.clearHeightM} м, пол на отм. ${fmtE(g.floor)}; каркас стальной, стены — сэндвич-панели, ворота ${g.gate.w}×${g.gate.h} мм под автомобиль-мультилифт.`);
  sheet.note(`${g.machine === "screw" ? "Дегидраторы шнековые" : "Центрифуги декантерные"} ${units} шт. (${g.unitsWork} раб. + ${g.unitsReserve} рез.), ${g.unitLabel}; ил ${g.qSludge.toFixed(1)} м³/сут, ${input.dryKg.toFixed(0)} кг СВ/сут, работа ${p.hoursPerDay} ч/сут.`);
  sheet.note(`Флокулянт ${p.flocKgPerT} кг/т СВ (п. 6.391) — ${g.flocKgDay.toFixed(1)} кг/сут; кек ${p.cakeDsPct} % СВ — ${g.cakeM3Day.toFixed(1)} м³/сут в контейнеры ${g.containers}×${g.container.m3} м³ (${p.cakeDays} сут); фильтрат ${g.filtrateM3Day.toFixed(1)} м³/сут — в голову сооружений.`);
  sheet.note(`${g.machine === "screw" ? "Корпус и рама дегидратора — SUVSANOAT, шнек-барабан — покупной; " : ""}станция флокулянта, насосы, контейнеры, здание — поставка.`);
  /* ведомость расчёта — в свободном поле под разрезами и изометрией */
  const calcY = Math.min(sy, iy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: "стены, колонны, фундаменты" },
    { layer: "HATCH", text: "ограждающие конструкции" },
    { layer: "EQUIP", text: "оборудование" },
    { layer: "PIPE", text: "трубопроводы, транспортёр кека" },
    { layer: "WATER", text: "отметка пола" },
  ]);
}

function sectionLong(sheet: Sheet, x: number, y: number, g: DewateringGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const slab = 500;
  const yf = y + slab; // пол
  const yc = yf + g.Hclear; // низ ферм
  const yr = yf + g.Hroof;
  const groundY = yf - g.floor * 1000;
  /* плита и стены */
  d.rect(x - 300, y, g.Lout + 600, slab, "CONTOUR");
  d.concrete([[x - 300, y], [x + g.Lout + 300, y], [x + g.Lout + 300, y + slab], [x - 300, y + slab]], sheet.p(1.5));
  d.rect(x, yf, g.wall, yc - yf + 600, "CONTOUR");
  d.rect(x + g.Lout - g.wall, yf, g.wall, yc - yf + 600, "CONTOUR");
  d.hatch([[x, yf], [x + g.wall, yf], [x + g.wall, yc + 600], [x, yc + 600]], sheet.p(1), 45);
  d.hatch([[x + g.Lout - g.wall, yf], [x + g.Lout, yf], [x + g.Lout, yc + 600], [x + g.Lout - g.wall, yc + 600]], sheet.p(1), 45);
  /* покрытие: продольный разрез — горизонтальная линия ферм и парапет */
  d.line(x, yc, x + g.Lout, yc, "CONTOUR");
  d.line(x - 200, yc + 600, x + g.Lout + 200, yc + 600, "CONTOUR");
  d.text(x + g.Lout / 2, yc + 600 + th * 0.5, ts, "ПОКРЫТИЕ ПО СТАЛЬНЫМ ФЕРМАМ", { align: "center" });
  /* агрегаты на рамах */
  g.xMach.forEach((mx0, i) => {
    const mx = x + g.wall + mx0;
    d.rect(mx + 200, yf, g.unit.L - 400, g.frameH, "THIN");
    d.line(mx + 200, yf, mx + g.unit.L - 200, yf + g.frameH, "THIN");
    d.rect(mx, yf + g.frameH, g.unit.L, g.unit.H, "EQUIP");
    if (g.machine === "screw") {
      d.rect(mx + 300, yf + g.frameH + 300, g.unit.L - 900, g.unit.H - 600, "EQUIP");
      for (let k = 1; k < 10; k++) d.line(mx + 300 + ((g.unit.L - 900) * k) / 10, yf + g.frameH + 300, mx + 300 + ((g.unit.L - 900) * k) / 10, yf + g.frameH + g.unit.H - 300, "THIN");
    } else {
      d.rect(mx + 600, yf + g.frameH + 300, g.unit.L - 1800, g.unit.H - 600, "EQUIP");
    }
    d.text(mx + g.unit.L / 2, yf + g.frameH + g.unit.H + th * 0.6, ts, `${g.machine === "screw" ? "ДЕГИДРАТОР" : "ЦЕНТРИФУГА"} ${i + 1}`, { align: "center" });
    /* выпуск кека — течка вниз */
    d.line(mx + 300, yf + g.frameH, mx + 300, yf + 1500, "PIPE");
    d.line(mx + 450, yf + g.frameH, mx + 450, yf + 1500, "PIPE");
  });
  /* контейнер (за агрегатами, невидимый контур) */
  const cx = x + g.wall + g.xCont[0];
  d.rect(cx, yf, g.container.L, g.container.H, "HIDDEN");
  d.text(cx + g.container.L / 2, yf + g.container.H / 2, ts * 0.9, "КОНТЕЙНЕР (ЗА ПЛОСКОСТЬЮ)", { align: "center" });
  /* узел флокулянта */
  const fx = x + g.wall + g.xFloc;
  d.rect(fx, yf, g.flocStation.L, 2200, "EQUIP");
  d.line(fx + g.flocStation.L / 2, yf, fx + g.flocStation.L / 2, yf + 2200, "THIN");
  d.text(fx + g.flocStation.L / 2, yf + 2200 + th * 0.6, ts, "СТАНЦИЯ ФЛОКУЛЯНТА", { align: "center" });
  /* подача ила */
  const yFeed = yf + 2800 + (g.machine === "screw" ? 600 : 0);
  d.line(x + g.Lout + sheet.p(10), yFeed, x + g.wall + g.xMach[0] + g.unit.L, yFeed, "PIPE");
  g.xMach.forEach((mx0) => d.line(x + g.wall + mx0 + g.unit.L, yFeed, x + g.wall + mx0 + g.unit.L, yf + g.frameH + g.unit.H * 0.7, "PIPE"));
  d.text(x + g.Lout + sheet.p(1), yFeed + th * 0.6, ts, "ИЛ", { align: "left" });
  /* земля, отметки, размеры */
  d.groundLine(x - sheet.p(15), x - 300, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + g.Lout + 300, x + g.Lout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.line(x + g.wall, yf, x + g.Lout - g.wall, yf, "WATER");
  d.elevMark(x + g.Lout + sheet.p(14), groundY, "0.000", th, -1);
  d.elevMark(x - sheet.p(8), yf, fmtE(g.floor), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yc, fmtE(g.floor + g.Hclear / 1000), th, 1);
  d.elevMark(x + g.Lout + sheet.p(8), yc + 600, fmtE(g.floor + (g.Hclear + 600) / 1000), th, 1);
  d.dimChainV(x - sheet.p(22), [y, yf, yf + g.frameH, yc, yc + 600], th, [`${slab}`, `${g.frameH}`, `${g.Hclear - g.frameH}`, "600"]);
  const xs = [x, x + g.wall, ...g.xMach.map((m) => x + g.wall + m), ...g.xMach.map((m) => x + g.wall + m + g.unit.L), x + g.Lout - g.wall, x + g.Lout];
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), y - sheet.p(10), th);
  void yr;
}

function sectionCross(sheet: Sheet, x: number, y: number, g: DewateringGeometry) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const slab = 500;
  const yf = y + slab;
  const yc = yf + g.Hclear;
  const yr = yf + g.Hroof;
  const groundY = yf - g.floor * 1000;
  const W = g.Wout;
  d.rect(x - 300, y, W + 600, slab, "CONTOUR");
  d.concrete([[x - 300, y], [x + W + 300, y], [x + W + 300, y + slab], [x - 300, y + slab]], sheet.p(1.5));
  /* стены и двускатное покрытие */
  d.rect(x, yf, g.wall, yc - yf, "CONTOUR");
  d.rect(x + W - g.wall, yf, g.wall, yc - yf, "CONTOUR");
  d.hatch([[x, yf], [x + g.wall, yf], [x + g.wall, yc], [x, yc]], sheet.p(1), 45);
  d.hatch([[x + W - g.wall, yf], [x + W, yf], [x + W, yc], [x + W - g.wall, yc]], sheet.p(1), 45);
  const roof: Pt[] = [[x - 200, yc], [x + W / 2, yr], [x + W + 200, yc], [x + W + 200, yc + 300], [x + W / 2, yr + 300], [x - 200, yc + 300]];
  d.poly(roof, "CONTOUR", true);
  d.line(x, yc, x + W, yc, "THIN"); // низ фермы
  /* ворота на южной стене (слева) — в разрезе видим проём */
  d.line(x, yf, x, yf + g.gate.h, "HIDDEN");
  d.text(x + g.wall + 200, yf + g.gate.h + th * 0.5, ts * 0.9, `ВОРОТА h=${g.gate.h}`, { align: "left" });
  /* контейнер */
  const cy = x + g.wall + g.yCont + 300;
  d.rect(cy, yf, g.container.W, g.container.H, "EQUIP");
  d.text(cy + g.container.W / 2, yf + g.container.H / 2, ts * 0.9, "КОНТЕЙНЕР", { align: "center" });
  /* агрегат на раме + течка/транспортёр в контейнер */
  const my = x + g.wall + g.yMach;
  d.rect(my + 200, yf, g.unit.W - 400, g.frameH, "THIN");
  d.rect(my, yf + g.frameH, g.unit.W, g.unit.H, "EQUIP");
  if (g.machine === "screw") d.circle(my + g.unit.W / 2, yf + g.frameH + g.unit.H / 2, g.unit.H * 0.35, "EQUIP");
  else d.circle(my + g.unit.W / 2, yf + g.frameH + g.unit.H / 2, g.unit.H * 0.3, "EQUIP");
  d.text(my + g.unit.W / 2, yf + g.frameH + g.unit.H + th * 0.6, ts, g.machine === "screw" ? "ДЕГИДРАТОР" : "ЦЕНТРИФУГА", { align: "center" });
  /* транспортёр кека: наклонный от выпуска агрегата к контейнеру */
  const tx1 = my + 200, ty1 = yf + g.frameH - 100;
  const tx2 = cy + g.container.W / 2, ty2 = yf + g.container.H + 400;
  d.line(tx1, ty1, tx2, ty2, "PIPE");
  d.line(tx1, ty1 - 200, tx2, ty2 - 200, "PIPE");
  d.arrow(tx2 - 300, ty2 - 100, tx2, ty2 - 100, "FLOW", 150);
  d.text((tx1 + tx2) / 2, (ty1 + ty2) / 2 + th * 1.2, ts * 0.9, "ТРАНСПОРТЁР КЕКА", { align: "center" });
  /* подача ила и фильтрат */
  d.line(my + g.unit.W, yf + g.frameH + g.unit.H * 0.7, x + W + sheet.p(8), yf + g.frameH + g.unit.H * 0.7, "PIPE");
  d.text(x + W + sheet.p(1), yf + g.frameH + g.unit.H * 0.7 + th * 0.6, ts, "ИЛ", { align: "left" });
  d.line(my + g.unit.W / 2, yf + g.frameH, my + g.unit.W / 2, yf - 800, "PIPE");
  d.line(my + g.unit.W / 2, yf - 800, x + W + sheet.p(8), yf - 800, "PIPE");
  d.text(x + W + sheet.p(1), yf - 800 - th * 1.4, ts, "ФИЛЬТРАТ", { align: "left" });
  /* проходы */
  d.text(x + g.wall + g.yCont / 2, yf + 300, ts * 0.8, "ПРОЕЗД", { align: "center", rot: 90 });
  /* земля, отметки, размеры */
  d.groundLine(x - sheet.p(15), x - 300, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(x + W + 300, x + W + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.line(x + g.wall, yf, x + W - g.wall, yf, "WATER");
  d.elevMark(x + W + sheet.p(14), groundY, "0.000", th, -1);
  d.elevMark(x - sheet.p(8), yf, fmtE(g.floor), th, 1);
  d.elevMark(x - sheet.p(8), yc, fmtE(g.floor + g.Hclear / 1000), th, -1);
  d.elevMark(x + W / 2 + sheet.p(6), yr + 300, fmtE(g.top + 0.3), th, 1);
  d.dimChainV(x - sheet.p(22), [y, yf, yf + g.frameH, yc, yr], th, [`${slab}`, `${g.frameH}`, `${g.Hclear - g.frameH}`, `${g.Hroof - g.Hclear}`]);
  d.dimChainH([x, x + g.wall, cy, cy + g.container.W, my, my + g.unit.W, x + W - g.wall, x + W], y - sheet.p(10), th);
}

function isoView(sheet: Sheet, ox: number, oy: number, g: DewateringGeometry, k: number) {
  const d = sheet.d;
  const L = g.Lout * k, W = g.Wout * k, H = g.Hclear * k, Hr = g.Hroof * k;
  d.isoBox(0, 0, 0, L, W, H, ox, oy, "CONTOUR", true);
  /* двускатная крыша: конёк вдоль X */
  d.isoLine([0, 0, H], [0, W / 2, Hr], ox, oy, "CONTOUR");
  d.isoLine([0, W / 2, Hr], [0, W, H], ox, oy, "CONTOUR");
  d.isoLine([L, 0, H], [L, W / 2, Hr], ox, oy, "CONTOUR");
  d.isoLine([L, W / 2, Hr], [L, W, H], ox, oy, "CONTOUR");
  d.isoLine([0, W / 2, Hr], [L, W / 2, Hr], ox, oy, "CONTOUR");
  /* ворота на передней (южной) стене */
  const gx = (g.wall + g.gate.x) * k, gw = g.gate.w * k, gh = g.gate.h * k;
  d.isoLine([gx, 0, 0], [gx, 0, gh], ox, oy, "THIN");
  d.isoLine([gx + gw, 0, 0], [gx + gw, 0, gh], ox, oy, "THIN");
  d.isoLine([gx, 0, gh], [gx + gw, 0, gh], ox, oy, "THIN");
  /* контейнер снаружи у ворот */
  d.isoBox(gx + (gw - g.container.L * k) / 2, -g.container.W * k - 300 * k, 0, g.container.L * k, g.container.W * k, g.container.H * k, ox, oy, "EQUIP");
}
