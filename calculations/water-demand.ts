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

import {
  kmkRef,
  LOCAL_INDUSTRY_SHARE,
  specificWaterUse,
  unevenness,
  type SettlementCategory,
  type WaterUseHorizon,
} from "../norms/kmk-2-04-03-19";
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
 * РЕЕСТР ИСТОЧНИКОВ
 *
 * Каждая величина в расчёте помечена: норма это или практика, и какая
 * именно норма. Граница между ними — то, о чём эксперт вправе спорить
 * по существу; без неё спор идёт о том, что в расчёте вообще
 * происходит.
 *
 * ҚМҚ 2.04.03-19 — «Канализация. Наружные сети и сооружения». К
 * водоснабжению из него применимы табл. 3 (удельное водоотведение
 * прямо приравнено к водопотреблению по ШНК 2.04.02-97*, п. 2.1),
 * п. 2.3 (местная промышленность и неучтённые) и табл. 2 (общие
 * коэффициенты неравномерности — для притока сточных вод).
 *
 * Всё, что относится к самой водопроводной сети — свободные напоры,
 * пожарные расходы, зонирование, — нормирует ШНК 2.04.02-97*. Его
 * текста в модуле нет, поэтому пункты не проставлены: указан
 * первоисточник СНиП 2.04.02-84, из которого ШНК переиздан, с
 * пометкой «сверить».
 * ------------------------------------------------------------------ */
export type SourceKind = "норма" | "практика";
export type SourceRow = { label: string; value: string; kind: SourceKind; source: string };

export const NORM_DOC = {
  kmk: "ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения»",
  shnk: "ШНК 2.04.02-97* «Водоснабжение. Наружные сети и сооружения»",
  snip: "СНиП 2.04.02-84 (первоисточник ШНК 2.04.02-97*) — пункт ШНК сверить",
} as const;

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
  /**
   * Способ учёта неравномерности:
   *   "shnk" — K_сут.max × K_ч.max (α·β), водоснабжение;
   *   "kmk"  — общий коэффициент K_gen.max по табл. 2 ҚМҚ 2.04.03-19
   *            в зависимости от среднего расхода.
   * Второй способ — норматив КМК 2019 для притока сточных вод; для
   * водопровода он даёт другой, обычно меньший результат, и применять
   * его надо сознательно.
   */
  unevennessMethod?: "shnk" | "kmk";
  /** доля местной промышленности, доли единицы; по умолчанию 5 % (п. 2.3) */
  localIndustryShare?: number;
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
  /** способ учёта неравномерности */
  method: "shnk" | "kmk";
  /** общий коэффициент по табл. 2 КМК, если применён этот способ */
  kGenMax?: number;
  kGenSource?: string;
  /** доля местной промышленности */
  localIndustryShare: number;
  /** реестр источников: норма или практика по каждой величине */
  sources: SourceRow[];
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
  const method = input.unevennessMethod ?? "shnk";
  const industry = input.localIndustryShare ?? LOCAL_INDUSTRY_SHARE.value;

  /* Средний расход: норма × жители, плюс местная промышленность
     (п. 2.3) и неучтённые (табл. 3, прим. 5). */
  const qAvgDay = (totalPeople * norm.lpcd * (1 + industry) * (1 + unacc / 100)) / 1000;
  const qAvgLps = (qAvgDay * 1000) / 86400;

  /* Два способа перехода к расчётному расходу. */
  let kGen: number | undefined;
  let kGenSource: string | undefined;
  let qMaxDay: number;
  let qMaxHourLps: number;
  if (method === "kmk" && qAvgLps > 0) {
    const u = unevenness(qAvgLps);
    kGen = u.kMax;
    kGenSource = u.source;
    qMaxHourLps = qAvgLps * kGen;
    qMaxDay = qAvgDay * kDay;
  } else {
    qMaxDay = qAvgDay * kDay;
    qMaxHourLps = (qMaxDay * kHour * 1000) / 86400;
  }

  /* Отбор по узлам: жители → тот же путь, что и для всего пункта, но
     коэффициенты одни на всех — неравномерность свойство пункта, а
     не квартала. Если у узла отбор задан напрямую — он и берётся. */
  const nodes: NetNode[] = input.nodes.map((n) => {
    if (n.demandLps !== undefined && n.demandLps > 0) return { ...n };
    const people = n.people ?? 0;
    const base = (people * norm.lpcd * (1 + industry) * (1 + unacc / 100)) / 86400;
    const lps = method === "kmk" && kGen ? base * kGen : base * kDay * kHour;
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
      source: s.category ? kmkRef("2.9", "табл. 3") : NORM_DOC.snip,
    },
    {
      label: "Средний суточный расход",
      formula: `Q_ср.сут = N · q · (1 + ${Math.round(industry * 100)} %) · (1 + ${unacc} %) / 1000 = ${totalPeople} · ${norm.lpcd} · ${(1 + industry).toFixed(2)} · ${(1 + unacc / 100).toFixed(2)} / 1000`,
      result: `${r1(qAvgDay)} м³/сут = ${r2(qAvgLps)} л/с`,
      source: `${kmkRef("2.3")} — местная промышленность ${Math.round(industry * 100)} %; ${kmkRef("2.9", "табл. 3, прим. 5")} — неучтённые ${unacc} %`,
    },
    ...(method === "kmk"
      ? [
          {
            label: "Общий коэффициент неравномерности",
            formula: `K_gen.max при Q_ср = ${r2(qAvgLps)} л/с`,
            result: `${r2(kGen ?? 0)}`,
            source: kGenSource ?? kmkRef("2.7", "табл. 2"),
          },
          {
            label: "Расчётный расход (максимальный)",
            formula: `q_max = K_gen.max · Q_ср = ${r2(kGen ?? 0)} · ${r2(qAvgLps)}`,
            result: `${r2(qMaxHourLps)} л/с`,
            source: kmkRef("2.7"),
          },
        ]
      : [
          {
            label: "Максимальный суточный расход",
            formula: `Q_max.сут = K_сут.max · Q_ср.сут = ${kDay} · ${r1(qAvgDay)}`,
            result: `${r1(qMaxDay)} м³/сут`,
            source: NORM_DOC.snip + ", п. 2.2",
          },
          {
            label: "Коэффициент часовой неравномерности",
            formula: `K_ч.max = α_max · β_max = ${alpha} · ${r2(beta)} (β по N = ${totalPeople} чел.)`,
            result: `${r2(kHour)}`,
            source: NORM_DOC.snip + ", п. 2.2, табл. 2",
          },
          {
            label: "Максимальный часовой расход (расчётный для сети)",
            formula: `q_max.ч = Q_max.сут · K_ч.max · 1000 / 86400 = ${r1(qMaxDay)} · ${r2(kHour)} · 1000 / 86400`,
            result: `${r2(qMaxHourLps)} л/с`,
            source: NORM_DOC.snip + ", п. 2.2",
          },
        ]),
    {
      label: "Узловой отбор",
      formula:
        method === "kmk"
          ? "q_узла = N_узла · q · (1 + пром.) · (1 + неучт.) · K_gen.max / 86400"
          : "q_узла = N_узла · q · (1 + пром.) · (1 + неучт.) · K_сут.max · K_ч.max / 86400",
      result: "л/с, по каждому узлу в таблице",
    },
    {
      label: "Пожарный расход",
      formula: `n = ${fire.fires} пожар${fire.fires === 1 ? "" : "а"} × ${fire.lpsPerFire} л/с (N = ${totalPeople} чел., ${floors >= 3 ? "3 этажа и выше" : "до 2 этажей"})`,
      result: `${fireTotal} л/с`,
      source: NORM_DOC.snip + ", табл. 5",
    },
    {
      label: "Неприкосновенный пожарный запас",
      formula: `W_пож = Q_пож · t · 3,6 = ${fireTotal} · ${DEMAND.fireDurationH.value} ч · 3,6`,
      result: `${r1(fireVolume)} м³`,
      source: NORM_DOC.snip + ", п. 2.24",
    },
  ];

  const sources: SourceRow[] = [
    { label: "Удельное водопотребление", value: `${norm.lpcd} л/сут на жителя`, kind: s.category ? "норма" : "практика", source: norm.source },
    { label: "Местная промышленность", value: `${Math.round(industry * 100)} %`, kind: "норма", source: kmkRef("2.3") },
    { label: "Неучтённые расходы", value: `${unacc} %`, kind: "норма", source: kmkRef("2.9", "табл. 3, прим. 5") },
    ...(method === "kmk"
      ? [{ label: "Общий коэффициент неравномерности K_gen.max", value: `${r2(kGen ?? 0)}`, kind: "норма" as SourceKind, source: kGenSource ?? kmkRef("2.7", "табл. 2") }]
      : [
          { label: "Коэффициент суточной неравномерности K_сут.max", value: `${kDay}`, kind: "практика" as SourceKind, source: `${NORM_DOC.snip}, п. 2.2 (диапазон 1,1–1,3)` },
          { label: "α_max", value: `${alpha}`, kind: "практика" as SourceKind, source: `${NORM_DOC.snip}, п. 2.2 (диапазон 1,2–1,4)` },
          { label: "β_max", value: `${r2(beta)}`, kind: "норма" as SourceKind, source: `${NORM_DOC.snip}, п. 2.2, табл. 2 — по числу жителей` },
        ]),
    { label: "Число одновременных пожаров", value: `${fire.fires}`, kind: "норма", source: `${NORM_DOC.snip}, табл. 5` },
    { label: "Расход на один пожар", value: `${fire.lpsPerFire} л/с`, kind: "норма", source: `${NORM_DOC.snip}, табл. 5` },
    { label: "Продолжительность тушения", value: `${DEMAND.fireDurationH.value} ч`, kind: "норма", source: `${NORM_DOC.snip}, п. 2.24` },
    { label: "Свободный напор", value: "10 + 4·(этажей − 1) м", kind: "норма", source: `${NORM_DOC.snip}, п. 2.26` },
    { label: "Предельный напор в сети", value: `${DEMAND.zoneHeadM.value} м`, kind: "норма", source: `${NORM_DOC.snip}, п. 2.28` },
    { label: "Шаг пожарных гидрантов", value: `${DEMAND.hydrantSpacingM.value} м`, kind: "норма", source: `${NORM_DOC.snip}, п. 8.16` },
    { label: "Скорость в сети", value: "0,5–2,0 м/с", kind: "практика", source: "практика проектирования" },
    { label: "Потери напора", value: "формула Шевелёва", kind: "практика", source: "таблицы Ф. А. Шевелёва для гидравлического расчёта водопроводных труб" },
  ];

  const assumptions = [
    `Населённый пункт: ${s.label}. ${norm.source}.`,
    method === "kmk"
      ? `Неравномерность учтена общим коэффициентом K_gen.max = ${r2(kGen ?? 0)} по табл. 2 ҚМҚ 2.04.03-19 в зависимости от среднего расхода. Эта таблица нормирует приток СТОЧНЫХ вод; для водопровода она применена по прямому указанию проектировщика.`
      : `Неравномерность учтена раздельно: K_сут.max = ${kDay} и K_ч.max = α·β = ${alpha}·${r2(beta)} = ${r2(kHour)}. Это способ, принятый для водоснабжения (${NORM_DOC.shnk}).`,
    `Местная промышленность ${Math.round(industry * 100)} % — ${kmkRef("2.3")}.`,
    `${DEMAND.kDayMax.note}${input.kDayMax ? ` (задано ${input.kDayMax})` : ""}.`,
    `${DEMAND.alphaMax.note}${input.alphaMax ? ` (задано ${input.alphaMax})` : ""}; β_max = ${r2(beta)} по числу жителей ${totalPeople}.`,
    `${DEMAND.unaccountedPct.note}.`,
    "Коэффициенты неравномерности одни на весь пункт: неравномерность — свойство пункта, а не квартала. Узловые отборы пропорциональны жителям.",
    "Если у узла отбор задан напрямую (л/с), он берётся как есть — например, для предприятия или общественного здания.",
    `Пожар: ${fire.fires} × ${fire.lpsPerFire} л/с при ${totalPeople} жителях и застройке ${floors} эт. — СНиП 2.04.02-84 табл. 5; ${DEMAND.fireDurationH.note}.`,
  ];

  return {
    method,
    kGenMax: kGen !== undefined ? r2(kGen) : undefined,
    kGenSource,
    localIndustryShare: industry,
    sources,
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
