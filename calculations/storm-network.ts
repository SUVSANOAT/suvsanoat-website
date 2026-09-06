/* ==================================================================
 * ДОЖДЕВАЯ СЕТЬ ПО УЧАСТКАМ
 *
 * Метод предельных интенсивностей применяется не к площадке целиком, а
 * к каждому расчётному створу: вниз по коллектору растёт и площадь
 * водосбора, и время добегания. Расход при этом ведёт себя не так, как
 * в бытовой сети: площадь увеличивает его, а время — уменьшает,
 * потому что дождь такой продолжительности идёт с меньшей
 * интенсивностью. Поэтому расход на нижнем участке может оказаться
 * НЕ ПРОПОРЦИОНАЛЕН площади, и считать «по общей площади и одному
 * времени» нельзя — это и есть самая частая ошибка в ливнёвке.
 *
 * ЗАМКНУТЫЙ КРУГ И КАК ОН РАЗРЫВАЕТСЯ
 * Время добегания по трубе зависит от скорости, скорость — от
 * диаметра и уклона, а те подбираются по расходу, который зависит от
 * времени. Замкнуто. Разрывается итерацией: принимается начальная
 * скорость, считается расход, подбирается труба, из неё берётся
 * фактическая скорость — и так несколько раз, пока результат не
 * перестанет меняться. Сходится за 3–4 прохода.
 *
 * НАПОЛНЕНИЕ. Дождевую сеть принято рассчитывать на полное сечение —
 * в отличие от бытовой, где п. 2.40 ограничивает наполнение 0,7
 * высоты. Здесь это вынесено параметром: по умолчанию полное, но
 * проектировщик может поставить 0,7, если так требует его прочтение
 * норматива. Величина выводится в допущениях, чтобы решение было
 * видно, а не спрятано в коде.
 * ================================================================== */

import {
  DN_ROW,
  MATERIALS,
  dischargeAt,
  flowGeometry,
  normalFill,
  table16,
  type NetworkLink,
  type NetworkNode,
  type PipeMaterial,
} from "./network";
import { minPipeSlope, SEWER_NETWORK, kmkRef } from "../norms/kmk-2-04-03-19";
import { calculateStorm, TABLE_4, type ClimateZone, type SurfaceShare } from "./storm";

export type StormNetworkInput = {
  nodes: NetworkNode[];
  links: NetworkLink[];
  outfallId: string;
  /** интенсивность дождя q20, л/(с·га) — с карты изолиний, рис. 1 */
  q20: number;
  zone?: ClimateZone;
  /** период однократного превышения P, лет */
  periodYears: number;
  /** время поверхностной концентрации, мин (п. 2.16) */
  tConMin?: number;
  /** состав поверхностей водосбора */
  surfaces?: SurfaceShare[];
  /** расчётное наполнение: 1 — полное сечение (дождевая), 0,7 — как бытовая */
  designFill?: number;
  /** наименьший диаметр дождевой сети, мм */
  minDnMm?: number;
  material?: PipeMaterial;
  /** начальная глубина лотка в верховом колодце, м */
  startDepthM?: number;
};

export type StormSegment = {
  from: string;
  to: string;
  lengthM: number;
  /** накопленная площадь водосбора, га */
  areaHa: number;
  /** расчётное время добегания до конца участка, мин */
  tRMin: number;
  /** расчётный расход, л/с */
  qLps: number;
  dnMm: number;
  slope: number;
  velocity: number;
  fill: number;
  invertStart: number;
  invertEnd: number;
  depthStart: number;
  depthEnd: number;
  warnings: string[];
};

export type StormNetworkResult = {
  segments: StormSegment[];
  /** параметр A — общий для всей сети */
  A: number;
  zMid: number;
  totalAreaHa: number;
  /** расход в конечной точке, л/с */
  outfallQLps: number;
  maxDepthM: number;
  maxDepthAt: string;
  assumptions: string[];
  warnings: string[];
};

const r2 = (x: number) => Number(x.toFixed(2));

export function calculateStormNetwork(input: StormNetworkInput): StormNetworkResult {
  const warnings: string[] = [];
  const byId = new Map(input.nodes.map((n) => [n.id, n]));
  const out = new Map(input.links.map((l) => [l.from, l]));
  const fill = Math.min(1, Math.max(0.3, input.designFill ?? 1));
  const minDn = input.minDnMm ?? 250;
  const material = input.material ?? "concrete";
  const mannN = MATERIALS[material].n;
  const startDepth = input.startDepthM ?? 1.2;
  const tCon = input.tConMin ?? 5;

  /* --- A и z_mid общие для сети: климат один --- */
  const base = calculateStorm({
    q20: input.q20,
    zone: input.zone,
    periodYears: input.periodYears,
    areaHa: 1,
    tConMin: tCon,
    surfaces: input.surfaces,
  });
  const A = base.A;
  const zMid = base.zMid;
  const n = TABLE_4[input.zone ?? "plains"].n;
  const power = 1.2 * n - 0.1;
  warnings.push(...base.warnings);

  /** расход по ф. (2) для площади F и времени t */
  const qFor = (areaHa: number, tMin: number) =>
    (zMid * Math.pow(A, 1.2) * Math.max(0, areaHa)) / Math.pow(Math.max(tMin, 1), power);

  /* --- порядок сверху вниз --- */
  const incoming = new Map<string, number>();
  input.nodes.forEach((x) => incoming.set(x.id, 0));
  input.links.forEach((l) => incoming.set(l.to, (incoming.get(l.to) ?? 0) + 1));
  const queue = input.nodes.filter((x) => (incoming.get(x.id) ?? 0) === 0).map((x) => x.id);
  const order: string[] = [];
  const left = new Map(incoming);
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    const next = out.get(id)?.to;
    if (!next) continue;
    const c = (left.get(next) ?? 0) - 1;
    left.set(next, c);
    if (c === 0) queue.push(next);
  }
  if (order.length < input.nodes.length) {
    warnings.push("В схеме есть замкнутый контур — дождевая самотёчная сеть колец не имеет, проверьте направления участков.");
  }

  /* --- накопление площади и времени --- */
  const cumArea = new Map<string, number>();
  const cumTime = new Map<string, number>(); // время добегания ДО узла, мин
  input.nodes.forEach((x) => {
    cumArea.set(x.id, x.areaHa ?? 0);
    cumTime.set(x.id, 0);
  });

  const segments: StormSegment[] = [];
  const invertAt = new Map<string, number>();

  for (const id of order) {
    const link = out.get(id);
    if (!link) continue;
    const a = byId.get(link.from);
    const b = byId.get(link.to);
    if (!a || !b) continue;

    const L = Math.max(
      link.lengthM ??
        (a.x !== undefined && a.y !== undefined && b.x !== undefined && b.y !== undefined
          ? Math.hypot((b.x as number) - (a.x as number), (b.y as number) - (a.y as number))
          : 0),
      1,
    );
    const areaHa = cumArea.get(a.id) ?? 0;
    const tUpstream = cumTime.get(a.id) ?? 0;
    const groundSlope = (a.groundElev - b.groundElev) / L;

    /* ---------- ИТЕРАЦИЯ: скорость ↔ время ↔ расход ↔ труба ---------- */
    let v = 1.0; // начальное приближение, м/с
    let dn = minDn;
    let slope = Math.max(groundSlope, minPipeSlope(minDn).i);
    let q = 0;
    let tSeg = 0;
    let actualFill = fill;

    for (let iter = 0; iter < 6; iter += 1) {
      tSeg = 0.017 * (L / Math.max(v, 0.1)); // ф. (7), мин
      const tR = tCon + tUpstream + tSeg;
      q = qFor(areaHa, tR);
      const qM3S = q / 1000;

      /* подбор трубы: наименьший диаметр, пропускающий расход при
         заданном наполнении и уклоне не мельче наименьшего */
      let chosen = 0;
      let chosenSlope = 0;
      let chosenV = 0;
      let chosenFill = 0;
      for (const d of DN_ROW.filter((x) => x >= minDn)) {
        const iMin = Math.max(minPipeSlope(d).i, 0);
        const i = Math.max(groundSlope, iMin);
        const capacity = dischargeAt(d, fill, i, mannN);
        if (capacity >= qM3S) {
          const f = Math.min(normalFill(d, qM3S, i, mannN), fill);
          const g = flowGeometry(d, Math.max(f, 0.05));
          chosen = d;
          chosenSlope = i;
          chosenFill = f;
          chosenV = qM3S / g.area;
          break;
        }
      }
      if (!chosen) {
        chosen = DN_ROW[DN_ROW.length - 1];
        chosenSlope = Math.max(groundSlope, minPipeSlope(chosen).i);
        chosenFill = fill;
        chosenV = qM3S / flowGeometry(chosen, fill).area;
      }

      const converged = Math.abs(chosenV - v) < 0.02 && chosen === dn;
      dn = chosen;
      slope = chosenSlope;
      v = Math.max(chosenV, 0.1);
      actualFill = chosenFill;
      if (converged) break;
    }

    /* ---------- отметки ---------- */
    let invStart = invertAt.get(a.id);
    if (invStart === undefined) invStart = a.groundElev - startDepth;
    const invEnd = invStart - slope * L;
    const depthStart = a.groundElev - invStart;
    const depthEnd = b.groundElev - invEnd;

    const segWarn: string[] = [];
    const t16 = table16(dn);
    if (v < t16.vMin) {
      segWarn.push(
        `Скорость ${v.toFixed(2)} м/с ниже наименьшей ${t16.vMin} м/с (${kmkRef("2.34", "табл. 16")}): дождевой коллектор заилится наносами, которые он же и принесёт.`,
      );
    }
    if (v > SEWER_NETWORK.maxVelocity.nonMetal) {
      segWarn.push(`Скорость ${v.toFixed(2)} м/с выше предельной ${SEWER_NETWORK.maxVelocity.nonMetal} м/с (${kmkRef("2.36")}).`);
    }
    if (depthEnd > 6) {
      segWarn.push(`Глубина ${depthEnd.toFixed(2)} м — проверить целесообразность против перекачки.`);
    }

    segments.push({
      from: a.id,
      to: b.id,
      lengthM: r2(L),
      areaHa: r2(areaHa),
      tRMin: r2(tCon + tUpstream + tSeg),
      qLps: r2(q),
      dnMm: dn,
      slope: Number(slope.toFixed(4)),
      velocity: r2(v),
      fill: Number(actualFill.toFixed(2)),
      invertStart: r2(invStart),
      invertEnd: r2(invEnd),
      depthStart: r2(depthStart),
      depthEnd: r2(depthEnd),
      warnings: segWarn,
    });

    /* Вниз по течению: площадь складывается, а ВРЕМЯ берётся наибольшее
       из путей. Так и должно быть: расчётный дождь длится столько,
       сколько нужно самой дальней точке водосбора, чтобы её вода дошла
       до створа. Сложить времена веток — значит посчитать дождь вдвое
       длиннее, чем он есть, и занизить расход. */
    cumArea.set(b.id, (cumArea.get(b.id) ?? 0) + areaHa);
    cumTime.set(b.id, Math.max(cumTime.get(b.id) ?? 0, tUpstream + tSeg));
    const known = invertAt.get(b.id);
    invertAt.set(b.id, known === undefined ? invEnd : Math.min(known, invEnd));
  }

  const totalArea = cumArea.get(input.outfallId) ?? 0;
  const outQ = segments.length ? segments[segments.length - 1].qLps : 0;
  let maxDepth = 0;
  let maxAt = "";
  segments.forEach((s) => {
    if (s.depthEnd > maxDepth) {
      maxDepth = s.depthEnd;
      maxAt = s.to;
    }
  });

  const assumptions = [
    ...base.assumptions,
    `Расход считается для КАЖДОГО участка по накопленной площади и своему времени добегания: вниз по коллектору площадь растёт, а расчётная интенсивность падает, и расход не пропорционален площади.`,
    `Время добегания по трубе — ф. (7), скорость берётся фактическая: диаметр, уклон, скорость и время подбираются итерацией (сходится за 3–4 прохода).`,
    `В узле слияния время принимается НАИБОЛЬШЕЕ из веток, а не сумма: дождь длится столько, сколько идёт вода из самой дальней точки.`,
    fill >= 0.99
      ? `Наполнение — полное сечение: дождевую сеть принято рассчитывать полной, в отличие от бытовой (${kmkRef("2.40")} ограничивает бытовую 0,7 высоты). Сверить с прочтением норматива.`
      : `Наполнение принято ${fill} — как для бытовой сети (${kmkRef("2.40")}).`,
    `Наименьший диаметр дождевой сети принят ${minDn} мм — решение проектировщика; ${kmkRef("2.33")} задаёт 200 мм для уличной бытовой сети.`,
    `Материал труб — ${MATERIALS[material].label}, шероховатость n = ${mannN}.`,
  ];

  return {
    segments,
    A: r2(A),
    zMid: Number(zMid.toFixed(3)),
    totalAreaHa: r2(totalArea),
    outfallQLps: outQ,
    maxDepthM: r2(maxDepth),
    maxDepthAt: maxAt,
    assumptions,
    warnings,
  };
}

/* ------------------------------------------------------------------
 * ПЕРЕВОД В ФОРМАТ БЫТОВОЙ СЕТИ
 *
 * Чертежи профиля и плана уже умеют рисовать участки самотёчной сети.
 * Дождевая отличается смыслом расхода, но не геометрией: те же
 * колодцы, те же лотки, те же уклоны. Поэтому вместо второго
 * рисовальщика — переходник: дождевые участки подаются в готовый в том
 * же виде. Поля, которых у ливнёвки нет (жители, K gen.max,
 * инфильтрация), заполняются нулями, и ни один лист их не печатает.
 * ------------------------------------------------------------------ */
import type { SegmentResult, NetworkResult } from "./network";

export function stormAsNetworkResult(res: StormNetworkResult): NetworkResult {
  const segments: SegmentResult[] = res.segments.map((s) => ({
    from: s.from,
    to: s.to,
    lengthM: s.lengthM,
    peopleCum: 0,
    qAvgLps: 0,
    kMax: 0,
    qCalcLps: s.qLps,
    qInfiltrationLps: 0,
    qTransitLps: 0,
    material: "concrete",
    fixed: false,
    dnMm: s.dnMm,
    slope: s.slope,
    velocity: s.velocity,
    fill: s.fill,
    vMinRequired: 0,
    fillMax: 1,
    invertStart: s.invertStart,
    invertEnd: s.invertEnd,
    depthStart: s.depthStart,
    depthEnd: s.depthEnd,
    dropM: 0,
    warnings: s.warnings,
  }));

  return {
    segments,
    totalM3Day: 0,
    totalCalcLps: res.outfallQLps,
    maxDepthM: res.maxDepthM,
    maxDepthAt: res.maxDepthAt,
    assumptions: res.assumptions,
    warnings: res.warnings,
  };
}
