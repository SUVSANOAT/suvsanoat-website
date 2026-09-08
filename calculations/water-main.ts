/* ==================================================================
 * НАПОРНЫЙ ВОДОВОД ПО ПРОДОЛЬНОМУ ПРОФИЛЮ:
 * ПОТЕРИ, ЛИНИЯ ЭНЕРГИИ, КАСКАД НАСОСНЫХ СТАНЦИЙ, ДАВЛЕНИЯ
 *
 * pump-main.ts считает короткую напорную линию от КНС: геометрический
 * подъём одним числом, одна станция, профиля нет. Для водовода этого
 * мало. Водовод в гору — это задача, где всё определяется профилем:
 * где поставить станции, какое давление в каждой точке, где труба
 * окажется выше пьезометрической линии, где при остановке насосов
 * порвётся столб воды. Одним «геометрическим подъёмом» это не
 * описывается.
 *
 * ПОЧЕМУ ЗДЕСЬ ОДИН РАСЧЁТНЫЙ КОНТЕКСТ
 *
 * Разбор ручного расчёта горного водовода (Чорвок, 33 500 м³/сут,
 * подъём 876 м) показал: арифметика была верной почти везде, а
 * документ всё равно оказался негодным. Свободные напоры на входах
 * станций были посчитаны в трёх местах — на чертеже, в сводной
 * таблице и в разделе по участкам — и разошлись втрое: 11,6 / 28 / 8
 * метров в одной и той же точке. Сравнение диаметров было сделано с
 * ошибочными скоростями: у большего диаметра скорость получилась
 * выше, чем у меньшего.
 *
 * Поэтому здесь всё считается один раз и из одного места. Узловая
 * таблица — единственный источник: из неё берутся и давления, и
 * расстановка станций, и вантузы, и чертёж профиля. Разойтись им
 * негде по устройству модуля.
 *
 * ЧТО ОТ НОРМЫ, А ЧТО ОТ ПРАКТИКИ
 *
 * ҚМҚ 2.04.03-19 — канализация, водоводы она не нормирует. Наружное
 * водоснабжение в Узбекистане — ШНК 2.04.02-97*. Пункты этого
 * норматива в модуле не проставлены: их надо сверить по действующей
 * редакции, а ставить ссылку наугад хуже, чем не ставить её вовсе.
 * Поэтому каждая принятая величина помечена как «практика» и
 * возвращается в `assumptions` — проектировщик видит, где кончается
 * посчитанное и начинается принятое.
 *
 * ЧЕГО ЗДЕСЬ НЕТ И НЕ БУДЕТ
 *
 * Расчёта переходного процесса методом характеристик. Гидроудар здесь
 * считается по Жуковскому — как верхняя оценка — и проверяется разрыв
 * сплошности по профилю. Этого хватает, чтобы понять, нужна ли защита
 * и какого порядка, но не хватает, чтобы её подобрать. Подбор
 * колпаков, клапанов и времён закрытия — только численным
 * моделированием. Модуль об этом пишет прямо и формирует перечень
 * данных для такого расчёта.
 * ================================================================== */

const G = 9.81;
/** модуль объёмной упругости воды, Па */
const K_WATER = 2.03e9;
const RHO = 1000;
/** кинематическая вязкость воды при 10 °C, м²/с */
const NU = 1.31e-6;
/** напор насыщенных паров воды при 20 °C, м вод. ст. */
const VAPOR_HEAD_M = 0.24;

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const WATER_MAIN = {
  economicVelocity: {
    min: 0.9,
    max: 2.0,
    target: 1.3,
    note: "экономичная скорость в водоводе 0,9–2,0 м/с, ориентир 1,3 м/с — практика; окончательный диаметр выбирается сравнением приведённых затрат, а не по скорости",
  },
  maxVelocity: {
    value: 3.0,
    note: "скорость выше 3 м/с в водоводе — практика не рекомендует: растут потери, шум, износ и амплитуда гидроудара",
  },
  minSuctionHead: {
    value: 15,
    note: "минимальный свободный напор на входе промежуточной станции 15 м — практика: это не порог аварийной блокировки (её обычно ставят на 5 м), а рабочий запас над ним",
  },
  maxStageHead: {
    value: 250,
    note: "наибольший напор одной ступени 250 м (около 25 бар) — практика: выше начинаются редкие и дорогие насосы и арматура классов PN40 и выше. Именно этот предел, а не гидравлика, задаёт число станций в каскаде: одним подъёмом можно поднять воду на любую высоту, вопрос в том, какое давление выдержит труба и арматура",
  },
  minLineHead: {
    value: 5,
    note: "минимальный свободный напор в любой точке трассы 5 м — практика: это не то же самое, что требование к входу станции. Вдоль трассы важно, чтобы пьезометрическая линия не подошла к трубе; 15 м нужны только там, где стоит насос",
  },
  freeHeadEnd: {
    value: 5,
    note: "свободный напор в конечной точке 5 м — практика для излива в резервуар; при подаче в сеть задаётся проектировщиком",
  },
  buryDepth: {
    value: 1.5,
    note: "глубина заложения до верха трубы 1,5 м — практика; уточняется по глубине промерзания и нагрузкам",
  },
  localShare: {
    value: 0.05,
    note: "местные потери на длинном водоводе приняты 5 % от потерь по длине — практика: на километры трассы приходится немного узлов; для обвязки станций доля считается отдельно",
  },
  stationLocalM: {
    value: 3,
    note: "потери в обвязке одной насосной станции 3 м (задвижки, обратный клапан, повороты, расходомер) — практика; уточняется по фактической схеме узла",
  },
  suctionLossM: {
    value: 1,
    note: "потери во всасывающем трубопроводе станции 1 м — практика; для расчёта кавитационного запаса",
  },
  efficiency: {
    pump: 0.82,
    motor: 0.95,
    note: "КПД насоса 0,82 и двигателя 0,95 для крупных агрегатов — ориентировочные, уточняются по паспорту подобранной машины",
  },
  hammerReserve: {
    value: 1.25,
    note: "запас 25 % между расчётным давлением и номинальным давлением трубы — практика",
  },
  corrosionAllowanceMm: {
    value: 1.0,
    note: "прибавка на коррозию 1,0 мм для стали с внутренним покрытием — практика; без покрытия принимают больше",
  },
  weldFactor: {
    value: 0.9,
    note: "коэффициент прочности сварного шва 0,9 — практика для прямошовной электросварной трубы",
  },
  safetyYield: {
    value: 1.5,
    note: "запас по пределу текучести 1,5 — практика; окончательно толщина стенки определяется расчётом на прочность по действующим нормам",
  },
  airValveSpacingM: {
    value: 700,
    note: "на пологих участках без выраженных вершин вантуз ставится не реже чем через 700 м — практика (обычно называют 500–800 м)",
  },
  airValveDropBar: {
    value: 0.14,
    note: "перепад на вантузе при впуске воздуха принят 0,14 бар — общепринятая точка подбора: изготовители дают пропускную способность именно при таком перепаде. Больший перепад означает, что клапан не успевает и в трубе растёт разрежение",
  },
  drainVelocity: {
    value: 1.0,
    note: "скорость опорожнения трубопровода 1,0 м/с — практика; по ней считается расход воздуха, который должен впустить вантуз",
  },
  vacuumSafety: {
    value: 2.0,
    note: "запас 2,0 по критическому наружному давлению (смятие трубы) — практика, учитывает овальность и неравномерность стенки",
  },
} as const;

/* ------------------------------------------------------------------
 * МАТЕРИАЛЫ И СОРТАМЕНТ
 * ------------------------------------------------------------------ */
export type WaterPipeKind = "steel" | "castIron" | "pe" | "grp";
export type Lining = "none" | "cement" | "epoxy";

export const WATER_PIPE = {
  steel: {
    label: "сталь",
    E: 2.06e11,
    /** предел текучести Ст3сп / 17Г1С, МПа — нижняя из двух */
    yieldMPa: 245,
    densityKgM3: 7850,
    /** эквивалентная шероховатость без покрытия / с ЦПП / с эпоксидом, мм */
    roughnessMm: { none: 1.0, cement: 0.15, epoxy: 0.05 },
    hazenC: { none: 100, cement: 130, epoxy: 140 },
    note: "сталь: расчёт по Шевелёву для неновых труб, при внутреннем покрытии — по Дарси–Альтшулю с шероховатостью покрытия",
  },
  castIron: {
    label: "ВЧШГ",
    E: 1.7e11,
    yieldMPa: 300,
    densityKgM3: 7100,
    roughnessMm: { none: 1.0, cement: 0.12, epoxy: 0.05 },
    hazenC: { none: 100, cement: 130, epoxy: 140 },
    note: "высокопрочный чугун с шаровидным графитом; поставляется с цементно-песчаным покрытием",
  },
  pe: {
    label: "ПЭ100",
    E: 1.0e9,
    yieldMPa: 0,
    densityKgM3: 960,
    roughnessMm: { none: 0.05, cement: 0.05, epoxy: 0.05 },
    hazenC: { none: 150, cement: 150, epoxy: 150 },
    note: "полиэтилен: модуль упругости для кратковременной нагрузки ~1 ГПа; скорость волны втрое-впятеро ниже, чем в стали, и гидроудар соответственно меньше",
  },
  grp: {
    label: "стеклопластик",
    E: 2.0e10,
    yieldMPa: 0,
    densityKgM3: 1900,
    roughnessMm: { none: 0.03, cement: 0.03, epoxy: 0.03 },
    hazenC: { none: 150, cement: 150, epoxy: 150 },
    note: "стеклопластик: модуль по окружному направлению ~20 ГПа",
  },
} as const;

/** Сортамент стальных электросварных труб: наружный диаметр и ряд стенок, мм. */
export const STEEL_PIPES: { outerMm: number; walls: number[] }[] = [
  { outerMm: 219, walls: [6, 7, 8] },
  { outerMm: 273, walls: [6, 7, 8, 9] },
  { outerMm: 325, walls: [6, 7, 8, 9, 10] },
  { outerMm: 377, walls: [7, 8, 9, 10, 12] },
  { outerMm: 426, walls: [7, 8, 9, 10, 12] },
  { outerMm: 530, walls: [7, 8, 9, 10, 11, 12, 14] },
  { outerMm: 630, walls: [8, 9, 10, 11, 12, 14, 16] },
  { outerMm: 720, walls: [8, 9, 10, 11, 12, 14, 16] },
  { outerMm: 820, walls: [9, 10, 11, 12, 14, 16, 18] },
  { outerMm: 1020, walls: [10, 11, 12, 14, 16, 18, 20] },
  { outerMm: 1220, walls: [11, 12, 14, 16, 18, 20] },
];

/* ------------------------------------------------------------------
 * ГИДРАВЛИКА: ТРИ МЕТОДА РЯДОМ
 *
 * Расхождение методов — это не придирка. В разобранном ручном расчёте
 * заявлена была одна формула (Hazen–Williams, C = 100), а в таблицы
 * попало число из другой, посчитанное на другом расходе: 13,2 м/км
 * вместо 10,7. Разница в 2,5 метра на километр на девяти километрах —
 * это 23 метра напора и четверть мегаватта установленной мощности.
 * Поэтому все три метода считаются всегда и показываются рядом, а при
 * расхождении больше 15 % выдаётся предупреждение.
 * ------------------------------------------------------------------ */

/** Коэффициент трения по Альтшулю. */
export function lambdaAltshul(re: number, dM: number, roughMm: number): number {
  if (re < 2300) return 64 / Math.max(re, 1);
  return 0.11 * Math.pow(roughMm / (dM * 1000) + 68 / re, 0.25);
}

/**
 * Коэффициент трения по Шевелёву для стальных и чугунных неновых труб.
 * При скорости 1,2 м/с и выше — квадратичная область: λ = 0,021/d^0,3.
 * Ниже 1,2 м/с вводится поправка на переходную область.
 */
export function lambdaShevelev(dM: number, v: number): number {
  if (v >= 1.2) return 0.021 / Math.pow(dM, 0.3);
  return (0.0179 / Math.pow(dM, 0.3)) * Math.pow(1 + 0.867 / Math.max(v, 0.01), 0.3);
}

export type Headloss = {
  /** принятый в расчёт уклон, м/м */
  i: number;
  iShevelev: number;
  iAltshul: number;
  iHazen: number;
  /* Те же величины в м/км — в них уклон и читают, и сравнивают, и
     именно на них смотрит проектировщик. Отдельные поля нужны потому,
     что округление м/м до трёх знаков превращает 9,27 м/км в 9,00. */
  iMPerKm: number;
  iShevelevMPerKm: number;
  iAltshulMPerKm: number;
  iHazenMPerKm: number;
  /** какой метод принят основным */
  method: string;
  lambda: number;
  reynolds: number;
  velocity: number;
};

/** Уклон линии энергии при заданных расходе и внутреннем диаметре. */
export function headlossGradient(
  qM3s: number,
  dInnerM: number,
  kind: WaterPipeKind,
  lining: Lining,
): Headloss {
  const area = (Math.PI * dInnerM * dInnerM) / 4;
  const v = qM3s / area;
  const re = (v * dInnerM) / NU;
  const mat = WATER_PIPE[kind];
  const rough = mat.roughnessMm[lining];
  const c = mat.hazenC[lining];

  const lamShev = lambdaShevelev(dInnerM, v);
  const lamAlt = lambdaAltshul(re, dInnerM, rough);
  const iShev = (lamShev * v * v) / (dInnerM * 2 * G);
  const iAlt = (lamAlt * v * v) / (dInnerM * 2 * G);
  const iHazen = (10.67 * Math.pow(qM3s, 1.852)) / (Math.pow(c, 1.852) * Math.pow(dInnerM, 4.87));

  /* Для стали и чугуна без покрытия основным принят Шевелёв: это метод,
     на котором построены отечественные таблицы и по которому расчёт
     проверяет экспертиза. Для труб с покрытием и для пластика формула
     Шевелёва не применима — там Альтшуль по шероховатости покрытия. */
  const useShevelev = (kind === "steel" || kind === "castIron") && lining === "none";
  const iMain = useShevelev ? iShev : iAlt;
  return {
    i: iMain,
    iShevelev: iShev,
    iAltshul: iAlt,
    iHazen,
    iMPerKm: Number((iMain * 1000).toFixed(2)),
    iShevelevMPerKm: Number((iShev * 1000).toFixed(2)),
    iAltshulMPerKm: Number((iAlt * 1000).toFixed(2)),
    iHazenMPerKm: Number((iHazen * 1000).toFixed(2)),
    method: useShevelev
      ? "Шевелёв (сталь/чугун, неновые трубы)"
      : `Дарси–Вейсбах, коэффициент трения по Альтшулю при шероховатости ${rough} мм`,
    lambda: useShevelev ? lamShev : lamAlt,
    reynolds: re,
    velocity: v,
  };
}

/* ------------------------------------------------------------------
 * ИСХОДНЫЕ ДАННЫЕ
 * ------------------------------------------------------------------ */

export type ProfilePoint = {
  /** расстояние от начала трассы, м (ПК0 = 0) */
  stationM: number;
  /** натурная отметка земли, м */
  groundM: number;
  /** отметка низа трубы, если снята с профиля; иначе земля минус заглубление */
  invertM?: number;
  /** подпись точки: «источник», «резервуар», «существующая НС» */
  label?: string;
};

export type WaterMainInput = {
  /** продольный профиль трассы — не менее двух точек */
  profile: ProfilePoint[];
  /** расчётный суточный расход, м³/сут */
  qM3Day: number;
  /** часов работы станции в сутки; меньше 24 — расчётный расход растёт */
  hoursPerDay?: number;
  /** дней работы в году — для орошения это сезон, а не 365 */
  daysPerYear?: number;
  /** число ниток водовода */
  lines?: number;

  material?: WaterPipeKind;
  lining?: Lining;
  /** наружный диаметр, мм; не задан — подбирается */
  outerMm?: number;
  /** толщина стенки, мм; не задана — подбирается по давлению */
  wallMm?: number;

  /** отметка уровня воды в источнике; не задана — отметка земли в начале */
  sourceLevelM?: number;
  /** требуемый свободный напор в конечной точке, м */
  freeHeadEndM?: number;
  /** минимальный свободный напор на входе промежуточной станции, м */
  minSuctionHeadM?: number;
  /** минимальный свободный напор в любой точке трассы, м */
  minLineHeadM?: number;
  /** глубина заложения до верха трубы, м */
  buryDepthM?: number;

  /** класс давления, бар; не задан — подбирается */
  pnBar?: number;
  /** наибольший напор одной ступени, м; не задан — по классу давления */
  maxStageHeadM?: number;
  /** ограничение числа станций */
  maxStations?: number;

  pumpEff?: number;
  motorEff?: number;

  /** тариф на электроэнергию, сум/кВт·ч — для сравнения диаметров */
  tariffPerKWh?: number;
  /** цена трубы, сум за тонну металла */
  pipePricePerTon?: number;
  /** горизонт сравнения, лет */
  horizonYears?: number;
};

/* ------------------------------------------------------------------
 * РЕЗУЛЬТАТ
 * ------------------------------------------------------------------ */

export type WaterMainNode = {
  stationM: number;
  /** пикетное обозначение: ПК12+50 */
  piket: string;
  groundM: number;
  /** отметка низа трубы, м */
  invertM: number;
  /** отметка оси трубы, м — от неё считается давление */
  axisM: number;
  /** пьезометрическая линия (линия динамического напора), м */
  hglM: number;
  /** линия энергии, м */
  eglM: number;
  /** линия статического напора (насосы стоят, задвижки закрыты), м */
  staticM: number;
  /** давление в трубе при работе, м вод. ст. */
  pressureM: number;
  /** то же в барах */
  pressureBar: number;
  /** статическое давление, бар */
  staticBar: number;
  /** номер ступени каскада, 1 — от первой станции */
  stage: number;
  /** здесь стоит насосная станция */
  station?: string;
  /** локальная вершина профиля */
  peak?: boolean;
  /** локальная впадина профиля */
  valley?: boolean;
};

export type StationResult = {
  name: string;
  stationM: number;
  piket: string;
  groundM: number;
  /** свободный напор на входе, м */
  suctionHeadM: number;
  /** напор ступени, м */
  headM: number;
  /** отметка линии энергии на выходе, м */
  outletEglM: number;
  /** давление на выходе, бар */
  outletBar: number;
  /** подача станции, м³/ч */
  flowM3H: number;
  shaftKW: number;
  motorKW: number;
  /** атмосферное давление на отметке станции, м вод. ст. */
  atmosphericM: number;
  /** располагаемый кавитационный запас, м */
  npshAvailableM: number;
};

export type DiameterOption = {
  outerMm: number;
  wallMm: number;
  innerMm: number;
  velocity: number;
  /** уклон линии энергии, м/км */
  gradientMPerKm: number;
  /** суммарные потери по трассе, м */
  totalLossM: number;
  /** требуемое число станций */
  stations: number;
  /** суммарная потребляемая мощность, кВт */
  motorKW: number;
  /** годовое потребление, кВт·ч */
  yearKWh: number;
  /** масса трубы, т */
  pipeTons: number;
  /** стоимость трубы, если задана цена */
  pipeCost?: number;
  /** стоимость энергии за горизонт */
  energyCost?: number;
  /** приведённые затраты за горизонт */
  totalCost?: number;
  ok: boolean;
  note: string;
};

export type HammerSegment = {
  from: string;
  to: string;
  lengthM: number;
  /** скорость волны, м/с */
  waveSpeedMs: number;
  /** фаза удара 2L/a, с */
  phaseS: number;
  /** повышение напора по Жуковскому, м */
  joukowskyM: number;
  /** наибольшее давление при возврате столба без защиты, бар */
  peakBar: number;
  /** где пьезометрическая линия при волне разрежения уходит ниже трубы */
  separationAt: string[];
  /** доля длины участка, попавшая в зону разрыва сплошности, % */
  separationSharePct: number;
  /** самая опасная точка участка */
  worstAt: string;
  /** наименьший запас над осью трубы при волне разрежения, м */
  minMarginM: number;
};

export type AirValve = {
  piket: string;
  stationM: number;
  groundM: number;
  kind: "вершина" | "по шагу" | "за станцией";
  /** расчётный диаметр впуска, мм */
  dnMm: number;
};

export type WaterMainResult = {
  /** расчётный расход, м³/ч и м³/с */
  qM3H: number;
  qM3s: number;
  /** принятая труба */
  outerMm: number;
  wallMm: number;
  innerMm: number;
  velocity: number;
  headloss: Headloss;
  /** длина трассы по профилю, м */
  lengthM: number;
  /** геодезический перепад, м */
  geoLiftM: number;
  /** суммарные потери, м */
  totalLossM: number;
  /** требуемый напор всего, м */
  totalHeadM: number;

  nodes: WaterMainNode[];
  stations: StationResult[];
  /** напор одной ступени, м */
  stageHeadM: number;
  /** принятый класс давления, бар */
  pnBar: number;
  /** наибольшее рабочее давление в трассе, бар */
  maxWorkingBar: number;

  /** подбор стенки */
  wall: {
    byPressureMm: number;
    byTestMm: number;
    acceptedMm: number;
    hoopStressMPa: number;
    /** критическое наружное давление (смятие), бар */
    bucklingBar: number;
    vacuumOk: boolean;
  };

  hammer: HammerSegment[];
  airValves: AirValve[];
  /** выпуски (грязевики) в низших точках */
  drains: { piket: string; stationM: number; groundM: number }[];

  power: {
    /** суммарная потребляемая мощность, кВт */
    motorKW: number;
    yearKWh: number;
    kWhPerM3: number;
    /** годовая стоимость энергии, если задан тариф */
    yearCost?: number;
  };

  options: DiameterOption[];
  assumptions: string[];
  warnings: string[];
  /** перечень данных, которые нужны для расчёта переходного процесса */
  transientBrief: string[];
};

/* ------------------------------------------------------------------
 * ВСПОМОГАТЕЛЬНОЕ
 * ------------------------------------------------------------------ */

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));
const r3 = (x: number) => Number(x.toFixed(3));

/** «ПК12+50» из расстояния 1250 м. */
export function piketOf(stationM: number): string {
  let pk = Math.floor(stationM / 100);
  let plus = Math.round(stationM - pk * 100);
  /* Округление плюсовки может дать ровно 100 — тогда это следующий
     пикет, а не «ПК18+100». Мелочь, но в ведомости она выглядит как
     ошибка съёмки и заставляет проектировщика перепроверять таблицу. */
  if (plus >= 100) {
    pk += 1;
    plus -= 100;
  }
  if (plus === 0) return `ПК${pk}`;
  return `ПК${pk}+${plus.toString().padStart(2, "0")}`;
}

/**
 * Атмосферное давление по отметке, м вод. ст.
 * На 1550 м это 8,6 м, а не 10,33 — и кавитационный запас насоса
 * горной станции считается именно от этой величины. В разобранном
 * ручном расчёте эта поправка отсутствовала.
 */
export function atmosphericHeadM(elevM: number): number {
  const pKpa = 101.325 * Math.pow(1 - 2.25577e-5 * Math.max(0, elevM), 5.2559);
  return pKpa / 9.807;
}

/** Подбор стенки из сортамента по требуемой толщине. */
function pickWall(outerMm: number, requiredMm: number): number {
  const row = STEEL_PIPES.find((p) => p.outerMm === outerMm);
  if (!row) return Math.ceil(requiredMm);
  const w = row.walls.find((x) => x >= requiredMm);
  return w ?? row.walls[row.walls.length - 1];
}

/** Требуемая толщина стенки по внутреннему давлению, мм. */
function wallForPressure(outerMm: number, pressureBar: number, kind: WaterPipeKind): number {
  const mat = WATER_PIPE[kind];
  if (!mat.yieldMPa) return 0; // пластик и стеклопластик считаются по SDR, здесь не подбираются
  const allow = (mat.yieldMPa / WATER_MAIN.safetyYield.value) * WATER_MAIN.weldFactor.value; // МПа
  const p = (pressureBar * 0.1); // МПа
  const s = (p * outerMm) / (2 * allow + p);
  return s + WATER_MAIN.corrosionAllowanceMm.value;
}

/** Критическое наружное давление (смятие трубы), бар. */
function bucklingBar(outerMm: number, wallMm: number, E: number): number {
  const dMean = outerMm - wallMm;
  const pcrPa = ((2 * E) / (1 - 0.3 * 0.3)) * Math.pow(wallMm / dMean, 3);
  return pcrPa / 1e5 / WATER_MAIN.vacuumSafety.value;
}

/* ------------------------------------------------------------------
 * ОСНОВНОЙ РАСЧЁТ
 * ------------------------------------------------------------------ */

export function calculateWaterMain(input: WaterMainInput): WaterMainResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];

  /* --- профиль --- */
  const profile = [...input.profile]
    .filter((p) => Number.isFinite(p.stationM) && Number.isFinite(p.groundM))
    .sort((a, b) => a.stationM - b.stationM);
  if (profile.length < 2) {
    throw new Error("В профиле меньше двух точек: расчёт водовода невозможен.");
  }
  const bury = input.buryDepthM ?? WATER_MAIN.buryDepth.value;
  const lengthM = profile[profile.length - 1].stationM - profile[0].stationM;
  const geoLift = profile[profile.length - 1].groundM - profile[0].groundM;

  /* --- расход --- */
  const lines = Math.max(1, Math.round(input.lines ?? 1));
  const hours = Math.min(24, Math.max(1, input.hoursPerDay ?? 24));
  const days = Math.max(1, Math.min(365, input.daysPerYear ?? 365));
  const qM3H = Math.max(0.001, input.qM3Day) / hours;
  const qM3s = qM3H / 3600;
  const qLine = qM3s / lines;

  const kind: WaterPipeKind = input.material ?? "steel";
  const lining: Lining = input.lining ?? "cement";
  const mat = WATER_PIPE[kind];
  const pumpEff = input.pumpEff ?? WATER_MAIN.efficiency.pump;
  const motorEff = input.motorEff ?? WATER_MAIN.efficiency.motor;
  const minSuction = input.minSuctionHeadM ?? WATER_MAIN.minSuctionHead.value;
  const freeEnd = input.freeHeadEndM ?? WATER_MAIN.freeHeadEnd.value;
  const minLine = input.minLineHeadM ?? WATER_MAIN.minLineHead.value;
  const sourceLevel = input.sourceLevelM ?? profile[0].groundM;

  /* ------------------------------------------------------------------
     ПОДБОР ДИАМЕТРА

     Диаметр водовода — это не выбор скорости, а выбор между стоимостью
     трубы один раз и стоимостью электричества каждый год. На горном
     водоводе разница особенно велика: лишние два с половиной метра
     потерь на километр превращаются в сотни киловатт постоянной
     мощности. Поэтому считаются все диаметры подряд, а не «ближайший к
     экономичной скорости», и рядом показываются приведённые затраты.
     ------------------------------------------------------------------ */
  const evaluate = (outerMm: number, wallMm: number) => {
    const inner = (outerMm - 2 * wallMm) / 1000;
    const hl = headlossGradient(qLine, inner, kind, lining);
    const friction = hl.i * lengthM;
    const local = friction * WATER_MAIN.localShare.value;
    const loss = friction + local;
    const totalHead = geoLift + loss + freeEnd - (sourceLevel - profile[0].groundM);
    return { inner, hl, loss, totalHead };
  };

  let outerMm = input.outerMm ?? 0;
  let wallMm = input.wallMm ?? 0;

  /* Предварительный проход: для каждого наружного диаметра берём
     минимальную стенку сортамента — она нужна только чтобы посчитать
     внутренний диаметр и потери. Окончательная стенка подбирается
     ниже, когда станет известно давление ступени. */
  const candidates = STEEL_PIPES.map((p) => ({ outerMm: p.outerMm, wallMm: p.walls[0] }));

  if (!outerMm) {
    const scored = candidates
      .map((c) => {
        const e = evaluate(c.outerMm, c.wallMm);
        return { ...c, v: e.hl.velocity, head: e.totalHead };
      })
      .filter((c) => c.v <= WATER_MAIN.maxVelocity.value && c.v >= 0.5);
    const best = scored.sort(
      (a, b) => Math.abs(a.v - WATER_MAIN.economicVelocity.target) - Math.abs(b.v - WATER_MAIN.economicVelocity.target),
    )[0];
    outerMm = best?.outerMm ?? 530;
    wallMm = 0;
  }
  if (!wallMm) wallMm = STEEL_PIPES.find((p) => p.outerMm === outerMm)?.walls[0] ?? 8;

  let innerM = (outerMm - 2 * wallMm) / 1000;
  let hl = headlossGradient(qLine, innerM, kind, lining);

  /* ------------------------------------------------------------------
     РАССТАНОВКА СТАНЦИЙ

     Задача: найти наименьшее число одинаковых ступеней, при котором
     на входе каждой следующей станции остаётся заданный свободный
     напор, а давление нигде не превышает класс трубы.

     Ступени делаются одинаковыми сознательно: одинаковые станции — это
     один типоразмер насоса, один комплект ЗИП, взаимозаменяемые
     агрегаты и одна схема автоматики. Разнобой по напорам экономит
     мало, а стоит дорого в эксплуатации.
     ------------------------------------------------------------------ */
  const axisOf = (p: ProfilePoint) => (p.invertM ?? p.groundM - bury - outerMm / 2000) + outerMm / 2000;

  type Placement = { stageHead: number; stations: number[]; ok: boolean; endSuction: number };

  const gradient = hl.i * (1 + WATER_MAIN.localShare.value);

  /**
   * Прогон трассы при заданном напоре ступени. Станция ставится не там,
   * где напор кончился, а в последней точке, где он ещё был: перешагнуть
   * место установки нельзя — за ним подпор уже ниже допустимого.
   */
  const run = (stageHead: number): Placement => {
    const stationsAt: number[] = [profile[0].stationM];
    /* Линия энергии хранится по всем точкам: когда напор кончился,
       станцию надо ставить не «на шаг назад», а в последнюю точку, где
       подпор ещё был. На крутом склоне отметка растёт на десяток метров
       за пикет, и одного шага назад не хватает — отойти приходится на
       несколько точек. */
    const eglAt: number[] = new Array<number>(profile.length).fill(NaN);
    eglAt[0] = sourceLevel + stageHead - WATER_MAIN.stationLocalM.value;

    let lastStationIdx = 0;
    let i = 1;
    let guard = 0;

    while (i < profile.length) {
      if ((guard += 1) > profile.length * 20) {
        return { stageHead, stations: stationsAt, ok: false, endSuction: -Infinity };
      }
      const seg = profile[i].stationM - profile[i - 1].stationM;
      eglAt[i] = eglAt[i - 1] - gradient * seg;
      const suction = eglAt[i] - profile[i].groundM;
      const isLast = i === profile.length - 1;

      /* Станция нужна не тогда, когда подпор упал ниже 15 м, а тогда,
         когда напора вдоль трассы уже не остаётся. Пятнадцать метров —
         требование к входу насоса, и оно проверяется в той точке, где
         станцию ставят, а не в каждой точке профиля. Если перепутать
         эти два условия, каскад дробится на вдвое-втрое большее число
         ступеней, чем нужно. */
      if (!isLast && suction < minLine) {
        let k = i - 1;
        while (k > lastStationIdx && eglAt[k] - profile[k].groundM < minSuction) k -= 1;
        /* Дошли до предыдущей станции и места так и не нашли — ступень
           слишком мала для этого профиля. */
        if (k <= lastStationIdx) {
          return { stageHead, stations: stationsAt, ok: false, endSuction: suction };
        }
        stationsAt.push(profile[k].stationM);
        lastStationIdx = k;
        eglAt[k] = eglAt[k] + stageHead - WATER_MAIN.stationLocalM.value;
        i = k + 1;
        continue;
      }
      i += 1;
    }

    const endSuction = eglAt[profile.length - 1] - profile[profile.length - 1].groundM;
    return { stageHead, stations: stationsAt, ok: endSuction >= freeEnd - 0.01, endSuction };
  };

  const maxStations = Math.max(1, Math.round(input.maxStations ?? 12));
  const needFor = (n: number) =>
    geoLift + gradient * lengthM + freeEnd - (sourceLevel - profile[0].groundM) + n * WATER_MAIN.stationLocalM.value;

  /* Число станций задаёт не гидравлика, а давление: одним подъёмом
     можно поднять воду хоть на километр, только труба и арматура на
     сто бар не проектируются. Поэтому сначала — предел напора ступени,
     и лишь потом наименьшее число ступеней, которое в него укладывается. */
  const maxStage = input.maxStageHeadM
    ?? (input.pnBar ? (input.pnBar * 10.197) / WATER_MAIN.hammerReserve.value : WATER_MAIN.maxStageHead.value);

  let placement: Placement | null = null;
  for (let n = 1; n <= maxStations; n += 1) {
    const stage = needFor(n) / n;
    if (stage > maxStage) continue;
    const p = run(stage);
    if (p.ok && p.stations.length <= n) {
      placement = p;
      break;
    }
  }
  if (!placement) {
    placement = run(needFor(maxStations) / maxStations);
    warnings.push(
      `Не удалось увязать каскад при ${maxStations} станциях: в конце трассы не хватает ${r1(Math.max(0, freeEnd - placement.endSuction))} м напора. Проверьте профиль, расход и минимальный свободный напор на входе станции.`,
    );
  }

  const stageHead = placement.stageHead;
  const stationSet = new Set(placement.stations);

  /* --- класс давления и стенка --- */
  const workingBarAtStation = (stageHead + WATER_MAIN.stationLocalM.value) / 10.197;
  const pnBar = input.pnBar ?? [10, 16, 25, 32, 40, 63].find((p) => p >= workingBarAtStation * WATER_MAIN.hammerReserve.value) ?? 63;

  const requiredWall = wallForPressure(outerMm, pnBar, kind);
  const testWall = wallForPressure(outerMm, pnBar * 1.25, kind);
  const acceptedWall = input.wallMm ?? pickWall(outerMm, Math.max(requiredWall, testWall));
  if (acceptedWall !== wallMm) {
    wallMm = acceptedWall;
    innerM = (outerMm - 2 * wallMm) / 1000;
    hl = headlossGradient(qLine, innerM, kind, lining);
  }

  /* ------------------------------------------------------------------
     УЗЛОВАЯ ТАБЛИЦА — ЕДИНСТВЕННЫЙ ИСТОЧНИК ЧИСЕЛ
     ------------------------------------------------------------------ */
  const nodes: WaterMainNode[] = [];
  const stations: StationResult[] = [];
  let stage = 1;
  let egl = sourceLevel + stageHead;
  let stationCounter = 0;

  const velHead = (hl.velocity * hl.velocity) / (2 * G);

  for (let i = 0; i < profile.length; i += 1) {
    const p = profile[i];
    if (i > 0) {
      const seg = p.stationM - profile[i - 1].stationM;
      egl -= hl.i * seg * (1 + WATER_MAIN.localShare.value);
    }
    const isStation = stationSet.has(p.stationM);
    let stationName: string | undefined;

    if (isStation) {
      const suction = i === 0 ? sourceLevel - p.groundM : egl - p.groundM;
      stationCounter += 1;
      stationName = stationCounter === 1 ? "ГНС" : `ПНС-${stationCounter - 1}`;
      if (i > 0) stage += 1;
      egl = (i === 0 ? sourceLevel : egl) + stageHead - WATER_MAIN.stationLocalM.value;
      const atm = atmosphericHeadM(p.groundM);
      const flow = qM3H / lines;
      const shaft = (RHO * G * (qM3H / 3600) * stageHead) / 1000 / pumpEff;
      stations.push({
        name: stationName,
        stationM: p.stationM,
        piket: piketOf(p.stationM),
        groundM: r2(p.groundM),
        suctionHeadM: r1(suction),
        headM: r1(stageHead),
        outletEglM: r2(egl),
        outletBar: r2((egl - axisOf(p)) / 10.197),
        flowM3H: r1(flow),
        shaftKW: r1(shaft),
        motorKW: r1(shaft / motorEff),
        atmosphericM: r2(atm),
        npshAvailableM: r1(atm + Math.max(0, suction) - WATER_MAIN.suctionLossM.value - VAPOR_HEAD_M),
      });
    }

    const axis = axisOf(p);
    const invert = p.invertM ?? p.groundM - bury - outerMm / 1000;
    /* Линия статического напора — уровень, на котором встанет вода при
       остановленных насосах: отметка линии энергии на выходе работающей
       ступени. Именно её рисуют на гидравлической схеме. */
    const staticLine = egl;

    const prev = profile[i - 1];
    const next = profile[i + 1];
    const peak = !!prev && !!next && p.groundM > prev.groundM && p.groundM >= next.groundM;
    const valley = !!prev && !!next && p.groundM < prev.groundM && p.groundM <= next.groundM;

    nodes.push({
      stationM: p.stationM,
      piket: piketOf(p.stationM),
      groundM: r2(p.groundM),
      invertM: r2(invert),
      axisM: r2(axis),
      hglM: r2(egl - velHead),
      eglM: r2(egl),
      staticM: r2(staticLine),
      pressureM: r1(egl - velHead - axis),
      pressureBar: r2((egl - velHead - axis) / 10.197),
      staticBar: r2((staticLine - axis) / 10.197),
      stage,
      station: stationName,
      peak: peak || undefined,
      valley: valley || undefined,
    });
  }

  const maxWorkingBar = Math.max(...nodes.map((n) => n.pressureBar));
  const totalLoss = hl.i * lengthM * (1 + WATER_MAIN.localShare.value);
  const totalHead = stations.length * stageHead;

  /* --- проверка стенки --- */
  const hoop = ((maxWorkingBar * 0.1) * (outerMm - 2 * wallMm)) / (2 * wallMm); // МПа
  const buckle = bucklingBar(outerMm, wallMm, mat.E);

  /* ------------------------------------------------------------------
     ГИДРОУДАР ПО УЧАСТКАМ

     Считается по Жуковскому — это верхняя оценка повышения. Главное
     здесь не она, а проверка разрыва сплошности по профилю: волна
     разрежения идёт от остановившейся станции вперёд, и там, где
     пьезометрическая линия при этом опускается ниже оси трубы, столб
     воды рвётся. Схлопывание образовавшейся полости даёт удар,
     который формулой Жуковского уже не описывается — он больше.
     Одной цифрой «прибавка 242 м» этот случай не закрывается.
     ------------------------------------------------------------------ */
  const dOverT = outerMm / wallMm;
  const a0 = Math.sqrt(K_WATER / RHO);
  const waveSpeed = a0 / Math.sqrt(1 + (K_WATER / mat.E) * dOverT);
  const joukowsky = (waveSpeed * hl.velocity) / G;

  const hammer: HammerSegment[] = [];
  const stationNodes = nodes.filter((n) => n.station);
  for (let s = 0; s < stationNodes.length; s += 1) {
    const from = stationNodes[s];
    const toStation = stationNodes[s + 1];
    const endM = toStation ? toStation.stationM : nodes[nodes.length - 1].stationM;
    const seg = nodes.filter((n) => n.stationM >= from.stationM && n.stationM <= endM);
    const L = endM - from.stationM;
    const separationAt: string[] = [];
    let minMargin = Infinity;
    let worstAt = from.piket;
    seg.forEach((n) => {
      /* При остановке станции линия энергии на этом участке падает на
         величину удара: столб воды продолжает уходить вперёд, а за ним
         давление проваливается. */
      const margin = n.hglM - joukowsky - n.axisM;
      if (margin < minMargin) {
        minMargin = margin;
        worstAt = n.piket;
      }
      if (margin < 0) separationAt.push(n.piket);
    });
    hammer.push({
      from: from.station ?? from.piket,
      to: toStation ? (toStation.station ?? toStation.piket) : "конечная точка",
      lengthM: Math.round(L),
      waveSpeedMs: Math.round(waveSpeed),
      phaseS: r2((2 * L) / waveSpeed),
      joukowskyM: r1(joukowsky),
      peakBar: r2((from.staticBar * 10.197 + joukowsky) / 10.197),
      separationAt: separationAt.slice(0, 6),
      separationSharePct: Math.round((separationAt.length / Math.max(1, seg.length)) * 100),
      worstAt,
      minMarginM: r1(minMargin),
    });
  }

  /* ------------------------------------------------------------------
     ВАНТУЗЫ И ВЫПУСКИ

     Диаметр вантуза считается, а не назначается. При опорожнении
     трубопровода на место воды должен войти воздух — столько же по
     объёму. Если сечение впуска мало, в трубе образуется разрежение.
     ------------------------------------------------------------------ */
  const pipeArea = (Math.PI * innerM * innerM) / 4;
  const qAir = pipeArea * WATER_MAIN.drainVelocity.value; // м³/с воздуха
  const dpPa = WATER_MAIN.airValveDropBar.value * 1e5;
  const vAir = Math.sqrt((2 * dpPa) / 1.2);
  const aValve = qAir / (0.6 * vAir);
  const dValveMm = Math.ceil((Math.sqrt((4 * aValve) / Math.PI) * 1000) / 10) * 10;
  const dValveStd = [50, 80, 100, 150, 200, 250].find((d) => d >= dValveMm) ?? 250;

  const airValves: AirValve[] = [];
  const drains: { piket: string; stationM: number; groundM: number }[] = [];
  let lastValveAt = nodes[0].stationM;
  nodes.forEach((n) => {
    if (n.station && n.station !== "ГНС") {
      airValves.push({ piket: n.piket, stationM: n.stationM, groundM: n.groundM, kind: "за станцией", dnMm: dValveStd });
      lastValveAt = n.stationM;
      return;
    }
    if (n.peak) {
      airValves.push({ piket: n.piket, stationM: n.stationM, groundM: n.groundM, kind: "вершина", dnMm: dValveStd });
      lastValveAt = n.stationM;
    } else if (n.stationM - lastValveAt >= WATER_MAIN.airValveSpacingM.value) {
      airValves.push({ piket: n.piket, stationM: n.stationM, groundM: n.groundM, kind: "по шагу", dnMm: dValveStd });
      lastValveAt = n.stationM;
    }
    if (n.valley) drains.push({ piket: n.piket, stationM: n.stationM, groundM: n.groundM });
  });

  /* --- энергетика --- */
  const motorKW = stations.reduce((s, x) => s + x.motorKW, 0);
  const yearKWh = motorKW * hours * days;
  const yearVolume = input.qM3Day * days;
  const power = {
    motorKW: r1(motorKW),
    yearKWh: Math.round(yearKWh),
    kWhPerM3: r3(yearKWh / Math.max(1, yearVolume)),
    yearCost: input.tariffPerKWh ? Math.round(yearKWh * input.tariffPerKWh) : undefined,
  };

  /* ------------------------------------------------------------------
     СРАВНЕНИЕ ДИАМЕТРОВ
     ------------------------------------------------------------------ */
  const horizon = Math.max(1, Math.round(input.horizonYears ?? 25));
  const options: DiameterOption[] = candidates.map((c) => {
    const wallOpt = pickWall(c.outerMm, Math.max(wallForPressure(c.outerMm, pnBar, kind), wallForPressure(c.outerMm, pnBar * 1.25, kind)));
    const inner = (c.outerMm - 2 * wallOpt) / 1000;
    const h = headlossGradient(qLine, inner, kind, lining);
    const loss = h.i * lengthM * (1 + WATER_MAIN.localShare.value);
    const need = geoLift + loss + freeEnd - (sourceLevel - profile[0].groundM);
    const n = Math.max(1, Math.ceil(need / Math.max(1, maxStage)));
    const kw = (RHO * G * qM3s * need) / 1000 / pumpEff / motorEff;
    const kwh = kw * hours * days;
    const massKgM = Math.PI * ((c.outerMm - wallOpt) / 1000) * (wallOpt / 1000) * mat.densityKgM3;
    const tons = (massKgM * lengthM * lines) / 1000;
    const pipeCost = input.pipePricePerTon ? tons * input.pipePricePerTon : undefined;
    const energyCost = input.tariffPerKWh ? kwh * input.tariffPerKWh * horizon : undefined;
    const ok = h.velocity <= WATER_MAIN.maxVelocity.value && h.velocity >= 0.5;
    return {
      outerMm: c.outerMm,
      wallMm: wallOpt,
      innerMm: Math.round(inner * 1000),
      velocity: r2(h.velocity),
      gradientMPerKm: r2(h.i * 1000),
      totalLossM: r1(loss),
      stations: n,
      motorKW: r1(kw),
      yearKWh: Math.round(kwh),
      pipeTons: r1(tons),
      pipeCost: pipeCost !== undefined ? Math.round(pipeCost) : undefined,
      energyCost: energyCost !== undefined ? Math.round(energyCost) : undefined,
      totalCost: pipeCost !== undefined && energyCost !== undefined ? Math.round(pipeCost + energyCost) : undefined,
      ok,
      note: !ok
        ? h.velocity > WATER_MAIN.maxVelocity.value
          ? `скорость ${r2(h.velocity)} м/с выше допустимой ${WATER_MAIN.maxVelocity.value} м/с`
          : `скорость ${r2(h.velocity)} м/с ниже 0,5 м/с — труба избыточна`
        : c.outerMm === outerMm
          ? "принят в расчёт"
          : "",
    };
  });

  /* ------------------------------------------------------------------
     ПРОВЕРКИ
     ------------------------------------------------------------------ */
  const spread = Math.max(hl.iShevelev, hl.iAltshul, hl.iHazen) / Math.max(1e-9, Math.min(hl.iShevelev, hl.iAltshul, hl.iHazen));
  if (spread > 1.15) {
    warnings.push(
      `Методы расчёта потерь расходятся на ${Math.round((spread - 1) * 100)} %: Шевелёв ${r2(hl.iShevelev * 1000)} м/км, Альтшуль ${r2(hl.iAltshul * 1000)} м/км, Hazen–Williams ${r2(hl.iHazen * 1000)} м/км. В расчёт принят ${hl.method}. Расхождение больше 15 % означает, что шероховатость выбрана на границе применимости — уточните состояние трубы и покрытие.`,
    );
  }
  if (hl.velocity > WATER_MAIN.maxVelocity.value) {
    warnings.push(`Скорость ${r2(hl.velocity)} м/с выше ${WATER_MAIN.maxVelocity.value} м/с: увеличьте диаметр.`);
  }
  if (hl.velocity < 0.5) {
    warnings.push(`Скорость ${r2(hl.velocity)} м/с ниже 0,5 м/с: труба избыточна, деньги вложены в металл без отдачи.`);
  }
  const badSuction = stations.filter((s) => s.name !== "ГНС" && s.suctionHeadM < minSuction);
  if (badSuction.length) {
    warnings.push(
      `Свободный напор на входе ${badSuction.map((s) => `${s.name} (${s.suctionHeadM} м)`).join(", ")} ниже принятого минимума ${minSuction} м. Станцию надо сместить назад по трассе или увеличить напор предыдущей ступени.`,
    );
  }
  const lowNpsh = stations.filter(
    (s) => s.npshAvailableM < 10 && !(s.name === "ГНС" && input.sourceLevelM === undefined),
  );
  if (lowNpsh.length) {
    warnings.push(
      `Кавитационный запас на входе ${lowNpsh.map((s) => `${s.name} (${s.npshAvailableM} м)`).join(", ")} меньше 10 м. На отметке ${r1(lowNpsh[0].groundM)} м атмосферное давление ${lowNpsh[0].atmosphericM} м вод. ст., а не 10,33 — насос надо проверять по паспортному NPSHr именно на этой высоте.`,
    );
  }
  if (maxWorkingBar * WATER_MAIN.hammerReserve.value > pnBar) {
    warnings.push(
      `Рабочее давление ${r2(maxWorkingBar)} бар при классе PN${pnBar} оставляет меньше 25 % запаса. Либо класс выше, либо напор ступени ниже.`,
    );
  }
  if (hoop > (mat.yieldMPa / WATER_MAIN.safetyYield.value) * WATER_MAIN.weldFactor.value) {
    warnings.push(`Кольцевое напряжение ${r1(hoop)} МПа выше допускаемого: стенка ${wallMm} мм недостаточна.`);
  }
  if (buckle < 1.0) {
    warnings.push(
      `Критическое наружное давление ${r2(buckle)} бар с запасом ${WATER_MAIN.vacuumSafety.value} меньше атмосферного: при полном вакууме труба ${outerMm}×${wallMm} может смяться. Нужны впускные вантузы и проверка стенки на вакуум.`,
    );
  }
  const peakBar = Math.max(...hammer.map((h) => h.peakBar));
  if (peakBar > pnBar) {
    warnings.push(
      `Пиковое давление при гидроударе без защиты ${r2(peakBar)} бар против класса PN${pnBar}. Это верхняя оценка по Жуковскому при мгновенной остановке — она и должна быть снижена защитой (плавный останов, маховые массы, гидропневмобаки, противоударные клапаны). Насколько именно снижена, показывает только расчёт переходного процесса; принимать снижение коэффициентом нельзя.`,
    );
  }
  const separating = hammer.filter((h) => h.separationAt.length);
  if (separating.length) {
    warnings.push(
      `Разрыв сплошности потока на участках ${separating.map((h) => `${h.from}–${h.to}`).join(", ")}: при остановке насосов пьезометрическая линия опускается ниже оси трубы. Схлопывание полости даёт удар больше расчётного по Жуковскому. Без расчёта переходного процесса и подобранной защиты водовод эксплуатировать нельзя.`,
    );
  }
  if (kind === "pe" || kind === "grp") {
    warnings.push(
      `Сортамент и подбор толщины стенки в модуле сделаны для стали: ряд диаметров и расчёт на давление взяты по стальной трубе. Для ${mat.label} задайте наружный диаметр и стенку вручную по SDR или классу жёсткости изготовителя — потери, линия энергии, расстановка станций и гидроудар при этом считаются верно, а вот подобранная стенка и класс давления к ${mat.label} не относятся.`,
    );
  }
  if (lines === 1) {
    warnings.push(
      "Водовод в одну нитку: при аварии подача прекращается полностью. Число ниток и категория надёжности принимаются по ШНК 2.04.02-97* — проверьте требуемую категорию для этого объекта.",
    );
  }

  /* ------------------------------------------------------------------
     ДОПУЩЕНИЯ
     ------------------------------------------------------------------ */
  assumptions.push(
    `Расчётный расход ${r1(qM3H)} м³/ч (${r3(qM3s)} м³/с) при подаче ${input.qM3Day} м³/сут за ${hours} ч работы${lines > 1 ? `, разделён на ${lines} нитки` : ""}.`,
    `Потери по длине — ${hl.method}; скорость ${r2(hl.velocity)} м/с, уклон ${r2(hl.i * 1000)} м/км. Для контроля тем же расходом посчитано: Шевелёв ${r2(hl.iShevelev * 1000)}, Альтшуль ${r2(hl.iAltshul * 1000)}, Hazen–Williams ${r2(hl.iHazen * 1000)} м/км.`,
    `Местные потери: ${WATER_MAIN.localShare.note}. Дополнительно ${WATER_MAIN.stationLocalM.value} м на обвязку каждой станции — ${WATER_MAIN.stationLocalM.note}.`,
    `Каскад: ${stations.length} ${stations.length === 1 ? "станция" : "станций"} по ${r1(stageHead)} м напора. Ступени приняты одинаковыми — это один типоразмер насоса, взаимозаменяемые агрегаты и одна схема автоматики.`,
    `Минимальный свободный напор на входе станции ${minSuction} м: ${WATER_MAIN.minSuctionHead.note}.`,
    `Свободный напор в конечной точке ${freeEnd} м: ${WATER_MAIN.freeHeadEnd.note}.`,
    `Отметка оси трубы — отметка земли минус ${bury} м заглубления до верха (${WATER_MAIN.buryDepth.note}); от неё считается давление в трубе. Если в профиль введены отметки лотка, берутся они.`,
    `Труба ${outerMm}×${wallMm} мм, внутренний диаметр ${Math.round(innerM * 1000)} мм, материал — ${mat.label}${lining !== "none" ? `, внутреннее покрытие: ${lining === "cement" ? "цементно-песчаное" : "эпоксидное"}` : ", без внутреннего покрытия"}.`,
    `Толщина стенки подобрана по внутреннему давлению PN${pnBar} и испытательному давлению 1,25·PN при допускаемом напряжении ${r1((mat.yieldMPa / WATER_MAIN.safetyYield.value) * WATER_MAIN.weldFactor.value)} МПа (предел текучести ${mat.yieldMPa} МПа, ${WATER_MAIN.safetyYield.note}, ${WATER_MAIN.weldFactor.note}), плюс ${WATER_MAIN.corrosionAllowanceMm.value} мм на коррозию.`,
    `Скорость волны ${Math.round(waveSpeed)} м/с при D/δ = ${r1(dOverT)}; повышение напора по Жуковскому ${r1(joukowsky)} м. Это верхняя оценка при мгновенной остановке — принята сознательно.`,
    `КПД: ${WATER_MAIN.efficiency.note}.`,
    `Атмосферное давление для кавитационного запаса взято по фактической отметке каждой станции (на 1500 м это около 8,6 м вод. ст. вместо 10,33 на уровне моря).`,
    `Диаметр вантуза ${dValveStd} мм получен расчётом: при опорожнении со скоростью ${WATER_MAIN.drainVelocity.value} м/с в трубу должно войти ${r3(qAir)} м³/с воздуха при перепаде ${WATER_MAIN.airValveDropBar.value} бар. Окончательный выбор — по графикам пропускной способности конкретного вантуза.`,
    `Годовое потребление посчитано при ${hours} ч работы ${days} дней в году. Для орошения это сезон, а не круглый год: если ввести 365 дней там, где сезон 180, годовые затраты завышаются вдвое.`,
  );

  /* ------------------------------------------------------------------
     ЧТО НУЖНО ДЛЯ РАСЧЁТА ПЕРЕХОДНОГО ПРОЦЕССА
     ------------------------------------------------------------------ */
  const transientBrief = [
    "Характеристика Q–H и КПД выбранного насоса, включая работу в обратную сторону (четырёхквадрантная характеристика).",
    "Момент инерции вращающихся масс агрегата GD² — от него зависит время выбега и, значит, амплитуда удара.",
    "Время и характеристика закрытия обратного клапана: захлопка и клапан с демпфированием дают разные пики.",
    "Уставки и время срабатывания противоударных клапанов, объём и начальное давление гидропневмобаков.",
    "Профиль трассы с отметками — уже есть в расчёте, передаётся вместе с узловой таблицей.",
    "Пропускная способность вантузов по впуску и выпуску воздуха по графикам изготовителя.",
    "Сценарии: полное отключение питания, остановка одной промежуточной станции, резкое закрытие задвижки, повторное заполнение после опорожнения.",
  ];

  return {
    qM3H: r1(qM3H),
    qM3s: r3(qM3s),
    outerMm,
    wallMm,
    innerMm: Math.round(innerM * 1000),
    velocity: r2(hl.velocity),
    headloss: {
      ...hl,
      i: Number(hl.i.toFixed(6)),
      iShevelev: Number(hl.iShevelev.toFixed(6)),
      iAltshul: Number(hl.iAltshul.toFixed(6)),
      iHazen: Number(hl.iHazen.toFixed(6)),
      velocity: r2(hl.velocity),
      lambda: Number(hl.lambda.toFixed(4)),
      reynolds: Math.round(hl.reynolds),
    },
    lengthM: Math.round(lengthM),
    geoLiftM: r2(geoLift),
    totalLossM: r1(totalLoss),
    totalHeadM: r1(totalHead),
    nodes,
    stations,
    stageHeadM: r1(stageHead),
    pnBar,
    maxWorkingBar: r2(maxWorkingBar),
    wall: {
      byPressureMm: r2(requiredWall),
      byTestMm: r2(testWall),
      acceptedMm: wallMm,
      hoopStressMPa: r1(hoop),
      bucklingBar: r2(buckle),
      vacuumOk: buckle >= 1.0,
    },
    hammer,
    airValves,
    drains,
    power,
    options,
    assumptions,
    warnings,
    transientBrief,
  };
}
