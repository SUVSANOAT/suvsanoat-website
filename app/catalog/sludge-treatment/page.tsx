export default function SludgeTreatmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Шнековые обезвоживатели",
      text: "Компактное оборудование для механического обезвоживания осадка с автоматическим режимом работы.",
    },
    {
      number: "02",
      title: "Ленточные фильтр-прессы",
      text: "Непрерывное обезвоживание осадка для коммунальных и промышленных очистных сооружений.",
    },
    {
      number: "03",
      title: "Камерные фильтр-прессы",
      text: "Глубокое механическое обезвоживание осадка с получением плотного обезвоженного кека.",
    },
    {
      number: "04",
      title: "Декантерные центрифуги",
      text: "Высокопроизводительное разделение жидкой и твёрдой фаз в непрерывном автоматическом режиме.",
    },
    {
      number: "05",
      title: "Насосы осадка",
      text: "Оборудование для транспортировки активного, избыточного и сгущённого осадка между технологическими этапами.",
    },
    {
      number: "06",
      title: "Станции приготовления полимера",
      text: "Автоматическое приготовление и дозирование флокулянта для повышения эффективности обезвоживания.",
    },
    {
      number: "07",
      title: "Сгустители осадка",
      text: "Предварительное уменьшение объёма осадка перед подачей на оборудование механического обезвоживания.",
    },
    {
      number: "08",
      title: "Транспортировка осадка",
      text: "Шнековые конвейеры и вспомогательное оборудование для удаления обезвоженного осадка.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Сбор осадка",
      text: "Осадок поступает из технологических сооружений в систему обработки.",
    },
    {
      number: "02",
      title: "Сгущение",
      text: "Снижаем содержание свободной воды и уменьшаем первоначальный объём осадка.",
    },
    {
      number: "03",
      title: "Кондиционирование",
      text: "При необходимости вводится полимер для улучшения отделения воды от твёрдой фазы.",
    },
    {
      number: "04",
      title: "Обезвоживание",
      text: "Осадок проходит механическое обезвоживание на выбранном типе оборудования.",
    },
    {
      number: "05",
      title: "Удаление",
      text: "Обезвоженный осадок направляется на накопление, транспортировку или дальнейшую обработку.",
    },
  ];

  const applications = [
    "Коммунальные очистные сооружения",
    "Промышленные очистные сооружения",
    "Текстильные предприятия",
    "Пищевые производства",
    "Мясокомбинаты",
    "Молочные предприятия",
    "Птицефабрики",
    "Физико-химическая очистка",
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
            src="/sludge-treatment.png"
            alt="Оборудование для обработки осадка SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>ОБРАБОТКА ОСАДКА</b>
          </div>

          <div className="categoryHeroLabel">
            06 · ОБРАБОТКА ОСАДКА
          </div>

          <h1>
            Меньше объём.
            <br />
            Проще утилизация.
          </h1>

          <p>
            Оборудование для сгущения, кондиционирования, обезвоживания
            и транспортировки осадка коммунальных и промышленных
            очистных сооружений.
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
            <span>автоматическая работа</span>
          </div>

          <div>
            <strong>МЕНЬШЕ ОБЪЁМ</strong>
            <span>обезвоживание осадка</span>
          </div>

          <div>
            <strong>АВТОМАТИЗАЦИЯ</strong>
            <span>контроль процесса</span>
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
          ОБРАБОТКА И ОБЕЗВОЖИВАНИЕ ОСАДКА
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Осадок —
            <br />
            часть технологии.
          </h2>

          <div>
            <p>
              В процессе очистки сточных вод образуется осадок, который
              необходимо сгущать, обезвоживать и подготавливать к дальнейшей
              транспортировке или утилизации.
            </p>

            <p>
              SUVSANOAT подбирает оборудование с учётом количества и свойств
              осадка, требуемой производительности, режима работы объекта
              и необходимой степени обезвоживания.
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
              От сгущения
              <br />
              до обезвоживания.
            </h2>
          </div>

          <p>
            Комплектуем технологические линии обработки осадка для
            коммунальных и промышленных очистных сооружений.
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
          ТЕХНОЛОГИЧЕСКИЙ ПРОЦЕСС
        </span>

        <div className="waterProcessHeader">
          <h2>
            От жидкого осадка
            <br />
            до обезвоженного кека.
          </h2>

          <p>
            Правильно подобранная линия обработки позволяет уменьшить объём
            осадка и упростить его дальнейшее хранение, транспортировку
            и утилизацию.
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
              Для коммунальных
              <br />
              и промышленных объектов.
            </h2>
          </div>

          <p>
            Оборудование может использоваться как в составе новых очистных
            сооружений, так и при модернизации существующих систем обработки
            осадка.
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
            Рассчитаем линию
            <br />
            обработки осадка.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте производительность очистных сооружений, количество
            образующегося осадка и имеющиеся исходные данные. Подберём
            оборудование и подготовим предварительное техническое решение.
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