"use client";

import { FormEvent, Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  GENERIC_INDUSTRY_ID,
  INDUSTRIES,
  INDUSTRY_GROUPS,
  POLLUTANT_LABELS,
  defaultValue,
  findIndustry,
  isGenericIndustry,
  type PollutantKey,
} from "./industries";
import { DISCHARGES, findDischarge } from "./targets";
import { filledCount, hasAnything, type Extracted, type FieldSource, type TzExtract } from "./tz-extract";
import { MEMBRANE_TECHNOLOGIES } from "./equipment";
import { DEFAULT_ASSUMPTIONS } from "../../../../lib/assumptions";
import type { TechnologyCode } from "../../../../calculations/technology";
import { BIO_TECHNOLOGIES, L, t, ui } from "./i18n";
import type { L10n, UiStrings } from "./i18n";
import { useLanguage } from "../../../LanguageContext";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import {
  DEFAULT_WATER_USE_HORIZON,
  KMK_2_04_03_19_DOC,
  LOCAL_INDUSTRY_SHARE,
  TABLE_3_NOTES,
  TABLE_3_WATER_USE,
  specificWaterUse,
  type SettlementCategory,
  type WaterUseHorizon,
} from "../../../../norms/kmk-2-04-03-19";
import {
  MEMBRANE_REQUIRED_BY_DEFAULT,
  REQUIRED_TECHNOLOGY,
  requirementNote,
} from "../../../../norms/uz-membrane-requirement";

/**
 * Технология биоблока по умолчанию: при действующем требовании об
 * обязательной мембранной очистке это MBR, иначе — прежний автоподбор.
 * Формулировку требования даёт только norms/uz-membrane-requirement.ts.
 */
const DEFAULT_TECH: string = MEMBRANE_REQUIRED_BY_DEFAULT ? REQUIRED_TECHNOLOGY : "auto";

/* ==================================================================
 * ЕДИНЫЙ ШАГ: ИСХОДНЫЕ ДАННЫЕ
 *
 * Сюда сведены обе прежние ветки мастера: ручной ввод расхода с
 * выбором технологии и расчёт по отраслевому справочнику.
 * Проектировщик задаёт объект (отрасль из справочника либо позицию
 * «объекта нет в списке»), расход (известный или по числу жителей
 * согласно табл. 3 ҚМҚ 2.04.03-19), состав стока (лабораторный или
 * справочный), точку сброса и — при наличии биологической ступени —
 * технологию биологической очистки. Дальше — производственный
 * расчёт (pro-result): схема, спецификация, чертежи, записка.
 *
 * Нормативная часть расхода по населению полностью совпадает с шагом
 * flow/page.tsx: тот же модуль norms/kmk-2-04-03-19.ts, те же имена
 * URL-параметров (mode, people, category, year, additionalPercent,
 * specificFlow) — цифры на обеих страницах обязаны совпадать.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const KEY_ORDER: PollutantKey[] = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf"];

/** Категории табл. 3 ҚМҚ 2.04.03-19 — тот же порядок, что на шаге flow. */
const SETTLEMENT_CATEGORIES: readonly SettlementCategory[] = [
  "city-over-100k",
  "city-under-100k",
  "town-under-50k",
];

function parseSettlementCategory(raw: string | null): SettlementCategory {
  if (raw && (SETTLEMENT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as SettlementCategory;
  }
  /* совместимость со старыми ключами страницы flow */
  if (raw === "over100-central") return "city-over-100k";
  if (raw === "under100-central") return "city-under-100k";
  return "town-under-50k";
}

/**
 * Объекты, для которых расход естественнее считать по числу жителей
 * или мест: режим «по населению» включается сразу при их выборе.
 * Запрета на этот режим для остальных отраслей нет.
 */
const POPULATION_FIRST = new Set([
  "settlement",
  "hotel",
  "hospital",
  "school",
  "restaurant",
  "mall",
]);

const ADDITIONAL_PERCENTS = ["0", "5", "10", "15"] as const;

/* ------------------------------------------------------------------
 * УЧАСТОК
 *
 * Контур участка нужен генплану и компоновке (drawings/site/layout.ts):
 * либо прямоугольник ширина × длина, либо контур по точкам «x y», м.
 * Стороны света и отметки — необязательные, они уточняют компоновку.
 * ------------------------------------------------------------------ */

type SiteMode = "given" | "unlimited";
type SiteShape = "rect" | "poly";

/** разбор текстового контура: по одной точке «x y» в строке, м */
function parsePolygon(text: string): [number, number][] {
  const out: [number, number][] = [];
  for (const line of text.split(/[\n;]/)) {
    const parts = line.trim().replace(/,/g, ".").split(/[\s\t]+/).filter(Boolean);
    if (parts.length < 2) continue;
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) out.push([x, y]);
  }
  return out;
}

/* ------------------------------------------------------------------
 * ПРИЛОЖЕННОЕ ТЗ / ТУ: ПОДГОТОВКА ФАЙЛА
 *
 * Сервер (app/api/tz/route.ts) принимает не более ~3 МБ, а страница ТЗ,
 * снятая телефоном, весит впятеро больше. Текст на ней читается и с
 * меньшего разрешения, поэтому крупные фотографии ужимаем прямо в
 * браузере: иначе проектировщик получит отказ по размеру и не поймёт,
 * что делать. PDF отправляем как есть — перерисовать его здесь нечем.
 * ------------------------------------------------------------------ */

/** больше этого размера картинку имеет смысл ужимать */
const TZ_SHRINK_OVER_BYTES = 2 * 1024 * 1024;
/** большая сторона после сжатия, px — на этом мелкий шрифт ещё читается */
const TZ_MAX_IMAGE_SIDE = 2000;

/** если сеть или браузер подвели, показываем то же, что сказал бы сервер */
const TZ_FALLBACK_ERROR = L(
  "Разбор документа не завершился. Заполните анкету вручную.",
  "Hujjatni tahlil qilish yakunlanmadi. Anketani qo‘lda to‘ldiring.",
  "Parsing the document did not finish. Fill the form manually.",
  "文件解析未完成，请手动填写表单。"
);

/** сервер ждёт голый base64, без обвязки data:image/...;base64, */
function stripDataUrl(url: string): string {
  const comma = url.indexOf(",");
  return comma >= 0 ? url.slice(comma + 1) : url;
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("file-read"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-decode"));
    img.src = src;
  });
}

/** Файл в вид, который понимает /api/tz. Сжатие необязательно: если оно
 *  почему-то не удалось, отправляем оригинал и пусть решает сервер. */
async function encodeForUpload(file: File): Promise<{ type: string; dataBase64: string }> {
  const dataUrl = await readAsDataUrl(file);
  if (!file.type.startsWith("image/") || file.size <= TZ_SHRINK_OVER_BYTES) {
    return { type: file.type, dataBase64: stripDataUrl(dataUrl) };
  }
  try {
    const img = await loadImage(dataUrl);
    const side = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = side > TZ_MAX_IMAGE_SIDE ? TZ_MAX_IMAGE_SIDE / side : 1;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, w, h);
    return { type: "image/jpeg", dataBase64: stripDataUrl(canvas.toDataURL("image/jpeg", 0.8)) };
  } catch {
    return { type: file.type, dataBase64: stripDataUrl(dataUrl) };
  }
}

/** ссылка на страницу документа рядом с цитатой — чтобы найти место в оригинале */
const TZ_PAGE_PREFIX = L("стр.", "bet", "p.", "第 页");

/** расшифровка типа документа: код модели проектировщику ничего не говорит */
const TZ_DOC_KIND: Record<TzExtract["docKind"], L10n> = {
  tz: L("техническое задание", "texnik topshiriq", "design brief", "设计任务书"),
  tu: L("технические условия", "texnik shartlar", "technical conditions", "技术条件"),
  lab: L("протокол анализа", "tahlil bayonnomasi", "laboratory report", "化验报告"),
  mixed: L("задание и технические условия вместе", "topshiriq va texnik shartlar birga", "brief and conditions together", "任务书与技术条件合并"),
  unknown: L("не определён", "aniqlanmadi", "not identified", "未能确定"),
};

const SIDE_IDS = ["N", "S", "E", "W"] as const;

function sideLabel(id: (typeof SIDE_IDS)[number], U: UiStrings): string {
  return id === "N" ? U.sideNorth : id === "S" ? U.sideSouth : id === "E" ? U.sideEast : U.sideWest;
}

const inputStyle = {
  display: "block",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: "rgba(0,0,0,0.25)",
  color: "#f5f8fa",
  fontSize: 15,
  boxSizing: "border-box",
} as const;

function IndustryContent() {
  const { language } = useLanguage();
  const U = useMemo(() => ui(language), [language]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "";

  const [groupId, setGroupId] = useState<string>("food");
  const [query, setQuery] = useState("");

  /* --- приложенное ТЗ / ТУ ---
     Разбор документа — вспомогательная операция: анкета обязана
     работать и без него, поэтому у блока своя ошибка (tzError), которая
     не трогает setError формы и не мешает отправке. */
  const tzInputRef = useRef<HTMLInputElement | null>(null);
  const [tzFile, setTzFile] = useState<{ name: string; size: number } | null>(null);
  const [tzBusy, setTzBusy] = useState(false);
  const [tzError, setTzError] = useState("");
  const [tzResult, setTzResult] = useState<TzExtract | null>(null);
  const [tzApplied, setTzApplied] = useState(false);
  /* откуда взялось значение каждого поля анкеты: проектировщик должен
     видеть, что он проверяет чужую цифру, а не свою */
  const [fieldSource, setFieldSource] = useState<Record<string, FieldSource>>({});
  /* что документ дал, но в анкету не легло — честнее показать, чем молчать */
  const [tzSkipped, setTzSkipped] = useState<string[]>([]);

  const [industryId, setIndustryId] = useState<string>("");
  const [hasLab, setHasLab] = useState<boolean | null>(null);
  const [flowMode, setFlowMode] = useState<"known" | "population">("known");
  const [flow, setFlow] = useState("");
  const [people, setPeople] = useState("");
  const [category, setCategory] = useState<SettlementCategory>("town-under-50k");
  const [year, setYear] = useState<WaterUseHorizon>(DEFAULT_WATER_USE_HORIZON);
  const [additionalPercent, setAdditionalPercent] = useState("0");
  const [tech, setTech] = useState<string>(DEFAULT_TECH);
  const [hours, setHours] = useState("16");
  /* Расчётная температура сточной воды. Два разных числа: среднегодовая
     определяет объём биологии (поправка 15/T_w, п. 6.143 прим.), летняя —
     расход воздуха (K_T ф. (71) п. 6.156, растворимость O₂ табл. 44).
     Значения по умолчанию — из справочника коэффициентов, чтобы цифра
     стояла в одном месте и была подписана главным инженером. */
  const [tAnnual, setTAnnual] = useState(String(DEFAULT_ASSUMPTIONS.waterTempAnnual));
  const [tSummer, setTSummer] = useState(String(DEFAULT_ASSUMPTIONS.waterTempSummer));
  const [values, setValues] = useState<Record<string, string>>({});
  const [ph, setPh] = useState("");
  const [discharge, setDischarge] = useState<string>("sewer");
  const [hasTu, setHasTu] = useState(false);
  const [tu, setTu] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  /* --- участок под очистные сооружения (для генплана и комплекта чертежей) --- */
  const [siteMode, setSiteMode] = useState<SiteMode>("unlimited");
  const [siteShape, setSiteShape] = useState<SiteShape>("rect");
  const [siteW, setSiteW] = useState("");
  const [siteL, setSiteL] = useState("");
  const [sitePoly, setSitePoly] = useState("");
  const [groundElev, setGroundElev] = useState("");
  const [inletSide, setInletSide] = useState("");
  const [inletInvert, setInletInvert] = useState("");
  const [outletSide, setOutletSide] = useState("");
  const [outletElev, setOutletElev] = useState("");
  const [housingSide, setHousingSide] = useState("");
  const [housingDist, setHousingDist] = useState("");

  /** площадь заданного участка, м² — для подсказки под блоком */
  const siteArea = useMemo(() => {
    if (siteMode !== "given") return null;
    if (siteShape === "rect") {
      const w = parseFloat(siteW.replace(",", "."));
      const l = parseFloat(siteL.replace(",", "."));
      return Number.isFinite(w) && Number.isFinite(l) && w > 0 && l > 0 ? Math.round(w * l) : null;
    }
    const poly = parsePolygon(sitePoly);
    if (poly.length < 3) return null;
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      s += x1 * y2 - x2 * y1;
    }
    return Math.round(Math.abs(s) / 2);
  }, [siteMode, siteShape, siteW, siteL, sitePoly]);

  const industry = useMemo(
    () => (industryId ? findIndustry(industryId) : undefined),
    [industryId]
  );

  /** «объекта нет в списке»: справочные концентрации не подставляются */
  const generic = isGenericIndustry(industryId);

  /** удельное водоотведение по п. 2.9, табл. 3 ҚМҚ 2.04.03-19 */
  const specificRow = useMemo(
    () => (flowMode === "population" ? specificWaterUse(category, year) : null),
    [flowMode, category, year]
  );
  const specificFlow = specificRow?.lpcd ?? null;

  /**
   * Расход: тот же расчёт, что на шаге flow/page.tsx —
   * жители × удельное водоотведение / 1000 × (1 + доп. %).
   */
  const computedFlow = useMemo(() => {
    let base = 0;

    if (flowMode === "known") {
      base = parseFloat(flow.replace(",", "."));
    } else if (specificFlow !== null) {
      const peopleValue = parseFloat(people.replace(",", "."));
      if (Number.isFinite(peopleValue) && peopleValue > 0) {
        base = (peopleValue * specificFlow) / 1000;
      }
    }

    if (!Number.isFinite(base) || base <= 0) return null;

    const extra = Number(additionalPercent);
    const safeExtra = Number.isFinite(extra) && extra >= 0 && extra <= 15 ? extra : 0;
    const daily = base * (1 + safeExtra / 100);

    return { base, daily: Math.round(daily * 1000) / 1000, extra: safeExtra };
  }, [flowMode, flow, people, specificFlow, additionalPercent]);

  /** ступени отрасли: селектор технологии нужен только при биологии */
  const hasBioStage = industry ? industry.chain.includes("bio") : false;

  /**
   * Отступление от требования об обязательной мембранной очистке:
   * инженер выбрал не мембранную технологию вручную. Автоподбор
   * («auto») отступлением не является — при действующем требовании он
   * тоже даёт MBR, это разбирается в pro-result.
   */
  const mbrWaiver =
    MEMBRANE_REQUIRED_BY_DEFAULT &&
    hasBioStage &&
    tech !== "auto" &&
    !MEMBRANE_TECHNOLOGIES.includes(tech as TechnologyCode);

  /** какие показатели показываем: у «объекта нет в списке» — все */
  const activeKeys = useMemo(
    () =>
      generic
        ? KEY_ORDER
        : KEY_ORDER.filter((key) => industry?.pollutants[key] !== undefined),
    [generic, industry]
  );

  function pickIndustry(id: string) {
    setIndustryId(id);
    setError("");

    const item = findIndustry(id);
    if (!item) return;

    if (isGenericIndustry(id)) {
      /* состав стока целиком за пользователем — режим «есть анализ» */
      setHasLab(true);
      setValues({});
      setPh("");
    } else {
      setHasLab(null);

      const next: Record<string, string> = {};
      for (const key of KEY_ORDER) {
        const range = item.pollutants[key];
        if (range) next[key] = String(defaultValue(range));
      }
      setValues(next);
      setPh(((item.ph[0] + item.ph[1]) / 2).toFixed(1));
    }

    /* для жилых и общественных объектов расход удобнее считать по людям */
    if (POPULATION_FIRST.has(id)) setFlowMode("population");

    /* технология сбрасывается к значению по умолчанию, если у новой отрасли нет биологии */
    if (!item.chain.includes("bio")) setTech(DEFAULT_TECH);
  }

  /* ---------------- приложенное ТЗ / ТУ ---------------- */

  /** правка поля руками снимает метку «из документа»: с этой минуты за
   *  цифру отвечает проектировщик, а не приложенный документ */
  function userEdited(key: string) {
    setFieldSource((s) => (s[key] ? { ...s, [key]: "user" } : s));
  }

  /** метка у подписи поля — видно, какие цифры пришли из документа */
  function srcBadge(key: string) {
    if (fieldSource[key] !== "document") return null;
    return (
      <span
        style={{
          marginLeft: 6,
          padding: "1px 7px",
          borderRadius: 999,
          border: `1px solid ${ACCENT}`,
          color: ACCENT,
          fontSize: 11,
          whiteSpace: "nowrap",
        }}
      >
        {U.tzFromDoc}
      </span>
    );
  }

  async function handleTzFile(file: File | null) {
    if (!file) return;
    setTzError("");
    setTzResult(null);
    setTzApplied(false);
    setTzSkipped([]);
    setTzFile({ name: file.name, size: file.size });
    setTzBusy(true);
    try {
      const prepared = await encodeForUpload(file);
      const res = await fetch("/api/tz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file: { name: file.name, type: prepared.type, dataBase64: prepared.dataBase64 } }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; extract?: TzExtract };
      if (!data.ok || !data.extract) {
        setTzError(data.error || t(TZ_FALLBACK_ERROR, language));
        return;
      }
      setTzResult(data.extract);
    } catch {
      setTzError(t(TZ_FALLBACK_ERROR, language));
    } finally {
      setTzBusy(false);
    }
  }

  function clearTz() {
    setTzFile(null);
    setTzResult(null);
    setTzError("");
    setTzApplied(false);
    setTzSkipped([]);
    /* документа больше нет — метки «из документа» стали бы враньём */
    setFieldSource({});
    if (tzInputRef.current) tzInputRef.current.value = "";
  }

  /**
   * Подстановка разобранных значений в анкету.
   *
   * Подставляется только то, что в документе написано буквально.
   * Технологию не трогаем: в документе она названа словами, а в анкете
   * это код из списка — сопоставление остаётся за проектировщиком.
   */
  function applyExtract(e: TzExtract) {
    const src: Record<string, FieldSource> = {};
    const skipped: string[] = [];

    /* отрасль ставим первой: pickIndustry сбрасывает состав стока на
       справочный, и всё, что подставим после, должно его перекрыть */
    if (e.industryId.value) pickIndustry(e.industryId.value);

    if (e.flowM3Day.value !== null) {
      setFlow(String(e.flowM3Day.value));
      setFlowMode("known");
      src.flow = "document";
    }
    if (e.people.value !== null) {
      setPeople(String(e.people.value));
      src.people = "document";
      /* расхода в документе нет, зато есть жители — считаем по табл. 3 */
      if (e.flowM3Day.value === null) setFlowMode("population");
    }
    if (e.hoursPerDay.value !== null) {
      setHours(String(e.hoursPerDay.value));
      src.hours = "document";
    }

    const inletKeys = KEY_ORDER.filter((key) => e.inlet[key]?.value != null);
    if (inletKeys.length > 0 || e.inlet.ph?.value != null) {
      setValues((prev) => {
        const next = { ...prev };
        for (const key of inletKeys) {
          const item = e.inlet[key];
          if (item && item.value !== null) next[key] = String(item.value);
        }
        return next;
      });
      for (const key of inletKeys) src[key] = "document";
      const phItem = e.inlet.ph;
      if (phItem && phItem.value !== null) {
        setPh(String(phItem.value));
        src.ph = "document";
      }
      /* состав из ТЗ — фактические данные объекта, а не справочник отрасли */
      setHasLab(true);
    }

    const targetKeys = KEY_ORDER.filter((key) => e.targets[key]?.value != null);
    if (targetKeys.length > 0) {
      setHasTu(true);
      setTu((prev) => {
        const next = { ...prev };
        for (const key of targetKeys) {
          const item = e.targets[key];
          if (item && item.value !== null) next[key] = String(item.value);
        }
        return next;
      });
      for (const key of targetKeys) src[`tu_${key}`] = "document";
    }

    if (e.siteWidthM.value !== null || e.siteLengthM.value !== null) {
      setSiteMode("given");
      setSiteShape("rect");
      if (e.siteWidthM.value !== null) {
        setSiteW(String(e.siteWidthM.value));
        src.siteW = "document";
      }
      if (e.siteLengthM.value !== null) {
        setSiteL(String(e.siteLengthM.value));
        src.siteL = "document";
      }
    } else if (e.siteAreaM2.value !== null) {
      /* площадь без сторон: контур генплана из неё не восстановить, а
         придумывать стороны — значит подсунуть проектировщику выдумку */
      skipped.push(`${U.siteAreaGiven}: ${e.siteAreaM2.value} ${U.unitM2}`);
    }

    if (e.groundElevM.value !== null) {
      setGroundElev(String(e.groundElevM.value));
      src.groundElev = "document";
    }
    if (e.housingDistM.value !== null) {
      setHousingDist(String(e.housingDistM.value));
      src.housingDist = "document";
    }

    setFieldSource(src);
    setTzSkipped(skipped);
    setTzApplied(true);
  }

  /** строки таблицы найденного: величина, значение и цитата-основание */
  function tzRows(e: TzExtract) {
    const rows: { key: string; label: string; value: string; quote?: string; page?: number }[] = [];
    const push = (key: string, label: string, item: Extracted<string> | Extracted<number> | undefined) => {
      if (!item || item.value === null) return;
      rows.push({ key, label, value: String(item.value), quote: item.quote, page: item.page });
    };

    push("object", U.objectWord, e.object);
    push("industry", U.chooseIndustry, e.industryText);
    push("flow", U.flowPerDay, e.flowM3Day);
    push("hours", U.workHours, e.hoursPerDay);
    push("people", U.peopleLabel, e.people);
    for (const key of KEY_ORDER) {
      const info = POLLUTANT_LABELS[key];
      push(`in_${key}`, `${t(info.label, language)}, ${t(info.unit, language)}`, e.inlet[key]);
    }
    push("in_ph", "pH", e.inlet.ph);
    for (const key of KEY_ORDER) {
      const info = POLLUTANT_LABELS[key];
      push(`tu_${key}`, `${U.targetsFrom} · ${t(info.label, language)}, ${t(info.unit, language)}`, e.targets[key]);
    }
    push("tu_ph", `${U.targetsFrom} · pH`, e.targets.ph);
    push("discharge", U.dischargeTo, e.dischargePoint);
    push("tech", U.techSection, e.technology);
    push("siteArea", U.siteAreaGiven, e.siteAreaM2);
    push("siteW", U.siteWidth, e.siteWidthM);
    push("siteL", U.siteLength, e.siteLengthM);
    push("groundElev", U.siteGroundElev, e.groundElevM);
    push("housingDist", U.siteHousingDist, e.housingDistM);
    return rows;
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!industry) {
      setError(U.errNoIndustry);
      return;
    }
    if (hasLab === null) {
      setError(U.errNoLab);
      return;
    }
    if (flowMode === "population" && !computedFlow) {
      setError(U.errNoPeople);
      return;
    }
    if (!computedFlow) {
      setError(U.errNoFlow);
      return;
    }

    const q = computedFlow.daily;

    const params = new URLSearchParams();
    params.set("object", object);
    params.set("industry", industry.id);
    params.set("lab", hasLab ? "1" : "0");
    params.set("flow", String(q));
    params.set("hours", hours);
    /* температура уходит в расчёт двумя отдельными параметрами: годовая
       определяет объём биологии, летняя — воздух; смешивать их нельзя */
    params.set("tAnnual", tAnnual);
    params.set("tSummer", tSummer);
    for (const key of KEY_ORDER) {
      if (values[key] !== undefined) params.set(key, values[key]);
    }
    params.set("ph", ph);
    params.set("out", discharge);
    if (hasTu) {
      params.set("tu", "1");
      for (const key of Object.keys(tu)) {
        if (tu[key] !== undefined && tu[key] !== "") params.set(`t_${key}`, tu[key]);
      }
    }

    /* как задан расход — чтобы pro-result мог показать основание */
    params.set("mode", flowMode);
    params.set("additionalPercent", String(computedFlow.extra));
    if (flowMode === "population") {
      params.set("people", people);
      params.set("category", category);
      params.set("year", String(year));
      if (specificFlow !== null) params.set("specificFlow", String(specificFlow));
    }

    /* технологию передаём только если она задана вручную */
    if (hasBioStage && tech !== "auto") params.set("tech", tech);

    /* снятие требования об обязательной мембранной очистке — осознанное
       решение инженера, оно должно быть видно в расчёте и в записке */
    if (mbrWaiver) params.set("mbrWaiver", "1");

    /* участок: контур и привязки уходят в pro-result, оттуда — в генплан */
    params.set("siteMode", siteMode);
    if (siteMode === "given") {
      if (siteShape === "rect") {
        if (siteW) params.set("siteW", siteW);
        if (siteL) params.set("siteL", siteL);
      } else {
        const poly = parsePolygon(sitePoly);
        if (poly.length >= 3) params.set("sitePoly", poly.map(([x, y]) => `${x} ${y}`).join(";"));
      }
    }
    if (groundElev) params.set("groundElev", groundElev);
    if (inletSide) params.set("inletSide", inletSide);
    if (inletInvert) params.set("inletInvert", inletInvert);
    if (outletSide) params.set("outletSide", outletSide);
    if (outletElev) params.set("outletElev", outletElev);
    if (housingSide) params.set("housingSide", housingSide);
    if (housingDist) params.set("housingDist", housingDist);

    router.push(`/engineering/analysis/pro-result?${params.toString()}`);
  }

  /* Поиск по всему справочнику: отраслей стало более шестидесяти, и
     перебирать плитки по группам дольше, чем набрать слово. Пока строка
     пустая — работает обычный выбор по группе. Ищем по названию на всех
     четырёх языках и по подсказке удельного расхода. */
  const q = query.trim().toLowerCase();
  const matches = (item: (typeof INDUSTRIES)[number]) =>
    [t(item.name, language), t(item.flowHint, language), t(item.name, "ru"), t(item.name, "en")]
      .join(" ")
      .toLowerCase()
      .includes(q);
  const groupIndustries = q
    ? INDUSTRIES.filter((item) => !isGenericIndustry(item.id) && matches(item))
    : INDUSTRIES.filter((item) => item.group === groupId);

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "60px 24px 110px" }}>
      <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
        {/* Шапка шага: назад слева, выбор языка справа. Переключатель
            обязан быть на каждой странице расчёта — общей шапки у сайта
            нет, и без него проектировщик, зашедший сразу на этот адрес,
            остаётся запертым в языке, выбранном на главной. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer" }}
          >
            ← {U.back}
          </button>
          <LanguageSwitcher />
        </div>

        <div style={{ fontSize: 13, letterSpacing: "0.14em", color: ACCENT, marginBottom: 10 }}>
          {U.stepInput}
        </div>

        <h1 style={{ fontSize: 32, margin: "0 0 10px" }}>{U.inputTitle}</h1>

        <p style={{ color: FAINT, maxWidth: 700, lineHeight: 1.6, margin: "0 0 8px" }}>
          {U.inputLead}
        </p>

        <p style={{ color: FAINT, maxWidth: 700, lineHeight: 1.6, margin: "0 0 30px", fontSize: 13 }}>
          {U.pageLead}
        </p>

        <form onSubmit={handleContinue}>
          {/* ПОИСК ПО СПРАВОЧНИКУ */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={U.searchPlaceholder}
              style={{
                width: "100%",
                maxWidth: 520,
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${LINE}`,
                background: "transparent",
                color: "#eaf6fa",
                fontSize: 14,
              }}
            />
            {q ? (
              <span style={{ color: FAINT, fontSize: 13, marginLeft: 12 }}>
                {U.searchFound}: {groupIndustries.length}
              </span>
            ) : null}
          </div>

          {/* ТЕХНИЧЕСКОЕ ЗАДАНИЕ ИЛИ ТЕХНИЧЕСКИЕ УСЛОВИЯ.
              Блок стоит до выбора отрасли намеренно: заказчик может
              прийти с одними техусловиями, а его производства в
              справочнике не окажется — документ тогда единственный
              источник исходных данных. */}
          <div
            style={{
              border: `1px solid ${LINE}`,
              background: PANEL,
              borderRadius: 12,
              padding: "22px 22px 18px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
              {U.tzSection}
            </div>
            <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>{U.tzLead}</p>

            <input
              ref={tzInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => {
                void handleTzFile(event.target.files?.[0] ?? null);
              }}
              style={{ display: "none" }}
            />

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={tzBusy}
                onClick={() => tzInputRef.current?.click()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: `1px solid ${LINE}`,
                  background: "transparent",
                  color: tzBusy ? FAINT : "#eaf6fa",
                  fontSize: 14,
                  cursor: tzBusy ? "default" : "pointer",
                }}
              >
                {tzBusy ? U.tzParsing : U.tzPick}
              </button>
              {tzFile && (
                <span style={{ fontSize: 12, color: FAINT }}>
                  {tzFile.name} — {Math.max(1, Math.round(tzFile.size / 1024))} KB
                </span>
              )}
            </div>

            {tzError && (
              <p style={{ fontSize: 13, color: "#ff8a80", margin: "14px 0 0", lineHeight: 1.6 }}>{tzError}</p>
            )}

            {tzResult && !hasAnything(tzResult) && (
              <p style={{ fontSize: 13, color: FAINT, margin: "14px 0 0", lineHeight: 1.6 }}>{U.tzNothing}</p>
            )}

            {tzResult && hasAnything(tzResult) && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, color: "#dfe9ec", margin: "0 0 12px", lineHeight: 1.6 }}>
                  {U.tzDocKind}: <b>{t(TZ_DOC_KIND[tzResult.docKind], language)}</b>
                  {" · "}
                  <b style={{ color: ACCENT }}>{filledCount(tzResult)}</b> {U.tzFilled}
                </p>

                {/* Цитата обязательна к показу: без неё цифру не проверить,
                    не открывая документ, а именно проверяемость — весь
                    смысл машинного разбора. */}
                <div style={{ display: "grid", gap: 10 }}>
                  {tzRows(tzResult).map((row) => (
                    <div key={row.key} style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 8 }}>
                      <div style={{ fontSize: 13, color: "#dfe9ec" }}>
                        {row.label}: <b style={{ color: ACCENT }}>{row.value}</b>
                      </div>
                      {row.quote && (
                        <div style={{ fontSize: 11, color: FAINT, lineHeight: 1.5, marginTop: 3 }}>
                          «{row.quote}»
                          {row.page !== undefined ? ` — ${t(TZ_PAGE_PREFIX, language)} ${row.page}` : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {tzResult.warnings.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "#e5a54b", marginBottom: 6 }}>
                      {U.tzWarnings}
                    </div>
                    {tzResult.warnings.map((w) => (
                      <p key={w} style={{ fontSize: 12.5, color: "#e5a54b", margin: "0 0 6px", lineHeight: 1.55 }}>
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                {tzResult.missing.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: FAINT, marginBottom: 6 }}>{U.tzMissing}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: "#cfdde3", fontSize: 12.5, lineHeight: 1.6 }}>
                      {tzResult.missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tzResult.requirements.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, letterSpacing: "0.08em", color: ACCENT, marginBottom: 6 }}>
                      {U.tzRequirements}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: "#cfdde3", fontSize: 12.5, lineHeight: 1.6 }}>
                      {tzResult.requirements.map((r, i) => (
                        <li key={`${r.no}-${i}`}>
                          {r.no ? `${r.no} ` : ""}
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* что документ дал, но анкета взять не может */}
                {tzApplied && tzSkipped.length > 0 && (
                  <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: "#e5a54b", fontSize: 12.5, lineHeight: 1.6 }}>
                    {tzSkipped.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => applyExtract(tzResult)}
                    style={{
                      padding: "11px 22px",
                      borderRadius: 8,
                      border: 0,
                      background: ACCENT,
                      color: BG,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {U.tzApply}
                  </button>
                  <button
                    type="button"
                    onClick={clearTz}
                    style={{
                      padding: "11px 22px",
                      borderRadius: 8,
                      border: `1px solid ${LINE}`,
                      background: "transparent",
                      color: FAINT,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {U.tzClear}
                  </button>
                </div>
              </div>
            )}

            <p style={{ fontSize: 11, color: "#6f8792", margin: "14px 0 0", lineHeight: 1.6 }}>{U.tzHint}</p>
          </div>

          {/* ГРУППЫ */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, opacity: q ? 0.4 : 1 }}>
            {INDUSTRY_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setGroupId(group.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `1px solid ${group.id === groupId ? ACCENT : LINE}`,
                  background: group.id === groupId ? "rgba(62,195,230,0.12)" : "transparent",
                  color: group.id === groupId ? "#eaf6fa" : FAINT,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t(group.name, language)}
              </button>
            ))}
          </div>

          {/* ОТРАСЛИ ГРУППЫ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 10,
              marginBottom: 30,
            }}
          >
            {groupIndustries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickIndustry(item.id)}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${item.id === industryId ? ACCENT : LINE}`,
                  background: item.id === industryId ? "rgba(62,195,230,0.10)" : PANEL,
                  color: "#f5f8fa",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t(item.name, language)}</div>
                <div style={{ fontSize: 12, color: FAINT }}>{t(item.flowHint, language)}</div>
              </button>
            ))}
          </div>

          {/* ОБЪЕКТА НЕТ В СПРАВОЧНИКЕ */}
          <button
            type="button"
            onClick={() => pickIndustry(GENERIC_INDUSTRY_ID)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px dashed ${generic ? ACCENT : LINE}`,
              background: generic ? "rgba(62,195,230,0.10)" : "transparent",
              color: "#f5f8fa",
              cursor: "pointer",
              marginBottom: 30,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{U.genericButton}</div>
            <div style={{ fontSize: 12, color: FAINT }}>{U.genericButtonHint}</div>
          </button>

          {industry && (
            <>
              {/* РАСХОД */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px 22px 18px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 14 }}>
                  {U.flowSection}
                </div>

                {/* РЕЖИМ ЗАДАНИЯ РАСХОДА */}
                <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, marginBottom: 8 }}>
                  {U.flowModeTitle}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  {([
                    { id: "known" as const, title: U.flowModeKnown, hint: U.flowModeKnownHint },
                    { id: "population" as const, title: U.flowModePopulation, hint: U.flowModePopulationHint },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFlowMode(item.id)}
                      style={{
                        flex: "1 1 260px",
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: `1px solid ${flowMode === item.id ? ACCENT : LINE}`,
                        background: flowMode === item.id ? "rgba(62,195,230,0.12)" : "transparent",
                        color: "#f5f8fa",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5 }}>{item.hint}</div>
                    </button>
                  ))}
                </div>

                {flowMode === "known" ? (
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.flowPerDay}
                      {srcBadge("flow")}
                      <input
                        value={flow}
                        onChange={(event) => {
                          setFlow(event.target.value);
                          userEdited("flow");
                        }}
                        placeholder={U.flowPlaceholder}
                        inputMode="decimal"
                        style={{ ...inputStyle, width: 180 }}
                      />
                    </label>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.workHours}
                      {srcBadge("hours")}
                      <input
                        value={hours}
                        onChange={(event) => {
                          setHours(event.target.value);
                          userEdited("hours");
                        }}
                        inputMode="numeric"
                        style={{ ...inputStyle, width: 120 }}
                      />
                    </label>
                    <div style={{ fontSize: 12, color: FAINT, alignSelf: "flex-end", maxWidth: 320 }}>
                      {U.industryHint}: {t(industry.flowHint, language)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.peopleLabel}
                        {srcBadge("people")}
                        <input
                          value={people}
                          onChange={(event) => {
                            setPeople(event.target.value);
                            userEdited("people");
                          }}
                          placeholder={U.peoplePlaceholder}
                          inputMode="numeric"
                          style={{ ...inputStyle, width: 180 }}
                        />
                      </label>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.horizonLabel}
                        <select
                          value={String(year)}
                          onChange={(event) => setYear(event.target.value === "2020" ? 2020 : 2035)}
                          style={{ ...inputStyle, width: 260 }}
                        >
                          <option value="2035">{U.horizon2035}</option>
                          <option value="2020">{U.horizon2020}</option>
                        </select>
                      </label>
                      <label style={{ fontSize: 13, color: FAINT }}>
                        {U.workHours}
                        {srcBadge("hours")}
                        <input
                          value={hours}
                          onChange={(event) => {
                            setHours(event.target.value);
                            userEdited("hours");
                          }}
                          inputMode="numeric"
                          style={{ ...inputStyle, width: 120 }}
                        />
                      </label>
                    </div>

                    <label style={{ display: "block", fontSize: 13, color: FAINT, marginTop: 16 }}>
                      {U.settlementCategoryLabel}
                      <select
                        value={category}
                        onChange={(event) => setCategory(parseSettlementCategory(event.target.value))}
                        style={{ ...inputStyle, width: "100%", maxWidth: 720 }}
                      >
                        {SETTLEMENT_CATEGORIES.map((id) => {
                          const row = TABLE_3_WATER_USE[id];
                          return (
                            <option key={id} value={id}>
                              {row.label} — {row.lps[2020]} / {row.lps[2035]} {U.unitLpcd} (2020 / 2035)
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    {specificRow && (
                      <p style={{ fontSize: 12, color: FAINT, margin: "12px 0 0", lineHeight: 1.6 }}>
                        {U.specificUseLabel}:{" "}
                        <b style={{ color: "#dfe9ec" }}>{specificRow.lpcd}</b> {U.unitLpcd}
                        <br />
                        <span style={{ color: "#6f8792", fontSize: 11 }}>{specificRow.source}</span>
                      </p>
                    )}
                  </>
                )}

                {/* ДОПОЛНИТЕЛЬНЫЙ ПРОЦЕНТ */}
                <label style={{ display: "block", fontSize: 13, color: FAINT, marginTop: 18 }}>
                  {U.addPercentLabel}
                  <select
                    value={additionalPercent}
                    onChange={(event) => setAdditionalPercent(event.target.value)}
                    style={{ ...inputStyle, width: "100%", maxWidth: 560 }}
                  >
                    {ADDITIONAL_PERCENTS.map((value) => (
                      <option key={value} value={value}>
                        {value === "0"
                          ? U.addPercent0
                          : value === "5"
                          ? U.addPercent5
                          : value === "10"
                          ? U.addPercent10
                          : U.addPercent15}
                      </option>
                    ))}
                  </select>
                </label>

                <p style={{ fontSize: 11, color: "#6f8792", margin: "10px 0 0", lineHeight: 1.6 }}>
                  {LOCAL_INDUSTRY_SHARE.ref} — {LOCAL_INDUSTRY_SHARE.value * 100} %.
                </p>

                {flowMode === "population" && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", color: FAINT, marginBottom: 6 }}>
                      {U.table3NotesTitle} ({KMK_2_04_03_19_DOC.code})
                    </div>
                    {TABLE_3_NOTES.map((note) => (
                      <p key={note} style={{ fontSize: 11, color: "#6f8792", margin: "0 0 5px", lineHeight: 1.55 }}>
                        {note}
                      </p>
                    ))}
                  </div>
                )}

                {computedFlow && (
                  <p style={{ fontSize: 13, color: "#dfe9ec", margin: "16px 0 0", lineHeight: 1.6 }}>
                    {U.computedFlowLabel}: <b style={{ color: ACCENT }}>{computedFlow.daily}</b>{" "}
                    {U.unitM3Day}
                    {flowMode === "population" && (
                      <span style={{ color: FAINT, fontSize: 11 }}> — {U.computedFlowFormula}</span>
                    )}
                  </p>
                )}

                {/* РАСЧЁТНАЯ ТЕМПЕРАТУРА СТОЧНОЙ ВОДЫ
                    Стоит рядом с расходом: это второе исходное число, от
                    которого зависит габарит сооружения. Годовая — объём
                    биологии, летняя — воздух; поля разведены намеренно. */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                  <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, marginBottom: 10 }}>
                    {U.tempSection}
                  </div>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.tempAnnual}
                      <input
                        value={tAnnual}
                        onChange={(event) => setTAnnual(event.target.value)}
                        inputMode="decimal"
                        style={{ ...inputStyle, width: 140 }}
                      />
                    </label>
                    <label style={{ fontSize: 13, color: FAINT }}>
                      {U.tempSummer}
                      <input
                        value={tSummer}
                        onChange={(event) => setTSummer(event.target.value)}
                        inputMode="decimal"
                        style={{ ...inputStyle, width: 140 }}
                      />
                    </label>
                  </div>
                  <p style={{ fontSize: 11, color: "#6f8792", margin: "10px 0 0", lineHeight: 1.6, maxWidth: 820 }}>
                    {U.tempHint}
                  </p>
                </div>
              </div>

              {/* КУДА СБРАСЫВАЕМ */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
                  {U.dischargeSection}
                </div>
                <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>
                  {U.dischargeLead}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {DISCHARGES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDischarge(d.id)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: `1px solid ${discharge === d.id ? ACCENT : LINE}`,
                        background: discharge === d.id ? "rgba(62,195,230,0.14)" : "transparent",
                        color: discharge === d.id ? "#eaf6fa" : FAINT,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {t(d.name, language)}
                    </button>
                  ))}
                </div>

                {(() => {
                  const d = findDischarge(discharge);
                  if (!d) return null;
                  return (
                    <>
                      <p style={{ fontSize: 12, color: FAINT, margin: "0 0 10px", lineHeight: 1.6 }}>
                        {t(d.hint, language)}. {t(d.note, language)}
                      </p>
                      <p style={{ fontSize: 11, color: "#6f8792", margin: "0 0 14px" }}>
                        {U.basisLabel}: {t(d.source, language)}
                      </p>

                      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#cfdde3", cursor: "pointer" }}>
                        <input type="checkbox" checked={hasTu} onChange={(e) => setHasTu(e.target.checked)} />
                        {U.hasTu}
                      </label>

                      {hasTu && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 14 }}>
                          {KEY_ORDER.map((key) => (
                            <label key={key} style={{ fontSize: 12, color: FAINT }}>
                              {t(POLLUTANT_LABELS[key].label, language)}, {t(POLLUTANT_LABELS[key].unit, language)}
                              {srcBadge(`tu_${key}`)}
                              <input
                                value={tu[key] ?? (d.targets[key] !== undefined ? String(d.targets[key]) : "")}
                                onChange={(e) => {
                                  setTu({ ...tu, [key]: e.target.value });
                                  userEdited(`tu_${key}`);
                                }}
                                inputMode="decimal"
                                placeholder={U.tuPlaceholder}
                                style={{
                                  display: "block", marginTop: 6, width: "100%", padding: "9px 10px",
                                  borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.25)",
                                  color: "#f5f8fa", fontSize: 14, boxSizing: "border-box",
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* ЛАБОРАТОРИЯ */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 14 }}>
                  {U.labSection}
                </div>

                {generic && (
                  <p style={{ fontSize: 12, color: FAINT, margin: "0 0 16px", lineHeight: 1.6 }}>
                    {U.genericManualNote}
                  </p>
                )}

                <div style={{ display: generic ? "none" : "flex", gap: 10, marginBottom: 18 }}>
                  <button
                    type="button"
                    onClick={() => setHasLab(true)}
                    style={{
                      padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${hasLab === true ? ACCENT : LINE}`,
                      background: hasLab === true ? "rgba(62,195,230,0.12)" : "transparent",
                      color: hasLab === true ? "#eaf6fa" : FAINT,
                    }}
                  >
                    {U.labYes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasLab(false)}
                    style={{
                      padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${hasLab === false ? ACCENT : LINE}`,
                      background: hasLab === false ? "rgba(62,195,230,0.12)" : "transparent",
                      color: hasLab === false ? "#eaf6fa" : FAINT,
                    }}
                  >
                    {U.labNo}
                  </button>
                </div>

                {hasLab !== null && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                        gap: 14,
                      }}
                    >
                      {activeKeys.map((key) => {
                        const range = industry.pollutants[key];
                        const info = POLLUTANT_LABELS[key];
                        return (
                          <label key={key} style={{ fontSize: 12, color: FAINT }}>
                            {t(info.label, language)}, {t(info.unit, language)}
                            {srcBadge(key)}
                            {hasLab ? (
                              <input
                                value={values[key] ?? ""}
                                onChange={(event) => {
                                  setValues({ ...values, [key]: event.target.value });
                                  userEdited(key);
                                }}
                                inputMode="decimal"
                                style={{
                                  display: "block", marginTop: 5, width: "100%", padding: "9px 11px",
                                  borderRadius: 8, border: `1px solid ${LINE}`,
                                  background: "rgba(0,0,0,0.25)", color: "#f5f8fa", fontSize: 15,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  marginTop: 5, padding: "9px 11px", borderRadius: 8,
                                  border: `1px dashed ${LINE}`, color: "#dfe9ec", fontSize: 15,
                                }}
                              >
                                {values[key]}
                                {range && (
                                  <span style={{ color: FAINT, fontSize: 11 }}>
                                    {" "}({range[0]}–{range[1]})
                                  </span>
                                )}
                              </div>
                            )}
                          </label>
                        );
                      })}

                      <label style={{ fontSize: 12, color: FAINT }}>
                        pH
                        {srcBadge("ph")}
                        {hasLab ? (
                          <input
                            value={ph}
                            onChange={(event) => {
                              setPh(event.target.value);
                              userEdited("ph");
                            }}
                            inputMode="decimal"
                            style={{
                              display: "block", marginTop: 5, width: "100%", padding: "9px 11px",
                              borderRadius: 8, border: `1px solid ${LINE}`,
                              background: "rgba(0,0,0,0.25)", color: "#f5f8fa", fontSize: 15,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              marginTop: 5, padding: "9px 11px", borderRadius: 8,
                              border: `1px dashed ${LINE}`, color: "#dfe9ec", fontSize: 15,
                            }}
                          >
                            {ph}
                            <span style={{ color: FAINT, fontSize: 11 }}>
                              {" "}({industry.ph[0]}–{industry.ph[1]})
                            </span>
                          </div>
                        )}
                      </label>
                    </div>

                    {!hasLab && (
                      <p style={{ fontSize: 12, color: FAINT, margin: "16px 0 0", lineHeight: 1.6 }}>
                        {U.refMidNote} ({industry.sources.map((x) => t(x, language)).join("; ")})
                      </p>
                    )}

                    {industry.special && industry.special.length > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "#ffb74d", marginBottom: 8 }}>
                          {U.specialIndustryTitle}
                        </div>
                        {industry.special.map((spec) => (
                          <div key={t(spec.label, language)} style={{ fontSize: 13, color: "#dfe9ec", marginBottom: 8, lineHeight: 1.55 }}>
                            <b>{t(spec.label, language)}</b>: {spec.range[0]}–{spec.range[1]} {t(spec.unit, language)}.{" "}
                            <span style={{ color: FAINT }}>{t(spec.note, language)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ТЕХНОЛОГИЯ БИОЛОГИЧЕСКОЙ ОЧИСТКИ */}
              {hasBioStage && (
                <div
                  style={{
                    border: `1px solid ${LINE}`,
                    background: PANEL,
                    borderRadius: 12,
                    padding: "22px",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
                    {U.techSection}
                  </div>
                  <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>
                    {MEMBRANE_REQUIRED_BY_DEFAULT ? U.techLeadMembrane : U.techLead}
                  </p>

                  {/* ТРЕБОВАНИЕ ОБЯЗАТЕЛЬНОЙ МЕМБРАННОЙ ОЧИСТКИ.
                      Текст ссылки — только из norms/uz-membrane-requirement.ts */}
                  {MEMBRANE_REQUIRED_BY_DEFAULT && (
                    <div
                      style={{
                        border: "1px solid rgba(62,195,230,0.55)",
                        background: "rgba(62,195,230,0.10)",
                        borderRadius: 10,
                        padding: "14px 16px",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 8 }}>
                        {U.mbrBannerTitle}
                      </div>
                      <p style={{ fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>{U.mbrBannerText}</p>
                      <p style={{ fontSize: 12.5, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.6 }}>
                        {U.mbrBannerExplain}
                      </p>
                      <p style={{ fontSize: 12, color: FAINT, margin: 0, lineHeight: 1.6 }}>{U.mbrFineScreen}</p>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setTech("auto")}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: `1px solid ${tech === "auto" ? ACCENT : LINE}`,
                        background: tech === "auto" ? "rgba(62,195,230,0.10)" : "transparent",
                        color: "#f5f8fa",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{U.techAuto}</div>
                      <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5 }}>{U.techAutoHint}</div>
                      {MEMBRANE_REQUIRED_BY_DEFAULT && (
                        <div style={{ fontSize: 11.5, color: ACCENT, lineHeight: 1.5, marginTop: 6 }}>
                          {U.mbrAutoNote}
                        </div>
                      )}
                    </button>

                    {BIO_TECHNOLOGIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTech(item.id)}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 10,
                          border: `1px solid ${tech === item.id ? ACCENT : LINE}`,
                          background: tech === item.id ? "rgba(62,195,230,0.10)" : "transparent",
                          color: "#f5f8fa",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                          {t(item.title, language)}
                        </div>
                        <div style={{ fontSize: 12, color: "#cfdde3", marginBottom: 6 }}>
                          {t(item.subtitle, language)}
                        </div>
                        <div style={{ fontSize: 12, color: FAINT, lineHeight: 1.5, marginBottom: 6 }}>
                          {t(item.when, language)}
                        </div>
                        <div style={{ fontSize: 11, color: item.normed ? "#8fd0a8" : "#a3853f", lineHeight: 1.45 }}>
                          {item.normed ? U.techNormed : U.techNotNormed}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* выбрана не мембранная схема — отступление от требования */}
                  {mbrWaiver && (
                    <div
                      style={{
                        marginTop: 14,
                        border: "1px solid rgba(255,183,77,0.45)",
                        background: "rgba(255,183,77,0.07)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 8 }}>
                        {U.mbrWaiverTitle}
                      </div>
                      <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>{requirementNote(false)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* УЧАСТОК ПОД ОЧИСТНЫЕ СООРУЖЕНИЯ */}
              <div
                style={{
                  border: `1px solid ${LINE}`,
                  background: PANEL,
                  borderRadius: 12,
                  padding: "22px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, letterSpacing: "0.1em", color: ACCENT, marginBottom: 6 }}>
                  {U.siteSection}
                </div>
                <p style={{ fontSize: 12, color: FAINT, margin: "0 0 14px", lineHeight: 1.6 }}>{U.siteLead}</p>

                <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, marginBottom: 8 }}>
                  {U.siteModeTitle}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  {([
                    { id: "given" as const, title: U.siteModeGiven, hint: U.siteModeGivenHint },
                    { id: "unlimited" as const, title: U.siteModeUnlimited, hint: U.siteModeUnlimitedHint },
                  ]).map((item) => (
                    <label
                      key={item.id}
                      style={{
                        flex: "1 1 260px",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: `1px solid ${siteMode === item.id ? ACCENT : LINE}`,
                        background: siteMode === item.id ? "rgba(62,195,230,0.12)" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="siteMode"
                        checked={siteMode === item.id}
                        onChange={() => setSiteMode(item.id)}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</span>
                        <span style={{ display: "block", fontSize: 12, color: FAINT, lineHeight: 1.5 }}>{item.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {siteMode === "given" && (
                  <>
                    <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, marginBottom: 8 }}>
                      {U.siteShapeTitle}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {([
                        { id: "rect" as const, title: U.siteShapeRect },
                        { id: "poly" as const, title: U.siteShapePoly },
                      ]).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSiteShape(item.id)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 999,
                            border: `1px solid ${siteShape === item.id ? ACCENT : LINE}`,
                            background: siteShape === item.id ? "rgba(62,195,230,0.14)" : "transparent",
                            color: siteShape === item.id ? "#eaf6fa" : FAINT,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>

                    {siteShape === "rect" ? (
                      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                        <label style={{ fontSize: 13, color: FAINT }}>
                          {U.siteWidth}
                          {srcBadge("siteW")}
                          <input
                            value={siteW}
                            onChange={(event) => {
                              setSiteW(event.target.value);
                              userEdited("siteW");
                            }}
                            inputMode="decimal"
                            style={{ ...inputStyle, width: 160 }}
                          />
                        </label>
                        <label style={{ fontSize: 13, color: FAINT }}>
                          {U.siteLength}
                          {srcBadge("siteL")}
                          <input
                            value={siteL}
                            onChange={(event) => {
                              setSiteL(event.target.value);
                              userEdited("siteL");
                            }}
                            inputMode="decimal"
                            style={{ ...inputStyle, width: 160 }}
                          />
                        </label>
                      </div>
                    ) : (
                      <label style={{ display: "block", fontSize: 13, color: FAINT }}>
                        {U.sitePolyLabel}
                        <textarea
                          value={sitePoly}
                          onChange={(event) => setSitePoly(event.target.value)}
                          rows={6}
                          placeholder={"0 0\n80 0\n80 50\n0 50"}
                          style={{ ...inputStyle, width: "100%", maxWidth: 420, fontFamily: "monospace", resize: "vertical" }}
                        />
                        <span style={{ display: "block", fontSize: 11, color: "#6f8792", marginTop: 6, lineHeight: 1.55 }}>
                          {U.sitePolyHint}
                        </span>
                      </label>
                    )}

                    {siteArea !== null && (
                      <p style={{ fontSize: 13, color: "#dfe9ec", margin: "14px 0 0" }}>
                        {U.siteAreaGiven}: <b style={{ color: ACCENT }}>{siteArea}</b> {U.unitM2}
                      </p>
                    )}
                  </>
                )}

                {/* ДОПОЛНИТЕЛЬНЫЕ ПРИВЯЗКИ */}
                <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, margin: "20px 0 10px" }}>
                  {U.siteExtraTitle}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                  <label style={{ fontSize: 12, color: FAINT }}>
                    {U.siteGroundElev}
                    {srcBadge("groundElev")}
                    <input
                      value={groundElev}
                      onChange={(event) => {
                        setGroundElev(event.target.value);
                        userEdited("groundElev");
                      }}
                      inputMode="decimal"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </label>
                  {([
                    { label: U.siteInletSide, value: inletSide, set: setInletSide },
                    { label: U.siteOutletSide, value: outletSide, set: setOutletSide },
                    { label: U.siteHousingSide, value: housingSide, set: setHousingSide },
                  ]).map((item) => (
                    <label key={item.label} style={{ fontSize: 12, color: FAINT }}>
                      {item.label}
                      <select
                        value={item.value}
                        onChange={(event) => item.set(event.target.value)}
                        style={{ ...inputStyle, width: "100%" }}
                      >
                        <option value="">{U.sideNotSet}</option>
                        {SIDE_IDS.map((id) => (
                          <option key={id} value={id}>
                            {sideLabel(id, U)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label style={{ fontSize: 12, color: FAINT }}>
                    {U.siteInletInvert}
                    <input
                      value={inletInvert}
                      onChange={(event) => setInletInvert(event.target.value)}
                      inputMode="decimal"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: FAINT }}>
                    {U.siteOutletElev}
                    <input
                      value={outletElev}
                      onChange={(event) => setOutletElev(event.target.value)}
                      inputMode="decimal"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: FAINT }}>
                    {U.siteHousingDist}
                    {srcBadge("housingDist")}
                    <input
                      value={housingDist}
                      onChange={(event) => {
                        setHousingDist(event.target.value);
                        userEdited("housingDist");
                      }}
                      inputMode="decimal"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </label>
                </div>

                {siteMode === "unlimited" && (
                  <p style={{ fontSize: 11, color: "#6f8792", margin: "16px 0 0", lineHeight: 1.6 }}>
                    {U.siteUnlimitedNote}
                  </p>
                )}
              </div>
            </>
          )}

          {error && (
            <div style={{ color: "#ff8a80", fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              padding: "14px 34px", borderRadius: 10, border: 0, cursor: "pointer",
              background: ACCENT, color: "#06232e", fontSize: 16, fontWeight: 700,
            }}
          >
            {U.calcButton} →
          </button>
        </form>
      </div>
    </main>
  );
}

export default function IndustryPage() {
  return (
    <Suspense fallback={null}>
      <IndustryContent />
    </Suspense>
  );
}
