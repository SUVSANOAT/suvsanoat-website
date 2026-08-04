import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дезинфекция воды и дозирование реагентов в Узбекистане",

  description:
    "SUVSANOAT поставляет системы дезинфекции воды и дозирования реагентов в Узбекистане: УФ-установки, станции гипохлорита натрия, электролизные установки, дозирующие насосы и автоматизацию.",

  alternates: {
    canonical: "/catalog/disinfection-dosing",
  },

  openGraph: {
    title: "Дезинфекция и дозирование реагентов | SUVSANOAT",
    description:
      "УФ-обеззараживание, хлорирование, электролизные установки и автоматические станции дозирования реагентов.",
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
    title: "Дезинфекция и дозирование | SUVSANOAT",
    description:
      "Системы обеззараживания воды, хлорирования и автоматического дозирования реагентов.",
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
      title: "УФ-установки",
      text: "Обеззараживание очищенной и питьевой воды ультрафиолетовым излучением без внесения химических реагентов.",
    },
    {
      number: "02",
      title: "Станции дозирования гипохлорита",
      text: "Автоматическое дозирование гипохлорита натрия для обеззараживания воды и сточных вод.",
    },
    {
      number: "03",
      title: "Электролизные установки",
      text: "Получение раствора гипохлорита натрия непосредственно на объекте из соли, воды и электроэнергии.",
    },
    {
      number: "04",
      title: "Дозирующие насосы",
      text: "Точное дозирование реагентов в технологических процессах водоподготовки и очистки сточных вод.",
    },
    {
      number: "05",
      title: "Станции приготовления реагентов",
      text: "Комплектные установки приготовления и дозирования коагулянтов, флокулянтов и других реагентов.",
    },
    {
      number: "06",
      title: "Ёмкости для реагентов",
      text: "Технологические резервуары для хранения, приготовления и подачи химических растворов.",
    },
    {
      number: "07",
      title: "Контрольно-измерительное оборудование",
      text: "Датчики pH, ORP, остаточного хлора, расхода и другие средства контроля технологического процесса.",
    },
    {
      number: "08",
      title: "Автоматизация дозирования",
      text: "Шкафы управления и автоматическое регулирование подачи реагентов по заданным параметрам.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Анализ воды",
      text: "Определяем характеристики воды или сточных вод и требования к обеззараживанию.",
    },
    {
      number: "02",
      title: "Выбор метода",
      text: "Подбираем УФ-обеззараживание, химическое дозирование или комбинированную схему.",
    },
    {
      number: "03",
      title: "Расчёт дозы",
      text: "Определяем необходимую производительность и параметры подачи реагента.",
    },
    {
      number: "04",
      title: "Автоматизация",
      text: "Организуем контроль параметров и автоматическое регулирование процесса.",
    },
    {
      number: "05",
      title: "Поставка и запуск",
      text: "Комплектуем систему, поставляем оборудование и выполняем пусконаладку.",
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
            src="/disinfection-dosing.png"
            alt="Системы дезинфекции воды и дозирования реагентов SUVSANOAT"
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
            Безопасная вода.
            <br />
            Точное дозирование.
          </h1>

          <p>
            Системы дезинфекции и автоматического дозирования реагентов
            для очистных сооружений, водоподготовки и промышленных
            технологических процессов.
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
            <strong>AUTO</strong>
            <span>автоматическое дозирование</span>
          </div>

          <div>
            <strong>24 / 7</strong>
            <span>контроль процесса</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ДЕЗИНФЕКЦИЯ И ДОЗИРОВАНИЕ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Контроль качества
            <br />
            на каждом этапе.
          </h2>

          <div>
            <p>
              Дезинфекция является важным этапом водоподготовки и очистки
              сточных вод. Выбор метода зависит от качества исходной воды,
              требуемой степени обеззараживания и условий эксплуатации.
            </p>

            <p>
              SUVSANOAT подбирает УФ-установки, системы хлорирования,
              электролизное оборудование и станции дозирования реагентов
              с автоматическим контролем технологических параметров.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">ОБОРУДОВАНИЕ</span>

            <h2>
              Дезинфекция
              <br />
              и точное дозирование.
            </h2>
          </div>

          <p>
            От отдельных дозирующих насосов до полностью автоматизированных
            систем обеззараживания и приготовления реагентов.
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
            От анализа воды
            <br />
            до автоматического контроля.
          </h2>

          <p>
            Метод обеззараживания и параметры дозирования определяются
            характеристиками воды, производительностью и требованиями
            конкретного объекта.
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
              Чистая вода
              <br />
              для разных объектов.
            </h2>
          </div>

          <p>
            Системы дезинфекции и дозирования интегрируются в новые
            и существующие комплексы водоподготовки и очистки сточных вод.
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
          <span>ПОДБОР СИСТЕМЫ</span>

          <h2>
            Рассчитаем систему
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность, анализ воды или техническое
            задание. Подберём метод обеззараживания, дозирующее оборудование,
            автоматику и необходимую комплектацию.
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