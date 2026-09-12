/* ==================================================================
 * ВОДОПОТРЕБЛЕНИЕ, ПОЖАРНЫЙ РАСХОД И АРМАТУРА ПО УЗЛАМ
 *
 * water-network.ts считает сеть, когда отборы в узлах уже известны.
 * Но проектировщик знает не отборы, а жителей: в этом квартале живёт
 * столько-то, в том — столько-то. Здесь жители превращаются в расход:
 * норма на человека → средние сутки → максимальные сутки → максимальный
 * час. Именно максимальный час и есть узловой отбор для расчёта сети.
 *
 * ТИП НАСЕЛЁННОГО ПУНКТА И МЕСТНОСТЬ — ДВЕ РАЗНЫЕ ВЕЩИ
 *
 * Тип пункта (город, посёлок, село) задаёт норму на жителя и число
 * пожаров. Местность (равнина, предгорье, горы) — то, что делать с
 * перепадом отметок: в горах свободный напор в нижних узлах уходит за
 * 60 м, и сеть надо делить на зоны; на вершинах нужны вантузы, в
 * низинах — выпуски. Программа не выдумывает рельеф — она читает
 * отметки узлов, а «горы» лишь ужесточают проверки.
 *
 * ПОЖАР — ОТДЕЛЬНЫЙ РЕЖИМ
 *
 * Сеть считается дважды: в час максимального водопотребления и в тот
 * же час плюс пожар. Число одновременных пожаров и расход на один
 * пожар — по населению и этажности. Пожар ставится в самый невыгодный
 * узел — тот, где в обычном режиме напор ниже всего, — если
 * проектировщик не указал другой. Требование в пожарном режиме одно:
 * свободный напор у гидранта не ниже 10 м (сеть низкого давления).
 *
 * ФОРМУЛЫ ВОЗВРАЩАЮТСЯ ВМЕСТЕ С ЧИСЛАМИ
 *
 * Каждый шаг отдаёт формулу с подставленными значениями. Проектировщик
 * должен видеть, откуда взялось число, а не верить программе.
 *
 * ЧТО ОТ НОРМЫ, А ЧТО ОТ ПРАКТИКИ
 *
 * Норма на жителя — ҚМҚ 2.04.03-19, табл. 3 (она же — водопотребление
 * по ШНК 2.04.02-97*, п. 2.1). Коэффициенты неравномерности и пожарные
 * расходы — по СНиП 2.04.02-84 (первоисточник ШНК 2.04.02-97*), пункты
 * ШНК не проставлены — сверить по действующей редакции.
 * ================================================================== */

import { specificWaterUse, type SettlementCategory, type WaterUseHorizon } from "../norms/kmk-2-04-03-19";
import type { NetNode, NetLink, WaterNetworkResult } from "./water-network";

/* ------------------------------------------------------------------
 * ТИПЫ НАСЕЛЁННЫХ ПУНКТОВ И МЕСТНОСТИ
 * ------------------------------------------------------------------ */
export type SettlementKind = "city-large" | "city" | "town" | "village";
export type Terrain = "flat" | "hills" | "mountain";

export const SETTLEMENT: Record<SettlementKind, { label: string; category: SettlementCategory | null; lpcd?: number; note: string }> = {
  "city-large": { label: "Город, более 100 тыс. жителей", category: "city-over-100k", note: "норма по табл. 3 ҚМҚ 2.04.03-19, поз. 1" },
  city: { label: "Город, до 100 тыс. жителей", category: "city-under-100k", note: "норма по табл. 3 ҚМҚ 2.04.03-19, поз. 2" },
  town: { label: "Посёлок, райцентр, до 50 тыс.", category: "town-under-50k", note: "норма по табл. 3 ҚМҚ 2.04.03-19, поз. 3" },
  village: {
    label: "Село, водоразбор из колонок",
    category: null,
    lpcd: 50,
    note: "50 л/сут на жителя при водоразборе из уличных колонок — практика по СНиП 2.04.02-84 п. 2.1 (30–50 л/сут); пункт ШНК сверить",
  },
};

export const TERRAIN: Record<Terrain, { label: string; note: string }> = {
  flat: { label: "Равнина", note: "перепады отметок малы, зонирование не требуется" },
  hills: { label: "Предгорье", note: "перепады до 60 м; проверяется предельный напор в нижних узлах" },
  mountain: {
    label: "Горы",
    note: "перепады больше 60 м: сеть делится на зоны по давлению, на вершинах — вантузы, в низинах — выпуски, атмосферное давление ниже",
  },
};

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const DEMAND = {
  kDayMax: { value: 1.2, note: "коэффициент суточной неравномерности 1,1–1,3, принято 1,2 — СНиП 2.04.02-84 п. 2.2" },
  alphaMax: { value: 1.3, note: "α_max = 1,2–1,4 (степень благоустройства, режим работы предприятий), принято 1,3 — там же" },
  unaccountedPct: { value: 10, note: "неучтённые расходы 10 % — ҚМҚ 2.04.03-19, табл. 3, прим. 5 (10–15 %)" },
  fireDurationH: { value: 3, note: "расчётная продолжительность тушения пожара 3 ч — СНиП 2.04.02-84 п. 2.24" },
  hydrantSpacingM: { value: 150, note: "гидранты вдоль проездов не реже чем через 150 м — СНиП 2.04.02-84 п. 8.16" },
  fireMinHeadM: { value: 10, note: "свободный напор в сети низкого давления при пожаре не менее 10 м — СНиП 2.04.02-84 п. 2.26" },
  zoneHeadM: { value: 60, note: "при свободном напоре выше 60 м сеть делится на зоны — СНиП 2.04.02-84 п. 2.28" },
} as const;

/**
 * β_max — коэффициент, учитывающий число жителей (СНиП 2.04.02-84, табл. 2).
 * Промежуточные значения — интерполяцией.
 */
export const BETA_MAX: [number, number][] = [
  [100, 4.5], [150, 4.0], [200, 3.5], [300, 3.0], [500, 2.5], [750, 2.2], [1000, 2.0], [1500, 1.8],
  [2500, 1.6], [4000, 1.5], [6000, 1.4], [10000, 1.3], [20000, 1.2], [50000, 1.15], [100000, 1.1],
  [300000, 1.05], [1000000, 1.0],
];

export function betaMax(people: number): number {
  if (people <= BETA_MAX[0][0]) return BETA_MAX[0][1];
  for (let i = 1; i < BETA_MAX.length; i += 1) {
    const [p0, b0] = BETA_MAX[i - 1];
    const [p1, b1] = BETA_MAX[i];
    if (people <= p1) return b0 + ((b1 - b0) * (people - p0)) / (p1 - p0);
  }
  return BETA_MAX[BETA_MAX.length - 1][1];
}

/**
 * Пожар: число одновременных пожаров и расход на один, л/с
 * (СНиП 2.04.02-84, табл. 5 — для застройки до 2 этажей и 3 и выше).
 */
export const FIRE_TABLE: { maxPeople: number; fires: number; lpsLow: number; lpsHigh: number }[] = [
  { maxPeople: 1000, fires: 1, lpsLow: 5, lpsHigh: 10 },
  { maxPeople: 5000, fires: 1, lpsLow: 10, lpsHigh: 10 },
  { maxPeople: 10000, fires: 1, lpsLow: 10, lpsHigh: 15 },
  { maxPeople: 25000, fires: 2, lpsLow: 10, lpsHigh: 15 },
  { maxPeople: 50000, fires: 2, lpsLow: 20, lpsHigh: 25 },
  { maxPeople: 100000, fires: 2, lpsLow: 25, lpsHigh: 35 },
  { maxPeople: 200000, fires: 3, lpsLow: 40, lpsHigh: 40 },
  { maxPeople: 300000, fires: 3, lpsLow: 55, lpsHigh: 55 },
  { maxPeople: 400000, fires: 3, lpsLow: 70, lpsHigh: 70 },
  { maxPeople: 500000, fires: 3, lpsLow: 80, lpsHigh: 80 },
  { maxPeople: 600000, fires: 3, lpsLow: 85, lpsHigh: 85 },
  { maxPeople: 700000, fires: 3, lpsLow: 90, lpsHigh: 90 },
  { maxPeople: 800000, fires: 3, lpsLow: 95, lpsHigh: 95 },
  { maxPeople: 1000000, fires: 3, lpsLow: 100, lpsHigh: 100 },
];

export function fireDemand(people: number, floors: number): { fires: number; lpsPerFire: number } {
  const row = FIRE_TABLE.find((r) => people <= r.maxPeople) ?? FIRE_TABLE[FIRE_TABLE.length - 1];
  return { fires: row.fires, lpsPerFire: floors >= 3 ? row.lpsHigh : row.lpsLow };
}

/* ------------------------------------------------------------------
 * РАСХОДЫ ПО ЖИТЕЛЯМ
 * ------------------------------------------------------------------ */
export type Formula = { label: string; formula: string; result: string; source?: string };

export type DemandNode = NetNode & { people?: number };

export type DemandInput = {
  nodes: DemandNode[];
  settlement: SettlementKind;
  horizon?: WaterUseHorizon;
  floors?: number;
  kDayMax?: number;
  alphaMax?: number;
  unaccountedPct?: number;
  /** норма на жителя, если задана вручную, л/сут */
  lpcdOverride?: number;
};

export type DemandResult = {
  lpcd: number;
  lpcdSource: string;
  totalPeople: number;
  qAvgDayM3: number;
  qMaxDayM3: number;
  kDayMax: number;
  kHourMax: number;
  alphaMax: number;
  betaMax: number;
  qMaxHourLps: number;
  /** узлы с рассчитанным отбором, л/с — готовы для сети */
  nodes: NetNode[];
  fire: { fires: number; lpsPerFire: number; totalLps: number; volumeM3: number };
  formulas: Formula[];
  assumptions: string[];
};

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));
const r3 = (x: number) => Number(x.toFixed(3));

export function calculateDemand(input: DemandInput): DemandResult {
  const s = SETTLEMENT[input.settlement];
  const horizon = input.horizon ?? 2035;
  const norm = input.lpcdOverride
    ? { lpcd: input.lpcdOverride, source: "норма задана проектировщиком" }
    : s.category
      ? specificWaterUse(s.category, horizon)
      : { lpcd: s.lpcd ?? 50, source: s.note };
  const kDay = input.kDayMax ?? DEMAND.kDayMax.value;
  const alpha = input.alphaMax ?? DEMAND.alphaMax.value;
  const unacc = input.unaccountedPct ?? DEMAND.unaccountedPct.value;
  const floors = Math.max(1, Math.round(input.floors ?? 1));

  const totalPeople = input.nodes.reduce((a, n) => a + (n.people ?? 0), 0);
  const beta = betaMax(Math.max(1, totalPeople));
  const kHour = alpha * beta;

  const qAvgDay = (totalPeople * norm.lpcd * (1 + unacc / 100)) / 1000;
  const qMaxDay = qAvgDay * kDay;
  const qMaxHourLps = (qMaxDay * kHour * 1000) / 86400;

  /* Отбор по узлам: жители → тот же путь, что и для всего пункта, но
     коэффициенты одни на всех — неравномерность свойство пункта, а
     не квартала. Если у узла отбор задан напрямую — он и берётся. */
  const nodes: NetNode[] = input.nodes.map((n) => {
    if (n.demandLps !== undefined && n.demandLps > 0) return { ...n };
    const people = n.people ?? 0;
    const lps = (people * norm.lpcd * (1 + unacc / 100) * kDay * kHour) / 86400;
    return { ...n, demandLps: r3(lps) };
  });

  const fire = fireDemand(totalPeople, floors);
  const fireTotal = fire.fires * fire.lpsPerFire;
  const fireVolume = (fireTotal * DEMAND.fireDurationH.value * 3600) / 1000;

  const formulas: Formula[] = [
    {
      label: "Норма водопотребления",
      formula: `q = ${norm.lpcd} л/сут на жителя`,
      result: norm.source,
    },
    {
      label: "Среднесуточный расход",
      formula: `Q_ср.сут = N · q · (1 + ${unacc} %) / 1000 = ${totalPeople} · ${norm.lpcd} · ${(1 + unacc / 100).toFixed(2)} / 1000`,
      result: `${r1(qAvgDay)} м³/сут`,
      source: "ҚМҚ 2.04.03-19 п. 2.3; неучтённые — табл. 3 прим. 5",
    },
    {
      label: "Максимальный суточный расход",
      formula: `Q_max.сут = K_сут.max · Q_ср.сут = ${kDay} · ${r1(qAvgDay)}`,
      result: `${r1(qMaxDay)} м³/сут`,
      source: "СНиП 2.04.02-84 п. 2.2",
    },
    {
      label: "Коэффициент часовой неравномерности",
      formula: `K_ч.max = α_max · β_max = ${alpha} · ${r2(beta)} (β при N = ${totalPeople} чел.)`,
      result: `${r2(kHour)}`,
      source: "СНиП 2.04.02-84 п. 2.2, табл. 2",
    },
    {
      label: "Максимальный часовой расход (расчётный для сети)",
      formula: `q_max.ч = Q_max.сут · K_ч.max · 1000 / 86400 = ${r1(qMaxDay)} · ${r2(kHour)} · 1000 / 86400`,
      result: `${r2(qMaxHourLps)} л/с`,
    },
    {
      label: "Узловой отбор",
      formula: "q_узла = N_узла · q · (1 + неучт.) · K_сут.max · K_ч.max / 86400",
      result: "л/с, по каждому узлу в таблице",
    },
    {
      label: "Пожарный расход",
      formula: `n = ${fire.fires} пожар${fire.fires === 1 ? "" : "а"} × ${fire.lpsPerFire} л/с (N = ${totalPeople} чел., ${floors >= 3 ? "3 этажа и выше" : "до 2 этажей"})`,
      result: `${fireTotal} л/с`,
      source: "СНиП 2.04.02-84 табл. 5",
    },
    {
      label: "Неприкосновенный пожарный запас",
      formula: `W_пож = Q_пож · t · 3,6 = ${fireTotal} · ${DEMAND.fireDurationH.value} ч · 3,6`,
      result: `${r1(fireVolume)} м³`,
      source: DEMAND.fireDurationH.note,
    },
  ];

  const assumptions = [
    `Населённый пункт: ${s.label}. ${norm.source}.`,
    `${DEMAND.kDayMax.note}${input.kDayMax ? ` (задано ${input.kDayMax})` : ""}.`,
    `${DEMAND.alphaMax.note}${input.alphaMax ? ` (задано ${input.alphaMax})` : ""}; β_max = ${r2(beta)} по числу жителей ${totalPeople}.`,
    `${DEMAND.unaccountedPct.note}.`,
    "Коэффициенты неравномерности одни на весь пункт: неравномерность — свойство пункта, а не квартала. Узловые отборы пропорциональны жителям.",
    "Если у узла отбор задан напрямую (л/с), он берётся как есть — например, для предприятия или общественного здания.",
    `Пожар: ${fire.fires} × ${fire.lpsPerFire} л/с при ${totalPeople} жителях и застройке ${floors} эт. — СНиП 2.04.02-84 табл. 5; ${DEMAND.fireDurationH.note}.`,
  ];

  return {
    lpcd: norm.lpcd,
    lpcdSource: norm.source,
    totalPeople,
    qAvgDayM3: r1(qAvgDay),
    qMaxDayM3: r1(qMaxDay),
    kDayMax: kDay,
    kHourMax: r2(kHour),
    alphaMax: alpha,
    betaMax: r2(beta),
    qMaxHourLps: r2(qMaxHourLps),
    nodes,
    fire: { fires: fire.fires, lpsPerFire: fire.lpsPerFire, totalLps: fireTotal, volumeM3: r1(fireVolume) },
    formulas,
    assumptions,
  };
}

/* ------------------------------------------------------------------
 * АРМАТУРА ПО УЗЛАМ И УЧАСТКАМ
 *
 * Что ставить в каждом узле, решается по трём вещам: сколько участков
 * сходится в узле, как он расположен относительно соседей по высоте
 * и какой в нём напор.
 * ------------------------------------------------------------------ */
export type NodeEquipment = {
  id: string;
  items: string[];
  reasons: string[];
};

export type LinkEquipment = {
  id: string;
  hydrants: number;
  note: string;
};

export function equipmentPlan(
  nodes: NetNode[],
  links: NetLink[],
  net: WaterNetworkResult,
  opts: { sourceId: string; terrain: Terrain; withHydrants: boolean },
): { nodes: NodeEquipment[]; links: LinkEquipment[]; zoning: string | null; formulas: Formula[] } {
  const degree = new Map<string, number>();
  const neighbors = new Map<string, string[]>();
  links.forEach((l) => {
    degree.set(l.from, (degree.get(l.from) ?? 0) + 1);
    degree.set(l.to, (degree.get(l.to) ?? 0) + 1);
    neighbors.set(l.from, [...(neighbors.get(l.from) ?? []), l.to]);
    neighbors.set(l.to, [...(neighbors.get(l.to) ?? []), l.from]);
  });
  const ground = new Map(nodes.map((n) => [n.id, n.groundM]));
  const free = new Map(net.nodes.map((n) => [n.id, n.freeHeadM]));

  const nodePlan: NodeEquipment[] = nodes.map((n) => {
    const items: string[] = ["колодец"];
    const reasons: string[] = [];
    const deg = degree.get(n.id) ?? 0;
    const nb = neighbors.get(n.id) ?? [];
    const z = n.groundM;

    if (n.id === opts.sourceId) {
      items.push("задвижка на выходе", "обратный клапан", "водомер", "манометр");
      reasons.push("источник: отсечение, защита от обратного тока, учёт");
    } else if (deg >= 3) {
      items.push(`задвижки — ${deg} шт., по одной на каждый участок`);
      reasons.push(`узел ${deg} участков: любой участок отключается без остановки остальных`);
    } else if (deg === 2) {
      items.push("задвижка — 1 шт.");
      reasons.push("проходной узел: секционирование сети");
    } else {
      items.push("задвижка — 1 шт.");
      reasons.push("конец ветки");
    }

    const isSource = n.id === opts.sourceId;
    const higherThanAll = !isSource && nb.length > 0 && nb.every((m) => (ground.get(m) ?? z) < z);
    const lowerThanAll = !isSource && nb.length > 0 && nb.every((m) => (ground.get(m) ?? z) > z);
    if (higherThanAll) {
      items.push("вантуз");
      reasons.push("вершина: выше всех соседних узлов — здесь скапливается воздух");
    }
    if (lowerThanAll) {
      items.push("выпуск (грязевик)");
      reasons.push("низшая точка: сюда стекает осадок и отсюда опорожняется сеть");
    }
    if (deg === 1 && n.id !== opts.sourceId) {
      if (!lowerThanAll) items.push("выпуск для промывки");
      reasons.push("тупик: застой воды, нужна промывка");
    }

    const fh = free.get(n.id);
    if (fh !== undefined && fh > DEMAND.zoneHeadM.value) {
      items.push("регулятор давления «после себя» или граница зоны");
      reasons.push(`свободный напор ${fh} м выше ${DEMAND.zoneHeadM.value} м`);
    }
    if (opts.withHydrants && n.id !== opts.sourceId && deg >= 2) {
      items.push("пожарный гидрант");
      reasons.push("узел застройки; шаг гидрантов не больше 150 м");
    }
    return { id: n.id, items, reasons };
  });

  const linkPlan: LinkEquipment[] = links.map((l) => {
    const hydr = opts.withHydrants ? Math.max(0, Math.ceil(l.lengthM / DEMAND.hydrantSpacingM.value) - 1) : 0;
    return {
      id: `${l.from}-${l.to}`,
      hydrants: hydr,
      note: hydr > 0 ? `${l.lengthM} м / ${DEMAND.hydrantSpacingM.value} м → ${hydr} промежуточных гидрантов` : "гидранты в узлах",
    };
  });

  const zs = nodes.map((n) => n.groundM);
  const range = Math.max(...zs) - Math.min(...zs);
  let zoning: string | null = null;
  if (range > DEMAND.zoneHeadM.value) {
    zoning = `Перепад отметок по сети ${r1(range)} м больше ${DEMAND.zoneHeadM.value} м: при одном источнике в нижних узлах напор превысит предел. Сеть делится на зоны по давлению — верхняя и нижняя, с регуляторами давления или отдельными подкачками. ${opts.terrain === "mountain" ? "Для горной местности это обычное решение." : ""}`;
  } else if (opts.terrain === "mountain") {
    zoning = `Перепад отметок ${r1(range)} м в пределах ${DEMAND.zoneHeadM.value} м — зонирование не требуется, но в горах проверьте отметки: съёмка часто занижает перепады.`;
  }

  const formulas: Formula[] = [
    { label: "Гидранты на участке", formula: "n = ⌈L / 150⌉ − 1 промежуточных, плюс в узлах", result: DEMAND.hydrantSpacingM.note },
    { label: "Условие зонирования", formula: `z_max − z_min = ${r1(range)} м ${range > DEMAND.zoneHeadM.value ? ">" : "≤"} ${DEMAND.zoneHeadM.value} м`, result: range > DEMAND.zoneHeadM.value ? "зоны нужны" : "одна зона", source: DEMAND.zoneHeadM.note },
    { label: "Вантуз / выпуск", formula: "узел выше всех соседей → вантуз; ниже всех → выпуск", result: "по отметкам узлов" },
  ];

  return { nodes: nodePlan, links: linkPlan, zoning, formulas };
}
