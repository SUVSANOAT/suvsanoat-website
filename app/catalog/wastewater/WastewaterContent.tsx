"use client";

import { useLanguage } from "../../LanguageContext";
import type { Language } from "../../translations";

const languageNames: Record<Language, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
  zh: "中文",
};

const content = {
  ru: {
    back: "← КАТАЛОГ",
    quote: "ПОЛУЧИТЬ РАСЧЁТ",
    eyebrow: "ОЧИСТНЫЕ СООРУЖЕНИЯ",
    heroTitle: <>Очистные сооружения<br />для сточных вод.</>,
    heroText:
      "Проектирование, производство и поставка комплексных очистных сооружений для коммунальных, промышленных и инфраструктурных объектов в Ташкенте и по всему Узбекистану.",
    watch: "СМОТРЕТЬ РЕШЕНИЯ",
    volume: "м³/сутки",
    volumeTitle: "Диапазон производительности",
    turnkey: "ПОД КЛЮЧ",
    fullCycle: "ПОЛНЫЙ ЦИКЛ",
    turnkeyText: "От проекта до запуска объекта",
    individual: "ИНДИВИДУАЛЬНО",
    underObject: "ПОД ОБЪЕКТ",
    individualText: "Подбор технологии по исходным данным",
    introLabel: "SUVSANOAT / WASTEWATER",
    introTitle: <>Не просто оборудование.<br />Комплексная система очистки.</>,
    intro1:
      "Каждая система проектируется с учётом производительности, состава сточных вод, режима работы объекта и требований к качеству очищенной воды.",
    intro2:
      "В состав решения могут входить механическая, физико-химическая и биологическая очистка, мембранные технологии, обеззараживание, обработка осадка и автоматизация.",
    solutionsLabel: "КОМПЛЕКСНЫЕ РЕШЕНИЯ",
    solutionsTitle: <>Очистные сооружения<br />для любого объекта.</>,
    solutionsText: "От компактных локальных установок до крупных промышленных очистных комплексов.",
    solutions: [
      ["Локальные очистные сооружения", "Компактные системы очистки хозяйственно-бытовых сточных вод для отдельных объектов."],
      ["Канализационные очистные сооружения", "Комплексные КОС для населённых пунктов, жилых комплексов и инфраструктурных объектов."],
      ["Промышленные очистные сооружения", "Технологические решения с учётом состава и особенностей производственных сточных вод."],
      ["Блочно-модульные станции", "Заводская готовность, компактное размещение и возможность поэтапного увеличения мощности."],
      ["Контейнерные очистные сооружения", "Мобильные и компактные решения для объектов с ограниченной площадью и быстрым вводом."],
      ["Индивидуальные решения", "Проектирование технологической схемы под конкретный объект, состав стоков и требования заказчика."],
    ],
    techLabel: "ТЕХНОЛОГИИ ОЧИСТКИ",
    techTitle: <>Технология подбирается<br />под состав сточных вод.</>,
    techText: "Используем современные биологические и мембранные технологии в зависимости от характеристик объекта и требуемого качества очищенной воды.",
    technologies: [
      ["MBR", "Membrane Bioreactor", "Мембранная биологическая очистка"],
      ["SBR", "Sequencing Batch Reactor", "Последовательная биологическая очистка"],
      ["MBBR", "Moving Bed Biofilm Reactor", "Биоплёночная технология очистки"],
      ["A/O", "Anoxic / Oxic", "Удаление органических загрязнений и азота"],
      ["A²/O", "Anaerobic / Anoxic / Oxic", "Глубокое удаление азота и фосфора"],
      ["ANBR", "Anaerobic Bioreactor", "Анаэробная очистка высококонцентрированных стоков"],
    ],
    engineeringLabel: "ИНЖЕНЕРНЫЙ ПОДХОД",
    engineeringTitle: <>От анализа стоков<br />до стабильной работы.</>,
    engineering1:
      "Эффективность очистных сооружений зависит не только от оборудования, но и от правильного выбора технологической схемы, расчёта нагрузок и согласованной работы всех этапов очистки.",
    engineering2:
      "Suvsanoat рассматривает объект как единую инженерную систему: от поступления сточных вод до их очистки, обеззараживания, обработки осадка и возможного повторного использования воды.",
    geoLabel: "ТАШКЕНТ · УЗБЕКИСТАН",
    geoTitle: <>Очистные сооружения<br />в Ташкенте и по Узбекистану.</>,
    geo1:
      "Suvsanoat выполняет проектирование, подбор оборудования, производство, поставку, монтаж и пусконаладку очистных сооружений в Ташкенте и других регионах Узбекистана.",
    geo2:
      "Разрабатываем решения для хозяйственно-бытовых, коммунальных и промышленных сточных вод с учётом производительности объекта, состава стоков и требований к качеству очищенной воды.",
    processLabel: "ЭТАПЫ РЕАЛИЗАЦИИ",
    processTitle: <>От исходных данных<br />до запуска объекта.</>,
    processText: "SUVSANOAT сопровождает проект на всех ключевых этапах реализации.",
    stages: ["Анализ исходных данных", "Подбор технологии", "Проектирование", "Производство", "Поставка", "Монтаж", "Пусконаладка", "Сервис"],
    ctaLabel: "НАЧАТЬ ПРОЕКТ",
    ctaTitle: <>Нужен расчёт<br />очистных сооружений?</>,
    ctaText:
      "Отправьте производительность объекта, техническое задание или анализы сточных вод. Подготовим предварительное инженерное решение.",
    ctaButton: "ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ ПРЕДЛОЖЕНИЕ",
    footerText: "Инженерные системы очистки воды и сточных вод.",
    nav: "НАВИГАЦИЯ",
    contact: "СВЯЗАТЬСЯ",
    home: "Главная",
    catalog: "Каталог",
    solutionsNav: "Решения",
    technologiesNav: "Технологии",
    services: "Услуги",
    copyright: "© 2026 SUVSANOAT. Все права защищены.",
  },
  uz: {
    back: "← KATALOG",
    quote: "HISOB-KITOB OLISH",
    eyebrow: "OQOVA SUVLARNI TOZALASH INSHOOTLARI",
    heroTitle: <>Oqova suvlarni tozalash inshootlari<br />oqova suvlar uchun.</>,
    heroText:
      "Toshkent va O‘zbekiston bo‘ylab kommunal, sanoat va infratuzilma obyektlari uchun oqova suvlarni kompleks tozalash inshootlarini loyihalash, ishlab chiqarish va yetkazib berish.",
    watch: "YECHIMLARNI KO‘RISH",
    volume: "m³/kun",
    volumeTitle: "Ishlash unumdorligi diapazoni",
    turnkey: "KALIT TOPSHIRISH",
    fullCycle: "TO‘LIQ SIKL",
    turnkeyText: "Loyihadan obyektni ishga tushirishgacha",
    individual: "INDIVIDUAL",
    underObject: "OBYEKT UCHUN",
    individualText: "Boshlang‘ich ma’lumotlar asosida texnologiya tanlash",
    introLabel: "SUVSANOAT / WASTEWATER",
    introTitle: <>Faqat uskuna emas.<br />Kompleks tozalash tizimi.</>,
    intro1:
      "Har bir tizim obyekt unumdorligi, oqova suv tarkibi, ishlash rejimi va tozalangan suv sifatiga qo‘yiladigan talablarni hisobga olgan holda loyihalanadi.",
    intro2:
      "Yechim tarkibiga mexanik, fizik-kimyoviy va biologik tozalash, membrana texnologiyalari, zararsizlantirish, cho‘kmani qayta ishlash va avtomatlashtirish kirishi mumkin.",
    solutionsLabel: "KOMPLEKS YECHIMLAR",
    solutionsTitle: <>Har qanday obyekt<br />uchun tozalash inshootlari.</>,
    solutionsText: "Ixcham mahalliy qurilmalardan yirik sanoat tozalash majmualarigacha.",
    solutions: [
      ["Mahalliy tozalash inshootlari", "Alohida obyektlar uchun maishiy oqova suvlarni tozalashning ixcham tizimlari."],
      ["Kanalizatsiya tozalash inshootlari", "Aholi punktlari, turar-joy majmualari va infratuzilma obyektlari uchun kompleks KOS yechimlari."],
      ["Sanoat tozalash inshootlari", "Ishlab chiqarish oqova suvlarining tarkibi va xususiyatlarini hisobga olgan texnologik yechimlar."],
      ["Blok-modulli stansiyalar", "Zavodda tayyorlangan, ixcham joylashtiriladigan va quvvatni bosqichma-bosqich oshirish imkoniyatiga ega stansiyalar."],
      ["Konteynerli tozalash inshootlari", "Maydoni cheklangan va tez ishga tushirish talab qilinadigan obyektlar uchun mobil va ixcham yechimlar."],
      ["Individual yechimlar", "Muayyan obyekt, oqova suv tarkibi va buyurtmachi talablariga mos texnologik sxemani loyihalash."],
    ],
    techLabel: "TOZALASH TEXNOLOGIYALARI",
    techTitle: <>Texnologiya oqova suv<br />tarkibiga qarab tanlanadi.</>,
    techText: "Obyekt xususiyatlari va talab qilinadigan tozalangan suv sifatiga qarab zamonaviy biologik va membrana texnologiyalaridan foydalanamiz.",
    technologies: [
      ["MBR", "Membrane Bioreactor", "Membranali biologik tozalash"],
      ["SBR", "Sequencing Batch Reactor", "Ketma-ket biologik tozalash"],
      ["MBBR", "Moving Bed Biofilm Reactor", "Biofilm texnologiyasi asosidagi tozalash"],
      ["A/O", "Anoxic / Oxic", "Organik ifloslanish va azotni yo‘qotish"],
      ["A²/O", "Anaerobic / Anoxic / Oxic", "Azot va fosforni chuqur yo‘qotish"],
      ["ANBR", "Anaerobic Bioreactor", "Yuqori konsentratsiyali oqova suvlarni anaerob tozalash"],
    ],
    engineeringLabel: "MUHANDISLIK YONDASHUVI",
    engineeringTitle: <>Oqova suv tahlilidan<br />barqaror ishlashgacha.</>,
    engineering1:
      "Tozalash inshootlarining samaradorligi faqat uskunaga emas, balki texnologik sxemani to‘g‘ri tanlash, yuklamalarni hisoblash va barcha tozalash bosqichlarining uyg‘un ishlashiga bog‘liq.",
    engineering2:
      "SUVSANOAT obyektni yagona muhandislik tizimi sifatida ko‘rib chiqadi: oqova suv kelib tushishidan boshlab tozalash, zararsizlantirish, cho‘kmani qayta ishlash va suvni qayta foydalanishgacha.",
    geoLabel: "TOSHKENT · O‘ZBEKISTON",
    geoTitle: <>Toshkent va O‘zbekiston<br />bo‘ylab tozalash inshootlari.</>,
    geo1:
      "SUVSANOAT Toshkent va O‘zbekistonning boshqa hududlarida tozalash inshootlarini loyihalash, uskunalarni tanlash, ishlab chiqarish, yetkazib berish, montaj va ishga tushirish-sozlash ishlarini amalga oshiradi.",
    geo2:
      "Maishiy, kommunal va sanoat oqova suvlari uchun obyekt unumdorligi, oqova suv tarkibi va tozalangan suv sifatiga qo‘yiladigan talablarni hisobga olgan yechimlar ishlab chiqamiz.",
    processLabel: "AMALGA OSHIRISH BOSQICHLARI",
    processTitle: <>Boshlang‘ich ma’lumotlardan<br />obyektni ishga tushirishgacha.</>,
    processText: "SUVSANOAT loyihani amalga oshirishning barcha asosiy bosqichlarida hamroh bo‘ladi.",
    stages: ["Boshlang‘ich ma’lumotlarni tahlil qilish", "Texnologiyani tanlash", "Loyihalash", "Ishlab chiqarish", "Yetkazib berish", "Montaj", "Ishga tushirish-sozlash", "Servis"],
    ctaLabel: "LOYIHANI BOSHLASH",
    ctaTitle: <>Tozalash inshooti uchun<br />hisob-kitob kerakmi?</>,
    ctaText:
      "Obyekt unumdorligi, texnik topshiriq yoki oqova suv tahlillarini yuboring. Dastlabki muhandislik yechimini tayyorlaymiz.",
    ctaButton: "TEXNIK TAKLIF OLISH",
    footerText: "Suv va oqova suvlarni tozalash muhandislik tizimlari.",
    nav: "NAVIGATSIYA",
    contact: "BOG‘LANISH",
    home: "Bosh sahifa",
    catalog: "Katalog",
    solutionsNav: "Yechimlar",
    technologiesNav: "Texnologiyalar",
    services: "Xizmatlar",
    copyright: "© 2026 SUVSANOAT. Barcha huquqlar himoyalangan.",
  },
  en: {
    back: "← CATALOG",
    quote: "GET A QUOTE",
    eyebrow: "WASTEWATER TREATMENT PLANTS",
    heroTitle: <>Wastewater treatment plants<br />for wastewater.</>,
    heroText:
      "Design, manufacturing and supply of complete wastewater treatment plants for municipal, industrial and infrastructure facilities in Tashkent and throughout Uzbekistan.",
    watch: "VIEW SOLUTIONS",
    volume: "m³/day",
    volumeTitle: "Capacity range",
    turnkey: "TURNKEY",
    fullCycle: "FULL CYCLE",
    turnkeyText: "From design to commissioning",
    individual: "INDIVIDUAL",
    underObject: "FOR YOUR FACILITY",
    individualText: "Technology selection based on input data",
    introLabel: "SUVSANOAT / WASTEWATER",
    introTitle: <>Not just equipment.<br />A complete treatment system.</>,
    intro1:
      "Each system is designed according to plant capacity, wastewater composition, operating conditions and the required treated-water quality.",
    intro2:
      "The solution may include mechanical, physico-chemical and biological treatment, membrane technologies, disinfection, sludge handling and automation.",
    solutionsLabel: "COMPREHENSIVE SOLUTIONS",
    solutionsTitle: <>Treatment plants<br />for any facility.</>,
    solutionsText: "From compact local units to large industrial treatment complexes.",
    solutions: [
      ["Local wastewater treatment plants", "Compact domestic wastewater treatment systems for individual facilities."],
      ["Municipal wastewater treatment plants", "Complete treatment solutions for settlements, residential complexes and infrastructure facilities."],
      ["Industrial wastewater treatment plants", "Process solutions designed around the composition and characteristics of industrial wastewater."],
      ["Block-modular plants", "Factory-ready, compact systems with the possibility of phased capacity expansion."],
      ["Containerized treatment plants", "Mobile and compact solutions for sites with limited space and fast commissioning requirements."],
      ["Custom solutions", "Process design tailored to the specific facility, wastewater composition and customer requirements."],
    ],
    techLabel: "TREATMENT TECHNOLOGIES",
    techTitle: <>Technology is selected<br />for the wastewater composition.</>,
    techText: "We use modern biological and membrane technologies depending on facility characteristics and the required treated-water quality.",
    technologies: [
      ["MBR", "Membrane Bioreactor", "Membrane biological treatment"],
      ["SBR", "Sequencing Batch Reactor", "Sequencing biological treatment"],
      ["MBBR", "Moving Bed Biofilm Reactor", "Biofilm-based treatment technology"],
      ["A/O", "Anoxic / Oxic", "Organic pollutant and nitrogen removal"],
      ["A²/O", "Anaerobic / Anoxic / Oxic", "Advanced nitrogen and phosphorus removal"],
      ["ANBR", "Anaerobic Bioreactor", "Anaerobic treatment of high-strength wastewater"],
    ],
    engineeringLabel: "ENGINEERING APPROACH",
    engineeringTitle: <>From wastewater analysis<br />to stable operation.</>,
    engineering1:
      "Treatment efficiency depends not only on equipment, but also on the correct process selection, load calculations and coordinated operation of all treatment stages.",
    engineering2:
      "SUVSANOAT treats each facility as one integrated engineering system: from wastewater intake through treatment, disinfection, sludge handling and potential water reuse.",
    geoLabel: "TASHKENT · UZBEKISTAN",
    geoTitle: <>Wastewater treatment plants<br />in Tashkent and Uzbekistan.</>,
    geo1:
      "SUVSANOAT provides design, equipment selection, manufacturing, supply, installation and commissioning of wastewater treatment plants in Tashkent and other regions of Uzbekistan.",
    geo2:
      "We develop solutions for domestic, municipal and industrial wastewater based on plant capacity, wastewater composition and treated-water quality requirements.",
    processLabel: "IMPLEMENTATION STAGES",
    processTitle: <>From input data<br />to commissioning.</>,
    processText: "SUVSANOAT supports the project through all key implementation stages.",
    stages: ["Input data analysis", "Technology selection", "Design", "Manufacturing", "Supply", "Installation", "Commissioning", "Service"],
    ctaLabel: "START A PROJECT",
    ctaTitle: <>Need a wastewater<br />treatment calculation?</>,
    ctaText:
      "Send the facility capacity, technical assignment or wastewater analyses. We will prepare a preliminary engineering solution.",
    ctaButton: "GET A TECHNICAL PROPOSAL",
    footerText: "Engineering systems for water and wastewater treatment.",
    nav: "NAVIGATION",
    contact: "CONTACT",
    home: "Home",
    catalog: "Catalog",
    solutionsNav: "Solutions",
    technologiesNav: "Technologies",
    services: "Services",
    copyright: "© 2026 SUVSANOAT. All rights reserved.",
  },
  zh: {
    back: "← 产品目录",
    quote: "获取报价",
    eyebrow: "污水处理设施",
    heroTitle: <>污水处理设施<br />用于各类污水。</>,
    heroText:
      "为塔什干及乌兹别克斯坦各地的市政、工业和基础设施项目提供污水综合处理设施的设计、生产与供应。",
    watch: "查看解决方案",
    volume: "m³/天",
    volumeTitle: "处理能力范围",
    turnkey: "交钥匙",
    fullCycle: "完整周期",
    turnkeyText: "从设计到项目投运",
    individual: "定制化",
    underObject: "针对项目",
    individualText: "根据原水数据选择处理工艺",
    introLabel: "SUVSANOAT / WASTEWATER",
    introTitle: <>不仅是设备。<br />而是一套完整的处理系统。</>,
    intro1:
      "每套系统均根据项目处理能力、污水水质、运行工况以及出水水质要求进行设计。",
    intro2:
      "解决方案可包括机械、物化和生物处理、膜技术、消毒、污泥处理及自动化控制。",
    solutionsLabel: "综合解决方案",
    solutionsTitle: <>适用于各种项目的<br />污水处理设施。</>,
    solutionsText: "从小型一体化设备到大型工业污水处理综合设施。",
    solutions: [
      ["一体化污水处理设施", "适用于独立项目的紧凑型生活污水处理系统。"],
      ["市政污水处理设施", "适用于居民区、住宅综合体及基础设施项目的完整污水处理方案。"],
      ["工业污水处理设施", "根据工业废水成分及生产特点制定的工艺解决方案。"],
      ["模块化处理站", "工厂预制、占地紧凑，并支持分阶段扩容。"],
      ["集装箱式污水处理设施", "适用于场地有限且要求快速投运的移动式、紧凑型方案。"],
      ["定制化解决方案", "根据具体项目、污水成分及客户要求设计工艺流程。"],
    ],
    techLabel: "处理技术",
    techTitle: <>根据污水水质<br />选择处理工艺。</>,
    techText: "根据项目特点及出水水质要求，采用先进的生物处理和膜处理技术。",
    technologies: [
      ["MBR", "Membrane Bioreactor", "膜生物反应器"],
      ["SBR", "Sequencing Batch Reactor", "序批式生物处理"],
      ["MBBR", "Moving Bed Biofilm Reactor", "移动床生物膜处理技术"],
      ["A/O", "Anoxic / Oxic", "有机物及氮去除"],
      ["A²/O", "Anaerobic / Anoxic / Oxic", "深度脱氮除磷"],
      ["ANBR", "Anaerobic Bioreactor", "高浓度污水厌氧处理"],
    ],
    engineeringLabel: "工程化方法",
    engineeringTitle: <>从污水分析<br />到稳定运行。</>,
    engineering1:
      "污水处理效率不仅取决于设备，还取决于工艺路线选择、负荷计算以及各处理阶段的协调运行。",
    engineering2:
      "SUVSANOAT 将项目作为一个完整的工程系统，从污水进入到处理、消毒、污泥处理以及潜在的中水回用进行整体设计。",
    geoLabel: "塔什干 · 乌兹别克斯坦",
    geoTitle: <>塔什干及乌兹别克斯坦<br />污水处理设施。</>,
    geo1:
      "SUVSANOAT 在塔什干及乌兹别克斯坦其他地区提供污水处理设施的设计、设备选型、生产、供应、安装及调试服务。",
    geo2:
      "针对生活污水、市政污水和工业污水，根据项目处理能力、污水成分及出水水质要求制定解决方案。",
    processLabel: "项目实施阶段",
    processTitle: <>从基础数据<br />到项目投运。</>,
    processText: "SUVSANOAT 在项目实施的所有关键阶段提供工程支持。",
    stages: ["基础数据分析", "工艺选择", "设计", "生产", "供应", "安装", "调试", "服务"],
    ctaLabel: "开始项目",
    ctaTitle: <>需要污水处理<br />方案及计算吗？</>,
    ctaText:
      "请发送项目处理能力、技术任务书或污水分析报告，我们将准备初步工程解决方案。",
    ctaButton: "获取技术方案",
    footerText: "水处理与污水处理工程系统。",
    nav: "导航",
    contact: "联系我们",
    home: "首页",
    catalog: "产品目录",
    solutionsNav: "解决方案",
    technologiesNav: "技术",
    services: "服务",
    copyright: "© 2026 SUVSANOAT. 版权所有。",
  },
} as const;

export default function WastewaterContent() {
  const { language, setLanguage } = useLanguage();
  const t = content[language];

  return (
    <>
      <header className="wwHeader">
        <a href="/" className="wwLogo" aria-label="SUVSANOAT — главная">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <div className="wwHeaderRight">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                style={{
                  border: language === lang ? "1px solid #00d9ff" : "1px solid rgba(255,255,255,.15)",
                  background: language === lang ? "rgba(0,217,255,.12)" : "transparent",
                  color: language === lang ? "#00d9ff" : "#8fa6b1",
                  borderRadius: 6,
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {languageNames[lang]}
              </button>
            ))}
          </div>

          <a href="/#catalog" className="wwBack">{t.back}</a>
          <a href="/#contacts" className="wwHeaderButton">{t.quote}</a>
        </div>
      </header>

      <section className="wwHero">
        <div className="wwHeroBackground">
          <img src="/wastewater-treatment.png" alt={t.eyebrow} />
        </div>
        <div className="wwHeroOverlay" />
        <div className="wwHeroContent">
          <div className="wwEyebrow"><span />{t.eyebrow}</div>
          <h1>{t.heroTitle}</h1>
          <p className="wwHeroText">{t.heroText}</p>
          <div className="wwHeroActions">
            <a href="/#contacts" className="wwPrimaryButton">{t.quote} <span>→</span></a>
            <a href="#wwSolutions" className="wwSecondaryButton">{t.watch}</a>
          </div>
        </div>
        <div className="wwHeroStats">
          <div className="wwHeroStat"><strong>5–200 000</strong><span>{t.volume}</span><p>{t.volumeTitle}</p></div>
          <div className="wwHeroStat"><strong>{t.turnkey}</strong><span>{t.fullCycle}</span><p>{t.turnkeyText}</p></div>
          <div className="wwHeroStat"><strong>{t.individual}</strong><span>{t.underObject}</span><p>{t.individualText}</p></div>
        </div>
      </section>

      <section className="wwIntro">
        <div className="wwIntroLabel">{t.introLabel}</div>
        <div className="wwIntroGrid">
          <h2>{t.introTitle}</h2>
          <div className="wwIntroText"><p>{t.intro1}</p><p>{t.intro2}</p></div>
        </div>
      </section>

      <section className="wwSolutions" id="wwSolutions">
        <div className="wwSectionHeader">
          <div><div className="wwSectionLabel">{t.solutionsLabel}</div><h2>{t.solutionsTitle}</h2></div>
          <p>{t.solutionsText}</p>
        </div>
        <div className="wwSolutionGrid">
          {t.solutions.map(([title, text], index) => (
            <article className="wwSolutionCard" key={index}>
              <div className="wwSolutionTop"><span>{String(index + 1).padStart(2, "0")}</span><b>↗</b></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wwShowcase">
        <div className="wwShowcaseImage"><img src="/wastewater-treatment.png" alt="SUVSANOAT" /></div>
      </section>

      <section className="wwTechnologies">
        <div className="wwSectionHeader">
          <div><div className="wwSectionLabel">{t.techLabel}</div><h2>{t.techTitle}</h2></div>
          <p>{t.techText}</p>
        </div>
        <div className="wwTechnologyGrid">
          {t.technologies.map(([name, title, text]) => (
            <article className="wwTechnologyCard" key={name}>
              <div className="wwTechnologyName">{name}</div><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wwEngineering">
        <div className="wwEngineeringGrid">
          <div><div className="wwSectionLabel">{t.engineeringLabel}</div><h2>{t.engineeringTitle}</h2></div>
          <div className="wwEngineeringText"><p>{t.engineering1}</p><p>{t.engineering2}</p></div>
        </div>
      </section>

      <section className="wwEngineering">
        <div className="wwEngineeringGrid">
          <div><div className="wwSectionLabel">{t.geoLabel}</div><h2>{t.geoTitle}</h2></div>
          <div className="wwEngineeringText"><p>{t.geo1}</p><p>{t.geo2}</p></div>
        </div>
      </section>

      <section className="wwProcess">
        <div className="wwSectionHeader">
          <div><div className="wwSectionLabel">{t.processLabel}</div><h2>{t.processTitle}</h2></div>
          <p>{t.processText}</p>
        </div>
        <div className="wwProcessGrid">
          {t.stages.map((stage, index) => (
            <div className="wwProcessItem" key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span><h3>{stage}</h3>
              {index < t.stages.length - 1 && <b className="wwProcessArrow">→</b>}
            </div>
          ))}
        </div>
      </section>

      <section className="wwCTA">
        <div className="wwCTALabel">{t.ctaLabel}</div>
        <div className="wwCTAGrid">
          <h2>{t.ctaTitle}</h2>
          <div className="wwCTARight">
            <p>{t.ctaText}</p>
            <a href="/#contacts" className="wwCTABtn">{t.ctaButton}<span>→</span></a>
          </div>
        </div>
      </section>

      <footer className="wwFooter">
        <div className="wwFooterTop">
          <div className="wwFooterBrand">
            <a href="/" aria-label="SUVSANOAT — главная"><img src="/logo.png" alt="SUVSANOAT" /></a>
            <p>{t.footerText}</p>
          </div>
          <div className="wwFooterLinks">
            <span>{t.nav}</span>
            <a href="/">{t.home}</a>
            <a href="/#catalog">{t.catalog}</a>
            <a href="/#solutions">{t.solutionsNav}</a>
            <a href="/#technologies">{t.technologiesNav}</a>
            <a href="/#services">{t.services}</a>
          </div>
          <div className="wwFooterContact">
            <span>{t.contact}</span>
            <a href="tel:+998773043400">+998 77 304 34 00</a>
            <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
          </div>
        </div>
        <div className="wwFooterBottom">
          <p>{t.copyright}</p>
          <p>WATER · WASTEWATER · ENGINEERING</p>
        </div>
      </footer>
    </>
  );
}
