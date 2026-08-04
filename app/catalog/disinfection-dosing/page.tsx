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
      text: "Определяем необходимую производительность оборудования и расход реагента.",
    },
    {
      number: "04",
      title: "Автоматизация",
      text: "Настраиваем контроль параметров и автоматическое управление процессом.",
    },
    {
      number: "05",
      title: "Запуск",
      text: "Выполняем настройку оборудования и проверяем рабочие параметры системы.",
    },
  ];

  const applications = [
    "Питьевая вода",
    "Очистные сооружения",
    "Промышленные стоки",
    "Водоподготовка",
    "Повторное использование воды",
    "Бассейны и резервуары",
    "Пищевые предприятия",
    "Инфраструктурные объекты",
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
            alt="Оборудование для дезинфекции и дозирования SUVSANOAT"
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
            Точная дозировка.
          </h1>

          <p>
            Системы обеззараживания и автоматического дозирования реагентов
            для питьевой воды, очистных сооружений и промышленных
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
            <span>ультрафиолет</span>
          </div>

          <div>
            <strong>NaClO</strong>
            <span>гипохлорит натрия</span>
          </div>

          <div>
            <strong>АВТОМАТИЗАЦИЯ</strong>
            <span>контроль дозирования</span>
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
          ДЕЗИНФЕКЦИЯ И ХИМИЧЕСКОЕ ДОЗИРОВАНИЕ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Контроль качества
            <br />
            на финальном этапе.
          </h2>

          <div>
            <p>
              Обеззараживание является важным этапом подготовки питьевой воды,
              очистки сточных вод и повторного использования очищенной воды.
            </p>

            <p>
              SUVSANOAT подбирает оборудование с учётом производительности,
              качества исходной воды, требуемой степени обеззараживания,
              расхода реагентов и необходимого уровня автоматизации.
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
              От УФ-реактора
              <br />
              до станции дозирования.
            </h2>
          </div>

          <p>
            Комплектуем системы обеззараживания, приготовления и дозирования
            химических реагентов для объектов различной производительности.
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
            От анализа воды
            <br />
            до точной дозировки.
          </h2>

          <p>
            Метод обеззараживания и количество реагента определяются
            характеристиками воды, производительностью объекта и требованиями
            к качеству обработанной воды.
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
              Для воды
              <br />и сточных вод.
            </h2>
          </div>

          <p>
            Системы применяются как на самостоятельных объектах
            водоподготовки, так и в составе комплексных очистных сооружений.
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
            для вашего объекта.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность объекта, анализ воды или сточных вод
            и требования к качеству обработанной воды. Подготовим
            предварительное техническое решение.
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