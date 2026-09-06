/* ==================================================================
 * КНИГА EXCEL (.XLSX) — СПЕЦИФИКАЦИЯ И ВЕДОМОСТЬ ОБЪЁМОВ РАБОТ
 *
 * Зачем модуль: спецификация оборудования сейчас существует только на
 * странице результата и в комплекте чертежей. Подрядчику и снабженцу
 * нужен файл, в котором позиции можно отсортировать, дополнить ценами и
 * сложить. Значит — настоящая книга Excel, а не таблица в PDF.
 *
 * Почему всё вручную и без библиотек: реестр npm в среде сборки закрыт,
 * поставить exceljs/xlsx нельзя. Но .xlsx — это ZIP с набором XML-частей
 * (OOXML SpreadsheetML, ECMA-376), а упаковщик ZIP в проекте уже есть
 * (drawings/core/zip.ts, метод STORE — Excel такие файлы открывает).
 * Тот же приём, что в docx.ts.
 *
 * Ключевое решение по данным: числа записываются ЧИСЛАМИ (<c> без
 * атрибута t), а не текстом. Иначе снабженец не сможет ни просуммировать
 * объём бетона, ни умножить количество на цену — а ради этого файл и
 * делается. Строки пишутся инлайном (t="inlineStr"), без sharedStrings:
 * таблица общих строк экономит место, но добавляет ещё одну часть, в
 * которой легко ошибиться, а выигрыш на файле в сотню строк нулевой.
 * ================================================================== */

import { makeZip, type ZipEntry } from "../../../../drawings/core/zip";
import type { DrawingInput, EquipmentRow, StructureModel } from "../../../../drawings/core/types";
import { buildModels, type PackageOptions } from "../../../../drawings/package/build";
import { buildVolumeSheet, type VolumeSheet } from "../../../../drawings/package/volumes";
import { construction } from "../../../../drawings/core/construction";
import { DEFAULT_ASSUMPTIONS, NORM_CODE, type Assumptions } from "../../../../lib/assumptions";


/* ==================================================================
 * ЧАСТЬ 1. ПОСТРОИТЕЛЬ КНИГИ
 * ================================================================== */

/**
 * Оформление ячейки. Набор намеренно узкий — ровно то, что нужно
 * инженерной ведомости: шапка, текст с переносом, число, итог, сноска.
 */
export type XStyle =
  | "title" // заголовок листа
  | "head" // шапка таблицы: жирный, заливка, перенос
  | "text" // обычная ячейка с рамкой и переносом строк
  | "num" // число с двумя знаками
  | "int" // целое число
  | "section" // подзаголовок раздела внутри таблицы
  | "total" // строка итогов, текстовая часть
  | "totalNum" // строка итогов, числовая часть
  | "note"; // сноска мелким курсивом, без рамки

/** Индексы стилей в cellXfs — порядок обязан совпадать с STYLES_XML. */
const STYLE_INDEX: Record<XStyle, number> = {
  text: 1,
  head: 2,
  num: 3,
  int: 4,
  title: 5,
  section: 6,
  total: 7,
  totalNum: 8,
  note: 9,
};

export type XCell = { v: string | number | null; s?: XStyle };
export type XRow = XCell[];

export type XSheet = {
  /** имя вкладки; будет обрезано до 31 знака и очищено от запрещённых символов */
  name: string;
  /** ширины колонок в знаках; длина массива задаёт число колонок с ширинами */
  cols: number[];
  rows: XRow[];
  /** число верхних строк, закрепляемых при прокрутке (шапка) */
  freezeRows?: number;
};

/** Экранирование текста для XML. Без него «&» или «<» ломают книгу. */
function esc(s: string): string {
  return String(s ?? "")
    /* управляющие символы XML 1.0 не допускает — Excel откажется открыть файл */
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    /* перенос строки внутри ячейки: работает только вместе с wrapText в стиле */
    .replace(/\n/g, "&#10;");
}

/** A, B, … Z, AA, AB … — адрес колонки по индексу с нуля */
export function colName(i: number): string {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function cellXml(c: XCell, ref: string): string {
  const s = c.s ? ` s="${STYLE_INDEX[c.s]}"` : "";
  if (c.v === null || c.v === undefined || c.v === "") return `<c r="${ref}"${s}/>`;
  if (typeof c.v === "number") {
    /* NaN и Infinity в XML-числе недопустимы: такое значение выводим
       прочерком, а не «правдоподобным» нулём */
    if (!Number.isFinite(c.v)) return `<c r="${ref}"${s} t="inlineStr"><is><t>—</t></is></c>`;
    return `<c r="${ref}"${s}><v>${c.v}</v></c>`;
  }
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
}

function sheetXml(sh: XSheet): string {
  const cols = sh.cols.length
    ? `<cols>${sh.cols
        .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
        .join("")}</cols>`
    : "";
  const freeze = sh.freezeRows
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sh.freezeRows}" topLeftCell="A${
        sh.freezeRows + 1
      }" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;

  const rows = sh.rows
    .map((cells, r) => {
      const n = r + 1;
      const body = cells.map((c, i) => cellXml(c, `${colName(i)}${n}`)).join("");
      /* customHeight не задаём: высоту под перенос Excel подберёт сам */
      return `<row r="${n}">${body}</row>`;
    })
    .join("");

  const maxCol = sh.rows.reduce((m, r) => Math.max(m, r.length), sh.cols.length) || 1;
  const dim = `<dimension ref="A1:${colName(maxCol - 1)}${Math.max(1, sh.rows.length)}"/>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `${dim}${freeze}${cols}<sheetData>${rows}</sheetData>` +
    `<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>` +
    `</worksheet>`
  );
}

/**
 * Стили книги. Порядок записей cellXfs зафиксирован в STYLE_INDEX:
 * 0 — по умолчанию, далее text, head, num, int, title, section, total,
 * totalNum, note. Форматы чисел — встроенные: 1 = «0», 2 = «0,00».
 */
const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="5">
<font><sz val="10"/><name val="Calibri"/></font>
<font><sz val="10"/><b/><name val="Calibri"/></font>
<font><sz val="14"/><b/><name val="Calibri"/></font>
<font><sz val="9"/><i/><color rgb="FF555555"/><name val="Calibri"/></font>
<font><sz val="10"/><b/><color rgb="FF1F3A4D"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFD9E2EC"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF0F4F8"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFB0B8BF"/></left><right style="thin"><color rgb="FFB0B8BF"/></right><top style="thin"><color rgb="FFB0B8BF"/></top><bottom style="thin"><color rgb="FFB0B8BF"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="10">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top"/></xf>
<xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="2" fontId="1" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/** Имя вкладки: Excel запрещает : \\ / ? * [ ] и длину больше 31 знака. */
function sheetName(raw: string, i: number): string {
  const clean = String(raw ?? "").replace(/[:\\/?*[\]]/g, " ").trim();
  return (clean || `Лист ${i + 1}`).slice(0, 31);
}

function contentTypesXml(n: number): string {
  const sheets = Array.from(
    { length: n },
    (_, i) =>
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheets}
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;
}

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

function workbookXml(sheets: XSheet[]): string {
  const list = sheets
    .map((s, i) => `<sheet name="${esc(sheetName(s.name, i))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${list}</sheets></workbook>`;
}

function workbookRelsXml(n: number): string {
  const sheets = Array.from(
    { length: n },
    (_, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets}
<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function coreXml(meta: { title: string; subject?: string; creator?: string }): string {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(meta.title)}</dc:title><dc:subject>${esc(meta.subject ?? "")}</dc:subject>
<dc:creator>${esc(meta.creator ?? "SUVSANOAT")}</dc:creator><cp:lastModifiedBy>${esc(meta.creator ?? "SUVSANOAT")}</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

/** Сборка .xlsx: ZIP из обязательных частей SpreadsheetML. */
export function buildXlsxFile(
  sheets: XSheet[],
  meta: { title: string; subject?: string; creator?: string },
): Uint8Array {
  const list = sheets.length ? sheets : [{ name: "Лист 1", cols: [], rows: [] }];
  const enc = new TextEncoder();
  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypesXml(list.length)) },
    { name: "_rels/.rels", data: enc.encode(ROOT_RELS_XML) },
    { name: "xl/workbook.xml", data: enc.encode(workbookXml(list)) },
    { name: "xl/_rels/workbook.xml.rels", data: enc.encode(workbookRelsXml(list.length)) },
    ...list.map<ZipEntry>((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      data: enc.encode(sheetXml(s)),
    })),
    { name: "xl/styles.xml", data: enc.encode(STYLES_XML) },
    { name: "docProps/core.xml", data: enc.encode(coreXml(meta)) },
  ];
  return makeZip(entries);
}

/* ==================================================================
 * ЧАСТЬ 2. СОСТАВ КНИГИ СПЕЦИФИКАЦИИ
 *
 * Четыре листа:
 *   1. Спецификация A — изготовление SUVSANOAT
 *   2. Спецификация B — покупные комплектующие
 *   3. Ведомость объёмов работ (бетон, арматура, земля) + раздел
 *      строительных конструкций подрядчика
 *   4. Исходные данные и допущения
 *
 * Четвёртый лист не украшение: спецификация без исходных данных — это
 * список без основания, по нему нельзя ни проверить решение, ни
 * возразить против него.
 * ================================================================== */

const t = (v: string | number | null): XCell => ({ v, s: "text" });
const num = (v: number | null): XCell => ({ v: v === null ? "—" : v, s: v === null ? "text" : "num" });
const head = (v: string): XCell => ({ v, s: "head" });
const title = (v: string): XCell => ({ v, s: "title" });
const note = (v: string): XCell => ({ v, s: "note" });
const section = (v: string): XCell => ({ v, s: "section" });
const total = (v: string): XCell => ({ v, s: "total" });
const totalNum = (v: number): XCell => ({ v, s: "totalNum" });

/** пустая строка-разделитель нужной ширины */
const blank = (): XRow => [];

/**
 * Железобетонные ёмкости и площадки — это не «покупное оборудование», а
 * раздел строительных работ подрядчика. Смешивать их со спецификацией B
 * нельзя: снабженец закупает по B насосы и арматуру, а не резервуары.
 * Признак — упоминание бетона в наименовании или в характеристике
 * (сооружения пишут туда класс бетона: «бетон B25, W6, F150»).
 */
function isCivil(e: EquipmentRow): boolean {
  return /железобетон|асфальтобетон|бетонн/i.test(e.name) || /бетон\s*[BВ]\d/i.test(e.spec ?? "");
}

type SpecRow = { model: StructureModel; item: EquipmentRow };

function specSheet(
  name: string,
  header: string,
  intro: string,
  rows: SpecRow[],
  emptyText: string,
  tail: string[],
): XSheet {
  const out: XRow[] = [
    [title(header)],
    [note(intro)],
    blank(),
    [head("Поз."), head("Наименование"), head("Кол-во"), head("Техническая характеристика"), head("Сооружение"), head("Примечание")],
  ];
  if (!rows.length) {
    out.push([t("—"), t(emptyText), t("—"), t("—"), t("—"), t("—")]);
  }
  rows.forEach((r, i) => {
    out.push([
      { v: i + 1, s: "int" },
      t(r.item.name),
      t(r.item.qty),
      t(r.item.spec ?? "—"),
      t(`${r.model.no ? r.model.no + " " : ""}${r.model.name}`),
      t("—"),
    ]);
  });
  out.push(blank());
  for (const x of tail) out.push([note(x)]);
  return { name, cols: [6, 48, 14, 42, 34, 26], rows: out, freezeRows: 4 };
}

function volumesSheet(v: VolumeSheet, civil: SpecRow[]): XSheet {
  const rows: XRow[] = [
    [title("Ведомость объёмов работ")],
    [note(`Объект: ${v.object}. Объёмы бетона и арматуры — те же, что на листах комплекта чертежей; земляные работы посчитаны по геометрии сооружений.`)],
    blank(),
    [
      head("Поз."),
      head("Сооружение"),
      head("Габарит в плане"),
      head("Отметки, м"),
      head("Элемент конструкции"),
      head("Бетон конструкций, м³"),
      head("Бетонная подготовка, м³"),
      head("Арматура, кг"),
      head("Глубина котлована, м"),
      head("Разработка грунта, м³"),
      head("Обратная засыпка, м³"),
      head("Излишний грунт, м³"),
      head("Примечание"),
    ],
  ];

  for (const r of v.rows) {
    /* первая строка сооружения несёт итоговые графы, последующие —
       только разбивку бетона по элементам: так ведомость читается
       сверху вниз и суммируется без двойного счёта */
    const elems = r.concrete.length ? r.concrete : [{ name: "бетон конструкций в модели не выделен", m3: NaN }];
    elems.forEach((el, i) => {
      if (i === 0) {
        rows.push([
          t(r.no),
          t(r.name),
          t(r.plan),
          t(r.levels),
          t(el.name),
          num(Number.isFinite(el.m3) ? el.m3 : null),
          num(r.lean),
          num(r.rebarKg),
          num(r.pitDepth),
          num(r.excavation),
          num(r.backfill),
          num(r.spoil),
          t(r.note),
        ]);
      } else {
        rows.push([t(""), t(""), t(""), t(""), t(el.name), num(el.m3), t(""), t(""), t(""), t(""), t(""), t(""), t("")]);
      }
    });
    rows.push([
      t(""),
      total(`Итого по позиции ${r.no}`),
      t(""),
      t(""),
      total("бетон конструкций (стены, днище, перекрытие)"),
      r.concreteTotal === null ? t("не определён") : totalNum(r.concreteTotal),
      t(""),
      t(""),
      t(""),
      t(""),
      t(""),
      t(""),
      t(""),
    ]);
  }

  rows.push([
    t(""),
    total("ИТОГО ПО КОМПЛЕКТУ"),
    t(""),
    t(""),
    total(""),
    totalNum(v.totals.concrete),
    totalNum(v.totals.lean),
    totalNum(v.totals.rebarKg),
    t(""),
    totalNum(v.totals.excavation),
    totalNum(v.totals.backfill),
    totalNum(v.totals.spoil),
    t(""),
  ]);

  /* раздел строительных конструкций: ёмкости и площадки, которые
     подрядчик не покупает, а строит */
  rows.push(blank());
  rows.push([section("Строительные конструкции — раздел работ подрядчика (не покупное оборудование)")]);
  rows.push([head("№"), head("Конструкция"), head("Кол-во"), head("Характеристика"), head("Сооружение")]);
  if (!civil.length) {
    rows.push([t("—"), t("Железобетонных конструкций в комплекте нет."), t("—"), t("—"), t("—")]);
  }
  civil.forEach((r, i) => {
    rows.push([
      { v: i + 1, s: "int" },
      t(r.item.name),
      t(r.item.qty),
      t(r.item.spec ?? "—"),
      t(`${r.model.no ? r.model.no + " " : ""}${r.model.name}`),
    ]);
  });

  rows.push(blank());
  rows.push([section("Как получены объёмы")]);
  for (const n of v.notes) rows.push([note(n)]);

  rows.push(blank());
  rows.push([section("Коэффициенты, принятые для строительной части")]);
  rows.push([head("Коэффициент"), head("Значение"), head("Ед."), head("Источник")]);
  for (const p of v.params) rows.push([t(p.name), { v: p.value, s: "num" }, t(p.unit), t(p.source)]);

  return {
    name: "Ведомость объёмов работ",
    cols: [6, 34, 16, 34, 38, 14, 14, 12, 12, 14, 14, 14, 46],
    rows,
    freezeRows: 4,
  };
}

function basisSheet(input: DrawingInput, v: VolumeSheet, a: Assumptions): XSheet {
  const c = construction(a);
  const rows: XRow[] = [
    [title("Исходные данные и принятые допущения")],
    [note("Без этого листа спецификация — список без основания. Каждое число здесь либо задано заказчиком, либо принято по названному источнику, и любое из них можно оспорить.")],
    blank(),
    [section("Объект и расчётный расход")],
    [head("Показатель"), head("Значение"), head("Ед."), head("Источник / основание")],
    [t("Объект"), t(input.object), t("—"), t("анкета заказчика")],
    [t("Отрасль"), t(input.industryId || "не указана"), t("—"), t("анкета заказчика")],
    [t("Расход расчётный"), { v: input.q, s: "num" }, t("м³/сут"), t("анкета заказчика / расчёт водоотведения")],
    [t("Режим работы"), { v: input.hours, s: "num" }, t("ч/сут"), t("анкета заказчика")],
    [t("Максимальный часовой расход"), { v: input.qMaxH, s: "num" }, t("м³/ч"), t(`расчёт по коэффициенту неравномерности, ${NORM_CODE} табл. 2`)],
    [t("Исполнение по расходу"), t(input.scale), t("—"), t("выбор исполнения по расходу (компактное / модульное / железобетон)")],
    blank(),
    [section("Состав сточных вод на входе")],
    [head("Показатель"), head("Значение"), head("Ед."), head("Источник / основание")],
    [t("БПК₅"), { v: input.bod, s: "num" }, t("мг/л"), t("лабораторный анализ либо справочник отрасли — см. пояснительную записку, раздел 1")],
    [t("ХПК"), { v: input.cod, s: "num" }, t("мг/л"), t("то же")],
    [t("Взвешенные вещества"), { v: input.ss, s: "num" }, t("мг/л"), t("то же")],
    [t("Жиры"), { v: input.fats, s: "num" }, t("мг/л"), t("то же")],
    [t("Азот общий"), { v: input.tn, s: "num" }, t("мг/л"), t("то же")],
    blank(),
    [section("Технологическое решение")],
    [head("Показатель"), head("Значение"), head("Ед."), head("Источник / основание")],
    [t("Технология биологической очистки"), t(input.tech || "не задана"), t("—"), t("выбор проектировщика либо автоподбор — см. пояснительную записку, раздел 2")],
    [t("Цепочка ступеней"), t(input.chain.join(" → ")), t("—"), t("состав определён загрязнениями на входе и требованиями на сбросе")],
    [t("Объём усреднителя"), { v: input.vAvg, s: "num" }, t("м³"), t(`${NORM_CODE} пп. 6.38, 6.41 и практика усреднения`)],
    [t("Объём биологической ступени"), { v: input.vBio, s: "num" }, t("м³"), t(`${NORM_CODE} раздел биологической очистки`)],
    [t("Расход воздуха на аэрацию"), { v: input.air, s: "num" }, t("м³/ч"), t(`${NORM_CODE} п. 6.157 и далее`)],
    [t("Осадок по сухому веществу"), { v: input.dryKg, s: "num" }, t("кг СВ/сут"), t("расчёт прироста ила и задержанных загрязнений")],
    [t("Санитарно-защитная зона"), input.szz ? { v: input.szz, s: "num" } : t("не задана"), t("м"), t(`${NORM_CODE} табл. 1`)],
    blank(),
    [note("Температурный режим сточной воды (среднегодовая и летняя расчётные температуры) в исходных данных генератора чертежей не передаётся. От него зависят объём биологического блока и расход воздуха: значения приведены выше в том виде, в каком их дал расчёт на странице результата, и подлежат проверке по фактической температуре стока.")],
    blank(),
    [section("Конструктивные допущения строительной части")],
    [head("Коэффициент"), head("Значение"), head("Ед."), head("Источник / основание")],
    ...v.params.map<XRow>((p) => [t(p.name), { v: p.value, s: "num" }, t(p.unit), t(p.source)]),
    [t("Класс бетона конструкций"), t(c.concreteGrade), t("—"), t("практика для гидротехнических монолитных конструкций; уточняется расчётом конструкций")],
    blank(),
    [section("Оговорки")],
    [note(`Нормативная основа расчёта — ${NORM_CODE} «Канализация. Наружные сети и сооружения». Величины, которые норматив не нормирует, приняты по практике SUVSANOAT и помечены в графе источника именно так — выдавать их за нормативные нельзя.`)],
    [note("Стадия — предпроектная проработка. Марки и производители позиций части B не назначаются: они принимаются при рабочем проектировании по запросу цен и наличию сервиса.")],
    [note("Количество позиций спецификации указано так, как его определила модель сооружения (рабочие + резервные единицы). Резерв на складе, ЗИП и пусконаладочные материалы в спецификацию не входят.")],
  ];
  return { name: "Исходные данные", cols: [42, 18, 12, 76], rows };
}

export type SpecWorkbookOptions = PackageOptions & { assumptions?: Assumptions };

/**
 * Готовая книга: спецификация A/B, ведомость объёмов работ, исходные
 * данные. Все числа приходят из моделей сооружений и из расчёта,
 * переданного в DrawingInput; здесь не считается ничего, кроме
 * суммирования уже готовых величин.
 */
export function buildSpecWorkbook(input: DrawingInput, opts: SpecWorkbookOptions = {}): Uint8Array {
  const a = opts.assumptions ?? DEFAULT_ASSUMPTIONS;
  const models = buildModels(input, opts).map((e) => e.model);
  const v = buildVolumeSheet(input, opts, a);

  /* позиции генплана уже присвоены ведомостью объёмов (она вызывает ту
     же компоновку) — переносим их в модели, чтобы спецификация и
     ведомость ссылались на сооружение одинаково */
  const noById = new Map(v.rows.map((r) => [r.id, r.no]));
  for (const m of models) m.no = noById.get(m.id) ?? m.no;

  const all: SpecRow[] = models.flatMap((model) => model.equipment.map((item) => ({ model, item })));
  const civil = all.filter((r) => isCivil(r.item));
  const rest = all.filter((r) => !isCivil(r.item));
  const partA = rest.filter((r) => r.item.supply === "own");
  const partB = rest.filter((r) => r.item.supply === "supply");

  const sheets: XSheet[] = [
    specSheet(
      "Спецификация A (изготовление)",
      "Спецификация A — изготовление SUVSANOAT",
      `Объект: ${input.object}. Позиции собственного изготовления: корпуса агрегатов, металлоконструкции, платформы, лотки, каналы, распределительные устройства и трубопроводная обвязка. Разделение A/B показывает происхождение позиции и на технологическое решение не влияет.`,
      partA,
      "Позиций собственного изготовления в решении нет.",
      [
        "Количество указано так, как его определила модель сооружения. Размеры и характеристики — расчётные, стадия предпроектная.",
        "Ёмкостные железобетонные конструкции в эту спецификацию не входят: они отнесены к разделу строительных работ подрядчика — см. лист «Ведомость объёмов работ».",
      ],
    ),
    specSheet(
      "Спецификация B (покупные)",
      "Спецификация B — покупные комплектующие",
      `Объект: ${input.object}. Позиции, закупаемые комплектующими: насосы, воздуходувки, мешалки, решётки, УФ-установки, дозирующее оборудование, арматура, КИП и щиты управления.`,
      partB,
      "Покупных позиций в решении нет.",
      [
        "Марки и производители на предпроектной стадии не назначаются: принимаются при рабочем проектировании по результатам запроса цен и наличию сервиса в регионе.",
        "Ёмкостные железобетонные конструкции в эту спецификацию не входят: их подрядчик не покупает, а строит — см. лист «Ведомость объёмов работ», раздел строительных конструкций.",
      ],
    ),
    volumesSheet(v, civil),
    basisSheet(input, v, a),
  ];

  return buildXlsxFile(sheets, {
    title: `Спецификация оборудования и ведомость объёмов работ. ${input.object}`,
    subject: "Предварительное решение по очистке сточных вод",
    creator: "SUVSANOAT",
  });
}
