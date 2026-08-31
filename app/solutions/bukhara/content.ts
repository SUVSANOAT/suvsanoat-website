import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Бухара», «ЛОС Бухара»,
 * «жироуловитель Бухара», «tozalash inshootlari Buxoro».
 * Городская специфика: гостиничный и ресторанный сектор, объекты вне
 * централизованной канализации, высокие и минерализованные грунтовые
 * воды, возврат очищенной воды на полив.
 */

const content: SolutionContentSet = {
  ru: {
    label: "БУХАРА И БУХАРСКАЯ ОБЛАСТЬ",
    title: "Очистные сооружения\nв Бухаре.",
    intro:
      "Производим очистные сооружения в Ташкенте — корпуса из стеклопластика собственной намотки — и поставляем их в Бухару и область: гостиницам, гостевым домам, ресторанам, малым пищевым производствам и объектам вне зоны централизованной канализации. Расчёт по КМК, доставка автотранспортом, монтаж и пусконаладка нашими бригадами.",
    sections: [
      {
        title: "Какие объекты в Бухаре чаще всего требуют собственной очистки",
        text: [
          "Бухара — город гостиниц и гостевых домов, и это определяет профиль задач. Гостевой дом в исторической части, отель на подъезде к городу, ресторан во дворе — все дают стабильный бытовой сток с пиками по вечерам и в сезон, и далеко не везде есть куда его отдать. Плюс малые пищевые производства, где к стоку добавляется жир и взвесь, и посёлки области, где централизованной канализации нет вовсе.",
          "Для гостиницы или гостевого дома базовое решение — станция биологической очистки: усреднение, аэрационная зона, отстаивание; на выходе вода, которую можно сбрасывать или использовать повторно. Ресторану и кухне отеля нужен жироуловитель перед станцией: без него жир забивает трубы и убивает активный ил. Паркинг или мойка — нефтеуловитель на ливневом стоке.",
          "Подбор идёт от расхода. Для гостиницы это не число номеров, а число мест и фактическая загрузка: сезонный отель и круглогодичный объект с тем же номерным фондом дают разный сток. Поэтому мы спрашиваем число пользователей, режим работы и точку сброса.",
        ],
      },
      {
        title: "Грунтовые воды и засолённость: что это меняет в конструкции",
        text: [
          "Бухарский регион известен высоким уровнем грунтовых вод и их высокой минерализацией. Для подземного корпуса это два разных вопроса. Первый — всплытие: пустой или частично опорожнённый корпус в обводнённом грунте выталкивается вверх, поэтому мы считаем его на всплытие и при необходимости закладываем анкеровку к бетонной плите основания. Расчёт выдаём с изделием, его можно показать проектировщику.",
          "Второй вопрос — материал. Засолённая вода агрессивна: металлический корпус в таком грунте корродирует, обычный бетон разрушается сульфатами. Стеклопластик не корродирует и к сульфатам инертен — в этом смысле он для бухарских условий подходит лучше, чем сталь или неспециальный бетон. Корпус наматывается монолитом с кольцами жёсткости, у него нет швов, по которым обычно и начинается течь.",
          "Оговоримся честно: анкеровка не закладывается по умолчанию. Она зависит от фактического уровня грунтовых вод на площадке, отметки заложения и веса конструкции. Нужны данные объекта — уровень воды по изысканиям, отметки коллектора, тип грунта.",
        ],
      },
      {
        title: "Жаркий климат: очищенную воду разумно возвращать на полив",
        text: [
          "Климат в Бухаре сухой и жаркий, вода в дефиците, а у гостиницы или посёлка почти всегда есть территория, которую надо поливать. Сбрасывать очищенную воду в этих условиях расточительно. Поэтому в схему часто добавляют два элемента: обеззараживание — электролизная установка получения гипохлорита натрия на месте или ультрафиолет — и накопительный резервуар, из которого вода подаётся в поливную сеть по графику, а не в момент поступления стока.",
          "Здесь тоже нужна оговорка. Повторное использование возможно не всегда: всё упирается в требования к качеству воды для конкретного назначения полива. Мы не обещаем «полив из любого стока» — считаем схему под требуемые показатели и говорим прямо, достижимы ли они выбранной комплектацией или нужен узел доочистки.",
          "Организационная часть простая. От производства в Ташкенте до Бухары ≈580 км, возим автотранспортом. Монтаж и пусконаладку выполняет выездная бригада: обвязка, запуск, вывод на показатели, обучение персонала. Расчёт ведём по КМК 2.04.03-19 и КМК 2.04.01-98, покупные узлы — насосы, воздуходувки, КИП — указываем в предложении с марками открыто.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи Бухары и области — модели, с которых стоит начать разговор. Точный подбор — по данным объекта.",
    picks: [
      { slug: "bio-10", when: "Гостиница, ~50 мест" },
      { slug: "bio-25", when: "Гостиничный комплекс, посёлок" },
      { slug: "zhir-3", when: "Ресторан, кафе" },
      { slug: "nef-6", when: "Автомойка, паркинг" },
      { slug: "rez-30", when: "Накопитель поливной воды" },
      { slug: "elh-25", when: "Обеззараживание перед поливом" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Корпус не всплывёт при высоких грунтовых водах?",
        a: "Корпус считается на всплытие, и при необходимости закладывается крепление анкерами к бетонной плите основания. Нужно ли оно на вашем объекте — определяется по фактическому уровню грунтовых вод, отметке заложения и весу конструкции. Пришлите данные изысканий и отметки коллектора, расчёт выдадим с изделием.",
      },
      {
        q: "Выдержит ли корпус засолённые грунтовые воды?",
        a: "Стеклопластик не корродирует в засолённом грунте — в отличие от металла — и не разрушается сульфатами, в отличие от обычного бетона. Корпус монолитный, наматывается с кольцами жёсткости, швов, по которым начинается течь, у него нет.",
      },
      {
        q: "Можно ли использовать очищенную воду на полив территории?",
        a: "Часто да, и в жарком климате это разумно. В схему добавляются обеззараживание — электролизная установка гипохлорита натрия или УФ — и накопительный резервуар для подачи по графику. Решение зависит от требований к качеству воды для вашего назначения полива: считаем схему под эти показатели и прямо говорим, достижимы ли они.",
      },
      {
        q: "Вы производите в Бухаре или везёте из Ташкента?",
        a: "Производство находится в Ташкенте — там намотка стеклопластиковых корпусов, внутренние узлы и обвязка. До Бухары ≈580 км, везём автотранспортом. Монтаж и пусконаладку на объекте выполняет наша выездная бригада.",
      },
      {
        q: "Что нужно прислать, чтобы получить расчёт?",
        a: "Тип объекта, число пользователей или расход, режим работы, куда идёт сброс или планируется ли полив, отметки коллектора и данные по грунтовым водам. Считаем по КМК 2.04.03-19 и КМК 2.04.01-98 и возвращаем подбор модели с коммерческим предложением.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Опишите объект в Бухаре —\nвернём расчёт и цену.",
    ctaText:
      "Тип объекта, число мест или расход, куда сброс, уровень грунтовых вод. Вернём подбор модели, характеристики и коммерческое предложение. Производство — Ташкент, доставка и монтаж — в Бухару.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "География производства и монтажа",
      links: [
        { href: "/solutions/tashkent", label: "Ташкент" },
        { href: "/solutions/samarkand", label: "Самарканд" },
        { href: "/solutions/fergana", label: "Фергана" },
        { href: "/solutions/namangan", label: "Наманган" },
        { href: "/solutions/navoi", label: "Навои" },
      ],
    },
  },

  uz: {
    label: "BUXORO VA BUXORO VILOYATI",
    title: "Buxoroda tozalash\ninshootlari.",
    intro:
      "Tozalash inshootlarini Toshkentda ishlab chiqaramiz — korpuslar o‘z o‘ramimizdagi shishatolali plastikdan — va Buxoro hamda viloyatga yetkazamiz: mehmonxonalar, mehmon uylari, restoranlar, kichik oziq-ovqat ishlab chiqarishlari va markaziy kanalizatsiyasiz obyektlar uchun. Hisob KMK bo‘yicha, yetkazish avtotransportda, montaj va ishga tushirish — o‘z brigadalarimiz.",
    sections: [
      {
        title: "Buxoroda qanday obyektlar o‘z tozalashiga muhtoj",
        text: [
          "Buxoro — mehmonxonalar va mehmon uylari shahri, vazifalar profilini shu belgilaydi. Tarixiy qismdagi mehmon uyi, shahar chekkasidagi otel, hovlidagi restoran — barchasi kechqurunlari va mavsumda cho‘qqiga chiqadigan barqaror maishiy oqava beradi, uni topshiradigan joy esa hamma yerda ham yo‘q. Bunga kichik oziq-ovqat ishlab chiqarishlari qo‘shiladi, u yerda maishiy oqavaga yog‘ va muallaq moddalar qo‘shiladi, hamda markaziy kanalizatsiya umuman bo‘lmagan viloyat qishloqlari.",
          "Mehmonxona yoki mehmon uyi uchun asosiy yechim — biologik tozalash stansiyasi: oqava tenglashtirish, aeratsiya zonasi va tindirishdan o‘tadi, chiqishda esa oqizish yoki qayta foydalanishga yaroqli suv olinadi. Restoran va mehmonxona oshxonasiga stansiyadan oldin alohida yog‘ tutgich kerak: usiz yog‘ quvurlarni to‘sadi va faol loyni o‘ldiradi. Otel qoshidagi parking yoki avtoyuvishga — yomg‘ir oqavasi uchun neft tutgich.",
          "Tanlov doim sarfdan boshlanadi. Mehmonxona uchun bu «xonalar soni» emas, balki o‘rinlar soni va haqiqiy bandlik: mavsumiy otel va yil bo‘yi ishlaydigan obyekt bir xil xonalar fondida turlicha oqava beradi. Shuning uchun obyekt turidan tashqari foydalanuvchilar soni, ish rejimi va oqizish nuqtasini so‘raymiz.",
        ],
      },
      {
        title: "Sizot suvlari va sho‘rlanish: konstruksiyada nima o‘zgaradi",
        text: [
          "Buxoro hududi sizot suvlarining yuqori sathi va yuqori minerallashuvi bilan tanilgan. Yer osti korpusi uchun bu ikki xil masala. Birinchisi — suzib chiqish: suvli gruntda bo‘sh yoki qisman bo‘shatilgan korpus yuqoriga itariladi, shuning uchun uni suzib chiqishga hisoblaymiz va zarur bo‘lsa asosdagi beton plitaga ankerlar bilan mahkamlashni ko‘zda tutamiz. Hisobni mahsulot bilan beramiz, uni loyihachiga ko‘rsatish mumkin.",
          "Ikkinchi masala — material. Sho‘rlangan suv agressiv: bunday gruntda metall korpus zanglaydi, oddiy beton esa sulfatlardan yemiriladi. Shishatolali plastik zanglamaydi va sulfatlarga befarq — shu ma’noda u Buxoro sharoitiga po‘lat yoki oddiy betondan ko‘ra mosroq. Korpus qattiqlik halqalari bilan yaxlit o‘raladi, unda oqish boshlanadigan choklar yo‘q.",
          "Ochig‘ini aytamiz: ankerlash bo‘yicha qaror «ehtiyot uchun» yoki avtomatik tarzda qabul qilinmaydi. U maydondagi sizot suvlarining haqiqiy sathiga, ko‘mish belgisiga va konstruksiya og‘irligiga bog‘liq. Obyekt ma’lumotlari kerak — quduq yoki izlanishlar bo‘yicha suv sathi, kollektor belgilari, grunt turi. Ularsiz har qanday raqam taxmin bo‘ladi.",
        ],
      },
      {
        title: "Issiq iqlim: tozalangan suvni sug‘orishga qaytarish oqilona",
        text: [
          "Buxoroda iqlim quruq va issiq, suv taqchil, mehmonxona yoki qishloqda esa deyarli doim sug‘orish kerak bo‘lgan hudud bor. Bunday sharoitda tozalangan suvni oqizib yuborish isrofgarchilik. Shuning uchun sxemaga ko‘pincha ikkita element qo‘shiladi: zararsizlantirish — joyida natriy gipoxlorit oladigan elektroliz qurilmasi yoki ultrabinafsha nur — va to‘plagich rezervuar, undan suv oqava kelgan paytda emas, jadval bo‘yicha sug‘orish tarmog‘iga beriladi.",
          "Bu yerda ham izoh kerak. Qayta foydalanish har doim va har qanday ko‘rinishda mumkin emas: hammasi aniq sug‘orish maqsadi uchun suv sifatiga qo‘yiladigan talablarga va kelishuvlarga bog‘liq. Biz «har qanday oqavadan sug‘orish»ni va’da qilmaymiz — sxemani talab qilingan ko‘rsatkichlarga hisoblaymiz va ular tanlangan komplektatsiya bilan erishiladimi yoki qo‘shimcha tozalash uzeli kerakmi, to‘g‘ridan-to‘g‘ri aytamiz.",
          "Tashkiliy qismi oddiy. Toshkentdagi ishlab chiqarishimizdan Buxorogacha masofa ≈580 km, avtotransportda olib boramiz. Montaj va ishga tushirishni sayyor brigada bajaradi: obvyazka, ishga tushirish, ko‘rsatkichlarga chiqarish, obyekt xodimlarini o‘qitish. Texnologik hisobni KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha yuritamiz, sotib olinadigan uzellar — nasoslar, havo purkagichlar, KIP — markalari bilan taklifda ochiq ko‘rsatiladi.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Buxoro va viloyatning tipik vazifalari — suhbatni boshlash uchun modellar. Aniq tanlov — obyekt ma’lumotlari bo‘yicha.",
    picks: [
      { slug: "bio-10", when: "Mehmonxona, ~50 o‘rin" },
      { slug: "bio-25", when: "Mehmonxona majmuasi, qishloq" },
      { slug: "zhir-3", when: "Restoran, kafe" },
      { slug: "nef-6", when: "Avtoyuvish, parking" },
      { slug: "rez-30", when: "Sug‘orish suvi to‘plagichi" },
      { slug: "elh-25", when: "Sug‘orishdan oldin zararsizlantirish" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Sizot suvlari baland bo‘lsa korpus suzib chiqmaydimi?",
        a: "Korpus suzib chiqishga hisoblanadi va zarur bo‘lsa montaj sxemasiga asosdagi beton plitaga ankerlar bilan mahkamlash kiritiladi. Sizning obyektingizda u kerakmi — sizot suvlarining haqiqiy sathi, ko‘mish belgisi va konstruksiya og‘irligi bo‘yicha aniqlanadi. Izlanishlar ma’lumotlari va kollektor belgilarini yuboring — hisobni mahsulot bilan beramiz.",
      },
      {
        q: "Korpus sho‘rlangan sizot suvlariga chidaydimi?",
        a: "Shishatolali plastik sho‘rlangan gruntda zanglamaydi — metalldan farqli — va sulfatlardan yemirilmaydi, oddiy betondan farqli. Korpus yaxlit, qattiqlik halqalari bilan o‘raladi, oqish boshlanadigan choklari yo‘q.",
      },
      {
        q: "Tozalangan suvni hudud sug‘orishiga ishlatsa bo‘ladimi?",
        a: "Ko‘pincha ha, issiq iqlimda bu oqilona. Sxemaga zararsizlantirish — natriy gipoxlorit elektroliz qurilmasi yoki UB — va jadval bo‘yicha berish uchun to‘plagich rezervuar qo‘shiladi. Lekin qaror sizning sug‘orish maqsadingiz uchun suv sifatiga qo‘yiladigan talablarga bog‘liq: sxemani shu ko‘rsatkichlarga hisoblaymiz va erishish mumkinligini ochiq aytamiz.",
      },
      {
        q: "Buxoroda ishlab chiqarasizmi yoki Toshkentdan olib kelasizmi?",
        a: "Ishlab chiqarish Toshkentda — shishatolali korpuslar o‘rami, ichki uzellar va obvyazka o‘sha yerda. Buxorogacha ≈580 km, avtotransportda olib boramiz. Obyektda montaj va ishga tushirishni sayyor brigadamiz bajaradi.",
      },
      {
        q: "Hisob olish uchun nima yuborish kerak?",
        a: "Obyekt turi, foydalanuvchilar soni yoki sarf, ish rejimi, oqava qayerga ketadi yoki sug‘orish rejalashtirilganmi, keluvchi kollektor belgilari va sizot suvlari bo‘yicha ma’lumot. Shular bo‘yicha KMK 2.04.03-19 va KMK 2.04.01-98 asosida hisoblab, model tanlovi va tijorat taklifini qaytaramiz.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Buxorodagi obyektni tasvirlab bering —\nhisob va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, o‘rinlar soni yoki sarf, oqava qayerga ketadi, sizot suvlari sathi. Model tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent, yetkazish va montaj — Buxoroga.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Ishlab chiqarish va montaj geografiyasi",
      links: [
        { href: "/solutions/tashkent", label: "Toshkent" },
        { href: "/solutions/samarkand", label: "Samarqand" },
        { href: "/solutions/fergana", label: "Farg‘ona" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoiy" },
      ],
    },
  },

  en: {
    label: "BUKHARA AND BUKHARA REGION",
    title: "Wastewater treatment\nplants in Bukhara.",
    intro:
      "We manufacture in Tashkent — filament-wound fiberglass tanks — and deliver to Bukhara and the region: hotels and guesthouses, restaurants, small food producers and sites outside the central sewerage network. Design to KMK codes, road delivery, installation and commissioning by our own crews.",
    sections: [
      {
        title: "Which sites in Bukhara need their own treatment",
        text: [
          "Bukhara is a city of hotels and guesthouses, and that shapes the tasks. A guesthouse in the old town, a hotel on the approach road, a courtyard restaurant — all produce steady domestic wastewater with evening and seasonal peaks, and there is often nowhere to discharge it. Add small food producers, where grease and solids join the domestic flow, and settlements in the region with no central sewerage at all.",
          "For a hotel or guesthouse the base solution is a package biological plant: equalisation, aeration, settling. A restaurant or hotel kitchen also needs a grease trap upstream — without it grease clogs pipes and kills the activated sludge. A parking area or car wash calls for an oil separator on the storm line.",
          "Selection starts from flow. For a hotel that means beds and real occupancy, not the number of rooms: a seasonal hotel and a year-round site with the same room count produce different loads. So we ask for user numbers, operating pattern and discharge point, not just the building type.",
        ],
      },
      {
        title: "Groundwater and salinity: what changes in the design",
        text: [
          "The Bukhara region is known for a high groundwater table and highly mineralised groundwater. For a buried tank these are two separate issues. First, buoyancy: an empty or partly drained tank in saturated soil is pushed upward, so we run a buoyancy calculation and, where needed, specify anchoring to a concrete base slab. The calculation is supplied with the unit.",
          "Second, material. Saline water is aggressive: a steel tank corrodes in such ground, and ordinary concrete is attacked by sulphates. Fiberglass does not corrode and is inert to sulphates, which makes it a better fit here than steel or non-specialised concrete. The shell is wound as one piece with stiffening rings — no joints to leak.",
          "To be clear: anchoring is not specified by default. It depends on the actual groundwater level on site, the burial depth and the weight of the structure. We need site data — water level from a borehole or survey, collector elevations, soil type. Without them any figure would be a guess.",
        ],
      },
      {
        title: "Hot climate: treated water is better returned to irrigation",
        text: [
          "Bukhara is hot and dry, water is scarce, and a hotel or settlement almost always has grounds to irrigate. Discharging treated water here is wasteful. So the scheme often gains two elements: disinfection — an on-site sodium hypochlorite electrolysis unit or UV — and a storage tank that feeds the irrigation network on a schedule rather than as flow arrives.",
          "One honest caveat: reuse is not always possible in every form. It depends on the water quality required for the intended irrigation use and on approvals. We do not promise irrigation from any effluent — we size the scheme to the required figures and say plainly whether the chosen configuration reaches them or an extra polishing stage is needed.",
          "Logistics are simple. Bukhara is about 580 km from our Tashkent facility; we ship by road. A travelling crew handles installation and commissioning — piping, start-up, bringing the plant to spec, training site staff. Process calculations follow KMK 2.04.03-19 and KMK 2.04.01-98; bought-in items such as pumps, blowers and instruments are named openly in the quotation.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical tasks in Bukhara and the region — models to start the conversation. Exact selection is based on site data.",
    picks: [
      { slug: "bio-10", when: "Hotel, ~50 beds" },
      { slug: "bio-25", when: "Hotel complex, settlement" },
      { slug: "zhir-3", when: "Restaurant, cafe" },
      { slug: "nef-6", when: "Car wash, parking" },
      { slug: "rez-30", when: "Irrigation water storage" },
      { slug: "elh-25", when: "Disinfection before irrigation" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Will the tank float with a high groundwater table?",
        a: "The tank is checked for buoyancy and, where needed, anchored to a concrete base slab. Whether that applies on your site depends on the actual groundwater level, burial depth and the weight of the structure. Send survey data and collector elevations — the calculation comes with the unit.",
      },
      {
        q: "Will the shell survive saline groundwater?",
        a: "Fiberglass does not corrode in salt-laden soil, unlike steel, and is not attacked by sulphates, unlike ordinary concrete. The shell is monolithic with stiffening rings and has no joints to leak.",
      },
      {
        q: "Can treated water be used for irrigation?",
        a: "Often yes, and in this climate it makes sense. The scheme then includes disinfection — sodium hypochlorite electrolysis or UV — and a storage tank for scheduled supply. The decision depends on the water quality required for your irrigation use; we size the scheme to those figures and state plainly whether they are reachable.",
      },
      {
        q: "Do you manufacture in Bukhara or ship from Tashkent?",
        a: "Manufacturing is in Tashkent: fiberglass winding, internals and piping. Bukhara is about 580 km away and we ship by road. Installation and commissioning on site are done by our own travelling crew.",
      },
      {
        q: "What do you need to prepare a calculation?",
        a: "Facility type, user numbers or flow, operating pattern, discharge point or irrigation intent, inlet collector elevations and groundwater data. We calculate to KMK 2.04.03-19 and KMK 2.04.01-98 and return a model selection with a quotation.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Describe your site in Bukhara —\nget a selection and a price.",
    ctaText:
      "Facility type, beds or flow, discharge point, groundwater level. We return a model selection, specifications and a quotation. Manufactured in Tashkent, delivered and installed in Bukhara.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Where we deliver and install",
      links: [
        { href: "/solutions/tashkent", label: "Tashkent" },
        { href: "/solutions/samarkand", label: "Samarkand" },
        { href: "/solutions/fergana", label: "Fergana" },
        { href: "/solutions/namangan", label: "Namangan" },
        { href: "/solutions/navoi", label: "Navoi" },
      ],
    },
  },

  zh: {
    label: "布哈拉及布哈拉州",
    title: "布哈拉\n污水处理设备。",
    intro:
      "设备在塔什干自有工厂生产——缠绕成型玻璃钢罐体——供往布哈拉及全州：酒店与民宿、餐厅、小型食品加工厂，以及市政管网未覆盖的对象。按 KMK 标准计算，公路运输，安装调试由自有队伍完成。",
    sections: [
      {
        title: "布哈拉哪些对象需要自建处理设施",
        text: [
          "布哈拉是酒店与民宿之城，需求由此而来：老城民宿、城郊酒店、庭院餐厅，都会产生稳定的生活污水，晚间与旺季出现峰值，而排放去向往往并不存在。此外还有小型食品加工厂（生活污水中另加油脂与悬浮物）和完全没有市政管网的州内村镇。",
          "酒店与民宿的基础方案是一体化生物处理站：均质、曝气、沉淀。餐厅和酒店厨房在其前端还需隔油器——否则油脂堵管并破坏活性污泥。停车场或洗车位则在雨水线上加装油水分离器。",
          "选型从流量开始。对酒店而言是床位数与实际入住率，而非房间数：同样房量的季节性酒店与全年运营对象污水量并不相同。因此我们需要对象类型之外的使用人数、运行方式与排放去向。",
        ],
      },
      {
        title: "地下水与盐渍：结构上有何不同",
        text: [
          "布哈拉地区地下水位高、矿化度高。对地埋罐体这是两个问题。其一是抗浮：饱和土中空罐或半空罐会被顶起，因此我们做抗浮计算，必要时用锚栓固定到混凝土底板。计算书随设备提供。",
          "其二是材质。盐渍水具有侵蚀性：金属罐在此类土壤中锈蚀，普通混凝土受硫酸盐破坏。玻璃钢不腐蚀、对硫酸盐惰性，因此比钢材或普通混凝土更适合当地条件。罐体带加强环整体缠绕，无渗漏接缝。",
          "需要说明：是否锚固不按默认设置，取决于现场实际地下水位、埋深与结构自重。需要对象数据——钻孔或勘察水位、管道标高、土质。没有这些，任何数字都只是猜测。",
        ],
      },
      {
        title: "炎热气候：处理后的水宜回用于绿化灌溉",
        text: [
          "布哈拉干热缺水，酒店或村镇几乎都有需要浇灌的场地，直接排放并不划算。因此方案常增加两项：消毒——现场次氯酸钠电解装置或紫外——以及蓄水罐，使水按计划供入灌溉管网，而不是随来随用。",
          "但要如实说明：回用并非总能实现。取决于该灌溉用途对水质的要求以及审批。我们不承诺“任何污水都能浇地”，而是按所需指标核算方案，并明确告知既定配置能否达标、是否需要增加深度处理单元。",
          "组织安排简单：塔什干工厂到布哈拉约580公里，公路运输；安装调试由外派队伍完成——管路、启动、达标运行、现场人员培训。工艺计算依据 KMK 2.04.03-19 与 KMK 2.04.01-98；泵、风机、仪表等外购件在报价中公开注明品牌。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "布哈拉及州内的典型任务与推荐起点型号。精确选型依据对象数据。",
    picks: [
      { slug: "bio-10", when: "酒店，约50床位" },
      { slug: "bio-25", when: "酒店群、村镇" },
      { slug: "zhir-3", when: "餐厅、咖啡馆" },
      { slug: "nef-6", when: "洗车场、停车场" },
      { slug: "rez-30", when: "灌溉水蓄水罐" },
      { slug: "elh-25", when: "灌溉前消毒" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "地下水位高，罐体会不会上浮？",
        a: "罐体做抗浮计算，必要时用锚栓固定到混凝土底板。您的对象是否需要，取决于实际地下水位、埋深与结构自重。请提供勘察数据与管道标高，计算书随设备提供。",
      },
      {
        q: "罐体能承受盐渍地下水吗？",
        a: "玻璃钢在盐渍土中不腐蚀（不同于金属），也不受硫酸盐破坏（不同于普通混凝土）。罐体整体带加强环缠绕，无渗漏接缝。",
      },
      {
        q: "处理后的水能用于场地灌溉吗？",
        a: "多数情况可以，在此气候下也更合理。方案中增加消毒（次氯酸钠电解或紫外）与蓄水罐以按计划供水。是否可行取决于您灌溉用途的水质要求——我们按该指标核算并明确告知能否达标。",
      },
      {
        q: "在布哈拉生产还是从塔什干发运？",
        a: "生产在塔什干：玻璃钢缠绕、内部构件与管路。到布哈拉约580公里，公路运输。现场安装与调试由我们的外派队伍完成。",
      },
      {
        q: "获取计算需要提供什么？",
        a: "对象类型、人数或流量、运行方式、排放去向或是否计划灌溉、进水管标高与地下水数据。我们按 KMK 2.04.03-19 与 KMK 2.04.01-98 计算，回复选型与报价。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "描述您在布哈拉的对象——\n我们回复选型与价格。",
    ctaText:
      "对象类型、床位或流量、排放去向、地下水位。我们回复选型、参数与报价。塔什干生产，运至布哈拉并安装。",
    ctaButton: "获取报价",
    related: {
      title: "供货与安装地区",
      links: [
        { href: "/solutions/tashkent", label: "塔什干" },
        { href: "/solutions/samarkand", label: "撒马尔罕" },
        { href: "/solutions/fergana", label: "费尔干纳" },
        { href: "/solutions/namangan", label: "纳曼干" },
        { href: "/solutions/navoi", label: "纳沃伊" },
      ],
    },
  },
};

export default content;
