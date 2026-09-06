/* ==================================================================
 * ЭКСПЛУАТАЦИОННЫЕ ПОКАЗАТЕЛИ СТАНЦИИ — В НАТУРЕ, БЕЗ ЦЕН
 *
 * Сколько станция потребляет и производит за год: электроэнергия,
 * реагенты, осадок, вода на собственные нужды, персонал. Всё в
 * натуральных единицах — киловатт-часах, килограммах, кубометрах,
 * человеко-часах.
 *
 * ПОЧЕМУ БЕЗ ЦЕН
 * Цена киловатт-часа, гипохлорита и вывоза осадка меняется чаще, чем
 * выходит проект, и различается у каждого заказчика. Число, вбитое в
 * код, устареет в тот же месяц и будет выглядеть достоверным ещё
 * годы — это хуже, чем отсутствие числа. Поэтому здесь только
 * количества; умножить их на свой тариф заказчик может в одну строку,
 * и тогда деньги будут его, а не наши выдуманные.
 *
 * Нормативная база: прирост ила — ф. (67) п. 6.148, влажность осадка
 * и уплотнение — п. 6.351 и табл. 64, доза хлора — п. 6.230. Всё
 * остальное — режим работы, штат, расход воды на промывку — практика
 * эксплуатации, и это помечено.
 * ================================================================== */

import { DISINFECTION, SLUDGE, kmkRef } from "../norms/kmk-2-04-03-19";
import { excessSludgeMgL } from "./compare";

export type OpexInput = {
  /** расход, м³/сут */
  flowM3Day: number;
  /** БПКполн на входе, мг/л */
  bodFullMgL: number;
  /** взвешенные вещества на входе в биологию, мг/л */
  tssMgL: number;
  /** годовое потребление электроэнергии, кВт·ч — из электрической
   *  ведомости (powerEstimate в industry/construction.ts). Отдельного
   *  расчёта электрики здесь нет: она уже сделана там, и дублировать её
   *  значит завести два разных числа для одного и того же. */
  yearKWh?: number;
  /** обеззараживание хлором: доза по п. 6.230 или своя, г/м³ */
  chlorineDoseGM3?: number;
  /** обеззараживание ультрафиолетом (реагентов не требует) */
  uv?: boolean;
  /** влажность обезвоженного осадка, % — куда осадок уходит с площадки */
  cakeMoisturePct?: number;
  /** флокулянт на обезвоживание, кг на тонну сухого вещества */
  flocculantKgPerTDS?: number;
  /** число смен в сутки */
  shifts?: number;
  /** человек в смене */
  perShift?: number;
};

export type OpexLine = {
  name: string;
  /** количество в год */
  perYear: number;
  unit: string;
  /** удельно на 1 м³ очищенной воды */
  perM3: number;
  basis: string;
};

export type OpexResult = {
  lines: OpexLine[];
  /** сухое вещество осадка, кг/сут */
  sludgeDryKgDay: number;
  /** обезвоженный осадок, м³/сут */
  cakeM3Day: number;
  assumptions: string[];
  warnings: string[];
};

/** Практические величины эксплуатации — не норматив. */
export const OPEX_PRACTICE = {
  flocculantKgPerTDS: { value: 5, note: "флокулянт 5 кг на тонну сухого вещества — практика для механического обезвоживания; уточняется пробным обезвоживанием" },
  cakeMoisturePct: { value: 78, note: "влажность обезвоженного осадка 78 % — практика для шнекового и ленточного обезвоживания; на иловых площадках 70–75 % после подсушки" },
  cakeDensityTM3: { value: 1.05, note: "плотность обезвоженного осадка 1,05 т/м³ — практика" },
  ownWaterShare: { value: 0.02, note: "расход воды на собственные нужды 2 % от расхода станции (промывка, приготовление реагентов, поливка) — практика" },
  shiftHours: { value: 8, note: "смена 8 часов" },
} as const;

export function calculateOpex(input: OpexInput): OpexResult {
  const warnings: string[] = [];
  const lines: OpexLine[] = [];
  const Q = Math.max(0, input.flowM3Day);
  const yearM3 = Q * 365;
  const add = (name: string, perYear: number, unit: string, basis: string) => {
    lines.push({
      name,
      perYear: Number(perYear.toFixed(perYear >= 100 ? 0 : 2)),
      unit,
      perM3: yearM3 > 0 ? Number((perYear / yearM3).toFixed(4)) : 0,
      basis,
    });
  };

  /* --- электроэнергия --- */
  if (input.yearKWh && input.yearKWh > 0) {
    add("Электроэнергия", input.yearKWh, "кВт·ч", "ведомость электрических потребителей");
  } else {
    warnings.push("Электрический расчёт не выполнен — потребление энергии в показатели не вошло, а это обычно главная статья эксплуатации.");
  }

  /* --- осадок: прирост по ф. (67) ---
     Функция excessSludgeMgL даёт «чистый» прирост P = 0,8·C + K·L.
     Для расчёта уплотнителей, обезвоживания и перекачки примечание к
     п. 6.148 требует увеличить его в 1,3 раза — а здесь речь именно об
     этом: осадок надо уплотнить, обезводить и вывезти. Без множителя
     иловое хозяйство и вывоз занижаются на треть, а это деньги
     эксплуатации каждый месяц. */
  const growthMgL = excessSludgeMgL(input.tssMgL, input.bodFullMgL) * SLUDGE.thickener.designFactor;
  const dryKgDay = (growthMgL * Q) / 1000;
  const cakeMoisture = input.cakeMoisturePct ?? OPEX_PRACTICE.cakeMoisturePct.value;
  const cakeTDay = dryKgDay / 1000 / (1 - cakeMoisture / 100);
  const cakeM3Day = cakeTDay / OPEX_PRACTICE.cakeDensityTM3.value;

  add("Осадок по сухому веществу", (dryKgDay * 365) / 1000, "т", `прирост ила по ф. (67), ${kmkRef("6.148")}`);
  add(
    `Осадок обезвоженный (влажность ${cakeMoisture} %)`,
    cakeM3Day * 365,
    "м³",
    `${OPEX_PRACTICE.cakeMoisturePct.note}; плотность ${OPEX_PRACTICE.cakeDensityTM3.value} т/м³`,
  );

  /* --- флокулянт --- */
  const floc = input.flocculantKgPerTDS ?? OPEX_PRACTICE.flocculantKgPerTDS.value;
  add("Флокулянт на обезвоживание", ((dryKgDay / 1000) * floc) * 365, "кг", OPEX_PRACTICE.flocculantKgPerTDS.note);

  /* --- обеззараживание --- */
  if (input.uv) {
    add("Реагенты на обеззараживание", 0, "кг", `ультрафиолет реагентов не требует (${kmkRef("6.229")}); расход энергии учтён в электрической части`);
  } else {
    const dose = input.chlorineDoseGM3 ?? DISINFECTION.chlorineDose.afterBio;
    add(
      `Активный хлор (доза ${dose} г/м³)`,
      (dose * Q * 365) / 1000,
      "кг",
      `${kmkRef("6.230")}: после биологической очистки 3 г/м³, после механической 10 г/м³`,
    );
  }

  /* --- вода на собственные нужды --- */
  add(
    "Вода на собственные нужды",
    Q * OPEX_PRACTICE.ownWaterShare.value * 365,
    "м³",
    OPEX_PRACTICE.ownWaterShare.note,
  );

  /* --- персонал --- */
  const shifts = Math.max(1, Math.round(input.shifts ?? (Q > 5000 ? 3 : 1)));
  const perShift = Math.max(1, Math.round(input.perShift ?? (Q > 5000 ? 2 : 1)));
  const manHours = shifts * perShift * OPEX_PRACTICE.shiftHours.value * 365;
  add(
    `Персонал: ${shifts} смен × ${perShift} чел.`,
    manHours,
    "чел.·ч",
    "штат принят проектировщиком; ҚМҚ 2.04.03-19 численность эксплуатационного персонала не нормирует",
  );

  if (Q > 5000 && shifts < 3) {
    warnings.push("При расходе свыше 5000 м³/сут станция обычно работает круглосуточно: проверьте число смен.");
  }
  if (cakeMoisture < 70) {
    warnings.push(`Влажность обезвоженного осадка ${cakeMoisture} % — ниже достижимой на обычном оборудовании; проверьте, чем обезвоживаете.`);
  }

  const assumptions = [
    `Прирост избыточного ила — ф. (67) ${kmkRef("6.148")}: P = 0,8·C + K·L при ВВ ${input.tssMgL} мг/л и БПКполн ${input.bodFullMgL} мг/л, с коэффициентом 1,3 на уплотнение, обезвоживание и перекачку (примечание к п. 6.148).`,
    `Уплотнение и влажность осадка — ${kmkRef("6.351", "табл. 64")}; влажность после обезвоживания: ${OPEX_PRACTICE.cakeMoisturePct.note}.`,
    `Доза активного хлора — ${kmkRef("6.230")}.`,
    OPEX_PRACTICE.flocculantKgPerTDS.note + ".",
    OPEX_PRACTICE.ownWaterShare.note + ".",
    "Цены и тарифы в расчёт не входят: показатели даны в натуральных единицах, стоимость считается по действующим у заказчика ценам.",
    "Годовые количества посчитаны на 365 суток непрерывной работы; при сезонной нагрузке (курорт, консервный завод) пересчитать по фактическому числу суток.",
  ];

  return {
    lines,
    sludgeDryKgDay: Number(dryKgDay.toFixed(1)),
    cakeM3Day: Number(cakeM3Day.toFixed(2)),
    assumptions,
    warnings,
  };
}
