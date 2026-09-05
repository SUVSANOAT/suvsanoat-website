/* ==================================================================
 * ЧЕРТЕЖИ DXF ДЛЯ ПРЕДВАРИТЕЛЬНОГО РЕШЕНИЯ
 *
 * 1. Технологическая схема — лист А3 (420×297 мм), блоки ступеней
 *    с расчётными данными и подобранными моделями, стрелки потока,
 *    блок исходных данных и основная надпись.
 * 2. Габариты подобранного оборудования — вид сбоку каждой модели
 *    в натуральных миллиметрах (1:1), размеры, патрубки, люки,
 *    уровень воды. Геометрия та же, что на страницах моделей.
 *
 * Все чертежи схематические — предварительное решение, не рабочая
 * документация. Проектировщик открывает DXF в AutoCAD/NanoCAD и
 * сохраняет в DWG для доработки.
 * ================================================================== */

import type { Model } from "../../../products/data";
import { STAGE_INFO, type Industry, type PollutantKey, POLLUTANT_LABELS } from "../industry/industries";
import { KMK_2_04_03_19_DOC } from "../../../../norms/kmk-2-04-03-19";
import { t } from "../industry/i18n";
import type { Language } from "../../../translations";
import { Dxf } from "./dxf";

export type SchemeStage = {
  key: keyof typeof STAGE_INFO;
  sizing: string[];
  picks: { count: number; model: Model; note?: string }[];
};

export type SchemeInput = {
  industry: Industry;
  /** язык подписей; для китайского берётся английский — формат DXF R12
      хранит текст в однобайтовой кодировке и иероглифы в нём не читаются */
  lang: Language;
  object: string;
  lab: boolean;
  Q: number;
  hours: number;
  Qh: number;
  ph: number;
  conc: Partial<Record<PollutantKey, number>>;
  target: Partial<Record<PollutantKey, number>>;
  stages: SchemeStage[];
};

/* --------------------------- утилиты --------------------------- */

/** язык подписей чертежа: китайский заменяется английским —
    DXF R12 хранит текст в однобайтовой кодировке, иероглифы в нём не читаются */
function drawLang(lang: Language): Language {
  return lang === "zh" ? "en" : lang;
}

function wrap(text: string, maxChars: number, maxLines = 99): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/[,.;]?\s*$/, "") + "...";
    return cut;
  }
  return lines;
}

function num(v: number, digits = 0): string {
  return v.toFixed(digits).replace(".", ",");
}

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/* основная надпись — упрощённая, 185×55 мм в правом нижнем углу листа */
function titleBlock(d: Dxf, x: number, y: number, rows: { doc: string; name: string; sheet: string; stage: string }) {
  const W = 185;
  const H = 55;
  d.rect(x, y, W, H, "CONTOUR");
  d.line(x, y + 40, x + W, y + 40, "CONTOUR");
  d.line(x, y + 15, x + W, y + 15, "CONTOUR");
  d.line(x + 65, y, x + 65, y + 55, "CONTOUR");
  d.line(x + 135, y + 15, x + 135, y + 55, "THIN");

  d.text(x + 3, y + 46, 2.5, "SUVSANOAT", { align: "left" });
  d.text(x + 3, y + 42, 1.8, "Ташкент, Узбекистан", { align: "left" });
  d.text(x + 3, y + 24, 1.8, "Разработал: онлайн-расчёт", { align: "left" });
  d.text(x + 3, y + 18, 1.8, `Дата: ${today()}`, { align: "left" });
  d.text(x + 3, y + 8, 1.8, "Предварительное решение", { align: "left" });
  d.text(x + 3, y + 3.5, 1.8, "Не является рабочим чертежом", { align: "left" });

  d.text(x + 100, y + 48, 3.5, rows.doc, { align: "center" });
  const nm = wrap(rows.name, 34, 3);
  nm.forEach((line, i) => d.text(x + 100, y + 34 - i * 5, 2.5, line, { align: "center" }));
  d.text(x + 68, y + 8, 2.2, `Стадия: ${rows.stage}`, { align: "left" });
  d.text(x + 138, y + 8, 2.2, `Лист ${rows.sheet}`, { align: "left" });
  d.text(x + 138, y + 3.5, 2.2, "Масштаб: б/м", { align: "left" });
}

/* рамка листа А3 */
function frameA3(d: Dxf) {
  d.rect(0, 0, 420, 297, "THIN");
  d.rect(20, 5, 395, 287, "CONTOUR");
}

/* =================================================================
 * 1. ТЕХНОЛОГИЧЕСКАЯ СХЕМА
 * ================================================================= */

export function buildSchemeDxf(input: SchemeInput): Dxf {
  const d = new Dxf();
  frameA3(d);

  const { industry, stages } = input;

  /* заголовок */
  d.text(25, 282, 5, "ПРЕДВАРИТЕЛЬНАЯ ТЕХНОЛОГИЧЕСКАЯ СХЕМА ОЧИСТКИ", { align: "left" });
  const lang = drawLang(input.lang);
  d.text(25, 274, 3, `${t(industry.name, lang)}${input.object ? " - " + input.object : ""}`, { align: "left" });
  d.text(25, 269, 2.5, `Q = ${num(input.Q)} м³/сут, режим ${num(input.hours)} ч/сут, ${num(input.Qh, 1)} м³/ч. ${input.lab ? "Состав по анализу заказчика" : "Состав по справочным данным отрасли"}.`, { align: "left" });

  /* блоки ступеней — змейкой, до 5 в ряд */
  const COLS = stages.length <= 8 ? 4 : 5;
  const BW = COLS === 4 ? 88 : 70;
  const BH = 62;
  const GX = 10;
  const GY = 26;
  const CHARS = COLS === 4 ? 52 : 42;
  const X0 = 25 + (390 - (COLS * BW + (COLS - 1) * GX)) / 2;
  const YTOP = 258;

  type Box = { x: number; y: number };
  const boxes: Box[] = [];

  stages.forEach((stage, i) => {
    const row = Math.floor(i / COLS);
    const colRaw = i % COLS;
    const col = row % 2 === 0 ? colRaw : COLS - 1 - colRaw;
    const x = X0 + col * (BW + GX);
    const y = YTOP - BH - row * (BH + GY);
    boxes.push({ x, y });

    const info = STAGE_INFO[stage.key];
    d.rect(x, y, BW, BH, "CONTOUR");
    d.line(x, y + BH - 7, x + BW, y + BH - 7, "THIN");

    /* номер и название */
    d.text(x + 2, y + BH - 5.2, 3, String(i + 1).padStart(2, "0"), { align: "left" });
    const title = wrap(t(info.title, lang).toUpperCase(), COLS === 4 ? 34 : 26, 1)[0];
    d.text(x + 9, y + BH - 5.2, 2.6, title, { align: "left" });

    /* расчёт — первые строки */
    let ty = y + BH - 11;
    const lines: string[] = [];
    for (const s of stage.sizing) {
      for (const l of wrap(s, CHARS)) lines.push(l);
    }
    for (const l of lines.slice(0, 14)) {
      d.text(x + 2, ty, 1.8, l, { align: "left" });
      ty -= 3;
    }

    /* модели */
    if (stage.picks.length) {
      const codes = stage.picks.map((p) => (p.count > 1 ? `${p.count}x ` : "") + p.model.code).join(", ");
      d.text(x + 2, y + 2, 2.4, codes, { layer: "DIM", align: "left" });
    } else {
      d.text(x + 2, y + 2, 1.8, info.makes === "supply" ? "комплектация" : "корпус SUVSANOAT", { layer: "DIM", align: "left" });
    }
  });

  /* стрелки потока */
  for (let i = 0; i < boxes.length - 1; i++) {
    const a = boxes[i];
    const b = boxes[i + 1];
    const sameRow = Math.abs(a.y - b.y) < 0.01;
    if (sameRow) {
      const dir = b.x > a.x ? 1 : -1;
      const x1 = dir === 1 ? a.x + BW : a.x;
      const x2 = dir === 1 ? b.x : b.x + BW;
      d.arrow(x1, a.y + BH / 2, x2, b.y + BH / 2, "FLOW", 3);
    } else {
      d.arrow(a.x + BW / 2, a.y, b.x + BW / 2, b.y + BH, "FLOW", 3);
    }
  }

  /* вход и выход */
  if (boxes.length) {
    const f = boxes[0];
    d.arrow(f.x - 14, f.y + BH / 2, f.x, f.y + BH / 2, "FLOW", 3);
    d.text(f.x - 14, f.y + BH / 2 + 2, 2, "СТОК", { layer: "FLOW", align: "left" });
    const l = boxes[boxes.length - 1];
    const lastRowDir = Math.floor((boxes.length - 1) / COLS) % 2 === 0 ? 1 : -1;
    const ox = lastRowDir === 1 ? l.x + BW : l.x;
    d.arrow(ox, l.y + BH / 2, ox + 14 * lastRowDir, l.y + BH / 2, "FLOW", 3);
    d.text(lastRowDir === 1 ? ox + 2 : ox - 14, l.y + BH / 2 + 2, 2, "СБРОС", { layer: "FLOW", align: "left" });
  }

  /* блок исходных данных — слева от основной надписи */
  const IX = 25;
  const IY = 8;
  const IW = 195;
  const IH = 52;
  d.rect(IX, IY, IW, IH, "THIN");
  d.text(IX + 2, IY + IH - 4, 2.5, "ИСХОДНЫЙ СОСТАВ И ЦЕЛЬ ОЧИСТКИ, мг/л", { align: "left" });
  d.line(IX, IY + IH - 6, IX + IW, IY + IH - 6, "THIN");
  const keys = (Object.keys(input.conc) as PollutantKey[]).filter((k) => input.conc[k] !== undefined);
  let cy = IY + IH - 10;
  let cx = IX + 2;
  keys.forEach((k, i) => {
    if (i === 6) {
      cx = IX + 100;
      cy = IY + IH - 10;
    }
    const tgt = input.target[k];
    d.text(cx, cy, 1.9, `${t(POLLUTANT_LABELS[k].label, lang)}: ${num(input.conc[k]!)} -> ${tgt !== undefined ? num(tgt, tgt < 1 ? 1 : 0) : "-"}`, { align: "left" });
    cy -= 3.6;
  });
  d.text(IX + 100, IY + 10, 1.9, `pH: ${num(input.ph, 1)} -> 6,5-8,5`, { align: "left" });
  d.text(IX + 100, IY + 6, 1.7, `Методики: ${KMK_2_04_03_19_DOC.code}, DWA-A 131, EN 1825, EN 858`, { align: "left" });
  d.text(IX + 100, IY + 2.5, 1.7, `${t(industry.sources[0] ?? "-", lang)}`.slice(0, 60), { align: "left" });

  titleBlock(d, 230, 5, {
    doc: "ТХ",
    name: `Схема очистки сточных вод. ${t(industry.name, lang)}`,
    sheet: "1",
    stage: "П (предварительная)",
  });

  return d;
}

/* =================================================================
 * 2. ГАБАРИТЫ ОБОРУДОВАНИЯ — 1:1, мм
 * ================================================================= */

const TH = 150; // высота текста, мм (при печати 1:50 = 3 мм)

function neck(d: Dxf, x: number, y: number, w: number) {
  const h = w * 0.6;
  d.line(x - w / 2, y, x - w / 2, y + h, "THIN");
  d.line(x + w / 2, y, x + w / 2, y + h, "THIN");
  d.line(x - w / 2 - w * 0.2, y + h, x + w / 2 + w * 0.2, y + h, "THIN");
  d.line(x - w / 2 - w * 0.2, y + h + w * 0.15, x + w / 2 + w * 0.15 + w * 0.05, y + h + w * 0.15, "THIN");
}

function stub(d: Dxf, x: number, y: number, dir: 1 | -1, dn: number) {
  const len = 400;
  d.line(x, y + dn / 2, x + len * dir, y + dn / 2, "CONTOUR");
  d.line(x, y - dn / 2, x + len * dir, y - dn / 2, "CONTOUR");
  d.line(x + len * dir, y - dn / 2, x + len * dir, y + dn / 2, "CONTOUR");
  d.line(x, y, x + len * 0.6 * dir, y, "AXIS");
  d.text(x + (len + 60) * dir, y + dn / 2 + 40, TH * 0.8, `DN${dn}`, { align: dir === 1 ? "left" : "right" });
}

function waterMark(d: Dxf, x: number, y: number) {
  const s = TH;
  d.poly([[x - s * 0.5, y + s * 0.7], [x + s * 0.5, y + s * 0.7], [x, y]], "WATER", true);
  d.line(x - s * 0.7, y, x + s * 0.7, y, "WATER");
  d.line(x - s * 0.4, y - s * 0.22, x + s * 0.4, y - s * 0.22, "WATER");
  d.line(x - s * 0.2, y - s * 0.44, x + s * 0.2, y - s * 0.44, "WATER");
}

function pump(d: Dxf, x: number, y: number, w: number) {
  const h = w * 1.6;
  d.rect(x - w / 2, y, w, h, "THIN");
  d.line(x, y + h, x, y + h * 1.5, "THIN");
  d.line(x - w * 0.3, y + h * 0.3, x + w * 0.3, y + h * 0.7, "THIN");
  d.line(x - w * 0.3, y + h * 0.7, x + w * 0.3, y + h * 0.3, "THIN");
}

/* торцевое днище — половина эллипса полилинией (в R12 нет ELLIPSE) */
function dish(d: Dxf, cx: number, cy: number, rx: number, ry: number, dir: 1 | -1) {
  const pts: [number, number][] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / N;
    pts.push([cx + dir * rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  d.poly(pts, "CONTOUR", false);
}

function ground(d: Dxf, x1: number, x2: number, y: number) {
  d.line(x1, y, x2, y, "CONTOUR");
  const step = 300;
  for (let x = x1 + 100; x < x2; x += step) d.line(x, y, x - 150, y - 120, "THIN");
}

/** рисует одну модель с левым нижним углом в (ox, oy); возвращает занятую ширину */
export function drawModel(d: Dxf, model: Model, ox: number, oy: number, caption: string): number {
  const bodies = model.bodies ?? 1;
  const isKns = model.line === "pump-stations";
  const isSkid = model.line === "chlorinators";
  const isDozCyl = model.line === "dosing" && model.diameter !== undefined;
  const isCylH = model.diameter !== undefined && !isKns && !isSkid && !isDozCyl;

  const dn = model.dn;

  /* ---------- горизонтальный цилиндр ---------- */
  if (isCylH) {
    const L = model.length;
    const D = model.diameter!;
    const x0 = ox + 600;
    const y0 = oy + 800;
    const rings = model.rings ?? 0;
    const hat = Math.min(Math.ceil(model.hatches / bodies), 3);
    const r = D * 0.11;

    d.line(x0 + r, y0, x0 + L - r, y0, "CONTOUR");
    d.line(x0 + r, y0 + D, x0 + L - r, y0 + D, "CONTOUR");
    /* торцевые днища */
    dish(d, x0 + r, y0 + D / 2, r, D / 2, -1);
    dish(d, x0 + L - r, y0 + D / 2, r, D / 2, 1);
    d.line(x0 + r, y0, x0 + r, y0 + D, "THIN");
    d.line(x0 + L - r, y0, x0 + L - r, y0 + D, "THIN");

    for (let i = 0; i < rings; i++) {
      const rx = x0 + ((i + 1) * L) / (rings + 1);
      d.line(rx, y0 - 30, rx, y0 + D + 30, "THIN");
    }
    for (let i = 0; i < hat; i++) neck(d, x0 + L * (0.2 + i * 0.3), y0 + D, 600);

    const wy = y0 + D * 0.75;
    d.line(x0 + r, wy, x0 + L - r, wy, "WATER");
    waterMark(d, x0 + L * 0.5, wy);

    stub(d, x0, y0 + D * 0.72, -1, dn);
    stub(d, x0 + L, y0 + D * 0.66, 1, dn);

    d.dimH(x0, x0 + L, y0 - 500, `${L}`, TH);
    d.dimV(x0 + L + 700, y0, y0 + D, `⌀${D}`, TH);
    d.text(x0, y0 + D + 900, TH * 1.3, caption + (bodies > 1 ? `  x ${bodies} корп.` : ""), { align: "left" });
    d.text(x0, y0 + D + 700, TH * 0.8, `V = ${model.volumeGross} м³, DN${dn}, ${model.hatches} люка, масса ${model.mass} кг`, { align: "left" });
    return L + 2200;
  }

  /* ---------- КНС ---------- */
  if (isKns) {
    const D = model.diameter!;
    const H = model.depth ?? model.length;
    const x0 = ox + 700;
    const y0 = oy + 400;
    const pumps = model.pumps ?? 2;
    const useful = model.useful ?? 0;
    const area = (Math.PI * (D / 1000) ** 2) / 4;
    const hu = (useful / area) * 1000;

    ground(d, x0 - 800, x0 + D + 800, y0 + H);
    d.rect(x0, y0, D, H, "CONTOUR");
    neck(d, x0 + D * 0.3, y0 + H, 700);

    for (let i = 0; i < pumps; i++) {
      const px = x0 + D * ((i + 1) / (pumps + 1));
      d.line(px, y0 + 50, px, y0 + H - 50, "AXIS");
      pump(d, px, y0 + 60, Math.min(400, D * 0.16));
    }
    const stopY = y0 + 300;
    const startY = stopY + hu;
    d.line(x0 + 50, startY, x0 + D - 50, startY, "WATER");
    d.line(x0 + 50, stopY, x0 + D - 50, stopY, "WATER");
    d.text(x0 - 80, startY - TH * 0.4, TH * 0.8, "пуск", { align: "right" });
    d.text(x0 - 80, stopY - TH * 0.4, TH * 0.8, "стоп", { align: "right" });

    stub(d, x0, y0 + H - 900, -1, dn);
    /* напорный */
    d.line(x0 + D - 300, y0 + 500, x0 + D - 300, y0 + H + 400, "CONTOUR");
    d.arrow(x0 + D - 300, y0 + H + 400, x0 + D - 300, y0 + H + 700, "FLOW", 80);

    d.dimH(x0, x0 + D, y0 - 500, `⌀${D}`, TH);
    d.dimV(x0 + D + 900, y0, y0 + H, `${H}`, TH);
    d.text(x0 - 600, y0 + H + 1100, TH * 1.3, caption, { align: "left" });
    d.text(x0 - 600, y0 + H + 900, TH * 0.8, `${pumps} насоса, Vполезн = ${useful} м³, DN${dn}`, { align: "left" });
    return D + 2600;
  }

  /* ---------- электролизная установка на раме ---------- */
  if (isSkid) {
    const L = model.length;
    const H = model.height ?? 1700;
    const x0 = ox + 600;
    const y0 = oy + 400;
    d.line(x0 - 100, y0, x0 + L + 100, y0, "CONTOUR");
    d.rect(x0, y0, L, H, "THIN");
    const saltX = x0 + L * 0.02, saltW = L * 0.24;
    const cabX = x0 + L * 0.32, cabW = L * 0.28;
    const solX = x0 + L * 0.66, solW = L * 0.32;
    d.rect(saltX, y0, saltW, H * 0.7, "CONTOUR");
    d.rect(cabX, y0, cabW, H * 0.96, "CONTOUR");
    d.circle(cabX + cabW / 2, y0 + H * 0.68, Math.min(120, L * 0.05), "DIM");
    d.rect(solX, y0, solW, H * 0.84, "CONTOUR");
    d.line(solX + 30, y0 + H * 0.66, solX + solW - 30, y0 + H * 0.66, "WATER");
    waterMark(d, solX + solW / 2, y0 + H * 0.66);
    d.line(saltX + saltW, y0 + H * 0.5, cabX, y0 + H * 0.5, "FLOW");
    d.line(cabX + cabW, y0 + H * 0.6, solX, y0 + H * 0.6, "FLOW");
    d.line(solX + solW / 2, y0 + H * 0.84, solX + solW / 2, y0 + H + 250, "THIN");
    d.text(solX + solW / 2 + 60, y0 + H + 250, TH * 0.8, "H2", { align: "left" });
    stub(d, x0 + L, y0 + H * 0.18, 1, dn);
    d.text(saltX + saltW / 2, y0 + H * 0.35, TH * 0.6, "соль", { align: "center" });
    d.text(cabX + cabW / 2, y0 + H * 0.3, TH * 0.6, "шкаф", { align: "center" });
    d.text(solX + solW / 2, y0 + H * 0.3, TH * 0.6, "раствор", { align: "center" });

    d.dimH(x0 - 100, x0 + L + 100, y0 - 500, `${L + 200}`, TH);
    d.dimV(x0 + L + 800, y0, y0 + H, `${H}`, TH);
    d.text(x0, y0 + H + 700, TH * 1.3, caption, { align: "left" });
    d.text(x0, y0 + H + 500, TH * 0.8, `${model.cl ?? "-"} г/ч акт. хлора, соль ${model.saltd ?? "-"} кг/сут`, { align: "left" });
    return L + 2400;
  }

  /* ---------- цилиндрический дозатор ---------- */
  if (isDozCyl) {
    const D = model.diameter!;
    const H = model.length;
    const x0 = ox + 900;
    const y0 = oy + 400;
    d.line(x0 - 500, y0, x0 + D + 900, y0, "CONTOUR");
    d.rect(x0, y0, D, H, "CONTOUR");
    d.line(x0 + 30, y0 + H * 0.78, x0 + D - 30, y0 + H * 0.78, "WATER");
    waterMark(d, x0 + D * 0.32, y0 + H * 0.78);
    /* мешалка */
    d.rect(x0 + D / 2 - 150, y0 + H, 300, 220, "THIN");
    d.line(x0 + D / 2, y0 + H, x0 + D / 2, y0 + H * 0.28, "THIN");
    d.line(x0 + D / 2 - 180, y0 + H * 0.28, x0 + D / 2 + 180, y0 + H * 0.28, "CONTOUR");
    d.text(x0 + D / 2 + 200, y0 + H + 80, TH * 0.7, "M", { align: "left" });
    /* насосы-дозаторы */
    for (let i = 0; i < 2; i++) {
      d.rect(x0 + D + 250, y0 + 100 + i * 350, 320, 240, "THIN");
      d.circle(x0 + D + 410, y0 + 220 + i * 350, 60, "DIM");
    }
    d.line(x0 + D, y0 + 200, x0 + D + 250, y0 + 200, "FLOW");
    d.arrow(x0 + D + 570, y0 + 220, x0 + D + 850, y0 + 220, "FLOW", 80);

    d.dimH(x0, x0 + D, y0 - 500, `⌀${D}`, TH);
    d.dimV(x0 - 500, y0, y0 + H, `${H}`, TH);
    d.text(x0 - 500, y0 + H + 700, TH * 1.3, caption, { align: "left" });
    d.text(x0 - 500, y0 + H + 500, TH * 0.8, `бак ${model.vol ?? "-"} л, мешалка, 2 насоса-дозатора`, { align: "left" });
    return D + 2600;
  }

  /* ---------- прямоугольный корпус ---------- */
  const L = model.length;
  const H = model.height ?? 1500;
  const buried = model.line !== "dosing";
  const x0 = ox + 600;
  const y0 = oy + 800;
  const hat = Math.min(Math.ceil(model.hatches / bodies) || 1, 5);
  const wl =
    model.volumeWork && model.width
      ? Math.min(0.9, model.volumeWork / bodies / ((L / 1000) * (model.width / 1000) * (H / 1000)))
      : 0.8;
  const wy = y0 + H * wl;

  const walls =
    model.line === "grease-traps" ? [0.3, 0.78]
    : model.line === "oil-separators" ? [0.42, 0.62, 0.86]
    : model.line === "sand-traps" ? [0.55]
    : model.line === "bio-plants" ? [0.24, 0.62, 0.82]
    : [];

  if (buried) ground(d, x0 - 800, x0 + L + 800, y0 + H + 450);
  else d.line(x0 - 400, y0, x0 + L + 400, y0, "CONTOUR");

  d.rect(x0, y0, L, H, "CONTOUR");
  d.line(x0 + 30, wy, x0 + L - 30, wy, "WATER");
  waterMark(d, x0 + L * 0.14, wy);

  walls.forEach((p, i) => {
    const wx = x0 + L * p;
    if (i % 2 === 0) d.line(wx, y0 + 50, wx, y0 + H * 0.86, "CONTOUR");
    else d.line(wx, y0 + H * 0.3, wx, y0 + H - 50, "CONTOUR");
  });

  for (let i = 0; i < hat; i++) neck(d, x0 + L * ((i + 1) / (hat + 1)), y0 + H, 600);

  stub(d, x0, y0 + H * 0.78, -1, dn);
  stub(d, x0 + L, y0 + H * 0.7, 1, dn);

  d.dimH(x0, x0 + L, y0 - 500, `${L}`, TH);
  d.dimV(x0 + L + 700, y0, y0 + H, `${H}`, TH);
  d.text(x0, y0 + H + (buried ? 1100 : 700), TH * 1.3, caption + (bodies > 1 ? `  x ${bodies} корп.` : ""), { align: "left" });
  d.text(
    x0,
    y0 + H + (buried ? 900 : 500),
    TH * 0.8,
    `${L} x ${model.width ?? "-"} x ${H} мм, V = ${model.volumeGross} м³, DN${dn}, ${model.hatches} люка, масса ${model.mass} кг`,
    { align: "left" }
  );
  return L + 2200;
}

export function buildModelsDxf(input: SchemeInput): Dxf {
  const d = new Dxf();
  const lang = drawLang(input.lang);
  const items: { caption: string; model: Model }[] = [];
  const seen = new Set<string>();

  input.stages.forEach((stage, i) => {
    for (const p of stage.picks) {
      const key = `${p.model.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cnt = p.count > 1 ? `${p.count} x ` : "";
      items.push({
        caption: `${String(i + 1).padStart(2, "0")} ${t(STAGE_INFO[stage.key].title, lang)} - ${cnt}${p.model.code}`,
        model: p.model,
      });
    }
  });

  /* заголовок листа — над самым высоким изделием */
  const top = Math.max(0, ...items.map((it) => (it.model.height ?? it.model.diameter ?? it.model.depth ?? it.model.length) + 2600)) + 1200;
  d.text(0, top + 500, TH * 2, "SUVSANOAT - ГАБАРИТЫ ПОДОБРАННОГО ОБОРУДОВАНИЯ (вид сбоку, мм, 1:1)", { align: "left" });
  d.text(0, top, TH, `${t(input.industry.name, drawLang(input.lang))}. Q = ${num(input.Q)} м³/сут. Схемы автоматические, не рабочие чертежи. ${today()}`, { align: "left" });

  /* раскладка: в ряд, при ширине более 40 м — новый ряд */
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const it of items) {
    const h = (it.model.height ?? it.model.diameter ?? it.model.depth ?? it.model.length) + 2600;
    const wEst = (it.model.line === "pump-stations" ? it.model.diameter! : it.model.line === "dosing" && it.model.diameter ? it.model.diameter : it.model.length) + 2600;
    if (x > 0 && x + wEst > 40000) {
      x = 0;
      y -= rowH + 1500;
      rowH = 0;
    }
    const used = drawModel(d, it.model, x, y, it.caption);
    x += used + 800;
    rowH = Math.max(rowH, h);
  }

  if (!items.length) d.text(0, 2000, TH * 1.2, "В цепочке нет типовых моделей SUVSANOAT — оборудование по индивидуальному расчёту.", { align: "left" });

  return d;
}
