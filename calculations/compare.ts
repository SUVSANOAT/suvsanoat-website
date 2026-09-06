/* ==================================================================
 * СРАВНЕНИЕ ВАРИАНТОВ ТЕХНОЛОГИЙ НА ОДНОМ РАСХОДЕ
 *
 * Задача модуля — не «поставить оценку» технологии, а посчитать по
 * одним и тем же исходным данным те величины, которыми варианты
 * действительно различаются на стадии выбора схемы: объём биологии,
 * вторичный отстойник, площадь в плане, воздух и мощность
 * воздуходувок, прирост избыточного ила, качество на выходе.
 *
 * Всё, что можно посчитать по ҚМҚ 2.04.03-19, считается по нормам, и
 * рядом с числом стоит пункт. Всё остальное (КПД воздуходувки,
 * коэффициент на проходы и обвязку, задержание взвеси мембраной)
 * помечено как практика или допущение и вынесено в `assumptions` —
 * записка и экспертиза должны видеть, где кончается норматив.
 *
 * ЧЕГО МОДУЛЬ НЕ ДЕЛАЕТ. Он не считает деньги и не выбирает за
 * проектировщика. Ранжирование по «лучше/хуже» даётся по каждому
 * показателю отдельно; сводного балла нет намеренно — вес площади
 * против веса эксплуатации задаёт заказчик, а не программа.
 * ================================================================== */

import {
  AEROTANK,
  STAGE_EFFECTS,
  BOD5_TO_BODFULL,
  kmkRef,
  secondaryClarifierLoad,
  kMaxByDailyFlow,
} from "../norms/kmk-2-04-03-19";
import {
  calculateTechnology,
  type TechnologyCode,
  type TechnologyInput,
} from "./technology";

/** Технологии, которые имеет смысл сравнивать между собой: все они —
 *  аэробная биологическая ступень на один и тот же расход. Мешать сюда
 *  анаэробные (UASB, ABR, ANBR) нельзя: у них другая задача, другое
 *  качество на выходе и после них всё равно нужна аэробная доочистка,
 *  поэтому «сравнение» с ними было бы подтасовкой. */
export const COMPARABLE: readonly TechnologyCode[] = ["CAS", "SBR", "MBBR", "IFAS", "MBR"] as const;

export type CompareCode = (typeof COMPARABLE)[number];

export const COMPARE_NAMES: Record<CompareCode, string> = {
  CAS: "Классический аэротенк",
  SBR: "SBR — циклический реактор",
  MBBR: "MBBR — подвижная биоплёнка",
  IFAS: "IFAS — гибридная биомасса",
  MBR: "MBR — мембранный биореактор",
};

export type CompareInput = TechnologyInput & {
  /** рабочая глубина биологической ступени, м; п. 6.150 — 3…6 м */
  depthM?: number;
  /** глубина зоны отстаивания вторичного отстойника H_set, м (ф. 85) */
  clarifierDepthM?: number;
  /** взвешенные вещества на входе в биологию, мг/л; при наличии
   *  первичного отстойника — уже после него. Не задано — берётся
   *  tssMgL исходной воды (компактные станции без первички). */
  tssToBiologyMgL?: number;
};

export type CompareOption = {
  technology: CompareCode;
  name: string;
  /** объём биологической ступени с запасом 15 %, м³ */
  volumeM3: number;
  /** площадь вторичных отстойников, м²; 0 — сооружение не нужно */
  clarifierAreaM2: number;
  /** гидравлическая нагрузка на отстойник q_ssa, м³/(м²·ч); 0 — нет отстойника */
  clarifierLoad: number;
  /** площадь застройки блока, м² (оценка, см. assumptions) */
  footprintM2: number;
  /** расход воздуха, Нм³/ч */
  airNm3H: number;
  /** установленная мощность воздуходувок (рабочие), кВт */
  blowerKW: number;
  /** прирост избыточного ила по сухому веществу, кг/сут */
  excessSludgeKgDay: number;
  /** объём избыточного ила при влажности 99,2 %, м³/сут */
  excessSludgeM3Day: number;
  /** взвешенные вещества на выходе, мг/л */
  effluentSsMgL: number;
  /** БПКполн на выходе, мг/л */
  effluentBodFullMgL: number;
  /** нужна ли ступень доочистки, чтобы выйти на 3–6 мг/л */
  needsTertiary: boolean;
  /** сильные стороны варианта — короткие проверяемые утверждения */
  pros: string[];
  /** слабые стороны */
  cons: string[];
};

export type CompareRow = {
  key: string;
  label: string;
  unit: string;
  /** ссылка на пункт нормы либо пометка «практика» */
  ref: string;
  values: Record<CompareCode, number>;
  /** какое значение считать лучшим при прочих равных */
  better: "low" | "high" | "none";
};

export type CompareResult = {
  options: CompareOption[];
  rows: CompareRow[];
  assumptions: string[];
  /** пояснение, почему сводного балла нет */
  verdict: string;
};

const r2 = (x: number) => (Number.isFinite(x) ? Number(x.toFixed(2)) : 0);
const r1 = (x: number) => (Number.isFinite(x) ? Number(x.toFixed(1)) : 0);
const pos = (x: number | undefined, fallback: number) =>
  Number.isFinite(x as number) && (x as number) > 0 ? (x as number) : fallback;

/* ------------------------------------------------------------------
 * ИЛОВЫЙ ИНДЕКС J_i — табл. 42 ҚМҚ 2.04.03-19 (п. 6.146)
 *
 * Таблица немонотонная: индекс сначала падает с ростом нагрузки, при
 * q_i ≈ 300 мг/(г·сут) достигает минимума 70 см³/г и дальше растёт.
 * Поэтому интерполировать надо между соседними строками как есть, не
 * «сортируя по возрастанию индекса».
 * ------------------------------------------------------------------ */
export function sludgeIndex(qiMgGDay: number): number {
  const t = AEROTANK.table42MunicipalSvi;
  const q = Math.max(t[0].qi, Math.min(t[t.length - 1].qi, qiMgGDay));
  for (let i = 0; i < t.length - 1; i += 1) {
    const a = t[i];
    const b = t[i + 1];
    if (q >= a.qi && q <= b.qi) {
      const k = (q - a.qi) / (b.qi - a.qi);
      return a.ji + (b.ji - a.ji) * k;
    }
  }
  return t[t.length - 1].ji;
}

/* ------------------------------------------------------------------
 * ПРИРОСТ ИЗБЫТОЧНОГО ИЛА — ф. (67) п. 6.148
 *   P_i = 0,8·C_cdp + K_g·L_en, мг/л
 * C_cdp — взвешенные вещества на входе в аэротенк, L_en — БПКполн
 * на входе. Для расчёта илоуплотнителей и насосов сырого ила величина
 * умножается на 1,3 (то же п. 6.148); в сравнении даём «чистый»
 * прирост, множитель применяется дальше, при расчёте иловой части.
 * ------------------------------------------------------------------ */
export function excessSludgeMgL(tssInMgL: number, bodFullInMgL: number): number {
  const g = AEROTANK.sludgeGrowth;
  return g.ssFactor * tssInMgL + g.bodFactorMunicipal * bodFullInMgL;
}

/* ------------------------------------------------------------------
 * МОЩНОСТЬ ВОЗДУХОДУВКИ
 *
 * Норматив мощность не задаёт — это машиностроение, не ҚМҚ. Считаем
 * по адиабатическому сжатию воздуха:
 *   N = (Q/3600)·p₁·(k/(k−1))·[(p₂/p₁)^((k−1)/k) − 1] / η
 * k = 1,4; p₁ = 101,3 кПа; противодавление — столб воды над
 * аэратором h_a = 4 м (39 кПа) плюс потери в трубопроводе и на
 * диффузоре, принятые 6 кПа (практика); η = 0,6 — полный КПД
 * воздуходувки с приводом. Величина ориентировочная, для сравнения
 * вариантов и оценки энергопотребления; окончательно — по паспорту
 * подобранной машины.
 * ------------------------------------------------------------------ */
export const BLOWER = {
  k: 1.4,
  p1kPa: 101.3,
  submergenceM: 4,
  lossesKPa: 6,
  efficiency: 0.6,
  note: "практика, не ҚМҚ 2.04.03-19",
} as const;

export function blowerPowerKW(airNm3H: number): number {
  if (!(airNm3H > 0)) return 0;
  const { k, p1kPa, submergenceM, lossesKPa, efficiency } = BLOWER;
  const p2 = p1kPa + submergenceM * 9.81 + lossesKPa;
  const ratio = p2 / p1kPa;
  const work = (k / (k - 1)) * (Math.pow(ratio, (k - 1) / k) - 1); // безразмерная
  // Q в Нм³/ч → м³/с; p1 в кПа → кН/м²; произведение даёт кВт
  return ((airNm3H / 3600) * p1kPa * work) / efficiency;
}

/** Ключевая метрика из результата расчёта технологии. */
function metricOf(res: ReturnType<typeof calculateTechnology>, key: string): number {
  const m = res.specialized.find((x) => x.key === key);
  return m ? m.value : 0;
}

/* ------------------------------------------------------------------
 * ОДИН ВАРИАНТ
 * ------------------------------------------------------------------ */
function buildOption(code: CompareCode, input: CompareInput): CompareOption {
  const res = calculateTechnology({ ...input, technology: code });

  const depth = pos(input.depthM, 4);
  const hSet = pos(input.clarifierDepthM, 3);
  const flow = pos(input.flowM3Day, 0);
  const qPeak = res.hydraulic.qPeak;

  /* Объём. Все ветви расчёта кладут итог в метрику `volume`; запас
     15 % на неравномерность и ремонт добавляем здесь одинаково для
     всех вариантов, иначе сравнение было бы нечестным. */
  const volumeM3 = metricOf(res, "volume") * 1.15;

  const airNm3H = metricOf(res, "air");
  const blowerKW = blowerPowerKW(airNm3H);

  /* Вторичный отстойник. Нужен там, где ил отделяется осаждением:
     CAS, MBBR, IFAS. У SBR отстаивание идёт в самом реакторе (фаза
     цикла), у MBR разделение — на мембране (см. norms/uz-membrane
     -requirement.ts). */
  const needsClarifier = code === "CAS" || code === "MBBR" || code === "IFAS";

  /* Доза ила a_i, г/л. Для CAS взята из его же расчёта (MLSS = 3,0).
     Для MBBR биомасса живёт на носителях, во взвеси её мало —
     принимаем 1,5 г/л; IFAS — промежуточный случай, 2,5 г/л. Обе
     величины ҚМҚ не нормирует, это практика, и она указана в
     допущениях. */
  const doseGL = code === "CAS" ? metricOf(res, "mlss") || 3 : code === "IFAS" ? 2.5 : 1.5;

  const bodFullIn = input.bodMgL / BOD5_TO_BODFULL;
  const bodFullOut = STAGE_EFFECTS.biological.bodFullOutMgL[0]; // 15 мг/л
  const ash = AEROTANK.table41Municipal.ashS;

  let clarifierLoad = 0;
  let clarifierAreaM2 = 0;
  if (needsClarifier && doseGL > 0 && res.hydraulic.hrt > 0) {
    // q_i по ф. (57) п. 6.146 — нагрузка на ил, от неё зависит J_i
    const qi = (24 * (bodFullIn - bodFullOut)) / (doseGL * (1 - ash) * res.hydraulic.hrt);
    const ji = sludgeIndex(qi);
    clarifierLoad = secondaryClarifierLoad(hSet, ji, doseGL, "radial");
    // площадь — по МАКСИМАЛЬНОМУ часовому притоку: отстойник, подобранный
    // по среднему, в час пик выносит ил (п. 6.170)
    clarifierAreaM2 = clarifierLoad > 0 ? qPeak / clarifierLoad : 0;
  }

  /* Площадь застройки блока. Считается как площадь ёмкостей в плане
     плюс коэффициент на проходы, обвязку и обслуживание. Коэффициент
     1,4 — практика компоновки, не норматив; санитарно-защитная зона
     сюда не входит, она считается отдельно (табл. 1). */
  const SERVICE = 1.4;
  const bioAreaM2 = depth > 0 ? volumeM3 / depth : 0;
  /* У MBR мембраны погружены в отдельную камеру рядом с биореактором;
     по компоновкам SUVSANOAT она занимает порядка 20 % площади
     биологии — допущение, уточняется по выбранным модулям. */
  const membraneAreaM2 = code === "MBR" ? bioAreaM2 * 0.2 : 0;
  const footprintM2 = (bioAreaM2 + membraneAreaM2 + clarifierAreaM2) * SERVICE;

  /* Прирост ила. Формула (67) одна для всех аэробных схем — норматив
     не делит прирост по типам аэротенков. Разница между вариантами
     появляется не здесь, а в возрасте ила: при длительной аэрации
     (MBR, продлённая аэрация) фактический прирост ниже расчётного, и
     это отмечено в минусах/плюсах, а не подгонкой цифры. */
  const tssToBio = pos(input.tssToBiologyMgL, input.tssMgL);
  const growthMgL = excessSludgeMgL(tssToBio, bodFullIn);
  const excessSludgeKgDay = (growthMgL * flow) / 1000;
  /* Влажность избыточного ила из вторичного отстойника принята
     99,2 % (п. 6.351/табл. 64 даёт 99,5 % для неуплотнённого ила
     из аэротенка; 99,2 % — значение после илососа отстойника,
     практика). Плотность 1 т/м³. */
  const moisture = 0.992;
  const excessSludgeM3Day = excessSludgeKgDay / (1000 * (1 - moisture));

  /* Качество на выходе. Для схем с осаждением — п. 6.10: ВВ 20 мг/л,
     БПКполн 15–25 мг/л. Для MBR норматив значений не даёт: мембрана
     задерживает всю взвесь, и в паспортах пишут < 1–5 мг/л. Ставим
     верхнюю границу 5 мг/л и помечаем как паспортную, не нормативную. */
  const isMembrane = code === "MBR";
  const effluentSsMgL = isMembrane ? 5 : STAGE_EFFECTS.biological.ssOutMgL;
  const effluentBodFullMgL = isMembrane ? 10 : STAGE_EFFECTS.biological.bodFullOutMgL[1];
  // доочистка (п. 6.10) даёт 3–6 мг/л; если биология уже в этих пределах — не нужна
  const needsTertiary = effluentSsMgL > STAGE_EFFECTS.tertiary.ssOutMgL[1];

  const pros: string[] = [];
  const cons: string[] = [];

  if (code === "CAS") {
    pros.push("Самая понятная в эксплуатации схема: персонал обучается быстро, запчасти есть везде.");
    pros.push("Нет расходных материалов — ни носителей, ни мембран.");
    cons.push("Наибольшая площадь: нужен вторичный отстойник, а он занимает больше самого аэротенка.");
    cons.push("Качество на выходе ограничено выносом ила; для сброса в водоём нужна доочистка.");
  }
  if (code === "SBR") {
    pros.push("Вторичный отстойник не нужен — отстаивание идёт в том же реакторе.");
    pros.push("Легко подстраивается под неравномерный приток изменением длительности фаз.");
    cons.push("Вся работа держится на автоматике: отказ контроллера или декантера останавливает линию.");
    cons.push("Реактор считается на объём цикла, а не на средний расход, поэтому ёмкость крупнее, чем кажется.");
  }
  if (code === "MBBR") {
    pros.push("Ил не надо возвращать: биомасса держится на носителях, схема проще по обвязке.");
    pros.push("Переносит перерывы в притоке и залповые нагрузки лучше классики.");
    cons.push("Носители — расходный материал и валюта; при заказе за рубежом это срок поставки.");
    cons.push("Вторичный отстойник всё равно нужен: биоплёнка отслаивается и уходит с водой.");
  }
  if (code === "IFAS") {
    pros.push("Позволяет поднять производительность существующего аэротенка без нового строительства.");
    pros.push("Устойчивее классики по нитрификации в холодный период.");
    cons.push("Совмещает недостатки обеих схем: и возврат ила, и носители, и отстойник.");
    cons.push("Сложнее в наладке — надо балансировать взвешенную и прикреплённую биомассу.");
  }
  if (code === "MBR") {
    pros.push("Наименьшая площадь: отстойник не нужен, доза ила выше, объём биологии меньше.");
    pros.push("Стабильное качество на выходе независимо от того, как оседает ил.");
    cons.push("Мембраны — покупное изделие с ограниченным ресурсом и регулярной химической промывкой.");
    cons.push("Требует тонкой решётки перед модулями и дисциплины эксплуатации; ошибки персонала стоят мембран.");
  }

  return {
    technology: code,
    name: COMPARE_NAMES[code],
    volumeM3: r1(volumeM3),
    clarifierAreaM2: r1(clarifierAreaM2),
    clarifierLoad: r2(clarifierLoad),
    footprintM2: r1(footprintM2),
    airNm3H: r1(airNm3H),
    blowerKW: r1(blowerKW),
    excessSludgeKgDay: r1(excessSludgeKgDay),
    excessSludgeM3Day: r2(excessSludgeM3Day),
    effluentSsMgL,
    effluentBodFullMgL,
    needsTertiary,
    pros,
    cons,
  };
}

/* ------------------------------------------------------------------
 * СРАВНЕНИЕ
 * ------------------------------------------------------------------ */
export function compareTechnologies(
  input: CompareInput,
  codes: readonly CompareCode[] = COMPARABLE,
): CompareResult {
  const list = codes.length ? codes : COMPARABLE;
  const options = list.map((c) => buildOption(c, input));

  const pick = (get: (o: CompareOption) => number): Record<CompareCode, number> => {
    const out = {} as Record<CompareCode, number>;
    options.forEach((o) => {
      out[o.technology] = get(o);
    });
    return out;
  };

  const rows: CompareRow[] = [
    {
      key: "volume",
      label: "Объём биологической ступени (+15 %)",
      unit: "м³",
      ref: kmkRef("6.142", "ф. (51)"),
      values: pick((o) => o.volumeM3),
      better: "low",
    },
    {
      key: "clarifierArea",
      label: "Площадь вторичных отстойников",
      unit: "м²",
      ref: kmkRef("6.170", "ф. (85)"),
      values: pick((o) => o.clarifierAreaM2),
      better: "low",
    },
    {
      key: "footprint",
      label: "Площадь застройки блока (оценка)",
      unit: "м²",
      ref: "оценка компоновки, не норматив",
      values: pick((o) => o.footprintM2),
      better: "low",
    },
    {
      key: "air",
      label: "Расход воздуха",
      unit: "Нм³/ч",
      ref: kmkRef("6.156", "ф. (70)"),
      values: pick((o) => o.airNm3H),
      better: "low",
    },
    {
      key: "blower",
      label: "Мощность воздуходувок (рабочие)",
      unit: "кВт",
      ref: "адиабата, КПД 0,6 — практика",
      values: pick((o) => o.blowerKW),
      better: "low",
    },
    {
      key: "sludge",
      label: "Прирост избыточного ила",
      unit: "кг СВ/сут",
      ref: kmkRef("6.148", "ф. (67)"),
      values: pick((o) => o.excessSludgeKgDay),
      better: "low",
    },
    {
      key: "effluentSs",
      label: "Взвешенные вещества на выходе",
      unit: "мг/л",
      ref: kmkRef("6.10"),
      values: pick((o) => o.effluentSsMgL),
      better: "low",
    },
    {
      key: "effluentBod",
      label: "БПКполн на выходе",
      unit: "мг/л",
      ref: kmkRef("6.10"),
      values: pick((o) => o.effluentBodFullMgL),
      better: "low",
    },
  ];

  const kGen = kMaxByDailyFlow(pos(input.flowM3Day, 0));
  const assumptions: string[] = [
    `Все варианты посчитаны на один расход ${pos(input.flowM3Day, 0)} м³/сут и одни концентрации; ` +
      `максимальный часовой расход K gen.max = ${kGen.kMax.toFixed(2)} (${kGen.source}) одинаков для всех.`,
    `Объём биологии — по времени аэрации соответствующей схемы с общим запасом 15 %. ` +
      `Температурная поправка 15/T_w ${kmkRef("6.143", "прим.")} применена ко всем вариантам одинаково.`,
    `Вторичные отстойники — по ф. (85) ${kmkRef("6.170")} при глубине зоны отстаивания ` +
      `${pos(input.clarifierDepthM, 3)} м, иловый индекс — по табл. 42 от нагрузки на ил (ф. (57), п. 6.146). ` +
      `Площадь взята по максимальному часовому притоку.`,
    "Доза ила: CAS — из расчёта схемы (3,0 г/л); IFAS — 2,5 г/л; MBBR — 1,5 г/л. Последние две ҚМҚ не нормирует, это практика проектирования.",
    `Площадь застройки — оценка: объём делится на рабочую глубину ${pos(input.depthM, 4)} м, ` +
      "добавляется вторичный отстойник и коэффициент 1,4 на проходы и обвязку. Санитарно-защитная зона (табл. 1) сюда не входит.",
    `Мощность воздуходувок — адиабатическое сжатие при противодавлении ${BLOWER.submergenceM} м вод. ст. ` +
      `плюс ${BLOWER.lossesKPa} кПа потерь, КПД ${BLOWER.efficiency}; ${BLOWER.note}. Окончательно — по паспорту машины.`,
    `Прирост ила — по ф. (67) ${kmkRef("6.148")} одинаково для всех аэробных схем: норматив не делит прирост по типам аэротенков. ` +
      "При длительном возрасте ила (MBR, продлённая аэрация) фактический прирост ниже расчётного.",
    "Качество на выходе для схем с осаждением — по п. 6.10 (ВВ 20 мг/л, БПКполн 15–25 мг/л). " +
      "Для MBR норматив значений не даёт; принято ВВ 5 мг/л и БПКполн 10 мг/л — это паспортные величины мембран, а не норма.",
    "Стоимость строительства и эксплуатации здесь не считается: она зависит от цен на момент закупки и считается отдельно.",
  ];

  const verdict =
    "Сводного балла намеренно нет. Площадь, энергопотребление, качество на выходе и сложность эксплуатации " +
    "имеют разный вес у разных заказчиков: там, где земля дешёвая, а обслуживать некому, классический аэротенк " +
    "выигрывает у MBR по совокупности, хотя проигрывает ему в каждой строке по площади. Решение принимает проектировщик.";

  return { options, rows, assumptions, verdict };
}
