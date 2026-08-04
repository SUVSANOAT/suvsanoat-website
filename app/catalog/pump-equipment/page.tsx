import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Насосное оборудование в Узбекистане — насосы и КНС",

  description:
    "SUVSANOAT поставляет насосное оборудование в Узбекистане: канализационные, дренажные, центробежные и многоступенчатые насосы, насосные станции и КНС. Инженерный подбор по расходу и напору.",

  alternates: {
    canonical: "/catalog/pump-equipment",
  },

  openGraph: {
    title: "Насосное оборудование в Узбекистане | SUVSANOAT",
    description:
      "Промышленные насосы, насосные станции и КНС для водоснабжения, водоподготовки и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/pump-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/pump-equipment.png",
        width: 1200,
        height: 630,
        alt: "Промышленное насосное оборудование SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Насосное оборудование в Узбекистане | SUVSANOAT",
    description:
      "Насосы, насосные станции и КНС для промышленных и инфраструктурных объектов.",
    images: ["/pump-equipment.png"],
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
      text: "Перекачивание бытовых, промышленных и загрязнённых сточных вод.",
    },
    {
      number: "02",
      title: "Дренажные насосы",
      text: "Отвод дренажных, ливневых и условно чистых вод с объектов.",
    },
    {
      number: "03",
      title: "Центробежные насосы",
      text: "Надёжное решение для систем водоснабжения, водоподготовки и технологических процессов.",
    },
    {
      number: "04",
      title: "Вертикальные многоступенчатые насосы",
      text: "Создание высокого давления в системах водоснабжения, фильтрации и обратного осмоса.",
    },
    {
      number: "05",
      title: "Насосные станции",
      text: "Комплектные автоматизированные установки для поддержания требуемого давления и расхода.",
    },
    {
      number: "06",
      title: "Канализационные насосные станции",
      text: "Комплексные КНС для приёма и перекачивания хозяйственно-бытовых и производственных стоков.",
    },
    {
      number: "07",
      title: "Насосы для химических реагентов",
      text: "Перекачивание химических растворов и технологических жидкостей с подбором материалов исполнения.",
    },
    {
      number: "08",
      title: "Комплектующие и автоматика",
      text: "Шкафы управления, датчики уровня, частотные преобразователи, арматура и системы защиты.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Определяем требуемый расход, напор и характеристики перекачиваемой среды.",
    },
    {
      number: "02",
      title: "Гидравлический расчёт",
      text: "Рассчитываем рабочую точку, потери давления и параметры трубопроводной системы.",
    },
    {
      number: "03",
      title: "Подбор насоса",
      text: "Выбираем тип, мощность, материалы исполнения и оптимальный режим работы.",
    },
    {
      number: "04",
      title: "Автоматизация",
      text: "Подбираем шкаф управления, частотное регулирование, датчики и системы защиты.",
    },
    {
      number: "05",
      title: "Поставка и запуск",
      text: "Комплектуем оборудование, поставляем на объект и выполняем пусконаладку.",
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
            src="/pump-equipment.png"
            alt="Промышленное насосное оборудование SUVSANOAT в Узбекистане"
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
            Точное давление.
            <br />
            Надёжная работа.
          </h1>

          <p>
            Промышленное насосное оборудование для очистных сооружений,
            водоподготовки, водоснабжения, канализации и технологических
            процессов.
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
            <strong>ПОДБОР</strong>
            <span>по расходу и напору</span>
          </div>

          <div>
            <strong>АВТОМАТИЗАЦИЯ</strong>
            <span>управление и защита</span>
          </div>

          <div>
            <strong>24 / 7</strong>
            <span>непрерывная работа</span>
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
            реальные условия.
          </h2>

          <div>
            <p>
              Насосное оборудование является одним из ключевых элементов
              систем водоснабжения, водоотведения, водоподготовки и очистки
              сточных вод.
            </p>

            <p>
              SUVSANOAT подбирает насосы по производительности, требуемому
              напору, характеристикам жидкости и режиму эксплуатации объекта.
              Это позволяет обеспечить стабильную работу системы и избежать
              неправильного выбора мощности оборудования.
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
              Насосное оборудование
              <br />
              для любых задач.
            </h2>
          </div>

          <p>
            От отдельных насосов до комплектных автоматизированных насосных
            станций для промышленных и инфраструктурных объектов.
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
        <span className="categorySectionLabel">ИНЖЕНЕРНЫЙ ПОДБОР</span>

        <div className="waterProcessHeader">
          <h2>
            От параметров системы
            <br />
            до рабочего насоса.
          </h2>

          <p>
            Насос подбирается не только по мощности двигателя. Основными
            параметрами являются расход, напор, рабочая точка, свойства
            жидкости и условия эксплуатации.
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
              и промышленности.
            </h2>
          </div>

          <p>
            Подбираем насосное оборудование для новых объектов,
            реконструкции и модернизации существующих инженерных систем.
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
          <span>ПОДБОР НАСОСНОГО ОБОРУДОВАНИЯ</span>

          <h2>
            Рассчитаем насос
            <br />
            под ваш объект.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте требуемый расход, напор, характеристики жидкости
            и условия эксплуатации. Подберём насосное оборудование,
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