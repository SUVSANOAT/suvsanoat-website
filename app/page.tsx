"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    image: "/main-wastewater.png",
    label: "ИНЖЕНЕРНЫЕ СИСТЕМЫ ВОДООЧИСТКИ",
    title: "Чистая вода.\nТочные решения.",
    text: "Проектирование, производство и поставка оборудования для очистки сточных вод и водоподготовки.",
  },
  {
    image: "/main-treatment-uzbekistan.png",
    label: "ПРОМЫШЛЕННЫЕ ОЧИСТНЫЕ СООРУЖЕНИЯ",
    title: "От проекта\nдо запуска.",
    text: "Комплексные очистные сооружения для промышленных, коммерческих и инфраструктурных объектов.",
  },
  {
    image: "/main-chlorination.png",
    label: "ДЕЗИНФЕКЦИЯ И ДОЗИРОВАНИЕ",
    title: "Точный контроль.\nНадёжная вода.",
    text: "Хлораторные установки, системы дозирования и автоматическое оборудование для обеззараживания воды.",
  },
];

const categories = [
  {
    number: "01",
    title: "Очистные сооружения",
    href: "/catalog/wastewater",
  },
  {
    number: "02",
    title: "Водоподготовка",
    href: "/catalog/water-treatment",
  },
  {
    number: "03",
    title: "Механическая очистка",
    href: "/catalog/mechanical-treatment",
  },
  {
    number: "04",
    title: "Насосное оборудование",
    href: "/catalog/pump-equipment",
  },
  {
    number: "05",
    title: "Дезинфекция и дозирование",
    href: "/catalog/disinfection-dosing",
  },
  {
    number: "06",
    title: "Обработка осадка",
    href: "/catalog/sludge-treatment",
  },
  {
    number: "07",
    title: "Аэрационное оборудование",
    href: "/catalog/aeration-equipment",
  },
  {
    number: "08",
    title: "Резервуары и ёмкости",
    href: "/catalog/tanks-reservoirs",
  },
  {
    number: "09",
    title: "Автоматизация",
    href: "/catalog/automation",
  },
  {
    number: "10",
    title: "Арматура и трубопроводы",
    href: "/catalog/valves-pipelines",
  },
  {
    number: "11",
    title: "Технологии очистки",
    href: "/catalog/treatment-technologies",
  },
  {
    number: "12",
    title: "Комплексные решения",
    href: "/catalog/integrated-solutions",
  },
];

const industries = [
  "Текстильные предприятия",
  "Пищевые производства",
  "Молочные предприятия",
  "Мясокомбинаты",
  "Птицефабрики",
  "Гостиницы и больницы",
  "Жилые комплексы",
  "Аэропорты",
];

const serviceSteps = [
  {
    number: "01",
    title: "Анализ",
    text: "Изучение исходных данных, состава воды и требований объекта.",
  },
  {
    number: "02",
    title: "Проектирование",
    text: "Подбор технологии и разработка инженерного решения.",
  },
  {
    number: "03",
    title: "Производство",
    text: "Изготовление и комплектация технологического оборудования.",
  },
  {
    number: "04",
    title: "Поставка",
    text: "Организация поставки оборудования непосредственно на объект.",
  },
  {
    number: "05",
    title: "Монтаж",
    text: "Монтаж оборудования и шеф-монтаж инженерных систем.",
  },
  {
    number: "06",
    title: "Пусконаладка",
    text: "Запуск системы, настройка процессов и обучение персонала.",
  },
  {
    number: "07",
    title: "Сервис",
    text: "Техническое обслуживание, диагностика и запасные части.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 550);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      objectType: formData.get("objectType"),
      capacity: formData.get("capacity"),
      message: formData.get("message"),
    };

    try {
      setFormLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ошибка отправки заявки");
      }

      form.reset();
      setFormSent(true);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <main>
      {/* HEADER */}
      <header className="header">
        <a href="#top" className="logo" aria-label="SUVSANOAT — на главную">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <nav className="nav">
          {/* CATALOG */}
          <div className="navDropdown catalogDropdown">
            <a href="#catalog" className="dropdownTrigger">
              Каталог <span>⌃</span>
            </a>

            <div className="catalogMegaMenu">
              {categories.map((item) => (
                <a href={item.href} key={item.number}>
                  <span>{item.number}</span>
                  <strong>{item.title}</strong>
                </a>
              ))}
            </div>
          </div>

          {/* SOLUTIONS */}
          <div className="navDropdown">
            <a href="#solutions" className="dropdownTrigger">
              Решения <span>⌃</span>
            </a>

            <div className="solutionsMegaMenu">
              <div className="solutionsMegaContent">
                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>01</span> ПРОМЫШЛЕННОСТЬ
                  </div>
                  <a href="#solutions">Текстильные предприятия</a>
                  <a href="#solutions">Пищевые производства</a>
                  <a href="#solutions">Молочные предприятия</a>
                  <a href="#solutions">Мясокомбинаты</a>
                  <a href="#solutions">Птицефабрики</a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>02</span> ИНФРАСТРУКТУРА
                  </div>
                  <a href="#solutions">Аэропорты</a>
                  <a href="#solutions">Гостиницы</a>
                  <a href="#solutions">Больницы</a>
                  <a href="#solutions">Торговые центры</a>
                  <a href="#solutions">Бизнес-центры</a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>03</span> ЖИЛЫЕ ОБЪЕКТЫ
                  </div>
                  <a href="#solutions">Жилые комплексы</a>
                  <a href="#solutions">Коттеджные поселки</a>
                  <a href="#solutions">Частные объекты</a>
                  <a href="#solutions">Коммерческие объекты</a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>04</span> СПЕЦИАЛЬНЫЕ РЕШЕНИЯ
                  </div>
                  <a href="#solutions">Повторное использование воды</a>
                  <a href="#solutions">Сложные промышленные стоки</a>
                  <a href="#solutions">Модернизация существующих КОС</a>
                  <a href="#solutions">Индивидуальное проектирование</a>
                </div>
              </div>

              <div className="megaCTA">
                <span className="megaCTALabel">
                  ИНДИВИДУАЛЬНОЕ РЕШЕНИЕ
                </span>

                <h3>
                  Не нашли
                  <br />
                  свою отрасль?
                </h3>

                <p>
                  Разработаем технологическое решение под состав сточных вод,
                  производительность и требования вашего объекта.
                </p>

                <a href="#contacts" className="megaButton">
                  Получить решение <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* TECHNOLOGIES */}
          <div className="navDropdown">
            <a href="#technologies" className="dropdownTrigger">
              Технологии <span>⌃</span>
            </a>

            <div className="technologyMegaMenu">
              <div className="technologyMegaContent">
                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>01</span> БИОЛОГИЧЕСКАЯ ОЧИСТКА
                  </div>

                  <a href="#technologies">
                    <strong>MBR</strong>
                    <small>Мембранный биореактор</small>
                  </a>
                  <a href="#technologies">
                    <strong>SBR</strong>
                    <small>Реактор периодического действия</small>
                  </a>
                  <a href="#technologies">
                    <strong>MBBR</strong>
                    <small>Биоплёночная технология</small>
                  </a>
                  <a href="#technologies">
                    <strong>A/O</strong>
                    <small>Аноксидно-аэробная очистка</small>
                  </a>
                  <a href="#technologies">
                    <strong>A²/O</strong>
                    <small>Удаление азота и фосфора</small>
                  </a>
                  <a href="#technologies">
                    <strong>ANBR</strong>
                    <small>Анаэробный биореактор</small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>02</span> МЕМБРАННЫЕ ТЕХНОЛОГИИ
                  </div>

                  <a href="#technologies">
                    <strong>UF</strong>
                    <small>Ультрафильтрация</small>
                  </a>
                  <a href="#technologies">
                    <strong>RO</strong>
                    <small>Обратный осмос</small>
                  </a>
                  <a href="#technologies">
                    <strong>MF</strong>
                    <small>Микрофильтрация</small>
                  </a>
                  <a href="#technologies">
                    <strong>Reuse</strong>
                    <small>Повторное использование воды</small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>03</span> ФИЗИКО-ХИМИЧЕСКАЯ ОЧИСТКА
                  </div>

                  <a href="#technologies">
                    <strong>DAF</strong>
                    <small>Напорная флотация</small>
                  </a>
                  <a href="#technologies">
                    <strong>Коагуляция</strong>
                    <small>Удаление загрязнений</small>
                  </a>
                  <a href="#technologies">
                    <strong>Флокуляция</strong>
                    <small>Укрупнение частиц</small>
                  </a>
                  <a href="#technologies">
                    <strong>Фильтрация</strong>
                    <small>Механическая доочистка</small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>04</span> ОБЕЗЗАРАЖИВАНИЕ
                  </div>

                  <a href="#technologies">
                    <strong>UV</strong>
                    <small>УФ-дезинфекция</small>
                  </a>
                  <a href="#technologies">
                    <strong>Хлорирование</strong>
                    <small>Дозирование гипохлорита</small>
                  </a>
                  <a href="#technologies">
                    <strong>Электролиз</strong>
                    <small>Получение гипохлорита натрия</small>
                  </a>
                  <a href="#technologies">
                    <strong>O₃</strong>
                    <small>Озонирование воды</small>
                  </a>
                </div>
              </div>

              <div className="megaCTA technologyCTA">
                <span className="megaCTALabel">ИНЖЕНЕРНЫЙ ПОДБОР</span>

                <h3>
                  Какая технология
                  <br />
                  нужна вашему объекту?
                </h3>

                <p>
                  Анализируем состав сточных вод, производительность и
                  требования к качеству очищенной воды.
                </p>

                <div className="technologyCTANumbers">
                  <div>
                    <strong>5–200 000</strong>
                    <span>м³/сутки</span>
                  </div>

                  <div>
                    <strong>10+</strong>
                    <span>технологий</span>
                  </div>
                </div>

                <a href="#contacts" className="megaButton">
                  Подобрать технологию <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#top">Проекты</a>

          {/* SERVICES */}
          <div className="navDropdown">
            <a href="#services" className="dropdownTrigger">
              Услуги <span>⌃</span>
            </a>

            <div className="servicesMegaMenu">
              <div className="servicesMegaContent">
                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>01</span> ИНЖИНИРИНГ
                  </div>
                  <a href="#services">Анализ исходных данных</a>
                  <a href="#services">Подбор технологии</a>
                  <a href="#services">Технологический расчёт</a>
                  <a href="#services">Проектирование</a>
                  <a href="#services">Подготовка спецификации</a>
                </div>

                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>02</span> РЕАЛИЗАЦИЯ
                  </div>
                  <a href="#services">Производство оборудования</a>
                  <a href="#services">Поставка оборудования</a>
                  <a href="#services">Монтаж</a>
                  <a href="#services">Шеф-монтаж</a>
                  <a href="#services">Пусконаладочные работы</a>
                </div>

                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>03</span> ПОСЛЕ ЗАПУСКА
                  </div>
                  <a href="#services">Гарантийное обслуживание</a>
                  <a href="#services">Сервисное обслуживание</a>
                  <a href="#services">Диагностика оборудования</a>
                  <a href="#services">Поставка запасных частей</a>
                  <a href="#services">Модернизация систем</a>
                </div>
              </div>

              <div className="megaCTA serviceCTA">
                <span className="megaCTALabel">
                  ЕСТЬ ТЕХНИЧЕСКОЕ ЗАДАНИЕ?
                </span>

                <h3>
                  Отправьте ТЗ —
                  <br />
                  подготовим решение.
                </h3>

                <p>
                  Изучим исходные данные, подберём технологию и оборудование,
                  подготовим предварительное техническое предложение.
                </p>

                <a href="#contacts" className="megaButton">
                  Отправить техническое задание <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#contacts">Контакты</a>

          <a href="#contacts" className="navContact">
            Получить расчёт
          </a>
        </nav>

        <button
          type="button"
          className={`mobileMenuButton ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`mobileMenuOverlay ${mobileMenuOpen ? "active" : ""}`}
          onClick={closeMobileMenu}
          aria-hidden={!mobileMenuOpen}
        />

        <aside
          className={`mobileMenu ${mobileMenuOpen ? "active" : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobileMenuTop">
            <span>МЕНЮ</span>
            <button
              type="button"
              className="mobileMenuClose"
              onClick={closeMobileMenu}
              aria-label="Закрыть меню"
            >
              ×
            </button>
          </div>

          <nav className="mobileMenuNav">
            <a href="#catalog" onClick={closeMobileMenu}><span>01</span>Каталог<b>→</b></a>
            <a href="#solutions" onClick={closeMobileMenu}><span>02</span>Решения<b>→</b></a>
            <a href="#technologies" onClick={closeMobileMenu}><span>03</span>Технологии<b>→</b></a>
            <a href="#top" onClick={closeMobileMenu}><span>04</span>Проекты<b>→</b></a>
            <a href="#services" onClick={closeMobileMenu}><span>05</span>Услуги<b>→</b></a>
            <a href="#contacts" onClick={closeMobileMenu}><span>06</span>Контакты<b>→</b></a>
          </nav>

          <a href="#contacts" className="mobileMenuCTA" onClick={closeMobileMenu}>
            Получить расчёт <span>→</span>
          </a>

          <div className="mobileMenuContacts">
            <a href="tel:+998773043400">+998 77 304 34 00</a>
            <a href="https://t.me/suvsanoat" target="_blank" rel="noopener noreferrer">
              Telegram @suvsanoat
            </a>
          </div>
        </aside>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`heroSlide ${
              currentSlide === index ? "active" : ""
            }`}
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(2,14,24,.96) 0%,
                  rgba(2,14,24,.72) 42%,
                  rgba(2,14,24,.12) 100%
                ),
                url("${slide.image}")
              `,
            }}
          />
        ))}

        <div className="heroContent">
          <div className="heroLabel">{slides[currentSlide].label}</div>

          <h1>
            {slides[currentSlide].title.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </h1>

          <p>{slides[currentSlide].text}</p>

          <div className="heroButtons">
            <a href="#catalog" className="button primaryButton">
              Смотреть каталог <span>→</span>
            </a>

            <a href="#contacts" className="button secondaryButton">
              Получить расчёт
            </a>
          </div>
        </div>

        <div className="sliderDots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`sliderDot ${
                currentSlide === index ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <strong>5–200 000</strong>
          <span>м³/сутки · ЛЮБОЙ МАСШТАБ</span>
          <p>
            От локальных установок до крупных промышленных очистных комплексов
          </p>
        </div>

        <div className="stat">
          <strong>ПОД КЛЮЧ</strong>
          <span>ПОЛНЫЙ ЦИКЛ</span>
          <p>Проектирование, производство, поставка, монтаж и запуск</p>
        </div>

        <div className="stat">
          <strong>ПОД ВАШ ОБЪЕКТ</strong>
          <span>ИНДИВИДУАЛЬНО</span>
          <p>Технология и оборудование под требования конкретного проекта</p>
        </div>

        <div className="stat">
          <strong>СЕРВИС</strong>
          <span>ПОСЛЕ ЗАПУСКА</span>
          <p>Техническое сопровождение, обслуживание и запасные части</p>
        </div>
      </section>

      {/* CATALOG */}
      <section className="catalogSection" id="catalog">
        <div className="sectionTop">
          <div>
            <div className="sectionLabel">КАТАЛОГ SUVSANOAT</div>

            <h2>
              Всё для воды.
              <br />
              В одной системе.
            </h2>
          </div>

          <p>
            Комплексное оборудование для очистки сточных вод, водоподготовки,
            насосных систем, автоматизации и промышленной инфраструктуры.
          </p>
        </div>

        <div className="catalogGrid">
          {categories.map((item) => (
            <a href={item.href} className="catalogCard" key={item.number}>
              <span className="catalogNumber">{item.number}</span>
              <h3>{item.title}</h3>
              <span className="catalogArrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="technologiesSection" id="technologies">
        <div className="sectionLabel light">ТЕХНОЛОГИИ SUVSANOAT</div>

        <div className="technologySectionHeader">
          <h2>
            Не одна технология.
            <br />
            Правильная технология.
          </h2>

          <p>
            Подбираем технологическую схему на основании состава сточных вод,
            производительности, требований к качеству очищенной воды и условий
            эксплуатации объекта.
          </p>
        </div>

        <div className="technologyCards">
          <article className="technologyCard">
            <span>01</span>
            <strong>MBR</strong>
            <h3>Мембранный биореактор</h3>
            <p>
              Высокая степень очистки и компактное размещение очистных
              сооружений.
            </p>
          </article>

          <article className="technologyCard">
            <span>02</span>
            <strong>SBR</strong>
            <h3>Последовательная очистка</h3>
            <p>
              Гибкая биологическая технология для коммунальных и промышленных
              стоков.
            </p>
          </article>

          <article className="technologyCard">
            <span>03</span>
            <strong>MBBR</strong>
            <h3>Биоплёночная технология</h3>
            <p>Устойчивая работа при изменяющейся органической нагрузке.</p>
          </article>

          <article className="technologyCard">
            <span>04</span>
            <strong>RO / UF</strong>
            <h3>Мембранная водоподготовка</h3>
            <p>Доочистка, водоподготовка и повторное использование воды.</p>
          </article>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="solutionsSection" id="solutions">
        <div className="sectionTop">
          <div>
            <div className="sectionLabel">РЕШЕНИЯ ПО ОТРАСЛЯМ</div>

            <h2>
              Решение начинается
              <br />
              с вашего объекта.
            </h2>
          </div>

          <p>
            Проектируем системы с учётом состава сточных вод, режима работы
            предприятия и требований к качеству очищенной воды.
          </p>
        </div>

        <div className="industryGrid">
          {industries.map((industry, index) => (
            <a href="#contacts" key={industry} className="industryCard">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{industry}</h3>
              <b>→</b>
            </a>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="servicesSection" id="services">
        <div className="servicesIntro">
          <div>
            <div className="sectionLabel">ПОЛНЫЙ ЦИКЛ РАБОТ</div>

            <h2>
              Один подрядчик.
              <br />
              Весь цикл проекта.
            </h2>
          </div>

          <p>
            От анализа исходных данных и разработки технологической схемы до
            поставки оборудования, запуска объекта и дальнейшего сервисного
            обслуживания.
          </p>
        </div>

        <div className="serviceProcess">
          {serviceSteps.map((step) => (
            <article className="serviceStep" key={step.number}>
              <div className="serviceStepTop">
                <span className="serviceStepNumber">{step.number}</span>
                <span className="serviceStepArrow">→</span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="servicesBottom">
          <div>
            <span className="servicesBottomLabel">НАЧАТЬ ПРОЕКТ</span>

            <h3>
              Есть техническое задание
              <br />
              или исходные данные?
            </h3>
          </div>

          <div className="servicesBottomRight">
            <p>
              Отправьте ТЗ, анализы воды или сточных вод, производительность и
              требования к объекту. Подготовим предварительное техническое
              решение.
            </p>

            <a href="#contacts" className="servicesBottomButton">
              Отправить техническое задание <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section className="contactSection" id="contacts">
        <div className="contactHeader">
          <div>
            <div className="sectionLabel">КОНТАКТЫ</div>

            <h2>
              Обсудим
              <br />
              ваш проект.
            </h2>
          </div>

          <div className="contactHeaderText">
            <p>
              Нужна очистка сточных вод, водоподготовка или подбор оборудования?
              Отправьте исходные данные — подготовим предварительное техническое
              решение.
            </p>
          </div>
        </div>

        <div className="contactMain">
          <div className="contactInformation">
            <div className="contactInfoItem">
              <span>ТЕЛЕФОН / TELEGRAM</span>
              <a href="tel:+998773043400">+998 77 304 34 00</a>
            </div>

            <div className="contactInfoItem">
              <span>E-MAIL</span>
              <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
            </div>

            <div className="contactInfoGrid">
              <div className="contactSmallItem">
                <span>РЕГИОН РАБОТЫ</span>

                <p>
                  Узбекистан
                  <br />
                  Страны СНГ
                  <br />
                  Международные проекты
                </p>
              </div>

              <div className="contactSmallItem">
                <span>НАПРАВЛЕНИЯ</span>

                <p>
                  Очистные сооружения
                  <br />
                  Водоподготовка
                  <br />
                  Промышленное оборудование
                  <br />
                  Инжиниринг
                </p>
              </div>
            </div>

            <div className="contactRequirements">
              <span className="contactRequirementsTitle">
                ДЛЯ ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА ДОСТАТОЧНО
              </span>

              <div className="requirement">
                <b>01</b>
                <p>Тип объекта</p>
              </div>

              <div className="requirement">
                <b>02</b>
                <p>Производительность, м³/сутки</p>
              </div>

              <div className="requirement">
                <b>03</b>
                <p>Анализы воды или сточных вод</p>
              </div>

              <div className="requirement">
                <b>04</b>
                <p>Требования к очищенной воде</p>
              </div>
            </div>
          </div>

          <div className="contactFormBox">
            <div className="contactFormTop">
              <span>ОТПРАВИТЬ ЗАЯВКУ</span>

              <h3>
                Получите предварительное
                <br />
                техническое решение.
              </h3>

              <p>
                Заполните основные данные об объекте. Наш специалист изучит
                информацию и свяжется с вами.
              </p>
            </div>

            {formSent ? (
              <div className="formSuccess">
                <div className="successIcon">✓</div>

                <span>ЗАЯВКА ОТПРАВЛЕНА</span>

                <h3>Спасибо за обращение.</h3>

                <p>
                  Ваша заявка успешно отправлена. Наш специалист изучит
                  информацию и свяжется с вами.
                </p>

                <button type="button" onClick={() => setFormSent(false)}>
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form className="contactForm" onSubmit={handleSubmit}>
                <div className="formRow">
                  <div className="formField">
                    <label>ИМЯ / КОМПАНИЯ *</label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Ваше имя или компания"
                      required
                    />
                  </div>

                  <div className="formField">
                    <label>ТЕЛЕФОН / TELEGRAM *</label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="+998"
                      required
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formField">
                    <label>ТИП ОБЪЕКТА</label>

                    <select name="objectType" defaultValue="">
                      <option value="" disabled>
                        Выберите объект
                      </option>
                      <option value="industrial">
                        Промышленное предприятие
                      </option>
                      <option value="textile">Текстильное предприятие</option>
                      <option value="food">Пищевое производство</option>
                      <option value="residential">Жилой комплекс</option>
                      <option value="hotel">Гостиница</option>
                      <option value="hospital">Больница</option>
                      <option value="airport">Аэропорт</option>
                      <option value="water">Водоподготовка</option>
                      <option value="other">Другой объект</option>
                    </select>
                  </div>

                  <div className="formField">
                    <label>ПРОИЗВОДИТЕЛЬНОСТЬ</label>

                    <input
                      type="text"
                      name="capacity"
                      placeholder="Например: 1500 м³/сутки"
                    />
                  </div>
                </div>

                <div className="formField fullField">
                  <label>КОММЕНТАРИЙ / ОПИСАНИЕ ЗАДАЧИ</label>

                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Кратко опишите задачу, требования или имеющиеся исходные данные..."
                  />
                </div>

                <div className="formHelp">
                  <span>МОЖНО ПОДГОТОВИТЬ</span>

                  <p>
                    Техническое задание · Анализы воды/стоков · Чертежи ·
                    Требования к качеству воды
                  </p>
                </div>

                <button
                  type="submit"
                  className="contactSubmit"
                  disabled={formLoading}
                >
                  <span>
                    {formLoading ? "ОТПРАВЛЯЕМ..." : "ОТПРАВИТЬ ЗАЯВКУ"}
                  </span>

                  <b>{formLoading ? "..." : "→"}</b>
                </button>

                <p className="contactPrivacy">
                  Нажимая кнопку, вы соглашаетесь на обработку предоставленных
                  данных.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="newFooter">
        <div className="footerTop">
          <div className="footerBrand">
            <a
              href="#top"
              className="footerLogo"
              aria-label="SUVSANOAT — вернуться на главную"
            >
              <img src="/logo.png" alt="SUVSANOAT" />
            </a>

            <p>
              Инженерные системы очистки воды
              <br />и сточных вод.
            </p>
          </div>

          <div className="footerNavigation">
            <span>НАВИГАЦИЯ</span>

            <a href="#catalog">Каталог</a>
            <a href="#solutions">Решения</a>
            <a href="#technologies">Технологии</a>
            <a href="#services">Услуги</a>
            <a href="#contacts">Контакты</a>
          </div>

          <div className="footerContacts">
            <span>СВЯЗАТЬСЯ</span>

            <a href="tel:+998773043400">+998 77 304 34 00</a>

            <a href="mailto:suvsanoat@gmail.com">
              suvsanoat@gmail.com
            </a>
          </div>
        </div>

        <div className="footerBottom">
          <p>© 2026 SUVSANOAT. Все права защищены.</p>
          <p>WATER · WASTEWATER · ENGINEERING</p>
        </div>
      </footer>

      {/* BACK TO TOP */}
      <button
        type="button"
        className={`backToTop ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Наверх"
      >
        <span className="backToTopArrow">↑</span>
        <span className="backToTopText">НАВЕРХ</span>
      </button>

      {/* FLOATING CONTACT */}
      <div className="floatingContact">
        <a
          href="https://t.me/suvsanoat"
          target="_blank"
          rel="noopener noreferrer"
          className="floatingContactButton floatingTelegram"
          aria-label="Написать SUVSANOAT в Telegram"
        >
          <span className="floatingIcon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21.7 3.3 18.6 20c-.2 1.2-.9 1.5-1.9.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.3 14 1.6 12.5c-1-.3-1-1 .2-1.5L20.2 3.9c.9-.3 1.7.2 1.5-.6Z"
              />
            </svg>
          </span>

          <span className="floatingText">
            <small>НАПИСАТЬ</small>
            <strong>Telegram</strong>
          </span>
        </a>

        <a
          href="tel:+998773043400"
          className="floatingContactButton floatingPhone"
          aria-label="Позвонить в SUVSANOAT"
        >
          <span className="floatingIcon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.6 10.8c1.7 3.3 3.3 4.9 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1.1.5 1.1 1.1V20c0 .6-.5 1.1-1.1 1.1C10.6 21.1 2.9 13.4 2.9 4c0-.6.5-1.1 1.1-1.1h3.3c.6 0 1.1.5 1.1 1.1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1.1l-2.1 2.2Z"
              />
            </svg>
          </span>

          <span className="floatingText">
            <small>ПОЗВОНИТЬ</small>
            <strong>+998 77 304 34 00</strong>
          </span>
        </a>
      </div>
    </main>
  );
}