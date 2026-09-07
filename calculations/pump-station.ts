/* ==================================================================
 * КНС: ГИДРАВЛИЧЕСКИЙ УДАР И ЧИСЛО ВКЛЮЧЕНИЙ НАСОСА
 *
 * В pump-main.ts посчитаны диаметр, напор и насос, а два вопроса
 * оставлены с пометкой «отдельная задача». Вот они.
 *
 * 1. ГИДРАВЛИЧЕСКИЙ УДАР
 *
 * Напорный коллектор от КНС рвётся не от рабочего давления. Он рвётся
 * в момент, когда пропадает электричество: насос останавливается за
 * секунду, столб воды в трубе длиной в километр по инерции продолжает
 * идти вперёд, за насосом образуется разрежение, потом столб
 * возвращается и бьёт в закрывшийся обратный клапан. Давление в этот
 * момент считается по Жуковскому:
 *
 *   Δh = a·v / g
 *
 * где a — скорость распространения волны в трубе. Для стали это около
 * тысячи метров в секунду, и при v = 1,5 м/с прибавка — 150 метров
 * напора. Для полиэтилена a втрое-впятеро меньше, и это главный
 * аргумент за полиэтилен на длинных напорных линиях — не цена.
 *
 * Опаснее самого повышения — понижение. Когда насос встал, давление
 * за ним падает на ту же величину, и если оно уходит ниже давления
 * насыщенных паров, столб воды разрывается: образуется полость, а
 * затем она схлопывается с ударом, который уже не считается по
 * Жуковскому — он больше. Разрыв сплошности потока и есть то, что
 * ломает трубы и клапаны, и проверяется он первым.
 *
 * 2. ЧИСЛО ВКЛЮЧЕНИЙ
 *
 * Двигатель при каждом пуске греется сильнее, чем за минуты работы:
 * пусковой ток в пять-семь раз выше номинального. Поэтому у каждого
 * двигателя есть допустимое число пусков в час, и оно тем меньше, чем
 * двигатель больше. Число пусков задаётся рабочим объёмом резервуара
 * между уровнями включения и выключения — не полным объёмом. Худший
 * случай — приток ровно в половину подачи: тогда насос и работает, и
 * стоит одинаковое время, и цикл самый короткий:
 *
 *   T_min = 4·V_раб / Q_насоса,   пусков в час Z = Q / (4·V_раб)
 *
 * ЧЕСТНОЕ ЗАМЕЧАНИЕ К ПУНКТУ 5.18
 * Если ВЕСЬ пятиминутный объём по п. 5.18 сделать рабочим — между
 * уровнями, — насос включается не чаще трёх раз в час, и этого
 * хватает любому двигателю. Проблема возникает, когда пять минут
 * принимают как полный объём резервуара, а рабочий между уровнями
 * оказывается втрое меньше: тогда пусков уже девять в час, и для
 * двигателя на 30 кВт это предел. Модуль считает именно рабочий объём
 * и прямо пишет, какой он должен быть.
 * ================================================================== */

const G = 9.81;
/** модуль объёмной упругости воды, Па */
const K_WATER = 2.03e9;
const RHO = 1000;

/** Модули упругости материалов труб и типичные отношения D/δ — практика. */
export const PIPE_MATERIAL = {
  steel: { E: 2.06e11, dOverT: 50, label: "сталь", note: "стенка 1/50 диаметра — обычная для канализационных напорных линий" },
  castIron: { E: 1.0e11, dOverT: 20, label: "чугун (ВЧШГ)", note: "стенка 1/20 диаметра" },
  pe: { E: 1.0e9, dOverT: 17, label: "полиэтилен ПЭ100 SDR17", note: "модуль упругости для кратковременной нагрузки ~1 ГПа; SDR17 — обычный для напорной канализации" },
  grp: { E: 2.0e10, dOverT: 40, label: "стеклопластик", note: "модуль по окружному направлению ~20 ГПа" },
} as const;

export type PipeMaterialKind = keyof typeof PIPE_MATERIAL;

/** Допустимое число пусков в час по мощности двигателя — практика. */
export const STARTS_PER_HOUR: { maxKW: number; starts: number; note: string }[] = [
  { maxKW: 7.5, starts: 20, note: "до 7,5 кВт — 20 пусков в час" },
  { maxKW: 30, starts: 12, note: "7,5–30 кВт — 12 пусков в час" },
  { maxKW: 90, starts: 8, note: "30–90 кВт — 8 пусков в час" },
  { maxKW: Infinity, starts: 5, note: "свыше 90 кВт — 5 пусков в час" },
];

export const PUMP_STATION_PRACTICE = {
  vaporHeadM: { value: -7, note: "разрежение −7 м считается предельным: ниже давление подходит к давлению насыщенных паров, столб воды рвётся" },
  pnReserve: { value: 1.25, note: "расчётное давление при ударе не должно превышать номинальное давление трубы; запас 25 % на неучтённое" },
  softStartFactor: { value: 1.5, note: "при плавном пуске допустимое число пусков в час можно поднять примерно в полтора раза — нагрев при пуске меньше" },
  alternation: { value: true, note: "чередование рабочих насосов делит пуски между машинами; учитывается, если насосов два и более" },
} as const;

export type HammerInput = {
  /** скорость в напорной линии, м/с */
  velocityMs: number;
  /** длина напорной линии, м */
  lengthM: number;
  /** внутренний диаметр, мм */
  dnMm: number;
  material: PipeMaterialKind;
  /** отношение D/δ, если известна стенка */
  dOverT?: number;
  /** статический напор у насоса (геометрический подъём), м */
  staticHeadM: number;
  /** рабочий напор насоса, м */
  pumpHeadM: number;
  /** номинальное давление трубы, м вод. ст. (PN10 = 100 м) */
  pipePnM?: number;
  /** есть ли высокая точка на трассе выше отметки насоса, м над насосом */
  highPointM?: number;
};

export type HammerResult = {
  /** скорость волны, м/с */
  waveSpeedMs: number;
  /** фаза удара 2L/a, с */
  phaseS: number;
  /** прибавка напора по Жуковскому, м */
  joukowskyM: number;
  /** наибольший напор при ударе, м */
  maxHeadM: number;
  /** наименьший напор у насоса при остановке, м */
  minHeadM: number;
  /** наименьший напор в высокой точке, м */
  minHeadHighPointM?: number;
  /** разрыв сплошности потока */
  columnSeparation: boolean;
  /** давление превышает допустимое для трубы */
  overPressure: boolean;
  /** требуемое PN трубы, м */
  requiredPnM: number;
  protection: string[];
  assumptions: string[];
  warnings: string[];
};

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));

export function waterHammer(input: HammerInput): HammerResult {
  const warnings: string[] = [];
  const m = PIPE_MATERIAL[input.material];
  const dOverT = input.dOverT ?? m.dOverT;

  /* скорость волны: a = √(K/ρ) / √(1 + (K/E)·(D/δ)) */
  const a0 = Math.sqrt(K_WATER / RHO);
  const a = a0 / Math.sqrt(1 + (K_WATER / m.E) * dOverT);

  const v = Math.max(0, input.velocityMs);
  const L = Math.max(1, input.lengthM);
  const phase = (2 * L) / a;

  /* ПРЯМОЙ УДАР. Остановка насоса при потере питания — это остановка
     быстрее фазы удара почти всегда: у погружного насоса маховых масс
     нет, он встаёт за доли секунды. Поэтому считается полный удар по
     Жуковскому, без снижения на время закрытия. Это верхняя оценка, и
     здесь она принята сознательно — недооценить удар дороже. */
  const dh = (a * v) / G;

  const maxHead = input.pumpHeadM + dh;
  const minHead = input.staticHeadM - dh;
  const minHigh = input.highPointM !== undefined ? input.staticHeadM - input.highPointM - dh : undefined;

  const separation =
    minHead < PUMP_STATION_PRACTICE.vaporHeadM.value ||
    (minHigh !== undefined && minHigh < PUMP_STATION_PRACTICE.vaporHeadM.value);

  const requiredPn = maxHead * PUMP_STATION_PRACTICE.pnReserve.value;
  const pn = input.pipePnM ?? 100;
  const over = maxHead > pn;

  const protection: string[] = [];
  if (separation) {
    protection.push(
      "Разрыв сплошности потока — главная опасность на этой линии. Средства по убыванию надёжности: воздушно-гидравлический колпак у насосов (подпитывает линию при остановке), впускные воздушные клапаны в высоких точках (впускают воздух вместо образования вакуума), увеличение маховой массы агрегата.",
    );
  }
  if (over || dh > 30) {
    protection.push(
      "Обратный клапан у насоса — с демпфированием закрытия (гидротормоз или подпружиненный), а не захлопка: захлопка закрывается в момент возврата столба и принимает удар целиком.",
    );
    protection.push("Гаситель удара или предохранительный клапан на напорном коллекторе после обратного клапана — сбрасывает пик давления при возврате столба.");
  }
  if (input.material === "steel" || input.material === "castIron") {
    protection.push(
      `Скорость волны в ${m.label} ${Math.round(a)} м/с. В полиэтилене она была бы около ${Math.round(a0 / Math.sqrt(1 + (K_WATER / PIPE_MATERIAL.pe.E) * PIPE_MATERIAL.pe.dOverT))} м/с, и удар — в несколько раз меньше. На длинной линии это довод за полиэтилен сильнее цены.`,
    );
  }
  if (protection.length === 0) {
    protection.push("Удар в допустимых пределах: обратный клапан с демпфированием и вантузы в высоких точках — как обычная практика, без специальных гасителей.");
  }

  if (separation) {
    warnings.push(
      `Разрыв сплошности потока: при остановке насоса напор у него падает до ${r1(minHead)} м${minHigh !== undefined ? `, в высокой точке до ${r1(minHigh)} м` : ""} — ниже предельного ${PUMP_STATION_PRACTICE.vaporHeadM.value} м. Столб воды разорвётся и схлопнется с ударом, который больше расчётного по Жуковскому. Без защиты линию эксплуатировать нельзя.`,
    );
  }
  if (over) {
    warnings.push(
      `Напор при ударе ${r1(maxHead)} м превышает номинальное давление трубы ${pn} м. Нужна труба на PN не ниже ${Math.ceil(requiredPn / 10) * 10} м или защита, снижающая удар.`,
    );
  }
  if (phase < 1 && L > 200) {
    warnings.push(`Фаза удара ${r2(phase)} с — короткая линия в жёсткой трубе. Любая арматура, закрывающаяся быстрее ${r2(phase)} с, даёт полный удар: задвижки с электроприводом обязаны закрываться медленнее.`);
  }

  return {
    waveSpeedMs: Math.round(a),
    phaseS: r2(phase),
    joukowskyM: r1(dh),
    maxHeadM: r1(maxHead),
    minHeadM: r1(minHead),
    minHeadHighPointM: minHigh !== undefined ? r1(minHigh) : undefined,
    columnSeparation: separation,
    overPressure: over,
    requiredPnM: Math.ceil(requiredPn / 10) * 10,
    protection,
    assumptions: [
      `Скорость волны a = ${Math.round(a)} м/с при E = ${(m.E / 1e9).toFixed(1)} ГПа (${m.label}) и D/δ = ${dOverT} (${m.note}).`,
      "Повышение напора — по Жуковскому Δh = a·v/g при мгновенной остановке: у погружных насосов маховых масс нет, они встают быстрее фазы удара. Это верхняя оценка, принятая сознательно.",
      `${PUMP_STATION_PRACTICE.vaporHeadM.note}.`,
      `${PUMP_STATION_PRACTICE.pnReserve.note}.`,
      "Расчёт по Жуковскому даёт порядок величины. Для линии длиннее километра или с несколькими высокими точками нужен расчёт переходного процесса по методу характеристик с профилем трассы — здесь его нет.",
    ],
    warnings,
  };
}

export type CyclingInput = {
  /** подача одного насоса, м³/ч */
  pumpM3h: number;
  /** мощность двигателя, кВт */
  motorKW: number;
  /** рабочий объём резервуара между уровнями включения и выключения, м³ */
  workingVolumeM3: number;
  /** полный объём резервуара по п. 5.18, м³ — для сравнения */
  totalVolumeM3?: number;
  /** число рабочих насосов с чередованием */
  pumps?: number;
  softStart?: boolean;
};

export type CyclingResult = {
  /** допустимо пусков в час на двигатель */
  allowedStarts: number;
  /** наибольшее число пусков в час при худшем притоке */
  maxStarts: number;
  /** на один насос с учётом чередования */
  startsPerPump: number;
  /** наименьший цикл, мин */
  minCycleMin: number;
  ok: boolean;
  /** требуемый рабочий объём, м³ */
  requiredWorkingM3: number;
  /** рабочий объём, дающий 3 пуска в час (весь объём п. 5.18 между уровнями), м³ */
  volume518M3: number;
  assumptions: string[];
  warnings: string[];
};

export function pumpCycling(input: CyclingInput): CyclingResult {
  const warnings: string[] = [];
  const Q = Math.max(0.1, input.pumpM3h);
  const V = Math.max(0.01, input.workingVolumeM3);
  const pumps = Math.max(1, Math.round(input.pumps ?? 1));

  const row = STARTS_PER_HOUR.find((r) => input.motorKW <= r.maxKW) ?? STARTS_PER_HOUR[STARTS_PER_HOUR.length - 1];
  let allowed = row.starts;
  if (input.softStart) allowed = Math.round(allowed * PUMP_STATION_PRACTICE.softStartFactor.value);

  /* худший приток — половина подачи: Z = Q/(4V) в час */
  const maxStarts = Q / (4 * V);
  const perPump = maxStarts / pumps;
  const minCycle = (4 * V) / Q * 60;
  const required = (Q / (4 * allowed)) * (1 / pumps);
  const v518 = Q * (5 / 60);

  const ok = perPump <= allowed;
  if (!ok) {
    warnings.push(
      `Пусков в час на насос ${r1(perPump)} при допустимых ${allowed} для двигателя ${input.motorKW} кВт. Рабочий объём между уровнями надо увеличить до ${r2(required)} м³ — или поднять уровень включения, если глубина резервуара позволяет.`,
    );
  }
  if (input.totalVolumeM3 !== undefined && V < input.totalVolumeM3 * 0.5) {
    warnings.push(
      `Рабочий объём ${r2(V)} м³ — меньше половины полного ${r2(input.totalVolumeM3)} м³. Пятиминутный объём по п. 5.18 обычно принимают как полный, а число пусков определяет только часть между уровнями. Проверьте отметки включения и выключения на разрезе КНС: мёртвый объём под насосами и запас над верхним уровнем в работе не участвуют.`,
    );
  }

  return {
    allowedStarts: allowed,
    maxStarts: r1(maxStarts),
    startsPerPump: r1(perPump),
    minCycleMin: r1(minCycle),
    ok,
    requiredWorkingM3: r2(required),
    volume518M3: r2(v518),
    assumptions: [
      `Допустимое число пусков в час: ${row.note} — практика; уточняется по паспорту двигателя${input.softStart ? `; при плавном пуске увеличено в ${PUMP_STATION_PRACTICE.softStartFactor.value} раза` : ""}.`,
      "Наибольшее число пусков — при притоке в половину подачи насоса: Z = Q/(4·V_раб). Это худший случай, и проверка ведётся по нему.",
      pumps > 1 ? `Чередование ${pumps} насосов делит пуски между машинами.` : "Насос один: чередования нет, все пуски приходятся на него.",
      `Если весь пятиминутный объём по п. 5.18 (${r2(v518)} м³) сделать рабочим, насос включается не чаще 3 раз в час — этого хватает любому двигателю. Проверка нужна потому, что рабочий объём обычно меньше полного.`,
    ],
    warnings,
  };
}
