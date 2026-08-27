import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Механическая очистка сточных вод в Узбекистане | SUVSANOAT",

  description:
    "Оборудование для механической очистки сточных вод в Узбекистане: механические, барабанные и шнековые решётки, песколовки, жироуловители, нефтеуловители и компакторы отходов.",

  alternates: {
    canonical: "/catalog/mechanical-treatment",
  },

  openGraph: {
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Решётки, песколовки, жироуловители, нефтеуловители, транспортёры и оборудование предварительной механической очистки сточных вод.",
    url: "https://suvsanoat.uz/catalog/mechanical-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/mechanical-treatment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Оборудование механической очистки сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Оборудование предварительной механической очистки промышленных и коммунальных сточных вод.",
    images: ["/mechanical-treatment-og.jpg"],
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
      text: "Автоматическое удаление крупных механических примесей, мусора, волокон и других загрязнений на входе очистных сооружений.",
    },
    {
      number: "02",
      title: "Барабанные решётки",
      text: "Компактное оборудование для тонкой механической фильтрации сточных вод с непрерывным удалением задержанных загрязнений.",
    },
    {
      number: "03",
      title: "Шнековые решётки",
      text: "Комплексное задержание, транспортировка и частичное обезвоживание механических загрязнений в одном оборудовании.",
    },
    {
      number: "04",
      title: "Песколовки",
      text: "Удаление песка, минеральных частиц и других тяжёлых неорганических примесей для защиты насосов и последующих стадий очистки.",
    },
    {
      number: "05",
      title: "Жироуловители",
      text: "Отделение жиров, масел и плавающих загрязнений из сточных вод пищевых, производственных и коммунальных объектов.",
    },
    {
      number: "06",
      title: "Нефтеуловители",
      text: "Оборудование для отделения нефтепродуктов, масел и лёгких углеводородных загрязнений из промышленных сточных вод.",
    },
    {
      number: "07",
      title: "Шнековые транспортёры",
      text: "Автоматическая транспортировка задержанных механических отходов от решёток к оборудованию обезвоживания или контейнеру.",
    },
    {
      number: "08",
      title: "Компакторы отходов",
      text: "Обезвоживание и уплотнение задержанных отходов для уменьшения их объёма и упрощения дальнейшей транспортировки и утилизации.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Приём сточных вод",
      text: "Исходные коммунальные или промышленные сточные воды поступают на участок предварительной механической очистки.",
    },
    {
      number: "02",
      title: "Удаление крупных примесей",
      text: "Решётки задерживают мусор, волокна и крупные механические загрязнения, способные повредить последующее оборудование.",
    },
    {
      number: "03",
      title: "Удаление песка",
      text: "Песколовки отделяют тяжёлые минеральные частицы и снижают абразивную нагрузку на насосы и трубопроводы.",
    },
    {
      number: "04",
      title: "Удаление жиров и масел",
      text: "При необходимости выполняется отделение плавающих жиров, масел и нефтепродуктов из потока сточных вод.",
    },
    {
      number: "05",
      title: "Основная очистка",
      text: "После механической подготовки сточные воды направляются на физико-химическую, биологическую или мембранную очистку.",
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
            alt="Механические решётки и оборудование механической очистки сточных вод SUVSANOAT"
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
            Механическая очистка
            <br />
            сточных вод.
          </h1>

          <p>
            Решётки, песколовки, жироуловители, нефтеуловители,
            транспортёры и другое оборудование для предварительной
            очистки коммунальных и промышленных сточных вод.
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
            <strong>AUTO</strong>
            <span>непрерывная работа</span>
          </div>

          <div>
            <strong>AISI</strong>
            <span>нержавеющая сталь</span>
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
          ПРЕДВАРИТЕЛЬНАЯ ОЧИСТКА СТОЧНЫХ ВОД
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Первый этап
            <br />
            эффективной очистки.
          </h2>

          <div>
            <p>
              Механическая очистка сточных вод является первым
              технологическим этапом очистных сооружений. На этой стадии
              из потока удаляются крупный мусор, волокна, песок,
              минеральные примеси, жиры, масла и другие загрязнения,
              способные нарушить работу последующего оборудования.
            </p>

            <p>
              Правильно спроектированная механическая очистка снижает
              нагрузку на насосы, трубопроводы, биологические реакторы
              и мембранные системы, повышая надёжность и эффективность
              всего комплекса очистных сооружений.
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
              Оборудование механической
              <br />
              очистки сточных вод.
            </h2>
          </div>

          <p>
            Подбираем оборудование по производительности очистных
            сооружений, составу сточных вод, размеру задерживаемых
            загрязнений и требованиям технологической схемы.
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
            От входа сточных вод
            <br />
            до основной очистки.
          </h2>

          <p>
            Состав линии механической очистки определяется
            характеристиками сточных вод, производительностью объекта
            и технологией последующих стадий очистных сооружений.
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

      {/* RELATED SOLUTIONS */}
      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СВЯЗАННЫЕ РЕШЕНИЯ
            </span>

            <h2>
              Следующие этапы
              <br />
              очистных сооружений.
            </h2>
          </div>

          <p>
            Механическая очистка является частью общей технологической
            схемы и работает совместно с насосным, биологическим,
            мембранным и другим оборудованием очистных сооружений.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          <a
            href="/catalog/wastewater"
            className="categoryApplicationItem"
          >
            <span>01</span>
            <strong>Очистка сточных вод</strong>
          </a>

          <a
            href="/catalog/treatment-technologies"
            className="categoryApplicationItem"
          >
            <span>02</span>
            <strong>Технологии очистки</strong>
          </a>

          <a
            href="/catalog/pump-equipment"
            className="categoryApplicationItem"
          >
            <span>03</span>
            <strong>Насосное оборудование</strong>
          </a>

          <a
            href="/catalog/integrated-solutions"
            className="categoryApplicationItem"
          >
            <span>04</span>
            <strong>Очистные сооружения под ключ</strong>
          </a>
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
            Оборудование механической очистки применяется в новых
            очистных сооружениях, а также при реконструкции
            и модернизации существующих объектов.
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
            механической очистки.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, характеристики сточных вод,
            техническое задание или существующую технологическую схему.
            Подберём решётки, песколовки, жироуловители, транспортёры
            и другое необходимое оборудование.
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