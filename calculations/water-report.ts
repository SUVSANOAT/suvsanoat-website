/* ==================================================================
 * ОТЧЁТ ПО РАСЧЁТУ ВОДОПРОВОДНОЙ СЕТИ: WORD И PDF
 *
 * Один набор блоков — два выхода. В Word он уходит через общий
 * сборщик buildDocxFile, в PDF — через печать браузера из
 * подготовленной страницы. Числа в обоих одни и те же, потому что
 * собираются из одного результата расчёта.
 *
 * ПОЧЕМУ ФОРМУЛЫ ИДУТ РЯДОМ С ЧИСЛАМИ
 *
 * Эксперт проверяет не результат, а путь к нему. Таблица чисел без
 * формулы заставляет его либо верить на слово, либо пересчитывать всё
 * заново. Поэтому в каждом разделе сначала формула с подставленными
 * значениями, потом результат, потом ссылка на пункт норматива.
 *
 * ГРАНИЦА НОРМЫ И ПРАКТИКИ
 *
 * Отдельным разделом идёт реестр источников: какая величина откуда
 * взята и является ли она нормой. Спорить можно о практике; о норме
 * спорить нельзя, её можно только применить или нарушить, и тогда
 * нарушение должно быть названо.
 * ================================================================== */

import type { DocxBlock } from "../app/engineering/analysis/pro-result/docx";
import type { DemandResult, NodeEquipment, LinkEquipment, Formula, SettlementKind, Terrain } from "./water-demand";
import { NORM_DOC, SETTLEMENT, TERRAIN } from "./water-demand";
import type { FireModeResult, WaterNetworkResult } from "./water-network";

export type ReportInput = {
  object?: string;
  settlement: SettlementKind;
  terrain: Terrain;
  floors: number;
  sourceId: string;
  sourceHeadM: number;
  materialLabel: string;
  demand: DemandResult;
  net: WaterNetworkResult;
  fire?: FireModeResult | null;
  equip?: { nodes: NodeEquipment[]; links: LinkEquipment[]; zoning: string | null; formulas: Formula[] } | null;
  peopleByNode?: Record<string, number | undefined>;
};

const f = (v: number, d = 2) => v.toFixed(d).replace(".", ",");
const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

/** Таблица формул: формула — результат — источник. */
function formulaTable(items: Formula[]): DocxBlock {
  return {
    t: "table",
    head: ["Величина", "Формула", "Результат", "Источник"],
    widths: [20, 38, 18, 24],
    rows: items.map((x) => [x.label, x.formula, x.result, x.source ?? "—"]),
  };
}

export function buildReportBlocks(r: ReportInput): DocxBlock[] {
  const b: DocxBlock[] = [];
  const d = r.demand;
  const net = r.net;
  const object = r.object || "Водопроводная сеть населённого пункта";

  /* ---------------- титул ---------------- */
  b.push({ t: "p", text: "SUVSANOAT", style: "subtitle" });
  b.push({ t: "p", text: "Гидравлический расчёт", style: "title" });
  b.push({ t: "p", text: "водопроводной сети населённого пункта", style: "subtitle" });
  b.push({ t: "p", text: object, style: "subtitle" });
  b.push({ t: "p", text: `Дата расчёта: ${today()}`, style: "small" });
  b.push({
    t: "p",
    text:
      "Расчёт предварительный. Он выполнен по данным раздела 1 и подлежит проверке инженером перед выпуском " +
      "рабочей документации. Величины, не являющиеся нормой, перечислены в разделе «Источники величин».",
    style: "small",
  });
  b.push({ t: "break" });

  /* ---------------- 1. исходные данные ---------------- */
  b.push({ t: "h", level: 1, text: "1. Исходные данные" });
  b.push({
    t: "table",
    head: ["Показатель", "Значение"],
    widths: [42, 58],
    rows: [
      ["Населённый пункт", SETTLEMENT[r.settlement].label],
      ["Местность", TERRAIN[r.terrain].label],
      ["Этажность застройки", `${r.floors}`],
      ["Число жителей", `${d.totalPeople} чел.`],
      ["Узлов в сети", `${net.nodes.length}`],
      ["Участков", `${net.links.length}`],
      ["Тип сети", `${net.kindLabel}${net.loops > 0 ? `, колец: ${net.loops}` : ""}`],
      ["Источник", `узел ${r.sourceId}, пьезометрическая отметка ${f(r.sourceHeadM, 2)} м`],
      ["Материал труб", r.materialLabel],
      ["Норматив по расходам", NORM_DOC.kmk],
      ["Норматив по сети", NORM_DOC.shnk],
    ],
  });

  /* ---------------- 2. расходы ---------------- */
  b.push({ t: "h", level: 1, text: "2. Расчётные расходы воды" });
  b.push({
    t: "p",
    text:
      d.method === "kmk"
        ? "Переход от среднего расхода к расчётному выполнен общим коэффициентом неравномерности по табл. 2 " +
          "ҚМҚ 2.04.03-19. Эта таблица нормирует приток сточных вод; для водопроводной сети она применена по " +
          "указанию проектировщика, и результат отличается от способа, принятого для водоснабжения."
        : "Переход от среднего расхода к расчётному выполнен раздельно: коэффициентом суточной неравномерности и " +
          "коэффициентом часовой неравномерности K ч.max = α·β. Это способ, принятый для водоснабжения; норма на " +
          "жителя при этом взята по табл. 3 ҚМҚ 2.04.03-19, где удельное водоотведение прямо приравнено к " +
          "водопотреблению по ШНК 2.04.02-97*, п. 2.1.",
  });
  b.push(formulaTable(d.formulas));

  b.push({ t: "h", level: 2, text: "2.1. Узловые отборы" });
  b.push({
    t: "table",
    head: ["Узел", "Жителей, чел.", "Отбор, л/с", "Примечание"],
    widths: [22, 22, 22, 34],
    rows: net.nodes.map((n) => {
      const people = r.peopleByNode?.[n.id];
      return [n.id, people ? String(people) : "—", f(n.demandLps), people ? "по жителям" : n.demandLps > 0 ? "задан напрямую" : "нет отбора"];
    }),
  });

  /* ---------------- 3. гидравлика ---------------- */
  b.push({ t: "h", level: 1, text: "3. Гидравлический расчёт сети" });
  b.push({
    t: "p",
    text:
      net.kind === "looped"
        ? `Сеть закольцованная: ${net.loops} независимых ${net.loops === 1 ? "кольца" : "колец"}. Расходы по участкам ` +
          `заранее неизвестны и найдены увязкой колец по методу Лобачёва–Кросса за ${net.iterations} ` +
          `${net.iterations === 1 ? "итерацию" : "итераций"}: невязка по каждому кольцу доведена до нуля.`
        : "Сеть тупиковая: к каждому узлу вода приходит одним путём. Расход участка равен сумме отборов всех узлов " +
          "за ним и найден прямым ходом от концов веток к источнику.",
  });
  b.push(formulaTable(net.formulas));

  b.push({ t: "h", level: 2, text: "3.1. Ведомость участков" });
  b.push({
    t: "table",
    head: ["Участок", "L, м", "DN, мм", "Q, л/с", "v, м/с", "i, м/км", "h, м"],
    widths: [22, 12, 13, 14, 13, 13, 13],
    rows: net.links.map((l) => [
      `${l.from} — ${l.to}`,
      String(l.lengthM),
      `${l.dnMm}${l.dnAuto ? "*" : ""}`,
      f(l.qLps),
      f(l.velocity),
      f(l.gradientMPerKm),
      f(l.headlossM),
    ]),
  });
  if (net.links.some((l) => l.dnAuto)) {
    b.push({ t: "p", text: "* — диаметр подобран программой по экономичной скорости; уточняется проектировщиком.", style: "small" });
  }

  b.push({ t: "h", level: 2, text: "3.2. Ведомость узлов" });
  b.push({
    t: "table",
    head: ["Узел", "Отметка земли, м", "Отбор, л/с", "Пьезометр, м", "H св, м", "Требуется, м"],
    widths: [16, 20, 16, 18, 15, 15],
    rows: net.nodes.map((n) => [n.id, f(n.groundM), f(n.demandLps), f(n.hglM), f(n.freeHeadM, 1), String(n.requiredM)]),
  });

  if (net.kind === "looped" && net.emergency.length) {
    b.push({ t: "h", level: 2, text: "3.3. Аварийный режим — отказ одного участка" });
    b.push({
      t: "p",
      text:
        "Кольцевая сеть делается ради надёжности: при аварии на участке вода должна идти в обход. Проверка " +
        "выполнена перебором — по очереди отключается каждый участок при тех же диаметрах и том же напоре " +
        "источника.",
    });
    b.push({
      t: "table",
      head: ["Отключён участок", "Худший H св, м", "В узле", "Без воды"],
      widths: [28, 22, 20, 30],
      rows: net.emergency.map((e) => [e.linkId, f(e.worstFreeHeadM, 1), e.worstNode, e.cutOff.join(", ") || "—"]),
    });
  }

  /* ---------------- 4. пожар ---------------- */
  if (r.fire) {
    b.push({ t: "h", level: 1, text: "4. Расчёт на пожаротушение" });
    b.push({
      t: "p",
      text:
        "Пожарный режим считается отдельно: час максимального водопотребления плюс расход на тушение. Пожар " +
        `принят в ${r.fire.fireNodes.length > 1 ? "узлах" : "узле"} ${r.fire.fireNodes.join(", ")} — ` +
        "наиболее невыгодн" + (r.fire.fireNodes.length > 1 ? "ых по напору" : "ом по напору") + ". " +
        "Требование для сети низкого давления одно: свободный напор у гидранта не ниже 10 м.",
    });
    b.push(formulaTable(r.fire.formulas));
    b.push({
      t: "table",
      head: ["Узел", "Отбор при пожаре, л/с", "Пьезометр, м", "H св, м", "Примечание"],
      widths: [16, 24, 20, 16, 24],
      rows: r.fire.net.nodes.map((n) => [
        n.id,
        f(n.demandLps),
        f(n.hglM),
        f(n.freeHeadM, 1),
        r.fire!.fireNodes.includes(n.id) ? "пожар здесь" : n.freeHeadM < 10 && n.id !== r.sourceId ? "ниже 10 м" : "",
      ]),
    });
    b.push({
      t: "p",
      text: r.fire.ok
        ? `Условие выполнено: наименьший свободный напор ${r.fire.worst ? f(r.fire.worst.freeHeadM, 1) : "—"} м в узле ${r.fire.worst?.id ?? "—"}.`
        : `Условие НЕ выполнено: свободный напор ${r.fire.worst ? f(r.fire.worst.freeHeadM, 1) : "—"} м в узле ${r.fire.worst?.id ?? "—"} ниже требуемых 10 м. Нужно поднять напор источника, увеличить диаметры на пути к этому узлу либо предусмотреть пожарные насосы.`,
    });
  }

  /* ---------------- 5. арматура ---------------- */
  if (r.equip) {
    b.push({ t: "h", level: 1, text: `${r.fire ? "5" : "4"}. Оборудование узлов и участков` });
    if (r.equip.zoning) b.push({ t: "p", text: r.equip.zoning });
    b.push({
      t: "table",
      head: ["Узел", "Что устанавливается", "Основание"],
      widths: [12, 44, 44],
      rows: r.equip.nodes.map((n) => [n.id, n.items.join("; "), n.reasons.join("; ")]),
    });
    if (r.equip.links.some((l) => l.hydrants > 0)) {
      b.push({ t: "h", level: 2, text: `${r.fire ? "5" : "4"}.1. Пожарные гидранты на участках` });
      b.push({
        t: "table",
        head: ["Участок", "Промежуточных гидрантов", "Расчёт"],
        widths: [26, 26, 48],
        rows: r.equip.links.map((l) => [l.id, String(l.hydrants), l.note]),
      });
    }
    b.push(formulaTable(r.equip.formulas));
  }

  /* ---------------- источники ---------------- */
  const nSec = r.equip ? (r.fire ? 6 : 5) : r.fire ? 5 : 4;
  b.push({ t: "h", level: 1, text: `${nSec}. Источники величин` });
  b.push({
    t: "p",
    text:
      "Ниже перечислена каждая величина, вошедшая в расчёт, с указанием, является она нормой или принята по " +
      "практике проектирования. ҚМҚ 2.04.03-19 нормирует канализацию; к водоснабжению из него применимы табл. 3 " +
      "(удельное водоотведение приравнено к водопотреблению по ШНК 2.04.02-97*, п. 2.1), п. 2.3 и табл. 2. " +
      "Величины, относящиеся к самой водопроводной сети, нормирует ШНК 2.04.02-97*; в расчёте указан " +
      "первоисточник СНиП 2.04.02-84, из которого ШНК переиздан — пункты подлежат сверке по действующей редакции.",
  });
  b.push({
    t: "table",
    head: ["Величина", "Принято", "Норма или практика", "Источник"],
    widths: [26, 18, 14, 42],
    rows: d.sources.map((x) => [x.label, x.value, x.kind, x.source]),
  });

  /* ---------------- предупреждения ---------------- */
  const warns = [...net.warnings];
  if (warns.length) {
    b.push({ t: "h", level: 1, text: `${nSec + 1}. Замечания к расчёту` });
    b.push({ t: "ul", items: warns });
  }

  /* ---------------- допущения ---------------- */
  b.push({ t: "h", level: 1, text: `${nSec + (warns.length ? 2 : 1)}. Принятые допущения` });
  b.push({ t: "ul", items: [...d.assumptions, ...net.assumptions] });

  return b;
}

/** Метаданные файла Word — сборка выполняется на сервере, в маршруте API. */
export function reportDocxMeta(r: ReportInput) {
  return {
    title: `Гидравлический расчёт водопроводной сети — ${r.object || "объект"}`,
    subject: "Расчёт водопроводной сети",
    creator: "SUVSANOAT",
  };
}

/* ------------------------------------------------------------------
 * ПЕЧАТНАЯ СТРАНИЦА ДЛЯ PDF
 *
 * Отдельного генератора PDF не делается: браузер печатает в PDF сам, и
 * делает это лучше, чем любая библиотека, которую пришлось бы тащить
 * в сборку. Здесь формируется тот же отчёт в виде HTML с вёрсткой под
 * А4 — из тех же блоков, что уходят в Word.
 * ------------------------------------------------------------------ */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildReportHtml(r: ReportInput): string {
  const blocks = buildReportBlocks(r);
  const body = blocks
    .map((bl) => {
      if (bl.t === "h") return `<h${bl.level + 1}>${esc(bl.text)}</h${bl.level + 1}>`;
      if (bl.t === "p") {
        const cls = bl.style === "small" ? "small" : bl.style === "title" ? "title" : bl.style === "subtitle" ? "subtitle" : "";
        return `<p class="${cls}">${esc(bl.text)}</p>`;
      }
      if (bl.t === "ul") return `<ul>${bl.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      if (bl.t === "break") return `<div class="pagebreak"></div>`;
      const head = `<tr>${bl.head.map((h, i) => `<th${bl.widths ? ` style="width:${bl.widths[i]}%"` : ""}>${esc(h)}</th>`).join("")}</tr>`;
      const rows = bl.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
      return `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
    })
    .join("\n");

  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Гидравлический расчёт водопроводной сети</title>
<style>
@page { size: A4; margin: 18mm 15mm; }
body { font: 10.5pt/1.5 "Times New Roman", Georgia, serif; color: #000; margin: 0; }
h2 { font-size: 14pt; margin: 18pt 0 8pt; page-break-after: avoid; }
h3 { font-size: 12pt; margin: 14pt 0 6pt; page-break-after: avoid; }
p { margin: 0 0 8pt; text-align: justify; }
p.title { font-size: 22pt; font-weight: 700; text-align: center; margin: 4pt 0; }
p.subtitle { font-size: 13pt; text-align: center; margin: 2pt 0; }
p.small { font-size: 9pt; color: #333; }
ul { margin: 0 0 10pt 16pt; padding: 0; }
li { margin-bottom: 5pt; text-align: justify; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; font-size: 9pt; page-break-inside: auto; }
th, td { border: 0.5pt solid #444; padding: 3pt 4pt; vertical-align: top; text-align: left; }
th { background: #eee; font-weight: 700; }
tr { page-break-inside: avoid; }
thead { display: table-header-group; }
.pagebreak { page-break-after: always; }
@media screen { body { max-width: 190mm; margin: 20px auto; padding: 0 12px; } }
</style></head><body>
${body}
<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 400); });</script>
</body></html>`;
}
