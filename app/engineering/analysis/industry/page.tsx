"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  GENERIC_INDUSTRY_ID,
  INDUSTRIES,
  INDUSTRY_GROUPS,
  POLLUTANT_LABELS,
  defaultValue,
  findIndustry,
  isGenericIndustry,
  type PollutantKey,
} from "./industries";
import { DISCHARGES, findDischarge } from "./targets";
import { MEMBRANE_TECHNOLOGIES } from "./equipment";
import type { TechnologyCode } from "../../../../calculations/technology";
import { BIO_TECHNOLOGIES, t, ui } from "./i18n";
import { useLanguage } from "../../../LanguageContext";
import {
  DEFAULT_WATER_USE_HORIZON,
  KMK_2_04_03_19_DOC,
  LOCAL_INDUSTRY_SHARE,
  TABLE_3_NOTES,
  TABLE_3_WATER_USE,
  specificWaterUse,
  type SettlementCategory,
  type WaterUseHorizon,
} from "../../../../norms/kmk-2-04-03-19";
import {
  MEMBRANE_REQUIRED_BY_DEFAULT,
  REQUIRED_TECHNOLOGY,
  requirementNote,
} from "../../../../norms/uz-membrane-requirement";

/**
 * Технология биоблока по умолчанию: при действующем требовании об
 * обязательной мембранной очистке это MBR, иначе — прежний автоподбор.
 * Формулировку требования даёт только norms/uz-membrane-requirement.ts.
 */
const DEFAULT_TECH: string = MEMBRANE_REQUIRED_BY_DEFAULT ? REQUIRED_TECHNOLOGY : "auto";

/* ==================================================================
 * ЕДИНЫЙ ШАГ: ИСХОДНЫЕ ДАННЫЕ
 *
 * Сюда сведены обе прежние ветки мастера: ручной ввод расхода с
 * выбором технологии и расчёт по отраслевому справочнику.
 * Проектировщик задаёт объект (отрасль из справочника либо позицию
 * «объекта нет в списке»), расход (известный или по числу жителей
 * согласно табл. 3 ҚМҚ 2.04.03-19), состав стока (лабораторный или
 * справочный), точку сброса и — при наличии биологической ступени —
 * технологию биологической очистки. Дальше — производственный
 * расчёт (pro-result): схема, спецификация, чертежи, записка.
 *
 * Нормативная часть расхода по населению полностью совпадает с шагом
 * flow/page.tsx: тот же модуль norms/kmk-2-04-03-19.ts, те же имена
 * URL-параметров (mode, people, category, year, additionalPercent,
 * specificFlow) — цифры на обеих страницах обязаны совпадать.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const KEY_ORDER: PollutantKey[] = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf"];

/** Категории табл. 3 ҚМҚ 2.04.03-19 — тот же порядок, что на шаге flow. */
const SETTLEMENT_CATEGORIES: readonly SettlementCategory[] = [
  "city-over-100k",
  "city-under-100k",
  "town-under-50k",
];

function parseSettlementCategory(raw: string | null): SettlementCategory {
  if (raw && (SETTLEMENT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as SettlementCategory;
  }
  /* совместимость со старыми ключами страницы flow */
  if (raw === "over100-central") return "city-over-100k";
  if (raw === "under100-central") return "city-under-100k";
  return "town-under-50k";
}

/**
 * Объекты, для которых расход естественнее считать по числу жителей
 * или мест: режим «по населению» включается сразу при их выборе.
 * Запрета на этот режим для остальных отраслей нет.
 */
const POPULATION_FIRST = new Set([
  "settlement",
  "hotel",
  "hospital",
  "school",
  "restaurant",
  "mall",
]);

const ADDITIONAL_PERCENTS = ["0", "5", "10", "15"] as const;

const inputStyle = {
  display: "block",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: "rgba(0,0,0,0.25)",
  color: "#f5f8fa",
  fontSize: 15,
  boxSizing: "border-box",
} as const;

function IndustryContent() {
  const { language } = useLanguage();
  const U = useMemo(() => ui(language), [language]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "";

  const [groupId, setGroupId] = useState<string>("food");
  const [industryId, setIndustryId] = useState<string>("");
  const [hasLab, setHasLab] = useState<boolean | null>(null);
  const [flowMode, setFlowMode] = useState<"known" | "population">("known");
  const [flow, setFlow] = useState("");
  const [people, setPeople] = useState("");
  const [category, setCategory] = useState<SettlementCategory>("town-under-50k");
  const [year, setYear] = useState<WaterUseHorizon>(DEFAULT_WATER_USE_HORIZON);
  const [additionalPercent, setAdditionalPercent] = useState("0");
  const [tech, setTech] = useState<string>(DEFAULT_TECH);
  const [hours, setHours] = useState("16");
  const [values, setValues] = useState<Record<string, string>>({});
  const [ph, setPh] = useState("");
  const [discharge, setDischarge] = useState<string>("sewer");
  const [hasTu, setHasTu] = useState(false);
  const [tu, setTu] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const industry = useMemo(
    () => (industryId ? findIndustry(industryId) : undefined),
    [industryId]
  );

  /** «объекта нет в списке»: справочные концентрации не подставляются */
  const generic = isGenericIndustry(industryId);

  /** удельное водоотведение по п. 2.9, табл. 3 ҚМҚ 2.04.03-19 */
  const specificRow = useMemo(
    () => (flowMode === "population" ? specificWaterUse(category, year) : null),
    [flowMode, category, year]
  );
  const specificFlow = specificRow?.lpcd ?? null;

  /**
   * Расход: тот же расчёт, что на шаге flow/page.tsx —
   * жители × удельное водоотведение / 1000 × (1 + доп. %).
   */
  const computedFlow = useMemo(() => {
    let base = 0;

    if (flowMode === "known") {
      base = parseFloat(flow.replace(",", "."));
    } else if (specificFlow !== null) {
      const peopleValue = parseFloat(people.replace(",", "."));
      if (Number.isFinite(peopleValue) && peopleValue > 0) {
        base = (peopleValue * specificFlow) / 1000;
      }
    }

    if (!Number.isFinite(base) || base <= 0) return null;

    const extra = Number(additionalPercent);
    const safeExtra = Number.isFinite(extra) && extra >= 0 && extra <= 15 ? extra : 0;
    const daily = base * (1 + safeExtra / 100);

    return { base, daily: Math.round(daily * 1000) / 1000, extra: safeExtra };
  }, [flowMode, flow, people, specificFlow, additionalPercent]);

  /** ступени отрасли: селектор технологии нужен только при биологии */
  const hasBioStage = industry ? industry.chain.includes("bio") : false;

  /**
   * Отступление от требования об обязательной мембранной очистке:
   * инженер выбрал не мембранную технологию вручную. Автоподбор
   * («auto») отступлением не является — при действующем требовании он
   * тоже даёт MBR, это разбирается в pro-result.
   */
  const mbrWaiver =
    MEMBRANE_REQUIRED_BY_DEFAULT &&
    hasBioStage &&
    tech !== "auto" &&
    !MEMBRANE_TECHNOLOGIES.includes(tech as TechnologyCode);

  /** какие показатели показываем: у «объекта нет в списке» — все */
  const activeKeys = useMemo(
    () =>
      generic
        ? KEY_ORDER
        : KEY_ORDER.filter((key) => industry?.pollutants[key] !== undefined),
    [generic, industry]
  );

  function pickIndustry(id: string) {
    setIndustryId(id);
    setError("");

    const item = findIndustry(id);
    if (!item) return;

    if (isGenericIndustry(id)) {
      /* состав стока целиком за пользователем — режим «есть анализ» */
      setHasLab(true);
      setValues({});
      setPh("");
    } else {
      setHasLab(null);

      const next: Record<string, string> = {};
      for (const key of KEY_ORDER) {
        const range = item.pollutants[key];
        if (range) next[key] = String(defaultValue(range));
      }
      setValues(next);
      setPh(((item.ph[0] + item.ph[1]) / 2).toFixed(1));
    }

    /* для жилых и общественных объектов расход удобнее считать по людям */
    if (POPULATION_FIRST.has(id)) setFlowMode("population");

    /* технология сбрасывается к значению по умолчанию, если у новой отрасли нет биологии */
    if (!item.chain.includes("bio")) setTech(DEFAULT_TECH);
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!industry) {
      setError(U.errNoIndustry);
      return;
    }
    if (hasLab === null) {
      setError(U.errNoLab);
      return;
    }
    if (flowMode === "population" && !computedFlow) {
      setError(U.errNoPeople);
      return;
    }
    if (!computedFlow) {
      setError(U.errNoFlow);
      return;
    }

    const q = computedFlow.daily;

    const params = new URLSearchParams();
    params.set("object", object);
    params.set("industry", industry.id);
    params.set("lab", hasLab ? "1" : "0");
    params.set("flow", String(q));
    params.set("hours", hours);
    for (const key of KEY_ORDER) {
      if (values[key] !== undefined) params.set(key, values[key]);
    }
    params.set("ph", ph);
    params.set("out", discharge);
    if (hasTu) {
      params.set("tu", "1");
      for (const key of Object.keys(tu)) {
        if (tu[key] !== undefined && tu[key] !== "") params.set(`t_${key}`, tu[key]);
      }
    }

    /* как задан расход — чтобы pro-result мог показать основание */
    params.set("mode", flowMode);
    params.set("additionalPercent", String(computedFlow.extra));
    if (flowMode === "population") {
      params.set("people", people);
      params.set("category", category);
      params.set("year", String(year));
      if (specificFlow !== null) params.set("specificFlow", String(specificFlow));
    }

    /* технологию передаём только если она задана вручную */
    if (hasBioStage && tech !== "auto") params.set("tech", tech);

    /* снятие требования об обязательной мембранной очистке — осознанное
       решение инженера, оно должно быть видно в расчёте и в записке */
    if (mbrWaiver) params.set("mbrWaiver", "1");

    router.push(`/engineering/analysis/pro-result?${params.toString()}`);
  }

  const groupIndustries = INDUSTRIES.filter((item) => item.group === groupId);

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "60px 24px 110px" }}>
      <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer", marginBottom: 26 }}
        >
          ← {U.back}
        </button>

        <div style={{ fontSize: 13, letterSpacing: "0.14em", color: ACCENT, marginBottom: 10 }}>
          {U.stepInput}
        </div>

        <h1 style={{ fontSize: 32, margin: "0 0 10px" }}>{U.inputTitle}</h1>

        <p style={{ color: FAINT, maxWidth: 700, lineHeight: 1.6, margin: "0 0 8px" }}>
          {U.inputLead}
        </p>

        <p style={{ color: FAINT, maxWidth: 700, lineHeight: 1.6, margin: "0 0 30px", fontSize: 13 }}>
          {U.pageLead}
        </p>

        <form onSubmit={handleContinue}>
          {/* ГРУППЫ */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {INDUSTRY_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setGroupId(group.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `1px solid ${group.id === groupId ? ACCENT : LINE}`,
                  background: group.id === groupId ? "rgba(62,195,230,0.12)" : "transparent",
                  color: group.id === groupId ? "#eaf6fa" : FAINT,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t(group.name, language)}
              </button>
            ))}
          </div>

          {/* ОТРАСЛИ ГРУППЫ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 10,
              marginBottom: 30,
            }}
          >
            {groupIndustries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickIndustry(item.id)}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${item.id === industryId ? ACCENT : LINE}`,
                  background: item.id === industryId ? "rgba(62,195,230,0.10)" : PANEL,
                  color: "#f5f8fa",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t(item.name, language)}</div>
                <div style={{ fontSize: 12, color: FAINT }}>{t(item.flowHint, language)}</div>
              </button>
            ))}
          </div>

          {/* ОБЪЕКТА НЕТ В СПРАВОЧНИКЕ */}
          <button
            type="button"
            onClick={() => pickIndustry(GENERIC_INDUSTRY_ID)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px dashed ${generic ? ACCENT : LINE}`,
              background: generic ? "rgba(62,195,230,0.10)" : "transparent",
              color: "#f5f8fa",
              cursor: "pointer",
              marginBottom: 30,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{U.genericButton}</div>
            <div style={{ fontSize: 12, color: FAINT }}>{U.genericButtonHint}</div>
          </button>

          {industry && (
            <>
              {/* РАСХОД */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px 22px 18px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 14 }}>
                  {U.flowSection}
                </div>

                {/* РЕЖИМ ЗАДАНИЯ РАСХОДА */}
                <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, marginBottom: 8 }}>
                  {U.flowModeTitle}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  {([
                    { id: "known" as const, title: U.flowModeKnown, hint: U.flowModeKnownHint },
                    { id: "population" as const, title: U.flowModePopulation, hint: U.flowModePopulationHint },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFlowMode(item.id)}
                      style={{
                        flex: "1 1 260px",
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: `1px solid ${flowMode === item.id ? ACCENT : LINE}`,
                        background: flowMode === item.id ? "rgba(62,195,230,0.12)" : "transparent",
                        color: "#f5f8fa",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5 }}>{item.hint}</div>
                    </button>
                  ))}
                </div>

                {flowMode === "known" ? (
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.flowPerDay}
                      <input
                        value={flow}
                        onChange={(event) => setFlow(event.target.value)}
                        placeholder={U.flowPlaceholder}
                        inputMode="decimal"
                        style={{ ...inputStyle, width: 180 }}
                      />
                    </label>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.workHours}
                      <input
                        value={hours}
                        onChange={(event) => setHours(event.target.value)}
                        inputMode="numeric"
                        style={{ ...inputStyle, width: 120 }}
                      />
                    </label>
                    <div style={{ fontSize: 12, color: FAINT, alignSelf: "flex-end", maxWidth: 320 }}>
                      {U.industryHint}: {t(industry.flowHint, language)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.peopleLabel}
                        <input
                          value={people}
                          onChange={(event) => setPeople(event.target.value)}
                          placeholder={U.peoplePlaceholder}
                          inputMode="numeric"
                          style={{ ...inputStyle, width: 180 }}
                        />
                      </label>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.horizonLabel}
                        <select
                          value={String(year)}
                          onChange={(event) => setYear(event.target.value === "2020" ? 2020 : 2035)}
                          style={{ ...inputStyle, width: 260 }}
                        >
                          <option value="2035">{U.horizon2035}</option>
                          <option value="2020">{U.horizon2020}</option>
                        </select>
                      </label>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.workHours}
                        <input
                          value={hours}
                          onChange={(event) => setHours(event.target.value)}
                          inputMode="numeric"
                          style={{ ...inputStyle, width: 120 }}
                        />
                      </label>
                    </div>

                    <label style={{ display: "block", fontSize: 13, color: FAINT, marginTop: 16 }}>
                      {U.settlementCategoryLabel}
                      <select
                        value={category}
                        onChange={(event) => setCategory(parseSettlementCategory(event.target.value))}
                        style={{ ...inputStyle, width: "100%", maxWidth: 720 }}
                      >
                        {SETTLEMENT_CATEGORIES.map((id) => {
                          const row = TABLE_3_WATER_USE[id];
                          return (
                            <option key={id} value={id}>
                              {row.label} — {row.lps[2020]} / {row.lps[2035]} {U.unitLpcd} (2020 / 2035)
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    {specificRow && (
                      <p style={{ fontSize: 12, color: FAINT, margin: "12px 0 0", lineHeight: 1.6 }}>
                        {U.specificUseLabel}:{" "}
                        <b style={{ color: "#dfe9ec" }}>{specificRow.lpcd}</b> {U.unitLpcd}
                        <br />
                        <span style={{ color: "#6f8792", fontSize: 11 }}>{specificRow.source}</span>
                      </p>
                    )}
                  </>
                )}

                {/* ДОПОЛНИТЕЛЬНЫЙ ПРОЦЕНТ */}
                <label style={{ display: "block", fontSize: 13, color: FAINT, marginTop: 18 }}>
                  {U.addPercentLabel}
                  <select
                    value={additionalPercent}
                    onChange={(event) => setAdditionalPercent(event.target.value)}
                    style={{ ...inputStyle, width: "100%", maxWidth: 560 }}
                  >
                    {ADDITIONAL_PERCENTS.map((value) => (
                      <option key={value} value={value}>
                        {value === "0"
                          ? U.addPercent0
                          : value === "5"
                          ? U.addPercent5
                          : value === "10"
                          ? U.addPercent10
                          : U.addPercent15}
                      </option>
                    ))}
                  </select>
                </label>

                <p style={{ fontSize: 11, color: "#6f8792", margin: "10px 0 0", lineHeight: 1.6 }}>
                  {LOCAL_INDUSTRY_SHARE.ref} — {LOCAL_INDUSTRY_SHARE.value * 100} %.
                </p>

                {flowMode === "population" && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", color: FAINT, marginBottom: 6 }}>
                      {U.table3NotesTitle} ({KMK_2_04_03_19_DOC.code})
                    </div>
                    {TABLE_3_NOTES.map((note) => (
                      <p key={note} style={{ fontSize: 11, color: "#6f8792", margin: "0 0 5px", lineHeight: 1.55 }}>
                        {note}
                      </p>
                    ))}
                  </div>
                )}

                {computedFlow && (
                  <p style={{ fontSize: 13, color: "#dfe9ec", margin: "16px 0 0", lineHeight: 1.6 }}>
                    {U.computedFlowLabel}: <b style={{ color: ACCENT }}>{computedFlow.daily}</b>{" "}
                    {U.unitM3Day}
                    {flowMode === "population" && (
                      <span style={{ color: FAINT, fontSize: 11 }}> — {U.computedFlowFormula}</span>
                    )}
                  </p>
                )}
              </div>

              {/* КУДА СБРАСЫВАЕМ */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
                  {U.dischargeSection}
                </div>
                <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>
                  {U.dischargeLead}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {DISCHARGES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDischarge(d.id)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: `1px solid ${discharge === d.id ? ACCENT : LINE}`,
                        background: discharge === d.id ? "rgba(62,195,230,0.14)" : "transparent",
                        color: discharge === d.id ? "#eaf6fa" : FAINT,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {t(d.name, language)}
                    </button>
                  ))}
                </div>

                {(() => {
                  const d = findDischarge(discharge);
                  if (!d) return null;
                  return (
                    <>
                      <p style={{ fontSize: 12, color: FAINT, margin: "0 0 10px", lineHeight: 1.6 }}>
                        {t(d.hint, language)}. {t(d.note, language)}
                      </p>
                      <p style={{ fontSize: 11, color: "#6f8792", margin: "0 0 14px" }}>
                        {U.basisLabel}: {t(d.source, language)}
                      </p>

                      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#cfdde3", cursor: "pointer" }}>
                        <input type="checkbox" checked={hasTu} onChange={(e) => setHasTu(e.target.checked)} />
                        {U.hasTu}
                      </label>

                      {hasTu && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 14 }}>
                          {KEY_ORDER.map((key) => (
                            <label key={key} style={{ fontSize: 12, color: FAINT }}>
                              {t(POLLUTANT_LABELS[key].label, language)}, {t(POLLUTANT_LABELS[key].unit, language)}
                              <input
                                value={tu[key] ?? (d.targets[key] !== undefined ? String(d.targets[key]) : "")}
                                onChange={(e) => setTu({ ...tu, [key]: e.target.value })}
                                inputMode="decimal"
                                placeholder={U.tuPlaceholder}
                                style={{
                                  display: "block", marginTop: 6, width: "100%", padding: "9px 10px",
                                  borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.25)",
                                  color: "#f5f8fa", fontSize: 14, boxSizing: "border-box",
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* ЛАБОРАТОРИЯ */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 14 }}>
                  {U.labSection}
                </div>

                {generic && (
                  <p style={{ fontSize: 12, color: FAINT, margin: "0 0 16px", lineHeight: 1.6 }}>
                    {U.genericManualNote}
                  </p>
                )}

                <div style={{ display: generic ? "none" : "flex", gap: 10, marginBottom: 18 }}>
                  <button
                    type="button"
                    onClick={() => setHasLab(true)}
                    style={{
                      padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${hasLab === true ? ACCENT : LINE}`,
                      background: hasLab === true ? "rgba(62,195,230,0.12)" : "transparent",
                      color: hasLab === true ? "#eaf6fa" : FAINT,
                    }}
                  >
                    {U.labYes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasLab(false)}
                    style={{
                      padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${hasLab === false ? ACCENT : LINE}`,
                      background: hasLab === false ? "rgba(62,195,230,0.12)" : "transparent",
                      color: hasLab === false ? "#eaf6fa" : FAINT,
                    }}
                  >
                    {U.labNo}
                  </button>
                </div>

                {hasLab !== null && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                        gap: 14,
                      }}
                    >
                      {activeKeys.map((key) => {
                        const range = industry.pollutants[key];
                        const info = POLLUTANT_LABELS[key];
                        return (
                          <label key={key} style={{ fontSize: 12, color: FAINT }}>
                            {t(info.label, language)}, {t(info.unit, language)}
                            {hasLab ? (
                              <input
                                value={values[key] ?? ""}
                                onChange={(event) =>
                                  setValues({ ...values, [key]: event.target.value })
                                }
                                inputMode="decimal"
                                style={{
                                  display: "block", marginTop: 5, width: "100%", padding: "9px 11px",
                                  borderRadius: 8, border: `1px solid ${LINE}`,
                                  background: "rgba(0,0,0,0.25)", color: "#f5f8fa", fontSize: 15,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  marginTop: 5, padding: "9px 11px", borderRadius: 8,
                                  border: `1px dashed ${LINE}`, color: "#dfe9ec", fontSize: 15,
                                }}
                              >
                                {values[key]}
                                {range && (
                                  <span style={{ color: FAINT, fontSize: 11 }}>
                                    {" "}({range[0]}–{range[1]})
                                  </span>
                                )}
                              </div>
                            )}
                          </label>
                        );
                      })}

                      <label style={{ fontSize: 12, color: FAINT }}>
                        pH
                        {hasLab ? (
                          <input
                            value={ph}
                            onChange={(event) => setPh(event.target.value)}
                            inputMode="decimal"
                            style={{
                              display: "block", marginTop: 5, width: "100%", padding: "9px 11px",
                              borderRadius: 8, border: `1px solid ${LINE}`,
                              background: "rgba(0,0,0,0.25)", color: "#f5f8fa", fontSize: 15,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              marginTop: 5, padding: "9px 11px", borderRadius: 8,
                              border: `1px dashed ${LINE}`, color: "#dfe9ec", fontSize: 15,
                            }}
                          >
                            {ph}
                            <span style={{ color: FAINT, fontSize: 11 }}>
                              {" "}({industry.ph[0]}–{industry.ph[1]})
                            </span>
                          </div>
                        )}
                      </label>
                    </div>

                    {!hasLab && (
                      <p style={{ fontSize: 12, color: FAINT, margin: "16px 0 0", lineHeight: 1.6 }}>
                        {U.refMidNote} ({industry.sources.map((x) => t(x, language)).join("; ")})
                      </p>
                    )}

                    {industry.special && industry.special.length > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "#ffb74d", marginBottom: 8 }}>
                          {U.specialIndustryTitle}
                        </div>
                        {industry.special.map((spec) => (
                          <div key={t(spec.label, language)} style={{ fontSize: 13, color: "#dfe9ec", marginBottom: 8, lineHeight: 1.55 }}>
                            <b>{t(spec.label, language)}</b>: {spec.range[0]}–{spec.range[1]} {t(spec.unit, language)}.{" "}
                            <span style={{ color: FAINT }}>{t(spec.note, language)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ТЕХНОЛОГИЯ БИОЛОГИЧЕСКОЙ ОЧИСТКИ */}
              {hasBioStage && (
                <div
                  style={{
                    border: `1px solid ${LINE}`,
                    background: PANEL,
                    borderRadius: 12,
                    padding: "22px",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
                    {U.techSection}
                  </div>
                  <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>
                    {MEMBRANE_REQUIRED_BY_DEFAULT ? U.techLeadMembrane : U.techLead}
                  </p>

                  {/* ТРЕБОВАНИЕ ОБЯЗАТЕЛЬНОЙ МЕМБРАННОЙ ОЧИСТКИ.
                      Текст ссылки — только из norms/uz-membrane-requirement.ts */}
                  {MEMBRANE_REQUIRED_BY_DEFAULT && (
                    <div
                      style={{
                        border: "1px solid rgba(62,195,230,0.55)",
                        background: "rgba(62,195,230,0.10)",
                        borderRadius: 10,
                        padding: "14px 16px",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 8 }}>
                        {U.mbrBannerTitle}
                      </div>
                      <p style={{ fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>{U.mbrBannerText}</p>
                      <p style={{ fontSize: 12.5, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.6 }}>
                        {U.mbrBannerExplain}
                      </p>
                      <p style={{ fontSize: 12, color: FAINT, margin: 0, lineHeight: 1.6 }}>{U.mbrFineScreen}</p>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setTech("auto")}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: `1px solid ${tech === "auto" ? ACCENT : LINE}`,
                        background: tech === "auto" ? "rgba(62,195,230,0.10)" : "transparent",
                        color: "#f5f8fa",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{U.techAuto}</div>
                      <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5 }}>{U.techAutoHint}</div>
                      {MEMBRANE_REQUIRED_BY_DEFAULT && (
                        <div style={{ fontSize: 11.5, color: ACCENT, lineHeight: 1.5, marginTop: 6 }}>
                          {U.mbrAutoNote}
                        </div>
                      )}
                    </button>

                    {BIO_TECHNOLOGIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTech(item.id)}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 10,
                          border: `1px solid ${tech === item.id ? ACCENT : LINE}`,
                          background: tech === item.id ? "rgba(62,195,230,0.10)" : "transparent",
                          color: "#f5f8fa",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                          {t(item.title, language)}
                        </div>
                        <div style={{ fontSize: 12, color: "#cfdde3", marginBottom: 6 }}>
                          {t(item.subtitle, language)}
                        </div>
                        <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5, marginBottom: 6 }}>
                          {t(item.when, language)}
                        </div>
                        <div style={{ fontSize: 11, color: item.normed ? "#8fd0a8" : "#a3853f", lineHeight: 1.45 }}>
                          {item.normed ? U.techNormed : U.techNotNormed}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* выбрана не мембранная схема — отступление от требования */}
                  {mbrWaiver && (
                    <div
                      style={{
                        marginTop: 14,
                        border: "1px solid rgba(255,183,77,0.45)",
                        background: "rgba(255,183,77,0.07)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 8 }}>
                        {U.mbrWaiverTitle}
                      </div>
                      <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>{requirementNote(false)}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {error && (
            <div style={{ color: "#ff8a80", fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              padding: "14px 34px", borderRadius: 10, border: 0, cursor: "pointer",
              background: ACCENT, color: "#06232e", fontSize: 16, fontWeight: 700,
            }}
          >
            {U.calcButton} →
          </button>
        </form>
      </div>
    </main>
  );
}

export default function IndustryPage() {
  return (
    <Suspense fallback={null}>
      <IndustryContent />
    </Suspense>
  );
}
