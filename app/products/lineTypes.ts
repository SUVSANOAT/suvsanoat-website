import type { Language } from "../translations";

/**
 * Страница модельного ряда: «Жироуловители ЖИР-1…ЖИР-50».
 *
 * Средний уровень между категорией каталога и карточкой модели —
 * именно он отвечает на запросы «жироуловитель», «хлоратор»,
 * «песколовка купить». Таблица и карточки моделей берутся из
 * app/products/data.ts, здесь только текст под запрос.
 */

export type LineSection = {
  title: string;
  text: string[];
};

export type LineFaq = {
  q: string;
  a: string;
};

export type LineRelated = {
  title: string;
  links: { href: string; label: string }[];
};

export type LineContent = {
  label: string;
  /** H1, перенос строки — \n */
  title: string;
  intro: string;
  sections: LineSection[];
  faqTitle: string;
  faq: LineFaq[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  related?: LineRelated;
};

export type LineContentSet = Record<Language, LineContent>;
