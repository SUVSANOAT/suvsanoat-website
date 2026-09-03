/* ==================================================================
 * ЯЗЫКИ РАЗДЕЛА «ИНЖИНИРИНГ»
 *
 * L10n — строка на четырёх языках сайта. Хелпер L() пишется коротко,
 * чтобы данные оставались читаемыми, а t() выбирает нужный язык с
 * откатом на русский, если перевод ещё не сделан.
 *
 * Терминология: узбекский — латиница, как на остальном сайте;
 * английский — по терминологии Metcalf & Eddy и EN-стандартов;
 * китайский — по принятым обозначениям сооружений (调节池, 曝气池 и т. д.).
 * ================================================================== */

import type { Language } from "../../../translations";

export type L10n = Record<Language, string>;

/** короткая запись многоязычной строки */
export function L(ru: string, uz: string, en: string, zh: string): L10n {
  return { ru, uz, en, zh };
}

/** выбор языка с откатом на русский */
export function t(value: L10n | string | undefined, lang: Language): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru;
}

/** выбор шаблона строки по языку (для строк с подставленными числами) */
export function pick(lang: Language, variants: L10n): string {
  return variants[lang] || variants.ru;
}

/** локаль для форматирования чисел */
export const LOCALE: Record<Language, string> = {
  ru: "ru-RU",
  uz: "uz-UZ",
  en: "en-US",
  zh: "zh-CN",
};

export function num(value: number, lang: Language, digits = 0): string {
  return value.toLocaleString(LOCALE[lang], { maximumFractionDigits: digits });
}

/* ==================================================================
 * ИНТЕРФЕЙС РАЗДЕЛА
 * ================================================================== */

export const UI = {
  /* --- шаг выбора отрасли --- */
  stepIndustry: L("ШАГ 02 / ОТРАСЛЬ И СОСТАВ СТОКА", "02-BOSQICH / TARMOQ VA OQOVA TARKIBI", "STEP 02 / INDUSTRY AND WASTEWATER", "第 02 步 / 行业与水质"),
  chooseGroup: L("Выберите группу", "Guruhni tanlang", "Select a group", "选择行业组"),
  chooseIndustry: L("Выберите отрасль", "Tarmoqni tanlang", "Select an industry", "选择行业"),
  flowSection: L("РАСХОД СТОЧНЫХ ВОД", "OQOVA SUV SARFI", "WASTEWATER FLOW", "废水流量"),
  flowPerDay: L("Расход, м³/сут", "Sarf, m³/kun", "Flow, m³/day", "流量，m³/日"),
  workHours: L("Работа объекта, часов/сут", "Obyekt ish vaqti, soat/kun", "Operating time, hours/day", "运行时间，小时/日"),
  industryHint: L("Подсказка по отрасли", "Tarmoq bo‘yicha maslahat", "Typical for this industry", "该行业参考值"),
  dischargeSection: L("КУДА УХОДИТ ОЧИЩЕННАЯ ВОДА", "TOZALANGAN SUV QAYERGA BORADI", "WHERE THE TREATED WATER GOES", "出水去向"),
  dischargeLead: L(
    "Точка сброса определяет глубину очистки — от неё зависит, нужны ли доочистка и обеззараживание, и какие целевые показатели закладываются в расчёт.",
    "Chiqindi nuqtasi tozalash chuqurligini belgilaydi: qo‘shimcha tozalash va zararsizlantirish keraklimi hamda hisobga qanday maqsadli ko‘rsatkichlar olinishi shunga bog‘liq.",
    "The discharge point defines how deep the treatment must go: whether polishing and disinfection are required, and which target values enter the calculation.",
    "排放去向决定处理深度：是否需要深度处理与消毒，以及计算采用的目标指标。"
  ),
  basisLabel: L("Основание", "Asos", "Basis", "依据"),
  hasTu: L("У меня есть технические условия или НДС — задать свои показатели", "Menda texnik shartlar yoki chiqindi me’yori bor — o‘z ko‘rsatkichlarimni kiritaman", "I have technical conditions or a discharge permit — enter my own limits", "我有排放技术条件或许可 — 自行填写指标"),
  labSection: L("ЛАБОРАТОРНЫЙ АНАЛИЗ СТОКА", "OQOVA SUV LABORATORIYA TAHLILI", "LABORATORY ANALYSIS", "废水化验数据"),
  labYes: L("Есть анализ — введу значения", "Tahlil bor — qiymatlarni kiritaman", "I have an analysis — enter values", "有化验单 — 手动输入"),
  labNo: L("Анализа нет — по нормативу", "Tahlil yo‘q — me’yor bo‘yicha", "No analysis — use reference data", "无化验 — 采用手册数据"),
  calculate: L("Рассчитать", "Hisoblash", "Calculate", "开始计算"),
  back: L("Назад", "Orqaga", "Back", "返回"),

  /* --- результат --- */
  resultEyebrow: L("ПРЕДВАРИТЕЛЬНОЕ ИНЖЕНЕРНОЕ РЕШЕНИЕ", "DASTLABKI MUHANDISLIK YECHIMI", "PRELIMINARY ENGINEERING SOLUTION", "初步工程方案"),
  flowLine: L("Расход", "Sarf", "Flow", "流量"),
  mode: L("режим", "rejim", "operating mode", "运行"),
  dischargeTo: L("Сброс", "Chiqindi", "Discharge", "排放"),
  targetsFrom: L("Целевые показатели", "Maqsadli ko‘rsatkichlar", "Target values", "目标指标"),
  byYourTu: L("по вашим техническим условиям / НДС", "sizning texnik shartlaringiz bo‘yicha", "per your technical conditions / permit", "按您的技术条件"),
  labSource: L("Исходные концентрации — по лабораторному анализу заказчика.", "Boshlang‘ich konsentratsiyalar — buyurtmachi laboratoriya tahlili bo‘yicha.", "Influent concentrations are taken from the client's laboratory analysis.", "进水浓度取自业主化验数据。"),
  refSource: L("Исходные концентрации — справочные", "Boshlang‘ich konsentratsiyalar — ma’lumotnoma bo‘yicha", "Influent concentrations are reference values", "进水浓度取自行业手册"),
  refTail: L("Расчёт предварительный, уточняется анализом усреднённой пробы.", "Hisob dastlabki, o‘rtacha namuna tahlili bilan aniqlanadi.", "The calculation is preliminary and must be confirmed by a composite sample analysis.", "本计算为初步结果，需以混合样化验校核。"),
  scaleLine: L("Исполнение по расходу", "Sarfga qarab bajarilishi", "Design type by flow", "按流量确定的形式"),
  influentTitle: L("ИСХОДНЫЙ СОСТАВ И ЦЕЛЬ ОЧИСТКИ", "BOSHLANG‘ICH TARKIB VA TOZALASH MAQSADI", "INFLUENT AND TREATMENT TARGETS", "进水水质与处理目标"),
  specialTitle: L("ОСОБЫЕ ЗАГРЯЗНИТЕЛИ — ОТДЕЛЬНЫЕ РЕШЕНИЯ", "ALOHIDA IFLOSLANTIRUVCHILAR — ALOHIDA YECHIM", "SPECIAL POLLUTANTS — SEPARATE SOLUTIONS", "特殊污染物 — 单独处理"),
  chainTitle: L("ПУТЬ ВОДЫ", "SUV YO‘LI", "TREATMENT TRAIN", "水处理流程"),
  stagesWord: L("СТУПЕНЕЙ", "BOSQICH", "STAGES", "级"),
  itemsCount: L("позиц. оборудования", "uskuna pozitsiyasi", "equipment items", "项设备"),
  commonTitle: L("Общестанционные узлы", "Umumiy stansiya uzellari", "Plant-wide items", "全厂通用部分"),
  commonLead: L(
    "Не относятся к отдельной ступени, но входят в состав станции и часто выпадают из предварительных расчётов.",
    "Alohida bosqichga tegishli emas, lekin stansiya tarkibiga kiradi va dastlabki hisoblarda ko‘pincha tushib qoladi.",
    "These do not belong to a single stage but are part of the plant, and are often missed in preliminary estimates.",
    "不属于某一处理段，但属于全厂配套，初步估算中常被遗漏。"
  ),
  industryNotesTitle: L("ЧТО ВАЖНО ЗНАТЬ ПРО ЭТУ ОТРАСЛЬ", "USHBU TARMOQ HAQIDA MUHIM MA’LUMOT", "WHAT MATTERS IN THIS INDUSTRY", "该行业的关键要点"),
  sourcesWord: L("Источники", "Manbalar", "Sources", "资料来源"),
  methodsWord: L("Методики расчёта", "Hisob uslublari", "Design methods", "计算方法"),

  /* --- строительная часть --- */
  civilTitle: L("СТРОИТЕЛЬНАЯ ЧАСТЬ, ПЛОЩАДЬ И ЭЛЕКТРИКА", "QURILISH QISMI, MAYDON VA ELEKTR", "CIVIL WORKS, AREA AND POWER", "土建、占地与电气"),
  basinsTitle: L("Габариты ёмкостей и объёмы работ", "Rezervuar o‘lchamlari va ish hajmlari", "Tank dimensions and work volumes", "池体尺寸与工程量"),
  colStructure: L("Сооружение", "Inshoot", "Structure", "构筑物"),
  colVolume: L("Объём, м³", "Hajm, m³", "Volume, m³", "容积，m³"),
  colDims: L("Размеры в свету, м", "Ichki o‘lchamlar, m", "Clear dimensions, m", "内净尺寸，m"),
  colConcrete: L("Бетон, м³", "Beton, m³", "Concrete, m³", "混凝土，m³"),
  colExcav: L("Котлован, м³", "Kotlovan, m³", "Excavation, m³", "基坑开挖，m³"),
  totalWord: L("Итого", "Jami", "Total", "合计"),
  pipesTitle: L("Трубопроводы", "Quvurlar", "Pipelines", "管道"),
  colPipe: L("Трубопровод", "Quvur", "Pipeline", "管道"),
  colFlow: L("Расход, м³/ч", "Sarf, m³/soat", "Flow, m³/h", "流量，m³/h"),
  colVelocity: L("Скорость, м/с", "Tezlik, m/s", "Velocity, m/s", "流速，m/s"),
  colLength: L("Длина ≈, м", "Uzunlik ≈, m", "Length ≈, m", "长度 ≈，m"),
  colPipeVolume: L("Объём, м³", "Hajm, m³", "Volume, m³", "容积，m³"),
  colMaterial: L("Материал", "Material", "Material", "材质"),
  areaTitle: L("Площадь под станцию", "Stansiya uchun maydon", "Plant footprint", "站区占地"),
  areaStructures: L("Сооружения с проходами", "Inshootlar va o‘tish yo‘llari", "Structures with access", "构筑物及通道"),
  areaBuildings: L("Здания и помещения", "Binolar va xonalar", "Buildings and rooms", "建筑与厂房"),
  areaSludge: L("Площадка осадка", "Cho‘kindi maydoni", "Sludge yard", "污泥堆场"),
  areaBuilt: L("Площадь застройки", "Qurilish maydoni", "Built-up area", "建筑占地"),
  areaSite: L("Участок с подъездами", "Yo‘llar bilan uchastka", "Site with access roads", "含道路的用地"),
  areaSame: L("То же", "Shu bilan birga", "Same", "折合"),
  powerTitle: L("Электрическая часть", "Elektr qismi", "Electrical part", "电气部分"),
  powerInstalled: L("Установленная мощность", "O‘rnatilgan quvvat", "Installed power", "装机容量"),
  powerDemand: L("Расчётная мощность", "Hisobiy quvvat", "Design load", "计算负荷"),
  powerDaily: L("Потребление", "Iste’mol", "Consumption", "耗电量"),
  powerYearly: L("За год", "Yiliga", "Per year", "年耗电"),
  powerSpecific: L("Удельно на сток", "Oqovaga solishtirma", "Per m³ of wastewater", "单位水量电耗"),
  powerSpecificBod: L("Удельно на БПК", "BPKga solishtirma", "Per kg of BOD removed", "单位BOD电耗"),
  colConsumer: L("Потребитель", "Iste’molchi", "Consumer", "用电设备"),
  colQtyKw: L("Кол-во × кВт", "Soni × kVt", "Qty × kW", "数量 × kW"),
  colInstalled: L("Установл., кВт", "O‘rnatilgan, kVt", "Installed, kW", "装机，kW"),
  colHours: L("ч/сут", "soat/kun", "h/day", "小时/日"),
  colDaily: L("кВт·ч/сут", "kVt·soat/kun", "kWh/day", "kWh/日"),
  colBasis: L("Основание", "Asos", "Basis", "计算依据"),

  /* --- ведомость оборудования --- */
  colItem: L("Позиция", "Pozitsiya", "Item", "项目"),
  colSpec: L("Расчётный параметр", "Hisobiy parametr", "Design parameter", "设计参数"),
  colQty: L("Кол-во", "Soni", "Qty", "数量"),
  colSupply: L("Исполнение", "Ta’minot", "Supply", "供货"),
  kindStructure: L("сооружение", "inshoot", "structure", "构筑物"),
  kindMachine: L("оборудование", "uskuna", "equipment", "设备"),
  kindInstrument: L("КИП и автоматика", "O‘lchov va avtomatika", "instrumentation", "仪表与自控"),
  supplyOwn: L("производим", "ishlab chiqaramiz", "we manufacture", "自制"),
  supplyEither: L("производим или поставка", "ishlab chiqaramiz yoki yetkazamiz", "manufactured or supplied", "自制或采购"),
  supplySupply: L("поставка", "yetkazib berish", "supplied", "采购"),
  ownProduct: L("Наше готовое изделие под эту позицию", "Ushbu pozitsiya uchun tayyor mahsulotimiz", "Our standard product for this item", "对应我方标准产品"),

  /* --- кнопки --- */
  btnNote: L("Техническая записка с обоснованиями (ИИ)", "Asoslar bilan texnik izohnoma (SI)", "Technical note with justifications (AI)", "含论证的技术说明书（AI）"),
  btnNoteAgain: L("Составить записку заново", "Izohnomani qayta tuzish", "Regenerate the note", "重新生成说明书"),
  btnNoteBusy: L("Пишу записку… 20–40 с", "Izohnoma yozilmoqda… 20–40 s", "Writing the note… 20–40 s", "正在生成… 20–40 秒"),
  btnPdf: L("Сохранить в PDF", "PDF ga saqlash", "Save as PDF", "保存为 PDF"),
  btnDxfScheme: L("Скачать DXF: схема очистки", "DXF yuklab olish: tozalash sxemasi", "Download DXF: process scheme", "下载 DXF：工艺流程图"),
  btnDxfModels: L("Скачать DXF: габариты оборудования", "DXF yuklab olish: uskuna gabaritlari", "Download DXF: equipment dimensions", "下载 DXF：设备外形图"),
  btnPrintScheme: L("Схема в PDF (печать)", "Sxema PDF (chop etish)", "Scheme to PDF (print)", "流程图转 PDF（打印）"),
  btnPrintModels: L("Габариты в PDF (печать)", "Gabaritlar PDF (chop etish)", "Dimensions to PDF (print)", "外形图转 PDF（打印）"),
  btnAssumptions: L("Коэффициенты расчёта", "Hisob koeffitsiyentlari", "Design coefficients", "计算系数"),
  btnForms: L("Опросные листы", "So‘rovnomalar", "Questionnaires", "调查表"),
  btnQuote: L("Получить КП с чертежами", "Chizmalar bilan taklif olish", "Request a quotation with drawings", "索取含图纸的报价"),

  /* --- сноски --- */
  disclaimer: L(
    "Документ сформирован автоматически и является предварительным инженерным решением SUVSANOAT. Не заменяет проектную документацию.",
    "Hujjat avtomatik shakllantirilgan va SUVSANOAT ning dastlabki muhandislik yechimi hisoblanadi. Loyiha hujjatlarini almashtirmaydi.",
    "This document is generated automatically and is a preliminary engineering solution by SUVSANOAT. It does not replace design documentation.",
    "本文件由系统自动生成，为 SUVSANOAT 初步工程方案，不能替代设计文件。"
  ),
  supplyNote: L(
    "Состав оборудования определён технологией и расходом: часть позиций SUVSANOAT производит сам, часть поставляет — на состав решения это не влияет.",
    "Uskunalar tarkibi texnologiya va sarf bo‘yicha aniqlangan: bir qismini SUVSANOAT o‘zi ishlab chiqaradi, bir qismini yetkazib beradi — bu yechim tarkibiga ta’sir qilmaydi.",
    "The equipment scope is defined by the technology and the flow: SUVSANOAT manufactures some items and supplies others, which does not affect the solution.",
    "设备组成由工艺和流量决定：部分由 SUVSANOAT 自制，部分为采购，不影响方案本身。"
  ),
  dxfNote: L(
    "DXF (формат R12) открывается в AutoCAD, NanoCAD, ZWCAD, BricsCAD — «Сохранить как» → DWG. Если чертёж не виден сразу — команда «Показать границы» (Z ↵ E ↵).",
    "DXF (R12 formati) AutoCAD, NanoCAD, ZWCAD, BricsCAD da ochiladi — «Saqlash» → DWG. Chizma ko‘rinmasa — «Chegaralarni ko‘rsatish» buyrug‘i (Z ↵ E ↵).",
    "The DXF (R12) opens in AutoCAD, NanoCAD, ZWCAD, BricsCAD — Save As → DWG. If nothing is visible, run Zoom → Extents (Z ↵ E ↵).",
    "DXF（R12）可用 AutoCAD、NanoCAD、ZWCAD、BricsCAD 打开，另存为 DWG。若看不到图形，执行 Zoom → Extents（Z ↵ E ↵）。"
  ),
  noteAiBadge: L("ТЕХНИЧЕСКАЯ ЗАПИСКА · СОСТАВЛЕНА ИИ ПО РАСЧЁТУ SUVSANOAT", "TEXNIK IZOHNOMA · SUVSANOAT HISOBI ASOSIDA SI TOMONIDAN", "TECHNICAL NOTE · WRITTEN BY AI FROM THE SUVSANOAT CALCULATION", "技术说明书 · 由 AI 依据 SUVSANOAT 计算撰写"),
  noteTemplateBadge: L("ТЕХНИЧЕСКАЯ ЗАПИСКА · ШАБЛОН ПО РАСЧЁТУ SUVSANOAT", "TEXNIK IZOHNOMA · SUVSANOAT HISOBI BO‘YICHA SHABLON", "TECHNICAL NOTE · TEMPLATE FROM THE SUVSANOAT CALCULATION", "技术说明书 · 依据计算的模板"),
  noteDownload: L("Скачать .md", ".md yuklab olish", "Download .md", "下载 .md"),
  notePdf: L("PDF (расчёт + записка)", "PDF (hisob + izohnoma)", "PDF (calculation + note)", "PDF（计算＋说明书）"),
  notFound: L("Недостаточно данных.", "Ma’lumot yetarli emas.", "Not enough data.", "数据不足。"),
  startOver: L("Начать заново", "Qaytadan boshlash", "Start over", "重新开始"),
} satisfies Record<string, L10n>;
