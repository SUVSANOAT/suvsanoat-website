import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Ташкент», «очистные
 * сооружения купить Ташкент», «oqova suv tozalash Toshkent».
 * Главная городская страница: производство находится в Ташкенте.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ТАШКЕНТ И ТАШКЕНТСКАЯ ОБЛАСТЬ",
    title: "Очистные сооружения\nв Ташкенте.",
    intro:
      "Мы не возим очистные из-за границы — мы производим их в Ташкенте, на собственном участке: корпуса из стеклопластика, внутренние узлы, обвязку. Проектируем по нормам КМК, монтируем и запускаем сами. От жироуловителя для кафе до станции биологической очистки посёлка.",
    sections: [
      {
        title: "Почему заказывать очистные в Ташкенте выгоднее, чем везти",
        text: [
          "Очистное сооружение — не коробочный товар: корпус делается под отметку вашего коллектора, глубину заложения и грунтовые воды. Когда производство в другом городе или стране, каждое уточнение — это недели переписки, а негабаритный корпус — отдельная перевозка. Когда производство в Ташкенте, инженер смотрит объект, а корпус наматывается под ваш размер на нашем участке.",
          "Второе — ответственность. Мы сами проектируем, сами производим, сами монтируем и сами запускаем. Если на объекте что-то не так, вопрос решает производитель, а не цепочка «дилер — импортёр — завод за границей».",
          "Третье — обслуживание и запчасти. Ресурсные узлы — насосы, воздуходувки, электроды — стандартные и есть на нашем складе. Корпусные и внутренние детали изготавливаются на месте.",
        ],
      },
      {
        title: "Что мы производим для города и области",
        text: [
          "Локальные очистные сооружения (ЛОС БИО) для коттеджей, посёлков, гостиниц и объектов без централизованной канализации — биологическая очистка с выходом на сброс или полив. Канализационные насосные станции (КНС), когда сток нужно поднимать. Жироуловители для кафе, ресторанов и пищевых производств. Нефтеуловители для автомоек, АЗС и паркингов. Подземные резервуары и ёмкости из стеклопластика. Электролизные установки обеззараживания и станции дозирования.",
          "Все корпуса — стеклопластик собственной намотки с кольцами жёсткости: не гниёт, не ржавеет, легче металла, срок службы десятилетия. Расчёт корпуса на грунт и всплытие выдаём с изделием.",
          "Цены не публикуем не из скрытности: стоимость честно зависит от расхода, глубины и комплектации. Пришлите данные объекта — вернём подбор модели и коммерческое предложение с ценой.",
        ],
      },
      {
        title: "Как идёт заказ",
        text: [
          "Вы оставляете заявку или звоните. Мы запрашиваем исходные данные: тип объекта, расход или число пользователей, куда сброс, отметки коллектора. Считаем по нормам КМК 2.04.03-19 и КМК 2.04.01-98 — расчёт открытый, его можно показать проектировщику и экспертизе.",
          "Дальше — коммерческое предложение с моделью, характеристиками и ценой, производство на участке в Ташкенте, доставка на объект, монтаж, пусконаладка и вывод на показатели. Документация и паспорта — с изделием.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи Ташкента и области — и модели, с которых стоит начать разговор. Точный подбор — по данным объекта.",
    picks: [
      { slug: "bio-10", when: "Коттедж, гостиница, ~50 жителей" },
      { slug: "bio-50", when: "Посёлок, санаторий" },
      { slug: "kns-25", when: "Перекачка стоков посёлка" },
      { slug: "zhir-3", when: "Кафе, ресторан" },
      { slug: "nef-10", when: "Автомойка, АЗС, паркинг" },
      { slug: "rez-50", when: "Запас воды, накопитель" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Сколько стоят очистные сооружения?",
        a: "Зависит от трёх вещей: расход (м³/сут), глубина подводящего коллектора и комплектация (класс очистки, обеззараживание, автоматика). Поэтому вместо прайса мы делаем расчёт: пришлите данные объекта — вернём конкретную модель и коммерческое предложение с ценой. Расчёт и подбор бесплатны.",
      },
      {
        q: "Вы производите в Ташкенте или привозите?",
        a: "Производим в Ташкенте: намотка стеклопластиковых корпусов, внутренние перегородки, обвязка, металлоконструкции — наш участок. Покупными остаются насосы, воздуходувки и КИП — их марки указываем в предложении открыто.",
      },
      {
        q: "Работаете только по Ташкенту?",
        a: "Нет: Ташкент и область — основная география, но производим и доставляем по всему Узбекистану — Самарканд, Бухара, Фергана, Наманган, Навои и другие регионы. Монтаж и пусконаладка — наши бригады.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Технологический расчёт по КМК, паспорт изделия, схемы установки, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания. Для проектировщиков есть отдельный раздел с типовыми узлами.",
      },
      {
        q: "Почему стеклопластик, а не металл или бетон?",
        a: "Стеклопластик не корродирует в стоках и хлорной среде, весит в разы меньше бетона (проще доставка и монтаж), корпус монолитный — не течёт по швам. Жёсткость набирается кольцами, расчёт выдаём с изделием. Срок службы — десятилетия без покраски и гидроизоляции.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Опишите объект —\nвернём расчёт и цену.",
    ctaText:
      "Тип объекта, расход или число пользователей, куда сброс. Вернём подбор модели, характеристики и коммерческое предложение. Производство — Ташкент.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
  },

  uz: {
    label: "TOSHKENT VA TOSHKENT VILOYATI",
    title: "Toshkentda tozalash\ninshootlari.",
    intro:
      "Biz tozalash inshootlarini chetdan olib kelmaymiz — Toshkentdagi o‘z uchastkamizda ishlab chiqaramiz: shishatolali korpuslar, ichki uzellar, obvyazka. KMK me’yorlari bo‘yicha loyihalaymiz, o‘zimiz o‘rnatamiz va ishga tushiramiz. Kafe uchun yog‘ tutgichdan qishloq biologik tozalash stansiyasigacha.",
    sections: [
      {
        title: "Nega Toshkentda buyurtma qilish olib kelishdan foydali",
        text: [
          "Tozalash inshooti — quti mahsulot emas: korpus kollektoringiz belgisi, ko‘mish chuqurligi va sizot suvlariga qarab tayyorlanadi. Ishlab chiqarish boshqa shaharda bo‘lsa, har bir aniqlik — haftalab yozishma. Ishlab chiqarish Toshkentda bo‘lsa, muhandis obyektni ko‘radi, korpus esa uchastkamizda sizning o‘lchamingizga o‘raladi.",
          "Ikkinchisi — mas’uliyat. O‘zimiz loyihalaymiz, o‘zimiz ishlab chiqaramiz, o‘zimiz o‘rnatamiz va ishga tushiramiz. Obyektda muammo bo‘lsa, uni ishlab chiqaruvchi hal qiladi — «diler — importchi — chet el zavodi» zanjiri emas.",
          "Uchinchisi — xizmat va ehtiyot qismlar. Resursli uzellar — nasoslar, havo purkagichlar, elektrodlar — standart va omborimizda bor. Korpus detallari joyida tayyorlanadi.",
        ],
      },
      {
        title: "Shahar va viloyat uchun nima ishlab chiqaramiz",
        text: [
          "Markaziy kanalizatsiyasiz obyektlar uchun lokal tozalash inshootlari (LOS BIO) — kottejlar, qishloqlar, mehmonxonalar. Oqavani ko‘tarish uchun KNS. Kafe va restoranlar uchun yog‘ tutgichlar. Avtoyuvish, ShAQSh va parkinglar uchun neft tutgichlar. Shishatolali yer osti rezervuarlari. Elektroliz zararsizlantirish qurilmalari va dozalash stansiyalari.",
          "Barcha korpuslar — qattiqlik halqali o‘z o‘ramimizdagi shishatolali plastik: chirimaydi, zang bosmaydi, metalldan yengil, xizmat muddati o‘n yillab.",
          "Narxlarni yashirganimizdan e’lon qilmaymiz: qiymat sarf, chuqurlik va komplektatsiyaga bog‘liq. Obyekt ma’lumotlarini yuboring — model tanlovi va narx bilan tijorat taklifini qaytaramiz.",
        ],
      },
      {
        title: "Buyurtma qanday boradi",
        text: [
          "Ariza qoldirasiz yoki qo‘ng‘iroq qilasiz. Boshlang‘ich ma’lumotlarni so‘raymiz: obyekt turi, sarf yoki foydalanuvchilar soni, oqava qayerga ketadi, kollektor belgilari. KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha hisoblaymiz — hisob ochiq, uni loyihachi va ekspertizaga ko‘rsatish mumkin.",
          "Keyin — model, xususiyatlar va narx bilan tijorat taklifi, Toshkentdagi uchastkada ishlab chiqarish, obyektga yetkazish, montaj, ishga tushirish. Hujjatlar va pasportlar — mahsulot bilan.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Toshkent va viloyatning tipik vazifalari — suhbatni boshlash uchun modellar. Aniq tanlov — obyekt ma’lumotlari bo‘yicha.",
    picks: [
      { slug: "bio-10", when: "Kottej, mehmonxona, ~50 kishi" },
      { slug: "bio-50", when: "Qishloq, sanatoriy" },
      { slug: "kns-25", when: "Qishloq oqavasini haydash" },
      { slug: "zhir-3", when: "Kafe, restoran" },
      { slug: "nef-10", when: "Avtoyuvish, ShAQSh, parking" },
      { slug: "rez-50", when: "Suv zaxirasi, to‘plagich" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Tozalash inshootlari qancha turadi?",
        a: "Uch narsaga bog‘liq: sarf (m³/sut), keluvchi kollektor chuqurligi va komplektatsiya (tozalash darajasi, zararsizlantirish, avtomatika). Shuning uchun prays o‘rniga hisob qilamiz: obyekt ma’lumotlarini yuboring — aniq model va narx bilan taklif qaytaramiz. Hisob va tanlov bepul.",
      },
      {
        q: "Toshkentda ishlab chiqarasizmi yoki olib kelasizmi?",
        a: "Toshkentda ishlab chiqaramiz: shishatolali korpuslar o‘rami, ichki to‘siqlar, obvyazka, metall konstruksiyalar — bizning uchastka. Nasoslar, havo purkagichlar va KIP — sotib olinadi, markalarini taklifda ochiq yozamiz.",
      },
      {
        q: "Faqat Toshkent bo‘yichami?",
        a: "Yo‘q: Toshkent va viloyat — asosiy geografiya, lekin butun O‘zbekiston bo‘ylab ishlab chiqaramiz va yetkazamiz — Samarqand, Buxoro, Farg‘ona, Namangan, Navoiy va boshqa hududlar. Montaj va ishga tushirish — o‘z brigadalarimiz.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "KMK bo‘yicha texnologik hisob, mahsulot pasporti, o‘rnatish sxemalari, korpusning grunt yuklari va suzib chiqishga hisobi, ekspluatatsiya qo‘llanmasi va xizmat reglamenti.",
      },
      {
        q: "Nega shishatolali plastik, metall yoki beton emas?",
        a: "Shishatolali plastik oqava va xlorli muhitda zanglamaydi, betondan ancha yengil (yetkazish va montaj oson), korpus yaxlit — choklardan oqmaydi. Xizmat muddati — bo‘yoqsiz va gidroizolyatsiyasiz o‘n yillab.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Obyektni tasvirlab bering —\nhisob va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, sarf yoki foydalanuvchilar soni, oqava qayerga ketadi. Model tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "HISOBNI OLISH",
  },

  en: {
    label: "TASHKENT AND TASHKENT REGION",
    title: "Wastewater treatment\nplants in Tashkent.",
    intro:
      "We do not import treatment plants — we manufacture them in Tashkent at our own facility: fiberglass tanks, internals, piping. We design to KMK codes, install and commission ourselves. From a grease trap for a cafe to a biological treatment plant for a settlement.",
    sections: [
      {
        title: "Why ordering locally beats importing",
        text: [
          "A treatment plant is not an off-the-shelf product: the tank is built to your collector invert, burial depth and groundwater level. With local manufacturing, an engineer visits the site and the tank is wound to your size at our facility in Tashkent.",
          "Single responsibility: we design, manufacture, install and commission. Any site issue is solved by the manufacturer, not a dealer-importer chain.",
          "Service and spares: wear parts — pumps, blowers, electrodes — are standard and stocked; tank and internal parts are made locally.",
        ],
      },
      {
        title: "What we build for the city and the region",
        text: [
          "Package biological treatment plants (BIO) for houses, settlements and hotels without central sewerage. Sewage pumping stations (KNS). Grease traps for restaurants and food production. Oil separators for car washes, filling stations and parkings. Underground fiberglass tanks. Electrolytic disinfection units and dosing stations.",
          "All shells are filament-wound fiberglass with stiffening rings: no corrosion, decades of service life, much lighter than concrete.",
          "We do not publish prices because cost honestly depends on flow, depth and configuration. Send your site data — we return a model selection and a quotation.",
        ],
      },
      {
        title: "How an order goes",
        text: [
          "You send an inquiry. We request the basics: facility type, flow or number of users, discharge point, collector elevations. We calculate to KMK 2.04.03-19 and KMK 2.04.01-98 — the calculation is open and can be shown to your designer.",
          "Then: a quotation with model and price, manufacturing in Tashkent, delivery, installation, commissioning. Documentation comes with the unit.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical tasks in Tashkent and the region — models to start the conversation. Exact selection is based on site data.",
    picks: [
      { slug: "bio-10", when: "House, hotel, ~50 users" },
      { slug: "bio-50", when: "Settlement, resort" },
      { slug: "kns-25", when: "Settlement sewage pumping" },
      { slug: "zhir-3", when: "Cafe, restaurant" },
      { slug: "nef-10", when: "Car wash, filling station" },
      { slug: "rez-50", when: "Water storage" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How much does a treatment plant cost?",
        a: "It depends on flow (m³/day), collector depth and configuration (treatment class, disinfection, automation). Send your site data — we return a specific model and a quotation. Selection is free.",
      },
      {
        q: "Do you manufacture in Tashkent or import?",
        a: "We manufacture in Tashkent: fiberglass winding, internals, piping and steelwork are ours. Pumps, blowers and instruments are bought-in; brands are stated openly in the quotation.",
      },
      {
        q: "Do you work outside Tashkent?",
        a: "Yes — we deliver and install across Uzbekistan: Samarkand, Bukhara, Fergana, Namangan, Navoi and other regions.",
      },
      {
        q: "What documents do you provide?",
        a: "Process calculation to KMK codes, product passport, installation drawings, buoyancy and soil load calculation, operation manual and maintenance schedule.",
      },
      {
        q: "Why fiberglass?",
        a: "It does not corrode in sewage and chlorine media, is far lighter than concrete, and the monolithic shell has no leaking joints. Decades of service without coating or waterproofing.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Describe your site —\nget a selection and a price.",
    ctaText:
      "Facility type, flow or number of users, discharge point. We return a model selection, specifications and a quotation. Manufactured in Tashkent.",
    ctaButton: "GET A QUOTE",
  },

  zh: {
    label: "塔什干及塔什干州",
    title: "塔什干\n污水处理设备。",
    intro:
      "我们不进口成套设备——在塔什干自有工厂生产：玻璃钢罐体、内部构件、管路。按 KMK 标准设计，自行安装调试。从餐厅隔油器到村镇生物处理站。",
    sections: [
      {
        title: "本地生产的优势",
        text: [
          "处理设备不是现成商品：罐体按您的管道标高、埋深和地下水位定制。生产就在塔什干——工程师到现场勘察，罐体按需缠绕成型。",
          "责任统一：设计、生产、安装、调试都是我们。现场问题由制造商直接解决。",
          "服务与备件：泵、风机、电极等易损件为标准件且有库存，罐体部件本地制造。",
        ],
      },
      {
        title: "产品范围",
        text: [
          "无市政管网对象的一体化生物处理设备（BIO）、污水提升泵站（KNS）、餐饮隔油器、洗车场/加油站油水分离器、玻璃钢地埋罐、电解消毒装置与加药站。",
          "罐体均为带加强环的缠绕玻璃钢：不腐蚀、寿命数十年、重量远轻于混凝土。",
          "价格取决于流量、埋深与配置。提供对象数据，我们回复选型与报价。",
        ],
      },
      {
        title: "订购流程",
        text: [
          "提交询价——我们索取基础数据（对象类型、流量或人数、排放去向、管道标高），按 KMK 2.04.03-19 与 KMK 2.04.01-98 计算，计算书公开。",
          "随后：报价（型号+价格）、塔什干生产、运输、安装、调试。随货提供全套文件。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "塔什干及州内的典型任务与推荐起点型号。精确选型依据对象数据。",
    picks: [
      { slug: "bio-10", when: "别墅、酒店，约50人" },
      { slug: "bio-50", when: "村镇、疗养院" },
      { slug: "kns-25", when: "村镇污水提升" },
      { slug: "zhir-3", when: "咖啡馆、餐厅" },
      { slug: "nef-10", when: "洗车场、加油站" },
      { slug: "rez-50", when: "储水罐" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "污水处理设备多少钱？",
        a: "取决于流量（m³/日）、管道埋深与配置（处理等级、消毒、自控）。发送对象数据，我们回复具体型号与报价，选型免费。",
      },
      {
        q: "在塔什干生产还是进口？",
        a: "塔什干生产：玻璃钢缠绕、内部构件、管路与钢结构为自产；泵、风机、仪表为外购件，品牌在报价中公开注明。",
      },
      {
        q: "只服务塔什干吗？",
        a: "不，供货与安装覆盖乌兹别克斯坦全境：撒马尔罕、布哈拉、费尔干纳、纳曼干、纳沃伊等。",
      },
      {
        q: "提供哪些文件？",
        a: "KMK 工艺计算书、产品合格证、安装图、抗浮与土压计算、运行手册与维护规程。",
      },
      {
        q: "为什么用玻璃钢？",
        a: "在污水和含氯介质中不腐蚀，比混凝土轻得多，整体罐无渗漏接缝，数十年免维护。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "描述您的对象——\n我们回复选型与价格。",
    ctaText: "对象类型、流量或人数、排放去向。我们回复选型、参数与报价。塔什干生产。",
    ctaButton: "获取报价",
  },
};

export default content;
