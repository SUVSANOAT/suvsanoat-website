"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Equipment = {
  name: string;
  qty: string;
  note: string;
};

type FlowNonuniformity = {
  qLs: number;
  kMax: number | null;
  kMin: number | null;
  source: string;
  status: "normative" | "requires_kmk_2_04_01";
};

/**
 * КМК 2.04.03-19, таблица 2:
 * средний расход, л/с -> общий коэффициент неравномерности.
 * Для промежуточных значений применяется линейная интерполяция.
 * При Qср < 5 л/с КМК 2.04.03-19 отсылает к КМК 2.04.01-98,
 * поэтому коэффициент здесь намеренно НЕ выдумывается.
 */
const FLOW_NONUNIFORMITY_TABLE = [
  { q: 5, kMax: 2.5, kMin: 0.38 },
  { q: 10, kMax: 2.1, kMin: 0.45 },
  { q: 20, kMax: 1.9, kMin: 0.5 },
  { q: 50, kMax: 1.7, kMin: 0.55 },
  { q: 100, kMax: 1.6, kMin: 0.59 },
  { q: 300, kMax: 1.55, kMin: 0.62 },
  { q: 500, kMax: 1.5, kMin: 0.66 },
  { q: 1000, kMax: 1.47, kMin: 0.69 },
  { q: 5000, kMax: 1.44, kMin: 0.71 },
];

function interpolateFlowCoefficient(
  qLs: number,
  key: "kMax" | "kMin"
): number | null {
  if (!Number.isFinite(qLs) || qLs < 5) {
    return null;
  }

  if (qLs >= 5000) {
    return 1.44;
  }

  for (let i = 0; i < FLOW_NONUNIFORMITY_TABLE.length - 1; i += 1) {
    const a = FLOW_NONUNIFORMITY_TABLE[i];
    const b = FLOW_NONUNIFORMITY_TABLE[i + 1];

    if (qLs >= a.q && qLs <= b.q) {
      const t = (qLs - a.q) / (b.q - a.q);
      return a[key] + (b[key] - a[key]) * t;
    }
  }

  return null;
}

function calculateFlowNonuniformity(qAverageM3h: number): FlowNonuniformity {
  const qLs = qAverageM3h / 3.6;

  if (qLs < 5) {
    return {
      qLs,
      kMax: null,
      kMin: null,
      source: "КМК 2.04.03-19, п. 2.5, примечание 2 → требуется расчёт по КМК 2.04.01-98",
      status: "requires_kmk_2_04_01",
    };
  }

  return {
    qLs,
    kMax: interpolateFlowCoefficient(qLs, "kMax"),
    kMin: interpolateFlowCoefficient(qLs, "kMin"),
    source: "КМК 2.04.03-19, таблица 2; промежуточные значения — линейная интерполяция",
    status: "normative",
  };
}


/**
 * Предварительный технологический расчёт IFAS / MBBR.
 *
 * ВАЖНО:
 * КМК 2.04.03-19 не задаёт универсальные проектные константы для IFAS/MBBR
 * (fill fraction, SAA носителя, допустимую поверхностную нагрузку и т.п.).
 * Поэтому эти параметры ниже являются ИНЖЕНЕРНЫМИ ДОПУЩЕНИЯМИ для
 * предварительного подбора и должны заменяться данными выбранного носителя,
 * производителя, температуры и технологического расчёта.
 */
type BiofilmCalculation = {
  technology: "IFAS" | "MBBR";
  bodLoad: number;
  bodRemovalFraction: number;
  bodRemoved: number;
  fm: number | null;
  mlssKgM3: number | null;
  suspendedBiomassVolume: number | null;
  mediaFillFraction: number;
  mediaSpecificArea: number;
  mediaSurfaceLoading: number;
  mediaVolume: number | null;
  reactorVolume: number | null;
  reactorHrtHours: number | null;
  oxygenForBod: number;
  airRequirement: number;
  airRequirementWithReserve: number;
  diffusers: number;
  blowerWorking: number;
  blowerReserve: number;
  status: "preliminary" | "insufficient-data";
  notes: string[];
};

function calculateBiofilmProcess(
  technology: "IFAS" | "MBBR",
  qDay: number,
  bodMgL: number,
  nitrogenMgL: number
): BiofilmCalculation | null {
  if (!Number.isFinite(qDay) || qDay <= 0 || !Number.isFinite(bodMgL) || bodMgL <= 0) {
    return null;
  }

  // Preliminary design assumptions — NOT KМК requirements.
  const bodRemovalFraction = 0.90;
  const mediaFillFraction = technology === "MBBR" ? 0.50 : 0.40;
  const mediaSpecificArea = 500; // m² protected/nominal media volume — vendor dependent
  const mediaSurfaceLoading = technology === "MBBR" ? 5 : 3; // g BOD/m²·d — preliminary screening value
  const fm = technology === "IFAS" ? 0.15 : null; // kg BOD/(kg MLSS·d), preliminary
  const mlssKgM3 = technology === "IFAS" ? 3.0 : null; // 3000 mg/L, preliminary

  const bodLoad = (qDay * bodMgL) / 1000;
  const bodRemoved = bodLoad * bodRemovalFraction;

  // IFAS suspended-growth component. Final design must include SRT, MLSS,
  // endogenous respiration, nitrification and actual return sludge data.
  const suspendedBiomassVolume =
    technology === "IFAS" && fm && mlssKgM3
      ? bodLoad / (fm * mlssKgM3)
      : null;

  // Biofilm sizing by nominal protected surface area and preliminary areal loading.
  const mediaVolume =
    bodRemoved / ((mediaSurfaceLoading / 1000) * mediaSpecificArea);

  const reactorVolume = mediaVolume / mediaFillFraction;
  const reactorHrtHours = (reactorVolume / (qDay / 24));

  // Oxygen: preliminary BOD-only demand. Nitrogen is intentionally not converted
  // to nitrification oxygen because the input is total N, not verified NH4-N.
  const oxygenForBod = bodRemoved * 1.42;
  const oxygenTransferEfficiency = 0.12;
  const airKgO2PerM3 = 0.232 * 1.225; // O2 mass fraction × air density, approximate
  const airRequirement =
    oxygenForBod / (oxygenTransferEfficiency * airKgO2PerM3 * 24);
  const airRequirementWithReserve = airRequirement * 1.15;

  // Preliminary diffuser count: 8 m³/h nominal air per diffuser.
  const diffuserCapacity = 8;
  const diffusers = Math.max(4, Math.ceil(airRequirementWithReserve / diffuserCapacity));

  // Two working + one standby is retained as the preliminary reliability scheme.
  const blowerWorking = 2;
  const blowerReserve = 1;

  const notes = [
    "КМК 2.04.03-19 используется для гидравлической части; параметры IFAS/MBBR ниже не являются прямыми требованиями КМК.",
    `Принято предварительное удаление БПК₅ ${(bodRemovalFraction * 100).toFixed(0)}%.`,
    `Носитель: ${mediaSpecificArea} м²/м³; заполнение ${Math.round(mediaFillFraction * 100)}%; поверхностная нагрузка ${mediaSurfaceLoading} г БПК₅/м²·сут — требуется заменить на паспортные данные выбранного носителя.`,
    "Потребность в кислороде рассчитана только для удаления БПК₅. Азот в исходных данных не считается NH₄-N, поэтому нитрификационная потребность в O₂ отдельно не добавляется.",
    `Исходная концентрация азота: ${nitrogenMgL > 0 ? nitrogenMgL.toFixed(1) : "не задана"} мг/л. Для расчёта нитрификации требуется NH₄-N и температура воды.`,
  ];

  return {
    technology,
    bodLoad,
    bodRemovalFraction,
    bodRemoved,
    fm,
    mlssKgM3,
    suspendedBiomassVolume,
    mediaFillFraction,
    mediaSpecificArea,
    mediaSurfaceLoading,
    mediaVolume,
    reactorVolume,
    reactorHrtHours,
    oxygenForBod,
    airRequirement,
    airRequirementWithReserve,
    diffusers,
    blowerWorking,
    blowerReserve,
    status: "preliminary",
    notes,
  };
}


type SbrCalculation = {
  qDay: number;
  qAverage: number;
  qPeak: number | null;
  bodLoad: number;
  bodRemoved: number;
  cyclesPerDay: number;
  batchVolume: number;
  decantFraction: number;
  workingVolumePerReactor: number;
  totalWorkingVolume: number;
  reactorCount: number;
  hrtHours: number;
  cycleHours: number;
  fillHours: number;
  reactHours: number;
  settleHours: number;
  decantHours: number;
  idleHours: number;
  decanterFlow: number;
  oxygenForBod: number;
  airRequirementWithReserve: number;
  diffusers: number;
  blowerWorking: number;
  blowerReserve: number;
  status: "preliminary";
  notes: string[];
};

/**
 * Предварительный технологический расчёт SBR.
 *
 * КМК 2.04.03-19 используется для гидравлической части.
 * Цикл SBR, доля деканта, MLSS/SRT, аэрация и размеры реактора
 * требуют отдельного технологического расчёта и данных по качеству
 * очищенной воды. Поэтому значения ниже являются инженерными
 * допущениями, а не прямыми требованиями КМК.
 */
function calculateSbrProcess(
  qDay: number,
  bodMgL: number,
  qPeak: number | null,
): SbrCalculation | null {
  if (
    !Number.isFinite(qDay) ||
    qDay <= 0 ||
    !Number.isFinite(bodMgL) ||
    bodMgL <= 0
  ) {
    return null;
  }

  const qAverage = qDay / 24;
  const bodLoad = (qDay * bodMgL) / 1000;
  const bodRemovalFraction = 0.90;
  const bodRemoved = bodLoad * bodRemovalFraction;

  // Preliminary SBR operating assumptions — NOT KМК requirements.
  const cyclesPerDay = 4;
  const decantFraction = 0.33;
  const reactorCount = 2;

  const batchVolume = qDay / cyclesPerDay;
  const workingVolumePerReactor =
    batchVolume / decantFraction;
  const totalWorkingVolume =
    workingVolumePerReactor * reactorCount;

  const cycleHours = 24 / cyclesPerDay;

  // Preliminary phase allocation for a 6 h cycle.
  const fillHours = 1.0;
  const reactHours = 2.0;
  const settleHours = 1.0;
  const decantHours = 1.0;
  const idleHours =
    Math.max(0, cycleHours - fillHours - reactHours - settleHours - decantHours);

  const hrtHours =
    totalWorkingVolume / qAverage;

  const decanterFlow =
    batchVolume / decantHours;

  // Preliminary BOD-only oxygen demand.
  const oxygenForBod = bodRemoved * 1.42;
  const oxygenTransferEfficiency = 0.12;
  const airKgO2PerM3 = 0.232 * 1.225;

  const airRequirement =
    oxygenForBod /
    (oxygenTransferEfficiency * airKgO2PerM3 * 24);

  const airRequirementWithReserve =
    airRequirement * 1.15;

  const diffuserCapacity = 8;
  const diffusers = Math.max(
    4,
    Math.ceil(
      airRequirementWithReserve /
        diffuserCapacity,
    ),
  );

  const blowerWorking = 2;
  const blowerReserve = 1;

  const notes = [
    "КМК 2.04.03-19 используется для гидравлической части; параметры SBR ниже являются предварительными технологическими допущениями.",
    `Принято ${cyclesPerDay} цикла/сутки и ${reactorCount} рабочих SBR-реактора для предварительной компоновки.`,
    `Доля деканта принята ${(decantFraction * 100).toFixed(0)}% от рабочего объёма одного реактора. Требует проверки по выбранному декантеру и фактическому циклу.`,
    "Фазы цикла и их длительность являются предварительной схемой и должны быть уточнены по требованиям к нитрификации/денитрификации, температуре, MLSS, SRT и качеству очищенной воды.",
    "Потребность в кислороде рассчитана только по удалению БПК₅. Нитрификационная потребность не добавляется без подтверждённого NH₄-N и температуры.",
  ];

  return {
    qDay,
    qAverage,
    qPeak,
    bodLoad,
    bodRemoved,
    cyclesPerDay,
    batchVolume,
    decantFraction,
    workingVolumePerReactor,
    totalWorkingVolume,
    reactorCount,
    hrtHours,
    cycleHours,
    fillHours,
    reactHours,
    settleHours,
    decantHours,
    idleHours,
    decanterFlow,
    oxygenForBod,
    airRequirementWithReserve,
    diffusers,
    blowerWorking,
    blowerReserve,
    status: "preliminary",
    notes,
  };
}


/**
 * Предварительный технологический расчёт MBR.
 *
 * КМК 2.04.03-19 используется для гидравлической части.
 * Flux, MLSS, HRT, удельный расход воздуха на мембраны,
 * площадь одного мембранного модуля и другие мембранные
 * параметры должны подтверждаться паспортом выбранной мембраны
 * и отдельным технологическим расчётом.
 */
type MbrCalculation = {
  qDay: number;
  qAverage: number;
  qPeak: number | null;
  bodLoad: number;
  bodRemoved: number;
  reactorHrtHours: number;
  reactorVolume: number;
  reactorVolumeWithReserve: number;
  mlssKgM3: number;
  fluxLm2h: number;
  membraneArea: number;
  membraneAreaWithReserve: number;
  moduleArea: number;
  workingModules: number;
  reserveModules: number;
  totalModules: number;
  permeateFlow: number;
  permeatePumpWorking: number;
  permeatePumpReserve: number;
  pumpCapacityPerUnit: number;
  membraneAirRate: number;
  membraneAirRequirement: number;
  membraneAirWithReserve: number;
  membraneBlowerWorking: number;
  membraneBlowerReserve: number;
  cipRequired: boolean;
  status: "preliminary" | "insufficient-data";
  notes: string[];
};

function calculateMbrProcess(
  qDay: number,
  bodMgL: number,
  qPeak: number | null,
  codMgL: number,
  tssMgL: number,
  nitrogenMgL: number,
): MbrCalculation | null {
  if (
    !Number.isFinite(qDay) ||
    qDay <= 0 ||
    !Number.isFinite(bodMgL) ||
    bodMgL <= 0
  ) {
    return null;
  }

  const qAverage = qDay / 24;
  const bodLoad = (qDay * bodMgL) / 1000;
  const bodRemovalFraction = 0.90;
  const bodRemoved = bodLoad * bodRemovalFraction;

  // Preliminary biological assumptions — NOT direct KМК requirements.
  const reactorHrtHours = 8;
  const reactorVolume = qAverage * reactorHrtHours;
  const reactorVolumeWithReserve = reactorVolume * 1.10;
  const mlssKgM3 = 8.0;

  // Preliminary membrane assumptions — vendor dependent.
  const fluxLm2h = 15;
  const membraneArea = (qAverage * 1000) / fluxLm2h;
  const membraneReserveFraction = 0.15;
  const membraneAreaWithReserve =
    membraneArea * (1 + membraneReserveFraction);

  // The module area must be replaced by the selected membrane manufacturer's
  // actual module capacity.
  const moduleArea = 100;
  const workingModules = Math.max(
    1,
    Math.ceil(membraneArea / moduleArea),
  );
  const totalModules = Math.max(
    workingModules + 1,
    Math.ceil(membraneAreaWithReserve / moduleArea),
  );
  const reserveModules = totalModules - workingModules;

  const permeateFlow = qAverage;
  const permeatePumpWorking = 2;
  const permeatePumpReserve = 1;
  const pumpCapacityPerUnit =
    permeateFlow / permeatePumpWorking;

  // Preliminary membrane scour-air assumption.
  // This is not a KМК value and must be checked against the selected membrane.
  const membraneAirRate = 0.20; // Nm³/m²·h
  const membraneAirRequirement =
    membraneAreaWithReserve * membraneAirRate;
  const membraneAirWithReserve =
    membraneAirRequirement * 1.15;

  const membraneBlowerWorking = 2;
  const membraneBlowerReserve = 1;

  const notes = [
    "КМК 2.04.03-19 используется для гидравлической части; мембранные параметры ниже не являются прямыми требованиями КМК.",
    `Принят предварительный HRT биореактора ${reactorHrtHours} ч; окончательный объём должен подтверждаться расчётом по БПК₅, NH₄-N/TN, температуре, MLSS, SRT и требуемому качеству очищенной воды.`,
    `Принят flux ${fluxLm2h} л/(м²·ч). Это предварительное инженерное допущение; фактический flux должен быть взят из паспорта выбранной мембраны с учётом температуры, качества стока и режима эксплуатации.`,
    `Площадь одного модуля ${moduleArea} м² является условным расчётным значением. Количество модулей обязательно пересчитать по фактической площади/производительности конкретного мембранного модуля.`,
    `Воздух для мембран принят ${membraneAirRate} Нм³/(м²·ч) как предварительное допущение. Требуется подтверждение производителем мембран и расчёт по фактической глубине, типу мембраны и режиму scouring.`,
    `Входные концентрации: ХПК ${codMgL > 0 ? codMgL.toFixed(1) : "не задана"} мг/л, TSS ${tssMgL > 0 ? tssMgL.toFixed(1) : "не задана"} мг/л, общий азот ${nitrogenMgL > 0 ? nitrogenMgL.toFixed(1) : "не задан"} мг/л. Для нитрификации требуется подтверждённый NH₄-N.`,
    "CIP предусмотрен как обязательная сервисная система MBR; химия, объём и режим CIP выбираются по паспорту конкретной мембраны.",
  ];

  return {
    qDay,
    qAverage,
    qPeak,
    bodLoad,
    bodRemoved,
    reactorHrtHours,
    reactorVolume,
    reactorVolumeWithReserve,
    mlssKgM3,
    fluxLm2h,
    membraneArea,
    membraneAreaWithReserve,
    moduleArea,
    workingModules,
    reserveModules,
    totalModules,
    permeateFlow,
    permeatePumpWorking,
    permeatePumpReserve,
    pumpCapacityPerUnit,
    membraneAirRate,
    membraneAirRequirement,
    membraneAirWithReserve,
    membraneBlowerWorking,
    membraneBlowerReserve,
    cipRequired: true,
    status: "preliminary",
    notes,
  };
}


type AnbrMbrCalculation = {
  qDay: number;
  qAverage: number;
  bodLoadIn: number;
  bodRemovedAnbr: number;
  bodLoadToMbr: number;
  anbrRemovalFraction: number;
  anbrHrtHours: number;
  anbrVolume: number;
  anbrVolumeWithReserve: number;
  mbrHrtHours: number;
  mbrVolume: number;
  mbrVolumeWithReserve: number;
  mbrFluxLm2h: number;
  membraneArea: number;
  membraneAreaWithReserve: number;
  moduleArea: number;
  workingModules: number;
  reserveModules: number;
  totalModules: number;
  permeatePumpWorking: number;
  permeatePumpReserve: number;
  pumpCapacityPerUnit: number;
  membraneAirRate: number;
  membraneAirRequirement: number;
  membraneAirWithReserve: number;
  blowerWorking: number;
  blowerReserve: number;
  biogasYield: number;
  biogasEstimate: number;
  status: "preliminary";
  notes: string[];
};

function calculateAnbrMbrProcess(
  qDay: number,
  bodMgL: number,
  qPeak: number | null,
): AnbrMbrCalculation | null {
  if (!Number.isFinite(qDay) || qDay <= 0 || !Number.isFinite(bodMgL) || bodMgL <= 0) {
    return null;
  }

  const qAverage = qDay / 24;
  const bodLoadIn = (qDay * bodMgL) / 1000;

  // Preliminary anaerobic assumptions. These are NOT direct KMK requirements.
  const anbrRemovalFraction = 0.60;
  const anbrHrtHours = 10;
  const anbrVolume = qAverage * anbrHrtHours;
  const anbrVolumeWithReserve = anbrVolume * 1.10;
  const bodRemovedAnbr = bodLoadIn * anbrRemovalFraction;
  const bodLoadToMbr = Math.max(0, bodLoadIn - bodRemovedAnbr);

  // Preliminary MBR assumptions; replace with vendor/process data.
  const mbrHrtHours = 8;
  const mbrVolume = qAverage * mbrHrtHours;
  const mbrVolumeWithReserve = mbrVolume * 1.10;
  const mbrFluxLm2h = 15;
  const membraneArea = (qAverage * 1000) / mbrFluxLm2h;
  const membraneAreaWithReserve = membraneArea * 1.15;
  const moduleArea = 100;
  const workingModules = Math.max(1, Math.ceil(membraneArea / moduleArea));
  const totalModules = Math.max(
    workingModules + 1,
    Math.ceil(membraneAreaWithReserve / moduleArea),
  );
  const reserveModules = totalModules - workingModules;

  const permeatePumpWorking = 2;
  const permeatePumpReserve = 1;
  const pumpCapacityPerUnit = qAverage / permeatePumpWorking;

  const membraneAirRate = 0.20;
  const membraneAirRequirement = membraneAreaWithReserve * membraneAirRate;
  const membraneAirWithReserve = membraneAirRequirement * 1.15;
  const blowerWorking = 2;
  const blowerReserve = 1;

  // Preliminary biogas estimate only. Actual gas yield requires substrate,
  // temperature, sulfate and methane-yield verification.
  const biogasYield = 0.35;
  const biogasEstimate = bodRemovedAnbr * biogasYield;

  const notes = [
    "ANBR removal fraction 60% is a preliminary engineering assumption, not a direct KMK value.",
    `ANBR HRT ${anbrHrtHours} h is preliminary and must be verified against temperature, biodegradability, alkalinity, sulfate and target effluent quality.`,
    `The MBR receives an estimated BOD load of ${bodLoadToMbr.toFixed(2)} kg/day after the preliminary ANBR removal assumption.`,
    `MBR flux ${mbrFluxLm2h} L/(m²·h) and module area ${moduleArea} m² are placeholders until the selected membrane manufacturer's data are entered.`,
    `Biogas ${biogasEstimate.toFixed(1)} Nm³/day is only a preliminary estimate using ${biogasYield} Nm³/kg removed BOD; it is not a guaranteed methane/biogas yield.`,
    qPeak !== null
      ? `Hydraulic peak flow from the normative module: ${qPeak.toFixed(2)} m³/h.`
      : "Hydraulic peak flow is unavailable; complete the normative flow calculation first.",
  ];

  return {
    qDay,
    qAverage,
    bodLoadIn,
    bodRemovedAnbr,
    bodLoadToMbr,
    anbrRemovalFraction,
    anbrHrtHours,
    anbrVolume,
    anbrVolumeWithReserve,
    mbrHrtHours,
    mbrVolume,
    mbrVolumeWithReserve,
    mbrFluxLm2h,
    membraneArea,
    membraneAreaWithReserve,
    moduleArea,
    workingModules,
    reserveModules,
    totalModules,
    permeatePumpWorking,
    permeatePumpReserve,
    pumpCapacityPerUnit,
    membraneAirRate,
    membraneAirRequirement,
    membraneAirWithReserve,
    blowerWorking,
    blowerReserve,
    biogasYield,
    biogasEstimate,
    status: "preliminary",
    notes,
  };
}

const equipmentByTechnology: Record<string, Equipment[]> = {
  ANBR_MBR: [
    { name: "Приёмная камера", qty: "1 шт.", note: "Приём сточных вод" },
    { name: "Механическая решётка", qty: "1 рабочая + 1 резервная", note: "Защита последующих ступеней" },
    { name: "Усреднительная ёмкость", qty: "1 компл.", note: "Выравнивание расхода и нагрузки" },
    { name: "ANBR-реактор", qty: "1 компл.", note: "Предварительная анаэробная ступень" },
    { name: "Газовая система", qty: "1 компл.", note: "Сбор и безопасный отвод биогаза" },
    { name: "MBR-биореактор", qty: "1 компл.", note: "Аэробная биологическая очистка после ANBR" },
    { name: "Мембранный блок", qty: "по расчёту", note: "Финишное мембранное разделение" },
    { name: "Пермеатные насосы", qty: "2 рабочих + 1 резервный", note: "Отвод очищенной воды" },
    { name: "Воздуходувки", qty: "2 рабочих + 1 резервная", note: "Аэрация и мембранный scouring" },
    { name: "CIP-система", qty: "1 компл.", note: "Химическая промывка мембран" },
    { name: "Обеззараживание", qty: "1 компл.", note: "Финишная обработка очищенной воды" },
  ],
  ANBR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём и выравнивание потока",
    },
    {
      name: "Механическая решётка",
      qty: "1 рабочая + 1 резервная",
      note: "Удаление крупных примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание расхода и состава сточных вод",
    },
    {
      name: "ANBR-реактор",
      qty: "1 компл.",
      note: "Анаэробная биологическая очистка",
    },
    {
      name: "Насосная группа",
      qty: "2 рабочих + 1 резервный",
      note: "Перекачка между технологическими ступенями",
    },
    {
      name: "Система отвода газа",
      qty: "1 компл.",
      note: "Сбор и безопасный отвод биогаза",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка очищенной воды",
    },
  ],

  UASB: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём и усреднение стока",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Удаление крупных примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание гидравлической нагрузки",
    },
    {
      name: "UASB-реактор",
      qty: "1 компл.",
      note: "Анаэробный реактор восходящего потока",
    },
    {
      name: "Насосная группа",
      qty: "2 рабочих + 1 резервный",
      note: "Подача и рециркуляция",
    },
    {
      name: "Газовая система",
      qty: "1 компл.",
      note: "Сбор и отвод биогаза",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка",
    },
  ],

  ABR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём сточных вод",
    },
    {
      name: "Механическая очистка",
      qty: "1 компл.",
      note: "Удаление грубых примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание потока",
    },
    {
      name: "ABR-реактор",
      qty: "1 компл.",
      note: "Последовательные анаэробные камеры",
    },
    {
      name: "Насосная группа",
      qty: "2 рабочих + 1 резервный",
      note: "Перемещение потока",
    },
    {
      name: "Газовая система",
      qty: "1 компл.",
      note: "Отвод образующегося газа",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная стадия",
    },
  ],

  AnMBR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём и усреднение",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Защита последующего оборудования",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание гидравлической нагрузки",
    },
    {
      name: "Анаэробный реактор",
      qty: "1 компл.",
      note: "Биологическая очистка без подачи воздуха",
    },
    {
      name: "Мембранный модуль",
      qty: "1 компл.",
      note: "Разделение очищенной воды и биомассы",
    },
    {
      name: "Насосная группа",
      qty: "2 рабочих + 1 резервный",
      note: "Подача и рециркуляция",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка",
    },
  ],

  IFAS: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём сточных вод",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Удаление крупных примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание гидравлической нагрузки",
    },
    {
      name: "IFAS-реактор",
      qty: "1 компл.",
      note: "Активный ил + прикреплённая биомасса",
    },
    {
      name: "Носители биоплёнки",
      qty: "по расчёту",
      note: "Подвижная загрузка для прикреплённой биомассы",
    },
    {
      name: "Мелкопузырчатая аэрация",
      qty: "по расчёту",
      note: "Распределение воздуха в аэробной зоне",
    },
    {
      name: "Воздуходувная система",
      qty: "2 рабочих + 1 резервная",
      note: "Подача воздуха в аэробную зону",
    },
    {
      name: "Вторичное разделение",
      qty: "1 компл.",
      note: "Разделение очищенной воды и активного ила",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная стадия",
    },
  ],

  AS: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём и усреднение",
    },
    {
      name: "Механическая очистка",
      qty: "1 компл.",
      note: "Удаление грубых примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание потока",
    },
    {
      name: "Аэротенк",
      qty: "1 компл.",
      note: "Биологическая очистка активным илом",
    },
    {
      name: "Воздуходувки",
      qty: "2 рабочих + 1 резервная",
      note: "Подача воздуха",
    },
    {
      name: "Вторичный отстойник",
      qty: "1 компл.",
      note: "Отделение активного ила",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка воды",
    },
  ],

  MBBR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём сточных вод",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Удаление крупных примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание гидравлической нагрузки",
    },
    {
      name: "MBBR-реактор",
      qty: "1 компл.",
      note: "Биоплёнка на подвижной загрузке",
    },
    {
      name: "Носители биоплёнки",
      qty: "по расчёту",
      note: "Подвижная загрузка для биологической очистки",
    },
    {
      name: "Мелкопузырчатая аэрация",
      qty: "по расчёту",
      note: "Распределение воздуха в реакторе",
    },
    {
      name: "Воздуходувки",
      qty: "2 рабочих + 1 резервная",
      note: "Аэрация реактора",
    },
    {
      name: "Система удержания загрузки",
      qty: "1 компл.",
      note: "Удержание носителей внутри реактора",
    },
    {
      name: "Вторичное разделение",
      qty: "1 компл.",
      note: "Отделение очищенной воды от взвеси",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная стадия",
    },
  ],

  SBR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём сточных вод",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Удаление грубых примесей",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание подачи в SBR",
    },
    {
      name: "SBR-реактор",
      qty: "2 компл.",
      note: "Циклическая биологическая очистка",
    },
    {
      name: "Воздуходувки",
      qty: "2 рабочих + 1 резервная",
      note: "Аэрация",
    },
    {
      name: "Декантер",
      qty: "2 шт.",
      note: "Отвод очищенной воды после цикла",
    },
    {
      name: "Насос очищенной воды",
      qty: "2 рабочих + 1 резервный",
      note: "Отвод после цикла",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка",
    },
  ],

  MBR: [
    {
      name: "Приёмная камера",
      qty: "1 шт.",
      note: "Приём и усреднение сточных вод",
    },
    {
      name: "Механическая очистка",
      qty: "1 рабочая + 1 резервная",
      note: "Защита мембранного оборудования",
    },
    {
      name: "Усреднительная ёмкость",
      qty: "1 компл.",
      note: "Выравнивание гидравлической нагрузки",
    },
    {
      name: "MBR-реактор",
      qty: "1 компл.",
      note: "Биологическая очистка",
    },
    {
      name: "Воздуходувки",
      qty: "2 рабочих + 1 резервная",
      note: "Аэрация и поддержание процесса",
    },
    {
      name: "Мембранный блок",
      qty: "1 компл.",
      note: "Мембранное разделение",
    },
    {
      name: "Насос пермеата",
      qty: "2 рабочих + 1 резервный",
      note: "Отвод очищенной воды через мембраны",
    },
    {
      name: "Система обратной промывки",
      qty: "1 компл.",
      note: "Поддержание работоспособности мембран",
    },
    {
      name: "Обеззараживание",
      qty: "1 компл.",
      note: "Финишная обработка очищенной воды",
    },
  ],
};

type DesignParameters = {
  equalizationHours: number;
  biologicalHours: number;
};

const designParameters: Record<string, DesignParameters> = {
  ANBR_MBR: { equalizationHours: 6, biologicalHours: 20 },
  ANBR: {
    equalizationHours: 6,
    biologicalHours: 12,
  },
  UASB: {
    equalizationHours: 6,
    biologicalHours: 10,
  },
  ABR: {
    equalizationHours: 6,
    biologicalHours: 12,
  },
  AnMBR: {
    equalizationHours: 6,
    biologicalHours: 12,
  },
  IFAS: {
    equalizationHours: 6,
    biologicalHours: 8,
  },
  AS: {
    equalizationHours: 6,
    biologicalHours: 8,
  },
  MBBR: {
    equalizationHours: 6,
    biologicalHours: 8,
  },
  SBR: {
    equalizationHours: 6,
    biologicalHours: 8,
  },
  MBR: {
    equalizationHours: 6,
    biologicalHours: 8,
  },
};

function EquipmentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EquipmentContent />
    </Suspense>
  );
}

export default EquipmentPage;

function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06151d",
        color: "#f5f8fa",
        padding: "70px 24px 100px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            color: "#00d9ff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.18em",
            marginBottom: 18,
          }}
        >
          ИНЖЕНЕРНЫЙ РАСЧЁТ
        </div>

        <h1
          style={{
            fontSize: "clamp(38px, 6vw, 70px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Загрузка
          <br />
          оборудования...
        </h1>
      </div>
    </main>
  );
}

function EquipmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "Объект";
  const flow = searchParams.get("flow") || "";
  const people = searchParams.get("people") || "";
  const hours = searchParams.get("hours") || "";
  const technology = searchParams.get("technology") || "";

  const bod = Number(searchParams.get("bod") || 0);
  const cod = Number(searchParams.get("cod") || 0);
  const tss = Number(searchParams.get("tss") || 0);
  const nitrogen = Number(searchParams.get("nitrogen") || 0);
  const phosphorus = Number(searchParams.get("phosphorus") || 0);

  useEffect(() => {
    if (technology) return;

    const params = new URLSearchParams();

    const keys = [
      "object",
      "flow",
      "people",
      "hours",
      "bod",
      "cod",
      "tss",
      "nitrogen",
      "phosphorus",
    ];

    keys.forEach((key) => {
      const value = searchParams.get(key);

      if (value !== null && value !== "") {
        params.set(key, value);
      }
    });

    const query = params.toString();

    router.replace(
      query
        ? `/engineering/analysis/technology?${query}`
        : "/engineering/analysis/technology"
    );
  }, [technology, router, searchParams]);

  const hydraulicCalculation = useMemo(() => {
    const qDay = Number(flow);

    if (!Number.isFinite(qDay) || qDay <= 0) {
      return null;
    }

    const parameters =
      designParameters[technology] || {
        equalizationHours: 6,
        biologicalHours: 8,
      };

    const qAverage = qDay / 24;
    const nonuniformity = calculateFlowNonuniformity(qAverage);

    const qPeak =
      nonuniformity.kMax !== null
        ? qAverage * nonuniformity.kMax
        : null;

    const qMin =
      nonuniformity.kMin !== null
        ? qAverage * nonuniformity.kMin
        : null;

    const equalizationVolume =
      qAverage * parameters.equalizationHours;

    const biologicalVolume =
      qAverage * parameters.biologicalHours;

    const biologicalVolumeWithReserve =
      biologicalVolume * 1.1;

    return {
      qDay,
      qAverage,
      qPeak,
      qMin,
      qAverageLs: nonuniformity.qLs,
      kMax: nonuniformity.kMax,
      kMin: nonuniformity.kMin,
      nonuniformityStatus: nonuniformity.status,
      nonuniformitySource: nonuniformity.source,
      equalizationVolume,
      biologicalVolume,
      biologicalVolumeWithReserve,
      equalizationHours: parameters.equalizationHours,
      biologicalHours: parameters.biologicalHours,
    };
  }, [flow, technology]);

  const pollutantLoads = useMemo(() => {
    const qDay = Number(flow);

    if (!Number.isFinite(qDay) || qDay <= 0) {
      return null;
    }

    return {
      bodLoad: (qDay * bod) / 1000,
      codLoad: (qDay * cod) / 1000,
      tssLoad: (qDay * tss) / 1000,
      nitrogenLoad: (qDay * nitrogen) / 1000,
      phosphorusLoad: (qDay * phosphorus) / 1000,
    };
  }, [
    flow,
    bod,
    cod,
    tss,
    nitrogen,
    phosphorus,
  ]);

  const anbrMbrCalculation = useMemo(() => {
    if (technology !== "ANBR_MBR") {
      return null;
    }

    return calculateAnbrMbrProcess(
      Number(flow),
      bod,
      hydraulicCalculation?.qPeak ?? null,
    );
  }, [technology, flow, bod, hydraulicCalculation]);

  const biofilmCalculation = useMemo(() => {
    if (technology !== "IFAS" && technology !== "MBBR") {
      return null;
    }

    const qDay = Number(flow);
    return calculateBiofilmProcess(
      technology,
      qDay,
      bod,
      nitrogen
    );
  }, [technology, flow, bod, nitrogen]);

  const sbrCalculation = useMemo(() => {
    if (technology !== "SBR") {
      return null;
    }

    return calculateSbrProcess(
      Number(flow),
      bod,
      hydraulicCalculation?.qPeak ?? null,
    );
  }, [technology, flow, bod, hydraulicCalculation]);

  const mbrCalculation = useMemo(() => {
    if (technology !== "MBR") {
      return null;
    }

    return calculateMbrProcess(
      Number(flow),
      bod,
      hydraulicCalculation?.qPeak ?? null,
      cod,
      tss,
      nitrogen,
    );
  }, [
    technology,
    flow,
    bod,
    cod,
    tss,
    nitrogen,
    hydraulicCalculation,
  ]);

  const pumpCalculation = useMemo(() => {
    if (!hydraulicCalculation || hydraulicCalculation.qPeak === null) {
      return null;
    }

    const workingPumps = 2;
    const reservePumps = 1;
    const capacityPerPump =
      hydraulicCalculation.qPeak / workingPumps;

    return {
      requiredCapacity: hydraulicCalculation.qPeak,
      workingPumps,
      reservePumps,
      capacityPerPump,
    };
  }, [hydraulicCalculation]);

  const handleBack = () => {
    const params = new URLSearchParams();

    const keys = [
      "object",
      "flow",
      "people",
      "hours",
      "bod",
      "cod",
      "tss",
      "nitrogen",
      "phosphorus",
    ];

    keys.forEach((key) => {
      const value = searchParams.get(key);

      if (value !== null && value !== "") {
        params.set(key, value);
      }
    });

    router.push(
      `/engineering/analysis/technology?${params.toString()}`
    );
  };

  const handleFinish = () => {
    const params = new URLSearchParams();

    const keys = [
      "object",
      "flow",
      "people",
      "hours",
      "bod",
      "cod",
      "tss",
      "nitrogen",
      "phosphorus",
    ];

    keys.forEach((key) => {
      const value = searchParams.get(key);

      if (value !== null && value !== "") {
        params.set(key, value);
      }
    });

    params.set("technology", technology);

    router.push(
      `/engineering/analysis/complete?${params.toString()}`
    );
  };

  const equipment = useMemo<Equipment[]>(() => {
    const base = equipmentByTechnology[technology] || [];

    return base.map((item) => {
      let qty = item.qty;
      let note = item.note;

      // =========================================================
      // ОБЩИЕ РАСЧЁТНЫЕ ПАРАМЕТРЫ
      // =========================================================

      if (item.name === "Насосная группа" && pumpCalculation) {
        qty = `${pumpCalculation.workingPumps} рабочих + ${pumpCalculation.reservePumps} резервный`;
        note = `Расчётная подача одного насоса ${pumpCalculation.capacityPerPump.toFixed(2)} м³/ч`;
      }

      if (item.name === "Насос очищенной воды" && pumpCalculation) {
        qty = `${pumpCalculation.workingPumps} рабочих + ${pumpCalculation.reservePumps} резервный`;
        note = `Расчётная подача одного насоса ${pumpCalculation.capacityPerPump.toFixed(2)} м³/ч`;
      }

      // =========================================================
      // MBR
      // =========================================================

      if (technology === "MBR" && mbrCalculation) {
        if (item.name === "MBR-реактор") {
          qty = "1 компл.";
          note = `Рабочий объём ${mbrCalculation.reactorVolumeWithReserve.toFixed(1)} м³; HRT ${mbrCalculation.reactorHrtHours.toFixed(1)} ч`;
        }

        if (item.name === "Мембранный блок") {
          qty = `${mbrCalculation.workingModules} рабочих + ${mbrCalculation.reserveModules} резервных модулей`;
          note = `Расчётная площадь ${mbrCalculation.membraneAreaWithReserve.toFixed(1)} м²; flux ${mbrCalculation.fluxLm2h.toFixed(1)} л/м²·ч`;
        }

        if (item.name === "Насос пермеата") {
          qty = `${mbrCalculation.permeatePumpWorking} рабочих + ${mbrCalculation.permeatePumpReserve} резервный`;
          note = `Подача одного насоса ${mbrCalculation.pumpCapacityPerUnit.toFixed(2)} м³/ч`;
        }

        if (item.name === "Воздуходувки") {
          qty = `${mbrCalculation.membraneBlowerWorking} рабочих + ${mbrCalculation.membraneBlowerReserve} резервная`;
          note = `Воздух на мембраны ${mbrCalculation.membraneAirWithReserve.toFixed(1)} Нм³/ч`;
        }

        if (item.name === "Система обратной промывки") {
          qty = "1 компл.";
          note = "Система поддержания работоспособности мембран";
        }
      }

      // =========================================================
      // ANBR + MBR
      // =========================================================

      if (technology === "ANBR_MBR" && anbrMbrCalculation) {
        if (item.name === "ANBR-реактор") {
          qty = "1 компл.";
          note = `Рабочий объём ${anbrMbrCalculation.anbrVolumeWithReserve.toFixed(1)} м³; HRT ${anbrMbrCalculation.anbrHrtHours.toFixed(1)} ч`;
        }

        if (item.name === "MBR-биореактор") {
          qty = "1 компл.";
          note = `Рабочий объём ${anbrMbrCalculation.mbrVolumeWithReserve.toFixed(1)} м³; HRT ${anbrMbrCalculation.mbrHrtHours.toFixed(1)} ч`;
        }

        if (item.name === "Мембранный блок") {
          qty = `${anbrMbrCalculation.workingModules} рабочих + ${anbrMbrCalculation.reserveModules} резервных модулей`;
          note = `Площадь мембран ${anbrMbrCalculation.membraneAreaWithReserve.toFixed(1)} м²; flux ${anbrMbrCalculation.mbrFluxLm2h.toFixed(1)} л/м²·ч`;
        }

        if (item.name === "Пермеатные насосы") {
          qty = `${anbrMbrCalculation.permeatePumpWorking} рабочих + ${anbrMbrCalculation.permeatePumpReserve} резервный`;
          note = `Подача одного насоса ${anbrMbrCalculation.pumpCapacityPerUnit.toFixed(2)} м³/ч`;
        }

        if (item.name === "Воздуходувки") {
          qty = `${anbrMbrCalculation.blowerWorking} рабочих + ${anbrMbrCalculation.blowerReserve} резервная`;
          note = `Воздух на мембраны ${anbrMbrCalculation.membraneAirWithReserve.toFixed(1)} Нм³/ч`;
        }

        if (item.name === "Газовая система") {
          qty = "1 компл.";
          note = `Предварительная оценка биогаза ${anbrMbrCalculation.biogasEstimate.toFixed(1)} Нм³/сут`;
        }
      }

      // =========================================================
      // IFAS / MBBR
      // =========================================================

      if (
        (technology === "IFAS" || technology === "MBBR") &&
        biofilmCalculation
      ) {
        if (
          item.name === "IFAS-реактор" ||
          item.name === "MBBR-реактор"
        ) {
          qty = "1 компл.";
          note = `Расчётный объём ${biofilmCalculation.reactorVolume?.toFixed(1) ?? "Н/Д"} м³; HRT ${biofilmCalculation.reactorHrtHours?.toFixed(2) ?? "Н/Д"} ч`;
        }

        if (item.name === "Носители биоплёнки") {
          qty = `${biofilmCalculation.mediaVolume?.toFixed(1) ?? "Н/Д"} м³`;
          note = `Заполнение ${Math.round(biofilmCalculation.mediaFillFraction * 100)}%; удельная поверхность ${biofilmCalculation.mediaSpecificArea} м²/м³`;
        }

        if (item.name === "Воздуходувная система") {
          qty = `${biofilmCalculation.blowerWorking} рабочих + ${biofilmCalculation.blowerReserve} резервная`;
          note = `Расход воздуха ${biofilmCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`;
        }

        if (item.name === "Воздуходувки") {
          qty = `${biofilmCalculation.blowerWorking} рабочих + ${biofilmCalculation.blowerReserve} резервная`;
          note = `Расход воздуха ${biofilmCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`;
        }

        if (item.name === "Система удержания загрузки") {
          qty = "1 компл.";
          note = `Для расчётного объёма носителя ${biofilmCalculation.mediaVolume?.toFixed(1) ?? "Н/Д"} м³`;
        }

        if (item.name === "Мелкопузырчатая аэрация") {
          qty = `${biofilmCalculation.diffusers} шт.`;
          note = `Расчётный расход воздуха ${biofilmCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`;
        }
      }

      // =========================================================
      // SBR
      // =========================================================

      if (technology === "SBR" && sbrCalculation) {
        if (item.name === "SBR-реактор") {
          qty = `${sbrCalculation.reactorCount} компл.`;
          note = `Рабочий объём одного реактора ${sbrCalculation.workingVolumePerReactor.toFixed(1)} м³`;
        }

        if (item.name === "Декантер") {
          qty = `${sbrCalculation.reactorCount} шт.`;
          note = `Производительность одного декантера ${sbrCalculation.decanterFlow.toFixed(1)} м³/ч`;
        }

        if (item.name === "Воздуходувки") {
          qty = `${sbrCalculation.blowerWorking} рабочих + ${sbrCalculation.blowerReserve} резервная`;
          note = `Воздух ${sbrCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`;
        }
      }

      return {
        ...item,
        qty,
        note,
      };
    });
  }, [
    technology,
    pumpCalculation,
    mbrCalculation,
    anbrMbrCalculation,
    biofilmCalculation,
    sbrCalculation,
  ]);

  if (!technology) {
    return <Loading />;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06151d",
        color: "#f5f8fa",
        padding: "38px 24px 100px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* =========================================================
            SUVSANOAT — OFFICIAL BRAND HEADER
            ========================================================= */}
        <header
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #174454",
            background: "#071b24",
            borderRadius: 14,
            padding: "18px 24px",
            marginBottom: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minWidth: 240,
            }}
          >
            <img
              src="/suvsanoat-logo.png"
              alt="Suvsanoat Engineering Systems"
              style={{
                display: "block",
                width: "auto",
                height: 62,
                maxWidth: "100%",
                objectFit: "contain",
              }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/logo.png";
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 18,
              flexWrap: "wrap",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <a
              href="https://www.suvsanoat.uz"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#00d9ff",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              www.suvsanoat.uz
            </a>

            <a
              href="tel:+998773043400"
              style={{
                color: "#b7cbd3",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              +998 77 304 34 00
            </a>

            <a
              href="mailto:suvsanoat@gmail.com"
              style={{
                color: "#b7cbd3",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              suvsanoat@gmail.com
            </a>
          </div>
        </header>

        <button
          type="button"
          onClick={handleBack}
          style={{
            border: 0,
            background: "transparent",
            color: "#dce8ee",
            fontSize: 16,
            cursor: "pointer",
            padding: 0,
            marginBottom: 18,
          }}
        >
          ← Назад
        </button>

        <div
          style={{
            color: "#00d9ff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.18em",
            marginBottom: 18,
          }}
        >
          ШАГ 04 / ОБОРУДОВАНИЕ
        </div>

        <div
          style={{
            color: "#829daa",
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          Объект:{" "}
          <strong style={{ color: "#00d9ff" }}>
            {object}
          </strong>
        </div>

        {people && (
          <div
            style={{
              color: "#829daa",
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Расчётное количество людей:{" "}
            <strong style={{ color: "#f5f8fa" }}>
              {people}
            </strong>
          </div>
        )}

        {hours && (
          <div
            style={{
              color: "#829daa",
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Продолжительность работы:{" "}
            <strong style={{ color: "#f5f8fa" }}>
              {hours} ч/сут
            </strong>
          </div>
        )}

        {flow && (
          <div
            style={{
              color: "#829daa",
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            Расчётный расход:{" "}
            <strong style={{ color: "#f5f8fa" }}>
              {flow} м³/сутки
            </strong>
          </div>
        )}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            border: "1px solid #14566a",
            background: "#08222c",
            color: "#00d9ff",
            fontWeight: 800,
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          ТЕХНОЛОГИЯ: {technology}
        </div>

        <h1
          style={{
            fontSize: "clamp(38px, 6vw, 70px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: "0 0 24px",
          }}
        >
          Расчёт и оборудование
        </h1>

        <p
          style={{
            maxWidth: 850,
            color: "#8da5b1",
            fontSize: 18,
            lineHeight: 1.7,
            margin: "0 0 42px",
          }}
        >
          На основании исходных данных сформирован
          предварительный гидравлический расчёт и
          состав оборудования для выбранной технологии.
        </p>

        {hydraulicCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  color: "#829daa",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                }}
              >
                ПРЕДВАРИТЕЛЬНЫЙ ИНЖЕНЕРНЫЙ РАСЧЁТ
              </div>

              <div
                style={{
                  color: "#00d9ff",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                PRELIMINARY
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="СУТОЧНЫЙ РАСХОД"
                value={`${hydraulicCalculation.qDay.toFixed(
                  1
                )} м³/сут`}
              />

              <CalculationCard
                label="СРЕДНИЙ РАСХОД"
                value={`${hydraulicCalculation.qAverage.toFixed(
                  2
                )} м³/ч`}
              />

              <CalculationCard
                label="ПИКОВЫЙ РАСХОД"
                value={
                  hydraulicCalculation.qPeak !== null
                    ? `${hydraulicCalculation.qPeak.toFixed(2)} м³/ч`
                    : "Н/Д"
                }
              />

              <CalculationCard
                label="МИНИМАЛЬНЫЙ РАСХОД"
                value={
                  hydraulicCalculation.qMin !== null
                    ? `${hydraulicCalculation.qMin.toFixed(2)} м³/ч`
                    : "Н/Д"
                }
              />

              <CalculationCard
                label="Kmax / Kmin"
                value={
                  hydraulicCalculation.kMax !== null &&
                  hydraulicCalculation.kMin !== null
                    ? `${hydraulicCalculation.kMax.toFixed(3)} / ${hydraulicCalculation.kMin.toFixed(3)}`
                    : "Н/Д"
                }
              />

              <CalculationCard
                label="УСРОДНИТЕЛЬ"
                value={`${hydraulicCalculation.equalizationVolume.toFixed(
                  1
                )} м³`}
              />

              <CalculationCard
                label="БИОЛОГИЧЕСКИЙ ОБЪЁМ"
                value={`${hydraulicCalculation.biologicalVolumeWithReserve.toFixed(
                  1
                )} м³`}
              />

              {pumpCalculation && (
                <CalculationCard
                  label="ОДИН РАБОЧИЙ НАСОС"
                  value={`${pumpCalculation.capacityPerPump.toFixed(
                    1
                  )} м³/ч`}
                />
              )}
            </div>

            <div
              style={{
                marginTop: 18,
                padding: "16px 18px",
                border: "1px solid #18323e",
                background: "#061820",
                color: "#718b96",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#00d9ff" }}>
                НОРМАТИВНОЕ ОСНОВАНИЕ:
              </strong>{" "}
              {hydraulicCalculation.nonuniformitySource}. Средний расход
              составляет {hydraulicCalculation.qAverageLs.toFixed(3)} л/с.
              {hydraulicCalculation.nonuniformityStatus ===
              "normative"
                ? " Коэффициенты Kmax и Kmin определены интерполяцией между табличными значениями."
                : " Для расходов менее 5 л/с КМК 2.04.03-19 требует определение расчётных расходов по КМК 2.04.01-98; коэффициенты здесь намеренно не подставляются."}
              <br />
              <span style={{ color: "#526b76" }}>
                Объём биологической ступени и резерв 10% остаются
                предварительными технологическими параметрами и должны
                подтверждаться отдельным технологическим расчётом.
              </span>
            </div>
          </section>
        )}

        {pollutantLoads && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                color: "#829daa",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
                marginBottom: 24,
              }}
            >
              СУТОЧНАЯ НАГРУЗКА ЗАГРЯЗНЕНИЙ
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="БПК₅"
                value={`${pollutantLoads.bodLoad.toFixed(
                  2
                )} кг/сут`}
              />

              <CalculationCard
                label="ХПК"
                value={`${pollutantLoads.codLoad.toFixed(
                  2
                )} кг/сут`}
              />

              <CalculationCard
                label="ВЗВЕШЕННЫЕ ВЕЩЕСТВА"
                value={`${pollutantLoads.tssLoad.toFixed(
                  2
                )} кг/сут`}
              />

              <CalculationCard
                label="АЗОТ"
                value={`${pollutantLoads.nitrogenLoad.toFixed(
                  2
                )} кг/сут`}
              />

              <CalculationCard
                label="ФОСФОР"
                value={`${pollutantLoads.phosphorusLoad.toFixed(
                  2
                )} кг/сут`}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                color: "#607b87",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Нагрузка рассчитана как Q × концентрация.
              Концентрации должны соответствовать
              лабораторным данным или обоснованным
              проектным значениям.
            </div>
          </section>
        )}

        {sbrCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#829daa",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                  }}
                >
                  ТЕХНОЛОГИЧЕСКИЙ РАСЧЁТ SBR
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#00d9ff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                  }}
                >
                  ПРЕДВАРИТЕЛЬНАЯ ИНЖЕНЕРНАЯ МОДЕЛЬ
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  border: "1px solid #795b2b",
                  background: "#211b0d",
                  color: "#e4bd65",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ТРЕБУЕТ ТЕХНОЛОГИЧЕСКОЙ ПРОВЕРКИ
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="QСУТ"
                value={`${sbrCalculation.qDay.toFixed(1)} м³/сут`}
              />
              <CalculationCard
                label="QСР"
                value={`${sbrCalculation.qAverage.toFixed(2)} м³/ч`}
              />
              <CalculationCard
                label="БПК₅ НАГРУЗКА"
                value={`${sbrCalculation.bodLoad.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="СНЯТАЯ БПК₅"
                value={`${sbrCalculation.bodRemoved.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="ЦИКЛОВ / СУТКИ"
                value={`${sbrCalculation.cyclesPerDay}`}
              />
              <CalculationCard
                label="ПОРЦИЯ / ЦИКЛ"
                value={`${sbrCalculation.batchVolume.toFixed(1)} м³`}
              />
              <CalculationCard
                label="РАБОЧИЙ ОБЪЁМ 1 SBR"
                value={`${sbrCalculation.workingVolumePerReactor.toFixed(1)} м³`}
              />
              <CalculationCard
                label="SBR-РЕАКТОРЫ"
                value={`${sbrCalculation.reactorCount} шт.`}
              />
              <CalculationCard
                label="СУММАРНЫЙ РАБОЧИЙ ОБЪЁМ"
                value={`${sbrCalculation.totalWorkingVolume.toFixed(1)} м³`}
              />
              <CalculationCard
                label="ГИДРАВЛИЧЕСКОЕ ВРЕМЯ"
                value={`${sbrCalculation.hrtHours.toFixed(2)} ч`}
              />
              <CalculationCard
                label="ДЕКАНТЕР"
                value={`${sbrCalculation.decanterFlow.toFixed(1)} м³/ч`}
              />
              <CalculationCard
                label="ВОЗДУХ С РЕЗЕРВОМ"
                value={`${sbrCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`}
              />
              <CalculationCard
                label="ДИФФУЗОРЫ"
                value={`${sbrCalculation.diffusers} шт.`}
              />
              <CalculationCard
                label="ВОЗДУХОДУВКИ"
                value={`${sbrCalculation.blowerWorking} + ${sbrCalculation.blowerReserve} рез.`}
              />
            </div>

            <div
              style={{
                marginTop: 20,
                padding: "16px 18px",
                border: "1px solid #18323e",
                background: "#061820",
                color: "#718b96",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#00d9ff" }}>
                ЦИКЛ SBR — ПРЕДВАРИТЕЛЬНАЯ СХЕМА:
              </strong>
              <br />
              Наполнение: {sbrCalculation.fillHours.toFixed(1)} ч · Аэрация/реакция: {sbrCalculation.reactHours.toFixed(1)} ч · Отстаивание: {sbrCalculation.settleHours.toFixed(1)} ч · Декантация: {sbrCalculation.decantHours.toFixed(1)} ч · Пауза: {sbrCalculation.idleHours.toFixed(1)} ч.
              <br />
              <br />
              {sbrCalculation.notes.map((note) => (
                <div key={note} style={{ marginBottom: 5 }}>
                  • {note}
                </div>
              ))}
              <br />
              <strong style={{ color: "#9bb2bb" }}>
                Окончательные фазы SBR, MLSS, SRT, F/M, объём реактора,
                декантация, рециркуляция и аэрация должны быть подтверждены
                отдельным технологическим расчётом.
              </strong>
            </div>
          </section>
        )}

        {anbrMbrCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ color: "#829daa", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em" }}>
                  КОМБИНИРОВАННЫЙ РАСЧЁТ ANBR + MBR
                </div>
                <div style={{ marginTop: 8, color: "#00d9ff", fontSize: 11, fontWeight: 800, letterSpacing: "0.10em" }}>
                  ANBR → MBR / ПРЕДВАРИТЕЛЬНЫЙ БАЛАНС НАГРУЗКИ
                </div>
              </div>
              <div style={{ padding: "8px 12px", border: "1px solid #795b2b", background: "#211b0d", color: "#e4bd65", fontSize: 11, fontWeight: 800 }}>
                ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ
              </div>
            </div>

            <div style={{ color: "#8da5b1", fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>
              В этой схеме результат предварительного расчёта ANBR передаётся на MBR.
              Поэтому MBR не рассчитывается от исходной БПК₅ напрямую.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
              <CalculationCard label="БПК₅ НА ВХОДЕ" value={`${anbrMbrCalculation.bodLoadIn.toFixed(2)} кг/сут`} />
              <CalculationCard label="УДАЛЕНО ANBR" value={`${anbrMbrCalculation.bodRemovedAnbr.toFixed(2)} кг/сут`} />
              <CalculationCard label="БПК₅ НА MBR" value={`${anbrMbrCalculation.bodLoadToMbr.toFixed(2)} кг/сут`} />
              <CalculationCard label="ANBR HRT" value={`${anbrMbrCalculation.anbrHrtHours.toFixed(1)} ч`} />
              <CalculationCard label="ANBR ОБЪЁМ" value={`${anbrMbrCalculation.anbrVolumeWithReserve.toFixed(1)} м³`} />
              <CalculationCard label="MBR HRT" value={`${anbrMbrCalculation.mbrHrtHours.toFixed(1)} ч`} />
              <CalculationCard label="MBR ОБЪЁМ" value={`${anbrMbrCalculation.mbrVolumeWithReserve.toFixed(1)} м³`} />
              <CalculationCard label="MEMBRANE AREA + 15%" value={`${anbrMbrCalculation.membraneAreaWithReserve.toFixed(1)} м²`} />
            </div>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
              <CalculationCard label="РАБОЧИЕ МОДУЛИ" value={`${anbrMbrCalculation.workingModules} шт.`} />
              <CalculationCard label="РЕЗЕРВНЫЕ МОДУЛИ" value={`${anbrMbrCalculation.reserveModules} шт.`} />
              <CalculationCard label="ВСЕГО МОДУЛЕЙ" value={`${anbrMbrCalculation.totalModules} шт.`} />
              <CalculationCard label="ПЕРМЕАТНЫЕ НАСОСЫ" value={`${anbrMbrCalculation.permeatePumpWorking} + ${anbrMbrCalculation.permeatePumpReserve} рез.`} />
              <CalculationCard label="ПОДАЧА 1 НАСОСА" value={`${anbrMbrCalculation.pumpCapacityPerUnit.toFixed(2)} м³/ч`} />
              <CalculationCard label="ВОЗДУХ НА МЕМБРАНЫ" value={`${anbrMbrCalculation.membraneAirWithReserve.toFixed(1)} Нм³/ч`} />
              <CalculationCard label="ВОЗДУХОДУВКИ" value={`${anbrMbrCalculation.blowerWorking} + ${anbrMbrCalculation.blowerReserve} рез.`} />
              <CalculationCard label="БИОГАЗ — ОЦЕНКА" value={`${anbrMbrCalculation.biogasEstimate.toFixed(1)} Нм³/сут`} />
            </div>

            <div style={{ marginTop: 20, padding: "16px 18px", border: "1px solid #18323e", background: "#061820", color: "#718b96", fontSize: 12, lineHeight: 1.7 }}>
              <strong style={{ color: "#00d9ff" }}>БАЛАНС:</strong>
              <br />
              Исходная БПК₅ → ANBR → остаточная БПК₅ → MBR → очищенная вода.
              <br /><br />
              {anbrMbrCalculation.notes.map((note) => (
                <div key={note} style={{ marginBottom: 5 }}>• {note}</div>
              ))}
              <br />
              <strong style={{ color: "#e4bd65" }}>ВАЖНО:</strong>{" "}
              коэффициент удаления ANBR, HRT, flux, площадь модулей, воздух и оценка биогаза
              являются предварительными инженерными параметрами. Окончательный расчёт должен
              подтверждаться фактическими характеристиками стока, температурой, щёлочностью,
              сульфатами, NH₄-N/TN, выбранной мембраной и технологическим режимом.
            </div>
          </section>
        )}

        {mbrCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#829daa",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                  }}
                >
                  ТЕХНОЛОГИЧЕСКИЙ РАСЧЁТ MBR
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#00d9ff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                  }}
                >
                  ПРЕДВАРИТЕЛЬНАЯ МЕМБРАННАЯ МОДЕЛЬ
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  border: "1px solid #795b2b",
                  background: "#211b0d",
                  color: "#e4bd65",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ТРЕБУЕТ ПРОВЕРКИ ПО ПАСПОРТУ МЕМБРАНЫ
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="QСУТ"
                value={`${mbrCalculation.qDay.toFixed(1)} м³/сут`}
              />
              <CalculationCard
                label="QСР"
                value={`${mbrCalculation.qAverage.toFixed(2)} м³/ч`}
              />
              <CalculationCard
                label="БПК₅ НАГРУЗКА"
                value={`${mbrCalculation.bodLoad.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="СНЯТАЯ БПК₅"
                value={`${mbrCalculation.bodRemoved.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="HRT БИОРЕАКТОРА"
                value={`${mbrCalculation.reactorHrtHours.toFixed(1)} ч`}
              />
              <CalculationCard
                label="РАБОЧИЙ ОБЪЁМ"
                value={`${mbrCalculation.reactorVolume.toFixed(1)} м³`}
              />
              <CalculationCard
                label="ОБЪЁМ + 10%"
                value={`${mbrCalculation.reactorVolumeWithReserve.toFixed(1)} м³`}
              />
              <CalculationCard
                label="MLSS ПРЕДВАРИТЕЛЬНО"
                value={`${(mbrCalculation.mlssKgM3 * 1000).toFixed(0)} мг/л`}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="ПРИНЯТЫЙ FLUX"
                value={`${mbrCalculation.fluxLm2h.toFixed(1)} л/м²·ч`}
              />
              <CalculationCard
                label="РАСЧЁТНАЯ ПЛОЩАДЬ"
                value={`${mbrCalculation.membraneArea.toFixed(1)} м²`}
              />
              <CalculationCard
                label="ПЛОЩАДЬ + 15%"
                value={`${mbrCalculation.membraneAreaWithReserve.toFixed(1)} м²`}
              />
              <CalculationCard
                label="РАБОЧИЕ МОДУЛИ"
                value={`${mbrCalculation.workingModules} шт.`}
              />
              <CalculationCard
                label="РЕЗЕРВНЫЕ МОДУЛИ"
                value={`${mbrCalculation.reserveModules} шт.`}
              />
              <CalculationCard
                label="ВСЕГО МОДУЛЕЙ"
                value={`${mbrCalculation.totalModules} шт.`}
              />
              <CalculationCard
                label="ПЕРМЕАТНЫЕ НАСОСЫ"
                value={`${mbrCalculation.permeatePumpWorking} + ${mbrCalculation.permeatePumpReserve} рез.`}
              />
              <CalculationCard
                label="ПОДАЧА 1 НАСОСА"
                value={`${mbrCalculation.pumpCapacityPerUnit.toFixed(2)} м³/ч`}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="ВОЗДУХ НА МЕМБРАНЫ"
                value={`${mbrCalculation.membraneAirRequirement.toFixed(1)} Нм³/ч`}
              />
              <CalculationCard
                label="ВОЗДУХ + 15%"
                value={`${mbrCalculation.membraneAirWithReserve.toFixed(1)} Нм³/ч`}
              />
              <CalculationCard
                label="ВОЗДУХОДУВКИ МЕМБРАН"
                value={`${mbrCalculation.membraneBlowerWorking} + ${mbrCalculation.membraneBlowerReserve} рез.`}
              />
              <CalculationCard
                label="CIP"
                value={mbrCalculation.cipRequired ? "ТРЕБУЕТСЯ" : "—"}
              />
            </div>

            <div
              style={{
                marginTop: 20,
                padding: "16px 18px",
                border: "1px solid #18323e",
                background: "#061820",
                color: "#718b96",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#00d9ff" }}>
                ОСНОВАНИЕ И ДОПУЩЕНИЯ:
              </strong>
              <br />
              КМК 2.04.03-19 применяется для гидравлической части.
              Площадь мембран рассчитывается по принятому flux:
              <strong style={{ color: "#9bb2bb" }}> A = Q / J </strong>
              с последующим резервом.
              <br />
              <br />
              {mbrCalculation.notes.map((note) => (
                <div key={note} style={{ marginBottom: 5 }}>
                  • {note}
                </div>
              ))}
              <br />
              <strong style={{ color: "#e4bd65" }}>
                ВАЖНО:
              </strong>{" "}
              flux, площадь одного модуля, MLSS, HRT и воздух на мембраны
              здесь являются предварительными инженерными параметрами.
              Перед коммерческим предложением и рабочим проектированием
              они должны быть заменены паспортными данными конкретной
              мембраны и подтверждены технологическим расчётом.
            </div>
          </section>
        )}

        {biofilmCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#829daa",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                  }}
                >
                  ТЕХНОЛОГИЧЕСКИЙ РАСЧЁТ {biofilmCalculation.technology}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#00d9ff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                  }}
                >
                  ПРЕДВАРИТЕЛЬНАЯ ИНЖЕНЕРНАЯ МОДЕЛЬ
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  border: "1px solid #795b2b",
                  background: "#211b0d",
                  color: "#e4bd65",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ТРЕБУЕТ ТЕХНОЛОГИЧЕСКОЙ ПРОВЕРКИ
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="НАГРУЗКА БПК₅"
                value={`${biofilmCalculation.bodLoad.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="СНЯТАЯ БПК₅"
                value={`${biofilmCalculation.bodRemoved.toFixed(2)} кг/сут`}
              />
              <CalculationCard
                label="ОБЪЁМ НОСИТЕЛЯ"
                value={`${biofilmCalculation.mediaVolume?.toFixed(1) ?? "Н/Д"} м³`}
              />
              <CalculationCard
                label="ОБЪЁМ РЕАКТОРА"
                value={`${biofilmCalculation.reactorVolume?.toFixed(1) ?? "Н/Д"} м³`}
              />
              <CalculationCard
                label="HRT"
                value={`${biofilmCalculation.reactorHrtHours?.toFixed(2) ?? "Н/Д"} ч`}
              />
              <CalculationCard
                label="ЗАПОЛНЕНИЕ НОСИТЕЛЕМ"
                value={`${Math.round(biofilmCalculation.mediaFillFraction * 100)} %`}
              />
              <CalculationCard
                label="ТРЕБУЕМЫЙ ВОЗДУХ"
                value={`${biofilmCalculation.airRequirementWithReserve.toFixed(1)} м³/ч`}
              />
              <CalculationCard
                label="ДИФФУЗОРЫ"
                value={`${biofilmCalculation.diffusers} шт.`}
              />
            </div>

            {biofilmCalculation.technology === "IFAS" && (
              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: 14,
                }}
              >
                <CalculationCard
                  label="F/M (ПРЕДВАРИТЕЛЬНО)"
                  value={biofilmCalculation.fm?.toFixed(3) ?? "Н/Д"}
                />
                <CalculationCard
                  label="MLSS (ПРЕДВАРИТЕЛЬНО)"
                  value={biofilmCalculation.mlssKgM3 ? `${(biofilmCalculation.mlssKgM3 * 1000).toFixed(0)} мг/л` : "Н/Д"}
                />
                <CalculationCard
                  label="ОБЪЁМ ВЗВЕШЕННОЙ БИОМАССЫ"
                  value={`${biofilmCalculation.suspendedBiomassVolume?.toFixed(1) ?? "Н/Д"} м³`}
                />
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                padding: "16px 18px",
                border: "1px solid #18323e",
                background: "#061820",
                color: "#718b96",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#00d9ff" }}>
                ОСНОВАНИЕ И ДОПУЩЕНИЯ:
              </strong>
              <br />
              КМК 2.04.03-19 применяется для гидравлической части расчёта. Для
              IFAS/MBBR универсальные значения заполнения носителем, удельной
              поверхности и допустимой нагрузки не выдаются КМК как одна
              универсальная формула; поэтому они отмечены здесь как
              предварительные инженерные допущения.
              <br />
              <br />
              {biofilmCalculation.notes.map((note) => (
                <div key={note} style={{ marginBottom: 5 }}>
                  • {note}
                </div>
              ))}
              <br />
              Для окончательного подбора необходимо подтвердить тип носителя,
              паспортную удельную/защищённую поверхность, рабочую температуру,
              требуемые концентрации NH₄-N/TN, MLSS/SRT и гарантированное качество
              очищенной воды. EPA также отмечает, что IFAS использует прикреплённую
              биомассу вместе с активным илом и что проектные параметры зависят от
              типа носителя и условий объекта. 
              <br />
              <br />
              <strong style={{ color: "#9bb2bb" }}>
                Воздух рассчитан только по предварительной потребности на удаление
                БПК₅; фактическая воздуходувная система должна проверяться по O₂,
                α/β-факторам, температуре, глубине погружения и характеристикам
                диффузоров.
              </strong>
            </div>
          </section>
        )}

        <section
          style={{
            border: "1px solid #18323e",
            background: "#071a23",
            padding: 28,
            marginBottom: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#829daa",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
              }}
            >
              ПРЕДВАРИТЕЛЬНЫЙ ПЛАН / ВИД СВЕРХУ
            </div>

            <div
              style={{
                color: "#00d9ff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              NOT FOR CONSTRUCTION
            </div>
          </div>

          <div
            style={{
              position: "relative",
              minHeight: 470,
              overflow: "hidden",
              border: "1px solid #173641",
              background:
                "radial-gradient(circle at center, #0d2b36 0%, #071820 70%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.35,
                backgroundImage:
                  "linear-gradient(#16343e 1px, transparent 1px), linear-gradient(90deg, #16343e 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 28,
                left: 28,
                color: "#5d7883",
                fontSize: 10,
                letterSpacing: "0.12em",
              }}
            >
              NORTH ↑
            </div>

            <PlanBox
              left="6%"
              top="38%"
              width="15%"
              label="ПРИЁМ"
              sublabel="камера"
            />

            <PlanBox
              left="26%"
              top="38%"
              width="15%"
              label="МЕХ."
              sublabel="очистка"
            />

            <div
              style={{
                position: "absolute",
                left: "46%",
                top: "28%",
                width: "23%",
                minWidth: 150,
                height: 170,
                border: "2px solid #00d9ff",
                background: "#082832",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                boxShadow:
                  "0 0 35px rgba(0,217,255,0.08)",
              }}
            >
              <strong
                style={{
                  color: "#00d9ff",
                  fontSize: 20,
                }}
              >
                {technology}
              </strong>

              <span
                style={{
                  color: "#9bb2bb",
                  fontSize: 11,
                  marginTop: 10,
                }}
              >
                биологический
              </span>

              <span
                style={{
                  color: "#9bb2bb",
                  fontSize: 11,
                }}
              >
                реактор
              </span>
            </div>

            <PlanBox
              left="75%"
              top="38%"
              width="15%"
              label="РАЗДЕЛ."
              sublabel="вода / ил"
            />

            <div
              style={{
                position: "absolute",
                left: "45%",
                bottom: "8%",
                width: "25%",
                minWidth: 160,
                height: 55,
                border: "1px dashed #315966",
                background: "#081e27",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  color: "#78939e",
                  fontSize: 11,
                }}
              >
                ВОЗДУХОДУВКИ / НАСОСНАЯ ГРУППА
              </span>
            </div>

            <PlanArrow left="21%" />
            <PlanArrow left="42%" />
            <PlanArrow left="70%" />
          </div>
        </section>

        <section
          style={{
            border: "1px solid #18323e",
            background: "#071a23",
            marginBottom: 34,
          }}
        >
          <div
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid #18323e",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                color: "#829daa",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
              }}
            >
              СОСТАВ ОБОРУДОВАНИЯ
            </div>

            <div
              style={{
                color: "#00d9ff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {equipment.length} ПОЗИЦИЙ
            </div>
          </div>

          {equipment.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "70px minmax(0, 1fr) 220px",
                gap: 20,
                alignItems: "center",
                padding: "24px 28px",
                borderBottom:
                  index === equipment.length - 1
                    ? "none"
                    : "1px solid #142f39",
              }}
            >
              <div
                style={{
                  color: "#00d9ff",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    color: "#718b96",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {item.note}
                </div>
              </div>

              <div
                style={{
                  color: "#b7c8ce",
                  fontSize: 13,
                  textAlign: "right",
                }}
              >
                {item.qty}
              </div>
            </div>
          ))}
        </section>

        {pumpCalculation && (
          <section
            style={{
              border: "1px solid #18323e",
              background: "#071a23",
              padding: 28,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                color: "#829daa",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
                marginBottom: 24,
              }}
            >
              НАСОСНАЯ ГРУППА
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              <CalculationCard
                label="ТРЕБУЕМАЯ ПОДАЧА"
                value={`${pumpCalculation.requiredCapacity.toFixed(
                  2
                )} м³/ч`}
              />

              <CalculationCard
                label="РАБОЧИХ НАСОСОВ"
                value={`${pumpCalculation.workingPumps} шт.`}
              />

              <CalculationCard
                label="РЕЗЕРВНЫХ НАСОСОВ"
                value={`${pumpCalculation.reservePumps} шт.`}
              />

              <CalculationCard
                label="ПОДАЧА ОДНОГО НАСОСА"
                value={`${pumpCalculation.capacityPerPump.toFixed(
                  2
                )} м³/ч`}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                color: "#607b87",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Подача принята по максимальному расчётному расходу.
              Напор насосов пока не рассчитывается и будет определён
              после формирования гидравлического профиля объекта
              (отметки, длины трубопроводов, арматура и местные потери).
            </div>
          </section>
        )}

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "16px 24px",
              border: "1px solid #294550",
              background: "transparent",
              color: "#dce8ee",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            ← Изменить технологию
          </button>

          <button
            type="button"
            onClick={handleFinish}
            style={{
              padding: "16px 28px",
              border: "none",
              background: "#f5f8fa",
              color: "#06151d",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            Завершить анализ →
          </button>
        </div>

        <p
          style={{
            marginTop: 38,
            color: "#526b76",
            fontSize: 13,
            lineHeight: 1.7,
            maxWidth: 900,
          }}
        >
          Результат является предварительным инженерным
          решением. Расчётные значения, коэффициенты,
          габариты, количество оборудования и компоновка
          должны быть проверены технологом, гидравликом,
          конструктором и поставщиком оборудования.
        </p>

        <footer
          style={{
            marginTop: 52,
            paddingTop: 22,
            borderTop: "1px solid #173640",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
            color: "#66808b",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <span>SUVSANOAT ENGINEERING SYSTEMS</span>

          <span>Инженерный расчёт подготовлен SUVSANOAT</span>

          <a
            href="https://www.suvsanoat.uz"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#00d9ff",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            www.suvsanoat.uz
          </a>
        </footer>
      </div>
    </main>
  );
}

function CalculationCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #18323e",
        background: "#08222c",
        padding: 18,
        minHeight: 100,
      }}
    >
      <div
        style={{
          color: "#6f8b95",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#00d9ff",
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function PlanBox({
  left,
  top,
  width,
  label,
  sublabel,
}: {
  left: string;
  top: string;
  width: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        minWidth: 100,
        height: 90,
        border: "2px solid #397180",
        background: "#0a252e",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <strong style={{ fontSize: 13 }}>
        {label}
      </strong>

      <span
        style={{
          color: "#6f8b95",
          fontSize: 10,
          marginTop: 6,
        }}
      >
        {sublabel}
      </span>
    </div>
  );
}

function PlanArrow({
  left,
}: {
  left: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: "48%",
        color: "#00d9ff",
        fontSize: 24,
      }}
    >
      →
    </div>
  );
}
