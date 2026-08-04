export default function AutomationPage() {
  const equipment = [
    {
      number: "01",
      title: "Шкафы управления",
      text: "Комплектные электрические шкафы для управления технологическим оборудованием очистных сооружений и систем водоподготовки.",
    },
    {
      number: "02",
      title: "PLC-контроллеры",
      text: "Программируемые логические контроллеры для автоматического управления насосами, воздуходувками, клапанами и технологическими процессами.",
    },
    {
      number: "03",
      title: "HMI-панели",
      text: "Сенсорные панели оператора для визуального контроля параметров, режимов работы, аварий и состояния оборудования.",
    },
    {
      number: "04",
      title: "Частотные преобразователи",
      text: "Регулирование производительности насосов и воздуходувок для снижения энергопотребления и точного управления процессом.",
    },
    {
      number: "05",
      title: "Датчики и КИП",
      text: "Контроль уровня, расхода, давления, pH, растворённого кислорода и других технологических параметров.",
    },
    {
      number: "06",
      title: "SCADA-системы",
      text: "Централизованный мониторинг объекта, визуализация технологической схемы, архивирование параметров и регистрация аварий.",
    },
    {
      number: "07",
      title: "Удалённый мониторинг",
      text: "Дистанционный контроль состояния оборудования и основных технологических параметров объекта.",
    },
    {
      number: "08",
      title: "Системы сигнализации",
      text: "Предупреждение персонала об авариях, отклонениях технологических параметров и неисправностях оборудования.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Алгоритм",
      text: "Определяем технологическую последовательность работы оборудования и необходимые режимы управления.",
    },
    {
      number: "02",
      title: "Проектирование",
      text: "Разрабатываем структуру системы управления, электрические схемы и перечень компонентов.",
    },
    {
      number: "03",
      title: "Сборка шкафа",
      text: "Комплектуем и собираем шкафы управления с защитной, коммутационной и управляющей аппаратурой.",
    },
    {
      number: "04",
      title: "Программирование",
      text: "Настраиваем PLC, HMI, алгоритмы автоматической работы и систему аварийной сигнализации.",
    },
    {
      number: "05",
      title: "Пусконаладка",
      text: "Проверяем оборудование на объекте, настраиваем режимы и запускаем систему автоматического управления.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Насосные станции",
    "Системы аэрации",
    "Реагентное хозяйство",
    "MBR / SBR / MBBR",
    "Промышленные предприятия",
    "Модернизация существующих систем",
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
            src="/automation.png"
            alt="Автоматизация очистных сооружений SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>АВТОМАТИЗАЦИЯ</b>
          </div>

          <div className="categoryHeroLabel">
            09 · АВТОМАТИЗАЦИЯ
          </div>

          <h1>
            Контроль каждого
            <br />
            процесса.
          </h1>

          <p>
            Автоматизированные системы управления очистными сооружениями,
            водоподготовкой, насосным и технологическим оборудованием.
          </p>

          <div className="categoryHeroButtons">
            <a href="#equipment" className="categoryPrimaryButton">
              Смотреть системы <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Получить расчёт
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>24/7</strong>
            <span>автоматическая работа</span>
          </div>

          <div>
            <strong>PLC + HMI</strong>
            <span>управление процессами</span>
          </div>

          <div>
            <strong>SCADA</strong>
            <span>контроль и мониторинг</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>проект · сборка · запуск</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          АВТОМАТИЗАЦИЯ ПРОЦЕССОВ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Система работает.
            <br />
            Вы контролируете.
          </h2>

          <div>
            <p>
              Современные очистные сооружения состоят из десятков единиц
              оборудования, которые должны работать как единая технологическая
              система.
            </p>

            <p>
              SUVSANOAT разрабатывает автоматизированное управление насосами,
              воздуходувками, клапанами, дозированием реагентов и другими
              процессами с контролем ключевых параметров объекта.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СИСТЕМЫ УПРАВЛЕНИЯ
            </span>

            <h2>
              От датчика
              <br />
              до диспетчерской.
            </h2>
          </div>

          <p>
            Объединяем силовое оборудование, контрольно-измерительные приборы,
            PLC, HMI и программное обеспечение в единую систему управления.
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
          РЕАЛИЗАЦИЯ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От алгоритма
            <br />
            до запуска.
          </h2>

          <p>
            Автоматизация проектируется вместе с технологическим процессом,
            чтобы оборудование работало согласованно, безопасно и с минимальным
            участием оператора.
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
              Управление всей
              <br />
              системой.
            </h2>
          </div>

          <p>
            Автоматизация может разрабатываться как для нового объекта,
            так и для модернизации существующих очистных сооружений
            и инженерных систем.
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
          <span>АВТОМАТИЗАЦИЯ ОБЪЕКТА</span>

          <h2>
            Разработаем систему
            <br />
            управления.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте технологическую схему, перечень оборудования или
            техническое задание. Определим архитектуру автоматизации,
            состав шкафа управления и необходимое оборудование.
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