import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Механическая очистка сточных вод в Узбекистане",

  description:
    "SUVSANOAT поставляет оборудование механической очистки сточных вод в Узбекистане: механические, барабанные и шнековые решётки, песколовки, жироуловители, нефтеуловители и компакторы отходов.",

  alternates: {
    canonical: "/catalog/mechanical-treatment",
  },

  openGraph: {
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Оборудование механической очистки сточных вод: решётки, песколовки, жироуловители, нефтеуловители и системы удаления отходов.",
    url: "https://suvsanoat.uz/catalog/mechanical-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/mechanical-treatment.png",
        width: 1200,
        height: 630,
        alt: "Механическая очистка сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Промышленное оборудование для механической очистки сточных вод в Узбекистане.",
    images: ["/mechanical-treatment.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function MechanicalTreatmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Механические решётки",
      text: "Удаление крупных механических примесей на входе очистных сооружений.",
    },
    {
      number: "02",
      title: "Барабанные решётки",
      text: "Компактная автоматическая фильтрация сточных вод с высокой производительностью.",
    },
    {
      number: "03",
      title: "Шнековые решётки",
      text: "Задержание, транспортировка и обезвоживание механических загрязнений.",
    },
    {
      number: "04",
      title: "Песколовки",
      text: "Удаление песка, минеральных частиц и тяжёлых неорганических примесей.",
    },
    {
      number: "05",
      title: "Жироуловители",
      text: "Отделение масел, жиров и плавающих загрязнений из производственных стоков.",
    },
    {
      number: "06",
      title: "Нефтеуловители",
      text: "Удаление нефтепродуктов и лёгких углеводородных загрязнений из сточных вод.",
    },
    {
      number: "07",
      title: "Шнековые транспортёры",
      text: "Автоматическая транспортировка задержанных отходов от оборудования.",
    },
    {
      number: "08",
      title: "Компакторы отходов",
      text: "Обезвоживание и уменьшение объёма отходов механической очистки.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Приём сточных вод",
      text: "Поступление исходных сточных вод на механическую очистку.",
    },
    {
      number: "02",
      title: "Удаление крупных примесей",
      text: "Задержание мусора и крупных механических загрязнений.",
    },
    {
      number: "03",
      title: "Удаление песка",
      text: "Отделение тяжёлых минеральных частиц.",
    },
    {
      number: "04",
      title: "Удаление жиров",
      text: "Отделение масел, жиров и плавающих веществ.",
    },
    {
      number: "05",
      title: "Дальнейшая очистка",
      text: "Подготовленный поток направляется на следующий этап очистки.",
    },
  ];

  const applications = [
    "Городские очистные сооружения",
    "Промышленные предприятия",
    "Текстильные производства",
    "Пищевые предприятия",
    "Мясокомбинаты",
    "Молочные предприятия",
    "Нефтегазовые объекты",
    "Жилые и инфраструктурные объекты",
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

          <a
            href="/#contacts"
            className="categoryContactButton"
          >
            Получить расчёт
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="categoryHero">
        <div className="categoryHeroImage">
          <img
            src="/mechanical-treatment.png"
            alt="Оборудование механической очистки сточных вод SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>МЕХАНИЧЕСКАЯ ОЧИСТКА</b>
          </div>

          <div className="categoryHeroLabel">
            03 · МЕХАНИЧЕСКАЯ ОЧИСТКА
          </div>

          <h1>
            Первый этап
            <br />
            эффективной очистки.
          </h1>

          <p>
            Оборудование для удаления крупных примесей, песка, жиров,
            нефтепродуктов и других механических загрязнений из бытовых
            и промышленных сточных вод.
          </p>

          <div className="categoryHeroButtons">
            <a
              href="#equipment"
              className="categoryPrimaryButton"
            >
              Смотреть оборудование <span>→</span>
            </a>

            <a
              href="/#contacts"
              className="categorySecondaryButton"
            >
              Получить расчёт
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>5–200 000</strong>
            <span>м³/сутки</span>
          </div>

          <div>
            <strong>АВТОМАТИЗАЦИЯ</strong>
            <span>непрерывная работа</span>
          </div>

          <div>
            <strong>НЕРЖАВЕЮЩАЯ СТАЛЬ</strong>
            <span>промышленное исполнение</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>подбор · поставка · запуск</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          МЕХАНИЧЕСКАЯ ОЧИСТКА СТОЧНЫХ ВОД
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Защита всей
            <br />
            системы очистки.
          </h2>

          <div>
            <p>
              Механическая очистка является первым технологическим этапом
              очистных сооружений и предназначена для удаления крупных
              загрязнений, волокон, песка, жиров и других примесей.
            </p>

            <p>
              Правильно подобранное оборудование снижает нагрузку на
              последующие технологические процессы, защищает насосы,
              трубопроводы и биологические реакторы и повышает надёжность
              всей системы.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section
        className="categoryEquipment"
        id="equipment"
      >
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ОБОРУДОВАНИЕ
            </span>

            <h2>
              Комплекс оборудования
              <br />
              механической очистки.
            </h2>
          </div>

          <p>
            Подбираем оборудование по производительности, составу сточных вод,
            размеру задерживаемых частиц и требованиям конкретного объекта.
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
          ТЕХНОЛОГИЧЕСКАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От входа
            <br />
            до основной очистки.
          </h2>

          <p>
            Конфигурация механической очистки определяется характеристиками
            сточных вод и технологией последующих стадий очистки.
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
              Для коммунальных
              <br />
              и промышленных объектов.
            </h2>
          </div>

          <p>
            Решения SUVSANOAT могут использоваться как в составе новых
            очистных сооружений, так и при модернизации существующих объектов.
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
            ПОДБОР ОБОРУДОВАНИЯ
          </span>

          <h2>
            Подберём оборудование
            <br />
            под ваш объект.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, характеристики сточных вод
            или техническое задание. Подготовим предварительную комплектацию
            оборудования механической очистки.
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

          <a href="/#catalog">
            Каталог
          </a>

          <a href="/#solutions">
            Решения
          </a>

          <a href="/#technologies">
            Технологии
          </a>

          <a href="/#services">
            Услуги
          </a>

          <a href="/#contacts">
            Контакты
          </a>
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