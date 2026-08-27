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
import { SOLUTION_LINKS } from "../solutions/nav";
import s from "./products.module.css";

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

const SOLUTIONS_TITLE: Record<string, string> = {
  ru: "Решения под задачу",
  uz: "Vazifaga mos yechimlar",
  en: "Solutions by task",
  zh: "按任务选方案",
};

export default function ProductsIndex() {
  const { t, language } = useLanguage();
  const c = TEXT[language];
  const num = useNum(language);

  const lineKeys = Object.keys(c.lines) as LineKey[];

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
          <a href="/products">{c.navLabel}</a>
          <a href="/#technologies">{t.nav.technologies}</a>
          <a href="/engineering">{t.nav.engineering}</a>
          <a href="/#contacts">{t.nav.contacts}</a>

          <LanguageSwitcher />

          <a href="/#contacts" className={s.navButton}>
            {t.nav.calculation}
          </a>
        </nav>
      </header>

      <section className={s.top}>
        <div className={s.crumbs}>
          <a href="/">{t.category.home}</a>
          <span>/</span>
          <b>{c.label}</b>
        </div>

        <div className={s.label}>{c.label}</div>

        <h1>{lines(c.title)}</h1>

        <p className={s.tagline}>{c.intro}</p>

        {/* Переход к линейке: список растёт, якоря удобнее прокрутки */}
        <div className={s.lineNav}>
          {lineKeys.map((key) => {
            const models = MODELS.filter((model) => model.line === key);

            /* Диапазон линейки по её главному параметру: первая колонка
               сводной таблицы. У сепараторов это л/с, у резервуаров м³. */
            const main = LINE_SPECS[key].table[0];
            const from = models[0]
              ? specValue(models[0], main, num, language)
              : null;
            const to = models[models.length - 1]
              ? specValue(models[models.length - 1], main, num, language)
              : null;

            return (
              <a className={s.lineChip} href={`#${key}`} key={key}>
                <EquipIcon name={LINE_ICON[key]} className={s.lineChipIcon} />

                <span>
                  <b>{c.lines[key].name}</b>
                  <i>
                    {from} — {to}
                  </i>
                </span>
              </a>
            );
          })}
        </div>
        {/* Посадочные страницы под типовые задачи */}
        <div className={s.label} style={{ marginTop: 54 }}>
          {SOLUTIONS_TITLE[language]}
        </div>

        <div className={s.lineNav} style={{ marginTop: 18 }}>
          {SOLUTION_LINKS.map((link) => (
            <a className={s.lineChip} href={link.href} key={link.href}>
              <EquipIcon name={link.icon} className={s.lineChipIcon} />

              <span>
                <b>{link.title[language]}</b>
              </span>
            </a>
          ))}
        </div>
      </section>

      {lineKeys.map((key) => {
        const line = c.lines[key];
        const models = MODELS.filter((model) => model.line === key);
        const columns = LINE_SPECS[key].table;

        /* Линейка может переопределить подписи: у жироуловителя
           «площадь зеркала», у нефтеуловителя «эффективная площадь». */
        const L = (field: keyof typeof c.specLabels) =>
          line.labels?.[field] ?? c.specLabels[field];

        return (
          <section className={s.section} key={key} id={key}>
            <EquipIcon name={LINE_ICON[key]} className={s.topIcon} />

            <h2>{line.name}</h2>

            <div className={s.prose}>
              <p>{line.tagline}</p>
            </div>

            <div className={s.modelGrid} style={{ marginTop: 34 }}>
              {models.map((model) => (
                <a
                  className={s.modelCard}
                  href={`/products/${model.slug}`}
                  key={model.slug}
                >
                  <EquipIcon name={LINE_ICON[key]} className={s.modelIcon} />

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

            <h2 style={{ marginTop: 70, fontSize: 26 }}>{line.tableTitle}</h2>

            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>{line.modelWord}</th>
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
                <span>{line.priceLabel}</span>
                <p>{line.priceText}</p>
              </div>

              <a className={s.ctaButton} href="/#contacts">
                {line.ctaButton}
              </a>
            </div>
          </section>
        );
      })}

      <section className={s.cta}>
        <div className={s.ctaInner}>
          <h2>{lines(c.lines["grease-traps"].ctaTitle)}</h2>

          <div>
            <p>{c.lines["grease-traps"].ctaText}</p>

            <a className={s.ctaButton} href="/#contacts">
              {c.lines["grease-traps"].ctaButton}
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
