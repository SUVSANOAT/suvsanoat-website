/* ==================================================================
 * ЛИСТ А1 СО ШТАМПОМ SUVSANOAT
 *
 * DXF — модельное пространство в миллиметрах 1:1. Лист А1 (841×594)
 * рисуется увеличенным в `scale` раз, так что при печати в масштабе
 * 1:scale он ложится ровно на бумагу А1, а все сооружения на нём —
 * в натуральных миллиметрах. Один масштаб на лист (как у NOD):
 * 1:50 — сооружения, 1:100 — крупные, 1:500 — генплан.
 *
 * Компоновка листа (по образцу концепт-проекта NOD):
 *   ┌────────────────────────────────────────────┬──────────┐
 *   │  рабочее поле: план, разрезы, изометрия     │ примеча- │
 *   │                                            │ ния,     │
 *   │                                            │ обозна-  │
 *   │                                            │ чения    │
 *   │                                            ├──────────┤
 *   │                                            │ штамп    │
 *   └────────────────────────────────────────────┴──────────┘
 * ================================================================== */

import { Dxf, type Pt } from "./dxf";

export const A1 = { w: 841, h: 594 } as const;
/** правая колонка: примечания + штамп, мм бумаги */
const RIGHT_COL = 150;
const MARGIN_L = 20;
const MARGIN = 10;

export type SheetMeta = {
  /** номер листа: SUV-<OBJ>-C-01003 */
  no: string;
  /** наименование листа (до 3 строк) */
  title: string;
  /** объект: «КОС молокозавода, 500 м³/сут» */
  object: string;
  /** стадия — всегда концептуальная для онлайн-комплекта */
  stage?: string;
  /** масштаб 1:scale */
  scale: number;
  /** версия/ревизия */
  rev?: string;
  date?: string;
  notes?: string[];
  legend?: { layer: "CONTOUR" | "HATCH" | "WATER" | "PIPE" | "EQUIP" | "SITE"; text: string }[];
};

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function wrap(text: string, maxChars: number, maxLines = 3): string[] {
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
  return lines.slice(0, maxLines);
}

export class Sheet {
  readonly d = new Dxf();
  readonly s: number;
  /** высота основного текста в модельных мм (3,5 мм на бумаге) */
  readonly th: number;
  /** мелкий текст (2,5 мм) */
  readonly ts: number;
  private noteCount = 0;

  constructor(readonly meta: SheetMeta) {
    this.s = meta.scale;
    this.th = 3.5 * this.s;
    this.ts = 2.5 * this.s;
    this.frame();
    this.titleBlock();
    this.notesBox();
  }

  /** бумажные мм → модельные */
  p(v: number): number {
    return v * this.s;
  }

  /** рабочее поле листа в модельных мм: x0,y0 — левый нижний угол; w,h — размер */
  get field(): { x0: number; y0: number; w: number; h: number } {
    return {
      x0: this.p(MARGIN_L),
      y0: this.p(MARGIN),
      w: this.p(A1.w - MARGIN_L - MARGIN - RIGHT_COL - 5),
      h: this.p(A1.h - 2 * MARGIN),
    };
  }

  /** заголовок вида: «ПЛАН» / «РАЗРЕЗ 1-1», с подчёркиванием и масштабом */
  viewTitle(x: number, y: number, title: string, scale?: number | "none") {
    const h = this.p(5);
    this.d.text(x, y, h, title, { align: "left" });
    const w = title.length * h * 0.62;
    this.d.line(x, y - h * 0.4, x + w, y - h * 0.4, "CONTOUR");
    if (scale !== "none") this.d.text(x, y - h * 0.4 - this.ts * 1.3, this.ts, `М 1:${scale ?? this.s}`, { align: "left" });
  }

  /** добавить примечание в правую колонку */
  note(text: string) {
    const lines = wrap(text, 42, 6);
    const x = this.p(A1.w - MARGIN - RIGHT_COL + 3);
    const yTop = this.p(A1.h - MARGIN - 12);
    const lineH = this.ts * 1.45;
    const y = yTop - this.noteCount * lineH;
    this.d.text(x, y, this.ts, `${this.noteIndex()}. ${lines[0]}`, { align: "left" });
    for (let i = 1; i < lines.length; i++) this.d.text(x + this.ts * 2, y - i * lineH, this.ts, lines[i], { align: "left" });
    this.noteCount += lines.length;
  }

  private noteIdx = 0;
  private noteIndex(): number {
    this.noteIdx += 1;
    return this.noteIdx;
  }

  /** условные обозначения в правой колонке (под примечаниями) */
  legend(items: { layer: "CONTOUR" | "HATCH" | "WATER" | "PIPE" | "EQUIP" | "SITE"; text: string }[]) {
    const x = this.p(A1.w - MARGIN - RIGHT_COL + 3);
    let y = this.p(A1.h - MARGIN - 12) - (this.noteCount + 2) * this.ts * 1.45;
    this.d.text(x, y, this.ts, "ОБОЗНАЧЕНИЯ", { align: "left" });
    y -= this.ts * 1.8;
    for (const it of items) {
      const box: Pt[] = [[x, y - this.ts * 0.3], [x + this.p(12), y - this.ts * 0.3], [x + this.p(12), y + this.ts * 0.9], [x, y + this.ts * 0.9]];
      if (it.layer === "HATCH") {
        this.d.poly(box, "THIN", true);
        this.d.hatch(box, this.p(1.2), 45);
      } else {
        this.d.line(x, y + this.ts * 0.3, x + this.p(12), y + this.ts * 0.3, it.layer);
      }
      this.d.text(x + this.p(15), y, this.ts, it.text, { align: "left" });
      y -= this.ts * 1.8;
    }
  }

  /* ---------------- рамка и штамп ---------------- */

  private frame() {
    const d = this.d;
    d.rect(0, 0, this.p(A1.w), this.p(A1.h), "FRAME");
    d.rect(this.p(MARGIN_L), this.p(MARGIN), this.p(A1.w - MARGIN_L - MARGIN), this.p(A1.h - 2 * MARGIN), "FRAME");
    /* правая колонка */
    const xr = this.p(A1.w - MARGIN - RIGHT_COL);
    d.line(xr, this.p(MARGIN), xr, this.p(A1.h - MARGIN), "FRAME");
  }

  private notesBox() {
    const d = this.d;
    const x = this.p(A1.w - MARGIN - RIGHT_COL + 3);
    const y = this.p(A1.h - MARGIN - 6);
    d.text(x, y, this.ts, "ПРИМЕЧАНИЯ", { align: "left" });
    /* стандартные примечания концептуальной стадии */
    this.note("Все размеры указаны в миллиметрах, отметки — в метрах относительно планировочной отметки площадки 0.000.");
    this.note("Чертёж концептуальной стадии: габариты и отметки сооружений расчётные. Фундаменты, армирование, гидроизоляция и мероприятия по УГВ определяются на стадии рабочего проектирования по результатам инженерно-геологических изысканий.");
    this.note("Расчёт выполнен по ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения» (взамен КМК 2.04.03-97).");
  }

  private titleBlock() {
    const d = this.d;
    const m = this.meta;
    const W = RIGHT_COL - 6;
    const H = 150;
    const x = this.p(A1.w - MARGIN - RIGHT_COL + 3);
    const y = this.p(MARGIN + 3);
    const P = (v: number) => this.p(v);

    d.rect(x, y, P(W), P(H), "FRAME");
    /* горизонтальные разделители снизу вверх */
    const rows = [14, 26, 40, 66, 92, 112, 132];
    for (const r of rows) d.line(x, y + P(r), x + P(W), y + P(r), "FRAME");

    /* --- нижний блок: номер листа --- */
    d.text(x + P(2), y + P(9), this.ts * 0.8, "Номер чертежа", { align: "left" });
    d.text(x + P(2), y + P(2.5), this.th * 1.1, m.no, { align: "left" });
    d.line(x + P(W - 28), y, x + P(W - 28), y + P(14), "FRAME");
    d.text(x + P(W - 26), y + P(9), this.ts * 0.8, "Версия", { align: "left" });
    d.text(x + P(W - 26), y + P(2.5), this.th, m.rev ?? "P01", { align: "left" });

    /* --- стадия, масштаб --- */
    d.text(x + P(2), y + P(21), this.ts * 0.8, "Стадия", { align: "left" });
    d.text(x + P(2), y + P(15.5), this.ts, m.stage ?? "Концептуальный проект", { align: "left" });
    d.line(x + P(W / 2), y + P(14), x + P(W / 2), y + P(26), "FRAME");
    d.text(x + P(W / 2 + 2), y + P(21), this.ts * 0.8, "Масштаб @ А1", { align: "left" });
    d.text(x + P(W / 2 + 2), y + P(15.5), this.ts, `1:${m.scale}`, { align: "left" });

    /* --- исполнители --- */
    const cols = [0, W / 3, (2 * W) / 3];
    const heads = ["Разработал", "Проверил", "Утвердил"];
    const names = ["SUVSANOAT Engineering", "инженер SUVSANOAT", "гл. инженер"];
    cols.forEach((c, i) => {
      if (i) d.line(x + P(c), y + P(26), x + P(c), y + P(40), "FRAME");
      d.text(x + P(c + 2), y + P(35.5), this.ts * 0.8, heads[i], { align: "left" });
      d.text(x + P(c + 2), y + P(30.5), this.ts * 0.85, names[i], { align: "left" });
      d.text(x + P(c + 2), y + P(27), this.ts * 0.75, m.date ?? today(), { align: "left" });
    });

    /* --- наименование листа --- */
    d.text(x + P(2), y + P(61), this.ts * 0.8, "Наименование листа", { align: "left" });
    wrap(m.title.toUpperCase(), 34, 3).forEach((line, i) =>
      d.text(x + P(W / 2), y + P(54 - i * 6), this.ts * 0.95, line, { align: "center" })
    );

    /* --- объект --- */
    d.text(x + P(2), y + P(87), this.ts * 0.8, "Объект", { align: "left" });
    wrap(m.object, 34, 3).forEach((line, i) =>
      d.text(x + P(W / 2), y + P(80 - i * 6), this.ts * 0.95, line, { align: "center" })
    );

    /* --- заказчик / проект --- */
    d.text(x + P(2), y + P(107), this.ts * 0.8, "Проект", { align: "left" });
    d.text(x + P(W / 2), y + P(100), this.ts * 0.95, "Очистные сооружения сточных вод", { align: "center" });
    d.text(x + P(W / 2), y + P(94.5), this.ts * 0.85, "предпроектная проработка", { align: "center" });

    /* --- разработчик --- */
    d.text(x + P(W / 2), y + P(124), this.th * 1.3, "SUVSANOAT", { align: "center" });
    d.text(x + P(W / 2), y + P(118), this.ts * 0.85, "Проектирование и производство очистного оборудования", { align: "center" });
    d.text(x + P(W / 2), y + P(113.5), this.ts * 0.8, "Ташкент, ул. Укчи 3 · suvsanoat.uz", { align: "center" });

    /* --- правовая плашка --- */
    const legal = wrap(
      "Права защищены. Чертёж выдан по результатам онлайн-расчёта SUVSANOAT и является предварительным техническим решением. Не является рабочей документацией и не может быть использован для строительства без проверки инженером и разработки проекта в установленном порядке.",
      46,
      6
    );
    legal.forEach((line, i) => d.text(x + P(2), y + P(146 - i * 2.4), this.ts * 0.62, line, { align: "left" }));
  }

  /** ревизионная таблица над штампом — одна строка выпуска */
  revisionRow() {
    const d = this.d;
    const W = RIGHT_COL - 6;
    const x = this.p(A1.w - MARGIN - RIGHT_COL + 3);
    const y = this.p(MARGIN + 3 + 152);
    d.rect(x, y, this.p(W), this.p(14), "FRAME");
    d.line(x, y + this.p(7), x + this.p(W), y + this.p(7), "FRAME");
    d.text(x + this.p(2), y + this.p(9), this.ts * 0.8, `${this.meta.rev ?? "P01"}   ${this.meta.date ?? today()}   Первый выпуск`, { align: "left" });
    d.text(x + this.p(2), y + this.p(2), this.ts * 0.8, "Версия   Дата   Описание", { align: "left" });
  }
}

/** номер листа по системе SUV-<OBJ>-<D>-<NNNNN> */
export function sheetNo(objCode: string, discipline: "C" | "M" | "E", index: number): string {
  return `SUV-${objCode}-${discipline}-0${1000 + index}`;
}

/**
 * Масштаб листа по наибольшему габариту сооружения: план должен занять
 * около 45 % ширины рабочего поля (≈300 мм бумаги), разрезы — под ним.
 */
export function pickScale(maxDimMm: number, maxHeightMm = 0): number {
  const paperW = 300; // мм бумаги под план
  const paperH = 200; // мм бумаги под разрез
  const need = Math.max(maxDimMm / paperW, maxHeightMm / paperH);
  const row = [20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return row.find((s) => s >= need) ?? 1000;
}

/** код объекта из названия: первые буквы латиницей, до 6 символов */
export function objectCode(name: string): string {
  const map: Record<string, string> = {
    а: "A", б: "B", в: "V", г: "G", д: "D", е: "E", ё: "E", ж: "J", з: "Z", и: "I", й: "Y", к: "K", л: "L", м: "M", н: "N",
    о: "O", п: "P", р: "R", с: "S", т: "T", у: "U", ф: "F", х: "H", ц: "C", ч: "CH", ш: "SH", щ: "SH", ы: "Y", э: "E", ю: "YU", я: "YA",
    қ: "Q", ғ: "G", ҳ: "H", ў: "O",
  };
  const words = name.toLowerCase().replace(/[^a-zа-яёқғҳў0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let code = "";
  for (const w of words) {
    for (const ch of w) code += map[ch] ?? ch.toUpperCase();
    if (code.length >= 6) break;
  }
  return (code || "OBJ").slice(0, 6).toUpperCase();
}
