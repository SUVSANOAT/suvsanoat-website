/* ==================================================================
 * ЛИСТ 1 КОМПЛЕКТА: ГЕНЕРАЛЬНЫЙ ПЛАН ПЛОЩАДКИ
 *
 * Что показывает лист (по образцу листа генплана концепт-проекта):
 *   — контур участка красной линией (слой SITE) с размерами сторон;
 *   — координационная сетка 10 м с буквенно-цифровой разметкой;
 *   — ограждение по контуру с воротами и въездом;
 *   — сооружения в плане по результату компоновки layoutSite() с
 *     номерами позиций в кружках и экспликацией справа;
 *   — проезды с твёрдым покрытием (штриховка, слой THIN);
 *   — подводящий коллектор от точки входа до первого сооружения и
 *     выпуск от последнего сооружения до точки сброса (слой PIPE,
 *     с DN из патрубков и стрелками потока);
 *   — полоса резерва расширения пунктиром;
 *   — санитарно-защитная зона (п. 1.10, табл. 1 ҚМҚ 2.04.03-19) и
 *     проверка расстояния до жилой застройки;
 *   — северная стрелка, румбовая диаграмма, масштабная линейка.
 *
 * Ничего не размещается «на глаз»: все координаты — из LayoutResult
 * (drawings/site/layout.ts), все нормативные величины — из
 * norms/kmk-2-04-03-19.ts с указанием пункта.
 *
 * Единицы: компоновка — в метрах, чертёж — в модельных мм (× 1000).
 * ================================================================== */

import type { Pt } from "../core/dxf";
import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { DrawingInput, StructureModel } from "../core/types";
import { kmkRef, sanitaryZone } from "../../norms/kmk-2-04-03-19";
import { bbox, type P2 } from "./geometry";
import { checkSzz, footprintM, MARGIN, sideName, type LayoutResult, type Side } from "./layout";

/** метры → модельные миллиметры чертежа */
const K = 1000;

export type SheetBuildMeta = {
  /** номер листа; по умолчанию SUV-<код объекта>-C-01001 */
  no?: string;
  /** индекс листа в комплекте (для автонумерации) */
  index?: number;
  rev?: string;
  date?: string;
  stage?: string;
  /** масштаб листа; по умолчанию подбирается по габариту */
  scale?: number;
  /** расстояние от границы площадки до жилой застройки, м (для проверки СЗЗ) */
  housingDistM?: number;
};

/* ==================================================================
 * ПОСТРОЕНИЕ ЛИСТА
 * ================================================================== */

/** поле под план на листе, мм бумаги (левая часть рабочего поля) */
const PLAN_W = 400;
const PLAN_H = 400;
/** левый нижний угол поля плана относительно рабочего поля, мм бумаги */
const PLAN_X = 30;
const PLAN_Y = 85;
/** колонка северной стрелки и розы ветров, мм бумаги от начала рабочего поля */
const ROSE_X = 578;

const SCALE_ROW = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];

/** масштаб генплана: участок с разметкой должен занять поле PLAN_W × PLAN_H */
export function planScale(widthM: number, heightM: number): number {
  const need = Math.max((widthM * K) / PLAN_W, (heightM * K) / PLAN_H);
  return SCALE_ROW.find((s) => s >= need) ?? 1000;
}

/**
 * Габарит изображения на листе: контур участка вместе с размещёнными
 * сооружениями, проездами и резервом. При fits:false сооружения выходят
 * за контур участка — масштаб берётся по объединённому габариту, чтобы
 * условное размещение целиком осталось в рабочем поле листа.
 */
export function planExtent(layout: LayoutResult): { minX: number; minY: number; w: number; h: number } {
  const pts: P2[] = [...layout.site];
  for (const p of layout.placed) pts.push([p.x, p.y], [p.x + p.w, p.y + p.h]);
  for (const r of layout.roads) pts.push([r.x, r.y], [r.x + r.w, r.y + r.h]);
  if (layout.reserve) pts.push([layout.reserve.x, layout.reserve.y], [layout.reserve.x + layout.reserve.w, layout.reserve.y + layout.reserve.h]);
  const e = bbox(pts);
  return { minX: e.minX, minY: e.minY, w: Math.max(e.w, 1), h: Math.max(e.h, 1) };
}

export function buildSitePlanSheet(
  input: DrawingInput,
  models: StructureModel[],
  layout: LayoutResult,
  meta: SheetBuildMeta = {},
): Sheet {
  const ext = planExtent(layout);
  const scale = meta.scale ?? planScale(ext.w, ext.h);
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(input.object), "C", meta.index ?? 1),
    title: "Генеральный план площадки очистных сооружений",
    object: input.object,
    scale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  drawSitePlan(sheet, input, models, layout, meta);
  sheet.revisionRow();
  return sheet;
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawSitePlan(
  sheet: Sheet,
  input: DrawingInput,
  models: StructureModel[],
  layout: LayoutResult,
  meta: SheetBuildMeta,
) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const th = sheet.th;

  const b = bbox(layout.site);
  const ext = planExtent(layout);

  /* начало координат: изображение (участок + размещение) центрируется в поле PLAN_W × PLAN_H */
  const px = f.x0 + P(PLAN_X) + Math.max(0, (P(PLAN_W) - ext.w * K) / 2) - ext.minX * K;
  const py = f.y0 + P(PLAN_Y) + Math.max(0, (P(PLAN_H) - ext.h * K) / 2) - ext.minY * K;
  /** метры компоновки → координаты листа */
  const X = (m: number) => px + m * K;
  const Y = (m: number) => py + m * K;

  sheet.viewTitle(f.x0 + P(PLAN_X), py + (ext.minY + ext.h) * K + P(24), "ГЕНЕРАЛЬНЫЙ ПЛАН");

  /* ---------------- координационная сетка 10 м ---------------- */
  drawGrid(sheet, X, Y, b.w, b.h);

  /* ---------------- контур участка ---------------- */
  const poly: Pt[] = layout.site.map(([x, y]) => [X(x), Y(y)] as Pt);
  d.poly(poly, "SITE", true);
  d.text(X(b.w / 2), Y(b.h) + P(4), ts, "ГРАНИЦА УЧАСТКА (КРАСНАЯ ЛИНИЯ)", { align: "center", layer: "SITE" });

  /* ---------------- ограждение с воротами ---------------- */
  drawFence(sheet, layout, X, Y);

  /* ---------------- проезды ---------------- */
  for (const r of layout.roads) {
    const rp: Pt[] = [[X(r.x), Y(r.y)], [X(r.x + r.w), Y(r.y)], [X(r.x + r.w), Y(r.y + r.h)], [X(r.x), Y(r.y + r.h)]];
    d.poly(rp, "THIN", true);
    d.hatch(rp, P(2.2), 45, "THIN");
  }
  if (layout.roads.length) {
    const r0 = layout.roads[layout.roads.length - 1];
    d.text(X(r0.x + r0.w / 2), Y(r0.y + r0.h / 2), ts * 0.9, "ПРОЕЗД", { align: "center", layer: "THIN" });
  }

  /* ---------------- резерв расширения ---------------- */
  if (layout.reserve) {
    const r = layout.reserve;
    d.rect(X(r.x), Y(r.y), r.w * K, r.h * K, "HIDDEN");
    d.text(X(r.x + r.w / 2), Y(r.y + r.h / 2), ts, "РЕЗЕРВ РАСШИРЕНИЯ", { align: "center", layer: "HIDDEN" });
    d.text(X(r.x + r.w / 2), Y(r.y + r.h / 2) - ts * 1.4, ts * 0.9, `${r.w.toFixed(0)}×${r.h.toFixed(0)} м`, { align: "center", layer: "HIDDEN" });
  }

  /* ---------------- сооружения ---------------- */
  for (const p of layout.placed) {
    drawStructure(sheet, p, X, Y);
  }

  /* ---------------- подводящий коллектор и выпуск ---------------- */
  drawPipes(sheet, input, layout, X, Y);

  /* ---------------- размеры сторон участка ---------------- */
  d.dimH(X(0), X(b.w), Y(0) - P(16), `${b.w.toFixed(0)} 000`, th);
  d.dimV(X(0) - P(16), Y(0), Y(b.h), `${b.h.toFixed(0)} 000`, th);
  d.text(X(b.w), Y(0) - P(24), ts, `Площадь участка ${layout.haveM2} м²`, { align: "right" });

  /* ---------------- СЗЗ ---------------- */
  const szz = szzInfo(input, models);
  drawSzz(sheet, layout, szz, X, Y, b.w, b.h);

  /* ---------------- северная стрелка, румбы, масштабная линейка ---------------- */
  const nx = f.x0 + P(ROSE_X);
  d.northArrow(nx, f.y0 + P(148), P(16));
  drawWindRose(sheet, nx, f.y0 + P(92), P(16), layout.housingSide);
  d.scaleBar(f.x0 + P(PLAN_X), f.y0 + P(42), sheet.s, th);

  /* ---------------- экспликация ---------------- */
  const tabX = f.x0 + f.w - P(146);
  const tabTop = f.y0 + f.h - P(14);
  const tabBottom = explication(sheet, layout, tabX, tabTop, P(144));

  /* ---------------- дефицит площади ---------------- */
  if (!layout.fits) {
    deficitBlock(sheet, layout, tabX, tabBottom - P(10), P(144));
  }

  /* ---------------- примечания и обозначения ---------------- */
  sheet.note(
    `Компоновка: ${layout.placed.length} сооружений, площадь застройки ${layout.builtM2} м², потребная площадь участка ${layout.needM2} м², имеется ${layout.haveM2} м².`,
  );
  for (const n of layout.notes) sheet.note(n);
  sheet.note(szz.text);
  const chk = checkSzz(szz.meters, meta.housingDistM ?? layout.housingDistM);
  sheet.note(chk.text);
  sheet.note(
    `Отступ сооружений от границы участка ${MARGIN} м, ширина проезда с твёрдым покрытием 4 м, зазор между сооружениями 1,5 м — принято по практике компоновки; ${kmkRef("6.11")} задаёт лишь порядок размещения по потоку, сами величины норматив не нормирует.`,
  );
  if (!layout.fits) sheet.note("ПЛОЩАДЬ УЧАСТКА НЕДОСТАТОЧНА — см. блок «Дефицит площади» на листе.");
  sheet.legend([
    { layer: "SITE", text: "граница участка" },
    { layer: "CONTOUR", text: "сооружения" },
    { layer: "PIPE", text: "трубопроводы" },
    { layer: "HATCH", text: "проезды, твёрдое покрытие" },
    { layer: "WATER", text: "ограждение площадки" },
  ]);
}

/* ---------------- координационная сетка ---------------- */

const GRID_LETTERS = "АБВГДЕЖИКЛМНПРСТУФШЭЮЯ";

function drawGrid(sheet: Sheet, X: (m: number) => number, Y: (m: number) => number, wM: number, hM: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const step = 10; // м — координационная сетка генплана, принято по практике
  const out = P(7);
  const r = P(3.2);
  let n = 0;
  for (let x = 0; x <= wM + 1e-6; x += step, n++) {
    d.line(X(x), Y(0) - out, X(x), Y(hM) + out, "GRID");
    d.circle(X(x), Y(hM) + out + r, r, "THIN");
    d.text(X(x), Y(hM) + out + r - ts * 0.35, ts * 0.9, String(n + 1), { align: "center" });
  }
  let m = 0;
  for (let y = 0; y <= hM + 1e-6; y += step, m++) {
    d.line(X(0) - out, Y(y), X(wM) + out, Y(y), "GRID");
    d.circle(X(0) - out - r, Y(y), r, "THIN");
    d.text(X(0) - out - r, Y(y) - ts * 0.35, ts * 0.9, GRID_LETTERS[m % GRID_LETTERS.length], { align: "center" });
  }
  d.text(X(wM) + out + r * 2, Y(hM) + out + r * 2, ts * 0.9, `сетка ${step}×${step} м`, { align: "left", layer: "THIN" });
}

/* ---------------- ограждение и ворота ---------------- */

function drawFence(sheet: Sheet, layout: LayoutResult, X: (m: number) => number, Y: (m: number) => number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const pts: Pt[] = layout.fence.map(([x, y]) => [X(x), Y(y)] as Pt);
  if (pts.length < 3) return;
  d.poly(pts, "WATER", true);
  /* столбы ограждения — засечки через 3 м по каждой стороне */
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.round(len / (3 * K)));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      d.circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, P(0.6), "WATER");
    }
  }
  /* ворота */
  const [gx, gy] = layout.gate;
  d.circle(X(gx), Y(gy), P(2.4), "CONTOUR");
  d.text(X(gx), Y(gy) - P(6), ts, "ВОРОТА, ВЪЕЗД", { align: "center" });
  d.text(X(layout.fence[0][0]), Y(layout.fence[0][1]) + P(2), ts * 0.9, "ОГРАЖДЕНИЕ", { align: "left", layer: "WATER" });
}

/* ---------------- сооружение в плане ---------------- */

function drawStructure(sheet: Sheet, p: LayoutResult["placed"][number], X: (m: number) => number, Y: (m: number) => number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const cx = X(p.x + p.w / 2);
  const cy = Y(p.y + p.h / 2);
  const isCircle = p.model.footprint.shape === "circle";
  if (isCircle) {
    d.circle(cx, cy, (Math.min(p.w, p.h) * K) / 2, "CONTOUR");
  } else {
    d.rect(X(p.x), Y(p.y), p.w * K, p.h * K, "CONTOUR");
  }
  /* номер позиции в кружке: внутри, если сооружение крупнее кружка, иначе на выноске */
  const r = P(3.4);
  const small = Math.min(p.w, p.h) * K < r * 2.6;
  const nx = small ? cx + (p.w * K) / 2 + r * 1.6 : cx;
  const ny = small ? cy + (p.h * K) / 2 + r * 1.6 : cy;
  if (small) d.line(cx, cy, nx, ny, "THIN");
  d.circle(nx, ny, r, "CONTOUR");
  d.text(nx, ny - ts * 0.4, ts, p.no, { align: "center" });
}

/* ---------------- коллектор и выпуск ---------------- */

function drawPipes(
  sheet: Sheet,
  input: DrawingInput,
  layout: LayoutResult,
  X: (m: number) => number,
  Y: (m: number) => number,
) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const water = layout.placed.filter((p) => p.row === "water").sort((a, b) => a.u0 - b.u0);
  if (!water.length) return;
  const first = water[0];
  const last = water[water.length - 1];
  const dnIn = nozzleDn(first.model, "in") ?? 150;
  const dnOut = nozzleDn(last.model, "out") ?? dnIn;

  /* подводящий коллектор: от точки за границей участка к грани первого сооружения */
  const inDir = outwardDir(layout.inletSide);
  const inStart: P2 = [layout.inlet[0] + inDir[0] * P(14) / K, layout.inlet[1] + inDir[1] * P(14) / K];
  routePipe(sheet, inStart, nearestEdgePoint(first, layout.inlet), X, Y, true);
  outsideLabel(sheet, inStart, inDir, `ПОДВОДЯЩИЙ КОЛЛЕКТОР DN${dnIn}`, X, Y);

  /* выпуск: от последнего сооружения за границу участка к точке сброса */
  const outDir = outwardDir(layout.outletSide);
  const outEnd: P2 = [layout.outlet[0] + outDir[0] * P(14) / K, layout.outlet[1] + outDir[1] * P(14) / K];
  routePipe(sheet, nearestEdgePoint(last, layout.outlet), outEnd, X, Y, true);
  outsideLabel(sheet, outEnd, outDir, `ВЫПУСК ОЧИЩЕННОЙ ВОДЫ DN${dnOut}`, X, Y);

  /* межсооруженческие связи ряда воды */
  for (let i = 0; i + 1 < water.length; i++) {
    const a = water[i], c = water[i + 1];
    const p1 = nearestEdgePoint(a, [c.x + c.w / 2, c.y + c.h / 2]);
    const p2 = nearestEdgePoint(c, [a.x + a.w / 2, a.y + a.h / 2]);
    routePipe(sheet, p1, p2, X, Y, true);
  }
  /* линия осадка: от последнего сооружения воды в первое сооружение осадка */
  const sludge = layout.placed.filter((p) => p.row === "sludge").sort((a, b) => a.u0 - b.u0);
  if (sludge.length) {
    const s0 = sludge[0];
    const p1 = nearestEdgePoint(last, [s0.x + s0.w / 2, s0.y + s0.h / 2]);
    const p2 = nearestEdgePoint(s0, [last.x + last.w / 2, last.y + last.h / 2]);
    routePipe(sheet, p1, p2, X, Y, true);
    d.text(X((p1[0] + p2[0]) / 2) + P(1), Y((p1[1] + p2[1]) / 2), ts * 0.9, "ИЗБЫТОЧНЫЙ ИЛ", { align: "left", layer: "PIPE" });
    for (let i = 0; i + 1 < sludge.length; i++) {
      const a = sludge[i], c = sludge[i + 1];
      routePipe(sheet, nearestEdgePoint(a, [c.x + c.w / 2, c.y + c.h / 2]), nearestEdgePoint(c, [a.x + a.w / 2, a.y + a.h / 2]), X, Y, true);
    }
  }
  void input;
}

function nozzleDn(m: StructureModel, role: "in" | "out"): number | null {
  const n = m.nozzles.find((z) => z.role === role);
  return n ? n.dn : null;
}

/** точка на грани прямоугольника сооружения, ближайшая к цели */
function nearestEdgePoint(p: LayoutResult["placed"][number], to: P2): P2 {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  const dx = to[0] - cx, dy = to[1] - cy;
  if (Math.abs(dx) * p.h >= Math.abs(dy) * p.w) return [dx >= 0 ? p.x + p.w : p.x, cy];
  return [cx, dy >= 0 ? p.y + p.h : p.y];
}

/** ортогональная трасса «сначала вдоль X, потом вдоль Y» со стрелкой в конце */
function routePipe(sheet: Sheet, a: P2, c: P2, X: (m: number) => number, Y: (m: number) => number, arrow: boolean) {
  const d = sheet.d;
  const head = sheet.p(2.2);
  const bend: P2 = [c[0], a[1]];
  const sameY = Math.abs(c[1] - a[1]) < 0.05;
  const sameX = Math.abs(c[0] - a[0]) < 0.05;
  if (sameY || sameX) {
    if (arrow) d.arrow(X(a[0]), Y(a[1]), X(c[0]), Y(c[1]), "PIPE", head);
    else d.line(X(a[0]), Y(a[1]), X(c[0]), Y(c[1]), "PIPE");
    return;
  }
  d.line(X(a[0]), Y(a[1]), X(bend[0]), Y(bend[1]), "PIPE");
  if (arrow) d.arrow(X(bend[0]), Y(bend[1]), X(c[0]), Y(c[1]), "PIPE", head);
  else d.line(X(bend[0]), Y(bend[1]), X(c[0]), Y(c[1]), "PIPE");
}

/** единичный вектор наружу от участка для стороны света */
function outwardDir(side: Side): P2 {
  return side === "W" ? [-1, 0] : side === "E" ? [1, 0] : side === "S" ? [0, -1] : [0, 1];
}

/**
 * Подпись за границей участка: текст уходит от площадки. Если он не
 * помещается до края рабочего поля — прижимается к краю и поднимается
 * над трубой, чтобы не вылезти за рамку листа.
 */
function outsideLabel(sheet: Sheet, at: P2, dir: P2, text: string, X: (m: number) => number, Y: (m: number) => number) {
  const d = sheet.d;
  const f = sheet.field;
  const ts = sheet.ts * 0.9;
  const w = text.length * ts * 0.62;
  if (dir[0] !== 0) {
    const anchor = X(at[0]) + dir[0] * sheet.p(2);
    const fits = dir[0] < 0 ? anchor - w >= f.x0 : anchor + w <= f.x0 + f.w;
    if (fits) {
      d.text(anchor, Y(at[1]) + ts * 0.6, ts, text, { align: dir[0] < 0 ? "right" : "left", layer: "PIPE" });
    } else {
      const x = dir[0] < 0 ? f.x0 + sheet.p(1) : f.x0 + f.w - sheet.p(1);
      d.text(x, Y(at[1]) + ts * 1.6, ts, text, { align: dir[0] < 0 ? "left" : "right", layer: "PIPE" });
    }
  } else {
    d.text(X(at[0]), Y(at[1]) + dir[1] * sheet.p(4), ts, text, { align: "center", layer: "PIPE" });
  }
}

/* ---------------- СЗЗ ---------------- */

export type SzzInfo = { meters: number; text: string; label: string };

/** СЗЗ: задана расчётом (input.szz) либо определяется по табл. 1 ҚМҚ 2.04.03-19 */
export function szzInfo(input: DrawingInput, models: StructureModel[]): SzzInfo {
  const beds = models.some((m) => m.kind === "sludge-beds");
  const auto = sanitaryZone(input.q, beds ? "mechbio-sludge-beds" : "mechbio-thermal", beds);
  const meters = input.szz ?? auto.meters;
  const text = input.szz
    ? `СЗЗ ${meters} м — принята по расчёту (${auto.basis}; по табл. 1 для данной производительности ${auto.meters} м).`
    : `СЗЗ ${meters} м — ${auto.basis}.`;
  return { meters, text, label: `СЗЗ по табл. 1 ҚМҚ 2.04.03-19 — ${meters} м` };
}

function drawSzz(
  sheet: Sheet,
  layout: LayoutResult,
  szz: SzzInfo,
  X: (m: number) => number,
  Y: (m: number) => number,
  wM: number,
  hM: number,
) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const side: Side = layout.housingSide ?? "S";
  /* если контур СЗЗ помещается в рабочее поле — показываем его штрихпунктиром */
  const room = P(20) / K; // м, запас поля вокруг участка
  if (szz.meters <= room) {
    const s = szz.meters;
    d.poly(
      [[X(-s), Y(-s)], [X(wM + s), Y(-s)], [X(wM + s), Y(hM + s)], [X(-s), Y(hM + s)]] as Pt[],
      "AXIS",
      true,
    );
    d.text(X(wM + s), Y(-s) - P(3), ts, szz.label, { align: "right", layer: "AXIS" });
    return;
  }
  /* иначе — вынос с разрывом в сторону жилой застройки */
  const from: P2 = side === "S" ? [wM * 0.7, 0] : side === "N" ? [wM * 0.7, hM] : side === "W" ? [0, hM * 0.7] : [wM, hM * 0.7];
  const dir: P2 = side === "S" ? [0, -1] : side === "N" ? [0, 1] : side === "W" ? [-1, 0] : [1, 0];
  const L = P(10);
  const x0 = X(from[0]), y0 = Y(from[1]);
  const x1 = x0 + dir[0] * L, y1 = y0 + dir[1] * L;
  d.line(x0, y0, x1, y1, "AXIS");
  /* знак разрыва */
  const mxp = (x0 + x1) / 2, myp = (y0 + y1) / 2;
  const nrm: P2 = [dir[1], -dir[0]];
  d.line(mxp - nrm[0] * P(2) - dir[0] * P(1), myp - nrm[1] * P(2) - dir[1] * P(1), mxp + nrm[0] * P(2) + dir[0] * P(1), myp + nrm[1] * P(2) + dir[1] * P(1), "AXIS");
  d.arrow(x0, y0, x0 + dir[0] * P(4), y0 + dir[1] * P(4), "AXIS", P(1.6));
  d.text(x1 + dir[0] * P(2) + (dir[0] === 0 ? P(2) : 0), y1 + dir[1] * P(1) - ts * 0.4, ts, `СЗЗ ${szz.meters} м`, { align: dir[0] < 0 ? "right" : "left", layer: "AXIS" });
  /* полный текст — под планом слева, чтобы не наезжать на размеры участка */
  d.text(X(0), Y(0) - P(34), ts, szz.label, { align: "left", layer: "AXIS" });
  d.text(X(0), Y(0) - P(40), ts * 0.9, `граница СЗЗ вне листа, направление — ${sideName(side)} (сторона жилой застройки)`, { align: "left", layer: "AXIS" });
}

/* ---------------- румбовая диаграмма ---------------- */

function drawWindRose(sheet: Sheet, cx: number, cy: number, r: number, housing?: Side) {
  const d = sheet.d;
  const ts = sheet.ts;
  const names = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  d.circle(cx, cy, r, "THIN");
  d.circle(cx, cy, r * 0.6, "THIN");
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 2 - (i * Math.PI) / 4;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    d.line(cx, cy, x, y, "THIN");
    d.text(cx + r * 1.22 * Math.cos(a), cy + r * 1.22 * Math.sin(a) - ts * 0.4, ts * 0.9, names[i], { align: "center" });
  }
  d.text(cx, cy - r * 1.7, ts * 0.9, "РОЗА ВЕТРОВ", { align: "center" });
  d.text(cx, cy - r * 1.7 - ts * 1.3, ts * 0.75, "повторяемость — по КМК 2.01.01-94", { align: "center" });
  d.text(cx, cy - r * 1.7 - ts * 2.4, ts * 0.75, "для района строительства; не задана", { align: "center" });
  if (housing) {
    d.text(cx, cy - r * 1.7 - ts * 3.7, ts * 0.8, `жилая застройка — ${sideName(housing)}`, { align: "center" });
  }
}

/* ---------------- экспликация ---------------- */

function explication(sheet: Sheet, layout: LayoutResult, x: number, yTop: number, w: number): number {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const cols = [0, P(11), P(11 + 74), P(11 + 74 + 33), w];
  const headH = P(11);
  let y = yTop;

  d.text(x, y + P(3), ts * 1.15, "ЭКСПЛИКАЦИЯ СООРУЖЕНИЙ", { align: "left" });
  y -= P(2);

  /* шапка */
  d.rect(x, y - headH, w, headH, "CONTOUR");
  const heads = ["Поз.", "Наименование сооружения", "Габарит в плане, м", "Площадь, м²"];
  heads.forEach((h, i) => {
    const lines = wrapText(h, Math.max(4, Math.floor((cols[i + 1] - cols[i]) / (ts * 0.62))), 2);
    lines.forEach((ln, k) =>
      d.text(x + (cols[i] + cols[i + 1]) / 2, y - headH / 2 - ts * 0.4 + (lines.length === 2 ? (k === 0 ? ts * 0.8 : -ts * 0.6) : 0), ts * 0.85, ln, { align: "center" }),
    );
  });
  for (const c of cols.slice(1, -1)) d.line(x + c, y - headH, x + c, y, "CONTOUR");
  y -= headH;

  /* строки */
  let totalArea = 0;
  for (const p of layout.placed) {
    const fp = footprintM(p.model);
    totalArea += fp.areaM2;
    const nameLines = wrapText(p.model.name, Math.floor((cols[2] - cols[1] - P(3)) / (ts * 0.6)), 2);
    const rowH = Math.max(P(7), nameLines.length * ts * 1.25 + P(2));
    d.rect(x, y - rowH, w, rowH, "CONTOUR");
    for (const c of cols.slice(1, -1)) d.line(x + c, y - rowH, x + c, y, "CONTOUR");
    const yc = y - rowH / 2 - ts * 0.4;
    d.text(x + (cols[0] + cols[1]) / 2, yc, ts, p.no, { align: "center" });
    nameLines.forEach((ln, k) =>
      d.text(x + cols[1] + P(1.5), yc + (nameLines.length === 2 ? (k === 0 ? ts * 0.75 : -ts * 0.65) : 0), ts * 0.9, ln, { align: "left" }),
    );
    const g =
      p.model.footprint.shape === "circle"
        ? `⌀ ${(p.model.footprint.d / 1000).toFixed(1)}`
        : `${(p.model.footprint.l / 1000).toFixed(1)} × ${(p.model.footprint.w / 1000).toFixed(1)}`;
    d.text(x + (cols[2] + cols[3]) / 2, yc, ts * 0.9, g, { align: "center" });
    d.text(x + (cols[3] + cols[4]) / 2, yc, ts * 0.9, fp.areaM2.toFixed(1), { align: "center" });
    y -= rowH;
  }

  /* итого */
  const totH = P(7);
  d.rect(x, y - totH, w, totH, "CONTOUR");
  d.line(x + cols[3], y - totH, x + cols[3], y, "CONTOUR");
  d.text(x + P(2), y - totH / 2 - ts * 0.4, ts, `ИТОГО ${layout.placed.length} поз.; застройка с проходами ${layout.builtM2} м²`, { align: "left" });
  d.text(x + (cols[3] + cols[4]) / 2, y - totH / 2 - ts * 0.4, ts * 0.9, totalArea.toFixed(1), { align: "center" });
  return y - totH;
}

/* ---------------- блок дефицита ---------------- */

function deficitBlock(sheet: Sheet, layout: LayoutResult, x: number, yTop: number, w: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  let y = yTop;
  d.text(x, y, sheet.th * 1.2, "ПЛОЩАДЬ УЧАСТКА НЕДОСТАТОЧНА", { align: "left", layer: "SITE" });
  y -= sheet.th * 1.6;
  d.text(x, y, ts, `Потребно ${layout.needM2} м², имеется ${layout.haveM2} м², дефицит ${layout.deficitM2} м².`, { align: "left", layer: "SITE" });
  y -= ts * 1.7;
  d.text(x, y, ts, "Размещение показано условно, вне габарита участка.", { align: "left", layer: "SITE" });
  y -= ts * 2.2;
  d.text(x, y, ts, "РЕШЕНИЯ:", { align: "left" });
  y -= ts * 1.6;
  const maxChars = Math.floor(w / (ts * 0.6));
  for (const h of layout.hint) {
    for (const ln of wrapText(`— ${h}`, maxChars, 3)) {
      d.text(x, y, ts * 0.9, ln, { align: "left" });
      y -= ts * 1.35;
    }
  }
}

/* ---------------- вспомогательное ---------------- */

export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].slice(0, Math.max(1, maxChars - 1)) + "…";
    return kept;
  }
  return lines;
}

/** отметка в формате чертежа: +0.000 / −1.500 */
export function fmtElev(v: number): string {
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
}
