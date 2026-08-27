import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «септик для частного дома», «ЛОС для дома»,
 * «автономная канализация». Ведёт на линейку БИО.
 */

const content: SolutionContentSet = {
  ru: {
    label: "АВТОНОМНАЯ КАНАЛИЗАЦИЯ",
    title: "ЛОС для частного дома:\nчем это лучше септика.",
    intro:
      "Когда городской канализации нет, варианта три: выгребная яма, септик-отстойник или локальные очистные сооружения. Разбираем разницу честно — с цифрами, расходами на обслуживание и ограничениями каждого варианта.",
    sections: [
      {
        title: "Яма, септик, ЛОС — в чём разница",
        text: [
          "Выгребная яма ничего не очищает: это ёмкость, которую возит ассенизатор. При водоотведении семьи 0,8–1 м³ в сутки откачка нужна каждые несколько дней — за год это дороже любого очистного сооружения, а запах и фильтрация в грунт прилагаются бесплатно.",
          "Септик — проточный отстойник. Он задерживает взвесь и часть органики, но по БПК даёт лишь 30–40 % очистки: на выходе мутная вода с запахом, которую по нормам нельзя ни сбрасывать на рельеф, ни фильтровать в грунт вблизи скважин. Септик без полей фильтрации — это та же яма, только медленнее.",
          "ЛОС — биологическая очистка: микроорганизмы в аэротенке окисляют органику, ил отделяется и возвращается, наружу уходит очищенная вода. Наш ряд БИО рассчитан по нормам КМК на хозяйственно-бытовой сток: аэротенк на 13,5 часа пребывания, нитрификация, запас по осадку 96 суток — откачка примерно раз в квартал, а не раз в неделю.",
        ],
      },
      {
        title: "Как выбрать размер и что учесть на участке",
        text: [
          "Расход считается по числу постоянно проживающих: 200 литров на человека в сутки по КМК 2.04.03-19. Семья из пяти человек — это модель БИО-1; дом с гостями, прислугой и поливом двора — уже БИО-3. Брать «с запасом в два раза» не нужно: биология любит стабильную нагрузку, полупустой аэротенк работает хуже расчётного.",
          "На участке нужны три вещи: электричество 220 В для воздуходувки (0,25 кВт — как две лампочки), место под корпус в четырёх-пяти метрах от дома и понимание уровня грунтовых вод — при высокой воде корпус анкеруется к бетонной плите, расчёт анкеровки мы выдаём вместе с изделием.",
          "Если в доме есть кухня с интенсивной готовкой, перед ЛОС ставится жироуловитель — жир угнетает биологию. Для гостевых домов и кафе это обязательное условие, для обычной семейной кухни достаточно аккуратности.",
        ],
      },
    ],
    pickTitle: "Какая модель нужна вашему дому",
    pickText:
      "Расход принят 200 л на жителя в сутки по КМК 2.04.03-19. Считайте по постоянно проживающим; сезонные гости в пределах запаса ряда.",
    picks: [
      { slug: "bio-1", when: "Дом на одну семью, до 5 проживающих" },
      { slug: "bio-3", when: "Большой дом или два соседних, до 15" },
      { slug: "bio-5", when: "Гостевой дом, мини-кафе, до 25" },
      { slug: "bio-10", when: "Группа домов, до 50 жителей" },
      { slug: "bio-15", when: "Небольшая гостиница, до 75" },
      { slug: "bio-25", when: "Махалля, база отдыха, до 125" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Будет ли запах на участке?",
        a: "При правильно смонтированной вентиляции — нет. Аэробный процесс, в отличие от гниения в яме, не образует сероводород в заметных количествах; вытяжной стояк выводится выше кровли и работает на естественной тяге. Запах — почти всегда признак остановившейся воздуходувки или закрытой вентиляции.",
      },
      {
        q: "Что будет при отключении электричества?",
        a: "Несколько часов — ничего: ил переживает паузу спокойно. Сутки и больше — биология начинает гибнуть, и после включения установка выходит на режим до двух-трёх недель. Для посёлков с нестабильной сетью советуем розетку от генератора или бесперебойник: воздуходувке хватает 250 Вт.",
      },
      {
        q: "Как часто откачивать ил?",
        a: "Стабилизатор ила рассчитан на 96 суток накопления по всему ряду — на практике откачка ассенизатором раз в три-четыре месяца. Это единственная регулярная операция; сравните с ямой, которую возят каждую неделю.",
      },
      {
        q: "Можно ли сливать воду из стиральной машины и хлорку?",
        a: "Стиральная машина — да, обычные порошки биология переносит. Хлорсодержащие средства, растворители и краски — нет: залповый слив хлорки убивает активный ил. Правило простое: то, что убивает бактерии в унитазе, убивает их и в аэротенке.",
      },
      {
        q: "Куда девать очищенную воду?",
        a: "Варианты: фильтрующий колодец или траншея, накопитель для технических нужд, сброс в ливневую сеть по согласованию. Прямой полив огорода очищенным стоком нормами не допускается; полив декоративных посадок через накопитель — рабочая практика. Подскажем схему под ваш участок и уровень грунтовых вод.",
      },
    ],
    allTitle: "ВСЯ ЛИНЕЙКА",
    allButton: "СМОТРЕТЬ МОДЕЛИ БИО",
    allHref: "/products#bio-plants",
    ctaTitle: "Скажите, сколько человек\nживёт в доме.",
    ctaText:
      "Этого достаточно для подбора. Вернём модель, схему установки, требования к электрике и расчёт анкеровки под ваш уровень грунтовых вод.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
  },

  uz: {
    label: "AVTONOM KANALIZATSIYA",
    title: "Xususiy uy uchun LOI:\nnega bu septikdan yaxshi.",
    intro:
      "Shahar kanalizatsiyasi bo‘lmasa, uch variant bor: shiypon chuquri, septik-cho‘ktirgich yoki lokal tozalash inshootlari. Farqni raqamlar bilan halol ko‘rib chiqamiz.",
    sections: [
      {
        title: "Chuqur, septik, LOI — farqi nimada",
        text: [
          "Shiypon chuquri hech narsani tozalamaydi: bu assenizator tashiydigan idish. Oila sutkasiga 0,8–1 m³ suv chiqarsa, so‘rib olish har necha kunda kerak — yiliga bu har qanday tozalash inshootidan qimmat.",
          "Septik — oqib o‘tuvchi cho‘ktirgich. U muallaq zarralarni ushlaydi, lekin BPK bo‘yicha atigi 30–40 % tozalaydi: chiqishda hidli loyqa suv, uni me‘yorlar bo‘yicha relyefga tashlash ham, quduqlar yonida yerga singdirish ham mumkin emas.",
          "LOI — biologik tozalash: aerotenkdagi mikroorganizmlar organikani oksidlaydi, il ajralib qaytariladi, tashqariga tozalangan suv chiqadi. BIO qatorimiz KMK me‘yorlari bo‘yicha hisoblangan: aerotenkda 13,5 soat, nitrifikatsiya, il bo‘yicha 96 sutka zaxira — so‘rib olish haftada emas, kvartalda bir marta.",
        ],
      },
      {
        title: "O‘lchamni qanday tanlash va uchastkada nimani hisobga olish",
        text: [
          "Sarf doimiy yashovchilar soni bo‘yicha hisoblanadi: KMK 2.04.03-19 bo‘yicha kishi boshiga sutkasiga 200 litr. Besh kishilik oila — BIO-1; mehmonlar va hovli sug‘orishli katta uy — BIO-3. «Ikki barobar zaxira» olish kerak emas: yarim bo‘sh aerotenk hisobiy holatdan yomon ishlaydi.",
          "Uchastkada uch narsa kerak: havo puflagich uchun 220 V (0,25 kVt — ikkita lampochka kabi), uydan to‘rt-besh metrda korpus uchun joy va yer osti suvi sathini bilish — suv yuqori bo‘lsa, korpus beton plitaga ankerlashadi, hisobni mahsulot bilan beramiz.",
          "Uyda jadal oshpazlik bo‘lsa, LOI oldiga yog‘ tutgich qo‘yiladi — yog‘ biologiyani bo‘g‘adi.",
        ],
      },
    ],
    pickTitle: "Uyingizga qaysi model kerak",
    pickText:
      "Sarf KMK 2.04.03-19 bo‘yicha kishi boshiga sutkasiga 200 l qabul qilingan. Doimiy yashovchilar bo‘yicha hisoblang.",
    picks: [
      { slug: "bio-1", when: "Bir oilalik uy, 5 kishigacha" },
      { slug: "bio-3", when: "Katta uy yoki ikkita qo‘shni uy, 15 gacha" },
      { slug: "bio-5", when: "Mehmon uyi, mini-kafe, 25 gacha" },
      { slug: "bio-10", when: "Uylar guruhi, 50 kishigacha" },
      { slug: "bio-15", when: "Kichik mehmonxona, 75 gacha" },
      { slug: "bio-25", when: "Mahalla, dam olish maskani, 125 gacha" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Uchastkada hid bo‘ladimi?",
        a: "To‘g‘ri o‘rnatilgan ventilyatsiyada — yo‘q. Aerob jarayon chuqurdagi chirishdan farqli ravishda sezilarli vodorod sulfid hosil qilmaydi. Hid — deyarli har doim to‘xtagan havo puflagich belgisi.",
      },
      {
        q: "Elektr o‘chsa nima bo‘ladi?",
        a: "Bir necha soat — hech narsa. Bir sutka va undan ko‘p — biologiya nobud bo‘la boshlaydi, keyin rejimga chiqish ikki-uch hafta. Tarmog‘i beqaror joylar uchun generator yoki UPS tavsiya qilamiz: puflagichga 250 Vt yetadi.",
      },
      {
        q: "Ilni qancha tez-tez so‘rib olish kerak?",
        a: "Il stabilizatori butun qatorda 96 sutkaga hisoblangan — amalda uch-to‘rt oyda bir marta. Har hafta tashiladigan chuqur bilan solishtiring.",
      },
      {
        q: "Kir yuvish mashinasi suvi va xlorli vositalarni tashlash mumkinmi?",
        a: "Kir yuvish mashinasi — ha. Xlorli vositalar, erituvchi va bo‘yoqlar — yo‘q: xlorning to‘satdan tashlanishi faol ilni o‘ldiradi.",
      },
      {
        q: "Tozalangan suvni qayerga chiqarish kerak?",
        a: "Variantlar: filtrlovchi quduq yoki transheya, texnik ehtiyojlar uchun to‘plagich, kelishuv bo‘yicha yomg‘ir tarmog‘iga tashlash. Uchastkangiz va yer osti suvi sathiga mos sxemani aytamiz.",
      },
    ],
    allTitle: "BUTUN LINIYA",
    allButton: "BIO MODELLARINI KO‘RISH",
    allHref: "/products#bio-plants",
    ctaTitle: "Uyda necha kishi\nyashashini ayting.",
    ctaText:
      "Tanlov uchun shu yetarli. Model, o‘rnatish sxemasi, elektrga talablar va ankerlash hisobini qaytaramiz.",
    ctaButton: "TANLOVNI OLISH",
  },

  en: {
    label: "OFF-MAINS SEWAGE",
    title: "A package plant for a house:\nwhy it beats a septic tank.",
    intro:
      "Where there is no municipal sewer, there are three options: a cesspit, a septic tank, or a package treatment plant. Here is the honest difference, with figures and running costs.",
    sections: [
      {
        title: "Cesspit, septic tank, package plant",
        text: [
          "A cesspit treats nothing: it is a vessel a vacuum truck empties. At a family's 0.8–1 m³ per day that means pump-outs every few days — over a year, dearer than any treatment plant, with the smell thrown in for free.",
          "A septic tank is a flow-through settler. It holds back solids but removes only 30–40 % of BOD: the outflow is turbid, odorous water that may be neither discharged to grade nor soaked away near wells. A septic tank without soakaway fields is the same cesspit, only slower.",
          "A package plant treats biologically: micro-organisms in the aeration tank oxidise the organics, the sludge is separated and returned, treated water leaves. Our BIO range is designed to KMK norms: 13.5 hours in the aeration tank, nitrification, 96 days of sludge holding — emptying about once a quarter, not once a week.",
        ],
      },
      {
        title: "Sizing and what the site needs",
        text: [
          "The flow follows from the permanent occupants: 200 litres per person per day to KMK 2.04.03-19. A family of five is a BIO-1; a large house with guests is a BIO-3. Do not buy double the size: biology likes steady load, and a half-empty tank performs worse than a matched one.",
          "The site needs three things: 220 V for the blower (0.25 kW — two light bulbs), room for the shell four-five metres from the house, and the groundwater level — with high water the shell is anchored to a concrete slab, and we supply that calculation with the product.",
          "Where a kitchen cooks intensively, a grease trap goes ahead of the plant — fat suppresses the biology.",
        ],
      },
    ],
    pickTitle: "Which model fits your house",
    pickText:
      "Flow taken as 200 l per occupant per day to KMK 2.04.03-19. Count permanent occupants; seasonal guests fit the range margin.",
    picks: [
      { slug: "bio-1", when: "Single-family house, up to 5 occupants" },
      { slug: "bio-3", when: "Large house or two neighbours, up to 15" },
      { slug: "bio-5", when: "Guest house, small café, up to 25" },
      { slug: "bio-10", when: "Group of houses, up to 50" },
      { slug: "bio-15", when: "Small hotel, up to 75" },
      { slug: "bio-25", when: "Neighbourhood, resort, up to 125" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "Will there be a smell?",
        a: "With properly installed ventilation — no. The aerobic process, unlike rotting in a pit, produces no noticeable hydrogen sulphide; the vent stack rises above the roof. A smell almost always means a stopped blower or a blocked vent.",
      },
      {
        q: "What happens in a power cut?",
        a: "A few hours — nothing. A day or more — the biology starts dying, and recovery takes two-three weeks. For areas with an unstable grid we suggest a generator socket or a UPS: the blower needs 250 W.",
      },
      {
        q: "How often is sludge removed?",
        a: "Sludge holding is 96 days across the range — in practice a vacuum truck once every three-four months. Compare with a cesspit emptied weekly.",
      },
      {
        q: "Washing machine water and bleach?",
        a: "The washing machine — yes, ordinary detergents are tolerated. Chlorine cleaners, solvents and paints — no: a slug of bleach kills the activated sludge. What kills bacteria in the toilet kills them in the tank.",
      },
      {
        q: "Where does the treated water go?",
        a: "A soakaway well or trench, a storage tank for technical use, or discharge to the storm network by agreement. We will suggest a scheme for your plot and groundwater level.",
      },
    ],
    allTitle: "FULL LINE",
    allButton: "VIEW THE BIO LINE",
    allHref: "/products#bio-plants",
    ctaTitle: "Tell us how many people\nlive in the house.",
    ctaText:
      "That is enough for a selection. We return the model, the installation drawing, the electrical requirements and the anchoring calculation.",
    ctaButton: "GET A SELECTION",
  },

  zh: {
    label: "独立排水系统",
    title: "别墅一体化污水设备：\n为什么优于化粪池。",
    intro:
      "没有市政管网时有三种选择：渗坑、化粪池或一体化处理设备。这里用数字诚实地比较三者的差别和运行成本。",
    sections: [
      {
        title: "渗坑、化粪池、一体化设备的区别",
        text: [
          "渗坑不做任何处理：它只是吸污车定期清运的容器。一个家庭每天排水 0,8–1 m³，几天就要清运一次——一年下来比任何处理设备都贵。",
          "化粪池是流通式沉淀池。它拦截悬浮物，但 BOD 去除率仅 30–40%：出水浑浊有味，按规范既不能排放地表，也不能在水井附近渗入土壤。",
          "一体化设备是生物处理：曝气池中的微生物氧化有机物，污泥分离回流，排出处理后的水。BIO 系列按 KMK 规范设计：曝气池停留 13,5 小时、硝化、污泥储存 96 天——约每季度清掏一次，而不是每周。",
        ],
      },
      {
        title: "规格选择与场地条件",
        text: [
          "流量按常住人数计算：KMK 2.04.03-19 规定人均每天 200 升。五口之家对应 BIO-1；有客人和庭院浇洒的大宅对应 BIO-3。不要'放大一倍'购买：生物系统喜欢稳定负荷，半空的曝气池反而运行更差。",
          "场地需要三样：鼓风机用 220 V 电源（0,25 kW，相当于两个灯泡）、距房屋四五米的安装位置、以及地下水位数据——水位高时壳体锚固在混凝土底板上，抗浮计算随产品提供。",
          "如果厨房烹饪量大，设备前应加隔油器——油脂抑制生物系统。",
        ],
      },
    ],
    pickTitle: "您的住宅适合哪个型号",
    pickText: "流量按 KMK 2.04.03-19 人均每天 200 升取值。按常住人数计算。",
    picks: [
      { slug: "bio-1", when: "单户住宅，5 人以内" },
      { slug: "bio-3", when: "大宅或两户相邻，15 人以内" },
      { slug: "bio-5", when: "民宿、小咖啡馆，25 人以内" },
      { slug: "bio-10", when: "住宅组团，50 人以内" },
      { slug: "bio-15", when: "小型酒店，75 人以内" },
      { slug: "bio-25", when: "社区、度假基地，125 人以内" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "院子里会有异味吗？",
        a: "通风正确安装时不会。好氧工艺不同于渗坑的腐败，不产生明显的硫化氢；排气立管高出屋面。有味几乎总是鼓风机停转或通风堵塞的信号。",
      },
      {
        q: "停电了怎么办？",
        a: "几个小时——没影响。一昼夜以上——生物开始死亡，恢复需两三周。电网不稳定的地区建议备发电机插座或 UPS：鼓风机只需 250 W。",
      },
      {
        q: "污泥多久清掏一次？",
        a: "全系列污泥储存按 96 天设计——实际约三四个月一次吸污车。对比每周清运的渗坑。",
      },
      {
        q: "洗衣机的水和含氯清洁剂能排入吗？",
        a: "洗衣机可以，常规洗衣粉生物能耐受。含氯清洁剂、溶剂和油漆不行：瞬间倒入的氯会杀死活性污泥。",
      },
      {
        q: "处理后的水排到哪里？",
        a: "渗滤井或渗滤沟、储水箱作技术用水，或经协商排入雨水管网。我们会按您的地块和地下水位建议方案。",
      },
    ],
    allTitle: "全系列",
    allButton: "查看 BIO 系列",
    allHref: "/products#bio-plants",
    ctaTitle: "告诉我们家里\n住几口人。",
    ctaText: "这就足够选型了。我们将返回型号、安装图、电气要求和抗浮计算。",
    ctaButton: "获取选型",
  },
};

export default content;
