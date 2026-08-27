import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «нефтеуловитель для АЗС / паркинга / СТО»
 * и «ливневые очистные». Ведёт на линейки НЕФ и ПЕС.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ОЧИСТКА СТОКОВ ПЛОЩАДКИ",
    title: "Нефтеуловитель для АЗС,\nпаркинга и СТО.",
    intro:
      "Дождь смывает с площадки нефтепродукты и песок; сбрасывать это в канализацию или на рельеф без очистки нельзя. Разбираем, как считается расход, почему сепаратор всегда ставится в паре с песколовкой и какой типоразмер нужен вашей площадке.",
    sections: [
      {
        title: "Как устроена очистка ливневого стока",
        text: [
          "Схема одинакова для АЗС, паркинга и СТО: дождеприёмники собирают сток, песколовка осаждает песок и абразив, нефтеуловитель с коалесцентным модулем отделяет нефтепродукты, очищенная вода уходит в сеть или на рельеф.",
          "Порядок ступеней принципиален. Песок, попавший в ламельный пакет нефтеуловителя, забивает его и снижает эффективность — поэтому песколовка всегда первая. Мы производим обе ступени в одинаковых типоразмерах, они подбираются и продаются комплектом.",
          "Норматив по нефтепродуктам — 1,0 мг/л по ПКМ РУз № 11. Коалесцентный сепаратор устойчиво даёт 5 мг/л — это класс I по европейской норме EN 858-1 и предел безреагентной очистки. Для единиц мг/л после сепаратора ставится сорбционный блок; мы говорим об этом до договора, а не после замера инспекции.",
        ],
      },
      {
        title: "Как считается расход",
        text: [
          "Для дождевого стока расход считается по КМК 2.04.03-19: площадь водосбора, тип покрытия и расчётная интенсивность дождя. Для мойки и постов СТО — по числу одновременно работающих постов: один аппарат высокого давления даёт 1,2–1,8 м³/ч.",
          "Подбор «по диаметру существующей трубы» — самая частая ошибка: она даёт промах в разы в обе стороны. Слишком маленький сепаратор пропускает нефтепродукты, слишком большой — заиливается на малом протоке.",
          "Ориентиры в карточках ниже привязаны к типу объекта. Точный расчёт по вашему плану площадки мы делаем бесплатно: нужен план с площадями и типами покрытий и отметка канализации в точке врезки.",
        ],
      },
    ],
    pickTitle: "Какой типоразмер нужен площадке",
    pickText:
      "Ориентиры — по типовым объектам. Точный расчёт делается по плану площадки и интенсивности дождя согласно КМК 2.04.03-19; песколовка того же типоразмера ставится перед сепаратором.",
    picks: [
      { slug: "nef-1-5", when: "СТО или мойка на 1–2 поста" },
      { slug: "nef-3", when: "АЗС: заправочная и сливная площадки" },
      { slug: "nef-6", when: "Открытый паркинг до ~2 000 м²" },
      { slug: "nef-10", when: "Паркинг или проезды до ~5 000 м²" },
      { slug: "nef-15", when: "Логистическая площадка, стоянка техники" },
      { slug: "nef-20", when: "Промплощадка, ливневой выпуск до ~1 га" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Можно обойтись без песколовки?",
        a: "Только там, где песка действительно нет — например, крытый паркинг с чистым полом. Для АЗС, мойки и открытых площадок песколовка обязательна: абразив забивает ламельный модуль сепаратора, и эффективность падает. Приёмная камера в составе сепаратора рассчитана на остаточный песок, а не на основной вынос.",
      },
      {
        q: "Инспекция намерила больше 1,0 мг/л. Сепаратор бракованный?",
        a: "Скорее всего нет. Гравитация с коалесценцией физически даёт 5 мг/л — лучший безреагентный результат. Если в договоре записана единица мг/л, нужен сорбционный блок после сепаратора. Проверьте также, не сливается ли в ту же сеть вода с мойки с шампунем: эмульгированный нефтепродукт сепаратор не берёт.",
      },
      {
        q: "Что с зимой?",
        a: "Корпус подземный, ниже глубины промерзания, работа самотёком — зимой ничего не отключается и не сливается. Единственное зимнее требование: люки должны оставаться доступными для обслуживания.",
      },
      {
        q: "Как часто обслуживать?",
        a: "Проверка толщины слоя нефтепродуктов и уровня песка — раз в месяц, щупом через люк. Откачка — по заполнению: у каждой модели в характеристиках указаны объёмы накопления. Для АЗС типичный интервал — раз в квартал.",
      },
      {
        q: "Нужен ли проект и согласование?",
        a: "Для нового строительства — да, раздел наружной канализации. Мы выдаём исполнительную схему, характеристики и паспорта для проекта; проектировщику остаётся привязка. Для действующих объектов чаще всего достаточно техусловий водоканала — формулировки поможем подготовить.",
      },
    ],
    allTitle: "ОБЕ ЛИНЕЙКИ",
    allButton: "НЕФТЕУЛОВИТЕЛИ И ПЕСКОЛОВКИ",
    allHref: "/products#oil-separators",
    ctaTitle: "Пришлите план площадки —\nвернём расчёт.",
    ctaText:
      "Нужны площади и типы покрытий, назначение объекта и отметка канализации в точке врезки. Вернём расчётный расход, комплект песколовка + нефтеуловитель и исполнительную схему.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
  },

  uz: {
    label: "MAYDONCHA OQAVASINI TOZALASH",
    title: "ShAQSh, avtoturargoh va STO uchun\nneft tutgich.",
    intro:
      "Yomg‘ir maydonchadan neft mahsulotlari va qumni yuvib ketadi; buni tozalamasdan kanalizatsiyaga tashlash mumkin emas. Sarf qanday hisoblanadi va nega separator doim qum tutgich bilan juft o‘rnatiladi — ko‘rib chiqamiz.",
    sections: [
      {
        title: "Yomg‘ir oqavasini tozalash qanday tuzilgan",
        text: [
          "Sxema ShAQSh, avtoturargoh va STO uchun bir xil: yomg‘ir qabul qilgichlar oqavani yig‘adi, qum tutgich qumni cho‘ktiradi, koalessent modulli neft tutgich neft mahsulotlarini ajratadi, tozalangan suv tarmoqqa ketadi.",
          "Bosqichlar tartibi muhim. Neft tutgich lamel paketiga tushgan qum uni tiqib qo‘yadi — shuning uchun qum tutgich doim birinchi. Biz ikkala bosqichni bir xil o‘lchamlarda ishlab chiqaramiz, ular komplekt bo‘lib sotiladi.",
          "Neft mahsulotlari me‘yori — O‘zR VM 11-son qarori bo‘yicha 1,0 mg/l. Koalessent separator barqaror 5 mg/l beradi — EN 858-1 bo‘yicha I sinf va reagentsiz tozalashning chegarasi. Bir necha mg/l uchun separatordan keyin sorbsion blok qo‘yiladi; biz bu haqda shartnomadan oldin aytamiz.",
        ],
      },
      {
        title: "Sarf qanday hisoblanadi",
        text: [
          "Yomg‘ir oqavasi uchun sarf KMK 2.04.03-19 bo‘yicha hisoblanadi: suv yig‘ish maydoni, qoplama turi va hisobiy yomg‘ir jadalligi. Yuvish va STO postlari uchun — bir vaqtda ishlaydigan postlar soni bo‘yicha: bitta yuqori bosimli apparat 1,2–1,8 m³/soat beradi.",
          "«Mavjud quvur diametri bo‘yicha» tanlash — eng ko‘p uchraydigan xato: u ikki tomonga ham bir necha barobar adashtiradi.",
          "Quyidagi kartochkalardagi mo‘ljallar obyekt turiga bog‘langan. Maydonchangiz rejasi bo‘yicha aniq hisobni bepul bajaramiz.",
        ],
      },
    ],
    pickTitle: "Maydonchaga qaysi o‘lcham kerak",
    pickText:
      "Mo‘ljallar — tipik obyektlar bo‘yicha. Aniq hisob maydoncha rejasi va KMK 2.04.03-19 bo‘yicha bajariladi; xuddi shu o‘lchamdagi qum tutgich separatordan oldin qo‘yiladi.",
    picks: [
      { slug: "nef-1-5", when: "1–2 postli STO yoki yuvish shoxobchasi" },
      { slug: "nef-3", when: "ShAQSh: yoqilg‘i quyish va bo‘shatish maydonchalari" },
      { slug: "nef-6", when: "~2 000 m² gacha ochiq avtoturargoh" },
      { slug: "nef-10", when: "~5 000 m² gacha avtoturargoh yoki yo‘llar" },
      { slug: "nef-15", when: "Logistika maydonchasi, texnika turargohi" },
      { slug: "nef-20", when: "Sanoat maydonchasi, ~1 ga gacha yomg‘ir chiqishi" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Qum tutgichsiz bo‘ladimi?",
        a: "Faqat qum haqiqatan yo‘q joyda — masalan, toza polli yopiq avtoturargohda. ShAQSh, yuvish va ochiq maydonchalar uchun qum tutgich majburiy: abraziv separatorning lamel modulini tiqib qo‘yadi.",
      },
      {
        q: "Tekshiruv 1,0 mg/l dan ko‘p o‘lchadi. Separator yaroqsizmi?",
        a: "Katta ehtimol bilan yo‘q. Koalessensiyali gravitatsiya fizik jihatdan 5 mg/l beradi — eng yaxshi reagentsiz natija. Shartnomada bir necha mg/l yozilgan bo‘lsa, separatordan keyin sorbsion blok kerak. Shampunli yuvish suvi shu tarmoqqa tushmayaptimi — tekshiring: emulsiyani separator olmaydi.",
      },
      {
        q: "Qishda nima bo‘ladi?",
        a: "Korpus yer ostida, muzlash chuqurligidan pastda, o‘z oqimi bilan ishlaydi — qishda hech narsa o‘chirilmaydi. Yagona talab: lyuklar xizmat uchun ochiq qolishi kerak.",
      },
      {
        q: "Qancha tez-tez xizmat ko‘rsatiladi?",
        a: "Neft qatlami va qum sathini tekshirish — oyiga bir marta, lyuk orqali. So‘rib olish — to‘lishga qarab: har bir modelda to‘planish hajmlari ko‘rsatilgan. ShAQSh uchun tipik oraliq — kvartalda bir marta.",
      },
    ],
    allTitle: "IKKALA LINIYA",
    allButton: "NEFT VA QUM TUTGICHLAR",
    allHref: "/products#oil-separators",
    ctaTitle: "Maydoncha rejasini yuboring —\nhisobni qaytaramiz.",
    ctaText:
      "Maydonlar va qoplama turlari, obyekt vazifasi va ulanish nuqtasidagi kanalizatsiya belgisi kerak. Hisobiy sarf, qum tutgich + neft tutgich komplekti va ijro sxemasini qaytaramiz.",
    ctaButton: "HISOBNI OLISH",
  },

  en: {
    label: "SITE RUNOFF TREATMENT",
    title: "An oil separator for filling\nstations, parking and workshops.",
    intro:
      "Rain washes oil and sand off the pavement; discharging that untreated is not allowed. Here is how the flow is calculated, why the separator is always paired with a sand trap, and which size your site needs.",
    sections: [
      {
        title: "How runoff treatment works",
        text: [
          "The scheme is the same for a filling station, a car park and a workshop: gullies collect the runoff, a sand trap settles the grit, a coalescing oil separator removes the hydrocarbons, and the treated water goes to the sewer.",
          "The order matters. Sand that reaches the lamella pack clogs it — so the sand trap always comes first. We make both stages in matching sizes; they are selected and sold as a set.",
          "The oil limit is 1.0 mg/l under Cabinet Resolution No. 11. A coalescing separator reliably delivers 5 mg/l — Class I under EN 858-1 and the limit of chemical-free treatment. Single digits need a sorption unit after the separator; we say this before the contract, not after the inspection.",
        ],
      },
      {
        title: "How the flow is calculated",
        text: [
          "For storm runoff, the flow follows from KMK 2.04.03-19: catchment area, surface type and design rainfall intensity. For wash bays, from the number of bays working at once: one high-pressure unit draws 1.2–1.8 m³/h.",
          "Sizing by the diameter of the existing pipe is the most common mistake — it misses by a factor of several in either direction.",
          "The guides in the cards below are tied to object types. The exact calculation from your site plan is free: send the areas, surface types and the sewer level at the connection point.",
        ],
      },
    ],
    pickTitle: "Which size your site needs",
    pickText:
      "Guides are for typical objects; the exact calculation follows KMK 2.04.03-19. A sand trap of the same size goes upstream of the separator.",
    picks: [
      { slug: "nef-1-5", when: "Workshop or wash with 1–2 bays" },
      { slug: "nef-3", when: "Filling station: dispensing and unloading pads" },
      { slug: "nef-6", when: "Open parking up to ~2,000 m²" },
      { slug: "nef-10", when: "Parking or driveways up to ~5,000 m²" },
      { slug: "nef-15", when: "Logistics yard, equipment parking" },
      { slug: "nef-20", when: "Industrial site, storm outlet up to ~1 ha" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "Can we skip the sand trap?",
        a: "Only where there is genuinely no sand — say, an indoor deck with a clean floor. For filling stations, washes and open yards it is mandatory: grit clogs the lamella pack. The separator's own sludge chamber is sized for residual sand, not the main load.",
      },
      {
        q: "The inspection measured more than 1.0 mg/l. Is the separator faulty?",
        a: "Most likely not. Gravity with coalescence physically delivers 5 mg/l — the best chemical-free result. If the contract says single digits, a sorption unit is needed downstream. Also check whether shampoo wash water enters the same line: separators do not treat emulsions.",
      },
      {
        q: "What about winter?",
        a: "The shell is buried below frost depth and works by gravity — nothing is shut down or drained. The only winter requirement is keeping the covers accessible.",
      },
      {
        q: "How often is it serviced?",
        a: "A dipstick check of the oil layer and sand level once a month; emptying by fill level — each model lists its storage volumes. For a filling station the typical interval is quarterly.",
      },
    ],
    allTitle: "BOTH LINES",
    allButton: "OIL SEPARATORS AND SAND TRAPS",
    allHref: "/products#oil-separators",
    ctaTitle: "Send the site plan —\nwe return the calculation.",
    ctaText:
      "We need the areas and surface types, the duty of the site and the sewer level at the connection point. We return the design flow, a matched sand trap + separator set and a construction drawing.",
    ctaButton: "GET THE CALCULATION",
  },

  zh: {
    label: "场地雨污水处理",
    title: "加油站、停车场和维修站的\n除油器。",
    intro:
      "雨水把油品和砂粒从场地冲入排水系统；未经处理排放是不允许的。这里说明流量如何计算、为什么除油器总与沉砂池配套。",
    sections: [
      {
        title: "雨水处理如何构成",
        text: [
          "加油站、停车场和维修站的流程相同：雨水口收集径流，沉砂池沉降砂粒，聚结式除油器分离油品，处理后的水排入管网。",
          "顺序至关重要。进入斜板模块的砂粒会堵塞它——所以沉砂池永远在前。我们按相同规格生产两级设备，成套选型、成套供货。",
          "油品限值按第 11 号决议为 1,0 mg/l。聚结式除油器稳定达到 5 mg/l——EN 858-1 的 I 级，也是无药剂处理的极限。要达到个位数需在除油器后加吸附单元；这一点我们在签约前说清，而不是在检测之后。",
        ],
      },
      {
        title: "流量如何计算",
        text: [
          "雨水流量按 KMK 2.04.03-19 计算：汇水面积、铺装类型和设计降雨强度。洗车工位按同时作业数计算：一台高压清洗机耗水 1,2–1,8 m³/h。",
          "按现有管径选型是最常见的错误——误差可达数倍。",
          "下方卡片按对象类型给出参考。按您的场地平面图精确计算是免费的。",
        ],
      },
    ],
    pickTitle: "您的场地需要哪个规格",
    pickText:
      "参考值按典型对象给出；精确计算按 KMK 2.04.03-19 进行。同规格沉砂池设在除油器上游。",
    picks: [
      { slug: "nef-1-5", when: "1–2 工位的维修站或洗车场" },
      { slug: "nef-3", when: "加油站：加油区与卸油平台" },
      { slug: "nef-6", when: "约 2 000 m² 以内露天停车场" },
      { slug: "nef-10", when: "约 5 000 m² 以内停车场或车道" },
      { slug: "nef-15", when: "物流场地、机械停放场" },
      { slug: "nef-20", when: "工业场地，约 1 公顷以内雨水排口" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "可以不设沉砂池吗？",
        a: "只有确实无砂的场合可以——例如地面清洁的室内停车场。加油站、洗车场和露天场地必须设置：磨料会堵塞斜板模块。",
      },
      {
        q: "检测超过 1,0 mg/l，是设备不合格吗？",
        a: "大概率不是。聚结重力分离的物理极限是 5 mg/l——无药剂处理的最佳结果。合同若写个位数，需在下游加吸附单元。另请检查含洗涤剂的洗车水是否进入同一管线：除油器不处理乳化液。",
      },
      {
        q: "冬天怎么办？",
        a: "壳体埋于冻土层以下，重力运行——冬季无需停机或放空。唯一要求是盖板保持可开启以便维护。",
      },
      {
        q: "维护频率？",
        a: "每月用量尺经检修口检查油层厚度和砂位一次；按充满程度清掏——每个型号都标明蓄积容积。加油站典型周期为每季度一次。",
      },
    ],
    allTitle: "两个系列",
    allButton: "除油器与沉砂池",
    allHref: "/products#oil-separators",
    ctaTitle: "发来场地平面图——\n我们返回计算。",
    ctaText:
      "需要面积与铺装类型、场地用途和接入点排水标高。我们将返回设计流量、沉砂池+除油器成套选型和施工图。",
    ctaButton: "获取计算",
  },
};

export default content;
