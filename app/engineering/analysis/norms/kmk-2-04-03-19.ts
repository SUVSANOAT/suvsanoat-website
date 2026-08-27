/**
 * SUVSANOAT ENGINEERING
 * НОРМАТИВНАЯ БАЗА
 *
 * КМК 2.04.03-19
 *
 * ВАЖНО:
 * Этот файл содержит только нормативные данные, которые уже
 * подтверждены в текущей расчётной модели SUVSANOAT.
 *
 * Не добавляем сюда предположительные нормы на 1 человека.
 * Для расчёта по населению удельное водоотведение должно
 * поступать из отдельно подтверждённой нормативной базы.
 */

export const KMK_2_04_03_19 = {
  code: "КМК 2.04.03-19",
  title: "Канализация. Наружные сети и сооружения",
  section: "Раздел 2. Расчётные расходы сточных вод",

  clauses: {
    clause22: {
      id: "2.2",
      title: "Удельное водоотведение",
      note:
        "Для отдельных категорий объектов удельное водоотведение принимается по применимому нормативному документу, в том числе КМК 2.04.01-98.",
    },

    clause23: {
      id: "2.3",
      title: "Среднесуточный расход",
      note:
        "Среднесуточный расход определяется как сумма применимых расходов объекта.",
    },

    clause24: {
      id: "2.4",
      title: "Расчётные расходы",
      note:
        "Расчётные расходы определяются с учётом коэффициентов неравномерности.",
    },

    clause25: {
      id: "2.5",
      title: "Коэффициенты неравномерности",
      note:
        "Для промежуточных значений коэффициенты определяются интерполяцией между табличными значениями.",
    },

    clause27: {
      id: "2.7",
      title: "Расчётные расходы сточных вод",
      note:
        "В текущем модуле используется как нормативное основание для отображения расчётного расхода и коэффициентов неравномерности.",
    },
  },

  /**
   * Таблица 2.
   *
   * averageLps — средний расход сточных вод, л/с
   * kMax       — общий коэффициент максимальной неравномерности
   * kMin       — общий коэффициент минимальной неравномерности
   *
   * Для промежуточного среднего расхода применяется линейная
   * интерполяция между соседними табличными значениями.
   */
  table2: {
    title: "Общие коэффициенты неравномерности притока сточных вод",
    source: "КМК 2.04.03-19, таблица 2",

    rows: [
      { averageLps: 5, kMax: 2.5, kMin: 0.38 },
      { averageLps: 10, kMax: 2.1, kMin: 0.45 },
      { averageLps: 20, kMax: 1.9, kMin: 0.5 },
      { averageLps: 50, kMax: 1.7, kMin: 0.55 },
      { averageLps: 100, kMax: 1.6, kMin: 0.59 },
      { averageLps: 300, kMax: 1.55, kMin: 0.62 },
      { averageLps: 500, kMax: 1.5, kMin: 0.66 },
      { averageLps: 1000, kMax: 1.47, kMin: 0.69 },
      { averageLps: 5000, kMax: 1.44, kMin: 0.71 },
    ],
  },

  calculationRules: {
    averageFlow: {
      formula: "Qср = Qсут × 1000 / 86400",
      unit: "л/с",
      source: "КМК 2.04.03-19, раздел 2",
    },

    maximumFlow: {
      formula: "Qmax = Qср × Kgen.max",
      source: "КМК 2.04.03-19, раздел 2, таблица 2",
    },

    minimumFlow: {
      formula: "Qmin = Qср × Kgen.min",
      source: "КМК 2.04.03-19, раздел 2, таблица 2",
    },

    interpolation: {
      method: "linear",
      source: "КМК 2.04.03-19, п. 2.5",
      note:
        "Если Qср находится между двумя табличными значениями, коэффициент определяется интерполяцией.",
    },
  },

  /**
   * Ограничение применимости текущей реализации.
   *
   * Если средний расход меньше 5 л/с, текущая таблица 2
   * не используется автоматически. Такой случай должен пройти
   * отдельную нормативную проверку.
   */
  applicability: {
    minimumAverageLpsForCurrentTable: 5,
    belowMinimumAction:
      "Требуется отдельная нормативная проверка по применимому документу.",
  },

  /**
   * Нормативные источники, которые будут подключаться отдельно.
   */
  relatedDocuments: [
    {
      code: "КМК 2.04.01-98",
      purpose:
        "Удельное водоотведение и связанные расчётные показатели для применимых объектов.",
      status: "требует отдельной проверки и подключения подтверждённых таблиц",
    },
  ],
} as const;

export type KmkTable2Row =
  (typeof KMK_2_04_03_19.table2.rows)[number];

export type KmkNormativeReference = {
  document: string;
  section?: string;
  clause?: string;
  table?: string;
  title: string;
  note?: string;
};

export const KMK_FLOW_REFERENCES = {
  average: {
    document: KMK_2_04_03_19.code,
    section: KMK_2_04_03_19.section,
    clause: KMK_2_04_03_19.clauses.clause23.id,
    title: "Среднесуточный расход",
  },

  coefficients: {
    document: KMK_2_04_03_19.code,
    section: KMK_2_04_03_19.section,
    clause: KMK_2_04_03_19.clauses.clause25.id,
    table: "Таблица 2",
    title: "Коэффициенты неравномерности",
  },

  maximum: {
    document: KMK_2_04_03_19.code,
    section: KMK_2_04_03_19.section,
    clause: KMK_2_04_03_19.clauses.clause27.id,
    table: "Таблица 2",
    title: "Максимальный расчётный расход",
  },

  minimum: {
    document: KMK_2_04_03_19.code,
    section: KMK_2_04_03_19.section,
    clause: KMK_2_04_03_19.clauses.clause27.id,
    table: "Таблица 2",
    title: "Минимальный расчётный расход",
  },
} as const;

/**
 * Формирует человекочитаемое нормативное обоснование.
 */
export function getKmkFlowBasis(
  type: "average" | "maximum" | "minimum" | "coefficients",
): KmkNormativeReference {
  return KMK_FLOW_REFERENCES[type];
}