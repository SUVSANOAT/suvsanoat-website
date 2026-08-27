"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

type Unit = {
  title: string;
  type: "tank" | "screen" | "pump" | "blower" | "membrane" | "clarifier";
  x: number;
  y: number;
  w: number;
  h: number;
};

type TechModel = {
  label: string;
  model: string;
  defaultHrt: number;
  description: string;
};

const TECH_MODELS: Record<string, TechModel> = {
  ANBR: {
    label: "ANBR",
    model: "анаэробная биоплёнка",
    defaultHrt: 12,
    description:
      "Предварительная модель анаэробного биореактора с прикреплённой биомассой.",
  },

  UASB: {
    label: "UASB",
    model: "анаэробный восходящий поток",
    defaultHrt: 8,
    description:
      "Предварительная модель UASB с расчётом по гидравлическому времени пребывания.",
  },

  ABR: {
    label: "ABR",
    model: "анаэробные перегородочные камеры",
    defaultHrt: 12,
    description:
      "Предварительная модель последовательного анаэробного реактора.",
  },

  AnMBR: {
    label: "AnMBR",
    model: "анаэробный реактор + мембраны",
    defaultHrt: 10,
    description:
      "Предварительная модель анаэробного реактора с мембранным разделением.",
  },

  IFAS: {
    label: "IFAS",
    model: "гибридная биомасса",
    defaultHrt: 8,
    description:
      "Предварительная модель системы активного ила с прикреплённой биомассой.",
  },

  AS: {
    label: "Классический активный ил",
    model: "activated sludge",
    defaultHrt: 8,
    description:
      "Предварительная модель аэротенка с активным илом.",
  },

  MBBR: {
    label: "MBBR",
    model: "подвижная биоплёнка",
    defaultHrt: 8,
    description:
      "Предварительная модель биореактора с подвижной загрузкой.",
  },

  SBR: {
    label: "SBR",
    model: "циклический реактор",
    defaultHrt: 8,
    description:
      "Предварительная модель циклического биореактора.",
  },

  MBR: {
    label: "MBR",
    model: "биореактор + мембранный блок",
    defaultHrt: 8,
    description:
      "Предварительная модель мембранного биореактора.",
  },
};

const MBBR_PRELIMINARY = {
  bodRemoval: 0.90,
  volumetricBodLoading: 0.80,
  mediaFillFraction: 0.50,
  mediaSpecificSurface: 500,
  surfaceBodLoading: 0.006,
};

const EQUIPMENT: Record<string, string[]> = {
  ANBR: [
    "Приёмная камера",
    "Механическая решётка",
    "ANBR-реактор",
    "Насосная группа",
    "Газовая система",
    "Обеззараживание",
  ],

  UASB: [
    "Приёмная камера",
    "Механическая очистка",
    "UASB-реактор",
    "Насосы",
    "Газовая система",
    "Доочистка",
    "Обеззараживание",
  ],

  ABR: [
    "Приёмная камера",
    "Механическая очистка",
    "ABR-реактор",
    "Насосная группа",
    "Газовая система",
    "Доочистка",
    "Обеззараживание",
  ],

  AnMBR: [
    "Приёмная камера",
    "Механическая очистка",
    "Анаэробный реактор",
    "Мембранный модуль",
    "Насосная группа",
    "Обеззараживание",
  ],

  IFAS: [
    "Приёмная камера",
    "Механическая очистка",
    "IFAS-реактор",
    "Воздуходувная система",
    "Вторичный отстойник",
    "Обеззараживание",
  ],

  AS: [
    "Приёмная камера",
    "Механическая очистка",
    "Аэротенк",
    "Воздуходувки",
    "Вторичный отстойник",
    "Обеззараживание",
  ],

  MBBR: [
    "Приёмная камера",
    "Механическая очистка",
    "MBBR-реактор",
    "Воздуходувки",
    "Система удержания загрузки",
    "Доочистка",
    "Обеззараживание",
  ],

  SBR: [
    "Приёмная камера",
    "Механическая очистка",
    "SBR-реактор",
    "Воздуходувки",
    "Насос очищенной воды",
    "Обеззараживание",
  ],

  MBR: [
    "Приёмная камера",
    "Механическая очистка",
    "MBR-реактор",
    "Воздуходувки",
    "Мембранный блок",
    "Обеззараживание",
  ],
};

function getModel(technology: string): TechModel {
  return TECH_MODELS[technology] || TECH_MODELS.MBBR;
}

function getUnits(technology: string): Unit[] {
  const commonStart: Unit[] = [
    {
      title: "Приёмная камера",
      type: "tank",
      x: 25,
      y: 105,
      w: 135,
      h: 90,
    },
    {
      title: "Мех. очистка",
      type: "screen",
      x: 190,
      y: 105,
      w: 125,
      h: 90,
    },
  ];

  if (technology === "SBR") {
    return [
      ...commonStart,
      {
        title: "SBR №1",
        type: "tank",
        x: 350,
        y: 65,
        w: 145,
        h: 170,
      },
      {
        title: "SBR №2",
        type: "tank",
        x: 520,
        y: 65,
        w: 145,
        h: 170,
      },
      {
        title: "Обеззараживание",
        type: "tank",
        x: 700,
        y: 105,
        w: 145,
        h: 90,
      },
      {
        title: "Сброс",
        type: "tank",
        x: 875,
        y: 105,
        w: 110,
        h: 90,
      },
    ];
  }

  if (
    technology === "UASB" ||
    technology === "ANBR" ||
    technology === "ABR"
  ) {
    return [
      ...commonStart,
      {
        title: technology,
        type: "tank",
        x: 350,
        y: 70,
        w: 215,
        h: 160,
      },
      {
        title: "Газосбор",
        type: "tank",
        x: 405,
        y: 25,
        w: 105,
        h: 30,
      },
      {
        title: "Доочистка",
        type: "clarifier",
        x: 610,
        y: 105,
        w: 145,
        h: 90,
      },
      {
        title: "Обеззараживание",
        type: "tank",
        x: 800,
        y: 105,
        w: 145,
        h: 90,
      },
    ];
  }

  if (technology === "AnMBR" || technology === "MBR") {
    return [
      ...commonStart,
      {
        title: technology,
        type: "tank",
        x: 350,
        y: 70,
        w: 210,
        h: 160,
      },
      {
        title: "Мембраны",
        type: "membrane",
        x: 405,
        y: 105,
        w: 100,
        h: 65,
      },
      {
        title: "Насосы",
        type: "pump",
        x: 590,
        y: 105,
        w: 135,
        h: 90,
      },
      {
        title: "Обеззараживание",
        type: "tank",
        x: 765,
        y: 105,
        w: 145,
        h: 90,
      },
    ];
  }

  return [
    ...commonStart,
    {
      title: technology,
      type: "tank",
      x: 350,
      y: 70,
      w: 215,
      h: 160,
    },
    {
      title: "Аэрация",
      type: "blower",
      x: 395,
      y: 105,
      w: 125,
      h: 65,
    },
    {
      title: "Отстойник",
      type: "clarifier",
      x: 610,
      y: 105,
      w: 145,
      h: 90,
    },
    {
      title: "Обеззараживание",
      type: "tank",
      x: 800,
      y: 105,
      w: 145,
      h: 90,
    },
  ];
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "Объект";
  const technology = searchParams.get("technology") || "MBBR";

  const flowRaw = searchParams.get("flow") || "";
  const peopleRaw = searchParams.get("people") || "";
  const hoursRaw = searchParams.get("hours") || "";
  const bodRaw = searchParams.get("bod") || "";
  const codRaw = searchParams.get("cod") || "";
  const tssRaw = searchParams.get("tss") || "";
  const nitrogenRaw = searchParams.get("nitrogen") || "";
  const phosphorusRaw = searchParams.get("phosphorus") || "";

  const model = getModel(technology);

  const [hrt, setHrt] = useState(String(model.defaultHrt));

  const flow = Number(flowRaw);
  const people = Number(peopleRaw);
  const hours = Number(hoursRaw);
  const bod = Number(bodRaw);
  const cod = Number(codRaw);
  const tss = Number(tssRaw);
  const nitrogen = Number(nitrogenRaw);
  const phosphorus = Number(phosphorusRaw);

  /*
   * Нагрузки загрязнений.
   *
   * кг/сут = Qсут × C / 1000
   */
  const loads = {
    bod:
      flow > 0 && bod > 0
        ? (flow * bod) / 1000
        : 0,

    cod:
      flow > 0 && cod > 0
        ? (flow * cod) / 1000
        : 0,

    tss:
      flow > 0 && tss > 0
        ? (flow * tss) / 1000
        : 0,

    nitrogen:
      flow > 0 && nitrogen > 0
        ? (flow * nitrogen) / 1000
        : 0,

    phosphorus:
      flow > 0 && phosphorus > 0
        ? (flow * phosphorus) / 1000
        : 0,
  };

  /*
   * ОСНОВНОЙ РАСЧЁТ
   *
   * Qсут — м³/сут
   * Qср — средний расход за 24 часа, м³/ч
   * Qраб — расход в часы фактической работы объекта, м³/ч
   * V — предварительный рабочий объём реактора
   *
   * Если объект работает не 24 часа/сутки, для предварительного
   * подбора объёма используем Qраб = Qсут / часы работы.
   *
   * V = Qраб × HRT
   */
  const qHour =
    Number.isFinite(flow) && flow > 0
      ? flow / 24
      : 0;

  const operatingHours =
    Number.isFinite(hours) && hours > 0 && hours <= 24
      ? hours
      : 24;

  const operatingHourlyFlow =
    Number.isFinite(flow) && flow > 0
      ? flow / operatingHours
      : 0;

  const qPeak =
    qHour > 0
      ? qHour * 1.5
      : 0;

  const hrtValue = Number(hrt);

  /*
   * Базовый гидравлический объём.
   * Для объекта с работой менее 24 ч/сут используем Qраб.
   */
  const hydraulicVolume =
    operatingHourlyFlow > 0 && hrtValue > 0
      ? operatingHourlyFlow * hrtValue
      : 0;

  /*
   * Предварительная MBBR-проверка по органической нагрузке.
   *
   * ВАЖНО: это ориентировочная инженерная модель, а не рабочий проект.
   * Значения коэффициентов вынесены в MBBR_PRELIMINARY и должны быть
   * заменены на принятые проектом/поставщиком загрузки параметры.
   */
  // loads уже инициализирован выше, поэтому loads.bod доступен здесь.
  const mbbrOrganic = useMemo(() => {
    if (technology !== "MBBR" || loads.bod <= 0) {
      return {
        removalLoad: 0,
        volumeByOrganic: 0,
        mediaVolume: 0,
        volumeByMedia: 0,
        recommendedVolume: hydraulicVolume,
      };
    }

    const removalLoad =
      loads.bod * MBBR_PRELIMINARY.bodRemoval;

    const volumeByOrganic =
      removalLoad /
      MBBR_PRELIMINARY.volumetricBodLoading;

    const mediaVolume =
      removalLoad /
      (MBBR_PRELIMINARY.surfaceBodLoading *
        MBBR_PRELIMINARY.mediaSpecificSurface);

    const volumeByMedia =
      mediaVolume /
      MBBR_PRELIMINARY.mediaFillFraction;

    return {
      removalLoad,
      volumeByOrganic,
      mediaVolume,
      volumeByMedia,
      recommendedVolume: Math.max(
        hydraulicVolume,
        volumeByOrganic,
        volumeByMedia
      ),
    };
  }, [technology, loads.bod, hydraulicVolume]);

  const volume =
    technology === "MBBR"
      ? mbbrOrganic.recommendedVolume
      : hydraulicVolume;

  /*
   * Предварительная геометрия.
   * Это НЕ рабочие проектные размеры.
   */
  const dimensions = useMemo(() => {
    if (volume <= 0) {
      return {
        length: 0,
        width: 0,
        depth: 0,
      };
    }

    const depth = 4.0;

    const width = Math.max(
      3.0,
      Math.sqrt(volume / depth / 2)
    );

    const length =
      volume / (width * depth);

    return {
      length,
      width,
      depth,
    };
  }, [volume]);

  /*
   * Предварительное количество реакторов.
   *
   * Пока не заставляем систему автоматически
   * дробить сооружение на несколько блоков.
   * Для текущей версии принимаем 1 реактор,
   * а общий объём показываем отдельно.
   */
  const reactorCount = volume > 0 ? 1 : 0;

  const volumePerReactor =
    reactorCount > 0
      ? volume / reactorCount
      : 0;

  /*
   * Нагрузки загрязнений.
   *
   * кг/сут = Q × C / 1000
   */


  const equipment =
    EQUIPMENT[technology] || EQUIPMENT.MBBR;

  const units = getUnits(technology);
  const arrows = units.slice(0, -1);

  const goBack = () => {
    const params = new URLSearchParams();

    params.set("object", object);
    params.set("technology", technology);

    if (flowRaw) params.set("flow", flowRaw);
    if (peopleRaw) params.set("people", peopleRaw);
    if (hoursRaw) params.set("hours", hoursRaw);

    router.push(
      `/engineering/analysis/equipment?${params.toString()}`
    );
  };

  const finishAnalysis = () => {
    const params = new URLSearchParams();

    params.set("object", object);
    params.set("technology", technology);

    if (flowRaw) {
      params.set("flow", flowRaw);
    }

    if (peopleRaw) {
      params.set("people", peopleRaw);
    }

    if (hoursRaw) {
      params.set("hours", hoursRaw);
    }

    if (bodRaw) {
      params.set("bod", bodRaw);
    }

    if (codRaw) {
      params.set("cod", codRaw);
    }

    if (tssRaw) {
      params.set("tss", tssRaw);
    }

    if (nitrogenRaw) {
      params.set("nitrogen", nitrogenRaw);
    }

    if (phosphorusRaw) {
      params.set("phosphorus", phosphorusRaw);
    }

    router.push(
      `/engineering/analysis/complete?${params.toString()}`
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06151d",
        color: "#f4f7f8",
        padding: "70px 24px 110px",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={goBack}
          style={backButton}
        >
          ← Назад
        </button>

        <div style={eyebrow}>
          ИНЖЕНЕРНОЕ РЕШЕНИЕ / РЕЗУЛЬТАТ
        </div>

        <h1 style={title}>
          Предварительное
          <br />
          инженерное решение
        </h1>

        <p style={lead}>
          Расчётная конфигурация для объекта{" "}
          <strong style={{ color: "#f4f7f8" }}>
            {object}
          </strong>{" "}
          по технологии{" "}
          <strong style={{ color: "#00d9ff" }}>
            {model.label}
          </strong>
          .
        </p>

        {/* ОСНОВНЫЕ ПАРАМЕТРЫ */}

        <section style={card}>
          <SectionLabel>
            ОСНОВНЫЕ ПАРАМЕТРЫ
          </SectionLabel>

          <div style={metricGrid}>
            <Metric
              label="ОБЪЕКТ"
              value={object}
            />

            <Metric
              label="ТЕХНОЛОГИЯ"
              value={model.label}
              accent
            />

            <Metric
              label="QСУТ"
              value={
                flow > 0
                  ? `${flow.toFixed(1)} м³/сут`
                  : "—"
              }
            />

            <Metric
              label="QСР"
              value={
                qHour > 0
                  ? `${qHour.toFixed(2)} м³/ч`
                  : "—"
              }
            />

            <Metric
              label="QMAX"
              value={
                qPeak > 0
                  ? `${qPeak.toFixed(2)} м³/ч`
                  : "—"
              }
            />

            <Metric
              label="ЛЮДЕЙ"
              value={people > 0 ? `${people} чел.` : "—"}
            />

            <Metric
              label="РАБОТА"
              value={hours > 0 ? `${hours} ч/сут` : "—"}
            />
          </div>
        </section>

        {/* НАГРУЗКИ */}

        <section style={card}>
          <SectionLabel>
            НАГРУЗКА ЗАГРЯЗНЕНИЙ
          </SectionLabel>

          <div style={metricGrid}>
            <Metric
              label="BOD"
              value={
                bod > 0
                  ? `${bod} мг/л`
                  : "не задано"
              }
            />

            <Metric
              label="COD"
              value={
                cod > 0
                  ? `${cod} мг/л`
                  : "не задано"
              }
            />

            <Metric
              label="TSS"
              value={
                tss > 0
                  ? `${tss} мг/л`
                  : "не задано"
              }
            />

            <Metric
              label="N"
              value={
                nitrogen > 0
                  ? `${nitrogen} мг/л`
                  : "не задано"
              }
            />

            <Metric
              label="P"
              value={
                phosphorus > 0
                  ? `${phosphorus} мг/л`
                  : "не задано"
              }
            />
          </div>

          <div style={loadGrid}>
            <LoadCard
              label="BOD, кг/сут"
              value={loads.bod}
            />

            <LoadCard
              label="COD, кг/сут"
              value={loads.cod}
            />

            <LoadCard
              label="TSS, кг/сут"
              value={loads.tss}
            />

            <LoadCard
              label="N, кг/сут"
              value={loads.nitrogen}
            />

            <LoadCard
              label="P, кг/сут"
              value={loads.phosphorus}
            />
          </div>
        </section>

        {/* РАСЧЁТ */}

        <section style={card}>
          <SectionLabel>
            ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ
          </SectionLabel>

          <div style={modelBox}>
            <div style={smallLabel}>
              РАСЧЁТНАЯ МОДЕЛЬ
            </div>

            <div style={modelName}>
              {model.model}
            </div>

            <p style={modelDescription}>
              {model.description}
            </p>
          </div>

          <div style={metricGrid}>
            <Metric
              label="HRT"
              value={`${hrtValue || 0} ч`}
            />

            <Metric
              label="VПРЕД."
              value={
                volume > 0
                  ? `${volume.toFixed(2)} м³`
                  : "—"
              }
              accent
            />

            <Metric
              label="L"
              value={
                dimensions.length > 0
                  ? `${dimensions.length.toFixed(2)} м`
                  : "—"
              }
            />

            <Metric
              label="B"
              value={
                dimensions.width > 0
                  ? `${dimensions.width.toFixed(2)} м`
                  : "—"
              }
            />

            <Metric
              label="HРАБ."
              value={
                dimensions.depth > 0
                  ? `${dimensions.depth.toFixed(2)} м`
                  : "—"
              }
            />
          </div>

          <div
            style={{
              ...engineeringCalculation,
              marginTop: 15,
            }}
          >
            <SectionLabel>
              РАСЧЁТ ОБОРУДОВАНИЯ
            </SectionLabel>

            <div style={calculationGrid}>
              <CalculationItem
                label="QСР / 24 Ч"
                value={qHour > 0 ? `${qHour.toFixed(2)} м³/ч` : "—"}
              />

              <CalculationItem
                label="QРАБ / ЧАСЫ РАБОТЫ"
                value={
                  operatingHourlyFlow > 0
                    ? `${operatingHourlyFlow.toFixed(2)} м³/ч`
                    : "—"
                }
                accent
              />

              <CalculationItem
                label="HRT"
                value={hrtValue > 0 ? `${hrtValue.toFixed(1)} ч` : "—"}
              />

              <CalculationItem
                label="ОБЩИЙ ОБЪЁМ"
                value={volume > 0 ? `${volume.toFixed(2)} м³` : "—"}
                accent
              />

              <CalculationItem
                label="РЕАКТОРОВ"
                value={reactorCount > 0 ? String(reactorCount) : "—"}
              />

              <CalculationItem
                label="ОБЪЁМ / РЕАКТОР"
                value={
                  volumePerReactor > 0
                    ? `${volumePerReactor.toFixed(2)} м³`
                    : "—"
                }
              />
            </div>

            <div style={formula}>
              Vгидр = Qраб × HRT
              <br />
              {operatingHourlyFlow > 0 && hrtValue > 0 ? (
                <span>
                  {operatingHourlyFlow.toFixed(2)} × {hrtValue.toFixed(1)} ={" "}
                  <strong style={{ color: "#00d9ff" }}>
                    {hydraulicVolume.toFixed(2)} м³
                  </strong>
                </span>
              ) : null}
              <br />
              <span>
                Qср = Qсут / 24. Qраб = Qсут / часы работы.
                Для MBBR итоговый предварительный объём принимается
                не меньше гидравлического и объёма по органической нагрузке.
              </span>
            </div>

            {technology === "MBBR" && (
              <div
                style={{
                  ...engineeringCalculation,
                  marginTop: 15,
                }}
              >
                <SectionLabel>
                  MBBR / ОРГАНИЧЕСКАЯ ПРОВЕРКА
                </SectionLabel>

                <div style={calculationGrid}>
                  <CalculationItem
                    label="БПК₅ НА ВХОДЕ"
                    value={
                      bod > 0
                        ? `${bod.toFixed(0)} мг/л`
                        : "—"
                    }
                  />

                  <CalculationItem
                    label="БПК₅, КГ/СУТ"
                    value={
                      loads.bod > 0
                        ? `${loads.bod.toFixed(2)} кг/сут`
                        : "—"
                    }
                  />

                  <CalculationItem
                    label="СНИМАЕМАЯ НАГРУЗКА"
                    value={
                      mbbrOrganic.removalLoad > 0
                        ? `${mbbrOrganic.removalLoad.toFixed(2)} кг/сут`
                        : "—"
                    }
                    accent
                  />

                  <CalculationItem
                    label="V ПО ОРГАНИКЕ"
                    value={
                      mbbrOrganic.volumeByOrganic > 0
                        ? `${mbbrOrganic.volumeByOrganic.toFixed(2)} м³`
                        : "—"
                    }
                  />

                  <CalculationItem
                    label="V ПО ЗАГРУЗКЕ"
                    value={
                      mbbrOrganic.volumeByMedia > 0
                        ? `${mbbrOrganic.volumeByMedia.toFixed(2)} м³`
                        : "—"
                    }
                  />

                  <CalculationItem
                    label="ЗАГРУЗКА / РЕАКТОР"
                    value={
                      mbbrOrganic.mediaVolume > 0
                        ? `${mbbrOrganic.mediaVolume.toFixed(2)} м³`
                        : "—"
                    }
                  />
                </div>

                <div style={formula}>
                  <strong style={{ color: "#00d9ff" }}>
                    Предварительный объём MBBR = max(Vгидр, Vорганика, Vзагрузка)
                  </strong>
                  <br />
                  Vгидр = {hydraulicVolume.toFixed(2)} м³;{" "}
                  Vорганика = {mbbrOrganic.volumeByOrganic.toFixed(2)} м³;{" "}
                  Vзагрузка = {mbbrOrganic.volumeByMedia.toFixed(2)} м³.
                  <br />
                  В модели приняты ориентировочно: степень удаления БПК₅ 90%,
                  объёмная нагрузка 0.80 кг БПК₅/(м³·сут), заполнение загрузкой 50%,
                  удельная поверхность 500 м²/м³ и поверхностная нагрузка
                  0.006 кг БПК₅/(м²·сут). Эти параметры необходимо подтвердить
                  технологическим расчётом и паспортом конкретной загрузки.
                </div>
              </div>
            )}
          </div>

          <div style={inputBox}>
            <label
              htmlFor="hrt"
              style={inputLabel}
            >
              Расчётное время пребывания, часов
            </label>

            <input
              id="hrt"
              type="number"
              min="0.5"
              step="0.5"
              value={hrt}
              onChange={(e) =>
                setHrt(e.target.value)
              }
              style={inputStyle}
            />

            <div style={formula}>
              Измените HRT — гидравлический объём и предварительные
              габариты пересчитаются автоматически. Для MBBR итоговый
              объём дополнительно проверяется по БПК₅ и параметрам загрузки.
              При работе объекта менее 24 ч/сут расчёт использует
              расход Qсут / часы работы.
            </div>
          </div>
        </section>

        {/* СХЕМА */}

        <section style={card}>
          <SectionLabel>
            ПРЕДВАРИТЕЛЬНАЯ КОМПОНОВКА / ВИД СВЕРХУ
          </SectionLabel>

          <div style={planFrame}>
            <svg
              viewBox="0 0 1020 290"
              width="100%"
              role="img"
              aria-label={`Предварительная схема ${technology}`}
              style={{
                minWidth: 780,
                display: "block",
              }}
            >
              <defs>
                <pattern
                  id="engineering-grid"
                  width="25"
                  height="25"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 25 0 L 0 0 0 25"
                    fill="none"
                    stroke="#16323c"
                    strokeWidth="0.7"
                  />
                </pattern>
              </defs>

              <rect
                width="1020"
                height="290"
                fill="url(#engineering-grid)"
              />

              {arrows.map((unit, index) => {
                const next = units[index + 1];

                const x1 = unit.x + unit.w;
                const y1 =
                  unit.y + unit.h / 2;

                const x2 = next.x;
                const y2 =
                  next.y + next.h / 2;

                return (
                  <g key={`flow-${index}`}>
                    <line
                      x1={x1 + 5}
                      y1={y1}
                      x2={x2 - 10}
                      y2={y2}
                      stroke="#00d9ff"
                      strokeWidth="2"
                    />

                    <polygon
                      points={`${x2 - 10},${y2} ${
                        x2 - 20
                      },${y2 - 5} ${
                        x2 - 20
                      },${y2 + 5}`}
                      fill="#00d9ff"
                    />
                  </g>
                );
              })}

              {units.map((unit, index) => (
                <g
                  key={`${unit.title}-${index}`}
                >
                  <rect
                    x={unit.x}
                    y={unit.y}
                    width={unit.w}
                    height={unit.h}
                    rx="9"
                    fill="#0a222c"
                    stroke={
                      index === 2
                        ? "#00d9ff"
                        : "#2a4d59"
                    }
                    strokeWidth={
                      index === 2 ? "2" : "1.5"
                    }
                  />

                  {unit.type === "tank" && (
                    <>
                      <rect
                        x={unit.x + 12}
                        y={unit.y + 30}
                        width={unit.w - 24}
                        height={unit.h - 43}
                        rx="5"
                        fill="none"
                        stroke="#24505d"
                      />

                      <circle
                        cx={
                          unit.x +
                          unit.w / 2
                        }
                        cy={
                          unit.y +
                          unit.h / 2 +
                          12
                        }
                        r="13"
                        fill="none"
                        stroke="#2b6471"
                      />
                    </>
                  )}

                  {unit.type === "screen" &&
                    [0, 1, 2, 3, 4].map(
                      (line) => (
                        <line
                          key={line}
                          x1={
                            unit.x +
                            25 +
                            line * 16
                          }
                          y1={unit.y + 35}
                          x2={
                            unit.x +
                            25 +
                            line * 16
                          }
                          y2={unit.y + 65}
                          stroke="#00d9ff"
                          strokeWidth="2"
                        />
                      )
                    )}

                  {unit.type === "membrane" &&
                    [0, 1, 2].map((line) => (
                      <rect
                        key={line}
                        x={
                          unit.x +
                          25 +
                          line * 30
                        }
                        y={unit.y + 35}
                        width="20"
                        height="35"
                        fill="none"
                        stroke="#00d9ff"
                      />
                    ))}

                  {unit.type === "blower" && (
                    <circle
                      cx={
                        unit.x +
                        unit.w / 2
                      }
                      cy={unit.y + 52}
                      r="22"
                      fill="none"
                      stroke="#00d9ff"
                      strokeWidth="2"
                    />
                  )}

                  {unit.type === "pump" && (
                    <circle
                      cx={
                        unit.x +
                        unit.w / 2
                      }
                      cy={unit.y + 52}
                      r="20"
                      fill="none"
                      stroke="#00d9ff"
                      strokeWidth="2"
                    />
                  )}

                  {unit.type === "clarifier" && (
                    <>
                      <circle
                        cx={
                          unit.x +
                          unit.w / 2
                        }
                        cy={
                          unit.y +
                          unit.h / 2 +
                          5
                        }
                        r="30"
                        fill="none"
                        stroke="#2d6370"
                      />

                      <circle
                        cx={
                          unit.x +
                          unit.w / 2
                        }
                        cy={
                          unit.y +
                          unit.h / 2 +
                          5
                        }
                        r="5"
                        fill="#00d9ff"
                      />
                    </>
                  )}

                  <text
                    x={unit.x + 12}
                    y={unit.y + 19}
                    fill="#00d9ff"
                    fontSize="9"
                    fontWeight="800"
                  >
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </text>

                  <text
                    x={
                      unit.x +
                      unit.w / 2
                    }
                    y={
                      unit.y +
                      unit.h -
                      12
                    }
                    fill="#f4f7f8"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {unit.title}
                  </text>
                </g>
              ))}

              <text
                x="20"
                y="270"
                fill="#536e78"
                fontSize="9"
                letterSpacing="1.5"
              >
                PRELIMINARY ENGINEERING LAYOUT / TOP
                VIEW
              </text>

              <text
                x="1000"
                y="270"
                fill="#00d9ff"
                fontSize="9"
                textAnchor="end"
              >
                {technology}
              </text>
            </svg>
          </div>
        </section>

        {/* ОБОРУДОВАНИЕ */}

        <section style={card}>
          <SectionLabel>
            ПРЕДВАРИТЕЛЬНЫЙ СОСТАВ ОБОРУДОВАНИЯ
          </SectionLabel>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {equipment.map((item, index) => (
              <div
                key={item}
                style={equipmentRow}
              >
                <div style={equipmentNumber}>
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div>
                  <div style={equipmentName}>
                    {item}
                  </div>

                  <div style={equipmentNote}>
                    Предварительно, 1 комплект
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ЛОГИКА */}

        <section style={card}>
          <SectionLabel>
            ИНЖЕНЕРНАЯ ЛОГИКА
          </SectionLabel>

          <div style={process}>
            {[
              "Приём сточных вод",
              "Механическая очистка",
              model.label,
              "Разделение / доочистка",
              "Обеззараживание",
              "Очищенная вода",
            ].map((item, index, arr) => (
              <div
                key={`${item}-${index}`}
                style={processItem}
              >
                <div style={processBox}>
                  {item}
                </div>

                {index < arr.length - 1 && (
                  <span style={processArrow}>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* КНОПКИ */}

        <div style={actions}>
          <button
            type="button"
            onClick={goBack}
            style={secondaryButton}
          >
            ← Изменить оборудование
          </button>

          <button
            type="button"
            onClick={finishAnalysis}
            style={primaryButton}
          >
            Завершить анализ
          </button>
        </div>

        <p style={disclaimer}>
          Результат является предварительным
          инженерным решением. Расчётные значения,
          габариты и состав оборудования предназначены
          для предварительной оценки и не заменяют
          рабочее проектирование, проверку исходных
          данных, гидравлический, технологический и
          конструктивный расчёт.
        </p>
      </div>
    </main>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        color: "#657983",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "2px",
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={metric}>
      <div style={smallLabel}>
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: accent
            ? "#00d9ff"
            : "#f4f7f8",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LoadCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={loadCard}>
      <div style={smallLabel}>
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        {value > 0
          ? value.toFixed(2)
          : "—"}
      </div>
    </div>
  );
}

function CalculationItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={calculationItem}>
      <div style={smallLabel}>
        {label}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: accent
            ? "#00d9ff"
            : "#f4f7f8",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const eyebrow: CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "3px",
  marginBottom: 20,
};

const title: CSSProperties = {
  margin: 0,
  fontSize: "clamp(42px, 6vw, 72px)",
  lineHeight: 1.02,
  letterSpacing: "-3px",
  fontWeight: 800,
};

const lead: CSSProperties = {
  marginTop: 25,
  marginBottom: 50,
  color: "#8ca4ad",
  fontSize: 18,
  lineHeight: 1.7,
  maxWidth: 820,
};

const card: CSSProperties = {
  border: "1px solid #1c3742",
  borderRadius: 14,
  background: "#081b24",
  padding: 30,
  marginBottom: 24,
};

const metricGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const metric: CSSProperties = {
  padding: 20,
  border: "1px solid #1c3742",
  background: "#0a2029",
  borderRadius: 9,
};

const smallLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: 10,
};

const loadGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const loadCard: CSSProperties = {
  padding: 18,
  border: "1px solid #172f39",
  background: "#071a23",
  borderRadius: 8,
};

const modelBox: CSSProperties = {
  padding: 22,
  border: "1px solid #1c4d5c",
  background: "#08232d",
  borderRadius: 10,
  marginBottom: 15,
};

const modelName: CSSProperties = {
  color: "#00d9ff",
  fontSize: 22,
  fontWeight: 800,
};

const modelDescription: CSSProperties = {
  color: "#8ca4ad",
  lineHeight: 1.7,
  margin: "10px 0 0",
};

const engineeringCalculation: CSSProperties = {
  padding: 22,
  border: "1px solid #1c4d5c",
  background: "#071a23",
  borderRadius: 10,
};

const calculationGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const calculationItem: CSSProperties = {
  padding: 18,
  border: "1px solid #1c3742",
  background: "#0a2029",
  borderRadius: 8,
};

const inputBox: CSSProperties = {
  marginTop: 16,
  padding: 22,
  border: "1px solid #1c3742",
  background: "#071a23",
  borderRadius: 10,
};

const inputLabel: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 10,
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: 260,
  height: 50,
  boxSizing: "border-box",
  border: "1px solid #29444e",
  borderRadius: 7,
  background: "#0a2029",
  color: "#fff",
  padding: "0 15px",
  fontSize: 16,
};

const formula: CSSProperties = {
  marginTop: 15,
  color: "#657983",
  fontSize: 12,
  lineHeight: 1.7,
};

const planFrame: CSSProperties = {
  overflowX: "auto",
  border: "1px solid #1c3742",
  borderRadius: 10,
  padding: 15,
  background:
    "radial-gradient(circle at center, #0c2732 0%, #071922 70%)",
};

const equipmentRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "55px 1fr",
  gap: 15,
  alignItems: "center",
  padding: 18,
  border: "1px solid #1c3742",
  background: "#0a2029",
  borderRadius: 8,
};

const equipmentNumber: CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
};

const equipmentName: CSSProperties = {
  fontSize: 16,
  fontWeight: 750,
};

const equipmentNote: CSSProperties = {
  color: "#657983",
  fontSize: 12,
  marginTop: 5,
};

const process: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
};

const processItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const processBox: CSSProperties = {
  border: "1px solid #244652",
  background: "#0a2029",
  borderRadius: 7,
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 650,
};

const processArrow: CSSProperties = {
  color: "#00d9ff",
  fontSize: 18,
};

const actions: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 30,
};

const primaryButton: CSSProperties = {
  padding: "16px 26px",
  border: 0,
  borderRadius: 6,
  background: "#f5f8fa",
  color: "#06151d",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButton: CSSProperties = {
  padding: "16px 24px",
  border: "1px solid #29444e",
  borderRadius: 6,
  background: "transparent",
  color: "#f4f7f8",
  fontWeight: 700,
  cursor: "pointer",
};

const backButton: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#dce8ee",
  fontSize: 15,
  cursor: "pointer",
  padding: 0,
  marginBottom: 25,
};

const disclaimer: CSSProperties = {
  marginTop: 40,
  color: "#536871",
  fontSize: 12,
  lineHeight: 1.7,
  maxWidth: 900,
};

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}