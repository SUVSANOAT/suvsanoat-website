/* ==================================================================
 * ВЕДОМОСТЬ В EXCEL: КОЛИЧЕСТВА ОТ ПРОГРАММЫ, ЦЕНЫ ОТ ЧЕЛОВЕКА
 *
 * Один построитель на обе ведомости — сети и водовода: обе выдают
 * одинаковые строки SpecRow, и делать два разных листа незачем.
 *
 * ПОЧЕМУ ЦЕНЫ ПУСТЫЕ, А ИТОГ — ФОРМУЛА
 *
 * Цен программа не знает и знать не может: они разные у каждого
 * поставщика и меняются быстрее любого справочника. Поэтому колонка
 * цены пустая, а стоимость и итог стоят формулами Excel. Снабженец
 * вписывает свои цены — итог пересчитывается сам. Если бы итог был
 * посчитан заранее и записан числом, он остался бы прежним при первой
 * же правке цены, и ведомость начала бы врать.
 *
 * ВТОРОЙ ЛИСТ ОБЯЗАТЕЛЕН
 *
 * Количества без оснований — это список, по которому нельзя ни
 * проверить решение, ни возразить против него. На втором листе идут
 * формулы, из которых получено каждое количество, и перечень принятых
 * величин.
 * ================================================================== */

import type { XCell, XRow, XSheet } from "../app/engineering/analysis/pro-result/xlsx";
import type { Formula } from "./water-demand";
import type { SpecResult } from "./water-spec";

const t = (v: string | number | null): XCell => ({ v, s: "text" });
const head = (v: string): XCell => ({ v, s: "head" });
const title = (v: string): XCell => ({ v, s: "title" });
const note = (v: string): XCell => ({ v, s: "note" });
const section = (v: string): XCell => ({ v, s: "section" });
const total = (v: string): XCell => ({ v, s: "total" });
const int = (v: number): XCell => ({ v, s: "int" });
const num = (v: number): XCell => ({ v, s: "num" });

export type SpecWorkbookInput = {
  /** заголовок листа: «Водовод …» или «Водопроводная сеть …» */
  heading: string;
  object?: string;
  spec: SpecResult;
  /** допущения расчёта — на лист оснований */
  assumptions?: string[];
  /** замечания расчёта — туда же */
  warnings?: string[];
  /** дополнительные формулы помимо тех, что пришли с ведомостью */
  formulas?: Formula[];
};

const COLS = [5, 34, 26, 7, 11, 15, 17, 46];

export function buildSpecSheets(input: SpecWorkbookInput): XSheet[] {
  const rows: XRow[] = [];
  const dateStr = new Date().toLocaleDateString("ru-RU");

  rows.push([title(input.heading)]);
  if (input.object) rows.push([t(input.object)]);
  rows.push([note(`Ведомость материалов и оборудования. Дата расчёта ${dateStr}. SUVSANOAT`)]);
  rows.push([
    note(
      "Колонка «Цена за единицу» заполняется вручную: цены подставляются на день закупки. " +
        "Стоимость и итог пересчитываются формулами сами.",
    ),
  ]);
  rows.push([]);

  const headerRowNo = rows.length + 1;
  rows.push([
    head("№"),
    head("Наименование"),
    head("Тип, марка"),
    head("Ед."),
    head("Кол-во"),
    head("Цена за ед."),
    head("Стоимость"),
    head("Примечание"),
  ]);

  /* строки по группам: группа выводится подзаголовком один раз */
  const costRefs: string[] = [];
  let lastGroup = "";
  input.spec.rows.forEach((r) => {
    if (r.group !== lastGroup) {
      rows.push([section(r.group)]);
      lastGroup = r.group;
    }
    const n = rows.length + 1;
    costRefs.push(`G${n}`);
    rows.push([
      t(r.no),
      t(r.name),
      t(r.type),
      t(r.unit),
      Number.isInteger(r.qty) ? int(r.qty) : num(r.qty),
      { v: null, s: "num" },
      { v: null, s: "num", f: `IF(F${n}="","",E${n}*F${n})` },
      t(r.note),
    ]);
  });

  /* итог: сумма по всем строкам стоимости, а не по диапазону —
     между позициями стоят подзаголовки групп, и сплошной диапазон
     захватил бы их */
  const totalRow: XRow = [
    total(""),
    total("ИТОГО"),
    total(""),
    total(""),
    total(""),
    total(""),
    { v: null, s: "totalNum", f: costRefs.length ? `SUM(${costRefs.join(",")})` : "0" },
    total("при заполненной колонке цены"),
  ];
  rows.push([]);
  rows.push(totalRow);

  rows.push([]);
  rows.push([note("Позиции, которых здесь нет: упоры, опоры и колодцы на поворотах — план трассы в расчёт не вводится, углы поворота неизвестны.")]);

  const sheet: XSheet = { name: "Ведомость", cols: COLS, rows, freezeRows: headerRowNo };

  /* ---------------- лист оснований ---------------- */
  const base: XRow[] = [];
  base.push([title("Основания количеств")]);
  base.push([note("Каждое количество в ведомости получено расчётом, а не назначено. Ниже — формулы и принятые величины.")]);
  base.push([]);
  base.push([head("Величина"), head("Формула"), head("Результат"), head("Источник")]);
  [...input.spec.formulas, ...(input.formulas ?? [])].forEach((f) => base.push([t(f.label), t(f.formula), t(f.result), t(f.source ?? "—")]));

  if (input.warnings?.length) {
    base.push([]);
    base.push([section("Замечания к расчёту")]);
    input.warnings.forEach((w) => base.push([t(""), t(w)]));
  }
  if (input.assumptions?.length) {
    base.push([]);
    base.push([section("Что принято, а не посчитано")]);
    input.assumptions.forEach((a) => base.push([t(""), t(a)]));
  }

  const baseSheet: XSheet = { name: "Основания", cols: [26, 46, 20, 52], rows: base, freezeRows: 4 };

  return [sheet, baseSheet];
}
