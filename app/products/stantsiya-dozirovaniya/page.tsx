import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

/**
 * Страница модельного ряда «Станции дозирования реагентов ДОЗ».
 *
 * Метаданные и разметка собираются на сервере и выдаются на русском —
 * языкового контекста здесь нет. Модели берутся из app/products/data.ts:
 * добавили типоразмер в файл — он появился и в разметке ItemList.
 */

export const metadata: Metadata = {
  title:
    "Станции дозирования реагентов ДОЗ-100…ДОЗ-10000 — производство в Ташкенте | SUVSANOAT",
  description:
    "Станции дозирования реагентов ДОЗ: расходный бак с мешалкой от 100 до 10 000 л, два насоса-дозатора (рабочий и резервный), обвязка и шкаф управления на одной раме. Дозирование коагулянта, флокулянта, гипохлорита, кислоты и щёлочи — постоянно, по расходомеру или по сигналу pH-метра. Собственное производство в Ташкенте, подбор под ваш реагент.",
  keywords: [
    "станция дозирования",
    "станция дозирования реагентов",
    "узел дозирования коагулянта",
    "дозирующая установка",
    "дозирование флокулянта",
    "реагентное хозяйство",
    "станция дозирования купить Ташкент",
    "насос-дозатор станция",
    "дозирование гипохлорита",
    "коррекция pH дозирование",
    "dozalash stansiyasi",
    "reagent dozalash stansiyasi",
    "chemical dosing station",
    "coagulant dosing unit",
  ],
  alternates: { canonical: "/products/stantsiya-dozirovaniya" },
  openGraph: {
    title: "Станции дозирования реагентов ДОЗ — производство в Ташкенте | SUVSANOAT",
    description:
      "Расходный бак с мешалкой 100–10 000 л, два насоса-дозатора, обвязка и шкаф на одной раме. Коагулянт, флокулянт, гипохлорит, коррекция pH. Подбор под ваш реагент.",
    url: "https://suvsanoat.uz/products/stantsiya-dozirovaniya",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Станции дозирования реагентов ДОЗ | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Станции дозирования реагентов ДОЗ | SUVSANOAT",
    description:
      "Восемь типоразмеров по объёму бака — от 100 до 10 000 л. Два насоса-дозатора, мешалка, обвязка и шкаф управления. Производство в Ташкенте.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const models = MODELS.filter((model) => model.line === "dosing");

  /* Вопросы и ответы для поисковых систем — из русской версии */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.ru.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  /* Хлебные крошки: Главная → Ассортимент → Станции дозирования */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: "https://suvsanoat.uz/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ассортимент",
        item: "https://suvsanoat.uz/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Станции дозирования",
        item: "https://suvsanoat.uz/products/stantsiya-dozirovaniya",
      },
    ],
  };

  /* Типоразмерный ряд: список моделей линейки со ссылками на карточки */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Станции дозирования реагентов ДОЗ",
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Станция дозирования реагентов ${model.code}`,
      url: `https://suvsanoat.uz/products/${model.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <LinePage line="dosing" content={content} />
    </>
  );
}
