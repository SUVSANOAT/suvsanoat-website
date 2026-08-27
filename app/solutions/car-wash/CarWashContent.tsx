"use client";

import Image from "next/image";

import { useLanguage } from "../../LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import type { Language } from "../../translations";

type Capacity = { value: string; title: string; text: string };
type Step = { number: string; title: string; text: string };

type CarWashText = {
  heroTitle: string;
  heroText: string;
  quote: string;
  capacitiesLabel: string;
  capacitiesTitle: string;
  capacitiesText: string;
  capacities: Capacity[];
  processLabel: string;
  processTitle: string;
  processText: string;
  steps: Step[];
  loopTitle: string;
  loopText: string;
  benefitsLabel: string;
  benefitsTitle: string;
  benefits: string[];
  contactTitle: string;
  contactText: string;
};

const icons = ["🚗", "▣", "⚙", "≋", "◉", "♻"];

const T: Record<Language, CarWashText> = {
  ru: {
    heroTitle: "Очистка и повторное использование воды для автомоек",
    heroText:
      "Комплексные системы очистки сточных вод и оборотного водоснабжения для автомоек и автомоек самообслуживания. Производительность от 5 до 50 м³/сутки.",
    quote: "Получить расчёт",
    capacitiesLabel: "ГОТОВЫЕ КОНФИГУРАЦИИ",
    capacitiesTitle: "Решения для автомоек",
    capacitiesText:
      "Подбираем производительность системы в зависимости от количества постов, режима работы и фактического расхода воды.",
    capacities: [
      {
        value: "5 м³/сутки",
        title: "Небольшая автомойка",
        text: "Компактное решение для небольших объектов.",
      },
      {
        value: "10 м³/сутки",
        title: "Средняя автомойка",
        text: "Для автомоек с регулярной загрузкой.",
      },
      {
        value: "20 м³/сутки",
        title: "Автомойка среднего размера",
        text: "Оптимальный вариант для нескольких постов.",
      },
      {
        value: "30 м³/сутки",
        title: "Крупная автомойка",
        text: "Для объектов с высокой интенсивностью работы.",
      },
      {
        value: "50 м³/сутки",
        title: "Крупный комплекс",
        text: "Для крупных автомоек и объектов самообслуживания.",
      },
    ],
    processLabel: "ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС",
    processTitle: "Как работает система",
    processText:
      "Сточные воды автомойки проходят несколько ступеней очистки, после чего очищенная вода возвращается в технологический цикл.",
    steps: [
      { number: "01", title: "Автомойка", text: "Образование сточных вод" },
      { number: "02", title: "Сбор стоков", text: "Приёмная и накопительная ёмкость" },
      { number: "03", title: "Очистка", text: "Удаление песка, грязи и нефтепродуктов" },
      { number: "04", title: "Фильтрация", text: "Тонкая очистка воды" },
      { number: "05", title: "Накопление", text: "Подготовленная вода" },
      { number: "06", title: "Повторное использование", text: "Возврат воды на автомойку" },
    ],
    loopTitle: "Замкнутый цикл воды",
    loopText:
      "Очищенная вода возвращается обратно в технологический процесс.",
    benefitsLabel: "ПРЕИМУЩЕСТВА",
    benefitsTitle: "Почему оборотное водоснабжение?",
    benefits: [
      "Снижение расхода свежей воды.",
      "Снижение объёма образующихся сточных вод.",
      "Повторное использование очищенной воды.",
      "Автоматизированная работа системы.",
      "Индивидуальный подбор оборудования под объект.",
    ],
    contactTitle: "Рассчитаем систему для вашей автомойки",
    contactText:
      "Сообщите количество постов и примерный расход воды — инженер Suvsanoat подготовит предварительное решение.",
  },

  uz: {
    heroTitle: "Avtomoykalar uchun suvni tozalash va qayta ishlatish",
    heroText:
      "Avtomoykalar va o‘zini o‘zi xizmat ko‘rsatuvchi avtomoykalar uchun oqava suvlarni tozalash va aylanma suv ta’minoti tizimlari. Unumdorlik 5 dan 50 m³/sutkagacha.",
    quote: "Hisob-kitob olish",
    capacitiesLabel: "TAYYOR KONFIGURATSIYALAR",
    capacitiesTitle: "Avtomoykalar uchun yechimlar",
    capacitiesText:
      "Tizim unumdorligini postlar soni, ish rejimi va suvning haqiqiy sarfiga qarab tanlaymiz.",
    capacities: [
      {
        value: "5 m³/sutka",
        title: "Kichik avtomoyka",
        text: "Kichik obyektlar uchun ixcham yechim.",
      },
      {
        value: "10 m³/sutka",
        title: "O‘rtacha avtomoyka",
        text: "Muntazam yuklamaga ega avtomoykalar uchun.",
      },
      {
        value: "20 m³/sutka",
        title: "O‘rta hajmdagi avtomoyka",
        text: "Bir necha post uchun maqbul variant.",
      },
      {
        value: "30 m³/sutka",
        title: "Yirik avtomoyka",
        text: "Ish jadalligi yuqori bo‘lgan obyektlar uchun.",
      },
      {
        value: "50 m³/sutka",
        title: "Yirik majmua",
        text: "Yirik avtomoykalar va o‘zini o‘zi xizmat ko‘rsatish obyektlari uchun.",
      },
    ],
    processLabel: "TEXNOLOGIK JARAYON",
    processTitle: "Tizim qanday ishlaydi",
    processText:
      "Avtomoyka oqava suvlari bir necha bosqichli tozalashdan o‘tadi, so‘ngra tozalangan suv texnologik siklga qaytariladi.",
    steps: [
      { number: "01", title: "Avtomoyka", text: "Oqava suvlarning hosil bo‘lishi" },
      { number: "02", title: "Oqavani yig‘ish", text: "Qabul qilish va to‘plash sig‘imi" },
      { number: "03", title: "Tozalash", text: "Qum, loyqa va neft mahsulotlarini yo‘qotish" },
      { number: "04", title: "Filtrlash", text: "Suvni nozik tozalash" },
      { number: "05", title: "To‘plash", text: "Tayyorlangan suv" },
      { number: "06", title: "Qayta ishlatish", text: "Suvni avtomoykaga qaytarish" },
    ],
    loopTitle: "Yopiq suv sikli",
    loopText: "Tozalangan suv yana texnologik jarayonga qaytariladi.",
    benefitsLabel: "AFZALLIKLARI",
    benefitsTitle: "Nima uchun aylanma suv ta’minoti?",
    benefits: [
      "Toza suv sarfining kamayishi.",
      "Hosil bo‘ladigan oqava suvlar hajmining kamayishi.",
      "Tozalangan suvni qayta ishlatish.",
      "Tizimning avtomatlashtirilgan ishlashi.",
      "Uskunalarni obyektga moslab individual tanlash.",
    ],
    contactTitle: "Avtomoykangiz uchun tizimni hisoblab beramiz",
    contactText:
      "Postlar sonini va taxminiy suv sarfini ma’lum qiling — Suvsanoat muhandisi dastlabki yechimni tayyorlaydi.",
  },

  en: {
    heroTitle: "Water treatment and reuse for car washes",
    heroText:
      "Complete wastewater treatment and water recycling systems for car washes and self-service car washes. Capacity from 5 to 50 m³/day.",
    quote: "Request a calculation",
    capacitiesLabel: "READY CONFIGURATIONS",
    capacitiesTitle: "Solutions for car washes",
    capacitiesText:
      "We select the system capacity according to the number of bays, the operating schedule and the actual water consumption.",
    capacities: [
      {
        value: "5 m³/day",
        title: "Small car wash",
        text: "A compact solution for small sites.",
      },
      {
        value: "10 m³/day",
        title: "Medium car wash",
        text: "For car washes with a steady workload.",
      },
      {
        value: "20 m³/day",
        title: "Mid-size car wash",
        text: "The optimal option for several bays.",
      },
      {
        value: "30 m³/day",
        title: "Large car wash",
        text: "For sites with high operating intensity.",
      },
      {
        value: "50 m³/day",
        title: "Large complex",
        text: "For large and self-service car wash facilities.",
      },
    ],
    processLabel: "PROCESS FLOW",
    processTitle: "How the system works",
    processText:
      "Car wash wastewater passes through several treatment stages, after which the treated water is returned to the process cycle.",
    steps: [
      { number: "01", title: "Car wash", text: "Wastewater is generated" },
      { number: "02", title: "Effluent collection", text: "Receiving and buffer tank" },
      { number: "03", title: "Treatment", text: "Removal of sand, dirt and oil products" },
      { number: "04", title: "Filtration", text: "Fine water polishing" },
      { number: "05", title: "Storage", text: "Treated water" },
      { number: "06", title: "Reuse", text: "Water returned to the car wash" },
    ],
    loopTitle: "Closed water loop",
    loopText: "Treated water is returned to the process.",
    benefitsLabel: "BENEFITS",
    benefitsTitle: "Why water recycling?",
    benefits: [
      "Lower fresh water consumption.",
      "Lower volume of generated wastewater.",
      "Reuse of treated water.",
      "Automated system operation.",
      "Equipment selected individually for the site.",
    ],
    contactTitle: "We will size the system for your car wash",
    contactText:
      "Tell us the number of bays and the approximate water consumption — a Suvsanoat engineer will prepare a preliminary solution.",
  },

  zh: {
    heroTitle: "洗车场污水处理与回用",
    heroText:
      "为洗车场和自助洗车场提供成套污水处理与循环供水系统。处理能力 5 至 50 m³/天。",
    quote: "获取计算",
    capacitiesLabel: "标准配置方案",
    capacitiesTitle: "洗车场解决方案",
    capacitiesText:
      "我们根据工位数量、运营模式和实际用水量来确定系统的处理能力。",
    capacities: [
      { value: "5 m³/天", title: "小型洗车场", text: "适用于小型场地的紧凑方案。" },
      { value: "10 m³/天", title: "中型洗车场", text: "适用于业务量稳定的洗车场。" },
      { value: "20 m³/天", title: "中等规模洗车场", text: "多个工位的最佳选择。" },
      { value: "30 m³/天", title: "大型洗车场", text: "适用于业务强度高的场地。" },
      {
        value: "50 m³/天",
        title: "大型综合体",
        text: "适用于大型及自助洗车场。",
      },
    ],
    processLabel: "工艺流程",
    processTitle: "系统如何运行",
    processText:
      "洗车场污水经过多级处理，处理后的水返回工艺循环中重复使用。",
    steps: [
      { number: "01", title: "洗车", text: "产生污水" },
      { number: "02", title: "污水收集", text: "接收与调节水箱" },
      { number: "03", title: "处理", text: "去除泥沙、污垢和石油类物质" },
      { number: "04", title: "过滤", text: "精密水处理" },
      { number: "05", title: "储存", text: "已处理的水" },
      { number: "06", title: "回用", text: "水返回洗车场" },
    ],
    loopTitle: "封闭水循环",
    loopText: "处理后的水重新回到工艺流程中。",
    benefitsLabel: "优势",
    benefitsTitle: "为什么选择循环供水？",
    benefits: [
      "降低新鲜水用量。",
      "减少污水产生量。",
      "处理后的水可重复使用。",
      "系统自动化运行。",
      "按项目为客户单独选型。",
    ],
    contactTitle: "我们将为您的洗车场进行系统计算",
    contactText:
      "请告知工位数量和大致用水量 — Suvsanoat 工程师将编制初步方案。",
  },
};

export default function CarWashContent() {
  const { t: nav, language } = useLanguage();
  const t = T[language];

  return (
    <main style={{ background: "#06131c", color: "#fff" }}>
      {/* HEADER */}
      <header className="categoryHeader">
        <a href="/" className="categoryLogo" aria-label="SUVSANOAT">
          <Image
            src="/logo.png"
            alt="SUVSANOAT"
            width={1536}
            height={864}
            priority
            sizes="200px"
          />
        </a>

        <nav className="categoryNav">
          <a href="/#catalog">{nav.nav.catalog}</a>
          <a href="/#solutions">{nav.nav.solutions}</a>
          <a href="/#technologies">{nav.nav.technologies}</a>
          <a href="/#services">{nav.nav.services}</a>
          <a href="/#contacts">{nav.nav.contacts}</a>

          <LanguageSwitcher />

          <a href="#contact" className="categoryContactButton">
            {t.quote}
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "70vh",
          padding: "140px 7% 80px",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/car-wash-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={72}
          style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(rgba(4,20,31,.55),rgba(4,20,31,.80))",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
          <div
            style={{
              color: "#24b5f5",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            SUVSANOAT · CAR WASH SOLUTIONS
          </div>

          <h1
            style={{
              fontSize: "clamp(42px,6vw,82px)",
              lineHeight: 1,
              marginBottom: 30,
            }}
          >
            {t.heroTitle}
          </h1>

          <p
            style={{
              maxWidth: 700,
              color: "rgba(255,255,255,.72)",
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            {t.heroText}
          </p>

          <div style={{ marginTop: 35 }}>
            <a
              href="#solutions"
              style={{
                display: "inline-flex",
                padding: "17px 28px",
                background: "#159fdf",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              {t.quote} →
            </a>
          </div>
        </div>
      </section>

      {/* CAPACITIES */}
      <section id="solutions" style={{ padding: "90px 7%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              color: "#24b5f5",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 15,
            }}
          >
            {t.capacitiesLabel}
          </div>

          <h2 style={{ fontSize: "clamp(34px,4vw,52px)", marginBottom: 20 }}>
            {t.capacitiesTitle}
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,.62)",
              maxWidth: 750,
              lineHeight: 1.7,
              marginBottom: 45,
            }}
          >
            {t.capacitiesText}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 15,
            }}
          >
            {t.capacities.map((item) => (
              <div
                key={item.value}
                style={{
                  padding: 28,
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.03)",
                }}
              >
                <div
                  style={{
                    color: "#24b5f5",
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 18,
                  }}
                >
                  {item.value}
                </div>

                <h3 style={{ marginBottom: 12 }}>{item.title}</h3>

                <p
                  style={{
                    color: "rgba(255,255,255,.55)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section
        style={{
          padding: "100px 7%",
          background: "#081d2a",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              color: "#24b5f5",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 15,
            }}
          >
            {t.processLabel}
          </div>

          <h2
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              marginBottom: 20,
            }}
          >
            {t.processTitle}
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,.62)",
              maxWidth: 760,
              lineHeight: 1.7,
              marginBottom: 55,
              fontSize: 17,
            }}
          >
            {t.processText}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 12,
            }}
          >
            {t.steps.map((step, index) => (
              <div
                key={step.number}
                style={{
                  position: "relative",
                  padding: "28px 20px",
                  minHeight: 210,
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.035)",
                }}
              >
                <div
                  style={{
                    color: "#24b5f5",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 2,
                    marginBottom: 22,
                  }}
                >
                  {step.number}
                </div>

                <div style={{ fontSize: 34, marginBottom: 18 }}>
                  {icons[index]}
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{step.title}</h3>

                <p
                  style={{
                    color: "rgba(255,255,255,.55)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {step.text}
                </p>

                {index < t.steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: -9,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#24b5f5",
                      fontSize: 20,
                      zIndex: 2,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 45,
              padding: "28px 32px",
              border: "1px solid rgba(36,181,245,.25)",
              background: "rgba(36,181,245,.06)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div>
              <strong style={{ fontSize: 19 }}>♻ {t.loopTitle}</strong>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "rgba(255,255,255,.6)",
                }}
              >
                {t.loopText}
              </p>
            </div>

            <a
              href="#contact"
              style={{
                padding: "14px 22px",
                background: "#159fdf",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {t.quote}
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ padding: "90px 7%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              color: "#24b5f5",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 15,
            }}
          >
            {t.benefitsLabel}
          </div>

          <h2
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              marginBottom: 25,
            }}
          >
            {t.benefitsTitle}
          </h2>

          <ul
            style={{
              color: "rgba(255,255,255,.7)",
              lineHeight: 2,
              fontSize: 17,
              paddingLeft: 22,
            }}
          >
            {t.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        style={{
          padding: "90px 7%",
          textAlign: "center",
          background: "#0a2636",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(34px,4vw,52px)",
            marginBottom: 20,
          }}
        >
          {t.contactTitle}
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,.65)",
            marginBottom: 30,
            lineHeight: 1.7,
          }}
        >
          {t.contactText}
        </p>

        <a
          href="tel:+998773043400"
          style={{
            display: "inline-flex",
            padding: "18px 30px",
            background: "#159fdf",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          +998 77 304 34 00
        </a>
      </section>
    </main>
  );
}
