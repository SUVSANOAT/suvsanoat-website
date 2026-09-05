/**
 * SUVSANOAT ENGINEERING
 * Нормативная база Республики Узбекистан
 *
 * Назначение:
 * - единая точка хранения нормативных данных;
 * - КМК 2.04.03-19 — наружные сети и сооружения канализации;
 * - КМК 2.04.01-98 / актуальные ШНК — внутренние системы
 *   водоснабжения и канализации;
 *
 * ВАЖНО:
 * Этот файл не должен содержать произвольных "типовых" норм.
 * Если норматив зависит от категории объекта, он должен быть
 * выбран явно по соответствующей таблице/пункту норматива.
 */

/* =========================================================
 * НОРМАТИВНЫЕ ДОКУМЕНТЫ
 * ======================================================= */

export const UZBEKISTAN_NORMS = {
  wastewaterExternal: {
    code: "ҚМҚ 2.04.03-19",
    title: "Канализация. Наружные сети и сооружения",
    country: "Узбекистан",
    note: "Вторая редакция, взамен КМК 2.04.03-97; приказ Минстроя РУз № 439 от 27.09.2019, действует с 01.01.2020.",
    sections: {
      flow: "Раздел 2",
      unevenness: "п. 2.7, таблица 2",
      waterUse: "п. 2.9, таблица 3",
      perCapitaLoads: "п. 6.4, таблица 25",
    },
  },

  internalWaterAndSewerage: {
    code: "КМК 2.04.01-98",
    title: "Внутренний водопровод и канализация зданий",
    country: "Узбекистан",
    note:
      "При применимости необходимо учитывать действующую редакцию/заменяющий ШНК.",
  },
} as const;

/* =========================================================
 * КМК 2.04.03-19
 * ТАБЛИЦА 2 — КОЭФФИЦИЕНТЫ НЕРАВНОМЕРНОСТИ
 *
 * averageLps — средний расход сточных вод, л/с
 * kMax       — общий коэффициент максимальной неравномерности
 * kMin       — общий коэффициент минимальной неравномерности
 *
 * Для промежуточных значений используется линейная
 * интерполяция между соседними значениями таблицы.
 * ======================================================= */

import { TABLE_2_UNEVENNESS, unevenness } from "../../../../norms/kmk-2-04-03-19";

export type WastewaterUnevennessRow = {
  averageLps: number;
  kMax: number;
  kMin: number;
};

export const KMK_2_04_03_19_TABLE_2: readonly WastewaterUnevennessRow[] =
  TABLE_2_UNEVENNESS;

/* =========================================================
 * ПОЛУЧЕНИЕ КОЭФФИЦИЕНТОВ — обёртка над norms/kmk-2-04-03-19.ts
 * ======================================================= */

export type UnevennessCoefficientResult = {
  kMax: number;
  kMin: number;
  interpolated: boolean;
  /** средний расход менее 5 л/с — табл. 2 напрямую не применяется (прим. 2) */
  belowTable: boolean;
  source: string;
};

export function getKmk2040319UnevennessCoefficients(
  averageLps: number,
): UnevennessCoefficientResult {
  const r = unevenness(averageLps);
  return {
    kMax: r.kMax,
    kMin: r.kMin,
    interpolated: r.interpolated,
    belowTable: r.belowTable,
    source: r.source,
  };
}

/* =========================================================
 * РАСЧЕТНЫЕ РАСХОДЫ
 * ======================================================= */

export type WastewaterFlowNormativeResult = {
  averageM3Day: number;
  averageLps: number;

  maxUnevennessCoefficient: number;
  minUnevennessCoefficient: number;

  maxM3Day: number;
  minM3Day: number;

  maxLps: number;
  minLps: number;

  source: string;
  interpolated: boolean;
};

export function calculateKmk2040319Flow(
  averageM3Day: number,
): WastewaterFlowNormativeResult {
  if (!Number.isFinite(averageM3Day) || averageM3Day <= 0) {
    throw new Error(
      "averageM3Day должен быть положительным числом.",
    );
  }

  const averageLps =
    (averageM3Day * 1000) / 86400;

  const coefficients =
    getKmk2040319UnevennessCoefficients(
      averageLps,
    );

  return {
    averageM3Day,
    averageLps,

    maxUnevennessCoefficient:
      coefficients.kMax,

    minUnevennessCoefficient:
      coefficients.kMin,

    maxM3Day:
      averageM3Day * coefficients.kMax,

    minM3Day:
      averageM3Day * coefficients.kMin,

    maxLps:
      averageLps * coefficients.kMax,

    minLps:
      averageLps * coefficients.kMin,

    source: coefficients.source,

    interpolated:
      coefficients.interpolated,
  };
}

/* =========================================================
 * НОРМАТИВНЫЕ ИСТОЧНИКИ ДЛЯ ИНТЕРФЕЙСА
 *
 * Эти данные нужны, чтобы пользователь видел,
 * на основании какого норматива выполняется расчет.
 * ======================================================= */

export const NORMATIVE_SOURCES = [
  {
    id: "kmk-2.04.03-19",
    code: "ҚМҚ 2.04.03-19",
    title:
      "Канализация. Наружные сети и сооружения",
    scope:
      "Расчётные расходы и коэффициенты неравномерности (разд. 2), удельное водоотведение (табл. 3), загрязнения на жителя (табл. 25), расчёт сооружений очистки (разд. 6), СЗЗ (табл. 1).",
  },

  {
    id: "kmk-2.04.01-98",
    code: "КМК 2.04.01-98",
    title:
      "Внутренний водопровод и канализация зданий",
    scope:
      "Определение расходов воды и связанных с ними расчетных расходов для зданий.",
  },
] as const;

/* =========================================================
 * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ======================================================= */

export function getNormativeSource(
  id: string,
) {
  return NORMATIVE_SOURCES.find(
    (item) => item.id === id,
  );
}

export function getWastewaterUnevennessTable() {
  return KMK_2_04_03_19_TABLE_2;
}
export const __UZBEKISTAN_NORMS_CHECK__ = true;