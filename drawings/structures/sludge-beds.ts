/* ==================================================================
 * ИЛОВЫЕ ПЛОЩАДКИ — ПАРАМЕТРИЧЕСКАЯ МОДЕЛЬ И ЧЕРТЁЖ
 *
 * Карты на искусственном асфальтобетонном основании с дренажем
 * (п. 6.394 ҚМҚ 2.04.03-19). Режим: аварийные — на 20 % годового
 * количества осадка при механическом обезвоживании (п. 6.393); основные
 * — на 100 %, если обезвоживания нет.
 *
 * Нагрузка — табл. 71 (п. 6.395), аэробно стабилизированный ил на
 * асфальтобетоне с дренажем 120 кг/(м²·год), × климатический
 * коэффициент по черт. 3 (Ташкент — 1,4, принято по карте, снятой
 * приближённо). Площадь — ф. (137) п. 6.398. Число карт ≥ 8, рабочая
 * глубина 0,7–1 м, валики на 0,3 м выше, ширина валиков поверху ≥ 0,7 м
 * (1,8–2 м при механизированном ремонте), объём карты — 3-суточный
 * объём осадка при заливке не более 0,3–0,4 м (п. 6.399). Дренаж —
 * траншеи шириной до 1 м, щебень 2–6 мм, через 6–8 м, начальная
 * глубина 0,6 м, уклон 3 % (п. 6.400). Иловая вода — на очистные
 * сооружения (п. 6.401).
 * ================================================================== */

import type { Pt } from "../core/dxf";
import type { Sheet } from "../core/sheet";
import { pickScale } from "../core/sheet";
import { roundTo, type CalcStep, type DrawingInput, type StructureModel } from "../core/types";
import { SLUDGE, kmkRef } from "../../norms/kmk-2-04-03-19";
import { stabilizerDefaults, stabilizerGeometry } from "./stabilizer";
import { concreteVolume, construction, constructionNote, TANK_MATERIAL, TANK_SUPPLY } from "../core/construction";

export type SludgeBedsParams = {
  /** аварийные (20 % годового осадка, п. 6.393) или основные (100 %) */
  mode: "emergency" | "main";
  /** регион для климатического коэффициента (черт. 3) */
  region: keyof typeof SLUDGE.dryingBeds.climateFactor;
  /** рабочая глубина карты, м (0,7–1, п. 6.399) */
  workingDepthM: number;
  /** ширина валика поверху, м (≥ 0,7; 1,8–2 при механизированном ремонте) */
  bermTopM: number;
  /** заложение откосов валиков — практика */
  bermSlope: number;
  /** предельная ширина карты, м (малые ОС — не более 10, п. 6.398) */
  maxCardWidthM: number;
  /** расстояние между дренами, м (6–8, п. 6.400) */
  drainSpacingM: number;
  /** число карт, 0 — расчётное, но не менее 8 */
  cards: number;
};

export function sludgeBedsDefaults(input: DrawingInput): SludgeBedsParams {
  /* Крупная площадка (валики под проезд, широкие карты) — по количеству осадка,
     а не по исполнению корпусов: граница 300 кг СВ/сут принята по практике,
     ҚМҚ 2.04.03-19 ширину карт и валиков не нормирует. */
  const big = input.dryKg > 300;
  return {
    mode: "emergency",
    region: "tashkent",
    workingDepthM: 0.8,
    bermTopM: big ? 2.0 : 0.7,
    bermSlope: big ? 1.5 : 1.0,
    maxCardWidthM: big ? 20 : 10,
    drainSpacingM: 7,
    cards: 0,
  };
}

export type SludgeBedsGeometry = {
  dsKgDay: number; // расчётное сухое вещество на площадки, кг/сут
  share: number;
  qIn: number; // м³/сут ила (полный поток)
  loadBase: number;
  climate: number;
  load: number; // кг/(м²·год)
  areaF: number; // м² по ф. (137)
  areaVol: number; // м² по объёму карты
  cards: number;
  cardB: number; // мм, вдоль лотка
  cardL: number; // мм, поперёк
  cardArea: number; // м²
  bermTop: number; // мм
  bermBase: number;
  bermH: number; // мм над дном карты
  channelW: number;
  drains: number; // дрен на карту
  drainW: number;
  rows: number;
  cols: number;
  W: number; // габарит по подошве валиков вдоль лотка (X)
  L: number; // габарит поперёк (Y)
  bottom: number; // дно карты, м
  sludge: number; // уровень осадка
  top: number; // верх валика
  channel: number; // дно разводящего лотка
  drainOut: number; // лоток дренажного коллектора на выпуске
};

export function sludgeBedsGeometry(input: DrawingInput, p: SludgeBedsParams): SludgeBedsGeometry {
  const db = SLUDGE.dryingBeds;
  const sg = stabilizerGeometry(input, stabilizerDefaults(input));
  const share = p.mode === "emergency" ? SLUDGE.dewatering.emergencyBedsShare : 1;
  const dsKgDay = input.dryKg * share;
  const loadBase = db.aerobicStabilized.asphaltDrained;
  const climate = db.climateFactor[p.region];
  const load = loadBase * climate;
  const areaF = (dsKgDay * 365) / load; // ф. (137), м² (га·10⁴)
  const cards = Math.max(db.minCards, p.cards > 0 ? Math.round(p.cards) : db.minCards);
  /* объём карты — 3-суточный объём осадка на рабочую глубину (п. 6.399); для аварийных — полный поток */
  const areaVol = (3 * sg.qIn) / p.workingDepthM;
  const cardArea = Math.max(areaF / cards, areaVol);
  let B = Math.min(p.maxCardWidthM, Math.sqrt(cardArea / 1.25));
  B = Math.max(3, B);
  const Lm = cardArea / B;
  const cardB = roundTo(B * 1000, 500);
  const cardL = roundTo(Lm * 1000, 500);
  const bermH = (p.workingDepthM + 0.3) * 1000;
  const bermTop = p.bermTopM * 1000;
  const bermBase = bermTop + 2 * p.bermSlope * bermH;
  const channelW = 600;
  const rows = 2;
  const cols = Math.ceil(cards / rows);
  const drains = Math.max(1, Math.ceil(cardB / (p.drainSpacingM * 1000)));
  const W = cols * cardB + (cols + 1) * bermBase;
  const L = rows * cardL + (rows + 1) * bermBase + channelW;
  const bottom = 0;
  return {
    dsKgDay, share, qIn: sg.qIn, loadBase, climate, load, areaF, areaVol, cards, cardB, cardL,
    cardArea: (cardB * cardL) / 1e6, bermTop, bermBase, bermH, channelW, drains, drainW: 600, rows, cols, W, L,
    bottom, sludge: bottom + p.workingDepthM, top: bottom + bermH / 1000, channel: bottom + p.workingDepthM + 0.35, drainOut: bottom - 0.6 - 0.03 * (cardL / 1000) - 0.2,
  };
}

/** масштаб листа: план ≤ 340 мм бумаги по ширине; под планом — два разреза в укрупнённом масштабе (~ 2×70 мм) */
function fitScale(planW: number, planH: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => planW / s <= 340 && planH / s <= 300) ?? pickScale(planW, planH);
}

/** масштаб разрезов: фрагмент шириной fragMm должен лечь в 300 мм бумаги */
function sectionScale(fragMm: number): number {
  const row = [20, 25, 50, 75, 100, 150, 200];
  return row.find((s) => fragMm / s <= 300) ?? 200;
}

export function sludgeBedsScale(input: DrawingInput, overrides: Partial<SludgeBedsParams> = {}): number {
  const g = sludgeBedsGeometry(input, { ...sludgeBedsDefaults(input), ...overrides });
  return fitScale(g.W, g.L);
}

export function sludgeBedsModel(input: DrawingInput, overrides: Partial<SludgeBedsParams> = {}): StructureModel {
  const p = { ...sludgeBedsDefaults(input), ...overrides };
  const g = sludgeBedsGeometry(input, p);
  const c = construction();
  /* монолитный разводящий лоток вдоль карт: бетон по его развёртке */
  const cv = concreteVolume(c, { shape: "rect", w: g.channelW + 2 * c.wallMm, l: g.W }, g.channelW + 300);
  const db = SLUDGE.dryingBeds;
  const model: StructureModel = {
    id: "sludge-beds",
    kind: "sludge-beds",
    name: p.mode === "emergency" ? "Иловые площадки аварийные" : "Иловые площадки",
    supply: TANK_SUPPLY,
    material: TANK_MATERIAL,
    footprint: { shape: "rect", w: g.L, l: g.W },
    bottom: g.bottom,
    water: g.sludge,
    top: g.top,
    ground: 0,
    nozzles: [
      { role: "sludge", dn: 150, side: "W", pos: g.L / 2, elev: g.channel },
      { role: "drain", dn: 150, side: "E", pos: g.bermBase / 2, elev: g.drainOut },
    ],
    volumes: [
      { name: `Карта ${g.cardB}×${g.cardL} мм, рабочий объём`, m3: (g.cardArea * p.workingDepthM) },
      { name: `Итого ${g.cards} карт`, m3: g.cardArea * p.workingDepthM * g.cards },
      { name: `Полезная площадь, м² (${g.cards}×${g.cardArea.toFixed(0)})`, m3: g.cardArea * g.cards },
      { name: "Требуемая площадь по ф. (137), м²", m3: g.areaF },
      { name: "Бетон стен разводящего лотка", m3: cv.walls },
      { name: "Бетон днища разводящего лотка", m3: cv.slab },
      { name: "Бетонная подготовка лотка", m3: cv.lean },
      { name: "Итого бетон, м³", m3: cv.total },
      { name: "Арматура, кг", m3: cv.total * c.rebarKgM3 },
    ],
    equipment: [
      { name: "Основание асфальтобетонное по щебню с дренажными траншеями", qty: `${g.cards} карт`, spec: `${g.cardB}×${g.cardL} мм`, supply: "supply" },
      { name: "Валики грунтовые с укреплением", qty: "по плану", spec: `h=${g.bermH} мм, поверху ${g.bermTop} мм`, supply: "supply" },
      { name: "Лоток разводящий железобетонный монолитный", qty: `${(g.W / 1000).toFixed(1)} м`, spec: `сечение ${g.channelW} мм, уклон ≥ 0,01, бетон ${c.concreteGrade}`, supply: TANK_SUPPLY },
      { name: "Затворы щитовые на выпусках в карты", qty: `${g.cards} шт.`, spec: "с ручным приводом", supply: "own" },
      { name: "Дренаж: перфорированные трубы DN100 в щебне 2–6 мм", qty: `${g.cards * g.drains} дрен`, spec: `траншея ${g.drainW} мм, глубина 0,6 м, уклон 3 %`, supply: "supply" },
      { name: "Коллектор дренажных вод DN150 → иловая вода в голову сооружений", qty: "1", supply: "supply" },
    ],
    basis: [
      constructionNote(c),
      `${p.mode === "emergency" ? `Аварийные площадки на ${(g.share * 100).toFixed(0)} % годового осадка (${kmkRef("6.393")})` : "Основные площадки на 100 % осадка"}: ${g.dsKgDay.toFixed(0)} кг СВ/сут аэробно стабилизированного ила.`,
      `Нагрузка ${g.loadBase} кг/(м²·год) — асфальтобетонное основание с дренажем (${db.ref}, табл. 71) × климатический коэффициент ${g.climate} (черт. 3, ${p.region === "tashkent" ? "Ташкент" : p.region}; снят с карты приближённо — уточнить по региону) = ${g.load.toFixed(0)} кг/(м²·год).`,
      `Площадь по ф. (137) ${kmkRef("6.398")}: F = ${g.dsKgDay.toFixed(0)}·365/${g.load.toFixed(0)} = ${g.areaF.toFixed(0)} м²; карт ${g.cards} (не менее 8 — ${kmkRef("6.399")}).`,
      `Объём карты — 3-суточный объём ила ${g.qIn.toFixed(1)} м³/сут на рабочую глубину ${p.workingDepthM} м (${kmkRef("6.399")}) — ${g.areaVol.toFixed(0)} м² на карту${g.areaVol > g.areaF / g.cards ? " (определяет размер карты)" : ""}; принято ${g.cardB}×${g.cardL} мм = ${g.cardArea.toFixed(0)} м².`,
      `Валики на 0,3 м выше рабочего уровня, поверху ${p.bermTopM} м (${kmkRef("6.399")}), откосы 1:${p.bermSlope} (практика); дренаж через ${p.drainSpacingM} м, траншеи ${g.drainW} мм, щебень 2–6 мм, глубина 0,6 м, уклон 3 % (${kmkRef("6.400")}); иловая вода — на очистные сооружения (${kmkRef("6.401")}).`,
      `Ширина карты не более ${p.maxCardWidthM} м, отношение сторон 1,25 (${kmkRef("6.398")}); подача ила в лоток насосами стабилизатора; отметка дна карт 0.000 — принято (уточняется по УГВ: не менее 1,5 м при естественном основании, ${kmkRef("6.397")}).`,
    ],
    calc: sludgeBedsCalc(input, p, g),
    headLoss: 0.4,
    draw: (sheet) => drawBeds(sheet, input, p, g, model),
  };
  return model;
}

/* ==================================================================
 * ВЕДОМОСТЬ РАСЧЁТА — печатается таблицей на листе
 * ================================================================== */

const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
const f0 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

function sludgeBedsCalc(input: DrawingInput, p: SludgeBedsParams, g: SludgeBedsGeometry): CalcStep[] {
  const db = SLUDGE.dryingBeds;
  const cardsOk = g.cards >= db.minCards;
  const widthOk = g.cardB / 1000 <= p.maxCardWidthM + 1e-6;
  const volGoverns = g.areaVol > g.areaF / g.cards;
  const B = Math.max(3, Math.min(p.maxCardWidthM, Math.sqrt(Math.max(g.areaF / g.cards, g.areaVol) / 1.25)));
  const steps: CalcStep[] = [
    /* ---------- исходные данные ---------- */
    { kind: "input", what: "Избыточный ил (сухое вещество)", symbol: "P ил", value: f0(input.dryKg), unit: "кг СВ/сут", ref: "расчёт биологической очистки (анкета объекта)" },
    { kind: "input", what: "Полный поток ила из стабилизатора", symbol: "Q ил", value: f1(g.qIn), unit: "м³/сут", ref: "расчёт аэробного стабилизатора (stabilizerGeometry)" },
    { kind: "input", what: "Режим площадок", value: p.mode === "emergency" ? "аварийные" : "основные", ref: p.mode === "emergency" ? kmkRef("6.393") : "механическое обезвоживание отсутствует — площадки основные" },
    { kind: "input", what: "Рабочая глубина карты", symbol: "h", value: f1(p.workingDepthM), unit: "м", ref: `${kmkRef("6.399")}: ${db.workingDepthM[0]}–${db.workingDepthM[1]} м` },
    { kind: "input", what: "Расстояние между дренами", symbol: "l др", value: f1(p.drainSpacingM), unit: "м", ref: `${kmkRef("6.400")}: 6–8 м` },
    { kind: "input", what: "Предельная ширина карты", symbol: "B max", value: f1(p.maxCardWidthM), unit: "м", ref: `${kmkRef("6.398")}; граница по количеству осадка (300 кг СВ/сут) — принято по практике` },

    /* ---------- расчёт ---------- */
    {
      kind: "calc", what: "Расчётное сухое вещество на площадки", symbol: "P расч",
      formula: p.mode === "emergency" ? "P расч = P ил · 0,2" : "P расч = P ил",
      substitution: p.mode === "emergency" ? `P расч = ${f0(input.dryKg)} · ${g.share}` : `P расч = ${f0(input.dryKg)}`,
      value: f0(g.dsKgDay), unit: "кг СВ/сут", ref: p.mode === "emergency" ? kmkRef("6.393") : "100 % годового осадка",
    },
    {
      kind: "calc", what: "Нагрузка на 1 м² в год (базовая)", symbol: "q0",
      formula: "по табл. 71 — аэробно стабилизированный ил, асфальтобетон с дренажем",
      substitution: "9 °C, слой осадка до 500 мм",
      value: f0(g.loadBase), unit: "кг/(м²·год)", ref: `${db.ref}, табл. 71`,
    },
    {
      kind: "calc", what: "Климатический коэффициент", symbol: "k клим",
      formula: "по черт. 3 (регион площадки)",
      substitution: `регион: ${p.region === "tashkent" ? "Ташкент" : p.region}`,
      value: f1(g.climate), unit: "", ref: `${db.ref}, черт. 3 (снят с карты приближённо)`,
    },
    {
      kind: "calc", what: "Расчётная нагрузка", symbol: "q",
      formula: "q = q0 · k клим",
      substitution: `q = ${f0(g.loadBase)} · ${f1(g.climate)}`,
      value: f0(g.load), unit: "кг/(м²·год)", ref: `${db.ref}, табл. 71; черт. 3`,
    },
    {
      kind: "calc", what: "Требуемая площадь площадок", symbol: "F",
      formula: "F = P расч · 365 / q",
      substitution: `F = ${f0(g.dsKgDay)} · 365 / ${f0(g.load)}`,
      value: f0(g.areaF), unit: "м²", ref: `${kmkRef("6.398")}, ф. (137)`,
    },
    {
      kind: "calc", what: "Число карт (принято)", symbol: "n карт",
      formula: "n карт ≥ 8",
      substitution: "принято по расчётной площади, не менее 8",
      value: String(g.cards), unit: "шт.", ref: kmkRef("6.399"),
    },
    {
      kind: "check", what: "Проверка числа карт",
      formula: "n карт ≥ 8",
      substitution: `n карт = ${g.cards}`,
      value: cardsOk ? "выполняется" : "НЕ выполняется",
      ref: kmkRef("6.399"),
    },
    {
      kind: "calc", what: "Площадь карты по нагрузке", symbol: "F/n",
      formula: "= F / n карт",
      substitution: `${f0(g.areaF)} / ${g.cards}`,
      value: f0(g.areaF / g.cards), unit: "м²", ref: "",
    },
    {
      kind: "calc", what: "Площадь карты по объёму осадка", symbol: "F об",
      formula: "F об = 3 · Q ил / h (3-суточный объём при заливке не более 0,3–0,4 м)",
      substitution: `F об = 3 · ${f1(g.qIn)} / ${f1(p.workingDepthM)}`,
      value: f0(g.areaVol), unit: "м²", ref: kmkRef("6.399"),
    },
    {
      kind: "calc", what: "Площадь одной карты (принятая)", symbol: "F карты",
      formula: "F карты = max(F/n карт, F об)",
      substitution: volGoverns ? `определяет объём осадка: ${f0(g.areaVol)} м²` : `определяет нагрузка: ${f0(g.areaF / g.cards)} м²`,
      value: f0(Math.max(g.areaF / g.cards, g.areaVol)), unit: "м²", ref: "",
    },
    {
      kind: "calc", what: "Ширина карты", symbol: "B",
      formula: "B = min(B max, √(F карты / 1,25)), не менее 3 м",
      substitution: `B = √(${f0(Math.max(g.areaF / g.cards, g.areaVol))} / 1,25) = ${B.toFixed(2)} м`,
      value: f0(g.cardB), unit: "мм", ref: `${kmkRef("6.398")}: отношение сторон 1,25, ширина не более ${p.maxCardWidthM} м (принято по практике для крупных ОС); округление до 500 мм`,
    },
    {
      kind: "check", what: "Проверка ширины карты",
      formula: `B ≤ ${p.maxCardWidthM} м`,
      substitution: `B = ${(g.cardB / 1000).toFixed(2)} м`,
      value: widthOk ? "выполняется" : "НЕ выполняется",
      ref: kmkRef("6.398"),
    },
    {
      kind: "calc", what: "Длина карты", symbol: "L",
      formula: "L = F карты / B",
      substitution: `L = ${f0(Math.max(g.areaF / g.cards, g.areaVol))} / ${B.toFixed(2)}`,
      value: f0(g.cardL), unit: "мм", ref: "округление до 500 мм",
    },
    {
      kind: "calc", what: "Высота валика над дном карты", symbol: "H вал",
      formula: "H вал = (h + 0,3) · 1000",
      substitution: `H вал = (${f1(p.workingDepthM)} + 0,3) · 1000`,
      value: f0(g.bermH), unit: "мм", ref: kmkRef("6.399"),
    },
    {
      kind: "calc", what: "Ширина валика по подошве", symbol: "B осн",
      formula: "B осн = B верх + 2 · m · H вал",
      substitution: `B осн = ${g.bermTop} + 2 · ${p.bermSlope} · ${f0(g.bermH)}`,
      value: f0(g.bermBase), unit: "мм", ref: `ширина поверху ${p.bermTopM} м — ${kmkRef("6.399")}; заложение откосов 1:${p.bermSlope} — принято по практике`,
    },
    {
      kind: "calc", what: "Число дренажных траншей на карту", symbol: "n др",
      formula: "n др = ⌈B / l др⌉",
      substitution: `n др = ⌈${f0(g.cardB)} / (${f1(p.drainSpacingM)} · 1000)⌉`,
      value: String(g.drains), unit: "шт.", ref: kmkRef("6.400"),
    },
    {
      kind: "calc", what: "Габарит площадок по подошве валиков",
      formula: "W = n стб · B + (n стб+1) · B осн; L габ = n ряд · L + (n ряд+1) · B осн + b лотка",
      substitution: `W = ${g.cols} · ${f0(g.cardB)} + ${g.cols + 1} · ${f0(g.bermBase)}; L = ${g.rows} · ${f0(g.cardL)} + ${g.rows + 1} · ${f0(g.bermBase)} + ${g.channelW}`,
      value: `${f0(g.W)} × ${f0(g.L)}`, unit: "мм", ref: "разводящий лоток 600 мм между рядами карт — принято по практике",
    },
    {
      kind: "calc", what: "Отметки: дно карты / осадок / верх валика / дно лотка / выпуск дренажа",
      formula: "осадок = дно + h; верх = дно + H вал; лоток = дно + h + 0,35; выпуск = дно − 0,6 − 0,03·L − 0,2",
      substitution: `дно = ${g.bottom.toFixed(3)} м (0.000 — принято, уточняется по УГВ, ${kmkRef("6.397")})`,
      value: `${g.bottom.toFixed(3)} / ${g.sludge.toFixed(3)} / +${g.top.toFixed(3)} / ${g.channel.toFixed(3)} / ${g.drainOut.toFixed(3)}`,
      unit: "м", ref: "0.000 — планировочная отметка площадки",
    },
  ];
  return steps;
}

function fmtE(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawBeds(sheet: Sheet, input: DrawingInput, p: SludgeBedsParams, g: SludgeBedsGeometry, model: StructureModel) {
  const d = sheet.d;
  const th = sheet.th, ts = sheet.ts;
  const f = sheet.field;
  const bb = g.bermBase, bt = g.bermTop, off = (bb - bt) / 2;

  /* ---------------- ПЛАН ---------------- */
  const px = f.x0 + sheet.p(35);
  const py = f.y0 + f.h - sheet.p(40) - g.L;
  sheet.viewTitle(px, py + g.L + sheet.p(16), "ПЛАН");
  /* подошва валиков — наружный контур */
  d.rect(px, py, g.W, g.L, "THIN");
  /* разводящий лоток посредине по X */
  const yCh = py + bb + g.cardL + bb; // низ лотка
  d.rect(px - sheet.p(10), yCh, g.W + sheet.p(10), g.channelW, "CONTOUR");
  d.line(px - sheet.p(10), yCh + g.channelW / 2, px + g.W, yCh + g.channelW / 2, "FLOW");
  d.arrow(px - sheet.p(18), yCh + g.channelW / 2, px - sheet.p(10), yCh + g.channelW / 2, "FLOW", sheet.p(2));
  d.text(px - sheet.p(2), yCh + g.channelW + th * 0.6, ts, "ИЛ ОТ СТАБИЛИЗАТОРА DN150", { align: "right" });
  d.text(px + g.W / 2, yCh + g.channelW + th * 0.5, ts * 0.9, "РАЗВОДЯЩИЙ ЛОТОК, i≥0,01", { align: "center" });
  /* карты */
  let n = 0;
  const cardXY: { x: number; y: number }[] = [];
  for (let r = 0; r < g.rows; r++) {
    const y0 = r === 0 ? py + bb : yCh + g.channelW + bb;
    for (let c = 0; c < g.cols; c++) {
      if (n >= g.cards) break;
      const x0 = px + bb + c * (g.cardB + bb);
      cardXY.push({ x: x0, y: y0 });
      /* дно карты и бровки валика */
      d.rect(x0, y0, g.cardB, g.cardL, "CONTOUR");
      d.rect(x0 - off, y0 - off, g.cardB + 2 * off, g.cardL + 2 * off, "THIN");
      d.rect(x0 - bb + bt + off, y0 - bb + bt + off, g.cardB + 2 * (bb - bt - off), g.cardL + 2 * (bb - bt - off), "THIN");
      /* дренажные траншеи вдоль L */
      for (let k = 0; k < g.drains; k++) {
        const xd = x0 + ((k + 0.5) * g.cardB) / g.drains;
        d.line(xd - g.drainW / 2, y0, xd - g.drainW / 2, y0 + g.cardL, "HIDDEN");
        d.line(xd + g.drainW / 2, y0, xd + g.drainW / 2, y0 + g.cardL, "HIDDEN");
        d.line(xd, y0, xd, y0 + g.cardL, "PIPE");
      }
      /* выпуск из лотка: щитовой затвор */
      const yg = r === 0 ? y0 + g.cardL + off : y0 - off;
      d.rect(x0 + g.cardB / 2 - 250, yg - 150, 500, 300, "EQUIP");
      d.line(x0 + g.cardB / 2, r === 0 ? yCh : yCh + g.channelW, x0 + g.cardB / 2, r === 0 ? y0 + g.cardL : y0, "PIPE");
      d.text(x0 + g.cardB / 2, y0 + g.cardL / 2 + ts * 0.3, th, `КАРТА ${n + 1}`, { align: "center" });
      d.text(x0 + g.cardB / 2, y0 + g.cardL / 2 - th * 1.2, ts * 0.9, `${g.cardB}×${g.cardL}`, { align: "center" });
      n++;
    }
  }
  /* дренажный коллектор вдоль внешних сторон → выпуск справа */
  const yColN = py + g.L + sheet.p(4), yColS = py - sheet.p(4);
  d.line(px, yColN, px + g.W + sheet.p(8), yColN, "PIPE");
  d.line(px, yColS, px + g.W + sheet.p(8), yColS, "PIPE");
  d.line(px + g.W + sheet.p(8), yColS, px + g.W + sheet.p(8), yColN, "PIPE");
  d.arrow(px + g.W + sheet.p(8), yCh + g.channelW / 2, px + g.W + sheet.p(16), yCh + g.channelW / 2, "FLOW", sheet.p(2));
  d.text(px + g.W + sheet.p(9), yCh + g.channelW / 2 + th * 0.8, ts, "ИЛОВАЯ ВОДА DN150", { align: "left" });
  d.text(px + g.W + sheet.p(9), yCh + g.channelW / 2 - th * 1.2, ts * 0.9, "В ГОЛОВУ СООРУЖЕНИЙ", { align: "left" });
  for (const c of cardXY) {
    for (let k = 0; k < g.drains; k++) {
      const xd = c.x + ((k + 0.5) * g.cardB) / g.drains;
      const toN = c.y > yCh;
      d.line(xd, toN ? c.y + g.cardL : c.y, xd, toN ? yColN : yColS, "PIPE");
    }
  }
  d.text(px + g.W / 2, yColN + th * 0.5, ts * 0.9, "КОЛЛЕКТОР ДРЕНАЖА DN150", { align: "center" });
  /* размеры */
  const yd = py - sheet.p(14);
  const xs = [px];
  for (let c = 0; c < g.cols; c++) xs.push(px + bb + c * (g.cardB + bb), px + bb + c * (g.cardB + bb) + g.cardB);
  xs.push(px + g.W);
  d.dimChainH(xs, yd, th);
  d.dimH(px, px + g.W, yd - sheet.p(9), `${g.W}`, th);
  const xd = px + g.W + sheet.p(40);
  d.dimChainV(xd, [py, py + bb, py + bb + g.cardL, yCh, yCh + g.channelW, yCh + g.channelW + bb, yCh + g.channelW + bb + g.cardL, py + g.L], th);
  d.dimV(xd + sheet.p(9), py, py + g.L, `${g.L}`, th);
  /* марки разрезов */
  const x11 = px + bb + g.cardB * 0.7;
  d.sectionMark(x11, py - sheet.p(24), x11, py + g.L + sheet.p(10), "1", th, 1);
  const y22 = py + bb + g.cardL * 0.4;
  d.sectionMark(px - sheet.p(6), y22, px + g.W + sheet.p(22), y22, "2", th, -1);
  d.northArrow(px + g.W - sheet.p(4), py + g.L + sheet.p(20), sheet.p(8));

  /* ---------------- РАЗРЕЗ 1-1 (поперёк карт, через лоток) — укрупнённый масштаб ---------------- */
  const H = g.bermH;
  const frag1 = bb + g.cardL + bb + g.channelW + bb + g.cardL / 3;
  const frag2 = 3 * bb + 2 * g.cardB;
  const sScale = sectionScale(Math.max(frag1, frag2));
  const m = sheet.s / sScale; // множитель модельных мм для разрезов
  const secH = (H + 1200 + 800) * m;
  const sy = py - sheet.p(45) - secH;
  sheet.viewTitle(px, sy + secH + sheet.p(10), "РАЗРЕЗ 1-1", sScale);
  sectionAcross(sheet, px, sy, g, p, m);

  /* ---------------- РАЗРЕЗ 2-2 (вдоль лотка, по картам) ---------------- */
  const sy2 = sy - sheet.p(40) - secH;
  sheet.viewTitle(px, sy2 + secH + sheet.p(10), "РАЗРЕЗ 2-2", sScale);
  sectionAlong(sheet, px, sy2, g, m);

  /* ---------------- ИЗОМЕТРИЯ ---------------- */
  const isoLeft = px + g.W + sheet.p(75);
  const avail = f.x0 + f.w - sheet.p(10) - isoLeft;
  const k = Math.min(0.5, avail / ((g.W + g.L) * Math.cos(Math.PI / 6)));
  const ix = isoLeft + g.L * k * Math.cos(Math.PI / 6);
  const isoH = (H * 3) * k + (g.W + g.L) * k * 0.5;
  const iy = py + g.L - isoH;
  sheet.viewTitle(isoLeft, py + g.L + sheet.p(16), "ИЗОМЕТРИЯ (без масштаба)", "none");
  isoView(sheet, ix, iy, g, k, yCh - py);

  sheet.note(`Иловые площадки ${p.mode === "emergency" ? "аварийные (20 % годового осадка, п. 6.393)" : "основные"}: ${g.cards} карт ${g.cardB}×${g.cardL} мм (${g.cardArea.toFixed(0)} м²), рабочая глубина ${p.workingDepthM} м, валики h=${g.bermH} мм поверху ${g.bermTop} мм (п. 6.399).`);
  sheet.note(`Нагрузка ${g.loadBase}×${g.climate} = ${g.load.toFixed(0)} кг/(м²·год) (табл. 71, черт. 3 — Ташкент, принято); требуемая площадь ${g.areaF.toFixed(0)} м² по ф. (137); размер карты определён ${g.areaVol > g.areaF / g.cards ? "3-суточным объёмом ила" : "площадью по нагрузке"}.`);
  sheet.note(`Основание — асфальтобетон 50 мм по щебню 150 мм; дренаж — траншеи ${g.drainW} мм со щебнем 2–6 мм и трубами DN100, глубина 0,6 м, уклон 3 %, через ${p.drainSpacingM} м (п. 6.400); иловая вода — в голову сооружений (п. 6.401).`);
  sheet.note(`Отметки: дно карт ${fmtE(g.bottom)}, осадок ${fmtE(g.sludge)}, верх валиков ${fmtE(g.top)}, дно лотка ${fmtE(g.channel)}, выпуск дренажа ${fmtE(g.drainOut)}. УГВ и тип основания — по изысканиям (п. 6.397).`);
  /* ведомость расчёта — в свободном поле под разрезами и изометрией */
  const calcY = Math.min(sy2, iy) - sheet.p(30);
  if (model.calc) sheet.calcTable(px, calcY, model.calc);

  sheet.legend([
    { layer: "CONTOUR", text: "дно карты, лоток" },
    { layer: "THIN", text: "бровки и подошва валиков" },
    { layer: "HIDDEN", text: "дренажные траншеи" },
    { layer: "PIPE", text: "дрены и коллектор" },
    { layer: "WATER", text: "уровень осадка" },
    { layer: "HATCH", text: "грунт валиков / щебень" },
  ] as { layer: "CONTOUR" | "HATCH" | "WATER" | "PIPE" | "EQUIP" | "SITE"; text: string }[]);
  void input;
}

/* трапеция валика: x — центр подошвы, y — низ, m — множитель масштаба разреза */
function berm(x: number, y: number, g: SludgeBedsGeometry, m: number): Pt[] {
  const bb = g.bermBase * m, bt = g.bermTop * m, H = g.bermH * m;
  return [[x - bb / 2, y], [x + bb / 2, y], [x + bt / 2, y + H], [x - bt / 2, y + H]];
}

/* линия обрыва */
function breakLine(sheet: Sheet, x: number, y1: number, y2: number) {
  const d = sheet.d;
  const a = sheet.p(1.5);
  const ym = (y1 + y2) / 2;
  d.poly([[x, y1], [x, ym - a], [x - a, ym - a / 2], [x + a, ym + a / 2], [x, ym + a], [x, y2]], "THIN", false);
}

function sectionAcross(sheet: Sheet, x: number, y: number, g: SludgeBedsGeometry, p: SludgeBedsParams, m: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const bb = g.bermBase * m, H = g.bermH * m, cardL = g.cardL * m, chW = g.channelW * m;
  const yb = y + 1200 * m; // дно карты = планировка
  const xEnd = x + bb + cardL + bb + chW + bb + cardL / 3;
  d.groundLine(x - sheet.p(12), x, yb, sheet.p(3), sheet.p(3));
  /* валики: крайний, у лотка (лоток на нём), правый у лотка */
  for (const bx of [x + bb / 2, x + bb + cardL + bb / 2, x + bb + cardL + bb + chW + bb / 2]) {
    const poly = berm(bx, yb, g, m);
    d.poly(poly, "CONTOUR", true);
    d.hatch(poly, sheet.p(1.5), 45);
  }
  /* карта: асфальтобетон + щебень, дрена вдоль L с уклоном 3 % */
  const cards: [number, number][] = [[x + bb, cardL], [x + bb + cardL + bb + chW + bb, cardL / 3]];
  cards.forEach(([cx, len], i) => {
    d.line(cx, yb, cx + len, yb, "CONTOUR");
    d.line(cx, yb - 50 * m, cx + len, yb - 50 * m, "THIN");
    d.line(cx, yb - 200 * m, cx + len, yb - 200 * m, "THIN");
    d.hatch([[cx, yb - 200 * m], [cx + len, yb - 200 * m], [cx + len, yb - 50 * m], [cx, yb - 50 * m]], sheet.p(1.2), 45);
    const yd1 = yb - 600 * m, yd2 = yd1 - 0.03 * len;
    d.line(cx, yd1, cx + len, yd2, "PIPE");
    d.line(cx, yd1 - 100 * m, cx + len, yd2 - 100 * m, "PIPE");
    d.line(cx, yd1 + 300 * m, cx + len, yd2 + 300 * m, "HIDDEN");
    d.line(cx, yd1 - 300 * m, cx + len, yd2 - 300 * m, "HIDDEN");
    const ys = yb + p.workingDepthM * 1000 * m;
    d.line(cx, ys, cx + len, ys, "WATER");
    if (i === 0) {
      d.waterLevel(cx + len * 0.3, ys, undefined, th);
      d.text(cx + len / 2, yd2 - 300 * m - th * 1.3, ts * 0.9, "ДРЕНА DN100 В ТРАНШЕЕ СО ЩЕБНЕМ 2–6 мм, i=0,03", { align: "center" });
      d.text(cx + len / 2, yb + 120 * m, ts * 0.9, "АСФАЛЬТОБЕТОН 50 ПО ЩЕБНЮ 150", { align: "center" });
      d.text(cx + len / 2, ys + th * 0.6, ts, `ОСАДОК, РАБОЧАЯ ГЛУБИНА ${p.workingDepthM * 1000}`, { align: "center" });
    }
  });
  breakLine(sheet, xEnd, yb - 1000 * m, yb + H + 200 * m);
  /* разводящий лоток на валике между рядами */
  const chX = x + bb + cardL + bb;
  const chY = yb + (g.channel - g.bottom) * 1000 * m;
  const t = 150 * m, hL = 500 * m;
  const lot: Pt[] = [[chX - t, chY + hL], [chX - t, chY - t], [chX + chW + t, chY - t], [chX + chW + t, chY + hL], [chX + chW, chY + hL], [chX + chW, chY], [chX, chY], [chX, chY + hL]];
  d.poly(lot, "CONTOUR", true);
  d.concrete(lot, sheet.p(1.2));
  const under = berm(chX + chW / 2, yb, g, m);
  d.poly(under, "CONTOUR", true);
  d.hatch(under, sheet.p(1.5), 45);
  d.line(chX, chY + 350 * m, chX + chW, chY + 350 * m, "WATER");
  d.text(chX + chW / 2, chY + hL + th * 0.6, ts, "РАЗВОДЯЩИЙ ЛОТОК", { align: "center" });
  /* выпуски в карты: труба через валик с щитовым затвором */
  for (const s of [-1, 1]) {
    const x1 = s < 0 ? chX : chX + chW;
    const x2 = x1 + s * (bb / 2 + 300 * m);
    d.line(x1, chY + 100 * m, x2, chY - 200 * m, "PIPE");
    d.line(x1, chY + 200 * m, x2, chY - 100 * m, "PIPE");
    d.rect(x1 + s * 100 * m - 60 * m, chY + 200 * m, 120 * m, 350 * m, "EQUIP");
  }
  d.text(chX + chW + bb / 2 + 400 * m, chY - 200 * m - th * 1.2, ts * 0.9, "ВЫПУСК DN150 С ЗАТВОРОМ", { align: "left" });
  /* отметки и размеры */
  d.elevMark(x - sheet.p(8), yb, "0.000", th, -1);
  d.elevMark(x + bb / 2 + sheet.p(4), yb + H, fmtE(g.top), th, 1);
  d.elevMark(x + bb + cardL * 0.7, yb + p.workingDepthM * 1000 * m, fmtE(g.sludge), th, 1);
  d.elevMark(chX + chW + t + sheet.p(2), chY, fmtE(g.channel), th, -1);
  d.dimChainV(x - sheet.p(20), [yb - 600 * m, yb, yb + p.workingDepthM * 1000 * m, yb + H], th, ["600", `${p.workingDepthM * 1000}`, "300"]);
  d.dimChainH([x, x + bb, x + bb + cardL, chX, chX + chW, chX + chW + bb], y - sheet.p(6), th, [`${g.bermBase}`, `${g.cardL}`, `${g.bermBase}`, `${g.channelW}`, `${g.bermBase}`]);
  const bt = g.bermTop * m;
  d.dimH(x + bb / 2 - bt / 2, x + bb / 2 + bt / 2, yb + H + sheet.p(8), `${g.bermTop}`, th);
  d.text(x + bb * 0.8, yb + H * 0.45, ts * 0.9, `1:${p.bermSlope}`, { align: "left" });
}

function sectionAlong(sheet: Sheet, x: number, y: number, g: SludgeBedsGeometry, m: number) {
  const d = sheet.d, th = sheet.th, ts = sheet.ts;
  const bb = g.bermBase * m, H = g.bermH * m, cardB = g.cardB * m, dw = g.drainW * m;
  const yb = y + 1200 * m;
  const cols = Math.min(2, g.cols);
  const W = cols * cardB + (cols + 1) * bb;
  d.groundLine(x - sheet.p(12), x, yb, sheet.p(3), sheet.p(3));
  d.groundLine(x + W, x + W + sheet.p(12), yb, sheet.p(3), sheet.p(3));
  for (let c = 0; c <= cols; c++) {
    const poly = berm(x + bb / 2 + c * (cardB + bb), yb, g, m);
    d.poly(poly, "CONTOUR", true);
    d.hatch(poly, sheet.p(1.5), 45);
  }
  for (let c = 0; c < cols; c++) {
    const cx = x + bb + c * (cardB + bb);
    d.line(cx, yb, cx + cardB, yb, "CONTOUR");
    d.line(cx, yb - 200 * m, cx + cardB, yb - 200 * m, "THIN");
    d.hatch([[cx, yb - 200 * m], [cx + cardB, yb - 200 * m], [cx + cardB, yb - 50 * m], [cx, yb - 50 * m]], sheet.p(1.2), 45);
    for (let k = 0; k < g.drains; k++) {
      const xd = cx + ((k + 0.5) * cardB) / g.drains;
      const trench: Pt[] = [[xd - dw / 2, yb - 200 * m], [xd + dw / 2, yb - 200 * m], [xd + dw / 2, yb - 800 * m], [xd - dw / 2, yb - 800 * m]];
      d.poly(trench, "CONTOUR", true);
      d.hatch(trench, sheet.p(1), 0);
      d.circle(xd, yb - 700 * m, 50 * m, "PIPE");
    }
    const ys = yb + (g.sludge - g.bottom) * 1000 * m;
    d.line(cx, ys, cx + cardB, ys, "WATER");
    d.text(cx + cardB / 2, yb + 250 * m, ts, `КАРТА ${c + 1}`, { align: "center" });
  }
  d.text(x + W / 2, yb - 800 * m - th * 1.4, ts * 0.9, `ДРЕНАЖНЫЕ ТРАНШЕИ ${g.drainW} мм, ЩЕБЕНЬ 2–6 мм, ЧЕРЕЗ ≤ 7 м`, { align: "center" });
  d.elevMark(x - sheet.p(8), yb, "0.000", th, -1);
  d.elevMark(x + W + sheet.p(8), yb + H, fmtE(g.top), th, 1);
  d.elevMark(x + W + sheet.p(8), yb - 800 * m, fmtE(g.bottom - 0.8), th, -1);
  const xs = [x], labels: string[] = [];
  for (let c = 0; c < cols; c++) { xs.push(x + bb + c * (cardB + bb), x + bb + c * (cardB + bb) + cardB); labels.push(`${g.bermBase}`, `${g.cardB}`); }
  xs.push(x + W); labels.push(`${g.bermBase}`);
  d.dimChainH(xs, y - sheet.p(6), th, labels);
  d.dimChainV(x - sheet.p(20), [yb - 800 * m, yb, yb + H], th, ["800", `${g.bermH}`]);
}

function isoView(sheet: Sheet, ox: number, oy: number, g: SludgeBedsGeometry, k: number, chOff: number) {
  const d = sheet.d;
  const W = g.W * k, L = g.L * k, H = g.bermH * k;
  const bb = g.bermBase * k, bt = g.bermTop * k;
  /* подошва */
  d.isoLine([0, 0, 0], [W, 0, 0], ox, oy, "THIN");
  d.isoLine([W, 0, 0], [W, L, 0], ox, oy, "THIN");
  d.isoLine([W, L, 0], [0, L, 0], ox, oy, "THIN");
  d.isoLine([0, L, 0], [0, 0, 0], ox, oy, "THIN");
  /* валики продольные (вдоль X) — верхние бровки как призмы */
  const yRows = [bb / 2, bb + g.cardL * k + bb / 2, (chOff + g.channelW) * k + bb / 2, L - bb / 2];
  for (const yc of yRows) {
    for (const s of [-1, 1]) {
      d.isoLine([0, yc + s * bt / 2, H], [W, yc + s * bt / 2, H], ox, oy, "CONTOUR");
      d.isoLine([0, yc + s * bb / 2, 0], [0, yc + s * bt / 2, H], ox, oy, "CONTOUR");
      d.isoLine([W, yc + s * bb / 2, 0], [W, yc + s * bt / 2, H], ox, oy, "CONTOUR");
    }
  }
  /* валики поперечные (вдоль Y) */
  for (let c = 0; c <= g.cols; c++) {
    const xc = bb / 2 + c * (g.cardB + g.bermBase) * k;
    for (const s of [-1, 1]) {
      d.isoLine([xc + s * bt / 2, 0, H], [xc + s * bt / 2, L, H], ox, oy, "CONTOUR");
      d.isoLine([xc + s * bb / 2, 0, 0], [xc + s * bt / 2, 0, H], ox, oy, "CONTOUR");
    }
  }
  /* лоток */
  const yc = (chOff + g.channelW / 2) * k;
  d.isoLine([-sheet.p(6), yc, H + 200 * k], [W, yc, H + 200 * k], ox, oy, "PIPE");
  d.isoLine([-sheet.p(6), yc + g.channelW * k, H + 200 * k], [W, yc + g.channelW * k, H + 200 * k], ox, oy, "PIPE");
}
