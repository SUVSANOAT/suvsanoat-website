/* ==================================================================
 * ПОЯСНИТЕЛЬНАЯ ЗАПИСКА В ФОРМАТЕ .DOCX
 *
 * Зачем модуль: страница результата уже показывает записку текстом, но
 * проектировщику нужен документ, который можно вложить в том проекта,
 * отдать заказчику и подписать. Поэтому здесь собирается настоящий
 * файл Word — со своими заголовками, таблицами и разбивкой на разделы.
 *
 * Почему всё вручную и без библиотек: реестр npm в среде сборки закрыт,
 * поставить docx/officegen нельзя. Но .docx — это обычный ZIP с набором
 * XML-частей (OOXML, ECMA-376), а упаковщик ZIP в проекте уже есть
 * (drawings/core/zip.ts, метод STORE — Word такие файлы открывает).
 * Значит, документ можно собрать из строк XML, не тащя зависимость.
 *
 * Главное правило то же, что у текстовой записки: НИ ОДНОГО нового
 * числа. Всё, что попадает в документ, берётся из NoteInput, который
 * посчитала страница, и из полей, переданных вместе с ним. Модель (если
 * ключ ИИ задан) используется только для сопоставления пунктов ТЗ с уже
 * принятыми решениями и для повествовательного приложения — считать ей
 * ничего не разрешено.
 *
 * Ссылки на ҚМҚ 2.04.03-19 берутся только из данных: поле norms,
 * kmkClausesFor() по ключам ступеней и строки basis/sizing/spec.
 * ================================================================== */

import { makeZip, type ZipEntry } from "../../../../drawings/core/zip";
import { KMK_2_04_03_19_DOC, RELATED_DOCUMENTS } from "../../../../norms/kmk-2-04-03-19";
import {
  kmkClausesFor,
  kmkDocLine,
  type NoteInput,
  type NoteItem,
} from "./note-template";

/* ==================================================================
 * ЧАСТЬ 1. ПОСТРОИТЕЛЬ ДОКУМЕНТА
 *
 * Набор блоков намеренно узкий: заголовки трёх уровней, абзац,
 * маркированный список, таблица с шапкой и разрыв страницы. Этого
 * хватает на инженерный документ; редактор Word здесь не воспроизводится.
 * ================================================================== */

export type DocxBlock =
  /** заголовок: 1 — раздел, 2 — подраздел, 3 — ступень/пункт */
  | { t: "h"; level: 1 | 2 | 3; text: string }
  /** обычный абзац; style — мелким шрифтом (примечание) или крупным (титул) */
  | { t: "p"; text: string; style?: "normal" | "small" | "title" | "subtitle" }
  | { t: "ul"; items: string[] }
  /** таблица: шапка повторяется на каждой странице, ширины — доли колонок */
  | { t: "table"; head: string[]; rows: string[][]; widths?: number[] }
  | { t: "break" };

/** Экранирование текста для XML. Без него любой «&» или «<» ломает документ. */
function esc(s: string): string {
  return String(s ?? "")
    /* управляющие символы XML 1.0 не допускает — Word отказывается открывать файл */
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Разбор жирного начертания: **текст** → отдельный прогон с <w:b/>.
 * Разметка из markdown-записки приходит именно в таком виде, и терять
 * выделение расчётных величин не хочется.
 */
function runs(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}): string {
  const parts = String(text ?? "").split(/\*\*/);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const bold = opts.bold || i % 2 === 1;
    const rPr =
      `<w:rPr>${bold ? "<w:b/>" : ""}` +
      (opts.size ? `<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>` : "") +
      (opts.color ? `<w:color w:val="${opts.color}"/>` : "") +
      `</w:rPr>`;
    out += `<w:r>${rPr}<w:t xml:space="preserve">${esc(parts[i])}</w:t></w:r>`;
  }
  return out || `<w:r><w:t xml:space="preserve"></w:t></w:r>`;
}

function paragraph(text: string, style = "Normal", extraPr = ""): string {
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${extraPr}</w:pPr>${runs(text)}</w:p>`;
}

/** Ячейка таблицы: в OOXML пустых ячеек не бывает — всегда хотя бы один абзац. */
function cell(text: string, widthPct: number, header: boolean): string {
  const shd = header ? `<w:shd w:val="clear" w:color="auto" w:fill="E8EDF0"/>` : "";
  const p = `<w:p><w:pPr><w:pStyle w:val="TableText"/></w:pPr>${runs(text, { bold: header })}</w:p>`;
  return `<w:tc><w:tcPr><w:tcW w:w="${Math.round(widthPct * 50)}" w:type="pct"/>${shd}<w:vAlign w:val="center"/></w:tcPr>${p}</w:tc>`;
}

function tableXml(head: string[], rows: string[][], widths?: number[]): string {
  const cols = head.length || (rows[0]?.length ?? 1);
  /* ширины задаются в процентах: документ должен нормально смотреться
     и на A4 книжной, и после правки полей заказчиком */
  const w = widths && widths.length === cols ? widths : new Array(cols).fill(100 / cols);
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  const pct = w.map((x) => (x / sum) * 100);

  const grid = pct.map((x) => `<w:gridCol w:w="${Math.round((x / 100) * 9350)}"/>`).join("");
  const headRow = head.length
    ? `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${head.map((h, i) => cell(h, pct[i], true)).join("")}</w:tr>`
    : "";
  const body = rows
    .map((r) => {
      const cells = [];
      for (let i = 0; i < cols; i++) cells.push(cell(r[i] ?? "", pct[i], false));
      return `<w:tr>${cells.join("")}</w:tr>`;
    })
    .join("");

  return (
    `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/>` +
    `<w:tblLayout w:type="fixed"/>` +
    `<w:tblBorders>` +
    ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="9AA7AE"/>`)
      .join("") +
    `</w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${headRow}${body}</w:tbl>` +
    /* после таблицы обязателен абзац, иначе две таблицы подряд сливаются в одну */
    `<w:p><w:pPr><w:pStyle w:val="AfterTable"/></w:pPr></w:p>`
  );
}

function blockXml(b: DocxBlock): string {
  switch (b.t) {
    case "h":
      return paragraph(b.text, `Heading${b.level}`);
    case "p":
      return paragraph(
        b.text,
        b.style === "small" ? "Small" : b.style === "title" ? "DocTitle" : b.style === "subtitle" ? "DocSubtitle" : "Normal"
      );
    case "ul":
      /* Нумерации через numbering.xml сознательно нет: маркер выводится
         символом с висячим отступом. Так документ остаётся из пяти
         частей и открывается везде, включая просмотрщики без поддержки
         списков. Для читаемости этого достаточно. */
      return b.items
        .filter((x) => x && x.trim())
        .map((x) => `<w:p><w:pPr><w:pStyle w:val="Bullet"/></w:pPr>${runs("• " + x.trim())}</w:p>`)
        .join("");
    case "table":
      return tableXml(b.head, b.rows, b.widths);
    case "break":
      return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
  }
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="ru-RU"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="both"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="DocTitle"><w:name w:val="Doc Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="DocSubtitle"><w:name w:val="Doc Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:jc w:val="left"/><w:spacing w:before="320" w:after="140"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:jc w:val="left"/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:jc w:val="left"/><w:spacing w:before="200" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Small"><w:name w:val="Small"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/><w:color w:val="555555"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="397" w:hanging="227"/><w:spacing w:after="60"/><w:jc w:val="left"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="AfterTable"><w:name w:val="After Table"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="120" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="8"/><w:szCs w:val="8"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

const DOC_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

function coreXml(meta: { title: string; subject?: string; creator?: string }): string {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(meta.title)}</dc:title><dc:subject>${esc(meta.subject ?? "")}</dc:subject>
<dc:creator>${esc(meta.creator ?? "SUVSANOAT")}</dc:creator><cp:lastModifiedBy>${esc(meta.creator ?? "SUVSANOAT")}</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

/** A4 книжная, поля по ГОСТ-подобной практике: слева 30 мм под подшивку */
const SECT_PR =
  `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>` +
  `<w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>` +
  `<w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>`;

/** Сборка .docx: ZIP из пяти обязательных частей OOXML. */
export function buildDocxFile(blocks: DocxBlock[], meta: { title: string; subject?: string; creator?: string }): Uint8Array {
  const body = blocks.map(blockXml).join("");
  const document =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${body}${SECT_PR}</w:body></w:document>`;

  const enc = new TextEncoder();
  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: enc.encode(CONTENT_TYPES_XML) },
    { name: "_rels/.rels", data: enc.encode(ROOT_RELS_XML) },
    { name: "word/document.xml", data: enc.encode(document) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(DOC_RELS_XML) },
    { name: "word/styles.xml", data: enc.encode(STYLES_XML) },
    { name: "docProps/core.xml", data: enc.encode(coreXml(meta)) },
  ];
  return makeZip(entries);
}

/* ==================================================================
 * ЧАСТЬ 2. MARKDOWN → БЛОКИ
 *
 * Нужна, чтобы записку, написанную моделью (или шаблоном
 * buildTemplateNote — он тоже отдаёт markdown), можно было положить в
 * документ приложением, не теряя таблицы и заголовки.
 * Поддерживается ровно то, что встречается в записке: #/##/###,
 * маркированный список, таблица с шапкой, абзац, **жирный**.
 * ================================================================== */

export function markdownToBlocks(md: string, headingShift = 0): DocxBlock[] {
  const out: DocxBlock[] = [];
  const lines = String(md ?? "").replace(/\r/g, "").split("\n");
  const cells = (line: string) =>
    line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

  let i = 0;
  let para: string[] = [];
  let bullets: string[] = [];
  const flushPara = () => {
    if (para.length) out.push({ t: "p", text: para.join(" ") });
    para = [];
  };
  const flushBullets = () => {
    if (bullets.length) out.push({ t: "ul", items: bullets });
    bullets = [];
  };
  const flush = () => {
    flushPara();
    flushBullets();
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      flush();
      const level = Math.min(3, Math.max(1, h[1].length + headingShift)) as 1 | 2 | 3;
      out.push({ t: "h", level, text: h[2] });
      i++;
      continue;
    }

    /* таблица: строка с «|», под ней строка-разделитель |---|---| */
    if (trimmed.startsWith("|") && /^\|[\s:|-]+\|$/.test((lines[i + 1] ?? "").trim())) {
      flush();
      const head = cells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i].trim()));
        i++;
      }
      out.push({ t: "table", head, rows });
      continue;
    }

    const b = /^[-*]\s+(.*)$/.exec(trimmed);
    if (b) {
      flushPara();
      bullets.push(b[1]);
      i++;
      continue;
    }

    flushBullets();
    para.push(trimmed);
    i++;
  }
  flush();
  return out;
}

/* ==================================================================
 * ЧАСТЬ 3. ОТВЕТ НА ТЕХНИЧЕСКОЕ ЗАДАНИЕ ПО ПУНКТАМ
 *
 * Требования приходят из разбора ТЗ (tz-extract.ts, поле requirements).
 * Сопоставление «требование → решение → место в проекте» делает модель,
 * если задан ключ; без ключа таблица всё равно строится, но две правые
 * колонки помечены как заполняемые проектировщиком вручную. Пустого
 * раздела не бывает: нет требований — нет и раздела.
 * ================================================================== */

export type TzRequirement = { no: string; text: string };

export type TzAnswer = {
  no: string;
  /** как выполнено — со ссылкой на переданные данные расчёта */
  how: string;
  /** где смотреть: раздел записки, строка спецификации, лист комплекта */
  where: string;
};

export const TZ_ANSWER_SYSTEM_PROMPT = `Ты — главный инженер-технолог компании SUVSANOAT (Ташкент, Узбекистан). Тебе дают: (1) готовый предварительный расчёт очистных сооружений в JSON и (2) перечень требований технического задания заказчика. Твоя задача — составить таблицу ответа на техническое задание по пунктам.

Правила, нарушать нельзя:
1. Ты НЕ считаешь и НЕ проектируешь. Ты только сопоставляешь пункт ТЗ с тем, что УЖЕ есть в переданных данных расчёта. Никаких новых чисел, объёмов, концентраций, марок, сроков и цен.
2. Утверждать, что требование выполнено, разрешено ТОЛЬКО при прямой опоре на переданные данные: назови ступень, позицию ведомости, расчётную величину или целевой показатель, из которых это следует. Если в данных опоры нет — так и пиши: «в данных расчёта не отражено, подлежит проверке проектировщиком». Формулировки вида «предусмотрено», «обеспечивается», «соответствует» без ссылки на конкретные данные запрещены.
3. Если требование лежит вне предмета расчёта (сроки, состав документации, гарантии, финансовые условия, порядок сдачи) — прямо укажи, что предварительным расчётом это не покрывается и определяется договором либо следующей стадией проектирования.
4. Если требование противоречит принятому решению — не сглаживай, напиши, в чём расхождение, назвав обе величины из данных.
5. Ссылки на ҚМҚ 2.04.03-19 допускаются только с номерами пунктов из поля norms и из строк spec/sizing/basis переданных данных. Другие номера пунктов и другие нормативные документы не выдумывай.
6. Колонка «где в проекте» — только ссылки, которые можно проверить: номер раздела настоящей записки (1–8), наименование ступени очистки, наименование позиции спецификации, наименование листа комплекта чертежей. Номера листов, которых нет в переданных данных, не придумывай.
7. Отвечай ТОЛЬКО JSON-массивом без markdown-обрамления и пояснений, в формате:
[{"no":"3.1","how":"...","where":"..."}]
Поле no — точно то же, что в переданном перечне требований; пункты не добавляй, не объединяй и не пропускай. how — до 400 знаков, where — до 200 знаков, русский язык.`;

export function tzAnswerUserPrompt(n: NoteInput, reqs: TzRequirement[]): string {
  return (
    `Данные предварительного расчёта (JSON):\n\n${JSON.stringify(n, null, 1)}\n\n` +
    `Требования технического задания (JSON):\n\n${JSON.stringify(reqs, null, 1)}\n\n` +
    `Составь таблицу ответа по пунктам строго по правилам.`
  );
}

/**
 * Приведение ответа модели к TzAnswer[]. Ответ не принимается на веру:
 * чужие номера пунктов выбрасываются (модель не вправе изобретать
 * требования), длина текста ограничивается, всё лишнее отбрасывается.
 */
export function parseTzAnswers(raw: unknown, reqs: TzRequirement[]): TzAnswer[] {
  if (!Array.isArray(raw)) return [];
  const known = new Set(reqs.map((r) => r.no));
  const out: TzAnswer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const no = typeof o.no === "string" ? o.no.trim().slice(0, 12) : "";
    if (!known.has(no)) continue;
    const how = typeof o.how === "string" ? o.how.trim().slice(0, 400) : "";
    const where = typeof o.where === "string" ? o.where.trim().slice(0, 200) : "";
    if (!how) continue;
    out.push({ no, how, where });
  }
  return out;
}

/* ==================================================================
 * ЧАСТЬ 4. СОСТАВ ЗАПИСКИ
 *
 * Разделы идут в том порядке, в котором записку читает проектировщик:
 * титул → исходные данные → обоснование схемы → расчёт → спецификация
 * (A/B) → допущения → что уточнить → нормативная база → ответ на ТЗ.
 * ================================================================== */

/** Язык документа. Заполнен русский; структура готова к переводу — см. LABELS. */
export type NoteLang = "ru" | "uz" | "en" | "zh";

export type NoteDocxOptions = {
  lang?: NoteLang;
  /** требования ТЗ из разбора документа (tz-extract.ts) */
  requirements?: TzRequirement[];
  /** сопоставление требований с решением; пусто — колонки помечаются как ручные */
  answers?: TzAnswer[];
  /**
   * Температурный режим расчёта (technology.ts, поле temperature).
   * Числа приходят готовыми; если режим не передан, документ прямо
   * пишет, что он не задан, а не подставляет значение по умолчанию.
   */
  temperature?: { annualC: number; summerC: number; factor: number; winterGoverns?: boolean };
  /** точка сброса, как она выбрана в анкете (горколлектор, водоём, полив…) */
  discharge?: string;
  /** источник значения по подписи показателя — переопределяет общий (анкета/лаборатория/справочник) */
  sourceByLabel?: Record<string, string>;
  /** повествовательная записка (текст модели либо buildTemplateNote) — приложение А */
  narrative?: string;
  /** исполнитель в титульном блоке */
  author?: string;
};

const LABELS = {
  ru: {
    title: "Пояснительная записка",
    subtitle: "Предварительное решение по очистке сточных вод",
    company: "SUVSANOAT",
  },
} as const;

/** Подписи документа. Кроме русского пока ничего нет — вызов возвращает ru. */
function labels(_lang: NoteLang) {
  return LABELS.ru;
}

function f(v: number, digits = 0): string {
  return Number.isFinite(v) ? v.toLocaleString("ru-RU", { maximumFractionDigits: digits }) : "—";
}

function today(): string {
  return new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

const MAKES: Record<string, string> = {
  own: "изготовление SUVSANOAT (стеклопластик, Ташкент)",
  "own-partial": "корпус и обвязка — SUVSANOAT, технологические узлы — комплектация",
  supply: "комплектация от партнёров",
};

/** пункты ҚМҚ по ключу ступени — из уже собранного перечня, ничего нового */
function clausesForStage(key: string, all: string[]): string {
  const own = kmkClausesFor([key]).filter((c) => !kmkClausesFor([]).includes(c));
  const shown = own.filter((c) => all.includes(c));
  return (shown.length ? shown : own).join("; ") || "—";
}

export function buildNoteBlocks(n: NoteInput, opts: NoteDocxOptions = {}): DocxBlock[] {
  const L = labels(opts.lang ?? "ru");
  const b: DocxBlock[] = [];
  const norms = n.norms?.length ? n.norms : kmkClausesFor(n.stages.map((s) => s.key));

  /* ---------- 1. Титульный блок ---------- */
  b.push({ t: "p", text: L.company, style: "small" });
  b.push({ t: "p", text: L.title, style: "title" });
  b.push({ t: "p", text: L.subtitle, style: "subtitle" });
  b.push({
    t: "table",
    head: [],
    rows: [
      ["Объект", n.object || n.industry],
      ["Отрасль", `${n.industry} (${n.group})`],
      ["Расчётный расход", `${f(n.Q)} м³/сут; ${f(n.Qh, 1)} м³/ч; ${f(n.Qls, 1)} л/с при ${f(n.hours)} ч работы`],
      ["Исполнение по расходу", n.scale],
      ["Стадия", "предварительная (П), онлайн-расчёт"],
      ["Дата", today()],
      ["Исполнитель", opts.author ? `${L.company}, ${opts.author}` : `${L.company}, Ташкент`],
      ["Нормативная база", kmkDocLine()],
    ],
    widths: [28, 72],
  });
  b.push({
    t: "p",
    text:
      "Записка отражает предварительное решение и не заменяет проектную документацию. " +
      "Величины подлежат уточнению на следующей стадии проектирования по фактическим исходным данным.",
    style: "small",
  });
  b.push({ t: "break" });

  /* ---------- 2. Исходные данные ---------- */
  b.push({ t: "h", level: 1, text: "1. Исходные данные" });
  b.push({
    t: "p",
    text:
      `Расчётный расход сточных вод Q = ${f(n.Q)} м³/сут при режиме работы ${f(n.hours)} ч/сут, ` +
      `что даёт ${f(n.Qh, 1)} м³/ч (${f(n.Qls, 1)} л/с) в рабочее время.`,
  });

  /* Источник каждого показателя — то, ради чего таблица и делается:
     проектировщик должен видеть, какое число измерено, а какое принято
     по справочнику отрасли, и что он вправе оспорить. */
  const defaultSource = n.lab ? "лабораторный анализ заказчика" : "справочник отрасли";
  const src = (label: string) => opts.sourceByLabel?.[label] ?? defaultSource;
  b.push({ t: "h", level: 2, text: "1.1. Состав стока на входе и требования на сбросе" });
  b.push({
    t: "table",
    head: ["Показатель", "На входе", "Требование на сбросе", "Ед.", "Источник значения"],
    rows: [
      ...n.conc.map((c) => [
        c.label,
        f(c.value),
        c.target !== undefined ? f(c.target, 1) : "—",
        c.unit,
        src(c.label),
      ]),
      ["pH", f(n.ph, 1), "6,5–8,5", "—", src("pH")],
    ],
    widths: [26, 14, 18, 10, 32],
  });
  b.push({
    t: "p",
    text: n.lab
      ? "Исходный состав принят по лабораторному анализу заказчика."
      : `Лабораторный анализ отсутствует; исходный состав принят по справочным данным отрасли (${n.sources.join("; ")}) ` +
        `для предпроектной стадии. До рабочего проектирования обязателен анализ усреднённой суточной пробы.`,
  });
  b.push({
    t: "p",
    text:
      "Окончательные требования на сбросе принимаются по техническим условиям водоканала либо разрешению на сброс; " +
      "приведённые значения — целевые для настоящего расчёта.",
    style: "small",
  });

  if (n.special.length) {
    b.push({ t: "h", level: 2, text: "1.2. Особые загрязнители отрасли" });
    b.push({ t: "ul", items: n.special.map((s) => `${s.label} (${s.range[0]}–${s.range[1]} ${s.unit}): ${s.note}`) });
  }

  b.push({ t: "h", level: 2, text: "1.3. Точка сброса и температурный режим" });
  b.push({
    t: "p",
    text: opts.discharge
      ? `Точка сброса очищенной воды — ${opts.discharge}.`
      : "Точка сброса в переданных данных расчёта не указана — принимается по техническим условиям заказчика.",
  });
  if (opts.temperature) {
    const T = opts.temperature;
    b.push({
      t: "p",
      text:
        `Расчётный температурный режим: среднегодовая температура сточной воды ${f(T.annualC, 1)} °C — ` +
        `по ней принят объём биологического блока (поправка времени аэрации 15/T = ${f(T.factor, 2)}); ` +
        `летняя температура ${f(T.summerC, 1)} °C — по ней принят расход воздуха.` +
        (T.winterGoverns
          ? " Объём биологической ступени определяет зимний режим: поправка превышает 1,15, и это учтено в расчёте."
          : ""),
    });
  } else {
    b.push({
      t: "p",
      text:
        "Расчётный температурный режим в переданных данных расчёта не указан. Значения среднегодовой и летней " +
        "температуры сточной воды подлежат указанию проектировщиком: от них зависят объём биологического блока и расход воздуха.",
    });
  }

  /* ---------- 3. Обоснование технологической схемы ---------- */
  b.push({ t: "h", level: 1, text: "2. Обоснование технологической схемы" });
  if (n.tech) {
    const g = n.tech;
    b.push({
      t: "p",
      text:
        g.chosenBy === "engineer"
          ? `Технология биологической очистки — **${g.name}** — принята проектировщиком как решение стадии и положена в основу расчёта: ${g.description}`
          : g.chosenBy === "requirement"
          ? `Технология биологической очистки — **${g.name}** — принята не по выбору проектировщика, а во исполнение действующего требования об обязательной мембранной очистке: ${g.description}`
          : `Технология биологической очистки отдельно не задавалась; принят автоподбор. ${g.description}`,
    });
    /* формулировка требования переносится дословно: реквизиты акта не
       подтверждены, домысливать их нельзя (см. NOTE_SYSTEM_PROMPT, п. 6) */
    if (g.membraneRequirement) {
      b.push({
        t: "p",
        text: g.membraneWaiver
          ? `Отступление от требования. ${g.membraneRequirement} Требование об обязательной мембранной очистке — не строительная норма и к ${KMK_2_04_03_19_DOC.code} отношения не имеет; обоснование отступления входит в состав проекта.`
          : `Основание выбора схемы. ${g.membraneRequirement} Это отраслевое требование, а не положение ${KMK_2_04_03_19_DOC.code}: строительные нормы технологию биологической очистки не предписывают.`,
      });
    }
    if (g.clarifierRemoved) b.push({ t: "p", text: g.clarifierRemoved });
    b.push({
      t: "p",
      text:
        `Расчётный объём биологического блока — ${f(g.volumeM3)} м³; ` +
        (g.aerobic
          ? `расход воздуха на аэрацию — ${f(g.airNm3h, 1)} Нм³/ч.`
          : `аэрация не требуется (процесс анаэробный), воздуходувная станция не предусмотрена.`),
    });
    b.push({ t: "p", text: `Нормативный статус решения: ${g.source}`, style: "small" });
  }
  b.push({
    t: "p",
    text:
      `Принята ${n.stages.length}-ступенчатая схема. Порядок ступеней следует принципу «от крупного к мелкому, ` +
      `от механики к биологии»: сначала удаляются включения, способные вывести из строя последующие сооружения, ` +
      `затем усредняется поток, затем идёт основная очистка и доведение до норматива.`,
  });
  for (const s of n.stages) {
    b.push({ t: "h", level: 3, text: `${String(s.index).padStart(2, "0")}. ${s.title}` });
    b.push({ t: "p", text: `${s.what} Исполнение: ${MAKES[s.makes] ?? s.makes}.` });
    const lines = [...s.sizing, ...(s.extra ? [s.extra] : [])];
    if (lines.length) b.push({ t: "ul", items: lines });
    if (s.picks.length) {
      b.push({
        t: "p",
        text:
          "Готовое изделие: " +
          s.picks
            .map((k) => `${k.count > 1 ? k.count + " × " : ""}${k.code} (${k.params})${k.note ? " — " + k.note : ""}`)
            .join("; ") +
          ".",
        style: "small",
      });
    }
  }

  /* ---------- 4. Расчёт сооружений ---------- */
  b.push({ t: "h", level: 1, text: "3. Расчёт сооружений" });
  b.push({
    t: "p",
    text:
      "Величины приведены в том виде, в котором они получены расчётом; основанием указан пункт " +
      `${KMK_2_04_03_19_DOC.code}, по которому величина нормируется. Прочерк в графе основания означает, ` +
      "что величина принята по практике проектирования и строительными нормами не нормируется.",
    style: "small",
  });
  const calcRows: string[][] = [];
  for (const s of n.stages) {
    const basis = clausesForStage(s.key, norms);
    const lines = [...s.sizing, ...(s.extra ? [s.extra] : [])];
    if (!lines.length) {
      calcRows.push([`${s.index}. ${s.title}`, "по индивидуальному расчёту", basis]);
      continue;
    }
    lines.forEach((line, idx) => calcRows.push([idx === 0 ? `${s.index}. ${s.title}` : "", line, idx === 0 ? basis : ""]));
  }
  b.push({ t: "table", head: ["Сооружение / ступень", "Расчётная величина и значение", "Основание"], rows: calcRows, widths: [24, 46, 30] });

  if (n.civil) {
    b.push({ t: "h", level: 2, text: "3.1. Ёмкостные сооружения и объёмы работ" });
    b.push({
      t: "table",
      head: ["Сооружение", "Объём, м³", "Размеры в свету, м"],
      rows: n.civil.basins.map((x) => [x.name, f(x.volume), `${x.L} × ${x.B} × ${x.H}`]),
      widths: [50, 20, 30],
    });
    b.push({
      t: "p",
      text:
        `Бетон монолитных конструкций — ${f(n.civil.concrete, 1)} м³, арматура — ${f(n.civil.rebarT, 2)} т, ` +
        `опалубка — ${f(n.civil.formwork)} м². Разработка грунта — ${f(n.civil.excavation)} м³, ` +
        `обратная засыпка — ${f(n.civil.backfill)} м³, вывоз излишнего грунта — ` +
        `${f(Math.max(0, n.civil.excavation - n.civil.backfill))} м³.`,
    });
    b.push({ t: "p", text: n.civil.note, style: "small" });
  }

  if (n.pipes?.length) {
    b.push({ t: "h", level: 2, text: "3.2. Трубопроводы" });
    b.push({
      t: "table",
      head: ["Трубопровод", "Расход, м³/ч", "DN", "Скорость, м/с", "Длина ≈, м", "Материал"],
      rows: n.pipes.map((x) => [x.name, f(x.flow, 1), String(x.dn), String(x.velocity), String(x.length), x.material]),
      widths: [30, 14, 10, 14, 14, 18],
    });
    b.push({
      t: "p",
      text: "Длины ориентировочные, приняты по габаритам площадки; точные значения определяются генпланом и профилем сетей.",
      style: "small",
    });
  }

  if (n.area) {
    b.push({ t: "h", level: 2, text: "3.3. Площадь участка" });
    b.push({
      t: "p",
      text:
        `Сооружения с проходами — ${f(n.area.structures)} м²; здания и помещения — ${f(n.area.buildings)} м²; ` +
        `площадь застройки — ${f(n.area.built)} м²; площадь участка — ${f(n.area.site)} м² ` +
        `(${f(n.area.site / 10000, 2)} га).`,
    });
    b.push({ t: "p", text: n.area.note, style: "small" });
  }

  if (n.szz !== undefined) {
    b.push({ t: "h", level: 2, text: "3.4. Санитарно-защитная зона" });
    if (n.szz) {
      b.push({ t: "p", text: `Санитарно-защитная зона — ${n.szz.meters} м (${n.szz.basis}).` });
      if (n.szz.notes.length) b.push({ t: "ul", items: n.szz.notes });
    } else {
      b.push({
        t: "p",
        text:
          "Для очистных сооружений промышленных предприятий и поверхностного стока размер санитарно-защитной зоны " +
          `устанавливается по согласованию с органами санэпиднадзора (${KMK_2_04_03_19_DOC.code}, табл. 1, прим. 8).`,
      });
    }
  }

  if (n.power) {
    b.push({ t: "h", level: 2, text: "3.5. Электроснабжение" });
    b.push({
      t: "p",
      text:
        `Установленная мощность — ${f(n.power.installed, 1)} кВт, расчётная — ${f(n.power.demand, 1)} кВт. ` +
        `Потребление ${f(n.power.daily)} кВт·ч/сут, ${f(n.power.yearly / 1000)} тыс. кВт·ч/год. ` +
        `Удельный расход ${f(n.power.specific, 2)} кВт·ч на м³ стока и ${f(n.power.specificBod, 2)} кВт·ч ` +
        `на кг удалённого БПК₅.`,
    });
    b.push({
      t: "table",
      head: ["Потребитель", "Кол-во × кВт", "Установл., кВт", "ч/сут", "кВт·ч/сут", "Основание"],
      rows: n.power.items.map((x) => [
        x.name,
        `${x.qty} × ${x.unit}`,
        String(x.installed),
        String(x.hours),
        String(x.daily),
        x.basis,
      ]),
      widths: [26, 14, 13, 9, 13, 25],
    });
    b.push({ t: "p", text: n.power.note, style: "small" });
  }

  /* ---------- 5. Спецификация A / B ---------- */
  b.push({ t: "break" });
  b.push({ t: "h", level: 1, text: "4. Спецификация оборудования" });
  b.push({
    t: "p",
    text:
      "Состав оборудования определён технологией, а не тем, что производит завод. Разделение на части A и B " +
      "показывает лишь происхождение позиции: часть A изготавливает SUVSANOAT, часть B закупается " +
      "комплектующими. На состав решения это разделение не влияет.",
  });

  type Row = { stage: string; item: NoteItem };
  const all: Row[] = [
    ...n.stages.flatMap((s) => s.items.map((item) => ({ stage: `${s.index}. ${s.title}`, item }))),
    ...n.common.map((item) => ({ stage: "Общестанционные узлы", item })),
  ];
  /* «either» — позиция, которую можно и изготовить, и купить: относим её
     к части A с пометкой, потому что для заказчика важно, что завод
     закрывает её собственным производством, если понадобится */
  const partA = all.filter((r) => r.item.supply === "own" || r.item.supply === "either");
  const partB = all.filter((r) => r.item.supply === "supply");
  const specRow = (r: Row, i: number) => [
    String(i + 1),
    r.stage,
    r.item.name,
    r.item.spec,
    r.item.qty,
    [r.item.note, r.item.supply === "either" ? "возможна также поставка" : ""].filter(Boolean).join("; ") || "—",
  ];
  const specHead = ["№", "Ступень", "Позиция", "Расчётный параметр", "Кол-во", "Примечание"];
  const specWidths = [5, 20, 24, 25, 10, 16];

  b.push({ t: "h", level: 2, text: "4.1. Часть A — изготавливает SUVSANOAT" });
  if (partA.length) {
    b.push({ t: "table", head: specHead, rows: partA.map(specRow), widths: specWidths });
  } else {
    b.push({ t: "p", text: "Позиций собственного изготовления в решении нет." });
  }
  const picks = n.stages.flatMap((s) => s.picks);
  if (picks.length) {
    b.push({
      t: "p",
      text:
        "Готовые изделия SUVSANOAT, подходящие под позиции части A: " +
        picks.map((k) => `${k.count > 1 ? k.count + " × " : ""}${k.code} (${k.params})`).join("; ") +
        ".",
      style: "small",
    });
  }

  b.push({ t: "h", level: 2, text: "4.2. Часть B — покупные комплектующие" });
  if (partB.length) {
    b.push({ t: "table", head: specHead, rows: partB.map(specRow), widths: specWidths });
  } else {
    b.push({ t: "p", text: "Покупных позиций в решении нет." });
  }
  b.push({
    t: "p",
    text:
      "Конкретные марки и производители позиций части B на предварительной стадии не назначаются: " +
      "они принимаются при рабочем проектировании по результатам запроса цен и наличию сервиса.",
    style: "small",
  });

  /* ---------- 6. Допущения ---------- */
  b.push({ t: "h", level: 1, text: "5. Принятые допущения" });
  b.push({
    t: "p",
    text:
      "Перечислены все допущения расчёта. Каждое из них — предмет проверки на следующей стадии: " +
      "изменение любого допущения меняет размеры сооружений.",
    style: "small",
  });
  const assumptions: string[] = [];
  if (!n.lab) {
    assumptions.push(
      `Лабораторный анализ не предоставлен: состав стока принят по справочным данным отрасли (${n.sources.join("; ")}).`
    );
  }
  assumptions.push(`Расход ${f(n.Q)} м³/сут при ${f(n.hours)} ч работы в сутки принят как расчётный.`);
  if (n.tech?.assumptions.length) assumptions.push(...n.tech.assumptions);
  assumptions.push(...n.notes);
  b.push({ t: "ul", items: assumptions });

  /* ---------- 7. Что уточнить ---------- */
  b.push({ t: "h", level: 1, text: "6. Что подлежит уточнению на следующей стадии" });
  const toCheck = [
    "Анализ усреднённой суточной пробы по всем показателям раздела 1, включая температуру и залповые сбросы.",
    "Технические условия на сброс (водоканал / экологическая экспертиза) — определяют глубину доочистки и необходимость обеззараживания.",
    "Геология площадки и уровень грунтовых вод — для заглублённых корпусов из стеклопластика (расчёт на всплытие, анкеровка).",
    "Точки подключения, отметки лотков и располагаемый напор — для гидравлического профиля.",
    "Режим работы предприятия по сменам и сезонность — для объёма усреднителя.",
  ];
  if (!opts.temperature) {
    toCheck.push("Среднегодовая и летняя расчётные температуры сточной воды — в исходных данных не заданы.");
  }
  if (n.tech?.warnings.length) toCheck.push(...n.tech.warnings);
  b.push({ t: "ul", items: toCheck });

  /* ---------- 8. Нормативная база ---------- */
  b.push({ t: "h", level: 1, text: "7. Нормативная база" });
  b.push({ t: "p", text: `Основной документ — ${kmkDocLine()}.` });
  b.push({ t: "p", text: `Использованные положения ${KMK_2_04_03_19_DOC.code}:` });
  b.push({ t: "ul", items: norms });
  b.push({
    t: "p",
    text:
      `Смежные документы, на которые отсылает ${KMK_2_04_03_19_DOC.code}: ` +
      RELATED_DOCUMENTS.map((d) => `${d.code} «${d.title}» — ${d.purpose}`).join("; ") +
      `. Методики, не нормируемые ${KMK_2_04_03_19_DOC.code} (справочные): DWA-A 131; EN 1825; EN 858; ` +
      `${n.sources.join("; ")}.`,
    style: "small",
  });

  /* ---------- Ответ на ТЗ ---------- */
  b.push(...tzAnswerBlocks(opts.requirements ?? [], opts.answers ?? []));

  /* ---------- Приложение А: повествовательная записка ---------- */
  if (opts.narrative && opts.narrative.trim().length > 200) {
    b.push({ t: "break" });
    b.push({ t: "h", level: 1, text: "Приложение А. Инженерное обоснование (текстовое изложение)" });
    b.push({
      t: "p",
      text:
        "Ниже — то же решение в связном изложении. Числа те же, что в разделах 1–7; " +
        "при расхождении верны разделы 1–7 настоящей записки.",
      style: "small",
    });
    /* заголовок записки (#) опускается, остальные сдвигаются на уровень
       ниже, чтобы приложение не спорило с нумерацией разделов документа */
    const blocks = markdownToBlocks(opts.narrative, 1).filter((x) => !(x.t === "h" && x.level === 1));
    b.push(...blocks);
  }

  return b;
}

/**
 * Раздел «Ответ на техническое задание». Требований нет — раздела нет:
 * пустая таблица в записке хуже её отсутствия.
 */
export function tzAnswerBlocks(reqs: TzRequirement[], answers: TzAnswer[]): DocxBlock[] {
  if (!reqs.length) return [];
  const byNo = new Map(answers.map((a) => [a.no, a]));
  const manual = "Сопоставление выполняется проектировщиком вручную.";
  const b: DocxBlock[] = [
    { t: "break" },
    { t: "h", level: 1, text: "8. Ответ на техническое задание по пунктам" },
    {
      t: "p",
      text: answers.length
        ? "Каждому требованию технического задания сопоставлено принятое решение и место, где оно отражено. " +
          "Ответ составлен по данным настоящего расчёта; пункты, не покрытые расчётом, помечены прямо."
        : "Требования технического задания перенесены из приложенного документа. Сопоставление с принятыми " +
          "решениями выполняет проектировщик: автоматическое сопоставление не производилось.",
    },
    {
      t: "table",
      head: ["Пункт ТЗ", "Требование", "Как выполнено", "Где в проекте"],
      rows: reqs.map((r) => {
        const a = byNo.get(r.no);
        return [r.no || "—", r.text, a?.how ?? manual, a?.where ?? manual];
      }),
      widths: [8, 32, 40, 20],
    },
  ];
  return b;
}

/** Готовый файл .docx. Числа берутся только из n и opts — здесь ничего не считается. */
export function buildNoteDocx(n: NoteInput, opts: NoteDocxOptions = {}): Uint8Array {
  const L = labels(opts.lang ?? "ru");
  return buildDocxFile(buildNoteBlocks(n, opts), {
    title: `${L.title}. ${n.object || n.industry}`,
    subject: L.subtitle,
    creator: L.company,
  });
}
