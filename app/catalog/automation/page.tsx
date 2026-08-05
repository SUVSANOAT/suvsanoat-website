import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Автоматизация очистных сооружений и водоподготовки в Узбекистане",

  description:
    "Автоматизация очистных сооружений и водоподготовки SUVSANOAT в Узбекистане: АСУ ТП, шкафы управления, PLC/ПЛК, SCADA, КИПиА, HMI, частотные преобразователи и удалённый мониторинг.",

  alternates: {
    canonical: "/catalog/automation",
  },

  openGraph: {
    title: "Автоматизация очистных сооружений и водоподготовки | SUVSANOAT",
    description:
      "АСУ ТП, шкафы управления, PLC/ПЛК, SCADA, КИПиА и автоматизация технологических процессов очистки сточных вод и водоподготовки.",
    url: "https://suvsanoat.uz/catalog/automation",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/automation.png",
        width: 1200,
        height: 630,
        alt: "Автоматизация очистных сооружений и шкафы управления SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Автоматизация очистных сооружений | SUVSANOAT",
    description:
      "АСУ ТП, PLC, SCADA, шкафы управления, КИПиА и автоматизация инженерных систем.",
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
      text: "Комплектные электрические шкафы управления насосами, воздуходувками, мешалками, дозирующим и другим технологическим оборудованием очистных сооружений.",
    },
    {
      number: "02",
      title: "PLC / ПЛК",
      text: "Программируемые логические контроллеры для автоматического управления технологическими процессами водоподготовки и очистки сточных вод.",
    },
    {
      number: "03",
      title: "SCADA-системы",
      text: "Диспетчеризация, визуализация технологических параметров, архивирование данных, регистрация событий и централизованный контроль оборудования.",
    },
    {
      number: "04",
      title: "Частотные преобразователи",
      text: "Плавное регулирование производительности насосов и воздуходувок для поддержания требуемых параметров и оптимизации энергопотребления.",
    },
    {
      number: "05",
      title: "Датчики и КИПиА",
      text: "Контроль уровня, расхода, давления, температуры, pH, ORP, растворённого кислорода и других технологических параметров.",
    },
    {
      number: "06",
      title: "Панели оператора HMI",
      text: "Локальное управление оборудованием, настройка режимов работы и наглядное отображение состояния технологического процесса.",
    },
    {
      number: "07",
      title: "Системы сигнализации и защиты",
      text: "Контроль аварийных режимов, предупреждения, блокировки, защита технологического оборудования и оперативное информирование персонала.",
    },
    {
      number: "08",
      title: "Удалённый мониторинг",
      text: "Удалённый контроль состояния объекта, технологических параметров, работы оборудования и аварийных событий.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Технологический алгоритм",
      text: "Анализируем технологическую схему и определяем последовательность работы оборудования, блокировки и необходимые режимы управления.",
    },
    {
      number: "02",
      title: "Подбор КИПиА",
      text: "Определяем необходимые датчики, измерительные приборы, исполнительные механизмы и точки контроля технологического процесса.",
    },
    {
      number: "03",
      title: "Шкаф управления",
      text: "Проектируем систему электропитания, автоматического управления, коммутации и защиты технологического оборудования.",
    },
    {
      number: "04",
      title: "PLC / SCADA",
      text: "Разрабатываем программную логику PLC, интерфейсы HMI, визуализацию и систему диспетчерского контроля SCADA.",
    },
    {
      number: "05",
      title: "Пусконаладка",
      text: "Проверяем алгоритмы, настраиваем датчики и оборудование, тестируем защиту и запускаем систему в автоматическом режиме.",
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
            alt="Автоматизация очистных сооружений, PLC, SCADA и шкафы управления SUVSANOAT"
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
            Автоматизация очистных сооружений
            <br />
            и водоподготовки.
          </h1>

          <p>
            АСУ ТП, шкафы управления, PLC/ПЛК, SCADA, HMI, КИПиА,
            частотное регулирование и удалённый мониторинг для стабильной
            автоматической работы инженерных и технологических систем.
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
            <strong>АСУ ТП</strong>
            <span>единая система управления</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          АВТОМАТИЗАЦИЯ И АСУ ТП
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Единое управление
            <br />
            технологическим процессом.
          </h2>

          <div>
            <p>
              Современные очистные сооружения и системы водоподготовки
              состоят из взаимосвязанного насосного, аэрационного,
              дозирующего и технологического оборудования, которое должно
              работать в заданной последовательности и автоматически
              реагировать на изменение параметров процесса.
            </p>

            <p>
              SUVSANOAT разрабатывает системы автоматизации и АСУ ТП
              для управления насосами, воздуходувками, мешалками,
              дозирующим оборудованием, клапанами и другими элементами
              технологического комплекса.
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
              Управление, контроль
              <br />
              и диспетчеризация.
            </h2>
          </div>

          <p>
            От отдельных шкафов управления до комплексной АСУ ТП
            очистных сооружений с PLC, HMI, SCADA, КИПиА
            и удалённым мониторингом.
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
            От технологического алгоритма
            <br />
            до автоматической работы.
          </h2>

          <p>
            Система управления разрабатывается на основании технологической
            схемы объекта, перечня оборудования, измеряемых параметров
            и требуемых алгоритмов работы.
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
            Проектируем автоматизацию для новых объектов и модернизации
            существующих очистных сооружений, насосных станций,
            систем водоподготовки, аэрации и дозирования.
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
            Разработаем АСУ ТП
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте технологическую схему, перечень оборудования,
            электрические данные или техническое задание. Подготовим
            предварительное решение по шкафам управления, PLC, SCADA,
            КИПиА и диспетчеризации объекта.
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