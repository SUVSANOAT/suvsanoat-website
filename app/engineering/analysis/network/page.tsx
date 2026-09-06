"use client";

/* ==================================================================
 * ГИДРАВЛИЧЕСКИЙ РАСЧЁТ САМОТЁЧНОЙ СЕТИ — СТРАНИЦА ПРОЕКТИРОВЩИКА
 *
 * Проектировщик кладёт трассу: вставляет таблицу узлов из Excel или
 * прикладывает KML из Google Earth. Программа считает участки по
 * ҚМҚ 2.04.03-19 и показывает ведомость сразу на экране; ведомость в
 * Excel собирается на сервере тем же кодом.
 *
 * Расчёт идёт в браузере, чтобы правка отметки пересчитывала таблицу
 * мгновенно, — но файл, который уйдёт в экспертизу, собирается на
 * сервере и считается там заново. Числа в документе не должны зависеть
 * от того, что происходило на странице.
 * ================================================================== */

import { CSSProperties, useMemo, useRef, useState } from "react";
import {
  calculateNetwork,
  MATERIALS,
  type ElevSource,
  type NetworkInput,
  type NetworkLink,
  type NetworkNode,
  type PipeMaterial,
} from "../../../../calculations/network";
import { parseKml, parseNodeTable, traceLength } from "../../../../calculations/network-input";
import {
  nodesFromPolyline,
  parseDxfSurvey,
  type ParsedDxf,
  type SurveyPolyline,
} from "../../../../calculations/dxf-survey";
import RequireAuth from "../../RequireAuth";

/* Пример намеренно показывает ВСЕ столбцы, которые страница умеет
   читать, и разветвление: колодцы Б-1, Б-2 — боковая ветка, впадающая
   в К-3. Числа условные, объекта такого нет. */
const SAMPLE = `Колодец;Отметка земли;Жители;Площадь, га;Сосредоточенный расход, м³/сут;Транзит, л/с;Длина, м;Диаметр, мм;Уклон;Материал;Течёт в
К-1;100.0;300;;;;240;;;бетон;К-2
К-2;99.1;;2,5;;;310;;;бетон;К-3
К-3;98.0;;;;;280;;;бетон;К-4
К-4;96.9;;;120;;190;;;ПНД;К-5
К-5;95.5;;;;;;;;;
Б-1;101.2;450;;;;150;;;бетон;Б-2
Б-2;99.4;450;;;3;220;;;бетон;К-3`;

type Mode = "table" | "kml" | "dxf";

export default function NetworkPage() {
  return (
    <RequireAuth>
      <NetworkPageContent />
    </RequireAuth>
  );
}

function NetworkPageContent() {
  const [mode, setMode] = useState<Mode>("table");
  const [text, setText] = useState("");
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [elevSource, setElevSource] = useState<ElevSource>("survey");
  const [category, setCategory] = useState<NetworkInput["category"]>("town-under-50k");
  const [startDepth, setStartDepth] = useState("1.5");
  const [material, setMaterial] = useState<PipeMaterial>("concrete");
  const [density, setDensity] = useState("");
  const [industry, setIndustry] = useState("0");
  const [unaccounted, setUnaccounted] = useState("0");
  const [rain, setRain] = useState("");
  const [dxf, setDxf] = useState<ParsedDxf | null>(null);
  const [traceIdx, setTraceIdx] = useState(0);
  const [maxSurveyDist, setMaxSurveyDist] = useState("20");
  const [busy, setBusy] = useState(false);
  const [dxfBusy, setDxfBusy] = useState(false);
  const [object, setObject] = useState("Канализационная сеть");
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const outfallId = nodes.length ? nodes[nodes.length - 1].id : "";

  const input: NetworkInput | null = useMemo(() => {
    if (nodes.length < 2 || !links.length) return null;
    return {
      nodes,
      links,
      outfallId,
      category,
      elevSource,
      startDepthM: Number(startDepth.replace(",", ".")) || undefined,
      material,
      densityPerHa: Number(density.replace(",", ".")) || undefined,
      localIndustryShare: (Number(industry.replace(",", ".")) || 0) / 100,
      unaccountedShare: (Number(unaccounted.replace(",", ".")) || 0) / 100,
      maxDailyRainMm: Number(rain.replace(",", ".")) || undefined,
    };
  }, [nodes, links, outfallId, category, elevSource, startDepth, material, density, industry, unaccounted, rain]);

  const result = useMemo(() => (input ? calculateNetwork(input) : null), [input]);

  function loadText(raw: string, kind: Mode) {
    const parsed = kind === "kml" ? parseKml(raw) : parseNodeTable(raw);
    setNodes(parsed.nodes);
    setLinks(parsed.links);
    setProblems(parsed.problems);
    if (kind === "kml") setElevSource(parsed.elevFromFile ? "google" : "assumed");
  }

  async function onFile(file: File) {
    setFileError("");
    const raw = await file.text().catch(() => "");
    if (!raw) {
      setFileError("Файл не прочитался. KMZ и DWG — не текстовые: KMZ распакуйте и приложите doc.kml, а съёмку сохраните из CAD как «DXF (ASCII)».");
      return;
    }
    const name = file.name.toLowerCase();

    if (name.endsWith(".dxf")) {
      const parsed = parseDxfSurvey(raw);
      setDxf(parsed);
      setTraceIdx(0);
      setProblems(parsed.problems);
      setMode("dxf");
      return;
    }

    setText(raw.slice(0, 200000));
    loadText(raw, name.endsWith(".kml") ? "kml" : "table");
    setMode(name.endsWith(".kml") ? "kml" : "table");
  }

  /** Трасса из съёмки: вершины полилинии становятся колодцами, отметка
   *  снимается по ближайшим точкам съёмки. Результат кладётся в таблицу,
   *  а не считается сразу: проектировщику ещё вписывать жителей и
   *  подключения, и он должен видеть, какие отметки сняты. */
  function fillFromDxf() {
    if (!dxf) return;
    const line = dxf.polylines[traceIdx];
    if (!line) {
      setFileError("В файле нет полилинии, которую можно принять за трассу.");
      return;
    }
    const maxD = Number(maxSurveyDist.replace(",", ".")) || 20;
    const built = nodesFromPolyline(line, dxf.points, "К-", maxD);
    const rows = built.nodes.map((n, i) => {
      const next = built.nodes[i + 1];
      const len = next ? Math.round(Math.hypot(next.x - n.x, next.y - n.y) * 10) / 10 : "";
      return `${n.id};${n.groundElev};;${n.x};${n.y};${len};${next ? next.id : ""}`;
    });
    const table = ["Колодец;Отметка земли;Жители;X;Y;Длина, м;Течёт в", ...rows].join("\n");
    setText(table);
    loadText(table, "table");
    setProblems([...built.problems, ...dxf.problems]);
    setElevSource("survey");
    setMode("table");
  }

  /** общая часть скачивания: расчёт повторяется на сервере, сюда приходит файл */
  async function download(url: string, body: unknown, name: string, setFlag: (v: boolean) => void) {
    setFlag(true);
    setFileError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || "Файл не собрался.");
        return;
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setFileError("Сервер не ответил. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setFlag(false);
    }
  }

  async function downloadDxf() {
    if (!input) return;
    await download("/api/network-dxf", { input, object }, "SUVSANOAT_chertezhi_seti.zip", setDxfBusy);
  }

  async function downloadXlsx() {
    if (!input) return;
    setBusy(true);
    setFileError("");
    try {
      const res = await fetch("/api/network-xlsx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || "Не удалось собрать ведомость.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SUVSANOAT_vedomost_seti.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFileError("Сервер не ответил. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>НАРУЖНЫЕ СЕТИ</div>
        <h1 style={title}>
          Гидравлический расчёт
          <br />
          самотёчной канализации
        </h1>
        <p style={lead}>
          Положите трассу — таблицу колодцев из Excel или путь из Google Earth. Программа посчитает
          расходы по участкам, подберёт диаметры и уклоны, выведет отметки лотков и глубины по
          ҚМҚ 2.04.03-19 и соберёт ведомость расчёта.
        </p>

        {/* ВВОД */}
        <section style={card}>
          <div style={tabs}>
            <button type="button" onClick={() => setMode("table")} style={mode === "table" ? tabOn : tab}>
              Таблица колодцев
            </button>
            <button type="button" onClick={() => setMode("kml")} style={mode === "kml" ? tabOn : tab}>
              KML из Google Earth
            </button>
            <button type="button" onClick={() => setMode("dxf")} style={mode === "dxf" ? tabOn : tab}>
              DXF топосъёмки
            </button>
          </div>

          {mode === "table" ? (
            <>
              <p style={hint}>
                Вставьте таблицу прямо из Excel. Обязательны два столбца: «Колодец» и «Отметка
                земли». Остальные — по мере наличия: «Жители», «Площадь, га», «Сосредоточенный
                расход, м³/сут», «Транзит, л/с», «Отметка лотка», «Начальная глубина», «X», «Y»,
                «Длина, м», «Диаметр, мм», «Уклон», «Материал», «Течёт в». Длина, диаметр, уклон и
                материал относятся к участку от этого колодца к следующему; заданные диаметр и
                уклон не подбираются заново, а проверяются. Если столбца «Течёт в» нет, участки
                строятся по порядку строк. Кнопка ниже подставляет пример со всеми столбцами и
                боковой веткой — числа в нём условные.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => text.trim() && loadText(text, "table")}
                placeholder={SAMPLE}
                rows={10}
                style={textarea}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" style={ghost} onClick={() => { setText(SAMPLE); loadText(SAMPLE, "table"); setDensity("180"); }}>
                  Подставить пример
                </button>
                <button type="button" style={ghost} onClick={() => text.trim() && loadText(text, "table")}>
                  Прочитать таблицу
                </button>
              </div>
            </>
          ) : mode === "kml" ? (
            <>
              <p style={hint}>
                В Google Earth проведите трассу инструментом «Путь», сохраните как KML и приложите
                файл. Из него читаются координаты и, если путь сохранён с привязкой к рельефу,
                высоты. KMZ — это архив: распакуйте и приложите doc.kml.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".kml,.csv,.txt"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                style={{ color: "#b7cbd3", fontSize: 14 }}
              />
            </>
          ) : (
            <>
              <p style={hint}>
                Приложите DXF топографической съёмки. Программа возьмёт из него точки с высотами
                (POINT, подписи отметок текстом, горизонтали) и снимет отметку земли в каждом
                колодце по ближайшим точкам. Трасса берётся из полилинии — выберите её ниже.
                Двоичный DXF и DWG не читаются: сохраните из CAD как «DXF (ASCII)».
              </p>
              <input
                type="file"
                accept=".dxf"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                style={{ color: "#b7cbd3", fontSize: 14 }}
              />

              {dxf && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ ...hint, color: dxf.points.length ? "#9fd6b4" : "#ffcf8a" }}>
                    Прочитано: {dxf.points.length} точек с высотами, {dxf.polylines.length} полилиний.
                    Слои: {dxf.layers.slice(0, 8).join(", ") || "—"}
                    {dxf.layers.length > 8 ? " …" : ""}
                  </p>

                  <div style={grid}>
                    <label style={field}>
                      <span style={fieldLabel}>Полилиния трассы</span>
                      <select value={traceIdx} onChange={(e) => setTraceIdx(Number(e.target.value))} style={inputStyle}>
                        {dxf.polylines.map((l: SurveyPolyline, i: number) => (
                          <option key={`${l.layer}-${i}`} value={i}>
                            слой «{l.layer}» — {l.pts.length} вершин, {l.lengthM} м
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={field}>
                      <span style={fieldLabel}>Предел удаления точки съёмки, м</span>
                      <input
                        value={maxSurveyDist}
                        onChange={(e) => setMaxSurveyDist(e.target.value)}
                        inputMode="decimal"
                        style={inputStyle}
                      />
                      <span style={fieldHint}>дальше — отметка помечается ненадёжной</span>
                    </label>
                  </div>

                  <button type="button" style={{ ...ghost, marginTop: 14 }} onClick={fillFromDxf}>
                    Снять отметки и заполнить таблицу
                  </button>
                </div>
              )}
            </>
          )}

          {problems.length > 0 && (
            <ul style={problemList}>
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}

          {nodes.length > 0 && (
            <p style={{ ...hint, color: "#9fd6b4" }}>
              Прочитано: {nodes.length} колодцев, {links.length} участков
              {traceLength(nodes) > 0 ? `, длина трассы ${traceLength(nodes)} м` : ""}. Конечная точка —{" "}
              {outfallId}.
            </p>
          )}
        </section>

        {/* ПАРАМЕТРЫ */}
        <section style={card}>
          <div style={sectionTitle}>ПАРАМЕТРЫ РАСЧЁТА</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Категория населённого пункта (табл. 3)</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NetworkInput["category"])}
                style={inputStyle}
              >
                <option value="town-under-50k">города и посёлки до 50 тыс. чел.</option>
                <option value="city-under-100k">города до 100 тыс. чел.</option>
                <option value="city-over-100k">города свыше 100 тыс. чел.</option>
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Источник отметок</span>
              <select value={elevSource} onChange={(e) => setElevSource(e.target.value as ElevSource)} style={inputStyle}>
                <option value="survey">топографическая съёмка</option>
                <option value="google">рельеф Google Earth</option>
                <option value="assumed">приняты условно</option>
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Начальная глубина лотка, м</span>
              <input value={startDepth} onChange={(e) => setStartDepth(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>в верховых колодцах; в таблице можно задать по каждому</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Материал труб по умолчанию</span>
              <select value={material} onChange={(e) => setMaterial(e.target.value as PipeMaterial)} style={inputStyle}>
                {(Object.keys(MATERIALS) as PipeMaterial[]).map((m) => (
                  <option key={m} value={m}>
                    {MATERIALS[m].label} (n = {MATERIALS[m].n})
                  </option>
                ))}
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Плотность населения, чел/га</span>
              <input value={density} onChange={(e) => setDensity(e.target.value)} inputMode="decimal" placeholder="не задана" style={inputStyle} />
              <span style={fieldHint}>нужна для узлов, где указана площадь квартала</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Местная промышленность, %</span>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>п. 2.3 — до 5 %; 0 = не начислять</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Неучтённые расходы, %</span>
              <input value={unaccounted} onChange={(e) => setUnaccounted(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>табл. 3, прим. 5 — 10–15 %; 0 = не начислять</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Максимальные суточные осадки, мм</span>
              <input value={rain} onChange={(e) => setRain(e.target.value)} inputMode="decimal" placeholder="не задано" style={inputStyle} />
              <span style={fieldHint}>КМК 2.01.01-94 — для притока по ф. (1) п. 2.10</span>
            </label>
          </div>
        </section>

        {/* РЕЗУЛЬТАТ */}
        {result && (
          <>
            {result.warnings.map((w) => (
              <div key={w} style={warnBox}>
                {w}
              </div>
            ))}

            <section style={card}>
              <div style={sectionTitle}>ВЕДОМОСТЬ ГИДРАВЛИЧЕСКОГО РАСЧЁТА</div>
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      {["Участок", "L, м", "Q расч, л/с", "в т.ч. инф.", "K", "DN, мм", "i", "v, м/с", "H/D", "Лоток н, м", "Лоток к, м", "Глубина к, м", "Перепад, м"].map((h) => (
                        <th key={h} style={th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.segments.map((s) => (
                      <tr key={`${s.from}-${s.to}`}>
                        <td style={tdLeft}>
                          {s.from} — {s.to}
                          {s.warnings.length > 0 && <div style={segWarn}>{s.warnings.join(" ")}</div>}
                        </td>
                        <td style={td}>{s.lengthM}</td>
                        <td style={td}>{s.qCalcLps}</td>
                        <td style={{ ...td, color: "#8ca4ad" }}>{s.qInfiltrationLps > 0 ? s.qInfiltrationLps : "—"}</td>
                        <td style={td}>{s.kMax}</td>
                        <td style={{ ...td, color: s.fixed ? "#9fd0ff" : "#e7eef1" }}>{s.dnMm}</td>
                        <td style={td}>{s.slope.toFixed(4)}</td>
                        <td style={{ ...td, color: s.velocity < s.vMinRequired ? "#ffcf8a" : "#e7eef1" }}>
                          {s.velocity.toFixed(2)}
                        </td>
                        <td style={td}>{s.fill.toFixed(2)}</td>
                        <td style={td}>{s.invertStart.toFixed(2)}</td>
                        <td style={td}>{s.invertEnd.toFixed(2)}</td>
                        <td style={{ ...td, color: s.depthEnd > 6 ? "#ffcf8a" : "#e7eef1" }}>{s.depthEnd.toFixed(2)}</td>
                        <td style={td}>{s.dropM > 0 ? s.dropM.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={totalsRow}>
                <span>
                  Расход в конечной точке: <b>{result.totalCalcLps} л/с</b> ({result.totalM3Day} м³/сут)
                </span>
                <span>
                  Наибольшая глубина: <b>{result.maxDepthM} м</b> в {result.maxDepthAt}
                </span>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" style={primary} onClick={downloadXlsx} disabled={busy}>
                  {busy ? "Собираю ведомость…" : "Скачать ведомость в Excel"}
                </button>
                <button type="button" style={secondary} onClick={downloadDxf} disabled={dxfBusy}>
                  {dxfBusy ? "Строю чертежи…" : "Скачать чертежи DXF (план и профили)"}
                </button>
                <input
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder="Объект — как писать в штампе"
                  style={{ ...inputStyle, minWidth: 260 }}
                />
              </div>
              {fileError && <span style={{ color: "#ff9d8a", fontSize: 13, marginLeft: 12 }}>{fileError}</span>}
            </section>

            <section style={card}>
              <div style={sectionTitle}>ЧТО ПРИНЯТО И НА КАКОМ ОСНОВАНИИ</div>
              <ul style={notes}>
                {result.assumptions.map((a) => (
                  <li key={a} style={{ marginBottom: 8 }}>
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------------------------- стили ---------------------------- */

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1250px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 860, marginTop: 25, marginBottom: 40, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 13.5, lineHeight: 1.7, marginTop: 0 };
const tabs: CSSProperties = { display: "flex", gap: 8, marginBottom: 16 };
const tab: CSSProperties = { background: "transparent", border: "1px solid #1c3742", color: "#8ca4ad", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" };
const tabOn: CSSProperties = { ...tab, borderColor: "#2a5b68", color: "#5fb6c9", background: "#06151d" };
const textarea: CSSProperties = { width: "100%", background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: 12, fontSize: 14, fontFamily: "Consolas, monospace", marginBottom: 12 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12 };
const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 130 };
const segWarn: CSSProperties = { color: "#ffcf8a", fontSize: 11.5, lineHeight: 1.5, marginTop: 4, maxWidth: 420, whiteSpace: "normal" };
const totalsRow: CSSProperties = { display: "flex", gap: 24, flexWrap: "wrap", color: "#b7cbd3", fontSize: 14, margin: "18px 0" };
const secondary: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const primary: CSSProperties = { background: "#0f5f73", border: 0, color: "#eaf7fa", borderRadius: 10, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const problemList: CSSProperties = { marginTop: 14, paddingLeft: 18, color: "#ffcf8a", fontSize: 13, lineHeight: 1.6 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
