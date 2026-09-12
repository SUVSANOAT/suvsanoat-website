/* ==================================================================
 * ПРОДОЛЬНЫЙ ПРОФИЛЬ НАПОРНОГО ВОДОВОДА
 *
 * Лист, по которому водовод проверяют и строят: линия земли, ось
 * трубы, пьезометрическая линия, насосные станции, вантузы и выпуски —
 * и таблица под профилем с отметками, напором и давлением в каждой
 * точке.
 *
 * ПОЧЕМУ ПЬЕЗОМЕТРИЧЕСКАЯ ЛИНИЯ ЗДЕСЬ ГЛАВНАЯ
 *
 * У самотёчной сети главный вопрос — уклон лотка. У напорного водовода
 * главный вопрос другой: где пьезометрическая линия подходит к трубе.
 * Там, где она опускается ниже оси, в трубе разрежение, а при
 * отключении насосов рвётся столб воды — и обратный удар при смыкании
 * опаснее прямого. Поэтому линия энергии рисуется наравне с землёй и
 * трубой, а расстояние между ней и осью считается на каждом листе.
 *
 * НИ ОДНА ОТМЕТКА ЗДЕСЬ НЕ ПЕРЕСЧИТЫВАЕТСЯ
 *
 * Всё берётся из узловой таблицы calculateWaterMain. Именно
 * расхождение чертежа с таблицами погубило разобранный ручной расчёт:
 * свободные напоры в одной и той же точке отличались втрое на схеме,
 * в сводной таблице и в тексте. Здесь источник один.
 *
 * МАСШТАБЫ. Пары под длинную трассу: Г 1:2000 / В 1:200, Г 1:5000 /
 * В 1:500, Г 1:10000 / В 1:1000. Вертикаль всегда растянута вдесятеро,
 * и это подписано на листе: не увидевший оговорки прочтёт уклоны круче
 * действительных. Трасса не сжимается до листа, а режется на листы.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { WaterMainNode, WaterMainResult } from "../../calculations/water-main";

/** ряд горизонтальных масштабов для длинной трассы */
const H_ROW = [1000, 2000, 5000, 10000];
/** ряд вертикальных масштабов */
const V_ROW = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
/** доступная ширина поля листа A1 под профиль, мм бумаги */
const PAGE_MM = 500;
/** доступная высота под линии профиля, мм бумаги (лист минус таблица и заголовок) */
const PAGE_H_MM = 430;
/** больше шести листов на трассу — это уже не комплект, а рулон */
const MAX_PAGES = 6;
/** предельное растяжение вертикали: выше — чертёж перестаёт читаться как профиль */
const MAX_EXAG = 10;

/* ------------------------------------------------------------------
 * ВЕРТИКАЛЬНЫЙ МАСШТАБ
 *
 * У равнинного водовода вертикаль растягивают вдесятеро — иначе уклон
 * не виден. У горного всё наоборот: перепад 880 м при длине 9 км не
 * влезет на лист ни при каком растяжении, и вертикаль приходится
 * брать КРУПНЕЕ горизонтали — то есть сжимать. Поэтому масштаб не
 * назначается парой, а подбирается: самый крупный из ряда, при котором
 * перепад отметок укладывается в высоту листа.
 * ------------------------------------------------------------------ */
function verticalScale(rangeM: number, availMm: number, hScale: number): number {
  const fits = V_ROW.filter((v) => (rangeM * 1000) / v <= availMm && hScale / v <= MAX_EXAG);
  return fits.length ? fits[0] : Math.max((rangeM * 1000) / Math.max(availMm, 1), hScale / MAX_EXAG);
}

export type MainSheetMeta = {
  object: string;
  no?: string;
  index?: number;
  rev?: string;
  date?: string;
  stage?: string;
  /** горизонтальный масштаб, если задан вручную */
  scale?: number;
};

const fmt = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

export function mainProfileSheets(res: WaterMainResult, meta: MainSheetMeta): Sheet[] {
  const nodes = res.nodes;
  if (nodes.length < 2) throw new Error("Профиль водовода: в профиле меньше двух точек.");

  const totalLen = nodes[nodes.length - 1].stationM - nodes[0].stationM;
  const hScale = meta.scale ?? (H_ROW.find((h) => (totalLen * 1000) / h <= PAGE_MM * MAX_PAGES) ?? H_ROW[H_ROW.length - 1]);
  const pageLenM = (PAGE_MM * hScale) / 1000;

  /* вертикальный масштаб общий для всех листов: иначе один и тот же
     подъём на соседних листах выглядел бы по-разному. Берётся по
     полному размаху отметок — от низа трубы до линии энергии, потому
     что линия энергии после станции уходит выше земли на сотни метров
     и на чертеже обязана поместиться. */
  const top = Math.max(...nodes.map((n) => Math.max(n.groundM, n.hglM)));
  const bottom = Math.min(...nodes.map((n) => n.axisM));
  const vScale = verticalScale(Math.max(top - bottom + 4, 4), PAGE_H_MM, hScale);

  /* разбивка по листам — по точкам профиля, с перекрытием в одну точку:
     иначе между листами получается разрыв линии */
  const pages: WaterMainNode[][] = [];
  let cur: WaterMainNode[] = [];
  let start = nodes[0].stationM;
  nodes.forEach((n) => {
    if (cur.length && n.stationM - start > pageLenM) {
      cur.push(n);
      pages.push(cur);
      cur = [n];
      start = n.stationM;
    } else {
      cur.push(n);
    }
  });
  if (cur.length > 1) pages.push(cur);

  return pages.map((page, i) => oneSheet(res, page, hScale, vScale, meta, i + 1, pages.length));
}

function oneSheet(
  res: WaterMainResult,
  nodes: WaterMainNode[],
  hScale: number,
  vScale: number,
  meta: MainSheetMeta,
  page: number,
  pages: number,
): Sheet {
  const part = pages > 1 ? ` (лист ${page} из ${pages}: ${nodes[0].piket}–${nodes[nodes.length - 1].piket})` : "";
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(meta.object), "M", (meta.index ?? 1) + page - 1),
    title: "Продольный профиль напорного водовода" + part,
    object: meta.object,
    scale: hScale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  draw(sheet, res, nodes, hScale, vScale, page, pages);
  sheet.revisionRow();
  return sheet;
}

function draw(
  sheet: Sheet,
  res: WaterMainResult,
  nodes: WaterMainNode[],
  hScale: number,
  vScale: number,
  page: number,
  pages: number,
) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;

  const maxTop = Math.max(...nodes.map((n) => Math.max(n.groundM, n.hglM))) + 2;
  const minBottom = Math.min(...nodes.map((n) => n.axisM)) - 2;
  const datum = Math.floor(minBottom);

  const ROWS = 6;
  const rowH = 8; // мм бумаги
  const tableH = rowH * ROWS + 4;
  const vk = hScale / vScale;

  const px = f.x0 + P(34);
  const baseY = f.y0 + P(tableH + 14);
  const st0 = nodes[0].stationM;
  const X = (m: number) => px + (m - st0) * 1000;
  const Y = (elev: number) => baseY + (elev - datum) * 1000 * vk;
  const xEnd = X(nodes[nodes.length - 1].stationM);

  sheet.viewTitle(px, Y(maxTop) + P(26), "ПРОДОЛЬНЫЙ ПРОФИЛЬ ВОДОВОДА", "none");
  d.text(px, Y(maxTop) + P(19), ts, `ГОРИЗОНТАЛЬНЫЙ М 1:${hScale}   ВЕРТИКАЛЬНЫЙ М 1:${vScale}`, { align: "left" });

  /* --- условный горизонт и шкала отметок --- */
  d.line(px - P(18), baseY, xEnd + P(8), baseY, "THIN");
  d.text(px - P(18), baseY - ts * 1.7, ts, `УСЛОВНЫЙ ГОРИЗОНТ ${fmt(datum, 2)}`, { align: "left", layer: "THIN" });
  const range = maxTop - datum;
  const stepE = range > 400 ? 50 : range > 150 ? 20 : range > 60 ? 10 : range > 20 ? 5 : 2;
  for (let e = datum; e <= Math.ceil(maxTop); e += stepE) {
    d.line(px - P(18), Y(e), px - P(15), Y(e), "THIN");
    d.text(px - P(19), Y(e) - ts * 0.4, ts * 0.85, fmt(e, 1), { align: "right", layer: "THIN" });
  }

  /* --- три линии: земля, ось трубы, линия энергии --- */
  d.poly(nodes.map((n) => [X(n.stationM), Y(n.groundM)] as [number, number]), "CONTOUR", false);
  d.poly(nodes.map((n) => [X(n.stationM), Y(n.axisM)] as [number, number]), "PIPE", false);
  d.poly(nodes.map((n) => [X(n.stationM), Y(n.hglM)] as [number, number]), "WATER", false);

  /* --- насосные станции --- */
  const inPage = (m: number) => m >= nodes[0].stationM - 0.5 && m <= nodes[nodes.length - 1].stationM + 0.5;
  res.stations.forEach((s) => {
    if (!inPage(s.stationM)) return;
    const x = X(s.stationM);
    const y = Y(s.groundM);
    const w = P(4);
    const h = P(6);
    d.rect(x - w, y, w * 2, h, "EQUIP");
    d.line(x - w, y, x + w, y + h, "EQUIP");
    d.text(x, y + h + ts * 0.6, ts, s.name, { align: "center", layer: "EQUIP" });
    d.text(x, y + h + ts * 1.9, ts * 0.85, `H=${fmt(s.headM, 0)} м  N=${fmt(s.motorKW, 0)} кВт`, { align: "center", layer: "EQUIP" });
    d.line(x, Y(minBottom), x, Y(maxTop - 2), "AXIS");
  });

  /* --- вантузы: кружок над трубой; выпуски: треугольник под трубой --- */
  res.airValves.forEach((v) => {
    if (!inPage(v.stationM)) return;
    const x = X(v.stationM);
    const node = nodes.reduce((best, n) => (Math.abs(n.stationM - v.stationM) < Math.abs(best.stationM - v.stationM) ? n : best), nodes[0]);
    const y = Y(node.axisM);
    d.circle(x, y + P(3), P(1.4), "EQUIP");
    d.line(x, y, x, y + P(1.6), "EQUIP");
  });
  res.drains.forEach((v) => {
    if (!inPage(v.stationM)) return;
    const x = X(v.stationM);
    const node = nodes.reduce((best, n) => (Math.abs(n.stationM - v.stationM) < Math.abs(best.stationM - v.stationM) ? n : best), nodes[0]);
    const y = Y(node.axisM);
    d.poly([[x - P(1.6), y - P(1.6)], [x + P(1.6), y - P(1.6)], [x, y - P(4)]], "EQUIP", true);
  });

  /* --- самое опасное место листа: где линия энергии ближе всего к трубе --- */
  const worst = nodes.reduce((w, n) => (n.pressureM < w.pressureM ? n : w), nodes[0]);
  if (worst.pressureM < 20) {
    d.leader(
      X(worst.stationM),
      Y(worst.hglM),
      X(worst.stationM) + P(14),
      Y(worst.hglM) + P(16),
      `НАПОР ${fmt(worst.pressureM, 1)} м (${worst.piket})`,
      ts,
      1,
    );
  }

  /* ------------------------------------------------------------------
   * ТАБЛИЦА ПОД ПРОФИЛЕМ
   * ------------------------------------------------------------------ */
  const labels = [
    "Труба",
    "Давление, бар",
    "Пьезометрическая отметка, м",
    "Отметка оси трубы, м",
    "Отметка земли, м",
    "Расстояние / пикет",
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

  /* труба на всём листе одна: подписывается один раз по центру строки */
  d.text(
    (px + xEnd) / 2,
    cellY(0),
    ts * 0.9,
    `${res.outerMm}×${res.wallMm} мм, PN ${res.pnBar}, v = ${fmt(res.velocity)} м/с, Q = ${fmt(res.qM3H, 0)} м³/ч`,
    { align: "center", layer: "THIN" },
  );

  /* числа в точках: разворачиваются поперёк только при частом шаге —
     вертикальные числа читаются вдвое медленнее, а профиль смотрят в
     поле, стоя над траншеей */
  const minStepMm = Math.min(...nodes.slice(1).map((n, i) => ((n.stationM - nodes[i].stationM) * 1000) / sheet.s));
  const vertical = minStepMm < 16;
  const cellText = (x: number, r: number, value: string, h: number, last: boolean) => {
    if (vertical) {
      d.text(x, tTop - P(rowH * (r + 1)) + P(1), h, value, { align: "left", layer: "THIN", rot: 90 });
    } else if (last) {
      d.text(x - P(1.5), cellY(r), h, value, { align: "right", layer: "THIN" });
    } else {
      d.text(x + P(1.5), cellY(r), h, value, { align: "left", layer: "THIN" });
    }
  };

  nodes.forEach((n, i) => {
    const x = X(n.stationM);
    const last = i === nodes.length - 1;
    d.line(x, tTop, x, tTop - P(rowH * ROWS), "THIN");
    cellText(x, 1, fmt(n.pressureBar), ts * 0.8, last);
    cellText(x, 2, fmt(n.hglM, 1), ts * 0.8, last);
    cellText(x, 3, fmt(n.axisM, 1), ts * 0.8, last);
    cellText(x, 4, fmt(n.groundM, 1), ts * 0.8, last);
    cellText(x, 5, n.piket, ts * 0.85, last);
  });

  /* ------------------------------------------------------------------
   * ПРИМЕЧАНИЯ
   * ------------------------------------------------------------------ */
  sheet.note(
    `Вертикальный масштаб крупнее горизонтального в ${vk.toFixed(0)} раз: уклоны на чертеже выглядят круче действительных. Отметки читать по числам таблицы, не по картинке.`,
  );
  sheet.note(
    `Труба ${res.outerMm}×${res.wallMm} мм, класс давления PN ${res.pnBar}; наибольшее рабочее давление по трассе ${fmt(res.maxWorkingBar)} бар.`,
  );
  sheet.note(
    `Пьезометрическая линия — при работе насосов. Наименьший напор на листе ${fmt(worst.pressureM, 1)} м (${worst.piket}). ` +
      "Там, где эта линия подходит к оси трубы, при отключении насосов рвётся столб воды — режим отключения считается отдельно.",
  );
  if (pages > 1) sheet.note(`Лист ${page} из ${pages}. Трасса разрезана по точкам профиля, соседние листы перекрываются одной точкой.`);
  if (res.stations.length) {
    sheet.note(
      `Насосные станции: ${res.stations.map((s) => `${s.name} (${s.piket}, отм. ${fmt(s.groundM, 1)}, H=${fmt(s.headM, 0)} м)`).join("; ")}.`,
    );
  }
  sheet.note(
    `Вантузов на трассе ${res.airValves.length}, выпусков ${res.drains.length}; на этом листе показаны попадающие в его границы.`,
  );
  res.warnings.slice(0, 4).forEach((w) => sheet.note(w));
  sheet.note("Плановое положение трассы, углы поворота, упоры и колодцы на чертеже не показаны: план трассы в расчёт не вводится.");

  sheet.legend([
    { layer: "PIPE", text: "ось трубопровода" },
    { layer: "WATER", text: "пьезометрическая линия" },
    { layer: "CONTOUR", text: "поверхность земли" },
    { layer: "EQUIP", text: "станции, вантузы, выпуски" },
  ]);
}
