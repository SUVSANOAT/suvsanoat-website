import { kMaxByDailyFlow, oxygenTransferKgPerNm3, AEROTANK, BOD5_TO_BODFULL } from "../norms/kmk-2-04-03-19";

export type TechnologyCode =
  | "MBBR"
  | "SBR"
  | "MBR"
  | "ANBR"
  | "UASB"
  | "ABR"
  | "AnMBR"
  | "IFAS"
  | "CAS"
  | "OTHER";

export type TechnologyInput = {
  technology: TechnologyCode;
  flowM3Day: number;
  hoursPerDay: number;
  bodMgL: number;
  codMgL: number;
  tssMgL: number;
  nitrogenMgL: number;
  phosphorusMgL: number;
  people?: number;
};

export type Metric = {
  key: string;
  label: string;
  value: number;
  unit: string;
};

export type EquipmentItem = {
  position: string;
  quantity: string;
  parameter: string;
  status: string;
};

export type TechnologyResult = {
  technology: TechnologyCode;
  hydraulic: {
    qAvg: number;
    qWorking: number;
    qPeak: number;
    hrt: number;
    hydraulicVolume: number;
    volumeWithReserve: number;
  };
  loads: {
    bod: number;
    cod: number;
    tss: number;
    nitrogen: number;
    phosphorus: number;
  };
  specialized: Metric[];
  equipment: EquipmentItem[];
  assumptions: string[];
};

export const technologyCalculations = {
  MBBR: { hrt: 8, description: "Предварительный расчёт MBBR по гидравлическому объёму, органической нагрузке, носителям и аэрации." },
  SBR: { hrt: 8, description: "Предварительный расчёт SBR по циклическому режиму, объёму цикла, числу реакторов и аэрации." },
  MBR: { hrt: 8, description: "Предварительный расчёт MBR по объёму биореактора и площади мембран." },
  ANBR: { hrt: 12, description: "Предварительный расчёт анаэробного биореактора по ХПК, HRT и выходу биогаза." },
  UASB: { hrt: 8, description: "Предварительный расчёт UASB по восходящей скорости, площади сечения и органической нагрузке." },
  ABR: { hrt: 12, description: "Предварительный расчёт ABR с распределением объёма по анаэробным камерам." },
  AnMBR: { hrt: 10, description: "Предварительный расчёт AnMBR с анаэробным объёмом, мембранной площадью и биогазом." },
  IFAS: { hrt: 8, description: "Предварительный расчёт IFAS по органической нагрузке, заполнению носителями и аэрации." },
  CAS: { hrt: 8, description: "Предварительный расчёт классического аэротенка по F/M, MLSS, объёму и аэрации." },
  OTHER: { hrt: 8, description: "Индивидуальная технологическая схема; требуется отдельная расчётная модель." },
} as const;

const n = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);
const max0 = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);
const round = (x: number, digits = 2) => Number.isFinite(x) ? Number(x.toFixed(digits)) : 0;

function loads(input: TechnologyInput) {
  const q = n(input.flowM3Day);
  return {
    bod: q * n(input.bodMgL) / 1000,
    cod: q * n(input.codMgL) / 1000,
    tss: q * n(input.tssMgL) / 1000,
    nitrogen: q * n(input.nitrogenMgL) / 1000,
    phosphorus: q * n(input.phosphorusMgL) / 1000,
  };
}

function metric(key: string, label: string, value: number, unit: string): Metric {
  return { key, label, value: round(value), unit };
}

function aerobicOxygen(bodLoad: number, nitrogenLoad: number, removal = 0.9) {
  const removedBod = bodLoad * removal;
  const nitrification = nitrogenLoad * 4.57;
  return {
    removedBod,
    // q_O = 1,1 мг O₂/мг снятой БПКполн при очистке до 15–20 мг/л
    // (ҚМҚ 2.04.03-19 п. 6.156); нитрификация 4,57 кг O₂/кг N — практика.
    // bodLoad задан по БПК₅ — переводим в БПКполн (БПК₅ ≈ 0,68·БПКполн, практика).
    oxygen: (removedBod / BOD5_TO_BODFULL) * AEROTANK.air.qO.toBod15_20 + nitrification,
  };
}

/** кг O₂, фактически передаваемых 1 Нм³ воздуха: знаменатель ф. (70) ҚМҚ 2.04.03-19 п. 6.156
 *  при мелкопузырчатой аэрации, h_a = 4 м, f_az/f_at = 0,2, городские СВ, 20 °C, C_O = 2 мг/л (≈0,03). */
const O2_PER_NM3 = oxygenTransferKgPerNm3({ depthM: 4, fRatio: 0.2, tempC: 20 });

/** Расход воздуха, Нм³/ч, по суточной потребности в кислороде. */
function airFromOxygen(oxygenKgDay: number) {
  return oxygenKgDay / O2_PER_NM3 / 24;
}

function anaerobicBiogas(removedCodKgDay: number) {
  // Preliminary: 0.35 Nm3 CH4 per kg COD removed; 65% CH4 in biogas.
  const methane = removedCodKgDay * 0.35;
  return { methane, biogas: methane / 0.65 };
}

function equipmentFor(technology: TechnologyCode, values: Record<string, number>): EquipmentItem[] {
  const v = (key: string, digits = 1) => Number(values[key] || 0).toFixed(digits);
  switch (technology) {
    case "MBBR":
      return [
        { position: "MBBR-реактор", quantity: `${Math.max(1, values.sections)} секции`, parameter: `${v("volumePerSection")} м³/секцию; глубина 3.0 м`, status: "Предварительно" },
        { position: "Носители биоплёнки", quantity: `${v("carrierVolume")} м³`, parameter: `заполнение ${v("fillPct", 0)}%`, status: "Допущение" },
        { position: "Воздуходувки", quantity: "2 + 1", parameter: `≈ ${v("air")} Нм³/ч на рабочую`, status: "Концепт" },
        { position: "Мелкопузырчатая аэрация", quantity: `${Math.max(1, Math.ceil(values.air / 5))} шт.`, parameter: `≈ 5 Нм³/ч/диффузор`, status: "Концепт" },
        { position: "Система удержания загрузки", quantity: `${Math.max(1, values.sections)} комплекта`, parameter: "по секциям реактора", status: "Предварительно" },
      ];
    case "SBR":
      return [
        { position: "SBR-реакторы", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: `${v("reactorVolume")} м³/реактор`, status: "Предварительно" },
        { position: "Воздуходувки", quantity: "2 + 1", parameter: `≈ ${v("air")} Нм³/ч на рабочую`, status: "Концепт" },
        { position: "Система аэрации", quantity: `${Math.max(1, Math.ceil(values.air / 5))} шт.`, parameter: "предварительное число диффузоров", status: "Концепт" },
        { position: "Декантер", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: `цикл ${v("cycleHours")} ч`, status: "Предварительно" },
        { position: "Автоматика циклов", quantity: "1 комплект", parameter: "наполнение / реакция / отстой / декантация", status: "Концепт" },
      ];
    case "MBR":
      return [
        { position: "MBR-реактор", quantity: `${Math.max(1, values.reactors)} секции`, parameter: `${v("reactorVolume")} м³/секцию`, status: "Предварительно" },
        { position: "Мембранные модули", quantity: `${Math.max(1, Math.ceil(values.membraneArea / 40))} шт.`, parameter: `${v("membraneArea")} м²; поток ${v("flux", 0)} LMH`, status: "Предварительно" },
        { position: "Воздуходувки", quantity: "2 + 1", parameter: `≈ ${v("air")} Нм³/ч`, status: "Концепт" },
        { position: "Насосы рециркуляции", quantity: "2 + 1", parameter: "по рабочему расходу мембранного блока", status: "Концепт" },
        { position: "Система промывки мембран", quantity: "1 комплект", parameter: "CIP / химическая промывка", status: "Концепт" },
      ];
    case "ANBR":
      return [
        { position: "ANBR-реактор", quantity: `${Math.max(1, values.reactors)} секции`, parameter: `${v("reactorVolume")} м³/секцию`, status: "Предварительно" },
        { position: "Система сбора биогаза", quantity: "1 комплект", parameter: `≈ ${v("biogas")} Нм³/сут`, status: "Концепт" },
        { position: "Газовый сепаратор", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: "по секциям", status: "Концепт" },
        { position: "Распределительная система", quantity: `${Math.max(1, values.reactors)} комплекта`, parameter: "по входному расходу", status: "Предварительно" },
      ];
    case "UASB":
      return [
        { position: "UASB-реактор", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: `${v("reactorVolume")} м³; площадь ${v("area")} м²`, status: "Предварительно" },
        { position: "Газосепаратор", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: "трёхфазное разделение", status: "Концепт" },
        { position: "Система сбора биогаза", quantity: "1 комплект", parameter: `≈ ${v("biogas")} Нм³/сут`, status: "Концепт" },
        { position: "Распределительная система", quantity: `${Math.max(1, values.reactors)} комплекта`, parameter: "по площади днища", status: "Предварительно" },
      ];
    case "ABR":
      return [
        { position: "ABR-реактор", quantity: `${Math.max(1, values.chambers)} камер`, parameter: `${v("chamberVolume")} м³/камеру`, status: "Предварительно" },
        { position: "Перегородки", quantity: `${Math.max(1, values.chambers - 1)} шт.`, parameter: "межкамерное распределение", status: "Предварительно" },
        { position: "Система отвода биогаза", quantity: "1 комплект", parameter: `≈ ${v("biogas")} Нм³/сут`, status: "Концепт" },
        { position: "Распределительная система", quantity: "1 комплект", parameter: "входной поток", status: "Концепт" },
      ];
    case "AnMBR":
      return [
        { position: "AnMBR-реактор", quantity: `${Math.max(1, values.reactors)} секции`, parameter: `${v("reactorVolume")} м³/секцию`, status: "Предварительно" },
        { position: "Мембранные модули", quantity: `${Math.max(1, Math.ceil(values.membraneArea / 40))} шт.`, parameter: `${v("membraneArea")} м²; ${v("flux", 0)} LMH`, status: "Предварительно" },
        { position: "Система сбора биогаза", quantity: "1 комплект", parameter: `≈ ${v("biogas")} Нм³/сут`, status: "Концепт" },
        { position: "Рециркуляция", quantity: "2 + 1", parameter: "по мембранному блоку", status: "Концепт" },
      ];
    case "IFAS":
      return [
        { position: "IFAS-реактор", quantity: `${Math.max(1, values.reactors)} секции`, parameter: `${v("reactorVolume")} м³/секцию`, status: "Предварительно" },
        { position: "Носители биомассы", quantity: `${v("carrierVolume")} м³`, parameter: `заполнение ${v("fillPct", 0)}%`, status: "Допущение" },
        { position: "Воздуходувки", quantity: "2 + 1", parameter: `≈ ${v("air")} Нм³/ч`, status: "Концепт" },
        { position: "Мелкопузырчатая аэрация", quantity: `${Math.max(1, Math.ceil(values.air / 5))} шт.`, parameter: "предварительное число диффузоров", status: "Концепт" },
      ];
    case "CAS":
      return [
        { position: "Аэротенк", quantity: `${Math.max(1, values.reactors)} секции`, parameter: `${v("reactorVolume")} м³/секцию; MLSS ${v("mlss")} кг/м³`, status: "Предварительно" },
        { position: "Вторичный отстойник", quantity: `${Math.max(1, values.reactors)} шт.`, parameter: "площадь уточняется по гидравлической нагрузке", status: "Предварительно" },
        { position: "Воздуходувки", quantity: "2 + 1", parameter: `≈ ${v("air")} Нм³/ч`, status: "Концепт" },
        { position: "Система возвратного ила", quantity: "2 + 1", parameter: `расход уточняется от Q`, status: "Концепт" },
      ];
    default:
      return [
        { position: "Технологический блок", quantity: "1 комплект", parameter: "индивидуальная схема", status: "Требует отдельного расчёта" },
      ];
  }
}

export function calculateTechnology(input: TechnologyInput): TechnologyResult {
  const technology = input.technology;
  const flow = n(input.flowM3Day);
  const hours = Math.max(1, n(input.hoursPerDay) || 24);
  const qAvg = flow / 24;
  const qWorking = flow / hours;
  // Максимальный часовой расход — по табл. 2 ҚМҚ 2.04.03-19 (п. 2.7), а не константой.
  const kGen = kMaxByDailyFlow(flow);
  const qPeak = qAvg * kGen.kMax;
  const hrt = technologyCalculations[technology].hrt;
  const hydraulicVolume = qWorking * hrt;
  const volumeWithReserve = hydraulicVolume * 1.15;
  const l = loads(input);
  const specialized: Metric[] = [];
  const assumptions: string[] = [
    `Максимальный часовой расход: K gen.max = ${kGen.kMax.toFixed(2)} (${kGen.source}).`,
    `Расход воздуха: передача кислорода ${(O2_PER_NM3 * 1000).toFixed(1)} г O₂/Нм³ по ф. (70) ҚМҚ 2.04.03-19 п. 6.156 (мелкопузырчатая аэрация, h_a = 4 м, K₁ = 1,68, K₂ = 2,52, K₃ = 0,85, 20 °C); удельный расход кислорода 1,1 кг/кг снятой БПК.`,
  ];
  const values: Record<string, number> = {};

  const add = (key: string, label: string, value: number, unit: string) => {
    specialized.push(metric(key, label, value, unit));
    values[key] = value;
  };

  if (technology === "MBBR") {
    const removed = l.bod * 0.9;
    const vOrganic = removed / 0.8;
    const vLoading = removed / 1.5;
    const fill = 0.5;
    const carrierVolume = vLoading * fill;
    const volume = Math.max(hydraulicVolume, vOrganic, vLoading);
    const sections = Math.max(2, Math.ceil(volumeWithReserve / 20));
    const oxygen = aerobicOxygen(l.bod, l.nitrogen).oxygen;
    const air = airFromOxygen(oxygen);
    const volumePerSection = volumeWithReserve / sections;
    Object.assign(values, { sections, carrierVolume, fillPct: fill * 100, air, volumePerSection });
    add("removedBod", "Снятая БПК₅", removed, "кг/сут");
    add("volume", "Расчётный объём", volume, "м³");
    add("organicVolume", "V по органике", vOrganic, "м³");
    add("loadingVolume", "V по загрузке", vLoading, "м³");
    add("carrierVolume", "Носители, расчёт", carrierVolume, "м³");
    add("filling", "Заполнение", fill * 100, "%");
    add("sections", "Секции", sections, "шт.");
    add("volumePerSection", "V/секцию +15%", volumePerSection, "м³");
    add("oxygen", "O₂", oxygen, "кг O₂/сут");
    add("air", "Воздух", air, "Нм³/ч");
    assumptions.push("MBBR: OLR по снятой БПК₅ = 0.8 кг БПК₅/(м³·сут), нагрузка по загрузке = 1.5 кг БПК₅/(м³·сут), заполнение носителями = 50%.");
  }

  if (technology === "SBR") {
    // Концептуальная схема: 2 параллельных реактора, каждый работает 3 цикла/сут.
    // Для предварительного подбора принимается обменный объём 25% рабочего объёма за цикл.
    const reactors = 2;
    const cyclesPerReactor = 3;
    const cycleHours = 24 / cyclesPerReactor;
    const exchangeRatio = 0.25;
    const fillHours = 1;
    const reactHours = 4;
    const settleHours = 1;
    const decantHours = 1;
    const idleHours = Math.max(0, cycleHours - fillHours - reactHours - settleHours - decantHours);

    const flowPerReactor = flow / reactors;
    const decantVolumePerCycle = flowPerReactor / cyclesPerReactor;
    const reactorVolume = decantVolumePerCycle / exchangeRatio;
    const totalVolume = reactorVolume * reactors;
    const totalVolumeWithReserve = totalVolume * 1.15;
    const reactorVolumeWithReserve = reactorVolume * 1.15;
    const decantFlowDuringPhase = decantHours > 0
      ? decantVolumePerCycle / decantHours
      : 0;

    const oxygen = aerobicOxygen(l.bod, l.nitrogen).oxygen;
    const air = airFromOxygen(oxygen);
    const airPerReactor = air / reactors;

    Object.assign(values, {
      reactors,
      cycles: cyclesPerReactor,
      cyclesPerReactor,
      cycleHours,
      exchangeRatio,
      fillHours,
      reactHours,
      settleHours,
      decantHours,
      idleHours,
      flowPerReactor,
      cycleVolume: decantVolumePerCycle,
      decantVolumePerCycle,
      decantFlowDuringPhase,
      reactorVolume,
      reactorVolumeWithReserve,
      totalVolumeWithReserve,
      air,
      airPerReactor,
    });

    add("cycles", "Циклов/сут на реактор", cyclesPerReactor, "цикл/сут");
    add("cycleHours", "Продолжительность цикла", cycleHours, "ч");
    add("fillHours", "Наполнение", fillHours, "ч");
    add("reactHours", "Аэрация / реакция", reactHours, "ч");
    add("settleHours", "Отстаивание", settleHours, "ч");
    add("decantHours", "Декантация", decantHours, "ч");
    add("idleHours", "Холостой период", idleHours, "ч");
    add("exchangeRatio", "Обменный объём", exchangeRatio * 100, "%");
    add("flowPerReactor", "Расход на реактор", flowPerReactor, "м³/сут");
    add("cycleVolume", "Декантируемый объём/цикл", decantVolumePerCycle, "м³/цикл");
    add("reactorVolume", "Рабочий объём реактора", reactorVolume, "м³");
    add("reactorVolumeWithReserve", "V/реактор с запасом +15%", reactorVolumeWithReserve, "м³");
    add("volume", "Общий рабочий объём", totalVolume, "м³");
    add("volumeWithReserve", "Общий объём с запасом +15%", totalVolumeWithReserve, "м³");
    add("reactors", "Реакторы", reactors, "шт.");
    add("decantFlow", "Расход при декантации", decantFlowDuringPhase, "м³/ч");
    add("oxygen", "O₂", oxygen, "кг O₂/сут");
    add("air", "Воздух общий", air, "Нм³/ч");
    add("airPerReactor", "Воздух/реактор", airPerReactor, "Нм³/ч");
    assumptions.push(
      "SBR: предварительно приняты 2 параллельных реактора, по 3 цикла/сут на каждый; обменный объём 25% рабочего объёма. Фазы цикла: 1 ч наполнение + 4 ч реакция/аэрация + 1 ч отстаивание + 1 ч декантация + 1 ч холостой период."
    );
    assumptions.push(
      "Расход при декантации рассчитан по продолжительности фазы. Окончательный подбор SBR должен учитывать фактическую неравномерность притока, требования к качеству очистки, SRT/MLSS, нитрификацию/денитрификацию и характеристики декантера."
    );
  }

  if (technology === "MBR") {
    const removed = l.bod * 0.95;
    const vOrganic = removed / 0.9;
    const volume = Math.max(hydraulicVolume, vOrganic);
    const flux = 15;
    /*
     * Мембраны подбираются по МАКСИМАЛЬНОМУ часовому расходу (qPeak по
     * табл. 2 ҚМҚ 2.04.03-19, п. 2.7), а не по среднему: в час пик через
     * тот же модуль проходит в K_gen.max раз больше воды, и при подборе
     * по среднему расходу фактический поток превышает паспортный —
     * это перегрузка мембран и ускоренное загрязнение.
     */
    const membraneArea = (qPeak * 1000) / flux;
    const reactors = 2;
    const oxygen = aerobicOxygen(l.bod, l.nitrogen, 0.95).oxygen;
    const air = airFromOxygen(oxygen);
    const reactorVolume = volumeWithReserve / reactors;
    Object.assign(values, { reactors, reactorVolume, membraneArea, flux, air });
    add("removedBod", "Снятая БПК₅", removed, "кг/сут");
    add("organicVolume", "V по органике", vOrganic, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("reactors", "Реакторы", reactors, "шт.");
    add("reactorVolume", "V/реактор", reactorVolume, "м³");
    add("membraneFlux", "Мембранный поток", flux, "LMH");
    add("membraneArea", "Площадь мембран", membraneArea, "м²");
    add("oxygen", "O₂", oxygen, "кг O₂/сут");
    add("air", "Воздух", air, "Нм³/ч");
    assumptions.push(
      `MBR: мембранный поток принят 15 LMH (не нормируется ҚМҚ 2.04.03-19, паспортная величина); ` +
        `площадь рассчитана по максимальному часовому расходу ${round(qPeak)} м³/ч (K gen.max = ${kGen.kMax.toFixed(2)}, п. 2.7, табл. 2).`
    );
  }

  if (technology === "ANBR") {
    const removed = l.cod * 0.8;
    const organicVolume = removed / 2.5;
    const volume = Math.max(hydraulicVolume, organicVolume);
    const reactors = 2;
    const reactorVolume = volumeWithReserve / reactors;
    const gas = anaerobicBiogas(removed);
    Object.assign(values, { reactors, reactorVolume, biogas: gas.biogas });
    add("removedCod", "Снятая ХПК", removed, "кг/сут");
    add("organicVolume", "V по органике", organicVolume, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("reactors", "Секции", reactors, "шт.");
    add("reactorVolume", "V/секцию", reactorVolume, "м³");
    add("biogas", "Биогаз", gas.biogas, "Нм³/сут");
    add("methane", "Метан", gas.methane, "Нм³/сут");
    assumptions.push("ANBR: OLR = 2.5 кг ХПК/(м³·сут), удаление ХПК = 80%, выход метана = 0.35 Нм³/кг снятой ХПК, CH₄ в биогазе = 65%.");
  }

  if (technology === "UASB") {
    const removed = l.cod * 0.75;
    const organicVolume = removed / 4;
    const volume = Math.max(hydraulicVolume, organicVolume);
    const upflowVelocity = 0.8;
    const area = qWorking / upflowVelocity;
    const reactors = Math.max(1, Math.ceil(volumeWithReserve / 50));
    const reactorVolume = volumeWithReserve / reactors;
    const gas = anaerobicBiogas(removed);
    Object.assign(values, { reactors, reactorVolume, area, biogas: gas.biogas });
    add("removedCod", "Снятая ХПК", removed, "кг/сут");
    add("organicVolume", "V по органике", organicVolume, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("upflowVelocity", "Восходящая скорость", upflowVelocity, "м/ч");
    add("area", "Площадь сечения", area, "м²");
    add("reactors", "Реакторы", reactors, "шт.");
    add("reactorVolume", "V/реактор", reactorVolume, "м³");
    add("biogas", "Биогаз", gas.biogas, "Нм³/сут");
    add("methane", "Метан", gas.methane, "Нм³/сут");
    assumptions.push("UASB: восходящая скорость принята 0.8 м/ч; OLR = 4 кг ХПК/(м³·сут); удаление ХПК = 75%.");
  }

  if (technology === "ABR") {
    const removed = l.cod * 0.7;
    const organicVolume = removed / 2.0;
    const volume = Math.max(hydraulicVolume, organicVolume);
    const chambers = 6;
    const chamberVolume = volumeWithReserve / chambers;
    const gas = anaerobicBiogas(removed);
    Object.assign(values, { chambers, chamberVolume, biogas: gas.biogas });
    add("removedCod", "Снятая ХПК", removed, "кг/сут");
    add("organicVolume", "V по органике", organicVolume, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("chambers", "Камеры", chambers, "шт.");
    add("chamberVolume", "Объём камеры", chamberVolume, "м³");
    add("biogas", "Биогаз", gas.biogas, "Нм³/сут");
    add("methane", "Метан", gas.methane, "Нм³/сут");
    assumptions.push("ABR: принято 6 камер; OLR = 2.0 кг ХПК/(м³·сут); удаление ХПК = 70%.");
  }

  if (technology === "AnMBR") {
    const removed = l.cod * 0.85;
    const organicVolume = removed / 2.5;
    const volume = Math.max(hydraulicVolume, organicVolume);
    const flux = 12;
    /* площадь — по максимальному часовому расходу, см. пояснение в ветке MBR */
    const membraneArea = (qPeak * 1000) / flux;
    const reactors = 2;
    const reactorVolume = volumeWithReserve / reactors;
    const gas = anaerobicBiogas(removed);
    Object.assign(values, { reactors, reactorVolume, membraneArea, flux, biogas: gas.biogas });
    add("removedCod", "Снятая ХПК", removed, "кг/сут");
    add("organicVolume", "V по органике", organicVolume, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("reactors", "Секции", reactors, "шт.");
    add("reactorVolume", "V/секцию", reactorVolume, "м³");
    add("membraneFlux", "Мембранный поток", flux, "LMH");
    add("membraneArea", "Площадь мембран", membraneArea, "м²");
    add("biogas", "Биогаз", gas.biogas, "Нм³/сут");
    add("methane", "Метан", gas.methane, "Нм³/сут");
    assumptions.push(
      `AnMBR: OLR = 2.5 кг ХПК/(м³·сут), удаление ХПК = 85%, мембранный поток = 12 LMH ` +
        `(не нормируется ҚМҚ 2.04.03-19); площадь мембран — по максимальному часовому расходу ${round(qPeak)} м³/ч.`
    );
  }

  if (technology === "IFAS") {
    const removed = l.bod * 0.9;
    const organicVolume = removed / 0.8;
    const fill = 0.4;
    const carrierVolume = Math.max(organicVolume, hydraulicVolume) * fill;
    const volume = Math.max(hydraulicVolume, organicVolume);
    const reactors = Math.max(2, Math.ceil(volumeWithReserve / 20));
    const oxygen = aerobicOxygen(l.bod, l.nitrogen).oxygen;
    const air = airFromOxygen(oxygen);
    const reactorVolume = volumeWithReserve / reactors;
    Object.assign(values, { reactors, reactorVolume, carrierVolume, fillPct: fill * 100, air });
    add("removedBod", "Снятая БПК₅", removed, "кг/сут");
    add("organicVolume", "V по органике", organicVolume, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("filling", "Заполнение", fill * 100, "%");
    add("carrierVolume", "Носители", carrierVolume, "м³");
    add("reactors", "Секции", reactors, "шт.");
    add("reactorVolume", "V/секцию", reactorVolume, "м³");
    add("oxygen", "O₂", oxygen, "кг O₂/сут");
    add("air", "Воздух", air, "Нм³/ч");
    assumptions.push("IFAS: заполнение носителями принято 40%; OLR по снятой БПК₅ = 0.8 кг/(м³·сут).");
  }

  if (technology === "CAS") {
    const removed = l.bod * 0.9;
    const mlss = 3.0;
    const fm = 0.12;
    const biomass = removed / fm;
    const volumeByBiomass = biomass / mlss;
    const volume = Math.max(hydraulicVolume, volumeByBiomass);
    const reactors = Math.max(2, Math.ceil(volumeWithReserve / 25));
    const reactorVolume = volumeWithReserve / reactors;
    const oxygen = aerobicOxygen(l.bod, l.nitrogen).oxygen;
    const air = airFromOxygen(oxygen);
    Object.assign(values, { reactors, reactorVolume, mlss, fm, air });
    add("removedBod", "Снятая БПК₅", removed, "кг/сут");
    add("fm", "F/M", fm, "кг БПК/(кг ИЛ·сут)");
    add("mlss", "MLSS", mlss, "кг/м³");
    add("biomass", "Биомасса", biomass, "кг");
    add("organicVolume", "V по биомассе", volumeByBiomass, "м³");
    add("volume", "Расчётный объём", volume, "м³");
    add("reactors", "Секции", reactors, "шт.");
    add("reactorVolume", "V/секцию", reactorVolume, "м³");
    add("oxygen", "O₂", oxygen, "кг O₂/сут");
    add("air", "Воздух", air, "Нм³/ч");
    assumptions.push("CAS: MLSS = 3.0 кг/м³, F/M = 0.12 кг БПК/(кг ИЛ·сут), удаление БПК₅ = 90%.");
  }

  if (technology === "OTHER") {
    add("volume", "Гидравлический объём", hydraulicVolume, "м³");
    add("volumeWithReserve", "Объём с запасом", volumeWithReserve, "м³");
    assumptions.push("Для OTHER специализированная модель не задана; требуется отдельная технологическая постановка.");
  }

  const equipment = equipmentFor(technology, values);
  return {
    technology,
    hydraulic: {
      qAvg: round(qAvg),
      qWorking: round(qWorking),
      qPeak: round(qPeak),
      hrt,
      hydraulicVolume: round(hydraulicVolume),
      volumeWithReserve: round(volumeWithReserve),
    },
    loads: {
      bod: round(l.bod),
      cod: round(l.cod),
      tss: round(l.tss),
      nitrogen: round(l.nitrogen),
      phosphorus: round(l.phosphorus),
    },
    specialized,
    equipment,
    assumptions,
  };
}

export function calculatePreliminaryVolume(flowM3Day: number, hrtHours: number): number {
  return n(flowM3Day) * Math.max(0, n(hrtHours)) / 24;
}

export function calculateAverageHourlyFlow(flowM3Day: number): number {
  return n(flowM3Day) / 24;
}

export function calculatePreliminaryDimensions(volumeM3: number, widthM: number, depthM: number) {
  if (volumeM3 <= 0 || widthM <= 0 || depthM <= 0) {
    return { lengthM: 0, widthM, depthM, volumeM3: 0 };
  }
  return { lengthM: volumeM3 / (widthM * depthM), widthM, depthM, volumeM3 };
}