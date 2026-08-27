"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../../engineering.module.css";
import {
  KMK_2_04_03_19,
  getKmkFlowBasis,
} from "../norms/kmk-2-04-03-19";
import {
  KMK_2_04_01_98,
  getKmkConsumer,
  calculateAverageDailyFlow,
  getKmkSmallFlowBasis,
} from "../norms/kmk-2-04-01-98";

/*
 * =========================================================
 * SUVSANOAT ENGINEERING
 *
 * ШАГ 02 — РАСЧЁТНЫЕ РАСХОДЫ СТОЧНЫХ ВОД
 *
 * Нормативная база:
 * КМК 2.04.03-19
 * =========================================================
 */

type PopulationCategory =
  | "over100-central"
  | "under100-central"
  | "under50-no-central"
  | "under50-central";

const SPECIFIC_FLOW: Record<
  PopulationCategory,
  {
    label: string;
    value2020: number | null;
    value2035: number | null;
  }
> = {
  "over100-central": {
    label: "Город более 100 тыс. жителей, централизованная система",
    value2020: 230,
    value2035: 280,
  },
  "under100-central": {
    label: "Город до 100 тыс. жителей, централизованная система",
    value2020: 200,
    value2035: 230,
  },
  "under50-no-central": {
    label:
      "Город / посёлок / районный центр до 50 тыс., без централизованной системы",
    value2020: 150,
    value2035: null,
  },
  "under50-central": {
    label:
      "Город / посёлок / районный центр до 50 тыс., централизованная система",
    value2020: null,
    value2035: 170,
  },
};

function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

function getKgen(flowLs: number) {
  if (!Number.isFinite(flowLs) || flowLs <= 0) {
    return null;
  }

  if (
    flowLs <
    KMK_2_04_03_19.applicability.minimumAverageLpsForCurrentTable
  ) {
    return {
      max: null,
      min: null,
      status: "below-minimum" as const,
      lower: null,
      upper: null,
    };
  }

  const rows = KMK_2_04_03_19.table2.rows;

  if (flowLs >= rows[rows.length - 1].averageLps) {
    const last = rows[rows.length - 1];

    return {
      max: last.kMax,
      min: last.kMin,
      status: "table" as const,
      lower: last,
      upper: last,
    };
  }

  const exact = rows.find(
    (item) => item.averageLps === flowLs,
  );

  if (exact) {
    return {
      max: exact.kMax,
      min: exact.kMin,
      status: "table" as const,
      lower: exact,
      upper: exact,
    };
  }

  for (let i = 0; i < rows.length - 1; i++) {
    const left = rows[i];
    const right = rows[i + 1];

    if (
      flowLs > left.averageLps &&
      flowLs < right.averageLps
    ) {
      const max =
        left.kMax +
        ((flowLs - left.averageLps) *
          (right.kMax - left.kMax)) /
          (right.averageLps - left.averageLps);

      const min =
        left.kMin +
        ((flowLs - left.averageLps) *
          (right.kMin - left.kMin)) /
          (right.averageLps - left.averageLps);

      return {
        max,
        min,
        status: "interpolated" as const,
        lower: left,
        upper: right,
      };
    }
  }

  return null;
}


function getSmallFlowCalculation(
  qDailyM3: number,
  objectType: string,
) {
  if (!Number.isFinite(qDailyM3) || qDailyM3 <= 0) {
    return null;
  }

  const averageLs = (qDailyM3 * 1000) / 86400;
  const averageHourly = qDailyM3 / 24;

  return {
    averageLs,
    averageHourly,
    basis: getKmkSmallFlowBasis(),
    note:
      "КМК 2.04.01-98 применяется для расчёта малых расходов с учётом норм водопотребления и санитарно-технических приборов. По одному только Qсут окончательный Qmax/Qmin не определяется.",
    objectType,
  };
}


function SuvsanoatBrandHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "16px 20px",
        marginBottom: 34,
        border: "1px solid rgba(0,217,255,.18)",
        borderRadius: 12,
        background: "rgba(8,27,36,.82)",
      }}
    >
      <img
        src="/suvsanoat-logo.png"
        alt="SUVSANOAT ENGINEERING SYSTEMS"
        style={{
          display: "block",
          width: 270,
          height: "auto",
          maxWidth: "48vw",
          objectFit: "contain",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
          flexWrap: "wrap",
          color: "#8fa6b1",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#00d9ff", textDecoration: "none", fontWeight: 800 }}
        >
          www.suvsanoat.uz
        </a>
        <span>+998 77 304 34 00</span>
        <a
          href="mailto:suvsanoat@gmail.com"
          style={{ color: "#8fa6b1", textDecoration: "none" }}
        >
          suvsanoat@gmail.com
        </a>
      </div>
    </header>
  );
}

function SuvsanoatBrandFooter() {
  return (
    <footer
      style={{
        marginTop: 42,
        paddingTop: 22,
        borderTop: "1px solid #1c3742",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        color: "#627a84",
        fontSize: 11,
        lineHeight: 1.6,
      }}
    >
      <div>
        <div
          style={{
            color: "#b7c9d0",
            fontWeight: 900,
            letterSpacing: ".08em",
          }}
        >
          SUVSANOAT ENGINEERING SYSTEMS
        </div>
        <div>
          Расчёт, предварительный инженерный подбор и техническая аналитика.
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#00d9ff", textDecoration: "none", fontWeight: 800 }}
        >
          www.suvsanoat.uz
        </a>
        <div>+998 77 304 34 00 · suvsanoat@gmail.com</div>
      </div>
    </footer>
  );
}

function FlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const objectType = searchParams.get("object") || "Объект";

  const [calculationMode, setCalculationMode] = useState<"known" | "population">(
    searchParams.get("mode") === "population" ? "population" : "known",
  );

  const [flow, setFlow] = useState(searchParams.get("flow") || "");
  const [people, setPeople] = useState(searchParams.get("people") || "");

  const [normativeYear, setNormativeYear] = useState<"2020" | "2035">(
    searchParams.get("year") === "2020" ? "2020" : "2035",
  );

  const [populationCategory, setPopulationCategory] =
    useState<PopulationCategory>("under50-central");

  const [additionalPercent, setAdditionalPercent] = useState("0");
  const [workingHours, setWorkingHours] = useState(
    searchParams.get("hours") || "24",
  );

  const specificFlow = useMemo(() => {
    if (calculationMode !== "population") return null;

    return (
      SPECIFIC_FLOW[populationCategory][
        normativeYear === "2020" ? "value2020" : "value2035"
      ] ?? null
    );
  }, [calculationMode, populationCategory, normativeYear]);

  const calculatedFlow = useMemo(() => {
    let baseDaily = 0;

    if (calculationMode === "known") {
      baseDaily = Number(flow);
    }

    if (calculationMode === "population" && specificFlow !== null) {
      const peopleValue = Number(people);

      if (Number.isFinite(peopleValue) && peopleValue > 0) {
        baseDaily = (peopleValue * specificFlow) / 1000;
      }
    }

    if (!Number.isFinite(baseDaily) || baseDaily <= 0) return null;

    const extra = Number(additionalPercent);
    const safeExtra =
      Number.isFinite(extra) && extra >= 0 && extra <= 15 ? extra : 0;

    const daily = baseDaily * (1 + safeExtra / 100);
    const averageLs = (daily * 1000) / 86400;
    const averageHourly = daily / 24;

    const kgen = getKgen(averageLs);

    const maxLs =
      kgen?.max !== null && kgen?.max !== undefined
        ? averageLs * kgen.max
        : null;

    const minLs =
      kgen?.min !== null && kgen?.min !== undefined
        ? averageLs * kgen.min
        : null;

    const maxHourly = maxLs !== null ? maxLs * 3.6 : null;
    const minHourly = minLs !== null ? minLs * 3.6 : null;

    return {
      baseDaily,
      daily,
      averageHourly,
      averageLs,
      kMax: kgen?.max ?? null,
      kMin: kgen?.min ?? null,
      maxLs,
      minLs,
      maxHourly,
      minHourly,
      monthly: daily * 30,
      yearly: daily * 365,
      specificFlow,
      additionalPercent: safeExtra,
      kStatus: kgen?.status ?? null,
      kLower: kgen?.lower ?? null,
      kUpper: kgen?.upper ?? null,
      normativeBasis:
        averageLs < KMK_2_04_03_19.applicability.minimumAverageLpsForCurrentTable
          ? getKmkSmallFlowBasis()
          : getKmkFlowBasis("coefficients"),
      smallFlow:
        averageLs <
        KMK_2_04_03_19.applicability.minimumAverageLpsForCurrentTable
          ? getSmallFlowCalculation(daily, objectType)
          : null,
    };
  }, [calculationMode, flow, people, specificFlow, additionalPercent]);

  const canContinue =
    calculatedFlow !== null &&
    calculatedFlow.daily > 0 &&
    calculatedFlow.averageLs > 0;

  function handleContinue() {
    if (!canContinue || !calculatedFlow) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("object", objectType);
    params.set("mode", calculationMode);
    params.set("flow", calculatedFlow.daily.toFixed(3));
    params.set("qAverageHour", calculatedFlow.averageHourly.toFixed(3));
    params.set("qAverageLs", calculatedFlow.averageLs.toFixed(4));

    if (calculatedFlow.maxLs !== null) {
      params.set("qMaxLs", calculatedFlow.maxLs.toFixed(4));
      params.set("qMaxHour", calculatedFlow.maxHourly!.toFixed(3));
    } else {
      params.delete("qMaxLs");
      params.delete("qMaxHour");
    }

    if (calculatedFlow.minLs !== null) {
      params.set("qMinLs", calculatedFlow.minLs.toFixed(4));
      params.set("qMinHour", calculatedFlow.minHourly!.toFixed(3));
    } else {
      params.delete("qMinLs");
      params.delete("qMinHour");
    }

    if (calculatedFlow.kMax !== null) {
      params.set("kMax", calculatedFlow.kMax.toFixed(4));
    } else {
      params.delete("kMax");
    }

    if (calculatedFlow.kMin !== null) {
      params.set("kMin", calculatedFlow.kMin.toFixed(4));
    } else {
      params.delete("kMin");
    }

    params.set("year", normativeYear);
    params.set("additionalPercent", String(calculatedFlow.additionalPercent));

    if (people) params.set("people", people);
    else params.delete("people");

    if (specificFlow !== null) params.set("specificFlow", String(specificFlow));
    else params.delete("specificFlow");

    if (workingHours) params.set("hours", workingHours);

    params.delete("bod");
    params.delete("cod");
    params.delete("tss");
    params.delete("nitrogen");
    params.delete("phosphorus");
    params.delete("technology");
    params.delete("effluentQuality");
    params.delete("nitrogenRemoval");
    params.delete("phosphorusRemoval");
    params.delete("spaceLimit");
    params.delete("projectType");

    router.push(`/engineering/analysis/load?${params.toString()}`);
  }

  function handleBack() {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/engineering/analysis?${params.toString()}`);
  }

  return (
    <main className={styles.page}>
      <section className={styles.formSection}>
        <div className={styles.containerSmall}>
          <SuvsanoatBrandHeader />
          <button
            type="button"
            onClick={handleBack}
            className={styles.backLink}
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ← Назад
          </button>

          <div className={styles.formHeader}>
            <div className={styles.sectionLabel}>
              ШАГ 02 / РАСЧЁТНЫЕ РАСХОДЫ
            </div>

            <div
              style={{
                marginTop: 12,
                marginBottom: 30,
                color: "rgba(255,255,255,.55)",
              }}
            >
              Объект:{" "}
              <strong style={{ color: "#22d3ee" }}>
                {objectType}
              </strong>
            </div>

            <h1>
              Определим
              <br />
              расчётный расход
            </h1>

            <p>
              Система использует нормативные данные КМК 2.04.03-19 для
              расчёта коэффициентов неравномерности и передаёт
              рассчитанные значения на следующий этап инженерного анализа.
            </p>
          </div>

          <div className={styles.formCard}>
            <label className={styles.label}>МЕТОД ОПРЕДЕЛЕНИЯ РАСХОДА</label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 30,
              }}
            >
              <button
                type="button"
                onClick={() => setCalculationMode("known")}
                style={{
                  padding: 18,
                  borderRadius: 8,
                  border:
                    calculationMode === "known"
                      ? "1px solid #22d3ee"
                      : "1px solid rgba(255,255,255,.12)",
                  background:
                    calculationMode === "known"
                      ? "rgba(34,211,238,.08)"
                      : "rgba(255,255,255,.02)",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <strong>Известный расход</strong>
                <div
                  style={{
                    marginTop: 7,
                    color: "rgba(255,255,255,.5)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  У меня уже есть среднесуточный расход.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCalculationMode("population")}
                style={{
                  padding: 18,
                  borderRadius: 8,
                  border:
                    calculationMode === "population"
                      ? "1px solid #22d3ee"
                      : "1px solid rgba(255,255,255,.12)",
                  background:
                    calculationMode === "population"
                      ? "rgba(34,211,238,.08)"
                      : "rgba(255,255,255,.02)",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <strong>По населению</strong>
                <div
                  style={{
                    marginTop: 7,
                    color: "rgba(255,255,255,.5)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Определить расход по нормативному удельному водоотведению.
                </div>
              </button>
            </div>

            {calculationMode === "known" && (
              <>
                <label htmlFor="flow" className={styles.label}>
                  Среднесуточный расход, м³/сутки
                </label>

                <input
                  id="flow"
                  type="number"
                  min="0"
                  step="0.1"
                  value={flow}
                  onChange={(event) => setFlow(event.target.value)}
                  placeholder="Например: 500"
                  className={styles.textarea}
                  style={{ minHeight: 90, resize: "none" }}
                />
              </>
            )}

            {calculationMode === "population" && (
              <>
                <label htmlFor="people" className={styles.label}>
                  Расчётное количество жителей / человек
                </label>

                <input
                  id="people"
                  type="number"
                  min="1"
                  step="1"
                  value={people}
                  onChange={(event) => setPeople(event.target.value)}
                  placeholder="Например: 17500"
                  className={styles.textarea}
                  style={{ minHeight: 90, resize: "none" }}
                />

                <label
                  htmlFor="year"
                  className={styles.label}
                  style={{ marginTop: 28 }}
                >
                  Нормативный год
                </label>

                <select
                  id="year"
                  value={normativeYear}
                  onChange={(event) =>
                    setNormativeYear(event.target.value as "2020" | "2035")
                  }
                  className={styles.textarea}
                  style={{ minHeight: 70 }}
                >
                  <option value="2035">2035</option>
                  <option value="2020">2020</option>
                </select>

                <label
                  htmlFor="populationCategory"
                  className={styles.label}
                  style={{ marginTop: 28 }}
                >
                  Категория населённого пункта
                </label>

                <select
                  id="populationCategory"
                  value={populationCategory}
                  onChange={(event) =>
                    setPopulationCategory(
                      event.target.value as PopulationCategory,
                    )
                  }
                  className={styles.textarea}
                  style={{ minHeight: 90 }}
                >
                  <option value="over100-central">
                    Более 100 тыс. жителей — централизованная система
                  </option>
                  <option value="under100-central">
                    До 100 тыс. — централизованная система
                  </option>
                  <option value="under50-no-central">
                    До 50 тыс. — без централизованной канализации
                  </option>
                  <option value="under50-central">
                    До 50 тыс. — централизованная канализация
                  </option>
                </select>

                {specificFlow === null && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 16,
                      borderRadius: 8,
                      border: "1px solid rgba(255,180,80,.25)",
                      background: "rgba(255,180,80,.05)",
                      color: "rgba(255,255,255,.65)",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    Для выбранной комбинации категории и нормативного года в
                    таблице 3 КМК нет значения. Выберите соответствующий
                    нормативный год.
                  </div>
                )}

                {specificFlow !== null && (
                  <div
                    style={{
                      marginTop: 14,
                      color: "rgba(255,255,255,.5)",
                      fontSize: 13,
                    }}
                  >
                    Удельный расход, используемый как исходное значение:{" "}
                    <strong style={{ color: "#22d3ee" }}>
                      {specificFlow}
                    </strong>{" "}
                    л/чел·сут
                  </div>
                )}
              </>
            )}

            <label
              htmlFor="additional"
              className={styles.label}
              style={{ marginTop: 28 }}
            >
              Дополнительный неучтённый расход, %
            </label>

            <select
              id="additional"
              value={additionalPercent}
              onChange={(event) => setAdditionalPercent(event.target.value)}
              className={styles.textarea}
              style={{ minHeight: 70 }}
            >
              <option value="0">0% — не добавлять</option>
              <option value="5">5% — дополнительный расход</option>
              <option value="10">
                10% — при отсутствии эксплуатационных данных
              </option>
              <option value="15">
                15% — при отсутствии эксплуатационных данных
              </option>
            </select>

            <p
              style={{
                marginTop: 10,
                color: "rgba(255,255,255,.4)",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Применяется только при наличии соответствующего основания в
              исходных данных проекта.
            </p>

            <label
              htmlFor="hours"
              className={styles.label}
              style={{ marginTop: 28 }}
            >
              Продолжительность работы объекта, часов/сутки
            </label>

            <input
              id="hours"
              type="number"
              min="1"
              max="24"
              step="1"
              value={workingHours}
              onChange={(event) => setWorkingHours(event.target.value)}
              className={styles.textarea}
              style={{ minHeight: 70, resize: "none" }}
            />

            {calculatedFlow && (
              <div
                style={{
                  marginTop: 34,
                  padding: 24,
                  border: "1px solid rgba(34,211,238,.2)",
                  background: "rgba(34,211,238,.04)",
                  borderRadius: 10,
                }}
              >
                <div className={styles.sectionLabel}>
                  {calculatedFlow.averageLs < 5
                    ? "РАСЧЁТ МАЛОГО РАСХОДА — КМК 2.04.01-98"
                    : "РАСЧЁТ ПО КМК 2.04.03-19"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 20,
                    marginTop: 22,
                  }}
                >
                  <div>
                    <div className={styles.cardNumber}>Qсут</div>
                    <strong>{calculatedFlow.daily.toFixed(2)} м³/сут</strong>
                  </div>

                  <div>
                    <div className={styles.cardNumber}>Qср</div>
                    <strong>
                      {calculatedFlow.averageLs.toFixed(2)} л/с
                    </strong>
                  </div>

                  <div>
                    <div className={styles.cardNumber}>Kgen.max</div>
                    <strong>
                      {calculatedFlow.kMax !== null
                        ? calculatedFlow.kMax.toFixed(3)
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <div className={styles.cardNumber}>Qmax</div>
                    <strong>
                      {calculatedFlow.maxHourly !== null
                        ? calculatedFlow.maxHourly.toFixed(2)
                        : "—"}{" "}
                      м³/ч
                    </strong>
                  </div>

                  <div>
                    <div className={styles.cardNumber}>Kgen.min</div>
                    <strong>
                      {calculatedFlow.kMin !== null
                        ? calculatedFlow.kMin.toFixed(3)
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <div className={styles.cardNumber}>Qmin</div>
                    <strong>
                      {calculatedFlow.minHourly !== null
                        ? calculatedFlow.minHourly.toFixed(2)
                        : "—"}{" "}
                      м³/ч
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,.08)",
                    color: "rgba(255,255,255,.55)",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {calculatedFlow.kStatus === "interpolated" && (
                    <>
                      <strong style={{ color: "#22d3ee" }}>
                        Коэффициенты интерполированы.
                      </strong>{" "}
                      Средний расход находится между табличными значениями
                      КМК 2.04.03-19.
                    </>
                  )}

                  {calculatedFlow.kStatus === "table" && (
                    <>
                      <strong style={{ color: "#22d3ee" }}>
                        Табличное значение.
                      </strong>{" "}
                      Коэффициенты приняты непосредственно из таблицы 2.
                    </>
                  )}

                  {calculatedFlow.kStatus === "below-minimum" && (
                    <>
                      <strong style={{ color: "#22d3ee" }}>
                        Применён КМК 2.04.01-98.
                      </strong>{" "}
                      Средний расход менее 5 л/с. Для окончательного
                      определения максимального секундного расхода необходимо
                      учитывать санитарно-технические приборы, вероятность их
                      действия и исходные параметры объекта.
                    </>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 24,
                    padding: 20,
                    borderRadius: 8,
                    border: "1px solid rgba(34,211,238,.16)",
                    background: "rgba(0,0,0,.14)",
                  }}
                >
                  <div
                    style={{
                      color: "#22d3ee",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      marginBottom: 10,
                    }}
                  >
                    НОРМАТИВНОЕ ОБОСНОВАНИЕ
                  </div>

                  <div
                    style={{
                      color: "#f5f8fa",
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    {calculatedFlow.normativeBasis.document}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: "rgba(255,255,255,.55)",
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    {calculatedFlow.normativeBasis.section}
                    {" · "}
                    {"clause" in calculatedFlow.normativeBasis &&
                    calculatedFlow.normativeBasis.clause
                      ? `п. ${calculatedFlow.normativeBasis.clause}`
                      : "пп. 3.1–3.5, 3.8–3.12"}
                    {" · "}
                    {"table" in calculatedFlow.normativeBasis &&
                    calculatedFlow.normativeBasis.table
                      ? calculatedFlow.normativeBasis.table
                      : "Обязательное приложение 3"}
                  </div>

                  {calculatedFlow.kStatus === "interpolated" &&
                    calculatedFlow.kLower &&
                    calculatedFlow.kUpper && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop:
                            "1px solid rgba(255,255,255,.08)",
                          color: "rgba(255,255,255,.62)",
                          fontSize: 12,
                          lineHeight: 1.8,
                        }}
                      >
                        <strong style={{ color: "#22d3ee" }}>
                          Метод определения: линейная интерполяция
                        </strong>
                        <br />
                        Qср ={" "}
                        {calculatedFlow.averageLs.toFixed(3)} л/с
                        <br />
                        Нижняя табличная точка:{" "}
                        {calculatedFlow.kLower.averageLps} л/с →
                        Kmax {calculatedFlow.kLower.kMax} / Kmin{" "}
                        {calculatedFlow.kLower.kMin}
                        <br />
                        Верхняя табличная точка:{" "}
                        {calculatedFlow.kUpper.averageLps} л/с →
                        Kmax {calculatedFlow.kUpper.kMax} / Kmin{" "}
                        {calculatedFlow.kUpper.kMin}
                      </div>
                    )}

                  {calculatedFlow.kStatus === "table" &&
                    calculatedFlow.kLower && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop:
                            "1px solid rgba(255,255,255,.08)",
                          color: "rgba(255,255,255,.62)",
                          fontSize: 12,
                          lineHeight: 1.8,
                        }}
                      >
                        <strong style={{ color: "#22d3ee" }}>
                          Метод определения: табличное значение
                        </strong>
                        <br />
                        Qср ={" "}
                        {calculatedFlow.averageLs.toFixed(3)} л/с
                        <br />
                        Kgen.max = {calculatedFlow.kLower.kMax}
                        <br />
                        Kgen.min = {calculatedFlow.kLower.kMin}
                      </div>
                    )}

                  {calculatedFlow.kStatus === "below-minimum" &&
                    calculatedFlow.smallFlow && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop:
                            "1px solid rgba(255,255,255,.08)",
                          color: "rgba(255,255,255,.62)",
                          fontSize: 12,
                          lineHeight: 1.8,
                        }}
                      >
                        <strong style={{ color: "#22d3ee" }}>
                          Методика малого расхода
                        </strong>
                        <br />
                        Qср = {calculatedFlow.smallFlow.averageLs.toFixed(3)} л/с
                        <br />
                        Средний часовой расход ={" "}
                        {calculatedFlow.smallFlow.averageHourly.toFixed(3)} м³/ч
                        <br />
                        Нормативное основание: КМК 2.04.01-98,
                        раздел 3, обязательное приложение 3.
                        <br />
                        <span style={{ color: "#ffb454" }}>
                          Qmax и Qmin не выдаются автоматически только по Qсут:
                          для их окончательного определения нужны данные о
                          санитарно-технических приборах и вероятности их действия.
                        </span>
                      </div>
                    )}

                  {calculatedFlow.kStatus === "below-minimum" && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop:
                          "1px solid rgba(255,255,255,.08)",
                        color: "#ffb454",
                        fontSize: 12,
                        lineHeight: 1.7,
                      }}
                    >
                      Qср менее{" "}
                      {KMK_2_04_03_19.applicability
                        .minimumAverageLpsForCurrentTable}{" "}
                      л/с. Таблица 2 текущего модуля автоматически
                      не применяется. Требуется отдельная нормативная
                      проверка по применимому документу.
                    </div>
                  )}
                </div>

                {calculationMode === "population" &&
                  specificFlow !== null && (
                    <div
                      style={{
                        marginTop: 14,
                        color: "rgba(255,255,255,.38)",
                        fontSize: 11,
                        lineHeight: 1.7,
                      }}
                    >
                      Удельный расход {specificFlow} л/чел·сут
                      в текущем модуле является исходным значением
                      расчёта по населению. Его нормативное основание
                      будет подключено отдельным модулем после проверки
                      применимого документа. Поэтому этот показатель
                      не маркируется как подтверждённое значение
                      КМК 2.04.03-19.
                    </div>
                  )}
              </div>
            )}

            <div className={styles.formFooter}>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue}
                className={styles.primaryButton}
                style={{
                  opacity: !canContinue ? 0.45 : 1,
                  cursor: !canContinue ? "not-allowed" : "pointer",
                }}
              >
                Продолжить
                <span>→</span>
              </button>

              <span className={styles.formHint}>
                Следующий этап — нагрузка загрязнений
              </span>
            </div>
          </div>

          <p className={styles.disclaimer}>
            При среднем расходе 5 л/с и более модуль использует таблицу 2
            КМК 2.04.03-19 и интерполяцию между табличными значениями.
            При среднем расходе менее 5 л/с применяется методика КМК
            2.04.01-98; окончательные Qmax/Qmin требуют данных о санитарно-
            технических приборах и вероятности их действия. Окончательные
            проектные значения определяются на основании полного состава
            исходных данных и инженерной проверки.
          </p>

          <SuvsanoatBrandFooter />
        </div>
      </section>
    </main>
  );
}

export default function FlowPage() {
  return (
    <Suspense fallback={null}>
      <FlowContent />
    </Suspense>
  );
}
