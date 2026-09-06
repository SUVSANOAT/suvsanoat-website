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
import { roundTo, type DrawingInput, type StructureModel } from "../core/types";
import { GRIT, PUMP_STATIONS, SCREENS, kmkRef, specificWaterUse } from "../../norms/kmk-2-04-03-19";
import { MBR_FINE_SCREEN } from "../../norms/uz-membrane-requirement";
import { dnFor } from "./mbr";
import { concreteVolume, construction, constructionNote, TANK_SUPPLY } from "../core/construction";

export type MechParams = {
  /** глубина проточной части песколовки H_s, м (табл. 28: 0,5–2 м) */
  gritDepthM: number;
  /** скорость в песколовке v_s, м/с (табл. 28: 0,15–0,3) */
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
  /** глубина воды в канале решётки, м — принято по практике */
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
    gritVelocityMs: GRIT.table28.horizontal.vMaxLps,
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
  /** песколовка: длина проточной части по ф. (18), полная длина корпуса, ширина лотка, ширина жировой камеры, наружная ширина корпуса, высота корпуса, мм */
  Ls: number;
  Lg: number;
  Bs: number;
  Bgrease: number;
  Wg: number;
  Hg: number;
  /** фактическая скорость в песколовке при принятой ширине, м/с */
  vActual: number;
  /** решётки: ширина канала, длина винтовой решётки, мм; фактическая скорость в прозорах, м/с */
  Bscr: number;
  Lscr: number;
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
  const lines = input.qMaxH > 40 || input.q > GRIT.requiredFromM3Day.value ? Math.max(2, GRIT.minUnits.value) : 1;
  const qLine = input.qMaxH / 3600 / lines; // м³/с на линию

  /* песколовка, ф. (18) п. 6.27: L_s = 1000·K_s·H_s·v_s/u₀ */
  const LsM = (1000 * p.ks * p.gritDepthM * p.gritVelocityMs) / p.u0MmS;
  const Ls = roundTo(LsM * 1000, 100);
  const omega = qLine / p.gritVelocityMs; // м²
  const Bs = Math.max(p.minChannelMm, roundTo((omega / p.gritDepthM) * 1000, 100));
  const vActual = qLine / ((Bs / 1000) * p.gritDepthM);
  const Bgrease = Math.max(400, roundTo(Bs * 0.8, 100)); // жировая камера — по практике
  const Lg = Ls + 2 * 600; // входная и выходная зоны по 600 — по практике
  const Wg = Bs + Bgrease + 3 * p.wallMm;
  const Hg = 600 + p.gritDepthM * 1000 + 300; // песковой бункер 600 + вода + борт 300 — по практике

  /* решётка грубая: площадь прозоров при v = 0,8–1 м/с (п. 5.14) */
  const kGap = p.coarseGapMm / (p.coarseGapMm + p.barMm);
  const Bscr = Math.max(p.minChannelMm, roundTo((qLine / (p.gapVelocityMs * p.screenWaterDepthM * kGap)) * 1000, 100));
  const vGapActual = qLine / ((Bscr / 1000) * p.screenWaterDepthM * kGap);
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
  const gritBottom = platform + 0.6;
  const gritWater = gritBottom + p.gritDepthM;
  const gritTop = gritWater + 0.3;
  const lossFine = p.fineScreen ? 0.1 : 0; // винтовая решётка тонкой очистки — по паспорту
  const lossCoarse = 0.05 * SCREENS.headLossFactor.value; // чистая решётка ≈ 0,05 м × 3 (п. 6.24)
  const lossChannels = 0.05;
  const screenWater = gritWater + lossFine + lossChannels;
  const screenBottom = screenWater - p.screenWaterDepthM;
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
    lines, Ls, Lg, Bs, Bgrease, Wg, Hg, vActual, Bscr, Lscr, vGapActual, Lrc, Wrc, Hrc,
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
  const vGrit = (g.lines * g.Bs * g.Ls * p.gritDepthM * 1000) / 1e9;
  const vRc = (g.Lrc * g.Wrc * (g.rcWater - g.rcBottom) * 1000) / 1e9;
  const headLoss = +(g.rcWater - g.gritWater).toFixed(2);
  const emptyDays = (v: number) => (v > 0 ? Math.max(1, Math.floor((p.containerM3 * g.lines) / v)) : 0);

  return {
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
      { name: "Песколовка-жироловка (стальной агрегат на платформе)", qty: `${g.lines} шт.`, spec: `лоток ${g.Bs}×${g.Ls} мм, H ${p.gritDepthM} м; жировая камера ${g.Bgrease} мм, стенка ${p.wallMm} мм`, supply: "own" },
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
      `Длина песколовки L_s = 1000·K_s·H_s·v_s/u₀ = 1000·${p.ks}·${p.gritDepthM}·${p.gritVelocityMs}/${p.u0MmS} = ${(g.Ls / 1000).toFixed(1)} м (${kmkRef("6.27", "ф. (18), табл. 27, 28")}; d = 0,2 мм, u₀ = ${p.u0MmS} мм/с, K_s = ${p.ks}, H_s = ${p.gritDepthM} м в пределах 0,5–2 м).`,
      `Ширина лотка ${g.Bs} мм: расчётная по v = ${p.gritVelocityMs} м/с ${g.vActual < GRIT.table28.horizontal.vMinLps ? `даёт менее конструктивного минимума ${p.minChannelMm} мм; фактическая скорость ${g.vActual.toFixed(3)} м/с ниже 0,15 м/с табл. 28 — длина по ф. (18) при 0,3 м/с принята в запас, типоразмер уточняется по паспорту агрегата` : `фактическая скорость ${g.vActual.toFixed(2)} м/с в пределах 0,15–0,3 м/с табл. 28`}.`,
      `Решётка грубая — прозоры ${p.coarseGapMm} мм (${SCREENS.maxGapMm.ref}), скорость в прозорах ${g.vGapActual < 0.8 ? `${g.vGapActual.toFixed(2)} м/с при конструктивной ширине канала ${g.Bscr} мм (норма 0,8–1 м/с, ${PUMP_STATIONS.screenGapVelocity.ref} — при малом расходе не достигается, принято)` : `${g.vGapActual.toFixed(2)} м/с (${PUMP_STATIONS.screenGapVelocity.ref})`}. ${p.fineScreen ? `Тонкая решётка ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм после грубой — ${MBR_FINE_SCREEN.source}.` : "Тонкая решётка не предусмотрена (биология не мембранная)."}`,
      `Резерв решёток (${PUMP_STATIONS.screenReserve.ref}): ${PUMP_STATIONS.screenReserve.rule}. Грубые решётки с ручной очисткой — ${g.lines} раб. без резерва${p.fineScreen ? `; винтовые решётки — ${g.lines} раб., резервный агрегат по табл. 22 в компоновке не размещён — принят ЗИП шнек-барабана и обводной лоток через грубую решётку (практика, уточнить на стадии П)` : ""}. Проходы между агрегатами ${g.aisle} мм, по торцам ${g.edge} мм (${kmkRef("5.16")}).`,
      `Продолжительность протока в песколовке ${(g.Ls / 1000 / p.gritVelocityMs).toFixed(0)} с при v = ${p.gritVelocityMs} м/с — не менее ${GRIT.horizontalMinRetentionS.value} с (${GRIT.horizontalMinRetentionS.ref}).`,
      `Отбросы ${(g.screeningsM3Day * 1000).toFixed(0)} л/сут при ${Math.round(g.persons)} экв. жителей (${(input.q * 1000).toFixed(0)} л/сут ÷ ${p.lpcd} л/(чел·сут), табл. 3) и 8 л/(чел·год) при прозорах 16–20 мм (${kmkRef("5.13", "табл. 23")}); ${g.screeningsM3Day < SCREENS.mechanizedFromM3Day.value ? `менее ${SCREENS.mechanizedFromM3Day.value} м³/сут — ручная очистка грубой решётки допустима (${SCREENS.mechanizedFromM3Day.ref})` : `более ${SCREENS.mechanizedFromM3Day.value} м³/сут — очистка механизированная (${SCREENS.mechanizedFromM3Day.ref})`}.`,
      `Песок ${(g.sandM3Day * 1000).toFixed(0)} л/сут при ${GRIT.sandPerCapita.lPersonDay} л/(чел·сут), влажность ${GRIT.sandPerCapita.moisture} % (${GRIT.sandPerCapita.ref}); ${g.sandM3Day < GRIT.manualRemovalUpToM3Day.value ? `менее ${GRIT.manualRemovalUpToM3Day.value} м³/сут — допускается ручное удаление (${GRIT.manualRemovalUpToM3Day.ref})` : `удаление гидромеханическое (${GRIT.manualRemovalUpToM3Day.ref})`}.`,
      `Потери напора ${headLoss.toFixed(2)} м: грубая решётка 0,05 × ${SCREENS.headLossFactor.value} = ${(0.05 * SCREENS.headLossFactor.value).toFixed(2)} м (${SCREENS.headLossFactor.ref}), винтовая решётка 0,10 м (паспорт), лотки 0,05 м (практика).`,
      `Жировая камера, песковой бункер, высота платформы ${fmtE(g.platform)} (контейнер ${p.containerMm.h} мм + зазор под балкой) и габариты контейнеров — ҚМҚ 2.04.03-19 не нормирует, приняты по практике SUVSANOAT. Подача сточной воды в приёмную камеру напорная (от КНС), вход выше уровня воды.`,
    ],
    headLoss,
    draw: (sheet) => drawMech(sheet, input, p, g),
  };
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawMech(sheet: Sheet, input: DrawingInput, p: MechParams, g: MechGeometry) {
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
    /* канал решёток */
    const yc = y0 + (g.Wg - g.Bscr) / 2;
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
    const yb = y0 + w; // лоток снизу, жировая камера сверху
    d.rect(xg + w, yb, g.Lg - 2 * w, g.Bs, "THIN");
    d.rect(xg + w, yb + g.Bs + w, g.Lg - 2 * w, g.Bgrease, "THIN");
    /* проточная часть L_s: входная/выходная зоны */
    d.line(xg + 600, yb, xg + 600, yb + g.Bs, "THIN");
    d.line(xg + 600 + g.Ls, yb, xg + 600 + g.Ls, yb + g.Bs, "THIN");
    /* песковой бункер под входной частью */
    d.rect(xg + 600, yb, Math.min(1500, g.Ls / 3), g.Bs, "HIDDEN");
    /* аэрация жировой камеры — перфорированная труба вдоль перегородки */
    d.line(xg + 600, yb + g.Bs + w + 100, xg + g.Lg - 600, yb + g.Bs + w + 100, "PIPE");
    for (let x = xg + 900; x < xg + g.Lg - 600; x += 1000) d.circle(x, yb + g.Bs + w + 100, 60, "EQUIP");
    d.text(xg + g.Lg / 2, yb + g.Bs / 2 - ts * 0.4, ts * 0.85, `ПЕСКОЛОВКА L=${g.Ls}`, { align: "center" });
    d.text(xg + g.Lg / 2, yb + g.Bs + w + g.Bgrease / 2 - ts * 0.4, ts * 0.85, "ЖИРОЛОВКА", { align: "center" });
    /* песковой контейнер под бункером в проходе */
    const ySand = yDump;
    d.rect(xg + 600 - p.containerMm.l / 2 + 750, ySand - p.containerMm.w / 2, p.containerMm.l, p.containerMm.w, "HIDDEN");
    d.line(xg + 600 + 750, yb, xg + 600 + 750, ySand, "EQUIP");
    d.text(xg + 1350, ySand + p.containerMm.w / 2 + th * 0.3, ts * 0.8, "КОНТЕЙНЕР ПЕСКА", { align: "center" });
    /* стрелка потока в лотке */
    d.arrow(xg + 1000, yb + g.Bs / 2 + ts, xg + 2500, yb + g.Bs / 2 + ts, "FLOW", 120);
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
  d.dimChainH([px, xr, xs, xg, xg + 600, xg + 600 + g.Ls, xg + g.Lg, px + g.Lp], yd, th);
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
  sheet.note(`Механическая очистка: ${g.lines} лин. — решётка грубая ${p.coarseGapMm} мм (п. 6.16)${p.fineScreen ? `, винтовая решётка ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм (перед мембранами)` : ""}, песколовка-жироловка ${g.Bs}×${g.Ls} мм (H ${p.gritDepthM} м, ф. (18) п. 6.27, табл. 27–28). Платформа ${g.Lp}×${g.Wp} мм, отм. ${fmtE(g.platform)}.`);
  sheet.note(`Отметки воды: приёмная камера ${fmtE(g.rcWater)}, канал решётки ${fmtE(g.screenWater)}, песколовка ${fmtE(g.gritWater)}; выход ${fmtE(g.outlet)}. Потери на сооружении ${(g.rcWater - g.gritWater).toFixed(2)} м.`);
  sheet.note(`Контейнеры ${2 * g.lines} шт. по ${p.containerM3} м³ под платформой: отбросы ${(g.screeningsM3Day * 1000).toFixed(0)} л/сут, песок ${(g.sandM3Day * 1000).toFixed(0)} л/сут (табл. 23, п. 6.31).`);
  sheet.note(`Винтовые решётки и воздуходувка жироловки — покупные агрегаты; приёмная камера — монолитный железобетон (стены ${p.chamberWallMm} мм, днище ${p.chamberSlabMm} мм, бетон ${construction().concreteGrade}); платформа, лотки и корпуса песколовок-жироловок — изготовление SUVSANOAT.`);
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
  d.line(xg, Z(g.gritBottom), xg + g.Lg, Z(g.gritBottom), "CONTOUR");
  d.line(xg, Z(g.gritWater), xg + g.Lg, Z(g.gritWater), "WATER");
  d.waterLevel(xg + g.Lg * 0.6, Z(g.gritWater), undefined, th);
  /* бункер песка — воронка под входной зоной, шнек в контейнер */
  const hb = Math.min(1500, g.Ls / 3);
  d.poly([[xg + 600, Z(g.gritBottom)], [xg + 600 + hb, Z(g.gritBottom)], [xg + 600 + hb / 2 + 200, yPlat], [xg + 600 + hb / 2 - 200, yPlat]], "CONTOUR", true);
  d.text(xg + g.Lg / 2, Z(g.gritBottom) + (p.gritDepthM * 1000) / 2 - ts * 0.4, ts * 0.85, `ПЕСКОЛОВКА-ЖИРОЛОВКА L=${g.Ls}`, { align: "center" });
  d.line(xg + 600, Z(g.gritBottom), xg + 600, Z(g.gritTop), "THIN");
  d.line(xg + 600 + g.Ls, Z(g.gritBottom), xg + 600 + g.Ls, Z(g.gritTop), "THIN");
  /* контейнеры под платформой */
  const cH = p.containerMm.h, cL = p.containerMm.l;
  for (const cx of [xs + 900, xg + 1350]) {
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
  d.dimChainH([x, xr, xs, xg, xg + 600, xg + 600 + g.Ls, xg + g.Lg, x + g.Lp], groundY - sheet.p(12), th);
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
    /* перегородка лоток/жировая камера */
    d.rect(x0 + w + g.Bs, Z(g.gritBottom), w, (g.gritTop - g.gritBottom) * 1000 - 100, "CONTOUR");
    d.line(x0, Z(g.gritBottom), x0 + g.Wg, Z(g.gritBottom), "CONTOUR");
    d.line(x0 + w, Z(g.gritWater), x0 + g.Wg - w, Z(g.gritWater), "WATER");
    /* песковой лоток — треугольное дно */
    d.line(x0 + w, Z(g.gritBottom), x0 + w + g.Bs / 2, Z(g.gritBottom) - 250, "THIN");
    d.line(x0 + w + g.Bs, Z(g.gritBottom), x0 + w + g.Bs / 2, Z(g.gritBottom) - 250, "THIN");
    /* аэрация у перегородки */
    d.circle(x0 + w + g.Bs + w + 100, Z(g.gritBottom) + 150, 60, "EQUIP");
    d.text(x0 + w + g.Bs / 2, Z(g.gritWater) + ts * 0.5, ts * 0.75, "ЛОТОК", { align: "center" });
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
    d.isoBox(xg + 1350 * k - (p.containerMm.l / 2) * k, yd - (p.containerMm.w / 2) * k, 0, p.containerMm.l * k, p.containerMm.w * k, p.containerMm.h * k, ox, oy, "HIDDEN");
  }
  /* подводящая труба */
  d.isoLine([-g.stairL * k - sheet.p(6), y0(0) + (g.Wrc / 2) * k, g.inlet * 1000 * k], [xr + 300 * k, y0(0) + (g.Wrc / 2) * k, g.inlet * 1000 * k], ox, oy, "PIPE");
  d.isoLine([xg + g.Lg * k, y0(0) + (p.wallMm + g.Bs / 2) * k, g.outlet * 1000 * k], [L + g.stairL * k + sheet.p(6), y0(0) + (p.wallMm + g.Bs / 2) * k, g.outlet * 1000 * k], ox, oy, "PIPE");
}
