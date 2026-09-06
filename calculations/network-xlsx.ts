/* ==================================================================
 * ВЕДОМОСТЬ ГИДРАВЛИЧЕСКОГО РАСЧЁТА САМОТЁЧНОЙ СЕТИ — КНИГА EXCEL
 *
 * Три листа:
 *   1. Ведомость расчёта — участок за участком, в том порядке, в
 *      каком её читает эксперт: расход, диаметр, уклон, скорость,
 *      наполнение, отметки, глубина.
 *   2. Узлы — исходные данные, как их задал проектировщик, чтобы
 *      расчёт можно было повторить, не выясняя, что вводили.
 *   3. Исходные данные и допущения — что взято из норм с пунктами, а
 *      что принято решением проектировщика.
 *
 * Третий лист обязателен. Ведомость без основания — это столбик
 * чисел, по нему нельзя ни проверить решение, ни защитить его.
 * ================================================================== */

import { buildXlsxFile, type XCell, type XRow, type XSheet } from "../app/engineering/analysis/pro-result/xlsx";
import type { NetworkInput, NetworkResult, SegmentResult } from "./network";

const t = (v: string | number | null): XCell => ({ v, s: "text" });
const num = (v: number | null): XCell => ({ v: v === null ? "—" : v, s: v === null ? "text" : "num" });
const head = (v: string): XCell => ({ v, s: "head" });
const title = (v: string): XCell => ({ v, s: "title" });
const note = (v: string): XCell => ({ v, s: "note" });
const total = (v: string): XCell => ({ v, s: "total" });
const totalNum = (v: number): XCell => ({ v, s: "totalNum" });

/** уклон читается как 0,0070, а не как 7E-3 — в ведомости так принято */
const slopeCell = (i: number): XCell => ({ v: Number(i.toFixed(4)), s: "num" });

function calcSheet(res: NetworkResult): XSheet {
  const rows: XRow[] = [];
  rows.push([title("ВЕДОМОСТЬ ГИДРАВЛИЧЕСКОГО РАСЧЁТА САМОТЁЧНОЙ СЕТИ")]);
  rows.push([note("Расчёт по ҚМҚ 2.04.03-19. Пункты норм — на листе «Исходные данные».")]);
  rows.push([]);
  rows.push([
    head("Участок"),
    head("Длина, м"),
    head("Жители, чел."),
    head("Q ср, л/с"),
    head("K gen.max"),
    head("Q расч, л/с"),
    head("DN, мм"),
    head("Уклон i"),
    head("v, м/с"),
    head("v min, м/с"),
    head("H/D"),
    head("H/D max"),
    head("Лоток начало, м"),
    head("Лоток конец, м"),
    head("Глубина начало, м"),
    head("Глубина конец, м"),
    head("Перепад, м"),
    head("Примечания"),
  ]);

  res.segments.forEach((s: SegmentResult) => {
    rows.push([
      t(`${s.from} — ${s.to}`),
      num(s.lengthM),
      { v: s.peopleCum, s: "int" },
      num(s.qAvgLps),
      num(s.kMax),
      num(s.qCalcLps),
      { v: s.dnMm, s: "int" },
      slopeCell(s.slope),
      num(s.velocity),
      num(s.vMinRequired),
      num(s.fill),
      num(s.fillMax),
      num(s.invertStart),
      num(s.invertEnd),
      num(s.depthStart),
      num(s.depthEnd),
      s.dropM > 0 ? num(s.dropM) : t("—"),
      t(s.warnings.join(" ") || ""),
    ]);
  });

  rows.push([]);
  rows.push([
    total("Итого в конечной точке"),
    t(""),
    t(""),
    t(""),
    t(""),
    totalNum(res.totalCalcLps),
    t("л/с"),
  ]);
  rows.push([total("Суточный расход"), totalNum(res.totalM3Day), t("м³/сут")]);
  rows.push([
    total("Наибольшая глубина заложения"),
    totalNum(res.maxDepthM),
    t(`м, в колодце ${res.maxDepthAt || "—"}`),
  ]);

  if (res.warnings.length) {
    rows.push([]);
    rows.push([head("Предупреждения по сети в целом")]);
    res.warnings.forEach((w) => rows.push([t(w)]));
  }

  return {
    name: "Ведомость расчёта",
    cols: [16, 9, 11, 9, 10, 10, 8, 9, 8, 9, 7, 8, 14, 14, 13, 13, 9, 60],
    rows,
    freezeRows: 4,
  };
}

function nodesSheet(input: NetworkInput): XSheet {
  const rows: XRow[] = [];
  rows.push([title("УЗЛЫ СЕТИ — ИСХОДНЫЕ ДАННЫЕ")]);
  rows.push([note("То, что задал проектировщик. Расчёт по этим данным повторяется один в один.")]);
  rows.push([]);
  rows.push([
    head("Колодец"),
    head("X, м"),
    head("Y, м"),
    head("Отметка земли, м"),
    head("Жители, чел."),
    head("Сосредоточенный расход, м³/сут"),
    head("Течёт в"),
  ]);
  const out = new Map(input.links.map((l) => [l.from, l.to]));
  input.nodes.forEach((n) => {
    rows.push([
      t(n.id),
      n.x === undefined ? t("—") : num(n.x),
      n.y === undefined ? t("—") : num(n.y),
      num(n.groundElev),
      { v: n.people ?? 0, s: "int" },
      n.qConcentratedM3Day ? num(n.qConcentratedM3Day) : t("—"),
      t(n.id === input.outfallId ? "выпуск" : out.get(n.id) ?? "не подключён"),
    ]);
  });
  return { name: "Узлы", cols: [12, 12, 12, 16, 12, 24, 14], rows, freezeRows: 4 };
}

function basisSheet(input: NetworkInput, res: NetworkResult): XSheet {
  const rows: XRow[] = [];
  rows.push([title("ИСХОДНЫЕ ДАННЫЕ И ДОПУЩЕНИЯ РАСЧЁТА")]);
  rows.push([]);
  rows.push([head("Показатель"), head("Значение")]);
  rows.push([t("Норматив"), t("ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения»")]);
  rows.push([t("Число узлов"), { v: input.nodes.length, s: "int" }]);
  rows.push([t("Число участков"), { v: res.segments.length, s: "int" }]);
  rows.push([t("Конечная точка"), t(input.outfallId)]);
  rows.push([t("Источник отметок"), t(elevLabel(input.elevSource))]);
  rows.push([]);
  rows.push([head("Что принято и на каком основании")]);
  res.assumptions.forEach((a) => rows.push([t(a)]));

  const risky = res.segments.filter((s) => s.warnings.length);
  if (risky.length) {
    rows.push([]);
    rows.push([head("Участки, требующие решения проектировщика")]);
    risky.forEach((s) => rows.push([t(`${s.from} — ${s.to}`), t(s.warnings.join(" "))]));
  }

  return { name: "Исходные данные", cols: [28, 110], rows };
}

function elevLabel(src: NetworkInput["elevSource"]): string {
  if (src === "survey") return "топографическая съёмка — отметки рабочие";
  if (src === "google") return "рельеф Google Earth — отметки предварительные, для выпуска рабочей документации требуется съёмка";
  return "отметки приняты условно — расчёт демонстрационный";
}

export function buildNetworkWorkbook(input: NetworkInput, res: NetworkResult): Uint8Array {
  return buildXlsxFile([calcSheet(res), nodesSheet(input), basisSheet(input, res)], {
    title: "Гидравлический расчёт самотёчной канализационной сети",
    subject: "ҚМҚ 2.04.03-19",
    creator: "SUVSANOAT",
  });
}
