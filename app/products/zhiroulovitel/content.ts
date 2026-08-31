import type { LineContentSet } from "../lineTypes";

/**
 * Страница модельного ряда «Жироуловители ЖИР-1 … ЖИР-50».
 *
 * Запросы: «жироуловитель», «жироуловитель купить», «жироуловитель цена»,
 * «жироотделитель», «жироуловитель для кафе / столовой / ресторана»,
 * «промышленный жироуловитель», «yog‘ tutgich», «grease trap».
 *
 * Все цифры — из app/products/data.ts (модели line: "grease-traps").
 */

const content: LineContentSet = {
  ru: {
    label: "ЖИРОУЛОВИТЕЛИ",
    title: "Жироуловители\nЖИР-1 … ЖИР-50.",
    intro:
      "Гравитационные жироуловители для кухонь кафе, столовых, ресторанов и пищевых цехов: расход от 1 до 50 м³/ч, корпус из стеклопластика собственной намотки, работа самотёком — без насосов и электропитания. Ставятся на выпуске кухни до врезки в коммунальную канализацию.",
    sections: [
      {
        title: "Что такое жироуловитель и когда он обязателен",
        text: [
          "Жироуловитель (он же жироотделитель) задерживает жиры и пищевые отходы кухонного стока до того, как они уйдут в коммунальную сеть. Сток кухни идёт горячим: от моек, посудомоечных машин и пароконвектоматов вода приходит с 45–60 °C, и при такой температуре жир жидкий. Остывает он уже в трубе — застывает на стенках, сечение зарастает, дальше идут засоры: сначала на своём выпуске, потом в дворовой сети и городском коллекторе.",
          "Жиры нормируются на выпуске: Постановление КМ РУз № 11 от 03.02.2010 задаёт 1,0 мг/л. Пробу Водоканал берёт в контрольном колодце объекта, и претензия по превышению приходит владельцу заведения — вместе с прочистками за свой счёт.",
          "Вторая причина — биология. Если сток идёт не в город, а на собственные локальные очистные, жир губит активный ил: обволакивает хлопья, ил всплывает, вынос взвеси растёт. Поэтому перед биологической ступенью жироуловитель ставят всегда.",
        ],
      },
      {
        title: "Как подбирается типоразмер",
        text: [
          "Подбор идёт по расходу кухонного стока, а не по площади зала и не по числу посадочных мест. Считается оборудование, которое реально сливает воду: мойки, посудомоечные машины, пароконвектоматы, опрокидные котлы. Секундные расходы складываются с учётом одновременности и переводятся в м³/ч — по этому числу выбирается модель. Ряд ЖИР перекрывает от 1 до 50 м³/ч.",
          "Дальше проверяются три величины. Время отстаивания — по ряду от 79 до 98 минут: столько нужно, чтобы горячий сток остыл примерно до 30 °C и жир всплыл. Площадь зеркала — от 1,35 до 35,2 м²: с неё снимается всплывший жир, и нагрузка на зеркало ограничивает расход не хуже объёма. Рабочий объём — от 1,35 до 67 м³.",
          "Отдельно смотрят посадку: отметку выпуска кухни и канализации в точке врезки, глубину заложения, грунтовые воды, есть ли над изделием проезд. Базовое исполнение — подземное, в бетонной обойме; размещение в помещении возможно, если отметки дают самотёк и есть доступ для откачки. Вентиляционный стояк DN110 с дефлектором нужен в любом случае.",
        ],
      },
      {
        title: "Конструкция и обслуживание",
        text: [
          "Корпус — стеклопластик собственной намотки на изофталевой полиэфирной смоле, с кольцами жёсткости; толщина ламината по ряду от 6 до 10 мм. Внутри: успокоитель входного потока, полупогружные перегородки, выходной сифон и съёмная корзина для пищевых отходов из нержавеющей стали AISI 304. Присоединение — от DN110 у ЖИР-1 до DN355 у ЖИР-50; ЖИР-30 и ЖИР-50 выполняются в двух корпусах.",
          "Стеклопластик не корродирует в горячем жирном стоке и в среде моющих средств, не требует покраски и гидроизоляции. Он в разы легче бетона — ЖИР-3 весит 262 кг, — а корпус монолитный, без швов, по которым течёт бетонное кольцо.",
          "Обслуживание сводится к откачке. Жир копится коркой сверху, осадок — в приёмно-шламовой зоне: по ряду это от 0,27 до 10,8 м³ по жиру и от 0,41 до 24,5 м³ по осадку, отсюда и периодичность. Люки идут по всей длине корпуса — от 2 до 8 в зависимости от типоразмера, — чтобы откачивать каждую зону, а не только первую; регламент выдаётся с изделием. Отработанное фритюрное масло сливать в жироуловитель нельзя, оно выводит аппарат из строя. Ферменты и «биопрепараты для растворения жира» задачу не решают — они гонят жир дальше в сеть, где он всё равно застывает.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Как понять, какой типоразмер жироуловителя нужен?",
        a: "По расходу кухни. Пришлите перечень оборудования — мойки, посудомоечные машины, пароконвектоматы, — отметку канализации в точке врезки и место установки. Вернём типоразмер из ряда ЖИР-1 … ЖИР-50 и исполнительную схему для строителей. По числу посадочных мест подбирать нельзя: две кухни с одинаковым залом дают разный сток.",
      },
      {
        q: "Сколько стоит жироуловитель?",
        a: "Цена зависит от типоразмера, глубины заложения, класса нагрузки на люки и объёма монтажных работ — поэтому прайса на сайте нет. Пришлите данные объекта: вернём подбор модели и предложение с ценой. Расчёт бесплатный.",
      },
      {
        q: "Как часто нужно чистить?",
        a: "Периодичность считается от объёма накопления: у ЖИР-1 это 0,27 м³ жира и 0,41 м³ осадка, у ЖИР-50 — 10,8 и 24,5 м³. Чем ближе фактический сток к номиналу модели, тем чаще откачка. Интервал для вашего объекта указан в регламенте, который идёт с изделием. Корзину для пищевых отходов кухня вычищает сама, по мере наполнения.",
      },
      {
        q: "Можно ли ставить в помещении и не замёрзнет ли на улице зимой?",
        a: "Базовое исполнение — подземное, в бетонной обойме: там сток всегда выше нуля. Установка в помещении возможна, если отметки позволяют самотёк и есть доступ для откачки и вентиляции; решается по данным объекта. Стеклопластику холод не вредит — вопрос в глубине заложения и в том, чтобы аппарат не стоял без стока.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Технологический расчёт, паспорт изделия, схему установки, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания.",
      },
    ],
    ctaTitle: "Пришлите оборудование кухни —\nвернём типоразмер и цену.",
    ctaText:
      "Перечень моек, посудомоечных машин и пароконвектоматов, отметка канализации в точке врезки, место установки. Вернём подбор модели, характеристики и коммерческое предложение. Производство — Ташкент.",
    ctaButton: "ЗАПРОСИТЬ ПОДБОР",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/nefteulovitel", label: "Нефтеуловители" },
        { href: "/products/peskolovka", label: "Песколовки" },
        { href: "/products/los-bio", label: "ЛОС БИО" },
        { href: "/solutions/restaurant", label: "Жироуловитель для ресторана" },
        {
          href: "/solutions/food-industry",
          label: "Очистные для пищевого производства",
        },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "YOG‘ TUTGICHLAR",
    title: "Yog‘ tutgichlar\nZHIR-1 … ZHIR-50.",
    intro:
      "Kafe, oshxona, restoran va oziq-ovqat sexlari oshxonasi uchun gravitatsion yog‘ tutgichlar: sarf 1 dan 50 m³/soatgacha, korpus — o‘z o‘ramimizdagi shishatolali plastik, ish o‘z oqimi bilan — nasossiz va elektr ta’minotisiz. Oshxona chiqishida, kommunal kanalizatsiyaga ulanishdan oldin o‘rnatiladi.",
    sections: [
      {
        title: "Yog‘ tutgich nima va qachon majburiy",
        text: [
          "Yog‘ tutgich oshxona oqavasidagi yog‘lar va oziq-ovqat chiqindilarini kommunal tarmoqqa ketishidan oldin ushlab qoladi. Oshxona oqavasi issiq keladi: yuvish rakovinalari, idish yuvish mashinalari va parokonvektomatlardan suv 45–60 °C bilan chiqadi, bunday haroratda yog‘ suyuq va suv bilan birga oqadi. U quvurda soviydi — devorlarda qotadi, kesim torayadi, keyin tiqilishlar boshlanadi: avval o‘z chiqishingizda, so‘ng hovli tarmog‘i va shahar kollektorida.",
          "Yog‘lar chiqishda me’yorlanadi: O‘zR VM 03.02.2010 dagi 11-sonli qarori 1,0 mg/l ni belgilaydi. Namunani suv tashkiloti obyektning nazorat qudug‘idan oladi, oshib ketish bo‘yicha da’vo esa obyekt egasiga keladi. Yog‘ tutgichsiz bu ham o‘z hisobingizdan tozalash, ham tarmoq tashkiloti bilan tortishuv.",
          "Ikkinchi sabab — biologiya. Agar oqava shaharga emas, o‘z lokal tozalash inshootiga ketsa, yog‘ faol loyni buzadi: parchalarni o‘rab oladi, loy suzib chiqadi, muallaq moddalar chiqishi ortadi. Shuning uchun biologik bosqichdan oldin yog‘ tutgich doim qo‘yiladi.",
        ],
      },
      {
        title: "Tipo‘lcham qanday tanlanadi",
        text: [
          "Tanlov oshxona oqavasining sarfi bo‘yicha boradi, zal maydoni yoki o‘rindiqlar soni bo‘yicha emas. Suv to‘kadigan uskunalar hisoblanadi: rakovinalar, idish yuvish mashinalari, parokonvektomatlar, ag‘dariladigan qozonlar. Asboblarning sekundlik sarflari bir vaqtdalikni hisobga olib qo‘shiladi va m³/soatga o‘tkaziladi — shu raqam bo‘yicha model tanlanadi. ZHIR qatori 1 dan 50 m³/soatgacha qamraydi.",
          "Keyin uchta kattalik tekshiriladi. Tindirish vaqti — qator bo‘yicha 79 dan 98 daqiqagacha: issiq oqava taxminan 30 °C gacha sovishi va yog‘ yuzaga chiqishi uchun shuncha kerak. Ko‘zgu maydoni — 1,35 dan 35,2 m² gacha: undan suzib chiqqan yog‘ olinadi. Ishchi hajm — 1,35 dan 67 m³ gacha.",
          "Alohida o‘rnatish sharoiti ko‘riladi: oshxona chiqishi va ulanish nuqtasidagi kanalizatsiya belgilari, ko‘mish chuqurligi, sizot suvlar, mahsulot ustidan transport o‘tishi. Asosiy ijro — yer osti, beton qobiqda; belgilar o‘z oqimini bersa va so‘rib olishga yo‘l bo‘lsa, binoda joylashtirish ham mumkin. Deflektorli DN110 ventilyatsiya stoyagi har qanday holatda kerak — usiz hidlar binoga kiradi.",
        ],
      },
      {
        title: "Konstruksiya va xizmat ko‘rsatish",
        text: [
          "Korpus — izoftal poliefir smolasida o‘z o‘ramimizdagi shishatolali plastik, qattiqlik halqalari bilan; laminat qalinligi qator bo‘yicha 6 dan 10 mm gacha. Ichida: kirish oqimi tinchlantirgichi, yarim botirilgan to‘siqlar, chiqish sifoni va AISI 304 zanglamas po‘latdan yechiladigan savat. Ulanish — ZHIR-1 da DN110 dan ZHIR-50 da DN355 gacha; yirik ZHIR-30 va ZHIR-50 ikki korpusda bajariladi, bu yetkazish va montajni osonlashtiradi.",
          "Shishatolali plastik issiq yog‘li oqavada va yuvish vositalari muhitida zanglamaydi, bo‘yash va gidroizolyatsiya talab qilmaydi. U betondan bir necha barobar yengil — ZHIR-3 massasi 262 kg, og‘ir texnikasiz o‘rnatiladi, — korpus esa yaxlit, choksiz.",
          "Xizmat ko‘rsatish so‘rib olishdan iborat. Yog‘ yuqorida po‘st bo‘lib to‘planadi, cho‘kma — qabul-shlam zonasida: qator bo‘yicha yog‘ bo‘yicha 0,27 dan 10,8 m³ gacha va cho‘kma bo‘yicha 0,41 dan 24,5 m³ gacha — davriylik shundan kelib chiqadi. Lyuklar korpus bo‘ylab joylashgan — tipo‘lchamga qarab 2 tadan 8 tagacha — har bir zonani so‘rib olish uchun. Reglament mahsulot bilan beriladi. Ishlatilgan fritür yog‘ini yog‘ tutgichga to‘kish mumkin emas: u qurilmani ishdan chiqaradi, buning uchun alohida idish kerak. «Yog‘ eritadigan» fermentlar va biopreparatlar masalani hal qilmaydi — ular yog‘ni tarmoqqa haydaydi, u yerda u baribir qotadi.",
        ],
      },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Qaysi tipo‘lcham kerakligini qanday bilish mumkin?",
        a: "Oshxona sarfi bo‘yicha. Uskunalar ro‘yxatini — rakovinalar, idish yuvish mashinalari, parokonvektomatlar, — ulanish nuqtasidagi kanalizatsiya belgisi va o‘rnatish joyini yuboring. ZHIR-1 … ZHIR-50 qatoridan tipo‘lcham va qurilish qismi uchun ijro sxemasini qaytaramiz. O‘rindiqlar soni bo‘yicha tanlab bo‘lmaydi.",
      },
      {
        q: "Yog‘ tutgich qancha turadi?",
        a: "Narx tipo‘lcham, ko‘mish chuqurligi, lyuklar yuk sinfi va montaj ishlari hajmiga bog‘liq — shuning uchun saytda prays yo‘q. Obyekt ma’lumotlarini yuboring, model tanlovi va narx bilan tijorat taklifini qaytaramiz. Hisob va tanlov bepul.",
      },
      {
        q: "Qanchalik tez-tez tozalash kerak?",
        a: "Davriylik to‘planish hajmidan hisoblanadi: ZHIR-1 da bu 0,27 m³ yog‘ va 0,41 m³ cho‘kma, ZHIR-50 da — 10,8 va 24,5 m³. Haqiqiy oqava model nominaliga qanchalik yaqin bo‘lsa, so‘rib olish shunchalik tez-tez. Aniq oraliq mahsulot bilan beriladigan reglamentda ko‘rsatiladi. Oziq-ovqat chiqindilari savatini oshxona o‘zi tozalaydi.",
      },
      {
        q: "Binoga o‘rnatsa bo‘ladimi, qishda ko‘chada muzlamaydimi?",
        a: "Asosiy ijro — yer osti, beton qobiqda: u yerda oqava doim noldan yuqori. Belgilar o‘z oqimiga imkon bersa va so‘rib olish hamda ventilyatsiyaga yo‘l bo‘lsa, binoga o‘rnatish mumkin — bu obyekt ma’lumotlari bo‘yicha hal qilinadi. Sovuq shishatolali plastikka zarar qilmaydi.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "Texnologik hisob, mahsulot pasporti, o‘rnatish sxemasi, korpusning grunt yuklari va suzib chiqishga hisobi, ekspluatatsiya qo‘llanmasi va xizmat reglamenti. Bu to‘plam loyihachiga va obyektni topshirishga yetadi.",
      },
    ],
    ctaTitle: "Oshxona uskunalarini yuboring —\ntipo‘lcham va narxni qaytaramiz.",
    ctaText:
      "Rakovinalar, idish yuvish mashinalari va parokonvektomatlar ro‘yxati, ulanish nuqtasidagi kanalizatsiya belgisi, o‘rnatish joyi. Model tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "TANLOVNI SO‘RASH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/nefteulovitel", label: "Neft tutgichlar" },
        { href: "/products/peskolovka", label: "Qum tutgichlar" },
        { href: "/products/los-bio", label: "LOS BIO" },
        {
          href: "/solutions/restaurant",
          label: "Restoran uchun yog‘ tutgich",
        },
        {
          href: "/solutions/food-industry",
          label: "Oziq-ovqat korxonasi uchun",
        },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "GREASE TRAPS",
    title: "Grease traps\nZHIR-1 … ZHIR-50.",
    intro:
      "Gravity grease traps for cafe, canteen, restaurant and food-shop kitchens: flow from 1 to 50 m³/h, filament-wound fiberglass shell, gravity operation — no pumps, no power. Installed on the kitchen outlet upstream of the municipal sewer connection.",
    sections: [
      {
        title: "What a grease trap does and when it is required",
        text: [
          "A grease trap (grease separator) holds back fats and food waste before they reach the municipal network. Kitchen effluent arrives hot — 45–60 °C from sinks, dishwashers and combi steamers — and at that temperature grease stays liquid and travels with the water. It cools inside the pipe, congeals on the walls, the bore narrows, and blockages follow: first on your own outlet, then in the yard network and the city collector.",
          "Fats are limited at the outlet: Resolution No. 11 of the Cabinet of Ministers of Uzbekistan dated 03.02.2010 sets 1.0 mg/l. The utility samples the site's control manhole, and a claim goes to the owner of the premises.",
          "The second reason is biology. If the effluent goes to your own package plant rather than the city sewer, grease ruins the activated sludge: it coats the flocs, the sludge floats, solids carry over. A grease trap always precedes a biological stage.",
        ],
      },
      {
        title: "How a size is selected",
        text: [
          "Selection follows the kitchen flow, not the floor area or the number of seats. Count the equipment that actually discharges water: sinks, dishwashers, combi steamers, tilting pans. Their peak flows are summed with a simultaneity factor and converted to m³/h — that figure picks the model. The ZHIR range covers 1 to 50 m³/h.",
          "Three values are then checked. Retention time, 79 to 98 minutes across the range: that is what it takes for hot effluent to cool to roughly 30 °C so the grease can float. Surface area, 1.35 to 35.2 m², from which the floated grease is skimmed. Working volume, 1.35 to 67 m³.",
          "Installation is checked separately: kitchen outlet and sewer invert at the tie-in point, burial depth, groundwater, traffic above the unit. The standard arrangement is buried in a concrete casing; indoor placement is possible where the inverts allow gravity flow and access for pumping out. A DN110 vent stack with a cowl is required in any case.",
        ],
      },
      {
        title: "Construction and maintenance",
        text: [
          "The shell is filament-wound fiberglass on isophthalic polyester resin with stiffening rings; laminate thickness 6 to 10 mm across the range. Inside: an inlet baffle, semi-submerged partitions, an outlet siphon and a removable AISI 304 stainless basket for food waste. Connections run from DN110 on ZHIR-1 to DN355 on ZHIR-50; the large ZHIR-30 and ZHIR-50 are built as two shells, which simplifies delivery and installation.",
          "Fiberglass does not corrode in hot greasy effluent or detergents and needs no coating or waterproofing. It is far lighter than concrete — ZHIR-3 weighs 262 kg and is set without heavy lifting gear — and the monolithic shell has no leaking joints.",
          "Maintenance means pumping out. Grease builds up as a crust on top, sludge collects in the inlet zone: 0.27 to 10.8 m³ of grease and 0.41 to 24.5 m³ of sludge across the range, which sets the service interval. Manholes run along the shell — 2 to 8 depending on size — so every zone can be emptied. The maintenance schedule comes with the unit. Used frying oil must never be poured into the trap, and enzyme products only push grease further down the network.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How do I know which size I need?",
        a: "By kitchen flow. Send the equipment list — sinks, dishwashers, combi steamers — plus the sewer invert at the tie-in point and the installation location. We return a size from the ZHIR-1 … ZHIR-50 range and an installation drawing for the builders. Seat count is not a valid basis.",
      },
      {
        q: "How much does a grease trap cost?",
        a: "Price depends on the size, burial depth, manhole load class and the scope of installation work, so there is no price list on the site. Send your site data and we return a model selection and a quotation. Selection is free.",
      },
      {
        q: "How often does it need cleaning?",
        a: "The interval follows the accumulation volume: ZHIR-1 holds 0.27 m³ of grease and 0.41 m³ of sludge, ZHIR-50 holds 10.8 and 24.5 m³. The closer the actual flow is to the model's rating, the more often it is pumped out. Your exact interval is in the schedule supplied with the unit.",
      },
      {
        q: "Can it be installed indoors, and will it freeze outdoors in winter?",
        a: "The standard arrangement is buried in a concrete casing, where the effluent stays above zero. Indoor placement is possible if the inverts allow gravity flow and there is access for pumping and ventilation — decided from site data. Cold does not harm fiberglass.",
      },
      {
        q: "What documents do you provide?",
        a: "Process calculation, product passport, installation drawing, soil load and buoyancy calculation for the shell, operation manual and maintenance schedule.",
      },
    ],
    ctaTitle: "Send your kitchen equipment —\nget a size and a price.",
    ctaText:
      "List of sinks, dishwashers and combi steamers, sewer invert at the tie-in point, installation location. We return a model selection, specifications and a quotation. Manufactured in Tashkent.",
    ctaButton: "REQUEST A SELECTION",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/nefteulovitel", label: "Oil separators" },
        { href: "/products/peskolovka", label: "Sand traps" },
        { href: "/products/los-bio", label: "Package plants" },
        {
          href: "/solutions/restaurant",
          label: "Grease trap for a restaurant",
        },
        { href: "/solutions/food-industry", label: "Food plant effluent" },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "隔油池",
    title: "隔油池\nZHIR-1 … ZHIR-50。",
    intro:
      "面向咖啡厅、食堂、餐厅和食品加工间厨房的重力式隔油池：流量 1–50 m³/h，自产缠绕玻璃钢罐体，重力自流运行——无水泵、无供电。安装在厨房排出口、接入市政管网之前。",
    sections: [
      {
        title: "隔油池的作用与何时必须设置",
        text: [
          "隔油池在油脂和食物残渣进入市政管网之前将其截留。厨房污水是热的：水槽、洗碗机和万能蒸烤箱的排水为 45–60 °C，此时油脂呈液态、随水流走。它在管道内冷却、在管壁凝结，管径变小，随后开始堵塞——先是自家排出口，然后是院内管网和城市干管。",
          "排放口对油脂有限值：乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议规定 1.0 mg/l。供水公司在对象的检查井取样，超标追责落到场所业主身上。",
          "第二个原因是生物处理。若污水进入自建一体化设备而非市政管网，油脂会破坏活性污泥：包裹絮体、污泥上浮、悬浮物流失。因此生物处理段前必设隔油池。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "按厨房排水流量选型，而不是按餐厅面积或座位数。计入真正排水的设备：水槽、洗碗机、万能蒸烤箱、可倾夹层锅。各用水点的瞬时流量按同时使用系数叠加并换算为 m³/h，据此确定型号。ZHIR 系列覆盖 1–50 m³/h。",
          "随后核对三项数值：停留时间，全系列 79–98 分钟，足以使热污水冷却至约 30 °C 使油脂上浮；水面面积 1.35–35.2 m²，上浮油脂由此撇除；有效容积 1.35–67 m³。",
          "另需核对安装条件：厨房排出口与接入点管道标高、埋深、地下水位、上方是否行车。标准形式为地埋、外包混凝土；若标高满足自流并有清掏通道，也可置于室内。带风帽的 DN110 通气立管在任何情况下都必需。",
        ],
      },
      {
        title: "结构与维护",
        text: [
          "罐体为异苯二甲酸聚酯树脂自产缠绕玻璃钢，带加强环；全系列层压厚度 6–10 mm。内部设进水消能件、半潜隔板、出水虹吸和 AISI 304 不锈钢可拆食物残渣篮。接管由 ZHIR-1 的 DN110 至 ZHIR-50 的 DN355；大规格 ZHIR-30 与 ZHIR-50 采用两个罐体，便于运输与安装。",
          "玻璃钢在高温含油污水和洗涤剂环境中不腐蚀，无需涂装与防水。重量远低于混凝土——ZHIR-3 仅 262 kg，无需大型吊装设备；整体成型，无渗漏接缝。",
          "维护即定期清掏。油脂在上部结成油壳，沉渣积于进水沉泥区：全系列油脂积存量 0.27–10.8 m³、沉渣 0.41–24.5 m³，清掏周期由此确定。检修井沿罐体长度布置，按规格 2–8 个，可逐区清掏。维护规程随货提供。废煎炸油严禁倒入隔油池；「分解油脂」的酶制剂只会把油脂推入管网。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "如何确定需要哪个规格？",
        a: "按厨房排水流量。请提供设备清单（水槽、洗碗机、万能蒸烤箱）、接入点的管道标高和安装位置，我们回复 ZHIR-1 … ZHIR-50 中的规格并附施工用安装图。按座位数选型不成立。",
      },
      {
        q: "隔油池多少钱？",
        a: "价格取决于规格、埋深、井盖荷载等级和安装工作量，因此网站不公布价目表。提供对象数据，我们回复选型与报价，选型免费。",
      },
      {
        q: "多久清掏一次？",
        a: "周期由积存容量决定：ZHIR-1 为 0.27 m³ 油脂与 0.41 m³ 沉渣，ZHIR-50 为 10.8 与 24.5 m³。实际流量越接近额定值，清掏越频繁。具体间隔见随货维护规程。",
      },
      {
        q: "可以装在室内吗？冬季室外会冻吗？",
        a: "标准形式为地埋、外包混凝土，污水温度始终高于零度。若标高满足自流且具备清掏与通风条件，也可置于室内，依对象数据确定。低温对玻璃钢无害。",
      },
      {
        q: "提供哪些文件？",
        a: "工艺计算书、产品合格证、安装图、罐体抗浮与土压计算、运行手册与维护规程。",
      },
    ],
    ctaTitle: "发送厨房设备清单——\n我们回复规格与价格。",
    ctaText:
      "水槽、洗碗机与万能蒸烤箱清单，接入点管道标高，安装位置。我们回复选型、参数与报价。塔什干生产。",
    ctaButton: "申请选型",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/nefteulovitel", label: "油水分离器" },
        { href: "/products/peskolovka", label: "沉砂池" },
        { href: "/products/los-bio", label: "一体化生物处理设备" },
        { href: "/solutions/restaurant", label: "餐厅隔油器" },
        { href: "/solutions/food-industry", label: "食品厂污水处理" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
