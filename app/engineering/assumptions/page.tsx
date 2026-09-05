"use client";

import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ASSUMPTIONS,
  GROUP_LABEL,
  type AssumptionGroup,
} from "../../../lib/assumptions";
import { KMK_2_04_03_19_DOC } from "../../../norms/kmk-2-04-03-19";

/* ==================================================================
 * КОЭФФИЦИЕНТЫ РАСЧЁТА
 *
 * Открыто всем: проектировщик видит, на каких допущениях построен
 * результат, и может проверить методику. Администратор (главный
 * инженер) правит значения — они сохраняются в базе и применяются
 * во всех последующих расчётах.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const inputStyle: CSSProperties = {
  width: 110,
  boxSizing: "border-box",
  border: `1px solid ${LINE}`,
  borderRadius: 6,
  background: "rgba(0,0,0,0.25)",
  color: "#f5f8fa",
  padding: "8px 10px",
  fontSize: 14,
};

const btn: CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: "transparent",
  color: "#eaf6fa",
  fontSize: 13,
  cursor: "pointer",
};

type Meta = { key: string; updated_at: string; updated_by: string };

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default function AssumptionsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Meta[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, me] = await Promise.all([
        fetch("/api/assumptions").then((r) => r.json()),
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (a?.ok) {
        setValues(a.values);
        setOverrides(a.overrides ?? {});
        setMeta(a.meta ?? []);
        setDraft({});
      }
      setIsAdmin(me?.ok && me.role === "admin");
    } catch {
      setStatus("Не удалось загрузить значения");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    const payload: Record<string, number> = {};
    for (const [key, raw] of Object.entries(draft)) {
      const text = String(raw);
      if (text === "") continue;
      const v = parseFloat(text.replace(",", "."));
      if (Number.isFinite(v)) payload[key] = v;
    }
    if (!Object.keys(payload).length) {
      setStatus("Нет изменений");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/assumptions", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ values: payload }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(
          `Сохранено: ${data.saved}` +
            (data.rejected?.length ? `. Отклонено (вне допустимого диапазона): ${data.rejected.join(", ")}` : "")
        );
        load();
      } else setStatus(data.error || "Ошибка сохранения");
    } catch {
      setStatus("Нет связи с сервером");
    } finally {
      setBusy(false);
    }
  }

  async function reset(key: string) {
    setBusy(true);
    try {
      await fetch("/api/assumptions", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      await load();
      setStatus("Значение возвращено к нормативному");
    } finally {
      setBusy(false);
    }
  }

  const groups = Array.from(new Set(ASSUMPTIONS.map((a) => a.group))) as AssumptionGroup[];
  const changedCount = Object.keys(overrides).length;
  const draftCount = Object.values(draft).filter((v) => v !== "").length;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "50px 24px 110px" }}>
      <style>{`
        @media print {
          .assumptions { background: #fff !important; color: #111 !important; }
          .assumptions * { color: #111 !important; border-color: #999 !important; background: transparent !important; }
          .noPrint { display: none !important; }
        }
      `}</style>

      <div className="assumptions" style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}>
        <button type="button" onClick={() => router.back()} className="noPrint"
          style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer", marginBottom: 22, padding: 0 }}>
          ← Назад
        </button>

        <div style={{ fontSize: 12, letterSpacing: "0.14em", color: ACCENT, marginBottom: 10 }}>
          МЕТОДИКА РАСЧЁТА
        </div>
        <h1 style={{ fontSize: 30, margin: "0 0 10px" }}>Коэффициенты и допущения</h1>
        <p style={{ color: FAINT, fontSize: 15, lineHeight: 1.7, maxWidth: 820, margin: "0 0 8px" }}>
          На этих числах построен весь расчёт раздела «Инжиниринг». Источник указан у каждой строки: норматив,
          справочник или практика проектирования. Проектировщик видит их, чтобы проверить методику; изменять
          значения может только главный инженер SUVSANOAT.
        </p>
        <p style={{ color: FAINT, fontSize: 13, margin: "0 0 26px" }}>
          Всего коэффициентов: {ASSUMPTIONS.length}. Изменено относительно нормативных значений: {changedCount}.
          {isAdmin ? " У вас есть права на изменение." : " Режим просмотра."}
        </p>

        {status && (
          <p style={{ fontSize: 14, color: status.startsWith("Сохранено") || status.startsWith("Значение") ? "#9ccc65" : "#ffb74d", margin: "0 0 18px" }}>
            {status}
          </p>
        )}

        {isAdmin && (
          <div className="noPrint" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <button type="button" onClick={save} disabled={busy || !draftCount}
              style={{ ...btn, borderColor: draftCount ? ACCENT : LINE, color: draftCount ? "#eaf6fa" : FAINT, fontWeight: 700 }}>
              {busy ? "Сохраняю…" : `Сохранить изменения${draftCount ? ` (${draftCount})` : ""}`}
            </button>
            <button type="button" onClick={() => setDraft({})} disabled={!draftCount} style={btn}>
              Отменить правки
            </button>
            <span style={{ fontSize: 12, color: FAINT }}>
              Значения вне допустимого диапазона не сохраняются — диапазон указан под полем.
            </span>
          </div>
        )}

        {groups.map((g) => (
          <section key={g} style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 12 }}>
              {GROUP_LABEL[g].toUpperCase()}
            </div>

            {ASSUMPTIONS.filter((a) => a.group === g).map((a) => {
              const current = values[a.key] ?? a.value;
              const changed = overrides[a.key] !== undefined;
              const m = meta.find((x) => x.key === a.key);
              return (
                <div key={a.key}
                  style={{
                    border: `1px solid ${changed ? "rgba(156,204,101,0.45)" : LINE}`,
                    background: PANEL,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 10,
                    display: "grid",
                    gridTemplateColumns: "minmax(220px, 2fr) minmax(130px, auto) minmax(200px, 2fr)",
                    gap: 14,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <b style={{ fontSize: 14 }}>{a.name}</b>
                    <div style={{ fontSize: 11, color: FAINT, marginTop: 4, lineHeight: 1.5 }}>
                      Источник: {a.source}
                    </div>
                    {changed && (
                      <div style={{ fontSize: 11, color: "#9ccc65", marginTop: 4 }}>
                        Изменено{m ? ` ${fmtDate(m.updated_at)}, ${m.updated_by}` : ""}; нормативное значение {a.value} {a.unit}
                      </div>
                    )}
                  </div>

                  <div>
                    {isAdmin ? (
                      <>
                        <input
                          style={inputStyle}
                          value={draft[a.key] ?? String(current)}
                          onChange={(e) => setDraft({ ...draft, [a.key]: e.target.value })}
                          inputMode="decimal"
                        />
                        <div style={{ fontSize: 10, color: FAINT, marginTop: 4 }}>
                          {a.unit || "—"}
                          <br />
                          от {a.min} до {a.max}
                        </div>
                        {changed && (
                          <button type="button" onClick={() => reset(a.key)} className="noPrint"
                            style={{ ...btn, padding: "4px 8px", fontSize: 11, marginTop: 6 }}>
                            К нормативу
                          </button>
                        )}
                      </>
                    ) : (
                      <div>
                        <b style={{ fontSize: 18, color: changed ? "#9ccc65" : "#eaf6fa" }}>{current}</b>
                        <div style={{ fontSize: 11, color: FAINT }}>{a.unit}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: "#cfdde3", lineHeight: 1.55 }}>{a.effect}</div>
                </div>
              );
            })}
          </section>
        ))}

        <p style={{ fontSize: 11, color: FAINT, lineHeight: 1.6, marginTop: 20 }}>
          Нормативная база: {KMK_2_04_03_19_DOC.code} «{KMK_2_04_03_19_DOC.title}» ({KMK_2_04_03_19_DOC.approvedBy}; действует с 01.01.2020,
          взамен {KMK_2_04_03_19_DOC.replaces}); смежные — ШНК 2.04.02-97*, КМК 2.04.01-98, ПКМ РУз № 11 от 03.02.2010.
          Справочно (в ҚМҚ не нормируются): DWA-A 131, EN 858, EN 1825, Metcalf &amp; Eddy «Wastewater Engineering».
          У каждого коэффициента указан пункт или таблица ҚМҚ 2.04.03-19; значения, помеченные как практика проектирования,
          нормативом не установлены и приняты SUVSANOAT для предпроектной стадии.
        </p>
      </div>
    </main>
  );
}
