import type { Metadata } from "next";

import LinePage from "../LinePage";
import { MODELS } from "../data";
import content from "./content";

/**
 * Посадочная линейки НЕФ: «нефтеуловитель», «нефтеловушка»,
 * «сепаратор нефтепродуктов», «маслобензоотделитель», «очистка
 * ливневых стоков», «нефтеуловитель для автомойки / АЗС / паркинга».
 * Ряд НЕФ-1,5…НЕФ-50 и все числа — из app/products/data.ts.
 */

export const metadata: Metadata = {
  title:
    "Нефтеуловители НЕФ-1,5 — НЕФ-50 — купить в Ташкенте | SUVSANOAT",
  description:
    "Нефтеуловители (нефтеловушки, сепараторы нефтепродуктов) из стеклопластика: девять типоразмеров от 1,5 до 50 л/с — 5,4–180 м³/ч. Коалесцентно-ламельный модуль, работа самотёком, очистка ливневых стоков автомоек, АЗС и паркингов. Подбор по расчётному расходу, собственное производство в Ташкенте.",
  keywords: [
    "нефтеуловитель",
    "нефтеловушка",
    "сепаратор нефтепродуктов",
    "маслобензоотделитель",
    "нефтеуловитель купить Ташкент",
    "нефтеуловитель цена",
    "очистка ливневых стоков",
    "нефтеуловитель для автомойки",
    "нефтеуловитель для АЗС",
    "нефтеуловитель для паркинга",
    "коалесцентный сепаратор",
    "neft tutgich",
    "oil separator",
  ],
  alternates: { canonical: "/products/nefteulovitel" },
  openGraph: {
    title: "Нефтеуловители НЕФ-1,5 — НЕФ-50 | SUVSANOAT",
    description:
      "Нефтеуловители из стеклопластика от 1,5 до 50 л/с: коалесцентно-ламельный модуль, приёмно-шламовая камера, работа самотёком. Автомойки, АЗС, паркинги, ливневые стоки. Производство — Ташкент.",
    url: "https://suvsanoat.uz/products/nefteulovitel",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Нефтеуловители НЕФ-1,5 — НЕФ-50 | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Нефтеуловители НЕФ-1,5 — НЕФ-50 | SUVSANOAT",
    description:
      "Сепараторы нефтепродуктов из стеклопластика от 1,5 до 50 л/с для автомоек, АЗС, паркингов и ливневых выпусков. Подбор по расчётному расходу.",
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

  /* Хлебные крошки: Главная → Ассортимент → Нефтеуловители */
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
        name: "Нефтеуловители",
        item: "https://suvsanoat.uz/products/nefteulovitel",
      },
    ],
  };

  /* Типоразмерный ряд линейки — список моделей из ассортимента */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Нефтеуловители НЕФ",
    itemListElement: MODELS.filter((m) => m.line === "oil-separators").map(
      (m, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: m.code,
        url: `https://suvsanoat.uz/products/${m.slug}`,
      })
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

      <LinePage line="oil-separators" content={content} />
    </>
  );
}
