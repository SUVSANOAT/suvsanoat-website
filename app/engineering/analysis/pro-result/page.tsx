"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateOpex } from "../../../../calculations/opex";
import { buildPid } from "../../../../calculations/pid";
import { calculateReagents } from "../../../../calculations/reagents";
import { checkOutage, groupsFromChain } from "../../../../calculations/outage";
import { checkStructure } from "../../../../calculations/structural";
import { calculateHvac, roomsFromChain } from "../../../../calculations/hvac";
import { pidSheet } from "../../../../drawings/site/pid";

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
import { L, t, tempRegimeLine, tempWinterWarning, ui } from "../industry/i18n";
import type { L10n, UiStrings } from "../industry/i18n";
import type { Language } from "../../../translations";
import { useLanguage } from "../../../LanguageContext";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import {
  SCALE_LABEL,
  TECHNOLOGY_CHOICES,
  TECHNOLOGY_DESCRIPTION,
  TECHNOLOGY_LABEL,
  commonEquipment,
  equipmentFor,
  isAnaerobicTechnology,
  peakHourly,
  scaleOf,
  technologySourceNote,
  technologyWarnings,
  type Ctx,
  type Item,
} from "../industry/equipment";
import { calculateTechnology, type TechnologyCode } from "../../../../calculations/technology";
import {
  AEROTANK,
  BOD5_TO_BODFULL,
  DISINFECTION,
  GRIT,
  KMK_2_04_03_19_DOC,
  sanitaryZone,
  type SzzResult,
} from "../../../../norms/kmk-2-04-03-19";
import {
  MBR_REPLACES_SECONDARY_CLARIFIER,
  MEMBRANE_REQUIRED_BY_DEFAULT,
  REQUIRED_TECHNOLOGY,
  membraneWarnings,
  requirementNote,
  requirementRef,
} from "../../../../norms/uz-membrane-requirement";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../../../lib/assumptions";
import {
  areaEstimate,
  civilItems,
  civilWorks,
  pipeSizing,
  powerEstimate,
} from "../industry/construction";
import { buildModels } from "../../../../drawings/package/build";
import type { DrawingInput, SiteInput } from "../../../../drawings/core/types";
import { layoutSite, requiredArea } from "../../../../drawings/site/layout";
import { downloadDxf, printDxf } from "./dxf";
import { buildModelsDxf, buildSchemeDxf, type SchemeInput } from "./pro-drawings";
import { buildTemplateNote, kmkClausesFor, kmkDocLine, type NoteInput } from "./note-template";
import NoteView from "./NoteView";

/* ==================================================================
 * ПРОИЗВОДСТВЕННЫЙ РАСЧЁТ: ЦЕПОЧКА ОЧИСТКИ И ПОДБОР ОБОРУДОВАНИЯ
 *
 * Все числа считаются здесь, детерминированно, по ҚМҚ 2.04.03-19
 * (нормативные величины — из norms/kmk-2-04-03-19.ts с номерами
 * пунктов) и DWA-A 131. Страница печатается в PDF кнопкой
 * браузера (print-стили ниже). DXF и ИИ-записка — отдельные кнопки.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const KEY_ORDER: PollutantKey[] = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf"];

/* ------------------------------------------------------------------
 * ТЕХНОЛОГИЯ БИОБЛОКА ИЗ URL (?tech=CAS|MBBR|IFAS|SBR|MBR|UASB|ABR|AnMBR)
 * Отсутствует или auto — автоподбор по расходу и нагрузке, как раньше.
 * ------------------------------------------------------------------ */

function parseTech(raw: string | null): TechnologyCode | null {
  const v = (raw || "").trim().toLowerCase();
  if (!v || v === "auto") return null;
  return TECHNOLOGY_CHOICES.find((code) => code.toLowerCase() === v) ?? null;
}

/* локальные строки страницы: i18n.ts правится параллельно, поэтому новые
   ключи держим здесь, тем же приёмом, что SCALE_LABEL в equipment.ts */
const TX = {
  techTitle: L("Технология биологической очистки", "Biologik tozalash texnologiyasi", "Biological treatment technology", "生物处理工艺"),
  techByEngineer: L("выбрана инженером", "muhandis tanlagan", "selected by the engineer", "由工程师选定"),
  techByAuto: L("автоподбор по расходу и нагрузке", "sarf va yuklama bo‘yicha avtotanlov", "auto-selected by flow and load", "按流量与负荷自动选取"),
  techAuto: L(
    "Технология биоблока не задана — принят автоподбор: объём по объёмной нагрузке БПК, воздух по ф. (70) п. 6.156, в блочном исполнении — полное окисление (пп. 6.175–6.179).",
    "Bioblok texnologiyasi berilmagan — avtotanlov qabul qilindi: hajm BPK bo‘yicha hajmiy yuklamadan, havo (70)-formula 6.156-band bo‘yicha, blokli bajarilishda — to‘liq oksidlanish (6.175–6.179-bandlar).",
    "No bio-block technology was set, so automatic selection applies: volume from the volumetric BOD load, air by formula (70) cl. 6.156, and full oxidation (cl. 6.175–6.179) for packaged units.",
    "未指定生物段工艺，采用自动选型：容积按 BOD 容积负荷，供气按 6.156 条式(70)，一体化设备按完全氧化（6.175–6.179 条）。"
  ),
  techWarnings: L("Проверьте применимость", "Qo‘llanilishini tekshiring", "Check the applicability", "请复核适用性"),
  /* --- обязательная мембранная очистка: формулировка только из
     norms/uz-membrane-requirement.ts, реквизиты документа не пишем --- */
  techByRequirement: L(
    "принята по требованию, не выбрана инженером",
    "talab bo‘yicha qabul qilingan, muhandis tanlamagan",
    "adopted to satisfy the requirement, not selected by the engineer",
    "按强制要求采用，非工程师选定"
  ),
  membraneTitle: L(
    "ОБЯЗАТЕЛЬНАЯ МЕМБРАННАЯ ОЧИСТКА",
    "MAJBURIY MEMBRANALI TOZALASH",
    "MANDATORY MEMBRANE TREATMENT",
    "强制膜法处理"
  ),
  membraneWaiverTitle: L(
    "ОТСТУПЛЕНИЕ ОТ ТРЕБОВАНИЯ",
    "TALABDAN CHEKINISH",
    "DEVIATION FROM THE REQUIREMENT",
    "偏离该要求"
  ),
  membraneChecks: L(
    "Проверки стока перед мембранами",
    "Membranalardan oldin oqovani tekshirish",
    "Wastewater checks ahead of the membranes",
    "膜前进水核查"
  ),
  clarifyDroppedTitle: L(
    "Вторичный отстойник исключён из схемы",
    "Ikkilamchi tindirgich sxemadan chiqarildi",
    "The secondary clarifier is removed from the train",
    "流程中已取消二沉池"
  ),
  clarifyDroppedMbr: L(
    "Ступень вторичного отстаивания из цепочки исключена: разделение иловой смеси идёт на мембране внутри биореактора, отдельный вторичный отстойник не нужен и не проектируется.",
    "Ikkilamchi tindirish bosqichi zanjirdan chiqarildi: loyqa aralashmasini ajratish bioreaktor ichidagi membranada amalga oshadi, alohida ikkilamchi tindirgich kerak emas.",
    "The secondary clarification stage is dropped: the mixed liquor is separated on the membrane inside the bioreactor, so a separate secondary clarifier is neither required nor designed.",
    "取消二沉段：泥水分离在生物反应器内的膜上完成，无需单独设置二沉池。"
  ),
  clarifyDroppedSbr: L(
    "Ступень вторичного отстаивания из цепочки исключена: в SBR отстаивание и выпуск идут в том же реакторе по фазам цикла, отдельный вторичный отстойник не нужен.",
    "Ikkilamchi tindirish bosqichi chiqarildi: SBR da tindirish va chiqarish sikl fazalari bo‘yicha shu reaktorning o‘zida bo‘ladi, alohida tindirgich kerak emas.",
    "The secondary clarification stage is dropped: in an SBR, settling and decanting take place in the same reactor as cycle phases, so no separate clarifier is needed.",
    "取消二沉段：SBR 的沉淀与排水在同一反应池内按周期完成，无需单独二沉池。"
  ),
  techNoAir: L(
    "Аэрация не требуется: процесс анаэробный, воздуходувная станция в составе сооружений не предусмотрена.",
    "Aeratsiya talab qilinmaydi: jarayon anaerob, havo puflagich stansiyasi ko‘zda tutilmagan.",
    "No aeration required: the process is anaerobic and no blower station is included.",
    "无需曝气：厌氧工艺，不设鼓风机房。"
  ),

  /* --- карточка «Технология биоблока»: фраза про принятые величины
     собирается из кусков, чтобы числа остались выделенными жирным --- */
  bioFiguresPre: L("Объём биоблока ", "Bioblok hajmi ", "The bio-block volume ", "生物段容积 "),
  bioFiguresMid: L(" м³ и ", " m³ va ", " m³ and ", " m³ 与 "),
  bioFiguresAir: L("расход воздуха ", "havo sarfi ", "the air flow ", "供气量 "),
  bioFiguresAirUnit: L(" Нм³/ч", " Nm³/soat", " Nm³/h", " Nm³/h"),
  bioFiguresTail: L(
    " приняты по расчёту выбранной технологии; на эти величины опираются спецификация, объёмы строительных работ, трубопроводы, площадь и электрика.",
    " tanlangan texnologiya hisobi bo‘yicha qabul qilindi; spetsifikatsiya, qurilish ishlari hajmi, quvurlar, maydon va elektr qismi shu kattaliklarga tayanadi.",
    " are taken from the calculation of the selected technology; the equipment schedule, the civil work volumes, the pipework, the area and the electrical part all rely on these figures.",
    " 按所选工艺的计算确定；设备清单、土建工程量、管道、占地与电气均以此为依据。"
  ),

  /* --- сноска об источниках под особенностями отрасли --- */
  sourcesNotNormed: L(
    "(справочно, ҚМҚ не нормируются)",
    "(ma’lumot uchun, ҚМҚ me’yorlamaydi)",
    "(for reference; not codified by ҚМҚ)",
    "（供参考，ҚМҚ 未作规定）"
  ),

  /* --- отказы при скачивании документов --- */
  fileFailed: L(
    "Не удалось собрать документ. Попробуйте ещё раз.",
    "Hujjatni tayyorlab bo‘lmadi. Qayta urinib ko‘ring.",
    "The document could not be assembled. Please try again.",
    "文件生成失败，请重试。"
  ),
  fileNoServer: L(
    "Нет связи с сервером.",
    "Server bilan aloqa yo‘q.",
    "No connection to the server.",
    "无法连接服务器。"
  ),

  /* --- записка собрана по шаблону, а не ИИ --- */
  noteFallbackPre: L("ИИ сейчас недоступен", "SI hozir mavjud emas", "The AI is currently unavailable", "AI 当前不可用"),
  noteFallbackTail: L(
    " — записка собрана по шаблону из тех же расчётных данных.",
    " — izohnoma shu hisob ma’lumotlari asosida shablon bo‘yicha tuzildi.",
    " — the note has been assembled from a template using the same calculation data.",
    " —— 说明书已依据相同计算数据按模板生成。"
  ),
} satisfies Record<string, L10n>;

/* ------------------------------------------------------------------
 * ПОЯСНЕНИЯ К СТУПЕНЯМ ОЧИСТКИ НА ЧЕТЫРЁХ ЯЗЫКАХ
 *
 * Строки привязаны к расчёту именно этой страницы, поэтому лежат
 * здесь, а не в i18n.ts. Числа приходят уже отформатированными:
 * порядок слов в узбекском и китайском другой, и шаблон для каждого
 * языка пишется отдельно, а не собирается склейкой.
 *
 * Ссылки на нормы (${…}.ref, «п.», «ф.») — цитаты ҚМҚ 2.04.03-19:
 * номера не меняются, переводится только словесная обёртка.
 * ------------------------------------------------------------------ */
const M = {
  parallelLines: (count: number) =>
    L(
      `${count} параллельных линии`,
      `${count} ta parallel liniya`,
      `${count} parallel lines`,
      `${count} 条并联系列`
    ),

  bioVolumeByLoad: (byLoad: string, byHrt: string, taken: string) =>
    L(
      `Объём биоблока определён органической нагрузкой: ${byLoad} м³ против ${byHrt} м³ по времени пребывания с запасом. В расчёт принят больший — ${taken} м³.`,
      `Bioblok hajmi organik yuklama bilan aniqlandi: ${byLoad} m³, zaxira bilan olingan bo‘lish vaqti bo‘yicha esa ${byHrt} m³. Hisobga kattarog‘i — ${taken} m³ qabul qilindi.`,
      `The bio-block volume is governed by the organic load: ${byLoad} m³ against ${byHrt} m³ from the retention time with reserve. The larger value is taken — ${taken} m³.`,
      `生物段容积由有机负荷控制：${byLoad} m³，而按含富余量的停留时间计为 ${byHrt} m³。计算取较大者 —— ${taken} m³。`
    ),

  /* --- решётка --- */
  screen: (qh: string, qls: string, qMax: string, kMax: string, src: string) =>
    L(
      `Средний расход рабочего периода ${qh} м³/ч (${qls} л/с); максимальный приток ${qMax} м³/ч при K_gen.max = ${kMax} (${src}); прозор решётки 1–6 мм по составу отбросов.`,
      `Ish davridagi o‘rtacha sarf ${qh} m³/soat (${qls} l/s); maksimal oqim ${qMax} m³/soat, K_gen.max = ${kMax} (${src}); panjara tirqishi chiqindi tarkibiga qarab 1–6 mm.`,
      `Average flow over the operating period ${qh} m³/h (${qls} L/s); peak inflow ${qMax} m³/h at K_gen.max = ${kMax} (${src}); screen openings 1–6 mm depending on the screenings.`,
      `运行时段平均流量 ${qh} m³/h（${qls} L/s）；最大进水 ${qMax} m³/h，K_gen.max = ${kMax}（${src}）；格栅缝隙按栅渣性质取 1–6 mm。`
    ),

  /* --- усреднитель --- */
  avgVolume: (v: string, h: string) =>
    L(
      `Объём усреднения ≈ ${v} м³ (${h} часов среднего притока).`,
      `O‘rtachalashtirish hajmi ≈ ${v} m³ (${h} soatlik o‘rtacha oqim).`,
      `Equalisation volume ≈ ${v} m³ (${h} hours of average inflow).`,
      `均质调节容积 ≈ ${v} m³（${h} 小时平均进水量）。`
    ),
  avgMixing: L(
    "Перемешивание — эрлифт/мешалка против осаждения; для pH-нестабильных стоков здесь же коррекция.",
    "Aralashtirish — cho‘kishga qarshi erlift yoki mikser; pH beqaror oqovalar uchun pH tuzatish ham shu yerda.",
    "Mixing by air lift or submersible mixer prevents settling; for pH-unstable wastewater the pH correction is done here as well.",
    "采用空气提升或潜水搅拌防止沉积；pH 波动较大的废水在此同时进行 pH 调节。"
  ),

  /* --- жироуловитель --- */
  greaseBelow: (limit: number) =>
    L(
      `Жиры ниже ${limit} мг/л — отдельный жироуловитель не обязателен, контроль на усреднителе.`,
      `Yog‘lar ${limit} mg/l dan past — alohida yog‘ tutgich shart emas, nazorat tenglashtirgichda olib boriladi.`,
      `Fats are below ${limit} mg/L — a separate grease trap is not mandatory; control is done at the equalisation tank.`,
      `油脂低于 ${limit} mg/L —— 可不设单独隔油池，在调节池处监控。`
    ),
  grease: (qh: string, fats: string, limit: number) =>
    L(
      `Расход ${qh} м³/ч; жиры ${fats} → цель ≤${limit} мг/л перед биологией.`,
      `Sarf ${qh} m³/soat; yog‘lar ${fats} → biologiyadan oldin maqsad ≤${limit} mg/l.`,
      `Flow ${qh} m³/h; fats ${fats} → target ≤${limit} mg/L ahead of the biology.`,
      `流量 ${qh} m³/h；油脂 ${fats} → 生物段前目标 ≤${limit} mg/L。`
    ),

  /* --- песколовка --- */
  sand: (qls: string, size: number, ref: string, qLimit: number, units: number, unitsRef: string) =>
    L(
      `Расход ${qls} л/с; задержание частиц от ${size} мм (${ref}); при Q > ${qLimit} м³/сут — не менее ${units} отделений (${unitsRef}).`,
      `Sarf ${qls} l/s; ${size} mm dan yirik zarralarni ushlab qolish (${ref}); Q > ${qLimit} m³/kun bo‘lganda — kamida ${units} ta bo‘lim (${unitsRef}).`,
      `Flow ${qls} L/s; retention of particles from ${size} mm (${ref}); at Q > ${qLimit} m³/day at least ${units} compartments are required (${unitsRef}).`,
      `流量 ${qls} L/s；拦截粒径 ${size} mm 以上颗粒（${ref}）；当 Q > ${qLimit} m³/日 时不少于 ${units} 格（${unitsRef}）。`
    ),

  /* --- нефтеуловитель --- */
  oil: (qls: string, petro: string) =>
    L(
      `Расход ${qls} л/с; нефтепродукты ${petro} → 0,3 мг/л с фильтром доочистки.`,
      `Sarf ${qls} l/s; neft mahsulotlari ${petro} → qo‘shimcha tozalash filtri bilan 0,3 mg/l gacha.`,
      `Flow ${qls} L/s; petroleum products ${petro} → 0.3 mg/L with a polishing filter.`,
      `流量 ${qls} L/s；石油类 ${petro} → 配深度处理过滤器可达 0.3 mg/L。`
    ),

  /* --- нейтрализация --- */
  phAcid: (ph: string) =>
    L(
      `pH ${ph} — дозирование кислоты до 6,5–8,5.`,
      `pH ${ph} — 6,5–8,5 gacha kislota dozalash.`,
      `pH ${ph} — acid dosing down to 6.5–8.5.`,
      `pH ${ph} —— 投加酸调至 6.5–8.5。`
    ),
  phAlkali: (ph: string) =>
    L(
      `pH ${ph} — дозирование щёлочи до 6,5–8,5.`,
      `pH ${ph} — 6,5–8,5 gacha ishqor dozalash.`,
      `pH ${ph} — alkali dosing up to 6.5–8.5.`,
      `pH ${ph} —— 投加碱调至 6.5–8.5。`
    ),
  phOk: (ph: string) =>
    L(
      `pH ${ph} в норме — станция дозирования в резерве на залповые сбросы.`,
      `pH ${ph} me’yorda — dozalash stansiyasi zalvorli chiqindilar uchun zaxirada.`,
      `pH ${ph} is within limits — the dosing station is kept in reserve for shock discharges.`,
      `pH ${ph} 在正常范围 —— 加药装置作为冲击负荷时的备用。`
    ),

  /* --- реагентная обработка --- */
  physchem: (coagDose: number, coagKgDay: string, flocDose: number) =>
    L(
      `Реагентная обработка: коагулянт ~${coagDose} г/м³ (${coagKgDay} кг/сут), флокулянт ${flocDose} г/м³. Дозы уточняются пробным коагулированием.`,
      `Reagentli ishlov berish: koagulyant ~${coagDose} g/m³ (${coagKgDay} kg/kun), flokulyant ${flocDose} g/m³. Dozalar sinov koagulyatsiyasi bilan aniqlanadi.`,
      `Chemical treatment: coagulant ~${coagDose} g/m³ (${coagKgDay} kg/day), flocculant ${flocDose} g/m³. The doses are confirmed by jar tests.`,
      `化学混凝处理：混凝剂约 ${coagDose} g/m³（${coagKgDay} kg/日），助凝剂 ${flocDose} g/m³。投加量经烧杯试验确定。`
    ),
  physchemReactor: L(
    "реактор смешения-хлопьеобразования",
    "aralashtirish va parcha hosil qilish reaktori",
    "rapid-mix and flocculation reactor",
    "混合絮凝反应池"
  ),

  /* --- флотация --- */
  daf: (load: number, area: string, recycle: number) =>
    L(
      `Напорная флотация: гидравлическая нагрузка ${load} м³/м²·ч → площадь ≈ ${area} м²; рециркуляция ${recycle} %.`,
      `Bosimli flotatsiya: gidravlik yuklama ${load} m³/m²·soat → maydon ≈ ${area} m²; retsirkulyatsiya ${recycle} %.`,
      `Dissolved air flotation: hydraulic loading ${load} m³/m²·h → area ≈ ${area} m²; recycle ratio ${recycle} %.`,
      `加压溶气气浮：水力负荷 ${load} m³/m²·h → 面积 ≈ ${area} m²；回流比 ${recycle} %。`
    ),

  /* --- биологическая очистка --- */
  techByRequirementLine: (label: string, description: string) =>
    L(
      `Технология принята по требованию: ${label}. ${description}`,
      `Texnologiya talab bo‘yicha qabul qilindi: ${label}. ${description}`,
      `The technology is adopted to satisfy the requirement: ${label}. ${description}`,
      `按强制要求采用该工艺：${label}。${description}`
    ),
  techByEngineerLine: (label: string, description: string) =>
    L(
      `Технология принята инженером: ${label}. ${description}`,
      `Texnologiyani muhandis tanladi: ${label}. ${description}`,
      `The technology is selected by the engineer: ${label}. ${description}`,
      `该工艺由工程师选定：${label}。${description}`
    ),
  bioLoads: (bod: string, cod: string, qWork: string, qPeak: string) =>
    L(
      `Нагрузка ${bod} кг БПК₅/сут и ${cod} кг ХПК/сут; расчётный расход ${qWork} м³/ч в рабочее время, максимальный часовой ${qPeak} м³/ч.`,
      `Yuklama ${bod} kg BPK₅/kun va ${cod} kg KKT/kun; hisobiy sarf ish vaqtida ${qWork} m³/soat, maksimal soatlik ${qPeak} m³/soat.`,
      `Load ${bod} kg BOD₅/day and ${cod} kg COD/day; design flow ${qWork} m³/h during operating hours, peak hourly ${qPeak} m³/h.`,
      `负荷 ${bod} kg BOD₅/日、${cod} kg COD/日；运行时段计算流量 ${qWork} m³/h，最大时流量 ${qPeak} m³/h。`
    ),
  bioHydraulic: (hrt: number, volume: string, withReserve: string) =>
    L(
      `Гидравлический объём при HRT ${hrt} ч — ${volume} м³; принято с запасом +15 % → ${withReserve} м³.`,
      `HRT ${hrt} soat bo‘lganda gidravlik hajm — ${volume} m³; +15 % zaxira bilan ${withReserve} m³ qabul qilindi.`,
      `Hydraulic volume at an HRT of ${hrt} h — ${volume} m³; taken with a +15 % reserve → ${withReserve} m³.`,
      `HRT ${hrt} h 时水力容积为 ${volume} m³；计入 +15 % 富余量后取 ${withReserve} m³。`
    ),
  bioMetrics: (list: string) =>
    L(
      `Расчёт технологии: ${list}.`,
      `Texnologiya hisobi: ${list}.`,
      `Technology calculation: ${list}.`,
      `工艺计算：${list}。`
    ),
  bioAirNm3: (perHour: string, perDay: string, ref: string) =>
    L(
      `Воздух на аэрацию ≈ ${perHour} Нм³/ч (${perDay} Нм³/сут) — по ф. (70) ${ref}.`,
      `Aeratsiya uchun havo ≈ ${perHour} Nm³/soat (${perDay} Nm³/kun) — (70)-formula bo‘yicha ${ref}.`,
      `Aeration air ≈ ${perHour} Nm³/h (${perDay} Nm³/day) — per eq. (70) ${ref}.`,
      `曝气空气量 ≈ ${perHour} Nm³/h（${perDay} Nm³/日）—— 按式(70) ${ref}。`
    ),
  bioNitroDenitro: (tn: string, share: number) =>
    L(
      `Азот ${tn} мг/л — схема с нитри-денитрификацией (аноксидная зона ~${share} % объёма).`,
      `Azot ${tn} mg/l — nitri-denitrifikatsiyali sxema (anoksid zona hajmning ~${share} % i).`,
      `Nitrogen ${tn} mg/L — a nitrification–denitrification scheme (anoxic zone ~${share} % of the volume).`,
      `氮 ${tn} mg/L —— 采用硝化反硝化流程（缺氧区约占容积 ${share} %）。`
    ),
  bioNitroModerate: L(
    "Азот умеренный — классическая аэрация.",
    "Azot mo‘tadil — klassik aeratsiya.",
    "Nitrogen is moderate — conventional aeration.",
    "氮浓度适中 —— 采用常规曝气。"
  ),
  bioAutoVolume: (
    bodLoad: string,
    bodFull: string,
    volLoad: number,
    rho: number,
    dose: string,
    ref: string,
    volume: string
  ) =>
    L(
      `Нагрузка ${bodLoad} кг БПК₅/сут (${bodFull} кг БПКполн/сут); объёмная нагрузка ${volLoad} кг/м³·сут (продлённая аэрация: ρ = ${rho} мг/(г·ч), доза ила ${dose} г/л, ${ref}) → объём биоблока ≈ ${volume} м³.`,
      `Yuklama ${bodLoad} kg BPK₅/kun (${bodFull} kg to‘liq BPK/kun); hajmiy yuklama ${volLoad} kg/m³·kun (uzaytirilgan aeratsiya: ρ = ${rho} mg/(g·soat), loyqa dozasi ${dose} g/l, ${ref}) → bioblok hajmi ≈ ${volume} m³.`,
      `Load ${bodLoad} kg BOD₅/day (${bodFull} kg total BOD/day); volumetric load ${volLoad} kg/m³·day (extended aeration: ρ = ${rho} mg/(g·h), MLSS ${dose} g/L, ${ref}) → bio-block volume ≈ ${volume} m³.`,
      `负荷 ${bodLoad} kg BOD₅/日（${bodFull} kg 完全BOD/日）；容积负荷 ${volLoad} kg/m³·日（延时曝气：ρ = ${rho} mg/(g·h)，污泥浓度 ${dose} g/L，${ref}）→ 生物段容积 ≈ ${volume} m³。`
    ),
  bioAutoAir: (perDay: string, perHour: string, ref: string) =>
    L(
      `Воздух на аэрацию ≈ ${perDay} м³/сут (${perHour} м³/ч) — удельный расход по ф. (70) ${ref}.`,
      `Aeratsiya uchun havo ≈ ${perDay} m³/kun (${perHour} m³/soat) — solishtirma sarf (70)-formula bo‘yicha ${ref}.`,
      `Aeration air ≈ ${perDay} m³/day (${perHour} m³/h) — specific demand per eq. (70) ${ref}.`,
      `曝气空气量 ≈ ${perDay} m³/日（${perHour} m³/h）—— 单位需气量按式(70) ${ref}。`
    ),
  bioEquivalent: (qEq: string) =>
    L(
      `эквивалент ${qEq} м³/сут по хозбытовому стоку`,
      `maishiy oqova bo‘yicha ekvivalent ${qEq} m³/kun`,
      `equivalent to ${qEq} m³/day of domestic wastewater`,
      `折合生活污水 ${qEq} m³/日`
    ),

  /* --- вторичное отстаивание --- */
  clarify: L(
    "Вторичное отстаивание в составе блока биологической очистки (тонкослойные модули).",
    "Ikkilamchi tindirish biologik tozalash bloki tarkibida (yupqa qatlamli modullar).",
    "Secondary clarification is integrated into the biological block (lamella modules).",
    "二沉设于生物处理单元内（斜板模块）。"
  ),

  /* --- доочистка --- */
  post: (qh: string, rate: number) =>
    L(
      `Фильтр доочистки на ${qh} м³/ч при скорости ${rate} м/ч — до нормативов сброса/оборота.`,
      `Qo‘shimcha tozalash filtri ${qh} m³/soat ga, filtrlash tezligi ${rate} m/soat — chiqindi yoki qayta foydalanish me’yorlarigacha.`,
      `Polishing filter for ${qh} m³/h at a filtration rate of ${rate} m/h — down to the discharge or reuse limits.`,
      `深度处理过滤器按 ${qh} m³/h 设计，滤速 ${rate} m/h —— 出水达到排放或回用标准。`
    ),

  /* --- обеззараживание --- */
  chlorBasisHospital: L(
    "санитарные требования для медицинских объектов",
    "tibbiyot obyektlari uchun sanitariya talablari",
    "sanitary requirements for medical facilities",
    "医疗机构卫生要求"
  ),
  chlorBasisBio: (afterBio: number, ref: string) =>
    L(
      `${afterBio} г/м³ после биологической очистки, ${ref}`,
      `biologik tozalashdan keyin ${afterBio} g/m³, ${ref}`,
      `${afterBio} g/m³ after biological treatment, ${ref}`,
      `生物处理后 ${afterBio} g/m³，${ref}`
    ),
  disinfect: (
    dose: number,
    basis: string,
    perHour: string,
    storeK: number,
    storePerHour: string,
    contact: number,
    contactRef: string
  ) =>
    L(
      `Доза активного хлора ${dose} г/м³ (${basis}) → ${perHour} г/ч; хлорное хозяйство на ×${storeK} — ${storePerHour} г/ч (п. 6.230); контакт ${contact} мин (${contactRef}).`,
      `Faol xlor dozasi ${dose} g/m³ (${basis}) → ${perHour} g/soat; xlor xo‘jaligi ×${storeK} zaxira bilan — ${storePerHour} g/soat (6.230-band); kontakt vaqti ${contact} min (${contactRef}).`,
      `Active chlorine dose ${dose} g/m³ (${basis}) → ${perHour} g/h; the chlorination facility is sized ×${storeK} — ${storePerHour} g/h (cl. 6.230); contact time ${contact} min (${contactRef}).`,
      `有效氯投加量 ${dose} g/m³（${basis}）→ ${perHour} g/h；加氯间按 ×${storeK} 配置 —— ${storePerHour} g/h（第 6.230 条）；接触时间 ${contact} min（${contactRef}）。`
    ),

  /* --- обработка осадка --- */
  sludge: (dry: string, volume: string, ds: number) =>
    L(
      `Осадок ≈ ${dry} кг сухого вещества/сут (~${volume} м³/сут при ${ds} % СВ) — уплотнение и обезвоживание.`,
      `Cho‘kindi ≈ ${dry} kg quruq modda/kun (${ds} % QM da ~${volume} m³/kun) — quyuqlashtirish va suvsizlantirish.`,
      `Sludge ≈ ${dry} kg dry solids/day (~${volume} m³/day at ${ds} % DS) — thickening and dewatering.`,
      `污泥量 ≈ ${dry} kg 干固体/日（含固率 ${ds} % 时约 ${volume} m³/日）—— 浓缩与脱水。`
    ),
  sludgeThickener: (days: number) =>
    L(
      `илоуплотнитель на ${days} сут`,
      `${days} sutkaga mo‘ljallangan loyqa quyuqlashtirgich`,
      `sludge thickener for ${days} days`,
      `按 ${days} 天设计的污泥浓缩池`
    ),

  /* --- источник данных для записки при автоподборе --- */
  autoSource: (extendedRef: string, airRef: string) =>
    L(
      `Автоподбор; ${extendedRef} и ф. (70) ${airRef}.`,
      `Avtotanlov; ${extendedRef} va (70)-formula ${airRef}.`,
      `Automatic selection; ${extendedRef} and eq. (70) ${airRef}.`,
      `自动选型；${extendedRef} 与式(70) ${airRef}。`
    ),

  /* --- строительная часть: как получены габариты ёмкостей --- */
  civilCover: (thickness: number) =>
    L(`, перекрытия ${thickness} мм`, `, yopma ${thickness} mm`, `, cover slab ${thickness} mm`, `，顶板 ${thickness} mm`),
  civilNoCover: L(
    " (сооружения открытые)",
    " (inshootlar ochiq)",
    " (the structures are open-top)",
    "（构筑物为敞开式）"
  ),
  civilBasins: (depth: number, ratio: number, freeboard: number, wall: number, slab: number, cover: string) =>
    L(
      `Размеры получены от расчётного объёма при рабочей глубине ${depth} м и соотношении сторон ${ratio} : 1; борт ${freeboard} м. Объёмы бетона — по толщинам стен ${wall} мм, днища ${slab} мм${cover}.`,
      `O‘lchamlar hisobiy hajmdan olingan: ishchi chuqurlik ${depth} m, tomonlar nisbati ${ratio} : 1; bort ${freeboard} m. Beton hajmlari devor qalinligi ${wall} mm, tub ${slab} mm${cover} bo‘yicha olingan.`,
      `The dimensions follow from the design volume at a working depth of ${depth} m and a side ratio of ${ratio} : 1; freeboard ${freeboard} m. Concrete volumes are based on a wall thickness of ${wall} mm, a base slab of ${slab} mm${cover}.`,
      `尺寸由计算容积按有效水深 ${depth} m、边长比 ${ratio} : 1 推得；超高 ${freeboard} m。混凝土工程量按墙厚 ${wall} mm、底板 ${slab} mm${cover} 计算。`
    ),
};

/* ------------------------------------------------------------------
 * УЧАСТОК ИЗ URL
 *
 * Анкета передаёт либо прямоугольник (siteW × siteL), либо контур
 * точками «x y», разделёнными «;». Стороны света и отметки —
 * необязательные привязки, они уточняют компоновку и профиль.
 * ------------------------------------------------------------------ */

function numParam(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const v = parseFloat(raw.replace(",", "."));
  return Number.isFinite(v) ? v : undefined;
}

function sideParam(raw: string | null): "N" | "S" | "E" | "W" | undefined {
  return raw === "N" || raw === "S" || raw === "E" || raw === "W" ? raw : undefined;
}

function parseSitePolygon(poly: string | null, w: string | null, l: string | null): [number, number][] {
  if (poly) {
    const out: [number, number][] = [];
    for (const part of poly.split(";")) {
      const [x, y] = part.trim().replace(/,/g, ".").split(/\s+/);
      const xv = parseFloat(x);
      const yv = parseFloat(y);
      if (Number.isFinite(xv) && Number.isFinite(yv)) out.push([xv, yv]);
    }
    if (out.length >= 3) return out;
  }
  const wv = numParam(w);
  const lv = numParam(l);
  if (wv && lv && wv > 0 && lv > 0) return [[0, 0], [lv, 0], [lv, wv], [0, wv]];
  return [];
}

/** имя файла из заголовка Content-Disposition */
function filenameFrom(header: string | null): string {
  const m = header?.match(/filename="?([^";]+)"?/);
  return m ? m[1] : "";
}

/** счёт-оферта в том виде, в каком его отдаёт /api/drawings (lib/orders.ts) */
type InvoiceView = {
  invoiceNo: string;
  amount: number;
  currency: string;
  object: string;
  q: number;
  status: string;
  payee: { name: string; inn: string; bank: string; account: string; mfo: string; contact: string };
  cardEnabled: boolean;
  lines: string[];
};

/* целевые показатели берутся из точки сброса (industry/targets.ts);
   значения из ТУ/НДС, введённые проектировщиком, имеют приоритет */

type Pick = {
  count: number;
  model: Model;
  note?: string;
};

/** подбор модели линейки по требуемому значению поля */
function pickModel(line: string, field: keyof Model, need: number, lang: Language): Pick | null {
  const list = MODELS
    .filter((m) => m.line === line && typeof m[field] === "number")
    .sort((a, b) => (a[field] as number) - (b[field] as number));
  if (!list.length || need <= 0) return null;

  const fit = list.find((m) => (m[field] as number) >= need);
  if (fit) return { count: 1, model: fit };

  const top = list[list.length - 1];
  const count = Math.ceil(need / (top[field] as number));
  return { count, model: top, note: t(M.parallelLines(count), lang) };
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

const SUPPLY_COLOR: Record<Item["supply"], string> = {
  own: "#9ccc65",
  either: "#ffd54f",
  supply: "#8fa6b1",
};

function supplyText(supply: Item["supply"], U: UiStrings): string {
  return supply === "own" ? U.supplyOwn : supply === "either" ? U.supplyEither : U.supplySupply;
}

function kindText(kind: Item["kind"], U: UiStrings): string {
  return kind === "structure" ? U.kindStructure : kind === "machine" ? U.kindMachine : U.kindInstrument;
}

function ItemTable({ items, U }: { items: Item[]; U: UiStrings }) {
  if (!items.length) return null;
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead>
          <tr>
            {[U.colItem, U.colSpec, U.colQty, U.colSupply].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>
                <b>{it.name}</b>
                <div style={{ color: FAINT, fontSize: 11 }}>{kindText(it.kind, U)}</div>
                {it.note && <div style={{ color: FAINT, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{it.note}</div>}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", lineHeight: 1.5 }}>
                {it.spec}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                {it.qty}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: SUPPLY_COLOR[it.supply], whiteSpace: "nowrap" }}>
                {supplyText(it.supply, U)}
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
  const U = useMemo(() => ui(language), [language]);
  const router = useRouter();
  const sp = useSearchParams();
  const a = useAssumptions();

  const industry = findIndustry(sp.get("industry") || "");
  const lab = sp.get("lab") === "1";
  const object = sp.get("object") || "";
  const Q = parseFloat(sp.get("flow") || "0") || 0;
  const hours = Math.min(24, Math.max(1, parseFloat(sp.get("hours") || "16") || 16));
  const ph = parseFloat(sp.get("ph") || "7") || 7;

  /* Отметка грунтовых вод. Умолчания у неё нет и быть не может: она
     берётся из изысканий, а не из здравого смысла. Пустое поле честнее
     любого числа — расчёт всплытия тогда прямо пишет, что не выполнен,
     и это лучше, чем «проходит» при выдуманном УГВ 5 м. */
  const [gwl, setGwl] = useState<string>("");
  const [tOut, setTOut] = useState<string>("-12");

  /* Расчётная температура сточной воды из анкеты. Два разных числа:
     среднегодовая задаёт объём биологии (время аэрации по ф. (51)/(54)
     дано для 15 °C, поправка 15/T_w — п. 6.143 прим.), летняя задаёт
     воздух (K_T ф. (71) п. 6.156, растворимость O₂ табл. 44). Не
     переданы — calculateTechnology принимает 15 и 20 °C, то есть
     поведение прежних ссылок не меняется. */
  const tAnnualC = numParam(sp.get("tAnnual"));
  const tSummerC = numParam(sp.get("tSummer"));

  /* ---------- технология биоблока и требование мембранной очистки ----------
     Требование действует по умолчанию (norms/uz-membrane-requirement.ts).
     Инженер может снять его осознанно — тогда форма передаёт mbrWaiver=1
     вместе с выбранной не мембранной технологией. Если технология не
     передана вовсе, а требование действует, принимается MBR — но в
     интерфейсе это подписано как принятое по требованию, а не выбранное. */
  const techParam = parseTech(sp.get("tech"));
  const mbrWaiver = sp.get("mbrWaiver") === "1";
  /* требование касается только объектов с биологической ступенью */
  const bioInChain = industry ? industry.chain.includes("bio") : false;
  const membraneRequired = MEMBRANE_REQUIRED_BY_DEFAULT && !mbrWaiver && bioInChain;
  const techByRequirement = !techParam && membraneRequired;
  const tech: TechnologyCode | null = techParam ?? (membraneRequired ? REQUIRED_TECHNOLOGY : null);

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
    const tp = c.tp ?? 0;

    const bodLoad = (Q * bod) / 1000;           // кг БПК/сут
    const stages: StageCalc[] = [];

    /* ---------- технология биоблока ----------
       Если инженер выбрал технологию, объём и воздух берутся из
       calculations/technology.ts — того же модуля, что считал ветку
       «Начать анализ». Иначе остаётся прежний автоподбор. */
    const techResult = tech
      ? calculateTechnology({
          technology: tech,
          flowM3Day: Q,
          hoursPerDay: hours,
          bodMgL: bod,
          codMgL: cod,
          tssMgL: ss,
          nitrogenMgL: tn,
          phosphorusMgL: tp,
          waterTempAnnualC: tAnnualC,
          waterTempSummerC: tSummerC,
        })
      : null;
    const techAir = techResult?.specialized.find((m) => m.key === "air") ?? null;
    const techVolumeMetric = techResult?.specialized.find((m) => m.key === "volume") ?? null;

    /* величины, нужные библиотеке оборудования */
    const vAvg = (Q * (hours >= 20 ? a.avgHoursLong : a.avgHoursShort)) / 24;
    /*
     * Объём биоблока должен удовлетворять обоим условиям сразу: времени
     * пребывания (гидравлика) и органической нагрузке. Метрика "volume"
     * в calculations/technology.ts уже сама берёт максимум из гидравлического
     * объёма, объёма по органике и объёма по загрузке; сравниваем её с
     * гидравлическим объёмом с запасом и принимаем больший — занижать
     * определяющий объём нельзя.
     */
    const vBio = techResult
      ? Math.max(techResult.hydraulic.volumeWithReserve, techVolumeMetric?.value ?? 0)
      : bodLoad / a.bodVolLoad;
    /* воздух, Нм³/ч: у анаэробных технологий метрики air нет — аэрация не нужна */
    const airH = techResult ? (techAir?.value ?? 0) : (bodLoad * a.airPerBod) / 24;
    const dryKg = (Q * ss * a.sludgeFromSs) / 1000 + bodLoad * a.sludgeFromBod;
    const scale = scaleOf(Q, a);

    const ctx: Ctx = {
      Q, Qh, Qls, hours, scale,
      industryId: industry.id,
      dischargeId: discharge?.id ?? "sewer",
      bod, cod, ss, fats, petro, tn, bodLoad,
      vAvg, vBio, air: airH, dryKg, a, lang: language,
      tech: tech ?? undefined,
      techResult: techResult ?? undefined,
    };

    const techWarnings = technologyWarnings(ctx);
    if (techResult && techVolumeMetric && techVolumeMetric.value > techResult.hydraulic.volumeWithReserve) {
      techWarnings.unshift(
        t(
          M.bioVolumeByLoad(
            fmt(techVolumeMetric.value),
            fmt(techResult.hydraulic.volumeWithReserve),
            fmt(vBio)
          ),
          language
        )
      );
    }

    /* замечания по пригодности стока для мембран (жиры, нефтепродукты,
       тонкая решётка) — только при мембранной схеме */
    const membraneApplies = tech === "MBR" || tech === "AnMBR";
    const membraneNotes = membraneApplies
      ? membraneWarnings({ fats, petro, fatsLimit: a.greaseTarget })
      : [];

    /* ---------- цепочка ступеней ----------
       chainForDischarge (industry/targets.ts) собирает схему по точке
       сброса; здесь снимается вторичный отстойник там, где разделение
       иловой смеси идёт не в нём:
         MBR/AnMBR — на мембране внутри биореактора (MBR_REPLACES_SECONDARY_CLARIFIER);
         SBR — в том же реакторе по фазам цикла, и только если технология
         выбрана инженером явно (при автоподборе SBR не принимается). */
    let chain = chainForDischarge(industry.chain, discharge, industry.id);
    let clarifyDropped: "mbr" | "sbr" | null = null;
    if (chain.includes("clarify")) {
      if (membraneApplies && MBR_REPLACES_SECONDARY_CLARIFIER) clarifyDropped = "mbr";
      else if (techParam === "SBR") clarifyDropped = "sbr";
      if (clarifyDropped) chain = chain.filter((s) => s !== "clarify");
    }
    const clarifyDropText = clarifyDropped
      ? t(clarifyDropped === "mbr" ? TX.clarifyDroppedMbr : TX.clarifyDroppedSbr, language)
      : null;

    const peak = peakHourly({ Q, Qh, a });

    for (const key of chain) {
      const s: StageCalc = { key, sizing: [], picks: [], items: [] };

      switch (key) {
        case "screen": {
          s.sizing.push(
            t(
              M.screen(fmt(Qh, 1), fmt(Qls, 1), fmt(peak.qMax, 1), peak.kMax.toFixed(2), peak.source),
              language
            )
          );
          break;
        }
        case "avg": {
          const V = vAvg;
          s.sizing.push(
            t(M.avgVolume(fmt(V), String(hours >= 20 ? a.avgHoursLong : a.avgHoursShort)), language)
          );
          const p = pickModel("tanks", "vol", V, language);
          if (p) s.picks.push(p);
          s.extra = t(M.avgMixing, language);
          break;
        }
        case "grease": {
          if (fats < a.greaseTarget) s.sizing.push(t(M.greaseBelow(a.greaseTarget), language));
          else {
            s.sizing.push(t(M.grease(fmt(Qh, 1), fmt(fats), a.greaseTarget), language));
            const p = pickModel("grease-traps", "q", Qh, language);
            if (p) s.picks.push(p);
          }
          break;
        }
        case "sand": {
          s.sizing.push(
            t(
              M.sand(
                fmt(Qls, 1),
                a.sandSize,
                GRIT.table28.ref,
                GRIT.requiredFromM3Day.value,
                GRIT.minUnits.value,
                GRIT.minUnits.ref
              ),
              language
            )
          );
          const p = pickModel("sand-traps", "ns", Qls, language);
          if (p) s.picks.push(p);
          break;
        }
        case "oil": {
          s.sizing.push(t(M.oil(fmt(Qls, 1), fmt(petro)), language));
          const p = pickModel("oil-separators", "ns", Qls, language);
          if (p) s.picks.push(p);
          break;
        }
        case "neutral": {
          const acid = ph > 8.5;
          const alk = ph < 6.5;
          s.sizing.push(
            t(
              acid
                ? M.phAcid(ph.toFixed(1))
                : alk
                ? M.phAlkali(ph.toFixed(1))
                : M.phOk(ph.toFixed(1)),
              language
            )
          );
          const p = pickModel("dosing", "vol", Math.max(100, Q * 2), language); // ориентир: 2 л реагента на м³
          if (p) s.picks.push(p);
          break;
        }
        case "physchem": {
          const doseCoag = a.coagDose;
          s.sizing.push(
            t(M.physchem(doseCoag, fmt((Q * doseCoag) / 1000, 1), a.flocDose), language)
          );
          const reactor = pickModel("tanks", "vol", Math.max(1, Qh * 0.75), language);
          if (reactor) s.picks.push({ ...reactor, note: t(M.physchemReactor, language) });
          const dos = pickModel("dosing", "vol", Math.max(100, (Q * doseCoag) / 100), language);
          if (dos) s.picks.push(dos);
          break;
        }
        case "daf": {
          const area = Qh / a.dafLoad;
          s.sizing.push(t(M.daf(a.dafLoad, fmt(area, 1), a.dafRecycle), language));
          break;
        }
        case "bio": {
          const qEq = bod > 0 ? (Q * bod) / a.domesticBod : Q;
          const ext = AEROTANK.extendedAeration;
          if (techResult && tech) {
            const anaerobic = isAnaerobicTechnology(tech);
            if (techByRequirement) {
              /* формулировка требования — только из norms/uz-membrane-requirement.ts */
              s.sizing.push(requirementNote(true));
            } else if (mbrWaiver) {
              s.sizing.push(requirementNote(false));
            }
            const techLabel = t(TECHNOLOGY_LABEL[tech], language);
            const techDescription = t(TECHNOLOGY_DESCRIPTION[tech], language);
            s.sizing.push(
              t(
                techByRequirement
                  ? M.techByRequirementLine(techLabel, techDescription)
                  : M.techByEngineerLine(techLabel, techDescription),
                language
              ),
              t(
                M.bioLoads(
                  fmt(techResult.loads.bod, 1),
                  fmt(techResult.loads.cod, 1),
                  fmt(techResult.hydraulic.qWorking, 1),
                  fmt(techResult.hydraulic.qPeak, 1)
                ),
                language
              ),
              t(
                M.bioHydraulic(
                  techResult.hydraulic.hrt,
                  fmt(techResult.hydraulic.hydraulicVolume),
                  fmt(techResult.hydraulic.volumeWithReserve)
                ),
                language
              )
            );
            const rest = techResult.specialized.filter((m) => m.key !== "air" && m.key !== "airPerReactor");
            if (rest.length) {
              s.sizing.push(
                t(M.bioMetrics(rest.map((m) => `${m.label} ${fmt(m.value, 2)} ${m.unit}`).join("; ")), language)
              );
            }
            s.sizing.push(
              anaerobic
                ? t(TX.techNoAir, language)
                : t(
                    M.bioAirNm3(
                      fmt(airH, 1),
                      fmt(airH * 24),
                      AEROTANK.air.ref.replace(KMK_2_04_03_19_DOC.code + ", ", "")
                    ),
                    language
                  )
            );
            if (!anaerobic) {
              s.sizing.push(
                t(
                  tn > a.denitroTn
                    ? M.bioNitroDenitro(fmt(tn), a.denitroShare)
                    : M.bioNitroModerate,
                  language
                )
              );
            }
            s.sizing.push(technologySourceNote(tech, language));
            for (const line of techResult.assumptions) s.sizing.push(line);
            if (clarifyDropText) s.sizing.push(clarifyDropText);
            const allWarnings = [...techWarnings, ...membraneNotes];
            s.extra = allWarnings.length ? `${t(TX.techWarnings, language)}: ${allWarnings.join(" ")}` : undefined;
          } else {
            const vLoad = a.bodVolLoad;
            const V = bodLoad / vLoad;
            const air = bodLoad * a.airPerBod;
            s.sizing.push(
              t(
                M.bioAutoVolume(
                  fmt(bodLoad, 1),
                  fmt(bodLoad / (a.bod5Ratio || 0.68), 1),
                  vLoad,
                  ext.rho,
                  `${ext.doseGL[0]}–${ext.doseGL[1]}`,
                  ext.ref,
                  fmt(V)
                ),
                language
              ),
              t(
                M.bioAutoAir(
                  fmt(air),
                  fmt(air / 24, 1),
                  AEROTANK.air.ref.replace(KMK_2_04_03_19_DOC.code + ", ", "")
                ),
                language
              ),
              t(
                tn > a.denitroTn ? M.bioNitroDenitro(fmt(tn), a.denitroShare) : M.bioNitroModerate,
                language
              )
            );
          }
          const p = pickModel("bio-plants", "qd", qEq, language);
          if (p) s.picks.push({ ...p, note: t(M.bioEquivalent(fmt(qEq)), language) });
          break;
        }
        case "clarify": {
          s.sizing.push(t(M.clarify, language));
          break;
        }
        case "post": {
          s.sizing.push(t(M.post(fmt(Qh, 1), a.filterRate), language));
          break;
        }
        case "disinfect": {
          const dose = industry.id === "hospital" ? a.chlorDoseHospital : a.chlorDose;
          const gph = (Q * dose) / hours;
          const storeK = a.chlorStorageFactor || DISINFECTION.chlorineDose.storageFactor;
          const basis = t(
            industry.id === "hospital"
              ? M.chlorBasisHospital
              : M.chlorBasisBio(DISINFECTION.chlorineDose.afterBio, DISINFECTION.chlorineDose.ref),
            language
          );
          s.sizing.push(
            t(
              M.disinfect(
                dose,
                basis,
                fmt(gph, 1),
                storeK,
                fmt(gph * storeK, 1),
                a.contactTime,
                DISINFECTION.contactMinutes.ref
              ),
              language
            )
          );
          const p = pickModel("chlorinators", "cl", gph * storeK, language);
          if (p) s.picks.push(p);
          break;
        }
        case "sludge": {
          const dry = dryKg;
          const vol = dry / (10 * a.sludgeDs);
          s.sizing.push(t(M.sludge(fmt(dry, 1), fmt(vol, 1), a.sludgeDs), language));
          const p = pickModel("tanks", "vol", Math.max(1, vol * a.sludgeStoreDays), language);
          if (p) s.picks.push({ ...p, note: t(M.sludgeThickener(a.sludgeStoreDays), language) });
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
    if (chainHas("avg")) volumes.push({ name: U.tankAvg, volume: vAvg });
    if (chainHas("bio")) volumes.push({ name: U.tankBio, volume: vBio });
    if (chainHas("clarify")) volumes.push({ name: U.tankClarify, volume: Math.max(4, (Qh / a.clarifyLoad) * 3) });
    if (chainHas("daf")) volumes.push({ name: U.tankDaf, volume: Math.max(3, (Qh / a.dafLoad) * 2.5) });
    if (chainHas("physchem")) volumes.push({ name: U.tankPhyschem, volume: Math.max(2, Qh * 0.4) });
    if (chainHas("disinfect")) volumes.push({ name: U.tankContact, volume: Math.max(2, (Qh * a.contactTime) / 60) });
    if (chainHas("sludge")) volumes.push({ name: U.tankSludge, volume: Math.max(4, (dryKg / (10 * a.sludgeDs)) * a.sludgeStoreDays) });
    volumes.push({ name: U.tankIntake, volume: Math.max(Q / 24, Qh) * a.reserveEmergency });

    const civil = civilWorks(volumes, a, scale);

    /* ---------- санитарно-защитная зона, табл. 1 ҚМҚ 2.04.03-19 ----------
       блочные установки с биологией — аэрационные установки на полное окисление
       (прим. 6: 50 м при Q ≤ 700 м³/сут); крупнее — сооружения механической и
       биологической очистки: иловые площадки (аварийные, п. 6.393) есть у
       модульных и ж/б станций, у блочных их нет (прим. 3 — минус 30 %);
       без биологии (промстоки, поверхностный сток) — по согласованию, прим. 8 */
    const szz: SzzResult | null = chainHas("bio")
      ? scale === "compact"
        ? sanitaryZone(Q, "full-oxidation", false)
        : sanitaryZone(Q, "mechbio-sludge-beds", chainHas("sludge"))
      : null;

    /* ---------- площадь ---------- */
    const equipmentArea = Math.max(40, (airH / 1000) * 12 + (dryKg / 100) * 8 + 30);
    const area = areaEstimate(civil.areaStructures, equipmentArea, (dryKg * 30) / (10 * a.cakeDs), a, szz);

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
      /* величины, которые нужны генератору чертежей (drawings/core/types.ts) */
      chain: chain as string[], qMaxH: peak.qMax, vAvg, dryKg,
      civil, area, pipes, power, szz,
      norms: kmkClausesFor(chain),
      civilList: civilItems(civil, a),
      tech, techResult, techWarnings, membraneNotes, vBio, air: airH,
      clarifyDropped, clarifyDropText,
      hasBio: chainHas("bio"),
    };
  }, [industry, Q, hours, ph, c, discharge, a, tech, techParam, techByRequirement, mbrWaiver, language, tAnnualC, tSummerC]);

  function schemeInput(): SchemeInput | null {
    if (!industry || !calc) return null;
    return { industry, object, lab, Q, hours, Qh: calc.Qh, ph, conc: c, target: TARGET, stages: calc.stages, lang: language };
  }

  /* ==================================================================
   * УЧАСТОК И КОМПЛЕКТ ЧЕРТЕЖЕЙ
   *
   * Участок приходит из анкеты (industry/page.tsx) в URL. Здесь он
   * только показывается: потребная и заданная площадь, помещаются ли
   * сооружения и из чего состоит комплект. Сами листы собираются на
   * сервере (POST /api/drawings) — там же проверяется оплата.
   * ================================================================== */

  const site = useMemo<SiteInput | undefined>(() => {
    const mode = sp.get("siteMode") || "";
    const polygon = parseSitePolygon(sp.get("sitePoly"), sp.get("siteW"), sp.get("siteL"));
    const unlimited = mode === "unlimited" || polygon.length < 3;
    return {
      polygon,
      unlimited,
      groundElev: numParam(sp.get("groundElev")),
      inletSide: sideParam(sp.get("inletSide")),
      inletInvert: numParam(sp.get("inletInvert")),
      outletSide: sideParam(sp.get("outletSide")),
      outletElev: numParam(sp.get("outletElev")),
      housingSide: sideParam(sp.get("housingSide")),
    };
  }, [sp]);

  const housingDistM = numParam(sp.get("housingDist"));

  const drawingInput = useMemo<DrawingInput | null>(() => {
    if (!industry || !calc) return null;
    return {
      object: object || t(industry.name, language),
      industryId: industry.id,
      q: Q,
      hours,
      qMaxH: calc.qMaxH,
      bod: c.bod ?? 0,
      cod: c.cod ?? 0,
      ss: c.ss ?? 0,
      fats: c.fats ?? 0,
      tn: c.tn ?? 0,
      chain: calc.chain,
      tech: calc.tech ? t(TECHNOLOGY_LABEL[calc.tech], language) : t(TX.techByAuto, language),
      vAvg: calc.vAvg,
      vBio: calc.vBio,
      air: calc.air,
      dryKg: calc.dryKg,
      scale: calc.scale,
      szz: calc.szz?.meters,
      site,
      lang: language,
    };
  }, [industry, calc, object, language, Q, hours, c, site]);

  /** предпросмотр компоновки: площадь и состав комплекта, без генерации листов */
  const drawings = useMemo(() => {
    if (!drawingInput) return null;
    try {
      const entries = buildModels(drawingInput);
      const models = entries.map((e) => e.model);
      const need = requiredArea(models, a);
      const layout = layoutSite(drawingInput.site, models, { assumptions: a, housingDistM });
      return { entries, need, layout };
    } catch (e) {
      console.error("drawings preview:", e);
      return null;
    }
  }, [drawingInput, a, housingDistM]);

  const [zipBusy, setZipBusy] = useState(false);
  const [docBusy, setDocBusy] = useState(false);
  const [xlsBusy, setXlsBusy] = useState(false);
  const [fileError, setFileError] = useState("");
  const [zipError, setZipError] = useState("");
  const [invoice, setInvoice] = useState<InvoiceView | null>(null);

  async function downloadPackage() {
    if (!drawingInput || zipBusy) return;
    setZipBusy(true);
    setZipError("");
    try {
      const res = await fetch("/api/drawings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: drawingInput, opts: { housingDistM } }),
      });
      if (res.status === 401) {
        router.push(`/engineering/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.includes("application/zip")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filenameFrom(res.headers.get("content-disposition")) || `SUVSANOAT_chertezhi_${Math.round(Q)}m3.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setInvoice(null);
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string; invoice?: InvoiceView } | null;
      if (res.status === 402 && data?.invoice) {
        setInvoice(data.invoice);
        return;
      }
      setZipError(data?.error || U.errDrawings);
    } catch {
      setZipError(U.errNetwork);
    } finally {
      setZipBusy(false);
    }
  }

  const [note, setNote] = useState<{ text: string; source: "ai" | "template"; reason?: string } | null>(null);
  const [noteBusy, setNoteBusy] = useState(false);

  /* Параметры модели в спецификации. Единицы локализуются вместе с
     остальным текстом: оставлять «м³/ч» внутри узбекской или китайской
     строки — значит смешивать языки в одной ячейке таблицы. */
  function modelParams(m: Model): string {
    const u = (ru: string, uz: string, en: string, zh: string) => t(L(ru, uz, en, zh), language);
    const mm = u("мм", "mm", "mm", "mm");
    const m3 = u("м³", "m³", "m³", "m³");
    const parts: string[] = [];
    if (m.diameter) parts.push(`⌀${m.diameter}×${m.length} ${mm}`);
    else parts.push(`${m.length}×${m.width ?? "—"}×${m.height ?? "—"} ${mm}`);
    if (m.vol) parts.push(`${m.vol} ${m.line === "dosing" ? u("л", "l", "L", "L") : m3}`);
    else if (m.volumeGross) parts.push(`V ${m.volumeGross} ${m3}`);
    if (m.q) parts.push(`${m.q} ${u("м³/ч", "m³/soat", "m³/h", "m³/h")}`);
    if (m.ns) parts.push(`NS ${m.ns} ${u("л/с", "l/s", "L/s", "L/s")}`);
    if (m.qd) parts.push(`${m.qd} ${u("м³/сут", "m³/kun", "m³/day", "m³/日")}`);
    if (m.cl) parts.push(`${m.cl} ${u("г/ч", "g/soat", "g/h", "g/h")} Cl`);
    parts.push(`DN${m.dn}`);
    return parts.join(", ");
  }

  /**
   * Скачивание бинарного файла с серверного маршрута. Записка в Word и
   * книга Excel собираются на сервере (как и комплект чертежей), потому
   * что там лежит ключ ИИ и там же проверяется вход. Клиенту остаётся
   * получить поток и отдать его браузеру.
   */
  async function downloadBinary(
    url: string,
    body: unknown,
    fallbackName: string,
    setBusy: (v: boolean) => void,
  ) {
    setBusy(true);
    setFileError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.push(`/engineering/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const type = res.headers.get("content-type") ?? "";
      /* документ приходит потоком; JSON в ответе означает отказ */
      if (res.ok && !type.includes("application/json")) {
        const blob = await res.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = filenameFrom(res.headers.get("content-disposition")) || fallbackName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(href), 2000);
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setFileError(data?.error || t(TX.fileFailed, language));
    } catch {
      setFileError(t(TX.fileNoServer, language));
    } finally {
      setBusy(false);
    }
  }

  /** Пояснительная записка в Word: те же данные, что и у записки на
   *  странице, плюс температурный режим и точка сброса — их тип
   *  NoteInput не содержит, а в документе они нужны. */
  async function downloadNoteDocx() {
    const input = noteInput();
    if (!input || docBusy) return;
    await downloadBinary(
      "/api/note-docx",
      {
        ...input,
        lang: language,
        temperature: calc?.techResult?.temperature,
        discharge: t(discharge?.name, language) || undefined,
      },
      `SUVSANOAT_zapiska_${Math.round(Q)}m3.docx`,
      setDocBusy,
    );
  }

  /** Спецификация A/B и ведомость объёмов работ книгой Excel. */
  async function downloadSpecXlsx() {
    if (!drawingInput || xlsBusy) return;
    await downloadBinary(
      "/api/spec-xlsx",
      { input: drawingInput, opts: { housingDistM } },
      `SUVSANOAT_specifikaciya_${Math.round(Q)}m3.xlsx`,
      setXlsBusy,
    );
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
        label: t(POLLUTANT_LABELS[k].label, language),
        value: c[k]!,
        unit: t(POLLUTANT_LABELS[k].unit, language),
        target: TARGET[k],
      })),
      special: (industry.special ?? []).map((sp) => ({
        label: t(sp.label, language),
        range: sp.range,
        unit: t(sp.unit, language),
        note: t(sp.note, language),
      })),
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
      scale: t(SCALE_LABEL[calc.scale], language),
      tech: calc.hasBio
        ? {
            code: calc.tech ?? "auto",
            name: calc.tech ? t(TECHNOLOGY_LABEL[calc.tech], language) : t(TX.techByAuto, language),
            chosenBy: techByRequirement ? "requirement" : calc.tech ? "engineer" : "auto",
            description: calc.tech ? t(TECHNOLOGY_DESCRIPTION[calc.tech], language) : t(TX.techAuto, language),
            source: calc.tech
              ? technologySourceNote(calc.tech, language)
              : t(M.autoSource(AEROTANK.extendedAeration.ref, AEROTANK.air.ref), language),
            volumeM3: calc.vBio,
            airNm3h: calc.air,
            aerobic: !isAnaerobicTechnology(calc.tech ?? undefined),
            assumptions: calc.techResult?.assumptions ?? [],
            warnings: [...calc.techWarnings, ...calc.membraneNotes],
            /* требование обязательной мембранной очистки: формулировка
               целиком из norms/uz-membrane-requirement.ts, реквизиты
               документа записке не передаются */
            membraneRequirement: MEMBRANE_REQUIRED_BY_DEFAULT
              ? requirementNote(!mbrWaiver)
              : undefined,
            membraneRequirementRef: MEMBRANE_REQUIRED_BY_DEFAULT ? requirementRef() : undefined,
            membraneWaiver: mbrWaiver,
            clarifierRemoved: calc.clarifyDropText ?? undefined,
          }
        : undefined,
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
      notes: industry.notes.map((x) => t(x, language)),
      sources: industry.sources.map((x) => t(x, language)),
      szz: calc.szz,
      norms: calc.norms,
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

  /** Схема автоматизации отдельным листом: связи «прибор — щит» на
   *  таблице не видны, а кабель по ним кто-то должен проложить. */
  function dxfPid() {
    if (!calc) return;
    const pid = buildPid({
      stages: calc.chain,
      inletPump: calc.chain.includes("pump") || calc.chain.includes("avg"),
      uv: true,
      blowers: 2,
      dosing: calc.chain.includes("physchem") || calc.chain.includes("neutral"),
    });
    const sh = pidSheet(pid, calc.chain, { object: `${industry ? t(industry.name, language) : "Объект"}, ${fmt(Q)} м³/сут` });
    /* Скачиваем сами, а не через downloadDxf из ./dxf: там свой класс
       Dxf для схем страницы, а лист собран классом из drawings/core. */
    const bytes = sh.d.toBytes();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SUVSANOAT_shema_avtomatizacii.dxf";
    a.click();
    URL.revokeObjectURL(url);
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
    printDxf(buildSchemeDxf(input), `${U.chainTitle} — ${t(input.industry.name, language)}`);
  }

  function printModels() {
    const input = schemeInput();
    if (!input) return;
    printDxf(buildModelsDxf(input), `${U.btnDxfModels} — ${t(input.industry.name, language)}`);
  }

  if (!industry || !calc) {
    return (
      <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: 60 }}>
        <p>{U.notFound} <a href="/engineering/analysis" style={{ color: ACCENT }}>{U.startOver}</a></p>
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
        {/* Шапка результата: назад слева, выбор языка справа. При печати
            скрывается целиком — в отчёт ни кнопка, ни переключатель не идут. */}
        <div className="noPrint" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
          <button type="button" onClick={() => router.back()}
            style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer" }}>
            ← {U.backToInput}
          </button>
          <LanguageSwitcher />
        </div>

        <div style={{ fontSize: 13, letterSpacing: "0.14em", color: ACCENT, marginBottom: 10 }}>
          {U.resultEyebrow}
        </div>
        <h1 style={{ fontSize: 30, margin: "0 0 6px" }}>{t(industry.name, language)}</h1>
        <p style={{ color: FAINT, margin: "0 0 4px" }}>
          {object && <>{U.objectWord}: {object} · </>}
          Расход {fmt(Q)} м³/сут · режим {hours} ч/сут · {fmt(calc.Qh, 1)} м³/ч
        </p>
        <p style={{ color: "#cfdde3", fontSize: 13, margin: "0 0 8px" }}>
          {U.scaleLine}: <b>{t(SCALE_LABEL[calc.scale], language)}</b>.
        </p>
        {calc.hasBio && (
          <p style={{ color: "#cfdde3", fontSize: 13, margin: "0 0 8px" }}>
            {t(TX.techTitle, language)}:{" "}
            <b>{calc.tech ? t(TECHNOLOGY_LABEL[calc.tech], language) : t(TX.techByAuto, language)}</b>
            {calc.tech && (
              <span style={{ color: FAINT }}>
                {" "}
                — {techByRequirement ? t(TX.techByRequirement, language) : t(TX.techByEngineer, language)}
              </span>
            )}.
          </p>
        )}
        {discharge && (
          <p style={{ color: "#cfdde3", fontSize: 13, margin: "0 0 8px" }}>
            {U.dischargeTo}: <b>{t(discharge.name, language)}</b>. {U.targetsFrom} — {customTu ? U.byYourTu : t(discharge.source, language)}.
          </p>
        )}
        <p style={{ color: lab ? "#9ccc65" : "#ffb74d", fontSize: 13, margin: "0 0 26px" }}>
          {lab
            ? U.labSource
            : `${U.refSource} (${industry.sources.map((x) => t(x, language)).join("; ")}). ${U.refTail}`}
        </p>

        {/* ИСХОДНЫЕ ДАННЫЕ */}
        <div style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 12 }}>{U.influentTitle}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {KEY_ORDER.filter((key) => c[key] !== undefined).map((key) => (
              <div key={key} style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{t(POLLUTANT_LABELS[key].label, language)}</div>
                <b>{fmt(c[key]!)}</b> → {TARGET[key] ?? "—"} {t(POLLUTANT_LABELS[key].unit, language)}
              </div>
            ))}
            <div style={{ fontSize: 13 }}>
              <div style={{ color: FAINT, fontSize: 11 }}>pH</div>
              <b>{ph.toFixed(1)}</b> → 6,5–8,5
            </div>
          </div>
          {discharge && !customTu && (
            <p style={{ fontSize: 12, color: FAINT, margin: "14px 0 0", lineHeight: 1.6 }}>{t(discharge.note, language)}</p>
          )}
        </div>

        {/* ОСОБЫЕ ЗАГРЯЗНИТЕЛИ */}
        {industry.special && (
          <div style={{ border: "1px solid rgba(255,183,77,0.4)", background: "rgba(255,183,77,0.06)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 10 }}>{U.specialTitle}</div>
            {industry.special.map((spec) => (
              <p key={t(spec.label, language)} style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 8px" }}>
                <b>{t(spec.label, language)}</b> ({spec.range[0]}–{spec.range[1]} {t(spec.unit, language)}): {t(spec.note, language)}
              </p>
            ))}
          </div>
        )}

        {/* ТЕХНОЛОГИЯ БИОБЛОКА */}
        {calc.hasBio && (
          <div style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 10 }}>{t(TX.techTitle, language)}</div>
            {calc.tech ? (
              <>
                <p style={{ fontSize: 14, margin: "0 0 6px" }}>
                  <b>{t(TECHNOLOGY_LABEL[calc.tech], language)}</b>{" "}
                  <span style={{ color: FAINT, fontSize: 12 }}>
                    — {techByRequirement ? t(TX.techByRequirement, language) : t(TX.techByEngineer, language)}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.6 }}>
                  {t(TECHNOLOGY_DESCRIPTION[calc.tech], language)}
                </p>
                <p style={{ fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>
                  {t(TX.bioFiguresPre, language)}<b>{fmt(calc.vBio)}</b>{t(TX.bioFiguresMid, language)}
                  {isAnaerobicTechnology(calc.tech) ? (
                    <>{t(TX.techNoAir, language).toLowerCase()}</>
                  ) : (
                    <>
                      {t(TX.bioFiguresAir, language)}<b>{fmt(calc.air, 1)}</b>{t(TX.bioFiguresAirUnit, language)}
                    </>
                  )}
                  {t(TX.bioFiguresTail, language)}
                </p>
                <p style={{ fontSize: 12, color: FAINT, margin: "0 0 8px", lineHeight: 1.6 }}>
                  {technologySourceNote(calc.tech, language)}
                </p>
                {/* температурный режим расчёта: из него следует и объём
                    биологии (годовая), и расход воздуха (летняя) */}
                {calc.techResult && (
                  <p style={{ fontSize: 12.5, color: "#cfdde3", margin: 0, lineHeight: 1.6 }}>
                    {U.tempRegime}:{" "}
                    {t(
                      tempRegimeLine(
                        fmt(calc.techResult.temperature.annualC, 1),
                        fmt(calc.techResult.temperature.summerC, 1),
                        fmt(calc.techResult.temperature.factor, 2)
                      ),
                      language
                    )}
                  </p>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: "#cfdde3", margin: 0, lineHeight: 1.6 }}>{t(TX.techAuto, language)}</p>
            )}

            {/* требование обязательной мембранной очистки либо отступление от него;
                формулировка — только requirementNote() из норм. модуля */}
            {MEMBRANE_REQUIRED_BY_DEFAULT && (
              <div
                style={{
                  marginTop: 14,
                  border: `1px solid ${mbrWaiver ? "rgba(255,183,77,0.45)" : "rgba(62,195,230,0.5)"}`,
                  background: mbrWaiver ? "rgba(255,183,77,0.07)" : "rgba(62,195,230,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    color: mbrWaiver ? "#ffb74d" : ACCENT,
                    marginBottom: 8,
                  }}
                >
                  {mbrWaiver ? t(TX.membraneWaiverTitle, language) : t(TX.membraneTitle, language)}
                </div>
                <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>{requirementNote(!mbrWaiver)}</p>
              </div>
            )}

            {/* объём биологии определён зимним режимом — это должно быть
                видно сразу, а не найдено потом в списке допущений */}
            {calc.techResult?.temperature.winterGoverns && (
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
                  {U.tempWinterTitle}
                </div>
                <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>
                  {t(
                    tempWinterWarning(
                      fmt(calc.techResult.temperature.annualC, 1),
                      fmt(calc.techResult.temperature.factor, 2)
                    ),
                    language
                  )}
                </p>
              </div>
            )}

            {/* вторичный отстойник снят со схемы — объясняем почему */}
            {calc.clarifyDropText && (
              <div style={{ marginTop: 14, border: `1px solid ${LINE}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 8 }}>
                  {t(TX.clarifyDroppedTitle, language)}
                </div>
                <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>{calc.clarifyDropText}</p>
              </div>
            )}

            {/* проверки стока перед мембранами (membraneWarnings) */}
            {calc.membraneNotes.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  border: "1px solid rgba(255,183,77,0.4)",
                  background: "rgba(255,183,77,0.06)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 8 }}>
                  {t(TX.membraneChecks, language)}
                </div>
                {calc.membraneNotes.map((w, i) => (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.6, margin: "0 0 6px" }}>• {w}</p>
                ))}
              </div>
            )}

            {calc.techWarnings.length > 0 && (
              <div style={{ marginTop: 14, border: "1px solid rgba(255,183,77,0.4)", background: "rgba(255,183,77,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#ffb74d", marginBottom: 8 }}>{t(TX.techWarnings, language)}</div>
                {calc.techWarnings.map((w, i) => (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.6, margin: "0 0 6px" }}>• {w}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ЦЕПОЧКА */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, margin: "0 0 14px" }}>
          {U.chainTitle} — {calc.stages.length} {U.stagesWord}
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
                  {stage.items.length} {U.itemsCount}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.55 }}>{t(info.what, language)}</p>
              {stage.sizing.map((line, i) => (
                <p key={i} style={{ fontSize: 13, margin: "0 0 4px", lineHeight: 1.55 }}>— {line}</p>
              ))}
              {stage.extra && <p style={{ fontSize: 12, color: FAINT, margin: "6px 0 0" }}>{stage.extra}</p>}
              <ItemTable items={stage.items} U={U} />

              {stage.picks.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: FAINT }}>{U.ownProduct}:</span>
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
            <b style={{ fontSize: 16 }}>{U.commonTitle}</b>
            <span style={{ fontSize: 11, color: FAINT }}>{calc.common.length} {U.itemsCount}</span>
          </div>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: 0, lineHeight: 1.55 }}>
            {U.commonLead}
          </p>
          <ItemTable items={calc.common} U={U} />
        </div>

        {/* ================= СТРОИТЕЛЬНАЯ ЧАСТЬ ================= */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, margin: "30px 0 12px" }}>
          {U.civilTitle}
        </div>

        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>{U.basinsTitle}</b>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: "8px 0 10px", lineHeight: 1.55 }}>
            {t(
              M.civilBasins(
                a.basinDepth,
                a.basinRatio,
                a.basinFreeboard,
                a.wallThickness,
                a.slabThickness,
                t(a.coverThickness > 0 ? M.civilCover(a.coverThickness) : M.civilNoCover, language)
              ),
              language
            )}
          </p>

          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {[U.colStructure, U.colVolume, U.colDims, U.colConcrete, U.colExcav].map((h) => (
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
                  <td style={{ padding: "8px", fontWeight: 700 }}>{U.totalWord}</td>
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.basins.reduce((s2, b) => s2 + b.volume, 0))}</td>
                  <td style={{ padding: "8px" }} />
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.concrete, 1)}</td>
                  <td style={{ padding: "8px", fontWeight: 700 }}>{fmt(calc.civil.excavation)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ItemTable items={calc.civilList} U={U} />
          <p style={{ fontSize: 12, color: FAINT, margin: "10px 0 0", lineHeight: 1.6 }}>{calc.civil.note}</p>
        </div>

        {/* ================= ТРУБОПРОВОДЫ ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>{U.pipesTitle}</b>
          <p style={{ fontSize: 13, color: "#cfdde3", margin: "8px 0 10px", lineHeight: 1.55 }}>
            Диаметры подобраны по расходу и расчётной скорости: самотёчные {a.velGravity} м/с, напорные {a.velPressure} м/с,
            воздуховоды {a.velAir} м/с. Длины — ориентировочные, по габаритам площадки; точные даёт генплан.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {[U.colPipe, U.colFlow, "DN", U.colVelocity, U.colLength, U.colPipeVolume, U.colMaterial].map((h) => (
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
          <b style={{ fontSize: 16 }}>{U.areaTitle}</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, margin: "12px 0" }}>
            {[
              [U.areaStructures, calc.area.structures, U.unitM2],
              [U.areaBuildings, calc.area.buildings, U.unitM2],
              [U.areaSludge, calc.area.sludgeYard, U.unitM2],
              [U.areaBuilt, calc.area.built, U.unitM2],
              [U.areaSite, calc.area.site, U.unitM2],
              [U.areaSame, calc.area.site / 10000, U.unitHa],
            ].map(([label, value, unit], i) => (
              <div key={i} style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{label as string}</div>
                <b style={{ fontSize: 17 }}>{fmt(value as number, unit === U.unitHa ? 2 : 0)}</b> {unit as string}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: FAINT, margin: 0, lineHeight: 1.6 }}>{calc.area.note}</p>
        </div>

        {/* ================= САНИТАРНО-ЗАЩИТНАЯ ЗОНА ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>Санитарно-защитная зона</b>
          {calc.szz ? (
            <>
              <div style={{ margin: "10px 0 6px", fontSize: 13 }}>
                <b style={{ fontSize: 22 }}>{calc.szz.meters}</b> м — {calc.szz.basis}
              </div>
              {calc.szz.notes.map((line, i) => (
                <p key={i} style={{ fontSize: 12, color: FAINT, margin: "0 0 4px", lineHeight: 1.6 }}>— {line}</p>
              ))}
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#cfdde3", margin: "10px 0 0", lineHeight: 1.6 }}>
              Для очистных сооружений промпредприятий и поверхностного стока размер зоны устанавливается по согласованию с органами санэпиднадзора ({KMK_2_04_03_19_DOC.code}, табл. 1, прим. 8).
            </p>
          )}
        </div>

        {/* ================= ЭЛЕКТРИКА ================= */}
        <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <b style={{ fontSize: 16 }}>{U.powerTitle}</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, margin: "12px 0" }}>
            {[
              [U.powerInstalled, fmt(calc.power.installed, 1), U.unitKw],
              [U.powerDemand, fmt(calc.power.demand, 1), U.unitKw],
              [U.powerDaily, fmt(calc.power.daily), U.unitKwhD],
              [U.powerYearly, fmt(calc.power.yearly / 1000), U.unitKwh],
              [U.powerSpecific, fmt(calc.power.specific, 2), U.unitKwhM3],
              [U.powerSpecificBod, fmt(calc.power.specificBod, 2), U.unitKwhKg],
              ["Трансформатор", String(calc.power.transformerKVA), "кВА"],
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
                  {[U.colConsumer, U.colQtyKw, U.colInstalled, U.colHours, U.colDaily, U.colBasis].map((h) => (
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

        {/* ================= ЭКСПЛУАТАЦИЯ =================
            Показатели в натуре, без цен: тариф у каждого заказчика свой и
            меняется чаще, чем выходит проект. Количества умножаются на
            свои цены в одну строку — и тогда деньги настоящие. */}
        {(() => {
          const opex = calculateOpex({
            flowM3Day: Q,
            bodFullMgL: (c.bod ?? 0) / BOD5_TO_BODFULL,
            tssMgL: c.ss ?? 0,
            yearKWh: calc.power.yearly,
            uv: calc.chain.includes("post"),
          });
          return (
            <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
              <b style={{ fontSize: 16 }}>Эксплуатационные показатели за год</b>
              <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                В натуральных единицах, без цен: тариф на электроэнергию, стоимость реагентов и вывоза
                осадка у каждого заказчика свои. Умножьте количества на свои цены — получите себестоимость
                очистки кубометра.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Статья", "За год", "Ед.", "На 1 м³", "Основание"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opex.lines.map((l, i) => (
                      <tr key={i}>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.name}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{l.perYear.toLocaleString("ru-RU")}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.unit}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.perM3}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>{l.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: FAINT, margin: "10px 0 0", lineHeight: 1.6 }}>
                Осадок: {opex.sludgeDryKgDay} кг сухого вещества в сутки, обезвоженного {opex.cakeM3Day} м³/сут.
              </p>
              {opex.warnings.map((w) => (
                <p key={w} style={{ fontSize: 12.5, color: "#ffb74d", margin: "8px 0 0", lineHeight: 1.6 }}>{w}</p>
              ))}
            </div>
          );
        })()}

        {/* ================= АВТОМАТИЗАЦИЯ =================
            Перечень приборов написать легко; ценность здесь в
            блокировках — что чему запрещает работать. Насос без воды,
            воздуходувка на закрытую задвижку, дозатор в стоящую воду —
            это не «неоптимальный режим», а сгоревшее оборудование в
            первые сутки после пуска. Поэтому у каждой блокировки
            написано, что будет, если её нет. */}
        {(() => {
          const pid = buildPid({
            stages: calc.chain,
            inletPump: calc.chain.includes("pump") || calc.chain.includes("avg"),
            uv: true,
            blowers: 2,
            dosing: calc.chain.includes("physchem") || calc.chain.includes("neutral"),
          });
          return (
            <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
              <b style={{ fontSize: 16 }}>Автоматизация: приборы, сигналы, блокировки</b>
              <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                Сигналов в щите: {pid.counts.AI} аналоговых входов, {pid.counts.AO} аналоговых выходов,{" "}
                {pid.counts.DI} дискретных входов, {pid.counts.DO} дискретных выходов. {pid.controller}
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Поз.", "Сигнал", "Место", "Назначение", "Зачем это нужно"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pid.instruments.map((it) => (
                      <tr key={it.tag}>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{it.tag}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.signal}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.place}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{it.purpose}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>{it.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <b style={{ fontSize: 14, display: "block", margin: "18px 0 8px" }}>Блокировки</b>
              {pid.interlocks.map((l) => (
                <div key={l.name} style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12.5, color: "#cfdde3", lineHeight: 1.6 }}>
                    Когда: {l.when}. Что: {l.action}.
                  </div>
                  <div style={{ fontSize: 12.5, color: "#ffb74d", lineHeight: 1.6 }}>Без неё: {l.ifAbsent}</div>
                </div>
              ))}

              {pid.assumptions.map((a) => (
                <p key={a} style={{ fontSize: 12, color: FAINT, margin: "6px 0 0", lineHeight: 1.6 }}>{a}</p>
              ))}
            </div>
          );
        })()}

        {/* ================= РЕАГЕНТНОЕ ХОЗЯЙСТВО =================
            Блок появляется только там, где реагенты действительно есть:
            реагентная обработка, нейтрализация или обезвоживание. На
            станции без реагентов склад и дозаторы не нужны, и рисовать
            их «на всякий случай» — значит закладывать в проект комнату,
            которую никто не построит. */}
        {(calc.chain.includes("physchem") || calc.chain.includes("neutral") || calc.chain.includes("daf")) &&
          (() => {
            const rg = calculateReagents({
              flowM3Day: Q,
              hoursPerDay: 24,
              ph,
              flocculant: "anionic",
              after: calc.chain.includes("daf") ? "flotation" : "settling",
              stockDays: 30,
            });
            return (
              <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
                <b style={{ fontSize: 16 }}>Реагентное хозяйство</b>
                <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                  Коагулянт выбран по pH {ph.toFixed(1)} (п. 6.270), дозы — по табл. 61 (п. 6.269).
                  Количества нужны для двух вещей: размера помещения реагентного хозяйства и графика поставок.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                    <thead>
                      <tr>
                        {["Реагент", "Доза, мг/л", "кг/сут", "кг/год", "Раствор, м³/сут", "Основание"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rg.lines.map((l) => (
                        <tr key={l.name}>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.name}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.doseMgL}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.kgPerDay}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.kgPerYear.toLocaleString("ru-RU")}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{l.solutionM3Day}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>{l.basis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, margin: "14px 0 0" }}>
                  {[
                    ["Расходный бак", `${rg.dailyTankM3} м³`],
                    ["Склад на 30 суток", `${rg.stockT} т`],
                    ["Насос-дозатор", `${rg.dosingPumpLh} л/ч`],
                    ["Камера хлопьеобразования", `${rg.flocChamberM3} м³ / ${rg.flocMinutes} мин`],
                    ["Градиент перемешивания", `${rg.gradientG} с⁻¹`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ fontSize: 13 }}>
                      <div style={{ color: FAINT, fontSize: 11 }}>{k}</div>
                      <b style={{ fontSize: 16 }}>{v}</b>
                    </div>
                  ))}
                </div>
                {rg.warnings.map((w) => (
                  <p key={w} style={{ fontSize: 12.5, color: "#ffb74d", margin: "10px 0 0", lineHeight: 1.6 }}>{w}</p>
                ))}
                {rg.assumptions.map((a) => (
                  <p key={a} style={{ fontSize: 12, color: FAINT, margin: "6px 0 0", lineHeight: 1.6 }}>{a}</p>
                ))}
              </div>
            );
          })()}

        {/* ================= РЕМОНТ И ПУСК =================
            Проект принимают в работающем виде, а живёт станция в двух
            других состояниях: когда одно сооружение выключено и когда
            биологии ещё нет. Оба состояния должны быть в проекте
            записаны, иначе их выясняют на площадке. */}
        {(() => {
          const out = checkOutage(groupsFromChain(calc.chain));
          return (
            <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
              <b style={{ fontSize: 16 }}>Вывод сооружения в ремонт и пусковой период</b>
              <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                Число единиц принято минимальным по нормам — это то, что обычно ставят на станции такого
                размера. Если в проекте секций больше, поправьте: перегрузка при выводе одной единицы
                считается как 1/(n−1) и от числа секций зависит напрямую.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Сооружение", "Единиц", "Перегрузка при выводе одной", "Оценка"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {out.rows.map((r) => (
                      <tr key={r.name}>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{r.name}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{r.units}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap", color: r.ok ? "#9ccc65" : "#ffb74d" }}>
                          {r.units > 1 ? `${r.overloadPct} %` : "работа прекращается"}
                        </td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>{r.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {out.warnings.map((w) => (
                <p key={w} style={{ fontSize: 12.5, color: "#ffb74d", margin: "10px 0 0", lineHeight: 1.6 }}>{w}</p>
              ))}

              <b style={{ fontSize: 14, display: "block", margin: "18px 0 8px" }}>Порядок пуска</b>
              {out.startup.map((s) => (
                <div key={s.step} style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {s.step} — {s.howLong}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#cfdde3", lineHeight: 1.6 }}>{s.what}</div>
                </div>
              ))}
              {out.assumptions.map((a) => (
                <p key={a} style={{ fontSize: 12, color: FAINT, margin: "6px 0 0", lineHeight: 1.6 }}>{a}</p>
              ))}
            </div>
          );
        })()}

        {/* ================= КОНСТРУКТИВ =================
            До сих пор толщины стен и днища были приняты по практике, и
            в примечании было честно написано, что их надо проверить.
            Здесь проверка и делается — прежде всего на всплытие, потому
            что пустая заглублённая ёмкость при высокой воде это понтон,
            а не сооружение. */}
        {calc.civil.basins.length > 0 &&
          (() => {
            const big = [...calc.civil.basins].sort((x, y) => y.volume - x.volume)[0];
            const gwlNum = gwl.trim() === "" ? undefined : parseFloat(gwl.replace(",", "."));
            const st = checkStructure({
              L: big.L,
              B: big.B,
              H: big.Hfull,
              /* низ днища от планировки: полная высота плюс толщина
                 днища — ёмкости приняты заглублёнными полностью */
              buryM: big.Hfull + a.slabThickness / 1000,
              gwlM: Number.isFinite(gwlNum as number) ? (gwlNum as number) : undefined,
              wallMm: a.wallThickness,
              slabMm: a.slabThickness,
              /* класс из допущений — число, а справочник знает только
                 те классы, для которых у нас есть расчётные
                 сопротивления; чего нет — считаем как B25 */
              concrete:
                a.concreteGrade >= 35 ? "B35" : a.concreteGrade >= 30 ? "B30" : a.concreteGrade >= 25 ? "B25" : "B20",
            });
            return (
              <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
                <b style={{ fontSize: 16 }}>Конструктив: проверка принятых толщин</b>
                <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                  Проверяется самая большая ёмкость — «{big.name}», {big.L} × {big.B} × {big.Hfull} м. Толщины взяты
                  из допущений: стена {a.wallThickness} мм, днище {a.slabThickness} мм.
                </p>

                <label style={{ display: "inline-flex", flexDirection: "column", gap: 4, fontSize: 12.5, marginBottom: 14 }}>
                  <span style={{ color: FAINT }}>Уровень грунтовых вод от планировки, м (из изысканий)</span>
                  <input
                    value={gwl}
                    onChange={(e) => setGwl(e.target.value)}
                    placeholder="не задан"
                    inputMode="decimal"
                    style={{ width: 180, padding: "7px 10px", borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.04)", color: "inherit", fontSize: 13 }}
                  />
                </label>

                <div style={{ border: `1px solid ${st.uplift.ok ? "rgba(156,204,101,0.4)" : "rgba(255,183,77,0.45)"}`, background: st.uplift.ok ? "rgba(156,204,101,0.06)" : "rgba(255,183,77,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Проверка на всплытие</div>
                  <div style={{ fontSize: 12.5, color: "#cfdde3", lineHeight: 1.6 }}>
                    Выталкивающая сила {st.uplift.buoyancyT} т, вес конструкции {st.uplift.weightT} т
                    {st.uplift.soilOnLedgeT > 0 ? `, грунт на выступе ${st.uplift.soilOnLedgeT} т` : ""}, коэффициент{" "}
                    <b>{st.uplift.factor}</b>.
                  </div>
                  <div style={{ fontSize: 12.5, color: st.uplift.ok ? "#9ccc65" : "#ffb74d", lineHeight: 1.6, marginTop: 6 }}>{st.uplift.comment}</div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                    <thead>
                      <tr>
                        {["Расчётный случай", "Момент, кН·м/м", "h₀ треб.", "h₀ принят", "Арматура", "Сетка"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {st.walls.map((w) => (
                        <tr key={w.caseName}>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{w.caseName}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{w.momentKNm}</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: w.ok ? "#9ccc65" : "#ffb74d" }}>{w.h0RequiredMm} мм</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{w.h0Mm} мм</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{w.asCm2} см²/м</td>
                          <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT }}>{w.bars}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ fontSize: 12.5, color: "#cfdde3", margin: "12px 0 0", lineHeight: 1.6 }}>
                  Минимальные толщины по практике для этой высоты: стена {st.minWallMm} мм, днище {st.minSlabMm} мм.
                </p>
                {st.warnings.map((w) => (
                  <p key={w} style={{ fontSize: 12.5, color: "#ffb74d", margin: "8px 0 0", lineHeight: 1.6 }}>{w}</p>
                ))}
                {st.assumptions.map((s) => (
                  <p key={s} style={{ fontSize: 12, color: FAINT, margin: "6px 0 0", lineHeight: 1.6 }}>{s}</p>
                ))}
              </div>
            );
          })()}

        {/* ================= ОТОПЛЕНИЕ И ВЕНТИЛЯЦИЯ =================
            Про здания вспоминают последними, а портят они именно
            пусковой период: воздуходувная без вытяжки уходит в тепловую
            защиту, решётчатое здание без вытяжки — это сероводород над
            лотком, где стоит человек. */}
        {(() => {
          const blowerKW = calc.power.items.find((i) => i.name.toLowerCase().includes("воздуходув"))?.installed;
          const tOutNum = parseFloat(tOut.replace(",", "."));
          const hv = calculateHvac(
            roomsFromChain(calc.chain, { blowerKW, areaScale: Q > 5000 ? 1.6 : Q > 1000 ? 1.2 : 1 }),
            Number.isFinite(tOutNum) ? tOutNum : undefined,
          );
          return (
            <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
              <b style={{ fontSize: 16 }}>Отопление и вентиляция зданий</b>
              <p style={{ fontSize: 12.5, color: FAINT, margin: "8px 0 12px", lineHeight: 1.6 }}>
                Суммарно на отопление и подогрев приточного воздуха <b>{hv.heatKW} кВт</b>, вытяжка{" "}
                <b>{hv.exhaustM3h.toLocaleString("ru-RU")} м³/ч</b>. Площади помещений приняты ориентировочно по
                составу сооружений — подставьте свои, когда будет план зданий.
              </p>

              <label style={{ display: "inline-flex", flexDirection: "column", gap: 4, fontSize: 12.5, marginBottom: 14 }}>
                <span style={{ color: FAINT }}>Расчётная зимняя температура, °C</span>
                <input
                  value={tOut}
                  onChange={(e) => setTOut(e.target.value)}
                  inputMode="decimal"
                  style={{ width: 140, padding: "7px 10px", borderRadius: 8, border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.04)", color: "inherit", fontSize: 13 }}
                />
              </label>

              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Помещение", "Объём, м³", "t, °C", "Приток", "Вытяжка", "Вентилятор", "Тепло, кВт", "По чему считалось"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hv.rooms.map((r) => (
                      <tr key={r.label}>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{r.label}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{r.volumeM3}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" }}>{r.tInC}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{r.supplyM3h.toLocaleString("ru-RU")}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{r.exhaustM3h.toLocaleString("ru-RU")}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>{r.fanM3h.toLocaleString("ru-RU")}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                          {r.heatTotalKW}
                          <span style={{ color: FAINT }}> ({r.heatLossKW}+{r.heatAirKW})</span>
                        </td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top", color: FAINT, lineHeight: 1.5 }}>
                          {r.basis}. {r.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hv.warnings.map((w) => (
                <p key={w} style={{ fontSize: 12.5, color: "#ffb74d", margin: "10px 0 0", lineHeight: 1.6 }}>{w}</p>
              ))}
              {hv.assumptions.map((s) => (
                <p key={s} style={{ fontSize: 12, color: FAINT, margin: "6px 0 0", lineHeight: 1.6 }}>{s}</p>
              ))}
            </div>
          );
        })()}

        {/* ================= ЧЕРТЕЖИ ================= */}
        {drawings && (
          <div className="stageCard" style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
            <b style={{ fontSize: 16 }}>{U.drawTitle}</b>
            <p style={{ fontSize: 13, color: "#cfdde3", margin: "8px 0 12px", lineHeight: 1.55 }}>{U.drawLead}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{U.drawNeedArea}</div>
                <b style={{ fontSize: 17 }}>{fmt(drawings.need.needM2)}</b> {U.unitM2}
              </div>
              <div style={{ fontSize: 13 }}>
                <div style={{ color: FAINT, fontSize: 11 }}>{U.drawHaveArea}</div>
                <b style={{ fontSize: 17 }}>{drawings.layout.generated ? "—" : fmt(drawings.layout.haveM2)}</b>{" "}
                {drawings.layout.generated ? "" : U.unitM2}
              </div>
            </div>

            {drawings.layout.generated ? (
              <p style={{ fontSize: 13, color: "#9ccc65", margin: "0 0 10px", lineHeight: 1.6 }}>{U.drawUnlimited}</p>
            ) : drawings.layout.fits ? (
              <p style={{ fontSize: 13, color: "#9ccc65", margin: "0 0 10px", lineHeight: 1.6 }}>{U.drawFits}</p>
            ) : (
              <div style={{ border: "1px solid rgba(255,183,77,0.45)", background: "rgba(255,183,77,0.07)", borderRadius: 10, padding: "12px 14px", margin: "0 0 12px" }}>
                <div style={{ fontSize: 13, color: "#ffb74d", marginBottom: 8 }}>
                  {U.drawDeficit}: <b>{fmt(drawings.layout.deficitM2)}</b> {U.unitM2}
                </div>
                {drawings.layout.hint.map((h, i) => (
                  <p key={i} style={{ fontSize: 12, color: "#cfdde3", margin: "0 0 5px", lineHeight: 1.55 }}>— {h}</p>
                ))}
              </div>
            )}

            <div style={{ fontSize: 12, letterSpacing: "0.08em", color: FAINT, margin: "0 0 8px" }}>{U.drawSheets}</div>
            <ol style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
              <li>{U.drawSheetRegister}</li>
              <li>{U.drawSheetSite}</li>
              {drawings.entries.map((e, i) => (
                <li key={i}>{e.title}</li>
              ))}
              <li>{U.drawSheetProfile}</li>
              <li>{U.drawSheetScheme}</li>
            </ol>

            <button type="button" onClick={downloadPackage} disabled={zipBusy} className="noPrint"
              style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: zipBusy ? "wait" : "pointer", background: zipBusy ? "#2a6d80" : ACCENT, color: "#06232e", fontSize: 15, fontWeight: 700 }}>
              {zipBusy ? U.drawBusy : U.drawButton}
            </button>

            {zipError && (
              <p className="noPrint" style={{ fontSize: 13, color: "#ff8a80", margin: "12px 0 0" }}>{zipError}</p>
            )}

            {/* СЧЁТ-ОФЕРТА */}
            {invoice && (
              <div className="noPrint" style={{ marginTop: 16, border: `1px solid ${ACCENT}`, background: "rgba(62,195,230,0.07)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 10 }}>{U.drawInvoiceTitle}</div>
                <p style={{ fontSize: 14, margin: "0 0 8px" }}>
                  {U.drawInvoiceNo} <b>{invoice.invoiceNo}</b> · {U.drawAmount}:{" "}
                  <b style={{ fontSize: 18 }}>{fmt(invoice.amount)}</b> {U.drawCurrency}
                </p>
                <p style={{ fontSize: 13, color: "#cfdde3", margin: "0 0 8px", lineHeight: 1.6 }}>
                  {U.objectWord}: {invoice.object} · {fmt(invoice.q)} {U.unitM3Day}
                </p>
                {invoice.lines.map((line, i) => (
                  <p key={i} style={{ fontSize: 12.5, color: "#cfdde3", margin: "0 0 6px", lineHeight: 1.6 }}>— {line}</p>
                ))}
                <div style={{ fontSize: 12.5, margin: "12px 0 0", lineHeight: 1.7 }}>
                  <div style={{ color: FAINT, fontSize: 11, letterSpacing: "0.08em", marginBottom: 4 }}>{U.drawPayee}</div>
                  {invoice.payee.name || invoice.payee.account ? (
                    <>
                      {invoice.payee.name && <div>{invoice.payee.name}</div>}
                      {invoice.payee.inn && <div>ИНН {invoice.payee.inn}</div>}
                      {invoice.payee.bank && <div>{invoice.payee.bank}</div>}
                      {invoice.payee.account && <div>р/с {invoice.payee.account}</div>}
                      {invoice.payee.mfo && <div>МФО {invoice.payee.mfo}</div>}
                      {invoice.payee.contact && <div>{invoice.payee.contact}</div>}
                    </>
                  ) : (
                    <div style={{ color: "#ffb74d" }}>{U.drawPayeePending}</div>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: "#cfdde3", margin: "12px 0 0", lineHeight: 1.6 }}>{U.drawPendingNote}</p>
                <button type="button" disabled title={U.drawCardSoon}
                  style={{ marginTop: 12, padding: "10px 20px", borderRadius: 8, border: `1px dashed ${LINE}`, background: "transparent", color: FAINT, fontSize: 13, cursor: "not-allowed" }}>
                  {U.drawCardSoon}
                </button>
                <p style={{ fontSize: 11.5, color: FAINT, margin: "8px 0 0", lineHeight: 1.6 }}>{U.drawCardNote}</p>
              </div>
            )}
          </div>
        )}

        {/* ОСОБЕННОСТИ ОТРАСЛИ */}
        <div style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, margin: "24px 0" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 10 }}>{U.industryNotesTitle}</div>
          {industry.notes.map((note, i) => (
            <p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>• {t(note, language)}</p>
          ))}
          <p style={{ fontSize: 11, color: FAINT, margin: 0 }}>{U.sourcesWord}: {industry.sources.map((x) => t(x, language)).join("; ")}. {U.methodsWord}: {kmkDocLine()}; DWA-A 131, EN 1825, EN 858 {t(TX.sourcesNotNormed, language)}.</p>
        </div>

        {/* ТЕХНИЧЕСКАЯ ЗАПИСКА */}
        {note && (
          <div id="techNote" className="stageCard"
            style={{ border: `1px solid ${note.source === "ai" ? "#9ccc65" : LINE}`, background: PANEL, borderRadius: 12, padding: "22px 24px", margin: "0 0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.1em", color: note.source === "ai" ? "#9ccc65" : ACCENT }}>
                {note.source === "ai" ? U.noteAiBadge : U.noteTemplateBadge}
              </div>
              <div className="noPrint" style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={downloadNote}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "transparent", color: "#eaf6fa", fontSize: 12, cursor: "pointer" }}>
                  {U.noteDownload}
                </button>
                <button type="button" onClick={() => window.print()}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "transparent", color: "#eaf6fa", fontSize: 12, cursor: "pointer" }}>
                  {U.notePdf}
                </button>
              </div>
            </div>
            {note.source === "template" && (
              <p className="noPrint" style={{ fontSize: 12, color: "#ffb74d", margin: "0 0 12px" }}>
                {t(TX.noteFallbackPre, language)}{note.reason ? ` (${note.reason})` : ""}{t(TX.noteFallbackTail, language)}
              </p>
            )}
            <NoteView markdown={note.text} />
          </div>
        )}

        {/* ДЕЙСТВИЯ */}
        <div className="noPrint" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
          <button type="button" onClick={makeNote} disabled={noteBusy}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: noteBusy ? "wait" : "pointer", background: noteBusy ? "#2a6d80" : "#9ccc65", color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            {noteBusy ? U.btnNoteBusy : note ? U.btnNoteAgain : U.btnNote}
          </button>
          <button type="button" onClick={() => window.print()}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: "pointer", background: ACCENT, color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            {U.btnPdf}
          </button>
          <button type="button" onClick={downloadNoteDocx} disabled={docBusy}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: docBusy ? "wait" : "pointer", background: docBusy ? "#2a6d80" : "#7fb1e0", color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            {docBusy ? U.btnNoteDocxBusy : U.btnNoteDocx}
          </button>
          <button type="button" onClick={downloadSpecXlsx} disabled={xlsBusy}
            style={{ padding: "13px 26px", borderRadius: 10, border: 0, cursor: xlsBusy ? "wait" : "pointer", background: xlsBusy ? "#2a6d80" : "#8fce9a", color: "#06232e", fontSize: 15, fontWeight: 700 }}>
            {xlsBusy ? U.btnSpecXlsxBusy : U.btnSpecXlsx}
          </button>
          <button type="button" onClick={dxfScheme}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            {U.btnDxfScheme}
          </button>
          <button type="button" onClick={dxfPid}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            Схема автоматизации DXF
          </button>
          <button type="button" onClick={dxfModels}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            {U.btnDxfModels}
          </button>
          <button type="button" onClick={downloadPackage} disabled={zipBusy}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${ACCENT}`, cursor: zipBusy ? "wait" : "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15, fontWeight: 600 }}>
            {zipBusy ? U.drawBusy : U.drawButton}
          </button>
          <button type="button" onClick={printScheme}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15 }}>
            {U.btnPrintScheme}
          </button>
          <button type="button" onClick={printModels}
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, cursor: "pointer", background: "transparent", color: "#eaf6fa", fontSize: 15 }}>
            {U.btnPrintModels}
          </button>
          {fileError ? (
            <span style={{ color: "#e5a54b", fontSize: 13, alignSelf: "center" }}>{fileError}</span>
          ) : null}
          <a href="/engineering/assumptions"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            {U.btnAssumptions}
          </a>
          <a href="/designers"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            {U.btnForms}
          </a>
          <a href="/#contacts"
            style={{ padding: "13px 26px", borderRadius: 10, border: `1px solid ${LINE}`, color: "#eaf6fa", textDecoration: "none", fontSize: 15 }}>
            {U.btnQuote}
          </a>
        </div>

        <p style={{ fontSize: 11, color: FAINT, marginTop: 26, lineHeight: 1.6 }}>
          {U.disclaimer} {U.supplyNote}
        </p>
        <p className="noPrint" style={{ fontSize: 11, color: FAINT, marginTop: 8, lineHeight: 1.6 }}>
          {U.dxfNote}
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
