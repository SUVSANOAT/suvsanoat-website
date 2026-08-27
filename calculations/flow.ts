/**
 * SUVSANOAT ENGINEERING
 * Расчет расходов сточных вод
 *
 * Нормативная база:
 * КМК 2.04.03-19
 *
 * Нормативные таблицы:
 * app/engineering/norms/uzbekistan.ts
 */

import {
  getKmk2040319UnevennessCoefficients,
} from "../norms/uzbekistan";

/* =========================================================
 * INPUT
 * ======================================================= */

export type FlowInput = {
  /**
   * Известный среднесуточный расход сточных вод,
   * м³/сут.
   *
   * Если задан — используется как проектный расход.
   */
  knownAverageM3Day?: number;

  /**
   * Количество пользователей / жителей.
   */
  people?: number;

  /**
   * Удельное водоотведение,
   * л/чел·сут.
   *
   * Значение должно быть выбрано
   * из применимого норматива.
   */
  specificDischargeLPersonDay?: number;
};

/* =========================================================
 * RESULT
 * ======================================================= */

export type FlowResult = {
  /**
   * Источник определения среднего расхода:
   * project   — задан проектом;
   * normative — рассчитан по людям и удельному расходу.
   */
  source: "project" | "normative";

  /** Среднесуточный расход, м³/сут */
  averageM3Day: number;

  /** Среднесуточный расход, л/с */
  averageLps: number;

  /** Коэффициент максимальной неравномерности */
  maxUnevennessCoefficient: number;

  /** Коэффициент минимальной неравномерности */
  minUnevennessCoefficient: number;

  /** Максимальный расход, м³/сут */
  maxM3Day: number;

  /** Минимальный расход, м³/сут */
  minM3Day: number;

  /** Максимальный расход, л/с */
  maxLps: number;

  /** Минимальный расход, л/с */
  minLps: number;

  /** Пояснение к расчету */
  note: string;

  /** Нормативный источник */
  normativeSource: string;
};

/* =========================================================
 * MAIN CALCULATION
 * ======================================================= */

export function calculateWastewaterFlow(
  input: FlowInput,
): FlowResult {
  let averageM3Day: number;
  let source: FlowResult["source"];

  /* =======================================================
   * 1. ПРОЕКТНЫЙ РАСХОД
   * ======================================================= */

  if (input.knownAverageM3Day !== undefined) {
    if (
      !Number.isFinite(input.knownAverageM3Day) ||
      input.knownAverageM3Day <= 0
    ) {
      throw new Error(
        "knownAverageM3Day должен быть положительным числом.",
      );
    }

    averageM3Day = input.knownAverageM3Day;
    source = "project";
  }

  /* =======================================================
   * 2. НОРМАТИВНЫЙ РАСЧЕТ
   *
   * Q = N × q / 1000
   *
   * N — количество людей;
   * q — удельное водоотведение, л/чел·сут.
   * ======================================================= */

  else {
    if (
      input.people === undefined ||
      !Number.isFinite(input.people) ||
      input.people <= 0
    ) {
      throw new Error(
        "Необходимо указать количество людей.",
      );
    }

    if (
      input.specificDischargeLPersonDay ===
        undefined ||
      !Number.isFinite(
        input.specificDischargeLPersonDay,
      ) ||
      input.specificDischargeLPersonDay <= 0
    ) {
      throw new Error(
        "Необходимо указать нормативный удельный расход водоотведения.",
      );
    }

    averageM3Day =
      (input.people *
        input.specificDischargeLPersonDay) /
      1000;

    source = "normative";
  }

  /* =======================================================
   * 3. СРЕДНИЙ РАСХОД В л/с
   *
   * 1 м³ = 1000 л
   * 1 сутки = 86400 секунд
   * ======================================================= */

  const averageLps =
    (averageM3Day * 1000) / 86400;

  /* =======================================================
   * 4. КОЭФФИЦИЕНТЫ НЕРАВНОМЕРНОСТИ
   *
   * КМК 2.04.03-19, таблица 2
   * ======================================================= */

  const coefficients =
    getKmk2040319UnevennessCoefficients(
      averageLps,
    );

  /* =======================================================
   * 5. МАКСИМАЛЬНЫЙ И МИНИМАЛЬНЫЙ РАСХОД
   * ======================================================= */

  const maxM3Day =
    averageM3Day *
    coefficients.kMax;

  const minM3Day =
    averageM3Day *
    coefficients.kMin;

  const maxLps =
    averageLps *
    coefficients.kMax;

  const minLps =
    averageLps *
    coefficients.kMin;

  /* =======================================================
   * 6. ПРИМЕЧАНИЕ
   * ======================================================= */

  const note =
    coefficients.interpolated
      ? "Коэффициенты неравномерности получены интерполяцией между соседними значениями таблицы 2 КМК 2.04.03-19."
      : "Коэффициенты неравномерности взяты непосредственно из таблицы 2 КМК 2.04.03-19.";

  /* =======================================================
   * 7. РЕЗУЛЬТАТ
   * ======================================================= */

  return {
    source,

    averageM3Day,
    averageLps,

    maxUnevennessCoefficient:
      coefficients.kMax,

    minUnevennessCoefficient:
      coefficients.kMin,

    maxM3Day,
    minM3Day,

    maxLps,
    minLps,

    note,

    normativeSource:
      coefficients.source,
  };
}