import type { LineContentSet } from "../lineTypes";

/**
 * Страница модельного ряда ПЕС-1,5 … ПЕС-50 под запросы «песколовка»,
 * «пескоотделитель», «песколовка купить», «песколовка для автомойки»,
 * «песколовка ливневая», «qum tutgich», «sand trap».
 *
 * Все цифры — из app/products/data.ts (line: "sand-traps").
 */

const content: LineContentSet = {
  ru: {
    label: "ПЕСКОЛОВКИ",
    title: "Песколовки ПЕС-1,5\nПЕС-50.",
    intro:
      "Первая ступень механической очистки: задержание песка, абразива и тяжёлой минеральной взвеси до того, как они дойдут до нефтеуловителя, насосов и биологии. Расход от 1,5 до 50 л/с, корпус — стеклопластик собственной намотки, работа самотёком, без электричества и реагентов.",
    sections: [
      {
        title: "Зачем нужна песколовка и что будет без неё",
        text: [
          "Песок приходит на очистные раньше всего остального: с кузовов и колёс на автомойке, с грунтовых проездов и стройплощадок, с асфальта после дождя. Это тяжёлая минеральная взвесь — абразивная и нерастворимая. Осадить её несложно, но если не сделать этого в первой камере, она осядет там, где её никто не ждёт.",
          "Без песколовки песок уходит в нефтеуловитель и садится в коалесцентных и ламельных блоках — их приходится вынимать и промывать вместо расчётной чистки. Дальше он ложится в лотках и трубах, сокращая живое сечение, накапливается в приямке насосной и абразивно съедает рабочие колёса и уплотнения насосов. На биологической ступени минеральный осадок просто вытесняет рабочий объём.",
          "Поэтому песколовка — это первая ступень механической очистки, а не дополнительная опция. Приёмная камера гасит скорость потока, песок падает в шламовую зону, осветлённая вода уходит через полупогружную перегородку. Недорогой узел, который защищает дорогие.",
        ],
      },
      {
        title: "Как подбирается песколовка",
        text: [
          "Подбор идёт по секундному расходу, а не по суточному объёму: песколовка работает на пике, а не на среднем. Цифра в марке — номинальный расход в литрах в секунду, от ПЕС-1,5 до ПЕС-50, то есть от 5,4 до 180 м³/ч.",
          "Второй параметр — крупность частиц, которые нужно задержать. Здесь связаны гидравлическая крупность, площадь зеркала и время пребывания. Ряд рассчитан на нагрузку по зеркалу не более 25 м/ч; фактически по ряду она 6,4–10,8 м/ч при площади зеркала 0,84–16,7 м² и времени пребывания 3,3–5,6 минуты. При такой нагрузке задерживается кварцевая частица от 0,10 мм со скоростью осаждения 6,9 мм/с, тогда как КМК требует 0,20–0,25 мм — запас двукратный.",
          "Откуда берётся сам расход: для ливневой канализации — от площади водосбора, коэффициента стока и расчётного дождя; для автомойки — от числа постов; для площадки или паркинга — от площади покрытия. И почти всегда решает не гидравлика, а геодезия: отметка подводящего лотка и отметка выпуска задают глубину заложения и показывают, встанет аппарат самотёком или после него нужна насосная станция. Эти данные лучше присылать сразу.",
        ],
      },
      {
        title: "Конструкция, монтаж и обслуживание",
        text: [
          "Корпус — стеклопластик собственной намотки с кольцами жёсткости, толщина ламината по ряду 6–9 мм. Масса изделия от 80 до 1095 кг: даже крупный корпус ставится обычным автокраном. Стеклопластик не корродирует от песка с солью и не требует гидроизоляции. Патрубки DN110–DN500, горловины с люками — от одной до четырёх по типоразмеру.",
          "Осадок копится в конусной части — шламовой зоне объёмом от 0,45 до 15 м³, примерно 300 литров на каждый литр в секунду расхода. Обслуживание сводится к периодической откачке илососом через люк. Регламент и паспорт идут с изделием.",
          "Два расчёта, которые нельзя пропускать при монтаже. Первый — на всплытие: пустой корпус при высоком уровне грунтовых вод выталкивает наверх, нужны анкерная плита и расчёт пригруза. Второй — на нагрузку, если песколовка попадает под проезд: над корпусом делается разгрузочная плита, а люки берутся в соответствующем классе нагрузки. Оба расчёта мы выдаём с изделием.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Чем песколовка отличается от отстойника?",
        a: "Задачей и временем. Песколовка задерживает тяжёлую минеральную взвесь за минуты — по ряду ПЕС время пребывания 3,3–5,6 минуты, этого хватает песку и не хватает лёгким примесям и нефтепродуктам, они уходят на следующую ступень. Отстойник рассчитан на осветление в целом и держит воду в разы дольше.",
      },
      {
        q: "Обязательно ли ставить песколовку перед нефтеуловителем?",
        a: "На стоках с песком — да. Нефтеуловитель разделяет воду и нефтепродукты, а минеральная взвесь садится в его коалесцентных блоках и отнимает объём шламовой части. На практике это внеплановые чистки и потеря показателей на выходе.",
      },
      {
        q: "Как часто откачивать песок?",
        a: "По факту заполнения шламовой зоны, а не по календарю: на автомойке с грунтовым подъездом чаще, на ливнёвке с чистого асфальта — реже. Объём шламовой зоны в ряду 0,45–15 м³, около 300 литров на литр в секунду расхода. Уровень осадка проверяется щупом через люк, откачка — илососом. Первые месяцы стоит замерять чаще, чтобы установить свой интервал.",
      },
      {
        q: "Можно ли ставить песколовку под проездом?",
        a: "Да, при соответствующей подготовке. Над корпусом устраивается разгрузочная железобетонная плита, чтобы нагрузка от колеса не передавалась на стеклопластик, а люки ставятся в нужном классе нагрузки. Условия установки задавайте заранее — от них зависят конструкция горловин и расчёт корпуса.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Технологический расчёт по КМК, паспорт изделия, схему установки, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания. Расчёт открытый — его можно показать проектировщику и экспертизе.",
      },
    ],
    ctaTitle: "Пришлите расход и отметки —\nвернём модель и цену.",
    ctaText:
      "Тип объекта, расход в л/с или площадь водосбора, отметки подводящего лотка и выпуска, уровень грунтовых вод, есть ли проезд над корпусом. Вернём подбор типоразмера, характеристики и коммерческое предложение. Производство — Ташкент.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/nefteulovitel", label: "Нефтеуловители" },
        { href: "/products/zhiroulovitel", label: "Жироуловители" },
        { href: "/solutions/car-wash", label: "Очистные для автомойки" },
        {
          href: "/solutions/gas-station",
          label: "Нефтеуловитель для АЗС и паркинга",
        },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "QUM TUTGICHLAR",
    title: "Qum tutgichlar ПЕС-1,5\nПЕС-50.",
    intro:
      "Mexanik tozalashning birinchi bosqichi: qum, abraziv va og‘ir mineral muallaq zarralar neft tutgich, nasoslar va biologiyaga yetib borgunicha ushlab qolinadi. Sarf 1,5 dan 50 l/s gacha, korpus — o‘z o‘ramimizdagi shishatolali plastik, ish o‘z oqimi bilan, elektr va reagentsiz.",
    sections: [
      {
        title: "Qum tutgich nima uchun kerak va usiz nima bo‘ladi",
        text: [
          "Qum tozalash inshootiga hammadan oldin keladi: avtoyuvishda kuzov va g‘ildiraklardan, tuproq yo‘llar va qurilish maydonchalaridan, yomg‘irdan keyin asfaltdan. Bu og‘ir mineral muallaq zarra — abraziv va erimaydi. Uni cho‘ktirish qiyin emas, lekin birinchi kamerada cho‘ktirilmasa, u hech kim kutmagan joyda o‘tiradi.",
          "Qum tutgichsiz qum neft tutgichga o‘tadi va uning koalessent hamda lamel bloklarida cho‘kadi — ularni chiqarib yuvishga to‘g‘ri keladi. Keyin u novlar va quvurlarda yotib, tirik kesimni kichraytiradi, nasos stansiyasi chuqurchasida to‘planadi va nasos g‘ildiraklari bilan zichlagichlarini abraziv tarzda yeydi. Biologik bosqichda mineral cho‘kma shunchaki ishchi hajmni siqib chiqaradi.",
          "Shuning uchun qum tutgich — qo‘shimcha opsiya emas, mexanik tozalashning birinchi bosqichi. Qabul kamerasi oqim tezligini so‘ndiradi, qum shlam zonasiga tushadi, tiniqlashgan suv yarim botiq to‘siq orqali chiqadi. Qimmat uzellarni himoya qiladigan arzon uzel.",
        ],
      },
      {
        title: "Qum tutgich qanday tanlanadi",
        text: [
          "Tanlov sutkalik hajm bo‘yicha emas, sekundlik sarf bo‘yicha boradi: qum tutgich o‘rtachada emas, cho‘qqida ishlaydi. Markadagi raqam — sekundiga litrdagi nominal sarf: ПЕС-1,5 dan ПЕС-50 gacha, ya’ni 5,4 dan 180 m³/soatgacha.",
          "Ikkinchi parametr — ushlanishi kerak bo‘lgan zarralar yirikligi. Bu yerda gidravlik yiriklik, yuza maydoni va turib qolish vaqti bog‘liq. Qator yuzaga 25 m/soatdan oshmaydigan yuklamaga hisoblangan; amalda qator bo‘yicha u 6,4–10,8 m/soat, yuza maydoni 0,84–16,7 m², turib qolish vaqti 3,3–5,6 daqiqa. Bunda cho‘kish tezligi 6,9 mm/s bo‘lgan 0,10 mm dan yirik kvars zarrasi ushlanadi, KMK esa 0,20–0,25 mm ni talab qiladi — zaxira ikki karra.",
          "Sarfning o‘zi qayerdan olinadi: yomg‘ir kanalizatsiyasi uchun — suv yig‘ish maydoni, oqim koeffitsiyenti va hisobiy yomg‘irdan; avtoyuvish uchun — postlar sonidan; maydoncha yoki parking uchun — qoplama maydonidan. Va ko‘pincha gidravlika emas, geodeziya hal qiladi: keluvchi nov belgisi va chiqish belgisi ko‘mish chuqurligini beradi hamda qurilma o‘z oqimi bilan turadimi yoki undan keyin nasos stansiyasi kerakmi — shuni ko‘rsatadi. Bu ma’lumotlarni darrov yuborgan ma’qul.",
        ],
      },
      {
        title: "Konstruksiya, montaj va xizmat ko‘rsatish",
        text: [
          "Korpus — qattiqlik halqalari bilan o‘z o‘ramimizdagi shishatolali plastik, laminat qalinligi qator bo‘yicha 6–9 mm. Mahsulot massasi 80 dan 1095 kg gacha: yirik korpus ham oddiy avtokran bilan o‘rnatiladi. Shishatolali plastik tuzli qumdan zanglamaydi va gidroizolyatsiya talab qilmaydi. Patrubkalar DN110–DN500, lyukli bo‘yinlar — o‘lchamiga qarab birdan to‘rttagacha.",
          "Cho‘kma konus qismda — hajmi 0,45 dan 15 m³ gacha bo‘lgan shlam zonasida to‘planadi, taxminan sarfning har bir litr/sekundiga 300 litr. Xizmat ko‘rsatish lyuk orqali ilsos bilan davriy so‘rib olishdan iborat. Reglament va pasport mahsulot bilan beriladi.",
          "Montajda o‘tkazib bo‘lmaydigan ikki hisob. Birinchisi — suzib chiqishga: sizot suvlari yuqori bo‘lganda bo‘sh korpus tepaga itariladi, ankerli plita va bosim hisobi kerak. Ikkinchisi — yuklamaga, agar qum tutgich yo‘l ostiga tushsa: korpus ustidan yuk taqsimlovchi plita quyiladi, lyuklar esa tegishli yuklama sinfida olinadi. Ikkala hisobni ham mahsulot bilan beramiz.",
        ],
      },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Qum tutgich cho‘ktirgichdan nimasi bilan farq qiladi?",
        a: "Vazifasi va vaqti bilan. Qum tutgich og‘ir mineral muallaq zarrani daqiqalarda ushlaydi — ПЕС qatorida turib qolish vaqti 3,3–5,6 daqiqa, bu qumga yetadi, yengil aralashmalar va neft mahsulotlariga yetmaydi, ular keyingi bosqichga o‘tadi. Cho‘ktirgich umumiy tiniqlashtirishga mo‘ljallangan va suvni ancha uzoq ushlab turadi.",
      },
      {
        q: "Neft tutgich oldiga qum tutgich qo‘yish shartmi?",
        a: "Qumli oqavada — ha. Neft tutgich suv bilan neft mahsulotlarini ajratadi, mineral muallaq zarra esa uning koalessent bloklarida cho‘kib, shlam qismi hajmini oladi. Amalda bu rejadan tashqari tozalashlar va chiqishdagi ko‘rsatkichlarning yo‘qolishi.",
      },
      {
        q: "Qumni qanchalik tez-tez so‘rib olish kerak?",
        a: "Kalendar bo‘yicha emas, shlam zonasining to‘lishiga qarab: tuproq yo‘lli avtoyuvishda tez-tez, toza asfaltdan yomg‘ir kanalizatsiyasida kamroq. Qator bo‘yicha shlam zonasi hajmi 0,45–15 m³, sarfning litr/sekundiga taxminan 300 litr. Cho‘kma sathi lyuk orqali shup bilan tekshiriladi, so‘rib olish — ilsos bilan. Dastlabki oylarda o‘z oralig‘ingizni aniqlash uchun tez-tez o‘lchang.",
      },
      {
        q: "Qum tutgichni yo‘l ostiga qo‘yish mumkinmi?",
        a: "Ha, tegishli tayyorgarlik bilan. Korpus ustidan temir-beton yuk taqsimlovchi plita quyiladi, toki g‘ildirak yuklamasi shishatolali plastikka tushmasin, lyuklar esa kerakli yuklama sinfida qo‘yiladi. O‘rnatish shartlarini oldindan bering — bo‘yinlar konstruksiyasi va korpus hisobi shunga bog‘liq.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "KMK bo‘yicha texnologik hisob, mahsulot pasporti, o‘rnatish sxemasi, korpusning grunt yuklari va suzib chiqishga hisobi, ekspluatatsiya qo‘llanmasi va xizmat reglamenti. Hisob ochiq — uni loyihachiga va ekspertizaga ko‘rsatish mumkin.",
      },
    ],
    ctaTitle: "Sarf va belgilarni yuboring —\nmodel va narxni qaytaramiz.",
    ctaText:
      "Obyekt turi, l/s dagi sarf yoki suv yig‘ish maydoni, keluvchi nov va chiqish belgilari, sizot suvlari sathi, korpus ustida yo‘l bor-yo‘qligi. O‘lcham tanlovi, xususiyatlar va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/nefteulovitel", label: "Neft tutgichlar" },
        { href: "/products/zhiroulovitel", label: "Yog‘ tutgichlar" },
        { href: "/solutions/car-wash", label: "Avtoyuvish uchun tozalash" },
        {
          href: "/solutions/gas-station",
          label: "ShAQSh uchun neft tutgich",
        },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "SAND TRAPS",
    title: "Sand traps ПЕС-1,5\nПЕС-50.",
    intro:
      "The first stage of mechanical treatment: sand, abrasives and heavy mineral solids are retained before they reach the oil separator, the pumps and the biology. Flow from 1.5 to 50 l/s, filament-wound fiberglass shell, gravity operation — no power, no chemicals.",
    sections: [
      {
        title: "Why a sand trap, and what happens without one",
        text: [
          "Sand reaches the plant before anything else: off bodywork and wheels at a car wash, from unpaved approaches and construction sites, off asphalt after rain. It is heavy, abrasive and insoluble.",
          "Without a sand trap it settles in the coalescing and lamella packs of the oil separator, fills channels and pipes, accumulates in the pump sump and grinds down impellers and seals. In the biological stage mineral sludge simply takes up working volume.",
          "So the sand trap is the first mechanical stage, not an accessory. The inlet chamber kills the velocity, sand drops into the sludge zone, and clarified water leaves through a semi-submerged baffle.",
        ],
      },
      {
        title: "How a sand trap is sized",
        text: [
          "Sizing is based on peak flow in litres per second, not on daily volume. The number in the code is the nominal flow: ПЕС-1,5 to ПЕС-50, that is 5.4 to 180 m³/h.",
          "The second input is the particle size to be retained, which links settling velocity, surface area and retention time. The range is designed for a surface load of no more than 25 m/h; across the range it is 6.4–10.8 m/h, with a surface area of 0.84–16.7 m² and a retention time of 3.3–5.6 minutes. That retains a quartz particle from 0.10 mm, settling at 6.9 mm/s, against the 0.20–0.25 mm required by KMK — a twofold margin.",
          "The flow itself comes from the catchment area and design rainfall for storm drainage, from the number of bays for a car wash, from the paved area for a yard or parking. Invert levels of the inlet and the outlet decide burial depth and whether a pumping station is needed after the unit — send them with the enquiry.",
        ],
      },
      {
        title: "Construction and maintenance",
        text: [
          "Filament-wound fiberglass shell with stiffening rings, laminate 6–9 mm across the range, unit mass 80 to 1095 kg. No corrosion from salted sand, no waterproofing needed. Connections DN110–DN500, one to four manhole necks depending on size.",
          "Sludge collects in the conical sludge zone: 0.45 to 15 m³, roughly 300 litres per litre per second of flow. Maintenance is periodic vacuum-truck removal through the manhole; the schedule and the passport come with the unit.",
          "Two calculations must not be skipped: buoyancy, since an empty shell lifts under high groundwater and needs an anchor slab, and traffic loading, when the unit sits under a driveway and needs a load-distributing slab and covers of the right load class. We supply both with the unit.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How is a sand trap different from a settling tank?",
        a: "By purpose and by time. A sand trap retains heavy mineral solids in minutes — 3.3 to 5.6 minutes across the ПЕС range, enough for sand but not for light solids and oil, which go on to the next stage. A settling tank is designed for general clarification and holds water far longer.",
      },
      {
        q: "Must a sand trap go ahead of the oil separator?",
        a: "On effluent carrying sand, yes. The separator splits water and oil, while mineral solids settle in its coalescing packs and eat into the sludge volume — in practice, unplanned cleaning and lost outlet quality.",
      },
      {
        q: "How often is the sand pumped out?",
        a: "By actual filling of the sludge zone, not by calendar. The sludge zone is 0.45 to 15 m³ across the range, about 300 litres per litre per second of flow. Check the sludge level with a dipstick through the manhole; measure more often in the first months to establish your own interval.",
      },
      {
        q: "Can it be installed under a driveway?",
        a: "Yes, with the right preparation: a reinforced concrete load-distributing slab above the shell so that wheel loads are not transferred to the fiberglass, and covers of the required load class. State the installation conditions in advance — neck design and shell calculation depend on them.",
      },
      {
        q: "What documents do you provide?",
        a: "Process calculation to KMK, product passport, installation drawing, soil load and buoyancy calculation, operation manual and maintenance schedule. The calculation is open and can be shown to your designer.",
      },
    ],
    ctaTitle: "Send the flow and levels —\nget a model and a price.",
    ctaText:
      "Facility type, flow in l/s or catchment area, inlet and outlet invert levels, groundwater level, traffic above the unit. We return a size selection, specifications and a quotation. Manufactured in Tashkent.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/nefteulovitel", label: "Oil separators" },
        { href: "/products/zhiroulovitel", label: "Grease traps" },
        { href: "/solutions/car-wash", label: "Car wash water treatment" },
        {
          href: "/solutions/gas-station",
          label: "Oil separator for a filling station",
        },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "沉砂池",
    title: "沉砂池 ПЕС-1,5\nПЕС-50。",
    intro:
      "机械处理的第一级：在砂粒、磨料和重质无机悬浮物到达除油器、水泵和生化段之前将其拦截。流量 1,5–50 l/s，缠绕玻璃钢壳体，重力自流运行，无需电力与药剂。",
    sections: [
      {
        title: "为什么需要沉砂池",
        text: [
          "砂粒比其他污染物更早到达处理设施：来自洗车场的车身与轮胎、土路与施工场地、雨后的路面。它重、磨蚀性强且不溶解。",
          "没有沉砂池，砂粒会沉积在除油器的斜板和聚结模块中，淤积在管渠内，堆积在泵坑里，磨损叶轮与机械密封；在生化段则直接占用有效容积。",
          "因此沉砂池是机械处理的第一级，而不是可选附件：进水室消能，砂粒落入集泥区，澄清水经半潜式隔板流出。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "按秒流量选型，而不是按日水量。型号中的数字即公称流量：ПЕС-1,5 至 ПЕС-50，即 5,4–180 m³/h。",
          "第二个依据是需拦截的颗粒粒径，涉及沉降速度、表面积与停留时间。系列按不超过 25 m/h 的表面负荷设计；实际为 6,4–10,8 m/h，表面积 0,84–16,7 m²，停留时间 3,3–5,6 分钟。据此可拦截 0,10 mm 以上的石英颗粒（沉降速度 6,9 mm/s），而 KMK 规范要求 0,20–0,25 mm，裕度两倍。",
          "流量本身：雨水管网按汇水面积与设计降雨确定，洗车场按工位数量，场地或停车场按铺装面积。进水与出水标高决定埋深，也决定其后是否需要提升泵站——询价时请一并提供。",
        ],
      },
      {
        title: "结构与维护",
        text: [
          "带加强环的缠绕玻璃钢壳体，层压厚度 6–9 mm，整机重量 80–1095 kg。在含盐砂环境中不腐蚀，无需做防水层。接口 DN110–DN500，检修井颈 1–4 个，视规格而定。",
          "污泥积存于锥形集泥区：0,45–15 m³，约相当于每 1 l/s 流量 300 升。维护即通过检修口用吸污车定期清掏；随货提供维护规程与产品合格证。",
          "两项计算不可省略：抗浮（地下水位高时空罐会上浮，需锚固底板）与荷载（位于车行道下时需设置荷载分布板并选用相应荷载等级的井盖）。两项计算随设备提供。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "沉砂池与沉淀池有什么区别？",
        a: "目的与时间不同。沉砂池在数分钟内拦截重质无机颗粒——ПЕС 系列停留时间 3,3–5,6 分钟，足够沉砂，但不足以分离轻质杂质与油类，后者进入下一级。沉淀池用于整体澄清，停留时间长得多。",
      },
      {
        q: "除油器前面必须设沉砂池吗？",
        a: "含砂污水必须设。除油器分离水与油，而无机颗粒会沉积在聚结模块中并占用集泥容积，实际结果是频繁的计划外清掏和出水指标下降。",
      },
      {
        q: "多久清掏一次砂？",
        a: "按集泥区实际充满程度，而非按日历。系列集泥区容积 0,45–15 m³，约每 1 l/s 流量 300 升。通过检修口用测杆检查泥位，用吸污车清掏；投运头几个月应加密测量以确定自身周期。",
      },
      {
        q: "可以设在车行道下面吗？",
        a: "可以，但需相应处理：壳体上方设钢筋混凝土荷载分布板，使轮压不传至玻璃钢；井盖按所需荷载等级选用。安装条件请提前告知——井颈构造与壳体计算取决于此。",
      },
      {
        q: "提供哪些文件？",
        a: "KMK 工艺计算书、产品合格证、安装图、土压与抗浮计算、运行手册与维护规程。计算书公开，可提交设计单位与审查机构。",
      },
    ],
    ctaTitle: "提供流量与标高——\n我们回复型号与价格。",
    ctaText:
      "对象类型、l/s 流量或汇水面积、进出水标高、地下水位、罐体上方是否行车。我们回复规格选型、参数与报价。塔什干生产。",
    ctaButton: "获取报价",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/nefteulovitel", label: "油水分离器" },
        { href: "/products/zhiroulovitel", label: "隔油器" },
        { href: "/solutions/car-wash", label: "洗车场水处理" },
        { href: "/solutions/gas-station", label: "加油站除油器" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
