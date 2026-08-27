import type { Language } from "../translations";

/** Карточка оборудования / шаг процесса */
export type CategoryItem = {
  number: string;
  title: string;
  text: string;
};

/** Показатель в шапке страницы */
export type CategoryStat = {
  value: string;
  label: string;
};

/**
 * Содержимое страницы каталога на одном языке.
 * Перевод строки внутри заголовков задаётся символом \n.
 */
export type CategoryContent = {
  /** Последний элемент хлебных крошек, ЗАГЛАВНЫМИ */
  breadcrumb: string;
  /** Метка над заголовком, например "07 · АЭРАЦИОННОЕ ОБОРУДОВАНИЕ" */
  heroLabel: string;
  heroTitle: string;
  heroText: string;
  /** Первая кнопка в шапке, например "Смотреть оборудование" */
  heroButton: string;
  /** Ровно 4 показателя */
  stats: CategoryStat[];

  introLabel: string;
  introTitle: string;
  /** Ровно 2 абзаца */
  introText: string[];

  itemsLabel: string;
  itemsTitle: string;
  itemsText: string;
  items: CategoryItem[];
  /** Ссылка в карточке, например "Получить подбор" */
  itemsLink: string;

  processLabel: string;
  processTitle: string;
  processText: string;
  process: CategoryItem[];

  applicationsLabel: string;
  applicationsTitle: string;
  applicationsText: string;
  applications: string[];

  ctaLabel: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

export type CategoryContentSet = Record<Language, CategoryContent>;
