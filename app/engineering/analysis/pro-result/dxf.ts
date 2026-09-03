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

export type Layer = "CONTOUR" | "THIN" | "WATER" | "DIM" | "TEXT" | "AXIS" | "FLOW";

const LAYERS: Record<Layer, { color: number; ltype: string; ink: string; dash?: string; w: number }> = {
  CONTOUR: { color: 7, ltype: "CONTINUOUS", ink: "#111111", w: 1.6 },
  THIN: { color: 8, ltype: "CONTINUOUS", ink: "#666666", w: 0.8 },
  WATER: { color: 5, ltype: "DASHED", ink: "#1565c0", dash: "6 4", w: 0.9 },
  DIM: { color: 3, ltype: "CONTINUOUS", ink: "#1b7a3d", w: 0.8 },
  TEXT: { color: 7, ltype: "CONTINUOUS", ink: "#111111", w: 0.8 },
  AXIS: { color: 1, ltype: "CENTER", ink: "#b3261e", dash: "10 3 2 3", w: 0.7 },
  FLOW: { color: 4, ltype: "CONTINUOUS", ink: "#0f7f96", w: 1.2 },
};

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
