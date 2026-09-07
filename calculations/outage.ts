/* ==================================================================
 * ВЫВОД СООРУЖЕНИЯ В РЕМОНТ И РЕЖИМЫ ПУСКА
 *
 * Проект принимают в работающем виде, а живёт станция в двух других
 * состояниях, о которых в записках обычно молчат: когда одно
 * сооружение выключено на чистку или ремонт, и когда станцию только
 * пускают и биологии в ней ещё нет.
 *
 * ЧТО ПРОВЕРЯЕТСЯ
 * 1. Перегрузка оставшихся сооружений при выключении одного —
 *    п. 1.9 ҚМҚ 2.04.03-19 допускает 8–17 %. Это самая частая причина,
 *    по которой «две секции вместо трёх» не проходят экспертизу: две
 *    секции при выключении одной дают перегрузку 100 %, а не 17.
 * 2. Число единиц против нормативных минимумов: песколовки не менее
 *    двух (п. 6.26), первичные отстойники не менее двух и вторичные не
 *    менее трёх (п. 6.58), секции аэротенка не менее двух (п. 6.150),
 *    контактные резервуары не менее двух (п. 6.236). При минимальном
 *    числе п. 6.58 требует увеличить объём в 1,2–1,3 раза.
 *
 * ПУСКОВОЙ ПЕРИОД
 * Расчётные показатели станция даёт не с первого дня: биоценоз растёт
 * недели. Здесь приводится порядок пуска и оценка его длительности —
 * не как норматив, а как то, что должно быть написано в проекте, чтобы
 * заказчик не требовал проектных показателей на второй день после
 * подачи воды.
 * ================================================================== */

import { OUTAGE_OVERLOAD, PRIMARY_SETTLING, GRIT, AEROTANK, DISINFECTION, kmkRef } from "../norms/kmk-2-04-03-19";

export type UnitGroup = {
  /** название сооружения */
  name: string;
  /** сколько единиц запроектировано (все рабочие) */
  units: number;
  /** нормативный минимум, если он есть */
  minUnits?: number;
  /** ссылка на пункт для минимума */
  minRef?: string;
  /** можно ли останавливать станцию на время ремонта этого сооружения */
  stoppable?: boolean;
};

export type OutageRow = {
  name: string;
  units: number;
  /** перегрузка оставшихся при выключении одной единицы, % */
  overloadPct: number;
  /** допустимо ли по п. 1.9 */
  ok: boolean;
  /** нарушен ли нормативный минимум единиц */
  belowMin: boolean;
  comment: string;
};

export type OutageResult = {
  rows: OutageRow[];
  startup: { step: string; what: string; howLong: string }[];
  assumptions: string[];
  warnings: string[];
};

/** Нормативные минимумы, которые есть в оцифрованной части норм. */
export const MIN_UNITS: Record<string, { min: number; ref: string }> = {
  grit: { min: GRIT.minUnits.value, ref: GRIT.minUnits.ref },
  primary: { min: PRIMARY_SETTLING.minPrimary.value, ref: PRIMARY_SETTLING.minPrimary.ref },
  secondary: { min: PRIMARY_SETTLING.minSecondary.value, ref: PRIMARY_SETTLING.minSecondary.ref },
  aerotank: { min: AEROTANK.minSections.value, ref: AEROTANK.minSections.ref },
  contact: { min: DISINFECTION.contactTanksMin.value, ref: DISINFECTION.contactTanksMin.ref },
};

export function checkOutage(groups: UnitGroup[]): OutageResult {
  const warnings: string[] = [];
  const [lo, hi] = OUTAGE_OVERLOAD.value;

  /* СКОЛЬКО ЕДИНИЦ НУЖНО, ЧТОБЫ БУКВАЛЬНО ВЫПОЛНИТЬ п. 1.9.
     Перегрузка оставшихся при выключении одной единицы равна 1/(n−1).
     Чтобы она не превышала 17 %, нужно семь единиц. Для крупной
     станции это нормально, для посёлка на 500 м³/сут — нет: там
     физически ставят две секции.

     Поэтому здесь НЕ пишется «нужно семь песколовок». Пишется правда:
     при двух единицах перегрузка стопроцентная, п. 1.9 в буквальном
     прочтении не выполняется, и проектировщик обязан записать, как он
     это решает — ремонтом в период минимального притока, обводной
     линией, накопителем или запасом производительности. Требование,
     которое нельзя выполнить, не помогает; решение, которое записано в
     проекте, помогает. */
  const unitsForNorm = Math.ceil(1 / hi) + 1;

  const rows: OutageRow[] = groups.map((g) => {
    const n = Math.max(1, Math.round(g.units));
    const overload = n > 1 ? (1 / (n - 1)) * 100 : Infinity;
    const belowMin = g.minUnits !== undefined && n < g.minUnits;
    const ok = n > 1 && overload <= hi * 100;

    let comment: string;
    if (n === 1) {
      comment = g.stoppable
        ? "Одна единица: на время чистки или ремонта работа прекращается. Допустимо, если перерыв согласован и предусмотрен обвод или накопитель."
        : `Одна единица: вывести в ремонт нельзя, не остановив очистку. Нужен либо второй аппарат, либо обводная линия с накопителем.`;
    } else if (!ok) {
      comment =
        `При выключении одной единицы оставшиеся принимают её нагрузку: перегрузка ${overload.toFixed(0)} %. ` +
        `Буквальное выполнение ${OUTAGE_OVERLOAD.ref} (не более ${hi * 100} %) потребовало бы ${unitsForNorm} единиц — для станции такого размера это не делают. ` +
        `Решение принимает проектировщик и записывает в проекте: ремонт в период минимального притока, обводная линия, накопитель или запас производительности.`;
    } else {
      comment = `Перегрузка ${overload.toFixed(0)} % — в пределах ${lo * 100}–${hi * 100} % (${OUTAGE_OVERLOAD.ref}).`;
    }
    if (belowMin) {
      comment += ` Число единиц меньше нормативного минимума ${g.minUnits} (${g.minRef ?? "см. норму"}).`;
    }

    return {
      name: g.name,
      units: n,
      overloadPct: Number.isFinite(overload) ? Number(overload.toFixed(1)) : 100,
      ok,
      belowMin,
      comment,
    };
  });

  /* Единичные сооружения и сооружения из двух единиц — разные случаи,
     и валить их в одно предупреждение нельзя: первое означает остановку
     очистки, второе — работу с перегрузкой. */
  const single = rows.filter((r) => r.units === 1);
  const pairs = rows.filter((r) => r.units > 1 && !r.ok);
  if (single.length) {
    warnings.push(
      `В одном экземпляре: ${single.map((r) => r.name).join(", ")}. На время ремонта очистка по этим ступеням прекращается — нужен обвод, накопитель или согласованный перерыв.`,
    );
  }
  if (pairs.length) {
    warnings.push(
      `Работают с перегрузкой при выводе одной единицы в ремонт: ${pairs.map((r) => r.name).join(", ")}. ${OUTAGE_OVERLOAD.ref} допускает ${lo * 100}–${hi * 100} %; здесь больше. Это обычное решение для станций такого размера, но оно должно быть записано в проекте вместе с тем, как ремонт планируется по времени.`,
    );
  }
  const minViolations = rows.filter((r) => r.belowMin);
  if (minViolations.length) {
    warnings.push(
      `Нарушен нормативный минимум числа единиц: ${minViolations.map((r) => r.name).join(", ")}. При минимальном числе ${PRIMARY_SETTLING.minCountVolumeFactor.ref} требует увеличить расчётный объём в ${PRIMARY_SETTLING.minCountVolumeFactor.value[0]}–${PRIMARY_SETTLING.minCountVolumeFactor.value[1]} раза.`,
    );
  }

  const startup = [
    {
      step: "1. Гидравлические испытания и промывка",
      what: "заполнение ёмкостей чистой водой, проверка герметичности, отметок перелива и работы затворов; промывка трубопроводов",
      howLong: "3–7 суток",
    },
    {
      step: "2. Пусконаладка оборудования вхолостую",
      what: "проверка направления вращения, токов, срабатывания блокировок и аварийных уровней — до подачи стока, а не после",
      howLong: "3–5 суток",
    },
    {
      step: "3. Зарядка активным илом",
      what: "завоз ила с работающей станции — от 10 до 30 % рабочей дозы; без затравки биоценоз растёт вдвое дольше",
      howLong: "1–2 суток",
    },
    {
      step: "4. Наращивание ила",
      what: "подача стока с постепенным увеличением нагрузки, ежедневный контроль дозы ила, оседаемости, кислорода и БПК на выходе",
      howLong: "3–6 недель при температуре выше 15 °C, дольше в холодный период",
    },
    {
      step: "5. Выход на расчётный режим",
      what: "проектные показатели предъявляются только после стабилизации: три недели устойчивых анализов подряд, а не один удачный",
      howLong: "суммарно 1,5–2,5 месяца от подачи стока",
    },
  ];

  return {
    rows,
    startup,
    assumptions: [
      `Допустимая перегрузка при выключении одного сооружения — ${lo * 100}–${hi * 100} % (${OUTAGE_OVERLOAD.ref}).`,
      `Нормативные минимумы числа единиц: песколовки ${GRIT.minUnits.value} (${GRIT.minUnits.ref}), первичные отстойники ${PRIMARY_SETTLING.minPrimary.value} и вторичные ${PRIMARY_SETTLING.minSecondary.value} (${PRIMARY_SETTLING.minPrimary.ref}), секции аэротенка ${AEROTANK.minSections.value} (${AEROTANK.minSections.ref}), контактные резервуары ${DISINFECTION.contactTanksMin.value} (${DISINFECTION.contactTanksMin.ref}).`,
      `При минимальном числе отстойников расчётный объём увеличивается в ${PRIMARY_SETTLING.minCountVolumeFactor.value[0]}–${PRIMARY_SETTLING.minCountVolumeFactor.value[1]} раза (${PRIMARY_SETTLING.minCountVolumeFactor.ref}).`,
      "Продолжительность пусковых работ — практика эксплуатации, ҚМҚ 2.04.03-19 её не нормирует. Приведена для того, чтобы сроки выхода на проектные показатели были записаны в проекте, а не выяснялись после подачи стока.",
    ],
    warnings,
  };
}

/** Готовый набор групп по цепочке очистки — чтобы не собирать вручную. */
export function groupsFromChain(chain: string[], counts: Partial<Record<string, number>> = {}): UnitGroup[] {
  const g: UnitGroup[] = [];
  const add = (key: string, name: string, fallback: number, min?: { min: number; ref: string }, stoppable = false) => {
    if (!chain.includes(key)) return;
    g.push({ name, units: counts[key] ?? fallback, minUnits: min?.min, minRef: min?.ref, stoppable });
  };
  add("screen", "Решётки", 1, undefined, true);
  add("grit", "Песколовки", 2, MIN_UNITS.grit);
  add("avg", "Усреднитель", 1, undefined, true);
  add("primary", "Первичные отстойники", 2, MIN_UNITS.primary);
  add("bio", "Секции аэротенка", 2, MIN_UNITS.aerotank);
  add("second", "Вторичные отстойники", 3, MIN_UNITS.secondary);
  add("mbr", "Мембранные секции", 2, MIN_UNITS.aerotank);
  add("post", "Фильтры доочистки", 2);
  add("disinfect", "Контактные резервуары", 2, MIN_UNITS.contact);
  add("sludge", "Илоуплотнители", 2);
  return g;
}
