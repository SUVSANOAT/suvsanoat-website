"use client";

import { useRouter } from "next/navigation";
import styles from "./engineering.module.css";
import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import AccountBar, { AccountNote } from "./AccountBar";
import EngineeringStory from "./EngineeringStory";
import type { Language } from "../translations";

type EngineeringText = {
  titleLine1: string;
  titleLine2: string;
  lead: string;
  startButton: string;
  noteRight: string;
  tools: { href: string; label: string }[];
  trustLabel: string;
  cards: { title: string; text: string }[];
  industryHint: string;
  disclaimer: string;
};

const T: Record<Language, EngineeringText> = {
  ru: {
    titleLine1: "Инженерное решение",
    titleLine2: "для очистки сточных вод",
    lead: "Вы даёте исходные данные об объекте. Мы помогаем определить производительность, технологическую схему и состав оборудования ещё до начала полноценного проектирования.",
    startButton: "Начать расчёт",
    noteRight: "Предварительное инженерное решение",
    tools: [
      { href: "/engineering/analysis/network", label: "Гидравлический расчёт наружной сети" },
      { href: "/engineering/analysis/audit", label: "Проверка чужого проекта по ҚМҚ" },
      { href: "/engineering/analysis/storm", label: "Расчёт дождевой канализации" },
      { href: "/engineering/analysis/pipeline", label: "Напорный водовод и насосные станции" },
    ],
    trustLabel: "ЧТО ПОЛУЧАЕТ ПРОЕКТИРОВЩИК",
    cards: [
      {
        title: "AI-анализ",
        text: "Система разбирает исходные данные объекта и определяет, какие параметры необходимо уточнить.",
      },
      {
        title: "Инженерная логика",
        text: "Определяем последовательность процессов и состав оборудования, а не просто подбираем отдельные позиции.",
      },
      {
        title: "Обоснование",
        text: "Показываем, почему выбран конкретный вариант технологии, производительности и оборудования.",
      },
    ],
    industryHint:
      "Один расчёт для любого объекта: справочник отраслей и хозбытовые нормы по ҚМҚ 2.04.03-19, точка сброса и целевые показатели, выбор технологии, расчёт ступеней, спецификация оборудования, чертежи DXF и техническая записка.",
    disclaimer:
      "Предварительный результат не является рабочим проектом. Окончательные технологические решения принимаются после проверки исходных данных инженером.",
  },

  uz: {
    titleLine1: "Oqava suvlarni tozalash uchun",
    titleLine2: "muhandislik yechimi",
    lead: "Siz obyekt bo‘yicha dastlabki ma’lumotlarni berasiz. Biz to‘liq loyihalash boshlanmasidan oldin unumdorlik, texnologik sxema va uskunalar tarkibini aniqlashga yordam beramiz.",
    startButton: "Hisobni boshlash",
    noteRight: "Dastlabki muhandislik yechimi",
    tools: [
      { href: "/engineering/analysis/network", label: "Tashqi tarmoqning gidravlik hisobi" },
      { href: "/engineering/analysis/audit", label: "Boshqa loyihani ҚМҚ bo'yicha tekshirish" },
      { href: "/engineering/analysis/storm", label: "Yomg'ir kanalizatsiyasi hisobi" },
      { href: "/engineering/analysis/pipeline", label: "Bosimli suv quvuri va nasos stansiyalari" },
    ],
    trustLabel: "LOYIHACHI NIMA OLADI",
    cards: [
      {
        title: "AI-tahlil",
        text: "Tizim obyektning dastlabki ma’lumotlarini tahlil qiladi va qaysi parametrlarni aniqlashtirish kerakligini belgilaydi.",
      },
      {
        title: "Muhandislik mantiqi",
        text: "Biz alohida pozitsiyalarni tanlab qo‘ya qolmaymiz, balki jarayonlar ketma-ketligi va uskunalar tarkibini aniqlaymiz.",
      },
      {
        title: "Asoslash",
        text: "Aynan shu texnologiya, unumdorlik va uskunalar varianti nima uchun tanlanganini ko‘rsatamiz.",
      },
    ],
    industryHint:
      "Har qanday obyekt uchun yagona hisob: tarmoqlar ma’lumotnomasi va ҚМҚ 2.04.03-19 bo‘yicha maishiy me’yorlar, chiqarish nuqtasi va maqsadli ko‘rsatkichlar, texnologiya tanlovi, bosqichlar hisobi, uskunalar spetsifikatsiyasi, DXF chizmalar va texnik yozuv.",
    disclaimer:
      "Dastlabki natija ishchi loyiha hisoblanmaydi. Yakuniy texnologik yechimlar dastlabki ma’lumotlar muhandis tomonidan tekshirilgandan so‘ng qabul qilinadi.",
  },

  en: {
    titleLine1: "An engineering solution",
    titleLine2: "for wastewater treatment",
    lead: "You provide the input data for your site. We help determine the capacity, the process flow diagram and the equipment list before full design work begins.",
    startButton: "Start calculation",
    noteRight: "Preliminary engineering solution",
    tools: [
      { href: "/engineering/analysis/network", label: "Sewer network hydraulic calculation" },
      { href: "/engineering/analysis/audit", label: "Third-party design check to ҚМҚ" },
      { href: "/engineering/analysis/storm", label: "Storm drainage calculation" },
      { href: "/engineering/analysis/pipeline", label: "Pressure water main and pumping stations" },
    ],
    trustLabel: "WHAT THE DESIGNER GETS",
    cards: [
      {
        title: "AI analysis",
        text: "The system breaks down the site input data and identifies which parameters still need to be clarified.",
      },
      {
        title: "Engineering logic",
        text: "We define the sequence of processes and the equipment list, rather than simply picking individual items.",
      },
      {
        title: "Justification",
        text: "We show why this particular technology, capacity and equipment option was selected.",
      },
    ],
    industryHint:
      "One calculation for any site: an industry reference and domestic norms to ҚМҚ 2.04.03-19, discharge point and target values, technology selection, stage sizing, equipment schedule, DXF drawings and a technical note.",
    disclaimer:
      "A preliminary result is not a working design. Final process decisions are made after an engineer has verified the input data.",
  },

  zh: {
    titleLine1: "污水处理的",
    titleLine2: "工程解决方案",
    lead: "您提供项目的原始数据。我们在正式设计开始之前，帮助确定处理能力、工艺流程和设备配置。",
    startButton: "开始计算",
    noteRight: "初步工程方案",
    tools: [
      { href: "/engineering/analysis/network", label: "室外管网水力计算" },
      { href: "/engineering/analysis/audit", label: "按 ҚМҚ 审核他方设计" },
      { href: "/engineering/analysis/storm", label: "雨水管网计算" },
      { href: "/engineering/analysis/pipeline", label: "压力输水管与泵站" },
    ],
    trustLabel: "设计人员将获得什么",
    cards: [
      {
        title: "AI 分析",
        text: "系统解析项目的原始数据，并确定还需要澄清哪些参数。",
      },
      {
        title: "工程逻辑",
        text: "我们确定工艺流程顺序和设备配置，而不是简单地挑选单个设备。",
      },
      {
        title: "方案论证",
        text: "我们说明为什么选择这一特定的工艺、处理能力和设备方案。",
      },
    ],
    industryHint:
      "任何项目统一计算：行业手册与 ҚМҚ 2.04.03-19 生活污水定额、排放点与目标指标、工艺选择、处理段计算、设备清单、DXF 图纸与技术说明书。",
    disclaimer:
      "初步结果不构成施工图设计。最终工艺方案需在工程师核实原始数据后确定。",
  },
};

export default function EngineeringPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = T[language];

  /* Свободного описания объекта на этой странице больше нет.
     Оно требовало от человека пересказать словами то, что мастер
     расчёта всё равно спрашивает по пунктам: расход, состав стока,
     точку сброса. Лишний шаг между «Начать расчёт» и первым полем
     ничего не добавлял, поэтому кнопка ведёт прямо в мастер. */

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo} aria-label="Suvsanoat">
            SUVSANOAT
          </a>

          <div className={styles.headerRight}>
            <LanguageSwitcher />
            <span className={styles.headerDot} />
            <span>ENGINEERING</span>
            <AccountBar />
          </div>
        </div>
      </header>

      {/* ПЕРВЫЙ ЭКРАН = ЗАКРЕПЛЁННАЯ СЦЕНА ВО ВСЮ ШИРИНУ
          Сцена занимает весь экран от края до края, а заголовок, лид и
          кнопки лежат накладной панелью поверх неё слева и при прокрутке
          не меняются. Разметка здесь намеренно простая: размеры панели,
          заголовка и кнопок задаёт story.module.css — там же, где
          считается место для сцены. */}
      <EngineeringStory>
        <div className={`${styles.heroContent} ${styles.storyHead}`}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            SUVSANOAT ENGINEERING AI
          </div>

          <h1 className={styles.title}>
            {t.titleLine1}
            <br />
            {t.titleLine2}
          </h1>

          <p className={styles.lead}>{t.lead}</p>

          {/* Главная кнопка ведёт прямо в мастер расчёта.
              Раньше она разворачивала форму описания объекта внизу
              страницы и прокручивала к ней — но первый экран теперь
              закреплённая сцена из восьми этапов, и «прокрутка вниз»
              означает не переход к форме, а пролистывание всей
              анимации. Кто нажал «Начать расчёт», хочет считать, а не
              смотреть. Форма описания словами осталась — ссылкой
              ниже, для тех, у кого нет цифр, а есть только объект. */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.push("/engineering/analysis/industry")}
              className={styles.primaryButton}
            >
              {t.startButton}
              <span className={styles.arrow}>→</span>
            </button>

            <AccountBar variant="hero" buttonClass={styles.ghostButton} />
          </div>


          <AccountNote className={styles.note} />

          {/* Отдельные инструменты проектировщика. Раньше их не было видно
              ниоткуда: страницы работали, но попасть на них можно было
              только по прямой ссылке. Инструмент, о котором не знают,
              всё равно что не сделан. */}
          <div className={styles.tools}>
            {t.tools.map((x) => (
              <a key={x.href} href={x.href} className={styles.toolLink}>
                {x.label}
              </a>
            ))}
          </div>

          <div className={styles.note}>
            <span>AI + ENGINEERING</span>
            <span>{t.noteRight}</span>
          </div>
        </div>
      </EngineeringStory>

      {/* TRUST SECTION */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>{t.trustLabel}</div>

          <div className={styles.cards}>
            {t.cards.map((card, index) => (
              <article className={styles.card} key={card.title}>
                <div className={styles.cardNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h2>{card.title}</h2>

                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ЧТО ДАЛЬШЕ — пояснение маршрута и оговорка о статусе результата */}
      <section className={styles.trustSection}>
        <div className={styles.containerSmall}>
          <p className={styles.formHint} style={{ display: "block" }}>
            {t.industryHint}
          </p>

          <p className={styles.disclaimer}>{t.disclaimer}</p>
        </div>
      </section>

    </main>
  );
}
