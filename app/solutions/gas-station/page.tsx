import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Нефтеуловитель для АЗС, паркинга и СТО — расчёт по КМК | SUVSANOAT",
  description: "Очистка ливневых стоков площадки: песколовка плюс коалесцентный нефтеуловитель. Расчёт расхода по КМК 2.04.03-19, типоразмеры 1,5–20 л/с, честно про предел 5 мг/л и сорбционную доочистку. Производство в Ташкенте.",
  alternates: { canonical: "/solutions/gas-station" },
  openGraph: {
    title: "Нефтеуловитель для АЗС и паркинга | SUVSANOAT",
    description: "Очистка ливневых стоков площадки: песколовка плюс коалесцентный нефтеуловитель. Расчёт расхода по КМК 2.04.03-19, типоразмеры 1,5–20 л/с, честно про предел 5 мг/л и сорбционную доочистку. Производство в Ташкенте.",
    url: "https://suvsanoat.uz/solutions/gas-station",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Нефтеуловитель для АЗС и паркинга | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Нефтеуловитель для АЗС и паркинга | SUVSANOAT",
    description: "Очистка ливневых стоков площадки: песколовка плюс коалесцентный нефтеуловитель. Расчёт расхода по КМК 2.04.03-19, типоразмеры 1,5–20 л/с, честно про предел 5 мг/л и сорбционную доочистку. Производство в Ташкенте.",
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
