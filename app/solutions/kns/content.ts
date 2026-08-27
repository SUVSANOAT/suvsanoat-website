import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «КНС для дома / посёлка», «насосная станция
 * канализации». Ведёт на линейку КНС.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ПЕРЕКАЧКА СТОКОВ",
    title: "КНС: когда канализация\nне течёт сама.",
    intro:
      "Выпуск ниже коллектора, посёлок за подъёмом, подвал с санузлами — сток приходится поднимать насосами. Разбираем, из чего состоит станция, какие четыре числа нужны для подбора и почему насосов всегда два.",
    sections: [
      {
        title: "Из чего состоит станция и что здесь наше",
        text: [
          "КНС — это подземный корпус, внутри которого сток накапливается между уровнями пуска и остановки и откачивается погружными насосами в напорный трубопровод. Корпус, направляющие насосов, опорные колена, напорную обвязку с арматурой, площадку обслуживания и лестницу производим мы — из стеклопластика с кольцами жёсткости, как и резервуары.",
          "Насосы, поплавковые датчики и шкаф управления — покупные: они подбираются под расход и напор конкретного объекта, и честный поставщик не станет прятать их марку. Паспорта передаются с изделием.",
          "Полезный объём между уровнями мы считаем не на глаз, а по допустимой частоте пусков насоса: V = Q·t/4, где t — минимальный цикл. Заниженный объём — это частые пуски и сгоревший двигатель на второй год; именно так умирает большинство «дешёвых» станций.",
        ],
      },
      {
        title: "Четыре числа для подбора",
        text: [
          "Первое — расчётный расход стока: по жителям или по объекту. Второе — геодезическая высота подъёма: разница отметок между дном станции и точкой излива. Третье — длина и диаметр напорного трубопровода: по ним считаются потери. Четвёртое — отметка лотка подводящего коллектора: она задаёт глубину корпуса.",
          "Из этих четырёх чисел строится рабочая точка насоса. Каталожная глубина корпуса 3 000 мм — типовая; фактическую делаем под отметку вашего коллектора, корпус наматывается на нужную длину.",
          "Если есть профиль трассы или проект — приложите. Если нет, достаточно плана с отметками: посчитаем сами и вернём подбор станции вместе с рекомендацией по насосам.",
        ],
      },
    ],
    pickTitle: "Какая станция нужна объекту",
    pickText:
      "Ориентиры по типовым объектам. Точный подбор — по четырём числам: расход, высота подъёма, напорная линия, отметка коллектора.",
    picks: [
      { slug: "kns-5", when: "Дом, кафе, небольшой объект" },
      { slug: "kns-10", when: "Группа домов, гостиница" },
      { slug: "kns-25", when: "Посёлок, торговый центр" },
      { slug: "kns-50", when: "Микрорайон, промплощадка" },
      { slug: "kns-75", when: "Крупный жилой массив" },
      { slug: "kns-100", when: "Промышленный объект, коллектор" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Почему два насоса, если хватает одного?",
        a: "Один рабочий, один резервный, с автоматическим чередованием. Насос — единственный изнашиваемый узел станции, и когда он останавливается, канализация не ждёт ремонта: сток прибывает каждую минуту. Станция с одним насосом экономит деньги ровно до первого отказа.",
      },
      {
        q: "У нас коллектор глубоко — 4,5 метра. Подойдёт ли станция?",
        a: "Да. 3 000 мм в таблице — каталожная глубина; корпус изготавливается под отметку вашего лотка, хоть 6 метров. Меняется длина цилиндра и количество колец жёсткости, расчёт устойчивости мы выдаём с изделием.",
      },
      {
        q: "Будет ли запах?",
        a: "В приёмном резервуаре образуется сероводород, поэтому у станции обязателен приточно-вытяжной стояк. При исправной вентиляции запаха на площадке нет. Внутрь без газоанализатора не спускаться — это не формальность, сероводород опасен.",
      },
      {
        q: "Какие насосы вы ставите?",
        a: "Подбираем под рабочую точку из доступных на рынке марок и согласуем с вами до счёта: марка и типоразмер написаны в КП открыто, паспорта передаются с изделием. Привязки к одному бренду нет — конструкция направляющих принимает стандартные погружные насосы.",
      },
      {
        q: "Что по обслуживанию?",
        a: "Раз в месяц — визуальный осмотр и проверка чередования насосов; раз в полгода — подъём насосов по направляющим и осмотр рабочих колёс, для этого не нужно спускаться в корпус. Жир и мусор в сток не пускать: перед станцией общепита ставится жироуловитель, решётчатая корзина есть в комплекте.",
      },
    ],
    allTitle: "ВСЯ ЛИНЕЙКА",
    allButton: "СМОТРЕТЬ МОДЕЛИ КНС",
    allHref: "/products#pump-stations",
    ctaTitle: "Пришлите четыре числа —\nвернём станцию.",
    ctaText:
      "Расход, высота подъёма, длина напорной линии, отметка коллектора. Вернём подбор корпуса, рабочую точку насосов и схему установки.",
    ctaButton: "ПОЛУЧИТЬ ПОДБОР",
  },

  uz: {
    label: "OQAVANI HAYDASH",
    title: "KNS: kanalizatsiya o‘zi\noqmaganda.",
    intro:
      "Chiqish kollektordan past, qishloq ko‘tarilish ortida, yerto‘lada sanuzellar — oqavani nasoslar bilan ko‘tarishga to‘g‘ri keladi. Stansiya nimadan iborat, tanlov uchun qaysi to‘rt raqam kerak va nega nasoslar doim ikkita.",
    sections: [
      {
        title: "Stansiya nimadan iborat va nimasi bizniki",
        text: [
          "KNS — yer osti korpusi: oqava pusk va to‘xtash sathlari orasida to‘planadi va botiq nasoslar bilan bosim quvuriga haydaladi. Korpus, nasos yo‘naltiruvchilari, tayanch tirsaklar, bosim obvyazkasi, xizmat maydonchasi va zinapoyani biz ishlab chiqaramiz — qattiqlik halqali shishatolali plastikdan.",
          "Nasoslar, kalqovich datchiklar va boshqaruv shkafi — sotib olinadi: ular aniq obyektning sarfi va bosimiga tanlanadi. Pasportlar mahsulot bilan beriladi.",
          "Sathlar orasidagi foydali hajmni taxminan emas, nasosning ruxsat etilgan pusk chastotasi bo‘yicha hisoblaymiz: V = Q·t/4. Kichraytirilgan hajm — tez-tez pusk va ikkinchi yilda kuygan dvigatel.",
        ],
      },
      {
        title: "Tanlov uchun to‘rt raqam",
        text: [
          "Birinchisi — oqavaning hisobiy sarfi. Ikkinchisi — geodezik ko‘tarilish balandligi. Uchinchisi — bosim quvurining uzunligi va diametri. To‘rtinchisi — keluvchi kollektor tagining belgisi: u korpus chuqurligini beradi.",
          "Shu to‘rt raqamdan nasosning ishchi nuqtasi hisoblanadi. Katalogdagi 3 000 mm — tipik chuqurlik; haqiqiysini kollektoringiz belgisiga qarab tayyorlaymiz.",
          "Trassa profili yoki loyiha bo‘lsa — qo‘shib yuboring. Bo‘lmasa, belgilar bilan reja yetarli: o‘zimiz hisoblab, nasoslar tavsiyasi bilan tanlovni qaytaramiz.",
        ],
      },
    ],
    pickTitle: "Obyektga qaysi stansiya kerak",
    pickText:
      "Tipik obyektlar bo‘yicha mo‘ljallar. Aniq tanlov — to‘rt raqam bo‘yicha: sarf, ko‘tarilish, bosim liniyasi, kollektor belgisi.",
    picks: [
      { slug: "kns-5", when: "Uy, kafe, kichik obyekt" },
      { slug: "kns-10", when: "Uylar guruhi, mehmonxona" },
      { slug: "kns-25", when: "Qishloq, savdo markazi" },
      { slug: "kns-50", when: "Mikrorayon, sanoat maydonchasi" },
      { slug: "kns-75", when: "Yirik turar-joy massivi" },
      { slug: "kns-100", when: "Sanoat obyekti, kollektor" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Bitta nasos yetsa, nega ikkita?",
        a: "Biri ishchi, biri zaxira, avtomatik navbatlashish bilan. Nasos — stansiyaning yagona yeyiladigan uzeli, u to‘xtaganda kanalizatsiya ta‘mirni kutmaydi. Bitta nasosli stansiya birinchi buzilishgacha tejaydi.",
      },
      {
        q: "Kollektorimiz chuqur — 4,5 metr. Stansiya to‘g‘ri keladimi?",
        a: "Ha. Jadvaldagi 3 000 mm — katalog chuqurligi; korpus lotogingiz belgisiga qarab, hatto 6 metrgacha tayyorlanadi. Silindr uzunligi va halqalar soni o‘zgaradi, chidamlilik hisobini mahsulot bilan beramiz.",
      },
      {
        q: "Hid bo‘ladimi?",
        a: "Qabul rezervuarida vodorod sulfid hosil bo‘ladi, shuning uchun kirish-chiqish stoyakasi majburiy. Ventilyatsiya soz bo‘lsa, maydonchada hid yo‘q. Ichkariga gaz analizatorisiz tushilmaydi.",
      },
      {
        q: "Qaysi nasoslarni qo‘yasizlar?",
        a: "Bozorda mavjud markalardan ishchi nuqtaga tanlaymiz va hisobdan oldin siz bilan kelishamiz: marka va o‘lcham KPda ochiq yoziladi. Bitta brendga bog‘lanish yo‘q — yo‘naltiruvchilar standart botiq nasoslarni qabul qiladi.",
      },
      {
        q: "Xizmat ko‘rsatish qanday?",
        a: "Oyiga bir marta — ko‘zdan kechirish va nasoslar navbatlashishini tekshirish; yarim yilda bir marta — nasoslarni yo‘naltiruvchilar bo‘ylab ko‘tarib ko‘rish, buning uchun korpusga tushish shart emas. Umumiy ovqatlanish oldiga yog‘ tutgich qo‘yiladi.",
      },
    ],
    allTitle: "BUTUN LINIYA",
    allButton: "KNS MODELLARINI KO‘RISH",
    allHref: "/products#pump-stations",
    ctaTitle: "To‘rt raqamni yuboring —\nstansiyani qaytaramiz.",
    ctaText:
      "Sarf, ko‘tarilish balandligi, bosim liniyasi uzunligi, kollektor belgisi. Korpus tanlovi, nasoslar ishchi nuqtasi va o‘rnatish sxemasini qaytaramiz.",
    ctaButton: "TANLOVNI OLISH",
  },

  en: {
    label: "SEWAGE PUMPING",
    title: "A pumping station: when\nsewage will not flow by itself.",
    intro:
      "The outlet sits below the sewer, the settlement lies beyond a rise, the bathrooms are in a basement — the flow has to be lifted. What the station consists of, the four numbers that size it, and why there are always two pumps.",
    sections: [
      {
        title: "What the station is made of, and what is ours",
        text: [
          "A pumping station is a buried shell where the flow accumulates between start and stop levels and is lifted by submersible pumps into a rising main. We manufacture the shell, the guide rails, the duck-foot bends, the discharge pipework, the service platform and the ladder — GRP with stiffening rings, like our tanks.",
          "The pumps, float switches and control panel are bought in, selected for the duty of the particular site — and an honest supplier does not hide their make. Datasheets are handed over with the product.",
          "The working volume between levels is calculated from the permitted start frequency: V = Q·t/4. An undersized volume means frequent starts and a burnt-out motor in the second year — that is how most cheap stations die.",
        ],
      },
      {
        title: "The four numbers that size it",
        text: [
          "First, the design flow. Second, the static lift — the level difference between the station bottom and the discharge point. Third, the length and diameter of the rising main, which set the losses. Fourth, the invert level of the incoming sewer, which sets the shell depth.",
          "From these four the pump duty point follows. The catalogue depth of 3,000 mm is typical; the actual shell is wound to the depth your sewer requires.",
          "If a route profile or design exists, attach it. If not, a plan with levels is enough — we calculate the rest and return the selection with a pump recommendation.",
        ],
      },
    ],
    pickTitle: "Which station the site needs",
    pickText:
      "Guides by typical objects. The exact selection follows from four numbers: flow, lift, rising main, sewer invert.",
    picks: [
      { slug: "kns-5", when: "House, café, small site" },
      { slug: "kns-10", when: "Group of houses, hotel" },
      { slug: "kns-25", when: "Settlement, shopping centre" },
      { slug: "kns-50", when: "Residential district, industrial site" },
      { slug: "kns-75", when: "Large housing estate" },
      { slug: "kns-100", when: "Industrial plant, trunk sewer" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "Why two pumps when one is enough?",
        a: "One duty, one standby, alternating automatically. The pump is the only wearing part of the station, and when it stops, sewage does not wait for repairs. A single-pump station saves money exactly until the first failure.",
      },
      {
        q: "Our sewer is deep — 4.5 metres. Will it fit?",
        a: "Yes. The 3,000 mm in the table is a catalogue figure; the shell is made to your invert, six metres if needed. The cylinder length and ring count change, and the stability calculation comes with the product.",
      },
      {
        q: "Will it smell?",
        a: "Hydrogen sulphide forms in the wet well, so a supply-and-extract stack is mandatory. With working ventilation there is no smell at grade. Never enter without a gas detector — that is not a formality.",
      },
      {
        q: "Which pumps do you fit?",
        a: "We select for the duty point from makes available on the market and agree it with you before invoicing: the make and size are stated openly in the quotation. The guide rails accept standard submersible pumps — no single-brand lock-in.",
      },
      {
        q: "What about maintenance?",
        a: "Monthly — a visual check and pump alternation test; twice a year — lifting the pumps on the rails to inspect the impellers, no entry into the shell required. Keep grease out: catering outlets get a grease trap upstream.",
      },
    ],
    allTitle: "FULL LINE",
    allButton: "VIEW THE PUMPING STATION LINE",
    allHref: "/products#pump-stations",
    ctaTitle: "Send four numbers —\nwe return the station.",
    ctaText:
      "Flow, static lift, rising main length, sewer invert. We return the shell selection, the pump duty point and an installation drawing.",
    ctaButton: "GET A SELECTION",
  },

  zh: {
    label: "污水提升",
    title: "污水泵站：当污水\n无法自流时。",
    intro:
      "排出口低于管网、村镇在高坡之后、卫生间在地下室——污水必须用泵提升。泵站由什么组成、选型需要哪四个数字、为什么水泵永远是两台。",
    sections: [
      {
        title: "泵站的组成，哪些是我们制造的",
        text: [
          "泵站是埋地筒体：污水在启停液位之间蓄存，由潜水泵经压力管道提升。筒体、导轨、耦合底座、压力管路、检修平台和爬梯由我们制造——带加强环的玻璃钢，与储罐同工艺。",
          "水泵、浮球开关和控制柜为外购件，按具体项目的流量与扬程选型——诚实的供应商不会隐瞒品牌。技术文件随产品移交。",
          "启停液位间的有效容积按水泵允许启动频率计算：V = Q·t/4。容积偏小意味着频繁启动、第二年烧电机——多数'便宜'泵站正是这样报废的。",
        ],
      },
      {
        title: "选型需要的四个数字",
        text: [
          "第一，设计流量。第二，几何提升高度——泵站底部与出水点的标高差。第三，压力管道的长度与管径——决定水头损失。第四，来水管管底标高——决定筒体深度。",
          "由这四个数字得出水泵工作点。目录中 3 000 mm 为典型深度；实际筒体按您的管底标高缠绕制造。",
          "有管线纵剖面或设计文件请一并提供；没有的话，带标高的平面图就够——其余我们来算。",
        ],
      },
    ],
    pickTitle: "您的项目需要哪个规格",
    pickText: "按典型对象给出参考。精确选型依据四个数字：流量、提升高度、压力管线、管底标高。",
    picks: [
      { slug: "kns-5", when: "住宅、餐饮、小型项目" },
      { slug: "kns-10", when: "住宅组团、酒店" },
      { slug: "kns-25", when: "村镇、购物中心" },
      { slug: "kns-50", when: "住宅小区、工业场地" },
      { slug: "kns-75", when: "大型居住区" },
      { slug: "kns-100", when: "工业企业、干管" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "一台泵够用，为什么要两台？",
        a: "一用一备，自动轮换。水泵是泵站唯一的磨损件，它一停，污水不会等待维修。单泵泵站省钱只省到第一次故障为止。",
      },
      {
        q: "我们的管网很深——4,5 米，能做吗？",
        a: "能。表中 3 000 mm 是目录值；筒体按您的管底标高制造，六米也可以。改变的是筒体长度和加强环数量，稳定性计算随产品提供。",
      },
      {
        q: "会有异味吗？",
        a: "集水井内会产生硫化氢，因此送排风立管必须设置。通风正常时地面无异味。未携气体检测仪禁止入井——这不是形式主义。",
      },
      {
        q: "你们配什么水泵？",
        a: "按工作点从市场在售品牌中选型，开票前与您确认：报价单中公开写明品牌与规格。导轨接受标准潜水泵——不绑定单一品牌。",
      },
      {
        q: "维护怎么做？",
        a: "每月目视检查并测试水泵轮换；每半年沿导轨提泵检查叶轮，无需下井。别让油脂进入：餐饮排水上游设隔油器。",
      },
    ],
    allTitle: "全系列",
    allButton: "查看泵站系列",
    allHref: "/products#pump-stations",
    ctaTitle: "发来四个数字——\n我们返回泵站选型。",
    ctaText: "流量、提升高度、压力管长、管底标高。我们将返回筒体选型、水泵工作点和安装图。",
    ctaButton: "获取选型",
  },
};

export default content;
