/* ==================================================================
 * ГЕОМЕТРИЯ УЧАСТКА — ПЛОСКИЕ ОПЕРАЦИИ В МЕТРАХ
 *
 * Контур участка задаётся полигоном в метрах (SiteInput.polygon).
 * Здесь — площадь, габарит, точка в полигоне, офсет внутрь, повороты
 * и переносы прямоугольников, пересечения и расстояние до границы.
 * Всё без внешних библиотек; оси: X — восток, Y — север.
 * ================================================================== */

/** точка, м */
export type P2 = [number, number];

/** прямоугольник со сторонами вдоль осей: левый нижний угол и размеры, м */
export type Rect = { x: number; y: number; w: number; h: number };

export type BBox = { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number };

/** площадь полигона по формуле шнурков, м² (знак не важен — берём модуль) */
export function polygonArea(poly: P2[]): number {
  if (poly.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

/** периметр полигона, м */
export function polygonPerimeter(poly: P2[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    s += Math.hypot(x2 - x1, y2 - y1);
  }
  return s;
}

/** ориентированный по осям габарит */
export function bbox(poly: P2[]): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 };
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/** центр тяжести вершин (для подписи участка) */
export function centroid(poly: P2[]): P2 {
  if (!poly.length) return [0, 0];
  let sx = 0, sy = 0;
  for (const [x, y] of poly) { sx += x; sy += y; }
  return [sx / poly.length, sy / poly.length];
}

/** точка внутри полигона (луч вправо, чёт/нечет); точка на ребре считается внутри */
export function pointInPolygon(pt: P2, poly: P2[]): boolean {
  const [px, py] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (distPointToSegment(pt, poly[i], poly[j]) < 1e-9) return true;
    const cross = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (cross) inside = !inside;
  }
  return inside;
}

/** расстояние от точки до отрезка, м */
export function distPointToSegment(p: P2, a: P2, b: P2): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** минимальное расстояние от точки до границы полигона, м */
export function distPointToBoundary(p: P2, poly: P2[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const d = distPointToSegment(p, poly[i], poly[(i + 1) % poly.length]);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Офсет внутрь на отступ — упрощённо по габариту: прямоугольник bbox,
 * сжатый на offset с каждой стороны. Для прямоугольных участков точен,
 * для произвольных — используется совместно с rectInsidePolygon.
 */
export function insetBbox(poly: P2[], offset: number): Rect {
  const b = bbox(poly);
  return { x: b.minX + offset, y: b.minY + offset, w: Math.max(0, b.w - 2 * offset), h: Math.max(0, b.h - 2 * offset) };
}

/** углы прямоугольника (против часовой), при rotDeg ≠ 0 — поворот вокруг центра */
export function rectCorners(r: Rect, rotDeg = 0): P2[] {
  const pts: P2[] = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
  if (!rotDeg) return pts;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return pts.map((p) => rotatePoint(p, [cx, cy], rotDeg));
}

export function rotatePoint([x, y]: P2, [cx, cy]: P2, deg: number): P2 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

export function translateRect(r: Rect, dx: number, dy: number): Rect {
  return { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h };
}

/** поворот прямоугольника на 90° вокруг его левого нижнего угла (остаётся выровненным по осям) — меняет w и h местами */
export function rotateRect90(r: Rect): Rect {
  return { x: r.x, y: r.y, w: r.h, h: r.w };
}

/** габарит набора точек как Rect */
export function boundsOf(pts: P2[]): Rect {
  const b = bbox(pts);
  return { x: b.minX, y: b.minY, w: b.w, h: b.h };
}

/** пересечение прямоугольников (касание не считается); gap — требуемый зазор, м */
export function rectsIntersect(a: Rect, b: Rect, gap = 0): boolean {
  return !(a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y);
}

export function rectIntersection(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  if (x2 <= x || y2 <= y) return null;
  return { x, y, w: x2 - x, h: y2 - y };
}

/** прямоугольник целиком внутри полигона с отступом margin от границы */
export function rectInsidePolygon(r: Rect, poly: P2[], margin = 0, rotDeg = 0): boolean {
  for (const c of rectCorners(r, rotDeg)) {
    if (!pointInPolygon(c, poly)) return false;
    if (margin > 0 && distPointToBoundary(c, poly) < margin - 1e-9) return false;
  }
  /* для невыпуклых контуров проверяем и вершины полигона: они не должны попасть внутрь прямоугольника */
  for (const v of poly) if (pointStrictlyInRect(v, r, rotDeg)) return false;
  return true;
}

function pointStrictlyInRect(p: P2, r: Rect, rotDeg: number): boolean {
  const q = rotDeg ? rotatePoint(p, [r.x + r.w / 2, r.y + r.h / 2], -rotDeg) : p;
  return q[0] > r.x + 1e-9 && q[0] < r.x + r.w - 1e-9 && q[1] > r.y + 1e-9 && q[1] < r.y + r.h - 1e-9;
}

/** минимальное расстояние от прямоугольника до границы полигона, м (0 — касание/выход) */
export function distRectToBoundary(r: Rect, poly: P2[], rotDeg = 0): number {
  const corners = rectCorners(r, rotDeg);
  let best = Infinity;
  for (const c of corners) {
    if (!pointInPolygon(c, poly)) return 0;
    best = Math.min(best, distPointToBoundary(c, poly));
  }
  /* и вершины полигона к сторонам прямоугольника */
  for (const v of poly) {
    for (let i = 0; i < 4; i++) best = Math.min(best, distPointToSegment(v, corners[i], corners[(i + 1) % 4]));
  }
  return best;
}

/** середина стороны габарита участка: N — верх, S — низ, E — право, W — лево */
export function sideMidpoint(poly: P2[], side: "N" | "S" | "E" | "W"): P2 {
  const b = bbox(poly);
  switch (side) {
    case "N": return [(b.minX + b.maxX) / 2, b.maxY];
    case "S": return [(b.minX + b.maxX) / 2, b.minY];
    case "E": return [b.maxX, (b.minY + b.maxY) / 2];
    case "W": return [b.minX, (b.minY + b.maxY) / 2];
  }
}

/** противоположная сторона света */
export function oppositeSide(side: "N" | "S" | "E" | "W"): "N" | "S" | "E" | "W" {
  return side === "N" ? "S" : side === "S" ? "N" : side === "E" ? "W" : "E";
}

/** прямоугольный участок с отношением сторон ratio:1 (длина вдоль X) по площади, м; округление до 1 м */
export function rectByArea(areaM2: number, ratio = 1.5, minW = 0, minH = 0): P2[] {
  let w = Math.ceil(Math.sqrt(areaM2 * ratio));
  let h = Math.ceil(w / ratio);
  if (w < minW) { w = Math.ceil(minW); h = Math.max(h, Math.ceil(w / ratio)); }
  if (h < minH) { h = Math.ceil(minH); w = Math.max(w, Math.ceil(h * ratio)); }
  return [[0, 0], [w, 0], [w, h], [0, h]];
}
