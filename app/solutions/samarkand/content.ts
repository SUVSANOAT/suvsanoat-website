import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Самарканд», «ЛОС Самарканд»,
 * «жироуловитель Самарканд», «tozalash inshootlari Samarqand».
 * Городская специфика: туристические объекты, узкие улицы исторического
 * центра, махалли без централизованной канализации, доставка ≈300 км.
 */

const content: SolutionContentSet = {
  ru: {
    label: "САМАРКАНД И САМАРКАНДСКАЯ ОБЛАСТЬ",
    title: "Очистные сооружения\nв Самарканде.",
    intro:
      "Производим очистные сооружения в Ташкенте и поставляем в Самарканд: корпуса из стеклопластика собственной намотки, расчёт по нормам КМК, монтаж и пусконаладка нашими бригадами. Гостиницы и гостевые дома, рестораны и чайханы, пищевые производства, махалли и объекты без централизованной канализации.",
    sections: [
      {
        title: "Какие объекты в Самарканде чаще всего просят очистку",
        text: [
          "Первая группа — туристическое размещение. Гостевой дом на десяток номеров и гостиница на сотню мест дают разный расход и разный график: заполняемость скачет по сезону, ночью сток почти исчезает, утром идёт пик. Биологическая очистка это переносит, если объём аэротенка и возврат ила посчитаны под реальную неравномерность, а не под средние сутки. Поэтому мы спрашиваем не «сколько квадратов», а число мест, наличие прачечной, кухни и бассейна.",
          "Вторая — общепит: рестораны, чайханы, кафе и цеха при гостиницах. Здесь до биологии нужен жироуловитель, иначе жир заплывает в коллектор и в аэротенк, и очистка ложится. Жироуловитель подбирается по секундному расходу от моек и посудомоечных машин, а не по площади зала.",
          "Третья — пищевые производства и объекты вне зоны городских сетей: махалли, придорожные комплексы, базы отдыха вдоль трассы. Там сброс идёт на рельеф, в поглощающий колодец или на полив, и класс очистки задаёт именно приёмник, а не пожелание заказчика.",
        ],
      },
      {
        title: "Инженерная специфика исторической части города",
        text: [
          "Главное ограничение в старом Самарканде — подъезд. Узкие улицы, глухие дворы, ограничение по массе и вылету стрелы: тяжёлый бетонный колодец туда попросту не заходит. Стеклопластиковый корпус весит в разы меньше бетонного при том же объёме, поэтому его опускают краном малой грузоподъёмности, а иногда и через двор, минуя фасадную линию. Монтажной площадки нужно меньше, работы короче по фронту, улица меньше перекрывается.",
          "Размещение почти всегда подземное — под парковкой, двором или проездом, с люками в уровень покрытия. Корпус монолитный, без сборных швов, с кольцами жёсткости; расчёт на грунтовые нагрузки и всплытие мы выдаём с изделием, и он же идёт проектировщику. Если грунтовые воды высокие или сверху проезд, добавляем анкеровку и плиту — это решается расчётом, а не на месте.",
          "Отдельно — запах и шум. Установка часто оказывается в нескольких метрах от террасы, окна номера или зоны отдыха. Корпус герметичный, вытяжка выводится вертикально выше уровня гостевой зоны, воздуходувка ставится в шумозащитном кожухе или выносится в техническое помещение. Это закладывается на этапе компоновки: переставить оборудование потом дороже, чем сразу выбрать место.",
        ],
      },
      {
        title: "Доставка, монтаж и обслуживание в Самарканде",
        text: [
          "От производства в Ташкенте до Самарканда ≈300 км по трассе, везём автотранспортом — обычно один день в пути. Габаритные корпуса планируем по разрешённым габаритам, разгрузку согласуем заранее: в исторической части время подъезда техники часто ограничено.",
          "Монтаж и пусконаладку выполняет наша выездная бригада: посадка корпуса, обвязка, электрика, запуск и вывод на показатели. Сервисные узлы — насосы, воздуходувки, КИП — покупные и стандартные, марки указываем в коммерческом предложении открыто; они лежат на складе в Ташкенте, поэтому замена не требует ожидания поставки из-за рубежа.",
          "Расчёт ведём по КМК 2.04.03-19 и КМК 2.04.01-98. Расчёт открытый: его можно передать проектировщику и в экспертизу вместе с паспортом изделия, схемами установки и регламентом обслуживания. Цену не публикуем — она зависит от расхода, глубины подводящего коллектора и комплектации; пришлите данные объекта, вернём подбор и коммерческое предложение.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи Самарканда — и модели, с которых стоит начать разговор. Точный подбор — по данным объекта.",
    picks: [
      { slug: "bio-5", when: "Гостевой дом, ~25 жителей" },
      { slug: "bio-15", when: "Гостиница, ~75 мест" },
      { slug: "zhir-2", when: "Кафе, чайхана" },
      { slug: "zhir-8", when: "Ресторан, столовая" },
      { slug: "nef-6", when: "Автомойка, паркинг" },
      { slug: "rez-20", when: "Запас воды, накопитель" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Вы возите очистные в Самарканд из Ташкента?",
        a: "Да. Производство находится в Ташкенте, до Самарканда ≈300 км, доставка автотранспортом — обычно один день в пути. Монтаж и пусконаладку делает наша выездная бригада, а не подрядчик со стороны.",
      },
      {
        q: "Как поставить очистные в историческом центре, где не проходит техника?",
        a: "За счёт материала корпуса. Стеклопластик весит в разы меньше бетона того же объёма, поэтому корпус опускается краном малой грузоподъёмности и требует меньшей монтажной площадки. Перед выездом уточняем ширину проезда, возможную точку стоянки крана и вылет стрелы — компоновку подстраиваем под подъезд.",
      },
      {
        q: "Будет ли пахнуть рядом с гостевой зоной или террасой?",
        a: "Корпус герметичный, вентиляция выводится вертикально выше уровня гостевой зоны, люки — с уплотнением. Воздуходувку ставим в шумозащитном кожухе или в техническом помещении. Место установки и трассу вытяжки согласуем на этапе компоновки.",
      },
      {
        q: "Что нужно для гостиницы, а что для чайханы?",
        a: "Гостинице и гостевому дому нужна биологическая очистка, подобранная по числу мест и наличию прачечной и кухни. Чайхане и ресторану в первую очередь нужен жироуловитель, подобранный по расходу от моек и посудомоечных машин; при отсутствии городской канализации он ставится перед биологической ступенью.",
      },
      {
        q: "Какие документы получит проектировщик?",
        a: "Технологический расчёт по КМК 2.04.03-19 и КМК 2.04.01-98, паспорт изделия, схемы установки и присоединения, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания. Этот комплект пригоден для передачи в экспертизу.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Опишите объект —\nвернём расчёт и цену.",
    ctaText:
      "Тип объекта, число мест или расход, куда сброс, условия подъезда. Вернём подбор модели, характеристики и коммерческое предложение. Производство — Ташкент, доставка в Самарканд.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "География производства и монтажа",
      links: [
        { href: "/solutions/tashkent", label: "Ташкент" },
        { href: "/solutions/bukhara", label: "Бухара" },
        { href: "/solutions/fergana", label: "Фергана" },
        { href: "/solutions/namangan", label: "Наманган" },
        { href: "/solutions/navoi", label: "Навои" },
      ],
    },
  },

  uz: {
    label: "SAMARQAND VA SAMARQAND VILOYATI",
    title: "Samarqandda tozalash\ninshootlari.",
    intro:
      "Tozalash inshootlarini Toshkentda ishlab chiqaramiz va Samarqandga yetkazamiz: o‘z o‘ramimizdagi shishatolali korpuslar, KMK me’yorlari bo‘yicha hisob, montaj va ishga tushirish — o‘z brigadalarimiz. Mehmonxona va mehmon uylari, restoran va choyxonalar, oziq-ovqat ishlab chiqarish, markaziy kanalizatsiyasiz mahallalar va obyektlar.",
    sections: [
      {
        title: "Samarqandda qanday obyektlar tozalash so‘raydi",
        text: [
          "Birinchi guruh — turistik joylashuv. O‘nta xonali mehmon uyi va yuz o‘rinli mehmonxona sarfi ham, grafigi ham boshqacha: bandlik mavsumga qarab o‘zgaradi, kechasi oqava deyarli yo‘qoladi, ertalab cho‘qqi bo‘ladi. Biologik tozalash buni ko‘taradi, agar aeroteng hajmi va il qaytishi o‘rtacha sutkaga emas, haqiqiy notekislikka hisoblangan bo‘lsa. Shuning uchun «necha kvadrat» emas, o‘rinlar soni, kir yuvish, oshxona va basseyn borligini so‘raymiz.",
          "Ikkinchisi — umumiy ovqatlanish: restoranlar, choyxonalar, kafelar va mehmonxona qoshidagi sexlar. Bu yerda biologiyagacha yog‘ tutgich kerak, aks holda yog‘ kollektorga va aerotengga o‘tadi va tozalash to‘xtaydi. Yog‘ tutgich zal maydoni bo‘yicha emas, yuvish joylari va idish yuvish mashinalarining soniyalik sarfi bo‘yicha tanlanadi.",
          "Uchinchisi — oziq-ovqat ishlab chiqarish va shahar tarmoqlaridan tashqaridagi obyektlar: mahallalar, yo‘l bo‘yidagi majmualar, dam olish maskanlari. U yerda oqava relyefga, singdiruvchi quduqqa yoki sug‘orishga ketadi va tozalash darajasini buyurtmachining xohishi emas, qabul qiluvchi belgilaydi.",
        ],
      },
      {
        title: "Tarixiy qismning muhandislik xususiyatlari",
        text: [
          "Eski Samarqandda asosiy cheklov — kirish yo‘li. Tor ko‘chalar, berk hovlilar, massa va strela uzunligi bo‘yicha cheklov: og‘ir beton quduq u yerga umuman kirmaydi. Shishatolali korpus bir xil hajmda betondan bir necha barobar yengil, shuning uchun uni kichik yuk ko‘tarish quvvatiga ega kran tushiradi, ba’zan esa fasad chizig‘ini chetlab, hovli orqali. Montaj maydoni kamroq kerak bo‘ladi, ish fronti qisqaradi, ko‘cha kamroq to‘siladi.",
          "Joylashtirish deyarli har doim yer osti — parking, hovli yoki o‘tish yo‘li tagida, lyuklar qoplama sathida. Korpus yaxlit, yig‘ma choksiz, qattiqlik halqalari bilan; grunt yuklari va suzib chiqishga hisobni mahsulot bilan beramiz, u loyihachiga ham boradi. Sizot suvlari yuqori bo‘lsa yoki ustidan transport yursa, ankerlash va plita qo‘shamiz — bu joyida emas, hisobda hal qilinadi.",
          "Alohida masala — hid va shovqin. Qurilma ko‘pincha terrasa, xona derazasi yoki dam olish zonasidan bir necha metr narida bo‘ladi. Korpus germetik, so‘rg‘ich mehmon zonasi sathidan yuqoriga vertikal chiqariladi, havo purkagich shovqindan himoya qobig‘iga yoki texnik xonaga qo‘yiladi. Bu komponovka bosqichida hisobga olinadi: keyin ko‘chirish darhol joy tanlashdan qimmatroq.",
        ],
      },
      {
        title: "Samarqandga yetkazish, montaj va xizmat",
        text: [
          "Toshkentdagi ishlab chiqarishdan Samarqandgacha trassa bo‘ylab ≈300 km, avtotransportda olib boramiz — odatda yo‘lda bir kun. Gabaritli korpuslarni ruxsat etilgan o‘lchamlarga qarab rejalashtiramiz, tushirishni oldindan kelishamiz: tarixiy qismda texnika kirish vaqti ko‘pincha cheklangan.",
          "Montaj va ishga tushirishni bizning sayyor brigadamiz bajaradi: korpusni o‘rnatish, obvyazka, elektrika, ishga tushirish va ko‘rsatkichlarga chiqarish. Xizmat uzellari — nasoslar, havo purkagichlar, KIP — sotib olinadigan va standart, markalarini tijorat taklifida ochiq yozamiz; ular Toshkentdagi omborda turadi, shuning uchun almashtirish chetdan yetkazishni kutishni talab qilmaydi.",
          "Hisobni KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha yuritamiz. Hisob ochiq: uni mahsulot pasporti, o‘rnatish sxemalari va xizmat reglamenti bilan birga loyihachiga va ekspertizaga berish mumkin. Narxni e’lon qilmaymiz — u sarf, keluvchi kollektor chuqurligi va komplektatsiyaga bog‘liq; obyekt ma’lumotlarini yuboring, tanlov va tijorat taklifini qaytaramiz.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Samarqandning tipik vazifalari — suhbatni boshlash uchun modellar. Aniq tanlov — obyekt ma’lumotlari bo‘yicha.",
    picks: [
      { slug: "bio-5", when: "Mehmon uyi, ~25 kishi" },
      { slug: "bio-15", when: "Mehmonxona, ~75 o‘rin" },
      { slug: "zhir-2", when: "Kafe, choyxona" },
      { slug: "zhir-8", when: "Restoran, oshxona" },
      { slug: "nef-6", when: "Avtoyuvish, parking" },
      { slug: "rez-20", when: "Suv zaxirasi, to‘plagich" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Samarqandga Toshkentdan olib kelasizmi?",
        a: "Ha. Ishlab chiqarish Toshkentda, Samarqandgacha ≈300 km, yetkazish avtotransportda — odatda yo‘lda bir kun. Montaj va ishga tushirishni chetdagi pudratchi emas, bizning sayyor brigadamiz bajaradi.",
      },
      {
        q: "Texnika kirmaydigan tarixiy markazda qanday o‘rnatasiz?",
        a: "Korpus materiali hisobiga. Shishatolali plastik bir xil hajmdagi betondan bir necha barobar yengil, shuning uchun korpusni kichik quvvatli kran tushiradi va kamroq montaj maydoni kerak bo‘ladi. Chiqishdan oldin o‘tish yo‘li kengligi, kran turadigan joy va strela uzunligini aniqlaymiz — komponovkani kirish sharoitiga moslaymiz.",
      },
      {
        q: "Mehmon zonasi yoki terrasa yonida hid bo‘ladimi?",
        a: "Korpus germetik, ventilyatsiya mehmon zonasi sathidan yuqoriga vertikal chiqariladi, lyuklar zichlagichli. Havo purkagichni shovqindan himoya qobig‘iga yoki texnik xonaga qo‘yamiz. O‘rnatish joyi va so‘rg‘ich trassasini komponovka bosqichida kelishamiz.",
      },
      {
        q: "Mehmonxonaga nima, choyxonaga nima kerak?",
        a: "Mehmonxona va mehmon uyiga o‘rinlar soni, kir yuvish va oshxona borligi bo‘yicha tanlangan biologik tozalash kerak. Choyxona va restoranga avvalo yuvish joylari va idish yuvish mashinalari sarfi bo‘yicha tanlangan yog‘ tutgich kerak; shahar kanalizatsiyasi bo‘lmasa, u biologik bosqich oldiga qo‘yiladi.",
      },
      {
        q: "Loyihachi qanday hujjatlarni oladi?",
        a: "KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha texnologik hisob, mahsulot pasporti, o‘rnatish va ulash sxemalari, korpusning grunt yuklari va suzib chiqishga hisobi, ekspluatatsiya qo‘llanmasi va xizmat reglamenti. Bu to‘plam ekspertizaga berishga yaroqli.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Obyektni tasvirlab bering —\nhisob va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, o‘rinlar soni yoki sarf, oqava qayerga ketadi, kirish sharoiti. Model tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent, yetkazish — Samarqand.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Ishlab chiqarish va montaj geografiyasi",
      links: [
        { href: "/solutions/tashkent", label: "Toshkent" },
        { href: "/solutions/bukhara", label: "Buxoro" },
        { href: "/solutions/fergana", label: "Farg‘ona" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoiy" },
      ],
    },
  },

  en: {
    label: "SAMARKAND AND SAMARKAND REGION",
    title: "Wastewater treatment\nplants in Samarkand.",
    intro:
      "We manufacture in Tashkent and deliver to Samarkand: filament-wound fiberglass tanks, calculation to KMK codes, installation and commissioning by our own crews. Hotels and guest houses, restaurants and tea houses, food production, and sites with no central sewerage.",
    sections: [
      {
        title: "Typical sites in Samarkand",
        text: [
          "Tourist accommodation first. A ten-room guest house and a hundred-bed hotel differ in flow and in pattern: occupancy swings with the season, flow nearly stops at night and peaks in the morning. Biological treatment copes if the aeration volume and sludge return are sized for real peaks, not for an average day — so we ask for bed count, laundry, kitchen and pool, not floor area.",
          "Then catering: restaurants, tea houses, cafes and hotel kitchens. A grease trap is required ahead of biological treatment, sized by the peak flow from sinks and dishwashers rather than by dining-room area.",
          "Third: food production and sites outside the city network — mahallas, roadside complexes, recreation bases. There the discharge point (ground, soakaway or irrigation) sets the required treatment class.",
        ],
      },
      {
        title: "Access and the historic centre",
        text: [
          "Access is the real constraint in old Samarkand: narrow streets, closed courtyards, limits on crane weight and boom reach. A fiberglass tank weighs several times less than a concrete one of the same volume, so it can be lowered by a small crane and needs a smaller working area — the street is blocked for less time.",
          "Installation is almost always underground: under a car park, courtyard or driveway, with covers flush to the surface. The shell is monolithic with stiffening rings; the soil-load and buoyancy calculation is supplied with the unit and goes to your designer. High groundwater or traffic above means anchoring and a base slab — decided by calculation, not on site.",
          "Odour and noise matter when the plant sits metres from a terrace or a guest room. The tank is sealed, the vent is taken vertically above the guest area, and the blower goes into an acoustic enclosure or a plant room. This is fixed at the layout stage.",
        ],
      },
      {
        title: "Delivery, installation, service",
        text: [
          "Tashkent to Samarkand is ≈300 km by road, delivered by truck — usually one day in transit. Oversize tanks are planned to permitted dimensions and unloading is agreed in advance, since access windows in the historic centre are often restricted.",
          "Installation and commissioning are done by our own travelling crew: setting the tank, piping, electrics, start-up and bringing the plant to its design figures. Wear items — pumps, blowers, instruments — are bought-in standard units, brands stated openly in the quotation and stocked in Tashkent.",
          "Calculation follows KMK 2.04.03-19 and KMK 2.04.01-98. It is open and can be handed to a designer or to state review together with the product passport, installation drawings and maintenance schedule. Prices are not published — send your site data and we return a selection and a quotation.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical Samarkand tasks and the models to start from. Exact selection is based on site data.",
    picks: [
      { slug: "bio-5", when: "Guest house, ~25 users" },
      { slug: "bio-15", when: "Hotel, ~75 beds" },
      { slug: "zhir-2", when: "Cafe, tea house" },
      { slug: "zhir-8", when: "Restaurant, canteen" },
      { slug: "nef-6", when: "Car wash, parking" },
      { slug: "rez-20", when: "Water storage" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do you ship to Samarkand from Tashkent?",
        a: "Yes. Manufacturing is in Tashkent, ≈300 km away, delivered by truck — usually one day in transit. Installation and commissioning are done by our own crew.",
      },
      {
        q: "How do you install where heavy equipment cannot reach?",
        a: "The tank material makes it possible. Fiberglass weighs several times less than concrete of the same volume, so a small crane can lower it and less working area is needed. Before the trip we check street width, crane standing point and boom reach, and adapt the layout.",
      },
      {
        q: "Will it smell near a terrace or guest rooms?",
        a: "The tank is sealed, the vent is taken vertically above the guest area and covers are gasketed. The blower goes into an acoustic enclosure or a plant room. Location and vent routing are agreed at the layout stage.",
      },
      {
        q: "What does a hotel need, and what does a tea house need?",
        a: "A hotel or guest house needs biological treatment sized by bed count, laundry and kitchen. A tea house or restaurant needs a grease trap sized by sink and dishwasher flow; with no city sewer it goes ahead of the biological stage.",
      },
      {
        q: "What documents does the designer get?",
        a: "Process calculation to KMK 2.04.03-19 and KMK 2.04.01-98, product passport, installation and connection drawings, soil-load and buoyancy calculation, operation manual and maintenance schedule.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Describe your site —\nget a selection and a price.",
    ctaText:
      "Facility type, beds or flow, discharge point, access conditions. We return a model selection, specifications and a quotation. Manufactured in Tashkent, delivered to Samarkand.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Where we deliver and install",
      links: [
        { href: "/solutions/tashkent", label: "Tashkent" },
        { href: "/solutions/bukhara", label: "Bukhara" },
        { href: "/solutions/fergana", label: "Fergana" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoi" },
      ],
    },
  },

  zh: {
    label: "撒马尔罕及撒马尔罕州",
    title: "撒马尔罕\n污水处理设备。",
    intro:
      "我们在塔什干生产、供货至撒马尔罕：自有缠绕玻璃钢罐体，按 KMK 标准计算，安装与调试由自有队伍完成。适用于酒店与民宿、餐厅与茶馆、食品加工，以及无市政管网的对象。",
    sections: [
      {
        title: "撒马尔罕的典型对象",
        text: [
          "首先是旅游住宿。十间客房的民宿与百余床位的酒店，流量和规律都不同：入住率随季节波动，夜间几乎无水，清晨出现高峰。只有按实际峰值而非日均值确定曝气容积与污泥回流，生物处理才稳定。因此我们询问床位数、有无洗衣房、厨房和泳池，而不是面积。",
          "其次是餐饮：餐厅、茶馆、咖啡馆及酒店厨房。生物处理前必须设隔油器，否则油脂进入管网与曝气池，处理失效。隔油器按水槽和洗碗机的峰值流量选型，而非按餐厅面积。",
          "第三是食品加工和市政管网以外的对象：马哈拉社区、公路服务区、休闲基地。排放去向（地面、渗井或灌溉）决定所需处理等级。",
        ],
      },
      {
        title: "历史城区的施工条件",
        text: [
          "老城区的主要限制是通行：街道狭窄、院落封闭、吊车吨位与臂展受限，重型混凝土井根本进不去。同容积玻璃钢罐体比混凝土轻数倍，可用小吨位吊车吊装，所需作业面更小，占道时间更短。",
          "布置基本为地埋：位于停车场、庭院或通道下方，井盖与地面齐平。罐体整体成型、带加强环，随货提供土压与抗浮计算书，可直接交设计方。地下水位高或上方过车时增加锚固与底板——由计算确定，而非现场决定。",
          "气味与噪声同样重要：设备常距露台或客房仅数米。罐体密封，排气立管引至客区上方，风机置于隔声罩或设备间。这些在布置阶段即确定。",
        ],
      },
      {
        title: "运输、安装与服务",
        text: [
          "塔什干至撒马尔罕公路约 ≈300 公里，汽车运输，通常在途一天。超限罐体按允许尺寸安排，卸货提前协调——老城区进场时间常受限制。",
          "安装与调试由我方外派队伍完成：就位、管路、电气、启动并达标。泵、风机、仪表等易损件为标准外购件，品牌在报价中公开注明，塔什干有库存。",
          "计算依据 KMK 2.04.03-19 与 KMK 2.04.01-98，计算书公开，可连同产品合格证、安装图与维护规程一并提交设计方与审查机构。价格不公开——取决于流量、管道埋深与配置，请提供对象数据，我们回复选型与报价。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "撒马尔罕的典型任务与推荐起点型号。精确选型依据对象数据。",
    picks: [
      { slug: "bio-5", when: "民宿，约25人" },
      { slug: "bio-15", when: "酒店，约75床位" },
      { slug: "zhir-2", when: "咖啡馆、茶馆" },
      { slug: "zhir-8", when: "餐厅、食堂" },
      { slug: "nef-6", when: "洗车场、停车场" },
      { slug: "rez-20", when: "储水罐" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "从塔什干发货到撒马尔罕吗？",
        a: "是。生产在塔什干，距撒马尔罕约 ≈300 公里，汽车运输，通常在途一天。安装与调试由我方自有队伍完成。",
      },
      {
        q: "大型设备进不去的老城区怎么安装？",
        a: "靠罐体材料。同容积玻璃钢比混凝土轻数倍，小吨位吊车即可吊装，所需作业面更小。出发前确认街道宽度、吊车站位与臂展，并据此调整布置。",
      },
      {
        q: "靠近露台或客房会有气味吗？",
        a: "罐体密封，排气立管引至客区上方，井盖带密封垫；风机置于隔声罩或设备间。安装位置与排气走向在布置阶段确定。",
      },
      {
        q: "酒店和茶馆分别需要什么？",
        a: "酒店和民宿需要按床位数、洗衣房和厨房选型的生物处理设备。茶馆和餐厅首先需要按水槽与洗碗机流量选型的隔油器；无市政管网时置于生物处理段之前。",
      },
      {
        q: "设计方能拿到哪些文件？",
        a: "按 KMK 2.04.03-19 与 KMK 2.04.01-98 的工艺计算书、产品合格证、安装与接管图、土压与抗浮计算、运行手册与维护规程。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "描述您的对象——\n我们回复选型与价格。",
    ctaText:
      "对象类型、床位数或流量、排放去向、进场条件。我们回复选型、参数与报价。塔什干生产，供货撒马尔罕。",
    ctaButton: "获取报价",
    related: {
      title: "供货与安装地区",
      links: [
        { href: "/solutions/tashkent", label: "塔什干" },
        { href: "/solutions/bukhara", label: "布哈拉" },
        { href: "/solutions/fergana", label: "费尔干纳" },
        { href: "/solutions/namangan", label: "纳曼干" },
        { href: "/solutions/navoi", label: "纳沃伊" },
      ],
    },
  },
};

export default content;
