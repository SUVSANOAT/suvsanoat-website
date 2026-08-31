import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

/**
 * Посадочная модельного ряда песколовок ПЕС-1,5 … ПЕС-50 под запросы
 * «песколовка», «пескоотделитель», «песколовка купить»,
 * «песколовка для автомойки», «песколовка ливневая», «qum tutgich».
 */

export const metadata: Metadata = {
  title: "Песколовки ПЕС-1,5 … ПЕС-50 — купить в Ташкенте | SUVSANOAT",
  description:
    "Песколовки из стеклопластика ПЕС-1,5 … ПЕС-50: расход от 1,5 до 50 л/с (5,4–180 м³/ч), шламовая зона 0,45–15 м³, патрубки DN110–DN500. Первая ступень перед нефтеуловителем, для автомоек, АЗС, паркингов и ливневой канализации. Производство в Ташкенте, расчёт по КМК.",
  keywords: [
    "песколовка",
    "пескоотделитель",
    "песколовка купить",
    "песколовка цена",
    "песколовка для автомойки",
    "песколовка ливневая",
    "песколовка стеклопластиковая",
    "песколовка Ташкент",
    "песколовка перед нефтеуловителем",
    "qum tutgich",
    "sand trap",
  ],
  alternates: { canonical: "/products/peskolovka" },
  openGraph: {
    title: "Песколовки ПЕС-1,5 … ПЕС-50 | SUVSANOAT",
    description:
      "Стеклопластиковые песколовки на расход от 1,5 до 50 л/с: первая ступень механической очистки для автомоек, АЗС, паркингов и ливневой канализации. Производство в Ташкенте.",
    url: "https://suvsanoat.uz/products/peskolovka",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Песколовки ПЕС-1,5 … ПЕС-50 | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Песколовки ПЕС-1,5 … ПЕС-50 | SUVSANOAT",
    description:
      "Стеклопластиковые песколовки на расход от 1,5 до 50 л/с. Первая ступень перед нефтеуловителем. Производство в Ташкенте, расчёт по КМК.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const models = MODELS.filter((model) => model.line === "sand-traps");

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

  /* Хлебные крошки: Главная → Ассортимент → Песколовки */
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
        name: "Песколовки",
        item: "https://suvsanoat.uz/products/peskolovka",
      },
    ],
  };

  /* Типоразмерный ряд: список моделей линейки из ассортимента */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Песколовки ПЕС",
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `Песколовка ${model.code}`,
        url: `https://suvsanoat.uz/products/${model.slug}`,
        sku: model.code,
        material: "Стеклопластик",
        brand: { "@type": "Brand", name: "SUVSANOAT" },
        weight: {
          "@type": "QuantitativeValue",
          value: model.mass,
          unitCode: "KGM",
        },
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Номинальный расход",
            value: model.ns,
            unitText: "л/с",
          },
          {
            "@type": "PropertyValue",
            name: "Расход",
            value: model.q,
            unitText: "м³/ч",
          },
          {
            "@type": "PropertyValue",
            name: "Объём шламовой зоны",
            value: model.sludge,
            unitText: "м³",
          },
          {
            "@type": "PropertyValue",
            name: "Условный проход",
            value: model.dn,
            unitText: "DN",
          },
        ],
      },
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

      <LinePage line="sand-traps" content={content} />
    </>
  );
}
