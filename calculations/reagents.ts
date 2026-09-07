/* ==================================================================
 * РЕАГЕНТНОЕ ХОЗЯЙСТВО: ДОЗЫ, РАСХОД, СКЛАД, УЗЛЫ ПРИГОТОВЛЕНИЯ
 *
 * Считается то, что определяет размеры помещения и график поставок:
 * суточный и годовой расход товарного продукта, объём растворных и
 * расходных баков, вместимость склада на заданный запас, подача
 * насосов-дозаторов, время хлопьеобразования и градиент перемешивания.
 *
 * Дозы — по табл. 61 (п. 6.269), выбор коагулянта по pH — п. 6.270,
 * камеры хлопьеобразования и градиенты — п. 6.274 и 6.275, аэрируемый
 * смеситель при железном купоросе — п. 6.272. Всё это норма.
 *
 * ГЛАВНОЕ ПРЕДУПРЕЖДЕНИЕ, КОТОРОЕ ЗДЕСЬ ВЫВОДИТСЯ
 * Табличная доза — это диапазон для городских сточных вод, а не число
 * для вашего стока. Настоящая доза определяется пробным коагулированием
 * на реальной воде, и разница между нижней и верхней границей табл. 61
 * для хлорного железа — троекратная: 50 и 150 мг/л. Считать склад по
 * нижней границе и обнаружить на пуске, что нужна верхняя, — значит
 * втрое промахнуться по объёму склада и по годовым затратам.
 * ================================================================== */

import { REAGENTS, kmkRef } from "../norms/kmk-2-04-03-19";

export type CoagulantKind = "alum" | "feSO4" | "feCl3";
export type FlocculantKind = "anionic" | "cationic" | "none";

export const COAGULANTS: Record<CoagulantKind, { label: string; range: readonly [number, number]; note: string }> = {
  alum: {
    label: "соли алюминия (по Al₂O₃)",
    range: REAGENTS.table61Municipal.alSaltsMgL_asAl2O3 as unknown as readonly [number, number],
    note: `применяются при pH не выше ${REAGENTS.coagulantByPh.alUpToPh} (${REAGENTS.coagulantByPh.ref})`,
  },
  feSO4: {
    label: "железный купорос FeSO₄",
    range: REAGENTS.table61Municipal.feSO4MgL as unknown as readonly [number, number],
    note: `при pH выше ${REAGENTS.coagulantByPh.alUpToPh}; требует аэрируемого смесителя не менее ${REAGENTS.feSO4AeratedMixer.minMinutes} мин (${REAGENTS.feSO4AeratedMixer.ref})`,
  },
  feCl3: {
    label: "хлорное железо FeCl₃",
    range: REAGENTS.table61Municipal.feCl3MgL as unknown as readonly [number, number],
    note: `при pH выше ${REAGENTS.coagulantByPh.alUpToPh}`,
  },
};

export const FLOCCULANTS: Record<Exclude<FlocculantKind, "none">, { label: string; range: readonly [number, number] }> = {
  anionic: { label: "анионный флокулянт", range: REAGENTS.table61Municipal.anionicFlocMgL as unknown as readonly [number, number] },
  cationic: { label: "катионный флокулянт", range: REAGENTS.table61Municipal.cationicFlocMgL as unknown as readonly [number, number] },
};

export type ReagentInput = {
  /** расход, м³/сут */
  flowM3Day: number;
  /** часов работы в сутки */
  hoursPerDay?: number;
  /** pH сточной воды — по нему выбирается коагулянт (п. 6.270) */
  ph?: number;
  coagulant?: CoagulantKind;
  /** доза коагулянта, мг/л; не задана — берётся ВЕРХНЯЯ граница табл. 61 */
  coagulantDoseMgL?: number;
  flocculant?: FlocculantKind;
  flocculantDoseMgL?: number;
  /** концентрация рабочего раствора коагулянта, % */
  solutionPct?: number;
  /** запас реагента на складе, суток */
  stockDays?: number;
  /** ступень, после которой ставится отстаивание или флотация */
  after?: "settling" | "flotation";
};

export type ReagentLine = {
  name: string;
  doseMgL: number;
  /** товарный продукт, кг/сут */
  kgPerDay: number;
  kgPerYear: number;
  /** объём рабочего раствора, м³/сут */
  solutionM3Day: number;
  basis: string;
};

export type ReagentResult = {
  lines: ReagentLine[];
  /** объём расходного бака (суточный запас раствора), м³ */
  dailyTankM3: number;
  /** вместимость склада товарного продукта, т */
  stockT: number;
  /** подача насоса-дозатора, л/ч */
  dosingPumpLh: number;
  /** объём камеры хлопьеобразования, м³ */
  flocChamberM3: number;
  /** время хлопьеобразования, мин */
  flocMinutes: number;
  /** градиент перемешивания, с⁻¹ */
  gradientG: number;
  assumptions: string[];
  warnings: string[];
};

const r2 = (x: number) => Number(x.toFixed(2));

export function calculateReagents(input: ReagentInput): ReagentResult {
  const warnings: string[] = [];
  const Q = Math.max(0, input.flowM3Day);
  const hours = Math.min(24, Math.max(1, input.hoursPerDay ?? 24));
  const qH = Q / hours;

  /* --- выбор коагулянта по pH, если проектировщик не задал --- */
  const ph = input.ph;
  let kind: CoagulantKind = input.coagulant ?? "alum";
  if (!input.coagulant && ph !== undefined) {
    kind = ph > REAGENTS.coagulantByPh.alUpToPh ? "feCl3" : "alum";
  }
  const coag = COAGULANTS[kind];

  /* ДОЗА. Если проектировщик не задал — берём ВЕРХНЮЮ границу табл. 61,
     а не среднюю и не нижнюю. Склад и годовой расход, посчитанные по
     нижней границе, придётся переделывать после первого же пробного
     коагулирования; посчитанные по верхней — окажутся с запасом, и это
     безопасная сторона ошибки. */
  const doseTaken = input.coagulantDoseMgL ?? coag.range[1];
  const byUser = input.coagulantDoseMgL !== undefined;

  const solutionPct = Math.min(20, Math.max(1, input.solutionPct ?? 10));
  const stockDays = Math.max(1, Math.round(input.stockDays ?? 30));

  const lines: ReagentLine[] = [];
  const kgDayCoag = (doseTaken * Q) / 1000;
  const solM3Coag = kgDayCoag / (solutionPct * 10); // кг / (кг на м³ раствора)
  lines.push({
    name: coag.label,
    doseMgL: doseTaken,
    kgPerDay: r2(kgDayCoag),
    kgPerYear: Math.round(kgDayCoag * 365),
    solutionM3Day: r2(solM3Coag),
    basis: `${REAGENTS.table61Municipal.ref}: ${coag.range[0]}–${coag.range[1]} мг/л; ${coag.note}`,
  });

  let kgDayFloc = 0;
  if (input.flocculant && input.flocculant !== "none") {
    const fl = FLOCCULANTS[input.flocculant];
    const doseF = input.flocculantDoseMgL ?? fl.range[1];
    kgDayFloc = (doseF * Q) / 1000;
    lines.push({
      name: fl.label,
      doseMgL: doseF,
      kgPerDay: r2(kgDayFloc),
      kgPerYear: Math.round(kgDayFloc * 365),
      /* раствор флокулянта готовят слабым: 0,1–0,5 %, иначе не растворяется */
      solutionM3Day: r2(kgDayFloc / (0.2 * 10)),
      basis: `${REAGENTS.table61Municipal.ref}: ${fl.range[0]}–${fl.range[1]} мг/л; раствор 0,2 % — практика, при большей концентрации полимер не расходится`,
    });
  }

  /* --- камера хлопьеобразования: п. 6.274 и 6.275 --- */
  const useFloc = Boolean(input.flocculant && input.flocculant !== "none");
  const after = input.after ?? "settling";
  const minutesRange =
    after === "flotation"
      ? useFloc
        ? REAGENTS.flocculationMin.flotationFloc
        : REAGENTS.flocculationMin.flotationCoag
      : useFloc
        ? REAGENTS.flocculationMin.settlingFloc
        : REAGENTS.flocculationMin.settlingCoag;
  const flocMinutes = minutesRange[1];
  const flocChamber = (qH * flocMinutes) / 60;
  const gradient =
    after === "flotation" ? REAGENTS.gradientG.flocFlotation[1] : REAGENTS.gradientG.flocSettling[1];

  /* --- предупреждения --- */
  if (!byUser) {
    warnings.push(
      `Доза принята по ВЕРХНЕЙ границе табл. 61 — ${doseTaken} мг/л при диапазоне ${coag.range[0]}–${coag.range[1]}. Это оценка со стороны запаса: настоящая доза определяется пробным коагулированием на реальной воде, и разница между границами диапазона бывает трёхкратной. До пробы склад и годовой расход считать окончательными нельзя.`,
    );
  }
  if (kind === "feSO4") {
    warnings.push(
      `Железный купорос требует аэрируемого смесителя не менее ${REAGENTS.feSO4AeratedMixer.minMinutes} мин с подачей воздуха ${REAGENTS.feSO4AeratedMixer.airM3PerM3Min[0]}–${REAGENTS.feSO4AeratedMixer.airM3PerM3Min[1]} м³ на м³ воды в минуту (${REAGENTS.feSO4AeratedMixer.ref}): без окисления двухвалентного железа коагуляции не будет.`,
    );
  }
  if (ph !== undefined && ph > REAGENTS.coagulantByPh.alUpToPh && kind === "alum") {
    warnings.push(
      `При pH ${ph} соли алюминия работают плохо: ${REAGENTS.coagulantByPh.ref} предписывает при pH выше ${REAGENTS.coagulantByPh.alUpToPh} применять соли железа.`,
    );
  }

  const totalKgDay = kgDayCoag + kgDayFloc;

  return {
    lines,
    dailyTankM3: r2(solM3Coag),
    stockT: r2((totalKgDay * stockDays) / 1000),
    dosingPumpLh: r2((solM3Coag * 1000) / hours),
    flocChamberM3: r2(flocChamber),
    flocMinutes,
    gradientG: gradient,
    assumptions: [
      `Дозы реагентов — ${REAGENTS.table61Municipal.ref} для городских и бытовых сточных вод (${kmkRef("6.269")}).`,
      `Выбор коагулянта по pH — ${REAGENTS.coagulantByPh.ref}.`,
      `Время хлопьеобразования ${flocMinutes} мин и градиент ${gradient} с⁻¹ — ${REAGENTS.flocculationMin.ref} и ${REAGENTS.gradientG.ref} для схемы с ${after === "flotation" ? "флотацией" : "отстаиванием"}${useFloc ? " и флокулянтом" : ""}.`,
      `Концентрация рабочего раствора ${solutionPct} % и запас на складе ${stockDays} суток — решение проектировщика; норматив их не задаёт.`,
      "Расход дан по товарному продукту. Пересчёт на действующее вещество зависит от поставщика и указывается в спецификации.",
      "Цены реагентов не считаются: количества умножаются на цены заказчика.",
    ],
    warnings,
  };
}
