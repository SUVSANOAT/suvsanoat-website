import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

/**
 * /products/los-bio — линейка ЛОС БИО.
 * Самый конкурентный кластер: «локальные очистные сооружения», «ЛОС»,
 * «станция биологической очистки», «очистные для дома / посёлка /
 * гостиницы». Диапазон в тексте — из data.ts: БИО-1…БИО-500,
 * 1–500 м³/сут, 5–2500 эквивалентных жителей.
 */

export const metadata: Metadata = {
  title:
    "Локальные очистные сооружения ЛОС БИО 1–500 м³/сут — производство в Ташкенте | SUVSANOAT",
  description:
    "Локальные очистные сооружения (ЛОС) — станции биологической очистки хозяйственно-бытовых стоков для дома, посёлка, гостиницы и базы отдыха. Ряд БИО-1…БИО-500: от 1 до 500 м³/сут, от 5 до 2500 эквивалентных жителей. Корпуса из стеклопластика собственной намотки, расчёт по КМК, производство в Ташкенте.",
  keywords: [
    "локальные очистные сооружения",
    "ЛОС",
    "ЛОС БИО",
    "станция биологической очистки",
    "биологическая очистка сточных вод",
    "очистные сооружения для дома",
    "очистные сооружения для посёлка",
    "очистные сооружения для гостиницы",
    "локальные очистные сооружения Ташкент",
    "lokal tozalash inshootlari",
    "package wastewater treatment plant",
  ],
  alternates: { canonical: "/products/los-bio" },
  openGraph: {
    title: "Локальные очистные сооружения ЛОС БИО | SUVSANOAT",
    description:
      "Станции биологической очистки БИО-1…БИО-500: 1–500 м³/сут, 5–2500 эквивалентных жителей. Стеклопластиковые корпуса собственной намотки, расчёт по КМК, производство в Ташкенте.",
    url: "https://suvsanoat.uz/products/los-bio",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Локальные очистные сооружения ЛОС БИО | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Локальные очистные сооружения ЛОС БИО | SUVSANOAT",
    description:
      "Станции биологической очистки БИО-1…БИО-500: 1–500 м³/сут, 5–2500 жителей. Производство в Ташкенте.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const models = MODELS.filter((model) => model.line === "bio-plants");

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

  /* Хлебные крошки: главная → ассортимент → линейка */
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
        name: "Локальные очистные сооружения",
        item: "https://suvsanoat.uz/products/los-bio",
      },
    ],
  };

  /* Типоразмерный ряд линейки */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Локальные очистные сооружения ЛОС БИО",
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${model.code} — ${model.qd} м³/сут, ${model.pe} жителей`,
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

      <LinePage line="bio-plants" content={content} />
    </>
  );
}
