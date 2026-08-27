import type { Language } from "../translations";

/**
 * Посадочная страница «под задачу клиента».
 *
 * Каждая страница отвечает на один поисковый запрос: «жироуловитель
 * для ресторана», «очистные для АЗС», «ЛОС для частного дома».
 * Подбор ведёт на конкретные модели из app/products/data.ts.
 */

export type SolutionPick = {
  /** slug модели из app/products/data.ts */
  slug: string;
  /** для какого случая эта модель */
  when: string;
};

export type SolutionSection = {
  title: string;
  text: string[];
};

export type SolutionFaq = {
  q: string;
  a: string;
};

export type SolutionContent = {
  label: string;
  title: string;
  intro: string;
  sections: SolutionSection[];
  pickTitle: string;
  pickText: string;
  picks: SolutionPick[];
  faqTitle: string;
  faq: SolutionFaq[];
  allTitle: string;
  allButton: string;
  /** куда ведёт кнопка «вся линейка» */
  allHref: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

export type SolutionContentSet = Record<Language, SolutionContent>;
