/* ==================================================================
 * ВЕДОМОСТЬ ОБЪЁМОВ РАБОТ
 *
 * Зачем модуль: бетон, арматура и земляные работы уже считаются внутри
 * каждого сооружения (concreteVolume в drawings/core/construction.ts —
 * её результат сооружения кладут в свои строки volumes), но наружу эти
 * числа не выходят: они видны только на листе чертежа. Снабженцу и
 * сметчику нужна сводная ведомость по всему комплекту — здесь она и
 * собирается.
 *
 * Главное правило: НИ ОДНОГО нового числа по бетону. Строки бетона и
 * арматуры берутся из моделей как есть — иначе ведомость и чертёж
 * разойдутся, а разойтись они не имеют права. Пересчёт здесь только
 * один — земляные работы: их модели сооружений не считают вовсе,
 * потому что на лист сооружения котлован не выносится.
 *
 * Земляные работы считаются от геометрии модели (габарит в плане,
 * отметка дна, планировочная отметка) и двух коэффициентов со страницы
 * «Допущения»: excavMargin — рабочее пространство от стены до откоса,
 * excavSlope — заложение откоса. ҚМҚ 2.04.03-19 земляные работы не
 * нормирует; оба коэффициента — практика, и в ведомости они подписаны
 * именно так.
 * ================================================================== */

import { construction } from "../core/construction";
import type { DrawingInput, Footprint, StructureModel } from "../core/types";
import { DEFAULT_ASSUMPTIONS, findAssumption, type Assumptions } from "../../lib/assumptions";
import { buildModels, type PackageOptions } from "./build";
import { layoutSite } from "../site/layout";

/** Строка бетона по элементу конструкции, как её назвало само сооружение. */
export type ConcreteElement = { name: string; m3: number };

export type StructureVolumes = {
  id: string;
  /** позиция на генплане — та же, что на чертежах */
  no: string;
  name: string;
  /** габарит в плане, текстом: «12,0 × 6,0 м» или «D 9,0 м» */
  plan: string;
  /** отметки: верх / дно / низ подготовки */
  levels: string;
  /** число одинаковых единиц, если сооружение многосекционное (иначе 1) */
  units: number;
  /** бетон по элементам — строки модели, ничего не пересчитано */
  concrete: ConcreteElement[];
  /**
   * Итого бетон конструкций, м³. Это сумма стен, днища и перекрытия
   * БЕЗ бетонной подготовки — так считает concreteVolume, и так же
   * стоит в строке «Итого бетон» каждого сооружения. Подготовка идёт
   * отдельной строкой и отдельной колонкой: класс бетона у неё другой.
   */
  concreteTotal: number | null;
  /** бетонная подготовка, м³ (В7,5 по щебню) */
  lean: number | null;
  /** арматура, кг */
  rebarKg: number | null;
  /** разработка грунта в котловане, м³; null — сооружение не заглублено */
  excavation: number | null;
  /** обратная засыпка пазух, м³ */
  backfill: number | null;
  /** излишний грунт на вывоз, м³ (вытесненный объём сооружения) */
  spoil: number | null;
  /** глубина котлована от планировочной отметки до низа подготовки, м */
  pitDepth: number | null;
  /** то, что по данным модели не определяется — словами, без подстановки чисел */
  note: string;
};

export type VolumeSheet = {
  object: string;
  rows: StructureVolumes[];
  totals: {
    concrete: number;
    lean: number;
    rebarKg: number;
    excavation: number;
    backfill: number;
    spoil: number;
  };
  /** принятые коэффициенты земляных работ — печатаются рядом с итогами */
  params: { key: string; name: string; unit: string; value: number; source: string }[];
  /** оговорки ко всей ведомости */
  notes: string[];
};

/* ------------------------------------------------------------------
 * Разбор строк volumes сооружения.
 *
 * Сооружения кладут бетон в volumes по соглашению об именах:
 * «Бетон …» — элемент конструкции, «Бетонная подготовка …» — подготовка,
 * «Итого бетон, м³» — сумма конструкций, «Арматура, кг» — арматура
 * (в поле m3, хотя это килограммы — так устроен VolumeRow).
 * Остальные строки — рабочие объёмы воды, ила, воздуха: в ведомость
 * работ они не идут.
 * ------------------------------------------------------------------ */

/* Кириллица и \w не дружат: в JS \w — это только латиница, цифры и
   подчёркивание, поэтому классы символов здесь заданы через \S. */
const RE_TOTAL = /^итого\s+бетон/i;
const RE_LEAN = /^бетонн\S*\s+подготовк/i;
const RE_CONCRETE = /^бетон/i;
const RE_REBAR = /^арматура\s*,\s*кг/i;
/* Число отдельно стоящих единиц берётся из поля `units` контракта
   сооружения, а не вытаскивается регуляркой из наименования строки: имя
   строки — подпись для человека, и при первом же её переименовании
   множитель молча стал бы единицей. */

function parseVolumeRows(m: StructureModel) {
  const concrete: ConcreteElement[] = [];
  let total: number | null = null;
  let lean: number | null = null;
  let rebarKg: number | null = null;
  for (const r of m.volumes) {
    const n = String(r.name ?? "");
    if (RE_REBAR.test(n)) {
      rebarKg = r.m3;
      continue;
    }
    if (RE_TOTAL.test(n)) {
      total = r.m3;
      continue;
    }
    if (RE_LEAN.test(n)) {
      lean = (lean ?? 0) + r.m3;
      continue;
    }
    if (RE_CONCRETE.test(n)) {
      concrete.push({ name: n, m3: r.m3 });
    }
  }
  return { concrete, total, lean, rebarKg, units: Math.max(1, Math.round(m.units ?? 1)) };
}

/* ------------------------------------------------------------------
 * Земляные работы
 * ------------------------------------------------------------------ */

/**
 * Наименьшая глубина, при которой габарит модели можно считать
 * контуром котлована, м. Мельче — это уже не котлован, а срезка грунта
 * или траншея под фундаменты: их объём зависит от конструкции
 * фундаментов, которой на предпроектной стадии нет.
 */
const PIT_MIN_DEPTH_M = 1.0;

function planArea(fp: Footprint, addM: number): number {
  if (fp.shape === "rect") return (fp.w / 1000 + addM) * (fp.l / 1000 + addM);
  const d = fp.d / 1000 + addM;
  return (Math.PI * d * d) / 4;
}

function planText(fp: Footprint): string {
  return fp.shape === "rect"
    ? `${(fp.w / 1000).toFixed(1)} × ${(fp.l / 1000).toFixed(1)} м`
    : `D ${(fp.d / 1000).toFixed(1)} м`;
}

/**
 * Котлован под заглублённое сооружение.
 *
 * Считается честно по геометрии: дно котлована — низ бетонной
 * подготовки (отметка дна сооружения минус толщина днища и подготовки),
 * дно в плане — наружный габарит плюс рабочее пространство с каждой
 * стороны, стенки — с откосом заложением excavSlope. Объём — по
 * формуле призматоида, а не «площадь × глубина»: при глубине 5 м и
 * откосе 1:0,5 разница между ними больше трети объёма.
 *
 * Обратная засыпка = котлован минус вытесненный объём сооружения ниже
 * планировочной отметки; остаток идёт на вывоз.
 */
function earthworks(
  m: StructureModel,
  slabAndLeanM: number,
  marginM: number,
  slope: number,
): { excavation: number; backfill: number; spoil: number; depth: number } | null {
  const pitBottom = m.bottom - slabAndLeanM;
  const h = m.ground - pitBottom;
  if (!(h > 0)) return null;
  /* Котлован считается только под заглублённые железобетонные ёмкости.
     У платформ, зданий и иловых площадок габарит модели — это контур
     площадки или карт, а не контур котлована: умножать его на глубину
     заложения значило бы выдать за объём работ число, которое к
     действительности отношения не имеет. Для них ведомость пишет
     словами, что земляные работы не определены. */
  if (m.material !== "concrete" || h < PIT_MIN_DEPTH_M) return null;

  const add = 2 * marginM;
  const grow = (level: number) => 2 * slope * level; // расширение габарита на высоте level от дна
  const aBottom = planArea(m.footprint, add);
  const aMid = planArea(m.footprint, add + grow(h / 2));
  const aTop = planArea(m.footprint, add + grow(h));
  const excavation = (h / 6) * (aBottom + 4 * aMid + aTop);

  /* вытеснено сооружением: наружный габарит на высоту от низа
     подготовки до планировочной отметки (выше отметки — надземная
     часть, к засыпке отношения не имеет) */
  const hBody = Math.min(m.top, m.ground) - pitBottom;
  const displaced = planArea(m.footprint, 0) * Math.max(0, hBody);
  const backfill = Math.max(0, excavation - displaced);
  return { excavation, backfill, spoil: Math.max(0, excavation - backfill), depth: h };
}

/* ------------------------------------------------------------------
 * Сборка ведомости
 * ------------------------------------------------------------------ */

function paramRow(key: string, a: Assumptions) {
  const def = findAssumption(key);
  return {
    key,
    name: def?.name ?? key,
    unit: def?.unit ?? "",
    value: a[key] ?? def?.value ?? 0,
    source: def?.source ?? "значение не найдено в справочнике допущений",
  };
}

export function buildVolumeSheet(
  input: DrawingInput,
  opts: PackageOptions = {},
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): VolumeSheet {
  const models = buildModels(input, opts).map((e) => e.model);
  /* позиции — те же, что на генплане и на листах: ведомость и чертёж
     должны ссылаться на сооружение одинаково */
  const layout = layoutSite(input.site, models, { housingDistM: opts.housingDistM });
  const noById = new Map(layout.placed.map((p) => [p.model.id, p.no]));

  const c = construction(a);
  const slabAndLeanM = (c.slabMm + c.leanMm) / 1000;
  const marginM = a.excavMargin ?? 0.8;
  const slope = a.excavSlope ?? 0.5;

  const rows: StructureVolumes[] = [];
  for (const m of models) {
    const v = parseVolumeRows(m);
    const e = earthworks(m, slabAndLeanM, marginM, slope);
    const notes: string[] = [];

    if (!e) {
      const depth = m.ground - (m.bottom - slabAndLeanM);
      notes.push(
        depth <= 0
          ? "сооружение не заглублено — котлован не разрабатывается; работы под фундаменты агрегатов настоящей ведомостью не определяются"
          : `земляные работы не определены: заложение ${depth.toFixed(2)} м, габарит модели — контур площадки (карт, здания), а не котлована; ` +
            "объём срезки грунта и траншей под фундаменты определяется конструктивными решениями рабочего проекта",
      );
    }
    if (v.total === null) {
      notes.push("бетон конструкций в модели сооружения не выделен — объём определяется отдельным расчётом");
    }
    if (v.units > 1) {
      notes.push(
        `сооружение из ${v.units} одинаковых единиц; габарит в плане и объёмы бетона даны сразу на все`,
      );
    }
    if (m.material === "building" || m.material === "steel") {
      notes.push(
        "корпус не железобетонный (здание/металлоконструкция) — в графах бетона только строительное основание",
      );
    }

    /* Габарит сооружения по контракту накрывает ВСЕ его единицы (иначе
       компоновка площадки не сошлась бы), и объёмы бетона тоже посчитаны
       на все. Значит ни котлован, ни бетон на число единиц умножать
       нельзя — иначе объём выемки удваивается на пустом месте. */
    rows.push({
      id: m.id,
      no: noById.get(m.id) ?? m.no ?? "—",
      name: m.name,
      plan: planText(m.footprint),
      levels: `верх ${m.top.toFixed(2)}; дно ${m.bottom.toFixed(2)}; низ подготовки ${(m.bottom - slabAndLeanM).toFixed(2)}`,
      units: v.units,
      concrete: v.concrete,
      concreteTotal: v.total,
      lean: v.lean,
      rebarKg: v.rebarKg,
      excavation: e ? e.excavation : null,
      backfill: e ? e.backfill : null,
      spoil: e ? e.spoil : null,
      pitDepth: e ? e.depth : null,
      note: notes.join("; ") || "—",
    });
  }

  const sum = (pick: (r: StructureVolumes) => number | null) =>
    rows.reduce((s, r) => s + (pick(r) ?? 0), 0);

  return {
    object: input.object,
    rows,
    totals: {
      concrete: sum((r) => r.concreteTotal),
      lean: sum((r) => r.lean),
      rebarKg: sum((r) => r.rebarKg),
      excavation: sum((r) => r.excavation),
      backfill: sum((r) => r.backfill),
      spoil: sum((r) => r.spoil),
    },
    params: [
      paramRow("excavMargin", a),
      paramRow("excavSlope", a),
      paramRow("wallThickness", a),
      paramRow("slabThickness", a),
      paramRow("coverThickness", a),
      paramRow("leanConcrete", a),
      paramRow("rebarRate", a),
      paramRow("basinDepth", a),
      paramRow("basinFreeboard", a),
      paramRow("concreteGrade", a),
    ],
    notes: [
      `Бетон конструкций — ${c.concreteGrade}; бетонная подготовка — В7,5 по щебёночному основанию, показана отдельной графой и в графу «итого бетон» не входит.`,
      `Арматура принята ${c.rebarKgM3} кг на м³ бетона конструкций (практика для гидротехнических монолитных конструкций). Это оценка для заказа металла, а не результат расчёта конструкций: фактический расход определяется армированием на стадии рабочего проектирования.`,
      `Котлован: дно по наружным граням сооружения плюс рабочее пространство ${marginM.toFixed(2)} м с каждой стороны, стенки с откосом 1:${slope.toFixed(2)}, глубина от планировочной отметки 0.000 до низа бетонной подготовки. Объём — по формуле призматоида, а не «площадь × глубина»: при глубине 5 м и откосе 1:0,5 разница между ними превышает треть объёма.`,
      `Котлован посчитан только под заглублённые железобетонные ёмкости глубиной от ${PIT_MIN_DEPTH_M.toFixed(1)} м. Под площадками, зданиями и иловыми площадками габарит сооружения — это контур площадки, а не котлована, поэтому земляные работы по ним не определены и в итог не входят: соответствующие строки помечены в графе примечаний.`,
      "Заложение откоса и рабочее пространство приняты по практике SUVSANOAT: ҚМҚ 2.04.03-19 земляные работы не нормирует. Значения подлежат проверке по фактическим грунтам и уровню грунтовых вод; при вертикальных стенках с креплением заложение откоса равно нулю, и объёмы изменятся.",
      "Обратная засыпка = объём котлована минус объём сооружения ниже планировочной отметки. Уплотнение, песчаная подушка, водопонижение, крепление стенок, вывоз излишнего грунта на расстояние — настоящей ведомостью не определяются.",
      "Опалубка, гидроизоляция, закладные детали и монтажные работы в ведомость не входят: их объём зависит от конструктивных решений стадии рабочего проектирования.",
      layout.generated
        ? "Позиции соответствуют компоновке генплана, выполненной на свободном участке."
        : "Позиции соответствуют компоновке генплана на заданном участке.",
    ],
  };
}
