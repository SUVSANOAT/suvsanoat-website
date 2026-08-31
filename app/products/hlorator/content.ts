import type { LineContentSet } from "../lineTypes";

/**
 * Страница модельного ряда «Электролизные хлораторы ЭЛХ».
 *
 * Собирает кластер: «хлоратор», «хлораторная установка»,
 * «электролизная установка», «генератор гипохлорита натрия»,
 * «установка получения гипохлорита натрия», «обеззараживание воды»,
 * «xlorator», «natriy gipoxlorit qurilmasi»,
 * «sodium hypochlorite generator».
 *
 * Все цифры — из app/products/data.ts (производительность моделей,
 * расход соли, концентрация раствора, запас бака). Ничего сверх.
 */

const content: LineContentSet = {
  ru: {
    label: "ЭЛЕКТРОЛИЗНЫЕ ХЛОРАТОРЫ ЭЛХ",
    title: "Хлораторы: гипохлорит\nнатрия на объекте.",
    intro:
      "Электролизная установка получает раствор гипохлорита натрия прямо на объекте — из поваренной соли и воды. Ряд ЭЛХ-10…ЭЛХ-1000: от 10 до 1000 граммов активного хлора в час. Ни хлор-газа, ни складов привозного концентрата. Станцию собираем в Ташкенте.",
    sections: [
      {
        title: "Что делает электролизный хлоратор",
        text: [
          "Обеззараживать воду гипохлоритом натрия можно двумя способами. Первый — возить товарный раствор в канистрах: его нужно где-то хранить, переливать, соблюдать правила обращения с реагентом, а при хранении раствор постепенно теряет активность, и реальная доза уходит от расчётной. Второй — получать раствор на месте по мере надобности.",
          "Электролизный хлоратор делает именно это: подготовленная вода и обычная поваренная соль проходят через электролизную ячейку, на выходе — раствор с концентрацией 6–8 г/л активного хлора, который накапливается в баке и оттуда дозируется в воду. На объекте не появляется ни хлор-газа с его требованиями к помещению и аварийным мероприятиям, ни склада концентрированного реагента: расходный материал — соль в мешках, её можно купить где угодно и хранить без специальных условий.",
          "Где это работает: питьевая вода посёлка, махалли, скважины и водозабора; техническая вода на производстве; обеззараживание очищенного стока перед сбросом в водоём или подачей на полив; бассейны, где наработка на месте заменяет закупку реагента.",
        ],
      },
      {
        title: "Как подбирается установка",
        text: [
          "Отправная точка — расход обрабатываемой воды и требуемая доза активного хлора. Перемножив их, получаем потребность в активном хлоре за час — именно поэтому производительность хлоратора измеряется в граммах активного хлора в час, и именно по ней построен ряд ЭЛХ-10…ЭЛХ-1000. Доза не берётся с потолка: она зависит от качества исходной воды, хлорпоглощаемости и того, какой остаточный хлор нужно удержать в дальней точке сети.",
          "Дальше учитывается неравномерность: водопотребление посёлка ходит пиками, а установка работает ровно, поэтому между ней и сетью стоит накопительная ёмкость раствора — в наших моделях бак рассчитан на восемь часов непрерывной работы. Смотрим также воду на электролиз и её подготовку, расход соли, точку ввода и участок перемешивания перед ней.",
          "В поток раствор подаёт насос-дозатор — пропорционально расходу воды либо, если нужно держать заданный остаточный хлор, по сигналу анализатора. Пришлите расход и данные по воде — вернём подбор типоразмера, состав станции и коммерческое предложение.",
        ],
      },
      {
        title: "Состав установки и эксплуатация",
        text: [
          "Станция состоит из электролизной ячейки, выпрямителя, бака-сатуратора соли, накопительного бака раствора, насоса-дозатора, обвязки с арматурой и пробоотборниками и шкафа автоматики. Электролизные ячейки, выпрямители и насосы-дозаторы — покупные узлы проверенных производителей, их паспорта передаются вместе с изделием; рама, шкаф, баки, обвязка и сборка станции — наши.",
          "При электролизе на катоде выделяется водород, поэтому установка требует внимания к вентиляции: помещение и накопительные ёмкости вентилируются, минимальный расход вентиляции для каждого типоразмера указан в таблице характеристик. Помещение обычно выделяют отдельное — с приточно-вытяжной вентиляцией, электропитанием и подводом воды; в нём же удобно держать запас соли.",
          "Эксплуатация несложная, но регулярная. Ячейка периодически промывается от солевых отложений — от этого зависит выход по току и ресурс электродов. Соль нужна чистая, без противослёживающих добавок и посторонних примесей: грязная соль осаждается на электродах и забивает обвязку. И третье — контроль: остаточный хлор в сети измеряется регулярно, иначе неизвестно, какая доза реально доходит до потребителя.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Чем электролизная установка лучше привозного гипохлорита и хлор-газа?",
        a: "Привозной товарный гипохлорит нужно закупать, возить, хранить и списывать по мере падения активности — раствор стареет, и доза плывёт. Хлор-газ требует отдельного обращения с баллонами и соответствующих мероприятий по безопасности. Электролизная установка производит раствор 6–8 г/л на месте и ровно столько, сколько нужно: на объекте остаётся только соль и вода. Взамен появляются свои заботы — электроэнергия, вентиляция и обслуживание ячейки.",
      },
      {
        q: "Сколько уходит соли?",
        a: "Расчёт ведётся от активного хлора: 3,2 кг соли на килограмм активного хлора. Суточный расход соли для каждого типоразмера приведён в таблице характеристик — от ЭЛХ-10 до ЭЛХ-1000. Соль — обычная поваренная, но чистая: без противослёживающих добавок и нерастворимых примесей.",
      },
      {
        q: "Какую производительность выбрать?",
        a: "Она считается от расхода обрабатываемой воды и требуемой дозы активного хлора, с учётом неравномерности потребления и запаса на пики. Пришлите расход воды (суточный и максимальный часовой), данные анализа воды и точку ввода — вернём подбор типоразмера из ряда ЭЛХ и обоснование.",
      },
      {
        q: "Нужна ли отдельная комната и вентиляция?",
        a: "Вентиляция нужна обязательно: при электролизе выделяется водород, поэтому помещение и накопительные ёмкости вентилируются, а минимальный расход вентиляции для каждой модели указан в характеристиках. Обычно под установку выделяют отдельное помещение с приточно-вытяжной вентиляцией, электропитанием, подводом воды и местом под запас соли. Габариты рамы и массу берите из таблицы — по ним и планируется помещение.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Паспорт изделия, руководство по эксплуатации и регламент обслуживания, схему установки и обвязки, а также паспорта покупных узлов — электролизной ячейки, выпрямителя и насоса-дозатора. Подбор типоразмера с расчётом передаём вместе с коммерческим предложением, его можно показать проектировщику.",
      },
    ],
    ctaTitle: "Пришлите расход воды —\nвернём подбор хлоратора.",
    ctaText:
      "Расход обрабатываемой воды, анализ воды или требуемая доза, куда идёт вода — питьевая сеть, техническая или очищенный сток. Вернём типоразмер из ряда ЭЛХ, состав станции и коммерческое предложение. Производство — Ташкент.",
    ctaButton: "ЗАПРОСИТЬ ПОДБОР",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/stantsiya-dozirovaniya", label: "Станции дозирования" },
        { href: "/products/los-bio", label: "ЛОС БИО" },
        { href: "/solutions/disinfection", label: "Обеззараживание воды посёлка" },
        { href: "/catalog/water-treatment", label: "Водоподготовка" },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "ELEKTROLIZ XLORATORLARI ELX",
    title: "Xloratorlar: obyektda\nnatriy gipoxlorit.",
    intro:
      "Elektroliz qurilmasi natriy gipoxlorit eritmasini obyektning o‘zida — osh tuzi va suvdan oladi. ELX-10…ELX-1000 qatori: soatiga 10 dan 1000 grammgacha faol xlor. Na xlor-gaz, na keltiriladigan konsentrat ombori. Stansiyani Toshkentda yig‘amiz.",
    sections: [
      {
        title: "Elektroliz xloratori nima qiladi",
        text: [
          "Suvni natriy gipoxlorit bilan zararsizlantirishning ikki yo‘li bor. Birinchisi — tovar eritmani kanistrlarda tashish: uni saqlash, quyish, reagent bilan ishlash qoidalariga rioya qilish kerak, saqlash davomida esa eritma faolligini yo‘qotadi va haqiqiy doza hisobdan chetlashadi. Ikkinchisi — eritmani kerak bo‘lganda joyning o‘zida olish.",
          "Elektroliz xloratori aynan shuni qiladi: tayyorlangan suv va oddiy osh tuzi elektroliz yacheykasidan o‘tadi, chiqishda 6–8 g/l faol xlorli eritma hosil bo‘ladi, u bakka to‘planadi va u yerdan suvga dozalanadi. Obyektda na xlor-gaz, na konsentrat ombori bo‘ladi: sarf materiali — qopdagi tuz, uni istalgan joydan olish va maxsus shartsiz saqlash mumkin.",
          "Qayerda ishlaydi: qishloq va mahalla ichimlik suvi, quduq va suv olish inshooti; ishlab chiqarishdagi texnik suv; tozalangan oqavani suv havzasiga tashlashdan yoki sug‘orishga berishdan oldin zararsizlantirish; basseynlar — u yerda joyida tayyorlash reagent sotib olish o‘rnini bosadi.",
        ],
      },
      {
        title: "Qurilma qanday tanlanadi",
        text: [
          "Boshlang‘ich nuqta — ishlanadigan suv sarfi va talab qilinadigan faol xlor dozasi. Ularning ko‘paytmasi soatiga qancha faol xlor kerakligini beradi — shuning uchun xlorator unumdorligi soatiga gramm faol xlorda o‘lchanadi va ELX-10…ELX-1000 qatori shunga qurilgan. Doza esa dastlabki suv sifati, xlor yutilishi va tarmoqning uzoq nuqtasida qanday qoldiq xlor ushlab turilishi kerakligiga bog‘liq.",
          "Keyin notekislik hisobga olinadi: qishloq suv iste’moli cho‘qqilar bilan yuradi, qurilma esa tekis ishlaydi, shuning uchun oralig‘ida eritma to‘plovchi baki turadi — bizning modellarda bak sakkiz soatlik uzluksiz ishga mo‘ljallangan. Shuningdek elektroliz uchun suv qayerdan olinishi va qanday tayyorlanishi, tuz sarfi, kiritish nuqtasi va undan oldin aralashish uchun joy borligi ko‘riladi.",
          "Eritmani oqimga nasos-dozator beradi — suv sarfiga mutanosib ravishda yoki, qoldiq xlorni ushlab turish kerak bo‘lsa, analizator signali bo‘yicha. Sarf va suv ma’lumotlarini yuboring — o‘lcham tanlovi, stansiya tarkibi va tijorat taklifini qaytaramiz.",
        ],
      },
      {
        title: "Qurilma tarkibi va ekspluatatsiya",
        text: [
          "Stansiya elektroliz yacheykasi, to‘g‘rilagich, tuz saturator baki, eritma to‘plovchi baki, nasos-dozator, armatura va namuna olgichli quvur ulanishi hamda avtomatika shkafidan iborat. Elektroliz yacheykalari, to‘g‘rilagichlar va nasos-dozatorlar — ishonchli ishlab chiqaruvchilarning sotib olinadigan uzellari, pasportlari mahsulot bilan beriladi; rama, shkaf, baklar, obvyazka va yig‘ish — bizniki.",
          "Elektroliz vaqtida katodda vodorod ajraladi, shuning uchun ventilyatsiyaga alohida e’tibor kerak: xona va to‘plovchi baklar shamollatiladi, har bir o‘lcham uchun eng kam ventilyatsiya sarfi tavsiflar jadvalida ko‘rsatilgan. Odatda alohida xona ajratiladi — kirish-chiqish ventilyatsiyasi, elektr ta’minoti va suv liniyasi bilan; tuz zaxirasini ham shu yerda saqlash qulay.",
          "Ekspluatatsiya murakkab emas, lekin muntazam. Yacheyka vaqti-vaqti bilan tuz qoldiqlaridan yuviladi — tok bo‘yicha unum va elektrodlar resursi bevosita shunga bog‘liq. Tuz toza bo‘lishi kerak, yopishmaslikka qarshi qo‘shimchalar va begona aralashmalarsiz. Uchinchisi — nazorat: tarmoqdagi qoldiq xlor muntazam o‘lchanadi, aks holda iste’molchiga qanday doza yetib borayotgani noma’lum qoladi.",
        ],
      },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Elektroliz qurilmasi keltiriladigan gipoxlorit va xlor-gazdan nimasi bilan yaxshi?",
        a: "Tovar gipoxloritni sotib olish, tashish, saqlash va faolligi tushgani sari hisobdan chiqarish kerak — eritma eskiradi, doza suriladi. Xlor-gaz ballonlar bilan alohida muomala va xavfsizlik tadbirlarini talab qiladi. Elektroliz qurilmasi esa 6–8 g/l eritmani joyida va aynan kerakligicha ishlab chiqaradi: obyektda faqat tuz va suv qoladi. Evaziga o‘z tashvishlari paydo bo‘ladi — elektr energiyasi, ventilyatsiya va yacheykaga xizmat.",
      },
      {
        q: "Tuz qancha sarflanadi?",
        a: "Hisob faol xlordan yuritiladi: 1 kg faol xlorga 3,2 kg tuz. Har bir o‘lcham uchun sutkalik tuz sarfi tavsiflar jadvalida keltirilgan — ELX-10 dan ELX-1000 gacha. Tuz oddiy osh tuzi, lekin toza: qo‘shimchalar va erimaydigan aralashmalarsiz.",
      },
      {
        q: "Qaysi unumdorlikni tanlash kerak?",
        a: "U ishlanadigan suv sarfi va talab qilinadigan faol xlor dozasidan, notekislik va cho‘qqilarga zaxira bilan hisoblanadi. O‘xshatib taxmin qilish yaramaydi: suv sarfini (sutkalik va maksimal soatlik), suv tahlili va kiritish nuqtasini yuboring — ELX qatoridan o‘lcham tanlovi va asosini qaytaramiz.",
      },
      {
        q: "Alohida xona va ventilyatsiya kerakmi?",
        a: "Ventilyatsiya albatta kerak: elektrolizda vodorod ajraladi, shuning uchun xona va to‘plovchi baklar shamollatiladi, har bir model uchun eng kam ventilyatsiya sarfi tavsiflarda ko‘rsatilgan. Odatda qurilma uchun alohida xona ajratiladi — kirish-chiqish ventilyatsiyasi, elektr ta’minoti, suv liniyasi va tuz zaxirasi uchun joy bilan. Rama gabaritlari va massani jadvaldan oling — xona shunga qarab rejalashtiriladi.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "Mahsulot pasporti, ekspluatatsiya qo‘llanmasi va xizmat reglamenti, o‘rnatish va obvyazka sxemasi, shuningdek sotib olingan uzellar — elektroliz yacheykasi, to‘g‘rilagich va nasos-dozator pasportlari. O‘lcham tanlovini hisobi bilan tijorat taklifi qatorida beramiz, uni loyihachiga ko‘rsatish mumkin.",
      },
    ],
    ctaTitle: "Suv sarfini yuboring —\nxlorator tanlovini qaytaramiz.",
    ctaText:
      "Ishlanadigan suv sarfi, suv tahlili yoki talab qilinadigan doza, suv qayerga ketadi — ichimlik tarmog‘i, texnik suv yoki tozalangan oqava. ELX qatoridan o‘lcham, stansiya tarkibi va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "TANLOVNI SO‘RASH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/stantsiya-dozirovaniya", label: "Dozalash stansiyalari" },
        { href: "/products/los-bio", label: "LOS BIO" },
        { href: "/solutions/disinfection", label: "Qishloq suvini zararsizlantirish" },
        { href: "/catalog/water-treatment", label: "Suv tayyorlash" },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "ELECTROLYTIC CHLORINATORS ELH",
    title: "Chlorinators: hypochlorite\nmade on site.",
    intro:
      "An electrolytic unit produces sodium hypochlorite solution on site from common salt and water. The ELH-10…ELH-1000 range covers 10 to 1000 grams of active chlorine per hour. No chlorine gas, no concentrate storage. Assembled in Tashkent.",
    sections: [
      {
        title: "What an electrolytic chlorinator does",
        text: [
          "Commercial hypochlorite has to be bought, trucked, stored and handled — and it loses strength in storage, so the real dose drifts away from the calculated one. The alternative is to make the solution on site, as it is needed.",
          "Salt and prepared water pass through an electrolytic cell; the output is a solution of 6–8 g/l active chlorine that collects in a tank and is dosed into the water from there. The site keeps no chlorine gas and no chemical store — the only consumable is bagged salt.",
          "Typical duties: drinking water for a settlement, a well or an intake; process water; disinfection of treated effluent before discharge or irrigation reuse; swimming pools.",
        ],
      },
      {
        title: "How a unit is selected",
        text: [
          "Selection starts from the treated water flow and the required active chlorine dose — their product is the hourly demand for active chlorine, which is why capacity is stated in grams of active chlorine per hour and why the range runs ELH-10 to ELH-1000. The dose itself follows raw water quality, chlorine demand and the residual to be held at the far end of the network.",
          "Demand is uneven while the unit runs steadily, so a solution storage tank sits between them — in our models it holds eight hours of continuous output. We also check the water fed to the cell, salt consumption, the injection point and the mixing length ahead of it.",
          "A dosing pump injects the solution into the flow, proportional to water flow or, where a residual must be held, controlled from an analyser signal. Send the flow and the water data and we return a size, a station scope and a quotation.",
        ],
      },
      {
        title: "Scope of supply and operation",
        text: [
          "The station comprises the electrolytic cell, the rectifier, the salt saturator, the solution storage tank, the dosing pump, pipework with valves and sampling points, and the control cabinet. Cells, rectifiers and dosing pumps are bought-in units supplied with their datasheets; the frame, cabinet, tanks, pipework and assembly are ours.",
          "Electrolysis releases hydrogen at the cathode, so ventilation matters: the room and the storage tanks are ventilated, and the minimum ventilation rate for each size is given in the data table. A dedicated room with supply and exhaust ventilation, power, a water supply and space for salt is the usual arrangement.",
          "Operation is simple but regular: the cell is periodically washed free of deposits, which governs current efficiency and electrode life; the salt must be clean, without anti-caking additives or insoluble matter; and the residual chlorine in the network is measured routinely.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Why is on-site generation better than trucked hypochlorite or chlorine gas?",
        a: "Trucked hypochlorite ages in storage, so the dose drifts and stock has to be written off; chlorine gas brings cylinder handling and its own safety measures. An electrolytic unit makes 6–8 g/l solution on site, only as much as is needed — the site keeps salt and water. In exchange it needs electricity, ventilation and cell maintenance.",
      },
      {
        q: "How much salt does it use?",
        a: "3.2 kg of salt per kilogram of active chlorine. Daily salt consumption for every size, ELH-10 to ELH-1000, is listed in the data table. Ordinary salt is fine, provided it is clean — no anti-caking additives, no insoluble matter.",
      },
      {
        q: "Which capacity should I choose?",
        a: "It follows from the treated water flow and the required active chlorine dose, with an allowance for peaks. Send the daily and peak hourly flow, a water analysis and the injection point — we return a size from the ELH range with the reasoning behind it.",
      },
      {
        q: "Does it need a separate room and ventilation?",
        a: "Ventilation is mandatory: electrolysis releases hydrogen, so the room and the tanks are ventilated and the minimum rate per model is given in the data. A dedicated room with supply and exhaust ventilation, power, water and salt storage is normal practice; plan it from the skid dimensions and mass in the table.",
      },
      {
        q: "What documents do you provide?",
        a: "Product passport, operation manual and maintenance schedule, installation and piping drawings, and the datasheets of the bought-in cell, rectifier and dosing pump. The sizing calculation comes with the quotation and can be shown to your designer.",
      },
    ],
    ctaTitle: "Send your flow —\nget a chlorinator selection.",
    ctaText:
      "Treated water flow, a water analysis or the required dose, and where the water goes — drinking network, process water or treated effluent. We return a size from the ELH range, the station scope and a quotation. Manufactured in Tashkent.",
    ctaButton: "REQUEST A SELECTION",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/stantsiya-dozirovaniya", label: "Dosing stations" },
        { href: "/products/los-bio", label: "Package plants" },
        { href: "/solutions/disinfection", label: "Water disinfection" },
        { href: "/catalog/water-treatment", label: "Water treatment" },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "电解加氯机 ELH",
    title: "加氯机：现场制取\n次氯酸钠。",
    intro:
      "电解装置用食盐和水在现场制取次氯酸钠溶液。ELH-10…ELH-1000 系列覆盖每小时 10 至 1000 克有效氯。无氯气，无药剂仓库。塔什干组装。",
    sections: [
      {
        title: "电解加氯机的作用",
        text: [
          "商品次氯酸钠需要采购、运输、储存和按规程操作，且储存中有效氯不断衰减，实际投加量偏离计算值。另一种做法是按需在现场制取。",
          "盐与经处理的水通过电解槽，产出有效氯 6–8 g/l 的溶液，储存于储液箱并由此投加。现场既无氯气，也无浓药剂仓库，唯一消耗品是袋装食盐。",
          "适用场合：村镇饮用水、水井与取水口；工艺用水；出水排放或回用灌溉前的消毒；游泳池。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "选型从处理水量和所需有效氯投加量出发，两者相乘即为每小时有效氯需求量——因此产能以每小时有效氯克数计，系列由 ELH-10 至 ELH-1000。投加量取决于原水水质、需氯量以及管网末端须保持的余氯。",
          "用水量有峰谷而装置连续稳定运行，故两者之间设储液箱：本系列储液箱按连续运行八小时配置。同时核对电解用水及其预处理、耗盐量、投加点及其前部混合段。",
          "计量泵将溶液投入水流，可按水量比例投加，或在需要保持余氯时由分析仪信号控制。提供水量与水质数据，我们回复规格、站体配置与报价。",
        ],
      },
      {
        title: "配置与运行维护",
        text: [
          "站体包括电解槽、整流器、饱和盐箱、储液箱、计量泵、带阀门和取样口的管路以及控制柜。电解槽、整流器与计量泵为外购件，随附技术文件；机架、控制柜、水箱、管路与整机组装为自制。",
          "电解在阴极析出氢气，因此通风是关键：房间与储液箱均需通风，各规格的最小通风量见参数表。通常设专用房间，配送排风、电源、给水以及存盐空间。",
          "维护简单但须定期：电解槽定期清洗结垢，直接影响电流效率与电极寿命；食盐须洁净，不含抗结块添加剂和不溶杂质；管网余氯须定期检测。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "与外购次氯酸钠、氯气相比有何优势？",
        a: "外购次氯酸钠在储存中衰减，投加量漂移且需报废处理；氯气则涉及钢瓶操作与相应安全措施。电解装置在现场按需制取 6–8 g/l 溶液，现场只需盐和水。代价是耗电、通风与电解槽维护。",
      },
      {
        q: "耗盐量是多少？",
        a: "每公斤有效氯耗盐 3,2 kg。ELH-10 至 ELH-1000 各规格的日耗盐量见参数表。普通食盐即可，但须洁净，不含抗结块添加剂和不溶杂质。",
      },
      {
        q: "如何选择产能？",
        a: "由处理水量与所需有效氯投加量计算，并留有峰值余量。请提供日水量与最大时水量、水质分析和投加点，我们回复 ELH 系列中的规格及选型依据。",
      },
      {
        q: "是否需要单独房间和通风？",
        a: "必须通风：电解析出氢气，房间与储液箱均需通风，各型号最小通风量见参数表。通常设专用房间，配送排风、电源、给水与存盐空间；按参数表中的撬体尺寸与重量规划房间。",
      },
      {
        q: "提供哪些文件？",
        a: "产品合格证、运行手册与维护规程、安装与管路图，以及外购电解槽、整流器和计量泵的技术文件。选型计算随报价提供，可交设计单位查阅。",
      },
    ],
    ctaTitle: "提供水量——\n我们回复加氯机选型。",
    ctaText:
      "处理水量、水质分析或所需投加量，以及水的去向：饮用水管网、工艺水或处理后出水。我们回复 ELH 系列规格、站体配置与报价。塔什干生产。",
    ctaButton: "索取选型",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/stantsiya-dozirovaniya", label: "加药站" },
        { href: "/products/los-bio", label: "一体化生物处理设备" },
        { href: "/solutions/disinfection", label: "供水消毒" },
        { href: "/catalog/water-treatment", label: "水处理" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
