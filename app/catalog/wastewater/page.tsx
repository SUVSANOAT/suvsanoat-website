export default function WastewaterPage() {
  const solutions = [
    {
      number: "01",
      title: "Локальные очистные сооружения",
      text: "Компактные системы очистки хозяйственно-бытовых сточных вод для отдельных объектов.",
    },
    {
      number: "02",
      title: "Канализационные очистные сооружения",
      text: "Комплексные КОС для населённых пунктов, жилых комплексов и инфраструктурных объектов.",
    },
    {
      number: "03",
      title: "Промышленные очистные сооружения",
      text: "Технологические решения с учётом состава и особенностей производственных сточных вод.",
    },
    {
      number: "04",
      title: "Блочно-модульные станции",
      text: "Заводская готовность, компактное размещение и возможность поэтапного увеличения мощности.",
    },
    {
      number: "05",
      title: "Контейнерные очистные сооружения",
      text: "Мобильные и компактные решения для объектов с ограниченной площадью и быстрым вводом.",
    },
    {
      number: "06",
      title: "Индивидуальные решения",
      text: "Проектирование технологической схемы под конкретный объект, состав стоков и требования заказчика.",
    },
  ];

  const technologies = [
    {
      name: "MBR",
      title: "Membrane Bioreactor",
      text: "Мембранная биологическая очистка",
    },
    {
      name: "SBR",
      title: "Sequencing Batch Reactor",
      text: "Последовательная биологическая очистка",
    },
    {
      name: "MBBR",
      title: "Moving Bed Biofilm Reactor",
      text: "Биоплёночная технология очистки",
    },
    {
      name: "A/O",
      title: "Anoxic / Oxic",
      text: "Удаление органических загрязнений и азота",
    },
    {
      name: "A²/O",
      title: "Anaerobic / Anoxic / Oxic",
      text: "Глубокое удаление азота и фосфора",
    },
    {
      name: "ANBR",
      title: "Anaerobic Bioreactor",
      text: "Анаэробная очистка высококонцентрированных стоков",
    },
  ];

  const stages = [
    "Анализ исходных данных",
    "Подбор технологии",
    "Проектирование",
    "Производство",
    "Поставка",
    "Монтаж",
    "Пусконаладка",
    "Сервис",
  ];

  return (
    <main className="wwPage">
      {/* HEADER */}
      <header className="wwHeader">
        <a href="/" className="wwLogo" aria-label="SUVSANOAT — главная">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <div className="wwHeaderRight">
          <a href="/#catalog" className="wwBack">
            ← КАТАЛОГ
          </a>

          <a href="/#contacts" className="wwHeaderButton">
            ПОЛУЧИТЬ РАСЧЁТ
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="wwHero">
        <div className="wwHeroBackground">
          <img
            src="/wastewater-treatment.png"
            alt="Очистные сооружения SUVSANOAT"
          />
        </div>

        <div className="wwHeroOverlay" />

        <div className="wwHeroContent">
          <div className="wwEyebrow">
            <span />
            ОЧИСТНЫЕ СООРУЖЕНИЯ
          </div>

          <h1>
            Инженерные решения
            <br />
            для очистки сточных вод.
          </h1>

          <p className="wwHeroText">
            Проектирование, производство и поставка комплексных
            очистных сооружений для коммунальных, промышленных
            и инфраструктурных объектов.
          </p>

          <div className="wwHeroActions">
            <a href="/#contacts" className="wwPrimaryButton">
              ПОЛУЧИТЬ РАСЧЁТ <span>→</span>
            </a>

            <a href="#wwSolutions" className="wwSecondaryButton">
              СМОТРЕТЬ РЕШЕНИЯ
            </a>
          </div>
        </div>

        <div className="wwHeroStats">
          <div className="wwHeroStat">
            <strong>5–200 000</strong>
            <span>м³/сутки</span>
            <p>Диапазон производительности</p>
          </div>

          <div className="wwHeroStat">
            <strong>ПОД КЛЮЧ</strong>
            <span>ПОЛНЫЙ ЦИКЛ</span>
            <p>От проекта до запуска объекта</p>
          </div>

          <div className="wwHeroStat">
            <strong>ИНДИВИДУАЛЬНО</strong>
            <span>ПОД ОБЪЕКТ</span>
            <p>Подбор технологии по исходным данным</p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="wwIntro">
        <div className="wwIntroLabel">SUVSANOAT / WASTEWATER</div>

        <div className="wwIntroGrid">
          <h2>
            Не просто оборудование.
            <br />
            Комплексная система очистки.
          </h2>

          <div className="wwIntroText">
            <p>
              Каждая система проектируется с учётом производительности,
              состава сточных вод, режима работы объекта и требований
              к качеству очищенной воды.
            </p>

            <p>
              В состав решения могут входить механическая, физико-химическая
              и биологическая очистка, мембранные технологии, обеззараживание,
              обработка осадка и автоматизация.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="wwSolutions" id="wwSolutions">
        <div className="wwSectionHeader">
          <div>
            <div className="wwSectionLabel">КОМПЛЕКСНЫЕ РЕШЕНИЯ</div>
            <h2>
              Очистные сооружения
              <br />
              для любого объекта.
            </h2>
          </div>

          <p>
            От компактных локальных установок до крупных
            промышленных очистных комплексов.
          </p>
        </div>

        <div className="wwSolutionGrid">
          {solutions.map((solution) => (
            <article className="wwSolutionCard" key={solution.number}>
              <div className="wwSolutionTop">
                <span>{solution.number}</span>
                <b>↗</b>
              </div>

              <h3>{solution.title}</h3>
              <p>{solution.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* BIG IMAGE */}
      <section className="wwShowcase">
        <div className="wwShowcaseImage">
          <img
            src="/wastewater-treatment.png"
            alt="Комплексные очистные сооружения"
          />

          <div className="wwShowcaseGradient" />

          <div className="wwShowcaseText">
            <span>МАСШТАБИРУЕМЫЕ РЕШЕНИЯ</span>

            <h2>
              От локальной станции
              <br />
              до промышленного комплекса.
            </h2>

            <p>
              Производительность систем — от 5 до 200 000 м³/сутки.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="wwTechnologies">
        <div className="wwSectionHeader wwDarkHeader">
          <div>
            <div className="wwSectionLabel">ТЕХНОЛОГИИ</div>
            <h2>
              Технология подбирается
              <br />
              под задачу.
            </h2>
          </div>

          <p>
            Не привязываемся к одной технологии.
            Подбираем оптимальную технологическую схему
            исходя из параметров конкретного объекта.
          </p>
        </div>

        <div className="wwTechnologyGrid">
          {technologies.map((technology, index) => (
            <article className="wwTechnologyCard" key={technology.name}>
              <span className="wwTechNumber">
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{technology.name}</strong>

              <h3>{technology.title}</h3>

              <p>{technology.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="wwProcess">
        <div className="wwSectionHeader">
          <div>
            <div className="wwSectionLabel">РЕАЛИЗАЦИЯ ПРОЕКТА</div>
            <h2>
              От исходных данных
              <br />
              до запуска.
            </h2>
          </div>

          <p>
            SUVSANOAT сопровождает проект на всех ключевых
            этапах реализации.
          </p>
        </div>

        <div className="wwProcessGrid">
          {stages.map((stage, index) => (
            <div className="wwProcessItem" key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{stage}</h3>

              {index < stages.length - 1 && (
                <b className="wwProcessArrow">→</b>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wwCTA">
        <div className="wwCTALabel">НАЧАТЬ ПРОЕКТ</div>

        <div className="wwCTAGrid">
          <h2>
            Нужен расчёт
            <br />
            очистных сооружений?
          </h2>

          <div className="wwCTARight">
            <p>
              Отправьте производительность объекта, техническое задание
              или анализы сточных вод. Подготовим предварительное
              инженерное решение.
            </p>

            <a href="/#contacts" className="wwCTABtn">
              ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ ПРЕДЛОЖЕНИЕ
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="wwFooter">
        <div className="wwFooterTop">
          <div className="wwFooterBrand">
            <a href="/" aria-label="SUVSANOAT — главная">
              <img src="/logo.png" alt="SUVSANOAT" />
            </a>

            <p>
              Инженерные системы очистки воды
              и сточных вод.
            </p>
          </div>

          <div className="wwFooterLinks">
            <span>НАВИГАЦИЯ</span>
            <a href="/">Главная</a>
            <a href="/#catalog">Каталог</a>
            <a href="/#solutions">Решения</a>
            <a href="/#technologies">Технологии</a>
            <a href="/#services">Услуги</a>
          </div>

          <div className="wwFooterContact">
            <span>СВЯЗАТЬСЯ</span>
            <a href="tel:+998773043400">
              +998 77 304 34 00
            </a>
            <a href="mailto:suvsanoat@gmail.com">
              suvsanoat@gmail.com
            </a>
          </div>
        </div>

        <div className="wwFooterBottom">
          <p>© 2026 SUVSANOAT. Все права защищены.</p>
          <p>WATER · WASTEWATER · ENGINEERING</p>
        </div>
      </footer>
    </main>
  );
}