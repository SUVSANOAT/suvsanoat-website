"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./engineering.module.css";
import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { Language } from "../translations";

type EngineeringText = {
  titleLine1: string;
  titleLine2: string;
  lead: string;
  startButton: string;
  noteRight: string;
  nodes: { title: string; sub: string }[];
  trustLabel: string;
  cards: { title: string; text: string }[];
  stepLabel: string;
  formTitle: string;
  formText: string;
  label: string;
  placeholder: string;
  analyzeButton: string;
  formHint: string;
  disclaimer: string;
  emptyAlert: string;
};

const T: Record<Language, EngineeringText> = {
  ru: {
    titleLine1: "Инженерное решение",
    titleLine2: "для очистки сточных вод",
    lead: "Вы даёте исходные данные об объекте. Мы помогаем определить производительность, технологическую схему и состав оборудования ещё до начала полноценного проектирования.",
    startButton: "Начать анализ",
    noteRight: "Предварительное инженерное решение",
    nodes: [
      { title: "Исходные данные", sub: "объект / расход / нагрузка" },
      { title: "Технология", sub: "MBBR / SBR / MBR / другое" },
      { title: "Оборудование", sub: "насосы / воздуходувки / автоматика" },
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
    stepLabel: "ШАГ 01 / ИСХОДНЫЕ ДАННЫЕ",
    formTitle: "Расскажите о вашем объекте",
    formText:
      "Не обязательно знать специальные термины. Опишите объект своими словами — инженерная система поможет структурировать исходные данные.",
    label: "Что вы проектируете?",
    placeholder:
      "Например: гостиница на 300 человек, расход сточных вод около 50 м³/сутки...",
    analyzeButton: "Проанализировать",
    formHint: "Результат будет предварительным",
    disclaimer:
      "Предварительный результат не является рабочим проектом. Окончательные технологические решения принимаются после проверки исходных данных инженером.",
    emptyAlert: "Пожалуйста, опишите ваш объект.",
  },

  uz: {
    titleLine1: "Oqava suvlarni tozalash uchun",
    titleLine2: "muhandislik yechimi",
    lead: "Siz obyekt bo‘yicha dastlabki ma’lumotlarni berasiz. Biz to‘liq loyihalash boshlanmasidan oldin unumdorlik, texnologik sxema va uskunalar tarkibini aniqlashga yordam beramiz.",
    startButton: "Tahlilni boshlash",
    noteRight: "Dastlabki muhandislik yechimi",
    nodes: [
      { title: "Dastlabki ma’lumotlar", sub: "obyekt / sarf / yuklama" },
      { title: "Texnologiya", sub: "MBBR / SBR / MBR / boshqa" },
      { title: "Uskunalar", sub: "nasoslar / havo puflagichlar / avtomatika" },
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
    stepLabel: "01-BOSQICH / DASTLABKI MA’LUMOTLAR",
    formTitle: "Obyektingiz haqida ma’lumot bering",
    formText:
      "Maxsus atamalarni bilish shart emas. Obyektni o‘z so‘zlaringiz bilan tasvirlang — muhandislik tizimi dastlabki ma’lumotlarni tuzishga yordam beradi.",
    label: "Siz nimani loyihalayapsiz?",
    placeholder:
      "Masalan: 300 kishilik mehmonxona, oqava suv sarfi taxminan 50 m³/sutka...",
    analyzeButton: "Tahlil qilish",
    formHint: "Natija dastlabki bo‘ladi",
    disclaimer:
      "Dastlabki natija ishchi loyiha hisoblanmaydi. Yakuniy texnologik yechimlar dastlabki ma’lumotlar muhandis tomonidan tekshirilgandan so‘ng qabul qilinadi.",
    emptyAlert: "Iltimos, obyektingizni tasvirlab bering.",
  },

  en: {
    titleLine1: "An engineering solution",
    titleLine2: "for wastewater treatment",
    lead: "You provide the input data for your site. We help determine the capacity, the process flow diagram and the equipment list before full design work begins.",
    startButton: "Start analysis",
    noteRight: "Preliminary engineering solution",
    nodes: [
      { title: "Input data", sub: "site / flow / load" },
      { title: "Technology", sub: "MBBR / SBR / MBR / other" },
      { title: "Equipment", sub: "pumps / blowers / automation" },
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
    stepLabel: "STEP 01 / INPUT DATA",
    formTitle: "Tell us about your site",
    formText:
      "You do not need to know the technical terms. Describe the site in your own words — the engineering system will help structure the input data.",
    label: "What are you designing?",
    placeholder:
      "For example: a hotel for 300 people, wastewater flow about 50 m³/day...",
    analyzeButton: "Analyse",
    formHint: "The result will be preliminary",
    disclaimer:
      "A preliminary result is not a working design. Final process decisions are made after an engineer has verified the input data.",
    emptyAlert: "Please describe your site.",
  },

  zh: {
    titleLine1: "污水处理的",
    titleLine2: "工程解决方案",
    lead: "您提供项目的原始数据。我们在正式设计开始之前，帮助确定处理能力、工艺流程和设备配置。",
    startButton: "开始分析",
    noteRight: "初步工程方案",
    nodes: [
      { title: "原始数据", sub: "项目 / 流量 / 负荷" },
      { title: "工艺技术", sub: "MBBR / SBR / MBR / 其他" },
      { title: "设备", sub: "水泵 / 鼓风机 / 自动化" },
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
    stepLabel: "第 01 步 / 原始数据",
    formTitle: "请介绍您的项目",
    formText:
      "您不需要掌握专业术语。用自己的话描述项目即可 — 工程系统会帮助整理原始数据。",
    label: "您正在设计什么？",
    placeholder: "例如：可容纳 300 人的酒店，污水流量约 50 m³/天……",
    analyzeButton: "进行分析",
    formHint: "结果为初步方案",
    disclaimer:
      "初步结果不构成施工图设计。最终工艺方案需在工程师核实原始数据后确定。",
    emptyAlert: "请描述您的项目。",
  },
};

export default function EngineeringPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = T[language];

  const [started, setStarted] = useState(false);
  const [project, setProject] = useState("");

  const formRef = useRef<HTMLElement | null>(null);

  const handleStart = () => {
    setStarted(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleAnalyze = () => {
    if (!project.trim()) {
      alert(t.emptyAlert);
      return;
    }

    /*
     * Пока сохраняем введённое описание и
     * переходим на страницу выбора параметров.
     */
    const query = new URLSearchParams();

    query.set("object", project.trim());

    router.push(`/engineering/analysis/flow?${query.toString()}`);
  };

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
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />

        <div className={styles.container}>
          <div className={styles.heroContent}>
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

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleStart}
                className={styles.primaryButton}
              >
                {t.startButton}
                <span>→</span>
              </button>

              <a href="/" className={styles.secondaryButton}>
                SUVSANOAT
              </a>
            </div>

            <div className={styles.note}>
              <span>AI + ENGINEERING</span>
              <span>{t.noteRight}</span>
            </div>
          </div>

          {/* ENGINEERING VISUAL */}
          <div className={styles.visual}>
            <div className={styles.visualFrame}>
              <div className={styles.visualTop}>
                <span>ENGINEERING SYSTEM</span>
                <span>01 / 03</span>
              </div>

              <div className={styles.diagram}>
                <div className={styles.diagramLine} />

                {t.nodes.map((node, index) => (
                  <div key={node.title} style={{ display: "contents" }}>
                    <div className={styles.node}>
                      <span>{String(index + 1).padStart(2, "0")}</span>

                      <strong>{node.title}</strong>

                      <small>{node.sub}</small>
                    </div>

                    {index < t.nodes.length - 1 && (
                      <div className={styles.connector} />
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.visualBottom}>
                <span>ENGINEERING LOGIC</span>

                <span className={styles.status}>● READY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* FORM / STEP 01 */}
      {started && (
        <section ref={formRef} className={styles.formSection}>
          <div className={styles.containerSmall}>
            <div className={styles.formHeader}>
              <div className={styles.sectionLabel}>{t.stepLabel}</div>

              <h2>{t.formTitle}</h2>

              <p>{t.formText}</p>
            </div>

            <div className={styles.formCard}>
              <label htmlFor="project" className={styles.label}>
                {t.label}
              </label>

              <textarea
                id="project"
                rows={6}
                value={project}
                onChange={(event) => setProject(event.target.value)}
                placeholder={t.placeholder}
                className={styles.textarea}
              />

              <div className={styles.formFooter}>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className={styles.primaryButton}
                >
                  {t.analyzeButton}
                  <span>→</span>
                </button>

                <span className={styles.formHint}>{t.formHint}</span>
              </div>
            </div>

            <p className={styles.disclaimer}>{t.disclaimer}</p>
          </div>
        </section>
      )}
    </main>
  );
}
