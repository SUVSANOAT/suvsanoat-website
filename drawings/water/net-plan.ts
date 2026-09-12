/* ==================================================================
 * ПЛАН (СХЕМА) ВОДОПРОВОДНОЙ СЕТИ
 *
 * Узлы с отметками и отборами, участки с диаметрами, расходами и
 * длинами, источник, арматура по узлам. Рисуется по координатам узлов,
 * если они заданы в таблице колонками X и Y.
 *
 * ЕСЛИ КООРДИНАТ НЕТ
 *
 * Самотёчный коллектор без координат можно развернуть в прямую линию —
 * он и есть цепочка. С закольцованной сетью так нельзя: кольцо,
 * вытянутое в линию, перестаёт быть кольцом, и чертёж соврёт о самой
 * сути схемы. Поэтому здесь граф раскладывается: источник в центре,
 * узлы — по ярусам удалённости от него, кольца видны кольцами. Такая
 * раскладка честно названа схемой, а не планом: расстояния на ней
 * не масштабные, длины участков читаются из подписей.
 *
 * ЧЕГО ЗДЕСЬ НЕТ
 *
 * Подложки: кварталов, дорог, существующих сетей. У нас их нет, а
 * рисовать «примерно» нельзя — проектировщик подкладывает съёмку у
 * себя в CAD.
 * ================================================================== */

import { Sheet, objectCode, sheetNo, type SheetMeta } from "../core/sheet";
import type { NetNode } from "../../calculations/water-network";
import type { WaterNetworkResult } from "../../calculations/water-network";
import type { NodeEquipment } from "../../calculations/water-demand";

const SCALE_ROW = [200, 250, 500, 1000, 2000, 2500, 5000, 10000];
const fmt = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

export type NetPlanMeta = {
  object: string;
  no?: string;
  index?: number;
  rev?: string;
  date?: string;
  stage?: string;
  scale?: number;
  sourceId: string;
  /** оборудование по узлам — подписывается у каждого узла */
  equipment?: NodeEquipment[];
};

type Pos = { x: number; y: number };

/* ------------------------------------------------------------------
 * РАСКЛАДКА ГРАФА, КОГДА КООРДИНАТ НЕТ
 *
 * Ярусы по удалённости от источника, узлы яруса — по дуге. Длина луча
 * растёт с ярусом, поэтому кольца не схлопываются в точку, а участки
 * не накладываются друг на друга. Это схема связей, не геометрия.
 * ------------------------------------------------------------------ */
function layout(nodes: NetNode[], links: { from: string; to: string; lengthM: number }[], sourceId: string): Map<string, Pos> {
  const adj = new Map<string, string[]>();
  links.forEach((l) => {
    adj.set(l.from, [...(adj.get(l.from) ?? []), l.to]);
    adj.set(l.to, [...(adj.get(l.to) ?? []), l.from]);
  });

  const level = new Map<string, number>([[sourceId, 0]]);
  const order: string[] = [sourceId];
  const queue = [sourceId];
  while (queue.length) {
    const cur = queue.shift() as string;
    (adj.get(cur) ?? []).forEach((next) => {
      if (level.has(next)) return;
      level.set(next, (level.get(cur) ?? 0) + 1);
      order.push(next);
      queue.push(next);
    });
  }
  /* узлы, до которых из источника не дойти (разорванная сеть), — на
     последний ярус: молча терять их нельзя */
  nodes.forEach((n) => {
    if (!level.has(n.id)) {
      level.set(n.id, Math.max(0, ...level.values()) + 1);
      order.push(n.id);
    }
  });

  const byLevel = new Map<number, string[]>();
  order.forEach((id) => {
    const lv = level.get(id) ?? 0;
    byLevel.set(lv, [...(byLevel.get(lv) ?? []), id]);
  });

  /* средняя длина участка задаёт шаг яруса: схема получается соразмерной
     сети, а не растянутой на весь лист при коротких участках */
  const step = Math.max(50, links.reduce((a, l) => a + l.lengthM, 0) / Math.max(1, links.length));
  const pos = new Map<string, Pos>([[sourceId, { x: 0, y: 0 }]]);
  [...byLevel.entries()]
    .filter(([lv]) => lv > 0)
    .sort((a, b) => a[0] - b[0])
    .forEach(([lv, ids]) => {
      const r = step * lv;
      const span = Math.PI * 0.9;
      ids.forEach((id, i) => {
        const a = ids.length === 1 ? 0 : -span / 2 + (span * i) / (ids.length - 1);
        pos.set(id, { x: r * Math.cos(a), y: r * Math.sin(a) });
      });
    });
  return pos;
}

function pickScaleFor(sizeM: number, paperMm: number): number {
  return SCALE_ROW.find((s) => s >= (sizeM * 1000) / paperMm) ?? SCALE_ROW[SCALE_ROW.length - 1];
}

export function netPlanSheet(nodes: NetNode[], net: WaterNetworkResult, meta: NetPlanMeta): Sheet {
  if (!net.links.length) throw new Error("План сети: нет ни одного участка.");

  const hasXY = nodes.every((n) => n.x !== undefined && n.y !== undefined);
  const pos = hasXY
    ? new Map(nodes.map((n) => [n.id, { x: n.x as number, y: n.y as number }]))
    : layout(nodes, net.links, meta.sourceId);

  const xs = [...pos.values()].map((p) => p.x);
  const ys = [...pos.values()].map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  /* У настоящего плана масштаб обязан быть стандартным: по нему меряют.
     У схемы масштаба нет вовсе — там важно, чтобы граф занял лист, и
     раскладка просто растягивается под поле (коэффициент fit). */
  const scale = meta.scale ?? (hasXY ? pickScaleFor(Math.max(w / 0.88, h / 0.5, 30), 520) : 1000);

  const sm: SheetMeta = {
    no: meta.no ?? sheetNo(objectCode(meta.object), "M", meta.index ?? 1),
    title: hasXY ? "План водопроводной сети" : "Схема водопроводной сети",
    object: meta.object,
    scale,
    rev: meta.rev,
    date: meta.date,
    stage: meta.stage,
  };
  const sheet = new Sheet(sm);
  const fld = sheet.field;
  const fit = hasXY
    ? 1
    : Math.min((fld.w * 0.84) / Math.max(w * 1000, 1), (fld.h * 0.76) / Math.max(h * 1000, 1));
  draw(sheet, nodes, net, pos, { minX: Math.min(...xs), minY: Math.min(...ys), w, h }, hasXY, meta, fit);
  sheet.revisionRow();
  return sheet;
}

function draw(
  sheet: Sheet,
  nodes: NetNode[],
  net: WaterNetworkResult,
  pos: Map<string, Pos>,
  box: { minX: number; minY: number; w: number; h: number },
  hasXY: boolean,
  meta: NetPlanMeta,
  fit: number,
) {
  const d = sheet.d;
  const f = sheet.field;
  const P = (v: number) => sheet.p(v);
  const ts = sheet.ts;

  const ox = f.x0 + (f.w - box.w * 1000 * fit) / 2 - box.minX * 1000 * fit;
  const oy = f.y0 + (f.h - box.h * 1000 * fit) / 2 - box.minY * 1000 * fit + P(6);
  const X = (m: number) => ox + m * 1000 * fit;
  const Y = (m: number) => oy + m * 1000 * fit;

  sheet.viewTitle(f.x0, f.y0 + f.h - P(4), hasXY ? "ПЛАН СЕТИ" : "СХЕМА СЕТИ", hasXY ? sheet.s : "none");

  /* --- участки --- */
  net.links.forEach((l) => {
    const a = pos.get(l.from);
    const b = pos.get(l.to);
    if (!a || !b) return;
    const x1 = X(a.x);
    const y1 = Y(a.y);
    const x2 = X(b.x);
    const y2 = Y(b.y);
    d.line(x1, y1, x2, y2, "PIPE");

    /* стрелка ставится по знаку расхода: в кольцевой сети направление
       течения — результат увязки, а не порядок букв в таблице */
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const s = l.qLps >= 0 ? 1 : -1;
    const ux = ((x2 - x1) / len) * s;
    const uy = ((y2 - y1) / len) * s;
    d.arrow(mx - ux * P(4), my - uy * P(4), mx + ux * P(4), my + uy * P(4), "FLOW", P(2));

    const rot = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const rotFixed = rot > 90 || rot < -90 ? rot + 180 : rot;
    const nx = -uy;
    const ny = ux;
    d.text(
      mx + nx * P(3.5),
      my + ny * P(3.5),
      ts * 0.95,
      `DN${l.dnMm}${l.dnAuto ? "*" : ""}  Q=${fmt(Math.abs(l.qLps))} л/с  L=${fmt(l.lengthM, 1)} м`,
      { align: "center", layer: "TEXT", rot: rotFixed },
    );
    d.text(mx + nx * P(7), my + ny * P(7), ts * 0.8, `v=${fmt(l.velocity)} м/с  h=${fmt(l.headlossM)} м${l.bridge ? "  (мост)" : ""}`, {
      align: "center",
      layer: "THIN",
      rot: rotFixed,
    });
  });

  /* --- узлы --- */
  const equipById = new Map((meta.equipment ?? []).map((e) => [e.id, e]));
  const r = P(1.6);
  net.nodes.forEach((n) => {
    const p = pos.get(n.id);
    if (!p) return;
    const x = X(p.x);
    const y = Y(p.y);
    if (n.id === meta.sourceId) {
      /* источник — квадрат: на плане его ищут глазом первым */
      d.rect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2, "EQUIP");
      d.text(x, y + r * 3.4, ts * 1.05, `ИСТОЧНИК ${n.id}`, { align: "center", layer: "EQUIP" });
    } else {
      d.circle(x, y, r, "CONTOUR");
      d.text(x, y + r * 2.2, ts * 1.05, n.id, { align: "center", layer: "TEXT" });
    }
    d.text(x, y - r * 2.4, ts * 0.85, `з.${fmt(n.groundM, 1)}  H=${fmt(n.freeHeadM, 1)} м`, { align: "center", layer: "THIN" });
    if (n.demandLps > 0) {
      d.text(x, y - r * 2.4 - ts * 1.2, ts * 0.8, `q=${fmt(n.demandLps)} л/с`, { align: "center", layer: "THIN" });
    }
    const eq = equipById.get(n.id);
    if (eq && eq.items.length) {
      d.text(x, y - r * 2.4 - ts * 2.4, ts * 0.75, eq.items.join(", "), { align: "center", layer: "EQUIP" });
    }
    if (!n.ok && n.id !== meta.sourceId) {
      d.leader(x, y, x + P(9), y + P(9), `НАПОР ${fmt(n.freeHeadM, 1)} < ${n.requiredM} м`, ts * 0.9, 1);
    }
  });

  d.northArrow(f.x0 + f.w - P(18), f.y0 + f.h - P(26), P(9));
  if (hasXY) d.scaleBar(f.x0, f.y0 + P(10), sheet.s, ts);

  /* --- примечания --- */
  if (!hasXY) {
    sheet.note(
      "Координаты узлов не заданы: это схема связей, а не план. Узлы разложены по удалённости от источника, расстояния на чертеже не масштабные — длины участков читать по подписям.",
    );
  }
  sheet.note(
    `Сеть ${net.kindLabel.toLowerCase()}${net.loops ? `, независимых колец ${net.loops}` : ""}; узлов ${net.nodes.length}, участков ${net.links.length}, суммарный отбор ${fmt(net.totalDemandLps)} л/с.`,
  );
  if (net.kind === "looped") {
    sheet.note(
      `Расходы по участкам найдены увязкой колец за ${net.iterations} ${net.iterations === 1 ? "итерацию" : "итераций"}; стрелки показывают направление течения по результату увязки, а не порядок узлов в таблице.`,
    );
  }
  if (net.links.some((l) => l.dnAuto)) {
    sheet.note("Диаметры со звёздочкой подобраны программой по экономичной скорости и подлежат уточнению проектировщиком.");
  }
  const bridges = net.links.filter((l) => l.bridge);
  if (bridges.length) {
    sheet.note(
      `Участки-мосты (их отказ отрезает часть сети от источника): ${bridges.map((l) => `${l.from}–${l.to}`).join(", ")}. На этих участках резервирование не обеспечено.`,
    );
  }
  const bad = net.nodes.filter((n) => !n.ok && n.id !== meta.sourceId);
  if (bad.length) {
    sheet.note(`Свободный напор ниже требуемого в узлах: ${bad.map((n) => n.id).join(", ")}.`);
  }
  net.warnings.slice(0, 4).forEach((w) => sheet.note(w));
  sheet.note("Подложка (кварталы, дороги, существующие сети) не показана — накладывается проектировщиком в CAD.");

  sheet.legend([
    { layer: "PIPE", text: "проектируемый водопровод" },
    { layer: "CONTOUR", text: "узлы сети (колодцы)" },
    { layer: "EQUIP", text: "источник и арматура узлов" },
  ]);
}
