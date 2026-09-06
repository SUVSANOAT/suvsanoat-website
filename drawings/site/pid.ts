/* ==================================================================
 * ЛИСТ: СХЕМА АВТОМАТИЗАЦИИ (P&ID)
 *
 * Технологическая цепочка в одну линию, над сооружениями — приборы в
 * кружках с позициями по ГОСТ 21.208, от кружков пунктиром сигналы в
 * щит управления. Под схемой — таблица сигналов, под ней блокировки.
 *
 * ПОЧЕМУ СХЕМА, А НЕ ТОЛЬКО ТАБЛИЦА
 * Таблица отвечает на вопрос «сколько каналов». Схема отвечает на
 * вопрос «что с чем связано»: видно, что кислород меряется в конце
 * аэробной зоны, а управляет он воздуходувкой в другом конце площадки,
 * и между ними идёт кабель, который кто-то должен проложить. На
 * таблице этого кабеля не видно.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { Instrument, PidResult } from "../../calculations/pid";

export type PidSheetMeta = {
  object: string;
  no?: string;
  index?: number;
  rev?: string;
  date?: string;
  stage?: string;
};

/** русские названия ступеней для подписей на схеме */
const STAGE_NAMES: Record<string, string> = {
  screen: "РЕШЁТКА",
  grit: "ПЕСКОЛОВКА",
  avg: "УСРЕДНИТЕЛЬ",
  primary: "ПЕРВИЧНЫЙ ОТСТОЙНИК",
  daf: "ФЛОТАТОР",
  physchem: "РЕАГЕНТНАЯ ОБРАБОТКА",
  neutral: "НЕЙТРАЛИЗАЦИЯ",
  bio: "АЭРОТЕНК",
  mbr: "МЕМБРАННЫЙ БЛОК",
  second: "ВТОРИЧНЫЙ ОТСТОЙНИК",
  post: "ДООЧИСТКА",
  disinfect: "ОБЕЗЗАРАЖИВАНИЕ",
  sludge: "ОБРАБОТКА ОСАДКА",
  pump: "КНС",
};

/** к какой ступени относится прибор — по месту установки */
function stageOf(inst: Instrument): string {
  const p = inst.place.toLowerCase();
  if (p.includes("кнс") || p.includes("приёмн")) return "pump";
  if (p.includes("решёт")) return "screen";
  if (p.includes("усредн")) return "avg";
  if (p.includes("аэротенк") || p.includes("воздух")) return "bio";
  if (p.includes("мембран") || p.includes("пермеат")) return "mbr";
  if (p.includes("фильтр")) return "post";
  if (p.includes("уф") || p.includes("контактн")) return "disinfect";
  if (p.includes("реагент") || p.includes("дозатор") || p.includes("смешен")) return "physchem";
  if (p.includes("уплотнитель") || p.includes("обезвож")) return "sludge";
  if (p.includes("коллектор") && p.includes("подвод")) return "screen";
  if (p.includes("выпуск")) return "disinfect";
  return "panel";
}

export function pidSheet(pid: PidResult, stages: string[], meta: PidSheetMeta): Sheet {
  const chain = stages.filter((s) => STAGE_NAMES[s]);
  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(meta.object), "E", meta.index ?? 1),
    title: "Схема автоматизации",
    object: meta.object,
    /* Схема не имеет масштаба: это не чертёж сооружения, а связи.
       Ставим 1:100 только чтобы рамка и шрифты считались как обычно. */
    scale: 100,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  draw(sheet, pid, chain);
  sheet.revisionRow();
  return sheet;
}

function draw(sheet: Sheet, pid: PidResult, chain: string[]) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;
  const th = sheet.th;

  /* --- полоса сооружений --- */
  const n = Math.max(1, chain.length);
  const gap = P(6);
  const boxW = (f.w - gap * (n - 1)) / n;
  const boxH = P(22);
  const rowY = f.y0 + f.h * 0.42;

  sheet.viewTitle(f.x0, f.y0 + f.h - P(4), "СХЕМА АВТОМАТИЗАЦИИ", "none");
  d.text(f.x0, f.y0 + f.h - P(11), ts, "Позиции приборов — по ГОСТ 21.208. Сигналы: AI, AO — аналоговые; DI, DO — дискретные.", {
    align: "left",
    layer: "THIN",
  });

  const centerOf = new Map<string, number>();
  chain.forEach((s, i) => {
    const x = f.x0 + i * (boxW + gap);
    d.rect(x, rowY, boxW, boxH, "CONTOUR");
    centerOf.set(s, x + boxW / 2);
    /* подпись в две строки, если не влезает */
    const name = STAGE_NAMES[s] ?? s.toUpperCase();
    const words = name.split(" ");
    const lines: string[] = [];
    let cur = "";
    words.forEach((w) => {
      const test = cur ? `${cur} ${w}` : w;
      if (test.length * ts * 0.62 > boxW - P(4) && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    });
    if (cur) lines.push(cur);
    lines.forEach((ln, k) =>
      d.text(x + boxW / 2, rowY + boxH / 2 + ((lines.length - 1) / 2 - k) * ts * 1.4 - ts * 0.4, ts, ln, { align: "center" }),
    );

    /* стрелка потока между сооружениями */
    if (i < chain.length - 1) {
      d.arrow(x + boxW, rowY + boxH / 2, x + boxW + gap, rowY + boxH / 2, "FLOW", P(1.6));
    }
  });

  /* --- щит управления --- */
  const panelH = P(14);
  /* Щит стоит над приборами, но не под самой рамкой: пустая полоса в
     треть листа между ними ничего не сообщает, а лист съедает. */
  const panelY = f.y0 + f.h * 0.66;
  d.rect(f.x0, panelY, f.w, panelH, "CONTOUR");
  d.text(f.x0 + f.w / 2, panelY + panelH / 2 - ts * 0.4, th, "ЩИТ УПРАВЛЕНИЯ (ПЛК, ПАНЕЛЬ ОПЕРАТОРА, СВЯЗЬ С ДИСПЕТЧЕРСКОЙ)", {
    align: "center",
  });

  /* --- приборы --- */
  const r = P(4.2);
  const perStage = new Map<string, Instrument[]>();
  pid.instruments.forEach((i) => {
    const s = stageOf(i);
    const key = centerOf.has(s) ? s : "panel";
    perStage.set(key, [...(perStage.get(key) ?? []), i]);
  });

  perStage.forEach((list, s) => {
    const cx = centerOf.get(s) ?? f.x0 + f.w - P(30);
    const spread = Math.min(boxW * 0.9, P(9) * list.length);
    list.forEach((inst, k) => {
      const x = list.length === 1 ? cx : cx - spread / 2 + (spread / (list.length - 1)) * k;
      const y = rowY + boxH + P(16) + (k % 2) * P(11); // через один — в шахматном порядке
      d.circle(x, y, r, "EQUIP");
      /* позиция в кружке: две строки, как на настоящих схемах */
      const [letters, num] = inst.tag.split("-");
      d.text(x, y + ts * 0.15, ts * 0.9, letters, { align: "center", layer: "EQUIP" });
      d.text(x, y - ts * 1.0, ts * 0.9, num, { align: "center", layer: "EQUIP" });
      /* от прибора к сооружению */
      if (centerOf.has(s)) d.line(x, y - r, x, rowY + boxH, "THIN");
      /* от прибора в щит — пунктиром через слой WATER (штриховая линия) */
      d.line(x, y + r, x, panelY + panelH, "WATER");
      /* тип сигнала подписью у щита */
      d.text(x + P(1.2), panelY + panelH + P(1.5), ts * 0.8, inst.signal, { align: "left", layer: "THIN" });
    });
  });

  /* --- таблица сигналов --- */
  /* Таблица сигналов ставится ПОД полосой сооружений, а не между щитом
     и приборами: там идут сигнальные линии, и таблица легла бы прямо на
     них. Внизу листа место есть — там ей и быть. */
  const rows = pid.instruments.map((i) => [i.tag, i.signal, i.place, i.purpose]);
  const tTop = rowY - P(12);
  const colW = [P(16), P(12), P(52), P(70)];
  const rowH = P(5.2);
  const perCol = Math.ceil(rows.length / 2);

  d.text(f.x0, tTop + P(2), ts, "ПЕРЕЧЕНЬ СИГНАЛОВ", { align: "left" });
  rows.forEach((row, i) => {
    const col = Math.floor(i / perCol);
    const k = i % perCol;
    const x0 = f.x0 + col * (f.w / 2);
    const y = tTop - P(3) - k * rowH;
    let x = x0;
    row.forEach((cell, c) => {
      const w = colW[c] * 0.62;
      d.text(x, y, ts * 0.78, cell.length > 34 ? `${cell.slice(0, 33)}…` : cell, { align: "left", layer: "THIN" });
      x += w;
    });
  });

  /* --- примечания: сводка и блокировки --- */
  sheet.note(
    `Сигналов в щите: ${pid.counts.AI} AI, ${pid.counts.AO} AO, ${pid.counts.DI} DI, ${pid.counts.DO} DO. ${pid.controller}`,
  );
  pid.interlocks.forEach((l) => sheet.note(`Блокировка «${l.name}»: ${l.when} → ${l.action}. Без неё: ${l.ifAbsent}`));
  pid.assumptions.forEach((a) => sheet.note(a));

  sheet.legend([
    { layer: "CONTOUR", text: "сооружения и щит" },
    { layer: "EQUIP", text: "приборы КИПиА" },
    { layer: "WATER", text: "сигнальные линии" },
    { layer: "PIPE", text: "поток сточной воды" },
  ]);
}
