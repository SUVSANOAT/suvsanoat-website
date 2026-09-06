/* ==================================================================
 * ГРАВИТАЦИОННЫЙ ИЛОУПЛОТНИТЕЛЬ — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Круглый в плане резервуар: вертикальный (центральная подающая труба,
 * коническое днище с углом ≥ 50° к горизонту — п. 6.66) при расходе
 * ила менее 50 м³/сут, радиальный (илоскрёб, приямок в центре) — при
 * большем. Не менее двух, оба рабочие (п. 6.350). Выпуск уплотнённого
 * ила под гидростатическим напором не менее 1 м (п. 6.350), иловая
 * вода — в голову биологической очистки.
 *
 * Расчёт по табл. 64 (п. 6.351) и ф. (125)–(128) п. 6.352
 * ҚМҚ 2.04.03-19: избыточный активный ил 99,5 % → 98,2 %
 * (вертикальный, 6–8 ч) / 97,3 % (радиальный, 10–12 ч), коэффициент
 * неравномерности подачи ила 1,3.
 *
 * Что задаёт расчёт: dryKg — избыточный ил, кг СВ/сут; влажность ила
 * из мембранного блока / аэротенка 99,4 % (п. 6.175) → объём жидкого
 * ила Q_mud = dryKg/(1000·(100−99,4)/100).
 *
 * Конструктив — всегда монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026): толщина стен и днища, борт и рабочая
 * глубина берутся только оттуда, по расходу не ветвятся.
 *
 * Величины, не нормируемые ҚМҚ 2.04.03-19 (диаметр центральной трубы,
 * минимальный диаметр корпуса), помечены в basis как принятые.
 * ================================================================== */

import { isoPoint, type Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { AEROTANK, PRIMARY_SETTLING, SLUDGE, kmkRef } from "../../norms/kmk-2-04-03-19";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type ThickenerParams = {
  /** влажность поступающего ила, % (из MBR/аэротенка — 99,4 по п. 6.175) */
  moistureIn: number;
  /** тип: авто — вертикальный при Q_mud < 50 м³/сут, иначе радиальный */
  kind: "auto" | "vertical" | "radial";
  /** число уплотнителей, ≥ 2 (п. 6.350) */
  units: number;
  /** продолжительность уплотнения, ч (табл. 64: 6–8 вертикальный, 10–12 радиальный); 0 — по таблице */
  hours: number;
  /** глубина зоны отстаивания (цилиндрической части), м — из construction() */
  settlingDepthM: number;
  /** толщина стен, мм — из construction() */
  wallMm: number;
  /** толщина днища, мм — из construction() */
  slabMm: number;
  /** угол конуса днища к горизонту, ° (≥ 50, п. 6.66) */
  coneAngleDeg: number;
  /** борт над водой, м (≥ 0,3 — п. 6.69) */
  freeboardM: number;
  /** превышение верха над планировкой, м */
  topAboveGroundM: number;
  /** гидростатический напор выпуска ила, м (≥ 1 — п. 6.350) */
  sludgeHeadM: number;
  /** минимальный диаметр корпуса, мм — принято по практике (доступ для обслуживания) */
  minDiameterMm: number;
};

export function thickenerDefaults(input: DrawingInput): ThickenerParams {
  const c = construction();
  void input;
  return {
    moistureIn: AEROTANK.extendedAeration.sludgeMoistureFromAerotank,
    kind: "auto",
    units: SLUDGE.thickener.minUnits,
    hours: 0,
    settlingDepthM: c.waterDepthM,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    coneAngleDeg: 50,
    freeboardM: Math.max(PRIMARY_SETTLING.freeboardM.value, 0),
    topAboveGroundM: c.topAboveGroundM,
    sludgeHeadM: 1.0,
    minDiameterMm: 2000,
  };
}

export type ThickenerGeometry = {
  kind: "vertical" | "radial";
  units: number;
  /** м³/сут */
  qMud: number;
  qDesign: number;
  qUp: number;
  qSi: number;
  hours: number;
  moistureOut: number;
  /** требуемый и фактический объём одного уплотнителя, м³ */
  vNeed: number;
  vUnit: number;
  vCyl: number;
  vCone: number;
  /** мм */
  D: number; // внутренний диаметр
  Dout: number;
  wall: number;
  Hw: number; // глубина зоны отстаивания (цилиндр)
  Hcone: number; // высота конуса (вертикальный) / приямка (радиальный)
  Hslope: number; // перепад уклона днища радиального, 0 для вертикального
  Htot: number; // от низа конуса до верха борта
  d0: number; // диаметр низа конуса
  dHopper: number; // верх приямка радиального
  dCenter: number; // центральная труба
  gap: number; // просвет между корпусами
  /** принятая глубина зоны отстаивания, м (после ограничения по табл. 31) */
  settlingDepthM: number;
  /** габарит по наружным граням, мм */
  W: number;
  L: number;
  /** отметки, м */
  bottom: number;
  coneTop: number;
  water: number;
  top: number;
  sludgeOut: number;
};

export function thickenerGeometry(input: DrawingInput, p: ThickenerParams): ThickenerGeometry {
  const t = SLUDGE.thickener;
  const qMud = input.dryKg / (1000 * ((100 - p.moistureIn) / 100));
  const qDesign = qMud * t.designFactor; // п. 6.352
  const kind: "vertical" | "radial" = p.kind === "auto" ? (qMud < 50 ? "vertical" : "radial") : p.kind;
  const hours = p.hours > 0 ? p.hours : kind === "vertical" ? t.hoursVertical[1] : t.hoursRadial[1];
  const moistureOut = kind === "vertical" ? t.moistureOutVertical : t.moistureOutRadial;
  const units = Math.max(t.minUnits, Math.round(p.units));
  /* ф. (125): W = Q_mud·T/24·1,3 — объём уплотнителей на расчётный расход */
  const W = (qDesign * hours) / 24;
  const vNeed = W / units;
  /* ф. (127) (с исправлением опечатки 100·P → 100−P): уплотнённый ил, м³/сут */
  const qUp = ((input.dryKg / 1000) * 100 * t.designFactor) / (100 - moistureOut);
  const qSi = qDesign - qUp; // ф. (128)

  const tanA = Math.tan((p.coneAngleDeg * Math.PI) / 180);
  /* Глубина зоны отстаивания — из construction(), но не выше диапазона табл. 31
     для соответствующего типа отстойника (вертикальный 2,7–3,8 м, радиальный 1,5–5 м). */
  const hMax = kind === "vertical" ? PRIMARY_SETTLING.table31.vertical.hSetM[1] : PRIMARY_SETTLING.table31.radial.hSetM[1];
  const settlingDepthM = Math.min(p.settlingDepthM, hMax);
  const Hw = settlingDepthM * 1000;
  const d0 = 400; // низ конуса — под иловую трубу DN200 (п. 6.68) с запасом
  let D = p.minDiameterMm;
  let vCyl = 0, vCone = 0, Hcone = 0, Hslope = 0, dHopper = 0;
  const step = kind === "vertical" ? 100 : 500;
  for (;;) {
    const r = D / 2 / 1000;
    vCyl = Math.PI * r * r * (Hw / 1000);
    if (kind === "vertical") {
      Hcone = roundTo(((D - d0) / 2) * tanA, 10);
      const h = Hcone / 1000, R = r, r0 = d0 / 2 / 1000;
      vCone = (Math.PI * h / 3) * (R * R + R * r0 + r0 * r0);
    } else {
      /* радиальный: уклон днища 0,05 к центральному приямку (илоскрёб), приямок — конус ≥ 50° */
      dHopper = Math.max(1500, roundTo(D / 5, 100));
      Hslope = roundTo(((D - dHopper) / 2) * 0.05, 10);
      Hcone = roundTo(((dHopper - d0) / 2) * tanA, 10);
      const rh = dHopper / 2 / 1000, r0 = d0 / 2 / 1000;
      const vSlope = (Math.PI * (Hslope / 1000) / 3) * (r * r + r * rh + rh * rh); // усечённый конус уклона днища
      vCone = vSlope + (Math.PI * (Hcone / 1000) / 3) * (rh * rh + rh * r0 + r0 * r0);
    }
    if (vCyl + vCone >= vNeed || D > 30000) break;
    D += step;
  }
  const wall = p.wallMm;
  const Dout = D + 2 * wall;
  const gap = 0; // резервуары монолитные, со смежной стенкой
  const Htot = Hcone + Hslope + Hw + p.freeboardM * 1000;
  const top = p.topAboveGroundM;
  const water = top - p.freeboardM;
  const coneTop = water - settlingDepthM;
  const bottom = coneTop - (Hcone + Hslope) / 1000;
  return {
    kind, units, qMud, qDesign, qUp, qSi, hours, moistureOut, settlingDepthM,
    vNeed, vUnit: vCyl + vCone, vCyl, vCone,
    D, Dout, wall, Hw, Hcone, Hslope, Htot, d0, dHopper,
    dCenter: Math.min(800, Math.max(300, roundTo(D / 6, 50))),
    gap,
    W: units * Dout + (units - 1) * gap - wall * (units - 1),
    L: Dout,
    bottom, coneTop, water, top,
    sludgeOut: water - p.sludgeHeadM,
  };
}

/** масштаб листа для этой модели */
export function thickenerScale(input: DrawingInput, overrides: Partial<ThickenerParams> = {}): number {
  const g = thickenerGeometry(input, { ...thickenerDefaults(input), ...overrides });
  return fitScale(g.W, g.L, g.Htot + 400);
}

/** масштаб: план ≤ 300 мм бумаги по ширине, план + разрез ≤ 420 мм по высоте (остальное — зазоры и размеры) */
function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 420) ?? pickScale(planW, sectH);
}

export function thickenerModel(input: DrawingInput, overrides: Partial<ThickenerParams> = {}): StructureModel {
  const p = { ...thickenerDefaults(input), ...overrides };
  const g = thickenerGeometry(input, p);
  const c = construction();
  const cv = concreteVolume(c, { shape: "circle", d: g.Dout }, g.Htot);
  const t = SLUDGE.thickener;
  const qInH = g.qDesign / 24; // подача насосами равномерно
  const dnIn = Math.max(100, dnFor(qInH));
  const dnSludge = PRIMARY_SETTLING.sludgePipeMinMm.value;
  const dnSi = Math.max(100, dnFor(g.qSi / 24));

  const model: StructureModel = {
    id: "thickener",
    kind: "thickener",
    name: g.kind === "vertical" ? "Илоуплотнитель гравитационный вертикальный" : "Илоуплотнитель гравитационный радиальный",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.W, l: g.L },
    bottom: g.bottom,
    water: g.water,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "sludge", dn: dnIn, side: "W", pos: g.L / 2, elev: g.top + 0.2 },
      { role: "sludge", dn: dnSludge, side: "E", pos: g.L / 2, elev: g.sludgeOut },
      { role: "out", dn: dnSi, side: "S", pos: g.W / 2, elev: g.water - 0.15 },
      { role: "drain", dn: 100, side: "E", pos: g.L / 2, elev: g.bottom },
    ],
    volumes: [
      { name: "Зона отстаивания (цилиндр), 1 шт.", m3: g.vCyl },
      { name: g.kind === "vertical" ? "Зона уплотнения (конус), 1 шт." : "Зона уплотнения (уклон днища + приямок), 1 шт.", m3: g.vCone },
      { name: `Итого ${g.units} шт.`, m3: g.vUnit * g.units },
      { name: "Требуемый объём по ф. (125)", m3: g.vNeed * g.units },
      { name: `Бетон стен, ${g.units} шт.`, m3: cv.walls * g.units },
      { name: `Бетон днища и конуса, ${g.units} шт.`, m3: cv.slab * g.units },
      { name: `Бетонная подготовка, ${g.units} шт.`, m3: cv.lean * g.units },
      { name: "Итого бетон, м³", m3: cv.total * g.units },
      { name: "Арматура, кг", m3: cv.total * g.units * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Резервуар железобетонный монолитный с коническим днищем", qty: `${g.units} шт.`, spec: `D ${g.D} мм, H ${g.Htot} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      ...(g.kind === "vertical"
        ? [{ name: "Центральная подающая труба с отражательным щитом", qty: `${g.units} шт.`, spec: `DN${g.dCenter}`, supply: "own" as const }]
        : [{ name: "Илоскрёб с периферийным приводом", qty: `${g.units} шт.`, spec: `D ${g.D} мм`, supply: "supply" as const }]),
      { name: "Периферийный сборный лоток иловой воды с водосливом", qty: `${g.units} шт.`, spec: "металлоконструкции", supply: "own" },
      { name: "Площадки обслуживания, ограждения и трубопроводная обвязка", qty: "комплект", spec: "металлоконструкции", supply: "own" },
      { name: "Задвижка выпуска уплотнённого ила", qty: `${g.units} шт.`, spec: `DN${dnSludge}, камера выпуска на отм. ${fmtE(g.sludgeOut)}`, supply: "supply" },
      { name: "Насосы подачи избыточного ила (в составе биоблока)", qty: "по MBR", spec: `${qInH.toFixed(1)} м³/ч`, supply: "supply" },
    ],
    basis: [
      constructionNote(c),
      `Избыточный ил ${input.dryKg.toFixed(0)} кг СВ/сут при влажности ${p.moistureIn} % (${AEROTANK.extendedAeration.ref}) — Q_mud = ${g.qMud.toFixed(1)} м³/сут; расчётный расход с коэффициентом ${t.designFactor} (${kmkRef("6.352")}) — ${g.qDesign.toFixed(1)} м³/сут.`,
      `Тип — ${g.kind === "vertical" ? "вертикальный" : "радиальный"} (граница 50 м³/сут — принято по практике); влажность уплотнённого ила ${g.moistureOut} %, продолжительность ${g.hours} ч (${t.ref}, строка «избыточный активный ил 99,5 %»).`,
      `Объём по ф. (125) ${kmkRef("6.352")}: W = ${g.qDesign.toFixed(1)}·${g.hours}/24 = ${(g.vNeed * g.units).toFixed(1)} м³ на ${g.units} шт. (оба рабочие — ${kmkRef("6.350")}); принято ${g.units}×${g.vUnit.toFixed(1)} м³.`,
      `Уплотнённый ил по ф. (127) (в норме опечатка «100·P», применено 100−P): ${g.qUp.toFixed(1)} м³/сут; иловая вода по ф. (128): ${g.qSi.toFixed(1)} м³/сут — в голову биологической очистки (${kmkRef("6.350")}).`,
      `Угол конуса днища ${p.coneAngleDeg}° (${PRIMARY_SETTLING.hopperWallAngleDeg.ref}: не менее 50°); выпуск ила под гидростатическим напором ${p.sludgeHeadM} м (${kmkRef("6.350")}); иловая труба DN${dnSludge} (${PRIMARY_SETTLING.sludgePipeMinMm.ref}).`,
      `Глубина зоны отстаивания ${g.settlingDepthM} м — рабочая глубина ёмкостей ${construction().waterDepthM} м (construction()), ограниченная сверху диапазоном ${PRIMARY_SETTLING.table31.ref} для ${g.kind === "vertical" ? "вертикальных отстойников (2,7–3,8 м)" : "радиальных отстойников (1,5–5 м)"}; борт ${p.freeboardM} м (${PRIMARY_SETTLING.freeboardM.ref}), минимальный внутренний диаметр ${p.minDiameterMm} мм (опалубка и доступ для обслуживания монолитного резервуара), центральная труба DN${g.dCenter} — принято по практике.`,
    ],
    headLoss: 0.3,
    draw: (sheet) => drawThickener(sheet, input, p, g),
  };
  return model;
}

/** диаметр патрубка по расходу при 1,0 м/с, мм, ряд DN */
function dnFor(qM3H: number): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / 1.0 / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ: план (оба уплотнителя), разрез 1-1 (по подаче и выпуску ила),
 * разрез 2-2 (по отводу иловой воды), изометрия
 * ================================================================== */

function drawThickener(sheet: Sheet, input: DrawingInput, p: ThickenerParams, g: ThickenerGeometry) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const R = g.D / 2, Ro = g.Dout / 2;
  const pitch = g.Dout + g.gap - g.wall;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.L;
  sheet.viewTitle(px, py + g.L + sheet.p(16), "ПЛАН");
  for (let i = 0; i < g.units; i++) {
    const cx = px + Ro + i * pitch, cy = py + Ro;
    d.circle(cx, cy, Ro, "CONTOUR");
    d.circle(cx, cy, R, "CONTOUR");
    /* штриховка кольца стены — короткие штрихи по окружности */
    for (let a = 0; a < 360; a += 6) {
      const r1 = R, r2 = Ro;
      const a1 = (a * Math.PI) / 180, a2 = ((a + 4) * Math.PI) / 180;
      d.line(cx + r1 * Math.cos(a1), cy + r1 * Math.sin(a1), cx + r2 * Math.cos(a2), cy + r2 * Math.sin(a2), "HATCH");
    }
    /* периферийный лоток иловой воды */
    d.circle(cx, cy, R - 300, "THIN");
    if (g.kind === "vertical") {
      d.circle(cx, cy, g.dCenter / 2, "PIPE");
      d.circle(cx, cy, g.dCenter / 2 + 300, "EQUIP"); // отражательный щит
      d.circle(cx, cy, g.d0 / 2, "HIDDEN");
    } else {
      d.circle(cx, cy, g.dHopper / 2, "HIDDEN");
      d.circle(cx, cy, g.dCenter / 2, "PIPE");
      /* ферма илоскрёба */
      d.line(cx - R, cy, cx + R, cy, "EQUIP");
      d.line(cx - R, cy + 150, cx + R, cy + 150, "EQUIP");
      d.rect(cx + R - 400, cy - 250, 800, 650, "EQUIP");
    }
    /* оси */
    d.line(cx - Ro - sheet.p(4), cy, cx + Ro + sheet.p(4), cy, "AXIS");
    d.line(cx, cy - Ro - sheet.p(4), cx, cy + Ro + sheet.p(4), "AXIS");
    d.text(cx, cy + R * 0.55, ts, `УПЛОТНИТЕЛЬ ${i + 1}`, { align: "center" });
    d.text(cx, cy + R * 0.55 - ts * 1.4, ts * 0.9, `D=${g.D}`, { align: "center" });
    /* подача ила: труба сверху в центральную трубу */
    d.line(px - sheet.p(14), cy, cx, cy, "PIPE");
    /* выпуск иловой воды из лотка — вниз */
    d.line(cx, cy - R + 150, cx, py - sheet.p(6), "PIPE");
    /* выпуск ила снизу конуса — к камере (невидимый) */
    d.line(cx, cy, cx + Ro + sheet.p(6), cy, "HIDDEN");
  }
  /* подписи потоков */
  d.arrow(px - sheet.p(22), py + Ro, px - sheet.p(14), py + Ro, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), py + Ro + th * 0.8, ts, `ИЗБЫТОЧНЫЙ ИЛ ОТ MBR DN${Math.max(100, dnFor(g.qDesign / 24))}`, { align: "right" });
  const cxLast = px + Ro + (g.units - 1) * pitch;
  /* камера выпуска ила у последнего уплотнителя */
  const chW = sheet.p(10), chX = cxLast + Ro + sheet.p(6);
  d.rect(chX, py + Ro - chW / 2, chW, chW, "CONTOUR");
  d.text(chX + chW / 2, py + Ro + chW / 2 + ts * 0.6, ts * 0.9, "КАМЕРА ВЫПУСКА", { align: "center" });
  d.arrow(chX + chW, py + Ro, chX + chW + sheet.p(10), py + Ro, "FLOW", sheet.p(2));
  d.text(chX + chW + sheet.p(2), py + Ro - th * 1.4, ts, `УПЛОТНЁННЫЙ ИЛ НА СТАБИЛИЗАЦИЮ DN${PRIMARY_SETTLING.sludgePipeMinMm.value}`, { align: "left" });
  /* коллектор иловой воды под планом */
  const ySi = py - sheet.p(6);
  d.line(px + Ro, ySi, cxLast, ySi, "PIPE");
  d.arrow(cxLast, ySi, cxLast + Ro + sheet.p(6), ySi, "FLOW", sheet.p(2));
  d.text(cxLast + Ro + sheet.p(7), ySi - th * 0.4, ts, `ИЛОВАЯ ВОДА В ГОЛОВУ БИООЧИСТКИ DN${Math.max(100, dnFor(g.qSi / 24))}`, { align: "left" });

  /* размеры плана */
  const yd = py - sheet.p(16);
  const xs: number[] = [px];
  for (let i = 0; i < g.units; i++) {
    xs.push(px + i * pitch + g.wall, px + i * pitch + g.wall + g.D);
    if (i === g.units - 1) xs.push(px + i * pitch + g.Dout);
  }
  const xsU = Array.from(new Set(xs)).sort((a, b) => a - b);
  d.dimChainH(xsU, yd, th);
  d.dimH(px, px + g.W, yd - sheet.p(9), `${g.W}`, th);
  const xd = px + g.W + sheet.p(32);
  d.dimChainV(xd, [py, py + g.wall, py + g.wall + g.D, py + g.L], th);
  d.dimV(xd + sheet.p(9), py, py + g.L, `${g.L}`, th);

  /* марки разрезов: 1-1 по горизонтальной оси первого уплотнителя, 2-2 по вертикальной */
  d.sectionMark(px - sheet.p(8), py + Ro, px + g.Dout + sheet.p(6), py + Ro, "1", th, -1);
  d.sectionMark(px + Ro, py - sheet.p(9), px + Ro, py + g.L + sheet.p(6), "2", th, 1);

  /* ---------------- РАЗРЕЗ 1-1 ---------------- */
  const slab = p.slabMm;
  const sy = py - sheet.p(45) - 1200 - g.Htot - slab;
  const sx = px;
  sheet.viewTitle(sx, sy + g.Htot + slab + 1200 + sheet.p(8), "РАЗРЕЗ 1-1");
  sectionA(sheet, sx, sy, g, p, slab);

  /* ---------------- РАЗРЕЗ 2-2 ---------------- */
  const cx2 = sx + g.Dout + sheet.p(95);
  sheet.viewTitle(cx2, sy + g.Htot + slab + 1200 + sheet.p(8), "РАЗРЕЗ 2-2");
  sectionB(sheet, cx2, sy, g, slab);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const ix = Math.max(px + g.W + sheet.p(75), cx2 + g.Dout + sheet.p(60)) + g.Dout * 0.5;
  const isoH = (g.Htot + slab) * 0.5 + (g.W + g.L) * 0.5 * 0.5;
  const iy = py + g.L - isoH;
  sheet.viewTitle(ix - g.Dout * 0.4, py + g.L + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, pitch);

  /* примечания */
  sheet.note(`Илоуплотнитель ${g.kind === "vertical" ? "вертикальный" : "радиальный"}: ${g.units} шт. D=${g.D} мм, зона отстаивания ${g.settlingDepthM} м, ${g.kind === "vertical" ? `конус ${p.coneAngleDeg}°` : "уклон днища 0,05 к приямку"}; объём ${g.units}×${g.vUnit.toFixed(1)} м³ при требуемых ${(g.vNeed * g.units).toFixed(1)} м³ (ф. (125) п. 6.352, ${g.hours} ч по табл. 64).`);
  sheet.note(`Расход ила ${g.qMud.toFixed(1)} м³/сут (${input.dryKg.toFixed(0)} кг СВ/сут при ${p.moistureIn} %), расчётный ×1,3 = ${g.qDesign.toFixed(1)} м³/сут; уплотнённый ил ${g.moistureOut} % — ${g.qUp.toFixed(1)} м³/сут, иловая вода ${g.qSi.toFixed(1)} м³/сут.`);
  sheet.note(`Отметки: низ конуса ${fmtE(g.bottom)}, верх конуса ${fmtE(g.coneTop)}, вода ${fmtE(g.water)}, борт ${fmtE(g.top)}; выпуск ила из камеры на отм. ${fmtE(g.sludgeOut)} — напор ${p.sludgeHeadM} м (п. 6.350).`);
  sheet.note(`Резервуар железобетонный монолитный: стены ${g.wall} мм, днище ${p.slabMm} мм, бетон ${construction().concreteGrade}; илоскрёб и задвижки — покупное оборудование; лотки, площадки и обвязка — изготовление SUVSANOAT.`);
  sheet.legend([
    { layer: "CONTOUR", text: "стены и днище" },
    { layer: "HATCH", text: "железобетон" },
    { layer: "WATER", text: "расчётный уровень воды" },
    { layer: "PIPE", text: "трубопроводы ила и иловой воды" },
    { layer: "EQUIP", text: "оборудование" },
  ]);
}

/* профиль корпуса в разрезе: возвращает полилинию наружного контура (по часовой) */
function bodyProfile(x: number, y: number, g: ThickenerGeometry, slab: number): { outer: Pt[]; inner: Pt[]; yb: number; yct: number; yw: number; yt: number } {
  const Ro = g.Dout / 2, R = g.D / 2;
  const cx = x + Ro;
  const yb = y + slab; // низ конуса (внутренняя поверхность)
  const yct = yb + g.Hcone + g.Hslope; // верх конуса/уклона = низ цилиндра
  const yw = yct + g.Hw;
  const yt = yw + (g.Htot - g.Hcone - g.Hslope - g.Hw);
  const r0 = g.d0 / 2;
  const w = g.wall;
  let inner: Pt[], outer: Pt[];
  if (g.kind === "vertical") {
    inner = [[cx - R, yt], [cx - R, yct], [cx - r0, yb], [cx + r0, yb], [cx + R, yct], [cx + R, yt]];
    outer = [[cx - R - w, yt], [cx - R - w, yct], [cx - r0 - w, yb - w], [cx + r0 + w, yb - w], [cx + R + w, yct], [cx + R + w, yt]];
  } else {
    const rh = g.dHopper / 2;
    inner = [[cx - R, yt], [cx - R, yct], [cx - rh, yct - g.Hslope], [cx - r0, yb], [cx + r0, yb], [cx + rh, yct - g.Hslope], [cx + R, yct], [cx + R, yt]];
    outer = [[cx - R - w, yt], [cx - R - w, yct], [cx - rh - w, yct - g.Hslope - w], [cx - r0 - w, yb - w], [cx + r0 + w, yb - w], [cx + rh + w, yct - g.Hslope - w], [cx + R + w, yct], [cx + R + w, yt]];
  }
  return { outer, inner, yb, yct, yw, yt };
}

function drawBody(sheet: Sheet, x: number, y: number, g: ThickenerGeometry, slab: number) {
  const d = sheet.d;
  const pr = bodyProfile(x, y, g, slab);
  const poly: Pt[] = [...pr.outer, ...[...pr.inner].reverse()];
  d.poly(poly, "CONTOUR", true);
  d.concrete(poly, sheet.p(1.5));
  /* фундаментная плита / песчаная подготовка */
  const Ro = g.Dout / 2, cx = x + Ro;
  const r0 = g.d0 / 2 + g.wall;
  d.rect(cx - r0 - sheet.p(6), y, 2 * r0 + sheet.p(12), slab, "CONTOUR");
  d.concrete([[cx - r0 - sheet.p(6), y], [cx + r0 + sheet.p(6), y], [cx + r0 + sheet.p(6), y + slab], [cx - r0 - sheet.p(6), y + slab]], sheet.p(1.5));
  /* вода */
  d.line(cx - g.D / 2, pr.yw, cx + g.D / 2, pr.yw, "WATER");
  d.waterLevel(cx - g.D / 4, pr.yw, undefined, sheet.th);
  /* периферийный лоток: две стенки высотой 300 у борта */
  for (const s of [-1, 1]) {
    const xi = cx + s * (g.D / 2 - 300);
    d.line(xi, pr.yt - 100, xi, pr.yw - 200, "THIN");
    d.line(xi, pr.yw - 200, cx + s * g.D / 2, pr.yw - 200, "THIN");
  }
  /* грунт: линия земли на отметке 0.000 */
  const groundY = pr.yb - g.bottom * 1000;
  d.groundLine(x - sheet.p(15), cx - g.Dout / 2, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(cx + g.Dout / 2, x + g.Dout + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  return { ...pr, cx, groundY };
}

function sectionA(sheet: Sheet, x: number, y: number, g: ThickenerGeometry, p: ThickenerParams, slab: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const b = drawBody(sheet, x, y, g, slab);
  const cx = b.cx, R = g.D / 2;
  if (g.kind === "vertical") {
    /* центральная труба: от верха до середины зоны отстаивания, отражательный щит */
    const rc = g.dCenter / 2;
    const yBotC = b.yct + g.Hw * 0.45;
    d.line(cx - rc, b.yt + 200, cx - rc, yBotC, "PIPE");
    d.line(cx + rc, b.yt + 200, cx + rc, yBotC, "PIPE");
    d.line(cx - rc - 300, yBotC - 250, cx + rc + 300, yBotC - 250, "EQUIP");
    d.line(cx - rc - 300, yBotC - 250, cx - rc, yBotC - 50, "EQUIP");
    d.line(cx + rc + 300, yBotC - 250, cx + rc, yBotC - 50, "EQUIP");
    /* подача ила: труба сверху слева в центральную трубу */
    d.line(x - sheet.p(14), b.yt + 200, cx - rc, b.yt + 200, "PIPE");
    d.arrow(x - sheet.p(20), b.yt + 200, x - sheet.p(14), b.yt + 200, "FLOW", sheet.p(2));
    d.text(x - sheet.p(2), b.yt + 200 + th * 0.8, ts, "ПОДАЧА ИЛА", { align: "right" });
    d.text(cx, b.yt + th * 2.2, ts, `ЦЕНТРАЛЬНАЯ ТРУБА DN${g.dCenter}`, { align: "center" });
  } else {
    /* илоскрёб: мост, ферма и скребки по дну */
    d.rect(cx - R - g.wall, b.yt, 2 * (R + g.wall), 300, "EQUIP");
    d.line(cx, b.yt, cx, b.yct - g.Hslope + 200, "EQUIP");
    d.line(cx - R + 300, b.yct + 200, cx + R - 300, b.yct + 200, "EQUIP");
    for (let k = -3; k <= 3; k++) {
      const xx = cx + (k * (R - 400)) / 3;
      const yy = b.yct - (Math.abs(xx - cx) < g.dHopper / 2 ? 0 : (R - Math.abs(xx - cx)) * 0.05);
      d.line(xx, b.yct + 200, xx, yy, "EQUIP");
    }
    const rc = g.dCenter / 2;
    d.line(cx - rc, b.yt + 300, cx - rc, b.yct + g.Hw * 0.35, "PIPE");
    d.line(cx + rc, b.yt + 300, cx + rc, b.yct + g.Hw * 0.35, "PIPE");
    d.line(x - sheet.p(14), b.yt + 300, cx - rc, b.yt + 300, "PIPE");
    d.arrow(x - sheet.p(20), b.yt + 300, x - sheet.p(14), b.yt + 300, "FLOW", sheet.p(2));
    d.text(x - sheet.p(2), b.yt + 300 + th * 0.8, ts, "ПОДАЧА ИЛА", { align: "right" });
    d.text(cx, b.yt + 300 + th * 1.2, ts, "ИЛОСКРЁБ", { align: "center" });
  }
  /* иловая труба из низа конуса → камера выпуска справа */
  const chX = x + g.Dout + sheet.p(6);
  const chW = sheet.p(10);
  const ySo = b.yw - p.sludgeHeadM * 1000;
  d.line(cx, b.yb - g.wall, cx, b.yb - g.wall - 300, "PIPE");
  d.line(cx, b.yb - g.wall - 300, chX + chW / 2, b.yb - g.wall - 300, "PIPE");
  d.line(chX + chW / 2, b.yb - g.wall - 300, chX + chW / 2, ySo, "PIPE");
  /* камера выпуска: стакан от дна до планировки */
  d.rect(chX, b.yb - g.wall - 600, chW, b.groundY + 200 - (b.yb - g.wall - 600), "CONTOUR");
  d.line(chX, ySo, chX + chW, ySo, "WATER");
  d.rect(chX + chW / 2 - 150, ySo - 500, 300, 300, "EQUIP"); // задвижка
  d.arrow(chX + chW, ySo, chX + chW + sheet.p(8), ySo, "FLOW", sheet.p(2));
  d.text(chX + chW + sheet.p(1), ySo + th * 0.6, ts, "УПЛОТНЁННЫЙ ИЛ", { align: "left" });
  d.text(chX + chW / 2, b.groundY + 200 + th * 0.5, ts * 0.9, "КАМЕРА", { align: "center" });
  d.elevMark(chX + chW + sheet.p(12), ySo, fmtE(g.sludgeOut), th, -1);
  /* отметки слева */
  d.elevMark(x - sheet.p(15), b.groundY, "0.000", th, -1);
  d.elevMark(x - sheet.p(8), b.yt, fmtE(g.top), th, 1);
  d.elevMark(x - sheet.p(8) - g.wall, b.yw, fmtE(g.water), th, -1);
  d.elevMark(x - sheet.p(8), b.yct, fmtE(g.coneTop), th, -1);
  d.elevMark(cx - g.d0 / 2 - sheet.p(6), b.yb, fmtE(g.bottom), th, -1);
  /* размеры */
  const ys = [y, b.yb, b.yct, b.yw, b.yt];
  const labels = [`${slab}`, `${g.Hcone + g.Hslope}`, `${g.Hw}`, `${b.yt - b.yw}`];
  d.dimChainV(x - sheet.p(22), ys, th, labels);
  d.dimV(x - sheet.p(31), b.yb, b.yt, `${g.Htot}`, th);
  d.dimChainH([x, x + g.wall, x + g.wall + g.D, x + g.Dout], y - sheet.p(10), th);
  d.dimH(cx - g.d0 / 2, cx + g.d0 / 2, b.yb - g.wall - sheet.p(6) - 600, `${g.d0}`, th);
  /* угол конуса */
  if (g.kind === "vertical") d.text(cx + R * 0.45, b.yct - g.Hcone * 0.35, ts, `${p.coneAngleDeg}°`, { align: "left" });
  else d.text(cx + R * 0.5, b.yct + th * 0.6, ts, "i=0,05", { align: "left" });
  d.text(cx, b.yct + g.Hw * 0.75, ts, "ЗОНА ОТСТАИВАНИЯ", { align: "center" });
  d.text(cx, b.yct - (g.Hcone + g.Hslope) * 0.3, ts, "ЗОНА УПЛОТНЕНИЯ", { align: "center" });
}

function sectionB(sheet: Sheet, x: number, y: number, g: ThickenerGeometry, slab: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const b = drawBody(sheet, x, y, g, slab);
  const cx = b.cx, R = g.D / 2;
  if (g.kind === "vertical") {
    const rc = g.dCenter / 2;
    const yBotC = b.yct + g.Hw * 0.45;
    d.line(cx - rc, b.yt + 200, cx - rc, yBotC, "PIPE");
    d.line(cx + rc, b.yt + 200, cx + rc, yBotC, "PIPE");
    d.line(cx - rc, b.yt + 200, cx + rc, b.yt + 200, "PIPE");
  } else {
    d.rect(cx - 400, b.yt, 800, 300, "EQUIP");
    d.line(cx, b.yt, cx, b.yct - g.Hslope + 200, "EQUIP");
  }
  /* отвод иловой воды из лотка: патрубок из лотка вниз и наружу (передняя сторона) */
  const yo = b.yw - 150;
  d.line(cx - R + 150, yo, cx - R - g.wall - sheet.p(12), yo, "PIPE");
  d.arrow(cx - R - g.wall - sheet.p(12), yo, cx - R - g.wall - sheet.p(20), yo, "FLOW", sheet.p(2));
  d.text(cx - R - g.wall - sheet.p(2), yo - th * 1.4, ts, "ИЛОВАЯ ВОДА", { align: "right" });
  /* опорожнение */
  d.line(cx, b.yb - g.wall, cx, b.yb - g.wall - 300, "PIPE");
  d.line(cx, b.yb - g.wall - 300, x + g.Dout + sheet.p(10), b.yb - g.wall - 300, "PIPE");
  d.text(x + g.Dout + sheet.p(2), b.yb - g.wall - 300 - th * 1.3, ts, "ОПОРОЖНЕНИЕ DN100", { align: "left" });
  /* люк/ограждение по борту */
  d.line(cx - R - g.wall, b.yt + 1100, cx + R + g.wall, b.yt + 1100, "THIN");
  for (const s of [-1, 1]) d.line(cx + s * (R + g.wall), b.yt, cx + s * (R + g.wall), b.yt + 1100, "THIN");
  d.text(cx, b.yt + 1100 + th * 0.5, ts * 0.9, "ОГРАЖДЕНИЕ h=1100", { align: "center" });
  /* отметки и размеры */
  d.elevMark(x + g.Dout + sheet.p(8), b.groundY, "0.000", th, 1);
  d.elevMark(x + g.Dout + sheet.p(8), b.yw, fmtE(g.water), th, 1);
  d.elevMark(x + g.Dout + sheet.p(8), b.yb, fmtE(g.bottom), th, -1);
  d.dimChainV(x - sheet.p(22), [y, b.yb, b.yct, b.yw, b.yt], th, [`${slab}`, `${g.Hcone + g.Hslope}`, `${g.Hw}`, `${b.yt - b.yw}`]);
  d.dimChainH([x, x + g.wall, x + g.wall + g.D, x + g.Dout], y - sheet.p(10), th);
  d.text(cx, b.yw - 200 - th * 1.5, ts * 0.9, "ЛОТОК ИЛОВОЙ ВОДЫ", { align: "center" });
}

function isoView(sheet: Sheet, ox: number, oy: number, g: ThickenerGeometry, pitch: number) {
  const d = sheet.d;
  const k = 0.5;
  const R = (g.D / 2 + g.wall) * k;
  const Hc = (g.Hcone + g.Hslope) * k;
  const Hcyl = (g.Htot - g.Hcone - g.Hslope) * k;
  for (let i = 0; i < g.units; i++) {
    const cx = (g.Dout / 2 + i * pitch) * k, cy = (g.Dout / 2) * k;
    d.isoCylinder(cx, cy, Hc, R, Hcyl, ox, oy, "CONTOUR");
    /* конус: образующие от нижнего эллипса цилиндра к малому эллипсу */
    const r0 = (g.kind === "vertical" ? g.d0 / 2 : g.dHopper / 2) * k;
    const a1 = Math.PI / 4 + Math.PI / 2, a2 = Math.PI / 4 - Math.PI / 2;
    for (const a of [a1, a2]) {
      d.isoLine([cx + R * Math.cos(a), cy + R * Math.sin(a), Hc], [cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), 0], ox, oy, "HIDDEN");
    }
    const pts: Pt[] = [];
    for (let j = 0; j < 24; j++) {
      const a = (j / 24) * 2 * Math.PI;
      pts.push(isoPoint(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), 0, ox, oy));
    }
    d.poly(pts, "HIDDEN", true);
    /* центральная труба */
    if (g.kind === "vertical") d.isoCylinder(cx, cy, Hc + Hcyl * 0.4, (g.dCenter / 2) * k, Hcyl * 0.65, ox, oy, "PIPE");
    else {
      d.isoLine([cx - R, cy, Hc + Hcyl], [cx + R, cy, Hc + Hcyl + 150 * k], ox, oy, "EQUIP");
      d.isoLine([cx - R, cy, Hc + Hcyl + 150 * k], [cx + R, cy, Hc + Hcyl + 150 * k], ox, oy, "EQUIP");
    }
  }
  /* подача ила */
  const z = Hc + Hcyl + 200 * k;
  d.isoLine([-sheet.p(12), (g.Dout / 2) * k, z], [(g.Dout / 2) * k, (g.Dout / 2) * k, z], ox, oy, "PIPE");
}
