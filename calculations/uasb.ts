import { kMaxByDailyFlow } from "../norms/kmk-2-04-03-19";

export type UASBCalculationInput = {
  flowM3Day: number;
  hrtHours?: number;

  bodMgL: number;
  codMgL: number;
  tssMgL: number;
  nitrogenMgL: number;
  phosphorusMgL: number;

  upflowVelocityMH?: number;
  codRemoval?: number;
  reactorReserve?: number;
  sections?: number;

  gasYieldM3PerKgCodRemoved?: number;
  methaneFraction?: number;
};

export type UASBCalculationResult = {
  qAverageM3H: number;
  qPeakM3H: number;

  bodLoadKgDay: number;
  codLoadKgDay: number;
  tssLoadKgDay: number;

  codRemovedKgDay: number;
  codRemainingKgDay: number;

  hydraulicVolumeM3: number;
  organicVolumeM3: number;
  reactorVolumeM3: number;
  reactorVolumeWithReserveM3: number;

  reactorAreaM2: number;
  areaPerSectionM2: number;
  volumePerSectionM3: number;

  upflowVelocityMH: number;
  sections: number;

  biogasM3Day: number;
  methaneM3Day: number;
  methaneFraction: number;
};

function positive(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) > 0
    ? (value as number)
    : fallback;
}

function bounded(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const result = positive(value, fallback);
  return Math.min(max, Math.max(min, result));
}

/**
 * Предварительный расчёт UASB.
 *
 * Модель использует два независимых ограничения:
 * 1. гидравлическое — через расход и принятую HRT;
 * 2. органическое — через COD load и принятую объёмную нагрузку.
 *
 * Итоговый объём принимается как максимум двух ограничений.
 *
 * Все коэффициенты являются предварительными инженерными допущениями
 * и не заменяют технологический/гидравлический расчёт рабочего проекта.
 */
export function calculateUASB(
  input: UASBCalculationInput
): UASBCalculationResult {
  const flow = Math.max(0, input.flowM3Day);
  const hrtHours = positive(input.hrtHours, 8);

  const upflowVelocityMH = positive(input.upflowVelocityMH, 0.8);
  const reactorReserve = Math.max(0, positive(input.reactorReserve, 0.15));
  const sections = Math.max(1, Math.round(positive(input.sections, 2)));

  // Предварительная объёмная органическая нагрузка COD.
  // Это допущение модели, а не нормативное значение.
  const organicLoadingKgCodM3Day = 2.5;

  const qAverageM3H = flow / 24;

  // Максимальный часовой расход — по табл. 2 ҚМҚ 2.04.03-19 (п. 2.7).
  const qPeakM3H = qAverageM3H * kMaxByDailyFlow(flow).kMax;

  const bodLoadKgDay = flow * Math.max(0, input.bodMgL) / 1000;
  const codLoadKgDay = flow * Math.max(0, input.codMgL) / 1000;
  const tssLoadKgDay = flow * Math.max(0, input.tssMgL) / 1000;

  const codRemoval = bounded(input.codRemoval, 0.7, 0, 0.95);

  const codRemovedKgDay = codLoadKgDay * codRemoval;
  const codRemainingKgDay = Math.max(
    0,
    codLoadKgDay - codRemovedKgDay
  );

  // Ограничение по HRT.
  const hydraulicVolumeM3 = qAverageM3H * hrtHours;

  // Ограничение по органической нагрузке.
  const organicVolumeM3 =
    organicLoadingKgCodM3Day > 0
      ? codLoadKgDay / organicLoadingKgCodM3Day
      : 0;

  const reactorVolumeM3 = Math.max(
    hydraulicVolumeM3,
    organicVolumeM3
  );

  const reactorVolumeWithReserveM3 =
    reactorVolumeM3 * (1 + reactorReserve);

  // Площадь определяется по пиковому расходу и восходящей скорости.
  const reactorAreaM2 =
    upflowVelocityMH > 0
      ? qPeakM3H / upflowVelocityMH
      : 0;

  const areaPerSectionM2 = reactorAreaM2 / sections;
  const volumePerSectionM3 = reactorVolumeM3 / sections;

  // Предварительная оценка биогаза.
  const gasYield = positive(
    input.gasYieldM3PerKgCodRemoved,
    0.35
  );

  const methaneFraction = bounded(
    input.methaneFraction,
    0.65,
    0.4,
    0.8
  );

  const biogasM3Day = codRemovedKgDay * gasYield;
  const methaneM3Day = biogasM3Day * methaneFraction;

  return {
    qAverageM3H,
    qPeakM3H,

    bodLoadKgDay,
    codLoadKgDay,
    tssLoadKgDay,

    codRemovedKgDay,
    codRemainingKgDay,

    hydraulicVolumeM3,
    organicVolumeM3,
    reactorVolumeM3,
    reactorVolumeWithReserveM3,

    reactorAreaM2,
    areaPerSectionM2,
    volumePerSectionM3,

    upflowVelocityMH,
    sections,

    biogasM3Day,
    methaneM3Day,
    methaneFraction,
  };
}