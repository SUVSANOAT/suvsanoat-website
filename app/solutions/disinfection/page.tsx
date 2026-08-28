import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Обеззараживание воды посёлка — электролизное хлорирование | SUVSANOAT",
  description: "Хлорирование питьевой воды скважины и водозабора: гипохлорит из соли на месте, станции ЭЛХ 10–1000 г/ч. Расчёт дозы, умягчитель в комплекте, требования к помещению, сравнение с привозным реагентом. Производство в Ташкенте.",
  alternates: { canonical: "/solutions/disinfection" },
  openGraph: {
    title: "Обеззараживание воды — электролиз | SUVSANOAT",
    description: "Хлорирование питьевой воды скважины и водозабора: гипохлорит из соли на месте, станции ЭЛХ 10–1000 г/ч. Расчёт дозы, умягчитель в комплекте, требования к помещению, сравнение с привозным реагентом. Производство в Ташкенте.",
    url: "https://suvsanoat.uz/solutions/disinfection",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Обеззараживание воды — электролиз | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Обеззараживание воды — электролиз | SUVSANOAT",
    description: "Хлорирование питьевой воды скважины и водозабора: гипохлорит из соли на месте, станции ЭЛХ 10–1000 г/ч. Расчёт дозы, умягчитель в комплекте, требования к помещению, сравнение с привозным реагентом. Производство в Ташкенте.",
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
