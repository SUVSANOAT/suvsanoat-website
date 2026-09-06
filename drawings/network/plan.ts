/* ==================================================================
 * ПЛАН САМОТЁЧНОЙ КАНАЛИЗАЦИОННОЙ СЕТИ
 *
 * Трасса с колодцами, диаметрами, уклонами и направлением течения.
 * Рисуется по координатам узлов; если координат нет (проектировщик
 * задал только длины участков), трасса разворачивается в прямую линию
 * — и об этом прямо сказано в примечании, чтобы никто не принял схему
 * за геодезически привязанный план.
 *
 * План — схема трассы, а не топографическая подоснова. Подложку
 * (съёмку, кварталы, существующие сети) проектировщик подкладывает у
 * себя в CAD: у нас её нет, и рисовать её «примерно» нельзя.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { NetworkInput, NetworkResult } from "../../calculations/network";
import type { NetworkSheetMeta } from "./profile";

const SCALE_ROW = [200, 250, 500, 1000, 2000, 2500, 5000];

function pickScaleFor(sizeM: number, paperMm: number): number {
  return SCALE_ROW.find((s) => s >= (sizeM * 1000) / paperMm) ?? SCALE_ROW[SCALE_ROW.length - 1];
}

const fmt = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

export function networkPlanSheet(input: NetworkInput, res: NetworkResult, meta: NetworkSheetMeta): Sheet {
  const segs = res.segments;
  if (!segs.length) throw new Error("План сети: нет ни одного участка.");

  /* --- координаты узлов; при отсутствии — разворачиваем в линию --- */
  const hasXY = input.nodes.every((n) => n.x !== undefined && n.y !== undefined);
  const pos = new Map<string, { x: number; y: number }>();
  if (hasXY) {
    input.nodes.forEach((n) => pos.set(n.id, { x: n.x as number, y: n.y as number }));
  } else {
    let u = 0;
    segs.forEach((s, i) => {
      if (i === 0) pos.set(s.from, { x: 0, y: 0 });
      u += s.lengthM;
      pos.set(s.to, { x: u, y: 0 });
    });
  }

  const xs = [...pos.values()].map((p) => p.x);
  const ys = [...pos.values()].map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  const scale = meta.scale ?? pickScaleFor(Math.max(w / 0.9, h / 0.55, 30), 520);

  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(meta.object), "M", meta.index ?? 2),
    title: meta.branch ? `План сети. ${meta.branch}` : "План самотёчной канализационной сети",
    object: meta.object,
    scale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  draw(sheet, res, pos, { minX: Math.min(...xs), minY: Math.min(...ys), w, h }, hasXY, input);
  sheet.revisionRow();
  return sheet;
}

function draw(
  sheet: Sheet,
  res: NetworkResult,
  pos: Map<string, { x: number; y: number }>,
  box: { minX: number; minY: number; w: number; h: number },
  hasXY: boolean,
  input: NetworkInput,
) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;

  /* центрируем трассу в рабочем поле */
  const ox = f.x0 + (f.w - box.w * 1000) / 2 - box.minX * 1000;
  const oy = f.y0 + (f.h - box.h * 1000) / 2 - box.minY * 1000 + P(10);
  const X = (m: number) => ox + m * 1000;
  const Y = (m: number) => oy + m * 1000;

  sheet.viewTitle(f.x0, f.y0 + f.h - P(4), "ПЛАН СЕТИ", sheet.s);

  /* --- участки --- */
  res.segments.forEach((s) => {
    const a = pos.get(s.from);
    const b = pos.get(s.to);
    if (!a || !b) return;
    const x1 = X(a.x);
    const y1 = Y(a.y);
    const x2 = X(b.x);
    const y2 = Y(b.y);
    d.line(x1, y1, x2, y2, "PIPE");

    /* стрелка течения — в середине участка */
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    d.arrow(mx - ux * P(4), my - uy * P(4), mx + ux * P(4), my + uy * P(4), "FLOW", P(2));

    /* Подпись участка идёт вдоль трассы и ВСЕГДА сверху от неё: на
       ломаной трассе перпендикуляр меняет сторону, и подписи начинают
       наезжать на отметки колодцев, которые стоят снизу. */
    const rot = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const rotFixed = rot > 90 || rot < -90 ? rot + 180 : rot; // текст не вверх ногами
    const side = -uy >= 0 ? 1 : -1;
    d.text(
      mx - uy * P(3.5) * side,
      my + ux * P(3.5) * side,
      ts * 0.95,
      `d${s.dnMm}  i=${s.slope.toFixed(4).replace(".", ",")}  L=${fmt(s.lengthM, 1)} м`,
      { align: "center", layer: "TEXT", rot: rotFixed },
    );
  });

  /* --- колодцы --- */
  const r = P(1.6);
  const seen = new Set<string>();
  const put = (id: string, ground: number, depth: number) => {
    if (seen.has(id)) return;
    seen.add(id);
    const p = pos.get(id);
    if (!p) return;
    const x = X(p.x);
    const y = Y(p.y);
    d.circle(x, y, r, "CONTOUR");
    /* номер колодца и его отметки — снизу от трассы, подписи участков
       идут сверху: так они не спорят между собой на ломаной трассе */
    d.text(x, y - r * 2.4, ts, id, { align: "center", layer: "TEXT" });
    d.text(x, y - r * 2.4 - ts * 1.3, ts * 0.8, `з.${fmt(ground)} / h=${fmt(depth)}`, { align: "center", layer: "THIN" });
  };
  res.segments.forEach((s, i) => {
    if (i === 0) put(s.from, s.invertStart + s.depthStart, s.depthStart);
    put(s.to, s.invertEnd + s.depthEnd, s.depthEnd);
  });

  /* --- выпуск --- */
  const last = res.segments[res.segments.length - 1];
  const lp = pos.get(last.to);
  if (lp) {
    d.text(X(lp.x), Y(lp.y) + P(6), ts * 1.1, "НА ОЧИСТНЫЕ СООРУЖЕНИЯ", { align: "center", layer: "FLOW" });
  }

  d.northArrow(f.x0 + f.w - P(18), f.y0 + f.h - P(26), P(9));
  d.scaleBar(f.x0, f.y0 + P(10), sheet.s, ts);

  /* --- примечания --- */
  if (!hasXY) {
    sheet.note(
      "Координаты узлов не заданы: трасса развёрнута в прямую линию по длинам участков. Это схема последовательности колодцев, а не план — геометрию трассы наносить по съёмке.",
    );
  } else if (input.elevSource !== "survey") {
    sheet.note(
      "Плановое положение снято с рельефа Google Earth: годится для трассировки и согласования направления, для рабочей документации нужна съёмка.",
    );
  }
  sheet.note(`Всего колодцев ${seen.size}, участков ${res.segments.length}, общая длина ${fmt(res.segments.reduce((a, s) => a + s.lengthM, 0), 1)} м.`);
  sheet.note(`Расчётный расход в конечной точке ${fmt(res.totalCalcLps)} л/с (${fmt(res.totalM3Day, 1)} м³/сут).`);
  sheet.note("Подложка (кварталы, существующие сети, дороги) не показана — накладывается проектировщиком в CAD.");

  sheet.legend([
    { layer: "PIPE", text: "проектируемый самотёчный коллектор" },
    { layer: "CONTOUR", text: "смотровые колодцы" },
  ]);
}
