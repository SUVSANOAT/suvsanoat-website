import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные сооружения Навои», «промышленные
 * очистные сооружения Навои», «нефтеуловитель Навои».
 * Акцент — промышленный регион: технологический и промливневый сток,
 * вахтовые посёлки, столовые и мойки техники.
 */

const content: SolutionContentSet = {
  ru: {
    label: "НАВОИ И НАВОИЙСКАЯ ОБЛАСТЬ",
    title: "Очистные сооружения\nв Навои.",
    intro:
      "Навои — промышленный регион, и здесь очистные почти всегда считают не по числу жителей, а по составу стока. Мы производим корпуса и технологические камеры из стеклопластика в Ташкенте, собираем схему под конкретный сток, везём на площадку, монтируем и запускаем своей бригадой.",
    sections: [
      {
        title: "Какие объекты чаще всего приходят из региона",
        text: [
          "Производственные площадки и отдельные цеха со своим технологическим стоком. Промливневые стоки территорий — вода с дорог, площадок хранения и разгрузки, где несёт песок и нефтепродукты. Вахтовые посёлки и общежития. Столовые предприятий. Автотранспортные цеха и мойки техники.",
          "У каждого потока своя природа. Хозбытовой сток посёлка или общежития предсказуем и считается по числу пользователей. Сток столовой — это жиры и взвесь. Сток мойки и автобазы — нефтепродукты и песок. А технологический сток цеха по названию отрасли предсказать нельзя: два похожих производства дают разный сток.",
          "Поэтому мы разделяем объект на потоки и считаем каждый отдельно, а не подгоняем всё под одну установку.",
        ],
      },
      {
        title: "Промышленный сток: состав определяет схему, а не наоборот",
        text: [
          "Мы не начинаем с модели. Сначала анализ стока и опросный лист: расход в сутки и в час, залповость (сброс идёт ровно или ваннами), pH, температура, взвешенные вещества, нефтепродукты, металлы, ХПК и БПК5, куда сброс — в канализацию, на рельеф или на повторное использование. Без этих цифр любой подбор будет угадыванием.",
          "Дальше схема собирается из узлов под конкретный состав. Обычный порядок: усреднение — резервуар, который гасит залповые сбросы и выравнивает состав. Нейтрализация и коррекция pH с дозированием реагента по датчику. Физико-химия — коагуляция и флокуляция, затем флотация (DAF) или отстаивание: так снимаются взвесь, эмульгированные нефтепродукты и осаждаемые металлы. Фильтрация как доочистка. Если в стоке есть органика, которую физико-химия не берёт, добавляется биологическая ступень. Осадок обезвоживается на фильтр-прессе, чтобы вывозить кек, а не жидкость.",
          "Часть узлов может не понадобиться, часть придётся усилить: схема собирается под сток, а не сток под коробочную установку.",
        ],
      },
      {
        title: "Корпуса, температура стока и работа на площадке за ≈480 км",
        text: [
          "На промышленном объекте корпус живёт в агрессивной среде: кислые и щелочные стоки, реагенты дозирования, растворённые соли. Углеродистая сталь здесь требует покрытия и его восстановления, бетон — гидроизоляции и защиты от химии. Стеклопластик собственной намотки химически стоек к таким средам, корпус монолитный — нет швов, по которым идёт течь. Технологические камеры, перегородки и обвязку делаем под конкретную схему, а не подбираем из коробочного ряда.",
          "Отдельный вопрос — температура. Летом в регионе жарко, а часть промышленных стоков приходит горячей или тёплой. Перед биологической ступенью такой сток нужно охлаждать: ил чувствителен к температуре, и «разбавить холодной на глаз» — это не решение, а способ сорвать режим. Охлаждение закладывается в схему отдельным узлом с расчётом.",
          "Производство в Ташкенте, до Навои ≈480 км. Доставка, монтаж, пусконаладка и вывод на режим — наша выездная бригада. Расчёт ведём по КМК 2.04.03-19 и КМК 2.04.01-98, его можно показать проектировщику и экспертизе.",
        ],
      },
    ],
    pickTitle: "С чего начать подбор",
    pickText:
      "Типовые задачи промышленной площадки — и узлы, с которых стоит начать разговор. Точный состав схемы — по анализу стока.",
    picks: [
      { slug: "bio-50", when: "Вахтовый посёлок, общежитие" },
      { slug: "nef-20", when: "Мойка техники, промплощадка" },
      { slug: "pes-20", when: "Песколовка промливневых стоков" },
      { slug: "rez-100", when: "Усреднитель промстока" },
      { slug: "doz-500", when: "Дозирование реагента, коррекция pH" },
      { slug: "kns-50", when: "Перекачка стоков площадки" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Вы гарантируете показатели очистки промышленного стока?",
        a: "Только после анализа. По хозбытовым объектам — посёлок, общежитие, столовая — работает обычный ряд ЛОС БИО и жироуловителей: там расчёт ведётся по числу пользователей и нормам, результат предсказуем. По промышленному стоку показатели на выходе зависят от состава, и пока нет анализа с опросным листом, честно назвать их нельзя. После анализа схема и показатели фиксируются в коммерческом предложении.",
      },
      {
        q: "Что прислать, чтобы начать разговор?",
        a: "Анализ стока и заполненный опросный лист: расход в сутки и в час, характер сброса (равномерный или залповый), pH, температура, взвешенные вещества, нефтепродукты, металлы, ХПК и БПК5, точка сброса. Если анализа ещё нет — подскажем, какие показатели сдавать в лабораторию и как отбирать пробу.",
      },
      {
        q: "На площадке несколько разных стоков — нужна одна установка или несколько?",
        a: "Как правило, потоки разделяют. Хозбытовой сток посёлка и столовой идёт своей линией — жироуловитель и биологическая очистка. Промливнёвка с территории и мойка техники — своей: песколовка и нефтеуловитель. Технологический сток цеха — отдельная схема. Смешивать их до очистки обычно невыгодно: объёмы растут, а сток становится сложнее.",
      },
      {
        q: "Почему корпуса из стеклопластика, а не из стали или бетона?",
        a: "Химическая стойкость. Промышленный сток и реагенты дозирования быстро находят слабое место у углеродистой стали и бетона, а стеклопластик работает в кислой и щелочной среде без покрытия и гидроизоляции. Корпус монолитный, намотка своя, поэтому камеры делаются под размеры и объёмы вашей схемы. Расчёт корпуса на грунтовые нагрузки и всплытие выдаём с изделием.",
      },
      {
        q: "Вы работаете в Навои или только в Ташкенте?",
        a: "Производство находится в Ташкенте, до Навои примерно 480 км. Доставку по Узбекистану, монтаж, пусконаладку и вывод на режим выполняют наши бригады с выездом на площадку. Покупные узлы — насосы, воздуходувки, КИП — указываем в предложении с открытыми марками.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ВСЕ МОДЕЛИ",
    allHref: "/products",
    ctaTitle: "Пришлите анализ стока —\nвернём схему и расчёт.",
    ctaText:
      "Тип производства, расход, залповость, анализ стока и точка сброса. Вернём схему очистки, состав оборудования и коммерческое предложение. Производство — Ташкент.",
    ctaButton: "ПОЛУЧИТЬ РАСЧЁТ",
    related: {
      title: "География производства и монтажа",
      links: [
        { href: "/solutions/tashkent", label: "Ташкент" },
        { href: "/solutions/samarkand", label: "Самарканд" },
        { href: "/solutions/bukhara", label: "Бухара" },
        { href: "/solutions/fergana", label: "Фергана" },
        { href: "/solutions/namangan", label: "Наманган" },
      ],
    },
  },

  uz: {
    label: "NAVOIY VA NAVOIY VILOYATI",
    title: "Navoiyda tozalash\ninshootlari.",
    intro:
      "Navoiy — sanoat hududi, va bu yerda tozalash inshooti ko‘pincha aholi soniga emas, oqava tarkibiga qarab hisoblanadi. Shishatolali korpuslar va texnologik kameralarni Toshkentda ishlab chiqaramiz, sxemani aniq oqava ostida yig‘amiz, maydonchaga yetkazamiz, o‘z brigadamiz bilan o‘rnatib ishga tushiramiz.",
    sections: [
      {
        title: "Hududdan ko‘p keladigan obyektlar",
        text: [
          "O‘z texnologik oqavasiga ega ishlab chiqarish maydonchalari va alohida sexlar. Hudud bo‘ylab yig‘iladigan sanoat-yomg‘ir oqavasi — yo‘llar, saqlash va tushirish maydonchalaridan qum va neft mahsulotlarini olib keladi. Vaxta posyolkalari va yotoqxonalar. Korxona oshxonalari. Avtotransport sexlari va texnika yuvish joylari.",
          "Har bir oqimning tabiati boshqacha. Posyolka yoki yotoqxonaning maishiy oqavasi bashoratli va foydalanuvchilar soni bo‘yicha hisoblanadi. Oshxona oqavasi — yog‘ va muallaq moddalar. Yuvish va avtobaza oqavasi — neft mahsulotlari va qum. Sexning texnologik oqavasini esa soha nomiga qarab bashorat qilib bo‘lmaydi: o‘xshash ikki ishlab chiqarish turli oqava beradi.",
          "Shu sababli obyektni oqimlarga ajratamiz va har birini alohida hisoblaymiz, hammasini bitta qurilmaga moslashtirmaymiz.",
        ],
      },
      {
        title: "Sanoat oqavasi: sxemani tarkib belgilaydi",
        text: [
          "Biz modeldan boshlamaymiz. Avval oqava tahlili va so‘rovnoma: kunlik va soatlik sarf, zalvorlilik (chiqindi tekis keladimi yoki to‘lqin bilan), pH, harorat, muallaq moddalar, neft mahsulotlari, metallar, KKT va BKT5, oqava qayerga ketadi — kanalizatsiyaga, relyefga yoki qayta foydalanishga. Bu raqamlarsiz har qanday tanlov — taxmin.",
          "Keyin sxema aniq tarkib ostida uzellardan yig‘iladi. Odatdagi tartib: o‘rtachalashtirish — zalvorli chiqindilarni yumshatadigan va tarkibni tekislaydigan rezervuar. Neytrallash va datchik bo‘yicha reagent dozalash bilan pH korreksiyasi. Fizik-kimyo — koagulyatsiya va flokulyatsiya, so‘ng flotatsiya (DAF) yoki tindirish: shunday qilib muallaq moddalar, emulsiyalangan neft mahsulotlari va cho‘kuvchi metallar olinadi. Filtrlash — qo‘shimcha tozalash. Agar oqavada fizik-kimyo olmaydigan organika bo‘lsa, biologik bosqich qo‘shiladi. Cho‘kma filtr-pressda suvsizlantiriladi, toki suyuqlik emas, kek chiqarilsin.",
          "Ayrim uzellar kerak bo‘lmasligi, ayrimlari esa kuchaytirilishi mumkin. Tahlilning ma’nosi shunda: sxema oqava ostida yig‘iladi, oqava quti qurilmaga moslashtirilmaydi.",
        ],
      },
      {
        title: "Korpuslar, oqava harorati va ≈480 km naridagi ish",
        text: [
          "Sanoat obyektida korpus tajovuzkor muhitda ishlaydi: kislotali va ishqorli oqava, dozalash reagentlari, erigan tuzlar. Uglerodli po‘lat bu yerda qoplama va uni tiklashni talab qiladi, beton — gidroizolyatsiya va kimyodan himoyani. O‘z o‘ramimizdagi shishatolali plastik bunday muhitlarga kimyoviy chidamli, korpus yaxlit — oqadigan chok yo‘q. Texnologik kameralar, to‘siqlar va obvyazkani aniq sxema ostida tayyorlaymiz, tayyor qatordan tanlamaymiz.",
          "Alohida masala — harorat. Yozda hudud issiq, sanoat oqavasining bir qismi esa issiq yoki iliq keladi. Biologik bosqichdan oldin uni sovitish kerak: faol loyqa haroratga sezgir, «ko‘z bilan sovuq suv qo‘shish» yechim emas, rejimni buzish usuli. Sovitish sxemaga hisob bilan alohida uzel sifatida kiritiladi.",
          "Ishlab chiqarish Toshkentda, Navoiygacha ≈480 km. Yetkazish, montaj, ishga tushirish va rejimga chiqarish — bizning ko‘chma brigadamiz. Hisobni KMK 2.04.03-19 va KMK 2.04.01-98 bo‘yicha yuritamiz, uni loyihachi va ekspertizaga ko‘rsatish mumkin.",
        ],
      },
    ],
    pickTitle: "Tanlovni nimadan boshlash",
    pickText:
      "Sanoat maydonchasining tipik vazifalari va suhbatni boshlash uchun uzellar. Sxemaning aniq tarkibi — oqava tahliliga ko‘ra.",
    picks: [
      { slug: "bio-50", when: "Vaxta posyolkasi, yotoqxona" },
      { slug: "nef-20", when: "Texnika yuvish, sanoat maydonchasi" },
      { slug: "pes-20", when: "Sanoat-yomg‘ir oqavasi qum tutgichi" },
      { slug: "rez-100", when: "Sanoat oqavasi o‘rtachalashtirgichi" },
      { slug: "doz-500", when: "Reagent dozalash, pH korreksiyasi" },
      { slug: "kns-50", when: "Maydoncha oqavasini haydash" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Sanoat oqavasi bo‘yicha ko‘rsatkichlarni kafolatlaysizmi?",
        a: "Faqat tahlildan keyin. Maishiy obyektlarda — posyolka, yotoqxona, oshxona — odatdagi LOS BIO va yog‘ tutgichlar qatori ishlaydi: u yerda hisob foydalanuvchilar soni va me’yorlar bo‘yicha yuritiladi, natija bashoratli. Sanoat oqavasida chiqishdagi ko‘rsatkichlar tarkibga bog‘liq, tahlil va so‘rovnoma bo‘lmasa ularni halol aytib bo‘lmaydi. Tahlildan keyin sxema va ko‘rsatkichlar tijorat taklifida qayd etiladi.",
      },
      {
        q: "Boshlash uchun nima yuborish kerak?",
        a: "Oqava tahlili va to‘ldirilgan so‘rovnoma: kunlik va soatlik sarf, chiqindi xarakteri (tekis yoki zalvorli), pH, harorat, muallaq moddalar, neft mahsulotlari, metallar, KKT va BKT5, chiqarish nuqtasi. Tahlil bo‘lmasa — laboratoriyaga qaysi ko‘rsatkichlarni topshirish va namunani qanday olish kerakligini aytamiz.",
      },
      {
        q: "Maydonchada bir nechta turli oqava bor — bitta qurilma kerakmi?",
        a: "Odatda oqimlar ajratiladi. Posyolka va oshxonaning maishiy oqavasi o‘z liniyasi bilan boradi — yog‘ tutgich va biologik tozalash. Hudud yomg‘ir oqavasi va texnika yuvish — o‘zi bilan: qum tutgich va neft tutgich. Sexning texnologik oqavasi — alohida sxema. Ularni tozalashdan oldin aralashtirish odatda foydasiz: hajm oshadi, oqava esa har bir oqimdan murakkabroq bo‘ladi.",
      },
      {
        q: "Nega korpuslar shishatolali plastikdan, po‘lat yoki beton emas?",
        a: "Kimyoviy chidamlilik. Sanoat oqavasi va dozalash reagentlari uglerodli po‘lat va betonning zaif joyini tez topadi, shishatolali plastik esa kislotali va ishqorli muhitda qoplamasiz va gidroizolyatsiyasiz ishlaydi. Korpus yaxlit, o‘ram o‘zimizniki, shuning uchun kameralar sizning sxemangiz o‘lchamlariga qilinadi. Korpusning grunt yuklari va suzib chiqishga hisobini mahsulot bilan beramiz.",
      },
      {
        q: "Navoiyda ishlaysizmi yoki faqat Toshkentda?",
        a: "Ishlab chiqarish Toshkentda, Navoiygacha taxminan 480 km. O‘zbekiston bo‘ylab yetkazish, montaj, ishga tushirish va rejimga chiqarishni bizning brigadalarimiz maydonchaga chiqib bajaradi. Sotib olinadigan uzellar — nasoslar, havo purkagichlar, KIP — taklifda markalari ochiq ko‘rsatiladi, ularni joyida xizmat ko‘rsatish mumkin bo‘lsin.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "BARCHA MODELLARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Oqava tahlilini yuboring —\nsxema va hisobni qaytaramiz.",
    ctaText:
      "Ishlab chiqarish turi, sarf, zalvorlilik, oqava tahlili va chiqarish nuqtasi. Tozalash sxemasi, uskunalar tarkibi va tijorat taklifini qaytaramiz. Ishlab chiqarish — Toshkent.",
    ctaButton: "HISOBNI OLISH",
    related: {
      title: "Ishlab chiqarish va montaj geografiyasi",
      links: [
        { href: "/solutions/tashkent", label: "Toshkent" },
        { href: "/solutions/samarkand", label: "Samarqand" },
        { href: "/solutions/bukhara", label: "Buxoro" },
        { href: "/solutions/fergana", label: "Farg‘ona" },
        { href: "/solutions/namangan", label: "Namangan" },
      ],
    },
  },

  en: {
    label: "NAVOI AND NAVOI REGION",
    title: "Wastewater treatment\nplants in Navoi.",
    intro:
      "Navoi is an industrial region, and here a treatment plant is sized by effluent composition rather than by headcount. We manufacture fiberglass shells and process chambers in Tashkent, build the flowsheet around your actual effluent, deliver, install and commission with our own crew.",
    sections: [
      {
        title: "What we are usually asked for here",
        text: [
          "Production sites and individual shops with their own process effluent. Industrial storm water from yards, roads, storage and loading areas — grit and oil products. Shift camps and dormitories. Plant canteens. Vehicle depots and equipment wash bays.",
          "Each stream behaves differently. Domestic effluent from a camp or dormitory is predictable and sized by users. Canteen effluent means fats and solids. Wash bay effluent means oil products and sand. Process effluent cannot be guessed from the industry name: two similar plants produce different water. So we split the site into streams and size each one separately.",
        ],
      },
      {
        title: "Industrial effluent: composition drives the flowsheet",
        text: [
          "We start with an analysis and a questionnaire: daily and hourly flow, batch or steady discharge, pH, temperature, suspended solids, oil products, metals, COD and BOD5, and the discharge point. Without those figures any selection is guesswork.",
          "The flowsheet is then assembled from units: equalisation to absorb batch discharges, neutralisation and pH correction with reagent dosing, physico-chemical treatment — coagulation and flocculation followed by DAF flotation or settling — then filtration, a biological stage where organics remain, and sludge dewatering on a filter press.",
          "Some units drop out, others have to be reinforced. That is the point of the analysis: the flowsheet follows the effluent, not a catalogue package.",
        ],
      },
      {
        title: "Shells, effluent temperature and site work ≈480 km away",
        text: [
          "On an industrial site the shell lives in an aggressive medium: acidic and alkaline effluent, dosing reagents, dissolved salts. Carbon steel needs coating and its renewal, concrete needs waterproofing and chemical protection. Filament-wound fiberglass is chemically resistant and monolithic — no leaking joints. Chambers and internals are wound to your flowsheet, not picked from a standard range.",
          "Temperature matters too. Summers here are hot and part of the industrial effluent arrives warm or hot. Before a biological stage it has to be cooled — diluting it by eye upsets the process — so cooling is a calculated unit in the flowsheet.",
          "Manufacturing is in Tashkent, about 480 km from Navoi. Delivery, installation, commissioning and start-up are done by our own crew on site. Calculations follow KMK 2.04.03-19 and KMK 2.04.01-98 and can be shown to your designer.",
        ],
      },
    ],
    pickTitle: "Where to start",
    pickText:
      "Typical industrial-site tasks and the units to start the conversation with. The exact flowsheet follows the effluent analysis.",
    picks: [
      { slug: "bio-50", when: "Shift camp, dormitory" },
      { slug: "nef-20", when: "Vehicle wash, industrial site" },
      { slug: "pes-20", when: "Grit trap for industrial storm water" },
      { slug: "rez-100", when: "Industrial flow equalisation" },
      { slug: "doz-500", when: "Reagent dosing, pH correction" },
      { slug: "kns-50", when: "Site sewage pumping" },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do you guarantee effluent quality for industrial water?",
        a: "Only after an analysis. For domestic objects — camp, dormitory, canteen — the standard BIO plants and grease traps apply and the result is predictable. For industrial effluent the outlet figures depend on composition, so we commit to them only once the analysis and questionnaire are in hand; the flowsheet and figures are then fixed in the quotation.",
      },
      {
        q: "What should we send to start?",
        a: "An effluent analysis and a filled questionnaire: daily and hourly flow, steady or batch discharge, pH, temperature, suspended solids, oil products, metals, COD and BOD5, and the discharge point. If there is no analysis yet, we will tell you which parameters to test and how to take a representative sample.",
      },
      {
        q: "Several different streams on one site — one plant or several?",
        a: "Normally the streams are kept separate: domestic effluent with a grease trap and biological treatment, storm water and wash bay with a grit trap and oil separator, process effluent on its own flowsheet. Mixing them before treatment usually costs more and makes the water harder to treat.",
      },
      {
        q: "Why fiberglass instead of steel or concrete?",
        a: "Chemical resistance. Industrial effluent and dosing reagents find the weak spot in carbon steel and concrete, while fiberglass works in acidic and alkaline media without coating or waterproofing. The shell is monolithic and wound in-house, so chambers are made to your flowsheet. Soil load and buoyancy calculations come with the unit.",
      },
      {
        q: "Do you work in Navoi or only in Tashkent?",
        a: "Manufacturing is in Tashkent, about 480 km from Navoi. Delivery across Uzbekistan, installation, commissioning and start-up are done by our own crews. Bought-in items — pumps, blowers, instruments — are listed in the quotation with open brands so they can be serviced locally.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW ALL MODELS",
    allHref: "/products",
    ctaTitle: "Send the effluent analysis —\nwe return a flowsheet.",
    ctaText:
      "Type of production, flow, batch pattern, effluent analysis and discharge point. We return a treatment flowsheet, equipment list and a quotation. Manufactured in Tashkent.",
    ctaButton: "GET A QUOTE",
    related: {
      title: "Where we deliver and install",
      links: [
        { href: "/solutions/tashkent", label: "Tashkent" },
        { href: "/solutions/samarkand", label: "Samarkand" },
        { href: "/solutions/bukhara", label: "Bukhara" },
        { href: "/solutions/fergana", label: "Fergana" },
        { href: "/solutions/namangan", label: "Namangan" },
      ],
    },
  },

  zh: {
    label: "纳沃伊及纳沃伊州",
    title: "纳沃伊\n污水处理设备。",
    intro:
      "纳沃伊是工业地区，处理设备按废水成分选型，而不是按人数。玻璃钢罐体与工艺池在塔什干生产，工艺流程按实际废水搭配，运至现场，由我们自己的队伍安装调试。",
    sections: [
      {
        title: "本地常见对象",
        text: [
          "带自有工艺废水的厂区与车间；厂区工业雨水（道路、堆场、装卸区，含砂与油品）；轮班营地与宿舍；企业食堂；车辆车间与洗车台。",
          "各股废水性质不同：营地与宿舍的生活污水按人数计算，可预测；食堂废水是油脂与悬浮物；洗车与车队废水是油品与砂；车间工艺废水无法凭行业名称推断——同类企业的水质可能完全不同。因此我们把厂区分成若干股，分别计算。",
        ],
      },
      {
        title: "工业废水：成分决定工艺",
        text: [
          "先做水质分析与调查表：日流量与时流量、连续还是间歇（冲击）排放、pH、温度、悬浮物、石油类、金属、COD 与 BOD5、排放去向。没有这些数据，任何选型都是猜测。",
          "工艺按成分组合：均质（缓冲冲击排放）→ 中和与加药调 pH（按仪表控制）→ 物化处理（混凝絮凝，随后气浮 DAF 或沉淀）→ 过滤；若仍有物化去除不了的有机物，增加生物段；污泥用板框压滤机脱水，外运泥饼而非泥浆。",
          "有的单元可以省，有的必须加强。分析的意义就在于：工艺跟着水质走，而不是让水质迁就成套设备。",
        ],
      },
      {
        title: "罐体、水温与 ≈480 公里外的现场作业",
        text: [
          "工业现场介质具腐蚀性：酸性和碱性废水、加药试剂、溶解盐。碳钢需要涂层并定期修复，混凝土需要防水与防腐；自缠绕玻璃钢耐化学腐蚀，罐体整体成型、无渗漏接缝。工艺池、隔板与管路按您的工艺定制，不从标准系列里挑。",
          "水温也要单独处理：本地夏季炎热，部分工业废水到达时是热水或温水。进入生物段前必须降温——凭感觉兑冷水只会打乱运行，因此冷却是工艺中带计算的独立单元。",
          "生产在塔什干，距纳沃伊约 480 公里。运输、安装、调试与投运由我们的外派队伍完成。计算依据 KMK 2.04.03-19 与 KMK 2.04.01-98，可提供给设计单位与审查。",
        ],
      },
    ],
    pickTitle: "从哪里开始选型",
    pickText: "工业厂区的典型任务与起点单元。精确工艺依据水质分析。",
    picks: [
      { slug: "bio-50", when: "轮班营地、宿舍" },
      { slug: "nef-20", when: "车辆清洗、厂区" },
      { slug: "pes-20", when: "工业雨水沉砂" },
      { slug: "rez-100", when: "工业废水均质罐" },
      { slug: "doz-500", when: "加药、pH 调节" },
      { slug: "kns-50", when: "厂区污水提升" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "工业废水的出水指标能保证吗？",
        a: "需先做水质分析。生活类对象（营地、宿舍、食堂）用常规 BIO 一体化设备与隔油器，按人数与规范计算，结果可预期；工业废水的出水取决于成分，在拿到分析与调查表之前无法诚实承诺。分析之后，工艺与指标写入报价。",
      },
      {
        q: "开始前需要提供什么？",
        a: "水质分析与填好的调查表：日/时流量、连续或冲击排放、pH、温度、悬浮物、石油类、金属、COD 与 BOD5、排放去向。若尚无分析，我们会说明需检测哪些指标以及如何取有代表性的水样。",
      },
      {
        q: "厂区有多股废水，用一套还是多套？",
        a: "通常分开处理：生活污水走隔油器与生物处理；雨水与洗车废水走沉砂池与油水分离器；车间工艺废水单独成套。处理前混合往往更贵，水质也更难处理。",
      },
      {
        q: "为什么用玻璃钢而不是钢或混凝土？",
        a: "耐化学腐蚀。工业废水与加药试剂很快会攻破碳钢和混凝土的薄弱处，玻璃钢在酸碱介质中无需涂层和防水即可工作。罐体整体自缠绕，工艺池按您的流程定制，随货提供土压与抗浮计算。",
      },
      {
        q: "你们在纳沃伊施工吗，还是只做塔什干？",
        a: "生产在塔什干，距纳沃伊约 480 公里。乌兹别克斯坦全境的运输、安装、调试与投运由我们自己的队伍到现场完成。外购件（泵、风机、仪表）在报价中公开注明品牌，便于本地维护。",
      },
    ],
    allTitle: "全部产品",
    allButton: "查看所有型号",
    allHref: "/products",
    ctaTitle: "发送水质分析——\n我们回复工艺与计算。",
    ctaText:
      "生产类型、流量、冲击排放情况、水质分析与排放去向。我们回复处理工艺、设备清单与报价。塔什干生产。",
    ctaButton: "获取报价",
    related: {
      title: "供货与安装地区",
      links: [
        { href: "/solutions/tashkent", label: "塔什干" },
        { href: "/solutions/samarkand", label: "撒马尔罕" },
        { href: "/solutions/bukhara", label: "布哈拉" },
        { href: "/solutions/fergana", label: "费尔干纳" },
        { href: "/solutions/namangan", label: "纳曼干" },
      ],
    },
  },
};

export default content;
