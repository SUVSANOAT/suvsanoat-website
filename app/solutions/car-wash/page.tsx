import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Очистка воды автомойки — оборотное водоснабжение в Узбекистане",
  description:
    "Системы очистки сточных вод и оборотного водоснабжения для автомоек в Узбекистане. Готовые решения 5, 10, 20, 30 и 50 м³/сутки. Проектирование, изготовление, монтаж и пусконаладка.",
  alternates: { canonical: "/solutions/car-wash" },
  openGraph: {
    title: "Очистка воды автомойки в Узбекистане | SUVSANOAT",
    description:
      "Очистка стоков и оборотное водоснабжение автомоек: 5, 10, 20, 30 и 50 м³/сутки. Под ключ.",
    url: "https://suvsanoat.uz/solutions/car-wash",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/car-wash-hero-og.jpg", width: 1200, height: 630, alt: "Очистка воды автомойки SUVSANOAT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистка воды автомойки в Узбекистане | SUVSANOAT",
    description: "Оборотное водоснабжение автомоек: готовые решения от 5 до 50 м³/сутки.",
    images: ["/car-wash-hero-og.jpg"],
  },
  robots: { index: true, follow: true },
};

const capacities = [
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
];

const processSteps = [
  {
    number: "01",
    icon: "🚗",
    title: "Автомойка",
    text: "Образование сточных вод",
  },
  {
    number: "02",
    icon: "▣",
    title: "Сбор стоков",
    text: "Приёмная и накопительная ёмкость",
  },
  {
    number: "03",
    icon: "⚙",
    title: "Очистка",
    text: "Удаление песка, грязи и нефтепродуктов",
  },
  {
    number: "04",
    icon: "≋",
    title: "Фильтрация",
    text: "Тонкая очистка воды",
  },
  {
    number: "05",
    icon: "◉",
    title: "Накопление",
    text: "Подготовленная вода",
  },
  {
    number: "06",
    icon: "♻",
    title: "Повторное использование",
    text: "Возврат воды на автомойку",
  },
];

export default function CarWashPage() {
  return (
    <main style={{ background: "#06131c", color: "#fff" }}>
      {/* HERO */}
      <section
        style={{
          minHeight: "70vh",
          padding: "140px 7% 80px",
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(rgba(4,20,31,.55),rgba(4,20,31,.80)), url('/car-wash-hero.png') center/cover",
        }}
      >
        <div style={{ maxWidth: 900 }}>
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
            Очистка и повторное использование воды для автомоек
          </h1>

          <p
            style={{
              maxWidth: 700,
              color: "rgba(255,255,255,.72)",
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            Комплексные системы очистки сточных вод и оборотного
            водоснабжения для автомоек и автомоек самообслуживания.
            Производительность от 5 до 50 м³/сутки.
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
              Получить расчёт →
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
            ГОТОВЫЕ КОНФИГУРАЦИИ
          </div>

          <h2 style={{ fontSize: "clamp(34px,4vw,52px)", marginBottom: 20 }}>
            Решения для автомоек
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,.62)",
              maxWidth: 750,
              lineHeight: 1.7,
              marginBottom: 45,
            }}
          >
            Подбираем производительность системы в зависимости от количества
            постов, режима работы и фактического расхода воды.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 15,
            }}
          >
            {capacities.map((item) => (
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
            ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС
          </div>

          <h2
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              marginBottom: 20,
            }}
          >
            Как работает система
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
            Сточные воды автомойки проходят несколько ступеней очистки,
            после чего очищенная вода возвращается в технологический цикл.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 12,
            }}
          >
            {processSteps.map((step, index) => (
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
                  {step.icon}
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 10 }}>
                  {step.title}
                </h3>

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

                {index < processSteps.length - 1 && (
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
              <strong style={{ fontSize: 19 }}>
                ♻ Замкнутый цикл воды
              </strong>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "rgba(255,255,255,.6)",
                }}
              >
                Очищенная вода возвращается обратно в технологический процесс.
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
              Получить расчёт
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
            ПРЕИМУЩЕСТВА
          </div>

          <h2
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              marginBottom: 25,
            }}
          >
            Почему оборотное водоснабжение?
          </h2>

          <ul
            style={{
              color: "rgba(255,255,255,.7)",
              lineHeight: 2,
              fontSize: 17,
              paddingLeft: 22,
            }}
          >
            <li>Снижение расхода свежей воды.</li>
            <li>Снижение объёма образующихся сточных вод.</li>
            <li>Повторное использование очищенной воды.</li>
            <li>Автоматизированная работа системы.</li>
            <li>Индивидуальный подбор оборудования под объект.</li>
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
          Рассчитаем систему для вашей автомойки
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,.65)",
            marginBottom: 30,
            lineHeight: 1.7,
          }}
        >
          Сообщите количество постов и примерный расход воды —
          инженер Suvsanoat подготовит предварительное решение.
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