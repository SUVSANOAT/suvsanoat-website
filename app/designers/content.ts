import type { Language } from "../translations";

/**
 * Страница «Проектировщикам».
 *
 * ЛОС, КНС и резервуары попадают на объект через проект: их закладывает
 * проектная организация на стадии П, а покупает генподрядчик то, что
 * уже в проекте. Эта страница даёт проектировщику всё, что нужно,
 * чтобы заложить оборудование SUVSANOAT: расчётные основания,
 * габаритные чертежи, опросные листы.
 */

export type DesignerDownload = {
  code: string;
  title: string;
  pdf: string;
  docx: string;
};

export type DesignerContent = {
  label: string;
  title: string;
  intro: string;
  sections: { title: string; text: string[] }[];
  downloadsTitle: string;
  downloadsText: string;
  pdfLabel: string;
  docxLabel: string;
  downloads: DesignerDownload[];
  basisTitle: string;
  basis: { q: string; a: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

const FILES = {
  zhir: {
    pdf: "/docs/Oprosnyi_list_ZHIR_zhirouloviteli.pdf",
    docx: "/docs/Oprosnyi_list_ZHIR_zhirouloviteli.docx",
  },
  nef: {
    pdf: "/docs/Oprosnyi_list_NEF_PES_livnevka.pdf",
    docx: "/docs/Oprosnyi_list_NEF_PES_livnevka.docx",
  },
  bio: {
    pdf: "/docs/Oprosnyi_list_BIO_LOS.pdf",
    docx: "/docs/Oprosnyi_list_BIO_LOS.docx",
  },
  kns: {
    pdf: "/docs/Oprosnyi_list_KNS.pdf",
    docx: "/docs/Oprosnyi_list_KNS.docx",
  },
  rez: {
    pdf: "/docs/Oprosnyi_list_REZ_rezervuary.pdf",
    docx: "/docs/Oprosnyi_list_REZ_rezervuary.docx",
  },
  elh: {
    pdf: "/docs/Oprosnyi_list_ELH_DOZ_reagenty.pdf",
    docx: "/docs/Oprosnyi_list_ELH_DOZ_reagenty.docx",
  },
};

export const DESIGNERS: Record<Language, DesignerContent> = {
  ru: {
    label: "Проектировщикам",
    title: "Заложите оборудование\nSUVSANOAT в проект",
    intro:
      "Полный комплект данных для стадий П и Р: расчётные основания, таблицы характеристик, габаритные чертежи и опросные листы. Производство — Ташкент, размеры корпусов подгоняются под объект.",
    sections: [
      {
        title: "Почему с нами удобно проектировать",
        text: [
          "Все модели на этом сайте посчитаны, а не срисованы с каталога: гидравлика сепараторов — по Стоксу и EN 1825, биология — по ҚМҚ 2.04.03-19 и DWA-A 131, ёмкости — с проверкой оболочки на смятие. На странице каждой модели — таблица характеристик и габаритный чертёж, которые можно брать в пояснительную записку.",
          "Корпуса наматываются на нашем производстве в Ташкенте. Поэтому проектировщик не привязан к чужому каталогу: глубина подводящего коллектора, расположение и диаметр патрубков, высота горловин меняются под объект без «согласования с заводом за границей». Нестандартный размер — это пересчёт конструкции, а не отказ.",
          "По заполненному опросному листу мы готовим коммерческое предложение с габаритным чертежом и массой изделия — его достаточно для спецификации оборудования и раздела ТХ.",
        ],
      },
      {
        title: "Как заложить в проект",
        text: [
          "Шаг 1. Выберите линейку и модель по таблицам раздела «Ассортимент» — в каждой линейке указана расчётная основа подбора.",
          "Шаг 2. Скачайте опросный лист ниже и внесите данные объекта: расход, характер стоков, глубину коллектора, условия площадки.",
          "Шаг 3. Отправьте лист на suvsanoat@gmail.com — вернём КП с габаритным чертежом, массой и схемой установки.",
          "Шаг 4. В спецификацию вносится обозначение модели (например, SST-BIO-50). Если параметры объекта не совпадают со стандартным рядом — изготовим промежуточный типоразмер.",
        ],
      },
    ],
    downloadsTitle: "Опросные листы",
    downloadsText:
      "Один лист — одна страница. PDF — для печати, DOCX — для заполнения на компьютере.",
    pdfLabel: "PDF",
    docxLabel: "DOCX",
    downloads: [
      { code: "ЖИР", title: "Жироуловители", ...FILES.zhir },
      { code: "НЕФ · ПЕС", title: "Нефтеуловители и песколовки, ливнёвка", ...FILES.nef },
      { code: "БИО", title: "Локальные очистные сооружения", ...FILES.bio },
      { code: "КНС", title: "Канализационные насосные станции", ...FILES.kns },
      { code: "РЕЗ", title: "Резервуары и ёмкости", ...FILES.rez },
      { code: "ЭЛХ · ДОЗ", title: "Электролизные установки и дозирование", ...FILES.elh },
    ],
    basisTitle: "Расчётные основания по линейкам",
    basis: [
      {
        q: "ЖИР — жироуловители",
        a: "Гидравлика по EN 1825-2, всплытие капли жира по Стоксу, время пребывания при номинальном расходе — не менее 60 минут.",
      },
      {
        q: "НЕФ — нефтеуловители",
        a: "Осаждение капли нефтепродукта 100 мкм при 15 °C, ламельные модули, гидравлическая нагрузка на зеркало ниже скорости всплытия.",
      },
      {
        q: "ПЕС — песколовки",
        a: "Задержание частиц крупностью 0,15–0,25 мм (ҚМҚ 2.04.03-19, п. 6.27, табл. 27–28); осадочная часть — 300 л на 1 л/с расхода (практика; п. 6.32 — не более двухсуточного объёма песка).",
      },
      {
        q: "РЕЗ — резервуары",
        a: "Проверка цилиндрической оболочки на смятие грунтом и грунтовыми водами; кольца жёсткости с шагом 800 мм.",
      },
      {
        q: "КНС — насосные станции",
        a: "Рабочий объём V = Q·t/4 по допустимой частоте пусков насоса; два насоса — рабочий и резервный, от 150 м³/ч — три.",
      },
      {
        q: "БИО — очистные сооружения",
        a: "Нагрузки по ҚМҚ 2.04.03-19 (табл. 25, продлённая аэрация п. 6.175, воздух по ф. (70) п. 6.156, аэробная стабилизация п. 6.373); возраст ила 15 суток и кислородный баланс AOR→SOTR — по DWA-A 131 (в ҚМҚ не нормируются).",
      },
      {
        q: "ЭЛХ — электролизные установки",
        a: "3,2 кг соли и 4,5 кВт·ч на 1 кг активного хлора; вентиляция помещения рассчитана по выделению водорода.",
      },
      {
        q: "ДОЗ — станции дозирования",
        a: "Подача, г/ч = доза, г/м³ × расход, м³/ч; два насоса-дозатора, запас раствора в баке — на сутки работы.",
      },
    ],
    faqTitle: "Частые вопросы проектировщиков",
    faq: [
      {
        q: "Пройдёт ли это экспертизу?",
        a: "Методики и нормы, по которым посчитана каждая модель, указаны прямо на её странице. По запросу предоставим расчётную записку по конкретному изделию для приложения к проекту.",
      },
      {
        q: "У объекта нестандартные параметры",
        a: "Стандартный ряд — это опорные точки. Промежуточные производительности, другая глубина коллектора, иное расположение патрубков — изготавливаем под заказ с пересчётом конструкции.",
      },
      {
        q: "Какие данные нужны для КП?",
        a: "Заполненный опросный лист. Если его нет — минимум четыре числа: расход, характер стоков, глубина подводящего коллектора и место установки (грунты, грунтовые воды, проезд транспорта).",
      },
    ],
    ctaTitle: "Готовите проект\nс очистными сооружениями?",
    ctaText:
      "Отправьте опросный лист или просто исходные данные объекта — вернём коммерческое предложение с габаритным чертежом и массой для спецификации.",
    ctaButton: "Получить КП с чертежом",
  },

  uz: {
    label: "Loyihachilarga",
    title: "SUVSANOAT uskunasini\nloyihaga kiriting",
    intro:
      "P va R bosqichlari uchun to‘liq ma’lumot: hisob asoslari, xarakteristika jadvallari, gabarit chizmalari va so‘rovnomalar. Ishlab chiqarish — Toshkent, korpus o‘lchamlari obyektga moslanadi.",
    sections: [
      {
        title: "Nega biz bilan loyihalash qulay",
        text: [
          "Saytdagi barcha modellar hisoblangan: separatorlar gidravlikasi — Stokes va EN 1825 bo‘yicha, biologiya — QMQ 2.04.03-19 va DWA-A 131 bo‘yicha, idishlar — ezilishga tekshirilgan. Har bir model sahifasida jadval va gabarit chizmasi bor.",
          "Korpuslar Toshkentdagi ishlab chiqarishimizda o‘raladi. Shuning uchun kollektor chuqurligi, patrubkalar joylashuvi va diametri obyektga qarab o‘zgartiriladi. Nostandart o‘lcham — bu rad etish emas, konstruksiyani qayta hisoblash.",
          "To‘ldirilgan so‘rovnoma bo‘yicha gabarit chizmasi va massasi bilan tijorat taklifini tayyorlaymiz — spetsifikatsiya uchun yetarli.",
        ],
      },
      {
        title: "Loyihaga qanday kiritiladi",
        text: [
          "1-qadam. «Assortiment» bo‘limidagi jadvallar bo‘yicha liniya va modelni tanlang.",
          "2-qadam. Quyidagi so‘rovnomani yuklab oling va obyekt ma’lumotlarini kiriting: sarf, oqova turi, kollektor chuqurligi, maydon sharoiti.",
          "3-qadam. Varaqni suvsanoat@gmail.com ga yuboring — gabarit chizmasi va massasi bilan TT qaytaramiz.",
          "4-qadam. Spetsifikatsiyaga model belgisi kiritiladi (masalan, SST-BIO-50). Parametrlar standart qatorga mos kelmasa — oraliq o‘lcham tayyorlaymiz.",
        ],
      },
    ],
    downloadsTitle: "So‘rovnomalar",
    downloadsText:
      "Bitta varaq — bitta sahifa. PDF — chop etish uchun, DOCX — kompyuterda to‘ldirish uchun.",
    pdfLabel: "PDF",
    docxLabel: "DOCX",
    downloads: [
      { code: "ЖИР", title: "Yog‘ tutgichlar", ...FILES.zhir },
      { code: "НЕФ · ПЕС", title: "Neft tutgichlar va qum tutgichlar", ...FILES.nef },
      { code: "БИО", title: "Lokal tozalash inshootlari", ...FILES.bio },
      { code: "КНС", title: "Kanalizatsiya nasos stansiyalari", ...FILES.kns },
      { code: "РЕЗ", title: "Rezervuar va idishlar", ...FILES.rez },
      { code: "ЭЛХ · ДОЗ", title: "Elektroliz va dozalash", ...FILES.elh },
    ],
    basisTitle: "Liniyalar bo‘yicha hisob asoslari",
    basis: [
      { q: "ЖИР — yog‘ tutgichlar", a: "EN 1825-2 gidravlikasi, Stokes bo‘yicha yog‘ tomchisining ko‘tarilishi, turish vaqti kamida 60 daqiqa." },
      { q: "НЕФ — neft tutgichlar", a: "15 °C da 100 mkm tomchining ko‘tarilishi, lamelli modullar." },
      { q: "ПЕС — qum tutgichlar", a: "0,15–0,25 mm zarralarni tutish (QMQ 2.04.03-19, 6.27-band, 27–28-jadvallar); cho‘kma qismi — 1 l/s uchun 300 l (amaliyot)." },
      { q: "РЕЗ — rezervuarlar", a: "Qobiqning grunt bosimiga chidamliligi; 800 mm qadam bilan qattiqlik halqalari." },
      { q: "КНС — nasos stansiyalari", a: "Ish hajmi V = Q·t/4; ikkita nasos — ishchi va zaxira, 150 m³/soatdan — uchta." },
      { q: "БИО — tozalash inshootlari", a: "QMQ 2.04.03-19 yuklamalari (25-jadval, 6.175-band, 6.156-band, 6.373-band); il yoshi 15 sutka va kislorod balansi — DWA-A 131 bo‘yicha (QMQda me’yorlanmagan)." },
      { q: "ЭЛХ — elektroliz", a: "1 kg faol xlor uchun 3,2 kg tuz va 4,5 kVt·soat; ventilyatsiya vodorod bo‘yicha." },
      { q: "ДОЗ — dozalash", a: "Uzatish, g/soat = doza, g/m³ × sarf, m³/soat; ikkita nasos-dozator." },
    ],
    faqTitle: "Loyihachilarning savollari",
    faq: [
      { q: "Ekspertizadan o‘tadimi?", a: "Har bir model qaysi me’yor bo‘yicha hisoblangani sahifasida yozilgan. So‘rov bo‘yicha hisob yozuvini beramiz." },
      { q: "Obyekt parametrlari nostandart", a: "Oraliq unumdorlik, boshqa chuqurlik, boshqa patrubkalar — buyurtma bo‘yicha qayta hisob bilan tayyorlaymiz." },
      { q: "TT uchun qanday ma’lumot kerak?", a: "To‘ldirilgan so‘rovnoma yoki to‘rtta raqam: sarf, oqova turi, kollektor chuqurligi va o‘rnatish joyi." },
    ],
    ctaTitle: "Tozalash inshootlari bilan\nloyiha tayyorlayapsizmi?",
    ctaText:
      "So‘rovnoma yoki obyekt ma’lumotlarini yuboring — gabarit chizmasi va massasi bilan tijorat taklifini qaytaramiz.",
    ctaButton: "Chizma bilan TT olish",
  },

  en: {
    label: "For design engineers",
    title: "Specify SUVSANOAT\nequipment in your project",
    intro:
      "A complete data set for design stages: calculation basis, specification tables, dimensional drawings and questionnaires. Manufactured in Tashkent — vessel dimensions are adapted to the site.",
    sections: [
      {
        title: "Why designers find us convenient",
        text: [
          "Every model on this site is calculated, not copied from a catalogue: separator hydraulics per Stokes and EN 1825, biology per KMK 2.04.03-19 (Uzbekistan) and DWA-A 131, vessels checked for buckling. Each model page carries a specification table and a dimensional drawing.",
          "Shells are filament-wound at our own plant in Tashkent, so inlet depth, nozzle positions and diameters are adapted to the site. A non-standard size means a recalculation, not a refusal.",
          "From a filled questionnaire we prepare a quotation with a dimensional drawing and weight — enough for the equipment specification.",
        ],
      },
      {
        title: "How to specify",
        text: [
          "Step 1. Pick the line and model from the tables in the product range.",
          "Step 2. Download the questionnaire below and fill in the site data: flow, effluent type, collector depth, site conditions.",
          "Step 3. Send it to suvsanoat@gmail.com — we return a quotation with a dimensional drawing and weight.",
          "Step 4. The model designation (e.g. SST-BIO-50) goes into the specification. Intermediate sizes are made to order.",
        ],
      },
    ],
    downloadsTitle: "Questionnaires",
    downloadsText: "One sheet, one page. PDF for print, DOCX to fill in on a computer.",
    pdfLabel: "PDF",
    docxLabel: "DOCX",
    downloads: [
      { code: "ЖИР", title: "Grease traps", ...FILES.zhir },
      { code: "НЕФ · ПЕС", title: "Oil separators and grit traps", ...FILES.nef },
      { code: "БИО", title: "Package treatment plants", ...FILES.bio },
      { code: "КНС", title: "Sewage pumping stations", ...FILES.kns },
      { code: "РЕЗ", title: "Tanks and reservoirs", ...FILES.rez },
      { code: "ЭЛХ · ДОЗ", title: "Electrochlorination and dosing", ...FILES.elh },
    ],
    basisTitle: "Calculation basis by line",
    basis: [
      { q: "Grease traps", a: "Hydraulics per EN 1825-2, Stokes rise of the fat droplet, retention at nominal flow at least 60 minutes." },
      { q: "Oil separators", a: "Rise of a 100 µm oil droplet at 15 °C, lamella modules, surface load below rise velocity." },
      { q: "Grit traps", a: "Capture of 0.15–0.25 mm particles (KMK 2.04.03-19, cl. 6.27, tables 27–28); sludge zone 300 L per 1 L/s (practice)." },
      { q: "Tanks", a: "Shell checked for buckling under soil and groundwater; stiffening rings at 800 mm pitch." },
      { q: "Pumping stations", a: "Working volume V = Q·t/4 from allowable pump starts; duty + standby pumps, three from 150 m³/h." },
      { q: "Treatment plants", a: "Loads per KMK 2.04.03-19 (table 25, extended aeration cl. 6.175, air per eq. (70) cl. 6.156, aerobic stabilisation cl. 6.373); sludge age 15 days and AOR→SOTR balance per DWA-A 131 (not regulated by KMK)." },
      { q: "Electrochlorination", a: "3.2 kg of salt and 4.5 kWh per 1 kg of active chlorine; room ventilation sized for hydrogen." },
      { q: "Dosing stations", a: "Feed, g/h = dose, g/m³ × flow, m³/h; two dosing pumps, one day of solution in the tank." },
    ],
    faqTitle: "Designers' questions",
    faq: [
      { q: "Will it pass expert review?", a: "The codes behind every model are stated on its page. A calculation note for a specific unit is available on request." },
      { q: "The site parameters are non-standard", a: "The standard range is a set of reference points. Intermediate capacities, other depths and nozzle layouts are made to order." },
      { q: "What data do you need for a quote?", a: "A filled questionnaire, or four numbers: flow, effluent type, collector depth and installation conditions." },
    ],
    ctaTitle: "Working on a project\nwith wastewater treatment?",
    ctaText:
      "Send the questionnaire or the raw site data — we return a quotation with a dimensional drawing and weight for the specification.",
    ctaButton: "Get a quote with a drawing",
  },

  zh: {
    label: "设计院专区",
    title: "将 SUVSANOAT 设备\n纳入您的设计",
    intro:
      "设计阶段所需的全部资料：计算依据、参数表、外形图和询价表。塔什干本地生产，罐体尺寸可按项目调整。",
    sections: [
      {
        title: "为什么设计院愿意选我们",
        text: [
          "本站每个型号都经过计算：分离器水力按斯托克斯定律和 EN 1825，生化按 DWA-A 131 和本地规范，罐体经抗压稳定性校核。每个型号页面都有参数表和外形图。",
          "罐体在塔什干自有工厂缠绕成型，进水管深度、接管位置和口径都可按项目调整。非标尺寸意味着重新计算，而不是拒绝。",
          "根据填写的询价表，我们提供带外形图和重量的报价，可直接用于设备清单。",
        ],
      },
      {
        title: "如何纳入设计",
        text: [
          "第一步：按产品目录表格选择系列和型号。",
          "第二步：下载询价表，填写流量、水质、管道埋深和场地条件。",
          "第三步：发送至 suvsanoat@gmail.com，我们回复带外形图和重量的报价。",
          "第四步：将型号（如 SST-BIO-50）写入设备清单。非标准参数可定制生产。",
        ],
      },
    ],
    downloadsTitle: "询价表下载",
    downloadsText: "每表一页。PDF 供打印，DOCX 供电脑填写。",
    pdfLabel: "PDF",
    docxLabel: "DOCX",
    downloads: [
      { code: "ЖИР", title: "隔油器", ...FILES.zhir },
      { code: "НЕФ · ПЕС", title: "除油器与沉砂器", ...FILES.nef },
      { code: "БИО", title: "一体化污水处理设备", ...FILES.bio },
      { code: "КНС", title: "污水泵站", ...FILES.kns },
      { code: "РЕЗ", title: "储罐", ...FILES.rez },
      { code: "ЭЛХ · ДОЗ", title: "次氯酸钠发生器与加药", ...FILES.elh },
    ],
    basisTitle: "各系列计算依据",
    basis: [
      { q: "隔油器", a: "水力按 EN 1825-2，油滴上浮按斯托克斯定律，额定流量下停留时间不少于 60 分钟。" },
      { q: "除油器", a: "按 15 °C 下 100 µm 油滴上浮速度设计，斜板模块。" },
      { q: "沉砂器", a: "截留 0.15–0.25 mm 颗粒（KMK 2.04.03-19 第 6.27 条，表 27–28）；积砂区每 1 L/s 配 300 L（经验值）。" },
      { q: "储罐", a: "罐壁按土压与地下水校核抗压稳定性，加强环间距 800 mm。" },
      { q: "泵站", a: "有效容积 V = Q·t/4，按水泵允许启动频率；一用一备，150 m³/h 以上三台。" },
      { q: "污水处理", a: "负荷按本地规范，曝气池按 DWA-A 131：泥龄 15 天，氧平衡 AOR→SOTR。" },
      { q: "次氯酸钠发生器", a: "每公斤有效氯耗盐 3.2 kg、电 4.5 kWh；机房通风按氢气量计算。" },
      { q: "加药站", a: "投加量 g/h = 剂量 g/m³ × 流量 m³/h；两台计量泵，药液储量一天。" },
    ],
    faqTitle: "设计院常见问题",
    faq: [
      { q: "能通过审查吗？", a: "每个型号的计算规范都写在页面上，可按需提供具体设备的计算书。" },
      { q: "项目参数非标准", a: "标准系列只是参考点，中间规格、其他埋深和接管布置均可定制。" },
      { q: "报价需要什么资料？", a: "填好的询价表，或四个数字：流量、水质、管道埋深和安装条件。" },
    ],
    ctaTitle: "正在设计\n带污水处理的项目？",
    ctaText: "发送询价表或原始数据，我们回复带外形图和重量的报价。",
    ctaButton: "获取带图报价",
  },
};
