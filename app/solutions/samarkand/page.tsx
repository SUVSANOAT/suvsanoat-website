import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения в Самарканде — производство, доставка, монтаж | SUVSANOAT",
  description:
    "Очистные сооружения в Самарканде: производство корпусов из стеклопластика в Ташкенте, доставка ≈300 км, монтаж и пусконаладка своими бригадами. ЛОС для гостиниц и гостевых домов, жироуловители для ресторанов и чайхан, нефтеуловители, резервуары. Расчёт по КМК по данным объекта.",
  keywords: [
    "очистные сооружения Самарканд",
    "очистные сооружения купить Самарканд",
    "локальные очистные сооружения Самарканд",
    "ЛОС Самарканд",
    "жироуловитель Самарканд",
    "нефтеуловитель Самарканд",
    "очистные для гостиницы Самарканд",
    "септик для гостевого дома Самарканд",
    "tozalash inshootlari Samarqand",
    "oqova suv tozalash Samarqand",
    "wastewater treatment Samarkand",
  ],
  alternates: { canonical: "/solutions/samarkand" },
  openGraph: {
    title: "Очистные сооружения в Самарканде | SUVSANOAT",
    description:
      "Производство в Ташкенте, доставка в Самарканд ≈300 км: ЛОС, жироуловители, нефтеуловители, резервуары из стеклопластика. Расчёт по КМК, монтаж, пусконаладка.",
    url: "https://suvsanoat.uz/solutions/samarkand",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Самарканде | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Самарканде | SUVSANOAT",
    description:
      "Производство в Ташкенте, доставка в Самарканд: ЛОС, жироуловители, нефтеуловители, резервуары. Расчёт по КМК, монтаж, пусконаладка.",
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

  /* Локальный бизнес: производство в Ташкенте, обслуживаемый регион — Самарканд */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/solutions/samarkand#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/samarkand",
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
      { "@type": "City", name: "Samarkand" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Очистные сооружения для Самарканда: производство корпусов из стеклопластика в Ташкенте, расчёт по КМК, доставка, монтаж и пусконаладка. ЛОС, жироуловители, нефтеуловители, резервуары.",
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
