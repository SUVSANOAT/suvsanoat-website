"use client";

/* ==================================================================
 * ДОЖДЕВАЯ КАНАЛИЗАЦИЯ — РАСЧЁТНЫЙ РАСХОД
 *
 * Метод предельных интенсивностей по ҚМҚ 2.04.03-19, раздел 2.
 * Страница спрашивает ровно то, что нужно формуле, и ничего не
 * подставляет за проектировщика: интенсивность дождя q20 берётся с
 * карты изолиний (рис. 1) для конкретной площадки, и поле для неё
 * пустое до тех пор, пока человек не впишет своё значение.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  calculateStorm,
  TABLE_4,
  TABLE_5_P,
  TABLE_9_Z,
  zImpervious,
  type ClimateZone,
  type SurfaceShare,
} from "../../../../calculations/storm";
import RequireAuth from "../../RequireAuth";

export default function StormPage() {
  return (
    <RequireAuth>
      <StormPageContent />
    </RequireAuth>
  );
}

function StormPageContent() {
  const [q20, setQ20] = useState("");
  const [zone, setZone] = useState<ClimateZone>("plains");
  const [period, setPeriod] = useState("1");
  const [area, setArea] = useState("12");
  const [tCon, setTCon] = useState("5");
  const [canalL, setCanalL] = useState("");
  const [canalV, setCanalV] = useState("0.8");
  const [pipeL, setPipeL] = useState("600");
  const [pipeV, setPipeV] = useState("1.2");

  /* доли поверхностей: непроницаемые + три вида по табл. 9 */
  const [shareHard, setShareHard] = useState("55");
  const [shareGravel, setShareGravel] = useState("0");
  const [shareGround, setShareGround] = useState("20");
  const [shareLawn, setShareLawn] = useState("25");

  const num = (v: string) => Number(v.replace(",", ".")) || 0;

  const surfaces: SurfaceShare[] = useMemo(
    () => [
      { share: num(shareHard) / 100, z: null, label: "кровли и асфальтобетон" },
      { share: num(shareGravel) / 100, z: 0.125, label: "щебёночные покрытия" },
      { share: num(shareGround) / 100, z: 0.064, label: "грунтовые спланированные" },
      { share: num(shareLawn) / 100, z: 0.038, label: "газоны, зелёные насаждения" },
    ],
    [shareHard, shareGravel, shareGround, shareLawn],
  );

  const res = useMemo(
    () =>
      calculateStorm({
        q20: num(q20),
        zone,
        periodYears: num(period) || 1,
        areaHa: num(area),
        tConMin: num(tCon) || 5,
        canal: num(canalL) > 0 ? { lengthM: num(canalL), velocity: num(canalV) || 0.8 } : undefined,
        pipe: num(pipeL) > 0 ? { lengthM: num(pipeL), velocity: num(pipeV) || 1.2 } : undefined,
        surfaces: surfaces.filter((s) => s.share > 0),
      }),
    [q20, zone, period, area, tCon, canalL, canalV, pipeL, pipeV, surfaces],
  );

  const ready = num(q20) > 0 && num(area) > 0;

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ДОЖДЕВАЯ КАНАЛИЗАЦИЯ</div>
        <h1 style={title}>
          Расчётный расход
          <br />
          дождевых вод
        </h1>
        <p style={lead}>
          Метод предельных интенсивностей по ҚМҚ 2.04.03-19: q_r = z_mid·A<sup>1,2</sup>·F / t_r
          <sup>(1,2n−0,1)</sup>. Программа считает параметр A, средний коэффициент стока и
          продолжительность протекания, но интенсивность дождя q20 вы задаёте сами — её берут с
          карты изолиний норматива для площадки объекта.
        </p>

        <section style={card}>
          <div style={sectionTitle}>КЛИМАТ И РЕЖИМ</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Интенсивность дождя q20, л/(с·га)</span>
              <input value={q20} onChange={(e) => setQ20(e.target.value)} inputMode="decimal" placeholder="с карты, рис. 1" style={inputStyle} />
              <span style={fieldHint}>при P = 1 год и t = 20 мин; в программе значения q20 не хранятся</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Климатическая зона (табл. 4)</span>
              <select value={zone} onChange={(e) => setZone(e.target.value as ClimateZone)} style={inputStyle}>
                {(Object.keys(TABLE_4) as ClimateZone[]).map((k) => (
                  <option key={k} value={k}>
                    {TABLE_4[k].label} (n = {TABLE_4[k].n})
                  </option>
                ))}
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Период однократного превышения P, лет</span>
              <input value={period} onChange={(e) => setPeriod(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>табл. 5 — по условиям расположения коллектора</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Площадь водосбора F, га</span>
              <input value={area} onChange={(e) => setArea(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
          </div>

          <div style={{ ...hint, marginTop: 14 }}>
            Табл. 5, период P по условиям расположения:{" "}
            {TABLE_5_P.map((r) => `${r.condition} — местные проезды ${r.local[0]}–${r.local[1]}, магистральные ${r.main[0]}–${r.main[1]}`).join("; ")} лет.
          </div>
        </section>

        <section style={card}>
          <div style={sectionTitle}>ПРОДОЛЖИТЕЛЬНОСТЬ ПРОТЕКАНИЯ (Ф. 5–7)</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Поверхностная концентрация t_con, мин</span>
              <input value={tCon} onChange={(e) => setTCon(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>п. 2.16: 5–10 мин без внутриквартальной сети, 3–5 с ней</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Длина по лоткам, м</span>
              <input value={canalL} onChange={(e) => setCanalL(e.target.value)} inputMode="decimal" placeholder="нет" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Скорость в лотках, м/с</span>
              <input value={canalV} onChange={(e) => setCanalV(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Длина по трубам, м</span>
              <input value={pipeL} onChange={(e) => setPipeL(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Скорость в трубах, м/с</span>
              <input value={pipeV} onChange={(e) => setPipeV(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
          </div>
        </section>

        <section style={card}>
          <div style={sectionTitle}>СОСТАВ ПОВЕРХНОСТЕЙ ВОДОСБОРА, %</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Кровли и асфальтобетон</span>
              <input value={shareHard} onChange={(e) => setShareHard(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>z по табл. 10 от A: сейчас {zImpervious(res.A).toFixed(3)}</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Щебёночные покрытия</span>
              <input value={shareGravel} onChange={(e) => setShareGravel(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>z = 0,125</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Грунтовые спланированные</span>
              <input value={shareGround} onChange={(e) => setShareGround(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>z = 0,064</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Газоны и зелёные насаждения</span>
              <input value={shareLawn} onChange={(e) => setShareLawn(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>z = 0,038</span>
            </label>
          </div>
          <div style={{ ...hint, marginTop: 12 }}>
            Табл. 9, прочие покрытия: {TABLE_9_Z.map((s) => `${s.surface} — ${s.z}`).join("; ")}.
          </div>
        </section>

        {ready && (
          <>
            <section style={{ ...card, borderColor: "#2a5b68" }}>
              <div style={sectionTitle}>РЕЗУЛЬТАТ</div>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>РАСЧЁТНЫЙ РАСХОД</div>
                  <div style={bigValue}>
                    {res.qLps} <span style={unit}>л/с</span>
                  </div>
                  <div style={{ color: "#8ca4ad", fontSize: 13 }}>{res.qM3H} м³/ч</div>
                </div>
                <div>
                  <div style={smallLabel}>ПАРАМЕТР A</div>
                  <div style={bigValue}>{res.A}</div>
                  <div style={{ color: "#8ca4ad", fontSize: 13 }}>n = {res.n}, m_r = {res.mr}, γ = {res.gamma}</div>
                </div>
                <div>
                  <div style={smallLabel}>КОЭФФИЦИЕНТ СТОКА</div>
                  <div style={bigValue}>{res.zMid}</div>
                </div>
                <div>
                  <div style={smallLabel}>ПРОДОЛЖИТЕЛЬНОСТЬ</div>
                  <div style={bigValue}>
                    {res.tR} <span style={unit}>мин</span>
                  </div>
                  <div style={{ color: "#8ca4ad", fontSize: 13 }}>
                    {res.tCon} + {res.tCan} + {res.tPipe}
                  </div>
                </div>
              </div>
            </section>

            {res.warnings.map((w) => (
              <div key={w} style={warnBox}>
                {w}
              </div>
            ))}

            <section style={card}>
              <div style={sectionTitle}>ЧТО ПРИНЯТО И НА КАКОМ ОСНОВАНИИ</div>
              <ul style={notes}>
                {res.assumptions.map((a) => (
                  <li key={a} style={{ marginBottom: 8 }}>
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {!ready && (
          <div style={warnBox}>
            Впишите интенсивность дождя q20 и площадь водосбора. q20 берётся с карты изолиний
            (рис. 1 ҚМҚ 2.04.03-19) для площадки объекта — «типового» значения тут не бывает, от
            него напрямую зависит диаметр коллектора.
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------------------- стили ---------------------------- */

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1150px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 860, marginTop: 25, marginBottom: 40, color: "#8ca4ad", fontSize: 17, lineHeight: 1.7 };
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
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
