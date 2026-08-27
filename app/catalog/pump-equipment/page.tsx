import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Насосное оборудование в Узбекистане — насосы, КНС и станции",

  description:
    "Насосное оборудование SUVSANOAT в Узбекистане: канализационные, дренажные, центробежные и многоступенчатые насосы, КНС и насосные станции. Инженерный подбор по расходу и напору.",

  alternates: {
    canonical: "/catalog/pump-equipment",
  },

  openGraph: {
    title: "Насосное оборудование, насосы и КНС | SUVSANOAT",
    description:
      "Промышленные насосы, канализационные насосные станции и КНС для очистных сооружений, водоснабжения и водоподготовки.",
    url: "https://suvsanoat.uz/catalog/pump-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/pump-equipment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Насосное оборудование, насосы и КНС SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Насосное оборудование, насосы и КНС | SUVSANOAT",
    description:
      "Канализационные и промышленные насосы, насосные станции и КНС для воды и сточных вод.",
    images: ["/pump-equipment-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PumpEquipmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Погружные канализационные насосы",
      text: "Насосы для перекачивания хозяйственно-бытовых, промышленных и загрязнённых сточных вод на очистных сооружениях и КНС.",
    },
    {
      number: "02",
      title: "Дренажные насосы",
      text: "Оборудование для отвода дренажных, ливневых, грунтовых и условно чистых вод с промышленных и инфраструктурных объектов.",
    },
    {
      number: "03",
      title: "Центробежные насосы",
      text: "Промышленные центробежные насосы для систем водоснабжения, водоподготовки, циркуляции и технологических процессов.",
    },
    {
      number: "04",
      title: "Вертикальные многоступенчатые насосы",
      text: "Насосы высокого давления для водоснабжения, фильтрации, мембранных установок и систем обратного осмоса RO.",
    },
    {
      number: "05",
      title: "Насосные станции",
      text: "Комплектные автоматизированные насосные станции для поддержания требуемого расхода и давления в инженерных системах.",
    },
    {
      number: "06",
      title: "Канализационные насосные станции — КНС",
      text: "Комплексные КНС для приёма, накопления и перекачивания хозяйственно-бытовых и производственных сточных вод.",
    },
    {
      number: "07",
      title: "Насосы для химических реагентов",
      text: "Насосное оборудование для перекачивания химических растворов и технологических жидкостей с подбором материалов исполнения.",
    },
    {
      number: "08",
      title: "Комплектующие и автоматика",
      text: "Шкафы управления, датчики уровня, частотные преобразователи, трубопроводная арматура и системы защиты насосного оборудования.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Определяем требуемый расход, напор, режим работы и характеристики перекачиваемой жидкости.",
    },
    {
      number: "02",
      title: "Гидравлический расчёт",
      text: "Рассчитываем рабочую точку насоса, статический напор, гидравлические потери и параметры трубопроводной системы.",
    },
    {
      number: "03",
      title: "Подбор насоса",
      text: "Выбираем тип насоса, производительность, напор, мощность двигателя, материалы исполнения и оптимальный режим работы.",
    },
    {
      number: "04",
      title: "Автоматизация",
      text: "Подбираем шкаф управления, частотное регулирование, датчики уровня, контроль параметров и системы защиты.",
    },
    {
      number: "05",
      title: "Поставка и запуск",
      text: "Комплектуем насосное оборудование, организуем поставку на объект и выполняем монтажное сопровождение и пусконаладку.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Канализационные насосные станции",
    "Системы водоснабжения",
    "Системы водоподготовки",
    "Промышленные предприятия",
    "Дренажные системы",
    "Системы обратного осмоса",
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
            src="/pump-equipment.png"
            alt="Насосное оборудование, промышленные насосы и КНС SUVSANOAT в Узбекистане"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>НАСОСНОЕ ОБОРУДОВАНИЕ</b>
          </div>

          <div className="categoryHeroLabel">
            04 · НАСОСНОЕ ОБОРУДОВАНИЕ
          </div>

          <h1>
            Насосное оборудование
            <br />
            для воды и сточных вод.
          </h1>

          <p>
            Промышленные, канализационные и дренажные насосы, насосные
            станции и КНС для очистных сооружений, водоснабжения,
            водоподготовки и технологических процессов.
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
            <strong>Q / H</strong>
            <span>подбор по расходу и напору</span>
          </div>

          <div>
            <strong>КНС</strong>
            <span>канализационные станции</span>
          </div>

          <div>
            <strong>AUTO</strong>
            <span>управление и защита</span>
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
          ПРОМЫШЛЕННОЕ НАСОСНОЕ ОБОРУДОВАНИЕ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Насосы под
            <br />
            реальные условия работы.
          </h2>

          <div>
            <p>
              Насосное оборудование является ключевым элементом систем
              водоснабжения, водоотведения, водоподготовки и очистки
              сточных вод. От правильного подбора насоса зависит
              стабильность и энергоэффективность всей системы.
            </p>

            <p>
              SUVSANOAT выполняет инженерный подбор насосов по расходу,
              напору, характеристикам перекачиваемой среды и режиму
              эксплуатации. Для комплексных объектов комплектуем насосные
              станции, КНС, автоматику и трубопроводную арматуру.
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
              Насосы и насосные станции
              <br />
              для инженерных систем.
            </h2>
          </div>

          <p>
            От отдельных промышленных и канализационных насосов до
            комплектных автоматизированных насосных станций и КНС.
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
            От расхода и напора
            <br />
            до рабочего насоса.
          </h2>

          <p>
            Насос подбирается по рабочей точке системы. Учитываем расход,
            статический и динамический напор, гидравлические потери,
            свойства жидкости и режим эксплуатации.
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
              Насосное оборудование
              <br />
              для разных отраслей.
            </h2>
          </div>

          <p>
            Подбираем насосы и насосные станции для новых объектов,
            реконструкции и модернизации существующих систем
            водоснабжения, канализации и очистки воды.
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
            ПОДБОР НАСОСНОГО ОБОРУДОВАНИЯ
          </span>

          <h2>
            Подберём насос или КНС
            <br />
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте требуемый расход, напор, характеристики
            перекачиваемой жидкости и условия эксплуатации. Подберём
            насос, насосную станцию или КНС, автоматику и необходимую
            комплектацию.
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