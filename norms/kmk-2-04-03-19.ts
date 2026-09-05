/* ==================================================================
 * ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения»
 * (вторая редакция, с изменениями и дополнениями; взамен КМК 2.04.03-97)
 *
 * Утверждён приказом Министерства строительства Республики Узбекистан
 * от 27 сентября 2019 г. № 439. Введён в действие с 1 января 2020 г.
 * Изменения и дополнения внесены ГУП «Узбеккоммуналлойихакурилиш».
 *
 * ЕДИНЫЙ ИСТОЧНИК нормативных чисел для инженерного раздела сайта.
 * Каждая величина снабжена номером пункта / таблицы / формулы
 * действующей редакции. Ничего из отменённого КМК 2.04.03-97 или
 * СНиП 2.04.03-85 сюда не переносится «по памяти»: только текст
 * ҚМҚ 2.04.03-19 (русская часть официального издания, стр. 139–271).
 *
 * Полная выжимка норматива хранится в проекте SUVSANOAT:
 *   Normativy/KMK_2.04.03-19_ch1_mekhanika_biologiya.md
 *   Normativy/KMK_2.04.03-19_ch2_doochistka_osadok.md
 * ================================================================== */

export const KMK_2_04_03_19_DOC = {
  code: "ҚМҚ 2.04.03-19",
  codeRu: "КМК 2.04.03-19",
  title: "Канализация. Наружные сети и сооружения",
  edition: "вторая редакция, с изменениями и дополнениями",
  replaces: "КМК 2.04.03-97",
  approvedBy:
    "приказ Министерства строительства Республики Узбекистан от 27.09.2019 № 439",
  effectiveFrom: "2020-01-01",
  sourceUrl:
    "https://main.tmsiti.uz/media/FILES/shnk/%D2%9A%D0%9C%D2%9A_2.04.03-19.pdf",
} as const;

/** Короткая ссылка на пункт/таблицу для подписи в интерфейсе и записке. */
export function kmkRef(clause: string, table?: string): string {
  const t = table ? `, ${table}` : "";
  return `${KMK_2_04_03_19_DOC.code}, п. ${clause}${t}`;
}

/* ==================================================================
 * РАЗДЕЛ 1. Санитарно-защитные зоны (п. 1.10, табл. 1)
 * ================================================================== */

export type SzzRow = {
  id: string;
  facility: string;
  /** СЗЗ, м, по диапазонам производительности, тыс. м³/сут:
   *  [до 0,2; св. 0,2 до 5; св. 5 до 50; св. 50 до 280]; null — не нормируется */
  m: readonly [number | null, number | null, number | null, number | null];
};

export const SZZ_TABLE_1: readonly SzzRow[] = [
  {
    id: "mechbio-sludge-beds",
    facility:
      "Сооружения механической и биологической очистки с иловыми площадками для сброженных осадков, а также отдельно расположенные иловые площадки",
    m: [150, 200, 400, 500],
  },
  {
    id: "mechbio-thermal",
    facility:
      "Сооружения механической и биологической очистки с термомеханической обработкой осадков в закрытых помещениях",
    m: [100, 150, 300, 400],
  },
  { id: "filtration-fields", facility: "Поля фильтрации", m: [200, 300, 500, null] },
  { id: "irrigation-fields", facility: "Земледельческие поля орошения", m: [150, 200, 400, null] },
  { id: "bio-ponds", facility: "Биологические пруды", m: [200, 200, 300, 300] },
  {
    id: "oxidation-ditch",
    facility: "Сооружения с циркуляционными окислительными каналами",
    m: [150, null, null, null],
  },
  { id: "pump-station", facility: "Насосные станции", m: [15, 20, 20, 30] },
] as const;

export const SZZ_TABLE_1_NOTES = [
  "Прим. 1. СЗЗ сооружений производительностью свыше 280 тыс. м³/сут, а также при отступлении от принятой технологии очистки и обработки осадка — по согласованию с Главным санитарно-эпидемиологическим управлением Минздрава РУз.",
  "Прим. 2. СЗЗ допускается увеличивать не более чем в 2 раза при расположении жилой застройки с подветренной стороны или уменьшать не более чем на 25 % при благоприятной розе ветров.",
  "Прим. 3. При отсутствии иловых площадок на территории очистных сооружений производительностью свыше 0,2 тыс. м³/сут размер зоны сокращается на 30 %.",
  "Прим. 4. СЗЗ от полей фильтрации площадью до 0,5 га и от сооружений механической и биологической очистки на биофильтрах производительностью до 50 м³/сут — 100 м.",
  "Прим. 5. СЗЗ от полей подземной фильтрации производительностью менее 15 м³/сут — 15 м.",
  "Прим. 6. СЗЗ от фильтрующих траншей и песчано-гравийных фильтров — 25 м; от септиков — 5 м; от фильтрующих колодцев — 8 м; от аэрационных установок на полное окисление с аэробной стабилизацией ила производительностью до 700 м³/сут — 50 м.",
  "Прим. 7. СЗЗ от сливных станций — 300 м.",
  "Прим. 8. СЗЗ от очистных сооружений поверхностных вод с селитебных территорий — 100 м, от насосных станций — 15 м; от очистных сооружений промпредприятий — по согласованию с органами санэпиднадзора.",
] as const;

export type SzzResult = {
  meters: number;
  basis: string;
  /** какие примечания к табл. 1 могут менять величину */
  notes: string[];
};

/**
 * Санитарно-защитная зона для очистных сооружений по табл. 1 ҚМҚ 2.04.03-19.
 * @param qM3Day расчётная производительность, м³/сут
 * @param kind тип сооружений: full-oxidation — аэрационная установка на полное
 *   окисление с аэробной стабилизацией ила (прим. 6 — 50 м при Q ≤ 700 м³/сут);
 *   mechbio-thermal — обработка осадка в закрытых помещениях (термомеханическая,
 *   механическое обезвоживание в здании); mechbio-sludge-beds — с иловыми площадками.
 * @param sludgeBedsOnSite есть ли иловые площадки на площадке (прим. 3)
 */
export function sanitaryZone(
  qM3Day: number,
  kind: "full-oxidation" | "mechbio-thermal" | "mechbio-sludge-beds" | "bio-ponds" | "oxidation-ditch",
  sludgeBedsOnSite = false,
): SzzResult {
  const notes: string[] = [];
  if (kind === "full-oxidation" && qM3Day <= 700) {
    return {
      meters: 50,
      basis: `${KMK_2_04_03_19_DOC.code}, табл. 1, прим. 6 (аэрационная установка на полное окисление с аэробной стабилизацией ила, до 700 м³/сут)`,
      notes: [
        "Величина может быть увеличена до 2 раз при подветренном расположении жилой застройки (прим. 2).",
      ],
    };
  }
  const rowId = kind === "full-oxidation" ? "mechbio-thermal" : kind;
  const row = SZZ_TABLE_1.find((r) => r.id === rowId)!;
  const th = qM3Day / 1000;
  const col = th <= 0.2 ? 0 : th <= 5 ? 1 : th <= 50 ? 2 : th <= 280 ? 3 : 3;
  let meters = row.m[col] ?? row.m.filter((v): v is number => v !== null).slice(-1)[0];
  if (th > 280) notes.push("Производительность свыше 280 тыс. м³/сут — СЗЗ по согласованию с Минздравом РУз (прим. 1).");
  if (kind !== "bio-ponds" && kind !== "oxidation-ditch" && !sludgeBedsOnSite && th > 0.2) {
    meters = Math.round(meters * 0.7);
    notes.push("Иловых площадок на площадке нет — зона сокращена на 30 % (прим. 3).");
  }
  notes.push("Допускается увеличение до 2 раз при подветренном расположении жилой застройки или уменьшение до 25 % при благоприятной розе ветров (прим. 2).");
  const ranges = ["до 0,2", "св. 0,2 до 5", "св. 5 до 50", "св. 50 до 280"];
  return {
    meters,
    basis: `${KMK_2_04_03_19_DOC.code}, п. 1.10, табл. 1 (${row.facility.toLowerCase()}; ${ranges[col]} тыс. м³/сут)`,
    notes,
  };
}

/* ==================================================================
 * РАЗДЕЛ 2. Расчётные расходы сточных вод
 * ================================================================== */

/** п. 2.3 / 2.5: местная промышленность и неучтённые расходы — +5 % к среднесуточному водоотведению населённого пункта. */
export const LOCAL_INDUSTRY_SHARE = { value: 0.05, ref: kmkRef("2.3") } as const;

/** п. 2.7, табл. 2 — общие коэффициенты неравномерности притока. */
export type UnevennessRow = { averageLps: number; kMax: number; kMin: number };

export const TABLE_2_UNEVENNESS: readonly UnevennessRow[] = [
  { averageLps: 5, kMax: 2.5, kMin: 0.38 },
  { averageLps: 10, kMax: 2.1, kMin: 0.45 },
  { averageLps: 20, kMax: 1.9, kMin: 0.5 },
  { averageLps: 50, kMax: 1.7, kMin: 0.55 },
  { averageLps: 100, kMax: 1.6, kMin: 0.59 },
  { averageLps: 300, kMax: 1.55, kMin: 0.62 },
  { averageLps: 500, kMax: 1.5, kMin: 0.66 },
  { averageLps: 1000, kMax: 1.47, kMin: 0.69 },
  { averageLps: 5000, kMax: 1.44, kMin: 0.71 },
] as const;

export const TABLE_2_NOTES = [
  "Прим. 1. Коэффициенты табл. 2 допускается принимать при количестве производственных сточных вод не более 45 % общего расхода; при большей доле — по фактическим графикам притока.",
  "Прим. 2. При средних расходах менее 5 л/с расчётные расходы определяются по КМК 2.04.01-98.",
  "Прим. 3. При промежуточных значениях среднего расхода коэффициенты определяются интерполяцией.",
] as const;

export type UnevennessResult = {
  kMax: number;
  kMin: number;
  interpolated: boolean;
  /** расход ниже 5 л/с — табл. 2 напрямую не применяется (прим. 2) */
  belowTable: boolean;
  source: string;
};

/**
 * Общие коэффициенты неравномерности по табл. 2 (п. 2.7).
 * Ниже 5 л/с возвращается первая строка (K_max = 2,5) как ближайшее
 * нормативное значение с пометкой belowTable — для малых объектов
 * расчётный расход по прим. 2 определяется по КМК 2.04.01-98.
 */
export function unevenness(averageLps: number): UnevennessResult {
  if (!Number.isFinite(averageLps) || averageLps <= 0) {
    throw new Error("Средний расход сточных вод должен быть положительным числом.");
  }
  const rows = TABLE_2_UNEVENNESS;
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (averageLps < first.averageLps) {
    return {
      kMax: first.kMax,
      kMin: first.kMin,
      interpolated: false,
      belowTable: true,
      source: `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2; расход менее 5 л/с — принята первая строка таблицы, по прим. 2 расчётный расход подлежит проверке по КМК 2.04.01-98`,
    };
  }
  if (averageLps >= last.averageLps) {
    return {
      kMax: last.kMax,
      kMin: last.kMin,
      interpolated: false,
      belowTable: false,
      source: `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2 (5000 л/с и более)`,
    };
  }
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    if (averageLps === a.averageLps) {
      return { kMax: a.kMax, kMin: a.kMin, interpolated: false, belowTable: false, source: `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2` };
    }
    if (averageLps > a.averageLps && averageLps < b.averageLps) {
      const r = (averageLps - a.averageLps) / (b.averageLps - a.averageLps);
      return {
        kMax: a.kMax + r * (b.kMax - a.kMax),
        kMin: a.kMin + r * (b.kMin - a.kMin),
        interpolated: true,
        belowTable: false,
        source: `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2, прим. 3 (интерполяция между ${a.averageLps} и ${b.averageLps} л/с)`,
      };
    }
  }
  return { kMax: last.kMax, kMin: last.kMin, interpolated: false, belowTable: false, source: `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2` };
}

/** Коэффициент максимальной неравномерности по среднесуточному расходу, м³/сут. */
export function kMaxByDailyFlow(qM3Day: number): UnevennessResult {
  return unevenness((qM3Day * 1000) / 86400);
}

/** п. 2.9, табл. 3 — удельное среднесуточное (за год) водоотведение, л/сут на 1 жителя. */
export type WaterUseHorizon = 2020 | 2035;

export type SettlementCategory =
  | "city-over-100k"
  | "city-under-100k"
  | "town-under-50k";

export const TABLE_3_WATER_USE: Record<
  SettlementCategory,
  { label: string; lps: Record<WaterUseHorizon, number>; coverage: Record<WaterUseHorizon, string>; row: Record<WaterUseHorizon, string> }
> = {
  "city-over-100k": {
    label: "Города с централизованной канализацией, население более 100 тыс. чел.",
    lps: { 2020: 230, 2035: 280 },
    coverage: { 2020: "60–70 % охват канализацией", 2035: "60–70 % охват канализацией" },
    row: { 2020: "1", 2035: "1" },
  },
  "city-under-100k": {
    label: "Города с централизованной канализацией, население до 100 тыс. чел.",
    lps: { 2020: 200, 2035: 230 },
    coverage: { 2020: "20–25 % охват канализацией", 2035: "30–45 % охват канализацией" },
    row: { 2020: "2", 2035: "2.1" },
  },
  "town-under-50k": {
    label: "Города, городские посёлки и райцентры с населением до 50 тыс. чел.",
    lps: { 2020: 150, 2035: 170 },
    coverage: { 2020: "без централизованной канализации, 5–10 % охват", 2035: "с централизованной канализацией, 15–30 % охват" },
    row: { 2020: "3", 2035: "3.1" },
  },
};

export const TABLE_3_NOTES = [
  "Прим. 1. Удельное водоотведение включает расход воды на хозяйственно-питьевые нужды в жилых и общественных зданиях и нужды местной промышленности.",
  "Прим. 2. Удельное водопотребление допускается изменять на 10–20 % в зависимости от местных условий и степени благоустройства.",
  "Прим. 3. При отсутствии данных о развитии промышленности допускается принимать дополнительный расход стоков от предприятий в среднем до 25 % расхода, определённого по удельному водоотведению.",
  "Прим. 4. Значения табл. 3 приняты при повсеместной установке приборов учёта воды.",
  "Прим. 5. Неучтённые расходы — по данным эксплуатирующей организации; при отсутствии данных — 10–15 % суммарного расхода стоков от хозяйственных и коммунально-бытовых нужд.",
] as const;

/** Горизонт по умолчанию для новых сооружений — расчётный срок 2035 г. (решение SUVSANOAT, 05.09.2026). */
export const DEFAULT_WATER_USE_HORIZON: WaterUseHorizon = 2035;

export function specificWaterUse(
  category: SettlementCategory,
  horizon: WaterUseHorizon = DEFAULT_WATER_USE_HORIZON,
): { lpcd: number; source: string } {
  const row = TABLE_3_WATER_USE[category];
  return {
    lpcd: row.lps[horizon],
    source: `${KMK_2_04_03_19_DOC.code}, п. 2.9, табл. 3, поз. ${row.row[horizon]} (${horizon} г.; ${row.coverage[horizon]})`,
  };
}

/** п. 2.10, ф. (1): дополнительный приток q_ad = 0,15·L·√m_d, л/с (L — км, m_d — макс. суточные осадки, мм, по КМК 2.01.01-94). */
export function infiltrationInflowLps(lengthKm: number, maxDailyRainMm: number): number {
  return 0.15 * lengthKm * Math.sqrt(maxDailyRainMm);
}

/** п. 2.34, табл. 16 — наименьшие расчётные скорости, м/с, при наполнении H/D 0,6 (D ≤ 250) … 0,75. */
export const TABLE_16_MIN_VELOCITY: readonly { dMm: [number, number]; vMin: number; fill: number }[] = [
  { dMm: [150, 250], vMin: 0.7, fill: 0.6 },
  { dMm: [300, 400], vMin: 0.8, fill: 0.7 },
  { dMm: [450, 500], vMin: 0.9, fill: 0.75 },
  { dMm: [600, 800], vMin: 1.0, fill: 0.75 },
  { dMm: [900, 900], vMin: 1.15, fill: 0.75 },
  { dMm: [1000, 1200], vMin: 1.15, fill: 0.8 },
  { dMm: [1500, 1500], vMin: 1.3, fill: 0.8 },
  { dMm: [1501, 100000], vMin: 1.5, fill: 0.8 },
] as const;

/* ==================================================================
 * РАЗДЕЛ 5. Насосные и воздуходувные станции
 * ================================================================== */

export const PUMP_STATIONS = {
  /** п. 5.1, табл. 20: воздуходувные станции — первая категория надёжности (перерыв подачи не допускается). */
  blowerStationCategory: { value: "I", ref: kmkRef("5.1", "табл. 20") },
  /** п. 5.13: плотность отбросов 750 кг/м³; коэффициент часовой неравномерности поступления — 2. */
  screeningsDensityKgM3: { value: 750, ref: kmkRef("5.13") },
  screeningsHourlyPeak: { value: 2, ref: kmkRef("5.13") },
  /** п. 5.13, табл. 23: отбросов с решёток, л/(чел·год), по ширине прозоров. */
  screeningsPerCapita: [
    { gapMm: [16, 20], lPerPersonYear: 8 },
    { gapMm: [25, 35], lPerPersonYear: 3 },
    { gapMm: [40, 50], lPerPersonYear: 2.3 },
    { gapMm: [60, 80], lPerPersonYear: 1.6 },
    { gapMm: [90, 125], lPerPersonYear: 1.2 },
  ],
  /** п. 5.14: скорость в прозорах при максимальном притоке. */
  screenGapVelocity: { mechanized: [0.8, 1.0], grinder: 1.2, unit: "м/с", ref: kmkRef("5.14") },
  /** п. 5.12, табл. 22: резерв решёток. */
  screenReserve: {
    ref: kmkRef("5.12", "табл. 22"),
    rule: "решётки с механизированными граблями, прозоры 16–20 мм: до 3 рабочих — 1 резервная, свыше 3 — 2; с ручной очисткой — 1 рабочая без резерва (при отбросах < 0,1 м³/сут)",
  },
  /** п. 5.18: приёмный резервуар — не менее 5-минутной максимальной подачи одного насоса. */
  wetWellMinMinutes: { value: 5, ref: kmkRef("5.18") },
  /** п. 5.29: воздуходувки — рабочих ≥ 2 при подаче станции > 5000 м³/ч; резерв: до 3 рабочих — 1, 4 и более — 2. */
  blowerReserve: { ref: kmkRef("5.29"), rule: "до 3 рабочих — 1 резервная, 4 и более — 2" },
  /** п. 5.34: расчётные потери давления в аэраторах, кПа: мелкопузырчатые ≤ 7; среднепузырчатые (h > 3 м) 1,5. */
  diffuserLossKPa: { fine: 7, medium: 1.5, ref: kmkRef("5.34") },
} as const;

/* ==================================================================
 * РАЗДЕЛ 6. Очистные сооружения — общие указания
 * ================================================================== */

/** п. 6.2, прим. 2–3 — требования к смеси сточных вод на входе в биологическую очистку. */
export const BIO_INLET_LIMITS = {
  phMin: 6.5,
  phMax: 8.5,
  tempMinC: 6,
  tempMaxC: 30,
  /** БПКполн не выше 250–500 мг/л в зависимости от состава сооружений */
  bodFullMaxMgL: [250, 500] as const,
  /** биогены: не менее 5 мг/л N и 1 мг/л P на каждые 100 мг/л БПКполн */
  nPer100Bod: 5,
  pPer100Bod: 1,
  forbidden: "нерастворённые масла, смолы, мазут; биологически жёсткие ПАВ",
  ref: kmkRef("6.2", "прим. 2, 3"),
} as const;

/** п. 6.2 — допустимые концентрации в смеси при приёме на биологическую очистку принимаются по ПКМ РУз № 11 от 03.02.2010, прил. 1. */
export const BIO_INLET_CONCENTRATIONS_REF =
  "ҚМҚ 2.04.03-19, п. 6.2 → Правила приёма производственных сточных вод (прил. 1 к ПКМ РУз № 11 от 03.02.2010)";

/** п. 6.4, табл. 25 — количество загрязняющих веществ на одного жителя, г/сут. */
export const TABLE_25_PER_CAPITA_G_DAY = {
  suspendedSolids: 65,
  bodFull: 75,
  ammoniumN: 8,
  phosphatesP2O5: 3.3,
  phosphatesFromDetergentsP2O5: 1.6,
  chlorides: 9,
  sulfates: 3.1,
  surfactants: 2.5,
  cod: 87,
  iron: 0.7,
  fats: 20,
  aluminium: 0.1,
  oilProducts: 1.0,
} as const;

export const TABLE_25_NOTES = [
  "Прим. 1. Количество загрязняющих веществ от населения неканализованных районов учитывается в размере 33 % указанных величин.",
  "Прим. 2. При сбросе бытовых сточных вод промышленных предприятий в канализацию населённого пункта загрязнения от эксплуатационного персонала дополнительно не учитываются.",
  "Верстка табл. 25 в официальном издании содержит сдвиг строк в нижнем блоке (ПАВ…нефтепродукты); принято соответствие ПАВ 2,5 / ХПК 87 / железо 0,7 / жиры 20 / алюминий 0,1 / нефтепродукты 1,0 г/сут.",
] as const;

/** Пересчёт P₂O₅ → P (молярные массы 141,94 / 2·30,97). */
export const P2O5_TO_P = 0.4364;
/** Для бытовых сточных вод БПКполн = БПК20 (п. 6.2, прим. 2); БПК5 ≈ 0,68·БПКполн — принято по практике проектирования (в ҚМҚ-19 не нормируется). */
export const BOD5_TO_BODFULL = 0.68;

/** Концентрации бытового стока по табл. 25 при заданном удельном водоотведении (п. 6.4). */
export function domesticConcentrations(lpcd: number) {
  const c = (g: number) => (g * 1000) / lpcd; // г/сут ÷ л/сут → г/л ×1000 → мг/л
  const t = TABLE_25_PER_CAPITA_G_DAY;
  return {
    ss: c(t.suspendedSolids),
    bodFull: c(t.bodFull),
    bod5: c(t.bodFull) * BOD5_TO_BODFULL,
    cod: c(t.cod),
    nh4N: c(t.ammoniumN),
    pTotal: c(t.phosphatesP2O5) * P2O5_TO_P,
    p2o5: c(t.phosphatesP2O5),
    chlorides: c(t.chlorides),
    sulfates: c(t.sulfates),
    surfactants: c(t.surfactants),
    fats: c(t.fats),
    oilProducts: c(t.oilProducts),
    iron: c(t.iron),
    source: `${KMK_2_04_03_19_DOC.code}, п. 6.4, табл. 25 при удельном водоотведении ${lpcd} л/(чел·сут)`,
  };
}

/** п. 6.10 — расчётные эффекты ступеней. */
export const STAGE_EFFECTS = {
  mechanical: { ssRemoval: [0.4, 0.45], bodRemoval: 0.2, withPreaerationBonus: [0.2, 0.25], ref: kmkRef("6.10") },
  biological: { ssOutMgL: 20, bodFullOutMgL: [15, 25], ref: kmkRef("6.10") },
  tertiary: { ssOutMgL: [3, 6], bodFullOutMgL: [4, 6], ref: kmkRef("6.10") },
} as const;

/** п. 6.14: технологические трубопроводы и лотки — на максимальный секундный расход с коэффициентом 1,4. */
export const PIPE_LOTOK_FACTOR = { value: 1.4, ref: kmkRef("6.14") } as const;

/** п. 1.9: при выключении одного сооружения перегрузка остальных — не более 8–17 %. */
export const OUTAGE_OVERLOAD = { value: [0.08, 0.17], ref: kmkRef("1.9") } as const;

/* ==================================================================
 * Механическая очистка
 * ================================================================== */

export const SCREENS = {
  /** п. 6.16: прозоры не более 16 мм, стержни прямоугольные, или решётки-дробилки. */
  maxGapMm: { value: 16, ref: kmkRef("6.16") },
  /** п. 6.18: механизированная очистка при отбросах ≥ 0,1 м³/сут. */
  mechanizedFromM3Day: { value: 0.1, ref: kmkRef("6.18") },
  /** п. 6.23: пол здания решёток выше расчётного уровня воды не менее чем на 0,5 м. */
  floorAboveWaterM: { value: 0.5, ref: kmkRef("6.23") },
  /** п. 6.24: потери напора — в 3 раза больше, чем для чистой решётки. */
  headLossFactor: { value: 3, ref: kmkRef("6.24") },
} as const;

export const GRIT = {
  /** п. 6.26: песколовки при производительности свыше 100 м³/сут; не менее двух, все рабочие. */
  requiredFromM3Day: { value: 100, ref: kmkRef("6.26") },
  minUnits: { value: 2, ref: kmkRef("6.26") },
  /** п. 6.27, табл. 27: диаметр задерживаемых частиц и гидравлическая крупность. */
  table27: [
    { dMm: 0.15, u0MmS: 13.2, ksHorizontal: null, ksAerated: { "1": 2.62, "1.25": 2.5, "1.5": 2.39 } },
    { dMm: 0.2, u0MmS: 18.7, ksHorizontal: 1.7, ksAerated: { "1": 2.43, "1.25": 2.25, "1.5": 2.08 } },
    { dMm: 0.25, u0MmS: 24.2, ksHorizontal: 1.3, ksAerated: null },
  ],
  /** табл. 28 */
  table28: {
    horizontal: { u0MmS: [18.7, 24.2], vMinLps: 0.15, vMaxLps: 0.3, depthM: [0.5, 2], sandLPersonDay: 0.02, moisture: 60, sandInSediment: [55, 60] },
    aerated: { u0MmS: [13.2, 18.7], vMaxLps: [0.08, 0.12], depthM: [0.7, 3.5], sandLPersonDay: 0.03, sandInSediment: [90, 95] },
    tangential: { u0MmS: [18.7, 24.2], depthM: 0.5, sandLPersonDay: 0.02, moisture: 60, sandInSediment: [70, 75] },
    ref: kmkRef("6.27", "табл. 28"),
  },
  /** п. 6.28 */
  horizontalMinRetentionS: { value: 30, ref: kmkRef("6.28") },
  aeratedIntensity: { value: [3, 5], unit: "м³/(м²·ч)", ref: kmkRef("6.28") },
  tangentialLoad: { value: 110, unit: "м³/(м²·ч) при максимальном притоке", maxDiameterM: 6, ref: kmkRef("6.28") },
  /** п. 6.29: удаление песка вручную до 0,1 м³/сут. */
  manualRemovalUpToM3Day: { value: 0.1, ref: kmkRef("6.29") },
  /** п. 6.31: 0,02 л/(чел·сут), влажность 60 %, объёмный вес 1,5 т/м³. */
  sandPerCapita: { lPersonDay: 0.02, moisture: 60, densityTM3: 1.5, ref: kmkRef("6.31") },
  /** п. 6.33: песковые площадки — не более 3 м³/(м²·год). */
  sandBedLoad: { value: 3, unit: "м³/(м²·год)", ref: kmkRef("6.33") },
} as const;

export const EQUALIZATION = {
  /** п. 6.38: секций не менее двух, обе рабочие. */
  minSections: { value: 2, ref: kmkRef("6.38") },
  /** п. 6.40 / 6.47: барботажный — при ВВ до 500 мг/л; механическое перемешивание — свыше 500 мг/л. */
  bubblingUpToSsMgL: { value: 500, ref: kmkRef("6.40") },
  /** п. 6.46: интенсивность барботажа на 1 м барботёра, м³/(ч·м): пристенные 6, промежуточные 12 (при опасности осаждения 12 и 24). */
  bubblerIntensity: { wall: 6, middle: 12, wallHeavy: 12, middleHeavy: 24, unit: "м³/(ч·м)", ref: kmkRef("6.46") },
  /** п. 6.41, ф. (20)–(21): залповый сброс. */
  slugFormula: {
    ref: kmkRef("6.41", "ф. (20), (21)"),
    text: "W_z = 1,3·q_w·t_z / ln(K_av/(K_av − 1)) при K_av < 5; W_z = 1,3·q_w·t_z·K_av при K_av ≥ 5; K_av = (C_max − C_mid)/(C_adm − C_mid)",
  },
} as const;

export const PRIMARY_SETTLING = {
  /** п. 6.58: первичных не менее двух, вторичных не менее трёх, все рабочие; при минимальном числе объём ×1,2–1,3. */
  minPrimary: { value: 2, ref: kmkRef("6.58") },
  minSecondary: { value: 3, ref: kmkRef("6.58") },
  minCountVolumeFactor: { value: [1.2, 1.3], ref: kmkRef("6.58") },
  /** п. 6.59: ВВ перед биологической очисткой не более 150 мг/л; при ВВ > 300 мг/л — интенсификация первичного отстаивания. */
  ssBeforeBioMaxMgL: { value: 150, ref: kmkRef("6.59") },
  ssIntensifyFromMgL: { value: 300, ref: kmkRef("6.59") },
  /** п. 6.61, табл. 31 */
  table31: {
    horizontal: { kSet: 0.5, hSetM: [1.5, 4], vwMmS: [5, 10] },
    radial: { kSet: 0.45, hSetM: [1.5, 5], vwMmS: [5, 10] },
    vertical: { kSet: 0.35, hSetM: [2.7, 3.8] },
    ref: kmkRef("6.61", "табл. 31"),
  },
  /** п. 6.60, табл. 30: продолжительность отстаивания t_set, с, в слое 500 мм (городские СВ) по эффекту и C_en. */
  table30: {
    cMgL: [200, 300, 400],
    rows: [
      { effect: 20, tS: [600, 540, 480] },
      { effect: 30, tS: [960, 900, 840] },
      { effect: 40, tS: [1440, 1200, 1080] },
      { effect: 50, tS: [2160, 1800, 1500] },
      { effect: 60, tS: [7200, 3600, 2700] },
      { effect: 70, tS: [null, null, 7200] },
    ],
    ref: kmkRef("6.60", "табл. 30"),
  },
  /** п. 6.65, ф. (38): Q_mud = q_w·(C_en − C_ex)/((100 − ρ)·γ·10⁴), м³/ч. */
  sludgeFormula: { ref: kmkRef("6.65", "ф. (38)") },
  /** п. 6.66–6.70 */
  sludgeMoisture: { gravity: 95, plungerPump: [93.5, 94], ref: kmkRef("6.67") },
  hopperMaxDays: { primary: 2, secondaryAfterAerotank: "2 ч", ref: kmkRef("6.66") },
  hopperWallAngleDeg: { value: 50, ref: kmkRef("6.66") },
  freeboardM: { value: 0.3, ref: kmkRef("6.69") },
  weirLoadLpsM: { value: 10, ref: kmkRef("6.70") },
  sludgePipeMinMm: { value: 200, ref: kmkRef("6.68") },
} as const;

export const FLOTATION = {
  /** п. 6.99: при ВВ свыше 100–150 мг/л. */
  fromSsMgL: { value: [100, 150], ref: kmkRef("6.99") },
  /** п. 6.100: рабочая зона 1–3 м; пена 0,2–1 м; осадок 0,5–1 м; нагрузка 3–6 м³/(м²·ч); камер ≥ 2. */
  hydraulicLoad: { value: [3, 6], unit: "м³/(м²·ч)", ref: kmkRef("6.100") },
  workingDepthM: { value: [1, 3], ref: kmkRef("6.100") },
  minChambers: { value: 2, ref: kmkRef("6.100") },
  /** п. 6.102: влажность пены 94–98 %; в осадок 7–10 % задержанных веществ. */
  foamMoisture: { value: [94, 98], ref: kmkRef("6.102") },
  /** п. 6.104: напорная флотация — 20–30 мин; воздух 40/28/20/15 л на кг извлекаемых веществ при C_en < 200 / 500 / 1000 / 3000–4000 мг/л. */
  pressureRetentionMin: { value: [20, 30], ref: kmkRef("6.104") },
  airPerKgRemoved: [
    { cEnMgL: 200, lPerKg: 40 },
    { cEnMgL: 500, lPerKg: 28 },
    { cEnMgL: 1000, lPerKg: 20 },
    { cEnMgL: 3500, lPerKg: 15 },
  ],
} as const;

export const REAGENTS = {
  /** п. 6.270: городские СВ — соли Al при pH ≤ 7,5, соли Fe при pH > 7,5. */
  coagulantByPh: { alUpToPh: 7.5, ref: kmkRef("6.270") },
  /** табл. 61, городские и бытовые СВ (п. 6.269). Дозы по товарному продукту, кроме помеченных. */
  table61Municipal: {
    alSaltsMgL_asAl2O3: [30, 50],
    feSO4MgL: [40, 50],
    feCl3MgL: [50, 150],
    anionicFlocMgL: [0.5, 1.0],
    cationicFlocMgL: [10, 20],
    ref: kmkRef("6.269", "табл. 61"),
  },
  /** п. 6.274: камеры хлопьеобразования, мин: отстаивание — коагулянты 10–15, флокулянты 20–30; флотация — 3–5 / 10–20. */
  flocculationMin: { settlingCoag: [10, 15], settlingFloc: [20, 30], flotationCoag: [3, 5], flotationFloc: [10, 20], ref: kmkRef("6.274") },
  /** п. 6.275: градиент G, с⁻¹: смесители 200 (коагулянты), 300–500 (флокулянты); камеры хлопьеобразования 25–50 (отстаивание), 50–75 (флотация). */
  gradientG: { mixerCoag: 200, mixerFloc: [300, 500], flocSettling: [25, 50], flocFlotation: [50, 75], ref: kmkRef("6.275") },
  /** п. 6.272: при железном купоросе — аэрируемый смеситель ≥ 7 мин, воздух 0,7–0,8 м³/м³·мин. */
  feSO4AeratedMixer: { minMinutes: 7, airM3PerM3Min: [0.7, 0.8], ref: kmkRef("6.272") },
} as const;

/* ==================================================================
 * Биологическая очистка — аэротенки
 * ================================================================== */

export const AEROTANK = {
  /** п. 6.140 прим. 4 / 6.141: регенерация при БПКполн свыше 150 мг/л. */
  regenerationFromBodMgL: { value: 150, ref: kmkRef("6.141") },
  /** п. 6.142: объём — по среднечасовому притоку за период аэрации в часы максимального притока. */
  volumeBasis: { ref: kmkRef("6.142"), text: "q_w — среднечасовой приток за период аэрации в часы максимального притока" },
  /** п. 6.143, табл. 40 — доза ила в аэротенках без регенераторов по БПКполн. */
  table40Dose: [
    { bodUpTo: 100, doseGL: 1.2 },
    { bodUpTo: 150, doseGL: 1.5 },
    { bodUpTo: 200, doseGL: 1.8 },
    { bodUpTo: Infinity, doseGL: [1.8, 3] },
  ],
  /** табл. 41 — кинетические константы, городские СВ. */
  table41Municipal: { rhoMax: 85, kL: 33, kO: 0.625, phi: 0.07, ashS: 0.3, ref: kmkRef("6.143", "табл. 41") },
  /** ф. (51): t_atm = (L_en − L_ex)/(a_i·(1 − s)·ρ), ч; ф. (52) — ρ; при T ≠ 15 °C время ×15/T_w; не менее 2 ч. */
  formula51: { ref: kmkRef("6.143", "ф. (51), (52)"), minHours: 2, tempRefC: 15 },
  /** ф. (54): вытеснитель, K_p = 1,5 при L_ex = 15 мг/л; 1,25 при L_ex > 30 мг/л. */
  formula54: { ref: kmkRef("6.144", "ф. (54)"), kp15: 1.5, kp30: 1.25 },
  /** п. 6.145, ф. (56): R_i = a_i/(1000/J_i − a_i); R_i ≥ 0,3 (илососы), 0,4 (илоскрёбы), 0,6 (самотёк). */
  recirculation: { minSuction: 0.3, minScraper: 0.4, minGravity: 0.6, ref: kmkRef("6.145", "ф. (56)") },
  /** табл. 42 — иловый индекс J_i, см³/г, городские СВ, по нагрузке q_i, мг/(г·сут). */
  table42MunicipalSvi: [
    { qi: 100, ji: 130 },
    { qi: 200, ji: 100 },
    { qi: 300, ji: 70 },
    { qi: 400, ji: 80 },
    { qi: 500, ji: 95 },
    { qi: 600, ji: 130 },
  ],
  /** ф. (57): q_i = 24·(L_en − L_ex)/(a_i·(1 − s)·t_at), мг БПКполн/(г·сут). */
  formula57: { ref: kmkRef("6.146", "ф. (57)") },
  /** п. 6.148, ф. (67): прирост ила P_i = 0,8·C_cdp + K_g·L_en, мг/л; K_g = 0,3 (городские), 0,25 (окситенки); для уплотнителей и перекачки ×1,3. */
  sludgeGrowth: { ssFactor: 0.8, bodFactorMunicipal: 0.3, bodFactorOxytank: 0.25, designFactor: 1.3, ref: kmkRef("6.148", "ф. (67)") },
  /** п. 6.150: секций ≥ 2; рабочая глубина 3–6 м; ширина коридора к глубине 1:1…2:1. */
  minSections: { value: 2, ref: kmkRef("6.150") },
  depthM: { value: [3, 6], ref: kmkRef("6.150") },
  /** п. 6.156, ф. (70): q_air = q_O·(L_en − L_ex)/(K1·K2·K_T·K3·(C_a − C_O)), м³/м³. */
  air: {
    ref: kmkRef("6.156", "ф. (70)–(73)"),
    /** удельный расход кислорода, мг O₂/мг снятой БПКполн */
    qO: { toBod15_20: 1.1, toBodOver20: 0.9, extendedAeration: 1.25 },
    /** K1 — по f_az/f_at, табл. 44а (мелкопузырчатая); среднепузырчатая и низконапорная — 0,75 */
    table44a: [
      { fRatio: 0.05, k1: 1.34, jaMax: 5 },
      { fRatio: 0.1, k1: 1.47, jaMax: 10 },
      { fRatio: 0.2, k1: 1.68, jaMax: 20 },
      { fRatio: 0.3, k1: 1.89, jaMax: 30 },
      { fRatio: 0.4, k1: 1.94, jaMax: 40 },
      { fRatio: 0.5, k1: 2.0, jaMax: 50 },
      { fRatio: 0.75, k1: 2.13, jaMax: 75 },
      { fRatio: 1, k1: 2.3, jaMax: 100 },
    ],
    k1MediumBubble: 0.75,
    /** K2 — по глубине погружения аэратора h_a, табл. 45 */
    table45: [
      { haM: 0.5, k2: 0.4, jaMin: 48 },
      { haM: 0.6, k2: 0.46, jaMin: 42 },
      { haM: 0.7, k2: 0.6, jaMin: 38 },
      { haM: 0.8, k2: 0.8, jaMin: 32 },
      { haM: 0.9, k2: 0.9, jaMin: 28 },
      { haM: 1, k2: 1, jaMin: 24 },
      { haM: 3, k2: 2.08, jaMin: 4 },
      { haM: 4, k2: 2.52, jaMin: 3.5 },
      { haM: 5, k2: 2.92, jaMin: 3 },
      { haM: 6, k2: 3.3, jaMin: 2.5 },
    ],
    /** K_T = 1 + 0,02·(T_w − 20), ф. (71) */
    kT: (twC: number) => 1 + 0.02 * (twC - 20),
    /** K3 — городские СВ 0,85; производственные при отсутствии данных 0,7 */
    k3Municipal: 0.85,
    k3IndustrialDefault: 0.7,
    /** C_a = (1 + h_a/20,6)·C_T, ф. (72); C_T — табл. 44 (760 мм рт. ст.) */
    table44CT: [14.65, 14.25, 13.86, 13.49, 13.13, 12.79, 12.46, 12.14, 11.84, 11.55, 11.27, 11.0, 10.75, 10.5, 10.26, 10.03, 9.82, 9.61, 9.4, 9.21, 9.02, 8.84, 8.67, 8.5, 8.33, 8.18, 8.02, 7.87, 7.72, 7.58, 7.44],
    /** C_O — средняя концентрация кислорода в аэротенке, в первом приближении 2 мг/л */
    cODefault: 2,
  },
  /** п. 6.175–6.179 — аэрационные установки на полное окисление (продлённая аэрация). */
  extendedAeration: {
    rho: 6, // мг БПКполн/(г·ч)
    doseGL: [3, 4],
    ash: 0.35,
    qO: 1.25,
    settlingMinHoursAtMaxFlow: 1.5,
    excessSludgeKgPerKgBodFull: 0.35,
    excessSludgeDoseFromAerotankGL: [5, 6],
    sludgeMoistureFromSettler: 98,
    sludgeMoistureFromAerotank: 99.4,
    ref: kmkRef("6.175"),
  },
  /** п. 6.180–6.187 — циркуляционные окислительные каналы: прирост 0,4 кг/кг БПКполн, q_O 1,25, глубина ~1 м. */
  oxidationDitch: { rho: 6, excessSludgeKgPerKgBodFull: 0.4, qO: 1.25, settlingHours: 1.5, ref: kmkRef("6.183") },
} as const;

/** Растворимость кислорода C_T, мг/л, по табл. 44 (линейная интерполяция между целыми °C). */
export function oxygenSolubility(tC: number): number {
  const t = Math.min(30, Math.max(0, tC));
  const i = Math.floor(t);
  const a = AEROTANK.air.table44CT[i];
  const b = AEROTANK.air.table44CT[Math.min(30, i + 1)];
  return a + (b - a) * (t - i);
}

function interp(x: number, pts: readonly { x: number; y: number }[]): number {
  if (x <= pts[0].x) return pts[0].y;
  const last = pts[pts.length - 1];
  if (x >= last.x) return last.y;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (x >= a.x && x <= b.x) return a.y + ((x - a.x) * (b.y - a.y)) / (b.x - a.x);
  }
  return last.y;
}

export type AirDemandInput = {
  /** снятая БПКполн, мг/л */
  bodFullRemovedMgL: number;
  /** удельный расход кислорода q_O, мг/мг (1,1 / 0,9 / 1,25) */
  qO: number;
  /** глубина погружения аэраторов h_a, м */
  depthM: number;
  /** доля аэрируемой площади f_az/f_at (мелкопузырчатая) */
  fRatio?: number;
  /** среднемесячная летняя температура воды, °C */
  tempC?: number;
  /** K3: 0,85 городские; 0,7 производственные без данных */
  k3?: number;
  /** остаточный кислород C_O, мг/л (2) */
  cO?: number;
};

/**
 * Удельный расход воздуха по ф. (70) п. 6.156, м³ воздуха на 1 м³ сточной воды,
 * и удельный расход на 1 кг снятой БПКполн.
 */
export function airDemand(input: AirDemandInput) {
  const fRatio = input.fRatio ?? 0.2;
  const tempC = input.tempC ?? 20;
  const k3 = input.k3 ?? AEROTANK.air.k3Municipal;
  const cO = input.cO ?? AEROTANK.air.cODefault;
  const k1 = interp(fRatio, AEROTANK.air.table44a.map((r) => ({ x: r.fRatio, y: r.k1 })));
  const k2 = interp(input.depthM, AEROTANK.air.table45.map((r) => ({ x: r.haM, y: r.k2 })));
  const kT = AEROTANK.air.kT(tempC);
  const cT = oxygenSolubility(tempC);
  const cA = (1 + input.depthM / 20.6) * cT;
  const denom = k1 * k2 * kT * k3 * (cA - cO);
  const m3PerM3 = (input.qO * input.bodFullRemovedMgL) / denom;
  const m3PerKgBodFull = (input.qO * 1000) / denom;
  /** кг O₂, фактически передаваемых 1 Нм³ воздуха = K1·K2·K_T·K3·(C_a − C_O)·10⁻³ (из 0,28 кг O₂ в 1 Нм³) */
  const kgO2PerNm3 = denom / 1000;
  return { m3PerM3, m3PerKgBodFull, k1, k2, kT, k3, cA, kgO2PerNm3, ref: AEROTANK.air.ref };
}

/**
 * Фактическая передача кислорода воздухом по знаменателю ф. (70) п. 6.156, кг O₂ на 1 Нм³.
 * Типовые условия SUVSANOAT (мелкопузырчатая аэрация, h_a = 4 м, f_az/f_at = 0,2,
 * городские СВ, 20 °C, C_O = 2 мг/л) дают ≈0,03 кг O₂/Нм³.
 */
export function oxygenTransferKgPerNm3(opts: Omit<AirDemandInput, "bodFullRemovedMgL" | "qO"> = { depthM: 4 }): number {
  return airDemand({ ...opts, bodFullRemovedMgL: 1, qO: 1 }).kgO2PerNm3;
}

export const SECONDARY_SETTLING = {
  /** п. 6.170, ф. (85): q_ssa = 4,5·K_ss·H^0,8 / (0,1·J_i·a_i)^(0,5 − 0,01·a_t), м³/(м²·ч). */
  formula85: { ref: kmkRef("6.170", "ф. (85)"), kSs: { radial: 0.4, vertical: 0.35, verticalPeripheral: 0.5, horizontal: 0.45 }, aTMinMgL: 10, aIMaxGL: 15 },
  /** п. 6.172: нагрузка на 1 м водослива не более 8–10 л/с. */
  weirLoadLpsM: { value: [8, 10], ref: kmkRef("6.172") },
  /** п. 6.66: приямок — не более 2 ч пребывания ила. */
  hopperMaxHours: { value: 2, ref: kmkRef("6.66") },
} as const;

/** Гидравлическая нагрузка на вторичный отстойник после аэротенка по ф. (85). */
export function secondaryClarifierLoad(
  hSetM: number,
  sviMlG: number,
  doseGL: number,
  kind: keyof typeof SECONDARY_SETTLING.formula85.kSs = "radial",
  aTMgL = 10,
): number {
  const kSs = SECONDARY_SETTLING.formula85.kSs[kind];
  return (4.5 * kSs * Math.pow(hSetM, 0.8)) / Math.pow(0.1 * sviMlG * doseGL, 0.5 - 0.01 * aTMgL);
}

/* ==================================================================
 * Доочистка и обеззараживание
 * ================================================================== */

export const TERTIARY_FILTERS = {
  /** п. 6.246, табл. 58: однослойный песчаный 6–7 м/ч (норм.), 7–8 (форсир.); КЗФ 10/15; средне-/крупнозернистый 16/18; площадь — по макс. часовому притоку минус 15 %. */
  table58: {
    sandSingleLayer: { vNormal: [6, 7], vForced: [7, 8], layerM: [1.2, 1.3], effectBod: [50, 60], effectSs: [70, 75] },
    frameFill: { vNormal: 10, vForced: 15, effectBod: 70, effectSs: [70, 80] },
    coarse: { vNormal: 16, vForced: 18 },
    areaReductionShare: 0.15,
    ref: kmkRef("6.246", "табл. 58"),
  },
  /** п. 6.247: резервуары промывной воды на ≥ 2 промывки; барабанные сетки перед фильтрами. */
  washTanksMinWashes: { value: 2, ref: kmkRef("6.247") },
  /** п. 6.254, табл. 59: микрофильтры — ВВ 50–60 %, БПК 25–30 %; барабанные сетки — ВВ 20–25 %, БПК 5–10 %; п. 6.257: промывная вода 3–4 % (микрофильтры), 1–1,5 % (сетки). */
  drumScreens: { microSsEffect: [50, 60], microBodEffect: [25, 30], drumSsEffect: [20, 25], washShareMicro: [0.03, 0.04], washShareDrum: [0.01, 0.015], ref: kmkRef("6.254", "табл. 59") },
} as const;

export const DISINFECTION = {
  /** п. 6.230: доза активного хлора, г/м³. */
  chlorineDose: { afterMechanical: 10, afterPartialBio: 5, afterBio: 3, residualMin: 1.5, storageFactor: 1.5, ref: kmkRef("6.230") },
  /** п. 6.235: контакт 30 мин. */
  contactMinutes: { value: 30, ref: kmkRef("6.235") },
  /** п. 6.236: контактные резервуары — как первичные отстойники без скребков; не менее двух; барботаж 0,5 м³/(м²·ч). */
  contactTanksMin: { value: 2, ref: kmkRef("6.236") },
  contactAeration: { value: 0.5, unit: "м³/(м²·ч)", ref: kmkRef("6.236") },
  /** п. 6.238: осадок контактных резервуаров при 98 %: 1,5 л/м³ после механики; 0,5 л/м³ после аэротенков/биофильтров. */
  contactSludgeLPerM3: { afterMechanical: 1.5, afterBio: 0.5, ref: kmkRef("6.238") },
  /** п. 6.229: допускается УФ-обеззараживание; доза в ҚМҚ-19 не нормируется. */
  uvAllowed: { ref: kmkRef("6.229") },
} as const;

/* ==================================================================
 * Обработка осадка
 * ================================================================== */

export const SLUDGE = {
  /** п. 6.351, табл. 64: избыточный активный ил 99,5 % → уплотнённый 98,2 % (вертикальный) / 97,3 % (радиальный), 6–8 / 10–12 ч. */
  thickener: {
    excessSludgeMoistureIn: 99.5,
    moistureOutVertical: 98.2,
    moistureOutRadial: 97.3,
    hoursVertical: [6, 8],
    hoursRadial: [10, 12],
    mixedRawAndExcessIn: 99.2,
    mixedOutVertical: [95, 97],
    mixedOutRadial: 95,
    designFactor: 1.3, // п. 6.352
    minUnits: 2, // п. 6.350
    ref: kmkRef("6.351", "табл. 64"),
  },
  /** п. 6.354: флотационное уплотнение — 0,8 МПа, 10–12 % насыщенной воды, 0,7–1 ч, ил 94,5–95 %. */
  flotationThickener: { pressureMPa: 0.8, recycleShare: [0.1, 0.12], hours: [0.7, 1], moistureOut: [94.5, 95], ref: kmkRef("6.354") },
  /** п. 6.372–6.375: аэробная стабилизация. */
  aerobicStabilization: {
    inletMoistureMax: 98.2,
    minUnits: 2,
    daysAt18C: { disinfectedSludge: 3, primaryPlusThickenedExcess: 5.5, digestedPlusExcess: 3, digestedPlusExcessPlusCentrate: 4 },
    aerationIntensityMin: 6, // м³/(м²·ч)
    airPerM3Volume: [1, 2], // м³/ч на 1 м³ при 98,2–97,5 %
    dissolvedOxygenMgL: [1, 2],
    ref: kmkRef("6.373"),
  },
  /** п. 6.386, табл. 69 / п. 6.388–6.391: механическое обезвоживание — влажность кека. */
  dewatering: {
    /** уплотнённый активный ил: фильтр-пресс 80–83 %; вакуум-фильтр 85–87 %; центрифуга 83–88 % */
    activatedSludgeCake: { filterPress: [80, 83], vacuum: [85, 87], centrifuge: [83, 88] },
    /** смесь сырого осадка и уплотнённого ила: фильтр-пресс 62–75 %; вакуум 75–80 % */
    mixedCake: { filterPress: [62, 75], vacuum: [75, 80] },
    /** аэробно стабилизированный ил: фильтр-пресс 62–68 %; вакуум 78–80 % */
    aerobicStabilizedCake: { filterPress: [62, 68], vacuum: [78, 80] },
    /** сырой осадок первичных: центрифуга 75 % */
    rawPrimaryCentrifuge: 75,
    /** производительность фильтр-пресса по уплотнённому активному илу 2–7 кг с.в./(м²·ч) */
    filterPressActivatedKgM2H: [2, 7],
    /** п. 6.391: катионный флокулянт 2–7 кг/т с.в. (больше — для активного ила) */
    flocculantKgPerT: [2, 7],
    /** п. 6.390: фугат — +1 мг БПКполн на 1 мг остаточного сухого вещества */
    centrateBodPerMgDs: 1,
    /** п. 6.392: резерв — фильтр-прессы: до 3 рабочих 1, 4–10 — 2; центрифуги: до 2 рабочих 1, 3 и более — 2 */
    reserve: "фильтр-прессы: до 3 рабочих — 1, 4–10 — 2; центрифуги: до 2 рабочих — 1, 3 и более — 2",
    /** п. 6.393: аварийные иловые площадки на 20 % годового осадка */
    emergencyBedsShare: 0.2,
    ref: kmkRef("6.386", "табл. 69; п. 6.391"),
  },
  /** п. 6.395, табл. 71: иловые площадки, кг/(м²·год) при 9 °C и осадках до 500 мм — аэробно стабилизированный ил: 72 / 90 / 120 (естественное / с дренажом / асфальтобетон с дренажом). */
  dryingBeds: {
    aerobicStabilized: { natural: 72, naturalDrained: 90, asphaltDrained: 120 },
    mesophilicMixed: { natural: 36, naturalDrained: 45, asphaltDrained: 60 },
    /** черт. 3 — климатический коэффициент по регионам РУз (снят с карты, приближённо) */
    climateFactor: { karakalpakstan: 1.2, tashkent: 1.4, fergana: 1.4, samarkand: 1.5, bukhara: 1.5, karshi: 1.6, termez: 1.7 },
    workingDepthM: [0.7, 1],
    minCards: 8,
    ref: kmkRef("6.395", "табл. 71; черт. 3; п. 6.399"),
  },
  /** п. 6.417: склад обезвоженного осадка на 3–4 месяца. */
  storageMonths: { value: [3, 4], ref: kmkRef("6.417") },
} as const;

/* ==================================================================
 * Нормативные документы, на которые ссылается ҚМҚ 2.04.03-19
 * ================================================================== */

export const RELATED_DOCUMENTS = [
  { code: "ШНК 2.04.02-97*", title: "Водоснабжение. Наружные сети и сооружения", purpose: "удельное водопотребление (п. 2.1), коэффициенты суточной неравномерности (п. 2.4), реагентное хозяйство и фильтры (пп. 6.245, 6.271)" },
  { code: "КМК 2.04.01-98", title: "Внутренний водопровод и канализация зданий", purpose: "сосредоточенные расходы отдельных зданий (п. 2.2); расчётные расходы при Qср < 5 л/с (табл. 2, прим. 2)" },
  { code: "ПКМ РУз № 11 от 03.02.2010, прил. 1", title: "Правила приёма производственных сточных вод в системы коммунальной канализации", purpose: "допустимые концентрации при приёме на биологическую очистку (п. 6.2)" },
  { code: "КМК 2.01.01-94", title: "Климатические и физико-геологические данные", purpose: "максимальное суточное количество осадков m_d (п. 2.10)" },
  { code: "СН 245-71", title: "Санитарные нормы проектирования промышленных предприятий", purpose: "СЗЗ очистных сооружений производственной канализации (п. 1.10)" },
] as const;
