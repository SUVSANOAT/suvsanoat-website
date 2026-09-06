/* ==================================================================
 * КАНАЛИЗАЦИОННАЯ НАСОСНАЯ СТАНЦИЯ (КНС) ПОДВОДЯЩАЯ — МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Круглая монолитная железобетонная шахта с погружными насосами на
 * автоматических трубных муфтах, приёмной корзиной или решёткой-
 * дробилкой на подводящем трубопроводе, двумя напорными линиями и
 * колодцем задвижек. Нужна, если в цепочке есть ступень "pump" либо
 * отметка лотка подводящего коллектора ниже допустимой для самотёчной
 * подачи (флаг overrides.required).
 *
 * Нормы ҚМҚ 2.04.03-19: резерв насосов — п. 5.4, табл. 21 (бытовые СВ,
 * 2 рабочих → 1 резервный при II–III категории; при I категории ещё 1 на
 * складе); приёмный резервуар — не менее 5-минутной максимальной подачи
 * одного насоса (п. 5.18); уклон дна к приямку ≥ 0,1 (п. 5.20); решётки
 * — п. 5.12, табл. 22 (решётки-дробилки на трубопроводах: до 3 рабочих —
 * 1 резервная с ручной очисткой; ручная очистка при отбросах < 0,1
 * м³/сут); отбросы 8 л/(чел·год) при прозорах 16–20 мм (табл. 23);
 * напорных трубопроводов от НС I категории — не менее двух (п. 5.8).
 *
 * Конструктив — монолитный железобетон (drawings/core/construction.ts,
 * решение SUVSANOAT от 06.09.2026): толщина стен, днища и перекрытия —
 * только оттуда, по расходу не ветвится.
 *
 * Не нормируются (принято по практике/паспорту): диаметр шахты по числу
 * насосов, частота включений (≤ 10 1/ч), минимальное погружение насоса
 * 0,6 м, отметка лотка коллектора −2,0 м при отсутствии данных, глубина
 * заложения напорного трубопровода 1,0 м.
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { PUMP_STATIONS, TABLE_3_WATER_USE, kmkRef } from "../../norms/kmk-2-04-03-19";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type PumpStationParams = {
  /** станция требуется (иначе — самотёк); при отсутствии флага — по наличию "pump" в цепочке */
  required?: boolean;
  /** рабочих насосов (табл. 21) */
  workingPumps: number;
  /** категория надёжности: I — +1 резервный на складе; II/III — 1 резервный */
  category: "I" | "II" | "III";
  /** отметка лотка подводящего коллектора, м относительно 0.000 — принято при отсутствии данных */
  inletInvertM: number;
  /** предельная частота включений насоса, 1/ч — практика */
  startsPerHour: number;
  /** минимальное погружение насоса под уровнем отключения, м — по паспорту */
  minSubmergenceM: number;
  /** глубина заложения напорного трубопровода на выходе, м */
  pressurePipeDepthM: number;
  /** превышение плиты перекрытия над планировкой, м */
  topAboveGroundM: number;
  /** толщина стен, мм — из construction() */
  wallMm: number;
  /** толщина днища, мм — из construction() */
  slabMm: number;
  /** толщина перекрытия, мм — из construction() */
  coverMm: number;
};

export function pumpStationDefaults(input: DrawingInput): PumpStationParams {
  const c = construction();
  return {
    required: undefined,
    workingPumps: 2,
    category: input.q > 5000 ? "I" : "II",
    inletInvertM: -2.0,
    startsPerHour: 10,
    minSubmergenceM: 0.6,
    pressurePipeDepthM: 1.0,
    topAboveGroundM: 0.2,
    wallMm: c.wallMm,
    slabMm: c.slabMm,
    coverMm: c.coverMm,
  };
}

/** нужна ли КНС по входным данным */
export function pumpStationRequired(input: DrawingInput, overrides: Partial<PumpStationParams> = {}): boolean {
  if (overrides.required !== undefined) return overrides.required;
  return input.chain.includes("pump");
}

export type PumpStationGeometry = {
  required: boolean;
  qMaxH: number;
  pumpsWork: number;
  pumpsReserve: number;
  pumpsStore: number;
  qPump: number; // м³/ч
  dnPump: number; // напорный патрубок насоса
  dnPress: number; // напорные линии
  dnInlet: number;
  vMin5: number; // м³ по п. 5.18
  vStarts: number; // м³ по частоте включений
  vWork: number;
  D: number; // внутренний диаметр шахты
  Dout: number;
  wall: number;
  hWork: number; // мм
  Htot: number; // от дна до низа перекрытия
  screeningsM3Day: number;
  screen: "basket" | "grinder";
  valveChamber: { L: number; W: number };
  /* отметки */
  inletInvert: number;
  start: number;
  stop: number;
  bottom: number; // дно у насосов (приямок)
  bottomEdge: number; // дно у стены (уклон 0,1)
  top: number; // верх перекрытия
  pressOut: number;
  /* габарит */
  W: number;
  L: number;
};

export function pumpStationGeometry(input: DrawingInput, p: PumpStationParams): PumpStationGeometry {
  const required = pumpStationRequired(input, p);
  const qMaxH = input.qMaxH;
  const pumpsWork = Math.max(1, Math.round(p.workingPumps));
  /* табл. 21: бытовые СВ — 1–2 рабочих: 1 резервный (+1 на складе при I кат.); 3 и более: 2 резервных (I, II), 1 и 1 на складе (III) */
  const pumpsReserve = pumpsWork <= 2 ? 1 : p.category === "III" ? 1 : 2;
  const pumpsStore = pumpsWork <= 2 && p.category === "I" ? 1 : pumpsWork >= 3 && p.category === "III" ? 1 : 0;
  const qPump = qMaxH / pumpsWork;
  const dnPump = Math.max(80, dnFor(qPump, 1.5)); // напорный патрубок насоса при 1,5 м/с, не менее DN80 (проход 80 мм)
  const dnPress = Math.max(100, dnFor(qMaxH, 1.2)); // каждая линия на 100 % расхода (п. 5.8)
  const dnInlet = Math.max(150, dnFor(qMaxH * 1.4, 0.8)); // самотёчный подвод при коэффициенте 1,4 (п. 6.14)
  const vMin5 = (PUMP_STATIONS.wetWellMinMinutes.value / 60) * qPump;
  const vStarts = qPump / (4 * p.startsPerHour);
  const vWork = Math.max(vMin5, vStarts);
  const n = pumpsWork + pumpsReserve;
  const D = Math.max(2000, roundTo(n * (600 + 4 * dnPump), 500));
  const wall = p.wallMm;
  const area = (Math.PI * D * D) / 4 / 1e6;
  const hWork = Math.max(500, roundTo((vWork / area) * 1000, 50));
  const inletInvert = p.inletInvertM;
  const start = inletInvert - 0.2;
  const stop = start - hWork / 1000;
  const bottom = stop - p.minSubmergenceM;
  const bottomEdge = bottom + 0.1 * (D / 2 / 1000); // уклон 0,1 к приямку (п. 5.20)
  const top = p.topAboveGroundM;
  const Htot = Math.round((top - bottom) * 1000);
  /* отбросы: население по табл. 3 (170 л/чел·сут, 2035 г.), 8 л/(чел·год) при прозорах 16–20 мм */
  const lpcd = TABLE_3_WATER_USE["town-under-50k"].lps[2035];
  const people = (input.q * 1000) / lpcd;
  const screeningsM3Day = (people * PUMP_STATIONS.screeningsPerCapita[0].lPerPersonYear) / 365 / 1000;
  const screen: "basket" | "grinder" = screeningsM3Day < 0.1 ? "basket" : "grinder";
  const valveChamber = { L: 1500 + (dnPress > 150 ? 500 : 0), W: 2000 + (dnPress > 150 ? 500 : 0) };
  return {
    required, qMaxH, pumpsWork, pumpsReserve, pumpsStore, qPump, dnPump, dnPress, dnInlet,
    vMin5, vStarts, vWork, D, Dout: D + 2 * wall, wall, hWork, Htot, screeningsM3Day, screen, valveChamber,
    inletInvert, start, stop, bottom, bottomEdge, top, pressOut: -p.pressurePipeDepthM - dnPress / 2000,
    W: D + 2 * wall + 500 + valveChamber.L, L: Math.max(D + 2 * wall, valveChamber.W),
  };
}

function fitScale(planW: number, planH: number, sectH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 300 && (planH + sectH) / s <= 440) ?? pickScale(planW, sectH);
}

export function pumpStationScale(input: DrawingInput, overrides: Partial<PumpStationParams> = {}): number {
  const g = pumpStationGeometry(input, { ...pumpStationDefaults(input), ...overrides });
  return fitScale(g.W, g.L, g.Htot + 2500);
}

export function pumpStationModel(input: DrawingInput, overrides: Partial<PumpStationParams> = {}): StructureModel {
  const p = { ...pumpStationDefaults(input), ...overrides };
  const g = pumpStationGeometry(input, p);
  const c = construction();
  const cv = concreteVolume(c, { shape: "circle", d: g.Dout }, g.Htot, true);
  const ps = PUMP_STATIONS;
  const model: StructureModel = {
    id: "pump-station",
    kind: "pump-station",
    name: "КНС подводящая (железобетонная шахта)",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.L, l: g.W },
    bottom: g.bottom,
    water: g.start,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "in", dn: g.dnInlet, side: "W", pos: g.L / 2, elev: g.inletInvert + g.dnInlet / 2000 },
      { role: "out", dn: g.dnPress, side: "E", pos: g.L / 2 - 300, elev: g.pressOut },
      { role: "out", dn: g.dnPress, side: "E", pos: g.L / 2 + 300, elev: g.pressOut },
      { role: "drain", dn: 100, side: "S", pos: g.Dout / 2, elev: g.bottom + 0.2 },
    ],
    volumes: [
      { name: "Рабочий объём приёмного резервуара (между уровнями)", m3: (g.hWork / 1000) * (Math.PI * g.D * g.D) / 4 / 1e6 },
      { name: "Требуемый по п. 5.18 (5 мин подачи насоса)", m3: g.vMin5 },
      { name: `Требуемый по частоте включений ≤ ${p.startsPerHour} 1/ч`, m3: g.vStarts },
      { name: "Полный объём шахты до низа перекрытия", m3: (g.Htot / 1000) * (Math.PI * g.D * g.D) / 4 / 1e6 },
      { name: "Бетон стен", m3: cv.walls },
      { name: "Бетон днища", m3: cv.slab },
      { name: "Бетон перекрытия", m3: cv.cover },
      { name: "Бетонная подготовка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total },
      { name: "Арматура, кг", m3: cv.total * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Резервуар железобетонный монолитный (шахта с днищем и перекрытием)", qty: "1", spec: `D ${g.D} мм, H ${g.Htot} мм, стены ${p.wallMm} мм, перекрытие ${p.coverMm} мм, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Люки чугунные и опорные кольца перекрытия", qty: "2 шт.", supply: "supply" },
      { name: "Насос погружной канализационный на автомуфте с направляющими", qty: `${g.pumpsWork}+${g.pumpsReserve}${g.pumpsStore ? `+${g.pumpsStore} на складе` : ""}`, spec: `${g.qPump.toFixed(1)} м³/ч, напор по профилю; DN${g.dnPump}`, supply: "supply" },
      { name: g.screen === "basket" ? "Корзина приёмная съёмная с подъёмным устройством (ручная очистка)" : "Решётка-дробилка на подводящем трубопроводе", qty: g.screen === "basket" ? "1" : "1+1 (резерв — с ручной очисткой)", spec: `${g.screeningsM3Day.toFixed(2)} м³/сут отбросов`, supply: "supply" },
      { name: "Колодец задвижек железобетонный с обратными клапанами и задвижками", qty: "1", spec: `${g.valveChamber.L}×${g.valveChamber.W} мм, 2 линии DN${g.dnPress}`, supply: TANK_SUPPLY },
      { name: "Поплавковые/гидростатические датчики уровня, шкаф управления наземный", qty: "комплект", supply: "supply" },
      { name: "Вентиляционный стояк DN100 h=2 м, лестница, люки", qty: "комплект", supply: "own" },
    ],
    basis: [
      constructionNote(c),
      `${g.required ? "КНС требуется" : "КНС не требуется (самотёк)"}: ${overrides.required !== undefined ? "по флагу required" : `по цепочке (${input.chain.includes("pump") ? "есть" : "нет"} ступени «pump»)`}. Расчётный приток ${g.qMaxH.toFixed(1)} м³/ч (максимальный часовой).`,
      `Насосы: ${g.pumpsWork} рабочих по ${g.qPump.toFixed(1)} м³/ч + ${g.pumpsReserve} резервный${g.pumpsStore ? ` + ${g.pumpsStore} на складе` : ""} (${kmkRef("5.4", "табл. 21")}, бытовые СВ, ${p.category} категория надёжности).`,
      `Приёмный резервуар: ${g.vMin5.toFixed(2)} м³ по 5-минутной подаче насоса (${ps.wetWellMinMinutes.ref}); по частоте включений ≤ ${p.startsPerHour} 1/ч — ${g.vStarts.toFixed(2)} м³ (практика); принят рабочий слой ${g.hWork} мм в шахте D ${g.D} мм; уклон дна к приямку 0,1 (${kmkRef("5.20")}).`,
      `Отбросы ${g.screeningsM3Day.toFixed(3)} м³/сут (${ps.screeningsPerCapita[0].lPerPersonYear} л/(чел·год) при прозорах 16–20 мм, ${kmkRef("5.13", "табл. 23")}; население по ${lpcdRef()}) — ${g.screen === "basket" ? `менее 0,1 м³/сут: допускается ручная очистка, принята приёмная корзина (${kmkRef("5.12")})` : `решётка-дробилка на трубопроводе, 1 рабочая + 1 резервная с ручной очисткой (${kmkRef("5.12", "табл. 22")})`}.`,
      `Напорные трубопроводы — 2 линии DN${g.dnPress}, каждая на 100 % расхода (${kmkRef("5.8")}); подводящий коллектор DN${g.dnInlet} с лотком на отм. ${fmtE(g.inletInvert)} (${p.inletInvertM === -2 ? "принято при отсутствии данных" : "по заданию"}); уровень включения на 0,2 м ниже лотка — практика.`,
      `Диаметр шахты по числу насосов и DN (практика), минимальное погружение ${p.minSubmergenceM} м — по паспорту насосов; шахта и колодец задвижек — монолитный железобетон подрядчика, насосы, решётка и автоматика — поставка; лестницы, стояк вентиляции и обвязка — изготовление SUVSANOAT.`,
    ],
    headLoss: 0,
    draw: (sheet) => drawPumpStation(sheet, input, p, g),
  };
  return model;
}

function lpcdRef(): string {
  return `${kmkRef("2.9", "табл. 3")}, ${TABLE_3_WATER_USE["town-under-50k"].lps[2035]} л/(чел·сут)`;
}

function dnFor(qM3H: number, v = 1.0): number {
  const d = Math.sqrt((4 * qM3H) / 3600 / v / Math.PI) * 1000;
  const row = [50, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800];
  return row.find((x) => x >= d) ?? 800;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawPumpStation(sheet: Sheet, input: DrawingInput, p: PumpStationParams, g: PumpStationGeometry) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const Ro = g.Dout / 2, R = g.D / 2;
  const n = g.pumpsWork + g.pumpsReserve;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(40);
  const py = f.y0 + f.h - sheet.p(40) - g.L;
  sheet.viewTitle(px, py + g.L + sheet.p(16), "ПЛАН");
  const cx = px + Ro, cy = py + g.L / 2;
  d.circle(cx, cy, Ro, "CONTOUR");
  d.circle(cx, cy, R, "CONTOUR");
  d.circle(cx, cy, Ro + 500, "HIDDEN"); // фундаментная плита днища с уширением
  d.line(cx - Ro - sheet.p(6), cy, cx + Ro + sheet.p(6), cy, "AXIS");
  d.line(cx, cy - Ro - sheet.p(6), cx, cy + Ro + sheet.p(6), "AXIS");
  /* насосы: на восточной половине, равномерно по дуге */
  const rp = R - 450 - g.dnPump;
  const angles: number[] = [];
  for (let i = 0; i < n; i++) angles.push(((i - (n - 1) / 2) * 50 * Math.PI) / 180); // шаг 50° около оси E
  const pumpPts: Pt[] = angles.map((a) => [cx + rp * Math.cos(a), cy + rp * Math.sin(a)]);
  pumpPts.forEach(([x, y], i) => {
    d.circle(x, y, 250 + g.dnPump, "EQUIP");
    d.circle(x, y, 120, "EQUIP");
    d.rect(x - 200, y - 200, 400, 400, "EQUIP"); // автомуфта
    /* напорный стояк — к стенке, выход через стенку на восток */
    d.line(x, y, cx + R + 100, y, "PIPE");
    d.line(cx + R + 100, y, cx + Ro + 500, y, "PIPE");
    d.text(x, y + 250 + g.dnPump + ts * 0.5, ts * 0.9, `Н${i + 1} ${i < g.pumpsWork ? "раб." : "рез."}`, { align: "center" });
    /* люк над насосом */
    d.rect(x - 400, y - 400, 800, 800, "THIN");
  });
  /* подводящий коллектор с запада, корзина/дробилка у стенки */
  d.line(px - sheet.p(20), cy, cx - R, cy, "PIPE");
  d.arrow(px - sheet.p(26), cy, px - sheet.p(20), cy, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), cy + th * 0.8, ts, `ПОДВОДЯЩИЙ КОЛЛЕКТОР DN${g.dnInlet}`, { align: "right" });
  if (g.screen === "basket") {
    d.rect(cx - R + 100, cy - 400, 700, 800, "EQUIP");
    d.line(cx - R + 100, cy - 400, cx - R + 800, cy + 400, "EQUIP");
    d.line(cx - R + 100, cy + 400, cx - R + 800, cy - 400, "EQUIP");
    d.text(cx - R + 450, cy - 400 - ts * 1.3, ts * 0.9, "КОРЗИНА", { align: "center" });
    d.rect(cx - R + 50, cy - 500, 900, 1000, "THIN"); // люк
  } else {
    d.rect(px - sheet.p(14), cy - 300, 900, 600, "EQUIP");
    d.text(px - sheet.p(14) + 450, cy + 300 + ts * 0.5, ts * 0.9, "ДРОБИЛКА", { align: "center" });
    d.rect(px - sheet.p(14) - 300, cy - 900, 1500, 1800, "CONTOUR"); // колодец дробилки
  }
  /* колодец задвижек */
  const vcX = cx + Ro + 500, vcY = cy - g.valveChamber.W / 2;
  d.rect(vcX, vcY, g.valveChamber.L, g.valveChamber.W, "CONTOUR");
  d.rect(vcX + g.wall, vcY + g.wall, g.valveChamber.L - 2 * g.wall, g.valveChamber.W - 2 * g.wall, "CONTOUR");
  d.text(vcX + g.valveChamber.L / 2, vcY - th * 1.5, ts, "КОЛОДЕЦ ЗАДВИЖЕК", { align: "center" });
  /* коллектор в колодце: две напорные линии */
  const yl = [cy - 300, cy + 300];
  d.line(vcX + 400, cy - rp * Math.sin(angles[0]) - 0, vcX + 400, cy + rp * Math.sin(angles[0]), "PIPE");
  pumpPts.forEach(([, y]) => {
    d.rect(vcX + 150, y - 100, 200, 200, "EQUIP"); // обратный клапан
    d.rect(vcX + 500, y - 100, 200, 200, "EQUIP"); // задвижка
  });
  for (const y of yl) {
    d.line(vcX + 400, y, vcX + g.valveChamber.L + sheet.p(18), y, "PIPE");
    d.rect(vcX + 900, y - 100, 200, 200, "EQUIP");
  }
  d.arrow(vcX + g.valveChamber.L + sheet.p(18), cy, vcX + g.valveChamber.L + sheet.p(24), cy, "FLOW", sheet.p(2));
  d.text(vcX + g.valveChamber.L + sheet.p(2), cy + 300 + th * 0.8, ts, `НАПОРНЫЕ ЛИНИИ 2×DN${g.dnPress} НА ОЧИСТНЫЕ СООРУЖЕНИЯ`, { align: "left" });
  /* вентстояк, шкаф */
  d.circle(cx, cy - R + 300, 60, "PIPE");
  d.text(cx, cy - R + 300 - ts * 1.6, ts * 0.8, "ВЕНТ. DN100", { align: "center" });
  d.rect(vcX + 200, vcY - 1200, 800, 400, "EQUIP");
  d.text(vcX + 600, vcY - 1200 - ts * 1.3, ts * 0.9, "ШКАФ УПРАВЛЕНИЯ", { align: "center" });
  /* размеры */
  const yd = py - sheet.p(12);
  d.dimChainH([px, px + g.wall, px + g.wall + g.D, px + g.Dout, vcX, vcX + g.valveChamber.L], yd, th);
  d.dimH(px, vcX + g.valveChamber.L, yd - sheet.p(9), `${g.W}`, th);
  const xd = vcX + g.valveChamber.L + sheet.p(45);
  d.dimChainV(xd, [cy - Ro, cy - R, cy + R, cy + Ro], th);
  d.dimV(xd + sheet.p(9), cy - Ro, cy + Ro, `${g.Dout}`, th);
  /* марки разрезов */
  d.sectionMark(px - sheet.p(30), cy - th * 2, vcX + g.valveChamber.L + sheet.p(8), cy - th * 2, "1", th, -1);
  const x22 = pumpPts[Math.floor(n / 2)][0];
  d.sectionMark(x22, py - sheet.p(6), x22, py + g.L + sheet.p(6), "2", th, 1);
  d.northArrow(vcX + g.valveChamber.L + sheet.p(4), py + g.L + sheet.p(18), sheet.p(8));

  /* ---------------- РАЗРЕЗ 1-1 (W–E: подвод, насос, колодец задвижек) ---------------- */
  const slab = p.slabMm;
  const stack = 2000;
  const secH = g.Htot + 300 + slab + stack;
  const sy = py - sheet.p(50) - secH;
  sheet.viewTitle(px, sy + secH + sheet.p(10), "РАЗРЕЗ 1-1");
  sectionWE(sheet, px, sy, g, p, slab, stack);

  /* ---------------- РАЗРЕЗ 2-2 (N–S: насосы в ряд) ---------------- */
  const cx2 = px + g.W + sheet.p(80);
  sheet.viewTitle(cx2, sy + secH + sheet.p(10), "РАЗРЕЗ 2-2");
  sectionNS(sheet, cx2, sy, g, p, slab, stack, pumpPts.map(([, y]) => y - (cy - Ro)));

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = Math.max(px + g.W + sheet.p(90), xd + sheet.p(30));
  const avail = f.x0 + f.w - sheet.p(10) - isoLeft;
  const k = Math.min(0.5, avail / ((g.W + g.L) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.L * k * Math.cos(Math.PI / 6);
  const isoH = (g.Htot + slab + stack) * k + (g.W + g.L) * k * 0.5;
  const iy = py + g.L - isoH;
  sheet.viewTitle(isoLeft, py + g.L + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k, slab, stack);

  sheet.note(`КНС: шахта железобетонная монолитная D=${g.D} мм, глубина ${g.Htot} мм от низа перекрытия до дна приямка; насосы ${g.pumpsWork}+${g.pumpsReserve} по ${g.qPump.toFixed(1)} м³/ч (табл. 21 п. 5.4), рабочий слой ${g.hWork} мм ≥ 5-минутной подаче насоса (п. 5.18).`);
  sheet.note(`Отметки: лоток коллектора ${fmtE(g.inletInvert)}, включение ${fmtE(g.start)}, отключение ${fmtE(g.stop)}, дно приямка ${fmtE(g.bottom)}, перекрытие ${fmtE(g.top)}; напорные линии 2×DN${g.dnPress} на глубине ${p.pressurePipeDepthM} м.`);
  sheet.note(`${g.screen === "basket" ? "Приёмная корзина с ручной очисткой (отбросы < 0,1 м³/сут, п. 5.12)" : "Решётка-дробилка 1+1 на подводящем трубопроводе (табл. 22)"}; вентиляция — стояк DN100; управление по уровню без постоянного персонала (п. 7.17).`);
  sheet.note(`Шахта и колодец задвижек — монолитный железобетон: стены ${p.wallMm} мм, днище ${p.slabMm} мм, перекрытие ${p.coverMm} мм, бетон ${construction().concreteGrade}. Насосы, решётка и автоматика — поставка; лестницы, стояк вентиляции и обвязка — изготовление SUVSANOAT. Напор насосов — по гидравлическому профилю площадки.`);
  sheet.legend([
    { layer: "CONTOUR", text: "стенки шахты и колодца" },
    { layer: "HATCH", text: "железобетон, грунт" },
    { layer: "WATER", text: "уровни включения/отключения" },
    { layer: "PIPE", text: "трубопроводы" },
    { layer: "EQUIP", text: "насосы, арматура" },
  ]);
  void input;
}

function sectionWE(sheet: Sheet, x: number, y: number, g: PumpStationGeometry, p: PumpStationParams, slab: number, stack: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const Ro = g.Dout / 2, R = g.D / 2;
  const cx = x + Ro;
  const yb = y + slab; // дно приямка (у насосов, восточная половина)
  const ybEdge = yb + (g.bottomEdge - g.bottom) * 1000; // дно у западной стенки
  const yTop = yb + g.Htot; // низ перекрытия ≈ верх (плита 150)
  const groundY = yTop - g.top * 1000;
  /* фундаментная плита днища (с уширением против всплытия) */
  d.rect(cx - Ro - 500, y, g.Dout + 1000, slab, "CONTOUR");
  d.concrete([[cx - Ro - 500, y], [cx + Ro + 500, y], [cx + Ro + 500, y + slab], [cx - Ro - 500, y + slab]], sheet.p(1.5));
  /* стенки и днище с уклоном 0,1 к приямку (восток) */
  const w = g.wall;
  const body: Pt[] = [
    [cx - Ro, yTop + 150], [cx - Ro, ybEdge - w], [cx - R + 200, yb - w], [cx + Ro, yb - w], [cx + Ro, yTop + 150],
    [cx + R, yTop + 150], [cx + R, yb], [cx - R + 200, yb], [cx - R, ybEdge], [cx - R, yTop + 150],
  ];
  d.poly(body, "CONTOUR", true);
  d.concrete(body, sheet.p(1.5));
  /* перекрытие с люками */
  d.rect(cx - Ro, yTop, g.Dout, p.coverMm, "CONTOUR");
  d.concrete([[cx - Ro, yTop], [cx + Ro, yTop], [cx + Ro, yTop + p.coverMm], [cx - Ro, yTop + p.coverMm]], sheet.p(1.5));
  d.text(cx + R * 0.5, yTop + p.coverMm + th * 0.6, ts * 0.9, "ЛЮК", { align: "center" });
  d.text(cx - R * 0.6, yTop + p.coverMm + th * 0.6, ts * 0.9, "ЛЮК", { align: "center" });
  /* насос в приямке + стояк + автомуфта */
  const pxp = cx + R * 0.45;
  d.rect(pxp - 250, yb, 500, 700, "EQUIP");
  d.circle(pxp, yb + 350, 180, "EQUIP");
  d.rect(pxp - 350, yb, 700, 150, "EQUIP");
  const yOut = yTop - p.pressurePipeDepthM * 1000 - g.top * 1000; // отметка напорной трубы
  d.line(pxp + 250, yb + 350, cx + R - 300, yb + 350, "PIPE");
  d.line(cx + R - 300, yb + 350, cx + R - 300, yOut, "PIPE");
  d.line(cx + R - 300, yOut, cx + Ro + 500, yOut, "PIPE");
  d.line(pxp + 250, yb + 700, pxp + 250, yTop, "THIN"); // направляющие
  d.line(pxp + 320, yb + 700, pxp + 320, yTop, "THIN");
  d.text(pxp, yb + 700 + th * 2.2, ts * 0.9, "НАСОС", { align: "center" });
  /* подводящий коллектор: лоток на отм. inletInvert */
  const yInv = yTop - (g.top - g.inletInvert) * 1000;
  d.line(x - sheet.p(20), yInv, cx - R, yInv, "PIPE");
  d.line(x - sheet.p(20), yInv + g.dnInlet, cx - R, yInv + g.dnInlet, "PIPE");
  d.arrow(x - sheet.p(26), yInv + g.dnInlet / 2, x - sheet.p(20), yInv + g.dnInlet / 2, "FLOW", sheet.p(2));
  d.text(x - sheet.p(2), yInv - th * 1.6, ts, `КОЛЛЕКТОР DN${g.dnInlet}`, { align: "right" });
  /* корзина / дробилка */
  if (g.screen === "basket") {
    d.rect(cx - R + 100, yInv - 600, 700, 800, "EQUIP");
    d.line(cx - R + 450, yInv + 200, cx - R + 450, yTop, "THIN");
    d.text(cx - R + 450, yInv - 600 - th * 1.3, ts * 0.9, "КОРЗИНА", { align: "center" });
  } else {
    d.rect(x - sheet.p(14), yInv - 200, 900, g.dnInlet + 400, "EQUIP");
    d.text(x - sheet.p(14) + 450, yInv - 200 - th * 1.3, ts * 0.9, "ДРОБИЛКА", { align: "center" });
  }
  /* уровни */
  const yStart = yTop - (g.top - g.start) * 1000;
  const yStop = yTop - (g.top - g.stop) * 1000;
  d.line(cx - R, yStart, cx + R, yStart, "WATER");
  d.line(cx - R, yStop, cx + R, yStop, "WATER");
  d.waterLevel(cx - R * 0.3, yStart, "ВКЛ.", th);
  d.waterLevel(cx - R * 0.3, yStop, "ОТКЛ.", th);
  /* колодец задвижек */
  const vcX = cx + Ro + 500;
  const vcH = (g.top * 1000 - yOut + yTop) + 1200;
  d.rect(vcX, yOut - 1200 + 0, g.valveChamber.L, yTop + 150 - (yOut - 1200), "CONTOUR");
  d.rect(vcX + g.wall, yOut - 1200 + g.wall, g.valveChamber.L - 2 * g.wall, yTop + 150 - (yOut - 1200) - 2 * g.wall, "CONTOUR");
  d.line(vcX, yOut, vcX + g.valveChamber.L + sheet.p(12), yOut, "PIPE");
  d.rect(vcX + 300, yOut - 150, 250, 300, "EQUIP");
  d.rect(vcX + 800, yOut - 150, 250, 300, "EQUIP");
  d.arrow(vcX + g.valveChamber.L + sheet.p(12), yOut, vcX + g.valveChamber.L + sheet.p(18), yOut, "FLOW", sheet.p(2));
  d.text(vcX + g.valveChamber.L + sheet.p(2), yOut + th * 0.8, ts, `НАПОР DN${g.dnPress}`, { align: "left" });
  d.text(vcX + g.valveChamber.L / 2, yTop + 150 + th * 0.4, ts * 0.9, "КОЛОДЕЦ ЗАДВИЖЕК", { align: "center" });
  void vcH;
  /* вентстояк и шкаф */
  d.rect(cx - 60, yTop + 150, 120, stack, "PIPE");
  d.text(cx + 150, yTop + 150 + stack - th, ts * 0.9, "ВЕНТ. DN100", { align: "left" });
  /* земля */
  d.groundLine(x - sheet.p(28), cx - Ro - 500, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(cx + Ro + 500, vcX, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(vcX + g.valveChamber.L, vcX + g.valveChamber.L + sheet.p(20), groundY, sheet.p(3), sheet.p(3));
  /* отметки */
  d.elevMark(x - sheet.p(24), groundY, "0.000", th, 1);
  d.elevMark(x - sheet.p(12), yInv, fmtE(g.inletInvert), th, 1);
  d.elevMark(cx - R - sheet.p(3), yStart, fmtE(g.start), th, 1);
  d.elevMark(cx - R - sheet.p(3), yStop, fmtE(g.stop), th, -1);
  d.elevMark(cx + R * 0.1, yb, fmtE(g.bottom), th, -1);
  d.elevMark(cx - Ro - sheet.p(6), yTop + 150, fmtE(g.top), th, 1);
  d.elevMark(vcX + g.valveChamber.L + sheet.p(10), yOut, fmtE(g.pressOut), th, -1);
  /* размеры */
  d.dimChainV(x - sheet.p(34), [y, yb, yStop, yStart, yTop], th, [`${slab}`, `${Math.round(yStop - yb)}`, `${g.hWork}`, `${Math.round(yTop - yStart)}`]);
  d.dimV(x - sheet.p(42), yb, yTop, `${g.Htot}`, th);
  d.dimChainH([cx - Ro, cx - R, cx + R, cx + Ro, vcX, vcX + g.valveChamber.L], y - sheet.p(10), th);
  d.text(cx - R * 0.5, yb + 300, ts * 0.9, "i=0,1", { align: "center" });
}

function sectionNS(sheet: Sheet, x: number, y: number, g: PumpStationGeometry, p: PumpStationParams, slab: number, stack: number, pumpOff: number[]) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const Ro = g.Dout / 2, R = g.D / 2;
  const cx = x + Ro;
  const yb = y + slab;
  const yTop = yb + g.Htot;
  const groundY = yTop - g.top * 1000;
  d.rect(cx - Ro - 500, y, g.Dout + 1000, slab, "CONTOUR");
  d.concrete([[cx - Ro - 500, y], [cx + Ro + 500, y], [cx + Ro + 500, y + slab], [cx - Ro - 500, y + slab]], sheet.p(1.5));
  const w = g.wall;
  const bodyNS: Pt[] = [[cx - Ro, yTop + 150], [cx - Ro, yb - w], [cx + Ro, yb - w], [cx + Ro, yTop + 150], [cx + R, yTop + 150], [cx + R, yb], [cx - R, yb], [cx - R, yTop + 150]];
  d.poly(bodyNS, "CONTOUR", true);
  d.concrete(bodyNS, sheet.p(1.5));
  d.rect(cx - Ro, yTop, g.Dout, p.coverMm, "CONTOUR");
  d.concrete([[cx - Ro, yTop], [cx + Ro, yTop], [cx + Ro, yTop + p.coverMm], [cx - Ro, yTop + p.coverMm]], sheet.p(1.5));
  /* насосы в ряд по положениям из плана */
  pumpOff.forEach((off, i) => {
    const pxp = x + off;
    d.rect(pxp - 250, yb, 500, 700, "EQUIP");
    d.circle(pxp, yb + 350, 180, "EQUIP");
    d.line(pxp - 250, yb + 700, pxp - 250, yTop, "THIN");
    d.line(pxp - 180, yb + 700, pxp - 180, yTop, "THIN");
    d.line(pxp, yb + 700, pxp, yTop + 150, "PIPE"); // цепь
    d.rect(pxp - 400, yTop + 150, 800, 60, "THIN"); // люк
    d.text(pxp, yb + 700 + th * 2.2, ts * 0.9, `Н${i + 1}`, { align: "center" });
  });
  const yStart = yTop - (g.top - g.start) * 1000;
  const yStop = yTop - (g.top - g.stop) * 1000;
  d.line(cx - R, yStart, cx + R, yStart, "WATER");
  d.line(cx - R, yStop, cx + R, yStop, "WATER");
  d.waterLevel(cx - R * 0.6, yStart, undefined, th);
  /* лестница у северной стенки */
  d.line(cx - R + 150, yb + 300, cx - R + 150, yTop + 150, "THIN");
  d.line(cx - R + 450, yb + 300, cx - R + 450, yTop + 150, "THIN");
  for (let yy = yb + 500; yy < yTop; yy += 300) d.line(cx - R + 150, yy, cx - R + 450, yy, "THIN");
  d.text(cx - R + 300, yTop + 150 + th * 0.4, ts * 0.8, "ЛЕСТНИЦА", { align: "center" });
  d.rect(cx + R * 0.7 - 60, yTop + 150, 120, stack, "PIPE");
  d.groundLine(x - sheet.p(15), cx - Ro - 500, groundY, sheet.p(3), sheet.p(3));
  d.groundLine(cx + Ro + 500, cx + Ro + 500 + sheet.p(15), groundY, sheet.p(3), sheet.p(3));
  d.elevMark(x - sheet.p(14), groundY, "0.000", th, 1);
  d.elevMark(x + g.Dout + sheet.p(8), yb, fmtE(g.bottom), th, -1);
  d.elevMark(x + g.Dout + sheet.p(8), yStart, fmtE(g.start), th, 1);
  d.elevMark(x + g.Dout + sheet.p(8), yTop + 150, fmtE(g.top), th, 1);
  d.dimChainH([x, x + w, x + w + g.D, x + g.Dout], y - sheet.p(10), th);
  d.dimChainV(x - sheet.p(22), [y, yb, yStop, yStart, yTop], th, [`${slab}`, `${Math.round(yStop - yb)}`, `${g.hWork}`, `${Math.round(yTop - yStart)}`]);
  void p;
}

function isoView(sheet: Sheet, ox: number, oy: number, g: PumpStationGeometry, k: number, slab: number, stack: number) {
  const d = sheet.d;
  const Ro = (g.Dout / 2) * k;
  const cx = Ro, cy = (g.L / 2) * k;
  /* фундаментная плита — низкий цилиндр, шахта, стояк */
  d.isoCylinder(cx, cy, 0, Ro + 500 * k, slab * k, ox, oy, "CONTOUR");
  d.isoCylinder(cx, cy, slab * k, Ro, (g.Htot + 150) * k, ox, oy, "CONTOUR");
  d.isoCylinder(cx, cy, (slab + g.Htot + 150) * k, 60 * k, stack * k, ox, oy, "PIPE");
  /* колодец задвижек — коробка справа (восток = +X) */
  const vcX = (g.Dout + 500) * k;
  const hVc = (g.top - (g.pressOut - 1.2)) * 1000 * k; // от низа колодца (на 1,2 м ниже напорной трубы) до перекрытия
  d.isoBox(vcX, cy - (g.valveChamber.W / 2) * k, (slab + g.Htot + 150) * k - hVc, g.valveChamber.L * k, g.valveChamber.W * k, hVc, ox, oy, "CONTOUR", true);
  /* подвод и напор */
  d.isoLine([-sheet.p(8), cy, (slab + g.Htot - (g.top - g.inletInvert) * 1000) * k], [cx - Ro, cy, (slab + g.Htot - (g.top - g.inletInvert) * 1000) * k], ox, oy, "PIPE");
  d.isoLine([vcX + g.valveChamber.L * k, cy, (slab + g.Htot + (g.pressOut - g.top) * 1000) * k], [vcX + g.valveChamber.L * k + sheet.p(8), cy, (slab + g.Htot + (g.pressOut - g.top) * 1000) * k], ox, oy, "PIPE");
}
