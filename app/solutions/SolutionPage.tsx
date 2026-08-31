"use client";

import Image from "next/image";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import EquipIcon from "../components/EquipIcon";
import {
  TEXT as PRODUCTS_TEXT,
  LINE_ICON,
  LINE_SPECS,
  findModel,
  specValue,
} from "../products/data";
import type { SolutionContentSet } from "./types";
import s from "../products/products.module.css";

/**
 * Посадочная страница «под задачу»: жироуловитель для ресторана,
 * очистные для АЗС, ЛОС для дома. Оформление и данные моделей
 * берутся из ассортимента — здесь только текст под запрос.
 */

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

function useNum(language: string) {
  return (value: number) =>
    language === "en" || language === "zh"
      ? String(value)
      : String(value).replace(".", ",");
}

export default function SolutionPage({
  content,
}: {
  content: SolutionContentSet;
}) {
  const { t, language } = useLanguage();
  const c = content[language];
  const num = useNum(language);

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

      {/* РАЗБОР ЗАДАЧИ */}
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

      {/* ПОДБОР МОДЕЛИ */}
      <section className={s.section}>
        <h2>{c.pickTitle}</h2>

        <div className={s.prose}>
          <p>{c.pickText}</p>
        </div>

        <div className={s.modelGrid} style={{ marginTop: 34 }}>
          {c.picks.map((pick) => {
            const model = findModel(pick.slug);
            if (!model) return null;

            const main = LINE_SPECS[model.line].table[0];

            return (
              <a
                className={s.modelCard}
                href={`/products/${model.slug}`}
                key={model.slug}
              >
                <EquipIcon
                  name={LINE_ICON[model.line]}
                  className={s.modelIcon}
                />

                <b className={s.modelCode}>{model.code}</b>

                <span className={s.modelQ}>
                  {specValue(model, main, num, language)}
                </span>

                <div className={s.modelMini}>
                  <span>{pick.when}</span>
                  <span>{specValue(model, "size", num, language)}</span>
                </div>
              </a>
            );
          })}
        </div>

        <div className={s.priceBox} style={{ marginTop: 34 }}>
          <div>
            <span>{c.allTitle}</span>
            <p>{c.pickText}</p>
          </div>

          <a className={s.ctaButton} href={c.allHref}>
            {c.allButton}
          </a>
        </div>
      </section>

      {/* ВОПРОСЫ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
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

      {/* ГОРОДА И СМЕЖНЫЕ СТРАНИЦЫ */}
      {c.related && (
        <section className={s.section}>
          <h2>{c.related.title}</h2>

          <div className={s.prose}>
            <p>
              {c.related.links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 && " · "}
                  <a href={link.href}>{link.label}</a>
                </span>
              ))}
            </p>
          </div>
        </section>
      )}

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
