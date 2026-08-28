import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «обеззараживание воды скважины / посёлка»,
 * «хлорирование питьевой воды». Ведёт на ЭЛХ и ДОЗ.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ОБЕЗЗАРАЖИВАНИЕ ВОДЫ",
    title: "Хлорирование воды посёлка:\nсоль вместо привозного реагента.",
    intro:
      "Скважина, водозабор, накопительный резервуар посёлка или предприятия — вода перед подачей людям обеззараживается, и это требование санитарных норм, а не пожелание. Разбираем, чем электролизная станция отличается от привозного гипохлорита и как считается доза.",
    sections: [
      {
        title: "Три способа хлорировать — и что с ними не так",
        text: [
          "Привозной товарный гипохлорит 19 % работает, но живёт от поставки до поставки: реагент разлагается на жаре, требует склада химреагентов и спецперевозки, а его цена и наличие зависят от поставщика. Для удалённого посёлка перебой поставки означает воду без обеззараживания.",
          "Хлорная известь — прошлый век в буквальном смысле: нестабильная дозировка, осадок, ручной труд и постоянный пересчёт активности. Санитарные службы от неё планомерно уходят.",
          "Электролизная станция делает гипохлорит на месте из поваренной соли и электричества: 3,2 кг соли и 4,5 кВт·ч на килограмм активного хлора. Раствор 6–8 г/л — малоопасный, склад химии не нужен, запас «реагента» — мешки соли, которые не портятся. Именно поэтому водоканалы переводят узлы обеззараживания на электролиз.",
        ],
      },
      {
        title: "Как считается станция и что мы поставляем",
        text: [
          "Доза активного хлора для питьевой воды — 1–3 мг/л в зависимости от качества исходной воды и длины сети; для очищенного стока перед сбросом — 3–10 мг/л. Производительность станции в граммах в час = доза × расход воды в м³/ч. Посёлок с расходом 50 м³/ч при дозе 2 мг/л — это станция на 100 г/ч: ЭЛХ-100.",
          "Обязательная часть схемы — умягчение воды перед электролизной ячейкой: на жёсткой воде Узбекистана ячейка без умягчителя зарастает карбонатом за недели. Вторая обязательная часть — вентиляция помещения, потому что электролиз выделяет водород. Обе позиции входят в наш подбор по умолчанию, а не выясняются после монтажа.",
          "Мы собираем станцию целиком: рама, баки соли и раствора, обвязка, шкаф — наши; электролизная ячейка и выпрямитель — покупные узлы с паспортами. Дозирование в сеть — станциями ДОЗ с двумя насосами: рабочий и резервный, потому что обеззараживание останавливаться не должно.",
        ],
      },
    ],
    pickTitle: "Подбор по расходу воды",
    pickText:
      "Ориентиры при дозе 2 мг/л для питьевой воды. Точный подбор — по анализу воды и фактическому графику водопотребления.",
    picks: [
      { slug: "elh-25", when: "Скважина до ~12 м³/ч" },
      { slug: "elh-50", when: "Водозабор до ~25 м³/ч" },
      { slug: "elh-100", when: "Посёлок, расход до ~50 м³/ч" },
      { slug: "elh-250", when: "Крупный посёлок, до ~125 м³/ч" },
      { slug: "elh-500", when: "Городской узел, до ~250 м³/ч" },
      { slug: "doz-500", when: "Дозирование раствора в сеть" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Чем это лучше привозного гипохлорита по деньгам?",
        a: "Себестоимость килограмма активного хлора на месте — это соль плюс электричество, и она в разы ниже цены товарного реагента с доставкой. Станция окупается тем быстрее, чем дальше объект от поставщика. Точное сравнение под ваш тариф и расход посчитаем в подборе — с цифрами, а не лозунгами.",
      },
      {
        q: "Насколько это опасно? Это же хлор.",
        a: "Раствор 6–8 г/л относится к малоопасным — это концентрация в двадцать пять раз ниже товарного гипохлорита. Ни хлорной рампы, ни баллонов, ни склада химреагентов первого класса. Два реальных требования безопасности: вентиляция помещения из-за водорода и разделение соляного и электрического хозяйства. Оба закрыты конструкцией станции.",
      },
      {
        q: "Что нужно от воды для самой станции?",
        a: "Умягчённая вода для приготовления рассола — умягчитель входит в схему и подбирается по анализу вашей воды. Расход воды на собственные нужды станции невелик: порядка 120–150 литров на килограмм активного хлора.",
      },
      {
        q: "Электричество отключили — посёлок без обеззараживания?",
        a: "Нет: станция нарабатывает раствор в накопительный бак, рассчитанный на восемь часов работы. Плюс дозирующие насосы потребляют ватты и легко переводятся на резервное питание. При регулярных отключениях закладываем бак большего объёма — скажите об этом при подборе.",
      },
      {
        q: "Кто согласует это с санитарной службой?",
        a: "Схему, расчёт дозы и точки контроля остаточного хлора мы оформляем в составе поставки. Прибор контроля остаточного хлора на выходе — обязательная часть узла, и он в спецификации есть, а не «докупите потом».",
      },
    ],
    allTitle: "ЛИНЕЙКИ ЭЛХ И ДОЗ",
    allButton: "СМОТРЕТЬ МОДЕЛИ",
    allHref: "/products#chlorinators",
    ctaTitle: "Пришлите расход воды\nи анализ по жёсткости.",
    ctaText:
      "Расход, назначение воды и анализ. Вернём дозу, модель станции с умягчителем, требования к помещению и сравнение стоимости с привозным реагентом.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
  },

  uz: {
    label: "SUVNI ZARARSIZLANTIRISH",
    title: "Qishloq suvini xlorlash:\nkeltiriladigan reagent o‘rniga tuz.",
    intro:
      "Quduq, suv olish inshooti, qishloq yoki korxonaning to‘plash rezervuari — suv odamlarga berilishidan oldin zararsizlantiriladi, bu sanitariya me’yorlari talabi. Elektroliz stansiyasi keltiriladigan gipoxloritdan nimasi bilan farq qiladi va doza qanday hisoblanadi.",
    sections: [
      {
        title: "Xlorlashning uch usuli — va ularning muammolari",
        text: [
          "Keltiriladigan 19 % li tovar gipoxlorit ishlaydi, lekin yetkazib berishdan yetkazib berishgacha yashaydi: reagent issiqda parchalanadi, kimyoviy moddalar ombori va maxsus tashishni talab qiladi. Uzoq qishloq uchun yetkazib berish uzilishi — zararsizlantirilmagan suv degani.",
          "Xlorli ohak — tom ma’noda o‘tgan asr: beqaror doza, cho‘kma, qo‘l mehnati. Sanitariya xizmatlari undan izchil voz kechmoqda.",
          "Elektroliz stansiyasi gipoxloritni joyida osh tuzi va elektrdan tayyorlaydi: 1 kg faol xlorga 3,2 kg tuz va 4,5 kVt·soat. 6–8 g/l eritma kam xavfli, kimyo ombori kerak emas, «reagent» zaxirasi — buzilmaydigan tuz qoplari. Aynan shuning uchun suv kanallari zararsizlantirish uzellarini elektrolizga o‘tkazmoqda.",
        ],
      },
      {
        title: "Stansiya qanday hisoblanadi va nima yetkazamiz",
        text: [
          "Ichimlik suvi uchun faol xlor dozasi — suv sifati va tarmoq uzunligiga qarab 1–3 mg/l; tashlashdan oldingi tozalangan oqava uchun 3–10 mg/l. Stansiya unumdorligi g/soat = doza × suv sarfi m³/soat. 50 m³/soat sarfli qishloq 2 mg/l dozada — bu 100 g/soatlik stansiya: ЭЛХ-100.",
          "Sxemaning majburiy qismi — yacheyka oldida suvni yumshatish: O‘zbekistonning qattiq suvida yumshatgichsiz yacheyka haftalarda karbonat bilan qoplanadi. Ikkinchi majburiy qism — xona ventilyatsiyasi, chunki elektroliz vodorod ajratadi. Ikkalasi ham tanlovimizga sukut bo‘yicha kiradi.",
          "Stansiyani to‘liq biz yig‘amiz: rama, tuz va eritma baklari, obvyazka, shkaf — bizniki; elektroliz yacheykasi va to‘g‘rilagich — pasportli sotib olinadigan uzellar. Tarmoqqa dozalash — ikki nasosli ДОЗ stansiyalari bilan: ishchi va zaxira.",
        ],
      },
    ],
    pickTitle: "Suv sarfi bo‘yicha tanlov",
    pickText:
      "Ichimlik suvi uchun 2 mg/l dozadagi mo‘ljallar. Aniq tanlov — suv tahlili va haqiqiy iste’mol grafigi bo‘yicha.",
    picks: [
      { slug: "elh-25", when: "~12 m³/soatgacha quduq" },
      { slug: "elh-50", when: "~25 m³/soatgacha suv olish" },
      { slug: "elh-100", when: "~50 m³/soatgacha qishloq" },
      { slug: "elh-250", when: "~125 m³/soatgacha yirik qishloq" },
      { slug: "elh-500", when: "~250 m³/soatgacha shahar uzeli" },
      { slug: "doz-500", when: "Eritmani tarmoqqa dozalash" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Pul jihatidan keltiriladigan gipoxloritdan nimasi yaxshi?",
        a: "Joyida 1 kg faol xlor tannarxi — tuz plyus elektr, bu yetkazib berish bilan tovar reagent narxidan bir necha barobar past. Obyekt yetkazib beruvchidan qancha uzoq bo‘lsa, stansiya shuncha tez o‘zini oqlaydi. Tarifingiz va sarfingizga aniq taqqoslashni tanlovda hisoblaymiz.",
      },
      {
        q: "Bu qanchalik xavfli? Axir bu xlor-ku.",
        a: "6–8 g/l eritma kam xavfli — tovar gipoxloritdan yigirma besh barobar past konsentratsiya. Na xlor rampasi, na ballonlar, na birinchi sinf kimyo ombori. Ikkita haqiqiy talab: vodorod tufayli ventilyatsiya va tuz-elektr xo‘jaliklarini ajratish. Ikkalasi stansiya konstruksiyasi bilan yopilgan.",
      },
      {
        q: "Stansiyaning o‘ziga qanday suv kerak?",
        a: "Namakob tayyorlash uchun yumshatilgan suv — yumshatgich sxemaga kiradi va suvingiz tahlili bo‘yicha tanlanadi. Stansiyaning o‘z ehtiyoji katta emas: 1 kg faol xlorga taxminan 120–150 litr.",
      },
      {
        q: "Elektr o‘chsa — qishloq zararsizlantirishsizmi?",
        a: "Yo‘q: stansiya eritmani sakkiz soatlik ishga mo‘ljallangan to‘plash bakiga tayyorlab qo‘yadi. Dozalash nasoslari vatt iste’mol qiladi va zaxira ta’minotga oson o‘tkaziladi. Muntazam uzilishlarda kattaroq bak qo‘yamiz.",
      },
      {
        q: "Sanitariya xizmati bilan kim kelishadi?",
        a: "Sxema, doza hisobi va qoldiq xlor nazorat nuqtalarini yetkazib berish tarkibida rasmiylashtiramiz. Chiqishdagi qoldiq xlor nazorat asbobi — uzelning majburiy qismi va u spetsifikatsiyada bor.",
      },
    ],
    allTitle: "ЭЛХ VA ДОЗ LINIYALARI",
    allButton: "MODELLARNI KO‘RISH",
    allHref: "/products#chlorinators",
    ctaTitle: "Suv sarfi va qattiqlik\ntahlilini yuboring.",
    ctaText:
      "Sarf, suv vazifasi va tahlil. Doza, yumshatgichli stansiya modeli, xonaga talablar va keltiriladigan reagent bilan narx taqqoslashini qaytaramiz.",
    ctaButton: "TANLOVNI OLISH",
  },

  en: {
    label: "WATER DISINFECTION",
    title: "Chlorinating a settlement's water:\nsalt instead of trucked chemicals.",
    intro:
      "A well, an intake, a storage reservoir of a settlement or a plant — water is disinfected before it reaches people, and that is a sanitary requirement, not a preference. How an on-site electrolysis station differs from trucked hypochlorite, and how the dose is calculated.",
    sections: [
      {
        title: "Three ways to chlorinate — and their problems",
        text: [
          "Trucked 19 % hypochlorite works, but lives from delivery to delivery: it decomposes in heat, needs a chemical store and special transport, and its price and availability belong to the supplier. For a remote settlement a missed delivery means undisinfected water.",
          "Bleaching lime is literally the last century: unstable dosing, sludge, manual labour. Sanitary authorities are steadily moving away from it.",
          "An electrolysis station makes hypochlorite on site from salt and electricity: 3.2 kg of salt and 4.5 kWh per kilogram of active chlorine. The 6–8 g/l solution is low-hazard, no chemical store is needed, and the 'reagent stock' is bags of salt that do not spoil. This is why waterworks are converting their disinfection units to electrolysis.",
        ],
      },
      {
        title: "How the station is sized and what we supply",
        text: [
          "The chlorine dose for drinking water is 1–3 mg/l depending on raw quality and network length; for treated effluent before discharge, 3–10 mg/l. Station output in g/h = dose × water flow in m³/h. A settlement at 50 m³/h and 2 mg/l needs a 100 g/h station: an ELH-100.",
          "A mandatory part of the scheme is softening ahead of the cell: on Uzbekistan's hard water an unsoftened cell scales up with carbonate within weeks. The second mandatory part is room ventilation, because electrolysis releases hydrogen. Both are in our selection by default, not discovered after installation.",
          "We build the station whole: the frame, salt and solution tanks, pipework and cabinet are ours; the electrolytic cell and rectifier are bought-in units with datasheets. Dosing into the network is by DOZ stations with two pumps — duty and standby, because disinfection must not stop.",
        ],
      },
    ],
    pickTitle: "Selection by water flow",
    pickText:
      "Guides at a 2 mg/l drinking-water dose. The exact selection follows from the water analysis and the actual consumption profile.",
    picks: [
      { slug: "elh-25", when: "Well up to ~12 m³/h" },
      { slug: "elh-50", when: "Intake up to ~25 m³/h" },
      { slug: "elh-100", when: "Settlement up to ~50 m³/h" },
      { slug: "elh-250", when: "Large settlement, up to ~125 m³/h" },
      { slug: "elh-500", when: "Urban unit, up to ~250 m³/h" },
      { slug: "doz-500", when: "Dosing the solution into the network" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "How is it cheaper than trucked hypochlorite?",
        a: "The on-site cost of a kilogram of active chlorine is salt plus electricity — several times below the delivered price of commercial reagent. The further the site from the supplier, the faster the payback. We calculate the exact comparison for your tariff and flow in the selection — figures, not slogans.",
      },
      {
        q: "How dangerous is it? It is chlorine, after all.",
        a: "The 6–8 g/l solution is low-hazard — twenty-five times weaker than commercial hypochlorite. No chlorine manifold, no cylinders, no class-one chemical store. Two real safety requirements remain: room ventilation for hydrogen and separation of the salt and electrical sides. Both are closed by the station design.",
      },
      {
        q: "What water does the station itself need?",
        a: "Softened water for brine — the softener is part of the scheme and is selected from your water analysis. The station's own consumption is small: about 120–150 litres per kilogram of active chlorine.",
      },
      {
        q: "Power cut — is the settlement left without disinfection?",
        a: "No: the station accumulates solution in a storage tank sized for eight hours of operation, and the dosing pumps draw watts and switch to backup supply easily. For frequent outages we size a larger tank — say so at selection.",
      },
      {
        q: "Who clears it with the sanitary authority?",
        a: "The scheme, the dose calculation and the residual-chlorine control points are prepared by us as part of the supply. The residual chlorine analyser at the outlet is a mandatory part of the unit — it is in the specification, not a 'buy later'.",
      },
    ],
    allTitle: "THE ELH AND DOZ LINES",
    allButton: "VIEW THE MODELS",
    allHref: "/products#chlorinators",
    ctaTitle: "Send the water flow\nand a hardness analysis.",
    ctaText:
      "The flow, the duty of the water and the analysis. We return the dose, the station with its softener, the room requirements and a cost comparison with trucked reagent.",
    ctaButton: "GET A SELECTION",
  },

  zh: {
    label: "饮水消毒",
    title: "村镇供水加氯：\n用盐代替外购药剂。",
    intro:
      "水井、取水口、村镇或企业的储水池——供水前必须消毒，这是卫生规范的要求。现场电解制氯与外购次氯酸钠有何不同、投加量如何计算。",
    sections: [
      {
        title: "三种加氯方式及各自的问题",
        text: [
          "外购 19% 次氯酸钠可行，但受制于供货周期：药剂遇热分解、需要化学品仓库和专用运输，价格与供应掌握在供应商手里。偏远村镇一次断供就意味着未消毒的水。",
          "漂白粉是名副其实的上个世纪：剂量不稳、有残渣、依赖人工。卫生部门正在有计划地淘汰它。",
          "电解站用食盐和电在现场制取次氯酸钠：每公斤有效氯耗盐 3,2 kg、耗电 4,5 kWh。6–8 g/l 溶液属低危险品，无需化学品库，'药剂储备'就是不会变质的盐袋。这正是各地水司把消毒节点改造为电解的原因。",
        ],
      },
      {
        title: "装置如何选型、我们供什么",
        text: [
          "饮用水有效氯剂量按原水质量和管网长度取 1–3 mg/l；处理后污水排放前取 3–10 mg/l。装置产量 g/h = 剂量 × 水量 m³/h。50 m³/h、2 mg/l 的村镇对应 100 g/h 装置：ЭЛХ-100。",
          "方案的强制组成之一是电解槽前软化：乌兹别克斯坦的硬水下，无软化的电解槽数周内被碳酸盐覆盖。第二是机房通风，因为电解析出氢气。两项均默认包含在选型中，而不是安装后才发现。",
          "装置整体由我们制造：机架、盐箱与溶液箱、管路、控制柜为自产；电解槽和整流器为附文件的外购件。向管网投加由双泵 ДОЗ 装置完成——一用一备，因为消毒不允许中断。",
        ],
      },
    ],
    pickTitle: "按水量选型",
    pickText: "按饮用水 2 mg/l 剂量给出参考。精确选型依据水质分析和实际用水曲线。",
    picks: [
      { slug: "elh-25", when: "约 12 m³/h 以内水井" },
      { slug: "elh-50", when: "约 25 m³/h 以内取水口" },
      { slug: "elh-100", when: "约 50 m³/h 以内村镇" },
      { slug: "elh-250", when: "约 125 m³/h 以内大型村镇" },
      { slug: "elh-500", when: "约 250 m³/h 以内城市节点" },
      { slug: "doz-500", when: "向管网投加溶液" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "比外购次氯酸钠省在哪里？",
        a: "现场每公斤有效氯的成本就是盐加电——比含运费的商品药剂低数倍。离供应商越远，回收期越短。按您的电价和水量的精确对比在选型时计算——用数字，不用口号。",
      },
      {
        q: "危险吗？毕竟是氯。",
        a: "6–8 g/l 溶液属低危险品——比商品次氯酸钠稀二十五倍。无氯气瓶组、无一类化学品库。真正的安全要求有两条：因氢气而设的机房通风、盐区与电气区分离。两条都由装置结构解决。",
      },
      {
        q: "装置本身需要什么水？",
        a: "配制盐水需软化水——软化器包含在方案内并按您的水质选型。自耗水量不大：每公斤有效氯约 120–150 升。",
      },
      {
        q: "停电了，村镇就没消毒了？",
        a: "不会：装置向按八小时运行配置的储液箱制备溶液，计量泵功耗仅数十瓦，易转备用电源。经常停电的场合配更大的箱体——选型时请说明。",
      },
      {
        q: "谁去和卫生部门协调？",
        a: "方案、剂量计算和余氯监测点由我们随供货整理成文。出水余氯监测仪是节点的强制组成——它列在设备表里，而不是'以后再买'。",
      },
    ],
    allTitle: "ЭЛХ 与 ДОЗ 系列",
    allButton: "查看型号",
    allHref: "/products#chlorinators",
    ctaTitle: "发来水量\n和硬度分析。",
    ctaText: "水量、用途和分析。我们将返回剂量、带软化器的装置型号、机房要求和与外购药剂的成本对比。",
    ctaButton: "获取选型",
  },
};

export default content;
