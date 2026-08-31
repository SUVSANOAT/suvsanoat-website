"use client";

import Image from "next/image";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import EquipIcon from "../components/EquipIcon";
import {
  MODELS,
  TEXT,
  LINE_ICON,
  LINE_SPECS,
  specValue,
  type LineKey,
} from "./data";
import type { LineContentSet } from "./lineTypes";
import s from "./products.module.css";

/**
 * Страница одного модельного ряда: текст под поисковый запрос плюс
 * карточки и сводная таблица всех моделей линейки из ассортимента.
 */

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

/** Десятичный разделитель: запятая для ru и uz, точка для en и zh */
function useNum(language: string) {
  return (value: number) =>
    language === "en" || language === "zh"
      ? String(value)
      : String(value).replace(".", ",");
}

export default function LinePage({
  line,
  content,
}: {
  line: LineKey;
  content: LineContentSet;
}) {
  const { t, language } = useLanguage();
  const c = content[language];
  const p = TEXT[language];
  const lineText = p.lines[line];
  const num = useNum(language);

  const models = MODELS.filter((model) => model.line === line);
  const columns = LINE_SPECS[line].table;

  /* Линейка может переопределить подписи характеристик */
  const L = (field: keyof typeof p.specLabels) =>
    lineText.labels?.[field] ?? p.specLabels[field];

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
          <a href="/products">{p.navLabel}</a>
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
          <a href="/products">{p.label}</a>
          <span>/</span>
          <b>{c.label}</b>
        </div>

        <EquipIcon name={LINE_ICON[line]} className={s.topIcon} />

        <div className={s.label}>{c.label}</div>

        <h1>{lines(c.title)}</h1>

        <p className={s.tagline}>{c.intro}</p>
      </section>

      {/* РАЗБОР: как подбирается, из чего сделано, что входит */}
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

      {/* МОДЕЛЬНЫЙ РЯД */}
      <section className={s.section} id={line}>
        <h2>{lineText.name}</h2>

        <div className={s.prose}>
          <p>{lineText.tagline}</p>
        </div>

        <div className={s.modelGrid} style={{ marginTop: 34 }}>
          {models.map((model) => (
            <a
              className={s.modelCard}
              href={`/products/${model.slug}`}
              key={model.slug}
            >
              <EquipIcon name={LINE_ICON[line]} className={s.modelIcon} />

              <b className={s.modelCode}>{model.code}</b>

              <span className={s.modelQ}>
                {specValue(model, columns[0], num, language)}
                {model.ns !== undefined &&
                  ` · ${specValue(model, "q", num, language)}`}
              </span>

              <div className={s.modelMini}>
                <span>{specValue(model, "size", num, language)}</span>
                <span>
                  {L("volumeGross")}: {num(model.volumeGross)} м³
                </span>
                <span>DN{model.dn}</span>
              </div>
            </a>
          ))}
        </div>

        <h2 style={{ marginTop: 70, fontSize: 26 }}>{lineText.tableTitle}</h2>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>{lineText.modelWord}</th>
                {columns.map((field) => (
                  <th key={field}>{L(field)}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {models.map((model) => (
                <tr key={model.slug}>
                  <td>
                    <a href={`/products/${model.slug}`}>{model.code}</a>
                  </td>

                  {columns.map((field) => (
                    <td key={field}>
                      {specValue(model, field, num, language) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={s.priceBox} style={{ marginTop: 34 }}>
          <div>
            <span>{lineText.priceLabel}</span>
            <p>{lineText.priceText}</p>
          </div>

          <a className={s.ctaButton} href="/#contacts">
            {lineText.ctaButton}
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

      {/* СМЕЖНЫЕ СТРАНИЦЫ */}
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
