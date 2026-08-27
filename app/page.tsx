"use client";

import { useEffect, useState } from "react";
import { type Language } from "./translations";
import { useLanguage } from "./LanguageContext";

const slideImages = [
  "/main-wastewater.png",
  "/main-treatment-uzbekistan.png",
  "/main-chlorination.png",
];

const categoryLinks = [
  "/catalog/wastewater",
  "/catalog/water-treatment",
  "/catalog/mechanical-treatment",
  "/catalog/pump-equipment",
  "/catalog/disinfection-dosing",
  "/catalog/sludge-treatment",
  "/catalog/aeration-equipment",
  "/catalog/tanks-reservoirs",
  "/catalog/automation",
  "/catalog/valves-pipelines",
  "/catalog/treatment-technologies",
  "/catalog/integrated-solutions",
];

const categoryImages = [
  "/catalog/wastewater-treatment-real.png",
  "/catalog/water-treatment-real.png",
  "/catalog/mechanical-treatment-real.png",
  "/catalog/pump-equipment-real.png",
  "/catalog/disinfection-dosing-real.png",
  "/catalog/sludge-treatment-real.png",
  "/catalog/aeration-equipment-real.png",
  "/catalog/tanks-reservoirs-real.png",
  "/catalog/automation-real.png",
  "/catalog/valves-pipelines-real.png",
  "/catalog/treatment-technologies-real.png",
  "/catalog/integrated-solutions-real.png",
];

const processImages = [
  "/process/process-analysis-real.png",
  "/process/process-design.png",
  "/process/process-production.png",
  "/process/process-delivery.png",
  "/process/process-installation.png",
  "/process/process-commissioning.png",
  "/process/process-service.png",
];

const languageNames: Record<Language, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
  zh: "中文",
};

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const slides = t.hero.slides.map((slide, index) => ({
    ...slide,
    image: slideImages[index],
  }));

  const categories = t.categories.map((title, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title,
    href: categoryLinks[index],
    image: categoryImages[index],
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 550);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setCurrentSlide(0);
    setFormSent(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
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
        throw new Error(result.message || t.contacts.error);
      }

      form.reset();
      setFormSent(true);
    } catch (error) {
      console.error("Contact form error:", error);
      alert(t.contacts.error);
    } finally {
      setFormLoading(false);
    }
  }

  const lines = (text: string) =>
    text.split("\n").map((line, index, array) => (
      <span key={`${line}-${index}`}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ));

  return (
    <main>
      {/* HEADER */}
      <header className="header">
        <a
          href="#top"
          className="logo"
          aria-label="SUVSANOAT"
        >
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <a href="/engineering" className="engineeringNavButton">
          <span className="engineeringNavIcon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M8 10h32M8 24h32M8 38h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 5v10M32 19v10M22 33v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="10" r="3" fill="currentColor" />
              <circle cx="32" cy="24" r="3" fill="currentColor" />
              <circle cx="22" cy="38" r="3" fill="currentColor" />
            </svg>
          </span>
          <span className="engineeringNavText">
            <small>ENGINEERING</small>
            <strong>{t.nav.engineering}</strong>
          </span>
        </a>

        <nav className="nav">
          {/* CATALOG */}
          <div className="navDropdown catalogDropdown">
            <a
              href="#catalog"
              className="dropdownTrigger"
            >
              {t.nav.catalog} <span>⌃</span>
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
            <a
              href="#solutions"
              className="dropdownTrigger"
            >
              {t.nav.solutions} <span>⌃</span>
            </a>

            <div className="solutionsMegaMenu">
              <div className="solutionsMegaContent">
                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>01</span> {t.mega.industry}
                  </div>

                  <a href="#solutions">{t.mega.textile}</a>
                  <a href="#solutions">{t.mega.food}</a>
                  <a href="#solutions">{t.mega.dairy}</a>
                  <a href="#solutions">{t.mega.meat}</a>
                  <a href="#solutions">{t.mega.poultry}</a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>02</span> {t.mega.infrastructure}
                  </div>

                  <a href="#solutions">{t.mega.airports}</a>
                  <a href="#solutions">{t.mega.hotels}</a>
                  <a href="#solutions">{t.mega.hospitals}</a>
                  <a href="#solutions">{t.mega.shopping}</a>
                  <a href="#solutions">{t.mega.business}</a>
                  <a href="/solutions/car-wash">{t.mega.carWash}</a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>03</span> {t.mega.residential}
                  </div>

                  <a href="#solutions">
                    {t.mega.residentialComplex}
                  </a>

                  <a href="#solutions">{t.mega.cottage}</a>
                  <a href="#solutions">
                    {t.mega.privateObjects}
                  </a>

                  <a href="#solutions">
                    {t.mega.commercialObjects}
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>04</span> {t.mega.special}
                  </div>

                  <a href="#solutions">{t.mega.reuse}</a>

                  <a href="#solutions">
                    {t.mega.industrialWastewater}
                  </a>

                  <a href="#solutions">
                    {t.mega.modernization}
                  </a>

                  <a href="#solutions">
                    {t.mega.individualDesign}
                  </a>
                </div>
              </div>

              <div className="megaCTA">
                <span className="megaCTALabel">
                  {t.mega.individualLabel}
                </span>

                <h3>{lines(t.mega.individualTitle)}</h3>

                <p>{t.mega.individualText}</p>

                <a href="#contacts" className="megaButton">
                  {t.mega.individualButton} <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* TECHNOLOGIES */}
          <div className="navDropdown">
            <a
              href="#technologies"
              className="dropdownTrigger"
            >
              {t.nav.technologies} <span>⌃</span>
            </a>

            <div className="technologyMegaMenu">
              <div className="technologyMegaContent">
                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>01</span> {t.mega.biological}
                  </div>

                  <a href="#technologies">
                    <strong>MBR</strong>
                    <small>
                      {t.technologies.cards[0].title}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>SBR</strong>
                    <small>
                      {t.technologies.cards[1].title}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>MBBR</strong>
                    <small>
                      {t.technologies.cards[2].title}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>A/O</strong>
                    <small>
                      {language === "ru"
                        ? "Аноксидно-аэробная очистка"
                        : language === "uz"
                        ? "Anoksik-aerob tozalash"
                        : "Anoxic-aerobic treatment"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>A²/O</strong>
                    <small>
                      {language === "ru"
                        ? "Удаление азота и фосфора"
                        : language === "uz"
                        ? "Azot va fosforni olib tashlash"
                        : "Nitrogen and phosphorus removal"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>ANBR</strong>
                    <small>
                      {language === "ru"
                        ? "Анаэробный биореактор"
                        : language === "uz"
                        ? "Anaerob bioreaktor"
                        : "Anaerobic bioreactor"}
                    </small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>02</span> {t.mega.membrane}
                  </div>

                  <a href="#technologies">
                    <strong>UF</strong>
                    <small>
                      {language === "ru"
                        ? "Ультрафильтрация"
                        : language === "uz"
                        ? "Ultrafiltratsiya"
                        : "Ultrafiltration"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>RO</strong>
                    <small>
                      {language === "ru"
                        ? "Обратный осмос"
                        : language === "uz"
                        ? "Teskari osmos"
                        : "Reverse osmosis"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>MF</strong>
                    <small>
                      {language === "ru"
                        ? "Микрофильтрация"
                        : language === "uz"
                        ? "Mikrofiltratsiya"
                        : "Microfiltration"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>Reuse</strong>
                    <small>{t.mega.reuse}</small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>03</span>{" "}
                    {t.mega.physicalChemical}
                  </div>

                  <a href="#technologies">
                    <strong>DAF</strong>
                    <small>
                      {language === "ru"
                        ? "Напорная флотация"
                        : language === "uz"
                        ? "Bosimli flotatsiya"
                        : "Dissolved air flotation"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>
                      {language === "ru"
                        ? "Коагуляция"
                        : language === "uz"
                        ? "Koagulyatsiya"
                        : "Coagulation"}
                    </strong>

                    <small>
                      {language === "ru"
                        ? "Удаление загрязнений"
                        : language === "uz"
                        ? "Iflosliklarni olib tashlash"
                        : "Contaminant removal"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>
                      {language === "ru"
                        ? "Флокуляция"
                        : language === "uz"
                        ? "Flokulyatsiya"
                        : "Flocculation"}
                    </strong>

                    <small>
                      {language === "ru"
                        ? "Укрупнение частиц"
                        : language === "uz"
                        ? "Zarrachalarni yiriklashtirish"
                        : "Particle aggregation"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>
                      {language === "ru"
                        ? "Фильтрация"
                        : language === "uz"
                        ? "Filtratsiya"
                        : "Filtration"}
                    </strong>

                    <small>
                      {language === "ru"
                        ? "Механическая доочистка"
                        : language === "uz"
                        ? "Mexanik qo‘shimcha tozalash"
                        : "Mechanical polishing"}
                    </small>
                  </a>
                </div>

                <div className="megaGroup">
                  <div className="megaTitle">
                    <span>04</span> {t.mega.disinfection}
                  </div>

                  <a href="#technologies">
                    <strong>UV</strong>
                    <small>
                      {language === "ru"
                        ? "УФ-дезинфекция"
                        : language === "uz"
                        ? "UV dezinfeksiya"
                        : "UV disinfection"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>
                      {language === "ru"
                        ? "Хлорирование"
                        : language === "uz"
                        ? "Xlorlash"
                        : "Chlorination"}
                    </strong>

                    <small>
                      {language === "ru"
                        ? "Дозирование гипохлорита"
                        : language === "uz"
                        ? "Gipoxloritni dozalash"
                        : "Hypochlorite dosing"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>
                      {language === "ru"
                        ? "Электролиз"
                        : language === "uz"
                        ? "Elektroliz"
                        : "Electrolysis"}
                    </strong>

                    <small>
                      {language === "ru"
                        ? "Получение гипохлорита натрия"
                        : language === "uz"
                        ? "Natriy gipoxlorit olish"
                        : "Sodium hypochlorite generation"}
                    </small>
                  </a>

                  <a href="#technologies">
                    <strong>O₃</strong>
                    <small>
                      {language === "ru"
                        ? "Озонирование воды"
                        : language === "uz"
                        ? "Suvni ozonlash"
                        : "Water ozonation"}
                    </small>
                  </a>
                </div>
              </div>

              <div className="megaCTA technologyCTA">
                <span className="megaCTALabel">
                  {t.mega.engineeringSelection}
                </span>

                <h3>
                  {lines(t.mega.technologyQuestion)}
                </h3>

                <p>{t.mega.technologyText}</p>

                <div className="technologyCTANumbers">
                  <div>
                    <strong>5–200 000</strong>
                    <span>
                      m³/
                      {language === "ru"
                        ? "сутки"
                        : language === "uz"
                        ? "kun"
                        : "day"}
                    </span>
                  </div>

                  <div>
                    <strong>10+</strong>
                    <span>
                      {t.mega.technologiesCount}
                    </span>
                  </div>
                </div>

                <a href="#contacts" className="megaButton">
                  {t.mega.selectTechnology} <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#top">{t.nav.projects}</a>

          {/* SERVICES */}
          <div className="navDropdown">
            <a
              href="#services"
              className="dropdownTrigger"
            >
              {t.nav.services} <span>⌃</span>
            </a>

            <div className="servicesMegaMenu">
              <div className="servicesMegaContent">
                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>01</span> {t.mega.engineering}
                  </div>

                  <a href="#services">
                    {t.mega.sourceAnalysis}
                  </a>

                  <a href="#services">
                    {t.mega.technologySelection}
                  </a>

                  <a href="#services">
                    {t.mega.calculation}
                  </a>

                  <a href="#services">{t.mega.design}</a>

                  <a href="#services">
                    {t.mega.specification}
                  </a>
                </div>

                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>02</span> {t.mega.implementation}
                  </div>

                  <a href="#services">
                    {t.mega.production}
                  </a>

                  <a href="#services">
                    {t.mega.delivery}
                  </a>

                  <a href="#services">
                    {t.mega.installation}
                  </a>

                  <a href="#services">
                    {t.mega.supervision}
                  </a>

                  <a href="#services">
                    {t.mega.commissioning}
                  </a>
                </div>

                <div className="serviceMegaColumn">
                  <div className="serviceMegaTitle">
                    <span>03</span> {t.mega.afterLaunch}
                  </div>

                  <a href="#services">
                    {t.mega.warranty}
                  </a>

                  <a href="#services">
                    {t.mega.maintenance}
                  </a>

                  <a href="#services">
                    {t.mega.diagnostics}
                  </a>

                  <a href="#services">
                    {t.mega.spareParts}
                  </a>

                  <a href="#services">
                    {t.mega.modernizationSystems}
                  </a>
                </div>
              </div>

              <div className="megaCTA serviceCTA">
                <span className="megaCTALabel">
                  {t.mega.haveSpecification}
                </span>

                <h3>
                  {lines(t.mega.sendSpecificationTitle)}
                </h3>

                <p>{t.mega.sendSpecificationText}</p>

                <a href="#contacts" className="megaButton">
                  {t.mega.sendSpecification} <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#contacts">{t.nav.contacts}</a>

          {/* LANGUAGE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              padding: "3px",
              border:
                "1px solid rgba(255,255,255,.18)",
              borderRadius: "6px",
            }}
          >
            {(["ru", "uz", "en", "zh"] as Language[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeLanguage(item)}
                  style={{
                    border: 0,
                    borderRadius: "4px",
                    padding: "7px 8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 800,
                    background:
                      language === item
                        ? "#ffffff"
                        : "transparent",
                    color:
                      language === item
                        ? "#07141f"
                        : "#ffffff",
                  }}
                >
                  {languageNames[item]}
                </button>
              )
            )}
          </div>

          <a href="#contacts" className="navContact">
            {t.nav.calculation}
          </a>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className={`mobileMenuButton ${
            mobileMenuOpen ? "active" : ""
          }`}
          onClick={() =>
            setMobileMenuOpen((open) => !open)
          }
          aria-label={
            mobileMenuOpen
              ? t.nav.closeMenu
              : t.nav.menu
          }
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`mobileMenuOverlay ${
            mobileMenuOpen ? "active" : ""
          }`}
          onClick={closeMobileMenu}
        />

        <aside
          className={`mobileMenu ${
            mobileMenuOpen ? "active" : ""
          }`}
        >
          <div className="mobileMenuTop">
            <span>{t.nav.menu}</span>

            <button
              type="button"
              className="mobileMenuClose"
              onClick={closeMobileMenu}
            >
              ×
            </button>
          </div>

          {/* MOBILE LANGUAGE */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "14px 0 18px",
            }}
          >
            {(["ru", "uz", "en", "zh"] as Language[]).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => changeLanguage(item)}
                  style={{
                    minWidth: "48px",
                    border:
                      "1px solid rgba(255,255,255,.25)",
                    borderRadius: "4px",
                    padding: "9px 10px",
                    cursor: "pointer",
                    fontWeight: 800,
                    background:
                      language === item
                        ? "#ffffff"
                        : "transparent",
                    color:
                      language === item
                        ? "#07141f"
                        : "#ffffff",
                  }}
                >
                  {languageNames[item]}
                </button>
              )
            )}
          </div>

          <nav className="mobileMenuNav">
            <a href="#catalog" onClick={closeMobileMenu}>
              <span>01</span>
              {t.nav.catalog}
              <b>→</b>
            </a>

            <a href="#solutions" onClick={closeMobileMenu}>
              <span>02</span>
              {t.nav.solutions}
              <b>→</b>
            </a>

            <a
              href="#technologies"
              onClick={closeMobileMenu}
            >
              <span>03</span>
              {t.nav.technologies}
              <b>→</b>
            </a>

            <a href="#top" onClick={closeMobileMenu}>
              <span>04</span>
              {t.nav.projects}
              <b>→</b>
            </a>

            <a href="#services" onClick={closeMobileMenu}>
              <span>05</span>
              {t.nav.services}
              <b>→</b>
            </a>

            <a href="#contacts" onClick={closeMobileMenu}>
              <span>06</span>
              {t.nav.contacts}
              <b>→</b>
            </a>
          </nav>

          <a
            href="#contacts"
            className="mobileMenuCTA"
            onClick={closeMobileMenu}
          >
            {t.nav.calculation} <span>→</span>
          </a>

          <div className="mobileMenuContacts">
            <a href="tel:+998773043400">
              +998 77 304 34 00
            </a>

            <a
              href="https://t.me/suvsanoat"
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram @suvsanoat
            </a>
          </div>
        </aside>
      
        <style jsx>{`

  .engineeringNavButton {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 270px;
    min-height: 52px;
    box-sizing: border-box;
    padding: 6px 12px;
    margin-left: -18px;
    text-decoration: none;
    color: #fff;
    background: linear-gradient(135deg, rgba(9, 35, 49, 0.98), rgba(5, 23, 34, 0.96));
    border: 1px solid rgba(22, 191, 255, 0.65);
    border-radius: 7px;
    box-shadow: 0 0 0 1px rgba(22, 191, 255, 0.05), 0 8px 25px rgba(0, 0, 0, 0.18);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  }

  .engineeringNavButton:hover {
    transform: translateY(-2px);
    border-color: #16bfff;
    background: linear-gradient(135deg, rgba(10, 48, 65, 1), rgba(6, 28, 40, 1));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 25px rgba(22, 191, 255, 0.14);
  }

  .engineeringNavIcon {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    display: grid;
    place-items: center;
    color: #16bfff;
    background: rgba(22, 191, 255, 0.08);
    border: 1px solid rgba(22, 191, 255, 0.3);
  }

  .engineeringNavIcon svg {
    width: 25px;
    height: 25px;
  }

  .engineeringNavText {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    min-width: 0;
  }

  .engineeringNavText small {
    color: #16bfff;
    font-size: 8px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 0.18em;
  }

  .engineeringNavText strong {
    color: #fff;
    font-size: 14px;
    line-height: 1.1;
    font-weight: 800;
    white-space: nowrap;
  }

  .engineeringNavArrow {
    margin-left: auto;
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    color: #06151d;
    background: #16bfff;
    font-size: 17px;
    font-weight: 900;
    transition: transform 0.25s ease;
  }

  @media (max-width: 1250px) {
    .engineeringNavButton {
      width: 230px;
      margin-left: -12px;
    }
    .engineeringNavText strong {
      font-size: 12px;
    }
  }

  @media (max-width: 1050px) {
    .engineeringNavButton {
      width: 210px;
      margin-left: -8px;
    }
    .engineeringNavIcon {
      width: 32px;
      height: 32px;
      flex-basis: 32px;
    }
    .engineeringNavText strong {
      font-size: 11px;
    }
  }

        `}</style>
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
          <div className="heroLabel">
            {slides[currentSlide].label}
          </div>

          <h1>
            {lines(slides[currentSlide].title)}
          </h1>

          <p>{slides[currentSlide].text}</p>

          <div className="heroButtons">
            <a
              href="#catalog"
              className="button primaryButton"
            >
              {t.hero.catalogButton} <span>→</span>
            </a>

            <a
              href="#contacts"
              className="button secondaryButton"
            >
              {t.hero.calculationButton}
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
              aria-label={`${t.hero.slide} ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        {t.stats.map((item, index) => (
          <div className="stat" key={index}>
            <strong>{item.strong}</strong>
            <span>{item.label}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      {/* CATALOG */}
      <section className="catalogSection" id="catalog">
        <div className="sectionTop">
          <div>
            <div className="sectionLabel">
              {t.catalog.label}
            </div>

            <h2>{lines(t.catalog.title)}</h2>
          </div>

          <p>{t.catalog.text}</p>
        </div>

        <div className="catalogGrid">
          {categories.map((item, index) => (
            <a
              href={item.href}
              className="catalogCard catalogCardWithImage"
              key={item.number}
            >
              <img
                src={item.image}
                alt={item.title}
                className="catalogCardImage"
              />

              <span className="catalogNumber">
                {item.number}
              </span>

              <h3>{item.title}</h3>

              <span className="catalogArrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section
        className="technologiesSection"
        id="technologies"
      >
        <div className="sectionLabel light">
          {t.technologies.label}
        </div>

        <div className="technologySectionHeader">
          <h2>{lines(t.technologies.title)}</h2>
          <p>{t.technologies.text}</p>
        </div>

        <div className="technologyCards">
          {t.technologies.cards.map((card, index) => (
            <article
              className="technologyCard"
              key={card.code}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{card.code}</strong>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section
        className="solutionsSection"
        id="solutions"
      >
        <div className="sectionTop">
          <div>
            <div className="sectionLabel">
              {t.solutions.label}
            </div>

            <h2>{lines(t.solutions.title)}</h2>
          </div>

          <p>{t.solutions.text}</p>
        </div>

        <div className="industryGrid">
          {t.solutions.industries.map(
            (industry, index) => (
              <a
                href="#contacts"
                className="industryCard"
                key={`${industry}-${index}`}
              >
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{industry}</h3>
                <b>→</b>
              </a>
            )
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section
        className="servicesSection"
        id="services"
      >
        <div className="servicesIntro">
          <div>
            <div className="sectionLabel">
              {t.services.label}
            </div>

            <h2>{lines(t.services.title)}</h2>
          </div>

          <p>{t.services.text}</p>
        </div>

        <div className="serviceProcess">
          {t.services.steps.map((step, index) => (
            <article
              className="serviceStep"
              key={index}
            >
              <img
                src={processImages[index]}
                alt={step.title}
                className="serviceStepImage"
              />

              <div className="serviceStepTop">
                <span className="serviceStepNumber">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="serviceStepArrow">
                  →
                </span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="servicesBottom">
          <div>
            <span className="servicesBottomLabel">
              {t.services.bottomLabel}
            </span>

            <h3>
              {lines(t.services.bottomTitle)}
            </h3>
          </div>

          <div className="servicesBottomRight">
            <p>{t.services.bottomText}</p>

            <a
              href="#contacts"
              className="servicesBottomButton"
            >
              {t.services.bottomButton} <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section
        className="contactSection"
        id="contacts"
      >
        <div className="contactHeader">
          <div>
            <div className="sectionLabel">
              {t.contacts.label}
            </div>

            <h2>{lines(t.contacts.title)}</h2>
          </div>

          <div className="contactHeaderText">
            <p>{t.contacts.intro}</p>
          </div>
        </div>

        <div className="contactMain">
          <div className="contactInformation">
            <div className="contactInfoItem">
              <span>{t.contacts.phone}</span>

              <a href="tel:+998773043400">
                +998 77 304 34 00
              </a>
            </div>

            <div className="contactInfoItem">
              <span>{t.contacts.email}</span>

              <a href="mailto:suvsanoat@gmail.com">
                suvsanoat@gmail.com
              </a>
            </div>

            <div className="contactInfoGrid">
              <div className="contactSmallItem">
                <span>{t.contacts.workRegion}</span>

                <p>
                  {t.contacts.regions.map(
                    (item, index) => (
                      <span key={item}>
                        {item}

                        {index <
                          t.contacts.regions.length -
                            1 && <br />}
                      </span>
                    )
                  )}
                </p>
              </div>

              <div className="contactSmallItem">
                <span>{t.contacts.directions}</span>

                <p>
                  {t.contacts.directionItems.map(
                    (item, index) => (
                      <span key={item}>
                        {item}

                        {index <
                          t.contacts.directionItems
                            .length -
                            1 && <br />}
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>

            <div className="contactRequirements">
              <span className="contactRequirementsTitle">
                {t.contacts.requirementsTitle}
              </span>

              {t.contacts.requirements.map(
                (item, index) => (
                  <div
                    className="requirement"
                    key={item}
                  >
                    <b>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </b>

                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* FORM */}
          <div className="contactFormBox">
            <div className="contactFormTop">
              <span>{t.contacts.formLabel}</span>

              <h3>
                {lines(t.contacts.formTitle)}
              </h3>

              <p>{t.contacts.formText}</p>
            </div>

            {formSent ? (
              <div className="formSuccess">
                <div className="successIcon">✓</div>

                <span>
                  {t.contacts.successLabel}
                </span>

                <h3>{t.contacts.successTitle}</h3>

                <p>{t.contacts.successText}</p>

                <button
                  type="button"
                  onClick={() => setFormSent(false)}
                >
                  {t.contacts.sendAgain}
                </button>
              </div>
            ) : (
              <form
                className="contactForm"
                onSubmit={handleSubmit}
              >
                <div className="formRow">
                  <div className="formField">
                    <label>
                      {t.contacts.nameLabel}
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder={
                        t.contacts.namePlaceholder
                      }
                      required
                    />
                  </div>

                  <div className="formField">
                    <label>
                      {t.contacts.phoneLabel}
                    </label>

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
                    <label>
                      {t.contacts.objectLabel}
                    </label>

                    <select
                      name="objectType"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {t.contacts.objectPlaceholder}
                      </option>

                      <option value="industrial">
                        {
                          t.contacts.objectTypes
                            .industrial
                        }
                      </option>

                      <option value="textile">
                        {t.contacts.objectTypes.textile}
                      </option>

                      <option value="food">
                        {t.contacts.objectTypes.food}
                      </option>

                      <option value="residential">
                        {
                          t.contacts.objectTypes
                            .residential
                        }
                      </option>

                      <option value="hotel">
                        {t.contacts.objectTypes.hotel}
                      </option>

                      <option value="hospital">
                        {
                          t.contacts.objectTypes
                            .hospital
                        }
                      </option>

                      <option value="airport">
                        {
                          t.contacts.objectTypes
                            .airport
                        }
                      </option>

                      <option value="water">
                        {t.contacts.objectTypes.water}
                      </option>

                      <option value="other">
                        {t.contacts.objectTypes.other}
                      </option>
                    </select>
                  </div>

                  <div className="formField">
                    <label>
                      {t.contacts.capacityLabel}
                    </label>

                    <input
                      type="text"
                      name="capacity"
                      placeholder={
                        t.contacts
                          .capacityPlaceholder
                      }
                    />
                  </div>
                </div>

                <div className="formField fullField">
                  <label>
                    {t.contacts.messageLabel}
                  </label>

                  <textarea
                    name="message"
                    rows={5}
                    placeholder={
                      t.contacts.messagePlaceholder
                    }
                  />
                </div>

                <div className="formHelp">
                  <span>{t.contacts.canPrepare}</span>

                  <p>
                    {t.contacts.canPrepareText}
                  </p>
                </div>

                <button
                  type="submit"
                  className="contactSubmit"
                  disabled={formLoading}
                >
                  <span>
                    {formLoading
                      ? t.contacts.submitting
                      : t.contacts.submit}
                  </span>

                  <b>
                    {formLoading ? "..." : "→"}
                  </b>
                </button>

                <p className="contactPrivacy">
                  {t.contacts.privacy}
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
              aria-label="SUVSANOAT"
            >
              <img
                src="/logo.png"
                alt="SUVSANOAT"
              />
            </a>

            <p>{lines(t.footer.description)}</p>
          </div>

          <div className="footerNavigation">
            <span>{t.footer.navigation}</span>

            <a href="#catalog">
              {t.nav.catalog}
            </a>

            <a href="#solutions">
              {t.nav.solutions}
            </a>

            <a href="#technologies">
              {t.nav.technologies}
            </a>

            <a href="#services">
              {t.nav.services}
            </a>

            <a href="#contacts">
              {t.nav.contacts}
            </a>
          </div>

          <div className="footerContacts">
            <span>{t.footer.contact}</span>

            <a href="tel:+998773043400">
              +998 77 304 34 00
            </a>

            <a href="mailto:suvsanoat@gmail.com">
              suvsanoat@gmail.com
            </a>
          </div>
        </div>

        <div className="footerBottom">
          <p>{t.footer.copyright}</p>
          <p>{t.footer.slogan}</p>
        </div>
      </footer>

      {/* BACK TO TOP */}
      <button
        type="button"
        className={`backToTop ${
          showBackToTop ? "visible" : ""
        }`}
        onClick={scrollToTop}
        aria-label={t.floating.top}
      >
        <span className="backToTopArrow">↑</span>

        <span className="backToTopText">
          {t.floating.top}
        </span>
      </button>

      {/* FLOATING CONTACT */}
      <div className="floatingContact">
        <a
          href="https://t.me/suvsanoat"
          target="_blank"
          rel="noopener noreferrer"
          className="floatingContactButton floatingTelegram"
          aria-label="Telegram SUVSANOAT"
        >
          <span className="floatingIcon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M21.7 3.3 18.6 20c-.2 1.2-.9 1.5-1.9.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.3 14 1.6 12.5c-1-.3-1-1 .2-1.5L20.2 3.9c.9-.3 1.7.2 1.5-.6Z"
              />
            </svg>
          </span>

          <span className="floatingText">
            <small>{t.floating.write}</small>
            <strong>Telegram</strong>
          </span>
        </a>

        <a
          href="tel:+998773043400"
          className="floatingContactButton floatingPhone"
          aria-label="+998 77 304 34 00"
        >
          <span className="floatingIcon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M6.6 10.8c1.7 3.3 3.3 4.9 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1.1.5 1.1 1.1V20c0 .6-.5 1.1-1.1 1.1C10.6 21.1 2.9 13.4 2.9 4c0-.6.5-1.1 1.1-1.1h3.3c.6 0 1.1.5 1.1 1.1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1.1l-2.1 2.2Z"
              />
            </svg>
          </span>

          <span className="floatingText">
            <small>{t.floating.call}</small>

            <strong>
              +998 77 304 34 00
            </strong>
          </span>
        </a>
      </div>
    </main>
  );
}
