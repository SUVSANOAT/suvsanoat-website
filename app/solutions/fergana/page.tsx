import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения в Фергане — производство, доставка, монтаж | SUVSANOAT",
  description:
    "Очистные сооружения в Фергане и Ферганской долине: производство корпусов из стеклопластика в Ташкенте, расчёт по КМК, доставка ≈320 км, монтаж и пусконаладка своими бригадами. ЛОС, жироуловители, нефтеуловители, песколовки, КНС.",
  keywords: [
    "очистные сооружения Фергана",
    "очистные сооружения Ферганская долина",
    "локальные очистные сооружения Фергана",
    "ЛОС Фергана",
    "нефтеуловитель Фергана",
    "жироуловитель Фергана",
    "песколовка Фергана",
    "КНС Фергана",
    "tozalash inshootlari Farg‘ona",
    "oqova suv tozalash Farg‘ona",
    "wastewater treatment Fergana",
  ],
  alternates: { canonical: "/solutions/fergana" },
  openGraph: {
    title: "Очистные сооружения в Фергане | SUVSANOAT",
    description:
      "Производство в Ташкенте, доставка в Фергану ≈320 км: ЛОС, жироуловители, нефтеуловители, песколовки, КНС из стеклопластика. Расчёт по КМК, монтаж, пусконаладка.",
    url: "https://suvsanoat.uz/solutions/fergana",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Фергане | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Фергане | SUVSANOAT",
    description:
      "ЛОС, жироуловители, нефтеуловители, песколовки и КНС для Ферганы и долины. Производство в Ташкенте, расчёт по КМК, монтаж и пусконаладка.",
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

  /* Производство в Ташкенте, зона обслуживания — Фергана и Узбекистан */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/solutions/fergana#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/fergana",
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
      { "@type": "City", name: "Fergana" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Очистные сооружения для Ферганы и Ферганской долины: ЛОС, жироуловители, нефтеуловители, песколовки, КНС из стеклопластика. Производство в Ташкенте, расчёт по КМК, доставка, монтаж и пусконаладка.",
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
