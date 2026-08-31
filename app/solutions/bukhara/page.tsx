import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения в Бухаре — производство, доставка, монтаж | SUVSANOAT",
  description:
    "Очистные сооружения в Бухаре: ЛОС для гостиниц и посёлков, жироуловители для ресторанов, нефтеуловители, резервуары. Корпуса из стеклопластика собственной намотки, расчёт на всплытие при высоких грунтовых водах, расчёт по КМК, доставка из Ташкента, монтаж и пусконаладка своими бригадами.",
  keywords: [
    "очистные сооружения Бухара",
    "очистные сооружения купить Бухара",
    "локальные очистные сооружения Бухара",
    "ЛОС Бухара",
    "септик Бухара",
    "жироуловитель Бухара",
    "нефтеуловитель Бухара",
    "очистные для гостиницы Бухара",
    "tozalash inshootlari Buxoro",
    "oqova suv tozalash Buxoro",
    "wastewater treatment Bukhara",
  ],
  alternates: { canonical: "/solutions/bukhara" },
  openGraph: {
    title: "Очистные сооружения в Бухаре | SUVSANOAT",
    description:
      "ЛОС, жироуловители, нефтеуловители, резервуары и обеззараживание для объектов Бухары. Стеклопластиковые корпуса собственного производства, расчёт по КМК, монтаж и пусконаладка.",
    url: "https://suvsanoat.uz/solutions/bukhara",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Бухаре | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Бухаре | SUVSANOAT",
    description:
      "ЛОС для гостиниц и посёлков, жироуловители, нефтеуловители, резервуары. Расчёт по КМК, доставка в Бухару, монтаж и пусконаладка.",
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

  /* Производство в Ташкенте, зона обслуживания — Бухара и Узбекистан */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/solutions/bukhara#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/bukhara",
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
      { "@type": "City", name: "Bukhara" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Очистные сооружения для объектов Бухары и Бухарской области: ЛОС, жироуловители, нефтеуловители, резервуары и установки обеззараживания. Производство корпусов из стеклопластика в Ташкенте, расчёт по КМК, доставка, монтаж и пусконаладка.",
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
