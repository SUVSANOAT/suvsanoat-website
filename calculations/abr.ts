export type ABRCalculationInput = {
  flowM3Day: number;
  hrtHours?: number;

  bodMgL: number;
  codMgL: number;
  tssMgL: number;
  nitrogenMgL: number;
  phosphorusMgL: number;

  codRemoval?: number;
  chambers?: number;
  chamberVolumeShare?: number;
  reactorReserve?: number;

  gasYieldM3PerKgCodRemoved?: number;
  methaneFraction?: number;
};

export type ABRCalculationResult = {
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

  chambers: number;
  volumePerChamberM3: number;

  hrtHours: number;

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
 * Предварительный расчёт ABR.
 *
 * ABR моделируется как последовательность анаэробных камер.
 * Итоговый объём выбирается как максимум гидравлического и
 * органического ограничений, после чего распределяется по камерам.
 *
 * Коэффициенты являются предварительными инженерными допущениями.
 */
export function calculateABR(
  input: ABRCalculationInput
): ABRCalculationResult {
  const flow = Math.max(0, input.flowM3Day);

  const hrtHours = positive(input.hrtHours, 12);
  const chambers = Math.max(
    2,
    Math.round(positive(input.chambers, 6))
  );

  const reactorReserve = Math.max(
    0,
    positive(input.reactorReserve, 0.15)
  );

  // Предварительная объёмная органическая нагрузка по COD.
  const organicLoadingKgCodM3Day = 1.5;

  const qAverageM3H = flow / 24;
  const qPeakM3H = qAverageM3H * 1.5;

  const bodLoadKgDay =
    flow * Math.max(0, input.bodMgL) / 1000;

  const codLoadKgDay =
    flow * Math.max(0, input.codMgL) / 1000;

  const tssLoadKgDay =
    flow * Math.max(0, input.tssMgL) / 1000;

  const codRemoval = bounded(
    input.codRemoval,
    0.65,
    0,
    0.9
  );

  const codRemovedKgDay =
    codLoadKgDay * codRemoval;

  const codRemainingKgDay =
    Math.max(0, codLoadKgDay - codRemovedKgDay);

  const hydraulicVolumeM3 =
    qAverageM3H * hrtHours;

  const organicVolumeM3 =
    organicLoadingKgCodM3Day > 0
      ? codLoadKgDay / organicLoadingKgCodM3Day
      : 0;

  const reactorVolumeM3 =
    Math.max(
      hydraulicVolumeM3,
      organicVolumeM3
    );

  const reactorVolumeWithReserveM3 =
    reactorVolumeM3 * (1 + reactorReserve);

  const volumePerChamberM3 =
    reactorVolumeM3 / chambers;

  const gasYield =
    positive(
      input.gasYieldM3PerKgCodRemoved,
      0.30
    );

  const methaneFraction =
    bounded(
      input.methaneFraction,
      0.65,
      0.4,
      0.8
    );

  const biogasM3Day =
    codRemovedKgDay * gasYield;

  const methaneM3Day =
    biogasM3Day * methaneFraction;

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

    chambers,
    volumePerChamberM3,

    hrtHours,

    biogasM3Day,
    methaneM3Day,
    methaneFraction,
  };
}