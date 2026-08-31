import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения в Ташкенте — производство, монтаж, запуск | SUVSANOAT",
  description:
    "Очистные сооружения в Ташкенте: собственное производство корпусов из стеклопластика, расчёт по КМК, монтаж и пусконаладка. ЛОС, КНС, жироуловители, нефтеуловители, резервуары. Расчёт и коммерческое предложение по данным объекта.",
  keywords: [
    "очистные сооружения Ташкент",
    "очистные сооружения купить Ташкент",
    "очистные сооружения цена",
    "локальные очистные сооружения Ташкент",
    "ЛОС Ташкент",
    "КНС Ташкент",
    "жироуловитель Ташкент",
    "нефтеуловитель Ташкент",
    "oqova suv tozalash Toshkent",
    "tozalash inshootlari Toshkent",
    "wastewater treatment Tashkent",
  ],
  alternates: { canonical: "/solutions/tashkent" },
  openGraph: {
    title: "Очистные сооружения в Ташкенте | SUVSANOAT",
    description:
      "Собственное производство в Ташкенте: ЛОС, КНС, жироуловители, нефтеуловители, резервуары из стеклопластика. Расчёт по КМК, монтаж, пусконаладка.",
    url: "https://suvsanoat.uz/solutions/tashkent",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Ташкенте | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Ташкенте | SUVSANOAT",
    description:
      "Собственное производство в Ташкенте: ЛОС, КНС, жироуловители, нефтеуловители, резервуары. Расчёт по КМК, монтаж, пусконаладка.",
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

  /* Локальный бизнес: производитель очистных сооружений в Ташкенте */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/tashkent",
    image: "https://suvsanoat.uz/og-image.jpg",
    telephone: "+998773043400",
    email: "suvsanoat@gmail.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ташкент",
      addressCountry: "UZ",
    },
    areaServed: [
      { "@type": "City", name: "Tashkent" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Производство очистных сооружений в Ташкенте: ЛОС, КНС, жироуловители, нефтеуловители, резервуары из стеклопластика. Проектирование, монтаж, пусконаладка.",
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
