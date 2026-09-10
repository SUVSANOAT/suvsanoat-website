"use client";

/* ==================================================================
 * УЧАСТОК ВОДОВОДА: НАПОР, ТРУБА И ЗАЩИТА ОТ ГИДРОУДАРА
 *
 * Четыре числа на входе — расход, геодезический перепад, длина участка
 * по трубе и геометрическая длина. На выходе: требуемый напор, труба с
 * классом давления, обратный гидроудар и параметры защитной арматуры.
 *
 * Профиль трассы здесь не нужен. Когда он есть, точнее считает
 * /engineering/analysis/pipeline: там станции расставляются по
 * отметкам, а не задаются участками вручную.
 *
 * Геометрическая длина спрашивается не для расчёта, а для проверки:
 * труба идёт по склону и не может быть короче гипотенузы. Если
 * заданная длина меньше — в исходных данных ошибка, и страница скажет
 * об этом прежде, чем посчитает.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  calculateSegment,
  type SegmentResult,
} from "../../../../calculations/surge-protection";
import {
  STEEL_PIPES,
  WATER_PIPE,
  type Lining,
  type WaterPipeKind,
} from "../../../../calculations/water-main";
import RequireAuth from "../../RequireAuth";

export default function SegmentPage() {
  return (
    <RequireAuth>
      <SegmentPageContent />
    </RequireAuth>
  );
}

function SegmentPageContent() {
  const [flowUnit, setFlowUnit] = useState<"h" | "day">("h");
  const [flow, setFlow] = useState("1500");
  const [geoLift, setGeoLift] = useState("175");
  const [pipeLength, setPipeLength] = useState("2000");
  const [planLength, setPlanLength] = useState("");

  const [material, setMaterial] = useState<WaterPipeKind>("steel");
  const [lining, setLining] = useState<Lining>("none");
  const [outer, setOuter] = useState("530");
  const [wall, setWall] = useState("10");

  const [freeHead, setFreeHead] = useState("5");
  const [valveCount, setValveCount] = useState("1");
  const [pn, setPn] = useState("");
  const [pumpEff, setPumpEff] = useState("0.82");
  const [motorEff, setMotorEff] = useState("0.95");

  const [showAssumptions, setShowAssumptions] = useState(false);

  const num = (x: string) => Number(String(x).replace(",", ".")) || 0;
  const qM3H = flowUnit === "h" ? num(flow) : num(flow) / 24;

  const { res, error } = useMemo((): { res: SegmentResult | null; error: string } => {
    if (!(qM3H > 0) || !(num(pipeLength) > 0)) return { res: null, error: "" };
    try {
      return {
        res: calculateSegment({
          qM3H,
          geoLiftM: num(geoLift),
          pipeLengthM: num(pipeLength),
          planLengthM: num(planLength) || undefined,
          material,
          lining,
          outerMm: num(outer) || undefined,
          wallMm: num(wall) || undefined,
          freeHeadM: num(freeHead) || undefined,
          valveCount: num(valveCount) || 1,
          pnBar: num(pn) || undefined,
          pumpEff: num(pumpEff) || undefined,
          motorEff: num(motorEff) || undefined,
        }),
        error: "",
      };
    } catch (e) {
      return { res: null, error: e instanceof Error ? e.message : "Расчёт не выполнен." };
    }
  }, [qM3H, geoLift, pipeLength, planLength, material, lining, outer, wall, freeHead, valveCount, pn, pumpEff, motorEff]);

  const walls = STEEL_PIPES.find((p) => p.outerMm === num(outer))?.walls ?? [];

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>УЧАСТОК ВОДОВОДА</div>
        <h1 style={title}>
          Напор, труба
          <br />
          и защита от гидроудара
        </h1>
        <p style={lead}>
          Четыре числа на входе: расход, геодезический перепад, длина участка по трубе и
          геометрическая длина. На выходе — требуемый напор, труба с классом давления, обратный
          гидроудар и параметры защитной арматуры: противоударный клапан, дренажная линия,
          гидропневмобак, вантузы. Профиль трассы здесь не нужен; когда он есть, точнее считает{" "}
          <a href="/engineering/analysis/pipeline" style={link}>
            расчёт по продольному профилю
          </a>
          .
        </p>

        {/* ---------------- ИСХОДНЫЕ ДАННЫЕ ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>ИСХОДНЫЕ ДАННЫЕ УЧАСТКА</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Расход</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={flow} onChange={(e) => setFlow(e.target.value)} inputMode="decimal" style={{ ...inputStyle, flex: 1 }} />
                <select value={flowUnit} onChange={(e) => setFlowUnit(e.target.value as "h" | "day")} style={{ ...inputStyle, width: 110 }}>
                  <option value="h">м³/ч</option>
                  <option value="day">м³/сут</option>
                </select>
              </div>
              {flowUnit === "day" && <span style={fieldHint}>= {(qM3H).toFixed(1)} м³/ч при круглосуточной подаче</span>}
            </label>
            <label style={field}>
              <span style={fieldLabel}>Геодезический перепад, м</span>
              <input value={geoLift} onChange={(e) => setGeoLift(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>разница отметок начала и конца участка</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Длина участка по трубе, м</span>
              <input value={pipeLength} onChange={(e) => setPipeLength(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>по трассе, с учётом уклонов — по ней считаются потери и фаза удара</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Геометрическая длина, м</span>
              <input value={planLength} onChange={(e) => setPlanLength(e.target.value)} inputMode="decimal" placeholder="горизонтальная проекция" style={inputStyle} />
              <span style={fieldHint}>для проверки: труба не может быть короче гипотенузы</span>
            </label>
          </div>
        </section>

        {/* ---------------- ТРУБА ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>ТРУБА</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Материал</span>
              <select value={material} onChange={(e) => setMaterial(e.target.value as WaterPipeKind)} style={inputStyle}>
                {(Object.keys(WATER_PIPE) as WaterPipeKind[]).map((k) => (
                  <option key={k} value={k}>
                    {WATER_PIPE[k].label}
                  </option>
                ))}
              </select>
              <span style={fieldHint}>ниже расчёт сравнивает все материалы по амплитуде удара</span>
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
                {STEEL_PIPES.map((p) => (
                  <option key={p.outerMm} value={p.outerMm}>
                    {p.outerMm}
                  </option>
                ))}
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Толщина стенки, мм</span>
              <select value={wall} onChange={(e) => setWall(e.target.value)} style={inputStyle} disabled={!walls.length}>
                <option value="">по расчёту на давление</option>
                {walls.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* ---------------- УСЛОВИЯ ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>УСЛОВИЯ РАСЧЁТА — МОЖНО МЕНЯТЬ</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Свободный напор в конце участка, м</span>
              <input value={freeHead} onChange={(e) => setFreeHead(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Класс давления PN, бар</span>
              <select value={pn} onChange={(e) => setPn(e.target.value)} style={inputStyle}>
                <option value="">подобрать</option>
                {[10, 16, 25, 32, 40, 63].map((p) => (
                  <option key={p} value={p}>
                    PN{p}
                  </option>
                ))}
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Число противоударных клапанов</span>
              <input value={valveCount} onChange={(e) => setValveCount(e.target.value)} inputMode="numeric" style={inputStyle} />
              <span style={fieldHint}>гребёнка из нескольких клапанов вместо одного большого</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>КПД насоса</span>
              <input value={pumpEff} onChange={(e) => setPumpEff(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>КПД двигателя</span>
              <input value={motorEff} onChange={(e) => setMotorEff(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
          </div>
        </section>

        {error && <div style={warnBox}>{error}</div>}
        {!res && !error && (
          <section style={card}>
            <p style={{ ...hint, margin: 0 }}>Заполните расход и длину участка.</p>
          </section>
        )}

        {res && (
          <>
            {/* ---------------- ТРЕБУЕМЫЙ НАПОР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ТРЕБУЕМЫЙ НАПОР И ТРУБА</div>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>НАПОР НАСОСА</div>
                  <div style={bigValue}>
                    {res.requiredHeadM} <span style={unit}>м</span>
                  </div>
                  <div style={fieldHint}>{res.requiredHeadBar} бар</div>
                </div>
                <div>
                  <div style={smallLabel}>ТРУБА</div>
                  <div style={bigValue}>
                    {res.outerMm}×{res.wallMm}
                  </div>
                  <div style={fieldHint}>внутренний {res.innerMm} мм</div>
                </div>
                <div>
                  <div style={smallLabel}>КЛАСС ДАВЛЕНИЯ</div>
                  <div style={bigValue}>PN{res.pnBar}</div>
                  <div style={fieldHint}>стенка по расчёту {res.wallByTestMm} мм</div>
                </div>
                <div>
                  <div style={smallLabel}>СКОРОСТЬ</div>
                  <div style={bigValue}>
                    {res.velocity} <span style={unit}>м/с</span>
                  </div>
                  <div style={fieldHint}>{res.gradientMPerKm} м/км</div>
                </div>
                <div>
                  <div style={smallLabel}>МОЩНОСТЬ</div>
                  <div style={bigValue}>
                    {res.motorKW} <span style={unit}>кВт</span>
                  </div>
                  <div style={fieldHint}>на валу {res.shaftKW} кВт</div>
                </div>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                Напор {res.requiredHeadM} м = перепад {num(geoLift)} + потери по длине {res.frictionM} +
                местные {res.localM} + свободный напор {num(freeHead)} м. Кольцевое напряжение в стенке{" "}
                {res.hoopStressMPa} МПа, критическое наружное давление (смятие при вакууме){" "}
                {res.bucklingBar} бар.
                {res.minPipeLengthM > 0 && (
                  <>
                    {" "}
                    Минимально возможная длина трубы при заданной проекции — {res.minPipeLengthM} м.
                  </>
                )}
              </p>
            </section>

            {/* ---------------- ГИДРОУДАР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ОБРАТНЫЙ ГИДРОУДАР</div>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ПИК БЕЗ ЗАЩИТЫ</div>
                  <div style={{ ...bigValue, color: res.peakBar > res.pnBar ? "#ffcf8a" : "#e7eef1" }}>
                    {res.peakBar} <span style={unit}>бар</span>
                  </div>
                  <div style={fieldHint}>повышение {res.surgeM} м</div>
                </div>
                <div>
                  <div style={smallLabel}>СКОРОСТЬ ВОЛНЫ</div>
                  <div style={bigValue}>
                    {res.waveSpeedMs} <span style={unit}>м/с</span>
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>ФАЗА УДАРА 2L/c</div>
                  <div style={bigValue}>
                    {res.phaseS} <span style={unit}>с</span>
                  </div>
                  <div style={fieldHint}>возврат отражённой волны</div>
                </div>
                <div>
                  <div style={smallLabel}>ТОРМОЖЕНИЕ СТОЛБА</div>
                  <div style={bigValue}>
                    {res.stopTimeS || "—"} <span style={unit}>с</span>
                  </div>
                  <div style={fieldHint}>{res.direct ? "быстрее фазы — удар прямой" : "медленнее фазы — удар непрямой"}</div>
                </div>
                <div>
                  <div style={smallLabel}>МИНИМУМ ПРИ РАЗРЕЖЕНИИ</div>
                  <div style={{ ...bigValue, color: res.separation ? "#ffcf8a" : "#e7eef1" }}>
                    {res.minHeadM} <span style={unit}>м</span>
                  </div>
                  <div style={fieldHint}>{res.separation ? "разрыв сплошности" : "сплошность сохраняется"}</div>
                </div>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                Это давление, которое возникнет, если защиты нет. Оно и есть то, чего защита обязана
                не допустить. Насколько именно она снизит пик, показывает расчёт переходного
                процесса с фактической характеристикой выбега насоса — умножать на коэффициент
                нельзя, такого коэффициента не существует.
              </p>
            </section>

            {/* ---------------- ЗАЩИТНАЯ АРМАТУРА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ПАРАМЕТРЫ ЗАЩИТНОЙ АРМАТУРЫ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={tdLeft}>Противоударный клапан</td>
                      <td style={tdVal}>
                        {res.protection.valveCount} шт. DN{res.protection.valveDnMm}, PN
                        {res.protection.valvePnBar}
                      </td>
                      <td style={tdNote}>
                        требуемая пропускная способность Kv = {res.protection.requiredKv} м³/ч при 1 бар
                        {res.protection.valveCount > 1 ? `, по ${res.protection.kvPerValve} на клапан` : ""}
                      </td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Время полного открытия</td>
                      <td style={tdVal}>не более {res.protection.openTimeS} с</td>
                      <td style={tdNote}>половина фазы удара: позже — отражённая волна придёт в закрытый клапан</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Объём сброса за отключение</td>
                      <td style={tdVal}>{res.protection.dischargeVolumeM3} м³</td>
                      <td style={tdNote}>определяет {res.protection.volumeGovernedBy}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Дренажная линия</td>
                      <td style={tdVal}>DN{res.protection.drainDnMm}</td>
                      <td style={tdNote}>скорость {res.protection.drainVelocity} м/с при полном сбросе</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Приёмная ёмкость</td>
                      <td style={tdVal}>не менее {res.protection.receiverM3} м³</td>
                      <td style={tdNote}>на один цикл аварийного отключения, с запасом 20 %</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Гидропневмобак</td>
                      <td style={tdVal}>{res.protection.vesselTotalM3} м³</td>
                      <td style={tdNote}>
                        начальный объём воздуха {res.protection.vesselAirM3} м³; оценка энергетическим
                        методом, окончательно — расчётом переходного процесса
                      </td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Вантузы двойного действия</td>
                      <td style={tdVal}>
                        {res.protection.airValveCount} шт. DN{res.protection.airValveDnMm}
                      </td>
                      <td style={tdNote}>в верхних точках и по шагу вдоль участка</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>Обратный клапан у насоса</td>
                      <td style={tdVal}>с демпфированием закрытия</td>
                      <td style={tdNote}>захлопка закрывается в момент возврата столба и принимает удар целиком</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- МАТЕРИАЛЫ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>МАТЕРИАЛ ТРУБОПРОВОДА</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Материал</th>
                      <th style={th}>Скорость волны, м/с</th>
                      <th style={th}>Повышение, м</th>
                      <th style={th}>Пик без защиты, бар</th>
                      <th style={{ ...th, textAlign: "left" }}>Пригодность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.materials.map((m) => (
                      <tr key={m.kind} style={{ opacity: m.suitable ? 1 : 0.5 }}>
                        <td style={{ ...tdLeft, color: m.note === "принят в расчёт" ? "#5fb6c9" : undefined }}>
                          {m.label}
                        </td>
                        <td style={td}>{m.waveSpeedMs}</td>
                        <td style={td}>{m.surgeM}</td>
                        <td style={td}>{m.peakBar}</td>
                        <td style={tdNote}>{m.suitable ? m.note || "проходит по классу давления" : m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                Разница между сталью и полиэтиленом здесь не в цене и не в коррозии, а в скорости
                волны: в полиэтилене она в разы ниже, и удар соответственно меньше. На длинном
                напорном участке это довод сильнее любого другого — но только там, где хватает
                класса давления.
              </p>
            </section>

            {/* ---------------- ПРЕДУПРЕЖДЕНИЯ ---------------- */}
            {res.warnings.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>ПРОВЕРКИ, КОТОРЫЕ НЕ ПРОШЛИ</div>
                {res.warnings.map((w, i) => (
                  <div key={i} style={{ ...warnBox, marginBottom: i === res.warnings.length - 1 ? 0 : 12 }}>
                    {w}
                  </div>
                ))}
              </section>
            )}

            {/* ---------------- ДОПУЩЕНИЯ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ЧТО ПРИНЯТО, А НЕ ПОСЧИТАНО</div>
              <button style={ghost} onClick={() => setShowAssumptions((v) => !v)}>
                {showAssumptions ? "Свернуть" : `Показать все допущения (${res.assumptions.length})`}
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
const container: CSSProperties = { width: "min(1150px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 860, marginTop: 25, marginBottom: 40, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
const link: CSSProperties = { color: "#5fb6c9" };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12 };
const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.7 };
const bigRow: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 };
const smallLabel: CSSProperties = { color: "#5c7280", fontSize: 11, letterSpacing: "1px", marginBottom: 6 };
const bigValue: CSSProperties = { color: "#e7eef1", fontSize: 30, fontWeight: 700 };
const unit: CSSProperties = { fontSize: 15, color: "#8ca4ad", fontWeight: 400 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 170, whiteSpace: "normal", color: "#8ca4ad" };
const tdVal: CSSProperties = { ...td, textAlign: "left", color: "#e7eef1", fontWeight: 700, minWidth: 150 };
const tdNote: CSSProperties = { ...td, textAlign: "left", color: "#8ca4ad", whiteSpace: "normal", fontSize: 12.5, lineHeight: 1.5 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
