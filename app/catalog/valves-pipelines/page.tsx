export default function ValvesPipelinesPage() {
  const equipment = [
    {
      number: "01",
      title: "Дисковые затворы",
      text: "Запорная и регулирующая арматура для технологических трубопроводов систем водоснабжения, водоподготовки и очистки сточных вод.",
    },
    {
      number: "02",
      title: "Задвижки",
      text: "Промышленные задвижки для надёжного перекрытия потоков воды, сточных вод и технологических сред.",
    },
    {
      number: "03",
      title: "Обратные клапаны",
      text: "Защита насосов и трубопроводных систем от обратного движения жидкости и гидравлических воздействий.",
    },
    {
      number: "04",
      title: "Шаровые краны",
      text: "Компактная запорная арматура для воды, воздуха, реагентов и вспомогательных технологических линий.",
    },
    {
      number: "05",
      title: "Трубопроводы",
      text: "Стальные, нержавеющие и полимерные трубопроводные системы для транспортировки воды, стоков, воздуха и реагентов.",
    },
    {
      number: "06",
      title: "Фланцы и фитинги",
      text: "Соединительные элементы, отводы, тройники, переходы и фланцевые соединения для монтажа технологических линий.",
    },
    {
      number: "07",
      title: "Компенсаторы",
      text: "Элементы трубопроводов для компенсации вибраций, температурных расширений и механических перемещений.",
    },
    {
      number: "08",
      title: "Приводы и управление",
      text: "Ручные, электрические и пневматические приводы для локального и автоматизированного управления арматурой.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Расход",
      text: "Определяем рабочий расход жидкости или воздуха и требуемый диаметр трубопровода.",
    },
    {
      number: "02",
      title: "Среда",
      text: "Учитываем характеристики воды, сточных вод, реагентов и других транспортируемых сред.",
    },
    {
      number: "03",
      title: "Материал",
      text: "Подбираем материал труб и арматуры с учётом давления, коррозии и условий эксплуатации.",
    },
    {
      number: "04",
      title: "Комплектация",
      text: "Формируем комплект трубопроводов, арматуры, фитингов, приводов и соединительных элементов.",
    },
    {
      number: "05",
      title: "Монтаж",
      text: "Интегрируем трубопроводную систему с насосным и технологическим оборудованием объекта.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Насосные станции",
    "Системы аэрации",
    "Реагентные линии",
    "Промышленные предприятия",
    "Техническое водоснабжение",
    "Модернизация объектов",
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
            src="/valves-pipelines.png"
            alt="Промышленная арматура и трубопроводы SUVSANOAT"
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
            Надёжность
            <br />
            каждого соединения.
          </h1>

          <p>
            Промышленная трубопроводная арматура, трубы, фитинги и комплектующие
            для систем водоснабжения, водоподготовки и очистки сточных вод.
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
            <strong>DN 15–2000+</strong>
            <span>широкий диапазон диаметров</span>
          </div>

          <div>
            <strong>PN 6–40+</strong>
            <span>рабочее давление</span>
          </div>

          <div>
            <strong>РАЗНЫЕ СРЕДЫ</strong>
            <span>вода · стоки · воздух · реагенты</span>
          </div>

          <div>
            <strong>КОМПЛЕКТНО</strong>
            <span>подбор · поставка · монтаж</span>
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
            Всё связано
            <br />
            одной системой.
          </h2>

          <div>
            <p>
              Трубопроводы и арматура объединяют насосы, резервуары,
              технологическое оборудование и отдельные этапы очистки
              в единую инженерную систему.
            </p>

            <p>
              SUVSANOAT подбирает диаметры, материалы, типы соединений
              и запорно-регулирующую арматуру с учётом расхода, давления,
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
              АРМАТУРА И КОМПЛЕКТУЮЩИЕ
            </span>

            <h2>
              От трубы
              <br />
              до привода.
            </h2>
          </div>

          <p>
            Комплектуем технологические трубопроводные системы для новых
            объектов, реконструкции и модернизации существующих инженерных
            сооружений.
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
            От расхода
            <br />
            до монтажа.
          </h2>

          <p>
            Трубопроводная система рассчитывается как часть технологического
            процесса. Учитываем гидравлику, давление, свойства среды,
            материал и требования к эксплуатации.
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
              Для всей
              <br />
              инженерной системы.
            </h2>
          </div>

          <p>
            Подбираем трубопроводы и арматуру для транспортировки чистой воды,
            сточных вод, воздуха, осадка и химических реагентов.
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
          <span>КОМПЛЕКТАЦИЯ ОБЪЕКТА</span>

          <h2>
            Подберём арматуру
            <br />
            и трубопроводы.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте технологическую схему, диаметры, расходы, рабочее
            давление или спецификацию. Подберём подходящие трубы, арматуру,
            фитинги и комплектующие.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="categoryFooter">
        <div>
          <a href="/" className="categoryFooterLogo">
            <img src="/logo.png" alt="SUVSANOAT" />
          </a>

          <p>
            Инженерные системы очистки воды
            <br />и сточных вод.
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