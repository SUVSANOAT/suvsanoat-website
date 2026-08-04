import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Автоматизация очистных сооружений в Узбекистане",

  description:
    "SUVSANOAT проектирует системы автоматизации очистных сооружений и водоподготовки в Узбекистане: шкафы управления, PLC/ПЛК, SCADA, частотные преобразователи, датчики и КИПиА.",

  alternates: {
    canonical: "/catalog/automation",
  },

  openGraph: {
    title: "Автоматизация очистных сооружений | SUVSANOAT",
    description:
      "Шкафы управления, PLC, SCADA, КИПиА и автоматизация технологических процессов водоподготовки и очистки сточных вод.",
    url: "https://suvsanoat.uz/catalog/automation",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/automation.png",
        width: 1200,
        height: 630,
        alt: "Автоматизация очистных сооружений SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Автоматизация очистных сооружений | SUVSANOAT",
    description:
      "PLC, SCADA, шкафы управления, датчики и автоматизация инженерных систем.",
    images: ["/automation.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AutomationPage() {
  const equipment = [
    {
      number: "01",
      title: "Шкафы управления",
      text: "Комплектные электрические шкафы управления насосами, воздуходувками, мешалками и другим технологическим оборудованием.",
    },
    {
      number: "02",
      title: "PLC / ПЛК",
      text: "Программируемые логические контроллеры для автоматического управления технологическими процессами.",
    },
    {
      number: "03",
      title: "SCADA-системы",
      text: "Диспетчеризация, визуализация параметров, архивирование данных и централизованный контроль оборудования.",
    },
    {
      number: "04",
      title: "Частотные преобразователи",
      text: "Плавное регулирование производительности насосов и воздуходувок с оптимизацией энергопотребления.",
    },
    {
      number: "05",
      title: "Датчики и КИПиА",
      text: "Контроль уровня, расхода, давления, pH, ORP, растворённого кислорода и других технологических параметров.",
    },
    {
      number: "06",
      title: "Панели оператора HMI",
      text: "Удобное локальное управление оборудованием и отображение текущего состояния технологического процесса.",
    },
    {
      number: "07",
      title: "Системы сигнализации",
      text: "Контроль аварийных режимов, предупреждения, защита оборудования и оперативное информирование персонала.",
    },
    {
      number: "08",
      title: "Удалённый мониторинг",
      text: "Контроль состояния объекта, основных параметров и аварийных событий с удалённого рабочего места.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Технологический алгоритм",
      text: "Определяем последовательность работы оборудования и необходимые режимы управления.",
    },
    {
      number: "02",
      title: "Подбор КИПиА",
      text: "Определяем необходимые датчики, измерительные приборы и исполнительные механизмы.",
    },
    {
      number: "03",
      title: "Шкаф управления",
      text: "Проектируем систему электропитания, управления и защиты технологического оборудования.",
    },
    {
      number: "04",
      title: "PLC / SCADA",
      text: "Разрабатываем программную логику, визуализацию и систему диспетчерского контроля.",
    },
    {
      number: "05",
      title: "Пусконаладка",
      text: "Проверяем алгоритмы, настраиваем оборудование и запускаем систему в рабочем режиме.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Канализационные насосные станции",
    "Насосные станции",
    "Системы дозирования",
    "Системы аэрации",
    "Промышленные предприятия",
    "Инженерная инфраструктура",
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
            src="/automation.png"
            alt="Автоматизация очистных сооружений и шкафы управления SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>АВТОМАТИЗАЦИЯ</b>
          </div>

          <div className="categoryHeroLabel">
            09 · АВТОМАТИЗАЦИЯ
          </div>

          <h1>
            Полный контроль.
            <br />
            Стабильная работа.
          </h1>

          <p>
            Автоматизация очистных сооружений, водоподготовки и инженерных
            систем: шкафы управления, PLC, SCADA, КИПиА, частотное
            регулирование и удалённый мониторинг.
          </p>

          <div className="categoryHeroButtons">
            <a href="#equipment" className="categoryPrimaryButton">
              Смотреть решения <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Получить расчёт
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>PLC</strong>
            <span>автоматическое управление</span>
          </div>

          <div>
            <strong>SCADA</strong>
            <span>диспетчеризация</span>
          </div>

          <div>
            <strong>24 / 7</strong>
            <span>контроль объекта</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>стабильная работа</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          АВТОМАТИЗАЦИЯ И УПРАВЛЕНИЕ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Оборудование работает
            <br />
            как единая система.
          </h2>

          <div>
            <p>
              Современные очистные сооружения состоят из большого количества
              взаимосвязанного оборудования, которое должно работать
              в правильной последовательности и автоматически реагировать
              на изменение технологических параметров.
            </p>

            <p>
              SUVSANOAT разрабатывает системы автоматизации для управления
              насосами, воздуходувками, мешалками, дозирующим оборудованием
              и другими элементами технологического комплекса.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СИСТЕМЫ АВТОМАТИЗАЦИИ
            </span>

            <h2>
              Управление.
              <br />
              Контроль. Диспетчеризация.
            </h2>
          </div>

          <p>
            От отдельных шкафов управления до комплексных систем
            автоматизации очистных сооружений с PLC и SCADA.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {equipment.map((item) => (
            <article
              className="categoryEquipmentCard"
              key={item.number}
            >
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>↗</b>
              </div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

              <a href="/#contacts">
                Получить расчёт <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          ЭТАПЫ АВТОМАТИЗАЦИИ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От алгоритма
            <br />
            до автоматической работы.
          </h2>

          <p>
            Система управления разрабатывается на основании технологической
            схемы объекта и алгоритмов работы оборудования.
          </p>
        </div>

        <div className="waterProcess">
          {process.map((step, index) => (
            <div key={step.number} style={{ display: "contents" }}>
              <article className="waterProcessStep">
                <span>{step.number}</span>

                <strong>{step.title}</strong>

                <p>{step.text}</p>
              </article>

              {index < process.length - 1 && (
                <div className="waterProcessArrow">
                  →
                </div>
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
              Автоматизация
              <br />
              инженерных систем.
            </h2>
          </div>

          <p>
            Системы управления могут разрабатываться как для новых объектов,
            так и для модернизации существующего оборудования.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          {applications.map((item, index) => (
            <div
              className="categoryApplicationItem"
              key={item}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="categoryCTA">
        <div>
          <span>
            АВТОМАТИЗАЦИЯ ОБЪЕКТА
          </span>

          <h2>
            Разработаем систему
            <br />
            управления под ваш объект.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте технологическую схему, перечень оборудования
            или техническое задание. Подготовим предварительное решение
            по автоматизации, управлению и диспетчеризации объекта.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ{" "}
            <span>→</span>
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
            <img
              src="/logo.png"
              alt="SUVSANOAT"
            />
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