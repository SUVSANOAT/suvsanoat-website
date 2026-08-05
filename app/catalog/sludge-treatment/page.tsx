import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обезвоживание осадка сточных вод в Узбекистане — оборудование",

  description:
    "Оборудование SUVSANOAT для обработки и обезвоживания осадка сточных вод в Узбекистане: шнековые обезвоживатели, фильтр-прессы, декантерные центрифуги, сгустители и полимерные станции.",

  alternates: {
    canonical: "/catalog/sludge-treatment",
  },

  openGraph: {
    title: "Обработка и обезвоживание осадка сточных вод | SUVSANOAT",
    description:
      "Шнековые обезвоживатели, фильтр-прессы, декантерные центрифуги и оборудование для обработки осадка очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/sludge-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/sludge-treatment.png",
        width: 1200,
        height: 630,
        alt: "Оборудование для обработки и обезвоживания осадка сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Обезвоживание осадка сточных вод | SUVSANOAT",
    description:
      "Оборудование для сгущения, кондиционирования и механического обезвоживания осадка очистных сооружений.",
    images: ["/sludge-treatment.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function SludgeTreatmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Шнековые обезвоживатели",
      text: "Компактные шнековые прессы для механического обезвоживания осадка сточных вод с автоматическим непрерывным режимом работы.",
    },
    {
      number: "02",
      title: "Ленточные фильтр-прессы",
      text: "Оборудование непрерывного действия для обезвоживания осадка коммунальных и промышленных очистных сооружений.",
    },
    {
      number: "03",
      title: "Камерные фильтр-прессы",
      text: "Глубокое механическое обезвоживание осадка с отделением воды и получением плотного обезвоженного кека.",
    },
    {
      number: "04",
      title: "Декантерные центрифуги",
      text: "Высокопроизводительное центробежное разделение жидкой и твёрдой фаз в непрерывном автоматическом режиме.",
    },
    {
      number: "05",
      title: "Насосы для осадка",
      text: "Насосное оборудование для транспортировки активного, избыточного и сгущённого осадка между технологическими этапами.",
    },
    {
      number: "06",
      title: "Станции приготовления полимера",
      text: "Автоматическое приготовление и дозирование флокулянта для повышения эффективности механического обезвоживания осадка.",
    },
    {
      number: "07",
      title: "Сгустители осадка",
      text: "Предварительное сгущение осадка для уменьшения его объёма перед подачей на оборудование механического обезвоживания.",
    },
    {
      number: "08",
      title: "Транспортировка осадка",
      text: "Шнековые конвейеры и вспомогательное оборудование для транспортировки и удаления обезвоженного осадка после прессования.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Сбор осадка",
      text: "Активный, избыточный или физико-химический осадок поступает из технологических сооружений в систему обработки.",
    },
    {
      number: "02",
      title: "Сгущение",
      text: "Уменьшаем содержание свободной воды и первоначальный объём осадка перед механическим обезвоживанием.",
    },
    {
      number: "03",
      title: "Кондиционирование",
      text: "Подбираем и дозируем полимер для улучшения флокуляции и отделения воды от твёрдой фазы.",
    },
    {
      number: "04",
      title: "Обезвоживание",
      text: "Осадок проходит механическое обезвоживание на шнековом прессе, фильтр-прессе или декантерной центрифуге.",
    },
    {
      number: "05",
      title: "Удаление",
      text: "Полученный обезвоженный кек направляется на накопление, транспортировку, утилизацию или дальнейшую обработку.",
    },
  ];

  const applications = [
    "Коммунальные очистные сооружения",
    "Промышленные очистные сооружения",
    "Текстильные предприятия",
    "Пищевые производства",
    "Мясокомбинаты",
    "Молочные предприятия",
    "Птицефабрики",
    "Физико-химическая очистка",
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
            src="/sludge-treatment.png"
            alt="Оборудование для обработки и обезвоживания осадка сточных вод SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>ОБРАБОТКА ОСАДКА</b>
          </div>

          <div className="categoryHeroLabel">
            06 · ОБРАБОТКА ОСАДКА
          </div>

          <h1>
            Обработка и обезвоживание
            <br />
            осадка сточных вод.
          </h1>

          <p>
            Шнековые обезвоживатели, фильтр-прессы, декантерные центрифуги,
            сгустители и комплексные линии обработки осадка коммунальных
            и промышленных очистных сооружений.
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
            <strong>24 / 7</strong>
            <span>автоматическая работа</span>
          </div>

          <div>
            <strong>МЕНЬШЕ ОБЪЁМ</strong>
            <span>механическое обезвоживание</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>контроль процесса</span>
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
          ОБРАБОТКА И ОБЕЗВОЖИВАНИЕ ОСАДКА
        </span>

        <div className="categoryIntroGrid">
          <h2>
            От жидкого осадка
            <br />
            до обезвоженного кека.
          </h2>

          <div>
            <p>
              В процессе биологической и физико-химической очистки сточных
              вод образуется осадок с высоким содержанием воды. Перед
              транспортировкой или утилизацией его необходимо сгущать,
              кондиционировать и механически обезвоживать.
            </p>

            <p>
              SUVSANOAT подбирает оборудование для обработки осадка с учётом
              его количества, влажности, состава, режима работы очистных
              сооружений и требуемой степени обезвоживания.
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
              обезвоживания осадка.
            </h2>
          </div>

          <p>
            Комплектуем отдельное оборудование и технологические линии
            сгущения, кондиционирования, механического обезвоживания
            и транспортировки осадка.
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
          ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС
        </span>

        <div className="waterProcessHeader">
          <h2>
            Полный цикл
            <br />
            обработки осадка.
          </h2>

          <p>
            Правильно подобранная технологическая линия позволяет уменьшить
            объём осадка, снизить количество транспортируемой воды и упростить
            дальнейшее хранение и утилизацию.
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
              Обработка осадка
              <br />
              для очистных сооружений.
            </h2>
          </div>

          <p>
            Оборудование применяется для обработки биологического,
            избыточного и физико-химического осадка на коммунальных
            и промышленных очистных сооружениях.
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
            ПОДБОР ОБОРУДОВАНИЯ ДЛЯ ОСАДКА
          </span>

          <h2>
            Рассчитаем линию
            <br />
            обезвоживания осадка.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте количество осадка, его влажность, состав,
            производительность очистных сооружений и режим работы.
            Подберём шнековый обезвоживатель, фильтр-пресс, центрифугу,
            полимерную станцию и необходимую комплектацию.
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