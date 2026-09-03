/* ==================================================================
 * МИНИМАЛЬНЫЙ ГЕНЕРАТОР DXF (AutoCAD R12 / AC1009)
 *
 * Формат R12 выбран сознательно: его открывают все версии AutoCAD,
 * NanoCAD, ZWCAD, BricsCAD, и он не требует таблиц дескрипторов.
 * Единицы — миллиметры, масштаб 1:1. Текст кодируется в CP1251,
 * как принято в русскоязычных CAD; спецсимволы AutoCAD: %%c — ⌀,
 * %%d — °, %%p — ±.
 * ================================================================== */

export type Layer = "CONTOUR" | "THIN" | "WATER" | "DIM" | "TEXT" | "AXIS" | "FLOW";

const LAYERS: Record<Layer, { color: number; ltype: string }> = {
  CONTOUR: { color: 7, ltype: "CONTINUOUS" }, // основной контур
  THIN: { color: 8, ltype: "CONTINUOUS" },    // тонкие линии
  WATER: { color: 5, ltype: "DASHED" },       // уровни воды
  DIM: { color: 3, ltype: "CONTINUOUS" },     // размеры
  TEXT: { color: 7, ltype: "CONTINUOUS" },    // подписи
  AXIS: { color: 1, ltype: "CENTER" },        // оси
  FLOW: { color: 4, ltype: "CONTINUOUS" },    // стрелки потока
};

export class Dxf {
  private ents: string[] = [];

  private n(v: number): string {
    return (Math.round(v * 100) / 100).toString();
  }

  line(x1: number, y1: number, x2: number, y2: number, layer: Layer = "CONTOUR") {
    this.ents.push(`0\nLINE\n8\n${layer}\n10\n${this.n(x1)}\n20\n${this.n(y1)}\n30\n0\n11\n${this.n(x2)}\n21\n${this.n(y2)}\n31\n0`);
  }

  poly(points: [number, number][], layer: Layer = "CONTOUR", closed = true) {
    const parts = [`0\nPOLYLINE\n8\n${layer}\n66\n1\n70\n${closed ? 1 : 0}\n10\n0\n20\n0\n30\n0`];
    for (const [x, y] of points) {
      parts.push(`0\nVERTEX\n8\n${layer}\n10\n${this.n(x)}\n20\n${this.n(y)}\n30\n0`);
    }
    parts.push(`0\nSEQEND\n8\n${layer}`);
    this.ents.push(parts.join("\n"));
  }

  rect(x: number, y: number, w: number, h: number, layer: Layer = "CONTOUR") {
    this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], layer, true);
  }

  circle(cx: number, cy: number, r: number, layer: Layer = "CONTOUR") {
    this.ents.push(`0\nCIRCLE\n8\n${layer}\n10\n${this.n(cx)}\n20\n${this.n(cy)}\n30\n0\n40\n${this.n(r)}`);
  }

  arc(cx: number, cy: number, r: number, a1: number, a2: number, layer: Layer = "CONTOUR") {
    this.ents.push(`0\nARC\n8\n${layer}\n10\n${this.n(cx)}\n20\n${this.n(cy)}\n30\n0\n40\n${this.n(r)}\n50\n${this.n(a1)}\n51\n${this.n(a2)}`);
  }

  text(x: number, y: number, h: number, value: string, opts: { layer?: Layer; align?: "left" | "center" | "right"; rot?: number } = {}) {
    const layer = opts.layer ?? "TEXT";
    const align = opts.align ?? "left";
    const code = align === "center" ? 1 : align === "right" ? 2 : 0;
    const rot = opts.rot ?? 0;
    const t = cadText(value);
    /* при выравнивании по центру/правому краю точка вставки — группа 11/21 */
    this.ents.push(
      `0\nTEXT\n8\n${layer}\n10\n${this.n(x)}\n20\n${this.n(y)}\n30\n0\n40\n${this.n(h)}\n1\n${t}\n50\n${this.n(rot)}\n72\n${code}\n11\n${this.n(x)}\n21\n${this.n(y)}\n31\n0`
    );
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

  toString(): string {
    const header = [
      "0", "SECTION", "2", "HEADER",
      "9", "$ACADVER", "1", "AC1009",
      "9", "$DWGCODEPAGE", "3", "ANSI_1251",
      "0", "ENDSEC",
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

    const tables = `0\nSECTION\n2\nTABLES\n${ltypes}\n${layers}\n0\nENDSEC`;
    const entities = `0\nSECTION\n2\nENTITIES\n${this.ents.join("\n")}\n0\nENDSEC`;

    return `${header}\n${tables}\n${entities}\n0\nEOF\n`;
  }

  /* байты в кодировке CP1251 для скачивания */
  toBytes(): Uint8Array {
    return encode1251(this.toString());
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
