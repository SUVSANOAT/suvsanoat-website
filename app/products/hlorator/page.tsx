import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

export const metadata: Metadata = {
  title:
    "Хлораторы и электролизные установки гипохлорита натрия ЭЛХ-10…ЭЛХ-1000 | SUVSANOAT",
  description:
    "Электролизные хлораторы ЭЛХ: получение гипохлорита натрия на объекте из поваренной соли, от 10 до 1000 г активного хлора в час. Обеззараживание питьевой и технической воды, очищенных стоков, бассейнов. Производство в Ташкенте, подбор по расходу воды.",
  keywords: [
    "хлоратор",
    "хлораторная установка",
    "электролизная установка",
    "электролизная установка гипохлорита натрия",
    "генератор гипохлорита натрия",
    "установка получения гипохлорита натрия",
    "обеззараживание воды",
    "хлоратор Узбекистан",
    "хлоратор Ташкент",
    "ЭЛХ",
    "xlorator",
    "natriy gipoxlorit qurilmasi",
    "suvni zararsizlantirish",
    "sodium hypochlorite generator",
    "on-site hypochlorite generation",
  ],
  alternates: { canonical: "/products/hlorator" },
  openGraph: {
    title: "Электролизные хлораторы ЭЛХ — гипохлорит натрия на объекте | SUVSANOAT",
    description:
      "Ряд ЭЛХ-10…ЭЛХ-1000: раствор гипохлорита натрия из соли и воды прямо на объекте. Без хлор-газа и складов концентрата. Подбор по расходу воды и дозе активного хлора.",
    url: "https://suvsanoat.uz/products/hlorator",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Электролизные хлораторы ЭЛХ | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Электролизные хлораторы ЭЛХ — гипохлорит натрия на объекте | SUVSANOAT",
    description:
      "ЭЛХ-10…ЭЛХ-1000: получение гипохлорита натрия из поваренной соли на объекте. Обеззараживание питьевой и технической воды. Производство — Ташкент.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const models = MODELS.filter((m) => m.line === "chlorinators");

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

  /* Хлебные крошки: Главная → Ассортимент → Хлораторы ЭЛХ */
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
        name: "Хлораторы ЭЛХ",
        item: "https://suvsanoat.uz/products/hlorator",
      },
    ],
  };

  /* Модельный ряд линейки для поисковых систем */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Электролизные хлораторы ЭЛХ",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: model.code,
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

      <LinePage line="chlorinators" content={content} />
    </>
  );
}
