/* ==================================================================
 * ОТЧЁТ ПО РАСЧЁТУ НАПОРНОГО ВОДОВОДА: WORD И PDF
 *
 * Устроено так же, как отчёт по сети: один набор блоков — два выхода,
 * формула рядом с каждым числом, отдельный раздел о том, что здесь
 * норма, а что практика.
 *
 * ПОЧЕМУ ФОРМУЛЫ СОБИРАЮТСЯ ЗДЕСЬ, А НЕ В ДВИЖКЕ
 *
 * calculateWaterMain возвращает числа, а не текст: движок не должен
 * знать, в каком виде их покажут. Поэтому подстановка значений в
 * формулы сделана в отчёте — из тех же полей результата, что попадают
 * в таблицы. Разойтись им негде: и то и другое берётся из одного
 * объекта.
 * ================================================================== */

import type { DocxBlock } from "../app/engineering/analysis/pro-result/docx";
import type { Formula } from "./water-demand";
import type { SpecResult } from "./water-spec";
import { WATER_MAIN, WATER_PIPE, type Lining, type WaterMainResult, type WaterPipeKind } from "./water-main";
import type { SegmentResult } from "./surge-protection";
import type { MainSpecStage } from "./main-spec";

export type MainReportInput = {
  object?: string;
  material: WaterPipeKind;
  lining: Lining;
  qM3Day: number;
  hoursPerDay: number;
  lines: number;
  res: WaterMainResult;
  stages?: MainSpecStage[];
  spec?: SpecResult | null;
  tariffPerKWh?: number;
};

const f = (v: number, d = 2) => v.toFixed(d).replace(".", ",");
const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const LINING_LABEL: Record<Lining, string> = {
  none: "без внутреннего покрытия",
  cement: "цементно-песчаное покрытие",
  epoxy: "эпоксидное покрытие",
};

function formulaTable(items: Formula[]): DocxBlock {
  return {
    t: "table",
    head: ["Величина", "Формула", "Результат", "Источник"],
    widths: [20, 38, 18, 24],
    rows: items.map((x) => [x.label, x.formula, x.result, x.source ?? "—"]),
  };
}

/* ------------------------------------------------------------------
 * ФОРМУЛЫ ГИДРАВЛИКИ С ПОДСТАВЛЕННЫМИ ЗНАЧЕНИЯМИ
 * ------------------------------------------------------------------ */
function hydraulicFormulas(r: MainReportInput): Formula[] {
  const res = r.res;
  const d = res.innerMm / 1000;
  const hl = res.headloss;
  const localM = res.totalLossM - hl.iMPerKm * (res.lengthM / 1000);
  return [
    {
      label: "Расчётный расход",
      formula: `Q = Q_сут / (3600 · T · n) = ${Math.round(r.qM3Day)} / (3600 · ${r.hoursPerDay} · ${r.lines})`,
      result: `${f(res.qM3s, 4)} м³/с = ${f(res.qM3H, 1)} м³/ч`,
      source: "T — число часов работы в сутки, n — число ниток; задано в исходных данных",
    },
    {
      label: "Скорость",
      formula: `v = 4Q / (π·d²) = 4 · ${f(res.qM3s, 4)} / (3,1416 · ${f(d, 3)}²)`,
      result: `${f(res.velocity)} м/с`,
      source: WATER_MAIN.economicVelocity.note,
    },
    {
      label: "Число Рейнольдса",
      formula: `Re = v·d / ν = ${f(res.velocity)} · ${f(d, 3)} / 1,31·10⁻⁶`,
      result: `${(hl.reynolds / 1e6).toFixed(2)}·10⁶`,
      source: "ν — кинематическая вязкость воды при 10 °C",
    },
    {
      label: "Гидравлический уклон (Шевелёв)",
      formula: "i = 0,021 / d^0,3 · v²/(2·g·d) — для неновых стальных и чугунных труб при v ≥ 1,2 м/с",
      result: `${f(hl.iShevelevMPerKm)} м/км`,
      source: "Ф. А. Шевелёв, таблицы для гидравлического расчёта водопроводных труб",
    },
    {
      label: "Гидравлический уклон (Дарси–Альтшуль)",
      formula: `i = λ · v²/(2·g·d), λ = 0,11·(Δ/d + 68/Re)^0,25 = ${f(hl.lambda, 4)}`,
      result: `${f(hl.iAltshulMPerKm)} м/км`,
      source: `эквивалентная шероховатость ${WATER_PIPE[r.material].roughnessMm[r.lining]} мм (${LINING_LABEL[r.lining]})`,
    },
    {
      label: "Гидравлический уклон (Hazen–Williams)",
      formula: `i = 10,67 · Q^1,852 / (C^1,852 · d^4,87), C = ${WATER_PIPE[r.material].hazenC[r.lining]}`,
      result: `${f(hl.iHazenMPerKm)} м/км`,
      source: "применяется в зарубежной практике; приведён для сверки",
    },
    {
      label: "Потери по длине",
      formula: `h_дл = i · L = ${f(hl.iMPerKm)} · ${f(res.lengthM / 1000, 3)} км (принят метод: ${hl.method})`,
      result: `${f(hl.iMPerKm * (res.lengthM / 1000))} м`,
      source: "принимается наибольший из трёх методов, если расхождение в пределах нормы",
    },
    {
      label: "Местные потери",
      formula: `h_м = ${WATER_MAIN.localShare.value * 100} % от h_дл + обвязка станций ${WATER_MAIN.stationLocalM.value} м × ${res.stations.length}`,
      result: `${f(Math.max(0, localM))} м`,
      source: WATER_MAIN.localShare.note,
    },
    {
      label: "Требуемый напор",
      formula: `H = H_геод + Σh + H_св = ${f(res.geoLiftM, 1)} + ${f(res.totalLossM, 1)} + ${f(WATER_MAIN.freeHeadEnd.value, 1)}`,
      result: `${f(res.totalHeadM, 1)} м`,
      source: WATER_MAIN.freeHeadEnd.note,
    },
    {
      label: "Число ступеней",
      formula: `n = ⌈H / H_ступ⌉ = ⌈${f(res.totalHeadM, 1)} / ${f(res.stageHeadM, 1)}⌉`,
      result: `${res.stations.length} ${res.stations.length === 1 ? "станция" : "станций"}`,
      source: WATER_MAIN.maxStageHead.note,
    },
    {
      label: "Мощность",
      formula: `N = ρ·g·Q·H / (1000·η_нас·η_дв) = 1000·9,81·${f(res.qM3s, 4)}·${f(res.totalHeadM, 1)} / (1000·${WATER_MAIN.efficiency.pump}·${WATER_MAIN.efficiency.motor})`,
      result: `${f(res.power.motorKW, 1)} кВт`,
      source: WATER_MAIN.efficiency.note,
    },
    {
      label: "Удельный расход энергии",
      formula: `e = N · T_год / W_год = ${f(res.power.yearKWh / 1000, 0)} тыс. кВт·ч / ${f((r.qM3Day * 365) / 1000, 0)} тыс. м³`,
      result: `${f(res.power.kWhPerM3, 3)} кВт·ч/м³`,
      source: "показатель, по которому сравниваются варианты трассы и диаметра",
    },
  ];
}

function strengthFormulas(r: MainReportInput): Formula[] {
  const res = r.res;
  const y = WATER_PIPE[r.material].yieldMPa;
  const out: Formula[] = [
    {
      label: "Рабочее давление",
      formula: `p_раб = H_ступ / 10,197 = ${f(res.stageHeadM, 1)} / 10,197`,
      result: `${f(res.maxWorkingBar)} бар`,
      source: "наибольшее давление в трассе при работе насосов",
    },
    {
      label: "Класс давления трубы",
      formula: `PN ≥ p_раб · ${WATER_MAIN.hammerReserve.value}`,
      result: `PN ${res.pnBar}`,
      source: WATER_MAIN.hammerReserve.note,
    },
  ];
  if (y > 0) {
    out.push(
      {
        label: "Толщина стенки по давлению",
        formula: `δ = p·D / (2·σ_доп·φ) + c, σ_доп = ${y}/${WATER_MAIN.safetyYield.value} МПа, φ = ${WATER_MAIN.weldFactor.value}, c = ${WATER_MAIN.corrosionAllowanceMm.value} мм`,
        result: `${f(res.wall.byPressureMm)} мм`,
        source: WATER_MAIN.safetyYield.note,
      },
      {
        label: "Кольцевое напряжение",
        formula: `σ = p·D / (2·δ) при δ = ${res.wallMm} мм`,
        result: `${f(res.wall.hoopStressMPa, 1)} МПа при допустимых ${f(y / WATER_MAIN.safetyYield.value, 1)} МПа`,
        source: `предел текучести материала «${WATER_PIPE[r.material].label}» ${y} МПа`,
      },
    );
  }
  out.push({
    label: "Устойчивость к смятию",
    formula: `p_кр = 2·E / (1−μ²) · (δ/D)³ с запасом ${WATER_MAIN.vacuumSafety.value}`,
    result: `${f(res.wall.bucklingBar)} бар — вакуум ${res.wall.vacuumOk ? "труба выдерживает" : "ТРУБА НЕ ВЫДЕРЖИВАЕТ"}`,
    source: WATER_MAIN.vacuumSafety.note,
  });
  return out;
}

/* ------------------------------------------------------------------
 * БЛОКИ ОТЧЁТА
 * ------------------------------------------------------------------ */
export function buildMainReportBlocks(r: MainReportInput): DocxBlock[] {
  const b: DocxBlock[] = [];
  const res = r.res;
  const object = r.object || "Напорный водовод";
  const stages = r.stages ?? [];

  /* ---------------- титул ---------------- */
  b.push({ t: "p", text: "SUVSANOAT", style: "subtitle" });
  b.push({ t: "p", text: "Гидравлический расчёт", style: "title" });
  b.push({ t: "p", text: "напорного водовода и каскада насосных станций", style: "subtitle" });
  b.push({ t: "p", text: object, style: "subtitle" });
  b.push({ t: "p", text: `Дата расчёта: ${today()}`, style: "small" });
  b.push({
    t: "p",
    text:
      "Расчёт предварительный. Гидроудар посчитан по Жуковскому — как верхняя оценка — и проверен на разрыв " +
      "сплошности по профилю; подбор противоударной арматуры, колпаков и времён закрытия выполняется численным " +
      "моделированием переходного процесса. Перечень данных для такого расчёта приведён в конце отчёта.",
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
      ["Подача", `${Math.round(r.qM3Day)} м³/сут при ${r.hoursPerDay} ч работы, ниток ${r.lines}`],
      ["Расчётный расход", `${f(res.qM3H, 1)} м³/ч = ${f(res.qM3s * 1000, 1)} л/с`],
      ["Длина трассы по профилю", `${Math.round(res.lengthM)} м`],
      ["Геодезический подъём", `${f(res.geoLiftM, 1)} м`],
      ["Точек профиля", `${res.nodes.length}`],
      ["Труба", `${WATER_PIPE[r.material].label}, ${res.outerMm}×${res.wallMm} мм, внутренний ${f(res.innerMm, 1)} мм`],
      ["Внутреннее покрытие", LINING_LABEL[r.lining]],
      ["Скорость", `${f(res.velocity)} м/с`],
      ["Класс давления", `PN ${res.pnBar}`],
      ["Насосных станций", `${res.stations.length}`],
      ["Установленная мощность", `${f(res.power.motorKW, 1)} кВт`],
    ],
  });

  /* ---------------- 2. гидравлика ---------------- */
  b.push({ t: "h", level: 1, text: "2. Гидравлический расчёт" });
  b.push({
    t: "p",
    text:
      "Потери считаются тремя методами сразу и показываются рядом. Это не избыточность: расхождение методов на " +
      "длинной трассе даёт десятки метров напора и сотни киловатт установленной мощности, и проверяющий должен " +
      "видеть, какой метод принят и насколько остальные от него отличаются.",
  });
  b.push(formulaTable(hydraulicFormulas(r)));

  /* ---------------- 3. профиль и линия энергии ---------------- */
  b.push({ t: "h", level: 1, text: "3. Профиль, линия энергии и давления" });
  b.push({
    t: "p",
    text:
      "Таблица — единственный источник чисел в этом отчёте: из неё взяты и расстановка станций, и точки вантузов " +
      "и выпусков, и давления для подбора стенки. Пьезометрическая отметка в каждой точке получена вычитанием " +
      "потерь от начала ступени; давление — разностью пьезометрической отметки и отметки оси трубы.",
  });
  b.push({
    t: "table",
    head: ["Пикет", "Отметка земли, м", "Ось трубы, м", "Пьезометр, м", "Напор, м", "Давление, бар", "Ступень", "Примечание"],
    widths: [11, 14, 12, 13, 11, 13, 9, 17],
    rows: res.nodes.map((n) => [
      n.piket,
      f(n.groundM, 1),
      f(n.axisM, 1),
      f(n.hglM, 1),
      f(n.pressureM, 1),
      f(n.pressureBar),
      String(n.stage),
      [n.station ?? "", n.peak ? "вершина" : "", n.valley ? "низшая точка" : ""].filter(Boolean).join(", "),
    ]),
  });

  /* ---------------- 4. станции ---------------- */
  b.push({ t: "h", level: 1, text: "4. Каскад насосных станций" });
  b.push({
    t: "p",
    text:
      `Число станций определяется не гидравликой, а предельным напором одной ступени: одним подъёмом воду можно ` +
      `поднять на любую высоту, вопрос в том, какое давление выдержат труба и арматура. Принят предел ` +
      `${f(res.stageHeadM, 0)} м на ступень; место каждой станции выбрано так, чтобы подпор на входе был не ниже ` +
      `${WATER_MAIN.minSuctionHead.value} м, а вдоль трассы напор нигде не опускался ниже ${WATER_MAIN.minLineHead.value} м.`,
  });
  b.push({
    t: "table",
    head: ["Станция", "Пикет", "Отметка, м", "Подпор, м", "Напор, м", "Давление на выходе, бар", "N вал, кВт", "N дв, кВт", "NPSH расп., м"],
    widths: [12, 10, 11, 10, 11, 14, 11, 11, 10],
    rows: res.stations.map((s) => [
      s.name,
      s.piket,
      f(s.groundM, 1),
      f(s.suctionHeadM, 1),
      f(s.headM, 1),
      f(s.outletBar),
      f(s.shaftKW, 1),
      f(s.motorKW, 1),
      f(s.npshAvailableM, 1),
    ]),
  });
  b.push({
    t: "p",
    text:
      `Годовое потребление энергии ${f(res.power.yearKWh / 1000, 0)} тыс. кВт·ч, удельно ` +
      `${f(res.power.kWhPerM3, 3)} кВт·ч/м³` +
      (res.power.yearCost !== undefined ? `, при заданном тарифе — ${Math.round(res.power.yearCost).toLocaleString("ru-RU")} в год.` : ". Тариф не задан, стоимость не считалась."),
  });

  /* ---------------- 5. прочность ---------------- */
  b.push({ t: "h", level: 1, text: "5. Труба: давление и толщина стенки" });
  b.push(formulaTable(strengthFormulas(r)));
  b.push({
    t: "p",
    text:
      `Принята стенка ${res.wallMm} мм: по внутреннему давлению требуется ${f(res.wall.byPressureMm)} мм, по ` +
      `испытательному — ${f(res.wall.byTestMm)} мм, принято ближайшее большее из сортамента ` +
      `(${f(res.wall.acceptedMm)} мм расчётно).`,
  });

  /* ---------------- 6. гидроудар ---------------- */
  b.push({ t: "h", level: 1, text: "6. Гидравлический удар" });
  b.push({
    t: "p",
    text:
      "Удар посчитан по Жуковскому для каждой ступени отдельно: скорость волны зависит от упругости трубы, фаза — " +
      "от длины ступени. Отдельно проверено, где при остановке насосов пьезометрическая линия опускается ниже оси " +
      "трубы — там вода разрывается, и обратный удар при смыкании столба опаснее прямого.",
  });
  b.push({
    t: "table",
    head: ["Ступень", "L, м", "c, м/с", "Фаза 2L/c, с", "Δh Жуковского, м", "Пик, бар", "Разрыв", "Худшая точка"],
    widths: [16, 9, 10, 12, 15, 10, 12, 16],
    rows: res.hammer.map((h) => [
      `${h.from} — ${h.to}`,
      String(Math.round(h.lengthM)),
      f(h.waveSpeedMs, 0),
      f(h.phaseS, 1),
      f(h.joukowskyM, 1),
      f(h.peakBar),
      h.separationAt.length ? `да, ${h.separationSharePct} % трассы` : "нет",
      `${h.worstAt}, запас ${f(h.minMarginM, 1)} м`,
    ]),
  });

  if (stages.length) {
    b.push({ t: "h", level: 2, text: "6.1. Противоударная защита по ступеням" });
    b.push({
      t: "p",
      text:
        "Клапан подобран по объёму воды, который надо сбросить за одно отключение, и по требуемой пропускной " +
        "способности Kv. Объём определяется временем торможения столба, а не временем закрытия задвижки — это " +
        "разные величины, и путать их нельзя: по времени закрытия объём получается заниженным в несколько раз.",
    });
    b.push({
      t: "table",
      head: ["Ступень", "Удар", "Пик, бар", "Сбросной клапан", "Kv, м³/ч", "Сброс, м³", "Линия сброса", "Бак, м³", "Вантузы"],
      widths: [14, 10, 9, 14, 9, 9, 11, 8, 16],
      rows: stages.map((x) => [
        `${x.name} — ${x.to}`,
        x.seg.direct ? "прямой" : "непрямой",
        f(x.seg.peakBar),
        `${x.seg.protection.valveCount}×DN ${x.seg.protection.valveDnMm} PN ${x.seg.protection.valvePnBar}`,
        f(x.seg.protection.requiredKv, 0),
        f(x.seg.protection.dischargeVolumeM3),
        `DN ${x.seg.protection.drainDnMm}`,
        f(x.seg.protection.vesselTotalM3, 1),
        `${x.seg.protection.airValveCount}×DN ${x.seg.protection.airValveDnMm}`,
      ]),
    });
    const gov = stages[0]?.seg.protection.volumeGovernedBy;
    if (gov) b.push({ t: "p", text: `Объём сброса определён по: ${gov}.`, style: "small" });
  }

  /* ---------------- 7. вантузы и выпуски ---------------- */
  b.push({ t: "h", level: 1, text: "7. Вантузы и выпуски" });
  b.push({
    t: "table",
    head: ["Пикет", "Отметка, м", "Назначение", "DN, мм"],
    widths: [18, 22, 40, 20],
    rows: res.airValves.map((v) => [v.piket, f(v.groundM, 1), `вантуз (${v.kind})`, String(v.dnMm)]),
  });
  if (res.drains.length) {
    b.push({
      t: "table",
      head: ["Пикет", "Отметка, м", "Назначение"],
      widths: [20, 25, 55],
      rows: res.drains.map((d) => [d.piket, f(d.groundM, 1), "выпуск в низшей точке профиля"]),
    });
  }

  /* ---------------- 8. сравнение диаметров ---------------- */
  let sec = 8;
  if (res.options.length > 1) {
    b.push({ t: "h", level: 1, text: `${sec}. Сравнение диаметров` });
    b.push({
      t: "p",
      text:
        "Диаметр выбирается не по скорости, а сравнением затрат: больший диаметр дороже в закупке и дешевле в " +
        "эксплуатации. Строки со знаком «—» в стоимости означают, что цена трубы или тариф не заданы, и сравнение " +
        "выполнено только по технике.",
    });
    b.push({
      t: "table",
      head: ["Труба", "v, м/с", "i, м/км", "Σh, м", "Станций", "N, кВт", "кВт·ч/год", "Труба, т", "Итого затрат"],
      widths: [13, 9, 10, 9, 9, 10, 13, 10, 17],
      rows: res.options.map((o) => [
        `${o.outerMm}×${o.wallMm}`,
        f(o.velocity),
        f(o.gradientMPerKm),
        f(o.totalLossM, 0),
        String(o.stations),
        f(o.motorKW, 0),
        (o.yearKWh / 1000).toFixed(0) + " тыс.",
        f(o.pipeTons, 0),
        o.totalCost !== undefined ? Math.round(o.totalCost).toLocaleString("ru-RU") : "—",
      ]),
    });
    sec += 1;
  }

  /* ---------------- ведомость ---------------- */
  if (r.spec && r.spec.rows.length) {
    b.push({ t: "h", level: 1, text: `${sec}. Ведомость материалов и оборудования` });
    b.push({
      t: "p",
      text:
        "Ведомость собрана из расчёта: длина труб — по профилю, число станций и агрегатов — по каскаду, вантузы и " +
        "выпуски — по найденным точкам профиля, противоударная арматура — по расчёту ступеней. Цены не " +
        "приводятся: они подставляются на день закупки. Упоры, опоры и колодцы на поворотах в ведомость не " +
        "входят — план трассы в расчёт не вводится.",
    });
    b.push({
      t: "table",
      head: ["№", "Наименование", "Тип, марка", "Ед.", "Кол-во", "Примечание"],
      widths: [5, 24, 22, 7, 10, 32],
      rows: r.spec.rows.map((x) => [x.no, x.name, x.type, x.unit, String(x.qty).replace(".", ","), x.note]),
    });
    b.push(formulaTable(r.spec.formulas));
    sec += 1;
  }

  /* ---------------- замечания ---------------- */
  if (res.warnings.length) {
    b.push({ t: "h", level: 1, text: `${sec}. Замечания к расчёту` });
    b.push({ t: "ul", items: res.warnings });
    sec += 1;
  }

  /* ---------------- допущения ---------------- */
  b.push({ t: "h", level: 1, text: `${sec}. Принятые величины и допущения` });
  b.push({
    t: "p",
    text:
      "ҚМҚ 2.04.03-19 нормирует канализацию и водоводы не регулирует; наружное водоснабжение в Узбекистане " +
      "нормирует ШНК 2.04.02-97*. Пункты этого норматива в расчёте не проставлены: ставить ссылку наугад хуже, " +
      "чем не ставить вовсе. Поэтому каждая принятая величина ниже помечена как практика проектирования и " +
      "подлежит подтверждению по действующей редакции.",
  });
  b.push({ t: "ul", items: res.assumptions });
  sec += 1;

  /* ---------------- задание на переходный процесс ---------------- */
  if (res.transientBrief.length) {
    b.push({ t: "h", level: 1, text: `${sec}. Данные для расчёта переходного процесса` });
    b.push({
      t: "p",
      text:
        "Приведённая оценка удара говорит, нужна ли защита и какого она порядка, но не позволяет её подобрать. " +
        "Подбор выполняется моделированием переходного процесса; ниже перечислено, что для него потребуется.",
    });
    b.push({ t: "ul", items: res.transientBrief });
  }

  return b;
}

export function mainReportDocxMeta(r: MainReportInput) {
  return {
    title: `Гидравлический расчёт напорного водовода — ${r.object || "объект"}`,
    subject: "Расчёт напорного водовода",
    creator: "SUVSANOAT",
  };
}

/* ==================================================================
 * ОТЧЁТ ПО ОДНОМУ УЧАСТКУ (страница «Участок водовода»)
 *
 * Там нет профиля и каскада: один участок, один насос, один удар.
 * Поэтому отчёт короче, но собирается из тех же полей и по тем же
 * правилам.
 * ================================================================== */
export type SegmentReportInput = {
  object?: string;
  material: WaterPipeKind;
  lining: Lining;
  qM3H: number;
  geoLiftM: number;
  pipeLengthM: number;
  startElevM?: number;
  seg: SegmentResult;
};

export function buildSegmentReportBlocks(r: SegmentReportInput): DocxBlock[] {
  const b: DocxBlock[] = [];
  const s = r.seg;
  const p = s.protection;

  b.push({ t: "p", text: "SUVSANOAT", style: "subtitle" });
  b.push({ t: "p", text: "Расчёт участка водовода", style: "title" });
  b.push({ t: "p", text: "напор, гидравлический удар и противоударная защита", style: "subtitle" });
  b.push({ t: "p", text: r.object || "Участок напорного водовода", style: "subtitle" });
  b.push({ t: "p", text: `Дата расчёта: ${today()}`, style: "small" });

  b.push({ t: "h", level: 1, text: "1. Исходные данные" });
  b.push({
    t: "table",
    head: ["Показатель", "Значение"],
    widths: [42, 58],
    rows: [
      ["Расход", `${f(r.qM3H, 1)} м³/ч = ${f(s.qM3s * 1000, 1)} л/с`],
      ["Длина участка", `${Math.round(r.pipeLengthM)} м`],
      ["Геодезический подъём", `${f(r.geoLiftM, 1)} м`],
      ["Отметка начала", r.startElevM !== undefined ? `${f(r.startElevM, 1)} м` : "не задана, принята 0 м"],
      ["Труба", `${WATER_PIPE[r.material].label}, ${s.outerMm}×${s.wallMm} мм, внутренний ${f(s.innerMm, 1)} мм`],
      ["Внутреннее покрытие", LINING_LABEL[r.lining]],
      ["Скорость", `${f(s.velocity)} м/с`],
    ],
  });

  b.push({ t: "h", level: 1, text: "2. Напор и мощность" });
  b.push(
    formulaTable([
      {
        label: "Скорость",
        formula: `v = 4Q / (π·d²) = 4 · ${f(s.qM3s, 4)} / (3,1416 · ${f(s.innerMm / 1000, 3)}²)`,
        result: `${f(s.velocity)} м/с`,
        source: WATER_MAIN.economicVelocity.note,
      },
      {
        label: "Потери по длине",
        formula: `h_дл = i · L = ${f(s.gradientMPerKm)} м/км · ${f(r.pipeLengthM / 1000, 3)} км`,
        result: `${f(s.frictionM)} м`,
        source: `шероховатость ${WATER_PIPE[r.material].roughnessMm[r.lining]} мм (${LINING_LABEL[r.lining]})`,
      },
      {
        label: "Местные потери",
        formula: `h_м = ${WATER_MAIN.localShare.value * 100} % от h_дл`,
        result: `${f(s.localM)} м`,
        source: WATER_MAIN.localShare.note,
      },
      {
        label: "Требуемый напор",
        formula: `H = H_геод + h_дл + h_м + H_св = ${f(r.geoLiftM, 1)} + ${f(s.frictionM)} + ${f(s.localM)} + H_св`,
        result: `${f(s.requiredHeadM, 1)} м = ${f(s.requiredHeadBar)} бар`,
        source: WATER_MAIN.freeHeadEnd.note,
      },
      {
        label: "Мощность",
        formula: `N = ρ·g·Q·H / (1000·η_нас·η_дв)`,
        result: `вал ${f(s.shaftKW, 1)} кВт, двигатель ${f(s.motorKW, 1)} кВт`,
        source: WATER_MAIN.efficiency.note,
      },
    ]),
  );

  b.push({ t: "h", level: 1, text: "3. Труба: давление и стенка" });
  b.push(
    formulaTable([
      { label: "Класс давления", formula: `PN ≥ p_раб · ${WATER_MAIN.hammerReserve.value}`, result: `PN ${s.pnBar}`, source: WATER_MAIN.hammerReserve.note },
      { label: "Стенка по давлению", formula: "δ = p·D / (2·σ_доп·φ) + c", result: `${f(s.wallByPressureMm)} мм`, source: WATER_MAIN.safetyYield.note },
      { label: "Стенка по испытанию", formula: "δ = p_исп·D / (2·σ_доп·φ) + c", result: `${f(s.wallByTestMm)} мм`, source: "испытательное давление по норме на испытание трубопровода" },
      { label: "Кольцевое напряжение", formula: `σ = p·D / (2·δ) при δ = ${s.wallMm} мм`, result: `${f(s.hoopStressMPa, 1)} МПа`, source: `предел текучести ${WATER_PIPE[r.material].yieldMPa} МПа` },
      { label: "Смятие при вакууме", formula: "p_кр = 2E/(1−μ²) · (δ/D)³", result: `${f(s.bucklingBar)} бар`, source: WATER_MAIN.vacuumSafety.note },
    ]),
  );

  b.push({ t: "h", level: 1, text: "4. Гидравлический удар" });
  b.push(
    formulaTable([
      {
        label: "Скорость волны",
        formula: `c = c₀ / √(1 + (K/E)·(D/δ)) = 1425 / √(1 + (2,03·10⁹/${(WATER_PIPE[r.material].E / 1e9).toFixed(0)}·10⁹)·(${s.outerMm}/${s.wallMm}))`,
        result: `${f(s.waveSpeedMs, 0)} м/с`,
        source: "формула Жуковского — Аллиеви для упругой трубы",
      },
      {
        label: "Фаза удара",
        formula: `t₀ = 2L / c = 2 · ${Math.round(r.pipeLengthM)} / ${f(s.waveSpeedMs, 0)}`,
        result: `${f(s.phaseS, 2)} с`,
        source: "за это время волна доходит до конца участка и возвращается",
      },
      {
        label: "Время торможения столба",
        formula: `t = L·v / (g·H) = ${Math.round(r.pipeLengthM)} · ${f(s.velocity)} / (9,81 · H)`,
        result: `${f(s.stopTimeS, 2)} с`,
        source: "остановка воды под действием статического напора после отключения насоса",
      },
      {
        label: "Повышение напора",
        formula: s.direct ? `Δh = c·Δv / g = ${f(s.waveSpeedMs, 0)} · ${f(s.velocity)} / 9,81 (удар прямой)` : "Δh по Мишо — удар непрямой, торможение дольше фазы",
        result: `${f(s.surgeM, 1)} м`,
        source: s.direct ? "прямой удар: столб останавливается быстрее фазы" : "непрямой удар: часть волны успевает уйти",
      },
      {
        label: "Наибольшее давление",
        formula: "p_пик = (H_ст + Δh) / 10,197",
        result: `${f(s.peakBar)} бар — приходит в ${s.peakAt}`,
        source: "верхняя оценка без учёта защиты",
      },
      {
        label: "Разрежение",
        formula: "H_мин = H_ст − Δh, разрыв при H_мин ниже отметки оси трубы",
        result: s.separation ? `разрыв сплошности, ${s.vacuumAt}` : `${f(s.minHeadM, 1)} м, разрыва нет`,
        source: "при смыкании разорванного столба обратный удар опаснее прямого",
      },
    ]),
  );

  b.push({ t: "h", level: 1, text: "5. Противоударная защита" });
  b.push({
    t: "table",
    head: ["Позиция", "Принято", "Основание"],
    widths: [28, 26, 46],
    rows: [
      ["Объём сброса за одно отключение", `${f(p.dischargeVolumeM3)} м³`, p.volumeGovernedBy],
      ["Требуемая пропускная способность", `Kv = ${f(p.requiredKv, 0)} м³/ч при 1 бар`, "по расходу сброса и располагаемому перепаду"],
      ["Клапан сбросной", `${p.valveCount}×DN ${p.valveDnMm}, PN ${p.valvePnBar}`, `время полного открытия ${f(p.openTimeS, 1)} с — быстрее фазы ${f(s.phaseS, 2)} с`],
      ["Линия сброса", `DN ${p.drainDnMm}`, `по скорости ${f(p.drainVelocity)} м/с требуется DN ${p.drainDnRequiredMm}`],
      ["Приёмная ёмкость", `${f(p.receiverM3, 1)} м³`, "принимает сброшенную воду; при наличии резервуара может не потребоваться"],
      ["Гидропневмобак", p.vesselTotalM3 > 0 ? `${f(p.vesselTotalM3, 1)} м³ (воздух ${f(p.vesselAirM3, 1)} м³)` : "не требуется", "объём предварительный, уточняется расчётом переходного процесса"],
      ["Вантузы", `${p.airValveCount}×DN ${p.airValveDnMm}`, `по расходу воздуха требуется DN ${p.airValveDnRequiredMm}`],
    ],
  });

  if (s.materials.length > 1) {
    b.push({ t: "h", level: 1, text: "6. Сравнение материалов трубы" });
    b.push({
      t: "p",
      text:
        "Материал влияет на удар сильнее, чем любая арматура: в полиэтилене скорость волны втрое ниже, чем в " +
        "стали, и то же отключение даёт втрое меньшее повышение давления.",
    });
    b.push({
      t: "table",
      head: ["Материал", "c, м/с", "Δh, м", "Пик, бар", "Примечание"],
      widths: [20, 14, 14, 14, 38],
      rows: s.materials.map((m) => [m.label, f(m.waveSpeedMs, 0), f(m.surgeM, 1), f(m.peakBar), m.suitable ? m.note : `не подходит по классу давления — ${m.note}`]),
    });
  }

  if (s.warnings.length) {
    b.push({ t: "h", level: 1, text: `${s.materials.length > 1 ? 7 : 6}. Замечания` });
    b.push({ t: "ul", items: s.warnings });
  }
  b.push({ t: "h", level: 1, text: `${(s.materials.length > 1 ? 7 : 6) + (s.warnings.length ? 1 : 0)}. Принятые величины` });
  b.push({ t: "ul", items: s.assumptions });

  return b;
}

export function segmentReportDocxMeta(r: SegmentReportInput) {
  return {
    title: `Расчёт участка водовода — ${r.object || "объект"}`,
    subject: "Расчёт участка напорного водовода",
    creator: "SUVSANOAT",
  };
}

/* ------------------------------------------------------------------
 * ПЕЧАТНАЯ СТРАНИЦА ДЛЯ PDF
 *
 * Та же вёрстка, что у отчёта по сети: браузер печатает в PDF сам.
 * ------------------------------------------------------------------ */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderReportHtml(blocks: DocxBlock[], title: string): string {
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
<title>${esc(title)}</title>
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
table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; font-size: 8.5pt; page-break-inside: auto; }
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

export function buildMainReportHtml(r: MainReportInput): string {
  return renderReportHtml(buildMainReportBlocks(r), "Гидравлический расчёт напорного водовода");
}

export function buildSegmentReportHtml(r: SegmentReportInput): string {
  return renderReportHtml(buildSegmentReportBlocks(r), "Расчёт участка водовода");
}
