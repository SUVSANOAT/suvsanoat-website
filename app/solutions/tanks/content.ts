import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «резервуар из стеклопластика», «ёмкость
 * для воды купить», «усреднитель». Ведёт на линейку РЕЗ.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ЁМКОСТИ ИЗ СТЕКЛОПЛАСТИКА",
    title: "Резервуар, который\nне гниёт и не всплывает.",
    intro:
      "Запас воды, усреднение стоков, пожарный резерв, приём промывных вод — всё это ёмкость от 1 до 50 м³. Разбираем, чем стеклопластик отличается от металла и полиэтилена, почему кольца жёсткости обязательны и как не дать пустому резервуару всплыть.",
    sections: [
      {
        title: "Стеклопластик против металла и полиэтилена",
        text: [
          "Металлическая ёмкость в грунте живёт столько, сколько живёт её покрытие: царапина при монтаже — и через пять-семь лет сквозная коррозия. Стеклопластик не корродирует вовсе: изофталевая полиэфирная смола держит и стоки, и нефтепродукты, и почвенную влагу весь срок службы объекта.",
          "Полиэтиленовые ёмкости хороши до первого серьёзного внешнего давления: модуль упругости полиэтилена в разы ниже, и подземная установка требует либо бетонного саркофага, либо малой глубины. Намотанный стеклопластик с кольцами жёсткости несёт грунт и грунтовую воду сам.",
          "Мы наматываем корпуса на своём участке в Ташкенте: диаметры 1 200–2 400 мм, объёмы от 1 до 50 м³ в одном изделии, толщина ламината 6–9 мм по расчёту. Каждый корпус проходит гидроиспытание — сутки под водой до отгрузки.",
        ],
      },
      {
        title: "Две вещи, которые губят подземные ёмкости",
        text: [
          "Первая — смятие грунтовой водой. Гладкая оболочка без колец теряет устойчивость уже при 12–27 сантиметрах воды над верхом корпуса — поэтому кольца жёсткости с шагом 800 мм стоят на всём нашем ряду, и критическое давление поднимается до 70–73 кПа: семикратный запас к метровому столбу воды. У каждой модели это число написано в характеристиках — спросите у любого другого поставщика его цифру.",
          "Вторая — всплытие. Пустая ёмкость в водонасыщенном грунте — поплавок: РЕЗ-20 при высокой воде выталкивается силой около двадцати тонн. Лечится анкеровкой к бетонной плите; расчёт анкеровки под ваш уровень грунтовых вод мы выдаём вместе с изделием, плиту делает строитель.",
          "И одно правило эксплуатации: обратная засыпка — послойно, песком без камней, при заполненной водой ёмкости. Нарушение порядка засыпки — главная причина деформаций, и на неё не действует ничья гарантия.",
        ],
      },
    ],
    pickTitle: "Типовые объёмы под типовые задачи",
    pickText:
      "Для усреднителя объём считается по графику притока — обычно 4–8 часов среднего расхода; для запаса — по требуемому резерву. Промежуточные объёмы делаем без наценки: корпус наматывается на любую длину.",
    picks: [
      { slug: "rez-3", when: "Приём промывных вод, реагентное хозяйство" },
      { slug: "rez-5", when: "Технический запас малого объекта" },
      { slug: "rez-10", when: "Усреднитель автомойки или кафе" },
      { slug: "rez-20", when: "Усреднение стоков производства" },
      { slug: "rez-30", when: "Запас воды посёлка, полив" },
      { slug: "rez-50", when: "Пожарный резерв, крупный объект" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Можно ли ставить под проезд автомобилей?",
        a: "Да, с железобетонной разгрузочной плитой, которая опирается на грунт, а не на корпус. Нагрузка от колеса уходит в плиту и распределяется мимо изделия. Схему выдаём с изделием; без плиты под проездом не ставить.",
      },
      {
        q: "Подходит ли для питьевой воды?",
        a: "Для технической, поливочной, пожарной и стоков — без ограничений. Для питьевой нужен ламинат с внутренним слоем на смоле пищевого класса — делаем под заказ, скажите об этом сразу: слой закладывается при намотке, а не после.",
      },
      {
        q: "Наземно ставить можно?",
        a: "Да, на опорные ложементы. Для наземной установки на открытом солнце добавляем защитный слой от ультрафиолета. Учтите испарение и замерзание: наземная ёмкость зимой либо утепляется, либо опорожняется.",
      },
      {
        q: "Почему не просто больше толщина вместо колец?",
        a: "Потому что устойчивость оболочки растёт с толщиной в кубе, а с кольцами — на порядок при том же весе. Гладкая труба той же несущей способности была бы вдвое тяжелее и дороже. Кольца — это не удорожание, а способ не переплачивать за ламинат.",
      },
      {
        q: "Какой срок службы?",
        a: "Расчётный срок службы стеклопластикового корпуса — 50 лет: смола не корродирует, стекло не гниёт. Ограничивает срок обычно не корпус, а нарушенная засыпка или отсутствие анкеровки — обе проблемы решаются при монтаже, и обе мы закрываем схемой установки.",
      },
    ],
    allTitle: "ВСЯ ЛИНЕЙКА",
    allButton: "СМОТРЕТЬ МОДЕЛИ РЕЗ",
    allHref: "/products#tanks",
    ctaTitle: "Скажите объём и задачу —\nвернём подбор.",
    ctaText:
      "Назначение ёмкости, требуемый объём, подземная или наземная установка и уровень грунтовых вод. Вернём модель, расчёт анкеровки и схему установки.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
  },

  uz: {
    label: "SHISHATOLALI PLASTIK IDISHLAR",
    title: "Chirimaydigan va suzib\nchiqmaydigan rezervuar.",
    intro:
      "Suv zaxirasi, oqavani tenglashtirish, yong‘in rezervi — bularning hammasi 1 dan 50 m³ gacha idish. Shishatolali plastik metall va polietilendan nimasi bilan farq qiladi va bo‘sh rezervuarni suzib chiqishdan qanday saqlash kerak.",
    sections: [
      {
        title: "Shishatolali plastik metall va polietilenga qarshi",
        text: [
          "Yerdagi metall idish qoplamasi qancha yashasa, shuncha yashaydi: montajda bitta chizilish — besh-yetti yildan keyin teshik korroziya. Shishatolali plastik umuman korroziyalanmaydi: izoftal smola oqavani ham, neft mahsulotlarini ham, tuproq namligini ham obyektning butun xizmat muddati davomida ko‘taradi.",
          "Polietilen idishlar birinchi jiddiy tashqi bosimgacha yaxshi: elastiklik moduli bir necha barobar past, yer osti o‘rnatish beton sarkofag talab qiladi. Qattiqlik halqali o‘ralgan shishatolali plastik tuproq va yer osti suvini o‘zi ko‘taradi.",
          "Korpuslarni Toshkentdagi o‘z uchastkamizda o‘raymiz: diametrlar 1 200–2 400 mm, hajmlar 1 dan 50 m³ gacha, laminat qalinligi hisob bo‘yicha 6–9 mm. Har bir korpus gidrosinovdan o‘tadi — jo‘natishdan oldin bir sutka suv ostida.",
        ],
      },
      {
        title: "Yer osti idishlarini buzadigan ikki narsa",
        text: [
          "Birinchisi — yer osti suvi bilan ezilish. Halqasiz silliq qobiq korpus ustidagi 12–27 santimetr suvda barqarorlikni yo‘qotadi — shuning uchun 800 mm qadamli halqalar butun qatorimizda bor va kritik bosim 70–73 kPa gacha ko‘tariladi: bir metr suvga yetti karra zaxira. Har bir modelda bu raqam tavsifda yozilgan.",
          "Ikkinchisi — suzib chiqish. Suvga to‘yingan tuproqda bo‘sh idish — qalqovich: РЕЗ-20 ni yuqori suvda yigirma tonnaga yaqin kuch itaradi. Davosi — beton plitaga ankerlash; hisobni mahsulot bilan beramiz, plitani quruvchi bajaradi.",
          "Va bitta qoida: teskari ko‘mish — qatlam-qatlam, toshsiz qum bilan, idish suvga to‘lgan holda. Buning buzilishi deformatsiyalarning asosiy sababi va bunga hech kimning kafolati amal qilmaydi.",
        ],
      },
    ],
    pickTitle: "Tipik vazifalarga tipik hajmlar",
    pickText:
      "Tenglashtirgich uchun hajm kelish grafigi bo‘yicha — odatda o‘rtacha sarfning 4–8 soati; zaxira uchun — kerakli rezerv bo‘yicha. Oraliq hajmlarni ustama haqsiz qilamiz.",
    picks: [
      { slug: "rez-3", when: "Yuvish suvlarini qabul qilish, reagent xo‘jaligi" },
      { slug: "rez-5", when: "Kichik obyektning texnik zaxirasi" },
      { slug: "rez-10", when: "Avtoyuvish yoki kafe tenglashtirgichi" },
      { slug: "rez-20", when: "Ishlab chiqarish oqavasini tenglashtirish" },
      { slug: "rez-30", when: "Qishloq suv zaxirasi, sug‘orish" },
      { slug: "rez-50", when: "Yong‘in rezervi, yirik obyekt" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Avtomobil yo‘li ostiga qo‘ysa bo‘ladimi?",
        a: "Ha, tuproqqa tayanadigan (korpusga emas) temir-beton yuk tushirish plitasi bilan. Sxemani mahsulot bilan beramiz; plitasiz yo‘l ostiga qo‘yilmaydi.",
      },
      {
        q: "Ichimlik suviga to‘g‘ri keladimi?",
        a: "Texnik, sug‘orish, yong‘in suvi va oqava uchun — cheklovsiz. Ichimlik uchun oziq-ovqat sinfidagi smolali ichki qatlam kerak — buyurtma asosida qilamiz, darhol ayting: qatlam o‘rashda qo‘yiladi.",
      },
      {
        q: "Yer ustiga qo‘yish mumkinmi?",
        a: "Ha, tayanch lojementlarga. Ochiq quyoshda ultrabinafshadan himoya qatlami qo‘shamiz. Qishda yer usti idish yo isitiladi, yo bo‘shatiladi.",
      },
      {
        q: "Halqalar o‘rniga shunchaki qalinroq qilsa bo‘lmaydimi?",
        a: "Qobiq barqarorligi qalinlik kubi bilan o‘sadi, halqalar bilan esa o‘sha vaznda o‘n barobar. Xuddi shu ko‘tarish qobiliyatidagi silliq quvur ikki barobar og‘ir va qimmat bo‘lardi.",
      },
      {
        q: "Xizmat muddati qancha?",
        a: "Shishatolali korpusning hisobiy muddati — 50 yil: smola korroziyalanmaydi, shisha chirimaydi. Muddatni odatda korpus emas, buzilgan ko‘mish yoki ankerlash yo‘qligi cheklaydi — ikkalasini ham o‘rnatish sxemasi bilan yopamiz.",
      },
    ],
    allTitle: "BUTUN LINIYA",
    allButton: "РЕЗ MODELLARINI KO‘RISH",
    allHref: "/products#tanks",
    ctaTitle: "Hajm va vazifani ayting —\ntanlovni qaytaramiz.",
    ctaText:
      "Idish vazifasi, kerakli hajm, yer osti yoki yer usti o‘rnatish va yer osti suvi sathi. Model, ankerlash hisobi va o‘rnatish sxemasini qaytaramiz.",
    ctaButton: "TANLOVNI OLISH",
  },

  en: {
    label: "GRP VESSELS",
    title: "A tank that neither\nrots nor floats.",
    intro:
      "Water reserve, flow balancing, fire storage, backwash reception — all of it is a vessel from 1 to 50 m³. How GRP differs from steel and polyethylene, why stiffening rings are mandatory, and how to keep an empty tank from floating.",
    sections: [
      {
        title: "GRP versus steel and polyethylene",
        text: [
          "A buried steel tank lives as long as its coating: one scratch at installation, and through-corrosion follows in five-seven years. GRP does not corrode at all: isophthalic resin withstands sewage, oil products and soil moisture for the life of the site.",
          "Polyethylene vessels are fine until the first serious external load: the modulus is several times lower, and burial demands either a concrete sarcophagus or shallow depth. Filament-wound GRP with stiffening rings carries the soil and the groundwater by itself.",
          "We wind the shells at our own works in Tashkent: diameters 1,200–2,400 mm, volumes 1 to 50 m³ in a single unit, laminate 6–9 mm by calculation. Every shell is hydrotested — a day under water before dispatch.",
        ],
      },
      {
        title: "The two things that kill buried vessels",
        text: [
          "First, buckling by groundwater. A plain shell without rings fails at just 12–27 centimetres of water above the crown — which is why rings at 800 mm spacing stand on our whole range, raising the critical pressure to 70–73 kPa: a sevenfold margin against a metre of water. The figure is printed in every model's data — ask any other supplier for theirs.",
          "Second, flotation. An empty vessel in saturated ground is a float: a REZ-20 is pushed up with about twenty tonnes. The cure is anchoring to a concrete slab; we supply the anchoring calculation for your groundwater level, the contractor builds the slab.",
          "And one site rule: backfill in layers, stone-free sand, with the vessel filled with water. Breaking that sequence is the main cause of deformation — and no warranty anywhere covers it.",
        ],
      },
    ],
    pickTitle: "Typical volumes for typical duties",
    pickText:
      "For balancing, the volume follows the inflow profile — usually 4–8 hours of average flow; for storage, the required reserve. Intermediate volumes come at no premium: the shell is wound to any length.",
    picks: [
      { slug: "rez-3", when: "Backwash reception, chemical make-up" },
      { slug: "rez-5", when: "Technical reserve of a small site" },
      { slug: "rez-10", when: "Balancing tank for a car wash or café" },
      { slug: "rez-20", when: "Balancing industrial discharge" },
      { slug: "rez-30", when: "Settlement water reserve, irrigation" },
      { slug: "rez-50", when: "Fire reserve, large site" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "Can it go under a driveway?",
        a: "Yes, with a reinforced concrete relief slab bearing on the ground, not on the shell. The wheel load goes into the slab and around the vessel. We supply the drawing; never under traffic without the slab.",
      },
      {
        q: "Is it suitable for drinking water?",
        a: "For process, irrigation, fire water and sewage — without restriction. Drinking water needs an inner layer on food-grade resin — made to order, and say so upfront: the layer is laid during winding, not after.",
      },
      {
        q: "Can it stand above ground?",
        a: "Yes, on saddle supports. For open-sun installation we add a UV-protective layer. Mind evaporation and frost: an above-ground vessel is either insulated or emptied for winter.",
      },
      {
        q: "Why rings instead of simply a thicker wall?",
        a: "Shell stability grows with the cube of thickness, but with rings — an order of magnitude at the same weight. A plain shell of equal capacity would be twice as heavy and dear. Rings are not an extra: they are how you avoid overpaying for laminate.",
      },
      {
        q: "What is the service life?",
        a: "The design life of a GRP shell is 50 years: the resin does not corrode, the glass does not rot. What limits life is usually bad backfill or missing anchoring — both are settled at installation, and both are covered by our installation drawing.",
      },
    ],
    allTitle: "FULL LINE",
    allButton: "VIEW THE TANK LINE",
    allHref: "/products#tanks",
    ctaTitle: "Tell us the volume and duty —\nwe return the selection.",
    ctaText:
      "The duty, the required volume, buried or above-ground, and the groundwater level. We return the model, the anchoring calculation and the installation drawing.",
    ctaButton: "GET A SELECTION",
  },

  zh: {
    label: "玻璃钢罐体",
    title: "既不腐烂\n也不上浮的储罐。",
    intro:
      "储水、水量调节、消防储备、反冲洗水接纳——这些都是 1 到 50 m³ 的罐体。玻璃钢与钢和聚乙烯的区别、为什么加强环必不可少、如何防止空罐上浮。",
    sections: [
      {
        title: "玻璃钢对钢与聚乙烯",
        text: [
          "埋地钢罐的寿命等于其防腐层的寿命：安装时一道划痕，五到七年后穿孔腐蚀。玻璃钢完全不腐蚀：间苯树脂在项目整个寿命期内耐污水、油品和土壤湿气。",
          "聚乙烯罐在第一次严重外压前都很好：其弹性模量低数倍，埋地需要混凝土'石棺'或浅埋。带加强环的缠绕玻璃钢自己承受土压和地下水。",
          "壳体在我们塔什干的车间缠绕：直径 1 200–2 400 mm，单罐容积 1 至 50 m³，层压厚度按计算 6–9 mm。每个壳体出厂前水压试验一昼夜。",
        ],
      },
      {
        title: "毁掉埋地罐的两件事",
        text: [
          "第一，地下水压屈曲。无环光壳在罐顶以上仅 12–27 厘米水柱即失稳——因此全系列均设间距 800 mm 的加强环，临界压力提高到 70–73 kPa：对一米水柱有七倍裕度。每个型号的参数表都印着这个数字——问问其他供应商他们的数字。",
          "第二，上浮。饱和土中的空罐就是浮子：高水位时 РЕЗ-20 受到约二十吨的上推力。对策是锚固于混凝土底板；抗浮计算按您的地下水位随产品提供，底板由施工方浇筑。",
          "还有一条现场规则：回填分层进行、用无石砂料、罐内注满水。违反此顺序是变形的主因——任何质保都不覆盖它。",
        ],
      },
    ],
    pickTitle: "典型用途的典型容积",
    pickText:
      "调节池容积按来水曲线取平均流量的 4–8 小时；储存按所需储备。中间容积不加价：壳体可缠绕任意长度。",
    picks: [
      { slug: "rez-3", when: "反冲洗水接纳、加药配制" },
      { slug: "rez-5", when: "小型项目技术储备" },
      { slug: "rez-10", when: "洗车场或餐饮调节池" },
      { slug: "rez-20", when: "生产废水调节" },
      { slug: "rez-30", when: "村镇储水、灌溉" },
      { slug: "rez-50", when: "消防储备、大型项目" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "能装在车道下面吗？",
        a: "能，需设支承在土上（而非壳体上）的钢筋混凝土卸荷板。轮载进入底板并绕过罐体传递。图纸随产品提供；无卸荷板严禁置于车道下。",
      },
      {
        q: "适合饮用水吗？",
        a: "技术用水、灌溉、消防和污水——无限制。饮用水需要食品级树脂内衬——可定制，请提前说明：内衬在缠绕时铺设，事后无法追加。",
      },
      {
        q: "可以地上安装吗？",
        a: "可以，置于鞍座上。露天日晒场合加抗紫外线保护层。注意蒸发与冻结：地上罐冬季要么保温，要么放空。",
      },
      {
        q: "为什么用加强环而不是简单加厚？",
        a: "壳体稳定性随厚度按立方增长，而加环在同等重量下提高一个数量级。同等承载力的光壳要重一倍、贵一倍。加强环不是加价项，而是不为层压多花钱的办法。",
      },
      {
        q: "使用寿命多长？",
        a: "玻璃钢壳体设计寿命 50 年：树脂不腐蚀，玻璃不腐烂。限制寿命的通常不是壳体，而是错误回填或缺失锚固——两者都在安装时解决，都包含在我们的安装图中。",
      },
    ],
    allTitle: "全系列",
    allButton: "查看储罐系列",
    allHref: "/products#tanks",
    ctaTitle: "告诉我们容积和用途——\n我们返回选型。",
    ctaText: "用途、所需容积、埋地或地上、地下水位。我们将返回型号、抗浮计算和安装图。",
    ctaButton: "获取选型",
  },
};

export default content;
