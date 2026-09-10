"use client";

/* ==================================================================
 * РАСЧЁТ ВОДОВОДА: ЧЕТЫРЕ ЧИСЛА — ЧЕТЫРЕ ОТВЕТА
 *
 * Вход: расход, геодезический перепад, длина участка по трубе,
 * геометрическая длина. Больше ничего не спрашивается.
 *
 * Выход: требуемый напор, труба и материал, обратный гидроудар,
 * параметры защитной арматуры.
 *
 * Всё, что можно подобрать самим, подбирается: диаметр, стенка, класс
 * давления. Кто хочет задать трубу вручную или поменять условия —
 * раскрывает «Дополнительно». По умолчанию оно свёрнуто, чтобы страница
 * не выглядела как анкета.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import { calculateSegment, type SegmentResult } from "../../../../calculations/surge-protection";
import { STEEL_PIPES, WATER_PIPE, type Lining, type WaterPipeKind } from "../../../../calculations/water-main";
import RequireAuth from "../../RequireAuth";

export default function SegmentPage() {
  return (
    <RequireAuth>
      <SegmentPageContent />
    </RequireAuth>
  );
}

function SegmentPageContent() {
  /* четыре числа */
  const [flowUnit, setFlowUnit] = useState<"h" | "day">("h");
  const [flow, setFlow] = useState("");
  const [geoLift, setGeoLift] = useState("");
  const [pipeLength, setPipeLength] = useState("");
  const [planLength, setPlanLength] = useState("");
  const [startElev, setStartElev] = useState("");
  const [airValveDn, setAirValveDn] = useState("");
  const [drainDn, setDrainDn] = useState("");

  /* дополнительно — свёрнуто */
  const [more, setMore] = useState(false);
  const [material, setMaterial] = useState<WaterPipeKind>("steel");
  const [lining, setLining] = useState<Lining>("cement");
  const [outer, setOuter] = useState("");
  const [wall, setWall] = useState("");
  const [freeHead, setFreeHead] = useState("5");
  const [valveCount, setValveCount] = useState("1");
  const [pn, setPn] = useState("");

  const [showAssumptions, setShowAssumptions] = useState(false);

  const num = (x: string) => Number(String(x).replace(",", ".")) || 0;
  const qM3H = flowUnit === "h" ? num(flow) : num(flow) / 24;

  const { res, error } = useMemo((): { res: SegmentResult | null; error: string } => {
    if (!(qM3H > 0) || !(num(pipeLength) > 0) || !(num(geoLift) > 0)) return { res: null, error: "" };
    try {
      return {
        res: calculateSegment({
          qM3H,
          geoLiftM: num(geoLift),
          pipeLengthM: num(pipeLength),
          planLengthM: num(planLength) || undefined,
          startElevM: startElev ? num(startElev) : undefined,
          airValveDnMm: num(airValveDn) || undefined,
          drainDnMm: num(drainDn) || undefined,
          material,
          lining,
          outerMm: num(outer) || undefined,
          wallMm: num(wall) || undefined,
          freeHeadM: num(freeHead) || undefined,
          valveCount: num(valveCount) || 1,
          pnBar: num(pn) || undefined,
        }),
        error: "",
      };
    } catch (e) {
      return { res: null, error: e instanceof Error ? e.message : "Расчёт не выполнен." };
    }
  }, [qM3H, geoLift, pipeLength, planLength, startElev, airValveDn, drainDn, material, lining, outer, wall, freeHead, valveCount, pn]);

  const walls = STEEL_PIPES.find((p) => p.outerMm === num(outer))?.walls ?? [];
  const best = res?.materials.find((m) => m.suitable && m.note === "принят в расчёт") ?? res?.materials.find((m) => m.suitable);
  const p = res?.protection;

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ВОДОВОД</div>
        <h1 style={title}>Гидравлический расчёт</h1>
        <p style={lead}>
          Расход, перепад, длина — и получаете напор, трубу, обратный гидроудар и защитную
          арматуру.
        </p>

        {/* ---------------- ЧЕТЫРЕ ЧИСЛА ---------------- */}
        <section style={card}>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Расход</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={flow} onChange={(e) => setFlow(e.target.value)} inputMode="decimal" placeholder="1500" style={{ ...inputStyle, flex: 1 }} />
                <select value={flowUnit} onChange={(e) => setFlowUnit(e.target.value as "h" | "day")} style={{ ...inputStyle, width: 110 }}>
                  <option value="h">м³/ч</option>
                  <option value="day">м³/сут</option>
                </select>
              </div>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Геодезический перепад, м</span>
              <input value={geoLift} onChange={(e) => setGeoLift(e.target.value)} inputMode="decimal" placeholder="175" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Длина участка по трубе, м</span>
              <input value={pipeLength} onChange={(e) => setPipeLength(e.target.value)} inputMode="decimal" placeholder="2000" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Геометрическая длина, м</span>
              <input value={planLength} onChange={(e) => setPlanLength(e.target.value)} inputMode="decimal" placeholder="проекция, для проверки" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Отметка насосной станции, м</span>
              <input value={startElev} onChange={(e) => setStartElev(e.target.value)} inputMode="decimal" placeholder="начало участка" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Вантуз, DN</span>
              <input value={airValveDn} onChange={(e) => setAirValveDn(e.target.value)} inputMode="numeric" placeholder="пусто — подобрать" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Сбросный трубопровод, DN</span>
              <input value={drainDn} onChange={(e) => setDrainDn(e.target.value)} inputMode="numeric" placeholder="пусто — подобрать" style={inputStyle} />
            </label>
          </div>

          <button style={{ ...ghost, marginTop: 18 }} onClick={() => setMore((v) => !v)}>
            {more ? "Скрыть дополнительно" : "Дополнительно: труба и условия"}
          </button>

          {more && (
            <div style={{ ...grid, marginTop: 16 }}>
              <label style={field}>
                <span style={fieldLabel}>Материал</span>
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
              <label style={field}>
                <span style={fieldLabel}>Наружный диаметр, мм</span>
                <select value={outer} onChange={(e) => { setOuter(e.target.value); setWall(""); }} style={inputStyle}>
                  <option value="">подобрать</option>
                  {STEEL_PIPES.map((x) => (
                    <option key={x.outerMm} value={x.outerMm}>
                      {x.outerMm}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Толщина стенки, мм</span>
                <select value={wall} onChange={(e) => setWall(e.target.value)} style={inputStyle} disabled={!walls.length}>
                  <option value="">по расчёту</option>
                  {walls.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Класс давления PN</span>
                <select value={pn} onChange={(e) => setPn(e.target.value)} style={inputStyle}>
                  <option value="">подобрать</option>
                  {[10, 16, 25, 32, 40, 63].map((x) => (
                    <option key={x} value={x}>
                      PN{x}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>Свободный напор в конце, м</span>
                <input value={freeHead} onChange={(e) => setFreeHead(e.target.value)} inputMode="decimal" style={inputStyle} />
              </label>
              <label style={field}>
                <span style={fieldLabel}>Противоударных клапанов, шт.</span>
                <input value={valveCount} onChange={(e) => setValveCount(e.target.value)} inputMode="numeric" style={inputStyle} />
              </label>
            </div>
          )}
        </section>

        {error && <div style={warnBox}>{error}</div>}

        {res && p && (
          <>
            {/* ---------------- 1. НАПОР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>1. ТРЕБУЕМЫЙ НАПОР</div>
              <div style={bigRow}>
                <div>
                  <div style={bigValue}>
                    {res.requiredHeadM} <span style={unit}>м</span>
                  </div>
                  <div style={fieldHint}>{res.requiredHeadBar} бар на выходе насоса</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.motorKW} <span style={unit}>кВт</span>
                  </div>
                  <div style={fieldHint}>потребляемая мощность</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.velocity} <span style={unit}>м/с</span>
                  </div>
                  <div style={fieldHint}>скорость в трубе</div>
                </div>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                Перепад {num(geoLift)} + потери {res.frictionM} + местные {res.localM} + свободный напор{" "}
                {num(freeHead)} м.
              </p>
            </section>

            {/* ---------------- 2. ТРУБА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>2. ТРУБА И МАТЕРИАЛ</div>
              <div style={bigRow}>
                <div>
                  <div style={bigValue}>
                    {res.outerMm}×{res.wallMm}
                  </div>
                  <div style={fieldHint}>{best?.label ?? WATER_PIPE[material].label}, внутренний {res.innerMm} мм</div>
                </div>
                <div>
                  <div style={bigValue}>PN{res.pnBar}</div>
                  <div style={fieldHint}>класс давления трубы</div>
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Материал</th>
                      <th style={th}>Удар, бар</th>
                      <th style={{ ...th, textAlign: "left" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.materials.map((m) => (
                      <tr key={m.kind} style={{ opacity: m.suitable ? 1 : 0.45 }}>
                        <td style={{ ...tdLeft, color: m.note === "принят в расчёт" ? "#5fb6c9" : undefined }}>{m.label}</td>
                        <td style={td}>{m.peakBar}</td>
                        <td style={tdNote}>{m.suitable ? m.note : "не проходит по давлению"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- 3. ГИДРОУДАР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>3. ОБРАТНЫЙ ГИДРОУДАР</div>
              <div style={bigRow}>
                <div>
                  <div style={{ ...bigValue, color: res.peakBar > res.pnBar ? "#ffcf8a" : "#e7eef1" }}>
                    {res.peakBar} <span style={unit}>бар</span>
                  </div>
                  <div style={fieldHint}>пик без защиты, +{res.surgeM} м</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.waveSpeedMs} <span style={unit}>м/с</span>
                  </div>
                  <div style={fieldHint}>скорость волны</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.phaseS} <span style={unit}>с</span>
                  </div>
                  <div style={fieldHint}>фаза удара 2L/c</div>
                </div>
                <div>
                  <div style={{ ...bigValue, color: res.separation ? "#ffcf8a" : "#e7eef1" }}>
                    {res.minHeadM} <span style={unit}>м</span>
                  </div>
                  <div style={fieldHint}>{res.separation ? "разрыв потока — защита обязательна" : "минимум при разрежении"}</div>
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={tdLeft}>Удар приходит в точку</td>
                      <td style={tdNote}>{res.peakAt}. Здесь ставится противоударный клапан.</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Разрежение</td>
                      <td style={tdNote}>{res.vacuumAt}. Здесь нужны вантузы.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- 4. ЗАЩИТА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>4. ЗАЩИТНАЯ АРМАТУРА</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={tdLeft}>Противоударный клапан</td>
                      <td style={tdVal}>
                        {p.valveCount} шт. DN{p.valveDnMm} PN{p.valvePnBar}
                      </td>
                      <td style={tdNote}>Kv не менее {p.requiredKv} м³/ч, открытие не более {p.openTimeS} с</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Сбросный трубопровод</td>
                      <td style={{ ...tdVal, color: p.drainDnMm < p.drainDnRequiredMm ? "#ffcf8a" : undefined }}>
                        DN{p.drainDnMm}
                        {p.drainDnMm !== p.drainDnRequiredMm ? ` → нужен DN${p.drainDnRequiredMm}` : ""}
                      </td>
                      <td style={tdNote}>
                        скорость {p.drainVelocity} м/с; сброс {p.dischargeVolumeM3} м³ за отключение, приёмная ёмкость от {p.receiverM3} м³
                      </td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Гидропневмобак</td>
                      <td style={tdVal}>{p.vesselTotalM3} м³</td>
                      <td style={tdNote}>против разрыва потока при остановке</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Вантузы двойного действия</td>
                      <td style={{ ...tdVal, color: p.airValveDnMm < p.airValveDnRequiredMm ? "#ffcf8a" : undefined }}>
                        {p.airValveCount} шт. DN{p.airValveDnMm}
                        {p.airValveDnMm < p.airValveDnRequiredMm ? ` → нужен DN${p.airValveDnRequiredMm}` : ""}
                      </td>
                      <td style={tdNote}>в верхних точках и через каждые 700 м</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Обратный клапан у насоса</td>
                      <td style={tdVal}>с демпфированием</td>
                      <td style={tdNote}>захлопка примет удар целиком</td>
                    </tr>
                  </tbody>
                </table>
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

        <p style={{ ...hint, marginTop: 24 }}>
          Есть продольный профиль трассы с отметками по пикетам?{" "}
          <a href="/engineering/analysis/pipeline" style={link}>
            Расширенный расчёт с расстановкой станций
          </a>
          .
        </p>
      </div>
    </main>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1000px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 760, marginTop: 20, marginBottom: 32, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
const link: CSSProperties = { color: "#5fb6c9" };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12 };
const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.7 };
const bigRow: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 };
const bigValue: CSSProperties = { color: "#e7eef1", fontSize: 30, fontWeight: 700 };
const unit: CSSProperties = { fontSize: 15, color: "#8ca4ad", fontWeight: 400 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 150, whiteSpace: "normal", color: "#8ca4ad" };
const tdVal: CSSProperties = { ...td, textAlign: "left", color: "#e7eef1", fontWeight: 700, minWidth: 140 };
const tdNote: CSSProperties = { ...td, textAlign: "left", color: "#8ca4ad", whiteSpace: "normal", fontSize: 12.5, lineHeight: 1.5 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
