/* ==================================================================
 * ГЕНЕРАТОР ЧЕРТЕЖЕЙ: DXF (AutoCAD R12 / AC1009) И SVG ДЛЯ ПЕЧАТИ
 *
 * Примитивы копятся в одном списке, из него собирается и DXF, и SVG.
 * DXF: единицы — миллиметры (INSUNITS = 4), масштаб 1:1, текст в
 * CP1251, спецсимволы AutoCAD: %%c — ⌀, %%d — °, %%p — ±.
 * В заголовок пишутся границы чертежа ($EXTMIN/$EXTMAX/$LIMMIN/
 * $LIMMAX) и активный вид VPORT — иначе CAD открывает файл в
 * стандартном виде и чертёж оказывается за экраном («пустой лист»).
 * SVG нужен для печати в PDF прямо из браузера.
 * ================================================================== */

export type Layer =
  | "CONTOUR" // основные контуры сооружений
  | "THIN" // тонкие линии, вспомогательное
  | "WATER" // уровень воды
  | "DIM" // размеры
  | "TEXT" // текст
  | "AXIS" // оси
  | "FLOW" // направление потока
  | "HATCH" // штриховка бетона/грунта
  | "EQUIP" // оборудование (насосы, мешалки, диффузоры)
  | "PIPE" // трубопроводы
  | "HIDDEN" // невидимые линии
  | "FRAME" // рамка и штамп
  | "SITE" // граница участка, дороги
  | "GRID"; // координационные оси

const LAYERS: Record<Layer, { color: number; ltype: string; ink: string; dash?: string; w: number }> = {
  CONTOUR: { color: 7, ltype: "CONTINUOUS", ink: "#111111", w: 1.6 },
  THIN: { color: 8, ltype: "CONTINUOUS", ink: "#666666", w: 0.8 },
  WATER: { color: 5, ltype: "DASHED", ink: "#1565c0", dash: "6 4", w: 0.9 },
  DIM: { color: 3, ltype: "CONTINUOUS", ink: "#1b7a3d", w: 0.8 },
  TEXT: { color: 7, ltype: "CONTINUOUS", ink: "#111111", w: 0.8 },
  AXIS: { color: 1, ltype: "CENTER", ink: "#b3261e", dash: "10 3 2 3", w: 0.7 },
  FLOW: { color: 4, ltype: "CONTINUOUS", ink: "#0f7f96", w: 1.2 },
  HATCH: { color: 9, ltype: "CONTINUOUS", ink: "#9a9a9a", w: 0.5 },
  EQUIP: { color: 6, ltype: "CONTINUOUS", ink: "#7b1fa2", w: 1.0 },
  PIPE: { color: 2, ltype: "CONTINUOUS", ink: "#2e7d32", w: 1.2 },
  HIDDEN: { color: 8, ltype: "DASHED", ink: "#777777", dash: "4 3", w: 0.7 },
  FRAME: { color: 7, ltype: "CONTINUOUS", ink: "#111111", w: 1.0 },
  SITE: { color: 1, ltype: "CONTINUOUS", ink: "#c62828", w: 1.4 },
  GRID: { color: 1, ltype: "CENTER", ink: "#b3261e", dash: "12 3 2 3", w: 0.6 },
};

/* ---------------- изометрия ----------------
 * Стандартная изометрия: оси X и Y под 30° к горизонтали, Z вертикально.
 * Возвращает точку на плоскости листа для точки модели (x, y, z), мм.
 */
const ISO_COS = Math.cos(Math.PI / 6);
const ISO_SIN = Math.sin(Math.PI / 6);

export function isoPoint(x: number, y: number, z: number, ox = 0, oy = 0): [number, number] {
  return [ox + (x - y) * ISO_COS, oy + (x + y) * ISO_SIN + z];
}

export type Pt = [number, number];

type Prim =
  | { t: "line"; layer: Layer; x1: number; y1: number; x2: number; y2: number }
  | { t: "poly"; layer: Layer; pts: [number, number][]; closed: boolean }
  | { t: "circle"; layer: Layer; cx: number; cy: number; r: number }
  | { t: "arc"; layer: Layer; cx: number; cy: number; r: number; a1: number; a2: number }
  | { t: "text"; layer: Layer; x: number; y: number; h: number; v: string; align: "left" | "center" | "right"; rot: number };

function n(v: number): string {
  return (Math.round(v * 100) / 100).toString();
}

export class Dxf {
  private prims: Prim[] = [];

  get size(): number {
    return this.prims.length;
  }

  /* перенос всех примитивов другого чертежа с оффсетом (сборка листов из блоков) */
  merge(other: Dxf, dx = 0, dy = 0) {
    for (const p of other.prims) {
      switch (p.t) {
        case "line": this.prims.push({ ...p, x1: p.x1 + dx, y1: p.y1 + dy, x2: p.x2 + dx, y2: p.y2 + dy }); break;
        case "poly": this.prims.push({ ...p, pts: p.pts.map(([x, y]) => [x + dx, y + dy] as Pt) }); break;
        case "circle":
        case "arc": this.prims.push({ ...p, cx: p.cx + dx, cy: p.cy + dy }); break;
        case "text": this.prims.push({ ...p, x: p.x + dx, y: p.y + dy }); break;
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, layer: Layer = "CONTOUR") {
    this.prims.push({ t: "line", layer, x1, y1, x2, y2 });
  }

  poly(points: [number, number][], layer: Layer = "CONTOUR", closed = true) {
    this.prims.push({ t: "poly", layer, pts: points, closed });
  }

  rect(x: number, y: number, w: number, h: number, layer: Layer = "CONTOUR") {
    this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], layer, true);
  }

  circle(cx: number, cy: number, r: number, layer: Layer = "CONTOUR") {
    this.prims.push({ t: "circle", layer, cx, cy, r });
  }

  arc(cx: number, cy: number, r: number, a1: number, a2: number, layer: Layer = "CONTOUR") {
    this.prims.push({ t: "arc", layer, cx, cy, r, a1, a2 });
  }

  text(x: number, y: number, h: number, value: string, opts: { layer?: Layer; align?: "left" | "center" | "right"; rot?: number } = {}) {
    this.prims.push({
      t: "text",
      layer: opts.layer ?? "TEXT",
      x,
      y,
      h,
      v: value,
      align: opts.align ?? "left",
      rot: opts.rot ?? 0,
    });
  }

  /* стрелка потока */
  arrow(x1: number, y1: number, x2: number, y2: number, layer: Layer = "FLOW", head = 120) {
    this.line(x1, y1, x2, y2, layer);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const a1 = ang + Math.PI - 0.4;
    const a2 = ang + Math.PI + 0.4;
    this.poly(
      [[x2, y2], [x2 + head * Math.cos(a1), y2 + head * Math.sin(a1)], [x2 + head * Math.cos(a2), y2 + head * Math.sin(a2)]],
      layer,
      true
    );
  }

  /* горизонтальная размерная линия с засечками */
  dimH(x1: number, x2: number, y: number, label: string, textH = 150) {
    const ext = textH * 0.7;
    this.line(x1, y - ext, x1, y + ext, "DIM");
    this.line(x2, y - ext, x2, y + ext, "DIM");
    this.line(x1, y, x2, y, "DIM");
    const tick = textH * 0.4;
    this.line(x1 - tick, y - tick, x1 + tick, y + tick, "DIM");
    this.line(x2 - tick, y - tick, x2 + tick, y + tick, "DIM");
    this.text((x1 + x2) / 2, y + textH * 0.35, textH, label, { layer: "DIM", align: "center" });
  }

  /* вертикальная размерная линия, текст повёрнут */
  dimV(x: number, y1: number, y2: number, label: string, textH = 150) {
    const ext = textH * 0.7;
    this.line(x - ext, y1, x + ext, y1, "DIM");
    this.line(x - ext, y2, x + ext, y2, "DIM");
    this.line(x, y1, x, y2, "DIM");
    const tick = textH * 0.4;
    this.line(x - tick, y1 - tick, x + tick, y1 + tick, "DIM");
    this.line(x - tick, y2 - tick, x + tick, y2 + tick, "DIM");
    this.text(x - textH * 0.35, (y1 + y2) / 2, textH, label, { layer: "DIM", align: "center", rot: 90 });
  }

  /* ---------------- штриховка ----------------
   * R12 не имеет сущности HATCH, штрихуем линиями: для каждой линии
   * семейства под углом angle с шагом spacing ищем пересечения с
   * рёбрами многоугольника и рисуем отрезки между парами пересечений
   * (правило чёт/нечет — работает и для невыпуклых контуров).
   */
  hatch(poly: Pt[], spacing = 60, angleDeg = 45, layer: Layer = "HATCH") {
    if (poly.length < 3) return;
    const a = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(a), dy = Math.sin(a); // направление линий
    const nx = -dy, ny = dx; // нормаль
    let minP = Infinity, maxP = -Infinity;
    for (const [x, y] of poly) {
      const p = x * nx + y * ny;
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
    for (let p = minP + spacing / 2; p < maxP; p += spacing) {
      /* линия: {X : X·n = p}; параметризуем вдоль d */
      const ts: number[] = [];
      for (let i = 0; i < poly.length; i++) {
        const [x1, y1] = poly[i];
        const [x2, y2] = poly[(i + 1) % poly.length];
        const p1 = x1 * nx + y1 * ny;
        const p2 = x2 * nx + y2 * ny;
        if ((p1 <= p && p2 > p) || (p2 <= p && p1 > p)) {
          const k = (p - p1) / (p2 - p1);
          const ix = x1 + (x2 - x1) * k;
          const iy = y1 + (y2 - y1) * k;
          ts.push(ix * dx + iy * dy);
        }
      }
      ts.sort((u, v) => u - v);
      for (let i = 0; i + 1 < ts.length; i += 2) {
        const base = [p * nx, p * ny];
        this.line(base[0] + ts[i] * dx, base[1] + ts[i] * dy, base[0] + ts[i + 1] * dx, base[1] + ts[i + 1] * dy, layer);
      }
    }
  }

  /* штриховка бетона: две семьи под 45° крестом, редкая */
  concrete(poly: Pt[], spacing = 120) {
    this.hatch(poly, spacing, 45);
    this.hatch(poly, spacing, -45);
  }

  /* грунт: короткие штрихи вдоль линии земли, ниже неё */
  groundLine(x1: number, x2: number, y: number, depth = 300, step = 250) {
    this.line(x1, y, x2, y, "CONTOUR");
    for (let x = x1; x < x2; x += step) this.line(x, y, x - depth * 0.6, y - depth, "HATCH");
  }

  /* отметка уровня: треугольник + текст, dir: 1 — вверх от линии, -1 — вниз */
  elevMark(x: number, y: number, label: string, h = 150, dir: 1 | -1 = 1) {
    const s = h * 0.9;
    this.poly([[x, y], [x - s / 2, y + dir * s], [x + s / 2, y + dir * s]], "DIM", true);
    this.line(x - s * 1.4, y + dir * s, x + s * 3, y + dir * s, "DIM");
    this.text(x + s * 0.6, y + dir * s + (dir === 1 ? h * 0.3 : -h * 1.3), h, label, { layer: "DIM" });
  }

  /* уровень воды: волна и треугольник */
  waterLevel(x: number, y: number, label?: string, h = 150) {
    const s = h * 0.9;
    this.poly([[x, y], [x - s / 2, y + s], [x + s / 2, y + s]], "WATER", true);
    this.line(x - s * 1.5, y, x + s * 1.5, y, "WATER");
    this.line(x - s, y - s * 0.35, x + s, y - s * 0.35, "WATER");
    this.line(x - s * 0.5, y - s * 0.7, x + s * 0.5, y - s * 0.7, "WATER");
    if (label) this.text(x + s * 1.8, y + h * 0.2, h, label, { layer: "WATER" });
  }

  /* марка разреза: две засечки с кружком и буквой, стрелка направления взгляда */
  sectionMark(x1: number, y1: number, x2: number, y2: number, label: string, h = 200, look: 1 | -1 = 1) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const nx = -Math.sin(ang) * look, ny = Math.cos(ang) * look;
    const L = h * 1.6;
    for (const [x, y] of [[x1, y1], [x2, y2]] as Pt[]) {
      this.line(x, y, x + nx * L, y + ny * L, "CONTOUR");
      this.line(x - Math.cos(ang) * h * 0.5, y, x + Math.cos(ang) * h * 0.5, y, "CONTOUR");
      this.circle(x + nx * L * 1.5, y + ny * L * 1.5, h * 0.55, "THIN");
      this.text(x + nx * L * 1.5, y + ny * L * 1.5 - h * 0.35, h * 0.8, label, { align: "center" });
    }
  }

  northArrow(x: number, y: number, size = 800) {
    this.circle(x, y, size / 2, "THIN");
    this.poly([[x, y + size * 0.45], [x - size * 0.12, y - size * 0.2], [x, y - size * 0.05], [x + size * 0.12, y - size * 0.2]], "CONTOUR", true);
    this.text(x, y + size * 0.55, size * 0.25, "С", { align: "center" });
  }

  /* масштабная линейка в модельных мм для масштаба scale (1:scale) */
  scaleBar(x: number, y: number, scale: number, h = 150) {
    /* длина сегмента — 1 м на листе при масштабе до 1:100, 5 м — 1:200..1:500, 10 м — крупнее */
    const seg = scale <= 100 ? 1000 : scale <= 500 ? 5000 : 10000;
    const bar = h * 0.6;
    for (let i = 0; i < 5; i++) {
      const x0 = x + i * seg;
      this.rect(x0, y, seg, bar, "CONTOUR");
      if (i % 2 === 0) this.hatch([[x0, y], [x0 + seg, y], [x0 + seg, y + bar], [x0, y + bar]], bar / 3, 45, "CONTOUR");
      this.text(x0, y - h * 1.2, h * 0.8, `${(i * seg) / 1000}`, { align: "center" });
    }
    this.text(x + 5 * seg, y - h * 1.2, h * 0.8, `${(5 * seg) / 1000} м`, { align: "center" });
    this.text(x, y + bar + h * 0.4, h * 0.8, `масштаб 1:${scale}`, { align: "left" });
  }

  /* выноска: полка с текстом */
  leader(x1: number, y1: number, x2: number, y2: number, text: string, h = 150, dir: 1 | -1 = 1) {
    this.line(x1, y1, x2, y2, "THIN");
    const shelf = text.length * h * 0.62 + h;
    this.line(x2, y2, x2 + dir * shelf, y2, "THIN");
    this.circle(x1, y1, h * 0.12, "THIN");
    this.text(dir === 1 ? x2 + h * 0.3 : x2 - dir * shelf + h * 0.3 - h * 0.6, y2 + h * 0.25, h, text, { align: "left" });
  }

  /* цепочка размеров по X: pts — координаты, y — линия */
  dimChainH(xs: number[], y: number, h = 150, labels?: string[]) {
    for (let i = 0; i + 1 < xs.length; i++) {
      const len = Math.abs(xs[i + 1] - xs[i]);
      const label = labels?.[i] ?? `${Math.round(len)}`;
      if (len < h * 3) {
        /* короткий сегмент (толщина стены): засечки есть, текст выносим выше */
        this.dimH(xs[i], xs[i + 1], y, "", h);
        this.text((xs[i] + xs[i + 1]) / 2, y + h * 1.6, h * 0.8, label, { layer: "DIM", align: "center" });
      } else this.dimH(xs[i], xs[i + 1], y, label, h);
    }
  }

  dimChainV(x: number, ys: number[], h = 150, labels?: string[]) {
    for (let i = 0; i + 1 < ys.length; i++) {
      const len = Math.abs(ys[i + 1] - ys[i]);
      const label = labels?.[i] ?? `${Math.round(len)}`;
      if (len < h * 3) {
        this.dimV(x, ys[i], ys[i + 1], "", h);
        this.text(x - h * 1.6, (ys[i] + ys[i + 1]) / 2, h * 0.8, label, { layer: "DIM", align: "center", rot: 90 });
      } else this.dimV(x, ys[i], ys[i + 1], label, h);
    }
  }

  /* эллипс полилинией (для изометрии круглых сооружений) */
  ellipse(cx: number, cy: number, rx: number, ry: number, layer: Layer = "CONTOUR", segments = 48, rotDeg = 0) {
    const pts: Pt[] = [];
    const r = (rotDeg * Math.PI) / 180;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * 2 * Math.PI;
      const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
      pts.push([cx + ex * Math.cos(r) - ey * Math.sin(r), cy + ex * Math.sin(r) + ey * Math.cos(r)]);
    }
    this.poly(pts, layer, true);
  }

  /* ---------------- изометрия ----------------
   * ox, oy — начало изометрического вида на листе; модельные мм.
   */
  isoLine(p1: [number, number, number], p2: [number, number, number], ox: number, oy: number, layer: Layer = "CONTOUR") {
    const a = isoPoint(p1[0], p1[1], p1[2], ox, oy);
    const b = isoPoint(p2[0], p2[1], p2[2], ox, oy);
    this.line(a[0], a[1], b[0], b[1], layer);
  }

  /* параллелепипед: x,y,z — угол, w по X, l по Y, h по Z; видимые рёбра */
  isoBox(x: number, y: number, z: number, w: number, l: number, h: number, ox: number, oy: number, layer: Layer = "CONTOUR", hidden = false) {
    const P = (a: number, b: number, c: number): [number, number, number] => [a, b, c];
    const c = [
      P(x, y, z), P(x + w, y, z), P(x + w, y + l, z), P(x, y + l, z),
      P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + l, z + h), P(x, y + l, z + h),
    ];
    /* при стандартной изометрии (взгляд из +X,−Y,+Z) видны: верх, передняя грань (y = y), правая грань (x = x+w) */
    const edges: [number, number][] = [
      [4, 5], [5, 6], [6, 7], [7, 4], // верх
      [0, 1], [1, 5], [0, 4], // передняя
      [1, 2], [2, 6], // правая
    ];
    for (const [i, j] of edges) this.isoLine(c[i], c[j], ox, oy, layer);
    if (hidden) {
      for (const [i, j] of [[2, 3], [3, 0], [3, 7]] as [number, number][]) this.isoLine(c[i], c[j], ox, oy, "HIDDEN");
    }
  }

  /* вертикальный цилиндр в изометрии: эллипсы верх/низ и образующие */
  isoCylinder(cx: number, cy: number, z: number, r: number, h: number, ox: number, oy: number, layer: Layer = "CONTOUR") {
    const top: Pt[] = [], bot: Pt[] = [];
    const N = 48;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * 2 * Math.PI;
      top.push(isoPoint(cx + r * Math.cos(a), cy + r * Math.sin(a), z + h, ox, oy));
      bot.push(isoPoint(cx + r * Math.cos(a), cy + r * Math.sin(a), z, ox, oy));
    }
    this.poly(top, layer, true);
    /* нижний эллипс — только передняя половина видна */
    const front = bot.filter((_, i) => { const a = (i / N) * 2 * Math.PI; return Math.sin(a - Math.PI / 4) <= 0; });
    this.poly(front, layer, false);
    /* образующие в крайних точках */
    const a1 = Math.PI / 4 + Math.PI / 2, a2 = Math.PI / 4 - Math.PI / 2;
    for (const a of [a1, a2]) {
      this.isoLine([cx + r * Math.cos(a), cy + r * Math.sin(a), z], [cx + r * Math.cos(a), cy + r * Math.sin(a), z + h], ox, oy, layer);
    }
  }

  /* ---------------- границы чертежа ---------------- */

  extents(): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const put = (x: number, y: number) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    };
    for (const p of this.prims) {
      switch (p.t) {
        case "line":
          put(p.x1, p.y1);
          put(p.x2, p.y2);
          break;
        case "poly":
          for (const [x, y] of p.pts) put(x, y);
          break;
        case "circle":
        case "arc":
          put(p.cx - p.r, p.cy - p.r);
          put(p.cx + p.r, p.cy + p.r);
          break;
        case "text": {
          const w = p.v.length * p.h * 0.62;
          const x0 = p.align === "center" ? p.x - w / 2 : p.align === "right" ? p.x - w : p.x;
          if (p.rot === 0) {
            put(x0, p.y);
            put(x0 + w, p.y + p.h);
          } else {
            put(p.x - p.h, p.y - w / 2);
            put(p.x + p.h, p.y + w / 2);
          }
          break;
        }
      }
    }
    if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    return { minX, minY, maxX, maxY };
  }

  /* ---------------- DXF ---------------- */

  private entityDxf(p: Prim): string {
    switch (p.t) {
      case "line":
        return `0\nLINE\n8\n${p.layer}\n10\n${n(p.x1)}\n20\n${n(p.y1)}\n30\n0\n11\n${n(p.x2)}\n21\n${n(p.y2)}\n31\n0`;
      case "poly": {
        const parts = [`0\nPOLYLINE\n8\n${p.layer}\n66\n1\n70\n${p.closed ? 1 : 0}\n10\n0\n20\n0\n30\n0`];
        for (const [x, y] of p.pts) parts.push(`0\nVERTEX\n8\n${p.layer}\n10\n${n(x)}\n20\n${n(y)}\n30\n0`);
        parts.push(`0\nSEQEND\n8\n${p.layer}`);
        return parts.join("\n");
      }
      case "circle":
        return `0\nCIRCLE\n8\n${p.layer}\n10\n${n(p.cx)}\n20\n${n(p.cy)}\n30\n0\n40\n${n(p.r)}`;
      case "arc":
        return `0\nARC\n8\n${p.layer}\n10\n${n(p.cx)}\n20\n${n(p.cy)}\n30\n0\n40\n${n(p.r)}\n50\n${n(p.a1)}\n51\n${n(p.a2)}`;
      case "text": {
        const code = p.align === "center" ? 1 : p.align === "right" ? 2 : 0;
        return `0\nTEXT\n8\n${p.layer}\n10\n${n(p.x)}\n20\n${n(p.y)}\n30\n0\n40\n${n(p.h)}\n1\n${cadText(p.v)}\n50\n${n(p.rot)}\n72\n${code}\n11\n${n(p.x)}\n21\n${n(p.y)}\n31\n0`;
      }
    }
  }

  toString(): string {
    const e = this.extents();
    const pad = Math.max((e.maxX - e.minX) * 0.03, (e.maxY - e.minY) * 0.03, 5);
    const minX = e.minX - pad, minY = e.minY - pad, maxX = e.maxX + pad, maxY = e.maxY + pad;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const height = Math.max(maxY - minY, 1);
    const width = Math.max(maxX - minX, 1);

    const header = [
      "0", "SECTION", "2", "HEADER",
      "9", "$ACADVER", "1", "AC1009",
      "9", "$DWGCODEPAGE", "3", "ANSI_1251",
      "9", "$INSUNITS", "70", "4",
      "9", "$EXTMIN", "10", n(minX), "20", n(minY), "30", "0",
      "9", "$EXTMAX", "10", n(maxX), "20", n(maxY), "30", "0",
      "9", "$LIMMIN", "10", n(minX), "20", n(minY),
      "9", "$LIMMAX", "10", n(maxX), "20", n(maxY),
      "0", "ENDSEC",
    ].join("\n");

    /* активный вид: без него CAD открывает файл в стандартном окне */
    const vport = [
      "0", "TABLE", "2", "VPORT", "70", "1",
      "0", "VPORT", "2", "*ACTIVE", "70", "0",
      "10", "0.0", "20", "0.0",
      "11", "1.0", "21", "1.0",
      "12", n(cx), "22", n(cy),
      "13", "0.0", "23", "0.0",
      "14", "10.0", "24", "10.0",
      "15", "0.0", "25", "0.0",
      "16", "0.0", "26", "0.0", "36", "1.0",
      "17", "0.0", "27", "0.0", "37", "0.0",
      "40", n(height * 1.05),
      "41", n(width / height),
      "42", "50.0", "43", "0.0", "44", "0.0",
      "50", "0.0", "51", "0.0",
      "71", "0", "72", "100", "73", "1", "74", "3",
      "75", "0", "76", "0", "77", "0", "78", "0",
      "0", "ENDTAB",
    ].join("\n");

    const ltypes = [
      "0", "TABLE", "2", "LTYPE", "70", "3",
      "0", "LTYPE", "2", "CONTINUOUS", "70", "0", "3", "Solid line", "72", "65", "73", "0", "40", "0",
      "0", "LTYPE", "2", "DASHED", "70", "0", "3", "__ __ __", "72", "65", "73", "2", "40", "300", "49", "200", "49", "-100",
      "0", "LTYPE", "2", "CENTER", "70", "0", "3", "____ _ ____", "72", "65", "73", "4", "40", "700", "49", "400", "49", "-100", "49", "100", "49", "-100",
      "0", "ENDTAB",
    ].join("\n");

    const layerRows = (Object.keys(LAYERS) as Layer[])
      .map((name) => `0\nLAYER\n2\n${name}\n70\n0\n62\n${LAYERS[name].color}\n6\n${LAYERS[name].ltype}`)
      .join("\n");
    const layers = `0\nTABLE\n2\nLAYER\n70\n${Object.keys(LAYERS).length}\n${layerRows}\n0\nENDTAB`;

    const tables = `0\nSECTION\n2\nTABLES\n${vport}\n${ltypes}\n${layers}\n0\nENDSEC`;
    const entities = `0\nSECTION\n2\nENTITIES\n${this.prims.map((p) => this.entityDxf(p)).join("\n")}\n0\nENDSEC`;

    return `${header}\n${tables}\n${entities}\n0\nEOF\n`;
  }

  /* байты в кодировке CP1251 для скачивания */
  toBytes(): Uint8Array {
    return encode1251(this.toString());
  }

  /* ---------------- SVG (для просмотра и печати в PDF) ---------------- */

  toSvg(title?: string): string {
    const e = this.extents();
    const pad = Math.max((e.maxX - e.minX) * 0.02, (e.maxY - e.minY) * 0.02, 5);
    const minX = e.minX - pad;
    const maxX = e.maxX + pad;
    const minY = e.minY - pad;
    const maxY = e.maxY + pad;
    const w = maxX - minX;
    const h = maxY - minY;
    const k = w / 1400; // толщина линий в единицах чертежа
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    /* ось Y в SVG направлена вниз — отражаем всю картинку */
    const parts: string[] = [];
    for (const p of this.prims) {
      const L = LAYERS[p.layer];
      const stroke = `stroke="${L.ink}" stroke-width="${n(L.w * k)}" fill="none"${L.dash ? ` stroke-dasharray="${n(L.w * k * 6)} ${n(L.w * k * 4)}"` : ""}`;
      switch (p.t) {
        case "line":
          parts.push(`<line x1="${n(p.x1)}" y1="${n(-p.y1)}" x2="${n(p.x2)}" y2="${n(-p.y2)}" ${stroke}/>`);
          break;
        case "poly": {
          const d = p.pts.map(([x, y]) => `${n(x)},${n(-y)}`).join(" ");
          parts.push(p.closed ? `<polygon points="${d}" ${stroke}/>` : `<polyline points="${d}" ${stroke}/>`);
          break;
        }
        case "circle":
          parts.push(`<circle cx="${n(p.cx)}" cy="${n(-p.cy)}" r="${n(p.r)}" ${stroke}/>`);
          break;
        case "arc": {
          const a1 = (p.a1 * Math.PI) / 180;
          const a2 = (p.a2 * Math.PI) / 180;
          const x1 = p.cx + p.r * Math.cos(a1);
          const y1 = -(p.cy + p.r * Math.sin(a1));
          const x2 = p.cx + p.r * Math.cos(a2);
          const y2 = -(p.cy + p.r * Math.sin(a2));
          const sweep = ((p.a2 - p.a1 + 360) % 360) > 180 ? 1 : 0;
          parts.push(`<path d="M ${n(x1)} ${n(y1)} A ${n(p.r)} ${n(p.r)} 0 ${sweep} 0 ${n(x2)} ${n(y2)}" ${stroke}/>`);
          break;
        }
        case "text": {
          const anchor = p.align === "center" ? "middle" : p.align === "right" ? "end" : "start";
          const rot = p.rot ? ` transform="rotate(${n(-p.rot)} ${n(p.x)} ${n(-p.y)})"` : "";
          parts.push(
            `<text x="${n(p.x)}" y="${n(-p.y)}" font-size="${n(p.h)}" fill="${LAYERS[p.layer].ink}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif"${rot}>${esc(p.v)}</text>`
          );
          break;
        }
      }
    }

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(minX)} ${n(-maxY)} ${n(w)} ${n(h)}" ` +
      `width="100%" preserveAspectRatio="xMidYMid meet">` +
      (title ? `<title>${esc(title)}</title>` : "") +
      `<rect x="${n(minX)}" y="${n(-maxY)}" width="${n(w)}" height="${n(h)}" fill="#ffffff"/>` +
      parts.join("") +
      `</svg>`
    );
  }
}

/* --- текст: спецсимволы AutoCAD и упрощения --- */
function cadText(value: string): string {
  return value
    .replace(/⌀|Ø|∅/g, "%%c")
    .replace(/°/g, "%%d")
    .replace(/±/g, "%%p")
    .replace(/³/g, "3")
    .replace(/²/g, "2")
    .replace(/₅/g, "5")
    .replace(/₂/g, "2")
    .replace(/[–—]/g, "-")
    .replace(/[«»„“”]/g, '"')
    .replace(/·/g, ".")
    .replace(/≈/g, "~")
    .replace(/µ/g, "мк")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/→/g, "->")
    .replace(/×/g, "x");
}

/* --- CP1251 --- */
function encode1251(s: string): Uint8Array {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c >= 0x410 && c <= 0x44f) out.push(0xc0 + (c - 0x410));
    else if (c === 0x401) out.push(0xa8);
    else if (c === 0x451) out.push(0xb8);
    else if (c === 0x40e) out.push(0xa1);
    else if (c === 0x45e) out.push(0xa2);
    else if (c === 0x492 || c === 0x493) out.push(c === 0x492 ? 0xc3 : 0xe3); // Ғ→Г
    else if (c === 0x49a || c === 0x49b) out.push(c === 0x49a ? 0xca : 0xea); // Қ→К
    else if (c === 0x4b2 || c === 0x4b3) out.push(c === 0x4b2 ? 0xd5 : 0xf5); // Ҳ→Х
    else if (c === 0x2116) out.push(0xb9); // №
    else if (c === 0xa0) out.push(0x20);
    else out.push(0x3f);
  }
  return new Uint8Array(out);
}

/* скачивание в браузере */
export function downloadDxf(dxf: Dxf, filename: string) {
  const bytes = dxf.toBytes();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* открыть чертёж в новом окне и вызвать печать — «Сохранить как PDF» */
export function printDxf(dxf: Dxf, title: string, landscape = true) {
  const svg = dxf.toSvg(title);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Браузер заблокировал новое окно. Разрешите всплывающие окна для сайта и повторите.");
    return;
  }
  win.document.write(
    `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title>` +
      `<style>@page{size:A3 ${landscape ? "landscape" : "portrait"};margin:8mm}` +
      `body{margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif}` +
      `.bar{padding:10px 14px;border-bottom:1px solid #ddd;font-size:13px;display:flex;gap:12px;align-items:center}` +
      `button{padding:8px 16px;font-size:13px;cursor:pointer}` +
      `@media print{.bar{display:none}}</style></head><body>` +
      `<div class="bar"><button onclick="window.print()">Печать / Сохранить в PDF</button><span>${title}</span></div>` +
      svg +
      `</body></html>`
  );
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* пользователь напечатает кнопкой */
    }
  }, 400);
}
