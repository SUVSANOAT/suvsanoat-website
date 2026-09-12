"use client";

/* ==================================================================
 * ВОДОПРОВОДНАЯ СЕТЬ — ПОЛНЫЙ РАСЧЁТ ПО ВКЛАДКАМ
 *
 * 1. Объект        — тип пункта, местность, этажность, коэффициенты.
 * 2. Сеть          — узлы (с жителями) и участки из Excel.
 * 3. Расход        — жители → норма → узловые отборы, с формулами.
 * 4. Гидравлика    — тип сети, участки, узлы, аварийный режим.
 * 5. Пожар         — отдельный режим: час max + пожар, проверка 10 м.
 * 6. Арматура      — что ставить в каждом узле и на участке.
 *
 * Рядом с каждым расчётом — формула с подставленными числами.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  calculateFireMode,
  calculateWaterNetwork,
  parseNetworkTables,
  type FireModeResult,
  type WaterNetworkResult,
} from "../../../../calculations/water-network";
import {
  calculateDemand,
  DEMAND,
  equipmentPlan,
  SETTLEMENT,
  TERRAIN,
  type DemandResult,
  type Formula,
  type SettlementKind,
  type Terrain,
} from "../../../../calculations/water-demand";
import { WATER_PIPE, type Lining, type WaterPipeKind } from "../../../../calculations/water-main";
import RequireAuth from "../../RequireAuth";

export default function WaterNetworkPage() {
  return (
    <RequireAuth>
      <WaterNetworkContent />
    </RequireAuth>
  );
}

const EX_NODES = `Узел;Отметка;Жителей;Отбор, л/с;Этажей
ИСТ;100;0
1;98;800;;2
2;96;1200;;2
3;95;600;;3
4;97;900;;2
5;94;500;;2`;

const EX_LINKS_TREE = `От;До;Длина, м;DN
ИСТ;1;300
1;2;400
2;3;350
2;4;250
3;5;300`;

const EX_LINKS_LOOP = `От;До;Длина, м;DN
ИСТ;1;300
1;2;400
2;3;350
2;4;250
3;5;300
4;5;350
4;1;500`;

type Tab = "object" | "net" | "demand" | "hydro" | "fire" | "equip";
const TABS: { id: Tab; label: string }[] = [
  { id: "object", label: "1. Объект" },
  { id: "net", label: "2. Сеть" },
  { id: "demand", label: "3. Расход" },
  { id: "hydro", label: "4. Гидравлика" },
  { id: "fire", label: "5. Пожар" },
  { id: "equip", label: "6. Арматура" },
];

function WaterNetworkContent() {
  const [tab, setTab] = useState<Tab>("object");

  /* объект */
  const [settlement, setSettlement] = useState<SettlementKind>("town");
  const [terrain, setTerrain] = useState<Terrain>("flat");
  const [horizon, setHorizon] = useState<"2020" | "2035">("2035");
  const [floors, setFloors] = useState("2");
  const [lpcd, setLpcd] = useState("");
  const [kDay, setKDay] = useState(String(DEMAND.kDayMax.value));
  const [alpha, setAlpha] = useState(String(DEMAND.alphaMax.value));
  const [unacc, setUnacc] = useState(String(DEMAND.unaccountedPct.value));
  const [hydrants, setHydrants] = useState(true);

  /* сеть */
  const [nodesText, setNodesText] = useState("");
  const [linksText, setLinksText] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [sourceHead, setSourceHead] = useState("");
  const [material, setMaterial] = useState<WaterPipeKind>("castIron");
  const [lining, setLining] = useState<Lining>("cement");
  const [fireNode, setFireNode] = useState("");

  const num = (x: string) => Number(String(x).replace(",", ".")) || 0;

  const parsed = useMemo(() => (nodesText.trim() && linksText.trim() ? parseNetworkTables(nodesText, linksText) : null), [nodesText, linksText]);
  const effectiveSource = sourceId.trim() || parsed?.nodes[0]?.id || "";

  /* 3. расход */
  const demand: DemandResult | null = useMemo(() => {
    if (!parsed || parsed.nodes.length < 2) return null;
    return calculateDemand({
      nodes: parsed.nodes,
      settlement,
      horizon: horizon === "2020" ? 2020 : 2035,
      floors: num(floors) || 1,
      kDayMax: num(kDay) || undefined,
      alphaMax: num(alpha) || undefined,
      unaccountedPct: unacc === "" ? undefined : num(unacc),
      lpcdOverride: num(lpcd) || undefined,
    });
  }, [parsed, settlement, horizon, floors, kDay, alpha, unacc, lpcd]);

  /* 4. гидравлика */
  const netInput = useMemo(
    () =>
      demand && parsed && num(sourceHead) > 0
        ? { nodes: demand.nodes, links: parsed.links, sourceId: effectiveSource, sourceHeadM: num(sourceHead), material, lining, floors: num(floors) || 1 }
        : null,
    [demand, parsed, sourceHead, effectiveSource, material, lining, floors],
  );
  const { net, error } = useMemo((): { net: WaterNetworkResult | null; error: string } => {
    if (!netInput) return { net: null, error: "" };
    try {
      return { net: calculateWaterNetwork(netInput), error: "" };
    } catch (e) {
      return { net: null, error: e instanceof Error ? e.message : "Расчёт не выполнен." };
    }
  }, [netInput]);

  /* 5. пожар */
  const fire: FireModeResult | null = useMemo(() => {
    if (!netInput || !net || !demand) return null;
    try {
      return calculateFireMode(netInput, net, demand.fire, fireNode.trim() ? fireNode.split(/[,;\s]+/).filter(Boolean) : undefined);
    } catch {
      return null;
    }
  }, [netInput, net, demand, fireNode]);

  /* 6. арматура */
  const equip = useMemo(() => {
    if (!netInput || !net) return null;
    return equipmentPlan(netInput.nodes, netInput.links, net, { sourceId: effectiveSource, terrain, withHydrants: hydrants });
  }, [netInput, net, effectiveSource, terrain, hydrants]);

  const ready = !!net;

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ВОДОПРОВОДНАЯ СЕТЬ</div>
        <h1 style={title}>Расчёт сети населённого пункта</h1>
        <p style={lead}>
          Жители по узлам, тип пункта и местность — на выходе отборы, гидравлика, пожарный режим и
          арматура по каждому узлу. Тупиковая или закольцованная — определяется само. Рядом с
          каждым числом — формула, из которой оно получено.
        </p>

        {/* ---------------- ВКЛАДКИ ---------------- */}
        <div style={tabs}>
          {TABS.map((t) => {
            const disabled = (t.id === "demand" && !demand) || ((t.id === "hydro" || t.id === "fire" || t.id === "equip") && !ready);
            return (
              <button key={t.id} style={tab === t.id ? tabActive : disabled ? tabDisabled : tabBtn} onClick={() => !disabled && setTab(t.id)}>
                {t.label}
              </button>
            );
          })}
        </div>

        {error && <div style={warnBox}>{error}</div>}

        {/* ================= 1. ОБЪЕКТ ================= */}
        {tab === "object" && (
          <section style={card}>
            <div style={sectionTitle}>ТИП НАСЕЛЁННОГО ПУНКТА И МЕСТНОСТЬ</div>
            <div style={grid}>
              <label style={field}>
                <span style={fieldLabel}>Населённый пункт</span>
                <select value={settlement} onChange={(e) => setSettlement(e.target.value as SettlementKind)} style={inputStyle}>
                  {(Object.keys(SETTLEMENT) as SettlementKind[]).map((k) => (
                    <option key={k} value={k}>
                      {SETTLEMENT[k].label}
                    </option>
                  ))}
                </select>
                <span style={fieldHint}>{SETTLEMENT[settlement].note}</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Местность</span>
                <select value={terrain} onChange={(e) => setTerrain(e.target.value as Terrain)} style={inputStyle}>
                  {(Object.keys(TERRAIN) as Terrain[]).map((k) => (
                    <option key={k} value={k}>
                      {TERRAIN[k].label}
                    </option>
                  ))}
                </select>
                <span style={fieldHint}>{TERRAIN[terrain].note}</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Расчётный горизонт</span>
                <select value={horizon} onChange={(e) => setHorizon(e.target.value as "2020" | "2035")} style={inputStyle}>
                  <option value="2020">2020 г.</option>
                  <option value="2035">2035 г.</option>
                </select>
                <span style={fieldHint}>норма на жителя по табл. 3 ҚМҚ 2.04.03-19 зависит от горизонта</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Этажность застройки</span>
                <input value={floors} onChange={(e) => setFloors(e.target.value)} inputMode="numeric" style={inputStyle} />
                <span style={fieldHint}>свободный напор 10 + 4·(этажей − 1); пожарный расход зависит от этажности</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Норма, л/сут на жителя</span>
                <input value={lpcd} onChange={(e) => setLpcd(e.target.value)} inputMode="decimal" placeholder={demand ? `по норме ${demand.lpcd}` : "по норме"} style={inputStyle} />
                <span style={fieldHint}>пусто — по таблице; впишите своё, если есть обоснование</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>K сут. max</span>
                <input value={kDay} onChange={(e) => setKDay(e.target.value)} inputMode="decimal" style={inputStyle} />
                <span style={fieldHint}>1,1–1,3</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>α max (часовая неравномерность)</span>
                <input value={alpha} onChange={(e) => setAlpha(e.target.value)} inputMode="decimal" style={inputStyle} />
                <span style={fieldHint}>1,2–1,4; β подставляется по числу жителей</span>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Неучтённые расходы, %</span>
                <input value={unacc} onChange={(e) => setUnacc(e.target.value)} inputMode="decimal" style={inputStyle} />
              </label>
              <label style={field}>
                <span style={fieldLabel}>Пожарные гидранты</span>
                <select value={hydrants ? "1" : "0"} onChange={(e) => setHydrants(e.target.value === "1")} style={inputStyle}>
                  <option value="1">есть — сеть не меньше DN100, шаг 150 м</option>
                  <option value="0">нет — без гидрантов</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: 18 }}>
              <button style={primary} onClick={() => setTab("net")}>
                Дальше: сеть →
              </button>
            </div>
          </section>
        )}

        {/* ================= 2. СЕТЬ ================= */}
        {tab === "net" && (
          <>
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
              <div style={sectionTitle}>УЗЛЫ И УЧАСТКИ — ВСТАВКА ИЗ EXCEL</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
                <div>
                  <div style={fieldLabel}>Узлы: имя; отметка; жителей; отбор л/с (если известен); этажей</div>
                  <textarea value={nodesText} onChange={(e) => setNodesText(e.target.value)} rows={10} placeholder={EX_NODES} style={textarea} />
                </div>
                <div>
                  <div style={fieldLabel}>Участки: от; до; длина м; диаметр мм (пусто — подобрать)</div>
                  <textarea value={linksText} onChange={(e) => setLinksText(e.target.value)} rows={10} placeholder={EX_LINKS_LOOP} style={textarea} />
                </div>
              </div>
              <p style={{ ...hint, marginTop: 0 }}>
                Узлов может быть сколько угодно — каждый перекрёсток, каждая точка отбора. Чем их
                больше, тем точнее отборы и тем точнее место для арматуры. Жители — по кварталу,
                который узел обслуживает. Отбор напрямую задаётся для предприятий и общественных
                зданий.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={ghost} onClick={() => { setNodesText(EX_NODES); setLinksText(EX_LINKS_TREE); setSourceHead("130"); }}>
                  Пример: тупиковая
                </button>
                <button style={ghost} onClick={() => { setNodesText(EX_NODES); setLinksText(EX_LINKS_LOOP); setSourceHead("130"); }}>
                  Пример: закольцованная
                </button>
                {ready && (
                  <button style={primary} onClick={() => setTab("demand")}>
                    Дальше: расход →
                  </button>
                )}
              </div>
              {parsed && parsed.problems.length > 0 && (
                <div style={{ ...warnBox, marginTop: 14, marginBottom: 0 }}>
                  {parsed.problems.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                </div>
              )}
              {parsed && !parsed.problems.length && !(num(sourceHead) > 0) && (
                <p style={{ ...hint, marginBottom: 0 }}>Таблицы прочитаны: {parsed.nodes.length} узлов, {parsed.links.length} участков. Укажите напор источника.</p>
              )}
            </section>
          </>
        )}

        {/* ================= 3. РАСХОД ================= */}
        {tab === "demand" && demand && (
          <>
            <section style={card}>
              <div style={sectionTitle}>ВОДОПОТРЕБЛЕНИЕ ПО ЖИТЕЛЯМ</div>
              <div style={bigRow}>
                <Big v={demand.totalPeople} u="чел." l="жителей всего" />
                <Big v={demand.lpcd} u="л/сут" l="норма на жителя" />
                <Big v={demand.qAvgDayM3} u="м³/сут" l="среднесуточный" />
                <Big v={demand.qMaxDayM3} u="м³/сут" l="максимальный суточный" />
                <Big v={demand.qMaxHourLps} u="л/с" l="максимальный часовой — расчётный" />
                <Big v={demand.fire.totalLps} u="л/с" l={`пожар: ${demand.fire.fires} × ${demand.fire.lpsPerFire}`} />
              </div>
            </section>
            <Formulas items={demand.formulas} />
            <section style={card}>
              <div style={sectionTitle}>УЗЛОВЫЕ ОТБОРЫ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Узел</th>
                      <th style={th}>Жителей</th>
                      <th style={th}>Отбор, л/с</th>
                      <th style={{ ...th, textAlign: "left" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {demand.nodes.map((n, i) => (
                      <tr key={n.id}>
                        <td style={tdLeft}>{n.id}</td>
                        <td style={td}>{parsed?.nodes[i]?.people ?? "—"}</td>
                        <td style={td}>{n.demandLps}</td>
                        <td style={tdNote}>{parsed?.nodes[i]?.demandLps ? "задан напрямую" : parsed?.nodes[i]?.people ? "по жителям" : "нет отбора"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <Assumptions items={demand.assumptions} />
          </>
        )}

        {/* ================= 4. ГИДРАВЛИКА ================= */}
        {tab === "hydro" && net && (
          <>
            <section style={card}>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ТИП СЕТИ</div>
                  <div style={bigValue}>{net.kindLabel}</div>
                  <div style={fieldHint}>{net.kind === "looped" ? `${net.loops} ${net.loops === 1 ? "кольцо" : "колец"}, увязка за ${net.iterations} итераций` : "колец нет"}</div>
                </div>
                <Big v={net.totalDemandLps} u="л/с" l="отбор всего" />
                <div>
                  <div style={smallLabel}>НАПОР В ПОРЯДКЕ</div>
                  <div style={{ ...bigValue, color: net.nodes.every((n) => n.ok) ? "#7fe0c0" : "#ffcf8a" }}>
                    {net.nodes.filter((n) => n.ok).length} из {net.nodes.length}
                  </div>
                </div>
              </div>
            </section>
            {net.warnings.length > 0 && <Warnings items={net.warnings} />}
            <Formulas items={net.formulas} />
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
                    {net.links.map((l) => (
                      <tr key={l.id}>
                        <td style={tdLeft}>{l.from} → {l.to}</td>
                        <td style={td}>{l.lengthM}</td>
                        <td style={{ ...td, color: l.dnAuto ? "#5fb6c9" : undefined }}>{l.dnMm}{l.dnAuto ? " *" : ""}</td>
                        <td style={td}>{l.qLps}</td>
                        <td style={{ ...td, color: l.velocity > 2 || (l.velocity > 0 && l.velocity < 0.5) ? "#ffcf8a" : undefined }}>{l.velocity}</td>
                        <td style={td}>{l.gradientMPerKm}</td>
                        <td style={td}>{l.headlossM}</td>
                        <td style={tdNote}>{l.bridge && net.kind === "looped" ? "мост — кольцо не дублирует" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>* — диаметр подобран программой. Отрицательный расход — против записанного направления.</p>
            </section>
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
                    {net.nodes.map((n) => (
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
            {net.kind === "looped" && net.emergency.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>АВАРИЙНЫЙ РЕЖИМ — ОТКАЗ ОДНОГО УЧАСТКА</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{ ...th, textAlign: "left" }}>Выключен</th>
                        <th style={th}>Худший напор, м</th>
                        <th style={{ ...th, textAlign: "left" }}>В узле</th>
                        <th style={{ ...th, textAlign: "left" }}>Без воды</th>
                      </tr>
                    </thead>
                    <tbody>
                      {net.emergency.map((e) => (
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
              </section>
            )}
            <Assumptions items={net.assumptions} />
          </>
        )}

        {/* ================= 5. ПОЖАР ================= */}
        {tab === "fire" && fire && demand && (
          <>
            <section style={card}>
              <div style={sectionTitle}>ПОЖАРНЫЙ РЕЖИМ</div>
              <div style={bigRow}>
                <Big v={demand.fire.fires} u="" l="одновременных пожаров" />
                <Big v={demand.fire.lpsPerFire} u="л/с" l="на один пожар" />
                <Big v={demand.fire.volumeM3} u="м³" l="неприкосновенный запас, 3 ч" />
                <div>
                  <div style={smallLabel}>УСЛОВИЕ 10 М</div>
                  <div style={{ ...bigValue, color: fire.ok ? "#7fe0c0" : "#ffcf8a" }}>{fire.ok ? "проходит" : "не проходит"}</div>
                  <div style={fieldHint}>{fire.worst ? `худший узел ${fire.worst.id}: ${fire.worst.freeHeadM} м` : ""}</div>
                </div>
              </div>
              <div style={{ ...grid, marginTop: 18 }}>
                <label style={field}>
                  <span style={fieldLabel}>Узел пожара</span>
                  <input value={fireNode} onChange={(e) => setFireNode(e.target.value)} placeholder={`авто: ${fire.fireNodes.join(", ")} — самый невыгодный`} style={inputStyle} />
                  <span style={fieldHint}>пусто — программа ставит пожар туда, где напор ниже всего; несколько узлов через запятую</span>
                </label>
              </div>
            </section>
            <Formulas items={fire.formulas} />
            {fire.net.warnings.length > 0 && <Warnings items={fire.net.warnings.filter((w) => !w.startsWith("Сеть тупиковая"))} />}
            <section style={card}>
              <div style={sectionTitle}>УЗЛЫ ПРИ ПОЖАРЕ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Узел</th>
                      <th style={th}>Отбор при пожаре, л/с</th>
                      <th style={th}>Пьезометр, м</th>
                      <th style={th}>Свободный напор, м</th>
                      <th style={{ ...th, textAlign: "left" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fire.net.nodes.map((n) => (
                      <tr key={n.id} style={{ background: fire.fireNodes.includes(n.id) ? "#2a2112" : undefined }}>
                        <td style={tdLeft}>{n.id}</td>
                        <td style={td}>{n.demandLps}</td>
                        <td style={td}>{n.hglM}</td>
                        <td style={{ ...td, color: n.freeHeadM < 10 && n.id !== effectiveSource ? "#ffcf8a" : undefined }}>{n.freeHeadM}</td>
                        <td style={tdNote}>{fire.fireNodes.includes(n.id) ? "пожар здесь" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section style={card}>
              <div style={sectionTitle}>УЧАСТКИ ПРИ ПОЖАРЕ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Участок</th>
                      <th style={th}>DN</th>
                      <th style={th}>Расход, л/с</th>
                      <th style={th}>Скорость, м/с</th>
                      <th style={th}>Потери, м</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fire.net.links.map((l) => (
                      <tr key={l.id}>
                        <td style={tdLeft}>{l.from} → {l.to}</td>
                        <td style={td}>{l.dnMm}</td>
                        <td style={td}>{l.qLps}</td>
                        <td style={{ ...td, color: l.velocity > 2.5 ? "#ffcf8a" : undefined }}>{l.velocity}</td>
                        <td style={td}>{l.headlossM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>При пожаре скорость до 2,5 м/с допускается — режим кратковременный.</p>
            </section>
          </>
        )}

        {/* ================= 6. АРМАТУРА ================= */}
        {tab === "equip" && equip && (
          <>
            {equip.zoning && <div style={warnBox}>{equip.zoning}</div>}
            <section style={card}>
              <div style={sectionTitle}>ЧТО СТАВИТЬ В КАЖДОМ УЗЛЕ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Узел</th>
                      <th style={{ ...th, textAlign: "left" }}>Оборудование</th>
                      <th style={{ ...th, textAlign: "left" }}>Почему</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equip.nodes.map((n) => (
                      <tr key={n.id}>
                        <td style={tdLeft}>{n.id}</td>
                        <td style={{ ...tdLeft, whiteSpace: "normal", color: "#e7eef1" }}>{n.items.join("; ")}</td>
                        <td style={tdNote}>{n.reasons.join("; ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {hydrants && (
              <section style={card}>
                <div style={sectionTitle}>ГИДРАНТЫ НА УЧАСТКАХ</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{ ...th, textAlign: "left" }}>Участок</th>
                        <th style={th}>Промежуточных</th>
                        <th style={{ ...th, textAlign: "left" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {equip.links.map((l) => (
                        <tr key={l.id}>
                          <td style={tdLeft}>{l.id}</td>
                          <td style={td}>{l.hydrants}</td>
                          <td style={tdNote}>{l.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            <Formulas items={equip.formulas} />
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------
 * МЕЛКИЕ БЛОКИ
 * ------------------------------------------------------------------ */
function Big({ v, u, l }: { v: number | string; u: string; l: string }) {
  return (
    <div>
      <div style={smallLabel}>{l.toUpperCase()}</div>
      <div style={bigValue}>
        {v} {u && <span style={unit}>{u}</span>}
      </div>
    </div>
  );
}

function Formulas({ items }: { items: Formula[] }) {
  return (
    <section style={{ ...card, borderColor: "#24444f" }}>
      <div style={sectionTitle}>ФОРМУЛЫ</div>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <tbody>
            {items.map((f, i) => (
              <tr key={i}>
                <td style={{ ...tdLeft, minWidth: 180, whiteSpace: "normal" }}>{f.label}</td>
                <td style={{ ...tdLeft, fontFamily: "Consolas, monospace", color: "#cfe3ea", whiteSpace: "normal" }}>{f.formula}</td>
                <td style={{ ...tdLeft, color: "#e7eef1", fontWeight: 700, whiteSpace: "normal" }}>{f.result}</td>
                <td style={tdNote}>{f.source ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section style={card}>
      <div style={sectionTitle}>НА ЧТО ОБРАТИТЬ ВНИМАНИЕ</div>
      {items.map((w, i) => (
        <div key={i} style={{ ...warnBox, marginBottom: i === items.length - 1 ? 0 : 12 }}>
          {w}
        </div>
      ))}
    </section>
  );
}

function Assumptions({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section style={card}>
      <button style={ghost} onClick={() => setOpen((v) => !v)}>
        {open ? "Скрыть допущения" : `Что принято в расчёте (${items.length})`}
      </button>
      {open && (
        <ul style={{ ...notes, marginTop: 14 }}>
          {items.map((a, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {a}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1150px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 860, marginTop: 20, marginBottom: 28, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
const tabs: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 };
const tabBtn: CSSProperties = { background: "transparent", border: "1px solid #1c3742", color: "#8ca4ad", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const tabActive: CSSProperties = { ...tabBtn, background: "#0f5f73", borderColor: "#0f5f73", color: "#eaf7fa", fontWeight: 700 };
const tabDisabled: CSSProperties = { ...tabBtn, opacity: 0.35, cursor: "default" };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12, marginBottom: 6 };
const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const textarea: CSSProperties = { width: "100%", background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: 12, fontSize: 14, fontFamily: "Consolas, monospace", marginBottom: 12 };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.7 };
const bigRow: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 };
const smallLabel: CSSProperties = { color: "#5c7280", fontSize: 11, letterSpacing: "1px", marginBottom: 6 };
const bigValue: CSSProperties = { color: "#e7eef1", fontSize: 28, fontWeight: 700 };
const unit: CSSProperties = { fontSize: 15, color: "#8ca4ad", fontWeight: 400 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const primary: CSSProperties = { background: "#0f5f73", border: 0, color: "#eaf7fa", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 90 };
const tdNote: CSSProperties = { ...td, textAlign: "left", color: "#8ca4ad", whiteSpace: "normal", fontSize: 12.5, lineHeight: 1.5 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
