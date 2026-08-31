import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Наманган», «ЛОС Наманган»,
 * «очистка стоков текстильного производства», «tozalash inshootlari Namangan».
 * Специфика региона: текстиль и крашение, пищевые цеха, новые массивы
 * и махалли без централизованной канализации.
 */

const content: SolutionContentSet = {
  ru: {
    label: "НАМАНГАН И НАМАНГАНСКАЯ ОБЛАСТЬ",
    title: "Очистные сооружения\nв Намангане.",
    intro:
      "Производство у нас в Ташкенте, до Намангана ≈290 км — везём, монтируем и запускаем сами. Корпуса из стеклопластика собственной намотки, расчёт по нормам КМК. Для хозбытовых объектов подбор идёт по расходу, для стоков крашения и отделки — только после анализа стока.",
    sections: [
      {
        title: "Что чаще всего приходится чистить в Намангане",
        text: [
          "Наманганская заявка редко бывает «просто хозбытовой». Область живёт текстилем и швейным производством, и вместе с цехом почти всегда идёт крашение, отделка или как минимум промывка. Рядом — пищевые цеха, кафе и столовые, автомойки, а также новые жилые массивы и махалли, которые застраиваются быстрее, чем к ним доходит городской коллектор.",
          "Отсюда два разных типа задач. Хозбытовой сток махалли, гостиницы или столовой считается обычным путём — здесь работают серийные решения. Производственный сток красильного участка так считать нельзя: по составу это другая вода, и схема под неё собирается отдельно.",
        ],
      },
      {
        title: "Стоки крашения: сначала анализ, потом схема",
        text: [
          "Вода после крашения и отделки отличается от хозбытовой по всем ключевым параметрам: цветность, поверхностно-активные вещества, повышенная температура и, главное, залповый характер сброса. Ванну сливают разом, и на очистные приходит пик, к которому биологическая ступень не готова.",
          "Поэтому схема начинается не с аэротенка. Сначала усреднитель — он выравнивает расход, температуру и состав, превращая залпы в ровный поток. Затем физико-химическая ступень: коагуляция и флокуляция, после которых хлопья снимаются флотацией (DAF) или отстаиванием. И только после этого имеет смысл биологическая очистка — на воде, которую активный ил способен переработать.",
          "Считать такую схему «по аналогии» мы не беремся и вам не советуем. Первый шаг — анализ стока: ХПК, БПК5, цветность, ПАВ, pH, температура, взвешенные вещества, плюс режим работы цеха и объёмы сбросов по сменам. Мы даём опросный лист, вы заполняете его и прикладываете протокол лаборатории — дальше считается технология, а не догадка.",
        ],
      },
      {
        title: "Хозбытовые объекты, доставка и монтаж",
        text: [
          "Для махалли, жилого массива, гостиницы или кафе всё проще и предсказуемее. Считаем по числу жителей или посадочных мест и расходу, подбираем ЛОС БИО на биологическую очистку, перед выпуском кухни ставим жироуловитель, а если сток нужно поднимать к коллектору или к площадке очистных — КНС. Расчёт ведём по КМК 2.04.03-19 и КМК 2.04.01-98, он открытый: его можно показать проектировщику и экспертизе.",
          "Корпуса делаем в Ташкенте — стеклопластик собственной намотки с кольцами жёсткости; расчёт на грунтовые нагрузки и всплытие выдаём вместе с изделием. До Намангана ≈290 км, доставка автотранспортом, монтаж и пусконаладку ведёт наша выездная бригада, а не подрядчик со стороны. Покупными остаются насосы, воздуходувки и КИП — их марки указываем в коммерческом предложении открыто.",
          "Цены на сайте не публикуем: для текстильного стока стоимость зависит от результатов анализа и от того, сколько ступеней реально нужно, для хозбытового — от расхода, глубины коллектора и комплектации. Пришлите данные объекта — вернём подбор и коммерческое предложение.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи Намангана и области — модели, с которых стоит начать разговор. Точный подбор — по данным объекта, для производственных стоков — после анализа.",
    picks: [
      { slug: "bio-25", when: "Махалля, жилой массив" },
      { slug: "bio-100", when: "Посёлок, крупный объект" },
      { slug: "zhir-3", when: "Кафе, столовая" },
      { slug: "nef-6", when: "Автомойка, паркинг" },
      { slug: "rez-50", when: "Усреднитель, накопитель" },
      { slug: "kns-25", when: "Перекачка стоков объекта" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Можно ли поставить обычные ЛОС БИО на сток красильного цеха?",
        a: "Нет. Биологическая ступень рассчитана на хозбытовой сток: цветность, ПАВ и повышенная температура красильных вод угнетают активный ил, а залповый сброс после смены ванн его просто смывает. Красильный сток сначала проходит усреднение и физико-химию, и лишь затем — биологию, если она нужна по условиям сброса.",
      },
      {
        q: "Что нужно от нас, чтобы вы посчитали очистные для текстильного производства?",
        a: "Заполненный опросный лист и протокол анализа стока: ХПК, БПК5, цветность, ПАВ, pH, температура, взвешенные вещества. Плюс режим цеха — сколько смен, когда сливаются ванны, какой объём разово. Без этих данных любая схема будет угадыванием, а не расчётом.",
      },
      {
        q: "Вы возите в Наманган из Ташкента?",
        a: "Да. Производство — в Ташкенте, до Намангана ≈290 км, доставка автотранспортом. Монтаж, пусконаладку и вывод на показатели выполняет наша выездная бригада.",
      },
      {
        q: "У нас махалля без централизованной канализации — с чего начать?",
        a: "С числа жителей и точки сброса. По ним считается расход и подбирается ЛОС БИО, при необходимости с КНС на подаче. Если рядом столовая или кафе, перед их выпуском ставится жироуловитель — иначе жир уйдёт в биологию и посадит её.",
      },
      {
        q: "Сколько это стоит?",
        a: "Цену называем после расчёта. Для хозбытового объекта достаточно расхода, глубины коллектора и требований к сбросу — предложение делаем быстро. Для производственного стока сначала нужен анализ: до него любая цифра будет неправдой. Расчёт и подбор бесплатны.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Опишите объект —\nвернём расчёт и цену.",
    ctaText:
      "Тип объекта, расход или число пользователей, куда сброс. Для цеха с крашением — опросный лист и анализ стока. Производство — Ташкент, монтаж в Намангане — наша бригада.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "География производства и монтажа",
      links: [
        { href: "/solutions/tashkent", label: "Ташкент" },
        { href: "/solutions/samarkand", label: "Самарканд" },
        { href: "/solutions/bukhara", label: "Бухара" },
        { href: "/solutions/fergana", label: "Фергана" },
        { href: "/solutions/navoi", label: "Навои" },
      ],
    },
  },

  uz: {
    label: "NAMANGAN VA NAMANGAN VILOYATI",
    title: "Namanganda tozalash\ninshootlari.",
    intro:
      "Ishlab chiqarish Toshkentda, Namangangacha ≈290 km — o‘zimiz yetkazamiz, o‘rnatamiz va ishga tushiramiz. Korpuslar — o‘z o‘ramimizdagi shishatolali plastik, hisob KMK me’yorlari bo‘yicha. Xo‘jalik-maishiy obyektlar sarf bo‘yicha tanlanadi, bo‘yash va pardozlash oqavasi esa — faqat tahlildan keyin.",
    sections: [
      {
        title: "Namanganda ko‘pincha nimani tozalash kerak bo‘ladi",
        text: [
          "Namangandan keladigan ariza kamdan-kam «oddiy maishiy» bo‘ladi. Viloyat to‘qimachilik va tikuvchilik bilan yashaydi, sex bilan birga deyarli doim bo‘yash, pardozlash yoki hech bo‘lmasa yuvish keladi. Yonida — oziq-ovqat sexlari, kafe va oshxonalar, avtoyuvishlar, shuningdek shahar kollektori yetib bormasdan qurilayotgan yangi turar-joy massivlari va mahallalar.",
          "Shundan ikki xil vazifa kelib chiqadi. Mahalla, mehmonxona yoki oshxonaning maishiy oqavasi odatdagidek hisoblanadi — bu yerda seriyali yechimlar ishlaydi. Bo‘yash uchastkasining ishlab chiqarish oqavasini esa unday hisoblab bo‘lmaydi: tarkibi bo‘yicha bu boshqa suv va unga sxema alohida yig‘iladi.",
        ],
      },
      {
        title: "Bo‘yash oqavasi: avval tahlil, keyin sxema",
        text: [
          "Bo‘yash va pardozlashdan keyingi suv barcha asosiy ko‘rsatkichlar bo‘yicha maishiydan farq qiladi: ranglilik, sirt-faol moddalar (SFM), yuqori harorat va eng muhimi — zalpli tashlash. Vanna bir yo‘la bo‘shatiladi va tozalash inshootiga biologik bosqich tayyor bo‘lmagan cho‘qqi keladi.",
          "Shuning uchun sxema aerotenkdan boshlanmaydi. Avval o‘rtachalashtirgich — u sarf, harorat va tarkibni tekislaydi, zalplarni bir tekis oqimga aylantiradi. Keyin fizik-kimyoviy bosqich: koagulyatsiya va flokulyatsiya, so‘ng parchalar flotatsiya (DAF) yoki tindirish bilan olinadi. Va faqat shundan keyin biologik tozalash ma’noga ega bo‘ladi — faol loy hazm qila oladigan suvda.",
          "Bunday sxemani «o‘xshatib» hisoblashni biz o‘z zimmamizga olmaymiz va sizga ham maslahat bermaymiz. Birinchi qadam — oqava tahlili: KKT (XPK), BPK5, ranglilik, SFM, pH, harorat, muallaq moddalar, ustiga sex ish rejimi va smenalar bo‘yicha tashlash hajmlari. Biz so‘rovnoma varaqasini beramiz, siz uni to‘ldirib laboratoriya bayonnomasini ilova qilasiz — keyin taxmin emas, texnologiya hisoblanadi.",
        ],
      },
      {
        title: "Maishiy obyektlar, yetkazish va montaj",
        text: [
          "Mahalla, turar-joy massivi, mehmonxona yoki kafe uchun hammasi soddaroq. Aholi soni yoki o‘rin soni va sarf bo‘yicha hisoblaymiz, biologik tozalash uchun LOS BIO tanlaymiz, oshxona chiqishiga yog‘ tutgich qo‘yamiz, oqavani kollektorga yoki inshoot maydonchasiga ko‘tarish kerak bo‘lsa — KNS. Hisob KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha, ochiq: uni loyihachiga va ekspertizaga ko‘rsatish mumkin.",
          "Korpuslarni Toshkentda tayyorlaymiz — qattiqlik halqali o‘z o‘ramimizdagi shishatolali plastik; grunt yuklari va suzib chiqishga hisobni mahsulot bilan beramiz. Namangangacha ≈290 km, avtotransportda yetkazamiz, montaj va ishga tushirishni chetdagi pudratchi emas, bizning sayyor brigadamiz bajaradi. Nasoslar, havo purkagichlar va KIP sotib olinadi — markalarini tijorat taklifida ochiq yozamiz.",
          "Narxlarni saytda e’lon qilmaymiz: to‘qimachilik oqavasi uchun qiymat tahlil natijalariga va qancha bosqich kerakligiga bog‘liq, maishiy oqava uchun — sarf, kollektor chuqurligi va komplektatsiyaga. Obyekt ma’lumotlarini yuboring — tanlov va tijorat taklifini qaytaramiz.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Namangan va viloyatning tipik vazifalari — suhbatni boshlash uchun modellar. Aniq tanlov obyekt ma’lumotlari bo‘yicha, ishlab chiqarish oqavasi uchun — tahlildan keyin.",
    picks: [
      { slug: "bio-25", when: "Mahalla, turar-joy massivi" },
      { slug: "bio-100", when: "Qishloq, yirik obyekt" },
      { slug: "zhir-3", when: "Kafe, oshxona" },
      { slug: "nef-6", when: "Avtoyuvish, parking" },
      { slug: "rez-50", when: "O‘rtachalashtirgich, to‘plagich" },
      { slug: "kns-25", when: "Obyekt oqavasini haydash" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Bo‘yash sexi oqavasiga oddiy LOS BIO qo‘ysa bo‘ladimi?",
        a: "Yo‘q. Biologik bosqich maishiy oqavaga mo‘ljallangan: ranglilik, SFM va yuqori harorat faol loyni bo‘g‘adi, vanna almashtirilgandan keyingi zalpli tashlash esa uni yuvib ketadi. Bo‘yash oqavasi avval o‘rtachalashtirish va fizik-kimyodan o‘tadi, biologiya esa — tashlash shartlari talab qilsa, undan keyin.",
      },
      {
        q: "To‘qimachilik ishlab chiqarishi uchun hisob qilishingizga bizdan nima kerak?",
        a: "To‘ldirilgan so‘rovnoma varaqasi va oqava tahlili bayonnomasi: KKT, BPK5, ranglilik, SFM, pH, harorat, muallaq moddalar. Ustiga sex rejimi — necha smena, vannalar qachon bo‘shatiladi, bir martada qancha hajm. Bu ma’lumotlarsiz har qanday sxema hisob emas, taxmin bo‘ladi.",
      },
      {
        q: "Namanganga Toshkentdan olib borasizmi?",
        a: "Ha. Ishlab chiqarish Toshkentda, Namangangacha ≈290 km, avtotransportda yetkazamiz. Montaj, ishga tushirish va ko‘rsatkichlarga chiqarishni bizning sayyor brigadamiz bajaradi.",
      },
      {
        q: "Mahallamizda markaziy kanalizatsiya yo‘q — nimadan boshlaymiz?",
        a: "Aholi soni va tashlash nuqtasidan. Ular bo‘yicha sarf hisoblanadi va LOS BIO tanlanadi, kerak bo‘lsa kirishga KNS qo‘yiladi. Yaqinda oshxona yoki kafe bo‘lsa, ularning chiqishiga yog‘ tutgich qo‘yiladi — aks holda yog‘ biologiyaga tushib, uni o‘ldiradi.",
      },
      {
        q: "Bu qancha turadi?",
        a: "Narxni hisobdan keyin aytamiz. Maishiy obyekt uchun sarf, kollektor chuqurligi va tashlash talablari yetarli — taklifni tez beramiz. Ishlab chiqarish oqavasi uchun avval tahlil kerak: undan oldingi har qanday raqam haqiqat bo‘lmaydi. Hisob va tanlov bepul.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Obyektni tasvirlab bering —\nhisob va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, sarf yoki foydalanuvchilar soni, oqava qayerga ketadi. Bo‘yashli sex uchun — so‘rovnoma va oqava tahlili. Ishlab chiqarish — Toshkent, Namangandagi montaj — bizning brigada.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Ishlab chiqarish va montaj geografiyasi",
      links: [
        { href: "/solutions/tashkent", label: "Toshkent" },
        { href: "/solutions/samarkand", label: "Samarqand" },
        { href: "/solutions/bukhara", label: "Buxoro" },
        { href: "/solutions/fergana", label: "Farg‘ona" },
        { href: "/solutions/navoi", label: "Navoiy" },
      ],
    },
  },

  en: {
    label: "NAMANGAN AND NAMANGAN REGION",
    title: "Wastewater treatment\nplants in Namangan.",
    intro:
      "We manufacture in Tashkent, ≈290 km from Namangan, and deliver, install and commission with our own crews. Filament-wound fiberglass shells, calculations to KMK codes. Domestic sites are sized by flow; dyeing and finishing effluent only after a lab analysis.",
    sections: [
      {
        title: "What needs treating in Namangan",
        text: [
          "The region runs on textile and garment production, and a mill almost always comes with dyeing, finishing or at least washing. Alongside it: food workshops, cafes and canteens, car washes, and new housing districts and mahallas built faster than the municipal sewer reaches them.",
          "That splits the work in two. Domestic effluent from a mahalla, hotel or canteen is sized the normal way. Effluent from a dyehouse is a different water and needs its own process train.",
        ],
      },
      {
        title: "Dyeing effluent: analysis first, process second",
        text: [
          "Dyeing and finishing water differs from domestic sewage in colour, surfactants, elevated temperature and, above all, batch discharges — a dye bath is dumped at once and the plant sees a peak that biology cannot absorb.",
          "So the train does not start with an aeration tank. First an equalisation tank levels flow, temperature and load. Then physico-chemical treatment: coagulation and flocculation, with flocs removed by dissolved air flotation (DAF) or settling. Only then does biological treatment make sense.",
          "We will not size such a plant by analogy. Step one is an effluent analysis — COD, BOD5, colour, surfactants, pH, temperature, suspended solids — plus the shop schedule and discharge volumes per shift. We send a questionnaire; you return it with the lab report, and the process is calculated rather than guessed.",
        ],
      },
      {
        title: "Domestic sites, delivery and installation",
        text: [
          "For a mahalla, housing district, hotel or cafe it is straightforward: a BIO package plant sized by population or seats and flow, a grease trap ahead of the kitchen outlet, and a pumping station (KNS) where the effluent has to be lifted. Calculations follow KMK 2.04.03-19 and KMK 2.04.01-98 and are open to your designer and to expert review.",
          "Shells are wound in Tashkent with stiffening rings; the soil-load and buoyancy calculation ships with the unit. Delivery to Namangan is ≈290 km by road; installation and commissioning are done by our own field crew. Pumps, blowers and instruments are bought-in and their brands are stated openly in the quotation.",
          "We do not publish prices: for textile effluent the cost follows the analysis and the number of stages actually required; for domestic effluent, the flow, collector depth and configuration. Send your site data and we return a selection and a quotation.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical Namangan tasks and models to start from. Exact selection is based on site data — and, for industrial effluent, on the analysis.",
    picks: [
      { slug: "bio-25", when: "Mahalla, housing district" },
      { slug: "bio-100", when: "Settlement, large facility" },
      { slug: "zhir-3", when: "Cafe, canteen" },
      { slug: "nef-6", when: "Car wash, parking" },
      { slug: "rez-50", when: "Equalisation, storage tank" },
      { slug: "kns-25", when: "Pumping site effluent" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Can a standard BIO plant treat dyehouse effluent?",
        a: "No. Colour, surfactants and elevated temperature inhibit activated sludge, and a batch dump after a bath change washes it out. Dyeing effluent needs equalisation and physico-chemical treatment first; biology comes after, if the discharge permit calls for it.",
      },
      {
        q: "What do you need to size a plant for a textile mill?",
        a: "A completed questionnaire and a lab report: COD, BOD5, colour, surfactants, pH, temperature, suspended solids — plus shift pattern and the volume dumped at a time. Without those, any scheme is a guess.",
      },
      {
        q: "Do you deliver to Namangan from Tashkent?",
        a: "Yes. Manufacturing is in Tashkent, ≈290 km away, delivery by road. Installation, commissioning and bringing the plant to spec are done by our own crew.",
      },
      {
        q: "Our mahalla has no central sewerage — where do we start?",
        a: "With population and discharge point. They give the flow and the BIO model, with a pumping station on the inlet if needed. If a canteen or cafe is nearby, a grease trap goes ahead of its outlet.",
      },
      {
        q: "What does it cost?",
        a: "We quote after the calculation. A domestic site needs flow, collector depth and discharge requirements. Industrial effluent needs the analysis first — any figure before that would be untrue. Selection is free.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Describe your site —\nget a selection and a price.",
    ctaText:
      "Facility type, flow or number of users, discharge point. For a dyehouse — the questionnaire and an effluent analysis. Manufactured in Tashkent, installed in Namangan by our crew.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Where we deliver and install",
      links: [
        { href: "/solutions/tashkent", label: "Tashkent" },
        { href: "/solutions/samarkand", label: "Samarkand" },
        { href: "/solutions/bukhara", label: "Bukhara" },
        { href: "/solutions/fergana", label: "Fergana" },
        { href: "/solutions/navoi", label: "Navoi" },
      ],
    },
  },

  zh: {
    label: "纳曼干及纳曼干州",
    title: "纳曼干\n污水处理设备。",
    intro:
      "工厂在塔什干，距纳曼干约290公里，运输、安装、调试均由我们自己完成。玻璃钢缠绕罐体，按 KMK 标准计算。生活污水按流量选型；印染与后整理废水必须先做水质分析。",
    sections: [
      {
        title: "纳曼干需要处理什么水",
        text: [
          "本州以纺织和服装生产为主，工厂通常伴随染色、后整理或至少水洗。此外还有食品车间、餐厅与食堂、洗车场，以及市政管网尚未接入的新建住宅区和马哈拉。",
          "因此任务分两类：马哈拉、酒店、食堂的生活污水按常规方式选型；染色车间的生产废水属于另一种水，需要单独的工艺路线。",
        ],
      },
      {
        title: "印染废水：先分析，后定工艺",
        text: [
          "印染废水与生活污水差异明显：色度高、含表面活性剂、水温偏高，且为间歇式排放——染缸一次性排空，冲击负荷是生化段无法承受的。",
          "所以工艺不从曝气池开始。先设调节池均化水量、水温与水质；再进物化段：混凝絮凝后用气浮（DAF）或沉淀去除絮体；之后生化处理才有意义。",
          "我们不按“类比”定工艺。第一步是水质分析：COD、BOD5、色度、表面活性剂、pH、温度、悬浮物，以及车间班次与每班排放量。我们提供调查表，您填写并附检测报告，工艺由计算得出而非猜测。",
        ],
      },
      {
        title: "生活污水对象、运输与安装",
        text: [
          "马哈拉、住宅区、酒店或餐厅相对简单：按人数或座位数与流量选 BIO 一体化设备，厨房排水前加隔油器，需要提升时配污水泵站（KNS）。计算依据 KMK 2.04.03-19 与 KMK 2.04.01-98，计算书公开，可交设计单位和审查机构。",
          "罐体在塔什干缠绕成型并设加强环，抗浮与土压计算随货提供。至纳曼干约290公里，公路运输；安装与调试由我们的外派班组完成。泵、风机、仪表为外购件，品牌在报价中公开注明。",
          "价格不在网站公布：纺织废水取决于分析结果和实际所需段数，生活污水取决于流量、管道埋深与配置。提供对象数据，我们回复选型与报价。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "纳曼干及州内的典型任务与推荐起点型号。精确选型依据对象数据；生产废水须先分析。",
    picks: [
      { slug: "bio-25", when: "马哈拉、住宅区" },
      { slug: "bio-100", when: "村镇、大型对象" },
      { slug: "zhir-3", when: "咖啡馆、食堂" },
      { slug: "nef-6", when: "洗车场、停车场" },
      { slug: "rez-50", when: "调节池、储罐" },
      { slug: "kns-25", when: "对象污水提升" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "普通 BIO 设备能处理染色废水吗？",
        a: "不能。色度、表面活性剂和高水温抑制活性污泥，换缸后的瞬时排放还会把污泥冲走。染色废水需先经调节与物化处理，若排放要求需要，再进生化段。",
      },
      {
        q: "为纺织厂选型需要我们提供什么？",
        a: "填写好的调查表和水质检测报告：COD、BOD5、色度、表面活性剂、pH、温度、悬浮物，以及班次安排和单次排放量。没有这些数据，任何方案都是猜测。",
      },
      {
        q: "从塔什干发货到纳曼干吗？",
        a: "是。生产在塔什干，距离约290公里，公路运输。安装、调试及达标运行由我们自己的班组完成。",
      },
      {
        q: "我们的马哈拉没有市政管网，从哪开始？",
        a: "从人数和排放去向开始：据此计算流量并选 BIO 型号，必要时进水端加泵站。附近有食堂或咖啡馆时，其排水前应设隔油器。",
      },
      {
        q: "价格是多少？",
        a: "计算后报价。生活污水对象只需流量、管道埋深与排放要求；生产废水须先做分析，在此之前的任何数字都不真实。选型与计算免费。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "描述您的对象——\n我们回复选型与价格。",
    ctaText:
      "对象类型、流量或人数、排放去向。印染车间请附调查表与水质分析。塔什干生产，纳曼干安装由我们的班组完成。",
    ctaButton: "获取报价",
    related: {
      title: "供货与安装地区",
      links: [
        { href: "/solutions/tashkent", label: "塔什干" },
        { href: "/solutions/samarkand", label: "撒马尔罕" },
        { href: "/solutions/bukhara", label: "布哈拉" },
        { href: "/solutions/fergana", label: "费尔干纳" },
        { href: "/solutions/navoi", label: "纳沃伊" },
      ],
    },
  },
};

export default content;
