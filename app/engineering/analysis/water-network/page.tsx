"use client";

/* ==================================================================
 * ВОДОПРОВОДНАЯ СЕТЬ: ТУПИКОВАЯ ИЛИ ЗАКОЛЬЦОВАННАЯ
 *
 * Две таблицы из Excel — узлы и участки — и напор источника. Тип сети
 * программа определяет сама. Тупиковую считает прямым ходом,
 * кольцевую — увязкой колец, и для кольцевой проверяет аварийный режим:
 * что будет с напорами, если любой один участок выйдет из строя.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  calculateWaterNetwork,
  parseNetworkTables,
  type WaterNetworkResult,
} from "../../../../calculations/water-network";
import { WATER_PIPE, type Lining, type WaterPipeKind } from "../../../../calculations/water-main";
import RequireAuth from "../../RequireAuth";

export default function WaterNetworkPage() {
  return (
    <RequireAuth>
      <WaterNetworkContent />
    </RequireAuth>
  );
}

const EX_NODES = `Узел;Отметка;Отбор, л/с;Этажей
ИСТ;100;0
1;98;5;2
2;96;8;2
3;95;6;3
4;97;4;2`;

const EX_LINKS_TREE = `От;До;Длина, м;DN
ИСТ;1;300
1;2;400
2;3;350
2;4;250`;

const EX_LINKS_LOOP = `От;До;Длина, м;DN
ИСТ;1;300;200
1;2;400;150
2;3;350;150
2;4;250;150
3;4;300;100
4;1;500;150`;

function WaterNetworkContent() {
  const [nodesText, setNodesText] = useState("");
  const [linksText, setLinksText] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [sourceHead, setSourceHead] = useState("");
  const [floors, setFloors] = useState("2");
  const [material, setMaterial] = useState<WaterPipeKind>("castIron");
  const [lining, setLining] = useState<Lining>("cement");
  const [showAssumptions, setShowAssumptions] = useState(false);

  const num = (x: string) => Number(String(x).replace(",", ".")) || 0;

  const parsed = useMemo(() => {
    if (!nodesText.trim() || !linksText.trim()) return null;
    return parseNetworkTables(nodesText, linksText);
  }, [nodesText, linksText]);

  /* Источник по умолчанию — первый узел таблицы: так ведомость и заполняют. */
  const effectiveSource = sourceId.trim() || parsed?.nodes[0]?.id || "";

  const { res, error } = useMemo((): { res: WaterNetworkResult | null; error: string } => {
    if (!parsed || parsed.nodes.length < 2 || !parsed.links.length || !(num(sourceHead) > 0)) return { res: null, error: "" };
    try {
      return {
        res: calculateWaterNetwork({
          nodes: parsed.nodes,
          links: parsed.links,
          sourceId: effectiveSource,
          sourceHeadM: num(sourceHead),
          material,
          lining,
          floors: num(floors) || 1,
        }),
        error: "",
      };
    } catch (e) {
      return { res: null, error: e instanceof Error ? e.message : "Расчёт не выполнен." };
    }
  }, [parsed, effectiveSource, sourceHead, material, lining, floors]);

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ВОДОПРОВОДНАЯ СЕТЬ</div>
        <h1 style={title}>
          Тупиковая
          <br />
          и закольцованная
        </h1>
        <p style={lead}>
          Вставьте узлы и участки из Excel, укажите напор источника. Тип сети определится сам:
          тупиковая считается прямым ходом, закольцованная — увязкой колец, и для неё проверяется
          аварийный режим — что будет с напорами при отказе любого участка.
        </p>

        {/* ---------------- ВВОД ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>ИСТОЧНИК</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Пьезометрическая отметка источника, м</span>
              <input value={sourceHead} onChange={(e) => setSourceHead(e.target.value)} inputMode="decimal" placeholder="уровень в башне или отметка + напор насоса" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Узел источника</span>
              <input value={sourceId} onChange={(e) => setSourceId(e.target.value)} placeholder={parsed?.nodes[0]?.id ? `первый узел: ${parsed.nodes[0].id}` : "первый узел таблицы"} style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Этажность застройки</span>
              <input value={floors} onChange={(e) => setFloors(e.target.value)} inputMode="numeric" style={inputStyle} />
              <span style={fieldHint}>10 м на первый этаж и по 4 м на каждый следующий; в таблице узлов можно задать по каждому</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Материал труб</span>
              <select value={material} onChange={(e) => setMaterial(e.target.value as WaterPipeKind)} style={inputStyle}>
                {(Object.keys(WATER_PIPE) as WaterPipeKind[]).map((k) => (
                  <option key={k} value={k}>
                    {WATER_PIPE[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Внутреннее покрытие</span>
              <select value={lining} onChange={(e) => setLining(e.target.value as Lining)} style={inputStyle}>
                <option value="none">нет</option>
                <option value="cement">цементно-песчаное</option>
                <option value="epoxy">эпоксидное</option>
              </select>
            </label>
          </div>
        </section>

        <section style={card}>
          <div style={sectionTitle}>УЗЛЫ И УЧАСТКИ</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            <div>
              <div style={fieldLabel}>Узлы: имя; отметка; отбор, л/с; этажей</div>
              <textarea value={nodesText} onChange={(e) => setNodesText(e.target.value)} rows={9} placeholder={EX_NODES} style={textarea} />
            </div>
            <div>
              <div style={fieldLabel}>Участки: от; до; длина, м; диаметр, мм (пусто — подобрать)</div>
              <textarea value={linksText} onChange={(e) => setLinksText(e.target.value)} rows={9} placeholder={EX_LINKS_LOOP} style={textarea} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={ghost} onClick={() => { setNodesText(EX_NODES); setLinksText(EX_LINKS_TREE); setSourceHead("135"); }}>
              Пример: тупиковая
            </button>
            <button style={ghost} onClick={() => { setNodesText(EX_NODES); setLinksText(EX_LINKS_LOOP); setSourceHead("135"); }}>
              Пример: закольцованная
            </button>
          </div>
          {parsed && parsed.problems.length > 0 && (
            <div style={{ ...warnBox, marginTop: 14, marginBottom: 0 }}>
              {parsed.problems.map((p, i) => (
                <div key={i}>{p}</div>
              ))}
            </div>
          )}
        </section>

        {error && <div style={warnBox}>{error}</div>}
        {!res && !error && (
          <section style={card}>
            <p style={{ ...hint, margin: 0 }}>Нужны обе таблицы и напор источника.</p>
          </section>
        )}

        {res && (
          <>
            {/* ---------------- ТИП ---------------- */}
            <section style={card}>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ТИП СЕТИ</div>
                  <div style={bigValue}>{res.kindLabel}</div>
                  <div style={fieldHint}>{res.kind === "looped" ? `${res.loops} ${res.loops === 1 ? "кольцо" : "колец"}, увязка за ${res.iterations} итераций` : "колец нет"}</div>
                </div>
                <div>
                  <div style={smallLabel}>ОТБОР ВСЕГО</div>
                  <div style={bigValue}>
                    {res.totalDemandLps} <span style={unit}>л/с</span>
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>УЗЛОВ / УЧАСТКОВ</div>
                  <div style={bigValue}>
                    {res.nodes.length} / {res.links.length}
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>НАПОР В ПОРЯДКЕ</div>
                  <div style={{ ...bigValue, color: res.nodes.every((n) => n.ok) ? "#7fe0c0" : "#ffcf8a" }}>
                    {res.nodes.filter((n) => n.ok).length} из {res.nodes.length}
                  </div>
                </div>
              </div>
            </section>

            {res.warnings.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>НА ЧТО ОБРАТИТЬ ВНИМАНИЕ</div>
                {res.warnings.map((w, i) => (
                  <div key={i} style={{ ...warnBox, marginBottom: i === res.warnings.length - 1 ? 0 : 12 }}>
                    {w}
                  </div>
                ))}
              </section>
            )}

            {/* ---------------- УЧАСТКИ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>УЧАСТКИ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Участок</th>
                      <th style={th}>Длина, м</th>
                      <th style={th}>DN, мм</th>
                      <th style={th}>Расход, л/с</th>
                      <th style={th}>Скорость, м/с</th>
                      <th style={th}>Уклон, м/км</th>
                      <th style={th}>Потери, м</th>
                      <th style={{ ...th, textAlign: "left" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.links.map((l) => (
                      <tr key={l.id}>
                        <td style={tdLeft}>
                          {l.from} → {l.to}
                        </td>
                        <td style={td}>{l.lengthM}</td>
                        <td style={{ ...td, color: l.dnAuto ? "#5fb6c9" : undefined }}>{l.dnMm}{l.dnAuto ? " *" : ""}</td>
                        <td style={td}>{l.qLps}</td>
                        <td style={{ ...td, color: l.velocity > 2 || (l.velocity > 0 && l.velocity < 0.5) ? "#ffcf8a" : undefined }}>{l.velocity}</td>
                        <td style={td}>{l.gradientMPerKm}</td>
                        <td style={td}>{l.headlossM}</td>
                        <td style={tdNote}>{l.bridge && res.kind === "looped" ? "мост — кольцо его не дублирует" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                * — диаметр подобран программой. Отрицательный расход — вода идёт против записанного
                направления участка.
              </p>
            </section>

            {/* ---------------- УЗЛЫ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>УЗЛЫ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Узел</th>
                      <th style={th}>Отметка, м</th>
                      <th style={th}>Отбор, л/с</th>
                      <th style={th}>Пьезометр, м</th>
                      <th style={th}>Свободный напор, м</th>
                      <th style={th}>Требуется, м</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.nodes.map((n) => (
                      <tr key={n.id}>
                        <td style={tdLeft}>{n.id}</td>
                        <td style={td}>{n.groundM}</td>
                        <td style={td}>{n.demandLps}</td>
                        <td style={td}>{n.hglM}</td>
                        <td style={{ ...td, color: n.ok ? undefined : "#ffcf8a" }}>{n.freeHeadM}</td>
                        <td style={td}>{n.requiredM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- АВАРИЙНЫЙ РЕЖИМ ---------------- */}
            {res.kind === "looped" && res.emergency.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>АВАРИЙНЫЙ РЕЖИМ — ОТКАЗ ОДНОГО УЧАСТКА</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{ ...th, textAlign: "left" }}>Выключен участок</th>
                        <th style={th}>Худший свободный напор, м</th>
                        <th style={{ ...th, textAlign: "left" }}>В узле</th>
                        <th style={{ ...th, textAlign: "left" }}>Без воды</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.emergency.map((e) => (
                        <tr key={e.linkId}>
                          <td style={tdLeft}>{e.linkId}</td>
                          <td style={{ ...td, color: e.worstFreeHeadM < 10 ? "#ffcf8a" : undefined }}>{e.worstFreeHeadM}</td>
                          <td style={tdLeft}>{e.worstNode}</td>
                          <td style={{ ...tdLeft, color: e.cutOff.length ? "#ffcf8a" : undefined }}>{e.cutOff.join(", ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ ...hint, marginBottom: 0 }}>
                  Кольца делают ради этого: при отказе участка вода должна идти в обход. Строка с
                  жёлтым напором — участок, отказ которого кольцо не компенсирует.
                </p>
              </section>
            )}

            <section style={card}>
              <button style={ghost} onClick={() => setShowAssumptions((v) => !v)}>
                {showAssumptions ? "Скрыть допущения" : "Что принято в расчёте"}
              </button>
              {showAssumptions && (
                <ul style={{ ...notes, marginTop: 14 }}>
                  {res.assumptions.map((a, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1100px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 820, marginTop: 20, marginBottom: 32, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12, marginBottom: 6 };
const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const textarea: CSSProperties = { width: "100%", background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: 12, fontSize: 14, fontFamily: "Consolas, monospace", marginBottom: 12 };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.7 };
const bigRow: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 };
const smallLabel: CSSProperties = { color: "#5c7280", fontSize: 11, letterSpacing: "1px", marginBottom: 6 };
const bigValue: CSSProperties = { color: "#e7eef1", fontSize: 30, fontWeight: 700 };
const unit: CSSProperties = { fontSize: 15, color: "#8ca4ad", fontWeight: 400 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 90 };
const tdNote: CSSProperties = { ...td, textAlign: "left", color: "#8ca4ad", whiteSpace: "normal", fontSize: 12.5 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
