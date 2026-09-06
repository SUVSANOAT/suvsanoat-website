/* ==================================================================
 * СПРАВОЧНИК ОТРАСЛЕЙ И ХАРАКТЕРНЫХ ЗАГРЯЗНЕНИЙ СТОЧНЫХ ВОД
 *
 * Диапазоны концентраций — справочные, для предварительного
 * проектирования, когда у заказчика нет лабораторных анализов.
 * Основания: ҚМҚ 2.04.03-19 «Канализация. Наружные сети и сооружения»
 * (взамен КМК 2.04.03-97) — только для бытового стока: табл. 25
 * (загрязнения на жителя, п. 6.4) и табл. 3 (удельное водоотведение,
 * п. 2.9). Концентраций производственных стоков по отраслям ҚМҚ-19 не
 * содержит (п. 2.8–2.9 отсылают к укрупнённым нормам и аналогам), поэтому
 * отраслевые диапазоны — справочник проектировщика «Канализация
 * населённых мест и промышленных предприятий», Metcalf & Eddy
 * «Wastewater Engineering», отраслевые нормали ВНТП, и подписаны так.
 * Каждый расчёт по справочным данным помечается как предварительный
 * и подлежит уточнению лабораторным анализом усреднённой пробы.
 * ================================================================== */
import { L, type L10n, type Text } from "./i18n";
import {
  BIO_INLET_LIMITS,
  BOD5_TO_BODFULL,
  GRIT,
  KMK_2_04_03_19_DOC,
  P2O5_TO_P,
  REAGENTS,
  TABLE_2_UNEVENNESS,
  TABLE_25_PER_CAPITA_G_DAY,
  DISINFECTION,
  domesticConcentrations,
  kmkRef,
  specificWaterUse,
} from "../../../../norms/kmk-2-04-03-19";


export type PollutantKey =
  | "cod"      // ХПК, мг/л
  | "bod"      // БПК5, мг/л
  | "ss"       // взвешенные вещества, мг/л
  | "fats"     // жиры растительные/животные, мг/л
  | "petro"    // нефтепродукты, мг/л
  | "tn"       // азот общий, мг/л
  | "tp"       // фосфор общий, мг/л
  | "surf";    // СПАВ, мг/л

export const POLLUTANT_LABELS: Record<PollutantKey, { label: L10n; unit: L10n }> = {
  cod: { label: L("ХПК", "KKT (kimyoviy kislorod talabi)", "COD", "化学需氧量 COD"), unit: L("мгО/л", "mgO/l", "mgO/L", "mgO/L") },
  bod: { label: L("БПК₅", "BKT₅ (biologik kislorod talabi)", "BOD₅", "五日生化需氧量 BOD₅"), unit: L("мгО₂/л", "mgO₂/l", "mgO₂/L", "mgO₂/L") },
  ss: { label: L("Взвешенные вещества", "Muallaq moddalar", "Suspended solids", "悬浮物 SS"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
  fats: { label: L("Жиры", "Yog‘lar", "Fats, oils and grease", "油脂"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
  petro: { label: L("Нефтепродукты", "Neft mahsulotlari", "Petroleum hydrocarbons", "石油类"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
  tn: { label: L("Азот общий", "Umumiy azot", "Total nitrogen", "总氮 TN"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
  tp: { label: L("Фосфор общий", "Umumiy fosfor", "Total phosphorus", "总磷 TP"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
  surf: { label: L("СПАВ", "Yuza faol moddalar (SPAV)", "Surfactants", "表面活性剂"), unit: L("мг/л", "mg/l", "mg/L", "mg/L") },
};

/** Стадия технологической цепочки */
export type StageKey =
  | "screen"     // механическая решётка / процеживание
  | "avg"        // усреднитель расхода и состава
  | "grease"     // жироуловитель
  | "sand"       // песколовка
  | "oil"        // нефтеуловитель (тонкослойный)
  | "daf"        // напорная флотация
  | "neutral"    // нейтрализация / коррекция pH
  | "physchem"   // реагентная физико-химическая очистка
  | "bio"        // биологическая очистка (аэротенк/MBBR/SBR)
  | "clarify"    // вторичное отстаивание
  | "post"       // доочистка (фильтрация/сорбция)
  | "disinfect"  // обеззараживание (NaOCl / УФ)
  | "sludge";    // обработка осадка

/** диаметр задерживаемых частиц по табл. 27 ҚМҚ 2.04.03-19: 0,15–0,25 мм */
const SAND_D_RANGE = `${GRIT.table27[0].dMm}–${GRIT.table27[GRIT.table27.length - 1].dMm}`.replace(/\./g, ",");

export const STAGE_INFO: Record<StageKey, { title: L10n; what: L10n; makes: "own" | "own-partial" | "supply" }> = {
  screen: {
    title: L("Механическая очистка", "Mexanik tozalash", "Preliminary (mechanical) treatment", "机械预处理"),
    what: L(
      "Решётка / процеживатель задерживает крупные включения и мусор.",
      "Panjara yoki elak yirik qo‘shimchalar va chiqindini ushlab qoladi.",
      "A screen removes coarse solids and debris before every other stage.",
      "格栅拦截粗大杂物与垃圾。"
    ),
    makes: "supply",
  },
  avg: {
    title: L("Усреднитель", "Tenglashtirgich rezervuar", "Equalization tank", "调节池"),
    what: L(
      "Ёмкость усредняет залповые сбросы по расходу и составу — все последующие сооружения считаются на средний, а не пиковый сток.",
      "Rezervuar zalvorli oqimlarni sarf va tarkib bo‘yicha tenglashtiradi — keyingi barcha inshootlar cho‘qqi emas, o‘rtacha oqimga hisoblanadi.",
      "The tank evens out shock loads in flow and composition, so every downstream unit is sized for the average, not the peak.",
      "调节池均化水量与水质冲击，后续构筑物按平均流量而非峰值设计。"
    ),
    makes: "own",
  },
  grease: {
    title: L("Жироуловитель", "Yog‘ tutgich", "Grease trap", "隔油池"),
    what: L(
      "Гравитационное всплытие жиров до концентрации, безопасной для биологии и сетей.",
      "Yog‘larning gravitatsion suzib chiqishi — biologiya va tarmoq uchun xavfsiz darajagacha.",
      "Gravity flotation of fats down to a level safe for the biology and the sewer network.",
      "重力上浮去除油脂，使其降至生物段和管网可接受的浓度。"
    ),
    makes: "own",
  },
  sand: {
    title: L("Песколовка", "Qum tutgich", "Grit chamber", "沉砂池"),
    what: L(
      `Осаждение минеральных примесей крупностью ${SAND_D_RANGE} мм (${KMK_2_04_03_19_DOC.code}, п. 6.27, табл. 27).`,
      `Yirikligi ${SAND_D_RANGE} mm mineral qo‘shimchalarni cho‘ktirish (QMQ 2.04.03-19, 6.27-band, 27-jadval).`,
      `Settling of mineral particles ${SAND_D_RANGE.replace(/,/g, ".")} mm in size (KMK 2.04.03-19, cl. 6.27, table 27).`,
      `沉降粒径 ${SAND_D_RANGE.replace(/,/g, ".")} mm 的无机颗粒（KMK 2.04.03-19 第 6.27 条，表 27）。`
    ),
    makes: "own",
  },
  oil: {
    title: L("Нефтеуловитель", "Neft mahsulotlari tutgich", "Oil separator", "油水分离器"),
    what: L(
      "Тонкослойные модули: всплытие капли нефтепродукта 100 мкм, сбор плёнки.",
      "Yupqa qatlamli modullar: 100 mkm neft tomchisining suzib chiqishi, plyonkani yig‘ish.",
      "Lamella modules: flotation of a 100 µm oil droplet and collection of the surface film.",
      "斜板模块：使 100 µm 油滴上浮并收集浮油。"
    ),
    makes: "own",
  },
  neutral: {
    title: L("Нейтрализация", "Neytrallash", "Neutralization", "中和"),
    what: L(
      "Коррекция pH дозированием кислоты/щёлочи до 6,5–8,5 перед биологией.",
      "Biologiyadan oldin kislota/ishqor dozalash bilan pH ni 6,5–8,5 gacha to‘g‘rilash.",
      "pH correction to 6.5–8.5 by acid or alkali dosing ahead of the biology.",
      "生物处理前投加酸碱将 pH 调至 6.5–8.5。"
    ),
    makes: "own",
  },
  daf: {
    title: L("Флотация (DAF)", "Flotatsiya (DAF)", "Dissolved air flotation (DAF)", "溶气气浮（DAF）"),
    what: L(
      "Напорная флотация снимает эмульгированные жиры, СПАВ и мелкую взвесь, недоступные отстаиванию.",
      "Bosimli flotatsiya emulsiyalangan yog‘lar, SPAV va tindirishda ushlanmaydigan mayda muallaq zarralarni oladi.",
      "Pressurised flotation removes emulsified fats, surfactants and fine solids that settling cannot capture.",
      "加压溶气气浮去除乳化油脂、表面活性剂及沉淀难以去除的细微悬浮物。"
    ),
    makes: "own-partial",
  },
  physchem: {
    title: L("Реагентная обработка", "Reagentli ishlov berish", "Chemical treatment", "化学混凝处理"),
    what: L(
      `Коагуляция и флокуляция: осаждение красителей, металлов, коллоидов; хлопья удаляются отстаиванием/флотацией (дозы — ${REAGENTS.table61Municipal.ref}).`,
      "Koagulyatsiya va flokulyatsiya: bo‘yoq, metall va kolloidlarni cho‘ktirish; parchalar tindirish yoki flotatsiya bilan olinadi.",
      "Coagulation and flocculation precipitate dyes, metals and colloids; the flocs are removed by settling or flotation.",
      "混凝与絮凝沉淀染料、金属和胶体，絮体经沉淀或气浮去除。"
    ),
    makes: "own-partial",
  },
  bio: {
    title: L("Биологическая очистка", "Biologik tozalash", "Biological treatment", "生物处理"),
    what: L(
      "Аэротенк (MBBR/SBR) окисляет растворённую органику; расчёт по ҚМҚ 2.04.03-19 (пп. 6.140–6.179) и DWA-A 131.",
      "Aerotenk (MBBR/SBR) erigan organikani oksidlaydi; hisob QMQ 2.04.03-19 (6.140–6.179-bandlar) va DWA-A 131 bo‘yicha.",
      "The aeration tank (MBBR/SBR) oxidises dissolved organics; sized to KMK 2.04.03-19 (cl. 6.140–6.179) and DWA-A 131.",
      "曝气池（MBBR/SBR）氧化溶解性有机物；按 KMK 2.04.03-19（第 6.140–6.179 条）与 DWA-A 131 计算。"
    ),
    makes: "own",
  },
  clarify: {
    title: L("Вторичное отстаивание", "Ikkilamchi tindirish", "Secondary clarification", "二沉"),
    what: L(
      "Отделение активного ила; тонкослойные модули сокращают площадь.",
      "Faol loyqani ajratish; yupqa qatlamli modullar maydonni qisqartiradi.",
      "Separation of activated sludge; lamella modules reduce the required area.",
      "分离活性污泥；斜板模块可减小占地。"
    ),
    makes: "own",
  },
  post: {
    title: L("Доочистка", "Qo‘shimcha tozalash", "Tertiary polishing", "深度处理"),
    what: L(
      "Фильтрация / сорбция до требований на сброс или повторное использование.",
      "Chiqindi yoki qayta foydalanish talablarigacha filtrlash va sorbsiya.",
      "Filtration and sorption down to the discharge or reuse requirements.",
      "过滤与吸附，达到排放或回用要求。"
    ),
    makes: "own-partial",
  },
  disinfect: {
    title: L("Обеззараживание", "Zararsizlantirish", "Disinfection", "消毒"),
    what: L(
      "Гипохлорит натрия собственной электролизной установки или УФ.",
      "O‘z elektroliz qurilmasidan natriy gipoxlorit yoki ultrabinafsha nur.",
      "Sodium hypochlorite from an on-site electrolysis unit, or ultraviolet light.",
      "现场电解次氯酸钠或紫外线消毒。"
    ),
    makes: "own",
  },
  sludge: {
    title: L("Обработка осадка", "Cho‘kindiga ishlov berish", "Sludge treatment", "污泥处理"),
    what: L(
      "Уплотнение и обезвоживание осадка; вывоз или компостирование.",
      "Cho‘kindini quyuqlashtirish va suvsizlantirish; chiqarib yuborish yoki kompostlash.",
      "Thickening and dewatering of sludge, followed by disposal or composting.",
      "污泥浓缩与脱水，之后外运或堆肥。"
    ),
    makes: "own-partial",
  },
};

export type SpecialPollutant = {
  label: Text;
  range: [number, number];
  unit: Text;
  note: Text;
};

export type Industry = {
  id: string;
  group: string;
  name: L10n;
  /** характерный удельный сток для подсказки, м³ на единицу */
  flowHint: L10n;
  /** диапазоны загрязнений производственного стока */
  pollutants: Partial<Record<PollutantKey, [number, number]>>;
  ph: [number, number];
  special?: SpecialPollutant[];
  /** технологическая цепочка по порядку */
  chain: StageKey[];
  /** профессиональные особенности отрасли — идут в записку */
  notes: Text[];
  /** источники диапазонов */
  sources: Text[];
};

export type IndustryGroup = {
  id: string;
  name: L10n;
  icon: string;
};

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  { id: "food", name: L("Пищевая промышленность", "Oziq-ovqat sanoati", "Food industry", "食品工业"), icon: "factory" },
  { id: "textile", name: L("Текстиль и кожа", "To‘qimachilik va charm", "Textile and leather", "纺织与皮革"), icon: "drum" },
  { id: "municipal", name: L("Коммунальные и сервисные объекты", "Kommunal va xizmat obyektlari", "Municipal and service facilities", "市政与服务设施"), icon: "station" },
  { id: "heavy", name: L("Промышленность и производство", "Sanoat va ishlab chiqarish", "Industry and manufacturing", "工业与制造"), icon: "gear" },
  { id: "agro", name: L("Агропромышленные объекты", "Agrosanoat obyektlari", "Agricultural facilities", "农业设施"), icon: "leaf" },
];

const REF = "Справочник проектировщика «Канализация населённых мест и промпредприятий»";
const ME = "Metcalf & Eddy, Wastewater Engineering (типичные производственные стоки)";

/* ------------------------------------------------------------------
 * Бытовой сток по ҚМҚ 2.04.03-19
 *
 * Табл. 25 (п. 6.4) задаёт нагрузку на одного жителя, г/сут; концентрация
 * получается делением на удельное водоотведение по табл. 3 (п. 2.9).
 * Диапазон концентраций взят между крайними позициями табл. 3 на
 * расчётный срок 2035 г.: 280 л/(чел·сут) — города свыше 100 тыс. чел.
 * (нижняя концентрация) и 170 л/(чел·сут) — посёлки и райцентры до
 * 50 тыс. чел. (верхняя). БПК₅ — через BOD5_TO_BODFULL (норматив
 * оперирует БПКполн), P — из P₂O₅ через P2O5_TO_P.
 * ------------------------------------------------------------------ */
const WATER_USE_TOWN = specificWaterUse("town-under-50k");
const WATER_USE_CITY = specificWaterUse("city-over-100k");
const DOM_HI = domesticConcentrations(WATER_USE_TOWN.lpcd);
const DOM_LO = domesticConcentrations(WATER_USE_CITY.lpcd);
const domRange = (key: "cod" | "bod5" | "ss" | "fats" | "nh4N" | "pTotal" | "surfactants"): [number, number] => [
  Math.round(DOM_LO[key]),
  Math.round(DOM_HI[key]),
];
const T25 = TABLE_25_PER_CAPITA_G_DAY;
const gf = (v: number, d = 1) => v.toLocaleString("ru-RU", { maximumFractionDigits: d });

/** источник для бытового стока — нормируется ҚМҚ 2.04.03-19 */
const KMK_DOMESTIC = `${KMK_2_04_03_19_DOC.code}: табл. 25 (п. 6.4, загрязнения на жителя) при удельном водоотведении по табл. 3 (п. 2.9, расчётный срок 2035 г.)`;
/** источник для объектов, чьи концентрации в ҚМҚ-19 не заданы */
const NOT_IN_KMK = `концентрации ${KMK_2_04_03_19_DOC.code} не нормируются (табл. 25 задаёт только нагрузку на жителя, п. 2.2 отсылает к КМК 2.04.01-98); принято по справочным данным`;
/** дождевая канализация */
const KMK_RAIN = `${KMK_2_04_03_19_DOC.code}, пп. 2.11–2.19 (дождевая канализация, метод предельных интенсивностей); удельный сток 20 л/(с·га) — упрощение, нормативом не задан`;

const T2_FIRST = TABLE_2_UNEVENNESS[0];
const T2_100 = TABLE_2_UNEVENNESS.find((r) => r.averageLps === 100) ?? TABLE_2_UNEVENNESS[4];

/** id позиции «объекта нет в списке / смешанный сток» */
export const GENERIC_INDUSTRY_ID = "generic";

export const INDUSTRIES: Industry[] = [
  /* ============================ ПИЩЕВАЯ ============================ */
  {
    id: "dairy",
    group: "food",
    name: L("Молокозавод / молочный цех", "Sut zavodi / sut sexi", "Dairy plant / milk processing", "乳品厂 / 牛奶车间"),
    flowHint: L("1–3 м³ на 1 т переработанного молока", "1 t qayta ishlangan sutga 1–3 m³", "1–3 m³ per tonne of processed milk", "每吨加工牛奶 1–3 m³"),
    pollutants: { cod: [2000, 6000], bod: [1200, 4000], ss: [350, 1000], fats: [200, 800], tn: [50, 120], tp: [15, 50], surf: [5, 30] },
    ph: [5.5, 9.5],
    chain: ["screen", "avg", "grease", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Главная опасность — залповый сброс сыворотки: её ХПК достигает 60 000–80 000 мгО/л, и одна тонна сыворотки по нагрузке равна суткам обычного стока. Сыворотку собирают отдельно и не сбрасывают в очистные.",
      "Сильные суточные колебания (мойка танков CIP — щёлочь и кислота): усреднитель принимается не менее чем на 6–8 часов притока, pH корректируется до биологии.",
      "Жиры до биологии должны быть сняты до 50 мг/л — иначе обрастает загрузка и падает перенос кислорода.",
    ],
    sources: [REF, ME, "ВНТП 645/1618-92 (молочная промышленность)"],
  },
  {
    id: "meat",
    group: "food",
    name: L("Мясокомбинат / убойный цех", "Go‘sht kombinati / so‘yish sexi", "Meat plant / slaughterhouse", "肉类联合厂 / 屠宰车间"),
    flowHint: L("5–15 м³ на 1 т живого веса", "1 t tirik vaznga 5–15 m³", "5–15 m³ per tonne of live weight", "每吨活重 5–15 m³"),
    pollutants: { cod: [3000, 8000], bod: [1500, 4500], ss: [800, 3000], fats: [300, 1200], tn: [120, 300], tp: [20, 60] },
    ph: [6.0, 8.5],
    special: [{ label: "Кровь (по ХПК)", range: [150000, 200000], unit: "мгО/л", note: "Кровь собирается отдельно: 1 м³ крови по нагрузке = ~500 м³ стока." }],
    chain: ["screen", "avg", "grease", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Обязательное процеживание (решётка ≤2 мм): щетина, кусочки тканей и жир быстро выводят из строя насосы и забивают трубопроводы.",
      "Высокий азот (белки): при жёстких требованиях на сброс биология считается с нитри-денитрификацией, объём аэротенка растёт в 1,5–2 раза.",
      "Флотация перед биологией снимает до 70–80 % жиров и до половины ХПК — без неё биологический блок получается в разы больше.",
    ],
    sources: [REF, ME, "ВНТП 532/739 (мясная промышленность)"],
  },
  {
    id: "poultry",
    group: "food",
    name: L("Птицефабрика / убой птицы", "Parrandachilik fabrikasi / parranda so‘yish", "Poultry plant / poultry slaughter", "家禽厂 / 禽类屠宰"),
    flowHint: L("8–12 л на 1 голову", "1 bosh uchun 8–12 l", "8–12 L per bird", "每只 8–12 L"),
    pollutants: { cod: [2500, 7000], bod: [1200, 3500], ss: [600, 2000], fats: [200, 800], tn: [100, 250], tp: [15, 40] },
    ph: [6.0, 8.0],
    chain: ["screen", "avg", "grease", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Перо и подстилка требуют самоочищающейся решётки ≤1 мм — обычная корзина забивается за смену.",
      "Сток нестабилен по дням (дни убоя): усреднитель считается на суточный цикл, а не на часы.",
    ],
    sources: [REF, ME],
  },
  {
    id: "confectionery",
    group: "food",
    name: L("Кондитерская фабрика / хлебозавод", "Qandolat fabrikasi / non zavodi", "Confectionery / bakery plant", "糖果厂 / 面包厂"),
    flowHint: L("2–5 м³ на 1 т продукции", "1 t mahsulotga 2–5 m³", "2–5 m³ per tonne of product", "每吨产品 2–5 m³"),
    pollutants: { cod: [1500, 4000], bod: [800, 2500], ss: [300, 800], fats: [100, 400], tn: [20, 60], tp: [5, 20], surf: [5, 20] },
    ph: [5.5, 8.5],
    chain: ["screen", "avg", "grease", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Сахара и крахмал дают быстроокисляемый ХПК: биология работает хорошо, но склонна к вспуханию ила при недостатке азота — контролируется соотношение БПКполн:N:P = 100:${BIO_INLET_LIMITS.nPer100Bod}:${BIO_INLET_LIMITS.pPer100Bod} (${BIO_INLET_LIMITS.ref}), при дефиците дозируется карбамид.`,
      "Мойка форм с маслом — жироуловитель обязателен до биологии.",
    ],
    sources: [REF, ME],
  },
  {
    id: "beverages",
    group: "food",
    name: L("Напитки / соки / розлив", "Ichimliklar / sharbatlar / quyish", "Beverages / juices / bottling", "饮料 / 果汁 / 灌装"),
    flowHint: L("1,5–4 м³ на 1000 л продукции", "1000 l mahsulotga 1,5–4 m³", "1.5–4 m³ per 1000 L of product", "每千升产品 1.5–4 m³"),
    pollutants: { cod: [1000, 4000], bod: [600, 2500], ss: [100, 400], tn: [10, 40], tp: [5, 15], surf: [10, 40] },
    ph: [4.5, 10.0],
    chain: ["screen", "avg", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "pH прыгает от кислых продуктовых сбросов до щелочной мойки CIP: нейтрализация со станцией дозирования — первый обязательный узел.",
      "Органика растворённая и легкоокисляемая — флотация обычно не нужна, экономится целый узел.",
    ],
    sources: [REF, ME],
  },
  {
    id: "brewery",
    group: "food",
    name: L("Пивзавод / солодовня", "Pivo zavodi / solod ishlab chiqarish", "Brewery / malting plant", "啤酒厂 / 麦芽厂"),
    flowHint: L("4–8 м³ на 1000 л пива", "1000 l pivoga 4–8 m³", "4–8 m³ per 1000 L of beer", "每千升啤酒 4–8 m³"),
    pollutants: { cod: [2000, 6000], bod: [1200, 3500], ss: [300, 1000], tn: [30, 80], tp: [10, 30] },
    ph: [4.5, 11.0],
    chain: ["screen", "avg", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Дробина и дрожжи собираются сухим способом — их попадание в сток удваивает нагрузку.",
      "При ХПК выше 4000 и крупных объёмах экономику стоит считать с анаэробной первой ступенью (UASB): она снимает 70–80 % ХПК и даёт биогаз; аэробная ступень после неё — доочистка.",
    ],
    sources: [REF, ME],
  },
  {
    id: "cannery",
    group: "food",
    name: L("Консервный / плодоовощной завод", "Konserva / meva-sabzavot zavodi", "Cannery / fruit and vegetable plant", "罐头厂 / 果蔬加工厂"),
    flowHint: L("3–8 м³ на 1 т сырья", "1 t xom ashyoga 3–8 m³", "3–8 m³ per tonne of raw material", "每吨原料 3–8 m³"),
    pollutants: { cod: [1500, 5000], bod: [800, 3000], ss: [500, 2500], fats: [50, 200], tn: [20, 60], tp: [5, 20] },
    ph: [5.0, 9.0],
    chain: ["screen", "sand", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Много земли и песка с мойки овощей — песколовка ставится до усреднителя, иначе он заиливается.",
      "Ярко выраженная сезонность (сезон переработки): оборудование подбирается на пиковый сезон, биология проектируется с возможностью работы на половинной нагрузке в межсезонье.",
    ],
    sources: [REF, ME],
  },
  {
    id: "oilfat",
    group: "food",
    name: L("Масложировой комбинат", "Yog‘-moy kombinati", "Oils and fats plant", "油脂厂"),
    flowHint: L("1–3 м³ на 1 т продукции", "1 t mahsulotga 1–3 m³", "1–3 m³ per tonne of product", "每吨产品 1–3 m³"),
    pollutants: { cod: [3000, 10000], bod: [1500, 5000], ss: [400, 1500], fats: [500, 3000], surf: [10, 50] },
    ph: [6.0, 10.0],
    chain: ["screen", "avg", "grease", "daf", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Рекордные жиры: двухступенчатое жироулавливание (гравитационное + флотация) обязательно, флотация с коагулянтом снимает эмульгированные масла после рафинации.",
      "Соапсток и жирные отходы не сбрасываются — только сбор и переработка.",
    ],
    sources: [REF, ME, "ВНТП (масложировая промышленность)"],
  },
  {
    id: "fish",
    group: "food",
    name: L("Рыбопереработка", "Baliqni qayta ishlash", "Fish processing", "水产加工"),
    flowHint: L("5–12 м³ на 1 т сырья", "1 t xom ashyoga 5–12 m³", "5–12 m³ per tonne of raw material", "每吨原料 5–12 m³"),
    pollutants: { cod: [2500, 8000], bod: [1200, 4000], ss: [500, 2000], fats: [300, 1500], tn: [80, 250], tp: [15, 50] },
    ph: [6.0, 8.5],
    chain: ["screen", "avg", "grease", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Высокая солёность рассолов угнетает биологию: при NaCl выше 5 г/л рассольные потоки усредняются отдельно и подаются дозированно.",
      "Белковый азот — как у мясокомбината: нитри-денитрификация при сбросе в водоём.",
    ],
    sources: [REF, ME],
  },
  /* ========================= ТЕКСТИЛЬ И КОЖА ========================= */
  {
    id: "textile-dye",
    group: "textile",
    name: L("Текстильный комбинат / крашение", "To‘qimachilik kombinati / bo‘yash", "Textile mill / dyeing and finishing", "纺织厂 / 染整"),
    flowHint: L("60–150 м³ на 1 т ткани", "1 t matoga 60–150 m³", "60–150 m³ per tonne of fabric", "每吨织物 60–150 m³"),
    pollutants: { cod: [800, 2500], bod: [200, 800], ss: [100, 500], surf: [20, 100], tn: [15, 50], tp: [3, 15] },
    ph: [8.0, 12.0],
    special: [
      { label: "Цветность", range: [300, 4000], unit: "град. ПКШ", note: "Красители почти не биоразлагаются — снимаются коагуляцией, без неё сток остаётся окрашенным даже после биологии." },
      { label: "Сульфиды (сернистые красители)", range: [5, 50], unit: "мг/л", note: "При сернистом крашении — предварительное окисление." },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Соотношение БПК/ХПК низкое (0,25–0,35): значительная часть органики биологически трудноокисляема, поэтому реагентная ступень стоит ДО биологии, а не после.",
      `Горячие стоки крашения (60–90 °C) охлаждаются в усреднителе: температура на входе в биологическую очистку не выше ${BIO_INLET_LIMITS.tempMaxC} °C (${BIO_INLET_LIMITS.ref}).`,
      "Щелочная среда мерсеризации и отварки: нейтрализация кислотой со станцией дозирования — обязательный узел.",
    ],
    sources: [REF, ME, "ВНТП текстильной промышленности"],
  },
  {
    id: "knitwear",
    group: "textile",
    name: L("Трикотаж / отделочная фабрика", "Trikotaj / pardozlash fabrikasi", "Knitwear / finishing mill", "针织 / 后整理厂"),
    flowHint: L("40–100 м³ на 1 т изделий", "1 t mahsulotga 40–100 m³", "40–100 m³ per tonne of goods", "每吨产品 40–100 m³"),
    pollutants: { cod: [600, 1800], bod: [200, 700], ss: [80, 300], surf: [30, 150], tn: [10, 40], tp: [3, 12] },
    ph: [7.5, 11.0],
    special: [{ label: "Цветность", range: [200, 2000], unit: "град. ПКШ", note: "Коагуляция обесцвечивает; доза подбирается пробным коагулированием." }],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Высокие СПАВ от промывок: пеногашение в усреднителе и аэротенке; часть СПАВ снимается флотацией вместе с коагулянтом.",
    ],
    sources: [REF, ME],
  },
  {
    id: "wool",
    group: "textile",
    name: L("Шерстомойка / ПОШ", "Jun yuvish korxonasi", "Wool scouring plant", "洗毛厂"),
    flowHint: L("20–50 м³ на 1 т шерсти", "1 t junga 20–50 m³", "20–50 m³ per tonne of wool", "每吨羊毛 20–50 m³"),
    pollutants: { cod: [5000, 20000], bod: [2000, 8000], ss: [3000, 15000], fats: [1500, 8000], surf: [50, 300] },
    ph: [7.0, 10.0],
    chain: ["screen", "sand", "avg", "grease", "daf", "physchem", "bio", "clarify", "post", "sludge"],
    notes: [
      "Один из самых грязных стоков в промышленности: ланолин и грязь дают десятки граммов взвеси на литр. Первая ступень — механика и жироизвлечение, ланолин — товарный продукт.",
      "Проектировать только по лабораторным данным конкретной фабрики: разброс в разы.",
    ],
    sources: [REF, ME],
  },
  {
    id: "leather",
    group: "textile",
    name: L("Кожевенный завод", "Charm zavodi", "Tannery", "制革厂"),
    flowHint: L("30–60 м³ на 1 т сырья", "1 t xom ashyoga 30–60 m³", "30–60 m³ per tonne of hides", "每吨原料 30–60 m³"),
    pollutants: { cod: [3000, 8000], bod: [1000, 3000], ss: [1500, 6000], fats: [200, 800], tn: [200, 500], surf: [20, 80] },
    ph: [7.0, 12.0],
    special: [
      { label: "Хром общий (Cr³⁺)", range: [30, 120], unit: "мг/л", note: `Хромовые стоки дубления собираются ОТДЕЛЬНО: осаждение известковым молоком при pH 8,5–9 (${kmkRef("6.286")}), осадок гидроксида хрома — на регенерацию или спецполигон.` },
      { label: "Сульфиды S²⁻", range: [100, 400], unit: "мг/л", note: "Зольные стоки тоже отдельно: окисление сульфидов (аэрация с катализатором MnSO₄) до смешения — иначе при подкислении выделяется смертельно опасный H₂S." },
      { label: "Хлориды", range: [3000, 15000], unit: "мг/л", note: "Соль от консервации шкур; биология адаптируется при плавном усреднении." },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Ключ к кожевенному стоку — РАЗДЕЛЬНЫЙ сбор трёх потоков: хромового, сульфидного (зольного) и общего. Смешивать их до обработки нельзя по технике безопасности.",
      "После локальной обработки потоков общий сток идёт по классической схеме: усреднение → коагуляция → флотация → биология с нитрификацией (высокий аммонийный азот от золения).",
      "Осадки хромсодержащие — отдельная линия обезвоживания и паспортизация как отхода.",
    ],
    sources: [REF, ME, "ВНТП кожевенной промышленности"],
  },
  {
    id: "shoe",
    group: "textile",
    name: L("Обувная фабрика", "Poyabzal fabrikasi", "Footwear factory", "制鞋厂"),
    flowHint: L("0,5–2 м³ на 1000 пар", "1000 juftga 0,5–2 m³", "0.5–2 m³ per 1000 pairs", "每千双 0.5–2 m³"),
    pollutants: { cod: [400, 1200], bod: [150, 500], ss: [100, 400], petro: [5, 30], surf: [10, 50] },
    ph: [6.5, 9.0],
    chain: ["screen", "avg", "physchem", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "Сток небольшой и близок к хозбытовому с примесью клеёв и растворителей; при малых расходах экономичнее компактная блочная ЛОС с физико-химической приставкой.",
    ],
    sources: [REF],
  },
  /* ==================== КОММУНАЛКА И СЕРВИС ==================== */
  {
    id: "settlement",
    group: "municipal",
    name: L("Посёлок / населённый пункт целиком", "Posyolka / butun aholi punkti", "Settlement / whole community", "居民点 / 整个聚居区"),
    flowHint: L(
      `${WATER_USE_TOWN.lpcd} л на жителя в сутки для посёлков и райцентров до 50 тыс. чел., ${WATER_USE_CITY.lpcd} л — для городов свыше 100 тыс. чел. (${KMK_2_04_03_19_DOC.code}, п. 2.9, табл. 3, 2035 г.)`,
      `kuniga bir aholiga ${WATER_USE_TOWN.lpcd} l (50 ming kishigacha posyolka va tuman markazlari), ${WATER_USE_CITY.lpcd} l — 100 ming kishidan ortiq shaharlar (QMQ 2.04.03-19, 2.9-band, 3-jadval, 2035 y.)`,
      `${WATER_USE_TOWN.lpcd} L per capita per day for towns under 50 000, ${WATER_USE_CITY.lpcd} L for cities over 100 000 (KMK 2.04.03-19, cl. 2.9, table 3, year 2035)`,
      `每人每日 ${WATER_USE_TOWN.lpcd} L（5 万人以下城镇），${WATER_USE_CITY.lpcd} L（10 万人以上城市）（KMK 2.04.03-19 第 2.9 条，表 3，2035 年）`
    ),
    /* табл. 25 при 280…170 л/(чел·сут); tn — по аммонийному азоту табл. 25 (общий азот бытового стока нормативом не задан) */
    pollutants: {
      cod: domRange("cod"),
      bod: domRange("bod5"),
      ss: domRange("ss"),
      fats: domRange("fats"),
      tn: domRange("nh4N"),
      tp: domRange("pTotal"),
      surf: domRange("surfactants"),
    },
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "sand", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Хозбытовой сток по ${kmkRef("6.4", "табл. 25")}: нагрузка на жителя в сутки — ${T25.bodFull} г БПКполн (≈${gf(T25.bodFull * BOD5_TO_BODFULL, 0)} г БПК₅ при БПК₅/БПКполн = ${gf(BOD5_TO_BODFULL, 2)}), ${T25.suspendedSolids} г взвешенных, ${T25.ammoniumN} г азота аммонийного, ${gf(T25.phosphatesP2O5)} г фосфатов P₂O₅ (≈${gf(T25.phosphatesP2O5 * P2O5_TO_P)} г P), ${T25.cod} г ХПК, ${T25.fats} г жиров, ${gf(T25.surfactants)} г ПАВ. Концентрации выше получены делением на удельное водоотведение ${WATER_USE_CITY.lpcd}…${WATER_USE_TOWN.lpcd} л/(чел·сут) по табл. 3.`,
      `Коэффициент общей неравномерности притока по ${kmkRef("2.7", "табл. 2")}: K_gen.max = ${gf(T2_FIRST.kMax)} при ${T2_FIRST.averageLps} л/с … ${gf(T2_100.kMax)} при ${T2_100.averageLps} л/с (при среднем расходе менее ${T2_FIRST.averageLps} л/с — по КМК 2.04.01-98, прим. 2): усреднитель или запас ёмкости приёмной камеры обязателен.`,
    ],
    sources: [KMK_DOMESTIC],
  },
  {
    id: "hotel",
    group: "municipal",
    name: L("Гостиница / санаторий / зона отдыха", "Mehmonxona / sanatoriy / dam olish maskani", "Hotel / sanatorium / resort", "酒店 / 疗养院 / 度假区"),
    flowHint: L("250–300 л на место в сутки", "kuniga bir o‘ringa 250–300 l", "250–300 L per bed per day", "每床位每日 250–300 L"),
    pollutants: { cod: [500, 900], bod: [250, 450], ss: [250, 450], fats: [50, 150], tn: [45, 80], tp: [10, 18], surf: [10, 30] },
    ph: [6.5, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Утренний пик в 3–4 раза выше среднего часа — усреднитель считается на пиковые 3 часа.",
      "Кухня ресторана даёт жиры: жироуловитель на кухонной линии до смешения с общим стоком.",
      "Сезонные объекты: биология с быстрым запуском (биоплёнка на носителе выходит на режим за 2–3 недели).",
    ],
    sources: [NOT_IN_KMK, REF],
  },
  {
    id: "hospital",
    group: "municipal",
    name: L("Больница / клиника", "Kasalxona / klinika", "Hospital / clinic", "医院 / 诊所"),
    flowHint: L("250–400 л на койку в сутки", "kuniga bir karavotga 250–400 l", "250–400 L per hospital bed per day", "每病床每日 250–400 L"),
    pollutants: { cod: [450, 800], bod: [220, 400], ss: [200, 400], fats: [40, 120], tn: [40, 80], tp: [8, 16], surf: [10, 40] },
    ph: [6.5, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Обеззараживание стока — обязательное требование санитарных норм для медицинских учреждений; доза активного хлора выше коммунальной (до ${DISINFECTION.chlorineDose.afterMechanical} г/м³ по санитарным требованиям; ${DISINFECTION.chlorineDose.ref} даёт ${DISINFECTION.chlorineDose.afterBio} г/м³ после биологической очистки), время контакта не менее ${DISINFECTION.contactMinutes.value} мин (${DISINFECTION.contactMinutes.ref}).`,
      "Дезинфицирующие средства из отделений могут угнетать биологию — усреднение сглаживает залпы.",
      "Инфекционные отделения — отдельный локальный узел обеззараживания до общего стока.",
    ],
    sources: [NOT_IN_KMK, "СанПиН РУз"],
  },
  {
    id: "school",
    group: "municipal",
    name: L("Школа / детский сад", "Maktab / bolalar bog‘chasi", "School / kindergarten", "学校 / 幼儿园"),
    flowHint: L("20–80 л на человека в сутки", "kuniga bir kishiga 20–80 l", "20–80 L per person per day", "每人每日 20–80 L"),
    pollutants: { cod: [350, 600], bod: [180, 300], ss: [180, 300], fats: [30, 100], tn: [30, 60], tp: [6, 12] },
    ph: [6.5, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "Сток только в учебные часы и полное отсутствие ночью и на каникулах: биология на прикреплённой биоплёнке переносит паузы лучше взвешенного ила.",
      "Пищеблок — жироуловитель под мойку.",
    ],
    sources: [NOT_IN_KMK, REF],
  },
  {
    id: "restaurant",
    group: "municipal",
    name: L("Ресторан / кафе / столовая", "Restoran / kafe / oshxona", "Restaurant / cafe / canteen", "餐厅 / 咖啡厅 / 食堂"),
    flowHint: L("15–25 л на блюдо", "bir taomga 15–25 l", "15–25 L per meal served", "每份餐 15–25 L"),
    pollutants: { cod: [800, 2500], bod: [400, 1200], ss: [300, 900], fats: [150, 600], surf: [20, 60] },
    ph: [5.5, 8.5],
    chain: ["grease", "avg", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "Жиры — главный параметр: жироуловитель по EN 1825 с временем пребывания не менее 60 минут при расчётном расходе кухни (жироуловители в ҚМҚ 2.04.03-19 не нормируются).",
      "При сбросе в городскую сеть часто достаточно жироуловителя и усреднителя — полная биология нужна только при автономном сбросе.",
    ],
    sources: ["EN 1825-2 (жироуловители; в ҚМҚ 2.04.03-19 не нормируются)", NOT_IN_KMK],
  },
  {
    id: "mall",
    group: "municipal",
    name: L("Торговый центр / рынок", "Savdo markazi / bozor", "Shopping centre / market", "购物中心 / 市场"),
    flowHint: L("4–10 л на м² торговой площади", "1 m² savdo maydoniga 4–10 l", "4–10 L per m² of retail area", "每 m² 营业面积 4–10 L"),
    pollutants: { cod: [400, 900], bod: [200, 450], ss: [200, 500], fats: [50, 200], petro: [3, 15], surf: [10, 40] },
    ph: [6.5, 8.5],
    chain: ["screen", "grease", "sand", "avg", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "Смешанный сток: фудкорт даёт жиры, паркинг — нефтепродукты в ливнёвке. Кухонная и дождевая линии обрабатываются раздельно: жироуловитель на фудкорт, нефтеуловитель на ливнёвку паркинга (расход дождевого стока — по пп. 2.11–2.19 ҚМҚ 2.04.03-19).",
    ],
    sources: [NOT_IN_KMK, REF],
  },
  {
    id: "carwash",
    group: "municipal",
    name: L("Автомойка", "Avtomobil yuvish shoxobchasi", "Car wash", "洗车场"),
    flowHint: L("150–300 л на автомобиль", "bir avtomobilga 150–300 l", "150–300 L per vehicle", "每车 150–300 L"),
    pollutants: { cod: [300, 1000], bod: [80, 250], ss: [500, 2500], petro: [30, 300], surf: [20, 100] },
    ph: [6.5, 9.0],
    chain: ["sand", "oil", "post", "disinfect"],
    notes: [
      "Основные загрязнители — песок и нефтепродукты, биология не нужна: песколовка → тонкослойный нефтеуловитель → фильтр доочистки.",
      "Оборотное водоснабжение окупается за счёт платы за воду: до 80 % воды возвращается на мойку, обеззараживание оборотной воды обязательно против запаха.",
    ],
    sources: [REF, "EN 858"],
  },
  {
    id: "gasstation",
    group: "municipal",
    name: L("АЗС / СТО / паркинг", "Yoqilg‘i quyish shoxobchasi / avtoservis / avtoturargoh", "Filling station / service station / car park", "加油站 / 汽修 / 停车场"),
    flowHint: L("по площади ливнестока, 20 л/с с 1 га при q₂₀", "yomg‘ir oqimi maydoni bo‘yicha, q₂₀ da 1 gektardan 20 l/s", "by catchment area, 20 L/s per hectare at q₂₀", "按汇水面积计，q₂₀ 时每公顷 20 L/s"),
    pollutants: { ss: [300, 1500], petro: [50, 500] },
    ph: [6.5, 8.5],
    chain: ["sand", "oil", "post"],
    notes: [
      `Ливневый сток с покрытий: расчётный расход — по интенсивности дождя района строительства методом предельных интенсивностей (${KMK_2_04_03_19_DOC.code}, пп. 2.11–2.19, ф. (2)–(11)); 20 л/(с·га) в подсказке — упрощение для предварительной оценки.`,
      "Нефтеуловитель с тонкослойным модулем и автоматическим затвором на выходе — требование при сбросе в сеть; норматив на выходе — 0,3 мг/л с фильтром доочистки.",
    ],
    sources: [KMK_RAIN, "EN 858 (сепараторы нефтепродуктов; в ҚМҚ 2.04.03-19 не нормируются)"],
  },
  {
    id: "laundry",
    group: "municipal",
    name: L("Прачечная / химчистка", "Kir yuvish korxonasi / kimyoviy tozalash", "Laundry / dry cleaning", "洗衣房 / 干洗"),
    flowHint: L("15–25 л на 1 кг белья", "1 kg kirga 15–25 l", "15–25 L per kg of laundry", "每公斤衣物 15–25 L"),
    pollutants: { cod: [600, 1500], bod: [250, 600], ss: [100, 400], surf: [50, 250], tp: [10, 30] },
    ph: [8.0, 11.0],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "СПАВ и фосфаты от моющих средств — определяющие: коагуляция с флотацией до биологии, иначе пена и угнетение ила.",
      `Щелочной сток: нейтрализация до pH ${gf(BIO_INLET_LIMITS.phMin)}–${gf(BIO_INLET_LIMITS.phMax)} (${kmkRef("6.2")}, п. 6.258).`,
    ],
    sources: [REF, ME],
  },
  /* ==================== ПРОМЫШЛЕННОСТЬ ==================== */
  {
    id: "galvanic",
    group: "heavy",
    name: L("Гальваника / металлопокрытия", "Galvanika / metall qoplamalar", "Electroplating / metal finishing", "电镀 / 金属表面处理"),
    flowHint: L("0,2–2 м³ на 1 м² покрытия", "1 m² qoplamaga 0,2–2 m³", "0.2–2 m³ per m² of plated surface", "每 m² 镀层 0.2–2 m³"),
    pollutants: { cod: [100, 400], ss: [50, 300], petro: [5, 30], surf: [5, 30] },
    ph: [2.0, 12.0],
    special: [
      { label: "Хром Cr⁶⁺", range: [5, 100], unit: "мг/л", note: `Хромовые стоки отдельно: восстановление Cr⁶⁺→Cr³⁺ бисульфитом натрия при pH 2,5–3 (${kmkRef("6.284")}), затем осаждение.` },
      { label: "Никель / цинк / медь", range: [10, 150], unit: "мг/л", note: "Осаждение гидроксидов при pH 9–10,5, каждый металл имеет свой оптимум." },
      { label: "Циансодержащие стоки", range: [5, 50], unit: "мг/л", note: "Строго отдельная линия: окисление гипохлоритом в щелочной среде до смешения." },
    ],
    chain: ["avg", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "Биологической очистки НЕТ — сток минеральный. Схема реагентная: три раздельные линии (хромовая, циансодержащая, кислото-щелочная) → реагентная обработка → осветление → фильтрация → ионообмен при требовании глубокой доочистки.",
      "SUVSANOAT производит для этой схемы ёмкостной парк: усреднители, реакторы-нейтрализаторы, отстойники с тонкослойными модулями, станции дозирования реагентов и резервуары; насосы-дозаторы и КИП — комплектация.",
      "Гальваношламы — отход 2–3 класса: отдельное обезвоживание и паспортизация.",
    ],
    sources: [REF, ME, "ВНТП гальванических производств"],
  },
  {
    id: "machinery",
    group: "heavy",
    name: L("Машиностроение / металлообработка", "Mashinasozlik / metallga ishlov berish", "Machine building / metalworking", "机械制造 / 金属加工"),
    flowHint: L("по паспортам участков; мойка деталей 0,5–3 м³/ч на линию", "uchastka pasportlari bo‘yicha; detallarni yuvish liniyaga 0,5–3 m³/soat", "per equipment data sheets; parts washing 0.5–3 m³/h per line", "按工段设备资料；零件清洗每线 0.5–3 m³/h"),
    pollutants: { cod: [300, 1500], bod: [100, 400], ss: [200, 800], petro: [50, 500], surf: [20, 100] },
    ph: [6.0, 10.0],
    special: [{ label: "Отработанные СОЖ (по ХПК)", range: [30000, 100000], unit: "мгО/л", note: "Эмульсии СОЖ не сбрасываются в общий сток: локальное разложение (реагентное/ультрафильтрация) отдельной установкой." }],
    chain: ["avg", "oil", "physchem", "daf", "bio", "clarify", "post", "sludge"],
    notes: [
      "Два принципиально разных потока: замасленные стоки мойки (нефтеуловитель + флотация) и отработанные СОЖ (только локальная установка разложения эмульсий).",
      "После снятия нефтепродуктов до 25 мг/л остаточная органика добивается компактной биологией.",
    ],
    sources: [REF, ME],
  },
  {
    id: "concrete",
    group: "heavy",
    name: L("Бетонный узел / цемент / ЖБИ", "Beton uzeli / sement / temir-beton", "Concrete plant / cement / precast", "混凝土搅拌站 / 水泥 / 预制构件"),
    flowHint: L("0,3–1 м³ на 1 м³ бетона (мойка миксеров)", "1 m³ betonga 0,3–1 m³ (mikserlarni yuvish)", "0.3–1 m³ per m³ of concrete (mixer washing)", "每 m³ 混凝土 0.3–1 m³（洗罐车）"),
    pollutants: { ss: [2000, 15000], petro: [5, 50] },
    ph: [11.0, 13.0],
    chain: ["sand", "avg", "neutral", "clarify", "post"],
    notes: [
      "Сток минеральный: цементное молоко даёт экстремальную взвесь и pH до 13. Схема: осаждение в двухсекционном отстойнике-шламонакопителе → нейтрализация CO₂ или кислотой → осветлённая вода в оборот на мойку миксеров.",
      "Оборот воды здесь стандарт отрасли — свежая вода только на подпитку.",
    ],
    sources: [REF],
  },
  {
    id: "chemical",
    group: "heavy",
    name: L("Химия / бытовая химия / косметика", "Kimyo / maishiy kimyo / kosmetika", "Chemicals / household chemistry / cosmetics", "化工 / 日化 / 化妆品"),
    flowHint: L("1–5 м³ на 1 т продукции", "1 t mahsulotga 1–5 m³", "1–5 m³ per tonne of product", "每吨产品 1–5 m³"),
    pollutants: { cod: [1000, 5000], bod: [300, 1500], ss: [100, 500], surf: [100, 500], tp: [20, 80] },
    ph: [4.0, 11.0],
    chain: ["avg", "neutral", "physchem", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Соотношение БПК/ХПК ниже 0,3 — часть органики биорезистентна: реагентная ступень и флотация до биологии, при жёстких требованиях — сорбционная доочистка углём.",
      "Проектирование только по лабораторному анализу: состав определяется рецептурами конкретного производства.",
    ],
    sources: [ME, REF],
  },
  {
    id: "mining",
    group: "heavy",
    name: L("Горнодобыча / обогащение / карьер", "Kon qazish / boyitish / karer", "Mining / ore dressing / quarry", "采矿 / 选矿 / 采石场"),
    flowHint: L("карьерный водоотлив — по гидрогеологии", "karyer suv chiqarish — gidrogeologiya bo‘yicha", "quarry dewatering — per hydrogeology", "采坑排水——按水文地质确定"),
    pollutants: { ss: [500, 10000], petro: [5, 50] },
    ph: [3.0, 9.0],
    special: [{ label: "Тяжёлые металлы (Fe, Mn, Cu, Zn)", range: [5, 200], unit: "мг/л", note: "Состав зависит от месторождения; кислые воды — известкование до pH 9–10 с осаждением гидроксидов." }],
    chain: ["avg", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "Большие расходы и минеральный состав: пруды-отстойники или радиальные отстойники, реагентное осаждение металлов, осветлённая вода — в оборот обогатительной фабрики.",
      "SUVSANOAT поставляет ёмкостной парк, реагентные станции и тонкослойные модули; расчёт — строго по анализу воды месторождения.",
    ],
    sources: [REF, ME],
  },
  {
    id: "glass",
    group: "heavy",
    name: L("Стекло / керамика / камнеобработка", "Shisha / keramika / toshga ishlov berish", "Glass / ceramics / stone processing", "玻璃 / 陶瓷 / 石材加工"),
    flowHint: L("0,5–3 м³/ч на станок резки/шлифовки", "kesish/silliqlash dastgohiga 0,5–3 m³/soat", "0.5–3 m³/h per cutting or grinding machine", "每台切割/研磨设备 0.5–3 m³/h"),
    pollutants: { ss: [1000, 8000], petro: [5, 30] },
    ph: [6.5, 9.5],
    chain: ["avg", "physchem", "clarify", "post"],
    notes: [
      "Тонкодисперсная минеральная взвесь (шлам резки) сама не осаждается: коагулянт + флокулянт, тонкослойный отстойник, вода в оборот на станки.",
    ],
    sources: [REF],
  },
  {
    id: "woodwork",
    group: "heavy",
    name: L("Деревообработка / мебель", "Yog‘ochga ishlov berish / mebel", "Woodworking / furniture", "木材加工 / 家具"),
    flowHint: L("0,5–2 м³/смену на покрасочную камеру", "bo‘yash kamerasiga smenasiga 0,5–2 m³", "0.5–2 m³ per shift per paint booth", "每喷漆室每班 0.5–2 m³"),
    pollutants: { cod: [500, 2500], bod: [150, 800], ss: [200, 1000], petro: [10, 80], surf: [10, 50] },
    ph: [6.0, 9.0],
    chain: ["avg", "physchem", "bio", "clarify", "post", "sludge"],
    notes: [
      "Основной сток — гидрофильтры покрасочных камер: лакокрасочная взвесь снимается коагуляцией, вода в оборот на орошение гидрофильтра.",
    ],
    sources: [REF],
  },
  {
    id: "printing",
    group: "heavy",
    name: L("Типография / упаковка", "Bosmaxona / qadoqlash", "Printing house / packaging", "印刷 / 包装"),
    flowHint: L("0,5–3 м³/смену", "smenasiga 0,5–3 m³", "0.5–3 m³ per shift", "每班 0.5–3 m³"),
    pollutants: { cod: [800, 3000], bod: [200, 800], ss: [100, 500], petro: [10, 60], surf: [20, 80] },
    ph: [6.0, 10.0],
    chain: ["avg", "physchem", "bio", "clarify", "post", "sludge"],
    notes: [
      "Краски и смывочные растворы биорезистентны: реагентная обработка до биологии; отработанные растворители в сток не сбрасываются — сбор и утилизация.",
    ],
    sources: [REF],
  },

  /* ====================== ОБЪЕКТ НЕ ИЗ СПРАВОЧНИКА ====================== */
  /*
   * Позиция вне групп справочника: в списки групп не попадает,
   * выбирается отдельной кнопкой на шаге исходных данных.
   * Отраслевых концентраций у неё нет и быть не может — состав стока
   * задаёт проектировщик. Единственные нормативные числа здесь —
   * границы pH на входе в биологическую очистку по п. 6.2.
   */
{
    id: "fruitveg-concentrate",
    group: "food",
    name: L(
      "Плодоовощной перерабатывающий завод (томатная паста, пюре, концентраты соков)",
      "Meva-sabzavotni qayta ishlash zavodi (tomat pastasi, pyure, sharbat konsentratlari)",
      "Fruit and vegetable processing plant (tomato paste, purees, juice concentrates)",
      "果蔬深加工厂（番茄酱、果泥、浓缩汁）"
    ),
    flowHint: L(
      "4–10 м³ на 1 т сырья",
      "1 t xom ashyoga 4–10 m³",
      "4–10 m³ per tonne of raw material",
      "每吨原料 4–10 m³"
    ),
    pollutants: { cod: [1500, 6000], bod: [800, 3500], ss: [800, 4000], tn: [20, 80], tp: [5, 25] },
    ph: [4.0, 12.0],
    special: [
      {
        label: "Отработанный щёлок паровой/каустической очистки томата (NaOH)",
        range: [10, 30],
        unit: "г/л NaOH",
        note: "Ванны каустической очистки сбрасываются раз в смену с pH 12–13. Их собирают в отдельный приямок и подают в нейтрализатор дозированно (не более 5–10 % часового притока), иначе один сброс выводит pH всей нитки за 6,5–8,5 и убивает нитрификацию.",
      },
    ],
    chain: ["screen", "sand", "avg", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Мойка корнеплодов и томата даёт грунт и песок в количестве, нехарактерном для пищёвки: взвешенные до 4000 мг/л, из них до половины — минеральная фракция. Песколовка ставится ДО усреднителя и рассчитывается на пиковый сезонный расход, иначе усреднитель заиливается за 2–3 недели сезона.",
      "Сезон август–октябрь: 60–80 % годовой нагрузки приходится на 60–90 суток. В межсезонье активный ил деградирует без субстрата — биология проектируется либо на подпитку хозбытовым стоком площадки, либо на прикреплённой биоплёнке (носитель переносит простой лучше взвешенного ила и выходит на режим за 2–3 недели вместо 1,5–2 месяцев).",
      "Диапазон ХПК широкий, потому что зависит от передела: мойка и транспортёрная вода дают 800–1500 мгО/л, а конденсаты выпарки и промывка линий пюре — 5000–6000 мгО/л. Для расчёта нужен раздельный замер по потокам, а не общая проба на выпуске.",
      "Кислые конденсаты выпарки (pH 4–5) и щелочные ванны каустической очистки (pH 12–13) сбрасываются в разное время смены — усреднитель на 8–12 часов притока плюс нейтрализация с двусторонним дозированием (кислота и щёлочь) обязательны; на одной щёлочи узел не собирается.",
    ],
    sources: [
      REF,
      ME,
      "IFC / World Bank Group, EHS Guidelines for Fruit and Vegetable Processing",
      "ВНТП плодоовощной консервной промышленности",
    ],
  },
  {
    id: "driedfruit",
    group: "food",
    name: L(
      "Сушка фруктов и овощей с серной обработкой",
      "Meva va sabzavotlarni oltingugurt bilan ishlov berib quritish",
      "Fruit and vegetable drying with sulphur treatment",
      "果蔬干制（含硫处理）"
    ),
    flowHint: L(
      "3–8 м³ на 1 т сырья",
      "1 t xom ashyoga 3–8 m³",
      "3–8 m³ per tonne of raw material",
      "每吨原料 3–8 m³"
    ),
    pollutants: { cod: [1500, 5000], bod: [900, 3000], ss: [500, 2500], tn: [15, 50], tp: [3, 15] },
    ph: [3.5, 6.5],
    special: [
      {
        label: "Сульфиты и бисульфиты (в пересчёте на SO₃²⁻)",
        range: [100, 1500],
        unit: "мг/л",
        note: "Смывы после окуривания серой и сульфитационных ванн. Сульфит окисляется до сульфата по стехиометрии SO₃²⁻ + ½O₂ → SO₄²⁻, то есть 1 г сульфита связывает 0,2 г кислорода: 1000 мг/л SO₃²⁻ добавляют к потребности в кислороде 200 мгО/л, минуя биологию, и обнуляют растворённый кислород в аэротенке. Поток собирается отдельно и окисляется (аэрация или дозирование пероксида/гипохлорита) до смешения. Диапазон ориентировочный — обязателен анализ конкретного цеха.",
      },
    ],
    chain: ["screen", "sand", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Сульфиты — главный параметр, а не ХПК. Они одновременно токсичны для ила и химически связывают кислород. Ступень physchem здесь работает не на коагуляцию, а на окисление сульфитов; контроль ведут по остаточному сульфиту на входе в аэротенк (не выше 10–20 мг/л), а не по ХПК.",
      "pH сульфитированных смывов 3,5–4,5. Подкисление и сульфиты бьют вместе: при pH ниже 4 из бисульфита выделяется газообразный SO₂ — усреднитель и приямок сульфитного потока нужны закрытые, с отводом газа, это требование по технике безопасности, а не по технологии.",
      "Отрасль сезонная и экспортная: пик на сборе абрикоса, винограда и яблока, вне сезона расход падает в 5–10 раз. Биология проектируется на прикреплённой биоплёнке с возможностью работы на 20–30 % нагрузки.",
      `Грунт от мойки сырья даёт до 2500 мг/л взвешенных с высокой зольностью — песколовка до усреднителя; сахара от мойки и бланширования дают легкоокисляемый ХПК, поэтому при недостатке азота ил вспухает — соотношение БПКполн:N:P = 100:${BIO_INLET_LIMITS.nPer100Bod}:${BIO_INLET_LIMITS.pPer100Bod} (${BIO_INLET_LIMITS.ref}) контролируется, при дефиците дозируется карбамид.`,
    ],
    sources: [
      REF,
      ME,
      "IFC / World Bank Group, EHS Guidelines for Fruit and Vegetable Processing (сульфитирование и сернистые стоки)",
      "ВНТП плодоовощной консервной промышленности",
    ],
  },
  {
    id: "flourmill",
    group: "food",
    name: L(
      "Мукомольный комбинат / хлебозавод / макаронная фабрика",
      "Un kombinati / non zavodi / makaron fabrikasi",
      "Flour mill / bakery / pasta factory",
      "面粉厂 / 面包厂 / 面食厂"
    ),
    flowHint: L(
      "0,3–1,5 м³ на 1 т продукции",
      "1 t mahsulotga 0,3–1,5 m³",
      "0.3–1.5 m³ per tonne of product",
      "每吨产品 0.3–1.5 m³"
    ),
    pollutants: { cod: [600, 2500], bod: [300, 1500], ss: [200, 900], fats: [50, 300], tn: [10, 40], tp: [3, 15] },
    ph: [5.0, 9.0],
    chain: ["screen", "avg", "grease", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Объект малый: производственный сток — это почти целиком мойка тестомесов, форм и полов, и его часто меньше, чем хозбытового стока предприятия. Считать надо суммарный поток, иначе биология получается завышенной вдвое.",
      "Крахмал и клейковина закисают в накопителе за 4–6 часов: в усреднителе обязательна аэрация или перемешивание, иначе на входе в биологию получают pH 4,5–5 и запах. Усреднитель без перемешивания здесь — типовая проектная ошибка.",
      "Легкоокисляемые углеводы при дефиците азота дают нитчатое вспухание ила: соотношение БПКполн:N:P контролируется, при дефиците дозируется карбамид; иловый индекс держат ниже 150 см³/г.",
      "Жиры (50–300 мг/л) идут только с кремово-кондитерских и сдобных линий. Если таких линий нет — жироуловитель из схемы исключается, и это заметная экономия для объекта такого размера.",
    ],
    sources: [REF, ME],
  },
  {
    id: "oilextraction",
    group: "food",
    name: L(
      "Маслоэкстракционный завод (хлопковое и подсолнечное масло, рафинация)",
      "Yog‘ ekstraksiya zavodi (paxta va kungaboqar yog‘i, rafinatsiya)",
      "Oilseed extraction and refining plant (cottonseed and sunflower oil)",
      "油脂浸出与精炼厂（棉籽油、葵花籽油）"
    ),
    flowHint: L(
      "1,5–4 м³ на 1 т маслосемян",
      "1 t moyli urug‘ga 1,5–4 m³",
      "1.5–4 m³ per tonne of oilseed",
      "每吨油料 1.5–4 m³"
    ),
    pollutants: { cod: [3000, 15000], bod: [1500, 6000], ss: [300, 1500], fats: [1000, 5000], surf: [10, 60] },
    ph: [4.0, 12.0],
    special: [
      {
        label: "Соапсток и кислые воды расщепления (по ХПК)",
        range: [30000, 100000],
        unit: "мгО/л",
        note: "Соапсток нейтрализации и кислая вода расщепления серной кислотой на очистные не сбрасываются: соапсток — товарный продукт (жирные кислоты для мыла, кормов, лакокрасочных), кислая вода собирается отдельно и нейтрализуется локально. 1 м³ соапстока по нагрузке равен 10–30 м³ обычного стока завода.",
      },
    ],
    chain: ["screen", "avg", "grease", "daf", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Отличие от позиции «Масложировой комбинат» (oilfat): та карточка — про фасовку, маргариновое и мыловаренное производство с преобладанием жиров в стоке. Здесь передел другой: форпрессование и экстракция гексаном плюс полный цикл рафинации (гидратация, щелочная нейтрализация, отбелка, дезодорация), поэтому определяющими становятся щелочные промывные воды (pH 10–12) и залповые кислые потоки, а не только жиры.",
      "Промывные воды после щелочной нейтрализации масла идут с pH 10–12 и мылами: жироуловитель на них не работает — мыло стабилизирует эмульсию. Схема двухступенчатая: гравитационное жироулавливание на общем потоке, затем подкисление промывных вод до pH 4–5 (разрушение мыла, всплытие жирных кислот) и напорная флотация с коагулянтом. Только после этого поток объединяют и нейтрализуют до 6,5–8,5 перед биологией.",
      "Хлопковое направление: госсипол фитотоксичен и угнетает активный ил, а вместе с полифенолами шрота даёт трудноокисляемую фракцию — БПК/ХПК падает до 0,35–0,45 против 0,55–0,6 на подсолнечнике. Биологический блок на хлопке считают с запасом по возрасту ила и предусматривают сорбционную доочистку.",
      "Гексан экстракции попадает в сток со сточными водами дистилляции и вакуум-насосов в следовых количествах, но это ЛВЖ: закрытый усреднитель с отводом паровоздушной смеси и запрет на открытые каналы в зоне экстракционного цеха. Надёжного справочного диапазона по остаточному гексану в стоке нет — параметр в расчёт не вводится, задаётся замером.",
      "Отраслевой контекст: в Узбекистане свыше 240 масложировых предприятий, переработка более 4,39 млн т маслосемян в год, из них 3,59 млн т — хлопчатник. Типовое решение под этот парк — блочная ЛОС с двухступенчатым жироулавливанием.",
    ],
    sources: [
      REF,
      ME,
      "IFC / World Bank Group, EHS Guidelines for Vegetable Oil Processing (2015): нормы сброса pH 6–9, БПК₅ 50, ХПК 250, жиры 10 мг/л; соапсток и кислые воды расщепления",
      "ВНТП масложировой промышленности",
    ],
  },
  {
    id: "sugar",
    group: "food",
    name: L(
      "Сахарный завод",
      "Shakar zavodi",
      "Sugar plant",
      "制糖厂"
    ),
    flowHint: L(
      "4–8 м³ на 1 т свёклы (с оборотом транспортёрно-моечной воды — 0,8–1,5 м³)",
      "1 t qand lavlagiga 4–8 m³ (transportyor-yuvish suvi aylanmasi bilan — 0,8–1,5 m³)",
      "4–8 m³ per tonne of beet (0.8–1.5 m³ with flume water recirculation)",
      "每吨甜菜 4–8 m³（输送洗涤水回用时为 0.8–1.5 m³）"
    ),
    pollutants: { cod: [800, 5000], bod: [400, 3000], ss: [1000, 8000], tn: [10, 60], tp: [3, 20] },
    ph: [6.0, 11.0],
    special: [
      {
        label: "Жомопрессовая и диффузионная вода (по ХПК)",
        range: [8000, 20000],
        unit: "мгО/л",
        note: "Экстремально концентрированный поток: на очистные не подаётся — возвращается в диффузию или идёт на жомосушку. При сбросе в общий сток удваивает нагрузку на биологию.",
      },
      {
        label: "Известково-сатурационный шлам (фильтрационный осадок)",
        range: [20000, 60000],
        unit: "мг/л по взвешенным",
        note: "Шлам с pH 11–12 и высоким кальцием отводится в шламонакопитель, а не в очистные: карбонат кальция цементирует трубопроводы и лопасти мешалок, а известковая щёлочь выводит pH из рабочего диапазона биологии.",
      },
    ],
    chain: ["screen", "sand", "avg", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Диапазон взвешенных широкий, потому что определяется переделом: транспортёрно-моечная вода даёт 3000–8000 мг/л (земля, ботва, хвостики), а конденсаты и мойка оборудования — 200–500 мг/л. Расчёт ведут по раздельным замерам; общая проба на выпуске здесь не показательна.",
      "Транспортёрно-моечная вода — замкнутый контур: отстойники-грязеотстойники и грязеловушки с возвратом осветлённой воды на гидротранспорт. Разомкнуть контур и подать 3000–8000 мг/л взвеси на очистные технически можно, но объём песколовок и первичных отстойников вырастает в 5–8 раз — это не проектируется.",
      "Сезон переработки свёклы 3–4 месяца в году. Биологию рассчитывают на сезонный пик и предусматривают консервацию ила либо переход на подпитку хозбытовым стоком в межсезонье; иначе к следующему сезону ил приходится наращивать заново 1,5–2 месяца.",
      "СП «Хоразм шакар» в Хорезме и часть мощностей работают на импортном сахаре-сырце. На сырце транспортёрно-моечных вод нет вообще: сток сводится к конденсатам, мойке оборудования, продувкам котлов и хозбыту, взвешенные падают до 200–500 мг/л, а определяющим становится ХПК от потерь сахара. Схема упрощается — песколовка и грязеотстойники не нужны.",
    ],
    sources: [
      REF,
      ME,
      "IFC / World Bank Group, EHS Guidelines for Sugar Manufacturing",
      "ВНТП сахарной промышленности",
    ],
  },
  {
    id: "distillery",
    group: "food",
    name: L(
      "Спиртзавод / ликёро-водочный завод",
      "Spirt zavodi / likyor-aroq zavodi",
      "Distillery / spirits plant",
      "酒精厂 / 白酒厂"
    ),
    flowHint: L(
      "3–8 м³ стока на 1 м³ спирта (без барды; барды дополнительно 10–13 м³ на 1 м³ спирта)",
      "1 m³ spirtga 3–8 m³ oqova (bardasiz; barda qo‘shimcha 1 m³ spirtga 10–13 m³)",
      "3–8 m³ of wastewater per m³ of alcohol (excluding stillage; stillage adds 10–13 m³ per m³)",
      "每 m³ 酒精 3–8 m³ 污水（不含酒糟液；酒糟液另计 10–13 m³）"
    ),
    pollutants: { cod: [2000, 10000], bod: [1000, 5000], ss: [200, 1500], tn: [50, 300], tp: [10, 80] },
    ph: [3.5, 9.0],
    special: [
      {
        label: "Послеспиртовая барда (по ХПК)",
        range: [30000, 90000],
        unit: "мгО/л",
        note: "Барда на очистные не сбрасывается: азот в ней 1500–4000 мг/л, фосфор до 1000 мг/л, pH 3,5–4,5, температура на выходе 70–80 °C. Штатное решение — сгущение и сушка на кормовую DDGS либо анаэробная переработка с получением биогаза. Сброс 1 м³ барды по нагрузке равен 10–30 м³ обычного стока завода.",
      },
    ],
    chain: ["screen", "avg", "neutral", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "В перечне ступеней справочника (StageKey) АНАЭРОБНОЙ ступени НЕТ — ближайшая принятая в цепочке ступень «bio» описывает только аэротенк (MBBR/SBR). Для этой отрасли этого недостаточно: при ХПК выше 5000–6000 мгО/л одна аэробная схема не тянет ни по кислороду, ни по приросту ила. Проектное решение — анаэробный реактор UASB (или EGSB) ПЕРЕД аэротенком: он снимает 75–90 % ХПК, даёт биогаз и в 8–10 раз меньше избыточного ила; аэробная ступень после него работает как доочистка. Эту ступень нужно вносить в схему отдельной позицией вручную.",
      "Кислород лимитирует напрямую: на 1 кг снятого БПК аэротенку нужно около 1 кг O₂, то есть при ХПК 8000 и расходе 300 м³/сут требуемая производительность воздуходувок выходит за рамки типовых блочных ЛОС. Это второй аргумент за анаэробную первую ступень, помимо ила.",
      "Азот и фосфор в избытке (в отличие от пивзавода и хлебозавода, где их не хватает): соотношение БПК:N:P на входе может быть 100:8:2 вместо расчётного 100:5:1. Дозировать биогены не нужно, а вот нитри-денитрификация при сбросе в водоём обязательна, и объём аэротенка растёт в 1,5–2 раза за счёт аноксидной зоны.",
      "Кислые промывки бродильных чанов и щелочные CIP-мойки идут залпами: усреднитель не менее чем на 8–12 часов притока плюс нейтрализация с двусторонним дозированием. Диапазон ХПК широкий именно из-за передела — промывка бражных колонн и лютерная вода дают 6000–10000 мгО/л, мойка тары и полов на ликёро-водочном участке — 500–2000 мгО/л.",
    ],
    sources: [
      REF,
      ME,
      "Обзорные данные по барде (stillage/spent wash): ХПК 17–90 г/л, азот 1,7–4,2 г/л, фосфор 0,2–3,0 г/л, pH 3,0–4,2",
      "ВНТП спиртовой и ликёро-водочной промышленности",
    ],
  },
  {
    id: "winery",
    group: "food",
    name: L(
      "Винзавод / коньячное производство",
      "Vino zavodi / konyak ishlab chiqarish",
      "Winery / brandy production",
      "葡萄酒厂 / 白兰地厂"
    ),
    flowHint: L(
      "1,5–4 м³ на 1000 л вина",
      "1000 l vinoga 1,5–4 m³",
      "1.5–4 m³ per 1000 L of wine",
      "每千升葡萄酒 1.5–4 m³"
    ),
    pollutants: { cod: [2000, 20000], bod: [1000, 10000], ss: [200, 2500], tn: [20, 150], tp: [5, 50] },
    ph: [3.0, 6.0],
    special: [
      {
        label: "Полифенолы (танины, антоцианы)",
        range: [20, 500],
        unit: "мг/л",
        note: "Красные вина: полифенолы биорезистентны и в высоких концентрациях угнетают ил, а также дают устойчивую окраску, которую биология не снимает. Удаляются коагуляцией до биологии; при жёстких требованиях на цветность — сорбционная доочистка.",
      },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Самый кислый сток пищевой отрасли: pH 3–4,5 за счёт винной, яблочной и уксусной кислот. Нейтрализация — первый обязательный узел, причём двусторонняя: щелочные CIP-мойки ёмкостей выбрасывают pH до 10–11, и станция дозирования должна уметь работать в обе стороны.",
      "Разброс ХПК в отрасли рекордный — от 340 мгО/л (промывка полов вне сезона) до десятков тысяч (сброс осадка после переливки и промывка бочек). Диапазон 2000–20000 отражает передел, а не неопределённость: сужать его без раздельных замеров по потокам нельзя, а расчёт вести на усреднённую суточную пробу пикового сезона.",
      "Пик сентябрь–октябрь (переработка винограда): 50–70 % годовой нагрузки за 30–45 суток, остальное время — промывки и разлив на порядок слабее. Биология проектируется на прикреплённой биоплёнке или с двумя параллельными нитками, одна из которых консервируется в межсезонье.",
      "Кизельгур (диатомит) от фильтрации и калиево-виннокислые осадки (винный камень) выпадают залпами и абразивны: перед усреднителем нужен отстойник-шламоприёмник или мешочный фильтр на линии промывки фильтров, иначе диатомит истирает рабочие колёса насосов и цементирует дно усреднителя. Кальциево-калиевые тартраты дополнительно дают накипь на теплообменниках и мембранах доочистки.",
    ],
    sources: [
      REF,
      ME,
      "Обзоры характеристик винодельческих стоков (COD от 340 мгО/л до десятков тысяч, среднее ~11 500 мгО/л; pH 3–5; TSS до 2500 мг/л; TN 100–640 мг/л)",
      "ВНТП винодельческой промышленности",
    ],
  },
  {
    id: "feedmill",
    group: "food",
    name: L(
      "Комбикормовый завод",
      "Aralash yem zavodi",
      "Compound feed mill",
      "配合饲料厂"
    ),
    flowHint: L(
      "0,2–1 м³ на 1 т комбикорма",
      "1 t aralash yemga 0,2–1 m³",
      "0.2–1 m³ per tonne of compound feed",
      "每吨配合饲料 0.2–1 m³"
    ),
    pollutants: { cod: [500, 2000], bod: [250, 1000], ss: [200, 1000], fats: [50, 400], tn: [10, 50], tp: [3, 15] },
    ph: [6.0, 9.0],
    chain: ["screen", "avg", "grease", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Сток лёгкий по концентрациям, но с очень неровным графиком: технология сухая, вода идёт только на мойку смесителей, пресс-грануляторов и полов — это 2–4 залповых сброса за смену по 15–30 минут. Усреднитель на 6–8 часов притока обязателен: без него ЛОС считается на пиковый расход и получается втрое дороже нужного.",
      "Расход производственного стока часто меньше хозбытового: при 100–150 работниках хозбыт даёт 15–25 м³/сут против 5–15 м³/сут от мойки. Схему собирают на суммарный поток, ориентируясь на хозбытовые концентрации как на базу.",
      "Ввод жира в рецептуру (обычно 2–5 % по массе) даёт в смывах 50–400 мг/л жиров — жироуловитель ставится на линию мойки жирового участка и напылительных форсунок, а не на общий сток: так объём аппарата в 3–5 раз меньше.",
      "Белковая и витаминно-минеральная пыль легко окисляется и даёт быстрое закисание в накопителе — усреднитель с аэрацией или перемешиванием; при недостатке азота в смывах контролируется соотношение БПКполн:N:P. Отраслевой контекст: госпрограмма развития животноводства выводит мощности кормопроизводства до 3,3 млн т при инвестициях около 900 млн долл. США — типовая мощность объекта под ЛОС растёт.",
    ],
    sources: [REF, ME, "ВНТП комбикормовых предприятий"],
  },
  {
    id: "emulsified-food",
    group: "food",
    name: L(
      "Производство мороженого, майонеза, соусов и полуфабрикатов",
      "Muzqaymoq, mayonez, souslar va yarim tayyor mahsulotlar ishlab chiqarish",
      "Ice cream, mayonnaise, sauces and ready-meal production",
      "冰淇淋、蛋黄酱、酱料及半成品生产"
    ),
    flowHint: L(
      "3–8 м³ на 1 т продукции",
      "1 t mahsulotga 3–8 m³",
      "3–8 m³ per tonne of product",
      "每吨产品 3–8 m³"
    ),
    pollutants: { cod: [3000, 12000], bod: [1500, 6000], ss: [300, 1500], fats: [500, 3000], tn: [30, 120], tp: [10, 40], surf: [20, 100] },
    ph: [3.5, 11.0],
    chain: ["screen", "avg", "grease", "neutral", "physchem", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Жиры здесь эмульгированы технологически — лецитином, яичным желтком, моно- и диглицеридами, гомогенизацией под давлением. Обычный гравитационный жироуловитель снимает с такой эмульсии 10–20 % вместо проектных 70–80 %: капля не всплывает, эмульсия устойчива сутками. Рабочая схема — деэмульгирование (подкисление до pH 4–5 либо коагулянт на солях железа/алюминия) и напорная флотация; жироуловитель остаётся только как ловушка свободного жира и защита насосов.",
      "Диапазон жиров 500–3000 мг/л определяется продуктом: линия мороженого даёт 500–1000 мг/л, майонезная и соусная — 1500–3000 мг/л (жирность продукта 50–70 %). Считать по средней цифре нельзя — если на площадке есть майонезная линия, расчёт флотации ведут по её пику.",
      "pH прыгает в обе стороны за смену: уксус и лимонная кислота майонезных линий дают 3,5–4,5, щелочная CIP-мойка — 10–11. Нейтрализация с двусторонним дозированием ставится после жироуловителя, но ДО флотации: доза коагулянта работает только в своём диапазоне pH (сульфат алюминия 6–7,5, хлорид железа 4–6).",
      "CIP с хлорсодержащими средствами: залповый сброс активного хлора убивает ил и снимается только усреднением. Усреднитель не менее чем на 8–12 часов притока, а при регулярной дезинфекции линий — контроль остаточного хлора на входе в аэротенк (не выше 0,3–0,5 мг/л) с дехлорированием тиосульфатом при превышении. Объекты обычно малые (цеха в промзонах), поэтому решение — компактная блочная ЛОС с флотацией, а не капитальные сооружения.",
    ],
    sources: [REF, ME, "ВНТП 645/1618-92 (молочная промышленность) — для линий мороженого", "IFC / World Bank Group, EHS Guidelines for Food and Beverage Processing"],
  },
/* ============ ДОПОЛНЕНИЕ: ТЕКСТИЛЬ (5) И КОММУНАЛКА (7) ============ */

  {
    id: "denim",
    group: "textile",
    name: L(
      "Джинсовая фабрика / промышленная стирка денима",
      "Jinsi fabrikasi / denimni sanoat yuvish",
      "Denim mill / industrial denim laundry",
      "牛仔布厂 / 牛仔成衣水洗"
    ),
    flowHint: L(
      "60–120 л на 1 изделие (stone wash, enzyme wash); 120–250 м³ на 1 т денима",
      "1 buyumga 60–120 l (stone wash, enzyme wash); 1 t denimga 120–250 m³",
      "60–120 L per garment (stone / enzyme wash); 120–250 m³ per tonne of denim",
      "每件 60–120 L（石磨洗、酶洗）；每吨牛仔布 120–250 m³"
    ),
    pollutants: { cod: [800, 2500], bod: [200, 700], ss: [300, 1500], surf: [20, 100], tn: [10, 40], tp: [3, 15] },
    ph: [8.0, 12.0],
    special: [
      {
        label: "Цветность (индиго)",
        range: [500, 3000],
        unit: "град. ПКШ",
        note: "Индиго — дисперсный кубовый краситель, биологически практически не разлагается: цветность снимается только коагуляцией/сорбцией ДО биологии, после аэротенка вода остаётся синей.",
      },
      {
        label: "Активный хлор (гипохлорит от отбеливания)",
        range: [5, 50],
        unit: "мг/л",
        note: "Залп гипохлорита и перманганата от отбелки убивает активный ил: линия отбелки собирается отдельно, остаточный окислитель гасится бисульфитом натрия до 0,3 мг/л перед подачей в биологию.",
      },
      {
        label: "Солесодержание (TDS)",
        range: [1500, 6000],
        unit: "мг/л",
        note: "Сульфат и хлорид натрия из красильных и промывных ванн; при TDS выше 5 г/л ил адаптируется только при плавном усреднении, залповый сброс рассола недопустим.",
      },
    ],
    chain: ["screen", "sand", "avg", "neutral", "physchem", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Самый водоёмкий передел текстиля: 60–120 л на одно изделие против 15–30 л на обычной отделке. Расход считается по числу изделий в смену, а не по массе ткани — усреднитель принимается не менее чем на 8 часов притока.",
      "Пемзовая крошка от stone wash — абразивный минеральный шлам: песколовка и приямок с абразивостойкими насосами ставятся ДО усреднителя, иначе рабочие колёса и уплотнения выходят из строя за 2–3 месяца. Барабанные фильтры пемзу не держат.",
      "Соотношение БПК/ХПК низкое (0,2–0,3), индиго не биоразлагается: реагентная ступень с обесцвечиванием и флотация стоят ДО биологии. Отдельной ступени «обесцвечивание/окисление» в перечне справочника нет — на практике это дозирование Fe(II)/полиалюминия с последующей флотацией, при жёстких требованиях по цветности добавляется озонирование или сорбция на активированном угле в блоке доочистки.",
      "Ферменты (целлюлазы) и ПАВ дают устойчивую пену в аэротенке; при вводе ферментной линии в усреднитель предусматривается пеногашение и запас по высоте борта не менее 0,5 м.",
    ],
    sources: [
      REF,
      ME,
      "Degrémont/SUEZ Water Treatment Handbook, разд. «Текстильная промышленность» (ХПК 250–1500 мг/л, цветность 500–2000 ПКШ, pH 4–12 для смешанного текстильного стока)",
      "IFC/World Bank EHS Guidelines for Textiles Manufacturing",
      "Quantifying Environmental Sustainability of Denim Garments Washing Factories (MMU, 2020) — взвешенные 350–620 мг/л, TDS 1150–4700 мг/л на пяти фабриках",
    ],
  },
  {
    id: "textile-finish",
    group: "textile",
    name: L(
      "Красильно-отделочная фабрика (мерсеризация, отбеливание, аппретирование)",
      "Bo‘yash-pardozlash fabrikasi (merserizatsiya, oqartirish, appretlash)",
      "Dyeing and finishing mill (mercerising, bleaching, finishing)",
      "染整厂（丝光、漂白、后整理）"
    ),
    flowHint: L(
      "80–200 м³ на 1 т ткани (полный мокрый цикл с расшлихтовкой)",
      "1 t matoga 80–200 m³ (shlixtani yuvish bilan to‘liq ho‘l tsikl)",
      "80–200 m³ per tonne of fabric (full wet cycle including desizing)",
      "每吨织物 80–200 m³（含退浆的完整湿加工）"
    ),
    pollutants: { cod: [1000, 3000], bod: [250, 900], ss: [100, 500], surf: [20, 100], tn: [10, 40], tp: [3, 15] },
    ph: [9.0, 13.0],
    special: [
      {
        label: "Шлихта и ПВС (по ХПК концентрированной ванны расшлихтовки)",
        range: [10000, 25000],
        unit: "мгО/л",
        note: "Расшлихтовка даёт около 95 г ХПК на 1 кг ткани при концентрации в ванне выше 20 гО/л. Крахмальная шлихта биоразлагается, поливиниловый спирт и полиакрилаты — практически нет: ванну расшлихтовки собирают отдельно и дозируют в усреднитель, а не сбрасывают залпом.",
      },
      {
        label: "Щёлочность мерсеризации (по NaOH)",
        range: [2000, 8000],
        unit: "мг/л",
        note: "Отработанный мерсеризационный щёлок 150–250 г/л NaOH экономически выгодно регенерировать выпаркой; в сток идут только промывные воды. Без раздельного сбора нейтрализация съедает тонны кислоты в месяц.",
      },
      {
        label: "Остаточная перекись водорода",
        range: [10, 100],
        unit: "мг/л",
        note: "Перекисное отбеливание: остаточный H₂O₂ выше 5–10 мг/л на входе в аэротенк угнетает ил. Гасится каталазой или бисульфитом в усреднителе.",
      },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Отличие от карточки «Текстильный комбинат / крашение» (textile-dye): там усреднённый сток комбината с преобладанием красильных ванн, здесь — отделочный передел, где определяющими становятся не красители, а щёлочь мерсеризации (pH до 13 против 8–12), перекисная отбелка и расшлихтовка. Нейтрализация и раздельный сбор концентрированных ванн важнее реагентного обесцвечивания.",
      "Температура стока 60–90 °C. Аэротенк по ҚМҚ 2.04.03-19 (п. 6.2) работает при температуре не выше 30 °C — усреднителя для охлаждения на 40–60 °C не хватает, нужен пластинчатый теплообменник с рекуперацией тепла на подогрев технологической воды. Это одновременно единственная позиция схемы с реальной окупаемостью по энергии. Отдельной ступени «охлаждение» в перечне справочника нет.",
      "БПК/ХПК около 0,25–0,3: ПВС, аппреты и сшивающие смолы биорезистентны. Реагентная ступень ДО биологии, при требованиях на сброс в водоём — сорбционная доочистка.",
      "Щёлок мерсеризации даёт скачок pH до 13 в течение 10–15 минут: станция дозирования кислоты подбирается по пиковой, а не средней щёлочности, с pH-метром на входе и на выходе нейтрализатора.",
    ],
    sources: [
      REF,
      ME,
      "Degrémont/SUEZ Water Treatment Handbook, разд. «Текстильная промышленность» (расшлихтовка 95 г ХПК/кг, ванна свыше 20 гО/л; расход 100 м³/т для хлопка)",
      "IFC/World Bank EHS Guidelines for Textiles Manufacturing",
      "ВНТП текстильной промышленности",
    ],
  },
  {
    id: "silk",
    group: "textile",
    name: L(
      "Шелкомотальная фабрика / запарка коконов",
      "Ipak qurti pillasini qaynatish va ipak yigirish fabrikasi",
      "Silk filature / cocoon cooking and reeling",
      "缫丝厂 / 蚕茧煮茧"
    ),
    flowHint: L(
      "120–250 м³ на 1 т сырого шёлка (запарка, мотание, отварка)",
      "1 t xom ipakka 120–250 m³ (qaynatish, yigirish, pishirish)",
      "120–250 m³ per tonne of raw silk (cooking, reeling, degumming)",
      "每吨生丝 120–250 m³（煮茧、缫丝、精练）"
    ),
    pollutants: { cod: [1500, 6000], bod: [600, 2500], ss: [150, 600], fats: [50, 300], tn: [50, 150] },
    ph: [7.5, 10.5],
    special: [
      {
        label: "Серицин (растворённый белок)",
        range: [500, 5000],
        unit: "мг/л",
        note: "Серицин — 20–30 % массы кокона, уходит в воду целиком. Это одновременно источник ХПК и товарный продукт: концентрированный отвар отварки (серицин 15–30 г/л) выгоднее выделять флотацией пены или ультрафильтрацией, чем окислять в аэротенке.",
      },
      {
        label: "ХПК концентрированного отвара отварки",
        range: [15000, 40000],
        unit: "мгО/л",
        note: "Ванна отварки — не более 5–10 % объёма стока, но до половины всей нагрузки по ХПК. Собирается отдельно и дозируется в усреднитель равномерно.",
      },
    ],
    chain: ["screen", "avg", "neutral", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Серицин — поверхностно-активный белок: в аэротенке он даёт обильную устойчивую пену, которая выносит ил из вторичного отстойника и залепляет борта. Типовая мелкопузырчатая аэрация здесь не работает без мер: обязательны орошающее пеногашение форсунками, дозирование пеногасителя и борт аэротенка выше расчётного уровня минимум на 0,7 м.",
      "Флотация до биологии — не роскошь, а способ снять белок и жир куколок и одновременно вернуть серицин: съём пенного продукта снимает 30–50 % ХПК и резко уменьшает пенообразование в аэротенке.",
      "Сток горячий (запарка коконов 70–95 °C) и щелочной при отварке содовым или мыльным раствором: нужны охлаждение до 30 °С перед биологией и нейтрализация. Требование по температуре — ҚМҚ 2.04.03-19, п. 6.2.",
      "Остатки куколок и коконного пуха забивают решётки: процеживатель ≤2 мм с самоочисткой, иначе сток уходит по аварийному переливу. Куколки собираются сухим способом — это кормовое сырьё, а не отход, и их попадание в сток резко поднимает жиры и азот.",
      "Резкая сезонность узбекского шелководства (выкормка май–июнь, переработка кокона несколько месяцев в году): биология на прикреплённой биоплёнке переносит межсезонный простой лучше взвешенного ила.",
    ],
    sources: [
      REF,
      ME,
      "Degrémont/SUEZ Water Treatment Handbook, разд. «Текстильная промышленность» (расход 70 м³/т для шерсти и белковых волокон, ХПК смешанного стока 250–1500 мг/л)",
      "Публикации по рекуперации серицина из стоков шелкомотания (foam fractionation, ультрафильтрация): содержание серицина в отваре 15–30 г/л",
      "Диапазоны предварительные, подлежат уточнению анализом усреднённой суточной пробы конкретной фабрики",
    ],
  },
  {
    id: "carpet",
    group: "textile",
    name: L(
      "Ковровая фабрика (ткачество и крашение пряжи)",
      "Gilam fabrikasi (to‘qish va ip bo‘yash)",
      "Carpet mill (weaving and yarn dyeing)",
      "地毯厂（织造与纱线染色）"
    ),
    flowHint: L(
      "50–120 м³ на 1 т пряжи (крашение); латексирование основы 3–8 м³ на 1000 м² ковра",
      "1 t ipga 50–120 m³ (bo‘yash); asosni latekslash 1000 m² gilamga 3–8 m³",
      "50–120 m³ per tonne of yarn (dyeing); latex backing 3–8 m³ per 1000 m² of carpet",
      "每吨纱线 50–120 m³（染色）；背胶上浆每千平方米地毯 3–8 m³"
    ),
    pollutants: { cod: [700, 2200], bod: [200, 700], ss: [200, 900], surf: [20, 90], tn: [10, 40], tp: [3, 12] },
    ph: [4.0, 9.0],
    special: [
      {
        label: "Цветность",
        range: [400, 2500],
        unit: "град. ПКШ",
        note: "Кислотные и металлокомплексные красители дают глубокий насыщенный цвет и плохо снимаются биологией: обесцвечивание — коагуляцией до аэротенка.",
      },
      {
        label: "Хром общий (металлокомплексные красители 1:1 и 1:2)",
        range: [2, 20],
        unit: "мг/л",
        note: "Хром входит в молекулу красителя как комплекс, а не как свободный ион: осаждение щёлочью, отработанное на гальванике, здесь работает плохо. Комплекс сначала разрушают коагуляцией с солями железа или окислением, и только потом осаждают. Отработанные красильные ванны собираются отдельно.",
      },
      {
        label: "Медь общая (Cu-фталоцианиновые и Cu-комплексные красители)",
        range: [1, 15],
        unit: "мг/л",
        note: "Медь токсична для активного ила уже при 1–5 мг/л по растворённой форме: контроль на входе в биологию обязателен, при превышении — коагуляционное доосаждение.",
      },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Два разных потока, которые нельзя смешивать до обработки: кислые красильные ванны (pH 4–5, металлокомплексные красители, хром и медь) и щелочные промывные воды. Хромсодержащие ванны обрабатываются локально, иначе металлы размазываются по всему осадку и он становится отходом 3 класса.",
      "Латексная пропитка основы (SBR-латекс, вспенивающие агенты) даёт полимерную взвесь, которая не отстаивается и налипает на всё оборудование: линия латексирования собирается отдельно, коагулируется и флотируется, полимерный шлам вывозится сухим.",
      "Из-за металлов в стоке осадок физико-химической ступени паспортизуется отдельно от биологического — обезвоживание двумя линиями или посменно, с раздельным накоплением.",
      "Соотношение БПК/ХПК 0,25–0,35: реагентная ступень до биологии, доочистка сорбцией при жёстких требованиях по цветности.",
    ],
    sources: [
      REF,
      ME,
      "Degrémont/SUEZ Water Treatment Handbook, разд. «Текстильная промышленность» (ХПК 250–1500 мг/л, цветность 500–2000 ПКШ, хром 1–4 мг/л в смешанном текстильном стоке)",
      "IFC/World Bank EHS Guidelines for Textiles Manufacturing (нормируемые Cr и Cu на выпуске)",
      "ВНТП текстильной промышленности",
    ],
  },
  {
    id: "wool-raw",
    group: "textile",
    name: L(
      "Первичная обработка шерсти и каракулевого сырья (мойка руна)",
      "Junni va qorako‘l xom ashyosini dastlabki qayta ishlash (junni yuvish)",
      "Primary processing of greasy wool and karakul stock (fleece scouring)",
      "原毛与卡拉库尔原料初加工（洗净原毛）"
    ),
    flowHint: L(
      "15–40 м³ на 1 т немытого руна",
      "1 t yuvilmagan junga 15–40 m³",
      "15–40 m³ per tonne of greasy fleece",
      "每吨含脂原毛 15–40 m³"
    ),
    pollutants: { cod: [6000, 25000], bod: [2500, 10000], ss: [4000, 20000], fats: [2000, 10000], tn: [100, 400], tp: [10, 50], surf: [50, 300] },
    ph: [8.0, 10.5],
    special: [
      {
        label: "Жиропот в пересчёте на ланолин",
        range: [2000, 12000],
        unit: "мг/л",
        note: "Жиропот — 10–20 % массы немытого руна. Ланолин из первых моечных ванн извлекается центрифугами как товарный продукт: это единственная позиция схемы, которая приносит деньги, и она же снимает основную нагрузку по ХПК.",
      },
    ],
    chain: ["screen", "sand", "avg", "grease", "daf", "physchem", "bio", "clarify", "post", "sludge"],
    notes: [
      "Разграничение с карточкой «Шерстомойка / ПОШ» (wool): та описывает промывку шерсти в составе текстильного производства при удельном расходе 20–50 м³/т. Здесь — приёмка немытого руна прямо с фермы и каракулевого сырья: воды на тонну меньше (15–40 м³/т), а концентрации выше, потому что вместе с руном приходят навоз, песок, репей и растительные примеси, которых на текстильном комбинате уже нет. Если на объекте есть обе стадии — считать по этой карточке, она консервативнее.",
      "Самый грязный сток текстильной группы: по ХПК (6–25 гО/л) и взвешенным он на уровне навозных стоков животноводства, а не текстиля. Справочный расход ХПК — 150–500 г на 1 кг немытой шерсти; при 15–40 м³/т это и даёт указанный диапазон.",
      "Жиры находятся в виде стойкой щелочно-мыльной эмульсии (мойка идёт содой и неионогенными ПАВ при 50–60 °C): гравитационный жироуловитель снимает только 20–30 %. Обязательна двухступенчатая схема — центрифуги/сепараторы на ланолин, затем напорная флотация с коагулянтом.",
      "Песок, репей и навоз дают до половины взвешенных: песколовка и грубая решётка ставятся ДО усреднителя, иначе усреднитель заиливается за один сезон и превращается в шламонакопитель.",
      "Остатки противопаразитарных препаратов (обработка овец против чесотки и клещей) токсичны для активного ила и не удаляются коагуляцией. Числовые концентрации по узбекскому сырью отсутствуют — при проектировании обязателен анализ пробы на действующие вещества, применяемые в хозяйствах-поставщиках, и запас по объёму аэротенка на случай угнетения ила.",
      "Проектировать только по лабораторным данным конкретной партии сырья: разброс между тонкорунной и каракульской шерстью — в разы.",
    ],
    sources: [
      REF,
      ME,
      "Degrémont/SUEZ Water Treatment Handbook, разд. «Текстильная промышленность»: мойка шерсти — 150–500 г ХПК на 1 кг немытой шерсти, состав загрязнений 25–30 % жиров, 10–15 % земли и песка, 40–60 % органических солей",
      "Диапазоны предварительные: по каракулевому сырью Узбекистана справочных данных нет, требуется анализ усреднённой пробы",
    ],
  },

  /* -------------------- КОММУНАЛЬНЫЕ ОБЪЕКТЫ -------------------- */

  {
    id: "toyxona",
    group: "municipal",
    name: L(
      "Тўйхона / свадебный банкетный зал",
      "To‘yxona / to‘y marosimlari zali",
      "To‘yxona / wedding banquet hall",
      "婚宴礼堂（To‘yxona）"
    ),
    flowHint: L(
      "25–40 л на гостя за мероприятие; зал на 300–1500 мест — 10–60 м³ за вечер",
      "bir mehmonga tadbir davomida 25–40 l; 300–1500 o‘rinli zal uchun bir kechada 10–60 m³",
      "25–40 L per guest per event; a 300–1500 seat hall discharges 10–60 m³ in one evening",
      "每位宾客每场 25–40 L；300–1500 座礼堂一晚 10–60 m³"
    ),
    pollutants: { cod: [1500, 4000], bod: [700, 2000], ss: [500, 1500], fats: [300, 1200], tn: [50, 150], tp: [10, 30], surf: [20, 80] },
    ph: [5.5, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Режим, которого нет ни у одного другого объекта справочника: весь суточный объём уходит за 4–6 часов, а затем зал стоит пустым 3–4 суток. Коэффициент часовой неравномерности достигает 8–12 против 2,5–3 у ресторана, поэтому по ҚМҚ 2.04.03-19 (п. 2.7, табл. 2) считать нельзя — усреднитель принимается не менее чем на полный объём одного мероприятия, а лучше на два подряд идущих (пятница–суббота).",
      "Ил должен пережить голодные периоды: между свадьбами приток нулевой 60–80 часов. Взвешенный ил за это время минерализуется и всплывает во вторичном отстойнике; практическое решение — биология на прикреплённой биоплёнке (MBBR) плюс рециркуляция из усреднителя малым расходом, чтобы держать аэротенк «на подпитке».",
      "Плов, шашлык и курдючный жир дают жиры 300–1200 мг/л — вдвое-втрое выше обычного ресторана. Жироуловитель по EN 1825 считается на пиковый расход мойки (не на средний), время пребывания не менее 60 минут; в узбекской практике добавляют вторую секцию, так как бараний жир застывает и снимается коркой, а не откачивается насосом.",
      "Пищевые отходы (кости, рис, зелень) идут в мойку вместе с водой: решётка-процеживатель ≤3 мм перед жироуловителем обязательна, иначе жироуловитель за месяц заполняется твёрдым осадком и перестаёт работать как жироуловитель.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      "EN 1825-2 (жироуловители; в ҚМҚ 2.04.03-19 не нормируются)",
      `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2 — коэффициент общей неравномерности (для залповых объектов даёт заниженное значение, применён только как ориентир)`,
      "Концентрации приняты по аналогии с карточкой «Ресторан / кафе / столовая» с повышением по жирам и ХПК в 1,5–2 раза на характер узбекской банкетной кухни; подлежат уточнению анализом",
    ],
  },
  {
    id: "choyxona",
    group: "municipal",
    name: L(
      "Чайхана / национальное кафе с тандыром и казаном",
      "Choyxona / tandir va qozonli milliy oshxona",
      "Choyxona / traditional teahouse with tandoor and cauldron",
      "茶馆 / 带馕坑和大锅的民族餐馆"
    ),
    flowHint: L(
      "12–25 л на посетителя; типовой объект 3–15 м³/сут",
      "bir tashrifchiga 12–25 l; odatdagi obyekt uchun 3–15 m³/kun",
      "12–25 L per visitor; a typical facility discharges 3–15 m³/day",
      "每位顾客 12–25 L；典型场所每日 3–15 m³"
    ),
    pollutants: { cod: [1000, 3000], bod: [500, 1500], ss: [400, 1200], fats: [200, 900], tn: [40, 100], tp: [8, 25], surf: [20, 80] },
    ph: [6.0, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "disinfect", "sludge"],
    notes: [
      "Бараний (курдючный) жир застывает при 35–40 °C, то есть уже в самом выпуске: тёплая вода из мойки остывает в первых 3–5 метрах трубы и жир нарастает коркой по всему сечению. Практические меры — уклон выпуска не менее 0,02, диаметр не менее 100 мм, жироуловитель в тёплом помещении или с утеплением, ревизии через каждые 5–8 м.",
      "Гравитационный жироуловитель по EN 1825 обязателен, но здесь его считают не по времени пребывания, а по частоте обслуживания: жировая корка снимается вручную раз в 5–10 дней, поэтому объём жиросборной зоны принимается не менее 40 % рабочего объёма, а крышки — съёмные полностью, а не через люк.",
      "Зола и сажа от тандыра попадают в трап при мытье площадки: перед жироуловителем ставится корзина-грязеуловитель, иначе минеральный осадок занимает объём и уносится на биологию как зольная взвесь. Золу правильнее убирать сухим способом.",
      "Объекты в кишлаках работают вне централизованной канализации, при малом расходе (3–15 м³/сут) и с полным отсутствием стока ночью: компактная блочная установка с прикреплённой биоплёнкой и накопительным приямком; выгреб без очистки при плотной застройке недопустим по санитарным требованиям.",
      "Доля СПАВ от ручного мытья посуды высокая (20–80 мг/л): при пенообразовании в аэротенке предусматривается орошающее пеногашение.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      "EN 1825-2 (жироуловители; в ҚМҚ 2.04.03-19 не нормируются)",
      "Концентрации приняты по аналогии с карточкой «Ресторан / кафе / столовая» с поправкой на преобладание жирной баранины; подлежат уточнению анализом",
    ],
  },
  {
    id: "bathhouse",
    group: "municipal",
    name: L(
      "Баня / сауна / хаммам с бассейном",
      "Hammom / sauna / basseynli hammom",
      "Public bath / sauna / hammam with pool",
      "浴场 / 桑拿 / 带泳池的浴室"
    ),
    flowHint: L(
      "150–250 л на посетителя; промывка фильтра бассейна 3–10 м³ за цикл",
      "bir tashrifchiga 150–250 l; basseyn filtrini yuvish bir siklda 3–10 m³",
      "150–250 L per visitor; pool filter backwash 3–10 m³ per cycle",
      "每位顾客 150–250 L；泳池滤器反冲洗每次 3–10 m³"
    ),
    pollutants: { cod: [200, 600], bod: [80, 250], ss: [100, 350], fats: [10, 50], tn: [10, 35], tp: [2, 10], surf: [15, 60] },
    ph: [6.5, 9.0],
    special: [
      {
        label: "Остаточный активный хлор и хлорамины (вода бассейна)",
        range: [0.3, 3.0],
        unit: "мг/л",
        note: "Прямая токсичность для биоценоза: активный хлор выше 0,5 мг/л на входе в аэротенк подавляет нитрификацию первой. Слив чаши и промывная вода фильтров дехлорируются бисульфитом натрия или выдерживаются в усреднителе до распада, и только потом подаются на биологию.",
      },
      {
        label: "Взвешенные вещества промывной воды фильтров (залп)",
        range: [200, 1500],
        unit: "мг/л",
        note: "Промывка кварцевого фильтра длится 3–6 минут с расходом в разы выше среднего часового: без приёмной ёмкости этот залп срывает ил из вторичного отстойника.",
      },
    ],
    chain: ["screen", "avg", "daf", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Сток «бедный»: БПК₅ 80–250 мг/л при большом объёме — вдвое ниже хозбытового по ҚМҚ 2.04.03-19 (табл. 25 при 170–280 л/(чел·сут) даёт заметно более концентрированный сток). Ил голодает, возраст растёт, хлопок мельчает и выносится. Проектное решение — низкая нагрузка на ил с обязательной рециркуляцией и биоплёнка на носителе, а не классический аэротенк со взвешенным илом; при БПК ниже 100 мг/л полноценная денитрификация не запускается из-за нехватки органики.",
      "СПАВ 15–60 мг/л при интенсивной аэрации дают устойчивую шапку пены: флотация до биологии снимает основную часть, в аэротенке — орошающее пеногашение. Без этого пена переливается через борт и разносит аэрозоль с бактериями по площадке.",
      "Бассейн и банная линия разводятся: залповый слив чаши (десятки кубометров за час) идёт в отдельный приёмный резервуар и дозируется в усреднитель равномерно в течение суток, иначе разбавляет и без того бедный сток до полной остановки биологии.",
      "Соотношение БПК:N:P смещено — фосфора и азота от моющих средств больше, чем нужно для такого БПК. При сбросе в водоём фосфор снимается реагентно (коагулянт в доочистку), биологическим путём его при этой нагрузке не убрать.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      ME,
      "Данные по серому стоку душевых и банных помещений (greywater): ХПК 200–600 мг/л, БПК₅ 80–250 мг/л, СПАВ 15–60 мг/л",
      KMK_DOMESTIC,
    ],
  },
  {
    id: "roadside",
    group: "municipal",
    name: L(
      "Придорожный комплекс на трассе (кафе, АЗС, мойка, мотель)",
      "Trassadagi yo‘l bo‘yi majmuasi (kafe, YoQSh, yuvish shoxobchasi, motel)",
      "Roadside service complex (cafe, filling station, car wash, motel)",
      "公路服务区（餐饮、加油站、洗车、汽车旅馆）"
    ),
    flowHint: L(
      "8–40 м³/сут: кафе 15–25 л на блюдо, мотель 200–250 л на место, мойка 150–300 л на автомобиль",
      "8–40 m³/kun: kafe bir taomga 15–25 l, motel bir o‘ringa 200–250 l, yuvish bir avtomobilga 150–300 l",
      "8–40 m³/day: cafe 15–25 L per meal, motel 200–250 L per bed, wash bay 150–300 L per vehicle",
      "每日 8–40 m³：餐饮每份 15–25 L，旅馆每床 200–250 L，洗车每车 150–300 L"
    ),
    pollutants: { cod: [600, 1800], bod: [300, 800], ss: [300, 1000], fats: [100, 400], petro: [20, 200], tn: [40, 90], tp: [8, 20], surf: [15, 60] },
    ph: [6.0, 9.0],
    chain: ["screen", "grease", "sand", "oil", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Объект всегда вне централизованной канализации, поэтому очистка полная — до сброса в рельеф или на поля фильтрации, а не «до сети». Это сразу означает доочистку и обеззараживание в составе схемы.",
      "Главная ошибка проекта — свести все стоки в один коллектор. Нефтепродукты от мойки и площадки АЗС при 20–200 мг/л подавляют активный ил (безопасный порог на входе в биологию — порядка 20–25 мг/л): потоки разделяются на три линии. Кухня — жироуловитель; мойка и ливнёвка с заправочных островков — песколовка и тонкослойный нефтеуловитель; мотель и санузлы — напрямую в усреднитель. Смешение только после локальных ступеней.",
      "Расход рвано неравномерный: ночью транзитные фуры дают пик, днём — легковой поток; ярко выражена сезонность и зависимость от праздничных дней. Усреднитель считается не менее чем на 10–12 часов среднего притока.",
      "Ливневый сток с площадки АЗС нормируется отдельно: расчётный расход — по методу предельных интенсивностей ҚМҚ 2.04.03-19 (пп. 2.11–2.19), нефтеуловитель — с автоматическим затвором, норматив на выходе 0,3 мг/л обеспечивается сорбционным фильтром.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      "EN 858 (сепараторы нефтепродуктов; в ҚМҚ 2.04.03-19 не нормируются)",
      "EN 1825-2 (жироуловители)",
      KMK_RAIN,
      "Концентрации — смешение диапазонов карточек «Ресторан», «Гостиница» и «Автомойка» пропорционально долям потоков; подлежат уточнению анализом",
    ],
  },
  {
    id: "truckwash",
    group: "municipal",
    name: L(
      "Мойка грузовиков и сельхозтехники",
      "Yuk mashinalari va qishloq xo‘jaligi texnikasini yuvish",
      "Truck and agricultural machinery wash",
      "货车与农机清洗站"
    ),
    flowHint: L(
      "400–1200 л на грузовик, 800–2000 л на трактор или комбайн",
      "bir yuk mashinasiga 400–1200 l, traktor yoki kombaynga 800–2000 l",
      "400–1200 L per truck, 800–2000 L per tractor or combine harvester",
      "每辆货车 400–1200 L，每台拖拉机或联合收割机 800–2000 L"
    ),
    pollutants: { cod: [500, 2000], bod: [100, 400], ss: [1500, 8000], petro: [100, 800], surf: [20, 100] },
    ph: [6.5, 9.5],
    chain: ["screen", "sand", "oil", "physchem", "clarify", "post", "disinfect"],
    notes: [
      "Разграничение с карточкой «Автомойка» (carwash): там 150–300 л и взвешенные 500–2500 мг/л, здесь расход на машину в 3–6 раз больше, а взвешенные — 1,5–8 г/л, то есть на порядок выше по массе осадка со смены. Типовая оборотная система легковой мойки по осадку не рассчитана: её отстойник заполняется за 2–3 суток вместо месяца.",
      "Определяющий параметр — не нефтепродукты, а объём осадка. С днища и колёс идёт глинистый лёссовый грунт, который не осаждается сам (частицы 5–20 мкм, мутность держится сутками): нужны коагулянт с флокулянтом и тонкослойный отстойник, а шламовый приямок проектируется с конусом не менее 60° и илососом или шнеком — вручную его не вычистить.",
      "Мойка сельхозтехники после обработки полей несёт остатки пестицидов и минеральных удобрений. Пестициды токсичны для биологии и не снимаются коагуляцией — по этой причине биологическая ступень в схему сознательно не включена, доочистка идёт сорбцией на активированном угле. Надёжных справочных концентраций по действующим веществам нет, поэтому ключи pollutants по ним не заполнены: перед проектированием нужен анализ на конкретные препараты, применяемые хозяйством.",
      "Смыв удобрений даёт залповый азот и фосфор в стоке промывки опрыскивателей — при сбросе в водоём этот поток собирается отдельно и не должен попадать ни в оборотную воду, ни на сорбционный фильтр.",
      "Оборотное водоснабжение окупается (до 70–80 % возврата), но обеззараживание оборотной воды обязательно: при высокой органике и тепле она за сутки закисает и даёт запах сероводорода.",
    ],
    sources: [
      REF,
      "EN 858 (сепараторы нефтепродуктов; в ҚМҚ 2.04.03-19 не нормируются)",
      NOT_IN_KMK,
      "Диапазон взвешенных и нефтепродуктов — по карточке «Автомойка» с повышением на характер грузового и сельхозтранспорта; подлежит уточнению анализом усреднённой пробы за смену",
    ],
  },
  {
    id: "bazaar",
    group: "municipal",
    name: L(
      "Дехканский базар / рынок с мясным и рыбным рядом",
      "Dehqon bozori / go‘sht va baliq rastalari bo‘lgan bozor",
      "Farmers' bazaar / market with meat and fish rows",
      "农贸市场（含肉类与水产摊区）"
    ),
    flowHint: L(
      "6–15 л на м² торговой площади в сутки; мясной и рыбный ряд — 30–60 л на м²",
      "kuniga 1 m² savdo maydoniga 6–15 l; go‘sht va baliq rastalari uchun 1 m² ga 30–60 l",
      "6–15 L per m² of trading area per day; meat and fish rows 30–60 L per m²",
      "每 m² 营业面积每日 6–15 L；肉类与水产摊区每 m² 30–60 L"
    ),
    pollutants: { cod: [800, 2500], bod: [400, 1200], ss: [500, 2000], fats: [100, 400], tn: [30, 90], tp: [5, 20], surf: [10, 40] },
    ph: [6.0, 8.5],
    special: [
      {
        label: "Кровь и мясной смыв (по ХПК локального потока)",
        range: [5000, 20000],
        unit: "мгО/л",
        note: "Смыв разделочных столов мясного ряда по концентрации ближе к стоку убойного цеха, чем рынка. Отдельный трап с решёткой и жироуловителем на мясной ряд; кровь в сток не сливается — сбор в ёмкость и вывоз.",
      },
    ],
    chain: ["screen", "sand", "grease", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Двойная неравномерность: суточная (весь смыв рядов — за 1,5–2 часа после закрытия, пик 6–10 средних часов) и сезонная (в сезон дынь, винограда и хлопковой уборки поток посетителей и объём отходов растут в 2–3 раза). Усреднитель считается на объём вечернего смыва плюс запас на сезонный пик.",
      "Сток идёт по ливневой сети со всей территории и несёт песок, полиэтилен, ботву и упаковку: решётка усиленного класса с прозорами ≤6 мм и механической очисткой, за ней песколовка. Обычная корзина забивается за один торговый день, и сток уходит по переливу.",
      "Жиры и кровь — только с мясного и рыбного ряда, это 10–20 % площади, но большая часть нагрузки. Локальный жироуловитель на этот ряд экономичнее общего на весь базар в 3–5 раз по объёму.",
      "Дождевой расход с открытой территории считается по методу предельных интенсивностей (ҚМҚ 2.04.03-19, пп. 2.11–2.19) и в биологию не подаётся: первый, наиболее грязный объём стока направляется в усреднитель, остальной — через песколовку на выпуск.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      ME,
      KMK_RAIN,
      "Концентрации — по карточке «Торговый центр / рынок» с повышением по органике и взвешенным на долю мясного и рыбного ряда; подлежат уточнению анализом",
    ],
  },
  {
    id: "guesthouse",
    group: "municipal",
    name: L(
      "Гостевой дом / бутик-отель в историческом центре",
      "Mehmon uyi / tarixiy markazdagi butik-mehmonxona",
      "Guest house / boutique hotel in a historic city centre",
      "历史城区民宿 / 精品酒店"
    ),
    flowHint: L(
      "200–300 л на место в сутки; объект на 10–40 мест — 2–12 м³/сут",
      "kuniga bir o‘ringa 200–300 l; 10–40 o‘rinli obyekt uchun 2–12 m³/kun",
      "200–300 L per bed per day; a 10–40 bed property discharges 2–12 m³/day",
      "每床位每日 200–300 L；10–40 床位场所每日 2–12 m³"
    ),
    pollutants: { cod: [500, 1000], bod: [250, 500], ss: [250, 500], fats: [50, 180], tn: [45, 85], tp: [10, 20], surf: [10, 30] },
    ph: [6.5, 8.5],
    chain: ["screen", "grease", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Отличие от карточки «Гостиница / санаторий / зона отдыха» (hotel) — не в составе стока, он практически тот же, а в условиях площадки. В охранной зоне Самарканда, Бухары и Хивы земляные работы ограничены или запрещены, вывоз грунта и заезд техники — по согласованию: очистное вписывается во внутренний двор 30–50 м² при заглублении не более 1,5–2 м. Отсюда компоновка из горизонтальных ёмкостей малого диаметра, монтаж без крана (через проём или разборными секциями) и полное отсутствие бетонных монолитных камер.",
      "Резкая сезонность туристического потока: пик апрель–май и сентябрь–октябрь, зимой загрузка падает до 5–15 %. Ил при этом голодает 3–4 месяца. Решение — биоплёнка на носителе (переносит простой) плюс режим консервации: аэрация по таймеру 15–20 минут в час, чтобы поддержать биоценоз и не переокислить его; при полном останове запуск после зимы занимает 2–3 недели, и его надо начинать до заезда первых групп.",
      "Установка стоит вплотную к номерам и к обеденной террасе — запах становится техническим требованием, а не пожеланием: полностью герметичные ёмкости, вытяжка через угольный или биофильтр с выбросом выше конька кровли, аварийный перелив закрытый. Приёмная камера и жироуловитель — самые пахнущие узлы — выносятся дальше всего от окон.",
      "Малый расход (2–12 м³/сут) и большая суточная неравномерность (утренний пик душевых в 4–5 раз выше среднего часа): усреднитель обязателен, иначе биология работает залпами. При таком расходе экономически оправдана компактная блочная установка заводской готовности, а не сборная схема из отдельных сооружений.",
    ],
    sources: [
      NOT_IN_KMK,
      REF,
      KMK_DOMESTIC,
      "IFC/World Bank EHS Guidelines for Tourism and Hospitality Development",
      "Концентрации приняты по карточке «Гостиница / санаторий / зона отдыха»; подлежат уточнению анализом",
    ],
  },
/* ==================== ПРОМЫШЛЕННОСТЬ (heavy) — ДОБАВЛЕНИЕ ==================== */
  {
    id: "refinery",
    group: "heavy",
    name: L(
      "Нефтепереработка / нефтебаза",
      "Neftni qayta ishlash / neft bazasi",
      "Petroleum refinery / tank farm",
      "炼油厂 / 油库"
    ),
    flowHint: L(
      "0,5–1,5 м³ на 1 т перерабатываемой нефти (без оборотных циклов)",
      "qayta ishlanadigan 1 t neftga 0,5–1,5 m³ (aylanma sikllarsiz)",
      "0.5–1.5 m³ per tonne of crude processed (excluding recirculating cooling)",
      "每吨加工原油 0.5–1.5 m³（不含循环冷却水）"
    ),
    pollutants: { cod: [300, 2000], bod: [100, 600], ss: [50, 300], petro: [50, 1000], surf: [5, 40] },
    ph: [6.0, 9.5],
    special: [
      {
        label: "Фенолы",
        range: [10, 200],
        unit: "мг/л",
        note: "Токсичны для активного ила уже при единицах мг/л и не снимаются отстаиванием: нужен отдельный поток от установок каталитического крекинга с локальным окислением или экстракцией фенолов до смешения.",
      },
      {
        label: "Сульфиды S²⁻ (кислая вода)",
        range: [5, 100],
        unit: "мг/л",
        note: "Кислая вода (sour water) идёт на отпарную колонну ДО очистных. При подкислении смешанного стока выделяется H₂S — запах, токсичность, коррозия бетона и металла коллекторов.",
      },
      {
        label: "Азот аммонийный (после отпарки)",
        range: [20, 200],
        unit: "мг/л",
        note: "Остаток аммиака из кислой воды. Ступени отдувки аммиака в перечне нет — она проектируется отдельно; иначе нагрузка на нитрификацию удваивает объём аэротенка.",
      },
      {
        label: "Сухой остаток (солёность)",
        range: [1000, 6000],
        unit: "мг/л",
        note: "Продувка оборотных циклов охлаждения и обессоливание нефти дают минерализацию до 6 г/л: ил адаптируется только при плавном усреднении, скачки солёности вызывают вынос ила.",
      },
    ],
    chain: ["avg", "oil", "daf", "neutral", "bio", "clarify", "post", "sludge"],
    notes: [
      "Модернизация Ферганского и Бухарского НПЗ идёт с ужесточением требований на сброс — схему считать на перспективные нормативы, а не на действующие.",
      "Главная ошибка проектирования — надеяться на нефтеловушку: свободная плёнка снимается API-сепаратором до 30–50 мг/л, но эмульгированные нефтепродукты остаются. Их снимает только напорная флотация с деэмульгатором и коагулянтом, до 10–20 мг/л на входе в биологию.",
      "Три потока разделяются на площадке: кислая вода (на отпарку), засолённые стоки ЭЛОУ и продувки, условно чистые ливневые и охлаждающие. Смешение всего в один коллектор делает биологический блок неработоспособным.",
      "Соотношение БПК/ХПК 0,3–0,4: заметная доля ХПК биорезистентна, поэтому при жёстком нормативе на выпуске нужна сорбционная доочистка активированным углём после вторичного отстаивания.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Petroleum Refining (2016)",
      "Organic Contaminants in Refinery Wastewater: Characterization and Novel Approaches for Biotreatment (IntechOpen, 2018) — характеристики сырого стока НПЗ",
      REF,
      ME,
    ],
  },
  {
    id: "gaschem",
    group: "heavy",
    name: L(
      "Газохимия / GTL / метанол и полимеры",
      "Gaz kimyosi / GTL / metanol va polimerlar",
      "Gas chemical complex / GTL / methanol and polymers",
      "天然气化工 / GTL / 甲醇与聚合物"
    ),
    flowHint: L(
      "1–5 м³ на 1 т продукции; основной сброс — продувка градирен и ХВО",
      "1 t mahsulotga 1–5 m³; asosiy chiqindi — gradirnya va suv tayyorlash purkasi",
      "1–5 m³ per tonne of product; the bulk is cooling tower and demin plant blowdown",
      "每吨产品 1–5 m³；主要排水为冷却塔与水处理排污"
    ),
    pollutants: { cod: [200, 1500], bod: [50, 400], ss: [30, 200], petro: [5, 50] },
    ph: [6.5, 9.5],
    special: [
      {
        label: "Сухой остаток (минерализация)",
        range: [2000, 15000],
        unit: "мг/л",
        note: "Продувка градирен при 3–6 циклах упаривания плюс концентрат обратного осмоса ХВО. Это солевая, а не органическая задача: биология здесь почти не работает, снижение солёности возможно только выпаркой или мембранами.",
      },
      {
        label: "Метанол и гликоли (по ХПК)",
        range: [50, 2000],
        unit: "мгО/л",
        note: "Легко окисляются биологически, но приходят залпами при дренировании аппаратов — без усреднителя на 12–24 часа ил получает ударную дозу.",
      },
    ],
    chain: ["avg", "neutral", "physchem", "bio", "clarify", "post", "sludge"],
    notes: [
      "Шуртанский ГХК, Uzbekistan GTL, Устюртский ГХК (полиэтилен и полипропилен) и строящийся Surhan Gas Chemical дают однотипный сток: он определяется не продуктом, а водоподготовкой и оборотными циклами.",
      "Биоциды оборотных систем (изотиазолиноны, ДБНПА, стабилизированный гипохлорит) — прямой яд для активного ила: залп продувки после ударного хлорирования градирни способен убить нитрификацию на несколько суток. Продувку после биоцидной обработки собирают в отдельную ёмкость и подают дозированно.",
      "Фосфонаты и ингибиторы коррозии дают биологически стойкий фосфор, который не снимается ни биологическим удалением, ни обычной коагуляцией по железу без избытка дозы — доза коагулянта подбирается только пробным коагулированием на реальной продувке.",
      "Концентрат обратного осмоса ХВО в сток не сбрасывается вместе с остальным потоком: его либо возвращают на вторую ступень концентрирования, либо направляют в пруд-испаритель. Ступени обратного осмоса в перечне нет — она проектируется как отдельный узел.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Petrochemicals Manufacturing",
      "IFC/World Bank EHS Guidelines for Large Volume Petroleum-based Organic Chemicals Manufacturing",
      ME,
      REF,
    ],
  },
  {
    id: "steel",
    group: "heavy",
    name: L(
      "Электросталеплавильное и прокатное производство",
      "Elektrometallurgiya va prokat ishlab chiqarish",
      "Electric arc steelmaking and rolling mill",
      "电炉炼钢与轧钢"
    ),
    flowHint: L(
      "3–10 м³ на 1 т проката в прямоточной схеме; в оборотной — продувка 0,3–1 м³/т",
      "to‘g‘ri oqimli sxemada 1 t prokatga 3–10 m³; aylanma sxemada purka 0,3–1 m³/t",
      "3–10 m³ per tonne of rolled product once-through; 0.3–1 m³/t as blowdown in recirculating systems",
      "直流系统每吨轧材 3–10 m³；循环系统排污 0.3–1 m³/t"
    ),
    pollutants: { cod: [100, 800], ss: [200, 3000], petro: [20, 500], surf: [5, 40] },
    ph: [2.0, 10.0],
    special: [
      {
        label: "Железо общее",
        range: [20, 500],
        unit: "мг/л",
        note: "Окалина и травильные растворы. Осаждение гидроксида железа при pH 8,5–9,5 после нейтрализации известковым молоком; осадок объёмный, линия обезвоживания считается на большой выход шлама.",
      },
      {
        label: "Фториды F⁻",
        range: [5, 50],
        unit: "мг/л",
        note: "Плавиковый шпат в шлакообразующих смесях и смешанное травление. Снимаются только осаждением фторида кальция известью с двухступенчатым отстаиванием, биология и сорбция бесполезны.",
      },
      {
        label: "Сульфаты SO₄²⁻",
        range: [500, 3000],
        unit: "мг/л",
        note: "Сернокислотное травление и известкование. Осаждение до 1,5–2 г/л возможно гипсом, ниже — только мембранами; норматив на сброс проверяется до выбора схемы.",
      },
      {
        label: "Отработанная прокатная эмульсия (по ХПК)",
        range: [20000, 100000],
        unit: "мгО/л",
        note: "В общий сток не сбрасывается: локальная деэмульсация (реагентное разрушение кислотой или ультрафильтрация) отдельной установкой. Ступени деэмульсации в перечне нет.",
      },
    ],
    chain: ["avg", "sand", "oil", "daf", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "«Узметкомбинат» официально числится среди нарушителей по сбросам: превышения по сульфатам ×2,1, железу ×1,3, фторидам ×3,6 и нитритному азоту ×1,5 — то есть именно по тем показателям, которые типовая схема механической очистки не снимает в принципе.",
      "Отличие от карточки «Машиностроение / металлообработка»: там сток мойки и СОЖ с нейтральным pH, здесь — окалина как тяжёлая абразивная взвесь (гидроциклон и песколовка до всего остального), крайне кислые травильные растворы и фториды. Схемы не взаимозаменяемы.",
      "Окалина отделяется в яме-отстойнике под клетью и гидроциклоне: это не «взвешенные вещества» в обычном смысле, а плотный абразив, который за месяцы стирает крыльчатки насосов и тонкослойные модули. Насосы подбираются шламовые.",
      "Температура прокатного оборотного цикла 40–60 °C: перед биологической ступенью (если она вообще нужна) сток охлаждается, температура на входе не выше нормативной.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Integrated Steel Mills",
      "IFC/World Bank EHS Guidelines for Base Metal Smelting and Refining",
      REF,
      ME,
      "Данные экологического надзора Республики Узбекистан по АО «Узметкомбинат» (кратности превышения)",
    ],
  },
  {
    id: "oredressing",
    group: "heavy",
    name: L(
      "Обогатительная фабрика / ЗИФ (цианирование)",
      "Boyitish fabrikasi / oltin ajratish zavodi (siyanidlash)",
      "Ore dressing plant / gold cyanidation plant",
      "选矿厂 / 氰化提金厂"
    ),
    flowHint: L(
      "3–6 м³ на 1 т руды в оборотном цикле; сброс — продувка хвостохранилища",
      "aylanma siklda 1 t rudaga 3–6 m³; chiqindi — quyqa saqlagichning purkasi",
      "3–6 m³ per tonne of ore in the closed circuit; discharge is tailings pond blowdown",
      "闭路循环每吨矿石 3–6 m³；排放为尾矿库排污"
    ),
    pollutants: { ss: [500, 20000] },
    ph: [2.0, 11.0],
    special: [
      {
        label: "Цианиды общие (CN⁻)",
        range: [50, 500],
        unit: "мг/л",
        note: "Растворы цианирования до обезвреживания содержат сотни мг/л. Это абсолютный яд для активного ила и для персонала: обязательна отдельная линия обезвреживания (INCO SO₂/воздух или пероксид водорода) до любого смешения. Ступени детоксикации цианидов в перечне нет — она проектируется как отдельный узел.",
      },
      {
        label: "Тяжёлые металлы (Cu, Zn, Pb, Cd, As)",
        range: [1, 200],
        unit: "мг/л",
        note: "Состав определяется месторождением. Медь и цинк в цианидных растворах связаны в прочные комплексы и НЕ осаждаются известью до разрушения цианида — порядок операций принципиален: сначала детоксикация, потом осаждение металлов.",
      },
      {
        label: "Сульфаты SO₄²⁻",
        range: [1000, 10000],
        unit: "мг/л",
        note: "Окисление сульфидных минералов и известкование дают граммы на литр. Снижение ниже 1,5–2 г/л требует мембран или выпарки — этап капиталоёмкий, поэтому приоритет отдаётся замкнутому обороту без сброса.",
      },
      {
        label: "Кислые шахтные и карьерные воды (pH)",
        range: [2, 3],
        unit: "ед. pH",
        note: "Окисление пирита даёт pH 2–3 и растворённое железо. Нейтрализация известковым молоком до pH 9–10 с аэрацией для окисления Fe²⁺→Fe³⁺; расход извести считается по кислотности, а не по pH.",
      },
    ],
    chain: ["avg", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "Биологическая очистка здесь неприменима принципиально: органики нет, а цианиды, тиоцианаты и тяжёлые металлы убивают ил. Схема чисто реагентная — детоксикация, нейтрализация, осаждение, осветление, оборот.",
      "Ангренское рудоуправление «Кочбулок» числится в списке загрязнителей с превышениями по аммонийному азоту ×9,26 и сульфатам ×2,7 — аммоний здесь вторичный продукт разложения цианидов и тиоцианатов, а не «бытовое» загрязнение, и обычной нитрификацией на таком фоне он не снимается.",
      "Ксантогенаты и прочие флотореагенты дают биорезистентную ХПК и стойкую пену: надёжного справочного диапазона по ним нет, определяются только анализом оборотной воды конкретной фабрики.",
      "Отличие от общей карточки «Горнодобыча / обогащение / карьер»: та рассчитана на карьерный водоотлив и минеральную взвесь без химии. Здесь ключевые узлы — детоксикация цианидов и раздельное обращение с кислыми шахтными водами; путать схемы нельзя по технике безопасности.",
      "АГМК расширяет мощности — при реконструкции водооборот считается на приращённый расход, а не на существующий.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Mining",
      "US EPA. Technical Report: Treatment of Cyanide Heap Leaches and Tailings (концентрации CN в растворах и хвостах)",
      REF,
      ME,
      "Данные экологического надзора Республики Узбекистан по Ангренскому рудоуправлению «Кочбулок»",
    ],
  },
  {
    id: "ceramics",
    group: "heavy",
    name: L(
      "Кирпичный завод / керамика, санфаянс, керамогранит",
      "G‘isht zavodi / keramika, sanfayans, keramogranit",
      "Brick plant / ceramics, sanitary ware, porcelain stoneware",
      "砖厂 / 陶瓷、卫生洁具、瓷砖"
    ),
    flowHint: L(
      "0,5–2 м³ на 1 т изделий (мойка форм, шликер, глазуровочный участок)",
      "1 t mahsulotga 0,5–2 m³ (qoliplarni yuvish, shliker, sirlash uchastkasi)",
      "0.5–2 m³ per tonne of product (mould washing, slip, glazing line)",
      "每吨产品 0.5–2 m³（模具清洗、泥浆、施釉工段）"
    ),
    pollutants: { ss: [1000, 15000] },
    ph: [7.0, 11.0],
    chain: ["screen", "avg", "physchem", "clarify", "post", "sludge"],
    notes: [
      "Стройбум задаёт масштаб отрасли: в стране работают около 40 цементных заводов суммарной мощностью 39,7 млн т, керамика и кирпич растут вместе с ними — очистные проектируются с запасом на вторую очередь.",
      "Ключевая техническая особенность: глинистая взвесь тонкодисперсная и высокоминеральная, она практически не осаждается сама — в отстойнике за 2 часа снимается меньше половины. Работает только коагуляция (соли алюминия или железа) с флокулянтом и тонкослойным осветлителем; дозу подбирают пробным коагулированием на реальном шликере.",
      "Биологическая ступень не нужна и вредна: органики в стоке нет, ил в аэротенке заиливается минеральной взвесью и теряет активность. Цепочка сознательно построена без bio — это физико-химическая схема с возвратом осветлённой воды в шликероприготовление.",
      "Глазуровочный участок даёт свинец, кадмий, кобальт, цирконий и бор. Надёжного справочного диапазона по концентрациям в исходном стоке нет — он определяется рецептурой глазури и только лабораторным анализом; ориентир по требованиям на сбросе IFC: свинец 0,2 мг/л, кадмий 0,1 мг/л, кобальт/медь/никель 0,1 мг/л, цинк 2 мг/л, взвешенные 50 мг/л. Глазуровочный поток собирается ОТДЕЛЬНО от общего.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Ceramic Tile and Sanitary Ware Manufacturing (2007) — нормативы на сбросе и перечень загрязнителей",
      REF,
      ME,
    ],
  },
  {
    id: "cementplant",
    group: "heavy",
    name: L(
      "Цементный завод",
      "Sement zavodi",
      "Cement plant",
      "水泥厂"
    ),
    flowHint: L(
      "0,2–1 м³ на 1 т клинкера (охлаждение, пылеподавление, мойка оборудования)",
      "1 t klinkerga 0,2–1 m³ (sovutish, changni bostirish, uskunani yuvish)",
      "0.2–1 m³ per tonne of clinker (cooling, dust suppression, equipment washing)",
      "每吨熟料 0.2–1 m³（冷却、抑尘、设备清洗）"
    ),
    pollutants: { ss: [500, 10000], surf: [5, 50] },
    ph: [11.0, 12.5],
    special: [
      {
        label: "Сульфаты SO₄²⁻",
        range: [500, 3000],
        unit: "мг/л",
        note: "Растворяются из клинкера и гипсовой добавки. Ниже 1,5–2 г/л реагентно не снимаются — при жёстком нормативе на выпуске единственный выход экономически замкнуть оборот и не сбрасывать вовсе.",
      },
    ],
    chain: ["sand", "avg", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "«Бекабадцемент» числится в списке нарушителей с превышениями по сульфатам и СПАВ до двух нормативов — оба показателя типовой отстойник не снимает.",
      "pH 11–12,5 от контакта с клинкером: нейтрализация ведётся углекислым газом (барботаж дымовых газов — самый дешёвый реагент на площадке) либо серной кислотой. Нейтрализация кислотой добавляет сульфаты, что при уже высоком фоне может вывести за норматив — CO₂ предпочтительнее.",
      "Отличие от карточки «Бетонный узел / цемент / ЖБИ»: там мойка миксеров с цементным молоком, которое просто отстаивается и возвращается в замес. Здесь добавляются сульфаты, высокая жёсткость и СПАВ пластификаторов — нужна реагентная ступень, а не только отстойник.",
      "Взвесь схватывается гидравлически: осадок в отстойнике твердеет за часы простоя. Отстойники проектируются двухсекционными с попеременной очисткой, скребковые механизмы — с непрерывным ходом и промывкой лотков; тонкослойные модули в этом стоке зарастают и здесь неуместны.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Cement and Lime Manufacturing",
      REF,
      "Данные экологического надзора Республики Узбекистан по АО «Бекабадцемент»",
    ],
  },
  {
    id: "cable",
    group: "heavy",
    name: L(
      "Кабельный завод (катанка, травление, эмальпровод)",
      "Kabel zavodi (mis simyo‘n, tuzlash, emal sim)",
      "Cable plant (copper rod, pickling, enamelled wire)",
      "电缆厂（铜杆、酸洗、漆包线）"
    ),
    flowHint: L(
      "0,3–2 м³ на 1 т медной катанки и жилы",
      "1 t mis simyo‘n va tomirga 0,3–2 m³",
      "0.3–2 m³ per tonne of copper rod and conductor",
      "每吨铜杆与线芯 0.3–2 m³"
    ),
    pollutants: { cod: [200, 1500], ss: [50, 400], petro: [20, 300], surf: [10, 60] },
    ph: [2.0, 9.0],
    special: [
      {
        label: "Медь (травильные и промывные воды)",
        range: [10, 500],
        unit: "мг/л",
        note: "Определяющий показатель. Медь угнетает нитрификацию уже при долях мг/л, а норматив на сбросе жёсткий (порядка 0,1–0,5 мг/л). Осаждение гидроксида при pH 8,5–9,5 доводит до единиц мг/л; ниже — только ионный обмен или сорбция. Из концентрированных травильных растворов медь выгоднее извлекать электролизом как товарный продукт.",
      },
      {
        label: "Отработанная волочильная эмульсия (по ХПК)",
        range: [20000, 80000],
        unit: "мгО/л",
        note: "В общий сток не сбрасывается: локальная ультрафильтрация или реагентная деэмульсация; пермеат идёт на общую схему, концентрат — на утилизацию.",
      },
    ],
    chain: ["avg", "oil", "neutral", "physchem", "clarify", "post", "sludge"],
    notes: [
      "Отличие от карточки «Гальваника / металлопокрытия»: здесь нет ни шестивалентного хрома, ни цианидов, поэтому не нужны линия восстановления Cr⁶⁺ и линия щелочного окисления циана. Всё сводится к одному металлу — меди, и схема заметно проще и дешевле гальванической.",
      "Три потока разделяются: концентрированные травильные растворы (на регенерацию или электролиз), промывные воды после травления (реагентное осаждение), волочильные эмульсии (локальная установка).",
      "Эмалирование даёт растворители и лаки — биорезистентная ХПК и запах. Смывы лакировочного участка собираются как отход и в сток не сбрасываются; в схему попадают только промывные воды.",
      "Медьсодержащий осадок — отход 2–3 класса с высоким содержанием меди: отдельная линия обезвоживания, паспортизация, при достаточном объёме — сдача как вторичное сырьё.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Metal, Plastic and Rubber Products Manufacturing",
      "IFC/World Bank EHS Guidelines for Base Metal Smelting and Refining",
      REF,
      ME,
    ],
  },
  {
    id: "autoplant",
    group: "heavy",
    name: L(
      "Автосборочный завод с окрасочным цехом",
      "Avtomobil yig‘uv zavodi bo‘yash sexi bilan",
      "Vehicle assembly plant with paint shop",
      "整车装配厂（含涂装车间）"
    ),
    flowHint: L(
      "1–5 м³ на 1 автомобиль; до 80 % даёт окрасочная линия",
      "bir avtomobilga 1–5 m³; 80 % gacha bo‘yash liniyasidan",
      "1–5 m³ per vehicle; up to 80 % comes from the paint line",
      "每台整车 1–5 m³；其中最多 80 % 来自涂装线"
    ),
    pollutants: { cod: [300, 2000], bod: [100, 500], ss: [100, 800], petro: [20, 200], surf: [20, 150], tp: [20, 200] },
    ph: [4.0, 11.0],
    special: [
      {
        label: "Цинк, никель, марганец (фосфатирующие растворы)",
        range: [5, 100],
        unit: "мг/л",
        note: "Смена ванны фосфатирования — залповый сброс тяжёлых металлов. Осаждение гидроксидов при pH 9–10 с последующим отстаиванием; каждый металл имеет свой оптимум pH, поэтому доза щёлочи считается по лимитирующему.",
      },
      {
        label: "Лакокрасочная взвесь гидрофильтров (по взвешенным)",
        range: [500, 5000],
        unit: "мг/л",
        note: "Шламовые воды окрасочных камер с растворителями и пигментами. Обрабатываются в контуре камеры коагулянтом-денатуратором краски, всплывший шлам снимается; на общие очистные идёт только продувка контура.",
      },
    ],
    chain: ["screen", "avg", "neutral", "physchem", "daf", "bio", "clarify", "post", "sludge"],
    notes: [
      "Автопром даёт 28,8 % продукции свободных экономических зон, в Джизаке строится BYD Uzbekistan Factory — очистные таких площадок считаются сразу на проектную мощность сборки, а не на первую очередь.",
      "Определяющий показатель — фосфор: фосфатирование даёт залповый сброс фосфатов на порядок выше бытового стока. Биологическое удаление фосфора здесь бесполезно, работает только реагентное осаждение солями железа или извести с контролем остаточного фосфора на выходе.",
      "Катафорезный грунт (KTL): ультрафильтрат ванны возвращается на промывку в противотоке, в сток уходит только последняя ступень промывки. Если схему противотока не заложить, расход и нагрузка вырастают в разы.",
      "Обезжиривание щёлочью и эмульсиями даёт pH до 11 и стойкую пену: нейтрализация и флотация ставятся ДО биологии, иначе аэротенк вспенивается и ил выносится.",
      "Биологическая ступень здесь нужна, но только как добивающая: она принимает уже обезметалленный и обезжиренный сток. Подача металлов на ил недопустима — цинк и никель подавляют нитрификацию.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Metal, Plastic and Rubber Products Manufacturing",
      REF,
      ME,
    ],
  },
  {
    id: "pharma",
    group: "heavy",
    name: L(
      "Фармацевтический завод",
      "Farmatsevtika zavodi",
      "Pharmaceutical plant",
      "制药厂"
    ),
    flowHint: L(
      "по паспортам линий; цех готовых форм 5–50 м³/сут, синтез субстанций — до 100 м³ на 1 т продукта",
      "liniya pasportlari bo‘yicha; tayyor dori sexi 5–50 m³/kun, substansiya sintezi — 1 t mahsulotga 100 m³ gacha",
      "per line data sheets; finished-dosage shop 5–50 m³/day, API synthesis up to 100 m³ per tonne of product",
      "按生产线资料；制剂车间 5–50 m³/日，原料药合成每吨产品最高 100 m³"
    ),
    pollutants: { cod: [400, 20000], bod: [100, 5000], ss: [50, 1500], tn: [10, 300], tp: [1, 50], surf: [10, 100] },
    ph: [3.0, 12.0],
    chain: ["screen", "avg", "neutral", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Разброс по ХПК на порядки (по выборке из 50 предприятий — от 400 до 62 000 мгО/л) не ошибка справочника, а свойство отрасли: цех готовых форм и синтез субстанций различаются в сто раз. Средние диапазоны годятся только для предварительной прикидки, рабочий проект — исключительно по анализу усреднённой суточной пробы.",
      "Отношение ХПК/БПК₅ выше 3 означает, что сток биологически не разлагается: растворители дают стойкую ХПК, которая проходит аэротенк насквозь. При таком соотношении реагентная ступень и сорбция ставятся обязательно, при ХПК/БПК₅ ниже 2 достаточно биологии.",
      "Антибиотики и биоактивные вещества подавляют нитрификацию раньше, чем окисление органики: аммоний в очищенной воде растёт при формально нормальной БПК. Потоки от участков антибиотиков собираются отдельно и обезвреживаются локально; сброс их в общий коллектор дополнительно формирует антибиотикорезистентность в иле.",
      "Залповые мойки CIP с дезсредствами и щелочью дают pH от 3 до 12 в течение смены. Усреднитель считается не менее чем на суточный цикл со станцией нейтрализации и обязательным перемешиванием — иначе биология не выживает.",
      "Концентрат установок воды для инъекций (WFI) и обратного осмоса в общий сток не сбрасывается: это солевой поток, который сбивает работу ила; направляется отдельно.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Pharmaceuticals and Biotechnology Manufacturing (2007)",
      "Veolia Water Technologies. Pharmaceutical Manufacturing Wastewater Treatment Guide (2020) — статистика по 50 предприятиям: ХПК 400–62 000, ВВ 10–4500, TKN 0–300, P 0–50 мг/л, pH 3–12",
      ME,
      REF,
    ],
  },

  /* ==================== АГРОПРОМЫШЛЕННЫЕ ОБЪЕКТЫ (agro) ==================== */
  {
    id: "cattle-farm",
    group: "agro",
    name: L(
      "Молочно-товарная ферма / откормочный комплекс КРС",
      "Sut-tovar fermasi / qoramol boqish majmuasi",
      "Dairy farm / cattle feedlot",
      "奶牛场 / 肉牛育肥场"
    ),
    flowHint: L(
      "40–100 л на голову в сутки (смыв навоза и мойка доильного зала)",
      "kuniga bir boshga 40–100 l (go‘ngni yuvish va sog‘ish zalini yuvish)",
      "40–100 L per head per day (manure flushing and milking parlour washdown)",
      "每头每日 40–100 L（冲粪与挤奶厅冲洗）"
    ),
    pollutants: { cod: [3000, 20000], bod: [1500, 8000], ss: [2000, 15000], tn: [300, 2000], tp: [50, 500], fats: [50, 300] },
    ph: [6.5, 8.5],
    special: [
      {
        label: "Азот аммонийный N-NH₄",
        range: [200, 1500],
        unit: "мг/л",
        note: "На порядок выше бытового стока. Свободный аммиак при pH выше 8 подавляет нитрификацию: без разбавления или отдувки аэротенк не выходит на нитрификацию вообще, а потребность в кислороде вырастает в разы.",
      },
    ],
    chain: ["screen", "sand", "avg", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Масштаб задачи задан госпрограммой: 11 000 облегчённых коровников на 421 000 голов, 802 проекта на 68 000 голов КРС, импорт 100 000 племенных животных — типовые решения нужны сериями, а не поштучно.",
      "Главное правило: аэротенк на навозном стоке БЕЗ предварительного разделения твёрдой фракции не работает. Сначала шнековый или барабанный сепаратор (снимает 50–70 % взвеси и до 40 % ХПК), затем усреднение, и только потом биология. Ступени сепарации твёрдой фракции в перечне нет — она проектируется отдельно.",
      "При ХПК выше 5000 мгО/л аэробная схема экономически проигрывает: первой ступенью ставится анаэробный реактор (UASB или биогазовая установка), он снимает 70–80 % ХПК и даёт биогаз, аэротенк после него работает как доочистка. Анаэробной ступени в перечне тоже нет.",
      "Смыв идёт залпами по расписанию дойки: усреднитель считается не на часы, а на полный суточный цикл, иначе на очистные приходит весь суточный объём за два–три часа.",
      "Дезсредства и остатки антибиотиков от санобработки доильного оборудования приходят концентрированными порциями — линия мойки доильного зала подаётся в усреднитель дозированно, а не напрямую.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Mammalian Livestock Production",
      "USDA ARS. Management of Dairy Cattle Manure (Hubbard, Lowrance) — азот 1200–2900 мг/л, аммиак 780–2200 мг/л, фосфор 64–500 мг/л в навозном фильтрате",
      ME,
      REF,
    ],
  },
  {
    id: "poultry-farm",
    group: "agro",
    name: L(
      "Птицеводческий комплекс (содержание и инкубация)",
      "Parrandachilik majmuasi (saqlash va inkubatsiya)",
      "Poultry rearing and hatchery complex",
      "禽类养殖与孵化基地"
    ),
    flowHint: L(
      "1,5–4 л на голову в сутки (поение, мойка корпусов, дезинфекция)",
      "kuniga bir boshga 1,5–4 l (sug‘orish, binolarni yuvish, dezinfeksiya)",
      "1.5–4 L per bird per day (drinking spillage, house washing, disinfection)",
      "每只每日 1.5–4 L（饮水溢流、禽舍冲洗、消毒）"
    ),
    pollutants: { cod: [1500, 6000], bod: [500, 2000], ss: [150, 1500], tn: [80, 400], tp: [20, 80] },
    ph: [6.5, 8.5],
    special: [
      {
        label: "Азот аммонийный N-NH₄",
        range: [50, 300],
        unit: "мг/л",
        note: "Помёт и мочевая кислота дают аммоний, который ингибирует собственную нитрификацию: свободный аммиак 10–150 мг/л подавляет аммонийокисляющие бактерии, 0,1–1,0 мг/л — нитритокисляющие (Anthonisen). Практическое следствие — в очищенной воде накапливается НИТРИТ, а не нитрат; нужен контроль pH и ступенчатая подача.",
      },
    ],
    chain: ["screen", "avg", "physchem", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "В отрасль вложено порядка 432 млн долларов, план — плюс 100 тыс. т мяса птицы; проекты идут сериями, схема должна быть тиражируемой.",
      "Это НЕ карточка «Птицефабрика / убой птицы»: там сток убоя — жиры, кровь, перо, органика с БПК/ХПК около 0,5 и классическая схема с жироуловителем и флотацией. Здесь содержание: помёт, аммоний и дезинфекция, жиров практически нет, а лимитирующим становится азот. Схемы не заменяют друг друга.",
      "Периодическая дезинфекция корпусов формалином и хлорсодержащими средствами даёт залповую токсичность: смывы после санобработки собираются в отдельную ёмкость и подаются в усреднитель дозированно в течение нескольких суток, иначе нитрификация гибнет и восстанавливается 2–4 недели.",
      "Сток не постоянный, а привязан к циклу выращивания: полная мойка корпуса между партиями даёт залп в десятки кубометров за смену при почти нулевом притоке в остальные дни. Ёмкость усреднителя считается по циклу партии, а не по суткам.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Poultry Production",
      "LIFE ACLIMA. Treatment and reuse of cleaning water from poultry houses — БПК 564–1581, ХПК 1600–4900, ВВ 130–798, N 82–284, P 22–53 мг/л",
      "Anthonisen A.C. et al. Inhibition of nitrification by ammonia and nitrous acid (1976) — пороги ингибирования свободным аммиаком",
      REF,
    ],
  },
  {
    id: "greenhouse",
    group: "agro",
    name: L(
      "Тепличный комплекс (гидропоника, дренажные растворы)",
      "Issiqxona majmuasi (gidroponika, drenaj eritmalari)",
      "Greenhouse complex (hydroponics, drainage solution)",
      "温室园区（水培、排液）"
    ),
    flowHint: L(
      "2–6 л на 1 м² теплицы в сутки; дренаж — 20–30 % подаваемого раствора",
      "kuniga 1 m² issiqxonaga 2–6 l; drenaj — beriladigan eritmaning 20–30 %",
      "2–6 L per m² of greenhouse per day; drainage is 20–30 % of the feed solution",
      "每 m² 温室每日 2–6 L；排液为供液量的 20–30 %"
    ),
    pollutants: { tn: [90, 450], tp: [10, 100] },
    ph: [5.0, 7.0],
    special: [
      {
        label: "Электропроводность (EC)",
        range: [2, 6],
        unit: "дСм/м",
        note: "Определяющий показатель: дренаж накапливает соли до 4–6 дСм/м, после чего непригоден для рециркуляции. Снижение EC возможно только обратным осмосом или разбавлением — биологическими методами соль не убирается.",
      },
      {
        label: "Калий K⁺",
        range: [150, 600],
        unit: "мг/л",
        note: "Балластный катион питательного раствора. Не нормируется большинством нормативов на сброс, но при поливе в грунт засоляет почву — оценивается вместе с EC.",
      },
    ],
    chain: ["screen", "avg", "physchem", "post", "disinfect"],
    notes: [
      "Площадь теплиц доведена до 5 100 га, производство выросло со 110 тыс. до 546 тыс. т — объёмы дренажа стали заметными для водохозяйственного баланса регионов.",
      "Это НЕ органический сток, а СОЛЕВОЙ: БПК близка к нулю, а нитраты и фосфаты — в сотнях и десятках мг/л. Обычный аэротенк здесь бесполезен, окислять нечего; цепочка сознательно построена без ступени bio.",
      "Реальная задача — денитрификация дренажа для возврата в контур. Это аноксидный реактор с внешним источником углерода (метанол или ацетат), а не аэротенк: такой ступени в перечне нет, она проектируется отдельно. Экономика считается против стоимости удобрений, которые иначе уходят в сброс.",
      "Средства защиты растений в дренаже (особенно фунгициды) подавляют любую биологическую ступень и не задерживаются фильтрами: после обработок дренаж 3–5 суток направляется не в рециркуляцию, а на отдельное обезвреживание или сорбцию.",
      "Промывные воды капельного полива несут кислотные реагенты (азотная, ортофосфорная кислота) от промывки капельниц — это залп с pH ниже 3, отводится в усреднитель отдельной линией.",
    ],
    sources: [
      "Evaluation of the Characteristics of Pollutant Discharge in Tomato Hydroponic Wastewater, Water (MDPI) 2024, 16(5), 720 — T-N 411±123, T-P 47,7, K⁺ 400±183 мг/л, EC 4,25±1,01 дСм/м",
      "Government of Ontario. Greenhouse Wastewater Monitoring Project 2010–2011 — нитратный азот в среднем 90 (до 322) мг/л, фосфор 33,6 (до 180) мг/л, калий 180 мг/л",
      "Yara. Nutrient Solutions for Greenhouse Crops — состав питательных растворов",
    ],
  },
  {
    id: "fishfarm",
    group: "agro",
    name: L(
      "Рыбоводное хозяйство: пруды и УЗВ",
      "Baliqchilik xo‘jaligi: hovuzlar va yopiq suv ta’minoti qurilmalari",
      "Fish farm: ponds and recirculating aquaculture systems (RAS)",
      "渔业养殖：池塘与循环水养殖系统"
    ),
    flowHint: L(
      "УЗВ — подпитка 0,1–1 м³ на 1 кг корма; прудовое хозяйство — по водообмену бассейна",
      "YSTQ — 1 kg yemga 0,1–1 m³ qo‘shimcha suv; hovuz xo‘jaligi — havza suv almashinuvi bo‘yicha",
      "RAS — 0.1–1 m³ makeup per kg of feed; pond farms — per water exchange rate",
      "循环水系统——每公斤饲料补水 0.1–1 m³；池塘养殖按换水率计"
    ),
    pollutants: { cod: [10, 80], bod: [2, 20], ss: [5, 100], tn: [2, 30], tp: [0.5, 5] },
    ph: [6.5, 8.0],
    special: [
      {
        label: "Азот аммонийный (TAN) в контуре",
        range: [0.5, 3],
        unit: "мг/л",
        note: "Здесь нитрификация — ЦЕЛЬ, а не побочный эффект: TAN выше 2–3 мг/л угнетает рост и вызывает гибель рыбы. Биофильтр рассчитывается по суточной подаче корма и содержанию белка, а не по БПК.",
      },
      {
        label: "Нитриты N-NO₂",
        range: [0.1, 1],
        unit: "мг/л",
        note: "Токсичны для рыбы (метгемоглобинемия) при долях мг/л. Накопление нитрита — признак незрелого или перегруженного биофильтра; при запуске УЗВ буферится добавкой хлорида.",
      },
    ],
    chain: ["screen", "avg", "daf", "bio", "post", "disinfect", "sludge"],
    notes: [
      "В 2025 году добыто 206 тыс. т рыбы при задаче довести показатель до 500 тыс. т, при этом интенсивные методы применяют лишь около 20 % хозяйств — рынок УЗВ и водоподготовки в стране только формируется.",
      "Принципиально: это НЕ очистка сброса, а ВОДОПОДГОТОВКА В КОНТУРЕ. Вода проходит цикл десятки раз в сутки, поэтому все аппараты считаются на рециркуляционный расход (порядка 1 объёма бассейна в час), а не на подпитку. Сброс — только продувка и промывная вода фильтров.",
      "Сток обманчиво разбавленный: БПК единицы мг/л, но нагрузка на биофильтр огромна в пересчёте на объём. Проектировать по концентрациям здесь нельзя — расчёт ведётся по массе корма: примерно 30 г TAN на 1 кг корма с 40 % белка.",
      "Мелкодисперсная взвесь фекалий и несъеденного корма разрушается насосами и обычным отстойником не задерживается: первой ступенью ставится барабанный микрофильтр 40–100 мкм, затем белковый скиммер (флотация). Ступени барабанной микрофильтрации в перечне нет — она проектируется отдельно, и без неё биофильтр заиливается за недели.",
      "Лечебные обработки (формалин, перманганат, антибиотики) идут залпами и убивают нитрифицирующую плёнку биофильтра: на период лечения контур переводят на проточный режим, а сбросную воду направляют на отдельное обезвреживание.",
      "Дегазация CO₂ и донасыщение кислородом — обязательные узлы замкнутого контура, которых нет в стандартной канализационной цепочке.",
    ],
    sources: [
      "IFC/World Bank EHS Guidelines for Aquaculture",
      "Timmons M.B., Ebeling J.M. Recirculating Aquaculture (нормы качества воды УЗВ, расчёт биофильтра по подаче корма)",
      ME,
      REF,
    ],
  },
  {
    id: "apartment",
    group: "municipal",
    name: L(
      "Многоквартирный жилой дом / жилой комплекс",
      "Ko‘p qavatli turar-joy uyi / turar-joy majmuasi",
      "Apartment building / residential complex",
      "多层住宅楼 / 住宅小区"
    ),
    flowHint: L(
      `${WATER_USE_CITY.lpcd} л на жителя в сутки в городах свыше 100 тыс. чел.; ЖК на 500 квартир (≈1500 жителей) — около ${Math.round((WATER_USE_CITY.lpcd * 1500) / 1000)} м³/сут`,
      `100 ming kishidan ortiq shaharlarda kuniga bir aholiga ${WATER_USE_CITY.lpcd} l; 500 xonadonli majmua (≈1500 aholi) — taxminan ${Math.round((WATER_USE_CITY.lpcd * 1500) / 1000)} m³/kun`,
      `${WATER_USE_CITY.lpcd} L per resident per day in cities over 100 000; a 500-flat complex (≈1500 residents) is about ${Math.round((WATER_USE_CITY.lpcd * 1500) / 1000)} m³/day`,
      `10 万人以上城市每人每日 ${WATER_USE_CITY.lpcd} L；500 户小区（约 1500 人）约 ${Math.round((WATER_USE_CITY.lpcd * 1500) / 1000)} m³/日`
    ),
    pollutants: {
      cod: domRange("cod"),
      bod: domRange("bod5"),
      ss: domRange("ss"),
      fats: domRange("fats"),
      tn: domRange("nh4N"),
      tp: domRange("pTotal"),
      surf: domRange("surfactants"),
    },
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "sand", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Расход считается от числа жителей, а не от числа квартир: принимается ${gf(2.8, 1)}–${gf(3.2, 1)} чел. на квартиру (уточняется по проекту застройщика), далее по ${kmkRef("2.9", "табл. 3")} — ${WATER_USE_CITY.lpcd} л/(чел·сут) для города свыше 100 тыс. чел. и ${WATER_USE_TOWN.lpcd} л/(чел·сут) для райцентра. Состав стока — по ${kmkRef("6.4", "табл. 25")}.`,
      "Главная ошибка при проектировании ЖК — считать очистные сразу на полную заселённость. Дом сдаётся очередями и заселяется 1,5–3 года: в первый год приток бывает 10–30 % проектного, ил на таком расходе не нарастает и вымывается. Очистные проектируются секциями, вводимыми по мере заселения, либо биология принимается на прикреплённой биоплёнке (MBBR), которая переносит недогрузку.",
      "Встроенные помещения первых этажей (кафе, пекарня, аптека, салон, прачечная самообслуживания) дают сток, который к бытовому не относится: жиры от общепита в сотнях мг/л и СПАВ от прачечной. На каждое такое помещение ставится локальный жироуловитель или песко-жироуловитель до врезки в домовую сеть — иначе жир выпадает в подводящем коллекторе и в приёмной камере.",
      "Подземный паркинг: стоки от мойки полов и таяния снега с машин несут нефтепродукты и песок и в бытовую канализацию не направляются. Это отдельная линия с песко-нефтеуловителем (см. карточку «Автомойка»); объединять её с хозбытовым стоком до биологии нельзя — нефтепродукты подавляют ил.",
      `Неравномерность притока для одного дома выше табличной: утренний и вечерний пики дают 3–4 средних часа, ночью приток почти нулевой. Коэффициент по ${kmkRef("2.7", "табл. 2")} при среднем расходе менее ${T2_FIRST.averageLps} л/с не определён и берётся по КМК 2.04.01-98 (прим. 2) — усреднитель обязателен.`,
    ],
    sources: [KMK_DOMESTIC, `${KMK_2_04_03_19_DOC.code}, п. 2.7, табл. 2 (неравномерность)`, "число жителей на квартиру — проектные данные застройщика, нормативом не задано"],
  },
  {
    id: "cottage-village",
    group: "municipal",
    name: L(
      "Коттеджный посёлок / таунхаусы",
      "Kottejlar posyolkasi / taunxauslar",
      "Cottage village / townhouses",
      "别墅区 / 联排住宅"
    ),
    flowHint: L(
      "0,6–1,2 м³/сут на дом (3–4 жителя); посёлок на 100 домов — 60–120 м³/сут",
      "bir uyga 0,6–1,2 m³/kun (3–4 kishi); 100 uyli posyolka — 60–120 m³/kun",
      "0.6–1.2 m³/day per house (3–4 residents); a 100-house village is 60–120 m³/day",
      "每户 0.6–1.2 m³/日（3–4 人）；100 户约 60–120 m³/日"
    ),
    pollutants: {
      cod: domRange("cod"),
      bod: domRange("bod5"),
      ss: domRange("ss"),
      fats: domRange("fats"),
      tn: domRange("nh4N"),
      tp: domRange("pTotal"),
      surf: domRange("surfactants"),
    },
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      "Малоэтажная застройка почти всегда вне централизованной канализации: очистные посёлка — единственный вариант сброса, и их отказ останавливает жизнь посёлка целиком. Резервирование воздуходувок и насосов по схеме «рабочий + резервный» здесь не запас, а обязательное условие.",
      `Сеть длинная и малонаполненная: при 100 домах средний расход около 1 л/с, а самотёчные коллекторы рассчитываются на минимальную скорость ${gf(0.7, 1)} м/с по ${kmkRef("2.34", "табл. 16")}. При таком расходе скорость не набирается, и сток загнивает в трубе — на очистные приходит анаэробная вода с сероводородом. Отсюда: минимальные диаметры, промывные камеры в начале участков и запас по коррозионной стойкости приёмной камеры.`,
      "Заселение растянуто на годы, а зимой в дачном формате часть домов пустует — приток падает в 3–5 раз. Взвешенный ил такой режим не переносит, биоплёнка на носителе переносит.",
      "Жиры выше, чем в многоквартирном доме: в частных домах готовят дома и чаще, а домовых жироуловителей нет. Жироуловитель ставится на общем притоке перед усреднителем.",
      "Санитарно-защитная зона — самое узкое место: очистное стоит среди жилых участков. Сооружения принимаются закрытыми, с перекрытием и вытяжкой на биофильтр или сорбент; открытые иловые площадки в коттеджном посёлке не проектируются, осадок вывозится обезвоженным.",
    ],
    sources: [KMK_DOMESTIC, `${KMK_2_04_03_19_DOC.code}, п. 2.34, табл. 16 (минимальные скорости); табл. 1 (санитарно-защитные зоны)`, "число жителей на дом — проектные данные, нормативом не задано"],
  },
  {
    id: "private-house",
    group: "municipal",
    name: L(
      "Индивидуальный жилой дом / дача",
      "Yakka tartibdagi turar-joy uyi / dala hovli",
      "Single-family house / country house",
      "独户住宅 / 别院"
    ),
    flowHint: L(
      "0,6–1,5 м³/сут на дом; 150–200 л на жителя в сутки при водопроводе и канализации с ванной",
      "bir uyga 0,6–1,5 m³/kun; vodoprovod va vannali kanalizatsiyada bir aholiga kuniga 150–200 l",
      "0.6–1.5 m³/day per house; 150–200 L per resident with running water and a bathroom",
      "每户 0.6–1.5 m³/日；有给水和带浴室排水时每人每日 150–200 L"
    ),
    pollutants: {
      cod: [Math.round(DOM_HI.cod), Math.round(DOM_HI.cod * 1.6)],
      bod: [Math.round(DOM_HI.bod5), Math.round(DOM_HI.bod5 * 1.6)],
      ss: [Math.round(DOM_HI.ss), Math.round(DOM_HI.ss * 1.6)],
      fats: [Math.round(DOM_HI.fats), Math.round(DOM_HI.fats * 1.6)],
      tn: [Math.round(DOM_HI.nh4N), Math.round(DOM_HI.nh4N * 1.6)],
      tp: [Math.round(DOM_HI.pTotal), Math.round(DOM_HI.pTotal * 1.6)],
      surf: [Math.round(DOM_HI.surfactants), Math.round(DOM_HI.surfactants * 1.6)],
    },
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Концентрации выше, чем в городском стоке, и это не ошибка: нагрузка на жителя по ${kmkRef("6.4", "табл. 25")} одна и та же, а воды в частном доме расходуется меньше — при 150–110 л/(чел·сут) вместо ${WATER_USE_CITY.lpcd} те же граммы дают в полтора раза большую концентрацию. Верхняя граница диапазона соответствует примерно 110 л/(чел·сут).`,
      "Расход настолько мал, что понятия «средний час» не существует: весь суточный объём уходит четырьмя-пятью залпами (душ, стиральная машина, посудомойка). Ни одно сооружение проточного типа при таком режиме не работает — принимается либо септик с почвенной доочисткой, либо установка периодического действия (SBR), где залп принимается в объём цикла.",
      "Стиральная машина даёт залп 40–60 л с высоким СПАВ и температурой 40–60 °C за 10 минут. Для установки на 1 м³/сут это 5 % суточного объёма разом — отсюда обязательный приёмный объём перед биологией.",
      "Дача работает сезонно: зимой приток нулевой месяцами. Ил погибает, и весной установка запускается заново 3–4 недели. Проектировщик обязан предупредить об этом заказчика письменно и заложить возможность консервации, а не делать вид, что установка круглогодичная.",
      "Сброс после такой установки почти всегда идёт не в водоём, а в грунт — в фильтрующий колодец или поле фильтрации. Их площадь считается по фильтрационной способности грунта и уровню грунтовых вод, а не по расходу: без данных изысканий эту часть проекта закрывать нельзя.",
    ],
    sources: [
      KMK_DOMESTIC,
      "верхняя граница диапазона — пересчёт нагрузки табл. 25 на пониженное водопотребление 110 л/(чел·сут); само пониженное водопотребление ҚМҚ 2.04.03-19 не задаёт (табл. 3 начинается с населённых пунктов), принято по практике SUVSANOAT",
      "КМК 2.04.03-97 и КМК 2.04.01-98 — сооружения подземной фильтрации; действующим ҚМҚ 2.04.03-19 малые автономные объекты не нормируются",
    ],
  },
  {
    id: "mahalla",
    group: "municipal",
    name: L(
      "Махаллинский квартал / кишлак вне канализации",
      "Mahalla / markazlashtirilgan kanalizatsiyasiz qishloq",
      "Mahalla district / village without sewerage",
      "马哈拉社区 / 无排水管网的村庄"
    ),
    flowHint: L(
      `${WATER_USE_TOWN.lpcd} л на жителя в сутки для райцентров и посёлков до 50 тыс. чел.; квартал на 2000 жителей — около ${Math.round((WATER_USE_TOWN.lpcd * 2000) / 1000)} м³/сут`,
      `50 ming kishigacha tuman markazlari va posyolkalarda kuniga bir aholiga ${WATER_USE_TOWN.lpcd} l; 2000 aholili mahalla — taxminan ${Math.round((WATER_USE_TOWN.lpcd * 2000) / 1000)} m³/kun`,
      `${WATER_USE_TOWN.lpcd} L per resident per day for district centres and towns under 50 000; a 2000-resident district is about ${Math.round((WATER_USE_TOWN.lpcd * 2000) / 1000)} m³/day`,
      `5 万人以下城镇每人每日 ${WATER_USE_TOWN.lpcd} L；2000 人社区约 ${Math.round((WATER_USE_TOWN.lpcd * 2000) / 1000)} m³/日`
    ),
    pollutants: {
      cod: [Math.round(DOM_HI.cod), Math.round(DOM_HI.cod * 1.5)],
      bod: [Math.round(DOM_HI.bod5), Math.round(DOM_HI.bod5 * 1.5)],
      ss: [Math.round(DOM_HI.ss), Math.round(DOM_HI.ss * 1.5)],
      fats: [Math.round(DOM_HI.fats), Math.round(DOM_HI.fats * 1.5)],
      tn: [Math.round(DOM_HI.nh4N), Math.round(DOM_HI.nh4N * 1.5)],
      tp: [Math.round(DOM_HI.pTotal), Math.round(DOM_HI.pTotal * 1.5)],
      surf: [Math.round(DOM_HI.surfactants), Math.round(DOM_HI.surfactants * 1.5)],
    },
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "sand", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      `Централизованной канализацией в стране охвачено около 21 % населения — для махалли и кишлака локальные очистные это норма, а не исключение. Удельное водоотведение по ${kmkRef("2.9", "табл. 3")} для таких населённых пунктов ${WATER_USE_TOWN.lpcd} л/(чел·сут), и охват канализацией в самой таблице оговорён как 15–30 %: подключается не весь квартал сразу, и расчётное число жителей берётся по фактическому охвату, а не по прописке.`,
      "Концентрации выше городских: при том же приходящемся на жителя грузе (табл. 25) вода расходуется экономнее, а летом часть её уходит на полив и во двор, не попадая в канализацию. Верхняя граница диапазона отвечает примерно 115 л/(чел·сут).",
      "Летняя температура стока доходит до 28–30 °C. Растворимость кислорода при этом падает примерно на четверть, и воздуходувка, подобранная по расчёту при 20 °C, недодаёт кислород именно в самый нагруженный сезон — расход воздуха проверяется на летнюю температуру.",
      "Смыв со двора и из арыка попадает в ту же сеть: приходит песок, глина и растительные остатки. Песколовка обязательна даже при малом расходе, а решётка принимается с ручной очисткой и запасом по прозорам.",
      "Домашний скот во дворах даёт залповые поступления навозной воды с аммонийным азотом в сотни мг/л. Если в квартале держат скот, это оговаривается с заказчиком отдельно: такой залп подавляет нитрификацию, и биология считается уже не как бытовая.",
    ],
    sources: [
      KMK_DOMESTIC,
      `${KMK_2_04_03_19_DOC.code}, п. 2.9, табл. 3, поз. 3.1 — 15–30 % охват канализацией на 2035 г.`,
      "верхняя граница диапазона — пересчёт нагрузки табл. 25 на 115 л/(чел·сут); принято по практике SUVSANOAT",
      "охват централизованной канализацией около 21 % населения — Gazeta.uz, 18.03.2025",
    ],
  },
  {
    id: GENERIC_INDUSTRY_ID,
    group: "generic",
    name: L(
      "Объекта нет в списке / смешанный сток",
      "Obyekt ro‘yxatda yo‘q / aralash oqova",
      "Facility not in the list / mixed wastewater",
      "对象不在列表中 / 混合污水"
    ),
    flowHint: L(
      "расход и состав стока задаются проектировщиком",
      "sarf va oqova tarkibi loyihachi tomonidan beriladi",
      "the flow and the composition are defined by the designer",
      "流量与水质由设计人员确定"
    ),
    /* пусто: подставлять нечего — все показатели вводит пользователь */
    pollutants: {},
    ph: [BIO_INLET_LIMITS.phMin, BIO_INLET_LIMITS.phMax],
    chain: ["screen", "sand", "avg", "bio", "clarify", "post", "disinfect", "sludge"],
    notes: [
      L(
        "Состав стока задан пользователем, отраслевой аналог не применялся. Перед рабочим проектированием обязателен анализ усреднённой суточной пробы.",
        "Oqova tarkibi foydalanuvchi tomonidan berilgan, tarmoq analogi qo‘llanilmadi. Ishchi loyihalashdan oldin o‘rtacha sutkalik namuna tahlili shart.",
        "The composition is user-defined; no industry analogue was applied. A composite 24-hour sample analysis is mandatory before detailed design.",
        "水质由用户填写，未套用行业类比值。施工图设计前必须做 24 小时混合样化验。"
      ),
      L(
        `Принята базовая полная схема механической и биологической очистки с доочисткой, обеззараживанием и обработкой осадка. Условия входа в биологическую очистку — ${kmkRef("6.2")}: pH ${BIO_INLET_LIMITS.phMin}–${BIO_INLET_LIMITS.phMax}.`,
        `Mexanik va biologik tozalashning to‘liq asosiy sxemasi qo‘shimcha tozalash, zararsizlantirish va cho‘kindini qayta ishlash bilan qabul qilindi. Biologik tozalashga kirish shartlari — ${kmkRef("6.2")}: pH ${BIO_INLET_LIMITS.phMin}–${BIO_INLET_LIMITS.phMax}.`,
        `The full default train of mechanical and biological treatment with polishing, disinfection and sludge handling is assumed. Biological treatment inlet conditions — ${kmkRef("6.2")}: pH ${BIO_INLET_LIMITS.phMin}–${BIO_INLET_LIMITS.phMax}.`,
        `采用机械＋生物处理并含深度处理、消毒与污泥处理的完整基础流程。生物段进水条件按 ${kmkRef("6.2")}：pH ${BIO_INLET_LIMITS.phMin}–${BIO_INLET_LIMITS.phMax}。`
      ),
    ],
    sources: [
      L(
        `состав стока задаётся пользователем; ${KMK_2_04_03_19_DOC.code} отраслевые концентрации не нормирует`,
        `oqova tarkibi foydalanuvchi tomonidan beriladi; ${KMK_2_04_03_19_DOC.code} tarmoq konsentratsiyalarini me’yorlamaydi`,
        `the composition is user-defined; ${KMK_2_04_03_19_DOC.code} does not codify industry concentrations`,
        `水质由用户填写；${KMK_2_04_03_19_DOC.code} 未规定行业浓度值`
      ),
    ],
  },
];

/** Позиция «объекта нет в списке»: выбирается отдельно, в группы не входит. */
export function isGenericIndustry(id: string): boolean {
  return id === GENERIC_INDUSTRY_ID;
}

export function findIndustry(id: string): Industry | undefined {
  return INDUSTRIES.find((item) => item.id === id);
}

/** Середина справочного диапазона — значение по умолчанию без лаборатории */
export function defaultValue(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2);
}
