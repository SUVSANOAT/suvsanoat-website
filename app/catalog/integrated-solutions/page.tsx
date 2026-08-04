export default function IntegratedSolutionsPage() {
  const solutions = [
    {
      number: "01",
      title: "Очистные сооружения",
      text: "Комплексные системы очистки коммунальных и промышленных сточных вод с подбором технологии под фактический состав стоков.",
    },
    {
      number: "02",
      title: "Водоподготовка",
      text: "Системы подготовки технической и технологической воды: фильтрация, ультрафильтрация, обратный осмос и реагентная обработка.",
    },
    {
      number: "03",
      title: "Насосные станции",
      text: "Подбор насосного оборудования, трубопроводной обвязки, арматуры и систем управления для технологических процессов.",
    },
    {
      number: "04",
      title: "Резервуары и ёмкости",
      text: "Железобетонные, металлические и полимерные резервуары для усреднения, биологической очистки, хранения воды, осадка и реагентов.",
    },
    {
      number: "05",
      title: "Трубопроводы и арматура",
      text: "Комплектные технологические трубопроводные системы, запорная и регулирующая арматура, фитинги и соединительные элементы.",
    },
    {
      number: "06",
      title: "Автоматизация",
      text: "Шкафы управления, PLC, датчики, частотные преобразователи и диспетчеризация для автоматической работы комплекса.",
    },
    {
      number: "07",
      title: "Электротехническая часть",
      text: "Комплектация силового оборудования, распределительных шкафов и систем управления технологическими потребителями.",
    },
    {
      number: "08",
      title: "Монтаж и шеф-монтаж",
      text: "Техническое сопровождение монтажа оборудования и инженерных систем непосредственно на объекте.",
    },
    {
      number: "09",
      title: "Пусконаладка",
      text: "Проверка оборудования, настройка технологических режимов, автоматизации и запуск комплекса в эксплуатацию.",
    },
    {
      number: "10",
      title: "Сервис",
      text: "Техническое сопровождение после запуска, диагностика, обслуживание оборудования и поставка запасных частей.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Исходные данные",
      text: "Получаем техническое задание, анализы воды или стоков, производительность и требования заказчика.",
    },
    {
      number: "02",
      title: "Инжиниринг",
      text: "Разрабатываем технологическую концепцию, определяем основные сооружения и состав оборудования.",
    },
    {
      number: "03",
      title: "Комплектация",
      text: "Формируем единый комплект технологического, механического, электрического и автоматизированного оборудования.",
    },
    {
      number: "04",
      title: "Реализация",
      text: "Организуем производство, поставку, монтаж или шеф-монтаж оборудования на объекте.",
    },
    {
      number: "05",
      title: "Запуск",
      text: "Выполняем пусконаладку, настройку технологических режимов и передаём систему в эксплуатацию.",
    },
  ];

  const applications = [
    "Промышленные предприятия",
    "Текстильные производства",
    "Пищевые предприятия",
    "Жилые комплексы",
    "Гостиницы и больницы",
    "Аэропорты и инфраструктура",
    "Коммунальные очистные сооружения",
    "Модернизация существующих объектов",
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
            src="/integrated-solutions.png"
            alt="Комплексные инженерные решения SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>КОМПЛЕКСНЫЕ РЕШЕНИЯ</b>
          </div>

          <div className="categoryHeroLabel">
            12 · КОМПЛЕКСНЫЕ РЕШЕНИЯ
          </div>

          <h1>
            Один проект.
            <br />
            Одна система.
          </h1>

          <p>
            Комплексные инженерные решения для очистки сточных вод и
            водоподготовки — от разработки технологической схемы и комплектации
            оборудования до монтажа, запуска и сервисного сопровождения.
          </p>

          <div className="categoryHeroButtons">
            <a href="#solutions-list" className="categoryPrimaryButton">
              Смотреть решения <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Обсудить проект
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>единая инженерная система</span>
          </div>

          <div>
            <strong>5–200 000</strong>
            <span>м³/сутки</span>
          </div>

          <div>
            <strong>ПОЛНЫЙ ЦИКЛ</strong>
            <span>проект · поставка · запуск</span>
          </div>

          <div>
            <strong>СЕРВИС</strong>
            <span>сопровождение после запуска</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          КОМПЛЕКСНЫЙ ИНЖИНИРИНГ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Все элементы
            <br />
            работают вместе.
          </h2>

          <div>
            <p>
              Очистные сооружения — это не отдельный насос, резервуар или
              мембранная установка. Эффективность объекта зависит от того,
              насколько правильно все технологические и инженерные системы
              объединены в единый комплекс.
            </p>

            <p>
              SUVSANOAT рассматривает объект как целую систему: технологию,
              резервуары, оборудование, трубопроводы, электрику,
              автоматизацию и эксплуатационные требования.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="categoryEquipment" id="solutions-list">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              СОСТАВ КОМПЛЕКСНОГО РЕШЕНИЯ
            </span>

            <h2>
              От технологии
              <br />
              до запуска.
            </h2>
          </div>

          <p>
            Комплектуем объект как единую инженерную систему и определяем
            необходимый состав оборудования в зависимости от конкретной задачи.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {solutions.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>↗</b>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <a href="/#contacts">
                Обсудить решение <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          ЭТАПЫ РЕАЛИЗАЦИИ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От исходных данных
            <br />
            до работающего объекта.
          </h2>

          <p>
            Каждый этап связан с предыдущим. Это позволяет заранее согласовать
            технологию, оборудование и инженерную инфраструктуру объекта.
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

      {/* FULL CYCLE */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ЕДИНАЯ ОТВЕТСТВЕННОСТЬ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Один подрядчик.
            <br />
            Весь цикл проекта.
          </h2>

          <div>
            <p>
              Единый подход снижает риск несовместимости оборудования,
              ошибок при монтаже и несогласованности между отдельными
              инженерными системами.
            </p>

            <p>
              Заказчик получает не набор отдельных компонентов, а
              согласованное решение, рассчитанное под производительность,
              характеристики воды и условия эксплуатации конкретного объекта.
            </p>
          </div>
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
              Решения
              <br />
              для разных объектов.
            </h2>
          </div>

          <p>
            Реализуем инженерные системы для новых объектов, реконструкции и
            модернизации существующих очистных сооружений и систем
            водоподготовки.
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
          <span>НАЧАТЬ ПРОЕКТ</span>

          <h2>
            Есть техническое
            <br />
            задание?
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте техническое задание, анализы воды или сточных вод,
            требуемую производительность, чертежи или имеющиеся исходные
            данные. Подготовим предварительную концепцию комплексного решения.
          </p>

          <a href="/#contacts">
            ПОЛУЧИТЬ ПРЕДВАРИТЕЛЬНОЕ РЕШЕНИЕ <span>→</span>
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