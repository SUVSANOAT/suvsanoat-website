"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "../../LanguageContext";
import type { Language } from "../../translations";

const languageNames: Record<Language, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
  zh: "中文",
};

type Equipment = {
  number: string;
  title: string;
  code: string;
  text: string;
};

type Translation = {
  back: string;
  home: string;
  catalog: string;
  solutionsNav: string;
  technologiesNav: string;
  services: string;
  contact: string;
  quote: string;
  heroLabel: string;
  breadcrumb: string;
  heroTitle: React.ReactNode;
  heroText: string;
  watch: string;
  ro: string;
  uf: string;
  capacity: string;
  turnkey: string;
  fullCycle: string;
  introLabel: string;
  introTitle: React.ReactNode;
  intro1: string;
  intro2: string;
  equipmentLabel: string;
  equipmentTitle: React.ReactNode;
  equipmentText: string;
  equipment: Equipment[];
  calculate: string;
  processLabel: string;
  processTitle: React.ReactNode;
  processText: string;
  process: [string, string][];
  applicationsLabel: string;
  applicationsTitle: React.ReactNode;
  applicationsText: string;
  applications: string[];
  ctaLabel: string;
  ctaTitle: React.ReactNode;
  ctaText: string;
  ctaButton: string;
  footerText: React.ReactNode;
  navigation: string;
};

const content: Record<Language, Translation> = {
  ru: {
    back: "← КАТАЛОГ", home: "Главная", catalog: "Каталог", solutionsNav: "Решения",
    technologiesNav: "Технологии", services: "Услуги", contact: "СВЯЗАТЬСЯ",
    quote: "Получить расчёт", heroLabel: "ПРОМЫШЛЕННАЯ ВОДОПОДГОТОВКА",
    breadcrumb: "ВОДОПОДГОТОВКА",
    heroTitle: <>Водоподготовка<br />и очистка воды.</>,
    heroText: "Проектируем и поставляем комплексные системы водоподготовки для промышленности, питьевого водоснабжения и технологических процессов.",
    watch: "Смотреть оборудование", ro: "Обратный осмос", uf: "Ультрафильтрация",
    capacity: "м³/сутки", turnkey: "ПОД КЛЮЧ", fullCycle: "Полный цикл проекта",
    introLabel: "ВОДОПОДГОТОВКА",
    introTitle: <>От исходной воды<br />до требуемых показателей.</>,
    intro1: "Качество воды напрямую влияет на технологические процессы, срок службы оборудования и качество конечной продукции.",
    intro2: "SUVSANOAT подбирает технологическую схему на основании анализа исходной воды, требуемой производительности и показателей воды на выходе.",
    equipmentLabel: "ОБОРУДОВАНИЕ",
    equipmentTitle: <>Комплексные системы<br />водоподготовки.</>,
    equipmentText: "От отдельных установок до полностью автоматизированных технологических линий.",
    equipment: [
      {number:"01", title:"Обратный осмос", code:"RO", text:"Мембранные системы глубокой очистки и обессоливания воды для технологических и питьевых нужд."},
      {number:"02", title:"Ультрафильтрация", code:"UF", text:"Удаление взвешенных веществ, коллоидов, бактерий и других загрязнений."},
      {number:"03", title:"Умягчение воды", code:"SOFTENING", text:"Снижение жесткости воды и защита оборудования от образования накипи."},
      {number:"04", title:"Фильтрация", code:"MEDIA", text:"Песчаные, угольные и мультимедийные фильтры для предварительной и глубокой очистки."},
      {number:"05", title:"Обезжелезивание", code:"Fe / Mn", text:"Удаление железа, марганца и связанных с ними загрязнений из исходной воды."},
      {number:"06", title:"Деминерализация", code:"DEMIN", text:"Получение воды с низким содержанием растворенных солей для промышленных процессов."},
      {number:"07", title:"Ионообменные системы", code:"IX", text:"Коррекция ионного состава воды под требования конкретного технологического процесса."},
      {number:"08", title:"Дозирование реагентов", code:"DOSING", text:"Автоматические системы приготовления и точного дозирования химических реагентов."},
    ],
    calculate: "Получить расчёт",
    processLabel: "ТЕХНОЛОГИЧЕСКАЯ СХЕМА",
    processTitle: <>Каждая система начинается<br />с анализа воды.</>,
    processText: "Технологическая цепочка определяется составом исходной воды и требованиями конкретного объекта.",
    process: [
      ["ИСХОДНАЯ ВОДА","Скважина, водопровод, поверхностный источник"],
      ["АНАЛИЗ","Определение состава и основных показателей"],
      ["ПРЕДОЧИСТКА","Фильтрация и предварительная подготовка"],
      ["RO / UF / IX","Основная ступень технологической очистки"],
      ["ГОТОВАЯ ВОДА","Вода с требуемыми показателями качества"],
    ],
    applicationsLabel: "ОБЛАСТИ ПРИМЕНЕНИЯ",
    applicationsTitle: <>Для промышленности<br />и инфраструктуры.</>,
    applicationsText: "Системы водоподготовки проектируются под требования конкретного объекта и требуемые показатели качества воды.",
    applications: ["Питьевое водоснабжение","Промышленные предприятия","Пищевые производства","Котельные и энергетика","Технологические линии","Гостиницы и жилые комплексы","Повторное использование воды","Специальная водоподготовка"],
    ctaLabel: "ПОДБОР СИСТЕМЫ ВОДОПОДГОТОВКИ",
    ctaTitle: <>Рассчитаем систему<br />для вашего объекта.</>,
    ctaText: "Отправьте анализ исходной воды, требуемую производительность и показатели воды на выходе. Подберём технологическую схему и подготовим предварительное техническое решение.",
    ctaButton: "ПОЛУЧИТЬ ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ",
    footerText: <>Инженерные системы очистки воды<br />и сточных вод.</>,
    navigation: "НАВИГАЦИЯ",
  },
  uz: {
    back: "← KATALOG", home: "Bosh sahifa", catalog: "Katalog", solutionsNav: "Yechimlar",
    technologiesNav: "Texnologiyalar", services: "Xizmatlar", contact: "BOG‘LANISH",
    quote: "Hisob-kitob olish", heroLabel: "SANOAT SUV TAYYORLASH",
    breadcrumb: "SUV TAYYORLASH",
    heroTitle: <>Suv tayyorlash<br />va suvni tozalash.</>,
    heroText: "Sanoat, ichimlik suvi ta’minoti va texnologik jarayonlar uchun kompleks suv tayyorlash tizimlarini loyihalaymiz va yetkazib beramiz.",
    watch: "Uskunalarni ko‘rish", ro: "Teskari osmos", uf: "Ultrafiltratsiya",
    capacity: "m³/kun", turnkey: "KALIT TOPSHIRISH", fullCycle: "To‘liq loyiha sikli",
    introLabel: "SUV TAYYORLASH",
    introTitle: <>Boshlang‘ich suvdan<br />talab qilinadigan ko‘rsatkichlargacha.</>,
    intro1: "Suv sifati texnologik jarayonlarga, uskunalarning xizmat muddatiga va yakuniy mahsulot sifatiga bevosita ta’sir qiladi.",
    intro2: "SUVSANOAT boshlang‘ich suv tahlili, talab qilinadigan unumdorlik va chiqishdagi suv ko‘rsatkichlari asosida texnologik sxemani tanlaydi.",
    equipmentLabel: "USKUNALAR",
    equipmentTitle: <>Kompleks suv tayyorlash<br />tizimlari.</>,
    equipmentText: "Alohida qurilmalardan to‘liq avtomatlashtirilgan texnologik liniyalargacha.",
    equipment: [
      {number:"01", title:"Teskari osmos", code:"RO", text:"Texnologik va ichimlik ehtiyojlari uchun suvni chuqur tozalash va tuzsizlantirish membranali tizimlari."},
      {number:"02", title:"Ultrafiltratsiya", code:"UF", text:"Muallaq moddalar, kolloidlar, bakteriyalar va boshqa iflosliklarni olib tashlash."},
      {number:"03", title:"Suvni yumshatish", code:"SOFTENING", text:"Suv qattiqligini kamaytirish va uskunalarni quyqa hosil bo‘lishidan himoya qilish."},
      {number:"04", title:"Filtrlash", code:"MEDIA", text:"Dastlabki va chuqur tozalash uchun qumli, ko‘mirli va multimedia filtrlari."},
      {number:"05", title:"Temirsizlantirish", code:"Fe / Mn", text:"Boshlang‘ich suvdan temir, marganes va ular bilan bog‘liq iflosliklarni olib tashlash."},
      {number:"06", title:"Demineralizatsiya", code:"DEMIN", text:"Sanoat jarayonlari uchun erigan tuzlar miqdori past bo‘lgan suv olish."},
      {number:"07", title:"Ion almashinish tizimlari", code:"IX", text:"Suvning ion tarkibini muayyan texnologik jarayon talablariga moslashtirish."},
      {number:"08", title:"Reagentlarni dozalash", code:"DOSING", text:"Kimyoviy reagentlarni tayyorlash va aniq dozalashning avtomatik tizimlari."},
    ],
    calculate: "Hisob-kitob olish",
    processLabel: "TEXNOLOGIK SXEMA",
    processTitle: <>Har bir tizim<br />suv tahlilidan boshlanadi.</>,
    processText: "Texnologik zanjir boshlang‘ich suv tarkibi va muayyan obyekt talablariga qarab belgilanadi.",
    process: [
      ["BOSHLANG‘ICH SUV","Quduq, vodoprovod, yer usti manbasi"],
      ["TAHLIL","Tarkib va asosiy ko‘rsatkichlarni aniqlash"],
      ["DASTLABKI TOZALASH","Filtrlash va dastlabki tayyorlash"],
      ["RO / UF / IX","Texnologik tozalashning asosiy bosqichi"],
      ["TAYYOR SUV","Talab qilinadigan sifat ko‘rsatkichlariga ega suv"],
    ],
    applicationsLabel: "QO‘LLANISH SOHALARI",
    applicationsTitle: <>Sanoat<br />va infratuzilma uchun.</>,
    applicationsText: "Suv tayyorlash tizimlari muayyan obyekt talablari va kerakli suv sifati ko‘rsatkichlari asosida loyihalanadi.",
    applications: ["Ichimlik suvi ta’minoti","Sanoat korxonalari","Oziq-ovqat ishlab chiqarish","Qozonxonalar va energetika","Texnologik liniyalar","Mehmonxonalar va turar-joy majmualari","Suvni qayta ishlatish","Maxsus suv tayyorlash"],
    ctaLabel: "SUV TAYYORLASH TIZIMINI TANLASH",
    ctaTitle: <>Obyektingiz uchun tizimni<br />hisoblab beramiz.</>,
    ctaText: "Boshlang‘ich suv tahlili, kerakli unumdorlik va chiqishdagi suv ko‘rsatkichlarini yuboring. Texnologik sxemani tanlab, dastlabki texnik yechimni tayyorlaymiz.",
    ctaButton: "DASTLABKI HISOB-KITOB OLISH",
    footerText: <>Suv va oqova suvlarni tozalash<br />muhandislik tizimlari.</>,
    navigation: "NAVIGATSIYA",
  },
  en: {
    back: "← CATALOG", home: "Home", catalog: "Catalog", solutionsNav: "Solutions",
    technologiesNav: "Technologies", services: "Services", contact: "CONTACT",
    quote: "Get a quote", heroLabel: "INDUSTRIAL WATER TREATMENT",
    breadcrumb: "WATER TREATMENT",
    heroTitle: <>Water treatment<br />and purification.</>,
    heroText: "We design and supply complete water treatment systems for industry, drinking water supply and process applications.",
    watch: "View equipment", ro: "Reverse osmosis", uf: "Ultrafiltration",
    capacity: "m³/day", turnkey: "TURNKEY", fullCycle: "Full project cycle",
    introLabel: "WATER TREATMENT",
    introTitle: <>From source water<br />to required parameters.</>,
    intro1: "Water quality directly affects technological processes, equipment service life and final product quality.",
    intro2: "SUVSANOAT selects the process scheme based on source-water analysis, required capacity and outlet-water parameters.",
    equipmentLabel: "EQUIPMENT",
    equipmentTitle: <>Complete water treatment<br />systems.</>,
    equipmentText: "From individual units to fully automated process lines.",
    equipment: [
      {number:"01", title:"Reverse osmosis", code:"RO", text:"Membrane systems for deep purification and desalination of water for process and drinking applications."},
      {number:"02", title:"Ultrafiltration", code:"UF", text:"Removal of suspended solids, colloids, bacteria and other contaminants."},
      {number:"03", title:"Water softening", code:"SOFTENING", text:"Reduction of water hardness and protection of equipment from scale formation."},
      {number:"04", title:"Filtration", code:"MEDIA", text:"Sand, carbon and multimedia filters for pre-treatment and deep purification."},
      {number:"05", title:"Iron removal", code:"Fe / Mn", text:"Removal of iron, manganese and associated contaminants from source water."},
      {number:"06", title:"Demineralization", code:"DEMIN", text:"Production of low-dissolved-solids water for industrial processes."},
      {number:"07", title:"Ion exchange systems", code:"IX", text:"Adjustment of water ionic composition to the requirements of a specific process."},
      {number:"08", title:"Chemical dosing", code:"DOSING", text:"Automatic systems for preparation and precise dosing of chemical reagents."},
    ],
    calculate: "Get a quote",
    processLabel: "PROCESS SCHEME",
    processTitle: <>Every system starts<br />with water analysis.</>,
    processText: "The process chain is determined by the source-water composition and the requirements of the specific facility.",
    process: [
      ["SOURCE WATER","Well, municipal supply, surface source"],
      ["ANALYSIS","Determination of composition and key parameters"],
      ["PRE-TREATMENT","Filtration and preliminary preparation"],
      ["RO / UF / IX","Main treatment stage"],
      ["TREATED WATER","Water meeting the required quality parameters"],
    ],
    applicationsLabel: "APPLICATIONS",
    applicationsTitle: <>For industry<br />and infrastructure.</>,
    applicationsText: "Water treatment systems are designed around the specific facility requirements and target water-quality parameters.",
    applications: ["Drinking water supply","Industrial facilities","Food production","Boiler houses and power engineering","Process lines","Hotels and residential complexes","Water reuse","Specialized water treatment"],
    ctaLabel: "WATER TREATMENT SYSTEM SELECTION",
    ctaTitle: <>We will calculate a system<br />for your facility.</>,
    ctaText: "Send the source-water analysis, required capacity and outlet-water parameters. We will select the process scheme and prepare a preliminary technical solution.",
    ctaButton: "GET A PRELIMINARY CALCULATION",
    footerText: <>Engineering systems for water treatment<br />and wastewater treatment.</>,
    navigation: "NAVIGATION",
  },
  zh: {
    back: "← 产品目录", home: "首页", catalog: "产品目录", solutionsNav: "解决方案",
    technologiesNav: "技术", services: "服务", contact: "联系我们",
    quote: "获取报价", heroLabel: "工业水处理",
    breadcrumb: "水处理",
    heroTitle: <>水处理<br />与净化。</>,
    heroText: "为工业、饮用水供应及工艺用水项目设计并供应完整的水处理系统。",
    watch: "查看设备", ro: "反渗透", uf: "超滤",
    capacity: "m³/天", turnkey: "交钥匙", fullCycle: "完整项目周期",
    introLabel: "水处理",
    introTitle: <>从原水<br />到目标水质指标。</>,
    intro1: "水质直接影响工艺流程、设备使用寿命以及最终产品质量。",
    intro2: "SUVSANOAT 根据原水分析、所需处理能力及出水指标选择合适的工艺方案。",
    equipmentLabel: "设备",
    equipmentTitle: <>完整的水处理<br />系统。</>,
    equipmentText: "从单机设备到全自动化工艺生产线。",
    equipment: [
      {number:"01", title:"反渗透", code:"RO", text:"用于工艺用水和饮用水的深度净化与脱盐膜系统。"},
      {number:"02", title:"超滤", code:"UF", text:"去除悬浮物、胶体、细菌及其他污染物。"},
      {number:"03", title:"软化处理", code:"SOFTENING", text:"降低水硬度，保护设备免受结垢影响。"},
      {number:"04", title:"过滤", code:"MEDIA", text:"用于预处理和深度净化的砂滤、活性炭及多介质过滤器。"},
      {number:"05", title:"除铁除锰", code:"Fe / Mn", text:"去除原水中的铁、锰及相关污染物。"},
      {number:"06", title:"脱盐 / 去离子", code:"DEMIN", text:"为工业工艺生产低溶解盐含量的水。"},
      {number:"07", title:"离子交换系统", code:"IX", text:"根据具体工艺要求调整水的离子组成。"},
      {number:"08", title:"药剂投加", code:"DOSING", text:"化学药剂制备及精准自动投加系统。"},
    ],
    calculate: "获取报价",
    processLabel: "工艺流程",
    processTitle: <>每套系统都从<br />水质分析开始。</>,
    processText: "工艺链根据原水水质及具体项目要求确定。",
    process: [
      ["原水","井水、市政供水、地表水源"],
      ["分析","确定水质组成及主要指标"],
      ["预处理","过滤及预处理"],
      ["RO / UF / IX","主要工艺处理阶段"],
      ["产水","达到所需水质指标的处理水"],
    ],
    applicationsLabel: "应用领域",
    applicationsTitle: <>适用于工业<br />及基础设施。</>,
    applicationsText: "水处理系统根据具体项目要求及目标水质指标进行设计。",
    applications: ["饮用水供应","工业企业","食品生产","锅炉房及能源","工艺生产线","酒店及住宅综合体","水回用","特殊水处理"],
    ctaLabel: "水处理系统选型",
    ctaTitle: <>我们为您的项目<br />计算水处理系统。</>,
    ctaText: "请发送原水分析、所需处理能力和出水指标。我们将选择工艺方案并准备初步技术解决方案。",
    ctaButton: "获取初步计算方案",
    footerText: <>水处理及污水处理<br />工程系统。</>,
    navigation: "导航",
  },
};

export default function WaterTreatmentContent() {
  const { language, setLanguage } = useLanguage();
  const t = content[language];

  return (
    <main className="categoryPage">
      <header className="categoryHeader">
        <a href="/" className="categoryLogo" aria-label="SUVSANOAT — главная">
          <Image src="/logo.png" alt="SUVSANOAT" width={1536} height={864} sizes="200px" />
        </a>
        <nav className="categoryNav">
          <a href="/">{t.home}</a>
          <a href="/#catalog">{t.catalog}</a>
          <a href="/#solutions">{t.solutionsNav}</a>
          <a href="/#technologies">{t.technologiesNav}</a>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <button key={lang} type="button" onClick={() => setLanguage(lang)}
                style={{
                  border: language === lang ? "1px solid #00d9ff" : "1px solid rgba(255,255,255,.15)",
                  background: language === lang ? "rgba(0,217,255,.12)" : "transparent",
                  color: language === lang ? "#00d9ff" : "#8fa6b1",
                  borderRadius: 6, padding:"5px 7px", cursor:"pointer", fontSize:11, fontWeight:700
                }}>
                {languageNames[lang]}
              </button>
            ))}
          </div>
          <a href="/#contacts" className="categoryContactButton">{t.quote}</a>
        </nav>
      </header>

      <section className="categoryHero waterTreatmentHero">
        <div className="categoryHeroImage"><Image src="/water-treatment.png" alt={t.heroLabel} fill priority sizes="100vw" quality={72} style={{ objectFit: "cover", objectPosition: "center" }} /></div>
        <div className="categoryHeroOverlay" />
        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">SUVSANOAT</a><span>→</span><a href="/#catalog">{t.back.replace("← ","")}</a><span>→</span><b>{t.breadcrumb}</b>
          </div>
          <div className="categoryHeroLabel">{t.heroLabel}</div>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
          <div className="categoryHeroButtons">
            <a href="/#contacts" className="categoryPrimaryButton">{t.quote} <span>→</span></a>
            <a href="#equipment" className="categorySecondaryButton">{t.watch}</a>
          </div>
        </div>
        <div className="categoryHeroStats">
          <div><strong>RO</strong><span>{t.ro}</span></div>
          <div><strong>UF</strong><span>{t.uf}</span></div>
          <div><strong>5–200 000</strong><span>{t.capacity}</span></div>
          <div><strong>{t.turnkey}</strong><span>{t.fullCycle}</span></div>
        </div>
      </section>

      <section className="categoryIntro">
        <div className="categorySectionLabel">{t.introLabel}</div>
        <div className="categoryIntroGrid">
          <h2>{t.introTitle}</h2>
          <div><p>{t.intro1}</p><p>{t.intro2}</p></div>
        </div>
      </section>

      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div><span className="categorySectionLabel">{t.equipmentLabel}</span><h2>{t.equipmentTitle}</h2></div>
          <p>{t.equipmentText}</p>
        </div>
        <div className="categoryEquipmentGrid">
          {t.equipment.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
              <div className="categoryEquipmentTop"><span>{item.number}</span><b>{item.code}</b></div>
              <h3>{item.title}</h3><p>{item.text}</p>
              <a href="/#contacts">{t.calculate} <span>→</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="waterProcessSection">
        <div className="categorySectionLabel light">{t.processLabel}</div>
        <div className="waterProcessHeader"><h2>{t.processTitle}</h2><p>{t.processText}</p></div>
        <div className="waterProcess">
          {t.process.map(([title,text], index) => (
            <React.Fragment key={title}>
              <div className="waterProcessStep">
                <span>{String(index+1).padStart(2,"0")}</span><strong>{title}</strong><p>{text}</p>
              </div>
              {index < t.process.length - 1 && <div className="waterProcessArrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div><span className="categorySectionLabel">{t.applicationsLabel}</span><h2>{t.applicationsTitle}</h2></div>
          <p>{t.applicationsText}</p>
        </div>
        <div className="categoryApplicationGrid">
          {t.applications.map((item,index) => (
            <div className="categoryApplicationItem" key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>
          ))}
        </div>
      </section>

      <section className="categoryCTA">
        <div><span>{t.ctaLabel}</span><h2>{t.ctaTitle}</h2></div>
        <div className="categoryCTARight"><p>{t.ctaText}</p><a href="/#contacts">{t.ctaButton} <span>→</span></a></div>
      </section>

      <footer className="categoryFooter">
        <div><a href="/" className="categoryFooterLogo" aria-label="SUVSANOAT — главная"><Image src="/logo.png" alt="SUVSANOAT" width={1536} height={864} sizes="200px" /></a><p>{t.footerText}</p></div>
        <div><span>{t.navigation}</span><a href="/#catalog">{t.catalog}</a><a href="/#solutions">{t.solutionsNav}</a><a href="/#technologies">{t.technologiesNav}</a><a href="/#services">{t.services}</a><a href="/#contacts">{t.contact}</a></div>
        <div><span>{t.contact}</span><a href="tel:+998773043400">+998 77 304 34 00</a><a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a></div>
      </footer>
    </main>
  );
}
