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
    code: "КМК 2.04.03-19",
    title: "Канализация. Наружные сети и сооружения",
    country: "Узбекистан",
    sections: {
      flow: "Раздел 2",
      unevenness: "Таблица 2",
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

export type WastewaterUnevennessRow = {
  averageLps: number;
  kMax: number;
  kMin: number;
};

export const KMK_2_04_03_19_TABLE_2: readonly WastewaterUnevennessRow[] =
  [
    {
      averageLps: 5,
      kMax: 2.5,
      kMin: 0.38,
    },
    {
      averageLps: 10,
      kMax: 2.1,
      kMin: 0.45,
    },
    {
      averageLps: 20,
      kMax: 1.9,
      kMin: 0.50,
    },
    {
      averageLps: 50,
      kMax: 1.7,
      kMin: 0.55,
    },
    {
      averageLps: 100,
      kMax: 1.6,
      kMin: 0.59,
    },
    {
      averageLps: 300,
      kMax: 1.55,
      kMin: 0.62,
    },
    {
      averageLps: 500,
      kMax: 1.50,
      kMin: 0.66,
    },
    {
      averageLps: 1000,
      kMax: 1.47,
      kMin: 0.69,
    },
    {
      averageLps: 5000,
      kMax: 1.44,
      kMin: 0.71,
    },
  ] as const;

/* =========================================================
 * ЛИНЕЙНАЯ ИНТЕРПОЛЯЦИЯ
 * ======================================================= */

function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  if (x2 === x1) {
    return y1;
  }

  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

/* =========================================================
 * ПОЛУЧЕНИЕ КОЭФФИЦИЕНТОВ
 * ======================================================= */

export type UnevennessCoefficientResult = {
  kMax: number;
  kMin: number;
  interpolated: boolean;
  source: string;
};

export function getKmk2040319UnevennessCoefficients(
  averageLps: number,
): UnevennessCoefficientResult {
  if (!Number.isFinite(averageLps) || averageLps <= 0) {
    throw new Error(
      "averageLps должен быть положительным числом.",
    );
  }

  const table = KMK_2_04_03_19_TABLE_2;

  /*
   * Ниже первой точки:
   * используем первую нормативную строку.
   */
  if (averageLps <= table[0].averageLps) {
    return {
      kMax: table[0].kMax,
      kMin: table[0].kMin,
      interpolated: false,
      source:
        "КМК 2.04.03-19, таблица 2",
    };
  }

  /*
   * Выше последней точки:
   * используем последнюю нормативную строку.
   *
   * В дальнейшем можно заменить это поведение
   * на отдельное правило, если проектная методика
   * потребует экстраполяции.
   */
  const last = table[table.length - 1];

  if (averageLps >= last.averageLps) {
    return {
      kMax: last.kMax,
      kMin: last.kMin,
      interpolated: false,
      source:
        "КМК 2.04.03-19, таблица 2",
    };
  }

  /*
   * Поиск двух соседних нормативных точек.
   */
  for (let i = 0; i < table.length - 1; i += 1) {
    const a = table[i];
    const b = table[i + 1];

    if (
      averageLps >= a.averageLps &&
      averageLps <= b.averageLps
    ) {
      return {
        kMax: interpolate(
          averageLps,
          a.averageLps,
          a.kMax,
          b.averageLps,
          b.kMax,
        ),

        kMin: interpolate(
          averageLps,
          a.averageLps,
          a.kMin,
          b.averageLps,
          b.kMin,
        ),

        interpolated: true,

        source:
          "КМК 2.04.03-19, таблица 2; промежуточное значение получено интерполяцией",
      };
    }
  }

  /*
   * Защита от невозможного состояния.
   */
  return {
    kMax: last.kMax,
    kMin: last.kMin,
    interpolated: false,
    source:
      "КМК 2.04.03-19, таблица 2",
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
    code: "КМК 2.04.03-19",
    title:
      "Канализация. Наружные сети и сооружения",
    scope:
      "Расчет расходов сточных вод и коэффициентов неравномерности.",
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