/* ==================================================================
 * БИБЛИОТЕКА ОБОРУДОВАНИЯ ОЧИСТНЫХ СООРУЖЕНИЙ
 *
 * Состав определяется технологией и расходом, а не тем, что делает
 * SUVSANOAT. Для каждой ступени выдаётся полный перечень позиций:
 * сооружение, механическое оборудование, КИП — с расчётным
 * параметром, количеством и резервированием.
 *
 * Типоразмерный ряд по расходу:
 *   compact  (до 200 м³/сут)   — блочные установки полной заводской
 *                                готовности, стеклопластик;
 *   modular  (200–1500 м³/сут) — блочно-модульные линии или ж/б,
 *                                выбор по площадке и грунтам;
 *   concrete (свыше 1500)      — железобетонные сооружения,
 *                                оборудование поставное.
 * Границы приняты по практике проектирования, не по нормативу, и
 * подлежат уточнению компоновкой на площадке.
 *
 * Расчётные величины: ҚМҚ 2.04.03-19 «Канализация. Наружные сети и
 * сооружения» (взамен КМК 2.04.03-97) — все нормативные числа берутся
 * из norms/kmk-2-04-03-19.ts с номером пункта; там, где ҚМҚ-19 величину
 * не задаёт, источник назван явно (DWA-A 131, EN 858, EN 1825, Metcalf &
 * Eddy, практика). Число сооружений — пп. 6.26, 6.38, 6.58, 6.150, 6.236;
 * резерв насосов — табл. 21 (п. 5.10), воздуходувок — п. 5.29.
 * ================================================================== */

import type { StageKey } from "./industries";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../../../lib/assumptions";
import { L, t as tr, type L10n } from "./i18n";
import type { Language } from "../../../translations";
import type { TechnologyCode, TechnologyResult } from "../../../../calculations/technology";
import {
  AEROTANK,
  BIO_INLET_LIMITS,
  DISINFECTION,
  EQUALIZATION,
  FLOTATION,
  GRIT,
  KMK_2_04_03_19_DOC,
  PRIMARY_SETTLING,
  PUMP_STATIONS,
  REAGENTS,
  SCREENS,
  SECONDARY_SETTLING,
  SLUDGE,
  TERTIARY_FILTERS,
  kMaxByDailyFlow,
  kmkRef,
} from "../../../../norms/kmk-2-04-03-19";
import {
  MBR_AUXILIARY,
  MBR_FINE_SCREEN,
} from "../../../../norms/uz-membrane-requirement";

export type Supply = "own" | "supply" | "either";
export type ItemKind = "structure" | "machine" | "instrument";

export type Item = {
  kind: ItemKind;
  /** наименование позиции так, как она пойдёт в ведомость */
  name: string;
  /** расчётный параметр, определяющий типоразмер */
  spec: string;
  /** количество и резервирование */
  qty: string;
  supply: Supply;
  note?: string;
};

export type Scale = "compact" | "modular" | "concrete";

export const SCALE_LABEL: Record<Scale, L10n> = {
  compact: L(
    "блочная установка заводской готовности (стеклопластик)",
    "to‘liq zavod tayyorligidagi blokli qurilma (shishaplastik)",
    "packaged factory-built unit (GRP)",
    "工厂预制一体化设备（玻璃钢）"
  ),
  modular: L(
    "блочно-модульное или железобетонное исполнение",
    "blok-modulli yoki temir-beton bajarilish",
    "modular or reinforced-concrete construction",
    "模块化或钢筋混凝土结构"
  ),
  concrete: L(
    "железобетонные сооружения, оборудование поставное",
    "temir-beton inshootlar, uskunalar yetkazib beriladi",
    "reinforced-concrete structures with supplied equipment",
    "钢筋混凝土构筑物，设备采购供货"
  ),
};

export function scaleOf(Q: number, a: Assumptions = DEFAULT_ASSUMPTIONS): Scale {
  if (Q <= a.scaleCompact) return "compact";
  if (Q <= a.scaleModular) return "modular";
  return "concrete";
}

export type Ctx = {
  Q: number;
  Qh: number;
  Qls: number;
  hours: number;
  scale: Scale;
  industryId: string;
  dischargeId: string;
  bod: number;
  cod: number;
  ss: number;
  fats: number;
  petro: number;
  tn: number;
  /** нагрузка по БПК, кг/сут */
  bodLoad: number;
  /** объём усреднителя, м³ (из расчёта страницы) */
  vAvg?: number;
  /** объём биоблока, м³ */
  vBio?: number;
  /** расход воздуха, м³/ч */
  air?: number;
  /** масса осадка, кг СВ/сут */
  dryKg?: number;
  /** утверждённые коэффициенты расчёта */
  a: Assumptions;
  /** язык вывода */
  lang: Language;
  /** технология биоблока, выбранная инженером; не задана — автоподбор по расходу и нагрузке */
  tech?: TechnologyCode;
  /** результат calculations/technology.ts для выбранной технологии */
  techResult?: TechnologyResult;
};

/* ==================================================================
 * ТЕХНОЛОГИЯ БИОЛОГИЧЕСКОГО БЛОКА
 *
 * Выбор технологии ҚМҚ 2.04.03-19 не регламентирует. Нормируется
 * только классический аэротенк (пп. 6.140–6.156, табл. 40–42,
 * ф. (51)–(57), (70)) и аэрационные установки на полное окисление
 * (пп. 6.175–6.179). Параметры MBBR, IFAS, SBR, MBR и анаэробных
 * реакторов (UASB, ABR, AnMBR, ANBR) в ҚМҚ 2.04.03-19 отсутствуют —
 * они приняты по DWA-A 131 / практике и рассчитываются в
 * calculations/technology.ts. Из норматива при этом всё равно берутся
 * гидравлика (п. 2.7, табл. 2) и — для аэробных схем — расход воздуха
 * по ф. (70) п. 6.156.
 * ================================================================== */

/* ==================================================================
 * МЕМБРАННЫЕ ТЕХНОЛОГИИ
 *
 * MBR и AnMBR — биореакторы с мембранным разделением: мембранные
 * модули стоят в самом реакторе и заменяют вторичный отстойник.
 * Числа берутся из norms/uz-membrane-requirement.ts (прозор тонкой
 * решётки, срок службы модулей); всё, чего нет ни в ҚМҚ 2.04.03-19,
 * ни в модуле требования, помечается как паспортные данные.
 * ================================================================== */

export const MEMBRANE_TECHNOLOGIES: readonly TechnologyCode[] = ["MBR", "AnMBR"];

export function isMembraneTechnology(code: TechnologyCode | undefined): boolean {
  return !!code && MEMBRANE_TECHNOLOGIES.includes(code);
}

/** параметры мембран норматив не задаёт — только паспорт производителя */
const MEMBRANE_BY_DATASHEET = L(
  `${KMK_2_04_03_19_DOC.code} мембранные модули не нормирует: поток (flux), площадь модуля, режимы промывки и продувки — по паспорту производителя`,
  `${KMK_2_04_03_19_DOC.code} membrana modullarini me’yorlamaydi: oqim (flux), modul yuzasi, yuvish va puflash rejimlari — ishlab chiqaruvchi pasporti bo‘yicha`,
  `${KMK_2_04_03_19_DOC.code} does not cover membrane modules: flux, module area, cleaning and scouring regimes follow the manufacturer's datasheet`,
  `${KMK_2_04_03_19_DOC.code} 未对膜组件作规定：通量、膜面积、清洗与擦洗方式均按厂家样本确定`
);

/** анаэробные технологии: воздуходувок и возвратного ила нет, есть газовый тракт */
export const ANAEROBIC_TECHNOLOGIES: readonly TechnologyCode[] = ["UASB", "ABR", "AnMBR", "ANBR"];

export function isAnaerobicTechnology(code: TechnologyCode | undefined): boolean {
  return !!code && ANAEROBIC_TECHNOLOGIES.includes(code);
}

/** технологии, доступные в форме объединённого маршрута */
export const TECHNOLOGY_CHOICES: readonly TechnologyCode[] = ["CAS", "MBBR", "IFAS", "SBR", "MBR", "UASB", "ABR", "AnMBR"];

export const TECHNOLOGY_LABEL: Record<TechnologyCode, L10n> = {
  CAS: L("Аэротенк на активном иле (CAS)", "Faol loyqali aerotenk (CAS)", "Conventional activated sludge (CAS)", "传统活性污泥法（CAS）"),
  MBBR: L("Реактор с подвижной биоплёнкой (MBBR)", "Harakatlanuvchi bioplyonkali reaktor (MBBR)", "Moving bed biofilm reactor (MBBR)", "移动床生物膜反应器（MBBR）"),
  IFAS: L("Гибридная схема «ил + биоплёнка» (IFAS)", "Gibrid «loyqa + bioplyonka» sxemasi (IFAS)", "Integrated fixed-film activated sludge (IFAS)", "泥膜复合工艺（IFAS）"),
  SBR: L("Циклический биореактор (SBR)", "Siklik bioreaktor (SBR)", "Sequencing batch reactor (SBR)", "序批式反应器（SBR）"),
  MBR: L("Мембранный биореактор (MBR)", "Membranali bioreaktor (MBR)", "Membrane bioreactor (MBR)", "膜生物反应器（MBR）"),
  UASB: L("Анаэробный реактор восходящего потока (UASB)", "Yuqoriga oqimli anaerob reaktor (UASB)", "Upflow anaerobic sludge blanket (UASB)", "升流式厌氧污泥床（UASB）"),
  ABR: L("Анаэробный перегородочный реактор (ABR)", "Anaerob to‘siqli reaktor (ABR)", "Anaerobic baffled reactor (ABR)", "厌氧折流板反应器（ABR）"),
  AnMBR: L("Анаэробный мембранный биореактор (AnMBR)", "Anaerob membranali bioreaktor (AnMBR)", "Anaerobic membrane bioreactor (AnMBR)", "厌氧膜生物反应器（AnMBR）"),
  ANBR: L("Анаэробный биореактор с прикреплённой биомассой (ANBR)", "Biriktirilgan biomassali anaerob bioreaktor (ANBR)", "Anaerobic attached-growth bioreactor (ANBR)", "厌氧固定生物膜反应器（ANBR）"),
  OTHER: L("Индивидуальная технологическая схема", "Individual texnologik sxema", "Custom process scheme", "定制工艺方案"),
};

/** краткие описания — из ветки «Начать анализ» (analysis/technology) */
export const TECHNOLOGY_DESCRIPTION: Record<TechnologyCode, L10n> = {
  CAS: L(
    "Классическая биологическая очистка активным илом с последующим разделением ила во вторичном отстойнике.",
    "Faol loyqa bilan klassik biologik tozalash va keyin ikkilamchi tindirgichda loyqani ajratish.",
    "Conventional biological treatment with activated sludge and secondary clarification.",
    "以活性污泥进行生物处理，随后在二沉池中泥水分离。"
  ),
  MBBR: L(
    "Биореактор с подвижной загрузкой, на которой развивается прикреплённая биомасса.",
    "Harakatlanuvchi yuklama ustida biriktirilgan biomassa rivojlanadigan bioreaktor.",
    "Biofilm reactor with free-moving carriers holding the attached biomass.",
    "采用悬浮填料附着生物膜的生物反应器。"
  ),
  IFAS: L(
    "Комбинация активного ила и прикреплённой биомассы для повышения эффективности биологической очистки.",
    "Biologik tozalash samaradorligini oshirish uchun faol loyqa va biriktirilgan biomassa kombinatsiyasi.",
    "Activated sludge combined with attached biomass to raise biological capacity.",
    "活性污泥与附着生物膜组合以提高生物处理能力。"
  ),
  SBR: L(
    "Последовательный биологический реактор с циклическим режимом наполнения, аэрации, отстаивания и выпуска.",
    "To‘ldirish, aeratsiya, tindirish va chiqarish siklidan iborat ketma-ket bioreaktor.",
    "Sequencing batch reactor cycling through fill, react, settle and decant.",
    "按进水、曝气、沉淀、排水循环运行的序批式反应器。"
  ),
  MBR: L(
    "Мембранный биореактор, объединяющий биологическую очистку и мембранное разделение.",
    "Biologik tozalash va membranali ajratishni birlashtirgan bioreaktor.",
    "Membrane bioreactor combining biological treatment and membrane separation.",
    "将生物处理与膜分离结合的膜生物反应器。"
  ),
  UASB: L(
    "Анаэробный реактор с восходящим потоком и гранулированной биомассой.",
    "Yuqoriga oqimli va granulalangan biomassali anaerob reaktor.",
    "Anaerobic reactor with upflow regime and granular biomass.",
    "升流式颗粒污泥厌氧反应器。"
  ),
  ABR: L(
    "Последовательный анаэробный реактор с несколькими перегородочными камерами.",
    "Bir necha to‘siqli kameralardan iborat ketma-ket anaerob reaktor.",
    "Anaerobic reactor with several baffled compartments in series.",
    "由多个折流室串联组成的厌氧反应器。"
  ),
  AnMBR: L(
    "Анаэробная биологическая очистка с последующим мембранным разделением.",
    "Anaerob biologik tozalash va keyin membranali ajratish.",
    "Anaerobic biological treatment followed by membrane separation.",
    "厌氧生物处理后接膜分离。"
  ),
  ANBR: L(
    "Анаэробный биореактор с прикреплённой биомассой для органически нагруженных сточных вод.",
    "Organik yuklamasi yuqori oqova uchun biriktirilgan biomassali anaerob bioreaktor.",
    "Anaerobic attached-growth reactor for organically loaded wastewater.",
    "适用于高有机负荷废水的厌氧固定膜反应器。"
  ),
  OTHER: L(
    "Схема, не входящая в типовой перечень; требуется отдельная расчётная модель.",
    "Tipik ro‘yxatga kirmagan sxema; alohida hisob modeli talab qilinadi.",
    "Scheme outside the standard list; a dedicated calculation model is required.",
    "不属于标准清单的方案，需要单独的计算模型。"
  ),
};

const TECH_NOT_NORMED = L(
  `параметры не нормируются ${KMK_2_04_03_19_DOC.code}; принято по DWA-A 131 / практике проектирования`,
  `parametrlar ${KMK_2_04_03_19_DOC.code} bilan me’yorlanmagan; DWA-A 131 / loyihalash amaliyoti bo‘yicha qabul qilingan`,
  `parameters are not covered by ${KMK_2_04_03_19_DOC.code}; taken from DWA-A 131 / design practice`,
  `参数未被 ${KMK_2_04_03_19_DOC.code} 规定；按 DWA-A 131／工程实践取值`
);

/** короткая подпись источника параметров технологии — идёт в шапку результата и в ведомость */
export function technologySourceNote(code: TechnologyCode, lang: Language): string {
  if (code === "CAS") {
    return (
      `Аэротенк нормируется ${KMK_2_04_03_19_DOC.code}: время аэрации — ф. (51) ${kmkRef("6.143")} и ф. (54) ${kmkRef("6.144")}, ` +
      `доза ила — табл. 40, кинетические константы — табл. 41, иловый индекс — табл. 42; ` +
      `число секций — ${AEROTANK.minSections.ref}; расход воздуха — ф. (70) ${AEROTANK.air.ref}.`
    );
  }
  const base = `${tr(TECHNOLOGY_LABEL[code], lang)}: ${tr(TECH_NOT_NORMED, lang)}.`;
  const fromKmk = isAnaerobicTechnology(code)
    ? `Из ${KMK_2_04_03_19_DOC.code} взята только гидравлическая часть (п. 2.7, табл. 2).`
    : `Из ${KMK_2_04_03_19_DOC.code} взяты гидравлическая часть (п. 2.7, табл. 2) и расход воздуха по ф. (70) п. 6.156.`;
  return `${base} ${fromKmk}`;
}

/**
 * Предупреждения по применимости выбранной технологии к составу стока.
 * Условия — из ветки «Начать анализ» (analysis/technology/page.tsx,
 * функция calculateRecommendation); расчёт не блокируется.
 */
export function technologyWarnings(ctx: Ctx): string[] {
  const code = ctx.tech;
  if (!code || code === "OTHER") return [];
  const out: string[] = [];
  const highOrganic = ctx.bod >= 300 || ctx.cod >= 800;

  if (isAnaerobicTechnology(code)) {
    if (!highOrganic) {
      out.push(
        `Органическая нагрузка невысокая (БПК₅ ${f(ctx.bod)} мг/л, ХПК ${f(ctx.cod)} мг/л): анаэробные варианты рассматриваются при БПК ≥ 300 или ХПК ≥ 800 мг/л. ` +
          `Ниже этих значений ${code} обычно проигрывает аэробной схеме.`
      );
    }
    if (code === "AnMBR" && ctx.cod < 800) {
      out.push("AnMBR оправдан при ХПК от 800 мг/л; при меньшей нагрузке выход биогаза не окупает мембранный блок.");
    }
    if (ctx.tn > 0) {
      out.push("Для глубокого удаления азота одной анаэробной ступени недостаточно — потребуется аэробная нитри-денитрификация после реактора.");
    }
    out.push(
      "Анаэробную технологию нельзя выбирать только по БПК/ХПК: проверьте биоразлагаемость, температуру, щёлочность, сульфаты, образование биогаза и последующую ступень доочистки."
    );
  }

  if (code === "MBR" || code === "AnMBR") {
    out.push("Отдельно учитываются мембранный поток, загрязнение мембран, режимы промывки (CIP) и эксплуатационные расходы; flux и площадь модуля — по паспорту выбранной мембраны.");
    if (ctx.fats > ctx.a.greaseTarget) {
      out.push(
        `Жиры ${f(ctx.fats)} мг/л выше ${ctx.a.greaseTarget} мг/л, допустимых перед биологией: мембраны быстро зарастают. ` +
          `Жироудаление до мембранного блока обязательно (EN 1825; в ${KMK_2_04_03_19_DOC.code} жироуловители не нормируются).`
      );
    }
  }

  if (code === "MBBR" || code === "IFAS") {
    out.push("Заполнение носителями, удельную поверхность и поверхностную нагрузку загрузки требуется заменить паспортными данными выбранного носителя.");
  }

  if (code === "SBR") {
    out.push("Цикл, обменный объём, MLSS и SRT приняты предварительно; окончательный подбор ведётся по фактической неравномерности притока и характеристикам декантера.");
  }

  if (ctx.bod <= 0 || ctx.cod <= 0) {
    out.push("Для проверки выбора технологии нужны и БПК, и ХПК исходного стока.");
  }

  return out;
}

const f = (v: number, d = 0) => v.toLocaleString("ru-RU", { maximumFractionDigits: d });

const T58 = TERTIARY_FILTERS.table58.sandSingleLayer;
const SECONDARY_HOPPER_H = SECONDARY_SETTLING.hopperMaxHours.value;
const BIO_N_TEXT = `не менее ${BIO_INLET_LIMITS.nPer100Bod} мг/л N и ${BIO_INLET_LIMITS.pPer100Bod} мг/л P на 100 мг/л БПКполн, ${BIO_INLET_LIMITS.ref}`;

/* насосная группа: рабочие + резерв по табл. 21 ҚМҚ 2.04.03-19 (п. 5.10):
   при 1–2 рабочих — 1 резервный, при 3 и более — 2 */
function pumpQty(n = 1): string {
  const r = n >= 3 ? 2 : 1;
  return `${n + r} (${n} раб. + ${r} рез.)`;
}

/* воздуходувки: п. 5.29 — до 3 рабочих 1 резервная, 4 и более — 2 */
function blowerQty(n = 1): string {
  const r = n <= 3 ? 1 : 2;
  return `${n + r} (${n} раб. + ${r} рез., ${PUMP_STATIONS.blowerReserve.ref})`;
}

/**
 * Максимальный часовой приток, м³/ч: средний часовой расход рабочего периода
 * × K_gen.max по табл. 2 (п. 2.7) × запас решётки сверх нормы (assumptions.screenPeak,
 * по умолчанию 1). K_gen.max выбран по среднесуточному расходу — при работе
 * менее 24 ч/сут это даёт запас в сторону безопасности.
 */
export function peakHourly(ctx: Pick<Ctx, "Q" | "Qh" | "a">): { qMax: number; kMax: number; source: string } {
  const u = kMaxByDailyFlow(ctx.Q);
  const screenPeak = ctx.a.screenPeak ?? 1;
  return { qMax: ctx.Qh * u.kMax * screenPeak, kMax: u.kMax, source: u.source };
}

/* ------------------------------------------------------------------
 * ОБЩЕСТАНЦИОННЫЕ ПОЗИЦИИ — не привязаны к ступени
 * ------------------------------------------------------------------ */

export function commonEquipment(ctx: Ctx): Item[] {
  const items: Item[] = [];

  items.push({
    kind: "structure",
    name: "Приёмная камера с аварийным переливом",
    spec: `на расход ${f(ctx.Qh, 1)} м³/ч; гашение скорости, отбор проб`,
    qty: "1",
    supply: "either",
  });

  items.push({
    kind: "instrument",
    name: "Узел учёта сточных вод",
    spec:
      ctx.scale === "concrete"
        ? "лоток Паршаля с ультразвуковым уровнемером"
        : `электромагнитный расходомер DN по подводящему трубопроводу, ${f(ctx.Qh, 1)} м³/ч`,
    qty: "1",
    supply: "supply",
    note: "Учёт обязателен по договору водопользования; сигнал в систему управления",
  });

  items.push({
    kind: "structure",
    name: "Аварийно-регулирующая ёмкость",
    spec: `объём не менее ${f(Math.max(ctx.Q / 24, ctx.Qh) * ctx.a.reserveEmergency)} м³ (${ctx.a.reserveEmergency} ч притока — практика; ${KMK_2_04_03_19_DOC.code} нормирует только приёмный резервуар НС: не менее ${PUMP_STATIONS.wetWellMinMinutes.value} мин подачи насоса, п. 5.18)`,
    qty: "1",
    supply: "own",
    note: "Приём стока при отключении питания и на время ремонта; опорожнение обратно в голову сооружений",
  });

  items.push({
    kind: "machine",
    name: "Дренажная насосная станция",
    spec: "сбор дренажных и промывных вод с площадки, возврат в усреднитель",
    qty: pumpQty(1),
    supply: "either",
  });

  items.push({
    kind: "instrument",
    name: "Шкаф управления и система автоматизации (АСУ ТП)",
    spec:
      ctx.scale === "compact"
        ? "локальная автоматика с диспетчеризацией по GSM"
        : "щиты управления, частотные преобразователи, SCADA с архивом параметров",
    qty: "комплект",
    supply: "supply",
  });

  if (["meat", "poultry", "fish", "settlement", "hospital", "leather"].includes(ctx.industryId)) {
    items.push({
      kind: "machine",
      name: "Система дезодорации",
      spec:
        ctx.scale === "compact"
          ? "укрытия сооружений и угольный фильтр вытяжки"
          : "герметичные укрытия, вытяжные вентиляторы, биофильтр или химический скруббер",
      qty: "комплект",
      supply: "supply",
      note: "Сток даёт сероводород и меркаптаны; при размещении вблизи жилья дезодорация обязательна",
    });
  }

  return items;
}

/* ------------------------------------------------------------------
 * ПОСТУПЕНЧАТЫЙ СОСТАВ
 * ------------------------------------------------------------------ */

export function equipmentFor(stage: StageKey, ctx: Ctx): Item[] {
  const items: Item[] = [];
  const fine = ["meat", "poultry", "fish", "leather", "textile-dye", "knitwear", "wool"].includes(ctx.industryId);
  /* мембранная схема: перед модулями нужна тонкая решётка, состав биоблока другой */
  const membrane = isMembraneTechnology(ctx.tech);
  const peak = peakHourly(ctx);
  const peakText = `${f(peak.qMax, 1)} м³/ч (K_gen.max = ${peak.kMax.toFixed(2)} по ${peak.source}${ctx.a.screenPeak && ctx.a.screenPeak !== 1 ? `; запас ×${ctx.a.screenPeak}` : ""})`;

  switch (stage) {
    /* ---------------- механическая очистка ---------------- */
    case "screen": {
      if (ctx.Q <= 50) {
        items.push({
          kind: "machine",
          name: "Решётка-корзина в приёмной камере",
          spec: `прозор 5–8 мм (не более ${SCREENS.maxGapMm.value} мм, ${SCREENS.maxGapMm.ref}), ручная выгрузка в контейнер — допускается при отбросах менее ${SCREENS.mechanizedFromM3Day.value} м³/сут (${SCREENS.mechanizedFromM3Day.ref})`,
          qty: "1",
          supply: "own",
        });
      } else if (ctx.scale !== "concrete") {
        items.push({
          kind: "machine",
          name: "Решётка механизированная шнековая (компактор)",
          spec: `прозор ${fine ? "2–3" : "3–6"} мм (не более ${SCREENS.maxGapMm.value} мм, ${SCREENS.maxGapMm.ref}), пропускная способность на максимальный приток ${peakText}; скорость в прозорах ${PUMP_STATIONS.screenGapVelocity.mechanized[0]}–${PUMP_STATIONS.screenGapVelocity.mechanized[1]} м/с (${PUMP_STATIONS.screenGapVelocity.ref})`,
          qty: "1 + байпас с ручной решёткой",
          supply: "supply",
          note: "Отбросы прессуются и обезвоживаются в самой решётке",
        });
      } else {
        items.push({
          kind: "machine",
          name: "Решётка механическая грабельная или ступенчатая",
          spec: `прозор ${fine ? "2–3" : "3–6"} мм (не более ${SCREENS.maxGapMm.value} мм, ${SCREENS.maxGapMm.ref}), каждая на максимальный приток ${peakText}; скорость в прозорах ${PUMP_STATIONS.screenGapVelocity.mechanized[0]}–${PUMP_STATIONS.screenGapVelocity.mechanized[1]} м/с (${PUMP_STATIONS.screenGapVelocity.ref})`,
          qty: `2 (1 раб. + 1 рез., ${PUMP_STATIONS.screenReserve.ref}) + байпасный канал с ручной решёткой`,
          supply: "supply",
        });
        items.push({
          kind: "machine",
          name: "Транспортёр-пресс отбросов",
          spec: `шнековый, обезвоживание отбросов до 35–40 % СВ (практика; ${KMK_2_04_03_19_DOC.code} задаёт плотность отбросов ${PUMP_STATIONS.screeningsDensityKgM3.value} кг/м³ и часовую неравномерность ${PUMP_STATIONS.screeningsHourlyPeak.value}, п. 5.13)`,
          qty: "1",
          supply: "supply",
        });
      }

      if (fine) {
        items.push({
          kind: "machine",
          name: "Барабанное сито (процеживатель)",
          spec: `сетка 0,5–1,0 мм, ${f(ctx.Qh, 1)} м³/ч — снятие пера, шерсти, мездры, ворса`,
          qty: ctx.scale === "concrete" ? pumpQty(1) : "1",
          supply: "supply",
          note: `Снимает ${TERTIARY_FILTERS.drumScreens.drumSsEffect[0]}–${TERTIARY_FILTERS.drumScreens.drumSsEffect[1]} % взвешенных и часть БПК до биологии (барабанные сетки, ${TERTIARY_FILTERS.drumScreens.ref})`,
        });
      }

      /* тонкая решётка перед мембранами: п. 6.16 допускает до 16 мм, для
         мембранных модулей этого мало — прозор и обоснование берутся из
         norms/uz-membrane-requirement.ts, грубая решётка по п. 6.16 остаётся
         выше по потоку и снимает крупные отбросы до тонкой */
      if (membrane) {
        items.push({
          kind: "machine",
          name: tr(
            L(
              `Тонкая решётка (сито) перед мембранным блоком, прозор ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм`,
              `Membrana blokidan oldingi nozik panjara (elak), tirqish ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm`,
              `Fine screen ahead of the membrane block, ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm openings`,
              `膜段前细格栅（筛网），缝隙 ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm`
            ),
            ctx.lang
          ),
          spec: tr(
            L(
              `перфорированное или щелевое полотно ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} мм, пропускная способность на максимальный приток ${peakText}; устанавливается после грубой решётки (${MBR_FINE_SCREEN.kmkRef}, прозор не более ${MBR_FINE_SCREEN.kmkGapMm} мм)`,
              `${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm perforatsiyali yoki tirqishli polotno, maksimal oqimga o‘tkazuvchanlik ${peakText}; qo‘pol panjaradan keyin o‘rnatiladi (${MBR_FINE_SCREEN.kmkRef}, tirqish ${MBR_FINE_SCREEN.kmkGapMm} mm dan oshmaydi)`,
              `perforated or wedge-wire panel of ${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm, sized for the peak inflow ${peakText}; installed downstream of the coarse screen (${MBR_FINE_SCREEN.kmkRef}, openings up to ${MBR_FINE_SCREEN.kmkGapMm} mm)`,
              `${MBR_FINE_SCREEN.gapMm[0]}–${MBR_FINE_SCREEN.gapMm[1]} mm 冲孔或楔形丝筛板，按峰值流量 ${peakText} 选型；设于粗格栅之后（${MBR_FINE_SCREEN.kmkRef}，缝隙不大于 ${MBR_FINE_SCREEN.kmkGapMm} mm）`
            ),
            ctx.lang
          ),
          qty: "1 + байпас",
          supply: "supply",
          note: MBR_FINE_SCREEN.source,
        });
      }

      items.push({
        kind: "structure",
        name: "Контейнер для отбросов",
        spec: "объём по недельному накоплению, закрытого типа",
        qty: "1",
        supply: "supply",
      });
      break;
    }

    /* ---------------- песколовка ---------------- */
    case "sand": {
      /* п. 6.26: песколовки обязательны при Q > 100 м³/сут, не менее двух, все рабочие */
      const gritRequired = ctx.Q > GRIT.requiredFromM3Day.value;
      const gritQty = gritRequired
        ? `${GRIT.minUnits.value} (обе рабочие, ${GRIT.minUnits.ref})`
        : `1 (при Q ≤ ${GRIT.requiredFromM3Day.value} м³/сут песколовка нормой не требуется, ${GRIT.requiredFromM3Day.ref}; принята по составу стока)`;
      const sandText = `задержание частиц от ${ctx.a.sandSize} мм (${GRIT.table28.ref})`;
      if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Песколовка тангенциальная (вертикальная)",
          spec: `${f(ctx.Qls, 1)} л/с, ${sandText}; нагрузка ${GRIT.tangentialLoad.value} ${GRIT.tangentialLoad.unit} → площадь ${f(Math.max(0.2, peak.qMax / GRIT.tangentialLoad.value), 2)} м² (${GRIT.tangentialLoad.ref})`,
          qty: gritQty,
          supply: "own",
        });
      } else if (ctx.scale === "modular") {
        items.push({
          kind: "structure",
          name: "Песколовка горизонтальная",
          spec: `${f(ctx.Qls, 1)} л/с, ${sandText}; скорость потока ${GRIT.table28.horizontal.vMinLps}–${GRIT.table28.horizontal.vMaxLps} м/с (табл. 28), пребывание не менее ${GRIT.horizontalMinRetentionS.value} с (${GRIT.horizontalMinRetentionS.ref}); отделения с возможностью отключения`,
          qty: gritQty,
          supply: "either",
        });
      } else {
        items.push({
          kind: "structure",
          name: "Песколовка аэрируемая",
          spec: `${f(ctx.Qls, 1)} л/с, ${sandText}; скорость ${GRIT.table28.aerated.vMaxLps[0]}–${GRIT.table28.aerated.vMaxLps[1]} м/с (табл. 28), интенсивность аэрации ${GRIT.aeratedIntensity.value[0]}–${GRIT.aeratedIntensity.value[1]} ${GRIT.aeratedIntensity.unit} (${GRIT.aeratedIntensity.ref})`,
          qty: gritQty,
          supply: "supply",
          note: `Аэрация отмывает песок от органики — содержание песка в осадке ${GRIT.table28.aerated.sandInSediment[0]}–${GRIT.table28.aerated.sandInSediment[1]} % (табл. 28), осадок не загнивает`,
        });
      }

      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Эрлифт удаления песка" : "Насос песковый (гидроэлеватор)",
        spec: "откачка пульпы на обезвоживание",
        qty: ctx.scale === "concrete" ? pumpQty(1) : "1",
        supply: "supply",
      });

      if (ctx.scale !== "compact") {
        items.push({
          kind: "machine",
          name: "Классификатор (пескопромыватель) с бункером",
          spec: `отмывка песка до содержания песка в осадке ${GRIT.table28.aerated.sandInSediment[0]}–${GRIT.table28.aerated.sandInSediment[1]} % (табл. 28), обезвоживание; песковые площадки — не более ${GRIT.sandBedLoad.value} ${GRIT.sandBedLoad.unit} (${GRIT.sandBedLoad.ref})`,
          qty: "1",
          supply: "supply",
        });
      }
      break;
    }

    /* ---------------- усреднитель ---------------- */
    case "avg": {
      const V = ctx.vAvg ?? 0;
      items.push({
        kind: "structure",
        name: "Усреднитель-накопитель",
        spec: `рабочий объём ${f(V)} м³; ${tr(SCALE_LABEL[ctx.scale], ctx.lang)}`,
        qty: `${EQUALIZATION.minSections.value} секции, обе рабочие (${EQUALIZATION.minSections.ref})`,
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Барботажная система перемешивания" : "Мешалка погружная (или барботаж)",
        spec:
          ctx.scale === "compact"
            ? `расход воздуха ${ctx.a.mixAirRate} м³/(м³·ч) — около ${f(V * ctx.a.mixAirRate)} м³/ч`
            : `удельная мощность ${ctx.a.mixPower} Вт/м³ — около ${f((V * ctx.a.mixPower) / 1000, 1)} кВт`,
        qty: ctx.scale === "concrete" ? "2" : "1",
        supply: "supply",
        note: `Без перемешивания взвешенные осаждаются, а органика в осадке загнивает. Удельные величины — Metcalf & Eddy; ${KMK_2_04_03_19_DOC.code} задаёт барботаж на 1 м барботёра: ${EQUALIZATION.bubblerIntensity.wall}/${EQUALIZATION.bubblerIntensity.middle} ${EQUALIZATION.bubblerIntensity.unit} (${EQUALIZATION.bubblerIntensity.ref}), барботаж — при ВВ до ${EQUALIZATION.bubblingUpToSsMgL.value} мг/л (${EQUALIZATION.bubblingUpToSsMgL.ref})`,
      });
      items.push({
        kind: "machine",
        name: "Насосная группа подачи на очистку",
        spec: `равномерная подача ${f(ctx.Qh, 1)} м³/ч, регулирование частотным преобразователем`,
        qty: pumpQty(1),
        supply: "supply",
        note: "Смысл усреднителя — постоянный расход на последующие ступени",
      });
      items.push({
        kind: "instrument",
        name: "Датчики уровня и pH",
        spec: "гидростатический уровнемер, сигнализация верхнего и нижнего уровня, pH-метр",
        qty: "комплект",
        supply: "supply",
      });
      break;
    }

    /* ---------------- жироуловитель ---------------- */
    case "grease": {
      items.push({
        kind: "structure",
        name: "Жироуловитель гравитационный",
        spec: `${f(ctx.Qh, 1)} м³/ч, расчёт по EN 1825 (в ${KMK_2_04_03_19_DOC.code} жироуловители не нормируются); жиры ${f(ctx.fats)} → не более ${ctx.a.greaseTarget} мг/л перед биологией`,
        qty: "1",
        supply: ctx.scale === "concrete" ? "either" : "own",
      });
      if (ctx.scale !== "compact") {
        items.push({
          kind: "machine",
          name: "Скребковый механизм сбора жира",
          spec: "поверхностный скребок с приводом, отвод в жиросборник",
          qty: "1",
          supply: "supply",
          note: "На расходах свыше ~15 м³/ч ручной сбор жира нереалистичен",
        });
        items.push({
          kind: "structure",
          name: "Жиросборник",
          spec: "объём по недельному накоплению, с подогревом для откачки",
          qty: "1",
          supply: "either",
        });
      }
      break;
    }

    /* ---------------- нефтеуловитель ---------------- */
    case "oil": {
      items.push({
        kind: "structure",
        name: "Нефтеуловитель с тонкослойными модулями",
        spec: `NS ${f(ctx.Qls, 1)} л/с по EN 858 (в ${KMK_2_04_03_19_DOC.code} расчёт по капле не нормируется), всплытие капли ${ctx.a.oilDroplet} мкм; нефтепродукты ${f(ctx.petro)} → 0,3 мг/л`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Коалесцентный модуль",
        spec: "сменный блок, укрупнение эмульгированных капель",
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Сорбционный фильтр доочистки",
        spec: "загрузка сорбентом, доведение нефтепродуктов до 0,05–0,3 мг/л",
        qty: "1",
        supply: "either",
        note: "Требуется при сбросе в водоём; расход сорбента — по фактической нагрузке",
      });
      items.push({
        kind: "instrument",
        name: "Сигнализатор уровня нефтепродукта",
        spec: "датчик толщины слоя, вывод сигнала на диспетчеризацию",
        qty: "1",
        supply: "supply",
      });
      break;
    }

    /* ---------------- нейтрализация ---------------- */
    case "neutral": {
      items.push({
        kind: "structure",
        name: "Камера нейтрализации с мешалкой",
        spec: `время пребывания 10–20 мин (практика; ${KMK_2_04_03_19_DOC.code} время в камере не нормирует), объём ${f(Math.max(1, ctx.Qh * 0.25), 1)} м³; нейтрализация при pH < 6,5 и > 8,5 (${kmkRef("6.258")})`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Станция дозирования кислоты и щёлочи",
        spec: `два контура: серная кислота и NaOH или известковое молоко 5 % CaO (${kmkRef("6.260")}–6.261; доза — по уравнению реакции с запасом 10 %, п. 6.259), баки с обваловкой`,
        qty: `${pumpQty(1)} на каждый реагент`,
        supply: "supply",
      });
      items.push({
        kind: "instrument",
        name: "pH-метры промышленные",
        spec: "на входе и выходе камеры, регулирование дозы по обратной связи",
        qty: "2",
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Склад реагентов с поддонами и аварийным душем",
        spec: `запас не менее 15 суток (известь — ${kmkRef("6.385")}), вентиляция, поддон на полный объём наибольшей ёмкости`,
        qty: "1",
        supply: "either",
        note: "Требование промышленной безопасности при работе с кислотами и щелочами",
      });
      break;
    }

    /* ---------------- реагентная обработка ---------------- */
    case "physchem": {
      items.push({
        kind: "structure",
        name: "Камера быстрого смешения",
        spec: `время 1–2 мин, градиент скорости G = ${REAGENTS.gradientG.mixerCoag} с⁻¹ с коагулянтом, ${REAGENTS.gradientG.mixerFloc[0]}–${REAGENTS.gradientG.mixerFloc[1]} с⁻¹ с флокулянтом (${REAGENTS.gradientG.ref}), объём ${f(Math.max(0.5, ctx.Qh / 40), 1)} м³`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "structure",
        name: "Камера хлопьеобразования",
        spec: `время ${REAGENTS.flocculationMin.settlingCoag[0]}–${REAGENTS.flocculationMin.settlingCoag[1]} мин с коагулянтом, ${REAGENTS.flocculationMin.settlingFloc[0]}–${REAGENTS.flocculationMin.settlingFloc[1]} мин с флокулянтом перед отстаиванием (${REAGENTS.flocculationMin.ref}); G = ${REAGENTS.gradientG.flocSettling[0]}–${REAGENTS.gradientG.flocSettling[1]} с⁻¹ (${REAGENTS.gradientG.ref}); объём ${f(Math.max(1, ctx.Qh * 0.35), 1)} м³ (21 мин), тихоходная мешалка`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Станция приготовления и дозирования коагулянта",
        spec: `доза ${ctx.a.coagDose} г/м³ (${REAGENTS.table61Municipal.ref}; уточняется пробным коагулированием; соли Al при pH ≤ ${REAGENTS.coagulantByPh.alUpToPh}, соли Fe при большем — ${REAGENTS.coagulantByPh.ref}) — ${f((ctx.Q * ctx.a.coagDose) / 1000, 1)} кг/сут`,
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Автоматическая станция приготовления флокулянта",
        spec: `трёхкамерная, доза ${ctx.a.flocDose} г/м³ (${REAGENTS.table61Municipal.ref}) — ${f((ctx.Q * ctx.a.flocDose) / 1000, 2)} кг/сут по сухому продукту`,
        qty: "1",
        supply: "supply",
        note: "Полимер требует созревания 40–60 мин, ручное приготовление нестабильно",
      });
      items.push({
        kind: "structure",
        name: "Отстойник-осветлитель с тонкослойными модулями",
        spec: `гидравлическая нагрузка 1,5–2,5 м³/(м²·ч) (практика для тонкослойных модулей; ${KMK_2_04_03_19_DOC.code} считает отстойники по ф. (36)–(37) п. 6.62 через K_set и u₀) → площадь ${f(ctx.Qh / 2, 1)} м²`,
        qty: "1",
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      break;
    }

    /* ---------------- флотация ---------------- */
    case "daf": {
      const area = ctx.Qh / ctx.a.dafLoad;
      items.push({
        kind: "structure",
        name: "Флотатор напорный (DAF)",
        spec: `нагрузка ${ctx.a.dafLoad} м³/(м²·ч) (${FLOTATION.hydraulicLoad.value[0]}–${FLOTATION.hydraulicLoad.value[1]}, ${FLOTATION.hydraulicLoad.ref}) → площадь ${f(area, 1)} м²; рабочая глубина ${FLOTATION.workingDepthM.value[0]}–${FLOTATION.workingDepthM.value[1]} м; пребывание ${FLOTATION.pressureRetentionMin.value[0]}–${FLOTATION.pressureRetentionMin.value[1]} мин (${FLOTATION.pressureRetentionMin.ref}); рециркуляция ${ctx.a.dafRecycle} % (практика, для воды нормой не задана)`,
        qty: `${FLOTATION.minChambers.value} камеры (${FLOTATION.minChambers.ref})`,
        supply: "either",
      });
      items.push({
        kind: "machine",
        name: "Сатуратор с рециркуляционным насосом",
        spec: `давление насыщения 4–6 бар (практика; ${KMK_2_04_03_19_DOC.code} для флотационного илоуплотнения — ${SLUDGE.flotationThickener.pressureMPa} МПа, п. 6.354), рециркуляция ${f((ctx.Qh * ctx.a.dafRecycle) / 100, 1)} м³/ч`,
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Компрессор воздуха для сатуратора",
        spec: "безмасляный, подача по расходу рециркуляции",
        qty: "2 (1 раб. + 1 рез.)",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Скребковый механизм флотошлама",
        spec: "поверхностный и донный скребки, отвод шлама в сборник",
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Сборник флотошлама",
        spec: `объём на 2–3 суток (практика), влажность пены ${FLOTATION.foamMoisture.value[0]}–${FLOTATION.foamMoisture.value[1]} % (${FLOTATION.foamMoisture.ref}); подача на обезвоживание`,
        qty: "1",
        supply: "own",
      });
      break;
    }

    /* ---------------- биологическая очистка ---------------- */
    case "bio": {
      const V = ctx.vBio ?? 0;
      const air = ctx.air ?? 0;
      const deNitro = ctx.tn > ctx.a.denitroTn;
      const ext = AEROTANK.extendedAeration;
      /* технология, выбранная инженером; null — автоподбор по расходу и нагрузке */
      const tech = ctx.tech && ctx.tech !== "OTHER" ? ctx.tech : null;
      const anaerobic = isAnaerobicTechnology(tech ?? undefined);
      /* автоподбор в блочном исполнении — полное окисление (п. 6.175);
         во всех остальных случаях (в том числе при явно выбранной технологии)
         удельный расход кислорода — по ф. (70) п. 6.156, как в calculations/technology.ts */
      const qO = !tech && ctx.scale === "compact" ? ext.qO : AEROTANK.air.qO.toBod15_20;
      const qORef = !tech && ctx.scale === "compact" ? ext.ref : AEROTANK.air.ref;
      const bod5Ratio = ctx.a.bod5Ratio || 0.68;
      const bodFullLoad = ctx.bodLoad / bod5Ratio;
      const o2Kg = bodFullLoad * qO;
      const techNote = tech ? technologySourceNote(tech, ctx.lang) : "";

      if (tech) {
        /* --- технология задана инженером: состав по calculations/technology.ts --- */
        const r = ctx.techResult;
        const metrics = (r?.specialized ?? [])
          .filter((m) => m.key !== "air" && m.key !== "airPerReactor" && m.key !== "oxygen")
          .map((m) => `${m.label} ${f(m.value, 2)} ${m.unit}`)
          .join("; ");
        items.push({
          kind: "structure",
          name: tr(TECHNOLOGY_LABEL[tech], ctx.lang),
          spec:
            `рабочий объём ${f(V)} м³` +
            (r ? ` (гидравлический ${f(r.hydraulic.hydraulicVolume)} м³ при HRT ${r.hydraulic.hrt} ч и запасе +15 %)` : "") +
            (deNitro && !anaerobic ? `; аноксидная зона ${f((V * ctx.a.denitroShare) / 100)} м³ (${ctx.a.denitroShare} %)` : "") +
            (metrics ? `; ${metrics}` : "") +
            `; ${tr(SCALE_LABEL[ctx.scale], ctx.lang)}`,
          qty: anaerobic
            ? `по расчёту технологии (число секций ${KMK_2_04_03_19_DOC.code} для анаэробных реакторов не нормирует)`
            : `не менее ${AEROTANK.minSections.value} секций (${AEROTANK.minSections.ref}; рабочая глубина ${AEROTANK.depthM.value[0]}–${AEROTANK.depthM.value[1]} м)`,
          supply: ctx.scale === "concrete" ? "supply" : "own",
          note: `Технология принята инженером. ${techNote}`,
        });

        /* позиции самой технологии. Исключены: сам реактор (выведен выше),
           вторичный отстойник (отдельная ступень clarify), а также аэрация,
           воздуходувки и возвратный ил — они выводятся ниже со ссылками на
           ҚМҚ 2.04.03-19 (ф. (70) п. 6.156, п. 5.29, п. 5.34, ф. (56) п. 6.145). */
        const SKIP = membrane
          ? /воздуходувк|аэрац|возвратн|реактор|аэротенк|отстойник|биогаз|мембранн|промывк/i
          : /воздуходувк|аэрац|возвратн|реактор|аэротенк|отстойник|биогаз/i;
        for (const e of (r?.equipment ?? []).filter((e) => !SKIP.test(e.position))) {
          const structure = /камер|перегородк|ёмкост/i.test(e.position);
          const instrument = /автоматик|контрол|управлен/i.test(e.position);
          items.push({
            kind: instrument ? "instrument" : structure ? "structure" : "machine",
            name: e.position,
            spec: `${e.parameter} (${e.status.toLowerCase()})`,
            qty: e.quantity,
            supply: "supply",
            note: tr(TECH_NOT_NORMED, ctx.lang),
          });
        }

        /* --- мембранный блок: модули, CIP и пермеатные насосы ---
           Всё покупное (раздел B). Площадь мембран и поток берутся из
           расчёта технологии, срок службы модулей и состав узлов — из
           norms/uz-membrane-requirement.ts; ҚМҚ 2.04.03-19 этого не нормирует. */
        if (membrane) {
          const areaMetric = r?.specialized.find((m) => m.key === "membraneArea");
          const fluxMetric = r?.specialized.find((m) => m.key === "membraneFlux");
          const areaText = areaMetric ? `площадь мембран ${f(areaMetric.value)} ${areaMetric.unit}` : "площадь мембран по расчёту технологии";
          const fluxText = fluxMetric ? `, удельный поток ${f(fluxMetric.value, 1)} ${fluxMetric.unit}` : "";
          const life = `${MBR_AUXILIARY.membraneLifeYears[0]}–${MBR_AUXILIARY.membraneLifeYears[1]}`;

          items.push({
            kind: "machine",
            name: tr(
              L("Мембранные модули погружного типа", "Botiriladigan turdagi membrana modullari", "Immersed membrane modules", "浸没式膜组件"),
              ctx.lang
            ),
            spec: tr(
              L(
                `${areaText}${fluxText}; модули погружены в биореактор и заменяют вторичный отстойник`,
                `${areaText}${fluxText}; modullar bioreaktorga botirilgan va ikkilamchi tindirgich o‘rnini bosadi`,
                `${areaText}${fluxText}; the modules are immersed in the bioreactor and replace the secondary clarifier`,
                `${areaText}${fluxText}；膜组件浸没于生物反应器内，取代二沉池`
              ),
              ctx.lang
            ),
            qty: r?.equipment.find((e) => /мембранные модули/i.test(e.position))?.quantity ?? "комплект",
            supply: "supply",
            note: `${MBR_AUXILIARY.note} Срок службы модулей ${life} лет — паспортные данные производителя. ${tr(MEMBRANE_BY_DATASHEET, ctx.lang)}.`,
          });

          if (MBR_AUXILIARY.cipRequired) {
            items.push({
              kind: "machine",
              name: tr(
                L(
                  "Станция химической промывки мембран (CIP)",
                  "Membranalarni kimyoviy yuvish stansiyasi (CIP)",
                  "Membrane cleaning-in-place station (CIP)",
                  "膜化学清洗（CIP）装置"
                ),
                ctx.lang
              ),
              spec: tr(
                L(
                  "ёмкости раствора гипохлорита и лимонной кислоты, дозирующие насосы, обвязка обратной промывки; периодичность и концентрации — по регламенту производителя мембран",
                  "gipoxlorit va limon kislotasi eritmasi rezervuarlari, dozalash nasoslari, teskari yuvish quvurlari; davriylik va konsentratsiyalar — membrana ishlab chiqaruvchisi reglamenti bo‘yicha",
                  "hypochlorite and citric-acid solution tanks, dosing pumps and backwash piping; frequency and concentrations follow the membrane supplier's protocol",
                  "次氯酸钠与柠檬酸药箱、计量泵及反洗管路；清洗周期与药剂浓度按膜厂家规程确定"
                ),
                ctx.lang
              ),
              qty: "1 комплект",
              supply: "supply",
              note: `${MBR_AUXILIARY.note} ${tr(MEMBRANE_BY_DATASHEET, ctx.lang)}.`,
            });
          }

          items.push({
            kind: "machine",
            name: tr(
              L("Насосы пермеата (отвода фильтрата)", "Permeat (filtrat) nasoslari", "Permeate pumps", "产水（透过液）泵"),
              ctx.lang
            ),
            spec: tr(
              L(
                `подача по расчётному расходу мембранного блока ${f(ctx.Qh, 1)} м³/ч, работа под вакуумом с реверсом на обратную промывку; регулирование частотным преобразователем`,
                `membrana bloki hisobiy sarfi bo‘yicha ${f(ctx.Qh, 1)} m³/soat, vakuum ostida teskari yuvishga reversli ishlash; chastota o‘zgartirgich bilan boshqariladi`,
                `sized for the membrane block flow of ${f(ctx.Qh, 1)} m³/h, suction operation with reversal for backwash; variable-frequency control`,
                `按膜段计算流量 ${f(ctx.Qh, 1)} m³/h 选型，抽吸运行并可反转反洗；变频调节`
              ),
              ctx.lang
            ),
            qty: pumpQty(1),
            supply: "supply",
            note: `${MBR_AUXILIARY.note} ${tr(MEMBRANE_BY_DATASHEET, ctx.lang)}.`,
          });
        }
      } else if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Блочная установка биологической очистки на полное окисление (MBBR/SBR)",
          spec: `расчётный объём ${f(V)} м³, нагрузка ${ctx.a.bodVolLoad} кг БПК₅/(м³·сут) — из скорости окисления ρ = ${ext.rho} мг БПКполн/(г·ч), дозы ила ${ext.doseGL[0]}–${ext.doseGL[1]} г/л, зольности ${ext.ash} (${ext.ref}); полная заводская готовность`,
          qty: "1",
          supply: "own",
        });
      } else {
        items.push({
          kind: "structure",
          name: `Аэротенк${deNitro ? " с зоной денитрификации" : ""}`,
          spec:
            `рабочий объём ${f(V)} м³` +
            (deNitro ? `, из них аноксидная зона ${f((V * ctx.a.denitroShare) / 100)} м³ (${ctx.a.denitroShare} %)` : "") +
            `; ${tr(SCALE_LABEL[ctx.scale], ctx.lang)}`,
          qty: `${AEROTANK.minSections.value} секции (${AEROTANK.minSections.ref}; рабочая глубина ${AEROTANK.depthM.value[0]}–${AEROTANK.depthM.value[1]} м)`,
          supply: ctx.scale === "concrete" ? "supply" : "own",
        });
        items.push({
          kind: "machine",
          name: "Загрузка MBBR или мембранный модуль MBR",
          spec:
            "MBBR: степень заполнения 30–50 % объёма аэробной зоны; " +
            "MBR: удельный поток 8–12 л/(м²·ч) — выбор по требуемому качеству и площади",
          qty: "комплект",
          supply: "supply",
          note: `MBBR устойчив к перегрузкам, MBR даёт воду под доочистку и оборот без отстойника (параметры загрузки и мембран в ${KMK_2_04_03_19_DOC.code} не нормируются)`,
        });
      }

      if (!anaerobic) {
        items.push({
          kind: "machine",
          name: "Аэрационная система мелкопузырчатая",
          spec: `мембранные диспергаторы (дисковые или трубчатые), потребность воздуха ${f(air)} м³/ч; кислород ${f(o2Kg)} кг O₂/сут при q_O = ${qO} мг O₂/мг снятой БПКполн (${qORef}); расход воздуха — ф. (70) п. 6.156`,
          qty: "комплект по площади дна",
          supply: "supply",
          note: tech ? `Расход воздуха получен расчётом технологии ${tech} по ф. (70) п. 6.156` : undefined,
        });
        const blowerReliability = `Воздуходувная станция — ${PUMP_STATIONS.blowerStationCategory.value} категория надёжности электроснабжения (${PUMP_STATIONS.blowerStationCategory.ref}): перерыв подачи воздуха не допускается`;
        items.push({
          kind: "machine",
          name: membrane
            ? tr(
                L(
                  "Воздуходувки технологического воздуха (аэрация биореактора)",
                  "Texnologik havo puflagichlari (bioreaktor aeratsiyasi)",
                  "Process-air blowers (bioreactor aeration)",
                  "工艺空气鼓风机（生物池曝气）"
                ),
                ctx.lang
              )
            : ctx.scale === "concrete"
            ? "Воздуходувки (турбокомпрессоры)"
            : "Воздуходувки роторные или винтовые",
          spec: `подача ${f(air)} м³/ч, напор ${ctx.a.blowerPressure} кПа (потери в мелкопузырчатых аэраторах до ${PUMP_STATIONS.diffuserLossKPa.fine} кПа, ${PUMP_STATIONS.diffuserLossKPa.ref}); регулирование частотой по датчику кислорода`,
          qty: blowerQty(ctx.scale === "concrete" ? 2 : 1),
          supply: "supply",
          note: membrane
            ? `${blowerReliability}. Это только технологический воздух на окисление; воздух на продувку мембран подаётся отдельными воздуходувками (позиция ниже) — это разные подачи, складывать их нельзя`
            : blowerReliability,
        });
        /* продувка мембран — отдельная подача воздуха: расход, режим (постоянный
           или циклический) и напор задаёт производитель модуля; ҚМҚ 2.04.03-19
           этой величины не нормирует, поэтому числа здесь не приводятся */
        if (membrane) {
          items.push({
            kind: "machine",
            name: tr(
              L(
                "Воздуходувки продувки мембран (мембранный скауринг)",
                "Membranalarni puflash havo puflagichlari (membrana skauringi)",
                "Membrane scour blowers",
                "膜擦洗鼓风机"
              ),
              ctx.lang
            ),
            spec: tr(
              L(
                `отдельная подача воздуха на продувку мембранных модулей: расход, напор и режим (постоянный или циклический) — по паспорту выбранного модуля, ${KMK_2_04_03_19_DOC.code} эту величину не нормирует`,
                `membrana modullarini puflash uchun alohida havo: sarf, bosim va rejim (doimiy yoki siklik) — tanlangan modul pasporti bo‘yicha, ${KMK_2_04_03_19_DOC.code} bu kattalikni me’yorlamaydi`,
                `a separate air supply for scouring the membrane modules: flow, pressure and regime (continuous or cyclic) come from the selected module's datasheet; ${KMK_2_04_03_19_DOC.code} does not cover this value`,
                `膜组件擦洗用独立供气：风量、风压与运行方式（连续或间歇）按所选膜组件样本确定；${KMK_2_04_03_19_DOC.code} 未作规定`
              ),
              ctx.lang
            ),
            qty: blowerQty(1),
            supply: "supply",
            note: `${blowerReliability}. ${tr(MEMBRANE_BY_DATASHEET, ctx.lang)}`,
          });
        }
      } else {
        items.push({
          kind: "machine",
          name: "Система сбора и отвода биогаза",
          spec:
            `газосборные колпаки реактора, гидрозатвор, конденсатоотводчик, счётчик газа` +
            (ctx.techResult?.specialized.find((m) => m.key === "biogas")
              ? `; расчётный выход ${f(ctx.techResult.specialized.find((m) => m.key === "biogas")!.value, 1)} Нм³/сут`
              : ""),
          qty: "комплект",
          supply: "supply",
          note: `Аэрация не требуется — процесс анаэробный, воздуходувной станции нет. Анаэробные реакторы ${KMK_2_04_03_19_DOC.code} не нормирует; газовый тракт выполняется по правилам промышленной безопасности для горючих газов`,
        });
        items.push({
          kind: "machine",
          name: "Факел (свеча рассеивания) с огнепреградителем",
          spec: "аварийное сжигание биогаза при отсутствии потребителя; продувка азотом при пуске",
          qty: "1",
          supply: "supply",
          note: tr(TECH_NOT_NORMED, ctx.lang),
        });
        items.push({
          kind: "machine",
          name: "Насосы рециркуляции и подачи в реактор",
          spec: "поддержание восходящей скорости и перемешивания слоя биомассы; регулирование частотным преобразователем",
          qty: pumpQty(1),
          supply: "supply",
          note: `Возвратного активного ила в анаэробной схеме нет — биомасса удерживается в реакторе (гранулы, перегородки или мембрана)`,
        });
      }
      if (deNitro && !anaerobic) {
        items.push({
          kind: "machine",
          name: "Мешалки аноксидной зоны и насосы рециркуляции нитратной смеси",
          spec: "рециркуляция 200–400 % от расчётного расхода; мешалки погружные тихоходные",
          qty: pumpQty(1),
          supply: "supply",
        });
      }
      if (!anaerobic) {
        items.push({
          kind: "machine",
          name: "Насосы возвратного активного ила",
          spec:
            `рециркуляция ила ${ctx.a.sludgeReturn} % — ${f((ctx.Qh * ctx.a.sludgeReturn) / 100, 1)} м³/ч (R = a/(1000/J − a), ${AEROTANK.recirculation.ref}; не менее ${AEROTANK.recirculation.minGravity * 100} % при самотёчном удалении ила)` +
            (tech === "SBR" || tech === "MBR" ? "; в схеме без вторичного отстойника — внутренняя рециркуляция иловой смеси на тот же расход" : ""),
          qty: pumpQty(1),
          supply: "supply",
        });
      }
      items.push({
        kind: "instrument",
        name: "Контроль процесса",
        spec: anaerobic
          ? "датчики pH, ОВП, температуры, уровня; контроль щёлочности и ЛЖК, анализ состава биогаза (CH₄, H₂S), газоанализатор в помещении"
          : "датчики растворённого кислорода, дозы ила (MLSS), температуры" + (deNitro ? ", нитратов и ОВП" : ""),
        qty: "комплект",
        supply: "supply",
      });
      if (!anaerobic && ctx.bod > 0 && ctx.tn > 0 && ctx.bod / Math.max(ctx.tn, 1) < ctx.a.bodTnRatio) {
        items.push({
          kind: "machine",
          name: "Станция дозирования органического субстрата",
          spec: `соотношение БПК : N = ${(ctx.bod / Math.max(ctx.tn, 1)).toFixed(1)} : 1 — для денитрификации нужно не менее ${ctx.a.bodTnRatio} : 1 (DWA-A 131; ${KMK_2_04_03_19_DOC.code} нормирует только биогены: ${BIO_N_TEXT})`,
          qty: pumpQty(1),
          supply: "supply",
          note: "Без внешнего источника углерода (ацетат, меласса) азот до норматива не снять",
        });
      }
      break;
    }

    /* ---------------- вторичное отстаивание ---------------- */
    case "clarify": {
      /* п. 6.58: вторичных отстойников не менее трёх, все рабочие; при минимальном
         числе расчётный объём ×1,2–1,3. Принято: modular/concrete — 3 отстойника с
         площадью ×1,3 (верхняя граница, так как число минимальное); compact — один
         отстойник в составе блока с тем же запасом ×1,3 и явной пометкой об отступлении. */
      const kMin = PRIMARY_SETTLING.minCountVolumeFactor.value[1];
      const areaTotal = (ctx.Qh / ctx.a.clarifyLoad) * kMin;
      if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Вторичный отстойник с тонкослойными модулями",
          spec: `нагрузка ${ctx.a.clarifyLoad} м³/(м²·ч) (ф. (85) п. 6.170) → площадь зеркала ${f(areaTotal, 1)} м² с запасом ×${kMin}; отстаивание не менее ${AEROTANK.extendedAeration.settlingMinHoursAtMaxFlow} ч при максимальном притоке (${AEROTANK.extendedAeration.ref}); в составе блока`,
          qty: `1 (отступление от ${PRIMARY_SETTLING.minSecondary.ref}: не менее ${PRIMARY_SETTLING.minSecondary.value} — компенсировано запасом объёма ×${kMin}, блочная установка полного окисления)`,
          supply: "own",
        });
      } else {
        items.push({
          kind: "structure",
          name: ctx.scale === "concrete" ? "Вторичный отстойник радиальный" : "Вторичный отстойник вертикальный",
          spec: `нагрузка ${ctx.a.clarifyLoad} м³/(м²·ч) (ф. (85) п. 6.170) → суммарная площадь ${f(areaTotal, 1)} м² (×${kMin} при минимальном числе, ${PRIMARY_SETTLING.minCountVolumeFactor.ref}), по ${f(areaTotal / PRIMARY_SETTLING.minSecondary.value, 1)} м² каждый; иловый приямок (пребывание ила не более ${SECONDARY_HOPPER_H} ч, п. 6.66); нагрузка на водослив не более 8–10 л/(с·м) (п. 6.172)`,
          qty: `${PRIMARY_SETTLING.minSecondary.value} (все рабочие, ${PRIMARY_SETTLING.minSecondary.ref})`,
          supply: ctx.scale === "concrete" ? "supply" : "own",
        });
        items.push({
          kind: "machine",
          name: ctx.scale === "concrete" ? "Илосос с приводом" : "Скребковый механизм",
          spec: "сбор ила с днища, удаление плавающих веществ с поверхности",
          qty: "по числу отстойников",
          supply: "supply",
        });
      }
      items.push({
        kind: "machine",
        name: "Насосы избыточного ила",
        spec: `отвод прироста ила на уплотнение, ${f(Math.max(0.5, (ctx.dryKg ?? ctx.bodLoad) / (10 * ctx.a.sludgeDs)), 1)} м³/сут`,
        qty: pumpQty(1),
        supply: "supply",
      });
      break;
    }

    /* ---------------- доочистка ---------------- */
    case "post": {
      const reuse = ctx.dischargeId === "reuse";
      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Фильтр доочистки напорный" : "Фильтры скорые песчаные однослойные",
        spec: `скорость фильтрования ${ctx.a.filterRate} м/ч (${T58.vNormal[0]}–${T58.vNormal[1]} нормальный, ${T58.vForced[0]}–${T58.vForced[1]} форсированный режим, ${TERTIARY_FILTERS.table58.ref}) → площадь ${f(ctx.Qh / ctx.a.filterRate, 1)} м²; слой кварцевого песка ${T58.layerM[0]}–${T58.layerM[1]} м; эффект по ВВ ${T58.effectSs[0]}–${T58.effectSs[1]} %, по БПК ${T58.effectBod[0]}–${T58.effectBod[1]} %`,
        qty: ctx.scale === "compact" ? "1" : "2 (поочерёдная промывка)",
        supply: "either",
      });
      items.push({
        kind: "machine",
        name: "Система промывки фильтров",
        spec: `насос промывной воды, воздуходувка водовоздушной промывки, резервуар промывной воды не менее чем на ${TERTIARY_FILTERS.washTanksMinWashes.value} промывки (${TERTIARY_FILTERS.washTanksMinWashes.ref})`,
        qty: "комплект",
        supply: "supply",
        note: `Промывные воды возвращаются в усреднитель — это ${ctx.a.backwashShare} % расхода, учтите в балансе`,
      });
      if (ctx.cod > 500 || ["textile-dye", "leather", "chemical", "printing"].includes(ctx.industryId)) {
        items.push({
          kind: "machine",
          name: "Сорбционный фильтр с активированным углём",
          spec: "снятие остаточной цветности и трудноокисляемой органики (ХПК)",
          qty: "1",
          supply: "supply",
          note: "Расход угля определяется опытной фильтрацией; предусмотреть регенерацию или замену",
        });
      }
      if (reuse) {
        items.push({
          kind: "machine",
          name: "Ультрафильтрация и обратный осмос",
          spec: "глубокое обессоливание для возврата в техпроцесс; концентрат 15–25 % расхода",
          qty: "комплект",
          supply: "supply",
          note: "Концентрат RO — отдельная задача: накопитель и вывоз либо выпаривание",
        });
      }
      break;
    }

    /* ---------------- обеззараживание ---------------- */
    case "disinfect": {
      const uv = ctx.dischargeId === "water" || ctx.dischargeId === "reuse" || ctx.scale === "concrete";
      const chlorDose = ctx.industryId === "hospital" ? ctx.a.chlorDoseHospital : ctx.a.chlorDose;
      const storeK = ctx.a.chlorStorageFactor ?? DISINFECTION.chlorineDose.storageFactor;
      if (uv) {
        items.push({
          kind: "machine",
          name: "Ультрафиолетовая установка обеззараживания",
          spec: `доза не менее ${ctx.a.uvDose} мДж/см² (практика; ${DISINFECTION.uvAllowed.ref} допускает УФ, дозу не нормирует) при пропускной способности ${f(ctx.Qh, 1)} м³/ч; лоточное или напорное исполнение`,
          qty: "1 (с резервным блоком ламп)",
          supply: "supply",
          note: "Без реагентов и без хлорорганики; требует прозрачности воды и регулярной чистки кварцевых чехлов",
        });
      }
      items.push({
        kind: "machine",
        name: "Установка получения гипохлорита натрия (электролизная)",
        spec: `доза активного хлора ${chlorDose} г/м³ (${ctx.industryId === "hospital" ? `санитарные требования для медицинских объектов; ${DISINFECTION.chlorineDose.ref} — ${DISINFECTION.chlorineDose.afterBio} г/м³ после биологической очистки` : `${DISINFECTION.chlorineDose.afterBio} после биологической, ${DISINFECTION.chlorineDose.afterPartialBio} после неполной биологической, ${DISINFECTION.chlorineDose.afterMechanical} после механической очистки, ${DISINFECTION.chlorineDose.ref}`}) → ${f((ctx.Q * chlorDose) / ctx.hours, 1)} г/ч; хлорное хозяйство на ×${storeK} — ${f((ctx.Q * chlorDose * storeK) / ctx.hours, 1)} г/ч (п. 6.230); остаточный хлор не менее ${DISINFECTION.chlorineDose.residualMin} г/м³`,
        qty: "1",
        supply: "own",
        note: uv ? "Резервный способ обеззараживания к УФ и для промывок" : "Основное обеззараживание",
      });
      items.push({
        kind: "structure",
        name: "Контактный резервуар",
        spec: `время контакта не менее ${ctx.a.contactTime} мин (${DISINFECTION.contactMinutes.ref}) → объём ${f((ctx.Qh * ctx.a.contactTime) / 60, 1)} м³; как первичный отстойник без скребков, барботаж ${DISINFECTION.contactAeration.value} ${DISINFECTION.contactAeration.unit} (${DISINFECTION.contactTanksMin.ref})`,
        qty: `${DISINFECTION.contactTanksMin.value} (${DISINFECTION.contactTanksMin.ref})`,
        supply: "own",
        note: `Обязателен при хлорировании; при УФ не требуется. Осадок ${DISINFECTION.contactSludgeLPerM3.afterBio} л/м³ после биологической очистки (${DISINFECTION.contactSludgeLPerM3.ref})`,
      });
      break;
    }

    /* ---------------- обработка осадка ---------------- */
    case "sludge": {
      const dry = ctx.dryKg ?? 0;
      const vol = dry / (10 * ctx.a.sludgeDs);
      const th = SLUDGE.thickener;
      const radial = ctx.scale === "concrete";
      const thHours = radial ? th.hoursRadial : th.hoursVertical;
      const thOut = radial ? th.moistureOutRadial : th.moistureOutVertical;
      const thVol = vol * th.designFactor;
      const st = SLUDGE.aerobicStabilization;
      /* избыточный ил без первичных отстойников: ближайший нормативный случай —
         смесь первичного осадка и уплотнённого ила, 5,5 сут при 18 °C (верхняя граница п. 6.373) */
      const stDays = st.daysAt18C.primaryPlusThickenedExcess;
      const stVol = vol * stDays;
      const dw = SLUDGE.dewatering;
      const beds = SLUDGE.dryingBeds;
      const climate = beds.climateFactor.tashkent;
      const climateAll = Object.values(beds.climateFactor) as number[];
      const climateMin = Math.min(...climateAll);
      const climateMax = Math.max(...climateAll);
      const bedLoad = beds.aerobicStabilized.naturalDrained * climate;
      const bedArea = (dry * 365 * dw.emergencyBedsShare) / bedLoad;
      items.push({
        kind: "structure",
        name: radial ? "Илоуплотнитель гравитационный радиальный" : "Илоуплотнитель гравитационный вертикальный",
        spec: `время уплотнения ${thHours[0]}–${thHours[1]} ч, поступление ${f(vol, 1)} м³/сут при ${ctx.a.sludgeDs} % СВ (влажность ${100 - ctx.a.sludgeDs} %), на выходе влажность ${thOut} % (${f(100 - thOut, 1)} % СВ) — ${th.ref}; расчётный объём ${f(thVol, 1)} м³ с коэффициентом ${th.designFactor} (п. 6.352)`,
        qty: `${th.minUnits} (п. 6.350)`,
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      if (ctx.scale === "concrete" && ctx.Q > ctx.a.digesterFrom) {
        items.push({
          kind: "structure",
          name: "Метантенк или аэробный стабилизатор",
          spec: `стабилизация ${f(dry, 1)} кг СВ/сут; при метановом сбраживании — утилизация биогаза (пп. 6.355–6.371; граница ${ctx.a.digesterFrom} м³/сут — практика)`,
          qty: "2 (п. 6.364)",
          supply: "supply",
        });
      } else {
        items.push({
          kind: "structure",
          name: "Аэробный стабилизатор осадка",
          spec: `время стабилизации ${stDays} сут при 18 °C (${st.ref}; ${st.daysAt18C.disinfectedSludge}–${stDays} сут по виду осадка) → объём ${f(stVol, 1)} м³; воздух ${st.airPerM3Volume[0]}–${st.airPerM3Volume[1]} м³/ч на 1 м³ (п. 6.375), интенсивность не менее ${st.aerationIntensityMin} м³/(м²·ч); влажность на входе не более ${st.inletMoistureMax} %`,
          qty: `${st.minUnits} (п. 6.373)`,
          supply: "own",
          note: "Без стабилизации осадок загнивает и не принимается на полигон",
        });
      }
      items.push({
        kind: "machine",
        name:
          dry < 100
            ? "Шнековый дегидратор (мультидисковый)"
            : dry < 500
            ? "Декантерная центрифуга"
            : "Камерный или ленточный фильтр-пресс",
        spec: `производительность по сухому веществу ${f(dry, 1)} кг/сут, кек ${ctx.a.cakeDs} % СВ (уплотнённый активный ил: фильтр-пресс ${dw.activatedSludgeCake.filterPress[0]}–${dw.activatedSludgeCake.filterPress[1]} %, центрифуга ${dw.activatedSludgeCake.centrifuge[0]}–${dw.activatedSludgeCake.centrifuge[1]} % влажности — ${dw.ref})`,
        qty: "1",
        supply: "supply",
        note: `Обезвоживание сокращает объём вывоза в ${f(ctx.a.cakeDs / ctx.a.sludgeDs)} раз и окупается на транспорте; резерв — ${dw.reserve}`,
      });
      items.push({
        kind: "machine",
        name: "Станция приготовления флокулянта для обезвоживания",
        spec: `доза ${ctx.a.sludgeFlocDose} кг на тонну сухого вещества (катионный флокулянт ${dw.flocculantKgPerT[0]}–${dw.flocculantKgPerT[1]} кг/т, п. 6.391) — ${f((dry * ctx.a.sludgeFlocDose) / 1000, 2)} кг/сут`,
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Насос подачи осадка",
        spec: "винтовой (эксцентриково-шнековый), работа на густой среде",
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Площадка (контейнер) обезвоженного осадка",
        spec: `накопление ${f((dry * 30) / (10 * ctx.a.cakeDs), 1)} м³/мес кека; склад на ${SLUDGE.storageMonths.value[0]}–${SLUDGE.storageMonths.value[1]} мес (${SLUDGE.storageMonths.ref}) — до ${f((dry * 30 * SLUDGE.storageMonths.value[1]) / (10 * ctx.a.cakeDs), 1)} м³; навес, отвод фильтрата в голову сооружений`,
        qty: "1",
        supply: "either",
      });
      if (ctx.scale !== "compact") {
        items.push({
          kind: "structure",
          name: "Иловые площадки аварийные",
          spec: `на ${dw.emergencyBedsShare * 100} % годового осадка (п. 6.393): нагрузка ${beds.aerobicStabilized.naturalDrained} кг/(м²·год) на естественном основании с дренажом × климатический коэффициент ${climate} (Ташкент, черт. 3; для других регионов ${climateMin}–${climateMax}) → площадь ${f(bedArea)} м² (${beds.ref})`,
          qty: `не менее ${beds.minCards} карт (п. 6.399)`,
          supply: "either",
        });
      }
      break;
    }
  }

  return items;
}
