import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Аэрационное оборудование в Узбекистане — диффузоры и воздуходувки",

  description:
    "SUVSANOAT поставляет аэрационное оборудование для очистных сооружений в Узбекистане: дисковые и трубчатые диффузоры, воздуходувки, аэрационные решётки и системы контроля кислорода.",

  alternates: {
    canonical: "/catalog/aeration-equipment",
  },

  openGraph: {
    title: "Аэрационное оборудование в Узбекистане | SUVSANOAT",
    description:
      "Диффузоры, воздуходувки и комплексные системы аэрации для биологической очистки сточных вод.",
    url: "https://suvsanoat.uz/catalog/aeration-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/aeration-equipment.png",
        width: 1200,
        height: 630,
        alt: "Аэрационное оборудование для очистных сооружений SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Аэрационное оборудование | SUVSANOAT",
    description:
      "Дисковые и трубчатые диффузоры, воздуходувки и системы аэрации очистных сооружений.",
    images: ["/aeration-equipment.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AerationEquipmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Дисковые диффузоры",
      text: "Мелкопузырчатая аэрация биологических реакторов с высокой эффективностью передачи кислорода.",
    },
    {
      number: "02",
      title: "Трубчатые диффузоры",
      text: "Равномерное распределение воздуха по площади аэротенка и эффективное насыщение сточных вод кислородом.",
    },
    {
      number: "03",
      title: "Аэрационные решётки",
      text: "Комплектные системы распределения воздуха для биологических реакторов и аэротенков.",
    },
    {
      number: "04",
      title: "Воздуходувки",
      text: "Подача необходимого объёма воздуха в системы биологической очистки и технологические процессы.",
    },
    {
      number: "05",
      title: "Магистрали подачи воздуха",
      text: "Трубопроводы, коллекторы и распределительные линии для подачи воздуха к аэрационным элементам.",
    },
    {
      number: "06",
      title: "Регулирующая арматура",
      text: "Клапаны, затворы и регулирующие элементы для балансировки и управления воздушными потоками.",
    },
    {
      number: "07",
      title: "Датчики растворённого кислорода",
      text: "Непрерывный контроль концентрации кислорода в биологических реакторах.",
    },
    {
      number: "08",
      title: "Автоматизация аэрации",
      text: "Регулирование производительности воздуходувок по показаниям датчиков и фактической потребности процесса.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Определяем производительность сооружений, объём реакторов и характеристики сточных вод.",
    },
    {
      number: "02",
      title: "Потребность в кислороде",
      text: "Рассчитываем необходимое количество кислорода для биологического процесса.",
    },
    {
      number: "03",
      title: "Расход воздуха",
      text: "Определяем требуемую производительность системы подачи воздуха.",
    },
    {
      number: "04",
      title: "Подбор оборудования",
      text: "Подбираем воздуходувки, диффузоры, трубопроводы и регулирующую арматуру.",
    },
    {
      number: "05",
      title: "Автоматизация",
      text: "Организуем контроль растворённого кислорода и регулирование подачи воздуха.",
    },
  ];

  const applications = [
    "Аэротенки",
    "MBR-реакторы",
    "SBR-реакторы",
    "MBBR-системы",
    "A/O и A²/O",
    "Усреднительные резервуары",
    "Промышленные очистные сооружения",
    "Коммунальные очистные сооружения",
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
            src="/aeration-equipment.png"
            alt="Аэрационное оборудование для очистных сооружений SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>АЭРАЦИОННОЕ ОБОРУДОВАНИЕ</b>
          </div>

          <div className="categoryHeroLabel">
            07 · АЭРАЦИОННОЕ ОБОРУДОВАНИЕ
          </div>

          <h1>
            Кислород —
            <br />
            основа биологии.
          </h1>

          <p>
            Диффузоры, воздуходувки и комплексные системы подачи воздуха
            для эффективной биологической очистки коммунальных
            и промышленных сточных вод.
          </p>

          <div className="categoryHeroButtons">
            <a href="#equipment" className="categoryPrimaryButton">
              Смотреть оборудование <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Получить расчёт
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>O₂</strong>
            <span>эффективная передача кислорода</span>
          </div>

          <div>
            <strong>24 / 7</strong>
            <span>непрерывная работа</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>контроль кислорода</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>расчёт · поставка · запуск</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          СИСТЕМЫ АЭРАЦИИ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Воздух там,
            <br />
            где он необходим.
          </h2>

          <div>
            <p>
              Аэрация обеспечивает микроорганизмы кислородом, необходимым
              для биологического разложения органических загрязнений
              в сточных водах.
            </p>

            <p>
              SUVSANOAT рассчитывает расход воздуха и подбирает воздуходувки,
              диффузоры, распределительные трубопроводы и системы управления
              с учётом технологической схемы и нагрузки очистных сооружений.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ОБОРУДОВАНИЕ
            </span>

            <h2>
              Комплексная система
              <br />
              подачи воздуха.
            </h2>
          </div>

          <p>
            От отдельных диффузоров до автоматизированных систем аэрации
            для крупных биологических очистных сооружений.
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
                Получить подбор <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          РАСЧЁТ СИСТЕМЫ АЭРАЦИИ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От кислородной нагрузки
            <br />
            до подачи воздуха.
          </h2>

          <p>
            Производительность воздуходувок и количество аэрационных
            элементов определяются расчётом, а не только объёмом резервуара.
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
              Для современных
              <br />
              технологий очистки.
            </h2>
          </div>

          <p>
            Системы аэрации применяются в биологических реакторах,
            усреднителях и других технологических сооружениях,
            где требуется подача и распределение воздуха.
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
            РАСЧЁТ АЭРАЦИИ
          </span>

          <h2>
            Рассчитаем систему
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность очистных сооружений,
            размеры резервуаров, характеристики сточных вод
            или технологическое задание. Подберём воздуходувки,
            диффузоры и необходимую комплектацию.
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