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

export type LineKey = "grease-traps";

export type Model = {
  slug: string;
  code: string;
  line: LineKey;
  /** расчётный расход, м³/ч */
  q: number;
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
  /** объём накопления жира, м³ */
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
];

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
  title: string;
  intro: string;
  specLabels: SpecLabels;
  lines: Record<LineKey, LineText>;
};

export const TEXT: Record<Language, ProductsText> = {
  ru: {
    label: "АССОРТИМЕНТ",
    title: "Оборудование\nсобственного производства.",
    intro:
      "Типоразмерные ряды рассчитаны по нормам и проверены по гидравлике. Каждая модель — не «примерно такой размер», а результат расчёта: время пребывания, нагрузка на зеркало и объём накопления проверены для всего ряда.",
    specLabels: {
      q: "Расчётный расход",
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
    },
  },
  uz: {
    label: "ASSORTIMENT",
    title: "O‘z ishlab chiqarishimizdagi\nuskunalar.",
    intro:
      "Tipo‘lcham qatorlari me'yorlar bo‘yicha hisoblangan va gidravlika bo‘yicha tekshirilgan. Har bir model «taxminan shunday o‘lcham» emas, balki hisob natijasi: turib qolish vaqti, ko‘zgu yuzasiga yuklama va to‘planish hajmi butun qator uchun tekshirib chiqilgan.",
    specLabels: {
      q: "Hisobiy sarf",
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
    },
  },
  en: {
    label: "PRODUCT RANGE",
    title: "Equipment made\nat our own plant.",
    intro:
      "The size ranges are calculated to code and verified hydraulically. Every model is not an \"about this big\" guess but the result of a calculation: retention time, surface loading and accumulation volume have been checked across the whole range.",
    specLabels: {
      q: "Design flow rate",
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
    },
  },
  zh: {
    label: "产品系列",
    title: "我们自有工厂\n生产的设备。",
    intro:
      "各规格系列均按规范计算并经水力校核。每一型号都不是「大概这个尺寸」，而是计算结果：停留时间、表面负荷与积存容积在整个系列范围内均已核验。",
    specLabels: {
      q: "设计流量",
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
    },
  },
};
