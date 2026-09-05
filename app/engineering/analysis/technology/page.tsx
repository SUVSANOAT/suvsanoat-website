"use client";

import React, {
  CSSProperties,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Technology = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
};

type Recommendation = {
  technology: Technology;
  score: number;
  reasons: string[];
  warnings: string[];
};

const TECHNOLOGIES: Technology[] = [
  {
    id: "ANBR",
    title: "ANBR",
    subtitle: "Анаэробная биоплёнка",
    description:
      "Анаэробный биореактор с прикреплённой биомассой. Подходит для органически нагруженных сточных вод.",
    category: "АНАЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "UASB",
    title: "UASB",
    subtitle: "Анаэробный восходящий поток",
    description:
      "Анаэробный реактор с восходящим потоком и гранулированной биомассой.",
    category: "АНАЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "ABR",
    title: "ABR",
    subtitle: "Анаэробный перегородочный реактор",
    description:
      "Последовательный анаэробный реактор с несколькими перегородочными камерами.",
    category: "АНАЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "AnMBR",
    title: "AnMBR",
    subtitle: "Анаэробный реактор + мембраны",
    description:
      "Анаэробная биологическая очистка с последующим мембранным разделением.",
    category: "АНАЭРОБНАЯ / МЕМБРАННАЯ",
  },
  {
    id: "IFAS",
    title: "IFAS",
    subtitle: "Гибридная биомасса",
    description:
      "Комбинация активного ила и прикреплённой биомассы для повышения эффективности биологической очистки.",
    category: "АЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "AS",
    title: "Активный ил",
    subtitle: "Классический аэротенк",
    description:
      "Классическая технология биологической очистки с активным илом и последующим разделением ила.",
    category: "АЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "MBBR",
    title: "MBBR",
    subtitle: "Подвижная биоплёнка",
    description:
      "Биореактор с подвижной загрузкой, на которой развивается прикреплённая биомасса.",
    category: "АЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "SBR",
    title: "SBR",
    subtitle: "Циклический биореактор",
    description:
      "Последовательный биологический реактор с циклическим режимом наполнения, аэрации, отстаивания и выпуска.",
    category: "АЭРОБНАЯ ОЧИСТКА",
  },
  {
    id: "MBR",
    title: "MBR",
    subtitle: "Биореактор + мембраны",
    description:
      "Мембранный биореактор, объединяющий биологическую очистку и мембранное разделение.",
    category: "МЕМБРАННАЯ ОЧИСТКА",
  },
  {
    id: "ANBR_MBR",
    title: "ANBR + MBR",
    subtitle: "Анаэробная ступень + мембранный биореактор",
    description:
      "Комбинированная схема для органически нагруженных сточных вод с последующей глубокой биологической и мембранной очисткой.",
    category: "КОМБИНИРОВАННАЯ СХЕМА",
  },
  {
    id: "SBR_MBR",
    title: "SBR + MBR",
    subtitle: "SBR + мембранное разделение",
    description:
      "Комбинация циклической биологической очистки и мембранного разделения для компактной схемы с высоким качеством эффлюента.",
    category: "КОМБИНИРОВАННАЯ СХЕМА",
  },
  {
    id: "MBBR_MBR",
    title: "MBBR + MBR",
    subtitle: "Подвижная загрузка + мембраны",
    description:
      "Интенсивная аэробная биологическая ступень с последующим мембранным разделением.",
    category: "КОМБИНИРОВАННАЯ СХЕМА",
  },
];

export default function TechnologyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TechnologyContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ИНЖЕНЕРНЫЙ РАСЧЁТ</div>

        <h1 style={title}>
          Загрузка
          <br />
          технологий...
        </h1>
      </div>
    </main>
  );
}


function SuvsanoatBrandHeader() {
  return (
    <header
      style={{
        border: "1px solid #174454",
        background: "#071b24",
        borderRadius: 14,
        padding: "18px 24px",
        marginBottom: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <img
        src="/suvsanoat-logo.png"
        alt="SUVSANOAT ENGINEERING SYSTEMS"
        style={{
          display: "block",
          width: "auto",
          height: 62,
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 18,
          flexWrap: "wrap",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#00d9ff",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          www.suvsanoat.uz
        </a>

        <a
          href="tel:+998773043400"
          style={{
            color: "#b7cbd3",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          +998 77 304 34 00
        </a>

        <a
          href="mailto:suvsanoat@gmail.com"
          style={{
            color: "#b7cbd3",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
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
        marginTop: 56,
        paddingTop: 22,
        borderTop: "1px solid #173640",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        color: "#66808b",
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <div>
        <strong style={{ color: "#b7cbd3" }}>
          SUVSANOAT ENGINEERING SYSTEMS
        </strong>
        <div>
          Предварительный инженерный подбор технологии очистки.
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#00d9ff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          www.suvsanoat.uz
        </a>
        <div>+998 77 304 34 00 · suvsanoat@gmail.com</div>
      </div>
    </footer>
  );
}

function TechnologyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "";
  const flow = searchParams.get("flow") || "";
  const people = searchParams.get("people") || "";
  const hours = searchParams.get("hours") || "24";

  const bod = searchParams.get("bod") || "";
  const cod = searchParams.get("cod") || "";
  const tss = searchParams.get("tss") || "";
  const nitrogen = searchParams.get("nitrogen") || "";
  const phosphorus = searchParams.get("phosphorus") || "";

  const initialTechnology =
    searchParams.get("technology") || "";

  const [selectedTechnology, setSelectedTechnology] =
    useState(initialTechnology);

  /*
   * =========================================================
   * ПАРАМЕТРЫ АВТОМАТИЧЕСКОГО ПОДБОРА
   * =========================================================
   */

  const [effluentQuality, setEffluentQuality] =
    useState(
      searchParams.get("effluentQuality") || "standard"
    );

  const [nitrogenRemoval, setNitrogenRemoval] =
    useState(
      searchParams.get("nitrogenRemoval") || "no"
    );

  const [phosphorusRemoval, setPhosphorusRemoval] =
    useState(
      searchParams.get("phosphorusRemoval") || "no"
    );

  const [spaceLimit, setSpaceLimit] =
    useState(
      searchParams.get("spaceLimit") || "normal"
    );

  const [projectType, setProjectType] =
    useState(
      searchParams.get("projectType") || "new"
    );

  const [showRecommendations, setShowRecommendations] =
    useState(false);

  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!showRecommendations) {
      return;
    }

    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showRecommendations]);

  /*
   * =========================================================
   * ЧИСЛОВЫЕ ДАННЫЕ
   * =========================================================
   */

  const q = Number(flow) || 0;
  const bodValue = Number(bod) || 0;
  const codValue = Number(cod) || 0;
  const tssValue = Number(tss) || 0;
  const nitrogenValue = Number(nitrogen) || 0;
  const phosphorusValue = Number(phosphorus) || 0;

  /*
   * =========================================================
   * АВТОМАТИЧЕСКИЙ ПОДБОР
   *
   * ВАЖНО:
   * Это предварительный алгоритм ранжирования.
   * Он не заменяет инженерный расчёт.
   * =========================================================
   */

  const recommendations = useMemo(() => {
    const values = {
      q,
      bod: bodValue,
      cod: codValue,
      tss: tssValue,
      nitrogen: nitrogenValue,
      phosphorus: phosphorusValue,
      effluentQuality,
      nitrogenRemoval,
      phosphorusRemoval,
      spaceLimit,
      projectType,
    };

    return TECHNOLOGIES.map((technology) =>
      calculateRecommendation(technology, values)
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [
    q,
    bodValue,
    codValue,
    tssValue,
    nitrogenValue,
    phosphorusValue,
    effluentQuality,
    nitrogenRemoval,
    phosphorusRemoval,
    spaceLimit,
    projectType,
  ]);

  const topRecommendation = recommendations[0];

  /*
   * =========================================================
   * СОХРАНЕНИЕ ПАРАМЕТРОВ
   * =========================================================
   */

  function buildParams(technology?: string) {
    const query = new URLSearchParams(
      searchParams.toString()
    );

    if (technology) {
      query.set("technology", technology);
    } else {
      query.delete("technology");
    }

    query.set("effluentQuality", effluentQuality);
    query.set("nitrogenRemoval", nitrogenRemoval);
    query.set(
      "phosphorusRemoval",
      phosphorusRemoval
    );
    query.set("spaceLimit", spaceLimit);
    query.set("projectType", projectType);

    return query;
  }

  /*
   * =========================================================
   * ВЫБОР ТЕХНОЛОГИИ
   * =========================================================
   */

  function selectTechnology(technology: string) {
    setSelectedTechnology(technology);
  }

  /*
   * =========================================================
   * АВТОМАТИЧЕСКАЯ РЕКОМЕНДАЦИЯ
   * =========================================================
   */

  function useRecommendation() {
    if (!topRecommendation) {
      return;
    }

    setSelectedTechnology(
      topRecommendation.technology.id
    );

    setShowRecommendations(true);
  }

  /*
   * =========================================================
   * ДАЛЬШЕ → EQUIPMENT
   * =========================================================
   */

  function goNext() {
    if (!selectedTechnology) {
      return;
    }

    const query = buildParams(
      selectedTechnology
    );

    router.push(
      `/engineering/analysis/equipment?${query.toString()}`
    );
  }

  /*
   * =========================================================
   * НАЗАД → LOAD
   * =========================================================
   */

  function goBack() {
    const query = buildParams();

    router.push(
      `/engineering/analysis/load?${query.toString()}`
    );
  }

  const selected = useMemo(() => {
    return TECHNOLOGIES.find(
      (item) => item.id === selectedTechnology
    );
  }, [selectedTechnology]);

  return (
    <main style={page}>
      <div style={container}>

        <SuvsanoatBrandHeader />

        {/* BACK */}

        <button
          type="button"
          onClick={goBack}
          style={backButton}
        >
          ← Назад
        </button>

        {/* HEADER */}

        <div style={eyebrow}>
          ШАГ 04 / ВЫБОР ТЕХНОЛОГИИ
        </div>

        <h1 style={title}>
          Подбор
          <br />
          технологии
        </h1>

        <p style={lead}>
          Если вы не знаете, какую технологию выбрать,
          система может выполнить предварительный
          инженерный подбор на основании расхода,
          состава сточных вод, требований к очищенной
          воде и ограничений объекта.
        </p>

        {/* OBJECT INFO */}

        <section style={infoCard}>

          <InfoItem
            label="ОБЪЕКТ"
            value={object || "Не указан"}
          />

          <InfoItem
            label="РАСХОД"
            value={
              flow
                ? `${flow} м³/сут`
                : "Не указан"
            }
          />

          <InfoItem
            label="ЛЮДИ"
            value={people || "—"}
          />

          <InfoItem
            label="РЕЖИМ"
            value={`${hours} ч/сут`}
          />

        </section>

        {/* INPUT DATA */}

        <section style={dataCard}>

          <div style={sectionTitle}>
            ИСХОДНЫЕ ДАННЫЕ
          </div>

          <div style={dataGrid}>

            <DataItem
              label="BOD"
              value={bod}
              unit="мг/л"
            />

            <DataItem
              label="COD"
              value={cod}
              unit="мг/л"
            />

            <DataItem
              label="TSS"
              value={tss}
              unit="мг/л"
            />

            <DataItem
              label="АЗОТ N"
              value={nitrogen}
              unit="мг/л"
            />

            <DataItem
              label="ФОСФОР P"
              value={phosphorus}
              unit="мг/л"
            />

          </div>

        </section>

        {/* AUTO SELECTION */}

        <section style={recommendationBox}>

          <div style={sectionTitle}>
            НЕ ЗНАЕТЕ, КАКУЮ ТЕХНОЛОГИЮ ВЫБРАТЬ?
          </div>

          <h2 style={recommendationTitle}>
            Подобрать технологию автоматически
          </h2>

          <p style={recommendationText}>
            Ответьте на несколько вопросов. Система
            сравнит доступные технологии и покажет
            наиболее подходящие варианты с объяснением
            причин.
          </p>

          <div style={formGrid}>

            <div style={field}>

              <label style={fieldLabel}>
                ТРЕБОВАНИЯ К ОЧИЩЕННОЙ ВОДЕ
              </label>

              <select
                value={effluentQuality}
                onChange={(event) =>
                  setEffluentQuality(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="standard">
                  Стандартные требования
                </option>

                <option value="high">
                  Повышенные требования
                </option>

                <option value="very-high">
                  Очень высокое качество
                </option>
              </select>

            </div>

            <div style={field}>

              <label style={fieldLabel}>
                УДАЛЕНИЕ АЗОТА
              </label>

              <select
                value={nitrogenRemoval}
                onChange={(event) =>
                  setNitrogenRemoval(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="no">
                  Не требуется
                </option>

                <option value="partial">
                  Требуется частичное удаление
                </option>

                <option value="high">
                  Требуется глубокое удаление
                </option>
              </select>

            </div>

            <div style={field}>

              <label style={fieldLabel}>
                УДАЛЕНИЕ ФОСФОРА
              </label>

              <select
                value={phosphorusRemoval}
                onChange={(event) =>
                  setPhosphorusRemoval(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="no">
                  Не требуется
                </option>

                <option value="yes">
                  Требуется
                </option>

                <option value="high">
                  Требуется глубокое удаление
                </option>
              </select>

            </div>

            <div style={field}>

              <label style={fieldLabel}>
                ОГРАНИЧЕНИЕ ПО ПЛОЩАДИ
              </label>

              <select
                value={spaceLimit}
                onChange={(event) =>
                  setSpaceLimit(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="normal">
                  Ограничений нет
                </option>

                <option value="limited">
                  Площадь ограничена
                </option>

                <option value="very-limited">
                  Площадь сильно ограничена
                </option>
              </select>

            </div>

            <div style={field}>

              <label style={fieldLabel}>
                ТИП ПРОЕКТА
              </label>

              <select
                value={projectType}
                onChange={(event) =>
                  setProjectType(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="new">
                  Новое строительство
                </option>

                <option value="reconstruction">
                  Реконструкция
                </option>
              </select>

            </div>

          </div>

          <button
            type="button"
            onClick={useRecommendation}
            style={recommendationButton}
          >
            Подобрать технологию
            <span style={arrow}>→</span>
          </button>

        </section>

        {/* RECOMMENDATIONS */}

        {showRecommendations &&
          topRecommendation && (
            <section
              ref={resultRef}
              style={resultBox}
            >

              <div style={sectionTitle}>
                РЕЗУЛЬТАТ ПРЕДВАРИТЕЛЬНОГО ПОДБОРА
              </div>

              <div style={topResult}>

                <div>

                  <div style={resultSmallLabel}>
                    РЕКОМЕНДУЕМАЯ ТЕХНОЛОГИЯ
                  </div>

                  <div style={resultTechnology}>
                    {topRecommendation.technology.title}
                  </div>

                  <div style={resultSubtitle}>
                    {
                      topRecommendation
                        .technology
                        .subtitle
                    }
                  </div>

                </div>

                <div style={scoreBlock}>

                  <div style={scoreNumber}>
                    {topRecommendation.score}
                  </div>

                  <div style={scoreLabel}>
                    БАЛЛОВ
                  </div>

                </div>

              </div>

              <div style={whyTitle}>
                Почему система рекомендует
                {` ${topRecommendation.technology.title}`}
              </div>

              <div style={reasonList}>

                {topRecommendation.reasons.map(
                  (reason, index) => (
                    <div
                      key={`${reason}-${index}`}
                      style={reasonItem}
                    >
                      <span style={reasonMark}>
                        ✓
                      </span>

                      <span>
                        {reason}
                      </span>
                    </div>
                  )
                )}

              </div>

              {topRecommendation.warnings.length >
                0 && (
                <div style={warningBox}>

                  <div style={warningTitle}>
                    ЧТО НУЖНО ПРОВЕРИТЬ
                  </div>

                  {topRecommendation.warnings.map(
                    (warning, index) => (
                      <div
                        key={`${warning}-${index}`}
                        style={warningItem}
                      >
                        • {warning}
                      </div>
                    )
                  )}

                </div>
              )}

              <div style={alternativeTitle}>
                АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ
              </div>

              <div style={alternativeGrid}>

                {recommendations
                  .slice(1, 4)
                  .map((item) => (
                    <button
                      key={item.technology.id}
                      type="button"
                      onClick={() =>
                        selectTechnology(
                          item.technology.id
                        )
                      }
                      style={alternativeCard}
                    >
                      <div style={alternativeScore}>
                        {item.score}
                      </div>

                      <div
                        style={
                          alternativeTechnology
                        }
                      >
                        {item.technology.title}
                      </div>

                      <div
                        style={
                          alternativeSubtitle
                        }
                      >
                        {item.technology.subtitle}
                      </div>

                      <div
                        style={
                          alternativeAction
                        }
                      >
                        Выбрать →
                      </div>
                    </button>
                  ))}

              </div>

            </section>
          )}

        {/* MANUAL SELECTION */}

        <section>

          <div style={sectionTitle}>
            ИЛИ ВЫБЕРИТЕ ТЕХНОЛОГИЮ ВРУЧНУЮ
          </div>

          <p style={manualHint}>
            Если вы уже определились с технологической
            схемой, выберите её ниже. Система сохранит
            все введённые исходные данные.
          </p>

          <div style={technologyGrid}>

            {TECHNOLOGIES.map((technology) => {

              const isSelected =
                selectedTechnology ===
                technology.id;

              return (
                <button
                  key={technology.id}
                  type="button"
                  onClick={() =>
                    selectTechnology(
                      technology.id
                    )
                  }
                  style={{
                    ...technologyCard,

                    ...(isSelected
                      ? technologyCardSelected
                      : {}),
                  }}
                >

                  <div
                    style={
                      technologyCategory
                    }
                  >
                    {technology.category}
                  </div>

                  <div
                    style={
                      technologyTitle
                    }
                  >
                    {technology.title}
                  </div>

                  <div
                    style={
                      technologySubtitle
                    }
                  >
                    {technology.subtitle}
                  </div>

                  <p
                    style={
                      technologyDescription
                    }
                  >
                    {technology.description}
                  </p>

                  <div
                    style={
                      technologyFooter
                    }
                  >
                    <span>
                      {isSelected
                        ? "✓ Выбрано"
                        : "Выбрать"}
                    </span>

                    <span>→</span>
                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* SELECTED */}

        {selected && (
          <section style={selectedCard}>

            <div style={selectedLabel}>
              ВЫБРАННАЯ ТЕХНОЛОГИЯ
            </div>

            <div style={selectedTitle}>
              {selected.title}
            </div>

            <div style={selectedSubtitle}>
              {selected.subtitle}
            </div>

            <p style={selectedDescription}>
              {selected.description}
            </p>

          </section>
        )}

        {/* ACTIONS */}

        <div style={actions}>

          <button
            type="button"
            onClick={goBack}
            style={secondaryButton}
          >
            ← Назад
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!selectedTechnology}
            style={{
              ...primaryButton,

              opacity:
                selectedTechnology
                  ? 1
                  : 0.4,

              cursor:
                selectedTechnology
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Перейти к оборудованию

            <span style={arrow}>
              →
            </span>
          </button>

        </div>

        <p style={disclaimer}>
          Автоматический подбор является
          предварительным инженерным ранжированием.
          Он не заменяет технологический расчёт,
          проверку нормативных требований,
          лабораторных данных и технико-экономическое
          сравнение вариантов. Окончательное решение
          принимается после инженерной проверки.
          Выбор технологии ҚМҚ 2.04.03-19 не регламентирует
          (п. 6.10 задаёт только расчётные эффекты ступеней:
          механическая — 40–45 % взвешенных и 20 % БПК;
          биологическая — до 20 мг/л взвешенных и 15–25 мг/л БПКполн;
          доочистка — 3–6 / 4–6 мг/л). Параметры MBBR, SBR, MBR, IFAS
          и анаэробных реакторов (ANBR, UASB, ABR, AnMBR) не нормируются
          ҚМҚ 2.04.03-19; они приняты по DWA/практике. Условия входа
          в биологическую очистку — п. 6.2 (pH 6,5–8,5; 6–30 °C;
          БПКполн ≤ 250–500 мг/л; N ≥ 5 и P ≥ 1 мг/л на 100 мг/л БПКполн).
        </p>

        <SuvsanoatBrandFooter />

      </div>
    </main>
  );
}

/*
 * =========================================================
 * АЛГОРИТМ ПРЕДВАРИТЕЛЬНОГО ПОДБОРА
 * =========================================================
 */

function calculateRecommendation(
  technology: Technology,
  values: {
    q: number;
    bod: number;
    cod: number;
    tss: number;
    nitrogen: number;
    phosphorus: number;
    effluentQuality: string;
    nitrogenRemoval: string;
    phosphorusRemoval: string;
    spaceLimit: string;
    projectType: string;
  }
): Recommendation {
  let score = 50;

  const reasons: string[] = [];
  const warnings: string[] = [];

  const {
    q,
    bod,
    cod,
    tss,
    nitrogen,
    phosphorus,
    effluentQuality,
    nitrogenRemoval,
    phosphorusRemoval,
    spaceLimit,
    projectType,
  } = values;

  /*
   * ---------------------------------------------------------
   * БАЗОВАЯ ИНЖЕНЕРНАЯ ПРИГОДНОСТЬ
   *
   * Это не нормативный расчёт и не окончательный выбор.
   * Базовый балл только предотвращает ситуацию, когда
   * все технологии начинают с одинаковых 50 баллов.
   * ---------------------------------------------------------
   */

  const isLowStrength =
    bod > 0 && bod < 300 && cod > 0 && cod < 600;

  const isHighOrganicLoad =
    bod >= 300 || cod >= 800;

  const needsHighEffluent =
    effluentQuality === "high" ||
    effluentQuality === "very-high";

  const needsN =
    nitrogenRemoval === "partial" ||
    nitrogenRemoval === "high";

  const needsP =
    phosphorusRemoval === "yes" ||
    phosphorusRemoval === "high";

  if (
    technology.id === "AS" &&
    isLowStrength &&
    effluentQuality === "standard"
  ) {
    score += 12;
    reasons.push(
      "Для хозяйственно-бытовых сточных вод умеренной концентрации классическая аэробная схема является базовым вариантом сравнения."
    );
  }

  if (
    technology.id === "SBR" &&
    q > 0 &&
    effluentQuality !== "very-high"
  ) {
    score += 8;
    reasons.push(
      "SBR рассматривается как гибкий вариант периодической биологической очистки."
    );
  }

  if (
    technology.id === "MBBR" &&
    (isHighOrganicLoad || spaceLimit !== "normal")
  ) {
    score += 8;
  }

  if (
    technology.id === "IFAS" &&
    (projectType === "reconstruction" || spaceLimit !== "normal")
  ) {
    score += 8;
  }

  if (
    technology.id === "MBR" &&
    needsHighEffluent
  ) {
    score += 10;
  }

  if (
    technology.id === "ANBR_MBR"
  ) {
    if (isHighOrganicLoad) {
      score += 18;
      reasons.push(
        "Высокая органическая нагрузка является основанием рассмотреть анаэробную ступень перед глубокой мембранной очисткой."
      );
    } else {
      score -= 12;
    }

    if (needsHighEffluent) {
      score += 12;
      reasons.push(
        "Мембранная ступень повышает привлекательность схемы при высоких требованиях к качеству эффлюента."
      );
    }

    if (needsN) {
      score += 8;
      reasons.push(
        "При необходимости удаления азота схема должна дополняться аэробной нитрификацией/денитрификацией; это требует отдельного расчёта."
      );
    }

    warnings.push(
      "ANBR + MBR нельзя выбирать только по БПК/ХПК: необходимо проверить биоразлагаемость, температуру, щёлочность, сульфаты, образование биогаза и последующую аэробную ступень."
    );
  }

  if (
    technology.id === "SBR_MBR"
  ) {
    if (needsHighEffluent) {
      score += 24;
      reasons.push(
        "Комбинация SBR + MBR подходит для дальнейшего сравнения при повышенных требованиях к качеству очищенной воды."
      );
    }

    if (needsN) {
      score += 10;
      reasons.push(
        "SBR позволяет организовать аэробные и аноксические фазы; точная схема удаления азота определяется расчётом."
      );
    }

    if (spaceLimit !== "normal") {
      score += 8;
      reasons.push(
        "Мембранное разделение может уменьшить потребность в отдельном вторичном отстойнике."
      );
    }

    warnings.push(
      "Необходимо проверить мембранный поток, MLSS, SRT, аэрацию и режимы очистки мембран."
    );
  }

  if (
    technology.id === "MBBR_MBR"
  ) {
    if (isHighOrganicLoad) {
      score += 18;
      reasons.push(
        "Интенсивная биологическая ступень MBBR может быть полезна при повышенной органической нагрузке."
      );
    }

    if (needsHighEffluent) {
      score += 16;
      reasons.push(
        "MBR добавляет мембранное разделение для получения высокого качества очищенной воды."
      );
    }

    if (spaceLimit !== "normal") {
      score += 8;
    }

    warnings.push(
      "Необходимо отдельно рассчитать загрузку носителя, аэрацию, мембранный поток и промывки."
    );
  }

  if (
    technology.id === "UASB" ||
    technology.id === "ABR" ||
    technology.id === "ANBR"
  ) {
    if (!isHighOrganicLoad) {
      score -= 10;
    }
  }

  /*
   * ---------------------------------------------------------
   * БАЗОВАЯ НАГРУЗКА
   * ---------------------------------------------------------
   */

  const organicLoad =
    bod > 0 && q > 0
      ? (q * bod) / 1000
      : 0;

  /*
   * MBBR
   */

  if (technology.id === "MBBR") {

    if (bod >= 150) {
      score += 8;

      reasons.push(
        "Органическая нагрузка подходит для интенсивной биологической очистки."
      );
    }

    if (
      spaceLimit === "limited" ||
      spaceLimit === "very-limited"
    ) {
      score += 12;

      reasons.push(
        "Ограниченная площадь повышает привлекательность компактной биореакторной схемы."
      );
    }

    if (nitrogenRemoval !== "no") {
      score += 5;

      reasons.push(
        "MBBR может использоваться как основа биологической схемы при необходимости удаления азота."
      );
    }

    if (projectType === "reconstruction") {
      score += 7;

      reasons.push(
        "Технология подходит для усиления существующей биологической ступени."
      );
    }

    if (q >= 100) {
      score += 4;
    }

    if (effluentQuality === "very-high") {
      score -= 5;

      warnings.push(
        "При очень высоких требованиях к качеству очищенной воды может потребоваться дополнительная ступень разделения."
      );
    }

    if (organicLoad > 0) {
      reasons.push(
        `Расчётная органическая нагрузка по БПК составляет примерно ${organicLoad.toFixed(
          1
        )} кг БПК/сут.`
      );
    }
  }

  /*
   * IFAS
   */

  if (technology.id === "IFAS") {

    if (
      projectType === "reconstruction"
    ) {
      score += 20;

      reasons.push(
        "IFAS особенно интересен для реконструкции существующих аэротенков."
      );
    }

    if (
      spaceLimit === "limited" ||
      spaceLimit === "very-limited"
    ) {
      score += 10;

      reasons.push(
        "При ограниченной площади увеличение количества прикреплённой биомассы может быть полезным."
      );
    }

    if (bod >= 150) {
      score += 6;
    }

    if (nitrogenRemoval !== "no") {
      score += 8;

      reasons.push(
        "IFAS может применяться для повышения биологической производительности существующей системы."
      );
    }

    if (effluentQuality === "very-high") {
      warnings.push(
        "Очень высокое качество эффлюента может потребовать дополнительного разделения или доочистки."
      );
    }
  }

  /*
   * SBR
   */

  if (technology.id === "SBR") {

   if (q > 0) {
  score += 4;
}

    if (
      nitrogenRemoval !== "no"
    ) {
      score += 10;

      reasons.push(
        "Циклический режим SBR позволяет гибко организовывать биологические стадии."
      );
    }

    if (
      phosphorusRemoval !== "no"
    ) {
      score += 5;

      reasons.push(
        "SBR может быть рассмотрен при необходимости комбинированного удаления загрязнений."
      );
    }

    if (spaceLimit === "normal") {
      score += 3;
    }

    if (
      spaceLimit === "very-limited"
    ) {
      score -= 5;

      warnings.push(
        "При очень жёстком ограничении площади необходимо сравнить SBR с более компактными вариантами."
      );
    }
  }

  /*
   * MBR
   */

  if (technology.id === "MBR") {

    if (
      effluentQuality === "high"
    ) {
      score += 16;

      reasons.push(
        "Повышенные требования к качеству очищенной воды повышают привлекательность мембранной схемы."
      );
    }

    if (
      effluentQuality === "very-high"
    ) {
      score += 25;

      reasons.push(
        "Очень высокое требование к качеству эффлюента является сильным аргументом в пользу MBR."
      );
    }

    if (
      spaceLimit === "limited"
    ) {
      score += 15;

      reasons.push(
        "Ограниченная площадь является аргументом в пользу компактной мембранной схемы."
      );
    }

    if (
      spaceLimit === "very-limited"
    ) {
      score += 20;

      reasons.push(
        "При очень ограниченной площади MBR получает дополнительный приоритет."
      );
    }

    if (tss >= 200) {
      score += 4;
    }

    warnings.push(
      "Необходимо отдельно учитывать мембранный поток, загрязнение мембран, промывки и эксплуатационные расходы."
    );
  }

  /*
   * AS — АКТИВНЫЙ ИЛ
   */

  if (technology.id === "AS") {

    if (
      spaceLimit === "normal"
    ) {
      score += 8;

      reasons.push(
        "При отсутствии жёсткого ограничения по площади классический активный ил остаётся базовым вариантом сравнения."
      );
    }

    if (
      projectType === "new"
    ) {
      score += 4;
    }

    if (
      effluentQuality === "standard"
    ) {
      score += 8;

      reasons.push(
        "При стандартных требованиях классическая аэробная схема может быть рациональным базовым вариантом."
      );
    }

    if (
      spaceLimit === "very-limited"
    ) {
      score -= 15;

      warnings.push(
        "При сильно ограниченной площади следует сравнить активный ил с MBBR, IFAS или MBR."
      );
    }
  }

  /*
   * ANAEROBIC — ANBR / UASB / ABR
   */

  if (
    technology.id === "ANBR" ||
    technology.id === "UASB" ||
    technology.id === "ABR"
  ) {

    if (cod >= 1000) {
      score += 18;

      reasons.push(
        "Высокая концентрация ХПК делает анаэробные варианты интересными для предварительного сравнения."
      );
    }

    if (bod >= 500) {
      score += 10;

      reasons.push(
        "Высокая органическая нагрузка может быть аргументом для анаэробной ступени."
      );
    }

    if (nitrogenRemoval !== "no") {
      score -= 8;

      warnings.push(
        "Для глубокого удаления азота одной анаэробной ступени обычно недостаточно."
      );
    }

    if (phosphorusRemoval !== "no") {
      score -= 5;

      warnings.push(
        "Для глубокого удаления фосфора потребуется отдельная технологическая проверка."
      );
    }

    if (effluentQuality === "very-high") {
      score -= 12;

      warnings.push(
        "При очень высоких требованиях к качеству эффлюента анаэробную технологию необходимо рассматривать как часть многоступенчатой схемы."
      );
    }
  }

  /*
   * AnMBR
   */

  if (technology.id === "AnMBR") {

    if (cod >= 800) {
      score += 15;

      reasons.push(
        "Повышенная органическая нагрузка делает анаэробную мембранную схему кандидатом для дальнейшего сравнения."
      );
    }

    if (
      effluentQuality === "high" ||
      effluentQuality === "very-high"
    ) {
      score += 12;

      reasons.push(
        "Мембранное разделение может обеспечить высокое качество разделения биомассы и воды."
      );
    }

    warnings.push(
      "Необходимо отдельно проверить мембранную технологию, образование биогаза и экономику эксплуатации."
    );
  }

  /*
   * Общий бонус за высокую органическую нагрузку
   */

  if (
    organicLoad > 100 &&
    (
      technology.id === "MBBR" ||
      technology.id === "IFAS" ||
      technology.id === "MBR"
    )
  ) {
    score += 5;
  }

  /*
   * Общий бонус за высокое загрязнение
   */

  if (
    bod >= 300 &&
    (
      technology.id === "MBBR" ||
      technology.id === "IFAS"
    )
  ) {
    score += 4;
  }

  /*
   * Защита от выхода за диапазон
   */

  score = Math.max(
    0,
    Math.min(100, Math.round(score))
  );

  /*
   * Если исходных данных мало,
   * добавляем предупреждение.
   */

  if (
    q <= 0 ||
    bod <= 0 ||
    cod <= 0
  ) {
    warnings.push(
      "Для окончательного сравнения необходимо указать расход, БПК и ХПК."
    );
  }

  if (
    nitrogen <= 0
  ) {
    warnings.push(
      "Концентрация азота не задана — оценка удаления азота предварительная."
    );
  }

  if (
    phosphorus <= 0
  ) {
    warnings.push(
      "Концентрация фосфора не задана — оценка удаления фосфора предварительная."
    );
  }

  /*
   * Если причин пока мало,
   * добавляем нейтральное объяснение.
   */

  if (reasons.length === 0) {
    reasons.push(
      "Технология оставлена в списке кандидатов для дальнейшего инженерного сравнения."
    );
  }

  return {
    technology,
    score,
    reasons,
    warnings,
  };
}

/*
 * =========================================================
 * INFO ITEM
 * =========================================================
 */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={infoItem}>
      <span style={infoLabel}>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

/*
 * =========================================================
 * DATA ITEM
 * =========================================================
 */

function DataItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div style={dataItem}>

      <span style={dataItemLabel}>
        {label}
      </span>

      <strong style={dataItemValue}>
        {value
          ? `${value} ${unit}`
          : "Не указано"}
      </strong>

    </div>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#06151d",
  color: "#f4f7f8",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const container: CSSProperties = {
  width:
    "min(1150px, calc(100% - 32px))",
  margin: "0 auto",
  padding:
    "60px 0 100px",
};

const backButton: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#8ca4ad",
  padding: 0,
  marginBottom: 40,
  fontSize: 15,
  cursor: "pointer",
};

const eyebrow: CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "3px",
  marginBottom: 20,
};

const title: CSSProperties = {
  margin: 0,
  fontSize:
    "clamp(44px, 7vw, 78px)",
  lineHeight: 0.98,
  letterSpacing: "-3px",
  fontWeight: 800,
};

const lead: CSSProperties = {
  maxWidth: 820,
  marginTop: 25,
  marginBottom: 40,
  color: "#8ca4ad",
  fontSize: 18,
  lineHeight: 1.7,
};

const infoCard: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  padding: 18,
  marginBottom: 25,
  background: "#081b24",
  border:
    "1px solid #1c3742",
  borderRadius: 12,
};

const infoItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  padding: 12,
  color: "#ffffff",
  fontSize: 15,
};

const infoLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const dataCard: CSSProperties = {
  background: "#081b24",
  border:
    "1px solid #1c3742",
  borderRadius: 12,
  padding: 22,
  marginBottom: 35,
};

const sectionTitle: CSSProperties = {
  color: "#657983",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "2px",
  marginBottom: 20,
};

const dataGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const dataItem: CSSProperties = {
  minHeight: 70,
  padding: 14,
  border:
    "1px solid #17333e",
  background: "#071922",
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 7,
};

const dataItemLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const dataItemValue: CSSProperties = {
  color: "#f4f7f8",
  fontSize: 14,
};

/*
 * AUTO RECOMMENDATION
 */

const recommendationBox: CSSProperties = {
  padding: 30,
  marginBottom: 50,
  border:
    "1px solid #17485a",
  borderRadius: 14,
  background:
    "radial-gradient(circle at top right, #0a2935 0%, #071922 60%)",
};

const recommendationTitle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 30,
  lineHeight: 1.2,
};

const recommendationText: CSSProperties = {
  maxWidth: 800,
  margin:
    "14px 0 28px",
  color: "#8ca4ad",
  fontSize: 15,
  lineHeight: 1.7,
};

const formGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 16,
};

const field: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const fieldLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.4px",
};

const selectStyle: CSSProperties = {
  width: "100%",
  minHeight: 52,
  padding:
    "0 14px",
  border:
    "1px solid #294752",
  borderRadius: 7,
  background: "#06151d",
  color: "#f4f7f8",
  fontSize: 14,
  outline: "none",
};

const recommendationButton: CSSProperties = {
  marginTop: 25,
  border: 0,
  borderRadius: 7,
  background: "#00aeea",
  color: "#ffffff",
  padding:
    "17px 24px",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow:
    "0 8px 30px rgba(0,174,234,.18)",
};

/*
 * RESULT
 */

const resultBox: CSSProperties = {
  marginBottom: 50,
  padding: 30,
  border:
    "1px solid #1c4d5c",
  borderRadius: 14,
  background: "#071922",
};

const topResult: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 30,
  flexWrap: "wrap",
  paddingBottom: 28,
  borderBottom:
    "1px solid #17333e",
};

const resultSmallLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.6px",
  marginBottom: 8,
};

const resultTechnology: CSSProperties = {
  color: "#00d9ff",
  fontSize: 46,
  fontWeight: 800,
  letterSpacing: "-2px",
};

const resultSubtitle: CSSProperties = {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 700,
  marginTop: 4,
};

const scoreBlock: CSSProperties = {
  minWidth: 120,
  textAlign: "center",
  padding: 16,
  border:
    "1px solid #1c3742",
  borderRadius: 10,
  background: "#081b24",
};

const scoreNumber: CSSProperties = {
  color: "#00d9ff",
  fontSize: 40,
  fontWeight: 800,
  lineHeight: 1,
};

const scoreLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginTop: 7,
};

const whyTitle: CSSProperties = {
  marginTop: 28,
  marginBottom: 15,
  color: "#ffffff",
  fontSize: 17,
  fontWeight: 800,
};

const reasonList: CSSProperties = {
  display: "grid",
  gap: 10,
};

const reasonItem: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  color: "#9bb0b9",
  fontSize: 14,
  lineHeight: 1.6,
};

const reasonMark: CSSProperties = {
  color: "#00d9ff",
  fontWeight: 800,
};

const warningBox: CSSProperties = {
  marginTop: 25,
  padding: 18,
  border:
    "1px solid rgba(255,180,80,.2)",
  borderRadius: 9,
  background:
    "rgba(255,180,80,.04)",
};

const warningTitle: CSSProperties = {
  color: "#c5a66b",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: 9,
};

const warningItem: CSSProperties = {
  color: "#8f8880",
  fontSize: 13,
  lineHeight: 1.6,
  marginTop: 5,
};

const alternativeTitle: CSSProperties = {
  marginTop: 30,
  marginBottom: 14,
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.6px",
};

const alternativeGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
};

const alternativeCard: CSSProperties = {
  appearance: "none",
  textAlign: "left",
  padding: 18,
  border:
    "1px solid #1c3742",
  borderRadius: 9,
  background: "#081b24",
  color: "#ffffff",
  cursor: "pointer",
};

const alternativeScore: CSSProperties = {
  color: "#00d9ff",
  fontSize: 24,
  fontWeight: 800,
};

const alternativeTechnology: CSSProperties = {
  marginTop: 8,
  fontSize: 21,
  fontWeight: 800,
};

const alternativeSubtitle: CSSProperties = {
  marginTop: 4,
  color: "#829aa5",
  fontSize: 12,
};

const alternativeAction: CSSProperties = {
  marginTop: 15,
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
};

const manualHint: CSSProperties = {
  maxWidth: 800,
  marginTop: -5,
  marginBottom: 20,
  color: "#718995",
  fontSize: 13,
  lineHeight: 1.6,
};

/*
 * TECHNOLOGIES
 */

const technologyGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 16,
};

const technologyCard: CSSProperties = {
  appearance: "none",
  textAlign: "left",
  border:
    "1px solid #1c3742",
  borderRadius: 14,
  background: "#081b24",
  color: "#ffffff",
  padding: 25,
  minHeight: 245,
  cursor: "pointer",
  transition:
    "border-color .2s ease, transform .2s ease, background .2s ease",
};

const technologyCardSelected: CSSProperties = {
  border:
    "1px solid #00d9ff",
  background:
    "radial-gradient(circle at top right, #0b303d 0%, #081b24 65%)",
  boxShadow:
    "0 0 0 1px rgba(0,217,255,.08)",
};

const technologyCategory: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: 18,
};

const technologyTitle: CSSProperties = {
  color: "#00d9ff",
  fontSize: 30,
  fontWeight: 800,
  marginBottom: 7,
};

const technologySubtitle: CSSProperties = {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 12,
};

const technologyDescription: CSSProperties = {
  color: "#8ca4ad",
  fontSize: 13,
  lineHeight: 1.65,
  margin: 0,
};

const technologyFooter: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 20,
  paddingTop: 15,
  borderTop:
    "1px solid #1c3742",
  color: "#00d9ff",
  fontSize: 13,
  fontWeight: 800,
};

/*
 * SELECTED
 */

const selectedCard: CSSProperties = {
  marginTop: 30,
  padding: 28,
  border:
    "1px solid #1c4d5c",
  borderRadius: 14,
  background:
    "radial-gradient(circle at right, #0c2732 0%, #071922 65%)",
};

const selectedLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "2px",
  marginBottom: 12,
};

const selectedTitle: CSSProperties = {
  color: "#00d9ff",
  fontSize: 34,
  fontWeight: 800,
};

const selectedSubtitle: CSSProperties = {
  color: "#ffffff",
  fontSize: 17,
  fontWeight: 700,
  marginTop: 5,
};

const selectedDescription: CSSProperties = {
  color: "#8ca4ad",
  fontSize: 14,
  lineHeight: 1.7,
  maxWidth: 800,
  marginBottom: 0,
};

/*
 * ACTIONS
 */

const actions: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 30,
};

const primaryButton: CSSProperties = {
  border: 0,
  borderRadius: 7,
  background: "#00aeea",
  color: "#ffffff",
  padding:
    "18px 28px",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow:
    "0 8px 30px rgba(0,174,234,.18)",
};

const secondaryButton: CSSProperties = {
  border:
    "1px solid #29444e",
  borderRadius: 7,
  background: "transparent",
  color: "#f4f7f8",
  padding:
    "18px 24px",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const arrow: CSSProperties = {
  marginLeft: 12,
  fontSize: 20,
};

const disclaimer: CSSProperties = {
  color: "#536871",
  fontSize: 12,
  lineHeight: 1.7,
  maxWidth: 850,
  marginTop: 30,
};
