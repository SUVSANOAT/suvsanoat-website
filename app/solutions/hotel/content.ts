import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные для гостиницы / базы отдыха /
 * санатория». Ведёт на линейки БИО, ЖИР, КНС.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ГОСТИНИЦЫ И БАЗЫ ОТДЫХА",
    title: "Канализация гостиницы:\nсчитаем по номерам и кухне.",
    intro:
      "Гостиница, санаторий или зона отдыха за городом — это свой сток, свой ресторан и часто своя канализация. Разбираем, как считается расход, зачем кухне отдельный жироуловитель и что делать с сезонностью.",
    sections: [
      {
        title: "Чем сток гостиницы отличается от посёлка",
        text: [
          "Норма на гостя выше, чем на жителя: к душу и санузлу добавляются прачечная, кухня и уборка номеров. В расчёт идёт 250–300 литров на место в сутки против 200 у жилья, плюс сток ресторана, если он открыт для гостей «с улицы».",
          "Второе отличие — неравномерность. Утренний пик, когда сто человек одновременно принимают душ, в три-четыре раза выше среднечасового расхода. Поэтому в схеме гостиницы усреднитель — не опция: без него аэротенк пришлось бы считать на пиковый час и переплачивать за объём вдвое.",
          "Третье — кухня. Ресторан гостиницы даёт жирный сток, который угнетает биологию. Жироуловитель на выпуске кухни, до смешения с бытовым стоком — обязательная часть схемы, и подбирается он по посудомоечным машинам, а не по числу столиков.",
        ],
      },
      {
        title: "Состав решения и подбор",
        text: [
          "Типовая схема: жироуловитель на кухне → усреднитель → биологическая очистка БИО → обеззараживание при сбросе на рельеф или повторном использовании на полив территории. При низкой площадке добавляется КНС.",
          "Ряд БИО закрывает объекты от гостевого дома до санатория: до 25 м³/сут — один корпус, выше — модульное исполнение из нескольких корпусов заводской готовности. Гостиница на 200 номеров — это ориентировочно 100–150 м³/сут: БИО-100 или БИО-150 из трёх-четырёх корпусов, смонтированных за неделю.",
          "Сезонность решается режимом запуска: за две-три недели до сезона установка выводится на нагрузку по графику, который мы передаём с изделием. Для круглогодичных объектов с зимним минимумом предусматривается работа части модулей.",
        ],
      },
    ],
    pickTitle: "Ориентиры по вместимости",
    pickText:
      "Расход принят 250–300 л на место с учётом ресторана и прачечной. Точный подбор — по числу номеров, посадочным местам ресторана и составу прачечной.",
    picks: [
      { slug: "bio-10", when: "Гостевой дом до ~35 мест" },
      { slug: "bio-15", when: "Мини-отель до ~50 мест" },
      { slug: "bio-25", when: "Отель или база до ~90 мест" },
      { slug: "bio-50", when: "Отель до ~180 мест, 2 корпуса" },
      { slug: "bio-100", when: "Гостиница до ~350 мест, 3 корпуса" },
      { slug: "zhir-5", when: "Жироуловитель кухни ресторана" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Объект работает три месяца в году. Биология выживет?",
        a: "В межсезонье — нет, и это надо планировать, а не игнорировать. Установка консервируется на зиму по инструкции, а за две-три недели до заезда выводится на режим: заполнение, посев ила, ступенчатая нагрузка. График запуска передаём с изделием, первый запуск делаем сами.",
      },
      {
        q: "Можно ли поливать территорию очищенной водой?",
        a: "Технически вода после БИО с обеззараживанием пригодна для полива зелёных насаждений через накопитель. Юридически повторное использование согласуется с санитарной службой — мы готовим для этого протоколы качества и схему. Прямой полив без обеззараживания не допускается.",
      },
      {
        q: "Гостей мало, но по выходным аншлаг. Что с этим делать?",
        a: "Это решает усреднитель: он принимает субботний пик и отдаёт его биологии равномерно за сутки. Его объём считается по графику заезда — пришлите загрузку по дням недели, и усреднитель будет посчитан, а не угадан.",
      },
      {
        q: "Прачечная со стиральными машинами — проблема для биологии?",
        a: "Обычные стиральные порошки биология переносит. Проблема — хлорные отбеливатели и дезинфектанты залповыми сливами: их в канализацию направлять нельзя. Для прачечных с хлорной обработкой предусматривается отдельный приём с нейтрализацией — скажите об этом на этапе подбора.",
      },
      {
        q: "Что по запаху рядом с зоной отдыха?",
        a: "Аэробная установка при исправной вентиляции не пахнет: вытяжной стояк выводится выше кровли технического блока. Плюс планировка: очистные размещаются с подветренной стороны и не ближе нормативного разрыва до жилых корпусов — расстояние подскажем под ваш генплан.",
      },
    ],
    allTitle: "ЛИНЕЙКА БИО",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products#bio-plants",
    ctaTitle: "Пришлите число номеров\nи план площадки.",
    ctaText:
      "Достаточно вместимости, состава кухни и прачечной и отметок площадки. Вернём расчёт расхода, схему с усреднителем и жироуловителем и подбор моделей.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
  },

  uz: {
    label: "MEHMONXONA VA DAM OLISH MASKANLARI",
    title: "Mehmonxona kanalizatsiyasi:\nxona va oshxona bo‘yicha hisoblaymiz.",
    intro:
      "Shahar tashqarisidagi mehmonxona, sanatoriy yoki dam olish zonasi — bu o‘z oqavasi, o‘z restorani va ko‘pincha o‘z kanalizatsiyasi. Sarf qanday hisoblanadi, oshxonaga nega alohida yog‘ tutgich kerak va mavsumiylik bilan nima qilish kerak.",
    sections: [
      {
        title: "Mehmonxona oqavasi qishloqnikidan nimasi bilan farq qiladi",
        text: [
          "Mehmon uchun me’yor aholinikidan yuqori: dush va sanuzelga kir yuvish, oshxona va xona tozalash qo‘shiladi. Hisobga sutkasiga bir o‘ringa 250–300 litr olinadi (turar joyda 200), plyus restoran oqavasi.",
          "Ikkinchi farq — notekislik. Yuz kishi bir vaqtda dush qabul qiladigan ertalabki pik o‘rtacha soatlik sarfdan uch-to‘rt barobar yuqori. Shuning uchun mehmonxona sxemasida tenglashtirgich opsiya emas: usiz aerotenkni pik soatga hisoblab, hajm uchun ikki barobar ortiqcha to‘lashga to‘g‘ri kelardi.",
          "Uchinchisi — oshxona. Restoran yog‘li oqava beradi, u biologiyani bo‘g‘adi. Oshxona chiqishidagi yog‘ tutgich, maishiy oqava bilan aralashishdan oldin — sxemaning majburiy qismi.",
        ],
      },
      {
        title: "Yechim tarkibi va tanlov",
        text: [
          "Tipik sxema: oshxonada yog‘ tutgich → tenglashtirgich → BIO biologik tozalash → relyefga tashlash yoki hududni sug‘orishda qayta ishlatishda zararsizlantirish. Past maydonchada KNS qo‘shiladi.",
          "BIO qatori mehmon uyidan sanatoriygacha yopadi: 25 m³/sut gacha — bitta korpus, undan yuqorisi — zavod tayyorligidagi bir necha korpusli modulli ishlanma. 200 xonali mehmonxona — taxminan 100–150 m³/sut: uch-to‘rt korpusdan iborat BIO-100 yoki BIO-150, bir haftada montaj qilinadi.",
          "Mavsumiylik ishga tushirish rejimi bilan hal qilinadi: mavsumdan ikki-uch hafta oldin qurilma jadval bo‘yicha yuklamaga chiqariladi.",
        ],
      },
    ],
    pickTitle: "Sig‘im bo‘yicha mo‘ljallar",
    pickText:
      "Sarf restoran va kir yuvishni hisobga olib bir o‘ringa 250–300 l qabul qilingan. Aniq tanlov — xonalar soni va restoran o‘rinlari bo‘yicha.",
    picks: [
      { slug: "bio-10", when: "~35 o‘ringacha mehmon uyi" },
      { slug: "bio-15", when: "~50 o‘ringacha mini-mehmonxona" },
      { slug: "bio-25", when: "~90 o‘ringacha mehmonxona yoki maskan" },
      { slug: "bio-50", when: "~180 o‘ringacha, 2 korpus" },
      { slug: "bio-100", when: "~350 o‘ringacha, 3 korpus" },
      { slug: "zhir-5", when: "Restoran oshxonasining yog‘ tutgichi" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Obyekt yiliga uch oy ishlaydi. Biologiya omon qoladimi?",
        a: "Mavsumlararo — yo‘q, buni rejalashtirish kerak. Qurilma qishga yo‘riqnoma bo‘yicha konservatsiya qilinadi, kelishdan ikki-uch hafta oldin rejimga chiqariladi: to‘ldirish, il ekish, bosqichli yuklama. Birinchi ishga tushirishni o‘zimiz bajaramiz.",
      },
      {
        q: "Hududni tozalangan suv bilan sug‘orish mumkinmi?",
        a: "Texnik jihatdan BIO dan keyin zararsizlantirilgan suv to‘plagich orqali ko‘kalamzorlarni sug‘orishga yaroqli. Yuridik jihatdan qayta ishlatish sanitariya xizmati bilan kelishiladi — buning uchun sifat protokollari va sxemani tayyorlaymiz.",
      },
      {
        q: "Mehmon kam, lekin dam olish kunlari to‘la. Nima qilish kerak?",
        a: "Buni tenglashtirgich hal qiladi: shanba pikini qabul qilib, biologiyaga sutka davomida tekis uzatadi. Hajmi kelish grafigi bo‘yicha hisoblanadi.",
      },
      {
        q: "Kir yuvish mashinalari biologiyaga muammomi?",
        a: "Oddiy kukunlarni biologiya ko‘taradi. Muammo — xlorli oqartirgichlar va dezinfektantlarning to‘satdan tashlanishi: ularni kanalizatsiyaga yo‘naltirish mumkin emas. Xlorli ishlov beriladigan kir yuvish uchun neytralizatsiyali alohida qabul ko‘zda tutiladi.",
      },
      {
        q: "Dam olish zonasi yonida hid-chi?",
        a: "Aerob qurilma soz ventilyatsiyada hidlanmaydi: chiqarish stoyakasi texnik blok tomidan yuqoriga chiqariladi. Plyus joylashuv: tozalash inshootlari shamol ostidagi tomonda va turar korpuslargacha me’yoriy masofada joylashtiriladi.",
      },
    ],
    allTitle: "BIO LINIYASI",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products#bio-plants",
    ctaTitle: "Xonalar soni va maydoncha\nrejasini yuboring.",
    ctaText:
      "Sig‘im, oshxona va kir yuvish tarkibi, maydoncha belgilari yetarli. Sarf hisobi, tenglashtirgich va yog‘ tutgichli sxema hamda model tanlovini qaytaramiz.",
    ctaButton: "HISOBNI OLISH",
  },

  en: {
    label: "HOTELS AND RESORTS",
    title: "Hotel sewage: sized by\nrooms and the kitchen.",
    intro:
      "A hotel, sanatorium or resort outside the city means its own wastewater, its own restaurant and often its own treatment. How the flow is calculated, why the kitchen needs its own grease trap, and what to do about seasonality.",
    sections: [
      {
        title: "How hotel wastewater differs from a settlement",
        text: [
          "The per-guest rate is higher than per-resident: laundry, kitchen and housekeeping add to the shower and bathroom. We design at 250–300 litres per bed per day against 200 for housing, plus the restaurant where it serves outside guests.",
          "The second difference is unevenness. The morning peak, when a hundred guests shower at once, runs three to four times the hourly average. A balancing tank is therefore not an option but a requirement — without it the aeration tank would be sized for the peak hour at twice the volume.",
          "The third is the kitchen. A hotel restaurant produces fatty wastewater that suppresses the biology. A grease trap on the kitchen outlet, before mixing with domestic flow, is a mandatory part of the scheme — sized by dishwashers, not tables.",
        ],
      },
      {
        title: "The scheme and the selection",
        text: [
          "The typical train: kitchen grease trap → balancing tank → BIO biological treatment → disinfection where water is discharged to grade or reused for irrigation. A pumping station is added on low sites.",
          "The BIO range covers guest houses to sanatoria: up to 25 m³/day in one shell, above that in factory-built modules. A 200-room hotel is roughly 100–150 m³/day — a BIO-100 or BIO-150 of three-four shells, installed within a week.",
          "Seasonality is handled by a start-up regime: two-three weeks before the season the plant is brought to load on a schedule we hand over with the product.",
        ],
      },
    ],
    pickTitle: "Guides by capacity",
    pickText:
      "Flow taken at 250–300 l per bed including restaurant and laundry. The exact selection follows from rooms, restaurant covers and laundry equipment.",
    picks: [
      { slug: "bio-10", when: "Guest house up to ~35 beds" },
      { slug: "bio-15", when: "Small hotel up to ~50 beds" },
      { slug: "bio-25", when: "Hotel or resort up to ~90 beds" },
      { slug: "bio-50", when: "Hotel up to ~180 beds, 2 shells" },
      { slug: "bio-100", when: "Hotel up to ~350 beds, 3 shells" },
      { slug: "zhir-5", when: "Restaurant kitchen grease trap" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "The resort runs three months a year. Will the biology survive?",
        a: "Off-season — no, and that is planned for, not ignored. The plant is winterised per the manual and brought back to load two-three weeks before opening: filling, seeding, stepped loading. We hand over the start-up schedule and perform the first start ourselves.",
      },
      {
        q: "Can treated water irrigate the grounds?",
        a: "Technically, BIO effluent with disinfection suits landscape irrigation via a storage tank. Legally, reuse is agreed with the sanitary authority — we prepare the quality protocols and the scheme for that.",
      },
      {
        q: "Quiet weekdays, packed weekends — what then?",
        a: "That is the balancing tank's job: it absorbs the Saturday peak and feeds it to the biology evenly over the day. Its volume is calculated from the occupancy profile — send it, and the tank is calculated rather than guessed.",
      },
      {
        q: "Is the laundry a problem for the biology?",
        a: "Ordinary detergents are tolerated. The problem is chlorine bleach and disinfectants in slugs: they must not go to the sewer. Laundries with chlorine treatment get a separate reception with neutralisation — flag it at selection.",
      },
      {
        q: "What about smell next to a recreation area?",
        a: "An aerobic plant with working ventilation does not smell: the vent stack rises above the technical block. Layout matters too: the plant sits downwind and at the normative distance from accommodation — we advise against your master plan.",
      },
    ],
    allTitle: "THE BIO LINE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products#bio-plants",
    ctaTitle: "Send the room count\nand the site plan.",
    ctaText:
      "Capacity, the kitchen and laundry composition, and the site levels are enough. We return the flow calculation, the scheme with balancing and grease removal, and the model selection.",
    ctaButton: "GET THE CALCULATION",
  },

  zh: {
    label: "酒店与度假区",
    title: "酒店排水：按客房\n和厨房计算。",
    intro:
      "城外的酒店、疗养院或度假区意味着自己的污水、自己的餐厅、往往还有自己的处理设施。流量如何计算、厨房为何要单独的隔油器、季节性如何处理。",
    sections: [
      {
        title: "酒店污水与村镇的区别",
        text: [
          "每位客人的定额高于居民：淋浴和卫生间之外还有洗衣房、厨房和客房清洁。设计取每床位每天 250–300 升（住宅为 200），对外营业的餐厅另计。",
          "第二是不均匀性。一百位客人同时淋浴的早高峰是平均小时流量的三到四倍。因此调节池在酒店方案中不是选项而是必需——否则曝气池就要按峰值小时放大一倍。",
          "第三是厨房。酒店餐厅产生的含油污水抑制生物系统。厨房出口的隔油器——在与生活污水混合之前——是方案的强制组成，按洗碗机而非餐桌数选型。",
        ],
      },
      {
        title: "方案构成与选型",
        text: [
          "典型流程：厨房隔油器 → 调节池 → BIO 生物处理 → 排放地表或绿化回用时消毒。场地低洼时增设泵站。",
          "BIO 系列覆盖民宿到疗养院：25 m³/d 以内单壳体，以上为工厂预制的多壳体模块。200 间客房约合 100–150 m³/d——三四个壳体的 BIO-100 或 BIO-150，一周内安装完毕。",
          "季节性靠启动方案解决：开季前两三周按随产品移交的计划将设备逐步带载。",
        ],
      },
    ],
    pickTitle: "按接待能力的参考",
    pickText: "流量按每床位 250–300 升取值，含餐厅和洗衣房。精确选型按客房数、餐位数和洗衣设备确定。",
    picks: [
      { slug: "bio-10", when: "约 35 床以内民宿" },
      { slug: "bio-15", when: "约 50 床以内小型酒店" },
      { slug: "bio-25", when: "约 90 床以内酒店或度假村" },
      { slug: "bio-50", when: "约 180 床以内，2 壳体" },
      { slug: "bio-100", when: "约 350 床以内，3 壳体" },
      { slug: "zhir-5", when: "餐厅厨房隔油器" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "度假区一年只营业三个月，生物系统能活吗？",
        a: "淡季不能——这要规划而不是回避。设备按说明书越冬封存，开季前两三周恢复负荷：注水、接种污泥、阶梯加载。启动计划随产品移交，首次启动由我们执行。",
      },
      {
        q: "处理后的水能浇灌园区吗？",
        a: "技术上，BIO 出水经消毒后可经储水箱用于绿化浇灌。法律上，回用需与卫生部门协商——我们为此准备水质报告和方案。",
      },
      {
        q: "平日冷清、周末爆满怎么办？",
        a: "这正是调节池的工作：吸纳周六的峰值，均匀地在一昼夜内送入生物段。其容积按入住曲线计算——发来数据，容积就是算出来的而不是猜的。",
      },
      {
        q: "洗衣房对生物系统有影响吗？",
        a: "常规洗涤剂可以耐受。问题是含氯漂白剂和消毒剂的瞬时排放：不得进入下水道。使用氯处理的洗衣房需设带中和的单独接收——选型时请说明。",
      },
      {
        q: "紧邻休闲区会有异味吗？",
        a: "通风正常的好氧设备无异味：排气立管高出设备间屋面。布局同样重要：设施位于下风向并与客房保持规范距离——我们按您的总图给出建议。",
      },
    ],
    allTitle: "BIO 系列",
    allButton: "查看全部型号",
    allHref: "/products#bio-plants",
    ctaTitle: "发来客房数\n和场地平面图。",
    ctaText: "接待能力、厨房与洗衣房配置、场地标高即可。我们将返回流量计算、含调节与隔油的方案及型号选型。",
    ctaButton: "获取计算",
  },
};

export default content;
