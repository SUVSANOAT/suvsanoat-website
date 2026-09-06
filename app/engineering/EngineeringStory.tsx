"use client";

/* ==================================================================
 * ПЕРВЫЙ ЭКРАН «ИНЖИНИРИНГА» — ОДНА СЦЕНА, ПО КОТОРОЙ ЕДЕТ КАМЕРА
 *
 * Раньше первый экран был статичной картинкой, а сцена жила ниже
 * отдельной секцией. Теперь это одно и то же: первый экран САМ является
 * закреплённой сценой. Слева — неподвижная колонка с заголовком и
 * кнопками (её содержимое приходит из page.tsx через children и при
 * прокрутке не меняется вовсе), справа — поле, на котором за восемь
 * этапов рождается проект.
 *
 * Почему так честно, а не «красиво». В сцене нет ни одной нарисованной
 * от руки линии: площадка (layoutSite), биореактор (mbrGeometry) и
 * гидравлический профиль (computeProfile) считаются теми же функциями
 * библиотеки, что и комплект DXF, который потом скачивает пользователь.
 * Поэтому наезд камеры с генплана на биореактор физически честен —
 * масштаб не подменяется, сооружение занимает на площадке ровно
 * столько, сколько показано. Проектировщик первым делом проверяет,
 * сходятся ли размеры; на подделке это видно сразу.
 *
 * УСТРОЙСТВО ПРОКРУТКИ. Секция высокая (760vh) — это только «топливо».
 * Внутри неё один sticky-экран на 100vh, и он НЕ едет: страница под
 * колесом мыши стоит, меняется содержимое сцены. Прогресс секции 0…1
 * делится на восемь равных отрезков (этапов). Внутри этапа камера
 * сперва стоит (идёт содержательная анимация), а последние 38 % отрезка
 * переезжает к следующему кадру. Поэтому граница этапов — не смена
 * слайда, а один непрерывный наезд.
 *
 * ПОЧЕМУ ВСЁ ИМПЕРАТИВНО. React при прокрутке не перерисовывается: на
 * каждый пиксель прокрутки пересобирать дерево из ~250 путей нельзя,
 * на телефоне это сразу видно по пропущенным кадрам. Один слушатель
 * scroll/resize, один requestAnimationFrame, дальше — ref-ы, атрибуты
 * и CSS-переменные. Единственное состояние — индекс активного этапа
 * (нужен рейке и вспышке сканера), и он меняется восемь раз за проход.
 *
 * ДЕГРАДАЦИЯ. Класс .animated вешается только после монтирования и
 * только если система не просит уменьшить движение. Без JS левая
 * колонка читается полностью, а сцена отдаётся прочерченной целиком:
 * ни один путь не спрятан «навсегда».
 * ================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import styles from "./story.module.css";
import { useLanguage } from "../LanguageContext";
import type { Language } from "../translations";
import type { StructureKind } from "../../drawings/core/types";
import {
  mbrPlan,
  mbrSection,
  storyNumbers,
  storyProfile,
  storyScene,
  STORY_INPUT,
  type SceneShot,
  type StoryDrawing,
  type StoryNumberKey,
  type CaptionKey,
} from "./story-geometry";

/* Восемь этапов. Число вынесено в константу, потому что от него зависят
   и деление прогресса, и длина массива кадров камеры, и высота секции
   в CSS — разъехаться они не должны. */
const PHASES = 8;

/* ------------------------------------------------------------------
 * ТЕКСТЫ
 *
 * Страница четырёхъязычная, поэтому русского текста в разметке нет.
 * Исключение — то, что приходит из story-geometry.ts: подписи внутри
 * чертежа. Это не интерфейс, а содержимое документа: «АЭРОБНАЯ ЗОНА»
 * и «ҚМҚ 2.04.03-19, п. 6.150» попадут в DXF и в записку ровно в таком
 * виде, и подменять их на лету — значит показывать посетителю не то,
 * что он потом скачает.
 * ------------------------------------------------------------------ */

type PhaseText = { rail: string; label: string; title: string; text: string };

type StoryText = {
  kicker: string;
  hint: string;
  /** Постоянная строка на поле: она отвечает на вопрос «что я вижу».
   *  Без неё сцена читается как заставка, а не как сборка проекта. */
  legend: string;
  /** ровно PHASES штук */
  phases: PhaseText[];
  /** названия видов для статусной строки, по ключу кадра */
  views: Record<SceneShot["key"], string>;
  /** этап 1: разбор задания */
  briefTitle: string;
  briefNote: string;
  brief: { flow: string; bod: string; ss: string; tn: string; outlet: string };
  units: { qd: string; mgl: string; m: string };
  /** этап 2: цепочка ступеней */
  chainTitle: string;
  chain: string[];
  areaLabel: string;
  areaUnit: string;
  /** названия ступеней по типу сооружения; по порядковому номеру их
   *  подставлять нельзя — состав цепочки зависит от отрасли */
  stageNames: Partial<Record<StructureKind, string>>;
  calcTitle: string;
  calcNote: string;
  calcLabels: Record<StoryNumberKey, string>;
  captionLabels: Record<CaptionKey, string>;
  sheetTitles: { plan: string; section: string };
  /** этап 8: профиль и вывод расчёта */
  profileTitle: string;
  verdictTitle: string;
  verdictText: string;
  /** предупреждение о растянутой вертикали профиля */
  profScaleNote: string;
  headLabel: string;
  deliverTitle: string;
  deliver: string[];
  cta: string;
  ctaNote: string;
};

const T: Record<Language, StoryText> = {
  ru: {
    kicker: "КАК РОЖДАЕТСЯ ПРОЕКТ",
    hint: "Прокрутите — сцена меняется на месте",
    legend:
      "Пошаговая сборка проекта: восемь шагов от задания до чертежей. Всё показанное посчитано по нормам.",
    phases: [
      {
        rail: "Задание",
        label: "ЭТАП 01 / ИСХОДНЫЕ ДАННЫЕ",
        title: "Разбор задания",
        text: "Из описания объекта извлекаются расчётные величины: расход, состав стока, требования к сбросу. Дальше считается всё именно от них.",
      },
      {
        rail: "Цепочка",
        label: "ЭТАП 02 / ТЕХНОЛОГИЯ",
        title: "Технологическая цепочка",
        text: "Ступени выстраиваются по составу стока и требуемой глубине очистки: от решётки до обработки осадка. Не набор аппаратов, а последовательность процессов.",
      },
      {
        rail: "Генплан",
        label: "ЭТАП 03 / ПЛОЩАДКА",
        title: "Генплан площадки",
        text: "Сооружения расставляются по ходу потока: ряд воды, ряд осадка, проезды и ограждение. Компоновка считается, а не рисуется, — потребная площадь застройки известна ещё до чертежа.",
      },
      {
        rail: "Линия воды",
        label: "ЭТАП 04 / ХОД ВОДЫ",
        title: "Линия очистки",
        text: "От подводящего коллектора до выпуска. Ряд осадка и здания уходят в фон: сейчас важно только то, через что идёт вода.",
      },
      {
        rail: "Расчёт",
        label: "ЭТАП 05 / РАСЧЁТ",
        title: "Расчёт сооружений",
        text: "Объёмы, число линий, ширина коридора, площадь мембран и расход воздуха — каждая величина со ссылкой на пункт ҚМҚ 2.04.03-19, а не подобрана по аналогу.",
      },
      {
        rail: "План",
        label: "ЭТАП 06 / БИОРЕАКТОР",
        title: "План сооружения",
        text: "Схематичный прямоугольник растворяется, и на его месте прочерчивается настоящий план: контур, бетон, оборудование, вода, размеры — в том же порядке, в каком чертит человек.",
      },
      {
        rail: "Разрез",
        label: "ЭТАП 07 / РАЗРЕЗ",
        title: "Разрез 1-1",
        text: "Рабочая глубина, борт и отметки — то, что проверяют первым. Сооружение наполняется водой снизу вверх, как при пусконаладке.",
      },
      {
        rail: "Профиль",
        label: "ЭТАП 08 / ГИДРАВЛИКА",
        title: "Гидравлический профиль",
        text: "Вода идёт по сооружениям самотёком, и весь вопрос — хватит ли перепада. Здесь расчёт ловит проблему сам, до стройки.",
      },
    ],
    views: {
      site: "ГЕНПЛАН",
      train: "ЛИНИЯ ОЧИСТКИ",
      plan: "БИОРЕАКТОР · ПЛАН",
      section: "БИОРЕАКТОР · РАЗРЕЗ 1-1",
      profile: "ГИДРАВЛИЧЕСКИЙ ПРОФИЛЬ",
    },
    briefTitle: "ИСХОДНЫЕ ДАННЫЕ И ТЗ",
    briefNote: "Посёлок · хозбытовой сток · ҚМҚ 2.04.03-19",
    brief: {
      flow: "Расчётный расход",
      bod: "БПК полн.",
      ss: "Взвешенные вещества",
      tn: "Азот общий",
      outlet: "Отметка точки сброса",
    },
    units: { qd: "м³/сут", mgl: "мг/л", m: "м" },
    chainTitle: "ТЕХНОЛОГИЧЕСКАЯ ЦЕПОЧКА",
    chain: [
      "Решётка",
      "Песколовка",
      "Усреднитель",
      "Биореактор MBR",
      "Доочистка",
      "Обеззараживание",
      "Обработка осадка",
    ],
    areaLabel: "ПОТРЕБНАЯ ПЛОЩАДЬ ЗАСТРОЙКИ",
    areaUnit: "м²",
    stageNames: {
      mech: "Механическая очистка",
      equal: "Усреднитель",
      mbr: "Биореактор MBR",
      uv: "Доочистка и обеззараживание",
      thickener: "Илоуплотнитель",
      stabilizer: "Аэробный стабилизатор",
      dewatering: "Обезвоживание осадка",
      "sludge-beds": "Иловые площадки",
      blower: "Воздуходувная станция",
    },
    calcTitle: "ВЕДОМОСТЬ РАСЧЁТА",
    calcNote: "Печатается на каждом листе комплекта",
    calcLabels: {
      flow: "Расчётный расход сточных вод",
      flowMax: "Максимальный часовой расход",
      vBio: "Объём биологической ступени",
      lines: "Число технологических линий",
      width: "Ширина коридора",
      membrane: "Площадь мембран",
      air: "Расход воздуха на аэрацию",
      size: "Габарит сооружения",
    },
    captionLabels: {
      flow: "Расход",
      lines: "Число линий",
      size: "Габарит",
      depth: "Глубина воды",
      depthWork: "Рабочая глубина",
      heightTotal: "Полная высота стен",
      wall: "Толщина стен",
      bottomElev: "Отметка дна",
    },
    sheetTitles: {
      plan: "Мембранный биореактор. План",
      section: "Мембранный биореактор. Разрез 1-1",
    },
    profileTitle: "ОТМЕТКИ УРОВНЯ ВОДЫ",
    verdictTitle: "САМОТЁК НЕ ПРОХОДИТ",
    verdictText:
      "Перепада от входа до точки сброса не хватает — воду поднимает насосная станция. Расчёт находит это сам, до стройки.",
    profScaleNote:
      "Вертикальный масштаб профиля растянут: перепад в метр на полусотне метров пути иначе не разглядеть. Глубины сооружений на этом виде преувеличены, размеры — только по чертежам.",
    headLabel: "ПОТРЕБНЫЙ НАПОР",
    deliverTitle: "ЧТО ВЫ СКАЧИВАЕТЕ",
    deliver: [
      "Комплект листов А1 в формате DXF",
      "Ведомость расчёта на каждом листе",
      "Спецификация с разделением «производим сами / покупаем»",
      "Пояснительная записка с обоснованием решений",
    ],
    cta: "Начать расчёт",
    ctaNote: "Результат предварительный и уточняется инженером",
  },

  uz: {
    kicker: "LOYIHA QANDAY TUG‘ILADI",
    hint: "Aylantiring — sahna joyida o‘zgaradi",
    legend:
      "Loyihaning bosqichma-bosqich yig‘ilishi: topshiriqdan chizmalargacha sakkiz qadam. Ko‘rsatilgan hamma narsa me’yorlar bo‘yicha hisoblangan.",
    phases: [
      {
        rail: "Topshiriq",
        label: "01-BOSQICH / DASTLABKI MA’LUMOTLAR",
        title: "Topshiriq tahlili",
        text: "Obyekt tavsifidan hisobiy kattaliklar ajratiladi: sarf, oqava tarkibi, chiqarishga qo‘yilgan talablar. Keyingi hisoblar aynan shulardan boshlanadi.",
      },
      {
        rail: "Zanjir",
        label: "02-BOSQICH / TEXNOLOGIYA",
        title: "Texnologik zanjir",
        text: "Bosqichlar oqava tarkibi va talab qilinadigan tozalash darajasiga qarab tuziladi: panjaradan cho‘kindini qayta ishlashgacha. Bu apparatlar to‘plami emas, jarayonlar ketma-ketligi.",
      },
      {
        rail: "Bosh reja",
        label: "03-BOSQICH / MAYDON",
        title: "Maydon bosh rejasi",
        text: "Inshootlar oqim yo‘nalishi bo‘yicha joylashtiriladi: suv qatori, cho‘kindi qatori, yo‘llar va to‘siq. Joylashuv chizilmaydi, hisoblanadi — talab qilinadigan qurilish maydoni chizmagacha ma’lum bo‘ladi.",
      },
      {
        rail: "Suv liniyasi",
        label: "04-BOSQICH / SUVNING YO‘LI",
        title: "Tozalash liniyasi",
        text: "Keltiruvchi kollektordan chiqarish nuqtasigacha. Cho‘kindi qatori va binolar fonga o‘tadi: hozir faqat suv o‘tadigan inshootlar muhim.",
      },
      {
        rail: "Hisob",
        label: "05-BOSQICH / HISOB",
        title: "Inshootlar hisobi",
        text: "Hajmlar, liniyalar soni, yo‘lak kengligi, membranalar yuzasi va havo sarfi — har bir kattalik ҚМҚ 2.04.03-19 bandiga havola bilan, o‘xshash obyektdan olinmagan.",
      },
      {
        rail: "Plan",
        label: "06-BOSQICH / BIOREAKTOR",
        title: "Inshoot plani",
        text: "Sxematik to‘rtburchak eriydi va uning o‘rnida haqiqiy plan chiziladi: kontur, beton, uskunalar, suv, o‘lchamlar — odam chizadigan tartibda.",
      },
      {
        rail: "Kesim",
        label: "07-BOSQICH / KESIM",
        title: "1-1 kesim",
        text: "Ishchi chuqurlik, bort va belgilar — birinchi navbatda tekshiriladigan narsalar. Inshoot pastdan yuqoriga suvga to‘ladi, xuddi ishga tushirishdagidek.",
      },
      {
        rail: "Profil",
        label: "08-BOSQICH / GIDRAVLIKA",
        title: "Gidravlik profil",
        text: "Suv inshootlar orasidan o‘z oqimi bilan o‘tadi, butun savol — balandliklar farqi yetadimi. Hisob bu muammoni qurilishgacha o‘zi topadi.",
      },
    ],
    views: {
      site: "BOSH REJA",
      train: "TOZALASH LINIYASI",
      plan: "BIOREAKTOR · PLAN",
      section: "BIOREAKTOR · 1-1 KESIM",
      profile: "GIDRAVLIK PROFIL",
    },
    briefTitle: "DASTLABKI MA’LUMOTLAR VA TOPSHIRIQ",
    briefNote: "Qishloq · maishiy oqava · ҚМҚ 2.04.03-19",
    brief: {
      flow: "Hisobiy sarf",
      bod: "To‘liq BPK",
      ss: "Muallaq moddalar",
      tn: "Umumiy azot",
      outlet: "Chiqarish nuqtasi belgisi",
    },
    units: { qd: "m³/kun", mgl: "mg/l", m: "m" },
    chainTitle: "TEXNOLOGIK ZANJIR",
    chain: [
      "Panjara",
      "Qum tutgich",
      "O‘rtachalashtirgich",
      "MBR bioreaktor",
      "Qo‘shimcha tozalash",
      "Zararsizlantirish",
      "Cho‘kindini qayta ishlash",
    ],
    areaLabel: "TALAB QILINADIGAN QURILISH MAYDONI",
    areaUnit: "m²",
    stageNames: {
      mech: "Mexanik tozalash",
      equal: "O‘rtachalashtirgich",
      mbr: "MBR bioreaktor",
      uv: "Qo‘shimcha tozalash va zararsizlantirish",
      thickener: "Cho‘kindi quyuqlashtirgich",
      stabilizer: "Aerob stabilizator",
      dewatering: "Cho‘kindini suvsizlantirish",
      "sludge-beds": "Cho‘kindi maydonchalari",
      blower: "Havo puflagich stansiyasi",
    },
    calcTitle: "HISOB VEDOMOSTI",
    calcNote: "Komplektning har bir varag‘ida chop etiladi",
    calcLabels: {
      flow: "Hisobiy oqava suv sarfi",
      flowMax: "Maksimal soatlik sarf",
      vBio: "Biologik bosqich hajmi",
      lines: "Texnologik liniyalar soni",
      width: "Yo‘lak kengligi",
      membrane: "Membranalar yuzasi",
      air: "Aeratsiya uchun havo sarfi",
      size: "Inshoot gabariti",
    },
    captionLabels: {
      flow: "Sarf",
      lines: "Liniyalar soni",
      size: "Gabarit",
      depth: "Suv chuqurligi",
      depthWork: "Ishchi chuqurlik",
      heightTotal: "Devorlarning to‘liq balandligi",
      wall: "Devor qalinligi",
      bottomElev: "Tub belgisi",
    },
    sheetTitles: {
      plan: "Membranali bioreaktor. Plan",
      section: "Membranali bioreaktor. 1-1 kesim",
    },
    profileTitle: "SUV SATHI BELGILARI",
    verdictTitle: "O‘Z OQIMI BILAN O‘TMAYDI",
    verdictText:
      "Kirishdan chiqarish nuqtasigacha balandliklar farqi yetmaydi — suvni nasos stansiyasi ko‘taradi. Hisob buni qurilishgacha o‘zi aniqlaydi.",
    profScaleNote:
      "Profilning vertikal masshtabi cho‘zilgan: aks holda ellik metr yo‘lda bir metrlik farqni ko‘rib bo‘lmaydi. Bu ko‘rinishda inshootlar chuqurligi bo‘rttirilgan, o‘lchamlar faqat chizmalar bo‘yicha.",
    headLabel: "TALAB QILINADIGAN BOSIM",
    deliverTitle: "SIZ NIMANI YUKLAB OLASIZ",
    deliver: [
      "DXF formatidagi A1 varaqlar komplekti",
      "Har bir varaqdagi hisob vedomosti",
      "«O‘zimiz ishlab chiqaramiz / sotib olamiz» bo‘linishi bilan spetsifikatsiya",
      "Yechimlar asoslangan tushuntirish xati",
    ],
    cta: "Hisobni boshlash",
    ctaNote: "Natija dastlabki bo‘lib, muhandis tomonidan aniqlashtiriladi",
  },

  en: {
    kicker: "HOW A DESIGN IS BORN",
    hint: "Scroll — the scene changes in place",
    legend:
      "A design assembled step by step: eight steps from the brief to the drawings. Everything shown is calculated to the norms.",
    phases: [
      {
        rail: "Brief",
        label: "STEP 01 / INPUT DATA",
        title: "Reading the brief",
        text: "Design figures are extracted from the description of the site: flow, wastewater composition, discharge requirements. Everything downstream follows from them.",
      },
      {
        rail: "Process",
        label: "STEP 02 / PROCESS",
        title: "The treatment chain",
        text: "Stages follow from the wastewater composition and the required degree of treatment: from the screen to sludge handling. A sequence of processes, not a shopping list of units.",
      },
      {
        rail: "Site",
        label: "STEP 03 / SITE",
        title: "General layout",
        text: "Structures are placed along the flow: the water row, the sludge row, roads and the fence. The layout is calculated rather than drawn — the required footprint is known before the drawing exists.",
      },
      {
        rail: "Water line",
        label: "STEP 04 / PATH OF WATER",
        title: "The treatment line",
        text: "From the incoming sewer to the outfall. The sludge row and the buildings fall back: only what the water passes through matters now.",
      },
      {
        rail: "Sizing",
        label: "STEP 05 / SIZING",
        title: "Sizing the structures",
        text: "Volumes, number of lines, corridor width, membrane area and air flow — every figure with a reference to a clause of ҚМҚ 2.04.03-19, not copied from a similar plant.",
      },
      {
        rail: "Plan",
        label: "STEP 06 / BIOREACTOR",
        title: "Plan of the structure",
        text: "The schematic rectangle dissolves and a real plan is drawn in its place: outline, concrete, equipment, water, dimensions — in the order a person draws them.",
      },
      {
        rail: "Section",
        label: "STEP 07 / SECTION",
        title: "Section 1-1",
        text: "Working depth, freeboard and levels — the first things anyone checks. The structure fills with water from the bottom up, as it does at commissioning.",
      },
      {
        rail: "Profile",
        label: "STEP 08 / HYDRAULICS",
        title: "Hydraulic profile",
        text: "The water runs through the structures by gravity, and the whole question is whether the available fall is enough. Here the calculation catches the problem itself, before construction.",
      },
    ],
    views: {
      site: "GENERAL LAYOUT",
      train: "TREATMENT LINE",
      plan: "BIOREACTOR · PLAN",
      section: "BIOREACTOR · SECTION 1-1",
      profile: "HYDRAULIC PROFILE",
    },
    briefTitle: "INPUT DATA AND BRIEF",
    briefNote: "Settlement · domestic wastewater · ҚМҚ 2.04.03-19",
    brief: {
      flow: "Design flow",
      bod: "BOD total",
      ss: "Suspended solids",
      tn: "Total nitrogen",
      outlet: "Discharge point level",
    },
    units: { qd: "m³/day", mgl: "mg/l", m: "m" },
    chainTitle: "TREATMENT CHAIN",
    chain: [
      "Screen",
      "Grit chamber",
      "Equalisation",
      "MBR bioreactor",
      "Polishing",
      "Disinfection",
      "Sludge handling",
    ],
    areaLabel: "REQUIRED FOOTPRINT",
    areaUnit: "m²",
    stageNames: {
      mech: "Mechanical treatment",
      equal: "Equalisation tank",
      mbr: "MBR bioreactor",
      uv: "Polishing and disinfection",
      thickener: "Sludge thickener",
      stabilizer: "Aerobic stabiliser",
      dewatering: "Sludge dewatering",
      "sludge-beds": "Sludge drying beds",
      blower: "Blower house",
    },
    calcTitle: "CALCULATION SCHEDULE",
    calcNote: "Printed on every sheet of the set",
    calcLabels: {
      flow: "Design wastewater flow",
      flowMax: "Maximum hourly flow",
      vBio: "Volume of the biological stage",
      lines: "Number of process lines",
      width: "Corridor width",
      membrane: "Membrane area",
      air: "Aeration air flow",
      size: "Structure footprint",
    },
    captionLabels: {
      flow: "Flow",
      lines: "Lines",
      size: "Footprint",
      depth: "Water depth",
      depthWork: "Working depth",
      heightTotal: "Total wall height",
      wall: "Wall thickness",
      bottomElev: "Bottom level",
    },
    sheetTitles: {
      plan: "Membrane bioreactor. Plan",
      section: "Membrane bioreactor. Section 1-1",
    },
    profileTitle: "WATER SURFACE LEVELS",
    verdictTitle: "GRAVITY FLOW DOES NOT WORK",
    verdictText:
      "The fall from the inlet to the discharge point is not enough — a pumping station lifts the water. The calculation finds this by itself, before construction.",
    profScaleNote:
      "The vertical scale of the profile is exaggerated: a one-metre fall over fifty metres of run is otherwise invisible. Structure depths look deeper than they are here; take dimensions from the drawings only.",
    headLabel: "REQUIRED HEAD",
    deliverTitle: "WHAT YOU DOWNLOAD",
    deliver: [
      "A set of A1 sheets in DXF",
      "The calculation schedule on every sheet",
      "An equipment schedule split into “made in-house / purchased”",
      "A technical note justifying the decisions",
    ],
    cta: "Start calculation",
    ctaNote: "The result is preliminary and is verified by an engineer",
  },

  zh: {
    kicker: "设计方案如何诞生",
    hint: "滚动鼠标 — 画面原地变化",
    legend:
      "方案的逐步生成：从任务书到图纸共八步。所示全部内容均按规范计算得出。",
    phases: [
      {
        rail: "任务书",
        label: "第 01 阶段 / 原始数据",
        title: "解读任务书",
        text: "从项目描述中提取计算参数：流量、进水水质、排放要求。后续所有计算都以此为起点。",
      },
      {
        rail: "工艺链",
        label: "第 02 阶段 / 工艺",
        title: "工艺流程链",
        text: "各处理段依据进水水质和出水要求排列：从格栅到污泥处理。这是工艺流程的顺序，而不是设备的堆砌。",
      },
      {
        rail: "总平面",
        label: "第 03 阶段 / 厂区",
        title: "厂区总平面",
        text: "构筑物沿水流方向布置：水处理排、污泥排、道路与围墙。平面布置是算出来的，不是画出来的 — 所需占地面积在出图之前就已确定。",
      },
      {
        rail: "水线",
        label: "第 04 阶段 / 水的流向",
        title: "处理流程线",
        text: "从进水总管到排放口。污泥排和建筑物退到背景中：此刻只有水所流经的构筑物才重要。",
      },
      {
        rail: "计算",
        label: "第 05 阶段 / 计算",
        title: "构筑物计算",
        text: "容积、工艺线数量、廊道宽度、膜面积与风量 — 每一个数值都注明 ҚМҚ 2.04.03-19 的条款，而不是照搬同类工程。",
      },
      {
        rail: "平面图",
        label: "第 06 阶段 / 生化池",
        title: "构筑物平面",
        text: "示意矩形溶解，真实图纸在原位被画出：轮廓、混凝土、设备、水位、尺寸 — 按人工绘图的顺序。",
      },
      {
        rail: "剖面图",
        label: "第 07 阶段 / 剖面",
        title: "1-1 剖面",
        text: "有效水深、超高与标高 — 这些是最先被核对的内容。池体自下而上充水，如同调试运行。",
      },
      {
        rail: "高程",
        label: "第 08 阶段 / 水力",
        title: "水力高程图",
        text: "水靠重力流经各构筑物，关键问题在于可用落差是否足够。计算会在施工之前自行发现问题。",
      },
    ],
    views: {
      site: "总平面",
      train: "处理流程",
      plan: "生物反应池 · 平面",
      section: "生物反应池 · 1-1 剖面",
      profile: "水力高程图",
    },
    briefTitle: "原始数据与任务书",
    briefNote: "居民点 · 生活污水 · ҚМҚ 2.04.03-19",
    brief: {
      flow: "设计流量",
      bod: "BOD 总量",
      ss: "悬浮物",
      tn: "总氮",
      outlet: "排放点标高",
    },
    units: { qd: "m³/天", mgl: "mg/L", m: "m" },
    chainTitle: "工艺流程链",
    chain: ["格栅", "沉砂池", "调节池", "MBR 生物反应池", "深度处理", "消毒", "污泥处理"],
    areaLabel: "所需占地面积",
    areaUnit: "m²",
    stageNames: {
      mech: "机械预处理",
      equal: "调节池",
      mbr: "MBR 生物反应池",
      uv: "深度处理与消毒",
      thickener: "污泥浓缩池",
      stabilizer: "好氧稳定池",
      dewatering: "污泥脱水",
      "sludge-beds": "干化场",
      blower: "鼓风机房",
    },
    calcTitle: "计算表",
    calcNote: "打印在整套图纸的每一张上",
    calcLabels: {
      flow: "设计污水流量",
      flowMax: "最大小时流量",
      vBio: "生物处理段容积",
      lines: "工艺线数量",
      width: "廊道宽度",
      membrane: "膜面积",
      air: "曝气所需风量",
      size: "构筑物外形尺寸",
    },
    captionLabels: {
      flow: "流量",
      lines: "线数",
      size: "外形尺寸",
      depth: "水深",
      depthWork: "有效水深",
      heightTotal: "墙体总高",
      wall: "墙厚",
      bottomElev: "池底标高",
    },
    sheetTitles: {
      plan: "膜生物反应池. 平面图",
      section: "膜生物反应池. 1-1 剖面",
    },
    profileTitle: "水面标高",
    verdictTitle: "重力流不成立",
    verdictText: "从进水到排放点的落差不足 — 需由泵站提升。计算在施工之前就自行发现了这一点。",
    profScaleNote:
      "剖面纵向比例已放大：五十米路程上一米落差否则无法辨认。此视图中构筑物深度被夸大，尺寸请以图纸为准。",
    headLabel: "所需扬程",
    deliverTitle: "您将获得什么",
    deliver: [
      "DXF 格式的 A1 图纸整套",
      "每张图纸上的计算表",
      "区分「自制 / 外购」的设备清单",
      "含方案论证的技术说明书",
    ],
    cta: "开始计算",
    ctaNote: "结果为初步方案，需由工程师核定",
  },
};

/* ------------------------------------------------------------------
 * ЧИСЛА: разбор строки на «текст + число»
 *
 * storyNumbers() отдаёт уже отформатированные величины — «14 900 × 10 500»,
 * «1 500». Чтобы такое число «набежало» при прокрутке, строка режется на
 * куски: числа считаются, разделители остаются как есть. Так работает
 * любой формат, включая габарит из двух чисел и дробные значения.
 * ------------------------------------------------------------------ */

type NumPart = { text: string } | { n: number; digits: number };

const NUMBER_RE = /\d[\d\s ]*(?:[.,]\d+)?/g;

function splitNumbers(value: string): NumPart[] {
  const parts: NumPart[] = [];
  let last = 0;
  for (const m of value.matchAll(NUMBER_RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push({ text: value.slice(last, at) });
    const raw = m[0].replace(/[\s ]/g, "").replace(",", ".");
    const dot = raw.indexOf(".");
    parts.push({ n: Number(raw), digits: dot < 0 ? 0 : raw.length - dot - 1 });
    last = at + m[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last) });
  return parts;
}

function renderNumbers(parts: NumPart[], k: number): string {
  return parts
    .map((p) =>
      "text" in p
        ? p.text
        : (p.n * k).toLocaleString("ru-RU", {
            minimumFractionDigits: p.digits,
            maximumFractionDigits: p.digits,
          })
    )
    .join("");
}

/* ------------------------------------------------------------------
 * ЧЕРТЁЖ: очередь появления слоёв
 *
 * Порядок тот же, в каком чертит человек: сначала контур сооружения,
 * потом штриховка бетона, оборудование, вода и в последнюю очередь
 * размеры. Подписи включаются, когда линии уже стоят.
 * ------------------------------------------------------------------ */

const LAYER_ORDER: Record<string, number> = { contour: 0, hatch: 1, equip: 2, water: 3, dim: 4 };

function orderedPaths(d: StoryDrawing) {
  return d.paths
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer] || a.i - b.i);
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/* замедление к концу: счётчик и прорисовка не должны «дёргаться» на выходе */
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
/* разгон и торможение — для камеры: резкий старт наезда выглядит как рывок */
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

/** ломаная в путь SVG */
function poly(pts: [number, number][], closed: boolean): string {
  return `M ${pts.map((p) => `${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(" L ")}${closed ? " Z" : ""}`;
}

/** прямоугольник в путь: нужен, чтобы блоки прочерчивались, а не «включались» */
function rectPath(x: number, y: number, w: number, h: number): string {
  return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
}

/** отметка в чертёжном виде: знак всегда, три знака после запятой */
const elev = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`;

/* Доля отрезка этапа, отведённая под содержательную анимацию; остальное —
   переезд камеры к следующему кадру. Если наезжать одновременно с
   прорисовкой, глаз не успевает ни за тем, ни за другим. */
const HOLD = 0.62;

/* ------------------------------------------------------------------
 * КАДРЫ КАМЕРЫ ПО ЭТАПАМ
 *
 * cam[i] — кадр, на котором камера стоит в начале этапа i; в хвосте
 * этапа она переезжает к cam[i+1]. Отсюда и длина PHASES+1.
 *
 * Первые два этапа идут «не в мире»: камера отведена так далеко, что
 * площадки не видно, и на пустом поле с координатной сеткой работает
 * накладка — разбор задания и цепочка ступеней. Дальше камера входит в
 * мир и больше из него не выходит.
 * ------------------------------------------------------------------ */
function cameraTrack(shots: SceneShot[]): SceneShot[] {
  const by = (k: SceneShot["key"]) => shots.find((s) => s.key === k) ?? shots[0];
  const site = by("site");
  /* «Общий план» — тот же центр, что у площадки, но втрое шире: сетка
     мира на нём ещё читается, а сама площадка уже нет. */
  const K = 2.8;
  const wide: SceneShot = {
    key: "site",
    w: site.w * K,
    h: site.h * K,
    x: site.x + site.w / 2 - (site.w * K) / 2,
    y: site.y + site.h / 2 - (site.h * K) / 2,
  };
  return [
    wide, // 1 задание
    wide, // 2 цепочка   → в хвосте наезд на площадку
    site, // 3 генплан   → в хвосте наезд на линию воды
    by("train"), // 4 линия воды
    by("train"), // 5 расчёт → в хвосте переезд на план
    by("plan"), // 6 план  → в хвосте переезд на разрез
    by("section"), // 7 разрез → в хвосте переезд на профиль
    by("profile"), // 8 профиль
    by("profile"),
  ];
}

/* Масштаб в статусной строке округляем до пятёрки, а не до чертёжного
   ряда 1:100 / 1:250: при наезде «красивый» ряд щёлкает ступенями и
   выглядит как поломка, а не как плавный зум. */
function fmtScale(n: number): string {
  return `1:${Math.max(1, Math.round(n / 5) * 5).toLocaleString("ru-RU")}`;
}

/* ------------------------------------------------------------------ */

export default function EngineeringStory({ children }: { children?: ReactNode }) {
  const { language } = useLanguage();
  const t = T[language];

  /* Геометрия считается один раз за монтирование: layoutSite,
     mbrGeometry и computeProfile прогоняют весь расчёт, дёргать их
     покадрово незачем. Соотношение сторон здесь фиксированное — от него
     зависят ТОЛЬКО кадры камеры, а они пересчитываются после
     монтирования по фактическому размеру сцены (см. readAspect ниже).
     Сами координаты мира от aspect не зависят, поэтому серверная и
     клиентская разметка совпадают. */
  const scene = useMemo(() => storyScene(STORY_INPUT, 16 / 9), []);
  const plan = useMemo(() => mbrPlan(), []);
  const section = useMemo(() => mbrSection(), []);
  const numbers = useMemo(() => storyNumbers(), []);
  const prof = useMemo(() => storyProfile(), []);
  const planPaths = useMemo(() => orderedPaths(plan), [plan]);
  const sectionPaths = useMemo(() => orderedPaths(section), [section]);
  const numberParts = useMemo(() => numbers.map((n) => splitNumbers(n.value)), [numbers]);

  /* Блоки линии воды — по ним идёт подсветка четвёртого этапа. */
  const waterBlocks = useMemo(() => scene.blocks.filter((b) => b.row === "water"), [scene]);

  /* ---- гидравлический профиль в координатах мира ----
     По горизонтали — путь вдоль потока в метрах один к одному, по
     вертикали отметки умножаются на vk и откладываются ВНИЗ от
     profileFit.y. Растянутая вертикаль — обычная практика чертежей
     профиля: перепад в метр на полусотне метров пути иначе не увидеть. */
  const profGeom = useMemo(() => {
    const { y: y0, vk } = scene.profileFit;
    const Y = (e: number) => y0 - e * vk;
    const pad = Math.max(3, (prof.uMax - prof.uMin) * 0.09);
    const gx0 = prof.uMin - pad;
    const gx1 = prof.uMax + pad;

    /* Земля — планировочная отметка 0.000; всё остальное на профиле
       отсчитывается от неё, поэтому она рисуется первой. */
    const paths: { d: string; kind: "ground" | "box" }[] = [
      { d: `M ${gx0} ${Y(0)} H ${gx1}`, kind: "ground" },
    ];
    for (const s of prof.steps) {
      paths.push({ d: rectPath(s.u0, Y(s.top), s.u1 - s.u0, (s.top - s.bottom) * vk), kind: "box" });
    }

    const water = poly(prof.line.map(([u, e]) => [u, Y(e)] as [number, number]), false);

    /* ПОДПИСИ. Расставлены не «как красивее», а так, чтобы ничто ни на
       что не налезало — на профиле это решается взаимным положением
       линий, а не подбором отступов:
       — номер позиции прижимаем ко дну сооружения: в середине его
         пересекает уровень воды у неглубоких ступеней, а над дном
         свободно всегда — там рабочая глубина, не меньше метра;
       — отметку воды прижимаем к выходной стене СВОЕГО сооружения и
         вешаем ПОД уровень: над уровнем она у половины ступеней ложится
         ровно на линию земли (уровни здесь около нуля), а вынесенная за
         габарит — упирается в следующее сооружение, между ними всего
         полтора метра;
       — отметку дна подписываем под сооружением, там свободно всегда;
       — отметку земли уводим в правый край, где профиль уже кончился:
         слева на неё наезжает отметка воды на входе. */
    type PL = { x: number; y: number; text: string; anchor: "start" | "middle" | "end"; dim: boolean };
    const labels: PL[] = [
      { x: gx1 - 0.6, y: Y(0) - 1.2, text: elev(0), anchor: "end", dim: true },
    ];
    prof.steps.forEach((s, i) => {
      const cx = (s.u0 + s.u1) / 2;
      labels.push({ x: cx, y: Y(s.bottom) - 1.4, text: s.no, anchor: "middle", dim: false });
      labels.push({ x: cx, y: Y(s.bottom) + 2.4, text: elev(s.bottom), anchor: "middle", dim: true });
      if (i === 0) {
        labels.push({ x: s.u0 - 0.6, y: Y(s.waterIn) - 1.2, text: elev(s.waterIn), anchor: "end", dim: true });
      }
      labels.push({ x: s.u1 - 0.4, y: Y(s.waterOut) + 2.2, text: elev(s.waterOut), anchor: "end", dim: true });
    });

    /* Прямоугольник обрезки, которым вода «проливается» слева направо. */
    const top = Y(prof.elevMax) - 8;
    const clip = { x: gx0, y: top, w: gx1 - gx0, h: Y(prof.elevMin) + 10 - top };

    return { paths, water, labels, clip, gx0, gx1 };
  }, [scene, prof]);

  const [animated, setAnimated] = useState(false);
  const [reduced, setReduced] = useState(false);
  /* Единственное состояние, меняющееся при прокрутке, — активный этап:
     он нужен рейке и вспышке сканера. Меняется восемь раз за проход. */
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const siteRefs = useRef<(SVGPathElement | null)[]>([]);
  const roadRefs = useRef<(SVGRectElement | null)[]>([]);
  const blockRefs = useRef<(SVGPathElement | null)[]>([]);
  const blockGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const blockNoRefs = useRef<(SVGTextElement | null)[]>([]);
  const numTextRef = useRef<SVGGElement | null>(null);
  const stageTextRef = useRef<SVGGElement | null>(null);
  const stageNameRefs = useRef<(SVGGElement | null)[]>([]);
  const pipeRef = useRef<SVGPathElement | null>(null);
  const planGroupRef = useRef<SVGGElement | null>(null);
  const planLabelRef = useRef<SVGGElement | null>(null);
  const sectionGroupRef = useRef<SVGGElement | null>(null);
  const sectionLabelRef = useRef<SVGGElement | null>(null);
  const fillRef = useRef<SVGRectElement | null>(null);
  const penRef = useRef<SVGGElement | null>(null);
  const planPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const sectionPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const profGroupRef = useRef<SVGGElement | null>(null);
  const profPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const profClipRef = useRef<SVGRectElement | null>(null);
  const profTextRef = useRef<SVGGElement | null>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scaleRef = useRef<HTMLSpanElement | null>(null);
  const viewRef = useRef<HTMLSpanElement | null>(null);

  /* Длины путей: getTotalLength() — это пересчёт геометрии браузером,
     в кадре его вызывать нельзя. Считаем один раз после монтирования. */
  const lens = useRef<{
    site: number[];
    blocks: number[];
    pipe: number;
    plan: number[];
    section: number[];
    prof: number[];
  }>({ site: [], blocks: [], pipe: 0, plan: [], section: [], prof: [] });

  /* Кадры камеры под фактическое соотношение сторон сцены. Держим в ref:
     при resize их надо пересчитать, но перерисовывать React незачем. */
  const camRef = useRef<SceneShot[]>(cameraTrack(scene.shots));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    setAnimated(true);
  }, []);

  /* Камера в конечном состоянии для тех, кто просит убрать движение:
     кадр плана — самый содержательный, на нём видно и сооружение, и его
     место на площадке. Прочерчивать ничего не надо: без .animated
     штриховых обрезков в CSS нет, сцена и так отдана целиком. */
  useEffect(() => {
    if (!reduced) return;
    const s = camRef.current[5];
    svgRef.current?.setAttribute("viewBox", `${s.x} ${s.y} ${s.w} ${s.h}`);
  }, [reduced]);

  useEffect(() => {
    if (!animated) return;

    /* -------- разовые измерения -------- */
    const measure = (refs: (SVGPathElement | null)[]) =>
      refs.map((el) => {
        if (!el) return 0;
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        return len;
      });

    lens.current.site = measure(siteRefs.current);
    lens.current.blocks = measure(blockRefs.current);
    lens.current.plan = measure(planPathRefs.current);
    lens.current.section = measure(sectionPathRefs.current);
    lens.current.prof = measure(profPathRefs.current);
    if (pipeRef.current) {
      const l = pipeRef.current.getTotalLength();
      pipeRef.current.style.strokeDasharray = `${l}`;
      pipeRef.current.style.strokeDashoffset = `${l}`;
      lens.current.pipe = l;
    }

    const stage = stageRef.current;
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!stage || !root || !svg) return;

    /* Кадры зависят от формы поля: на вертикальном экране кадр,
       посчитанный под 16:9, обрезал бы чертёж по бокам. */
    const readAspect = () => {
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      camRef.current = cameraTrack(storyScene(STORY_INPUT, w / h).shots);
    };
    readAspect();

    /* -------- прорисовка листа с «пером» --------
       Пути идут не одновременно, а с нахлёстом: у каждого своё окно внутри
       прогресса, поэтому линии догоняют друг друга, как при черчении.
       Возвращаем путь, который рисуется прямо сейчас, — на его конце
       сидит визир. Без визира чертёж не рисуется, а проявляется. */
    const drawSheet = (refs: (SVGPathElement | null)[], ls: number[], dp: number) => {
      const n = refs.length || 1;
      let liveEl: SVGPathElement | null = null;
      let liveAt = 0;
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i];
        if (!el) continue;
        const start = (i / n) * 0.74;
        const local = clamp01((dp - start) / 0.26);
        const e = easeOut(local);
        el.style.strokeDashoffset = `${ls[i] * (1 - e)}`;
        if (local > 0.001 && local < 0.999) {
          liveEl = el;
          liveAt = ls[i] * e;
        }
      }
      return { liveEl, liveAt };
    };

    let frame = 0;

    const tick = () => {
      frame = 0;
      const vh = window.innerHeight;
      const r = root.getBoundingClientRect();
      const span = r.height - vh;
      const p = span <= 0 ? 0 : clamp01(-r.top / span);

      /* Секция далеко за экраном — считать нечего, состояние уже конечное. */
      if (r.bottom < -vh || r.top > vh * 2) return;

      const cam = camRef.current;
      const seg = p * PHASES; // 0…8
      const i = Math.min(PHASES - 1, Math.floor(seg));
      const local = clamp01(seg - i);

      /* -------- камера --------
         Ширину кадра интерполируем не линейно, а по показательному закону:
         при линейной интерполяции наезд с 400 до 19 м в начале кажется
         рывком, а в конце — ползком, потому что глаз воспринимает
         масштаб логарифмически. */
      const from = cam[i];
      const to = cam[i + 1];
      const tr = easeInOut(clamp01((local - HOLD) / (1 - HOLD)));
      const cx = from.x + from.w / 2 + (to.x + to.w / 2 - (from.x + from.w / 2)) * tr;
      const cy = from.y + from.h / 2 + (to.y + to.h / 2 - (from.y + from.h / 2)) * tr;
      const cw = from.w * Math.pow(to.w / from.w, tr);
      const ch = cw / (from.w / from.h);
      svg.setAttribute(
        "viewBox",
        `${(cx - cw / 2).toFixed(3)} ${(cy - ch / 2).toFixed(3)} ${cw.toFixed(3)} ${ch.toFixed(3)}`
      );

      /* Метров на пиксель — из этого считаются и масштаб в статусной
         строке, и экранные размеры подписей внутри сцены. */
      const mpp = cw / (stage.clientWidth || 1);

      /* -------- прогресс этапов для CSS --------
         --kN идёт 0…1 внутри своего этапа и остаётся 1 после него; --aN —
         прозрачность заголовка с перекрёстным затуханием на границе. */
      const k: number[] = [];
      for (let n = 0; n < PHASES; n++) {
        const kn = clamp01(seg - n);
        k.push(kn);
        stage.style.setProperty(`--k${n}`, kn.toFixed(4));
        const a =
          clamp01((seg - n + 0.08) / 0.16) *
          (n === PHASES - 1 ? 1 : clamp01((n + 1.08 - seg) / 0.16));
        stage.style.setProperty(`--a${n}`, a.toFixed(4));
      }
      stage.style.setProperty("--p", p.toFixed(4));

      /* Координатная сетка мира: она нужна на дальних планах, где кроме
         неё в кадре ничего нет, и мешает при наезде на чертёж, где своих
         линий хватает. Привязываем не к этапу, а к масштабу — так она
         тает ровно тогда, когда камера действительно подошла близко. */
      stage.style.setProperty("--grid", clamp01((mpp - 0.04) / 0.09).toFixed(3));

      /* -------- этап 3: площадка -------- */
      for (let n = 0; n < siteRefs.current.length; n++) {
        const el = siteRefs.current[n];
        if (!el) continue;
        const dp = easeOut(clamp01((k[2] - n * 0.06) / 0.2));
        el.style.strokeDashoffset = `${lens.current.site[n] * (1 - dp)}`;
      }
      for (let n = 0; n < roadRefs.current.length; n++) {
        const el = roadRefs.current[n];
        if (!el) continue;
        el.style.opacity = `${clamp01((k[2] - 0.24 - n * 0.03) / 0.16)}`;
      }

      /* Блоки появляются по одному в порядке хода потока: сперва
         прочерчивается контур, потом ложится заливка и встаёт номер
         позиции — так же читается и настоящая экспликация. */
      const nb = scene.blocks.length;
      for (let n = 0; n < nb; n++) {
        const el = blockRefs.current[n];
        const g = blockGroupRefs.current[n];
        if (!el || !g) continue;
        const start = 0.3 + (n / nb) * 0.52;
        const d = clamp01((k[2] - start) / 0.18);
        el.style.strokeDashoffset = `${lens.current.blocks[n] * (1 - easeOut(d))}`;
        g.style.setProperty("--fill", clamp01((d - 0.55) / 0.45).toFixed(3));
        const no = blockNoRefs.current[n];
        if (no) no.style.opacity = `${clamp01((d - 0.5) / 0.5)}`;
      }
      /* Номера позиций живут в метрах, поэтому при наезде их пришлось бы
         рисовать высотой в человеческий рост. Размер задаём в экранных
         пикселях, пересчитывая в метры текущим масштабом. */
      numTextRef.current?.setAttribute("font-size", (mpp * 13).toFixed(4));
      stageTextRef.current?.setAttribute("font-size", (mpp * 15).toFixed(4));
      profTextRef.current?.setAttribute("font-size", (mpp * 11).toFixed(4));

      /* -------- этап 4: линия очистки -------- */
      if (pipeRef.current) {
        pipeRef.current.style.strokeDashoffset = `${lens.current.pipe * (1 - easeOut(clamp01(k[3] / 0.34)))}`;
      }
      /* Осадок и здания приглушаются, чтобы взгляд шёл по воде и не
         цеплялся за иловые площадки, которые тут больше всего по площади. */
      stage.style.setProperty("--mute", (0.25 + 0.75 * (1 - clamp01(k[3] / 0.3))).toFixed(3));
      /* Названия ступеней живут только на четвёртом этапе: дальше они
         оказались бы поверх чертежа и мешали бы читать размеры. */
      const nameFade = 1 - clamp01(k[4] / 0.2);
      for (let n = 0; n < waterBlocks.length; n++) {
        const g = stageNameRefs.current[n];
        const hl = clamp01((k[3] - 0.24 - (n / waterBlocks.length) * 0.42) / 0.14);
        const idx = scene.blocks.indexOf(waterBlocks[n]);
        blockGroupRefs.current[idx]?.style.setProperty("--hl", hl.toFixed(3));
        if (g) g.style.opacity = `${hl * nameFade}`;
      }

      /* Площадка не исчезает при наезде, а уходит в фон: сохранить рядом
         с чертежом соседние сооружения — единственное доказательство, что
         план стоит на своём месте, а не подставлен отдельной картинкой.
         На профиле площадка не нужна совсем — там своя система координат. */
      stage.style.setProperty(
        "--ctx",
        (1 - 0.62 * clamp01((k[5] - 0.08) / 0.3) - 0.3 * clamp01(k[6] / 0.3) - 0.08 * clamp01(k[7] / 0.2)).toFixed(3)
      );
      stage.style.setProperty("--nums", nameFade.toFixed(3));

      /* -------- этап 5: числа расчёта -------- */
      for (let n = 0; n < numberParts.length; n++) {
        if (numbers[n].numeric === null) continue;
        const node = valueRefs.current[n];
        if (!node) continue;
        const start = 0.06 + (n / numberParts.length) * 0.46;
        node.textContent = renderNumbers(numberParts[n], easeOut(clamp01((k[4] - start) / 0.2)));
      }

      /* -------- этап 6: план биореактора -------- */
      /* Схематичный прямоугольник растворяется ровно там, где начинает
         прочерчиваться настоящий план: подмены не видно, видно уточнение. */
      const mbrIdx = scene.blocks.findIndex((b) => b.kind === "mbr");
      if (mbrIdx >= 0) {
        blockGroupRefs.current[mbrIdx]?.style.setProperty("--dissolve", (1 - clamp01(k[5] / 0.18)).toFixed(3));
      }
      const planDp = clamp01(k[5] / (HOLD * 0.92));
      const pen1 = drawSheet(planPathRefs.current, lens.current.plan, planDp);
      if (planGroupRef.current) planGroupRef.current.style.opacity = `${clamp01(k[5] / 0.08)}`;
      if (planLabelRef.current) planLabelRef.current.style.opacity = `${clamp01((planDp - 0.72) / 0.2)}`;

      /* -------- этап 7: разрез -------- */
      const secDp = clamp01(k[6] / 0.62);
      const pen2 = drawSheet(sectionPathRefs.current, lens.current.section, secDp);
      if (sectionGroupRef.current) sectionGroupRef.current.style.opacity = `${clamp01(k[6] / 0.08)}`;
      if (sectionLabelRef.current) sectionLabelRef.current.style.opacity = `${clamp01((secDp - 0.72) / 0.2)}`;

      /* Уровень воды не «появляется», а наполняет сооружение снизу вверх:
         это единственное движение в кадре, которое читается как процесс,
         а не как включение слоя. */
      const wb = section.waterBox;
      if (fillRef.current && wb) {
        const f = easeOut(clamp01((k[6] - 0.34) / 0.3));
        fillRef.current.setAttribute("y", `${wb.y + wb.h * (1 - f)}`);
        fillRef.current.setAttribute("height", `${Math.max(0, wb.h * f)}`);
      }

      /* -------- этап 8: гидравлический профиль -------- */
      const profDp = clamp01(k[7] / 0.42);
      const pen3 = drawSheet(profPathRefs.current, lens.current.prof, profDp);
      if (profGroupRef.current) profGroupRef.current.style.opacity = `${clamp01(k[7] / 0.06)}`;
      /* Вода проливается слева направо не прозрачностью, а обрезкой:
         так видно именно движение фронта, а не «включение» линии. */
      if (profClipRef.current) {
        const c = profGeom.clip;
        profClipRef.current.setAttribute("width", `${(c.w * easeOut(clamp01((k[7] - 0.22) / 0.4))).toFixed(3)}`);
      }

      /* -------- перо --------
         Визир сидит на конце той линии, которая чертится прямо сейчас;
         какой это лист — определяется тем, что живо в этом кадре. */
      const pen = penRef.current;
      if (pen) {
        const live = pen3.liveEl ? pen3 : pen2.liveEl ? pen2 : pen1;
        /* профиль лежит прямо в метрах мира, ему пересчёт не нужен */
        const fit = pen3.liveEl
          ? { x: 0, y: 0, k: 1 }
          : pen2.liveEl
            ? scene.sectionFit
            : scene.planFit;
        if (live.liveEl) {
          const pt = live.liveEl.getPointAtLength(live.liveAt);
          const s = mpp * 9; // визир держим одного экранного размера
          pen.setAttribute(
            "transform",
            `translate(${fit.x + pt.x * fit.k} ${fit.y + pt.y * fit.k}) scale(${s.toFixed(5)})`
          );
          pen.style.opacity = "1";
        } else {
          pen.style.opacity = "0";
        }
      }

      /* -------- служебная строка --------
         Масштаб честный: сколько метров кадра приходится на пиксель, столько
         и пишем. 1 px ≈ 0,2646 мм — CSS-пиксель по определению 1/96 дюйма. */
      if (scaleRef.current) {
        scaleRef.current.textContent = fmtScale((mpp * 1000) / 0.2646);
      }
      const viewKey = cam[tr > 0.5 ? i + 1 : i].key;
      if (viewRef.current && viewRef.current.dataset.k !== viewKey) {
        viewRef.current.dataset.k = viewKey;
        viewRef.current.textContent = t.views[viewKey];
      }

      /* Рейка и вспышка сканера — единственное, ради чего трогаем React,
         и только на смене этапа. */
      const wantPhase = Math.min(PHASES - 1, Math.round(seg - 0.2));
      if (wantPhase !== phaseRef.current && wantPhase >= 0) {
        phaseRef.current = wantPhase;
        setPhase(wantPhase);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onResize = () => {
      readAspect();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animated, numberParts, numbers, scene, section, waterBlocks, profGeom, t]);

  /* Переход к этапу: считаем позицию прокрутки от его прогресса. Целимся
     не в начало отрезка, а на треть внутрь — там этап уже «набрал» вид,
     а камера ещё не поехала дальше. */
  const goto = useCallback(
    (i: number) => {
      const root = rootRef.current;
      if (!root) return;
      if (!animated) {
        /* Движение выключено — рейка просто переставляет камеру. */
        const s = camRef.current[i];
        svgRef.current?.setAttribute("viewBox", `${s.x} ${s.y} ${s.w} ${s.h}`);
        setPhase(i);
        return;
      }
      const top = window.scrollY + root.getBoundingClientRect().top;
      const span = root.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.3) / PHASES) * span, behavior: "smooth" });
    },
    [animated]
  );

  /** окно появления элемента внутри этапа, в долях его прогресса */
  const at = (from: number, to: number) => ({ "--from": from, "--to": to }) as CSSProperties;

  const world = scene.world;

  /* Подписи чертежа заданы в размерах настоящего документа: 130 мм текста
     на сооружении 14,9 м. На бумаге это читается, на экране — нет,
     поэтому на сцене они увеличены. Пропорции между подписями сохранены. */
  const LABEL_K = 1.7;

  const sheetLabels = (d: StoryDrawing, ref: RefObject<SVGGElement | null>) => (
    <g ref={ref} className={styles.labels}>
      {d.labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          fontSize={l.size * LABEL_K}
          textAnchor={l.anchor}
          className={l.layer === "dim" ? styles.labelDim : styles.labelText}
        >
          {l.text}
        </text>
      ))}
    </g>
  );

  /* Величины задания — числа те же, что уйдут в расчёт; единицы берём из
     словаря, иначе в узбекской версии окажется «м³/сут». */
  const brief: { label: string; value: string; unit: string }[] = [
    { label: t.brief.flow, value: STORY_INPUT.q.toLocaleString("ru-RU"), unit: t.units.qd },
    { label: t.brief.bod, value: String(STORY_INPUT.bod), unit: t.units.mgl },
    { label: t.brief.ss, value: String(STORY_INPUT.ss), unit: t.units.mgl },
    { label: t.brief.tn, value: String(STORY_INPUT.tn), unit: t.units.mgl },
    { label: t.brief.outlet, value: elev(prof.dischargeElev), unit: t.units.m },
  ];

  return (
    <section
      ref={rootRef}
      className={`${styles.story}${animated ? ` ${styles.animated}` : ""}${reduced ? ` ${styles.still}` : ""}`}
      aria-label={t.kicker}
    >
      <div className={styles.pin}>
        {/* ================= ЛЕВАЯ КОЛОНКА =================
            Приходит из page.tsx и при прокрутке не меняется вовсе:
            человек читает заголовок и жмёт кнопку тогда, когда захочет,
            а не тогда, когда сцена «доехала» до нужного этапа. */}
        <div className={styles.left}>{children}</div>

        {/* ================= ПОЛЕ СО СЦЕНОЙ ================= */}
        <div ref={stageRef} className={styles.stage}>
          <svg
            ref={svgRef}
            className={styles.svg}
            viewBox={`${world.x} ${world.y} ${world.w} ${world.h}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${t.phases[2].title} · ${t.sheetTitles.plan} · ${t.sheetTitles.section} · ${t.phases[7].title}`}
          >
            {/* Все линии — vector-effect: non-scaling-stroke. Иначе при
                наезде с 400 до 19 м контур площадки превратился бы в
                кляксу, а размерные линии чертежа исчезли бы совсем. */}
            <defs>
              {/* Координатная сетка мира: ячейка 10 м, в метрах, а не в
                  пикселях — значит при наезде она честно растягивается
                  вместе с миром и показывает, насколько мы приблизились. */}
              <pattern id="story-grid" width={10} height={10} patternUnits="userSpaceOnUse">
                <path d="M 10 0 H 0 V 10" fill="none" vectorEffect="non-scaling-stroke" />
              </pattern>
              <clipPath id="story-prof-clip">
                <rect
                  ref={profClipRef}
                  x={profGeom.clip.x}
                  y={profGeom.clip.y}
                  width={profGeom.clip.w}
                  height={profGeom.clip.h}
                />
              </clipPath>
            </defs>

            <rect
              className={styles.grid}
              x={world.x}
              y={world.y}
              width={world.w}
              height={world.h}
              fill="url(#story-grid)"
            />

            {/* ---- участок и ограждение ---- */}
            <g className={styles.siteLayer}>
              {scene.site.map((s, i) => (
                <path
                  key={`s${i}`}
                  ref={(el) => {
                    siteRefs.current[i] = el;
                  }}
                  d={poly(s.pts, s.closed)}
                  className={styles.siteLine}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {scene.fence && (
                <path
                  ref={(el) => {
                    siteRefs.current[scene.site.length] = el;
                  }}
                  d={poly(scene.fence.pts, scene.fence.closed)}
                  className={styles.fence}
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>

            {/* ---- проезды ---- */}
            <g className={styles.roads}>
              {scene.roads.map((r, i) => (
                <rect
                  key={`r${i}`}
                  ref={(el) => {
                    roadRefs.current[i] = el;
                  }}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                />
              ))}
            </g>

            {/* ---- сооружения ---- */}
            <g className={styles.blocks}>
              {scene.blocks.map((b, i) => (
                <g
                  key={b.no}
                  ref={(el) => {
                    blockGroupRefs.current[i] = el;
                  }}
                  className={`${styles.block} ${styles[`row_${b.row}`]}`}
                >
                  <rect className={styles.blockFill} x={b.x} y={b.y} width={b.w} height={b.h} />
                  <path
                    ref={(el) => {
                      blockRefs.current[i] = el;
                    }}
                    d={rectPath(b.x, b.y, b.w, b.h)}
                    className={styles.blockLine}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
            </g>

            {/* ---- ось потока: труба и бегущая по ней вода ---- */}
            <path
              ref={pipeRef}
              d={poly(scene.flow, false)}
              className={styles.pipe}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={poly(scene.flow, false)}
              className={styles.waterRun}
              vectorEffect="non-scaling-stroke"
            />

            {/* ---- номера позиций ---- */}
            <g ref={numTextRef} className={styles.blockNums} fontSize={2.4}>
              {scene.blocks.map((b, i) => (
                <text
                  key={b.no}
                  ref={(el) => {
                    blockNoRefs.current[i] = el;
                  }}
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2}
                  className={styles.blockNo}
                >
                  {b.no}
                </text>
              ))}
            </g>

            {/* ---- названия ступеней (этап 4) ---- */}
            <g ref={stageTextRef} className={styles.stageNames} fontSize={2.8}>
              {waterBlocks.map((b, i) => (
                <g
                  key={b.no}
                  ref={(el) => {
                    stageNameRefs.current[i] = el;
                  }}
                  className={styles.stageName}
                >
                  <text x={b.x + b.w / 2} y={b.y - b.h * 0.18}>
                    {t.stageNames[b.kind] ?? b.no}
                  </text>
                </g>
              ))}
            </g>

            {/* ---- план биореактора: стоит ровно на своём блоке ---- */}
            <g
              ref={planGroupRef}
              className={styles.sheet}
              transform={`translate(${scene.planFit.x} ${scene.planFit.y}) scale(${scene.planFit.k})`}
            >
              {planPaths.map((p, i) => (
                <path
                  key={`p-${p.layer}-${p.i}`}
                  ref={(el) => {
                    planPathRefs.current[i] = el;
                  }}
                  d={p.d}
                  className={styles[p.layer]}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {sheetLabels(plan, planLabelRef)}
            </g>

            {/* ---- разрез: вынесен под площадку, на плане ему места нет ---- */}
            <g
              ref={sectionGroupRef}
              className={styles.sheet}
              transform={`translate(${scene.sectionFit.x} ${scene.sectionFit.y}) scale(${scene.sectionFit.k})`}
            >
              {section.waterBox && (
                <rect
                  ref={fillRef}
                  className={styles.waterFill}
                  x={section.waterBox.x}
                  y={section.waterBox.y}
                  width={section.waterBox.w}
                  height={section.waterBox.h}
                />
              )}
              {sectionPaths.map((p, i) => (
                <path
                  key={`c-${p.layer}-${p.i}`}
                  ref={(el) => {
                    sectionPathRefs.current[i] = el;
                  }}
                  d={p.d}
                  className={styles[p.layer]}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {sheetLabels(section, sectionLabelRef)}
            </g>

            {/* ---- гидравлический профиль ----
                Лежит прямо в метрах мира: по горизонтали путь вдоль потока
                один к одному, по вертикали отметки растянуты в vk раз. */}
            <g ref={profGroupRef} className={styles.sheet}>
              {profGeom.paths.map((p, i) => (
                <path
                  key={`h${i}`}
                  ref={(el) => {
                    profPathRefs.current[i] = el;
                  }}
                  d={p.d}
                  className={p.kind === "ground" ? styles.ground : styles.profBox}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {/* Уровень воды и бегущий по нему поток — под общей обрезкой,
                  которая едет слева направо: вода буквально проливается. */}
              <g clipPath="url(#story-prof-clip)">
                <path d={profGeom.water} className={styles.profWater} fill="none" vectorEffect="non-scaling-stroke" />
                <path d={profGeom.water} className={styles.profRun} fill="none" vectorEffect="non-scaling-stroke" />
              </g>
              <g ref={profTextRef} className={styles.profLabels} fontSize={0.6}>
                {profGeom.labels.map((l, i) => (
                  <text
                    key={`hl${i}`}
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    className={l.dim ? styles.labelDim : styles.labelText}
                  >
                    {l.text}
                  </text>
                ))}
              </g>
            </g>

            {/* ---- перо: визир на конце прочерчиваемой линии ---- */}
            <g ref={penRef} className={styles.pen} opacity={0}>
              <path d="M -1 0 H 1 M 0 -1 V 1" vectorEffect="non-scaling-stroke" />
              <circle r={0.34} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>

          {/* ================= НАКЛАДКА ================= */}
          <div className={styles.overlay}>
            {/* Вспышка сканера на смене этапа: тонкая линия проходит поперёк
                поля. Перемонтируется по key, поэтому анимация играет ровно
                один раз и ровно тогда, когда этап сменился. */}
            <span key={phase} className={styles.scan} aria-hidden="true" />

            {/* ---- этап 1: лист задания и извлечённые величины ---- */}
            <div className={`${styles.brief} ${styles.p0}`} style={at(0.04, 0.2)}>
              <div className={styles.briefSheet} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.briefBody}>
                <div className={styles.panelTitle}>{t.briefTitle}</div>
                <div className={styles.briefCards}>
                  {brief.map((b, n) => (
                    <div
                      key={b.label}
                      className={`${styles.briefCard} ${styles.p0}`}
                      style={at(0.22 + n * 0.11, 0.34 + n * 0.11)}
                    >
                      <span>{b.label}</span>
                      <strong>
                        {b.value} <i>{b.unit}</i>
                      </strong>
                    </div>
                  ))}
                </div>
                <div className={styles.panelNote}>{t.briefNote}</div>
              </div>
            </div>

            {/* ---- этап 2: технологическая цепочка ---- */}
            <div className={`${styles.chain} ${styles.p1}`} style={at(0.02, 0.14)}>
              <div className={styles.panelTitle}>{t.chainTitle}</div>
              <ol className={styles.chainList}>
                {t.chain.map((c, n) => (
                  <li
                    key={c}
                    className={`${styles.chainItem} ${styles.p1}`}
                    style={
                      {
                        ...at(0.1 + n * 0.07, 0.2 + n * 0.07),
                        /* сдвиг пульса по номеру ступени — волна идёт
                           по цепочке в ту же сторону, что и вода */
                        "--d": `${-n * 0.22}s`,
                      } as CSSProperties
                    }
                  >
                    <span className={styles.chainDot} aria-hidden="true" />
                    <span className={styles.chainNo}>{String(n + 1).padStart(2, "0")}</span>
                    <span className={styles.chainName}>{c}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* ---- крупная подпись текущего этапа ----
                Подменяется на одном месте перекрёстным затуханием (--aN).
                Номер «03 / 08» стоит первым: он отвечает на главный вопрос
                новичка — что это вообще и сколько ещё осталось. */}
            <div className={styles.heads}>
              <div className={styles.kicker}>{t.kicker}</div>
              <div className={styles.headBox}>
                {t.phases.map((ph, n) => (
                  <header
                    key={ph.label}
                    className={styles.head}
                    style={{ "--a": `var(--a${n}, ${n === 0 ? 1 : 0})` } as CSSProperties}
                  >
                    <div className={styles.headNo}>
                      {String(n + 1).padStart(2, "0")}
                      <i>/ {String(PHASES).padStart(2, "0")}</i>
                    </div>
                    <div className={styles.phaseLabel}>{ph.label}</div>
                    <h2>{ph.title}</h2>
                    <p>{ph.text}</p>
                  </header>
                ))}
              </div>
            </div>

            {/* потребная площадь — цифра из той же компоновки, что и блоки */}
            <div className={`${styles.area} ${styles.p2}`} style={at(0.5, 0.72)}>
              <span className={styles.areaLabel}>{t.areaLabel}</span>
              <strong>
                {scene.needM2.toLocaleString("ru-RU")} <i>{t.areaUnit}</i>
              </strong>
            </div>

            {/* ведомость расчёта — этап 5 */}
            <div className={`${styles.calc} ${styles.p4}`} style={at(0.02, 0.16)}>
              <div className={styles.panelTitle}>{t.calcTitle}</div>
              <dl>
                {numbers.map((n, idx) => (
                  <div
                    key={n.key}
                    className={`${styles.calcRow} ${styles.p4}`}
                    style={at(0.06 + (idx / numbers.length) * 0.46, 0.16 + (idx / numbers.length) * 0.46)}
                  >
                    <dt>{t.calcLabels[n.key]}</dt>
                    <dd>
                      <span
                        ref={(el) => {
                          valueRefs.current[idx] = el;
                        }}
                      >
                        {n.value}
                      </span>
                      <i>{n.unit}</i>
                    </dd>
                    {n.clause && <span className={styles.clause}>{n.clause}</span>}
                  </div>
                ))}
              </dl>
              <div className={styles.panelNote}>{t.calcNote}</div>
            </div>

            {/* подпись листа плана — этап 6 */}
            <div className={`${styles.caption} ${styles.p5}`} style={at(0.62, 0.78)}>
              <span className={styles.captionTitle}>{t.sheetTitles.plan}</span>
              <div className={styles.captionNums}>
                {plan.caption.numbers.map((n) => (
                  <span key={n.key}>
                    {t.captionLabels[n.key]}: <b>{n.value}</b>
                  </span>
                ))}
              </div>
            </div>

            {/* подпись разреза — этап 7: глубину и отметки проверяют по нему */}
            <div className={`${styles.caption} ${styles.captionLow} ${styles.p6}`} style={at(0.5, 0.66)}>
              <span className={styles.captionTitle}>{t.sheetTitles.section}</span>
              <div className={styles.captionNums}>
                {section.caption.numbers.map((n) => (
                  <span key={n.key}>
                    {t.captionLabels[n.key]}: <b>{n.value}</b>
                  </span>
                ))}
              </div>
            </div>

            {/* вывод расчёта — этап 8 */}
            <div className={`${styles.verdict} ${styles.p7}`} style={at(0.5, 0.64)}>
              <div className={styles.panelTitle}>{t.profileTitle}</div>
              <strong className={styles.verdictHead}>{t.verdictTitle}</strong>
              <p>{t.verdictText}</p>
              {/* Профиль всегда чертят с растянутой вертикалью, и инженер,
                  не увидев оговорки, прочтёт сооружения вдвое глубже, чем
                  они есть. Поэтому предупреждение стоит рядом с выводом. */}
              <p className={styles.profScaleNote}>{t.profScaleNote}</p>
              <div className={styles.verdictNum}>
                <span>{t.headLabel}</span>
                <b>
                  {prof.pumpHeadM.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} <i>{t.units.m}</i>
                </b>
              </div>
            </div>

            {/* итоговая плашка — конец этапа 8 */}
            <div className={`${styles.deliver} ${styles.p7}`} style={at(0.74, 0.9)}>
              {/* Комплект листов веером: четыре листа выезжают друг
                  из-под друга — так его и держат в руках. */}
              <div className={styles.fan} aria-hidden="true">
                <span style={{ "--i": 0 } as CSSProperties} />
                <span style={{ "--i": 1 } as CSSProperties} />
                <span style={{ "--i": 2 } as CSSProperties} />
                <span style={{ "--i": 3 } as CSSProperties} />
              </div>
              <div className={styles.deliverList}>
                <div className={styles.panelTitle}>{t.deliverTitle}</div>
                <ul>
                  {t.deliver.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.deliverCta}>
                <a href="/engineering/analysis/industry" className={styles.cta}>
                  {t.cta}
                  <span aria-hidden="true">→</span>
                </a>
                <span className={styles.ctaNote}>{t.ctaNote}</span>
              </div>
            </div>

            {/* рейка этапов */}
            <nav className={styles.rail} aria-label={t.kicker}>
              {t.phases.map((ph, n) => (
                <button
                  key={ph.rail}
                  type="button"
                  className={`${styles.railItem}${phase === n ? ` ${styles.railOn}` : ""}`}
                  onClick={() => goto(n)}
                  aria-current={phase === n ? "step" : undefined}
                  title={ph.rail}
                >
                  <span className={styles.railNo}>{String(n + 1).padStart(2, "0")}</span>
                  <span className={styles.railName}>{ph.rail}</span>
                </button>
              ))}
              <span className={styles.railBar} aria-hidden="true" />
            </nav>

            {/* Поясняющая строка: висит постоянно и объясняет саму
                механику — восемь шагов от задания до чертежей, и всё
                показанное посчитано, а не нарисовано. */}
            <div className={styles.legend}>{t.legend}</div>

            {/* полоса общего прогресса по всей ширине поля */}
            <div className={styles.progress} aria-hidden="true" />

            {/* статусная строка, как в CAD */}
            <div className={styles.status} aria-hidden="true">
              <span ref={scaleRef}>1:1000</span>
              <span className={styles.statusSep}>·</span>
              <span ref={viewRef} data-k="site">
                {t.views.site}
              </span>
            </div>

            {/* подсказка прокрутки — гаснет после первого движения */}
            <div className={styles.hint} aria-hidden="true">
              <span className={styles.hintDot} />
              {t.hint}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
