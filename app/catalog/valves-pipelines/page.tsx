import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Трубопроводная арматура и трубы в Узбекистане",

  description:
    "Трубопроводная арматура и трубы SUVSANOAT в Узбекистане: задвижки, дисковые затворы, обратные клапаны, шаровые краны, трубы, фитинги, компенсаторы и электроприводы.",

  alternates: {
    canonical: "/catalog/valves-pipelines",
  },

  openGraph: {
    title: "Трубопроводная арматура и трубы | SUVSANOAT",
    description:
      "Задвижки, дисковые затворы, клапаны, трубы, фитинги и комплектующие для водоснабжения, водоподготовки и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/valves-pipelines",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/valves-pipelines.png",
        width: 1200,
        height: 630,
        alt: "Трубопроводная арматура и трубы SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Трубопроводная арматура и трубы | SUVSANOAT",
    description:
      "Промышленная трубопроводная арматура, трубы и фитинги для инженерных систем.",
    images: ["/valves-pipelines.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ValvesPipelinesPage() {
  const equipment = [
    {
      number: "01",
      title: "Дисковые затворы",
      text: "Запорная и регулирующая трубопроводная арматура для воды, сточных вод и технологических трубопроводов очистных сооружений.",
    },
    {
      number: "02",
      title: "Задвижки",
      text: "Задвижки для надёжного перекрытия потоков воды и сточных вод в коммунальных и промышленных инженерных системах.",
    },
    {
      number: "03",
      title: "Обратные клапаны",
      text: "Обратные клапаны для предотвращения обратного потока и защиты насосов, трубопроводов и технологического оборудования.",
    },
    {
      number: "04",
      title: "Шаровые краны",
      text: "Компактная запорная арматура для воды, воздуха, химических реагентов и различных технологических сред.",
    },
    {
      number: "05",
      title: "Трубы",
      text: "Трубопроводы для транспортировки питьевой и технической воды, сточных вод, воздуха, осадка и технологических жидкостей.",
    },
    {
      number: "06",
      title: "Фитинги",
      text: "Отводы, тройники, переходы, фланцы и соединительные элементы для монтажа технологических и инженерных трубопроводов.",
    },
    {
      number: "07",
      title: "Компенсаторы",
      text: "Компенсаторы для снижения вибрационных нагрузок, компенсации температурных деформаций и монтажных перемещений трубопроводов.",
    },
    {
      number: "08",
      title: "Приводы и автоматика",
      text: "Электрические и пневматические приводы для дистанционного и автоматического управления трубопроводной арматурой.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Рабочая среда",
      text: "Определяем характеристики воды, сточных вод, воздуха, осадка, реагентов или другой технологической среды.",
    },
    {
      number: "02",
      title: "Расход и давление",
      text: "Учитываем расчётный расход, рабочее давление и гидравлические параметры трубопроводной системы.",
    },
    {
      number: "03",
      title: "Диаметр",
      text: "Подбираем диаметры трубопроводов, DN арматуры и необходимые присоединительные размеры.",
    },
    {
      number: "04",
      title: "Материал",
      text: "Выбираем материал труб и арматуры с учётом коррозионной стойкости, температуры и условий эксплуатации.",
    },
    {
      number: "05",
      title: "Комплектация",
      text: "Формируем комплект труб, арматуры, фитингов, компенсаторов, приводов и монтажных элементов для объекта.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Системы водоснабжения",
    "Канализационные насосные станции",
    "Насосные станции",
    "Промышленные предприятия",
    "Реагентные хозяйства",
    "Технологические трубопроводы",
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
            src="/valves-pipelines.png"
            alt="Трубопроводная арматура, задвижки, затворы, трубы и фитинги SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>АРМАТУРА И ТРУБОПРОВОДЫ</b>
          </div>

          <div className="categoryHeroLabel">
            10 · АРМАТУРА И ТРУБОПРОВОДЫ
          </div>

          <h1>
            Трубопроводная арматура и трубы
            <br />
            для инженерных систем.
          </h1>

          <p>
            Задвижки, дисковые затворы, обратные клапаны, шаровые краны,
            трубы, фитинги и приводы для водоснабжения, водоподготовки,
            канализации и очистных сооружений.
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
            <strong>DN</strong>
            <span>различные диаметры</span>
          </div>

          <div>
            <strong>PN</strong>
            <span>под рабочее давление</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>электро- и пневмоприводы</span>
          </div>

          <div>
            <strong>КОМПЛЕКТНО</strong>
            <span>арматура · трубы · фитинги</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ТРУБОПРОВОДНЫЕ СИСТЕМЫ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Комплексная обвязка
            <br />
            инженерного оборудования.
          </h2>

          <div>
            <p>
              Трубопроводы и арматура связывают насосы, резервуары,
              фильтры, реакторы и другое технологическое оборудование
              в единую инженерную систему. От правильного подбора
              компонентов зависит надёжность и безопасность объекта.
            </p>

            <p>
              SUVSANOAT подбирает трубопроводную арматуру, трубы,
              фитинги и приводы с учётом рабочей среды, диаметра,
              давления, материала трубопровода и условий эксплуатации.
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
              Арматура и трубы
              <br />
              для инженерных систем.
            </h2>
          </div>

          <p>
            Комплектуем трубопроводные системы — от отдельных задвижек,
            затворов и клапанов до полной технологической обвязки
            оборудования очистных сооружений.
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
          ИНЖЕНЕРНЫЙ ПОДБОР
        </span>

        <div className="waterProcessHeader">
          <h2>
            От рабочей среды
            <br />
            до полной комплектации.
          </h2>

          <p>
            При подборе труб, задвижек, затворов и клапанов учитываем
            рабочую среду, расход, давление, диаметр, материал исполнения
            и требуемый способ управления арматурой.
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
              Для воды, стоков
              <br />
              и технологических сред.
            </h2>
          </div>

          <p>
            Трубопроводная арматура и трубы применяются в системах
            водоснабжения, канализации, водоподготовки, очистки сточных
            вод и технологических линиях промышленных предприятий.
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
            ПОДБОР АРМАТУРЫ И ТРУБОПРОВОДОВ
          </span>

          <h2>
            Комплектуем трубопроводную систему
            <br />
            для вашего проекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте спецификацию, рабочую среду, диаметры, давление
            или техническое задание. Подберём задвижки, затворы,
            клапаны, трубы, фитинги, приводы и необходимые
            монтажные комплектующие.
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