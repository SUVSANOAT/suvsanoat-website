/* ==================================================================
 * ЛИСТ 3 КОМПЛЕКТА: ТЕХНОЛОГИЧЕСКАЯ СХЕМА (лист А1)
 *
 * Схема без масштаба: блоки сооружений по цепочке слева направо, под
 * каждым блоком — состав основного оборудования из StructureModel.
 * equipment (первые позиции). Линии разных потоков — разными слоями
 * со стрелками направления:
 *   сточная вода (FLOW) → блоки ряда воды;
 *   очищенная вода (WATER) → выпуск;
 *   осадок и избыточный ил (EQUIP) → вниз, в блоки обработки осадка;
 *   возвратный (циркуляционный) ил и фугат (PIPE) → назад, в голову;
 *   воздух (HIDDEN) → от воздуходувной станции к аэрируемым блокам.
 *
 * Концентрации на входе — из задания (DrawingInput), на выходе —
 * нормативные показатели ступеней очистки по п. 6.10 ҚМҚ 2.04.03-19
 * (STAGE_EFFECTS); ничего не додумывается.
 *
 * Лист рисуется в масштабе 1:1 (модельный миллиметр = миллиметр
 * бумаги): для схемы масштаб не применяется.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { DrawingInput, StructureModel } from "../core/types";
import { STAGE_EFFECTS, kmkRef } from "../../norms/kmk-2-04-03-19";
import { rowOf } from "./layout";
import { wrapText, type SheetBuildMeta } from "./siteplan";

type Block = {
  model: StructureModel;
  no: string;
  row: "water" | "sludge" | "building";
  x: number;
  y: number;
  w: number;
  h: number;
};

export function buildSchemeSheet(input: DrawingInput, models: StructureModel[], meta: SheetBuildMeta = {}): Sheet {
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(input.object), "M", meta.index ?? 2),
    title: "Технологическая схема очистных сооружений",
    object: input.object,
    scale: meta.scale ?? 1,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  drawScheme(sheet, input, models);
  sheet.revisionRow();
  return sheet;
}

/* ==================================================================
 * ЧЕРТЁЖ
 * ================================================================== */

function drawScheme(sheet: Sheet, input: DrawingInput, models: StructureModel[]) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;

  const water = models.filter((m) => rowOf(m.kind) === "water");
  const sludge = models.filter((m) => rowOf(m.kind) === "sludge");
  const bld = models.filter((m) => rowOf(m.kind) === "building");
  const noOf = (m: StructureModel, i: number) => m.no ?? String(i + 1).padStart(2, "0");

  sheet.viewTitle(f.x0 + P(2), f.y0 + f.h - P(8), "ТЕХНОЛОГИЧЕСКАЯ СХЕМА", "none");
  d.text(f.x0 + P(2), f.y0 + f.h - P(15), ts, "БЕЗ МАСШТАБА", { align: "left" });

  /* ---------------- геометрия рядов ----------------
   * ряд воды сверху, ряд осадка ниже, здания — внизу; между рядами
   * оставлены коридоры под линии осадка, возвратного ила и воздуха */
  const leftPad = P(58); // колонка исходных данных
  const rightPad = P(54); // колонка показателей очищенной воды
  const areaX = f.x0 + leftPad;
  const areaW = f.w - leftPad - rightPad;
  const WROW_H = P(46), SROW_H = P(38), BROW_H = P(28);

  const wRow = layRow(water, areaX, areaW, WROW_H, f.y0 + f.h - P(110));
  const sRow = layRow(sludge, areaX + P(24), areaW - P(24), SROW_H, f.y0 + f.h - P(250));
  const bRow = layRow(bld, areaX, areaW * 0.45, BROW_H, f.y0 + f.h - P(350));

  const blocks: Block[] = [
    ...wRow.map((b, i) => ({ ...b, row: "water" as const, no: noOf(b.model, i) })),
    ...sRow.map((b, i) => ({ ...b, row: "sludge" as const, no: noOf(b.model, water.length + i) })),
    ...bRow.map((b, i) => ({ ...b, row: "building" as const, no: noOf(b.model, water.length + sludge.length + i) })),
  ];

  /* ---------------- блоки ---------------- */
  for (const b of blocks) drawBlock(sheet, b);

  /* ---------------- линия сточной воды ---------------- */
  const yFlow = (b: Block) => b.y + b.h / 2;
  if (wRow.length) {
    const first = blocks[0];
    d.arrow(f.x0 + P(50), yFlow(first), first.x, yFlow(first), "FLOW", P(2.5));
    for (let i = 0; i + 1 < wRow.length; i++) {
      const a = blocks[i], c = blocks[i + 1];
      d.arrow(a.x + a.w, yFlow(a), c.x, yFlow(c), "FLOW", P(2.5));
    }
    /* выпуск очищенной воды — в блок показателей */
    const last = blocks[wRow.length - 1];
    d.arrow(last.x + last.w, yFlow(last), f.x0 + f.w - P(50), yFlow(last), "WATER", P(2.5));
  }

  /* ---------------- осадок: из ряда воды вниз в ряд осадка ---------------- */
  const bio = blocks.find((b) => b.row === "water" && ["mbr", "aerotank", "ring-bio", "clarifier"].includes(b.model.kind));
  const sludgeBlocks = blocks.filter((b) => b.row === "sludge");
  /* коридор линий осадка — между рядами */
  const yCorr = (sRow.length ? sRow[0].y + SROW_H : f.y0 + f.h - P(212)) + P(20);
  if (bio && sludgeBlocks.length) {
    const s0 = sludgeBlocks[0];
    const xm = bio.x + bio.w + P(3);
    d.line(xm, bio.y, xm, yCorr, "EQUIP");
    d.line(xm, yCorr, s0.x + s0.w / 2, yCorr, "EQUIP");
    d.arrow(s0.x + s0.w / 2, yCorr, s0.x + s0.w / 2, s0.y + s0.h, "EQUIP", P(2.5));
    d.text(xm + P(3), yCorr + ts * 0.6, ts, "ИЗБЫТОЧНЫЙ АКТИВНЫЙ ИЛ", { align: "left", layer: "EQUIP" });
  }
  /* песок и отбросы механической очистки — вывоз, вверх от блока */
  const mech = blocks.find((b) => b.row === "water" && b.model.kind === "mech");
  if (mech) {
    d.arrow(mech.x + mech.w / 2, mech.y + mech.h, mech.x + mech.w / 2, mech.y + mech.h + P(7), "EQUIP", P(2));
    d.text(mech.x + mech.w / 2, mech.y + mech.h + P(8.5), ts * 0.9, "ПЕСОК, ОТБРОСЫ — ВЫВОЗ", { align: "center", layer: "EQUIP" });
  }
  for (let i = 0; i + 1 < sludgeBlocks.length; i++) {
    const a = sludgeBlocks[i], c = sludgeBlocks[i + 1];
    d.arrow(a.x + a.w, a.y + a.h / 2, c.x, c.y + c.h / 2, "EQUIP", P(2.5));
  }
  if (sludgeBlocks.length) {
    const lastS = sludgeBlocks[sludgeBlocks.length - 1];
    d.arrow(lastS.x + lastS.w, lastS.y + lastS.h / 2, lastS.x + lastS.w + P(26), lastS.y + lastS.h / 2, "EQUIP", P(2.5));
    d.text(lastS.x + lastS.w + P(2), lastS.y + lastS.h / 2 + ts * 1.1, ts, "ОБЕЗВОЖЕННЫЙ ОСАДОК", { align: "left", layer: "EQUIP" });
    d.text(lastS.x + lastS.w + P(2), lastS.y + lastS.h / 2 - ts * 0.4, ts * 0.9, `${input.dryKg.toFixed(0)} кг СВ/сут — вывоз`, { align: "left", layer: "EQUIP" });
  }

  /* ---------------- возвратный (циркуляционный) ил: петля над блоком ---------------- */
  if (bio) {
    const yb = bio.y + bio.h + P(16);
    d.line(bio.x + bio.w * 0.85, bio.y + bio.h, bio.x + bio.w * 0.85, yb, "PIPE");
    d.line(bio.x + bio.w * 0.85, yb, bio.x + bio.w * 0.12, yb, "PIPE");
    d.arrow(bio.x + bio.w * 0.12, yb, bio.x + bio.w * 0.12, bio.y + bio.h, "PIPE", P(2));
    d.text(bio.x + bio.w * 0.48, yb + ts * 0.6, ts * 0.9, "ВОЗВРАТНЫЙ (ЦИРКУЛЯЦИОННЫЙ) ИЛ", { align: "center", layer: "PIPE" });
  }

  /* ---------------- фугат/фильтрат в голову сооружений ---------------- */
  const dewat = sludgeBlocks.find((b) => b.model.kind === "dewatering") ?? sludgeBlocks.find((b) => b.model.kind === "thickener");
  if (dewat && wRow.length) {
    const head = blocks[0];
    const yr = yCorr + P(8);
    const xIn = head.x - P(7);
    d.line(dewat.x + dewat.w * 0.5, dewat.y + dewat.h, dewat.x + dewat.w * 0.5, yr, "PIPE");
    d.line(dewat.x + dewat.w * 0.5, yr, xIn, yr, "PIPE");
    d.line(xIn, yr, xIn, yFlow(head) - P(6), "PIPE");
    d.arrow(xIn, yFlow(head) - P(6), head.x, yFlow(head) - P(6), "PIPE", P(2));
    d.text(dewat.x + dewat.w * 0.5 - P(4), yr + ts * 0.6, ts * 0.9, "ФУГАТ / СЛИВНАЯ ВОДА — В ГОЛОВУ СООРУЖЕНИЙ", { align: "right", layer: "PIPE" });
  }

  /* ---------------- воздух от воздуходувной станции ---------------- */
  const blower = blocks.find((b) => b.model.kind === "blower");
  if (blower) {
    const targets = blocks.filter((b) => ["mbr", "aerotank", "ring-bio", "equal", "stabilizer"].includes(b.model.kind));
    /* стояк воздуховода — левее ряда осадка, коридор — под рядом воды */
    const xA = blower.x + P(4);
    const yA = wRow.length ? wRow[0].y - P(26) : blower.y + blower.h + P(10);
    if (targets.length) {
      d.line(xA, blower.y + blower.h, xA, yA, "HIDDEN");
      d.line(xA, yA, Math.max(...targets.map((t) => t.x + P(3))), yA, "HIDDEN");
      for (const t of targets) d.arrow(t.x + P(3), yA, t.x + P(3), t.y, "HIDDEN", P(2));
      d.text(xA + P(2), yA + ts * 0.6, ts * 0.9, `ВОЗДУХ ${input.air.toFixed(0)} м³/ч`, { align: "left", layer: "HIDDEN" });
    }
  }

  /* ---------------- показатели на входе и выходе ---------------- */
  const yMid = wRow.length ? wRow[0].y + WROW_H / 2 : f.y0 + f.h - P(133);
  inletBox(sheet, input, f.x0 + P(2), yMid + P(16));
  outletBox(sheet, models, f.x0 + f.w - P(48), yMid + P(12));

  /* ---------------- легенда линий ---------------- */
  lineLegend(sheet, f.x0 + P(2), f.y0 + P(150));

  /* ---------------- примечания ---------------- */
  sheet.note("Схема технологическая, без масштаба; взаимное расположение блоков не отражает компоновку на площадке (см. генеральный план).");
  sheet.note(
    `Цепочка очистки: ${water.map((m) => m.name).join(" → ")}${sludge.length ? `; обработка осадка: ${sludge.map((m) => m.name).join(" → ")}` : ""}.`,
  );
  sheet.note(
    `Показатели очищенной воды приняты по ${kmkRef("6.10")}: биологическая очистка — взвешенные ${STAGE_EFFECTS.biological.ssOutMgL} мг/л, БПКполн ${STAGE_EFFECTS.biological.bodFullOutMgL[0]}–${STAGE_EFFECTS.biological.bodFullOutMgL[1]} мг/л; глубокая очистка — ${STAGE_EFFECTS.tertiary.ssOutMgL[0]}–${STAGE_EFFECTS.tertiary.ssOutMgL[1]} и ${STAGE_EFFECTS.tertiary.bodFullOutMgL[0]}–${STAGE_EFFECTS.tertiary.bodFullOutMgL[1]} мг/л соответственно.`,
  );
  sheet.note("Под каждым блоком приведены основные позиции оборудования; полный состав — в спецификации оборудования комплекта.");
  sheet.legend([
    { layer: "CONTOUR", text: "блок сооружения" },
    { layer: "PIPE", text: "возвратный ил, фугат" },
    { layer: "EQUIP", text: "осадок и избыточный ил" },
    { layer: "WATER", text: "очищенная вода" },
  ]);
}

/* ---------------- раскладка ряда блоков ---------------- */

function layRow(
  models: StructureModel[],
  x0: number,
  wTotal: number,
  h: number,
  yTop: number,
): { model: StructureModel; x: number; y: number; w: number; h: number }[] {
  if (!models.length) return [];
  const gap = wTotal / models.length / 4;
  const w = (wTotal - gap * (models.length - 1)) / models.length;
  return models.map((m, i) => ({ model: m, x: x0 + i * (w + gap), y: yTop - h, w, h }));
}

/* ---------------- блок сооружения ---------------- */

function drawBlock(sheet: Sheet, b: Block) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  d.rect(b.x, b.y, b.w, b.h, "CONTOUR");
  /* номер позиции — в кружке в левом верхнем углу блока */
  d.circle(b.x + P(4.5), b.y + b.h - P(4.5), P(3.4), "CONTOUR");
  d.text(b.x + P(4.5), b.y + b.h - P(4.5) - ts * 0.4, ts, b.no, { align: "center" });
  /* наименование */
  const maxChars = Math.max(8, Math.floor((b.w - P(11)) / (ts * 0.6)));
  const lines = wrapText(b.model.name.toUpperCase(), maxChars, 3);
  lines.forEach((ln, i) =>
    d.text(b.x + b.w / 2 + P(2), b.y + b.h - P(6) - i * ts * 1.25, ts * 0.95, ln, { align: "center" }),
  );
  /* состав оборудования — под блоком */
  const eq = b.model.equipment.slice(0, 5);
  let y = b.y - ts * 1.4;
  const ec = Math.max(10, Math.floor((b.w - P(8)) / (ts * 0.52)));
  for (const e of eq) {
    const t = `− ${e.name}${e.qty ? `, ${e.qty}` : ""}`;
    for (const ln of wrapText(t, ec, 1)) {
      d.text(b.x + P(6), y, ts * 0.78, ln, { align: "left", layer: "THIN" });
      y -= ts * 1.05;
    }
  }
}

/* ---------------- показатели входа и выхода ---------------- */

function inletBox(sheet: Sheet, input: DrawingInput, x: number, yTop: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const rows = [
    `Q сут = ${input.q} м³/сут`,
    `Q max.час = ${input.qMaxH} м³/ч`,
    `БПК₅ = ${input.bod} мг/л`,
    `ХПК = ${input.cod} мг/л`,
    `Взвешенные = ${input.ss} мг/л`,
    `Жиры = ${input.fats} мг/л`,
    `N общ = ${input.tn} мг/л`,
  ];
  d.rect(x, yTop - P(6) - rows.length * ts * 1.35, P(46), P(6) + rows.length * ts * 1.35, "THIN");
  d.text(x + P(2), yTop - P(4.5), ts, "ВХОД — СТОЧНАЯ ВОДА", { align: "left" });
  rows.forEach((r, i) => d.text(x + P(2), yTop - P(9) - i * ts * 1.35, ts * 0.85, r, { align: "left" }));
}

function outletBox(sheet: Sheet, models: StructureModel[], x: number, yTop: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const deep = models.some((m) => m.kind === "uv" || m.kind === "mbr");
  const ss = deep ? STAGE_EFFECTS.tertiary.ssOutMgL : [STAGE_EFFECTS.biological.ssOutMgL, STAGE_EFFECTS.biological.ssOutMgL];
  const bod = deep ? STAGE_EFFECTS.tertiary.bodFullOutMgL : STAGE_EFFECTS.biological.bodFullOutMgL;
  const rows = [
    `Взвешенные = ${ss[0]}${ss[1] !== ss[0] ? `–${ss[1]}` : ""} мг/л`,
    `БПКполн = ${bod[0]}–${bod[1]} мг/л`,
    `п. 6.10 ҚМҚ 2.04.03-19`,
    deep ? "(глубокая очистка)" : "(биологическая очистка)",
  ];
  d.rect(x, yTop - P(6) - rows.length * ts * 1.35, P(42), P(6) + rows.length * ts * 1.35, "THIN");
  d.text(x + P(2), yTop - P(4.5), ts, "ОЧИЩЕННАЯ ВОДА", { align: "left" });
  rows.forEach((r, i) => d.text(x + P(2), yTop - P(9) - i * ts * 1.35, ts * 0.85, r, { align: "left" }));
}

/* ---------------- легенда линий ---------------- */

function lineLegend(sheet: Sheet, x: number, yTop: number) {
  const d = sheet.d;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const items: { layer: "FLOW" | "WATER" | "EQUIP" | "PIPE" | "HIDDEN"; text: string }[] = [
    { layer: "FLOW", text: "сточная вода" },
    { layer: "WATER", text: "очищенная вода" },
    { layer: "EQUIP", text: "осадок, избыточный ил" },
    { layer: "PIPE", text: "возвратный ил, фугат, техническая вода" },
    { layer: "HIDDEN", text: "воздух от воздуходувной станции" },
  ];
  d.text(x, yTop, ts * 1.1, "ЛИНИИ СХЕМЫ", { align: "left" });
  let y = yTop - ts * 2;
  for (const it of items) {
    d.arrow(x, y + ts * 0.3, x + P(20), y + ts * 0.3, it.layer, P(1.6));
    d.text(x + P(23), y, ts * 0.9, it.text, { align: "left" });
    y -= ts * 1.8;
  }
}
