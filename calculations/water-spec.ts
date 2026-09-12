/* ==================================================================
 * ВЕДОМОСТЬ МАТЕРИАЛОВ И ОБОРУДОВАНИЯ ВОДОПРОВОДНОЙ СЕТИ
 *
 * Ведомость собирается не из текста, а из графа сети: сколько
 * участков сходится в узле — столько задвижек, где узел выше
 * соседей — там вантуз, где ниже — выпуск. Поэтому она не может
 * разойтись с расчётом: изменился диаметр участка — изменилась и
 * строка в ведомости.
 *
 * ДИАМЕТРЫ АРМАТУРЫ
 *
 * Задвижка ставится на участок и имеет его диаметр. Вантуз и выпуск —
 * меньше трубы: вантуз подбирается по расходу воздуха при опорожнении
 * (тот же способ, что в расчёте водовода), выпуск — по времени
 * опорожнения участка. Оба диаметра округляются до ближайшего
 * стандартного вверх.
 *
 * ЧЕГО ЗДЕСЬ НЕТ
 *
 * Цен. Ведомость даёт количества; цены подставляет тот, кто знает
 * их на день закупки. Длины труб — по осям участков, без учёта
 * фактической трассировки в плане: монтажный запас задаётся отдельно
 * и по умолчанию равен 2 %.
 * ================================================================== */

import type { Formula } from "./water-demand";
import { DEMAND } from "./water-demand";
import type { NetLink, NetNode, WaterNetworkResult } from "./water-network";

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const SPEC = {
  installReservePct: {
    value: 2,
    note: "монтажный запас 2 % к длине труб — практика: длины считаются по осям узлов, фактическая трасса в плане длиннее",
  },
  airValveDropBar: {
    value: 0.14,
    note: "перепад на вантузе при впуске воздуха 0,14 бар — общепринятая точка подбора по графикам изготовителей",
  },
  drainVelocity: {
    value: 1.0,
    note: "скорость опорожнения трубопровода 1,0 м/с — практика; по ней считается расход воздуха через вантуз",
  },
  drainTimeMin: {
    value: 120,
    note: "время опорожнения участка не более 2 ч — практика; по нему подбирается диаметр выпуска",
  },
  wellPerNode: {
    value: 1,
    note: "колодец в каждом узле сети и у каждого промежуточного гидранта — практика",
  },
} as const;

const VALVE_DN = [50, 80, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800] as const;
const up = (d: number) => VALVE_DN.find((x) => x >= d) ?? VALVE_DN[VALVE_DN.length - 1];

export type SpecRow = {
  no: string;
  group: string;
  name: string;
  type: string;
  unit: string;
  qty: number;
  note: string;
};

export type SpecResult = {
  rows: SpecRow[];
  formulas: Formula[];
  totalPipeM: number;
};

const r1 = (x: number) => Number(x.toFixed(1));

/** Диаметр вантуза по расходу воздуха при опорожнении, мм. */
export function airValveDn(pipeDnMm: number): number {
  const a = (Math.PI * (pipeDnMm / 1000) ** 2) / 4;
  const qAir = a * SPEC.drainVelocity.value;
  const vAir = Math.sqrt((2 * SPEC.airValveDropBar.value * 1e5) / 1.2);
  const area = qAir / (0.6 * vAir);
  return up(Math.sqrt((4 * area) / Math.PI) * 1000);
}

/** Диаметр выпуска по времени опорожнения участка, мм. */
export function drainDn(pipeDnMm: number, lengthM: number, headM: number): number {
  const volume = ((Math.PI * (pipeDnMm / 1000) ** 2) / 4) * lengthM;
  const t = SPEC.drainTimeMin.value * 60;
  /* средний напор при опорожнении — половина располагаемого */
  const v = Math.sqrt(2 * 9.81 * Math.max(1, headM / 2)) * 0.6;
  const area = volume / (t * v);
  return up(Math.max(100, Math.sqrt((4 * area) / Math.PI) * 1000));
}

export function buildSpecification(
  nodes: NetNode[],
  links: NetLink[],
  net: WaterNetworkResult,
  opts: {
    sourceId: string;
    materialLabel: string;
    withHydrants: boolean;
    installReservePct?: number;
  },
): SpecResult {
  const reserve = opts.installReservePct ?? SPEC.installReservePct.value;
  const dnOf = new Map(net.links.map((l) => [l.id, l.dnMm]));
  const lenOf = new Map(net.links.map((l) => [l.id, l.lengthM]));
  const freeOf = new Map(net.nodes.map((n) => [n.id, n.freeHeadM]));
  const ground = new Map(nodes.map((n) => [n.id, n.groundM]));

  /* смежность: какие участки и какого диаметра сходятся в узле */
  const adj = new Map<string, { id: string; dn: number; len: number; other: string }[]>();
  links.forEach((l) => {
    const id = `${l.from}-${l.to}`;
    const dn = dnOf.get(id) ?? l.dnMm ?? 100;
    const len = lenOf.get(id) ?? l.lengthM;
    adj.set(l.from, [...(adj.get(l.from) ?? []), { id, dn, len, other: l.to }]);
    adj.set(l.to, [...(adj.get(l.to) ?? []), { id, dn, len, other: l.from }]);
  });

  /* ---------------- трубы по диаметрам ---------------- */
  const pipeByDn = new Map<number, number>();
  net.links.forEach((l) => pipeByDn.set(l.dnMm, (pipeByDn.get(l.dnMm) ?? 0) + l.lengthM));
  const totalPipe = [...pipeByDn.values()].reduce((a, x) => a + x, 0);

  /* ---------------- арматура по узлам ---------------- */
  const gateByDn = new Map<number, number>();
  const airByDn = new Map<number, number>();
  const drainByDn = new Map<number, number>();
  let checkValves = 0;
  let meters = 0;
  let gauges = 0;
  let regulators = 0;
  let hydrantsInNodes = 0;
  let tees = 0;
  let crosses = 0;
  let bends = 0;

  nodes.forEach((n) => {
    const a = adj.get(n.id) ?? [];
    if (!a.length) return;
    const deg = a.length;
    const maxDn = Math.max(...a.map((x) => x.dn));
    const z = ground.get(n.id) ?? 0;

    if (n.id === opts.sourceId) {
      gateByDn.set(maxDn, (gateByDn.get(maxDn) ?? 0) + 1);
      checkValves += 1;
      meters += 1;
      gauges += 1;
    } else if (deg >= 3) {
      /* в узле трёх и более участков задвижка ставится на каждый:
         так любой участок отключается без остановки остальных */
      a.forEach((x) => gateByDn.set(x.dn, (gateByDn.get(x.dn) ?? 0) + 1));
    } else {
      gateByDn.set(maxDn, (gateByDn.get(maxDn) ?? 0) + 1);
    }

    if (deg === 3) tees += 1;
    if (deg >= 4) crosses += 1;
    if (deg === 2 && a[0].dn !== a[1].dn) bends += 1;

    const isSource = n.id === opts.sourceId;
    const higher = !isSource && a.every((x) => (ground.get(x.other) ?? z) < z);
    const lower = !isSource && a.every((x) => (ground.get(x.other) ?? z) > z);
    if (higher) {
      const d = airValveDn(maxDn);
      airByDn.set(d, (airByDn.get(d) ?? 0) + 1);
    }
    if (lower || (deg === 1 && !isSource)) {
      const seg = a[0];
      const d = drainDn(seg.dn, seg.len, Math.max(5, freeOf.get(n.id) ?? 10));
      drainByDn.set(d, (drainByDn.get(d) ?? 0) + 1);
    }
    if ((freeOf.get(n.id) ?? 0) > DEMAND.zoneHeadM.value) regulators += 1;
    if (opts.withHydrants && !isSource && deg >= 2) hydrantsInNodes += 1;
  });

  /* ---------------- гидранты на участках ---------------- */
  let hydrantsOnLinks = 0;
  if (opts.withHydrants) {
    net.links.forEach((l) => {
      hydrantsOnLinks += Math.max(0, Math.ceil(l.lengthM / DEMAND.hydrantSpacingM.value) - 1);
    });
  }
  const hydrants = hydrantsInNodes + hydrantsOnLinks;

  /* ---------------- сборка ведомости ---------------- */
  const rows: SpecRow[] = [];
  let n = 0;
  const add = (group: string, name: string, type: string, unit: string, qty: number, note: string) => {
    if (qty <= 0) return;
    n += 1;
    rows.push({ no: String(n), group, name, type, unit, qty: Number(qty.toFixed(qty < 10 ? 1 : 0)), note });
  };

  [...pipeByDn.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([dn, len]) =>
      add("Трубы", "Труба напорная", `${opts.materialLabel}, DN ${dn}`, "м", len * (1 + reserve / 100), `по осям ${Math.round(len)} м + ${reserve} % монтажный запас`),
    );

  [...gateByDn.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([dn, q]) => add("Запорная арматура", "Задвижка", `DN ${dn}`, "шт.", q, "по одной на каждый участок в узлах трёх и более участков"));

  add("Запорная арматура", "Клапан обратный", `DN ${Math.max(...net.links.map((l) => l.dnMm))}`, "шт.", checkValves, "на выходе источника");

  [...airByDn.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([dn, q]) => add("Защитная арматура", "Вантуз двойного действия", `DN ${dn}`, "шт.", q, "в верхних точках профиля сети"));

  [...drainByDn.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([dn, q]) => add("Защитная арматура", "Выпуск (грязевик) с задвижкой", `DN ${dn}`, "шт.", q, "в низших точках и на концах веток"));

  add("Защитная арматура", "Регулятор давления «после себя»", "по расчёту зоны", "шт.", regulators, "в узлах со свободным напором выше 60 м");

  add("Пожарное оборудование", "Гидрант пожарный подземный", "ГП, с подставкой", "шт.", hydrants, `${hydrantsInNodes} в узлах и ${hydrantsOnLinks} промежуточных, шаг не более ${DEMAND.hydrantSpacingM.value} м`);

  add("Фасонные части", "Тройник", "по диаметрам участков", "шт.", tees, "в узлах трёх участков");
  add("Фасонные части", "Крестовина", "по диаметрам участков", "шт.", crosses, "в узлах четырёх участков");
  add("Фасонные части", "Переход", "по диаметрам участков", "шт.", bends, "в проходных узлах со сменой диаметра");

  const wells = nodes.filter((x) => (adj.get(x.id) ?? []).length > 0).length + hydrantsOnLinks;
  add("Сооружения", "Колодец водопроводный", "сборный железобетонный", "шт.", wells, SPEC.wellPerNode.note);

  add("КИП", "Водомер", `DN ${Math.max(...net.links.map((l) => l.dnMm))}`, "шт.", meters, "учёт подачи на источнике");
  add("КИП", "Манометр", "с трёхходовым краном", "шт.", gauges + regulators, "на источнике и у регуляторов давления");

  const formulas: Formula[] = [
    {
      label: "Длина труб",
      formula: `L = Σ L_участков · (1 + ${reserve} %) = ${Math.round(totalPipe)} · ${(1 + reserve / 100).toFixed(2)}`,
      result: `${r1(totalPipe * (1 + reserve / 100))} м`,
      source: SPEC.installReservePct.note,
    },
    {
      label: "Задвижки",
      formula: "в узле n участков → n задвижек при n ≥ 3, иначе 1",
      result: `${[...gateByDn.values()].reduce((a, x) => a + x, 0)} шт.`,
      source: "практика: любой участок должен отключаться без остановки остальных",
    },
    {
      label: "Диаметр вантуза",
      formula: `A = Q_возд / (0,6 · √(2·Δp/ρ_возд)), Q_возд = A_трубы · ${SPEC.drainVelocity.value} м/с при Δp = ${SPEC.airValveDropBar.value} бар`,
      result: [...airByDn.keys()].length ? `DN ${[...airByDn.keys()].join(", DN ")}` : "вантузы не требуются",
      source: SPEC.airValveDropBar.note,
    },
    {
      label: "Диаметр выпуска",
      formula: `A = W_участка / (t · 0,6·√(2·g·H/2)), t = ${SPEC.drainTimeMin.value} мин`,
      result: [...drainByDn.keys()].length ? `DN ${[...drainByDn.keys()].join(", DN ")}` : "выпуски не требуются",
      source: SPEC.drainTimeMin.note,
    },
    {
      label: "Гидранты",
      formula: `в узлах ${hydrantsInNodes} + на участках Σ(⌈L/${DEMAND.hydrantSpacingM.value}⌉ − 1) = ${hydrantsOnLinks}`,
      result: `${hydrants} шт.`,
      source: DEMAND.hydrantSpacingM.note,
    },
  ];

  return { rows, formulas, totalPipeM: r1(totalPipe * (1 + reserve / 100)) };
}
