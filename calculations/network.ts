/* ==================================================================
 * ГИДРАВЛИЧЕСКИЙ РАСЧЁТ САМОТЁЧНОЙ КАНАЛИЗАЦИОННОЙ СЕТИ
 *
 * Очередь 1: расходы по участкам, подбор диаметров и уклонов, отметки
 * лотков и глубины заложения, места перепадных колодцев. Чертежи и
 * записка рисуют то, что посчитано здесь, — расчёт один, поэтому
 * разойтись они не могут.
 *
 * ЧТО СЧИТАЕТСЯ ПО НОРМЕ, А ЧТО — ПАРАМЕТР
 * ----------------------------------------
 * По ҚМҚ 2.04.03-19 считается:
 *   — удельное водоотведение, табл. 3 (п. 2.9);
 *   — коэффициент общей неравномерности, табл. 2 (п. 2.7) — ОТДЕЛЬНО
 *     для каждого участка по его собственному среднему расходу;
 *   — наименьшие скорости, табл. 16 (п. 2.34);
 *   — наименьший диаметр уличной сети 200 мм и внутриквартальной 150 мм
 *     (п. 2.33);
 *   — наибольшая расчётная скорость 4 м/с для неметаллических труб и
 *     8 м/с для металлических (п. 2.36);
 *   — наибольшее наполнение 0,7 высоты (п. 2.40) — при расхождении с
 *     табл. 16 действует меньшее из двух.
 *
 * Параметрами остаётся то, чего норматив прямо не задаёт: начальная
 * глубина заложения, предельная глубина до перехода на КНС, величина
 * перепада, с которой колодец считается перепадным. Они собраны в
 * NETWORK_LIMITS с пометкой pending: true и попадают в допущения
 * расчёта дословно.
 * Придумывать их «по опыту» и молчать об этом нельзя: ведомость уходит
 * в экспертизу.
 *
 * ГЛАВНАЯ ОШИБКА, КОТОРУЮ ЗДЕСЬ НЕ ДЕЛАЮТ
 * ---------------------------------------
 * K gen.max берётся не один на всю сеть, а свой на каждом участке.
 * Вниз по трассе расход растёт, а коэффициент по табл. 2 падает: в
 * верховье при 5 л/с он 2,5, в коллекторе при 100 л/с — 1,6. Кто
 * считает всю сеть по одному коэффициенту, либо раздувает верховые
 * участки, либо занижает низовые.
 * ================================================================== */

import {
  SEWER_NETWORK,
  minPipeSlope,
  TABLE_16_MIN_VELOCITY,
  specificWaterUse,
  unevenness,
  kmkRef,
  type SettlementCategory,
  type WaterUseHorizon,
} from "../norms/kmk-2-04-03-19";

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ, ОЖИДАЮЩИЕ ПОДТВЕРЖДЕНИЯ ПО НОРМАМ
 * ------------------------------------------------------------------ */
export const NETWORK_LIMITS = {
  /** п. 2.33: наименьший диаметр уличной сети городов, мм */
  minStreetDn: { value: SEWER_NETWORK.minDiameterMm.street, pending: false, note: `наименьший диаметр уличной сети — ${SEWER_NETWORK.minDiameterMm.ref}` },
  /** п. 2.36: наибольшая расчётная скорость для неметаллических труб, м/с */
  maxVelocity: { value: SEWER_NETWORK.maxVelocity.nonMetal, pending: false, note: `наибольшая расчётная скорость для неметаллических труб — ${SEWER_NETWORK.maxVelocity.ref}` },
  /** начальная глубина лотка в верховом колодце, м от планировки */
  startDepth: { value: 1.5, pending: true, note: "начальная глубина заложения принята ориентировочно; определяется промерзанием и глубиной выпуска из здания" },
  /** предельная глубина заложения, при которой ставится КНС, м */
  maxDepth: { value: 6, pending: true, note: "предельная глубина до перехода на насосную перекачку — решение проектировщика, не норма" },
  /** перепад в колодце, при превышении которого он считается перепадным, м */
  dropWellFrom: { value: 0.5, pending: true, note: "величина перепада, с которой колодец считается перепадным, — требует подтверждения по норме" },
  /** коэффициент шероховатости, бетон и железобетон */
  manningN: { value: 0.013, pending: false, note: "шероховатость n = 0,013 для бетонных и железобетонных труб — практика; ҚМҚ в табл. 16 её не приводит" },
} as const;

/** ряд диаметров, мм */
export const DN_ROW = [200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200] as const;

/* ------------------------------------------------------------------
 * ИСХОДНЫЕ ДАННЫЕ
 * ------------------------------------------------------------------ */

export type ElevSource = "survey" | "google" | "assumed";

export type NetworkNode = {
  /** номер колодца, как в проекте: К-1, КК-12 */
  id: string;
  /** отметка земли, м (абсолютная или от 0.000 — важно, чтобы одинаково у всех) */
  groundElev: number;
  /** координаты, м — для длин участков и плана сети; необязательны, если длины заданы явно */
  x?: number;
  y?: number;
  /** жители, водоотведение которых поступает в этот узел */
  people?: number;
  /** сосредоточенный расход в узел, м³/сут (предприятие, больница, гостиница) */
  qConcentratedM3Day?: number;
};

export type NetworkLink = {
  from: string;
  to: string;
  /** длина, м; не задана — считается по координатам */
  lengthM?: number;
};

export type NetworkInput = {
  nodes: NetworkNode[];
  links: NetworkLink[];
  /** конечный узел: очистные сооружения или приёмная камера КНС */
  outfallId: string;
  /** удельное водоотведение, л/(чел·сут); не задано — по табл. 3 */
  lpcd?: number;
  category?: SettlementCategory;
  horizon?: WaterUseHorizon;
  /** откуда взяты отметки — определяет, можно ли выпускать профиль */
  elevSource: ElevSource;
  /** начальная глубина лотка в верховых колодцах, м */
  startDepthM?: number;
  /** наименьший диаметр, мм */
  minDnMm?: number;
};

/* ------------------------------------------------------------------
 * РЕЗУЛЬТАТ
 * ------------------------------------------------------------------ */

export type SegmentResult = {
  from: string;
  to: string;
  lengthM: number;
  /** жители, накопленные к концу участка */
  peopleCum: number;
  /** средний секундный расход, л/с */
  qAvgLps: number;
  /** K gen.max по табл. 2 для этого участка */
  kMax: number;
  /** расчётный (максимальный секундный) расход, л/с */
  qCalcLps: number;
  dnMm: number;
  /** принятый уклон */
  slope: number;
  /** скорость при расчётном расходе, м/с */
  velocity: number;
  /** наполнение H/D */
  fill: number;
  /** наименьшая скорость по табл. 16 для этого диаметра */
  vMinRequired: number;
  /** наибольшее наполнение по табл. 16 */
  fillMax: number;
  /** отметка лотка в начале и в конце участка, м */
  invertStart: number;
  invertEnd: number;
  /** глубина заложения лотка от планировки, м */
  depthStart: number;
  depthEnd: number;
  /** перепад в колодце в начале участка, м (0 — перепада нет) */
  dropM: number;
  warnings: string[];
};

export type NetworkResult = {
  segments: SegmentResult[];
  /** суммарный расход в конечной точке, м³/сут и л/с */
  totalM3Day: number;
  totalCalcLps: number;
  /** наибольшая глубина по сети и где */
  maxDepthM: number;
  maxDepthAt: string;
  assumptions: string[];
  warnings: string[];
};

/* ------------------------------------------------------------------
 * ГИДРАВЛИКА КРУГЛОЙ ТРУБЫ (Шези–Маннинг)
 * ------------------------------------------------------------------ */

/** площадь живого сечения и смоченный периметр при наполнении fill = h/D */
export function flowGeometry(dnMm: number, fill: number) {
  const D = dnMm / 1000;
  const f = Math.min(Math.max(fill, 0.001), 0.999);
  const theta = 2 * Math.acos(1 - 2 * f); // центральный угол, рад
  const area = ((D * D) / 8) * (theta - Math.sin(theta));
  const wetted = (D * theta) / 2;
  return { area, wetted, radius: area / wetted };
}

/** расход при заданном наполнении и уклоне, м³/с */
export function dischargeAt(dnMm: number, fill: number, slope: number, n = NETWORK_LIMITS.manningN.value): number {
  const g = flowGeometry(dnMm, fill);
  return (1 / n) * g.area * Math.pow(g.radius, 2 / 3) * Math.sqrt(Math.max(slope, 0));
}

/** наполнение, при котором труба пропускает заданный расход (деление отрезка пополам) */
export function normalFill(dnMm: number, qM3S: number, slope: number): number {
  let lo = 0.001;
  let hi = 0.999;
  if (dischargeAt(dnMm, hi, slope) < qM3S) return 1.2; // не проходит даже полным сечением
  for (let k = 0; k < 60; k += 1) {
    const mid = (lo + hi) / 2;
    if (dischargeAt(dnMm, mid, slope) < qM3S) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** строка табл. 16 (п. 2.34): наименьшая скорость и наибольшее наполнение */
export function table16(dnMm: number) {
  const hit = TABLE_16_MIN_VELOCITY.find((r) => dnMm >= r.dMm[0] && dnMm <= r.dMm[1]);
  const row = hit ?? TABLE_16_MIN_VELOCITY[0];
  /* Табл. 16 для крупных диаметров допускает наполнение 0,75–0,8, а п. 2.40
     ограничивает расчётное наполнение 0,7 высоты для труб любого сечения.
     Берём меньшее: норма не даёт превысить общий предел частной таблицей. */
  return { vMin: row.vMin, fill: Math.min(row.fill, SEWER_NETWORK.maxFill.value), inTable: Boolean(hit) };
}

/* ------------------------------------------------------------------
 * ПОДБОР ДИАМЕТРА И УКЛОНА
 *
 * Порядок такой же, как у проектировщика на бумаге:
 *   1. Берём наименьший допустимый диаметр.
 *   2. Пробуем уложить трубу по уклону местности — тогда глубина не
 *      растёт, а это самое дорогое в сети.
 *   3. Если по уклону местности скорость ниже наименьшей по табл. 16 —
 *      увеличиваем уклон до той, при которой скорость набирается
 *      (труба уходит глубже, зато не заиливается).
 *   4. Если наполнение выше наибольшего по табл. 16 или скорость выше
 *      предельной — берём следующий диаметр и начинаем сначала.
 * ------------------------------------------------------------------ */
export function selectPipe(qCalcLps: number, groundSlope: number, minDnMm: number) {
  const q = Math.max(qCalcLps, 0.1) / 1000; // м³/с
  const candidates = DN_ROW.filter((d) => d >= minDnMm);

  for (const dn of candidates) {
    const t = table16(dn);
    /* Наименьший уклон — по п. 2.41 (0,008 для 150 мм, 0,007 для 200 мм),
       для больших диаметров 1/D. Отправная точка — уклон местности, но
       не мельче этого предела: так труба идёт вдоль земли и глубина не
       растёт зря. */
    const iMin = minPipeSlope(dn).i;
    let i = Math.max(groundSlope, iMin);

    /* Докуда имеет смысл увеличивать уклон ради незаиливающей скорости.
       На начальных участках расход мал, и наименьшая скорость табл. 16
       не набирается ни при каком разумном уклоне: труба просто уходит
       на десять метров вглубь. Проектировщик в этом случае принимает
       наименьший уклон по п. 2.41 и предусматривает промывку, а не
       закапывает коллектор. Предел взят как тройной наименьший уклон —
       это решение SUVSANOAT, не норма, и оно указано в допущениях. */
    const iCap = Math.max(iMin * 3, groundSlope);

    for (let step = 0; step < 80; step += 1) {
      const fill = normalFill(dn, q, i);
      if (fill > 1) {
        i *= 1.15; // не проходит даже полным сечением — круче
        if (i > 0.2) break;
        continue;
      }
      const g = flowGeometry(dn, fill);
      const v = q / g.area;

      if (fill > t.fill) break; // переполнение — следующий диаметр

      if (v > NETWORK_LIMITS.maxVelocity.value) {
        /* Слишком быстро. На крутом рельефе трубу не гонят по уклону
           местности — её кладут положе предела скорости, а разницу
           отметок добирают перепадными колодцами. Поэтому уклон
           УМЕНЬШАЕТСЯ: больший диаметр при том же уклоне медленнее не
           станет. */
        if (i > iMin * 1.01) {
          i = Math.max(i / 1.1, iMin);
          continue;
        }
        break; // уже на наименьшем уклоне и всё равно быстро — следующий диаметр
      }

      if (v < t.vMin) {
        if (i < iCap) {
          i = Math.min(i * 1.12, iCap); // медленно — круче уклон
          continue;
        }
        /* Дальше углублять бессмысленно: это начальный участок сети. */
        return {
          dnMm: dn, slope: Math.max(groundSlope, iMin), fill, velocity: v,
          vMin: t.vMin, fillMax: t.fill, inTable: t.inTable, startingReach: true,
        };
      }

      return { dnMm: dn, slope: i, fill, velocity: v, vMin: t.vMin, fillMax: t.fill, inTable: t.inTable, startingReach: false };
    }
  }

  // ничего не подошло — отдаём наибольший диаметр с предельным уклоном,
  // расчёт продолжится, но участок будет помечен предупреждением
  const dn = candidates[candidates.length - 1] ?? DN_ROW[DN_ROW.length - 1];
  const t = table16(dn);
  const i = 0.05;
  const fill = Math.min(normalFill(dn, q, i), 1);
  const g = flowGeometry(dn, fill);
  return { dnMm: dn, slope: i, fill, velocity: q / g.area, vMin: t.vMin, fillMax: t.fill, inTable: t.inTable, startingReach: false };
}

/* ------------------------------------------------------------------
 * РАСЧЁТ СЕТИ
 * ------------------------------------------------------------------ */
export function calculateNetwork(input: NetworkInput): NetworkResult {
  const warnings: string[] = [];
  const byId = new Map(input.nodes.map((n) => [n.id, n]));
  const minDn = input.minDnMm ?? NETWORK_LIMITS.minStreetDn.value;
  const startDepth = input.startDepthM ?? NETWORK_LIMITS.startDepth.value;

  /* Удельное водоотведение: задано проектировщиком — берём его, иначе
     по табл. 3 для категории населённого пункта. По умолчанию — города
     и посёлки до 50 тыс. чел., самый частый объект в республике. */
  const waterUse = specificWaterUse(input.category ?? "town-under-50k", input.horizon);
  const lpcd = input.lpcd ?? waterUse.lpcd;
  const lpcdSource = input.lpcd ? "задано проектировщиком" : waterUse.source;

  /* --- проверка связности: сеть должна быть деревом со стоком в выпуск --- */
  const out = new Map<string, string>(); // узел → куда течёт
  input.links.forEach((l) => {
    if (out.has(l.from)) warnings.push(`Из узла ${l.from} выходит более одного участка — сеть должна быть древовидной.`);
    out.set(l.from, l.to);
  });
  input.nodes.forEach((n) => {
    if (n.id !== input.outfallId && !out.has(n.id)) {
      warnings.push(`Узел ${n.id} никуда не подключён — участок пропущен в расчёте.`);
    }
    if (!byId.has(input.outfallId)) return;
  });
  if (!byId.has(input.outfallId)) {
    warnings.push(`Конечный узел ${input.outfallId} не найден среди узлов.`);
  }

  /* --- порядок расчёта: от верховьев вниз (топологическая сортировка) --- */
  const incoming = new Map<string, number>();
  input.nodes.forEach((n) => incoming.set(n.id, 0));
  input.links.forEach((l) => incoming.set(l.to, (incoming.get(l.to) ?? 0) + 1));
  const queue = input.nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => n.id);
  const order: string[] = [];
  const left = new Map(incoming);
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    const next = out.get(id);
    if (!next) continue;
    const c = (left.get(next) ?? 0) - 1;
    left.set(next, c);
    if (c === 0) queue.push(next);
  }
  if (order.length < input.nodes.length) {
    warnings.push("В схеме есть замкнутый контур: самотёчная сеть не может иметь колец, проверьте направления участков.");
  }

  /* --- накопление жителей и сосредоточенных расходов --- */
  const cumPeople = new Map<string, number>();
  const cumConc = new Map<string, number>();
  input.nodes.forEach((n) => {
    cumPeople.set(n.id, n.people ?? 0);
    cumConc.set(n.id, n.qConcentratedM3Day ?? 0);
  });

  const linkOf = new Map(input.links.map((l) => [l.from, l]));
  const segments: SegmentResult[] = [];
  const invertAt = new Map<string, number>();

  const dist = (a: NetworkNode, b: NetworkNode) => {
    if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) return 0;
    return Math.hypot(b.x - a.x, b.y - a.y);
  };

  for (const id of order) {
    const link = linkOf.get(id);
    if (!link) continue;
    const a = byId.get(link.from);
    const b = byId.get(link.to);
    if (!a || !b) continue;

    const people = cumPeople.get(a.id) ?? 0;
    const conc = cumConc.get(a.id) ?? 0;

    /* Расход участка. Хозбытовой — от накопленных жителей по удельному
       водоотведению табл. 3; сосредоточенные сбросы прибавляются
       отдельно, они уже заданы суточным объёмом. */
    const qDomM3Day = (people * lpcd) / 1000;
    const qAvgLps = ((qDomM3Day + conc) * 1000) / 86400;
    const un = unevenness(qAvgLps);
    const qCalcLps = qAvgLps * un.kMax;

    const lengthM = link.lengthM ?? dist(a, b);
    if (!(lengthM > 0)) {
      warnings.push(`Участок ${a.id}–${b.id}: длина не задана и не считается по координатам.`);
    }
    const L = Math.max(lengthM, 1);

    const groundSlope = (a.groundElev - b.groundElev) / L;
    const pipe = selectPipe(qCalcLps, groundSlope, minDn);

    /* --- отметки --- */
    let invStart = invertAt.get(a.id);
    let drop = 0;
    if (invStart === undefined) {
      invStart = a.groundElev - startDepth; // верховой колодец
    } else {
      /* ПЕРЕПАДНОЙ КОЛОДЕЦ.
         На крутом рельефе труба уложена положе местности (круче нельзя —
         превышается допустимая скорость), поэтому вниз по течению земля
         уходит быстрее трубы и глубина заложения тает: труба вылезает к
         поверхности. Поднимать её нельзя — промерзание и нагрузка от
         транспорта. Поэтому в колодце делают перепад: следующий участок
         начинается ниже пришедшего лотка на величину перепада. */
      const wantedInvert = a.groundElev - startDepth;
      const need = invStart - wantedInvert; // > 0, если труба слишком высоко
      if (need > NETWORK_LIMITS.dropWellFrom.value) {
        drop = need;
        invStart = wantedInvert;
      }
    }

    const invEnd = invStart - pipe.slope * L;
    const depthStart = a.groundElev - invStart;
    const depthEnd = b.groundElev - invEnd;

    const segWarn: string[] = [];
    if (pipe.velocity < pipe.vMin) {
      segWarn.push(
        pipe.startingReach
          ? `Начальный участок: расход ${qCalcLps.toFixed(2)} л/с мал, скорость ${pipe.velocity.toFixed(2)} м/с не достигает наименьшей ${pipe.vMin} м/с (табл. 16). Принят наименьший уклон ${kmkRef("2.41")}; предусмотреть промывку участка.`
          : `Скорость ${pipe.velocity.toFixed(2)} м/с ниже наименьшей ${pipe.vMin} м/с (табл. 16): участок будет заиливаться.`,
      );
    }
    if (pipe.fill > pipe.fillMax) {
      segWarn.push(`Наполнение ${pipe.fill.toFixed(2)} выше наибольшего ${pipe.fillMax} (табл. 16).`);
    }
    if (!pipe.inTable) {
      segWarn.push(`Диаметр ${pipe.dnMm} мм вне табл. 16 — приняты значения для наименьшей строки таблицы.`);
    }
    if (depthEnd > NETWORK_LIMITS.maxDepth.value) {
      segWarn.push(`Глубина ${depthEnd.toFixed(2)} м превышает принятый предел ${NETWORK_LIMITS.maxDepth.value} м: нужна насосная станция или другая трассировка.`);
    }
    if (depthEnd < 1.0) {
      segWarn.push(`Глубина ${depthEnd.toFixed(2)} м мала: проверить промерзание и нагрузку от транспорта.`);
    }

    invertAt.set(b.id, invEnd);
    cumPeople.set(b.id, (cumPeople.get(b.id) ?? 0) + people);
    cumConc.set(b.id, (cumConc.get(b.id) ?? 0) + conc);

    segments.push({
      from: a.id,
      to: b.id,
      lengthM: Math.round(L * 10) / 10,
      peopleCum: people,
      qAvgLps: r(qAvgLps, 3),
      kMax: r(un.kMax, 2),
      qCalcLps: r(qCalcLps, 2),
      dnMm: pipe.dnMm,
      slope: r(pipe.slope, 5),
      velocity: r(pipe.velocity, 2),
      fill: r(pipe.fill, 2),
      vMinRequired: pipe.vMin,
      fillMax: pipe.fillMax,
      invertStart: r(invStart, 3),
      invertEnd: r(invEnd, 3),
      depthStart: r(depthStart, 2),
      depthEnd: r(depthEnd, 2),
      dropM: r(drop, 2),
      warnings: segWarn,
    });
  }

  const totalPeople = cumPeople.get(input.outfallId) ?? 0;
  const totalConc = cumConc.get(input.outfallId) ?? 0;
  const totalM3Day = (totalPeople * lpcd) / 1000 + totalConc;
  const totalAvgLps = (totalM3Day * 1000) / 86400;
  const totalCalcLps = totalAvgLps * unevenness(totalAvgLps).kMax;

  let maxDepthM = 0;
  let maxDepthAt = "";
  segments.forEach((s) => {
    if (s.depthEnd > maxDepthM) {
      maxDepthM = s.depthEnd;
      maxDepthAt = s.to;
    }
  });

  const assumptions: string[] = [
    `Удельное водоотведение ${lpcd} л/(чел·сут) — ${lpcdSource}.`,
    `Коэффициент общей неравномерности взят по ${kmkRef("2.7", "табл. 2")} отдельно для каждого участка по его среднему расходу: вниз по трассе расход растёт, а коэффициент падает.`,
    `Наименьшие скорости — ${kmkRef("2.34", "табл. 16")}; наполнение — меньшее из табл. 16 и предела 0,7 высоты (${SEWER_NETWORK.maxFill.ref}).`,
    `Наименьший уклон — ${SEWER_NETWORK.minSlope.ref}: 0,008 при 150 мм и 0,007 при 200 мм; для больших диаметров принято 1/D (практика, норматив уклона не задаёт). На начальных участках, где расход мал, уклон увеличивался ради незаиливающей скорости не более чем втрое против наименьшего — дальше труба уходит на недопустимую глубину; такие участки помечены и требуют промывки.`,
    `Наименьший диаметр уличной сети ${SEWER_NETWORK.minDiameterMm.street} мм (${SEWER_NETWORK.minDiameterMm.ref}); внутриквартальная — ${SEWER_NETWORK.minDiameterMm.inBlock} мм.`,
    `Наибольшая расчётная скорость ${SEWER_NETWORK.maxVelocity.nonMetal} м/с для неметаллических труб (${SEWER_NETWORK.maxVelocity.ref}); для металлических норма допускает ${SEWER_NETWORK.maxVelocity.metal} м/с.`,
    `Гидравлика — формула Шези с шероховатостью n = ${NETWORK_LIMITS.manningN.value}; ${NETWORK_LIMITS.manningN.note}.`,
    elevNote(input.elevSource),
  ];

  /* Величины, которые ждут оцифровки раздела норм о сетях, попадают в
     допущения дословно — чтобы в записке было видно, что именно принято
     решением проектировщика, а не нормой. */
  Object.values(NETWORK_LIMITS).forEach((v) => {
    if (v.pending) assumptions.push(`Принято ${v.value}: ${v.note}.`);
  });

  if (input.elevSource !== "survey") {
    warnings.push(
      "Отметки не из топографической съёмки. Уклон самотёчного коллектора — 4–8 мм на метр, и погрешность высот Google Earth (2–5 м) полностью перекрывает перепад на участке. Профиль по таким отметкам годится для трассировки и оценки, но не для выпуска рабочей документации.",
    );
  }

  return { segments, totalM3Day: r(totalM3Day, 1), totalCalcLps: r(totalCalcLps, 2), maxDepthM: r(maxDepthM, 2), maxDepthAt, assumptions, warnings };
}

function r(x: number, digits: number): number {
  return Number.isFinite(x) ? Number(x.toFixed(digits)) : 0;
}

function elevNote(src: ElevSource): string {
  if (src === "survey") return "Отметки земли приняты по топографической съёмке.";
  if (src === "google") return "Отметки земли сняты с рельефа Google Earth — предварительные, подлежат уточнению по топографической съёмке.";
  return "Отметки земли приняты условно — расчёт демонстрационный, для выпуска документации требуется съёмка.";
}
