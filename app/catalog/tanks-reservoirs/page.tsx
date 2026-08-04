export default function TanksReservoirsPage() {
  const equipment = [
    {
      number: "01",
      title: "Стальные резервуары",
      text: "Промышленные резервуары из углеродистой и нержавеющей стали для воды, сточных вод и технологических растворов.",
    },
    {
      number: "02",
      title: "Стеклопластиковые ёмкости",
      text: "Коррозионностойкие горизонтальные и вертикальные ёмкости для водоподготовки и очистных сооружений.",
    },
    {
      number: "03",
      title: "PE / PP ёмкости",
      text: "Полимерные резервуары для хранения воды, реагентов и технологических жидкостей.",
    },
    {
      number: "04",
      title: "Накопительные резервуары",
      text: "Ёмкости для накопления, усреднения и временного хранения воды и производственных стоков.",
    },
    {
      number: "05",
      title: "Резервуары-усреднители",
      text: "Технологические ёмкости для выравнивания расхода и состава сточных вод перед последующими этапами очистки.",
    },
    {
      number: "06",
      title: "Реагентные ёмкости",
      text: "Резервуары для приготовления и хранения коагулянтов, флокулянтов, гипохлорита и других реагентов.",
    },
    {
      number: "07",
      title: "Подземные резервуары",
      text: "Компактное размещение накопительных и технологических ёмкостей с возможностью подземного монтажа.",
    },
    {
      number: "08",
      title: "Комплектные резервуары",
      text: "Ёмкости с лестницами, площадками, трубопроводами, датчиками уровня, насосами и системой автоматизации.",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Назначение",
      text: "Определяем функцию резервуара и характеристики хранимой среды.",
    },
    {
      number: "02",
      title: "Расчёт объёма",
      text: "Рассчитываем рабочий и полный объём с учётом режима эксплуатации объекта.",
    },
    {
      number: "03",
      title: "Выбор материала",
      text: "Подбираем сталь, нержавеющую сталь, стеклопластик, PE или PP.",
    },
    {
      number: "04",
      title: "Комплектация",
      text: "Определяем патрубки, лестницы, площадки, датчики, насосы и трубопроводы.",
    },
    {
      number: "05",
      title: "Поставка",
      text: "Изготавливаем или комплектуем резервуар и подготавливаем его к монтажу на объекте.",
    },
  ];

  const applications = [
    "Очистные сооружения",
    "Системы водоподготовки",
    "Промышленные предприятия",
    "Накопление сточных вод",
    "Усреднение стоков",
    "Хранение чистой воды",
    "Реагентное хозяйство",
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
            src="/tanks-reservoirs.png"
            alt="Промышленные резервуары и ёмкости SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">ГЛАВНАЯ</a>
            <span>/</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>/</span>
            <b>РЕЗЕРВУАРЫ И ЁМКОСТИ</b>
          </div>

          <div className="categoryHeroLabel">
            08 · РЕЗЕРВУАРЫ И ЁМКОСТИ
          </div>

          <h1>
            Нужный объём.
            <br />
            Надёжное хранение.
          </h1>

          <p>
            Промышленные резервуары и технологические ёмкости для воды,
            сточных вод, реагентов и технологических процессов.
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
            <strong>3–200+ м³</strong>
            <span>различные объёмы</span>
          </div>

          <div>
            <strong>5 МАТЕРИАЛОВ</strong>
            <span>под условия эксплуатации</span>
          </div>

          <div>
            <strong>КОМПЛЕКТАЦИЯ</strong>
            <span>арматура · датчики · насосы</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>расчёт · поставка · монтаж</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">
          ПРОМЫШЛЕННЫЕ РЕЗЕРВУАРЫ
        </span>

        <div className="categoryIntroGrid">
          <h2>
            Ёмкость —
            <br />
            часть технологии.
          </h2>

          <div>
            <p>
              Резервуар в системе водоочистки выполняет не только функцию
              хранения. Он может использоваться для накопления, усреднения,
              приготовления реагентов и организации технологических процессов.
            </p>

            <p>
              SUVSANOAT подбирает объём, материал и комплектацию ёмкости
              в зависимости от состава среды, назначения, температуры,
              условий размещения и требований конкретного объекта.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">РЕЗЕРВУАРЫ И ЁМКОСТИ</span>

            <h2>
              От хранения
              <br />
              до технологического процесса.
            </h2>
          </div>

          <p>
            Подбираем резервуары для новых объектов и модернизации
            существующих систем водоснабжения, водоподготовки
            и очистки сточных вод.
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
            От назначения
            <br />
            до готовой ёмкости.
          </h2>

          <p>
            Конструкция резервуара определяется не только объёмом.
            Учитываем свойства среды, режим эксплуатации, размещение,
            материал и необходимое технологическое оснащение.
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
              Для воды,
              <br />
              стоков и реагентов.
            </h2>
          </div>

          <p>
            Резервуары интегрируются в технологическую схему объекта
            и комплектуются необходимыми патрубками, арматурой,
            измерительными приборами и вспомогательным оборудованием.
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
          <span>РАСЧЁТ РЕЗЕРВУАРА</span>

          <h2>
            Подберём объём
            <br />
            и конструкцию.
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте назначение резервуара, требуемый объём, характеристики
            жидкости и условия размещения. Подберём материал, конструкцию
            и необходимую комплектацию.
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