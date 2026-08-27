import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "ЛОС для частного дома в Узбекистане — чем лучше септика | SUVSANOAT",
  description: "Автономная канализация дома: разница между ямой, септиком и ЛОС с цифрами. Биологическая очистка 1–25 м³/сут, откачка раз в квартал, подбор по числу проживающих. Производство корпусов в Ташкенте.",
  alternates: { canonical: "/solutions/private-house" },
  openGraph: {
    title: "ЛОС для частного дома | SUVSANOAT",
    description: "Автономная канализация дома: разница между ямой, септиком и ЛОС с цифрами. Биологическая очистка 1–25 м³/сут, откачка раз в квартал, подбор по числу проживающих. Производство корпусов в Ташкенте.",
    url: "https://suvsanoat.uz/solutions/private-house",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "ЛОС для частного дома | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ЛОС для частного дома | SUVSANOAT",
    description: "Автономная канализация дома: разница между ямой, септиком и ЛОС с цифрами. Биологическая очистка 1–25 м³/сут, откачка раз в квартал, подбор по числу проживающих. Производство корпусов в Ташкенте.",
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
