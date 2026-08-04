import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Очистные сооружения под ключ в Узбекистане",

  description:
    "SUVSANOAT реализует комплексные проекты очистных сооружений и водоподготовки под ключ в Узбекистане: проектирование, производство, поставка, монтаж, пусконаладка, автоматизация и сервис.",

  alternates: {
    canonical: "/catalog/integrated-solutions",
  },

  openGraph: {
    title: "Очистные сооружения под ключ в Узбекистане | SUVSANOAT",
    description:
      "Комплексные инженерные решения для очистки сточных вод и водоподготовки: от проектирования до запуска и сервисного обслуживания.",
    url: "https://suvsanoat.uz/catalog/integrated-solutions",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/integrated-solutions.png",
        width: 1200,
        height: 630,
        alt: "Комплексные очистные сооружения под ключ SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения под ключ | SUVSANOAT",
    description:
      "Проектирование, производство, поставка, монтаж и запуск очистных сооружений и систем водоподготовки.",
    images: ["/integrated-solutions.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function IntegratedSolutionsPage() {
  const solutions = [
    {
      number: "01",
      title: "Анализ исходных данных",
      text: "Изучение технического задания, производительности, состава воды или сточных вод и требований заказчика.",
    },
    {
      number: "02",
      title: "Технологическое проектирование",
      text: "Подбор технологии и разработка оптимальной технологической схемы для конкретного объекта.",
    },
    {
      number: "03",
      title: "Проектирование оборудования",
      text: "Определение состава, характеристик и параметров технологического оборудования.",
    },
    {
      number: "04",
      title: "Производство",
      text: "Изготовление и комплектация оборудования в соответствии с разработанным инженерным решением.",
    },
    {
      number: "05",
      title: "Комплектация объекта",
      text: "Формирование единого комплекта механического, технологического, электрического и вспомогательного оборудования.",
    },
    {
      number: "06",
      title: "Поставка",
      text: "Организация поставки оборудования и комплектующих непосредственно на объект заказчика.",
    },
    {
      number: "07",
      title: "Монтаж и шеф-монтаж",
      text: "Монтаж оборудования или техническое сопровождение монтажных работ на объекте.",
    },
    {
      number: "08",
      title: "Автоматизация",
      text: "Шкафы управления, PLC, КИПиА и автоматическое управление технологическими процессами.",
    },
    {
      number: "09",
      title: "Пусконаладка",
      text: "Запуск оборудования, настройка технологических режимов и проверка работы всей системы.",
    },
    {
      number: "10",
      title: "Сервис",
      text: "Техническое сопровождение после запуска, диагностика, обслуживание оборудования и поставка запасных частей.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Получаем техническое задание, анализы воды или стоков, производительность и требования заказчика.",
    },
    {
      number: "02",
      title: "Инжиниринг",
      text: "Разрабатываем технологическую концепцию, определяем основные сооружения и состав оборудования.",
    },
    {
      number: "03",
      title: "Комплектация",
      text: "Формируем единый комплект технологического, механического, электрического и автоматизированного оборудования.",
    },
    {
      number: "04",
      title: "Реализация",
      text: "Организуем производство, поставку, монтаж или шеф-монтаж оборудования на объекте.",
    },
    {
      number: "05",
      title: "Запуск",
      text: "Выполняем пусконаладку, настройку технологических режимов и передаём систему в эксплуатацию.",
    },
  ];

  const applications = [
    "Промышленные предприятия",
    "Текстильные производства",
    "Пищевые предприятия",
    "Жилые комплексы",
    "Гостиницы и больницы",
    "Аэропорты и инфраструктура",
    "Коммунальные очистные сооружения",
    "Модернизация существующих объектов",
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
            src="/integrated-solutions.png"
            alt="Комплексные очистные сооружения под ключ SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>КОМПЛЕКСНЫЕ РЕШЕНИЯ</b>
          </div>

          <div className="categoryHeroLabel">
            12 · КОМПЛЕКСНЫЕ РЕШЕНИЯ
          </div>

          <h1>
            Один проект.
            <br />
            Одна система.
          </h1>

          <p>
            Комплексные инженерные решения для очистки сточных вод
            и водоподготовки — от разработки технологической схемы
            и комплектации оборудования до монтажа, запуска
            и сервисного сопровождения.
          </p>

          <div className="categoryHeroButtons">
            <a
              href="#solutions-list"
              className="categoryPrimaryButton"
            >
              Смотреть решения <span>→</span>
            </a>

            <a
              href="/#contacts"
              className="categorySecondaryButton"
            >
              Обсудить проект
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>полный цикл проекта</span>
          </div>

          <div>
            <strong>5–200 000</strong>
            <span>м³/сутки</span>
          </div>

          <div>
            <strong>1 СИСТЕМА</strong>
            <span>единая ответственность</span>
          </div>

          <div>
            <strong>24 / 7</strong>
            <span>техническое сопровождение</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          КОМПЛЕКСНЫЙ ИНЖИНИРИНГ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            От исходных данных
            <br />
            до работающего объекта.
          </h2>

          <div>
            <p>
              Очистные сооружения — это не набор отдельных единиц
              оборудования. Насосы, резервуары, биологические реакторы,
              мембраны, системы аэрации, дозирование и автоматика должны
              работать как единый технологический комплекс.
            </p>

            <p>
              SUVSANOAT объединяет все основные этапы реализации проекта:
              инженерные расчёты, подбор технологии, комплектацию,
              производство, поставку, монтаж, автоматизацию,
              пусконаладку и сервис.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section
        className="categoryEquipment"
        id="solutions-list"
      >
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ПОЛНЫЙ ЦИКЛ
            </span>

            <h2>
              Всё необходимое
              <br />
              в одном проекте.
            </h2>
          </div>

          <p>
            Комплексный подход снижает риски несогласованности оборудования
            и позволяет рассматривать объект как единую инженерную систему.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {solutions.map((item) => (
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
                Обсудить проект <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          РЕАЛИЗАЦИЯ ПРОЕКТА
        </span>

        <div className="waterProcessHeader">
          <h2>
            Пять этапов
            <br />
            до запуска объекта.
          </h2>

          <p>
            Каждый проект начинается с исходных данных и заканчивается
            настройкой системы в реальных эксплуатационных условиях.
          </p>
        </div>

        <div className="waterProcess">
          {process.map((step, index) => (
            <div
              key={step.number}
              style={{ display: "contents" }}
            >
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
              Решения для
              <br />
              разных объектов.
            </h2>
          </div>

          <p>
            Проектируем новые системы и решения для реконструкции
            и модернизации существующих очистных сооружений.
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
            НАЧАТЬ ПРОЕКТ
          </span>

          <h2>
            Нужны очистные
            <br />
            сооружения под ключ?
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, техническое задание,
            анализы воды или сточных вод и требования к результату.
            Подготовим предварительную технологическую концепцию
            и состав оборудования.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ ПРЕДЛОЖЕНИЕ{" "}
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