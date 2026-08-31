import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения в Намангане — производство, монтаж, запуск | SUVSANOAT",
  description:
    "Очистные сооружения в Намангане: ЛОС БИО для махаллей и жилых массивов, очистка стоков текстильного производства и крашения (усреднение, физико-химия, биология), жироуловители, нефтеуловители, КНС. Производство в Ташкенте, расчёт по КМК, монтаж и пусконаладка своими бригадами.",
  keywords: [
    "очистные сооружения Наманган",
    "очистные сооружения купить Наманган",
    "ЛОС Наманган",
    "локальные очистные сооружения Наманган",
    "очистка стоков текстильного производства",
    "очистка стоков крашения",
    "жироуловитель Наманган",
    "нефтеуловитель Наманган",
    "КНС Наманган",
    "tozalash inshootlari Namangan",
    "oqova suv tozalash Namangan",
    "wastewater treatment Namangan",
    "textile wastewater treatment Uzbekistan",
  ],
  alternates: { canonical: "/solutions/namangan" },
  openGraph: {
    title: "Очистные сооружения в Намангане | SUVSANOAT",
    description:
      "ЛОС, КНС, жироуловители, нефтеуловители, резервуары из стеклопластика. Стоки текстиля и крашения — схема после анализа. Производство в Ташкенте, монтаж и пусконаладка в Намангане.",
    url: "https://suvsanoat.uz/solutions/namangan",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Намангане | SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Намангане | SUVSANOAT",
    description:
      "ЛОС, КНС, жироуловители, нефтеуловители. Стоки крашения — усреднение, физико-химия, биология. Производство в Ташкенте, монтаж в Намангане.",
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

  /* Производство в Ташкенте, зона обслуживания — Наманган и Узбекистан */
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://suvsanoat.uz/solutions/namangan#localbusiness",
    name: "SUVSANOAT",
    url: "https://suvsanoat.uz/solutions/namangan",
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
      { "@type": "City", name: "Namangan" },
      { "@type": "Country", name: "Uzbekistan" },
    ],
    description:
      "Очистные сооружения для Намангана: ЛОС БИО, КНС, жироуловители, нефтеуловители, резервуары и усреднители из стеклопластика. Производство в Ташкенте, расчёт по КМК, доставка, монтаж и пусконаладка.",
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
