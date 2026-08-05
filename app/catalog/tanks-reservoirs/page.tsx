import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Резервуары и ёмкости для воды и сточных вод в Узбекистане",

  description:
    "Резервуары и ёмкости SUVSANOAT в Узбекистане для воды, сточных вод и реагентов. Накопительные, усреднительные и технологические резервуары для очистных сооружений и водоподготовки.",

  alternates: {
    canonical: "/catalog/tanks-reservoirs",
  },

  openGraph: {
    title: "Резервуары и ёмкости для воды и сточных вод | SUVSANOAT",
    description:
      "Накопительные, технологические и усреднительные резервуары для воды, сточных вод, реагентов и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/tanks-reservoirs",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/tanks-reservoirs.png",
        width: 1200,
        height: 630,
        alt: "Резервуары и ёмкости для воды и сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Резервуары и ёмкости для воды и сточных вод | SUVSANOAT",
    description:
      "Резервуары для воды, сточных вод, реагентов, водоподготовки и очистных сооружений.",
    images: ["/tanks-reservoirs.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TanksReservoirsPage() {
  const equipment = [
    {
      number: "01",
      title: "Резервуары для чистой воды",
      text: "Накопительные ёмкости для хранения подготовленной, технической и питьевой воды в системах водоснабжения и водоподготовки.",
    },
    {
      number: "02",
      title: "Резервуары для сточных вод",
      text: "Ёмкости для приёма, накопления и технологической обработки хозяйственно-бытовых и промышленных сточных вод.",
    },
    {
      number: "03",
      title: "Усреднительные резервуары",
      text: "Резервуары для выравнивания расхода, состава и концентрации загрязнений перед последующими этапами очистки сточных вод.",
    },
    {
      number: "04",
      title: "Технологические ёмкости",
      text: "Резервуары для различных стадий водоподготовки, очистки сточных вод и технологических процессов промышленных предприятий.",
    },
    {
      number: "05",
      title: "Ёмкости для реагентов",
      text: "Хранение и приготовление химических растворов для систем дозирования, обеззараживания и обработки воды.",
    },
    {
      number: "06",
      title: "Накопительные резервуары",
      text: "Ёмкости для временного и постоянного хранения воды, сточных вод и технологических жидкостей с подбором необходимого объёма.",
    },
    {
      number: "07",
      title: "Комплектные резервуары",
      text: "Резервуары с патрубками, люками, лестницами, датчиками уровня, насосным оборудованием и необходимой технологической обвязкой.",
    },
    {
      number: "08",
      title: "Индивидуальное исполнение",
      text: "Подбор и комплектация резервуаров по требуемому объёму, размерам, назначению и условиям эксплуатации конкретного объекта.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Назначение",
      text: "Определяем назначение резервуара, технологическую функцию и характеристики хранимой среды.",
    },
    {
      number: "02",
      title: "Объём",
      text: "Рассчитываем необходимый полезный и рабочий объём резервуара с учётом расхода и режима эксплуатации.",
    },
    {
      number: "03",
      title: "Материал",
      text: "Подбираем материал исполнения с учётом воды, сточных вод, химических реагентов и условий эксплуатации.",
    },
    {
      number: "04",
      title: "Комплектация",
      text: "Определяем патрубки, люки, лестницы, датчики уровня, насосы и дополнительное технологическое оборудование.",
    },
    {
      number: "05",
      title: "Интеграция",
      text: "Увязываем резервуар с насосами, трубопроводами, автоматикой и технологическим оборудованием объекта.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Питьевое водоснабжение",
    "Промышленные предприятия",
    "Канализационные насосные станции",
    "Реагентные хозяйства",
    "Техническое водоснабжение",
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
            src="/tanks-reservoirs.png"
            alt="Резервуары и ёмкости для воды и сточных вод SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>РЕЗЕРВУАРЫ И ЁМКОСТИ</b>
          </div>

          <div className="categoryHeroLabel">
            08 · РЕЗЕРВУАРЫ И ЁМКОСТИ
          </div>

          <h1>
            Резервуары и ёмкости
            <br />
            для воды и сточных вод.
          </h1>

          <p>
            Накопительные, усреднительные и технологические резервуары
            для воды, сточных вод, реагентов, очистных сооружений
            и промышленных инженерных систем.
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
            <strong>РАЗНЫЕ ОБЪЁМЫ</strong>
            <span>под задачу объекта</span>
          </div>

          <div>
            <strong>ВОДА / СТОКИ</strong>
            <span>разные рабочие среды</span>
          </div>

          <div>
            <strong>КОМПЛЕКТНО</strong>
            <span>патрубки · датчики · обвязка</span>
          </div>

          <div>
            <strong>ПОД ПРОЕКТ</strong>
            <span>индивидуальное исполнение</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ТЕХНОЛОГИЧЕСКИЕ РЕЗЕРВУАРЫ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Ёмкости для воды,
            <br />
            стоков и реагентов.
          </h2>

          <div>
            <p>
              Резервуары являются важной частью систем водоснабжения,
              водоподготовки и очистки сточных вод. Они используются
              для накопления воды и стоков, усреднения потоков,
              хранения реагентов и различных технологических процессов.
            </p>

            <p>
              SUVSANOAT подбирает объём, конфигурацию, материал исполнения
              и технологическую комплектацию резервуара с учётом назначения,
              характеристик рабочей среды, производительности системы
              и условий эксплуатации объекта.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              РЕЗЕРВУАРЫ И ЁМКОСТИ
            </span>

            <h2>
              Решения для воды,
              <br />
              сточных вод и реагентов.
            </h2>
          </div>

          <p>
            От отдельных накопительных ёмкостей до комплектных
            технологических резервуаров для очистных сооружений
            и систем водоподготовки.
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
          ИНЖЕНЕРНЫЙ ПОДБОР
        </span>

        <div className="waterProcessHeader">
          <h2>
            От назначения
            <br />
            до готового резервуара.
          </h2>

          <p>
            Объём и исполнение резервуара определяются технологическим
            процессом, характеристиками рабочей среды, режимом эксплуатации
            и требованиями конкретного объекта.
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
              Резервуары для инженерных
              <br />
              и промышленных систем.
            </h2>
          </div>

          <p>
            Резервуары и ёмкости интегрируются в системы очистки сточных
            вод, водоподготовки, водоснабжения, канализационные насосные
            станции и промышленные технологические линии.
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
            РАСЧЁТ РЕЗЕРВУАРА
          </span>

          <h2>
            Подберём резервуар
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте назначение резервуара, требуемый объём,
            характеристики воды, сточных вод или реагента и условия
            размещения. Подготовим предварительное инженерное решение
            и необходимую комплектацию.
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