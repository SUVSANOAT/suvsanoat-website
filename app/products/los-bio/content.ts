import type { LineContentSet } from "../lineTypes";

/**
 * Страница линейки «ЛОС БИО» — станции биологической очистки.
 * Самый конкурентный кластер сайта: «локальные очистные сооружения»,
 * «ЛОС», «станция биологической очистки», «очистные для дома,
 * посёлка, гостиницы», «lokal tozalash inshootlari»,
 * «package wastewater treatment plant».
 *
 * Все цифры — из app/products/data.ts (расход м³/сут, эквивалентное
 * число жителей). Проценты очистки нигде не называются: в данных их нет.
 */

const content: LineContentSet = {
  ru: {
    label: "ЛОС БИО · БИОЛОГИЧЕСКАЯ ОЧИСТКА",
    title: "Локальные очистные\nсооружения ЛОС БИО.",
    intro:
      "Локальные очистные сооружения — станции биологической очистки хозяйственно-бытовых стоков для объектов без городской канализации: частного дома, посёлка, гостиницы, базы отдыха, придорожного кафе. Ряд БИО-1…БИО-500 закрывает расход от 1 до 500 м³/сут, то есть от 5 до 2500 эквивалентных жителей. Корпуса — стеклопластик собственной намотки, производство в Ташкенте.",
    sections: [
      {
        title: "Что такое ЛОС и чем они отличаются от септика",
        text: [
          "Локальные очистные сооружения (ЛОС) — установка, которая очищает сток там, где он образуется, без подключения к городскому коллектору. Септик такой установкой не является: это проточный отстойник, где взвесь оседает, а жир всплывает. Растворённая органика почти не уходит, поэтому по БПК септик даёт лишь частичную очистку, и его выпуск всегда идёт в грунт — на поля фильтрации или в фильтрующий колодец.",
          "Станция биологической очистки работает иначе. В аэротенке живёт активный ил — сообщество микроорганизмов, которое окисляет растворённую органику; воздух подаёт воздуходувка через мелкопузырчатую систему аэрации. Во вторичном отстойнике ил отделяется от воды и возвращается обратно в аэротенк. Именно возврат ила держит его концентрацию и выводит сток на показатели, с которыми его принимает не только грунт.",
          "Куда девать очищенную воду — вопрос, который решается до подбора модели, а не после. Приёмников четыре: городской коллектор, сброс на рельеф или в водоём, полив и поглощающий колодец. Именно приёмник задаёт класс очистки и состав ступеней: где-то достаточно биологии, где-то к ней добавляется доочистка и обеззараживание. Условия запрашиваются у водоканала или природоохранного органа.",
        ],
      },
      {
        title: "Как подбирается станция",
        text: [
          "Первое — расход. Ряд построен по двум величинам: м³/сут и эквивалентное число жителей. БИО-1 — 1 м³/сут и 5 жителей, БИО-10 — 10 м³/сут и 50 жителей, БИО-50 — 50 м³/сут и 250 жителей, БИО-500 — 500 м³/сут и 2500 жителей. Для гостиницы и базы отдыха вместо жителей считают места, для вахтового посёлка — численность смены.",
          "Второе — неравномерность. Дом даёт ровный график, а гостиница, кафе, база отдыха и вахтовый посёлок дают пики: утро, вечер, заезд, конец смены. Пик гасит приёмно-усреднительная камера, и для таких объектов её объём считают отдельно. Сезонные объекты — разговор особый: ил не успевает нарасти к открытию, станцию выводят на режим заранее.",
          "Третье — площадка и требования на выходе. Отметка подводящего коллектора и глубина заложения определяют высоту корпуса и нужна ли перед станцией КНС; уровень грунтовых вод — анкеровку и расчёт на всплытие. Цепочка стандартная: приём и усреднение, аэротенк, вторичный отстойник с возвратом ила, при необходимости доочистка и обеззараживание. Считаем по КМК 2.04.03-19 и КМК 2.04.01-98; расчёт открытый — его можно передать проектировщику и в экспертизу.",
        ],
      },
      {
        title: "Конструкция, монтаж и эксплуатация",
        text: [
          "Корпус — стеклопластик собственной намотки с кольцами жёсткости; внутреннее зонирование формируется перегородками: приёмно-усреднительная камера, аэротенк, вторичный отстойник, стабилизатор избыточного ила. До 25 м³/сут это один корпус, выше — модульное исполнение из нескольких корпусов, что снимает вопрос перевозки негабарита.",
          "Воздуходувка, насосы и шкаф управления — покупные узлы, и их марки мы указываем в коммерческом предложении открыто: вы должны понимать, что обслуживать и где брать запчасти. Воздуходувка подбирается по расходу воздуха конкретной модели — он есть в таблице ряда ниже.",
          "После монтажа станция выходит на режим не сразу: активному илу нужно нарасти, и пока его мало, очистка неполная. Дальше эксплуатация сводится к регламенту — контроль воздуходувки и эрлифтов, осмотр, периодическое удаление избыточного ила из стабилизатора. Зимой корпус находится в грунте, а биологический процесс идёт с выделением тепла, поэтому при нормальном притоке станция работает круглый год без отдельного отопления.",
        ],
      },
    ],
    faqTitle: "Частые вопросы о ЛОС",
    faq: [
      {
        q: "Чем ЛОС лучше септика?",
        a: "Септик — отстойник: он задерживает взвесь и жир, но растворённую органику почти не убирает, поэтому по БПК очистка частичная, а выпуск возможен только в грунт. ЛОС с аэротенком и возвратом активного ила окисляет органику биологически и выводит сток на показатели, при которых уже можно согласовывать сброс в коллектор, на рельеф или использование на полив.",
      },
      {
        q: "Сколько стоит ЛОС?",
        a: "Стоимость зависит от расхода, глубины заложения корпуса, класса очистки и комплектации — воздуходувка, автоматика, обеззараживание. Поэтому мы не публикуем прайс, а считаем: пришлите тип объекта, расход или число жителей, куда идёт сброс и отметку коллектора — вернём модель ряда и предложение с ценой. Подбор и расчёт бесплатны.",
      },
      {
        q: "Что делать с очищенной водой?",
        a: "Вариантов четыре: городской коллектор, сброс на рельеф или в водоём, полив и поглощающий колодец. Выбор зависит от того, что доступно на площадке и что разрешает водоканал либо природоохранный орган. От приёмника зависит класс очистки, поэтому вопрос решается на этапе подбора, а не после монтажа.",
      },
      {
        q: "Можно ли использовать очищенную воду на полив?",
        a: "Схема распространена для посёлков, гостиниц и баз отдыха, но перед поливом воду нужно обеззараживать: после биологической ступени ставится обеззараживание, у нас это электролизные хлораторы ЭЛХ. Технически добавляются накопитель и насос подачи. Условия полива согласовываются с местными органами.",
      },
      {
        q: "Какие документы вы выдаёте для проектировщика и экспертизы?",
        a: "Технологический расчёт по КМК с исходными данными и ступенями очистки, паспорт изделия, схемы установки и присоединения, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания. Расчёт можно проверить и приложить к проекту.",
      },
    ],
    ctaTitle: "Опишите объект —\nподберём станцию.",
    ctaText:
      "Тип объекта, расход или число жителей, куда идёт сброс, отметка подводящего коллектора и уровень грунтовых вод. Вернём модель из ряда БИО, характеристики и коммерческое предложение с ценой. Производство — Ташкент.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/hlorator", label: "Хлораторы ЭЛХ" },
        { href: "/products/zhiroulovitel", label: "Жироуловители" },
        { href: "/solutions/kns", label: "КНС для дома и посёлка" },
        { href: "/solutions/private-house", label: "ЛОС для частного дома" },
        { href: "/solutions/hotel", label: "Очистные для гостиницы" },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "LOI BIO · BIOLOGIK TOZALASH",
    title: "Lokal tozalash\ninshootlari LOI BIO.",
    intro:
      "Lokal tozalash inshootlari — markaziy kanalizatsiyasi yo‘q obyektlar uchun maishiy oqavani biologik tozalash stansiyalari: xususiy uy, qishloq, mehmonxona, dam olish maskani, yo‘l bo‘yidagi kafe. BIO-1…BIO-500 qatori 1 dan 500 m³/sut gacha sarfni, ya’ni 5 dan 2500 nafargacha ekvivalent aholini qamrab oladi. Korpuslar — o‘z o‘ramimizdagi shishatolali plastik, ishlab chiqarish Toshkentda.",
    sections: [
      {
        title: "LOI nima va u septikdan nimasi bilan farq qiladi",
        text: [
          "Lokal tozalash inshooti (LOI) — oqavani shahar kollektoriga ulanmasdan, hosil bo‘lgan joyida tozalaydigan qurilma. Septik bunday qurilma emas: u oqim o‘tadigan cho‘ktirgich, unda muallaq zarralar cho‘kadi, yog‘ esa suzib chiqadi. Erigan organika suvdan deyarli ketmaydi, shuning uchun BPK bo‘yicha septik faqat qisman tozalaydi va uning chiqishi doim gruntga — filtratsiya maydonlariga yoki filtrlovchi quduqqa boradi.",
          "Biologik tozalash stansiyasi boshqacha ishlaydi. Aerotenkda faol il — erigan organikani oksidlaydigan mikroorganizmlar hamjamiyati yashaydi; havoni puflagich mayda pufakli aeratsiya tizimi orqali beradi. Ikkilamchi cho‘ktirgichda il suvdan ajraladi va yana aerotenkka qaytariladi. Aynan ilning qaytarilishi uning konsentratsiyasini ushlab turadi va oqavani faqat grunt emas, boshqa qabul qiluvchilar ham oladigan ko‘rsatkichlarga chiqaradi.",
          "Tozalangan suvni qayerga berish masalasi model tanlashdan keyin emas, undan oldin hal qilinadi. Qabul qiluvchilar to‘rtta: shahar kollektori, relyefga yoki suv havzasiga tashlash, sug‘orish va singdiruvchi quduq. Har birining o‘z talabi bor va aynan qabul qiluvchi kerakli tozalash darajasini hamda bosqichlar tarkibini belgilaydi: bir joyda biologiya yetadi, boshqasida qo‘shimcha tozalash va zararsizlantirish qo‘shiladi. Shartlar suv ta’minoti tashkiloti yoki mahalliy tabiatni muhofaza qilish organidan so‘raladi.",
        ],
      },
      {
        title: "Stansiya qanday tanlanadi",
        text: [
          "Birinchisi — sarf. Qator ikki kattalik bo‘yicha tuzilgan: m³/sut va ekvivalent aholi soni. BIO-1 — 1 m³/sut va 5 kishi, BIO-10 — 10 m³/sut va 50 kishi, BIO-50 — 50 m³/sut va 250 kishi, BIO-500 — 500 m³/sut va 2500 kishi. Mehmonxona va dam olish maskani uchun aholi o‘rniga o‘rinlar, vaxta qishlog‘i uchun smena soni hisoblanadi; obyekt allaqachon ishlayotgan bo‘lsa, eng yaxshi manba — haqiqiy suv sarfi.",
          "Ikkinchisi — notekislik. Uy bir tekis grafik beradi, mehmonxona, kafe, dam olish maskani va vaxta qishlog‘i esa cho‘qqilar beradi: ertalab, kechqurun, joylashuv, smena oxiri. Cho‘qqini qabul-tenglashtirish kamerasi so‘ndiradi, shuning uchun bunday obyektlar uchun uning hajmi alohida hisoblanadi. Yiliga bir necha oy ishlaydigan mavsumiy obyektlar alohida suhbat talab qiladi: il ochilishga ulgurib o‘smaydi, shuning uchun stansiya rejimga oldindan chiqariladi.",
          "Uchinchisi — maydoncha va chiqishdagi talablar. Keluvchi kollektor belgisi va ko‘mish chuqurligi korpus balandligini hamda stansiya oldida KNS kerakmi-yo‘qmi degan savolni hal qiladi; sizot suvlari sathi esa ankerlash va korpusning suzib chiqishga hisobini belgilaydi. Texnologik zanjir standart: qabul va tenglashtirish, aerotenk, il qaytarishli ikkilamchi cho‘ktirgich, zarur bo‘lsa qo‘shimcha tozalash va zararsizlantirish. Hisob KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha yuritiladi, u ochiq — loyihachiga va ekspertizaga berish mumkin.",
        ],
      },
      {
        title: "Konstruksiya, montaj va ekspluatatsiya",
        text: [
          "Korpus — qattiqlik halqali o‘z o‘ramimizdagi shishatolali plastik; ichki zonalar to‘siqlar bilan hosil qilinadi: qabul-tenglashtirish kamerasi, aerotenk, ikkilamchi cho‘ktirgich, ortiqcha il stabilizatori. 25 m³/sut gacha — bitta korpus, undan yuqorisi — bir necha korpusli modulli ishlanma, bu negabarit yukni tashish masalasini yechadi. Shishatolali plastik oqavada zanglamaydi, yaxlit qobiq choklardan oqmaydi.",
          "Havo puflagich, nasoslar va boshqaruv shkafi — sotib olinadigan uzellar. Ularning markalarini tijorat taklifida ochiq yozamiz: nimani xizmat ko‘rsatish va ehtiyot qismni qayerdan olishni bilishingiz kerak. Puflagich aniq modelning havo sarfi bo‘yicha tanlanadi — u quyidagi qator jadvalida aerotenk hajmi va quvvat bilan birga keltirilgan.",
          "Montajdan keyin stansiya rejimga darrov chiqmaydi: faol ilning o‘sishi uchun vaqt kerak, il kam bo‘lgan davrda tozalash to‘liq emas. Keyin ekspluatatsiya reglamentga keladi — puflagich va erliftlar ishini nazorat qilish, ko‘zdan kechirish, stabilizatordan ortiqcha ilni davriy chiqarib turish. Qishda korpus grunt ichida bo‘ladi, biologik jarayon esa issiqlik ajratib boradi, shuning uchun stansiya yil bo‘yi ishlaydi; oqim me’yorida bo‘lsa, yer osti korpusiga alohida isitish kerak emas.",
        ],
      },
    ],
    faqTitle: "LOI haqida ko‘p beriladigan savollar",
    faq: [
      {
        q: "LOI septikdan nimasi bilan ustun?",
        a: "Septik — cho‘ktirgich: u muallaq zarralar va yog‘ni ushlaydi, lekin erigan organikani deyarli olib tashlamaydi, shuning uchun BPK bo‘yicha tozalash qisman va chiqish faqat gruntga — filtratsiya maydoni yoki filtrlovchi quduq orqali mumkin. Aerotenkli va il qaytarishli LOI organikani biologik yo‘l bilan oksidlaydi va oqavani kollektorga, relyefga tashlash yoki sug‘orishda ishlatishni kelishish mumkin bo‘lgan ko‘rsatkichlarga chiqaradi.",
      },
      {
        q: "LOI qancha turadi?",
        a: "Qiymat sarfga, korpusning ko‘mish chuqurligiga, talab qilinadigan tozalash darajasiga va komplektatsiyaga — puflagich, avtomatika, zararsizlantirish — bog‘liq. Shuning uchun prays e’lon qilmaymiz, balki hisoblaymiz: obyekt turini, sarf yoki aholi sonini, oqava qayerga ketishini va keluvchi kollektor belgisini yuboring — qatordan aniq modelni va narx bilan tijorat taklifini qaytaramiz. Tanlov va hisob bepul.",
      },
      {
        q: "Tozalangan suvni nima qilish kerak?",
        a: "To‘rtta variant: shahar kollektori, relyefga yoki suv havzasiga tashlash, sug‘orish va singdiruvchi quduq. Tanlov maydonchada nima mavjudligiga va suv ta’minoti tashkiloti yoki tabiatni muhofaza qilish organi nimaga ruxsat berishiga bog‘liq. Kerakli tozalash darajasi qabul qiluvchiga bog‘liq, shuning uchun masala montajdan keyin emas, tanlov bosqichida hal qilinadi.",
      },
      {
        q: "Tozalangan suvni sug‘orishda ishlatsa bo‘ladimi?",
        a: "Bunday sxema qishloqlar, mehmonxona va dam olish maskanlari uchun keng tarqalgan, lekin sug‘orishdan oldin suvni zararsizlantirish kerak — biologik bosqichdan keyin zararsizlantirish qo‘yiladi, bizda bu ELX elektroliz xloratorlari. Texnik jihatdan stansiyaga to‘plagich va uzatuvchi nasos qo‘shiladi. Sug‘orish shartlari mahalliy organlar bilan kelishiladi.",
      },
      {
        q: "Loyihachi va ekspertiza uchun qanday hujjatlar berasiz?",
        a: "Boshlang‘ich ma’lumotlar va tozalash bosqichlari bilan KMK bo‘yicha texnologik hisob, mahsulot pasporti, o‘rnatish va ulash sxemalari, korpusning grunt yuklari va suzib chiqishga hisobi, ekspluatatsiya qo‘llanmasi va xizmat reglamenti. Hisob ochiq: uni tekshirish va loyihaga ilova qilish mumkin.",
      },
    ],
    ctaTitle: "Obyektni tasvirlang —\nstansiyani tanlaymiz.",
    ctaText:
      "Obyekt turi, sarf yoki aholi soni, oqava qayerga ketadi, keluvchi kollektor belgisi va sizot suvlari sathi. BIO qatoridan modelni, xususiyatlarni va narx bilan tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "TANLOVNI OLISH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/hlorator", label: "Xloratorlar ELX" },
        { href: "/products/zhiroulovitel", label: "Yog‘ tutgichlar" },
        { href: "/solutions/kns", label: "Uy va qishloq uchun KNS" },
        { href: "/solutions/private-house", label: "Xususiy uy uchun LOI" },
        { href: "/solutions/hotel", label: "Mehmonxona uchun tozalash" },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "BIO PACKAGE PLANTS",
    title: "Package wastewater\ntreatment plants.",
    intro:
      "Package plants treat domestic wastewater on site, where there is no municipal sewer: a house, a settlement, a hotel, a resort, a roadside cafe. The BIO-1…BIO-500 range covers 1 to 500 m³/day, that is 5 to 2500 population equivalent. Filament-wound fiberglass shells, manufactured in Tashkent.",
    sections: [
      {
        title: "A package plant is not a septic tank",
        text: [
          "A septic tank is a flow-through settler: solids settle, grease floats, but dissolved organics stay in the water. BOD removal is therefore partial and the outlet always goes to the ground — a drain field or a soakaway.",
          "A biological plant works differently. Activated sludge in the aeration tank oxidises the dissolved organics, air is supplied by a blower through a fine-bubble system, and the secondary settler separates the sludge and returns it to the aeration tank. That return keeps the sludge concentration up and brings the effluent to a quality other receivers will accept.",
          "Where the treated water goes is decided before the model is chosen, not after: municipal collector, discharge to ground surface or a water body, irrigation, or a soakaway. The receiver sets the required treatment class and the chain of stages — biology alone, or biology plus polishing and disinfection. Conditions are obtained from the utility or the local environmental authority.",
        ],
      },
      {
        title: "How a plant is selected",
        text: [
          "First, the flow. The range is indexed by m³/day and by population equivalent: BIO-1 is 1 m³/day and 5 PE, BIO-10 is 10 m³/day and 50 PE, BIO-50 is 50 m³/day and 250 PE, BIO-500 is 500 m³/day and 2500 PE. For hotels and resorts count beds instead of residents; for a shift camp, the shift headcount.",
          "Second, the load profile. A house is steady; a hotel, a cafe, a resort or a shift camp produce peaks at check-in, morning and end of shift. The inlet balancing chamber absorbs them, so its volume is sized separately for such sites. Seasonal facilities need their own plan: the sludge has to be grown before the season starts.",
          "Third, the site and the discharge requirements. The inlet collector invert and the burial depth set the shell height and whether a pumping station is needed upstream; the groundwater level sets anchoring and the buoyancy calculation. The chain is standard: inlet and balancing, aeration tank, secondary settler with sludge return, then polishing and disinfection if required. We calculate to KMK 2.04.03-19 and KMK 2.04.01-98, and the calculation is open for your designer and for the expert review.",
        ],
      },
      {
        title: "Build, installation and operation",
        text: [
          "The shell is filament-wound fiberglass with stiffening rings, zoned internally by partitions: inlet and balancing chamber, aeration tank, secondary settler, excess sludge holding. Up to 25 m³/day it is a single shell; above that, a modular multi-shell plant, which removes the oversize transport problem. Blower, pumps and control panel are bought-in — brands are stated openly in the quotation, and the blower follows the air flow of the specific model, listed in the table below.",
          "After installation the plant does not reach its regime immediately: the activated sludge has to grow, and treatment is incomplete until it does. Operation then follows the schedule — checking the blower and airlifts, inspection, periodic removal of excess sludge from the holding compartment. The shell sits in the ground and the biological process releases heat, so the plant runs through the winter without separate heating at normal inflow.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Why a package plant rather than a septic tank?",
        a: "A septic tank retains solids and grease but removes little dissolved organics, so BOD removal is partial and the outlet is limited to the ground. A plant with an aeration tank and sludge return oxidises the organics biologically and brings the effluent to a quality you can agree for a collector, a surface discharge or irrigation.",
      },
      {
        q: "How much does it cost?",
        a: "Cost depends on the flow, the burial depth, the required treatment class and the configuration — blower, automation, disinfection. Instead of a price list we calculate: send the facility type, the flow or the number of users, the discharge point and the inlet collector level, and we return a specific model and a quotation. Selection is free.",
      },
      {
        q: "What do we do with the treated water?",
        a: "Four options: municipal collector, discharge to ground surface or a water body, irrigation, or a soakaway. What is available on site and what the utility or environmental authority permits decides it — and with it the required treatment class, which is why the question belongs to the selection stage.",
      },
      {
        q: "Can the water be used for irrigation?",
        a: "It is a common solution for settlements, hotels and resorts, but the water must be disinfected first: a disinfection stage follows the biology — in our range, the ELX electrolytic chlorinators. Technically a storage tank and a feed pump are added. Irrigation conditions are agreed with the local authorities.",
      },
      {
        q: "What documents do you provide?",
        a: "Process calculation to KMK with the input data and the treatment stages, product passport, installation and connection drawings, soil load and buoyancy calculation for the shell, operating manual and maintenance schedule. The calculation is open and can be attached to the project.",
      },
    ],
    ctaTitle: "Describe the site —\nwe select the plant.",
    ctaText:
      "Facility type, flow or number of users, discharge point, inlet collector level and groundwater level. We return a model from the BIO range, its specifications and a quotation. Manufactured in Tashkent.",
    ctaButton: "GET A SELECTION",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/hlorator", label: "Chlorinators" },
        { href: "/products/zhiroulovitel", label: "Grease traps" },
        { href: "/solutions/kns", label: "Pumping station" },
        { href: "/solutions/private-house", label: "Package plant for a house" },
        { href: "/solutions/hotel", label: "Hotel wastewater treatment" },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "BIO 一体化污水处理设备",
    title: "一体化生活\n污水处理设备。",
    intro:
      "没有市政管网的场所，生活污水必须就地处理：住宅、村镇、酒店、度假基地、公路沿线餐饮。BIO-1…BIO-500 系列覆盖 1–500 m³/日，即 5–2500 人口当量。壳体为自有缠绕玻璃钢，塔什干生产。",
    sections: [
      {
        title: "一体化设备与化粪池的区别",
        text: [
          "化粪池只是过流式沉淀池：悬浮物下沉、油脂上浮，溶解性有机物基本留在水中。因此 BPK 只能部分去除，出水只能排入土壤——渗滤场或渗井。",
          "生物处理站不同：曝气池中的活性污泥氧化溶解性有机物，鼓风机通过微孔曝气系统供气，二沉区分离污泥并回流至曝气池。污泥回流维持了污泥浓度，使出水达到土壤以外的受纳体也能接收的水质。",
          "出水去向必须在选型之前确定：市政管网、排入地表或水体、绿化灌溉、渗井。受纳体决定所需处理等级与工艺段——仅生物处理，还是增加深度处理与消毒。相关条件向自来水公司或当地环保部门取得。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "首先是流量。系列按 m³/日与人口当量编制：BIO-1 为 1 m³/日、5 人；BIO-10 为 10 m³/日、50 人；BIO-50 为 50 m³/日、250 人；BIO-500 为 500 m³/日、2500 人。酒店与度假基地按床位计，轮班营地按班组人数计。",
          "其次是不均匀性。住宅负荷平稳，酒店、餐饮、度假基地和轮班营地存在早晚与入住高峰，由进水调节室削峰，因此这类对象的调节容积单独计算；季节性对象需提前培养污泥。",
          "第三是场地与出水要求。进水管标高与埋深决定壳体高度以及前端是否需要泵站，地下水位决定锚固与抗浮计算。工艺链为：进水调节—曝气池—带污泥回流的二沉区—必要时深度处理与消毒。计算按 KMK 2.04.03-19 与 KMK 2.04.01-98，计算书公开，可提交设计单位与审查。",
        ],
      },
      {
        title: "结构、安装与运行",
        text: [
          "壳体为带加强环的自有缠绕玻璃钢，内部以隔板分区：进水调节室、曝气池、二沉区、剩余污泥储存区。25 m³/日以内为单壳体，以上为多壳体模块化配置，避免超限运输。鼓风机、水泵与控制柜为外购件，品牌在报价中公开注明；鼓风机按具体型号的空气量选型，数据见下方系列表。",
          "安装后设备不会立即达到运行状态：活性污泥需要培养，污泥量不足期间处理不完全。此后按规程运行——检查鼓风机与气提装置、巡检、定期清掏储泥区的剩余污泥。壳体埋于地下，生物过程本身放热，进水正常时冬季无需额外加热即可全年运行。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "一体化设备比化粪池好在哪里？",
        a: "化粪池只截留悬浮物与油脂，溶解性有机物几乎不去除，BPK 仅部分下降，出水只能入土。带曝气池和污泥回流的一体化设备以生物法氧化有机物，出水水质可用于协商排入管网、排入地表或用于灌溉。",
      },
      {
        q: "价格是多少？",
        a: "取决于流量、埋深、所需处理等级与配置（鼓风机、自控、消毒）。我们不发布价目表，而是做计算：提供对象类型、流量或人数、排放去向与进水管标高，我们回复具体型号与报价。选型与计算免费。",
      },
      {
        q: "处理后的水怎么办？",
        a: "四种去向：市政管网、排入地表或水体、绿化灌溉、渗井。取决于现场条件以及自来水公司或环保部门的许可；所需处理等级随之确定，因此该问题属于选型阶段。",
      },
      {
        q: "出水可以用于灌溉吗？",
        a: "村镇、酒店与度假基地常用此方案，但灌溉前必须消毒——生物段之后设消毒装置，我们的产品为 ELX 电解加氯装置；同时需增设储水罐与供水泵。灌溉条件须与当地主管部门协商确定。",
      },
      {
        q: "提供哪些文件？",
        a: "含原始数据与工艺段的 KMK 工艺计算书、产品合格证、安装与接管图、土压与抗浮计算、运行手册与维护规程。计算书公开，可随项目提交。",
      },
    ],
    ctaTitle: "描述您的对象——\n我们完成选型。",
    ctaText:
      "对象类型、流量或人数、排放去向、进水管标高与地下水位。我们回复 BIO 系列型号、参数与报价。塔什干生产。",
    ctaButton: "获取选型",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/hlorator", label: "电解加氯装置" },
        { href: "/products/zhiroulovitel", label: "隔油器" },
        { href: "/solutions/kns", label: "污水泵站" },
        { href: "/solutions/private-house", label: "别墅污水设备" },
        { href: "/solutions/hotel", label: "酒店污水处理" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
