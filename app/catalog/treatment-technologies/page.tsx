import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Технологии очистки сточных вод — MBR, SBR, MBBR, DAF",

  description:
    "Технологии очистки сточных вод SUVSANOAT в Узбекистане: MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, UF и RO. Подбор технологии для промышленных и коммунальных очистных сооружений.",

  alternates: {
    canonical: "/catalog/treatment-technologies",
  },

  openGraph: {
    title: "Технологии очистки сточных вод | SUVSANOAT",
    description:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ультрафильтрация и обратный осмос для промышленных и коммунальных очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/treatment-technologies",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/treatment-technologies.png",
        width: 1200,
        height: 630,
        alt: "Технологии очистки сточных вод MBR SBR MBBR DAF SUVSANOAT",
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
      text: "Мембранный биореактор MBR объединяет биологическую очистку и мембранное разделение. Технология обеспечивает высокое качество очищенной воды и позволяет создавать компактные очистные сооружения.",
    },
    {
      number: "02",
      title: "SBR",
      subtitle: "Sequencing Batch Reactor",
      text: "Технология SBR выполняет основные стадии биологической очистки сточных вод в одном реакторе по заданным временным циклам.",
    },
    {
      number: "03",
      title: "MBBR",
      subtitle: "Moving Bed Biofilm Reactor",
      text: "Технология MBBR использует подвижную биозагрузку для развития активной биоплёнки и повышения эффективности биологической очистки сточных вод.",
    },
    {
      number: "04",
      title: "A/O",
      subtitle: "Anoxic / Oxic",
      text: "Технология A/O сочетает аноксидную и аэробную зоны и применяется для удаления органических загрязнений и соединений азота.",
    },
    {
      number: "05",
      title: "A²/O",
      subtitle: "Anaerobic / Anoxic / Oxic",
      text: "Многостадийная биологическая технология A²/O применяется для удаления органических загрязнений, азота и фосфора из сточных вод.",
    },
    {
      number: "06",
      title: "ANBR",
      subtitle: "Anaerobic Bioreactor",
      text: "Анаэробная технология ANBR применяется для очистки высококонцентрированных промышленных сточных вод с высокой органической нагрузкой.",
    },
    {
      number: "07",
      title: "DAF",
      subtitle: "Dissolved Air Flotation",
      text: "Напорная флотация DAF применяется для удаления взвешенных веществ, масел, жиров и других трудноосаждаемых загрязнений из промышленных сточных вод.",
    },
    {
      number: "08",
      title: "UF",
      subtitle: "Ultrafiltration",
      text: "Ультрафильтрация UF удаляет взвешенные вещества, коллоиды и микроорганизмы и применяется для глубокой доочистки воды и сточных вод.",
    },
    {
      number: "09",
      title: "RO",
      subtitle: "Reverse Osmosis",
      text: "Обратный осмос RO применяется для глубокой очистки воды, снижения минерализации и подготовки очищенной воды для повторного или технологического использования.",
    },
  ];

  const selection = [
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
            Технологии очистки
            <br />
            сточных вод.
          </h1>

          <p>
            MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ультрафильтрация
            и обратный осмос для промышленных и коммунальных
            очистных сооружений.
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
            Подбор технологии
            <br />
            под конкретные стоки.
          </h2>

          <div>
            <p>
              Состав промышленных и коммунальных сточных вод может
              существенно различаться. Поэтому технология очистки
              подбирается на основании производительности объекта,
              состава загрязнений и требуемого качества воды на выходе.
            </p>

            <p>
              SUVSANOAT разрабатывает технологические решения,
              объединяющие механические, физико-химические,
              биологические и мембранные методы очистки в единую
              систему очистных сооружений.
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
              Современные технологии
              <br />
              очистки сточных вод.
            </h2>
          </div>

          <p>
            MBR, SBR, MBBR, DAF и другие процессы могут применяться
            самостоятельно или объединяться в многоступенчатую
            технологическую схему очистки.
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
            Как выбирается технология
            <br />
            очистки сточных вод.
          </h2>

          <p>
            Выбор технологического процесса определяется характеристиками
            сточных вод, производительностью объекта, требованиями
            к очищенной воде и условиями дальнейшей эксплуатации.
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
              Очистка коммунальных
              <br />
              и промышленных стоков.
            </h2>
          </div>

          <p>
            Технологическая схема разрабатывается под отрасль,
            концентрацию загрязнений, режим поступления сточных вод
            и требования к качеству очищенной воды.
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
            Разработаем технологию
            <br />
            под ваши сточные воды.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность объекта, анализ сточных вод,
            техническое задание и требования к качеству воды на выходе.
            Подберём подходящую технологию очистки и подготовим
            предварительное техническое решение.
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