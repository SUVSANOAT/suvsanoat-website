/* ==================================================================
 * КОМПЛЕКТНАЯ МЕХАНИЧЕСКАЯ ОЧИСТКА НА ПЛАТФОРМЕ — МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Компоновка по образцу листа C-01003 NOD (КОС Караулбазар):
 *   приёмная камера → [линия: решётка грубая ≤16 мм + винтовая решётка
 *   тонкой очистки 1–2 мм → песколовка-жироловка] × n → к биологии.
 * Всё оборудование стоит на оцинкованной стальной платформе; контейнеры
 * отбросов и песка — под платформой, в проходе между линиями; лестницы
 * на торцах платформы.
 *
 * Приёмная камера — монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026); платформа, лотки, ограждения и
 * корпуса агрегатов — металл (изготовление SUVSANOAT / поставка).
 *
 * Что задаёт расчёт: q, qMaxH. Что нормирует ҚМҚ 2.04.03-19:
 * число песколовок (п. 6.26), длина песколовки ф. (18) п. 6.27 с
 * табл. 27/28, прозоры решётки (п. 6.16), скорость в прозорах (п. 5.14),
 * объёмы отбросов (п. 5.13, табл. 23) и песка (п. 6.31), потери напора
 * на решётке (п. 6.24). Что не нормирует (и помечено «по практике /
 * паспорту»): жировая камера, конструктивные минимумы ширины лотка,
 * габариты винтовой решётки и контейнеров, высота платформы.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { GRIT, PUMP_STATIONS, SCREENS, kmkRef, specificWaterUse } from "../../norms/kmk-2-04-03-19";
import { MBR_FINE_SCREEN } from "../../norms/uz-membrane-requirement";
import { dnFor } from "./mbr";
import { concreteVolume, construction, constructionNote, TANK_SUPPLY } from "../core/construction";

export type MechParams = {
  /** предпочтительная глубина проточной части песколовки H_s, м (табл. 28: 0,5–2 м);
      фактическая подбирается в geometry так, чтобы скорость легла в норму */
  gritDepthM: number;
  /** целевая скорость в песколовке v_s, м/с — середина диапазона табл. 28 (0,15–0,3) */
  gritVelocityMs: number;
  /** гидравлическая крупность u₀, мм/с (табл. 27, d = 0,2 мм) */
  u0MmS: number;
  /** коэффициент K_s (табл. 27, горизонтальная песколовка, d = 0,2 мм) */
  ks: number;
  /** прозоры грубой решётки, мм (п. 6.16: ≤ 16) и толщина стержня, мм */
  coarseGapMm: number;
  barMm: number;
  /** скорость в прозорах, м/с (п. 5.14: 0,8–1,0) */
  gapVelocityMs: number;
  /** предельная глубина воды в канале решётки, м — принято по практике;
      фактическая подбирается в geometry по скорости в прозорах */
  screenWaterDepthM: number;
  /** минимальная конструктивная ширина лотка, мм — по практике */
  minChannelMm: number;
  /** отметка верха платформы, м */
  platformElevM: number;
  /** контейнер: объём, м³, и габариты, мм — евроконтейнер 1100 л, по практике */
  containerM3: number;
  containerMm: { w: number; l: number; h: number };
  /** толщина стенки стального корпуса песколовки-жироловки, мм — по паспорту агрегата */
  wallMm: number;
  /** толщина стен приёмной камеры, мм — из construction() */
  chamberWallMm: number;
  /** толщина днища приёмной камеры, мм — из construction() */
  chamberSlabMm: number;
  /** удельное водоотведение для пересчёта расхода в жителей, л/(чел·сут) — табл. 3 */
  lpcd: number;
  /** тонкая решётка 1–2 мм после грубой: обязательна при MBR (MBR_FINE_SCREEN), иначе по желанию */
  fineScreen: boolean;
};

export function mechDefaults(input: DrawingInput): MechParams {
  const c = construction();
  /* Крупный типоразмер агрегатов — по максимальному часовому расходу,
     а не по исполнению корпусов: граница 100 м³/ч принята по практике. */
  const big = input.qMaxH > 100;
  return {
    /* H_s в пределах 0,5–2 м (табл. 28); большему расходу — больший типоразмер */
    gritDepthM: big ? 1.0 : 0.5,
    gritVelocityMs: (GRIT.table28.horizontal.vMinLps + GRIT.table28.horizontal.vMaxLps) / 2,
    u0MmS: 18.7,
    ks: 1.7,
    coarseGapMm: SCREENS.maxGapMm.value,
    barMm: 8,
    gapVelocityMs: 0.9,
    screenWaterDepthM: 0.4,
    minChannelMm: 300,
    platformElevM: big ? 1.5 : 1.2,
    containerM3: 1.1,
    containerMm: { w: 1000, l: 1200, h: 1000 },
    wallMm: 8,
    chamberWallMm: c.wallMm,
    chamberSlabMm: c.slabMm,
    lpcd: specificWaterUse("town-under-50k").lpcd,
    fineScreen: /mbr|мембран/i.test(input.tech),
  };
}

export type MechGeometry = {
  lines: number;
  /** тип песколовки: горизонтальная (табл. 28, v 0,15–0,3 м/с) либо щелевая тангенциальная (п. 6.28) */
  gritType: "horizontal" | "tangential";
  /** щелевая песколовка: диаметр, мм, и фактическая нагрузка, м³/(м²·ч); для горизонтальной 0 */
  gritD: number;
  gritLoad: number;
  /** высота конического пескового бункера щелевой песколовки, мм; для горизонтальной 0 */
  gritConeMm: number;
  /** песколовка: длина проточной части по ф. (18), полная длина корпуса, ширина лотка, ширина жировой камеры, наружная ширина корпуса, высота корпуса, мм */
  Ls: number;
  Lg: number;
  Bs: number;
  Bgrease: number;
  Wg: number;
  Hg: number;
  /** принятая глубина проточной части песколовки H_s, м (подбор в пределах табл. 28) */
  gritDepthM: number;
  /** фактическая скорость в песколовке при принятой ширине и глубине, м/с */
  vActual: number;
  /** продолжительность протока в песколовке, с (п. 6.28: ≥ 30 с) */
  retentionS: number;
  /** решётки: ширина канала, длина винтовой решётки, мм; фактическая скорость в прозорах, м/с */
  Bscr: number;
  Lscr: number;
  /** принятая глубина воды в канале решётки, м */
  screenDepthM: number;
  vGapActual: number;
  /** приёмная камера, мм */
  Lrc: number;
  Wrc: number;
  Hrc: number;
  /** платформа, мм */
  Lp: number;
  Wp: number;
  edge: number;
  aisle: number;
  stairL: number;
  stairW: number;
  /** отметки, м */
  platform: number;
  gritBottom: number;
  gritWater: number;
  gritTop: number;
  screenBottom: number;
  screenWater: number;
  rcBottom: number;
  rcWater: number;
  rcTop: number;
  inlet: number;
  outlet: number;
  /** объёмы, м³/сут */
  screeningsM3Day: number;
  sandM3Day: number;
  persons: number;
};

export function mechGeometry(input: DrawingInput, p: MechParams): MechGeometry {
  /* число линий: 1 при Qmax ≤ 40 м³/ч, иначе 2; при Q > 100 м³/сут не менее двух песколовок (п. 6.26) */
  let lines = input.qMaxH > 40 || input.q > GRIT.requiredFromM3Day.value ? Math.max(2, GRIT.minUnits.value) : 1;
  let qLine = input.qMaxH / 3600 / lines; // м³/с на линию

  /* ПЕСКОЛОВКА.
     Ширина лотка снизу ограничена конструктивным минимумом (300 мм), поэтому
     при малом расходе задавать глубину проточной части независимо нельзя:
     сечение получается избыточным и скорость падает ниже нижней границы
     табл. 28 (0,15 м/с), песок не задерживается, а в осадок уходит органика.
     Поэтому свободным параметром принята глубина H_s: она подбирается в
     разрешённых табл. 28 пределах 0,5–2 м так, чтобы скорость легла в
     середину диапазона; ширина увеличивается только когда глубины 2 м уже
     не хватает. Длина ф. (18) считается по ФАКТИЧЕСКОЙ скорости — счёт по
     верхней границе 0,3 м/с при фактических 0,12 м/с давал длину втрое
     больше нужной. */
  const [vMinN, vMaxN] = [GRIT.table28.horizontal.vMinLps, GRIT.table28.horizontal.vMaxLps];
  const [hMinN, hMaxN] = GRIT.table28.horizontal.depthM;
  const vTarget = Math.min(Math.max(p.gritVelocityMs, vMinN), vMaxN);

  /* ВЫБОР ТИПА. Горизонтальная применима только тогда, когда при минимальной
     ширине лотка B min глубина, дающая нормируемую скорость, укладывается в
     разрешённые табл. 28 пределы 0,5–2 м (глубже 2 м лоток просто расширяется —
     скорость остаётся в норме). Если требуемая глубина меньше 0,5 м, то при
     минимальном сечении B min × 0,5 м скорость падает ниже 0,15 м/с, песок не
     осаждается избирательно и в бункер уходит органика. В этом случае по
     проектной практике и по п. 6.28 принимается ЩЕЛЕВАЯ (тангенциальная)
     песколовка, для которой нормируется не скорость, а нагрузка на площадь
     в плане 110 м³/(м²·ч) при максимальном притоке. */
  const hNeeded = qLine / ((p.minChannelMm / 1000) * vTarget);
  const gritType: "horizontal" | "tangential" = hNeeded >= hMinN ? "horizontal" : "tangential";

  let Bs = p.minChannelMm;
  let gritDepth = hNeeded;
  let Ls = 0;
  let vActual = 0;
  let retentionS = 0;
  let gritD = 0;
  let gritLoad = 0;
  let gritConeMm = 0;
  let Bgrease = 0;
  let Lg = 0;
  let Wg = 0;
  let Hg = 0;

  if (gritType === "horizontal") {
    if (gritDepth > hMaxN) {
      /* глубже 2 м нельзя — расширяем лоток при H_s = 2 м */
      gritDepth = hMaxN;
      Bs = Math.max(p.minChannelMm, roundTo((qLine / (vTarget * gritDepth)) * 1000, 100));
    } else {
      gritDepth = Math.round(gritDepth * 20) / 20; // кратно 50 мм
    }
    vActual = qLine / ((Bs / 1000) * gritDepth);
    const LsM = (1000 * p.ks * gritDepth * vActual) / p.u0MmS;
    Ls = roundTo(LsM * 1000, 100);
    /* п. 6.28: продолжительность протока при максимальном притоке ≥ 30 с */
    retentionS = Ls / 1000 / vActual;
    Bgrease = Math.max(400, roundTo(Bs * 0.8, 100)); // жировая камера — по практике
    Lg = Ls + 2 * 600; // входная и выходная зоны по 600 — по практике
    Wg = Bs + Bgrease + 3 * p.wallMm;
    Hg = 600 + gritDepth * 1000 + 300; // песковой бункер 600 + вода + борт 300 — по практике
  } else {
    /* ЩЕЛЕВАЯ (тангенциальная) песколовка, п. 6.28: нагрузка на площадь в плане
       110 м³/(м²·ч) при максимальном притоке, диаметр не более 6 м.
       Глубина проточной части 0,5 м — табл. 28 (щелевые). */
    const loadMax = GRIT.tangentialLoad.value;
    const dMaxMm = GRIT.tangentialLoad.maxDiameterM * 1000;
    const dMinMm = 1000; // конструктивный минимум — ҚМҚ не нормирует, практика SUVSANOAT
    for (;;) {
      const qUnitH = input.qMaxH / lines; // м³/ч на единицу
      const areaM2 = qUnitH / loadMax;
      const dRaw = Math.sqrt((4 * areaM2) / Math.PI) * 1000;
      gritD = Math.min(dMaxMm, Math.max(dMinMm, Math.ceil(dRaw / 100) * 100));
      if (dRaw <= dMaxMm) break;
      lines += 1; // диаметра 6 м не хватает — увеличиваем число единиц (п. 6.28)
    }
    qLine = input.qMaxH / 3600 / lines;
    const areaFact = (Math.PI * (gritD / 1000) ** 2) / 4;
    gritLoad = input.qMaxH / lines / areaFact;
    gritDepth = GRIT.table28.tangential.depthM; // 0,5 м, табл. 28
    /* конический песковой бункер: высота принята D/2 (усечённый конус,
       образующая ≈ 60° к горизонтали) — ҚМҚ не нормирует, практика SUVSANOAT */
    gritConeMm = roundTo(gritD / 2, 50);
    vActual = qLine / areaFact; // нисходящая скорость, нормой не регламентируется
    retentionS = (areaFact * gritDepth) / (input.qMaxH / lines / 3600);
    Ls = gritD;
    Lg = gritD;
    Bs = gritD;
    Bgrease = Math.max(400, roundTo(gritD * 0.5, 100)); // жировая камера — по практике
    /* наружная ширина агрегата — щелевая песколовка + прямоугольная жировая
       камера рядом (как у горизонтального исполнения), иначе камере негде стоять */
    Wg = gritD + Bgrease + 3 * p.wallMm;
    Hg = 300 + gritDepth * 1000 + gritConeMm; // борт 300 + проточная часть 500 + конус
  }

  /* РЕШЁТКА ГРУБАЯ, п. 5.14: скорость в прозорах 0,8–1,0 м/с при максимальном
     притоке. Ширина канала так же ограничена снизу 300 мм, поэтому свободным
     параметром принята глубина воды в канале: она подбирается так, чтобы
     скорость легла в норму, и ограничена снизу 200 мм (конструктивно). */
  const kGap = p.coarseGapMm / (p.coarseGapMm + p.barMm);
  const hScrMin = 0.2;
  let Bscr = p.minChannelMm;
  let screenDepth = qLine / ((Bscr / 1000) * kGap * p.gapVelocityMs);
  if (screenDepth > p.screenWaterDepthM) {
    /* глубже принятой — расширяем канал */
    screenDepth = p.screenWaterDepthM;
    Bscr = Math.max(p.minChannelMm, roundTo((qLine / (p.gapVelocityMs * screenDepth * kGap)) * 1000, 100));
  } else if (screenDepth < hScrMin) {
    screenDepth = hScrMin;
  } else {
    screenDepth = Math.round(screenDepth * 20) / 20;
  }
  const vGapActual = qLine / ((Bscr / 1000) * screenDepth * kGap);
  const Lscr = p.fineScreen ? 2000 : 1200; // канал винтовой решётки 2000 — по паспорту типовых агрегатов; только грубая — 1200 (практика)

  /* приёмная камера */
  const aisle = 1500;
  const edge = 700;
  const Lrc = 1500;
  const Wrc = lines * Wg + (lines - 1) * aisle;

  /* платформа */
  const stairW = 900;
  const stairL = roundTo(p.platformElevM * 1000 * 1.4, 100); // уклон ≈ 35°, по практике
  const Wp = lines * Wg + (lines > 1 ? lines - 1 : 1) * aisle + 2 * edge;
  const Lp = edge + Lrc + Lscr + Lg + edge;

  /* отметки — от выхода к входу */
  const platform = p.platformElevM;
  /* низ проточной части: у горизонтальной над песковым бункером 600 мм,
     у щелевой — над коническим днищем высотой gritConeMm */
  const gritBottom = platform + (gritType === "tangential" ? gritConeMm / 1000 : 0.6);
  const gritWater = gritBottom + gritDepth;
  const gritTop = gritWater + 0.3;
  const lossFine = p.fineScreen ? 0.1 : 0; // винтовая решётка тонкой очистки — по паспорту
  const lossCoarse = 0.05 * SCREENS.headLossFactor.value; // чистая решётка ≈ 0,05 м × 3 (п. 6.24)
  const lossChannels = 0.05;
  const screenWater = gritWater + lossFine + lossChannels;
  const screenBottom = screenWater - screenDepth;
  const rcWater = screenWater + lossCoarse;
  const rcBottom = rcWater - 0.8;
  const rcTop = rcWater + 0.4;
  const Hrc = (rcTop - platform) * 1000;
  const inlet = rcWater + 0.3;
  const outlet = gritWater - 0.1;

  /* отбросы и песок */
  const persons = (input.q * 1000) / p.lpcd;
  const row = PUMP_STATIONS.screeningsPerCapita.find((r) => p.coarseGapMm >= r.gapMm[0] && p.coarseGapMm <= r.gapMm[1]) ?? PUMP_STATIONS.screeningsPerCapita[0];
  const screeningsM3Day = (persons * row.lPerPersonYear) / 365 / 1000;
  const sandM3Day = (persons * GRIT.sandPerCapita.lPersonDay) / 1000;

  return {
    lines, gritType, gritD, gritLoad, gritConeMm,
    Ls, Lg, Bs, Bgrease, Wg, Hg, gritDepthM: gritDepth, vActual, retentionS, Bscr, Lscr, screenDepthM: screenDepth, vGapActual, Lrc, Wrc, Hrc,
    Lp, Wp, edge, aisle, stairL, stairW,
    platform, gritBottom, gritWater, gritTop, screenBottom, screenWater, rcBottom, rcWater, rcTop, inlet, outlet,
    screeningsM3Day, sandM3Day, persons,
  };
}

/** масштаб листа: план ≤ 380 мм бумаги (справа остаётся место под изометрию), план + разрез ≤ 420 мм по высоте */
function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 430 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function mechScale(input: DrawingInput, overrides: Partial<MechParams> = {}): number {
  const g = mechGeometry(input, { ...mechDefaults(input), ...overrides });
  return fitScale(g.Lp, g.Wp, (g.rcTop + 0.8) * 1000 + 2 * g.stairL);
}

export function mechModel(input: DrawingInput, overrides: Partial<MechParams> = {}): StructureModel {
  const p = { ...mechDefaults(input), ...overrides };
  const g = mechGeometry(input, p);
  const c = construction();
  const dn = dnFor(input.qMaxH);
  /* приёмная камера — монолитная ж/б ёмкость */
  const cvRc = concreteVolume(
    c,
    { shape: "rect", w: g.Wrc + 2 * c.wallMm, l: g.Lrc + 2 * c.wallMm },
    Math.round((g.rcTop - g.rcBottom) * 1000),
  );
  const containers = 2 * g.lines;
  const vGrit =
    g.gritType === "tangential"
      ? (g.lines * Math.PI * (g.gritD / 1000) ** 2 * g.gritDepthM) / 4
      : (g.lines * g.Bs * g.Ls * g.gritDepthM * 1000) / 1e9;
  const vRc = (g.Lrc * g.Wrc * (g.rcWater - g.rcBottom) * 1000) / 1e9;
  const headLoss = +(g.rcWater - g.gritWater).toFixed(2);
  const emptyDays = (v: number) => (v > 0 ? Math.max(1, Math.floor((p.containerM3 * g.lines) / v)) : 0);

  const model: StructureModel = {
    id: "mech",
    kind: "mech",
    name: "Комплектная механическая очистка на платформе",
    supply: "own",
    material: "steel",
    footprint: { shape: "rect", w: g.Wp, l: g.Lp },
    bottom: 0,
    water: g.gritWater,
    top: g.rcTop,
    ground: 0,
    nozzles: [
      { role: "in", dn, side: "W", pos: g.Wp / 2, elev: g.inlet },
      { role: "out", dn, side: "E", pos: g.Wp / 2, elev: g.outlet },
      { role: "drain", dn: 100, side: "S", pos: g.Lp - g.edge - g.Lg / 2, elev: g.platform },
    ],
    volumes: [
      { name: "Проточная часть песколовок", m3: vGrit },
      { name: "Приёмная камера", m3: vRc },
      { name: "Отбросы с решёток, м³/сут", m3: g.screeningsM3Day },
      { name: "Песок, м³/сут", m3: g.sandM3Day },
      { name: "Бетон стен приёмной камеры", m3: cvRc.walls },
      { name: "Бетон днища приёмной камеры", m3: cvRc.slab },
      { name: "Бетонная подготовка", m3: cvRc.lean },
      { name: "Итого бетон, м³", m3: cvRc.total },
      { name: "Арматура, кг", m3: cvRc.total * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Решётка грубая с ручной очисткой", qty: `${g.lines} шт.`, spec: `прозоры ${p.coarseGapMm} мм, канал ${g.Bscr} мм`, supply: "own" },
      ...(p.fineScreen ? [{ name: "Винтовая решётка тонкой очистки", qty: `${g.lines} шт.`, spec: `прозоры ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм, Qmax ${(input.qMaxH / g.lines).toFixed(1)} м³/ч на линию`, supply: "supply" as const }] : []),
      {
        name: g.gritType === "tangential" ? "Песколовка щелевая (тангенциальная) с жировой камерой, стальной агрегат на платформе" : "Песколовка-жироловка (стальной агрегат на платформе)",
        qty: `${g.lines} шт.`,
        spec:
          g.gritType === "tangential"
            ? `D ${g.gritD} мм, проточная часть H ${g.gritDepthM.toFixed(2)} м, конический бункер ${g.gritConeMm} мм, нагрузка ${g.gritLoad.toFixed(1)} м³/(м²·ч); жировая камера ${g.Bgrease} мм, стенка ${p.wallMm} мм`
            : `лоток ${g.Bs}×${g.Ls} мм, H ${g.gritDepthM.toFixed(2)} м; жировая камера ${g.Bgrease} мм, стенка ${p.wallMm} мм`,
        supply: "own",
      },
      { name: "Аэрация жировой камеры (воздуходувка)", qty: "1+1", spec: "по паспорту агрегата", supply: "supply" },
      { name: "Контейнеры отбросов и песка", qty: `${containers} шт. × ${p.containerM3} м³`, spec: `вывоз отбросов раз в ${emptyDays(g.screeningsM3Day)} сут, песка раз в ${emptyDays(g.sandM3Day)} сут`, supply: "supply" },
      { name: "Платформа стальная оцинкованная с ограждением и лестницами", qty: `${(g.Lp / 1000).toFixed(1)}×${(g.Wp / 1000).toFixed(1)} м, отм. ${fmtE(g.platform)}`, supply: "own" },
      { name: "Камера приёмная железобетонная монолитная", qty: "1", spec: `${g.Lrc}×${g.Wrc} мм в свету, стены ${p.chamberWallMm} мм, днище ${p.chamberSlabMm} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Лотки, каналы решёток, щитовые затворы и обвязка на платформе", qty: "комплект", spec: "металлоконструкции", supply: "own" },
    ],
    basis: [
      constructionNote(c),
      `Приёмная камера — монолитный железобетон (раздел строительных работ подрядчика); платформа, лотки, каналы решёток и корпуса агрегатов — металл, изготовление SUVSANOAT. Толщина стенки корпуса песколовки-жироловки ${p.wallMm} мм — по паспорту агрегата (ҚМҚ 2.04.03-19 не нормирует).`,
      `Число линий — ${g.lines}: ${input.q > GRIT.requiredFromM3Day.value ? `при Q > ${GRIT.requiredFromM3Day.value} м³/сут песколовок не менее ${GRIT.minUnits.value}, все рабочие (${GRIT.minUnits.ref})` : "одна линия при Qmax ≤ 40 м³/ч (принято по практике)"}.`,
      ...(g.gritType === "horizontal"
        ? [
            `Тип песколовки — ГОРИЗОНТАЛЬНАЯ: при расходе на линию ${(input.qMaxH / g.lines).toFixed(1)} м³/ч и минимальной ширине лотка ${p.minChannelMm} мм глубина, дающая нормируемую скорость, укладывается в разрешённые ${GRIT.table28.ref} пределы 0,5–2 м.`,
            `Ширина лотка песколовки ${g.Bs} мм принята конструктивным минимумом; глубина проточной части подобрана H_s = ${g.gritDepthM.toFixed(2)} м в пределах 0,5–2 м (${GRIT.table28.ref}) так, чтобы скорость легла в норму: v = ${g.vActual.toFixed(2)} м/с ${g.vActual >= GRIT.table28.horizontal.vMinLps && g.vActual <= GRIT.table28.horizontal.vMaxLps ? "в пределах" : "ВНЕ пределов"} 0,15–0,3 м/с.`,
            `Длина песколовки L_s = 1000·K_s·H_s·v/u₀ = 1000·${p.ks}·${g.gritDepthM.toFixed(2)}·${g.vActual.toFixed(2)}/${p.u0MmS} = ${(g.Ls / 1000).toFixed(1)} м (${kmkRef("6.27", "ф. (18), табл. 27, 28")}; d = 0,2 мм, u₀ = ${p.u0MmS} мм/с, K_s = ${p.ks}). Длина считается по фактической скорости, а не по верхней границе диапазона.`,
            `Продолжительность протока в песколовке ${g.retentionS.toFixed(0)} с при v = ${g.vActual.toFixed(2)} м/с — ${g.retentionS >= GRIT.horizontalMinRetentionS.value ? "не менее" : "МЕНЕЕ"} ${GRIT.horizontalMinRetentionS.value} с (${GRIT.horizontalMinRetentionS.ref}).`,
          ]
        : [
            `Тип песколовки — ЩЕЛЕВАЯ (тангенциальная). Горизонтальная при таком расходе неприменима: расход на линию ${(input.qMaxH / g.lines).toFixed(1)} м³/ч, минимальное конструктивное сечение лотка ${p.minChannelMm} мм × 0,5 м (нижняя граница глубины по ${GRIT.table28.ref}) даёт скорость ${(input.qMaxH / g.lines / 3600 / ((p.minChannelMm / 1000) * GRIT.table28.horizontal.depthM[0])).toFixed(3)} м/с — ниже нормируемых 0,15 м/с, песок не задерживается избирательно и в бункер уходит органика. Принята щелевая песколовка по ${GRIT.tangentialLoad.ref}, для которой нормируется не скорость, а нагрузка на площадь в плане.`,
            `Диаметр щелевой песколовки D = ${g.gritD} мм: площадь в плане A = q max/n ÷ ${GRIT.tangentialLoad.value} = ${(input.qMaxH / g.lines).toFixed(1)} ÷ ${GRIT.tangentialLoad.value} = ${(input.qMaxH / g.lines / GRIT.tangentialLoad.value).toFixed(2)} м², фактическая нагрузка ${g.gritLoad.toFixed(1)} м³/(м²·ч) ≤ ${GRIT.tangentialLoad.value} м³/(м²·ч) при максимальном притоке, D ≤ ${GRIT.tangentialLoad.maxDiameterM} м (${GRIT.tangentialLoad.ref}). Диаметр округлён вверх кратно 100 мм и ограничен снизу конструктивным минимумом 1000 мм — ҚМҚ 2.04.03-19 не нормирует, принято по практике SUVSANOAT.`,
            `Глубина проточной части щелевой песколовки ${g.gritDepthM.toFixed(2)} м — ${GRIT.table28.ref} (щелевые песколовки). Песковой бункер конический высотой ${g.gritConeMm} мм (принята D/2, образующая ≈ 60° к горизонтали) и борт 300 мм — ҚМҚ не нормирует, приняты по практике SUVSANOAT. Содержание песка в осадке ${GRIT.table28.tangential.sandInSediment[0]}–${GRIT.table28.tangential.sandInSediment[1]} % (${GRIT.table28.ref}, щелевые) против ${GRIT.table28.horizontal.sandInSediment[0]}–${GRIT.table28.horizontal.sandInSediment[1]} % у горизонтальных. Требование ${GRIT.horizontalMinRetentionS.ref} о продолжительности протока ≥ ${GRIT.horizontalMinRetentionS.value} с относится к горизонтальным песколовкам и к щелевой не применяется.`,
          ]),
      `Решётка грубая — прозоры ${p.coarseGapMm} мм (${SCREENS.maxGapMm.ref}); глубина воды в канале подобрана ${g.screenDepthM.toFixed(2)} м при ширине ${g.Bscr} мм, скорость в прозорах ${g.vGapActual.toFixed(2)} м/с ${g.vGapActual >= 0.8 && g.vGapActual <= 1.0 ? `(${PUMP_STATIONS.screenGapVelocity.ref})` : p.fineScreen ? `— ${PUMP_STATIONS.screenGapVelocity.ref} (0,8–1,0 м/с) нормирует скорость в прозорах решётки, установленной В КАНАЛЕ; здесь задержание отбросов выполняет комплектный винтовой агрегат по паспорту производителя (решётчатая корзина внутри агрегата), а грубая решётка в канале работает как аварийно-обводная и по скорости не рассчитывается` : `— ВНЕ нормы 0,8–1,0 м/с (${PUMP_STATIONS.screenGapVelocity.ref}): при таком расходе канал минимальной ширины ${p.minChannelMm} мм остаётся избыточным, требуется агрегат меньшего типоразмера по паспорту`}. ${p.fineScreen ? `Тонкая решётка ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм после грубой — ${MBR_FINE_SCREEN.source}.` : "Тонкая решётка не предусмотрена (биология не мембранная)."}`,
      `Резерв решёток (${PUMP_STATIONS.screenReserve.ref}): ${PUMP_STATIONS.screenReserve.rule}. Грубые решётки с ручной очисткой — ${g.lines} раб. без резерва${p.fineScreen ? `; винтовые решётки — ${g.lines} раб., резервный агрегат по табл. 22 в компоновке не размещён — принят ЗИП шнек-барабана и обводной лоток через грубую решётку (практика, уточнить на стадии П)` : ""}. Проходы между агрегатами ${g.aisle} мм, по торцам ${g.edge} мм (${kmkRef("5.16")}).`,
      `Отбросы ${(g.screeningsM3Day * 1000).toFixed(0)} л/сут при ${Math.round(g.persons)} экв. жителей (${(input.q * 1000).toFixed(0)} л/сут ÷ ${p.lpcd} л/(чел·сут), табл. 3) и 8 л/(чел·год) при прозорах 16–20 мм (${kmkRef("5.13", "табл. 23")}); ${g.screeningsM3Day < SCREENS.mechanizedFromM3Day.value ? `менее ${SCREENS.mechanizedFromM3Day.value} м³/сут — ручная очистка грубой решётки допустима (${SCREENS.mechanizedFromM3Day.ref})` : `более ${SCREENS.mechanizedFromM3Day.value} м³/сут — очистка механизированная (${SCREENS.mechanizedFromM3Day.ref})`}.`,
      `Песок ${(g.sandM3Day * 1000).toFixed(0)} л/сут при ${GRIT.sandPerCapita.lPersonDay} л/(чел·сут), влажность ${GRIT.sandPerCapita.moisture} % (${GRIT.sandPerCapita.ref}); ${g.sandM3Day < GRIT.manualRemovalUpToM3Day.value ? `менее ${GRIT.manualRemovalUpToM3Day.value} м³/сут — допускается ручное удаление (${GRIT.manualRemovalUpToM3Day.ref})` : `удаление гидромеханическое (${GRIT.manualRemovalUpToM3Day.ref})`}.`,
      `Потери напора ${headLoss.toFixed(2)} м: грубая решётка 0,05 × ${SCREENS.headLossFactor.value} = ${(0.05 * SCREENS.headLossFactor.value).toFixed(2)} м (${SCREENS.headLossFactor.ref}), винтовая решётка 0,10 м (паспорт), лотки 0,05 м (практика).`,
      `Жировая камера${g.gritType === "tangential" ? ` (прямоугольная, ${g.Bgrease} мм, рядом с корпусом щелевой песколовки)` : ""}, песковой бункер, высота платформы ${fmtE(g.platform)} (контейнер ${p.containerMm.h} мм + зазор под балкой) и габариты контейнеров — ҚМҚ 2.04.03-19 не нормирует, приняты по практике SUVSANOAT. Подача сточной воды в приёмную камеру напорная (от КНС), вход выше уровня воды.`,
    ],
    calc: mechCalc(input, p, g),
    headLoss,
    draw: (sheet) => drawMech(sheet, input, p, g, model),
  };
  return model;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
const f2 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

function mechCalc(input: DrawingInput, p: MechParams, g: MechGeometry): CalcStep[] {
  const qLine = input.qMaxH / 3600 / g.lines;
  const kGap = p.coarseGapMm / (p.coarseGapMm + p.barMm);
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Расчётный расход сточных вод", symbol: "Q", value: f0(input.q), unit: "м³/сут", ref: "анкета объекта" },
    { kind: "input", what: "Максимальный часовой расход", symbol: "q max", value: f1(input.qMaxH), unit: "м³/ч", ref: kmkRef("2.7", "табл. 2") },
    { kind: "input", what: "Целевая скорость в горизонтальной песколовке (середина диапазона)", symbol: "v ц", value: f2(p.gritVelocityMs), unit: "м/с", ref: `${GRIT.table28.ref}: 0,15-0,3 м/с` },
    { kind: "input", what: "Конструктивный минимум ширины лотка", symbol: "B min", value: f0(p.minChannelMm), unit: "мм", ref: "ҚМҚ 2.04.03-19 не нормирует, практика SUVSANOAT" },
    { kind: "input", what: "Гидравлическая крупность песка (d = 0,2 мм)", symbol: "u0", value: f1(p.u0MmS), unit: "мм/с", ref: kmkRef("6.27", "табл. 27") },
    ...(g.gritType === "horizontal"
      ? [{ kind: "input" as const, what: "Коэффициент горизонтальной песколовки (d = 0,2 мм)", symbol: "K s", value: f2(p.ks), unit: "", ref: kmkRef("6.27", "табл. 27") }]
      : [
          { kind: "input" as const, what: "Нагрузка на площадь щелевой песколовки в плане", symbol: "q0 щел", value: f0(GRIT.tangentialLoad.value), unit: "м3/(м2*ч)", ref: `${GRIT.tangentialLoad.ref}: ${GRIT.tangentialLoad.unit}` },
          { kind: "input" as const, what: "Предельный диаметр щелевой песколовки", symbol: "D max", value: f1(GRIT.tangentialLoad.maxDiameterM), unit: "м", ref: GRIT.tangentialLoad.ref },
          { kind: "input" as const, what: "Конструктивный минимум диаметра щелевой песколовки", symbol: "D min", value: "1 000", unit: "мм", ref: "ҚМҚ 2.04.03-19 не нормирует, практика SUVSANOAT" },
        ]),
    { kind: "input", what: "Прозоры грубой решётки", symbol: "b", value: f0(p.coarseGapMm), unit: "мм", ref: SCREENS.maxGapMm.ref },
    { kind: "input", what: "Скорость в прозорах решётки", symbol: "v gap", value: f2(p.gapVelocityMs), unit: "м/с", ref: `${PUMP_STATIONS.screenGapVelocity.ref}: 0,8-1,0 м/с` },
    { kind: "input", what: "Удельное водоотведение (город до 50 тыс. чел.)", symbol: "q0", value: f0(p.lpcd), unit: "л/(чел*сут)", ref: kmkRef("2.3", "табл. 3") },

    /* ---------- расчёт ---------- */
    {
      kind: "calc",
      what: "Тип песколовки",
      symbol: "тип",
      formula: "горизонтальная, если H тр = q лин / (B min * v ц) >= 0,5 м; иначе щелевая (тангенциальная)",
      substitution:
        g.gritType === "horizontal"
          ? `H тр = ${f2(qLine)} / (${(p.minChannelMm / 1000).toFixed(2)} * ${f2(p.gritVelocityMs)}) = ${f2(qLine / ((p.minChannelMm / 1000) * p.gritVelocityMs))} м >= 0,50 м`
          : `H тр = ${f2(qLine)} / (${(p.minChannelMm / 1000).toFixed(2)} * ${f2(p.gritVelocityMs)}) = ${(qLine / ((p.minChannelMm / 1000) * p.gritVelocityMs)).toFixed(3)} м < 0,50 м; при минимальном сечении ${f0(p.minChannelMm)} мм * 0,5 м v = ${(qLine / ((p.minChannelMm / 1000) * GRIT.table28.horizontal.depthM[0])).toFixed(3)} м/с < 0,15 м/с`,
      value: g.gritType === "horizontal" ? "горизонтальная" : "щелевая (тангенциальная)",
      unit: "",
      ref:
        g.gritType === "horizontal"
          ? `${GRIT.table28.ref}: H s = 0,5...2 м, v = 0,15...0,3 м/с`
          : `${GRIT.table28.ref} (H s не менее 0,5 м, v не менее 0,15 м/с) - горизонтальная неприменима; принята щелевая по ${GRIT.tangentialLoad.ref}`,
    },
    {
      kind: "calc",
      what: "Число рабочих песколовок",
      symbol: "n",
      formula: "n >= 2 при Q > 100 м3/сут",
      substitution: input.q > GRIT.requiredFromM3Day.value ? `Q = ${f0(input.q)} > ${GRIT.requiredFromM3Day.value}` : `Qmax = ${f1(input.qMaxH)} м3/ч > 40 - принято по практике`,
      value: String(g.lines),
      unit: "шт.",
      ref: GRIT.minUnits.ref,
    },
    {
      kind: "calc",
      what: "Расход на одну линию",
      symbol: "q лин",
      formula: "q лин = q max / (3600 * n)",
      substitution: `q лин = ${f1(input.qMaxH)} / (3600 * ${g.lines})`,
      value: f2(qLine),
      unit: "м3/с",
      ref: "",
    },
    ...(g.gritType === "horizontal"
      ? ([
          {
            kind: "calc",
            what: "Ширина лотка песколовки",
            symbol: "B s",
            formula: "B s = B min (лоток минимальной ширины)",
            substitution: `B s = ${f0(p.minChannelMm)} мм`,
            value: f0(g.Bs),
            unit: "мм",
            ref: "ширина принята минимальной, в норму выводится глубиной - см. след. строку",
          },
          {
            kind: "calc",
            what: "Подбор глубины проточной части",
            symbol: "H s",
            formula: "H s = q лин / (B s * v ц), в пределах 0,5...2 м",
            substitution: `H s = ${f2(qLine)} / (${(g.Bs / 1000).toFixed(2)} * ${f2(p.gritVelocityMs)})`,
            value: g.gritDepthM.toFixed(2),
            unit: "м",
            ref: `${GRIT.table28.ref}: H s = 0,5...2 м`,
          },
          {
            kind: "calc",
            what: "Длина проточной части песколовки",
            symbol: "L s",
            formula: "L s = 1000 * K s * H s * v факт / u0",
            substitution: `L s = 1000 * ${f2(p.ks)} * ${g.gritDepthM.toFixed(2)} * ${f2(g.vActual)} / ${f1(p.u0MmS)}`,
            value: f0(g.Ls),
            unit: "мм",
            ref: `${kmkRef("6.27", "ф. (18), табл. 27, 28")}; длина по фактической скорости, а не по верхней границе диапазона`,
          },
          {
            kind: "calc",
            what: "Фактическая скорость в песколовке",
            symbol: "v факт",
            formula: "v факт = q лин / (B s * H s)",
            substitution: `v факт = ${f2(qLine)} / (${(g.Bs / 1000).toFixed(2)} * ${g.gritDepthM.toFixed(2)})`,
            value: f2(g.vActual),
            unit: "м/с",
            ref: "",
          },
          {
            kind: "check",
            what: "Скорость в песколовке в пределах нормы",
            formula: `${GRIT.table28.horizontal.vMinLps} <= v факт <= ${GRIT.table28.horizontal.vMaxLps} м/с`,
            substitution: `v факт = ${f2(g.vActual)} м/с`,
            value: g.vActual >= GRIT.table28.horizontal.vMinLps && g.vActual <= GRIT.table28.horizontal.vMaxLps ? "выполняется" : "НЕ выполняется",
            ref: GRIT.table28.ref,
          },
          {
            kind: "check",
            what: "Продолжительность протока в песколовке",
            symbol: "t",
            formula: "t = L s / v факт >= 30 с",
            substitution: `t = ${f0(g.Ls)} / 1000 / ${f2(g.vActual)} = ${g.retentionS.toFixed(0)} с`,
            value: g.retentionS >= GRIT.horizontalMinRetentionS.value ? "выполняется" : "НЕ выполняется",
            ref: GRIT.horizontalMinRetentionS.ref,
          },
        ] as CalcStep[])
      : ([
          {
            kind: "calc",
            what: "Площадь щелевой песколовки в плане",
            symbol: "A",
            formula: "A = (q max / n) / q0 щел",
            substitution: `A = (${f1(input.qMaxH)} / ${g.lines}) / ${f0(GRIT.tangentialLoad.value)}`,
            value: f2(input.qMaxH / g.lines / GRIT.tangentialLoad.value),
            unit: "м2",
            ref: `${GRIT.tangentialLoad.ref}: ${GRIT.tangentialLoad.unit}`,
          },
          {
            kind: "calc",
            what: "Диаметр щелевой песколовки",
            symbol: "D",
            formula: "D = SQRT(4A / пи), округление вверх кратно 100 мм, не менее D min, не более D max",
            substitution: `D = SQRT(4 * ${f2(input.qMaxH / g.lines / GRIT.tangentialLoad.value)} / 3,1416) = ${f2(Math.sqrt((4 * input.qMaxH) / g.lines / GRIT.tangentialLoad.value / Math.PI))} м; принято ${f0(g.gritD)} мм`,
            value: f0(g.gritD),
            unit: "мм",
            ref: `${GRIT.tangentialLoad.ref} (D не более ${GRIT.tangentialLoad.maxDiameterM} м); D min = 1000 мм и округление - ҚМҚ не нормирует, практика SUVSANOAT`,
          },
          {
            kind: "calc",
            what: "Фактическая нагрузка на площадь в плане",
            symbol: "q факт",
            formula: "q факт = (q max / n) / (пи * D^2 / 4)",
            substitution: `q факт = (${f1(input.qMaxH)} / ${g.lines}) / (3,1416 * ${(g.gritD / 1000).toFixed(2)}^2 / 4)`,
            value: f1(g.gritLoad),
            unit: "м3/(м2*ч)",
            ref: GRIT.tangentialLoad.ref,
          },
          {
            kind: "check",
            what: "Нагрузка на щелевую песколовку при максимальном притоке",
            formula: `q факт <= ${f0(GRIT.tangentialLoad.value)} м3/(м2*ч)`,
            substitution: `q факт = ${f1(g.gritLoad)} м3/(м2*ч)`,
            value: g.gritLoad <= GRIT.tangentialLoad.value ? "выполняется" : "НЕ выполняется",
            ref: GRIT.tangentialLoad.ref,
          },
          {
            kind: "check",
            what: "Предельный диаметр щелевой песколовки",
            formula: `D <= ${f1(GRIT.tangentialLoad.maxDiameterM)} м`,
            substitution: `D = ${(g.gritD / 1000).toFixed(1)} м при ${g.lines} ед.`,
            value: g.gritD <= GRIT.tangentialLoad.maxDiameterM * 1000 ? "выполняется" : "НЕ выполняется",
            ref: GRIT.tangentialLoad.ref,
          },
          {
            kind: "calc",
            what: "Глубина проточной части и конический песковой бункер",
            symbol: "H s / h к",
            formula: "H s = 0,5 м (табл. 28, щелевые); h к = D / 2",
            substitution: `H s = ${g.gritDepthM.toFixed(2)} м; h к = ${f0(g.gritD)} / 2 = ${f0(g.gritConeMm)} мм; борт 300 мм`,
            value: `${g.gritDepthM.toFixed(2)} м / ${f0(g.gritConeMm)} мм`,
            unit: "",
            ref: `H s - ${GRIT.table28.ref} (щелевые); конус (угол образующей ~60 град.) и борт - ҚМҚ не нормирует, практика SUVSANOAT`,
          },
        ] as CalcStep[])),
    {
      kind: "calc",
      what: "Ширина жировой камеры",
      symbol: "B ж",
      formula: g.gritType === "tangential" ? "B ж = 0,5 * D, не менее 400 мм" : "B ж = 0,8 * B s, не менее 400 мм",
      substitution: g.gritType === "tangential" ? `B ж = 0,5 * ${f0(g.gritD)}` : `B ж = 0,8 * ${f0(g.Bs)}`,
      value: f0(g.Bgrease),
      unit: "мм",
      ref: "ҚМҚ 2.04.03-19 не нормирует, принято по практике SUVSANOAT",
    },
    {
      kind: "calc",
      what: "Канал решётки: ширина и подбор глубины воды",
      symbol: "B scr / h в",
      formula: "k gap = b / (b + s);  h в = q лин / (B scr * k gap * v gap)",
      substitution: `k gap = ${f0(p.coarseGapMm)} / (${f0(p.coarseGapMm)} + ${f0(p.barMm)}) = ${kGap.toFixed(2)};  h в = ${f2(qLine)} / (${(g.Bscr / 1000).toFixed(2)} * ${kGap.toFixed(2)} * ${f2(p.gapVelocityMs)})`,
      value: `${f0(g.Bscr)} мм / ${g.screenDepthM.toFixed(2)} м`,
      unit: "",
      ref: `${PUMP_STATIONS.screenGapVelocity.ref}; глубина воды в канале - свободный параметр подбора, не менее 0,20 м (практика)`,
    },
    p.fineScreen
      ? {
          /* задержание отбросов выполняет комплектный винтовой агрегат: решётчатая
             корзина внутри корпуса, а не решётка в канале, поэтому п. 5.14 к нему
             не относится и проверка скорости в прозорах не выполняется */
          kind: "calc",
          what: "Скорость в прозорах решётки",
          symbol: "v gap",
          formula: "не проверяется - решётка комплектная, внутри агрегата",
          substitution: `винтовая решётка ${MBR_FINE_SCREEN.gapMm[0]}-${MBR_FINE_SCREEN.gapMm[1]} мм, Qmax ${f1(input.qMaxH / g.lines)} м3/ч на агрегат`,
          value: "по паспорту производителя",
          unit: "",
          ref: `${PUMP_STATIONS.screenGapVelocity.ref} нормирует скорость в прозорах решётки, установленной В КАНАЛЕ; принят комплектный винтовой агрегат (решётка внутри корпуса), грубая решётка в канале - аварийно-обводная`,
        }
      : {
          kind: "check",
          what: "Скорость в прозорах решётки",
          formula: "0,8 <= v gap <= 1,0 м/с",
          substitution: `v gap = ${f2(g.vGapActual)} м/с при B scr = ${f0(g.Bscr)} мм`,
          value: g.vGapActual >= 0.8 && g.vGapActual <= 1.0 ? "выполняется" : "НЕ выполняется - требуется агрегат меньшего типоразмера по паспорту",
          ref: PUMP_STATIONS.screenGapVelocity.ref,
        },
    {
      kind: "calc",
      what: "Эквивалентное число жителей",
      symbol: "N",
      formula: "N = Q * 1000 / q0",
      substitution: `N = ${f0(input.q)} * 1000 / ${f0(p.lpcd)}`,
      value: f0(g.persons),
      unit: "чел.",
      ref: kmkRef("2.3", "табл. 3"),
    },
    {
      kind: "calc",
      what: "Объём отбросов с решёток",
      symbol: "W отбр",
      formula: "W отбр = N * 8 л/(чел*год) / 365 / 1000",
      substitution: `W отбр = ${f0(g.persons)} * 8 / 365 / 1000`,
      value: f2(g.screeningsM3Day),
      unit: "м3/сут",
      ref: kmkRef("5.13", "табл. 23"),
    },
    {
      kind: "calc",
      what: "Объём песка",
      symbol: "W песок",
      formula: "W песок = N * 0,02 л/(чел*сут) / 1000",
      substitution: `W песок = ${f0(g.persons)} * ${GRIT.sandPerCapita.lPersonDay} / 1000`,
      value: f2(g.sandM3Day),
      unit: "м3/сут",
      ref: `${GRIT.sandPerCapita.ref}; содержание песка в осадке ${g.gritType === "tangential" ? `${GRIT.table28.tangential.sandInSediment[0]}-${GRIT.table28.tangential.sandInSediment[1]} % (щелевая` : `${GRIT.table28.horizontal.sandInSediment[0]}-${GRIT.table28.horizontal.sandInSediment[1]} % (горизонтальная`}, ${GRIT.table28.ref})`,
    },
    {
      kind: "calc",
      what: "Отметка воды в приёмной камере",
      formula: "вода прк = вода песколовки + сумма потерь (винтовая решётка + грубая решётка + лотки)",
      substitution: `${fmtE(g.gritWater)} + ${(p.fineScreen ? 0.1 : 0).toFixed(2)} + ${(0.05 * SCREENS.headLossFactor.value).toFixed(2)} + 0,05`,
      value: fmtE(g.rcWater),
      unit: "м",
      ref: `грубая решётка - ${SCREENS.headLossFactor.ref}; винтовая решётка и лотки - паспорт / практика`,
    },
  ];
  return steps;
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawMech(sheet: Sheet, input: DrawingInput, p: MechParams, g: MechGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th;
  const ts = sheet.ts;
  const f = sheet.field;
  const dn = dnFor(input.qMaxH);

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(30);
  const py = f.y0 + f.h - sheet.p(45) - g.Wp;
  sheet.viewTitle(px, py + g.Wp + sheet.p(16), "ПЛАН");

  d.rect(px, py, g.Lp, g.Wp, "CONTOUR");
  /* ограждение по периметру */
  d.rect(px + 60, py + 60, g.Lp - 120, g.Wp - 120, "THIN");
  /* колонны платформы */
  const colStep = 3000;
  const nCols = Math.max(2, Math.round(g.Lp / colStep) + 1);
  for (let i = 0; i < nCols; i++) {
    const x = px + 300 + ((g.Lp - 600) * i) / (nCols - 1);
    for (const y of [py + 300, py + g.Wp - 300]) d.rect(x - 75, y - 75, 150, 150, "HIDDEN");
  }
  /* лестницы на обоих торцах */
  drawStairPlan(sheet, px - g.stairL, py + g.Wp / 2 - g.stairW / 2, g.stairL, g.stairW);
  drawStairPlan(sheet, px + g.Lp, py + g.Wp / 2 - g.stairW / 2, g.stairL, g.stairW, true);

  const lineY = (i: number) => py + g.edge + i * (g.Wg + g.aisle);
  /* приёмная камера */
  const xr = px + g.edge;
  d.rect(xr, lineY(0), g.Lrc, g.Wrc, "CONTOUR");
  const cw = p.chamberWallMm;
  d.rect(xr + cw, lineY(0) + cw, g.Lrc - 2 * cw, g.Wrc - 2 * cw, "CONTOUR");
  /* стены камеры — монолитный железобетон */
  d.concrete([[xr, lineY(0)], [xr + g.Lrc, lineY(0)], [xr + g.Lrc, lineY(0) + cw], [xr, lineY(0) + cw]], sheet.p(1.5));
  d.concrete([[xr, lineY(0) + g.Wrc - cw], [xr + g.Lrc, lineY(0) + g.Wrc - cw], [xr + g.Lrc, lineY(0) + g.Wrc], [xr, lineY(0) + g.Wrc]], sheet.p(1.5));
  d.concrete([[xr, lineY(0)], [xr + cw, lineY(0)], [xr + cw, lineY(0) + g.Wrc], [xr, lineY(0) + g.Wrc]], sheet.p(1.5));
  d.concrete([[xr + g.Lrc - cw, lineY(0)], [xr + g.Lrc, lineY(0)], [xr + g.Lrc, lineY(0) + g.Wrc], [xr + g.Lrc - cw, lineY(0) + g.Wrc]], sheet.p(1.5));
  d.text(xr + g.Lrc / 2, lineY(0) + g.Wrc + th * 0.4, ts, "ПРИЁМНАЯ КАМЕРА", { align: "center" });
  /* подводящая труба */
  d.line(px - g.stairL - sheet.p(10), lineY(0) + g.Wrc / 2, xr + g.Lrc / 2, lineY(0) + g.Wrc / 2, "PIPE");
  d.arrow(px - g.stairL - sheet.p(16), lineY(0) + g.Wrc / 2, px - g.stairL - sheet.p(10), lineY(0) + g.Wrc / 2, "FLOW", sheet.p(2));
  d.text(px - g.stairL - sheet.p(2), lineY(0) + g.Wrc / 2 + th * 0.6, ts, `ОТ КНС DN${dn}`, { align: "right" });

  const xs = xr + g.Lrc; // начало каналов решёток
  const xg = xs + g.Lscr; // начало песколовок
  for (let i = 0; i < g.lines; i++) {
    const y0 = lineY(i);
    /* канал решёток; у щелевой песколовки канал сразу лежит на касательной
       к окружности (нижняя образующая корпуса), чтобы подвод был тангенциальным */
    const yc = g.gritType === "tangential" ? y0 + p.wallMm : y0 + (g.Wg - g.Bscr) / 2;
    d.rect(xs, yc, g.Lscr, g.Bscr, "CONTOUR");
    /* грубая решётка — стержни на выходе из приёмной камеры */
    for (let k = 0; k <= 4; k++) d.line(xs + 150, yc + (g.Bscr * k) / 4, xs + 250, yc + (g.Bscr * k) / 4, "EQUIP");
    d.line(xs + 200, yc, xs + 200, yc + g.Bscr, "EQUIP");
    const yDump = i === 0 && g.lines > 1 ? y0 + g.Wg + g.aisle / 2 : g.lines === 1 ? y0 + g.Wg + g.aisle / 2 : y0 - g.aisle / 2;
    const xScr = p.fineScreen ? xs + 900 : xs + 200;
    if (p.fineScreen) {
      /* винтовая решётка: корыто в канале + наклонный шнек к контейнеру (в проход) */
      d.rect(xs + 500, yc + 50, 900, g.Bscr - 100, "EQUIP");
      d.line(xs + 950, yc + g.Bscr / 2, xs + 950, yDump, "EQUIP");
      d.line(xs + 850, yc + g.Bscr / 2, xs + 850, yDump, "EQUIP");
      d.circle(xs + 900, yDump, 120, "EQUIP");
      d.text(xs + g.Lscr / 2, y0 - th * 1.4 + (i === 0 && g.lines > 1 ? 0 : g.Wg + th * 2.6), ts * 0.85, `ВИНТОВАЯ РЕШЁТКА ${MBR_FINE_SCREEN.gapMm[1]} ММ`, { align: "center" });
    } else {
      /* только грубая решётка: лоток сброса отбросов в контейнер */
      d.line(xScr, yc + g.Bscr / 2, xScr, yDump, "EQUIP");
      d.text(xs + g.Lscr / 2, y0 - th * 1.4 + (i === 0 && g.lines > 1 ? 0 : g.Wg + th * 2.6), ts * 0.85, `РЕШЁТКА ${p.coarseGapMm} ММ`, { align: "center" });
    }
    /* контейнер отбросов под платформой */
    d.rect(xScr - p.containerMm.l / 2, yDump - p.containerMm.w / 2, p.containerMm.l, p.containerMm.w, "HIDDEN");
    d.text(xScr, yDump + p.containerMm.w / 2 + th * 0.3, ts * 0.8, "КОНТЕЙНЕР", { align: "center" });

    /* песколовка-жироловка */
    d.rect(xg, y0, g.Lg, g.Wg, "CONTOUR");
    const w = p.wallMm;
    const yb = y0 + w; // лоток (или щелевая песколовка) снизу, жировая камера сверху
    const ySand = yDump;
    if (g.gritType === "tangential") {
      /* ЩЕЛЕВАЯ (ТАНГЕНЦИАЛЬНАЯ) ПЕСКОЛОВКА, п. 6.28 */
      const r = g.gritD / 2;
      const cxg = xg + g.Lg / 2;
      const cyg = yb + r;
      d.circle(cxg, cyg, r, "CONTOUR");
      d.circle(cxg, cyg, r - w, "THIN");
      /* подводящий лоток по касательной: нижняя образующая корпуса */
      const bIn = Math.min(g.Bscr, Math.round(r * 0.8));
      const xCut = cxg - Math.sqrt(Math.max(0, r * r - (r - bIn) * (r - bIn)));
      d.line(xg - g.Lscr / 2, cyg - r, cxg, cyg - r, "THIN");
      d.line(xg - g.Lscr / 2, cyg - r + bIn, xCut, cyg - r + bIn, "THIN");
      d.arrow(xg - 400, cyg - r + bIn / 2, xg + 100, cyg - r + bIn / 2, "FLOW", 120);
      d.text(xg - 200, cyg - r + bIn + ts * 0.5, ts * 0.7, "ПОДВОД ПО КАСАТЕЛЬНОЙ", { align: "right" });
      /* центральный пескоприёмник и песковой патрубок */
      d.circle(cxg, cyg, Math.max(150, Math.round(r / 3)), "THIN");
      d.circle(cxg, cyg, Math.max(75, Math.round(r / 6)), "EQUIP");
      /* закрутка потока */
      d.arc(cxg, cyg, r - w - 100, 200, 340, "FLOW");
      /* отвод осветлённой воды — водослив на противоположной от подвода стороне */
      d.arc(cxg, cyg, r - w, 20, 70, "EQUIP");
      d.text(cxg, cyg + r * 0.45, ts * 0.65, `ЩЕЛЕВАЯ D=${g.gritD}`, { align: "center" });
      /* песковой контейнер под центральным бункером, в проходе */
      d.rect(cxg - p.containerMm.l / 2, ySand - p.containerMm.w / 2, p.containerMm.l, p.containerMm.w, "HIDDEN");
      d.line(cxg, cyg, cxg, ySand, "EQUIP");
      d.text(cxg, ySand + p.containerMm.w / 2 + th * 0.3, ts * 0.8, "КОНТЕЙНЕР ПЕСКА", { align: "center" });
    } else {
      d.rect(xg + w, yb, g.Lg - 2 * w, g.Bs, "THIN");
      /* проточная часть L_s: входная/выходная зоны */
      d.line(xg + 600, yb, xg + 600, yb + g.Bs, "THIN");
      d.line(xg + 600 + g.Ls, yb, xg + 600 + g.Ls, yb + g.Bs, "THIN");
      /* песковой бункер под входной частью */
      d.rect(xg + 600, yb, Math.min(1500, g.Ls / 3), g.Bs, "HIDDEN");
      d.text(xg + g.Lg / 2, yb + g.Bs / 2 - ts * 0.4, ts * 0.85, `ПЕСКОЛОВКА L=${g.Ls}`, { align: "center" });
      /* песковой контейнер под бункером в проходе */
      d.rect(xg + 600 - p.containerMm.l / 2 + 750, ySand - p.containerMm.w / 2, p.containerMm.l, p.containerMm.w, "HIDDEN");
      d.line(xg + 600 + 750, yb, xg + 600 + 750, ySand, "EQUIP");
      d.text(xg + 1350, ySand + p.containerMm.w / 2 + th * 0.3, ts * 0.8, "КОНТЕЙНЕР ПЕСКА", { align: "center" });
      /* стрелка потока в лотке */
      d.arrow(xg + 1000, yb + g.Bs / 2 + ts, xg + 2500, yb + g.Bs / 2 + ts, "FLOW", 120);
    }
    /* жировая камера — прямоугольная, рядом с песколовкой */
    d.rect(xg + w, yb + g.Bs + w, g.Lg - 2 * w, g.Bgrease, "THIN");
    /* аэрация жировой камеры — перфорированная труба вдоль перегородки */
    const aer0 = xg + Math.min(600, g.Lg / 6);
    const aer1 = xg + g.Lg - Math.min(600, g.Lg / 6);
    d.line(aer0, yb + g.Bs + w + 100, aer1, yb + g.Bs + w + 100, "PIPE");
    for (let x = aer0 + 300; x < aer1; x += 1000) d.circle(x, yb + g.Bs + w + 100, 60, "EQUIP");
    d.text(xg + g.Lg / 2, yb + g.Bs + w + g.Bgrease / 2 - ts * 0.4, ts * 0.85, "ЖИРОЛОВКА", { align: "center" });
    d.text(px + g.Lp / 2, y0 + g.Wg + ts * 0.3, ts * 0.8, `ЛИНИЯ ${i + 1}`, { align: "center" });
  }
  /* отвод к биологии — общий коллектор на торце */
  const yOut = py + g.Wp / 2;
  d.line(xg + g.Lg, lineY(0) + p.wallMm + g.Bs / 2, xg + g.Lg + 300, lineY(0) + p.wallMm + g.Bs / 2, "PIPE");
  if (g.lines > 1) d.line(xg + g.Lg, lineY(1) + p.wallMm + g.Bs / 2, xg + g.Lg + 300, lineY(1) + p.wallMm + g.Bs / 2, "PIPE");
  d.line(xg + g.Lg + 300, lineY(0) + p.wallMm + g.Bs / 2, xg + g.Lg + 300, g.lines > 1 ? lineY(1) + p.wallMm + g.Bs / 2 : yOut, "PIPE");
  d.line(xg + g.Lg + 300, yOut, px + g.Lp + g.stairL + sheet.p(10), yOut, "PIPE");
  d.arrow(px + g.Lp + g.stairL + sheet.p(10), yOut, px + g.Lp + g.stairL + sheet.p(16), yOut, "FLOW", sheet.p(2));
  d.text(px + g.Lp + g.stairL + sheet.p(2), yOut + th * 0.6, ts, `НА УСРЕДНИТЕЛЬ DN${dn}`, { align: "left" });
  d.text(px + g.Lp / 2, py + sheet.p(2), ts * 0.8, "ОЦИНКОВАННАЯ СТАЛЬНАЯ ПЛАТФОРМА", { align: "center" });

  /* размеры плана */
  const yd = py - sheet.p(10);
  const xChain = g.gritType === "tangential" ? [px, xr, xs, xg, xg + g.Lg / 2, xg + g.Lg, px + g.Lp] : [px, xr, xs, xg, xg + 600, xg + 600 + g.Ls, xg + g.Lg, px + g.Lp];
  d.dimChainH(xChain, yd, th);
  d.dimH(px, px + g.Lp, yd - sheet.p(10), `${g.Lp}`, th);
  const xd = px + g.Lp + g.stairL + sheet.p(12);
  const ys: number[] = [py, lineY(0), lineY(0) + p.wallMm, lineY(0) + p.wallMm + g.Bs, lineY(0) + g.Wg];
  if (g.lines > 1) ys.push(lineY(1), lineY(1) + g.Wg);
  ys.push(py + g.Wp);
  d.dimChainV(xd, ys, th);
  d.dimV(xd + sheet.p(10), py, py + g.Wp, `${g.Wp}`, th);

  /* марки разрезов */
  const y11 = lineY(0) + p.wallMm + g.Bs / 2;
  d.sectionMark(px - g.stairL - sheet.p(4), y11, px + g.Lp + g.stairL + sheet.p(4), y11, "1", th, -1);
  const x22 = xg + g.Lg / 2;
  d.sectionMark(x22, py - sheet.p(4), x22, py + g.Wp + sheet.p(4), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const Htot = (g.rcTop + 0.8) * 1000; // высота вида: до верха шнека
  const sy = yd - sheet.p(45) - Htot;
  sheet.viewTitle(px - g.stairL, sy + Htot + sheet.p(14), "РАЗРЕЗ 1-1");
  sectionLong(sheet, px, sy, input, p, g);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const cx = px;
  const cy = sy - sheet.p(55) - Htot;
  sheet.viewTitle(cx, cy + Htot + sheet.p(14), "РАЗРЕЗ 2-2");
  sectionCross(sheet, cx, cy, p, g);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.Lp + g.stairL + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(8) - isoLeft;
  const availH = f.h - sheet.p(34) - sheet.p(30);
  const kIso = Math.min(0.5, avail / ((g.Lp + 2 * g.stairL + g.Wp) * Math.cos(Math.PI / 6)), availH / ((g.Lp + g.Wp) * 0.5 + g.rcTop * 1000 + 1100 + g.stairL * 0.5));
  const ix = isoLeft + (g.Wp + g.stairL) * kIso * Math.cos(Math.PI / 6);
  const isoH = (g.Lp + g.Wp) * kIso * 0.5 + (g.rcTop * 1000 + 1100) * kIso;
  const iy = f.y0 + f.h - sheet.p(34) - isoH;
  sheet.viewTitle(isoLeft, py + g.Wp + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, p, g, kIso);

  /* примечания */
  sheet.note(`Механическая очистка: ${g.lines} лин. — решётка грубая ${p.coarseGapMm} мм (п. 6.16)${p.fineScreen ? `, винтовая решётка ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм (перед мембранами)` : ""}, ${g.gritType === "tangential" ? `песколовка щелевая (тангенциальная) D=${g.gritD} мм, H ${g.gritDepthM.toFixed(2)} м, нагрузка ${g.gritLoad.toFixed(1)} ≤ ${GRIT.tangentialLoad.value} м³/(м²·ч) (п. 6.28, табл. 28)` : `песколовка-жироловка ${g.Bs}×${g.Ls} мм (H ${g.gritDepthM.toFixed(2)} м, ф. (18) п. 6.27, табл. 27–28)`}. Платформа ${g.Lp}×${g.Wp} мм, отм. ${fmtE(g.platform)}.`);
  sheet.note(`Отметки воды: приёмная камера ${fmtE(g.rcWater)}, канал решётки ${fmtE(g.screenWater)}, песколовка ${fmtE(g.gritWater)}; выход ${fmtE(g.outlet)}. Потери на сооружении ${(g.rcWater - g.gritWater).toFixed(2)} м.`);
  sheet.note(`Контейнеры ${2 * g.lines} шт. по ${p.containerM3} м³ под платформой: отбросы ${(g.screeningsM3Day * 1000).toFixed(0)} л/сут, песок ${(g.sandM3Day * 1000).toFixed(0)} л/сут (табл. 23, п. 6.31).`);
  sheet.note(`Винтовые решётки и воздуходувка жироловки — покупные агрегаты; приёмная камера — монолитный железобетон (стены ${p.chamberWallMm} мм, днище ${p.chamberSlabMm} мм, бетон ${construction().concreteGrade}); платформа, лотки и корпуса песколовок-жироловок — изготовление SUVSANOAT.`);
  /* ведомость расчёта — в свободном поле под разрезами */
  const calcY = Math.min(sy, cy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px - g.stairL, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: "платформа, корпуса агрегатов, приёмная камера" },
    { layer: "HATCH", text: "железобетон приёмной камеры" },
    { layer: "HIDDEN", text: "контейнеры, колонны под платформой" } as unknown as { layer: "CONTOUR"; text: string },
    { layer: "WATER", text: "расчётный уровень воды" },
    { layer: "EQUIP", text: "решётки, шнеки, аэрация" },
    { layer: "PIPE", text: "трубопроводы" },
  ]);
}

/** лестница в плане: прямоугольник со ступенями */
function drawStairPlan(sheet: Sheet, x: number, y: number, L: number, W: number, up = false) {
  const d = sheet.d;
  d.rect(x, y, L, W, "THIN");
  const steps = Math.max(4, Math.round(L / 280));
  for (let i = 1; i < steps; i++) d.line(x + (L * i) / steps, y, x + (L * i) / steps, y + W, "THIN");
  d.arrow(up ? x + 100 : x + L - 100, y + W / 2, up ? x + L - 100 : x + 100, y + W / 2, "THIN", 100);
  void sheet;
}

/** лестница в разрезе: ступени от земли до платформы, направление dir (1 — вверх вправо) */
function drawStairSection(sheet: Sheet, x: number, y0: number, L: number, H: number, dir: 1 | -1) {
  const d = sheet.d;
  const steps = Math.max(4, Math.round(L / 280));
  const pts: Pt[] = [[x, y0]];
  for (let i = 0; i < steps; i++) {
    const xa = x + (dir * L * i) / steps;
    const xb = x + (dir * L * (i + 1)) / steps;
    const ya = y0 + (H * (i + 1)) / steps;
    pts.push([xa, ya], [xb, ya]);
  }
  d.poly(pts, "CONTOUR", false);
  /* поручень */
  d.line(x, y0 + 1000, x + dir * L, y0 + H + 1000, "THIN");
  d.line(x, y0, x, y0 + 1000, "THIN");
  d.line(x + dir * L, y0 + H, x + dir * L, y0 + H + 1000, "THIN");
  void sheet;
}

/** ограждение в разрезе: стойки и поручень на отметке платформы */
function drawRailing(sheet: Sheet, x1: number, x2: number, y: number) {
  const d = sheet.d;
  const h = 1100;
  d.line(x1, y + h, x2, y + h, "THIN");
  d.line(x1, y + h / 2, x2, y + h / 2, "THIN");
  const n = Math.max(1, Math.round((x2 - x1) / 1500));
  for (let i = 0; i <= n; i++) d.line(x1 + ((x2 - x1) * i) / n, y, x1 + ((x2 - x1) * i) / n, y + h, "THIN");
  void sheet;
}

function platformSection(sheet: Sheet, x: number, groundY: number, L: number, yPlat: number) {
  const d = sheet.d;
  const beam = 200;
  d.rect(x, yPlat - beam, L, beam, "CONTOUR");
  d.hatch([[x, yPlat - beam], [x + L, yPlat - beam], [x + L, yPlat], [x, yPlat]], sheet.p(1.5), 45);
  /* колонны с подушками */
  const n = Math.max(2, Math.round(L / 3000) + 1);
  for (let i = 0; i < n; i++) {
    const cx = x + 300 + ((L - 600) * i) / (n - 1);
    d.rect(cx - 75, groundY, 150, yPlat - beam - groundY, "CONTOUR");
    d.rect(cx - 300, groundY - 300, 600, 300, "CONTOUR");
    d.concrete([[cx - 300, groundY - 300], [cx + 300, groundY - 300], [cx + 300, groundY], [cx - 300, groundY]], sheet.p(1.5));
  }
}

function sectionLong(sheet: Sheet, x: number, y: number, input: DrawingInput, p: MechParams, g: MechGeometry) {
  const d = sheet.d;
  const th = sheet.th;
  const ts = sheet.ts;
  const Z = (e: number) => y + e * 1000; // отметка → y
  const groundY = Z(0);
  const yPlat = Z(g.platform);
  d.groundLine(x - g.stairL - sheet.p(12), x + g.Lp + g.stairL + sheet.p(12), groundY, sheet.p(3), sheet.p(3));
  platformSection(sheet, x, groundY, g.Lp, yPlat);
  drawStairSection(sheet, x, groundY, g.stairL, g.platform * 1000, -1);
  drawStairSection(sheet, x + g.Lp, groundY, g.stairL, g.platform * 1000, 1);

  const xr = x + g.edge, xs = xr + g.Lrc, xg = xs + g.Lscr;
  /* приёмная камера */
  const cw = p.chamberWallMm, cs = p.chamberSlabMm;
  d.rect(xr, Z(g.rcBottom), g.Lrc, (g.rcTop - g.rcBottom) * 1000, "CONTOUR");
  /* монолитные стены и днище камеры */
  const rcTopY = Z(g.rcTop), rcBotY = Z(g.rcBottom);
  d.concrete([[xr, rcBotY], [xr + cw, rcBotY], [xr + cw, rcTopY], [xr, rcTopY]], sheet.p(1.5));
  d.concrete([[xr + g.Lrc - cw, rcBotY], [xr + g.Lrc, rcBotY], [xr + g.Lrc, rcTopY], [xr + g.Lrc - cw, rcTopY]], sheet.p(1.5));
  d.rect(xr, rcBotY - cs, g.Lrc, cs, "CONTOUR");
  d.concrete([[xr, rcBotY - cs], [xr + g.Lrc, rcBotY - cs], [xr + g.Lrc, rcBotY], [xr, rcBotY]], sheet.p(1.5));
  d.line(xr, Z(g.rcWater), xr + g.Lrc, Z(g.rcWater), "WATER");
  d.waterLevel(xr + g.Lrc / 2, Z(g.rcWater), undefined, th);
  /* подводящая труба — сверху в камеру */
  const dn = dnFor(input.qMaxH);
  d.line(x - g.stairL - sheet.p(10), Z(g.inlet), xr + 300, Z(g.inlet), "PIPE");
  d.line(xr + 300, Z(g.inlet), xr + 300, Z(g.rcWater) + 100, "PIPE");
  d.text(x - g.stairL - sheet.p(2), Z(g.inlet) + th * 0.5, ts * 0.85, `ОТ КНС DN${dn}`, { align: "right" });
  d.text(xr + g.Lrc / 2, Z(g.rcTop) + th * 0.5, ts * 0.85, "ПРИЁМНАЯ КАМЕРА", { align: "center" });
  /* канал решёток */
  d.rect(xs, Z(g.screenBottom), g.Lscr, (g.rcWater + 0.2 - g.screenBottom) * 1000, "CONTOUR");
  d.line(xs, Z(g.screenWater), xs + g.Lscr, Z(g.screenWater), "WATER");
  /* грубая решётка: наклонная в начале канала */
  d.line(xs + 150, Z(g.screenBottom), xs + 450, Z(g.rcWater) + 300, "EQUIP");
  d.line(xs + 200, Z(g.screenBottom), xs + 500, Z(g.rcWater) + 300, "EQUIP");
  if (p.fineScreen) {
    /* винтовая решётка: наклон 35°, выгрузка над проходом */
    const sx0 = xs + 600, sy0 = Z(g.screenBottom) + 50;
    const sLen = 2600;
    const ang = (35 * Math.PI) / 180;
    const sx1 = sx0 + sLen * Math.cos(ang), sy1 = sy0 + sLen * Math.sin(ang);
    d.line(sx0, sy0, sx1, sy1, "EQUIP");
    d.line(sx0 + 250 * Math.sin(ang), sy0 - 250 * Math.cos(ang), sx1 + 250 * Math.sin(ang), sy1 - 250 * Math.cos(ang), "EQUIP");
    d.line(sx0, sy0, sx0 + 250 * Math.sin(ang), sy0 - 250 * Math.cos(ang), "EQUIP");
    d.rect(sx1, sy1 - 250, 400, 350, "EQUIP");
    d.text(sx1 + 200, sy1 + 200 + th * 0.4, ts * 0.85, `ВИНТОВАЯ РЕШЁТКА ${MBR_FINE_SCREEN.gapMm[1]} ММ`, { align: "left" });
  } else {
    d.text(xs + 500, Z(g.rcWater) + 300 + th * 0.4, ts * 0.85, `РЕШЁТКА ${p.coarseGapMm} ММ`, { align: "left" });
  }
  /* песколовка-жироловка */
  d.rect(xg, yPlat, g.Lg, g.Hg, "CONTOUR");
  d.line(xg, Z(g.gritWater), xg + g.Lg, Z(g.gritWater), "WATER");
  d.waterLevel(xg + g.Lg * 0.6, Z(g.gritWater), undefined, th);
  if (g.gritType === "tangential") {
    /* ЩЕЛЕВАЯ: цилиндр проточной части 0,5 м (табл. 28) на коническом днище */
    const cxg = xg + g.Lg / 2;
    const dOut = 300; // песковой патрубок — по практике
    d.line(xg, Z(g.gritBottom), xg + g.Lg, Z(g.gritBottom), "THIN");
    d.poly([[xg, Z(g.gritBottom)], [cxg - dOut / 2, yPlat], [cxg + dOut / 2, yPlat], [xg + g.Lg, Z(g.gritBottom)]], "CONTOUR", false);
    d.text(cxg, Z(g.gritBottom) + (g.gritDepthM * 1000) / 2 - ts * 0.4, ts * 0.8, `ЩЕЛЕВАЯ D=${g.gritD}`, { align: "center" });
    d.elevMark(xg + 150, Z(g.gritBottom), fmtE(g.gritBottom), th, -1);
  } else {
    d.line(xg, Z(g.gritBottom), xg + g.Lg, Z(g.gritBottom), "CONTOUR");
    /* бункер песка — воронка под входной зоной, шнек в контейнер */
    const hb = Math.min(1500, g.Ls / 3);
    d.poly([[xg + 600, Z(g.gritBottom)], [xg + 600 + hb, Z(g.gritBottom)], [xg + 600 + hb / 2 + 200, yPlat], [xg + 600 + hb / 2 - 200, yPlat]], "CONTOUR", true);
    d.text(xg + g.Lg / 2, Z(g.gritBottom) + (g.gritDepthM * 1000) / 2 - ts * 0.4, ts * 0.85, `ПЕСКОЛОВКА-ЖИРОЛОВКА L=${g.Ls}`, { align: "center" });
    d.line(xg + 600, Z(g.gritBottom), xg + 600, Z(g.gritTop), "THIN");
    d.line(xg + 600 + g.Ls, Z(g.gritBottom), xg + 600 + g.Ls, Z(g.gritTop), "THIN");
  }
  /* контейнеры под платформой */
  const cH = p.containerMm.h, cL = p.containerMm.l;
  for (const cx of [xs + 900, g.gritType === "tangential" ? xg + g.Lg / 2 : xg + 1350]) {
    d.rect(cx - cL / 2, groundY, cL, cH, "HIDDEN");
    d.text(cx, groundY + cH / 2 - ts * 0.3, ts * 0.75, "КОНТЕЙНЕР", { align: "center" });
  }
  /* выход */
  d.line(xg + g.Lg, Z(g.outlet), x + g.Lp + g.stairL + sheet.p(10), Z(g.outlet), "PIPE");
  d.text(x + g.Lp + g.stairL + sheet.p(2), Z(g.outlet) - th * 1.1, ts * 0.85, `НА УСРЕДНИТЕЛЬ DN${dn}`, { align: "left" });
  drawRailing(sheet, x, xr - 100, yPlat);
  drawRailing(sheet, xg + g.Lg + 100, x + g.Lp, yPlat);

  /* отметки и размеры */
  d.elevMark(x - g.stairL - sheet.p(6), groundY, "0.000", th, 1);
  d.elevMark(x - g.stairL + 200, yPlat, fmtE(g.platform), th, 1);
  d.elevMark(xr + g.Lrc - 300, Z(g.rcWater), fmtE(g.rcWater), th, -1);
  d.elevMark(x + g.Lp + g.stairL + sheet.p(6), Z(g.gritBottom), fmtE(g.gritBottom), th, -1);
  d.elevMark(x + g.Lp + g.stairL + sheet.p(6), Z(g.gritWater), fmtE(g.gritWater), th, 1);
  d.elevMark(x + g.Lp + g.stairL + sheet.p(6), Z(g.gritTop), fmtE(g.gritTop), th, 1);
  d.dimChainH(g.gritType === "tangential" ? [x, xr, xs, xg, xg + g.Lg / 2, xg + g.Lg, x + g.Lp] : [x, xr, xs, xg, xg + 600, xg + 600 + g.Ls, xg + g.Lg, x + g.Lp], groundY - sheet.p(12), th);
  d.dimChainV(x - g.stairL - sheet.p(16), [groundY, yPlat, Z(g.gritBottom), Z(g.gritWater), Z(g.gritTop), Z(g.rcTop)], th);
}

function sectionCross(sheet: Sheet, x: number, y: number, p: MechParams, g: MechGeometry) {
  const d = sheet.d;
  const th = sheet.th;
  const ts = sheet.ts;
  const Z = (e: number) => y + e * 1000;
  const groundY = Z(0);
  const yPlat = Z(g.platform);
  d.groundLine(x - sheet.p(12), x + g.Wp + sheet.p(12), groundY, sheet.p(3), sheet.p(3));
  platformSection(sheet, x, groundY, g.Wp, yPlat);
  drawRailing(sheet, x, x + g.edge - 100, yPlat);
  drawRailing(sheet, x + g.Wp - g.edge + 100, x + g.Wp, yPlat);
  const w = p.wallMm;
  for (let i = 0; i < g.lines; i++) {
    const x0 = x + g.edge + i * (g.Wg + g.aisle);
    d.rect(x0, yPlat, g.Wg, g.Hg, "CONTOUR");
    /* перегородка песколовка/жировая камера */
    d.rect(x0 + w + g.Bs, Z(g.gritBottom), w, (g.gritTop - g.gritBottom) * 1000 - 100, "CONTOUR");
    d.line(x0 + w, Z(g.gritWater), x0 + g.Wg - w, Z(g.gritWater), "WATER");
    if (g.gritType === "tangential") {
      /* ЩЕЛЕВАЯ: цилиндр H = 0,5 м на коническом днище, песковой патрубок по оси */
      const cxg = x0 + w + g.gritD / 2;
      const dOut = 300;
      d.line(x0 + w, Z(g.gritBottom), x0 + w + g.gritD, Z(g.gritBottom), "THIN");
      d.poly([[x0 + w, Z(g.gritBottom)], [cxg - dOut / 2, yPlat], [cxg + dOut / 2, yPlat], [x0 + w + g.gritD, Z(g.gritBottom)]], "CONTOUR", false);
      d.line(x0 + w + g.gritD, Z(g.gritBottom), x0 + g.Wg, Z(g.gritBottom), "CONTOUR");
      /* центральный пескоприёмник */
      d.line(cxg - g.gritD / 6, Z(g.gritWater), cxg - g.gritD / 6, Z(g.gritBottom) + 100, "EQUIP");
      d.line(cxg + g.gritD / 6, Z(g.gritWater), cxg + g.gritD / 6, Z(g.gritBottom) + 100, "EQUIP");
      d.text(cxg, Z(g.gritWater) + ts * 0.5, ts * 0.7, `ЩЕЛЕВАЯ D=${g.gritD}`, { align: "center" });
      d.elevMark(x0 + w + 100, Z(g.gritBottom), fmtE(g.gritBottom), th, -1);
    } else {
      d.line(x0, Z(g.gritBottom), x0 + g.Wg, Z(g.gritBottom), "CONTOUR");
      /* песковой лоток — треугольное дно */
      d.line(x0 + w, Z(g.gritBottom), x0 + w + g.Bs / 2, Z(g.gritBottom) - 250, "THIN");
      d.line(x0 + w + g.Bs, Z(g.gritBottom), x0 + w + g.Bs / 2, Z(g.gritBottom) - 250, "THIN");
      d.text(x0 + w + g.Bs / 2, Z(g.gritWater) + ts * 0.5, ts * 0.75, "ЛОТОК", { align: "center" });
    }
    /* аэрация у перегородки */
    d.circle(x0 + w + g.Bs + w + 100, Z(g.gritBottom) + 150, 60, "EQUIP");
    d.text(x0 + w + g.Bs + w + g.Bgrease / 2, Z(g.gritWater) + ts * 0.5, ts * 0.75, "ЖИР", { align: "center" });
  }
  d.waterLevel(x + g.edge + w + g.Bs / 2, Z(g.gritWater), undefined, th);
  /* контейнер в проходе под платформой */
  const xa = g.lines > 1 ? x + g.edge + g.Wg + g.aisle / 2 : x + g.edge + g.Wg + g.aisle / 2;
  d.rect(xa - p.containerMm.w / 2, groundY, p.containerMm.w, p.containerMm.h, "HIDDEN");
  d.text(xa, groundY + p.containerMm.h / 2 - ts * 0.3, ts * 0.75, "КОНТЕЙНЕР", { align: "center" });
  d.text(xa, yPlat + th * 0.6, ts * 0.75, "ПРОХОД", { align: "center" });
  /* отметки и размеры */
  d.elevMark(x - sheet.p(6), groundY, "0.000", th, 1);
  d.elevMark(x + g.Wp + sheet.p(6), yPlat, fmtE(g.platform), th, 1);
  d.elevMark(x + g.Wp + sheet.p(6), Z(g.gritWater), fmtE(g.gritWater), th, 1);
  d.elevMark(x + g.Wp + sheet.p(6), Z(g.gritTop), fmtE(g.gritTop), th, 1);
  const xs: number[] = [x, x + g.edge];
  for (let i = 0; i < g.lines; i++) {
    const x0 = x + g.edge + i * (g.Wg + g.aisle);
    xs.push(x0, x0 + w + g.Bs + w / 2, x0 + g.Wg);
  }
  if (g.lines > 1) xs.push(x + g.Wp - g.edge); else xs.push(x + g.edge + g.Wg + g.aisle);
  xs.push(x + g.Wp);
  d.dimChainH(Array.from(new Set(xs)).sort((a, b) => a - b), groundY - sheet.p(12), th);
  d.dimH(x, x + g.Wp, groundY - sheet.p(22), `${g.Wp}`, th);
  d.dimChainV(x - sheet.p(16), [groundY, yPlat, Z(g.gritBottom), Z(g.gritWater), Z(g.gritTop)], th);
}

function isoView(sheet: Sheet, ox: number, oy: number, p: MechParams, g: MechGeometry, k: number) {
  const d = sheet.d;
  const L = g.Lp * k, W = g.Wp * k;
  const zp = g.platform * 1000 * k;
  /* колонны */
  const n = Math.max(2, Math.round(g.Lp / 3000) + 1);
  for (let i = 0; i < n; i++) {
    const cx = (300 + ((g.Lp - 600) * i) / (n - 1)) * k;
    for (const cy of [300 * k, W - 300 * k]) d.isoLine([cx, cy, 0], [cx, cy, zp - 200 * k], ox, oy, "THIN");
  }
  /* платформа */
  d.isoBox(0, 0, zp - 200 * k, L, W, 200 * k, ox, oy, "CONTOUR");
  /* ограждение: стойки и поручень по периметру */
  const rail = 1100 * k;
  const corners: [number, number][] = [[0, 0], [L, 0], [L, W], [0, W]];
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i], [bx, by] = corners[(i + 1) % 4];
    d.isoLine([ax, ay, zp + rail], [bx, by, zp + rail], ox, oy, "THIN");
    const segs = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / (1500 * k)));
    for (let s = 0; s <= segs; s++) {
      const x = ax + ((bx - ax) * s) / segs, y = ay + ((by - ay) * s) / segs;
      d.isoLine([x, y, zp], [x, y, zp + rail], ox, oy, "THIN");
    }
  }
  /* лестница на входном торце */
  const steps = 6;
  for (let s = 0; s < steps; s++) {
    const x = -(g.stairL * k * (s + 1)) / steps, z = zp - (zp * (s + 1)) / steps;
    d.isoLine([x, W / 2 - g.stairW * k / 2, z], [x, W / 2 + g.stairW * k / 2, z], ox, oy, "THIN");
  }
  /* приёмная камера, каналы решёток, песколовки */
  const xr = g.edge * k, xs = xr + g.Lrc * k, xg = xs + g.Lscr * k;
  const y0 = (i: number) => (g.edge + i * (g.Wg + g.aisle)) * k;
  d.isoBox(xr, y0(0), zp, g.Lrc * k, g.Wrc * k, (g.rcTop - g.platform) * 1000 * k, ox, oy, "CONTOUR");
  for (let i = 0; i < g.lines; i++) {
    const yc = y0(i) + ((g.Wg - g.Bscr) / 2) * k;
    d.isoBox(xs, yc, zp, g.Lscr * k, g.Bscr * k, (g.rcWater + 0.2 - g.platform) * 1000 * k, ox, oy, "CONTOUR");
    /* шнек решётки — наклонная труба к проходу */
    const yd = g.lines > 1 && i === 1 ? y0(1) - (g.aisle / 2) * k : y0(i) + g.Wg * k + (g.aisle / 2) * k;
    if (p.fineScreen) d.isoLine([xs + 900 * k, yc + (g.Bscr / 2) * k, zp + 300 * k], [xs + 900 * k, yd, zp + 2000 * k], ox, oy, "EQUIP");
    d.isoBox(xg, y0(i), zp, g.Lg * k, g.Wg * k, g.Hg * k, ox, oy, "CONTOUR");
    d.isoLine([xg, y0(i) + (p.wallMm + g.Bs) * k, zp + g.Hg * k], [xg + g.Lg * k, y0(i) + (p.wallMm + g.Bs) * k, zp + g.Hg * k], ox, oy, "THIN");
    /* контейнеры под платформой */
    d.isoBox(xs + 900 * k - (p.containerMm.l / 2) * k, yd - (p.containerMm.w / 2) * k, 0, p.containerMm.l * k, p.containerMm.w * k, p.containerMm.h * k, ox, oy, "HIDDEN");
    d.isoBox((g.gritType === "tangential" ? xg + (g.Lg / 2) * k : xg + 1350 * k) - (p.containerMm.l / 2) * k, yd - (p.containerMm.w / 2) * k, 0, p.containerMm.l * k, p.containerMm.w * k, p.containerMm.h * k, ox, oy, "HIDDEN");
  }
  /* подводящая труба */
  d.isoLine([-g.stairL * k - sheet.p(6), y0(0) + (g.Wrc / 2) * k, g.inlet * 1000 * k], [xr + 300 * k, y0(0) + (g.Wrc / 2) * k, g.inlet * 1000 * k], ox, oy, "PIPE");
  d.isoLine([xg + g.Lg * k, y0(0) + (p.wallMm + g.Bs / 2) * k, g.outlet * 1000 * k], [L + g.stairL * k + sheet.p(6), y0(0) + (p.wallMm + g.Bs / 2) * k, g.outlet * 1000 * k], ox, oy, "PIPE");
}
