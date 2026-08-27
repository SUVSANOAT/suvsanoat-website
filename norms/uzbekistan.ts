/**
 * Нормативная база Республики Узбекистан
 * для предварительных инженерных расчётов систем канализации
 * и очистки сточных вод.
 *
 * Основная нормативная база:
 * КМК 2.04.03-19
 *
 * ВАЖНО:
 * Эти данные используются системой как справочная нормативная база.
 * Они НЕ заменяют рабочий проект, ПДС, санитарное согласование
 * или проверку инженером.
 */

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
    code: "КМК 2.04.03-19",
    title: "Канализация. Наружные сети и сооружения",
    category: "design",
    description:
      "Основной нормативный документ для проектирования вновь строящихся и реконструируемых систем наружной канализации населённых пунктов и объектов народного хозяйства Республики Узбекистан.",
    sourceUrl:
      "https://mc.uz/uploads/mcuz_91974688657649.pdf",
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
 * КМК 2.04.03-19
 *
 * ТАБЛИЦА 2
 * Общие коэффициенты неравномерности притока
 * сточных вод.
 *
 * Средний расход, л/с:
 * 5 / 10 / 20 / 50 / 100 / 300 / 500 / 1000 / 5000
 *
 * Kgen.max:
 * 2.50 / 2.10 / 1.90 / 1.70 / 1.60 / 1.55 /
 * 1.50 / 1.47 / 1.44
 *
 * Kgen.min:
 * 0.38 / 0.45 / 0.50 / 0.55 / 0.59 / 0.62 /
 * 0.66 / 0.69 / 0.71
 *
 * Для промежуточных значений применяется
 * линейная интерполяция согласно примечанию
 * к таблице 2 КМК 2.04.03-19.
 * ========================================================= */

type KmkUnevennessRow = {
  averageLps: number;
  kMax: number;
  kMin: number;
};

const KMK_2_04_03_19_TABLE_2: KmkUnevennessRow[] = [
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
    kMin: 0.5,
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
    kMax: 1.5,
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
];

export type Kmk2040319UnevennessCoefficients = {
  kMax: number;
  kMin: number;
  interpolated: boolean;
  source: string;
};

/**
 * Получение общих коэффициентов неравномерности
 * по таблице 2 КМК 2.04.03-19.
 *
 * Правила:
 *
 * 1. Для расхода 5 л/с используется первая строка таблицы.
 *
 * 2. Для значений от 5 до 5000 л/с применяется
 *    линейная интерполяция между соседними строками.
 *
 * 3. Для значений свыше 5000 л/с принимается
 *    последнее значение таблицы.
 *
 * 4. Значения менее 5 л/с требуют применения
 *    соответствующей методики КМК 2.04.01-98.
 *
 * Функция используется предварительным инженерным
 * расчётом SUVSANOAT ENGINEERING.
 */
export function getKmk2040319UnevennessCoefficients(
  averageLps: number,
): Kmk2040319UnevennessCoefficients {
  if (!Number.isFinite(averageLps) || averageLps <= 0) {
    throw new Error(
      "Средний расход сточных вод должен быть положительным числом.",
    );
  }

  const rows = KMK_2_04_03_19_TABLE_2;

  /*
   * Для расходов менее 5 л/с таблица 2 КМК 2.04.03-19
   * непосредственно не применяется.
   *
   * Для совместимости с предварительным расчётом
   * возвращаем ближайшее значение первой строки,
   * но явно отмечаем это в источнике.
   */
  if (averageLps < rows[0].averageLps) {
    return {
      kMax: rows[0].kMax,
      kMin: rows[0].kMin,
      interpolated: false,
      source:
        "КМК 2.04.03-19, таблица 2; расход менее 5 л/с — требуется проверка по КМК 2.04.01-98.",
    };
  }

  /*
   * Расход выше верхнего значения таблицы.
   */
  if (averageLps >= rows[rows.length - 1].averageLps) {
    return {
      kMax: rows[rows.length - 1].kMax,
      kMin: rows[rows.length - 1].kMin,
      interpolated: false,
      source:
        "КМК 2.04.03-19, таблица 2; принято верхнее табличное значение для расхода 5000 л/с и более.",
    };
  }

  /*
   * Точное табличное значение.
   */
  for (const row of rows) {
    if (averageLps === row.averageLps) {
      return {
        kMax: row.kMax,
        kMin: row.kMin,
        interpolated: false,
        source:
          "КМК 2.04.03-19, таблица 2.",
      };
    }
  }

  /*
   * Поиск соседних значений для интерполяции.
   */
  for (let i = 0; i < rows.length - 1; i++) {
    const lower = rows[i];
    const upper = rows[i + 1];

    if (
      averageLps > lower.averageLps &&
      averageLps < upper.averageLps
    ) {
      const ratio =
        (averageLps - lower.averageLps) /
        (upper.averageLps - lower.averageLps);

      const kMax =
        lower.kMax +
        ratio * (upper.kMax - lower.kMax);

      const kMin =
        lower.kMin +
        ratio * (upper.kMin - lower.kMin);

      return {
        kMax,
        kMin,
        interpolated: true,
        source:
          `КМК 2.04.03-19, таблица 2; интерполяция между ${lower.averageLps} и ${upper.averageLps} л/с.`,
      };
    }
  }

  /*
   * Защитный случай.
   */
  throw new Error(
    "Не удалось определить коэффициенты неравномерности КМК 2.04.03-19.",
  );
}

/* =========================================================
 * ПРОМЫШЛЕННЫЕ СТОЧНЫЕ ВОДЫ
 * ========================================================= */

export const industrialWastewaterChecks = {
  temperatureMaxC: 40,

  phMin: 6.5,
  phMax: 9.0,

  suspendedSolidsMaxMgL: 500,

  notes: [
    "Производственные сточные воды не должны нарушать работу канализационных сетей и очистных сооружений.",
    "Не допускается сброс веществ, способных засорять или разрушать канализационные сооружения.",
    "Перед сбросом производственных стоков может требоваться локальная предварительная очистка.",
    "Для конкретного объекта необходимо учитывать коммунально-экологические нормативы и требования к водному объекту.",
  ],
};

/* =========================================================
 * БАЗОВЫЕ ТРЕБОВАНИЯ К ИНЖЕНЕРНОМУ РАСЧЁТУ
 * ========================================================= */

export const engineeringRules = {
  designDocument: "КМК 2.04.03-19",

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