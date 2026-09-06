/* ==================================================================
 * ПОЯСНИТЕЛЬНАЯ ЗАПИСКА К ГИДРАВЛИЧЕСКОМУ РАСЧЁТУ СЕТИ (.DOCX)
 *
 * Записка пишется не «в дополнение» к ведомости, а как объяснение,
 * почему в ведомости именно эти числа. Поэтому в ней по порядку:
 * исходные данные, откуда взят каждый коэффициент, как считался
 * расход, как подбирались диаметр и уклон, что получилось по
 * отметкам, где расчёт упирается в ограничения — и только потом сама
 * ведомость.
 *
 * Всё, что не является нормой, названо своим именем. Эксперт должен
 * видеть границу между «так требует ҚМҚ 2.04.03-19» и «так принял
 * проектировщик»: спор возможен только о втором, и тогда спорят по
 * существу, а не о том, что в расчёте вообще происходит.
 * ================================================================== */

import { buildDocxFile, type DocxBlock } from "../app/engineering/analysis/pro-result/docx";
import { MATERIALS, type NetworkInput, type NetworkResult } from "./network";
import type { PumpMainResult } from "./pump-main";

export type NetworkNoteOptions = {
  /** объект в шапке записки */
  object?: string;
  /** ветвь или участок сети */
  branch?: string;
  /** расчёт напорного участка, если он выполнялся */
  pump?: PumpMainResult | null;
  /** пояснение к напорному участку: подъём и длина */
  pumpContext?: { geoLiftM: number; lengthM: number; lines: number };
};

const f = (v: number, d = 2) => v.toFixed(d).replace(".", ",");
const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

function elevWord(src: NetworkInput["elevSource"]): string {
  if (src === "survey") return "топографическая съёмка";
  if (src === "google") return "рельеф Google Earth (предварительно)";
  return "приняты условно";
}

export function buildNetworkNoteBlocks(
  input: NetworkInput,
  res: NetworkResult,
  opts: NetworkNoteOptions = {},
): DocxBlock[] {
  const b: DocxBlock[] = [];
  const object = opts.object || "Канализационная сеть";
  const totalLen = res.segments.reduce((s, x) => s + x.lengthM, 0);
  const dnUsed = [...new Set(res.segments.map((s) => s.dnMm))].sort((x, y) => x - y);

  /* ---------------- титул ---------------- */
  b.push({ t: "p", text: "SUVSANOAT", style: "subtitle" });
  b.push({ t: "p", text: "Пояснительная записка", style: "title" });
  b.push({ t: "p", text: "к гидравлическому расчёту самотёчной канализационной сети", style: "subtitle" });
  b.push({ t: "p", text: object, style: "subtitle" });
  if (opts.branch) b.push({ t: "p", text: opts.branch, style: "small" });
  b.push({ t: "p", text: `Дата расчёта: ${today()}`, style: "small" });
  b.push({
    t: "p",
    text:
      "Расчёт предварительный. Он выполнен по данным, перечисленным в разделе 1, и подлежит проверке инженером " +
      "перед выпуском рабочей документации.",
    style: "small",
  });
  b.push({ t: "break" });

  /* ---------------- 1. исходные данные ---------------- */
  b.push({ t: "h", level: 1, text: "1. Исходные данные" });
  b.push({
    t: "table",
    head: ["Показатель", "Значение"],
    widths: [45, 55],
    rows: [
      ["Норматив", "ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения»"],
      ["Число колодцев", String(input.nodes.length)],
      ["Число расчётных участков", String(res.segments.length)],
      ["Общая длина сети", `${f(totalLen, 1)} м`],
      ["Конечная точка", input.outfallId],
      ["Источник отметок земли", elevWord(input.elevSource)],
      ["Материал труб", MATERIALS[input.material ?? "concrete"].label],
      ["Расчётный расход в конечной точке", `${f(res.totalCalcLps)} л/с (${f(res.totalM3Day, 1)} м³/сут)`],
      ["Наибольшая глубина заложения", `${f(res.maxDepthM)} м${res.maxDepthAt ? `, колодец ${res.maxDepthAt}` : ""}`],
    ],
  });

  if (input.elevSource !== "survey") {
    b.push({
      t: "p",
      text:
        "Отметки земли приняты не по топографической съёмке. Уклон самотёчного коллектора составляет единицы " +
        "миллиметров на метр, поэтому погрешность отметок в полметра сопоставима с расчётным перепадом участка. " +
        "Настоящий расчёт пригоден для трассировки и оценки, но не для выпуска рабочих чертежей.",
      style: "small",
    });
  }

  /* ---------------- 2. как считался расход ---------------- */
  b.push({ t: "h", level: 1, text: "2. Расчётные расходы" });
  b.push({
    t: "p",
    text:
      "Расход определён отдельно для каждого участка по накопленному числу жителей и сосредоточенным сбросам " +
      "вышележащих узлов. Коэффициент общей неравномерности K gen.max принят по табл. 2 (п. 2.7) для среднего " +
      "расхода этого участка, а не один на всю сеть: вниз по трассе расход растёт, а коэффициент падает, и " +
      "применение единого коэффициента завышает диаметры в низовье и занижает их в верховье.",
  });
  b.push({
    t: "table",
    head: ["Участок", "Жители, чел.", "Q ср, л/с", "K gen.max", "Q расч, л/с"],
    widths: [28, 18, 18, 18, 18],
    rows: res.segments.map((s) => [
      `${s.from} — ${s.to}`,
      String(s.peopleCum),
      f(s.qAvgLps),
      f(s.kMax),
      f(s.qCalcLps),
    ]),
  });

  /* ---------------- 3. подбор труб ---------------- */
  b.push({ t: "h", level: 1, text: "3. Подбор диаметров и уклонов" });
  b.push({
    t: "p",
    text:
      "Диаметр и уклон подобраны так, чтобы при расчётном расходе выполнялись одновременно три условия: " +
      "скорость не ниже наименьшей по табл. 16 (п. 2.34), наполнение не выше меньшего из табл. 16 и предела " +
      "0,7 высоты (п. 2.40), уклон не мельче наименьшего по п. 2.41. Гидравлика — формула Шези с шероховатостью " +
      `n = ${MATERIALS[input.material ?? "concrete"].n} (${MATERIALS[input.material ?? "concrete"].label}).`,
  });
  b.push({
    t: "p",
    text: `Применённые диаметры: ${dnUsed.map((d) => `DN ${d}`).join(", ")}.`,
  });
  b.push({
    t: "table",
    head: ["Участок", "L, м", "DN, мм", "Уклон i", "v, м/с", "H/D"],
    widths: [28, 14, 14, 16, 14, 14],
    rows: res.segments.map((s) => [
      `${s.from} — ${s.to}`,
      f(s.lengthM, 1),
      String(s.dnMm),
      s.slope.toFixed(4).replace(".", ","),
      f(s.velocity),
      f(s.fill),
    ]),
  });

  /* ---------------- 4. отметки и глубины ---------------- */
  b.push({ t: "h", level: 1, text: "4. Отметки лотков и глубины заложения" });
  b.push({
    t: "table",
    head: ["Участок", "Лоток начало, м", "Лоток конец, м", "Глубина начало, м", "Глубина конец, м", "Перепад, м"],
    widths: [24, 16, 16, 16, 16, 12],
    rows: res.segments.map((s) => [
      `${s.from} — ${s.to}`,
      f(s.invertStart),
      f(s.invertEnd),
      f(s.depthStart),
      f(s.depthEnd),
      s.dropM > 0 ? f(s.dropM) : "—",
    ]),
  });

  /* ---------------- 5. напорный участок ---------------- */
  if (opts.pump) {
    const p = opts.pump;
    const c = opts.pumpContext;
    b.push({ t: "h", level: 1, text: "5. Напорный участок от насосной станции" });
    b.push({
      t: "p",
      text:
        "ҚМҚ 2.04.03-19 напорные трубопроводы канализации подробно не нормирует: п. 2.30 отсылает к " +
        "ШНК 2.04.02-97*. Из норматива здесь применены предельные скорости (п. 2.36) и объём приёмного " +
        "резервуара (п. 5.18); экономичная и незаиливающая скорости, шероховатость, доля местных потерь, " +
        "свободный напор и КПД приняты по практике проектирования и перечислены в разделе 6.",
    });
    b.push({
      t: "table",
      head: ["Показатель", "Значение"],
      widths: [50, 50],
      rows: [
        ...(c ? [["Геометрический подъём", `${f(c.geoLiftM)} м`], ["Длина напорной линии", `${f(c.lengthM, 1)} м`], ["Число ниток", String(c.lines)]] : []),
        ["Диаметр", `DN ${p.dnMm}`],
        ["Скорость", `${f(p.velocity)} м/с`],
        ["Потери по длине", `${f(p.frictionM)} м`],
        ["Местные потери", `${f(p.localM)} м`],
        ["Свободный напор", `${f(p.freeM)} м`],
        ["Полный напор насоса", `${f(p.headM)} м`],
        ["Подача насоса", `${f(p.flowM3H)} м³/ч`],
        ["Потребляемая мощность", `${f(p.motorKW)} кВт`],
        ["Объём приёмного резервуара", `${f(p.wetWellM3)} м³ (п. 5.18)`],
      ],
    });
    if (p.options.length > 1) {
      b.push({
        t: "p",
        text:
          "Приемлемые диаметры напорной линии и их последствия. Диаметр на шаг больше дороже при строительстве, " +
          "но снижает напор и мощность на весь срок эксплуатации; окончательный выбор — за проектировщиком по " +
          "ценам на момент закупки.",
        style: "small",
      });
      b.push({
        t: "table",
        head: ["DN, мм", "Скорость, м/с", "Напор, м", "Мощность, кВт"],
        widths: [25, 25, 25, 25],
        rows: p.options.map((o) => [String(o.dnMm), f(o.velocity), f(o.headM), f(o.motorKW)]),
      });
    }
    if (p.warnings.length) b.push({ t: "ul", items: p.warnings });
  }

  /* ---------------- 6. допущения ---------------- */
  b.push({ t: "h", level: 1, text: opts.pump ? "6. Принятые величины и их основание" : "5. Принятые величины и их основание" });
  b.push({ t: "ul", items: res.assumptions });
  if (opts.pump) b.push({ t: "ul", items: opts.pump.assumptions });

  /* ---------------- 7. замечания ---------------- */
  const risky = res.segments.filter((s) => s.warnings.length);
  if (res.warnings.length || risky.length) {
    b.push({ t: "h", level: 1, text: opts.pump ? "7. Замечания по расчёту" : "6. Замечания по расчёту" });
    if (res.warnings.length) b.push({ t: "ul", items: res.warnings });
    if (risky.length) {
      b.push({
        t: "table",
        head: ["Участок", "Замечание"],
        widths: [22, 78],
        rows: risky.map((s) => [`${s.from} — ${s.to}`, s.warnings.join(" ")]),
      });
    }
  }

  return b;
}

export function buildNetworkNoteDocx(
  input: NetworkInput,
  res: NetworkResult,
  opts: NetworkNoteOptions = {},
): Uint8Array {
  return buildDocxFile(buildNetworkNoteBlocks(input, res, opts), {
    title: `Пояснительная записка к гидравлическому расчёту сети — ${opts.object || "объект"}`,
    subject: "ҚМҚ 2.04.03-19",
    creator: "SUVSANOAT",
  });
}
