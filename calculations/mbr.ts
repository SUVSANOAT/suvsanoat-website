import { kMaxByDailyFlow, oxygenTransferKgPerNm3 } from "../norms/kmk-2-04-03-19";

export type MBRCalculationInput = {
  flowM3Day: number;
  hrtHours: number;
  bodMgL: number;
  codMgL: number;
  tssMgL: number;
  nitrogenMgL: number;
  phosphorusMgL: number;
  membraneFluxLMH?: number;
  membraneReserve?: number;
  reactorReserve?: number;
  membraneModuleAreaM2?: number;
  peakFactor?: number;
  sections?: number;
};

export type MBRCalculationResult = {
  qAverageM3H: number;
  qPeakM3H: number;

  bodLoadKgDay: number;
  removedBodKgDay: number;
  codLoadKgDay: number;
  tssLoadKgDay: number;

  reactorVolumeM3: number;
  reactorVolumeWithReserveM3: number;
  volumePerSectionM3: number;

  membraneFluxLMH: number;
  membraneAreaM2: number;
  membraneAreaWithReserveM2: number;
  membraneModules: number;

  oxygenKgDay: number;
  airNm3H: number;
};

function positive(
  value: number | undefined,
  fallback: number
): number {
  return Number.isFinite(value) && (value as number) > 0
    ? (value as number)
    : fallback;
}

export function calculateMBR(
  input: MBRCalculationInput
): MBRCalculationResult {
  const flow = positive(input.flowM3Day, 0);
  const hrt = positive(input.hrtHours, 8);

  const flux = positive(input.membraneFluxLMH, 15);

  const membraneReserve = Math.max(
    0,
    positive(input.membraneReserve, 0.15)
  );

  const reactorReserve = Math.max(
    0,
    positive(input.reactorReserve, 0.15)
  );

  const moduleArea = positive(
    input.membraneModuleAreaM2,
    40
  );

  // Коэффициент максимальной неравномерности — по табл. 2 ҚМҚ 2.04.03-19
  // (п. 2.7) от среднего расхода; явно заданный peakFactor имеет приоритет.
  const peakFactor = positive(
    input.peakFactor,
    flow > 0 ? kMaxByDailyFlow(flow).kMax : 2.5
  );

  const sections = Math.max(
    1,
    Math.round(
      positive(input.sections, 2)
    )
  );

  // --------------------------------------------------
  // Гидравлика
  // --------------------------------------------------

  const qAverageM3H =
    flow > 0 ? flow / 24 : 0;

  const qPeakM3H =
    qAverageM3H * peakFactor;

  // --------------------------------------------------
  // Объём биореактора
  // --------------------------------------------------

  const reactorVolumeM3 =
    qAverageM3H * hrt;

  const reactorVolumeWithReserveM3 =
    reactorVolumeM3 *
    (1 + reactorReserve);

  // Объём одной секции рассчитываем
  // от фактического объёма с резервом.
const volumePerSectionM3 =
  reactorVolumeWithReserveM3 / sections;

  // --------------------------------------------------
  // Мембранный расчёт
  // --------------------------------------------------

  // Предварительный расчёт площади мембран
  // по пиковому расходу.
  const membraneAreaM2 =
    qPeakM3H * 1000 / flux;

  const membraneAreaWithReserveM2 =
    membraneAreaM2 *
    (1 + membraneReserve);

  // Количество мембранных модулей
  // округляется вверх до целого.
  const membraneModules = Math.max(
    1,
    Math.ceil(
      membraneAreaWithReserveM2 /
        moduleArea
    )
  );

  // --------------------------------------------------
  // Исходная нагрузка
  // --------------------------------------------------

  const bodLoadKgDay =
    flow *
    Math.max(0, input.bodMgL) /
    1000;

  const codLoadKgDay =
    flow *
    Math.max(0, input.codMgL) /
    1000;

  const tssLoadKgDay =
    flow *
    Math.max(0, input.tssMgL) /
    1000;

  // --------------------------------------------------
  // Предварительное удаление БПК
  // --------------------------------------------------

  // Скрининговое инженерное допущение.
  const removedBodKgDay =
    bodLoadKgDay * 0.95;

  // --------------------------------------------------
  // Предварительная потребность в кислороде
  // --------------------------------------------------

  const nitrogenLoadKgDay =
    flow *
    Math.max(0, input.nitrogenMgL) /
    1000;

  const oxygenKgDay =
    removedBodKgDay * 1.42 +
    nitrogenLoadKgDay * 4.57;

  // --------------------------------------------------
  // Предварительный расход воздуха
  // --------------------------------------------------

  // Фактическая передача кислорода воздухом — знаменатель ф. (70)
  // ҚМҚ 2.04.03-19 п. 6.156 (не 0,28 кг O₂/Нм³ — это полное содержание
  // кислорода в воздухе, усваивается лишь ~10 %). Для MBR глубина
  // погружения аэраторов принята 4 м, мелкопузырчатая аэрация.
  const airNm3H =
    oxygenKgDay /
    oxygenTransferKgPerNm3({ depthM: 4, fRatio: 0.2, tempC: 20 }) /
    24;

  return {
    qAverageM3H,
    qPeakM3H,

    bodLoadKgDay,
    removedBodKgDay,
    codLoadKgDay,
    tssLoadKgDay,

    reactorVolumeM3,
    reactorVolumeWithReserveM3,
    volumePerSectionM3,

    membraneFluxLMH: flux,
    membraneAreaM2,
    membraneAreaWithReserveM2,
    membraneModules,

    oxygenKgDay,
    airNm3H,
  };
}