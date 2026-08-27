/**
 * КМК 2.04.01-98
 * Внутренний водопровод и канализация зданий
 *
 * Нормативный модуль для SUVSANOAT Engineering Analysis.
 *
 * Источник:
 * Официальное издание КМК 2.04.01-98,
 * Министерство строительства и ЖКХ Республики Узбекистан,
 * обязательное приложение 3, стр. 153–159 PDF.
 *
 * ВАЖНО:
 * Этот файл содержит только значения, которые удалось однозначно
 * извлечь из официального документа. Неизвлечённые строки таблицы
 * намеренно НЕ заполняются догадками.
 */

export const KMK_2_04_01_98 = {
  document: "КМК 2.04.01-98",
  title: "Внутренний водопровод и канализация зданий",
  effectiveDate: "1998-03-01",

  source: {
    publisher:
      "Государственный комитет Республики Узбекистан по архитектуре и строительству",
    officialPdf:
      "https://mc.uz/uploads/mcuz_3964770333575.pdf",
    appendix: "Приложение 3 — Нормы расхода воды потребителями",
    pages: "153–159",
  },

  clauses: {
    designBasis:
      "П. 3.1 — системы водоснабжения и канализации рассчитываются по нормам расхода воды и расчётному числу санитарно-технических приборов.",
    applianceFlow:
      "П. 3.2 — секундный расход одного прибора принимается по обязательным приложениям 2 и 3; при отсутствии данных допускаются q0tot = 0.3 л/с, q0h = q0c = 0.2 л/с.",
    maximumSecond:
      "П. 3.3 — максимальный секундный расход воды определяется как q = 5·q0·α; коэффициент α зависит от N и вероятности действия приборов P.",
    probability:
      "П. 3.4 — вероятность действия санитарно-технических приборов определяется по формулам КМК 2.04.01-98.",
    wastewaterMaximumSecond:
      "П. 3.5 — максимальный секундный расход сточных вод определяется по правилам КМК 2.04.01-98 с учётом максимального секундного расхода воды.",
    maximumHour:
      "П. 3.8 — максимальный часовой расход воды определяется по коэффициенту, зависящему от вероятности действия приборов и их количества.",
    averageHour:
      "П. 3.9 — средний часовой расход определяется из суточной нормы.",
    wastewaterMaximumHour:
      "П. 3.12 — максимальный часовой расход сточных вод принимается равным расчётному максимальному часовому расходу воды.",
  },

  // Значения из обязательного приложения 3, стр. 153–159.
  // unitFlowLps — расход воды одним прибором, когда он указан
  // непосредственно в строке объекта.
  consumers: {
    residential: {
      id: "residential",
      name: "Жилые дома квартирного типа — с водопроводом и канализацией, без ванн",
      measure: "житель",
      averageDayLPerUnit: 95,
      maximumDayLPerUnit: 120,
      maximumHourLPerUnit: 6.5,
      unitFlowLps: 0.2,
      unitFlowLph: 50,
      source: "Приложение 3, стр. 153–154",
    },

    residentialWithGasSupply: {
      id: "residential-gas",
      name: "Жилые дома квартирного типа — с водопроводом и канализацией, без ванн, с газоснабжением",
      measure: "житель",
      averageDayLPerUnit: 120,
      maximumDayLPerUnit: 150,
      maximumHourLPerUnit: 7,
      unitFlowLps: 0.2,
      unitFlowLph: 50,
      source: "Приложение 3, стр. 153–154",
    },

    residentialWithBathGasWaterHeater: {
      id: "residential-bath-gas",
      name: "Жилые дома — с водопроводом, канализацией и ваннами с газовыми водонагревателями",
      measure: "житель",
      averageDayLPerUnit: 150,
      maximumDayLPerUnit: 180,
      maximumHourLPerUnit: 8.1,
      unitFlowLps: 0.3,
      unitFlowLph: 300,
      source: "Приложение 3, стр. 153–154",
    },

    residentialHighComfort: {
      id: "residential-high-comfort",
      name: "Жилые дома и квартиры высокого класса комфортности",
      measure: "житель",
      averageDayLPerUnit: 450,
      averageHotWaterLPerUnit: 170,
      maximumDayLPerUnit: 500,
      maximumHotWaterLPerUnit: 200,
      maximumHourLPerUnit: 27,
      unitFlowLps: 0.3,
      unitFlowLph: 300,
      source: "Приложение 3, стр. 155",
    },

    hospitalGeneralBaths: {
      id: "hospital-general",
      name: "Больницы — с общими ваннами и душевыми",
      measure: "койка",
      averageDayLPerUnit: 200,
      averageHotWaterLPerUnit: 100,
      maximumDayLPerUnit: 250,
      maximumHotWaterLPerUnit: 150,
      source: "Приложение 3, стр. 155–156",
    },

    hospitalGeneralShowers: {
      id: "hospital-general-showers",
      name: "Больницы — с общими санитарными узлами и душевыми, санитарные узлы приближены к палатам",
      measure: "койка",
      averageDayLPerUnit: 230,
      averageHotWaterLPerUnit: 100,
      maximumDayLPerUnit: 250,
      maximumHotWaterLPerUnit: 120,
      source: "Приложение 3, стр. 155–156",
    },

    kindergartenDay: {
      id: "kindergarten-day",
      name: "Детские ясли-сады — с дневным пребыванием детей",
      measure: "ребёнок",
      averageDayLPerUnit: 200,
      maximumDayLPerUnit: 240,
      source: "Приложение 3, стр. 156",
    },

    kindergartenDaySemiFinished: {
      id: "kindergarten-day-semi",
      name: "Детские ясли-сады — дневное пребывание, столовая на полуфабрикатах",
      measure: "ребёнок",
      averageDayLPerUnit: 90,
      maximumDayLPerUnit: 110,
      source: "Приложение 3, стр. 156",
    },

    kindergartenDayRawKitchenLaundry: {
      id: "kindergarten-day-raw",
      name: "Детские ясли-сады — дневное пребывание, столовая на сырье и автоматическая прачечная",
      measure: "ребёнок",
      averageDayLPerUnit: 240,
      maximumDayLPerUnit: 200,
      source: "Приложение 3, стр. 156",
      note:
        "Значения извлечены из OCR официального PDF; перед включением в автоматический расчёт требуется визуальная сверка строки таблицы.",
    },

    administrative: {
      id: "administrative",
      name: "Административные здания",
      measure: "работающий",
      source: "Приложение 3, стр. 157–158",
      note:
        "Строка присутствует в официальной таблице, но значения в OCR-представлении таблицы недостаточно надёжны для автоматического внесения.",
    },

    school: {
      id: "school",
      name: "Общеобразовательные школы с душевыми при гимнастических залах",
      measure: "1 учащийся и 1 преподаватель",
      source: "Приложение 3, стр. 157–158",
      note:
        "Строка присутствует в официальной таблице; значения следует сверить по визуальному оригиналу перед автоматизацией.",
    },
  },

  defaultApplianceFlows: {
    totalLps: 0.3,
    hotLps: 0.2,
    coldLps: 0.2,
    source: "П. 3.2 КМК 2.04.01-98",
  },
} as const;

export type KmkConsumerId = keyof typeof KMK_2_04_01_98.consumers;

export function getKmkConsumer(id: KmkConsumerId) {
  return KMK_2_04_01_98.consumers[id];
}

/**
 * Средний суточный расход:
 * Qavg_day [м3/сут] = n × qavg [л/(ед·сут)] / 1000
 */
export function calculateAverageDailyFlow(
  consumer: KmkConsumerId,
  quantity: number,
) {
  const row = getKmkConsumer(consumer);

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !("averageDayLPerUnit" in row) ||
    typeof row.averageDayLPerUnit !== "number"
  ) {
    return null;
  }

  return {
    quantity,
    unit: row.measure,
    normLPerUnitDay: row.averageDayLPerUnit,
    qAverageM3Day:
      (quantity * row.averageDayLPerUnit) / 1000,
    source: `${KMK_2_04_01_98.document}, ${row.source}`,
  };
}

/**
 * Средний часовой расход:
 * qavg,h [м3/ч] = Qday / (24 × 1000)
 *
 * Формула соответствует п. 3.9.
 */
export function calculateAverageHourlyFlow(
  qAverageM3Day: number,
) {
  if (!Number.isFinite(qAverageM3Day) || qAverageM3Day < 0) {
    return null;
  }

  return qAverageM3Day / 24;
}

/**
 * Перевод м3/сут в л/с.
 */
export function m3DayToLps(qM3Day: number) {
  if (!Number.isFinite(qM3Day)) {
    return null;
  }

  return (qM3Day * 1000) / 86400;
}

/**
 * Перевод л/с в м3/ч.
 */
export function lpsToM3Hour(qLps: number) {
  if (!Number.isFinite(qLps)) {
    return null;
  }

  return qLps * 3.6;
}

/**
 * Нормативное основание для малого расхода.
 */
export function getKmkSmallFlowBasis() {
  return {
    document: KMK_2_04_01_98.document,
    section: "Раздел 3",
    clauses: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.8", "3.9", "3.12"],
    appendix: "Обязательное приложение 3",
    source: KMK_2_04_01_98.source.officialPdf,
  };
}