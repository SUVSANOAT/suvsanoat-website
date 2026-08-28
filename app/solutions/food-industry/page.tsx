import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения для пищевого производства — молокозавод, мясопереработка",
  description: "Очистка стоков пищевых производств в Узбекистане: расчёт по ХПК и жирам, а не по кубометрам. Жироотделение, усреднение с коррекцией pH, флотация, биология до 500 м³/сут. Суточный отбор проб, схема для проектировщика. SUVSANOAT, Ташкент.",
  alternates: { canonical: "/solutions/food-industry" },
  openGraph: {
    title: "Очистные для пищевых производств | SUVSANOAT",
    description: "Очистка стоков пищевых производств в Узбекистане: расчёт по ХПК и жирам, а не по кубометрам. Жироотделение, усреднение с коррекцией pH, флотация, биология до 500 м³/сут. Суточный отбор проб, схема для проектировщика. SUVSANOAT, Ташкент.",
    url: "https://suvsanoat.uz/solutions/food-industry",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Очистные для пищевых производств | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные для пищевых производств | SUVSANOAT",
    description: "Очистка стоков пищевых производств в Узбекистане: расчёт по ХПК и жирам, а не по кубометрам. Жироотделение, усреднение с коррекцией pH, флотация, биология до 500 м³/сут. Суточный отбор проб, схема для проектировщика. SUVSANOAT, Ташкент.",
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
