/**
 * Нормативная база Республики Узбекистан
 * для предварительных инженерных расчётов систем канализации
 * и очистки сточных вод.
 *
 * Основная нормативная база:
 * ҚМҚ 2.04.03-19 (взамен КМК 2.04.03-97; табличные данные — kmk-2-04-03-19.ts)
 *
 * ВАЖНО:
 * Эти данные используются системой как справочная нормативная база.
 * Они НЕ заменяют рабочий проект, ПДС, санитарное согласование
 * или проверку инженером.
 */

import { KMK_2_04_03_19_DOC, unevenness, BIO_INLET_LIMITS } from "./kmk-2-04-03-19";

export type NormativeDocument = {
  code: string;
  title: string;
  category:
    | "design"
    | "sanitary"
    | "environment"
    | "industrial"
    | "discharge";
  description: string;
  sourceUrl?: string;
};

export const uzbekistanNorms: NormativeDocument[] = [
  {
    code: "ҚМҚ 2.04.03-19",
    title: "Канализация. Наружные сети и сооружения",
    category: "design",
    description:
      "Основной нормативный документ для проектирования вновь строящихся и реконструируемых систем наружной канализации населённых пунктов и объектов народного хозяйства Республики Узбекистан. Вторая редакция, взамен КМК 2.04.03-97; утверждена приказом Минстроя РУз № 439 от 27.09.2019, действует с 01.01.2020.",
    sourceUrl: KMK_2_04_03_19_DOC.sourceUrl,
  },

  {
    code: "СанПиН РУз № 0129-02",
    title:
      "Санитарные требования к системам канализации в особых природных и климатических условиях Республики Узбекистан",
    category: "sanitary",
    description:
      "Учитывает природные, климатические и сейсмические условия при проектировании систем канализации.",
    sourceUrl:
      "https://med.uz/documentation/detail.php?ID=46659",
  },

  {
    code: "СанПиН РУз № 0172-06",
    title:
      "Гигиенические требования к охране поверхностных вод на территории Республики Узбекистан",
    category: "environment",
    description:
      "Используется при рассмотрении проектов канализации, очистки, обезвреживания и обеззараживания сточных вод, а также при оценке воздействия сбросов на поверхностные воды.",
    sourceUrl:
      "https://med.uz/ses/surkhandarya/documents/detail.php?ID=46741",
  },

  {
    code: "O'zRH 84.3.5:2004",
    title:
      "Методические указания для расчёта норм предельно допустимых сбросов загрязняющих веществ",
    category: "discharge",
    description:
      "Методические указания по расчёту нормативов допустимых сбросов загрязняющих веществ в водные объекты и на рельеф местности с учётом технически достижимых показателей очистки сточных вод.",
    sourceUrl:
      "https://eco.gov.uz/ru/activity/institute?numer=467",
  },

  {
    code: "O'zRH 84.3.6:2004",
    title:
      "Инструкция по нормированию сбросов загрязняющих веществ",
    category: "discharge",
    description:
      "Инструкция по нормированию сбросов загрязняющих веществ в водные объекты и на рельеф местности.",
    sourceUrl:
      "https://eco.gov.uz/ru/activity/institute?numer=467",
  },

  {
    code: "O'zRH 84.3.7:2004",
    title:
      "Порядок разработки и оформления проекта норм предельно допустимых сбросов",
    category: "discharge",
    description:
      "Определяет порядок разработки и оформления проектов нормативов предельно допустимых сбросов загрязняющих веществ.",
    sourceUrl:
      "https://eco.gov.uz/ru/activity/institute?numer=467",
  },

  {
    code: "Постановление КМ РУз № 11 от 03.02.2010",
    title:
      "Правила приёма производственных сточных вод в коммунальные канализационные сети",
    category: "industrial",
    description:
      "Регулирует условия приёма производственных сточных вод в коммунальные канализационные сети и требования к предварительной очистке.",
    sourceUrl:
      "https://nrm.uz/contentf?doc=198191_",
  },
];

/* =========================================================
 * ҚМҚ 2.04.03-19, п. 2.7, ТАБЛИЦА 2
 * Общие коэффициенты неравномерности притока сточных вод.
 *
 * Единственная копия таблицы — norms/kmk-2-04-03-19.ts;
 * здесь только совместимая обёртка для calculations/flow.ts.
 * ========================================================= */

export type Kmk2040319UnevennessCoefficients = {
  kMax: number;
  kMin: number;
  interpolated: boolean;
  source: string;
};

/**
 * Общие коэффициенты неравномерности по табл. 2 ҚМҚ 2.04.03-19 (п. 2.7):
 * 5…5000 л/с — линейная интерполяция (прим. 3); свыше 5000 л/с — последняя
 * строка; менее 5 л/с — первая строка с пометкой (прим. 2: расчётные
 * расходы малых объектов — по КМК 2.04.01-98).
 */
export function getKmk2040319UnevennessCoefficients(
  averageLps: number,
): Kmk2040319UnevennessCoefficients {
  const r = unevenness(averageLps);
  return { kMax: r.kMax, kMin: r.kMin, interpolated: r.interpolated, source: r.source };
}

/* =========================================================
 * ПРОМЫШЛЕННЫЕ СТОЧНЫЕ ВОДЫ
 * ========================================================= */

/**
 * Контрольные значения приёма производственных сточных вод в коммунальную
 * сеть (Правила приёма — прил. 1 к ПКМ РУз № 11 от 03.02.2010). Это НЕ
 * условия входа в биологическую очистку: те заданы ҚМҚ 2.04.03-19 п. 6.2
 * (pH 6,5–8,5; 6–30 °C; БПКполн ≤ 250–500) — см. bioInletChecks.
 */
export const industrialWastewaterChecks = {
  temperatureMaxC: 40,

  phMin: 6.5,
  phMax: 9.0,

  suspendedSolidsMaxMgL: 500,

  source: "Правила приёма производственных сточных вод в системы коммунальной канализации (прил. 1 к ПКМ РУз № 11 от 03.02.2010)",

  notes: [
    "Производственные сточные воды не должны нарушать работу канализационных сетей и очистных сооружений.",
    "Не допускается сброс веществ, способных засорять или разрушать канализационные сооружения.",
    "Перед сбросом производственных стоков может требоваться локальная предварительная очистка.",
    "Для конкретного объекта необходимо учитывать коммунально-экологические нормативы и требования к водному объекту.",
  ],
};

/** ҚМҚ 2.04.03-19 п. 6.2, прим. 2–3 — смесь на входе в сооружения биологической очистки. */
export const bioInletChecks = {
  phMin: BIO_INLET_LIMITS.phMin,
  phMax: BIO_INLET_LIMITS.phMax,
  temperatureMinC: BIO_INLET_LIMITS.tempMinC,
  temperatureMaxC: BIO_INLET_LIMITS.tempMaxC,
  bodFullMaxMgL: BIO_INLET_LIMITS.bodFullMaxMgL[1],
  nPer100Bod: BIO_INLET_LIMITS.nPer100Bod,
  pPer100Bod: BIO_INLET_LIMITS.pPer100Bod,
  source: BIO_INLET_LIMITS.ref,
};

/* =========================================================
 * БАЗОВЫЕ ТРЕБОВАНИЯ К ИНЖЕНЕРНОМУ РАСЧЁТУ
 * ========================================================= */

export const engineeringRules = {
  designDocument: "ҚМҚ 2.04.03-19",

  considerFactors: [
    "расход сточных вод",
    "максимальный часовой расход",
    "неравномерность поступления стока",
    "БПК5",
    "ХПК",
    "взвешенные вещества",
    "азот",
    "фосфор",
    "необходимая степень очистки",
    "условия сброса",
    "климатические условия",
    "сейсмичность",
    "состав исходных сточных вод",
  ],

  technologies: [
    "MBBR",
    "SBR",
    "MBR",
    "аэротенк",
    "биофильтр",
    "механическая очистка",
    "доочистка",
    "обеззараживание",
  ],
};

/* =========================================================
 * ПРОВЕРКА ПРОИЗВОДСТВЕННЫХ СТОЧНЫХ ВОД
 * ========================================================= */

export function validateIndustrialWastewater(input: {
  temperatureC?: number;
  ph?: number;
  suspendedSolidsMgL?: number;
}) {
  const warnings: string[] = [];

  if (
    input.temperatureC !== undefined &&
    input.temperatureC >
      industrialWastewaterChecks.temperatureMaxC
  ) {
    warnings.push(
      `Температура стока ${input.temperatureC} °C выше ${industrialWastewaterChecks.temperatureMaxC} °C.`,
    );
  }

  if (
    input.ph !== undefined &&
    (input.ph < industrialWastewaterChecks.phMin ||
      input.ph > industrialWastewaterChecks.phMax)
  ) {
    warnings.push(
      `pH ${input.ph} выходит за диапазон ${industrialWastewaterChecks.phMin}–${industrialWastewaterChecks.phMax}.`,
    );
  }

  if (
    input.suspendedSolidsMgL !== undefined &&
    input.suspendedSolidsMgL >
      industrialWastewaterChecks.suspendedSolidsMaxMgL
  ) {
    warnings.push(
      `Взвешенные вещества ${input.suspendedSolidsMgL} мг/л выше контрольного значения ${industrialWastewaterChecks.suspendedSolidsMaxMgL} мг/л.`,
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}