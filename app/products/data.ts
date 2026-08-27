/* --------------------------------------------------------------
 * АССОРТИМЕНТ SUVSANOAT — единый источник данных
 *
 * Добавили модель сюда — автоматически появилась страница,
 * запись в sitemap.xml и разметка для поисковых систем.
 * Числовые параметры рассчитаны, не взяты произвольно:
 * время пребывания, нагрузка на зеркало и объём накопления жира
 * проверены по EN 1825-2 и по скорости всплытия (Стокс).
 * -------------------------------------------------------------- */

import type { Language } from "../translations";

export type LineKey = "grease-traps" | "oil-separators";

export type Model = {
  slug: string;
  code: string;
  line: LineKey;
  /** расчётный расход, м³/ч */
  q: number;
  /** номинальный расход NS, л/с — для сепараторов по EN 858-2 */
  ns?: number;
  /** габариты корпуса, мм */
  length: number;
  width: number;
  height: number;
  /** объёмы, м³ */
  volumeGross: number;
  volumeWork: number;
  /** время пребывания, мин */
  retention: number;
  /** площадь зеркала, м² */
  area: number;
  /** гидравлическая нагрузка, м/ч и мм/с */
  load: number;
  loadMm: number;
  /** объём накопления уловленного продукта (жир, нефтепродукт), м³ */
  fat: number;
  /** объём приёмно-шламовой зоны, м³ */
  sludge: number;
  /** толщина ламината, мм */
  laminate: number;
  /** масса сухая, кг */
  mass: number;
  /** присоединение, DN */
  dn: number;
  /** количество люков */
  hatches: number;
};

export const MODELS: Model[] = [
  {
    slug: "zhir-1",
    code: "ЖИР-1",
    line: "grease-traps",
    q: 1,
    length: 1500, width: 900, height: 1200,
    volumeGross: 1.62, volumeWork: 1.35, retention: 81,
    area: 1.35, load: 0.74, loadMm: 0.21,
    fat: 0.27, sludge: 0.41,
    laminate: 6, mass: 110, dn: 110, hatches: 2,
  },
  {
    slug: "zhir-2",
    code: "ЖИР-2",
    line: "grease-traps",
    q: 2,
    length: 2000, width: 1100, height: 1400,
    volumeGross: 3.08, volumeWork: 2.64, retention: 79,
    area: 2.2, load: 0.91, loadMm: 0.25,
    fat: 0.44, sludge: 0.79,
    laminate: 7, mass: 195, dn: 110, hatches: 2,
  },
  {
    slug: "zhir-3",
    code: "ЖИР-3",
    line: "grease-traps",
    q: 3,
    length: 2500, width: 1400, height: 1400,
    volumeGross: 4.9, volumeWork: 4.2, retention: 84,
    area: 3.5, load: 0.86, loadMm: 0.24,
    fat: 0.7, sludge: 1.26,
    laminate: 7, mass: 262, dn: 110, hatches: 3,
  },
  {
    slug: "zhir-5",
    code: "ЖИР-5",
    line: "grease-traps",
    q: 5,
    length: 3000, width: 1800, height: 1500,
    volumeGross: 8.1, volumeWork: 7.02, retention: 84,
    area: 5.4, load: 0.93, loadMm: 0.26,
    fat: 1.08, sludge: 2.11,
    laminate: 7, mass: 367, dn: 160, hatches: 3,
  },
  {
    slug: "zhir-8",
    code: "ЖИР-8",
    line: "grease-traps",
    q: 8,
    length: 4000, width: 2100, height: 1600,
    volumeGross: 13.44, volumeWork: 11.76, retention: 88,
    area: 8.4, load: 0.95, loadMm: 0.26,
    fat: 1.68, sludge: 3.53,
    laminate: 8, mass: 586, dn: 160, hatches: 4,
  },
  {
    slug: "zhir-12",
    code: "ЖИР-12",
    line: "grease-traps",
    q: 12,
    length: 5000, width: 2600, height: 1700,
    volumeGross: 22.1, volumeWork: 19.5, retention: 98,
    area: 13.0, load: 0.92, loadMm: 0.26,
    fat: 2.6, sludge: 5.85,
    laminate: 8, mass: 823, dn: 200, hatches: 4,
  },
  /* ---------------- НЕФТЕУЛОВИТЕЛИ ----------------
     Расчёт: скорость всплытия капли по Стоксу.
     d = 100 мкм, ро_н = 850 кг/м3, T = 15 C -> v = 2,58 м/ч.
     Эффективная площадь набирается коалесцентно-ламельным пакетом
     (шаг 20 мм, угол 60 гр -> 25 м2 на 1 м3 пакета), запас 1,5.
     Удельная нагрузка по всему ряду 1,72 м/ч.
     Приёмно-шламовая камера 200 л на 1 л/с, сбор нефтепродуктов 15 л на 1 л/с. */
  {
    slug: "nef-1-5",
    code: "НЕФ-1,5",
    line: "oil-separators",
    q: 5.4, ns: 1.5,
    length: 1250, width: 800, height: 1300,
    volumeGross: 1.3, volumeWork: 1.0, retention: 11,
    area: 3.1, load: 1.72, loadMm: 0.48,
    fat: 0.02, sludge: 0.3,
    laminate: 6, mass: 100, dn: 110, hatches: 1,
  },
  {
    slug: "nef-3",
    code: "НЕФ-3",
    line: "oil-separators",
    q: 10.8, ns: 3,
    length: 1350, width: 900, height: 1400,
    volumeGross: 1.7, volumeWork: 1.34, retention: 7,
    area: 6.3, load: 1.72, loadMm: 0.48,
    fat: 0.04, sludge: 0.6,
    laminate: 6, mass: 120, dn: 160, hatches: 1,
  },
  {
    slug: "nef-6",
    code: "НЕФ-6",
    line: "oil-separators",
    q: 21.6, ns: 6,
    length: 1650, width: 1100, height: 1550,
    volumeGross: 2.81, volumeWork: 2.27, retention: 6,
    area: 12.6, load: 1.72, loadMm: 0.48,
    fat: 0.09, sludge: 1.2,
    laminate: 7, mass: 195, dn: 200, hatches: 2,
  },
  {
    slug: "nef-10",
    code: "НЕФ-10",
    line: "oil-separators",
    q: 36, ns: 10,
    length: 2100, width: 1300, height: 1650,
    volumeGross: 4.5, volumeWork: 3.69, retention: 6,
    area: 20.9, load: 1.72, loadMm: 0.48,
    fat: 0.15, sludge: 2,
    laminate: 7, mass: 265, dn: 250, hatches: 2,
  },
  {
    slug: "nef-15",
    code: "НЕФ-15",
    line: "oil-separators",
    q: 54, ns: 15,
    length: 2550, width: 1500, height: 1750,
    volumeGross: 6.69, volumeWork: 5.55, retention: 6,
    area: 31.4, load: 1.72, loadMm: 0.48,
    fat: 0.22, sludge: 3,
    laminate: 8, mass: 390, dn: 315, hatches: 2,
  },
  {
    slug: "nef-20",
    code: "НЕФ-20",
    line: "oil-separators",
    q: 72, ns: 20,
    length: 2900, width: 1700, height: 1800,
    volumeGross: 8.87, volumeWork: 7.39, retention: 6,
    area: 41.8, load: 1.72, loadMm: 0.48,
    fat: 0.3, sludge: 4,
    laminate: 8, mass: 470, dn: 355, hatches: 3,
  },
];

/**
 * Данные для серверных метаданных и разметки поисковых систем.
 * Живут отдельно от TEXT, потому что metadata собирается на сервере
 * и языкового контекста там нет — страница выдаётся на русском.
 */
export type LineSeo = {
  noun: string;
  category: string;
  unit: string;
  material: string;
  short: string;
};

export const LINE_SEO: Record<LineKey, LineSeo> = {
  "grease-traps": {
    noun: "Жироуловитель",
    category: "Жироуловители",
    unit: "м³/ч",
    material: "Стеклопластик",
    short: "жироуловитель",
  },
  "oil-separators": {
    noun: "Нефтеуловитель",
    category: "Нефтеуловители",
    unit: "л/с",
    material: "Стеклопластик",
    short: "нефтеуловитель",
  },
};

/** Иконка линейки (имя из app/components/EquipIcon.tsx) */
export const LINE_ICON: Record<LineKey, string> = {
  "grease-traps": "grit",
  "oil-separators": "lamella",
};

/** Главный размерный признак модели для заголовков (рус.) */
export const modelSize = (model: Model) =>
  model.ns !== undefined
    ? `${String(model.ns).replace(".", ",")} л/с`
    : `${String(model.q).replace(".", ",")} м³/ч`;

export const findModel = (slug: string) =>
  MODELS.find((model) => model.slug === slug);

export const lineModels = (line: LineKey) =>
  MODELS.filter((model) => model.line === line);

/* --------------------------------------------------------------
 * ТЕКСТЫ
 * Числа лежат выше и от языка не зависят — переводить нужно
 * только подписи и описания, поэтому объём перевода небольшой.
 * -------------------------------------------------------------- */

export type SpecLabels = {
  q: string;
  ns: string;
  size: string;
  volumeGross: string;
  volumeWork: string;
  retention: string;
  area: string;
  load: string;
  fat: string;
  sludge: string;
  material: string;
  laminate: string;
  mass: string;
  dn: string;
  hatches: string;
  vent: string;
  power: string;
  install: string;
};

export type LineText = {
  name: string;
  /** подписи, которые отличаются от общих для этой линейки */
  labels?: Partial<SpecLabels>;
  tagline: string;
  intro: string[];
  forWhom: { title: string; text: string }[];
  includes: string[];
  notIncluded: string[];
  limits: { title: string; text: string }[];
  useTitle: string;
  limitsTitle: string;
  includesTitle: string;
  notIncludedTitle: string;
  howToChoose: string;
  materialValue: string;
  ventValue: string;
  powerValue: string;
  installValue: string;
  modelWord: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  priceLabel: string;
  priceText: string;
  tableTitle: string;
  specsTitle: string;
  allModels: string;
  backToLine: string;
};

export type ProductsText = {
  label: string;
  navLabel: string;
  teaserTitle: string;
  teaserText: string;
  teaserButton: string;
  title: string;
  intro: string;
  specLabels: SpecLabels;
  lines: Record<LineKey, LineText>;
};

export const TEXT: Record<Language, ProductsText> = {
  ru: {
    label: "АССОРТИМЕНТ",
    navLabel: "Ассортимент",
    teaserTitle: "Модели\nи параметры.",
    teaserText: "Типоразмерные ряды с полными техническими характеристиками: габариты, рабочий объём, время пребывания, присоединительные размеры и масса. По каждой модели — отдельная страница.",
    teaserButton: "СМОТРЕТЬ АССОРТИМЕНТ",
    title: "Оборудование\nсобственного производства.",
    intro:
      "Типоразмерные ряды рассчитаны по нормам и проверены по гидравлике. Каждая модель — не «примерно такой размер», а результат расчёта: время пребывания, нагрузка на зеркало и объём накопления проверены для всего ряда.",
    specLabels: {
      q: "Расчётный расход",
      ns: "Номинальный расход NS",
      size: "Габариты (Д × Ш × В)",
      volumeGross: "Геометрический объём",
      volumeWork: "Рабочий объём",
      retention: "Время пребывания",
      area: "Площадь зеркала",
      load: "Гидравлическая нагрузка",
      fat: "Объём накопления жира",
      sludge: "Приёмно-шламовая зона",
      material: "Материал корпуса",
      laminate: "Толщина ламината",
      mass: "Масса сухая",
      dn: "Присоединение вход / выход",
      hatches: "Количество люков",
      vent: "Вентиляция",
      power: "Потребление электроэнергии",
      install: "Способ установки",
    },
    lines: {
      "grease-traps": {
        name: "Жироуловители",
        tagline:
          "Отделение жиров и пищевых отходов из стоков кухни до сброса в коммунальную канализацию",
        intro: [
          "Сточные воды кухни содержат жиры животного и растительного происхождения, пищевые отходы и моющие средства. При остывании жир застывает на стенках трубопроводов и в городской сети, что приводит к засорам, авариям и претензиям со стороны водоканала.",
          "Жироуловитель ставится на выпуске кухни до присоединения к коммунальной канализации. Работает самотёком: ни насосов, ни электропитания, ни автоматики.",
          "Главная сложность на кухне ресторана — не грязь, а температура. Стоки фритюрниц, пароконвектоматов и посудомоечных машин имеют 45–60 °C, при которой жир остаётся жидким и не всплывает. Он поднимается только после остывания примерно до 30 °C. Поэтому весь ряд рассчитан на время пребывания не менее 79 минут — этого хватает и на остывание, и на разделение.",
        ],
        forWhom: [
          { title: "Рестораны и кафе", text: "Кухня полного цикла с фритюром и посудомоечной машиной." },
          { title: "Фудкорты и столовые", text: "Несколько кухонь на один выпуск, повышенный залповый сброс." },
          { title: "Пекарни и кондитерские", text: "Стоки с высоким содержанием растительных жиров." },
          { title: "Мясные и рыбные цеха", text: "Животные жиры, высокая доля взвешенных веществ." },
          { title: "Гостиницы", text: "Ресторан при гостинице, банкетные залы." },
          { title: "Пищевые производства", text: "Технологические стоки цехов переработки." },
        ],
        includes: [
          "Корпус из стеклопластика с рёбрами жёсткости",
          "Внутренние полупогружные перегородки",
          "Успокоитель входного потока и выходной сифон",
          "Съёмная корзина для пищевых отходов, нерж. AISI 304",
          "Горловины и крышки по количеству люков",
          "Присоединительные патрубки с уплотнительными манжетами",
          "Вентиляционный стояк с дефлектором",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная подготовка и обетонирование корпуса",
          "Железобетонная разгрузочная плита при установке под проездом",
          "Наружные сети канализации до и после изделия",
          "Ёмкость для отработанного фритюрного масла",
          "Периодическая откачка жировой массы и шлама",
        ],
        limits: [
          {
            title: "Эмульгированный жир гравитацией не разделяется",
            text: "Моющие средства и гели для посуды переводят жир в эмульсию, которая проходит установку насквозь. Это свойство физики процесса, а не конструкции изделия.",
          },
          {
            title: "Норматив 1,0 мг/л недостижим гравитационным способом",
            text: "Постановление КМ РУз № 11 от 03.02.2010 нормирует жиры на уровне 1,0 мг/л. Ни один гравитационный жироуловитель — ни отечественный, ни импортный — этого значения не даёт. Для единиц мг/л нужна напорная флотация.",
          },
          {
            title: "Отработанное масло сливать нельзя",
            text: "Фритюрное масло выводит установку из строя за одну–две недели. Для него нужна отдельная ёмкость и договор на вывоз.",
          },
          {
            title: "Биопрепараты запрещены",
            text: "Ферменты и эмульгаторы «для растворения жира» не удаляют жир, а гонят его дальше в городскую сеть, где он застывает.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Модель подбирается по пиковому расходу стока кухни, а не по числу посадочных мест. Пиковый расход определяется составом технологического оборудования: моек, посудомоечных машин, пароконвектоматов. Пришлите перечень оборудования — подберём типоразмер и дадим исполнительную схему для строителей.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором",
        powerValue: "отсутствует, работа самотёком",
        installValue: "подземная, в бетонной обойме",
        modelWord: "Жироуловитель",
        ctaTitle: "Подберём типоразмер\nпод ваш объект.",
        ctaText:
          "Пришлите перечень кухонного оборудования и отметку канализации в точке врезки. Вернём подбор модели, стоимость и исполнительную схему для строительной части.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от комплектации, класса нагрузки на люки и объёма монтажных работ. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      "oil-separators": {
        name: "Нефтеуловители",
        labels: {
          area: "Эффективная площадь сепарации",
          load: "Удельная нагрузка",
          fat: "Объём накопления нефтепродуктов",
          sludge: "Приёмно-шламовая камера",
        },
        tagline:
          "Отделение нефтепродуктов и взвеси от стоков автомоек, АЗС, паркингов и производственных площадок",
        intro: [
          "Стоки с автомоек, АЗС, паркингов и открытых площадок несут нефтепродукты, песок и мелкую взвесь. Попадая в канализацию, нефтепродукты образуют плёнку и подавляют биологическую очистку на городских сооружениях; попадая в грунт — загрязняют почву и грунтовые воды.",
          "Нефтеуловитель ставится на выпуске площадки и работает самотёком. Три ступени в одном корпусе: приёмно-шламовая камера, зона гравитационного отделения крупных капель и коалесцентно-ламельный модуль, который собирает мелкие капли в крупные и выводит их на поверхность.",
          "Ряд рассчитан по скорости всплытия капли (формула Стокса). Для капли 100 мкм при плотности нефтепродукта 850 кг/м³ и температуре воды 15 °C скорость всплытия составляет 2,58 м/ч. Удельная нагрузка на эффективную площадь по всему ряду принята 1,72 м/ч — с полуторным запасом к расчётной скорости.",
          "Типоразмер обозначается номинальным расходом в литрах в секунду, как принято в EN 858-2: НЕФ-10 — это 10 л/с, то есть 36 м³/ч.",
        ],
        forWhom: [
          { title: "Автомойки", text: "Стоки постов: нефтепродукты, песок, абразив. Ставится в паре с песколовкой." },
          { title: "АЗС и АГНКС", text: "Площадка заправки и сливная площадка автоцистерн." },
          { title: "Паркинги и стоянки", text: "Мойка полов, талая вода, капёж с автомобилей." },
          { title: "СТО и автосервисы", text: "Посты мойки агрегатов, зона замены масла." },
          { title: "Промышленные площадки", text: "Открытые склады, площадки стоянки техники." },
          { title: "Ливневая канализация", text: "Выпуски с проездов, дорог и разворотных площадок." },
        ],
        includes: [
          "Корпус из стеклопластика с рёбрами жёсткости",
          "Приёмно-шламовая камера с успокоителем входного потока",
          "Коалесцентно-ламельный модуль, шаг пластин 20 мм",
          "Полупогружные перегородки и выходной сифон",
          "Горловины и крышки по количеству люков",
          "Присоединительные патрубки с уплотнительными манжетами",
          "Вентиляционный стояк с дефлектором",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная подготовка и обетонирование корпуса",
          "Железобетонная разгрузочная плита при установке под проездом",
          "Наружные сети канализации до и после изделия",
          "Автоматический запорный поплавок — опция",
          "Сорбционный блок доочистки — опция",
          "Периодическая откачка нефтепродуктов и шлама",
        ],
        limits: [
          {
            title: "Норматив 1,0 мг/л гравитацией не достигается",
            text: "Постановление КМ РУз № 11 от 03.02.2010 нормирует нефтепродукты на уровне 1,0 мг/л. Коалесцентный сепаратор устойчиво даёт 5 мг/л — это класс I по EN 858-1, лучший результат для безреагентной схемы. Для единиц мг/л нужен сорбционный блок после сепаратора, и его ресурс считается отдельно.",
          },
          {
            title: "Эмульсия не разделяется",
            text: "Автошампуни, обезжириватели и активная пена переводят нефтепродукт в стойкую эмульсию, которая проходит сепаратор насквозь. Это свойство физики процесса, а не конструкции изделия. При активной химии нужна коагуляция или напорная флотация.",
          },
          {
            title: "Песок обязательно задерживать до пакета",
            text: "Абразив забивает ламельный модуль и снижает эффективность. Приёмно-шламовая камера в составе изделия рассчитана на 200 литров на 1 л/с. При высоком выносе песка — автомойка, стройплощадка, грунтовые проезды — нужна отдельная песколовка перед нефтеуловителем.",
          },
          {
            title: "Расчётный расход — не диаметр трубы",
            text: "Для ливневых стоков расход считается по интенсивности дождя и площади водосбора согласно КМК 2.04.03-19, для автомойки — по числу одновременно работающих постов. Подбор «по диаметру существующей трубы» даёт ошибку в разы в обе стороны.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Для автомойки типоразмер определяется числом одновременно работающих постов: один аппарат высокого давления даёт 1,2–1,8 м³/ч. Для АЗС, паркинга и ливневых выпусков — площадью водосбора и расчётной интенсивностью дождя по КМК 2.04.03-19. Пришлите план площадки с отметками и назначением покрытий — вернём расчёт расхода и подбор типоразмера.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором",
        powerValue: "отсутствует, работа самотёком",
        installValue: "подземная, в бетонной обойме",
        modelWord: "Нефтеуловитель",
        ctaTitle: "Посчитаем расход\nпо вашей площадке.",
        ctaText:
          "Пришлите план площадки, площадь и тип покрытий, отметку канализации в точке врезки. Вернём расчёт расчётного расхода, подбор типоразмера и исполнительную схему для строительной части.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от комплектации, класса нагрузки на люки, наличия сорбционного блока и объёма монтажных работ. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
    },
  },
  uz: {
    label: "ASSORTIMENT",
    navLabel: "Assortiment",
    teaserTitle: "Modellar\nva parametrlar.",
    teaserText: "To‘liq texnik tavsiflarga ega o‘lcham qatorlari: gabaritlar, ishchi hajm, turib qolish vaqti, ulanish o‘lchamlari va massa. Har bir model uchun alohida sahifa.",
    teaserButton: "ASSORTIMENTNI KO‘RISH",
    title: "O‘z ishlab chiqarishimizdagi\nuskunalar.",
    intro:
      "Tipo‘lcham qatorlari me'yorlar bo‘yicha hisoblangan va gidravlika bo‘yicha tekshirilgan. Har bir model «taxminan shunday o‘lcham» emas, balki hisob natijasi: turib qolish vaqti, ko‘zgu yuzasiga yuklama va to‘planish hajmi butun qator uchun tekshirib chiqilgan.",
    specLabels: {
      q: "Hisobiy sarf",
      ns: "Nominal sarf NS",
      size: "Gabaritlar (U × K × B)",
      volumeGross: "Geometrik hajm",
      volumeWork: "Ishchi hajm",
      retention: "Turib qolish vaqti",
      area: "Ko‘zgu yuzasi",
      load: "Gidravlik yuklama",
      fat: "Yog‘ to‘planish hajmi",
      sludge: "Qabul-shlam zonasi",
      material: "Korpus materiali",
      laminate: "Laminat qalinligi",
      mass: "Quruq massa",
      dn: "Ulanish kirish / chiqish",
      hatches: "Lyuklar soni",
      vent: "Ventilyatsiya",
      power: "Elektr energiya sarfi",
      install: "O‘rnatish usuli",
    },
    lines: {
      "grease-traps": {
        name: "Yog‘ tutgichlar",
        tagline:
          "Oshxona oqava suvlaridan yog‘lar va oziq-ovqat chiqindilarini kommunal kanalizatsiyaga tashlashdan oldin ajratish",
        intro: [
          "Oshxona oqava suvlari hayvon va o‘simlik kelib chiqishli yog‘lar, oziq-ovqat chiqindilari va yuvish vositalarini o‘z ichiga oladi. Sovishi bilan yog‘ quvur devorlarida va shahar tarmog‘ida qotib qoladi, bu esa tiqilish, avariya va suv ta'minoti tashkiloti tomonidan da'volarga olib keladi.",
          "Yog‘ tutgich oshxona chiqishida, kommunal kanalizatsiyaga ulanishdan oldin o‘rnatiladi. U o‘z oqimi bilan ishlaydi: nasos ham, elektr ta'minoti ham, avtomatika ham talab qilinmaydi.",
          "Restoran oshxonasidagi asosiy qiyinchilik ifloslik emas, balki harorat. Fritürnitsa, parokonvektomat va idish yuvish mashinalari oqavasi 45–60 °C bo‘lib, bunday haroratda yog‘ suyuq holatda qoladi va yuzaga chiqmaydi. U taxminan 30 °C gacha sovigandan keyingina ko‘tariladi. Shu sababli butun qator kamida 79 daqiqalik turib qolish vaqtiga hisoblangan — bu ham sovishga, ham ajralishga yetadi.",
        ],
        forWhom: [
          { title: "Restoran va kafelar", text: "Fritür va idish yuvish mashinasi bilan to‘liq sikl oshxonasi." },
          { title: "Fudkort va oshxonalar", text: "Bitta chiqishga bir nechta oshxona, kuchaygan zalpli tashlama." },
          { title: "Novvoyxona va qandolatxonalar", text: "O‘simlik yog‘lari yuqori bo‘lgan oqava suvlar." },
          { title: "Go‘sht va baliq sexlari", text: "Hayvon yog‘lari, muallaq moddalarning yuqori ulushi." },
          { title: "Mehmonxonalar", text: "Mehmonxona qoshidagi restoran, banket zallari." },
          { title: "Oziq-ovqat ishlab chiqarish", text: "Qayta ishlash sexlarining texnologik oqava suvlari." },
        ],
        includes: [
          "Qattiqlik qovurg‘alari bilan shishaplastik korpus",
          "Ichki yarim botirilgan to‘siqlar",
          "Kirish oqimi tinchlantirgichi va chiqish sifoni",
          "Oziq-ovqat chiqindilari uchun yechiladigan savat, zangl. AISI 304",
          "Lyuklar soniga muvofiq bo‘yinlar va qopqoqlar",
          "Zichlovchi manjetli ulanish patrubkalari",
          "Deflektorli ventilyatsiya stoyagi",
          "Mahsulot pasporti va foydalanish bo‘yicha qo‘llanma",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Beton tayyorlash va korpusni betonlash",
          "Yo‘l ostiga o‘rnatishda temir-beton yuk tushiruvchi plita",
          "Mahsulotgacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Ishlatilgan fritür yog‘i uchun idish",
          "Yog‘ massasi va shlamni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "Emulsiyalangan yog‘ og‘irlik kuchi bilan ajralmaydi",
            text: "Yuvish vositalari va idish uchun gellar yog‘ni emulsiyaga aylantiradi, u esa qurilmadan o‘tib ketaveradi. Bu jarayon fizikasining xossasi, mahsulot konstruksiyasining kamchiligi emas.",
          },
          {
            title: "1.0 mg/l me'yoriga gravitatsion usulda erishib bo‘lmaydi",
            text: "O‘zR VM 03.02.2010 y. 11-son qarori yog‘larni 1.0 mg/l darajasida me'yorlaydi. Birorta ham gravitatsion yog‘ tutgich — na mahalliy, na chet ellik — bu qiymatni bermaydi. Birlik mg/l uchun bosimli flotatsiya kerak.",
          },
          {
            title: "Ishlatilgan yog‘ni to‘kish mumkin emas",
            text: "Fritür yog‘i qurilmani bir-ikki hafta ichida ishdan chiqaradi. Uning uchun alohida idish va chiqarib ketish shartnomasi kerak.",
          },
          {
            title: "Biopreparatlar taqiqlanadi",
            text: "«Yog‘ni eritish uchun» fermentlar va emulgatorlar yog‘ni yo‘qotmaydi, balki uni shahar tarmog‘iga haydaydi, u yerda esa yog‘ qotib qoladi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtma berishdan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Model o‘rindiqlar soniga emas, balki oshxona oqavasining cho‘qqi sarfiga qarab tanlanadi. Cho‘qqi sarfi texnologik uskunalar tarkibi bilan aniqlanadi: yuvish idishlari, idish yuvish mashinalari, parokonvektomatlar. Uskunalar ro‘yxatini yuboring — tipo‘lchamni tanlab beramiz va quruvchilar uchun ijroiya sxemasini taqdim etamiz.",
        materialValue: "shishaplastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak",
        powerValue: "yo‘q, o‘z oqimi bilan ishlaydi",
        installValue: "yer osti, beton g‘ilofda",
        modelWord: "Yog‘ tutgich",
        ctaTitle: "Obyektingizga mos tipo‘lchamni\ntanlab beramiz.",
        ctaText:
          "Oshxona uskunalari ro‘yxatini va ulanish nuqtasidagi kanalizatsiya belgisini yuboring. Model tanlovi, narxi va qurilish qismi uchun ijroiya sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx komplektatsiyaga, lyuklarning yuklama sinfiga va montaj ishlari hajmiga bog‘liq. Ariza yuboring — bir ish kuni ichida javob beramiz.",
        tableTitle: "Tipo‘lcham qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      "oil-separators": {
        name: "Neft tutgichlar",
        labels: {
          area: "Samarali separatsiya yuzasi",
          load: "Solishtirma yuklama",
          fat: "Neft mahsulotlari to‘planish hajmi",
          sludge: "Qabul-shlam kamerasi",
        },
        tagline:
          "Avtoyuvish shoxobchalari, ShAQSh, avtoturargohlar va ishlab chiqarish maydonchalari oqavasidan neft mahsulotlari va muallaq zarralarni ajratish",
        intro: [
          "Avtoyuvish shoxobchalari, ShAQSh, avtoturargohlar va ochiq maydonchalar oqavasi neft mahsulotlari, qum va mayda muallaq zarralarni olib keladi. Kanalizatsiyaga tushganda neft mahsulotlari parda hosil qiladi va shahar inshootlaridagi biologik tozalashni bo‘g‘adi; tuproqqa tushganda tuproq va yer osti suvlarini ifloslantiradi.",
          "Neft tutgich maydoncha chiqishiga o‘rnatiladi va o‘z oqimi bilan ishlaydi. Bitta korpusda uch bosqich: qabul-shlam kamerasi, yirik tomchilarni gravitatsion ajratish zonasi va mayda tomchilarni yiriklashtirib yuzaga chiqaradigan koalessent-lamel moduli.",
          "Qator tomchining suzib chiqish tezligi bo‘yicha (Stoks formulasi) hisoblangan. 100 mkm tomcha uchun neft mahsuloti zichligi 850 kg/m³ va suv harorati 15 °C bo‘lganda suzib chiqish tezligi 2,58 m/soat. Butun qator bo‘yicha samarali yuzaga solishtirma yuklama 1,72 m/soat qilib qabul qilingan — hisobiy tezlikka nisbatan 1,5 karra zaxira bilan.",
          "O‘lcham EN 858-2 da qabul qilinganidek, sekundiga litrdagi nominal sarf bilan belgilanadi: НЕФ-10 — bu 10 l/s, ya’ni 36 m³/soat.",
        ],
        forWhom: [
          { title: "Avtoyuvish shoxobchalari", text: "Postlar oqavasi: neft mahsulotlari, qum, abraziv. Qum tutgich bilan birga o‘rnatiladi." },
          { title: "ShAQSh va AGNQSh", text: "Yoqilg‘i quyish va avtotsisternalarni bo‘shatish maydonchasi." },
          { title: "Avtoturargohlar", text: "Pol yuvish, erigan qor suvi, avtomobillardan tomchilash." },
          { title: "Texnik xizmat stansiyalari", text: "Agregatlarni yuvish postlari, moy almashtirish zonasi." },
          { title: "Sanoat maydonchalari", text: "Ochiq omborlar, texnika turadigan maydonchalar." },
          { title: "Yomg‘ir kanalizatsiyasi", text: "Yo‘l va aylanma maydonchalardan chiqish joylari." },
        ],
        includes: [
          "Qattiqlik qovurg‘alari bilan shishatolali plastik korpus",
          "Kirish oqimini tinchlantirgichli qabul-shlam kamerasi",
          "Koalessent-lamel moduli, plastinka qadami 20 mm",
          "Yarim botiq to‘siqlar va chiqish sifoni",
          "Lyuklar soniga mos bo‘yinlar va qopqoqlar",
          "Zichlash muftalari bilan ulanish patrubkalari",
          "Deflektorli ventilyatsiya stoyakasi",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Beton tayyorlash va korpusni betonlash",
          "Yo‘l ostiga o‘rnatishda temir-beton yuk tushiruvchi plita",
          "Mahsulotgacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Avtomatik yopuvchi kalqovich — opsiya",
          "Sorbsion qo‘shimcha tozalash bloki — opsiya",
          "Neft mahsulotlari va shlamni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "1,0 mg/l me’yoriga gravitatsiya bilan erishib bo‘lmaydi",
            text: "O‘zbekiston Respublikasi Vazirlar Mahkamasining 03.02.2010 yildagi 11-sonli qarori neft mahsulotlarini 1,0 mg/l darajasida me’yorlaydi. Koalessent separator barqaror 5 mg/l beradi — bu EN 858-1 bo‘yicha I sinf, reagentsiz sxema uchun eng yaxshi natija. Bir necha mg/l uchun separatordan keyin sorbsion blok kerak.",
          },
          {
            title: "Emulsiya ajralmaydi",
            text: "Avtoshampunlar, yog‘sizlantirgichlar va faol ko‘pik neft mahsulotini barqaror emulsiyaga aylantiradi, u separatordan o‘tib ketadi. Bu jarayon fizikasining xususiyati, mahsulot konstruksiyasi emas. Faol kimyo bo‘lganda koagulyatsiya yoki bosimli flotatsiya kerak.",
          },
          {
            title: "Qumni paketgacha ushlab qolish shart",
            text: "Abraziv lamel modulini tiqib qo‘yadi. Mahsulot tarkibidagi qabul-shlam kamerasi 1 l/s uchun 200 litrga hisoblangan. Qum ko‘p chiqadigan joylarda — avtoyuvish, qurilish maydonchasi — neft tutgichdan oldin alohida qum tutgich kerak.",
          },
          {
            title: "Hisobiy sarf — quvur diametri emas",
            text: "Yomg‘ir oqavasi uchun sarf KMK 2.04.03-19 bo‘yicha yomg‘ir jadalligi va suv yig‘ish maydoni bo‘yicha, avtoyuvish uchun — bir vaqtda ishlaydigan postlar soni bo‘yicha hisoblanadi. «Mavjud quvur diametri bo‘yicha» tanlash bir necha barobar xatolik beradi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Avtoyuvish uchun o‘lcham bir vaqtda ishlaydigan postlar soni bilan aniqlanadi: bitta yuqori bosimli apparat 1,2–1,8 m³/soat beradi. ShAQSh, avtoturargoh va yomg‘ir chiqishlari uchun — suv yig‘ish maydoni va KMK 2.04.03-19 bo‘yicha hisobiy yomg‘ir jadalligi bilan. Maydoncha rejasini belgilar va qoplama turlari bilan yuboring — sarf hisobi va o‘lcham tanlovini qaytaramiz.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak",
        powerValue: "yo‘q, o‘z oqimi bilan ishlaydi",
        installValue: "yer osti, beton qobiqda",
        modelWord: "Neft tutgich",
        ctaTitle: "Maydonchangiz bo‘yicha\nsarfni hisoblaymiz.",
        ctaText:
          "Maydoncha rejasini, qoplama maydoni va turini, ulanish nuqtasidagi kanalizatsiya belgisini yuboring. Hisobiy sarf, o‘lcham tanlovi va qurilish qismi uchun ijro sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx komplektatsiya, lyuklarning yuklama sinfi, sorbsion blok mavjudligi va montaj ishlari hajmiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
    },
  },
  en: {
    label: "PRODUCT RANGE",
    navLabel: "Products",
    teaserTitle: "Models\nand parameters.",
    teaserText: "Size ranges with complete technical data: dimensions, working volume, retention time, connection sizes and weight. Every model has its own page.",
    teaserButton: "VIEW ALL PRODUCTS",
    title: "Equipment made\nat our own plant.",
    intro:
      "The size ranges are calculated to code and verified hydraulically. Every model is not an \"about this big\" guess but the result of a calculation: retention time, surface loading and accumulation volume have been checked across the whole range.",
    specLabels: {
      q: "Design flow rate",
      ns: "Nominal size NS",
      size: "Dimensions (L × W × H)",
      volumeGross: "Gross volume",
      volumeWork: "Working volume",
      retention: "Retention time",
      area: "Surface area",
      load: "Hydraulic loading",
      fat: "Grease accumulation volume",
      sludge: "Inlet and sludge zone",
      material: "Shell material",
      laminate: "Laminate thickness",
      mass: "Dry weight",
      dn: "Connection inlet / outlet",
      hatches: "Number of manhole covers",
      vent: "Ventilation",
      power: "Power consumption",
      install: "Installation method",
    },
    lines: {
      "grease-traps": {
        name: "Grease traps",
        tagline:
          "Separation of fats and food waste from kitchen wastewater before discharge into the municipal sewer",
        intro: [
          "Kitchen wastewater carries fats of animal and vegetable origin, food waste and detergents. As it cools, the grease congeals on pipe walls and inside the city network, causing blockages, failures and claims from the water utility.",
          "The grease trap is installed on the kitchen outlet upstream of the connection to the municipal sewer. It works by gravity: no pumps, no power supply, no controls.",
          "The real difficulty in a restaurant kitchen is not dirt but temperature. Effluent from deep fryers, combi steamers and dishwashers arrives at 45–60 °C, where grease stays liquid and does not float. It rises only after cooling to roughly 30 °C. That is why the entire range is designed for a retention time of at least 79 minutes — enough for both cooling and separation.",
        ],
        forWhom: [
          { title: "Restaurants and cafes", text: "Full-cycle kitchen with a deep fryer and a dishwasher." },
          { title: "Food courts and canteens", text: "Several kitchens on one outlet, heavy peak discharge." },
          { title: "Bakeries and patisseries", text: "Wastewater with a high content of vegetable fats." },
          { title: "Meat and fish shops", text: "Animal fats, a high share of suspended solids." },
          { title: "Hotels", text: "In-house restaurant, banquet halls." },
          { title: "Food production", text: "Process wastewater from processing shops." },
        ],
        includes: [
          "GRP shell with stiffening ribs",
          "Internal semi-submerged baffles",
          "Inlet flow calmer and outlet siphon",
          "Removable food waste basket, AISI 304 stainless steel",
          "Necks and covers matching the number of manhole covers",
          "Connection spigots with sealing gaskets",
          "Ventilation riser with a deflector",
          "Product data sheet and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation of the pit",
          "Concrete bedding and concrete encasement of the shell",
          "Reinforced concrete load-distributing slab for installation under traffic",
          "External sewer lines upstream and downstream of the unit",
          "Container for used deep-fryer oil",
          "Periodic pump-out of the grease mass and sludge",
        ],
        limits: [
          {
            title: "Emulsified grease cannot be separated by gravity",
            text: "Detergents and dishwashing gels turn grease into an emulsion that passes straight through the unit. This is a property of the physics of the process, not a flaw in the design of the unit.",
          },
          {
            title: "The 1.0 mg/l limit is unreachable by gravity separation",
            text: "Resolution No. 11 of the Cabinet of Ministers of Uzbekistan, 03.02.2010 sets the limit for fats at 1.0 mg/l. No gravity grease trap — domestic or imported — delivers that value. Single-digit mg/l requires dissolved air flotation.",
          },
          {
            title: "Used oil must not be poured in",
            text: "Deep-fryer oil disables the unit within one or two weeks. It needs a separate container and a disposal contract.",
          },
          {
            title: "Biological additives are prohibited",
            text: "Enzymes and emulsifiers sold \"to dissolve grease\" do not remove it; they push it further into the city network, where it congeals.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in the delivery",
        notIncludedTitle: "Not included",
        howToChoose:
          "The model is selected by the peak flow of the kitchen effluent, not by the number of seats. Peak flow is defined by the set of process equipment: sinks, dishwashers, combi steamers. Send us the equipment list — we will select the size and provide an as-built drawing for the builders.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 riser with a deflector",
        powerValue: "none, gravity operation",
        installValue: "underground, in a concrete encasement",
        modelWord: "Grease trap",
        ctaTitle: "We will select the size\nfor your site.",
        ctaText:
          "Send us the list of kitchen equipment and the sewer invert level at the tie-in point. We will return the model selection, the price and an as-built drawing for the civil works.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the scope of supply, the load class of the manhole covers and the volume of installation work. Send a request — we reply within one business day.",
        tableTitle: "Size range",
        specsTitle: "Technical specifications",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      "oil-separators": {
        name: "Oil separators",
        labels: {
          area: "Effective separation area",
          load: "Specific surface load",
          fat: "Oil storage volume",
          sludge: "Sludge trap chamber",
        },
        tagline:
          "Removal of oil, fuel and suspended solids from car wash, filling station, parking and industrial yard runoff",
        intro: [
          "Runoff from car washes, filling stations, parking decks and open yards carries oil products, sand and fine suspended solids. In the sewer, oil forms a film and suppresses biological treatment at the municipal plant; in the ground it contaminates soil and groundwater.",
          "The separator is installed at the outlet of the paved area and works by gravity. Three stages in one shell: a sludge trap chamber, a gravity zone for coarse droplets, and a coalescing lamella module that merges fine droplets and lifts them to the surface.",
          "The range is calculated from droplet rise velocity (Stokes law). For a 100 µm droplet at an oil density of 850 kg/m³ and a water temperature of 15 °C the rise velocity is 2.58 m/h. The specific load on the effective area is set at 1.72 m/h across the whole range — a safety factor of 1.5 against the calculated velocity.",
          "Sizes are designated by nominal flow in litres per second, as in EN 858-2: НЕФ-10 means 10 l/s, that is 36 m³/h.",
        ],
        forWhom: [
          { title: "Car washes", text: "Bay runoff: oil, sand and abrasives. Installed together with a sand trap." },
          { title: "Filling stations", text: "Dispensing area and tanker unloading pad." },
          { title: "Parking decks", text: "Floor washing, snow melt, drip from vehicles." },
          { title: "Service stations", text: "Component washing bays, oil change area." },
          { title: "Industrial yards", text: "Open storage and equipment parking areas." },
          { title: "Storm drainage", text: "Outlets from driveways, roads and turning areas." },
        ],
        includes: [
          "GRP shell with stiffening ribs",
          "Sludge trap chamber with inlet flow diffuser",
          "Coalescing lamella module, 20 mm plate spacing",
          "Semi-submerged baffles and outlet siphon",
          "Necks and covers according to the number of manholes",
          "Connection stubs with sealing sleeves",
          "Vent stack with cowl",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation",
          "Concrete bedding and encasement of the shell",
          "Reinforced concrete relief slab where installed under traffic",
          "External sewer lines before and after the unit",
          "Automatic closure float — option",
          "Sorption polishing unit — option",
          "Periodic removal of oil and sludge",
        ],
        limits: [
          {
            title: "1.0 mg/l cannot be reached by gravity",
            text: "Uzbekistan Cabinet Resolution No. 11 of 03.02.2010 sets the oil limit at 1.0 mg/l. A coalescing separator reliably delivers 5 mg/l — Class I under EN 858-1 and the best result achievable without chemicals. Single digits in mg/l require a sorption stage after the separator, and its service life has to be calculated separately.",
          },
          {
            title: "Emulsions do not separate",
            text: "Car shampoos, degreasers and active foam turn oil into a stable emulsion that passes straight through the separator. This is the physics of the process, not a property of the unit. Where active chemistry is used, coagulation or dissolved air flotation is required.",
          },
          {
            title: "Sand must be retained ahead of the pack",
            text: "Abrasives clog the lamella module. The built-in sludge chamber is sized at 200 litres per 1 l/s. Where sand carry-over is high — car washes, construction sites, unpaved approaches — a separate sand trap is needed upstream.",
          },
          {
            title: "Design flow is not pipe diameter",
            text: "For storm runoff the flow is calculated from rainfall intensity and catchment area to KMK 2.04.03-19; for a car wash, from the number of bays working simultaneously. Selecting by the diameter of the existing pipe is wrong by a factor of several in either direction.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "For a car wash the size follows from the number of bays working at the same time: one high-pressure unit draws 1.2–1.8 m³/h. For filling stations, parking decks and storm outlets it follows from the catchment area and the design rainfall intensity to KMK 2.04.03-19. Send the site plan with levels and surface types and we will return the flow calculation and the selected size.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 stack with cowl",
        powerValue: "none, gravity operation",
        installValue: "buried, in a concrete encasement",
        modelWord: "Oil separator",
        ctaTitle: "We will calculate the flow\nfor your site.",
        ctaText:
          "Send the site plan, the paved area and surface types, and the sewer level at the connection point. We will return the design flow, the selected size and a construction drawing for the civil works.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the configuration, the load class of the covers, whether a sorption unit is included, and the scope of installation work. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
    },
  },
  zh: {
    label: "产品系列",
    navLabel: "产品型号",
    teaserTitle: "型号\n与参数。",
    teaserText: "完整技术参数的规格系列：外形尺寸、有效容积、停留时间、接管尺寸和重量。每个型号均有独立页面。",
    teaserButton: "查看全部产品",
    title: "我们自有工厂\n生产的设备。",
    intro:
      "各规格系列均按规范计算并经水力校核。每一型号都不是「大概这个尺寸」，而是计算结果：停留时间、表面负荷与积存容积在整个系列范围内均已核验。",
    specLabels: {
      q: "设计流量",
      ns: "公称流量 NS",
      size: "外形尺寸（长 × 宽 × 高）",
      volumeGross: "几何容积",
      volumeWork: "有效容积",
      retention: "停留时间",
      area: "表面积",
      load: "水力负荷",
      fat: "油脂积存容积",
      sludge: "进水及污泥区",
      material: "壳体材料",
      laminate: "层压厚度",
      mass: "干重",
      dn: "进出口接管",
      hatches: "检查井盖数量",
      vent: "通风",
      power: "耗电量",
      install: "安装方式",
    },
    lines: {
      "grease-traps": {
        name: "隔油池",
        tagline:
          "在排入市政污水管网前，从厨房污水中分离油脂与食物残渣",
        intro: [
          "厨房污水中含有动物性和植物性油脂、食物残渣以及洗涤剂。冷却后油脂会在管道内壁和城市管网中凝结，导致堵塞、事故以及供水公司的追责。",
          "隔油池安装在厨房排出口、接入市政污水管网之前。依靠重力自流运行：无需水泵、无需供电、无需自控。",
          "餐厅厨房的真正难点不是污物，而是温度。煎炸炉、万能蒸烤箱和洗碗机的排水温度为 45–60 °C，此时油脂仍为液态而不会上浮，只有冷却至约 30 °C 后才会浮起。因此整个系列均按不低于 79 分钟的停留时间设计，足以完成冷却与分离。",
        ],
        forWhom: [
          { title: "餐厅与咖啡厅", text: "配备煎炸炉和洗碗机的全流程厨房。" },
          { title: "美食广场与食堂", text: "多个厨房共用一个排出口，瞬时排放量大。" },
          { title: "面包房与烘焙店", text: "植物油脂含量高的污水。" },
          { title: "肉类与水产加工间", text: "动物油脂，悬浮物比例高。" },
          { title: "酒店", text: "酒店附属餐厅、宴会厅。" },
          { title: "食品生产企业", text: "加工车间的工艺污水。" },
        ],
        includes: [
          "带加强筋的玻璃钢壳体",
          "内部半潜式隔板",
          "进水稳流装置与出水虹吸",
          "可拆卸食物残渣篮，AISI 304 不锈钢",
          "与检查井盖数量相匹配的井筒与盖板",
          "带密封胶圈的接管短节",
          "带风帽的通风立管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "混凝土垫层及壳体外包混凝土",
          "车行道下安装时的钢筋混凝土卸荷板",
          "设备前后的室外污水管网",
          "废弃煎炸油的储存容器",
          "油脂与污泥的定期抽吸清运",
        ],
        limits: [
          {
            title: "乳化的油脂无法依靠重力分离",
            text: "洗涤剂和洗碗凝胶会使油脂乳化，乳化后的油脂将直接穿过设备。这是工艺物理特性所决定的，而非设备结构的缺陷。",
          },
          {
            title: "1.0 mg/l 的标准无法通过重力法达到",
            text: "乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议将油脂限值规定为 1.0 mg/l。任何重力式隔油池——无论国产还是进口——都无法达到该数值。要达到个位数 mg/l 需采用压力溶气气浮。",
          },
          {
            title: "严禁倾倒废油",
            text: "煎炸油会在一到两周内使设备失效。废油需要单独的储存容器和清运合同。",
          },
          {
            title: "禁止使用生物制剂",
            text: "所谓「溶解油脂」的酶制剂和乳化剂并不能去除油脂，只会把它推向城市管网，在那里重新凝结。",
          },
        ],
        useTitle: "适用场景",
        limitsTitle: "订购前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不包含内容",
        howToChoose:
          "型号按厨房污水的峰值流量选取，而不是按餐位数量。峰值流量由工艺设备组成决定：水槽、洗碗机、万能蒸烤箱。请发送设备清单——我们将确定规格并提供供施工方使用的竣工图。",
        materialValue: "玻璃钢，间苯型不饱和聚酯树脂",
        ventValue: "带风帽的 DN110 立管",
        powerValue: "无，重力自流运行",
        installValue: "地埋式，混凝土外包",
        modelWord: "隔油池",
        ctaTitle: "我们将为您的项目\n选定规格。",
        ctaText:
          "请发送厨房设备清单和接入点处的污水管标高。我们将回复型号选型、价格以及供土建部分使用的竣工图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText:
          "价格取决于配置、检查井盖的荷载等级以及安装工作量。请提交询价——我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      "oil-separators": {
        name: "隔油除油器",
        labels: {
          area: "有效分离面积",
          load: "表面负荷",
          fat: "油品蓄积容积",
          sludge: "沉砂集泥室",
        },
        tagline:
          "分离洗车场、加油站、停车场和工业场地雨污水中的石油类物质与悬浮物",
        intro: [
          "洗车场、加油站、停车场和露天场地的排水携带石油类物质、砂粒和细小悬浮物。进入排水管网后，油类形成油膜并抑制市政污水厂的生物处理；渗入地下则污染土壤和地下水。",
          "除油器安装在场地排水出口，重力自流运行。同一壳体内设三级：沉砂集泥室、大油滴重力分离区，以及将细油滴聚并后浮升至水面的聚结斜板模块。",
          "系列按油滴上浮速度（斯托克斯公式）计算。油滴粒径 100 µm、油品密度 850 kg/m³、水温 15 °C 时，上浮速度为 2.58 m/h。全系列有效面积表面负荷取 1.72 m/h，相对计算速度留有 1.5 倍安全裕度。",
          "规格按每秒升数的公称流量标注，与 EN 858-2 一致：НЕФ-10 即 10 l/s，折合 36 m³/h。",
        ],
        forWhom: [
          { title: "洗车场", text: "洗车工位排水：油类、砂粒、磨料。与沉砂池配套安装。" },
          { title: "加油站", text: "加油区与油罐车卸油平台。" },
          { title: "停车场", text: "地面冲洗水、融雪水、车辆滴漏。" },
          { title: "汽车维修站", text: "部件清洗工位、换油作业区。" },
          { title: "工业场地", text: "露天仓库、机械停放场地。" },
          { title: "雨水管网", text: "车行道、道路和回车场的排水出口。" },
        ],
        includes: [
          "带加强肋的玻璃钢壳体",
          "带进水稳流装置的沉砂集泥室",
          "聚结斜板模块，板间距 20 mm",
          "半潜式隔板与出水虹吸",
          "按检修口数量配套的井筒与盖板",
          "带密封套的接管",
          "带风帽的通气立管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "混凝土垫层与壳体包封",
          "行车荷载下的钢筋混凝土卸荷板",
          "设备前后的室外排水管网",
          "自动关闭浮球——选配",
          "吸附深度处理单元——选配",
          "油品与污泥的定期清运",
        ],
        limits: [
          {
            title: "重力法达不到 1,0 mg/l",
            text: "乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议规定石油类限值为 1,0 mg/l。聚结式除油器可稳定达到 5 mg/l，即 EN 858-1 的 I 级，这是不投加药剂条件下的最佳结果。要达到个位数 mg/l，需在除油器后增设吸附单元，其寿命需单独计算。",
          },
          {
            title: "乳化油无法分离",
            text: "洗车液、除油剂和活性泡沫会把油类变成稳定乳液，直接穿过除油器。这是工艺物理特性，不是设备结构问题。使用活性化学品时需要混凝或加压气浮。",
          },
          {
            title: "砂粒必须在斜板前拦截",
            text: "磨料会堵塞斜板模块。设备内置沉砂室按每 1 l/s 200 升设计。砂量大的场合——洗车场、施工场地——需在除油器前单设沉砂池。",
          },
          {
            title: "设计流量不等于管径",
            text: "雨水排放按 KMK 2.04.03-19 的降雨强度和汇水面积计算，洗车场按同时作业的工位数计算。按现有管径选型会产生数倍误差。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "洗车场按同时作业的工位数确定规格：一台高压清洗机耗水 1,2–1,8 m³/h。加油站、停车场和雨水排口按汇水面积和 KMK 2.04.03-19 的设计降雨强度确定。请提供带标高和铺装类型的场地平面图，我们将返回流量计算与选型结果。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "DN110 立管带风帽",
        powerValue: "无，重力自流运行",
        installValue: "埋地安装，混凝土包封",
        modelWord: "除油器",
        ctaTitle: "我们为您的场地\n计算流量。",
        ctaText:
          "请提供场地平面图、铺装面积与类型，以及接入点的排水管标高。我们将返回设计流量、选型结果和土建施工图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText:
          "价格取决于配置、盖板荷载等级、是否含吸附单元以及安装工作量。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
    },
  },
};
