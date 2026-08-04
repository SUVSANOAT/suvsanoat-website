import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Технологии очистки сточных вод — MBR, SBR, MBBR, DAF",

  description:
    "SUVSANOAT проектирует системы очистки сточных вод на базе технологий MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, UF и RO. Подбор технологии очистки для промышленных и коммунальных объектов в Узбекистане.",

  alternates: {
    canonical: "/catalog/treatment-technologies",
  },

  openGraph: {
    title: "Технологии очистки сточных вод | SUVSANOAT",
    description:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ультрафильтрация и обратный осмос для современных очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/treatment-technologies",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/treatment-technologies.png",
        width: 1200,
        height: 630,
        alt: "Технологии очистки сточных вод MBR SBR MBBR SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Технологии очистки сточных вод | SUVSANOAT",
    description:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, UF и RO для очистки сточных вод.",
    images: ["/treatment-technologies.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TreatmentTechnologiesPage() {
  const technologies = [
    {
      number: "01",
      title: "MBR",
      subtitle: "Membrane Bioreactor",
      text: "Мембранный биореактор объединяет биологическую очистку и мембранное разделение, обеспечивая высокое качество очищенной воды и компактность сооружений.",
    },
    {
      number: "02",
      title: "SBR",
      subtitle: "Sequencing Batch Reactor",
      text: "Последовательный биологический реактор выполняет основные стадии очистки в одном резервуаре по заданным временным циклам.",
    },
    {
      number: "03",
      title: "MBBR",
      subtitle: "Moving Bed Biofilm Reactor",
      text: "Технология с подвижной биозагрузкой обеспечивает развитие активной биоплёнки и позволяет увеличить эффективность биологической очистки.",
    },
    {
      number: "04",
      title: "A/O",
      subtitle: "Anoxic / Oxic",
      text: "Комбинация аноксидной и аэробной зон для удаления органических загрязнений и соединений азота.",
    },
    {
      number: "05",
      title: "A²/O",
      subtitle: "Anaerobic / Anoxic / Oxic",
      text: "Многостадийная биологическая технология для удаления органических загрязнений, азота и фосфора.",
    },
    {
      number: "06",
      title: "ANBR",
      subtitle: "Anaerobic Bioreactor",
      text: "Анаэробная технология для обработки высококонцентрированных промышленных сточных вод с высокой органической нагрузкой.",
    },
    {
      number: "07",
      title: "DAF",
      subtitle: "Dissolved Air Flotation",
      text: "Напорная флотация применяется для удаления взвешенных веществ, масел, жиров и других трудноосаждаемых загрязнений.",
    },
    {
      number: "08",
      title: "UF",
      subtitle: "Ultrafiltration",
      text: "Мембранная ультрафильтрация удаляет взвешенные вещества, коллоиды и микроорганизмы и применяется для глубокой доочистки воды.",
    },
    {
      number: "09",
      title: "RO",
      subtitle: "Reverse Osmosis",
      text: "Обратный осмос используется для глубокой очистки, снижения минерализации и подготовки воды для повторного или технологического использования.",
    },
  ];

  const selection = [
    {
      number: "01",
      title: "Состав сточных вод",
      text: "Анализируем органические, химические, взвешенные и специфические загрязнения.",
    },
    {
      number: "02",
      title: "Производительность",
      text: "Определяем средний, максимальный и пиковый расход сточных вод.",
    },
    {
      number: "03",
      title: "Требования на выходе",
      text: "Учитываем нормативы сброса или требования к повторному использованию очищенной воды.",
    },
    {
      number: "04",
      title: "Условия объекта",
      text: "Учитываем доступную площадь, существующую инфраструктуру и режим эксплуатации.",
    },
    {
      number: "05",
      title: "Эксплуатационные расходы",
      text: "Сравниваем энергопотребление, реагенты, обслуживание и образование осадка.",
    },
  ];

  const applications = [
    "Коммунальные сточные воды",
    "Текстильная промышленность",
    "Пищевая промышленность",
    "Молочные предприятия",
    "Мясопереработка",
    "Нефтесодержащие стоки",
    "Высококонцентрированные стоки",
    "Повторное использование воды",
  ];

  return (
    <main className="categoryPage">
      {/* HEADER */}
      <header className="categoryHeader">
        <a
          href="/"
          className="categoryLogo"
          aria-label="SUVSANOAT — главная"
        >
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <nav className="categoryNav">
          <a href="/#catalog">Каталог</a>
          <a href="/#solutions">Решения</a>
          <a href="/#technologies">Технологии</a>
          <a href="/#services">Услуги</a>
          <a href="/#contacts">Контакты</a>

          <a href="/#contacts" className="categoryContactButton">
            Получить расчёт
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="categoryHero">
        <div className="categoryHeroImage">
          <img
            src="/treatment-technologies.png"
            alt="Технологии очистки сточных вод MBR SBR MBBR DAF SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>ТЕХНОЛОГИИ ОЧИСТКИ</b>
          </div>

          <div className="categoryHeroLabel">
            11 · ТЕХНОЛОГИИ ОЧИСТКИ
          </div>

          <h1>
            Правильная технология.
            <br />
            Стабильный результат.
          </h1>

          <p>
            Современные биологические, физико-химические и мембранные
            технологии для очистки коммунальных и промышленных сточных вод.
          </p>

          <div className="categoryHeroButtons">
            <a href="#technologies" className="categoryPrimaryButton">
              Смотреть технологии <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Подобрать технологию
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>MBR</strong>
            <span>мембранная очистка</span>
          </div>

          <div>
            <strong>SBR / MBBR</strong>
            <span>биологическая очистка</span>
          </div>

          <div>
            <strong>DAF</strong>
            <span>физико-химическая очистка</span>
          </div>

          <div>
            <strong>UF / RO</strong>
            <span>глубокая доочистка</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ИНЖЕНЕРНЫЕ ТЕХНОЛОГИИ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Не существует
            <br />
            одной технологии для всех.
          </h2>

          <div>
            <p>
              Состав сточных вод разных предприятий может существенно
              отличаться. Поэтому технологическая схема должна подбираться
              на основании исходных данных и требуемого качества очищенной
              воды.
            </p>

            <p>
              SUVSANOAT комбинирует механические, физико-химические,
              биологические и мембранные процессы для создания комплексной
              системы очистки под конкретный объект.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="categoryEquipment" id="technologies">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ТЕХНОЛОГИИ
            </span>

            <h2>
              Современные методы
              <br />
              очистки воды и стоков.
            </h2>
          </div>

          <p>
            Технологии могут применяться отдельно или объединяться
            в многоступенчатую технологическую схему.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {technologies.map((item) => (
            <article
              className="categoryEquipmentCard"
              key={item.number}
            >
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>{item.title}</b>
              </div>

              <h3>{item.title}</h3>

              <strong
                style={{
                  display: "block",
                  marginBottom: "14px",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  opacity: 0.55,
                }}
              >
                {item.subtitle}
              </strong>

              <p>{item.text}</p>

              <a href="/#contacts">
                Подобрать технологию <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SELECTION */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          ПОДБОР ТЕХНОЛОГИИ
        </span>

        <div className="waterProcessHeader">
          <h2>
            Решение начинается
            <br />
            с исходных данных.
          </h2>

          <p>
            Выбор технологии определяется не названием процесса,
            а реальными характеристиками сточных вод и требованиями
            конкретного объекта.
          </p>
        </div>

        <div className="waterProcess">
          {selection.map((step, index) => (
            <div key={step.number} style={{ display: "contents" }}>
              <article className="waterProcessStep">
                <span>{step.number}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </article>

              {index < selection.length - 1 && (
                <div className="waterProcessArrow">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ОБЛАСТИ ПРИМЕНЕНИЯ
            </span>

            <h2>
              Для разных типов
              <br />
              сточных вод.
            </h2>
          </div>

          <p>
            Технологическая схема разрабатывается с учётом отрасли,
            состава загрязнений, режима работы и требований к очищенной воде.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          {applications.map((item, index) => (
            <div
              className="categoryApplicationItem"
              key={item}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="categoryCTA">
        <div>
          <span>
            ПОДБОР ТЕХНОЛОГИИ
          </span>

          <h2>
            Разработаем схему
            <br />
            под ваши сточные воды.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, анализы сточных вод,
            техническое задание и требования к воде на выходе.
            Подберём технологию и подготовим предварительную
            технологическую схему.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ РЕШЕНИЕ <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="categoryFooter">
        <div>
          <a
            href="/"
            className="categoryFooterLogo"
            aria-label="SUVSANOAT — главная"
          >
            <img src="/logo.png" alt="SUVSANOAT" />
          </a>

          <p>
            Инженерные системы очистки воды
            <br />
            и сточных вод.
          </p>
        </div>

        <div>
          <span>НАВИГАЦИЯ</span>

          <a href="/#catalog">Каталог</a>
          <a href="/#solutions">Решения</a>
          <a href="/#technologies">Технологии</a>
          <a href="/#services">Услуги</a>
          <a href="/#contacts">Контакты</a>
        </div>

        <div>
          <span>СВЯЗАТЬСЯ</span>

          <a href="tel:+998773043400">
            +998 77 304 34 00
          </a>

          <a href="mailto:suvsanoat@gmail.com">
            suvsanoat@gmail.com
          </a>
        </div>
      </footer>
    </main>
  );
}