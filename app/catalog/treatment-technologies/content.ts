import type { CategoryContentSet } from "../types";

const content: CategoryContentSet = {
  ru: {
    breadcrumb: "ТЕХНОЛОГИИ ОЧИСТКИ",
    heroLabel: "11 · ТЕХНОЛОГИИ ОЧИСТКИ",
    heroTitle: "Технологии очистки\nсточных вод.",
    heroText:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ультрафильтрация и обратный осмос для промышленных и коммунальных очистных сооружений.",
    heroButton: "Смотреть технологии",
    stats: [
      { value: "MBR", label: "мембранная очистка" },
      { value: "SBR / MBBR", label: "биологическая очистка" },
      { value: "DAF", label: "физико-химическая очистка" },
      { value: "UF / RO", label: "глубокая доочистка" },
    ],

    introLabel: "ИНЖЕНЕРНЫЕ ТЕХНОЛОГИИ",
    introTitle: "Подбор технологии\nпод конкретные стоки.",
    introText: [
      "Состав промышленных и коммунальных сточных вод может существенно различаться. Поэтому технология очистки подбирается на основании производительности объекта, состава загрязнений и требуемого качества воды на выходе.",
      "SUVSANOAT разрабатывает технологические решения, объединяющие механические, физико-химические, биологические и мембранные методы очистки в единую систему очистных сооружений.",
    ],

    itemsLabel: "ТЕХНОЛОГИИ",
    itemsTitle: "Современные технологии\nочистки сточных вод.",
    itemsText:
      "MBR, SBR, MBBR, DAF и другие процессы могут применяться самостоятельно или объединяться в многоступенчатую технологическую схему очистки.",
    items: [
      {
        number: "01",
        title: "MBR",
        text: "Мембранный биореактор MBR объединяет биологическую очистку и мембранное разделение. Технология обеспечивает высокое качество очищенной воды и позволяет создавать компактные очистные сооружения.",
      },
      {
        number: "02",
        title: "SBR",
        text: "Технология SBR выполняет основные стадии биологической очистки сточных вод в одном реакторе по заданным временным циклам.",
      },
      {
        number: "03",
        title: "MBBR",
        text: "Технология MBBR использует подвижную биозагрузку для развития активной биоплёнки и повышения эффективности биологической очистки сточных вод.",
      },
      {
        number: "04",
        title: "A/O",
        text: "Технология A/O сочетает аноксидную и аэробную зоны и применяется для удаления органических загрязнений и соединений азота.",
      },
      {
        number: "05",
        title: "A²/O",
        text: "Многостадийная биологическая технология A²/O применяется для удаления органических загрязнений, азота и фосфора из сточных вод.",
      },
      {
        number: "06",
        title: "ANBR",
        text: "Анаэробная технология ANBR применяется для очистки высококонцентрированных промышленных сточных вод с высокой органической нагрузкой.",
      },
      {
        number: "07",
        title: "DAF",
        text: "Напорная флотация DAF применяется для удаления взвешенных веществ, масел, жиров и других трудноосаждаемых загрязнений из промышленных сточных вод.",
      },
      {
        number: "08",
        title: "UF",
        text: "Ультрафильтрация UF удаляет взвешенные вещества, коллоиды и микроорганизмы и применяется для глубокой доочистки воды и сточных вод.",
      },
      {
        number: "09",
        title: "RO",
        text: "Обратный осмос RO применяется для глубокой очистки воды, снижения минерализации и подготовки очищенной воды для повторного или технологического использования.",
      },
    ],
    itemsLink: "Подобрать технологию",

    processLabel: "ПОДБОР ТЕХНОЛОГИИ",
    processTitle: "Как выбирается технология\nочистки сточных вод.",
    processText:
      "Выбор технологического процесса определяется характеристиками сточных вод, производительностью объекта, требованиями к очищенной воде и условиями дальнейшей эксплуатации.",
    process: [
      {
        number: "01",
        title: "Состав сточных вод",
        text: "Анализируем органические, химические, взвешенные и специфические загрязнения, определяющие технологическую схему очистки.",
      },
      {
        number: "02",
        title: "Производительность",
        text: "Определяем средний, максимальный и пиковый расход сточных вод для расчёта производительности очистных сооружений.",
      },
      {
        number: "03",
        title: "Требования на выходе",
        text: "Учитываем требования к качеству очищенной воды для сброса, повторного использования или дальнейшей технологической обработки.",
      },
      {
        number: "04",
        title: "Условия объекта",
        text: "Учитываем доступную площадь, существующую инфраструктуру, режим эксплуатации и возможности размещения оборудования.",
      },
      {
        number: "05",
        title: "Эксплуатационные расходы",
        text: "Сравниваем энергопотребление, расход реагентов, обслуживание оборудования и объём образующегося осадка.",
      },
    ],

    applicationsLabel: "ОБЛАСТИ ПРИМЕНЕНИЯ",
    applicationsTitle: "Очистка коммунальных\nи промышленных стоков.",
    applicationsText:
      "Технологическая схема разрабатывается под отрасль, концентрацию загрязнений, режим поступления сточных вод и требования к качеству очищенной воды.",
    applications: [
      "Коммунальные сточные воды",
      "Текстильная промышленность",
      "Пищевая промышленность",
      "Молочные предприятия",
      "Мясопереработка",
      "Нефтесодержащие стоки",
      "Высококонцентрированные стоки",
      "Повторное использование воды",
    ],

    ctaLabel: "ПОДБОР ТЕХНОЛОГИИ",
    ctaTitle: "Разработаем технологию\nпод ваши сточные воды.",
    ctaText:
      "Отправьте производительность объекта, анализ сточных вод, техническое задание и требования к качеству воды на выходе. Подберём подходящую технологию очистки и подготовим предварительное техническое решение.",
    ctaButton: "ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ РЕШЕНИЕ",
  },

  uz: {
    breadcrumb: "TOZALASH TEXNOLOGIYALARI",
    heroLabel: "11 · TOZALASH TEXNOLOGIYALARI",
    heroTitle: "Oqava suvlarni tozalash\ntexnologiyalari.",
    heroText:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ultrafiltratsiya va teskari osmos — sanoat va kommunal tozalash inshootlari uchun.",
    heroButton: "Texnologiyalarni ko‘rish",
    stats: [
      { value: "MBR", label: "membranali tozalash" },
      { value: "SBR / MBBR", label: "biologik tozalash" },
      { value: "DAF", label: "fizik-kimyoviy tozalash" },
      { value: "UF / RO", label: "chuqur qo‘shimcha tozalash" },
    ],

    introLabel: "MUHANDISLIK TEXNOLOGIYALARI",
    introTitle: "Texnologiyani aniq oqava\nsuvlarga moslab tanlash.",
    introText: [
      "Sanoat va kommunal oqava suvlarning tarkibi sezilarli darajada farq qilishi mumkin. Shu sababli tozalash texnologiyasi obyekt unumdorligi, ifloslantiruvchi moddalar tarkibi va chiqishdagi talab etilgan suv sifati asosida tanlanadi.",
      "SUVSANOAT mexanik, fizik-kimyoviy, biologik va membranali tozalash usullarini yagona tozalash inshootlari tizimiga birlashtiruvchi texnologik yechimlarni ishlab chiqadi.",
    ],

    itemsLabel: "TEXNOLOGIYALAR",
    itemsTitle: "Oqava suvlarni tozalashning\nzamonaviy texnologiyalari.",
    itemsText:
      "MBR, SBR, MBBR, DAF va boshqa jarayonlar mustaqil ravishda qo‘llanilishi yoki ko‘p bosqichli texnologik tozalash sxemasiga birlashtirilishi mumkin.",
    items: [
      {
        number: "01",
        title: "MBR",
        text: "MBR membranali bioreaktori biologik tozalash va membranali ajratishni birlashtiradi. Texnologiya tozalangan suvning yuqori sifatini ta'minlaydi va ixcham tozalash inshootlarini yaratish imkonini beradi.",
      },
      {
        number: "02",
        title: "SBR",
        text: "SBR texnologiyasi oqava suvlarni biologik tozalashning asosiy bosqichlarini belgilangan vaqt sikllari bo‘yicha bitta reaktorda bajaradi.",
      },
      {
        number: "03",
        title: "MBBR",
        text: "MBBR texnologiyasi faol bioparda rivojlanishi va oqava suvlarni biologik tozalash samaradorligini oshirish uchun harakatlanuvchi bioyuklamadan foydalanadi.",
      },
      {
        number: "04",
        title: "A/O",
        text: "A/O texnologiyasi anoksid va aerob zonalarni birlashtiradi hamda organik ifloslantiruvchi moddalar va azot birikmalarini yo‘qotish uchun qo‘llaniladi.",
      },
      {
        number: "05",
        title: "A²/O",
        text: "Ko‘p bosqichli A²/O biologik texnologiyasi oqava suvlardan organik ifloslantiruvchi moddalar, azot va fosforni yo‘qotish uchun qo‘llaniladi.",
      },
      {
        number: "06",
        title: "ANBR",
        text: "ANBR anaerob texnologiyasi organik yuklamasi yuqori bo‘lgan yuqori konsentratsiyali sanoat oqava suvlarini tozalash uchun qo‘llaniladi.",
      },
      {
        number: "07",
        title: "DAF",
        text: "DAF bosimli flotatsiyasi sanoat oqava suvlaridan muallaq moddalar, moylar, yog‘lar va boshqa qiyin cho‘kadigan ifloslantiruvchi moddalarni yo‘qotish uchun qo‘llaniladi.",
      },
      {
        number: "08",
        title: "UF",
        text: "UF ultrafiltratsiyasi muallaq moddalar, kolloidlar va mikroorganizmlarni yo‘qotadi hamda suv va oqava suvlarni chuqur qo‘shimcha tozalash uchun qo‘llaniladi.",
      },
      {
        number: "09",
        title: "RO",
        text: "RO teskari osmosi suvni chuqur tozalash, minerallashuvni kamaytirish va tozalangan suvni qayta yoki texnologik foydalanishga tayyorlash uchun qo‘llaniladi.",
      },
    ],
    itemsLink: "Texnologiyani tanlash",

    processLabel: "TEXNOLOGIYANI TANLASH",
    processTitle: "Oqava suvlarni tozalash\ntexnologiyasi qanday tanlanadi.",
    processText:
      "Texnologik jarayonni tanlash oqava suvlarning tavsiflari, obyekt unumdorligi, tozalangan suvga qo‘yiladigan talablar va keyingi ekspluatatsiya sharoitlari bilan belgilanadi.",
    process: [
      {
        number: "01",
        title: "Oqava suvlar tarkibi",
        text: "Tozalashning texnologik sxemasini belgilaydigan organik, kimyoviy, muallaq va o‘ziga xos ifloslantiruvchi moddalarni tahlil qilamiz.",
      },
      {
        number: "02",
        title: "Unumdorlik",
        text: "Tozalash inshootlari unumdorligini hisob-kitob qilish uchun oqava suvlarning o‘rtacha, maksimal va cho‘qqi sarfini aniqlaymiz.",
      },
      {
        number: "03",
        title: "Chiqishdagi talablar",
        text: "Tozalangan suvni oqizish, qayta foydalanish yoki keyingi texnologik ishlov berish uchun uning sifatiga qo‘yiladigan talablarni hisobga olamiz.",
      },
      {
        number: "04",
        title: "Obyekt sharoitlari",
        text: "Mavjud maydon, mavjud infratuzilma, ekspluatatsiya rejimi va uskunalarni joylashtirish imkoniyatlarini hisobga olamiz.",
      },
      {
        number: "05",
        title: "Ekspluatatsiya xarajatlari",
        text: "Energiya sarfi, reagentlar sarfi, uskunalarga xizmat ko‘rsatish va hosil bo‘ladigan cho‘kma hajmini taqqoslaymiz.",
      },
    ],

    applicationsLabel: "QO‘LLANILISH SOHALARI",
    applicationsTitle: "Kommunal va sanoat\noqava suvlarini tozalash.",
    applicationsText:
      "Texnologik sxema tarmoq, ifloslantiruvchi moddalar konsentratsiyasi, oqava suvlarning kelib tushish rejimi va tozalangan suv sifatiga qo‘yiladigan talablarga moslab ishlab chiqiladi.",
    applications: [
      "Kommunal oqava suvlar",
      "To‘qimachilik sanoati",
      "Oziq-ovqat sanoati",
      "Sut korxonalari",
      "Go‘sht qayta ishlash",
      "Neft saqlovchi oqava suvlar",
      "Yuqori konsentratsiyali oqava suvlar",
      "Suvdan qayta foydalanish",
    ],

    ctaLabel: "TEXNOLOGIYANI TANLASH",
    ctaTitle: "Sizning oqava suvlaringiz uchun\ntexnologiya ishlab chiqamiz.",
    ctaText:
      "Obyekt unumdorligi, oqava suvlar tahlili, texnik topshiriq va chiqishdagi suv sifatiga qo‘yiladigan talablarni yuboring. Mos tozalash texnologiyasini tanlab beramiz va dastlabki texnik yechimni tayyorlaymiz.",
    ctaButton: "TEXNIK YECHIM OLISH",
  },

  en: {
    breadcrumb: "TREATMENT TECHNOLOGIES",
    heroLabel: "11 · TREATMENT TECHNOLOGIES",
    heroTitle: "Wastewater treatment\ntechnologies.",
    heroText:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ultrafiltration and reverse osmosis for industrial and municipal treatment plants.",
    heroButton: "View technologies",
    stats: [
      { value: "MBR", label: "membrane treatment" },
      { value: "SBR / MBBR", label: "biological treatment" },
      { value: "DAF", label: "physical and chemical treatment" },
      { value: "UF / RO", label: "advanced polishing" },
    ],

    introLabel: "ENGINEERING TECHNOLOGIES",
    introTitle: "Technology selection\nfor specific wastewater.",
    introText: [
      "The composition of industrial and municipal wastewater can vary considerably. The treatment technology is therefore selected on the basis of the plant capacity, the contaminant composition and the required quality of the treated water.",
      "SUVSANOAT develops process solutions that combine mechanical, physical and chemical, biological and membrane treatment methods into a single treatment plant system.",
    ],

    itemsLabel: "TECHNOLOGIES",
    itemsTitle: "Modern wastewater\ntreatment technologies.",
    itemsText:
      "MBR, SBR, MBBR, DAF and other processes can be used on their own or combined into a multi-stage treatment process scheme.",
    items: [
      {
        number: "01",
        title: "MBR",
        text: "The MBR membrane bioreactor combines biological treatment with membrane separation. The technology delivers high treated water quality and makes it possible to build compact treatment plants.",
      },
      {
        number: "02",
        title: "SBR",
        text: "SBR technology carries out the main stages of biological wastewater treatment in a single reactor according to preset time cycles.",
      },
      {
        number: "03",
        title: "MBBR",
        text: "MBBR technology uses moving biomedia to develop an active biofilm and increase the efficiency of biological wastewater treatment.",
      },
      {
        number: "04",
        title: "A/O",
        text: "A/O technology combines anoxic and aerobic zones and is used to remove organic contaminants and nitrogen compounds.",
      },
      {
        number: "05",
        title: "A²/O",
        text: "The multi-stage A²/O biological technology is used to remove organic contaminants, nitrogen and phosphorus from wastewater.",
      },
      {
        number: "06",
        title: "ANBR",
        text: "ANBR anaerobic technology is used to treat highly concentrated industrial wastewater with a high organic load.",
      },
      {
        number: "07",
        title: "DAF",
        text: "DAF dissolved air flotation is used to remove suspended solids, oils, fats and other hard-to-settle contaminants from industrial wastewater.",
      },
      {
        number: "08",
        title: "UF",
        text: "UF ultrafiltration removes suspended solids, colloids and microorganisms and is used for advanced polishing of water and wastewater.",
      },
      {
        number: "09",
        title: "RO",
        text: "RO reverse osmosis is used for advanced water treatment, for reducing salinity and for preparing treated water for reuse or process applications.",
      },
    ],
    itemsLink: "Select a technology",

    processLabel: "TECHNOLOGY SELECTION",
    processTitle: "How a wastewater treatment\ntechnology is selected.",
    processText:
      "The process technology is chosen according to the wastewater characteristics, the plant capacity, the requirements for the treated water and the conditions of subsequent operation.",
    process: [
      {
        number: "01",
        title: "Wastewater composition",
        text: "We analyse the organic, chemical, suspended and specific contaminants that determine the treatment process scheme.",
      },
      {
        number: "02",
        title: "Capacity",
        text: "We determine the average, maximum and peak wastewater flow for the capacity calculation of the treatment plant.",
      },
      {
        number: "03",
        title: "Outlet requirements",
        text: "We take into account the treated water quality requirements for discharge, reuse or further process treatment.",
      },
      {
        number: "04",
        title: "Site conditions",
        text: "We take into account the available area, the existing infrastructure, the operating regime and the options for equipment layout.",
      },
      {
        number: "05",
        title: "Operating costs",
        text: "We compare energy consumption, chemical consumption, equipment maintenance and the volume of sludge produced.",
      },
    ],

    applicationsLabel: "APPLICATIONS",
    applicationsTitle: "Treatment of municipal\nand industrial wastewater.",
    applicationsText:
      "The process scheme is developed for the specific industry, contaminant concentration, wastewater inflow regime and treated water quality requirements.",
    applications: [
      "Municipal wastewater",
      "Textile industry",
      "Food industry",
      "Dairy plants",
      "Meat processing",
      "Oil-containing effluents",
      "Highly concentrated effluents",
      "Water reuse",
    ],

    ctaLabel: "TECHNOLOGY SELECTION",
    ctaTitle: "We will develop a technology\nfor your wastewater.",
    ctaText:
      "Send us the plant capacity, the wastewater analysis, the technical specification and the requirements for the outlet water quality. We will select a suitable treatment technology and prepare a preliminary technical solution.",
    ctaButton: "REQUEST A TECHNICAL SOLUTION",
  },

  zh: {
    breadcrumb: "污水处理工艺",
    heroLabel: "11 · 污水处理工艺",
    heroTitle: "污水处理\n工艺技术。",
    heroText:
      "MBR、SBR、MBBR、A/O、A²/O、ANBR、DAF、超滤和反渗透，适用于工业和市政污水处理设施。",
    heroButton: "查看工艺",
    stats: [
      { value: "MBR", label: "膜法处理" },
      { value: "SBR / MBBR", label: "生物处理" },
      { value: "DAF", label: "物理化学处理" },
      { value: "UF / RO", label: "深度处理" },
    ],

    introLabel: "工程技术",
    introTitle: "针对具体污水\n选择工艺方案。",
    introText: [
      "工业和市政污水的水质组成可能存在显著差异。因此，处理工艺需要根据项目处理量、污染物组成以及出水水质要求进行选型。",
      "SUVSANOAT 开发工艺解决方案，将机械、物理化学、生物和膜处理方法整合为统一的污水处理设施系统。",
    ],

    itemsLabel: "工艺技术",
    itemsTitle: "先进的污水\n处理工艺。",
    itemsText:
      "MBR、SBR、MBBR、DAF 等工艺既可单独使用，也可组合成多级处理工艺流程。",
    items: [
      {
        number: "01",
        title: "MBR",
        text: "MBR 膜生物反应器将生物处理与膜分离相结合。该工艺可保证出水水质优良，并可建设占地紧凑的污水处理设施。",
      },
      {
        number: "02",
        title: "SBR",
        text: "SBR 工艺在同一反应器内按设定的时间周期完成污水生物处理的主要阶段。",
      },
      {
        number: "03",
        title: "MBBR",
        text: "MBBR 工艺采用移动床生物填料，促进活性生物膜生长，提高污水生物处理效率。",
      },
      {
        number: "04",
        title: "A/O",
        text: "A/O 工艺将缺氧区与好氧区相结合，用于去除有机污染物和含氮化合物。",
      },
      {
        number: "05",
        title: "A²/O",
        text: "A²/O 多级生物处理工艺用于去除污水中的有机污染物、氮和磷。",
      },
      {
        number: "06",
        title: "ANBR",
        text: "ANBR 厌氧工艺用于处理有机负荷高的高浓度工业污水。",
      },
      {
        number: "07",
        title: "DAF",
        text: "DAF 加压溶气气浮用于去除工业污水中的悬浮物、油类、油脂及其他难沉降污染物。",
      },
      {
        number: "08",
        title: "UF",
        text: "UF 超滤可去除悬浮物、胶体和微生物，用于水和污水的深度处理。",
      },
      {
        number: "09",
        title: "RO",
        text: "RO 反渗透用于水的深度处理、降低含盐量，并将处理后的水制备为回用水或工艺用水。",
      },
    ],
    itemsLink: "选择工艺",

    processLabel: "工艺选型",
    processTitle: "污水处理工艺\n如何选型。",
    processText:
      "工艺流程的选择取决于污水特性、项目处理量、出水水质要求以及后续运行条件。",
    process: [
      {
        number: "01",
        title: "污水水质组成",
        text: "分析决定处理工艺流程的有机、化学、悬浮及特征性污染物。",
      },
      {
        number: "02",
        title: "处理量",
        text: "确定污水的平均流量、最大流量和峰值流量，用于污水处理设施的处理能力计算。",
      },
      {
        number: "03",
        title: "出水要求",
        text: "考虑排放、回用或后续工艺处理对出水水质提出的各项要求。",
      },
      {
        number: "04",
        title: "现场条件",
        text: "考虑可用场地面积、现有基础设施、运行制度以及设备布置的可行性。",
      },
      {
        number: "05",
        title: "运行费用",
        text: "对比能耗、药剂消耗、设备维护以及产生的污泥量。",
      },
    ],

    applicationsLabel: "应用领域",
    applicationsTitle: "市政与工业\n污水处理。",
    applicationsText:
      "工艺流程根据所属行业、污染物浓度、污水进水规律以及出水水质要求进行设计。",
    applications: [
      "市政污水",
      "纺织工业",
      "食品工业",
      "乳制品企业",
      "肉类加工",
      "含油污水",
      "高浓度污水",
      "水资源回用",
    ],

    ctaLabel: "工艺选型",
    ctaTitle: "为您的污水\n定制处理工艺。",
    ctaText:
      "请提供项目处理量、污水化验分析、技术任务书以及出水水质要求。我们将为您选择合适的处理工艺，并编制初步技术方案。",
    ctaButton: "获取技术方案",
  },
};






/** Иконка на каждую позицию — не зависит от языка */
export const icons: string[] = [
  "membrane", // MBR
  "cycle", // SBR
  "carriers", // MBBR
  "zones", // A/O
  "zones", // A²/O
  "bio", // ANBR
  "daf", // DAF
  "membrane", // UF
  "ro", // RO
];

export default content;
