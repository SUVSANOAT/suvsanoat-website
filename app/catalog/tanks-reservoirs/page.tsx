import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Резервуары и ёмкости для воды в Узбекистане",

  description:
    "SUVSANOAT поставляет резервуары и технологические ёмкости в Узбекистане для воды, сточных вод и реагентов. Накопительные резервуары, ёмкости для очистных сооружений и водоподготовки.",

  alternates: {
    canonical: "/catalog/tanks-reservoirs",
  },

  openGraph: {
    title: "Резервуары и ёмкости в Узбекистане | SUVSANOAT",
    description:
      "Резервуары для воды, сточных вод и реагентов для систем водоподготовки, водоснабжения и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/tanks-reservoirs",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/tanks-reservoirs.png",
        width: 1200,
        height: 630,
        alt: "Резервуары и технологические ёмкости SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Резервуары и ёмкости | SUVSANOAT",
    description:
      "Резервуары для воды, сточных вод, реагентов и технологических процессов.",
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
      text: "Накопительные ёмкости для хранения подготовленной, технической и питьевой воды.",
    },
    {
      number: "02",
      title: "Резервуары для сточных вод",
      text: "Ёмкости для приёма, накопления и технологической обработки бытовых и промышленных сточных вод.",
    },
    {
      number: "03",
      title: "Усреднительные резервуары",
      text: "Выравнивание расхода и концентрации загрязнений перед последующими этапами очистки.",
    },
    {
      number: "04",
      title: "Технологические ёмкости",
      text: "Резервуары для различных стадий водоподготовки, очистки сточных вод и промышленных процессов.",
    },
    {
      number: "05",
      title: "Ёмкости для реагентов",
      text: "Хранение и приготовление химических растворов для систем дозирования и обработки воды.",
    },
    {
      number: "06",
      title: "Накопительные резервуары",
      text: "Ёмкости для временного хранения воды и технологических жидкостей с подбором требуемого объёма.",
    },
    {
      number: "07",
      title: "Комплектные резервуары",
      text: "Ёмкости с патрубками, люками, лестницами, датчиками уровня и необходимой технологической обвязкой.",
    },
    {
      number: "08",
      title: "Индивидуальное исполнение",
      text: "Изготовление и комплектация резервуаров по размерам, объёму и требованиям конкретного объекта.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Назначение",
      text: "Определяем назначение резервуара и характеристики хранимой среды.",
    },
    {
      number: "02",
      title: "Объём",
      text: "Рассчитываем необходимый полезный и рабочий объём ёмкости.",
    },
    {
      number: "03",
      title: "Материал",
      text: "Подбираем материал исполнения с учётом воды, стоков, реагентов и условий эксплуатации.",
    },
    {
      number: "04",
      title: "Комплектация",
      text: "Определяем патрубки, люки, лестницы, датчики уровня и дополнительное оборудование.",
    },
    {
      number: "05",
      title: "Интеграция",
      text: "Увязываем резервуар с насосами, трубопроводами и технологическим оборудованием объекта.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Питьевое водоснабжение",
    "Промышленные предприятия",
    "Насосные станции",
    "Реагентные хозяйства",
    "Техническое водоснабжение",
    "Повторное использование воды",
  ];

  return (
    <main className="categoryPage">
      {/* HEADER */}
      <header className="categoryHeader">
        <a href="/" className="categoryLogo" aria-label="SUVSANOAT — главная">
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
            Надёжное хранение.
            <br />
            Точный объём.
          </h1>

          <p>
            Резервуары и технологические ёмкости для воды, сточных вод,
            реагентов и инженерных систем промышленных и инфраструктурных
            объектов.
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
            Ёмкость —
            <br />
            часть системы.
          </h2>

          <div>
            <p>
              Резервуары используются для накопления воды и сточных вод,
              усреднения потоков, хранения реагентов и обеспечения различных
              технологических процессов.
            </p>

            <p>
              SUVSANOAT подбирает объём, конфигурацию, материал исполнения
              и технологическую комплектацию резервуара с учётом назначения,
              характеристик среды и условий эксплуатации объекта.
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
              стоков и реагентов.
            </h2>
          </div>

          <p>
            От отдельных накопительных ёмкостей до комплектных
            технологических резервуаров с инженерной обвязкой.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {equipment.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
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
            процессом, характеристиками среды и требованиями конкретного
            объекта.
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
              Для инженерных
              <br />
              и промышленных систем.
            </h2>
          </div>

          <p>
            Резервуары интегрируются в системы очистки воды,
            водоотведения, водоснабжения и технологические линии.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          {applications.map((item, index) => (
            <div className="categoryApplicationItem" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="categoryCTA">
        <div>
          <span>РАСЧЁТ РЕЗЕРВУАРА</span>

          <h2>
            Подберём объём
            <br />
            под ваш объект.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте назначение резервуара, требуемый объём,
            характеристики среды и условия размещения. Подготовим
            предварительное инженерное решение и комплектацию.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ <span>→</span>
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