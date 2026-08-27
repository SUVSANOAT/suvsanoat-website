"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLanguage } from "../LanguageContext";
import type { Language } from "../translations";

/* --------------------------------------------------------------
 * АНИМИРОВАННАЯ ТЕХНОЛОГИЧЕСКАЯ СХЕМА
 *
 * Все значения взяты из расчёта SUVSANOAT AVTO-3К
 * (стоки автомойки 20 м³/сут, сброс в коммунальную канализацию).
 * Норматив — ПКМ РУз № 11 от 03.02.2010, Приложения № 1 и № 2.
 * Ничего не выдумано: это те же цифры, что в проектном документе.
 * -------------------------------------------------------------- */

/** Показатели на выходе каждой ступени, мг/л */
const VALUES: { ss: number; oil: number; bod: number }[] = [
  { ss: 1500, oil: 50, bod: 150 },
  { ss: 110, oil: 4, bod: 130 },
  { ss: 25, oil: 2.5, bod: 115 },
  { ss: 20, oil: 0.5, bod: 90 },
  { ss: 20, oil: 0.5, bod: 10 },
  { ss: 20, oil: 0.5, bod: 10 },
];

/** Нормативы приёма в канализацию, мг/л */
const NORMS = { ss: 150, oil: 1, bod: 15 };

type SchemeText = {
  label: string;
  title: string;
  intro: string;
  source: string;
  stages: { title: string; sub: string }[];
  metrics: { ss: string; oil: string; bod: string };
  unit: string;
  normLabel: string;
  prev: string;
  next: string;
};

const T: Record<Language, SchemeText> = {
  ru: {
    label: "ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС",
    title: "Как вода проходит\nчерез очистные сооружения.",
    intro:
      "Каждая ступень снимает свою группу загрязнений. Переключайте ступени — показатели пересчитываются по реальному проекту.",
    source:
      "Пример: стоки автомойки 20 м³/сут. Норматив — ПКМ РУз № 11 от 03.02.2010.",
    stages: [
      { title: "Приём стока", sub: "усреднитель, равномерная подача" },
      {
        title: "Механическая очистка",
        sub: "пескоуловитель · ламельный отстойник · коалесцентный модуль",
      },
      { title: "Песчаная фильтрация", sub: "кварцевый песок, обратная промывка" },
      { title: "Сорбция", sub: "активированный уголь, нефтепродукты и запах" },
      { title: "Биологическая доочистка", sub: "биореактор с аэрацией" },
      { title: "Сброс в канализацию", sub: "контрольный колодец, расходомер" },
    ],
    metrics: {
      ss: "Взвешенные вещества",
      oil: "Нефтепродукты",
      bod: "БПК₅",
    },
    unit: "мг/л",
    normLabel: "норматив",
    prev: "Предыдущая ступень",
    next: "Следующая ступень",
  },

  uz: {
    label: "TEXNOLOGIK JARAYON",
    title: "Suv tozalash inshootlaridan\nqanday o‘tadi.",
    intro:
      "Har bir bosqich o‘z ifloslantiruvchi guruhini yo‘qotadi. Bosqichlarni almashtiring — ko‘rsatkichlar haqiqiy loyiha bo‘yicha qayta hisoblanadi.",
    source:
      "Misol: avtomoyka oqava suvlari 20 m³/sutka. Me’yor — O‘zR VM 03.02.2010 yildagi 11-sonli qarori.",
    stages: [
      { title: "Oqavani qabul qilish", sub: "o‘rtachalashtirgich, bir tekis uzatish" },
      {
        title: "Mexanik tozalash",
        sub: "qum tutgich · lamel tindirgich · koalessent modul",
      },
      { title: "Qumli filtrlash", sub: "kvars qumi, teskari yuvish" },
      { title: "Sorbsiya", sub: "faollashtirilgan ko‘mir, neft mahsulotlari va hid" },
      { title: "Biologik qo‘shimcha tozalash", sub: "aeratsiyali bioreaktor" },
      { title: "Kanalizatsiyaga chiqarish", sub: "nazorat qudug‘i, sarf o‘lchagich" },
    ],
    metrics: {
      ss: "Muallaq moddalar",
      oil: "Neft mahsulotlari",
      bod: "BOD₅",
    },
    unit: "mg/l",
    normLabel: "me’yor",
    prev: "Oldingi bosqich",
    next: "Keyingi bosqich",
  },

  en: {
    label: "PROCESS FLOW",
    title: "How water passes\nthrough the treatment plant.",
    intro:
      "Each stage removes its own group of pollutants. Switch between stages — the figures are recalculated from a real project.",
    source:
      "Example: car wash wastewater, 20 m³/day. Limits per Resolution No. 11 of the Cabinet of Ministers of Uzbekistan, 03.02.2010.",
    stages: [
      { title: "Influent", sub: "equalization tank, steady feed" },
      {
        title: "Mechanical treatment",
        sub: "grit trap · lamella settler · coalescing module",
      },
      { title: "Sand filtration", sub: "quartz sand, backwash" },
      { title: "Sorption", sub: "activated carbon, oil products and odour" },
      { title: "Biological polishing", sub: "aerated bioreactor" },
      { title: "Discharge to sewer", sub: "sampling manhole, flow meter" },
    ],
    metrics: {
      ss: "Suspended solids",
      oil: "Oil products",
      bod: "BOD₅",
    },
    unit: "mg/l",
    normLabel: "limit",
    prev: "Previous stage",
    next: "Next stage",
  },

  zh: {
    label: "工艺流程",
    title: "水如何通过\n污水处理设施。",
    intro:
      "每一级去除各自的污染物。切换处理级别 — 指标将按真实项目重新计算。",
    source:
      "示例：洗车场污水 20 m³/天。排放标准依据乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议。",
    stages: [
      { title: "污水进水", sub: "调节池，均匀进水" },
      { title: "机械处理", sub: "沉砂池 · 斜板沉淀 · 聚结分离模块" },
      { title: "石英砂过滤", sub: "石英砂，反冲洗" },
      { title: "吸附", sub: "活性炭，去除石油类物质和异味" },
      { title: "生化深度处理", sub: "曝气生物反应器" },
      { title: "排入市政管网", sub: "检查井，流量计" },
    ],
    metrics: {
      ss: "悬浮物",
      oil: "石油类",
      bod: "BOD₅",
    },
    unit: "mg/L",
    normLabel: "标准",
    prev: "上一级",
    next: "下一级",
  },
};

/** Плавный переход числа от текущего значения к целевому */
function useAnimatedNumber(target: number, duration = 650) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;

    if (from === target) return;

    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);

      setValue(from + (target - from) * eased);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}

function format(value: number, language: Language) {
  const decimals = value < 10 && value % 1 !== 0 ? 1 : 0;
  const rounded = value.toFixed(decimals);

  return language === "en" || language === "zh"
    ? rounded
    : rounded.replace(".", ",");
}

export default function ProcessScheme() {
  const { language } = useLanguage();
  const c = T[language];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);

  const total = VALUES.length;

  const go = useCallback(
    (index: number) => {
      setActive(((index % total) + total) % total);
    },
    [total]
  );

  /* автопрокрутка только когда секция на экране */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % total);
    }, 3200);

    return () => clearInterval(timer);
  }, [playing, total]);

  const values = VALUES[active];

  return (
    <section className="schemeSection" id="scheme" ref={sectionRef}>
      <div className="schemeHead">
        <div>
          <div className="sectionLabel light">{c.label}</div>

          <h2>
            {c.title.split("\n").map((line, index) => (
              <span key={index}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
        </div>

        <p>{c.intro}</p>
      </div>

      {/* СХЕМА */}
      <div className="schemeTrack">
        {c.stages.map((stage, index) => (
          <button
            type="button"
            key={stage.title}
            className={`schemeStage ${index === active ? "active" : ""} ${
              index < active ? "done" : ""
            }`}
            onClick={() => go(index)}
            aria-current={index === active}
          >
            <span className="schemeStageNumber">
              {String(index + 1).padStart(2, "0")}
            </span>

            <strong>{stage.title}</strong>

            <small>{stage.sub}</small>

            <span className="schemeStagePipe" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* ПОКАЗАТЕЛИ */}
      <div className="schemeMetrics">
        <MetricCard
          name={c.metrics.ss}
          value={values.ss}
          start={VALUES[0].ss}
          norm={NORMS.ss}
          unit={c.unit}
          normLabel={c.normLabel}
          language={language}
        />

        <MetricCard
          name={c.metrics.oil}
          value={values.oil}
          start={VALUES[0].oil}
          norm={NORMS.oil}
          unit={c.unit}
          normLabel={c.normLabel}
          language={language}
        />

        <MetricCard
          name={c.metrics.bod}
          value={values.bod}
          start={VALUES[0].bod}
          norm={NORMS.bod}
          unit={c.unit}
          normLabel={c.normLabel}
          language={language}
        />
      </div>

      {/* УПРАВЛЕНИЕ */}
      <div className="schemeControls">
        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label={c.prev}
          className="schemeArrow"
        >
          ←
        </button>

        <div className="schemeDots">
          {c.stages.map((stage, index) => (
            <button
              type="button"
              key={stage.title}
              onClick={() => go(index)}
              aria-label={stage.title}
              className={index === active ? "active" : ""}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label={c.next}
          className="schemeArrow"
        >
          →
        </button>
      </div>

      <p className="schemeSource">{c.source}</p>
    </section>
  );
}

type MetricCardProps = {
  name: string;
  value: number;
  start: number;
  norm: number;
  unit: string;
  normLabel: string;
  language: Language;
};

function MetricCard({
  name,
  value,
  start,
  norm,
  unit,
  normLabel,
  language,
}: MetricCardProps) {
  const animated = useAnimatedNumber(value);
  const ok = value <= norm;
  const width = Math.max(2, Math.min(100, (value / start) * 100));

  return (
    <div className={`schemeMetric ${ok ? "ok" : "over"}`}>
      <span className="schemeMetricName">{name}</span>

      <strong className="schemeMetricValue">
        {format(animated, language)}
        <em>{unit}</em>
      </strong>

      <div className="schemeMetricBar">
        <i style={{ width: `${width}%` }} />
      </div>

      <span className="schemeMetricNorm">
        {normLabel} {format(norm, language)} {unit}
      </span>
    </div>
  );
}
