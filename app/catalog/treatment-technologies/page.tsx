export default function TreatmentTechnologiesPage() {
  const technologies = [
    {
      number: "01",
      code: "MBR",
      title: "Мембранный биореактор",
      text: "Биологическая очистка в сочетании с мембранным разделением. Обеспечивает высокое качество очищенной воды и позволяет значительно сократить площадь сооружений.",
    },
    {
      number: "02",
      code: "SBR",
      title: "Реактор периодического действия",
      text: "Биологическая очистка в одном реакторе с последовательными фазами наполнения, аэрации, отстаивания и отвода очищенной воды.",
    },
    {
      number: "03",
      code: "MBBR",
      title: "Биоплёночная технология",
      text: "Очистка с использованием подвижной загрузки, на поверхности которой развивается активная биоплёнка. Подходит для переменных органических нагрузок.",
    },
    {
      number: "04",
      code: "A/O",
      title: "Аноксидно-аэробная очистка",
      text: "Комбинация аноксидной и аэробной зон для биологического удаления органических загрязнений и соединений азота.",
    },
    {
      number: "05",
      code: "A²/O",
      title: "Удаление азота и фосфора",
      text: "Многоступенчатая биологическая схема с анаэробной, аноксидной и аэробной зонами для глубокой очистки сточных вод.",
    },
    {
      number: "06",
      code: "ANBR",
      title: "Анаэробный биореактор",
      text: "Анаэробная технология для сточных вод с высокой концентрацией органических загрязнений и снижения нагрузки на последующие стадии очистки.",
    },
    {
      number: "07",
      code: "DAF",
      title: "Напорная флотация",
      text: "Физико-химическое удаление взвешенных веществ, масел, жиров и других загрязнений с помощью микропузырьков воздуха.",
    },
    {
      number: "08",
      code: "UF",
      title: "Ультрафильтрация",
      text: "Мембранная технология для удаления взвешенных веществ, коллоидных частиц и микроорганизмов на стадии глубокой доочистки воды.",
    },
    {
      number: "09",
      code: "RO",
      title: "Обратный осмос",
      text: "Глубокая мембранная очистка воды от растворённых солей и других примесей для получения воды требуемого качества.",
    },
    {
      number: "10",
      code: "PHYS-CHEM",
      title: "Физико-химическая очистка",
      text: "Коагуляция, флокуляция, нейтрализация, флотация и другие процессы для обработки сложных промышленных сточных вод.",
    },
    {
      number: "11",
      code: "REUSE",
      title: "Повторное использование воды",
      text: "Комплексная доочистка очищенных сточных вод для их возврата в техническое водоснабжение и технологические процессы предприятия.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Анализы",
      text: "Изучаем состав исходной воды или сточных вод и фактические концентрации загрязнений.",
    },
    {
      number: "02",
      title: "Требования",
      text: "Определяем необходимое качество очищенной воды и условия её сброса или повторного использования.",
    },
    {
      number: "03",
      title: "Технология",
      text: "Подбираем оптимальную комбинацию механических, биологических, физико-химических и мембранных процессов.",
    },
    {
      number: "04",
      title: "Расчёт",
      text: "Определяем объёмы сооружений, нагрузки, оборудование и основные эксплуатационные параметры системы.",
    },
    {
      number: "05",
      title: "Реализация",
      text: "Проектируем, комплектуем и запускаем технологическую систему как единый комплекс.",
    },
  ];

  const applications = [
    "Коммунальные сточные воды",
    "Текстильные предприятия",
    "Пищевые производства",
    "Молочные предприятия",
    "Мясокомбинаты",
    "Птицефабрики",
    "Сложные промышленные стоки",
    "Повторное использование воды",
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
            src="/treatment-technologies.png"
            alt="Технологии очистки воды и сточных вод SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>ТЕХНОЛОГИИ ОЧИСТКИ</b>
          </div>

          <div className="categoryHeroLabel">
            11 · ТЕХНОЛОГИИ ОЧИСТКИ
          </div>

          <h1>
            Не одна технология.
            <br />
            Правильная технология.
          </h1>

          <p>
            Подбираем технологическую схему под состав сточных вод,
            производительность объекта и требования к качеству очищенной воды.
          </p>

          <div className="categoryHeroButtons">
            <a href="#technologies-list" className="categoryPrimaryButton">
              Смотреть технологии <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              Подобрать технологию
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>MBR · SBR</strong>
            <span>биологическая очистка</span>
          </div>

          <div>
            <strong>MBBR · A²/O</strong>
            <span>удаление органики и биогенов</span>
          </div>

          <div>
            <strong>DAF · UF · RO</strong>
            <span>физико-химическая и мембранная очистка</span>
          </div>

          <div>
            <strong>REUSE</strong>
            <span>повторное использование воды</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ИНЖЕНЕРНЫЙ ПОДХОД
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Технология зависит
            <br />
            от воды.
          </h2>

          <div>
            <p>
              Универсальной технологической схемы для всех объектов не
              существует. Состав сточных вод, расход, режим работы предприятия
              и требования к очищенной воде определяют архитектуру всей
              системы.
            </p>

            <p>
              SUVSANOAT комбинирует механические, биологические,
              физико-химические и мембранные процессы для получения
              технически и экономически обоснованного решения.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="categoryEquipment" id="technologies-list">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">
              ТЕХНОЛОГИИ SUVSANOAT
            </span>

            <h2>
              От биореактора
              <br />
              до повторного использования.
            </h2>
          </div>

          <p>
            Отдельные технологии могут использоваться самостоятельно или
            объединяться в многоступенчатую технологическую схему в зависимости
            от задачи объекта.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {technologies.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>{item.code}</b>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <a href="/#contacts">
                Подобрать технологию <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">
          ПОДБОР ТЕХНОЛОГИИ
        </span>

        <div className="waterProcessHeader">
          <h2>
            От анализа
            <br />
            до технологической схемы.
          </h2>

          <p>
            Решение принимается не по названию технологии, а по исходным
            данным объекта и требуемому результату очистки.
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
              Для простых
              <br />
              и сложных стоков.
            </h2>
          </div>

          <p>
            Разрабатываем технологические схемы для коммунальных объектов и
            предприятий с различным составом и концентрацией загрязнений.
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
          <span>ИНЖЕНЕРНЫЙ ПОДБОР</span>

          <h2>
            Подберём технологию
            <br />
            под ваш объект.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте анализы сточных вод, производительность и требования к
            очищенной воде. Подготовим предварительную технологическую схему и
            определим необходимый состав оборудования.
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