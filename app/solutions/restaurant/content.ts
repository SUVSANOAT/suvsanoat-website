import type { SolutionContentSet } from "../types";

/**
 * Посадочная страница под запрос «жироуловитель для ресторана / кафе».
 * Ведёт на линейку ЖИР из ассортимента.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ЖИРОУЛОВИТЕЛЬ ДЛЯ ОБЩЕПИТА",
    title: "Жироуловитель\nдля ресторана и кафе.",
    intro:
      "Водоканал нормирует жиры на выпуске, жир застывает в трубах, а претензии приходят владельцу заведения. Разбираем, какой жироуловитель нужен кухне, как он подбирается и что писать в договоре с водоканалом.",
    sections: [
      {
        title: "Почему без него нельзя",
        text: [
          "Стоки кухни несут животные и растительные жиры, остатки пищи и моющие средства. Пока сток горячий, жир растворён; в первой же холодной трубе он застывает на стенках. Сначала зарастает выпуск заведения, затем городской коллектор — и претензия водоканала приходит по адресу того, чья кухня выше по сети.",
          "Постановление КМ РУз № 11 от 03.02.2010 нормирует жиры в стоке, принимаемом в коммунальную канализацию, на уровне 1,0 мг/л. Гравитационный жироуловитель — обязательная первая ступень: он снимает основную массу жира до того, как сток остынет в сети.",
          "Есть и вторая причина, о которой продавцы обычно молчат: температура. Стоки посудомоечных машин и пароконвектоматов выходят при 45–60 °C — при такой температуре жир не всплывает вовсе. Наш ряд рассчитан на время пребывания не менее 79 минут: сток успевает остыть примерно до 30 °C, и только после этого жир отделяется. Уловитель меньшего объёма формально существует, фактически — пропускает жир насквозь.",
        ],
      },
      {
        title: "Как подбирается типоразмер",
        text: [
          "Не по посадочным местам, а по пиковому расходу стока — его создаёт оборудование кухни: мойки, посудомоечные машины, пароконвектоматы, котлы. Одна посудомоечная машина при сливе даёт больше стока, чем зал на пятьдесят гостей.",
          "Посадочные места в карточках ниже — ориентир для первого шага. Точный подбор мы делаем по перечню кухонного оборудования: пришлите список, вернём типоразмер, отметки и исполнительную схему для строителей. Это бесплатно и занимает один рабочий день.",
          "Корпус — стеклопластик на изофталевой смоле, установка подземная в бетонной обойме, работа самотёком: ни электричества, ни автоматики. Под проездом корпус защищается разгрузочной плитой, которая не опирается на изделие.",
        ],
      },
    ],
    pickTitle: "Какая модель нужна вашей кухне",
    pickText:
      "Ориентиры по посадочным местам — для первой прикидки. Точный подбор делается по перечню кухонного оборудования и пиковому расходу.",
    picks: [
      { slug: "zhir-1", when: "Кафе до ~50 мест, одна мойка и посудомоечная машина" },
      { slug: "zhir-2", when: "Кафе 50–100 мест, кухня с горячим цехом" },
      { slug: "zhir-3", when: "Ресторан полного цикла до ~150 мест" },
      { slug: "zhir-5", when: "Ресторан с фритюром, фастфуд, доставка" },
      { slug: "zhir-8", when: "Фудкорт, банкетный зал, фабрика-кухня" },
      { slug: "zhir-12", when: "Пищевое производство, комбинат питания" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Водоканал требует 1,0 мг/л. Жироуловитель это обеспечит?",
        a: "Нет, и никакой гравитационный жироуловитель — ни местный, ни импортный — этого не обеспечит: физика процесса ограничивает результат десятками мг/л. Уловитель снимает основную массу жира и защищает сеть; для единиц мг/л нужна напорная флотация. В договоре с водоканалом мы помогаем сформулировать реальные гарантируемые показатели.",
      },
      {
        q: "Можно поставить компактный уловитель под мойку?",
        a: "Бытовые уловители под мойку рассчитаны на одну раковину и не дают времени остывания — для коммерческой кухни это имитация решения. Мы производим наружные подземные уловители от 1 м³/ч: один корпус на весь выпуск кухни, с корзиной для отходов и люками для обслуживания.",
      },
      {
        q: "Как часто откачивать?",
        a: "По заполнению жировой камеры, а не по календарю. У каждой модели в характеристиках указан объём накопления жира; при типичной загрузке кафе это раз в четыре–восемь недель. Толщина слоя проверяется щупом через люк за минуту.",
      },
      {
        q: "Куда девать фритюрное масло?",
        a: "Только в отдельную ёмкость и на вывоз по договору. Слитый в канализацию фритюр выводит уловитель из строя за одну–две недели — это самая частая причина «жироуловитель не работает».",
      },
      {
        q: "Биопрепараты «растворяют жир» — можно обойтись ими?",
        a: "Нет. Ферменты и эмульгаторы не удаляют жир, а переводят его в эмульсию, которая уходит дальше в сеть и застывает там. Для водоканала это то же нарушение, только отложенное.",
      },
    ],
    allTitle: "ВСЯ ЛИНЕЙКА",
    allButton: "СМОТРЕТЬ МОДЕЛИ ЖИР",
    allHref: "/products#grease-traps",
    ctaTitle: "Пришлите перечень\nоборудования кухни.",
    ctaText:
      "Вернём типоразмер, стоимость и исполнительную схему для строителей в течение рабочего дня. Если есть проект — приложите лист с сетями канализации.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
  },

  uz: {
    label: "UMUMIY OVQATLANISH UCHUN YOG‘ TUTGICH",
    title: "Restoran va kafe uchun\nyog‘ tutgich.",
    intro:
      "Suv kanali chiqishdagi yog‘larni me‘yorlaydi, yog‘ quvurlarda qotadi, da‘volar esa muassasa egasiga keladi. Oshxonaga qanday yog‘ tutgich kerakligi va u qanday tanlanishini ko‘rib chiqamiz.",
    sections: [
      {
        title: "Nega usiz bo‘lmaydi",
        text: [
          "Oshxona oqavasi hayvon va o‘simlik yog‘larini, ovqat qoldiqlari va yuvish vositalarini olib keladi. Oqava issiq ekan, yog‘ erigan holda; birinchi sovuq quvurda u devorlarga qotadi. Avval muassasa chiqishi, keyin shahar kollektori bitib qoladi.",
          "O‘zR VM ning 03.02.2010 yildagi 11-son qarori kommunal kanalizatsiyaga qabul qilinadigan oqavada yog‘larni 1,0 mg/l darajasida me‘yorlaydi. Gravitatsion yog‘ tutgich — majburiy birinchi bosqich.",
          "Ikkinchi sabab — harorat. Idish yuvish mashinalari oqavasi 45–60 °C da chiqadi, bu haroratda yog‘ umuman suzib chiqmaydi. Bizning qator kamida 79 daqiqa turib qolish vaqtiga hisoblangan: oqava ~30 °C gacha soviydi va shundan keyingina yog‘ ajraladi.",
        ],
      },
      {
        title: "O‘lcham qanday tanlanadi",
        text: [
          "O‘rinlar soni bo‘yicha emas, oqavaning eng yuqori sarfi bo‘yicha — uni oshxona jihozlari yaratadi: mo‘ylar, idish yuvish mashinalari, parokonvektomatlar. Bitta idish yuvish mashinasi bo‘shatilganda ellik mehmonli zaldan ko‘proq oqava beradi.",
          "Quyidagi kartochkalardagi o‘rinlar soni — birinchi qadam uchun mo‘ljal. Aniq tanlovni oshxona jihozlari ro‘yxati bo‘yicha bajaramiz: ro‘yxatni yuboring, o‘lcham, belgilar va quruvchilar uchun sxemani qaytaramiz. Bu bepul, bir ish kuni.",
          "Korpus — izoftal smoladagi shishatolali plastik, o‘rnatish yer osti, beton qobiqda, o‘z oqimi bilan ishlaydi.",
        ],
      },
    ],
    pickTitle: "Oshxonangizga qaysi model kerak",
    pickText:
      "O‘rinlar soni — dastlabki mo‘ljal. Aniq tanlov oshxona jihozlari ro‘yxati va eng yuqori sarf bo‘yicha bajariladi.",
    picks: [
      { slug: "zhir-1", when: "~50 o‘ringacha kafe, bitta mo‘y va idish yuvish mashinasi" },
      { slug: "zhir-2", when: "50–100 o‘rinli kafe, issiq sexli oshxona" },
      { slug: "zhir-3", when: "~150 o‘ringacha to‘liq siklli restoran" },
      { slug: "zhir-5", when: "Fritür bilan restoran, fastfud, yetkazib berish" },
      { slug: "zhir-8", when: "Fudkort, banket zali, fabrika-oshxona" },
      { slug: "zhir-12", when: "Oziq-ovqat ishlab chiqarishi" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Suv kanali 1,0 mg/l talab qiladi. Yog‘ tutgich buni ta‘minlaydimi?",
        a: "Yo‘q, hech qanday gravitatsion yog‘ tutgich buni ta‘minlamaydi: jarayon fizikasi natijani o‘nlab mg/l bilan cheklaydi. Tutgich yog‘ning asosiy massasini oladi; bir necha mg/l uchun bosimli flotatsiya kerak. Suv kanali bilan shartnomada real kafolatlanadigan ko‘rsatkichlarni shakllantirishga yordam beramiz.",
      },
      {
        q: "Mo‘y ostiga ixcham tutgich qo‘ysa bo‘ladimi?",
        a: "Mo‘y osti maishiy tutgichlar bitta rakovina uchun va sovish vaqtini bermaydi — tijorat oshxonasi uchun bu yechim emas. Biz 1 m³/soatdan boshlab tashqi yer osti tutgichlarini ishlab chiqaramiz.",
      },
      {
        q: "Qancha tez-tez so‘rib olish kerak?",
        a: "Kalendar bo‘yicha emas, yog‘ kamerasining to‘lishi bo‘yicha. Har bir model tavsifida yog‘ to‘planish hajmi ko‘rsatilgan; oddiy kafe yuklamasida bu to‘rt–sakkiz haftada bir marta.",
      },
      {
        q: "Fritür moyini qayerga to‘kish kerak?",
        a: "Faqat alohida idishga va shartnoma bo‘yicha olib ketishga. Kanalizatsiyaga to‘kilgan fritür tutgichni bir-ikki haftada ishdan chiqaradi.",
      },
      {
        q: "«Yog‘ni erituvchi» biopreparatlar bilan cheklansa bo‘ladimi?",
        a: "Yo‘q. Fermentlar yog‘ni yo‘qotmaydi, uni emulsiyaga aylantiradi — u tarmoqqa o‘tib, o‘sha yerda qotadi.",
      },
    ],
    allTitle: "BUTUN LINIYA",
    allButton: "ЖИР MODELLARINI KO‘RISH",
    allHref: "/products#grease-traps",
    ctaTitle: "Oshxona jihozlari\nro‘yxatini yuboring.",
    ctaText:
      "Bir ish kuni ichida o‘lcham, narx va quruvchilar uchun ijro sxemasini qaytaramiz.",
    ctaButton: "TANLOVNI OLISH",
  },

  en: {
    label: "GREASE TRAP FOR FOOD SERVICE",
    title: "A grease trap\nfor restaurants and cafés.",
    intro:
      "The utility limits fat in the discharge, fat solidifies in pipes, and the claims land on the owner. Here is how a commercial kitchen grease trap is sized and what to agree with the utility.",
    sections: [
      {
        title: "Why it is mandatory",
        text: [
          "Kitchen wastewater carries animal and vegetable fats, food solids and detergents. While hot, the fat stays dissolved; in the first cold pipe it plates onto the walls. First the outlet clogs, then the municipal sewer — and the claim goes to the kitchen upstream.",
          "Uzbekistan Cabinet Resolution No. 11 of 03.02.2010 limits fats in wastewater accepted into the municipal sewer to 1.0 mg/l. A gravity grease trap is the mandatory first stage.",
          "The second reason is temperature. Dishwasher discharge leaves at 45–60 °C, and at that temperature fat does not rise at all. Our range is designed for at least 79 minutes of retention: the flow cools to about 30 °C, and only then the fat separates. A smaller trap exists formally — and passes fat straight through.",
        ],
      },
      {
        title: "How the size is selected",
        text: [
          "Not by seats, but by the peak flow — which is set by the kitchen equipment: sinks, dishwashers, combi ovens. One dishwasher discharging produces more flow than a fifty-seat dining room.",
          "The seat counts in the cards below are a first approximation. The exact selection is made from the equipment list: send it and we return the size, the levels and a construction drawing within one working day, free of charge.",
          "The shell is GRP on isophthalic resin, buried in a concrete encasement, gravity operation — no power, no controls.",
        ],
      },
    ],
    pickTitle: "Which model fits your kitchen",
    pickText:
      "Seat counts are a first approximation; the exact selection follows from the kitchen equipment list and the peak flow.",
    picks: [
      { slug: "zhir-1", when: "Café up to ~50 seats, one sink and a dishwasher" },
      { slug: "zhir-2", when: "Café of 50–100 seats with a hot kitchen" },
      { slug: "zhir-3", when: "Full-cycle restaurant up to ~150 seats" },
      { slug: "zhir-5", when: "Restaurant with fryers, fast food, delivery" },
      { slug: "zhir-8", when: "Food court, banquet hall, central kitchen" },
      { slug: "zhir-12", when: "Food production plant" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "The utility demands 1.0 mg/l. Will the trap deliver that?",
        a: "No — and no gravity trap will, ours or imported: the physics limits the result to tens of mg/l. The trap removes the bulk of the fat and protects the sewer; single digits require dissolved air flotation. We help word the utility agreement around achievable figures.",
      },
      {
        q: "Can we just fit a compact under-sink trap?",
        a: "Under-sink units serve one sink and give no cooling time — for a commercial kitchen they imitate a solution. We build buried external traps from 1 m³/h: one shell for the whole kitchen outlet.",
      },
      {
        q: "How often is it emptied?",
        a: "By the fill of the grease chamber, not by the calendar. Each model lists its grease storage volume; at a typical café load that means every four to eight weeks.",
      },
      {
        q: "Where does fryer oil go?",
        a: "Only into a separate container, collected under contract. Fryer oil dumped to the sewer kills the trap within a week or two.",
      },
      {
        q: "Will enzyme additives replace the trap?",
        a: "No. Enzymes do not remove fat — they emulsify it, and it solidifies further down the network. To the utility that is the same violation, delayed.",
      },
    ],
    allTitle: "FULL LINE",
    allButton: "VIEW THE GREASE TRAP LINE",
    allHref: "/products#grease-traps",
    ctaTitle: "Send the list\nof kitchen equipment.",
    ctaText:
      "We return the size, the price and a construction drawing within one working day.",
    ctaButton: "GET A SELECTION",
  },

  zh: {
    label: "餐饮隔油器",
    title: "餐厅与咖啡馆的\n隔油器。",
    intro:
      "自来水公司对排水中的油脂有限值，油脂会在管道中凝固，而索赔单最终落在店主头上。这里说明商用厨房隔油器如何选型。",
    sections: [
      {
        title: "为什么必须安装",
        text: [
          "厨房排水含动植物油脂、食物残渣和洗涤剂。排水尚热时油脂呈溶解态；进入第一段冷管道即凝固在管壁上。先堵店铺出口，再堵市政管网——索赔发给上游的厨房。",
          "乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议规定进入市政管网的污水油脂限值为 1,0 mg/l。重力式隔油器是强制性的第一级。",
          "第二个原因是温度。洗碗机排水温度 45–60 °C，此温度下油脂根本不上浮。本系列按不少于 79 分钟停留时间设计：水冷却到约 30 °C 后油脂才分离。容积更小的隔油器形式上存在，实际上油脂直接穿过。",
        ],
      },
      {
        title: "规格如何选定",
        text: [
          "不按座位数，而按峰值流量——它由厨房设备决定：洗涤槽、洗碗机、万能蒸烤箱。一台洗碗机排水时的流量超过五十座的餐厅大厅。",
          "下方卡片中的座位数仅为初步参考。精确选型按厨房设备清单进行：发来清单，一个工作日内返回规格、标高和土建施工图，免费。",
          "壳体为间苯树脂玻璃钢，埋地混凝土包封安装，重力自流——无电、无控制系统。",
        ],
      },
    ],
    pickTitle: "您的厨房适合哪个型号",
    pickText: "座位数为初步参考；精确选型按厨房设备清单和峰值流量确定。",
    picks: [
      { slug: "zhir-1", when: "约 50 座以内咖啡馆，一个洗涤槽加洗碗机" },
      { slug: "zhir-2", when: "50–100 座咖啡馆，带热厨" },
      { slug: "zhir-3", when: "约 150 座以内全流程餐厅" },
      { slug: "zhir-5", when: "带油炸的餐厅、快餐、外卖" },
      { slug: "zhir-8", when: "美食广场、宴会厅、中央厨房" },
      { slug: "zhir-12", when: "食品生产企业" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "自来水公司要求 1,0 mg/l，隔油器能达到吗？",
        a: "不能——任何重力式隔油器都不能：工艺物理将结果限制在几十 mg/l。隔油器去除油脂主体并保护管网；要达到个位数需加压气浮。我们协助在与自来水公司的协议中写入可实现的指标。",
      },
      {
        q: "装一个水槽下的小型隔油器行吗？",
        a: "水槽下的家用隔油器只服务一个水槽且没有冷却时间——对商用厨房只是形式。我们生产 1 m³/h 起的室外埋地隔油器。",
      },
      {
        q: "多久清掏一次？",
        a: "按油脂室的充满程度，而不是按日历。每个型号都标明蓄油容积；一般咖啡馆负荷下为四至八周一次。",
      },
      {
        q: "煎炸油倒到哪里？",
        a: "只能倒入单独容器并按合同外运。倒入下水道的煎炸油一两周内就会使隔油器失效。",
      },
      {
        q: "用'溶解油脂'的生物制剂可以代替吗？",
        a: "不能。酶不去除油脂，只是将其乳化，油脂在管网下游重新凝固。对自来水公司而言是同样的违规，只是推迟了。",
      },
    ],
    allTitle: "全系列",
    allButton: "查看隔油器系列",
    allHref: "/products#grease-traps",
    ctaTitle: "请发来厨房\n设备清单。",
    ctaText: "一个工作日内返回规格、价格和土建施工图。",
    ctaButton: "获取选型",
  },
};

export default content;
