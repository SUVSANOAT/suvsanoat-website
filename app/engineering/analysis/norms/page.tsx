"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  KMK_2_04_03_19,
  getKmkFlowBasis,
} from "./kmk-2-04-03-19";

import {
  KMK_2_04_01_98,
  calculateAverageHourlyFlow,
  m3DayToLps,
  lpsToM3Hour,
} from "./kmk-2-04-01-98";

import {
  KMK_2_04_03_19_DOC,
  TABLE_2_NOTES,
  TABLE_3_WATER_USE,
  TABLE_3_NOTES,
  TABLE_25_PER_CAPITA_G_DAY,
  TABLE_25_NOTES,
  BIO_INLET_LIMITS,
  BIO_INLET_CONCENTRATIONS_REF,
  STAGE_EFFECTS,
  BOD5_TO_BODFULL,
  DEFAULT_WATER_USE_HORIZON,
  specificWaterUse,
  domesticConcentrations,
  kmkRef,
  type SettlementCategory,
  type WaterUseHorizon,
} from "../../../../norms/kmk-2-04-03-19";

const SETTLEMENT_CATEGORIES: readonly SettlementCategory[] = [
  "city-over-100k",
  "city-under-100k",
  "town-under-50k",
];

/** Диапазон табл. 3 (все категории и горизонты), л/(чел·сут). */
const TABLE_3_RANGE = (() => {
  const all = SETTLEMENT_CATEGORIES.flatMap((id) => [
    TABLE_3_WATER_USE[id].lps[2020],
    TABLE_3_WATER_USE[id].lps[2035],
  ]);
  return { min: Math.min(...all), max: Math.max(...all) };
})();

function parseSettlementCategory(
  raw: string | null,
): SettlementCategory | null {
  if (raw && (SETTLEMENT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as SettlementCategory;
  }
  if (raw === "over100-central") return "city-over-100k";
  if (raw === "under100-central") return "city-under-100k";
  if (raw === "under50-no-central" || raw === "under50-central") {
    return "town-under-50k";
  }
  return null;
}

function num(value: string | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fmt(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function interpolate(
  value: number,
  rows: readonly {
    averageLps: number;
    kMax: number;
    kMin: number;
  }[],
) {
  if (!rows.length) {
    return null;
  }

  if (value < rows[0].averageLps) {
    return null;
  }

  if (value >= rows[rows.length - 1].averageLps) {
    return {
      kMax: rows[rows.length - 1].kMax,
      kMin: rows[rows.length - 1].kMin,
      lower: rows[rows.length - 1],
      upper: rows[rows.length - 1],
      interpolated: false,
    };
  }

  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];

    if (value >= a.averageLps && value <= b.averageLps) {
      if (value === a.averageLps) {
        return {
          kMax: a.kMax,
          kMin: a.kMin,
          lower: a,
          upper: a,
          interpolated: false,
        };
      }

      const ratio =
        (value - a.averageLps) /
        (b.averageLps - a.averageLps);

      return {
        kMax:
          a.kMax +
          (b.kMax - a.kMax) * ratio,

        kMin:
          a.kMin +
          (b.kMin - a.kMin) * ratio,

        lower: a,
        upper: b,
        interpolated: true,
      };
    }
  }

  return null;
}

function Card({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={card}>
      <div style={smallLabel}>{label}</div>

      <div
        style={{
          fontSize: 21,
          fontWeight: 800,
          color: accent ? "#00d9ff" : "#f4f7f8",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Status({
  type,
  children,
}: {
  type: "ok" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    ok: {
      border: "#145d54",
      background: "#092823",
      color: "#5de0c4",
    },
    warning: {
      border: "#735b18",
      background: "#2b230b",
      color: "#ffc94d",
    },
    info: {
      border: "#174f68",
      background: "#092431",
      color: "#66d9ff",
    },
  };

  const s = styles[type];

  return (
    <div
      style={{
        border: `1px solid ${s.border}`,
        background: s.background,
        color: s.color,
        borderRadius: 10,
        padding: "14px 16px",
        lineHeight: 1.6,
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={section}>
      <div style={sectionLabel}>{title}</div>
      {children}
    </section>
  );
}

function NormsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const objectName =
    params.get("object") || "Объект";

  const flow = num(params.get("flow"));
  const people = num(params.get("people"));
  const hours = Math.max(
    1,
    num(params.get("hours"), 24),
  );

  const bod = num(params.get("bod"));
  const cod = num(params.get("cod"));
  const tss = num(params.get("tss"));
  const nitrogen = num(params.get("nitrogen"));
  const phosphorus = num(
    params.get("phosphorus"),
  );

  const projectType =
    params.get("projectType") ||
    "Не указан";

  /*
   * Категория населённого пункта и горизонт табл. 3 — из состояния
   * мастера (шаг 02 пишет `category`, `year`, `specificFlow`).
   */
  const settlementCategory = parseSettlementCategory(
    params.get("category"),
  );
  const horizon: WaterUseHorizon =
    params.get("year") === "2020" ? 2020 : DEFAULT_WATER_USE_HORIZON;
  const specificFlowParam = num(params.get("specificFlow"));

  const calculation = useMemo(() => {
    const qAverageLps = m3DayToLps(flow);

    const averageHour =
      calculateAverageHourlyFlow(flow);

    const tableRows =
      KMK_2_04_03_19.table2.rows;

    const coefficientResult =
      qAverageLps !== null
        ? interpolate(qAverageLps, tableRows)
        : null;

    const qMaxLps =
      qAverageLps !== null &&
      coefficientResult
        ? qAverageLps *
          coefficientResult.kMax
        : null;

    const qMinLps =
      qAverageLps !== null &&
      coefficientResult
        ? qAverageLps *
          coefficientResult.kMin
        : null;

    const qMaxM3Hour =
      qMaxLps !== null
        ? lpsToM3Hour(qMaxLps)
        : null;

    const qMinM3Hour =
      qMinLps !== null
        ? lpsToM3Hour(qMinLps)
        : null;

    /*
     * Проверка по числу жителей — табл. 3 ҚМҚ 2.04.03-19 (п. 2.9).
     * Если категория известна из состояния мастера — точное значение
     * по выбранной категории/горизонту; иначе — диапазон табл. 3.
     */
    const waterUse =
      settlementCategory !== null
        ? specificWaterUse(settlementCategory, horizon)
        : null;

    const table3Check =
      people > 0
        ? waterUse
          ? {
              mode: "exact" as const,
              lpcd: waterUse.lpcd,
              source: waterUse.source,
              qMin: (people * waterUse.lpcd) / 1000,
              qMax: (people * waterUse.lpcd) / 1000,
            }
          : {
              mode: "range" as const,
              lpcd: null,
              source: `${KMK_2_04_03_19_DOC.code}, п. 2.9, табл. 3 (диапазон ${TABLE_3_RANGE.min}–${TABLE_3_RANGE.max} л/чел·сут; категория населённого пункта не задана)`,
              qMin: (people * TABLE_3_RANGE.min) / 1000,
              qMax: (people * TABLE_3_RANGE.max) / 1000,
            }
        : null;

    /* Фактическое удельное водоотведение проекта, л/(чел·сут). */
    const projectLpcd =
      people > 0 && flow > 0 ? (flow * 1000) / people : null;

    /*
     * Ориентировочные концентрации бытового стока по табл. 25 (п. 6.4)
     * при удельном водоотведении: из состояния мастера (specificFlow),
     * иначе по табл. 3, иначе по фактическому расходу на жителя.
     */
    const lpcdForTable25 =
      specificFlowParam > 0
        ? specificFlowParam
        : waterUse
          ? waterUse.lpcd
          : projectLpcd;

    const domestic =
      lpcdForTable25 && lpcdForTable25 > 0
        ? domesticConcentrations(lpcdForTable25)
        : null;

    const smallFlow =
      qAverageLps !== null &&
      qAverageLps < 5;

    return {
      qAverageLps,
      averageHour,
      coefficientResult,
      qMaxLps,
      qMinLps,
      qMaxM3Hour,
      qMinM3Hour,
      table3Check,
      projectLpcd,
      lpcdForTable25,
      domestic,
      smallFlow,
    };
  }, [flow, people, settlementCategory, horizon, specificFlowParam]);

  /* Условия входа в биологическую очистку — п. 6.2, прим. 2, 3. */
  const bioInlet = useMemo(() => {
    const bodFull = bod > 0 ? bod / BOD5_TO_BODFULL : null;
    const nRequired = bodFull !== null ? (bodFull / 100) * BIO_INLET_LIMITS.nPer100Bod : null;
    const pRequired = bodFull !== null ? (bodFull / 100) * BIO_INLET_LIMITS.pPer100Bod : null;
    return {
      bodFull,
      bodOk:
        bodFull === null
          ? null
          : bodFull <= BIO_INLET_LIMITS.bodFullMaxMgL[0]
            ? "ok"
            : bodFull <= BIO_INLET_LIMITS.bodFullMaxMgL[1]
              ? "limit"
              : "over",
      nRequired,
      pRequired,
      nOk: nRequired !== null && nitrogen > 0 ? nitrogen >= nRequired : null,
      pOk: pRequired !== null && phosphorus > 0 ? phosphorus >= pRequired : null,
    };
  }, [bod, nitrogen, phosphorus]);

  const normativeStatus =
    calculation.smallFlow
      ? "warning"
      : calculation.coefficientResult
        ? "ok"
        : "warning";

  const normativeStatusText =
    calculation.smallFlow
      ? `Средний расход менее 5 л/с. ${TABLE_2_NOTES[1]} Таблица 2 ${KMK_2_04_03_19_DOC.code} автоматически не применяется.`
      : calculation.coefficientResult
        ? `Средний расход попадает в область применения табл. 2 ${KMK_2_04_03_19_DOC.code} (п. 2.7).`
        : "Не удалось выполнить нормативный расчёт.";

  return (
    <main style={page}>
      <div style={container}>

        <button
          onClick={() => router.back()}
          style={back}
        >
          ← Назад
        </button>

        <div style={eyebrow}>
          SUVSANOAT ENGINEERING AI
        </div>

        <h1 style={title}>
          Нормативная проверка
        </h1>

        <p style={lead}>
          Автоматическая проверка исходных
          гидравлических данных по подключённым
          нормативным модулям КМК Республики
          Узбекистан.
        </p>

        {/* ОБЪЕКТ */}

        <Section title="ОБЪЕКТ / ИСХОДНЫЕ ДАННЫЕ">

          <div style={grid}>

            <Card
              label="ОБЪЕКТ"
              value={objectName}
            />

            <Card
              label="ТИП ПРОЕКТА"
              value={projectType}
            />

            <Card
              label="QСУТ"
              value={`${fmt(flow, 2)} м³/сут`}
              accent
            />

            <Card
              label="ЛЮДИ"
              value={`${people || 0} чел.`}
            />

            <Card
              label="РЕЖИМ"
              value={`${hours} ч/сут`}
            />

          </div>

        </Section>

        {/* НОРМАТИВНАЯ БАЗА */}

        <Section title="ПРИМЕНЁННАЯ НОРМАТИВНАЯ БАЗА">

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >

            <div style={normDocument}>
              <div style={documentCode}>
                {KMK_2_04_03_19_DOC.code}
              </div>

              <div style={documentTitle}>
                {KMK_2_04_03_19_DOC.title}
              </div>

              <div style={documentText}>
                {KMK_2_04_03_19_DOC.edition}; взамен {KMK_2_04_03_19_DOC.replaces}.
                Утверждён: {KMK_2_04_03_19_DOC.approvedBy}; введён в действие
                с {KMK_2_04_03_19_DOC.effectiveFrom}.
              </div>

              <div style={documentSource}>
                п. 2.7, табл. 2 — коэффициенты неравномерности ·
                п. 2.9, табл. 3 — удельное водоотведение ·
                п. 6.2 — условия входа в биологию ·
                п. 6.4, табл. 25 — загрязнения на жителя ·
                п. 6.10 — эффекты ступеней
              </div>
            </div>

            <div style={normDocument}>
              <div style={documentCode}>
                КМК 2.04.01-98
              </div>

              <div style={documentTitle}>
                {KMK_2_04_01_98.title}
              </div>

              <div style={documentText}>
                Нормы расхода воды потребителями
              </div>

              <div style={documentSource}>
                Приложение 3 · нормы для различных
                категорий потребителей
              </div>
            </div>

          </div>

        </Section>

        {/* СТАТУС */}

        <Section title="СТАТУС НОРМАТИВНОЙ ПРОВЕРКИ">

          <Status type={normativeStatus}>
            <strong>
              {normativeStatus === "ok"
                ? "✓ НОРМАТИВНАЯ ПРОВЕРКА ВЫПОЛНЕНА"
                : "⚠ ТРЕБУЕТСЯ ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА"}
            </strong>

            <br />

            {normativeStatusText}
          </Status>

        </Section>

        {/* QСР */}

        <Section title={`${KMK_2_04_03_19_DOC.code} — СРЕДНИЙ РАСХОД`}>

          <div style={grid}>

            <Card
              label="QСУТ"
              value={`${fmt(flow)} м³/сут`}
            />

            <Card
              label="QСР"
              value={`${fmt(
                calculation.qAverageLps ?? 0,
              )} л/с`}
              accent
            />

            <Card
              label="QСР ЧАСОВОЙ"
              value={`${fmt(
                calculation.averageHour ?? 0,
              )} м³/ч`}
            />

            <Card
              label="QСР ПОТОК"
              value={`${fmt(
                calculation.qAverageLps ?? 0,
              )} л/с`}
            />

          </div>

          <div style={basisBox}>
            <div style={smallLabel}>
              НОРМАТИВНОЕ ОБОСНОВАНИЕ
            </div>

            <div style={basisTitle}>
              {getKmkFlowBasis("average").document}
            </div>

            <div style={basisText}>
              {getKmkFlowBasis("average").section}
              {" · "}
              п. {getKmkFlowBasis("average").clause}
              {" · "}
              {getKmkFlowBasis("average").title}
            </div>

            <div style={formula}>
              Qср = Qсут × 1000 / 86400
            </div>
          </div>

        </Section>

        {/* КОЭФФИЦИЕНТЫ */}

        <Section title={`${KMK_2_04_03_19_DOC.code} — КОЭФФИЦИЕНТЫ НЕРАВНОМЕРНОСТИ (П. 2.7, ТАБЛ. 2)`}>

          {calculation.smallFlow ? (

            <Status type="warning">

              <strong>
                Qср &lt; 5 л/с
              </strong>

              <br />

              Текущая таблица 2 начинается
              с 5 л/с. Автоматическое
              определение Kgen.max и Kgen.min
              не выполняется.

              <br />

              <br />

              Требуется отдельная нормативная
              проверка по применимому документу.

            </Status>

          ) : (
            <>
              <div style={grid}>

                <Card
                  label="QСР"
                  value={`${fmt(
                    calculation.qAverageLps ?? 0,
                  )} л/с`}
                />

                <Card
                  label="KGEN.MAX"
                  value={fmt(
                    calculation.coefficientResult
                      ?.kMax ?? 0,
                  )}
                  accent
                />

                <Card
                  label="KGEN.MIN"
                  value={fmt(
                    calculation.coefficientResult
                      ?.kMin ?? 0,
                  )}
                />

              </div>

              {calculation.coefficientResult && (
                <div style={basisBox}>

                  <div style={smallLabel}>
                    МЕТОД РАСЧЁТА
                  </div>

                  <div style={basisText}>
                    {calculation.coefficientResult
                      .interpolated
                      ? "Линейная интерполяция между соседними значениями таблицы 2."
                      : "Использовано табличное значение без интерполяции."}
                  </div>

                  <div style={tableRange}>

                    Нижняя точка:
                    {" "}
                    <strong>
                      {
                        calculation
                          .coefficientResult
                          .lower
                          .averageLps
                      }{" "}
                      л/с
                    </strong>

                    {" → "}

                    Kmax =
                    {" "}
                    {
                      calculation
                        .coefficientResult
                        .lower
                        .kMax
                    }

                    {" · "}

                    Kmin =
                    {" "}
                    {
                      calculation
                        .coefficientResult
                        .lower
                        .kMin
                    }

                    <br />

                    Верхняя точка:
                    {" "}
                    <strong>
                      {
                        calculation
                          .coefficientResult
                          .upper
                          .averageLps
                      }{" "}
                      л/с
                    </strong>

                    {" → "}

                    Kmax =
                    {" "}
                    {
                      calculation
                        .coefficientResult
                        .upper
                        .kMax
                    }

                    {" · "}

                    Kmin =
                    {" "}
                    {
                      calculation
                        .coefficientResult
                        .upper
                        .kMin
                    }

                  </div>

                </div>
              )}

            </>
          )}

        </Section>

        {/* QMAX / QMIN */}

        <Section title="РАСЧЁТНЫЕ РАСХОДЫ СТОЧНЫХ ВОД">

          <div style={grid}>

            <Card
              label="QСР"
              value={`${fmt(
                calculation.qAverageLps ?? 0,
              )} л/с`}
            />

            <Card
              label="QMAX"
              value={
                calculation.qMaxLps !== null
                  ? `${fmt(
                      calculation.qMaxLps,
                    )} л/с`
                  : "—"
              }
              accent
            />

            <Card
              label="QMAX"
              value={
                calculation.qMaxM3Hour !== null
                  ? `${fmt(
                      calculation.qMaxM3Hour,
                    )} м³/ч`
                  : "—"
              }
            />

            <Card
              label="QMIN"
              value={
                calculation.qMinLps !== null
                  ? `${fmt(
                      calculation.qMinLps,
                    )} л/с`
                  : "—"
              }
            />

            <Card
              label="QMIN"
              value={
                calculation.qMinM3Hour !== null
                  ? `${fmt(
                      calculation.qMinM3Hour,
                    )} м³/ч`
                  : "—"
              }
            />

          </div>

          <div style={basisBox}>

            <div style={smallLabel}>
              НОРМАТИВНЫЕ ФОРМУЛЫ
            </div>

            <div style={formula}>
              Qmax = Qср × Kgen.max
            </div>

            <div style={formula}>
              Qmin = Qср × Kgen.min
            </div>

            <div style={basisText}>
              Основание: {KMK_2_04_03_19_DOC.code},
              п. 2.7, таблица 2.
            </div>

          </div>

        </Section>

        {/* ТАБЛ. 3 — ПРОВЕРКА ПО ЧИСЛУ ЖИТЕЛЕЙ */}

        <Section title={`${KMK_2_04_03_19_DOC.code} — ПРОВЕРКА ПО ЧИСЛУ ЖИТЕЛЕЙ (П. 2.9, ТАБЛ. 3)`}>

          {people <= 0 || !calculation.table3Check ? (

            <Status type="info">
              Число жителей не задано. Проверка удельного
              водоотведения по табл. 3 {KMK_2_04_03_19_DOC.code} не
              выполняется.
            </Status>

          ) : (

            <>
              <div style={grid}>

                <Card
                  label="ЖИТЕЛИ"
                  value={`${people} чел.`}
                />

                <Card
                  label="НОРМА ТАБЛ. 3"
                  value={
                    calculation.table3Check.mode === "exact"
                      ? `${calculation.table3Check.lpcd} л/чел·сут`
                      : `${TABLE_3_RANGE.min}–${TABLE_3_RANGE.max} л/чел·сут`
                  }
                  accent
                />

                <Card
                  label="Q ПО НОРМЕ"
                  value={
                    calculation.table3Check.mode === "exact"
                      ? `${fmt(calculation.table3Check.qMin)} м³/сут`
                      : `${fmt(calculation.table3Check.qMin)}–${fmt(calculation.table3Check.qMax)} м³/сут`
                  }
                />

                <Card
                  label="ФАКТ ПРОЕКТА"
                  value={
                    calculation.projectLpcd !== null
                      ? `${fmt(calculation.projectLpcd, 0)} л/чел·сут`
                      : "—"
                  }
                />

              </div>

              <div style={basisBox}>
                <div style={smallLabel}>
                  НОРМАТИВНОЕ ОБОСНОВАНИЕ
                </div>

                <div style={basisText}>
                  {calculation.table3Check.source}.
                  {" "}
                  Табл. 3 применяется при разработке схем канализации
                  населённых пунктов (п. 1.1); для отдельных жилых и
                  общественных зданий — п. 2.1 (ШНК 2.04.02-97*) и
                  п. 2.2 (КМК 2.04.01-98). {TABLE_3_NOTES[1]}{" "}
                  {TABLE_3_NOTES[2]}
                </div>
              </div>

              {flow > 0 && (
                <Status
                  type={
                    flow >= calculation.table3Check.qMin * 0.8
                      ? "ok"
                      : "warning"
                  }
                >
                  <strong>
                    {flow >= calculation.table3Check.qMin * 0.8
                      ? "✓ Расход проекта согласуется с табл. 3 (с учётом допуска −20 % по прим. 2)"
                      : "⚠ Расход проекта ниже удельного водоотведения по табл. 3 более чем на 20 %"}
                  </strong>
                  <br />
                  Q проекта: {fmt(flow)} м³/сут · Q по табл. 3:{" "}
                  {calculation.table3Check.mode === "exact"
                    ? fmt(calculation.table3Check.qMin)
                    : `${fmt(calculation.table3Check.qMin)}–${fmt(calculation.table3Check.qMax)}`}{" "}
                  м³/сут
                </Status>
              )}
            </>
          )}

        </Section>

        {/* ТАБЛ. 25 — ЗАГРЯЗНЕНИЯ НА ЖИТЕЛЯ */}

        <Section title={`${KMK_2_04_03_19_DOC.code} — ЗАГРЯЗНЕНИЯ НА ОДНОГО ЖИТЕЛЯ (П. 6.4, ТАБЛ. 25)`}>

          <div style={grid}>
            <Card label="ВЗВЕШЕННЫЕ" value={`${TABLE_25_PER_CAPITA_G_DAY.suspendedSolids} г/сут`} />
            <Card label="БПКПОЛН" value={`${TABLE_25_PER_CAPITA_G_DAY.bodFull} г/сут`} accent />
            <Card label="ХПК" value={`${TABLE_25_PER_CAPITA_G_DAY.cod} г/сут`} />
            <Card label="АЗОТ NH₄" value={`${TABLE_25_PER_CAPITA_G_DAY.ammoniumN} г/сут`} />
            <Card label="ФОСФАТЫ P₂O₅" value={`${TABLE_25_PER_CAPITA_G_DAY.phosphatesP2O5} г/сут`} />
            <Card label="ЖИРЫ" value={`${TABLE_25_PER_CAPITA_G_DAY.fats} г/сут`} />
            <Card label="ПАВ" value={`${TABLE_25_PER_CAPITA_G_DAY.surfactants} г/сут`} />
          </div>

          {calculation.domestic ? (
            <div style={basisBox}>
              <div style={smallLabel}>
                ОРИЕНТИРОВОЧНЫЕ КОНЦЕНТРАЦИИ БЫТОВОГО СТОКА
              </div>
              <div style={basisText}>
                {calculation.domestic.source}: взвешенные{" "}
                <strong>{fmt(calculation.domestic.ss, 0)}</strong> · БПКполн{" "}
                <strong>{fmt(calculation.domestic.bodFull, 0)}</strong> (БПК₅ ≈{" "}
                {fmt(calculation.domestic.bod5, 0)} при БПК₅/БПКполн = {BOD5_TO_BODFULL},
                практика) · ХПК <strong>{fmt(calculation.domestic.cod, 0)}</strong> ·
                N-NH₄ <strong>{fmt(calculation.domestic.nh4N, 1)}</strong> · P{" "}
                <strong>{fmt(calculation.domestic.pTotal, 1)}</strong> мг/л.
                {" "}{TABLE_25_NOTES[0]}
              </div>
            </div>
          ) : (
            <p style={note}>
              Для пересчёта табл. 25 в концентрации (п. 6.4) требуется
              удельное водоотведение или число жителей и расход.
            </p>
          )}

        </Section>

        {/* КАЧЕСТВО */}

        <Section title="ИСХОДНЫЕ ПОКАЗАТЕЛИ СТОЧНЫХ ВОД">

          <div style={grid}>

            <Card
              label="БПК₅"
              value={
                bod > 0
                  ? `${fmt(bod, 0)} мг/л`
                  : "Не задано"
              }
            />

            <Card
              label="ХПК"
              value={
                cod > 0
                  ? `${fmt(cod, 0)} мг/л`
                  : "Не задано"
              }
            />

            <Card
              label="ВЗВ"
              value={
                tss > 0
                  ? `${fmt(tss, 0)} мг/л`
                  : "Не задано"
              }
            />

            <Card
              label="АЗОТ"
              value={
                nitrogen > 0
                  ? `${fmt(
                      nitrogen,
                      0,
                    )} мг/л`
                  : "Не задано"
              }
            />

            <Card
              label="ФОСФОР"
              value={
                phosphorus > 0
                  ? `${fmt(
                      phosphorus,
                      1,
                    )} мг/л`
                  : "Не задано"
              }
            />

          </div>

          <Status type="info">

            <strong>
              Контроль качества:
            </strong>

            {" "}
            нормативные требования к очищенной
            воде не подставляются автоматически
            без подтверждённой категории сброса,
            точки выпуска и применимого
            нормативного документа.
            Допустимые концентрации при приёме на
            биологическую очистку — {BIO_INLET_CONCENTRATIONS_REF}.

          </Status>

          <div style={basisBox}>
            <div style={smallLabel}>
              УСЛОВИЯ ВХОДА В БИОЛОГИЧЕСКУЮ ОЧИСТКУ — {BIO_INLET_LIMITS.ref}
            </div>

            <div style={basisText}>
              pH {BIO_INLET_LIMITS.phMin}–{BIO_INLET_LIMITS.phMax} ·
              температура {BIO_INLET_LIMITS.tempMinC}–{BIO_INLET_LIMITS.tempMaxC} °C ·
              БПКполн не выше {BIO_INLET_LIMITS.bodFullMaxMgL[0]}–{BIO_INLET_LIMITS.bodFullMaxMgL[1]} мг/л
              (в зависимости от состава сооружений) ·
              биогены: не менее {BIO_INLET_LIMITS.nPer100Bod} мг/л N и{" "}
              {BIO_INLET_LIMITS.pPer100Bod} мг/л P на каждые 100 мг/л БПКполн ·
              не допускаются: {BIO_INLET_LIMITS.forbidden}.
            </div>

            {bioInlet.bodFull !== null && (
              <div style={tableRange}>
                БПКполн проекта ≈ <strong>{fmt(bioInlet.bodFull, 0)} мг/л</strong>{" "}
                (из БПК₅ {fmt(bod, 0)} при БПК₅/БПКполн = {BOD5_TO_BODFULL}, практика){" "}
                —{" "}
                {bioInlet.bodOk === "ok"
                  ? "не выше 250 мг/л ✓"
                  : bioInlet.bodOk === "limit"
                    ? "в интервале 250–500 мг/л: допустимо при соответствующем составе сооружений"
                    : "выше 500 мг/л ⚠ — требуется предварительная очистка или усреднение"}
                <br />
                Минимум биогенов на 100 мг/л БПКполн: N ≥{" "}
                <strong>{fmt(bioInlet.nRequired ?? 0, 1)}</strong> мг/л
                {bioInlet.nOk === null
                  ? " (азот не задан)"
                  : bioInlet.nOk
                    ? " ✓"
                    : " ⚠ дефицит азота"}
                {" · "}P ≥ <strong>{fmt(bioInlet.pRequired ?? 0, 1)}</strong> мг/л
                {bioInlet.pOk === null
                  ? " (фосфор не задан)"
                  : bioInlet.pOk
                    ? " ✓"
                    : " ⚠ дефицит фосфора"}
              </div>
            )}
          </div>

          <div style={basisBox}>
            <div style={smallLabel}>
              РАСЧЁТНЫЕ ЭФФЕКТЫ СТУПЕНЕЙ ОЧИСТКИ — {STAGE_EFFECTS.mechanical.ref}
            </div>

            <div style={basisText}>
              Механическая очистка: взвешенные{" "}
              {STAGE_EFFECTS.mechanical.ssRemoval[0] * 100}–{STAGE_EFFECTS.mechanical.ssRemoval[1] * 100} %
              (+{STAGE_EFFECTS.mechanical.withPreaerationBonus[0] * 100}–{STAGE_EFFECTS.mechanical.withPreaerationBonus[1] * 100} %
              с преаэраторами/биокоагуляторами), БПК {STAGE_EFFECTS.mechanical.bodRemoval * 100} %.
              <br />
              Биологическая очистка: взвешенные до {STAGE_EFFECTS.biological.ssOutMgL} мг/л,
              БПКполн {STAGE_EFFECTS.biological.bodFullOutMgL[0]}–{STAGE_EFFECTS.biological.bodFullOutMgL[1]} мг/л.
              <br />
              Доочистка: взвешенные {STAGE_EFFECTS.tertiary.ssOutMgL[0]}–{STAGE_EFFECTS.tertiary.ssOutMgL[1]} мг/л,
              БПКполн {STAGE_EFFECTS.tertiary.bodFullOutMgL[0]}–{STAGE_EFFECTS.tertiary.bodFullOutMgL[1]} мг/л.
              {tss > 0 && (
                <>
                  <br />
                  Взвешенные вещества проекта {fmt(tss, 0)} мг/л: перед
                  биологической очисткой — не более 150 мг/л ({kmkRef("6.59")}).
                </>
              )}
            </div>
          </div>

        </Section>

        {/* ТАБЛИЦА 2 */}

        <Section title={`ТАБЛИЦА 2 — ${KMK_2_04_03_19_DOC.code} (П. 2.7)`}>

          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table style={table}>

              <thead>

                <tr>
                  <th style={th}>
                    Qср, л/с
                  </th>

                  <th style={th}>
                    Kgen.max
                  </th>

                  <th style={th}>
                    Kgen.min
                  </th>
                </tr>

              </thead>

              <tbody>

                {KMK_2_04_03_19.table2.rows.map(
                  (row) => {

                    const active =
                      calculation
                        .qAverageLps !== null &&
                      Math.abs(
                        calculation
                          .qAverageLps -
                          row.averageLps,
                      ) < 0.0001;

                    return (
                      <tr
                        key={row.averageLps}
                        style={
                          active
                            ? {
                                background:
                                  "#0c3340",
                              }
                            : undefined
                        }
                      >

                        <td style={td}>
                          {row.averageLps}
                        </td>

                        <td style={td}>
                          {row.kMax}
                        </td>

                        <td style={td}>
                          {row.kMin}
                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>

          <p style={note}>
            Для промежуточных значений
            текущая расчётная модель использует
            линейную интерполяцию между
            соседними табличными значениями.
          </p>

        </Section>

        {/* ИТОГ */}

        <Section title="НОРМАТИВНОЕ ЗАКЛЮЧЕНИЕ">

          <div style={conclusion}>

            <div style={conclusionTitle}>
              РЕЗУЛЬТАТ ПРОВЕРКИ
            </div>

            <p style={paragraph}>

              Для объекта{" "}
              <strong>
                {objectName}
              </strong>{" "}

              с расчётным расходом{" "}
              <strong>
                {fmt(flow)} м³/сут
              </strong>{" "}

              определён средний расход
              сточных вод{" "}
              <strong>
                {fmt(
                  calculation.qAverageLps ??
                    0,
                )}{" "}
                л/с
              </strong>.

            </p>

            {calculation.coefficientResult ? (

              <p style={paragraph}>

                По таблице 2 {KMK_2_04_03_19_DOC.code} (п. 2.7)
                приняты коэффициенты:

                {" "}

                <strong>
                  Kmax =
                  {" "}
                  {fmt(
                    calculation
                      .coefficientResult
                      .kMax,
                  )}
                </strong>

                {" · "}

                <strong>
                  Kmin =
                  {" "}
                  {fmt(
                    calculation
                      .coefficientResult
                      .kMin,
                  )}
                </strong>.

                Расчётный максимальный расход:
                {" "}

                <strong>
                  {fmt(
                    calculation
                      .qMaxM3Hour ??
                      0,
                  )}{" "}
                  м³/ч
                </strong>.

              </p>

            ) : (

              <p style={paragraph}>

                Автоматическое определение
                коэффициентов неравномерности
                по текущей таблице 2 не выполнено.
                Требуется отдельная нормативная
                проверка.

              </p>

            )}

            <Status type="info">

              Нормативный модуль является частью
              предварительного инженерного
              расчёта SUVSANOAT Engineering AI.
              Окончательное проектное решение
              должно быть подтверждено инженером
              и рабочей проектной документацией.

            </Status>

          </div>

        </Section>

        {/* НАВИГАЦИЯ */}

        <div style={actions}>

          <button
            style={secondary}
            onClick={() => router.back()}
          >
            ← Назад
          </button>

          <button
            style={secondary}
            onClick={() =>
              router.push(
                "/engineering/analysis/technology",
              )
            }
          >
            К технологии →
          </button>

          <button
            style={primary}
            onClick={() =>
              router.push(
                "/engineering",
              )
            }
          >
            Новое проектирование
          </button>

        </div>

        <p style={disclaimer}>
          Нормативная проверка не является
          рабочим проектом. Необходимо проверить
          исходные данные, категорию объекта,
          условия выпуска, лабораторные показатели
          и применимость нормативных документов
          перед выпуском проектной документации.
        </p>

      </div>
    </main>
  );
}

export default function NormsPage() {
  return (
    <Suspense fallback={null}>
      <NormsContent />
    </Suspense>
  );
}

/* =========================================================
   STYLES
========================================================= */

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#06151d",
  color: "#f4f7f8",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const container: React.CSSProperties = {
  width:
    "min(1180px, calc(100% - 32px))",
  margin: "0 auto",
  padding: "34px 0 80px",
};

const back: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#b7c9d0",
  cursor: "pointer",
  fontSize: 15,
  padding: 0,
  marginBottom: 34,
};

const eyebrow: React.CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "3px",
};

const title: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize:
    "clamp(42px, 7vw, 76px)",
  lineHeight: 1,
  letterSpacing: "-3px",
};

const lead: React.CSSProperties = {
  maxWidth: 850,
  color: "#8ca4ad",
  fontSize: 17,
  lineHeight: 1.7,
  margin: "24px 0 48px",
};

const section: React.CSSProperties = {
  border: "1px solid #1c3742",
  borderRadius: 14,
  background: "#081b24",
  padding: 28,
  marginBottom: 22,
};

const sectionLabel: React.CSSProperties = {
  color: "#657983",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "2px",
  marginBottom: 18,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 12,
};

const card: React.CSSProperties = {
  border: "1px solid #1d3a46",
  borderRadius: 10,
  padding: "16px 17px",
  background: "#071821",
  minHeight: 78,
};

const smallLabel: React.CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: 8,
};

const normDocument: React.CSSProperties = {
  border: "1px solid #1c3742",
  borderRadius: 10,
  padding: 20,
  background: "#071821",
};

const documentCode: React.CSSProperties = {
  color: "#00d9ff",
  fontSize: 20,
  fontWeight: 900,
};

const documentTitle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 17,
  fontWeight: 800,
};

const documentText: React.CSSProperties = {
  marginTop: 8,
  color: "#b7c9d0",
  lineHeight: 1.5,
};

const documentSource: React.CSSProperties = {
  marginTop: 8,
  color: "#657983",
  fontSize: 13,
};

const basisBox: React.CSSProperties = {
  marginTop: 18,
  border: "1px solid #174f68",
  background: "#071b25",
  borderRadius: 10,
  padding: 18,
};

const basisTitle: React.CSSProperties = {
  color: "#00d9ff",
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 8,
};

const basisText: React.CSSProperties = {
  color: "#b7c9d0",
  lineHeight: 1.6,
  fontSize: 14,
};

const formula: React.CSSProperties = {
  marginTop: 12,
  padding: "11px 13px",
  borderRadius: 8,
  background: "#06151d",
  border: "1px solid #1d3a46",
  color: "#f4f7f8",
  fontFamily:
    "Consolas, 'Courier New', monospace",
  fontSize: 14,
};

const tableRange: React.CSSProperties = {
  marginTop: 15,
  paddingTop: 15,
  borderTop: "1px solid #1c3742",
  color: "#8ca4ad",
  lineHeight: 1.8,
  fontSize: 13,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 13,
  color: "#00d9ff",
  background: "#071821",
  borderBottom: "1px solid #1c3742",
};

const td: React.CSSProperties = {
  padding: 13,
  borderBottom:
    "1px solid #172f39",
  color: "#d8e3e7",
};

const conclusion: React.CSSProperties = {
  border:
    "1px solid #174f68",
  borderRadius: 12,
  padding: 22,
  background:
    "linear-gradient(135deg, #081e28, #071821)",
};

const conclusionTitle: React.CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "2px",
  marginBottom: 14,
};

const paragraph: React.CSSProperties = {
  color: "#b7c9d0",
  lineHeight: 1.7,
  fontSize: 15,
};

const note: React.CSSProperties = {
  marginTop: 16,
  color: "#657983",
  fontSize: 12,
  lineHeight: 1.6,
};

const actions: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 30,
};

const secondary: React.CSSProperties = {
  border: "1px solid #244450",
  background: "#081b24",
  color: "#f4f7f8",
  borderRadius: 9,
  padding: "14px 20px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

const primary: React.CSSProperties = {
  border: "1px solid #00d9ff",
  background: "#00a9d4",
  color: "#ffffff",
  borderRadius: 9,
  padding: "14px 22px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 800,
};

const disclaimer: React.CSSProperties = {
  marginTop: 25,
  color: "#526a74",
  fontSize: 12,
  lineHeight: 1.7,
};