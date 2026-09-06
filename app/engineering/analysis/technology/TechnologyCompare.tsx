"use client";

/* ==================================================================
 * СРАВНЕНИЕ ВАРИАНТОВ ТЕХНОЛОГИЙ — БЛОК НА СТРАНИЦЕ ВЫБОРА
 *
 * Считает calculations/compare.ts по тем же исходным данным, что уже
 * введены в мастере, и показывает варианты рядом. Блок свёрнут по
 * умолчанию: проектировщику, который уже знает, что ставит, он не
 * нужен, а заказчику, который спрашивает «почему не классика» —
 * нужен именно он.
 *
 * Лучшее значение в строке подсвечивается, но сводного балла нет:
 * какой показатель важнее, решает не программа (см. verdict).
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  compareTechnologies,
  COMPARABLE,
  type CompareCode,
} from "../../../../calculations/compare";

type Props = {
  flowM3Day: number;
  hoursPerDay: number;
  bodMgL: number;
  codMgL: number;
  tssMgL: number;
  nitrogenMgL: number;
  phosphorusMgL: number;
  waterTempAnnualC?: number;
  waterTempSummerC?: number;
  /** выбранная в мастере технология — подсвечивается в таблице */
  selected?: string;
  /** выбрать технологию прямо из сравнения */
  onSelect?: (code: CompareCode) => void;
};

/** Технология мастера → код расчёта: на странице классический аэротенк
 *  обозначен «AS», в расчётном модуле — «CAS». */
function normalize(id: string | undefined): CompareCode | null {
  if (!id) return null;
  const v = id === "AS" ? "CAS" : id;
  return (COMPARABLE as readonly string[]).includes(v) ? (v as CompareCode) : null;
}

export default function TechnologyCompare(props: Props) {
  const [open, setOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const ready = props.flowM3Day > 0 && props.bodMgL > 0;

  const result = useMemo(() => {
    if (!ready) return null;
    return compareTechnologies({
      technology: "CAS",
      flowM3Day: props.flowM3Day,
      hoursPerDay: props.hoursPerDay || 24,
      bodMgL: props.bodMgL,
      codMgL: props.codMgL,
      tssMgL: props.tssMgL,
      nitrogenMgL: props.nitrogenMgL,
      phosphorusMgL: props.phosphorusMgL,
      waterTempAnnualC: props.waterTempAnnualC,
      waterTempSummerC: props.waterTempSummerC,
    });
  }, [
    ready,
    props.flowM3Day,
    props.hoursPerDay,
    props.bodMgL,
    props.codMgL,
    props.tssMgL,
    props.nitrogenMgL,
    props.phosphorusMgL,
    props.waterTempAnnualC,
    props.waterTempSummerC,
  ]);

  const selected = normalize(props.selected);

  if (!ready) {
    return (
      <section style={card}>
        <div style={head}>СРАВНЕНИЕ ВАРИАНТОВ</div>
        <p style={hint}>
          Чтобы сравнить технологии между собой, нужны расход и БПК. Вернитесь на шаг
          «Нагрузка» и заполните их — расчёт пойдёт по ҚМҚ 2.04.03-19.
        </p>
      </section>
    );
  }

  if (!result) return null;

  const codes = result.options.map((o) => o.technology);

  /** индекс лучшего значения в строке — только там, где «лучше» определено */
  function bestOf(values: Record<CompareCode, number>, better: "low" | "high" | "none") {
    if (better === "none") return null;
    const pairs = codes
      .map((c) => ({ c, v: values[c] }))
      .filter((p) => Number.isFinite(p.v) && p.v > 0);
    if (pairs.length < 2) return null;
    const sorted = [...pairs].sort((a, b) => (better === "low" ? a.v - b.v : b.v - a.v));
    // если два варианта совпали — не выделяем ни один, это не преимущество
    if (sorted.length > 1 && sorted[0].v === sorted[1].v) return null;
    return sorted[0].c;
  }

  return (
    <section style={card}>
      <button type="button" onClick={() => setOpen(!open)} style={toggle}>
        <span style={head}>СРАВНЕНИЕ ВАРИАНТОВ НА ОДНОМ РАСХОДЕ</span>
        <span style={{ color: "#5fb6c9", fontSize: 13 }}>
          {open ? "свернуть" : "показать таблицу"}
        </span>
      </button>

      {!open && (
        <p style={hint}>
          Пять аэробных схем посчитаны на ваши {props.flowM3Day} м³/сут: объём, отстойники,
          площадь, воздух, ил и качество на выходе — рядом, по одним и тем же формулам.
        </p>
      )}

      {open && (
        <>
          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left", minWidth: 260 }}>Показатель</th>
                  {result.options.map((o) => (
                    <th
                      key={o.technology}
                      style={{
                        ...th,
                        color: o.technology === selected ? "#5fb6c9" : "#b7cbd3",
                      }}
                    >
                      {o.technology}
                      {o.technology === selected && (
                        <div style={{ fontSize: 10, fontWeight: 400, color: "#5fb6c9" }}>
                          выбрано
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const best = bestOf(row.values, row.better);
                  return (
                    <tr key={row.key}>
                      <td style={tdLabel}>
                        {row.label}, {row.unit}
                        <div style={refStyle}>{row.ref}</div>
                      </td>
                      {codes.map((c) => {
                        const v = row.values[c];
                        return (
                          <td
                            key={c}
                            style={{
                              ...td,
                              color: c === best ? "#7ee0a1" : "#e7eef1",
                              fontWeight: c === best ? 700 : 400,
                            }}
                          >
                            {v > 0 ? v.toLocaleString("ru-RU") : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <td style={tdLabel}>
                    Нужна ступень доочистки
                    <div style={refStyle}>п. 6.10 — 3–6 мг/л по ВВ</div>
                  </td>
                  {result.options.map((o) => (
                    <td key={o.technology} style={td}>
                      {o.needsTertiary ? "да" : "нет"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ ...hint, marginTop: 14 }}>
            Зелёным — лучшее значение в строке. Прочерк означает, что сооружения нет:
            у SBR отстаивание идёт в самом реакторе, у MBR разделение — на мембране.
          </p>

          {/* ЗА И ПРОТИВ */}

          <div style={prosGrid}>
            {result.options.map((o) => (
              <div
                key={o.technology}
                style={{
                  ...prosCard,
                  borderColor: o.technology === selected ? "#2a5b68" : "#1c3742",
                }}
              >
                <div style={{ color: "#b7cbd3", fontWeight: 700, marginBottom: 8 }}>
                  {o.name}
                </div>
                {o.pros.map((p) => (
                  <div key={p} style={proLine}>
                    + {p}
                  </div>
                ))}
                {o.cons.map((c) => (
                  <div key={c} style={conLine}>
                    − {c}
                  </div>
                ))}
                {props.onSelect && o.technology !== selected && (
                  <button
                    type="button"
                    style={pickButton}
                    onClick={() => props.onSelect?.(o.technology)}
                  >
                    Выбрать этот вариант
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ЧЕСТНАЯ ЧАСТЬ */}

          <div style={verdictBox}>{result.verdict}</div>

          <button type="button" onClick={() => setShowNotes(!showNotes)} style={linkButton}>
            {showNotes ? "Скрыть допущения расчёта" : `Допущения расчёта (${result.assumptions.length})`}
          </button>

          {showNotes && (
            <ul style={notes}>
              {result.assumptions.map((a) => (
                <li key={a} style={{ marginBottom: 8 }}>
                  {a}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

/* ---------------------------- стили ---------------------------- */

const card: CSSProperties = {
  background: "#081b24",
  border: "1px solid #1c3742",
  borderRadius: 12,
  padding: 22,
  marginBottom: 35,
};

const toggle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  width: "100%",
  background: "transparent",
  border: 0,
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const head: CSSProperties = {
  color: "#657983",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "2px",
};

const hint: CSSProperties = {
  color: "#8ca4ad",
  fontSize: 14,
  lineHeight: 1.7,
  marginTop: 12,
  marginBottom: 0,
};

const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th: CSSProperties = {
  color: "#b7cbd3",
  fontSize: 13,
  fontWeight: 700,
  textAlign: "right",
  padding: "10px 12px",
  borderBottom: "1px solid #1c3742",
  whiteSpace: "nowrap",
};

const td: CSSProperties = {
  textAlign: "right",
  padding: "10px 12px",
  borderBottom: "1px solid #102831",
  whiteSpace: "nowrap",
};

const tdLabel: CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #102831",
  color: "#e7eef1",
};

const refStyle: CSSProperties = {
  color: "#5c7280",
  fontSize: 11,
  marginTop: 3,
};

const prosGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
  marginTop: 22,
};

const prosCard: CSSProperties = {
  background: "#06151d",
  border: "1px solid #1c3742",
  borderRadius: 10,
  padding: 16,
  fontSize: 13,
  lineHeight: 1.6,
};

const proLine: CSSProperties = { color: "#9fd6b4", marginBottom: 6 };
const conLine: CSSProperties = { color: "#d6a89f", marginBottom: 6 };

const pickButton: CSSProperties = {
  marginTop: 10,
  background: "transparent",
  border: "1px solid #2a5b68",
  color: "#5fb6c9",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 12,
  cursor: "pointer",
};

const verdictBox: CSSProperties = {
  marginTop: 22,
  padding: 16,
  background: "#06151d",
  border: "1px dashed #2a5b68",
  borderRadius: 10,
  color: "#b7cbd3",
  fontSize: 13,
  lineHeight: 1.7,
};

const linkButton: CSSProperties = {
  marginTop: 16,
  background: "transparent",
  border: 0,
  color: "#5fb6c9",
  fontSize: 13,
  padding: 0,
  cursor: "pointer",
};

const notes: CSSProperties = {
  marginTop: 12,
  paddingLeft: 18,
  color: "#8ca4ad",
  fontSize: 12,
  lineHeight: 1.65,
};
