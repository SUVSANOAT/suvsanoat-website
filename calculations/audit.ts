/* ==================================================================
 * ПРОВЕРКА ЧУЖОГО ПРОЕКТА ПО ҚМҚ 2.04.03-19
 *
 * Модуль берёт параметры, заявленные в чужом расчёте, коммерческом
 * предложении или проекте, и сверяет их с нормами. Он НЕ проектирует
 * заново — он отвечает на один вопрос: сходится ли заявленное с тем,
 * что требует норматив, и если нет, то в какую сторону и на сколько.
 *
 * ПРАВИЛА, КОТОРЫЕ ЗДЕСЬ СОБЛЮДАЮТСЯ СТРОГО.
 *
 * 1. Ни одна проверка не выполняется без данных. Не заполнено — это
 *    «нет данных», а не «нарушение». Обвинить чужой проект в том,
 *    чего в нём не увидели, — самый быстрый способ потерять лицо в
 *    экспертизе.
 * 2. У каждой находки есть пункт нормы. Если пункта нет, находка
 *    помечается как практика проектирования и не называется
 *    нарушением.
 * 3. Отклонения делятся по последствиям: «не сработает» (сооружение
 *    не выйдет на показатели), «не по норме» (формально нарушен
 *    пункт), «спорно» (в пределах допуска, но требует пояснения).
 * 4. Запас в бо́льшую сторону нарушением не считается — считается
 *    удорожанием, и так и пишется.
 * ================================================================== */

import {
  AEROTANK,
  BIO_INLET_LIMITS,
  DISINFECTION,
  GRIT,
  PRIMARY_SETTLING,
  SCREENS,
  STAGE_EFFECTS,
  BOD5_TO_BODFULL,
  kMaxByDailyFlow,
  kmkRef,
  oxygenTransferKgPerNm3,
  secondaryClarifierLoad,
  sanitaryZone,
} from "../norms/kmk-2-04-03-19";
import { sludgeIndex, excessSludgeMgL, blowerPowerKW } from "./compare";

/* ------------------------------------------------------------------
 * ЧТО ПОДАЁТСЯ НА ПРОВЕРКУ
 *
 * Все поля необязательные: проверяется ровно то, что заявлено.
 * ------------------------------------------------------------------ */
export type AuditInput = {
  /* исходные данные объекта */
  flowM3Day?: number;
  people?: number;
  bodMgL?: number;
  codMgL?: number;
  tssMgL?: number;
  nitrogenMgL?: number;
  phosphorusMgL?: number;
  phValue?: number;
  waterTempAnnualC?: number;
  waterTempSummerC?: number;

  /* что заявлено в проверяемом проекте */
  declaredKMax?: number;
  /** объём биологической ступени (суммарный рабочий), м³ */
  aerationVolumeM3?: number;
  /** заявленное время аэрации, ч */
  aerationHours?: number;
  /** число секций аэротенка */
  aerationSections?: number;
  /** рабочая глубина аэротенка, м */
  aerationDepthM?: number;
  /** ширина коридора аэротенка, м */
  aerationCorridorWidthM?: number;
  /** доза ила, г/л */
  mlssGL?: number;

  /** прозоры решётки, мм */
  screenGapMm?: number;
  /** скорость в прозорах, м/с */
  screenVelocityMS?: number;

  /** число песколовок */
  gritUnits?: number;
  /** скорость в песколовке, м/с */
  gritVelocityMS?: number;
  /** время пребывания в песколовке, с */
  gritRetentionS?: number;

  /** число вторичных отстойников */
  secondaryUnits?: number;
  /** суммарная площадь вторичных отстойников, м² */
  secondaryAreaM2?: number;
  /** глубина зоны отстаивания, м */
  secondaryDepthM?: number;

  /** суммарная производительность рабочих воздуходувок, Нм³/ч */
  airNm3H?: number;
  /** установленная мощность воздуходувок (рабочие), кВт */
  blowerKW?: number;

  /** заявленный выход избыточного ила, кг СВ/сут */
  excessSludgeKgDay?: number;

  /** заявленное качество на выходе */
  outSsMgL?: number;
  outBodFullMgL?: number;

  /** есть ли обеззараживание */
  disinfection?: boolean;
  /** время контакта, мин */
  contactMinutes?: number;

  /** расстояние до жилой застройки, м */
  distanceToHousingM?: number;
  /** тип станции для табл. 1 */
  plantKind?: "full-oxidation" | "mechbio-thermal" | "mechbio-sludge-beds" | "bio-ponds" | "oxidation-ditch";
  sludgeBedsOnSite?: boolean;
};

export type FindingLevel = "fail" | "norm" | "doubt" | "ok" | "nodata";

export type Finding = {
  key: string;
  /** что проверяли */
  subject: string;
  level: FindingLevel;
  /** заявлено в проекте */
  declared: string;
  /** требуется по норме / получается по расчёту */
  required: string;
  /** пункт нормы либо пометка «практика» */
  ref: string;
  /** чем это обернётся на объекте */
  consequence: string;
};

export type AuditResult = {
  findings: Finding[];
  counts: Record<FindingLevel, number>;
  /** краткий вывод для первой страницы заключения */
  summary: string;
};

const num = (v: number | undefined) => (Number.isFinite(v as number) ? (v as number) : NaN);
const has = (v: number | undefined) => Number.isFinite(v as number) && (v as number) > 0;
const f1 = (x: number) => x.toFixed(1);
const f2 = (x: number) => x.toFixed(2);

/** отклонение заявленного от требуемого, % (положительное — заявлено больше) */
function dev(declared: number, required: number): number {
  if (!(required > 0)) return 0;
  return ((declared - required) / required) * 100;
}

export function auditProject(input: AuditInput): AuditResult {
  const out: Finding[] = [];

  const add = (f: Finding) => out.push(f);
  const noData = (key: string, subject: string, need: string) =>
    add({
      key,
      subject,
      level: "nodata",
      declared: "не указано",
      required: need,
      ref: "",
      consequence: "Проверка не выполнена: в проверяемых материалах нет этой величины. Запросить у автора проекта.",
    });

  const Q = num(input.flowM3Day);
  const bod5 = num(input.bodMgL);
  const bodFull = has(input.bodMgL) ? bod5 / BOD5_TO_BODFULL : NaN;

  /* ---------------------------------------------------------------
   * 1. КОЭФФИЦИЕНТ НЕРАВНОМЕРНОСТИ
   *
   * Самая частая подмена в чужих расчётах: K берут «2,0 по опыту»
   * вместо табл. 2, и все сооружения, считаемые по максимальному
   * часовому притоку, выходят меньше нужного.
   * --------------------------------------------------------------- */
  if (has(input.flowM3Day)) {
    const k = kMaxByDailyFlow(Q);
    if (has(input.declaredKMax)) {
      const d = num(input.declaredKMax);
      const delta = dev(d, k.kMax);
      add({
        key: "kmax",
        subject: "Коэффициент общей неравномерности K gen.max",
        level: delta < -5 ? "fail" : Math.abs(delta) <= 5 ? "ok" : "doubt",
        declared: f2(d),
        required: `${f2(k.kMax)} (${k.source})`,
        ref: kmkRef("2.7", "табл. 2"),
        consequence:
          delta < -5
            ? "Занижен: все сооружения, считаемые по максимальному часовому притоку (решётки, песколовки, отстойники, мембраны), окажутся меньше требуемого, и в час пик станция пойдёт на перелив."
            : delta > 5
              ? "Завышен против таблицы — сооружения крупнее необходимого. Это не нарушение, а удорожание; должно быть обосновано замерами."
              : "Соответствует табл. 2.",
      });
    } else {
      noData("kmax", "Коэффициент общей неравномерности", `${f2(k.kMax)} по табл. 2`);
    }
  }

  /* ---------------------------------------------------------------
   * 2. ОБЪЁМ И ВРЕМЯ АЭРАЦИИ
   *
   * Проверяем две вещи: не меньше ли заявленный объём того, что даёт
   * гидравлика с температурной поправкой, и не забыта ли сама
   * поправка 15/T_w. Второе — типичная ошибка: расчёт делают «по
   * лету», зимой станция не нитрифицирует.
   * --------------------------------------------------------------- */
  if (has(input.flowM3Day) && has(input.aerationVolumeM3)) {
    const tAnnual = has(input.waterTempAnnualC) ? num(input.waterTempAnnualC) : AEROTANK.formula51.tempRefC;
    const factor = AEROTANK.formula51.tempRefC / tAnnual;
    const declaredV = num(input.aerationVolumeM3);
    const declaredT = has(input.aerationHours) ? num(input.aerationHours) : (declaredV * 24) / Q;

    add({
      key: "aeration-time",
      subject: "Время аэрации",
      level: declaredT < AEROTANK.formula51.minHours ? "norm" : "ok",
      declared: `${f1(declaredT)} ч`,
      required: `не менее ${AEROTANK.formula51.minHours} ч`,
      ref: AEROTANK.formula51.ref,
      consequence:
        declaredT < AEROTANK.formula51.minHours
          ? "Меньше нормативного минимума: биология не успевает сработать независимо от того, что написано в расчёте."
          : "Минимум по норме выдержан.",
    });

    if (has(input.bodMgL)) {
      /* Перекрёстная проверка объёма по ф. (51):
             t_atm = (L_en − L_ex) / (a_i·(1 − s)·ρ),  ч
         размерности сходятся без множителей: мг/л делится на
         (г/л)·(мг/(г·ч)) и даёт часы. Доза — по табл. 40, ρ и зольность
         s — по табл. 41. При T ≠ 15 °C время умножается на 15/T_w
         (п. 6.143 прим.), минимум — 2 ч.

         Это проверка порядка величины, а не повторное проектирование:
         автор мог считать по вытеснителю с K_p (ф. 54) и получить
         больше. Поэтому «меньше расчётного» становится нарушением
         только при отклонении свыше 15 %. */
      const dose = has(input.mlssGL) ? num(input.mlssGL) : doseByBod(bodFull);
      const s = AEROTANK.table41Municipal.ashS;
      const lex = STAGE_EFFECTS.biological.bodFullOutMgL[0];
      const rho = aerationRate(dose, lex);
      const tBase = Math.max((bodFull - lex) / (dose * (1 - s) * rho), AEROTANK.formula51.minHours);
      const tReq = Math.max(tBase * factor, AEROTANK.formula51.minHours);
      const vReq = (Q / 24) * tReq;
      const delta = dev(declaredV, vReq);
      add({
        key: "aeration-volume",
        subject: "Объём биологической ступени",
        level: delta < -15 ? "fail" : delta < -5 ? "doubt" : "ok",
        declared: `${f1(declaredV)} м³ (время аэрации ${f1(declaredT)} ч)`,
        required: `${f1(vReq)} м³ — t = ${f1(tReq)} ч при дозе ила ${f1(dose)} г/л, ρ = ${f1(rho)} мг/(г·ч) по ф. (52), s = ${s}`,
        ref: AEROTANK.formula51.ref,
        consequence:
          delta < -15
            ? `Занижен на ${Math.abs(delta).toFixed(0)} %. Сооружение такого объёма заявленных показателей на выходе не даст.`
            : delta < -5
              ? "Немного меньше расчётного по ф. (51). Допустимо, если автор считал вытеснитель с K_p по ф. (54) или принял другую дозу ила, — это должно быть в расчёте показано."
              : `Соответствует или с запасом (${delta > 0 ? "+" : ""}${delta.toFixed(0)} %).`,
      });

      /* РЕГЕНЕРАЦИЯ. При БПКполн на входе свыше 150 мг/л норма требует
         аэротенк с регенератором (п. 6.141), и объём тогда считается
         по ф. (53)–(55), а не по (51). Проверка выше это учесть не
         может — она даёт ориентир; поэтому при высокой БПК прямо
         говорим, что сверять надо другой расчёт. */
      if (bodFull > AEROTANK.regenerationFromBodMgL.value) {
        add({
          key: "regeneration",
          subject: "Регенерация активного ила",
          level: "doubt",
          declared: `БПКполн на входе ${f1(bodFull)} мг/л`,
          required: `свыше ${AEROTANK.regenerationFromBodMgL.value} мг/л — аэротенк с регенератором`,
          ref: AEROTANK.regenerationFromBodMgL.ref,
          consequence:
            "При такой БПК норма предполагает регенератор, и объём считается по ф. (53)–(55). Если в проверяемом проекте регенератора нет, автор должен обосновать схему; сравнение объёма выше даёт лишь порядок величины.",
        });
      }

      /* ТЕМПЕРАТУРНАЯ ПОПРАВКА.
         Судим не по словам в расчёте, а по числу: если заявленный
         объём попадает в базовый (посчитанный при 15 °C) и при этом
         заметно не дотягивает до требуемого при фактической зимней
         температуре — поправку не применяли. Это самая частая и самая
         дорогая ошибка в чужих расчётах по Узбекистану. */
      if (has(input.waterTempAnnualC) && factor > 1.05) {
        const vBase = (Q / 24) * tBase;
        const nearBase = Math.abs(dev(declaredV, vBase)) <= 10;
        const shortOfRequired = dev(declaredV, vReq) < -10;
        const missed = nearBase && shortOfRequired;
        add({
          key: "temp-correction",
          subject: `Температурная поправка 15/T_w при T год = ${f1(tAnnual)} °C`,
          level: missed ? "fail" : shortOfRequired ? "doubt" : "ok",
          declared: `${f1(declaredV)} м³`,
          required: `${f1(vReq)} м³ — в ${f2(factor)} раза больше базовых ${f1(vBase)} м³ при 15 °C`,
          ref: kmkRef("6.143", "прим."),
          consequence: missed
            ? `Объём совпадает с расчётом при базовых 15 °C и не учитывает фактические ${f1(tAnnual)} °C. Зимой сооружение не выйдет на нитрификацию — это не запас прочности, это отказ по показателям в холодный период.`
            : shortOfRequired
              ? "Объём меньше требуемого с поправкой, но и с базовым не совпадает. Запросить у автора расчёт времени аэрации с указанием расчётной температуры."
              : "Объём соответствует расчёту с температурной поправкой.",
        });
      }
    }
  } else if (has(input.flowM3Day)) {
    noData("aeration-volume", "Объём биологической ступени", "объём, м³");
  }

  /* конструктив аэротенка — п. 6.150 */
  if (has(input.aerationSections)) {
    const n = num(input.aerationSections);
    add({
      key: "sections",
      subject: "Число секций биологической ступени",
      level: n >= AEROTANK.minSections.value ? "ok" : "norm",
      declared: `${n}`,
      required: `не менее ${AEROTANK.minSections.value}`,
      ref: AEROTANK.minSections.ref,
      consequence:
        n >= AEROTANK.minSections.value
          ? "Соответствует."
          : "Одна секция означает полную остановку очистки на время любого ремонта или чистки.",
    });
  }
  if (has(input.aerationDepthM)) {
    const h = num(input.aerationDepthM);
    const [hMin, hMax] = AEROTANK.depthM.value;
    add({
      key: "depth",
      subject: "Рабочая глубина аэротенка",
      level: h >= hMin && h <= hMax ? "ok" : "norm",
      declared: `${f1(h)} м`,
      required: `${hMin}–${hMax} м`,
      ref: AEROTANK.depthM.ref,
      consequence:
        h < hMin
          ? "Мельче нормы: аэраторы работают неэффективно, расход воздуха вырастет против расчётного."
          : h > hMax
            ? "Глубже нормы: растёт давление воздуходувок и стоимость конструкции, требуется обоснование."
            : "В пределах нормы.",
    });
    if (has(input.aerationCorridorWidthM)) {
      const w = num(input.aerationCorridorWidthM);
      const ratio = w / h;
      add({
        key: "corridor",
        subject: "Отношение ширины коридора к глубине",
        level: ratio >= 1 && ratio <= 2 ? "ok" : "norm",
        declared: `${f2(ratio)} : 1 (ширина ${f1(w)} м)`,
        required: "от 1:1 до 2:1",
        ref: AEROTANK.minSections.ref,
        consequence:
          ratio >= 1 && ratio <= 2
            ? "В пределах нормы."
            : "Нарушено соотношение сечения коридора: перемешивание будет неравномерным, в углах пойдёт осаждение ила.",
      });
    }
  }

  /* ---------------------------------------------------------------
   * 3. МЕХАНИЧЕСКАЯ ОЧИСТКА
   * --------------------------------------------------------------- */
  if (has(input.screenGapMm)) {
    const g = num(input.screenGapMm);
    add({
      key: "screen-gap",
      subject: "Прозоры решётки",
      level: g <= SCREENS.maxGapMm.value ? "ok" : "norm",
      declared: `${f1(g)} мм`,
      required: `не более ${SCREENS.maxGapMm.value} мм`,
      ref: SCREENS.maxGapMm.ref,
      consequence:
        g <= SCREENS.maxGapMm.value
          ? "Соответствует."
          : "Крупные прозоры пропускают тряпьё и пластик дальше по схеме: страдают насосы, аэраторы и особенно мембраны.",
    });
  }
  if (has(input.screenVelocityMS)) {
    const v = num(input.screenVelocityMS);
    add({
      key: "screen-velocity",
      subject: "Скорость в прозорах решётки",
      level: v >= 0.8 && v <= 1.0 ? "ok" : "norm",
      declared: `${f2(v)} м/с`,
      required: "0,8–1,0 м/с при максимальном притоке",
      ref: kmkRef("5.14"),
      consequence:
        v < 0.8
          ? "Ниже нормы: перед решёткой осаждается песок и тяжёлые включения, канал заиливается."
          : v > 1.0
            ? "Выше нормы: отбросы продавливаются сквозь прозоры, решётка перестаёт работать по назначению."
            : "В пределах нормы.",
    });
  }
  if (has(input.flowM3Day) && Q > GRIT.requiredFromM3Day.value) {
    if (has(input.gritUnits)) {
      const n = num(input.gritUnits);
      add({
        key: "grit-units",
        subject: "Число песколовок",
        level: n >= GRIT.minUnits.value ? "ok" : "norm",
        declared: `${n}`,
        required: `не менее ${GRIT.minUnits.value}, все рабочие`,
        ref: GRIT.minUnits.ref,
        consequence:
          n >= GRIT.minUnits.value
            ? "Соответствует."
            : "При одной песколовке на время чистки песок идёт в аэротенк и накапливается на дне, отбирая рабочий объём.",
      });
    } else {
      noData("grit-units", "Число песколовок", `не менее ${GRIT.minUnits.value} при Q > ${GRIT.requiredFromM3Day.value} м³/сут`);
    }
    if (has(input.gritVelocityMS)) {
      const v = num(input.gritVelocityMS);
      const { vMinLps, vMaxLps } = GRIT.table28.horizontal;
      add({
        key: "grit-velocity",
        subject: "Скорость в горизонтальной песколовке",
        level: v >= vMinLps && v <= vMaxLps ? "ok" : "norm",
        declared: `${f2(v)} м/с`,
        required: `${vMinLps}–${vMaxLps} м/с`,
        ref: GRIT.table28.ref,
        consequence:
          v < vMinLps
            ? "Ниже нормы: вместе с песком осядет органика, песок начнёт загнивать, площадки будут пахнуть."
            : v > vMaxLps
              ? "Выше нормы: песок не успевает осесть и уходит дальше по схеме."
              : "В пределах нормы.",
      });
    }
    if (has(input.gritRetentionS)) {
      const t = num(input.gritRetentionS);
      add({
        key: "grit-retention",
        subject: "Время пребывания в песколовке",
        level: t >= GRIT.horizontalMinRetentionS.value ? "ok" : "norm",
        declared: `${f1(t)} с`,
        required: `не менее ${GRIT.horizontalMinRetentionS.value} с при максимальном притоке`,
        ref: GRIT.horizontalMinRetentionS.ref,
        consequence:
          t >= GRIT.horizontalMinRetentionS.value
            ? "Соответствует."
            : "Песок не успевает выпасть: песколовка есть в спецификации, но не работает.",
      });
    }
  }

  /* ---------------------------------------------------------------
   * 4. ВТОРИЧНЫЕ ОТСТОЙНИКИ — ф. (85), п. 6.170
   * --------------------------------------------------------------- */
  if (has(input.secondaryAreaM2) && has(input.flowM3Day) && has(input.bodMgL)) {
    const dose = has(input.mlssGL) ? num(input.mlssGL) : doseByBod(bodFull);
    const hSet = has(input.secondaryDepthM) ? num(input.secondaryDepthM) : 3;
    const tAt = has(input.aerationHours)
      ? num(input.aerationHours)
      : has(input.aerationVolumeM3)
        ? (num(input.aerationVolumeM3) * 24) / Q
        : 8;
    const lex = STAGE_EFFECTS.biological.bodFullOutMgL[0];
    const qi = (24 * (bodFull - lex)) / (dose * (1 - AEROTANK.table41Municipal.ashS) * tAt);
    const ji = sludgeIndex(qi);
    const load = secondaryClarifierLoad(hSet, ji, dose, "radial");
    const kMax = kMaxByDailyFlow(Q).kMax;
    const qPeak = (Q / 24) * kMax;
    const areaReq = load > 0 ? qPeak / load : 0;
    const declaredA = num(input.secondaryAreaM2);
    const delta = dev(declaredA, areaReq);
    add({
      key: "secondary-area",
      subject: "Площадь вторичных отстойников",
      level: delta < -15 ? "fail" : delta < -5 ? "doubt" : "ok",
      declared: `${f1(declaredA)} м²`,
      required: `${f1(areaReq)} м² (q_ssa = ${f2(load)} м³/(м²·ч), J_i = ${f1(ji)} см³/г, a_i = ${f1(dose)} г/л)`,
      ref: kmkRef("6.170", "ф. (85)"),
      consequence:
        delta < -15
          ? `Занижена на ${Math.abs(delta).toFixed(0)} %. Ил будет выноситься с очищенной водой — по взвешенным веществам станция норматив не выдержит, сколько бы ни было объёма в аэротенке.`
          : delta < -5
            ? "Немного меньше расчётной. Проверить, по какому расходу считал автор: по среднему или по максимальному часовому."
            : "Соответствует расчёту по ф. (85).",
    });
  }
  if (has(input.secondaryUnits)) {
    const n = num(input.secondaryUnits);
    add({
      key: "secondary-units",
      subject: "Число вторичных отстойников",
      level: n >= PRIMARY_SETTLING.minSecondary.value ? "ok" : "norm",
      declared: `${n}`,
      required: `не менее ${PRIMARY_SETTLING.minSecondary.value}, все рабочие`,
      ref: PRIMARY_SETTLING.minSecondary.ref,
      consequence:
        n >= PRIMARY_SETTLING.minSecondary.value
          ? "Соответствует."
          : `Менее ${PRIMARY_SETTLING.minSecondary.value} отстойников: при выводе одного в ремонт оставшиеся перегружаются сверх допустимого (п. 1.9 — не более 8–17 %). Если число минимальное, объём должен быть увеличен в 1,2–1,3 раза (п. 6.58).`,
    });
  }

  /* ---------------------------------------------------------------
   * 5. ВОЗДУХ — ф. (70), п. 6.156
   * --------------------------------------------------------------- */
  if (has(input.airNm3H) && has(input.flowM3Day) && has(input.bodMgL)) {
    const tSummer = has(input.waterTempSummerC) ? num(input.waterTempSummerC) : 20;
    const o2PerNm3 = oxygenTransferKgPerNm3({ depthM: 4, fRatio: 0.2, tempC: tSummer });
    const bodLoad = (Q * bod5) / 1000;
    const nLoad = has(input.nitrogenMgL) ? (Q * num(input.nitrogenMgL)) / 1000 : 0;
    const oxygen = ((bodLoad * 0.9) / BOD5_TO_BODFULL) * AEROTANK.air.qO.toBod15_20 + nLoad * 4.57;
    const airReq = oxygen / o2PerNm3 / 24;
    const declaredAir = num(input.airNm3H);
    const delta = dev(declaredAir, airReq);
    add({
      key: "air",
      subject: "Расход воздуха",
      level: delta < -15 ? "fail" : delta < -5 ? "doubt" : "ok",
      declared: `${f1(declaredAir)} Нм³/ч`,
      required: `${f1(airReq)} Нм³/ч (${(o2PerNm3 * 1000).toFixed(1)} г O₂/Нм³ при T лето ${f1(tSummer)} °C)`,
      ref: kmkRef("6.156", "ф. (70)"),
      consequence:
        delta < -15
          ? `Занижен на ${Math.abs(delta).toFixed(0)} %. Кислорода не хватит: летом ил уйдёт в дефицит, нитрификация встанет первой.`
          : delta < -5
            ? "Немного меньше расчётного — проверить, по какой температуре считал автор. Расчёт «по среднегодовой» вместо летней даёт именно такую недостачу."
            : "Соответствует или с запасом.",
    });

    if (has(input.blowerKW)) {
      const kwReq = blowerPowerKW(declaredAir);
      const d2 = dev(num(input.blowerKW), kwReq);
      add({
        key: "blower-power",
        subject: "Мощность воздуходувок под заявленный расход воздуха",
        level: d2 < -20 ? "doubt" : "ok",
        declared: `${f1(num(input.blowerKW))} кВт`,
        required: `≈ ${f1(kwReq)} кВт`,
        ref: "адиабата, противодавление 4 м вод. ст., КПД 0,6 — практика, не ҚМҚ",
        consequence:
          d2 < -20
            ? "Мощность заметно меньше той, что нужна для заявленного расхода воздуха. Либо расход воздуха на бумаге, либо машина не та."
            : "Согласуется с заявленным расходом воздуха.",
      });
    }
  }

  /* ---------------------------------------------------------------
   * 6. ИЗБЫТОЧНЫЙ ИЛ — ф. (67), п. 6.148
   *
   * Занижение прироста ила — способ показать заказчику маленькую
   * иловую площадку и дешёвый вывоз. Проверяется в первую очередь.
   * --------------------------------------------------------------- */
  if (has(input.excessSludgeKgDay) && has(input.flowM3Day) && has(input.tssMgL) && has(input.bodMgL)) {
    const req = (excessSludgeMgL(num(input.tssMgL), bodFull) * Q) / 1000;
    const declared = num(input.excessSludgeKgDay);
    const delta = dev(declared, req);
    add({
      key: "sludge",
      subject: "Прирост избыточного ила",
      level: delta < -25 ? "fail" : delta < -10 ? "doubt" : "ok",
      declared: `${f1(declared)} кг СВ/сут`,
      required: `${f1(req)} кг СВ/сут`,
      ref: AEROTANK.sludgeGrowth.ref,
      consequence:
        delta < -25
          ? `Занижен на ${Math.abs(delta).toFixed(0)} %. Иловое хозяйство и стоимость вывоза осадка в проекте занижены на столько же — это прямые деньги эксплуатации.`
          : delta < -10
            ? "Меньше расчётного по ф. (67). Уточнить, какие взвешенные вещества автор принял на входе в аэротенк."
            : "Соответствует расчёту по ф. (67).",
    });
  }

  /* ---------------------------------------------------------------
   * 7. КАЧЕСТВО НА ВЫХОДЕ — п. 6.10
   *
   * Норматив даёт достижимые эффекты ступеней. Обещание 3 мг/л по
   * взвешенным «после аэротенка со вторичным отстойником», без
   * ступени доочистки, — это обещание, которого норма не даёт.
   * --------------------------------------------------------------- */
  if (has(input.outSsMgL)) {
    const ss = num(input.outSsMgL);
    const bioSs = STAGE_EFFECTS.biological.ssOutMgL;
    const tertMax = STAGE_EFFECTS.tertiary.ssOutMgL[1];
    add({
      key: "effluent-ss",
      subject: "Взвешенные вещества на выходе",
      level: ss < tertMax ? "doubt" : ss <= bioSs ? "ok" : "doubt",
      declared: `${f1(ss)} мг/л`,
      required: `биологическая ступень — ${bioSs} мг/л; доочистка — ${STAGE_EFFECTS.tertiary.ssOutMgL[0]}–${tertMax} мг/л`,
      ref: kmkRef("6.10"),
      consequence:
        ss < tertMax
          ? "Обещано лучше, чем даёт доочистка по норме. Такое достижимо на мембране; если в схеме мембран нет — цифра ничем не обеспечена."
          : ss <= bioSs
            ? "В пределах эффекта биологической ступени."
            : "Хуже, чем должна давать биологическая ступень: проверить, что именно считает автор очищенной водой.",
    });
  }

  /* ---------------------------------------------------------------
   * 8. ПРИЁМ НА БИОЛОГИЮ — п. 6.2
   * --------------------------------------------------------------- */
  if (has(input.phValue)) {
    const ph = num(input.phValue);
    add({
      key: "ph",
      subject: "pH на входе в биологическую очистку",
      level: ph >= BIO_INLET_LIMITS.phMin && ph <= BIO_INLET_LIMITS.phMax ? "ok" : "fail",
      declared: f1(ph),
      required: `${BIO_INLET_LIMITS.phMin}–${BIO_INLET_LIMITS.phMax}`,
      ref: BIO_INLET_LIMITS.ref,
      consequence:
        ph >= BIO_INLET_LIMITS.phMin && ph <= BIO_INLET_LIMITS.phMax
          ? "В допустимых пределах."
          : "За пределами допустимого: биология в таком стоке работать не будет, нужна корректировка pH до сооружения, а не после.",
    });
  }
  if (has(input.bodMgL) && has(input.nitrogenMgL)) {
    const needN = (bodFull / 100) * BIO_INLET_LIMITS.nPer100Bod;
    const n = num(input.nitrogenMgL);
    add({
      key: "biogenes-n",
      subject: "Достаточность азота для биологии",
      level: n >= needN ? "ok" : "fail",
      declared: `${f1(n)} мг/л`,
      required: `не менее ${f1(needN)} мг/л (${BIO_INLET_LIMITS.nPer100Bod} мг N на 100 мг БПКполн)`,
      ref: BIO_INLET_LIMITS.ref,
      consequence:
        n >= needN
          ? "Азота достаточно."
          : "Азота не хватает для питания ила — потребуется дозирование биогенов, и это должно быть в проекте и в эксплуатационных затратах.",
    });
  }

  /* ---------------------------------------------------------------
   * 9. ОБЕЗЗАРАЖИВАНИЕ — п. 6.235
   * --------------------------------------------------------------- */
  if (input.disinfection === false) {
    add({
      key: "disinfection",
      subject: "Обеззараживание",
      level: "norm",
      declared: "не предусмотрено",
      required: "предусматривается перед сбросом",
      ref: kmkRef("6.229"),
      consequence: "Сброс без обеззараживания не согласуют; ступень придётся достраивать после экспертизы.",
    });
  } else if (has(input.contactMinutes)) {
    const t = num(input.contactMinutes);
    add({
      key: "contact",
      subject: "Время контакта при обеззараживании",
      level: t >= DISINFECTION.contactMinutes.value ? "ok" : "norm",
      declared: `${f1(t)} мин`,
      required: `не менее ${DISINFECTION.contactMinutes.value} мин`,
      ref: DISINFECTION.contactMinutes.ref,
      consequence:
        t >= DISINFECTION.contactMinutes.value
          ? "Соответствует."
          : "Контактный резервуар мал: обеззараживание по бумаге есть, по факту доза не отрабатывает.",
    });
  }

  /* ---------------------------------------------------------------
   * 10. САНИТАРНО-ЗАЩИТНАЯ ЗОНА — табл. 1
   * --------------------------------------------------------------- */
  if (has(input.distanceToHousingM) && has(input.flowM3Day) && input.plantKind) {
    const szz = sanitaryZone(Q, input.plantKind, input.sludgeBedsOnSite ?? false);
    const d = num(input.distanceToHousingM);
    const req = szz.meters;
    if (Number.isFinite(req) && req > 0) {
      add({
        key: "szz",
        subject: "Санитарно-защитная зона",
        level: d >= req ? "ok" : "norm",
        declared: `${f1(d)} м до жилой застройки`,
        required: `${f1(req)} м — ${szz.basis}`,
        ref: kmkRef("1.10", "табл. 1"),
        consequence:
          d >= req
            ? "Соответствует табл. 1."
            : "Зона не выдержана: площадку либо переносить, либо менять состав сооружений. Это выясняется до проектирования, а не после.",
      });
    }
  }

  const counts: Record<FindingLevel, number> = { fail: 0, norm: 0, doubt: 0, ok: 0, nodata: 0 };
  out.forEach((f) => {
    counts[f.level] += 1;
  });

  const summary =
    counts.fail > 0
      ? `Проверка выявила ${counts.fail} отклонений, при которых сооружение не выйдет на заявленные показатели, и ${counts.norm} формальных нарушений норм.`
      : counts.norm > 0
        ? `Отклонений, ломающих работу сооружений, не выявлено; формальных нарушений норм — ${counts.norm}.`
        : counts.doubt > 0
          ? `Прямых нарушений не выявлено; ${counts.doubt} позиций требуют пояснения автора расчёта.`
          : counts.ok > 0
            ? "Проверенные позиции соответствуют ҚМҚ 2.04.03-19."
            : "Проверять нечего: в исходных материалах нет ни одной величины, которую можно сверить с нормой.";

  return { findings: out, counts, summary };
}

/* ------------------------------------------------------------------
 * СКОРОСТЬ ОКИСЛЕНИЯ ρ — ф. (52) п. 6.143
 *
 *   ρ = ρ_max·L_ex·C_O / [ (L_ex·C_O + K_l·C_O + K_O·L_ex)·(1 + φ·a_i) ]
 *
 * Брать вместо этого ρ_max = 85 мг/(г·ч) — распространённая ошибка, и
 * она уменьшает расчётное время аэрации втрое. Именно на ней чужие
 * расчёты «получают» аэротенк вдвое меньше нужного.
 * Константы — табл. 41 (городские сточные воды), C_O = 2 мг/л (п. 6.156).
 * ------------------------------------------------------------------ */
export function aerationRate(doseGL: number, lexMgL: number, cOMgL = AEROTANK.air.cODefault): number {
  const { rhoMax, kL, kO, phi } = AEROTANK.table41Municipal;
  const denom = (lexMgL * cOMgL + kL * cOMgL + kO * lexMgL) * (1 + phi * doseGL);
  if (!(denom > 0)) return rhoMax;
  return (rhoMax * lexMgL * cOMgL) / denom;
}

/** Доза ила по табл. 40 (п. 6.143) — аэротенки без регенераторов. */
function doseByBod(bodFullMgL: number): number {
  if (!Number.isFinite(bodFullMgL)) return 2;
  for (const row of AEROTANK.table40Dose) {
    if (bodFullMgL <= row.bodUpTo) {
      /* В табл. 40 последняя строка задаёт не число, а диапазон
         1,8–3 г/л. Берём нижнюю границу: она даёт бо́льший расчётный
         объём, и проверка чужого проекта не должна быть мягче, чем
         норма позволяет. Array.isArray не сужает readonly-кортеж,
         поэтому тип проверяется явно. */
      const d: number | readonly number[] = row.doseGL;
      return typeof d === "number" ? d : d[0];
    }
  }
  return 2;
}
