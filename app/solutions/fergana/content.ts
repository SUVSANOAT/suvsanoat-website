import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Фергана», «ЛОС Фергана»,
 * «нефтеуловитель Фергана», «tozalash inshootlari Farg‘ona».
 * Городская страница: производство в Ташкенте, доставка ≈320 км через Камчик.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ФЕРГАНА И ФЕРГАНСКАЯ ДОЛИНА",
    title: "Очистные сооружения\nв Фергане.",
    intro:
      "Производим очистные сооружения в Ташкенте и поставляем их в Фергану и по всей долине: корпуса из стеклопластика собственной намотки, расчёт по КМК, монтаж и пусконаладка нашими бригадами. Подбираем решение под тесный участок, высокую воду в грунте и характер стока конкретного объекта.",
    sections: [
      {
        title: "Какие объекты в долине чаще всего остаются без канализации",
        text: [
          "Ферганская долина застроена плотно, и городская канализация покрывает далеко не всё. Типичный заказчик здесь — махалля или новый жилой массив на окраине, дом или гостевой дом за чертой коллектора, школа или амбулатория в кишлаке. Сток бытовой, но неравномерный: утренний и вечерний пики выше среднесуточных, и станция должна их держать без выноса ила.",
          "Вторая группа — общепит. Кафе, столовые, чайханы и свадебные залы дают жирный сток, который без жироуловителя за месяцы забивает выпуск и убивает биологию на станции. Здесь жироуловитель ставится первым, до всего остального.",
          "Третья — автомойки, АЗС и стоянки, а также пищевые и текстильные производства. У них сток другой по природе: взвесь, песок, нефтепродукты, у текстиля — красители и повышенная температура. Такие объекты считаем отдельно, по фактическому составу стока, а не по числу пользователей.",
        ],
      },
      {
        title: "Инженерная специфика: вода в грунте и теснота участка",
        text: [
          "В долине уровень грунтовых вод часто стоит высоко, и это меняет не технологию, а корпус. Пустая ёмкость в обводнённом грунте работает как поплавок, поэтому корпус проверяется расчётом на всплытие, и при необходимости мы крепим его анкерами к бетонной плите основания. Расчёт на грунтовые нагрузки и всплытие выдаём вместе с изделием — его можно показать проектировщику.",
          "Стеклопластик собственной намотки даёт монолитный герметичный корпус без сварных и бетонных швов. Там, где рядом скважина, арык или поливной канал, это принципиально: течь по шву в такой обстановке — не эксплуатационная мелочь, а загрязнение источника воды у соседей.",
          "Место на участках долины почти всегда в дефиците. Поэтому основное решение — компактное подземное размещение: сверху остаются только люки, а над станцией можно проехать или организовать площадку. Компоновку подбираем под геометрию участка — вертикальную, когда есть глубина и мало пятна, горизонтальную, когда глубина ограничена.",
          "Отдельно про автомойки и площадки с ливневым стоком: сначала песколовка, только потом нефтеуловитель. Если поставить нефтеуловитель напрямую, песок и мелкая взвесь с колёс быстро забивают коалесцентный блок и сорбционную загрузку, и обслуживание превращается в постоянную промывку. Песколовка снимает основную массу минеральных примесей и продлевает ресурс фильтров.",
        ],
      },
      {
        title: "Доставка в Фергану, расчёт и документы",
        text: [
          "От производства в Ташкенте до Ферганы ≈320 км, дорога идёт через перевал Камчик. Поэтому габарит и вес изделия закладываются в проект заранее, а не выясняются в день отгрузки: диаметр и длина корпуса подбираются под возможности перевозки. Крупные объёмы при необходимости разбиваем на несколько корпусов, которые собираются в единую линию уже на объекте.",
          "Технологический расчёт ведём по КМК 2.04.03-19 и КМК 2.04.01-98. Расчёт открытый: его вместе с паспортом изделия, схемами установки и расчётом корпуса можно передать проектировщику и в экспертизу. Покупные узлы — насосы, воздуходувки, КИП — указываем в коммерческом предложении с марками.",
          "Монтаж и пусконаладку выполняют наши бригады: посадка корпуса, обвязка, электрика, вывод станции на режим и передача заказчику вместе с регламентом обслуживания.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи Ферганы и долины — и модели, с которых стоит начать разговор. Точный подбор — по данным объекта.",
    picks: [
      { slug: "bio-10", when: "Дом, гостевой дом, ~50 жителей" },
      { slug: "bio-50", when: "Махалля, посёлок" },
      { slug: "zhir-5", when: "Столовая, кафе" },
      { slug: "nef-10", when: "Автомойка, АЗС" },
      { slug: "pes-10", when: "Песколовка перед нефтеуловителем" },
      { slug: "kns-10", when: "Перекачка стоков участка" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "У нас высокий уровень грунтовых вод. Можно ставить подземную станцию?",
        a: "Можно, но корпус должен быть на это посчитан. Мы проверяем изделие на всплытие при пустой ёмкости и обводнённом грунте и, если запаса не хватает, крепим корпус анкерами к бетонной плите основания. Расчёт на грунтовые нагрузки и всплытие выдаём с изделием — его можно показать проектировщику и в экспертизу.",
      },
      {
        q: "Сколько стоит доставка в Фергану?",
        a: "Стоимость доставки зависит от габарита и веса изделия — от производства в Ташкенте до Ферганы ≈320 км через перевал Камчик. Транспортную схему закладываем ещё на стадии подбора, а крупные объёмы при необходимости разбиваем на несколько корпусов. Итоговая цифра входит в коммерческое предложение.",
      },
      {
        q: "На участке очень мало места. Что можно сделать?",
        a: "Станция размещается под землёй — на поверхности остаются только люки обслуживания. Компоновку подбираем под геометрию участка: вертикальная, когда пятно застройки маленькое и есть глубина, горизонтальная, когда глубина ограничена. Точный вариант определяется по данным участка и отметкам подводящего коллектора.",
      },
      {
        q: "Для автомойки достаточно одного нефтеуловителя?",
        a: "Как правило нет. Перед нефтеуловителем нужна песколовка: с колёс и с площадки идёт песок и минеральная взвесь, которые быстро забивают коалесцентный блок и сорбцию. С песколовкой основная масса взвеси задерживается раньше, и ресурс фильтров расходуется на то, для чего они предназначены — на нефтепродукты.",
      },
      {
        q: "Кто выполняет монтаж и запуск в Фергане?",
        a: "Наши бригады. Мы производим корпус в Ташкенте, доставляем на объект, сажаем в котлован, делаем обвязку и электрику, выполняем пусконаладку и выводим станцию на режим. Покупные узлы — насосы, воздуходувки, КИП — идут с указанием марок в коммерческом предложении.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Опишите объект —\nвернём расчёт и цену.",
    ctaText:
      "Тип объекта, расход или число пользователей, куда сброс, уровень грунтовых вод и размер площадки. Вернём подбор модели, характеристики и коммерческое предложение. Производство — Ташкент, доставка в Фергану.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "География производства и монтажа",
      links: [
        { href: "/solutions/tashkent", label: "Ташкент" },
        { href: "/solutions/samarkand", label: "Самарканд" },
        { href: "/solutions/bukhara", label: "Бухара" },
        { href: "/solutions/namangan", label: "Наманган" },
        { href: "/solutions/navoi", label: "Навои" },
      ],
    },
  },

  uz: {
    label: "FARG‘ONA VA FARG‘ONA VODIYSI",
    title: "Farg‘onada tozalash\ninshootlari.",
    intro:
      "Tozalash inshootlarini Toshkentda ishlab chiqaramiz va Farg‘onaga hamda butun vodiyga yetkazamiz: o‘z o‘ramimizdagi shishatolali korpuslar, KMK bo‘yicha hisob, montaj va ishga tushirish o‘z brigadalarimiz bilan. Yechimni tor uchastka, yuqori sizot suvlari va obyektning oqava tarkibiga qarab tanlaymiz.",
    sections: [
      {
        title: "Vodiyda qaysi obyektlar kanalizatsiyasiz qoladi",
        text: [
          "Farg‘ona vodiysi zich qurilgan, markaziy kanalizatsiya esa hamma joyni qamrab olmaydi. Bu yerdagi odatiy buyurtmachi — chekkadagi mahalla yoki yangi turar-joy massivi, kollektordan tashqarida qolgan uy yoki mehmon uyi, qishloqdagi maktab yoki ambulatoriya. Oqava maishiy, lekin notekis: ertalabki va kechki cho‘qqilar o‘rtacha sutkalikdan yuqori, stansiya esa ularni loy chiqarmasdan ushlashi kerak.",
          "Ikkinchi guruh — umumiy ovqatlanish. Kafe, oshxona, choyxona va to‘yxonalar yog‘li oqava beradi: yog‘ tutgichsiz u bir necha oyda chiqish quvurini bosib qo‘yadi va stansiyadagi biologiyani o‘ldiradi. Bu yerda yog‘ tutgich hammasidan oldin qo‘yiladi.",
          "Uchinchisi — avtoyuvishlar, ShAQSh va to‘xtash joylari, shuningdek oziq-ovqat va to‘qimachilik ishlab chiqarishlari. Ularning oqavasi boshqacha: muallaq zarralar, qum, neft mahsulotlari, to‘qimachilikda — bo‘yoqlar va yuqori harorat. Bunday obyektlarni foydalanuvchilar soni bo‘yicha emas, oqavaning haqiqiy tarkibi bo‘yicha alohida hisoblaymiz.",
        ],
      },
      {
        title: "Muhandislik xususiyati: sizot suvlari va uchastkaning torligi",
        text: [
          "Vodiyda sizot suvlari sathi ko‘pincha yuqori turadi, bu esa texnologiyani emas, korpusni o‘zgartiradi. Suvli gruntdagi bo‘sh idish qalqovich kabi ishlaydi, shuning uchun korpus suzib chiqishga hisoblanadi va zarur bo‘lsa uni anker bilan asos beton plitasiga mahkamlaymiz. Grunt yuklari va suzib chiqishga hisobni mahsulot bilan beramiz — uni loyihachiga ko‘rsatish mumkin.",
          "O‘z o‘ramimizdagi shishatolali plastik yaxlit, germetik, choksiz korpus beradi. Yaqinida quduq, ariq yoki sug‘orish kanali bo‘lgan joyda bu prinsipial: bunday sharoitda chokdan oqish mayda nuqson emas, balki qo‘shnilarning suv manbayini ifloslantirish.",
          "Vodiy uchastkalarida joy deyarli har doim tanqis. Shuning uchun asosiy yechim — ixcham yer osti joylashuvi: yuzada faqat lyuklar qoladi, stansiya ustidan o‘tish yoki maydoncha tashkil qilish mumkin. Kompanovkani uchastka geometriyasiga qarab tanlaymiz: chuqurlik bor va dog‘ kichik bo‘lsa — vertikal, chuqurlik cheklangan bo‘lsa — gorizontal.",
          "Avtoyuvish va yomg‘ir oqavasi bo‘lgan maydonchalar haqida alohida: avval qum tutgich, keyin neft tutgich. Neft tutgichni to‘g‘ridan-to‘g‘ri qo‘ysangiz, g‘ildiraklardan keladigan qum va mayda zarralar koalesent blok va sorbsion yuklamani tez bosib qo‘yadi. Qum tutgich mineral aralashmalarning asosiy qismini ushlab, filtrlar resursini uzaytiradi.",
        ],
      },
      {
        title: "Farg‘onaga yetkazish, hisob va hujjatlar",
        text: [
          "Toshkentdagi ishlab chiqarishdan Farg‘onagacha ≈320 km, yo‘l Kamchiq dovoni orqali o‘tadi. Shuning uchun mahsulotning gabariti va vazni loyihaga oldindan kiritiladi, jo‘natish kunida aniqlanmaydi: korpus diametri va uzunligi tashish imkoniyatlariga moslanadi. Katta hajmlarni zarur bo‘lsa bir necha korpusga bo‘lamiz va ular obyektda yagona liniyaga yig‘iladi.",
          "Texnologik hisobni KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha bajaramiz. Hisob ochiq: uni mahsulot pasporti, o‘rnatish sxemalari va korpus hisobi bilan birga loyihachiga hamda ekspertizaga topshirish mumkin. Sotib olinadigan uzellar — nasoslar, havo purkagichlar, KIP — tijorat taklifida markalari bilan ko‘rsatiladi.",
          "Montaj va ishga tushirishni o‘z brigadalarimiz bajaradi: korpusni o‘rnatish, obvyazka, elektrika, stansiyani rejimga chiqarish va xizmat reglamenti bilan buyurtmachiga topshirish.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Farg‘ona va vodiyning tipik vazifalari — suhbatni boshlash uchun modellar. Aniq tanlov — obyekt ma’lumotlari bo‘yicha.",
    picks: [
      { slug: "bio-10", when: "Uy, mehmon uyi, ~50 kishi" },
      { slug: "bio-50", when: "Mahalla, qishloq" },
      { slug: "zhir-5", when: "Oshxona, kafe" },
      { slug: "nef-10", when: "Avtoyuvish, ShAQSh" },
      { slug: "pes-10", when: "Neft tutgich oldidagi qum tutgich" },
      { slug: "kns-10", when: "Uchastka oqavasini haydash" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Bizda sizot suvlari yuqori. Yer osti stansiyasini qo‘yish mumkinmi?",
        a: "Mumkin, lekin korpus shunga hisoblangan bo‘lishi kerak. Idish bo‘sh va grunt suvli holatda suzib chiqishga tekshiramiz, zaxira yetmasa korpusni anker bilan asos beton plitasiga mahkamlaymiz. Grunt yuklari va suzib chiqishga hisobni mahsulot bilan beramiz — uni loyihachiga va ekspertizaga ko‘rsatish mumkin.",
      },
      {
        q: "Farg‘onaga yetkazish qancha turadi?",
        a: "Yetkazish qiymati mahsulot gabariti va vazniga bog‘liq — Toshkentdagi ishlab chiqarishdan Farg‘onagacha Kamchiq dovoni orqali ≈320 km. Shuning uchun transport sxemasini tanlov bosqichidayoq kiritamiz: korpus gabaritini tashish imkoniyatlariga moslaymiz, katta hajmlarni zarur bo‘lsa bir necha korpusga bo‘lamiz. Yakuniy raqam tijorat taklifiga kiradi.",
      },
      {
        q: "Uchastkada joy juda kam. Nima qilish mumkin?",
        a: "Stansiya yer ostiga joylashadi — yuzada faqat xizmat lyuklari qoladi. Kompanovkani uchastka geometriyasiga qarab tanlaymiz: dog‘ kichik va chuqurlik bo‘lsa — vertikal, chuqurlik cheklangan bo‘lsa — gorizontal. Aniq variant uchastka ma’lumotlari va keluvchi kollektor belgilaridan keyin aniqlanadi.",
      },
      {
        q: "Avtoyuvish uchun bitta neft tutgich yetarlimi?",
        a: "Odatda yo‘q. Neft tutgich oldida qum tutgich kerak: g‘ildiraklardan va maydonchadan qum hamda mineral zarralar keladi, ular koalesent blok va sorbsiyani tez bosadi. Qum tutgich bilan asosiy zarralar oldinroq ushlanadi, filtrlar resursi esa o‘z vazifasiga — neft mahsulotlariga sarflanadi.",
      },
      {
        q: "Farg‘onada montaj va ishga tushirishni kim bajaradi?",
        a: "O‘z brigadalarimiz. Korpusni Toshkentda ishlab chiqaramiz, obyektga yetkazamiz, kotlovanga o‘rnatamiz, obvyazka va elektrikani qilamiz, ishga tushirib rejimga chiqaramiz. Sotib olinadigan uzellar — nasoslar, havo purkagichlar, KIP — tijorat taklifida markalari bilan, xizmat reglamenti bilan birga beriladi.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Obyektni tasvirlab bering —\nhisob va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, sarf yoki foydalanuvchilar soni, oqava qayerga ketadi, sizot suvlari sathi va maydoncha o‘lchami. Model tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent, yetkazish — Farg‘ona.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Ishlab chiqarish va montaj geografiyasi",
      links: [
        { href: "/solutions/tashkent", label: "Toshkent" },
        { href: "/solutions/samarkand", label: "Samarqand" },
        { href: "/solutions/bukhara", label: "Buxoro" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoiy" },
      ],
    },
  },

  en: {
    label: "FERGANA AND THE FERGANA VALLEY",
    title: "Wastewater treatment\nplants in Fergana.",
    intro:
      "We manufacture in Tashkent and deliver to Fergana and across the valley: filament-wound fiberglass tanks, KMK calculations, installation and commissioning by our own crews. Solutions are matched to a tight plot, high groundwater and the actual character of your effluent.",
    sections: [
      {
        title: "What sites in the valley need treatment",
        text: [
          "The valley is densely built and central sewerage does not reach everywhere. Typical clients: a mahalla or a new housing area on the outskirts, a house or guest house beyond the collector, a rural school or clinic. The flow is domestic but uneven — morning and evening peaks run above the daily average, and the plant has to absorb them without sludge carryover.",
          "Second group: catering. Cafes, canteens and banquet halls produce fatty effluent that blocks the outlet and kills the biology within months, so a grease trap comes first.",
          "Third: car washes, filling stations and parkings, plus food and textile production. Their effluent is different by nature — suspended solids, sand, oil products, dyes and heat from textiles. These are calculated on actual effluent composition, not on user count.",
        ],
      },
      {
        title: "Engineering specifics: groundwater and a tight plot",
        text: [
          "Groundwater in the valley often stands high, which changes the tank rather than the process. An empty vessel in saturated soil behaves like a float, so the shell is checked for buoyancy and, where needed, anchored to a concrete base slab. The soil load and buoyancy calculation is supplied with the unit.",
          "Filament-wound fiberglass gives a monolithic, sealed shell with no seams. Where a well, an aryk or an irrigation canal is nearby, that matters: a leaking joint there is contamination of a neighbour's water source.",
          "Space is almost always short. The plant goes underground — only service hatches stay on the surface — with a vertical layout where depth is available and the footprint is small, or a horizontal one where depth is limited.",
          "For car washes and paved areas: a sand trap first, an oil separator after it. Fed directly, the coalescing block and sorbent load clog quickly with sand from wheels; the sand trap removes the mineral bulk and extends filter life.",
        ],
      },
      {
        title: "Delivery, calculation and documents",
        text: [
          "It is about 320 km from our production in Tashkent to Fergana, over the Kamchik pass. Dimensions and weight are therefore built into the design in advance, and large volumes are split into several tanks assembled into one line on site.",
          "Process calculations follow KMK 2.04.03-19 and KMK 2.04.01-98 and are open — they go to your designer and to state expert review together with the product passport, installation drawings and the shell calculation. Bought-in items — pumps, blowers, instruments — are named with brands in the quotation.",
          "Installation and commissioning are done by our own crews, up to handover with a maintenance schedule.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical tasks in Fergana and the valley — models to start the conversation. Exact selection is based on site data.",
    picks: [
      { slug: "bio-10", when: "House, guest house, ~50 users" },
      { slug: "bio-50", when: "Mahalla, settlement" },
      { slug: "zhir-5", when: "Canteen, cafe" },
      { slug: "nef-10", when: "Car wash, filling station" },
      { slug: "pes-10", when: "Sand trap before an oil separator" },
      { slug: "kns-10", when: "Pumping site sewage" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Groundwater is high on our site. Can we still bury the plant?",
        a: "Yes, if the shell is calculated for it. We check the tank for buoyancy when empty in saturated soil and anchor it to a concrete base slab when the margin is not enough. The soil load and buoyancy calculation comes with the unit and can be shown to your designer and to expert review.",
      },
      {
        q: "What does delivery to Fergana cost?",
        a: "It depends on dimensions and weight — the route from Tashkent is about 320 km over the Kamchik pass. We build the transport scheme into the selection stage and split large volumes into several tanks when needed. The figure is included in the quotation.",
      },
      {
        q: "We have very little space. What are the options?",
        a: "The plant is installed underground with only service hatches above grade. Layout follows the plot: vertical where depth is available and the footprint is small, horizontal where depth is limited. The exact option follows from site data and collector elevations.",
      },
      {
        q: "Is a single oil separator enough for a car wash?",
        a: "Usually not. A sand trap is needed upstream: sand and mineral solids from wheels and the yard clog the coalescing block and sorbent quickly. With a sand trap the bulk is captured earlier and the filters are spent on oil products, as intended.",
      },
      {
        q: "Who installs and commissions in Fergana?",
        a: "Our own crews. We manufacture the tank in Tashkent, deliver it, set it in the pit, complete piping and electrics, commission the plant and hand it over with a maintenance schedule. Pumps, blowers and instruments are bought-in and named with brands in the quotation.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Describe your site —\nget a selection and a price.",
    ctaText:
      "Facility type, flow or number of users, discharge point, groundwater level and plot size. We return a model selection, specifications and a quotation. Manufactured in Tashkent, delivered to Fergana.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Where we deliver and install",
      links: [
        { href: "/solutions/tashkent", label: "Tashkent" },
        { href: "/solutions/samarkand", label: "Samarkand" },
        { href: "/solutions/bukhara", label: "Bukhara" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoi" },
      ],
    },
  },

  zh: {
    label: "费尔干纳及费尔干纳盆地",
    title: "费尔干纳\n污水处理设备。",
    intro:
      "在塔什干生产，供货至费尔干纳及整个盆地：自缠绕玻璃钢罐体、按 KMK 标准计算、自有队伍安装调试。方案按地块狭小、地下水位高与实际水质定制。",
    sections: [
      {
        title: "盆地内常见的对象",
        text: [
          "盆地建筑密集，市政管网并未全覆盖。典型对象：城郊的马哈拉与新建住宅区、管网之外的住宅与民宿、乡村学校与卫生站。水量为生活污水但不均匀，早晚峰值高于日均，设备须在不跑泥的情况下承受冲击。",
          "第二类是餐饮：咖啡馆、食堂、婚宴厅的含油污水，如无隔油器，数月内即堵塞排出管并破坏生物系统，因此隔油器先行。",
          "第三类是洗车场、加油站、停车场，以及食品与纺织生产。其水质不同：悬浮物、砂、石油类，纺织还有染料与较高水温。这类对象按实际水质单独计算，而非按人数。",
        ],
      },
      {
        title: "工程特点：地下水与狭小场地",
        text: [
          "盆地地下水位常常较高，这改变的不是工艺而是罐体。空罐在饱水土中如同浮体，因此罐体须做抗浮验算，必要时用锚杆固定于混凝土底板。土压与抗浮计算书随货提供。",
          "自缠绕玻璃钢罐体整体成型、密封无接缝。当附近有水井、灌渠或引水渠时，这一点尤为关键：接缝渗漏意味着污染邻近水源。",
          "场地几乎总是紧张。设备埋地布置，地面仅留检修井盖；埋深允许而占地小时采用立式，埋深受限时采用卧式。",
          "洗车场与铺装场地：先沉砂池，后油水分离器。若直接进入分离器，轮胎与场地带入的砂粒会迅速堵塞聚结板与吸附填料；沉砂池截留大部分无机杂质，延长滤料寿命。",
        ],
      },
      {
        title: "运输、计算与文件",
        text: [
          "塔什干工厂至费尔干纳约 320 公里，经卡姆奇克山口。因此外形尺寸与重量在设计阶段即行确定；大容量必要时拆分为数个罐体，在现场组装为一条工艺线。",
          "工艺计算依据 KMK 2.04.03-19 与 KMK 2.04.01-98，计算书公开，连同产品合格证、安装图与罐体计算一并提交设计单位与专家审查。外购件（泵、风机、仪表）在报价中注明品牌。",
          "安装与调试由我方队伍完成，直至带维护规程交付。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "费尔干纳及盆地的典型任务与推荐起点型号。精确选型依据对象数据。",
    picks: [
      { slug: "bio-10", when: "住宅、民宿，约50人" },
      { slug: "bio-50", when: "马哈拉、村镇" },
      { slug: "zhir-5", when: "食堂、咖啡馆" },
      { slug: "nef-10", when: "洗车场、加油站" },
      { slug: "pes-10", when: "油水分离器前置沉砂池" },
      { slug: "kns-10", when: "场地污水提升" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "地下水位高，还能埋地安装吗？",
        a: "可以，但罐体须按此验算。我们按空罐、饱水土工况校核抗浮，安全裕度不足时用锚杆固定于混凝土底板。土压与抗浮计算书随货提供，可提交设计单位与专家审查。",
      },
      {
        q: "运到费尔干纳的费用如何？",
        a: "取决于外形尺寸与重量——塔什干至费尔干纳约 320 公里，经卡姆奇克山口。运输方案在选型阶段即纳入考虑，大容量必要时拆分为数个罐体，最终费用列入报价。",
      },
      {
        q: "场地非常狭小怎么办？",
        a: "设备埋地布置，地面仅留检修井盖。布置形式按地块确定：占地小而埋深允许时用立式，埋深受限时用卧式。具体方案依据场地数据与进水管标高确定。",
      },
      {
        q: "洗车场只装一台油水分离器够吗？",
        a: "通常不够。前置需设沉砂池：轮胎与场地带入的砂粒和无机悬浮物会迅速堵塞聚结板与吸附填料。有沉砂池时大部分杂质提前被截留，滤料专用于去除石油类。",
      },
      {
        q: "费尔干纳的安装调试由谁负责？",
        a: "我方自有队伍。罐体在塔什干生产，运至现场，入坑就位，完成管路与电气，调试并带维护规程交付。泵、风机、仪表为外购件，报价中注明品牌。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "描述您的对象——\n我们回复选型与价格。",
    ctaText:
      "对象类型、流量或人数、排放去向、地下水位与场地尺寸。我们回复选型、参数与报价。塔什干生产，供货费尔干纳。",
    ctaButton: "获取报价",
    related: {
      title: "供货与安装地区",
      links: [
        { href: "/solutions/tashkent", label: "塔什干" },
        { href: "/solutions/samarkand", label: "撒马尔罕" },
        { href: "/solutions/bukhara", label: "布哈拉" },
        { href: "/solutions/namangan", label: "纳曼干" },
        { href: "/solutions/navoi", label: "纳沃伊" },
      ],
    },
  },
};

export default content;
