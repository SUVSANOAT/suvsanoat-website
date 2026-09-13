/* ==================================================================
 * УЧАСТОК ВОДОВОДА БЕЗ ПРОФИЛЯ:
 * ТРЕБУЕМЫЙ НАПОР, ТРУБА, ОБРАТНЫЙ ГИДРОУДАР И ЗАЩИТНАЯ АРМАТУРА
 *
 * water-main.ts считает водовод целиком по продольному профилю. Но
 * профиль есть не всегда, а решение по участку нужно уже сегодня:
 * заказчик называет расход, перепад и длину — и ждёт, какой напор,
 * какая труба и какая защита.
 *
 * ЧТО ЗДЕСЬ СЧИТАЕТСЯ ЧЕСТНО, А ЧТО ТОЛЬКО ОЦЕНИВАЕТСЯ
 *
 * Честно: скорость, потери, требуемый напор, скорость ударной волны,
 * фаза удара, время торможения столба, повышение давления по
 * Жуковскому или по Мишо, требуемый класс давления, толщина стенки,
 * сравнение материалов по амплитуде удара.
 *
 * Оценивается: объём сброса, пропускная способность клапана, объём
 * гидропневмобака. Это предварительный подбор по инженерным моделям
 * (жёсткая колонна, изотермическое расширение воздуха). Он даёт
 * правильный порядок и правильный типоразмер, но не заменяет расчёта
 * переходного процесса методом характеристик.
 *
 * ЧЕГО ЗДЕСЬ НЕТ И БЫТЬ НЕ ДОЛЖНО
 *
 * Коэффициентов вида «примем снижение удара в 0,15 от расчётного».
 * Такого коэффициента не существует. Насколько защита снижает пик,
 * показывает только моделирование с фактической характеристикой
 * выбега насоса и характеристикой открытия клапана. Здесь считается
 * пик БЕЗ защиты — как то, что защита обязана не допустить, — и
 * подбираются параметры устройств, а не выдумывается результат их
 * работы.
 *
 * ГЛАВНАЯ ОШИБКА, КОТОРУЮ ЭТОТ МОДУЛЬ НЕ ДАЁТ СДЕЛАТЬ
 *
 * Объём сброса нельзя считать за одну фазу удара 2L/c. Фаза — это
 * время пробега волны, а вода тормозится под действием статического
 * напора и занимает на это своё время L·V/(g·H). На крутом коротком
 * участке эти два времени близки, и ошибка незаметна. На пологом
 * длинном они расходятся в разы, и объём сброса оказывается
 * заниженным во столько же раз. Модуль считает оба времени и
 * показывает, какое из них определяет.
 * ================================================================== */

import type { Lang } from "./i18n";
import {
  headlossGradient,
  STEEL_PIPES,
  WATER_MAIN,
  WATER_PIPE,
  type Lining,
  type WaterPipeKind,
} from "./water-main";

const G = 9.81;
const K_WATER = 2.03e9;
const RHO = 1000;
/** атмосферное давление, бар */
const ATM_BAR = 1.013;

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const SURGE = {
  valveCd: {
    value: 0.5,
    note: "коэффициент расхода противоударного клапана 0,5 — ориентировочно для полнопроходного клапана с пилотным управлением; окончательный Kv берётся из каталога изготовителя, у разных марок он отличается в полтора раза",
  },
  drainVelocity: {
    value: 5.0,
    note: "скорость в дренажном (сбросном) трубопроводе не выше 5 м/с — практика: выше растёт противодавление, и клапан перестаёт сбрасывать столько, сколько от него требуется",
  },
  minAbsBar: {
    value: 1.5,
    note: "минимальное абсолютное давление в трубе при работе гидропневмобака 1,5 бар — практика: ниже поток подходит к давлению насыщенных паров и рвётся",
  },
  drainBackPressureBar: {
    value: 1.0,
    note: "противодавление в дренажной линии 1,0 бар — практика; вычитается из перепада на клапане",
  },
  openTimeFactor: {
    value: 0.5,
    note: "клапан должен полностью открыться за время не больше половины фазы удара — иначе отражённая волна придёт в ещё закрытый клапан и сбрасывать будет нечего",
  },
  vesselReserve: {
    value: 1.2,
    note: "запас 20 % к расчётному объёму гидропневмобака — практика, на неучтённые потери и неизотермичность",
  },
  dampingCycles: {
    value: 2,
    note: "колебания затухают примерно за два цикла торможения — по этому числу оценивается полный объём сброса за одно аварийное отключение",
  },
  freeHeadEnd: {
    value: 5,
    note: "свободный напор в конце участка 5 м — практика для излива в резервуар следующей ступени",
  },
} as const;

/** Условные диаметры арматуры, мм. */
export const VALVE_DN = [50, 80, 100, 150, 200, 250, 300, 400, 500] as const;

/** Классы давления. */
export const PN_SERIES = [10, 16, 25, 32, 40, 63] as const;

/**
 * Ориентировочная пропускная способность полнопроходного клапана, м³/ч
 * при перепаде 1 бар. Kv = Cd·A·√(2·Δp/ρ), приведённое к м³/ч.
 */
export function valveKv(dnMm: number, cd = SURGE.valveCd.value): number {
  const a = (Math.PI * (dnMm / 1000) ** 2) / 4;
  return cd * a * Math.sqrt((2 * 1e5) / RHO) * 3600;
}

/* ------------------------------------------------------------------
 * ИСХОДНЫЕ ДАННЫЕ
 * ------------------------------------------------------------------ */
export type SegmentInput = {
  /** расчётный расход, м³/ч */
  qM3H: number;
  /** геодезический перепад участка, м */
  geoLiftM: number;
  /** длина участка по трубе, м */
  pipeLengthM: number;
  /** геометрическая длина — горизонтальная проекция, м; для проверки */
  planLengthM?: number;
  /** отметка начала участка — насосной станции, м; для подписи точки удара */
  startElevM?: number;
  /** название начала участка (станции) для подписи */
  startLabel?: string;
  /** название конца участка для подписи */
  endLabel?: string;

  material?: WaterPipeKind;
  lining?: Lining;
  /** наружный диаметр, мм; не задан — подбирается */
  outerMm?: number;
  /** толщина стенки, мм; не задана — подбирается по давлению */
  wallMm?: number;

  /** требуемый свободный напор в конце участка, м */
  freeHeadM?: number;
  /** число параллельных противоударных клапанов */
  valveCount?: number;
  /** вантуз, задан проектировщиком — DN, мм; не задан — подбирается */
  airValveDnMm?: number;
  /** сбросный (дренажный) трубопровод, задан — DN, мм; не задан — подбирается */
  drainDnMm?: number;
  /** класс давления, бар; не задан — подбирается */
  pnBar?: number;

  pumpEff?: number;
  motorEff?: number;
  /**
   * Язык пояснений. На числа не влияет и влиять не может: меняются
   * только формулировки предупреждений и допущений. По умолчанию
   * русский — старые вызовы работают как работали.
   */
  lang?: Lang;
};

/* ------------------------------------------------------------------
 * РЕЗУЛЬТАТ
 * ------------------------------------------------------------------ */
export type MaterialCompare = {
  kind: WaterPipeKind;
  label: string;
  /** скорость ударной волны, м/с */
  waveSpeedMs: number;
  /** повышение напора, м */
  surgeM: number;
  /** наибольшее давление без защиты, бар */
  peakBar: number;
  /** пригоден по требуемому классу давления */
  suitable: boolean;
  /**
   * Принят в расчёт. Раньше это узнавали сравнением note с русской
   * строкой «принят в расчёт» — с переводом такое сравнение молча
   * перестало бы совпадать, и страница потеряла бы выделение
   * принятого материала. Признак отдельным полем от языка не зависит.
   */
  accepted: boolean;
  note: string;
};

export type SegmentResult = {
  /* гидравлика */
  qM3s: number;
  outerMm: number;
  wallMm: number;
  innerMm: number;
  velocity: number;
  gradientMPerKm: number;
  frictionM: number;
  localM: number;
  /** требуемый напор насоса на участке, м */
  requiredHeadM: number;
  /** то же в барах */
  requiredHeadBar: number;
  shaftKW: number;
  motorKW: number;

  /* проверка длин */
  minPipeLengthM: number;
  lengthOk: boolean;

  /* труба */
  pnBar: number;
  wallByPressureMm: number;
  wallByTestMm: number;
  hoopStressMPa: number;
  bucklingBar: number;

  /* гидроудар */
  waveSpeedMs: number;
  phaseS: number;
  /** время торможения столба под статическим напором, с */
  stopTimeS: number;
  /** удар прямой (остановка быстрее фазы) или непрямой */
  direct: boolean;
  /** повышение напора, м */
  surgeM: number;
  /** наибольшее давление при обратном ударе без защиты, бар */
  peakBar: number;
  /** наименьшее давление при волне разрежения у станции, м вод. ст. */
  minHeadM: number;
  /** разрыв сплошности потока */
  separation: boolean;
  /** куда приходит обратный удар */
  peakAt: string;
  /** где разрежение */
  vacuumAt: string;

  /* защитная арматура */
  protection: {
    /** объём воды, который надо сбросить за одно отключение, м³ */
    dischargeVolumeM3: number;
    /** какое время определило объём */
    volumeGovernedBy: string;
    /** требуемая суммарная пропускная способность, м³/ч при 1 бар */
    requiredKv: number;
    valveCount: number;
    /** Kv на один клапан */
    kvPerValve: number;
    valveDnMm: number;
    valvePnBar: number;
    /** время полного открытия, с */
    openTimeS: number;
    /** дренажная линия: принятый DN */
    drainDnMm: number;
    /** дренажная линия: требуемый по скорости DN */
    drainDnRequiredMm: number;
    drainVelocity: number;
    /** приёмная ёмкость, м³ */
    receiverM3: number;
    /** гидропневмобак: начальный объём воздуха, м³ */
    vesselAirM3: number;
    /** гидропневмобак: полный объём сосуда, м³ */
    vesselTotalM3: number;
    /** вантузы: принятый DN */
    airValveCount: number;
    airValveDnMm: number;
    /** вантузы: требуемый по расходу воздуха DN */
    airValveDnRequiredMm: number;
  };

  materials: MaterialCompare[];
  assumptions: string[];
  warnings: string[];
};

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));

function pickWall(outerMm: number, requiredMm: number): number {
  const row = STEEL_PIPES.find((p) => p.outerMm === outerMm);
  if (!row) return Math.ceil(requiredMm);
  return row.walls.find((x) => x >= requiredMm) ?? row.walls[row.walls.length - 1];
}

function wallForPressure(outerMm: number, pressureBar: number, kind: WaterPipeKind): number {
  const mat = WATER_PIPE[kind];
  if (!mat.yieldMPa) return 0;
  const allow = (mat.yieldMPa / WATER_MAIN.safetyYield.value) * WATER_MAIN.weldFactor.value;
  const p = pressureBar * 0.1;
  return (p * outerMm) / (2 * allow + p) + WATER_MAIN.corrosionAllowanceMm.value;
}

/** Скорость ударной волны в трубе. */
export function waveSpeed(kind: WaterPipeKind, outerMm: number, wallMm: number): number {
  const a0 = Math.sqrt(K_WATER / RHO);
  return a0 / Math.sqrt(1 + (K_WATER / WATER_PIPE[kind].E) * (outerMm / wallMm));
}

/* ------------------------------------------------------------------
 * РАСЧЁТ
 * ------------------------------------------------------------------ */
export function calculateSegment(input: SegmentInput): SegmentResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];
  /* Обе формулировки стоят рядом с местом, где текст рождается. */
  const T = (ru: string, uz: string) => (input.lang === "uz" ? uz : ru);

  const kind: WaterPipeKind = input.material ?? "steel";
  const lining: Lining = input.lining ?? "cement";
  const mat = WATER_PIPE[kind];
  const L = Math.max(1, input.pipeLengthM);
  const dZ = Math.max(0, input.geoLiftM);
  const freeEnd = input.freeHeadM ?? SURGE.freeHeadEnd.value;
  const qM3s = Math.max(1e-6, input.qM3H) / 3600;
  const pumpEff = input.pumpEff ?? WATER_MAIN.efficiency.pump;
  const motorEff = input.motorEff ?? WATER_MAIN.efficiency.motor;

  /* ------------------------------------------------------------------
     ПРОВЕРКА ДЛИН

     Геометрическая длина — это горизонтальная проекция, длина трубы
     всегда больше: она идёт по склону. Минимум — гипотенуза. Если
     заданная длина трубы меньше, где-то ошибка в исходных данных, и
     дальше считать бессмысленно: потери выйдут заниженными.
     ------------------------------------------------------------------ */
  const minPipeLength = input.planLengthM ? Math.sqrt(input.planLengthM ** 2 + dZ ** 2) : 0;
  const lengthOk = !input.planLengthM || L >= minPipeLength - 0.5;
  if (!lengthOk) {
    warnings.push(
      T(
        `Длина трубы ${Math.round(L)} м меньше минимально возможной ${Math.round(minPipeLength)} м для проекции ${Math.round(input.planLengthM ?? 0)} м при перепаде ${r1(dZ)} м. Труба не может быть короче гипотенузы — проверьте исходные данные: либо длина по трассе, либо перепад заданы неверно.`,
        `Quvur uzunligi ${Math.round(L)} m — ${Math.round(input.planLengthM ?? 0)} m proyeksiya va ${r1(dZ)} m balandlik farqi uchun mumkin bo‘lgan eng kichik ${Math.round(minPipeLength)} m dan kam. Quvur gipotenuzadan qisqa bo‘la olmaydi — dastlabki ma’lumotlarni tekshiring: yo trassa uzunligi, yo balandlik farqi noto‘g‘ri berilgan.`,
      ),
    );
  }

  /* ------------------------------------------------------------------
     ДИАМЕТР
     ------------------------------------------------------------------ */
  let outerMm = input.outerMm ?? 0;
  if (!outerMm) {
    const scored = STEEL_PIPES.map((p) => {
      const inner = (p.outerMm - 2 * p.walls[0]) / 1000;
      const v = qM3s / ((Math.PI * inner * inner) / 4);
      return { outerMm: p.outerMm, v };
    }).filter((x) => x.v >= 0.5 && x.v <= WATER_MAIN.maxVelocity.value);
    outerMm =
      scored.sort(
        (a, b) => Math.abs(a.v - WATER_MAIN.economicVelocity.target) - Math.abs(b.v - WATER_MAIN.economicVelocity.target),
      )[0]?.outerMm ?? 530;
  }
  let wallMm = input.wallMm ?? STEEL_PIPES.find((p) => p.outerMm === outerMm)?.walls[0] ?? 8;
  let innerM = (outerMm - 2 * wallMm) / 1000;
  let hl = headlossGradient(qM3s, innerM, kind, lining);

  /* ------------------------------------------------------------------
     ТРЕБУЕМЫЙ НАПОР
     ------------------------------------------------------------------ */
  const friction = hl.i * L;
  const local = friction * WATER_MAIN.localShare.value + WATER_MAIN.stationLocalM.value;
  const requiredHead = dZ + friction + local + freeEnd;

  /* класс давления и стенка — по требуемому напору с запасом */
  const workBar = requiredHead / 10.197;
  const pnBar =
    input.pnBar ?? PN_SERIES.find((p) => p >= workBar * WATER_MAIN.hammerReserve.value) ?? PN_SERIES[PN_SERIES.length - 1];

  const wallByPressure = wallForPressure(outerMm, pnBar, kind);
  const wallByTest = wallForPressure(outerMm, pnBar * 1.25, kind);
  if (!input.wallMm) {
    wallMm = pickWall(outerMm, Math.max(wallByPressure, wallByTest));
    innerM = (outerMm - 2 * wallMm) / 1000;
    hl = headlossGradient(qM3s, innerM, kind, lining);
  }

  const area = (Math.PI * innerM * innerM) / 4;
  const v = qM3s / area;

  const shaftKW = (RHO * G * qM3s * requiredHead) / 1000 / pumpEff;
  const motorKW = shaftKW / motorEff;

  const hoop = ((workBar * WATER_MAIN.hammerReserve.value * 0.1) * (outerMm - 2 * wallMm)) / (2 * wallMm);
  const dMean = outerMm - wallMm;
  const buckling = ((2 * mat.E) / (1 - 0.09)) * (wallMm / dMean) ** 3 / 1e5 / WATER_MAIN.vacuumSafety.value;

  /* ------------------------------------------------------------------
     ГИДРОУДАР

     Два времени, и оба важны.

     Фаза удара t0 = 2L/c — время пробега волны до конца участка и
     обратно. За это время отражённая волна возвращается к насосу.

     Время торможения столба t = L·V/(g·H) — за сколько статический
     напор останавливает движущуюся воду. Это модель жёсткой колонны:
     сила, тормозящая столб, — вес воды на подъёме.

     Если столб останавливается быстрее, чем возвращается волна
     (t < t0), удар прямой и считается по Жуковскому на полную
     скорость. Если медленнее — удар непрямой, и повышение меньше:
     часть энергии успевает уйти. На горном водоводе, где перепад
     велик, торможение быстрое, и удар почти всегда прямой.
     ------------------------------------------------------------------ */
  const c = waveSpeed(kind, outerMm, wallMm);
  const phase = (2 * L) / c;
  const stopTime = dZ > 0 ? (L * v) / (G * dZ) : Infinity;
  const direct = stopTime < phase;
  const surgeM = direct ? (c * v) / G : (2 * L * v) / (G * stopTime);
  const peakBar = (dZ + surgeM) / 10.197;

  /* Волна разрежения уходит от остановившегося насоса вперёд: давление
     за ним падает на ту же величину. Считаем от рабочего напора. */
  const minHead = requiredHead - surgeM;
  const separation = minHead < -7;

  /* ------------------------------------------------------------------
     КУДА ПРИХОДИТ УДАР

     Обратный удар — это возврат столба воды, поднявшегося по трубе,
     обратно вниз. Он бьёт в самую нижнюю точку участка: в обратный
     клапан насосной станции и напорный коллектор за ним. Именно там
     давление наибольшее, и именно там ставится противоударный клапан.

     Разрежение — наоборот, в верхней части: волна понижения давления
     уходит от остановившейся станции вперёд, и там, где труба выше
     всего, столб рвётся первым. Там нужны вантузы и гидропневмобак
     помогает меньше — он стоит у станции.
     ------------------------------------------------------------------ */
  const startName = input.startLabel ?? T("насосная станция", "nasos stansiyasi");
  const endName = input.endLabel ?? T("конец участка", "uchastka oxiri");
  const elevNote = input.startElevM !== undefined ? T(`, отм. ${input.startElevM.toFixed(2)} м`, `, belgisi ${input.startElevM.toFixed(2)} m`) : "";
  const peakAt = T(
    `${startName}${elevNote} — обратный клапан и напорный коллектор за ним, нижняя точка участка`,
    `${startName}${elevNote} — teskari klapan va undan keyingi bosimli kollektor, uchastkaning eng past nuqtasi`,
  );
  const vacuumAt = separation
    ? T(
        `верхняя часть участка, ближе к точке «${endName}»${input.startElevM !== undefined ? ` (отм. до ${(input.startElevM + dZ).toFixed(2)} м)` : ""}: там столб рвётся первым`,
        `uchastkaning yuqori qismi, «${endName}» nuqtasiga yaqinroq${input.startElevM !== undefined ? ` (belgisi ${(input.startElevM + dZ).toFixed(2)} m gacha)` : ""}: ustun birinchi bo‘lib shu yerda uziladi`,
      )
    : T(
        `верхняя часть участка у точки «${endName}» — разрежение есть, но сплошность сохраняется`,
        `uchastkaning «${endName}» nuqtasi yonidagi yuqori qismi — siyraklanish bor, lekin oqim uzilmaydi`,
      );

  /* ------------------------------------------------------------------
     ЗАЩИТНАЯ АРМАТУРА
     ------------------------------------------------------------------ */
  /* Объём сброса: расход, проходящий за время торможения, за
     несколько циклов затухания. Именно время торможения, а не фаза
     удара, — вот главное отличие от расчёта «за одну фазу». */
  const governing = Number.isFinite(stopTime) ? Math.max(stopTime, phase) : phase;
  const dischargeVolume = qM3s * governing * SURGE.dampingCycles.value;
  const volumeGovernedBy =
    !Number.isFinite(stopTime) || stopTime >= phase
      ? T(`время торможения столба ${r2(Math.min(stopTime, 1e6))} с`, `ustunning tormozlanish vaqti ${r2(Math.min(stopTime, 1e6))} s`)
      : T(
          `фаза удара ${r2(phase)} с (торможение быстрее: ${r2(stopTime)} с)`,
          `zarba fazasi ${r2(phase)} s (tormozlanish tezroq: ${r2(stopTime)} s)`,
        );

  /* Пропускная способность: клапан должен пропустить обратный поток,
     а он по величине сравним с рабочим расходом. Перепад на клапане —
     давление в трубе минус противодавление дренажа. */
  const dpValve = Math.max(1, pnBar - SURGE.drainBackPressureBar.value);
  const requiredKv = input.qM3H / Math.sqrt(dpValve);
  const valveCount = Math.max(1, Math.round(input.valveCount ?? 1));
  const kvPerValve = requiredKv / valveCount;
  const valveDn = VALVE_DN.find((dn) => valveKv(dn) >= kvPerValve) ?? VALVE_DN[VALVE_DN.length - 1];
  /* Класс арматуры берётся на ступень выше класса трубы: клапан стоит
     на коллекторе, где пик и происходит, и запас там нужен больше, чем
     в трубе. Если защита не снизит пик ниже класса трубы, поднимать
     класс придётся обоим — об этом говорит предупреждение. */
  const valvePn = PN_SERIES.find((p) => p > pnBar) ?? PN_SERIES[PN_SERIES.length - 1];
  const openTime = phase * SURGE.openTimeFactor.value;

  /* Дренажная линия: диаметр по допустимой скорости при полном сбросе. */
  const drainArea = qM3s / SURGE.drainVelocity.value;
  const drainDnCalc = Math.sqrt((4 * drainArea) / Math.PI) * 1000;
  const drainDnRequired = VALVE_DN.find((dn) => dn >= drainDnCalc) ?? Math.ceil(drainDnCalc / 50) * 50;
  const drainDn = input.drainDnMm && input.drainDnMm > 0 ? input.drainDnMm : drainDnRequired;
  const drainVelocity = qM3s / ((Math.PI * (drainDn / 1000) ** 2) / 4);

  /* Гидропневмобак: кинетическая энергия столба поглощается работой
     расширяющегося воздуха. Изотермическое расширение — оценка
     сверху по объёму, то есть в безопасную сторону. */
  const ke = 0.5 * RHO * area * L * v * v;
  const p1 = (workBar + ATM_BAR) * 1e5;
  const p2 = SURGE.minAbsBar.value * 1e5;
  const vesselAir = ke / (p1 * Math.log(p1 / p2));
  const vesselTotal = vesselAir * (p1 / p2) * SURGE.vesselReserve.value;

  /* Вантузы: по шагу вдоль участка плюс один сразу за станцией. */
  const airValveCount = Math.max(1, Math.ceil(L / WATER_MAIN.airValveSpacingM.value)) + 1;
  const qAir = area * WATER_MAIN.drainVelocity.value;
  const vAir = Math.sqrt((2 * WATER_MAIN.airValveDropBar.value * 1e5) / 1.2);
  const aAirValve = qAir / (0.6 * vAir);
  const dAirCalc = Math.sqrt((4 * aAirValve) / Math.PI) * 1000;
  const airValveDnRequired = VALVE_DN.find((dn) => dn >= dAirCalc) ?? 250;
  const airValveDn = input.airValveDnMm && input.airValveDnMm > 0 ? input.airValveDnMm : airValveDnRequired;

  /* ------------------------------------------------------------------
     СРАВНЕНИЕ МАТЕРИАЛОВ

     Это прямой ответ на вопрос «какой материал трубопровода». Разница
     между сталью и полиэтиленом здесь не в цене и не в коррозии, а в
     том, что скорость волны в полиэтилене втрое-впятеро ниже, и удар
     соответственно меньше. На длинном напорном участке это довод
     сильнее любого другого.
     ------------------------------------------------------------------ */
  const materials: MaterialCompare[] = (Object.keys(WATER_PIPE) as WaterPipeKind[]).map((k) => {
    const cc = waveSpeed(k, outerMm, wallMm);
    const st = dZ > 0 ? (L * v) / (G * dZ) : Infinity;
    const ph = (2 * L) / cc;
    const dh = st < ph ? (cc * v) / G : (2 * L * v) / (G * st);
    const pk = (dZ + dh) / 10.197;
    const limit = k === "pe" ? 16 : k === "grp" ? 25 : 63;
    return {
      kind: k,
      label: WATER_PIPE[k].label,
      waveSpeedMs: Math.round(cc),
      surgeM: r1(dh),
      peakBar: r2(pk),
      suitable: limit >= pnBar,
      accepted: limit >= pnBar && k === kind,
      note:
        limit >= pnBar
          ? k === kind
            ? T("принят в расчёт", "hisobga qabul qilindi")
            : ""
          : T(
              `обычный предел класса давления для этого материала ${limit} бар, требуется PN${pnBar}`,
              `bu material uchun bosim klassining odatdagi chegarasi ${limit} bar, PN${pnBar} talab qilinadi`,
            ),
    };
  });

  /* ------------------------------------------------------------------
     ПРОВЕРКИ
     ------------------------------------------------------------------ */
  if (v > WATER_MAIN.maxVelocity.value) {
    warnings.push(
      T(
        `Скорость ${r2(v)} м/с выше допустимой ${WATER_MAIN.maxVelocity.value} м/с: увеличьте диаметр. Заодно упадёт и амплитуда удара — она прямо пропорциональна скорости.`,
        `Tezlik ${r2(v)} m/s — ruxsat etilgan ${WATER_MAIN.maxVelocity.value} m/s dan yuqori: diametrni kattalashtiring. Shu bilan zarba amplitudasi ham kamayadi — u tezlikka to‘g‘ri proporsional.`,
      ),
    );
  }
  if (v < 0.5) {
    warnings.push(T(`Скорость ${r2(v)} м/с ниже 0,5 м/с: труба избыточна.`, `Tezlik ${r2(v)} m/s — 0,5 m/s dan past: quvur ortiqcha katta.`));
  }
  if (peakBar > pnBar) {
    warnings.push(
      T(
        `Обратный гидроудар без защиты ${r2(peakBar)} бар против класса PN${pnBar}. Труба этого не держит: защита обязательна, а не желательна. Насколько именно она снизит пик, показывает расчёт переходного процесса — принимать снижение коэффициентом нельзя.`,
        `Himoyasiz teskari gidravlik zarba ${r2(peakBar)} bar, quvur klassi esa PN${pnBar}. Quvur buni ko‘tarmaydi: himoya majburiy, ixtiyoriy emas. U cho‘qqini qanchaga kamaytirishini o‘tkinchi jarayon hisobi ko‘rsatadi — kamayishni koeffitsiyent bilan qabul qilib bo‘lmaydi.`,
      ),
    );
  }
  if (separation) {
    warnings.push(
      T(
        `Разрыв сплошности потока: при остановке насоса напор падает до ${r1(minHead)} м. Столб воды разорвётся, и схлопывание полости даст удар больше расчётного по Жуковскому. Нужны гидропневмобак или впускные вантузы, иначе защита по давлению бесполезна.`,
        `Oqim uzluksizligining uzilishi: nasos to‘xtaganda bosim ${r1(minHead)} m gacha tushadi. Suv ustuni uziladi va bo‘shliqning yopilishi Jukovskiy bo‘yicha hisoblangandan kattaroq zarba beradi. Gidropnevmobak yoki havo kirituvchi vantuzlar kerak, aks holda bosim bo‘yicha himoya foyda bermaydi.`,
      ),
    );
  }
  if (buckling < 1.0) {
    warnings.push(
      T(
        `Критическое наружное давление ${r2(buckling)} бар с запасом ${WATER_MAIN.vacuumSafety.value} ниже атмосферного: при вакууме труба ${outerMm}×${wallMm} может смяться.`,
        `Kritik tashqi bosim ${r2(buckling)} bar, ${WATER_MAIN.vacuumSafety.value} zapas bilan atmosfera bosimidan past: vakuumda ${outerMm}×${wallMm} quvur ezilib ketishi mumkin.`,
      ),
    );
  }
  if (drainVelocity > SURGE.drainVelocity.value + 0.1) {
    warnings.push(
      T(
        `Сбросный трубопровод DN${drainDn}${input.drainDnMm ? " (задан)" : ""}: скорость ${r1(drainVelocity)} м/с при полном сбросе — выше ${SURGE.drainVelocity.value} м/с. Противодавление съест перепад на клапане, и сброс будет меньше расчётного. Нужен DN${drainDnRequired}.`,
        `Chiqarish quvuri DN${drainDn}${input.drainDnMm ? " (berilgan)" : ""}: to‘liq chiqarishda tezlik ${r1(drainVelocity)} m/s — ${SURGE.drainVelocity.value} m/s dan yuqori. Qarshi bosim klapandagi bosim farqini yeb qo‘yadi va chiqarish hisoblangandan kam bo‘ladi. DN${drainDnRequired} kerak.`,
      ),
    );
  }
  if (input.airValveDnMm && input.airValveDnMm < airValveDnRequired) {
    warnings.push(
      T(
        `Вантуз DN${input.airValveDnMm} (задан) меньше требуемого DN${airValveDnRequired}: при опорожнении со скоростью ${WATER_MAIN.drainVelocity.value} м/с он не впустит ${(qAir * 1000).toFixed(0)} л/с воздуха при перепаде ${WATER_MAIN.airValveDropBar.value} бар, и в трубе образуется разрежение. Проверьте по графику впуска изготовителя или возьмите больший.`,
        `Vantuz DN${input.airValveDnMm} (berilgan) talab qilinadigan DN${airValveDnRequired} dan kichik: ${WATER_MAIN.drainVelocity.value} m/s tezlikda bo‘shatishda u ${WATER_MAIN.airValveDropBar.value} bar bosim farqida ${(qAir * 1000).toFixed(0)} l/s havoni kirita olmaydi va quvurda siyraklanish hosil bo‘ladi. Ishlab chiqaruvchining havo kirish grafigi bo‘yicha tekshiring yoki kattaroq o‘lchamni oling.`,
      ),
    );
  }
  if (direct) {
    warnings.push(
      T(
        `Удар прямой: столб останавливается за ${r2(stopTime)} с, а отражённая волна возвращается через ${r2(phase)} с. Снизить амплитуду временем закрытия арматуры нельзя — она уже минимальна. Работают только маховые массы, плавный останов, гидропневмобак и сброс.`,
        `Zarba to‘g‘ri: ustun ${r2(stopTime)} s da to‘xtaydi, qaytgan to‘lqin esa ${r2(phase)} s dan keyin qaytadi. Amplitudani armaturaning yopilish vaqti bilan kamaytirib bo‘lmaydi — u allaqachon eng kichik. Faqat mayatnik massalari, silliq to‘xtatish, gidropnevmobak va chiqarish ishlaydi.`,
      ),
    );
  }
  if (dZ === 0) {
    warnings.push(
      T(
        "Геодезический перепад не задан или равен нулю: время торможения столба посчитать нельзя, объём сброса оценён по фазе удара. Для горизонтального участка тормозить поток будет только трение, и торможение окажется долгим — объём сброса больше.",
        "Geodezik balandlik farqi berilmagan yoki nolga teng: ustunning tormozlanish vaqtini hisoblab bo‘lmaydi, chiqariladigan hajm zarba fazasi bo‘yicha baholandi. Gorizontal uchastkada oqimni faqat ishqalanish tormozlaydi, tormozlanish uzoq davom etadi — chiqariladigan hajm kattaroq bo‘ladi.",
      ),
    );
  }

  /* ------------------------------------------------------------------
     ДОПУЩЕНИЯ
     ------------------------------------------------------------------ */
  assumptions.push(
    T(
      `Расход ${r1(input.qM3H)} м³/ч (${r2(qM3s * 1000)} л/с), труба ${outerMm}×${wallMm} мм, внутренний диаметр ${Math.round(innerM * 1000)} мм, скорость ${r2(v)} м/с.`,
      `Sarf ${r1(input.qM3H)} m³/soat (${r2(qM3s * 1000)} l/s), quvur ${outerMm}×${wallMm} mm, ichki diametr ${Math.round(innerM * 1000)} mm, tezlik ${r2(v)} m/s.`,
    ),
    T(
      `Потери по длине — ${hl.method}, уклон ${hl.iMPerKm} м/км, на участке ${r1(friction)} м. Контроль: Шевелёв ${hl.iShevelevMPerKm}, Альтшуль ${hl.iAltshulMPerKm}, Hazen–Williams ${hl.iHazenMPerKm} м/км.`,
      `Yo‘l bo‘yicha yo‘qotishlar — ${hl.method}, qiyalik ${hl.iMPerKm} m/km, uchastkada ${r1(friction)} m. Nazorat: Shevelyov ${hl.iShevelevMPerKm}, Altshul ${hl.iAltshulMPerKm}, Hazen–Williams ${hl.iHazenMPerKm} m/km.`,
    ),
    T(
      `Местные потери — ${Math.round(WATER_MAIN.localShare.value * 100)} % от потерь по длине плюс ${WATER_MAIN.stationLocalM.value} м на обвязку станции.`,
      `Mahalliy yo‘qotishlar — yo‘l bo‘yicha yo‘qotishlarning ${Math.round(WATER_MAIN.localShare.value * 100)} % i, ustiga stansiya quvurlari uchun ${WATER_MAIN.stationLocalM.value} m.`,
    ),
    T(
      `Требуемый напор ${r1(requiredHead)} м = перепад ${r1(dZ)} + потери ${r1(friction)} + местные ${r1(local)} + свободный напор ${freeEnd} м.`,
      `Talab qilinadigan bosim ${r1(requiredHead)} m = balandlik farqi ${r1(dZ)} + yo‘l yo‘qotishlari ${r1(friction)} + mahalliy ${r1(local)} + erkin bosim ${freeEnd} m.`,
    ),
    T(
      `Скорость ударной волны ${Math.round(c)} м/с при модуле упругости ${(mat.E / 1e9).toFixed(0)} ГПа и D/δ = ${r1(outerMm / wallMm)}; модуль упругости воды принят ${(K_WATER / 1e9).toFixed(2)} ГПа.`,
      `Zarba to‘lqini tezligi ${Math.round(c)} m/s, elastiklik moduli ${(mat.E / 1e9).toFixed(0)} GPa va D/δ = ${r1(outerMm / wallMm)}; suvning elastiklik moduli ${(K_WATER / 1e9).toFixed(2)} GPa qabul qilingan.`,
    ),
    direct
      ? T(
          `Удар прямой: время торможения столба ${r2(stopTime)} с меньше фазы ${r2(phase)} с, повышение считается по Жуковскому на полную скорость — Δh = c·V/g.`,
          `Zarba to‘g‘ri: ustunning tormozlanish vaqti ${r2(stopTime)} s fazadan (${r2(phase)} s) kichik, bosim ko‘tarilishi Jukovskiy bo‘yicha to‘liq tezlikka hisoblanadi — Δh = c·V/g.`,
        )
      : T(
          `Удар непрямой: столб тормозится ${r2(stopTime)} с, дольше фазы ${r2(phase)} с, повышение по Мишо — Δh = 2·L·V/(g·t).`,
          `Zarba to‘g‘ri emas: ustun ${r2(stopTime)} s tormozlanadi, bu ${r2(phase)} s fazadan uzunroq, bosim ko‘tarilishi Misho bo‘yicha — Δh = 2·L·V/(g·t).`,
        ),
    T(
      `Время торможения столба по модели жёсткой колонны t = L·V/(g·H): тормозит вес воды на подъёме. Трение не учтено — это в безопасную сторону, с трением столб останавливается быстрее.`,
      `Ustunning tormozlanish vaqti qattiq ustun modeli bo‘yicha t = L·V/(g·H): ko‘tarilishdagi suvning og‘irligi tormozlaydi. Ishqalanish hisobga olinmagan — bu xavfsiz tomonga, ishqalanish bilan ustun tezroq to‘xtaydi.`,
    ),
    T(
      `Объём сброса ${r2(dischargeVolume)} м³ — расход за ${volumeGovernedBy}, умноженный на ${SURGE.dampingCycles.value} цикла затухания. ${SURGE.dampingCycles.note}. Считать объём за одну фазу удара 2L/c неверно: на пологом участке это занижает результат в разы.`,
      `Chiqariladigan hajm ${r2(dischargeVolume)} m³ — ${volumeGovernedBy} davomidagi sarf, ${SURGE.dampingCycles.value} so‘nish siklga ko‘paytirilgan. Tebranishlar taxminan ikkita tormozlanish siklida so‘nadi — bir avariya o‘chishidagi to‘liq chiqarish hajmi shu son bo‘yicha baholanadi. Hajmni bitta zarba fazasi 2L/c uchun hisoblash noto‘g‘ri: qiya emas uchastkada bu natijani bir necha barobar kamaytiradi.`,
    ),
    T(
      `Пропускная способность клапана Kv = Q/√Δp при перепаде ${r1(dpValve)} бар (класс давления минус противодавление дренажа ${SURGE.drainBackPressureBar.value} бар). Обратный поток по величине сравним с рабочим расходом, поэтому в формулу подставлен полный расход.`,
      `Klapanning o‘tkazuvchanligi Kv = Q/√Δp, bosim farqi ${r1(dpValve)} bar (bosim klassi minus drenaj qarshi bosimi ${SURGE.drainBackPressureBar.value} bar). Teskari oqim kattaligi bo‘yicha ishchi sarf bilan solishtirarli, shuning uchun formulaga to‘liq sarf qo‘yilgan.`,
    ),
    T(
      `Условный диаметр клапана по Kv: ${SURGE.valveCd.note}.`,
      `Klapanning shartli diametri Kv bo‘yicha: zarbaga qarshi klapanning sarf koeffitsiyenti 0,5 — pilotli boshqaruvli to‘liq o‘tishli klapan uchun taxminiy; yakuniy Kv ishlab chiqaruvchi katalogidan olinadi, turli markalarda u bir yarim barobargacha farq qiladi.`,
    ),
    T(
      `Время полного открытия не больше ${r2(openTime)} с: ${SURGE.openTimeFactor.note}.`,
      `To‘liq ochilish vaqti ${r2(openTime)} s dan ortiq emas: klapan zarba fazasining yarmidan ko‘p bo‘lmagan vaqtda to‘liq ochilishi kerak — aks holda qaytgan to‘lqin hali ochilmagan klapanga keladi va chiqaradigan narsa qolmaydi.`,
    ),
    T(
      `Сбросный трубопровод DN${drainDn}${input.drainDnMm ? " задан проектировщиком" : " подобран"}; требуемый по скорости — DN${drainDnRequired}. ${SURGE.drainVelocity.note}.`,
      `Chiqarish quvuri DN${drainDn}${input.drainDnMm ? " loyihachi tomonidan berilgan" : " tanlangan"}; tezlik bo‘yicha talab qilinadigani — DN${drainDnRequired}. Drenaj (chiqarish) quvuridagi tezlik 5 m/s dan yuqori emas — amaliyot: yuqori bo‘lsa qarshi bosim ortadi va klapan kerakli miqdorni chiqara olmay qoladi.`,
    ),
    T(
      `Гидропневмобак ${r2(vesselTotal)} м³ — оценка энергетическим методом: кинетическая энергия столба ${Math.round(ke / 1000)} кДж поглощается изотермическим расширением воздуха от ${r1(workBar + ATM_BAR)} до ${SURGE.minAbsBar.value} бар абс. Окончательный объём — по номограммам или расчётом переходного процесса.`,
      `Gidropnevmobak ${r2(vesselTotal)} m³ — energetik usulda baholash: ustunning kinetik energiyasi ${Math.round(ke / 1000)} kJ havoning ${r1(workBar + ATM_BAR)} dan ${SURGE.minAbsBar.value} bar mutlaq bosimgacha izotermik kengayishi bilan yutiladi. Yakuniy hajm — nomogrammalar yoki o‘tkinchi jarayon hisobi bo‘yicha.`,
    ),
    T(
      `Вантузы ${airValveCount} шт. DN${airValveDn}${input.airValveDnMm ? " (задан проектировщиком)" : ""}; требуемый по расходу воздуха при опорожнении — DN${airValveDnRequired}. Расстановка по шагу ${WATER_MAIN.airValveSpacingM.value} м плюс один за станцией.`,
      `Vantuzlar ${airValveCount} dona DN${airValveDn}${input.airValveDnMm ? " (loyihachi tomonidan berilgan)" : ""}; bo‘shatishdagi havo sarfi bo‘yicha talab qilinadigani — DN${airValveDnRequired}. Joylashtirish qadami ${WATER_MAIN.airValveSpacingM.value} m, ustiga stansiyadan keyin bittasi.`,
    ),
  );

  return {
    qM3s: r2(qM3s * 1000) / 1000,
    outerMm,
    wallMm,
    innerMm: Math.round(innerM * 1000),
    velocity: r2(v),
    gradientMPerKm: hl.iMPerKm,
    frictionM: r1(friction),
    localM: r1(local),
    requiredHeadM: r1(requiredHead),
    requiredHeadBar: r2(workBar),
    shaftKW: r1(shaftKW),
    motorKW: r1(motorKW),

    minPipeLengthM: Math.round(minPipeLength),
    lengthOk,

    pnBar,
    wallByPressureMm: r2(wallByPressure),
    wallByTestMm: r2(wallByTest),
    hoopStressMPa: r1(hoop),
    bucklingBar: r2(buckling),

    waveSpeedMs: Math.round(c),
    phaseS: r2(phase),
    stopTimeS: Number.isFinite(stopTime) ? r2(stopTime) : 0,
    direct,
    surgeM: r1(surgeM),
    peakBar: r2(peakBar),
    minHeadM: r1(minHead),
    separation,
    peakAt,
    vacuumAt,

    protection: {
      dischargeVolumeM3: r2(dischargeVolume),
      volumeGovernedBy,
      requiredKv: r1(requiredKv),
      valveCount,
      kvPerValve: r1(kvPerValve),
      valveDnMm: valveDn,
      valvePnBar: valvePn,
      openTimeS: r2(openTime),
      drainDnMm: drainDn,
      drainDnRequiredMm: drainDnRequired,
      drainVelocity: r1(drainVelocity),
      receiverM3: r2(dischargeVolume * SURGE.vesselReserve.value),
      vesselAirM3: r2(vesselAir),
      vesselTotalM3: r2(vesselTotal),
      airValveCount,
      airValveDnMm: airValveDn,
      airValveDnRequiredMm: airValveDnRequired,
    },

    materials,
    assumptions,
    warnings,
  };
}
