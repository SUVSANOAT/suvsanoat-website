"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { MODELS, type Model } from "../../../products/data";
import {
  INDUSTRY_GROUPS,
  POLLUTANT_LABELS,
  STAGE_INFO,
  findIndustry,
  type PollutantKey,
  type StageKey,
} from "../industry/industries";
import { chainForDischarge, findDischarge } from "../industry/targets";
import { UI, t } from "../industry/i18n";
import { useLanguage } from "../../../LanguageContext";
import { SCALE_LABEL, commonEquipment, equipmentFor, scaleOf, type Ctx, type Item } from "../industry/equipment";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../../../lib/assumptions";
import {
  areaEstimate,
  civilItems,
  civilWorks,
  pipeSizing,
  powerEstimate,
} from "../industry/construction";
import { downloadDxf, printDxf } from "./dxf";
import { buildModelsDxf, buildSchemeDxf, type SchemeInput } from "./pro-drawings";
import { buildTemplateNote, type NoteInput } from "./note-template";
import NoteView from "./NoteView";

/* ==================================================================
 * ПРОИЗВОДСТВЕННЫЙ РАСЧЁТ: ЦЕПОЧКА ОЧИСТКИ И ПОДБОР ОБОРУДОВАНИЯ
 *
 * Все числа считаются здесь, детерминированно, по методикам
 * КМК 2.04.03-97 и DWA-A 131. Страница печатается в PDF кнопкой
 * браузера (print-стили ниже). DXF и ИИ-записка — отдельные кнопки.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const KEY_ORDER: PollutantKey[] = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf"];

/* целевые показатели берутся из точки сброса (industry/targets.ts);
   значения из ТУ/НДС, введённые проектировщиком, имеют приоритет */

type Pick = {
  count: number;
  model: Model;
  note?: string;
};

/** подбор модели линейки по требуемому значению поля */
function pickModel(line: string, field: keyof Model, need: number): Pick | null {
  const list = MODELS
    .filter((m) => m.line === line && typeof m[field] === "number")
    .sort((a, b) => (a[field] as number) - (b[field] as number));
  if (!list.length || need <= 0) return null;

  const fit = list.find((m) => (m[field] as number) >= need);
  if (fit) return { count: 1, model: fit };

  const top = list[list.length - 1];
  const count = Math.ceil(need / (top[field] as number));
  return { count, model: top, note: `${count} параллельных линии` };
}

function fmt(value: number, digits = 0): string {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: digits });
}

type StageCalc = {
  key: StageKey;
  sizing: string[];
  picks: Pick[];
  extra?: string;
  items: Item[];
};

const SUPPLY_LABEL: Record<Item["supply"], { text: string; color: string }> = {
  own: { text: "производим", color: "#9ccc65" },
  either: { text: "производим или поставка", color: "#ffd54f" },
  supply: { text: "поставка", color: "#8fa6b1" },
};

const KIND_LABEL: Record<Item["kind"], string> = {
  structure: "сооружение",
  machine: "оборудование",
  instrument: "КИП и автоматика",
};

function ItemTable({ items }: { items: Item[] }) {
  if (!items.length) return null;
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead>
          <tr>
            {["Позиция", "Расчётный параметр", "Кол-во", "Исполнение"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>
                <b>{it.name}</b>
                <div style={{ color: FAINT, fontSize: 11 }}>{KIND_LABEL[it.kind]}</div>
                {it.note && <div style={{ color: FAINT, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{it.note}</div>}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", lineHeight: 1.5 }}>
                {it.spec}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                {it.qty}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: SUPPLY_LABEL[it.supply].color, whiteSpace: "nowrap" }}>
                {SUPPLY_LABEL[it.supply].text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useAssumptions(): Assumptions {
  const [a, setA] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  useEffect(() => {
    let alive = true;
    fetch("/api/assumptions")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok && d.values) setA({ ...DEFAULT_ASSUMPTIONS, ...d.values });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return a;
}

function ProResultContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();
  const a = useAssumptions();

  const industry = findIndustry(sp.get("industry") || "");
  const lab = sp.get("lab") === "1";
  const object = sp.get("object") || "";
  const Q = parseFloat(sp.get("flow") || "0") || 0;
  const hours = Math.min(24, Math.max(1, parseFloat(sp.get("hours") || "16") || 16));
  const ph = parseFloat(sp.get("ph") || "7") || 7;

  const discharge = findDischarge(sp.get("out") || "sewer");
  const TARGET: Partial<Record<PollutantKey, number>> = { ...(discharge?.targets ?? {}) };
  const customTu = sp.get("tu") === "1";
  if (customTu) {
    for (const key of KEY_ORDER) {
      const raw = sp.get(`t_${key}`);
      if (raw !== null && raw !== "") {
        const v = parseFloat(raw.replace(",", "."));
        if (!Number.isNaN(v)) TARGET[key] = v;
      }
    }
  }

  const c: Partial<Record<PollutantKey, number>> = {};
  for (const key of KEY_ORDER) {
    const raw = sp.get(key);
    if (raw !== null && raw !== "") c[key] = parseFloat(raw.replace(",", ".")) || 0;
  }

  const calc = useMemo(() => {
    if (!industry || !Q) return null;

    const Qh = Q / hours;                       // м³/ч в рабочее время
    const Qls = (Qh * 1000) / 3600;             // л/с
    const bod = c.bod ?? 0;
    const cod = c.cod ?? 0;
    const ss = c.ss ?? 0;
    const fats = c.fats ?? 0;
    const petro = c.petro ?? 0;
    const tn = c.tn ?? 0;

    const bodLoad = (Q * bod) / 1000;           // кг БПК/сут
    const stages: StageCalc[] = [];

    /* величины, нужные библиотеке оборудования */
    const vAvg = (Q * (hours >= 20 ? a.avgHoursLong : a.avgHoursShort)) / 24;
    const vBio = bodLoad / a.bodVolLoad;
    const airH = (bodLoad * a.airPerBod) / 24;
    const dryKg = (Q * ss * a.sludgeFromSs) / 1000 + bodLoad * a.sludgeFromBod;
    const scale = scaleOf(Q, a);

    const ctx: Ctx = {
      Q, Qh, Qls, hours, scale,
      industryId: industry.id,
      dischargeId: discharge?.id ?? "sewer",
      bod, cod, ss, fats, petro, tn, bodLoad,
      vAvg, vBio, air: airH, dryKg, a,
    };

    const chain = chainForDischarge(industry.chain, discharge, industry.id);

    for (const key of chain) {
      const s: StageCalc = { key, sizing: [], picks: [], items: [] };

      switch (key) {
        case "screen": {
          s.sizing.push(`Расчётный расход ${fmt(Qh, 1)} м³/ч (${fmt(Qls, 1)} л/с); прозор решётки 1–6 мм по составу отбросов.`);
          break;
        }
        case "avg": {
          const V = vAvg;
          s.sizing.push(`Объём усреднения ≈ ${fmt(V)} м³ (${hours >= 20 ? a.avgHoursLong : a.avgHoursShort} часов среднего притока).`);
          const p = pickModel("tanks", "vol", V);
          if (p) s.picks.push(p);
          s.extra = "Перемешивание — эрлифт/мешалка против осаждения; для pH-нестабильных стоков здесь же коррекция.";
          break;
        }
        case "grease": {
          if (fats < a.greaseTarget) s.sizing.push(`Жиры ниже ${a.greaseTarget} мг/л — отдельный жироуловитель не обязателен, контроль на усреднителе.`);
          else {
            s.sizing.push(`Расход ${fmt(Qh, 1)} м³/ч; жиры ${fmt(fats)} → цель ≤${a.greaseTarget} мг/л перед биологией.`);
            const p = pickModel("grease-traps", "q", Qh);
            if (p) s.picks.push(p);
          }
          break;
        }
        case "sand": {
          s.sizing.push(`Расход ${fmt(Qls, 1)} л/с; задержание частиц от ${a.sandSize} мм.`);
          const p = pickModel("sand-traps", "ns", Qls);
          if (p) s.picks.push(p);
          break;
        }
        case "oil": {
          s.sizing.push(`Расход ${fmt(Qls, 1)} л/с; нефтепродукты ${fmt(petro)} → 0,3 мг/л с фильтром доочистки.`);
          const p = pickModel("oil-separators", "ns", Qls);
          if (p) s.picks.push(p);
          break;
        }
        case "neutral": {
          const acid = ph > 8.5;
          const alk = ph < 6.5;
          s.sizing.push(
            acid
              ? `pH ${ph.toFixed(1)} — дозирование кислоты до 6,5–8,5.`
              : alk
              ? `pH ${ph.toFixed(1)} — дозирование щёлочи до 6,5–8,5.`
              : `pH ${ph.toFixed(1)} в норме — станция дозирования в резерве на залповые сбросы.`
          );
          const p = pickModel("dosing", "vol", Math.max(100, Q * 2)); // ориентир: 2 л реагента на м³
          if (p) s.picks.push(p);
          break;
        }
        case "physchem": {
          const doseCoag = a.coagDose;
          s.sizing.push(`Реагентная обработка: коагулянт ~${doseCoag} г/м³ (${fmt((Q * doseCoag) / 1000, 1)} кг/сут), флокулянт ${a.flocDose} г/м³. Дозы уточняются пробным коагулированием.`);
          const reactor = pickModel("tanks", "vol", Math.max(1, Qh * 0.75));
          if (reactor) s.picks.push({ ...reactor, note: "реактор смешения-хлопьеобразования" });
          const dos = pickModel("dosing", "vol", Math.max(100, (Q * doseCoag) / 100));
          if (dos) s.picks.push(dos);
          break;
        }
        case "daf": {
          const area = Qh / a.dafLoad;
          s.sizing.push(`Напорная флотация: гидравлическая нагрузка ${a.dafLoad} м³/м²·ч → площадь ≈ ${fmt(area, 1)} м²; рециркуляция ${a.dafRecycle} %.`);
          break;
        }
        case "bio": {
          const vLoad = a.bodVolLoad;
          const V = bodLoad / vLoad;
          const air = bodLoad * a.airPerBod;
          const qEq = bod > 0 ? (Q * bod) / a.domesticBod : Q;
          s.sizing.push(
            `Нагрузка ${fmt(bodLoad, 1)} кг БПК₅/сут; объёмная нагрузка ${vLoad} кг/м³·сут → объём биоблока ≈ ${fmt(V)} м³.`,
            `Воздух на аэрацию ≈ ${fmt(air)} м³/сут (${fmt(air / 24, 1)} м³/ч).`,
            tn > a.denitroTn ? `Азот ${fmt(tn)} мг/л — схема с нитри-денитрификацией (аноксидная зона ~${a.denitroShare} % объёма).` : `Азот умеренный — классическая аэрация.`
          );
          const p = pickModel("bio-plants", "qd", qEq);
          if (p) s.picks.push({ ...p, note: `эквивалент ${fmt(qEq)} м³/сут по хозбытовому стоку` });
          break;
        }
        case "clarify": {
          s.sizing.push("Вторичное отстаивание в составе блока биологической очистки (тонкослойные модули).");
          break;
        }
        case "post": {
          s.sizing.push(`Фильтр доочистки на ${fmt(Qh, 1)} м³/ч при скорости ${a.filterRate} м/ч — до нормативов сброса/оборота.`);
          break;
        }
        case "disinfect": {
          const dose = industry.id === "hospital" ? a.chlorDoseHospital : a.chlorDose;
          const gph = (Q * dose) / hours;
          s.sizing.push(`Доза активного хлора ${dose} г/м³ → ${fmt(gph, 1)} г/ч в рабочем режиме.`);
          const p = pickModel("chlorinators", "cl", gph);
          if (p) s.picks.push(p);
          break;
        }
        case "sludge": {
          const dry = dryKg;
          const vol = dry / (10 * a.sludgeDs);
          s.sizing.push(`Осадок ≈ ${fmt(dry, 1)} кг сухого вещества/сут (~${fmt(vol, 1)} м³/сут при ${a.sludgeDs} % СВ) — уплотнение и обезвоживание.`);
          const p = pickModel("tanks", "vol", Math.max(1, vol * a.sludgeStoreDays));
          if (p) s.picks.push({ ...p, note: `илоуплотнитель на ${a.sludgeStoreDays} сут` });
          break;
        }
      }
      s.items = equipmentFor(key, ctx);
      stages.push(s);
    }

    const common = commonEquipment(ctx);

    /* ---------- строительная часть ---------- */
    const chainHas = (k: StageKey) => chain.includes(k);
    const volumes: { name: string; volume: number }[] = [];
    if (chainHas("avg")) volumes.push({ name: "Усреднитель", volume: vAvg });
    if (chainHas("bio")) volumes.push({ name: "Биологический блок (аэротенк)", volume: vBio });
    if (chainHas("clarify")) volumes.push({ name: "Вторичный отстойник", volume: Math.max(4, (Qh / a.clarifyLoad) * 3) });
    if (chainHas("daf")) volumes.push({ name: "Флотатор с камерой флокуляции", volume: Math.max(3, (Qh / a.dafLoad) * 2.5) });
    if (chainHas("physchem")) volumes.push({ name: "Камеры смешения и хлопьеобразования", volume: Math.max(2, Qh * 0.4) });
    if (chainHas("disinfect")) volumes.push({ name: "Контактный резервуар", volume: Math.max(2, (Qh * a.contactTime) / 60) });
    if (chainHas("sludge")) volumes.push({ name: "Илоуплотнитель и стабилизатор", volume: Math.max(4, (dryKg / (10 * a.sludgeDs)) * a.sludgeStoreDays) });
    volumes.push({ name: "Приёмная камера и аварийная ёмкость", volume: Math.max(Q / 24, Qh) * a.reserveEmergency });

    const civil = civilWorks(volumes, a, scale);

    /* ---------- площадь ---------- */
    const equipmentArea = Math.max(40, (airH / 1000) * 12 + (dryKg / 100) * 8 + 30);
    const area = areaEstimate(civil.areaStructures, equipmentArea, (dryKg * 30) / (10 * a.cakeDs), a);

    /* ---------- трубопроводы ---------- */
    const pipes = pipeSizing({ Qh, air: airH, sludgeM3d: dryKg / (10 * a.sludgeDs), scale }, a, area.site);

    /* ---------- электрика ---------- */
    const power = powerEstimate(
      {
        Q, Qh, hours, air: airH, vAvg, vBio, dryKg, bodLoad, scale,
        stages: chain as string[],
        builtArea: area.built,
        buildingArea: area.buildings,
      },
      a
    );

    return {
      Qh, Qls, bodLoad, stages, scale, common,
      civil, area, pipes, power,
      civilList: civilItems(civil, a),
    };
  }, [industry, Q, hours, ph, c, discharge, a]);

  function schemeInput(): SchemeInput | null {
    if (!industry || !calc) return null;
    return { industry, object, lab, Q, hours, Qh: calc.Qh, ph, conc: c, target: TARGET, stages: calc.stages, lang: language };
  }

  const [note, setNote] = useState<{ text: string; source: "ai" | "template"; reason?: string } | null>(null);
  const [noteBusy, setNoteBusy] = useState(false);

  function modelParams(m: Model): string {
    const parts: string[] = [];
    if (m.diameter) parts.push(`⌀${m.diameter}×${m.length} мм`);
    else parts.push(`${m.length}×${m.width ?? "—"}×${m.height ?? "—"} мм`);
    if (m.vol) parts.push(`${m.vol} ${m.line === "dosing" ? "л" : "м³"}`);
    else if (m.volumeGross) parts.push(`V ${m.volumeGross} м³`);
    if (m.q) parts.push(`${m.q} м³/ч`);
    if (m.ns) parts.push(`NS ${m.ns} л/с`);
    if (m.qd) parts.push(`${m.qd} м³/сут`);
    if (m.cl) parts.push(`${m.cl} г/ч Cl`);
    parts.push(`DN${m.dn}`);
    return parts.join(", ");
  }

  function noteInput(): NoteInput | null {
    if (!industry || !calc) return null;
    return {
      industry: t(industry.name, language),
      group: t(INDUSTRY_GROUPS.find((g) => g.id === industry.group)?.name, language) || industry.group,
      object,
      lab,
      Q,
      hours,
      Qh: calc.Qh,
      Qls: calc.Qls,
      ph,
      conc: KEY_ORDER.filter((k) => c[k] !== undefined).map((k) => ({
        label: POLLUTANT_LABELS[k].label,
        value: c[k]!,
        unit: POLLUTANT_LABELS[k].unit,
        target: TARGET[k],
      })),
      special: industry.special ?? [],
      stages: calc.stages.map((st, i) => ({
        index: i + 1,
        key: st.key,
        title: t(STAGE_INFO[st.key].title, language),
        what: t(STAGE_INFO[st.key].what, language),
        makes: STAGE_INFO[st.key].makes,
        sizing: st.sizing,
        extra: st.extra,
        picks: st.picks.map((p) => ({ count: p.count, code: p.model.code, line: p.model.line, note: p.note, params: modelParams(p.model) })),
        items: st.items.map((it) => ({ name: it.name, spec: it.spec, qty: it.qty, supply: it.supply, note: it.note })),
      })),
      common: calc.common.map((it) => ({ name: it.name, spec: it.spec, qty: it.qty, supply: it.supply, note: it.note })),
      scale: SCALE_LABEL[calc.scale],
      civil: {
        basins: calc.civil.basins.map((b) => ({ name: b.name, volume: b.volume, L: b.L, B: b.B, H: b.Hfull })),
        concrete: calc.civil.concrete,
        rebarT: calc.civil.rebar / 1000,
        formwork: calc.civil.formwork,
        excavation: calc.civil.excavation,
        backfill: calc.civil.backfill,
        note: calc.civil.note,
      },
      pipes: calc.pipes.map((x) => ({ name: x.name, flow: x.flow, dn: x.dn, velocity: x.velocity, length: x.length, material: x.material })),
      area: {
        structures: calc.area.structures,
        buildings: calc.area.buildings,
        built: calc.area.built,
        site: calc.area.site,
        note: calc.area.note,
      },
      power: {
        installed: calc.power.installed,
        demand: calc.power.demand,
        daily: calc.power.daily,
        yearly: calc.power.yearly,
        specific: calc.power.specific,
        specificBod: calc.power.specificBod,
        items: calc.power.items.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, installed: i.installed, hours: i.hours, daily: i.daily, basis: i.basis })),
        note: calc.power.note,
      },
      notes: industry.notes,
      sources: industry.sources,
    };
  }

  async function makeNote() {
    const input = noteInput();
    if (!input || noteBusy) return;
    setNoteBusy(true);
    try {
      const res = await fetch("/api/engineering-note", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 401) {
        router.push(`/engineering/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const data = await res.json();
      if (data?.ok && typeof data.text === "string") setNote({ text: data.text, source: data.source, reason: data.reason });
      else setNote({ text: buildTemplateNote(input), source: "template", reason: "server error" });
    } catch {
      setNote({ text: buildTemplateNote(input), source: "template", reason: "network" });
    } finally {
      setNoteBusy(false);
      setTimeout(() => document.getElementById("techNote")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  function downloadNote() {
    if (!note || !industry) return;
    const blob = new Blob(["\ufeff" + note.text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SUVSANOAT_zapiska_${industry.id}_${Math.round(Q)}m3.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function dxfScheme() {
    const input = schemeInput();
    if (!input) return;
    downloadDxf(buildSchemeDxf(input), `SUVSANOAT_shema_${input.industry.id}_${Math.round(Q)}m3.dxf`);
  }

  function dxfModels() {
    const input = schemeInput();
    if (!input) return;
    downloadDxf(buildModelsDxf(input), `SUVSANOAT_gabarity_${input.industry.id}_${Math.round(Q)}m3.dxf`);
  }

  function printScheme() {
    const input = schemeInput();
    if (!input) return;
    printDxf(buildSchemeDxf(input), `${t(UI.chainTitle, language)} — ${input.industry}`);
  }

  function printModels() {
    const input = schemeInput();
    if (!input) return;
    printDxf(buildModelsDxf(input), `${t(UI.btnDxfModels, language)} — ${input.industry}`);
  }

  if (!industry || !calc) {
    return (
      <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: 60 }}>
        <p>Недостаточно данных. <a href="/engineering/analysis" style={{ color: ACCENT }}>Начать заново</a></p>
      </main>
    );
  }

  return (
    <main className="proResult" style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "60px 24px 110px" }}>
      <style>{`
        @media print {
          .proResult { background: #fff !important; color: #111 !important; padding: 10mm !important; }
          .proResult * { color: #111 !important; border-color: #999 !important; background: transparent !important; }
          .noPrint { display: none !important; }
          .stageCard { break-inside: avoid; }
          #techNote { break-inside: auto; }
          #techNote h3 { break-after: avoid; }
          #techNote table, #techNote th, #techNote td { border-color: #999 !important; }
          a { text-decoration: none; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
        <button type="button" onClick={() => router.back()} className="noPrint"
          style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer", marginBottom: 26 }}>
          ← Назад к исходным данным
        </button>

        <div style={{ fontSize: 13, letterSpacing: "0.14em", color: ACCENT, marginBottom: 10 }}>
          ПРЕДВАРИТЕЛЬНОЕ ИНЖЕНЕРНОЕ РЕШЕНИЕ
        </div>
        <h1 style={{ fontSize: 30, margin: "0 0 6px" }}>{t(industry.name, language)}</h1>
        <p style={{ color: FAINT, margin: "0 0 4px" }}>
          {object && <>Объект: {object} · </>}
          Расход {fmt(Q)} м³/сут · режим {hours} ч/сут · {fmt(calc.Qh, 1)} м³/ч
        </p>
        <p style={{ color: "#cfdde3", fontSize: 13, margin: "0 0 8px" }}>
          Исполнение по расходу: <b>{SCALE_LABEL[calc.scale]}</b>.
        </p>
        {discharge && (
          <p style={{ color: "#cfdde3", fontSize: 13, margin: "0 0 8px" }}>
            Сброс: <b>{t(discharge.name, language)}</b>. Целевые показатели — {customTu ? "по вашим техническим условиям / НДС" : discharge.source}.
          </p>
        )}
        <p style={{ color: lab ? "#9ccc65" : "#ffb74d", fontSize: 13, margin: "0 0 26px" }}>
          {lab
            ? "Исходные концентрации — по лабораторному анализу заказчика."
            : `Исходные концентрации — справочные (${industry.sources.join("; ")}). Расчёт предварительный, уточняется анализом усреднённой пробы.`}
        </p>

        {/* ИСХОДНЫЕ ДАННЫЕ */}
        <div style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 12 }}>ИСХОДНЫЙ СОСТАВ И ЦЕЛЬ ОЧИСТКИ</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {KEY_ORDER.filter((key) => c[key] !== undefined).map((key) => (
              <div key={key} style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{POLLUTANT_LABELS[key].label}</div>
                <b>{fmt(c[key]!)}</b> → {TARGET[key] ?? "—"} {POLLUTANT_LABELS[key].unit}
              </div>
            ))}
            <div style={{ fontSize: 13 }}>
              <div style={{ color: FAINT, fontSize: 11 }}>pH</div>
              <b>{ph.toFixed(1)}</b> → 6,5–8,5
            </div>
          </div>
          {discharge && !customTu && (
            <p style={{ fontSize: 12, color: FAINT, margin: "14px 0 0", lineHeight: 1.6 }}>{discharge.note}</p>
          )}
        </div>

        {/* ОСОБЫЕ ЗАГРЯЗНИТЕЛИ */}
        {industry.special && (
          <div style={{ border: "1px solid rgba(255,183,77,0.4)", background: "rgba(255,183,77,0.06)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 10 }}>ОСОБЫЕ ЗАГРЯЗНИТЕЛИ — ОТДЕЛЬНЫЕ РЕШЕНИЯ</div>
            {industry.special.map((spec) => (
              <p key={spec.label} style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 8px" }}>
                <b>{spec.label}</b> ({spec.range[0]}–{spec.range[1]} {spec.unit}): {spec.note}
              </p>
            ))}
          </div>
        )}

        {/* ЦЕПОЧКА */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, margin: "0 0 14px" }}>
          ПУТЬ ВОДЫ — {calc.stages.length} СТУПЕНЕЙ
        </div>

        {calc.stages.map((stage, index) => {
          const info = STAGE_INFO[stage.key];
          return (
            <div key={stage.key} className="stageCard"
              style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>{String(index + 1).padStart(2, "0")}</span>
                <b style={{ fontSize: 16 }}>{t(info.title, language)}</b>
                <span style={{ fontSize: 11, color: FAINT }}>
                  {stage.items.length} позиц. оборудования
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.55 }}>{t(info.what, language)}</p>
              {stage.sizing.map((line, i) => (
                <p key={i} style={{ fontSize: 13, margin: "0 0 4px", lineHeight: 1.55 }}>— {line}</p>
              ))}
              {stage.extra && <p style={{ fontSize: 12, color: FAINT, margin: "6px 0 0" }}>{stage.extra}</p>}
              <ItemTable items={stage.items} />

              {stage.picks.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: FAINT }}>Наше готовое изделие под эту позицию:</span>
                  {stage.picks.map((pick, i) => (
                    <a key={i} href={`/products/${pick.model.slug}`}
                      style={{ border: `1px solid ${ACCENT}`, borderRadius: 8, padding: "8px 14px", color: "#eaf6fa", textDecoration: "none", fontSize: 13 }}>
                      {pick.count > 1 ? `${pick.count} × ` : ""}<b>{pick.model.code}</b>
                      {pick.note ? <span style={{ color: FAINT }}> · {pick.note}</span> : null}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ОБЩЕСТАНЦИОННОЕ ОБОРУДОВАНИЕ */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", margin: "18px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
            <b style={{ fontSize: 16 }}>Общестанционные узлы</b>
            <span style={{ fontSize: 11, color: FAINT }}>{calc.common.length} позиц.</span>
          </div>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: 0, lineHeight: 1.55 }}>
            Не относятся к отдельной ступени, но входят в состав станции и часто выпадают из предварительных расчётов.
          </p>
          <ItemTable items={calc.common} />
        </div>

        {/* ================= СТРОИТЕЛЬНАЯ ЧАСТЬ ================= */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, margin: "30px 0 12px" }}>
          СТРОИТЕЛЬНАЯ ЧАСТЬ, ПЛОЩАДЬ И ЭЛЕКТРИКА
        </div>

        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>Габариты ёмкостей и объёмы работ</b>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: "8px 0 10px", lineHeight: 1.55 }}>
            Размеры получены от расчётного объёма при рабочей глубине {a.basinDepth} м и соотношении сторон {a.basinRatio} : 1;
            борт {a.basinFreeboard} м. Объёмы бетона — по толщинам стен {a.wallThickness} мм, днища {a.slabThickness} мм
            {a.coverThickness > 0 ? `, перекрытия ${a.coverThickness} мм` : " (сооружения открытые)"}.
          </p>

          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Сооружение", "Объём, м³", "Размеры в свету, м", "Бетон, м³", "Котлован, м³"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.civil.basins.map((b, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{b.name}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{fmt(b.volume)}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                      {b.L} × {b.B} × {b.Hfull}
                    </td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{fmt(b.concrete, 1)}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{fmt(b.excavation)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: "8px", fontWeight: 700 }}>Итого</td>
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.basins.reduce((s2, b) => s2 + b.volume, 0))}</td>
                  <td style={{ padding: "8px" }} />
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.concrete, 1)}</td>
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.excavation)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ItemTable items={calc.civilList} />
          <p style={{ fontSize: 12, color: FAINT, margin: "10px 0 0", lineHeight: 1.6 }}>{calc.civil.note}</p>
        </div>

        {/* ================= ТРУБОПРОВОДЫ ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>Трубопроводы</b>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: "8px 0 10px", lineHeight: 1.55 }}>
            Диаметры подобраны по расходу и расчётной скорости: самотёчные {a.velGravity} м/с, напорные {a.velPressure} м/с,
            воздуховоды {a.velAir} м/с. Длины — ориентировочные, по габаритам площадки; точные даёт генплан.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Трубопровод", "Расход, м³/ч", "DN", "Скорость, м/с", "Длина ≈, м", "Объём, м³", "Материал"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.pipes.map((p2, i) => (
                  <tr key={i}>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>
                      <b>{p2.name}</b>
                      {p2.note && <div style={{ color: FAINT, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{p2.note}</div>}
                    </td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{fmt(p2.flow, 1)}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", fontWeight: 700 }}>{p2.dn}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{p2.velocity}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{p2.length}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{fmt(p2.volume, 2)}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{p2.material}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= ПЛОЩАДЬ ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>Площадь под станцию</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, margin: "12px 0" }}>
            {[
              ["Сооружения с проходами", calc.area.structures, "м²"],
              ["Здания и помещения", calc.area.buildings, "м²"],
              ["Площадка осадка", calc.area.sludgeYard, "м²"],
              ["Площадь застройки", calc.area.built, "м²"],
              ["Участок с подъездами", calc.area.site, "м²"],
              ["То же", calc.area.site / 10000, "га"],
            ].map(([label, value, unit], i) => (
              <div key={i} style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{label as string}</div>
                <b style={{ fontSize: 17 }}>{fmt(value as number, unit === "га" ? 2 : 0)}</b> {unit as string}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: FAINT, margin: 0, lineHeight: 1.6 }}>{calc.area.note}</p>
        </div>

        {/* ================= ЭЛЕКТРИКА ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>Электрическая часть</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, margin: "12px 0" }}>
            {[
              ["Установленная мощность", fmt(calc.power.installed, 1), "кВт"],
              ["Расчётная мощность", fmt(calc.power.demand, 1), "кВт"],
              ["Потребление", fmt(calc.power.daily), "кВт·ч/сут"],
              ["За год", fmt(calc.power.yearly / 1000), "тыс. кВт·ч"],
              ["Удельно на сток", fmt(calc.power.specific, 2), "кВт·ч/м³"],
              ["Удельно на БПК", fmt(calc.power.specificBod, 2), "кВт·ч/кг"],
            ].map(([label, value, unit], i) => (
              <div key={i} style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{label}</div>
                <b style={{ fontSize: 17 }}>{value}</b> {unit}
              </div>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Потребитель", "Кол-во × кВт", "Установл., кВт", "ч/сут", "кВт·ч/сут", "Основание"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.power.items.map((it, i) => (
                  <tr key={i}>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.name}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{it.qty} × {it.unit}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.installed}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.hours}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.daily}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>{it.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: FAINT, margin: "10px 0 0", lineHeight: 1.6 }}>{calc.power.note}</p>
        </div>

        {/* ОСОБЕННОСТИ ОТРАСЛИ */}
        <div style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, margin: "24px 0" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 10 }}>ЧТО ВАЖНО ЗНАТЬ ПРО ЭТУ ОТРАСЛЬ</div>
          {industry.notes.map((note, i) => (
            <p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>• {note}</p>
          ))}
          <p style={{ fontSize: 11, color: FAINT, margin: 0 }}>Источники: {industry.sources.join("; ")}. Методики расчёта: КМК 2.04.03-97, DWA-A 131, EN 1825, EN 858.</p>
        </div>

        {/* ТЕХНИЧЕСКАЯ ЗАПИСКА */}
        {note && (
          <div id="techNote" className="stageCard"
            style={{ border: `1px solid ${note.source === "ai" ? "#9ccc65" : LINE}`, background: PANEL, borderRadius: 12, padding: "22px 24px", margin: "0 0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.1em", color: note.source === "ai" ? "#9ccc65" : ACCENT }}>
                ТЕХНИЧЕСКАЯ ЗАПИСКА · {note.source === "ai" ? "СОСТАВЛЕНА ИИ ПО РАСЧЁТУ SUVSANOAT" : "ШАБЛОН ПО РАСЧЁТУ SUVSANOAT"}
              </div>
              <div className="noPrint" style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={downloadNote}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "transparent", color: "#eaf6fa", fontSize: 12, cursor: "pointer" }}>
                  Скачать .md
                </button>
                <button type="button" onClick={() => window.print()}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "transparent", color: "#eaf6fa", fontSize: 12, cursor: "pointer" }}>
                  PDF (расчёт + записка)
                </button>
              </div>
            </div>
            {note.source === "template" && (
              <p className="noPrint" style={{ fontSize: 12, color: "#ffb74d", margin: "0 0 12px" }}>
                ИИ сейчас недоступен{note.reason ? ` (${note.reason})` : ""} — записка собрана по шаблону из тех же расчётных данных.
              </p>
            )}
            <NoteView markdown={note.text} />
          </div>
        )}

        {/* ДЕЙСТВИЯ */}
        <div className="noPrint" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
          <button type="button" onClick={makeNote} disabled={noteBusy}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: noteBusy ? "wait" : "pointer", background: noteBusy ? "#2a6d80" : "#9ccc65", color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            {noteBusy ? "Пишу записку… 20–40 с" : note ? "Составить записку заново" : "Техническая записка с обоснованиями (ИИ)"}
          </button>
          <button type="button" onClick={() => window.print()}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: "pointer", background: ACCENT, color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            Сохранить в PDF
          </button>
          <button type="button" onClick={dxfScheme}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            Скачать DXF: схема очистки
          </button>
          <button type="button" onClick={dxfModels}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            Скачать DXF: габариты оборудования
          </button>
          <button type="button" onClick={printScheme}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15 }}>
            Схема в PDF (печать)
          </button>
          <button type="button" onClick={printModels}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15 }}>
            Габариты в PDF (печать)
          </button>
          <a href="/engineering/assumptions"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            Коэффициенты расчёта
          </a>
          <a href="/designers"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            Опросные листы
          </a>
          <a href="/#contacts"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            Получить КП с чертежами
          </a>
        </div>

        <p style={{ fontSize: 11, color: FAINT, marginTop: 26, lineHeight: 1.6 }}>
          Документ сформирован автоматически по исходным данным {lab ? "заказчика" : "справочника отраслей"} и
          является предварительным инженерным решением SUVSANOAT. Не заменяет проектную документацию.
          Габаритные чертежи каждой модели — на её странице в разделе «Ассортимент». Состав оборудования
          определён технологией и расходом: часть позиций SUVSANOAT производит сам, часть поставляет —
          в ведомости это указано отдельно и на состав решения не влияет.
        </p>
        <p className="noPrint" style={{ fontSize: 11, color: FAINT, marginTop: 8, lineHeight: 1.6 }}>
          DXF (формат R12) открывается в AutoCAD, NanoCAD, ZWCAD, BricsCAD — «Сохранить как» → DWG. Схема — лист А3,
          габариты — в миллиметрах 1:1. Если чертёж не виден сразу — команда «Показать границы» (Zoom → Extents, в
          командной строке Z ↵ E ↵). Кодировка текста CP1251: если кириллица не читается, в настройках CAD укажите
          кодовую страницу ANSI_1251. Кнопки «в PDF (печать)» открывают тот же чертёж в новой вкладке — печать
          браузера → «Сохранить как PDF».
        </p>
      </div>
    </main>
  );
}

export default function ProResultPage() {
  return (
    <Suspense fallback={null}>
      <ProResultContent />
    </Suspense>
  );
}
