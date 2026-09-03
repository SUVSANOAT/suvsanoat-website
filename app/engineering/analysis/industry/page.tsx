"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  INDUSTRIES,
  INDUSTRY_GROUPS,
  POLLUTANT_LABELS,
  defaultValue,
  findIndustry,
  type PollutantKey,
} from "./industries";
import { DISCHARGES, findDischarge } from "./targets";
import { t, ui } from "./i18n";
import { useLanguage } from "../../../LanguageContext";

/* ==================================================================
 * ШАГ: ОТРАСЛЬ И ИСХОДНЫЙ СОСТАВ СТОКА
 *
 * Проектировщик выбирает отрасль. Если есть лабораторный анализ —
 * вводит фактические концентрации; если нет — берутся справочные
 * значения (середина отраслевого диапазона) с пометкой источника.
 * Дальше — производственный расчёт (pro-result).
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const KEY_ORDER: PollutantKey[] = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf"];

function IndustryContent() {
  const { language } = useLanguage();
  const U = useMemo(() => ui(language), [language]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "";

  const [groupId, setGroupId] = useState<string>("food");
  const [industryId, setIndustryId] = useState<string>("");
  const [hasLab, setHasLab] = useState<boolean | null>(null);
  const [flow, setFlow] = useState("");
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

  function pickIndustry(id: string) {
    setIndustryId(id);
    setHasLab(null);
    setError("");

    const item = findIndustry(id);
    if (!item) return;

    const next: Record<string, string> = {};
    for (const key of KEY_ORDER) {
      const range = item.pollutants[key];
      if (range) next[key] = String(defaultValue(range));
    }
    setValues(next);
    setPh(((item.ph[0] + item.ph[1]) / 2).toFixed(1));
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
    const q = parseFloat(flow.replace(",", "."));
    if (!q || q <= 0) {
      setError(U.errNoFlow);
      return;
    }

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
          {U.stepIndustry}
        </div>

        <h1 style={{ fontSize: 32, margin: "0 0 10px" }}>{U.pageTitle}</h1>

        <p style={{ color: FAINT, maxWidth: 640, lineHeight: 1.6, margin: "0 0 30px" }}>
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
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 13, color: FAINT }}>
                    {U.flowPerDay}
                    <input
                      value={flow}
                      onChange={(event) => setFlow(event.target.value)}
                      placeholder={U.flowPlaceholder}
                      inputMode="decimal"
                      style={{
                        display: "block", marginTop: 6, width: 180, padding: "10px 12px",
                        borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.25)",
                        color: "#f5f8fa", fontSize: 15,
                      }}
                    />
                  </label>
                  <label style={{ fontSize: 13, color: FAINT }}>
                    {U.workHours}
                    <input
                      value={hours}
                      onChange={(event) => setHours(event.target.value)}
                      inputMode="numeric"
                      style={{
                        display: "block", marginTop: 6, width: 120, padding: "10px 12px",
                        borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.25)",
                        color: "#f5f8fa", fontSize: 15,
                      }}
                    />
                  </label>
                  <div style={{ fontSize: 12, color: FAINT, alignSelf: "flex-end", maxWidth: 320 }}>
                    {U.industryHint}: {t(industry.flowHint, language)}
                  </div>
                </div>
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

                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
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
                      {KEY_ORDER.filter((key) => industry.pollutants[key]).map((key) => {
                        const range = industry.pollutants[key]!;
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
                                <span style={{ color: FAINT, fontSize: 11 }}>
                                  {" "}({range[0]}–{range[1]})
                                </span>
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
