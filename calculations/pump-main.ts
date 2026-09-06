/* ==================================================================
 * НАПОРНЫЙ УЧАСТОК ОТ КНС: ДИАМЕТР, ПОТЕРИ, НАПОР, НАСОСЫ
 *
 * Когда самотёк кончается — глубина упирается в предел или трасса идёт
 * в гору, — ставится насосная станция и напорный трубопровод. Здесь
 * считается то, что нужно, чтобы заказать насос: подача, полный напор,
 * мощность на валу и объём приёмного резервуара.
 *
 * ЧТО ЗДЕСЬ ОТ НОРМЫ, А ЧТО ОТ ПРАКТИКИ — РАЗДЕЛЕНО ЖЁСТКО
 *
 * ҚМҚ 2.04.03-19 напорные трубопроводы канализации подробно не
 * нормирует: п. 2.30 отсылает к ШНК 2.04.02-97* (водоснабжение).
 * Из ҚМҚ здесь применяются только:
 *   — п. 2.36: наибольшая расчётная скорость 8 м/с для металлических
 *     труб и 4 м/с для неметаллических;
 *   — п. 5.18: приёмный резервуар не менее 5-минутной максимальной
 *     подачи одного насоса.
 *
 * Всё остальное — экономичная скорость, незаиливающая скорость в
 * напорной линии, эквивалентная шероховатость, доля местных потерь,
 * свободный напор на выпуске, КПД насоса — практика проектирования.
 * Каждая такая величина возвращается в `assumptions` с пометкой
 * «практика», чтобы в записке было видно, где кончается норматив.
 *
 * ГИДРАВЛИЧЕСКИЙ УДАР ЗДЕСЬ НЕ СЧИТАЕТСЯ. Это отдельная задача, и
 * решать её «между делом» нельзя: при длинной напорной линии защита
 * от удара определяет и трубу, и арматуру. В результате стоит прямое
 * указание, когда такой расчёт обязателен.
 * ================================================================== */

import { SEWER_NETWORK, kmkRef, PUMP_STATIONS } from "../norms/kmk-2-04-03-19";

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const PUMP_MAIN = {
  /** экономичная скорость в напорной линии, м/с */
  economicVelocity: { min: 1.0, max: 1.6, note: "экономичная скорость 1,0–1,6 м/с — практика; ҚМҚ 2.04.03-19 напорные линии не нормирует (п. 2.30 отсылает к ШНК 2.04.02-97*)" },
  /** незаиливающая скорость: ниже неё осадок ложится в напорной трубе */
  selfCleansing: { value: 0.9, note: "наименьшая скорость 0,9 м/с в напорном трубопроводе — практика: ниже неё взвесь откладывается и сечение зарастает" },
  /** эквивалентная шероховатость, мм */
  roughnessMm: { steel: 1.0, plastic: 0.05, castIron: 1.0, note: "эквивалентная шероховатость: сталь и чугун в эксплуатации 1,0 мм, полиэтилен 0,05 мм — практика" },
  /** доля местных потерь от линейных, если не задана сумма ζ */
  localShare: { value: 0.15, note: "местные сопротивления приняты 15 % от потерь по длине — практика для короткой линии с обвязкой; при длинной трассе доля меньше, при насыщенной арматуре — больше" },
  /** свободный напор в конце напорной линии, м */
  freeHead: { value: 2, note: "свободный напор на выпуске 2 м — практика (излив в приёмную камеру очистных)" },
  /** КПД насоса и двигателя */
  efficiency: { pump: 0.7, motor: 0.92, note: "КПД насоса 0,70 и двигателя 0,92 — ориентировочные, уточняются по паспорту подобранной машины" },
} as const;

/** ряд диаметров напорных труб, мм */
export const PRESSURE_DN = [80, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800] as const;

export type PipeKind = "steel" | "plastic" | "castIron";

export type PumpMainInput = {
  /** расчётный расход, л/с — обычно максимальный секундный из расчёта сети */
  qLps: number;
  /** геометрический подъём: отметка излива минус отметка уровня в приёмном резервуаре, м */
  geoLiftM: number;
  /** длина напорной линии, м */
  lengthM: number;
  /** материал напорной трубы */
  kind?: PipeKind;
  /** число ниток; на две нитки расход делится, когда работают обе */
  lines?: number;
  /** сумма коэффициентов местных сопротивлений, если посчитана вручную */
  sumZeta?: number;
  /** диаметр, заданный проектировщиком, мм */
  dnMm?: number;
  /** число рабочих насосов */
  workingPumps?: number;
};

export type PumpMainResult = {
  dnMm: number;
  /** скорость при расчётном расходе, м/с */
  velocity: number;
  /** число Рейнольдса */
  reynolds: number;
  /** коэффициент гидравлического трения по Альтшулю */
  lambda: number;
  /** потери по длине, м */
  frictionM: number;
  /** местные потери, м */
  localM: number;
  /** свободный напор, м */
  freeM: number;
  /** полный напор насоса, м */
  headM: number;
  /** подача одного рабочего насоса, м³/ч */
  flowM3H: number;
  /** мощность на валу, кВт */
  shaftKW: number;
  /** потребляемая мощность, кВт */
  motorKW: number;
  /** объём приёмного резервуара по п. 5.18, м³ */
  wetWellM3: number;
  /** варианты диаметров: выбор между трубой и электричеством делает
   *  проектировщик, а не программа — цены он знает, а она нет */
  options: { dnMm: number; velocity: number; headM: number; motorKW: number }[];
  assumptions: string[];
  warnings: string[];
};

const NU = 1.31e-6; // кинематическая вязкость воды при 10 °C, м²/с
const G = 9.81;

/** Коэффициент трения по формуле Альтшуля — практика гидравлики, не норма. */
export function lambdaAltshul(reynolds: number, dnMm: number, roughMm: number): number {
  const rel = roughMm / dnMm;
  if (reynolds < 2300) return 64 / Math.max(reynolds, 1); // ламинарный режим
  return 0.11 * Math.pow(rel + 68 / reynolds, 0.25);
}

export function calculatePumpMain(input: PumpMainInput): PumpMainResult {
  const warnings: string[] = [];
  const lines = Math.max(1, Math.round(input.lines ?? 2));
  const kind: PipeKind = input.kind ?? "steel";
  const rough = PUMP_MAIN.roughnessMm[kind];
  const metal = kind !== "plastic";
  const vMax = metal ? SEWER_NETWORK.maxVelocity.metal : SEWER_NETWORK.maxVelocity.nonMetal;

  /* Расход на одну нитку. Две нитки — это резервирование: при аварии
     одна пропускает весь расход, и скорость в ней удваивается. Поэтому
     диаметр подбирается по расходу НА НИТКУ при нормальной работе, а
     аварийный режим проверяется отдельно и попадает в предупреждения. */
  const qTotal = Math.max(0, input.qLps) / 1000; // м³/с
  const qLine = qTotal / lines;

  const area = (dn: number) => (Math.PI * (dn / 1000) ** 2) / 4;
  const vel = (dn: number, q: number) => q / area(dn);

  /* ------------------------------------------------------------------
     ПОДБОР ДИАМЕТРА.

     Выбор диаметра — это выбор между стоимостью трубы и стоимостью
     электричества на много лет вперёд: труба на шаг больше дороже
     сразу, но напор и мощность насоса меньше навсегда. Цены знает
     проектировщик, а не программа, поэтому она считает ВСЕ приемлемые
     диаметры и показывает их рядом, а по умолчанию берёт тот, где
     скорость ближе к 1,2 м/с — середине экономичного интервала.
     ------------------------------------------------------------------ */
  const headFor = (d0: number, q: number) => {
    const vv = vel(d0, q);
    const dd = d0 / 1000;
    const ree = (vv * dd) / NU;
    const lam = lambdaAltshul(ree, d0, rough);
    const fr = (lam * Math.max(0, input.lengthM) * vv * vv) / (dd * 2 * G);
    const loc = input.sumZeta && input.sumZeta > 0 ? (input.sumZeta * vv * vv) / (2 * G) : fr * PUMP_MAIN.localShare.value;
    return { v: vv, head: Math.max(0, input.geoLiftM) + fr + loc + PUMP_MAIN.freeHead.value };
  };

  const workingForOpts = Math.max(1, Math.round(input.workingPumps ?? 1));
  const options = PRESSURE_DN.map((d0) => {
    const { v: vv, head: hh } = headFor(d0, qLine);
    const flow = (qTotal * 3600) / workingForOpts;
    const shaft = (1000 * G * (flow / 3600) * hh) / (1000 * PUMP_MAIN.efficiency.pump);
    return { dnMm: d0, velocity: Number(vv.toFixed(2)), headM: Number(hh.toFixed(2)), motorKW: Number((shaft / PUMP_MAIN.efficiency.motor).toFixed(2)) };
  }).filter((o) => o.velocity >= PUMP_MAIN.selfCleansing.value && o.velocity <= vMax);

  let dn = input.dnMm ?? 0;
  if (!dn) {
    const target = (PUMP_MAIN.economicVelocity.min + PUMP_MAIN.economicVelocity.max) / 2;
    const best = [...options].sort((a, b) => Math.abs(a.velocity - target) - Math.abs(b.velocity - target))[0];
    dn = best?.dnMm ?? PRESSURE_DN[PRESSURE_DN.length - 1];
  }

  const v = vel(dn, qLine);
  const d = dn / 1000;
  const re = (v * d) / NU;
  const lambda = lambdaAltshul(re, dn, rough);
  const L = Math.max(0, input.lengthM);

  const friction = (lambda * L * v * v) / (d * 2 * G);
  const local =
    input.sumZeta && input.sumZeta > 0
      ? (input.sumZeta * v * v) / (2 * G)
      : friction * PUMP_MAIN.localShare.value;
  const free = PUMP_MAIN.freeHead.value;
  const head = Math.max(0, input.geoLiftM) + friction + local + free;

  /* --- насосы --- */
  const working = Math.max(1, Math.round(input.workingPumps ?? 1));
  const flowM3H = (qTotal * 3600) / working;
  const shaftKW = (1000 * G * (flowM3H / 3600) * head) / (1000 * PUMP_MAIN.efficiency.pump);
  const motorKW = shaftKW / PUMP_MAIN.efficiency.motor;

  /* --- приёмный резервуар: п. 5.18 --- */
  const wetWell = (flowM3H / 60) * PUMP_STATIONS.wetWellMinMinutes.value;

  /* --- проверки --- */
  if (v < PUMP_MAIN.selfCleansing.value) {
    warnings.push(
      `Скорость ${v.toFixed(2)} м/с ниже незаиливающей ${PUMP_MAIN.selfCleansing.value} м/с: в напорной линии будет откладываться взвесь. Уменьшить диаметр или предусмотреть периодическую промывку.`,
    );
  }
  if (v > vMax) {
    warnings.push(
      `Скорость ${v.toFixed(2)} м/с выше предельной ${vMax} м/с (${kmkRef("2.36")}): увеличить диаметр.`,
    );
  }
  if (lines > 1) {
    const vAlone = vel(dn, qTotal);
    if (vAlone > vMax) {
      warnings.push(
        `При аварийном пропуске всего расхода одной ниткой скорость ${vAlone.toFixed(2)} м/с превысит предельную ${vMax} м/с. Либо увеличить диаметр, либо принять, что при аварии станция работает с ограничением подачи, — и записать это решение.`,
      );
    }
  }
  if (L > 500) {
    warnings.push(
      "Напорная линия длиннее 500 м: требуется расчёт на гидравлический удар и защита от него (обратные клапаны с демпфированием, воздушные колпаки, гасители). Здесь этот расчёт не выполняется.",
    );
  }
  if (input.geoLiftM > 25) {
    warnings.push("Геометрический подъём больше 25 м: проверить, не выгоднее ли перенести КНС или разбить подъём на две ступени.");
  }

  const assumptions: string[] = [
    `Диаметр ${input.dnMm ? "задан проектировщиком" : "принят по скорости, ближайшей к середине экономичного интервала"}; ${PUMP_MAIN.economicVelocity.note}. Рядом показаны остальные приемлемые диаметры: выбор между стоимостью трубы и стоимостью электричества делает проектировщик по ценам на момент закупки.`,
    `Потери по длине — формула Дарси–Вейсбаха, коэффициент трения по Альтшулю при Re = ${Math.round(re).toLocaleString("ru-RU")}; ${PUMP_MAIN.roughnessMm.note}.`,
    input.sumZeta && input.sumZeta > 0
      ? `Местные потери — по заданной сумме коэффициентов ζ = ${input.sumZeta}.`
      : `Местные потери: ${PUMP_MAIN.localShare.note}.`,
    `Свободный напор: ${PUMP_MAIN.freeHead.note}.`,
    `Мощность: ${PUMP_MAIN.efficiency.note}.`,
    `Наибольшая скорость ${vMax} м/с — ${kmkRef("2.36")}; наименьшая: ${PUMP_MAIN.selfCleansing.note}.`,
    `Объём приёмного резервуара — не менее ${PUMP_STATIONS.wetWellMinMinutes.value}-минутной максимальной подачи одного насоса (${PUMP_STATIONS.wetWellMinMinutes.ref}).`,
    "Гидравлический удар не рассчитывается: это отдельная задача, и от неё зависят и труба, и арматура.",
    "Число ниток и резерв насосов — решение проектировщика; ҚМҚ 2.04.03-19 напорные линии канализации подробно не нормирует (п. 2.30 отсылает к ШНК 2.04.02-97*).",
  ];

  const r2 = (x: number) => Number(x.toFixed(2));
  return {
    dnMm: dn,
    velocity: r2(v),
    reynolds: Math.round(re),
    lambda: Number(lambda.toFixed(4)),
    frictionM: r2(friction),
    localM: r2(local),
    freeM: free,
    headM: r2(head),
    flowM3H: r2(flowM3H),
    shaftKW: r2(shaftKW),
    motorKW: r2(motorKW),
    wetWellM3: r2(wetWell),
    options,
    assumptions,
    warnings,
  };
}
