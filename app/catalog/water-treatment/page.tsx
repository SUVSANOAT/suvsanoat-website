export default function WaterTreatmentPage() {
  const equipment = [
    {
      number: "01",
      title: "Обратный осмос",
      code: "RO",
      text: "Мембранные системы глубокой очистки и обессоливания воды для технологических и питьевых нужд.",
    },
    {
      number: "02",
      title: "Ультрафильтрация",
      code: "UF",
      text: "Удаление взвешенных веществ, коллоидов, бактерий и других загрязнений.",
    },
    {
      number: "03",
      title: "Умягчение воды",
      code: "SOFTENING",
      text: "Снижение жесткости воды и защита оборудования от образования накипи.",
    },
    {
      number: "04",
      title: "Фильтрация",
      code: "MEDIA",
      text: "Песчаные, угольные и мультимедийные фильтры для предварительной и глубокой очистки.",
    },
    {
      number: "05",
      title: "Обезжелезивание",
      code: "Fe / Mn",
      text: "Удаление железа, марганца и связанных с ними загрязнений из исходной воды.",
    },
    {
      number: "06",
      title: "Деминерализация",
      code: "DEMIN",
      text: "Получение воды с низким содержанием растворенных солей для промышленных процессов.",
    },
    {
      number: "07",
      title: "Ионообменные системы",
      code: "IX",
      text: "Коррекция ионного состава воды под требования конкретного технологического процесса.",
    },
    {
      number: "08",
      title: "Дозирование реагентов",
      code: "DOSING",
      text: "Автоматические системы приготовления и точного дозирования химических реагентов.",
    },
  ];

  const applications = [
    "Питьевое водоснабжение",
    "Промышленные предприятия",
    "Пищевые производства",
    "Котельные и энергетика",
    "Технологические линии",
    "Гостиницы и жилые комплексы",
    "Повторное использование воды",
    "Специальная водоподготовка",
  ];

  return (
    <main className="categoryPage">
      {/* HEADER */}
      <header className="categoryHeader">
        <a href="/" className="categoryLogo" aria-label="SUVSANOAT — главная">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <nav className="categoryNav">
          <a href="/">Главная</a>
          <a href="/#catalog">Каталог</a>
          <a href="/#solutions">Решения</a>
          <a href="/#technologies">Технологии</a>
          <a href="/#contacts" className="categoryContactButton">
            Получить расчёт
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="categoryHero waterTreatmentHero">
        <div className="categoryHeroImage">
          <img
            src="/water-treatment.png"
            alt="Промышленная система водоподготовки SUVSANOAT"
          />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">SUVSANOAT</a>
            <span>→</span>
            <a href="/#catalog">КАТАЛОГ</a>
            <span>→</span>
            <b>ВОДОПОДГОТОВКА</b>
          </div>

          <div className="categoryHeroLabel">
            ПРОМЫШЛЕННАЯ ВОДОПОДГОТОВКА
          </div>

          <h1>
            Вода нужного
            <br />
            качества.
          </h1>

          <p>
            Проектируем и поставляем комплексные системы водоподготовки
            для промышленности, питьевого водоснабжения и технологических
            процессов.
          </p>

          <div className="categoryHeroButtons">
            <a href="/#contacts" className="categoryPrimaryButton">
              Получить расчёт <span>→</span>
            </a>

            <a href="#equipment" className="categorySecondaryButton">
              Смотреть оборудование
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          <div>
            <strong>RO</strong>
            <span>Обратный осмос</span>
          </div>

          <div>
            <strong>UF</strong>
            <span>Ультрафильтрация</span>
          </div>

          <div>
            <strong>5–200 000</strong>
            <span>м³/сутки</span>
          </div>

          <div>
            <strong>ПОД КЛЮЧ</strong>
            <span>Полный цикл проекта</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <div className="categorySectionLabel">ВОДОПОДГОТОВКА</div>

        <div className="categoryIntroGrid">
          <h2>
            От исходной воды
            <br />
            до требуемых показателей.
          </h2>

          <div>
            <p>
              Качество воды напрямую влияет на технологические процессы,
              срок службы оборудования и качество конечной продукции.
            </p>

            <p>
              SUVSANOAT подбирает технологическую схему на основании
              анализа исходной воды, требуемой производительности
              и показателей воды на выходе.
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
              Комплексные системы
              <br />
              водоподготовки.
            </h2>
          </div>

          <p>
            От отдельных установок до полностью автоматизированных
            технологических линий.
          </p>
        </div>

        <div className="categoryEquipmentGrid">
          {equipment.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>{item.code}</b>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <a href="/#contacts">
                Получить расчёт <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <div className="categorySectionLabel light">
          ТЕХНОЛОГИЧЕСКАЯ СХЕМА
        </div>

        <div className="waterProcessHeader">
          <h2>
            Каждая система начинается
            <br />
            с анализа воды.
          </h2>

          <p>
            Технологическая цепочка определяется составом исходной воды
            и требованиями конкретного объекта.
          </p>
        </div>

        <div className="waterProcess">
          <div className="waterProcessStep">
            <span>01</span>
            <strong>ИСХОДНАЯ ВОДА</strong>
            <p>Скважина, водопровод, поверхностный источник</p>
          </div>

          <div className="waterProcessArrow">→</div>

          <div className="waterProcessStep">
            <span>02</span>
            <strong>АНАЛИЗ</strong>
            <p>Определение состава и основных показателей</p>
          </div>

          <div className="waterProcessArrow">→</div>

          <div className="waterProcessStep">
            <span>03</span>
            <strong>ПРЕДОЧИСТКА</strong>
            <p>Фильтрация и предварительная подготовка</p>
          </div>

          <div className="waterProcessArrow">→</div>

          <div className="waterProcessStep">
            <span>04</span>
            <strong>RO / UF / IX</strong>
            <p>Основная ступень технологической очистки</p>
          </div>

          <div className="waterProcessArrow">→</div>

          <div className="waterProcessStep">
            <span>05</span>
            <strong>ГОТОВАЯ ВОДА</strong>
            <p>Параметры воды согласно требованиям объекта</p>
          </div>
        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="categoryApplications">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">ПРИМЕНЕНИЕ</span>

            <h2>
              Решения для различных
              <br />
              отраслей.
            </h2>
          </div>

          <p>
            Конфигурация системы определяется назначением воды,
            производительностью и требованиями производства.
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
          <span>ПОЛУЧИТЬ ТЕХНИЧЕСКОЕ РЕШЕНИЕ</span>

          <h2>
            Нужна система
            <br />
            водоподготовки?
          </h2>
        </div>

        <div className="categoryCTARight">
          <p>
            Отправьте анализ исходной воды, требуемую производительность
            и показатели воды на выходе. Подберём технологию и подготовим
            предварительное техническое предложение.
          </p>

          <a href="/#contacts">
            Получить расчёт <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="categoryFooter">
        <div>
          <a href="/" className="categoryFooterLogo">
            <img src="/logo.png" alt="SUVSANOAT" />
          </a>

          <p>Инженерные системы очистки и подготовки воды.</p>
        </div>

        <div>
          <span>КОНТАКТЫ</span>
          <a href="tel:+998773043400">+998 77 304 34 00</a>
          <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
        </div>

        <div>
          <span>НАВИГАЦИЯ</span>
          <a href="/">Главная</a>
          <a href="/#catalog">Каталог</a>
          <a href="/#contacts">Получить расчёт</a>
        </div>
      </footer>
    </main>
  );
}