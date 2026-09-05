"use client";

import React, { CSSProperties, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandHeader from "../../../components/BrandHeader";
import BrandFooter from "../../../components/BrandFooter";
import {
  calculateTechnology,
  type TechnologyCode,
} from "../../../../calculations/technology";
import { calculateMBR } from "../../../../calculations/mbr";
import { calculateUASB } from "../../../../calculations/uasb";
import { calculateABR } from "../../../../calculations/abr";
import {
  KMK_2_04_03_19_DOC,
  AEROTANK,
  BOD5_TO_BODFULL,
  DISINFECTION,
  PRIMARY_SETTLING,
  SLUDGE,
  BIO_INLET_LIMITS,
  kMaxByDailyFlow,
} from "../../../../norms/kmk-2-04-03-19";

/**
 * Требования ҚМҚ 2.04.03-19 к обеззараживанию, числу сооружений и осадку.
 * Те же формулы и пункты, что на шаге «Оборудование» (equipment/page.tsx).
 */
function kmkRequirements(
  technology: Technology,
  flow: number,
  qPeak: number,
  bod: number,
  tss: number,
) {
  if (!Number.isFinite(flow) || flow <= 0) return null;
  const aerobic = ["CAS", "IFAS", "MBBR", "SBR", "MBR"].includes(technology);
  const withSecondarySettling = ["CAS", "IFAS", "MBBR"].includes(technology);
  const chlorDose = DISINFECTION.chlorineDose.afterBio; // п. 6.230
  const chlorKgDay = (flow * chlorDose) / 1000;
  const chlorStorageKgDay = chlorKgDay * DISINFECTION.chlorineDose.storageFactor;
  const contactFlow = qPeak > 0 ? qPeak : flow / 24;
  const contactVolume = (contactFlow * DISINFECTION.contactMinutes.value) / 60; // п. 6.235
  const g = AEROTANK.sludgeGrowth; // ф. (67)
  const bodFullIn = bod > 0 ? bod / BOD5_TO_BODFULL : 0;
  const sludgeGrowthMgL = g.ssFactor * tss + g.bodFactorMunicipal * bodFullIn;
  const sludgeKgDay = (flow * sludgeGrowthMgL) / 1000;
  const sludgeDesignKgDay = sludgeKgDay * g.designFactor;
  const fp = SLUDGE.dewatering.activatedSludgeCake.filterPress; // табл. 69
  const cakeT = [sludgeKgDay / 1000 / (1 - fp[1] / 100), sludgeKgDay / 1000 / (1 - fp[0] / 100)];
  return {
    aerobic,
    withSecondarySettling,
    chlorDose,
    chlorKgDay,
    chlorStorageKgDay,
    contactVolume,
    sludgeGrowthMgL,
    sludgeKgDay,
    sludgeDesignKgDay,
    cakeT,
  };
}

type Technology = TechnologyCode;

type Calc = {
  volume: number;
  hydraulicVolume: number;
  organicVolume: number;
  removedLoad: number;
  [key: string]: any;
};

const TECH_INFO: Record<
  Technology,
  {
    title: string;
    description: string;
    hrt: number;
    equipment: string[];
  }
> = {
  ANBR: {
    title: "Анаэробный биореактор",
    description:
      "Предварительный расчёт анаэробного биореактора с оценкой органической нагрузки и образования биогаза.",
    hrt: 12,
    equipment: [
      "ANBR-реактор",
      "Система сбора биогаза",
      "Насосное оборудование",
      "Распределительная система",
    ],
  },

  UASB: {
    title: "Анаэробный реактор с восходящим потоком",
    description:
      "Предварительный расчёт UASB по гидравлической и органической нагрузке.",
    hrt: 8,
    equipment: [
      "UASB-реактор",
      "Газосепаратор",
      "Система сбора биогаза",
      "Распределительная система",
    ],
  },

  ABR: {
    title: "Анаэробный перегородочный реактор",
    description:
      "Предварительный расчёт многокамерного ABR с распределением объёма по камерам.",
    hrt: 12,
    equipment: [
      "ABR-реактор",
      "Перегородки",
      "Система отвода биогаза",
      "Насосное оборудование",
    ],
  },

  AnMBR: {
    title: "Анаэробный мембранный биореактор",
    description:
      "Предварительный расчёт анаэробного реактора и площади мембран.",
    hrt: 10,
    equipment: [
      "AnMBR-реактор",
      "Мембранные модули",
      "Система рециркуляции",
      "Система сбора биогаза",
    ],
  },

  IFAS: {
    title: "Интегрированная система с носителями биомассы",
    description:
      "Предварительный расчёт аэробной системы IFAS с прикреплённой биомассой.",
    hrt: 8,
    equipment: [
      "IFAS-реактор",
      "Носители биомассы",
      "Воздуходувки",
      "Мелкопузырчатая аэрация",
    ],
  },

  CAS: {
    title: "Классический активный ил",
    description:
      "Предварительный расчёт аэротенка с активным илом, F/M и аэрацией.",
    hrt: 8,
    equipment: [
      "Аэротенк",
      "Вторичный отстойник",
      "Воздуходувки",
      "Система возвратного ила",
    ],
  },

  MBBR: {
    title: "Биореактор с подвижной загрузкой",
    description:
      "Предварительный расчёт MBBR с носителями биоплёнки, секциями и аэрацией.",
    hrt: 8,
    equipment: [
      "MBBR-реактор",
      "Носители биоплёнки",
      "Воздуходувки",
      "Диффузоры",
      "Система удержания загрузки",
    ],
  },

  SBR: {
    title: "Последовательный биологический реактор",
    description:
      "Предварительный расчёт SBR с циклическим режимом работы.",
    hrt: 8,
    equipment: [
      "SBR-реакторы",
      "Воздуходувки",
      "Система аэрации",
      "Автоматика",
      "Насосы",
    ],
  },

  MBR: {
    title: "Мембранный биореактор",
    description:
      "Предварительный расчёт MBR с биореактором и мембранным разделением.",
    hrt: 8,
    equipment: [
      "MBR-реактор",
      "Мембранные модули",
      "Воздуходувки",
      "Насосы рециркуляции",
      "Система промывки мембран",
    ],
  },

  OTHER: {
    title: "Индивидуальная технологическая схема",
    description:
      "Расчётная модель выбирается после уточнения технологического процесса.",
    hrt: 8,
    equipment: ["Технологический блок"],
  },
};

function num(v: string | null, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function f(v: number, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}

/**
 * Финальная ведомость оборудования для Complete.
 * Использует те же расчётные значения, которые уже сформированы
 * в calc, и не меняет расчётную математику.
 */
function buildFinalEquipment(
  baseEquipment: any[],
  technology: Technology,
  calc: any
) {
  const base = Array.isArray(baseEquipment) ? baseEquipment : [];

  return base.map((item: any) => {
    const position = String(item?.position ?? "");
    const key = position.toLowerCase();

    let quantity = item?.quantity ?? "по расчёту";
    let parameter = item?.parameter ?? "Уточняется на стадии рабочего проекта";
    const status = item?.status ?? "PRELIMINARY";

    if (
      (key.includes("мембран") || key.includes("membrane")) &&
      (technology === "MBR" || technology === "AnMBR") &&
      Number(calc?.membraneArea) > 0
    ) {
      const modules = Math.max(1, Math.ceil(Number(calc.membraneArea) / 40));
      quantity = `${modules} шт.`;
      parameter = `Площадь мембран ${f(Number(calc.membraneArea), 1)} м²; flux ${f(Number(calc.membraneFlux), 0)} LMH`;
    }

    if (
      (key.includes("носител") || key.includes("загруз")) &&
      (technology === "MBBR" || technology === "IFAS") &&
      Number(calc?.mediaVolume) > 0
    ) {
      quantity = `${f(Number(calc.mediaVolume), 1)} м³`;
      parameter = `Заполнение ${f(Number(calc.fill) * 100, 0)}%; расчётный объём загрузки`;
    }

    if (
      key.includes("реактор") &&
      (technology === "MBBR" || technology === "IFAS") &&
      Number(calc?.volume) > 0
    ) {
      quantity = `${Math.max(1, Number(calc.sections) || 1)} секц.`;
      parameter = `Общий расчётный объём ${f(Number(calc.volume), 1)} м³; ${f(Number(calc.volumePerSection), 1)} м³/секцию`;
    }

    if (
      key.includes("sbr") &&
      technology === "SBR" &&
      Number(calc?.sections) > 0
    ) {
      quantity = `${Math.max(1, Number(calc.sections))} шт.`;
      parameter = `Рабочий объём ${f(Number(calc.reactorVolume), 1)} м³/реактор`;
    }

    if (
      (key.includes("декан") || key.includes("decan")) &&
      technology === "SBR" &&
      Number(calc?.decantFlow) > 0
    ) {
      quantity = `${Math.max(1, Number(calc.sections) || 1)} шт.`;
      parameter = `Расход при декантации ${f(Number(calc.decantFlow), 1)} м³/ч`;
    }

    if (
      key.includes("воздух") || key.includes("blower") || key.includes("blower")
    ) {
      if (Number(calc?.air) > 0) {
        const working = Math.max(1, Number(calc?.sections) || 2);
        quantity = `${working} рабочих + 1 резервная`;
        parameter = `Общий расход воздуха ${f(Number(calc.air), 0)} Нм³/ч`;
      }
    }

    if (
      (key.includes("диффуз") || key.includes("аэра")) &&
      Number(calc?.air) > 0
    ) {
      const diffusers = Math.max(1, Math.ceil(Number(calc.air) / 5));
      quantity = `${diffusers} шт.`;
      parameter = `Предварительно: ${f(Number(calc.air), 0)} Нм³/ч воздуха`;
    }

    if (
      key.includes("насос") &&
      Number(calc?.qPeak) > 0
    ) {
      quantity = quantity || "по расчёту";
      parameter = `Расчётный пиковый расход ${f(Number(calc.qPeak), 2)} м³/ч`;
    }

    return {
      ...item,
      quantity,
      parameter,
      status,
    };
  });
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



function PrintIcon({ children }: { children: React.ReactNode }) {
  return <span className="pdf-icon">{children}</span>;
}

function PrintHeader({
  reportNumber,
  reportDate,
  page,
}: {
  reportNumber: string;
  reportDate: string;
  page: number;
}) {
  return (
    <div className="pdf-header">
      <div className="pdf-brand">
        <img src="/suvsanoat-logo.png" alt="SUVSANOAT" />
        <span>SUVSANOAT<br /><small>ENGINEERING SYSTEMS</small></span>
      </div>
      <div className="pdf-header-title">ИНЖЕНЕРНЫЙ РАСЧЁТ</div>
      <div className="pdf-header-meta">
        №: {reportNumber}<br />
        Дата: {reportDate}
      </div>
    </div>
  );
}

function PrintFooter({ page }: { page: number }) {
  return (
    <div className="pdf-footer">
      <span>www.suvsanoat.uz</span>
      <span>+998 77 304 34 00</span>
      <span>suvsanoat@gmail.com</span>
      <strong>{page} / 8</strong>
    </div>
  );
}

function PrintTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <table className="pdf-table">
      <thead>
        <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintMetric({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="pdf-metric">
      <PrintIcon>{icon}</PrintIcon>
      <div>
        <div className="pdf-metric-label">{label}</div>
        <div className="pdf-metric-value">{value}</div>
        {sub && <div className="pdf-metric-sub">{sub}</div>}
      </div>
    </div>
  );
}

function PrintSection({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pdf-section">
      <h2>{number ? `${number}. ` : ""}{title}</h2>
      {children}
    </section>
  );
}

function PrintDocument({
  objectName,
  flow,
  people,
  hours,
  bod,
  cod,
  tss,
  nitrogen,
  phosphorus,
  technology,
  tech,
  calc,
  detail,
  reportNumber,
  reportDate,
  reportTime,
}: {
  objectName: string;
  flow: number;
  people: number;
  hours: number;
  bod: number;
  cod: number;
  tss: number;
  nitrogen: number;
  phosphorus: number;
  technology: Technology;
  tech: (typeof TECH_INFO)[Technology];
  calc: any;
  detail: { label: string; value: string }[];
  reportNumber: string;
  reportDate: string;
  reportTime: string;
}) {
  const equipment = buildFinalEquipment(
    calc.result.equipment || [],
    technology,
    calc
  );
  const assumptions = calc.result.assumptions || [];
  const kmk = kmkRequirements(technology, flow, Number(calc.qPeak) || 0, bod, tss);

  const specializedRows = detail.map((r) => [r.label, r.value]);

  return (
    <div className="print-document">
      {/* 1 — COVER */}
      <div className="pdf-page pdf-cover">
        <div>
          <div className="pdf-cover-top">
            <img src="/suvsanoat-logo.png" alt="SUVSANOAT" />
            <div className="pdf-contact">
              <div>◎ &nbsp; www.suvsanoat.uz</div>
              <div>⌕ &nbsp; +998 77 304 34 00</div>
              <div>✉ &nbsp; suvsanoat@gmail.com</div>
            </div>
          </div>

          <div className="pdf-cover-title">
            <h1>ИНЖЕНЕРНЫЙ РАСЧЁТ</h1>
            <h3>ОЧИСТНЫХ СООРУЖЕНИЙ СТОЧНЫХ ВОД</h3>
            <div className="pdf-blue-line" />
          </div>

          <div className="pdf-cover-grid">
            <PrintMetric icon="▥" label="ОБЪЕКТ" value={objectName} />
            <PrintMetric icon="♢" label="ПРОИЗВОДИТЕЛЬНОСТЬ" value={`${f(flow, 1)} м³/сут`} />
            <PrintMetric icon="⚙" label="ТЕХНОЛОГИЯ" value={technology} sub={tech.title} />
            <PrintMetric icon="▤" label="НОМЕР РАСЧЁТА" value={reportNumber} />
            <PrintMetric icon="▦" label="ДАТА" value={reportDate} />
            <PrintMetric icon="◷" label="ВРЕМЯ" value={reportTime} />
          </div>

          <div className="pdf-status">
            <PrintIcon>✓</PrintIcon>
            <div>
              <div className="pdf-metric-label">СТАТУС ДОКУМЕНТА</div>
              <strong>Предварительное инженерное решение</strong>
              <p>Данный расчёт является предварительным и требует подтверждения рабочим технологическим расчётом.</p>
            </div>
          </div>
        </div>

        <div className="pdf-cover-bottom">
          <strong>РАСЧЁТ ВЫПОЛНЕН</strong>
          <b>SUVSANOAT ENGINEERING SYSTEMS</b>
        </div>
        <PrintFooter page={1} />
      </div>

      {/* 2 — INPUT DATA */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={2} />
        <PrintSection number="1" title="ИСХОДНЫЕ ДАННЫЕ">
          <PrintTable
            columns={["Параметр", "Значение"]}
            rows={[
              ["Объект", objectName],
              ["Производительность", `${f(flow, 1)} м³/сут`],
              ["Количество людей", people ? `${people} чел.` : "—"],
              ["Режим работы", `${hours} ч/сут`],
              ["Температура сточных вод (принято)", `20 °C (ф. (51) ҚМҚ 2.04.03-19 — базис 15 °C; п. 6.2: ${BIO_INLET_LIMITS.tempMinC}–${BIO_INLET_LIMITS.tempMaxC} °C на входе в биологию)`],
              ["Технология", technology],
            ]}
          />
        </PrintSection>

        <PrintSection number="2" title="ГИДРАВЛИЧЕСКИЙ РАСЧЁТ">
          <PrintTable
            columns={["Параметр", "Обозначение", "Значение", "Единицы"]}
            rows={[
              ["Производительность", "Qсут", f(flow, 2), "м³/сут"],
              ["Производительность", "Qчас", f(calc.qHour, 2), "м³/ч"],
              [`Максимальный расход (K gen.max = ${f(calc.kGenMax, 2)}, п. 2.7, табл. 2)`, "Qmax", f(calc.qPeak, 2), "м³/ч"],
              ["Время удержания (HRT)", "HRT", f(tech.hrt, 2), "ч"],
              ["Необходимый объём", "Vreq", f(calc.volume, 2), "м³"],
              ["Рабочий объём", "Vwork", f(calc.volume * 1.10, 2), "м³"],
              ["Рабочий объём с запасом 10%", "Vtot", f(calc.volume * 1.10, 2), "м³"],
            ]}
          />
        </PrintSection>

        <PrintSection number="3" title="ХАРАКТЕРИСТИКИ СТОЧНЫХ ВОД">
          <PrintTable
            columns={["Параметр", "Концентрация", "Единицы"]}
            rows={[
              ["БПК₅", f(bod, 1), "мг/л"],
              ["COD", f(cod, 1), "мг/л"],
              ["Взвешенные вещества (TSS)", f(tss, 1), "мг/л"],
              ["Общий азот (N)", f(nitrogen, 1), "мг/л"],
              ["Общий фосфор (P)", f(phosphorus, 1), "мг/л"],
            ]}
          />
        </PrintSection>
        <PrintFooter page={2} />
      </div>

      {/* 3 — SPECIALIZED */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={3} />
        <PrintSection number="4" title={`СПЕЦИАЛИЗИРОВАННЫЙ РАСЧЁТ ${technology}`}>
          <div className="pdf-formula">
            <span>ОСНОВНОЙ ПРИНЦИП</span>
            <strong>
              {technology === "MBBR"
                ? "Vрасч = max(Vгидр, Vорганика, Vпо загрузке)"
                : technology === "SBR"
                ? "Vрасч = Vцикла × число реакторов / рабочая доля"
                : technology === "UASB"
                ? "Vрасч = max(Vгидр, Vпо ХПК); A = Qпик / vup"
                : technology === "ABR"
                ? "Vрасч = max(Vгидр, Vпо органической нагрузке)"
                : technology === "MBR" || technology === "AnMBR"
                ? "Vреактора + Aмембран = f(Q, HRT, поток)"
                : technology === "CAS"
                ? "Vрасч = max(Vгидр, Vпо F/M и MLSS)"
                : technology === "IFAS"
                ? "Vрасч = max(Vгидр, Vпо органике) + Vносителей"
                : technology === "ANBR"
                ? "Vрасч = max(Vгидр, Vпо ХПК)"
                : "Vрасч = Vгидр"}
            </strong>
            <p>
              Итоговый объём: <b>{f(calc.volume)} м³</b>.
              С ориентировочным запасом 15%: <b>{f(calc.recommended)} м³</b>.
            </p>
          </div>
          {specializedRows.length > 0 ? (
            <PrintTable columns={["Параметр", "Значение"]} rows={specializedRows} />
          ) : (
            <div className="pdf-empty">Специализированные параметры отсутствуют.</div>
          )}
        </PrintSection>

        <PrintSection title="ИТОГОВЫЕ РАСЧЁТНЫЕ ПОКАЗАТЕЛИ">
          <div className="pdf-highlight-grid">
            <PrintMetric icon="◈" label="РАСЧЁТНЫЙ ОБЪЁМ" value={`${f(calc.volume)} м³`} />
            <PrintMetric icon="◈" label="ОБЪЁМ +15%" value={`${f(calc.recommended)} м³`} />
            <PrintMetric icon="▥" label="СЕКЦИИ / РЕАКТОРЫ" value={`${calc.sections} шт.`} />
            <PrintMetric icon="□" label="ОБЪЁМ / СЕКЦИЮ" value={`${f(calc.volumePerSection)} м³`} />
          </div>
        </PrintSection>
        <PrintFooter page={3} />
      </div>

      {/* 4 — ENGINEERING PARAMETERS */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={4} />
        <PrintSection number="5" title="ИНЖЕНЕРНЫЕ ПАРАМЕТРЫ">
          <PrintTable
            columns={["Параметр", "Значение", "Единицы"]}
            rows={[
              ["Расчётный объём", f(calc.volume), "м³"],
              ["Объём с запасом +15%", f(calc.recommended), "м³"],
              ["Секции / реакторы", String(calc.sections), "шт."],
              ["Объём / секцию", f(calc.volumePerSection), "м³"],
              ...(calc.tankDepth > 0 ? [["Рабочая глубина", f(calc.tankDepth), "м"]] : []),
              ...(calc.planArea > 0 ? [["Площадь / секцию", f(calc.planArea), "м²"]] : []),
              ...((technology === "MBBR" || technology === "IFAS")
                ? [
                    ["Заполнение носителями", `${f(calc.fill * 100, 0)} %`, "%"],
                    ["Объём носителей", f(calc.mediaVolume), "м³"],
                  ]
                : []),
              ...((technology === "MBR" || technology === "AnMBR")
                ? [
                    ["Мембранный поток", `${f(calc.membraneFlux, 0)} LMH`, "LMH"],
                    ["Площадь мембран", f(calc.membraneArea), "м²"],
                    ["Мембранные модули", String(Math.max(1, Math.ceil(calc.membraneArea / 40))), "шт."],
                  ]
                : []),
            ]}
          />
        </PrintSection>

        <PrintSection number="6" title="ПРЕДВАРИТЕЛЬНЫЕ ГАБАРИТЫ">
          <div className="pdf-dimension-box">
            <div><span>РАБОЧАЯ ГЛУБИНА</span><b>{f(calc.tankDepth)} м</b></div>
            <div><span>ПЛОЩАДЬ / СЕКЦИЮ</span><b>{f(calc.planArea)} м²</b></div>
            <div><span>ОБЩИЙ ОБЪЁМ</span><b>{f(calc.recommended)} м³</b></div>
          </div>
          <p className="pdf-note">
            Габариты являются предварительными. Окончательные размеры сооружений
            определяются рабочим проектированием с учётом конструктивной схемы,
            высотных отметок, свободного борта и оборудования.
          </p>
        </PrintSection>
        <PrintFooter page={4} />
      </div>

      {/* 5 — PROCESS SYSTEMS */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={5} />
        {(technology === "MBBR" || technology === "IFAS" || technology === "CAS" || technology === "SBR" || technology === "MBR") && (
          <PrintSection number="7" title="ПРЕДВАРИТЕЛЬНАЯ АЭРАЦИЯ">
            <PrintTable
              columns={["Параметр", "Значение", "Единицы"]}
              rows={[
                [`Потребность в O₂ (q_O = ${AEROTANK.air.qO.toBod15_20} кг/кг БПКполн, п. 6.156)`, f(calc.oxygen), "кг O₂/сут"],
                ["Расход воздуха (ф. (70), п. 6.156)", f(calc.air, 0), "Нм³/ч"],
                ["Рабочие воздуходувки", "2", "шт."],
                ["Резерв (п. 5.29: до 3 рабочих — 1)", "1", "шт."],
                ["Диффузоры (5 м³/ч на диффузор — практика)", String(Math.max(1, Math.ceil(calc.air / 5))), "шт."],
              ]}
            />
          </PrintSection>
        )}

        {(technology === "ANBR" || technology === "UASB" || technology === "ABR" || technology === "AnMBR") && (
          <PrintSection number="8" title="АНАЭРОБНЫЙ БАЛАНС">
            <PrintTable
              columns={["Параметр", "Значение", "Единицы"]}
              rows={[
                ["Снятая ХПК", f(calc.removedCod), "кг/сут"],
                ["Биогаз", f(calc.biogas), "м³/сут"],
                ["Метан, ориентир", f(calc.methane), "м³/сут"],
              ]}
            />
          </PrintSection>
        )}

        {(technology === "MBR" || technology === "AnMBR") && (
          <PrintSection title="МЕМБРАННЫЙ РАСЧЁТ">
            <PrintTable
              columns={["Параметр", "Значение", "Единицы"]}
              rows={[
                ["Мембранный поток", f(calc.membraneFlux, 0), "LMH"],
                ["Площадь мембран", f(calc.membraneArea), "м²"],
                ["Площадь с запасом", f(calc.result.specialized.find((m:any) => m.key === "membraneAreaWithReserve")?.value ?? calc.membraneArea), "м²"],
                ["Модули", String(Math.max(1, Math.ceil(calc.membraneArea / 40))), "шт."],
                ["Площадь модуля", "40", "м²"],
              ]}
            />
          </PrintSection>
        )}

        {kmk && (
          <PrintSection title={`ТРЕБОВАНИЯ ${KMK_2_04_03_19_DOC.code}: ОБЕЗЗАРАЖИВАНИЕ, СООРУЖЕНИЯ, ОСАДОК`}>
            <PrintTable
              columns={["Параметр", "Значение", "Основание"]}
              rows={[
                ["Доза активного хлора после биологической очистки", `${kmk.chlorDose} г/м³ · ${f(kmk.chlorKgDay)} кг/сут`, DISINFECTION.chlorineDose.ref],
                ["Хлорное хозяйство (×1,5 дозы)", `${f(kmk.chlorStorageKgDay)} кг/сут`, DISINFECTION.chlorineDose.ref],
                ["Контактные резервуары", `≥ ${DISINFECTION.contactTanksMin.value} шт., ${f(kmk.contactVolume, 1)} м³ (${DISINFECTION.contactMinutes.value} мин при Qmax)`, `${DISINFECTION.contactMinutes.ref}; ${DISINFECTION.contactTanksMin.ref}`],
                ...(kmk.withSecondarySettling
                  ? [["Вторичные отстойники", `≥ ${PRIMARY_SETTLING.minSecondary.value} шт. (при минимальном числе V ×${PRIMARY_SETTLING.minCountVolumeFactor.value[0]}–${PRIMARY_SETTLING.minCountVolumeFactor.value[1]})`, PRIMARY_SETTLING.minSecondary.ref]]
                  : []),
                ...(kmk.aerobic
                  ? [
                      ["Прирост активного ила P_i = 0,8·C_cdp + 0,3·L_en", `${f(kmk.sludgeGrowthMgL, 0)} мг/л · ${f(kmk.sludgeKgDay, 1)} кг с.в./сут`, AEROTANK.sludgeGrowth.ref],
                      ["Ил на уплотнители и перекачку (×1,3)", `${f(kmk.sludgeDesignKgDay, 1)} кг с.в./сут`, AEROTANK.sludgeGrowth.ref],
                      ["Кек фильтр-пресса (влажность 80–83 %)", `${f(kmk.cakeT[0])}–${f(kmk.cakeT[1])} т/сут`, SLUDGE.dewatering.ref],
                    ]
                  : []),
              ]}
            />
          </PrintSection>
        )}

        <div className="pdf-callout">
          <b>Примечание.</b> Все параметры данной страницы являются предварительными
          инженерными значениями и подлежат подтверждению рабочим проектированием.
          HRT по технологиям, параметры MBBR/SBR/MBR (OLR, заполнение, flux, цикл),
          анаэробные реакторы и выход биогаза не нормируются {KMK_2_04_03_19_DOC.code};
          приняты по DWA/практике.
        </div>
        <PrintFooter page={5} />
      </div>

      {/* 6 — ASSUMPTIONS */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={6} />
        <PrintSection number="9" title="ДОПУЩЕНИЯ РАСЧЁТА">
          <div className="pdf-list">
            {assumptions.length ? assumptions.map((item: string, i: number) => (
              <div key={i}><span>{String(i + 1).padStart(2, "0")}</span>{item}</div>
            )) : <div><span>01</span>Расчёт выполнен по исходным данным, переданным пользователем.</div>}
          </div>
        </PrintSection>

        <PrintSection number="10" title="ОГРАНИЧЕНИЯ РАСЧЁТА">
          <div className="pdf-callout">
            Результат является предварительным инженерным решением. Расчётные значения
            и коэффициенты не являются рабочим проектом и должны быть проверены
            технологом, гидравликом, конструктором и поставщиком оборудования.
          </div>
          <div className="pdf-check-grid">
            <div>✓ Исходные данные</div>
            <div>✓ Технологическая схема</div>
            <div>✓ Гидравлика</div>
            <div>✓ Оборудование</div>
            <div>□ Конструктивный расчёт</div>
            <div>□ Электрическая часть</div>
          </div>
        </PrintSection>

        <PrintFooter page={6} />
      </div>

      {/* 7 — EQUIPMENT */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={7} />
        <PrintSection number="11" title="РЕКОМЕНДУЕМЫЙ СОСТАВ ОБОРУДОВАНИЯ">
          <div className="pdf-equipment">
            {equipment.map((item: any, i: number) => (
              <div className="pdf-equipment-row" key={`${item.position}-${i}`}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <div>
                  <strong>{item.position}</strong>
                  <span>Количество: {item.quantity}</span>
                  <small>Параметр: {item.parameter}. Статус: {item.status}.</small>
                </div>
              </div>
            ))}
          </div>
        </PrintSection>
        <div className="pdf-callout">
          Состав оборудования является предварительным. Марки, производительность,
          резервирование и окончательные спецификации уточняются на стадии рабочего проекта.
        </div>
        <PrintFooter page={7} />
      </div>

      {/* 8 — PROCESS SCHEME */}
      <div className="pdf-page">
        <PrintHeader reportNumber={reportNumber} reportDate={reportDate} page={8} />
        <PrintSection number="12" title="ПРЕДВАРИТЕЛЬНАЯ ТЕХНОЛОГИЧЕСКАЯ СХЕМА">
          <div className="pdf-flow">
            <div>ПРИЁМ<br />СТОЧНЫХ ВОД</div>
            <span>→</span>
            <div className="active">{technology}<small>{f(calc.volume, 1)} м³</small></div>
            <span>→</span>
            <div>РАЗДЕЛЕНИЕ<br />/ ДОЧИСТКА</div>
            <span>→</span>
            <div>ОЧИЩЕННАЯ<br />ВОДА</div>
          </div>
        </PrintSection>

        <PrintSection title="ЗАКЛЮЧЕНИЕ">
          <div className="pdf-conclusion">
            <h3>Предварительное инженерное решение</h3>
            <p>
              Для объекта <b>{objectName}</b> с производительностью{" "}
              <b>{f(flow, 1)} м³/сут</b> рассмотрена технология <b>{technology}</b>.
              Расчётный объём системы составляет <b>{f(calc.volume)} м³</b>,
              рекомендуемый объём с запасом — <b>{f(calc.recommended)} м³</b>.
            </p>
            <p>
              Настоящий документ предназначен для предварительной инженерной оценки,
              подготовки коммерческого предложения и дальнейшего рабочего проектирования.
            </p>
          </div>
        </PrintSection>

        <div className="pdf-sign">
          <span>РАСЧЁТ ВЫПОЛНЕН</span>
          <b>SUVSANOAT ENGINEERING SYSTEMS</b>
          <small>{reportNumber} · {reportDate}</small>
        </div>

        <PrintFooter page={8} />
      </div>
    </div>
  );
}

function CompleteContent() {
  const router = useRouter();
  const params = useSearchParams();

  const rawTechnology = (params.get("technology") || "MBBR") as Technology;

  const allowedTechnologies: Technology[] = [
    "MBBR",
    "SBR",
    "MBR",
    "ANBR",
    "UASB",
    "ABR",
    "AnMBR",
    "IFAS",
    "CAS",
    "OTHER",
  ];

  const technology = allowedTechnologies.includes(rawTechnology)
    ? rawTechnology
    : "MBBR";

  const tech = TECH_INFO[technology] || TECH_INFO.MBBR;

  const reportDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("ru-RU");
  }, []);

  const reportTime = useMemo(() => {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
  }, []);

  const reportNumber = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `SUV-${y}${m}${day}-${h}${min}`;
  }, []);

  const objectName = params.get("object") || "Объект";
  const flow = num(params.get("flow"));
  const people = num(params.get("people"));
  const hours = Math.max(1, num(params.get("hours"), 24));

  const bod = num(params.get("bod"));
  const cod = num(params.get("cod"));
  const tss = num(params.get("tss"));
  const nitrogen = num(params.get("nitrogen"));
  const phosphorus = num(params.get("phosphorus"));

  const calc = useMemo(() => {
    const result = calculateTechnology({
      technology,
      flowM3Day: flow,
      hoursPerDay: hours,
      bodMgL: bod,
      codMgL: cod,
      tssMgL: tss,
      nitrogenMgL: nitrogen,
      phosphorusMgL: phosphorus,
      people,
    });

    const uasbCalc =
      technology === "UASB"
        ? calculateUASB({
            flowM3Day: flow,
            hrtHours: tech.hrt,
            bodMgL: bod,
            codMgL: cod,
            tssMgL: tss,
            nitrogenMgL: nitrogen,
            phosphorusMgL: phosphorus,
            upflowVelocityMH: 0.8,
            codRemoval: 0.7,
            reactorReserve: 0.15,
            sections: 2,
            gasYieldM3PerKgCodRemoved: 0.35,
            methaneFraction: 0.65,
          })
        : null;

    const abrCalc =
      technology === "ABR"
        ? calculateABR({
            flowM3Day: flow,
            hrtHours: tech.hrt,
            bodMgL: bod,
            codMgL: cod,
            tssMgL: tss,
            nitrogenMgL: nitrogen,
            phosphorusMgL: phosphorus,
            codRemoval: 0.65,
            chambers: 6,
            reactorReserve: 0.15,
            gasYieldM3PerKgCodRemoved: 0.3,
            methaneFraction: 0.65,
          })
        : null;

    const mbrCalc =
      technology === "MBR"
        ? calculateMBR({
            flowM3Day: flow,
            hrtHours: tech.hrt,
            bodMgL: bod,
            codMgL: cod,
            tssMgL: tss,
            nitrogenMgL: nitrogen,
            phosphorusMgL: phosphorus,
            membraneFluxLMH: 15,
            membraneReserve: 0.15,
            reactorReserve: 0.15,
            membraneModuleAreaM2: 40,
          })
        : null;

    const metric = (key: string, fallback = 0): number => {
      if (uasbCalc) {
        const uasbMetrics: Record<string, number> = {
          volume: uasbCalc.reactorVolumeM3,
          volumeWithReserve: uasbCalc.reactorVolumeWithReserveM3,
          organicVolume: uasbCalc.organicVolumeM3,
          sections: uasbCalc.sections,
          reactors: uasbCalc.sections,
          volumePerSection: uasbCalc.volumePerSectionM3,
          upflowVelocity: uasbCalc.upflowVelocityMH,
          area: uasbCalc.reactorAreaM2,
          surfaceArea: uasbCalc.reactorAreaM2,
          biogas: uasbCalc.biogasM3Day,
          methane: uasbCalc.methaneM3Day,
          removedCod: uasbCalc.codRemovedKgDay,
        };

        const value = uasbMetrics[key];

        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
      }

      if (abrCalc) {
        const abrMetrics: Record<string, number> = {
          volume: abrCalc.reactorVolumeM3,
          volumeWithReserve: abrCalc.reactorVolumeWithReserveM3,
          organicVolume: abrCalc.organicVolumeM3,
          sections: abrCalc.chambers,
          reactors: abrCalc.chambers,
          chambers: abrCalc.chambers,
          volumePerSection: abrCalc.volumePerChamberM3,
          chamberVolume: abrCalc.volumePerChamberM3,
          biogas: abrCalc.biogasM3Day,
          methane: abrCalc.methaneM3Day,
          removedCod: abrCalc.codRemovedKgDay,
        };

        const value = abrMetrics[key];

        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
      }

      if (mbrCalc) {
        const mbrMetrics: Record<string, number> = {
          volume: mbrCalc.reactorVolumeM3,
          volumeWithReserve: mbrCalc.reactorVolumeWithReserveM3,
          organicVolume: mbrCalc.reactorVolumeM3,
          sections: 2,
          reactors: 2,
          volumePerSection: mbrCalc.reactorVolumeM3 / 2,
          reactorVolume: mbrCalc.reactorVolumeM3,
          reactorVolumeWithReserve: mbrCalc.reactorVolumeWithReserveM3,
          membraneFlux: mbrCalc.membraneFluxLMH,
          membraneArea: mbrCalc.membraneAreaM2,
          membraneAreaWithReserve: mbrCalc.membraneAreaWithReserveM2,
          membraneModules: mbrCalc.membraneModules,
          oxygen: mbrCalc.oxygenKgDay,
          air: mbrCalc.airNm3H,
          airPerReactor: mbrCalc.airNm3H / 2,
        };

        const value = mbrMetrics[key];

        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
      }

      const item = result.specialized.find((m) => m.key === key);

      return typeof item?.value === "number" &&
        Number.isFinite(item.value)
        ? item.value
        : fallback;
    };

    const qHour = result.hydraulic.qAvg;
    const qAvg = result.hydraulic.qAvg;
    const qPeak = result.hydraulic.qPeak;
    const hydraulic = result.hydraulic.hydraulicVolume;

    const bodLoad = result.loads.bod;
    const codLoad = result.loads.cod;
    const tssLoad = result.loads.tss;
    const nLoad = result.loads.nitrogen;
    const pLoad = result.loads.phosphorus;

    const removedBod = metric(
      "removedBod",
      bodLoad * (technology === "MBR" ? 0.95 : 0.9)
    );

    const removedCod = metric(
      "removedCod",
      codLoad * 0.8
    );

    const volume =
      metric("volume", result.hydraulic.hydraulicVolume) ||
      result.hydraulic.hydraulicVolume;

    const specializedVolumeWithReserve =
      metric("volumeWithReserve");

    const recommended =
      specializedVolumeWithReserve > 0
        ? specializedVolumeWithReserve
        : result.hydraulic.volumeWithReserve || volume * 1.15;

    const organicVolume = metric(
      "organicVolume",
      metric("organicVolume", volume)
    );

    const mediaVolume = metric(
      "carrierVolume",
      metric("mediaVolume")
    );

    const fill =
      metric("filling", metric("fill")) / 100 ||
      (technology === "MBBR"
        ? 0.5
        : technology === "IFAS"
        ? 0.4
        : 0);

    const sections = Math.max(
      1,
      metric(
        "sections",
        metric(
          "reactors",
          technology === "SBR" || technology === "MBR" ? 2 : 1
        )
      )
    );

    const volumePerSection = metric(
      "volumePerSection",
      volume / sections
    );

    const biogas = metric("biogas");
    const methane = metric("methane", biogas * 0.65);

    // Резервный расчёт (если модуль технологии не вернул O₂): q_O = 1,1 кг O₂
    // на кг снятой БПКполн (ҚМҚ 2.04.03-19, п. 6.156); БПК₅ → БПКполн через 0,68.
    const oxygen = metric(
      "oxygen",
      (removedBod / BOD5_TO_BODFULL) * AEROTANK.air.qO.toBod15_20
    );

    const kGenMax = flow > 0 ? kMaxByDailyFlow(flow).kMax : 0;

    const air = metric("air");

    const membraneFlux = metric(
      "membraneFlux",
      technology === "AnMBR" ? 12 : 15
    );

    const membraneArea = metric("membraneArea");

    const upflowVelocity = metric("upflowVelocity");

    const surfaceArea = metric(
      "area",
      metric("surfaceArea")
    );

    const chambers = metric("chambers");

    const chamberVolume = metric(
      "volumePerChamber",
      chambers ? recommended / chambers : 0
    );

    const cyclesPerDay = metric(
      "cycles",
      metric("cyclesPerDay")
    );

    const cycleVolume = metric(
      "volumeCycle",
      metric(
        "cycleVolume",
        cyclesPerDay ? flow / cyclesPerDay : 0
      )
    );

    const fm = metric("fm");
    const mlss = metric("mlss");
    const biomass = metric(
      "sludgeMass",
      metric("biomass")
    );

    const tankDepth =
      technology === "MBBR" || technology === "IFAS"
        ? 3
        : 0;

    const planArea =
      tankDepth > 0
        ? volumePerSection / tankDepth
        : 0;

    const bodRemoval =
      bodLoad > 0 ? removedBod / bodLoad : 0;

    const codRemoval =
      codLoad > 0 ? removedCod / codLoad : 0;

    return {
      flow,
      qHour,
      qAvg,
      qPeak,
      kGenMax,
      hydraulic,
      bodLoad,
      codLoad,
      tssLoad,
      nLoad,
      pLoad,
      removedBod,
      removedCod,
      volume,
      recommended,
      organicVolume,
      mediaVolume,
      fill,
      sections,
      volumePerSection,
      biogas,
      methane,
      oxygen,
      air,
      membraneArea,
      membraneFlux,
      upflowVelocity,
      surfaceArea,
      chambers,
      chamberVolume,
      cyclesPerDay,
      cycleVolume,
      reactorVolume: metric("reactorVolume"),
      reactorVolumeWithReserve: metric(
        "reactorVolumeWithReserve"
      ),
      cycleHours: metric("cycleHours"),
      fillHours: metric("fillHours"),
      reactHours: metric("reactHours"),
      settleHours: metric("settleHours"),
      decantHours: metric("decantHours"),
      idleHours: metric("idleHours"),
      exchangeRatio:
        metric("exchangeRatio") / 100,
      flowPerReactor:
        metric("flowPerReactor"),
      decantFlow:
        metric("decantFlow"),
      airPerReactor:
        metric("airPerReactor"),
      fm,
      mlss,
      biomass,
      tankDepth,
      uasbCalc,
      abrCalc,
      planArea,
      bodRemoval,
      codRemoval,
      result,
    };
  }, [
    technology,
    flow,
    people,
    hours,
    bod,
    cod,
    tss,
    nitrogen,
    phosphorus,
    tech.hrt,
  ]);

  const uasbCalc = calc.uasbCalc;
  const abrCalc = calc.abrCalc;
  const kmkScreen = kmkRequirements(technology, flow, Number(calc.qPeak) || 0, bod, tss);

  const detail = useMemo(() => {
    const rows: { label: string; value: string }[] = [];

    if (technology === "ANBR") {
      rows.push(
        {
          label: "ХПК, нагрузка",
          value: `${f(calc.codLoad)} кг/сут`,
        },
        {
          label: "Снятая ХПК",
          value: `${f(calc.removedCod)} кг/сут`,
        },
        {
          label: "V по органике",
          value: `${f(calc.organicVolume)} м³`,
        },
        {
          label: "Биогаз",
          value: `${f(calc.biogas)} м³/сут`,
        },
        {
          label: "Метан, ориентир",
          value: `${f(calc.methane)} м³/сут`,
        },
        {
          label: "Секции",
          value: `${calc.sections} шт.`,
        }
      );
    }

    if (technology === "UASB") {
      rows.push(
        {
          label: "ХПК, нагрузка",
          value: `${f(calc.codLoad)} кг/сут`,
        },
        {
          label: "Снятая ХПК",
          value: `${f(calc.removedCod)} кг/сут`,
        },
        {
          label: "ХПК после очистки, ориентир",
          value: `${f(
            uasbCalc?.codRemainingKgDay ?? 0
          )} кг/сут`,
        },
        {
          label: "V гидравлический",
          value: `${f(
            uasbCalc?.hydraulicVolumeM3 ??
              calc.hydraulic
          )} м³`,
        },
        {
          label: "V по органике",
          value: `${f(
            uasbCalc?.organicVolumeM3 ??
              calc.organicVolume
          )} м³`,
        },
        {
          label: "Расчётный объём UASB",
          value: `${f(
            uasbCalc?.reactorVolumeM3 ??
              calc.volume
          )} м³`,
        },
        {
          label: "Объём с запасом +15%",
          value: `${f(
            uasbCalc?.reactorVolumeWithReserveM3 ??
              calc.recommended
          )} м³`,
        },
        {
          label: "Восходящая скорость",
          value: `${f(
            uasbCalc?.upflowVelocityMH ??
              calc.upflowVelocity
          )} м/ч`,
        },
        {
          label: "Площадь реактора",
          value: `${f(
            uasbCalc?.reactorAreaM2 ??
              calc.surfaceArea
          )} м²`,
        },
        {
          label: "Площадь / секцию",
          value: `${f(
            uasbCalc?.areaPerSectionM2 ?? 0
          )} м²`,
        },
        {
          label: "Секции",
          value: `${
            uasbCalc?.sections ??
            calc.sections
          } шт.`,
        },
        {
          label: "Объём / секцию",
          value: `${f(
            uasbCalc?.volumePerSectionM3 ??
              calc.volumePerSection
          )} м³`,
        },
        {
          label: "Биогаз, ориентир",
          value: `${f(
            uasbCalc?.biogasM3Day ??
              calc.biogas
          )} м³/сут`,
        },
        {
          label: "Метан, ориентир",
          value: `${f(
            uasbCalc?.methaneM3Day ??
              calc.methane
          )} м³/сут`,
        }
      );
    }

    if (technology === "ABR") {
      rows.push(
        {
          label: "ХПК, нагрузка",
          value: `${f(calc.codLoad)} кг/сут`,
        },
        {
          label: "Снятая ХПК",
          value: `${f(calc.removedCod)} кг/сут`,
        },
        {
          label: "ХПК после очистки, ориентир",
          value: `${f(
            abrCalc?.codRemainingKgDay ?? 0
          )} кг/сут`,
        },
        {
          label: "HRT",
          value: `${f(
            abrCalc?.hrtHours ?? tech.hrt
          )} ч`,
        },
        {
          label: "V гидравлический",
          value: `${f(
            abrCalc?.hydraulicVolumeM3 ??
              calc.hydraulic
          )} м³`,
        },
        {
          label: "V по органике",
          value: `${f(
            abrCalc?.organicVolumeM3 ??
              calc.organicVolume
          )} м³`,
        },
        {
          label: "Расчётный объём ABR",
          value: `${f(
            abrCalc?.reactorVolumeM3 ??
              calc.volume
          )} м³`,
        },
        {
          label: "Объём с запасом +15%",
          value: `${f(
            abrCalc?.reactorVolumeWithReserveM3 ??
              calc.recommended
          )} м³`,
        },
        {
          label: "Камеры",
          value: `${
            abrCalc?.chambers ??
            calc.chambers
          } шт.`,
        },
        {
          label: "Объём / камеру",
          value: `${f(
            abrCalc?.volumePerChamberM3 ??
              calc.chamberVolume
          )} м³`,
        },
        {
          label: "Биогаз, ориентир",
          value: `${f(
            abrCalc?.biogasM3Day ??
              calc.biogas
          )} м³/сут`,
        },
        {
          label: "Метан, ориентир",
          value: `${f(
            abrCalc?.methaneM3Day ??
              calc.methane
          )} м³/сут`,
        }
      );
    }

    if (technology === "AnMBR") {
      rows.push(
        {
          label: "ХПК, нагрузка",
          value: `${f(calc.codLoad)} кг/сут`,
        },
        {
          label: "Снятая ХПК",
          value: `${f(calc.removedCod)} кг/сут`,
        },
        {
          label: "V по органике",
          value: `${f(calc.organicVolume)} м³`,
        },
        {
          label: "Мембранный поток",
          value: `${f(calc.membraneFlux, 0)} LMH`,
        },
        {
          label: "Площадь мембран",
          value: `${f(calc.membraneArea)} м²`,
        },
        {
          label: "Биогаз",
          value: `${f(calc.biogas)} м³/сут`,
        }
      );
    }

    if (technology === "IFAS") {
      rows.push(
        {
          label: "БПК₅, нагрузка",
          value: `${f(calc.bodLoad)} кг/сут`,
        },
        {
          label: "Снятая БПК₅",
          value: `${f(calc.removedBod)} кг/сут`,
        },
        {
          label: "V по органике",
          value: `${f(calc.organicVolume)} м³`,
        },
        {
          label: "Заполнение носителями",
          value: `${f(calc.fill * 100, 0)}%`,
        },
        {
          label: "Носители",
          value: `${f(calc.mediaVolume)} м³`,
        },
        {
          label: "O₂",
          value: `${f(calc.oxygen)} кг O₂/сут`,
        },
        {
          label: "Воздух, концепт",
          value: `${f(calc.air)} Нм³/ч`,
        }
      );
    }

    if (technology === "CAS") {
      rows.push(
        {
          label: "БПК₅, нагрузка",
          value: `${f(calc.bodLoad)} кг/сут`,
        },
        {
          label: "Снятая БПК₅",
          value: `${f(calc.removedBod)} кг/сут`,
        },
        {
          label: "F/M",
          value: `${f(
            calc.fm
          )} кг БПК/(кг ИЛ·сут)`,
        },
        {
          label: "MLSS, допущение",
          value: `${f(calc.mlss)} кг/м³`,
        },
        {
          label: "Биомасса",
          value: `${f(calc.biomass)} кг`,
        },
        {
          label: "V по биомассе",
          value: `${f(calc.organicVolume)} м³`,
        },
        {
          label: "O₂",
          value: `${f(calc.oxygen)} кг O₂/сут`,
        },
        {
          label: "Воздух, концепт",
          value: `${f(calc.air)} Нм³/ч`,
        }
      );
    }

    if (technology === "MBBR") {
      rows.push(
        {
          label: "БПК₅, нагрузка",
          value: `${f(calc.bodLoad)} кг/сут`,
        },
        {
          label: "Снятая БПК₅",
          value: `${f(calc.removedBod)} кг/сут`,
        },
        {
          label: "V гидравлический",
          value: `${f(calc.hydraulic)} м³`,
        },
        {
          label: "V по органике",
          value: `${f(calc.organicVolume)} м³`,
        },
        {
          label: "Носители, расчёт",
          value: `${f(calc.mediaVolume)} м³`,
        },
        {
          label: "V по загрузке",
          value: `${f(
            calc.fill > 0
              ? calc.mediaVolume / calc.fill
              : 0
          )} м³`,
        },
        {
          label: "Заполнение",
          value: `${f(calc.fill * 100, 0)}%`,
        },
        {
          label: "Секции",
          value: `${calc.sections} шт.`,
        },
        {
          label: "V/секцию +15%",
          value: `${f(calc.volumePerSection)} м³`,
        },
        {
          label: "O₂",
          value: `${f(calc.oxygen)} кг O₂/сут`,
        },
        {
          label: "Воздух, концепт",
          value: `${f(calc.air)} Нм³/ч`,
        }
      );
    }

    if (technology === "SBR") {
      rows.push(
        {
          label: "Циклов/сут на реактор",
          value: `${calc.cyclesPerDay}`,
        },
        {
          label: "Продолжительность цикла",
          value: `${f(calc.cycleHours)} ч`,
        },
        {
          label: "Наполнение",
          value: `${f(calc.fillHours)} ч`,
        },
        {
          label: "Аэрация / реакция",
          value: `${f(calc.reactHours)} ч`,
        },
        {
          label: "Отстаивание",
          value: `${f(calc.settleHours)} ч`,
        },
        {
          label: "Декантация",
          value: `${f(calc.decantHours)} ч`,
        },
        {
          label: "Холостой период",
          value: `${f(calc.idleHours)} ч`,
        },
        {
          label: "Обменный объём",
          value: `${f(
            calc.exchangeRatio * 100,
            0
          )}%`,
        },
        {
          label: "Расход на реактор",
          value: `${f(
            calc.flowPerReactor
          )} м³/сут`,
        },
        {
          label: "Декантируемый объём/цикл",
          value: `${f(calc.cycleVolume)} м³`,
        },
        {
          label: "Рабочий объём реактора",
          value: `${f(calc.reactorVolume)} м³`,
        },
        {
          label: "V/реактор с запасом +15%",
          value: `${f(
            calc.reactorVolumeWithReserve
          )} м³`,
        },
        {
          label: "Общий рабочий объём",
          value: `${f(calc.volume)} м³`,
        },
        {
          label: "Реакторы",
          value: `${calc.sections} шт.`,
        },
        {
          label: "Расход при декантации",
          value: `${f(calc.decantFlow)} м³/ч`,
        },
        {
          label: "O₂",
          value: `${f(calc.oxygen)} кг O₂/сут`,
        },
        {
          label: "Воздух общий",
          value: `${f(calc.air)} Нм³/ч`,
        },
        {
          label: "Воздух/реактор",
          value: `${f(calc.airPerReactor)} Нм³/ч`,
        }
      );
    }

    if (technology === "MBR") {
      rows.push(
        {
          label: "БПК₅, нагрузка",
          value: `${f(calc.bodLoad)} кг/сут`,
        },
        {
          label: "Снятая БПК₅",
          value: `${f(calc.removedBod)} кг/сут`,
        },
        {
          label: "ХПК, нагрузка",
          value: `${f(calc.codLoad)} кг/сут`,
        },
        {
          label: "Взвешенные вещества",
          value: `${f(calc.tssLoad)} кг/сут`,
        },
        {
          label: "V биореактора",
          value: `${f(calc.reactorVolume)} м³`,
        },
        {
          label: "V биореактора +15%",
          value: `${f(
            calc.reactorVolumeWithReserve
          )} м³`,
        },
        {
          label: "Секции биореактора",
          value: `${calc.sections} шт.`,
        },
        {
          label: "V/секцию",
          value: `${f(calc.volumePerSection)} м³`,
        },
        {
          label: "Мембранный поток",
          value: `${f(calc.membraneFlux, 0)} LMH`,
        },
        {
          label: "Площадь мембран",
          value: `${f(calc.membraneArea)} м²`,
        },
        {
          label: "Мембранные модули",
          value: `${Math.max(
            1,
            Math.ceil(calc.membraneArea / 40)
          )} шт.`,
        },
        {
          label: "O₂",
          value: `${f(calc.oxygen)} кг O₂/сут`,
        },
        {
          label: "Воздух общий",
          value: `${f(calc.air)} Нм³/ч`,
        },
        {
          label: "Воздух/реактор",
          value: `${f(calc.airPerReactor)} Нм³/ч`,
        }
      );
    }

    return rows;
  }, [technology, calc, tech.hrt, uasbCalc, abrCalc]);

  return (
    <main style={page}>
      <PrintDocument
        objectName={objectName}
        flow={flow}
        people={people}
        hours={hours}
        bod={bod}
        cod={cod}
        tss={tss}
        nitrogen={nitrogen}
        phosphorus={phosphorus}
        technology={technology}
        tech={tech}
        calc={calc}
        detail={detail}
        reportNumber={reportNumber}
        reportDate={reportDate}
        reportTime={reportTime}
      />
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div style={container}>
        <div className="print-cover">
          <img
            src="/suvsanoat-logo.png"
            alt="SUVSANOAT"
            className="print-cover-logo"
          />

          <div className="print-cover-kicker">
            SUVSANOAT ENGINEERING SYSTEMS
          </div>

          <h1 className="print-cover-title">
            ИНЖЕНЕРНЫЙ РАСЧЁТ
          </h1>

          <div className="print-cover-subtitle">
            ОЧИСТНЫХ СООРУЖЕНИЙ СТОЧНЫХ ВОД
          </div>

          <div className="print-cover-meta">
            <div>
              <span>ОБЪЕКТ</span>
              <strong>{objectName}</strong>
            </div>

            <div>
              <span>ПРОИЗВОДИТЕЛЬНОСТЬ</span>
              <strong>{f(flow, 1)} м³/сут</strong>
            </div>

            <div>
              <span>ТЕХНОЛОГИЯ</span>
              <strong>{technology}</strong>
            </div>

            <div>
              <span>НОМЕР РАСЧЁТА</span>
              <strong>{reportNumber}</strong>
            </div>

            <div>
              <span>ДАТА</span>
              <strong>{reportDate}</strong>
            </div>

            <div>
              <span>ВРЕМЯ</span>
              <strong>{reportTime}</strong>
            </div>
          </div>

          <div className="print-cover-status">
            <span>СТАТУС ДОКУМЕНТА</span>
            <strong>Предварительное инженерное решение</strong>
          </div>

          <div className="print-cover-company">
            <strong>SUVSANOAT ENGINEERING SYSTEMS</strong>
            <span>www.suvsanoat.uz</span>
            <span>+998 77 304 34 00</span>
            <span>suvsanoat@gmail.com</span>
          </div>
        </div>

        <BrandHeader />
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
          Инженерный результат
        </h1>

        <p style={lead}>
          Предварительный расчёт для выбранной
          технологии. Все значения ниже предназначены
          для инженерной оценки и требуют подтверждения
          рабочим технологическим расчётом.
        </p>

        <Section title="ОБЪЕКТ / ТЕХНОЛОГИЯ">
          <div style={grid}>
            <Card
              label="ОБЪЕКТ"
              value={objectName}
            />

            <Card
              label="ТЕХНОЛОГИЯ"
              value={technology}
              accent
            />

            <Card
              label="QСУТ"
              value={`${f(flow, 1)} м³/сут`}
            />

            <Card
              label="ЛЮДИ"
              value={`${people || 0} чел.`}
            />
          </div>

          <div style={techBox}>
            <div style={techName}>
              {tech.title}
            </div>

            <p style={paragraph}>
              {tech.description}
            </p>
          </div>
        </Section>

        <Section title="ОБЩИЙ ГИДРАВЛИЧЕСКИЙ РАСЧЁТ">
          <div style={grid}>
            <Card
              label="QСР"
              value={`${f(calc.qAvg)} м³/ч`}
            />

            <Card
              label="QРАБ"
              value={`${f(calc.qHour)} м³/ч`}
            />

            <Card
              label={`QMAX (K = ${f(calc.kGenMax, 2)}, ТАБЛ. 2)`}
              value={`${f(calc.qPeak)} м³/ч`}
            />

            <Card
              label="HRT"
              value={`${tech.hrt} ч`}
            />

            <Card
              label="VГИДР"
              value={`${f(calc.hydraulic)} м³`}
              accent
            />

            <Card
              label="V +15%"
              value={`${f(calc.recommended)} м³`}
              accent
            />
          </div>
        </Section>

        <Section title="ИСХОДНАЯ НАГРУЗКА">
          <div style={grid}>
            <Card
              label="БПК₅"
              value={`${f(bod, 0)} мг/л · ${f(
                calc.bodLoad
              )} кг/сут`}
            />

            <Card
              label="ХПК"
              value={`${f(cod, 0)} мг/л · ${f(
                calc.codLoad
              )} кг/сут`}
            />

            <Card
              label="ВЗВ"
              value={`${f(tss, 0)} мг/л · ${f(
                calc.tssLoad
              )} кг/сут`}
            />

            <Card
              label="АЗОТ"
              value={`${f(nitrogen, 0)} мг/л · ${f(
                calc.nLoad
              )} кг/сут`}
            />

            <Card
              label="ФОСФОР"
              value={`${f(phosphorus, 0)} мг/л · ${f(
                calc.pLoad
              )} кг/сут`}
            />
          </div>
        </Section>

        <Section
          title={`СПЕЦИАЛИЗИРОВАННЫЙ РАСЧЁТ ${technology}`}
        >
          <div style={formulaBox}>
            <div style={smallLabel}>
              ОСНОВНОЙ ПРИНЦИП
            </div>

            <div style={formulaText}>
              {technology === "MBBR"
                ? "Vрасч = max(Vгидр, Vорганика, Vпо загрузке)"
                : technology === "SBR"
                ? "Vрасч = Vцикла × число реакторов / рабочая доля"
                : technology === "UASB"
                ? "Vрасч = max(Vгидр, Vпо ХПК); A = Qпик / vup"
                : technology === "ABR"
                ? "Vрасч = max(Vгидр, Vпо органической нагрузке)"
                : technology === "MBR" ||
                  technology === "AnMBR"
                ? "Vреактора + Aмембран = f(Q, HRT, поток)"
                : technology === "CAS"
                ? "Vрасч = max(Vгидр, Vпо F/M и MLSS)"
                : technology === "IFAS"
                ? "Vрасч = max(Vгидр, Vпо органике) + Vносителей"
                : technology === "ANBR"
                ? "Vрасч = max(Vгидр, Vпо ХПК)"
                : "Vрасч = Vгидр"}
            </div>

            <p style={paragraph}>
              Итоговый объём:{" "}
              <strong>
                {f(calc.volume)} м³
              </strong>
              . С ориентировочным запасом 15%:{" "}
              <strong>
                {f(calc.recommended)} м³
              </strong>
              .
            </p>
          </div>

          <div style={grid}>
            {detail.map((row) => (
              <Card
                key={row.label}
                label={row.label}
                value={row.value}
              />
            ))}
          </div>

          {technology === "SBR" && (
            <div
              style={{
                ...formulaBox,
                marginTop: 18,
              }}
            >
              <div style={smallLabel}>
                БАЛАНС ЦИКЛА SBR
              </div>

              <div style={paragraph}>
                Наполнение <strong>1 ч</strong> →
                реакция / аэрация <strong>4 ч</strong> →
                отстаивание <strong>1 ч</strong> →
                декантация <strong>1 ч</strong> →
                холостой период <strong>1 ч</strong>.
                Итого <strong>8 ч/цикл</strong>.
              </div>

              <div style={paragraph}>
                3 цикла/сут на каждый из 2 реакторов;
                обменный объём — 25% (цикл SBR не нормируется
                ҚМҚ 2.04.03-19; принят по практике, единый источник
                с шагом «Оборудование»). Рабочий объём
                одного реактора —{" "}
                <strong>
                  {f(calc.volume / 2)} м³
                </strong>
                , общий рабочий объём —{" "}
                <strong>
                  {f(calc.volume)} м³
                </strong>
                , общий объём с запасом 15% —{" "}
                <strong>
                  {f(calc.recommended)} м³
                </strong>
                .
              </div>
            </div>
          )}
        </Section>

        {/* НОВЫЙ БЛОК */}
        <Section title="ИНЖЕНЕРНЫЕ ПАРАМЕТРЫ">
          <div style={grid}>
            <Card
              label="РАСЧЁТНЫЙ ОБЪЁМ"
              value={`${f(calc.volume)} м³`}
              accent
            />

            <Card
              label="ОБЪЁМ С ЗАПАСОМ +15%"
              value={`${f(calc.recommended)} м³`}
              accent
            />

            <Card
              label="СЕКЦИИ / РЕАКТОРЫ"
              value={`${calc.sections} шт.`}
            />

            <Card
              label="ОБЪЁМ / СЕКЦИЮ"
              value={`${f(calc.volumePerSection)} м³`}
            />

            {calc.tankDepth > 0 && (
              <Card
                label="РАБОЧАЯ ГЛУБИНА"
                value={`${f(calc.tankDepth)} м`}
              />
            )}

            {calc.planArea > 0 && (
              <Card
                label="ПЛОЩАДЬ / СЕКЦИЮ"
                value={`${f(calc.planArea)} м²`}
              />
            )}

            {(technology === "MBBR" ||
              technology === "IFAS") && (
              <>
                <Card
                  label="ЗАПОЛНЕНИЕ НОСИТЕЛЯМИ"
                  value={`${f(
                    calc.fill * 100,
                    0
                  )} %`}
                />

                <Card
                  label="ОБЪЁМ НОСИТЕЛЕЙ"
                  value={`${f(
                    calc.mediaVolume
                  )} м³`}
                />
              </>
            )}

            {(technology === "MBBR" ||
              technology === "IFAS" ||
              technology === "CAS" ||
              technology === "SBR" ||
              technology === "MBR") && (
              <>
                <Card
                  label="ПОТРЕБНОСТЬ В O₂"
                  value={`${f(
                    calc.oxygen
                  )} кг O₂/сут`}
                />

                <Card
                  label="РАСХОД ВОЗДУХА"
                  value={`${f(
                    calc.air,
                    0
                  )} Нм³/ч`}
                  accent
                />
              </>
            )}

            {(technology === "MBR" ||
              technology === "AnMBR") && (
              <>
                <Card
                  label="МЕМБРАННЫЙ ПОТОК"
                  value={`${f(
                    calc.membraneFlux,
                    0
                  )} LMH`}
                />

                <Card
                  label="ПЛОЩАДЬ МЕМБРАН"
                  value={`${f(
                    calc.membraneArea
                  )} м²`}
                  accent
                />

                <Card
                  label="МЕМБРАННЫЕ МОДУЛИ"
                  value={`${Math.max(
                    1,
                    Math.ceil(
                      calc.membraneArea / 40
                    )
                  )} шт.`}
                />
              </>
            )}

            {technology === "UASB" && (
              <>
                <Card
                  label="ВОСХОДЯЩАЯ СКОРОСТЬ"
                  value={`${f(
                    calc.upflowVelocity
                  )} м/ч`}
                />

                <Card
                  label="ПЛОЩАДЬ РЕАКТОРА"
                  value={`${f(
                    calc.surfaceArea
                  )} м²`}
                  accent
                />
              </>
            )}

            {technology === "ABR" && (
              <Card
                label="КАМЕРЫ"
                value={`${calc.chambers} шт.`}
              />
            )}

            {technology === "SBR" && (
              <>
                <Card
                  label="ЦИКЛОВ / СУТ"
                  value={`${f(
                    calc.cyclesPerDay,
                    0
                  )}`}
                />

                <Card
                  label="ПРОДОЛЖИТЕЛЬНОСТЬ ЦИКЛА"
                  value={`${f(
                    calc.cycleHours
                  )} ч`}
                />

                <Card
                  label="ОБМЕННЫЙ ОБЪЁМ"
                  value={`${f(
                    calc.exchangeRatio * 100,
                    0
                  )} %`}
                />
              </>
            )}
          </div>

          <p style={note}>
            Параметры являются предварительными инженерными
            значениями. Окончательные размеры реакторов,
            количество оборудования, аэрация, мембранная
            площадь и технологические режимы должны быть
            подтверждены рабочим проектированием.
          </p>
        </Section>

        <Section title="ПРЕДВАРИТЕЛЬНЫЕ ГАБАРИТЫ">
          <div style={grid}>
            <Card
              label="РАСЧЁТНЫЙ ОБЪЁМ"
              value={`${f(calc.volume)} м³`}
              accent
            />

            <Card
              label="ОБЪЁМ С ЗАПАСОМ"
              value={`${f(calc.recommended)} м³`}
              accent
            />

            <Card
              label="СЕКЦИИ / РЕАКТОРЫ"
              value={`${calc.sections} шт.`}
            />

            <Card
              label="ОБЪЁМ / СЕКЦИЮ"
              value={`${f(
                calc.volumePerSection
              )} м³`}
            />

            {calc.tankDepth > 0 && (
              <Card
                label="РАБОЧАЯ ГЛУБИНА"
                value={`${f(
                  calc.tankDepth
                )} м`}
              />
            )}

            {calc.planArea > 0 && (
              <Card
                label="ПЛОЩАДЬ / СЕКЦИЮ"
                value={`${f(
                  calc.planArea
                )} м²`}
              />
            )}
          </div>
        </Section>

        {(technology === "MBBR" ||
          technology === "IFAS" ||
          technology === "CAS" ||
          technology === "SBR" ||
          technology === "MBR") && (
          <Section title="ПРЕДВАРИТЕЛЬНАЯ АЭРАЦИЯ">
            <div style={grid}>
              <Card
                label="O₂"
                value={`${f(
                  calc.oxygen
                )} кг O₂/сут`}
              />

              <Card
                label="ВОЗДУХ"
                value={`${f(
                  calc.air,
                  0
                )} Нм³/ч`}
                accent
              />

              <Card
                label="РАБОЧИЕ ВОЗДУХОДУВКИ"
                value="2 шт."
              />

              <Card
                label="РЕЗЕРВ"
                value="1 шт."
              />

              <Card
                label="ДИФФУЗОРЫ"
                value={`${Math.max(
                  1,
                  Math.ceil(calc.air / 5)
                )} шт.`}
              />
            </div>

            <p style={note}>
              O₂ — q_O = {AEROTANK.air.qO.toBod15_20} кг O₂/кг снятой БПКполн
              (очистка до 15–20 мг/л; 0,9 — свыше 20 мг/л; 1,25 — продлённая
              аэрация, п. 6.175), воздух — по ф. (70) {AEROTANK.air.ref}.
              Для рабочего проекта необходимо уточнить K₁ (табл. 44а),
              K₂ (табл. 45), температуру, DO, фактическую нитрификацию
              и характеристики конкретных диффузоров и воздуходувок.
            </p>
          </Section>
        )}

        {(technology === "ANBR" ||
          technology === "UASB" ||
          technology === "ABR" ||
          technology === "AnMBR") && (
          <Section title="АНАЭРОБНЫЙ БАЛАНС">
            <div style={grid}>
              <Card
                label="СНЯТАЯ ХПК"
                value={`${f(
                  calc.removedCod
                )} кг/сут`}
              />

              <Card
                label="БИОГАЗ"
                value={`${f(
                  calc.biogas
                )} м³/сут`}
                accent
              />

              <Card
                label="МЕТАН, ОРИЕНТИР"
                value={`${f(
                  calc.methane
                )} м³/сут`}
              />
            </div>

            <p style={note}>
              Выход биогаза и доля метана приведены
              как предварительное инженерное допущение
              и не заменяют лабораторное определение
              биоразлагаемой органики и фактического
              выхода газа.
            </p>
          </Section>
        )}

        {(technology === "MBR" ||
          technology === "AnMBR") && (
          <Section title="МЕМБРАННЫЙ РАСЧЁТ">
            <div style={grid}>
              <Card
                label="МЕМБРАННЫЙ ПОТОК"
                value={`${f(
                  calc.membraneFlux,
                  0
                )} LMH`}
              />

              <Card
                label="ПЛОЩАДЬ МЕМБРАН"
                value={`${f(
                  calc.membraneArea
                )} м²`}
                accent
              />

              <Card
                label="ПЛОЩАДЬ С ЗАПАСОМ"
                value={`${f(
                  calc.result.specialized.find(
                    (m) =>
                      m.key ===
                      "membraneAreaWithReserve"
                  )?.value ??
                    calc.membraneArea
                )} м²`}
              />

              <Card
                label="МОДУЛИ"
                value={`${Math.max(
                  1,
                  Math.ceil(
                    (calc.result.specialized.find(
                      (m) =>
                        m.key ===
                        "membraneAreaWithReserve"
                    )?.value ??
                      calc.membraneArea) / 40
                  )
                )} шт.`}
              />

              <Card
                label="ПЛОЩАДЬ МОДУЛЯ"
                value="40 м²"
              />
            </div>

            <p style={note}>
              Для MBR площадь мембран определяется
              по пиковому расходу и принятому удельному
              потоку. Значения являются предварительными
              и требуют уточнения по типу мембран,
              температуре, MLSS, режиму фильтрации
              и требованиям производителя.
            </p>
          </Section>
        )}

        {kmkScreen && (
          <Section title={`ТРЕБОВАНИЯ ${KMK_2_04_03_19_DOC.code}: ОБЕЗЗАРАЖИВАНИЕ, СООРУЖЕНИЯ, ОСАДОК`}>
            <div style={grid}>
              <Card
                label="ХЛОР ПОСЛЕ БИОЛОГИИ, П. 6.230"
                value={`${kmkScreen.chlorDose} г/м³ · ${f(kmkScreen.chlorKgDay)} кг/сут`}
                accent
              />
              <Card
                label="ХЛОРНОЕ ХОЗЯЙСТВО ×1,5"
                value={`${f(kmkScreen.chlorStorageKgDay)} кг/сут`}
              />
              <Card
                label="КОНТАКТНЫЕ РЕЗЕРВУАРЫ, П. 6.235–6.236"
                value={`≥ ${DISINFECTION.contactTanksMin.value} шт. · ${f(kmkScreen.contactVolume, 1)} м³`}
              />
              {kmkScreen.withSecondarySettling && (
                <Card
                  label="ВТОРИЧНЫЕ ОТСТОЙНИКИ, П. 6.58"
                  value={`≥ ${PRIMARY_SETTLING.minSecondary.value} шт. (или V ×1,2–1,3)`}
                />
              )}
              {kmkScreen.aerobic && (
                <>
                  <Card
                    label="ПРИРОСТ ИЛА, Ф. (67) П. 6.148"
                    value={`${f(kmkScreen.sludgeGrowthMgL, 0)} мг/л · ${f(kmkScreen.sludgeKgDay, 1)} кг/сут`}
                  />
                  <Card
                    label="ИЛ НА УПЛОТНИТЕЛИ ×1,3"
                    value={`${f(kmkScreen.sludgeDesignKgDay, 1)} кг/сут`}
                  />
                  <Card
                    label="КЕК ФИЛЬТР-ПРЕСС 80–83 %, ТАБЛ. 69"
                    value={`${f(kmkScreen.cakeT[0])}–${f(kmkScreen.cakeT[1])} т/сут`}
                  />
                </>
              )}
            </div>
            <p style={note}>
              {DISINFECTION.chlorineDose.ref}: {DISINFECTION.chlorineDose.afterBio} г/м³
              после биологической очистки ({DISINFECTION.chlorineDose.afterPartialBio} — после
              неполной биологической, {DISINFECTION.chlorineDose.afterMechanical} — после
              механической), хлорное хозяйство на ×{DISINFECTION.chlorineDose.storageFactor}.
              {" "}{DISINFECTION.contactMinutes.ref}: контакт {DISINFECTION.contactMinutes.value} мин
              при максимальном расходе; {DISINFECTION.contactTanksMin.ref}: не менее{" "}
              {DISINFECTION.contactTanksMin.value} резервуаров.
              {" "}{AEROTANK.sludgeGrowth.ref}: P_i = 0,8·C_cdp + 0,3·L_en
              (C_cdp — взвешенные {f(tss, 0)} мг/л; L_en — БПКполн из БПК₅ через{" "}
              {BOD5_TO_BODFULL}, практика). {SLUDGE.dewatering.ref}: кек активного
              ила — фильтр-пресс {SLUDGE.dewatering.activatedSludgeCake.filterPress[0]}–{SLUDGE.dewatering.activatedSludgeCake.filterPress[1]} %,
              центрифуга {SLUDGE.dewatering.activatedSludgeCake.centrifuge[0]}–{SLUDGE.dewatering.activatedSludgeCake.centrifuge[1]} % влажности;
              плотность кека 1 т/м³ — практика.
            </p>
          </Section>
        )}

        <Section title="ИТОГОВАЯ ВЕДОМОСТЬ ОБОРУДОВАНИЯ">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {buildFinalEquipment(
              calc.result.equipment || [],
              technology,
              calc
            ).map((item, index) => (
              <div key={`equipment-summary-${index}`} style={equipmentRow}>
                <div style={equipmentNo}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={equipmentTitle}>{item.position}</div>
                  <div
                    style={{
                      color: "#b7c9d0",
                      fontSize: 13,
                      marginTop: 5,
                    }}
                  >
                    {item.quantity}
                  </div>
                  <div style={note}>{item.parameter}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="ДОПУЩЕНИЯ РАСЧЁТА">
          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {calc.result.assumptions.map(
              (item, index) => (
                <div
                  key={index}
                  style={note}
                >
                  • {item}
                </div>
              )
            )}
          </div>
        </Section>

        <Section title="РЕКОМЕНДУЕМЫЙ СОСТАВ ОБОРУДОВАНИЯ">
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {buildFinalEquipment(
              calc.result.equipment || [],
              technology,
              calc
            ).map(
              (item, i) => (
                <div
                  key={`${item.position}-${i}`}
                  style={equipmentRow}
                >
                  <div style={equipmentNo}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <div style={equipmentTitle}>
                      {item.position}
                    </div>

                    <div
                      style={{
                        color: "#b7c9d0",
                        fontSize: 13,
                        marginTop: 5,
                      }}
                    >
                      Количество:{" "}
                      <strong>
                        {item.quantity}
                      </strong>
                    </div>

                    <div style={note}>
                      Параметр: {item.parameter}.
                      Статус: {item.status}.
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </Section>

        <Section title="ПРЕДВАРИТЕЛЬНАЯ СХЕМА">
          <div style={diagram}>
            <div style={diagramBox}>
              ПРИЁМ
              <br />
              СТОЧНЫХ ВОД
            </div>

            <div style={arrow}>→</div>

            <div
              style={{
                ...diagramBox,
                borderColor: "#00d9ff",
              }}
            >
              {technology}
              <br />

              <span
                style={{
                  fontSize: 12,
                  color: "#8ca4ad",
                }}
              >
                {f(calc.volume, 1)} м³
              </span>
            </div>

            <div style={arrow}>→</div>

            <div style={diagramBox}>
              РАЗДЕЛЕНИЕ
              <br />
              / ДОЧИСТКА
            </div>

            <div style={arrow}>→</div>

            <div style={diagramBox}>
              ОЧИЩЕННАЯ
              <br />
              ВОДА
            </div>
          </div>
        </Section>

        <div style={actions} data-no-print="true">
          <button
            style={secondary}
            onClick={() => router.back()}
          >
            ← Изменить параметры
          </button>

          <button
            style={secondary}
            onClick={() => router.push("/")}
          >
            ← На главную
          </button>

          <button
            style={secondary}
            onClick={() => window.print()}
          >
            Печать / PDF
          </button>

          <button
            style={primary}
            onClick={() =>
              router.push("/engineering")
            }
          >
            Новое проектирование
          </button>
        </div>

        <p style={disclaimer}>
          Результат является предварительным инженерным
          решением. Расчётные значения и коэффициенты
          не являются рабочим проектом и должны быть
          проверены технологом, гидравликом, конструктором
          и поставщиком оборудования.
        </p>

        <BrandFooter />
      </div>
    </main>
  );
}


export default function Complete() {
  return (
    <Suspense fallback={null}>
      <CompleteContent />
    </Suspense>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#06151d",
  color: "#f4f7f8",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container: CSSProperties = {
  width: "min(1180px, calc(100% - 32px))",
  margin: "0 auto",
  padding: "34px 0 80px",
};

const back: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#b7c9d0",
  cursor: "pointer",
  fontSize: 15,
  padding: 0,
  marginBottom: 34,
};

const eyebrow: CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "3px",
};

const title: CSSProperties = {
  margin: "18px 0 0",
  fontSize: "clamp(42px, 7vw, 76px)",
  lineHeight: 1,
  letterSpacing: "-3px",
};

const lead: CSSProperties = {
  maxWidth: 850,
  color: "#8ca4ad",
  fontSize: 17,
  lineHeight: 1.7,
  margin: "24px 0 48px",
};

const section: CSSProperties = {
  border: "1px solid #1c3742",
  borderRadius: 14,
  background: "#081b24",
  padding: 28,
  marginBottom: 22,
};

const sectionLabel: CSSProperties = {
  color: "#657983",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "2px",
  marginBottom: 20,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
};

const card: CSSProperties = {
  padding: 19,
  border: "1px solid #1c3742",
  background: "#0a2029",
  borderRadius: 9,
};

const smallLabel: CSSProperties = {
  color: "#657983",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.4px",
  marginBottom: 10,
};

const techBox: CSSProperties = {
  marginTop: 16,
  padding: 22,
  border: "1px solid #1c4d5c",
  background: "#08232d",
  borderRadius: 10,
};

const techName: CSSProperties = {
  color: "#00d9ff",
  fontSize: 25,
  fontWeight: 800,
};

const paragraph: CSSProperties = {
  color: "#8ca4ad",
  lineHeight: 1.7,
  margin: "10px 0 0",
};

const formulaBox: CSSProperties = {
  padding: 22,
  marginBottom: 14,
  border: "1px solid #1c4d5c",
  background: "#071a23",
  borderRadius: 10,
};

const formulaText: CSSProperties = {
  color: "#00d9ff",
  fontSize: 19,
  fontWeight: 800,
};

const note: CSSProperties = {
  color: "#657983",
  fontSize: 12,
  lineHeight: 1.7,
  margin: "15px 0 0",
};

const equipmentRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "50px 1fr",
  gap: 14,
  padding: 18,
  border: "1px solid #1c3742",
  background: "#0a2029",
  borderRadius: 8,
};

const equipmentNo: CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
};

const equipmentTitle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
};

const diagram: CSSProperties = {
  minHeight: 210,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
  border: "1px solid #1c3742",
  borderRadius: 10,
  padding: 20,
  background:
    "radial-gradient(circle at center, #0c2732 0%, #071922 70%)",
};

const diagramBox: CSSProperties = {
  minWidth: 120,
  minHeight: 72,
  padding: 14,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  border: "1px solid #294b57",
  borderRadius: 9,
  background: "#0a2029",
  color: "#dce8ee",
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.4,
};

const arrow: CSSProperties = {
  color: "#00d9ff",
  fontSize: 26,
  fontWeight: 800,
};

const actions: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 30,
};

const primary: CSSProperties = {
  padding: "16px 26px",
  border: 0,
  borderRadius: 7,
  background: "#f5f8fa",
  color: "#06151d",
  fontWeight: 800,
  cursor: "pointer",
};

const secondary: CSSProperties = {
  padding: "16px 24px",
  border: "1px solid #29444e",
  borderRadius: 7,
  background: "transparent",
  color: "#f4f7f8",
  fontWeight: 700,
  cursor: "pointer",
};

const disclaimer: CSSProperties = {
  marginTop: 38,
  color: "#536871",
  fontSize: 12,
  lineHeight: 1.7,
  maxWidth: 900,
};

/* ============================================================
   PRINT / PDF
   ============================================================ */

const printStyles = `
/* PDF-only cover: never show on the normal web page */
.print-document {
  display: none;
}

.print-cover {
  display: none !important;
}

.print-cover-logo {
  display: block;
  width: 220px;
  max-width: 100%;
  height: auto;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #10294a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  button,
  [data-no-print="true"],
  .print-cover,
  main > div:not(.print-document) {
    display: none !important;
  }

  main,
  main > .print-document {
    display: block !important;
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  .print-document {
    font-family: Arial, Helvetica, sans-serif;
    color: #10294a !important;
    background: #fff !important;
  }

  .pdf-page {
    position: relative;
    width: 100%;
    height: 281mm;
    box-sizing: border-box;
    overflow: hidden;
    background: #fff !important;
    padding: 2mm 1mm 15mm;
    break-after: page;
    page-break-after: always;
  }

  .pdf-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  .pdf-page::after {
    content: "";
    position: absolute;
    left: -5%;
    right: -5%;
    bottom: -1mm;
    height: 25mm;
    opacity: .75;
    background:
      radial-gradient(70% 80% at 12% 90%, rgba(225,237,249,.85) 0 35%, transparent 36%),
      radial-gradient(65% 75% at 55% 100%, rgba(233,242,250,.95) 0 35%, transparent 36%),
      radial-gradient(70% 80% at 92% 90%, rgba(221,235,248,.8) 0 35%, transparent 36%);
    pointer-events: none;
    z-index: 0;
  }

  .pdf-page > * {
    position: relative;
    z-index: 1;
  }

  .pdf-header {
    height: 20mm;
    display: grid;
    grid-template-columns: 1.2fr 1fr .9fr;
    align-items: center;
    border-bottom: 1.5px solid #1260c9;
    margin-bottom: 8mm;
  }

  .pdf-brand {
    display: flex;
    align-items: center;
    gap: 2mm;
    color: #0d2244 !important;
    font-weight: 800;
    font-size: 13px;
    line-height: 1;
  }

  .pdf-brand img {
    width: 35mm !important;
    max-width: 35mm !important;
    max-height: 13mm !important;
    height: auto !important;
    object-fit: contain !important;
  }

  .pdf-brand span {
    display: none;
  }

  .pdf-brand small {
    color: #1260c9 !important;
    font-size: 6px;
    letter-spacing: 1.3px;
  }

  .pdf-header-title {
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: #10294a !important;
  }

  .pdf-header-meta {
    text-align: right;
    font-size: 8px;
    line-height: 1.7;
    color: #10294a !important;
  }

  .pdf-footer {
    position: absolute !important;
    left: 1mm;
    right: 1mm;
    bottom: 1mm;
    height: 9mm;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    align-items: center;
    border-top: 1px solid #1260c9;
    color: #10294a !important;
    font-size: 7.5px;
  }

  .pdf-footer strong {
    color: #1260c9 !important;
    font-size: 10px;
    padding-left: 5mm;
  }

  .pdf-section {
    margin-bottom: 6mm;
  }

  .pdf-section h2 {
    margin: 0 0 4mm;
    color: #0759c5 !important;
    font-size: 14px;
    line-height: 1.1;
    font-weight: 800;
    break-after: avoid;
  }

  .pdf-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 8.3px;
    color: #10294a !important;
  }

  .pdf-table th {
    text-align: left;
    padding: 2.4mm 3mm;
    background: #e5eefb !important;
    border: 1px solid #c9d9ec !important;
    color: #10294a !important;
    font-weight: 800;
  }

  .pdf-table td {
    padding: 2.1mm 3mm;
    border: 1px solid #c9d9ec !important;
    background: #fff !important;
    color: #10294a !important;
    vertical-align: middle;
  }

  .pdf-table tr {
    break-inside: avoid;
  }

  .pdf-formula {
    border-left: 3px solid #1260c9;
    background: #f4f8fc !important;
    padding: 5mm;
    margin-bottom: 5mm;
  }

  .pdf-formula span,
  .pdf-metric-label,
  .pdf-status .pdf-metric-label {
    display: block;
    color: #47617e !important;
    font-size: 7px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 1.5mm;
  }

  .pdf-formula strong {
    display: block;
    color: #0759c5 !important;
    font-size: 12px;
    margin-bottom: 2mm;
  }

  .pdf-formula p {
    margin: 0;
    font-size: 8.5px;
    line-height: 1.5;
    color: #203a58 !important;
  }

  .pdf-highlight-grid,
  .pdf-cover-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid #d5e1ee;
    border-radius: 3mm;
    overflow: hidden;
  }

  .pdf-metric {
    display: flex;
    align-items: flex-start;
    gap: 4mm;
    min-height: 21mm;
    padding: 4mm;
    border-right: 1px solid #d5e1ee;
    border-bottom: 1px solid #d5e1ee;
    background: #fff !important;
    box-sizing: border-box;
  }

  .pdf-metric:nth-child(even) {
    border-right: 0;
  }

  .pdf-icon {
    width: 9mm;
    height: 9mm;
    flex: 0 0 9mm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1260c9 !important;
    border: 1.2px solid #1260c9;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
  }

  .pdf-metric-value {
    color: #10294a !important;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.25;
  }

  .pdf-metric-sub {
    color: #3d5875 !important;
    font-size: 8px;
    line-height: 1.4;
    margin-top: 1mm;
  }

  .pdf-dimension-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid #c9d9ec;
    background: #f7faff !important;
  }

  .pdf-dimension-box div {
    padding: 8mm 5mm;
    text-align: center;
    border-right: 1px solid #c9d9ec;
  }

  .pdf-dimension-box div:last-child {
    border-right: 0;
  }

  .pdf-dimension-box span {
    display: block;
    color: #47617e !important;
    font-size: 7px;
    font-weight: 800;
    margin-bottom: 2mm;
  }

  .pdf-dimension-box b {
    color: #0759c5 !important;
    font-size: 18px;
  }

  .pdf-note,
  .pdf-callout {
    color: #425b74 !important;
    font-size: 8px;
    line-height: 1.55;
  }

  .pdf-note {
    margin-top: 4mm;
  }

  .pdf-callout {
    border-left: 3px solid #1260c9;
    background: #f3f7fb !important;
    padding: 4mm;
    margin-top: 5mm;
  }

  .pdf-list {
    display: grid;
    gap: 2mm;
  }

  .pdf-list > div {
    display: grid;
    grid-template-columns: 10mm 1fr;
    gap: 3mm;
    padding: 3mm 4mm;
    border: 1px solid #d5e1ee;
    background: #fff !important;
    font-size: 8.5px;
    line-height: 1.45;
  }

  .pdf-list span {
    color: #1260c9 !important;
    font-weight: 800;
  }

  .pdf-check-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3mm;
    margin-top: 5mm;
  }

  .pdf-check-grid div {
    padding: 4mm;
    border: 1px solid #d5e1ee;
    color: #10294a !important;
    font-size: 8px;
    font-weight: 700;
    background: #fff !important;
  }

  .pdf-equipment {
    display: grid;
    gap: 2.5mm;
  }

  .pdf-equipment-row {
    display: grid;
    grid-template-columns: 10mm 1fr;
    gap: 3mm;
    padding: 3.5mm 4mm;
    border: 1px solid #d5e1ee;
    background: #fff !important;
    break-inside: avoid;
  }

  .pdf-equipment-row > b {
    color: #1260c9 !important;
    font-size: 9px;
  }

  .pdf-equipment-row strong {
    display: block;
    color: #10294a !important;
    font-size: 9px;
  }

  .pdf-equipment-row span,
  .pdf-equipment-row small {
    display: block;
    margin-top: 1mm;
    color: #4a6178 !important;
    font-size: 7px;
  }

  .pdf-flow {
    display: grid;
    grid-template-columns: 1fr 10mm 1fr 10mm 1fr 10mm 1fr;
    align-items: center;
    gap: 2mm;
    margin-top: 10mm;
  }

  .pdf-flow > div {
    min-height: 25mm;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3mm;
    border: 1px solid #c9d9ec;
    background: #f8fbff !important;
    color: #10294a !important;
    font-size: 8px;
    font-weight: 800;
  }

  .pdf-flow > div.active {
    border: 1.5px solid #1260c9;
    color: #0759c5 !important;
    background: #edf5ff !important;
  }

  .pdf-flow small {
    display: block;
    margin-top: 1mm;
    font-size: 7px;
    color: #47617e !important;
  }

  .pdf-flow > span {
    text-align: center;
    color: #1260c9 !important;
    font-size: 18px;
    font-weight: 800;
  }

  .pdf-conclusion {
    border: 1px solid #c9d9ec;
    padding: 7mm;
    background: #f8fbff !important;
  }

  .pdf-conclusion h3 {
    margin: 0 0 3mm;
    color: #10294a !important;
    font-size: 15px;
  }

  .pdf-conclusion p {
    margin: 2.5mm 0;
    color: #304c69 !important;
    font-size: 9px;
    line-height: 1.6;
  }

  .pdf-sign {
    margin-top: 25mm;
    text-align: center;
  }

  .pdf-sign span,
  .pdf-sign b,
  .pdf-sign small {
    display: block;
  }

  .pdf-sign span {
    color: #47617e !important;
    font-size: 7px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .pdf-sign b {
    margin-top: 2mm;
    color: #10294a !important;
    font-size: 12px;
  }

  .pdf-sign small {
    margin-top: 2mm;
    color: #47617e !important;
    font-size: 7px;
  }

  /* COVER */
  .pdf-cover {
    padding: 3mm 4mm 15mm;
    display: flex !important;
    flex-direction: column;
    justify-content: space-between;
  }

  .pdf-cover::after {
    height: 34mm;
    bottom: -3mm;
    opacity: .9;
  }

  .pdf-cover-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-top: 2mm;
  }

  .pdf-cover-top > img {
    width: 56mm !important;
    max-width: 56mm !important;
    max-height: 24mm !important;
    height: auto !important;
    object-fit: contain !important;
  }

  .pdf-contact {
    text-align: left;
    color: #10294a !important;
    font-size: 9px;
    line-height: 2;
    padding-top: 1mm;
  }

  .pdf-cover-title {
    margin-top: 22mm;
  }

  .pdf-cover-title h1 {
    margin: 0;
    color: #10294a !important;
    font-size: 31px;
    line-height: 1.05;
    letter-spacing: -.5px;
    font-weight: 800;
  }

  .pdf-cover-title h3 {
    margin: 3mm 0 0;
    color: #3d5875 !important;
    font-size: 14px;
    letter-spacing: .4px;
    font-weight: 700;
  }

  .pdf-blue-line {
    width: 25mm;
    height: 1.5mm;
    background: #1260c9 !important;
    margin-top: 6mm;
  }

  .pdf-cover-grid {
    margin-top: 10mm;
  }

  .pdf-cover-grid .pdf-metric {
    min-height: 25mm;
    padding: 5mm;
  }

  .pdf-status {
    display: flex;
    align-items: flex-start;
    gap: 4mm;
    margin-top: 5mm;
    padding: 5mm;
    border-left: 3px solid #1260c9;
    border-top: 1px solid #d5e1ee;
    border-right: 1px solid #d5e1ee;
    border-bottom: 1px solid #d5e1ee;
    background: #f9fbfd !important;
  }

  .pdf-status strong {
    display: block;
    color: #10294a !important;
    font-size: 11px;
  }

  .pdf-status p {
    margin: 1.5mm 0 0;
    color: #425b74 !important;
    font-size: 8px;
    line-height: 1.45;
  }

  .pdf-cover-bottom {
    text-align: center;
    margin-bottom: 8mm;
  }

  .pdf-cover-bottom strong,
  .pdf-cover-bottom b {
    display: block;
  }

  .pdf-cover-bottom strong {
    color: #47617e !important;
    font-size: 7px;
    letter-spacing: 1px;
  }

  .pdf-cover-bottom b {
    margin-top: 1.5mm;
    color: #10294a !important;
    font-size: 12px;
  }
}
`;

