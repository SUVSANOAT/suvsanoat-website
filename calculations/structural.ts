/* ==================================================================
 * КОНСТРУКТИВ ЖЕЛЕЗОБЕТОННЫХ ЁМКОСТЕЙ: ВСПЛЫТИЕ, СТЕНЫ, АРМИРОВАНИЕ
 *
 * До сих пор толщины стен и днища в расчёте были приняты по практике:
 * 250 мм стена, 300 мм днище — и в примечании честно написано, что их
 * надо проверить расчётом. Здесь эта проверка и делается.
 *
 * ЧТО ИМЕННО ПРОВЕРЯЕТСЯ И ПОЧЕМУ ЭТО ТРИ РАЗНЫЕ ЗАДАЧИ
 *
 * 1. ВСПЛЫТИЕ. Пустая заглублённая ёмкость при высоком уровне грунтовых
 *    вод — это понтон. Архимедова сила не знает, что внутри сооружение
 *    очистки: она считает объём вытесненной воды. Аэротенк 12 × 6 × 4 м
 *    вытесняет около 290 тонн воды, а весит бетоном около 190 тонн.
 *    Разница в сто тонн поднимает его вверх, рвёт трубопроводы и
 *    ломает днище. Это самая частая авария на опорожнённых сооружениях
 *    и самое частое замечание экспертизы, и считается она чистой
 *    статикой — никаких таблиц не нужно, нужна честная арифметика.
 *
 * 2. СТЕНА НА ИЗГИБ. Стена ёмкости работает как консоль, защемлённая в
 *    днище. Снаружи её давит грунт и грунтовая вода, изнутри — сточная
 *    вода. Опасно не «полное» состояние, а два крайних: ёмкость пустая
 *    при высокой воде снаружи (давит внутрь) и ёмкость полная при сухом
 *    грунте (давит наружу). Считать надо оба и брать худший.
 *
 * 3. ТРЕЩИНОСТОЙКОСТЬ. Ёмкость для воды рассчитывают не по прочности —
 *    прочности там с большим запасом, — а по раскрытию трещин. Стена,
 *    которая не рухнет, но даст волосяную трещину на всю высоту, будет
 *    течь, и её придётся инъектировать. Отсюда и минимальные толщины, и
 *    защитный слой, и требование к шагу стержней.
 *
 * ГРАНИЦА ЧЕСТНОСТИ
 * Расчётные сопротивления бетона и арматуры здесь справочные, порядок
 * расчёта — обычный для изгибаемого элемента прямоугольного сечения.
 * Это ПРЕДВАРИТЕЛЬНЫЙ расчёт: он говорит, проходит ли принятая толщина
 * по порядку величины и сколько примерно нужно арматуры. Рабочее
 * армирование выпускает конструктор по ҚМҚ 2.03.01 с проверкой
 * раскрытия трещин, продавливания и по расчёту основания. Ни одна
 * строка отсюда не заменяет этот расчёт и не идёт в рабочие чертежи
 * без его проверки.
 * ================================================================== */

/* --- справочные материалы ---
   Значения общеизвестные и совпадают в ҚМҚ 2.03.01 и в СП 63; они
   приведены, чтобы предварительный расчёт можно было сделать, а не
   чтобы заменить нормативную таблицу. */
export const CONCRETE: Record<string, { rbMPa: number; rbtMPa: number; note: string }> = {
  B20: { rbMPa: 11.5, rbtMPa: 0.9, note: "минимум для несущих конструкций, для водонепроницаемых ёмкостей применяется редко" },
  B25: { rbMPa: 14.5, rbtMPa: 1.05, note: "обычный класс для ёмкостных сооружений очистки" },
  B30: { rbMPa: 17.0, rbtMPa: 1.15, note: "при большой глубине и агрессивной среде" },
  B35: { rbMPa: 19.5, rbtMPa: 1.3, note: "при глубине свыше 6 м и сильной агрессии" },
};

export const REBAR: Record<string, { rsMPa: number; note: string }> = {
  A400: { rsMPa: 350, note: "рабочая арматура ёмкостей" },
  A500: { rsMPa: 435, note: "при большой нагрузке; хуже по трещиностойкости при том же сечении" },
};

/** Практика проектирования ёмкостных сооружений — не норматив. */
export const STRUCT_PRACTICE = {
  upliftSafety: { value: 1.15, note: "коэффициент устойчивости против всплытия 1,15 — обычное требование экспертизы; при отсутствии данных изысканий принимают 1,2" },
  coverMm: { value: 40, note: "защитный слой 40 мм со стороны воды и грунта — среда влажная, к арматуре предъявляются повышенные требования" },
  minWallByHeight: { value: 12, note: "толщина стены не менее 1/12 её высоты — практика для водонепроницаемых ёмкостей: тоньше не обеспечивается трещиностойкость независимо от прочности" },
  minWallMm: { value: 200, note: "стена монолитной ёмкости для воды тоньше 200 мм не бетонируется: не проходит вибратор и не выдерживается защитный слой с двух сторон" },
  minSlabMm: { value: 250, note: "днище тоньше 250 мм для заглублённых ёмкостей не принимают" },
  minRebarPct: { value: 0.3, note: "минимальный процент армирования 0,3 % в каждом направлении с каждой стороны — для ёмкостей выше конструктивного минимума изгибаемых элементов, потому что работает усадка и температура" },
  concreteDensity: { value: 2.5, note: "плотность железобетона 2,5 т/м³" },
  waterDensity: { value: 1.0, note: "плотность воды 1,0 т/м³" },
  soilDensity: { value: 1.8, note: "плотность грунта засыпки 1,8 т/м³; во взвешенном состоянии ниже уровня воды — 1,0 т/м³" },
  surchargeKPa: { value: 10, note: "пригрузка на поверхности 10 кПа — проезд техники обслуживания; при постоянном проезде тяжёлой техники задаётся отдельно" },
  frictionAngle: { value: 30, note: "угол внутреннего трения грунта засыпки 30° — до данных изысканий" },
} as const;

export type StructInput = {
  /** длина в свету, м */
  L: number;
  /** ширина в свету, м */
  B: number;
  /** полная высота стены (рабочая глубина + борт), м */
  H: number;
  /** заглубление низа днища от планировочной отметки, м */
  buryM: number;
  /** уровень грунтовых вод от планировочной отметки, м; не задан — воды нет */
  gwlM?: number;
  /** толщина стены, мм */
  wallMm: number;
  /** толщина днища, мм */
  slabMm: number;
  /** толщина перекрытия, мм; 0 — открытая ёмкость */
  coverMm?: number;
  concrete?: keyof typeof CONCRETE;
  rebar?: keyof typeof REBAR;
  /** угол внутреннего трения грунта, ° */
  phiDeg?: number;
  /** пригрузка на поверхности, кПа */
  surchargeKPa?: number;
  /** консольный выступ днища за наружную грань стены, м — пригруз грунтом против всплытия */
  ledgeM?: number;
};

export type UpliftCheck = {
  /** выталкивающая сила, т */
  buoyancyT: number;
  /** собственный вес конструкции, т */
  weightT: number;
  /** вес грунта на выступах днища, т */
  soilOnLedgeT: number;
  /** коэффициент устойчивости */
  factor: number;
  ok: boolean;
  /** сколько тонн не хватает */
  deficitT: number;
  /** требуемая дополнительная толщина днища, мм */
  extraSlabMm: number;
  comment: string;
};

export type WallCheck = {
  /** расчётный случай */
  caseName: string;
  /** момент в заделке, кН·м на 1 м стены */
  momentKNm: number;
  /** требуемая рабочая высота сечения по прочности, мм */
  h0RequiredMm: number;
  /** принятая рабочая высота, мм */
  h0Mm: number;
  ok: boolean;
  /** требуемая площадь арматуры, см² на 1 м */
  asCm2: number;
  /** конструктивный минимум, см² на 1 м */
  asMinCm2: number;
  /** подобранная сетка */
  bars: string;
};

export type StructResult = {
  uplift: UpliftCheck;
  walls: WallCheck[];
  /** минимальные толщины по практике, мм */
  minWallMm: number;
  minSlabMm: number;
  /** расход бетона и арматуры, уточнённый по принятым толщинам */
  concreteM3: number;
  rebarKg: number;
  assumptions: string[];
  warnings: string[];
};

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));

/** подбор сетки: диаметр и шаг под требуемую площадь, см²/м */
function pickBars(asCm2: number): string {
  const DIA = [10, 12, 14, 16, 20, 25];
  const STEP = [100, 125, 150, 200, 250];
  let best = "";
  let bestExcess = Infinity;
  for (const d of DIA) {
    const a1 = (Math.PI * d * d) / 4 / 100; // см² одного стержня
    for (const s of STEP) {
      const provided = (a1 * 1000) / s; // см² на 1 м
      if (provided >= asCm2 && provided - asCm2 < bestExcess) {
        bestExcess = provided - asCm2;
        best = `⌀${d} A400 с шагом ${s} мм (${provided.toFixed(2)} см²/м)`;
      }
    }
  }
  return best || "требуется сечение больше ⌀25 с шагом 100 — увеличьте толщину стены";
}

export function checkStructure(input: StructInput): StructResult {
  const warnings: string[] = [];
  const P = STRUCT_PRACTICE;
  const cls = input.concrete ?? "B25";
  const steel = input.rebar ?? "A400";
  const Rb = CONCRETE[cls].rbMPa;
  const Rs = REBAR[steel].rsMPa;

  const tw = input.wallMm / 1000;
  const ts = input.slabMm / 1000;
  const tc = (input.coverMm ?? 0) / 1000;
  const { L, B, H } = input;

  /* ================= 1. ВСПЛЫТИЕ =================
     Считается для самого опасного состояния: ёмкость опорожнена на
     чистку, грунтовая вода стоит на расчётной отметке. Воду внутри в
     удерживающие силы не включаем — она как раз слита; в этом весь
     смысл проверки. Трение грунта по боковым стенам тоже не
     учитываем: оно есть, но зависит от качества засыпки, и класть
     устойчивость сооружения на качество засыпки нельзя. */
  const Louter = L + 2 * tw;
  const Bouter = B + 2 * tw;
  const gwl = input.gwlM;
  const hSubmerged = gwl === undefined ? 0 : Math.max(0, input.buryM - gwl);

  const ledge0 = Math.max(0, input.ledgeM ?? 0);
  const planLedge = (Louter + 2 * ledge0) * (Bouter + 2 * ledge0);
  /* вытесняет воду и сама плита с выступом, и корпус выше неё */
  const buoyancy =
    (planLedge * Math.min(hSubmerged, ts) + Louter * Bouter * Math.max(0, hSubmerged - ts)) *
    P.waterDensity.value;
  const concreteM3 =
    planLedge * ts + 2 * (L + B + 2 * tw) * H * tw + (tc > 0 ? Louter * Bouter * tc : 0);
  const weight = concreteM3 * P.concreteDensity.value;

  /* грунт над выступом днища за наружную грань стены — если днище
     сделано с консолью, эта земля работает пригрузом */
  const ledge = ledge0;
  /* грунт над выступом ниже уровня воды взвешен: считать его полным
     весом — значит обмануть себя ровно в том расчёте, ради которого
     всё и делается */
  const soilCol = Math.max(0, input.buryM - ts);
  const soilWet = gwl === undefined ? 0 : Math.min(soilCol, Math.max(0, input.buryM - gwl));
  const soilDryH = Math.max(0, soilCol - soilWet);
  const ledgePerim = ledge > 0 ? 2 * (Louter + Bouter + 2 * ledge) * ledge : 0;
  const soilOnLedge =
    ledgePerim * (soilDryH * P.soilDensity.value + soilWet * (P.soilDensity.value - P.waterDensity.value));

  const hold = weight + soilOnLedge;
  const factor = buoyancy > 0 ? hold / buoyancy : Infinity;
  const need = buoyancy * P.upliftSafety.value;
  const deficit = Math.max(0, need - hold);
  /* добавочный бетон днища тоже вытесняет воду, поэтому эффективная
     плотность пригруза — разница плотностей, 1,5 т/м³, а не 2,5 */
  const extraSlab = deficit > 0 ? (deficit / (planLedge * (P.concreteDensity.value - P.waterDensity.value))) * 1000 : 0;

  let upComment: string;
  if (buoyancy === 0) {
    upComment = gwl === undefined
      ? "Уровень грунтовых вод не задан — проверка на всплытие не выполнена. Это не значит, что она не нужна: без отметки УГВ из изысканий заглублённую ёмкость проектировать нельзя."
      : "Грунтовые воды ниже низа днища — всплытие не грозит. Проверьте, что отметка взята при сезонном максимуме, а не на день бурения.";
    if (gwl === undefined) {
      warnings.push("Отметка грунтовых вод не задана. Всплытие — самая частая авария опорожнённых ёмкостей; запросите изыскания и повторите проверку.");
    }
  } else if (factor >= P.upliftSafety.value) {
    upComment = `Устойчивость обеспечена: удерживающие силы ${r1(hold)} т против выталкивающих ${r1(buoyancy)} т, коэффициент ${r2(factor)} при требуемом ${P.upliftSafety.value}.`;
  } else {
    upComment =
      `Ёмкость всплывает: выталкивающая сила ${r1(buoyancy)} т, удерживает только ${r1(hold)} т, коэффициент ${r2(factor)} вместо ${P.upliftSafety.value}. ` +
      `Не хватает ${r1(deficit)} т. Решения по убыванию надёжности: утолщить днище примерно на ${Math.ceil(extraSlab / 10) * 10} мм, ` +
      `сделать консольный выступ днища и загрузить его грунтом, поставить анкерные сваи, устроить постоянный пластовый дренаж с гарантированным водоотливом. ` +
      `Последнее — самое дешёвое и самое рискованное: дренаж отключат, насос сгорит, и ёмкость всплывёт в тот же месяц.`;
    warnings.push(`Проверка на всплытие не проходит: коэффициент ${r2(factor)} при требуемом ${P.upliftSafety.value}. Это блокирующее замечание, а не рекомендация.`);
    /* Утолщение днища работает не всегда: добавочный бетон сам
       вытесняет воду, и с каждым сантиметром отдача падает. Плита
       толще примерно 600 мм означает, что балласт задачу не решает и
       нужен другой способ — выступ с грунтом или анкеры. */
    if (extraSlab > 600) {
      warnings.push(
        `Балластом задачу не решить: потребовалась бы плита толщиной ${Math.round(extraSlab)} мм сверх принятой. Бетон под водой даёт всего 1,5 т с кубометра, потому что вытесняет воду сам. Нужен консольный выступ днища с пригрузом грунтом или анкерные сваи — считайте по ним.`,
      );
    }
  }

  const uplift: UpliftCheck = {
    buoyancyT: r1(buoyancy),
    weightT: r1(weight),
    soilOnLedgeT: r1(soilOnLedge),
    factor: Number.isFinite(factor) ? r2(factor) : 99,
    ok: buoyancy === 0 || factor >= P.upliftSafety.value,
    deficitT: r1(deficit),
    extraSlabMm: Math.round(extraSlab),
    comment: upComment,
  };

  /* ================= 2. СТЕНА НА ИЗГИБ =================
     Стена — консоль высотой H, защемлённая в днище. Момент в заделке
     от треугольной эпюры q·H²/6 (нагрузка растёт линейно), от
     равномерной пригрузки — q·H²/2.

     Два случая, и оба обязательны:
     а) ёмкость ПУСТАЯ, снаружи грунт и вода — давление внутрь;
     б) ёмкость ПОЛНАЯ, снаружи ничего (котлован не засыпан или
        сооружение наземное) — давление наружу.
     Арматура нужна с обеих сторон, потому что знак момента меняется. */
  const phi = (input.phiDeg ?? P.frictionAngle.value) * (Math.PI / 180);
  const Ka = Math.tan(Math.PI / 4 - phi / 2) ** 2;
  const q0 = input.surchargeKPa ?? P.surchargeKPa.value;

  const hw = gwl === undefined ? 0 : Math.max(0, Math.min(H, input.buryM - gwl));
  /* грунт выше воды — полный вес, ниже — во взвешенном состоянии */
  const hDry = Math.max(0, H - hw);
  const gammaDry = P.soilDensity.value * 9.81;              // кН/м³
  const gammaSub = (P.soilDensity.value - 1.0) * 9.81;      // кН/м³ взвешенный
  const gammaW = 9.81;

  /* момент от активного давления грунта: сухая часть сверху,
     взвешенная снизу, плюс полное гидростатическое давление воды */
  const mSoilDry = (Ka * gammaDry * hDry * hDry * hDry) / 6 + (Ka * gammaDry * hDry) * hw * (hw / 2);
  const mSoilSub = (Ka * gammaSub * hw * hw * hw) / 6;
  const mWater = (gammaW * hw * hw * hw) / 6;
  const mSurcharge = (Ka * q0 * H * H) / 2;
  const mOutside = mSoilDry + mSoilSub + mWater + mSurcharge;

  /* изнутри — сточная вода на полную высоту */
  const mInside = (gammaW * H * H * H) / 6;

  const h0 = input.wallMm - P.coverMm.value - 8; // минус защитный слой и половина стержня
  const cases: { name: string; m: number }[] = [
    { name: "Ёмкость пустая, снаружи грунт и грунтовая вода", m: mOutside },
    { name: "Ёмкость полная, снаружи засыпки нет", m: mInside },
  ];

  const walls: WallCheck[] = cases.map((c) => {
    const M = c.m * 1000; // Н·м на 1 м
    /* требуемая рабочая высота при предельном am = 0,289 (ξ = 0,55) */
    const h0Req = Math.sqrt(M / (0.289 * Rb * 1e6 * 1.0)) * 1000;
    const h0m = h0 / 1000;
    const am = h0m > 0 ? M / (Rb * 1e6 * 1.0 * h0m * h0m) : 1;
    const zeta = am < 0.5 ? 0.5 * (1 + Math.sqrt(1 - 2 * am)) : 0.5;
    const As = M / (Rs * 1e6 * zeta * h0m) * 1e4; // см² на 1 м
    const asMin = (P.minRebarPct.value / 100) * input.wallMm * 1000 / 100; // см² на 1 м
    const asTake = Math.max(As, asMin);
    return {
      caseName: c.name,
      momentKNm: r1(c.m),
      h0RequiredMm: Math.round(h0Req),
      h0Mm: Math.round(h0),
      ok: h0 >= h0Req,
      asCm2: r2(As),
      asMinCm2: r2(asMin),
      bars: pickBars(asTake),
    };
  });

  /* ================= 3. МИНИМАЛЬНЫЕ ТОЛЩИНЫ ================= */
  const minWall = Math.max(P.minWallMm.value, Math.ceil((H * 1000) / P.minWallByHeight.value / 10) * 10);
  const minSlab = Math.max(P.minSlabMm.value, Math.round(input.wallMm * 1.2));

  if (input.wallMm < minWall) {
    warnings.push(
      `Толщина стены ${input.wallMm} мм меньше практического минимума ${minWall} мм для высоты ${H} м. Прочности может хватать, а трещиностойкости — нет: стена не рухнет, но потечёт.`,
    );
  }
  if (input.slabMm < minSlab) {
    warnings.push(`Толщина днища ${input.slabMm} мм меньше ${minSlab} мм — днище принимают толще стены, в него защемлены стены и через него идёт отпор основания.`);
  }
  walls.filter((w) => !w.ok).forEach((w) =>
    warnings.push(`Случай «${w.caseName}»: требуемая рабочая высота ${w.h0RequiredMm} мм, принятая ${w.h0Mm} мм. Толщину стены надо увеличить или ставить контрфорсы.`),
  );

  const rebarKg = concreteM3 * 100; /* ориентир 100 кг/м³ для ёмкостей; уточняется по подобранным сеткам */

  return {
    uplift,
    walls,
    minWallMm: minWall,
    minSlabMm: minSlab,
    concreteM3: r2(concreteM3),
    rebarKg: Math.round(rebarKg),
    assumptions: [
      `Бетон ${cls} (Rb = ${Rb} МПа), арматура ${steel} (Rs = ${Rs} МПа) — справочные расчётные сопротивления; окончательные принимаются по ҚМҚ 2.03.01.`,
      `Коэффициент активного давления Ka = ${r2(Ka)} при угле внутреннего трения ${input.phiDeg ?? P.frictionAngle.value}° (${P.frictionAngle.note}).`,
      `Пригрузка на поверхности ${q0} кПа — ${P.surchargeKPa.note}.`,
      `${P.upliftSafety.note}. Трение грунта по боковым стенам в удерживающие силы не включено: оно зависит от качества засыпки.`,
      `${P.minWallByHeight.note}; ${P.coverMm.note}.`,
      "Расчёт предварительный: он показывает порядок толщин и армирования. Рабочее армирование, раскрытие трещин, продавливание и расчёт основания выполняет конструктор.",
    ],
    warnings,
  };
}
