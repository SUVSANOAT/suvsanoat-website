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
    name: L("Посёлок / жилой комплекс", "Posyolka / turar-joy majmuasi", "Settlement / residential complex", "居民点 / 住宅小区"),
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
