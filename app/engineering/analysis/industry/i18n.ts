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
import {
  AEROTANK,
  KMK_2_04_03_19_DOC,
} from "../../../../norms/kmk-2-04-03-19";

export type L10n = Record<Language, string>;

/** строка, которая может быть уже переведена или ещё нет (для поэтапного перевода) */
export type Text = L10n | string;

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
  pageTitle: L("Что за производство?", "Qanday ishlab chiqarish?", "What kind of facility is it?", "属于什么生产？"),
  pageLead: L(
    "Для каждой отрасли у нас заложены характерные загрязнения и технологическая схема. Если у вас есть лабораторный анализ — введёте свои цифры, если нет — возьмём справочные значения по нормативам и отраслевым данным.",
    "Har bir tarmoq uchun xos ifloslanishlar va texnologik sxema oldindan kiritilgan. Laboratoriya tahlili bo‘lsa — o‘z raqamlaringizni kiritasiz, bo‘lmasa — me’yor va tarmoq ma’lumotlari bo‘yicha qiymatlar olinadi.",
    "For every industry we hold typical pollutant loads and a treatment train. If you have a laboratory analysis, enter your own figures; if not, reference values from standards and industry data are used.",
    "每个行业均预置了典型污染物与工艺流程。有化验数据可直接填写；没有则采用规范与行业手册的参考值。"
  ),
  errNoIndustry: L("Выберите отрасль.", "Tarmoqni tanlang.", "Select an industry.", "请选择行业。"),
  errNoLab: L("Укажите, есть ли лабораторный анализ стока.", "Oqova suv laboratoriya tahlili bor-yo‘qligini ko‘rsating.", "Indicate whether a laboratory analysis is available.", "请说明是否有化验数据。"),
  errNoFlow: L("Укажите расход сточных вод, м³/сут.", "Oqova suv sarfini ko‘rsating, m³/kun.", "Enter the wastewater flow, m³/day.", "请填写废水流量，m³/日。"),
  flowPlaceholder: L("например: 120", "masalan: 120", "for example: 120", "例如：120"),
  tuPlaceholder: L("по ТУ", "TSh bo‘yicha", "per permit", "按技术条件"),
  calcButton: L("Рассчитать очистные", "Tozalash inshootini hisoblash", "Calculate the treatment plant", "计算污水处理站"),
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
  refMidNote: L(
    "Приняты середины справочных диапазонов. Расчёт будет помечен как предварительный — перед рабочим проектированием нужен анализ усреднённой суточной пробы.",
    "Ma’lumotnoma diapazonlarining o‘rtasi qabul qilindi. Hisob dastlabki deb belgilanadi — ishchi loyihalashdan oldin o‘rtacha sutkalik namuna tahlili kerak.",
    "Mid-range reference values are used. The calculation is marked preliminary — a composite 24-hour sample analysis is required before detailed design.",
    "采用手册区间的中值。计算标记为初步结果——施工图设计前需做 24 小时混合样化验。"
  ),
  specialIndustryTitle: L("ОСОБЫЕ ЗАГРЯЗНИТЕЛИ ОТРАСЛИ", "TARMOQNING ALOHIDA IFLOSLANTIRUVCHILARI", "SPECIAL POLLUTANTS OF THIS INDUSTRY", "该行业的特殊污染物"),
  basisLabel: L("Основание", "Asos", "Basis", "依据"),
  hasTu: L("У меня есть технические условия или НДС — задать свои показатели", "Menda texnik shartlar yoki chiqindi me’yori bor — o‘z ko‘rsatkichlarimni kiritaman", "I have technical conditions or a discharge permit — enter my own limits", "我有排放技术条件或许可 — 自行填写指标"),
  labSection: L("ЛАБОРАТОРНЫЙ АНАЛИЗ СТОКА", "OQOVA SUV LABORATORIYA TAHLILI", "LABORATORY ANALYSIS", "废水化验数据"),
  labYes: L("Есть анализ — введу значения", "Tahlil bor — qiymatlarni kiritaman", "I have an analysis — enter values", "有化验单 — 手动输入"),
  labNo: L("Анализа нет — по нормативу", "Tahlil yo‘q — me’yor bo‘yicha", "No analysis — use reference data", "无化验 — 采用手册数据"),
  calculate: L("Рассчитать", "Hisoblash", "Calculate", "开始计算"),
  back: L("Назад", "Orqaga", "Back", "返回"),

  /* --- единый шаг «Исходные данные» --- */
  stepInput: L("ШАГ 01 / ИСХОДНЫЕ ДАННЫЕ", "01-BOSQICH / DASTLABKI MA’LUMOTLAR", "STEP 01 / INPUT DATA", "第 01 步 / 原始数据"),
  inputTitle: L("Исходные данные", "Dastlabki ma’lumotlar", "Input data", "原始数据"),
  inputLead: L(
    "Один шаг: объект, расход, состав стока, точка сброса и технология. Дальше система сама соберёт технологическую схему, спецификацию оборудования, чертежи DXF и техническую записку.",
    "Bitta bosqich: obyekt, sarf, oqova tarkibi, chiqindi nuqtasi va texnologiya. Keyin tizim texnologik sxema, uskunalar spetsifikatsiyasi, DXF chizmalar va texnik izohnomani o‘zi shakllantiradi.",
    "One step: the facility, the flow, the wastewater composition, the discharge point and the technology. The system then builds the process train, the equipment schedule, the DXF drawings and the technical note.",
    "一步完成：对象、流量、水质、排放去向与工艺。随后系统自动生成工艺流程、设备清单、DXF 图纸与技术说明书。"
  ),

  /* --- режим задания расхода --- */
  flowModeTitle: L("КАК ЗАДАЁМ РАСХОД", "SARF QANDAY BERILADI", "HOW THE FLOW IS DEFINED", "流量如何确定"),
  flowModeKnown: L("Расход известен", "Sarf ma’lum", "The flow is known", "已知流量"),
  flowModeKnownHint: L(
    "Ввести среднесуточный расход в м³/сут.",
    "O‘rtacha sutkalik sarfni m³/kun da kiritish.",
    "Enter the average daily flow in m³/day.",
    "直接填写平均日流量，m³/日。"
  ),
  flowModePopulation: L("По числу жителей / мест", "Aholi / o‘rin soni bo‘yicha", "By population / number of places", "按人口 / 床位数"),
  flowModePopulationHint: L(
    "Расход определяется по удельному водоотведению табл. 3 норматива.",
    "Sarf me’yorning 3-jadvalidagi solishtirma suv chiqarish bo‘yicha aniqlanadi.",
    "The flow is derived from the specific water disposal rate of table 3 of the code.",
    "按规范表 3 的单位排水量推算流量。"
  ),
  peopleLabel: L("Число жителей / мест, чел.", "Aholi / o‘rinlar soni, kishi", "Population / number of places, persons", "人数 / 床位数，人"),
  peoplePlaceholder: L("например: 17500", "masalan: 17500", "for example: 17500", "例如：17500"),
  settlementCategoryLabel: L("Категория населённого пункта (табл. 3)", "Aholi punkti toifasi (3-jadval)", "Settlement category (table 3)", "居民点类别（表 3）"),
  horizonLabel: L("Расчётный горизонт (табл. 3)", "Hisobiy ufq (3-jadval)", "Design horizon (table 3)", "设计年限（表 3）"),
  horizon2035: L("2035 г. — расчётный срок (по умолчанию)", "2035 y. — hisobiy muddat (standart)", "2035 — design horizon (default)", "2035 年 — 设计期（默认）"),
  horizon2020: L("2020 г.", "2020 y.", "2020", "2020 年"),
  specificUseLabel: L("Удельное среднесуточное водоотведение", "Solishtirma o‘rtacha sutkalik suv chiqarish", "Specific average daily water disposal", "单位平均日排水量"),
  unitLpcd: L("л/чел·сут", "l/kishi·kun", "L/person·day", "L/人·日"),
  addPercentLabel: L("Дополнительный расход, %", "Qo‘shimcha sarf, %", "Additional flow, %", "附加流量，%"),
  addPercent0: L("0 % — не добавлять", "0 % — qo‘shilmaydi", "0 % — none", "0 % — 不增加"),
  addPercent5: L("5 % — местная промышленность и неучтённые расходы (п. 2.3)", "5 % — mahalliy sanoat va hisobga olinmagan sarflar (2.3-band)", "5 % — local industry and unaccounted flows (cl. 2.3)", "5 % — 地方工业与未计入水量（第 2.3 条）"),
  addPercent10: L("10 % — неучтённые расходы (табл. 3, прим. 5)", "10 % — hisobga olinmagan sarflar (3-jadval, 5-izoh)", "10 % — unaccounted flows (table 3, note 5)", "10 % — 未计入水量（表 3 注 5）"),
  addPercent15: L("15 % — неучтённые расходы (табл. 3, прим. 5)", "15 % — hisobga olinmagan sarflar (3-jadval, 5-izoh)", "15 % — unaccounted flows (table 3, note 5)", "15 % — 未计入水量（表 3 注 5）"),
  computedFlowLabel: L("Расчётный расход", "Hisobiy sarf", "Design flow", "计算流量"),
  computedFlowFormula: L(
    "жители × удельное водоотведение / 1000 × (1 + доп. %)",
    "aholi × solishtirma suv chiqarish / 1000 × (1 + qo‘shimcha %)",
    "population × specific disposal / 1000 × (1 + additional %)",
    "人数 × 单位排水量 / 1000 × (1 + 附加 %)"
  ),
  table3NotesTitle: L("Примечания к табл. 3", "3-jadvalga izohlar", "Notes to table 3", "表 3 注释"),
  errNoPeople: L("Укажите число жителей или мест.", "Aholi yoki o‘rinlar sonini ko‘rsating.", "Enter the population or the number of places.", "请填写人数或床位数。"),

  /* --- объекта нет в списке --- */
  genericButton: L("Объекта нет в списке / смешанный сток", "Obyekt ro‘yxatda yo‘q / aralash oqova", "Facility not in the list / mixed wastewater", "对象不在列表中 / 混合污水"),
  genericButtonHint: L(
    "Все показатели вводятся вручную, схема — базовая полная.",
    "Barcha ko‘rsatkichlar qo‘lda kiritiladi, sxema — to‘liq asosiy.",
    "All values are entered manually; the train is the full default one.",
    "全部指标手动输入，工艺采用完整基础流程。"
  ),
  genericManualNote: L(
    "Отраслевые концентрации не подставляются: состав стока задаёте вы. Технологическая цепочка принята базовой полной — решётка, песколовка, усреднитель, биология, вторичное отстаивание, доочистка, обеззараживание, обработка осадка.",
    "Tarmoq konsentratsiyalari qo‘yilmaydi: oqova tarkibini siz belgilaysiz. Texnologik zanjir to‘liq asosiy qabul qilindi — panjara, qum tutgich, tenglashtirgich, biologiya, ikkilamchi tindirish, qo‘shimcha tozalash, zararsizlantirish, cho‘kindini qayta ishlash.",
    "No industry reference concentrations are substituted: you define the wastewater composition. The train is the full default one — screen, grit chamber, equalization, biology, secondary clarification, polishing, disinfection, sludge handling.",
    "不套用行业参考浓度：水质由您填写。工艺流程采用完整基础方案 — 格栅、沉砂池、调节池、生物处理、二沉、深度处理、消毒、污泥处理。"
  ),

  /* --- технология биологической очистки --- */
  techSection: L("ТЕХНОЛОГИЯ БИОЛОГИЧЕСКОЙ ОЧИСТКИ", "BIOLOGIK TOZALASH TEXNOLOGIYASI", "BIOLOGICAL TREATMENT TECHNOLOGY", "生物处理工艺"),
  techLead: L(
    "По умолчанию технология подбирается автоматически по расходу, нагрузке и требованиям точки сброса. Можно задать её вручную.",
    "Standart holatda texnologiya sarf, yuklama va chiqindi nuqtasi talablariga qarab avtomatik tanlanadi. Uni qo‘lda ham belgilash mumkin.",
    "By default the technology is selected automatically from the flow, the load and the discharge requirements. It can also be set manually.",
    "默认按流量、负荷和排放要求自动选型，也可手动指定。"
  ),
  techAuto: L("Подобрать автоматически", "Avtomatik tanlash", "Select automatically", "自动选型"),
  techAutoHint: L(
    "Решение принимает расчёт по исходным данным.",
    "Qarorni dastlabki ma’lumotlar bo‘yicha hisob qabul qiladi.",
    "The calculation decides from the input data.",
    "由计算依据原始数据决定。"
  ),
  techNormed: L(
    `Расчёт нормируется: ${AEROTANK.formula51.ref}; ${AEROTANK.formula54.ref}.`,
    `Hisob me’yorlanadi: ${AEROTANK.formula51.ref}; ${AEROTANK.formula54.ref}.`,
    `Design is codified: ${AEROTANK.formula51.ref}; ${AEROTANK.formula54.ref}.`,
    `计算有规范依据：${AEROTANK.formula51.ref}；${AEROTANK.formula54.ref}。`
  ),
  techNotNormed: L(
    `Параметры ${KMK_2_04_03_19_DOC.code} не нормирует — приняты по DWA и практике проектирования.`,
    `Parametrlar ${KMK_2_04_03_19_DOC.code} tomonidan me’yorlanmagan — DWA va loyihalash amaliyoti bo‘yicha qabul qilingan.`,
    `${KMK_2_04_03_19_DOC.code} does not codify these parameters — they follow DWA and design practice.`,
    `${KMK_2_04_03_19_DOC.code} 未对这些参数作规定 — 按 DWA 与工程实践取值。`
  ),

  /* --- результат --- */
  resultEyebrow: L("ПРЕДВАРИТЕЛЬНОЕ ИНЖЕНЕРНОЕ РЕШЕНИЕ", "DASTLABKI MUHANDISLIK YECHIMI", "PRELIMINARY ENGINEERING SOLUTION", "初步工程方案"),
  objectWord: L("Объект", "Obyekt", "Facility", "对象"),
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

  /* --- единицы --- */
  unitM3: L("м³", "m³", "m³", "m³"),
  unitM2: L("м²", "m²", "m²", "m²"),
  unitHa: L("га", "ga", "ha", "公顷"),
  unitKw: L("кВт", "kVt", "kW", "kW"),
  unitKwh: L("тыс. кВт·ч", "ming kVt·soat", "thousand kWh", "千 kWh"),
  unitKwhD: L("кВт·ч/сут", "kVt·soat/kun", "kWh/day", "kWh/日"),
  unitKwhM3: L("кВт·ч/м³", "kVt·soat/m³", "kWh/m³", "kWh/m³"),
  unitKwhKg: L("кВт·ч/кг", "kVt·soat/kg", "kWh/kg", "kWh/kg"),
  unitL: L("л", "l", "L", "L"),
  unitM3Day: L("м³/сут", "m³/kun", "m³/day", "m³/日"),

  /* --- названия ёмкостей в строительной части --- */
  tankAvg: L("Усреднитель", "Tenglashtirgich", "Equalization tank", "调节池"),
  tankBio: L("Биологический блок (аэротенк)", "Biologik blok (aerotenk)", "Biological block (aeration tank)", "生物池（曝气池）"),
  tankClarify: L("Вторичный отстойник", "Ikkilamchi tindirgich", "Secondary clarifier", "二沉池"),
  tankDaf: L("Флотатор с камерой флокуляции", "Flotator va flokulyatsiya kamerasi", "DAF unit with flocculation chamber", "气浮池及絮凝室"),
  tankPhyschem: L("Камеры смешения и хлопьеобразования", "Aralashtirish va parcha hosil qilish kameralari", "Rapid mix and flocculation chambers", "混合与絮凝池"),
  tankContact: L("Контактный резервуар", "Kontakt rezervuar", "Chlorine contact tank", "接触池"),
  tankSludge: L("Илоуплотнитель и стабилизатор", "Loyqa quyuqlashtirgich va stabilizator", "Sludge thickener and stabiliser", "污泥浓缩与稳定池"),
  tankIntake: L("Приёмная камера и аварийная ёмкость", "Qabul kamerasi va avariya rezervuari", "Inlet chamber and emergency tank", "进水井与事故池"),

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

/* ==================================================================
 * ГОТОВЫЕ СТРОКИ ИНТЕРФЕЙСА ДЛЯ ОДНОГО ЯЗЫКА
 *
 * Разметка страницы работает только со строками: объект L10n в JSX
 * попасть уже не может, а значит не может и уронить сборку ошибкой
 * «Type 'L10n' is not assignable to type 'ReactNode'».
 * ================================================================== */

/* ==================================================================
 * ТЕХНОЛОГИИ БИОЛОГИЧЕСКОЙ ОЧИСТКИ
 *
 * Состав и описания перенесены со страницы подбора технологии
 * (app/engineering/analysis/technology/page.tsx) и переведены на все
 * четыре языка сайта. Значение `id` уходит в URL-параметр `tech`.
 *
 * Нормируется ҚМҚ 2.04.03-19 только классический аэротенк
 * (п. 6.143, ф. (51), (52); п. 6.144, ф. (54)). Остальные варианты
 * нормативом не описаны — параметры по DWA и практике; поле
 * `normed` управляет подписью в интерфейсе.
 * ================================================================== */

export type BioTechnology = {
  /** значение URL-параметра `tech` */
  id: string;
  title: L10n;
  subtitle: L10n;
  /** когда вариант уместен — короткая подсказка проектировщику */
  when: L10n;
  /** параметры нормируются ҚМҚ 2.04.03-19 (только классический аэротенк) */
  normed: boolean;
};

export const BIO_TECHNOLOGIES: BioTechnology[] = [
  {
    id: "CAS",
    normed: true,
    title: L("Классический аэротенк (CAS)", "Klassik aerotenk (CAS)", "Conventional activated sludge (CAS)", "传统活性污泥法（CAS）"),
    subtitle: L("Активный ил со вторичным отстойником", "Faol loyqa va ikkilamchi tindirgich", "Activated sludge with a secondary clarifier", "活性污泥＋二沉池"),
    when: L(
      "Базовый вариант: устойчив, ремонтопригоден, требует площади и вторичного отстойника.",
      "Asosiy variant: barqaror, ta’mirlash oson, maydon va ikkilamchi tindirgich talab qiladi.",
      "The default option: robust and maintainable, but needs area and a secondary clarifier.",
      "基础方案：运行稳定、易维护，但占地大且需二沉池。"
    ),
  },
  {
    id: "MBBR",
    normed: false,
    title: L("MBBR", "MBBR", "MBBR", "MBBR"),
    subtitle: L("Подвижная биоплёнка", "Harakatlanuvchi bioplyonka", "Moving bed biofilm reactor", "移动床生物膜"),
    when: L(
      "Компактнее аэротенка при БПК от 150 мг/л и ограниченной площадке; при очень высоких требованиях к эффлюенту нужна дополнительная ступень разделения.",
      "BPK 150 mg/l dan yuqori va maydon cheklangan bo‘lsa aerotenkdan ixcham; effluentga talab juda yuqori bo‘lsa qo‘shimcha ajratish bosqichi kerak.",
      "More compact than an aeration tank at BOD above 150 mg/L and a tight site; a very strict effluent needs an extra separation stage.",
      "BOD 超过 150 mg/L 且场地紧张时比曝气池更紧凑；出水要求极高时需增加分离段。"
    ),
  },
  {
    id: "IFAS",
    normed: false,
    title: L("IFAS", "IFAS", "IFAS", "IFAS"),
    subtitle: L("Гибридная биомасса", "Gibrid biomassa", "Integrated fixed-film activated sludge", "泥膜复合工艺"),
    when: L(
      "Активный ил плюс прикреплённая биомасса — вариант реконструкции существующего аэротенка без увеличения объёма.",
      "Faol loyqa va biriktirilgan biomassa — mavjud aerotenkni hajmni oshirmasdan rekonstruksiya qilish varianti.",
      "Activated sludge plus attached biomass — the retrofit option for an existing aeration tank without enlarging it.",
      "活性污泥＋附着生物膜 — 不扩容改造既有曝气池的方案。"
    ),
  },
  {
    id: "SBR",
    normed: false,
    title: L("SBR", "SBR", "SBR", "SBR"),
    subtitle: L("Циклический биореактор", "Siklik bioreaktor", "Sequencing batch reactor", "序批式反应器"),
    when: L(
      "Наполнение, аэрация, отстаивание и выпуск в одном резервуаре: вторичный отстойник не нужен, режим гибкий, но требуется автоматика и ёмкость на цикл.",
      "To‘ldirish, aeratsiya, tindirish va chiqarish bitta rezervuarda: ikkilamchi tindirgich kerak emas, rejim moslashuvchan, lekin avtomatika va sikl uchun hajm zarur.",
      "Fill, aerate, settle and decant in one tank: no secondary clarifier, a flexible regime, but automation and cycle volume are required.",
      "进水、曝气、沉淀、排水在同一池内完成：无需二沉池，运行灵活，但需自控与周期容积。"
    ),
  },
  {
    id: "MBR",
    normed: false,
    title: L("MBR", "MBR", "MBR", "MBR"),
    subtitle: L("Биореактор с мембранным разделением", "Membranali ajratishli bioreaktor", "Membrane bioreactor", "膜生物反应器"),
    when: L(
      "Самое высокое качество эффлюента и минимальная площадь; выше расход энергии и требуется регламент промывки мембран.",
      "Eng yuqori effluent sifati va eng kichik maydon; energiya sarfi yuqori, membranalarni yuvish reglamenti talab qilinadi.",
      "The highest effluent quality and the smallest footprint; higher energy demand and a membrane cleaning regime are required.",
      "出水水质最好、占地最小；能耗较高并需膜清洗制度。"
    ),
  },
  {
    id: "UASB",
    normed: false,
    title: L("UASB", "UASB", "UASB", "UASB"),
    subtitle: L("Анаэробный реактор с восходящим потоком", "Yuqoriga oqimli anaerob reaktor", "Upflow anaerobic sludge blanket", "上流式厌氧污泥床"),
    when: L(
      "Для стока с ХПК от 1000 мгО/л как ступень предварительной анаэробной очистки; азот и фосфор не снимает — нужна последующая аэробная ступень.",
      "KKT 1000 mgO/l dan yuqori oqova uchun dastlabki anaerob bosqich sifatida; azot va fosforni olmaydi — keyin aerob bosqich kerak.",
      "For wastewater with COD above 1000 mgO/L as a pre-treatment anaerobic stage; it removes neither nitrogen nor phosphorus — an aerobic stage must follow.",
      "适用于 COD 高于 1000 mgO/L 的废水作厌氧预处理段；不脱氮除磷，其后须设好氧段。"
    ),
  },
  {
    id: "ABR",
    normed: false,
    title: L("ABR", "ABR", "ABR", "ABR"),
    subtitle: L("Анаэробный перегородочный реактор", "To‘siqli anaerob reaktor", "Anaerobic baffled reactor", "折流式厌氧反应器"),
    when: L(
      "Простой многокамерный анаэробный реактор без механики — для высоконагруженного стока и площадок без надёжной эксплуатации; после него обязательна аэробная доочистка.",
      "Mexanikasiz oddiy ko‘p kamerali anaerob reaktor — yuqori yuklamali oqova va ishonchli ekspluatatsiyasiz obyektlar uchun; keyin aerob qo‘shimcha tozalash shart.",
      "A simple multi-chamber anaerobic reactor with no moving parts — for high-strength wastewater and sites without reliable operation; aerobic polishing afterwards is mandatory.",
      "无机械部件的多格厌氧反应器 — 适用于高浓度废水及运维条件有限的场地；其后必须设好氧深度处理。"
    ),
  },
  {
    id: "AnMBR",
    normed: false,
    title: L("AnMBR", "AnMBR", "AnMBR", "AnMBR"),
    subtitle: L("Анаэробный реактор с мембранами", "Membranali anaerob reaktor", "Anaerobic membrane bioreactor", "厌氧膜生物反应器"),
    when: L(
      "ХПК от 800 мгО/л при высоких требованиях к разделению; отдельно проверяются биогаз, температура и экономика эксплуатации.",
      "KKT 800 mgO/l dan yuqori va ajratishga talab yuqori bo‘lganda; biogaz, harorat va ekspluatatsiya iqtisodi alohida tekshiriladi.",
      "COD above 800 mgO/L with strict separation requirements; biogas, temperature and operating economics must be verified separately.",
      "COD 高于 800 mgO/L 且分离要求高时采用；须单独核算沼气、温度与运行经济性。"
    ),
  },
];

export type UiStrings = Record<keyof typeof UI, string>;

export function ui(lang: Language): UiStrings {
  const out = {} as UiStrings;
  for (const key of Object.keys(UI) as (keyof typeof UI)[]) {
    out[key] = t(UI[key], lang);
  }
  return out;
}
