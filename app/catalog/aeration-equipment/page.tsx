export default function AerationEquipmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Дисковые диффузоры",
      text: "Мелкопузырчатая аэрация для эффективной передачи кислорода в аэротенках и биологических реакторах.",
    },
    {
      number: "02",
      title: "Трубчатые диффузоры",
      text: "Аэрационные элементы для равномерного распределения воздуха по площади биологического реактора.",
    },
    {
      number: "03",
      title: "Воздуходувки",
      text: "Оборудование для стабильной подачи воздуха в системы биологической очистки сточных вод.",
    },
    {
      number: "04",
      title: "Аэрационные решётки",
      text: "Комплектные системы распределения воздуха с трубопроводами и диффузорами для аэротенков.",
    },
    {
      number: "05",
      title: "Магистрали воздуха",
      text: "Трубопроводы, коллекторы, запорная и регулирующая арматура для распределения воздуха.",
    },
    {
      number: "06",
      title: "Системы перемешивания",
      text: "Погружные мешалки для поддержания активного ила во взвешенном состоянии и организации циркуляции.",
    },
    {
      number: "07",
      title: "Регулирование воздуха",
      text: "Автоматическое управление производительностью воздуходувок в зависимости от потребности процесса.",
    },
    {
      number: "08",
      title: "Контроль кислорода",
      text: "Датчики растворённого кислорода и системы контроля параметров биологической очистки.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Расчёт нагрузки",
      text: "Определяем расход сточных вод, органическую нагрузку и потребность биологического процесса в кислороде.",
    },
    {
      number: "02",
      title: "Расчёт воздуха",
      text: "Рассчитываем необходимую производительность системы подачи воздуха.",
    },
    {
      number: "03",
      title: "Подбор оборудования",
      text: "Подбираем воздуходувки, диффузоры, трубопроводы и регулирующую арматуру.",
    },
    {
      number: "04",
      title: "Распределение",
      text: "Проектируем расположение аэрационных элементов для равномерной подачи воздуха.",
    },
    {
      number: "05",
      title: "Автоматизация",
      text: "Настраиваем управление системой по технологическим параметрам и концентрации кислорода.",
    },
  ];

  const applications = [
    "Аэротенки",
    "MBR-реакторы",
    "SBR-реакторы",
    "MBBR-системы",
    "Усреднительные резервуары",
    "Коммунальные очистные сооружения",
    "Промышленные очистные сооружения",
    "Модернизация существующих КОС",
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
            src="/aeration-equipment.png"
            alt="Аэрационное оборудование SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>АЭРАЦИОННОЕ ОБОРУДОВАНИЕ</b>
          </div>

          <div className="categoryHeroLabel">
            07 · АЭРАЦИОННОЕ ОБОРУДОВАНИЕ
          </div>

          <h1>
            Кислород —
            <br />
            основа процесса.
          </h1>

          <p>
            Воздуходувки, мелкопузырчатые диффузоры и комплектные системы
            аэрации для эффективной биологической очистки сточных вод.
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
            <strong>24/7</strong>
            <span>непрерывная работа</span>
          </div>

          <div>
            <strong>O₂</strong>
            <span>эффективная передача кислорода</span>
          </div>

          <div>
            <strong>АВТОМАТИЗАЦИЯ</strong>
            <span>регулирование подачи воздуха</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>расчёт · поставка · запуск</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          СИСТЕМЫ АЭРАЦИИ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Воздух там,
            <br />
            где он нужен.
          </h2>

          <div>
            <p>
              Аэрационная система обеспечивает микроорганизмы кислородом,
              необходимым для биологического удаления органических загрязнений
              из сточных вод.
            </p>

            <p>
              SUVSANOAT рассчитывает и комплектует систему с учётом объёма
              реакторов, технологической нагрузки, требуемого расхода воздуха
              и условий эксплуатации очистных сооружений.
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
              От воздуходувки
              <br />
              до диффузора.
            </h2>
          </div>

          <p>
            Комплектуем полный воздушный тракт — от производства сжатого
            воздуха до его равномерного распределения непосредственно
            в биологическом реакторе.
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
          ИНЖЕНЕРНЫЙ РАСЧЁТ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От потребности
            <br />
            в кислороде до подачи воздуха.
          </h2>

          <p>
            Производительность воздуходувок и количество аэрационных элементов
            определяются технологической нагрузкой и параметрами биологического
            процесса.
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
              Для биологической
              <br />
              очистки.
            </h2>
          </div>

          <p>
            Системы аэрации применяются в новых очистных сооружениях,
            при расширении производительности и модернизации существующих
            биологических реакторов.
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
          <span>ПОДБОР ОБОРУДОВАНИЯ</span>

          <h2>
            Рассчитаем систему
            <br />
            аэрации объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность очистных сооружений, размеры
            аэротенков или биологических реакторов и исходные данные.
            Рассчитаем расход воздуха и подберём оборудование.
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