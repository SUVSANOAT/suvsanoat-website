"use client";

import Image from "next/image";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import EquipIcon from "../components/EquipIcon";
import { MODELS, TEXT, type LineKey } from "./data";
import s from "./products.module.css";

/** Иконка линейки */
const LINE_ICON: Record<LineKey, string> = {
  "grease-traps": "grit",
};

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
      </section>

      {lineKeys.map((key) => {
        const line = c.lines[key];
        const models = MODELS.filter((model) => model.line === key);

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
                    {num(model.q)} {language === "zh" ? "m³/h" : "м³/ч"}
                  </span>

                  <div className={s.modelMini}>
                    <span>
                      {model.length} × {model.width} × {model.height} мм
                    </span>
                    <span>
                      {c.specLabels.volumeWork}: {num(model.volumeWork)} м³
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
                    <th>{c.specLabels.q}</th>
                    <th>{c.specLabels.size}</th>
                    <th>{c.specLabels.volumeWork}</th>
                    <th>{c.specLabels.retention}</th>
                    <th>{c.specLabels.area}</th>
                    <th>{c.specLabels.dn}</th>
                    <th>{c.specLabels.mass}</th>
                  </tr>
                </thead>

                <tbody>
                  {models.map((model) => (
                    <tr key={model.slug}>
                      <td>
                        <a href={`/products/${model.slug}`}>{model.code}</a>
                      </td>
                      <td>{num(model.q)} м³/ч</td>
                      <td>
                        {model.length} × {model.width} × {model.height}
                      </td>
                      <td>{num(model.volumeWork)} м³</td>
                      <td>{model.retention} мин</td>
                      <td>{num(model.area)} м²</td>
                      <td>DN{model.dn}</td>
                      <td>{model.mass} кг</td>
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
