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
import { useLanguage } from "../../../LanguageContext";
import type { Lang } from "../../../../calculations/i18n";
import { calculateSegment, type SegmentResult } from "../../../../calculations/surge-protection";
import { STEEL_PIPES, WATER_PIPE, type Lining, type WaterPipeKind } from "../../../../calculations/water-main";
import { buildSegmentReportHtml } from "../../../../calculations/main-report";
import { useBrand } from "../../BrandHeader";
import ProjectsPanel from "../ProjectsPanel";
import RequireAuth from "../../RequireAuth";

/* ------------------------------------------------------------------
 * ПОДПИСИ СТРАНИЦЫ
 *
 * Обе формулировки лежат рядом: правишь русскую — видишь узбекскую и
 * не забываешь её поправить. Язык берётся общий, тот же, что и на
 * остальных страницах: выбрал на главной — действует и здесь.
 *
 * Числа, единицы и обозначения (DN, PN, м³/ч) не переводятся:
 * обозначения величин одинаковы в обоих языках, а самодельный
 * перевод единиц в проектном документе читается как ошибка.
 * ------------------------------------------------------------------ */
const TX = {
  ru: {
    eyebrow: "ВОДОВОД",
    title: "Гидравлический расчёт",
    lead: "Расход, перепад, длина — и получаете напор, трубу, обратный гидроудар и защитную арматуру.",
    flow: "Расход",
    perHour: "м³/ч",
    perDay: "м³/сут",
    geoLift: "Геодезический перепад, м",
    pipeLength: "Длина участка по трубе, м",
    planLength: "Геометрическая длина, м",
    planHint: "проекция, для проверки",
    startElev: "Отметка насосной станции, м",
    startHint: "начало участка",
    airValve: "Вантуз, DN",
    drain: "Сбросный трубопровод, DN",
    autoHint: "пусто — подобрать",
    moreOpen: "Дополнительно: труба и условия",
    moreClose: "Скрыть дополнительно",
    material: "Материал",
    lining: "Внутреннее покрытие",
    liningNone: "нет",
    liningCement: "цементно-песчаное",
    liningEpoxy: "эпоксидное",
    outer: "Наружный диаметр, мм",
    pickAuto: "подобрать",
    wall: "Толщина стенки, мм",
    byCalc: "по расчёту",
    pn: "Класс давления PN",
    freeHead: "Свободный напор в конце, м",
    valveCount: "Противоударных клапанов, шт.",
    download: "СКАЧАТЬ РАСЧЁТ",
    objectName: "название объекта для шапки",
    busy: "Собирается…",
    word: "Word (.docx)",
    pdf: "PDF (печать)",
    downloadHint:
      "Напор, подбор трубы и стенки, гидроудар с формулами, противоударная арматура, сравнение материалов и перечень принятых величин.",
    s1: "1. ТРЕБУЕМЫЙ НАПОР",
    headBar: "бар на выходе насоса",
    power: "потребляемая мощность",
    velocity: "скорость в трубе",
    headSum: (dz: number, fr: number, loc: number, free: number) =>
      `Перепад ${dz} + потери ${fr} + местные ${loc} + свободный напор ${free} м.`,
    s2: "2. ТРУБА И МАТЕРИАЛ",
    inner: "внутренний",
    pnNote: "класс давления трубы",
    thMaterial: "Материал",
    thPeak: "Удар, бар",
    notFit: "не проходит по давлению",
    s3: "3. ОБРАТНЫЙ ГИДРОУДАР",
    peakNote: "пик без защиты",
    waveSpeed: "скорость волны",
    phase: "фаза удара 2L/c",
    separation: "разрыв потока — защита обязательна",
    minHead: "минимум при разрежении",
    peakAtRow: "Удар приходит в точку",
    peakAtNote: "Здесь ставится противоударный клапан.",
    vacuumRow: "Разрежение",
    vacuumNote: "Здесь нужны вантузы.",
    s4: "4. ЗАЩИТНАЯ АРМАТУРА",
    surgeValve: "Противоударный клапан",
    pcs: "шт.",
    kvNote: (kv: number, t: number) => `Kv не менее ${kv} м³/ч, открытие не более ${t} с`,
    drainRow: "Сбросный трубопровод",
    needDn: (dn: number) => ` → нужен DN${dn}`,
    drainNote: (v: number, vol: number, rec: number) =>
      `скорость ${v} м/с; сброс ${vol} м³ за отключение, приёмная ёмкость от ${rec} м³`,
    vessel: "Гидропневмобак",
    vesselNote: "против разрыва потока при остановке",
    airValves: "Вантузы двойного действия",
    airValvesNote: "в верхних точках и через каждые 700 м",
    checkValve: "Обратный клапан у насоса",
    checkValveVal: "с демпфированием",
    checkValveNote: "захлопка примет удар целиком",
    warnings: "НА ЧТО ОБРАТИТЬ ВНИМАНИЕ",
    showAssumptions: "Что принято в расчёте",
    hideAssumptions: "Скрыть допущения",
    footerQ: "Есть продольный профиль трассы с отметками по пикетам?",
    footerLink: "Расширенный расчёт с расстановкой станций",
    errCalc: "Расчёт не выполнен.",
    errDoc: "Документ не собрался.",
    errServer: "Сервер не ответил.",
    errPopup: "Браузер заблокировал новое окно. Разрешите всплывающие окна для этого сайта.",
  },
  uz: {
    eyebrow: "SUV QUVURI",
    title: "Gidravlik hisob",
    lead: "Sarf, balandlik farqi, uzunlik — va siz bosim, quvur, teskari gidravlik zarba hamda himoya armaturasini olasiz.",
    flow: "Sarf",
    perHour: "m³/soat",
    perDay: "m³/kun",
    geoLift: "Geodezik balandlik farqi, m",
    pipeLength: "Quvur bo‘yicha uchastka uzunligi, m",
    planLength: "Geometrik uzunlik, m",
    planHint: "proyeksiya, tekshirish uchun",
    startElev: "Nasos stansiyasining belgisi, m",
    startHint: "uchastka boshi",
    airValve: "Vantuz (havo klapani), DN",
    drain: "Chiqarish (drenaj) quvuri, DN",
    autoHint: "bo‘sh — tanlansin",
    moreOpen: "Qo‘shimcha: quvur va shartlar",
    moreClose: "Qo‘shimchani yopish",
    material: "Material",
    lining: "Ichki qoplama",
    liningNone: "yo‘q",
    liningCement: "sement-qumli",
    liningEpoxy: "epoksidli",
    outer: "Tashqi diametr, mm",
    pickAuto: "tanlansin",
    wall: "Devor qalinligi, mm",
    byCalc: "hisob bo‘yicha",
    pn: "Bosim klassi PN",
    freeHead: "Oxirida erkin bosim, m",
    valveCount: "Zarbaga qarshi klapanlar, dona",
    download: "HISOBNI YUKLAB OLISH",
    objectName: "sarlavha uchun obyekt nomi",
    busy: "Tayyorlanmoqda…",
    word: "Word (.docx)",
    pdf: "PDF (chop etish)",
    downloadHint:
      "Bosim, quvur va devor qalinligini tanlash, formulalar bilan gidravlik zarba, zarbaga qarshi armatura, materiallarni taqqoslash va qabul qilingan kattaliklar ro‘yxati.",
    s1: "1. TALAB QILINADIGAN BOSIM",
    headBar: "nasos chiqishida, bar",
    power: "iste’mol quvvati",
    velocity: "quvurdagi tezlik",
    headSum: (dz: number, fr: number, loc: number, free: number) =>
      `Balandlik farqi ${dz} + yo‘l yo‘qotishlari ${fr} + mahalliy ${loc} + erkin bosim ${free} m.`,
    s2: "2. QUVUR VA MATERIAL",
    inner: "ichki",
    pnNote: "quvurning bosim klassi",
    thMaterial: "Material",
    thPeak: "Zarba, bar",
    notFit: "bosim bo‘yicha o‘tmaydi",
    s3: "3. TESKARI GIDRAVLIK ZARBA",
    peakNote: "himoyasiz cho‘qqi",
    waveSpeed: "to‘lqin tezligi",
    phase: "zarba fazasi 2L/c",
    separation: "oqim uzilishi — himoya majburiy",
    minHead: "siyraklanishdagi eng kichik qiymat",
    peakAtRow: "Zarba keladigan nuqta",
    peakAtNote: "Shu yerga zarbaga qarshi klapan o‘rnatiladi.",
    vacuumRow: "Siyraklanish",
    vacuumNote: "Shu yerda vantuzlar kerak.",
    s4: "4. HIMOYA ARMATURASI",
    surgeValve: "Zarbaga qarshi klapan",
    pcs: "dona",
    kvNote: (kv: number, t: number) => `Kv kamida ${kv} m³/soat, ochilishi ${t} s dan ortiq emas`,
    drainRow: "Chiqarish (drenaj) quvuri",
    needDn: (dn: number) => ` → DN${dn} kerak`,
    drainNote: (v: number, vol: number, rec: number) =>
      `tezlik ${v} m/s; bir o‘chishda ${vol} m³ chiqarish, qabul qiluvchi sig‘im ${rec} m³ dan`,
    vessel: "Gidropnevmobak",
    vesselNote: "to‘xtaganda oqim uzilishiga qarshi",
    airValves: "Ikki tomonlama vantuzlar",
    airValvesNote: "yuqori nuqtalarda va har 700 m da",
    checkValve: "Nasos oldidagi teskari klapan",
    checkValveVal: "dempferlangan",
    checkValveNote: "oddiy qopqoq zarbani to‘liq oladi",
    warnings: "E’TIBOR BERISH KERAK",
    showAssumptions: "Hisobda nima qabul qilingan",
    hideAssumptions: "Qabul qilinganlarni yopish",
    footerQ: "Trassaning piketlar bo‘yicha belgilari ko‘rsatilgan bo‘ylama profili bormi?",
    footerLink: "Stansiyalarni joylashtirish bilan kengaytirilgan hisob",
    errCalc: "Hisob bajarilmadi.",
    errDoc: "Hujjat yig‘ilmadi.",
    errServer: "Server javob bermadi.",
    errPopup: "Brauzer yangi oynani bloklab qo‘ydi. Ushbu sayt uchun qalqib chiquvchi oynalarga ruxsat bering.",
  },
};

/**
 * Имя файла берётся из ответа сервера, а не пишется здесь: сервер
 * знает, под чьим брендом выдан документ, а страница — нет. Раньше имя
 * было вписано в код, и проектировщик по купленному доступу скачивал
 * файл с нашим именем в названии.
 */
function fileNameFrom(r: Response, fallback: string): string {
  const cd = r.headers.get("content-disposition") ?? "";
  const m = cd.match(/filename="([^"]+)"/);
  return m ? m[1] : fallback;
}

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

  /* Язык — общий для всего сайта, не свой у страницы. */
  const { language } = useLanguage();
  const lang: Lang = language === "uz" ? "uz" : "ru";
  const tx = TX[lang];

  /* --- отчёт --- */
  const [objectName, setObjectName] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState("");

  const brand = useBrand();

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
          lang,
        }),
        error: "",
      };
    } catch (e) {
      return { res: null, error: e instanceof Error ? e.message : TX[lang].errCalc };
    }
  }, [qM3H, geoLift, pipeLength, planLength, startElev, airValveDn, drainDn, material, lining, outer, wall, freeHead, valveCount, pn, lang]);

  const walls = STEEL_PIPES.find((p) => p.outerMm === num(outer))?.walls ?? [];
  const best = res?.materials.find((m) => m.suitable && m.accepted) ?? res?.materials.find((m) => m.suitable);
  const p = res?.protection;


  /* ------------------------------------------------------------------
     СОХРАНЕНИЕ РАСЧЁТА — сохраняется ввод, результат считается заново
     ------------------------------------------------------------------ */
  const stateSnapshot = (): Record<string, unknown> => ({
    flow,
    geoLift,
    pipeLength,
    planLength,
    startElev,
    airValveDn,
    drainDn,
    outer,
    wall,
    freeHead,
    valveCount,
    pn,
    objectName,
    flowUnit,
    material,
    lining,
  });

  const applyState = (d: Record<string, unknown>) => {
    const str = (k: string, set: (v: string) => void) => {
      const v = d[k];
      if (typeof v === "string") set(v);
      else if (typeof v === "number") set(String(v));
    };
    str("flow", setFlow);
    str("geoLift", setGeoLift);
    str("pipeLength", setPipeLength);
    str("planLength", setPlanLength);
    str("startElev", setStartElev);
    str("airValveDn", setAirValveDn);
    str("drainDn", setDrainDn);
    str("outer", setOuter);
    str("wall", setWall);
    str("freeHead", setFreeHead);
    str("valveCount", setValveCount);
    str("pn", setPn);
    str("objectName", setObjectName);
    if (d.flowUnit === "h" || d.flowUnit === "day") setFlowUnit(d.flowUnit);
    if (typeof d.material === "string" && d.material in WATER_PIPE) setMaterial(d.material as WaterPipeKind);
    if (d.lining === "none" || d.lining === "cement" || d.lining === "epoxy") setLining(d.lining);
    setFileError("");
  };

  /* ------------------------------------------------------------------
     ВЫГРУЗКА

     Word собирается на сервере и пересчитывается там же: присылать
     серверу готовые числа нельзя, иначе документ перестаёт быть
     расчётом. PDF печатает браузер из той же вёрстки.
     ------------------------------------------------------------------ */
  async function downloadWord() {
    if (!res) return;
    setBusy(true);
    setFileError("");
    try {
      const r = await fetch("/api/main-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          object: objectName || undefined,
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
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        setFileError(j?.error || tx.errDoc);
        return;
      }
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = fileNameFrom(r, "raschet_uchastka_vodovoda.docx");
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setFileError(tx.errServer);
    } finally {
      setBusy(false);
    }
  }

  function downloadPdf() {
    if (!res) return;
    setFileError("");
    const html = buildSegmentReportHtml({
      brand: brand ? { title: brand.title, subtitle: brand.subtitle, logoUrl: brand.logo_url } : undefined,
      object: objectName || undefined,
      material,
      lining,
      qM3H,
      geoLiftM: num(geoLift),
      pipeLengthM: num(pipeLength),
      startElevM: startElev ? num(startElev) : undefined,
      seg: res,
    });
    const w = window.open("", "_blank");
    if (!w) {
      setFileError(tx.errPopup);
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>{tx.eyebrow}</div>
        <h1 style={title}>{tx.title}</h1>
        <p style={lead}>{tx.lead}</p>

        {/* ---------------- ЧЕТЫРЕ ЧИСЛА ---------------- */}
        <section style={card}>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>{tx.flow}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={flow} onChange={(e) => setFlow(e.target.value)} inputMode="decimal" placeholder="1500" style={{ ...inputStyle, flex: 1 }} />
                <select value={flowUnit} onChange={(e) => setFlowUnit(e.target.value as "h" | "day")} style={{ ...inputStyle, width: 110 }}>
                  <option value="h">{tx.perHour}</option>
                  <option value="day">{tx.perDay}</option>
                </select>
              </div>
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.geoLift}</span>
              <input value={geoLift} onChange={(e) => setGeoLift(e.target.value)} inputMode="decimal" placeholder="175" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.pipeLength}</span>
              <input value={pipeLength} onChange={(e) => setPipeLength(e.target.value)} inputMode="decimal" placeholder="2000" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.planLength}</span>
              <input value={planLength} onChange={(e) => setPlanLength(e.target.value)} inputMode="decimal" placeholder={tx.planHint} style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.startElev}</span>
              <input value={startElev} onChange={(e) => setStartElev(e.target.value)} inputMode="decimal" placeholder={tx.startHint} style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.airValve}</span>
              <input value={airValveDn} onChange={(e) => setAirValveDn(e.target.value)} inputMode="numeric" placeholder={tx.autoHint} style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>{tx.drain}</span>
              <input value={drainDn} onChange={(e) => setDrainDn(e.target.value)} inputMode="numeric" placeholder={tx.autoHint} style={inputStyle} />
            </label>
          </div>

          <button style={{ ...ghost, marginTop: 18 }} onClick={() => setMore((v) => !v)}>
            {more ? tx.moreClose : tx.moreOpen}
          </button>

          {more && (
            <div style={{ ...grid, marginTop: 16 }}>
              <label style={field}>
                <span style={fieldLabel}>{tx.material}</span>
                <select value={material} onChange={(e) => setMaterial(e.target.value as WaterPipeKind)} style={inputStyle}>
                  {(Object.keys(WATER_PIPE) as WaterPipeKind[]).map((k) => (
                    <option key={k} value={k}>
                      {WATER_PIPE[k].label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.lining}</span>
                <select value={lining} onChange={(e) => setLining(e.target.value as Lining)} style={inputStyle}>
                  <option value="none">{tx.liningNone}</option>
                  <option value="cement">{tx.liningCement}</option>
                  <option value="epoxy">{tx.liningEpoxy}</option>
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.outer}</span>
                <select value={outer} onChange={(e) => { setOuter(e.target.value); setWall(""); }} style={inputStyle}>
                  <option value="">{tx.pickAuto}</option>
                  {STEEL_PIPES.map((x) => (
                    <option key={x.outerMm} value={x.outerMm}>
                      {x.outerMm}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.wall}</span>
                <select value={wall} onChange={(e) => setWall(e.target.value)} style={inputStyle} disabled={!walls.length}>
                  <option value="">{tx.byCalc}</option>
                  {walls.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.pn}</span>
                <select value={pn} onChange={(e) => setPn(e.target.value)} style={inputStyle}>
                  <option value="">{tx.pickAuto}</option>
                  {[10, 16, 25, 32, 40, 63].map((x) => (
                    <option key={x} value={x}>
                      PN{x}
                    </option>
                  ))}
                </select>
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.freeHead}</span>
                <input value={freeHead} onChange={(e) => setFreeHead(e.target.value)} inputMode="decimal" style={inputStyle} />
              </label>
              <label style={field}>
                <span style={fieldLabel}>{tx.valveCount}</span>
                <input value={valveCount} onChange={(e) => setValveCount(e.target.value)} inputMode="numeric" style={inputStyle} />
              </label>
            </div>
          )}
        </section>

        <ProjectsPanel kind="segment" getState={stateSnapshot} onLoad={applyState} objectName={objectName || undefined} />

        {error && <div style={warnBox}>{error}</div>}
        {fileError && <div style={warnBox}>{fileError}</div>}

        {res && (
          <section style={{ ...card, borderColor: "var(--sv-card-line)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ ...sectionTitle, margin: 0 }}>{tx.download}</div>
            <input
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder={tx.objectName}
              style={{ ...inputStyle, maxWidth: 260 }}
            />
            <button style={busy ? ghost : primary} onClick={downloadWord}>
              {busy ? tx.busy : tx.word}
            </button>
            <button style={ghost} onClick={downloadPdf}>
              {tx.pdf}
            </button>
            <span style={{ ...fieldHint, flex: 1, minWidth: 240 }}>{tx.downloadHint}</span>
          </section>
        )}

        {res && p && (
          <>
            {/* ---------------- 1. НАПОР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>{tx.s1}</div>
              <div style={bigRow}>
                <div>
                  <div style={bigValue}>
                    {res.requiredHeadM} <span style={unit}>{lang === "uz" ? "m" : "м"}</span>
                  </div>
                  <div style={fieldHint}>{res.requiredHeadBar} {tx.headBar}</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.motorKW} <span style={unit}>{lang === "uz" ? "kVt" : "кВт"}</span>
                  </div>
                  <div style={fieldHint}>{tx.power}</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.velocity} <span style={unit}>{lang === "uz" ? "m/s" : "м/с"}</span>
                  </div>
                  <div style={fieldHint}>{tx.velocity}</div>
                </div>
              </div>
              <p style={{ ...hint, marginBottom: 0 }}>{tx.headSum(num(geoLift), res.frictionM, res.localM, num(freeHead))}</p>
            </section>

            {/* ---------------- 2. ТРУБА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>{tx.s2}</div>
              <div style={bigRow}>
                <div>
                  <div style={bigValue}>
                    {res.outerMm}×{res.wallMm}
                  </div>
                  <div style={fieldHint}>{best?.label ?? WATER_PIPE[material].label}, {tx.inner} {res.innerMm} {lang === "uz" ? "mm" : "мм"}</div>
                </div>
                <div>
                  <div style={bigValue}>PN{res.pnBar}</div>
                  <div style={fieldHint}>{tx.pnNote}</div>
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: "left" }}>{tx.thMaterial}</th>
                      <th style={th}>{tx.thPeak}</th>
                      <th style={{ ...th, textAlign: "left" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.materials.map((m) => (
                      <tr key={m.kind} style={{ opacity: m.suitable ? 1 : 0.45 }}>
                        <td style={{ ...tdLeft, color: m.accepted ? "var(--sv-accent)" : undefined }}>{m.label}</td>
                        <td style={td}>{m.peakBar}</td>
                        <td style={tdNote}>{m.suitable ? m.note : tx.notFit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- 3. ГИДРОУДАР ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>{tx.s3}</div>
              <div style={bigRow}>
                <div>
                  <div style={{ ...bigValue, color: res.peakBar > res.pnBar ? "var(--sv-warn-ink)" : "var(--sv-ink2)" }}>
                    {res.peakBar} <span style={unit}>bar</span>
                  </div>
                  <div style={fieldHint}>{tx.peakNote}, +{res.surgeM} {lang === "uz" ? "m" : "м"}</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.waveSpeedMs} <span style={unit}>{lang === "uz" ? "m/s" : "м/с"}</span>
                  </div>
                  <div style={fieldHint}>{tx.waveSpeed}</div>
                </div>
                <div>
                  <div style={bigValue}>
                    {res.phaseS} <span style={unit}>{lang === "uz" ? "s" : "с"}</span>
                  </div>
                  <div style={fieldHint}>{tx.phase}</div>
                </div>
                <div>
                  <div style={{ ...bigValue, color: res.separation ? "var(--sv-warn-ink)" : "var(--sv-ink2)" }}>
                    {res.minHeadM} <span style={unit}>{lang === "uz" ? "m" : "м"}</span>
                  </div>
                  <div style={fieldHint}>{res.separation ? tx.separation : tx.minHead}</div>
                </div>
              </div>
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={tdLeft}>{tx.peakAtRow}</td>
                      <td style={tdNote}>{res.peakAt}. {tx.peakAtNote}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>{tx.vacuumRow}</td>
                      <td style={tdNote}>{res.vacuumAt}. {tx.vacuumNote}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------- 4. ЗАЩИТА ---------------- */}
            <section style={card}>
              <div style={sectionTitle}>{tx.s4}</div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={tdLeft}>{tx.surgeValve}</td>
                      <td style={tdVal}>
                        {p.valveCount} {tx.pcs} DN{p.valveDnMm} PN{p.valvePnBar}
                      </td>
                      <td style={tdNote}>{tx.kvNote(p.requiredKv, p.openTimeS)}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>{tx.drainRow}</td>
                      <td style={{ ...tdVal, color: p.drainDnMm < p.drainDnRequiredMm ? "var(--sv-warn-ink)" : undefined }}>
                        DN{p.drainDnMm}
                        {p.drainDnMm !== p.drainDnRequiredMm ? tx.needDn(p.drainDnRequiredMm) : ""}
                      </td>
                      <td style={tdNote}>{tx.drainNote(p.drainVelocity, p.dischargeVolumeM3, p.receiverM3)}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>{tx.vessel}</td>
                      <td style={tdVal}>{p.vesselTotalM3} m³</td>
                      <td style={tdNote}>{tx.vesselNote}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>{tx.airValves}</td>
                      <td style={{ ...tdVal, color: p.airValveDnMm < p.airValveDnRequiredMm ? "var(--sv-warn-ink)" : undefined }}>
                        {p.airValveCount} {tx.pcs} DN{p.airValveDnMm}
                        {p.airValveDnMm < p.airValveDnRequiredMm ? tx.needDn(p.airValveDnRequiredMm) : ""}
                      </td>
                      <td style={tdNote}>{tx.airValvesNote}</td>
                    </tr>
                    <tr>
                      <td style={tdLeft}>{tx.checkValve}</td>
                      <td style={tdVal}>{tx.checkValveVal}</td>
                      <td style={tdNote}>{tx.checkValveNote}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {res.warnings.length > 0 && (
              <section style={card}>
                <div style={sectionTitle}>{tx.warnings}</div>
                {res.warnings.map((w, i) => (
                  <div key={i} style={{ ...warnBox, marginBottom: i === res.warnings.length - 1 ? 0 : 12 }}>
                    {w}
                  </div>
                ))}
              </section>
            )}

            <section style={card}>
              <button style={ghost} onClick={() => setShowAssumptions((v) => !v)}>
                {showAssumptions ? tx.hideAssumptions : tx.showAssumptions}
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
          {tx.footerQ}{" "}
          <a href="/engineering/analysis/pipeline" style={link}>
            {tx.footerLink}
          </a>
          .
        </p>
      </div>
    </main>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "var(--sv-bg)", color: "var(--sv-ink)", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1000px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "var(--sv-accent)", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 760, marginTop: 20, marginBottom: 32, color: "var(--sv-muted)", fontSize: 17, lineHeight: 1.7 };
const link: CSSProperties = { color: "var(--sv-accent)" };
const card: CSSProperties = { background: "var(--sv-card)", border: "1px solid var(--sv-line)", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "var(--sv-faint2)", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "var(--sv-muted)", fontSize: 12 };
const fieldHint: CSSProperties = { color: "var(--sv-faint)", fontSize: 11, lineHeight: 1.4 };
const inputStyle: CSSProperties = { background: "var(--sv-bg)", border: "1px solid var(--sv-line)", borderRadius: 8, color: "var(--sv-ink)", padding: "10px 12px", fontSize: 15, outline: "none" };
const hint: CSSProperties = { color: "var(--sv-muted)", fontSize: 12.5, lineHeight: 1.7 };
const bigRow: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 };
const bigValue: CSSProperties = { color: "var(--sv-ink2)", fontSize: 30, fontWeight: 700 };
const unit: CSSProperties = { fontSize: 15, color: "var(--sv-muted)", fontWeight: 400 };
const ghost: CSSProperties = { background: "transparent", border: "1px solid var(--sv-accent-line)", color: "var(--sv-accent)", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const primary: CSSProperties = { background: "var(--sv-primary)", border: 0, color: "var(--sv-primary-ink)", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13.5 };
const th: CSSProperties = { color: "var(--sv-th)", fontSize: 12, fontWeight: 700, textAlign: "right", padding: "9px 10px", borderBottom: "1px solid var(--sv-line)", whiteSpace: "nowrap" };
const td: CSSProperties = { textAlign: "right", padding: "9px 10px", borderBottom: "1px solid var(--sv-line-soft)", whiteSpace: "nowrap", color: "var(--sv-ink2)" };
const tdLeft: CSSProperties = { ...td, textAlign: "left", minWidth: 150, whiteSpace: "normal", color: "var(--sv-muted)" };
const tdVal: CSSProperties = { ...td, textAlign: "left", color: "var(--sv-ink2)", fontWeight: 700, minWidth: 140 };
const tdNote: CSSProperties = { ...td, textAlign: "left", color: "var(--sv-muted)", whiteSpace: "normal", fontSize: 12.5, lineHeight: 1.5 };
const notes: CSSProperties = { margin: 0, paddingLeft: 18, color: "var(--sv-muted)", fontSize: 13, lineHeight: 1.65 };
const warnBox: CSSProperties = { background: "var(--sv-warn-bg)", border: "1px solid var(--sv-warn-line)", borderRadius: 10, padding: 16, color: "var(--sv-warn-ink)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 };
