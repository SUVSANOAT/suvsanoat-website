import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

/**
 * Посадочная модельного ряда «Жироуловители ЖИР-1 … ЖИР-50».
 * Запросы: «жироуловитель», «жироуловитель купить», «жироуловитель цена»,
 * «жироотделитель», «жироуловитель для кафе / столовой / ресторана».
 */

export const metadata: Metadata = {
  title: "Жироуловители ЖИР-1…ЖИР-50 — купить в Ташкенте | SUVSANOAT",
  description:
    "Жироуловители для кафе, столовых, ресторанов и пищевых производств: расход от 1 до 50 м³/ч, корпус из стеклопластика собственной намотки, работа самотёком. Производство в Ташкенте, монтаж и пусконаладка. Подбор типоразмера по расходу кухни — пришлите данные объекта.",
  keywords: [
    "жироуловитель",
    "жироуловитель купить",
    "жироуловитель цена",
    "жироотделитель",
    "жироуловитель для кафе",
    "жироуловитель для столовой",
    "жироуловитель для ресторана",
    "промышленный жироуловитель",
    "жироуловитель Ташкент",
    "yog‘ tutgich",
    "grease trap",
  ],
  alternates: { canonical: "/products/zhiroulovitel" },
  openGraph: {
    title: "Жироуловители ЖИР-1…ЖИР-50 | SUVSANOAT",
    description:
      "Гравитационные жироуловители из стеклопластика: 1–50 м³/ч, для кафе, столовых, ресторанов и пищевых цехов. Производство в Ташкенте, подбор по расходу кухни.",
    url: "https://suvsanoat.uz/products/zhiroulovitel",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Жироуловители ЖИР-1…ЖИР-50 | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Жироуловители ЖИР-1…ЖИР-50 | SUVSANOAT",
    description:
      "Жироуловители из стеклопластика 1–50 м³/ч для кафе, столовых и пищевых производств. Производство в Ташкенте.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
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

  /* Хлебные крошки: главная — ассортимент — жироуловители */
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
        name: "Жироуловители",
        item: "https://suvsanoat.uz/products/zhiroulovitel",
      },
    ],
  };

  /* Типоразмерный ряд линейки — из единого источника данных */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Жироуловители ЖИР",
    itemListElement: MODELS.filter((model) => model.line === "grease-traps").map(
      (model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.code,
        url: `https://suvsanoat.uz/products/${model.slug}`,
      }),
    ),
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

      <LinePage line="grease-traps" content={content} />
    </>
  );
}
