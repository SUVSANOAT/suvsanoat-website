/* ==================================================================
 * СТРОИТЕЛЬНАЯ ЧАСТЬ, ТРУБОПРОВОДЫ, ПЛОЩАДЬ И ЭЛЕКТРИКА
 *
 * Считается детерминированно от объёмов сооружений и расходов,
 * полученных технологическим расчётом. Все принимаемые величины —
 * глубина, толщины конструкций, скорости в трубах, КПД, коэффициенты
 * площади — берутся из утверждённого справочника коэффициентов
 * (lib/assumptions.ts) и правятся главным инженером.
 *
 * Границы метода, которые нельзя обойти без компоновки:
 *  — длины трубопроводов оцениваются по габаритам площадки, точные
 *    длины даёт генплан;
 *  — толщины конструкций приняты по практике, окончательные значения
 *    даёт расчёт железобетона на нагрузки и всплытие;
 *  — напор насосов принят; уточняется гидравлическим профилем.
 * Всё это выводится в документ явно, а не прячется в числах.
 * ================================================================== */

import type { Assumptions } from "../../../../lib/assumptions";
import type { Item, Scale } from "./equipment";

const f = (v: number, d = 0) => v.toLocaleString("ru-RU", { maximumFractionDigits: d });

/* ------------------------------------------------------------------
 * 1. ГЕОМЕТРИЯ ЁМКОСТЕЙ
 * ------------------------------------------------------------------ */

export type Basin = {
  name: string;
  /** рабочий объём, м³ */
  volume: number;
  /** размеры в свету, м */
  L: number;
  B: number;
  Hwork: number;
  Hfull: number;
  /** площадь в плане по наружным габаритам, м² */
  areaOuter: number;
  /** объём бетона, м³ */
  concrete: number;
  /** арматура, кг */
  rebar: number;
  /** опалубка, м² */
  formwork: number;
  /** гидроизоляция, м² */
  waterproof: number;
  /** котлован, м³ */
  excavation: number;
  /** обратная засыпка, м³ */
  backfill: number;
};

/** ёмкость прямоугольного сечения: от объёма к размерам и объёмам работ */
export function basinFromVolume(name: string, volume: number, a: Assumptions): Basin {
  /* глубина ограничена размером ёмкости: ширина в свету не менее 1,5 м,
     иначе для малых объёмов получается «колодец» и абсурдный котлован */
  const Bmin = 1.5;
  const hByWidth = volume / (a.basinRatio * Bmin * Bmin);
  const Hwork = Math.max(1.5, Math.min(a.basinDepth, hByWidth));
  const Hfull = Math.round((Hwork + a.basinFreeboard) * 10) / 10;
  const area = volume / Hwork;                       // площадь в свету, м²
  const B = Math.sqrt(area / a.basinRatio);          // ширина
  const L = B * a.basinRatio;                        // длина

  const tw = a.wallThickness / 1000;
  const ts = a.slabThickness / 1000;
  const tc = a.coverThickness / 1000;
  const tl = a.leanConcrete / 1000;

  const Louter = L + 2 * tw;
  const Bouter = B + 2 * tw;

  /* бетон: днище + стены (по средней линии) + перекрытие */
  const slab = Louter * Bouter * ts;
  const walls = 2 * (L + B + 2 * tw) * Hfull * tw;
  const cover = tc > 0 ? Louter * Bouter * tc : 0;
  const concrete = slab + walls + cover;

  /* опалубка: обе стороны стен */
  const formwork = 2 * (2 * (L + B)) * Hfull;
  /* гидроизоляция: внутренняя поверхность стен и днища */
  const waterproof = 2 * (L + B) * Hfull + L * B;

  /* котлован: усечённая пирамида с откосами */
  const depth = Hfull + ts + tl;
  const m = a.excavSlope;
  const bottomL = Louter + 2 * a.excavMargin;
  const bottomB = Bouter + 2 * a.excavMargin;
  const topL = bottomL + 2 * m * depth;
  const topB = bottomB + 2 * m * depth;
  const excavation =
    (depth / 6) * (bottomL * bottomB + (bottomL + topL) * (bottomB + topB) + topL * topB);

  const structureVolume = Louter * Bouter * (Hfull + ts);
  const backfill = Math.max(0, excavation - structureVolume);

  return {
    name,
    volume,
    L: Math.round(L * 10) / 10,
    B: Math.round(B * 10) / 10,
    Hwork,
    Hfull,
    areaOuter: Louter * Bouter,
    concrete,
    rebar: concrete * a.rebarRate,
    formwork,
    waterproof,
    excavation,
    backfill,
  };
}

export type CivilTotals = {
  basins: Basin[];
  concrete: number;
  leanConcrete: number;
  rebar: number;
  formwork: number;
  waterproof: number;
  excavation: number;
  backfill: number;
  areaStructures: number;
  note: string;
};

export function civilWorks(
  volumes: { name: string; volume: number }[],
  a: Assumptions,
  scale: Scale
): CivilTotals {
  const basins = volumes.filter((v) => v.volume > 0).map((v) => basinFromVolume(v.name, v.volume, a));
  const sum = (fn: (b: Basin) => number) => basins.reduce((acc, b) => acc + fn(b), 0);

  const areaStructures = sum((b) => b.areaOuter);
  const lean = basins.reduce((acc, b) => acc + b.areaOuter * (a.leanConcrete / 1000), 0);

  return {
    basins,
    concrete: sum((b) => b.concrete),
    leanConcrete: lean,
    rebar: sum((b) => b.rebar),
    formwork: sum((b) => b.formwork),
    waterproof: sum((b) => b.waterproof),
    excavation: sum((b) => b.excavation),
    backfill: sum((b) => b.backfill),
    areaStructures,
    note:
      scale === "compact"
        ? "При блочном исполнении железобетонными выполняются только приёмная камера, плита под установки и колодцы — объёмы ниже относятся к варианту с монолитными ёмкостями и приведены для сравнения."
        : `Бетон B${a.concreteGrade}, W6–W8, F150. Толщины стен ${a.wallThickness} мм и днища ${a.slabThickness} мм приняты по практике и подлежат проверке расчётом конструкций на нагрузки и на всплытие при высоком уровне грунтовых вод.`,
  };
}

/* ------------------------------------------------------------------
 * 2. ТРУБОПРОВОДЫ
 * ------------------------------------------------------------------ */

/** стандартный ряд наружных диаметров полимерных труб, мм */
const DN_ROW = [110, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1200];

export type Pipe = {
  name: string;
  kind: "gravity" | "pressure" | "air";
  /** расход, м³/ч */
  flow: number;
  dn: number;
  /** фактическая скорость при подобранном диаметре, м/с */
  velocity: number;
  /** ориентировочная длина, м */
  length: number;
  /** внутренний объём, м³ */
  volume: number;
  material: string;
  note?: string;
};

function pickDn(flowM3h: number, velocity: number): { dn: number; v: number } {
  const q = flowM3h / 3600; // м³/с
  const dCalc = Math.sqrt((4 * q) / (Math.PI * velocity)) * 1000; // мм
  const dn = DN_ROW.find((d) => d * 0.92 >= dCalc) ?? DN_ROW[DN_ROW.length - 1];
  const dIn = (dn * 0.92) / 1000; // внутренний диаметр ≈ 0,92 наружного
  const v = q / ((Math.PI * dIn * dIn) / 4);
  return { dn, v };
}

export function pipeSizing(
  ctx: { Qh: number; air: number; sludgeM3d: number; scale: Scale },
  a: Assumptions,
  siteSize: number
): Pipe[] {
  const pipes: Pipe[] = [];
  /* ориентировочная длина: периметр площадки как оценка трассы */
  const base = Math.max(20, Math.sqrt(Math.max(siteSize, 100)) * 2);

  const add = (
    name: string,
    kind: Pipe["kind"],
    flow: number,
    velocity: number,
    lengthFactor: number,
    material: string,
    note?: string
  ) => {
    if (flow <= 0) return;
    const { dn, v } = pickDn(flow, velocity);
    const length = Math.round(base * lengthFactor);
    const dIn = (dn * 0.92) / 1000;
    const warn =
      v < velocity * 0.7
        ? ` Фактическая скорость ${v.toFixed(2)} м/с ниже расчётной ${velocity} м/с — диаметр принят по стандартному ряду и условию незасоряемости; при малых расходах предусмотреть периодическую промывку.`
        : v > velocity * 1.4
        ? ` Фактическая скорость ${v.toFixed(2)} м/с выше расчётной — проверить потери напора.`
        : "";
    pipes.push({
      name,
      kind,
      flow,
      dn,
      velocity: Math.round(v * 100) / 100,
      length,
      volume: ((Math.PI * dIn * dIn) / 4) * length,
      material,
      note: (note ?? "") + warn,
    });
  };

  add("Подводящий коллектор", "gravity", ctx.Qh, a.velGravity, 1.2, "ПЭ/ПВХ SN8 или железобетон", "Уклон не менее минимального по КМК 2.04.03-97; смотровые колодцы через 35–50 м");
  add("Межблочные самотёчные связи", "gravity", ctx.Qh, a.velGravity, 2.5, "ПЭ/ПВХ SN8", "Суммарно по всем переходам между ступенями");
  add("Напорные линии перекачки", "pressure", ctx.Qh, a.velPressure, 1.5, "ПЭ100 SDR17", "От насосных групп; с обратными клапанами и задвижками");
  add("Отводящий трубопровод", "gravity", ctx.Qh, a.velGravity, 1.5, "ПЭ/ПВХ SN8", "До точки сброса; фактическая длина по генплану");
  add("Магистральный воздуховод", "air", ctx.air, a.velAir, 1.2, "Нержавеющая сталь или ПЭ", "От воздуходувной станции до аэрационных систем");
  add("Илопроводы и линии осадка", "pressure", Math.max(1, ctx.sludgeM3d / 8), 1.0, 1.2, "ПЭ100 SDR11", "Работа на густой среде: скорость не ниже 1,0 м/с против осаждения");
  add("Возврат промывных и дренажных вод", "pressure", ctx.Qh * (a.backwashShare / 100) * 6, a.velPressure, 1.0, "ПЭ100 SDR17", "Возврат в голову сооружений");

  return pipes;
}

/* ------------------------------------------------------------------
 * 3. ПЛОЩАДЬ
 * ------------------------------------------------------------------ */

export type AreaEstimate = {
  structures: number;
  buildings: number;
  built: number;
  site: number;
  sludgeYard: number;
  note: string;
};

export function areaEstimate(
  areaStructures: number,
  equipmentArea: number,
  sludgeM3month: number,
  a: Assumptions
): AreaEstimate {
  const structures = areaStructures * a.areaFactor;
  const buildings = equipmentArea * a.buildingFactor;
  const sludgeYard = Math.max(20, sludgeM3month * 1.5);
  const built = structures + buildings + sludgeYard;
  return {
    structures,
    buildings,
    built,
    sludgeYard,
    site: built * a.siteFactor,
    note:
      "Площади предварительные: получены от габаритов сооружений с коэффициентами на проходы, обслуживание и проезды. " +
      "Окончательные значения даёт генплан. Отдельно требуется определить санитарно-защитную зону — она зависит от " +
      "производительности станции и расстояния до жилой застройки и согласовывается с санитарной службой.",
  };
}

/* ------------------------------------------------------------------
 * 4. ЭЛЕКТРИЧЕСКАЯ ЧАСТЬ
 * ------------------------------------------------------------------ */

export type PowerItem = {
  name: string;
  /** количество работающих единиц (резерв в расчёт не входит) */
  qty: number;
  /** единичная мощность, кВт */
  unit: number;
  /** установленная мощность с резервом, кВт */
  installed: number;
  /** часов работы в сутки */
  hours: number;
  /** потребление, кВт·ч/сут */
  daily: number;
  basis: string;
};

export type PowerTotals = {
  items: PowerItem[];
  installed: number;
  working: number;
  demand: number;
  daily: number;
  yearly: number;
  /** кВт·ч на м³ стока */
  specific: number;
  /** кВт·ч на кг удалённого БПК */
  specificBod: number;
  note: string;
};

/** мощность воздуходувки, кВт */
function blowerPower(airM3h: number, a: Assumptions): number {
  const q = airM3h / 3600; // м³/с
  return (q * a.blowerPressure * 1000) / (a.blowerEff * 1000);
}

/** мощность насоса, кВт */
function pumpPower(flowM3h: number, head: number, a: Assumptions): number {
  const q = flowM3h / 3600;
  return (9.81 * q * head) / a.pumpEff;
}

export function powerEstimate(
  ctx: {
    Q: number;
    Qh: number;
    hours: number;
    air: number;
    vAvg: number;
    vBio: number;
    dryKg: number;
    bodLoad: number;
    scale: Scale;
    stages: string[];
    builtArea: number;
    buildingArea: number;
  },
  a: Assumptions
): PowerTotals {
  const items: PowerItem[] = [];
  const has = (s: string) => ctx.stages.includes(s);

  const push = (name: string, qty: number, unit: number, reserve: number, hours: number, basis: string) => {
    if (qty <= 0 || unit <= 0) return;
    items.push({
      name,
      qty,
      unit: Math.round(unit * 100) / 100,
      installed: Math.round((qty + reserve) * unit * 100) / 100,
      hours,
      daily: Math.round(qty * unit * hours * 10) / 10,
      basis,
    });
  };

  if (has("bio")) {
    const p = blowerPower(ctx.air, a);
    push("Воздуходувки биологической очистки", 1, p, 1, 24,
      `N = Q·Δp/η: ${f(ctx.air)} м³/ч при ${a.blowerPressure} кПа, КПД ${a.blowerEff}`);
    push("Мешалки и рециркуляция ила", 2, pumpPower(ctx.Qh * (a.sludgeReturn / 100), 6, a), 1, 24,
      `рециркуляция ${a.sludgeReturn} % от расхода при напоре 6 м`);
  }

  if (has("avg")) {
    const mixer = (ctx.vAvg * a.mixPower) / 1000;
    push("Перемешивание усреднителя", 1, mixer, 1, 24, `${a.mixPower} Вт/м³ × ${f(ctx.vAvg)} м³`);
    push("Насосы подачи на очистку", 1, pumpPower(ctx.Qh, a.pumpHead, a), 1, ctx.hours,
      `${f(ctx.Qh, 1)} м³/ч при напоре ${a.pumpHead} м, КПД ${a.pumpEff}`);
  }

  if (has("screen")) {
    push("Решётка и транспортёр отбросов", 1, ctx.scale === "concrete" ? 2.2 : 1.1, ctx.scale === "concrete" ? 1 : 0, ctx.hours,
      "типовая мощность привода решётки и шнекового пресса");
  }

  if (has("daf")) {
    push("Флотация: рециркуляционный насос и компрессор", 1,
      pumpPower(ctx.Qh * (a.dafRecycle / 100), 50, a) + 2.2, 1, ctx.hours,
      `рециркуляция ${a.dafRecycle} % при давлении насыщения 5 бар плюс компрессор`);
  }

  if (has("physchem") || has("neutral")) {
    push("Реагентное хозяйство: мешалки и насосы-дозаторы", 1, 2.5, 1, ctx.hours,
      "камеры смешения и хлопьеобразования, дозирующие насосы");
  }

  if (has("post")) {
    push("Насосы промывки фильтров", 1, pumpPower(ctx.Qh * 3, 20, a), 1, 1,
      "промывка с интенсивностью втрое выше рабочего расхода, около часа в сутки");
    push("Ультрафиолетовое обеззараживание", 1, Math.max(0.5, ctx.Qh * 0.05), 0, 24,
      `${f(ctx.Qh, 1)} м³/ч при удельной мощности около 50 Вт на м³/ч`);
  }

  if (has("sludge")) {
    const dew = ctx.dryKg < 100 ? 2.2 : ctx.dryKg < 500 ? 18 : 30;
    push("Обезвоживание осадка", 1, dew, 0, Math.min(ctx.hours, 8),
      `${f(ctx.dryKg, 1)} кг СВ/сут: ${ctx.dryKg < 100 ? "шнековый дегидратор" : ctx.dryKg < 500 ? "декантерная центрифуга" : "фильтр-пресс"}`);
    push("Насосы осадка и станция флокулянта", 1, 3, 1, Math.min(ctx.hours, 8), "винтовой насос и узел приготовления полимера");
    if (has("sludge")) push("Аэрация стабилизатора осадка", 1, blowerPower(ctx.air * 0.2, a), 0, 24, "20 % от расхода воздуха биологической очистки");
  }

  push("Освещение и бытовые нужды", 1, (ctx.builtArea * a.lightingLoad) / 1000, 0, 10,
    `${a.lightingLoad} Вт/м² × ${f(ctx.builtArea)} м² застройки`);
  push("Отопление и вентиляция помещений", 1, (ctx.buildingArea * a.heatingLoad) / 1000, 0, 6,
    `${a.heatingLoad} Вт/м² × ${f(ctx.buildingArea)} м² помещений, в холодный период`);

  const installed = items.reduce((s, i) => s + i.installed, 0);
  const working = items.reduce((s, i) => s + i.qty * i.unit, 0);
  const daily = items.reduce((s, i) => s + i.daily, 0);

  return {
    items,
    installed,
    working,
    demand: working * a.demandFactor,
    daily,
    yearly: daily * 365,
    specific: ctx.Q > 0 ? daily / ctx.Q : 0,
    specificBod: ctx.bodLoad > 0 ? daily / ctx.bodLoad : 0,
    note:
      `Установленная мощность включает резервные агрегаты, расчётная — только работающие с коэффициентом спроса ${a.demandFactor}. ` +
      `Категория электроснабжения очистных сооружений — не ниже II по ПУЭ; для станций, остановка которых недопустима, требуется I категория с двумя независимыми вводами и АВР. ` +
      `Напор насосов принят ${a.pumpHead} м и уточняется гидравлическим расчётом. ` +
      `Для концентрированных производственных стоков удельный расход на кубометр высок — показательнее сравнивать ` +
      `расход на килограмм удалённого БПК: типовой диапазон 0,8–1,5 кВт·ч/кг для аэрации и 1,5–2,5 по станции в целом. ` +
      `При нагрузке менее 50 кг БПК/сут этот показатель теряет смысл: преобладают постоянные потребители — освещение, автоматика, вентиляция.`,
  };
}

/* ------------------------------------------------------------------
 * 5. СВОДКА В ВИДЕ ПОЗИЦИЙ ВЕДОМОСТИ
 * ------------------------------------------------------------------ */

export function civilItems(c: CivilTotals, a: Assumptions): Item[] {
  if (!c.basins.length) return [];
  return [
    {
      kind: "structure",
      name: "Бетон монолитных конструкций",
      spec: `B${a.concreteGrade}, W6–W8, F150 — ${f(c.concrete, 1)} м³ (днища, стены, перекрытия)`,
      qty: `${f(c.concrete, 1)} м³`,
      supply: "supply",
      note: "Объём получен по габаритам ёмкостей и принятым толщинам конструкций",
    },
    {
      kind: "structure",
      name: "Бетонная подготовка",
      spec: `B7,5, толщина ${a.leanConcrete} мм — ${f(c.leanConcrete, 1)} м³`,
      qty: `${f(c.leanConcrete, 1)} м³`,
      supply: "supply",
    },
    {
      kind: "structure",
      name: "Арматура",
      spec: `${a.rebarRate} кг на м³ бетона — ${f(c.rebar / 1000, 2)} т`,
      qty: `${f(c.rebar / 1000, 2)} т`,
      supply: "supply",
      note: "Ориентировочный расход; окончательный даёт расчёт конструкций",
    },
    {
      kind: "structure",
      name: "Опалубка",
      spec: `двусторонняя, ${f(c.formwork, 1)} м²`,
      qty: `${f(c.formwork, 1)} м²`,
      supply: "supply",
    },
    {
      kind: "structure",
      name: "Гидроизоляция",
      spec: `внутренняя поверхность ёмкостей, ${f(c.waterproof, 1)} м²`,
      qty: `${f(c.waterproof, 1)} м²`,
      supply: "supply",
      note: "Плюс наружная обмазочная изоляция при высоком уровне грунтовых вод",
    },
    {
      kind: "structure",
      name: "Разработка грунта",
      spec: `котлованы с откосом ${a.excavSlope} : 1 — ${f(c.excavation, 1)} м³`,
      qty: `${f(c.excavation, 1)} м³`,
      supply: "supply",
    },
    {
      kind: "structure",
      name: "Обратная засыпка с уплотнением",
      spec: `${f(c.backfill, 1)} м³; вывоз излишнего грунта ${f(Math.max(0, c.excavation - c.backfill), 1)} м³`,
      qty: `${f(c.backfill, 1)} м³`,
      supply: "supply",
    },
  ];
}
