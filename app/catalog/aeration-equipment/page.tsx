import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Аэрационное оборудование для очистных сооружений в Узбекистане",

  description:
    "Аэрационное оборудование SUVSANOAT в Узбекистане: дисковые и трубчатые диффузоры, мембранные аэраторы, воздуходувки, аэрационные решётки и автоматизация систем аэрации очистных сооружений.",

  alternates: {
    canonical: "/catalog/aeration-equipment",
  },

  openGraph: {
    title: "Аэрационное оборудование для очистных сооружений | SUVSANOAT",
    description:
      "Диффузоры, аэраторы, воздуходувки и комплексные системы аэрации для биологической очистки сточных вод.",
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
    title: "Аэрационное оборудование для очистных сооружений | SUVSANOAT",
    description:
      "Дисковые и трубчатые диффузоры, мембранные аэраторы, воздуходувки и системы аэрации сточных вод.",
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
      text: "Мелкопузырчатые мембранные аэраторы для эффективной подачи кислорода в аэротенки и биологические реакторы.",
    },
    {
      number: "02",
      title: "Трубчатые диффузоры",
      text: "Трубчатые аэраторы для равномерного распределения воздуха и насыщения сточных вод кислородом.",
    },
    {
      number: "03",
      title: "Аэрационные решётки",
      text: "Комплектные системы распределения воздуха с диффузорами для аэротенков и биологических реакторов.",
    },
    {
      number: "04",
      title: "Воздуходувки",
      text: "Воздуходувки для очистных сооружений с подбором производительности и давления под расчётную потребность в воздухе.",
    },
    {
      number: "05",
      title: "Магистрали подачи воздуха",
      text: "Воздушные трубопроводы, коллекторы и распределительные линии для подключения аэрационных элементов.",
    },
    {
      number: "06",
      title: "Регулирующая арматура",
      text: "Клапаны, затворы и регулирующие элементы для балансировки и управления воздушными потоками системы аэрации.",
    },
    {
      number: "07",
      title: "Датчики растворённого кислорода",
      text: "Непрерывный контроль концентрации растворённого кислорода в аэротенках и биологических реакторах.",
    },
    {
      number: "08",
      title: "Автоматизация аэрации",
      text: "Автоматическое регулирование воздуходувок по концентрации кислорода и фактической нагрузке очистных сооружений.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Определяем производительность очистных сооружений, объём реакторов и характеристики сточных вод.",
    },
    {
      number: "02",
      title: "Потребность в кислороде",
      text: "Рассчитываем необходимое количество кислорода для биологической очистки сточных вод.",
    },
    {
      number: "03",
      title: "Расход воздуха",
      text: "Определяем расчётную производительность и давление системы подачи воздуха.",
    },
    {
      number: "04",
      title: "Подбор оборудования",
      text: "Подбираем воздуходувки, диффузоры, аэрационные решётки, трубопроводы и регулирующую арматуру.",
    },
    {
      number: "05",
      title: "Автоматизация",
      text: "Организуем контроль растворённого кислорода и автоматическое регулирование подачи воздуха.",
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
            alt="Аэрационное оборудование и аэраторы для очистных сооружений SUVSANOAT"
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
            Аэрационное оборудование
            <br />
            для очистных сооружений.
          </h1>

          <p>
            Диффузоры, мембранные аэраторы, воздуходувки и комплексные
            системы аэрации для эффективной биологической очистки
            коммунальных и промышленных сточных вод.
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
          СИСТЕМЫ АЭРАЦИИ СТОЧНЫХ ВОД
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Эффективная аэрация
            <br />
            биологических реакторов.
          </h2>

          <div>
            <p>
              Аэрация сточных вод обеспечивает микроорганизмы кислородом,
              необходимым для биологического разложения органических
              загрязнений в аэротенках и биологических реакторах.
            </p>

            <p>
              SUVSANOAT рассчитывает потребность в кислороде и расход воздуха,
              подбирает воздуходувки, дисковые и трубчатые диффузоры,
              распределительные трубопроводы и системы автоматического
              управления аэрацией.
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
              Оборудование для
              <br />
              систем аэрации.
            </h2>
          </div>

          <p>
            От отдельных мембранных аэраторов и диффузоров до полностью
            автоматизированных систем подачи воздуха для крупных
            очистных сооружений.
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
            Количество аэраторов, производительность воздуходувок
            и параметры воздушных магистралей определяются инженерным
            расчётом с учётом технологической нагрузки.
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
              Аэрация для современных
              <br />
              технологий очистки.
            </h2>
          </div>

          <p>
            Системы аэрации SUVSANOAT применяются в аэротенках,
            MBR, SBR, MBBR, A/O и A²/O реакторах, усреднительных
            резервуарах и других сооружениях биологической очистки.
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
            РАСЧЁТ АЭРАЦИОННОГО ОБОРУДОВАНИЯ
          </span>

          <h2>
            Рассчитаем систему аэрации
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность очистных сооружений, размеры
            аэротенков или реакторов, характеристики сточных вод и
            технологическое задание. Подберём воздуходувки, аэраторы,
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