import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дезинфекция воды и дозирование реагентов в Узбекистане",

  description:
    "Системы дезинфекции воды и дозирования реагентов SUVSANOAT: УФ-установки, гипохлорит натрия, электролизные установки, дозирующие насосы и автоматизация в Узбекистане.",

  alternates: {
    canonical: "/catalog/disinfection-dosing",
  },

  openGraph: {
    title: "Дезинфекция воды и дозирование реагентов | SUVSANOAT",
    description:
      "УФ-обеззараживание, хлорирование, электролизные установки, дозирующие насосы и автоматические станции дозирования реагентов.",
    url: "https://suvsanoat.uz/catalog/disinfection-dosing",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/disinfection-dosing.png",
        width: 1200,
        height: 630,
        alt: "Дезинфекция воды и дозирование реагентов SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Дезинфекция воды и дозирование реагентов | SUVSANOAT",
    description:
      "УФ-обеззараживание, гипохлорит натрия, электролиз и автоматическое дозирование реагентов.",
    images: ["/disinfection-dosing.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function DisinfectionDosingPage() {
  const equipment = [
    {
      number: "01",
      title: "УФ-установки для обеззараживания",
      text: "Ультрафиолетовое обеззараживание питьевой, технической и очищенной сточной воды без внесения химических реагентов.",
    },
    {
      number: "02",
      title: "Станции дозирования гипохлорита натрия",
      text: "Автоматические станции приготовления и дозирования гипохлорита натрия для хлорирования питьевой воды и обеззараживания очищенных сточных вод.",
    },
    {
      number: "03",
      title: "Электролизные установки",
      text: "Получение раствора гипохлорита натрия непосредственно на объекте методом электролиза из соли, воды и электроэнергии с последующим автоматическим дозированием.",
    },
    {
      number: "04",
      title: "Дозирующие насосы",
      text: "Высокоточное дозирование гипохлорита, коагулянтов, флокулянтов, кислот, щелочей и других реагентов в системах водоподготовки и очистки сточных вод.",
    },
    {
      number: "05",
      title: "Станции приготовления реагентов",
      text: "Комплектные установки для приготовления, смешивания и автоматического дозирования коагулянтов, флокулянтов и других химических реагентов.",
    },
    {
      number: "06",
      title: "Ёмкости для реагентов",
      text: "Технологические ёмкости для хранения и приготовления гипохлорита натрия, коагулянтов, флокулянтов и других химических растворов.",
    },
    {
      number: "07",
      title: "Датчики и КИПиА",
      text: "Контроль pH, ORP, остаточного хлора, расхода и других технологических параметров для стабильной работы системы обеззараживания.",
    },
    {
      number: "08",
      title: "Автоматизация дозирования",
      text: "Шкафы управления, контроллеры и автоматическое регулирование подачи реагентов по расходу воды или измеряемым технологическим параметрам.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Анализ воды",
      text: "Определяем характеристики исходной или очищенной воды, производительность системы и требования к обеззараживанию.",
    },
    {
      number: "02",
      title: "Выбор метода",
      text: "Подбираем УФ-обеззараживание, хлорирование гипохлоритом натрия, электролизную установку или комбинированную технологическую схему.",
    },
    {
      number: "03",
      title: "Расчёт дозирования",
      text: "Определяем требуемую дозу реагента, производительность дозирующих насосов, объём ёмкостей и режим работы оборудования.",
    },
    {
      number: "04",
      title: "Автоматизация",
      text: "Организуем контроль технологических параметров и автоматическое регулирование подачи реагентов.",
    },
    {
      number: "05",
      title: "Поставка и запуск",
      text: "Комплектуем систему, поставляем оборудование и выполняем техническое сопровождение монтажа и пусконаладки.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Питьевое водоснабжение",
    "Системы водоподготовки",
    "Промышленные предприятия",
    "Пищевые производства",
    "Бассейны и водные объекты",
    "Повторное использование воды",
    "Технологические процессы",
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
            src="/disinfection-dosing.png"
            alt="Дезинфекция воды, УФ-установки и станции дозирования гипохлорита натрия SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>ДЕЗИНФЕКЦИЯ И ДОЗИРОВАНИЕ</b>
          </div>

          <div className="categoryHeroLabel">
            05 · ДЕЗИНФЕКЦИЯ И ДОЗИРОВАНИЕ
          </div>

          <h1>
            Дезинфекция воды
            <br />
            и дозирование реагентов.
          </h1>

          <p>
            УФ-обеззараживание, хлорирование, станции дозирования
            гипохлорита натрия, электролизные установки и автоматические
            системы подачи реагентов для водоподготовки и очистных сооружений.
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
            <strong>UV</strong>
            <span>УФ-обеззараживание</span>
          </div>

          <div>
            <strong>NaOCl</strong>
            <span>гипохлорит натрия</span>
          </div>

          <div>
            <strong>ЭЛЕКТРОЛИЗ</strong>
            <span>получение NaOCl на объекте</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>автоматическое дозирование</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ОБЕЗЗАРАЖИВАНИЕ ВОДЫ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Безопасная вода
            <br />
            и точная подача реагентов.
          </h2>

          <div>
            <p>
              Дезинфекция является завершающим или промежуточным этапом
              многих систем водоподготовки и очистки сточных вод.
              Для обеззараживания могут применяться ультрафиолетовое
              излучение, гипохлорит натрия и комбинированные методы.
            </p>

            <p>
              SUVSANOAT подбирает системы обеззараживания и дозирования
              с учётом производительности, качества воды, требуемой дозы
              реагента и режима эксплуатации. Система может работать
              автоматически по расходу, остаточному хлору, ORP
              и другим технологическим параметрам.
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
              Оборудование для дезинфекции
              <br />
              и дозирования реагентов.
            </h2>
          </div>

          <p>
            От отдельных дозирующих насосов и УФ-установок до комплексных
            электролизных и автоматизированных станций приготовления,
            хранения и дозирования реагентов.
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

      {/* ELECTROLYSIS */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ЭЛЕКТРОЛИЗ ГИПОХЛОРИТА НАТРИЯ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Получение гипохлорита
            <br />
            непосредственно на объекте.
          </h2>

          <div>
            <p>
              Электролизные установки позволяют производить раствор
              гипохлорита натрия непосредственно на объекте из доступного
              сырья — соли, воды и электроэнергии. Полученный раствор
              используется для обеззараживания воды.
            </p>

            <p>
              Комплекс может включать систему подготовки солевого раствора,
              электролизный модуль, накопительную ёмкость гипохлорита,
              дозирующие насосы, датчики и автоматический шкаф управления.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          ИНЖЕНЕРНЫЙ ПОДБОР
        </span>

        <div className="waterProcessHeader">
          <h2>
            От анализа воды
            <br />
            до автоматического контроля.
          </h2>

          <p>
            Метод обеззараживания и параметры дозирования определяются
            качеством воды, производительностью объекта, требуемым
            результатом и условиями эксплуатации.
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

      {/* INTERNAL LINKS */}
      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СВЯЗАННЫЕ РЕШЕНИЯ
            </span>

            <h2>
              Часть комплексной
              <br />
              системы очистки воды.
            </h2>
          </div>

          <p>
            Дезинфекция и дозирование реагентов интегрируются
            с водоподготовкой, очисткой сточных вод, резервуарами
            и системами автоматического управления.
          </p>
        </div>

        <div className="categoryApplicationGrid">
          <a
            href="/catalog/water-treatment"
            className="categoryApplicationItem"
          >
            <span>01</span>
            <strong>Водоподготовка</strong>
          </a>

          <a
            href="/catalog/wastewater"
            className="categoryApplicationItem"
          >
            <span>02</span>
            <strong>Очистка сточных вод</strong>
          </a>

          <a
            href="/catalog/automation"
            className="categoryApplicationItem"
          >
            <span>03</span>
            <strong>Автоматизация</strong>
          </a>

          <a
            href="/catalog/tanks-reservoirs"
            className="categoryApplicationItem"
          >
            <span>04</span>
            <strong>Резервуары и ёмкости</strong>
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
              Системы обеззараживания
              <br />
              для разных объектов.
            </h2>
          </div>

          <p>
            Оборудование для дезинфекции и дозирования может применяться
            в новых и существующих системах водоснабжения,
            водоподготовки и очистки сточных вод.
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
            ПОДБОР СИСТЕМЫ ДЕЗИНФЕКЦИИ
          </span>

          <h2>
            Рассчитаем систему
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, анализ воды, техническое
            задание и требования к обеззараживанию. Подберём УФ-установку,
            электролизную систему, станцию гипохлорита, дозирующие насосы,
            КИПиА и необходимую автоматику.
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