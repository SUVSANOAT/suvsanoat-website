/* ==================================================================
 * ВЕДОМОСТЬ МАТЕРИАЛОВ И ОБОРУДОВАНИЯ НАПОРНОГО ВОДОВОДА
 *
 * То же правило, что и в ведомости сети: ничего не вводится руками.
 * Труба — по принятому диаметру и длине трассы, задвижки — по числу
 * станций и по секционированию, вантузы и выпуски — по тем самым
 * точкам, которые расчёт нашёл на профиле, противоударная арматура —
 * по расчёту каждой ступени. Изменился профиль — изменилась ведомость.
 *
 * СПИСОК ОБЩИЙ
 *
 * Разделения на «наше» и «покупное» здесь нет: ведомость выдаётся
 * проектировщику и заказчику, а кто что поставляет — вопрос другого
 * документа.
 *
 * ЧЕГО ЗДЕСЬ НЕТ
 *
 * Упоров, опор и колодцев на поворотах: план трассы в расчёт не
 * вводится, углы поворота неизвестны, а считать их «по среднему»
 * значит выдать число, которое нечем подтвердить. Эти позиции
 * добавляет проектировщик по плану.
 * ================================================================== */

import type { Formula } from "./water-demand";
import type { SpecResult, SpecRow } from "./water-spec";
import { drainDn } from "./water-spec";
import { WATER_PIPE, type Lining, type WaterMainResult, type WaterPipeKind } from "./water-main";
import { calculateSegment, type SegmentResult } from "./surge-protection";

export const MAIN_SPEC = {
  installReservePct: {
    value: 2,
    note: "монтажный запас 2 % к длине труб — практика: длина считается по профилю, фактическая трасса в плане длиннее",
  },
  sectionSpacingM: {
    value: 2000,
    note: "секционирующая задвижка на трассе не реже чем через 2000 м — практика: длина участка, который приходится опорожнять при аварии",
  },
  pumpsPerStation: {
    working: 1,
    standby: 1,
    note: "на каждой станции один рабочий и один резервный агрегат — практика для водовода одной нитки; при нескольких нитках или ступенчатой подаче состав уточняется подбором насоса",
  },
} as const;

const VALVE_DN = [50, 80, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1200] as const;

/** Условный проход, ближайший к внутреннему диаметру принятой трубы. */
export function nominalDn(innerMm: number): number {
  return VALVE_DN.reduce((best, x) => (Math.abs(x - innerMm) < Math.abs(best - innerMm) ? x : best), VALVE_DN[0]);
}

/** Масса трубы, т: кольцо сечения на длину и плотность материала. */
export function pipeMassTons(outerMm: number, wallMm: number, lengthM: number, kind: WaterPipeKind): number {
  const area = (Math.PI * ((outerMm / 1000) ** 2 - ((outerMm - 2 * wallMm) / 1000) ** 2)) / 4;
  return (area * lengthM * WATER_PIPE[kind].densityKgM3) / 1000;
}

export type MainSpecStage = {
  /** имя станции, с которой начинается ступень */
  name: string;
  to: string;
  elev: number;
  lengthM: number;
  liftM: number;
  seg: SegmentResult;
};

/* ------------------------------------------------------------------
 * ЗАЩИТА ОТ ГИДРОУДАРА ПО СТУПЕНЯМ
 *
 * Раньше это считалось прямо на странице. Но те же ступени нужны
 * ведомости и отчёту, который собирается на сервере: если считать их
 * в двух местах, они разойдутся — ровно та ошибка, из-за которой был
 * забракован разобранный ручной расчёт. Поэтому расстановка ступеней
 * живёт здесь, а страница и сервер её вызывают.
 * ------------------------------------------------------------------ */
export function stageProtection(
  res: WaterMainResult,
  opts: {
    material: WaterPipeKind;
    lining: Lining;
    minSuctionHeadM?: number;
    freeHeadEndM?: number;
    pumpEff?: number;
    motorEff?: number;
  },
): MainSpecStage[] {
  if (!res.nodes.length) return [];
  const last = res.nodes[res.nodes.length - 1];
  return res.stations.map((s, i) => {
    const next = res.stations[i + 1];
    const endM = next ? next.stationM : last.stationM;
    const endGround = next ? next.groundM : last.groundM;
    const lengthM = Math.max(1, endM - s.stationM);
    const liftM = Math.max(0, endGround - s.groundM);
    const seg = calculateSegment({
      qM3H: res.qM3H,
      geoLiftM: liftM,
      pipeLengthM: lengthM,
      material: opts.material,
      lining: opts.lining,
      outerMm: res.outerMm,
      wallMm: res.wallMm,
      startElevM: s.groundM,
      startLabel: `${s.name} (${s.piket})`,
      endLabel: next ? `${next.name} (${next.piket})` : `конец (${last.piket})`,
      freeHeadM: next ? opts.minSuctionHeadM : opts.freeHeadEndM,
      pnBar: res.pnBar,
      pumpEff: opts.pumpEff,
      motorEff: opts.motorEff,
    });
    return {
      name: s.name,
      to: next ? next.name : "конец",
      elev: s.groundM,
      lengthM: Math.round(lengthM),
      liftM: Number(liftM.toFixed(1)),
      seg,
    };
  });
}

export function buildMainSpecification(
  res: WaterMainResult,
  opts: {
    material: WaterPipeKind;
    lining: Lining;
    stages?: MainSpecStage[];
    installReservePct?: number;
    sectionSpacingM?: number;
  },
): SpecResult {
  const reserve = opts.installReservePct ?? MAIN_SPEC.installReservePct.value;
  const spacing = opts.sectionSpacingM ?? MAIN_SPEC.sectionSpacingM.value;
  const stages = opts.stages ?? [];
  const dn = nominalDn(res.innerMm);
  const label = WATER_PIPE[opts.material].label;
  const pipeM = res.lengthM * (1 + reserve / 100);
  const tons = pipeMassTons(res.outerMm, res.wallMm, pipeM, opts.material);
  const stations = res.stations.length;

  const rows: SpecRow[] = [];
  let n = 0;
  const add = (group: string, name: string, type: string, unit: string, qty: number, note: string) => {
    if (qty <= 0) return;
    n += 1;
    rows.push({ no: String(n), group, name, type, unit, qty: Number(qty.toFixed(qty < 10 ? 1 : 0)), note });
  };

  /* ---------------- труба ---------------- */
  add(
    "Трубы",
    "Труба напорная",
    `${label}, ${res.outerMm}×${res.wallMm} мм (DN ${dn})`,
    "м",
    pipeM,
    `по профилю ${Math.round(res.lengthM)} м + ${reserve} % монтажный запас; масса ${tons.toFixed(1)} т`,
  );

  /* ---------------- запорная арматура ---------------- */
  const sectionValves = Math.max(0, Math.ceil(res.lengthM / spacing) - 1);
  add("Запорная арматура", "Задвижка секционирующая", `DN ${dn}, PN ${res.pnBar}`, "шт.", sectionValves, `шаг не более ${spacing} м по трассе`);
  add("Запорная арматура", "Задвижка на станции", `DN ${dn}, PN ${res.pnBar}`, "шт.", stations * 2, "на всасывающем и напорном патрубке каждой станции");
  add("Запорная арматура", "Клапан обратный", `DN ${dn}, PN ${res.pnBar}`, "шт.", stations, "на напорном патрубке каждой станции");

  /* ---------------- насосное оборудование ---------------- */
  const perStation = MAIN_SPEC.pumpsPerStation.working + MAIN_SPEC.pumpsPerStation.standby;
  res.stations.forEach((s) => {
    add(
      "Насосное оборудование",
      `Агрегат насосный, ${s.name}`,
      `Q = ${res.qM3H.toFixed(0)} м³/ч, H = ${s.headM.toFixed(0)} м, N = ${s.motorKW.toFixed(0)} кВт`,
      "шт.",
      perStation,
      `${MAIN_SPEC.pumpsPerStation.working} рабочий + ${MAIN_SPEC.pumpsPerStation.standby} резервный; отметка ${s.groundM.toFixed(1)} м, ${s.piket}`,
    );
  });

  /* ---------------- вантузы и выпуски ---------------- */
  const airByDn = new Map<number, number>();
  res.airValves.forEach((v) => airByDn.set(v.dnMm, (airByDn.get(v.dnMm) ?? 0) + 1));
  [...airByDn.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([d, q]) =>
      add("Защитная арматура", "Вантуз двойного действия", `DN ${d}, PN ${res.pnBar}`, "шт.", q, "в вершинах профиля, за станциями и по шагу на пологих участках"),
    );
  add("Сооружения", "Колодец для вантуза", "сборный железобетонный", "шт.", res.airValves.length, "по одному на каждый вантуз");

  const drainD = drainDn(dn, Math.min(res.lengthM, spacing), Math.max(5, res.stageHeadM / 2));
  add("Защитная арматура", "Выпуск (грязевик) с задвижкой", `DN ${drainD}`, "шт.", res.drains.length, "в низших точках профиля");
  add("Сооружения", "Колодец для выпуска", "сборный железобетонный", "шт.", res.drains.length, "по одному на каждый выпуск");

  /* ---------------- противоударная защита ---------------- */
  if (stages.length) {
    const valveCount = stages.reduce((a, x) => a + x.seg.protection.valveCount, 0);
    const valveDn = Math.max(...stages.map((x) => x.seg.protection.valveDnMm));
    const valvePn = Math.max(...stages.map((x) => x.seg.protection.valvePnBar));
    add(
      "Противоударная защита",
      "Клапан сбросной противоударный",
      `DN ${valveDn}, PN ${valvePn}`,
      "шт.",
      valveCount,
      `по ${stages.map((x) => `${x.name}: ${x.seg.protection.valveCount}`).join(", ")}; время открытия до ${Math.max(...stages.map((x) => x.seg.protection.openTimeS)).toFixed(1)} с`,
    );

    const drainSum = stages.reduce((a, x) => a + (x.seg.protection.drainDnMm > 0 ? 1 : 0), 0);
    add(
      "Противоударная защита",
      "Линия сброса от клапана",
      `DN ${Math.max(...stages.map((x) => x.seg.protection.drainDnMm))}`,
      "компл.",
      drainSum,
      "отвод сбрасываемой воды в приёмную ёмкость",
    );

    const receiver = stages.reduce((a, x) => a + x.seg.protection.receiverM3, 0);
    add(
      "Противоударная защита",
      "Ёмкость приёмная для сброса",
      "железобетонная или стальная",
      "м³",
      receiver,
      `по ступеням: ${stages.map((x) => `${x.name} — ${x.seg.protection.receiverM3.toFixed(1)} м³`).join("; ")}`,
    );

    const withVessel = stages.filter((x) => x.seg.protection.vesselTotalM3 > 0);
    if (withVessel.length) {
      add(
        "Противоударная защита",
        "Гидропневмобак",
        `PN ${Math.max(...withVessel.map((x) => x.seg.protection.valvePnBar))}`,
        "шт.",
        withVessel.length,
        `объёмы: ${withVessel.map((x) => `${x.name} — ${x.seg.protection.vesselTotalM3.toFixed(1)} м³`).join("; ")}; объём предварительный, окончательный — по расчёту переходного процесса`,
      );
    }
  }

  /* ---------------- КИП ---------------- */
  add("КИП", "Манометр с трёхходовым краном", "0–40 бар", "шт.", stations * 2, "до и после каждой станции");
  add("КИП", "Расходомер", `DN ${dn}`, "шт.", stations, "на напорном коллекторе каждой станции");
  add("КИП", "Датчик давления с выводом на АСУ", `0–${Math.ceil(res.maxWorkingBar * 1.25)} бар`, "шт.", stations + res.airValves.length, "на станциях и в характерных точках трассы");

  /* ---------------- формулы ---------------- */
  const formulas: Formula[] = [
    {
      label: "Длина труб",
      formula: `L = L_профиля · (1 + ${reserve} %) = ${Math.round(res.lengthM)} · ${(1 + reserve / 100).toFixed(2)}`,
      result: `${Math.round(pipeM)} м`,
      source: MAIN_SPEC.installReservePct.note,
    },
    {
      label: "Масса трубы",
      formula: `m = π/4 · (D² − d²) · L · ρ = π/4 · (${(res.outerMm / 1000).toFixed(3)}² − ${((res.outerMm - 2 * res.wallMm) / 1000).toFixed(3)}²) · ${Math.round(pipeM)} · ${WATER_PIPE[opts.material].densityKgM3}`,
      result: `${tons.toFixed(1)} т`,
      source: `плотность материала «${label}» ${WATER_PIPE[opts.material].densityKgM3} кг/м³`,
    },
    {
      label: "Секционирующие задвижки",
      formula: `n = ⌈L / ${spacing}⌉ − 1 = ⌈${Math.round(res.lengthM)} / ${spacing}⌉ − 1`,
      result: `${sectionValves} шт.`,
      source: MAIN_SPEC.sectionSpacingM.note,
    },
    {
      label: "Насосные агрегаты",
      formula: `n = ${stations} станц. · (${MAIN_SPEC.pumpsPerStation.working} раб. + ${MAIN_SPEC.pumpsPerStation.standby} рез.)`,
      result: `${stations * perStation} шт.`,
      source: MAIN_SPEC.pumpsPerStation.note,
    },
    {
      label: "Вантузы",
      formula: "по вершинам профиля, за каждой станцией и по шагу на пологих участках",
      result: `${res.airValves.length} шт.`,
      source: "точки определены расчётом линии энергии, а не назначены",
    },
    {
      label: "Выпуски",
      formula: `по низшим точкам профиля, DN по времени опорожнения участка длиной до ${spacing} м`,
      result: `${res.drains.length} шт., DN ${drainD}`,
      source: "практика: опорожнение секции не дольше 2 ч",
    },
  ];

  return { rows, formulas, totalPipeM: Number(pipeM.toFixed(1)) };
}
