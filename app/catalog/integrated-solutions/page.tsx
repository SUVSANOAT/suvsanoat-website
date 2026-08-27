import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Очистные сооружения под ключ в Узбекистане | SUVSANOAT",

  description:
    "Очистные сооружения под ключ в Узбекистане: проектирование, подбор технологии, производство и поставка оборудования, монтаж, автоматизация, пусконаладка и сервис SUVSANOAT.",

  alternates: {
    canonical: "/catalog/integrated-solutions",
  },

  openGraph: {
    title: "Очистные сооружения под ключ в Узбекистане | SUVSANOAT",
    description:
      "Комплексные очистные сооружения и системы водоподготовки: проектирование, оборудование, поставка, монтаж, автоматизация и запуск.",
    url: "https://suvsanoat.uz/catalog/integrated-solutions",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/integrated-solutions-og.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения под ключ в Узбекистане SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения под ключ | SUVSANOAT",
    description:
      "Проектирование, комплектация, поставка, монтаж и запуск очистных сооружений в Узбекистане.",
    images: ["/integrated-solutions-og.jpg"],
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
      text: "Изучаем техническое задание, производительность, анализы сточных вод, режим поступления стоков и требования к качеству очищенной воды.",
    },
    {
      number: "02",
      title: "Технологическое проектирование",
      text: "Подбираем технологию очистки и разрабатываем технологическую схему очистных сооружений под конкретный объект.",
    },
    {
      number: "03",
      title: "Проектирование оборудования",
      text: "Определяем состав, производительность и технические характеристики основного и вспомогательного оборудования.",
    },
    {
      number: "04",
      title: "Производство и комплектация",
      text: "Организуем изготовление и комплектацию технологического оборудования в соответствии с разработанным инженерным решением.",
    },
    {
      number: "05",
      title: "Комплектация очистных сооружений",
      text: "Формируем единый комплект механического, насосного, аэрационного, технологического, электрического и вспомогательного оборудования.",
    },
    {
      number: "06",
      title: "Поставка оборудования",
      text: "Организуем поставку оборудования и комплектующих на объект заказчика с учётом состава проекта и последовательности монтажных работ.",
    },
    {
      number: "07",
      title: "Монтаж и шеф-монтаж",
      text: "Выполняем монтаж оборудования или инженерное сопровождение монтажных работ с контролем правильности установки и подключения.",
    },
    {
      number: "08",
      title: "Автоматизация и АСУ ТП",
      text: "Комплектуем шкафы управления, PLC, КИПиА, частотные преобразователи и автоматическое управление технологическими процессами.",
    },
    {
      number: "09",
      title: "Пусконаладка",
      text: "Запускаем оборудование, проверяем технологические алгоритмы, настраиваем рабочие режимы и работу системы автоматизации.",
    },
    {
      number: "10",
      title: "Сервисное сопровождение",
      text: "Обеспечиваем техническую поддержку, диагностику, обслуживание оборудования и поставку необходимых запасных частей.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Получаем производительность, техническое задание, анализы сточных вод и требования к очищенной воде.",
    },
    {
      number: "02",
      title: "Инжиниринг",
      text: "Разрабатываем технологическую концепцию, выполняем основные расчёты и определяем состав очистных сооружений.",
    },
    {
      number: "03",
      title: "Комплектация",
      text: "Подбираем технологическое, механическое, насосное, электрическое оборудование и систему автоматизации.",
    },
    {
      number: "04",
      title: "Реализация",
      text: "Организуем производство, поставку, монтаж или шеф-монтаж оборудования непосредственно на объекте.",
    },
    {
      number: "05",
      title: "Запуск",
      text: "Выполняем пусконаладочные работы, настройку технологических режимов и подготовку системы к эксплуатации.",
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
            alt="Очистные сооружения под ключ в Узбекистане SUVSANOAT"
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
            Очистные сооружения
            <br />
            под ключ в Узбекистане.
          </h1>

          <p>
            Проектирование и комплектация очистных сооружений для
            коммунальных и промышленных сточных вод — от подбора технологии
            и оборудования до поставки, монтажа, автоматизации
            и пусконаладки.
          </p>

          <div className="categoryHeroButtons">
            <a
              href="#solutions-list"
              className="categoryPrimaryButton"
            >
              Смотреть этапы проекта <span>→</span>
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
            <span>комплексное решение</span>
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
          ПРОЕКТИРОВАНИЕ ОЧИСТНЫХ СООРУЖЕНИЙ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            От исходных данных
            <br />
            до запуска объекта.
          </h2>

          <div>
            <p>
              Очистные сооружения представляют собой единый технологический
              комплекс. Механическая очистка, насосы, резервуары,
              биологические реакторы, системы аэрации, обезвоживание осадка,
              дозирование и автоматика должны быть правильно рассчитаны
              и согласованы между собой.
            </p>

            <p>
              SUVSANOAT разрабатывает комплексные решения для строительства,
              реконструкции и модернизации очистных сооружений в Узбекистане.
              Проект подбирается под производительность объекта, состав
              сточных вод и требования к качеству очищенной воды.
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
              ПОЛНЫЙ ЦИКЛ ПРОЕКТА
            </span>

            <h2>
              Очистные сооружения
              <br />
              как единая система.
            </h2>
          </div>

          <p>
            Берём в расчёт технологию очистки, оборудование,
            трубопроводную обвязку, электрику и автоматизацию,
            чтобы отдельные узлы работали как единый комплекс.
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

      {/* INTERNAL LINKS */}
      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СОСТАВ ПРОЕКТА
            </span>

            <h2>
              Основные системы
              <br />
              очистных сооружений.
            </h2>
          </div>

          <p>
            Комплексный проект может включать различные технологические
            процессы и оборудование в зависимости от состава сточных вод
            и требуемого результата очистки.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          <a
            href="/catalog/mechanical-treatment"
            className="categoryApplicationItem"
          >
            <span>01</span>
            <strong>Механическая очистка</strong>
          </a>

          <a
            href="/catalog/treatment-technologies"
            className="categoryApplicationItem"
          >
            <span>02</span>
            <strong>Технологии очистки</strong>
          </a>

          <a
            href="/catalog/aeration-equipment"
            className="categoryApplicationItem"
          >
            <span>03</span>
            <strong>Аэрационное оборудование</strong>
          </a>

          <a
            href="/catalog/pump-equipment"
            className="categoryApplicationItem"
          >
            <span>04</span>
            <strong>Насосное оборудование</strong>
          </a>

          <a
            href="/catalog/sludge-treatment"
            className="categoryApplicationItem"
          >
            <span>05</span>
            <strong>Обработка осадка</strong>
          </a>

          <a
            href="/catalog/automation"
            className="categoryApplicationItem"
          >
            <span>06</span>
            <strong>Автоматизация и АСУ ТП</strong>
          </a>

          <a
            href="/catalog/valves-pipelines"
            className="categoryApplicationItem"
          >
            <span>07</span>
            <strong>Арматура и трубопроводы</strong>
          </a>

          <a
            href="/catalog/tanks-reservoirs"
            className="categoryApplicationItem"
          >
            <span>08</span>
            <strong>Резервуары и ёмкости</strong>
          </a>
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
            Работа начинается с исходных данных и инженерного расчёта,
            после чего формируется оборудование, организуется реализация
            проекта и выполняется запуск системы.
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
              Очистные сооружения
              <br />
              для разных объектов.
            </h2>
          </div>

          <p>
            Проектируем новые очистные сооружения и решения для
            реконструкции и модернизации существующих коммунальных
            и промышленных объектов.
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
            ОЧИСТНЫЕ СООРУЖЕНИЯ ПОД КЛЮЧ
          </span>

          <h2>
            Рассчитаем очистные сооружения
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, техническое задание,
            анализы сточных вод и требования к качеству воды на выходе.
            Подготовим предварительную технологическую концепцию,
            состав оборудования и техническое предложение.
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