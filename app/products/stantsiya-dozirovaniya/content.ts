import type { LineContentSet } from "../lineTypes";

/**
 * Страница модельного ряда «Станции дозирования реагентов ДОЗ».
 *
 * Под запросы «станция дозирования», «станция дозирования реагентов»,
 * «узел дозирования коагулянта», «дозирующая установка», «дозирование
 * флокулянта», «реагентное хозяйство», «dozalash stansiyasi»,
 * «chemical dosing station».
 *
 * Цифры — только из app/products/data.ts (объём расходного бака,
 * число насосов). Ни доз в мг/л, ни цен, ни сроков здесь нет.
 */

const content: LineContentSet = {
  ru: {
    label: "СТАНЦИИ ДОЗИРОВАНИЯ РЕАГЕНТОВ",
    title: "Станции дозирования\nреагентов ДОЗ.",
    intro:
      "Готовый узел приготовления и подачи реагента: расходный бак с мешалкой, два насоса-дозатора и обвязка на одной раме. Восемь типоразмеров по объёму бака — от 100 до 10 000 литров. Собираем в Ташкенте, подбираем под конкретный реагент и точку ввода.",
    sections: [
      {
        title: "Зачем нужна станция дозирования",
        text: [
          "Почти любая схема очистки воды где-то упирается в химию. Чтобы взвесь села в отстойнике или всплыла во флотаторе, в поток вводят коагулянт, а чтобы хлопья укрупнились и не разбивались дальше по тракту — флокулянт. Перед мембранами дозируют антискалант, иначе на них садится накипь. Щёлочью или кислотой корректируют pH — выводят воду в диапазон, в котором реагент вообще работает. На выходе подаётся обеззараживающий раствор.",
          "Всё это вопрос дозы. Коагулянт работает в узком окне: недодали — вода мутная и осадок не садится, передали — реагент уходит в осадок и в сброс, а расход растёт на ровном месте. Держать дозу вручную, «на глаз», не получается: приток меняется в течение смены, концентрация в бочке — от заправки к заправке, и качество на выходе пляшет вместе с ними.",
          "Станция дозирования снимает этот вопрос. Реагент один раз готовится до известной рабочей концентрации, дальше насос-дозатор подаёт его с заданной подачей — постоянной или привязанной к расходу воды и показаниям датчика.",
        ],
      },
      {
        title: "Как подбирается станция дозирования",
        text: [
          "Отсчёт идёт от двух величин: расхода обрабатываемой воды и рабочей дозы реагента. Их произведение даёт часовой расход товарного реагента, а с учётом концентрации рабочего раствора — часовую подачу насоса-дозатора. Насос подбирается по этой подаче и по давлению в точке ввода: подать реагент в самотёчный лоток и втолкнуть его в напорный трубопровод — разные задачи.",
          "Дальше от подачи и от того, как часто персонал готов готовить раствор, считается объём бака. Ориентир — одной заправки хватает минимум на сутки работы; отсюда и ряд ДОЗ от 100 до 10 000 литров. Чем более разбавленный раствор нужен по технологии, тем больше бак при той же массе сухого реагента.",
          "Остальное задаёт сам реагент. Кислота, щёлочь, гипохлорит и полимер требуют разных материалов бака, мембран, клапанов и уплотнений — универсальной станции «под любую химию» не бывает. Флокулянту нужна мешалка и время на созревание раствора, а не быстрое перемешивание. Отдельно продумываются точка ввода и перемешивание в потоке: реагент, введённый в застойную зону, до реакции просто не доходит. И выбирается способ управления — постоянная подача, пропорционально сигналу расходомера или по показаниям pH-метра либо анализатора.",
        ],
      },
      {
        title: "Что входит в станцию и как её обслуживать",
        text: [
          "Конструктивно станция ДОЗ — это рама, на которой собрано всё сразу: расходный бак с крышкой и уровнемером, мешалка с электроприводом, два насоса-дозатора, всасывающая и напорная обвязка с клапаном впрыска, поддон для сбора проливов и шкаф управления. Насосов всегда два — рабочий и резервный: остановка коагулянта на очистных сооружениях видна на выходе уже через считаные минуты.",
          "Что чьё, мы не скрываем. Раму, бак, мешалку, обвязку и шкаф делаем сами в Ташкенте. Насосы-дозаторы, датчики и КИП — покупные узлы: марки указываем открыто в коммерческом предложении, паспорта передаём с изделием.",
          "Эксплуатация сводится к нескольким регулярным действиям: приготовить раствор нужной концентрации, следить за уровнем в баке, промывать тракт и клапан впрыска, проверять подачу насоса по мерной колонке и поверять датчики, если дозирование идёт по сигналу. Обращение с реагентами — по паспорту безопасности конкретной химии: средства защиты, вентиляция, промывочная вода рядом.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Какой объём бака выбрать?",
        a: "Считают от подачи: доза умножается на расход воды и пересчитывается на концентрацию рабочего раствора — получается часовой расход раствора. Бак берут так, чтобы одной заправки хватало минимум на сутки непрерывной работы. Ряд ДОЗ идёт от 100 до 10 000 литров, промежуточные задачи закрываются соседним типоразмером.",
      },
      {
        q: "Можно ли дозировать по расходомеру или по показанию pH?",
        a: "Да, это штатные режимы. Пропорционально расходу — насос получает сигнал от расходомера и держит постоянную дозу при переменном притоке. По качеству — сигнал приходит от pH-метра или анализатора, и станция подаёт реагент до выхода на уставку. Сами датчики в поставку не входят, но станция готова к подключению.",
      },
      {
        q: "Какие реагенты можно дозировать?",
        a: "Кислоту, щёлочь, коагулянт, флокулянт, гипохлорит, антискаланты, технологические реагенты. Ограничение не в перечне, а в материалах: бак, мембраны, клапаны и уплотнения подбираются под конкретную химию и её концентрацию. Поэтому в заявке обязательно указывается, что именно и в какой концентрации будет дозироваться.",
      },
      {
        q: "Нужно ли под станцию отдельное помещение?",
        a: "Отдельного здания не требуется: станция ставится в помещении на ровном полу и подключается к сети 220 В. Но место должно быть закрытым, с вентиляцией по дозируемому реагенту и с подводом воды на приготовление раствора и промывку. Поддон для сбора проливов входит в комплект.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Паспорт изделия, схему станции и обвязки, руководство по эксплуатации и регламент обслуживания, паспорта покупных насосов и КИП. Сам подбор — расчёт подачи насоса и объёма бака — передаём вместе с коммерческим предложением.",
      },
    ],
    ctaTitle: "Подберём станцию\nпод ваш реагент.",
    ctaText:
      "Пришлите реагент и его концентрацию, требуемую дозу и расход обрабатываемой воды. Вернём подачу насосов, объём бака, материалы под вашу химию и коммерческое предложение.",
    ctaButton: "ЗАПРОСИТЬ ПОДБОР",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/hlorator", label: "Хлораторы ЭЛХ" },
        { href: "/products/los-bio", label: "ЛОС БИО" },
        { href: "/catalog/disinfection-dosing", label: "Дезинфекция и дозирование" },
        { href: "/catalog/water-treatment", label: "Водоподготовка" },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "REAGENT DOZALASH STANSIYALARI",
    title: "Reagent dozalash\nstansiyalari DOZ.",
    intro:
      "Reagentni tayyorlash va uzatishning tayyor uzeli: aralashtirgichli sarf baki, ikkita dozalash nasosi va bitta ramadagi quvur ulanishi. Bak hajmi bo‘yicha sakkizta o‘lcham — 100 litrdan 10 000 litrgacha. Toshkentda yig‘amiz, aniq reagent va kiritish nuqtasiga moslab tanlaymiz.",
    sections: [
      {
        title: "Dozalash stansiyasi nima uchun kerak",
        text: [
          "Suv tozalashning deyarli har qanday sxemasi bir joyda kimyoga borib taqaladi. Muallaq zarralar cho‘ktirgichda cho‘kishi yoki flotatorda ko‘tarilishi uchun oqimga koagulyant kiritiladi; parchalar yiriklashib, keyingi yo‘lda buzilmasligi uchun — flokulyant. Membranalar oldidan antiskalant dozalanadi, aks holda ularga quyqa o‘tiradi. Alohida vazifa — ishqor yoki kislota bilan pH korreksiyasi: suvni reagent umuman ishlaydigan diapazonga chiqarish. Chiqishda esa — zararsizlantiruvchi eritma.",
          "Bularning bari — doza masalasi. Koagulyant tor oynada ishlaydi: kam bersangiz, suv loyqa qoladi va cho‘kma o‘tirmaydi; ko‘p bersangiz, reagent cho‘kma va oqava bilan ketadi, sarf esa bekorga oshadi. Dozani qo‘lda, eritmani «ko‘z bilan» quyib ushlab bo‘lmaydi: sarf smena davomida o‘zgaradi, bochkadagi konsentratsiya — har to‘ldirishda boshqacha, chiqishdagi sifat ular bilan birga sakraydi.",
          "Dozalash stansiyasi bu masalani yopadi. Reagent bir marta ma’lum ishchi konsentratsiyagacha tayyorlanadi, keyin dozalash nasosi uni belgilangan sarf bilan uzatadi — doimiy yoki suv sarfi va datchik ko‘rsatkichiga bog‘langan holda. Doza bugun kim smenada ekaniga bog‘liq bo‘lmay qoladi.",
        ],
      },
      {
        title: "Stansiya qanday tanlanadi",
        text: [
          "Hisob ikkita kattalikdan boshlanadi: tozalanayotgan suv sarfi va reagentning ishchi dozasi. Ularning ko‘paytmasi soatlik reagent sarfini beradi, ishchi eritma konsentratsiyasi hisobga olinsa — dozalash nasosining soatlik uzatishini. Nasos shu uzatish va kiritish nuqtasidagi bosim bo‘yicha tanlanadi: reagentni oqar novga berish va bosimli quvurga kiritish — turli vazifalar.",
          "Keyin uzatish va xodim eritmani qanchalik tez-tez tayyorlashga tayyorligidan bak hajmi hisoblanadi. Oqilona mo‘ljal — bitta to‘ldirish kamida bir sutkalik ishga yetishi; DOZ qatori shundan 100 dan 10 000 litrgacha. Texnologiya bo‘yicha eritma qanchalik suyultirilgan bo‘lsa, quruq reagentning o‘sha massasida bak shunchalik katta bo‘ladi.",
          "Qolganini reagentning o‘zi belgilaydi. Kislota, ishqor, gipoxlorit va polimer bak, membrana, klapan va zichlagichlarning turli materiallarini talab qiladi — «istalgan kimyoga» universal stansiya bo‘lmaydi. Flokulyantga tez aralashtirish emas, aralashtirgich va eritmaning yetilishi uchun vaqt kerak. Kiritish nuqtasi va oqimda aralashtirish alohida o‘ylanadi: turg‘un zonaga kiritilgan reagent reaksiyagacha yetib bormaydi. Nihoyat, boshqaruv usuli tanlanadi — doimiy uzatish, sarf o‘lchagich signaliga mutanosib yoki pH-metr hamda analizator ko‘rsatkichi bo‘yicha.",
        ],
      },
      {
        title: "Stansiya tarkibi va ekspluatatsiya",
        text: [
          "Konstruktiv jihatdan DOZ — bu hammasi yig‘ilgan rama: qopqoq va sath o‘lchagichli sarf baki, elektr yuritmali aralashtirgich, ikkita dozalash nasosi, purkash klapanli so‘rish va bosim quvurlari, to‘kilmalarni yig‘uvchi poddon hamda boshqaruv shkafi. Nasoslar doim ikkita — ishchi va zaxira: tozalash inshootlarida koagulyant to‘xtasa, chiqishda bu bir necha daqiqada bilinadi.",
          "Nima kimniki ekanini yashirmaymiz. Rama, bak, aralashtirgich, quvur ulanishi va shkafni Toshkentda o‘zimiz tayyorlaymiz. Dozalash nasoslari, datchiklar va nazorat-o‘lchov asboblari — sotib olinadigan uzellar: marka va o‘lchamlarni tijorat taklifida ochiq ko‘rsatamiz, pasportlarni mahsulot bilan beramiz.",
          "Ekspluatatsiya bir necha muntazam ishga keladi: kerakli konsentratsiyadagi eritmani tayyorlash, bakdagi sathni kuzatish, quvur yo‘li va purkash klapanini vaqti-vaqti bilan yuvish, nasos uzatishini o‘lchov kolonkasi bo‘yicha tekshirish va dozalash signal bo‘yicha ketsa, datchiklarni tekshirtirish. Reagentlar bilan muomala — aniq kimyoning xavfsizlik pasporti bo‘yicha: himoya vositalari, ventilyatsiya, yaqinda yuvish suvi.",
        ],
      },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Bak hajmini qanday tanlash kerak?",
        a: "Uzatishdan hisoblanadi: doza suv sarfiga ko‘paytiriladi va ishchi eritma konsentratsiyasiga qayta hisoblanadi — soatlik eritma sarfi chiqadi. Bak bitta to‘ldirish kamida bir sutkalik uzluksiz ishga yetadigan qilib olinadi, aks holda xodim smenada ikki marta reagent tayyorlaydi. DOZ qatori 100 dan 10 000 litrgacha, oraliq vazifalar qo‘shni o‘lcham bilan yopiladi.",
      },
      {
        q: "Sarf o‘lchagich yoki pH ko‘rsatkichi bo‘yicha dozalash mumkinmi?",
        a: "Ha, bu shtat rejimlari. Sarfga mutanosib — nasos sarf o‘lchagichdan signal oladi va o‘zgaruvchan oqimda doimiy dozani ushlaydi. Sifat bo‘yicha — signal pH-metr yoki analizatordan keladi, stansiya reagentni belgilangan qiymatga chiqquncha uzatadi. Datchiklarning o‘zi yetkazib berishga kirmaydi: ular vazifaga qarab tanlanadi, stansiya esa ulanishga tayyor.",
      },
      {
        q: "Qanday reagentlarni dozalash mumkin?",
        a: "Kislota, ishqor, koagulyant, flokulyant, gipoxlorit, antiskalantlar, texnologik reagentlar. Cheklov ro‘yxatda emas, materiallarda: bak, membrana, klapan va zichlagichlar aniq kimyo va uning konsentratsiyasiga qarab tanlanadi. Shuning uchun arizada nima va qanday konsentratsiyada dozalanishi albatta ko‘rsatiladi.",
      },
      {
        q: "Stansiya uchun alohida xona kerakmi?",
        a: "Alohida bino talab qilinmaydi: stansiya tekis polli xonaga qo‘yiladi va oddiy 220 V tarmoqqa ulanadi. Lekin joy yopiq bo‘lishi, dozalanadigan reagentga mos ventilyatsiyaga hamda eritma tayyorlash va yuvish uchun suv ta’minotiga ega bo‘lishi kerak. To‘kilmalarni yig‘uvchi poddon komplektga kiradi.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "Mahsulot pasporti, stansiya va quvur ulanishi sxemasi, foydalanish qo‘llanmasi va xizmat ko‘rsatish reglamenti, sotib olingan nasos va asboblarning pasportlari. Tanlovning o‘zi — sizning boshlang‘ich ma’lumotlaringiz bo‘yicha nasos uzatishi va bak hajmi hisobi — tijorat taklifi bilan birga beriladi.",
      },
    ],
    ctaTitle: "Reagentingizga mos\nstansiyani tanlaymiz.",
    ctaText:
      "Reagent va uning konsentratsiyasini, kerakli dozani hamda suv sarfini yuboring. Nasos uzatishi, bak hajmi, kimyongizga mos materiallar va tijorat taklifini qaytaramiz.",
    ctaButton: "TANLOVNI SO‘RASH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/hlorator", label: "Xloratorlar ELX" },
        { href: "/products/los-bio", label: "LOS BIO" },
        { href: "/catalog/disinfection-dosing", label: "Zararsizlantirish va dozalash" },
        { href: "/catalog/water-treatment", label: "Suv tayyorlash" },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "CHEMICAL DOSING STATIONS",
    title: "Chemical dosing\nstations DOZ.",
    intro:
      "A complete make-up and feed unit: a day tank with a mixer, two dosing pumps and pipework on one frame. Eight sizes by tank volume — from 100 to 10,000 litres. Built in Tashkent and sized for your chemical and injection point.",
    sections: [
      {
        title: "Why a dosing station",
        text: [
          "Most water treatment schemes rely on chemistry somewhere. Coagulant makes solids settle in a clarifier or float in a DAF unit; flocculant grows the floc so it survives the rest of the line. Antiscalant goes in ahead of membranes. Caustic or acid corrects pH into the range where the chemical works at all, and a disinfectant solution is fed at the outlet.",
          "All of that is a question of dose. Underdose and the water stays turbid; overdose and the chemical simply leaves with the sludge while consumption climbs. Hand feeding by eye cannot hold a dose: the flow changes through the shift and the strength in the drum changes with every batch.",
          "A dosing station removes the guesswork. The chemical is made up once to a known working strength, and the dosing pump feeds it at a set rate — constant, or tied to the water flow and a sensor reading.",
        ],
      },
      {
        title: "How the station is sized",
        text: [
          "Sizing starts from two numbers: the flow of water to be treated and the working dose. Together they give the hourly chemical demand, and with the strength of the working solution, the hourly output of the dosing pump. The pump is then chosen for that output and for the pressure at the injection point — an open channel and a pressure line are different duties.",
          "Tank volume follows from the pump output and from how often the operator is willing to make up a batch. A sensible target is one batch per day of running, which is why the DOZ range runs from 100 to 10,000 litres.",
          "The chemical decides the rest: tank, diaphragm, valve and seal materials are selected for the specific product and its strength, so there is no universal station. Flocculant needs a mixer and time to mature. The injection point and in-line mixing are engineered separately, as is the control mode — constant feed, flow-proportional from a flowmeter, or from a pH meter or analyser.",
        ],
      },
      {
        title: "Scope of supply and operation",
        text: [
          "The station is one frame carrying the day tank with lid and level gauge, a motor-driven mixer, two dosing pumps, suction and discharge pipework with an injection valve, a spill tray and a control cabinet. Two pumps always — duty and standby, because a coagulant outage shows up in the effluent within minutes.",
          "We build the frame, tank, mixer, pipework and cabinet in Tashkent. Dosing pumps, sensors and instruments are bought in: makes and sizes are stated openly in the quotation and their datasheets are handed over with the unit.",
          "Operation is routine: make up the solution, watch the level, flush the line and injection valve, check pump output against the calibration column, and verify the sensors where dosing is signal-driven. Chemicals are handled to their own safety data sheet — protective equipment, ventilation, wash water nearby.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What tank volume should I choose?",
        a: "Work back from pump output: dose times water flow, converted to the strength of the working solution, gives the hourly solution demand. Size the tank so one batch covers at least a day of continuous running. The DOZ range is 100 to 10,000 litres.",
      },
      {
        q: "Can it dose from a flowmeter or a pH signal?",
        a: "Yes, both are standard. Flow-proportional keeps a constant dose as the inflow varies; quality-based control feeds from a pH meter or analyser until the setpoint is reached. The sensors themselves are not part of the supply, but the station is ready for them.",
      },
      {
        q: "Which chemicals can be dosed?",
        a: "Acid, caustic, coagulant, flocculant, hypochlorite, antiscalants and process chemicals. The limit is materials, not the list: tank, diaphragms, valves and seals are chosen for the product and its strength, so state both when you enquire.",
      },
      {
        q: "Does it need a separate building?",
        a: "No. The station stands on a level floor indoors on a 220 V supply. The room should be enclosed, ventilated for the chemical in use, and have water for make-up and flushing. The spill tray is included.",
      },
      {
        q: "What documents do you provide?",
        a: "Product passport, station and pipework drawings, operation manual and maintenance schedule, plus datasheets for the bought-in pumps and instruments. The sizing calculation comes with the quotation.",
      },
    ],
    ctaTitle: "Tell us the chemical —\nwe size the station.",
    ctaText:
      "Send the chemical and its strength, the required dose and the water flow. We return pump output, tank volume, wetted materials and a quotation.",
    ctaButton: "REQUEST A SELECTION",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/hlorator", label: "Chlorinators" },
        { href: "/products/los-bio", label: "Package plants" },
        { href: "/catalog/disinfection-dosing", label: "Disinfection and dosing" },
        { href: "/catalog/water-treatment", label: "Water treatment" },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "加药装置",
    title: "DOZ 系列\n加药装置。",
    intro:
      "药剂配制与投加的成套单元：带搅拌器的溶药箱、两台计量泵和管路，安装在同一机架上。按溶药箱容积分八个规格——100 升至 10 000 升。塔什干生产，按具体药剂和投加点选型。",
    sections: [
      {
        title: "为什么需要加药装置",
        text: [
          "几乎每套水处理工艺都离不开药剂。为使悬浮物在沉淀池沉降或在气浮池上浮，需投加混凝剂；为使絮体长大并在后续管路中不被打碎，需投加絮凝剂。膜前投加阻垢剂，否则膜面结垢。用碱或酸调节 pH，把水调到药剂能起作用的区间，出水端再投加消毒剂。",
          "这些都归结为投加量。投少了水仍浑浊，投多了药剂随污泥流失、单耗无谓上升。凭经验手工添加无法稳定控制：水量在一个班内变化，桶内浓度每次配制都不同。",
          "加药装置解决了这个问题。药剂一次配制到已知的工作浓度，计量泵按设定流量投加——恒定投加，或按水量和传感器信号联动。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "从两个数据出发：处理水量和药剂工作投加量。两者相乘得到小时药剂需求量，再按工作液浓度换算，即为计量泵的小时流量。泵按该流量和投加点压力选定——投加到明渠和压入压力管道是两种工况。",
          "溶药箱容积由泵流量和配药频次决定。合理目标是一次配药至少满足一昼夜运行，DOZ 系列因此覆盖 100 升至 10 000 升。",
          "其余由药剂本身决定：箱体、隔膜、阀门和密封材料按具体药剂及其浓度选配，不存在通用装置。絮凝剂需要搅拌和熟化时间。投加点位置与管道内混合需单独设计，控制方式也需选定——恒定投加、按流量计比例投加，或按 pH 计与在线分析仪信号投加。",
        ],
      },
      {
        title: "供货范围与运行维护",
        text: [
          "装置为一体机架，集成带盖和液位计的溶药箱、电动搅拌器、两台计量泵、含注入阀的吸入与压出管路、防漏托盘和控制柜。泵始终为一用一备：污水厂混凝剂一旦中断，几分钟后出水即可察觉。",
          "机架、箱体、搅拌器、管路和控制柜由我们在塔什干制造。计量泵、传感器和仪表为外购件：品牌与规格在报价中公开注明，技术文件随产品移交。",
          "日常运行较为简单：配制规定浓度的药液、监视液位、定期冲洗管路与注入阀、用校准柱核对泵流量，信号联动投加时还需校验传感器。药剂操作依据其安全技术说明书——防护用品、通风、就近冲洗水。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "溶药箱容积如何选择？",
        a: "由泵流量倒推：投加量乘以水量，再按工作液浓度换算，得到小时药液需求量。箱体容积应满足一次配药至少一昼夜连续运行。DOZ 系列为 100 升至 10 000 升。",
      },
      {
        q: "能否按流量计或 pH 信号投加？",
        a: "可以，均为标准配置。比例投加时泵接收流量计信号，在水量波动下保持投加量恒定；按水质投加时信号来自 pH 计或在线分析仪，投加至设定值。传感器本身不在供货范围内，但装置已预留接口。",
      },
      {
        q: "可以投加哪些药剂？",
        a: "酸、碱、混凝剂、絮凝剂、次氯酸钠、阻垢剂及工艺药剂。限制不在种类而在材料：箱体、隔膜、阀门和密封件按具体药剂及浓度选配，询价时请注明这两项。",
      },
      {
        q: "是否需要单独机房？",
        a: "不需要单独建筑。装置置于室内平整地面，接 220 V 电源即可。但场地应封闭、按所用药剂设置通风，并具备配药和冲洗用水。防漏托盘随机供应。",
      },
      {
        q: "提供哪些文件？",
        a: "产品合格证、装置与管路图、使用说明书与维护规程，以及外购泵和仪表的技术文件。选型计算随报价一并提供。",
      },
    ],
    ctaTitle: "告知药剂——\n我们完成选型。",
    ctaText: "请提供药剂及其浓度、所需投加量和处理水量。我们回复泵流量、溶药箱容积、接触材料与报价。",
    ctaButton: "索取选型",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/hlorator", label: "电解加氯装置" },
        { href: "/products/los-bio", label: "一体化生物处理设备" },
        { href: "/catalog/disinfection-dosing", label: "消毒与加药" },
        { href: "/catalog/water-treatment", label: "水处理" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
