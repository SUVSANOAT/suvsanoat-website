"use client";

import Image from "next/image";

import { useLanguage } from "../../LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import EquipIcon from "../../components/EquipIcon";
import {
  MODELS,
  TEXT,
  LINE_ICON,
  LINE_SPECS,
  specValue,
  type Model,
  type SpecKey,
} from "../data";
import ModelDrawing, { DRAW_TITLE, DRAW_NOTE } from "./ModelDrawing";
import s from "../products.module.css";

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

export default function ModelClient({ model }: { model: Model }) {
  const { t, language } = useLanguage();
  const c = TEXT[language];
  const line = c.lines[model.line];
  const num = useNum(language);

  const siblings = MODELS.filter(
    (item) => item.line === model.line && item.slug !== model.slug
  );

  const icon = LINE_ICON[model.line];

  /* Часть подписей у линеек разная: у жироуловителя «площадь зеркала»,
     у нефтеуловителя «эффективная площадь сепарации». Линейка может
     переопределить любую подпись через line.labels. */
  const L = (key: keyof typeof c.specLabels) =>
    line.labels?.[key] ?? c.specLabels[key];

  /* Значения, которые задаются линейкой, а не числом в модели */
  const fromLine: Partial<Record<SpecKey, string>> = {
    material: line.materialValue,
    vent: line.ventValue,
    power: line.powerValue,
    install: line.installValue,
  };

  const specs = LINE_SPECS[model.line].spec
    .map((key) => ({
      label: L(key),
      value: fromLine[key] ?? specValue(model, key, num, language),
    }))
    .filter((row): row is { label: string; value: string } => Boolean(row.value));

  /* Главный размерный признак — первая колонка сводной таблицы линейки */
  const headline =
    specValue(model, LINE_SPECS[model.line].table[0], num, language) ?? "";

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

      {/* ЗАГОЛОВОК */}
      <section className={s.top}>
        <div className={s.crumbs}>
          <a href="/">{t.category.home}</a>
          <span>/</span>
          <a href="/products">{c.label}</a>
          <span>/</span>
          <a href={`/products#${model.line}`}>{line.name}</a>
          <span>/</span>
          <b>{model.code}</b>
        </div>

        <EquipIcon name={icon} className={s.topIcon} />

        <div className={s.label}>
          {line.modelWord} · {headline}
        </div>

        <h1>{model.code}</h1>

        <p className={s.tagline}>{line.tagline}</p>
      </section>

      {/* ЧЕРТЁЖ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <h2>{DRAW_TITLE[language]}</h2>

        <div className={s.figure}>
          <ModelDrawing model={model} language={language} />
        </div>

        <p className={s.figureNote}>{DRAW_NOTE[language]}</p>
      </section>

      {/* ХАРАКТЕРИСТИКИ */}
      <section className={s.section}>
        <h2>{line.specsTitle}</h2>

        <div className={s.specs}>
          {specs.map((spec) => (
            <div className={s.specRow} key={spec.label}>
              <span>{spec.label}</span>
              <b>{spec.value}</b>
            </div>
          ))}
        </div>

        <div className={s.priceBox} style={{ marginTop: 40 }}>
          <div>
            <span>{line.priceLabel}</span>
            <p>{line.priceText}</p>
          </div>

          <a className={s.ctaButton} href="/#contacts">
            {line.ctaButton}
          </a>
        </div>
      </section>

      {/* ОПИСАНИЕ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <h2>{line.name}</h2>

        <div className={s.prose}>
          {line.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* КОМПЛЕКТАЦИЯ */}
      <section className={s.section}>
        <div className={s.twoCols}>
          <div>
            <div className={s.colTitle}>{line.includesTitle}</div>
            <ul className={s.list}>
              {line.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className={`${s.colTitle} ${s.colTitleMuted}`}>
              {line.notIncludedTitle}
            </div>
            <ul className={`${s.list} ${s.listMuted}`}>
              {line.notIncluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ПРИМЕНЕНИЕ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <h2>{line.useTitle}</h2>

        <div className={s.useGrid}>
          {line.forWhom.map((item) => (
            <div className={s.useCard} key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className={s.prose} style={{ marginTop: 34 }}>
          <p>{line.howToChoose}</p>
        </div>
      </section>

      {/* ОГРАНИЧЕНИЯ */}
      <section className={s.section}>
        <h2>{line.limitsTitle}</h2>

        <div className={s.limits}>
          {line.limits.map((item) => (
            <div className={s.limitCard} key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ДРУГИЕ МОДЕЛИ */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <h2>{line.allModels}</h2>

        <div className={s.modelGrid}>
          {siblings.map((item) => (
            <a
              className={s.modelCard}
              href={`/products/${item.slug}`}
              key={item.slug}
            >
              <EquipIcon name={icon} className={s.modelIcon} />

              <b className={s.modelCode}>{item.code}</b>

              <span className={s.modelQ}>
                {specValue(item, LINE_SPECS[item.line].table[0], num, language)}
              </span>

              <div className={s.modelMini}>
                <span>{specValue(item, "size", num, language)}</span>
                <span>
                  {L("volumeGross")}: {num(item.volumeGross)} м³
                </span>
                <span>DN{item.dn}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ЗАЯВКА */}
      <section className={s.cta}>
        <div className={s.ctaInner}>
          <h2>{lines(line.ctaTitle)}</h2>

          <div>
            <p>{line.ctaText}</p>

            <a className={s.ctaButton} href="/#contacts">
              {line.ctaButton}
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
