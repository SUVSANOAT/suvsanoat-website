import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title:
    "Очистные сооружения в Навои — промышленные стоки, производство, монтаж | SUVSANOAT",
  description:
    "Очистные сооружения в Навои: промышленные и промливневые стоки, вахтовые посёлки, столовые, мойки техники. Схема по анализу стока, корпуса из стеклопластика собственной намотки, расчёт по КМК, монтаж и пусконаладка своими бригадами.",
  keywords: [
    "очистные сооружения Навои",
    "промышленные очистные сооружения Навои",
    "очистка промышленных стоков Навои",
    "нефтеуловитель Навои",
    "песколовка Навои",
    "локальные очистные сооружения Навои",
    "ЛОС Навои",
    "КНС Навои",
    "tozalash inshootlari Navoiy",
    "sanoat oqava suvlarini tozalash Navoiy",
    "industrial wastewater treatment Navoi",
  ],
  alternates: { canonical: "/solutions/navoi" },
  openGraph: {
    title: "Очистные сооружения в Навои | SUVSANOAT",
    description:
      "Промышленные стоки Навоийской области: усреднение, коррекция pH, физико-химия, флотация, фильтрация. Корпуса из стеклопластика, расчёт по КМК, монтаж и пусконаладка.",
    url: "https://suvsanoat.uz/solutions/navoi",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Навои | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Навои | SUVSANOAT",
    description:
      "Промышленные и промливневые стоки, вахтовые посёлки, мойки техники. Схема по анализу стока, производство в Ташкенте, монтаж и пусконаладка.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  /* Разметка вопросов и ответов для поисковых систем — из русской версии */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.ru.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  /* Локальный бизнес: производство в Ташкенте, обслуживаемый регион — Навои */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/solutions/navoi#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/navoi",
    image: "https://suvsanoat.uz/og-image.jpg",
    telephone: "+998773043400",
    email: "suvsanoat@gmail.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Укчи, 3",
      addressLocality: "Ташкент",
      addressCountry: "UZ",
    },
    areaServed: [
      { "@type": "City", name: "Navoi" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Очистные сооружения для объектов Навои и Навоийской области: промышленные и промливневые стоки, ЛОС БИО, нефтеуловители, песколовки, усреднители, станции дозирования, КНС. Производство корпусов из стеклопластика в Ташкенте, расчёт по КМК, монтаж и пусконаладка.",
    sameAs: ["https://t.me/suvsanoat"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />

      <SolutionPage content={content} />
    </>
  );
}
