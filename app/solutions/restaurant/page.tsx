import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Жироуловитель для ресторана и кафе — подбор и производство в Ташкенте",
  description: "Какой жироуловитель нужен коммерческой кухне: подбор по оборудованию, а не по посадочным местам. Модели 1–12 м³/ч из стеклопластика, время пребывания от 79 минут, честно про норматив 1,0 мг/л. Производство SUVSANOAT, Ташкент.",
  alternates: { canonical: "/solutions/restaurant" },
  openGraph: {
    title: "Жироуловитель для ресторана и кафе | SUVSANOAT",
    description: "Какой жироуловитель нужен коммерческой кухне: подбор по оборудованию, а не по посадочным местам. Модели 1–12 м³/ч из стеклопластика, время пребывания от 79 минут, честно про норматив 1,0 мг/л. Производство SUVSANOAT, Ташкент.",
    url: "https://suvsanoat.uz/solutions/restaurant",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Жироуловитель для ресторана и кафе | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Жироуловитель для ресторана и кафе | SUVSANOAT",
    description: "Какой жироуловитель нужен коммерческой кухне: подбор по оборудованию, а не по посадочным местам. Модели 1–12 м³/ч из стеклопластика, время пребывания от 79 минут, честно про норматив 1,0 мг/л. Производство SUVSANOAT, Ташкент.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <SolutionPage content={content} />
    </>
  );
}
