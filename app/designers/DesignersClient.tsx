"use client";

import Image from "next/image";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import EquipIcon from "../components/EquipIcon";
import { TEXT as PRODUCTS_TEXT } from "../products/data";
import { DESIGNERS } from "./content";
import s from "../products/products.module.css";

/**
 * Страница «Проектировщикам»: расчётные основания, опросные листы,
 * порядок закладки оборудования в проект. Оформление — из ассортимента.
 */

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

export default function DesignersClient() {
  const { t, language } = useLanguage();
  const c = DESIGNERS[language];

  return (
    <main className={s.page}>
      <header className={s.header}>
        <a href="/" className={s.logo} aria-label="SUVSANOAT">
          <Image
            src="/logo.png"
            alt="SUVSANOAT"
            width={1536}
            height={864}
            priority
            sizes="200px"
          />
        </a>

        <nav className={s.nav}>
          <a href="/#catalog">{t.nav.catalog}</a>
          <a href="/products">{PRODUCTS_TEXT[language].navLabel}</a>
          <a href="/engineering">{t.nav.engineering}</a>
          <a href="/#contacts">{t.nav.contacts}</a>

          <LanguageSwitcher />

          <a href="/#contacts" className={s.navButton}>
            {t.nav.calculation}
          </a>
        </nav>
      </header>

      {/* ЗАГОЛОВОК */}
      <section className={s.top}>
        <div className={s.crumbs}>
          <a href="/">{t.category.home}</a>
          <span>/</span>
          <b>{c.label}</b>
        </div>

        <div className={s.label}>{c.label}</div>

        <h1>{lines(c.title)}</h1>

        <p className={s.tagline}>{c.intro}</p>
      </section>

      {/* РАЗБОР */}
      {c.sections.map((section, index) => (
        <section
          className={index % 2 ? s.section : `${s.section} ${s.sectionAlt}`}
          key={section.title}
        >
          <h2>{section.title}</h2>

          <div className={s.prose}>
            {section.text.map((paragraph, pIndex) => (
              <p key={pIndex}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {/* ОПРОСНЫЕ ЛИСТЫ */}
      <section className={s.section}>
        <h2>{c.downloadsTitle}</h2>

        <div className={s.prose}>
          <p>{c.downloadsText}</p>
        </div>

        <div className={s.limits} style={{ marginTop: 34 }}>
          {c.downloads.map((item) => (
            <div className={s.limitCard} key={item.code}>
              <strong>
                {item.code} — {item.title}
              </strong>
              <p>
                <a href={item.pdf} download style={{ color: "inherit" }}>
                  ⤓ {c.pdfLabel}
                </a>
                {"   ·   "}
                <a href={item.docx} download style={{ color: "inherit" }}>
                  ⤓ {c.docxLabel}
                </a>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* РАСЧЁТНЫЕ ОСНОВАНИЯ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <EquipIcon name="plan" className={s.topIcon} />

        <h2>{c.basisTitle}</h2>

        <div className={s.limits}>
          {c.basis.map((item) => (
            <div className={s.limitCard} key={item.q}>
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ВОПРОСЫ */}
      <section className={s.section}>
        <h2>{c.faqTitle}</h2>

        <div className={s.limits}>
          {c.faq.map((item) => (
            <div className={s.limitCard} key={item.q}>
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ЗАЯВКА */}
      <section className={s.cta}>
        <div className={s.ctaInner}>
          <h2>{lines(c.ctaTitle)}</h2>

          <div>
            <p>{c.ctaText}</p>

            <a className={s.ctaButton} href="/#contacts">
              {c.ctaButton}
            </a>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <span>{t.footer.copyright}</span>

        <div>
          <a href="tel:+998773043400">+998 77 304 34 00</a>
          {" · "}
          <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
        </div>
      </footer>
    </main>
  );
}
