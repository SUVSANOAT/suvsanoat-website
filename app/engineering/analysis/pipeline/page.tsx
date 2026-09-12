"use client";

/* ==================================================================
 * НАПОРНЫЙ ВОДОВОД И КАСКАД НАСОСНЫХ СТАНЦИЙ
 *
 * Страница спрашивает у проектировщика ровно то, что он знает: расход,
 * профиль трассы и материал трубы. Диаметр, число насосных станций, их
 * места, класс давления, толщину стенки, вантузы и выпуски программа
 * подбирает сама.
 *
 * ЦЕНЫ ВВОДИТ ЧЕЛОВЕК, А НЕ ПРОГРАММА
 *
 * Выбор диаметра водовода — это выбор между стоимостью трубы один раз
 * и стоимостью электричества каждый год. Тариф и цену трубы программа
 * знать не может: они разные у каждого объекта и меняются быстрее, чем
 * успевает обновиться справочник. Поэтому поля экономики пустые. Пока
 * они пустые, сравнение диаметров показывает только технику — скорость,
 * потери, мощность, массу металла. Как только тариф и цену вписали,
 * появляются столбцы стоимости и приведённых затрат.
 *
 * То же с величинами практики: минимальный подпор на входе станции,
 * предельный напор ступени, КПД, глубина заложения. У них есть
 * значения по умолчанию, но все они открыты для правки — проектировщик
 * знает свой объект лучше, чем значение по умолчанию.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import {
  calculateWaterMain,
  STEEL_PIPES,
  WATER_MAIN,
  WATER_PIPE,
  type Lining,
  type ProfilePoint,
  type WaterMainResult,
  type WaterPipeKind,
} from "../../../../calculations/water-main";
import {
  parseProfileKml,
  parseProfileTable,
  synthesizeProfile,
  type ParsedProfile,
} from "../../../../calculations/water-main-input";
import { buildMainSpecification, stageProtection as buildStages, type MainSpecStage } from "../../../../calculations/main-spec";
import { buildMainReportHtml } from "../../../../calculations/main-report";
import ProjectsPanel from "../ProjectsPanel";
import RequireAuth from "../../RequireAuth";

export default function PipelinePage() {
  return (
    <RequireAuth>
      <PipelinePageContent />
    </RequireAuth>
  );
}

const EXAMPLE = `Пикет;Отметка земли
ПК0;895.00
ПК1;919.19
ПК2;944.88
ПК3;983.03
ПК4;996.25
ПК5;1038.47`;

function PipelinePageContent() {
  /* --- расход и режим --- */
  const [flowMode, setFlowMode] = useState<"known" | "irrigation">("known");
  const [qDay, setQDay] = useState("33500");
  const [areaHa, setAreaHa] = useState("3000");
  const [normM3HaDay, setNormM3HaDay] = useState("11");
  const [hours, setHours] = useState("24");
  const [days, setDays] = useState("365");
  const [lines, setLines] = useState("1");

  /* --- трасса --- */
  const [profileMode, setProfileMode] = useState<"table" | "simple">("table");
  const [profileText, setProfileText] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [segLift, setSegLift] = useState("");
  const [segLength, setSegLength] = useState("");
  const [segPlan, setSegPlan] = useState("");
  const [segStart, setSegStart] = useState("");
  const [terrain, setTerrain] = useState<"flat" | "hills" | "mountain">("hills");

  /* --- труба --- */
  const [material, setMaterial] = useState<WaterPipeKind>("steel");
  const [lining, setLining] = useState<Lining>("cement");
  const [outer, setOuter] = useState("");
  const [wall, setWall] = useState("");

  /* --- отметки и ограничения --- */
  const [sourceLevel, setSourceLevel] = useState("");
  const [freeEnd, setFreeEnd] = useState(String(WATER_MAIN.freeHeadEnd.value));
  const [minSuction, setMinSuction] = useState(String(WATER_MAIN.minSuctionHead.value));
  const [minLine, setMinLine] = useState(String(WATER_MAIN.minLineHead.value));
  const [maxStage, setMaxStage] = useState(String(WATER_MAIN.maxStageHead.value));
  const [bury, setBury] = useState(String(WATER_MAIN.buryDepth.value));
  const [pn, setPn] = useState("");
  const [maxStations, setMaxStations] = useState("12");
  const [pumpEff, setPumpEff] = useState(String(WATER_MAIN.efficiency.pump));
  const [motorEff, setMotorEff] = useState(String(WATER_MAIN.efficiency.motor));

  /* --- экономика: пустые поля, пока человек не вписал свои цифры --- */
  const [tariff, setTariff] = useState("");
  const [pipePrice, setPipePrice] = useState("");
  const [horizon, setHorizon] = useState("25");

  const [showNodes, setShowNodes] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);

  /* --- отчёт и ведомость --- */
  const [objectName, setObjectName] = useState("");
  const [reservePct, setReservePct] = useState("2");
  const [sectionSpacing, setSectionSpacing] = useState("2000");
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState("");

  const num = (v: string) => Number(String(v).replace(",", ".")) || 0;

  /* ------------------------------------------------------------------
     ПРОФИЛЬ
     ------------------------------------------------------------------ */
  const parsed: ParsedProfile | null = useMemo(() => {
    if (profileMode === "simple") {
      if (!(num(segLength) > 0) || !segLift) return null;
      const start = num(segStart);
      const out = synthesizeProfile({
        startElevM: start,
        endElevM: start + num(segLift),
        lengthM: num(segLength),
        terrain,
      });
      /* Геометрическая длина — проверка, а не расчёт: труба идёт по
         склону и короче гипотенузы быть не может. */
      if (num(segPlan) > 0) {
        const minLen = Math.sqrt(num(segPlan) ** 2 + num(segLift) ** 2);
        if (num(segLength) < minLen - 0.5) {
          out.problems.unshift(
            `Длина трубы ${Math.round(num(segLength))} м меньше минимально возможной ${Math.round(minLen)} м при проекции ${Math.round(num(segPlan))} м и перепаде ${num(segLift)} м. Труба не может быть короче гипотенузы — проверьте исходные данные.`,
          );
        }
      }
      if (!segStart) {
        out.problems.push(
          "Отметка начала не задана, принята 0 м. Она нужна только для атмосферного давления в расчёте кавитационного запаса: на 1500 м оно на 17 % ниже, чем на уровне моря.",
        );
      }
      return out;
    }
    if (!profileText.trim()) return null;
    return profileText.includes("<coordinates>") ? parseProfileKml(profileText) : parseProfileTable(profileText);
  }, [profileMode, profileText, segLift, segLength, segPlan, segStart, terrain]);

  async function onFile(file: File | null) {
    if (!file) return;
    setFileNote("");
    try {
      const text = await file.text();
      if (/\.kmz$/i.test(file.name)) {
        setFileNote("KMZ — это ZIP-архив, его надо распаковать: в Google Earth сохраните трассу как KML.");
        return;
      }
      setProfileText(text);
      setProfileMode("table");
      setFileNote(`Прочитан файл ${file.name}, ${(file.size / 1024).toFixed(0)} КБ.`);
    } catch {
      setFileNote("Файл не прочитался. Нужен текстовый CSV, TXT или KML.");
    }
  }

  /* ------------------------------------------------------------------
     РАСХОД
     ------------------------------------------------------------------ */
  const qM3Day = useMemo(() => {
    if (flowMode === "irrigation") return num(areaHa) * num(normM3HaDay);
    return num(qDay);
  }, [flowMode, qDay, areaHa, normM3HaDay]);

  /* ------------------------------------------------------------------
     РАСЧЁТ
     ------------------------------------------------------------------ */
  const { res, error } = useMemo((): { res: WaterMainResult | null; error: string } => {
    const points: ProfilePoint[] = parsed?.points ?? [];
    if (points.length < 2 || !(qM3Day > 0)) return { res: null, error: "" };
    try {
      return {
        res: calculateWaterMain({
          profile: points,
          qM3Day,
          hoursPerDay: num(hours) || 24,
          daysPerYear: num(days) || 365,
          lines: num(lines) || 1,
          material,
          lining,
          outerMm: num(outer) || undefined,
          wallMm: num(wall) || undefined,
          sourceLevelM: sourceLevel ? num(sourceLevel) : undefined,
          freeHeadEndM: num(freeEnd) || undefined,
          minSuctionHeadM: num(minSuction) || undefined,
          minLineHeadM: num(minLine) || undefined,
          maxStageHeadM: num(maxStage) || undefined,
          buryDepthM: num(bury) || undefined,
          pnBar: num(pn) || undefined,
          maxStations: num(maxStations) || undefined,
          pumpEff: num(pumpEff) || undefined,
          motorEff: num(motorEff) || undefined,
          tariffPerKWh: num(tariff) || undefined,
          pipePricePerTon: num(pipePrice) || undefined,
          horizonYears: num(horizon) || undefined,
        }),
        error: "",
      };
    } catch (e) {
      return { res: null, error: e instanceof Error ? e.message : "Расчёт не выполнен." };
    }
  }, [
    parsed, qM3Day, hours, days, lines, material, lining, outer, wall, sourceLevel, freeEnd,
    minSuction, minLine, maxStage, bury, pn, maxStations, pumpEff, motorEff, tariff, pipePrice, horizon,
  ]);

  /* ------------------------------------------------------------------
     ЗАЩИТА ОТ ГИДРОУДАРА ПО КАЖДОЙ СТУПЕНИ

     После расстановки станций каждый участок известен: длина, перепад,
     труба. Значит, клапан, дренаж, бак и вантузы считаются сразу для
     всех ступеней — отдельной страницы и повторного ввода не нужно.
     ------------------------------------------------------------------ */
  const stageProtection = useMemo((): MainSpecStage[] => {
    if (!res) return [];
    return buildStages(res, {
      material,
      lining,
      minSuctionHeadM: num(minSuction) || undefined,
      freeHeadEndM: num(freeEnd) || undefined,
      pumpEff: num(pumpEff) || undefined,
      motorEff: num(motorEff) || undefined,
    });
  }, [res, material, lining, minSuction, freeEnd, pumpEff, motorEff]);

  /* ------------------------------------------------------------------
     ВЕДОМОСТЬ

     Собирается из того же результата, что и таблицы на экране: длина
     трубы — по профилю, агрегаты — по станциям, вантузы и выпуски — по
     найденным точкам. Отдельного ввода нет и быть не должно.
     ------------------------------------------------------------------ */
  const spec = useMemo(() => {
    if (!res) return null;
    return buildMainSpecification(res, {
      material,
      lining,
      stages: stageProtection,
      installReservePct: num(reservePct) || undefined,
      sectionSpacingM: num(sectionSpacing) || undefined,
    });
  }, [res, material, lining, stageProtection, reservePct, sectionSpacing]);

  const worstStage = stageProtection.reduce<(typeof stageProtection)[number] | null>(
    (w, x) => (!w || x.seg.peakBar > w.seg.peakBar ? x : w),
    null,
  );

  const money = (v: number | undefined) =>
    v === undefined ? "—" : v >= 1e6 ? `${(v / 1e6).toFixed(1)} млн` : v.toLocaleString("ru-RU");

  const walls = STEEL_PIPES.find((p) => p.outerMm === num(outer))?.walls ?? [];
  const hasEconomics = num(tariff) > 0 && num(pipePrice) > 0;


  /* ------------------------------------------------------------------
     СОХРАНЕНИЕ РАСЧЁТА

     Снимок — это содержимое полей, ничего больше. Результаты не
     сохраняются: код расчёта меняется, и открытый через месяц проект
     обязан пересчитаться сегодняшним кодом, а не показать вчерашнее
     число, которое к тому времени могло оказаться ошибкой.
     ------------------------------------------------------------------ */
  const stateSnapshot = (): Record<string, unknown> => ({
    qDay,
    areaHa,
    normM3HaDay,
    hours,
    days,
    lines,
    profileText,
    segLift,
    segLength,
    segPlan,
    segStart,
    outer,
    wall,
    sourceLevel,
    freeEnd,
    minSuction,
    minLine,
    maxStage,
    bury,
    pn,
    maxStations,
    pumpEff,
    motorEff,
    tariff,
    pipePrice,
    horizon,
    objectName,
    reservePct,
    sectionSpacing,
    flowMode,
    profileMode,
    terrain,
    material,
    lining,
  });

  const applyState = (d: Record<string, unknown>) => {
    const str = (k: string, set: (v: string) => void) => {
      const v = d[k];
      if (typeof v === "string") set(v);
      else if (typeof v === "number") set(String(v));
    };
    str("qDay", setQDay);
    str("areaHa", setAreaHa);
    str("normM3HaDay", setNormM3HaDay);
    str("hours", setHours);
    str("days", setDays);
    str("lines", setLines);
    str("profileText", setProfileText);
    str("segLift", setSegLift);
    str("segLength", setSegLength);
    str("segPlan", setSegPlan);
    str("segStart", setSegStart);
    str("outer", setOuter);
    str("wall", setWall);
    str("sourceLevel", setSourceLevel);
    str("freeEnd", setFreeEnd);
    str("minSuction", setMinSuction);
    str("minLine", setMinLine);
    str("maxStage", setMaxStage);
    str("bury", setBury);
    str("pn", setPn);
    str("maxStations", setMaxStations);
    str("pumpEff", setPumpEff);
    str("motorEff", setMotorEff);
    str("tariff", setTariff);
    str("pipePrice", setPipePrice);
    str("horizon", setHorizon);
    str("objectName", setObjectName);
    str("reservePct", setReservePct);
    str("sectionSpacing", setSectionSpacing);
    if (d.flowMode === "known" || d.flowMode === "irrigation") setFlowMode(d.flowMode);
    if (d.profileMode === "table" || d.profileMode === "simple") setProfileMode(d.profileMode);
    if (d.terrain === "flat" || d.terrain === "hills" || d.terrain === "mountain") setTerrain(d.terrain);
    if (typeof d.material === "string" && d.material in WATER_PIPE) setMaterial(d.material as WaterPipeKind);
    if (d.lining === "none" || d.lining === "cement" || d.lining === "epoxy") setLining(d.lining);
    setFileError("");
  };

  /* ------------------------------------------------------------------
     ВЫГРУЗКА

     Word собирается на сервере: туда уходят исходные данные, и расчёт
     повторяется тем же кодом. Присылать серверу готовые числа нельзя —
     документ, собранный из присланного, перестаёт быть расчётом.
     PDF печатает браузер из той же вёрстки.
     ------------------------------------------------------------------ */
  function reportPayload() {
    const points = parsed?.points ?? [];
    if (!res || points.length < 2) return null;
    return {
      mode: "main" as const,
      object: objectName || undefined,
      profile: points,
      qM3Day,
      hoursPerDay: num(hours) || 24,
      daysPerYear: num(days) || 365,
      lines: num(lines) || 1,
      material,
      lining,
      outerMm: num(outer) || undefined,
      wallMm: num(wall) || undefined,
      sourceLevelM: sourceLevel ? num(sourceLevel) : undefined,
      freeHeadEndM: num(freeEnd) || undefined,
      minSuctionHeadM: num(minSuction) || undefined,
      minLineHeadM: num(minLine) || undefined,
      maxStageHeadM: num(maxStage) || undefined,
      buryDepthM: num(bury) || undefined,
      pnBar: num(pn) || undefined,
      maxStations: num(maxStations) || undefined,
      pumpEff: num(pumpEff) || undefined,
      motorEff: num(motorEff) || undefined,
      tariffPerKWh: num(tariff) || undefined,
      pipePricePerTon: num(pipePrice) || undefined,
      horizonYears: num(horizon) || undefined,
      installReservePct: num(reservePct) || undefined,
      sectionSpacingM: num(sectionSpacing) || undefined,
    };
  }

  async function downloadWord() {
    const payload = reportPayload();
    if (!payload) return;
    setBusy(true);
    setFileError("");
    try {
      const r = await fetch("/api/main-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || "Документ не собрался.");
        return;
      }
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "SUVSANOAT_raschet_napornogo_vodovoda.docx";
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setFileError("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadXlsx() {
    const payload = reportPayload();
    if (!payload) return;
    setBusy(true);
    setFileError("");
    try {
      const r = await fetch("/api/vedomost-xlsx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || "Ведомость не собралась.");
        return;
      }
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "SUVSANOAT_vedomost_napornogo_vodovoda.xlsx";
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setFileError("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadDxf() {
    const payload = reportPayload();
    if (!payload) return;
    setBusy(true);
    setFileError("");
    try {
      const r = await fetch("/api/water-dxf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || "Чертежи не собрались.");
        return;
      }
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "SUVSANOAT_chertezhi_vodovoda.zip";
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setFileError("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  function downloadPdf() {
    if (!res) return;
    setFileError("");
    const html = buildMainReportHtml({
      object: objectName || undefined,
      material,
      lining,
      qM3Day,
      hoursPerDay: num(hours) || 24,
      lines: num(lines) || 1,
      res,
      stages: stageProtection,
      spec,
      tariffPerKWh: num(tariff) || undefined,
    });
    const w = window.open("", "_blank");
    if (!w) {
      setFileError("Браузер заблокировал новое окно. Разрешите всплывающие окна для этого сайта.");
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>НАПОРНЫЙ ВОДОВОД</div>
        <h1 style={title}>
          Гидравлический расчёт
          <br />
          и каскад насосных станций
        </h1>
        <p style={lead}>
          Вводятся расход и продольный профиль трассы. Программа считает потери тремя методами,
          строит линию энергии по каждой точке профиля, расставляет насосные станции, проверяет
          давления, гидравлический удар и разрыв сплошности потока, подбирает толщину стенки, класс
          давления, вантузы и выпуски. Все числа выводятся из одной узловой таблицы — разойтись
          между собой они не могут.
        </p>

        {/* ---------------- РАСХОД ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>РАСХОД И РЕЖИМ ПОДАЧИ</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <button style={flowMode === "known" ? primary : ghost} onClick={() => setFlowMode("known")}>
              Расход известен
            </button>
            <button style={flowMode === "irrigation" ? primary : ghost} onClick={() => setFlowMode("irrigation")}>
              По площади орошения
            </button>
          </div>
          <div style={grid}>
            {flowMode === "known" ? (
              <label style={field}>
                <span style={fieldLabel}>Расход Q, м³/сут</span>
                <input value={qDay} onChange={(e) => setQDay(e.target.value)} inputMode="decimal" style={inputStyle} />
              </label>
            ) : (
              <>
                <label style={field}>
                  <span style={fieldLabel}>Площадь орошения, га</span>
                  <input value={areaHa} onChange={(e) => setAreaHa(e.target.value)} inputMode="decimal" style={inputStyle} />
                </label>
                <label style={field}>
                  <span style={fieldLabel}>Норма полива, м³ на га в сутки</span>
                  <input value={normM3HaDay} onChange={(e) => setNormM3HaDay(e.target.value)} inputMode="decimal" style={inputStyle} />
                  <span style={fieldHint}>по культурам и способу полива; программа норм не хранит</span>
                </label>
              </>
            )}
            <label style={field}>
              <span style={fieldLabel}>Часов работы в сутки</span>
              <input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>меньше 24 — расчётный расход и мощность растут</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Дней работы в году</span>
              <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>для орошения это сезон, а не 365: от этого прямо зависят годовые затраты</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Число ниток</span>
              <input value={lines} onChange={(e) => setLines(e.target.value)} inputMode="numeric" style={inputStyle} />
            </label>
          </div>
          {qM3Day > 0 && (
            <p style={{ ...hint, marginTop: 14, marginBottom: 0 }}>
              Расчётный расход {qM3Day.toLocaleString("ru-RU")} м³/сут
              {res ? ` = ${res.qM3H.toLocaleString("ru-RU")} м³/ч при ${num(hours) || 24} ч работы` : ""}.
            </p>
          )}
        </section>

        {/* ---------------- ПРОФИЛЬ ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>ПРОДОЛЬНЫЙ ПРОФИЛЬ ТРАССЫ</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <button style={profileMode === "table" ? primary : ghost} onClick={() => setProfileMode("table")}>
              Таблица отметок
            </button>
            <button style={profileMode === "simple" ? primary : ghost} onClick={() => setProfileMode("simple")}>
              Без профиля: перепад и длина
            </button>
          </div>

          {profileMode === "table" ? (
            <>
              <p style={{ ...hint, marginTop: 0 }}>
                Вставьте два столбца из Excel — пикет и отметку земли. Пикет понимается в любом
                написании: ПК12+50, 12+50, 1250, 1,25 км. Третий столбец, если есть, читается как
                отметка лотка трубы. Можно приложить CSV или KML из Google Earth.
              </p>
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                rows={9}
                placeholder={EXAMPLE}
                style={textarea}
              />
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept=".csv,.txt,.kml,.tsv"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  style={{ ...inputStyle, padding: 8, fontSize: 13 }}
                />
                <button style={ghost} onClick={() => setProfileText(EXAMPLE)}>
                  Подставить пример
                </button>
              </div>
              {fileNote && <p style={{ ...hint, marginBottom: 0 }}>{fileNote}</p>}
            </>
          ) : (
            <>
              <p style={{ ...hint, marginTop: 0 }}>
                Когда съёмки ещё нет: расход, перепад, длина по трубе и геометрическая длина. Число
                станций, напоры, давления и защита от гидроудара считаются полностью; места станций и
                вантузов по пикетам — только по настоящему профилю.
              </p>
              <div style={grid}>
                <label style={field}>
                  <span style={fieldLabel}>Геодезический перепад, м</span>
                  <input value={segLift} onChange={(e) => setSegLift(e.target.value)} inputMode="decimal" style={inputStyle} />
                  <span style={fieldHint}>разница отметок конца и начала</span>
                </label>
                <label style={field}>
                  <span style={fieldLabel}>Длина участка по трубе, м</span>
                  <input value={segLength} onChange={(e) => setSegLength(e.target.value)} inputMode="decimal" style={inputStyle} />
                  <span style={fieldHint}>по трассе, с уклонами — по ней считаются потери и фаза удара</span>
                </label>
                <label style={field}>
                  <span style={fieldLabel}>Геометрическая длина, м</span>
                  <input value={segPlan} onChange={(e) => setSegPlan(e.target.value)} inputMode="decimal" placeholder="горизонтальная проекция" style={inputStyle} />
                  <span style={fieldHint}>для проверки: труба не короче гипотенузы</span>
                </label>
                <label style={field}>
                  <span style={fieldLabel}>Отметка начала, м</span>
                  <input value={segStart} onChange={(e) => setSegStart(e.target.value)} inputMode="decimal" placeholder="0" style={inputStyle} />
                  <span style={fieldHint}>для атмосферного давления на высоте</span>
                </label>
                <label style={field}>
                  <span style={fieldLabel}>Характер рельефа</span>
                  <select value={terrain} onChange={(e) => setTerrain(e.target.value as typeof terrain)} style={inputStyle}>
                    <option value="flat">равнина</option>
                    <option value="hills">предгорье</option>
                    <option value="mountain">горы</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {parsed && (
            <div style={{ marginTop: 16 }}>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ТОЧЕК ПРОФИЛЯ</div>
                  <div style={bigValue}>{parsed.points.length}</div>
                </div>
                <div>
                  <div style={smallLabel}>ДЛИНА ТРАССЫ</div>
                  <div style={bigValue}>
                    {parsed.lengthM.toLocaleString("ru-RU")} <span style={unit}>м</span>
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>ПЕРЕПАД ОТМЕТОК</div>
                  <div style={bigValue}>
                    {parsed.points.length > 1
                      ? (parsed.points[parsed.points.length - 1].groundM - parsed.points[0].groundM).toFixed(2)
                      : "—"}{" "}
                    <span style={unit}>м</span>
                  </div>
                </div>
              </div>
              {parsed.problems.length > 0 && (
                <div style={{ ...warnBox, marginTop: 14, marginBottom: 0 }}>
                  {parsed.problems.map((p, i) => (
                    <div key={i} style={{ marginBottom: i === parsed.problems.length - 1 ? 0 : 8 }}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
            </label>
            <label style={field}>
              <span style={fieldLabel}>Внутреннее покрытие</span>
              <select value={lining} onChange={(e) => setLining(e.target.value as Lining)} style={inputStyle}>
                <option value="none">нет</option>
                <option value="cement">цементно-песчаное</option>
                <option value="epoxy">эпоксидное</option>
              </select>
              <span style={fieldHint}>покрытие снижает шероховатость и потери на четверть и больше</span>
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

        {/* ---------------- ЭКОНОМИКА ---------------- */}
        <section style={{ ...card, borderColor: hasEconomics ? "#2a5b68" : "#1c3742" }}>
          <div style={sectionTitle}>ЦЕНЫ — ИХ ЗАДАЁТЕ ВЫ</div>
          <p style={{ ...hint, marginTop: 0 }}>
            Диаметр водовода — это выбор между стоимостью трубы один раз и стоимостью электричества
            каждый год. Тариф и цену трубы программа знать не может: они разные у каждого объекта и
            меняются быстрее любого справочника. Пока поля пустые, сравнение диаметров показывает
            только технику. Впишите цифры — появятся столбцы стоимости и приведённых затрат, и
            станет видно, какой диаметр действительно дешевле.
          </p>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Тариф на электроэнергию, сум за кВт·ч</span>
              <input value={tariff} onChange={(e) => setTariff(e.target.value)} inputMode="decimal" placeholder="ваш тариф" style={inputStyle} />
              <span style={fieldHint}>для орошения бывает льготный — берите тот, по которому объект будет платить</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Цена трубы, сум за тонну</span>
              <input value={pipePrice} onChange={(e) => setPipePrice(e.target.value)} inputMode="decimal" placeholder="с доставкой" style={inputStyle} />
              <span style={fieldHint}>считается по массе металла; изоляция и монтаж сюда не входят</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Горизонт сравнения, лет</span>
              <input value={horizon} onChange={(e) => setHorizon(e.target.value)} inputMode="numeric" style={inputStyle} />
              <span style={fieldHint}>затраты складываются без дисконтирования — это верхняя оценка экономии</span>
            </label>
          </div>
        </section>

        {/* ---------------- ОГРАНИЧЕНИЯ ---------------- */}
        <section style={card}>
          <div style={sectionTitle}>УСЛОВИЯ РАСЧЁТА — МОЖНО МЕНЯТЬ</div>
          <p style={{ ...hint, marginTop: 0 }}>
            Значения по умолчанию — практика проектирования, а не норматив. Свой объект вы знаете
            лучше: меняйте.
          </p>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Уровень воды в источнике, м</span>
              <input value={sourceLevel} onChange={(e) => setSourceLevel(e.target.value)} inputMode="decimal" placeholder="отметка земли в начале" style={inputStyle} />
              <span style={fieldHint}>минимальный расчётный уровень: от него зависит кавитационный запас головной станции</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Свободный напор в конце, м</span>
              <input value={freeEnd} onChange={(e) => setFreeEnd(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Минимальный подпор на входе станции, м</span>
              <input value={minSuction} onChange={(e) => setMinSuction(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>рабочий запас, а не порог аварийной блокировки по сухому ходу</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Минимальный напор вдоль трассы, м</span>
              <input value={minLine} onChange={(e) => setMinLine(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>ниже этого линия напора подходит к трубе</span>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Наибольший напор одной ступени, м</span>
              <input value={maxStage} onChange={(e) => setMaxStage(e.target.value)} inputMode="decimal" style={inputStyle} />
              <span style={fieldHint}>именно он задаёт число станций: 250 м — это около 25 бар</span>
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
              <span style={fieldLabel}>Глубина заложения до верха трубы, м</span>
              <input value={bury} onChange={(e) => setBury(e.target.value)} inputMode="decimal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Наибольшее число станций</span>
              <input value={maxStations} onChange={(e) => setMaxStations(e.target.value)} inputMode="numeric" style={inputStyle} />
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

        <ProjectsPanel kind="main" getState={stateSnapshot} onLoad={applyState} objectName={objectName || undefined} />

        {error && <div style={warnBox}>{error}</div>}

        {!res && !error && (
          <section style={card}>
            <p style={{ ...hint, margin: 0 }}>
              Для расчёта нужны расход и трасса: либо таблица отметок, либо перепад и длина в блоке
              «Продольный профиль трассы» выше.
            </p>
          </section>
        )}

        {fileError && <div style={warnBox}>{fileError}</div>}

        {res && (
          <>
            {/* ---------------- ВЫГРУЗКА ---------------- */}
            <section style={{ ...card, borderColor: "#24444f", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ ...sectionTitle, margin: 0 }}>СКАЧАТЬ РАСЧЁТ</div>
              <input
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                placeholder="название объекта для шапки"
                style={{ ...inputStyle, maxWidth: 260 }}
              />
              <button style={busy ? ghost : primary} onClick={downloadWord}>
                {busy ? "Собирается…" : "Word (.docx)"}
              </button>
              <button style={ghost} onClick={downloadPdf}>
                PDF (печать)
              </button>
              <button style={busy ? ghost : primary} onClick={downloadXlsx}>
                Ведомость Excel (.xlsx)
              </button>
              <button style={busy ? ghost : primary} onClick={downloadDxf}>
                Профиль DXF (.zip)
              </button>
              <span style={{ ...fieldHint, flex: 1, minWidth: 240 }}>
                В отчёт входят исходные данные, гидравлика с формулами, таблица профиля с линией энергии,
                каскад станций, подбор стенки, гидроудар по ступеням, вантузы и выпуски, ведомость и
                перечень принятых величин.
              </span>
            </section>

            {/* ---------------- СВОДКА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ПРИНЯТОЕ РЕШЕНИЕ</div>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ТРУБА</div>
                  <div style={bigValue}>
                    {res.outerMm}×{res.wallMm} <span style={unit}>мм</span>
                  </div>
                  <div style={fieldHint}>внутренний {res.innerMm} мм</div>
                </div>
                <div>
                  <div style={smallLabel}>СКОРОСТЬ</div>
                  <div style={bigValue}>
                    {res.velocity} <span style={unit}>м/с</span>
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>НАСОСНЫХ СТАНЦИЙ</div>
                  <div style={bigValue}>{res.stations.length}</div>
                  <div style={fieldHint}>по {res.stageHeadM} м напора</div>
                </div>
                <div>
                  <div style={smallLabel}>КЛАСС ДАВЛЕНИЯ</div>
                  <div style={bigValue}>PN{res.pnBar}</div>
                  <div style={fieldHint}>рабочее до {res.maxWorkingBar} бар</div>
                </div>
                <div>
                  <div style={smallLabel}>МОЩНОСТЬ</div>
                  <div style={bigValue}>
                    {res.power.motorKW} <span style={unit}>кВт</span>
                  </div>
                  <div style={fieldHint}>{res.power.kWhPerM3} кВт·ч на м³</div>
                </div>
                <div>
                  <div style={smallLabel}>ПОТЕРИ НАПОРА</div>
                  <div style={bigValue}>
                    {res.totalLossM} <span style={unit}>м</span>
                  </div>
                  <div style={fieldHint}>{res.headloss.iMPerKm} м/км</div>
                </div>
              </div>
              <p style={{ ...hint, marginBottom: 0, marginTop: 18 }}>
                Уклон линии энергии тремя методами: Шевелёв {res.headloss.iShevelevMPerKm}, Альтшуль{" "}
                {res.headloss.iAltshulMPerKm}, Hazen–Williams {res.headloss.iHazenMPerKm} м/км. В
                расчёт принят {res.headloss.method}.
                {res.power.yearCost !== undefined && (
                  <>
                    {" "}
                    Годовое потребление {res.power.yearKWh.toLocaleString("ru-RU")} кВт·ч на сумму{" "}
                    {money(res.power.yearCost)} сум.
                  </>
                )}
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

            {/* ---------------- КАСКАД ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>НАСОСНЫЕ СТАНЦИИ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Станция</th>
                      <th style={th}>Пикет</th>
                      <th style={th}>Отметка, м</th>
                      <th style={th}>Подпор, м</th>
                      <th style={th}>Напор, м</th>
                      <th style={th}>На выходе, бар</th>
                      <th style={th}>Подача, м³/ч</th>
                      <th style={th}>На валу, кВт</th>
                      <th style={th}>Потребляемая, кВт</th>
                      <th style={th}>p атм, м</th>
                      <th style={th}>NPSHa, м</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.stations.map((s) => (
                      <tr key={s.name}>
                        <td style={tdLeft}>{s.name}</td>
                        <td style={td}>{s.piket}</td>
                        <td style={td}>{s.groundM}</td>
                        <td style={td}>{s.suctionHeadM}</td>
                        <td style={td}>{s.headM}</td>
                        <td style={td}>{s.outletBar}</td>
                        <td style={td}>{s.flowM3H}</td>
                        <td style={td}>{s.shaftKW}</td>
                        <td style={td}>{s.motorKW}</td>
                        <td style={td}>{s.atmosphericM}</td>
                        <td style={td}>{s.npshAvailableM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>
                Ступени одинаковые: один типоразмер насоса, взаимозаменяемые агрегаты, один комплект
                ЗИП и одна схема автоматики. Атмосферное давление взято по фактической отметке каждой
                станции — на высоте оно заметно ниже 10,33 м, и кавитационный запас надо проверять
                именно от него.
              </p>
            </section>

            {/* ---------------- СРАВНЕНИЕ ДИАМЕТРОВ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>СРАВНЕНИЕ ДИАМЕТРОВ</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Труба</th>
                      <th style={th}>D вн, мм</th>
                      <th style={th}>V, м/с</th>
                      <th style={th}>i, м/км</th>
                      <th style={th}>Потери, м</th>
                      <th style={th}>Станций</th>
                      <th style={th}>Мощность, кВт</th>
                      <th style={th}>Металл, т</th>
                      {hasEconomics && <th style={th}>Труба, сум</th>}
                      {hasEconomics && <th style={th}>Энергия за {num(horizon) || 25} лет</th>}
                      {hasEconomics && <th style={th}>Всего</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {res.options.map((o) => {
                      const best =
                        hasEconomics &&
                        o.ok &&
                        o.totalCost !== undefined &&
                        o.totalCost === Math.min(...res.options.filter((x) => x.ok && x.totalCost !== undefined).map((x) => x.totalCost as number));
                      return (
                        <tr key={o.outerMm} style={{ opacity: o.ok ? 1 : 0.45 }}>
                          <td style={{ ...tdLeft, color: best ? "#7fe0c0" : o.outerMm === res.outerMm ? "#5fb6c9" : undefined }}>
                            {o.outerMm}×{o.wallMm}
                            {o.outerMm === res.outerMm ? " — принят" : ""}
                            {best ? " — дешевле всего" : ""}
                          </td>
                          <td style={td}>{o.innerMm}</td>
                          <td style={td}>{o.velocity}</td>
                          <td style={td}>{o.gradientMPerKm}</td>
                          <td style={td}>{o.totalLossM}</td>
                          <td style={td}>{o.stations}</td>
                          <td style={td}>{o.motorKW}</td>
                          <td style={td}>{o.pipeTons}</td>
                          {hasEconomics && <td style={td}>{money(o.pipeCost)}</td>}
                          {hasEconomics && <td style={td}>{money(o.energyCost)}</td>}
                          {hasEconomics && <td style={td}>{money(o.totalCost)}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!hasEconomics && (
                <p style={{ ...hint, marginBottom: 0 }}>
                  Впишите тариф и цену трубы в разделе «Цены» — появятся столбцы стоимости и станет
                  видно, какой диаметр дешевле с учётом всего срока службы. Без них выбирать диаметр
                  по одной скорости нельзя: разница в потерях на длинной трассе стоит сотни киловатт
                  постоянной мощности.
                </p>
              )}
            </section>

            {/* ---------------- ГИДРОУДАР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ГИДРАВЛИЧЕСКИЙ УДАР</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Участок</th>
                      <th style={th}>Длина, м</th>
                      <th style={th}>Скорость волны, м/с</th>
                      <th style={th}>Фаза, с</th>
                      <th style={th}>По Жуковскому, м</th>
                      <th style={th}>Пик без защиты, бар</th>
                      <th style={th}>Запас над трубой, м</th>
                      <th style={th}>Разрыв, % длины</th>
                      <th style={th}>Худшая точка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.hammer.map((h, i) => (
                      <tr key={i}>
                        <td style={tdLeft}>
                          {h.from} — {h.to}
                        </td>
                        <td style={td}>{h.lengthM}</td>
                        <td style={td}>{h.waveSpeedMs}</td>
                        <td style={td}>{h.phaseS}</td>
                        <td style={td}>{h.joukowskyM}</td>
                        <td style={{ ...td, color: h.peakBar > res.pnBar ? "#ffcf8a" : undefined }}>{h.peakBar}</td>
                        <td style={{ ...td, color: h.minMarginM < 0 ? "#ffcf8a" : undefined }}>{h.minMarginM}</td>
                        <td style={{ ...td, color: h.separationSharePct > 0 ? "#ffcf8a" : undefined }}>{h.separationSharePct}</td>
                        <td style={td}>{h.worstAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...hint }}>
                Повышение по Жуковскому — верхняя оценка при мгновенной остановке. Главное здесь не
                она, а запас над трубой при волне разрежения: там, где он отрицательный, столб воды
                рвётся, и схлопывание полости даёт удар больше расчётного. Снижение пика защитой
                определяется только расчётом переходного процесса — коэффициентом его принимать
                нельзя.
              </p>
              <div style={sectionTitle}>ДЛЯ РАСЧЁТА ПЕРЕХОДНОГО ПРОЦЕССА НУЖНО</div>
              <ul style={notes}>
                {res.transientBrief.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            {/* ---------------- ЗАЩИТА ПО СТУПЕНЯМ ---------------- */}
            {stageProtection.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>ЗАЩИТНАЯ АРМАТУРА ПО КАЖДОЙ СТУПЕНИ</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{ ...th, textAlign: "left" }}>Участок</th>
                        <th style={th}>L, м</th>
                        <th style={th}>ΔZ, м</th>
                        <th style={th}>Напор, м</th>
                        <th style={th}>Пик без защиты, бар</th>
                        <th style={{ ...th, textAlign: "left" }}>Удар приходит в</th>
                        <th style={th}>Торможение, с</th>
                        <th style={{ ...th, textAlign: "left" }}>Клапан</th>
                        <th style={th}>Kv</th>
                        <th style={th}>Открытие ≤, с</th>
                        <th style={th}>Сброс, м³</th>
                        <th style={th}>Дренаж</th>
                        <th style={th}>Бак, м³</th>
                        <th style={th}>Вантузы</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageProtection.map((x) => (
                        <tr key={x.name}>
                          <td style={tdLeft}>
                            {x.name} — {x.to}
                          </td>
                          <td style={td}>{x.lengthM}</td>
                          <td style={td}>{x.liftM}</td>
                          <td style={td}>{x.seg.requiredHeadM}</td>
                          <td style={{ ...td, color: x.seg.peakBar > res.pnBar ? "#ffcf8a" : undefined }}>{x.seg.peakBar}</td>
                          <td style={{ ...td, textAlign: "left" }}>
                            {x.name}, отм. {x.elev} м
                          </td>
                          <td style={td}>
                            {x.seg.stopTimeS || "—"}
                            {x.seg.direct ? " прямой" : ""}
                          </td>
                          <td style={{ ...td, textAlign: "left" }}>
                            {x.seg.protection.valveCount}×DN{x.seg.protection.valveDnMm} PN{x.seg.protection.valvePnBar}
                          </td>
                          <td style={td}>{x.seg.protection.requiredKv}</td>
                          <td style={td}>{x.seg.protection.openTimeS}</td>
                          <td style={td}>{x.seg.protection.dischargeVolumeM3}</td>
                          <td style={td}>DN{x.seg.protection.drainDnMm}</td>
                          <td style={td}>{x.seg.protection.vesselTotalM3}</td>
                          <td style={td}>
                            {x.seg.protection.airValveCount}×DN{x.seg.protection.airValveDnMm}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ ...hint }}>
                  Пик — без защиты, то есть то, чего защита обязана не допустить. Клапан подобран по
                  обратному потоку, равному рабочему расходу; дренаж — по скорости не выше 5 м/с;
                  гидропневмобак — энергетическим методом. Всё это предварительный подбор типоразмера;
                  окончательные уставки даёт расчёт переходного процесса.
                </p>
                {worstStage && (
                  <>
                    <div style={sectionTitle}>МАТЕРИАЛ ТРУБОПРОВОДА — ПО САМОМУ ТЯЖЁЛОМУ УЧАСТКУ ({worstStage.name} — {worstStage.to})</div>
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
                          {worstStage.seg.materials.map((m) => (
                            <tr key={m.kind} style={{ opacity: m.suitable ? 1 : 0.5 }}>
                              <td style={{ ...tdLeft, color: m.note === "принят в расчёт" ? "#5fb6c9" : undefined }}>{m.label}</td>
                              <td style={td}>{m.waveSpeedMs}</td>
                              <td style={td}>{m.surgeM}</td>
                              <td style={td}>{m.peakBar}</td>
                              <td style={{ ...td, textAlign: "left", whiteSpace: "normal", color: "#8ca4ad" }}>
                                {m.suitable ? m.note || "проходит по классу давления" : m.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* ---------------- ВАНТУЗЫ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>ВАНТУЗЫ, ВЫПУСКИ И СТЕНКА</div>
              <div style={bigRow}>
                <div>
                  <div style={smallLabel}>ВАНТУЗОВ</div>
                  <div style={bigValue}>{res.airValves.length}</div>
                  <div style={fieldHint}>расчётный диаметр {res.airValves[0]?.dnMm ?? "—"} мм</div>
                </div>
                <div>
                  <div style={smallLabel}>ВЫПУСКОВ</div>
                  <div style={bigValue}>{res.drains.length}</div>
                  <div style={fieldHint}>в низших точках профиля</div>
                </div>
                <div>
                  <div style={smallLabel}>СТЕНКА ПО ДАВЛЕНИЮ</div>
                  <div style={bigValue}>
                    {res.wall.byPressureMm} <span style={unit}>мм</span>
                  </div>
                  <div style={fieldHint}>по испытательному {res.wall.byTestMm} мм</div>
                </div>
                <div>
                  <div style={smallLabel}>КОЛЬЦЕВОЕ НАПРЯЖЕНИЕ</div>
                  <div style={bigValue}>
                    {res.wall.hoopStressMPa} <span style={unit}>МПа</span>
                  </div>
                </div>
                <div>
                  <div style={smallLabel}>СМЯТИЕ ПРИ ВАКУУМЕ</div>
                  <div style={bigValue}>
                    {res.wall.bucklingBar} <span style={unit}>бар</span>
                  </div>
                  <div style={fieldHint}>{res.wall.vacuumOk ? "с запасом выше атмосферного" : "ниже атмосферного — проверить"}</div>
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 18 }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Пикет</th>
                      <th style={th}>Отметка, м</th>
                      <th style={{ ...th, textAlign: "left" }}>Основание</th>
                      <th style={th}>Диаметр, мм</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.airValves.map((v, i) => (
                      <tr key={i}>
                        <td style={tdLeft}>{v.piket}</td>
                        <td style={td}>{v.groundM}</td>
                        <td style={tdLeft}>{v.kind}</td>
                        <td style={td}>{v.dnMm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- УЗЛЫ ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>УЗЛОВАЯ ТАБЛИЦА</div>
              <p style={{ ...hint, marginTop: 0 }}>
                Единственный источник чисел в расчёте: из неё берутся давления, расстановка станций,
                вантузы и продольный профиль. {res.nodes.length} точек.
              </p>
              <button style={ghost} onClick={() => setShowNodes((v) => !v)}>
                {showNodes ? "Свернуть" : "Показать все точки"}
              </button>
              <div style={{ overflowX: "auto", marginTop: 14, maxHeight: showNodes ? 520 : 320, overflowY: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>Пикет</th>
                      <th style={th}>Земля, м</th>
                      <th style={th}>Ось трубы, м</th>
                      <th style={th}>Линия энергии, м</th>
                      <th style={th}>Пьезометр, м</th>
                      <th style={th}>Статический, м</th>
                      <th style={th}>Давление, бар</th>
                      <th style={th}>Ступень</th>
                      <th style={{ ...th, textAlign: "left" }}>Отметка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showNodes ? res.nodes : res.nodes.filter((n, i) => n.station || n.peak || i % 5 === 0)).map((n, i) => (
                      <tr key={i} style={{ background: n.station ? "#0c2530" : undefined }}>
                        <td style={tdLeft}>{n.piket}</td>
                        <td style={td}>{n.groundM}</td>
                        <td style={td}>{n.axisM}</td>
                        <td style={td}>{n.eglM}</td>
                        <td style={td}>{n.hglM}</td>
                        <td style={td}>{n.staticM}</td>
                        <td style={{ ...td, color: n.pressureBar > res.pnBar ? "#ffcf8a" : undefined }}>{n.pressureBar}</td>
                        <td style={td}>{n.stage}</td>
                        <td style={tdLeft}>
                          {n.station ?? ""}
                          {n.peak ? " вершина" : ""}
                          {n.valley ? " низшая точка" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- ВЕДОМОСТЬ ---------------- */}
            {spec && spec.rows.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>ВЕДОМОСТЬ МАТЕРИАЛОВ И ОБОРУДОВАНИЯ</div>
                <p style={{ ...hint, marginTop: 0 }}>
                  Ничего не вводится руками: труба — по профилю, агрегаты — по каскаду, вантузы и выпуски — по
                  найденным точкам, противоударная арматура — по расчёту ступеней. Упоров, опор и колодцев на
                  поворотах здесь нет: план трассы в расчёт не вводится, а считать их «по среднему» значит выдать
                  число, которое нечем подтвердить.
                </p>
                <div style={grid}>
                  <label style={field}>
                    <span style={fieldLabel}>Монтажный запас к длине труб, %</span>
                    <input value={reservePct} onChange={(e) => setReservePct(e.target.value)} inputMode="decimal" style={inputStyle} />
                  </label>
                  <label style={field}>
                    <span style={fieldLabel}>Шаг секционирующих задвижек, м</span>
                    <input value={sectionSpacing} onChange={(e) => setSectionSpacing(e.target.value)} inputMode="decimal" style={inputStyle} />
                  </label>
                </div>
                <div style={{ overflowX: "auto", marginTop: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ ...th, textAlign: "left" }}>№</th>
                        <th style={{ ...th, textAlign: "left" }}>Наименование</th>
                        <th style={{ ...th, textAlign: "left" }}>Тип, марка</th>
                        <th style={th}>Ед.</th>
                        <th style={th}>Кол-во</th>
                        <th style={{ ...th, textAlign: "left" }}>Примечание</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spec.rows.map((r) => (
                        <tr key={r.no}>
                          <td style={{ ...td, textAlign: "left" }}>{r.no}</td>
                          <td style={{ ...td, textAlign: "left", whiteSpace: "normal" }}>{r.name}</td>
                          <td style={{ ...td, textAlign: "left", whiteSpace: "normal" }}>{r.type}</td>
                          <td style={td}>{r.unit}</td>
                          <td style={{ ...td, fontWeight: 700 }}>{r.qty}</td>
                          <td style={{ ...td, textAlign: "left", whiteSpace: "normal", color: "#8ca4ad", fontSize: 12 }}>{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 18 }}>
                  <div style={{ ...smallLabel, marginBottom: 10 }}>ФОРМУЛЫ ВЕДОМОСТИ</div>
                  <ul style={notes}>
                    {spec.formulas.map((x, i) => (
                      <li key={i} style={{ marginBottom: 8 }}>
                        <b>{x.label}:</b> {x.formula} = <b>{x.result}</b>
                        {x.source ? <span style={{ color: "#5c7280" }}> — {x.source}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
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
const textarea: CSSProperties = { width: "100%", background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: 12, fontSize: 14, fontFamily: "Consolas, monospace", marginBottom: 12 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const primary: CSSProperties = { background: "#0f5f73", border: 0, color: "#eaf7fa", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #1c3742", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid #102831", whiteSpace: "nowrap", color: "#e7eef1" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 130 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "#8ca4ad", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 16, color: "#ffcf8a", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
