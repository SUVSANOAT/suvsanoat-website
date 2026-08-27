"use client";

import { Fragment } from "react";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { CategoryContentSet } from "./types";

/** Разбивает строку по \n и вставляет переносы */
function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

type Props = {
  content: CategoryContentSet;
  /** Картинка шапки, например "/aeration-equipment.png" */
  image: string;
};

export default function CategoryPage({ content, image }: Props) {
  const { t, language } = useLanguage();
  const c = content[language];

  return (
    <main className="categoryPage">
      {/* HEADER */}
      <header className="categoryHeader">
        <a href="/" className="categoryLogo" aria-label="SUVSANOAT">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <nav className="categoryNav">
          <a href="/#catalog">{t.nav.catalog}</a>
          <a href="/#solutions">{t.nav.solutions}</a>
          <a href="/#technologies">{t.nav.technologies}</a>
          <a href="/#services">{t.nav.services}</a>
          <a href="/#contacts">{t.nav.contacts}</a>

          <LanguageSwitcher />

          <a href="/#contacts" className="categoryContactButton">
            {t.nav.calculation}
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="categoryHero">
        <div className="categoryHeroImage">
          <img src={image} alt={c.breadcrumb} />
        </div>

        <div className="categoryHeroOverlay" />

        <div className="categoryHeroContent">
          <div className="categoryBreadcrumb">
            <a href="/">{t.category.home}</a>
            <span>/</span>
            <a href="/#catalog">{t.category.catalog}</a>
            <span>/</span>
            <b>{c.breadcrumb}</b>
          </div>

          <div className="categoryHeroLabel">{c.heroLabel}</div>

          <h1>{lines(c.heroTitle)}</h1>

          <p>{c.heroText}</p>

          <div className="categoryHeroButtons">
            <a href="#equipment" className="categoryPrimaryButton">
              {c.heroButton} <span>→</span>
            </a>

            <a href="/#contacts" className="categorySecondaryButton">
              {t.nav.calculation}
            </a>
          </div>
        </div>

        <div className="categoryHeroStats">
          {c.stats.map((stat) => (
            <div key={stat.value + stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="categoryIntro">
        <span className="categorySectionLabel">{c.introLabel}</span>

        <div className="categoryIntroGrid">
          <h2>{lines(c.introTitle)}</h2>

          <div>
            {c.introText.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="categoryEquipment" id="equipment">
        <div className="categorySectionHeader">
          <div>
            <span className="categorySectionLabel">{c.itemsLabel}</span>

            <h2>{lines(c.itemsTitle)}</h2>
          </div>

          <p>{c.itemsText}</p>
        </div>

        <div className="categoryEquipmentGrid">
          {c.items.map((item) => (
            <article className="categoryEquipmentCard" key={item.number}>
              <div className="categoryEquipmentTop">
                <span>{item.number}</span>
                <b>↗</b>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <a href="/#contacts">
                {c.itemsLink} <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="waterProcessSection">
        <span className="categorySectionLabel">{c.processLabel}</span>

        <div className="waterProcessHeader">
          <h2>{lines(c.processTitle)}</h2>

          <p>{c.processText}</p>
        </div>

        <div className="waterProcess">
          {c.process.map((step, index) => (
            <div key={step.number} style={{ display: "contents" }}>
              <article className="waterProcessStep">
                <span>{step.number}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </article>

              {index < c.process.length - 1 && (
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
              {c.applicationsLabel}
            </span>

            <h2>{lines(c.applicationsTitle)}</h2>
          </div>

          <p>{c.applicationsText}</p>
        </div>

        <div className="categoryApplicationGrid">
          {c.applications.map((item, index) => (
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
          <span>{c.ctaLabel}</span>

          <h2>{lines(c.ctaTitle)}</h2>
        </div>

        <div className="categoryCTARight">
          <p>{c.ctaText}</p>

          <a href="/#contacts">
            {c.ctaButton} <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="categoryFooter">
        <div>
          <a href="/" className="categoryFooterLogo" aria-label="SUVSANOAT">
            <img src="/logo.png" alt="SUVSANOAT" />
          </a>

          <p>{lines(t.footer.description)}</p>
        </div>

        <div>
          <span>{t.footer.navigation}</span>

          <a href="/#catalog">{t.nav.catalog}</a>
          <a href="/#solutions">{t.nav.solutions}</a>
          <a href="/#technologies">{t.nav.technologies}</a>
          <a href="/#services">{t.nav.services}</a>
          <a href="/#contacts">{t.nav.contacts}</a>
        </div>

        <div>
          <span>{t.footer.contact}</span>

          <a href="tel:+998773043400">+998 77 304 34 00</a>

          <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
        </div>
      </footer>
    </main>
  );
}
