/* ==================================================================
 * ПРОДОЛЬНЫЙ ПРОФИЛЬ САМОТЁЧНОЙ КАНАЛИЗАЦИОННОЙ СЕТИ
 *
 * Лист, который смотрит эксперт и по которому копают траншею: линия
 * земли, линия лотка, колодцы, перепады — и таблица под профилем в том
 * виде, в каком её ведут на бумаге:
 *
 *     Диаметр и уклон / длина
 *     Глубина заложения, м
 *     Отметка лотка, м
 *     Отметка земли, м
 *     Расстояние между колодцами, м
 *     Номер колодца
 *
 * Профиль рисуется только по числам из calculateNetwork: ни одна
 * отметка здесь не пересчитывается заново. Разойтись ведомость и
 * чертёж не могут — источник один.
 *
 * МАСШТАБЫ. Пары те же, что на бумаге: Г 1:500 / В 1:50, Г 1:1000 /
 * В 1:100, Г 1:2000 / В 1:200 — вертикаль всегда растянута вдесятеро,
 * и это подписано на листе: инженер, не увидевший оговорки, прочтёт
 * уклоны круче, чем они есть. Длинная трасса не «сжимается» до листа,
 * а режется на листы, как в настоящем проекте.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { NetworkResult, SegmentResult } from "../../calculations/network";

/* Масштабы продольного профиля наружной сети — те, что применяют на
   бумаге: Г 1:500 / В 1:50, Г 1:1000 / В 1:100, Г 1:2000 / В 1:200.
   Растяжение вертикали всегда десятикратное — глаз проектировщика
   привык именно к нему, и уклон читается сразу.

   Мельче 1:2000 профиль не делают: трасса в километр не «сжимается»
   до листа, её РЕЖУТ на листы. Поэтому длинная сеть выдаётся
   несколькими листами, как в настоящем проекте, а не одним, где
   коллектор превращается в волосок. */
const PAIRS: { h: number; v: number }[] = [
  { h: 500, v: 50 },
  { h: 1000, v: 100 },
  { h: 2000, v: 200 },
];
/** доступная ширина поля листа A1 под профиль, мм бумаги */
const PAGE_MM = 500;
/** ряд вертикальных масштабов */
const V_ROW = [20, 25, 50, 100, 200, 250, 500];
/** предельное растяжение вертикали: выше — чертёж перестаёт читаться как профиль */
const MAX_EXAG = 20;

/** Вертикальный масштаб: профиль должен занимать высоту листа, а не
 *  жаться полоской над таблицей. Берём самый крупный из ряда, при
 *  котором перепад отметок влезает в отведённую высоту и растяжение не
 *  выходит за двадцатикратное. */
function verticalScale(rangeM: number, availMm: number, hScale: number): number {
  const fits = V_ROW.filter((v) => (rangeM * 1000) / v <= availMm && hScale / v <= MAX_EXAG);
  return fits.length ? fits[0] : Math.max(hScale / MAX_EXAG, (rangeM * 1000) / Math.max(availMm, 1));
}

export type NetworkSheetMeta = {
  /** наименование объекта в штампе */
  object: string;
  no?: string;
  index?: number;
  rev?: string;
  date?: string;
  stage?: string;
  /** горизонтальный масштаб, если задан вручную */
  scale?: number;
  /** имя ветви: «Коллектор по ул. Навои» */
  branch?: string;
};

const fmt = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

/**
 * Продольный профиль. Длинная трасса режется на листы: на каждом —
 * столько участков, сколько влезает в поле листа в выбранном масштабе.
 * Возвращается массив листов в порядке течения.
 */
export function networkProfileSheets(res: NetworkResult, meta: NetworkSheetMeta): Sheet[] {
  const segs = res.segments;
  if (!segs.length) throw new Error("Профиль сети: нет ни одного участка.");

  const totalLen = segs.reduce((s, x) => s + x.lengthM, 0);
  /* берём самый крупный масштаб, при котором трасса умещается не более
     чем на три листа; если и в 1:2000 не умещается — режем как есть */
  const pair =
    PAIRS.find((p) => (totalLen * 1000) / p.h <= PAGE_MM * 3) ?? PAIRS[PAIRS.length - 1];
  const hScale = meta.scale ?? pair.h;
  const pageLenM = (PAGE_MM * hScale) / 1000;

  /* разбивка по листам — по границам участков, без разрыва участка */
  const pages: SegmentResult[][] = [];
  let cur: SegmentResult[] = [];
  let acc = 0;
  segs.forEach((s) => {
    if (cur.length && acc + s.lengthM > pageLenM) {
      pages.push(cur);
      cur = [];
      acc = 0;
    }
    cur.push(s);
    acc += s.lengthM;
  });
  if (cur.length) pages.push(cur);

  /* вертикальный масштаб общий для всех листов ветви: иначе на соседних
     листах один и тот же уклон выглядел бы по-разному */
  const grounds = segs.flatMap((s) => [s.invertStart + s.depthStart, s.invertEnd + s.depthEnd]);
  const inverts = segs.flatMap((s) => [s.invertStart, s.invertEnd]);
  const range = Math.max(Math.max(...grounds) - Math.min(...inverts) + 1.5, 2);
  const vScale = verticalScale(range, 574 - 52 - 90, hScale);

  return pages.map((page, i) =>
    oneSheet(res, page, hScale, vScale, meta, i + 1, pages.length),
  );
}

/** Один лист профиля — для случая, когда трасса короткая. */
export function networkProfileSheet(res: NetworkResult, meta: NetworkSheetMeta): Sheet {
  return networkProfileSheets(res, meta)[0];
}

function oneSheet(
  res: NetworkResult,
  segs: SegmentResult[],
  hScale: number,
  vScale: number,
  meta: NetworkSheetMeta,
  page: number,
  pages: number,
): Sheet {
  const partTitle = pages > 1 ? ` (лист ${page} из ${pages}: ${segs[0].from}–${segs[segs.length - 1].to})` : "";
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(meta.object), "M", (meta.index ?? 1) + page - 1),
    title: (meta.branch ? `Продольный профиль. ${meta.branch}` : "Продольный профиль самотёчной сети") + partTitle,
    object: meta.object,
    scale: hScale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  draw(sheet, res, segs, hScale, vScale);
  sheet.revisionRow();
  return sheet;
}

function draw(sheet: Sheet, res: NetworkResult, segs: SegmentResult[], hScale: number, vScale: number) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;

  /* --- отметки, попадающие на лист --- */
  const grounds: number[] = [];
  const inverts: number[] = [];
  segs.forEach((s) => {
    grounds.push(s.invertStart + s.depthStart, s.invertEnd + s.depthEnd);
    inverts.push(s.invertStart, s.invertEnd);
  });
  const maxTop = Math.max(...grounds) + 1;
  const minBottom = Math.min(...inverts) - 0.5;
  const datum = Math.floor(minBottom - 0.5);

  /* --- таблица под профилем: шесть строк --- */
  const ROWS = 6;
  const rowH = 8; // мм бумаги
  const tableH = rowH * ROWS + 4;
  const vk = hScale / vScale;

  const px = f.x0 + P(34);
  const baseY = f.y0 + P(tableH + 14);
  const X = (m: number) => px + (m * 1000) / 1; // модельные мм = метры × 1000
  const Y = (elev: number) => baseY + (elev - datum) * 1000 * vk;

  sheet.viewTitle(px, Y(maxTop) + P(26), "ПРОДОЛЬНЫЙ ПРОФИЛЬ", "none");
  d.text(px, Y(maxTop) + P(19), ts, `ГОРИЗОНТАЛЬНЫЙ М 1:${hScale}   ВЕРТИКАЛЬНЫЙ М 1:${vScale}`, { align: "left" });

  /* --- условный горизонт и шкала отметок --- */
  const xEnd = X(segs.reduce((s, x) => s + x.lengthM, 0));
  d.line(px - P(18), baseY, xEnd + P(8), baseY, "THIN");
  d.text(px - P(18), baseY - ts * 1.7, ts, `УСЛОВНЫЙ ГОРИЗОНТ ${fmt(datum, 2)}`, { align: "left", layer: "THIN" });
  const range = maxTop - datum;
  const stepE = range > 20 ? 5 : range > 8 ? 2 : 1;
  for (let e = datum; e <= Math.ceil(maxTop); e += stepE) {
    d.line(px - P(18), Y(e), px - P(15), Y(e), "THIN");
    d.text(px - P(19), Y(e) - ts * 0.4, ts * 0.85, fmt(e, 2), { align: "right", layer: "THIN" });
  }

  /* --- линии земли и лотка --- */
  let u = 0;
  const stations: number[] = [0];
  const groundPts: [number, number][] = [];
  const pipePts: [number, number][] = [];

  segs.forEach((s, i) => {
    const u0 = u;
    const u1 = u + s.lengthM;
    if (i === 0) {
      groundPts.push([X(u0), Y(s.invertStart + s.depthStart)]);
      pipePts.push([X(u0), Y(s.invertStart)]);
    }
    groundPts.push([X(u1), Y(s.invertEnd + s.depthEnd)]);

    /* перепад в колодце рисуется вертикальной ступенью: труба ниже по
       течению начинается ниже пришедшего лотка */
    if (s.dropM > 0 && i > 0) {
      pipePts.push([X(u0), Y(s.invertStart)]);
    }
    pipePts.push([X(u1), Y(s.invertEnd)]);
    stations.push(u1);
    u = u1;
  });

  d.poly(groundPts, "THIN", false);
  d.poly(pipePts, "PIPE", false);

  /* --- колодцы --- */
  const wellW = P(1.6);
  stations.forEach((st, i) => {
    const seg = i < segs.length ? segs[i] : segs[segs.length - 1];
    const ground = i < segs.length ? seg.invertStart + seg.depthStart : seg.invertEnd + seg.depthEnd;
    const invert = i < segs.length ? seg.invertStart : seg.invertEnd;
    const x = X(st);
    d.line(x - wellW, Y(ground), x - wellW, Y(invert) - P(1), "CONTOUR");
    d.line(x + wellW, Y(ground), x + wellW, Y(invert) - P(1), "CONTOUR");
    d.line(x - wellW, Y(invert) - P(1), x + wellW, Y(invert) - P(1), "CONTOUR");
    // горловина
    d.line(x - wellW, Y(ground), x + wellW, Y(ground), "CONTOUR");
  });

  /* --- направление потока --- */
  const midY = Y((minBottom + maxTop) / 2);
  d.arrow(X(0) + P(6), midY + P(14), X(0) + P(26), midY + P(14), "FLOW", P(3));
  d.text(X(0) + P(28), midY + P(13), ts, "ТЕЧЕНИЕ", { align: "left", layer: "FLOW" });

  /* ------------------------------------------------------------------
   * ТАБЛИЦА ПОД ПРОФИЛЕМ
   * ------------------------------------------------------------------ */
  const labels = [
    "Труба: DN, уклон / длина",
    "Глубина заложения, м",
    "Отметка лотка, м",
    "Отметка земли, м",
    "Расстояние, м",
    "Колодец",
  ];
  const tTop = f.y0 + P(tableH);
  const tLeft = px - P(34);
  const tRight = xEnd + P(8);

  for (let r = 0; r <= ROWS; r += 1) {
    const y = tTop - P(rowH * r);
    d.line(tLeft, y, tRight, y, "THIN");
  }
  d.line(tLeft, tTop, tLeft, tTop - P(rowH * ROWS), "THIN");
  d.line(px - P(2), tTop, px - P(2), tTop - P(rowH * ROWS), "THIN");
  d.line(tRight, tTop, tRight, tTop - P(rowH * ROWS), "THIN");

  labels.forEach((lab, r) => {
    const y = tTop - P(rowH * (r + 1)) + P(rowH * 0.3);
    d.text(tLeft + P(1.5), y, ts * 0.85, lab, { align: "left", layer: "THIN" });
  });

  const cellY = (r: number) => tTop - P(rowH * (r + 1)) + P(rowH * 0.3);

  /* значения в колодцах: отметки, глубина, номер.
     Числа пишутся поперёк листа только тогда, когда колодцы стоят
     часто и в клетку не влезает строка. Разворачивать текст без нужды
     нельзя: вертикальные числа читаются вдвое медленнее, а профиль
     смотрят в поле, стоя над траншеей. */
  const minStepMm =
    stations.length > 1
      ? Math.min(...stations.slice(1).map((st, i) => (st - stations[i]) * 1000 / sheet.s))
      : 999;
  const vertical = minStepMm < 16;
  /* Горизонтальное число не ставится ровно на разделительную линию —
     иначе она рассекает его пополам. Значение отодвигается внутрь
     клетки: у последнего колодца — влево, у остальных — вправо. */
  const cellText = (x: number, r: number, value: string, h: number, layer: "THIN" | "CONTOUR", last: boolean) => {
    if (vertical) {
      d.text(x, tTop - P(rowH * (r + 1)) + P(1), h, value, { align: "left", layer, rot: 90 });
    } else if (last) {
      d.text(x - P(1.5), cellY(r), h, value, { align: "right", layer });
    } else {
      d.text(x + P(1.5), cellY(r), h, value, { align: "left", layer });
    }
  };

  stations.forEach((st, i) => {
    const x = X(st);
    const seg = i < segs.length ? segs[i] : segs[segs.length - 1];
    const ground = i < segs.length ? seg.invertStart + seg.depthStart : seg.invertEnd + seg.depthEnd;
    const invert = i < segs.length ? seg.invertStart : seg.invertEnd;
    const depth = i < segs.length ? seg.depthStart : seg.depthEnd;
    const name = i < segs.length ? seg.from : seg.to;

    d.line(x, tTop, x, tTop - P(rowH * ROWS), "THIN");
    const last = i === stations.length - 1;
    cellText(x, 1, fmt(depth), ts * 0.85, "THIN", last);
    cellText(x, 2, fmt(invert), ts * 0.85, "THIN", last);
    cellText(x, 3, fmt(ground), ts * 0.85, "THIN", last);
    cellText(x, 5, name, ts * 0.95, "CONTOUR", last);
  });

  /* значения на участках: труба и расстояние — по середине клетки */
  u = 0;
  segs.forEach((s) => {
    const xm = X(u + s.lengthM / 2);
    d.text(xm, cellY(0), ts * 0.8, `d${s.dnMm}  i=${s.slope.toFixed(4).replace(".", ",")}`, { align: "center", layer: "THIN" });
    d.text(xm, cellY(4), ts * 0.85, fmt(s.lengthM, 1), { align: "center", layer: "THIN" });
    u += s.lengthM;
  });

  /* --- перепады подписываются на профиле: их пропускают чаще всего --- */
  u = 0;
  segs.forEach((s) => {
    if (s.dropM > 0) {
      d.leader(X(u), Y(s.invertStart), X(u) + P(10), Y(s.invertStart) + P(10), `ПЕРЕПАД ${fmt(s.dropM)} м`, ts, 1);
    }
    u += s.lengthM;
  });

  /* ------------------------------------------------------------------
   * ПРИМЕЧАНИЯ
   * ------------------------------------------------------------------ */
  sheet.note(
    `Вертикальный масштаб крупнее горизонтального в ${vk.toFixed(0)} раз: уклоны на чертеже выглядят круче действительных. Отметки читать по числам таблицы, не по картинке.`,
  );
  sheet.note("Отметки лотка и глубины — из гидравлического расчёта сети; чертёж и ведомость считаются одним кодом и разойтись не могут.");
  res.assumptions.forEach((a) => sheet.note(a));
  res.warnings.forEach((w) => sheet.note(w));
  const risky = segs.filter((s) => s.warnings.length);
  risky.forEach((s) => sheet.note(`Участок ${s.from}–${s.to}: ${s.warnings.join(" ")}`));

  sheet.legend([
    { layer: "CONTOUR", text: "колодцы, конструкции" },
    { layer: "PIPE", text: "лоток трубопровода" },
    { layer: "WATER", text: "линия земли" },
  ]);
}

/** Ведомость колодцев — вспомогательная выборка для плана сети. */
export function wells(res: NetworkResult): { id: string; ground: number; invert: number; depth: number }[] {
  const out: { id: string; ground: number; invert: number; depth: number }[] = [];
  res.segments.forEach((s: SegmentResult, i: number) => {
    if (i === 0) out.push({ id: s.from, ground: s.invertStart + s.depthStart, invert: s.invertStart, depth: s.depthStart });
    out.push({ id: s.to, ground: s.invertEnd + s.depthEnd, invert: s.invertEnd, depth: s.depthEnd });
  });
  return out;
}
